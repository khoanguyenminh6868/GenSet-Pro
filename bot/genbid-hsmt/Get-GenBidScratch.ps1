<#
Tải một tệp HSDT mà bản web đã đưa lên kho riêng tư "scratch" (yêu cầu Đối chiếu): xin link tạm (10 phút) từ
/api/scratch rồi tải về -Out. Tệp HSDT là tài liệu riêng của công ty: chỉ để trên máy này (HSDT đối chiếu giữ ở Downloads\GenBid-HSDT\<TBMT>\, Khoa 2026-11-05), không bao giờ đưa lên git/GitHub.
Không in token ra màn hình. Thoát mã 1 khi không tải được.
#>
param(
    [Parameter(Mandatory)][string]$Path,
    [Parameter(Mandatory)][string]$Out,
    [string]$TokenFile = 'C:\Projects\GenSet Pro\.genbid-ingest-token',
    [string]$Endpoint = 'https://genset-pro-web.vercel.app/api/scratch'
)
$ErrorActionPreference = 'Stop'
if (-not (Test-Path $TokenFile)) { Write-Host 'Chưa có tệp token.'; exit 1 }
$token = (Get-Content $TokenFile -TotalCount 1).Trim()
try {
    $r = Invoke-RestMethod "$Endpoint`?path=$([Uri]::EscapeDataString($Path))" -Headers @{ Authorization = "Bearer $token" } -TimeoutSec 60
    New-Item -ItemType Directory -Force (Split-Path $Out) | Out-Null
    Invoke-WebRequest $r.url -OutFile $Out -UseBasicParsing -TimeoutSec 600
} catch {
    Write-Host "Không tải được $Path (HTTP $($_.Exception.Response.StatusCode.value__)): $($_.Exception.Message)"
    exit 1
}
Write-Host "Đã tải $Path ($([Math]::Round((Get-Item $Out).Length / 1KB)) KB)."