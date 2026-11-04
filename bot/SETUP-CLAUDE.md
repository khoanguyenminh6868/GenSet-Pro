# Sổ tay cho Claude: "setup bot trên máy khác"

Khi Khoa nói "setup bot trên máy khác / máy mới", "cài lại bot", "máy cũ hư", làm theo đúng thứ tự này.
Mục tiêu: máy mới chạy được GenBid Bot (Sync theo lịch, Lấy tệp, Phân tích, Gợi ý cấu hình, Tìm NCC, giá đấu) như máy cũ.

## 0. Hỏi Khoa trước (một lần, gộp chung bằng AskUserQuestion)

1. **Máy cũ còn chạy bot không?** Hai bot cùng chạy sẽ trả lời trùng yêu cầu web, Sync hai lần. Nếu còn: trên máy cũ
   `Disable-ScheduledTask 'GenBid Bot'; Stop-ScheduledTask 'GenBid Bot'` (Khoa làm, hoặc em làm nếu đang ở máy cũ) trước khi bật máy mới.
2. **Đặt ở `C:\Projects\GenSet Pro` được không?** Đường dẫn này cứng trong script (genbid-sync.js, ocr-pdf.js, discover.mjs). Khác thì phải sửa code trước.
3. **Còn lấy được ổ đĩa máy cũ không?** Nếu có: chép sang máy mới `C:\Projects\GenSet Pro\.genbid-*.json`, `.hsmt-worker-state.json`,
   `genbid-work\specs\`, token (`.genbid-ingest-token`, `.claude-bot-token`, `genbid-hsmt\.firecrawl-key`) → bot khỏi đọc lại ~1.500 gói specs.
   Không có thì bot tự đọc lại (tốn lượt Claude, vài giờ).
4. **Token**: Khoa có sẵn bản sao các token trên không? Nếu không: ingest = biến `INGEST_TOKEN` của project Vercel genset-pro-web
   (Khoa lấy trên dashboard, hoặc bảo em đọc qua Vercel MCP), Claude = `claude setup-token`, Firecrawl = dashboard firecrawl.dev.
5. **Bật bot ngay sau khi cài, hay chờ Khoa kiểm?**

Không bao giờ tự gõ mật khẩu hay token vào ô đăng nhập; tệp token thì Khoa tự tạo (hoặc Khoa dán token trong chat và bảo em ghi tệp).

## 1. Phần mềm (Khoa cài, em kiểm bằng lệnh)

`winget install Git.Git GitHub.cli OpenJS.NodeJS.LTS` · `winget install --id oschwartz10612.Poppler -e --scope user` ·
`winget install UB-Mannheim.TesseractOCR --scope user` · WinRAR · Microsoft Word (đọc .doc) · Claude Code CLI
(`irm https://claude.ai/install.ps1 | iex`) · VNeGP Client Agent bản chính thức vào `C:\MPI\EGP-AGENT` (cổng 1234, tải từ muasamcong) ·
tuỳ chọn Antigravity `agy` (dịch Gemini). Sau đó Khoa chạy `gh auth login` và `claude` (đăng nhập).

## 2. Clone và cài

```
git clone https://github.com/khoanguyenminh6868/GenSet-Pro.git "C:\Projects\GenSet Pro\GenSet-Pro"
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Projects\GenSet Pro\GenSet-Pro\bot\Install-GenBidBot.ps1"
```
Install chép kit vào `genbid-hsmt\`, `npm ci`, Chromium, tessdata_best, clone nhánh `hsmt-inbox`, skills Claude, bộ nhớ Claude
(`bot/claude/memory` → `~\.claude\projects\C--Projects-GenSet-Pro\memory`, chỉ khi trống), `CLAUDE.md` gốc, Stop hook kiểm GitHub,
tác vụ Windows "GenBid Bot". Nó in danh sách còn thiếu: xử lý từng dòng, chạy lại tới khi hết.
Thêm `git config user.name/user.email` trong `GenSet-Pro` và `hsmt-inbox` (hỏi Khoa nếu chưa biết, mặc định như máy cũ: Khoa).

## 3. Việc tay còn lại

- Skill `/hsmt`: Khoa tải `bot\claude\skills\hsmt\SKILL.md` lên claude.ai Settings > Skills (skills claude.ai tự đồng bộ sang máy mới, có thể đã có).
- Tác vụ Claude Desktop "hsmt-worker" (chạy tay): tạo trong app Claude Desktop > Scheduled, prompt = `bot\genbid-hsmt\TASK.md`, lịch Manual.
- Lần đầu Chrome của bot chưa có phiên muasamcong: chạy thử Sync (bước 4) và để Khoa xem cửa sổ Chromium; reCAPTCHA thì Khoa tự xử lý, em không vượt.

## 4. Kiểm

1. `cd "C:\Projects\GenSet Pro"; node genbid-hsmt\genbid-sync.js sync --force` → dòng cuối `SUMMARY:` không có lỗi.
2. `node genbid-hsmt\genbid-sync.js text --file <một PDF scan>` → ra chữ tiếng Việt (OCR chạy).
3. `Start-ScheduledTask 'GenBid Bot'`, xem `genbid-bot-logs\` mới nhất: không có "Thiếu .genbid-ingest-token"/"Thiếu .claude-bot-token"/"Chưa có repo".
4. Bấm một yêu cầu nhỏ trên web (ví dụ Lấy tệp một gói) và thấy bot làm.
5. `powershell -File GenSet-Pro\bot\Backup-GenBidBot.ps1 -Check` → "Repo đã giống bản đang chạy."

Báo Khoa: đã chạy được gì, còn thiếu gì, máy cũ đã tắt bot chưa.
