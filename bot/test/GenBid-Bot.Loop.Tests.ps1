# GenBid-Bot.ps1, vòng quét: lịch Sync 10:10 / 14:10 / 18:10, phân nhóm lượt (browser một lượt / ai không giới hạn / config một tiến trình),
# chữ ký yêu cầu đã giao, tạm dừng, lượt con chết (-Resume), lượt con -Job.
# Chạy trọn MỘT vòng (-Once) từ bản chép của script (tên mutex riêng: bot thật giữ 'Global\GenBidBot'); web, Start-Process, powershell, Get-Date là hàm giả.
# Không chạy node, không gọi claude: lượt con không được khởi động thật (Start-Process giả chỉ ghi lại tham số).
. (Join-Path $PSScriptRoot 'TestHelpers.ps1')

Describe 'GenBid-Bot.ps1: vòng quét' {
    BeforeAll {
        $global:BotTD = $TestDrive
        $global:BotCopy = New-BotCopy (New-BotTemp 'botcopy')
        $global:Sat = [datetime]'2026-11-14 00:00:00'   # thứ Bảy
        function global:Invoke-WebRequest {
            param($Uri)
            $global:Urls += $Uri
            [pscustomobject]@{ RawContentStream = (New-Object IO.MemoryStream (, [Text.Encoding]::UTF8.GetBytes(($global:Pend | ConvertTo-Json -Depth 8)))) }
        }
        function global:Start-Process {
            param($FilePath, $ArgumentList, $WorkingDirectory, $WindowStyle, [switch]$PassThru)
            $global:Spawned += , @{ File = $FilePath; Args = @($ArgumentList) }
            [pscustomobject]@{ Id = 424200 + $global:Spawned.Count; Handle = 1; StartTime = [datetime]'2026-11-13 08:00:00'; HasExited = $false; ExitCode = $null }
        }
        # Thay Post-GenBidDocs.ps1: chép các tệp dưới -Dir ra $global:Posted (coll\id -> nội dung JSON).
        function global:powershell {
            $a = @($args); $i = [array]::IndexOf($a, '-Dir')
            if ($i -ge 0) { Get-ChildItem $a[$i + 1] -Recurse -File | ForEach-Object { $global:Posted[($_.FullName.Substring($a[$i + 1].Length + 1) -replace '\\', '/')] = (Get-Content -Raw -Encoding UTF8 $_.FullName | ConvertFrom-Json) } }
            $global:LASTEXITCODE = 0
        }
        function global:Empty-Pending { @{ files = @(); analysis = @(); translation = @(); compare = @(); tlkt = @(); hsdt = @(); sync = @{ pending = $false }; config = @(); find = @(); bidprice = @(); spec = @() } }
        function global:Req($key, $at = '2026-11-14T01:00:00.000Z') { @{ key = $key; notifyNo = $key; requestedAt = $at; sourceUrl = 'u'; bidName = 'n' } }

        # Dựng thư mục gốc giả của bot.
        function global:New-BotRoot {
            $r = New-BotTemp ('loop-' + [guid]::NewGuid().ToString('N'))
            Write-BotText "$r/.genbid-ingest-token" 'tok'; Write-BotText "$r/.claude-bot-token" 'ct'
            $r
        }
        # Chạy một vòng. $Now: giờ giả; $Extra: tham số thêm (hashtable) cho script. Trả tình trạng sau vòng.
        function global:Run-Loop([string]$Root, [datetime]$Now, [hashtable]$Extra = @{}) {
            $global:Urls = @(); $global:Spawned = @(); $global:Posted = @{}
            $p = @{ Root = $Root; Endpoint = 'http://fake/api/requests?kind=all'; RepoDir = "$Root/repo"; Once = $true; GatherSeconds = 0; PollSeconds = 1 } + $Extra
            Use-Env @{ USERPROFILE = $Root } { Use-FakeNow $Now { & $global:BotCopy @p 6>&1 | Out-Null } }
            Get-LoopState $Root
        }
        function global:Get-LoopState([string]$Root) {
            $jobs = @(Get-ChildItem "$Root/.genbid-bot-jobs" -Filter *.json -File -ErrorAction SilentlyContinue | ForEach-Object { $j = try { Get-Content -Raw -Encoding UTF8 $_.FullName | ConvertFrom-Json } catch { $null }; if ($j) { $j | Add-Member File $_.FullName -PassThru } })
            @{ Jobs = $jobs; Lanes = @($jobs | ForEach-Object { $_.lane } | Sort-Object)
               State = $(if (Test-Path "$Root/.genbid-bot-state.json") { Get-Content -Raw -Encoding UTF8 "$Root/.genbid-bot-state.json" | ConvertFrom-Json })
               Schedule = $(if (Test-Path "$Root/.genbid-bot-schedule.json") { (Get-Content -Raw -Encoding UTF8 "$Root/.genbid-bot-schedule.json" | ConvertFrom-Json).last })
               Log = (Get-ChildItem "$Root/genbid-bot-logs" -Filter *.log -ErrorAction SilentlyContinue | ForEach-Object { Get-Content -Raw -Encoding UTF8 $_.FullName }) -join "`n" }
        }
        function global:Lane($s, [string]$l) { @($s.Jobs | Where-Object { $_.lane -eq $l }) }
        function global:StateKeys($s) { if ($s.State) { @($s.State.PSObject.Properties.Name | Sort-Object) } else { @() } }
        function global:At([string]$hm, [string]$day = '2026-11-14') { [datetime]"$day $hm" }
        # Tệp lượt đang chạy thật (pid của chính tiến trình Pester) hoặc đã chết.
        function global:Write-Job([string]$Root, [string]$Lane, [string[]]$Sigs, [bool]$Alive, [string]$Name = '') {
            $f = "$Root/.genbid-bot-jobs/$(if ($Name) { $Name } else { "$Lane-old" }).json"
            $o = @{ lane = $Lane; sigs = $Sigs }
            if ($Alive) { $o.pid = $PID; $o.started = (Get-Process -Id $PID).StartTime.ToString('o') } else { $o.pid = 999999; $o.started = '2026-11-13T07:00:00.0000000+00:00' }
            Write-BotJson $f $o
            $f
        }
    }
    BeforeEach { $global:Pend = Empty-Pending }
    AfterAll { foreach ($f in 'Invoke-WebRequest', 'Start-Process', 'powershell') { Remove-Item "Function:\$f" -Force -ErrorAction SilentlyContinue } }

    Context 'tham số mặc định của lịch' {
        It 'Sync 10:10, 14:10, 18:10 mọi ngày trong tuần kể cả thứ Bảy và Chủ nhật (Khoa 04/11)' {
            $d = Get-BotParamDefaults 'GenBid-Bot.ps1'
            Assert-Eq @($d.ScheduleTimes) @('10:10', '14:10', '18:10')
            Assert-Eq @($d.ScheduleDays) @('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
        }
        It 'quét mỗi 15 giây, lượt chạy tối đa 180 phút, tạm dừng 30 phút khi không rõ giờ làm mới; hỏi hàng chờ ở /api/requests?kind=all' {
            $d = Get-BotParamDefaults 'GenBid-Bot.ps1'
            Assert-Eq $d.PollSeconds 15; Assert-Eq $d.RunTimeoutMinutes 180; Assert-Eq $d.LimitPauseMinutes 30
            Assert-Match $d.Endpoint '/api/requests\?kind=all$'
        }
    }

    Context 'lịch Sync' {
        It 'trước 10:10: chưa Sync' {
            $r = New-BotRoot; $s = Run-Loop $r (At '09:00')
            Assert-Eq @($s.Jobs).Count 0
            Assert-Null $s.Schedule
        }
        It '10:09 chưa tới mốc; 10:10 đúng mốc thì Sync (mốc 10:10, lượt browser, chữ ký schedule:<ngày giờ>)' {
            Assert-Eq @((Run-Loop (New-BotRoot) (At '10:09')).Jobs).Count 0
            $s = Run-Loop (New-BotRoot) (At '10:10')
            Assert-Eq @($s.Jobs).Count 1
            Assert-Eq $s.Jobs[0].lane 'browser'
            Assert-Eq @($s.Jobs[0].sigs) @('schedule:2026-11-14 10:10')
            Assert-Eq $s.Jobs[0].slot '2026-11-14 10:10'
            Assert-Eq $s.Schedule '2026-11-14 10:10'
        }
        It 'mỗi mốc chỉ chạy một lần: vòng sau trong cùng mốc không tạo lượt mới (nhớ qua khởi động lại bot)' {
            $r = New-BotRoot
            Run-Loop $r (At '10:30') | Out-Null
            Remove-Item "$r/.genbid-bot-jobs/*" -Force
            $s = Run-Loop $r (At '10:45')
            Assert-Eq @($s.Jobs).Count 0
        }
        It 'sang mốc 14:10 thì Sync lần nữa; 18:10 lần nữa' {
            $r = New-BotRoot
            Write-BotJson "$r/.genbid-bot-schedule.json" @{ last = '2026-11-14 10:10' }
            Assert-Eq (Run-Loop $r (At '14:20')).Schedule '2026-11-14 14:10'
            Remove-Item "$r/.genbid-bot-jobs/*" -Force
            Assert-Eq (Run-Loop $r (At '18:10')).Schedule '2026-11-14 18:10'
        }
        It 'máy tắt lúc 10:10 và 14:10, bật lại 17:00: chạy MỘT lần bù cho mốc gần nhất đã qua (14:10), không chạy cả hai' {
            $s = Run-Loop (New-BotRoot) (At '17:00')
            Assert-Eq @($s.Jobs).Count 1
            Assert-Eq $s.Jobs[0].slot '2026-11-14 14:10'
        }
        It 'khuya (23:00): mốc 18:10 chưa chạy thì chạy bù' {
            Assert-Eq (Run-Loop (New-BotRoot) (At '23:00')).Jobs[0].slot '2026-11-14 18:10'
        }
        It 'Chủ nhật cũng chạy (Khoa 04/11)' {
            $s = Run-Loop (New-BotRoot) (At '10:15' '2026-11-15')
            Assert-Eq $s.Jobs[0].slot '2026-11-15 10:10'
        }
        It '-ScheduleDays giới hạn ngày: thứ Bảy không nằm trong danh sách thì không Sync' {
            $s = Run-Loop (New-BotRoot) (At '11:00') @{ ScheduleDays = @('Monday') }
            Assert-Eq @($s.Jobs).Count 0
        }
        It 'có yêu cầu Lấy tệp đang chờ thì chưa Sync theo lịch (Lấy tệp trước, mốc để lượt sau)' {
            $global:Pend.files = @((Req 'K1'))
            $r = New-BotRoot; $s = Run-Loop $r (At '11:00')
            Assert-Eq @($s.Jobs | ForEach-Object { $_.sigs }) @('files:K1|2026-11-14T01:00:00.000Z')
            Assert-Null $s.Schedule
        }
        It 'có yêu cầu Sync của web đang chờ thì chạy yêu cầu đó, không thêm Sync theo lịch' {
            $global:Pend.sync = @{ pending = $true; requestedAt = 'T1' }
            $s = Run-Loop (New-BotRoot) (At '11:00')
            Assert-Eq @($s.Jobs).Count 1
            Assert-Eq @($s.Jobs[0].sigs) @('sync:T1')
            Assert-Null $s.Schedule
        }
        It 'lượt browser đang chạy thì không bắt đầu Sync theo lịch (mỗi lúc một lượt browser); mốc chưa bị đánh dấu' {
            $r = New-BotRoot; Write-Job $r 'browser' @('files:OLD|t') $true | Out-Null
            $s = Run-Loop $r (At '11:00')
            Assert-Eq @($s.Jobs).Count 1
            Assert-Eq $global:Spawned.Count 0
            Assert-Null $s.Schedule
        }
        It 'worker đang chạy (khoá .hsmt-worker.lock còn mới) thì không Sync; khoá quá 180 phút thì bỏ khoá và Sync' {
            $r = New-BotRoot
            Write-BotText "$r/.hsmt-worker.lock" 'x'; (Get-Item "$r/.hsmt-worker.lock").LastWriteTime = (At '10:55')
            Assert-Eq @((Run-Loop $r (At '11:00')).Jobs).Count 0
            (Get-Item "$r/.hsmt-worker.lock").LastWriteTime = (At '11:00').AddMinutes(-181)
            Assert-Eq @((Run-Loop $r (At '11:00')).Jobs).Count 1
            Assert-False (Test-Path "$r/.hsmt-worker.lock")
        }
    }

    Context 'phân nhóm lượt: browser / ai / config' {
        It 'Lấy tệp đi lượt browser, chữ ký đủ "files:<key>|<requestedAt>"; lượt Phân tích của gói khác đi lượt ai song song' {
            $global:Pend.files = @((Req 'K1')); $global:Pend.analysis = @((Req 'K2'))
            $s = Run-Loop (New-BotRoot) (At '09:00')
            Assert-Eq $s.Lanes @('ai', 'browser')
            Assert-Eq @((Lane $s 'browser')[0].sigs) @('files:K1|2026-11-14T01:00:00.000Z')
            Assert-Eq @((Lane $s 'ai')[0].sigs) @('analysis:K2|2026-11-14T01:00:00.000Z')
        }
        It 'yêu cầu Phân tích của gói còn đang chờ Lấy tệp thì đợi (cần HSMT mới): chưa giao, chưa ghi vào trạng thái đã giao' {
            $global:Pend.files = @((Req 'K1')); $global:Pend.analysis = @((Req 'K1'))
            $s = Run-Loop (New-BotRoot) (At '09:00')
            Assert-Eq $s.Lanes @('browser')
            Assert-Eq (StateKeys $s) @('files:K1|2026-11-14T01:00:00.000Z')
        }
        It 'Lấy tệp có trước, Sync chờ sau (mỗi lúc một lượt browser): chỉ files được giao, sync chưa vào trạng thái' {
            $global:Pend.files = @((Req 'K1')); $global:Pend.sync = @{ pending = $true; requestedAt = 'T1' }
            $s = Run-Loop (New-BotRoot) (At '09:00')
            Assert-Eq @($s.Jobs).Count 1
            Assert-Eq @($s.Jobs[0].sigs) @('files:K1|2026-11-14T01:00:00.000Z')
            Assert-Eq (StateKeys $s) @('files:K1|2026-11-14T01:00:00.000Z')
        }
        It 'Phân tích, Dịch, Đối chiếu, TLKT, HSDT bấm gần nhau đi chung MỘT lượt ai' {
            $global:Pend.analysis = @((Req 'A')); $global:Pend.translation = @((Req 'B')); $global:Pend.compare = @((Req 'C')); $global:Pend.tlkt = @((Req 'D')); $global:Pend.hsdt = @((Req 'E'))
            $s = Run-Loop (New-BotRoot) (At '09:00')
            Assert-Eq @($s.Jobs).Count 1
            Assert-Eq @($s.Jobs[0].sigs).Count 5
            Assert-Eq $s.Jobs[0].lane 'ai'
        }
        It 'lượt ai không giới hạn: đang có một lượt ai chạy, yêu cầu mới vẫn bắt đầu lượt ai thứ hai' {
            $r = New-BotRoot; Write-Job $r 'ai' @('analysis:OLD|t') $true | Out-Null
            $global:Pend.analysis = @((Req 'NEW'))
            $s = Run-Loop $r (At '09:00')
            Assert-Eq @(Lane $s 'ai').Count 2
            Assert-Eq $global:Spawned.Count 1
        }
        It 'config / find / bidprice / spec: mỗi loại đều gọi MỘT lượt config (config-bot.mjs chạy mọi gói)' {
            foreach ($k in 'config', 'find', 'bidprice', 'spec') {
                $global:Pend = Empty-Pending; $global:Pend[$k] = @(@{ key = 'K'; requestedAt = 't' })
                $s = Run-Loop (New-BotRoot) (At '09:00')
                Assert-Eq $s.Lanes @('config') $k
                Assert-Eq @($s.Jobs[0].sigs) @('config') $k
            }
        }
        It 'nhiều yêu cầu config cùng lúc vẫn chỉ một lượt config; đang có lượt config chạy thì không bắt đầu thêm' {
            $global:Pend.config = @(@{ key = 'A' }, @{ key = 'B' }); $global:Pend.bidprice = @(@{ key = 'C' })
            Assert-Eq @(Lane (Run-Loop (New-BotRoot) (At '09:00')) 'config').Count 1
            $r = New-BotRoot; Write-Job $r 'config' @('config') $true | Out-Null
            $s = Run-Loop $r (At '09:00')
            Assert-Eq @(Lane $s 'config').Count 1
            Assert-Eq $global:Spawned.Count 0
        }
        It 'không có yêu cầu nào: không lượt nào' {
            Assert-Eq @((Run-Loop (New-BotRoot) (At '09:00')).Jobs).Count 0
        }
        It 'ba nhóm chạy song song trong một vòng: Lấy tệp, Phân tích gói khác, Gợi ý cấu hình' {
            $global:Pend.files = @((Req 'K1')); $global:Pend.analysis = @((Req 'K2')); $global:Pend.config = @(@{ key = 'K3' })
            Assert-Eq (Run-Loop (New-BotRoot) (At '09:00')).Lanes @('ai', 'browser', 'config')
        }
        It 'lượt con khởi động bằng powershell.exe -Job <tệp> -Root … ẩn cửa sổ, truyền đủ tham số' {
            $global:Pend.analysis = @((Req 'K2'))
            Run-Loop (New-BotRoot) (At '09:00') | Out-Null
            $a = $global:Spawned[0].Args -join ' '
            Assert-Eq $global:Spawned[0].File 'powershell.exe'
            Assert-Match $a '-Job "[^"]+ai-[^"]+\.json"'
            Assert-Match $a '-LightModel sonnet -DeepModel opus'
            Assert-Match $a '-RunTimeoutMinutes 180'
            Assert-NotMatch $a '-Resume'
        }
        It 'đang bận thì gửi nhịp tim running=1; rảnh thì không' {
            Run-Loop (New-BotRoot) (At '09:00') | Out-Null
            Assert-Eq $global:Urls[0] 'http://fake/api/requests?kind=all'
            $r = New-BotRoot; Write-Job $r 'ai' @('x') $true | Out-Null
            Run-Loop $r (At '09:00') | Out-Null
            Assert-Eq $global:Urls[0] 'http://fake/api/requests?kind=all&running=1'
        }
    }

    Context 'chữ ký yêu cầu đã giao: không giao lại, không quên' {
        It 'chữ ký đã có trong .genbid-bot-state.json thì không giao lại lần nữa' {
            $r = New-BotRoot
            Write-BotJson "$r/.genbid-bot-state.json" @{ 'analysis:K2|t1' = @{ last = 'x' } }
            $global:Pend.analysis = @((Req 'K2' 't1'))
            $s = Run-Loop $r (At '09:00')
            Assert-Eq @($s.Jobs).Count 0
            Assert-Eq (StateKeys $s) @('analysis:K2|t1')
        }
        It 'sau khi giao, chữ ký vào trạng thái; vòng sau (lượt con đã xong) không giao lại' {
            $r = New-BotRoot; $global:Pend.analysis = @((Req 'K2'))
            Run-Loop $r (At '09:00') | Out-Null
            Remove-Item "$r/.genbid-bot-jobs/*" -Force
            $s = Run-Loop $r (At '09:01')
            Assert-Eq @($s.Jobs).Count 0
            Assert-Eq (StateKeys $s) @('analysis:K2|2026-11-14T01:00:00.000Z')
        }
        It 'yêu cầu mới của cùng gói (requestedAt khác) là chữ ký mới: được giao dù yêu cầu cũ đã giao' {
            $r = New-BotRoot
            Write-BotJson "$r/.genbid-bot-state.json" @{ 'analysis:K2|t1' = @{ last = 'x' } }
            $global:Pend.analysis = @((Req 'K2' 't1'), (Req 'K2' 't2'))
            $s = Run-Loop $r (At '09:00')
            Assert-Eq @($s.Jobs[0].sigs) @('analysis:K2|t2')
        }
        It 'chữ ký không còn trong hàng chờ bị bỏ khỏi trạng thái (tệp không phình ra)' {
            $r = New-BotRoot
            Write-BotJson "$r/.genbid-bot-state.json" @{ 'analysis:GONE|t' = @{ last = 'x' }; 'analysis:K2|t1' = @{ last = 'x' } }
            $global:Pend.analysis = @((Req 'K2' 't1'))
            Assert-Eq (StateKeys (Run-Loop $r (At '09:00'))) @('analysis:K2|t1')
        }
        It 'yêu cầu Lấy tệp worker đã làm (.hsmt-worker-state.json) không được giao' {
            $r = New-BotRoot
            Write-BotJson "$r/.hsmt-worker-state.json" @{ done = @('K1|2026-11-14T01:00:00.000Z') }
            $global:Pend.files = @((Req 'K1'))
            Assert-Eq @((Run-Loop $r (At '09:00')).Jobs).Count 0
        }
        It 'lượt browser bận thì yêu cầu Lấy tệp chưa được giao và chưa bị đánh dấu: vòng sau giao (không quên)' {
            $r = New-BotRoot; $job = Write-Job $r 'browser' @('files:OLD|t') $true
            $global:Pend.files = @((Req 'K1'))
            $s = Run-Loop $r (At '09:00')
            Assert-Eq (StateKeys $s) @()
            Remove-Item $job -Force
            $s2 = Run-Loop $r (At '09:01')
            Assert-Eq @($s2.Jobs[0].sigs) @('files:K1|2026-11-14T01:00:00.000Z')
        }
    }

    Context 'tạm dừng .genbid-bot-pause.json (hết hạn mức Claude)' {
        BeforeEach {
            $global:PR = New-BotRoot
            Write-BotJson "$($global:PR)/.genbid-bot-pause.json" @{ until = '2026-11-14T13:30:00.0000000'; reason = 'Agent tạm hết hạn mức sử dụng (làm mới lúc 1:30pm). Anh gửi lại yêu cầu sau giờ đó.' }
        }
        It 'đang tạm dừng: yêu cầu AI không gọi Claude, trả lời ngay lên web bằng lý do (analysisreq có error và doneAt)' {
            $global:Pend.analysis = @((Req 'K2'))
            $s = Run-Loop $global:PR (At '10:00')
            Assert-Eq @(Lane $s 'ai').Count 0
            $doc = $global:Posted['analysisreq/K2.json']
            Assert-Match $doc.error 'Agent tạm hết hạn mức sử dụng'
            Assert-Match $doc.doneAt '^\d{4}-\d\d-\d\dT'
            Assert-Eq $doc.notifyNo 'K2'
        }
        It 'yêu cầu đã trả lời bằng lý do tạm dừng vẫn được đánh dấu đã giao (không trả lời lặp mỗi vòng)' {
            $global:Pend.analysis = @((Req 'K2'))
            Assert-Eq (StateKeys (Run-Loop $global:PR (At '10:00'))) @('analysis:K2|2026-11-14T01:00:00.000Z')
        }
        It 'hết giờ tạm dừng (sau 13:30) thì lượt ai chạy lại bình thường' {
            $global:Pend.analysis = @((Req 'K2'))
            $s = Run-Loop $global:PR (At '14:00')
            Assert-Eq @(Lane $s 'ai').Count 1
            Assert-Eq $global:Posted.Count 0
        }
        It 'tạm dừng chỉ chặn lượt AI: Lấy tệp, Sync và Cấu hình vẫn chạy' {
            $global:Pend.files = @((Req 'K1')); $global:Pend.config = @(@{ key = 'C' })
            Assert-Eq (Run-Loop $global:PR (At '10:00')).Lanes @('browser', 'config')
        }
    }

    Context 'lượt con chết giữa chừng: theo dõi tiếp (-Resume)' {
        It 'tệp lượt còn tiến trình sống (cùng pid và giờ bắt đầu): tính là bận, không khởi động lại' {
            $r = New-BotRoot; Write-Job $r 'ai' @('analysis:K|t') $true | Out-Null
            Run-Loop $r (At '09:00') | Out-Null
            Assert-Eq $global:Spawned.Count 0
        }
        It 'tiến trình đã chết: một tiến trình con mới -Resume theo dõi tiếp; tệp lượt ghi pid mới; tính là bận' {
            $r = New-BotRoot; $f = Write-Job $r 'browser' @('files:K|t') $false
            $s = Run-Loop $r (At '10:30')
            Assert-Eq $global:Spawned.Count 1
            Assert-Match ($global:Spawned[0].Args -join ' ') '-Resume'
            Assert-Match ($global:Spawned[0].Args -join ' ') ([regex]::Escape((Split-Path $f -Leaf)))
            Assert-Eq @($s.Jobs).Count 1
            Assert-Eq $s.Jobs[0].pid 424201
            Assert-Eq $s.Schedule $null 'lượt browser đang theo dõi tiếp nên không Sync theo lịch ở vòng này'
            Assert-Match $s.Log 'theo dõi tiếp lượt trước'
        }
        It 'pid còn sống nhưng giờ bắt đầu khác (Windows tái dùng pid) thì coi là đã chết' {
            $r = New-BotRoot
            Write-BotJson "$r/.genbid-bot-jobs/ai-reuse.json" @{ lane = 'ai'; sigs = @('x'); pid = $PID; started = '2020-01-01T00:00:00.0000000+00:00' }
            Run-Loop $r (At '09:00') | Out-Null
            Assert-Match ($global:Spawned[0].Args -join ' ') '-Resume'
        }
        It 'tệp lượt hỏng quá 1 phút thì bị xoá; mới ghi thì để nguyên' {
            $r = New-BotRoot
            Write-BotText "$r/.genbid-bot-jobs/old.json" '{hỏng'; (Get-Item "$r/.genbid-bot-jobs/old.json").LastWriteTime = [datetime]::Now.AddMinutes(-5)
            Write-BotText "$r/.genbid-bot-jobs/new.json" '{hỏng'
            Run-Loop $r ([datetime]::Now) | Out-Null
            Assert-False (Test-Path "$r/.genbid-bot-jobs/old.json")
            Assert-True (Test-Path "$r/.genbid-bot-jobs/new.json")
        }
        It 'lượt dở của bản cũ (.genbid-bot-run.json) được chuyển thành tệp lượt đúng nhóm: config / browser (files, sync, schedule) / ai' {
            $cases = @(@{ sigs = @('config'); lane = 'config' }, @{ sigs = @('files:K|t'); lane = 'browser' }, @{ sigs = @('sync:t'); lane = 'browser' },
                @{ sigs = @('schedule:2026-11-14 10:10'); lane = 'browser' }, @{ sigs = @('analysis:K|t'); lane = 'ai' }, @{ sigs = @('translation:K|t', 'hsdt:K|t'); lane = 'ai' })
            foreach ($c in $cases) {
                $r = New-BotRoot
                Write-BotJson "$r/.genbid-bot-run.json" @{ pid = 999999; started = 'x'; out = 'x'; sigs = $c.sigs }
                $s = Run-Loop $r (At '09:00')
                Assert-False (Test-Path "$r/.genbid-bot-run.json") ($c.sigs -join ',')
                Assert-Eq $s.Lanes @($c.lane) ($c.sigs -join ',')
                Assert-Eq @($s.Jobs[0].sigs) $c.sigs
                Assert-True (Test-Path "$($s.Jobs[0].File).run") 'giữ tệp .run để lượt theo dõi đọc'
            }
        }
    }

    Context 'thiếu điều kiện chạy: chỉ ghi log và chờ' {
        It 'thiếu .genbid-ingest-token: không hỏi web, không lượt nào, log báo thiếu' {
            $r = New-BotRoot; Remove-Item "$r/.genbid-ingest-token"
            $s = Run-Loop $r (At '11:00')
            Assert-Eq $global:Urls.Count 0; Assert-Eq @($s.Jobs).Count 0
            Assert-Match $s.Log 'Thiếu \.genbid-ingest-token'
        }
        It 'chưa đăng nhập Claude, không có token setup-token và không có API key: không chạy gì' {
            $r = New-BotRoot; Remove-Item "$r/.claude-bot-token"
            $s = Run-Loop $r (At '11:00')
            Assert-Eq $global:Urls.Count 0
            Assert-Match $s.Log 'Thiếu \.claude-bot-token'
        }
        It 'có API key (không có token setup-token) thì vẫn chạy' {
            $r = New-BotRoot; Remove-Item "$r/.claude-bot-token"; Write-BotText "$r/.anthropic-api-key" 'k'
            Assert-Eq @((Run-Loop $r (At '11:00')).Jobs).Count 1
        }
        It 'lỗi mạng khi hỏi web: log "Lỗi khi quét", vòng quét không chết' {
            $r = New-BotRoot
            function global:Invoke-WebRequest { throw 'mạng đứt' }
            try { $s = Run-Loop $r (At '11:00') } finally {
                function global:Invoke-WebRequest { param($Uri); $global:Urls += $Uri; [pscustomobject]@{ RawContentStream = (New-Object IO.MemoryStream (, [Text.Encoding]::UTF8.GetBytes(($global:Pend | ConvertTo-Json -Depth 8)))) } }
            }
            Assert-Match $s.Log 'Lỗi khi quét: mạng đứt'
        }
    }
}

Describe 'GenBid-Bot.ps1: lượt con (-Job)' {
    BeforeAll {
        $global:BotTD = $TestDrive
        $global:BotCopy2 = New-BotCopy (New-BotTemp 'botcopy2')
        function global:Run-Child([string]$Root, [string]$JobFile, [switch]$Resume) {
            $global:Urls = @(); $global:Posted = @{}; $global:LASTEXITCODE = $null
            $p = @{ Root = $Root; Endpoint = 'http://fake/api/requests?kind=all'; RepoDir = "$Root/repo"; Job = $JobFile; PollSeconds = 1 }
            if ($Resume) { $p.Resume = $true }
            Use-Env @{ USERPROFILE = $Root } { & $global:BotCopy2 @p 6>&1 | Out-Null }
            @{ Code = $global:LASTEXITCODE; Log = (Get-ChildItem "$Root/genbid-bot-logs" -Filter *.log | ForEach-Object { Get-Content -Raw -Encoding UTF8 $_.FullName }) -join "`n" }
        }
        function global:Invoke-WebRequest { param($Uri); [pscustomobject]@{ RawContentStream = (New-Object IO.MemoryStream (, [Text.Encoding]::UTF8.GetBytes(($global:Pend | ConvertTo-Json -Depth 8)))) } }
        function global:powershell {
            $a = @($args); $i = [array]::IndexOf($a, '-Dir')
            if ($i -ge 0) { Get-ChildItem $a[$i + 1] -Recurse -File | ForEach-Object { $global:Posted[($_.FullName.Substring($a[$i + 1].Length + 1) -replace '\\', '/')] = (Get-Content -Raw -Encoding UTF8 $_.FullName | ConvertFrom-Json) } }
            $global:LASTEXITCODE = 0
        }
    }
    BeforeEach { $global:Pend = Empty-Pending }
    AfterAll { foreach ($f in 'Invoke-WebRequest', 'powershell') { Remove-Item "Function:\$f" -Force -ErrorAction SilentlyContinue } }

    It 'lượt chết trước khi chạy gì (không có tệp .run): báo lỗi "Lượt chạy bị dừng giữa chừng" về web cho yêu cầu của nó, xoá tệp lượt, mã thoát 0' {
        $r = New-BotRoot
        $job = Write-Job $r 'ai' @('analysis:K2|2026-11-14T01:00:00.000Z') $false 'ai-dead'
        $global:Pend.analysis = @((Req 'K2'))
        $c = Run-Child $r $job -Resume
        $doc = $global:Posted['analysisreq/K2.json']
        Assert-Eq $doc.error 'Lượt chạy bị dừng giữa chừng. Anh thử gửi lại yêu cầu.'
        Assert-Eq $doc.requestedAt '2026-11-14T01:00:00.000Z'
        Assert-False (Test-Path $job)
        Assert-Eq $c.Code 0
        Assert-Match $c.Log 'Lượt trước dừng trước khi chạy'
    }
    It 'yêu cầu đã được trả lời (không còn trong hàng chờ) thì không báo lỗi nữa' {
        $r = New-BotRoot
        $job = Write-Job $r 'ai' @('analysis:K2|t') $false 'ai-dead'
        Run-Child $r $job -Resume | Out-Null
        Assert-Eq $global:Posted.Count 0
    }
    It 'chỉ báo lỗi cho yêu cầu của lượt này, không đụng yêu cầu của lượt khác' {
        $r = New-BotRoot
        $job = Write-Job $r 'ai' @('analysis:K2|2026-11-14T01:00:00.000Z') $false 'ai-dead'
        $global:Pend.analysis = @((Req 'K2'), (Req 'K9'))
        Run-Child $r $job -Resume | Out-Null
        Assert-Eq @($global:Posted.Keys) @('analysisreq/K2.json')
    }
    It 'tệp .run có tiến trình đã chết và log báo hết hạn mức: lý do là hết hạn mức, ghi tệp tạm dừng cho vòng quét' {
        $r = New-BotRoot
        $job = Write-Job $r 'ai' @('analysis:K2|2026-11-14T01:00:00.000Z') $false 'ai-dead'
        Write-BotText "$r/agent.log" "You've hit your limit · resets 3pm"
        Write-BotJson "$job.run" @{ pid = 999999; started = '2026-11-14T00:00:00.0000000+00:00'; out = "$r/agent.log"; sigs = @('analysis:K2|x') }
        $global:Pend.analysis = @((Req 'K2'))
        Run-Child $r $job -Resume | Out-Null
        Assert-Match $global:Posted['analysisreq/K2.json'].error 'Agent tạm hết hạn mức sử dụng \(làm mới lúc 3pm\)'
        Assert-True (Test-Path "$r/.genbid-bot-pause.json")
        Assert-False (Test-Path "$job.run") 'tệp .run bị dọn sau lượt'
    }
    It 'lượt config không có repo GenSet-Pro trên máy: chỉ ghi log, mã thoát 0, không báo lỗi lên web' {
        $r = New-BotRoot
        $job = Write-Job $r 'config' @('config') $false 'config-x'
        # Không -Resume: lượt chạy thật; Invoke-Config dừng sớm vì thiếu suppliers\config-bot.mjs.
        $c = Run-Child $r $job
        Assert-Match $c.Log 'Chưa có repo GenSet-Pro'
        Assert-Eq $c.Code 0
        Assert-Eq $global:Posted.Count 0
    }
}
