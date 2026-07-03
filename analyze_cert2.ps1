Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\Rahman\Downloads\Vectonix-main\Vectonix-main\public\certificate-template.png')
$W = $img.Width; $H = $img.Height

function Get-Extent($yStart, $yEnd, $type) {
    $minX = $W; $maxX = 0; $count = 0
    for ($y = $yStart; $y -le $yEnd; $y++) {
        for ($x = 50; $x -lt ($W - 50); $x++) {
            $p = $img.GetPixel($x, $y)
            $r = [int]$p.R; $g = [int]$p.G; $b = [int]$p.B
            $match = $false
            if ($type -eq "blue" -and $r -lt 80 -and $g -lt 100 -and $b -gt 120) { $match = $true }
            if ($type -eq "green" -and $r -lt 80 -and $g -gt 130 -and $b -lt 100) { $match = $true }
            if ($match) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                $count++
            }
        }
    }
    return [PSCustomObject]@{ yStart=$yStart; yEnd=$yEnd; minX=$minX; maxX=$maxX; width=($maxX-$minX); pixelCount=$count }
}

Write-Host "=== Issue Date (y=250-267) ==="
(Get-Extent 250 267 "blue") | Format-List

Write-Host "=== Student Name (y=571-623) ==="
(Get-Extent 571 623 "blue") | Format-List

Write-Host "=== College Name (y=720-736) ==="
(Get-Extent 720 736 "blue") | Format-List

Write-Host "=== Domain Name green (y=834-851) ==="
(Get-Extent 834 851 "green") | Format-List

Write-Host "=== Domain Name blue brackets (y=825-852) ==="
(Get-Extent 825 852 "blue") | Format-List

Write-Host "=== Date Line (y=889-902) ==="
(Get-Extent 889 902 "blue") | Format-List

Write-Host "=== Signature area (y=1029-1044) ==="
(Get-Extent 1029 1044 "blue") | Format-List

$img.Dispose()
