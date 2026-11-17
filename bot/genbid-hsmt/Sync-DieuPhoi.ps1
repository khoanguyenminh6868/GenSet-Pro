<#
Đồng bộ sổ điều phối (C:\Projects\GenSet Pro\genbid-work\dieu-phoi\) giữa các máy qua nhánh git "dieu-phoi" của repo
GenSet-Pro (Khoa 16/11/2026: sổ phải giống nhau trên mọi máy để không sót việc). Thư mục đó là một clone riêng của nhánh;
commit + push thẳng, không PR (Vercel bỏ qua nhánh không phải production, CI chỉ chạy trên main).

  powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Projects\GenSet Pro\genbid-hsmt\Sync-DieuPhoi.ps1"
  ... -EnsureTask   # đồng thời tạo tác vụ Windows "GenBid DieuPhoi Sync" (mỗi 15 phút và lúc đăng nhập) nếu chưa có
  ... -Quiet        # cho tác vụ: chỉ ghi log genbid-bot-logs\dieu-phoi-sync.log

Mỗi lượt: commit thay đổi trên máy -> fetch -> merge origin/dieu-phoi -> push. Hai máy sửa cùng chỗ thì merge để lại dấu
xung đột (<<<<<<<): script dừng, báo tên tệp, các lượt sau không commit gì cho tới khi gỡ dấu (Claude gộp tay rồi chạy lại).
Máy mới vào lần đầu: tệp trên máy khác bản trên GitHub được đổi tên <tên>.ban-<MÁY>.<đuôi> để gộp tay, không mất.
Dòng cuối: "SUMMARY: ...".
#>
param(
    [string]$Root = 'C:\Projects\GenSet Pro',
    [switch]$EnsureTask,
    [switch]$Quiet,
    [string]$Url = 'https://github.com/khoanguyenminh6868/GenSet-Pro.git',   # khác chỉ để thử
    [string]$Machine = $env:COMPUTERNAME
)
$ErrorActionPreference = 'Stop'
$Dir = Join-Path $Root 'genbid-work\dieu-phoi'
$Br = 'dieu-phoi'
$Me = $Machine
$Log = Join-Path $Root 'genbid-bot-logs\dieu-phoi-sync.log'
$TaskName = 'GenBid DieuPhoi Sync'
function Say($m) {
    if (-not $Quiet) { Write-Host $m }
    try {
        New-Item -ItemType Directory -Force (Split-Path $Log) | Out-Null
        if ((Test-Path $Log) -and (Get-Item $Log).Length -gt 300KB) { Move-Item $Log "$Log.old" -Force }
        Add-Content $Log ("{0:dd/MM HH:mm:ss} {1}" -f (Get-Date), $m) -Encoding UTF8
    } catch {}
}
function G {
    $eap = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
    try { & git.exe -C $Dir -c core.quotepath=false @args 2>&1 | ForEach-Object { "$_" } } finally { $ErrorActionPreference = $eap }
}
function Conflicted { @(Get-ChildItem $Dir -Recurse -File -Include *.md, *.txt, *.json, *.csv -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '\\\.git\\' -and (Select-String -Path $_.FullName -Pattern '^<<<<<<< ' -Quiet) } |
    ForEach-Object { $_.FullName.Substring($Dir.Length + 1) }) }

# conhost --headless: powershell -WindowStyle Hidden vẫn nháy cửa sổ console mỗi lần chạy (Khoa 17/11/2026 không muốn thấy).
$act = New-ScheduledTaskAction -Execute 'conhost.exe' -WorkingDirectory $Root `
    -Argument "--headless powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$PSCommandPath`" -Quiet"
$old = if ($EnsureTask) { Get-ScheduledTask $TaskName -ErrorAction SilentlyContinue }
if ($old -and $old.Actions[0].Execute -ne 'conhost.exe') {
    Set-ScheduledTask -TaskName $TaskName -Action $act | Out-Null
    Say "Đã sửa tác vụ Windows '$TaskName' chạy ẩn hẳn (conhost --headless)."
}
if ($EnsureTask -and -not $old) {
    $t1 = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 15)
    $t2 = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"
    $set = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable `
        -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 10)
    $pri = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive
    Register-ScheduledTask -TaskName $TaskName -Action $act -Trigger $t1, $t2 -Settings $set -Principal $pri -Force | Out-Null
    Say "Đã tạo tác vụ Windows '$TaskName' (mỗi 15 phút)."
}

$mx = New-Object Threading.Mutex($false, 'Global\GenBidDieuPhoi')
if (-not $mx.WaitOne(120000)) { Say 'SUMMARY: bỏ lượt, đang có lượt đồng bộ khác'; exit 3 }
$script:state = ''
function Sync {
    New-Item -ItemType Directory -Force $Dir | Out-Null
    $renamed = New-Object System.Collections.Generic.List[string]
    if (-not (Test-Path (Join-Path $Dir '.git'))) {
        # Lần đầu trên máy này.
        G init -q | Out-Null
        G remote add origin $Url | Out-Null
        $repo = Join-Path $Root 'GenSet-Pro'
        foreach ($k in 'user.name', 'user.email') {
            if (-not (Test-Path (Join-Path $repo '.git'))) { break }
            $v = try { & git.exe -C $repo config $k } catch { $null }
            if ($v) { G config $k $v | Out-Null }
        }
        if (-not ((G config user.email) | Where-Object { $_ })) {
            G config user.name "GenBid $Me" | Out-Null; G config user.email 'genbid-bot@users.noreply.github.com' | Out-Null
        }
        G fetch -q origin $Br | Out-Null
        if (-not $LASTEXITCODE) {
            # Nhánh đã có trên GitHub: giữ bản GitHub, tệp trên máy khác thì đổi tên để gộp tay.
            foreach ($rel in @(G ls-tree -r --name-only "origin/$Br")) {
                $p = Join-Path $Dir ($rel -replace '/', '\')
                if (-not (Test-Path $p)) { continue }
                $blob = (G rev-parse "origin/${Br}:$rel") | Select-Object -Last 1
                if (((G hash-object $p) | Select-Object -Last 1) -eq $blob) { continue }
                $f = Get-Item $p
                $new = "$($f.BaseName).ban-$Me$($f.Extension)"
                Rename-Item $p $new
                $renamed.Add("$rel -> $new")
            }
            G checkout -q -f -B $Br "origin/$Br" | Out-Null
            if ($LASTEXITCODE) { throw "Không checkout được origin/$Br trong $Dir" }
        } else {
            G checkout -q -b $Br | Out-Null   # máy đầu tiên: nhánh tạo từ tệp trên máy
        }
    }
    # Đang dở một lần merge có xung đột.
    $left = Conflicted
    if ($left.Count) { $script:state = "CÒN DẤU XUNG ĐỘT, gộp tay rồi chạy lại: $($left -join ', ')"; return }
    if (Test-Path (Join-Path $Dir '.git\MERGE_HEAD')) { G add -A | Out-Null; G commit -q --no-edit | Out-Null }

    # Tệp lớn (> 20 MB) không lên git (GitHub chặn 100 MB): ghi vào .gitignore.
    $gi = Join-Path $Dir '.gitignore'
    $ign = @(if (Test-Path $gi) { Get-Content $gi -Encoding UTF8 })
    $big = @(Get-ChildItem $Dir -Recurse -File | Where-Object { $_.Length -gt 20MB -and $_.FullName -notmatch '\\\.git\\' } |
        ForEach-Object { '/' + ($_.FullName.Substring($Dir.Length + 1) -replace '\\', '/') } | Where-Object { $ign -notcontains $_ })
    if ($big.Count) { Add-Content $gi $big -Encoding UTF8; Say "Bỏ qua tệp lớn: $($big -join ', ')" }

    G add -A | Out-Null
    $changed = @(G status --porcelain | Where-Object { $_ })
    if ($changed.Count) {
        $o = G commit -q -m "Sổ điều phối: $Me $(Get-Date -Format 'dd/MM HH:mm') ($($changed.Count) tệp)"
        if ($LASTEXITCODE) { $script:state = "lỗi commit: $(($o | Select-Object -Last 1))"; return }
    }

    $pulled = 0
    for ($try = 1; $try -le 3; $try++) {
        G fetch -q origin $Br | Out-Null
        $hasRemote = -not $LASTEXITCODE
        if ($hasRemote) {
            $pulled += [int]((G rev-list --count "HEAD..origin/$Br") | Select-Object -Last 1)
            G merge -q --no-edit "origin/$Br" | Out-Null
            if ($LASTEXITCODE) {
                $c = @(G diff --name-only --diff-filter=U)
                $script:state = "XUNG ĐỘT khi gộp với máy khác, gộp tay (bỏ dấu <<<<<<< ======= >>>>>>>) rồi chạy lại: $($c -join ', ')"
                return
            }
        }
        if (-not $hasRemote -or [int]((G rev-list --count "origin/$Br..HEAD") | Select-Object -Last 1)) {
            G push -q -u origin $Br | Out-Null
            if ($LASTEXITCODE) { Start-Sleep 3; continue }   # máy khác vừa đẩy: kéo về rồi thử lại
        }
        break
    }
    if ($try -gt 3) { $script:state = 'push lỗi 3 lần (mạng? quyền GitHub?)'; return }
    $script:state = "đẩy $($changed.Count) tệp, kéo $pulled commit từ máy khác"
    if ($renamed.Count) { $script:state += "; tệp trên máy khác bản GitHub đã đổi tên, cần gộp tay: $($renamed -join '; ')" }
}
try { Sync | Out-Null } catch { $script:state = "lỗi: $($_.Exception.Message)" } finally { $mx.ReleaseMutex() }
Say "SUMMARY: sổ điều phối $Me - $script:state"
if ($script:state -match 'XUNG ĐỘT|DẤU XUNG|lỗi') { exit 1 }
