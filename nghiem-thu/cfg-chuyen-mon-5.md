# Nghiệm thu cfg-chuyen-mon-5 — Đọc lại datasheet đã lưu, giữ tiêu đề cột

PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/513 (draft, nhánh `cfg-cols` trên origin/main f70acc5; commit c5af01f, 4f831c9). Khoa duyệt 11/11 ("ok, làm đi"): đọc lại, KHÔNG cào / tải nguồn mới.

## 1. Vì sao mất tiêu đề cột
- Chữ PDF lưu ở `suppliers/sources/<id>/<n>.md` (maker-datasheets, `pdftotext`) VẪN có khối định mức đầy đủ. Ví dụ Stamford UCI274C (`stamford-avk-china/1002.md`, https://www.stamford-avk.com/sites/stamfordavk/files/UCI274C-311-TD-EN_Rev_D.pdf): "RATINGS / | Class - Temp Rise | Cont. F - | 105/40°C | Cont. H - 125/40°C / | Standby - | 150/40°C / | Standby - | 163/27°C / | 50 | Series Star (V) | 380 | 400 | 415 | 440 | …". Leroy-Somer TAL-A44 (`leroy-somer-fuzhou/1003.md`, https://www.leroy-somer.com/documentation_pdf/6610_en.pdf): "Ratings 50 Hz - 1500 R.P.M. / | Duty/T°C | Continuous/ 40°C | … | Stand-by/ 27°C / | Class/T°K | H:125K | F:105K | H:150K | H:163K / | Phase | 3ph. | 1ph. … / | Y | 380V | 400V 415V 440V* …".
- `specTables` tách từ chữ đó (merge-specs / catalog đọc từng dòng "| nhãn | số …") chỉ giữ các dòng số; dòng tiêu đề (tần số, chế độ, cấp nhiệt, pha, điện áp) bị bỏ vì không phải "nhãn | giá trị". Không phải lỗi của `catalog.js` lúc đọc, và `pdftotext` không làm mất chữ — chỉ làm vài ô rơi / dính số (xem dưới).
- PDF làm hỏng cục bộ: khối 50 Hz của Stamford ngắt mỗi cấp nhiệt thành một dòng ("| kVA | 84.0 | 84.0 | 84.0 / | N/A | 100.0 100.0 100.0 / …"); Wintpower cắt chữ ("| C | nt. H", "| St | andb … | y | y"); Leroy-Somer dính số ("103.2108.0"); tờ Stamford "Winding 14" ghi tần số trên dòng "| 60Hz | RATINGS".
- Phát hiện kèm: bảng TAL-A44 đã lưu CHỈ có khối 50 Hz cho kVA đầy đủ (khối 60 Hz có nhưng nhiều số dính) — các "cảnh báo kVA" của bản đầu PR 3 (jet-power 60 Hz) đúng là so sai cột như điều phối nhận định.

## 2. Sửa — đọc lại có nhãn (không sửa tệp nguồn, không sửa dữ liệu NCC, không sửa catalog.js)
- `suppliers/ratings.mjs` (mới):
  - `stamfordRatings` (Stamford + Wintpower): mỗi số mang {tần số, chế độ Cont./Standby, độ tăng nhiệt "105/40°C"…, điện áp Series Star, pha 3}, kVA / kW / hiệu suất; hàng chạy sang dòng "| N/A …" được nối; chữ bị cắt đọc sau khi bỏ "|" và khoảng trắng ("St|andb" → Standby); tần số ở dòng điện áp hoặc trên dòng "| 60Hz | RATINGS".
  - `lsRatings` (Leroy-Somer TAL): {tần số, chế độ, cấp "H:125K Continuous/ 40°C", pha 3/1, điện áp}; cột 440V* chỉ khi hàng có đủ ô cho nó.
  - `cumminsRatings` (Cummins Specification Sheet): kWm gross / net theo Standby / Prime / Base ở "1500 rpm (50 Hz Ratings)" / "1800 rpm (60 Hz Ratings)".
  - Số ô của hàng không khớp số cột → BỎ hàng (không đoán cột). Mỗi mục giữ các dòng nguyên văn đã dùng (`lines`).
- `suppliers/config-bot.mjs`:
  - `sourceRatings(suppliers)`: chỉ đọc tệp `sources/<id>/<n>.md` mà hồ sơ NCC có nguồn `n` đó; đọc một lần mỗi tiến trình (1,4 s cho 431 NCC, 50 MB nguồn).
  - `altColumns(list, { hz, rating, reqs })`: tần số của dòng tổ máy (bắt buộc), chế độ của mức (prime → Cont., standby → Standby), 3 pha, điện áp HSMT nếu datasheet có cột đó (không thì mọi điện áp của datasheet); hiệu suất / kVA = khoảng trên các cột còn lại (Cont. F 105/40 và H 125/40).
  - `comboChecks`: hiệu suất có nhãn thay cho khoảng mọi số (ghi rõ "datasheet UCI274C: Cont. 105/40°C / 125/40°C, 50 Hz, 400 V"); câu hỏi kVA đầu phát dùng cột có nhãn (vẫn chỉ là câu hỏi rfq, không cảnh báo); kWm net của hãng động cơ (theo tốc độ trong datasheet) thành thông số theo model (`engPrime` / `engStandby`, maker khi NCC cùng họ hãng — cummins-inc).
  - Điều kiện an toàn #507 giữ nguyên: kWm của hãng động cơ hoặc ≥ 2 nguồn ≤ 3%, dòng tổ máy phải ghi tần số, tốc độ khớp tần số.
- `suppliers/ratings.test.mjs` (mới, 5 test: Stamford cả hai khối + chữ bị cắt + hàng rơi ô + Winding 14; Leroy-Somer có / không cột 440V*; Cummins có ký tự ngắt trang; altColumns; sourceRatings chỉ đọc nguồn có trong hồ sơ).
- `catalog.js` KHÔNG đổi → `build()` / `builder().step` không đổi (không cần so md5).

## 3. Lệnh kiểm + đầu ra thật
```
cd wt-cfg-g7/suppliers && node --test
# pass 189
# fail 0
```
Đối chiếu nguyên văn (scratchpad `rsurvey.mjs`): đọc mọi tệp nguồn của mọi NCC → 24 tệp có khối định mức đọc được; mọi dòng trong `lines` của mọi mục đều có y hệt trong tệp nguồn: **0 dòng lệch**. (`verify.mjs` kiểm hồ sơ NCC; PR này không sửa hồ sơ nên không có gì mới để nó kiểm — phép đối chiếu trên làm thay cho phần dữ liệu đọc thêm.)
CI PR #513 (run 42955903493, 4f831c9): app pass 1m5s, server pass 9s, suppliers pass 12s.

## 4. Số đo trước / sau (ĐO; doc-cache supplier 10/11; "trước" = cùng script trên worktree tạm origin/main f70acc5; scratchpad `measure6.mjs`, `choke.mjs`, `missing.mjs`)
| Chỉ số | Trước | Sau |
|---|---|---|
| Model đầu phát có hiệu suất có nhãn cột | 0 | 21 (Stamford 8: UCI224F, UCI274C/D/F/G, PI044F/G, PI144H; Wintpower 13: WT224D/E, WT274C/E/F/K, WT434D/444D, WT444E/F, WT544C, WT534D/544D, WT544E, WT534F/544F) |
| Model đầu phát có kVA có nhãn cột | 0 | 34 (21 trên + Leroy-Somer 13: TAL-A40-C…G, TAL-A44-C/D/E/H/J/K/L/M) |
| Động cơ có kWm theo tốc độ của hãng | 0 | 1 (Cummins QSL9-G5: 50 Hz prime net 257 kWm, standby 296; 60 Hz prime 296, standby 340) |
| Dòng tổ máy có đầu phát mang nhãn (29.003 dòng; 7.655 có model đầu phát) | 0 | 344 (160 ghi tần số; 122 có hiệu suất đúng tần số) |
| Toàn danh mục: dòng tính được cân bằng công suất | 0 | **0** |
| 12 configmatch: cấu hình tính được cân bằng công suất | 0/57 | **0/57** |
| Câu hỏi kVA đầu phát có nhãn cột (toàn danh mục) | 0 (12 câu theo khoảng, không nhãn) | 25 có nhãn (+12 cũ không nhãn ở các đầu phát chưa đọc được) |
| Cảnh báo (warnings) | 0 | 0 |
| Tỉ lệ "chưa rõ" của đầu phát | không đổi (không đổi trạng thái check nào) | |

**Vì sao cân bằng công suất vẫn 0:** chỗ nghẽn là công suất động cơ. Trong 122 dòng có hiệu suất đầu phát đúng tần số, KHÔNG dòng nào có kWm động cơ dùng được (theo quy tắc #507: của hãng động cơ hoặc ≥ 2 nguồn, ghi tốc độ). Động cơ của các dòng đó (số dòng): 1106A-70TAG3 (9), 6BT5.9-G2 (9), 6CTA8.3-G2 (7), 6BTAA5.9-G12 (6), WP4.1D100E200 (5), 1104C-44TAG2 (4), 6CTAA8.3-G2 (3), 1106A-70TAG2 (3), 4BTA3.9-G2 (2), NT855-GA (2), 1006TG2A (2), BF4M1013EC G2 (2), BF6M1013EC G2 (2), 1106C-P6TAG3 (2), các model Yuchai YC6…, Volvo TAD551GE/TAD751GE, FAW CA6D…, … (đủ trong `choke.mjs` đầu ra).

## 5. Mọi câu hỏi kVA có nhãn (25 dòng; không có cảnh báo nào) — để đối chiếu tay
Mỗi câu: "Xác nhận kVA định mức đầu phát ở cấp nhiệt chào (datasheet ghi <cột>: lớn nhất X kVA)" khi X < kVA prime của dòng tổ máy.
| NCC | Dòng tổ máy (rút gọn) | Tần số dòng | Đầu phát | kVA prime | Cột datasheet (Cont. 105/40 + 125/40) | lớn nhất |
|---|---|---|---|---|---|---|
| uleengen | UP90GF 72/90, 1104A-44TG2 (2 dòng) | 60 | UCI224F | 90 | 60 Hz, 380–416 V (tờ Winding 14) | 85 |
| keliang-fuan | WT-C140 100/125, 6BTA5.9-G2 | 50 | (Wintpower WT274…) | 125 | 50 Hz, 380–415 V | 100 |
| uleengen | UC135GF 108/135, 6BTA5.9-G2 (3 dòng) | 60 | UCI274D | 135 | 60 Hz, 380–416 V | 131,3 |
| keliang-fuan | WT-C206 150/188, 6CTA8.3-G2 | 50 | (Wintpower) | 188 | 50 Hz, 380–415 V | 160 |
| keliang-fuan | WT-C69 50/63, 4BTA3.9-G2 | 50 | (Wintpower) | 63 | 50 Hz, 380–440 V | 50 |
| keliang-fuan | WT-C303 220/275, NT855-GA | 50 | (Wintpower) | 275 | 50 Hz, 380–415 V | 250 |
| uleengen | UD140GF 112/140, BF4M1013FC (2 dòng) | 60 | UCI274D | 140 | 60 Hz, 380–416 V | 131,3 |
| wintpower | WT-L93 70/88, 1006TG1A | 60 | UCI224F | 88 | 60 Hz, 380–416 V | 85 |
| uleengen | UD90GF 72/90, BF4M2012CG1 (2 dòng) | 60 | UCI224F | 90 | 60 Hz, 380–416 V | 85 |
| uleengen | UD150GF 120/150, BF6M1013ECG1 (2 dòng) | 60 | UCI274D | 150 | 60 Hz, 380–416 V | 131,3 |
| kachai-hangzhou | S150D6 108/135, 4HTAA4.3-G23 | 60 | UCI274D | 135 | 60 Hz, 380–416 V | 131,3 |
| keliang-fuan | WT-FW70 50/63, 4DX23-78D | 50 | (Wintpower) | 63 | 50 Hz, 380–440 V | 60 |
| wintpower | WT-L150 110/138, 1006TAG1A | 60 | UCI274D | 138 | 60 Hz, 380–416 V | 131,3 |
| wintpower | WT-FA206 150/187, CA6DL1-24D | 50 | UCI274G | 187 | 50 Hz, 380–415 V | 182 |
| wintpower | WT-L179 130/163, 1106C-P6TAG3 | 50 | UCI274F | 163 | 50 Hz, 380–415 V | 160 |
| wintpower | WT-FA110 85/106, CA6DF2D-14D | 50 | UCI274C | 106 | 50 Hz, 380–415 V | 100 |
| keliang-fuan | 50/63, 4110/125Z-09D, WT-224E | 50 | WT224E | 63 | 50 Hz, 380–440 V | 60 |
| wintpower | WT-FA150 110/137, CA6DF2-18D | 60 | UCI274D | 137 | 60 Hz, 380–416 V | 131,3 |
| wintpower | WT-L200 146/183, 1106C-PATAG4 | 50 | UCI274G | 183 | 50 Hz, 380–415 V | 182 |
Dòng đầy đủ + nguồn (dòng nguyên văn của khối định mức): scratchpad `measure6-after.txt`.
Ví dụ đối chiếu: WT-FA110 — Stamford UCI274C (1002.md) 50 Hz Cont. F 84 kVA, Cont. H 100 kVA (400 V) → lớn nhất 100 < 106 kVA prime của tổ máy. UC135GF — Stamford UCI274D Winding 14 (1003.md, "| 60Hz | RATINGS") Cont. H 131,3 kVA ở 400/416 V < 135. Lưu ý: các dòng wintpower ghi nhiều đầu phát thay thế ("UCI 274G | TAL-A44-M | WT274G160"); code lấy đầu phát mà catalog gán cho dòng.

## 6. Model vẫn thiếu (để Khoa quyết có tải thêm không)
- **Datasheet đầu phát không đọc được dù đã lưu:** Wintpower WT164G (1001), WT734C (1015) — PDF rơi ô; Leroy-Somer LSA 40/42.3/46.3/49.3/50.2/52.3 (1007–1014) và trang 1005 — mẫu khác (chưa viết bộ đọc; có thể làm thêm nếu cần), TAL-A42/A46/A473/A49 (1002, 1004, 1006, 1009…) — chưa kiểm hết, hàng dính số bị bỏ.
- **Đầu phát hay gặp nhất chưa có datasheet định mức** (số dòng tổ máy): HCI544C (56), UCI274H (46), S1L2-Y1 (44), UCDI 274K1 (43), UCI224G (42), UCI274E (41), LSA50.2 M6 (41), HCI444D (37), HCI544D (34), HCI544E (32), S0L2-P1 (29), ASG274C (29), S4L1D-D41 (28), S1L2-J1 (28), HCI444E/F (27), S4L1D-E41 (27), S6L1D-D41 (27), HCI444FS (26), PI734C (26), S7L1D-C41 (26), EL 274K (26), EL 354C (26), UCDI274J (25), ASG314F (25).
- **Động cơ hay gặp nhất chưa có kWm theo tốc độ của hãng** (số dòng): 4BTA3.9-G2 (176), 6BT5.9-G2 (165), 6CTA8.3-G2 (142), KTA50-G3 (130), 6BTAA5.9-G2 (123), 6LTAA8.9-G2 (121), 4BTA3.9-G11 (119), 4BT3.9-G2 (117), 6BTA5.9-G2 (115), 4B3.9-G2 (114), 1103A-33G (112), 1103A-33TG1 (111), KTA38-G2 (110), 6CTAA8.3-G2 (109), KTA38-G2A (108), 1103A-33TG2 (101), 4012-46TWG2A (99), 1104A-44TG2 (98), KTA19-G3A (98), 6BTAA5.9-G12 (98), 1104C-44TAG2 (97), KTA19-G3 (97), 1106A-70TAG3 (96), KTA38-G9 (95), 4006-23TAG3A (93) … (Cummins / Perkins là chính). Perkins trên web chỉ ghi khoảng ("140-204 kWm") nên cần datasheet PDF của hãng.
- Cân bằng công suất chỉ chạy được khi có CẢ kWm động cơ của hãng theo tốc độ VÀ hiệu suất đầu phát theo model.

## 7. Rủi ro còn lại
- Bộ đọc theo mẫu PDF của 3 hãng; mẫu khác (LSA, Mecc Alte) chưa đọc → giữ cách khoảng như #507.
- "prime → Cont." là ánh xạ chế độ vận hành (continuous duty của đầu phát cho định mức prime / liên tục của tổ máy); khoảng F 105/40 – H 125/40 được giữ thay vì chọn một cấp. Standby → Standby 150/40 – 163/27.
- `sourceRatings` đọc tệp trong `suppliers/sources` của checkout chạy bot (RepoDir); máy khác phải có đủ thư mục này (đang trong git).
- Đầu phát thay thế trên cùng dòng: code dùng đầu phát mà catalog gán.
- Tiến trình `config-bot.mjs run` đang chạy giữ code cũ.

## 8. Quay lui
Revert PR #513. Không dữ liệu nào trên web hay trong hồ sơ NCC bị đổi; kết quả mới có thêm `combo.altKva.labeled`, nhãn trong `combo.power.text`.

## 9. Chưa kiểm được
- Chưa có ca thật nào tính được cân bằng công suất (thiếu kWm động cơ) — phần hiệu suất có nhãn mới chỉ kiểm bằng test (284 kWm × 90,3–91,1% ≥ 250 kWe).
- Không chạy agent; không xem web (không đổi web).
