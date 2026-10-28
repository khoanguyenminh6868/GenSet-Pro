<#
Cài "Gợi ý cấu hình" cho bot GenBid trên máy Windows (Khoa, 2026-10-28). Chạy một lần:
  powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Projects\GenSet Pro\hsmt-inbox\worker-kit\Cai-GoiYCauHinh.ps1"
1. Lấy bản mới của nhánh hsmt-inbox (worker-kit).
2. Tải repo GenSet-Pro (nhánh main) về C:\Projects\GenSet Pro\GenSet-Pro, hoặc cập nhật nếu đã có.
3. Chép GenBid-Bot.ps1 mới vào genbid-hsmt và khởi động lại tác vụ "GenBid Bot".
Không đọc, in hay gửi token nào.
#>
param([string]$Root = 'C:\Projects\GenSet Pro')
$ErrorActionPreference = 'Stop'
$inbox = Join-Path $Root 'hsmt-inbox'
$repo = Join-Path $Root 'GenSet-Pro'
$kit = Join-Path $Root 'genbid-hsmt'

Write-Host '1. Cập nhật worker-kit (nhánh hsmt-inbox)...'
git -C $inbox pull --ff-only origin hsmt-inbox

Write-Host '2. Repo GenSet-Pro (nhánh main)...'
if (Test-Path (Join-Path $repo '.git')) { git -C $repo pull --ff-only origin main }
else { git clone --depth 1 -b main https://github.com/khoanguyenminh6868/GenSet-Pro.git $repo }
if (-not (Test-Path (Join-Path $repo 'suppliers\config-bot.mjs'))) { throw "Không thấy suppliers\config-bot.mjs trong $repo" }

Write-Host '3. Chép GenBid-Bot.ps1 và khởi động lại bot...'
$dst = Join-Path $kit 'GenBid-Bot.ps1'
if (Test-Path $dst) { Copy-Item $dst "$dst.bak-$(Get-Date -Format 'yyyyMMddHHmmss')" }
Copy-Item (Join-Path $inbox 'worker-kit\GenBid-Bot.ps1') $dst -Force
$task = Get-ScheduledTask -TaskName 'GenBid Bot' -ErrorAction SilentlyContinue
if ($task) {
    Stop-ScheduledTask -TaskName 'GenBid Bot' -ErrorAction SilentlyContinue
    Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" | Where-Object { $_.CommandLine -like '*GenBid-Bot.ps1*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 2
    Start-ScheduledTask -TaskName 'GenBid Bot'
    Write-Host 'Đã khởi động lại tác vụ "GenBid Bot".'
} else { Write-Host 'Không thấy tác vụ "GenBid Bot": hãy đăng xuất rồi đăng nhập lại Windows, hoặc chạy GenBid-Bot.ps1.' }
Write-Host 'Xong. Bấm "Gợi ý" ở tab Cấu hình gợi ý trên web để thử; log ở genbid-bot-logs\config-*.log.'
