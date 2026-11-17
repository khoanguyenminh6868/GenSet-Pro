# Nghiệm thu cfg-chuyen-mon-6 — Tải datasheet hãng cho cân bằng công suất

PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/514 (draft, nhánh `cfg-ds` trên origin/main 12600c5; commit 4259b4f). Khoa duyệt 11/11 ("tải thêm"). Chỉ trang hãng; không đăng nhập, không vượt chặn; không chạy agent; không ghi web.

## 1. Nguồn đã tải (URL lấy từ kết quả tìm kiếm WebSearch giới hạn miền hãng; Firecrawl hết hạn mức)
**Cummins — mart.cummins.com (thư viện tài liệu chính thức của Cummins), lưu bằng `fetch-source.mjs` vào `sources/cummins-inc/<n>.md`, mục `sources` có câu trích (tên model, "1500 rpm (50 Hz Ratings)", dòng số):**
| n | Model | URL | 50 Hz prime gross / net kWm | 50 Hz standby gross / net |
|---|---|---|---|---|
| 2005 | KTA50-G3 | https://mart.cummins.com/imagelibrary/data/assetfiles/0070366.pdf | 1097 / 1071 | 1227 / 1188 |
| 2006 | KTA38-G3 | …/0070362.pdf | 806 / 784 | 895 / 864 |
| 2007 | KTA19-G4 | …/0064182.pdf | 448 / 430 | 504 / 481 |
| 2008 | KTA50-G8 | …/0070367.pdf | 1200 / 1174 | 1429 / 1388 |
| 2009 | 6BTA5.9-G5 | …/0070815.pdf | 93 / 88 | 102 / 96 |
| 2010 | 6BTAA5.9-G7 | …/0070818.pdf | 145 / 134 | 160 / 147 |
| 2011 | QSL9-G2 | …/0070371.pdf | 206 / 196 | 239 / 226 |
| 2012 | QSL9-G3 | …/0070372.pdf | 227 / 216 | 257 / 243 |
| 2013 | 6LTAA9.5-G3 | …/0064181.pdf | 250 / 236 | 280 / 263 |
| 2014 | QSZ13-G5 | …/0064187.pdf | 410 / 390 | 469 / 445 |
| 2015 | QSK38-G2 | …/0064195.pdf | 989 / 951 | 1096 / 1047 |
| 2016 | QST30-G3 | …/0070621.pdf | 806 / 784 | 895 / 864 |
| 2017 | QSK50-G3 | …/0070822.pdf | 1210 / 1173 | 1400 / 1308 |
(Có thêm khối 60 Hz / 1800 rpm cho các tờ ghi; QSL9-G5 đã có từ trước — 2001.) Code dùng kWm NET.
Đã tải nhưng KHÔNG dùng: KTA38-G4 (0070363) và QSZ13-G11 (0070396) để trống "-" ở 50 Hz; KTA38-G9 (0072237) prime "N/A" và một ô "N/A" bị PDF đẩy sang dòng khác → số ô lệch → bỏ (đúng quy tắc). Tài liệu tổng hợp "G-Drive Engines" (0057734) KHÔNG dùng: cột tên model lệch hàng khi chuyển chữ (dòng ghi "KTA19-G4" mang số của QSL9-G5) — gán model là đoán.

**Stamford — stamford-avk.com:**
- `maker-datasheets.mjs stamford-avk-china …` → `sources/stamford-avk-china/1009–1018.md`, `merge-specs.mjs stamford-avk-china`: HCI5D-311-TD-EN_Rev_A (HCI534D/544D), HCI5E-311-TD-EN_Rev_A (HCI534E/544E), UCI274E-311-TD-EN_Rev_C, UCI274H-311-TD-EN_Rev_B, UCDI274J-311-TD-EN_Rev_C, UCDI274K-311-TD-EN_Rev_B, UCI224G-311-TD-EN_Rev_B, A056E878-S4L1D-D4-D-W311 (S4L1D-D41), ESA056E879-S4L1D-E4-H-W311 (S4L1D-E41), ES10461983_S5L1D-H4-B-W311 (S5L1D-H4). Tất cả URL https://www.stamford-avk.com/sites/stamfordavk/files/<tên tệp>.pdf.
- `fetch-source.mjs stamford-avk-china 2001` → Industrial Ratings Book Ed4: https://www.stamford-avk.com/sites/stamfordavk/files/2021-05/STAMFORD-Industrial-Ratings-Book-Ed4.pdf (12 bảng 3 pha × điện áp × tần số, 107 model; chỉ kVA/kW, không có hiệu suất).
- Đối chiếu chéo giữa hai nguồn của hãng: HCI544D Cont. H 400 V 50 Hz = 550 kVA (book và TD 1009); UCI274H = 200; UCDI274J = 230; S4L1D-D41 = 310 (TD, book "S4L1D-D", và brochure S4 của hãng ghi 310 kVA ở 400 V).

## 2. Model KHÔNG lấy được + lý do
- **Cummins:** 4BTA3.9-G2, 4BTA3.9-G11, 4BT3.9-G2, 4B3.9-G2, 6BT5.9-G2, 6BTA5.9-G2, 6BTAA5.9-G2, 6BTAA5.9-G12, 6CTA8.3-G2, 6CTAA8.3-G2, 6LTAA8.9-G2, NT855-GA, KTA19-G3, KTA19-G3A, KTA38-G2, KTA38-G2A, QSZ13-G3: không có Specification Sheet trên mart.cummins.com theo kết quả tìm kiếm (chỉ có biến thể khác: G4/G5/G7…); trang model trên cummins.com (cummins.com/generators/…) trả **403** cho tải tự động → không vượt chặn. DCEC / CCEC: không tìm thấy miền chính thức có datasheet các model này trong kết quả tìm kiếm. KTA38-G9: có tờ nhưng prime "N/A" (chỉ standby) và số ô lệch → không dùng.
- **Perkins:** 1103A-33G/TG1/TG2, 1104A-44TG2, 1104C-44TAG2, 1106A-70TAG2/TAG3, 4006-23TAG3A, 4012-46TWG2A: perkins.com trả **403** (trang model có link "ElectropaK 1500 rpm Specification Sheet" nhưng không đọc được bằng tải tự động); emc.perkins.com chỉ có các tờ được lập chỉ mục cho model khác (1206D, 2806, 403/404…) → hãng không công bố qua kênh đọc được. Trang Perkins đã lưu trước đây chỉ ghi khoảng ("140-204 kWm").
- **Stamford:** HCI444D/E/F/FS và HCI544C — không có Technical Data Sheet 3 pha winding 311 trong kết quả (chỉ bản 1 pha hoặc winding 13/14/17/25); có kVA từ Ratings Book nhưng KHÔNG có hiệu suất. S5L1D-H41: chỉ có tờ "S5L1D-H4 Wdg.311" — tên khác model trong danh mục, KHÔNG gộp (không đoán).

## 3. Code
- `ratings.mjs`: `stamfordBookRatings` (bảng 3 pha của Ratings Book: "x POLE Three Phase", "Star 400V", "50Hz/1500rpm", "TEMPERATURE RISE", Standby/Continuous × 163/27 … 80/40, hàng model 10 số, chú thích số sau tên model; hàng thiếu ô bị bỏ; bảng 1 pha bỏ); `stamfordRatings` nhận "RATINGS AT 0.8 POWER FACTOR" (S-range, cột standby trước) và lấy tên model từ dòng "… - Winding 311" / "… Wdg.311" gần nhất ("HCI 534D/544D" → HCI534D/544D → khoá HCI534D, HCI544D); `cumminsRatings` chấp nhận nhiều khoảng trắng trong tiêu đề (chữ `pdftotext -table`).
- `config-bot.mjs`: `sourceRatings` đọc cả tệp có "TEMPERATURE RISE"; `altColumns` chỉ dùng cấp F 105/40 và H 125/40 cho Cont. (Ratings Book có thêm B 80/40).
- Bonus không chủ đích: các tờ S-range đã lưu từ trước của `gfe-power` (S4L1D-F41, S5L1D-E4, S4L1D-D41) giờ đọc được.
- Điều kiện an toàn #507 giữ nguyên (kWm của hãng hoặc ≥ 2 nguồn ≤ 3%, dòng tổ máy ghi tần số, tốc độ khớp tần số).

## 4. Lệnh kiểm + đầu ra thật
```
cd wt-cfg-ds/suppliers && node --test       # 192 pass, 0 fail
node verify.mjs                             # 432 bản ghi, 0 có lỗi (cummins-inc ✓, stamford-avk-china ✓)
```
Đối chiếu nguyên văn (scratchpad `rsurvey2.mjs`): 52 tệp nguồn có khối định mức đọc được, mọi dòng trong `lines` có y hệt trong tệp: 0 lệch.
`build()` của web/catalog.js trên suppliers/cn: md5 **2fa354dbfc6c7497efef869150a9aea1** ở cả origin/main và nhánh này (5.218 động cơ, 30.385 dòng, 2.099 đầu phát) — bảng datasheet mới không thành dòng tổ máy, catalog không đổi.
CI PR #514 (run 42960175748): app pass 55s, server pass 11s, suppliers pass 26s.

## 5. Số đo (ĐO; doc-cache supplier 10/11 với hai hồ sơ cummins-inc, stamford-avk-china thay bằng bản trong nhánh; scratchpad `measure7.mjs`, `keys.mjs`, `choke2.mjs`)
| Chỉ số | Trước (#513) | Sau |
|---|---|---|
| Động cơ có kWm hãng theo tốc độ | 1 (QSL9-G5) | **14** |
| Khoá model đầu phát có hiệu suất có nhãn | 21 model | **38** (35 ở 50 Hz) |
| Khoá model đầu phát có kVA có nhãn | 34 | **143** |
| Dòng tổ máy có đầu phát mang nhãn | 344 | 1.133 |
| Dòng có kWm hãng (động cơ trên, dòng ghi tần số) | 0 | 130 (KTA50-G3 130 dòng là chính) |
| Toàn danh mục: dòng tính được cân bằng công suất | 0 | **0** |
| 12 configmatch: cấu hình tính được | 0/57 | **0/57** |
| Cảnh báo "thiếu công suất" | 0 | **0** (không có ca nào để đối chiếu) |
| Câu hỏi kVA có nhãn | 25 | 26 |

**Vì sao vẫn 0:** trong 130 dòng có kWm hãng và ghi tần số, KHÔNG dòng nào có đầu phát có hiệu suất đúng tần số: 68 dòng không ghi đầu phát; còn lại dùng Stamford S6L1D-H41 / G41 / D41 (18), S7L1D-C41 (3), S4L1D-C41 / G41 (6), Leroy-Somer LSA50.2, Mecc Alte ECO, đầu phát TQ (ELS/EL/SG/BW 404…). Các tờ S6L1D / S7L1D / S4L1D-C,G nằm ngoài danh sách giới hạn của việc này → không tải. Ngược lại, các đầu phát vừa có hiệu suất (HCI5D/5E, UCI274E/H, UCDI274J/K, S4L1D-D41/E41) lại đi với động cơ Cummins đuôi -G2 / Perkins chưa có kWm hãng.

## 6. Đề xuất (chờ quyết)
- Tải thêm tờ TD winding 311 của S6L1D-D41/G41/H41, S7L1D-C41, S4L1D-C41/G41 (cùng mẫu S-range, stamford-avk.com; tên tệp kiểu `A0xxxxxx-S6L1D-H4-x-W311.pdf` lấy từ tìm kiếm): mở được tối đa ~27 dòng có KTA50-G3/KTA19-G4/QSK… — ước tính, chưa đo.
- Cummins -G2 (DCEC/CCEC) và Perkins: cần một kênh đọc được của hãng (người tải tay PDF từ trang perkins.com / cummins.com rồi đưa vào `sources/`), vì tải tự động bị chặn.

## 7. Rủi ro còn lại
- Ratings Book là ấn bản 2021 (Ed4); tờ TD có thể mới hơn — hai nguồn khớp ở mọi ca đã đối chiếu; nếu lệch, `altColumns` lấy khoảng của cả hai.
- KTA38-G3 ≠ KTA38-G2 / G2A trong danh mục: không gộp (khác định mức).
- Hồ sơ cummins-inc / stamford-avk-china trên web chỉ đổi khi luồng đăng dữ liệu NCC thông thường chạy sau khi gộp (verify / upload như các PR dữ liệu trước).

## 8. Quay lui
Revert PR #514 (xoá nguồn mới, mục sources, bảng datasheet mới; bộ đọc trở về #513). Catalog không đổi nên không ảnh hưởng gợi ý hiện có.
