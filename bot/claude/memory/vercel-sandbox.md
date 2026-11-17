---
name: vercel-sandbox
description: "Bot dự phòng trong Vercel Sandbox: chạy theo nhu cầu khi máy Windows tắt; quyết định của Khoa, cách vận hành, Gemini, việc chưa thử (17/11/2026)"
metadata:
  node_type: memory
  type: project
  originSessionId: 002f765c-d667-4ca2-b611-252cd3c8bf93
  modified: 2026-11-17T15:06:08.579Z
---

Bot GenBid dự phòng chạy trong Vercel Sandbox `genbid-bot` (project genset-pro-web, sin1, image `vercel/sandbox/ubuntu`, persistent). Chi tiết kỹ thuật và bẫy: `bot/sandbox/README.md`. Mã bật/dừng: `web/api/_sandbox.js`, `_wake.js`.

**Khoa quyết (17/11/2026):**
- Chạy THEO NHU CẦU, không 24/7: web có yêu cầu mà không máy Windows nào có nhịp tim 1 phút → web tự bật sandbox (hàm Vercel, OIDC, không token). Rảnh 5 phút hoặc máy Windows bật lại (và sandbox không làm dở) → web dừng. Tắt bằng xoá biến Vercel `SANDBOX_WAKE`.
- Mốc thời gian (Khoa 17/11 tối, #876 #884): máy im 1 phút = tắt (trước 3 phút; bot ghi nhịp tim ~30 s); trang nhắc đánh thức mỗi 30 s (trước 2 phút); sandbox rảnh 5 phút thì dừng (trước 20 phút).
- Tắt / bật bot Windows: skill `/tat-bot`, `/bat-bot` (chỉ qua tác vụ "GenBid Bot", xem [[bot-ops]]).
- Mọi máy Windows ghi chung `botstatus/pc` (KHOAMINIPC, KayenGram): một máy còn bật là sandbox không thức. Máy bản bot cũ ghi tim ~1 phút → web có thể tưởng tắt và bật sandbox thừa: cập nhật bằng `/update-bot`. Sandbox rảnh 5 phút tính từ việc CUỐI (`sandboxbusy`), không từ lúc bật. Máy Windows chỉ nhận việc khi tim sandbox im 2 phút.
- KHÔNG dùng GitHub Actions cho sandbox (repo private lại từ 01/12, 2.000 phút/tháng; 17/11 Actions còn bị chặn vì thanh toán). Đã bỏ workflow `sandbox-ensure.yml`.
- Snapshot giữ 5 năm (Khoa 17/11 tối, trước 1 năm; nối lại < 1 giây; mọi thứ đã cài + đăng nhập còn nguyên). Cache OCR đối chiếu HSDT (`Downloads/GenBid-HSDT/.ocr-cache`) không bao giờ xoá, mọi máy (Khoa 17/11). Pro: snapshot $0.08/GB-tháng, không có phần miễn phí; đĩa sandbox 64 GB.
- Bot sandbox trả bằng gói tháng: biến Vercel `CLAUDE_CODE_OAUTH_TOKEN` (Khoa đặt).
- Gemini cho bản dịch: cách 2 = đăng nhập Google như máy Windows, KHÔNG dùng API key. Chép `~/.gemini/oauth_creds.json` không được (agy Windows giữ đăng nhập trong Credential Manager); Khoa đăng nhập agy MỘT LẦN trong sandbox (`vercel sandbox connect genbid-bot --project genset-pro-web --scope khoanguyenminh6868-3812`, chạy `~/.local/bin/agy`). Snapshot hết hạn / xoá sandbox thì phải đăng nhập lại.

**Why:** máy Windows tắt thì yêu cầu trên web treo; chạy 24/7 tốn tiền Vercel; Actions tốn phút / hay bị chặn.

**How to apply:**
- Thử sandbox: tạm dừng bot Windows (đừng dừng giữa lượt), chờ > 3 phút rồi Khoa bấm yêu cầu trên web; xem log qua Vercel MCP `run_session_command` (`$HOME/genset-pro/genbid-bot-logs/sandbox.out`). Đừng `stop_session` khi bot sandbox đang làm (kiểm `running` ở `/api/requests?kind=bots`).
- Sửa `bot/genbid-hsmt/*` thì bot sandbox tự lấy khi khởi động lại (up() kéo main trước khi chạy start-bot.sh); bot đang chạy giữ mã cũ.
- Đã thử thật đạt (17/11): Sync, tải HSMT qua Agent/Wine, đăng tệp, Phân tích, dịch, OCR, .doc, Gợi ý cấu hình, Gợi ý giá, Đối chiếu HSDT/TLKT, Tạo HSDT, nút Lấy tệp bấm trực tiếp (Khoa báo), nhường việc khi máy Windows bật lại, tự dừng. Dịch qua Gemini (agy) đã đạt 17/11 14:39 (IB2600612866, gemini-3.8-flash-medium, 53 s). Còn Tìm thông số NCC: chờ Khoa đặt `FIRECRAWL_KEY` trên Vercel.
- Sổ tiền API chung (17/11): mỗi máy vẫn sổ riêng; web cộng qua `botstatus/api-<máy>` và trả `apiOthers` (`.genbid-api-others.json`). Chi tiết `bot/sandbox/README.md`.
- Không ghi trạng thái tạm (bot máy nào đang bật / tắt) vào sổ điều phối hay bộ nhớ (Khoa 17/11).
- Claude không được đặt / xoá token: Khoa tự làm. Khoa 17/11 tối: KHÔNG cần xoá 7 secret GitHub / biến `GEMINI_OAUTH_CREDS` hay thu hồi token Vercel / PAT, không cần cập nhật + Repair KayenGram, không bấm lại Gợi ý IB2600612866, giữ mốc nhường 2 phút: đừng nhắc lại.

Liên quan: [[bot-ops]], [[git-workflow]], [[repo-public-khong-hoi]].
