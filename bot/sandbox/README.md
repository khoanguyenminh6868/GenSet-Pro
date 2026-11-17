# Bot GenBid dự phòng trong Vercel Sandbox

Trạng thái 2026-11-17: **đã thử từng phần, chưa chạy thật với token** (chưa bật).

**Theo nhu cầu** (Khoa 17/11/2026): sandbox chỉ chạy khi web có yêu cầu mà không máy Windows nào mở.

1. Người dùng bấm nút trên web (Phân tích, Lấy tệp, Sync...) → `web/api/webreq.js` lưu yêu cầu, rồi `web/api/_wake.js`:
   nếu `botstatus/current` im ≥ 3 phút (trang báo "Agent chưa nhận yêu cầu") thì chạy workflow `sandbox-ensure.yml`
   (tối đa 1 lần / 5 phút, mốc ở `botstatus/wake`).
2. `ensure.mjs` (`run`) đọc `/api/requests?kind=bots` rồi quyết (`decide`):
   - sandbox tắt + có yêu cầu chờ + máy Windows im ≥ 3 phút → nối lại / tạo sandbox, chạy `start-bot.sh` (bot gửi `host=sandbox`);
   - sandbox chạy + máy Windows bật lại (và sandbox không làm dở việc) → dừng;
   - sandbox chạy + không yêu cầu chờ + rảnh ≥ 20 phút (`botstatus/sandboxbusy`) → dừng;
   - còn lại: giữ (gia hạn phiên). Dừng thì giữ snapshot: lần sau nối lại ~vài chục giây, không cài lại.
3. Cron 5 phút của workflow là lưới an toàn (GitHub hay trễ cron) và lo việc dừng.
4. Không làm trùng: khi sandbox còn tim < 2 phút, máy Windows hỏi việc nhận danh sách rỗng (`yieldTo: "sandbox"`), chỉ khi
   đã đặt `GH_DISPATCH_TOKEN` (chưa bật thì không đọc thêm gì).

Thời gian chờ khi máy tắt: workflow xếp hàng ~20–60 s + `npm ci` + nối lại sandbox + bot lên ≈ 2–4 phút (lần đầu có cài đặt ~20 phút).

Tệp:
- `setup-sandbox.sh`: dựng sandbox (Wine + VNeGP Agent bản Windows, Chrome, pwsh, Claude CLI, Tesseract, tessdata, repo). ~2 phút.
- `start-bot.sh`: khởi chạy vòng quét `GenBid-Bot.ps1` (`-Endpoint ...&host=sandbox`); bí mật qua biến môi trường, ghi tệp token quyền 600.
- `ensure.mjs` + `.github/workflows/sandbox-ensure.yml`: bật / giữ / dừng như trên (sin1, persistent).
- `GENBID_OS=windows|linux` ép hệ điều hành cho script bot (test dùng `windows`).

## Bật (Khoa làm, em không đọc token)
Đã đặt (17/11): `GENBID_INGEST_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT_ID`. Phần token còn lại: Khoa chạy
`powershell -File bot\sandbox\Set-SandboxSecrets.ps1` (đọc token từ tệp trên máy, hỏi VERCEL_TOKEN và một PAT GitHub, đặt luôn
`GH_DISPATCH_TOKEN` trên Vercel bằng Vercel CLI), rồi Claude làm bước 2 và redeploy web.
1. Secrets repo GitHub: `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT_ID`, `GENBID_INGEST_TOKEN`, `CLAUDE_CODE_OAUTH_TOKEN` và/hoặc
   `ANTHROPIC_API_KEY`, `GH_BOT_TOKEN` (PAT fine-grained chỉ repo này, contents + releases), tuỳ chọn `FIRECRAWL_KEY`.
2. Biến repo `GENBID_SANDBOX_ENABLED=true`, chạy workflow bằng tay một lần (lần đầu cài đặt ~20 phút; sau đó sandbox tự dừng khi rảnh).
3. Vercel (project genset-pro-web, Production): biến `GH_DISPATCH_TOKEN` = PAT fine-grained chỉ repo này, quyền **Actions: Read and write**.
   Redeploy để có hiệu lực. Thiếu biến này thì vẫn chạy được nhưng chỉ nhờ cron (trễ 5–20 phút).
Tác vụ Windows "GenBid Bot" giữ nguyên.

## Đã kiểm
Agent dưới Wine tải HSMT khớp MD5; Chrome 157 + playwright-core 1.45.3 tìm kiếm muasamcong từ IP sin1 không CAPTCHA;
OCR; Pester 174/174 trên Linux, 175/175 trên Windows; Node: `ensure.mjs` 13 test (sandbox giả, decide/run);
web: `web/api/test/wake.test.mjs` (gọi workflow, nhịp tim pc/sandbox, nhường việc, `kind=bots`).

## Chưa kiểm
Chạy thật với token (Sync, Lấy tệp, lượt AI, gh push); `ensure.mjs` với SDK thật (`status`, `stop()` của sandbox persistent);
reCAPTCHA khi tần suất cao; .doc (antiword/catdoc có thể không có trên Ubuntu 26.04); Wine không được Bộ Tài chính hỗ trợ
(kiểm lại sau mỗi lần Agent cập nhật). Việc theo lịch của máy Windows (Sync định kỳ...) không chạy khi máy tắt: sandbox chỉ lo yêu cầu từ web.
Chi phí Pro tính theo CPU hoạt động + bộ nhớ lúc sandbox chạy (giờ chỉ chạy khi có việc).
