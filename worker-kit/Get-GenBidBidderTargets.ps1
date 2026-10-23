<#
Chọn các gói cần lấy danh sách nhà thầu và giá dự thầu từ muasamcong trong lượt này (bước 5b của worker).
Gói được chọn: đã đóng thầu (quá 30 phút) trong vòng -Days ngày, chưa xoá, chưa có kết quả LCNT trên bản web
(bidders/<TBMT> có final = true), và chưa kiểm tra gần đây (portalids/<TBMT>.checkedAt: 6 giờ với gói đóng
trong 7 ngày, 24 giờ với gói cũ hơn). Gói đã tham dự (Đã nộp, Trúng thầu, Không trúng) đi trước, rồi tới gói đang
theo dõi khác, rồi tới gói đóng gần nhất; tối đa -Max gói.
Ghi ra -Out mảng [{key, notifyNo, bidName, bidCloseDate, tracked, stage, joined}].
#>
param(
    [Parameter(Mandatory)][string]$Out,
    [int]$Max = 8,
    [int]$Days = 180
)
$ErrorActionPreference = 'Stop'
$utf8 = New-Object Text.UTF8Encoding $false
$tmp = Join-Path $env:TEMP "genbid-targets-$(Get-Random)"
New-Item -ItemType Directory $tmp | Out-Null
function Get-Coll([string]$coll, [string]$id) {
    $f = Join-Path $tmp "$coll.json"
    $a = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', (Join-Path $PSScriptRoot 'Get-GenBidRequests.ps1'), '-Kind', 'docs', '-Coll', $coll, '-Out', $f) + @(if ($id) { '-Id', $id })
    & powershell @a | Out-Null
    if ($LASTEXITCODE -eq 1) { throw "Không đọc được $coll từ bản web." }
    if (-not (Test-Path $f)) { return @() }
    $d = Get-Content $f -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($id) { return $d }
    @($d | ForEach-Object { $_ })
}
try {
    $info = @{}
    foreach ($t in @((Get-Coll 'feed' 'current').tenders)) { if ($t.notifyNo) { $info[$t.notifyNo] = $t } }
    foreach ($c in 'seen', 'manual') { foreach ($d in (Get-Coll $c)) { if (-not $info[$d.id] -and $d.data.bidCloseDate) { $info[$d.id] = $d.data } } }
    $tracked = @{}; foreach ($d in (Get-Coll 'tracked')) { $tracked[$d.id] = if ($d.data.stage) { $d.data.stage } else { 'new' } }
    $deleted = @{}; foreach ($d in (Get-Coll 'deleted')) { $deleted[$d.id] = 1 }
    $bidders = @{}; foreach ($d in (Get-Coll 'bidders')) { $bidders[$d.id] = $d.data }
    $portal = @{}; foreach ($d in (Get-Coll 'portalids')) { $portal[$d.id] = $d.data }
    $now = (Get-Date).ToUniversalTime()
    $keys = @($info.Keys) + @($tracked.Keys | Where-Object { -not $info[$_] })
    $list = foreach ($key in $keys) {
        # Gói đang theo dõi mà bản web không có ngày đóng thầu: vẫn kiểm tra, mỗi 24 giờ một lần.
        $t = if ($info[$key]) { $info[$key] } else { [pscustomobject]@{ bidName = ''; bidCloseDate = $null } }
        if ($deleted[$key] -or $bidders[$key].final) { continue }
        $close = if ($t.bidCloseDate) { ([datetime]$t.bidCloseDate).ToUniversalTime() } else { $now.AddDays(-30) }
        if ($close -gt $now.AddMinutes(-30) -or $close -lt $now.AddDays(-$Days)) { continue }
        $checked = $portal[$key].checkedAt
        $gap = if ($t.bidCloseDate -and $close -gt $now.AddDays(-7)) { 6 } else { 24 }
        if ($checked -and ([datetime]$checked).ToUniversalTime() -gt $now.AddHours(-$gap)) { continue }
        $stage = $tracked[$key]
        [pscustomobject]@{ key = $key; notifyNo = $key; bidName = $t.bidName; bidCloseDate = $t.bidCloseDate; tracked = [bool]$stage; stage = $stage; joined = $stage -in 'submitted', 'won', 'lost'; close = $close }
    }
    $pick = @($list | Sort-Object @{ e = { -not $_.joined } }, @{ e = { -not $_.tracked } }, @{ e = { $_.close }; Descending = $true } | Select-Object -First $Max | Select-Object key, notifyNo, bidName, bidCloseDate, tracked, stage, joined)
    [IO.File]::WriteAllText($Out, (ConvertTo-Json @($pick) -Depth 4), $utf8)
    Write-Host "$(@($list).Count) gói cần lấy nhà thầu, lượt này lấy $($pick.Count): $(($pick | ForEach-Object { $_.key }) -join ', ')"
} finally { Remove-Item -Recurse -Force $tmp }
