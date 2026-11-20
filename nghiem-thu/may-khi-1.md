**Kết luận: trên `origin/main` a52179ee (`suppliers/cn` giống 875e3d6a của lần đo top 30) có 286 bảng đọc ra bản ghi mang dấu hiệu chữ khí / xăng: 107 bảng khí (31 NCC, 706 bản ghi CAT.build), 13 xăng (5 NCC, 44), 5 xăng/LPG đa nhiên liệu (2 NCC, 25), 5 không rõ (4 NCC, 49), 156 là diesel bị nhầm (5 NCC, 193); trong top 30 (1.093 lượt) máy khí lọt top ở 78 lượt / 74 gói (140 lần, 48 dòng riêng; 114 lần là một NCC: westinpower, chủ yếu n112), khí + xăng + xăng/khí lọt 221 lần ở 118 lượt / 114 gói; lỗi COP chỉ có agg-fuzhou (4 bảng, 42 dòng, cả 4 là bảng khí) + 1 bản ghi hosem-power.**

Việc CHỈ ĐỌC (Khoa 20/11 "máy khí: đọc trước"): không sửa code, không PR, không ghi web. Dữ liệu và script ở `dau-vao\may-khi\`. Gốc dữ liệu: bản chép `git archive origin/main` (web, suppliers/cn, suppliers/sources) vào thư mục tạm của phiên, không đụng checkout chính. `git diff --stat 875e3d6a origin/main -- suppliers/cn web/catalog.js` chỉ có `web/catalog.js` +12 dòng (dropspec), `suppliers/cn` không đổi → top 30 `catalog-b2\top30-cloud\gop-goc.json.gz` (875e3d6a) dùng được cho danh sách này.

## 1. Danh sách bảng khí / xăng

### Cách làm (và giới hạn, nói thẳng)
1. `1-quet.mjs` quét 9.812 bảng của 435 NCC. Dấu hiệu: chữ khí (燃气, 沼气, 天然气, natural gas, biogas, LPG, CNG, LNG, "gas generator / engine / set", landfill, methane…), chữ xăng (gasoline, petrol, 汽油, gasolina, benzin), GIÁ TRỊ sau nhãn nhiên liệu ("Fuel Type | X"), đơn vị tiêu hao khí (m³/h, Nm³/kWh, "gas consumption"), ô model đuôi -NG / `*7NG` / -LPG / -BG hoặc động cơ Baudouin `…N0/5`, URL nguồn có gas / natural / petrol / gasoline. Kết quả `cand.json`: 625 bảng có dấu hiệu, 286 trong đó cho bản ghi qua `CAT.build` (đây là phạm vi đếm); 339 bảng không cho bản ghi nào (không ảnh hưởng Gợi ý).
2. Quét thêm theo MÃ MODEL động cơ (`K19N, K38N, K50N, QSV, TCG, TBG, Jxxx, G35xx, CG1xx, …N0/5, -NG, WP…NG`) các bảng chưa có dấu hiệu chữ: chỉ ra thêm 4 bảng weichai-power n125–128 (ô `PG…*7NG` + động cơ `…N0/5`, không có chữ "gas" trong bảng; đã đưa vào), còn lại là trùng hợp mã (Yanmar `3TNV80F-NGGE`, Cummins QSV500CS ghi "DIESEL GENSET", Deutz…).
3. Soát tay: tôi đọc tiêu đề, dòng tiêu đề cột, dòng mẫu, URL và mở `sources/<id>/<n>.md` / `peek` các dòng có chữ nhiên liệu cho MỌI NCC có bảng ra bản ghi (40 NCC). Với nhóm bảng cùng một mẫu trang (powerzoo 79, chenxing 37, westinpower datasheet 30, naipute 14, victory…) tôi đọc 3–6 bảng đầu và so dấu hiệu của cả nhóm bằng script (cùng tiêu đề / cùng cột / cùng câu), không mở từng bảng một. 164 bảng có dấu hiệu chữ nhưng 0 bản ghi (sevenpower-chengdu 39, man-engines 27, younes-bros 12, pauway 11, …) CHƯA soát: `phan-loai-ngoai-catalog.tsv`.
4. Không tìm được bằng cách này: bảng máy khí mà bảng, tiêu đề, URL và model đều không có dấu hiệu nào ở trên (nếu có thì sót). Chưa mở lại trang web gốc, chỉ dùng bản lưu `sources/`.

Mức bằng chứng: **B** = bảng / cột tiêu đề / ô ghi nhiên liệu hoặc tiêu hao khí; **T** = chỉ tên trang / tiêu đề bảng ghi khí (xăng) cho CHÍNH sản phẩm, bảng không có cột nhiên liệu; **M** = chỉ mã model `-NG / *7NG` (kèm URL gas-generator); **N** = chữ ở menu, khẩu hiệu, hay đơn vị m³/h không phải khí.

### Tổng (chỉ bảng có bản ghi)
| lớp | bảng | dòng bảng | bản ghi CAT.build (động cơ + đầu phát) | trong đó động cơ | NCC | mức |
|---|---|---|---|---|---|---|
| chắc chắn khí | 107 | 1.768 | 706 | 655 | 31 | B 58 bảng, T 36, M 13 |
| chắc chắn xăng | 13 | 332 | 44 | 20 | 5 | B 2, T 11 |
| xăng + khí (đa nhiên liệu, LPG) | 5 | 93 | 25 | 19 | 2 | B 3, T 2 |
| diesel bị nhầm | 156 | 2.356 | 193 | 179 | 5 | N |
| không rõ | 5 | 77 | 49 | 48 | 4 | T |
| cộng | 286 | 4.626 | 1.017 | 921 | | |

(Đếm cũ ~52 NCC / 282 bảng / 1.051 bản ghi: cùng cỡ; nay tách đúng loại. "Dòng bảng" = số dòng của `rows[]`, gồm cả dòng nhãn của bảng nhãn; "bản ghi" = số `uses` engine + alternator của bảng đó trong `CAT.build`.)

### Theo NCC (`tong-hop-ncc.tsv`; bảng theo từng bảng ở `phan-loai-bang.tsv` có cột lý do)
| NCC | lớp | bảng | dòng | bản ghi |
|---|---|---|---|---|
| agg-fuzhou | khí | 4 | 42 | 42 |
| aosif | khí | 10 | 85 | 82 |
| bison-zhejiang | xăng | 1 | 70 | 1 |
| cameo-power | xăng | 1 | 14 | 3 |
| chenxing-weifang | diesel bị nhầm | 37 | 265 | 37 |
| ettes-power | khí | 10 | 115 | 115 |
| gillette-generators | diesel bị nhầm | 6 | 83 | 6 |
| googol | khí | 2 | 11 | 11 |
| green-power-generators | khí | 2 | 29 | 10 |
| huayuan-weifang | khí | 1 | 19 | 19 |
| innio-jenbacher | khí | 7 | 53 | 7 |
| jianghao-genset | không rõ | 2 | 36 | 29 |
| jichai-huanneng | khí | 4 | 54 | 4 |
| kaihua-genset | khí | 1 | 19 | 19 |
| kigerpower | xăng | 1 | 18 | 1 |
| kingway-power | khí | 4 | 63 | 4 |
| kingway-power | không rõ | 1 | 18 | 1 |
| lees-power | khí | 2 | 21 | 20 |
| man-engines | khí | 3 | 27 | 15 |
| man-engines | không rõ | 1 | 9 | 9 |
| mwm | khí | 6 | 236 | 12 |
| naipute-weifang | khí | 14 | 532 | 14 |
| penlucky | khí | 1 | 21 | 21 |
| power-hf | khí | 2 | 17 | 15 |
| powerzoo | diesel bị nhầm | 79 | 634 | 104 |
| repower-gas | khí | 2 | 45 | 3 |
| rise-power | khí | 3 | 37 | 57 |
| ronsun-power | khí | 3 | 44 | 3 |
| simpson-power | khí | 1 | 10 | 10 |
| simpson-power | không rõ | 1 | 14 | 10 |
| slong-power | xăng/khí | 3 | 45 | 13 |
| sunkings | khí | 1 | 7 | 1 |
| taihai-taizhou | khí | 1 | 25 | 25 |
| tide-power | khí | 1 | 75 | 1 |
| victory-generator | khí | 1 | 10 | 10 |
| victory-generator | xăng | 9 | 226 | 37 |
| victory-generator | xăng/khí | 2 | 48 | 12 |
| victory-generator | diesel bị nhầm | 4 | 96 | 16 |
| weichai-heavy-machinery | khí | 4 | 10 | 10 |
| weichai-power | khí | 4 | 10 | 10 |
| weiman-fujian | khí | 1 | 19 | 19 |
| westinpower | khí | 7 | 71 | 95 |
| westinpower | diesel bị nhầm | 30 | 1.278 | 30 |
| xinshengan-shandong | khí | 3 | 12 | 3 |
| xinzhengfa | khí | 1 | 18 | 18 |
| yingtai-jiangsu | khí | 1 | 31 | 31 |
| yunnei-power | xăng | 1 | 4 | 2 |

### Diesel bị nhầm (dấu hiệu chữ nhưng không phải khí) — 5 NCC, 156 bảng
- **powerzoo (79 bảng / 104 bản ghi)**: "Gas Generator Set" là mục menu trang ("Diesel Generator Set | Gas Generator Set | BESS and Load Bank…") nằm trong tiêu đề bảng; mọi bảng là máy diesel (Cummins, Fawde, Perkins, Isuzu, Yanmar). Nhầm đã nêu trong brief.
- **chenxing-weifang (37 / 37)**: "提供柴油、燃气发电机组的成套设备制造…" là khẩu hiệu công ty ở tiêu đề trang; bảng là 柴油机参数 (NT855-GA…), không nêu khí. Nhầm đã nêu trong brief.
- **westinpower datasheet TX… (30 / 30)**: "m³/h" là lưu lượng nước làm mát ("Coolant flow | 80m³/h"); diesel.
- **gillette-generators (6 / 6)**: "Natural Gas and … Diesel" là menu trang; bảng ghi `ENGINE FUEL TANK`, `FUEL USE, GAL/LTR/HR`, không có khí.
- **victory-generator n129, n133 (4 / 16)**: máy diesel hai xi lanh; chữ xăng ở dòng khác của trang.

### Không rõ (5 bảng, 4 NCC) — đừng ghi nhiên liệu
- jianghao-genset n104 (2 bảng, 29 bản ghi): tiêu đề trang "Gas Generator" nhưng cột "FuelCon. (L)" (lít) và động cơ 4B / Chaochai CY4102; bảng không nêu khí. Mâu thuẫn nội bộ.
- simpson-power n124 (1, 10): "SIMPSON-GasGenerators", máy 2,2 kW (ZS168FA, GX390): "Gas" có thể là gasoline; không nêu nhiên liệu. (25 lần lọt top, xem mục 2.)
- man-engines n104 (1, 9): "Compact MAN diesel and gas engines as auxiliary engines": bảng trộn D2676 / D2862 (diesel) với E3262 (khí).
- kingway-power n117 (1, 1): tiêu đề "70KW Double Membrane Biogas Storage Tank For Waste Water Treatment" (bể chứa khí), model KGD250B; không biết có phải tổ máy khí.
- penlucky n102 (1, 21): URL `diesel-industrial-generators/cummins-generator` (diesel) nhưng động cơ ghi "K38N" (đuôi N); bảng không nêu nhiên liệu. Ghi vào đây vì bảng không có chữ khí nào; mã K38N là dấu hiệu duy nhất.

### Xăng (13 bảng, 5 NCC) và xăng/khí (5 bảng, 2 NCC)
- Xăng: bison-zhejiang n1003 (datasheet "gasoline generator Catalog", BS170F hai kỳ), cameo-power n127 ("Fuel Type | Gasoline"), kigerpower n2011 (URL portable-gasoline-generator), yunnei-power n103 (燃料 汽油, G16MPI), victory-generator n119 / 124 / 130 / 131 / 132 (tiêu đề "Gasoline … Generator", "Gasoline Consumption").
- Xăng/khí: victory-generator n118 ("Gas(LPG) Portable Generator", bảng ghi "Gasoline Consumption"), slong-power n105 / 106 / 143 ("Fuel Type | Gasoline, LPG, NG").

### Chắc chắn khí — theo mức
- **B (58 bảng)**: aosif (cột "Natural Gas / Biogas Consumption"), googol, green-power n124/125 ("METANO / GPL"), huayuan-weifang, innio-jenbacher, lees-power, man-engines n105/111, mwm (datasheet TCG: "Landfill gas", kWh/Nm³), naipute (14, "Fuel Type | Natural gas/Biogas"), power-hf, repower-gas, rise-power, sunkings, taihai-taizhou, tide-power, victory n117.
- **T (36 bảng)**: ettes-power (10, "Natural Gas / Biogas … CHP"), jichai-huanneng (4), kaihua (tiêu đề + URL "By-Function/Gas-Generator"), kingway-power (4 trừ n117), ronsun-power (3), simpson n120, weiman, westinpower n112/114/115 (7), xinshengan (3), xinzhengfa, yingtai n114. Bảng không có cột nhiên liệu; chỉ tên trang / tiêu đề ghi khí.
- **M (13 bảng)**: agg-fuzhou n115–118 (URL "agg-natural-gas-generator-sets", ô model `DC260G6-NG`, `CU375G6-NG`…; bảng gốc chỉ ghi "-NG"), weichai-heavy-machinery (4, URL gas-generator-set, `PG…*7NG`), weichai-power (4, không URL gas), penlucky n107 (URL generator/gas-generator + `GGP33*9NG3`).
- Lưu ý: `gasTable` hiện có trong `catalog.js` chỉ bắt agg-fuzhou n115/116 (note "bảng máy khí"); các bảng còn lại không bị nhận ra.

## 2. Top 30 (gop-goc.json.gz, main 875e3d6a, 1.093 lượt, 890 gói duy nhất, 0 lỗi)
Ghép khoá `supplierId|engineKey|altKey|keyOf(dòng)` bỏ altKey với bản ghi động cơ của `CAT.build` (`3-do-top30.mjs`). `all` có 1.094.247 dòng, `top` 31.208.

| lớp | trong `all`: lần / lượt / gói / dòng riêng | trong `top`: lần / lượt / gói / dòng riêng |
|---|---|---|
| khí | 11.121 / 687 / 583 / 499 | 140 / 78 / 74 / 48 |
| xăng | 583 / 128 / 112 / 10 | 60 / 40 / 40 / 5 |
| xăng + khí | 164 / 85 / 78 / 8 | 21 / 21 / 21 / 3 |
| không rõ | 1.365 / 665 / 552 / 37 | 27 / 26 / 23 / 7 |
| diesel bị nhầm (đối chứng) | 3.931 / 744 / 603 / 168 | 97 / 68 / 64 / 18 |

- Khí + xăng + xăng/khí trong top: 221 lần, 118 lượt, 114 gói. Cộng cả "không rõ": 248 lần, 126 lượt, 119 gói; 67 lượt có ≥ 2 dòng loại này, nhiều nhất 5 trong một lượt.
- **Khí trong top 140 lần: westinpower n112 (MAN E0834E312 / E0836LE302 / E3262LE242…) 112 lần ở 53 gói, hạng 1–30, hạng 1 ở 9 lượt** (IB2200067367, IB2300010852, IB2300236144, IB2300359120, IB2400313681 ×2 (hai cỡ), IB2500268545, IB2500302333, IB2600313010; điểm cao nhất 1011 trong mọi lần lọt top); rise-power n122 16 lần ở 16 gói (hạng 3–26); victory n117 3 lần; westinpower n114 2; mỗi cái 1 lần: aosif n112 (hạng 27), aosif n109 (24), naipute n2004 (12), n2009 (30), mwm n1040 (30), ettes n105 (30), huayuan n105 (19). Tính cả "không rõ": 10 lần hạng 1 (9 westinpower, 1 simpson), 42 lần hạng ≤ 5.
- Xăng + xăng/khí trong top (81 lần) toàn bộ là victory-generator: n132 38 lần / 26 gói (hạng 2–27), n131 20 / 14 (5–12), n130 2 (10–15), n118 (xăng/LPG) 21 / 21 gói (5–23).
- Không rõ trong top 27 lần: simpson-power n124 25 lần / 21 gói (hạng 1–30, hạng 1 ở IB2200066148), jianghao n104 2 lần (hạng 8, 27).
- Diesel bị nhầm trong top 97 lần: powerzoo n169 (Yanmar) 76 lần, victory n129 / n133 17 lần, powerzoo n101, n103, n153, n168 mỗi bảng 1; đây là máy diesel nên đúng chỗ.
- **Liệt kê ĐỦ mọi lần lọt top** (346 dòng gồm cả diesel bị nhầm, mỗi dòng: lượt, gói, hạng, điểm, lớp, NCC, bảng, model, khoá): `top30-khi-xang.tsv`. Các dòng khí / xăng nằm trong `all` nhưng không `top`, gộp theo (lớp, NCC, bảng, model) kèm số lượt trong `all` / `top` và điểm cao nhất: `all-theo-dong-khi-xang.tsv`.
- HSMT của các lượt đó đòi nhiên liệu gì: **chưa kiểm** (không tải bidhist về sổ, repo public). Chỉ biết bảng có dòng khí lọt top, chưa biết gói có đòi khí hay diesel.

## 3. Lỗi agg-fuzhou "COP (kVA/kW)" đọc thành prime
`4-cop.mjs` (tiêu đề cột có COP / Continuous power / 连续功率 trên mọi bảng, so với mức đọc ra của bản ghi) + `5-cop-nhan.mjs` (bảng nhãn có dòng "COP / Continuous power" mà không có dòng prime / standby):
- Có 40 bảng có cột COP / Continuous ở tiêu đề (359 dòng); 19 bảng tiêu đề đồng thời có cột mức khác (prime / standby…), đúng; 21 bảng chỉ có cột COP: 5 bảng đọc ra prime mà không có cột mức nào. Trong 5 đó: **agg-fuzhou n115, n116, n117, n118: 4 bảng, 42 dòng (23 + 11 + 6 + 2), 42 bản ghi prime, đúng là 4 bảng khí `-NG` (lớp khí 100%)**. Năm bảng thứ 5 là **penlucky n108**: ĐÃ kiểm, không phải lỗi này (tiêu đề có cả "Primary Powe /KW" và "Continuous power/KW", prime lấy từ cột Primary; script cờ nhầm vì regex mức không có "primary").
- Ngoài tiêu đề: **hosem-power n112** (bảng nhãn "Soundproof 1500RPM 200kVA Perkins Diesel", dòng "| Continuous Power | kVA | 200") đọc prime 200 kVA: 1 bảng, 1 dòng, 2 bản ghi (động cơ + đầu phát), diesel. 14 bảng nhãn khác có "Continuous power" và không có prime / standby thì không đọc ra prime.
- Kết luận: NCC khác cùng lỗi theo tiêu đề cột = 0; theo dòng nhãn = hosem-power (1 dòng). `cop-bang.tsv`, `cop-nhan.tsv`.
- Đó là lỗi có sẵn (đã ghi ở `catalog-a-1.md` mục 8), nằm trọn trong nhóm bảng khí: khi sửa luật COP nên sửa cùng lúc với nhóm khí này, vì ở nhóm khí công suất thường là "continuous" thật (tổ máy khí hay ghi COP).

## 4. Đề xuất bước 2 (KHÔNG làm; chờ Khoa duyệt)
**Trường nhiên liệu `fuel` ghi từ dấu hiệu nào là chắc (không suy ra):**
1. Ghi `fuel: "gas"` / `"gasoline"` / `"dual"` (xăng + LPG / khí) chỉ khi một trong: (B) ô / dòng nhãn / cột tiêu đề của chính bảng ghi nhiên liệu hoặc tiêu hao khí ("Fuel Type | Natural gas", "燃料 | 汽油", cột "Gas Engine Model", "Gas Consumption (Nm³/hr)", "燃气消耗(m³/kW·h)", "燃气种类"); (T) tiêu đề bảng ghi khí / xăng cho chính sản phẩm của bảng, nhưng đánh dấu mức yếu hơn (`fuelFrom: "title"`) để Khoa quyết có dùng để loại không; (M) mã model `-NG`/`*7NG` chỉ khi đi kèm tiêu đề hoặc URL khí.
2. KHÔNG ghi từ: chữ ở menu / khẩu hiệu công ty (powerzoo, chenxing, gillette: 156 bảng trong 286 là chuyện này, tức 54% bảng "có chữ khí" là diesel); "m³/h" đứng một mình (lưu lượng nước làm mát); mã động cơ tự nó (K19N, QSK, QSV, `N0/5` một mình); chữ "Gas" mơ hồ gasoline / gas (simpson n124); tiêu đề mâu thuẫn với cột bảng (jianghao: "Gas Generator" + "FuelCon. (L)"); tên NCC (repower-gas, kerui-gas).
3. Dòng không đủ dấu hiệu thì `fuel` rỗng ("không rõ"), không phải "diesel": catalog không có chữ diesel để suy ngược; "chưa ghi" khác "đã ghi diesel".
4. Nơi đọc: đặt cạnh `gasTable` trong `catalog.js` (`fuelOf(table, lines)`), ghi vào bản ghi `fromSupplier` cùng `fuelWhy` (B / T / M + câu đọc) như `madeIn` ghi `why`; không thêm khoá vào hồ sơ `cn/` (không sửa nguồn) nên không cần `schema.json`. Mở rộng `gasTable` (hiện chỉ agg-fuzhou n115/116) sang cùng luật này, kể cả việc "dòng máy trong tiêu đề không đọc thêm" cho đúng cả 4 bảng agg-fuzhou.

**Luật ở Gợi ý (cấu hình + giá):**
- `config-bot.mjs` `hintsOf`: đọc nhiên liệu HSMT (chữ "diesel / dầu", "khí thiên nhiên / biogas / LPG", "xăng") như `cylLayoutOf`; `candidates` loại dòng `fuel` ngược (`ruled: "fuel"`): HSMT nêu diesel → loại `gas / gasoline / dual`; HSMT nêu khí → loại diesel. Dòng `fuel` rỗng: giữ.
- Phải Khoa quyết (đừng tự chọn): HSMT KHÔNG nêu nhiên liệu thì mặc định (a) coi là diesel (loại khí / xăng; gói máy phát nội địa gần như luôn diesel) hay (b) không loại. Lựa chọn (a) cần đo HSMT trước (chưa kiểm).
- Thêm một check "nhiên liệu" ở `check` (không đạt khi cấu hình khí cho HSMT diesel) và điểm trừ ở `candidates`, giống luật đồng bộ tần số / bố trí xi lanh.

**Ước lượng số bản ghi đổi (đo trên main a52179ee, chưa chạy luật):**
- Catalog: bản ghi có `fuel` = khí 706 (B 302, T 321, M 83) + xăng 44 + xăng/khí 25 = 775 bản ghi (694 là động cơ) trong 120 bảng, 33 NCC; "không rõ" 49 bản ghi để trống; diesel bị nhầm 193 bản ghi KHÔNG đổi. Bản ghi đổi thật = 775 / 60.073 = 1,3% bản ghi build.
- Top 30, nếu áp (a) cho cả B + T + M: bỏ khỏi top 221 lần (khí 140, xăng 60, xăng/khí 21) ở 118 lượt / 114 gói; 114 trong 140 lần khí là westinpower (n112 112 + n114 2), 81 trong 81 lần xăng là victory. Phần chỉ B (không T / M) thì ít hơn: chưa tách (có thể tách bằng cột lớp + mức trong `phan-loai-bang.tsv`). Mỗi lượt mất tối đa 5 dòng khỏi top (hạng 6 trở xuống lên thay; hạng 31 vào top). "Không rõ" (27 lần, simpson-power 25) giữ như cũ.
- `all`: khí + xăng + xăng/khí = 11.868 lần ở 499 + 10 + 8 dòng riêng sẽ biến mất ở các lượt đòi diesel.
- Rủi ro: luật "T" có thể gắn nhầm khí cho bảng chỉ nói "Gas Generator" trong tên trang (jianghao, simpson là loại này, đã tách thành "không rõ"); luật mặc định (a) sai khi gói thầu thật đòi khí mà HSMT viết "máy phát điện" thôi — cần đo HSMT trước.

## Tệp (`dau-vao\may-khi\`)
`1-quet.mjs` (quét 9.812 bảng) · `2-phan-loai.mjs` (luật phân loại tay, có lý do từng nhóm) · `3-do-top30.mjs` · `4-cop.mjs`, `5-cop-nhan.mjs` · `cand.json` (625 bảng có dấu hiệu, 0,86 MB) · `phan-loai-bang.tsv` (từng bảng: lớp, mức, lý do) · `tong-hop-ncc.tsv` · `phan-loai-ngoai-catalog.tsv` (164 bảng 0 bản ghi chưa soát) · `dong-khi.json` (khoá từng bản ghi động cơ theo lớp) · `top30-khi-xang.tsv`, `all-theo-dong-khi-xang.tsv`, `do-top30.json` · `cop-bang.tsv`, `cop-nhan.tsv`. Chạy lại: `git archive origin/main web suppliers/cn suppliers/sources` vào thư mục tạm rồi `node 1-quet.mjs <tạm> quet.json`, `node 2-phan-loai.mjs <tạm> .`, `node 3-do-top30.mjs <tạm> ..\catalog-b2\top30-cloud\gop-goc.json.gz .`.

## Rủi ro / việc chưa kiểm
- Phân loại là soát tay + luật theo NCC (chỉ gần như chắc ở bảng B; T / M là "tên trang ghi khí"). Bảng cùng mẫu chỉ đọc mẫu đầu rồi so bằng script.
- 164 bảng chữ khí / xăng với 0 bản ghi chưa soát; bảng khí không có dấu hiệu chữ / URL / mã nào thì không tìm ra.
- HSMT của các lượt có dòng khí lọt top chưa kiểm nhiên liệu; mức "lọt top" chưa phải "sai".
- Mức "T" cho kaihua, weiman, xinzhengfa, yingtai, xinshengan (tiêu đề "燃气 / Gas Generator" rồi bảng model "…GF" không nêu nhiên liệu): chấp nhận theo tên trang; nếu Khoa muốn chặt hơn thì chuyển sang "không rõ" (thêm 5 NCC, ~95 bản ghi).

## Cần ghi nhớ
- Không sửa gì ngoài `genbid-work\dieu-phoi\`; không PR; checkout chính để nguyên. Bản chép origin/main nằm ở thư mục tạm của phiên (không giữ lâu).
- Chờ điều phối / Khoa: (1) mức "T" có dùng để loại không; (2) HSMT không nêu nhiên liệu thì mặc định gì; (3) có sửa luật COP cùng lúc với nhóm khí không.
