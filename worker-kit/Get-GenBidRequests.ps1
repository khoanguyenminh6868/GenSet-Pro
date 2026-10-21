<#
Lấy danh sách yêu cầu tải HSMT đang chờ từ bản Vercel, ghi ra tệp JSON (mảng).
Thoát mã 1 nếu không lấy được, để worker chuyển sang requests.json trên nhánh hsmt-inbox.
Không in token ra màn hình.
#>
param(
    [Parameter(Mandatory)][string]$Out,
    [string]$TokenFile = 'C:\Projects\GenSet Pro\.genbid-ingest-token',
    [string]$Endpoint = 'https://genset-pro-web.vercel.app/api/requests'
)

if (-not (Test-Path $TokenFile)) { Write-Host 'Chưa có tệp token.'; exit 1 }
$token = (Get-Content $TokenFile -TotalCount 1).Trim()
try {
    $r = Invoke-WebRequest $Endpoint -Headers @{ Authorization = "Bearer $token" } -UseBasicParsing -TimeoutSec 60
    $text = [Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray())
    # PowerShell 5.1 trả mảng JSON thành một đối tượng; trải ra để đếm đúng.
    $list = @($text | ConvertFrom-Json | ForEach-Object { $_ })
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Host "Không lấy được danh sách từ Vercel (HTTP $code): $($_.Exception.Message)"
    exit 1
}
[IO.File]::WriteAllText($Out, $text, (New-Object Text.UTF8Encoding $false))
Write-Host "HTTP $($r.StatusCode), $($list.Count) yêu cầu."
