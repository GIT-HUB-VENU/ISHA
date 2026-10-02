# Dynamic Camera Application Discovery & Launcher
$appLaunched = $false
$launchedAppName = ""

try {
    # 1. Check AppX registered camera packages (Microsoft.WindowsCamera or third-party UWP camera apps)
    $cameraAppx = Get-AppxPackage -Name "*camera*" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($cameraAppx) {
        $manifest = Get-AppxPackageManifest -Package $cameraAppx -ErrorAction SilentlyContinue
        $appId = $manifest.Package.Applications.Application.Id
        if ($appId) {
            $targetApp = "$($cameraAppx.PackageFamilyName)!$appId"
            Start-Process "shell:AppsFolder\$targetApp" -ErrorAction SilentlyContinue
            $appLaunched = $true
            $launchedAppName = "Windows Camera"
        }
    }
} catch {}

# 2. Check shell:AppsFolder for any camera shortcut if AppX direct launch failed
if (-not $appLaunched) {
    try {
        $shell = New-Object -ComObject Shell.Application
        $appsFolder = $shell.Namespace("shell:AppsFolder")
        foreach ($item in $appsFolder.Items()) {
            $name = $item.Name.ToLower()
            if ($name -like "*camera*" -or $name -like "*webcam*") {
                $item.InvokeVerb()
                $appLaunched = $true
                $launchedAppName = $item.Name
                break
            }
        }
    } catch {}
}

# 3. Search common desktop camera software executables
if (-not $appLaunched) {
    $commonCameraExes = @(
        "$env:ProgramFiles\Lenovo\VantageService\LenovoVantage.exe",
        "$env:ProgramFiles(x86)\CyberLink\YouCam\YouCam.exe",
        "$env:ProgramFiles\Logitech\LogiCapture\bin\LogiCapture.exe",
        "$env:ProgramFiles\ManyCam\ManyCam.exe",
        "$env:ProgramFiles\obs-studio\bin\64bit\obs64.exe"
    )

    foreach ($exe in $commonCameraExes) {
        if (Test-Path $exe) {
            Start-Process $exe -ErrorAction SilentlyContinue
            $appLaunched = $true
            $launchedAppName = [System.IO.Path]::GetFileNameWithoutExtension($exe)
            break
        }
    }
}

if ($appLaunched) {
    [PSCustomObject]@{
        success = $true
        action = "OPEN_CAMERA"
        message = "Opening $launchedAppName."
    } | ConvertTo-Json -Compress
} else {
    [PSCustomObject]@{
        success = $false
        action = "OPEN_CAMERA"
        message = "I couldn't find a camera application, but your webcam may still be available."
        errorCode = "NO_CAMERA_APP"
    } | ConvertTo-Json -Compress
}
