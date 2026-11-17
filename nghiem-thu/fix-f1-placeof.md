# Nghiệm thu F1 — sửa placeOf (web/bidprice.js)

- PR nháp: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/633 (nhánh `fix-f1-placeof`, worktree `C:\Projects\GenSet Pro\wt-fix-f1`)
- Tệp đổi: `web/bidprice.js` (CN_WORD, FOREIGN_WORD, thêm SHORT_NAME/SHORT_AFTER/SHORT_END/shortForeign, placeOf), `suppliers/bidprice-rest.test.mjs`, `web/CLAUDE.md` (1 dòng bẫy).
- Bản chụp cố định dữ liệu đo: `genbid-work\dieu-phoi\f1-snap\doc-cache\` (bidhist 1.556 gói). Mọi số dưới đây đo trên bản chụp này.

## Cách sửa
1. `normalize("NFC")` đầu `placeOf`; CN_WORD nhận thêm "TRUNG QUÔC" (gõ sai, 1 hàng).
2. Bỏ `\b`; tên nước dài khớp bằng `(?<![\p{L}\p{N}])…(?![\p{L}\p{N}])` cờ `u`. Thêm: Anh Quốc, Hoa Kỳ, Bồ Đào Nha, Tây Ban Nha, Thổ Nhĩ Kỳ, Thái Lan, Malaysia, Indonesia/Indonexia, Singapore, Đài Loan/Taiwan, LB/Liên bang Nga, Czech, Hà Lan, Phần Lan, Đan Mạch, Thụy Sĩ và tên tiếng Anh tương ứng.
3. Tên ngắn trùng chữ thường/tên riêng (Anh, Ý, Mỹ, Đức, Pháp, Áo, Nga, EU, Italia) chỉ tính khi: là cả một trường (tách bởi , ; / ( ) : - |), hoặc ngay sau "xuất xứ / made in / origin", hoặc đứng cuối dòng ở dạng viết hoa chữ đầu/toàn hoa ("máy phát Cummins Mỹ" — đúng dạng `goodsGroup` ghép `máy phát <hãng> <xuất xứ>`). Kết quả: "Ý kiến", "Mỹ Tho", "Nguyễn Anh Tuấn", "Công ty Đức Thành" vẫn null.
4. Nơi gọi `placeOf` (đã kiểm hết): `profileOf` (văn bản dòng động cơ của HSMT / hàng trúng), `candidates` (make+model động cơ), `engineGroup` (make+model). Không nơi nào đọc cả đoạn văn tự do ngoài các dòng động cơ/tổ máy đã lọc.

## Số đo
**(a) placeOf trên trường `origin` của 1.247 hàng tổ máy có xuất xứ (wonSetRow):** đổi **90 hàng / 52 giá trị khác nhau**. Chi tiết MỌI giá trị đổi: `nghiem-thu\fix-f1-placeof-do.txt`.
- null→foreign 81 hàng, null→cn 8 hàng (NFD "Trung Quốc" 5, "TRUNG QUÔC" 1, "Vĩnh Tế - Trung Quốc" 1, "Trung Quốc, Weifang…" 1), foreign→null 1 hàng.
- Xem tay cả 52 giá trị: đúng (Ý 7, Mỹ 6+4 dạng "/Mỹ/", Anh 5+3, Anh Quốc, Malaysia, Indonesia, Thái Lan, Đức 2, Bồ Đào Nha 2, EU 3, Nga 3, Hoa Kỳ, Thổ Nhĩ Kỳ, Tây Ban Nha, Singapore…). Ba giá trị đáng nghi, ghi để phiên điều phối quyết:
  - `"Việt Nam / Đài Loan"` (1 hàng, hệ thống nhiên liệu, không phải tổ máy) → foreign: hỗn hợp VN + Đài Loan, nay thành foreign.
  - `"Máy phát:Anh Quốc; Tủ hòa: Việt Nam; Máy cắt 6kV: Việt Nam"` → foreign (đúng cho máy phát).
  - `"…Caterpillar - Malaysia"`, `"…Fleetguard - Malaysia"` (dầu, lọc) → foreign: xuất xứ phụ tùng, không phải động cơ; xảy ra ở cả trước đó với nước khác (Italy).
- foreign→null: `"…Công ty TNHH Giải pháp và Công nghệ Tân Sinh Xuất xứ: Việt Nam"` — "pháp" của "giải pháp" từng khớp nhầm; đúng là null.
- Không có ca nào đổi sai rõ rệt. `"Vỏ Tủ Việt Nam … ABB - Italia"` cố ý giữ null (Italia chỉ tính khi là cả trường).

**Phát hiện thêm (lỗi cũ, nay hết):** regex cũ `\bpháp\b` khớp "hợp pháp", "biện pháp", "giải pháp", "pháp luật" trong dòng động cơ của HSMT → `profileOf(...).group` = foreign sai ở **45 lô** (đổi foreign→null). Đây là mặt trái lớn hơn cả 3 lỗi đề bài; mất 1–2 ca thật dạng "Mersen/Pháp Theo quy định…" (Pháp nằm giữa câu) — chấp nhận.

**(b) Ảnh hưởng tới hàm dẫn xuất (1.627 lô bidhist):**
| hàm | đổi |
|---|---|
| `profileOf(văn bản lô như candidates dựng).group` | 98 lô (null→foreign 52, foreign→null 45, null→cn 1) |
| `goodsGroup(hàng trúng)` | 50 lô (null→foreign 45, cn→null 4, null→cn 1) |
| `engineGroup(make, model của hàng trúng)` | 0 / 1.257 hàng (xuất xứ không đi vào đó) |
| `candidates` → đầu ra backtest `base` | 46 / 808 phần đo đổi (pool đổi 42; 1 phần có giá→không đủ gói, 1 phần không→có) |

cn→null 4 lô: lô gồm hàng Trung Quốc cộng thêm hàng phụ nay có nước ngoài (Mỹ/Anh/Nga/Đài Loan) → nhóm "lẫn" → null (chưa rõ nhóm), thận trọng đúng; 1 lô (xe đầu kéo FAW + "máy húc YAMZ Liên bang Nga") là gói không phải tổ máy.

**(c) `node suppliers/bidprice-backtest.mjs --cache <bản chụp>`** (808 phần đo, 636 có giá; đầu ra thô: `fix-f1-backtest-truoc.txt` / `fix-f1-backtest-sau.txt`):
| chỉ số (Chung, hạng 1 hiện nay) | trước | sau |
|---|---|---|
| trong [thấp,cao] | 36,3% | **36,9%** |
| \|sai số mức giữa\| trung vị | 7,0 điểm | **7,1** |
| độ rộng | 10,9 | 11,0 |
| nhóm foreign (n) | 66 | 81 (nhóm không rõ 372→356) |
| Theo nhóm xuất xứ hàng trúng (mục 3): trong [thấp,cao] / sai số / n có giá | 34,4% / 11,4 / 189 | 32,0% / 10,8 / 203 |
Thay đổi nhỏ, không ngược chiều rõ ràng; nhiều phần hơn có nhóm xuất xứ (foreign) nên dùng được "mục 3".

**(d) Kiểm thử:** `node --test suppliers/*.test.mjs`: 777 ca, 774 đạt, 0 hỏng, 3 `todo` (có sẵn từ trước, không phải của F1). `suppliers/regress-bidprice.test.mjs` xanh, **mẫu không đổi** (không chạy `GENBID_REGRESS_UPDATE`). `bidprice-rest.test.mjs`: 62 ca đạt, 0 todo (bỏ 3 todo; thêm ca phủ định tên ngắn; ca "khoá hành vi" `Động cơ Mỹ (USA), đầu phát Trung Quốc` = cn vẫn đúng và giữ).

## Rủi ro / quay lui
- Quay lui: revert PR; mã chỉ nằm ở `placeOf` và hằng số kèm theo.
- Khớp tên ngắn kiểu "cuối dòng" có thể bắt "… theo ý" nếu viết hoa toàn bộ ở cuối dòng (rất hiếm).
- "Pháp" giữa câu không còn nhận (đổi lấy hết khớp "hợp pháp").
- Web dùng chung `bidprice.js`: sau merge Vercel tự đăng; bot lấy bản mới ở lượt chạy sau.

## Chưa kiểm
- Chưa chạy UI web. Chưa chạy CI trên ubuntu (xem trạng thái PR).

## Cần ghi nhớ
- Quyết định đã có (Khoa duyệt 13/11): sửa placeOf. Bẫy mới đã ghi vào `web/CLAUDE.md`: JS `\b` không coi ỹ/đ/ý là chữ; tên nước ngắn phải chặn khớp nhầm.
- Chờ xem: `placeOf` vẫn chưa xét "Việt Nam / <nước>" hỗn hợp (không có quy tắc nhóm lẫn).
