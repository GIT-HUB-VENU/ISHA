param(
    [string]$action = "TOGGLE_MUTE",
    [int]$value = 5
)

$wsh = New-Object -ComObject WScript.Shell

switch ($action.ToUpper()) {
    "PLAY_PAUSE" {
        $wsh.SendKeys([char]179)
        [PSCustomObject]@{ success = $true; action = "MEDIA_PLAY_PAUSE"; message = "Toggled playback." } | ConvertTo-Json -Compress
    }
    "NEXT_TRACK" {
        $wsh.SendKeys([char]176)
        [PSCustomObject]@{ success = $true; action = "MEDIA_NEXT"; message = "Playing next track." } | ConvertTo-Json -Compress
    }
    "PREV_TRACK" {
        $wsh.SendKeys([char]177)
        [PSCustomObject]@{ success = $true; action = "MEDIA_PREVIOUS"; message = "Playing previous track." } | ConvertTo-Json -Compress
    }
    "MUTE" {
        $wsh.SendKeys([char]173)
        [PSCustomObject]@{ success = $true; action = "MEDIA_MUTE"; message = "Muted audio." } | ConvertTo-Json -Compress
    }
    "UNMUTE" {
        $wsh.SendKeys([char]173)
        [PSCustomObject]@{ success = $true; action = "MEDIA_UNMUTE"; message = "Unmuted audio." } | ConvertTo-Json -Compress
    }
    "VOLUME_UP" {
        $steps = [Math]::Max(1, [Math]::Min(50, [int]($value / 2)))
        for ($i=0; $i -lt $steps; $i++) { $wsh.SendKeys([char]175) }
        [PSCustomObject]@{ success = $true; action = "VOLUME_UP"; message = "Increased volume." } | ConvertTo-Json -Compress
    }
    "VOLUME_DOWN" {
        $steps = [Math]::Max(1, [Math]::Min(50, [int]($value / 2)))
        for ($i=0; $i -lt $steps; $i++) { $wsh.SendKeys([char]174) }
        [PSCustomObject]@{ success = $true; action = "VOLUME_DOWN"; message = "Decreased volume." } | ConvertTo-Json -Compress
    }
    "SET_VOLUME" {
        for ($i=0; $i -lt 50; $i++) { $wsh.SendKeys([char]174) }
        $upSteps = [int]($value / 2)
        for ($i=0; $i -lt $upSteps; $i++) { $wsh.SendKeys([char]175) }
        [PSCustomObject]@{ success = $true; action = "SET_VOLUME"; message = "Set volume to $value percent." } | ConvertTo-Json -Compress
    }
    Default {
        [PSCustomObject]@{ success = $false; action = "UNKNOWN"; message = "Invalid media action." } | ConvertTo-Json -Compress
    }
}
