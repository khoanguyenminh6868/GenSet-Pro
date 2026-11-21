# chua-ro-tu-datasheet bước 1: vì sao check "chưa rõ" dù tờ hãng có số (21/11/2026)

Chỉ đọc, CHƯA sửa mã. Mẫu chính: IB2600603983 cấu hình #2 (Baudouin 6M31G825/5 + LSA 49.3 M8 + DSE7320 MKII + DSE890 MKII). Đo trên nhánh `fix/bo-doc-tieu-hao` (#1022), kết quả web chụp 21/11. Script ở `dau-vao\chua-ro-datasheet\` (`dem-nguon.mjs`, `dem-nguon.txt`, `khac-va-goc.mjs`, `c2-nguon.mjs`).

## Kết luận
Ba nguyên nhân khác nhau, không phải một lỗi đọc:
1. **Tờ hãng có số, code không đọc tới** (tốc độ, kiểu 4 kỳ, phun, nhiên liệu, tần số, công suất động cơ của #2). Sửa được bằng code.
2. **Code đọc được nhưng ghi sai câu** (AVR D350, tiêu chuẩn IEC 60034 của LSA bị ghi "nguồn không nói tới"). Sửa được, rẻ nhất.
3. **Nguồn đã lưu thật sự không có** (đa số mục BĐK, nhận tải, bình giảm thanh, QCVN 19:2024, BS 5514/1). Không sửa bằng code đọc: cần thêm tài liệu hoặc hỏi NCC.

## Cấu hình #2, theo mục
| Mục | Nguồn đã lưu | Vì sao chưa rõ | Nhóm |
|---|---|---|---|
| Tốc độ quay | baudouin n1021 bảng `RPM … 1500` | bảng có tiêu đề, không có model nên không thành bản ghi; `speed` thuộc `ROW_ONLY` | A, B, C |
| Công suất động cơ | n1021 `1500, 680, 912, 740, 992` | như trên | B |
| Kiểu động cơ, nhiên liệu | n1021 `Thermodynamic Cycle, Diesel 4 stroke` | nhãn không có trong `SPECS`; check nhiên liệu thuộc part genset | A, D |
| Hệ thống phun | n1021 `Injection System, Direct`; `High Pressure Common Rail` | nhãn không có trong `SPECS` | A |
| Tần số | LSA `Ratings 50 Hz - 1 500 R.P.M.`; baudouin n115, n1005 freq 50 | `freqChecks` chỉ đọc dòng tổ máy + số cực | D |
| Tiêu hao 100/75/50 % | n1021 | đã sửa ở #1022, chưa merge | xong khi merge |
| AVR | LSA n1012 `AVR type, D350`; `± 0.25%`; có ở `alternator.options` | `confirmChecks` ghi "nguồn của cấu hình không nói tới" | E |
| Tiêu chuẩn đầu phát | LSA n1012: IEC 60034, NEMA MG 1.32-33, ISO 8528-3 | như trên. **BS 5514/1 không có** trong n1012 và mọi tệp leroy-somer-fuzhou | E + hỏi NCC |
| BĐK đo lường, cảnh báo, bảo vệ | DSE n1001 không có power factor, speed, battery, oil, overspeed, overcurrent, reverse, short | thiếu nguồn: cần operator manual | F |
| AMF 4/5 | thiếu "Cài đặt, hiệu chỉnh tần số qua hệ thống điều tốc"; n1001 không có governor / speed control / droop, chỉ có ECU, CAN | thiếu nguồn; agent chấm đúng là chưa rõ | F |
| Xuất xứ động cơ | xem mục riêng | ghi chú của agent sai | G |
| QCVN 19:2024 | n1021 `Emission standard, N/A` | không nguồn nào nêu | giữ, hỏi NCC |
| Nhận tải một bước, bình giảm thanh | n1021 không có dòng nào | thiếu nguồn | giữ, hỏi NCC |

## Đếm rộng (17 lượt, 12 có cấu hình, 53 cấu hình, 1.286 check chưa rõ / cần xác nhận)
"Có dòng" = nguồn của chính cấu hình có dòng chứa từ khoá. Đây là **trần trên, chưa phải số sửa được**: nguồn dòng NCC là cả bảng, dòng có thể của model khác hoặc chỉ là tiêu đề cột (rõ nhất ở Công suất động cơ 25/26). Tôi chưa soát từng dòng; phải soát khi làm từng nhóm.

| Mục | Chưa rõ (có dòng) | Xác nhận (có dòng) |
|---|---|---|
| Tiêu hao | 93 (18) | 0 |
| Nhiên liệu | 22 (14) | 48 (36) |
| Làm mát | 46 (2) | 12 (0) |
| Tần số | 33 (13) | 0 |
| Kiểu động cơ | 32 (1) | 0 |
| Công suất động cơ | 26 (25, phần lớn là tiêu đề) | 0 |
| Tốc độ quay | 25 (2) | 0 |
| Hệ thống phun | 24 (1) | 0 |
| Công suất đầu phát | 20 (15, phần lớn là tiêu đề) | 0 |
| Điều tốc | 20 (1) | 0 |
| Khí thải | 18 (2) | 0 |
| Cách điện | 26 (1) | 0 |
| IP | 13 (2) | 10 (0) |
| AVR / ổn áp | 5 (1) | 22 (8) |
| Tiêu chuẩn đầu phát | 2 (0) | 34 (1) |
| Nhận tải | 22 (0) | 0 |
| BĐK, tính theo PHẦN của check gộp | điện áp/tần số 62 (23), nhiệt độ 60 (21), áp dầu 57 (10), ắc quy 41 (18), ngắn mạch/quá dòng 38 (4), tốc độ 36 (10), giờ/nhật ký 32 (9), hệ số CS 19 (4), công suất ngược 11 (0), phần khác 176 (chưa phân loại) | 0 |

Chưa phân nhóm: 632 check, 78 tên mục (Số pha 46, Hệ thống khởi động 35, Vỏ cách âm 33, Điện áp 29, Ắc quy 28, Độ ồn 26…). Chưa đếm "có dòng" cho nhóm này.

**Đọc số:** phần lớn mục có rất ít dòng ứng viên, nên nút thắt chung là **THIẾU NGUỒN** (nhất là dòng NCC chỉ có vài cột), không phải lỗi đọc. Sửa code sẽ cứu được các cấu hình có tờ hãng đầy đủ như #2, không xoá được phần lớn "chưa rõ".

## Xuất xứ động cơ (17 check)
- 5 check HSMT đòi NƠI SẢN XUẤT: code chấm "cần chứng từ (CO)", đúng.
- 6 check HSMT ghi "Nhà sản xuất / nhãn hiệu thuộc G7, EU" (`madeBasisOf` = brand, có #2): `madeChecks` bỏ qua, để agent chấm. Agent ghi "Dòng của nhà cung cấp không ghi hãng, cần CO". Với #2 câu này **sai**: tiêu đề bảng agg-fuzhou n107 có 博杜安 (Baudouin).
- 6 check còn lại: `madeBasisOf` không xác định (null), agent chấm.
- Baudouin: `ENGINE_COUNTRY` = FR, tờ n1021 ghi Cassis / France; code có chú thích Weichai sản xuất Baudouin theo licence. Thương hiệu Pháp nhưng nơi sản xuất của lô hàng chưa biết.

## AMF 4/5
Agent chấm đúng theo nguồn. Câu trả lời có thể nằm trong operator manual (nhóm F), chưa đọc nên chưa kết luận.

## URL operator manual DSE7320 MKII (từ kết quả tìm kiếm, trang downloads chính hãng)
https://www.deepseaelectronics.com/genset/manual-auto-start-control-modules/dse7310-mkii/downloads/operators-manual/855 (tài liệu 057-253, dùng chung DSE7310/7320 MKII). Chưa tải, chưa đọc.

## Đề xuất theo nhóm
| Nhóm | Sửa gì | Tệp | Rủi ro | Cần đo | Cần Khoa quyết |
|---|---|---|---|---|---|
| **E. Câu sai của `confirmChecks`** (làm trước) | Trước khi ghi "nguồn không nói tới", tìm trong nguồn đầu phát; có thì chấm hoặc trích dòng | `config-bot.mjs` | thấp; chỉ đụng AVR, tiêu chuẩn. Tiêu chuẩn phải so ĐÚNG mã HSMT đòi (BS 5514/1 không được đạt nhờ IEC 60034) | check-all | Không |
| **A. Nhãn thiếu trong `SPECS`** | Thêm Thermodynamic Cycle, Injection System, Fuel System | `catalog.js`, `spec-norm.js` | trung bình: nhãn mới đổi điểm và bảng ứng viên | quality, spec-diff, check-all | Không |
| **B. Bảng tờ hãng không có model** | Gắn theo tiêu đề tờ, chỉ khi tờ chỉ nói về MỘT model | `config-bot.mjs` (`modelFacts`) | **cao**: tờ nhiều model gán nhầm. Chưa làm được với Spec Sheet 1008–1020 không liệt kê model | kiểm chéo mọi fact mới so với NCC khác | Không |
| **C. `speed` ở `ROW_ONLY`** | Cho vào fact khi từ tờ hãng động cơ, không lấy từ dòng NCC | `config-bot.mjs` | trung bình: động cơ chạy 1500 và 1800 phải giữ cả hai, so theo tần số HSMT | check-all | Không |
| **D. Check genset đọc tờ động cơ / đầu phát** | Nhiên liệu, tần số của tổ máy suy từ tờ bộ phận | `config-bot.mjs` (`freqChecks`, `fuelChecks`) | trung bình | check-all, top 30 | **Có (Q1)** |
| **F. Bổ sung manual BĐK** | Lưu operator manual DSE vào nguồn; làm thử 1 hãng | `suppliers/cn/deep-sea-electronics.json` | trung bình: manual mô tả cả dòng, có thể có chức năng tuỳ chọn; tốn token đọc | quality, top 30 | **Có (Q2)** |
| **G. Xuất xứ theo nhãn hiệu** | Code chấm khi HSMT đòi "nhãn hiệu" và nguồn có hãng | `config-bot.mjs` | **cao**: quyết định loại / đạt của gói | check-all, soát tay mọi dòng đổi | **Có (Q3)** |

Thứ tự đề xuất: E → A → C → D → B; F, G sau khi Khoa trả lời. Làm SAU khi #1022 xong vì cùng tệp.

## Khoa đã trả lời (21/11/2026, điều phối chuyển lời): "1. có 2. có 3. cho đạt theo thương hiệu"
- Q1 CÓ, ghi rõ nguồn là động cơ / đầu phát. Q2 CÓ, bắt đầu DSE7320 MKII, chức năng tuỳ chọn → "cần xác nhận" (nhóm F: điều phối giao phiên riêng). Q3 ĐẠT THEO THƯƠNG HIỆU + ghi chú "nơi sản xuất cần CO"; chỉ khi hãng nguồn ghi (`keptMakes`) thuộc nhóm HSMT nêu, chưa rõ hãng vẫn chưa rõ; HSMT đòi NƠI SẢN XUẤT vẫn cần CO. Nhóm G phải soát tay, liệt kê hết mọi check xuất xứ đổi.
- Thứ tự (điều phối): xong bo-doc-tieu-hao-3 trước; khi #1022 merge thì E → A → C → D → G → B, mỗi nhóm hoặc cụm nhỏ một PR draft, không merge.

## Câu đã hỏi Khoa
- **Q1.** Tổ máy dùng động cơ tờ hãng ghi Diesel, đầu phát ghi 50 Hz: có chấm "đạt" nhiên liệu và tần số của tổ máy không? Đề xuất: **có**, ghi rõ nguồn là động cơ / đầu phát.
- **Q2.** Có lưu operator manual của BĐK vào nguồn không (bắt đầu từ DSE7320 MKII)? Đề xuất: **có**, chỉ chấm chức năng manual ghi là có sẵn, chức năng tuỳ chọn để "cần xác nhận".
- **Q3.** HSMT đòi "Nhà sản xuất / nhãn hiệu thuộc G7, EU", động cơ Baudouin (thương hiệu Pháp; chú thích trong `catalog.js` ghi Weichai sản xuất Baudouin theo licence, chưa kiểm nguồn ngoài): chấm thế nào? Đề xuất: **"cần xác nhận"**, ghi "thương hiệu Pháp, nơi sản xuất cần CO"; không chấm đạt thẳng.
