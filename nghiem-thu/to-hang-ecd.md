# to-hang-ecd: AVR, tiêu chuẩn, tốc độ, nhiên liệu, tần số từ tờ hãng (nhóm E, C, D; 22/11/2026)

PR draft #1086, nhánh `fix/chua-ro-tu-hang-1`, chưa merge. Đo `check-all` trên bản chụp 21/11 (có 6M31G825/5), gốc dccc4669 ↔ nhánh có luật chặn tốc độ. Script: `dau-vao\chua-ro-ecd\` (`check-all.mjs`, `ds-doi.mjs`, `do-toc-do.mjs`). Kết quả thô có chữ HSMT nằm ở `doc-cache\soat-ecd\`, không ở sổ.

## Kết quả
- 17 lượt, 47 cấu hình: **9 cấu hình đổi, 21 check đổi**, ở 2 gói (IB2600603983: 18; IB2600586587: 3). Thứ tự cấu hình không đổi, 0 cấu hình mất, chạy `check` hai lần giống nhau ở cả 17 lượt.
- AVR: 9 cần xác nhận → đạt. Tốc độ, nhiên liệu, tần số: mỗi mục 2 chưa rõ → đạt, đều ở 6M31G825/5.
- Tiêu chuẩn đầu phát: 6 check giữ "cần xác nhận (chứng từ)", nay ghi tờ hãng có ISO 8528-3, IEC 60034, NEMA MG 1.32-33, không có BS 5514/1.

## Lỗ điều phối chỉ ra (22/11/2026): đã sửa
Bản 13205ef9 lấy tốc độ từ tờ động cơ mà không nhìn dòng tổ máy; nhánh tần số cũng lọt khi dòng ghi 1800 v/p mà không ghi Hz. Luật mới: tờ động cơ chỉ quyết khi ghi **đúng một tốc độ** và dòng tổ máy (tiêu đề, dòng, tên bảng, ô cột Speed) **không tự ghi v/p hoặc Hz khác** (`rowRunOf`).

- Bằng chứng `do-toc-do.mjs`: 6M31G660/6 không có tờ một model. weichai-heavy-machinery và weichai-power ghi 1800 v/p, baudouin ghi 60 Hz: đều bị chặn nếu sau này có tờ.
- Luật mới không đổi check nào trên 17 lượt so với bản trước: lỗ có thật trong mã, chưa gây sai ở lượt đã chụp.
- Phạm vi C / D hiện rất hẹp: chỉ 2 động cơ có tờ một model đọc được tốc độ (6M31G825/5 1500 v/p, Y4102G 3000 v/p).

## Danh sách đủ 21 check đổi
| Gói | Cấu hình | Check | Trước → sau | Giá trị (tờ hãng) | Dòng nguồn |
|---|---|---|---|---|---|
| IB2600586587 | 6CTA8.3-G2 + UCI274H + HGM6120CAN | Điều chỉnh điện áp (AVR) | cần xác nhận → đạt | AVR AS440 (tờ hãng) | / AS440 AVR - STANDARD / SHAFT & KEYS |
| IB2600586587 | 1106A-70TAG3 + UCI274G + HGM6120N | Điều chỉnh điện áp (AVR) | cần xác nhận → đạt | AVR AS440 (tờ hãng) | / AS440 AVR - STANDARD / SHAFT & KEYS |
| IB2600586587 | TAD752GE + UCI274H + HGM6120N | Điều chỉnh điện áp (AVR) | cần xác nhận → đạt | AVR AS440 (tờ hãng) | / AS440 AVR - STANDARD / SHAFT & KEYS |
| IB2600603983 | TWD1673GE + LSA 49.3 M8 + InteliLite 4 AMF8 | Tiêu chuẩn đầu phát | cần xác nhận → cần xác nhận | ISO 8528-3, IEC 60034, NEMA MG 1.32-33 (tờ hãng) | The Leroy-SomerTM LSA49.3 alternator meets all key international standards and regulations such as IEC 60034, NEMA MG 1.32-33, ISO 8528-3, CSA C22.2 n°100-14, U |
| IB2600603983 | TWD1673GE + LSA 49.3 M8 + InteliLite 4 AMF8 | Điều chỉnh điện áp (AVR) | cần xác nhận → đạt | AVR D350 (tờ hãng) | / AVR type / D350 |
| IB2600603983 | 6M31G825/5 + LSA 49.3 M8 + DSE7320 MKII | Tần số | chưa rõ → đạt | 50 Hz (động cơ 1.500 v/p, đầu phát có định mức 50 Hz) | / 1500 / 680 / 912 / 740 / 992 / 663 / 889 / 723 / 970 / Ratings 50 Hz - 1 500 R.P.M. |
| IB2600603983 | 6M31G825/5 + LSA 49.3 M8 + DSE7320 MKII | Nhiên liệu | chưa rõ → đạt | Diesel (động cơ, tờ hãng) | / Thermodynamic Cycle / Diesel 4 stroke |
| IB2600603983 | 6M31G825/5 + LSA 49.3 M8 + DSE7320 MKII | Tốc độ quay | chưa rõ → đạt | 1.500 v/p | / 1500 / 680 / 912 / 740 / 992 / 663 / 889 / 723 / 970 |
| IB2600603983 | 6M31G825/5 + LSA 49.3 M8 + DSE7320 MKII | Tiêu chuẩn đầu phát | cần xác nhận → cần xác nhận | ISO 8528-3, IEC 60034, NEMA MG 1.32-33 (tờ hãng) | The Leroy-SomerTM LSA49.3 alternator meets all key international standards and regulations such as IEC 60034, NEMA MG 1.32-33, ISO 8528-3, CSA C22.2 n°100-14, U |
| IB2600603983 | 6M31G825/5 + LSA 49.3 M8 + DSE7320 MKII | Điều chỉnh điện áp (AVR) | cần xác nhận → đạt | AVR D350 (tờ hãng) | / AVR type / D350 |
| IB2600603983 | 6M31G825/5 + LSA 49.3 M8 + DSE7420 | Tần số | chưa rõ → đạt | 50 Hz (động cơ 1.500 v/p, đầu phát có định mức 50 Hz) | / 1500 / 680 / 912 / 740 / 992 / 663 / 889 / 723 / 970 / Ratings 50 Hz - 1 500 R.P.M. |
| IB2600603983 | 6M31G825/5 + LSA 49.3 M8 + DSE7420 | Nhiên liệu | chưa rõ → đạt | Diesel (động cơ, tờ hãng) | / Thermodynamic Cycle / Diesel 4 stroke |
| IB2600603983 | 6M31G825/5 + LSA 49.3 M8 + DSE7420 | Tốc độ quay | chưa rõ → đạt | 1.500 v/p | / 1500 / 680 / 912 / 740 / 992 / 663 / 889 / 723 / 970 |
| IB2600603983 | 6M31G825/5 + LSA 49.3 M8 + DSE7420 | Tiêu chuẩn đầu phát | cần xác nhận → cần xác nhận | ISO 8528-3, IEC 60034, NEMA MG 1.32-33 (tờ hãng) | The Leroy-SomerTM LSA49.3 alternator meets all key international standards and regulations such as IEC 60034, NEMA MG 1.32-33, ISO 8528-3, CSA C22.2 n°100-14, U |
| IB2600603983 | 6M31G825/5 + LSA 49.3 M8 + DSE7420 | Điều chỉnh điện áp (AVR) | cần xác nhận → đạt | AVR D350 (tờ hãng) | / AVR type / D350 |
| IB2600603983 | QSK19-G20 + LSA 49.3 M8 + Deepsea 7320 | Tiêu chuẩn đầu phát | cần xác nhận → cần xác nhận | ISO 8528-3, IEC 60034, NEMA MG 1.32-33 (tờ hãng) | The Leroy-SomerTM LSA49.3 alternator meets all key international standards and regulations such as IEC 60034, NEMA MG 1.32-33, ISO 8528-3, CSA C22.2 n°100-14, U |
| IB2600603983 | QSK19-G20 + LSA 49.3 M8 + Deepsea 7320 | Điều chỉnh điện áp (AVR) | cần xác nhận → đạt | AVR D350 (tờ hãng) | / AVR type / D350 |
| IB2600603983 | V20 TE2 + LSA 49.3 M8 + DSE7320 MKII | Tiêu chuẩn đầu phát | cần xác nhận → cần xác nhận | ISO 8528-3, IEC 60034, NEMA MG 1.32-33 (tờ hãng) | The Leroy-SomerTM LSA49.3 alternator meets all key international standards and regulations such as IEC 60034, NEMA MG 1.32-33, ISO 8528-3, CSA C22.2 n°100-14, U |
| IB2600603983 | V20 TE2 + LSA 49.3 M8 + DSE7320 MKII | Điều chỉnh điện áp (AVR) | cần xác nhận → đạt | AVR D350 (tờ hãng) | / AVR type / D350 |
| IB2600603983 | 2806A-E18TTAG4 + LSA 49.3 M8 + DSE7320 | Tiêu chuẩn đầu phát | cần xác nhận → cần xác nhận | ISO 8528-3, IEC 60034, NEMA MG 1.32-33 (tờ hãng) | The Leroy-SomerTM LSA49.3 alternator meets all key international standards and regulations such as IEC 60034, NEMA MG 1.32-33, ISO 8528-3, CSA C22.2 n°100-14, U |
| IB2600603983 | 2806A-E18TTAG4 + LSA 49.3 M8 + DSE7320 | Điều chỉnh điện áp (AVR) | cần xác nhận → đạt | AVR D350 (tờ hãng) | / AVR type / D350 |
