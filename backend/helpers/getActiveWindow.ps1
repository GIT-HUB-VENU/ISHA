$code = @"
using System;
using System.Runtime.InteropServices;
using System.Text;

public class User32ActiveWin {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
}
"@
Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue

$hwnd = [User32ActiveWin]::GetForegroundWindow()
$titleSb = New-Object System.Text.StringBuilder 512
[User32ActiveWin]::GetWindowText($hwnd, $titleSb, 512) | Out-Null
$procId = [uint32]0
[User32ActiveWin]::GetWindowThreadProcessId($hwnd, [ref]$procId) | Out-Null
$proc = Get-Process -Id $procId -ErrorAction SilentlyContinue

$title = $titleSb.ToString()
$processName = if ($proc) { $proc.ProcessName } else { "" }

$isChrome = ($processName.ToLower() -eq "chrome")
$isBrowser = ($isChrome -or $processName.ToLower() -eq "msedge" -or $processName.ToLower() -eq "brave" -or $processName.ToLower() -eq "firefox" -or $processName.ToLower() -eq "opera")

[PSCustomObject]@{
    hwnd = [int64]$hwnd
    title = $title
    processName = $processName
    processId = [int64]$procId
    isChrome = $isChrome
    isBrowser = $isBrowser
    supportsTabClose = $isBrowser
} | ConvertTo-Json -Compress
