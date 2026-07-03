Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\Rahman\Downloads\Vectonix-main\Vectonix-main\public\certificate-template.png')
$W = $img.Width; $H = $img.Height
Write-Host "Image: ${W}x${H}"

$blueRows = @(); $greenRows = @()

# Scan y=250 to y=1200 (the text body area)
for ($y = 250; $y -lt 1250; $y++) {
    $blue = 0; $green = 0
    # Step x by 3 for speed
    for ($x = 80; $x -lt ($W - 80); $x += 3) {
        $p = $img.GetPixel($x, $y)
        $r = [int]$p.R; $g = [int]$p.G; $b = [int]$p.B
        # Navy blue: r<80, g<100, b>120, b-r>60
        if ($r -lt 80 -and $g -lt 100 -and $b -gt 120 -and ($b - $r) -gt 60) { $blue++ }
        # Green: r<80, g>130, b<100
        if ($r -lt 80 -and $g -gt 130 -and $b -lt 100 -and ($g - $r) -gt 80) { $green++ }
    }
    if ($blue -gt 6) { $blueRows += $y }
    if ($green -gt 4) { $greenRows += $y }
}

Write-Host "--- BLUE ROWS (navy text) ---"
$blueRows | ForEach-Object { Write-Host $_ }
Write-Host ""
Write-Host "--- GREEN ROWS ---"
$greenRows | ForEach-Object { Write-Host $_ }

$img.Dispose()
