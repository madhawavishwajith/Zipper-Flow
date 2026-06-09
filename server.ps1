# ZipperFlow Local Development Server
$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try {
    $listener.Start()
    Write-Host "--------------------------------------------------------" -ForegroundColor Green
    Write-Host "ZipperFlow Development Server started successfully!" -ForegroundColor Green
    Write-Host "Local URL: http://localhost:$port/" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C in this terminal to stop the server." -ForegroundColor Yellow
    Write-Host "--------------------------------------------------------" -ForegroundColor Green

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $rawPath = $request.Url.LocalPath
        if ($rawPath -eq "/") { $rawPath = "/index.html" }
        # Clean path to prevent directory traversal
        $rawPath = $rawPath.Replace("..", "").Replace("\", "/")
        $localPath = Join-Path (Get-Location) $rawPath
        
        Write-Host "$($request.HttpMethod) $($request.Url.PathAndQuery)" -NoNewline
        
        if (Test-Path $localPath -PathType Leaf) {
            try {
                $bytes = [System.IO.File]::ReadAllBytes($localPath)
                $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
                $contentType = switch ($ext) {
                    ".html" { "text/html; charset=utf-8" }
                    ".js" { "application/javascript; charset=utf-8" }
                    ".css" { "text/css; charset=utf-8" }
                    ".png" { "image/png" }
                    ".jpg" { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    ".gif" { "image/gif" }
                    ".svg" { "image/svg+xml; charset=utf-8" }
                    ".ico" { "image/x-icon" }
                    default { "application/octet-stream" }
                }
                $response.ContentType = $contentType
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                Write-Host " - 200 OK" -ForegroundColor Green
            }
            catch {
                $response.StatusCode = 500
                $bytes = [System.Text.Encoding]::UTF8.GetBytes("500 Internal Server Error: $_")
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                Write-Host " - 500 Error: $_" -ForegroundColor Red
            }
        }
        else {
            $response.StatusCode = 404
            $bytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host " - 404 Not Found" -ForegroundColor Yellow
        }
        $response.Close()
    }
}
catch {
    Write-Host "Error starting server: $_" -ForegroundColor Red
}
finally {
    $listener.Close()
}
