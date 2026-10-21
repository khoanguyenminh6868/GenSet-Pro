<#
Gửi kết quả phân tích từ cơ sở dữ liệu artifact GenBid Pro lên bản Vercel.

-ExportDir : thư mục do ArtifactData (out_dir) ghi, dạng <ExportDir>\<coll>\<id>.json
-Versions  : tệp JSON {"<coll>/<id>": version} lấy từ kết quả list của ArtifactData
Chỉ gửi tài liệu có version khác lần gửi thành công trước. Không in token ra màn hình.
#>
param(
    [Parameter(Mandatory)][string]$ExportDir,
    [Parameter(Mandatory)][string]$Versions,
    [string]$TokenFile = 'C:\Projects\GenSet Pro\.genbid-ingest-token',
    [string]$StateFile = 'C:\Projects\GenSet Pro\.genbid-ingest-state.json',
    [string]$Endpoint = 'https://genset-pro-web.vercel.app/api/ingest'
)

$ErrorActionPreference = 'Stop'
if (-not (Test-Path $TokenFile)) { Write-Host 'Chưa có tệp token, bỏ qua bước gửi.'; exit 0 }
$token = (Get-Content $TokenFile -TotalCount 1).Trim()
if (-not $token) { Write-Host 'Tệp token rỗng, bỏ qua bước gửi.'; exit 0 }

$ver = Get-Content -Raw -Encoding UTF8 $Versions | ConvertFrom-Json
$state = @{}
if (Test-Path $StateFile) {
    (Get-Content -Raw -Encoding UTF8 $StateFile | ConvertFrom-Json).PSObject.Properties | ForEach-Object { $state[$_.Name] = $_.Value }
}

$rows = @(); $keys = @()
foreach ($p in $ver.PSObject.Properties) {
    $coll, $id = $p.Name.Split('/', 2)
    if ($state[$p.Name] -eq $p.Value) { continue }
    $f = Join-Path $ExportDir "$coll\$id.json"
    if (-not (Test-Path $f)) { continue }
    $doc = Get-Content -Raw -Encoding UTF8 $f | ConvertFrom-Json
    # Bỏ lớp bọc {data, version} nếu tệp xuất có.
    if ($doc.PSObject.Properties.Name -contains 'data' -and $doc.PSObject.Properties.Name -contains 'version' -and @($doc.PSObject.Properties).Count -le 3) { $doc = $doc.data }
    if ($coll -eq 'analysis' -and $doc.status -ne 'done') { continue }
    $rows += [pscustomobject]@{ coll = $coll; id = $id; data = $doc }
    $keys += $p.Name
}
if (-not $rows) { Write-Host 'Không có kết quả phân tích mới để gửi.'; exit 0 }

$headers = @{ Authorization = "Bearer $token" }
$written = 0; $skipped = 0
for ($i = 0; $i -lt $rows.Count; $i += 200) {
    $end = [Math]::Min($i + 199, $rows.Count - 1)
    $body = @{ rows = @($rows[$i..$end]) } | ConvertTo-Json -Depth 64 -Compress
    try {
        $r = Invoke-RestMethod $Endpoint -Method Post -Headers $headers -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($body)) -TimeoutSec 120
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        if ($code -eq 401) { Write-Host 'Vercel báo 401 (token thiếu hoặc sai), bỏ qua lượt này.'; exit 0 }
        throw
    }
    $written += $r.written; $skipped += $r.skipped
    foreach ($k in $keys[$i..$end]) { $state[$k] = $ver.$k }
    $state | ConvertTo-Json | Set-Content -Encoding UTF8 $StateFile
}
Write-Host "Đã gửi $($rows.Count) tài liệu: written=$written, skipped=$skipped."
