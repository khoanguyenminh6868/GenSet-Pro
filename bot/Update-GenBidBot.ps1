<#
Cập nhật bot GenBid trên máy này theo main mới nhất trên GitHub (skill update-bot, Khoa 16/11/2026):
  1. Kéo main về checkout chính $Root\GenSet-Pro (fast-forward, giữ nguyên nếu có tệp sửa dở cũng đổi trên GitHub).
  2. Chép bot\genbid-hsmt, skills Claude, tác vụ hsmt-worker từ repo sang chỗ bot chạy ($Root\genbid-hsmt, ~\.claude).
     Tệp trên máy khác repo mà KHÔNG phải một bản cũ đã có trong git = sửa tay chưa lên GitHub: giữ nguyên và báo
     (chạy Backup-GenBidBot.ps1 + PR trước), trừ khi -Force.
  3. Tác vụ "GenBid Bot" chạy code cũ (khởi động trước lần sửa .ps1 mới nhất) thì khởi động lại; đang có lượt con
     (-Job) chạy thì để yên và báo, trừ khi -Force.

  powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Projects\GenSet Pro\GenSet-Pro\bot\Update-GenBidBot.ps1"
  ... -Check       # chỉ xem: tụt bao nhiêu commit, tệp nào khác, bot có chạy code cũ không; không đổi gì
  ... -NoRestart   # cập nhật tệp nhưng không khởi động lại bot
Dòng cuối: "SUMMARY: ..." để skill đọc.
#>
param(
    [string]$Root = 'C:\Projects\GenSet Pro',
    [switch]$Check,
    [switch]$Force,
    [switch]$NoRestart,
    [switch]$Reexec   # nội bộ: lượt chạy lại bằng bản script vừa kéo về
)
$ErrorActionPreference = 'Stop'
$selfHash = (Get-FileHash $PSCommandPath).Hash
$Repo = Join-Path $Root 'GenSet-Pro'
$Kit = Join-Path $Root 'genbid-hsmt'
$Cl = Join-Path $env:USERPROFILE '.claude'
$notes = New-Object System.Collections.Generic.List[string]
function Step($m) { Write-Host "== $m" -ForegroundColor Cyan }
function G { $eap = $ErrorActionPreference; $ErrorActionPreference = 'Continue'; try { & git.exe -C $Repo -c core.quotepath=false @args 2>&1 | ForEach-Object { "$_" } } finally { $ErrorActionPreference = $eap } }

# ---------- 1. Kéo main ----------
Step "Kéo main -> $Repo"
$branch = (G rev-parse --abbrev-ref HEAD) | Select-Object -Last 1
if ($branch -ne 'main') { throw "Checkout chính $Repo đang ở nhánh '$branch', phải là main (CLAUDE.md). Không cập nhật." }
G fetch -q origin main | Out-Null
if ($LASTEXITCODE) { throw 'git fetch origin main lỗi (mạng?).' }
$old = (G rev-parse --short HEAD) | Select-Object -Last 1
$behind = [int]((G rev-list --count HEAD..origin/main) | Select-Object -Last 1)
$ahead = [int]((G rev-list --count origin/main..HEAD) | Select-Object -Last 1)
if ($ahead) { $notes.Add("main trên máy có $ahead commit chưa đẩy lên GitHub") }
if (-not $behind) { Write-Host "  Đã mới nhất ($old)." }
elseif ($Check) {
    Write-Host "  Tụt $behind commit so với origin/main. Tệp bot\ sẽ đổi khi kéo (bước 2 dưới đây so với bản hiện có trên máy):"
    G diff --name-only HEAD origin/main -- bot | ForEach-Object { Write-Host "    $_" }
}
else {
    $dirty = @(G status --porcelain --untracked-files=no | Where-Object { $_ } | ForEach-Object { $_.Substring(3) -replace '^.* -> ', '' })
    $theirs = @(G diff --name-only HEAD origin/main)
    $both = @($dirty | Where-Object { $theirs -contains $_ })
    if ($both) { throw "Chưa kéo được: tệp đang sửa dở trong $Repo cũng đổi trên GitHub: $($both -join ', ')" }
    G merge -q --ff-only --autostash origin/main | Where-Object { $_ -notmatch '^Updating files' } | ForEach-Object { Write-Host "  git: $_" }
    if ($LASTEXITCODE) { throw 'git merge --ff-only origin/main lỗi (xem dòng git ở trên).' }
    Write-Host "  $old -> $((G rev-parse --short HEAD) | Select-Object -Last 1) ($behind commit)."
    # Chính script này vừa đổi: chạy tiếp bằng bản mới (PowerShell đã nạp bản cũ vào bộ nhớ).
    if (-not $Reexec -and (Get-FileHash $PSCommandPath).Hash -ne $selfHash) {
        Write-Host '  Update-GenBidBot.ps1 vừa đổi: chạy tiếp bằng bản mới.'
        $a = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $PSCommandPath, '-Root', $Root, '-Reexec')
        if ($Force) { $a += '-Force' }; if ($NoRestart) { $a += '-NoRestart' }
        & powershell.exe @a
        exit $LASTEXITCODE
    }
}

# ---------- 2. Chép bot sang chỗ chạy ----------
Step 'Chép bot từ repo sang máy'
$Bot = Join-Path $Repo 'bot'
$map = [ordered]@{ 'genbid-hsmt' = $Kit; 'claude\scheduled-tasks\hsmt-worker' = Join-Path $Cl 'scheduled-tasks\hsmt-worker'
    # Bộ nhớ Claude: phiên trên máy khác sửa rồi Backup lên main; tệp máy này cũng sửa thì vào danh sách gộp tay.
    'claude\memory' = Join-Path $Cl ('projects\' + ($Root -replace '[:\\ ]', '-') + '\memory') }
# Mọi skill trong bot\claude\skills trừ hsmt (skill claude.ai, tải tay lên Settings > Skills).
foreach ($d in Get-ChildItem (Join-Path $Bot 'claude\skills') -Directory | Where-Object Name -ne 'hsmt') {
    $map["claude\skills\$($d.Name)"] = Join-Path $Cl "skills\$($d.Name)"
}
function Keep($f) { $f.Name -notmatch '^\.|\.bak|^New Text Document' }
function Same($a, $b) { (Test-Path $b) -and (Get-FileHash $a).Hash -eq (Get-FileHash $b).Hash }
# Bản trên máy từng có trong git ở đúng đường dẫn này (tức là bản cũ, không phải sửa tay)?
function InHistory([string]$rel, [string]$file) {
    $blob = (G hash-object "--path=$rel" $file) | Select-Object -Last 1
    [bool]((G log -1 --format=%h "--find-object=$blob" HEAD -- $rel) | Where-Object { $_ })
}
$updated = New-Object System.Collections.Generic.List[string]
$local = New-Object System.Collections.Generic.List[string]
foreach ($dst in $map.Keys) {
    $from = Join-Path $Bot $dst; $to = $map[$dst]
    if (-not (Test-Path $from)) { continue }
    if (-not $Check) { New-Item -ItemType Directory -Force $to | Out-Null }
    $want = @(Get-ChildItem $from -File | Where-Object { Keep $_ })
    foreach ($f in $want) {
        $t = Join-Path $to $f.Name; $rel = "bot/$($dst -replace '\\', '/')/$($f.Name)"
        if (Same $f.FullName $t) { continue }
        if ((Test-Path $t) -and -not $Force -and -not (InHistory $rel $t)) { $local.Add("$dst\$($f.Name)"); continue }
        $updated.Add("$dst\$($f.Name)")
        if (-not $Check) { Copy-Item $f.FullName $t -Force; (Get-Item $t).LastWriteTime = Get-Date }
    }
    # Tệp trên máy mà repo đã xoá (từng có trong git, bản trên máy là bản cũ): xoá, để Backup không đưa nó trở lại.
    if (Test-Path $to) {
        foreach ($g in @(Get-ChildItem $to -File | Where-Object { (Keep $_) -and $want.Name -notcontains $_.Name })) {
            $rel = "bot/$($dst -replace '\\', '/')/$($g.Name)"
            if (-not ((G log -1 --format=%h HEAD -- $rel) | Where-Object { $_ })) { continue }   # chưa từng có trong git: tệp riêng của máy
            if (-not $Force -and -not (InHistory $rel $g.FullName)) { $local.Add("$dst\$($g.Name) (repo đã xoá, máy có sửa)"); continue }
            $updated.Add("$dst\$($g.Name) (xoá)")
            if (-not $Check) { Remove-Item $g.FullName -Force }
        }
    }
}
# Bản gốc của bộ nhớ cho Backup-GenBidBot.ps1 (gộp ba bản, Khoa 17/11/2026): tệp bộ nhớ nào trên máy đang GIỐNG repo
# thì bản đó là bản gốc của lần đồng bộ này. Tệp máy có sửa tay (danh sách $local) giữ bản gốc cũ, để Backup gộp được.
if (-not $Check) {
    $memRepo = Join-Path $Bot 'claude\memory'; $memLocal = $map['claude\memory']; $memBase = Join-Path $Root 'genbid-work\memory-base'
    if (Test-Path $memRepo) {
        New-Item -ItemType Directory -Force $memBase | Out-Null
        foreach ($f in @(Get-ChildItem $memRepo -File | Where-Object { Keep $_ })) {
            if (Same $f.FullName (Join-Path $memLocal $f.Name)) { Copy-Item $f.FullName (Join-Path $memBase $f.Name) -Force }
        }
    }
}
$updated | ForEach-Object { Write-Host "  $(if ($Check) { 'sẽ cập nhật' } else { 'cập nhật' }): $_" }
if ($local.Count) {
    Write-Warning "Tệp trên máy sửa tay, chưa có trên GitHub (giữ nguyên; chạy Backup-GenBidBot.ps1 + PR, hoặc -Force để ghi đè):"
    $local | ForEach-Object { Write-Host "  $_" }
    $notes.Add("$($local.Count) tệp sửa tay chưa lên GitHub: $($local -join ', ')")
}
if (-not $updated.Count) { Write-Host '  Bot trên máy đã giống repo.' }

if (-not $Check) {
    $hw = Join-Path $Kit 'hsmt-worker.md'; $hw2 = Join-Path $Root '.hsmt-worker.md'
    if ((Test-Path $hw) -and -not (Same $hw $hw2)) { Copy-Item $hw $hw2 -Force; Write-Host '  cập nhật: .hsmt-worker.md' }
    $cm = Join-Path $Repo 'CLAUDE.md'; $cm2 = Join-Path $Root 'CLAUDE.md'
    if (-not (Same $cm $cm2)) { Copy-Item $cm $cm2 -Force; Write-Host '  cập nhật: CLAUDE.md gốc' }
    if (@($updated | Where-Object { $_ -match '^genbid-hsmt\\package(-lock)?\.json' }).Count) {
        Step "npm ci ($Kit)"
        if (-not $env:PLAYWRIGHT_BROWSERS_PATH) { $env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $Root '.ms-playwright' }
        Push-Location $Kit
        try { & npm ci --no-audit --no-fund; if ($LASTEXITCODE) { $notes.Add('npm ci lỗi') } } finally { Pop-Location }
    }
    if (@($updated | Where-Object { $_ -match '^claude\\|^genbid-hsmt\\Install' }).Count) {
        $notes.Add('skill/tác vụ Claude đổi: phiên Claude đang mở cần mở lại mới thấy')
    }
}

# ---------- 3. Bot có chạy code cũ không ----------
Step "Tác vụ 'GenBid Bot'"
$task = Get-ScheduledTask 'GenBid Bot' -ErrorAction SilentlyContinue
$procs = @(Get-CimInstance Win32_Process -Filter "Name='powershell.exe' OR Name='pwsh.exe'" | Where-Object { $_.CommandLine -match 'GenBid-Bot\.ps1' })
$disp = @($procs | Where-Object { $_.CommandLine -notmatch '\s-Job\b' })
$kids = @($procs | Where-Object { $_.CommandLine -match '\s-Job\b' })
# Chỉ GenBid-Bot.ps1 nạp một lần; các .ps1 khác (Post-GenBidDocs, Sync-DieuPhoi...) chạy tiến trình mới mỗi lần gọi.
$code = Get-Item (Join-Path $Kit 'GenBid-Bot.ps1') -ErrorAction SilentlyContinue
$restart = 'không'
# Tác vụ kiểu cũ (powershell.exe trực tiếp): nháy cửa sổ, và Start-ScheduledTask từ phiên Claude từng treo (17/11/2026) → conhost --headless.
if ($task -and -not $Check -and $task.Actions[0].Execute -ne 'conhost.exe') {
    $act = New-ScheduledTaskAction -Execute 'conhost.exe' -WorkingDirectory $Root `
        -Argument "--headless powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$Kit\GenBid-Bot.ps1`""
    # Tác vụ tạo bằng quyền admin (Install chạy admin) thì người thường sửa bị "Access is denied" (17/11/2026).
    try {
        Set-ScheduledTask -TaskName 'GenBid Bot' -Action $act -ErrorAction Stop | Out-Null
        $task = Get-ScheduledTask 'GenBid Bot'
        $notes.Add("đã sửa tác vụ 'GenBid Bot' chạy qua conhost --headless (không nháy cửa sổ)")
    } catch {
        $notes.Add("tác vụ 'GenBid Bot' còn kiểu cũ, sửa cần quyền admin: Khoa chạy powershell -NoProfile -ExecutionPolicy Bypass -File `"$Repo\bot\Repair-GenBidBotTask.ps1`" (bấm Yes ở UAC; script tự bật lại bot qua tác vụ)")
    }
}
# Bot bật ngoài tác vụ (cha không phải conhost của tác vụ, vd. Start-Process từ phiên Claude): End tác vụ không tắt được nó.
$outside = @($disp | Where-Object { (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.ParentProcessId)" -ErrorAction SilentlyContinue).Name -notin 'conhost.exe', 'svchost.exe' })  # svchost: tác vụ kiểu cũ
if ($outside.Count) { $notes.Add("bot đang chạy NGOÀI tác vụ (PID $($outside.ProcessId -join ', ')): cần khởi động lại qua tác vụ") }
if (-not $task) { $notes.Add("máy này chưa có tác vụ 'GenBid Bot' (Install-GenBidBot.ps1)"); $restart = 'không có tác vụ' }
elseif ($task.State -eq 'Disabled') { $notes.Add("tác vụ 'GenBid Bot' đang tắt (Disabled) trên máy này: không đụng tới"); $restart = 'tác vụ tắt' }
elseif (-not $disp.Count) { $notes.Add("bot không chạy (tác vụ $($task.State)); bật: Start-ScheduledTask 'GenBid Bot'"); $restart = 'bot không chạy' }
else {
    $started = ($disp | Sort-Object CreationDate | Select-Object -First 1).CreationDate
    $stale = ($code -and $code.LastWriteTime -gt $started) -or $outside.Count
    Write-Host "  Bot chạy từ $($started.ToString('dd/MM HH:mm:ss')); script mới nhất $($code.Name) sửa lúc $($code.LastWriteTime.ToString('dd/MM HH:mm:ss'))."
    if (-not $stale) { Write-Host '  Bot đang chạy code mới nhất.'; $restart = 'không cần' }
    elseif ($Check) { Write-Host '  Bot chạy code cũ: cần khởi động lại.'; $restart = 'cần (đang -Check)' }
    elseif ($NoRestart) { $restart = 'cần nhưng -NoRestart' }
    elseif ($kids.Count -and -not $Force) {
        Write-Warning "$($kids.Count) lượt con đang chạy: chưa khởi động lại (chạy lại sau, hoặc -Force)."
        $restart = "hoãn, $($kids.Count) lượt con đang chạy"
    } else {
        Stop-ScheduledTask 'GenBid Bot'
        for ($i = 0; $i -lt 30 -and (Get-Process -Id $disp.ProcessId -ErrorAction SilentlyContinue); $i++) { Start-Sleep 1 }
        Get-Process -Id $disp.ProcessId -ErrorAction SilentlyContinue | Stop-Process -Force
        $at = Get-Date
        Start-ScheduledTask 'GenBid Bot'
        # Chỉ coi là đã chạy khi log ghi "Bot GenBid bắt đầu" sau lúc bật: 17/11/2026 tiến trình có mà treo, không chạy dòng nào.
        # Không thấy thì báo, KHÔNG tự bật bằng Start-Process (bot ngoài tác vụ: End không tắt được, Khoa tưởng đã tắt).
        $ok = $false
        for ($i = 0; $i -lt 45 -and -not $ok; $i++) {
            Start-Sleep 1
            $lg = Join-Path $Root ('genbid-bot-logs\bot-{0:yyyy-MM}.log' -f $at)
            $ok = [bool](Get-Content $lg -Tail 30 -Encoding UTF8 -ErrorAction SilentlyContinue | Where-Object {
                $_ -match '^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d)\s+Bot GenBid bắt đầu' -and [datetime]$Matches[1] -ge $at.AddSeconds(-1) })
        }
        if ($ok) { Write-Host '  Đã khởi động lại qua tác vụ (log ghi "Bot GenBid bắt đầu").'; $restart = 'đã khởi động lại' }
        else { $notes.Add("đã Start-ScheduledTask nhưng 45 giây chưa thấy log 'Bot GenBid bắt đầu': bot có thể treo lúc mở; xem $Root\genbid-bot-logs, báo Khoa, KHÔNG bật bằng Start-Process"); $restart = 'lỗi khởi động lại' }
    }
}
# config-bot.mjs run (suppliers\ của repo) chạy tiến trình mới mỗi lượt: lượt đang chạy giữ code cũ tới khi thoát.
$sup = Get-ChildItem (Join-Path $Repo 'suppliers') -File | Where-Object { $_.Extension -in '.mjs', '.js' } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$oldCfg = @(Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -match 'config-bot\.mjs' -and $sup -and $_.CreationDate -lt $sup.LastWriteTime })
if ($oldCfg.Count) { $notes.Add("config-bot.mjs đang chạy code suppliers cũ (PID $($oldCfg.ProcessId -join ', ')); lượt sau tự dùng code mới") }

# ---------- 4. Sổ điều phối ----------
# Đồng bộ sổ giữa các máy (nhánh dieu-phoi) và tạo tác vụ "GenBid DieuPhoi Sync" nếu máy chưa có.
$dp = 'chưa chạy'
$sync = Join-Path $Kit 'Sync-DieuPhoi.ps1'
if ($Check) { $dp = 'bỏ qua (-Check)' }
elseif (Test-Path $sync) {
    Step 'Sổ điều phối'
    $o = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $sync -Root $Root -EnsureTask 2>&1 | ForEach-Object { "$_" }
    $o | Where-Object { $_ -notmatch '^SUMMARY:' } | ForEach-Object { Write-Host "  $_" }
    $dp = (($o | Where-Object { $_ -match '^SUMMARY:' } | Select-Object -Last 1) -replace '^SUMMARY: sổ điều phối \S+ - ', '')
    if ($LASTEXITCODE) { $notes.Add("sổ điều phối: $dp") }
}

$head = (G rev-parse --short HEAD) | Select-Object -Last 1
$s = "SUMMARY: main $(if ($Check -and $behind) { "$old, tụt $behind commit" } elseif ($behind) { "$old -> $head" } else { "$head (đã mới)" }); " +
     "$($updated.Count) tệp bot $(if ($Check) { 'sẽ ' })cập nhật; khởi động lại: $restart; sổ điều phối: $dp"
if ($notes.Count) { $s += '; lưu ý: ' + ($notes -join '; ') }
Write-Host $s
