<#
Đồng bộ feed/current của GenBid Pro với kết quả tìm kiếm muasamcong.

-Mode Sigs  : in ra JSON {"<notifyNo>": "<chữ ký>"} của các gói trong feed hiện tại, để dán vào search-extract.js (KNOWN).
-Mode Merge : gộp các gói mới/đổi (-Changed, từ search-extract.js) và danh sách số TBMT có trong kết quả (-Present)
              vào feed hiện tại, ghi -Out = {fetchedAt, source, tenders}. Gói không còn trong kết quả nhưng chưa đóng thầu được giữ lại.
              Thoát mã 0 nếu có thay đổi (cần ghi feed/current), mã 2 nếu không có gì đổi (không ghi).
-Current là tệp ArtifactData xuất ra cho feed/current (có hoặc không có lớp bọc {data, version}).
#>
param(
    [Parameter(Mandatory)][ValidateSet('Sigs', 'Merge')][string]$Mode,
    [Parameter(Mandatory)][string]$Current,
    [string]$Changed,
    [string]$Present,
    [string]$Out
)
$ErrorActionPreference = 'Stop'

# Chữ ký phải khớp hàm sig() trong search-extract.js.
$sha = [Security.Cryptography.SHA256]::Create()
function Sig($t) {
    $s = @($t.bidCloseDate, $t.bidOpenDate, $t.notifyVersion, $t.estimatedPrice, $t.bidName, $t.investorName, $t.procuringEntityName, $t.location, ([string]$t.isInternet).ToLower()) -join '|'
    if ($t.status -eq 'cancelled') { $s += '|cancelled' }
    ([BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($s))).Replace('-', '')).Substring(0, 12).ToLower()
}

$cur = Get-Content -Raw -Encoding UTF8 $Current | ConvertFrom-Json
if ($cur.PSObject.Properties.Name -contains 'data' -and $cur.PSObject.Properties.Name -contains 'version') { $cur = $cur.data }
$tenders = @($cur.tenders)

if ($Mode -eq 'Sigs') {
    $m = [ordered]@{}
    foreach ($t in $tenders) { $m[$t.notifyNo] = Sig $t }
    $m | ConvertTo-Json -Compress
    exit 0
}

$chg = @()
if ($Changed -and (Test-Path $Changed)) { $chg = @(Get-Content -Raw -Encoding UTF8 $Changed | ConvertFrom-Json | ForEach-Object { $_ }) }
$present = @($Present -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ })
$byNo = @{}; foreach ($c in $chg) { $byNo[$c.notifyNo] = $c }
$now = [DateTime]::UtcNow

$new = @(); $updated = @(); $dropped = @(); $result = @()
foreach ($t in $tenders) {
    if ($byNo.ContainsKey($t.notifyNo)) { $result += $byNo[$t.notifyNo]; $updated += $t.notifyNo; $byNo.Remove($t.notifyNo) }
    elseif ($present -contains $t.notifyNo) { $result += $t }
    elseif ($t.bidCloseDate -and [DateTime]::Parse($t.bidCloseDate).ToUniversalTime() -gt $now) { $result += $t }
    else { $dropped += $t.notifyNo }
}
foreach ($c in $chg) { if ($byNo.ContainsKey($c.notifyNo)) { $result += $c; $new += $c.notifyNo } }

Write-Host "Mới: $($new.Count) $($new -join ', ')"
Write-Host "Đổi thông tin: $($updated.Count) $($updated -join ', ')"
Write-Host "Đã đóng, bỏ khỏi feed: $($dropped.Count) $($dropped -join ', ')"
if (-not ($new.Count + $updated.Count + $dropped.Count)) { Write-Host 'Feed không đổi, không cần ghi.'; exit 2 }
$doc = [ordered]@{ fetchedAt = $now.ToString('yyyy-MM-ddTHH:mm:ss.fffZ'); source = 'muasamcong'; tenders = $result }
[IO.File]::WriteAllText($Out, ($doc | ConvertTo-Json -Depth 10), (New-Object Text.UTF8Encoding $false))
Write-Host "Đã ghi $Out ($($result.Count) gói)."
exit 0
