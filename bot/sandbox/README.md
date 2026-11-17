# Bot GenBid dự phòng trong Vercel Sandbox

**Theo nhu cầu** (Khoa 17/11/2026): sandbox chỉ chạy khi web có yêu cầu mà không máy Windows nào mở. Toàn bộ việc bật /
dừng chạy trong hàm Vercel (`web/api/_sandbox.js`), xác thực Sandbox bằng OIDC của project: không cần token Vercel,
không dùng GitHub Actions (repo private: Actions bị chặn / tính phút).

1. Người dùng bấm nút trên web (Phân tích, Lấy tệp, Sync...) → `web/api/webreq.js` lưu yêu cầu, rồi `web/api/_wake.js`:
   `botstatus/current` im ≥ 3 phút (trang báo "Agent chưa nhận yêu cầu") → `up()` chạy nền sau khi trả lời
   (tối đa 1 lần / 5 phút, mốc `botstatus/wake`): nối lại / tạo sandbox `genbid-bot` (sin1, persistent, phiên 60 phút;
   Hobby 45), lần đầu chạy `setup-sandbox.sh`, rồi `start-bot.sh` bằng lệnh detached.
2. Bot sandbox hỏi việc với `host=sandbox`. Mỗi nhịp tim (~1 phút) `web/api/requests.js` gọi `tick()` (`decide`):
   - máy Windows có tim < 3 phút và sandbox không làm dở việc → dừng;
   - không yêu cầu chờ, rảnh ≥ 20 phút (`botstatus/sandboxbusy`) → dừng;
   - còn lại: phiên còn < 20 phút thì gia hạn 60 phút. Dừng thì giữ snapshot: lần sau nối lại nhanh, không cài lại.
3. Bot treo không gửi tim: phiên tự hết (≤ 60 phút).
4. Không làm trùng: sandbox còn tim < 2 phút thì máy Windows hỏi việc nhận danh sách rỗng (`yieldTo: "sandbox"`).
   Chỉ khi `SANDBOX_WAKE=1` (chưa bật thì không đọc thêm gì).

Tệp: `setup-sandbox.sh` (Wine + VNeGP Agent bản Windows, Chrome, pwsh, Claude CLI, Tesseract, repo), `start-bot.sh`
(`GenBid-Bot.ps1 -Endpoint ...&host=sandbox`; bí mật qua env, ghi tệp quyền 600 rồi bỏ biến). `GENBID_OS=windows|linux`
ép hệ điều hành cho script bot (test dùng `windows`).

## Bật
- Biến Vercel (genset-pro-web, Production) `SANDBOX_WAKE=1`. Bí mật bot lấy từ biến có sẵn: `INGEST_TOKEN`,
  `ANTHROPIC_API_KEY`, `GITHUB_TOKEN` (hoặc `GH_BOT_TOKEN` nếu đặt). Thêm `CLAUDE_CODE_OAUTH_TOKEN` (gói tháng) và
  `FIRECRAWL_KEY` trên Vercel nếu muốn bot sandbox dùng (Khoa đặt; Claude không đặt token).
- Gemini cho bản dịch (Khoa 17/11): `start-bot.sh` cài `agy` nếu chưa có. Đăng nhập Google MỘT LẦN trong sandbox (đang chạy):
  `vercel sandbox connect genbid-bot --project genset-pro-web --scope khoanguyenminh6868-3812`, chạy `~/.local/bin/agy`, mở link
  đăng nhập, xong thì thoát. Lưu ở `~/.config/antigravity` (tệp, không keyring), giữ qua snapshot. Chép `~/.gemini/oauth_creds.json`
  của máy Windows KHÔNG dùng được (agy trên Windows giữ đăng nhập trong Credential Manager). Chưa đăng nhập / lỗi: dịch bằng Claude.
  Snapshot hết hạn (1 năm không dùng) hoặc xoá sandbox thì phải đăng nhập lại.
- Tắt: xoá `SANDBOX_WAKE` (hoặc đặt khác 1), redeploy. Tác vụ Windows "GenBid Bot" giữ nguyên.

## Đã kiểm
Agent dưới Wine tải HSMT khớp MD5; Chrome 157 + playwright-core 1.45.3 tìm kiếm muasamcong từ IP sin1 không CAPTCHA;
OCR; Pester trên Linux / Windows; web: `web/api/test/wake.test.mjs` (sandbox giả: bật, cài lần đầu, dừng, gia hạn, nhường việc).

## Chưa kiểm
Chạy thật (OIDC của project, SDK thật, Sync / Lấy tệp / lượt AI / gh push từ sandbox); `GITHUB_TOKEN` của Vercel có đủ quyền
ghi Release + nhánh `hsmt-inbox` không; reCAPTCHA khi tần suất cao; .doc trên Ubuntu; Wine không được Bộ Tài chính hỗ trợ.
Việc theo lịch của máy Windows (Sync định kỳ...) không chạy khi máy tắt: sandbox chỉ lo yêu cầu từ web.
