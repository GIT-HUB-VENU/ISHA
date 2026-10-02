$code = @"
using System;
using System.Runtime.InteropServices;

public class User32CloseWin {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")]
    public static extern bool PostMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

    public const uint WM_CLOSE = 0x0010;

    public static bool CloseActive() {
        IntPtr hwnd = GetForegroundWindow();
        if (hwnd != IntPtr.Zero) {
            return PostMessage(hwnd, WM_CLOSE, IntPtr.Zero, IntPtr.Zero);
        }
        return false;
    }
}
"@
Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue

try {
    $res = [User32CloseWin]::CloseActive()
    [PSCustomObject]@{
        success = [bool]$res
        action = "CLOSE_ACTIVE_WINDOW"
        message = "Closed active window."
    } | ConvertTo-Json -Compress
} catch {
    [PSCustomObject]@{
        success = $false
        action = "CLOSE_ACTIVE_WINDOW"
        message = $_.Exception.Message
    } | ConvertTo-Json -Compress
}
