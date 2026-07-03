Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('C:\Users\Rahman\Downloads\Vectonix-main\Vectonix-main\public\certificate-template.png')
Write-Host "Width: $($img.Width) Height: $($img.Height)"
$img.Dispose()
