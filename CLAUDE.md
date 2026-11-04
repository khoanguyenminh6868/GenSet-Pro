# GenSet-Pro

- Bot Windows chạy từ `C:\Projects\GenSet Pro\genbid-hsmt\` (ngoài git); bản trong git là `bot/` (Khoa, 2026-11-04: máy hư thì clone về chạy tiếp).
  **Mọi thay đổi bot phải lên GitHub ngay trong cùng phiên**: sửa tệp trong `genbid-hsmt\`, skills `~\.claude\skills\run-hsmt-worker`,
  `~\.claude\scheduled-tasks\hsmt-worker`, hay thêm tác vụ Windows/phần mềm mới cho bot → trong worktree từ `origin/main` chạy
  `powershell -File bot\Backup-GenBidBot.ps1`, commit `bot/`, push, PR, squash merge. Tác vụ Windows hay bước cài mới thì sửa
  `bot/Install-GenBidBot.ps1` và `bot/SETUP-CLAUDE.md`. Stop hook `genbid-hsmt\Test-GenBidBotGit.ps1` chặn kết thúc lượt khi còn khác.
- Không đưa token (`.genbid-ingest-token`, `.claude-bot-token`, `.firecrawl-key`) hay tệp trạng thái `.genbid-*.json` vào git.
- Khoa nói "setup bot trên máy khác" → làm theo `bot/SETUP-CLAUDE.md`.
