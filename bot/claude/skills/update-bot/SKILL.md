---
name: update-bot
description: Cập nhật bot GenBid trên máy Windows này theo main mới nhất trên GitHub (kéo main về checkout chính, chép bot\ sang genbid-hsmt\ và ~\.claude, khởi động lại tác vụ "GenBid Bot" nếu đang chạy code cũ). Dùng khi Khoa nói "updateBot", "update bot", "cập nhật bot", "kéo main về cho bot", "bot máy này cũ chưa", hoặc gõ /update-bot.
---

# Cập nhật bot (updateBot)

Bot chạy từ `C:\Projects\GenSet Pro\genbid-hsmt\` (ngoài git); bản trong git là `bot/` của checkout chính
`C:\Projects\GenSet Pro\GenSet-Pro` (luôn ở `main`). Phiên trên máy khác sửa bot rồi merge lên main → máy này phải kéo về và chép sang.
Mọi việc nằm trong `bot\Update-GenBidBot.ps1`; skill chỉ chạy nó và xử lý phần nó báo.

## Các bước

1. Xem trước (không đổi gì):
   ```
   powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Projects\GenSet Pro\GenSet-Pro\bot\Update-GenBidBot.ps1" -Check
   ```
   Lỗi "đang ở nhánh ... phải là main" → báo Khoa, không tự checkout (có thể phiên khác đang dùng).
2. Chạy thật (bỏ `-Check`). Script:
   - `git fetch` + `merge --ff-only --autostash origin/main` trong checkout chính (tệp sửa dở cũng đổi trên GitHub thì dừng, báo tên tệp);
   - chép `bot\genbid-hsmt`, `bot\claude\skills\*` (trừ `hsmt`, skill claude.ai), `bot\claude\scheduled-tasks\hsmt-worker`,
     `bot\claude\memory` sang máy, cùng `.hsmt-worker.md` và `CLAUDE.md` gốc; `package*.json` đổi thì `npm ci`;
   - tệp trên máy khác repo mà bản trên máy chưa từng có trong git (sửa tay chưa lên GitHub) → GIỮ NGUYÊN và liệt kê;
   - `GenBid-Bot.ps1` (vòng điều phối, nạp một lần) khởi động trước lần sửa `.ps1` mới nhất → Stop/Start tác vụ "GenBid Bot".
     Đang có lượt con (`-Job`) chạy thì hoãn. `genbid-sync.js`, `config-bot.mjs`... chạy tiến trình mới mỗi lượt, không cần restart;
   - đồng bộ sổ điều phối (`genbid-hsmt\Sync-DieuPhoi.ps1`, nhánh `dieu-phoi`) và tạo tác vụ "GenBid DieuPhoi Sync" nếu máy chưa có.
     Script tự chạy lại bằng bản mới nếu chính nó vừa đổi khi kéo main.
3. Đọc dòng `SUMMARY:` và xử lý phần "lưu ý":
   - **Tệp sửa tay chưa lên GitHub:** so hai bản (`git diff --no-index <repo> <máy>`), gộp phần mới của CẢ HAI bên vào tệp trên máy
     (bộ nhớ hay bị vậy khi hai phiên cùng sửa), rồi chạy lại script; xong thì sao lưu lên GitHub theo CLAUDE.md
     (worktree từ `origin/main`, `Backup-GenBidBot.ps1`, PR, squash merge). Chỉ dùng `-Force` (ghi đè bản máy) khi Khoa bảo.
   - **Hoãn vì lượt con đang chạy:** chờ vài phút chạy lại; Khoa bảo gấp thì `-Force` (lượt đang chạy có thể bị cắt, bot báo lỗi về web).
   - **Bot không chạy / tác vụ tắt:** hỏi Khoa trước khi `Start-ScheduledTask 'GenBid Bot'` (có thể bot đã chuyển sang máy khác:
     hai bot cùng chạy sẽ trả lời trùng yêu cầu).
   - **Sổ điều phối xung đột / có tệp `*.ban-<MÁY>.*`:** gộp tay giữ phần của cả hai máy (xem CLAUDE.md), rồi chạy
     `powershell -File "C:\Projects\GenSet Pro\genbid-hsmt\Sync-DieuPhoi.ps1"` tới khi hết lỗi.
   - **Lỗi khởi động lại:** xem log mới nhất trong `C:\Projects\GenSet Pro\genbid-bot-logs\`.
4. Kiểm: `powershell -File "C:\Projects\GenSet Pro\GenSet-Pro\bot\Backup-GenBidBot.ps1" -Check` → "Repo đã giống bản đang chạy."
5. Báo Khoa ngắn: main từ commit nào lên commit nào, tệp bot nào đổi, có khởi động lại không, còn gì phải làm.
