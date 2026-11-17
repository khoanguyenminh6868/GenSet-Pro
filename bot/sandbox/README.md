# Bot GenBid dự phòng trong Vercel Sandbox

**Theo nhu cầu** (Khoa 17/11/2026): sandbox chỉ chạy khi web có yêu cầu mà không máy Windows nào mở. Toàn bộ việc bật /
dừng chạy trong hàm Vercel (`web/api/_sandbox.js`), xác thực Sandbox bằng OIDC của project: không cần token Vercel,
không dùng GitHub Actions (repo private: Actions bị chặn / tính phút).

1. Người dùng bấm nút trên web (Phân tích, Lấy tệp, Sync...) → `web/api/webreq.js` lưu yêu cầu, rồi `web/api/_wake.js`:
   `botstatus/current` im ≥ 1 phút (Khoa 17/11, trước là 3 phút; bot ghi tim ~30 giây một lần) (trang báo "Agent chưa nhận yêu cầu") → `up()` chạy nền sau khi trả lời
   (tối đa 1 lần / 5 phút, mốc `botstatus/wake`): nối lại / tạo sandbox `genbid-bot` (sin1, persistent, phiên 60 phút;
   Hobby 45), lần đầu chạy `setup-sandbox.sh`, rồi `start-bot.sh` bằng lệnh detached.
2. Bot sandbox hỏi việc với `host=sandbox`. Mỗi nhịp tim (~1 phút) `web/api/requests.js` gọi `tick()` (`decide`):
   - máy Windows có tim < 1 phút và sandbox không làm dở việc → dừng;
   - không yêu cầu chờ, rảnh ≥ 5 phút (Khoa 17/11, trước 20 phút) (`botstatus/sandboxbusy`) → dừng;
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

## Đã kiểm (chạy thật 17/11/2026)
OIDC của project + SDK thật; nối lại từ snapshot < 1 s (snapshot ~2,8 GB); Sync; tải HSMT qua Agent dưới Wine; đăng tệp
(Release + `hsmt-inbox` + ghi thẳng web, `GITHUB_TOKEN` của Vercel đủ quyền); Phân tích; dịch (Claude; Gemini qua `agy` gọi thử);
OCR tesseract vie (~3 s/trang); .doc qua antiword; Gợi ý cấu hình (11 phút); máy Windows bật lại giữa lúc sandbox làm dở → máy
nhường, sandbox làm xong rồi dừng sau 44 s; rảnh 20 phút → dừng (nay 5 phút); gia hạn phiên khi còn việc.
Test: `web/api/test/wake.test.mjs` (sandbox giả).

Khoa thử thêm (17/11): Gợi ý giá, Đối chiếu HSDT / TLKT, Tạo HSDT tham khảo, nút Lấy tệp bấm trực tiếp, bản dịch thật qua Gemini.

## Chưa kiểm
Tìm thông số NCC (cần biến `FIRECRAWL_KEY` trên Vercel: Settings → Environment Variables, Production, rồi redeploy; sandbox
đang chạy lấy biến mới ở lần bật sau); reCAPTCHA khi tần suất cao; Wine không được Bộ Tài chính hỗ trợ.
Việc theo lịch của máy Windows (Sync định kỳ...) không chạy khi máy tắt: sandbox chỉ lo yêu cầu từ web.

## Sổ tiền API chung
Mỗi máy (máy Windows, sandbox) vẫn ghi sổ riêng `.anthropic-api-spend.jsonl`. Nhịp tim gửi phần riêng (`own`, tên máy, lần sửa
tay `fixAt`); web ghi `botstatus/api-<máy>` (sandbox: `api-sandbox`) và trả `apiOthers` = tổng các máy khác cùng kỳ, cùng lần sửa
tay; bot lưu vào `.genbid-api-others.json` và cộng vào ngưỡng chuyển gói (Get-ApiBudget, apiBudgetOf). Bot bản cũ không gửi
`own` thì không được cộng.

## Bẫy đã gặp (17/11/2026)
- Image mặc định (`runtime: node22`) không có apt; image `vercel/sandbox/ubuntu` tối giản: không curl, git, node → `up()` cài
  curl/git trước, `setup-sandbox.sh` tự tải Node 22. Lỗi cài nằm ở `$HOME/setup.log` (HOME = `/vercel`).
- `start-bot.sh` tự `git merge` nhưng bash đã đọc bản cũ trong snapshot → bước mới chỉ chạy từ lần khởi động sau. `up()` kéo
  main TRƯỚC khi chạy script.
- Script PowerShell của bot trên Linux: đường dẫn ghép bằng `"$a\$b"` đưa cho .NET (`[IO.File]`) thì `\` thành ký tự tên tệp
  (tài liệu không gửi lên web mà vẫn báo đã ghi). Dùng `[IO.Path]::Combine`. `Join-Path` với ổ `C:` lỗi trên Linux khi test ép
  `GENBID_OS=windows`. Đừng ghi cứng `C:\Projects\GenSet Pro`: dùng `GENBID_ROOT`.
- Yêu cầu gửi lúc máy vừa tắt (< 1 phút) thấy "bot còn chạy" nên không bật sandbox → trang tự nhắc (`coll: wake`) mỗi 30 giây (Khoa 17/11, trước là 2 phút) khi
  cảnh báo máy tắt đang hiện; server chỉ bật khi có yêu cầu chờ.
- Đừng dừng sandbox (`stop_session`) khi bot đang làm (`running` ở `/api/requests?kind=bots`): việc dở bị cắt.
- `agy` không đọc `~/.gemini/oauth_creds.json` (của Gemini CLI cũ); trên Windows nó giữ đăng nhập trong Credential Manager. Trên
  Linux lưu tệp ở `~/.config/antigravity` → đăng nhập một lần trong sandbox (mục Bật).
