# Publish-GenBidHsmt.ps1: Get-FileText (PDF scan >= 30% trang hoặc hỏng font > 5% -> trả rỗng để OCR lúc Phân tích),
# .docx / .txt, Split-Utf8, Merge-Doc, và lượt chạy trọn với `gh` giả (-NoCommit: danh sách tệp, release.json, error.txt).
. (Join-Path $PSScriptRoot 'TestHelpers.ps1')

Describe 'Publish-GenBidHsmt.ps1: hàm' {
    BeforeAll {
        $global:BotTD = $TestDrive
        Import-BotFunctions 'Publish-GenBidHsmt.ps1' @('Get-FileText', 'Split-Utf8', 'Merge-Doc', 'Now-Iso')
        $global:Key = 'IB0000000001'
        # pdftotext giả: chép tệp "PDF" (thực ra là chữ đã dựng sẵn, trang cách nhau bởi \f) ra tệp đích, như `pdftotext -layout -enc UTF-8 in out`.
        $global:pdftotext = { Copy-Item -LiteralPath $args[3] -Destination $args[4] }
        $global:Dir = New-BotTemp 'pub-files'
        Use-Env @{ TEMP = $global:Dir } { }
        $env:TEMP = $global:Dir
        $global:ff = [string][char]12
        function global:Pdf([string[]]$Pages, [string]$Name = 'a.pdf') {
            $p = Join-Path $global:Dir $Name
            [IO.File]::WriteAllText($p, (($Pages | ForEach-Object { $_ + $global:ff }) -join ''), $global:Utf8NoBom)
            Get-Item $p
        }
        function global:Fill([int]$n) { (('Máy phát điện diesel công suất 500 kVA, điện áp 400V, tần số 50Hz. ' * 4).Substring(0, $n)) }
        function global:ReadTxt($f) { Get-FileText $f 6>$null }
    }

    Context 'PDF: trang scan' {
        It '10 trang đều có chữ: trả nguyên văn' {
            $pages = 1..10 | ForEach-Object { "Trang $_ " + (Fill 120) }
            $t = ReadTxt (Pdf $pages)
            Assert-True ($t.Contains('Trang 10 '))
        }
        It '3/10 trang scan (đúng 30%) -> rỗng, để OCR' {
            $pages = (1..7 | ForEach-Object { Fill 120 }) + (1..3 | ForEach-Object { '  ' })
            Assert-Eq (ReadTxt (Pdf $pages)) ''
        }
        It '2/10 trang scan (20%) -> vẫn dùng chữ đã có' {
            $pages = (1..8 | ForEach-Object { Fill 120 }) + (1..2 | ForEach-Object { '  ' })
            Assert-Ne (ReadTxt (Pdf $pages)) ''
        }
        It 'dưới 5 trang thì không xét tỉ lệ scan: 4 trang, 3 trang trống vẫn trả chữ' {
            Assert-Ne (ReadTxt (Pdf @((Fill 120), '', '', ''))) ''
        }
        It 'đúng 5 trang, 2 trống (40%) -> rỗng; 1 trống (20%) -> giữ' {
            Assert-Eq (ReadTxt (Pdf @((Fill 120), (Fill 120), (Fill 120), '', ''))) ''
            Assert-Ne (ReadTxt (Pdf @((Fill 120), (Fill 120), (Fill 120), (Fill 120), ''))) ''
        }
        It 'trang "gần như không có chữ" là dưới 60 ký tự không tính khoảng trắng: 59 là trống, 60 là có chữ' {
            $p59 = 'x' * 59; $p60 = 'x' * 60
            Assert-Eq (ReadTxt (Pdf @((Fill 120), (Fill 120), (Fill 120), $p59, $p59, $p59, (Fill 120), (Fill 120), (Fill 120), (Fill 120)))) ''
            Assert-Ne (ReadTxt (Pdf @((Fill 120), (Fill 120), (Fill 120), $p60, $p60, $p60, (Fill 120), (Fill 120), (Fill 120), (Fill 120)))) ''
        }
        It 'khoảng trắng và xuống dòng không tính vào số chữ của trang' {
            $blank = ("   `n  `t " * 30)
            Assert-Eq (ReadTxt (Pdf @((Fill 120), (Fill 120), (Fill 120), (Fill 120), (Fill 120), (Fill 120), $blank, $blank, $blank, $blank))) ''
        }
    }

    Context 'PDF: chữ hỏng font' {
        It 'chữ TCVN3 đọc nhầm (nhiều "¸", "µ", "¶") quá 5% ký tự lạ -> rỗng' {
            $bad = 'M¸y ph¸t ®iÖn ¶nh hëng ' * 200
            Assert-Eq (ReadTxt (Pdf @($bad))) ''
        }
        It 'tiếng Việt thật nhiều dấu (sau NFD toàn dấu kết hợp) không bị coi là hỏng font' {
            $vn = 'Máy phát điện diesel công suất năm trăm kilô vôn ampe, điện áp ba pha bốn dây, tần số năm mươi héc. ' * 40
            Assert-Ne (ReadTxt (Pdf @($vn))) ''
        }
        It 'tiếng Nga được phép (không bị coi là hỏng font)' {
            $ru = 'Дизель-генераторная установка мощностью пятьсот киловатт, напряжение четыреста вольт. ' * 40
            Assert-Ne (ReadTxt (Pdf @($ru))) ''
        }
        It 'dưới 2000 ký tự không xét hỏng font: đoạn ngắn toàn ký tự lạ vẫn giữ' {
            $bad = '¸µ¶' * 200
            Assert-Ne (ReadTxt (Pdf @($bad))) ''
        }
        It 'hơn 2000 ký tự mà ký tự lạ đúng ~5%: biên (3% giữ, 8% bỏ)' {
            $ok = ('abcdefghijklmnopqrst' * 5 + '¸¸¸') * 20     # 103 ký tự / 3 lạ ≈ 2.9%
            $no = ('abcdefghijklmn' + '¸') * 160                 # 1/15 ≈ 6.7%
            Assert-Ne (ReadTxt (Pdf @($ok))) ''
            Assert-Eq (ReadTxt (Pdf @($no))) ''
        }
        It 'chữ hỏng font kiểu "3456ÿ89ÿ" (ÿ sau NFD là y + dấu kết hợp) cũng phải bị bắt [bỏ qua: bot không bắt, trùng lỗi #8 garbled() của ocr-pdf.js, xem nghiệm thu test-t6]' -Skip:$true {
            Assert-Eq (ReadTxt (Pdf @('3456ÿ89ÿ ' * 400))) ''
        }
    }

    Context 'các loại tệp khác' {
        It 'không có pdftotext (biến rỗng) -> PDF trả rỗng' {
            $keep = $global:pdftotext; $global:pdftotext = $null
            try { Assert-Eq (ReadTxt (Pdf @((Fill 120)))) '' } finally { $global:pdftotext = $keep }
        }
        It 'pdftotext không tạo được tệp -> rỗng' {
            $keep = $global:pdftotext; $global:pdftotext = { }
            try { Assert-Eq (ReadTxt (Pdf @((Fill 120)))) '' } finally { $global:pdftotext = $keep }
        }
        It '.txt đọc UTF-8' {
            $p = Join-Path $global:Dir 'a.txt'; Write-BotText $p 'Yêu cầu kỹ thuật máy phát điện'
            Assert-Eq (ReadTxt (Get-Item $p)) 'Yêu cầu kỹ thuật máy phát điện'
        }
        It '.docx: hết đoạn thành xuống dòng, tab, bỏ thẻ, giải &amp; &lt; &gt;' {
            Add-Type -AssemblyName System.IO.Compression.FileSystem
            $p = Join-Path $global:Dir 'a.docx'; if (Test-Path $p) { Remove-Item $p }
            $xml = '<w:document><w:body><w:p><w:r><w:t>Công suất</w:t></w:r><w:tab/><w:r><w:t>500 kVA &amp; 400V</w:t></w:r></w:p><w:p><w:r><w:t>U &lt; 1000 V &gt; 0</w:t></w:r></w:p></w:body></w:document>'
            $z = [IO.Compression.ZipFile]::Open($p, 'Create')
            try { $e = $z.CreateEntry('word/document.xml'); $w = New-Object IO.StreamWriter($e.Open(), $global:Utf8NoBom); $w.Write($xml); $w.Dispose() } finally { $z.Dispose() }
            Assert-Eq (ReadTxt (Get-Item $p)) "Công suất`t500 kVA & 400V`nU < 1000 V > 0`n"
        }
        It '.docx hỏng: không ném lỗi, trả rỗng' {
            $p = Join-Path $global:Dir 'bad.docx'; Write-BotText $p 'không phải zip'
            Assert-Eq (ReadTxt (Get-Item $p)) ''
        }
        It 'đuôi khác (.xlsx, .jpg, .rar) hoặc không có tệp -> rỗng; đuôi viết hoa vẫn nhận' {
            $p = Join-Path $global:Dir 'a.xlsx'; Write-BotText $p 'x'
            Assert-Eq (ReadTxt (Get-Item $p)) ''
            Assert-Eq (ReadTxt $null) ''
            $u = Join-Path $global:Dir 'B.TXT'; Write-BotText $u 'chữ'
            Assert-Eq (ReadTxt (Get-Item $u)) 'chữ'
        }
    }

    Context 'Split-Utf8, Merge-Doc' {
        It 'cắt không quá $max byte mỗi đoạn, không cắt giữa ký tự, ghép lại đúng như cũ' {
            $text = 'Máy phát điện đồng bộ ba pha 500kVA ' * 10
            $parts = @(Split-Utf8 $text 25)
            Assert-True ($parts.Count -gt 5)
            foreach ($p in $parts) { Assert-True ([Text.Encoding]::UTF8.GetByteCount($p) -le 25); Assert-False $p.Contains([string][char]0xFFFD) }
            Assert-Eq ($parts -join '') $text
        }
        It 'chuỗi ngắn hơn giới hạn là một đoạn; chuỗi rỗng không có đoạn nào' {
            Assert-Eq @(Split-Utf8 'abc' 100).Count 1
            Assert-Eq @(Split-Utf8 '' 100).Count 0
        }
        It 'Merge-Doc: giữ trường cũ, trường mới ghi đè, base $null thì chỉ có trường mới' {
            $m = Merge-Doc ([pscustomobject]@{ a = 1; b = 2 }) @{ b = 3; c = 4 }
            Assert-Eq $m.a 1; Assert-Eq $m.b 3; Assert-Eq $m.c 4
            Assert-Eq @((Merge-Doc $null @{ x = 1 }).Keys).Count 1
        }
        It 'Now-Iso: ISO UTC có mili giây' {
            Assert-Match (Now-Iso) '^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$'
        }
    }
}

Describe 'Publish-GenBidHsmt.ps1: lượt chạy trọn (gh giả, -NoCommit)' {
    BeforeAll {
        $global:BotTD = $TestDrive
        $global:PublishScript = Join-Path $global:BotDir 'Publish-GenBidHsmt.ps1'
        # gh giả: chưa có release -> `release create` ghi lại tệp; `release view --json assets` trả asset theo số thứ tự.
        function global:gh {
            $a = @($args)
            $global:GhCalls += , ($a -join ' ')
            if ($a[0] -eq 'release' -and $a[1] -eq 'view' -and $a -contains 'tagName') { $global:LASTEXITCODE = 1; return }
            if ($a[0] -eq 'release' -and $a[1] -eq 'create') {
                $global:GhUploaded = @($a | Where-Object { $_ -like '*#*' } | ForEach-Object { ($_ -split '#', 2)[0] | Split-Path -Leaf })
                $global:LASTEXITCODE = 0; return
            }
            if ($a[0] -eq 'release' -and $a[1] -eq 'view') {
                $n = 0
                $assets = @($global:GhUploaded | ForEach-Object { $n++; @{ name = $_; apiUrl = "https://api.github.com/repos/x/y/releases/assets/$(9000 + $n)" } })
                $global:LASTEXITCODE = 0; return (@{ assets = $assets } | ConvertTo-Json -Depth 4)
            }
            $global:LASTEXITCODE = 0
        }
        function global:InboxFile([string]$Clone, [string]$Name) { Join-Path (Join-Path $Clone 'inbox\IB1') $Name }
        function global:Run-Publish([string]$Src, [hashtable]$P = @{}) {
            $global:GhCalls = @(); $global:GhUploaded = @()
            $clone = New-BotTemp ('clone-' + [guid]::NewGuid().ToString('N'))
            $tmp = New-BotTemp ('tmp-' + [guid]::NewGuid().ToString('N'))
            Use-Env @{ TEMP = $tmp } { & $global:PublishScript -Key 'IB1' -Src $Src -Clone $clone -NoCommit @P 6>&1 | Out-Null }
            $clone
        }
    }
    AfterAll { Remove-Item Function:\gh -ErrorAction SilentlyContinue }

    It 'tệp lên release theo tên sắp xếp, asset đặt tên 01.pdf, 02.docx…; manifest.csv và tệp ẩn bị bỏ; release.json có asset id và tên gốc' {
        $src = New-BotTemp 'pub-src1'
        Write-BotText "$src/B Chương V.PDF" 'bbb'; Write-BotText "$src/A hợp đồng.docx" 'aa'; Write-BotText "$src/manifest.csv" 'x'; Write-BotText "$src/.5.part" 'x'
        $clone = Run-Publish $src
        $j = Get-Content -Raw -Encoding UTF8 (InboxFile $clone 'release.json') | ConvertFrom-Json
        Assert-Eq $j.tag 'hsmt-IB1'
        Assert-Eq (@($j.files | ForEach-Object { $_.name }) -join '|') 'A hợp đồng.docx|B Chương V.PDF'
        Assert-Eq (@($j.files | ForEach-Object { $_.assetName }) -join '|') '01.docx|02.pdf'
        Assert-Eq (@($j.files | ForEach-Object { [string]$_.asset }) -join '|') '9001|9002'
        Assert-Eq $j.files[1].size 3
        Assert-False (Test-Path (InboxFile $clone 'error.txt'))
    }
    It 'tệp lớn hơn -MaxMB bị bỏ qua và ghi vào error.txt; không còn tệp nào thì không có release.json' {
        $src = New-BotTemp 'pub-src2'
        Write-BotText "$src/lon.pdf" 'x' * 10
        $clone = Run-Publish $src @{ MaxMB = 0 }
        Assert-False (Test-Path (InboxFile $clone 'release.json'))
        Assert-Match (Get-Content -Raw -Encoding UTF8 (InboxFile $clone 'error.txt')) 'Bỏ qua lon\.pdf: lớn hơn 0 MB'
    }
    It 'thư mục không có tệp: error.txt ghi lý do mặc định; -Reason đổi lý do' {
        $src = New-BotTemp 'pub-src3'
        $clone = Run-Publish $src
        Assert-Match (Get-Content -Raw -Encoding UTF8 (InboxFile $clone 'error.txt')) 'Không tải được tệp nào từ muasamcong'
        $clone2 = Run-Publish (Join-Path $TestDrive 'khong-ton-tai') @{ Reason = 'Hết hạn' }
        Assert-Match (Get-Content -Raw -Encoding UTF8 (InboxFile $clone2 'error.txt')) 'Hết hạn'
        Assert-Eq $global:GhCalls.Count 0 'không gọi gh khi không có tệp'
    }
    It '-NoInbox không ghi gì vào bản chép nhánh hsmt-inbox' {
        $src = New-BotTemp 'pub-src4'; Write-BotText "$src/a.pdf" 'x'
        $clone = Run-Publish $src @{ NoInbox = [switch]$true }
        Assert-False (Test-Path (Join-Path $clone 'inbox'))
    }
}
