# Merge-GenBidFeed.ps1: chữ ký gói (Sig) khớp sig() của search-extract.js / sync-pure.js và gộp feed của Sync.
# Chữ ký mong đợi lấy từ bot/test/sync-rules.test.mjs ("chữ ký gói khớp Merge-GenBidFeed.ps1").
. (Join-Path $PSScriptRoot 'TestHelpers.ps1')

$SkipDates = $PSVersionTable.PSVersion.Major -ge 7 -and -not (Get-Command ConvertFrom-Json).Parameters.ContainsKey('DateKind')
$NotSkipDates = -not $SkipDates

Describe 'Merge-GenBidFeed.ps1' {
    BeforeAll {
        $global:BotTD = $TestDrive
        $global:MergeScript = Join-Path $global:BotDir 'Merge-GenBidFeed.ps1'
        $global:t1 = @{ notifyNo = 'IB2400268027'; bidCloseDate = '2024-10-21T03:00:00.000Z'; bidOpenDate = '2024-10-21T03:00:00.000Z'; notifyVersion = '00'; estimatedPrice = 49381200000; bidName = 'Mua sắm máy phát điện dầu 12kVA'; investorName = 'Tổng công ty Viễn thông MobiFone'; procuringEntityName = 'Tổng công ty Viễn thông MobiFone'; location = 'Hà Nội'; isInternet = $true; status = 'open' }
        $global:t2 = @{ notifyNo = 'IB2200001635'; bidCloseDate = '2022-01-20T02:00:00.000Z'; bidOpenDate = '2022-01-20T02:30:00.000Z'; notifyVersion = '01'; estimatedPrice = 16000000000; bidName = 'Máy phát điện 100 kVA'; investorName = 'Bệnh viện'; location = 'Lâm Đồng, Đắk Nông'; isInternet = $true; status = 'cancelled' }
        $global:t3 = @{ notifyNo = 'IB9900000001'; bidCloseDate = $null; bidOpenDate = $null; notifyVersion = '00'; estimatedPrice = 1234.5; bidName = 'Thử: giá lẻ, không có bên mời thầu'; investorName = $null; location = $null; isInternet = $false; status = 'open' }

        # Chạy script; trả { Out (chuỗi in ra), Info (Write-Host), Code }.
        function global:Run-Merge([hashtable]$Params) {
            $global:LASTEXITCODE = $null
            $all = & $global:MergeScript @Params 6>&1
            @{ Out = @($all | Where-Object { $_ -is [string] }); Info = @($all | Where-Object { $_ -isnot [string] } | ForEach-Object { "$_" }); Code = $global:LASTEXITCODE }
        }
        function global:Get-Sigs([object[]]$Tenders, [bool]$Wrapped = $false) {
            $d = New-BotTemp ('sig-' + [guid]::NewGuid().ToString('N'))
            $doc = @{ tenders = $Tenders }
            if ($Wrapped) { $doc = @{ data = $doc; version = 'v7' } }
            Write-BotJson "$d/cur.json" $doc
            $r = Run-Merge @{ Mode = 'Sigs'; Current = "$d/cur.json" }
            if ($r.Code -ne 0) { throw "Sigs mã thoát $($r.Code)" }
            ($r.Out -join '') | ConvertFrom-Json
        }
        function global:Merge-It($changed, [string]$present) {
            $p = @{ Mode = 'Merge'; Current = "$($global:MD)/cur.json"; Out = "$($global:MD)/out.json"; Present = $present }
            if ($null -ne $changed) { Write-BotJson "$($global:MD)/chg.json" @($changed); $p.Changed = "$($global:MD)/chg.json" }
            $r = Run-Merge $p
            $r.Doc = if (Test-Path "$($global:MD)/out.json") { Get-Content -Raw -Encoding UTF8 "$($global:MD)/out.json" | ConvertFrom-Json } else { $null }
            $r
        }
        function global:T($no, $close, $name = 'MPĐ') { @{ notifyNo = $no; bidCloseDate = $close; bidName = $name; notifyVersion = '00' } }
    }

    Context 'chữ ký Sig khớp bản JavaScript' {
        It 'gói thường: 8956e3cf2c85' -Skip:$SkipDates {
            Assert-Eq (Get-Sigs @($global:t1)).IB2400268027 '8956e3cf2c85'
        }
        It 'gói đã huỷ thêm hậu tố |cancelled: 73cf8d5ec4cd' -Skip:$SkipDates {
            Assert-Eq (Get-Sigs @($global:t2)).IB2200001635 '73cf8d5ec4cd'
        }
        It 'gói thiếu ngày, bên mời thầu, nơi; giá lẻ 1234.5; isInternet false: 76d7f5994218' {
            Assert-Eq (Get-Sigs @($global:t3)).IB9900000001 '76d7f5994218'
        }
        It 'tệp xuất có lớp bọc {data, version} vẫn đọc được' -Skip:$SkipDates {
            Assert-Eq (Get-Sigs @($global:t1) $true).IB2400268027 '8956e3cf2c85'
        }
        It 'bản sửa đổi (notifyVersion đổi) đổi chữ ký; trường ngoài chữ ký (sourceUrl, publicDate) không đổi' -Skip:$SkipDates {
            $b = @{} + $global:t1; $b.notifyVersion = '01'
            $c = @{} + $global:t1; $c.sourceUrl = 'khác'; $c.publicDate = 'khác'
            Assert-Ne (Get-Sigs @($b)).IB2400268027 '8956e3cf2c85'
            Assert-Eq (Get-Sigs @($c)).IB2400268027 '8956e3cf2c85'
        }
        It 'giữ thứ tự gói trong feed' {
            $a = @{} + $global:t3; $a.notifyNo = 'IB2'; $b = @{} + $global:t3; $b.notifyNo = 'IB1'
            Assert-Eq (@((Get-Sigs @($a, $b)).PSObject.Properties.Name) -join ',') 'IB2,IB1'
        }
        It 'gói không có trường isInternet: chữ ký lệch bản JS (JS "undefined", PS rỗng) [bỏ qua: lệch đã biết, xem nghiệm thu test-t6, chưa đo gói thật nào thiếu isInternet]' -Skip:$true {
            $x = @{} + $global:t3; $x.Remove('isInternet')
            Assert-Eq (Get-Sigs @($x)).IB9900000001 '76d7f5994218'
        }
        It 'pwsh 7 chưa có -DateKind: chuỗi ISO thành DateTime nên chữ ký khác bản 5.1 (khoá hành vi)' -Skip:$NotSkipDates {
            Assert-Ne (Get-Sigs @($global:t1)).IB2400268027 '8956e3cf2c85'
        }
    }

    Context 'gộp feed (Mode Merge)' {
        BeforeEach {
            $global:MD = New-BotTemp ('merge-' + [guid]::NewGuid().ToString('N'))
            $future = '2099-01-01T03:00:00.000Z'; $past = '2020-01-01T03:00:00.000Z'
            Write-BotJson "$($global:MD)/cur.json" @{ tenders = @((T 'A' $future 'A cũ'), (T 'B' $future), (T 'C' $past), (T 'D' $past), (T 'E' $null)) }
        }

        It 'gói không còn trong kết quả và đã đóng thầu (hoặc không có ngày đóng) thì bỏ khỏi feed; chưa đóng thì giữ' {
            $r = Merge-It $null ''
            Assert-Eq $r.Code 0
            Assert-Eq (@($r.Doc.tenders | ForEach-Object { $_.notifyNo }) -join ',') 'A,B'
            Assert-Match ($r.Info -join "`n") 'Đã đóng, bỏ khỏi feed: 3 C, D, E'
            # khoá hành vi: gói không có ngày đóng thầu bị coi như đã đóng
        }
        It 'feed chỉ toàn gói chưa đóng: không có gì đổi, thoát mã 2 và không ghi tệp' {
            Write-BotJson "$($global:MD)/cur.json" @{ tenders = @((T 'A' '2099-01-01T03:00:00.000Z'), (T 'B' '2099-01-02T03:00:00.000Z')) }
            $r = Merge-It $null ''
            Assert-Eq $r.Code 2
            Assert-Null $r.Doc
            Assert-Match ($r.Info -join "`n") 'Feed không đổi'
        }
        It 'gói đổi thông tin thay bản cũ tại chỗ (giữ thứ tự), gói mới nối vào cuối' {
            $r = Merge-It @((T 'A' '2099-02-02T03:00:00.000Z' 'A mới'), (T 'Z' '2099-03-03T03:00:00.000Z' 'Z mới')) ''
            Assert-Eq $r.Code 0
            Assert-Eq (@($r.Doc.tenders | ForEach-Object { $_.notifyNo }) -join ',') 'A,B,Z'
            Assert-Eq ($r.Doc.tenders | Where-Object { $_.notifyNo -eq 'A' }).bidName 'A mới'
            Assert-Match ($r.Info -join "`n") 'Mới: 1 Z'
            Assert-Match ($r.Info -join "`n") 'Đổi thông tin: 1 A'
        }
        It 'gói đổi thông tin vẫn được giữ dù đã đóng thầu (bản đổi thay bản cũ)' {
            $r = Merge-It @((T 'C' '2021-02-02T03:00:00.000Z' 'C đổi')) ''
            Assert-Eq (@($r.Doc.tenders | ForEach-Object { $_.notifyNo }) -join ',') 'A,B,C'
        }
        It 'tệp ghi ra có fetchedAt dạng ISO UTC, source muasamcong' {
            $r = Merge-It @((T 'Z' '2099-03-03T03:00:00.000Z')) ''
            Assert-Eq $r.Doc.source 'muasamcong'
            Assert-Match ([string]$r.Doc.fetchedAt) '^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$'
        }
        # LỖI THẬT (đã chạy tay trên 5.1): `$present = @(...)` ghi đè tham số [string]$Present (PowerShell không phân biệt hoa thường),
        # nên mảng bị ép lại thành chuỗi "A C" và `$present -contains $t.notifyNo` luôn sai: -Present không có tác dụng.
        It 'gói còn trong kết quả tìm kiếm (-Present) được giữ dù đã đóng thầu [bỏ qua: lỗi $present ghi đè $Present, xem nghiệm thu test-t6]' -Skip:$true {
            $r = Merge-It $null 'A,B,C,D,E'
            Assert-Eq $r.Code 2
        }
    }
}
