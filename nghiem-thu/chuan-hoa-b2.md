# Chuẩn hoá datasheet, bước 2: bộ sinh bản chuẩn (nhánh wt-chuan-hoa-b2)

Trạng thái: xong phần mã, PR nháp, CHƯA đăng thật. Chưa nơi nào đọc collection này.

## 1. Thiết kế

- Collection `specstd` trong bảng `docs`.
- Động cơ, đầu phát, bộ điều khiển: mỗi model một doc, id `<part>:<keyOf>`, dạng `{ id, part, key, model, make, suppliers[], fields, hash }`.
- Tổ máy: mỗi NCC một doc, id `genset:<NCC>`, dạng `{ supplierId, models: { <keyOf>: { model, fields } }, hash }`. Lệch so với đề xuất "mỗi model một doc" vì có 31.441 tổ máy và tên tổ máy vốn là của từng NCC.
- Một giá trị: `{ value, unit, cond, missing, raw, rawJoined, src: { supplierId, n, table, row }, suppliers }`.
- `hash` là SHA-256 (16 ký tự) của nội dung đã sắp khoá. Không có ngày giờ trong nội dung.
- Cỡ: 9.681 doc, 44,33 MB, doc lớn nhất 1.141 KB (tổ máy của một NCC), trung bình khoảng 4,6 KB.

| Phương án | Kết quả | Quyết định |
|---|---|---|
| Một doc cả kho | Một NCC đổi là ghi lại 44 MB | Loại |
| Mỗi NCC một doc cho mọi vai | Động cơ chung bị chép ở nhiều doc, không đếm được số NCC mỗi giá trị | Loại |
| Mỗi model một doc, kể cả tổ máy | Thêm 31.441 dòng `docs` | Loại |
| Model cho động cơ / đầu phát / BĐK, NCC cho tổ máy | 9.681 doc | **Chọn** |

Giới hạn của cách chia: động cơ chung nhiều NCC đổi `suppliers` khi một NCC đổi, nên doc của các model NCC đó chào sẽ được ghi lại. Doc của model khác và tổ máy của NCC khác không đổi.

## 2. Độ phủ theo trường

Số model theo vai: tổ máy 31.441, động cơ 6.222, đầu phát 3.024, bộ điều khiển 209. Cột: model có giá trị | số giá trị | giá trị có `missing`.

| Tổ máy | | | | Động cơ | | | |
|---|---|---|---|---|---|---|---|
| power | 29.242 | 58.921 | 38.745 | brand | 4.751 | 4.751 | 0 |
| engine_model | 30.478 | 39.398 | 0 | brand_country | 4.822 | 4.822 | 0 |
| alternator_model | 265 | 327 | 0 | made_in | 6.222 | 6.775 | 0 |
| controller_model | 513 | 513 | 0 | power_kwm | 1.498 | 3.433 | 1.759 |
| frequency | 9.713 | 10.546 | 0 | cylinders | 2.886 | 3.037 | 0 |
| voltage | 2.487 | 3.291 | 1.431 | cyl_layout | 1.438 | 1.496 | 0 |
| phases | 2.378 | 2.378 | 0 | bore_stroke | 2.144 | 3.187 | 1.184 |
| power_factor | 532 | 532 | 52 | displacement | 2.547 | 3.605 | 115 |
| current | 1.664 | 1.746 | 1.746 | compression | 844 | 950 | 0 |
| freq_regulation | 150 | 150 | 150 | engine_type | 98 | 98 | 0 |
| fuel | 660 | 660 | 0 | aspiration | 567 | 695 | 522 |
| fuel_100 | 7.442 | 9.518 | 9.311 | charge_cooling | 3 | 3 | 0 |
| fuel_75 | 652 | 682 | 59 | governor | 1.246 | 1.696 | 531 |
| fuel_50 | 402 | 419 | 57 | cooling | 643 | 692 | 0 |
| tank | 857 | 934 | 145 | starting | 224 | 276 | 0 |
| runtime | 545 | 545 | 545 | coolant_capacity | 149 | 151 | 151 |
| dimensions | 12.032 | 15.500 | 14.826 | oil_capacity | 1.093 | 1.704 | 1.704 |
| weight | 10.313 | 13.419 | 13.410 | speed | 1.566 | 2.055 | 333 |
| noise | 385 | 389 | 16 | emission | 1.004 | 1.315 | 602 |

Đầu phát: brand 620, model 3.024, made_in 3.024, ratings 207 model / 8.247 dòng, insulation 474 (79 missing), ip 309, excitation 306 (205 missing), voltage_regulation 170 (197 missing), thd_no_load 38 (38 missing). Bộ điều khiển: brand 209, model 209, made_in 209.

Trường chưa sinh (bước 4):

- Tổ máy: series, brand, made_in, genset_type, overload, load_step, iso8528_class, ambient, breaker, battery, standards.
- Động cơ: power_hp (`cn/` hiện không có số ghi HP), genset_power, fuel_system, electrical_vdc.
- Đầu phát: brand_country, winding_pitch, wires, altitude, overspeed, air_flow, short_circuit, avr, thd_linear_load, tif, thf, poles, bearing, type, cooling, standards.
- Bộ điều khiển: toàn bộ trừ brand, model, made_in (46 trường, gồm brand_country).

## 3. Kiểm chéo toàn bộ (`suppliers/spec-standard-check.mjs`, thoát 0)

So MỌI thông số của mọi dòng, không lấy mẫu.

| Mục | Số |
|---|---|
| Thông số đọc | 114.405 |
| Giữ | 114.171 |
| Bỏ vì không đọc ra giá trị | 234 (`value` 45, `number` 80, không có giá trị `exempt` 109) |
| Giá trị trùng số gốc của `normalizeRecord` / chữ gốc | 111.070 |
| Đổi, giải thích bằng luật enum (`same` 929, hoa thường 2.110) | 3.039 |
| Chỉ gọn khoảng trắng | 62 |
| Đổi mà không giải thích được | 0 |
| Giá trị không có trong doc | 0 |
| `raw` không tìm thấy trong nguồn | 0 |
| `raw` do bộ đọc ghép ô (`rawJoined`, vd `lt \| 3,3` thành `3,3 L`), mọi số có trong bảng | 719 |
| `raw` nằm ở dòng khác của cùng bảng (`ENGINE_LINES`, `src.row` là dòng model) | 14 |
| Giá trị sửa theo `fixspec`, `raw` giữ số nguồn | 11 |

Giới hạn: kiểm chéo so bản chuẩn với bộ đọc hiện có, nên lỗi sẵn của bộ đọc không bị phát hiện. Các trường tính từ bản ghi (`power`, `frequency`, `made_in`, `brand_country`, `ratings`) không đi qua phép so này; `ratings` chỉ có test tách theo điện áp.

## 4. Kết quả chạy

- `node --test suppliers/*.test.mjs`: 1.618 / 1.618 đạt.
- `node suppliers/quality.mjs --check`: không chỉ số nào xấu đi.
- `node suppliers/spec-standard.mjs --post --dry`, chạy từ máy không có khoá Supabase nên tính như web chưa có doc nào: 9.681 doc sẽ ghi, 67 lô, 44,83 MB. Chưa so được với web, và chưa chạy đăng thật.

## 5. Điểm cần Khoa quyết

**Câu 1. Đăng bản chuẩn vào đâu?** Ghi vào `docs` kéo theo realtime tới mọi trang đang mở (`web/shim.js` nghe cả bảng) và một dòng `activity_log` cho mỗi doc (`web/supabase/schema.sql`). Lần đăng đầu là 9.681 sự kiện, tối đa khoảng 45 MB cho mỗi trang đang mở, trừ phần Supabase cắt bớt payload lớn. Hiện workflow chỉ chạy `--dry`; ghi thật khi biến repo `SPEC_STD_PUBLISH=1`.

- A (đề xuất): bảng riêng `spec_std`, không realtime, không trigger. Cần chạy SQL trên Supabase và sửa `spec-standard.mjs`, bước 5 đọc qua API riêng.
- B: giữ `docs`, thêm `specstd` vào danh sách bỏ qua của trigger, chấp nhận realtime. Đăng lúc không ai mở trang.
- C: giữ nguyên `docs`, chấp nhận cả hai.

**Câu 2. Công suất động cơ ghi HP thì có giữ thêm số kWm quy đổi không?** Hiện chỉ giữ số HP ở `power_hp`. `cn/` chưa có ca nào nên chưa ảnh hưởng.

- A (đề xuất): chỉ giữ số nguồn ghi.
- B: thêm dòng kWm tính bằng `conversions.js`, đánh dấu là số quy đổi.

**Câu 3. 275 số dưới nhãn "kW/Hp" (ettes-power và có thể NCC khác) có đúng là kW không?** Bộ đọc xếp là kW vì chữ kW đứng trước và ô chỉ có một số. Em chưa soát từng dòng.

- A (đề xuất): giao một việc soát 275 dòng trước khi web đọc (bước 5).
- B: tạm ghi `missing: unit` cho nhóm này.
