param(
    [string]$targetApp = ""
)

if ([string]::IsNullOrWhiteSpace($targetApp)) {
    [PSCustomObject]@{
        success = $false
        found = $false
        message = "No target application specified."
    } | ConvertTo-Json -Compress
    exit 0
}

$code = @"
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;

namespace WinAppSwitcher {
    public class AppSwitcher {
        public delegate bool EnumWinProc(IntPtr hWnd, IntPtr lParam);

        [DllImport("user32.dll")]
        public static extern IntPtr OpenInputDesktop(uint dwFlags, bool fInherit, uint dwDesiredAccess);

        [DllImport("user32.dll")]
        public static extern bool EnumDesktopWindows(IntPtr hDesktop, EnumWinProc lpEnumCallbackFunction, IntPtr lParam);

        [DllImport("user32.dll")]
        public static extern bool IsWindowVisible(IntPtr hWnd);

        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

        [DllImport("user32.dll")]
        public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

        [DllImport("user32.dll")]
        public static extern bool SetForegroundWindow(IntPtr hWnd);

        [DllImport("user32.dll")]
        public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

        [DllImport("user32.dll")]
        public static extern bool IsIconic(IntPtr hWnd);

        [DllImport("user32.dll")]
        public static extern IntPtr GetForegroundWindow();

        [DllImport("user32.dll")]
        public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

        public const int SW_RESTORE = 9;
        public const int SW_SHOW = 5;

        public class WindowItem {
            public long Hwnd { get; set; }
            public string Title { get; set; }
            public uint ProcessId { get; set; }
            public string ProcessName { get; set; }
            public bool IsMinimized { get; set; }
        }

        public static List<WindowItem> GetDesktopWindows() {
            List<WindowItem> list = new List<WindowItem>();
            IntPtr hDesk = OpenInputDesktop(0, false, 0x0100);
            EnumDesktopWindows(hDesk, (hWnd, lParam) => {
                if (IsWindowVisible(hWnd) || IsIconic(hWnd)) {
                    StringBuilder sb = new StringBuilder(512);
                    GetWindowText(hWnd, sb, 512);
                    string title = sb.ToString();
                    if (!string.IsNullOrWhiteSpace(title)) {
                        uint pid;
                        GetWindowThreadProcessId(hWnd, out pid);
                        string pName = "";
                        try {
                            var p = System.Diagnostics.Process.GetProcessById((int)pid);
                            if (p != null) pName = p.ProcessName;
                        } catch {}
                        list.Add(new WindowItem {
                            Hwnd = (long)hWnd,
                            Title = title,
                            ProcessId = pid,
                            ProcessName = pName,
                            IsMinimized = IsIconic(hWnd)
                        });
                    }
                }
                return true;
            }, IntPtr.Zero);
            return list;
        }

        public static bool ActivateHWnd(IntPtr hWnd) {
            if (hWnd == IntPtr.Zero) return false;
            
            if (IsIconic(hWnd)) {
                ShowWindow(hWnd, SW_RESTORE);
            }
            ShowWindow(hWnd, SW_SHOW);

            // Tapping ALT key bypasses Windows SetForegroundWindow focus restriction
            keybd_event(0x12, 0, 0, UIntPtr.Zero);
            keybd_event(0x12, 0, 2, UIntPtr.Zero);

            return SetForegroundWindow(hWnd);
        }

        public static IntPtr GetCurrentForeground() {
            return GetForegroundWindow();
        }

        public static string GetProcessNameFromHWnd(IntPtr hWnd) {
            uint pid;
            GetWindowThreadProcessId(hWnd, out pid);
            try {
                var p = System.Diagnostics.Process.GetProcessById((int)pid);
                if (p != null) return p.ProcessName;
            } catch {}
            return "";
        }
    }
}
"@

Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue

$allWins = [WinAppSwitcher.AppSwitcher]::GetDesktopWindows()

function Find-TargetWindow {
    param([string]$target, [array]$windows)
    
    $t = $target.ToLower().Trim()
    
    # Pass 1: Prioritize visible non-minimized windows; Pass 2: Fall back to minimized windows
    foreach ($pass in @("non-minimized", "any")) {
        foreach ($w in $windows) {
            if ($pass -eq "non-minimized" -and $w.IsMinimized) { continue }
            
            $pName = $w.ProcessName.ToLower()
            $wTitle = $w.Title.ToLower()
            
            if ($t -eq "whatsapp" -or $t -eq "what's app" -or $t -eq "wasap") {
                if ($pName -eq "whatsapp" -or $pName -eq "whatsapp.server" -or $wTitle.Contains("whatsapp")) { return $w }
            }
            elseif ($t -eq "vscode" -or $t -eq "vs code" -or $t -eq "code" -or $t -eq "visual studio code" -or $t -eq "code editor") {
                if ($pName -eq "code" -or $wTitle.Contains("visual studio code")) { return $w }
            }
            elseif ($t -eq "antigravity_ide" -or $t -eq "antigravity ide" -or $t -eq "antigravity" -or $t -eq "ide") {
                if ($pName.Contains("antigravity") -or $wTitle.Contains("antigravity")) { return $w }
            }
            elseif ($t -eq "idle" -or $t -eq "python idle" -or $t -eq "idele" -or $t -eq "ideal") {
                if (($pName -eq "pythonw" -or $pName -eq "python") -and ($wTitle.Contains("idle") -or $wTitle.Contains("python"))) { return $w }
            }
            elseif ($t -eq "calculator" -or $t -eq "calc") {
                if ($pName -eq "calculatorapp" -or $pName -eq "calc" -or ($pName -eq "applicationframehost" -and $wTitle.Contains("calculator"))) { return $w }
            }
            elseif ($t -eq "notepad" -or $t -eq "notes" -or $t -eq "text editor") {
                if ($pName -eq "notepad" -or $pName -eq "notepadapp" -or $wTitle.Contains("notepad")) { return $w }
            }
            elseif ($t -eq "chrome" -or $t -eq "google chrome" -or $t -eq "browser") {
                if ($pName -eq "chrome" -or $wTitle.Contains("google chrome")) { return $w }
            }
            elseif ($t -eq "brave" -or $t -eq "brave browser") {
                if ($pName -eq "brave" -or $wTitle.Contains("brave")) { return $w }
            }
            elseif ($t -eq "spotify") {
                if ($pName -eq "spotify" -or $wTitle.Contains("spotify")) { return $w }
            }
            elseif ($t -eq "discord") {
                if ($pName -eq "discord" -or $wTitle.Contains("discord")) { return $w }
            }
            elseif ($t -eq "edge" -or $t -eq "microsoft edge") {
                if ($pName -eq "msedge" -or $wTitle.Contains("edge")) { return $w }
            }
            elseif ($t -eq "paint" -or $t -eq "mspaint") {
                if ($pName -eq "mspaint" -or $wTitle.Contains("paint")) { return $w }
            }
            elseif ($t -eq "settings" -or $t -eq "windows settings") {
                if ($pName -eq "systemsettings" -or ($pName -eq "applicationframehost" -and $wTitle.Contains("settings"))) { return $w }
            }
            elseif ($t -eq "terminal" -or $t -eq "command prompt" -or $t -eq "cmd" -or $t -eq "powershell" -or $t -eq "command terminal") {
                if ($pName -eq "cmd" -or $pName -eq "windowsterminal" -or $pName -eq "powershell" -or $wTitle.Contains("command prompt") -or $wTitle.Contains("terminal")) { return $w }
            }
            elseif ($t -eq "explorer" -or $t -eq "file explorer" -or $t -eq "files" -or $t -eq "my files" -or $t -eq "folder") {
                if ($pName -eq "explorer" -and $wTitle -ne "program manager" -and $wTitle -ne "") { return $w }
            }
            elseif ($t -eq "taskmanager" -or $t -eq "task manager" -or $t -eq "taskmgr") {
                if ($pName -eq "taskmgr" -or $wTitle.Contains("task manager")) { return $w }
            }
            elseif ($t -eq "camera" -or $t -eq "webcam") {
                if ($pName -eq "windowscamera" -or ($pName -eq "applicationframehost" -and $wTitle.Contains("camera"))) { return $w }
            }
            else {
                if ($wTitle -ne "program manager" -and ($pName.Contains($t) -or $wTitle.Contains($t))) { return $w }
            }
        }
    }
    
    return $null
}

$matched = Find-TargetWindow -target $targetApp -windows $allWins

if ($null -eq $matched) {
    [PSCustomObject]@{
        success = $false
        found = $false
        target = $targetApp
        message = "Could not find open window for target: $targetApp"
    } | ConvertTo-Json -Compress
    exit 0
}

$hwndIntPtr = [IntPtr]$matched.Hwnd
[WinAppSwitcher.AppSwitcher]::ActivateHWnd($hwndIntPtr) | Out-Null
Start-Sleep -Milliseconds 100

$foreHWnd = [WinAppSwitcher.AppSwitcher]::GetCurrentForeground()
$foreProcName = [WinAppSwitcher.AppSwitcher]::GetProcessNameFromHWnd($foreHWnd).ToLower()
$targetProcName = $matched.ProcessName.ToLower()

$verified = ($foreHWnd -eq $hwndIntPtr -or $foreProcName -eq $targetProcName -or ($targetProcName -eq "applicationframehost" -and $foreProcName -ne ""))

[PSCustomObject]@{
    success = $true
    found = $true
    verified = $verified
    target = $targetApp
    processName = $matched.ProcessName
    title = $matched.Title
    hwnd = $matched.Hwnd
} | ConvertTo-Json -Compress
