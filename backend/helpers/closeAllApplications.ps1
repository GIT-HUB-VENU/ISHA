# closeAllApplications.ps1
# Helper script for ISHA Desktop Assistant to safely close target user applications while protecting Chrome, Antigravity IDE, System processes, and ISHA itself.

$ErrorActionPreference = "SilentlyContinue"

# 1. Close File Explorer windows safely via Shell COM object (DO NOT kill explorer.exe process)
try {
    $shell = New-Object -ComObject Shell.Application
    $windows = $shell.Windows()
    if ($windows) {
        for ($i = 0; $i -lt $windows.Count; $i++) {
            try {
                $win = $windows.Item($i)
                if ($win) {
                    $name = ""
                    $fullName = ""
                    try { $name = $win.Name } catch {}
                    try { $fullName = $win.FullName } catch {}
                    if ($name -eq "File Explorer" -or $name -eq "Windows Explorer" -or $fullName -like "*explorer.exe*") {
                        $win.Quit()
                    }
                }
            } catch {}
        }
    }
} catch {}

# 2. Fast Pre-fetch of WMI / CIM Process metadata to avoid repeated WMI queries
$cimDict = @{}
try {
    $allCim = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue
    foreach ($c in $allCim) {
        $cimDict[[int]$c.ProcessId] = $c
    }
} catch {}

# 3. Collect ISHA Ancestor Process IDs to ensure ISHA and its parents (Node, Vite, PowerShell, etc.) are protected
$ishaPids = [System.Collections.Generic.HashSet[int]]::new()
$currPid = $PID
while ($currPid -gt 0) {
    [void]$ishaPids.Add($currPid)
    if ($cimDict.ContainsKey($currPid)) {
        $parentPid = [int]$cimDict[$currPid].ParentProcessId
        if ($parentPid -gt 0 -and -not $ishaPids.Contains($parentPid)) {
            $currPid = $parentPid
        } else {
            break
        }
    } else {
        break
    }
}

# Explicit Target Allowlist - ONLY these applications can be closed by 'close all'
# Antigravity is NOT here. Chrome is NOT here. ISHA is NOT here. Explorer.exe is NOT here.
$targetProcNames = @(
    "whatsapp",
    "whatsapp.server",
    "code",
    "notepad",
    "notepadapp",
    "calculatorapp",
    "calc",
    "calculator",
    "spotify",
    "discord",
    "msedge",
    "brave",
    "mspaint",
    "systemsettings",
    "windowscamera",
    "camera",
    "taskmgr",
    "windowsterminal",
    "cmd",
    "powershell",
    "pwsh"
)

# Function to check if a process is Antigravity IDE
function Test-IsAntigravityProcess($proc) {
    if (-not $proc) { return $false }
    try {
        $pName = $proc.ProcessName.ToLower()
        if ($pName -like "*antigravity*") { return $true }
    } catch {}

    try {
        $title = $proc.MainWindowTitle
        if ($title -and $title -like "*Antigravity*") { return $true }
    } catch {}

    if ($cimDict.ContainsKey($proc.Id)) {
        $cim = $cimDict[$proc.Id]
        if ($cim.ExecutablePath -and $cim.ExecutablePath.ToLower() -like "*antigravity*") { return $true }
        if ($cim.CommandLine -and $cim.CommandLine.ToLower() -like "*antigravity*") { return $true }
    }
    return $false
}

# Function to check if a process is Google Chrome
function Test-IsChromeProcess($proc) {
    if (-not $proc) { return $false }
    try {
        $pName = $proc.ProcessName.ToLower()
        if ($pName -eq "chrome" -or $pName -like "*chrome*") { return $true }
    } catch {}

    if ($cimDict.ContainsKey($proc.Id)) {
        $cim = $cimDict[$proc.Id]
        if ($cim.ExecutablePath -and $cim.ExecutablePath.ToLower() -like "*chrome.exe*") { return $true }
    }
    return $false
}

# Function to check if a process belongs to ISHA or system
function Test-IsProtectedProcess($proc) {
    if (-not $proc) { return $true }

    # 1. Antigravity Protection - ABSOLUTE EXCLUSION
    if (Test-IsAntigravityProcess -proc $proc) { return $true }

    # 2. Chrome Protection - ABSOLUTE EXCLUSION
    if (Test-IsChromeProcess -proc $proc) { return $true }

    # 3. ISHA Protection (Process ID or ancestor PID check)
    if ($ishaPids.Contains($proc.Id)) { return $true }

    try {
        $pName = $proc.ProcessName.ToLower()

        # Protection for Node / ISHA processes
        if ($pName -eq "node" -or $pName -eq "npm" -or $pName -eq "vite" -or $pName -eq "electron") {
            return $true
        }

        # System & Windows Shell Processes Protection
        $systemProcs = @(
            "explorer", "system", "idle", "svchost", "dwm", "csrss",
            "wininit", "winlogon", "services", "lsass", "smss",
            "runtimebroker", "sihost", "taskhostw", "ctfmon", "searchhost",
            "startmenuexperiencehost", "shellexperiencehost"
        )
        if ($systemProcs -contains $pName) {
            return $true
        }
    } catch {}

    return $false
}

# 4. Enumerate processes and find allowed target applications
$allProcesses = Get-Process -ErrorAction SilentlyContinue
$procsToClose = [System.Collections.Generic.List[System.Diagnostics.Process]]::new()
$pidsToTarget = [System.Collections.Generic.HashSet[int]]::new()

foreach ($proc in $allProcesses) {
    try {
        # FIRST: Safety Exclusion Check
        if (Test-IsProtectedProcess -proc $proc) {
            continue
        }

        $pName = $proc.ProcessName.ToLower()

        # SPECIAL HANDLING: Python IDLE
        if ($pName -eq "python" -or $pName -eq "pythonw") {
            $isIdle = $false
            $title = ""
            try { $title = $proc.MainWindowTitle } catch {}

            if ($title -and ($title -like "*IDLE*" -or $title -like "*Python*Shell*")) {
                $isIdle = $true
            } else {
                if ($cimDict.ContainsKey($proc.Id)) {
                    $cim = $cimDict[$proc.Id]
                    if ($cim.CommandLine -and ($cim.CommandLine -like "*idlelib*" -or $cim.CommandLine -like "*idle.py*")) {
                        $isIdle = $true
                    }
                }
            }

            if (-not $isIdle) {
                # NOT Python IDLE - DO NOT TOUCH!
                continue
            } else {
                $procsToClose.Add($proc)
                [void]$pidsToTarget.Add($proc.Id)
                continue
            }
        }

        # SPECIAL HANDLING: UWP ApplicationFrameHost (Settings, Camera, Calculator)
        if ($pName -eq "applicationframehost") {
            $title = ""
            try { $title = $proc.MainWindowTitle } catch {}
            if ($title -and ($title -like "*Settings*" -or $title -like "*Camera*" -or $title -like "*Calculator*")) {
                $procsToClose.Add($proc)
                [void]$pidsToTarget.Add($proc.Id)
            }
            continue
        }

        # MATCH ALLOWLIST TARGETS ONLY
        $isTarget = $false
        foreach ($target in $targetProcNames) {
            if ($pName -eq $target) {
                $isTarget = $true
                break
            }
        }

        if ($isTarget) {
            $procsToClose.Add($proc)
            [void]$pidsToTarget.Add($proc.Id)
        }
    } catch {}
}

# 5. Gracefully request window close first
foreach ($proc in $procsToClose) {
    try {
        if ($proc.MainWindowHandle -ne 0) {
            $proc.CloseMainWindow() | Out-Null
        }
    } catch {}
}

# Pause briefly for graceful exit
Start-Sleep -Milliseconds 400

# 6. Force stop remaining target processes if they did not exit gracefully
foreach ($pidToKill in $pidsToTarget) {
    try {
        $p = Get-Process -Id $pidToKill -ErrorAction SilentlyContinue
        if ($p -and -not $p.HasExited) {
            # Final safety double check before force killing
            if (-not (Test-IsProtectedProcess -proc $p)) {
                Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
            }
        }
    } catch {}
}

[PSCustomObject]@{
    success = $true
    action = "CLOSE_ALL_APPLICATIONS"
    message = "Closed all supported applications."
} | ConvertTo-Json -Compress
