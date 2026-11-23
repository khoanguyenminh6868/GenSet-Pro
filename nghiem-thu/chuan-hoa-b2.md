# Chuẩn hoá datasheet, bước 2: bộ sinh bản chuẩn (nhánh wt-chuan-hoa-b2)

Trạng thái: ĐANG LÀM. Mã ở `C:\Projects\GenSet Pro\wt-chuan-hoa-b2` (chưa commit tới khi test đạt).

## 1. Thiết kế

- Collection `specstd` trong bảng `docs`. Chưa nơi nào đọc.
- Động cơ, đầu phát, bộ điều khiển: mỗi model một doc, id `<part>:<keyOf>`, dạng `{ id, part, key, model, make, suppliers[], fields, hash }`.
- Tổ máy: mỗi NCC một doc, id `genset:<NCC>`, dạng `{ supplierId, models: { <keyOf>: { model, fields } }, hash }`.
- Một giá trị: `{ value, unit, cond, missing, raw, rawJoined, src: { supplierId, n, table, row }, suppliers }`.
- `hash` là SHA-256 (16 ký tự) của nội dung đã sắp khoá. Không có ngày giờ trong nội dung.

Phương án đã cân nhắc:

| Phương án | Kết quả | Quyết định |
|---|---|---|
| Một doc cả kho | 36 MB, một NCC đổi là ghi lại tất cả | Loại |
| Mỗi NCC một doc cho mọi vai | Động cơ chung nhiều NCC phải chép ở nhiều doc, không đếm được số NCC mỗi giá trị | Loại |
| Mỗi model một doc cho cả tổ máy | 31.441 tổ máy, quá nhiều dòng `docs` | Loại |
| Model cho động cơ / đầu phát / BĐK, NCC cho tổ máy | 9.681 doc, 36,0 MB, doc lớn nhất 901 KB. Tên tổ máy vốn là của từng NCC | **Chọn** |

## 2. Việc còn lại khi phiên dừng giữa chừng

1. Chạy `node --max-old-space-size=6000 suppliers/spec-standard-check.mjs --json <tệp>`, phải thoát 0.
2. Chạy `node --test suppliers/spec-standard.test.mjs`, rồi `node --test suppliers/*.test.mjs`, rồi `node suppliers/quality.mjs --check`.
3. Ghi số vào tệp này, commit, push, mở PR nháp (không merge).

## 3. Điểm phát hiện cần Khoa quyết

Ghi vào `docs` kéo theo hai việc mà collection mới không tránh được: realtime đẩy từng dòng tới mọi trang đang mở (`web/shim.js`), và trigger `docs_activity` thêm một dòng `activity_log` cho mỗi doc (`web/supabase/schema.sql`). Lần đăng đầu là 9.681 sự kiện, khoảng 36 MB cho mỗi trang đang mở. Vì vậy bước workflow mặc định chỉ chạy `--dry`, ghi thật chỉ khi biến repo `SPEC_STD_PUBLISH=1`.
