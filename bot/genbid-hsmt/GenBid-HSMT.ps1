<#
GenBid - tải hồ sơ mời thầu (HSMT) qua VNeGP Client Agent.

Không tham số : bật Agent nếu chưa chạy, rồi tải mọi file trong các danh sách
                "*_danh-sach-file.txt" (do nút GenBid trên trình duyệt lưu) có trong thư mục Downloads.
-List <file>   : tải theo một danh sách cụ thể.
-FileId <id>   : tải một/vài file theo fileId (dạng "id" hoặc "id,tên file").
-StartOnly     : chỉ bật Agent.
#>
param(
    [string]$List,
    [string[]]$FileId,
    [string]$NotifyNo = 'HSMT',
    [string]$OutDir = (Join-Path ([Environment]::GetFolderPath('UserProfile')) 'Downloads\GenBid-HSMT'),
    [switch]$StartOnly,
    # Thời gian chờ mỗi tệp (giây); lệnh specs của genbid-sync.js dùng 180 vì Agent đôi khi treo.
    [int]$TimeoutSec = 600
)

$ErrorActionPreference = 'Stop'
$AgentPort = 1234
$AgentUrl = "http://localhost:$AgentPort/api/download/file/browser/public"
# Agent chỉ trả file khi request mang Origin của trang muasamcong (giống trình duyệt gửi).
$Origin = 'https://muasamcong.mof.gov.vn'
$AgentPage = 'https://muasamcong.mof.gov.vn/web/guest/tender-management-unit'
$Downloads = Join-Path ([Environment]::GetFolderPath('UserProfile')) 'Downloads'

function Test-Agent {
    $c = New-Object Net.Sockets.TcpClient
    try { $c.ConnectAsync('127.0.0.1', $AgentPort).Wait(1500) -and $c.Connected } catch { $false } finally { $c.Close() }
}

function Find-AgentExe {
    $cands = @('C:\MPI\EGP-AGENT\egp-edoc-agent.exe')
    $keys = 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*',
            'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*',
            'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*'
    Get-ItemProperty $keys -ErrorAction SilentlyContinue |
        Where-Object { $_.DisplayName -match 'VNeGP|EGP' -and $_.InstallLocation } |
        ForEach-Object { $cands += (Join-Path $_.InstallLocation 'egp-edoc-agent.exe') }
    $cands | Where-Object { Test-Path $_ } | Select-Object -First 1
}

function Start-Agent {
    if (Test-Agent) { Write-Host 'VNeGP Client Agent đang chạy (cổng 1234).'; return $true }
    $exe = Find-AgentExe
    if (-not $exe) {
        Write-Host 'Máy này chưa cài VNeGP Client Agent.' -ForegroundColor Yellow
        Write-Host "Tải bản chính thức tại: $AgentPage (mục VNeGP Client Agent), cài xong chạy lại script này."
        Start-Process $AgentPage
        return $false
    }
    Write-Host "Đang bật Agent: $exe"
    Start-Process -FilePath $exe -WorkingDirectory (Split-Path $exe)
    for ($i = 0; $i -lt 90; $i++) {
        Start-Sleep -Seconds 1
        if (Test-Agent) { Write-Host "Agent đã sẵn sàng sau $($i + 1) giây."; Start-Sleep -Seconds 2; return $true }
    }
    Write-Host 'Agent không mở cổng 1234 sau 90 giây. Kiểm tra biểu tượng Agent ở khay hệ thống.' -ForegroundColor Red
    return $false
}

function Get-SafeName([string]$s) { ($s -replace '[\\/:*?"<>|]+', '_').Trim() }

function Save-File([string]$id, [string]$name, [string]$dir) {
    New-Item -ItemType Directory -Force $dir | Out-Null
    $tmp = Join-Path $dir ".$id.part"
    $r = Invoke-WebRequest "$AgentUrl`?fileId=$id" -Headers @{ Origin = $Origin } -UseBasicParsing -TimeoutSec $TimeoutSec -OutFile $tmp -PassThru
    if (-not $name) {
        # Content-disposition: attachment; filename=<ma>_<ten file da URL-encode>
        $cd = "$($r.Headers['Content-disposition'])"
        if ($cd -match 'filename=(.+)$') { $name = [Uri]::UnescapeDataString(($Matches[1].Trim('"') -replace '\+', ' ')) }
        if (-not $name) { $name = "$id.bin" }
    }
    $size = (Get-Item $tmp).Length
    if ($size -eq 0) { Remove-Item $tmp; throw 'Agent trả về file rỗng' }
    $dest = Join-Path $dir (Get-SafeName $name)
    Move-Item $tmp $dest -Force
    [pscustomobject]@{ NotifyNo = Split-Path $dir -Leaf; FileId = $id; File = $dest; Bytes = $size; MD5 = (Get-FileHash $dest -Algorithm MD5).Hash }
}

function Invoke-Batch([string]$notify, [object[]]$items) {
    $dir = Join-Path $OutDir (Get-SafeName $notify)
    $done = @()
    foreach ($it in $items) {
        $id, $name = "$it".Split(',', 2)
        $id = $id.Trim()
        if ($id -notmatch '^[0-9a-fA-F-]{36}$') { continue }
        try {
            $res = Save-File $id $name $dir
            Write-Host ("  OK  {0}  ({1:N0} KB)" -f (Split-Path $res.File -Leaf), ($res.Bytes / 1KB)) -ForegroundColor Green
            $done += $res
        } catch {
            Write-Host "  LỖI $id $name : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    if ($done) { $done | Export-Csv (Join-Path $dir 'manifest.csv') -NoTypeInformation -Encoding UTF8 -Append }
    Write-Host "  => $($done.Count)/$(@($items).Count) file trong $dir"
    $done.Count
}

function Read-List([string]$path) {
    $lines = Get-Content $path -Encoding UTF8 | Where-Object { $_.Trim() }
    $notify = ($lines | Where-Object { $_ -like '#*' } | Select-Object -First 1) -replace '^#\s*', ''
    if (-not $notify) { $notify = ([IO.Path]::GetFileNameWithoutExtension($path) -replace '_danh-sach-file$', '') }
    @{ Notify = $notify; Items = @($lines | Where-Object { $_ -notlike '#*' }) }
}

if (-not (Start-Agent)) { exit 1 }
if ($StartOnly) { exit 0 }

if ($FileId) {
    Write-Host "Gói $NotifyNo"
    Invoke-Batch $NotifyNo $FileId | Out-Null
    exit 0
}

$lists = if ($List) { @(Get-Item $List) } else {
    Get-ChildItem $Downloads -Filter '*_danh-sach-file*.txt' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime
}
if (-not $lists) {
    Write-Host 'Chưa có danh sách file nào trong Downloads. Mở trang gói thầu trên muasamcong, bấm nút "GenBid tải HSMT" rồi chạy lại.'
    exit 0
}
$doneDir = Join-Path $OutDir '_danh-sach-da-tai'
foreach ($l in $lists) {
    $d = Read-List $l.FullName
    Write-Host "Gói $($d.Notify) ($($d.Items.Count) file) - $($l.Name)"
    $n = Invoke-Batch $d.Notify $d.Items
    if (-not $List -and $n -eq $d.Items.Count) {
        New-Item -ItemType Directory -Force $doneDir | Out-Null
        Move-Item $l.FullName (Join-Path $doneDir $l.Name) -Force
    }
}
