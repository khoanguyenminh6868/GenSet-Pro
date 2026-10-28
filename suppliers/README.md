# Nhà cung cấp máy phát điện

Dữ liệu cho trang "Nhà cung cấp" và tab "Nhà cung cấp" (Gợi ý top 3) của GenBid Pro. Giai đoạn này: Trung Quốc. Duyệt bởi Khoa, 2026-10-28.

## Nguyên tắc
- Mỗi thông tin có nguồn `[n]`: link, ngày đọc, hạng nguồn và câu trích nguyên văn (giữ ngôn ngữ gốc).
- Không tìm thấy thì để `null` và ghi vào `missing`; không ước lượng, không suy từ tên model, không quy đổi kW/kVA.
- Hạng nguồn: **A** website/tài liệu chính hãng, **B** triển lãm/hiệp hội, **C** tự giới thiệu (đại lý, sàn B2B). Chỉ có nguồn C thì `confidence: "low"`.
- Website mang tên hãng nhưng do đại lý làm (ví dụ `sdec-engine.com`, `dcec-engine.com`, `ccec-engine.com` của EMAC) không được tính là nguồn chính hãng.
- Lời quảng cáo ghi kèm "Theo hãng".

## Thư mục
- `cn/<id>.json`: một nhà cung cấp (định dạng: `schema.json`).
- `sources/<id>/<n>.md`: bản lưu trang nguồn (dòng đầu: URL, ngày đọc). Trang dựng bằng JavaScript được đọc qua firecrawl, ghi `Via: firecrawl`.
- `fetch-source.mjs <id> <n> <url>`: lưu một trang (HTML hoặc PDF) thành văn bản.
- `build.mjs <specs.mjs>`: dựng `cn/<id>.json` từ mô tả ngắn; URL và ngày đọc của mỗi nguồn lấy từ dòng đầu file đã lưu, không gõ tay.
- `verify.mjs`: kiểm tra bằng code: mỗi câu trích phải có nguyên văn trong file nguồn, số min/max công suất phải có trong câu trích, mỗi `src` trỏ tới nguồn có thật.
- `upload.mjs [--dry]`: chạy kiểm tra rồi đăng lên web thành `supplier/<id>` (qua `/api/ingest`). Bản ghi `incomplete` không đăng.

Không thu thập nhà phân phối tại Việt Nam (Khoa, 2026-10-28).

## Thêm hoặc sửa một nhà cung cấp
1. `node suppliers/fetch-source.mjs <id> <n> <url>` cho từng trang nguồn.
2. Viết `cn/<id>.json`, chép câu trích từ file nguồn.
3. `node suppliers/verify.mjs` cho tới khi không còn lỗi.
4. `node suppliers/upload.mjs`.

Xoá một bản ghi khỏi web: hiện chưa có lệnh; đổi `status` thành `incomplete` không xoá bản đã đăng.
