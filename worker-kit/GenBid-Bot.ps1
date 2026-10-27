<#
Bot cục bộ của GenBid trên máy Windows: quét liên tục yêu cầu từ bản web (lấy tệp, Phân tích, Sync, ...).
Việc quét chỉ là một lệnh HTTP tới /api/requests?kind=all, không gọi Claude, nên không tốn token.
Từ 2026-10-26 (Khoa): Sync và Lấy tệp chạy bằng code (genbid-sync.js, Playwright), không gọi Claude.
Chỉ Phân tích, Đối chiếu, Tạo bản tiếng Anh và Tạo HSDT tham khảo gọi Claude Code; dữ liệu được chuẩn bị sẵn
(genbid-sync.js prep: bỏ các chương mẫu, gom chữ HSDT), Claude chỉ ghi result.json, rồi bot tự gửi lên web
(genbid-sync.js finish). Claude chạy với bộ công cụ tối thiểu (không MCP, không skill, không Chrome).

Chống chạy thừa (tốn token):
- Mỗi yêu cầu (key|requestedAt) chỉ giao cho worker một lần. Lượt nào không trả lời được yêu cầu thì bot
  gửi lỗi về web (hsmtreq/analysisreq/syncreq có doneAt và error), để trang thôi hiện "đang xử lý".
- Không chạy khi worker đang chạy (tệp .hsmt-worker.lock còn mới, kể cả lượt 10:00/15:00 của app).
- Hai lượt bot cách nhau ít nhất -MinGapMinutes phút.

Cần tệp C:\Projects\GenSet Pro\.claude-bot-token chứa token do `claude setup-token` tạo
(Khoa tự tạo, không ai khác nhập). Thiếu token thì bot chỉ ghi log và chờ, không chạy gì.
Không in token ra màn hình hay log.
#>
param(
    [int]$PollSeconds = 15,
    # Model (Khoa, 2026-10-23): chỉ có yêu cầu dịch thì Sonnet; có Phân tích, Đối chiếu hay HSDT tham khảo thì Opus,
    # vì các việc đó cần đọc kỹ và suy luận.
    [string]$LightModel = 'sonnet',
    [string]$DeepModel = 'opus',
    # Chờ thêm chừng này giây trước một lượt để gộp các yêu cầu bấm gần nhau.
    [int]$GatherSeconds = 8,
    [int]$MinGapMinutes = 1,
    [int]$RunTimeoutMinutes = 180,
    [int]$LimitPauseMinutes = 30,
    [string]$Root = 'C:\Projects\GenSet Pro',
    [string]$Endpoint = 'https://genset-pro-web.vercel.app/api/requests?kind=all',
    # Sync theo lịch (thay tác vụ hẹn giờ "hsmt-worker" của app Claude, Khoa 2026-10-26): bot tự chạy genbid-sync.js,
    # không mở phiên Claude. 10:00 và 15:00 các ngày trong tuần (Khoa, 2026-10-26). Máy tắt lúc đó thì chạy một lần
    # khi bật lại (bù cho mốc gần nhất đã qua trong ngày).
    [string[]]$ScheduleDays = @('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'),
    [string[]]$ScheduleTimes = @('10:00', '15:00'),
    [switch]$Once
)

$ErrorActionPreference = 'Stop'
# genbid-sync.js in UTF-8: đọc đúng tiếng Việt từ đầu ra của nó.
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch {}
$IngestTokenFile = Join-Path $Root '.genbid-ingest-token'
$ClaudeTokenFile = Join-Path $Root '.claude-bot-token'
$StateFile = Join-Path $Root '.genbid-bot-state.json'
$WorkerState = Join-Path $Root '.hsmt-worker-state.json'
$LockFile = Join-Path $Root '.hsmt-worker.lock'
$RunFile = Join-Path $Root '.genbid-bot-run.json'
# Tạm dừng vì hết hạn mức, nhớ qua các lần khởi động lại bot.
$PauseFile = Join-Path $Root '.genbid-bot-pause.json'
$ScheduleFile = Join-Path $Root '.genbid-bot-schedule.json'
$LogDir = Join-Path $Root 'genbid-bot-logs'
New-Item -ItemType Directory -Force $LogDir | Out-Null
$Utf8 = New-Object Text.UTF8Encoding $false

function Log([string]$msg) {
    $line = "{0:yyyy-MM-dd HH:mm:ss}  {1}" -f (Get-Date), $msg
    Write-Host $line
    [IO.File]::AppendAllText((Join-Path $LogDir ("bot-{0:yyyy-MM}.log" -f (Get-Date))), $line + "`r`n", $Utf8)
}

function Read-Json([string]$path, $default) {
    if (-not (Test-Path $path)) { return $default }
    try { return [IO.File]::ReadAllText($path, $Utf8) | ConvertFrom-Json } catch { return $default }
}

# Claude Code: `claude` trên PATH, nếu không có thì bản đi kèm app Claude (thư mục đổi theo phiên bản).
function Find-Claude {
    $cmd = Get-Command claude.exe -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $base = Join-Path $env:LOCALAPPDATA 'Claude-Data'
    if (-not (Test-Path $base)) { return $null }
    Get-ChildItem $base -Recurse -Filter claude.exe -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -match '\\claude-code\\' } |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName
}

# Mỗi lần hỏi cũng là nhịp tim cho bản web (botstatus/current), để web biết máy Windows đang bật.
function Get-Pending([switch]$Running) {
    $token = (Get-Content $IngestTokenFile -TotalCount 1).Trim()
    $url = $Endpoint + $(if ($Running) { '&running=1' })
    $r = Invoke-WebRequest $url -Headers @{ Authorization = "Bearer $token" } -UseBasicParsing -TimeoutSec 60
    [Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray()) | ConvertFrom-Json
}

# Các yêu cầu đang chờ, theo chữ ký -> tài liệu sẽ gửi lại web nếu lượt worker không trả lời được.
# Yêu cầu lấy tệp worker đã làm (state file) thì bỏ qua.
function Get-Requests($p) {
    $done = @((Read-Json $WorkerState ([pscustomobject]@{ done = @() })).done)
    $reqs = [ordered]@{}
    foreach ($f in @($p.files)) {
        if ($f -and $done -notcontains "$($f.key)|$($f.requestedAt)") {
            $reqs["files:$($f.key)|$($f.requestedAt)"] = @{ coll = 'hsmtreq'; id = $f.key; data = [ordered]@{ notifyNo = $f.notifyNo; sourceUrl = $f.sourceUrl; bidName = $f.bidName; requestedAt = $f.requestedAt } }
        }
    }
    foreach ($a in @($p.analysis)) {
        if ($a) { $reqs["analysis:$($a.key)|$($a.requestedAt)"] = @{ coll = 'analysisreq'; id = $a.key; data = [ordered]@{ notifyNo = $a.notifyNo; requestedAt = $a.requestedAt } } }
    }
    foreach ($x in @($p.translation)) { if ($x) { $reqs["translation:$($x.key)|$($x.requestedAt)"] = @{ coll = 'translationreq'; id = $x.key; data = [ordered]@{ notifyNo = $x.notifyNo; requestedAt = $x.requestedAt } } } }
    foreach ($x in @($p.compare)) { if ($x) { $reqs["compare:$($x.key)|$($x.requestedAt)"] = @{ coll = 'comparereq'; id = $x.key; data = [ordered]@{ notifyNo = $x.notifyNo; requestedAt = $x.requestedAt } } } }
    foreach ($x in @($p.hsdt)) { if ($x) { $reqs["hsdt:$($x.key)|$($x.requestedAt)"] = @{ coll = 'hsdtreq'; id = $x.key; data = [ordered]@{ notifyNo = $x.notifyNo; requestedAt = $x.requestedAt } } } }
    if ($p.sync.pending) { $reqs["sync:$($p.sync.requestedAt)"] = @{ coll = 'syncreq'; id = 'current'; data = [ordered]@{ requestedAt = $p.sync.requestedAt; from = 'web' } } }
    return $reqs
}

# Sau một lượt: yêu cầu nào vẫn chờ thì báo lỗi về web, để trang thôi hiện "đang xử lý".
function Send-Unanswered($handedReqs, [string]$reason) {
    $still = Get-Requests (Get-Pending)
    $dir = Join-Path $LogDir ('post-' + (Get-Date -Format 'yyyyMMddHHmmss'))
    $n = 0
    foreach ($sig in $handedReqs.Keys) {
        if (-not $still.Contains($sig)) { continue }
        $r = $handedReqs[$sig]
        $doc = [ordered]@{}; foreach ($k in $r.data.Keys) { $doc[$k] = $r.data[$k] }
        $doc.doneAt = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
        $doc.error = $reason
        New-Item -ItemType Directory -Force (Join-Path $dir $r.coll) | Out-Null
        [IO.File]::WriteAllText((Join-Path $dir "$($r.coll)\$($r.id).json"), ($doc | ConvertTo-Json -Depth 8), $Utf8)
        $n++
    }
    if (-not $n) { return }
    Log "Báo lỗi về web cho $n yêu cầu chưa được xử lý: $reason"
    & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'Post-GenBidDocs.ps1') -Dir $dir | ForEach-Object { Log "  $_" }
    Remove-Item -Recurse -Force $dir -ErrorAction SilentlyContinue
}

function Test-ClaudeLogin { Test-Path (Join-Path $env:USERPROFILE '.claude\.credentials.json') }

function Test-WorkerRunning {
    if (-not (Test-Path $LockFile)) { return $false }
    $age = (Get-Date) - (Get-Item $LockFile).LastWriteTime
    if ($age.TotalMinutes -lt $RunTimeoutMinutes) { return $true }
    Log "Bỏ tệp khoá cũ ($([int]$age.TotalMinutes) phút)."
    Remove-Item $LockFile -Force -ErrorAction SilentlyContinue
    return $false
}

$SyncJs = Join-Path $PSScriptRoot 'genbid-sync.js'
function Find-Node {
    $cmd = Get-Command node.exe -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    @("$env:ProgramFiles\nodejs\node.exe", "$env:LOCALAPPDATA\Programs\nodejs\node.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
}

# Khởi động một tiến trình của lượt (script hay Claude), ghi lại để Resume-Worker theo dõi tiếp nếu bot bị tắt giữa chừng,
# rồi chờ nó xong (vẫn gửi nhịp tim cho web). Trả lý do để báo về web cho các yêu cầu chưa được trả lời.
function Start-Run([string]$exe, [string[]]$argList, [string]$stdin, [string[]]$sigs, [string]$out) {
    $sp = @{ FilePath = $exe; WorkingDirectory = $Root; NoNewWindow = $true; PassThru = $true; ArgumentList = $argList; RedirectStandardOutput = $out; RedirectStandardError = "$out.err" }
    if ($stdin) { $sp.RedirectStandardInput = $stdin }
    $p = Start-Process @sp
    $null = $p.Handle  # giữ handle để đọc được ExitCode khi tiến trình kết thúc
    [IO.File]::WriteAllText($RunFile, ([ordered]@{ pid = $p.Id; started = $p.StartTime.ToString('o'); out = $out; sigs = @($sigs) } | ConvertTo-Json), $Utf8)
    try { return Wait-Worker $p $out } finally { Remove-Item $RunFile -Force -ErrorAction SilentlyContinue }
}

# Sync và Lấy tệp: genbid-sync.js làm bằng code (tìm thầu, thông báo mời thầu, tải tệp, nhà thầu), không gọi Claude.
function Invoke-Script([string]$verb, [string[]]$extra, [string[]]$sigs) {
    $node = Find-Node
    if (-not $node) { Log 'Không tìm thấy Node.js (node.exe).'; return 'Máy Windows thiếu Node.js để chạy lượt tự động.' }
    $out = Join-Path $LogDir "run-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
    Log "Chạy script $verb (không dùng AI): $($sigs -join ', ')  (log: $out)"
    $reason = Start-Run $node (@("`"$SyncJs`"", $verb) + $extra) $null $sigs $out
    $sum = (Get-Content $out -Encoding UTF8 -ErrorAction SilentlyContinue | Where-Object { $_ -like 'SUMMARY: *' } | Select-Object -Last 1) -replace '^SUMMARY: ', ''
    if ($sum) { Log "  $sum" }
    if ($sum) { return "Lượt tự động chưa xử lý được yêu cầu này: $sum" }
    return $reason
}

# Chạy genbid-sync.js và chờ, trả các dòng nó in ra (stderr nối vào; lỗi của node không dừng bot).
function Invoke-Node {
    $eap = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
    try { & (Find-Node) $SyncJs @args 2>&1 | ForEach-Object { "$_" } } finally { $ErrorActionPreference = $eap }
}

# Phân tích, Đối chiếu, Tạo bản tiếng Anh, Tạo HSDT tham khảo: chuẩn bị dữ liệu bằng code, Claude chỉ đọc và ghi kết quả,
# rồi bot gửi kết quả lên web bằng code.
function Invoke-Worker([string[]]$sigs) {
    $claude = Find-Claude
    if (-not $claude) { Log 'Không tìm thấy Claude Code (claude.exe).'; return 'Agent chưa sẵn sàng (thiếu chương trình chạy worker).' }
    $node = Find-Node
    if (-not $node) { Log 'Không tìm thấy Node.js (node.exe).'; return 'Máy Windows thiếu Node.js để chuẩn bị dữ liệu.' }
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $out = Join-Path $LogDir "run-$stamp.log"
    $work = Join-Path $Root "genbid-work\ai-$stamp"
    Log "Chuẩn bị dữ liệu: $($sigs -join ', ')"
    $prep = Invoke-Node prep --sigs ($sigs -join ',') --out $work
    $prep | ForEach-Object { Log "  $_" }
    $dirs = @(Get-ChildItem $work -Directory -ErrorAction SilentlyContinue | ForEach-Object { $_.FullName })
    if (-not $dirs.Count) { return 'Không chuẩn bị được dữ liệu cho yêu cầu này (không đọc được bản web).' }
    # Ưu tiên đăng nhập đầy đủ của Claude Code (/login). Token setup-token chỉ dùng khi chưa đăng nhập; nó chỉ nằm
    # trong biến môi trường của các tiến trình con, bỏ ngay sau lượt.
    if (-not (Test-ClaudeLogin)) { $env:CLAUDE_CODE_OAUTH_TOKEN = (Get-Content $ClaudeTokenFile -TotalCount 1).Trim() }
    $env:GENBID_CLAUDE = $claude
    try {
        # 1. Mỗi yêu cầu một lần gọi (dữ liệu + prompt vào, JSON ra, không công cụ), tối đa 3 yêu cầu cùng lúc.
        Log "Gọi Claude một lần cho mỗi yêu cầu ($DeepModel; dịch: $LightModel): $($sigs -join ', ')  (log: $out)"
        $reason = Start-Run $node @("`"$SyncJs`"", 'ask', '--dir', "`"$work`"", '--model', $DeepModel, '--light', $LightModel) $null $sigs $out
        (Get-Content $out -Encoding UTF8 -ErrorAction SilentlyContinue) | Where-Object { $_ -match '^\s+\S' } | ForEach-Object { Log $_ }
        # 2. Agent chỉ cho các yêu cầu cần xem trang (PDF scan, HSDT chưa đọc được chữ) hoặc trả lời một lần không được.
        $dirs = @($dirs | Where-Object { Test-Path (Join-Path $_ 'AGENT') })
        if ($dirs.Count -and -not ($script:PauseUntil -gt (Get-Date))) { $reason = Invoke-Agent $claude $dirs $sigs $stamp }
    } finally {
        Remove-Item Env:CLAUDE_CODE_OAUTH_TOKEN, Env:GENBID_CLAUDE -ErrorAction SilentlyContinue
        # Gửi kết quả (hoặc lỗi trong error.txt) lên web và xoá thư mục (HSDT là tài liệu riêng của công ty).
        Invoke-Node finish --dir $work | ForEach-Object { Log "  $_" }
    }
    return $reason
}

function Invoke-Agent([string]$claude, [string[]]$dirs, [string[]]$sigs, [string]$stamp) {
    $out = Join-Path $LogDir "run-$stamp-agent.log"
    $prompt = @"
Bot GenBid giao các việc sau. Mỗi việc một thư mục, dữ liệu đã chuẩn bị sẵn:
$($dirs -join "`n")
Với mỗi thư mục: đọc TASK.md trong đó và làm đúng như vậy (ghi result.json hoặc error.txt vào chính thư mục đó). Bot tự gửi kết quả lên web.
Chạy không người trông, không ai trả lời câu hỏi. Xong thì trả lời 1-3 dòng tiếng Việt: việc nào xong, việc nào lỗi và vì sao.
"@
    $promptFile = Join-Path $LogDir "run-$stamp.prompt.txt"
    [IO.File]::WriteAllText($promptFile, $prompt, $Utf8)
    $model = if (@($dirs | Where-Object { (Split-Path $_ -Leaf) -notlike 'translation-*' }).Count) { $DeepModel } else { $LightModel }
    Log "Gọi Claude agent ($model) cho: $(($dirs | ForEach-Object { Split-Path $_ -Leaf }) -join ', ')  (log: $out)"
    # Bộ công cụ tối thiểu: không MCP, không skill/plugin, không Chrome (giảm phần nền mỗi lượt từ ~55k xuống ~9k token).
    $cliArgs = @('-p', '--permission-mode', 'auto', '--output-format', 'text', '--model', $model, '--strict-mcp-config', '--disable-slash-commands', '--tools', 'Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep')
    return Start-Run $claude $cliArgs $promptFile $sigs $out
}

# Chờ một lượt worker kết thúc rồi đọc kết quả: trả lý do để báo về web cho các yêu cầu chưa được trả lời.
# $p có thể là tiến trình do lần chạy bot trước khởi động (khi đó không đọc được mã thoát, chỉ dựa vào log).
function Wait-Worker($p, [string]$out) {
    # Trong lúc worker chạy vẫn gửi nhịp tim mỗi lần quét, để web không báo máy Windows đang tắt.
    $deadline = (Get-Date).AddMinutes($RunTimeoutMinutes)
    while (-not $p.WaitForExit($PollSeconds * 1000)) {
        if ((Get-Date) -gt $deadline) {
            Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
            Log "Lượt worker quá $RunTimeoutMinutes phút, đã dừng."
            return "Agent chạy quá $RunTimeoutMinutes phút nên đã dừng. Anh thử gửi lại yêu cầu."
        }
        try { [void](Get-Pending -Running) } catch {}
    }
    $code = try { $p.ExitCode } catch { $null }
    Log "Lượt worker xong, mã thoát $code."
    # Lượt dừng giữa chừng (hết hạn mức, lỗi) không kịp xoá tệp khoá của nó; để lại thì mọi lượt sau bị chặn tới
    # 3 giờ. Lượt này đã kết thúc nên khoá viết sau lúc nó bắt đầu là của nó: xoá đi.
    if ((Test-Path $LockFile) -and (Get-Item $LockFile).LastWriteTime -ge $p.StartTime.AddSeconds(-5)) {
        Remove-Item $LockFile -Force -ErrorAction SilentlyContinue
        Log 'Đã xoá tệp khoá mà lượt worker để lại.'
    }
    # Hết hạn mức Claude (dùng chung gói với Khoa): báo rõ giờ làm mới và tạm dừng gọi Agent.
    $text = (Get-Content $out -Raw -Encoding UTF8 -ErrorAction SilentlyContinue) + (Get-Content "$out.err" -Raw -Encoding UTF8 -ErrorAction SilentlyContinue)
    if ($code -ne 0 -and $text -match '(?i)(hit your [a-z ]*limit|usage limit|rate limit|session limit)') {
        $reset = if ($text -match '(?i)resets ([^\r\n·]+)') { $Matches[1].Trim() } else { '' }
        # Tạm dừng tới giờ làm mới (vd. "1:30pm"), không đoán được thì $LimitPauseMinutes phút.
        $script:PauseUntil = (Get-Date).AddMinutes($LimitPauseMinutes)
        if ($reset -match '(?i)^(\d{1,2})(?::(\d{2}))?\s*(am|pm)') {
            $hh = [int]$Matches[1] % 12 + $(if ($Matches[3] -ieq 'pm') { 12 } else { 0 }); $mm = if ($Matches[2]) { [int]$Matches[2] } else { 0 }
            $at = (Get-Date).Date.AddHours($hh).AddMinutes($mm); if ($at -lt (Get-Date)) { $at = $at.AddDays(1) }
            $script:PauseUntil = $at
        }
        [IO.File]::WriteAllText($PauseFile, ([ordered]@{ until = $script:PauseUntil.ToString('o'); reason = "Agent tạm hết hạn mức sử dụng$(if ($reset) { " (làm mới lúc $reset)" }). Anh gửi lại yêu cầu sau giờ đó." } | ConvertTo-Json), $Utf8)
        Log "Hết hạn mức Claude$(if ($reset) { ", làm mới lúc $reset" }); tạm dừng gọi Agent tới $($script:PauseUntil.ToString('HH:mm'))."
        $script:PauseReason = "Agent tạm hết hạn mức sử dụng$(if ($reset) { " (làm mới lúc $reset)" }). Anh gửi lại yêu cầu sau giờ đó."
        return $script:PauseReason
    }
    if ($null -ne $code -and $code -ne 0) { return "Lượt chạy của Agent bị lỗi (mã $code). Anh thử gửi lại yêu cầu." }
    return 'Agent đã chạy nhưng chưa xử lý được yêu cầu này. Anh thử gửi lại yêu cầu.'
}

# ---------- vòng quét ----------
$mutex = New-Object Threading.Mutex($false, 'Global\GenBidBot')
if (-not $mutex.WaitOne(0)) { Write-Host 'Bot GenBid đã chạy ở cửa sổ khác.'; exit 0 }
Log "Bot GenBid bắt đầu: quét mỗi $PollSeconds giây."
$lastRun = [datetime]::MinValue
$script:PauseUntil = [datetime]::MinValue
$script:PauseReason = ''
try { $pz = [IO.File]::ReadAllText($PauseFile, $Utf8) | ConvertFrom-Json; if ([datetime]$pz.until -gt (Get-Date)) { $script:PauseUntil = [datetime]$pz.until; $script:PauseReason = $pz.reason; Log "Đang tạm dừng gọi Agent tới $($script:PauseUntil.ToString('HH:mm')) (hết hạn mức)." } } catch {}
$warned = @{}
# Lượt worker mà lần chạy bot trước giao rồi bị tắt giữa chừng: theo dõi tiếp tới khi xong, rồi báo về web
# các yêu cầu của nó còn chờ (vd. hết hạn mức), để trang không treo ở "đang chờ".
function Resume-Worker {
    if (-not (Test-Path $RunFile)) { return }
    try {
        $r = [IO.File]::ReadAllText($RunFile, $Utf8) | ConvertFrom-Json
        $p = Get-Process -Id $r.pid -ErrorAction SilentlyContinue
        if ($p -and $p.StartTime.ToString('o') -ne $r.started) { $p = $null }
        Log "Lượt worker trước còn dở ($(@($r.sigs) -join ', ')): $(if ($p) { 'đang chạy, theo dõi tiếp' } else { 'đã dừng' })."
        $reason = if ($p) { Wait-Worker $p $r.out } else {
            $fake = [pscustomobject]@{ StartTime = [datetime]$r.started; ExitCode = $null }
            $fake | Add-Member ScriptMethod WaitForExit { param($ms) $true } -Force
            Wait-Worker $fake $r.out
        }
        $reqs = Get-Requests (Get-Pending)
        $mine = [ordered]@{}; foreach ($s in @($r.sigs)) { if ($reqs.Contains($s)) { $mine[$s] = $reqs[$s] } }
        if ($mine.Count) { Send-Unanswered $mine $reason }
    } catch { Log "Không theo dõi tiếp được lượt trước: $($_.Exception.Message)" }
    finally { Remove-Item $RunFile -Force -ErrorAction SilentlyContinue }
}
try {
    Resume-Worker
    while ($true) {
        try {
            if (-not (Test-Path $IngestTokenFile)) { if (-not $warned.ingest) { Log 'Thiếu .genbid-ingest-token, chờ.'; $warned.ingest = 1 } }
            elseif (-not (Test-ClaudeLogin) -and -not (Test-Path $ClaudeTokenFile)) { if (-not $warned.claude) { Log 'Thiếu .claude-bot-token (chạy `claude setup-token`), chờ.'; $warned.claude = 1 } }
            else {
                $warned = @{}
                $reqs = Get-Requests (Get-Pending)
                $sigs = @($reqs.Keys)
                $state = Read-Json $StateFile ([pscustomobject]@{})
                $handed = @{}; $state.PSObject.Properties | ForEach-Object { $handed[$_.Name] = $_.Value }
                # Chỉ giữ chữ ký còn đang chờ, để tệp trạng thái không phình ra.
                foreach ($k in @($handed.Keys)) { if ($sigs -notcontains $k) { $handed.Remove($k) } }
                $now = Get-Date
                # Mỗi yêu cầu chỉ giao cho worker một lần; lượt nào không trả lời được thì báo lỗi về web.
                $due = @($sigs | Where-Object { -not $handed[$_] })
                # Yêu cầu cần AI; Sync và Lấy tệp chạy bằng code nên vẫn chạy khi Claude hết hạn mức.
                $dueAi = @($due | Where-Object { $_ -notlike 'files:*' -and $_ -notlike 'sync:*' })
                if ($dueAi.Count -and $dueAi.Count -eq $due.Count -and $now -lt $script:PauseUntil) {
                    # Đang tạm dừng vì hết hạn mức: trả lời ngay bằng lý do, không gọi Claude.
                    foreach ($s in $dueAi) { $handed[$s] = [pscustomobject]@{ last = $now.ToString('o') } }
                    [IO.File]::WriteAllText($StateFile, ([pscustomobject]$handed | ConvertTo-Json -Depth 4), $Utf8)
                    $dueReqs = [ordered]@{}; foreach ($s in $dueAi) { $dueReqs[$s] = $reqs[$s] }
                    try { Send-Unanswered $dueReqs $script:PauseReason } catch { Log "Không báo được lỗi về web: $($_.Exception.Message)" }
                }
                elseif ($due.Count -and -not (Test-WorkerRunning) -and (($now - $lastRun).TotalMinutes -ge $MinGapMinutes -or ($due -like 'files:*') -or ($due -like 'sync:*'))) {
                    # Lấy tệp chạy trước, rồi Sync (cả hai bằng code, không chờ giãn cách); các yêu cầu cần AI
                    # (Phân tích, Dịch, Đối chiếu, HSDT tham khảo) chờ tới vòng quét sau.
                    # Yêu cầu bấm gần nhau (vd. Dịch rồi HSDT) đi chung một lượt: chờ thêm vài giây rồi đọc lại hàng chờ.
                    if ($GatherSeconds -gt 0) {
                        Start-Sleep -Seconds $GatherSeconds
                        $reqs = Get-Requests (Get-Pending)
                        $due = @($reqs.Keys | Where-Object { -not $handed[$_] })
                    }
                    $files = @($due -like 'files:*'); $sync = @($due -like 'sync:*')
                    if ($files.Count) { $due = $files } elseif ($sync.Count) { $due = $sync }
                    foreach ($s in $due) { $handed[$s] = [pscustomobject]@{ last = $now.ToString('o') } }
                    [IO.File]::WriteAllText($StateFile, ([pscustomobject]$handed | ConvertTo-Json -Depth 4), $Utf8)
                    $dueReqs = [ordered]@{}; foreach ($s in $due) { $dueReqs[$s] = $reqs[$s] }
                    $reason = if ($files.Count) {
                        Invoke-Script 'files' @('--only', (($files | ForEach-Object { $reqs[$_].id }) -join ',')) $due
                    } elseif ($sync.Count) {
                        Invoke-Script 'sync' @() $due
                    } else {
                        $lastRun = $now
                        Invoke-Worker $due
                    }
                    try { Send-Unanswered $dueReqs $reason } catch { Log "Không báo được lỗi về web: $($_.Exception.Message)" }
                } else {
                    [IO.File]::WriteAllText($StateFile, ([pscustomobject]$handed | ConvertTo-Json -Depth 4), $Utf8)
                    # Không có yêu cầu nào: tới lịch thì Sync. Mỗi mốc chạy một lần (mốc gần nhất đã qua trong ngày),
                    # nhớ qua các lần khởi động lại bot.
                    $today = $now.ToString('yyyy-MM-dd')
                    $slot = $ScheduleTimes | Where-Object { $now -ge [datetime]"$today $_" } | Sort-Object { [datetime]"$today $_" } | Select-Object -Last 1
                    $slotKey = "$today $slot"
                    if (-not $due.Count -and $slot -and $ScheduleDays -contains $now.DayOfWeek.ToString() `
                        -and (Read-Json $ScheduleFile ([pscustomobject]@{ last = '' })).last -ne $slotKey -and -not (Test-WorkerRunning)) {
                        [IO.File]::WriteAllText($ScheduleFile, (@{ last = $slotKey } | ConvertTo-Json), $Utf8)
                        [void](Invoke-Script 'sync' @('--force', '--scheduled', "`"$slotKey`"") @("schedule:$slotKey"))
                    }
                }
            }
        } catch {
            Log "Lỗi khi quét: $($_.Exception.Message)"
        }
        if ($Once) { break }
        Start-Sleep -Seconds $PollSeconds
    }
} finally {
    $mutex.ReleaseMutex()
}
