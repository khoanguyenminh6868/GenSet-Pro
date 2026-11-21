---
name: tat-bot
description: Tắt bot GenBid trên máy Windows này qua tác vụ "GenBid Bot" (End), kiểm bot đã thoát, báo lượt nào còn chạy dở; yêu cầu web sau đó chuyển sang bot dự phòng Vercel Sandbox. Dùng khi Khoa nói "tắt bot", "dừng bot", "stop bot", "cho sandbox làm", hoặc gõ /tat-bot.
---

# Tắt bot (tat-bot)

Bot chỉ được tắt / bật qua tác vụ Windows "GenBid Bot" (Khoa 17/11/2026). Không Stop-Process tiến trình bot rồi để đó,
không chạy tay `GenBid-Bot.ps1`. Tác vụ chạy `conhost --headless`: End tắt conhost, bot thấy conhost mất thì tự thoát (≤ 15 s).

1. Dừng tác vụ rồi chờ bot thoát (chạy bằng PowerShell):
   ```powershell
   $botProcs = { @(Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" | Where-Object { $_.CommandLine -match 'GenBid-Bot\.ps1' }) }
   Stop-ScheduledTask 'GenBid Bot'
   for ($i = 0; $i -lt 30 -and @(& $botProcs | Where-Object { $_.CommandLine -notmatch '\s-Job\b' }).Count; $i++) { Start-Sleep 1 }
   $disp = @(& $botProcs | Where-Object { $_.CommandLine -notmatch '\s-Job\b' })
   $kids = @(& $botProcs | Where-Object { $_.CommandLine -match '\s-Job\b' })
   "tác vụ: $((Get-ScheduledTask 'GenBid Bot').State); bot còn: $($disp.Count); lượt dở: $($kids.Count)"
   Get-Content "C:\Projects\GenSet Pro\genbid-bot-logs\bot-$(Get-Date -Format yyyy-MM).log" -Tail 5 -Encoding UTF8
   ```
2. Đọc kết quả:
   - **Bot còn > 0 sau 30 giây** (bot bản cũ chưa có tự thoát, hoặc bật ngoài tác vụ): báo Khoa, hỏi trước khi
     `Stop-Process` tiến trình bot đó (PID, giờ bật). Gợi ý `/update-bot` để máy có bản bot tự thoát.
   - **Lượt dở > 0:** lượt đó (Sync, Phân tích, Gợi ý cấu hình…) chạy nốt cho xong và vẫn báo "máy còn bật" lên web, nên
     sandbox chưa nhận việc tới khi nó xong. Liệt kê lượt (log dòng "Bắt đầu lượt ..."). Chỉ dừng lượt dở khi Khoa bảo
     (`Stop-Process` PID lượt con và tiến trình con của nó); yêu cầu của lượt bị cắt sẽ phải bấm lại trên web.
3. Báo Khoa ngắn: bot đã tắt (hay chưa, vì sao), lượt nào còn chạy dở, và: khoảng 1 phút sau khi máy im, web coi máy tắt;
   yêu cầu mới từ web (hoặc yêu cầu đang chờ, khi trang web đang mở) sẽ đánh thức bot dự phòng Vercel Sandbox.
   Bật lại bot máy này: `/bat-bot`.
