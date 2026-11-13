# GenBid-HSMT.ps1: phần thuần (tên tệp an toàn, đọc danh sách tải, tham số mặc định). Không bật Agent, không gọi cổng 1234.
. (Join-Path $PSScriptRoot 'TestHelpers.ps1')

Describe 'GenBid-HSMT.ps1: phần thuần' {
    BeforeAll {
        $global:BotTD = $TestDrive
        Import-BotFunctions 'GenBid-HSMT.ps1' @('Get-SafeName', 'Read-List')
    }

    It 'tên tệp an toàn: ký tự cấm của Windows \ / : * ? " < > | đổi thành _ (nhiều ký tự liền nhau thành một), cắt khoảng trắng hai đầu' {
        Assert-Eq (Get-SafeName 'HSMT: Chương V/YCKT?.pdf') 'HSMT_ Chương V_YCKT_.pdf'
        Assert-Eq (Get-SafeName '  a**b  ') 'a_b'
        Assert-Eq (Get-SafeName 'bình thường (1).docx') 'bình thường (1).docx'
    }
    It 'danh sách tải: dòng "# <TBMT>" cho số thông báo, các dòng khác là mục tải (id hoặc "id,tên"), bỏ dòng trống' {
        $p = Join-Path (New-BotTemp 'hsmt-list') 'IB2600000001_danh-sach-file.txt'
        Write-BotText $p "# IB2600000001`n`n11111111-1111-1111-1111-111111111111,Chương V.pdf`n22222222-2222-2222-2222-222222222222`n"
        $l = Read-List $p
        Assert-Eq $l.Notify 'IB2600000001'
        Assert-Eq @($l.Items).Count 2
        Assert-Eq $l.Items[0] '11111111-1111-1111-1111-111111111111,Chương V.pdf'
    }
    It 'danh sách không có dòng "#": số thông báo lấy từ tên tệp, bỏ hậu tố _danh-sach-file' {
        $p = Join-Path (New-BotTemp 'hsmt-list2') 'IB2600000002_danh-sach-file.txt'
        Write-BotText $p "33333333-3333-3333-3333-333333333333`n"
        Assert-Eq (Read-List $p).Notify 'IB2600000002'
    }
    It 'tham số mặc định: chờ mỗi tệp 600 giây (lệnh specs của genbid-sync.js đưa 180), thư mục tải mặc định GenBid-HSMT' {
        $d = Get-BotParamDefaults 'GenBid-HSMT.ps1'
        Assert-Eq $d.TimeoutSec 600
        Assert-Eq $d.NotifyNo 'HSMT'
        Assert-Match $d.OutDir 'Downloads.GenBid-HSMT'
    }
}
