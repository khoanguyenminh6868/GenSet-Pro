# GenSet-Pro

- Bot Windows chạy từ `C:\Projects\GenSet Pro\genbid-hsmt\` (ngoài git); bản trong git là `bot/` (Khoa, 2026-11-04: máy hư thì clone về chạy tiếp).
  **Mọi thay đổi bot phải lên GitHub ngay trong cùng phiên**: sửa tệp trong `genbid-hsmt\`, skills `~\.claude\skills\run-hsmt-worker`,
  `~\.claude\scheduled-tasks\hsmt-worker`, hay thêm tác vụ Windows/phần mềm mới cho bot → trong worktree từ `origin/main` chạy
  `powershell -File bot\Backup-GenBidBot.ps1`, commit `bot/`, push, PR, squash merge. Tác vụ Windows hay bước cài mới thì sửa
  `bot/Install-GenBidBot.ps1` và `bot/SETUP-CLAUDE.md`. Stop hook `genbid-hsmt\Test-GenBidBotGit.ps1` chặn kết thúc lượt khi còn khác.
- Test bot Node ở `bot/test/*.test.mjs` (CI `test-bot.yml`), KHÔNG đặt thư mục con trong `bot/genbid-hsmt/`: Stop hook so
  `git ls-tree -r` (đệ quy) với danh sách tệp không đệ quy của `genbid-hsmt\` nên tệp trong thư mục con bị báo "deleted on
  this PC" mãi. Hàm thuần của `genbid-sync.js` nằm ở `sync-pure.js` (require lại): sửa / chép sang `genbid-hsmt\` cả hai cùng lúc.
- Không đưa token (`.genbid-ingest-token`, `.claude-bot-token`, `.firecrawl-key`) hay tệp trạng thái `.genbid-*.json` vào git.
- Khoa nói "setup bot trên máy khác" → làm theo `bot/SETUP-CLAUDE.md`.
- Quy tắc và bẫy theo thư mục: `web/CLAUDE.md`, `suppliers/CLAUDE.md` (tự nạp khi làm việc trong thư mục đó). Bẫy mới phát hiện thì ghi vào đó, không ghi vào bộ nhớ.
- Sửa mã bằng Edit/Write, không dùng heredoc bash hay `node -e` (hỏng dấu gạch chéo ngược, xuống dòng). Git Bash đổi đối số bắt đầu bằng hai dấu gạch chéo thành một.
- Checkout chính `C:\Projects\GenSet Pro\GenSet-Pro` là thư mục bot đang chạy: luôn để `main`, sửa code trong worktree `wt-*` từ `origin/main`.
