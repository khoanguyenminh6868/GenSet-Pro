# Bot GenBid trong Vercel Sandbox

Trạng thái 2026-11-17: **đã thử từng phần, chưa chạy thật với token** (chưa bật).

- `setup-sandbox.sh`: dựng sandbox (Wine + VNeGP Agent bản Windows, Chrome, pwsh, Claude CLI, Tesseract, tessdata, repo). ~2 phút.
- `start-bot.sh`: khởi chạy vòng quét `GenBid-Bot.ps1`; bí mật qua biến môi trường, ghi tệp token quyền 600.
- `ensure.mjs` + `.github/workflows/sandbox-ensure.yml`: giữ bot sống (tạo/nối lại sandbox `genbid-bot`, sin1, persistent). Workflow **tắt** cho tới khi đặt biến repo `GENBID_SANDBOX_ENABLED=true`.
- `GENBID_OS=windows|linux` ép hệ điều hành cho script bot (test dùng `windows`).

## Bật (Khoa làm, em không đọc token)
1. Secrets repo: `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT_ID`, `GENBID_INGEST_TOKEN`, `CLAUDE_CODE_OAUTH_TOKEN` và/hoặc `ANTHROPIC_API_KEY`, `GH_BOT_TOKEN` (PAT fine-grained chỉ repo này, contents + releases), tuỳ chọn `FIRECRAWL_KEY`.
2. Tắt tác vụ Windows "GenBid Bot" (hai bot chạy song song sẽ trả lời trùng).
3. Đặt biến `GENBID_SANDBOX_ENABLED=true`, chạy workflow bằng tay một lần.

## Đã kiểm
Agent dưới Wine tải HSMT khớp MD5; Chrome 157 + playwright-core 1.45.3 tìm kiếm muasamcong từ IP sin1 không CAPTCHA;
OCR; Pester 174/174 trên Linux, 175/175 trên Windows; Node 120/120; `ensure.mjs` 9 test (sandbox giả).

## Chưa kiểm
Chạy thật với token (Sync, Lấy tệp, lượt AI, gh push); `ensure.mjs` với SDK thật; reCAPTCHA khi tần suất cao;
.doc (antiword/catdoc có thể không có trên Ubuntu 26.04); Wine không được Bộ Tài chính hỗ trợ (kiểm lại sau mỗi lần Agent cập nhật).
Chi phí Pro tính theo CPU hoạt động + bộ nhớ 24/7.
