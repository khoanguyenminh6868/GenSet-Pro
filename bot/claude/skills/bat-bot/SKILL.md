---
name: bat-bot
description: Bật bot GenBid trên máy Windows này qua tác vụ "GenBid Bot" (Run), kiểm log có "Bot GenBid bắt đầu" và web nhận nhịp tim; bot dự phòng Vercel Sandbox tự dừng khi máy bật lại. Dùng khi Khoa nói "bật bot", "chạy bot", "start bot", "mở lại bot", hoặc gõ /bat-bot.
---

# Bật bot (bat-bot)

Bot chỉ được bật qua tác vụ Windows "GenBid Bot" (Khoa 17/11/2026). KHÔNG bật bằng `Start-Process` hay chạy tay
`GenBid-Bot.ps1`, kể cả khi tác vụ lỗi: bot ngoài tác vụ thì End tác vụ không tắt được, nó vẫn nhận việc và chặn sandbox.

1. Kiểm trước (PowerShell):
   ```powershell
   $t = Get-ScheduledTask 'GenBid Bot' -ErrorAction SilentlyContinue
   $disp = @(Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" | Where-Object { $_.CommandLine -match 'GenBid-Bot\.ps1' -and $_.CommandLine -notmatch '\s-Job\b' })
   "tác vụ: $($t.State) chạy $($t.Actions[0].Execute); bot đang chạy: $($disp.Count)"
   ```
   - Không có tác vụ: máy chưa cài bot → skill `genbid-setup`.
   - Tác vụ `Disabled`: hỏi Khoa (có thể cố ý tắt hẳn máy này) trước khi `Enable-ScheduledTask`.
   - Bot đã chạy (`$disp.Count` > 0): báo Khoa, không bật thêm.
   - Tác vụ còn chạy `powershell.exe` (kiểu cũ, hiện cửa sổ Windows Terminal): bật vẫn được, nhưng đưa Khoa lệnh sửa
     (cần quyền admin, Khoa bấm Yes ở UAC):
     `powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Projects\GenSet Pro\GenSet-Pro\bot\Repair-GenBidBotTask.ps1"`
2. Bật và chờ log (tối đa 45 giây):
   ```powershell
   $at = Get-Date
   Start-ScheduledTask 'GenBid Bot'
   $lg = "C:\Projects\GenSet Pro\genbid-bot-logs\bot-$(Get-Date -Format yyyy-MM).log"
   $ok = $false
   for ($i = 0; $i -lt 45 -and -not $ok; $i++) {
       Start-Sleep 1
       $ok = [bool](Get-Content $lg -Tail 30 -Encoding UTF8 -ErrorAction SilentlyContinue | Where-Object {
           $_ -match '^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d)\s+Bot GenBid bắt đầu' -and [datetime]$Matches[1] -ge $at.AddSeconds(-1) })
   }
   "đã bật: $ok"; Get-Content $lg -Tail 5 -Encoding UTF8
   ```
   Không thấy dòng "Bot GenBid bắt đầu" sau 45 giây: báo Khoa kèm 5 dòng log cuối, KHÔNG đi đường vòng.
3. Kiểm web nhận nhịp tim (lastPollAt của `pc` trong vòng 1 phút):
   ```powershell
   $tok = (Get-Content "C:\Projects\GenSet Pro\.genbid-ingest-token" -TotalCount 1).Trim()
   Invoke-RestMethod "https://genset-pro-web.vercel.app/api/requests?kind=bots" -Headers @{ Authorization = "Bearer $tok" } | ConvertTo-Json -Depth 4
   ```
   `sandbox.running` = true: sandbox đang làm dở một lượt; nó làm xong rồi tự dừng, máy này nhận việc mới sau đó (máy nhường
   việc trong lúc sandbox còn nhịp tim < 2 phút).
4. Báo Khoa ngắn: bot đã bật lúc nào, web đã thấy máy bật chưa, sandbox có đang làm dở không. Tắt lại: `/tat-bot`.
