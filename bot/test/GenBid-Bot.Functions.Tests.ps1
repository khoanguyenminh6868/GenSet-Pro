# GenBid-Bot.ps1, các hàm: Set-ClaudeAuth theo sổ chi API (100 USD/tháng, làm mới ngày 2, ngưỡng chuyển gói, dòng "exhausted"),
# nhịp tim beat=0, Get-Requests (chữ ký yêu cầu), Wait-Worker (hết hạn mức -> tạm dừng, API hết tiền), khoá worker.
# Hàm được nạp bằng AST vào phạm vi global; Get-Date, Invoke-WebRequest được thay bằng hàm giả. Mọi tệp .genbid-* / .anthropic-* nằm trong thư mục tạm.
. (Join-Path $PSScriptRoot 'TestHelpers.ps1')

Describe 'GenBid-Bot.ps1: hàm' {
    BeforeAll {
        $global:BotTD = $TestDrive
        $global:Now0 = [datetime]'2026-11-13 10:00:00'; $global:T0 = $global:Now0
        Import-BotFunctions 'GenBid-Bot.ps1' @('Log', 'Stamp', 'Read-Json', 'Get-ApiBudget', 'Add-ApiSpend', 'Set-ClaudeAuth', 'Clear-ClaudeAuth', 'Test-ClaudeLogin',
            'Get-Pending', 'Get-Requests', 'Key-Of', 'Test-WorkerRunning', 'Wait-Worker', 'Read-Pause')
        # Biến mà script gốc đặt ở phạm vi script.
        function global:New-Root {
            $r = New-BotTemp ('bot-' + [guid]::NewGuid().ToString('N'))
            $global:Root = $r; $global:Utf8 = $global:Utf8NoBom
            $global:IngestTokenFile = "$r/.genbid-ingest-token"; $global:ClaudeTokenFile = "$r/.claude-bot-token"; $global:ApiKeyFile = "$r/.anthropic-api-key"
            $global:ApiSpendFile = "$r/.anthropic-api-spend.jsonl"; $global:ApiBudgetFile = "$r/.anthropic-api-budget.json"
            $global:WorkerState = "$r/.hsmt-worker-state.json"; $global:LockFile = "$r/hsmt-worker.lock"; $global:PauseFile = "$r/.genbid-bot-pause.json"
            $global:LogDir = "$r/genbid-bot-logs"; New-Item -ItemType Directory -Force $global:LogDir | Out-Null
            $global:Endpoint = 'http://fake/api/requests?kind=all'; $global:PollSeconds = 15; $global:RunTimeoutMinutes = 180; $global:LimitPauseMinutes = 30
            $global:Job = $null; $global:Lane = ''; $global:PauseUntil = [datetime]::MinValue; $global:PauseReason = ''
            $global:LastBeat = [datetime]::MinValue; $global:LastBeatRunning = $null
            Write-BotText $global:IngestTokenFile 'ingest-token'; Write-BotText $global:ClaudeTokenFile 'claude-token'
            $r
        }
        function global:Spend($usd, [string]$utc, $extra = @{}) { (@{ t = $utc; usd = $usd; src = 'test' } + $extra | ConvertTo-Json -Compress) }
        function global:Write-Spend([string[]]$Lines) { [IO.File]::WriteAllText($global:ApiSpendFile, (($Lines -join "`n") + "`n"), $global:Utf8NoBom) }
        function global:Auth([datetime]$Now, [bool]$LoggedIn = $false) {
            $home1 = New-BotTemp ('home-' + [guid]::NewGuid().ToString('N'))
            if ($LoggedIn) { Write-BotText (Join-Path $home1 '.claude\.credentials.json') '{}' }
            $res = @{}
            Use-Env @{ USERPROFILE = $home1; ANTHROPIC_API_KEY = $null; CLAUDE_CODE_OAUTH_TOKEN = $null; GENBID_API_SPEND_FILE = $null; GENBID_CLAUDE_TOKEN_FILE = $null } {
                Use-FakeNow $Now { $res.Text = Set-ClaudeAuth }
                $res.ApiKey = $env:ANTHROPIC_API_KEY; $res.OAuth = $env:CLAUDE_CODE_OAUTH_TOKEN; $res.SpendFile = $env:GENBID_API_SPEND_FILE
                Clear-ClaudeAuth
            }
            $res
        }
    }

    Context 'Set-ClaudeAuth: trả bằng API key hay gói tháng' {
        BeforeEach { New-Root | Out-Null }

        It 'không có tệp .anthropic-api-key: dùng gói tháng; chưa đăng nhập thì lấy token setup-token' {
            $r = Auth $global:Now0
            Assert-Eq $r.Text 'plan'; Assert-Null $r.ApiKey; Assert-Eq $r.OAuth 'claude-token'
        }
        It 'đã đăng nhập /login thì không đặt token setup-token' {
            $r = Auth $global:Now0 $true
            Assert-Eq $r.Text 'plan'; Assert-Null $r.OAuth
        }
        It 'có API key, chưa tiêu gì: dùng API, đặt ANTHROPIC_API_KEY và đường dẫn sổ chi cho tiến trình con; không đặt OAuth' {
            Write-BotText $global:ApiKeyFile "sk-test-key`n"
            $r = Auth $global:Now0
            Assert-Eq $r.Text 'api, đã dùng 0/100 USD từ 02/11'
            Assert-Eq $r.ApiKey 'sk-test-key'; Assert-Null $r.OAuth
            Assert-Eq $r.SpendFile $global:ApiSpendFile
        }
        It 'tệp API key rỗng thì coi như không có: gói tháng' {
            Write-BotText $global:ApiKeyFile "  `n"
            Assert-Eq (Auth $global:Now0).Text 'plan'
        }
        It 'ngưỡng mặc định 90 USD: 89,99 vẫn API; đúng 90 chuyển gói tháng, lý do ghi ngưỡng' {
            Write-BotText $global:ApiKeyFile 'k'
            Write-Spend @((Spend 89.99 '2026-11-10T05:00:00Z'))
            Assert-Match (Auth $global:Now0).Text '^api, đã dùng 89.99/100'
            Write-Spend @((Spend 90 '2026-11-10T05:00:00Z'))
            $r = Auth $global:Now0
            Assert-Match $r.Text '^plan \(đã dùng 90/100 USD từ 02/11, tới ngưỡng 90 USD\)$'
            Assert-Null $r.ApiKey; Assert-Eq $r.OAuth 'claude-token'
        }
        It 'Khoa đặt switchAtUsd 98 (12/11): 97,5 vẫn API, 98 chuyển gói' {
            Write-BotText $global:ApiKeyFile 'k'
            Write-BotJson $global:ApiBudgetFile @{ monthlyUsd = 100; resetDay = 2; switchAtUsd = 98 }
            Write-Spend @((Spend 97.5 '2026-11-10T05:00:00Z'))
            Assert-Match (Auth $global:Now0).Text '^api'
            Write-Spend @((Spend 98 '2026-11-10T05:00:00Z'))
            Assert-Match (Auth $global:Now0).Text 'tới ngưỡng 98 USD'
        }
        It 'dòng "exhausted" (API báo hết tiền) chuyển gói tháng dù mới tiêu 0 USD; lý do ghi "API báo hết tiền"' {
            Write-BotText $global:ApiKeyFile 'k'
            Write-Spend @((Spend 0 '2026-11-10T05:00:00Z' @{ exhausted = $true }))
            $r = Auth $global:Now0
            Assert-Eq $r.Text 'plan (API báo hết tiền)'
            Assert-Null $r.ApiKey
        }
        It 'kỳ làm mới ngày 2: chi trước 02/11 (kỳ trước) không tính; từ 02/11 trở đi tính' {
            Write-BotText $global:ApiKeyFile 'k'
            Write-Spend @((Spend 95 '2026-11-01T12:00:00Z'), (Spend 20 '2026-11-02T12:00:00Z'))
            Assert-Eq (Auth $global:Now0).Text 'api, đã dùng 20/100 USD từ 02/11'
        }
        It 'dòng exhausted của kỳ trước không làm bot ở lại gói tháng sang kỳ mới' {
            Write-BotText $global:ApiKeyFile 'k'
            Write-Spend @((Spend 0 '2026-10-30T12:00:00Z' @{ exhausted = $true }))
            Assert-Match (Auth $global:Now0).Text '^api'
        }
        It 'ngày 01/11 (trước ngày làm mới 2): kỳ bắt đầu 02/10, chi cuối tháng trước vẫn tính' {
            Write-BotText $global:ApiKeyFile 'k'
            Write-Spend @((Spend 50 '2026-10-20T12:00:00Z'), (Spend 5 '2026-10-01T12:00:00Z'))
            Assert-Eq (Auth ([datetime]'2026-11-01 08:00:00')).Text 'api, đã dùng 50/100 USD từ 02/10'
        }
        It 'dòng sổ hỏng (không phải JSON, không có ngày, rỗng) bị bỏ qua, các dòng sau vẫn tính' {
            Write-BotText $global:ApiKeyFile 'k'
            Write-Spend @((Spend 10 '2026-11-05T05:00:00Z'), 'không phải json', '', 'null', '{"usd": 7}', (Spend 5.25 '2026-11-06T05:00:00Z'))
            Assert-Eq (Auth $global:Now0).Text 'api, đã dùng 15.25/100 USD từ 02/11'
        }
        It 'số tiền cộng dồn làm tròn 2 chữ số' {
            Write-BotText $global:ApiKeyFile 'k'
            Write-Spend @((Spend 0.123456 '2026-11-05T05:00:00Z'), (Spend 0.111111 '2026-11-06T05:00:00Z'))
            Assert-Match (Auth $global:Now0).Text 'đã dùng 0[.,]23/100'
        }
        It 'hết hạn mức API mà chưa đăng nhập: dùng token setup-token' {
            Write-BotText $global:ApiKeyFile 'k'
            Write-Spend @((Spend 95 '2026-11-10T05:00:00Z'))
            Assert-Eq (Auth $global:Now0).OAuth 'claude-token'
            Assert-Null (Auth $global:Now0 $true).OAuth
        }
        It 'ngưỡng, hạn mức, ngày làm mới đọc từ .anthropic-api-budget.json; thiếu trường thì giữ mặc định' {
            Write-BotJson $global:ApiBudgetFile @{ monthlyUsd = 50 }
            Write-Spend @((Spend 1 '2026-11-05T05:00:00Z'))
            $b = Use-FakeNow $global:Now0 { Get-ApiBudget }
            Assert-Eq $b.Limit 50; Assert-Eq $b.SwitchAt 90; Assert-Eq $b.Spent 1
        }
    }

    Context 'Add-ApiSpend: ghi sổ chi' {
        BeforeEach { New-Root | Out-Null }
        It 'ghi một dòng JSON: thời điểm UTC, usd làm tròn 4 chữ số, nguồn; đọc lại được bằng Get-ApiBudget' {
            Use-FakeNow ([datetime]'2026-11-13 10:00:00') { Add-ApiSpend 1.234567 'agent' }
            $e = (Get-Content -Raw $global:ApiSpendFile | ConvertFrom-Json)
            Assert-Eq $e.usd 1.2346; Assert-Eq $e.src 'agent'
            Assert-Null $e.exhausted
        }
        It '-Exhausted ghi cờ exhausted và Set-ClaudeAuth chuyển về gói tháng ngay sau đó' {
            Write-BotText $global:ApiKeyFile 'k'
            Use-FakeNow ([datetime]::UtcNow) { Add-ApiSpend 0 'agent' -Exhausted }
            Assert-True (Get-Content -Raw $global:ApiSpendFile | ConvertFrom-Json).exhausted
            Assert-Eq (Auth ([datetime]::Now)).Text 'plan (API báo hết tiền)'
        }
    }

    Context 'nhịp tim: beat=0 trừ khi tới 55 giây hoặc đổi trạng thái' {
        BeforeEach {
            New-Root | Out-Null
            $global:Urls = @()
            function global:Invoke-WebRequest { param($Uri) $global:Urls += $Uri; [pscustomobject]@{ RawContentStream = (New-Object IO.MemoryStream (, [Text.Encoding]::UTF8.GetBytes('{"files":[]}'))) } }
        }
        AfterEach { Remove-Item Function:\Invoke-WebRequest -ErrorAction SilentlyContinue }
        function global:Poll([datetime]$t, [switch]$Running, [switch]$BeatOnly) { Use-FakeNow $t { Get-Pending -Running:$Running -BeatOnly:$BeatOnly } }

        It 'lần hỏi đầu: là nhịp tim (không beat=0), gửi kèm token Bearer' {
            Poll $global:T0 | Out-Null
            Assert-Eq $global:Urls[0] 'http://fake/api/requests?kind=all'
        }
        It 'hỏi lại sau 10 giây, cùng trạng thái: beat=0 (web không ghi log)' {
            Poll $global:T0 | Out-Null; Poll $global:T0.AddSeconds(10) | Out-Null
            Assert-Eq $global:Urls[1] 'http://fake/api/requests?kind=all&beat=0'
        }
        It 'biên 55 giây: 54 giây vẫn beat=0, đúng 55 giây là nhịp tim; beat=0 không làm mới mốc' {
            Poll $global:T0 | Out-Null; Poll $global:T0.AddSeconds(30) | Out-Null; Poll $global:T0.AddSeconds(54) | Out-Null; Poll $global:T0.AddSeconds(55) | Out-Null
            Assert-Match $global:Urls[1] 'beat=0'; Assert-Match $global:Urls[2] 'beat=0'; Assert-NotMatch $global:Urls[3] 'beat=0'
        }
        It 'đổi trạng thái running (rảnh -> bận) thì gửi nhịp tim ngay, kèm running=1' {
            Poll $global:T0 | Out-Null; Poll $global:T0.AddSeconds(5) -Running | Out-Null
            Assert-Eq $global:Urls[1] 'http://fake/api/requests?kind=all&running=1'
        }
        It 'đang bận, hỏi lại cùng trạng thái: running=1&beat=0' {
            Poll $global:T0 -Running | Out-Null; Poll $global:T0.AddSeconds(5) -Running | Out-Null
            Assert-Eq $global:Urls[1] 'http://fake/api/requests?kind=all&running=1&beat=0'
        }
        It '-BeatOnly: chưa tới lúc thì không hỏi gì và trả $null; tới lúc thì hỏi' {
            Poll $global:T0 | Out-Null
            Assert-Null (Poll $global:T0.AddSeconds(20) -BeatOnly)
            Assert-Eq $global:Urls.Count 1
            Poll $global:T0.AddSeconds(60) -BeatOnly | Out-Null
            Assert-Eq $global:Urls.Count 2
        }
    }

    Context 'Get-Requests: chữ ký yêu cầu "loại:TBMT|requestedAt"' {
        BeforeEach { New-Root | Out-Null }
        It 'mỗi loại yêu cầu ra chữ ký và collection *req đúng' {
            $p = '{"files":[{"key":"K1","notifyNo":"IB1","sourceUrl":"u","bidName":"n","requestedAt":"t1"}],"analysis":[{"key":"K2","notifyNo":"IB2","requestedAt":"t2"}],"translation":[{"key":"K3","notifyNo":"IB3","requestedAt":"t3"}],"compare":[{"key":"K4","requestedAt":"t4"}],"tlkt":[{"key":"K5","requestedAt":"t5"}],"hsdt":[{"key":"K6","requestedAt":"t6"}],"sync":{"pending":true,"requestedAt":"t7"}}' | ConvertFrom-Json
            $r = Get-Requests $p
            Assert-Eq @($r.Keys) @('files:K1|t1', 'analysis:K2|t2', 'translation:K3|t3', 'compare:K4|t4', 'tlkt:K5|t5', 'hsdt:K6|t6', 'sync:t7')
            Assert-Eq $r['files:K1|t1'].coll 'hsmtreq'; Assert-Eq $r['files:K1|t1'].data.sourceUrl 'u'
            Assert-Eq $r['analysis:K2|t2'].coll 'analysisreq'; Assert-Eq $r['translation:K3|t3'].coll 'translationreq'
            Assert-Eq $r['compare:K4|t4'].coll 'comparereq'; Assert-Eq $r['tlkt:K5|t5'].coll 'tlktreq'; Assert-Eq $r['hsdt:K6|t6'].coll 'hsdtreq'
            Assert-Eq $r['sync:t7'].coll 'syncreq'; Assert-Eq $r['sync:t7'].id 'current'; Assert-Eq $r['sync:t7'].data.from 'web'
        }
        It 'yêu cầu mới của cùng gói (requestedAt khác) là chữ ký khác: được giao lại; cùng requestedAt là một chữ ký' {
            $a = '{"analysis":[{"key":"K","requestedAt":"t1"}]}' | ConvertFrom-Json
            $b = '{"analysis":[{"key":"K","requestedAt":"t2"}]}' | ConvertFrom-Json
            Assert-Ne @((Get-Requests $a).Keys) @((Get-Requests $b).Keys)
            Assert-Eq @((Get-Requests $a).Keys) @((Get-Requests $a).Keys)
        }
        It 'Sync không chờ (pending false) và mảng rỗng / phần tử null thì không ra yêu cầu' {
            $p = '{"files":[null],"analysis":[],"sync":{"pending":false,"requestedAt":"t"}}' | ConvertFrom-Json
            Assert-Eq (Get-Requests $p).Count 0
        }
        It 'yêu cầu lấy tệp worker đã làm (.hsmt-worker-state.json done "key|requestedAt") thì bỏ qua; requestedAt khác thì không' {
            Write-BotJson $global:WorkerState @{ done = @('K1|t1') }
            $p = '{"files":[{"key":"K1","requestedAt":"t1"},{"key":"K1","requestedAt":"t2"}]}' | ConvertFrom-Json
            Assert-Eq @((Get-Requests $p).Keys) @('files:K1|t2')
        }
        It 'Key-Of lấy TBMT từ chữ ký' {
            Assert-Eq (Key-Of 'analysis:IB2600000001|2026-11-13T10:00:00.000Z') 'IB2600000001'
            Assert-Eq (Key-Of 'files:K|t') 'K'
        }
    }

    Context 'Wait-Worker: kết thúc lượt, hết hạn mức, API hết tiền, khoá worker' {
        BeforeEach {
            New-Root | Out-Null
            $global:Fake = { param($code, $start) $f = [pscustomobject]@{ StartTime = $start; ExitCode = $code; Id = 999999 }; $f | Add-Member ScriptMethod WaitForExit { param($ms) $true } -Force; $f }
        }
        function global:Wait([string]$Log, $Code = 1, [datetime]$Now = [datetime]'2026-11-13 10:00:00', [string]$Err = '', [datetime]$Start = [datetime]'2026-11-13 09:00:00') {
            $out = Join-Path $global:Root 'run.log'; Write-BotText $out $Log
            if ($Err) { Write-BotText "$out.err" $Err } elseif (Test-Path "$out.err") { Remove-Item "$out.err" }
            $p = & $global:Fake $Code $Start
            Use-FakeNow $Now { Wait-Worker $p $out 6>$null }
        }
        It 'thoát mã 0 mà không trả lời được yêu cầu: báo "chưa xử lý được", không tạm dừng' {
            Assert-Match (Wait 'xong' 0) 'chưa xử lý được yêu cầu này'
            Assert-True ($global:PauseUntil -le [datetime]::MinValue)
        }
        It 'thoát mã khác 0, không rõ lý do: báo lỗi kèm mã' {
            Assert-Match (Wait 'lỗi lạ' 3) 'bị lỗi \(mã 3\)'
        }
        It 'hết hạn mức "hit your limit · resets 1:30pm": tạm dừng tới 13:30 cùng ngày, ghi .genbid-bot-pause.json, lý do ghi giờ làm mới' {
            $msg = Wait "You've hit your limit · resets 1:30pm (Asia/Saigon)"
            Assert-Match $msg 'làm mới lúc 1:30pm'
            Assert-Eq $global:PauseUntil.ToString('yyyy-MM-dd HH:mm') '2026-11-13 13:30'
            $pz = Get-Content -Raw -Encoding UTF8 $global:PauseFile | ConvertFrom-Json
            Assert-Match $pz.reason 'Agent tạm hết hạn mức'
            Assert-Eq ([datetime]$pz.until).ToString('HH:mm') '13:30'
        }
        It 'giờ làm mới đã qua trong ngày thì tạm dừng tới ngày mai; 12am là nửa đêm, 12pm là trưa' {
            Wait "Usage limit reached. resets 9am" 1 ([datetime]'2026-11-13 10:00:00') | Out-Null
            Assert-Eq $global:PauseUntil.ToString('yyyy-MM-dd HH:mm') '2026-11-14 09:00'
            Wait "usage limit resets 12pm" 1 ([datetime]'2026-11-13 10:00:00') | Out-Null
            Assert-Eq $global:PauseUntil.ToString('yyyy-MM-dd HH:mm') '2026-11-13 12:00'
            Wait "usage limit resets 12am" 1 ([datetime]'2026-11-13 10:00:00') | Out-Null
            Assert-Eq $global:PauseUntil.ToString('yyyy-MM-dd HH:mm') '2026-11-14 00:00'
        }
        It 'không đoán được giờ làm mới thì tạm dừng $LimitPauseMinutes (30) phút' {
            Wait 'rate limit exceeded' | Out-Null
            Assert-Eq $global:PauseUntil.ToString('HH:mm') '10:30'
        }
        It 'thoát mã 0 thì chữ "usage limit" trong log không gây tạm dừng' {
            Wait 'usage limit' 0 | Out-Null
            Assert-True ($global:PauseUntil -le [datetime]::MinValue)
            Assert-False (Test-Path $global:PauseFile)
        }
        It 'dòng JSON của agent (nội dung tệp HSMT có chữ "rate limit") không tính; dòng result cuối thì tính' {
            $stream = '{"type":"user","text":"điều khoản rate limit của nhà cung cấp"}'
            Assert-NotMatch (Wait $stream) 'hạn mức'
            Assert-True ($global:PauseUntil -le [datetime]::MinValue)
            $res = $stream + "`n" + '{"type":"result","is_error":true,"result":"You have hit your usage limit"}'
            Assert-Match (Wait $res) 'hết hạn mức'
        }
        It 'thông báo nằm ở tệp .err cũng được dò' {
            Assert-Match (Wait '' 1 ([datetime]'2026-11-13 10:00:00') 'Claude AI usage limit reached') 'hết hạn mức'
        }
        It 'lượt con trước đã chết (ExitCode $null): vẫn dò hết hạn mức trong log' {
            Assert-Match (Wait 'usage limit' $null) 'hết hạn mức'
        }
        It 'API hết tiền: ghi dòng exhausted vào sổ chi, các lượt sau về gói tháng; trả lời nói rõ' {
            Use-Env @{ ANTHROPIC_API_KEY = 'k' } {
                $msg = Wait 'Your credit balance is too low to access the Anthropic API'
                Assert-Match $msg 'đã chuyển sang gói tháng'
            }
            Assert-True (Get-Content -Raw $global:ApiSpendFile | ConvertFrom-Json).exhausted
        }
        It 'đạt hạn mức sử dụng của chính API ("reached your specified API usage limits") cũng là exhausted' {
            Use-Env @{ ANTHROPIC_API_KEY = 'k' } { Wait 'You have reached your specified API usage limits' | Out-Null }
            Assert-True (Get-Content -Raw $global:ApiSpendFile | ConvertFrom-Json).exhausted
        }
        It 'không dùng API key mà báo thiếu tiền: không ghi exhausted vào sổ' {
            Use-Env @{ ANTHROPIC_API_KEY = $null } { Wait 'credit balance is too low' | Out-Null }
            Assert-False (Test-Path $global:ApiSpendFile)
        }
        It 'API key sai: báo kiểm lại tệp .anthropic-api-key, không tạm dừng' {
            Assert-Match (Wait 'authentication_error: invalid x-api-key') 'API key Anthropic không hợp lệ'
            Assert-True ($global:PauseUntil -le [datetime]::MinValue)
        }
        It 'quá thời hạn chờ: dừng tiến trình, báo chạy quá số phút' {
            $p = [pscustomobject]@{ StartTime = [datetime]::Now; ExitCode = $null; Id = 999999 }
            $p | Add-Member ScriptMethod WaitForExit { param($ms) $false } -Force
            $global:RunTimeoutMinutes = 0
            Assert-Match (Wait-Worker $p (Join-Path $global:Root 'x.log') 6>$null) 'quá 0 phút'
        }
        It 'lượt Trình duyệt xong: xoá khoá worker viết sau lúc nó bắt đầu; khoá cũ hơn thì để nguyên' {
            $global:Lane = 'browser'
            Write-BotText $global:LockFile 'x'; (Get-Item -Force $global:LockFile).LastWriteTime = [datetime]'2026-11-13 09:30:00'
            Wait 'xong' 0 | Out-Null
            Assert-False (Test-Path $global:LockFile)
            Write-BotText $global:LockFile 'x'; (Get-Item -Force $global:LockFile).LastWriteTime = [datetime]'2026-11-13 08:00:00'
            Wait 'xong' 0 | Out-Null
            Assert-True (Test-Path $global:LockFile)
            $global:Lane = ''
        }
        It 'lượt AI hay Cấu hình xong không được xoá khoá của một Sync đang chạy song song' {
            foreach ($lane in 'ai', 'config') {
                $global:Lane = $lane
                Write-BotText $global:LockFile 'x'; (Get-Item -Force $global:LockFile).LastWriteTime = [datetime]'2026-11-13 09:30:00'
                Wait 'xong' 0 | Out-Null
                Assert-True (Test-Path $global:LockFile) $lane
            }
            $global:Lane = ''
        }
    }

    Context 'Test-WorkerRunning: khoá worker' {
        BeforeEach { New-Root | Out-Null }
        It 'không có khoá: rảnh; khoá mới: đang chạy' {
            Assert-False (Test-WorkerRunning 6>$null)
            Write-BotText $global:LockFile 'x'
            Assert-True (Test-WorkerRunning 6>$null)
        }
        It 'khoá cũ hơn $RunTimeoutMinutes (180) phút bị bỏ và coi là rảnh; 179 phút vẫn là đang chạy' {
            Write-BotText $global:LockFile 'x'; (Get-Item -Force $global:LockFile).LastWriteTime = [datetime]::Now.AddMinutes(-179)
            Assert-True (Test-WorkerRunning 6>$null)
            (Get-Item -Force $global:LockFile).LastWriteTime = [datetime]::Now.AddMinutes(-181)
            Assert-False (Test-WorkerRunning 6>$null)
            Assert-False (Test-Path $global:LockFile)
        }
    }

    Context 'Read-Pause: tạm dừng nhớ qua các lần khởi động lại' {
        BeforeEach { New-Root | Out-Null }
        It 'đọc until và reason từ .genbid-bot-pause.json; tệp hỏng hoặc không có thì giữ nguyên' {
            Write-BotJson $global:PauseFile @{ until = '2026-11-13T13:30:00.0000000'; reason = 'hết hạn mức' }
            Read-Pause
            Assert-Eq $global:PauseUntil.ToString('HH:mm') '13:30'; Assert-Eq $global:PauseReason 'hết hạn mức'
            Write-BotText $global:PauseFile '{hỏng'
            Read-Pause
            Assert-Eq $global:PauseReason 'hết hạn mức'
        }
    }
}
