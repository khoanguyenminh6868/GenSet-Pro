# Bot GenBid trên Windows

Thư mục này giữ **toàn bộ logic** của bot chạy trên máy Khoa, để máy hư thì clone về máy khác chạy tiếp (Khoa, 2026-11-04).
Bản đang chạy vẫn ở `C:\Projects\GenSet Pro\genbid-hsmt\`; sửa ở đó xong thì chạy `Backup-GenBidBot.ps1` và commit `bot\`.

| Trong repo | Trên máy |
|---|---|
| `bot/genbid-hsmt/` | `C:\Projects\GenSet Pro\genbid-hsmt\` (GenBid-Bot.ps1, genbid-sync.js, ocr-pdf.js, prompt, script PowerShell) |
| `bot/genbid-hsmt/hsmt-worker.md` | cũng chép thành `C:\Projects\GenSet Pro\.hsmt-worker.md` |
| `bot/claude/skills/run-hsmt-worker/` | `%USERPROFILE%\.claude\skills\run-hsmt-worker\` |
| `bot/claude/scheduled-tasks/hsmt-worker/` | `%USERPROFILE%\.claude\scheduled-tasks\hsmt-worker\` (tác vụ Claude Desktop, chạy tay) |
| `bot/claude/skills/hsmt/SKILL.md` | skill `/hsmt` tải lên claude.ai (Settings > Skills) |
| `bot/windows-tasks/GenBid Bot.xml` | tác vụ Windows "GenBid Bot" (bản xuất để tham khảo; Install tạo lại cho user hiện tại) |
| `suppliers/config-bot.mjs`, `bidprice-bot.mjs`, `discover.mjs`… | đã ở repo; bot chạy chúng từ `C:\Projects\GenSet Pro\GenSet-Pro` (tự `git merge --ff-only origin/main`) |
| nhánh `hsmt-inbox` (ingest.py, Action) | `C:\Projects\GenSet Pro\hsmt-inbox\` |

`hsmt-inbox/worker-kit/` trên nhánh hsmt-inbox là bản cũ (01/11), không dùng nữa.

## Cài lại trên máy mới

1. Cài Git rồi clone: `git clone https://github.com/khoanguyenminh6868/GenSet-Pro.git "C:\Projects\GenSet Pro\GenSet-Pro"`
2. Chạy: `powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Projects\GenSet Pro\GenSet-Pro\bot\Install-GenBidBot.ps1"`
   Script chép kit, `npm ci`, tải Chromium và tessdata_best, clone nhánh hsmt-inbox, chép skills, tạo tác vụ "GenBid Bot", rồi in danh sách còn thiếu. Làm tay phần còn thiếu rồi chạy lại.
3. Phần không thể có trong git (tự tạo lại):
   - `C:\Projects\GenSet Pro\.genbid-ingest-token`: biến `INGEST_TOKEN` của project Vercel genset-pro-web.
   - `C:\Projects\GenSet Pro\.claude-bot-token`: `claude setup-token` (hoặc đăng nhập `claude`).
   - `C:\Projects\GenSet Pro\genbid-hsmt\.firecrawl-key`: khoá Firecrawl (Tìm NCC).
   - `gh auth login` (Publish tải tệp HSMT lên GitHub Releases), `git config user.name/user.email` trong hai bản clone.
   - VNeGP Client Agent ở `C:\MPI\EGP-AGENT`, Tesseract 5 (UB-Mannheim), Poppler, WinRAR, Microsoft Word (.doc), Antigravity `agy` (tuỳ chọn).
   - Windows user khác `Khoa`: các đường dẫn cứng là `C:\Projects\GenSet Pro\…` (giữ nguyên thư mục này); Downloads lấy theo user.
4. Chạy thử: `cd "C:\Projects\GenSet Pro"; node genbid-hsmt\genbid-sync.js sync --force` (dòng cuối `SUMMARY:`), rồi `Start-ScheduledTask "GenBid Bot"` và xem `genbid-bot-logs\`.

## Mất gì khi máy hư (không phải logic, bot tự làm lại được)

- Tệp trạng thái `C:\Projects\GenSet Pro\.genbid-*.json`, `.hsmt-worker-state.json`: nhớ gói nào đã đọc/tải. Mất thì bot đọc lại (specs ~100 gói/giờ, tốn lượt Claude); dữ liệu thật nằm trên Supabase (web).
- `Downloads\GenBid-HSMT\`, `genbid-work\`: tệp HSMT đã tải (có trên GitHub Releases `hsmt-<TBMT>`) và bản chữ/OCR tạm.
- Hồ sơ Chrome của bot `.genbid-browser*`, nhật ký `genbid-bot-logs\`.
- Script một lần trong `genbid-work\` (specs-requeue.js, specs-reread.ps1…) và tác vụ "GenBid specs pause/resume" đã chạy xong, không cần.
