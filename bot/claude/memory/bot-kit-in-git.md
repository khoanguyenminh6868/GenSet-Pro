---
name: bot-kit-in-git
description: Bot Windows phải luôn có bản trong git (bot/ trên main) — sửa genbid-hsmt/skills xong chạy Backup-GenBidBot.ps1 rồi PR
metadata:
  type: feedback
---

Khoa (2026-11-04): mọi logic của bot trên máy phải nằm trên GitHub, máy hư thì clone về chạy tiếp. PR #287 tạo `bot/` trên main: `bot/genbid-hsmt/` (bản sao kit đang chạy ở `C:\Projects\GenSet Pro\genbid-hsmt\`), `bot/claude/` (skills run-hsmt-worker, scheduled-task hsmt-worker, /hsmt), `bot/windows-tasks/`, `Install-GenBidBot.ps1` (cài lại máy mới), `Backup-GenBidBot.ps1` (chép máy → repo; `-Check` exit 1 nếu khác). Bot vẫn chạy từ genbid-hsmt/, không chạy từ repo. `hsmt-inbox/worker-kit` là bản cũ, bỏ.

Thêm 04/11 (PR sau #287): Stop hook `genbid-hsmtTest-GenBidBotGit.ps1` trong ~/.claude/settings.json chặn kết thúc lượt khi bot trên máy khác bot/ trên origin/main; repo có CLAUDE.md (quy tắc) và `bot/SETUP-CLAUDE.md` (sổ tay "setup bot trên máy khác": câu hỏi cho Khoa, cài, kiểm); skill `genbid-setup` (bot/claude/skills, Khoa tải lên claude.ai để theo tài khoản sang máy mới); Backup chép cả bộ nhớ này vào bot/claude/memory, Install chép lại khi máy mới chưa có.

**Why:** trước 04/11 kit chỉ nằm ngoài git; bản worker-kit trên nhánh hsmt-inbox đã chậm từ 01/11.
**How to apply:** Khoa nói "setup bot trên máy khác" → làm theo bot/SETUP-CLAUDE.md. Mỗi lần sửa tệp trong genbid-hsmt/ (hoặc skills/tác vụ Windows mới của bot), cuối việc chạy `powershell -File bot\Backup-GenBidBot.ps1` trong một worktree từ origin/main rồi commit + PR (tự merge theo [[merge-prs-without-asking]]). Tác vụ Windows mới cho bot thì thêm vào Install-GenBidBot.ps1. Không đưa token (.genbid-ingest-token, .claude-bot-token, .firecrawl-key) hay tệp .genbid-*.json vào git. Xem [[session-log]], [[bot-restart-after-update]].
