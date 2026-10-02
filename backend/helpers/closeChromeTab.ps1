$code = @"
using System;
using System.Runtime.InteropServices;

public class User32SendKeys {
    [DllImport("user32.dll")]
    public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, int dwExtraInfo);

    public const byte VK_CONTROL = 0x11;
    public const byte VK_W = 0x57;
    public const uint KEYEVENTF_KEYUP = 0x0002;

    public static void CloseTab() {
        keybd_event(VK_CONTROL, 0, 0, 0);
        keybd_event(VK_W, 0, 0, 0);
        System.Threading.Thread.Sleep(60);
        keybd_event(VK_W, 0, KEYEVENTF_KEYUP, 0);
        keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, 0);
    }
}
"@
Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue

try {
    [User32SendKeys]::CloseTab()
    [PSCustomObject]@{
        success = $true
        action = "CLOSE_CHROME_TAB"
        message = "Closed that tab."
    } | ConvertTo-Json -Compress
} catch {
    [PSCustomObject]@{
        success = $false
        action = "CLOSE_CHROME_TAB"
        message = $_.Exception.Message
    } | ConvertTo-Json -Compress
}
