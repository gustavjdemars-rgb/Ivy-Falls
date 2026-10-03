param([string]$Url = 'http://localhost:8417/?debug', [int]$Width = 1280, [int]$Height = 800, [int]$Wait = 20000,
  [string]$Expr = 'JSON.stringify(window.__qdebug)', [string]$Shot = '')
# Usage: powershell -Command "& tools/probe.ps1 [-Width 360 -Height 780] [-Wait 20000] [-Expr '<js>'] [-Shot review/x.png]"
# Loads the page in headless Chrome, lets it run for -Wait ms, prints the value of -Expr
# (by default the question-mark debug totals from ?debug), and optionally saves a screenshot.
# Needs the preview server running (tools/serve.ps1) and Google Chrome installed.
$ErrorActionPreference = 'Stop'
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$prof = Join-Path $env:TEMP 'ivyfalls-chrome-probe'
$p = Start-Process $chrome -ArgumentList '--headless=new','--remote-debugging-port=9334',"--user-data-dir=$prof",'--hide-scrollbars','--no-first-run','about:blank' -PassThru
try {
  $ws = $null
  for ($i = 0; $i -lt 40 -and -not $ws; $i++) {
    Start-Sleep -Milliseconds 250
    try { $ws = ((Invoke-RestMethod http://localhost:9334/json) | Where-Object type -eq 'page' | Select-Object -First 1).webSocketDebuggerUrl } catch {}
  }
  $sock = [System.Net.WebSockets.ClientWebSocket]::new()
  $sock.ConnectAsync([Uri]$ws, [Threading.CancellationToken]::None).Wait()
  $script:id = 0
  function Cdp($method, $params = @{}) {
    $script:id++
    $msg = @{ id = $script:id; method = $method; params = $params } | ConvertTo-Json -Depth 10 -Compress
    $b = [Text.Encoding]::UTF8.GetBytes($msg)
    $sock.SendAsync([ArraySegment[byte]]::new($b), 'Text', $true, [Threading.CancellationToken]::None).Wait()
    while ($true) {
      $ms = [IO.MemoryStream]::new(); $buf = [byte[]]::new(1MB)
      do { $r = $sock.ReceiveAsync([ArraySegment[byte]]::new($buf), [Threading.CancellationToken]::None).Result; $ms.Write($buf, 0, $r.Count) } until ($r.EndOfMessage)
      $o = [Text.Encoding]::UTF8.GetString($ms.ToArray()) | ConvertFrom-Json
      if ($o.id -eq $script:id) { if ($o.error) { throw $o.error.message }; return $o.result }
    }
  }
  Cdp 'Emulation.setDeviceMetricsOverride' @{ width = $Width; height = $Height; deviceScaleFactor = 1; mobile = ($Width -lt 800) } | Out-Null
  Cdp 'Page.navigate' @{ url = $Url } | Out-Null
  Start-Sleep -Milliseconds $Wait
  $res = Cdp 'Runtime.evaluate' @{ expression = $Expr; returnByValue = $true }
  if ($res.exceptionDetails) { Write-Output "error: $($res.exceptionDetails.text)" } else { Write-Output $res.result.value }
  if ($Shot) {
    New-Item -ItemType Directory -Force (Split-Path $Shot) | Out-Null
    $img = Cdp 'Page.captureScreenshot' @{ format = 'png' }
    [IO.File]::WriteAllBytes($Shot, [Convert]::FromBase64String($img.data))
    Write-Output "saved $Shot"
  }
} finally {
  Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
  Get-Process chrome -ErrorAction SilentlyContinue | Where-Object { $_.Path -eq $chrome -and $_.StartTime -ge $p.StartTime } | Stop-Process -Force -ErrorAction SilentlyContinue
}
