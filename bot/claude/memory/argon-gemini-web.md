---
name: argon-gemini-web
description: "Gọi Argon qua Gemini web (Edge, tài khoản Pro của Khoa) bằng extension Claude in Chrome, tải tệp về tự động; khi nào dùng, cách làm, giới hạn"
metadata:
  node_type: memory
  type: feedback
  originSessionId: aef577e3-3dac-4ed6-bd8e-e7d7a68707d5
  modified: 2026-11-14T03:38:51.642Z
---

**Khoa chốt (14/11/2026):** thay vì trả OpenRouter, được phép điều khiển Gemini web (gemini.google.com, Edge đã đăng nhập, gói Pro) để gọi Argon. Tải tệp từ Gemini về máy **không cần hỏi lại** (quyền thường trực, chỉ cho tải từ Gemini). Vẫn theo [[argon-delegate]]: chỉ gọi khi Khoa bảo.

**Vì sao không dùng API/LiteLLM:** key Gemini API ở gói Free có hạn mức 0 cho Argon; app/web là sản phẩm riêng, không cấp quyền API; Gemini CLI báo `UNSUPPORTED_CLIENT`. LiteLLM đã cài (uv tool, `genbid-work\argon\litellm.yaml` + `litellm-start.ps1`, cổng 4000) nhưng đang TẮT; chỉ hữu ích khi bật billing cho key.

**Cách làm (đã thử thành công):**
1. `tabs_context_mcp` (Chrome extension), mở `gemini.google.com/app`. Bộ chọn model: "Lập kế hoạch & phân tích" = Argon (mặc định đang là Argon); "Trả lời ngay" = Hydrogen.
2. Đính tệp: bấm nút `+` (Nội dung tải lên và công cụ), `find` tìm `file-input` ẩn, dùng `file_upload` (dưới 10 MB mỗi lượt). Sau khi đính, ô nhập dời xuống: phải bấm lại vào ô "Hỏi Gemini" rồi mới gõ.
3. Prompt: yêu cầu xuất MỘT tệp trong Canvas, nêu tên tệp. Canvas có nút "Xuất" > "Tải xuống" → tệp về `C:\Users\Khoa\Downloads`.
4. Kiểm: chạy test với hàm gốc, rồi phá cố ý hàm gốc xem test có bắt không (như [[argon-delegate]]). Thử với `slug.test.mjs`: 6 test qua, 3 lần phá đều bị bắt.

**Giới hạn:** chỉ chạy trong phiên có extension kết nối (không gọi từ script); mỗi lượt tạo một cuộc trò chuyện trong lịch sử Gemini của Khoa; hạn mức Pro theo ngày chưa rõ; rủi ro Google chặn lưu lượng tự động (Khoa đã biết). Việc rất lớn (review cả mã nguồn) vẫn nên đi OpenRouter.

**Nhập repo GitHub (14/11/2026):** menu `+` > "Lựa chọn tải lên khác" > "Nhập mã" nhận URL repo. Khoa đã cho phép liên kết GitHub với Gemini (hộp "Kết nối với GitHub": quyền truy cập cả repo riêng, thu hồi ở GitHub > Settings > Applications). Repo `khoanguyenminh6868/GenSet-Pro` nhập được (chip "genset-pro"). Lần thử đầu (hỏi thư mục cấp 1 + `web/CLAUDE.md`) KHÔNG ra kết quả: quay vòng hơn 4 phút rồi trang tự về cuộc trò chuyện trống, không lưu. Nghi repo quá lớn (~2 MB mã); cần thử lại bằng nhánh/thư mục nhỏ hơn. Bấm menu bằng tọa độ dễ lệch (từng bấm nhầm Google Photos, đã đóng, không chọn ảnh): luôn chụp màn hình trước mỗi bước.

**Kết luận nhập repo (14/11/2026, lần 2):** "Nhập mã" chỉ nhận URL cả repo hoặc tên nhánh; URL thư mục (`/tree/main/web/api`) bị hiểu thành nhánh "main/web/api" và báo lỗi (13). Repo GenSet-Pro nặng hơn 100 MB (`suppliers/sources` 70 MB, `suppliers/cn` 16 MB, `suppliers/specs` 11 MB) nên lần nhập cả repo bị treo. Muốn Argon đọc mã thì đính từng tệp bằng `file_upload` (cách đã chạy ổn) hoặc nhập một nhánh/repo nhỏ riêng.

**Đường 2 (nhánh nhỏ) cũng thất bại (14/11/2026):** tạo nhánh orphan `argon-slim` (chỉ `web/` + `bot/`, 136 tệp, 2,4 MB), nhập vào Gemini được (chip hiện, "Nhánh: argon-slim") nhưng hỏi "bot/ có bao nhiêu tệp" thì quay ~80 giây rồi trang tự về trống, prompt trả lại vào ô nhập = yêu cầu lỗi, không có câu trả lời. Vậy lỗi không do kích thước repo mà do Gemini web + Argon + ngữ cảnh GitHub chưa chạy ổn. Kết luận: dùng cách đính tệp (`file_upload`), đừng nhập repo.

**Thử cào NCC bằng Argon web (14/11/2026, pilot AKO `ako-aggregate`):** hỏi Argon tìm trang bảng thông số trên website hãng; Argon trả "không có", nói rõ không truy cập/duyệt trực tiếp được website. Kết luận: Argon web ở chế độ này KHÔNG tự duyệt/cào web; chỉ xử lý được tài liệu em đính vào (`file_upload`). Phần tìm URL + `config-bot.mjs save` vẫn phải do Claude/crawl làm. Nếu dùng Argon thì chỉ để soạn `newCatalog.json` từ trang đã `save`, rồi `spec-check`. Danh sách cần làm (14/11): 67 genset_oem + 18 engine_maker + 11 alternator_maker có website mà chưa có dòng bảng (`node suppliers/spec-todo.mjs`). Khoa chưa chốt hướng tiếp.

**Hydrogen + Google Search tìm trang NCC (14/11/2026) — CHẠY ĐƯỢC:** chọn model "Trợ giúp nâng ngay" (Hydrogen), prompt bắt đầu bằng "Hay dung Google Search (khong tra loi tu tri nho)", kèm truy vấn `site:<tên miền> <từ khoá> ; site:<tên miền> datasheet pdf ; site:<tên miền> 柴油发电机组 参数`, yêu cầu "tối đa 8 URL Google thật sự trả về, mỗi URL kèm 1 câu nguyên văn, không đoán URL, không có thì nói 'khong co'". Argon (Lập kế hoạch & phân tích) KHÔNG duyệt web, Hydrogen thì có. Đã kiểm: AKO trả 8 URL đều HTTP 200, câu trích khớp nguyên văn trong trang (AKO làm tổ máy theo đơn đặt hàng, không có bảng chuẩn). AKSA China trả 3 PDF datasheet thật (HTTP 200) nhưng là PDF ẢNH không có lớp chữ (Producer "Image Conversion Plug-in"; `config-bot save` ra tệp rỗng, `pdftotext` 12 ký tự) nên phải qua `ocr-specs.mjs` (chỉ giữ dòng code kiểm được). Mẹo bẫy: ô nhập giữ nháp cũ, luôn Ctrl+A + Delete trước khi gõ; mỗi lượt tạo một cuộc trò chuyện trong lịch sử Gemini.
