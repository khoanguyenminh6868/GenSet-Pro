<#
Chép bản bot đang chạy trên máy vào thư mục bot\ của repo này, để GitHub luôn có đủ logic (Khoa, 2026-11-04).
Chạy sau mỗi lần sửa script trong genbid-hsmt\ hoặc skills Claude, rồi commit/PR thư mục bot\.

  powershell -NoProfile -ExecutionPolicy Bypass -File bot\Backup-GenBidBot.ps1          # chép + git status
  powershell -NoProfile -ExecutionPolicy Bypass -File bot\Backup-GenBidBot.ps1 -Check   # chỉ so, exit 1 nếu khác

Không chép: token/khoá (tệp bắt đầu bằng dấu chấm), *.bak*, node_modules, tệp trạng thái và dữ liệu gói thầu.
#>
param(
    [string]$Root = 'C:\Projects\GenSet Pro',
    [switch]$Check
)
$ErrorActionPreference = 'Stop'
$Bot = $PSScriptRoot
$Cl = Join-Path $env:USERPROFILE '.claude'
# nguồn trên máy -> đích trong repo
$map = [ordered]@{
    'genbid-hsmt'                               = Join-Path $Root 'genbid-hsmt'
    'claude\skills\run-hsmt-worker'             = Join-Path $Cl 'skills\run-hsmt-worker'
    'claude\skills\genbid-setup'                = Join-Path $Cl 'skills\genbid-setup'
    'claude\skills\tim-thong-so-ncc'            = Join-Path $Cl 'skills\tim-thong-so-ncc'
    'claude\scheduled-tasks\hsmt-worker'        = Join-Path $Cl 'scheduled-tasks\hsmt-worker'
    'claude\memory'                             = Join-Path $Cl ('projects\' + ($Root -replace '[:\\ ]', '-') + '\memory')
}
function Keep($f) { $f.Name -notmatch '^\.|\.bak|^New Text Document' }

$diff = New-Object System.Collections.Generic.List[string]
foreach ($dst in $map.Keys) {
    $src = $map[$dst]; $to = Join-Path $Bot $dst
    if (-not (Test-Path $src)) { Write-Warning "Không có $src"; continue }
    New-Item -ItemType Directory -Force $to | Out-Null
    $live = @(Get-ChildItem $src -File | Where-Object { Keep $_ })
    foreach ($f in $live) {
        $t = Join-Path $to $f.Name
        if (-not (Test-Path $t) -or (Get-FileHash $t).Hash -ne (Get-FileHash $f.FullName).Hash) {
            $diff.Add("$dst\$($f.Name)")
            if (-not $Check) { Copy-Item $f.FullName $t -Force }
        }
    }
    foreach ($g in @(Get-ChildItem $to -File | Where-Object { $live.Name -notcontains $_.Name })) {
        $diff.Add("$dst\$($g.Name) (đã xoá trên máy)")
        if (-not $Check) { Remove-Item $g.FullName }
    }
}
$hw = Join-Path $Root '.hsmt-worker.md'
if ((Test-Path $hw) -and (Get-FileHash $hw).Hash -ne (Get-FileHash (Join-Path $Root 'genbid-hsmt\hsmt-worker.md')).Hash) {
    Write-Warning '.hsmt-worker.md khác genbid-hsmt\hsmt-worker.md (bản trong kit được lưu; Install chép đè .hsmt-worker.md)'
}
$t = Get-ScheduledTask 'GenBid Bot' -ErrorAction SilentlyContinue
if ($t -and ($t.Actions[0].Arguments -notmatch 'genbid-hsmt\\GenBid-Bot\.ps1')) { Write-Warning "Tác vụ GenBid Bot chạy lệnh khác Install-GenBidBot.ps1: $($t.Actions[0].Arguments)" }
foreach ($x in Get-ScheduledTask | Where-Object { $_.TaskName -like 'GenBid*' -and $_.TaskName -ne 'GenBid Bot' -and $_.State -ne 'Disabled' }) {
    Write-Warning "Tác vụ Windows '$($x.TaskName)' không có trong Install-GenBidBot.ps1"
}

if ($diff.Count) { $diff | ForEach-Object { Write-Host "  $_" } } else { Write-Host 'Repo đã giống bản đang chạy.' }
if ($Check) { exit [int]($diff.Count -gt 0) }
& git -C (Split-Path $Bot -Parent) status --short -- bot
