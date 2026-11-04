<#
Ghi tài liệu thẳng lên bản Vercel (POST /api/ingest): mọi tệp <Dir>\<coll>\<id>.json, nội dung là
đối tượng tài liệu. Vercel nhận: analysis (chỉ status "done"), analysisreq, notice, feed/current,
syncreq/current, translation, compare. Không in token ra màn hình. Thoát mã 1 khi gửi lỗi.
#>
param(
    [Parameter(Mandatory)][string]$Dir,
    [string]$TokenFile = 'C:\Projects\GenSet Pro\.genbid-ingest-token',
    [string]$Endpoint = 'https://genset-pro-web.vercel.app/api/ingest'
)
$ErrorActionPreference = 'Stop'
if (-not (Test-Path $TokenFile)) { Write-Host 'Chưa có tệp token.'; exit 1 }
$token = (Get-Content $TokenFile -TotalCount 1).Trim()

$rows = @(Get-ChildItem $Dir -Directory | ForEach-Object {
    $coll = $_.Name
    Get-ChildItem $_.FullName -Filter *.json -File | ForEach-Object {
        [pscustomobject]@{ coll = $coll; id = $_.BaseName; data = (Get-Content -Raw -Encoding UTF8 $_.FullName | ConvertFrom-Json) }
    }
})
if (-not $rows) { Write-Host 'Không có tài liệu nào để gửi.'; exit 0 }
$written = 0; $skipped = 0
for ($i = 0; $i -lt $rows.Count; $i += 100) {
    $end = [Math]::Min($i + 99, $rows.Count - 1)
    $body = @{ rows = @($rows[$i..$end]) } | ConvertTo-Json -Depth 64 -Compress
    try {
        $r = Invoke-RestMethod $Endpoint -Method Post -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($body)) -TimeoutSec 120
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Host "Vercel trả lỗi (HTTP $code): $($_.ErrorDetails.Message)"
        exit 1
    }
    $written += $r.written; $skipped += $r.skipped
}
Write-Host "Đã gửi $($rows.Count) tài liệu lên Vercel: ghi $written, bỏ qua $skipped ($(($rows | ForEach-Object { "$($_.coll)/$($_.id)" }) -join ', '))."
