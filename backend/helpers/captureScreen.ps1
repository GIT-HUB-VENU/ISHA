param(
    [string]$outDir = ""
)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

if ([string]::IsNullOrWhiteSpace($outDir)) {
    $outDir = Join-Path (Get-Location) "isha_workspace\screenshots"
}

if (!(Test-Path $outDir)) {
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}

$screen = [System.Windows.Forms.Screen]::PrimaryScreen
$bounds = $screen.Bounds

$bitmap = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

$graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$filename = "screenshot_$timestamp.png"
$filepath = Join-Path $outDir $filename

$bitmap.Save($filepath, [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$bitmap.Dispose()

if (Test-Path $filepath) {
    $fileObj = Get-Item $filepath
    [PSCustomObject]@{
        success = [bool]($fileObj.Length -gt 0)
        path = $filepath
        filename = $filename
        size = $fileObj.Length
    } | ConvertTo-Json -Compress
} else {
    [PSCustomObject]@{
        success = $false
        error = "File could not be saved."
    } | ConvertTo-Json -Compress
}
