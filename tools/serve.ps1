param([string]$Root, [int]$Port = 8417)
# Usage: powershell -File tools/serve.ps1 -Root . [-Port 8417]
# Minimal static file server for local preview (no Python on this machine).
# Answers byte-range requests, which browsers use to stream video.
$types = @{ '.html'='text/html; charset=utf-8'; '.css'='text/css'; '.js'='text/javascript'; '.json'='application/json';
  '.geojson'='application/geo+json'; '.woff2'='font/woff2'; '.svg'='image/svg+xml'; '.png'='image/png';
  '.jpg'='image/jpeg'; '.webp'='image/webp'; '.mp4'='video/mp4'; '.md'='text/plain; charset=utf-8' }
$l = [System.Net.HttpListener]::new()
$l.Prefixes.Add("http://localhost:$Port/")
$l.IgnoreWriteExceptions = $true
$l.Start()
Write-Output "serving $Root on http://localhost:$Port/"
while ($l.IsListening) {
  $ctx = $l.GetContext()
  try {
    $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
    if ($path -eq '' -or $path.EndsWith('/')) { $path += 'index.html' }
    $file = Join-Path $Root $path
    if (Test-Path $file -PathType Leaf) {
      $ext = [IO.Path]::GetExtension($file).ToLower()
      $ctx.Response.ContentType = if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' }
      $ctx.Response.AddHeader('Accept-Ranges', 'bytes')
      $fs = [IO.File]::OpenRead($file)
      try {
        $len = $fs.Length; $start = 0; $end = $len - 1
        $range = $ctx.Request.Headers['Range']
        if ($range -match '^bytes=(\d*)-(\d*)$') {
          if ($Matches[1]) { $start = [long]$Matches[1]; if ($Matches[2]) { $end = [Math]::Min([long]$Matches[2], $len - 1) } }
          elseif ($Matches[2]) { $start = [Math]::Max(0, $len - [long]$Matches[2]) }
          # Hand out large files in modest pieces so one video can't hold up the page.
          $end = [Math]::Min($end, $start + 4MB - 1)
          $ctx.Response.StatusCode = 206
          $ctx.Response.AddHeader('Content-Range', "bytes $start-$end/$len")
        }
        $count = $end - $start + 1
        $ctx.Response.ContentLength64 = $count
        $fs.Position = $start
        $buf = [byte[]]::new(256KB)
        while ($count -gt 0) {
          $r = $fs.Read($buf, 0, [Math]::Min($buf.Length, $count))
          if ($r -le 0) { break }
          $ctx.Response.OutputStream.Write($buf, 0, $r)
          $count -= $r
        }
      } finally { $fs.Dispose() }
    } else { $ctx.Response.StatusCode = 404 }
  } catch {} finally { try { $ctx.Response.Close() } catch {} }
}
