<#
Stop hook của Claude Code (Khoa, 2026-11-04: mọi thay đổi bot phải lên GitHub ngay).
So bot đang chạy trên máy (genbid-hsmt\, skills Claude) với bot\ trên origin/main. Khác thì exit 2: Claude
không dừng được cho tới khi đã chạy bot\Backup-GenBidBot.ps1 và merge PR. Không phải phiên GenSet thì bỏ qua.
Chạy tay: echo {} | powershell -File Test-GenBidBotGit.ps1 -Any
#>
param([switch]$Any)
$ErrorActionPreference = 'Stop'
$Root = 'C:\Projects\GenSet Pro'
$Repo = Join-Path $Root 'GenSet-Pro'
$in = $null
try { $in = [Console]::In.ReadToEnd() | ConvertFrom-Json } catch {}
if ($in -and $in.stop_hook_active) { exit 0 }
if (-not $Any -and -not ($in -and "$($in.cwd)" -like "$Root*")) { exit 0 }
if (-not (Test-Path (Join-Path $Repo '.git'))) { exit 0 }

$Cl = Join-Path $env:USERPROFILE '.claude'
$map = [ordered]@{
    'bot/genbid-hsmt'                        = Join-Path $Root 'genbid-hsmt'
    'bot/claude/skills/run-hsmt-worker'      = Join-Path $Cl 'skills\run-hsmt-worker'
    'bot/claude/scheduled-tasks/hsmt-worker' = Join-Path $Cl 'scheduled-tasks\hsmt-worker'
}
$live = [ordered]@{}
foreach ($d in $map.Keys) {
    if (-not (Test-Path $map[$d])) { continue }
    Get-ChildItem $map[$d] -File | Where-Object { $_.Name -notmatch '^\.|\.bak|^New Text Document' } |
        ForEach-Object { $live["$d/$($_.Name)"] = $_.FullName }
}
$paths = @($live.Values)
$hashes = @(& git -C $Repo hash-object -- @paths)  # not --stdin-paths: PowerShell 5.1 pipes a BOM in front
$mine = @{}; $i = 0
foreach ($k in $live.Keys) { $mine[$k] = $hashes[$i]; $i++ }

function Get-BotDiff {
    $git = @{}
    & git -C $Repo ls-tree -r origin/main -- @($map.Keys) 2>$null | ForEach-Object {
        if ($_ -match '^\S+ blob (\S+)\t(.+)$') { $git[$Matches[2]] = $Matches[1] }
    }
    $out = @($mine.Keys | Where-Object { $git[$_] -ne $mine[$_] } | ForEach-Object { "$_ (changed or not on GitHub)" })
    $out += @($git.Keys | Where-Object { -not $mine.ContainsKey($_) } | ForEach-Object { "$_ (deleted on this PC)" })
    $out
}
$d = @(Get-BotDiff)
if ($d.Count) { & git -C $Repo fetch -q origin main 2>$null; $d = @(Get-BotDiff) }
if (-not $d.Count) { exit 0 }
[Console]::Error.WriteLine("GenBid bot on this PC differs from bot/ on GitHub main (rule: every bot change goes to GitHub right away):")
$d | Select-Object -First 15 | ForEach-Object { [Console]::Error.WriteLine("  $_") }
[Console]::Error.WriteLine("Do it now: worktree from origin/main, run bot\Backup-GenBidBot.ps1 there, commit bot/, push, PR, squash merge. If a change is only a test/temporary edit, say so to Khoa instead.")
exit 2
