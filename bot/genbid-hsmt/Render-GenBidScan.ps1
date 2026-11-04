<#
Chuyển các trang của một PDF bản scan (không có lớp chữ) thành ảnh PNG để Claude đọc bằng Read.
Dùng pdftoppm của Poppler (cài bằng: winget install --id oschwartz10612.Poppler -e --scope user).
In ra số trang của tệp, có chữ hay không, và danh sách ảnh đã ghi.
Ví dụ: Render-GenBidScan.ps1 -Pdf HSMT.pdf -OutDir <scratchpad>\scan\<key> -First 1 -Last 10
#>
param(
    [Parameter(Mandatory)][string]$Pdf,
    [Parameter(Mandatory)][string]$OutDir,
    [int]$First = 1,
    [int]$Last = 10,
    # 110 dpi đủ đọc chữ trang A4 mà ảnh không quá lớn.
    [int]$Dpi = 110
)
$ErrorActionPreference = 'Stop'
function Find-Tool([string]$name) {
    $c = Get-Command $name -ErrorAction SilentlyContinue
    if ($c) { return $c.Source }
    $w = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\oschwartz10612.Poppler*" -Recurse -Filter "$name.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($w) { return $w.FullName }
    throw "Chưa có $name. Cài Poppler: winget install --id oschwartz10612.Poppler -e --scope user"
}
$toppm = Find-Tool 'pdftoppm'
$info = & (Find-Tool 'pdfinfo') $Pdf 2>$null
$pages = [int](($info | Select-String '^Pages:\s+(\d+)').Matches[0].Groups[1].Value)
$text = & (Find-Tool 'pdftotext') -l 3 $Pdf - 2>$null
$hasText = (($text -join '') -replace '\s', '').Length -gt 100
New-Item -ItemType Directory -Force $OutDir | Out-Null
$Last = [Math]::Min($Last, $pages)
& $toppm -png -r $Dpi -f $First -l $Last $Pdf (Join-Path $OutDir 'p')
Write-Host "Tệp có $pages trang, $(if ($hasText) { 'có lớp chữ (dùng pdftotext)' } else { 'là bản scan' }). Ảnh trang ${First}-${Last}:"
Get-ChildItem $OutDir -Filter 'p-*.png' | Sort-Object Name | ForEach-Object { Write-Host "  $($_.FullName)" }
