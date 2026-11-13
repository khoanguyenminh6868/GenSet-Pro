# Get-GenBidBidderTargets.ps1: chọn gói cần lấy nhà thầu / giá dự thầu và báo cáo đánh giá E-HSDT (Khoa 2026-11-04, 2026-11-12).
# Script chạy trọn; Get-GenBidRequests.ps1 (gọi qua `powershell`) được thay bằng hàm giả đọc tệp mẫu trong thư mục tạm.
. (Join-Path $PSScriptRoot 'TestHelpers.ps1')

Describe 'Get-GenBidBidderTargets.ps1' {
    BeforeAll {
        $global:BotTD = $TestDrive
        $global:TargetsScript = Join-Path $global:BotDir 'Get-GenBidBidderTargets.ps1'
        # Hàm giả thay `powershell -File Get-GenBidRequests.ps1 -Kind docs -Coll <c> [-Id <i>] -Out <f>`: chép $global:Fx\<c>.json ra -Out.
        function global:powershell {
            $a = @($args); $coll = $null; $out = $null
            for ($i = 0; $i -lt $a.Count; $i++) { if ($a[$i] -eq '-Coll') { $coll = $a[$i + 1] }; if ($a[$i] -eq '-Out') { $out = $a[$i + 1] } }
            $src = Join-Path $global:Fx "$coll.json"
            if ($global:FxFail -eq $coll) { $global:LASTEXITCODE = 1; return }
            if (Test-Path $src) { Copy-Item $src $out; $global:LASTEXITCODE = 0 } else { $global:LASTEXITCODE = 3 }
        }
        # Gói mẫu: giờ đóng thầu tính từ bây giờ (không có cách tiêm đồng hồ vào script), chừa biên rộng ở mọi ngưỡng.
        function global:Iso([double]$HoursAgo) { (Get-Date).ToUniversalTime().AddHours(-$HoursAgo).ToString('yyyy-MM-ddTHH:mm:ss.000Z') }
        function global:Tender($no, [double]$closeHoursAgo, $name = 'Máy phát điện') { @{ notifyNo = $no; bidName = $name; bidCloseDate = (Iso $closeHoursAgo); notifyVersion = '00' } }
        function global:Doc($id, $data) { @{ id = $id; data = $data } }
        # Chạy script với dữ liệu: -Feed (gói trong feed), -Seen, -Manual, -Tracked, -Deleted, -Bidders, -Portal, -Bcdg (mảng {id,data}).
        function global:Run-Targets([hashtable]$D, [hashtable]$P = @{}) {
            $global:Fx = New-BotTemp ('tg-' + [guid]::NewGuid().ToString('N'))
            Write-BotJson "$($global:Fx)/feed.json" @{ tenders = @($D.Feed) }
            foreach ($c in 'Seen', 'Manual', 'Tracked', 'Deleted', 'Bidders', 'Portal', 'Bcdg') {
                $k = @{ Portal = 'portalids' }[$c]; if (-not $k) { $k = $c.ToLower() }
                if ($D.ContainsKey($c)) { Write-BotJson "$($global:Fx)/$k.json" @($D[$c]) }
            }
            $out = "$($global:Fx)/out.json"
            Use-Env @{ TEMP = $global:Fx } {
                & $global:TargetsScript -Out $out @P 6>&1 | Out-Null
            }
            if (Test-Path $out) { , @((Get-Content -Raw -Encoding UTF8 $out | ConvertFrom-Json) | ForEach-Object { $_ }) } else { , @() }
        }
        function global:Keys($r) { (@($r | ForEach-Object { $_.key }) | Sort-Object) -join ',' }
    }
    BeforeEach { $global:FxFail = $null }
    AfterAll { Remove-Item Function:\powershell -ErrorAction SilentlyContinue }

    Context 'gói nào được chọn theo giai đoạn' {
        It 'Đã nộp, Trúng, Bỏ qua, Chuẩn bị, Đang xem, Mới đã đóng thầu đều được lấy; Không trúng thì không' {
            $r = Run-Targets @{
                Feed = @((Tender 'S' 48), (Tender 'W' 48), (Tender 'D' 48), (Tender 'P' 48), (Tender 'R' 48), (Tender 'N' 48), (Tender 'L' 48))
                Tracked = @((Doc 'S' @{ stage = 'submitted' }), (Doc 'W' @{ stage = 'won' }), (Doc 'D' @{ stage = 'dropped' }), (Doc 'P' @{ stage = 'preparing' }), (Doc 'R' @{ stage = 'reviewing' }), (Doc 'N' @{ stage = 'new' }), (Doc 'L' @{ stage = 'lost' }))
            }
            Assert-Eq (Keys $r) 'D,N,P,R,S,W'
        }
        It 'gói không theo dõi trong feed (Đã đóng trên web) được lấy với tracked=false, stage rỗng' {
            $r = Run-Targets @{ Feed = @((Tender 'F' 48)) }
            Assert-Eq (Keys $r) 'F'
            Assert-False $r[0].tracked
            Assert-Null $r[0].stage
        }
        It 'joined=true chỉ với Đã nộp / Trúng; Bỏ qua và Mới thì false (markJoined để nguyên Bỏ qua)' {
            $r = Run-Targets @{ Feed = @((Tender 'S' 48), (Tender 'W' 48), (Tender 'D' 48), (Tender 'N' 48))
                Tracked = @((Doc 'S' @{ stage = 'submitted' }), (Doc 'W' @{ stage = 'won' }), (Doc 'D' @{ stage = 'dropped' }), (Doc 'N' @{ stage = 'new' })) }
            Assert-True ($r | Where-Object { $_.key -eq 'S' }).joined
            Assert-True ($r | Where-Object { $_.key -eq 'W' }).joined
            Assert-False ($r | Where-Object { $_.key -eq 'D' }).joined
            Assert-False ($r | Where-Object { $_.key -eq 'N' }).joined
        }
        It 'gói theo dõi không có stage tính là Mới (new)' {
            $r = Run-Targets @{ Feed = @((Tender 'N' 48)); Tracked = @((Doc 'N' @{ note = 'x' })) }
            Assert-Eq (Keys $r) 'N'
            Assert-Eq $r[0].stage 'new'
        }
        It 'gói Đã hủy TBMT (tender.status = cancelled trong tracked, hoặc trong feed) không lấy' {
            $c = Tender 'C' 48; $c.status = 'cancelled'
            $r = Run-Targets @{ Feed = @($c, (Tender 'T' 48), (Tender 'K' 48))
                Tracked = @((Doc 'T' @{ stage = 'submitted'; tender = @{ status = 'cancelled' } }), (Doc 'K' @{ stage = 'submitted' })) }
            Assert-Eq (Keys $r) 'K'
        }
        It 'gói dự án (isProject) trong seen / manual không đưa vào; gói xoá (deleted) không lấy' {
            $x = Tender 'X' 48; $x.isProject = $true
            $r = Run-Targets @{ Feed = @(); Seen = @((Doc 'X' $x), (Doc 'Y' (Tender 'Y' 48)), (Doc 'Z' (Tender 'Z' 48))); Deleted = @((Doc 'Z' @{ at = 'x' })) }
            Assert-Eq (Keys $r) 'Y'
        }
        It 'gói có kết quả LCNT (bidders.final = true) không lấy lại' {
            $r = Run-Targets @{ Feed = @((Tender 'A' 48), (Tender 'B' 48)); Bidders = @((Doc 'A' @{ final = $true; list = @() }), (Doc 'B' @{ final = $false; list = @() })) }
            Assert-Eq (Keys $r) 'B'
        }
        It 'gói theo dõi mà web không có ngày đóng thầu vẫn được kiểm tra (coi như đóng 30 ngày trước), tên rỗng' {
            $r = Run-Targets @{ Feed = @(); Tracked = @((Doc 'O' @{ stage = 'submitted' })) }
            Assert-Eq (Keys $r) 'O'
            Assert-Null $r[0].bidName
        }
    }

    Context 'ngày đóng thầu và lần kiểm tra trước' {
        It 'chưa quá 30 phút sau đóng thầu thì chưa lấy; quá 30 phút thì lấy' {
            $r = Run-Targets @{ Feed = @((Tender 'E' 0.4), (Tender 'L' 0.6), (Tender 'F' -5)) }
            Assert-Eq (Keys $r) 'L'
        }
        It 'đóng quá -Days ngày trước thì bỏ (mặc định 180)' {
            $r = Run-Targets @{ Feed = @((Tender 'IN' (24 * 179)), (Tender 'OUT' (24 * 181))) }
            Assert-Eq (Keys $r) 'IN'
            Assert-Eq (Keys (Run-Targets @{ Feed = @((Tender 'IN' (24 * 179))) } @{ Days = 100 })) ''
        }
        It 'gói đóng trong 7 ngày: kiểm tra lại sau 6 giờ (kiểm 5 giờ trước thì bỏ, 7 giờ trước thì lấy)' {
            $r = Run-Targets @{ Feed = @((Tender 'A' 48), (Tender 'B' 48))
                Portal = @((Doc 'A' @{ checkedAt = (Iso 5) }), (Doc 'B' @{ checkedAt = (Iso 7) })) }
            Assert-Eq (Keys $r) 'B'
        }
        It 'gói đóng quá 7 ngày: kiểm tra lại sau 24 giờ (kiểm 20 giờ trước thì bỏ, 26 giờ trước thì lấy)' {
            $r = Run-Targets @{ Feed = @((Tender 'A' (24 * 10)), (Tender 'B' (24 * 10)))
                Portal = @((Doc 'A' @{ checkedAt = (Iso 20) }), (Doc 'B' @{ checkedAt = (Iso 26) })) }
            Assert-Eq (Keys $r) 'B'
        }
        It 'lần kiểm tra sớm hơn 30 phút sau đóng thầu (dùng ngày đóng thầu cũ) thì không tính' {
            # đóng 2 giờ trước, lần kiểm 1 giờ trước nhưng ngày đóng thầu muasamcong đọc được lúc đó... checkedAt < close + 30 phút
            $r = Run-Targets @{ Feed = @((Tender 'A' 1)); Portal = @((Doc 'A' @{ checkedAt = (Iso 0.9) })) }
            Assert-Eq (Keys $r) 'A'
        }
        It 'ngày đóng thầu muasamcong (portalids) muộn hơn bản web thì dùng nó: gia hạn sang tương lai thì chưa lấy' {
            $r = Run-Targets @{ Feed = @((Tender 'A' 48), (Tender 'B' 48)); Portal = @((Doc 'A' @{ bidCloseDate = (Iso -24) }), (Doc 'B' @{ bidCloseDate = (Iso 40) })) }
            Assert-Eq (Keys $r) 'B'
        }
        It 'gói đã rời feed: lấy bản TBMT có notifyVersion mới hơn trong tracked.tender (IB2600581294: gia hạn)' {
            $r = Run-Targets @{ Feed = @()
                Seen = @((Doc 'G' @{ bidName = 'cũ'; bidCloseDate = (Iso 48); notifyVersion = '00' }))
                Tracked = @((Doc 'G' @{ stage = 'submitted'; tender = @{ bidName = 'mới'; bidCloseDate = (Iso -48); notifyVersion = '01' } })) }
            Assert-Eq (Keys $r) ''
            $r2 = Run-Targets @{ Feed = @(); Seen = @((Doc 'G' @{ bidName = 'cũ'; bidCloseDate = (Iso 48); notifyVersion = '00' })); Tracked = @((Doc 'G' @{ stage = 'submitted' })) }
            Assert-Eq (Keys $r2) 'G'
            Assert-Eq $r2[0].bidName 'cũ'
        }
    }

    Context 'thứ tự và giới hạn' {
        It 'gói đóng gần nhất đi trước; -Max cắt bớt' {
            $r = Run-Targets @{ Feed = @((Tender 'C1' 100), (Tender 'C2' 30), (Tender 'C3' 60), (Tender 'C4' 10)) } @{ Max = 3 }
            Assert-Eq (@($r | ForEach-Object { $_.key }) -join ',') 'C4,C2,C3'
        }
        It 'mặc định -Max 15' {
            $feed = @(1..20 | ForEach-Object { Tender ("T{0:D2}" -f $_) (10 + $_) })
            $r = Run-Targets @{ Feed = $feed }
            Assert-Eq @($r).Count 15
            Assert-Eq $r[0].key 'T01'
        }
        It 'không có gói nào: tệp ra là mảng rỗng' {
            $r = Run-Targets @{ Feed = @() }
            Assert-Eq @($r).Count 0
        }
        It 'không đọc được bản web (mã 1) thì script lỗi, không ghi tệp' {
            $global:FxFail = 'tracked'
            $threw = $false
            try { Run-Targets @{ Feed = @((Tender 'A' 48)) } | Out-Null } catch { $threw = $true }
            Assert-True $threw
        }
    }

    Context 'báo cáo đánh giá E-HSDT (bcdg)' {
        function global:Bid($taxes, $final = $true) { @{ final = $final; list = @($taxes | ForEach-Object { @{ taxCode = $_; name = 'x' } }) } }
        It 'gói đã có kết quả mà MST công ty (4101623015) có trong danh sách nhà thầu và chưa có bcdg thì lấy, đánh dấu bcdgOnly' {
            $r = Run-Targets @{ Feed = @(); Bidders = @((Doc 'B1' (Bid @('0100000001', '4101623015')))) }
            Assert-Eq (Keys $r) 'B1'
            Assert-True $r[0].bcdgOnly
            Assert-True $r[0].joined
        }
        It 'MST viết có dấu chấm / gạch vẫn nhận (chỉ lấy chữ số); MST khác, hoặc có hậu tố chi nhánh thì không' {
            $r = Run-Targets @{ Feed = @(); Bidders = @((Doc 'B1' (Bid @('4.101.623.015'))), (Doc 'B2' (Bid @('4101623015-001'))), (Doc 'B3' (Bid @('0100000001')))) }
            Assert-Eq (Keys $r) 'B1'
        }
        It 'chưa có kết quả (final=false) hoặc gói đã xoá thì không lấy báo cáo' {
            $r = Run-Targets @{ Feed = @(); Bidders = @((Doc 'B1' (Bid @('4101623015') $false)), (Doc 'B2' (Bid @('4101623015')))); Deleted = @((Doc 'B2' @{ at = 'x' })) }
            Assert-Eq (Keys $r) ''
        }
        It 'đã có bcdg thành công thì thôi' {
            $r = Run-Targets @{ Feed = @(); Bidders = @((Doc 'B1' (Bid @('4101623015')))); Bcdg = @((Doc 'B1' @{ at = (Iso 1) })) }
            Assert-Eq (Keys $r) ''
        }
        It 'lần lấy trước lỗi: thử lại sau 1 giờ (lần lỗi 1); lỗi lần 2 chờ 6 giờ; giveUp thì bỏ' {
            $r = Run-Targets @{ Feed = @(); Bidders = @('E1a', 'E1b', 'E2a', 'E2b', 'GU' | ForEach-Object { Doc $_ (Bid @('4101623015')) })
                Bcdg = @((Doc 'E1a' @{ error = 'x'; tries = 1; at = (Iso 2) }), (Doc 'E1b' @{ error = 'x'; tries = 1; at = (Iso 0.5) }),
                         (Doc 'E2a' @{ error = 'x'; tries = 2; at = (Iso 4) }), (Doc 'E2b' @{ error = 'x'; tries = 2; at = (Iso 7) }),
                         (Doc 'GU' @{ error = 'x'; tries = 3; at = (Iso 99); giveUp = $true })) }
            Assert-Eq (Keys $r) 'E1a,E2b'
        }
        It '-BcdgMax giới hạn số gói lấy báo cáo; 0 thì tắt hẳn' {
            $bid = @('B1', 'B2', 'B3' | ForEach-Object { Doc $_ (Bid @('4101623015')) })
            Assert-Eq (Keys (Run-Targets @{ Feed = @(); Bidders = $bid } @{ BcdgMax = 2 })) 'B1,B2'
            Assert-Eq (Keys (Run-Targets @{ Feed = @(); Bidders = $bid } @{ BcdgMax = 0 })) ''
        }
        It 'gói bcdg đi sau các gói lấy nhà thầu và không chiếm chỗ của -Max' {
            $r = Run-Targets @{ Feed = @((Tender 'A' 48)); Bidders = @((Doc 'B1' (Bid @('4101623015')))) } @{ Max = 1 }
            Assert-Eq (@($r | ForEach-Object { $_.key }) -join ',') 'A,B1'
        }
    }
}
