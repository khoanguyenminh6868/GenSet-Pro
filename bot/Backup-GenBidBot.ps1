<#
Chép bản bot đang chạy trên máy vào thư mục bot\ của repo này, để GitHub luôn có đủ logic (Khoa, 2026-11-04).
Chạy sau mỗi lần sửa script trong genbid-hsmt\ hoặc skills Claude, rồi commit/PR thư mục bot\.

  powershell -NoProfile -ExecutionPolicy Bypass -File bot\Backup-GenBidBot.ps1          # chép + git status
  powershell -NoProfile -ExecutionPolicy Bypass -File bot\Backup-GenBidBot.ps1 -Check   # chỉ so, exit 1 nếu khác

Không chép: token/khoá (tệp bắt đầu bằng dấu chấm), *.bak*, node_modules, tệp trạng thái và dữ liệu gói thầu.
Bộ nhớ Claude (claude\memory) KHÔNG chép đè: gộp ba bản theo từng tệp, có thể kéo bản mới của git về máy (xem dưới);
xung đột thì thoát mã 2, không ghi đè bên nào.
#>
param(
    [string]$Root = 'C:\Projects\GenSet Pro',
    [switch]$Check,
    # Bản gốc của từng tệp bộ nhớ ở lần đồng bộ gần nhất (xem "Bộ nhớ Claude" dưới đây). Trên máy, ngoài git.
    [string]$BaseDir = ''
)
$ErrorActionPreference = 'Stop'
if (-not $BaseDir) { $BaseDir = Join-Path $Root 'genbid-work\memory-base' }
$Bot = $PSScriptRoot
$Cl = Join-Path $env:USERPROFILE '.claude'
# nguồn trên máy -> đích trong repo
$map = [ordered]@{
    'genbid-hsmt'                               = Join-Path $Root 'genbid-hsmt'
    'claude\skills\run-hsmt-worker'             = Join-Path $Cl 'skills\run-hsmt-worker'
    'claude\skills\genbid-setup'                = Join-Path $Cl 'skills\genbid-setup'
    'claude\skills\tim-thong-so-ncc'            = Join-Path $Cl 'skills\tim-thong-so-ncc'
    'claude\skills\update-bot'                  = Join-Path $Cl 'skills\update-bot'
    'claude\scheduled-tasks\hsmt-worker'        = Join-Path $Cl 'scheduled-tasks\hsmt-worker'
    'claude\memory'                             = Join-Path $Cl ('projects\' + ($Root -replace '[:\\ ]', '-') + '\memory')
}
function Keep($f) { $f.Name -notmatch '^\.|\.bak|^New Text Document' }

# ---------- Bộ nhớ Claude: gộp ba bản, không chép đè (Khoa 17/11/2026) ----------
# Nhiều phiên / nhiều máy cùng ghi bộ nhớ trong một buổi: chép nguyên thư mục của máy lên git làm mất phần máy khác vừa
# đẩy (17/11: hai lần trong một buổi sáng). Mỗi tệp so ba bản: máy, repo (worktree từ origin/main) và BẢN GỐC = bản của
# lần đồng bộ gần nhất, lưu ở $BaseDir trên máy (ngoài git, ngoài thư mục bộ nhớ).
#   máy = repo                       -> same   (ghi bản gốc)
#   máy = gốc, repo khác             -> pull   (git mới hơn: chép repo về máy; repo đã xoá thì xoá trên máy)
#   repo = gốc, máy khác             -> push   (chỉ máy sửa: chép máy lên repo; máy đã xoá thì xoá trong repo)
#   cả hai khác gốc                  -> merge  (git merge-file; sạch thì ghi cả hai nơi) hoặc conflict (không ghi gì)
#   chưa có bản gốc, hai bên khác    -> pull nếu bản trên máy là một bản cũ từng có trong git; còn lại conflict
# conflict: sửa tay cho tệp trên máy và tệp trong repo GIỐNG NHAU (giữ phần của cả hai), rồi chạy lại.
function Get-Sha([string]$p) { if (Test-Path -LiteralPath $p) { (Get-FileHash -LiteralPath $p).Hash } else { $null } }
function Test-InGitHistory([string]$RepoRoot, [string]$Rel, [string]$File) {
    if (-not $RepoRoot) { return $false }
    $eap = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
    try {
        $blob = (& git -C $RepoRoot hash-object "--path=$Rel" $File 2>$null) | Select-Object -Last 1
        if (-not $blob) { return $false }
        [bool]((& git -C $RepoRoot log -1 --format=%h "--find-object=$blob" HEAD -- $Rel 2>$null) | Where-Object { $_ })
    } finally { $ErrorActionPreference = $eap }
}
function Sync-MemoryFile([string]$Name, [string]$LocalDir, [string]$RepoDir, [string]$BaseDir, [string]$RepoRoot, [string]$Rel, [bool]$CheckOnly) {
    $l = Join-Path $LocalDir $Name; $g = Join-Path $RepoDir $Name; $b = Join-Path $BaseDir $Name
    $hl = Get-Sha $l; $hg = Get-Sha $g; $hb = Get-Sha $b
    $put = { param($from, $to) if (-not $CheckOnly) { New-Item -ItemType Directory -Force (Split-Path $to -Parent) | Out-Null; Copy-Item -LiteralPath $from -Destination $to -Force } }
    $del = { param($p) if (-not $CheckOnly -and (Test-Path -LiteralPath $p)) { Remove-Item -LiteralPath $p -Force } }
    if ($hl -eq $hg) { if ($hl) { & $put $l $b }; return 'same' }
    if ($hb) {
        if ($hl -eq $hb) { if ($hg) { & $put $g $l; & $put $g $b } else { & $del $l; & $del $b }; return 'pull' }
        if ($hg -eq $hb) { if ($hl) { & $put $l $g; & $put $l $b } else { & $del $g; & $del $b }; return 'push' }
        if (-not $hl -or -not $hg) { return 'conflict' }   # một bên xoá, bên kia sửa
        $tmp = Join-Path ([IO.Path]::GetTempPath()) ("genbid-mem-" + [Guid]::NewGuid().ToString('N') + '.md')
        Copy-Item -LiteralPath $l -Destination $tmp -Force
        $eap = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
        try { & git merge-file -q $tmp $b $g 2>$null | Out-Null; $rc = $LASTEXITCODE } finally { $ErrorActionPreference = $eap }
        if ($rc -ne 0) { Remove-Item -LiteralPath $tmp -Force; return 'conflict' }
        & $put $tmp $l; & $put $tmp $g; & $put $tmp $b
        Remove-Item -LiteralPath $tmp -Force
        return 'merge'
    }
    if (-not $hl) { & $put $g $l; & $put $g $b; return 'pull' }    # tệp mới trên git
    if (-not $hg) { & $put $l $g; & $put $l $b; return 'push' }    # tệp mới trên máy
    if (Test-InGitHistory $RepoRoot $Rel $l) { & $put $g $l; & $put $g $b; return 'pull' }
    return 'conflict'
}
$MemLabel = @{ pull = ' (git mới hơn: kéo về máy)'; merge = ' (gộp phần của máy và của git)'; conflict = ' (XUNG ĐỘT: máy và git cùng sửa, chưa gộp được)'; push = '' }

$diff = New-Object System.Collections.Generic.List[string]
$conflicts = New-Object System.Collections.Generic.List[string]
foreach ($dst in $map.Keys) {
    $src = $map[$dst]; $to = Join-Path $Bot $dst
    if (-not (Test-Path $src)) { Write-Warning "Không có $src"; continue }
    New-Item -ItemType Directory -Force $to | Out-Null
    if ($dst -eq 'claude\memory') {
        $names = @(@(Get-ChildItem $src -File) + @(Get-ChildItem $to -File) | Where-Object { Keep $_ } | ForEach-Object { $_.Name } | Sort-Object -Unique)
        foreach ($n in $names) {
            $act = Sync-MemoryFile $n $src $to $BaseDir (Split-Path $Bot -Parent) "bot/claude/memory/$n" ([bool]$Check)
            if ($act -eq 'same') { continue }
            $diff.Add("$dst\$n$($MemLabel[$act])")
            if ($act -eq 'conflict') { $conflicts.Add($n) }
        }
        continue
    }
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
foreach ($x in Get-ScheduledTask | Where-Object { $_.TaskName -like 'GenBid*' -and $_.TaskName -notin 'GenBid Bot', 'GenBid DieuPhoi Sync' -and $_.State -ne 'Disabled' }) {
    Write-Warning "Tác vụ Windows '$($x.TaskName)' không có trong Install-GenBidBot.ps1"
}

if ($diff.Count) { $diff | ForEach-Object { Write-Host "  $_" } } else { Write-Host 'Repo đã giống bản đang chạy.' }
if ($conflicts.Count) {
    Write-Warning ("Bộ nhớ XUNG ĐỘT ($($conflicts -join ', ')): tệp trên máy và tệp trong bot\claude\memory cùng được sửa, không ghi đè bên nào. " +
        "Sửa tay cho hai tệp GIỐNG NHAU (giữ phần của cả hai), rồi chạy lại script này.")
}
if ($Check) { exit [int]($diff.Count -gt 0) }
if ($conflicts.Count) { & git -C (Split-Path $Bot -Parent) status --short -- bot; exit 2 }
& git -C (Split-Path $Bot -Parent) status --short -- bot
