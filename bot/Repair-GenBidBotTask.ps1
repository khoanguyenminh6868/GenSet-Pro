<#
Sửa tác vụ Windows "GenBid Bot" chạy qua conhost --headless (Khoa 17/11/2026: không nháy cửa sổ; Start-ScheduledTask
từ phiên Claude không treo như khi tác vụ gọi thẳng powershell.exe). Tác vụ tạo bằng quyền admin thì chỉ admin sửa được:
script tự xin quyền (bấm Yes ở hộp UAC), sửa, rồi bật lại bot QUA TÁC VỤ nếu bot đang chạy (kể cả bản bật ngoài tác vụ).

  powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Projects\GenSet Pro\GenSet-Pro\bot\Repair-GenBidBotTask.ps1"
  ... -NoStart   # chỉ sửa tác vụ, không bật bot
Dòng cuối: "SUMMARY: ...".
#>
param(
    [string]$Root = 'C:\Projects\GenSet Pro',
    [switch]$NoStart
)
$ErrorActionPreference = 'Stop'
$Kit = Join-Path $Root 'genbid-hsmt'
$admin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $admin) {
    $argList = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$PSCommandPath`"", '-Root', "`"$Root`"") + $(if ($NoStart) { '-NoStart' })
    try { $p = Start-Process powershell.exe -Verb RunAs -ArgumentList $argList -Wait -PassThru }
    catch { Write-Host 'SUMMARY: chưa sửa: không được cấp quyền admin (hộp UAC bị từ chối).'; exit 1 }
    exit $p.ExitCode
}

$log = Join-Path $Root 'genbid-bot-logs\repair-task.log'
function Say($m) { Write-Host $m; try { Add-Content $log ("{0:yyyy-MM-dd HH:mm:ss}  {1}" -f (Get-Date), $m) -Encoding UTF8 } catch {} }
$task = Get-ScheduledTask 'GenBid Bot' -ErrorAction SilentlyContinue
if (-not $task) { Say "SUMMARY: máy này chưa có tác vụ 'GenBid Bot': chạy bot\Install-GenBidBot.ps1"; exit 1 }
if ($task.Actions[0].Execute -eq 'conhost.exe') { Say "Tác vụ 'GenBid Bot' đã chạy qua conhost --headless." }
else {
    $act = New-ScheduledTaskAction -Execute 'conhost.exe' -WorkingDirectory $Root `
        -Argument "--headless powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$Kit\GenBid-Bot.ps1`""
    Set-ScheduledTask -TaskName 'GenBid Bot' -Action $act | Out-Null
    Say "Đã sửa tác vụ 'GenBid Bot' chạy qua conhost --headless."
}
if ($NoStart) { Say 'SUMMARY: đã sửa tác vụ, không bật bot (-NoStart).'; exit 0 }

# Bot đang chạy (trong hay ngoài tác vụ) thì bật lại qua tác vụ; không chạy thì để yên (có thể Khoa cố ý tắt).
$disp = @(Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" | Where-Object { $_.CommandLine -match 'GenBid-Bot\.ps1' -and $_.CommandLine -notmatch '\s-Job\b' })
if (-not $disp.Count) { Say 'SUMMARY: đã sửa tác vụ; bot đang tắt nên để yên (bật: Start-ScheduledTask "GenBid Bot").'; exit 0 }
Stop-ScheduledTask 'GenBid Bot' -ErrorAction SilentlyContinue
$disp | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
Start-Sleep 2
$at = Get-Date
Start-ScheduledTask 'GenBid Bot'
$ok = $false
for ($i = 0; $i -lt 45 -and -not $ok; $i++) {
    Start-Sleep 1
    $lg = Join-Path $Root ('genbid-bot-logs\bot-{0:yyyy-MM}.log' -f $at)
    $ok = [bool](Get-Content $lg -Tail 30 -Encoding UTF8 -ErrorAction SilentlyContinue | Where-Object {
        $_ -match '^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d)\s+Bot GenBid bắt đầu' -and [datetime]$Matches[1] -ge $at.AddSeconds(-1) })
}
if ($ok) { Say 'SUMMARY: đã sửa tác vụ và bật lại bot qua tác vụ (log ghi "Bot GenBid bắt đầu").'; exit 0 }
Say "SUMMARY: đã sửa tác vụ nhưng 45 giây chưa thấy log 'Bot GenBid bắt đầu': xem $Root\genbid-bot-logs."
exit 1
