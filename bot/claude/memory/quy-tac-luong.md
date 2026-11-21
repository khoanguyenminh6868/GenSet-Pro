---
name: quy-tac-luong
description: "Quyết định của Khoa cho từng luồng GenBid (Sync, chuỗi tự động, specs, phân tích, nhà thầu, NCC trên web) và vì sao Thảo Nguyên từng bị loại kỹ thuật"
metadata:
  node_type: memory
  type: project
  originSessionId: 712171b8-1398-4e8a-b507-1e2692a83bce
  modified: 2026-11-21T05:52:25.892Z
---

Chỉ ghi quyết định của Khoa và hiểu biết nghiệp vụ. Bẫy code ghi ở `web/CLAUDE.md`, `suppliers/CLAUDE.md` trong repo; việc còn dở ghi ở sổ điều phối ([[orchestrator-delegate-by-model]]). Không có tệp nhật ký gom.

- **Sync:** 10:10, 14:10, 18:10 giờ VN, thứ Hai–thứ Sáu; thứ Bảy, Chủ nhật KHÔNG Sync theo lịch, cả máy Windows lẫn sandbox (Khoa 18/11/2026; trước đó chạy cả tuần). Mọi máy Windows tắt thì Vercel Cron đánh thức sandbox để Sync ([[vercel-sandbox]]). Chỉ tìm gói "máy phát điện" chưa đóng. Sync KHÔNG cào lịch sử, KHÔNG chạy specs — `genbid-sync.js history` / `history-config` / `specs` chỉ chạy tay.
- **Chuỗi tự động sau Sync:** gói MỚI → tải tệp → Phân tích → Gợi ý cấu hình → Giá gợi ý. Bấm Phân tích tay giữa chừng thì chuỗi dừng. Gói dịch vụ (bảo dưỡng, sửa chữa, thuê, di dời, vật tư…) không tự Gợi ý cấu hình (12/11/2026).
- **Gói lịch sử và gói hiện tại là MỘT khái niệm** (web gộp theo key; bot vẫn 3 nơi lưu, chưa gộp).
- **Nhà thầu gói Đã đóng** (04/11/2026): lấy biên bản mở thầu/kết quả cho mọi gói Đã đóng và Bỏ qua, trừ Đã hủy, Không trúng, dự án. Thấy công ty mình ([[company-thao-nguyen]]) thì gói tự sang Đã nộp / Trúng / Không trúng.
- **specs** (đọc Chương V mọi gói chưa có phân tích, 03–04/11/2026): có Chương V webform đủ nội dung → không OCR tệp scan; có tệp Chương V/YCKT riêng → không tải E-HSMT cả bộ; tệp trùng MD5 đọc 1 bản; không có tài liệu kỹ thuật → bảng "Danh mục hàng hóa". Không giới hạn dung lượng/số trang. Không nhận ra tệp YCKT / Chương V riêng thì tải tối đa 4 tệp không phải quyết định phê duyệt (điều phối duyệt thay, Khoa xác nhận 17/11/2026). Dừng gọn: tạo `genbid-work\specs-stop`; hết hạn mức Claude thì lượt tự dừng, chạy lại tay.
- **Phân tích:** không cảnh báo thủ tục ([[phan-tich-bo-canh-bao]]); có mục Điều khoản hợp đồng (phạt, tạm ứng, thanh toán, bảo đảm) — phân tích cũ chưa có thì bấm Phân tích lại. Đối chiếu HSDT có tự kiểm chéo, phát hiện có bằng chứng tính vào điểm và kết luận (12/11/2026). HSDT chỉ lưu ở máy bot `Downloads\GenBid-HSDT\`, không lên git.
- **Ngưỡng độ ồn / tiêu hao trong Phân tích** (Khoa duyệt 13/11/2026, PR #680): bảng `NORM_BANDS` ở `sync-pure.js` theo dải kVA liên tục (bình quân + tốt nhất). HSMT chặt hơn mức bình quân → điểm Quan trọng, kể cả khi còn trong mức tốt nhất (Khoa 13/11: "nên để thành Quan Trọng chữ không phải Thông Tin", PR #687; em từng đề xuất mức Thông tin cho khoảng giữa, Khoa bác); lỏng hơn → im. Code tự thêm sau khi agent phân tích; phân tích cũ phải bấm Phân tích lại. Ngưỡng độ ồn dựa kinh nghiệm (dữ liệu NCC mỏng), chưa đối chiếu datasheet hãng.
- **Tiêu hao lấy từ tờ hãng động cơ** (Khoa 21/11/2026 "Giữ đạt", IB2600603983): số của ĐỘNG CƠ bằng đúng ngưỡng HSMT vẫn "đạt", nhưng check luôn ghi rõ nguồn là động cơ + dung sai nếu tờ ghi.
- **Chấm từ tờ hãng** (Khoa 21/11/2026 "1. có 2. có 3. cho đạt theo thương hiệu", điều phối chuyển lời; chưa làm, xem `nghiem-thu\chua-ro-tu-datasheet-1.md`): (1) nhiên liệu / tần số tổ máy được đạt từ tờ động cơ / đầu phát, ghi rõ nguồn; (2) lưu operator manual BĐK vào nguồn, bắt đầu DSE7320 MKII, chức năng tuỳ chọn → "cần xác nhận"; (3) HSMT đòi "nhà sản xuất / nhãn hiệu G7, EU" → đạt theo thương hiệu nguồn ghi (Baudouin = Pháp) + ghi chú "nơi sản xuất cần CO"; chưa rõ hãng vẫn chưa rõ; HSMT đòi NƠI SẢN XUẤT thì vẫn cần CO.
- **NCC trên web:** yêu thích (☆, chung cả nhóm; dropdown Báo giá chỉ hiện NCC yêu thích); Loại trừ (mọi bot bỏ qua). Nhật ký hoạt động chỉ giữ 1 ngày.
- **Egress Supabase:** PR liên quan phải qua nghiệm thu của phiên điều phối. Khoa đã bảo bỏ (12/11/2026): lọc realtime `hsmttext`, chờ số Usage để lên Pro — đừng đề xuất lại.

**Vì sao Thảo Nguyên bị loại kỹ thuật** (19 gói, Báo cáo đánh giá E-HSDT ở `C:\Projects\GenSet Pro\genbid-test\bcdg\`): xuất xứ chỉ là lý do ở 1 gói. Còn lại: lỗi soạn hồ sơ (nộp nhầm tệp gói khác, mã hàng lệch catalogue, không trả lời làm rõ, cam kết 48h thay vì 24h); thiếu catalogue / xác nhận hãng / test report / BPTC; linh kiện trượt một chỉ tiêu (BĐK Smartgen HGM6120 thiếu bảo vệ ngắn mạch, hiệu suất đầu phát, tiêu hao 50% tải, khí thải). Các chỉ tiêu này thành cảnh báo trên cấu hình hạng 1–3 ([[config-suggest]]).

Liên quan [[bidprice-suggest]], [[supplier-db]], [[bot-ops]].
