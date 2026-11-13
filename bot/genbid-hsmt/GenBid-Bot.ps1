<#
Bot cục bộ của GenBid trên máy Windows: quét liên tục yêu cầu từ bản web (lấy tệp, Phân tích, Sync, ...).
Việc quét chỉ là một lệnh HTTP tới /api/requests?kind=all, không gọi Claude, nên không tốn token.
Từ 2026-10-26 (Khoa): Sync và Lấy tệp chạy bằng code (genbid-sync.js, Playwright), không gọi Claude.
Chỉ Phân tích, Đối chiếu, Tạo bản tiếng Anh, Tạo HSDT tham khảo và Gợi ý cấu hình (config-bot.mjs của repo) gọi Claude Code; dữ liệu được chuẩn bị sẵn
(genbid-sync.js prep: bỏ các chương mẫu, gom chữ HSDT), Claude chỉ ghi result.json, rồi bot tự gửi lên web
(genbid-sync.js finish). Claude chạy với bộ công cụ tối thiểu (không MCP, không skill, không Chrome).

Chống chạy thừa (tốn token):
- Mỗi yêu cầu (key|requestedAt) chỉ giao cho worker một lần. Lượt nào không trả lời được yêu cầu thì bot
  gửi lỗi về web (hsmtreq/analysisreq/syncreq có doneAt và error), để trang thôi hiện "đang xử lý".
- Không chạy khi worker đang chạy (tệp .hsmt-worker.lock còn mới, kể cả lượt 10:00/15:00 của app).

Chạy song song (Khoa, 2026-11-03): vòng quét chỉ điều phối; mỗi lượt chạy trong một tiến trình con riêng
(chính script này với -Job), tự chờ, tự báo lỗi về web. Ba nhóm:
- Trình duyệt (Lấy tệp, Sync, Sync theo lịch): mỗi lúc một lượt, vì chỉ có một hồ sơ Chrome và một tệp khoá.
- AI (Phân tích, Dịch, Đối chiếu, TLKT, HSDT): không giới hạn số lượt cùng lúc. Yêu cầu của gói đang chờ Lấy tệp
  thì đợi Lấy tệp xong (cần HSMT mới).
- Cấu hình (Gợi ý cấu hình, Tìm NCC, Giá gợi ý, Tìm Thông Số nhà cung cấp): một lượt config-bot.mjs run, nó tự chạy mọi gói cùng lúc.
Mỗi lượt có tệp .genbid-bot-jobs<id>.json; bot khởi động lại thì lượt con còn chạy vẫn được tính là bận, lượt con
đã chết thì một tiến trình con mới theo dõi tiếp và báo lỗi về web cho các yêu cầu của nó.

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
    [int]$RunTimeoutMinutes = 180,
    [int]$LimitPauseMinutes = 30,
    [string]$Root = 'C:\Projects\GenSet Pro',
    [string]$Endpoint = 'https://genset-pro-web.vercel.app/api/requests?kind=all',
    # Sync theo lịch (thay tác vụ hẹn giờ "hsmt-worker" của app Claude, Khoa 2026-10-26): bot tự chạy genbid-sync.js,
    # không mở phiên Claude. 10:10, 14:10 và 18:10 mỗi ngày, cả thứ Bảy và Chủ nhật (Khoa, 2026-11-04). Máy tắt lúc đó thì chạy một lần
    # khi bật lại (bù cho mốc gần nhất đã qua trong ngày).
    [string[]]$ScheduleDays = @('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    [string[]]$ScheduleTimes = @('10:10', '14:10', '18:10'),
    # Gợi ý cấu hình (tab "Cấu hình gợi ý", Khoa 2026-10-28): bản sao repo GenSet-Pro (nhánh main) trên máy này.
    [string]$RepoDir = 'C:\Projects\GenSet Pro\GenSet-Pro',
    [switch]$Once,
    # Tiến trình con: chạy một lượt theo tệp này rồi thoát (vòng quét khởi động). -Resume: lượt con trước đã chết, theo dõi tiếp.
    [string]$Job,
    [switch]$Resume
)

$ErrorActionPreference = 'Stop'
# genbid-sync.js in UTF-8: đọc đúng tiếng Việt từ đầu ra của nó.
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch {}
$IngestTokenFile = Join-Path $Root '.genbid-ingest-token'
$ClaudeTokenFile = Join-Path $Root '.claude-bot-token'
$ApiKeyFile = Join-Path $Root '.anthropic-api-key'
$ApiSpendFile = Join-Path $Root '.anthropic-api-spend.jsonl'
$ApiBudgetFile = Join-Path $Root '.anthropic-api-budget.json'
# Cấu hình hệ thống trên web (settings/ai, chỉ Superadmin; Khoa 13/11/2026): Phân tích, Gợi ý cấu hình, Gợi ý giá,
# Đối chiếu hồ sơ trả bằng API hay gói tháng; ngưỡng chuyển; số tiền API đã dùng sửa tay. Get-Pending chép về đây.
$AiSettingsFile = Join-Path $Root '.genbid-ai-settings.json'
$StateFile = Join-Path $Root '.genbid-bot-state.json'
$WorkerState = Join-Path $Root '.hsmt-worker-state.json'
$LockFile = Join-Path $Root '.hsmt-worker.lock'
# Bản cũ (chạy tuần tự) ghi lượt đang chạy ở đây; giờ mỗi lượt con có $JobDir<id>.json và <id>.json.run.
$LegacyRunFile = Join-Path $Root '.genbid-bot-run.json'
$JobDir = Join-Path $Root '.genbid-bot-jobs'
New-Item -ItemType Directory -Force $JobDir | Out-Null
$RunFile = if ($Job) { "$Job.run" } else { $LegacyRunFile }
# Nhóm của lượt con này (browser, ai, config); dùng cho log và tệp khoá.
$script:Lane = ''
# Tạm dừng vì hết hạn mức, nhớ qua các lần khởi động lại bot.
$PauseFile = Join-Path $Root '.genbid-bot-pause.json'
$ScheduleFile = Join-Path $Root '.genbid-bot-schedule.json'
$LogDir = Join-Path $Root 'genbid-bot-logs'
New-Item -ItemType Directory -Force $LogDir | Out-Null
$Utf8 = New-Object Text.UTF8Encoding $false

function Log([string]$msg) {
    $line = "{0:yyyy-MM-dd HH:mm:ss}  {1}{2}" -f (Get-Date), $(if ($script:Lane) { "[$($script:Lane) $PID] " }), $msg
    Write-Host $line
    # Nhiều tiến trình (vòng quét và các lượt con) cùng ghi một tệp log: tệp đang bị ghi thì thử lại.
    for ($i = 0; $i -lt 10; $i++) {
        try { [IO.File]::AppendAllText((Join-Path $LogDir ("bot-{0:yyyy-MM}.log" -f (Get-Date))), $line + "`r`n", $Utf8); break } catch { Start-Sleep -Milliseconds (50 + 100 * $i) }
    }
}
# Tên tệp riêng cho từng lượt: nhiều lượt con có thể bắt đầu trong cùng một giây.
function Stamp { "{0:yyyyMMdd-HHmmss}-{1}" -f (Get-Date), $PID }

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

# Lần hỏi cũng là nhịp tim cho bản web (botstatus/current), để web biết máy Windows đang bật (web báo tắt sau 3 phút
# im lặng). Nhịp tim chỉ ghi mỗi ~1 phút hoặc khi đổi running; các lần hỏi khác gửi beat=0 (bớt log Supabase, 2026-11-08).
# -BeatOnly: chỉ để gửi nhịp tim; chưa tới lúc thì không hỏi gì.
$script:LastBeat = [datetime]::MinValue
$script:LastBeatRunning = $null
function Get-Pending([switch]$Running, [switch]$BeatOnly) {
    $now = Get-Date
    $beat = ($now - $script:LastBeat).TotalSeconds -ge 55 -or $script:LastBeatRunning -ne [bool]$Running
    if ($BeatOnly -and -not $beat) { return $null }
    $token = (Get-Content $IngestTokenFile -TotalCount 1).Trim()
    $url = $Endpoint + $(if ($Running) { '&running=1' }) + $(if (-not $beat) { '&beat=0' })
    # Nhịp tim kèm số tiền API kỳ này (Cấu hình hệ thống trên web hiện số này; Khoa 13/11/2026).
    if ($beat -and (Test-Path $ApiKeyFile)) {
        try {
            $bud = Get-ApiBudget
            $api = [ordered]@{ spent = $bud.Spent; since = $bud.Since.ToString('yyyy-MM-ddTHH:mm:ss'); switchAt = $bud.SwitchAt; exhausted = [bool]$bud.Exhausted } | ConvertTo-Json -Compress
            $url += '&api=' + [uri]::EscapeDataString($api)
        } catch {}
    }
    $r = Invoke-WebRequest $url -Headers @{ Authorization = "Bearer $token" } -UseBasicParsing -TimeoutSec 60
    if ($beat) { $script:LastBeat = $now; $script:LastBeatRunning = [bool]$Running }
    $p = [Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray()) | ConvertFrom-Json
    # Cấu hình hệ thống (settings/ai) đến cùng nhịp tim: chép về máy để genbid-sync.js, config-bot, bidprice-bot đọc.
    if ($p.PSObject.Properties.Name -contains 'settings' -and $null -ne $p.settings) {
        try {
            $json = $p.settings | ConvertTo-Json -Depth 6 -Compress
            $old = if (Test-Path $AiSettingsFile) { [IO.File]::ReadAllText($AiSettingsFile) } else { '' }
            if ($json -ne $old) { [IO.File]::WriteAllText($AiSettingsFile, $json, $Utf8); Log "Cấu hình hệ thống mới: $json" }
        } catch {}
    }
    $p
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
    foreach ($x in @($p.tlkt)) { if ($x) { $reqs["tlkt:$($x.key)|$($x.requestedAt)"] = @{ coll = 'tlktreq'; id = $x.key; data = [ordered]@{ notifyNo = $x.notifyNo; requestedAt = $x.requestedAt } } } }
    foreach ($x in @($p.hsdt)) { if ($x) { $reqs["hsdt:$($x.key)|$($x.requestedAt)"] = @{ coll = 'hsdtreq'; id = $x.key; data = [ordered]@{ notifyNo = $x.notifyNo; requestedAt = $x.requestedAt } } } }
    if ($p.sync.pending) { $reqs["sync:$($p.sync.requestedAt)"] = @{ coll = 'syncreq'; id = 'current'; data = [ordered]@{ requestedAt = $p.sync.requestedAt; from = 'web' } } }
    return $reqs
}

# Sau một lượt: yêu cầu nào vẫn chờ thì báo lỗi về web, để trang thôi hiện "đang xử lý".
function Send-Unanswered($handedReqs, [string]$reason) {
    $still = Get-Requests (Get-Pending)
    $dir = Join-Path $LogDir ('post-' + (Stamp))
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

# Khoa 11/11/2026: Phân tích, Gợi ý cấu hình, Giá gợi ý trả tiền theo API key thay vì hạn mức tháng của gói Claude.
# Có tệp .anthropic-api-key thì đặt ANTHROPIC_API_KEY (claude -p ưu tiên nó hơn đăng nhập /login); không có thì như cũ.
# Khoa 12/11/2026: API key được 100 USD/tháng, làm mới ngày 2. Mỗi lần gọi bằng API key ghi chi phí (total_cost_usd)
# vào .anthropic-api-spend.jsonl (genbid-sync.js, suppliers/api-budget.mjs, Invoke-Agent). Tiêu tới ngưỡng (mặc định
# 90 USD) hoặc API báo hết tiền ("exhausted") thì dùng hạn mức gói tháng tới kỳ sau. Hạn mức, ngày làm mới, ngưỡng:
# .anthropic-api-budget.json {monthlyUsd, resetDay, switchAtUsd}.
function Get-ApiBudget {
    $b = [ordered]@{ monthlyUsd = 100.0; resetDay = 2; switchAtUsd = 90.0 }
    try { $j = Get-Content $ApiBudgetFile -Raw -Encoding UTF8 -ErrorAction Stop | ConvertFrom-Json; foreach ($n in @($b.Keys)) { if ($null -ne $j.$n) { $b[$n] = [double]$j.$n } } } catch {}
    # Cấu hình hệ thống (cùng cách tính với apiBudgetOf trong sync-pure.js): ngưỡng trên web thắng tệp; số tiền Khoa sửa
    # tay {usd, at} trong kỳ này thay sổ tới lúc `at` (đã dùng = usd + phần sổ sau `at`; "exhausted" trước `at` bỏ qua).
    $fixUsd = $null; $fixAt = $null
    try {
        $s = Get-Content $AiSettingsFile -Raw -Encoding UTF8 -ErrorAction Stop | ConvertFrom-Json
        if ([double]$s.switchAtUsd -gt 0) { $b.switchAtUsd = [double]$s.switchAtUsd }
        if ($null -ne $s.spent -and $null -ne $s.spent.usd) { $fixAt = [datetime]::Parse([string]$s.spent.at, [Globalization.CultureInfo]::InvariantCulture); $fixUsd = [double]$s.spent.usd }
    } catch { $fixUsd = $null }
    $now = Get-Date
    $since = (Get-Date -Year $now.Year -Month $now.Month -Day 1).Date.AddDays([int]$b.resetDay - 1)
    if ($now -lt $since) { $since = $since.AddMonths(-1) }
    $fix = $null -ne $fixUsd -and $fixUsd -ge 0 -and $fixAt -ge $since -and $fixAt -le $now
    $spent = if ($fix) { $fixUsd } else { 0.0 }; $exhausted = $false
    if (Test-Path $ApiSpendFile) {
        foreach ($l in [IO.File]::ReadAllLines($ApiSpendFile)) {
            if (-not $l.Trim()) { continue }
            try { $e = $l | ConvertFrom-Json; $t = [datetime]::Parse([string]$e.t, [Globalization.CultureInfo]::InvariantCulture) } catch { continue }
            if ($t -lt $since) { continue }
            if ($fix -and $t -le $fixAt) { continue }
            # Lần gọi đang chạy lúc sửa tay (t0 < lúc sửa < t): chỉ cộng phần thời gian sau lúc sửa (như afterShare).
            $share = 1.0
            if ($fix -and $e.t0) {
                try {
                    $t0 = [datetime]::Parse([string]$e.t0, [Globalization.CultureInfo]::InvariantCulture)
                    if ($t0 -lt $fixAt -and $t -gt $t0) { $share = [math]::Min(1, [math]::Max(0, ($t - $fixAt).TotalSeconds / ($t - $t0).TotalSeconds)) }
                } catch {}
            }
            if ($e.usd) { $spent += [double]$e.usd * $share }
            if ($e.exhausted) { $exhausted = $true }
        }
    }
    [pscustomobject]@{ Spent = [math]::Round($spent, 2); Limit = $b.monthlyUsd; SwitchAt = $b.switchAtUsd; Since = $since; Exhausted = $exhausted }
}
# $start: lúc bắt đầu lần gọi (t0), để số tiền sửa tay giữa chừng chỉ cộng phần sau lúc sửa.
function Add-ApiSpend([double]$usd, [string]$src, [switch]$Exhausted, $start = $null) {
    $rec = [ordered]@{ t = (Get-Date).ToUniversalTime().ToString('o'); usd = [math]::Round($usd, 4); src = $src }
    if ($start) { $rec.t0 = ([datetime]$start).ToUniversalTime().ToString('o') }
    if ($Exhausted) { $rec.exhausted = $true }
    try { [IO.File]::AppendAllText($ApiSpendFile, (($rec | ConvertTo-Json -Compress) + "`n"), $Utf8) } catch {}
}
function Set-ClaudeAuth {
    # Từng việc có thể đặt gói tháng (Cấu hình hệ thống): script Node đọc tệp này, cần token gói tháng khi chưa /login.
    $env:GENBID_AI_SETTINGS_FILE = $AiSettingsFile; $env:GENBID_CLAUDE_TOKEN_FILE = $ClaudeTokenFile
    if (Test-Path $ApiKeyFile) {
        $k = (Get-Content $ApiKeyFile -TotalCount 1).Trim()
        if ($k) {
            $bud = Get-ApiBudget
            $use = "$($bud.Spent)/$($bud.Limit) USD từ $($bud.Since.ToString('dd/MM'))"
            if (-not $bud.Exhausted -and $bud.Spent -lt $bud.SwitchAt) {
                $env:ANTHROPIC_API_KEY = $k; Remove-Item Env:CLAUDE_CODE_OAUTH_TOKEN -ErrorAction SilentlyContinue
                $env:GENBID_API_SPEND_FILE = $ApiSpendFile; $env:GENBID_CLAUDE_TOKEN_FILE = $ClaudeTokenFile
                return "api, đã dùng $use"
            }
            $why = if ($bud.Exhausted) { 'API báo hết tiền' } else { "đã dùng $use, tới ngưỡng $($bud.SwitchAt) USD" }
            if (-not (Test-ClaudeLogin)) { $env:CLAUDE_CODE_OAUTH_TOKEN = (Get-Content $ClaudeTokenFile -TotalCount 1).Trim() }
            return "plan ($why)"
        }
    }
    if (-not (Test-ClaudeLogin)) { $env:CLAUDE_CODE_OAUTH_TOKEN = (Get-Content $ClaudeTokenFile -TotalCount 1).Trim() }
    return 'plan'
}
function Clear-ClaudeAuth { Remove-Item Env:CLAUDE_CODE_OAUTH_TOKEN, Env:ANTHROPIC_API_KEY, Env:GENBID_API_SPEND_FILE, Env:GENBID_CLAUDE_TOKEN_FILE, Env:GENBID_AI_SETTINGS_FILE -ErrorAction SilentlyContinue }
# Việc của một thư mục lượt AI (analysis-<TBMT>, compare-..., tlkt-...) trong Cấu hình hệ thống; '' khi không thuộc 4 việc.
function Get-AiTask([string]$dir) {
    switch -Regex (Split-Path $dir -Leaf) { '^analysis-' { 'analysis' } '^(compare|tlkt)-' { 'compare' } default { '' } }
}
# Cấu hình hệ thống đặt việc này dùng gói tháng?
function Test-AiPlan([string]$task) {
    if (-not $task) { return $false }
    try { return ((Get-Content $AiSettingsFile -Raw -Encoding UTF8 -ErrorAction Stop | ConvertFrom-Json).use.$task -eq 'plan') } catch { return $false }
}

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
    $out = Join-Path $LogDir "run-$(Stamp).log"
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

# Chạy một tệp node với tham số, trả các dòng nó in ra (lỗi của node không dừng bot).
function Invoke-Node-File([string]$node, [string]$file, [string[]]$argList) {
    $eap = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
    try { & $node $file @argList 2>&1 | ForEach-Object { "$_" } } finally { $ErrorActionPreference = $eap }
}

# Phân tích, Đối chiếu, Tạo bản tiếng Anh, Tạo HSDT tham khảo: chuẩn bị dữ liệu bằng code, Claude chỉ đọc và ghi kết quả,
# rồi bot gửi kết quả lên web bằng code.
function Invoke-Worker([string[]]$sigs) {
    $claude = Find-Claude
    if (-not $claude) { Log 'Không tìm thấy Claude Code (claude.exe).'; return 'Agent chưa sẵn sàng (thiếu chương trình chạy worker).' }
    $node = Find-Node
    if (-not $node) { Log 'Không tìm thấy Node.js (node.exe).'; return 'Máy Windows thiếu Node.js để chuẩn bị dữ liệu.' }
    $stamp = Stamp
    $out = Join-Path $LogDir "run-$stamp.log"
    $work = Join-Path $Root "genbid-work\ai-$stamp"
    Log "Chuẩn bị dữ liệu: $($sigs -join ', ')"
    $prep = Invoke-Node prep --sigs ($sigs -join ',') --out $work
    $prep | ForEach-Object { Log "  $_" }
    $dirs = @(Get-ChildItem $work -Directory -ErrorAction SilentlyContinue | ForEach-Object { $_.FullName })
    if (-not $dirs.Count) { return 'Không chuẩn bị được dữ liệu cho yêu cầu này (không đọc được bản web).' }
    # Ưu tiên đăng nhập đầy đủ của Claude Code (/login). Token setup-token chỉ dùng khi chưa đăng nhập; nó chỉ nằm
    # trong biến môi trường của các tiến trình con, bỏ ngay sau lượt.
    $auth = Set-ClaudeAuth
    $env:GENBID_CLAUDE = $claude
    try {
        # 1. Mỗi yêu cầu một lần gọi (dữ liệu + prompt vào, JSON ra, không công cụ), tối đa 3 yêu cầu cùng lúc.
        Log "Gọi Claude một lần cho mỗi yêu cầu ($DeepModel; dịch: $LightModel; trả bằng $auth): $($sigs -join ', ')  (log: $out)"
        $reason = Start-Run $node @("`"$SyncJs`"", 'ask', '--dir', "`"$work`"", '--model', $DeepModel, '--light', $LightModel) $null $sigs $out
        (Get-Content $out -Encoding UTF8 -ErrorAction SilentlyContinue) | Where-Object { $_ -match '^\s+\S' } | ForEach-Object { Log $_ }
        # 2. Agent chỉ cho các yêu cầu cần xem trang (PDF scan, HSDT chưa đọc được chữ) hoặc trả lời một lần không được.
        $dirs = @($dirs | Where-Object { Test-Path (Join-Path $_ 'AGENT') })
        if ($dirs.Count -and -not ($script:PauseUntil -gt (Get-Date))) { $reason = Invoke-AgentByPay $claude $dirs $sigs $stamp }
    } finally {
        Clear-ClaudeAuth; Remove-Item Env:GENBID_CLAUDE -ErrorAction SilentlyContinue
        # Gửi kết quả (hoặc lỗi trong error.txt) lên web và xoá thư mục (HSDT là tài liệu riêng của công ty).
        Invoke-Node finish --dir $work | ForEach-Object { Log "  $_" }
    }
    return $reason
}

# Cấu hình hệ thống (Khoa 13/11/2026): khi lượt đang trả bằng API mà có việc đặt gói tháng, các thư mục của việc đó chạy
# một agent riêng không có API key; còn lại một agent như cũ.
function Invoke-AgentByPay([string]$claude, [string[]]$dirs, [string[]]$sigs, [string]$stamp) {
    $plan = @(if ($env:ANTHROPIC_API_KEY) { $dirs | Where-Object { Test-AiPlan (Get-AiTask $_) } })
    $rest = @($dirs | Where-Object { $plan -notcontains $_ })
    $reason = $null
    if ($rest.Count) { $reason = Invoke-Agent $claude $rest $sigs $stamp }
    if ($plan.Count -and -not ($script:PauseUntil -gt (Get-Date))) {
        $key = $env:ANTHROPIC_API_KEY; Remove-Item Env:ANTHROPIC_API_KEY
        if (-not (Test-ClaudeLogin)) { $env:CLAUDE_CODE_OAUTH_TOKEN = (Get-Content $ClaudeTokenFile -TotalCount 1).Trim() }
        Log "Gói tháng (Cấu hình hệ thống) cho: $(($plan | ForEach-Object { Split-Path $_ -Leaf }) -join ', ')"
        try { $r2 = Invoke-Agent $claude $plan $sigs "$stamp-plan"; if ($r2) { $reason = $r2 } }
        finally { $env:ANTHROPIC_API_KEY = $key; Remove-Item Env:CLAUDE_CODE_OAUTH_TOKEN -ErrorAction SilentlyContinue }
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
    # Chốt đọc (Khoa 12/11/2026): input.md chia phần ≤ mức Read đọc trọn + read-order.json (suppliers\agent-read.mjs prep),
    # agent chạy stream-json (log có từng lần Read) để guard biết mỗi thư mục đã đọc đủ chưa. Không có repo thì chạy như cũ.
    $readJs = Join-Path $RepoDir 'suppliers\agent-read.mjs'; $node = Find-Node
    $guard = $node -and (Test-Path $readJs)
    if ($guard) { Invoke-Node-File $node $readJs (@('prep') + $dirs) | ForEach-Object { Log "  đọc: $_" } }
    # stream-json (--verbose) để code đọc được từng lần Read; dòng result cuối có total_cost_usd (sổ chi tiêu API).
    $cliArgs = @('-p', '--permission-mode', 'auto', '--output-format', 'stream-json', '--verbose', '--model', $model, '--strict-mcp-config', '--disable-slash-commands', '--tools', 'Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep')
    $api = [bool]$env:ANTHROPIC_API_KEY; $t0 = Get-Date
    # Sổ chi API theo lượt đang chạy (Khoa 13/11/2026: "cần cập nhật mỗi khi sử dụng"): Wait-Worker đọc log mỗi phút,
    # suppliers\api-budget.mjs meter ghi phần tăng thêm; lượt bị dừng giữa chừng vẫn được tính.
    $meterJs = Join-Path $RepoDir 'suppliers\api-budget.mjs'
    $script:SpendMeter = if ($api -and $node -and (Test-Path $meterJs)) {
        @{ Node = $node; Js = $meterJs; Log = $out; State = "$out.spend"; Start = $t0.ToUniversalTime().ToString('o'); Last = Get-Date }
    } else { $null }
    $metered = [bool]$script:SpendMeter
    try { $reason = Start-Run $claude $cliArgs $promptFile $sigs $out } finally { Update-ApiSpendMeter -Final; $script:SpendMeter = $null }
    if ($api -and -not $metered) {
        try {
            $last = Get-Content $out -Encoding UTF8 | Where-Object { $_ -like '*"type":"result"*' } | Select-Object -Last 1
            $c = ($last | ConvertFrom-Json).total_cost_usd
            if ($c) { Add-ApiSpend ([double]$c) 'agent' -start $t0 }
        } catch {}
    }
    # Đọc thiếu thì read-guard.json trong thư mục báo; genbid-sync.js finish không ghi đè kết quả cũ bằng kết quả đó.
    if ($guard) { Invoke-Node-File $node $readJs (@('guard', '--log', $out, '--cwd', $Root) + $dirs) | ForEach-Object { Log "  $_" } }
    return $reason
}

# Cập nhật repo GenSet-Pro lên origin/main. Không dùng git pull: pull hợp nhất theo FETCH_HEAD, nên khi có lượt fetch
# khác chạy cùng lúc (app, phiên Claude) thì báo "Cannot fast-forward to multiple branches". Tệp đang sửa dở trong repo
# được cất tạm rồi trả lại (--autostash); nếu chính tệp đó cũng đổi trên GitHub thì để nguyên, lượt này không cập nhật.
function Update-Repo {
    $eap = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
    try {
        & git -C $RepoDir fetch -q origin main 2>&1 | ForEach-Object { Log "  git: $_" }
        if ($LASTEXITCODE) { return }
        $dirty = @(& git -C $RepoDir -c core.quotepath=false status --porcelain --untracked-files=no 2>$null | ForEach-Object { $_.Substring(3) -replace '^.* -> ', '' })
        if ($dirty) {
            $theirs = @(& git -C $RepoDir -c core.quotepath=false diff --name-only HEAD origin/main 2>$null)
            $both = @($dirty | Where-Object { $theirs -contains $_ })
            if ($both) { Log "  git: chưa cập nhật repo vì tệp đang sửa dở cũng đổi trên GitHub: $($both -join ', ')"; return }
        }
        & git -C $RepoDir merge -q --ff-only --autostash origin/main 2>&1 | ForEach-Object { Log "  git: $_" }
    } finally { $ErrorActionPreference = $eap }
}

# "Gợi ý" ở tab Cấu hình gợi ý: suppliers\config-bot.mjs của repo GenSet-Pro tự đọc yêu cầu, gọi Claude (Opus, có tìm
# web), kiểm nguồn bằng code và gửi kết quả hoặc lỗi lên web. Bot chỉ cập nhật repo rồi chạy nó.
function Invoke-Config {
    $cfgJs = Join-Path $RepoDir 'suppliers\config-bot.mjs'
    if (-not (Test-Path $cfgJs)) { if (-not $script:ConfigWarned) { Log "Chưa có repo GenSet-Pro ở $RepoDir, bỏ qua Gợi ý cấu hình."; $script:ConfigWarned = 1 }; return }
    $claude = Find-Claude; $node = Find-Node
    if (-not $claude -or -not $node) { Log 'Thiếu Claude Code hoặc Node.js cho Gợi ý cấu hình.'; return }
    Update-Repo
    $auth = Set-ClaudeAuth
    $env:GENBID_CLAUDE = $claude; $env:GENBID_INGEST_TOKEN_FILE = $IngestTokenFile
    $out = Join-Path $LogDir "config-$(Stamp).log"
    Log "Gợi ý cấu hình, Tìm NCC và Gợi ý giá đấu, mọi gói cùng lúc (Claude $DeepModel; trả bằng $auth)  (log: $out)"
    try { [void](Start-Run $node @("`"$cfgJs`"", 'run') $null @('config') $out) }
    finally { Clear-ClaudeAuth; Remove-Item Env:GENBID_CLAUDE, Env:GENBID_INGEST_TOKEN_FILE -ErrorAction SilentlyContinue }
    $lines = @(Get-Content $out -Encoding UTF8 -ErrorAction SilentlyContinue | Where-Object { $_ })
    $lines | ForEach-Object { Log "  $_" }
    # Lượt config-bot khác (vd. chạy tay) đang giữ khoá của nó: báo vòng quét chờ một lúc rồi mới thử lại.
    if ($lines -contains 'SUMMARY: đang có lượt khác chạy') { return 4 }
    return 0
}

# Chờ một lượt worker kết thúc rồi đọc kết quả: trả lý do để báo về web cho các yêu cầu chưa được trả lời.
# $p có thể là tiến trình do lần chạy bot trước khởi động (khi đó không đọc được mã thoát, chỉ dựa vào log).
# Lượt agent trả bằng API key ($script:SpendMeter do Invoke-Agent đặt): ghi phần chi tăng thêm vào sổ, mỗi phút một lần
# trong lúc chạy và một lần cuối (-Final, ghi cả phần chênh với total_cost_usd).
$script:SpendMeter = $null
function Update-ApiSpendMeter([switch]$Final) {
    $m = $script:SpendMeter
    if (-not $m) { return }
    if (-not $Final -and ((Get-Date) - $m.Last).TotalSeconds -lt 60) { return }
    $m.Last = Get-Date
    $a = @('meter', '--log', $m.Log, '--state', $m.State, '--src', 'agent', '--start', $m.Start)
    if ($Final) { $a += '--final' }
    try { Invoke-Node-File $m.Node $m.Js $a | ForEach-Object { Log "  $_" } } catch {}
}
function Wait-Worker($p, [string]$out) {
    # Trong lúc worker chạy vẫn gửi nhịp tim mỗi lần quét, để web không báo máy Windows đang tắt.
    $deadline = (Get-Date).AddMinutes($RunTimeoutMinutes)
    while (-not $p.WaitForExit($PollSeconds * 1000)) {
        if ((Get-Date) -gt $deadline) {
            Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
            Log "Lượt worker quá $RunTimeoutMinutes phút, đã dừng."
            return "Agent chạy quá $RunTimeoutMinutes phút nên đã dừng. Anh thử gửi lại yêu cầu."
        }
        if (-not $Job) { try { [void](Get-Pending -Running -BeatOnly) } catch {} }
        Update-ApiSpendMeter
    }
    $code = try { $p.ExitCode } catch { $null }
    Log "Lượt worker xong, mã thoát $code."
    # Lượt dừng giữa chừng (hết hạn mức, lỗi) không kịp xoá tệp khoá của nó; để lại thì mọi lượt sau bị chặn tới
    # 3 giờ. Lượt này đã kết thúc nên khoá viết sau lúc nó bắt đầu là của nó: xoá đi.
    # Chỉ lượt Trình duyệt (Lấy tệp, Sync) dùng khoá này; lượt AI hay Cấu hình xong không được xoá khoá của một Sync
    # đang chạy song song.
    if ($script:Lane -in @('browser', '') -and (Test-Path $LockFile) -and (Get-Item $LockFile).LastWriteTime -ge $p.StartTime.AddSeconds(-5)) {
        Remove-Item $LockFile -Force -ErrorAction SilentlyContinue
        Log 'Đã xoá tệp khoá mà lượt worker để lại.'
    }
    # Hết hạn mức Claude (dùng chung gói với Khoa): báo rõ giờ làm mới và tạm dừng gọi Agent.
    # Log stream-json của agent có cả nội dung tệp agent đọc và các dòng sự kiện: chỉ dò trên các dòng không phải JSON
    # và dòng "result" cuối (chữ "rate limit" trong một tệp HSMT không được coi là hết hạn mức), cộng tệp .err.
    $lines = @(Get-Content $out -Encoding UTF8 -ErrorAction SilentlyContinue)
    $keep = @($lines | Where-Object { $_ -notmatch '^\s*\{' })
    $lastResult = $lines | Where-Object { $_ -match '^\s*\{.*"type"\s*:\s*"result"' } | Select-Object -Last 1
    $text = ((@($keep) + @($lastResult)) -join "`n") + (Get-Content "$out.err" -Raw -Encoding UTF8 -ErrorAction SilentlyContinue)
    # Trả bằng API key (.anthropic-api-key): hết tiền nạp hoặc khoá sai thì báo rõ, không tạm dừng theo giờ.
    # Hết hạn mức API tháng (Khoa 12/11/2026): ghi "exhausted" để các lượt sau dùng gói tháng tới kỳ làm mới.
    if ($code -ne 0 -and $env:ANTHROPIC_API_KEY -and $text -match '(?i)credit balance is too low|reached your specified api usage limits') {
        Add-ApiSpend 0 'agent' -Exhausted
        Log 'Hạn mức API key đã hết; các lượt sau dùng gói tháng.'
        return 'Hạn mức API Anthropic tháng này đã hết; bot đã chuyển sang gói tháng. Anh gửi lại yêu cầu.'
    }
    if ($code -ne 0 -and $text -match '(?i)invalid api key|authentication_error') { return 'API key Anthropic không hợp lệ (tệp .anthropic-api-key). Anh kiểm lại khoá rồi gửi lại yêu cầu.' }
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

# ---------- lượt con ----------
$script:PauseUntil = [datetime]::MinValue
$script:PauseReason = ''
# Lượt con ghi tệp này khi Claude hết hạn mức; vòng quét đọc lại mỗi vòng.
function Read-Pause {
    try { $pz = [IO.File]::ReadAllText($PauseFile, $Utf8) | ConvertFrom-Json; $script:PauseUntil = [datetime]$pz.until; $script:PauseReason = $pz.reason } catch {}
}
Read-Pause
# Chữ ký "analysis:<TBMT>|<requestedAt>" -> TBMT.
function Key-Of([string]$sig) { ($sig -replace '^[a-z]+:', '') -replace '\|.*$', '' }
# Hàng chờ của web, thử lại khi mạng chập chờn (lượt con cần nó để biết yêu cầu nào phải báo lỗi).
function Get-PendingRetry {
    for ($i = 1; ; $i++) { try { return Get-Pending } catch { if ($i -ge 4) { throw }; Start-Sleep -Seconds (5 * $i) } }
}

# Một lượt con: làm việc ghi trong tệp $Job, rồi báo lỗi về web cho các yêu cầu của nó còn chờ.
# -Resume: lượt con trước đã chết giữa chừng (vd. bot bị tắt): chờ tiến trình nó để lại (nếu còn) rồi báo lỗi.
function Invoke-Job {
    $j = [IO.File]::ReadAllText($Job, $Utf8) | ConvertFrom-Json
    $script:Lane = $j.lane
    $sigs = @($j.sigs)
    $reqs = try { Get-Requests (Get-PendingRetry) } catch { Log "Không đọc được hàng chờ: $($_.Exception.Message)"; [ordered]@{} }
    $mine = [ordered]@{}; foreach ($s in $sigs) { if ($reqs.Contains($s)) { $mine[$s] = $reqs[$s] } }
    $code = 0
    if ($Resume) {
        $reason = 'Lượt chạy bị dừng giữa chừng. Anh thử gửi lại yêu cầu.'
        if (Test-Path $RunFile) {
            $r = [IO.File]::ReadAllText($RunFile, $Utf8) | ConvertFrom-Json
            $p = Get-Process -Id $r.pid -ErrorAction SilentlyContinue
            if ($p -and $p.StartTime.ToString('o') -ne $r.started) { $p = $null }
            Log "Lượt trước còn dở ($($sigs -join ', ')): $(if ($p) { 'đang chạy, theo dõi tiếp' } else { 'đã dừng' })."
            $reason = if ($p) { Wait-Worker $p $r.out } else {
                $fake = [pscustomobject]@{ StartTime = [datetime]$r.started; ExitCode = $null }
                $fake | Add-Member ScriptMethod WaitForExit { param($ms) $true } -Force
                Wait-Worker $fake $r.out
            }
        } else { Log "Lượt trước dừng trước khi chạy ($($sigs -join ', '))." }
    } else {
        switch ($j.lane) {
            'browser' {
                $files = @($sigs -like 'files:*')
                $reason = if ($files.Count) { Invoke-Script 'files' @('--only', (($files | ForEach-Object { Key-Of $_ }) -join ',')) $sigs }
                    elseif ($j.slot) { Invoke-Script 'sync' @('--force', '--scheduled', "`"$($j.slot)`"") $sigs }
                    else { Invoke-Script 'sync' @() $sigs }
            }
            'ai' { $reason = Invoke-Worker $sigs }
            'config' { $code = @(Invoke-Config)[-1]; $reason = '' }
        }
    }
    if ($mine.Count) { try { Send-Unanswered $mine $reason } catch { Log "Không báo được lỗi về web: $($_.Exception.Message)" } }
    return [int]$code
}

if ($Job) {
    $code = 0
    try { $code = @(Invoke-Job)[-1] } catch { Log "Lượt con lỗi: $($_.Exception.Message)" }
    finally { Remove-Item $Job, $RunFile -Force -ErrorAction SilentlyContinue }
    exit [int]$code
}

# ---------- vòng quét ----------
$mutex = New-Object Threading.Mutex($false, 'Global\GenBidBot')
if (-not $mutex.WaitOne(0)) { Write-Host 'Bot GenBid đã chạy ở cửa sổ khác.'; exit 0 }
Log "Bot GenBid bắt đầu: quét mỗi $PollSeconds giây, các lượt chạy song song."
if ($script:PauseUntil -gt (Get-Date)) { Log "Đang tạm dừng gọi Agent tới $($script:PauseUntil.ToString('HH:mm')) (hết hạn mức)." }
$warned = @{}
# Tệp lượt -> tiến trình con do vòng quét này khởi động (đọc được mã thoát).
$procs = @{}
$script:ConfigWait = [datetime]::MinValue

# Khởi động một lượt con (chính script này với -Job), không chờ nó.
function Start-Lane([string]$lane, [string[]]$sigs, [hashtable]$extra = @{}, [string]$file, [switch]$Resume) {
    if (-not $file) { $file = Join-Path $JobDir ("{0}-{1:yyyyMMdd-HHmmss-fff}.json" -f $lane, (Get-Date)) }
    $info = [ordered]@{ lane = $lane; sigs = @($sigs) }
    foreach ($k in $extra.Keys) { $info[$k] = $extra[$k] }
    [IO.File]::WriteAllText($file, ($info | ConvertTo-Json), $Utf8)
    $q = { param($v) '"' + $v + '"' }
    $argList = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Hidden', '-File', (& $q $PSCommandPath), '-Job', (& $q $file),
        '-Root', (& $q $Root), '-Endpoint', (& $q $Endpoint), '-RepoDir', (& $q $RepoDir), '-LightModel', $LightModel, '-DeepModel', $DeepModel,
        '-PollSeconds', $PollSeconds, '-RunTimeoutMinutes', $RunTimeoutMinutes, '-LimitPauseMinutes', $LimitPauseMinutes) + $(if ($Resume) { '-Resume' })
    $p = Start-Process powershell.exe -ArgumentList $argList -WorkingDirectory $Root -WindowStyle Hidden -PassThru
    $null = $p.Handle  # giữ handle để đọc được ExitCode khi tiến trình kết thúc
    $info.pid = $p.Id; $info.started = $p.StartTime.ToString('o')
    [IO.File]::WriteAllText($file, ($info | ConvertTo-Json), $Utf8)
    $procs[$file] = $p
    Log "Bắt đầu lượt $lane$(if ($Resume) { ' (theo dõi tiếp lượt trước)' }) (tiến trình $($p.Id)): $($sigs -join ', ')"
}

# Các nhóm đang bận (nhóm -> số lượt). Lượt con chết mà chưa dọn tệp thì một lượt con mới theo dõi tiếp.
function Get-Lanes {
    foreach ($f in @($procs.Keys)) {
        $p = $procs[$f]
        if (-not $p.HasExited) { continue }
        $procs.Remove($f)
        Log "Lượt $(Split-Path $f -Leaf) xong, mã thoát $($p.ExitCode)."
        if ((Split-Path $f -Leaf) -like 'config-*' -and $p.ExitCode -eq 4) {
            $script:ConfigWait = (Get-Date).AddMinutes(2)
            Log 'Một lượt config-bot khác đang giữ khoá; 2 phút nữa thử lại.'
        }
    }
    $busy = @{}
    foreach ($f in @(Get-ChildItem $JobDir -Filter '*.json' -File -ErrorAction SilentlyContinue)) {
        $j = try { [IO.File]::ReadAllText($f.FullName, $Utf8) | ConvertFrom-Json } catch { $null }
        if (-not $j) { if ($f.LastWriteTime -lt (Get-Date).AddMinutes(-1)) { Remove-Item $f.FullName -Force -ErrorAction SilentlyContinue }; continue }
        if ($procs.Contains($f.FullName)) { $busy[$j.lane] += 1; continue }
        $q = if ($j.pid) { Get-Process -Id $j.pid -ErrorAction SilentlyContinue }
        if ($q -and $q.StartTime.ToString('o') -eq $j.started) { $busy[$j.lane] += 1; continue }
        $extra = @{}; if ($j.slot) { $extra.slot = $j.slot }
        Start-Lane $j.lane @($j.sigs) $extra $f.FullName -Resume
        $busy[$j.lane] += 1
    }
    return $busy
}

# Bản cũ chạy tuần tự để lại lượt đang chạy ở .genbid-bot-run.json: chuyển thành tệp lượt để theo dõi tiếp như trên.
if (Test-Path $LegacyRunFile) {
    try {
        $r = [IO.File]::ReadAllText($LegacyRunFile, $Utf8) | ConvertFrom-Json
        $s0 = @($r.sigs)
        $lane = if ($s0 -contains 'config') { 'config' } elseif (@($s0 | Where-Object { $_ -match '^(files|sync|schedule):' }).Count) { 'browser' } else { 'ai' }
        $file = Join-Path $JobDir ("{0}-{1:yyyyMMdd-HHmmss-fff}.json" -f $lane, (Get-Date))
        [IO.File]::WriteAllText($file, ([ordered]@{ lane = $lane; sigs = $s0 } | ConvertTo-Json), $Utf8)
        Copy-Item $LegacyRunFile "$file.run" -Force
    } catch { Log "Không đọc được lượt dở của bản cũ: $($_.Exception.Message)" }
    Remove-Item $LegacyRunFile -Force -ErrorAction SilentlyContinue
}

try {
    while ($true) {
        try {
            if (-not (Test-Path $IngestTokenFile)) { if (-not $warned.ingest) { Log 'Thiếu .genbid-ingest-token, chờ.'; $warned.ingest = 1 } }
            elseif (-not (Test-ClaudeLogin) -and -not (Test-Path $ClaudeTokenFile) -and -not (Test-Path $ApiKeyFile)) { if (-not $warned.claude) { Log 'Thiếu .claude-bot-token (chạy `claude setup-token`), chờ.'; $warned.claude = 1 } }
            else {
                $warned = @{}
                Read-Pause
                $busy = Get-Lanes
                $pend = Get-Pending -Running:([bool]$busy.Count)
                $reqs = Get-Requests $pend
                $sigs = @($reqs.Keys)
                $state = Read-Json $StateFile ([pscustomobject]@{})
                $handed = @{}; $state.PSObject.Properties | ForEach-Object { $handed[$_.Name] = $_.Value }
                # Chỉ giữ chữ ký còn đang chờ, để tệp trạng thái không phình ra.
                foreach ($k in @($handed.Keys)) { if ($sigs -notcontains $k) { $handed.Remove($k) } }
                # Mỗi yêu cầu chỉ giao cho một lượt một lần; lượt nào không trả lời được thì báo lỗi về web.
                $due = @($sigs | Where-Object { -not $handed[$_] })
                # Yêu cầu bấm gần nhau (vd. Dịch rồi HSDT) đi chung một lượt: chờ thêm vài giây rồi đọc lại hàng chờ.
                if ($due.Count -and $GatherSeconds -gt 0) {
                    Start-Sleep -Seconds $GatherSeconds
                    $pend = Get-Pending -Running:([bool]$busy.Count)
                    $reqs = Get-Requests $pend
                    $sigs = @($reqs.Keys)
                    $due = @($sigs | Where-Object { -not $handed[$_] })
                }
                $now = Get-Date
                $hand = { param($list) foreach ($s in $list) { $handed[$s] = [pscustomobject]@{ last = $now.ToString('o') } } }

                # Trình duyệt: Lấy tệp trước, rồi Sync, rồi Sync theo lịch; mỗi lúc một lượt.
                if (-not $busy.browser -and -not (Test-WorkerRunning)) {
                    $files = @($due -like 'files:*'); $sync = @($due -like 'sync:*')
                    if ($files.Count) { & $hand $files; Start-Lane 'browser' $files }
                    elseif ($sync.Count) { & $hand $sync; Start-Lane 'browser' $sync }
                    elseif (-not @($sigs -like 'files:*').Count -and -not @($sigs -like 'sync:*').Count) {
                        # Tới lịch thì Sync. Mỗi mốc chạy một lần (mốc gần nhất đã qua trong ngày), nhớ qua các lần khởi động lại bot.
                        $today = $now.ToString('yyyy-MM-dd')
                        $slot = $ScheduleTimes | Where-Object { $now -ge [datetime]"$today $_" } | Sort-Object { [datetime]"$today $_" } | Select-Object -Last 1
                        $slotKey = "$today $slot"
                        if ($slot -and $ScheduleDays -contains $now.DayOfWeek.ToString() -and (Read-Json $ScheduleFile ([pscustomobject]@{ last = '' })).last -ne $slotKey) {
                            [IO.File]::WriteAllText($ScheduleFile, (@{ last = $slotKey } | ConvertTo-Json), $Utf8)
                            Start-Lane 'browser' @("schedule:$slotKey") @{ slot = $slotKey }
                        }
                    }
                }

                # AI: mỗi vòng các yêu cầu mới đi chung một lượt, không chờ lượt khác. Gói còn chờ Lấy tệp thì đợi (cần HSMT mới).
                $waitFiles = @($sigs -like 'files:*' | ForEach-Object { Key-Of $_ })
                $ai = @($due | Where-Object { $_ -notlike 'files:*' -and $_ -notlike 'sync:*' -and $waitFiles -notcontains (Key-Of $_) })
                if ($ai.Count) {
                    & $hand $ai
                    if ($now -lt $script:PauseUntil) {
                        # Đang tạm dừng vì hết hạn mức: trả lời ngay bằng lý do, không gọi Claude.
                        $dueReqs = [ordered]@{}; foreach ($s in $ai) { $dueReqs[$s] = $reqs[$s] }
                        try { Send-Unanswered $dueReqs $script:PauseReason } catch { Log "Không báo được lỗi về web: $($_.Exception.Message)" }
                    } else { Start-Lane 'ai' $ai }
                }

                # Cấu hình: config-bot.mjs run tự đọc hàng chờ, chạy mọi gói cùng lúc và tự trả lời web.
                if (@(@($pend.config) + @($pend.find) + @($pend.bidprice) + @($pend.spec) | Where-Object { $_ }).Count -and -not $busy.config -and $now -ge $script:ConfigWait) {
                    Start-Lane 'config' @('config')
                }
                [IO.File]::WriteAllText($StateFile, ([pscustomobject]$handed | ConvertTo-Json -Depth 4), $Utf8)
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
