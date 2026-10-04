# PhishGuard Universal Web Server (Localhost, LAN, & Tunnel Compatible)
param(
    [int]$Port = 5000
)

$Listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)

try {
    $Listener.Start()
} catch {
    Write-Error "Failed to bind to port $Port. The port may already be in use."
    exit 1
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  PhishGuard Web Server Online!" -ForegroundColor Green
Write-Host "  Local URL:   http://localhost:$Port/" -ForegroundColor Yellow
Write-Host "  Press Ctrl+C to stop the server." -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

$Root = $PSScriptRoot

$MimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".md"   = "text/markdown; charset=utf-8"
}

try {
    while ($true) {
        $Client = $Listener.AcceptTcpClient()
        $Stream = $Client.GetStream()
        $Reader = [System.IO.StreamReader]::new($Stream)
        $Line = $Reader.ReadLine()
        if ([string]::IsNullOrEmpty($Line)) {
            $Client.Close()
            continue
        }

        # Parse request line, e.g. GET /index.html HTTP/1.1
        $Parts = $Line.Split(" ")
        $Path = if ($Parts.Length -ge 2) { $Parts[1] } else { "/" }
        if ($Path -eq "/" -or [string]::IsNullOrWhiteSpace($Path)) {
            $Path = "/index.html"
        }
        $Path = $Path.Split("?")[0] # strip query string
        $Decoded = [System.Uri]::UnescapeDataString($Path.TrimStart("/")).Replace("/", "\")
        $LocalFile = Join-Path $Root $Decoded

        if (Test-Path $LocalFile -PathType Leaf) {
            $Ext = [System.IO.Path]::GetExtension($LocalFile).ToLower()
            $ContentType = if ($MimeTypes.ContainsKey($Ext)) { $MimeTypes[$Ext] } else { "application/octet-stream" }
            $Bytes = [System.IO.File]::ReadAllBytes($LocalFile)
            $Header = "HTTP/1.1 200 OK`r`nContent-Type: $ContentType`r`nContent-Length: $($Bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
            $HeaderBytes = [System.Text.Encoding]::ASCII.GetBytes($Header)
            $Stream.Write($HeaderBytes, 0, $HeaderBytes.Length)
            $Stream.Write($Bytes, 0, $Bytes.Length)
        } else {
            $NotFound = "<html><body style='font-family:sans-serif;text-align:center;padding:50px;'><h2>404 - File Not Found</h2><p><a href='/'>Go to PhishGuard Home</a></p></body></html>"
            $NfBytes = [System.Text.Encoding]::UTF8.GetBytes($NotFound)
            $Header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/html; charset=utf-8`r`nContent-Length: $($NfBytes.Length)`r`nConnection: close`r`n`r`n"
            $HeaderBytes = [System.Text.Encoding]::ASCII.GetBytes($Header)
            $Stream.Write($HeaderBytes, 0, $HeaderBytes.Length)
            $Stream.Write($NfBytes, 0, $NfBytes.Length)
        }
        $Stream.Flush()
        $Client.Close()
    }
} finally {
    $Listener.Stop()
}
