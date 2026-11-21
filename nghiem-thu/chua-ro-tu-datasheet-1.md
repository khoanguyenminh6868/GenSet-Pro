# chua-ro-tu-datasheet bước 1 (DỞ, hết hạn mức 21/11/2026): IB2600603983 cấu hình #2 Baudouin 6M31G825/5 + LSA 49.3 M8 + DSE7320 MKII

Chỉ đọc, không sửa mã. Đo trên nhánh `fix/bo-doc-tieu-hao` (#1022). Tệp: `dau-vao\chua-ro-datasheet\` (`configmatch.json` chụp lúc này, `c2.txt` mọi mục chưa đạt, `c2-nguon.mjs`).

## Theo mục (đã soát)
| Mục | Nguồn đã lưu có gì | Vì sao không tới check | Đề xuất |
|---|---|---|---|
| Tốc độ quay | baudouin 1021 bảng `RPM … 1500`; dòng WPG825*7 của weichai ghi 1500 | bảng 1021 có tiêu đề, không có model nên không thành bản ghi; `speed` thuộc `ROW_ONLY`, không vào fact động cơ | code đọc từ tờ hãng |
| Công suất động cơ | 1021 `1500, 680, 912, 740, 992`; n115 / n1005 `680, 740` | `specs` của các dòng này rỗng: không có fact `engPower` | code đọc PRP / ESP từ tờ hãng |
| Kiểu động cơ | `Thermodynamic Cycle, Diesel 4 stroke`; `Cooling System, Liquid` | có fact `cooling`; nhãn Thermodynamic Cycle không có trong SPECS | thêm nhãn, code chấm |
| Hệ thống phun | `Injection System, Direct`; `Fuel System, High Pressure Common Rail`; `Governor, ECU` | hai nhãn đầu không có trong SPECS; chỉ có fact `gov` | thêm nhãn, code chấm |
| Nhiên liệu | `Diesel 4 stroke` | như trên; check part genset | chấm từ tờ động cơ |
| Tần số | baudouin n115 / n1005 đọc freq 50; LSA `Ratings 50 Hz - 1 500 R.P.M.` | dòng agg-fuzhou không ghi tần số; `freqChecks` chỉ đọc dòng tổ máy + số cực | chấm từ tờ động cơ / đầu phát |
| Tiêu hao 100 / 75 / 50 % | 1021 | đã sửa ở #1022 (kết quả trên web chưa chạy lại) | xong khi merge |
| Tiêu chuẩn đầu phát | LSA 1012 dòng 15-16: IEC 60034, NEMA MG 1.32-33, ISO 8528-3 | agent không có check, `confirmChecks` tự ghi "nguồn không nói tới": câu đó SAI với nguồn | code chấm; BS 5514/1 CHƯA kiểm có trong tờ không |
| AVR | LSA 1012 `AVR type, D350`; `Voltage regulation ± 0.25%`; có cả ở `alternator.options` | như trên | code chấm |
| BĐK đo lường, cảnh báo, bảo vệ | DSE 1001 không có các chữ power factor, speed, battery, oil, sensor, overspeed, overcurrent, reverse, short | THIẾU NGUỒN | cần operator manual DSE7320 MKII; CHƯA tìm URL |
| Khí thải QCVN 19:2024 | 1021 `Emission standard, N/A`; weichai "Non-Road Emission Exempt" | không nguồn nào nêu QCVN | giữ chưa rõ / NCC xác nhận |
| Nhận tải một bước, bình giảm thanh | 1021 không có dòng nào (chỉ số liệu khí xả) | thiếu nguồn | giữ, hỏi NCC |

## CHƯA LÀM
- (d) Rà rộng 17 lượt, đếm theo mục: chưa chạy.
- Tìm URL chính hãng operator manual DSE7320 MKII.
- Xuất xứ động cơ ("dòng NCC không ghi hãng, cần CO"; tiêu đề bảng agg-fuzhou có 博杜安): chưa phân tích, chưa rõ có cần Khoa quyết.
- Mục "Khởi động / AMF 4/5" (hiệu chỉnh tần số qua điều tốc): chưa soát.
