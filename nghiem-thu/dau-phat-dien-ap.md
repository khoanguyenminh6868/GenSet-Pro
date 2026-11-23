# Đầu phát: thông số điện theo từng điện áp — hiện trạng nguồn (24/11/2026)

Đo trên `origin/main` 5efb136b, worktree `wt-alt-volt`, MỌI tệp `sources/<id>/1001…1999.md` của hồ sơ `role: alternator_maker` (không lấy mẫu).
Script: `genbid-work\dieu-phoi\dau-vao\dau-phat-dien-ap\` (`do-hien-trang.mjs` → `hien-trang.json`, `tom-tat.mjs` → `tom-tat.txt`, `thieu-to.mjs` → `thieu-to.txt/json`).
Hàm đọc: `stamfordRatings`, `stamfordBookRatings`, `lsRatings`, `meccRatings`, `cumminsRatings` (`ratingsOf`) + `altSheetAttrs`, `lsSheetAttrs`, `meccSheetAttrs`, `lsStandards`.

**Tình trạng việc**: bước 1 và 2 xong; bước 3 (tải tờ cho model thiếu) và bước 4 CHƯA làm, không có dữ liệu mới, không có PR (phiên dừng vì quá 30 % context). Việc còn lại ở cuối tệp.

## 1. Hồ sơ alternator_maker có tờ datasheet (1001–1999)

| Hồ sơ | Tờ | Model đọc ra dòng | Tờ KHÔNG ra dòng nào |
|---|---|---|---|
| leroy-somer-fuzhou | 14 | 84 | 0 |
| stamford-avk-china | 33 | 33 (mỗi tờ một model) | 0 |
| mecc-alte | 16 | 65 | 6 (1001–1006, xem dưới) |
| xinrongbang-fujian | 1 | 0 | 1 (1001: tờ động cơ, không phải đầu phát) |
| marathon-generators / geshin-marathon | 0 (chỉ nguồn 1, 101) | — | — (marathonelectric.com / weg.net 403: chưa thử lại) |

Hồ sơ `alternator_maker` khác (37 hồ sơ, vd. cgen-alternator, marelli-motori, nishishiba, sincro-soga…) không có tệp 1001+ nào: không đo.

### Số model có định mức theo từng tần số / pha / điện áp (kVA / kW / hiệu suất)

**Leroy-Somer (84 model; mọi model đều có cả Cont. và Standby, 4 nhóm cấp nhiệt H125 / F105 / H150 Standby / H163 Standby 27 °C)**

| Cột | kVA | kW | hiệu suất |
|---|---|---|---|
| 50 Hz 380 V | 83 | 79 | 0 |
| 50 Hz 400 V | 83 | 79 | 0 |
| 50 Hz 415 V | 83 | 79 | 0 |
| 50 Hz 440 V | 61 | 59 | 0 |
| 50 Hz 1 pha | 53 | 49 | 0 |
| 60 Hz 380 V | 71 | 70 | 0 |
| 60 Hz 416 V | 71 | 70 | 0 |
| 60 Hz 440 V | 77 | 76 | 0 |
| 60 Hz 480 V | 77 | 76 | 0 |
| 60 Hz 1 pha | 47 | 46 | 0 |

Đọc được: chế độ, cấp nhiệt + nhiệt độ, pha, tần số, điện áp. KHÔNG có: kiểu đấu (conn), hiệu suất, dòng điện (A). 84 → 83 / 79: 1 model không có kVA ở 380–415 V, 4 model không có dòng kW.

**Mecc Alte (65 model, tờ dải ECP / ECO 1007–1016)**

| Cột | kVA | kW | hiệu suất |
|---|---|---|---|
| 50 Hz 380 / 400 / 415 V | 65 | 65 | 0 |
| 50 Hz 440 V | 58 | 58 | 0 |
| 60 Hz 415 / 440 / 460 / 480 V | 65 | 65 | 0 |

Đọc được: chế độ (Standby / Cont.), nhóm cấp nhiệt 163/27, 150/40, 125/40, 105/40, 80/40, tần số, pha 3, kiểu đấu (`Series Star Y` 45 model, `Parallel Star YY` 20 model; chỉ nhận dòng SAO có mọi điện áp 346–480 V: điện áp tam giác và sao 2× bị bỏ có chủ ý). KHÔNG có hiệu suất, dòng, tờ 1 pha.
6 tờ 1001–1006 không ra dòng: 1001 PMG leaflet, 1002 sổ tay lắp ráp (MEC1275), 1003 ATO 28 2p, 1004 CTP3 2P, 1005 PE 28, 1006 ATO 28 4p. 1003–1006 (dải Zanardi, đặt tên theo "POWER 230/400 V" và "POWER 277/480 V", cột 2/4 3/4 4/4 tải) có bảng công suất nhưng ở bố cục khác `meccRatings` (không có "Ratings 50Hz" + "kVA / kW @ Temp. Rise"): cần hàm đọc mới.

**Stamford / AVK (33 model, mỗi tờ một model)**

| Cột | kVA | kW | hiệu suất |
|---|---|---|---|
| 50 Hz 380 / 400 / 415 V | 30 | 30 | 30 |
| 50 Hz 440 V | 22 | 22 | 22 |
| 60 Hz 380 / 400 V | 3 | 3 | 3 |
| 60 Hz 416 V | 29 | 29 | 29 |
| 60 Hz 440 / 460 / 480 V | 26 | 26 | 26 |

Đọc được: chế độ, độ tăng nhiệt 105/40, 125/40, 150/40, 163/27, tần số, pha 3, điện áp sao nối tiếp. KHÔNG có dòng điện (A: tờ có "CURRENT (Amps)" của đường cong, không phải dòng định mức), kiểu đấu. 3 model 50 Hz thiếu cột (33 − 30) và 4 model 60 Hz thiếu (33 − 29): chưa soát từng tờ vì sao (tờ chỉ có một tần số hoặc "N/A").

**Marathon**: 0 tờ, 0 dòng.

## 2. Trường còn lại của phần `alternator`: tờ có ghi dòng đó không

Số tờ có dòng khớp biểu thức tìm (tìm chữ trong tệp nguồn, KHÔNG phải đã đọc ra giá trị; có thể lẫn dòng không phải thông số, vd. ô trang bìa). Mẫu: dòng nguyên văn trong tệp. "Code đọc" = hàm hiện có của `ratings.mjs` đọc được ra khoá.

| Trường | LS (14 tờ) | Mecc (16 tờ) | Stamford (33 tờ) | Code đọc hiện nay |
|---|---|---|---|---|
| winding_pitch | 14 `\| Winding pitch \| 2/3 ( wind.6 -12-wire)` | 10 `\| Winding pitch \| 2/3` | 33 `All generator stators are wound to 2/3 pitch.` | không |
| wires | 14 `\| 6-wire \| R180` | 10 `12 leads: 50 Hz 380–440 V …` | 14 `reconnectable with 12 ends` | không |
| altitude | 14 `\| Altitude \| ≤ 1000 m` | 10 `\| Altitude (meters) \| 25 \| 40 …` (bảng hệ số suy giảm) | 33 `3% for every 500 metres by which the operating altitude …` (lời) | LS `lsSheetAttrs`; Mecc `meccDerate` |
| overspeed | 14 `\| Overspeed \| 2250 R.P.M.` | 11 (1002: lời khuyên chung, không phải thông số) | 15 `\| MAXIMUM OVERSPEED \| 2250 Rev/Min` | LS, Stamford (`altSheetAttrs`) |
| air_flow | 14 `\| Air flow 50 Hz (m3/s) \| 0.08` | 13 `(m³/min.)` (cột bảng) | 33 `\| COOLING AIR \| 0.281 m³/sec 595 cfm` | không |
| short_circuit | 12 `AREP+ Short-circuit current = 2.7 In: 5 seconds` | 10 `Motor Start: Inrush current >300% for 20 seconds` | 33 (lời; dạng thông số "300% sustained" chỉ ở tờ mới) | LS 8 tờ, Mecc 10, Stamford 4 (`sc300`) |
| excitation | 14 `\| AREP+ \| PMG` | 11 (PMG là tuỳ chọn, chưa rõ) | 33 `self excited control system` | LS 14, Stamford (`pmg` 27, `self_excited` 17) |
| avr | 14 (dòng `AVR type`) | 0 | 31 `SX460 AVR - OBSOLETE` | LS 14 (`avr`), Stamford 15 (`avrStd`) |
| voltage_regulation | 14 `\| Voltage regulation (*) \| ± 1 % \| ± 0.5 %` | 2 `\| Voltage Regulation \| +/-2%` | 33 (lời "stated voltage regulation") | LS 14 (`vreg`); khác không |
| thd_no_load | 12 `harmonic distortion between phases, no-load` | 10 `Waveform Distors.(THD) no load LL/LN \| % \| 2,93 / 2,5 …` | 15 `NO LOAD < 1.5% …` | không (chỉ `thd` = tải tuyến tính của Stamford) |
| thd_linear_load | 3 `THD (**) in linear load \| < 5 %` | 0 | 33 `LINEAR LOAD < 5.0%` | Stamford 33 (`thd`) |
| tif | 14 `NEMA = TIF (**) \| < 50` | 10 `TIF \| <45 …` | 33 `TIF<50` | không |
| thf | 10 `I.E.C. : THF (**) \| < 2%` | 10 `THF \| % \| <2 …` | 33 `THF<2%` | không |
| poles | 14 `Alternators - 4 pole` | 5 `\| Poles \| 16 \| 16 \| 20 …` | 18 `\| Number of Poles \| 4` | Stamford 18 (`poles`) |
| bearing | 14 `Single-bearing design …` | 13 `REAR BEARING` (nhãn bản vẽ) | 33 `Two bearing generators …` | Stamford 31 (`bearings`) |
| cooling (IC / tự thông gió) | 0 | 0 | 0 | không (không tờ nào ghi mã IC; "COOLING AIR" là lưu lượng gió) |
| standards | 14 `regulations: -IEC 60034, NEMA MG 1.32-33, VDE 0530, ISO 8528/3` | 10 `accordance with IEC 60034.` | 33 `BS5000, VDE 0530, NEMA MG1-32` | LS `lsStandards` 14 |
| hiệu suất | 14 `\| Efficiencies 400 V - 50 Hz (— P.F.: 0.8) …` | 11 (lời) | 33 `Efficiency (%) \| 91.0 …` | chỉ Stamford theo điện áp |

Ghi chú: biểu thức tìm cho `current_a` và `avr` của Mecc không đáng tin (LS: khớp tiêu đề "Short-circuit current"; Mecc dùng tên AVR khác DSR / D350 chưa tìm). Dòng điện định mức theo điện áp KHÔNG có ở tờ nào dưới dạng bảng: Stamford chỉ có trục "CURRENT (Amps)" của đồ thị; ô dòng trong tờ LS / Mecc chưa thấy. Nghĩa là `current_a` theo điện áp nguồn có thể không ghi; chỉ có thể tính từ kVA / (√3·V), mà luật cứng cấm suy ra.

## 3. Model đầu phát trong danh mục KHÔNG có tờ hãng nào (không dòng định mức, không thuộc tính, không NCC `alternator_maker`)

`CAT.build` trên `suppliers/cn` (bỏ `incomplete`): 3.026 model đầu phát. Trong đó:

| Hãng | Model trong danh mục | Có dòng định mức từ tờ | Không có tờ nào | Thiếu tờ mà ≥ 2 NCC chào | ≥ 5 NCC chào |
|---|---|---|---|---|---|
| Stamford | 326 | 73 | 249 | 98 | 39 |
| Leroy-Somer | 187 | 75 | 112 | 27 | 0 |
| Mecc Alte | 47 | 13 | 34 | 1 | 0 |
| Marathon | 39 | 0 | 39 | 28 | 0 |

Danh sách đầy đủ: `dau-vao\dau-phat-dien-ap\thieu-to.json` (model, hãng, số NCC chào). Nhiều chào nhất: Stamford HCI544FS (14 NCC), S1L2-Y1 (13), S1L2-K1 (12), S0L2-P1 (11), HCI444FS (11), S7L1D-F41 (10), S0L2-M1, HCI444ES, S1L2-N1, S0L1-P1 (10); Leroy-Somer LSA 47.2 M7 / S5 (4), LSA49.3 S4 (4); Marathon MX-600-4, MX-850-4 (4), MP-400-4 / 480-4 / 500-4 (3); Mecc Alte ECO46-2L (2).
Chưa tìm tờ cho model nào trong số này.

## 4. Việc cần code đọc (phiên code làm; chỉ ghi nguồn có sẵn)

1. Mecc Alte tờ 1003–1006 (ATO 28 / CTP3 / PE 28: bảng công suất "POWER 230/400 V" và "277/480 V", cột theo tải): hàm đọc mới; hiện 0 dòng.
2. Hiệu suất theo điện áp: LS có bảng "Efficiencies 400 V - 50 Hz" (mỗi tờ một điện áp / tần số?), Mecc có chữ "efficiency": chưa đọc.
3. Kiểu đấu (`conn`) cho LS (dòng "Y" có dấu `*`, YY / Δ chưa ghi) và Stamford (đang cố định "sao nối tiếp").
4. Các trường tờ có ghi mà chưa có hàm: winding_pitch, wires / số đầu dây, air_flow, thd_no_load, tif, thf (LS 14, Mecc 10, Stamford 33), poles và bearing (LS, Mecc), short-circuit của LS dạng "AREP+ 2.7 In: 5 s" (đang chỉ là `scLow` trong `sourceRatings`).
5. Stamford: 3 model 50 Hz và 4 model 60 Hz có ít cột điện áp hơn: cần soát từng tờ xem là tờ chỉ in một tần số hay hàm làm rơi cột.
6. LS có 1 model không có kVA 380–415 V, 4 model không có kW: soát từng tờ.
7. Thuộc tính chung theo tờ (LS, Mecc) không ghép cột kiểu kích từ ↔ model: cần quyết cách gắn khi tờ nhiều cột (SHUNT | AREP | PMG).

## 5. Việc chưa làm

- Tải tờ cho model thiếu (bước 3) và gộp nguồn: chưa chạy `maker-datasheets.mjs` / `merge-specs.mjs` / `verify.mjs`. Không có thay đổi dữ liệu, không commit, không PR. Worktree `C:\Projects\GenSet Pro\wt-alt-volt` (nhánh `wt-alt-volt`, từ `origin/main` 5efb136b) còn sạch.
- Gợi ý ưu tiên khi làm tiếp: Stamford (98 model ≥ 2 NCC; tờ "UCI/HCI/S0–S7" của stamford-avk-china.com / newage), rồi Marathon (28 model ≥ 2 NCC; marathonelectric.com / weg.net từng 403, gặp lại thì ghi và bỏ qua), Leroy-Somer (27 model ≥ 2 NCC; tờ TAL 040/042/044, LSA 47.2/49.3), Mecc Alte (ECO38/40/43/46 đã có tờ dải 1007–1016; xem các model có mặt trong tờ dải mà vẫn "thiếu" vì khác cách viết tên: cần soát trước khi tải).
