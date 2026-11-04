<#
Đọc từ bản Vercel và ghi ra tệp JSON: yêu cầu tải HSMT đang chờ (mặc định), yêu cầu Sync,
yêu cầu Phân tích, hoặc tài liệu của một collection (-Kind docs -Coll <c> [-Id <id>]: mảng {id, data}).
Thoát mã 1 nếu không lấy được.
Không in token ra màn hình.
#>
param(
    [Parameter(Mandatory)][string]$Out,
    # files: yêu cầu lấy tệp (mảng). sync: {pending, requestedAt}. analysis: [{key, notifyNo, requestedAt}].
    # translation / compare / hsdt / tlkt: yêu cầu Tạo bản tiếng Anh / Đối chiếu / Tạo HSDT tham khảo / Đối chiếu TLKT [{key, notifyNo, requestedAt, ...}]; compare và tlkt có files [{path, name, size}] và text.
    [ValidateSet('files', 'sync', 'analysis', 'translation', 'compare', 'hsdt', 'tlkt', 'docs')][string]$Kind = 'files',
    [string]$Coll,
    [string]$Id,
    [string]$TokenFile = 'C:\Projects\GenSet Pro\.genbid-ingest-token',
    [string]$Endpoint = 'https://genset-pro-web.vercel.app/api/requests'
)

if (-not (Test-Path $TokenFile)) { Write-Host 'Chưa có tệp token.'; exit 1 }
$token = (Get-Content $TokenFile -TotalCount 1).Trim()
try {
    $url = switch ($Kind) {
        'files' { $Endpoint }
        'docs' { "$Endpoint`?kind=docs&coll=$Coll" + $(if ($Id) { "&id=$([Uri]::EscapeDataString($Id))" }) }
        default { "$Endpoint`?kind=$Kind" }
    }
    $r = Invoke-WebRequest $url -Headers @{ Authorization = "Bearer $token" } -UseBasicParsing -TimeoutSec 60
    $text = [Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray())
    # PowerShell 5.1 trả mảng JSON thành một đối tượng; trải ra để đếm đúng.
    $list = @($text | ConvertFrom-Json | ForEach-Object { $_ })
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Host "Không lấy được danh sách từ Vercel (HTTP $code): $($_.Exception.Message)"
    exit 1
}
# Một tài liệu (-Id): ghi thẳng nội dung của nó; thoát mã 3 khi chưa có.
if ($Kind -eq 'docs' -and $Id) {
    if (-not $list) { Write-Host "Chưa có $Coll/$Id."; exit 3 }
    $text = $list[0].data | ConvertTo-Json -Depth 64
}
[IO.File]::WriteAllText($Out, $text, (New-Object Text.UTF8Encoding $false))
if ($Kind -eq 'sync') { Write-Host "HTTP $($r.StatusCode), Sync đang chờ: $($list[0].pending)." }
elseif ($Kind -eq 'docs') { Write-Host "HTTP $($r.StatusCode), $($list.Count) tài liệu $Coll." }
else { Write-Host "HTTP $($r.StatusCode), $($list.Count) yêu cầu." }
