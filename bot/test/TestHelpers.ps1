# Dùng chung cho bot/test/*.Tests.ps1 (Pester 3.4 trên Windows PowerShell 5.1 của máy bot, Pester 5 trên pwsh ở CI).
# Các script của bot là script chạy thẳng, không phải module: hàm được nạp bằng cách phân tích AST (không sửa script),
# script chạy trọn thì chạy từ bản chép trong thư mục tạm, với lệnh ngoài (powershell, gh, Invoke-WebRequest, Start-Process,
# Get-Date) được thay bằng hàm giả ở phạm vi global. Không gọi mạng, không gọi claude, không đụng tệp .genbid-* thật.
# Hàm global: để Pester 3 và 5 đều thấy được dù phạm vi khác nhau.

$global:BotDir = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\genbid-hsmt'))
$global:Utf8NoBom = New-Object Text.UTF8Encoding $false

# Nạp các hàm có tên trong $Names của một script vào phạm vi global (tên giữ nguyên).
function global:Import-BotFunctions([string]$Script, [string[]]$Names) {
    $path = Join-Path $global:BotDir $Script
    $ast = [Management.Automation.Language.Parser]::ParseFile($path, [ref]$null, [ref]$null)
    $fns = $ast.FindAll({ param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst] -and $Names -contains $n.Name }, $true)
    foreach ($n in $Names) { if (-not ($fns | Where-Object { $_.Name -eq $n })) { throw "Không thấy hàm $n trong $Script" } }
    foreach ($f in $fns) {
        # $script:X thành $global:X: hàm nạp vào global thì trạng thái cũng ở global, để ca test đặt và đọc được.
        $code = ($f.Extent.Text -replace '^function\s+', 'function global:') -replace '\$script:', '$global:'
        . ([scriptblock]::Create($code))
    }
}

# Giá trị mặc định của các tham số khai báo ở đầu script.
function global:Get-BotParamDefaults([string]$Script) {
    $ast = [Management.Automation.Language.Parser]::ParseFile((Join-Path $global:BotDir $Script), [ref]$null, [ref]$null)
    $h = @{}
    foreach ($p in $ast.ParamBlock.Parameters) { if ($p.DefaultValue) { $h[$p.Name.VariablePath.UserPath] = try { $p.DefaultValue.SafeGetValue() } catch { $p.DefaultValue.Extent.Text } } }
    $h
}

# Khẳng định tự viết: cú pháp `Should Be` của Pester 3.4 (máy bot) bị bỏ ở Pester 5 (CI), còn `Should -Be` thì ngược lại.
# Ném lỗi là đủ để cả hai bản đánh dấu ca hỏng.
function global:Fmt($v) { if ($null -eq $v) { '<null>' } elseif ($v -is [array]) { '[' + (($v | ForEach-Object { Fmt $_ }) -join ', ') + ']' } else { $s = "$v"; if ($s.Length -gt 120) { $s = $s.Substring(0, 120) + '…(' + $s.Length + ')' }; "'$s'" } }
function global:Flat($v) { if ($v -is [array]) { (@($v | ForEach-Object { "$_" }) -join [string][char]31) } elseif ($null -eq $v) { '' } else { "$v" } }
function global:Assert-Eq($Actual, $Expected, [string]$Msg = '') { if ((Flat $Actual) -cne (Flat $Expected)) { throw "Mong đợi $(Fmt $Expected), được $(Fmt $Actual). $Msg" } }
function global:Assert-Ne($Actual, $NotExpected, [string]$Msg = '') { if ((Flat $Actual) -ceq (Flat $NotExpected)) { throw "Không được bằng $(Fmt $NotExpected). $Msg" } }
function global:Assert-Match([string]$Actual, [string]$Pattern, [string]$Msg = '') { if ($Actual -notmatch $Pattern) { throw "Mong đợi khớp /$Pattern/, được: $Actual. $Msg" } }
function global:Assert-NotMatch([string]$Actual, [string]$Pattern, [string]$Msg = '') { if ($Actual -match $Pattern) { throw "Không được khớp /$Pattern/, được: $Actual. $Msg" } }
function global:Assert-True($Actual, [string]$Msg = '') { if ($Actual -ne $true) { throw "Mong đợi `$true, được $(Fmt $Actual). $Msg" } }
function global:Assert-False($Actual, [string]$Msg = '') { if ($Actual -ne $false) { throw "Mong đợi `$false, được $(Fmt $Actual). $Msg" } }
function global:Assert-Null($Actual, [string]$Msg = '') { if ($null -ne $Actual -and "$Actual" -ne '') { throw "Mong đợi rỗng, được $(Fmt $Actual). $Msg" } }

function global:New-BotTemp([string]$Name) {
    $d = Join-Path $global:BotTD $Name
    New-Item -ItemType Directory -Force $d | Out-Null
    $d
}
function global:Write-BotJson([string]$Path, $Obj, [int]$Depth = 12) {
    New-Item -ItemType Directory -Force (Split-Path $Path) | Out-Null
    [IO.File]::WriteAllText($Path, (ConvertTo-Json $Obj -Depth $Depth), $global:Utf8NoBom)
}
function global:Write-BotText([string]$Path, [string]$Text) {
    New-Item -ItemType Directory -Force (Split-Path $Path) | Out-Null
    [IO.File]::WriteAllText($Path, $Text, $global:Utf8NoBom)
}

# Đồng hồ giả: chỉ bật trong một khối lệnh, tắt ngay sau đó (Pester cũng gọi Get-Date).
function global:Use-FakeNow([datetime]$Now, [scriptblock]$Body) {
    $global:FakeNow = $Now
    function global:Get-Date {
        [CmdletBinding()] param([int]$Year, [int]$Month, [int]$Day)
        $b = $global:FakeNow
        if ($PSBoundParameters.ContainsKey('Year') -or $PSBoundParameters.ContainsKey('Month') -or $PSBoundParameters.ContainsKey('Day')) {
            $y = if ($PSBoundParameters.ContainsKey('Year')) { $Year } else { $b.Year }
            $m = if ($PSBoundParameters.ContainsKey('Month')) { $Month } else { $b.Month }
            $d = if ($PSBoundParameters.ContainsKey('Day')) { $Day } else { $b.Day }
            return (New-Object DateTime $y, $m, $d, $b.Hour, $b.Minute, $b.Second)
        }
        $b
    }
    try { & $Body } finally { Remove-Item Function:\Get-Date -Force -ErrorAction SilentlyContinue }
}

# Biến môi trường: lưu rồi trả lại sau khối lệnh.
function global:Use-Env([hashtable]$Set, [scriptblock]$Body) {
    $old = @{}
    foreach ($k in $Set.Keys) { $old[$k] = [Environment]::GetEnvironmentVariable($k); [Environment]::SetEnvironmentVariable($k, $Set[$k]) }
    try { & $Body } finally { foreach ($k in $old.Keys) { [Environment]::SetEnvironmentVariable($k, $old[$k]) } }
}

# Bản chép của GenBid-Bot.ps1 với tên mutex riêng (bot thật đang chạy giữ 'Global\GenBidBot' trên máy Khoa).
function global:New-BotCopy([string]$Dir) {
    $src = [IO.File]::ReadAllText((Join-Path $global:BotDir 'GenBid-Bot.ps1'), $global:Utf8NoBom)
    if (-not $src.Contains('Global\GenBidBot')) { throw 'GenBid-Bot.ps1 không còn mutex Global\GenBidBot: cập nhật TestHelpers.ps1' }
    $dst = Join-Path $Dir 'GenBid-Bot.copy.ps1'
    [IO.File]::WriteAllText($dst, $src.Replace('Global\GenBidBot', "GenBidBotTest-$([guid]::NewGuid().ToString('N'))"), (New-Object Text.UTF8Encoding $true))
    $dst
}
