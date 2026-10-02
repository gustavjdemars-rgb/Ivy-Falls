param([string]$Url = 'http://localhost:8417/', [string]$Out, [string]$Shots = 'full', [switch]$Reduce, [int[]]$Widths = @(360, 768, 1280, 1920), [string]$Prefix = 'view', [int]$Wait = 1800, [string]$Eval = '')
# Usage: powershell -File tools/shoot.ps1 -Out review/<round> [-Shots ".cover__title,.lede"] [-Widths 360,1280] [-Wait 6000] [-Eval "<js>"] [-Reduce]
# Needs the preview server running (tools/serve.ps1) and Google Chrome installed.
# Screenshots via headless Chrome + DevTools protocol.
# $Shots: 'full' = full-page per width; otherwise a comma list of CSS selectors to scroll to (viewport shots).
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force $Out | Out-Null
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$prof = Join-Path $env:TEMP 'ivyfalls-chrome'
$p = Start-Process $chrome -ArgumentList '--headless=new','--remote-debugging-port=9333',"--user-data-dir=$prof",'--hide-scrollbars','--no-first-run','about:blank' -PassThru
try {
  $ws = $null
  for ($i = 0; $i -lt 40 -and -not $ws; $i++) {
    Start-Sleep -Milliseconds 250
    try { $ws = ((Invoke-RestMethod http://localhost:9333/json) | Where-Object type -eq 'page' | Select-Object -First 1).webSocketDebuggerUrl } catch {}
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
  function Save($name, $res) { [IO.File]::WriteAllBytes((Join-Path $Out $name), [Convert]::FromBase64String($res.data)); Write-Output "saved $name" }

  $heights = @{ 360 = 780; 768 = 1024; 1280 = 800; 1920 = 1080 }
  if ($Reduce) { Cdp 'Emulation.setEmulatedMedia' @{ features = @(@{ name = 'prefers-reduced-motion'; value = 'reduce' }) } | Out-Null }
  foreach ($w in $Widths) {
    $h = $heights[$w]
    Cdp 'Emulation.setDeviceMetricsOverride' @{ width = $w; height = $h; deviceScaleFactor = 1; mobile = ($w -lt 800) } | Out-Null
    Cdp 'Page.navigate' @{ url = $Url } | Out-Null
    Start-Sleep -Milliseconds $Wait
    if ($Shots -eq 'full') {
      $m = Cdp 'Page.getLayoutMetrics'
      $ch = [Math]::Ceiling($m.cssContentSize.height)
      Save "full-$w.png" (Cdp 'Page.captureScreenshot' @{ format = 'png'; captureBeyondViewport = $true; clip = @{ x = 0; y = 0; width = $w; height = $ch; scale = 1 } })
    } else {
      $n = 0
      foreach ($sel in $Shots.Split(',')) {
        $n++
        Cdp 'Runtime.evaluate' @{ expression = "(() => { const e = document.querySelector('$sel'); if (e) window.scrollTo(0, e.getBoundingClientRect().top + scrollY - innerHeight * 0.55); })()" } | Out-Null
        if ($Eval) { Cdp 'Runtime.evaluate' @{ expression = $Eval } | Out-Null }
        Start-Sleep -Milliseconds 900
        Save "$Prefix-$w-$n.png" (Cdp 'Page.captureScreenshot' @{ format = 'png' })
      }
    }
  }
} finally {
  Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
  Get-Process chrome -ErrorAction SilentlyContinue | Where-Object { $_.Path -eq $chrome -and $_.StartTime -ge $p.StartTime } | Stop-Process -Force -ErrorAction SilentlyContinue
}
