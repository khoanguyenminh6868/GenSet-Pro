# Nghiệm thu: baudouin-du-lieu-1 (20/11/2026)

PR DRAFT: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/971 (nhánh `baudouin-du-lieu-1`, worktree `C:\Projects\GenSet Pro\wt-baudouin-1`, chưa gỡ).

## Tệp đổi
- `suppliers/cn/baudouin.json`: nguồn n108–124 (17 trang `engine_product/<dòng>/`), n1004–1020 (brochure, rating card 50/60 Hz, 13 spec sheet PDF); 63 bảng (trước 4). Bảng Engine Data (không header) thêm cho n106, n107 và mọi trang mới; bảng Ratings của từng trang.
- `suppliers/specs/baudouin.json`, `suppliers/datasheets/baudouin.json`, `suppliers/sources/baudouin/108–124.md`, `1004–1020.md`.
- Không đụng `web/catalog.js`, `config-bot.mjs`, NCC khác.
- Cố ý bỏ: 5 trang "Generator Set" (DC gensets) và 3 PDF DC gensets (1001–1003) vì ngoài phạm vi "PowerKit diesel"; n101/n103 giữ nguyên.

## Lệnh đã chạy + đầu ra thật
- `node suppliers/merge-specs.mjs baudouin` → "1 nhà cung cấp có bảng cấu hình, 730 dòng model".
- `node suppliers/crawl-datasheets.mjs baudouin` → "21 trang đọc, 22 link datasheet, 20 datasheet có thông số, 500 dòng".
- `node suppliers/verify.mjs` → "435 bản ghi, 0 có lỗi" (baudouin ✓ verified).
- `node suppliers/spec-diff.mjs git:origin/main .` → "bản ghi cũ 60073, mới 60283 | khác 0 | chỉ cũ 8, chỉ mới 218 | bảng có đổi 22"; theo NCC chỉ có `baudouin`; đảo vai 0 → 0. 8 "chỉ cũ" là 8 dòng bảng n107 đổi chỉ số bảng (b3→b4 do thêm bảng Engine Data), cùng dòng chữ. Không bản ghi NCC khác đổi.

## Số đo trước / sau (đo thật, `GenbidCatalog.build` + `modelFacts` toàn bộ NCC)
6M31G825/5:
- Trước: engine có 5 nguồn dùng (agg-fuzhou, cgm-italia, voltgent, weichai-heavy-machinery, weichai-power); `modelFacts` 8 dòng (cyl, bore, gov, emission, đều của Weichai).
- Sau: 7 lượt dùng (thêm 2 dòng của baudouin n115 và n1005); `modelFacts` VẪN 8 dòng, không có dòng nào của baudouin.
- **Mục tiêu "modelFacts có thêm thông số từ baudouin" CHƯA đạt**, lý do bên dưới. Dữ liệu đã nằm trong hồ sơ, đã kiểm nguồn, nhưng bộ đọc không nối được.

## Vì sao catalog.js không đọc ra (không sửa, theo brief)
1. Engine Data là bảng thông số CHUNG của dòng máy (6M31), không có dòng "Model | 6M31G825/5". `modelFacts` chỉ nhận bảng không header khi tiêu đề có ĐÚNG MỘT mã, mà mã đó là model của danh mục; tiêu đề tách theo "/" nên "6M31G825/5" thành "6M31G825" + "5", không khớp khoá "6M31G825/5". Quy tắc "khung" (`FRAME_SUFFIX`) cũng không nhận hậu tố "G825/5".
2. Dòng Engine Data viết "| Cylinders 6" (một ô, không dấu ':') nên `cellsOf` cũng không tách nhãn / giá trị.
3. Bảng Ratings 3 tầng header (PRP/ESP/DCP; kWm; 50Hz) không ra `specs` (n106 cũ cũng `power:null, specs:[]`).
4. Rating card 50 Hz (n1005): tiêu đề PRP/ESP / kWe / kVA là ảnh, chữ chỉ có "Aspiration | Governor"; dòng "| 6M31G825/5 | 680 | 740 | 600 | 750 | 660 | 825" giống y dòng trang web nhưng cột Aspiration/Governor ("T/A-A", "ECU") bị pdftotext tách khỏi dòng.
Đề xuất (việc riêng, cần Khoa duyệt): cho `modelFacts` nhận bảng Engine Data của hãng động cơ cho mọi model có trong Ratings cùng nguồn `n`.

## Bảng tổng: mỗi dòng máy có / thiếu (nguồn baudouin.com, trang `engine_product/<dòng>/`)
Mọi dòng đều CÓ: xi lanh, bố trí, bore × stroke, dung tích, nhiên liệu, điều tốc, nạp khí (trừ ô trống ghi bên dưới), bảng Ratings (PRP/ESP kWm, kWe, kVA, 50/60 Hz). Mọi dòng đều THIẾU: tỉ số nén, tiêu hao nhiên liệu theo mức tải (grep "compression" / "g/kWh" / "L/h" trong 13 spec sheet, brochure, 3 rating card: không có).

| Dòng (n) | Xi lanh | Bố trí | Bore×Stroke | L | Nhiên liệu | Điều tốc | Nạp khí | Spec sheet |
|---|---|---|---|---|---|---|---|---|
| 4M06 (108) | 4 | In line | 89x92 | 2.3 | HP CR/Mech | ECU/Elec | NA, T, T&AA | không |
| 4M10 (109) | 4 | In line | 105x118 | 4.1 | Mech | Elec | T&AA | có |
| 4M12 (110) | 4 | In line | 108x125 | 4.58 | CR | ECU | T&AA | không |
| 6M11 (111) | 6 | In line | 105x130 | 6.75 | Mech | Elec | T&AA | có |
| 6M12 (112) | 6 | In line | 108x136 | 7.47 | CR | ECU | T&AA | không |
| 6M16 (113) | 6 | In line | 126x130 | 9.7 | Mech | Elec | T&AA | có |
| 6M21 (114) | 6 | In line | 127x165 | 12.54 | Mech pump/CR | Elec/ECU | T&AA | có |
| 6M31 (115) | 6 | "6 In line" | 149x177 | 18.5 | CR | ECU | T&AA | không |
| 6M33 (116) | 6 | In line | 150x185 | 19.6 | CR/Mech | ECU/Elec | T&AA | có |
| 6M33 Stage V (106) | 6 | In line | 150x185 | 19.6 | CR | ECU/Elec | trang không ghi | không |
| 8M21 (117) | 8 | In line | 127x165 | 16.72 | Mech | Elec | T&AA | có |
| 8M33 (118) | 8 | At Vee | trang KHÔNG ghi | 26.1 | CR/Mech | ECU/Elec | "TCA" | có |
| 12M26 (119) | 12 | At Vee | 150x150 | 31.8 | Mech | Elec | T&AA | có |
| 12M33 (120) | 12 | At Vee | 150x185 | 39.2 | CR/Mech | ECU/Elec | T&AA | có |
| 12M33 Stage V (107) | 12 | V-Type | 150x185 | 39.2 | CR | ECU/Elec | trang không ghi | không |
| 12M55 (121) | 12 | At Vee | 180x215 | 65.6 | CR | ECU | T&AW | có |
| 16M33 (122) | 16 | At Vee | "15-x185" (nguồn gõ lỗi) | 52.3 | CR | ECU | T&AW | có |
| 16M55 (123) | 16 | At Vee | 180x215 | 87.5 | CR | ECU | T&AW | có |
| 20M33 (124) | 20 | At Vee | 150x185 | 65.4 | CR | ECU | T&AW | có |
(T&AA = Turbocharged & air-to-air cooled; T&AW = air-to-water; CR = High Pressure Common Rail.) Chép đúng chữ nguồn, không sửa.

**6M31G825/5** (yêu cầu của phiên điều phối): CÓ 6 xi lanh, 6 In line, 149x177, 18.5 L, common rail, ECU, turbo & air-to-air; PRP 680 kWm / ESP 740 kWm; 600 kWe / 750 kVA (PRP), 660 kWe / 825 kVA (ESP) (n115, n1005). THIẾU: tỉ số nén, tiêu hao nhiên liệu theo tải (trang 6M31 không có spec sheet; trang chỉ link brochure + 2 rating card). Rating card 50 Hz thuộc nhóm "UNREGULATED ENGINES" (n1005) và thêm hai model 6M31G900/5, 6M31G1000/5 mà trang web không liệt kê.

## 3 mẫu đối chiếu nguồn
1. https://baudouin.com/engine_product/6m31/ , quote: "| Bore & Stroke (mm) 149x177" (sources/baudouin/115.md).
2. https://baudouin.com/engine_product/6m31/ , quote: "| 6M31G825/5 | 680 | 740 | | 600 | 750 | | 660 | 825 | |".
3. https://baudouin.com/wp-content/uploads/2026/10/Baudouin_RatingCard_Diesel_50Hz-031126.pdf , quote: "| 6M31G900/5 | 730 | 800 | 640 | 800 | 720 | 900".

## Bất thường của nguồn (chép đúng, không sửa; ghi nhận)
- 16M33 "Bore & Stroke 15-x185"; bảng 16M33 dòng 16M33G1900/5 PRP kWm "1000" (cột ESP/PRP lộn thứ tự, tương tự 16M33G1700/5); 8M33 tiêu đề cột "ESP kWm | PRP kWm" ngược với số (PRP < ESP); 12M55G8D0/5 toàn "-"; 12M26 và 12M33 có dòng trùng model giữa 50Hz (12M26G2D0/S) ; 4M12G1D3/5 lặp hai dòng. Trang DC gensets (không nhập): "Displacement 65x65", "87.5L".
- Khớp nhau: bảng trang web và rating card cho 6M31 (4 model chung).

## Rủi ro còn lại + quay lui
- Rủi ro thấp: chỉ thêm bảng/nguồn của baudouin; verify và spec-diff sạch. Một số dòng spec sheet là rác dạng "| Models | ESP" do pdftotext (đúng chữ nguồn).
- Quay lui: đóng PR / `git revert` merge commit.

## Việc chưa kiểm được
- Chưa chạy `config-bot prep` / `cand.mjs` (top 30 IB2600603983) vì modelFacts không đổi.
- Không đối chiếu từng spec sheet PDF bằng mắt (chỉ 6M33 và rating card 50 Hz trang 3).
- Tỉ số nén / tiêu hao: hãng không công bố trong tài liệu công khai trên baudouin.com đã đọc.

## Cần ghi nhớ
- Bẫy catalog: bảng Engine Data theo dòng máy của hãng động cơ không gắn được vào model có "/" (xem mục lý do); nếu Khoa muốn dùng cho Gợi ý cấu hình cần việc sửa bộ đọc riêng.
- baudouin.com: trang `engine_product/<dòng>/` đọc được bằng fetch thường; danh sách PowerKit diesel ở `engine_product-category/baudouin-powerkit-engines/` (19 trang). Trang `powergen-solutions/powerkit-engines/` trả ảnh webp.
