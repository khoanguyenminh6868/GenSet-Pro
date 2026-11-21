**Kết luận: trong nhóm 20 bảng có chữ khí ở tiêu đề / tên trang (main 41fc98e3), (1) chắc là máy khí = 10 bảng / 246 bản ghi (8 bảng tổ máy `gensetsOf` = 244 bản ghi: frs n107, googol n101 + n102, teksan n104 + n106, vpower-hk n101 + n102, westinpower n113; 2 bảng động cơ mwm n1007 + n1008 = 2 bản ghi), (2) không rõ = 3 bảng / 13 bản ghi (kingway n117, man-engines n104, simpson n124 3/10), (3) diesel, chữ khí không nói về bảng = 7 bảng / 7 bản ghi (mahindra-powerol n2002–2007, yanmar n2002); số dòng của 10 bảng loại (1) trong `top` và `all` của `gop-nhanh.json.gz` (doosan-hau-to) = 0 / 0 (đo; vì tổ máy `gensetsOf` chưa vào khoá dòng, và mwm không có khoá nào); ngoài nhóm 20, trong 331 bảng còn lại: 220 bảng là mẫu lặp theo luật máy, 66 bảng chỉ có chữ khí cạnh chữ diesel trong cùng câu, 45 bảng chưa soát.**

# Soát từng bảng nhóm tiêu đề, nhiên liệu (Khoa 21/11/2026)

Chỉ đọc: không sửa mã, không ghi web, không PR. Worktree riêng từ origin/main 41fc98e3 (đã mở để đo; gỡ khi xong). Nguồn: `suppliers/sources/<ncc>/<n>.md` đọc cả trang. Số bản ghi = bản ghi `fuel` rỗng / tổng của bảng, đo bằng `fromSupplier` + `gensetsOf` (tệp đo của phiên trước, tôi chạy lại: tổng 6.859 bản ghi rỗng ở 351 bảng, khớp). Danh sách 20 bảng = đúng 20 cặp (ncc, n, bảng) của `dau-vao\nhien-lieu-canh-bang\ung-vien-tieu-de-trang.tsv` (cả 20 có trong tsv 351 bảng). Trích ≤ 15 từ.

Mức bằng chứng theo `web/CLAUDE.md` mục fuel: B = chính bảng; M = mã model của chính dòng đuôi -NG / -BG kèm tiêu đề hoặc URL khí; T = chỉ tên trang / URL.

## Bảng 20 bảng

| # | NCC n (bảng) | bản ghi rỗng/tổng · loại | câu nguyên văn · nằm ở đâu | đọc cả trang: nói về CHÍNH bảng này? | vì sao luật hiện tại để rỗng | phân loại |
|---|---|---|---|---|---|---|
| 1 | frs-shenyang 107 (6) | 23/23, `gensetsOf` (không có bản ghi `fromSupplier`) | "燃气发电机组 - 沈阳福瑞斯动力设备有限公司" (tên trang = tiêu đề bảng); mục "燃气发电机组" + "福瑞斯燃气发电机组，高效稳定" ngay trên bảng | Có: trang chỉ có một bảng, 23 dòng, mọi mã đuôi -NG (FRS-30NG … FRS-1000NG), cột "压缩比 10.5:1 / 11.0:1". Menu nav cạnh đó liệt kê cả "柴油发电机组" (không tính) | `gensetsOf` không đọc nhiên liệu, chỉ `FUEL_PAGES` (không có mục) | **(1) khí**, M (cả 23 mã -NG + tên trang) |
| 2 | googol 101 (0) | 5/5 `gensetsOf` (5 bản ghi động cơ `fromSupplier` của cùng bảng đã `fuel=gas`) | "Gas Genset COP:1000-2500kVA", "Category: Gas Genset", cột "Gas Genset Model", "Gas Genset Parameters"; bảng động cơ cạnh đó có "Gas consumption(Nm³/hr)", mã JTA8V-NG838 | Có: bảng tổ máy GPAC1000-XXX-50 … GPAC-2500-XXX-50 | như #1 | **(1) khí**, B (tiêu đề cột "Gas Genset Model") |
| 3 | googol 102 (2) | 6/6 `gensetsOf` | "Gas Genset COP:350-750kVA", cùng cột "Gas Genset Model" | Có: GPAC335-400-50 … GPAC750-400-50 | như #1 | **(1) khí**, B |
| 4 | kingway-power 117 (12) | 1/1 `fromSupplier`, kind = alternator (Kingway KAI250) | "China 70KW Double Membrane Biogas Storage Tank For…" (tên trang); breadcrumb "Gas Generagtor Set > Biogas Generator Set"; ở bảng động cơ khác trên trang "Fuel \| Biogas" | Một phần: bảng đã lưu chỉ là nhãn "Model \| KGD250B, Prime Power 250KVA/200KW, SDEC SC9D340D2, Alternator Kingway KAI250…" không có chữ khí; chữ "Fuel \| Biogas" nằm ở bảng "Engine Specifications" (không lưu); tên trang nói "Storage Tank" (bể chứa, không phải dấu hiệu theo luật); bản ghi là máy phát (alternator), không có nhiên liệu | Tiêu đề toàn "Biogas Storage Tank"; bản ghi alternator | **(2) không rõ** (nhiên liệu của máy này có chữ "Biogas" ở bảng động cơ cùng trang, nhưng bản ghi duy nhất là đầu phát, và mã SC9D340D2 phiên jianghao đã thấy ở bảng DIESEL của jianghao-genset 105.md) |
| 5 | mahindra-powerol 2002 (13) | 1/1 `fromSupplier` (H4485G2, engine) | "Gensets \| 100 - 200 kVA Diesel & Gas Gensets \| Mahindra Powerol" (tên trang) | Không: chữ khí là mẫu tên trang dùng chung cho 6 trang; nội dung trang nói "Spectro series of diesel gensets", "Diesel gensets act as back up"; không có dòng "Fuel" riêng ở trang này | tiêu đề nêu cả diesel lẫn khí (không là dấu hiệu theo luật) | **(3) diesel**, chữ khí là menu (yếu: diesel chỉ ở câu mẫu, trang này không có dòng nhiên liệu) |
| 6 | mahindra-powerol 2003 (14) | 1/1 (H6935G1) | "250 - 350 kVA Diesel & Gas Gensets" | như 2002 (không dòng "Fuel") | như trên | **(3)** (yếu, như 2002) |
| 7 | mahindra-powerol 2004 (15) | 1/1 (2206D-E13TAG3) | "400 kVA to 625 kVA Diesel & Gas Gensets" | Không: trang ghi "Fuel - High Speed Diesel (HSD IS 1460:2005)", "lit/hr", "Considering 0.850 specific gravity of diesel" | như trên | **(3) diesel** (nguồn ghi diesel) |
| 8 | mahindra-powerol 2005 (18) | 1/1 (3285 GM-C2) | "5 kVA to 625 kVA Diesel & Gas Gensets, Control Panel & Alternator" | Không: "Fuel -High Speed diesel (HSD IS 1460:2005)", "Fuel consumption (lit/hr)" | như trên | **(3) diesel** |
| 9 | mahindra-powerol 2006 (21) | 1/1 (3445TCIGM-C2) | "5 kVA to 625 kVA Diesel & Gas Gensets More" | Không: "Fuel -High Speed diesel (HSD IS 1460:2005)" | như trên | **(3) diesel** |
| 10 | mahindra-powerol 2007 (25) | 1/1 (41035 GM-C2) | "75 kVA to 125 kVA Diesel & Gas Gensets" | Không: "Fuel -High Speed diesel (HSD IS 1460:2005)" | như trên | **(3) diesel** |
| 11 | man-engines 104 (4) | 9/9 `fromSupplier` (D2676 ×5, D2862 ×2, D3872, E3262) | "Compact MAN diesel and gas engines as auxiliary engines" (tên trang = tiêu đề bảng) | Một phần: câu mô tả "MAN Engines offers powerful and compact diesel and gas engines with 6 and 12 cylinders" nói chung cả trang; bảng "Technical data" không ghi nhiên liệu từng dòng; menu "Power generation > Gas / Diesel / Hydrogen" | tiêu đề nêu cả diesel lẫn khí | **(2) không rõ** (trang gộp 4 dòng máy, không nói dòng nào là khí) |
| 12 | mwm 1007 (23) | 1/1 `fromSupplier` (3016 V16, engine) | "From: https://www.mwm.net/en/gas-engines-gensets/gas-engine-tcg-3016/"; trong datasheet "Natural gas applications 50 Hz", "methane number of MN 80 for natural gas" | Có: tệp là datasheet MỘT máy (TCG 3016 V16, 1.000 kW điện, hiệu suất điện 41%, nhiệt 47%); khung chữ khí là của chính datasheet | bảng đã lưu "Datasheet: EN" không chứa chữ khí (đo: 24 dòng, 0 lần "gas / methane"); URL tệp lưu là PDF `MWM18010-OnePager-MWM-TCG-3016_EN…` | **(1) khí** (T: URL "gas-engine-tcg-3016" + chữ "natural gas" trong datasheet, ngoài bảng đã lưu) |
| 13 | mwm 1008 (25) | 1/1 (3016 V16) | "天然气应用 50 Hz", "MN=80 的天然气" (bản CN của cùng datasheet, `From:` cùng URL) | Có: cùng máy với n1007 | như n1007 | **(1) khí** (T) |
| 14 | simpson-power 124 (15) | 3/10 `fromSupplier` (ZS168FA, ZS182F, ZS190F; 7 dòng Honda GX đã `gasoline`, mức D) | "SIMPSON-GasGenerators" (tên trang); menu "Natural Gas Genset / Gasoline Genset" | Không: "GasGenerators" là tên; trang gộp menu; bảng ghi "SGH…" và mã ZS… không nói khí / xăng | luật: "Gas" dính tên không là dấu hiệu (CLAUDE.md); simpson n124 đã xử lý ở `FUEL_PAGES` chỉ dòng Honda | **(2) không rõ** (3 dòng ZS không có nguồn) |
| 15 | teksan 104 (3) | 110/110 `gensetsOf` | "The Best Natural Gas Generators are Here -Teksan"; "Teksan Natural Gas Generator Sets offer a safe energy supply…"; "Low carbon emission due to the use of natural gas fuel"; URL `/en/natural-gas-generator/` | Có: bảng "COMPARE / Model / Phase / Hz / Power / Voltage / Engine" 110 dòng, mọi mã đuôi -NG (-NG5L 56, -NG5 28, -NG5A 21, -NG5C 5; đo, không dòng nào thiếu); menu trang liệt kê cả "Diesel Generator", "Biogas Generator" (không tính) | `gensetsOf` không đọc nhiên liệu; chưa có mục `FUEL_PAGES` | **(1) khí**, M (mã -NG + tên trang + URL) |
| 16 | teksan 106 (5) | 71/71 `gensetsOf` | "Biogas Generator"; "Using methane gas with low flammability obtained from organic wastes"; "Much quieter operation thanks to the biogas engine"; URL `/en/biogas-generator-sets/` | Có: 71 dòng, mọi mã đuôi -BG5L 66 / -BG5A 5 (đo) | như #15 | **(1) khí** (biogas), M |
| 17 | vpower-hk 101 (0) | 15/15 `gensetsOf` | "VPower \| 天然气系列" (tiêu đề), mục "天然气系列"; cạnh bảng "其他燃气机组 ¶ 沼气系列" | Có: bảng "输出 / 效率" 15 dòng PPU4500NG … PPU190NG, mọi mã đuôi NG; liên kết "沼气系列" là menu sang trang kia (không tính) | như #1 | **(1) khí** (天然气), M |
| 18 | vpower-hk 102 (1) | 11/11 `gensetsOf` | "VPower \| 沼气系列" | Có: 11 dòng PPU2300BG … PPU1000BG, đuôi BG | như #1 | **(1) khí** (沼气), M |
| 19 | westinpower 113 (19) | 3/3 `gensetsOf` (LY1200, LY1600, LY2000) | "Natural Gas Generator Sets with Liyu Engines \| Westinpower" (tiêu đề), dòng nhãn ngay trên bảng "50Hz Natural Gas Generator Set", ghi chú "Liyu gas engine with standard ignition system" | Có cho bảng 3 dòng LY1200 / LY1600 / LY2000. Trang còn bảng "50Hz Biogas Generator Set" (LY1100GH/L-Z…) là bảng khác; menu trang có "Diesel Generator Sets" (không tính) | như #1; mã LY… không đuôi NG nên cũng không có mức M | **(1) khí**, T (tiêu đề trang) + dòng nhãn trên bảng (ngoài `specTables`) |
| 20 | yanmar 2002 (9) | 1/1 (TF160M) | "YTG SERIES｜Diesel/Gas Generators｜Compact Power Products｜YANMAR" (tên trang), menu "Diesel/Gas Generators" | Không: trang "YTG SERIES" ghi "A robust and durable diesel generator", "water-cooled diesel engine", URL `diesel_generators/ytgseries/` | tiêu đề nêu cả diesel lẫn khí | **(3) diesel** |

Cộng: (1) 10 bảng / 246 bản ghi · (2) 3 bảng / 13 bản ghi (1 + 9 + 3) · (3) 7 bảng / 7 bản ghi. Tổng 20 bảng / 266 bản ghi (khớp tổng "G20" 266 đo từ tsv).

## Đề xuất mục `FUEL_PAGES` cho loại (1) (chỉ nêu, không sửa)

Dạng như mục zc-power n109 (`part: "genset"`) cho 8 bảng tổ máy; mục thường (`part` mặc định "row") cho mwm. `from` lấy "M" / "B" / "T" theo cột phân loại; hàm `fuelPage` hiện đã có `from: p.from || "T"`, `header` tuỳ chọn. Số lần = số dòng khoá trong `top` / `all` của `genbid-work\dieu-phoi\dau-vao\doosan-hau-to\top30-cloud\gop-nhanh.json.gz` (1.093 gói; đo bằng cách so mọi mã model của các bản ghi, đã chuẩn hoá chữ-số, với toàn bộ khoá dòng của đúng NCC đó).

| ns | NCC | part | fuel | from | why (trích nguyên văn) | bản ghi | dòng trong `top` / `all` (gói) |
|---|---|---|---|---|---|---|---|
| [107] | frs-shenyang | genset | gas | M | 'tên trang "燃气发电机组 - 沈阳福瑞斯动力设备有限公司", mọi 23 mã đuôi -NG' | 23 | 0 / 0 |
| [101] | googol | genset | gas | B | 'bảng ghi cột "Gas Genset Model" dưới "Gas Genset COP:1000-2500kVA"' | 5 | 0 / 0 |
| [102] | googol | genset | gas | B | 'cột "Gas Genset Model" dưới "Gas Genset COP:350-750kVA"' | 6 | 0 / 0 |
| [104] | teksan | genset | gas | M | 'tên trang "The Best Natural Gas Generators are Here -Teksan", mọi 110 mã đuôi -NG' | 110 | 0 / 0 |
| [106] | teksan | genset | gas | M | 'tên trang "Biogas Generator", mọi 71 mã đuôi -BG' | 71 | 0 / 0 |
| [101] | vpower-hk | genset | gas | M | 'tiêu đề "VPower \| 天然气系列", mọi 15 mã đuôi NG' | 15 | 0 / 0 |
| [102] | vpower-hk | genset | gas | M | 'tiêu đề "VPower \| 沼气系列", mọi 11 mã đuôi BG' | 11 | 0 / 0 |
| [113] | westinpower | genset | gas | T | 'tiêu đề "Natural Gas Generator Sets with Liyu Engines" và nhãn "50Hz Natural Gas Generator Set" ngay trên bảng' | 3 | 0 / 0 |
| [1007, 1008] | mwm | row | gas | T | 'datasheet "TCG 3016 V16" ghi "Natural gas applications 50 Hz" (n1008: "天然气应用 50 Hz"); `From:` …/gas-engine-tcg-3016/' | 2 | 0 / 0 |

Giải thích số 0 (đo, không phải ước tính): (a) bản ghi `gensetsOf` có kiểu khoá `build().genset` riêng, KHÔNG nằm trong khoá dòng của Gợi ý (khoá dòng mở đầu `<ncc>|<mã động cơ>|<đầu phát>||<mã tổ máy>|…`; `suppliers/catalog-c.test.mjs` đầu tệp ghi "CHƯA nối Gợi ý"); so khớp mã model 244 bản ghi với mọi khoá của frs-shenyang (462 dòng `all`, 58 gói), googol (116 dòng `all`, 44 gói; `top` 2), westinpower (11.501 dòng `all`, 840 gói; `top` 35) → 0 khớp; teksan và vpower-hk không có khoá nào; (b) mwm không có khoá nào. Các dòng `all` / `top` của frs, googol, westinpower ở trên là dòng DIESEL (mã động cơ YC…, QTA…, 1104C44TAG2…), không phải các bảng này. Nghĩa là: đổi loại (1) không đổi `top` / `all` hôm nay. Chưa kiểm: số dòng sẽ đổi ra sao nếu về sau `gensetsOf` được nối Gợi ý (việc khác).

### Riêng 13 bảng tổ máy: `gensetsOf` cần gì để mang `fuel`

13 bảng mà bản ghi rỗng chỉ đến từ `gensetsOf` (đo lại: 13 bảng, 382 bản ghi, khớp phiên trước): frs-shenyang n107, n108 (b7, b8), googol n101, n102, kangwo-xiamen n101 (b3), teksan n104, n106, vpower-hk n101, n102, westinpower n113, yingtai-jiangsu n104 (b7), n109 (b17). Trong đó 8 bảng thuộc nhóm 20 (244 bản ghi, ở trên); 5 bảng nằm ngoài nhóm và KHÔNG phải khí: frs n108 b7, b8 (37 bản ghi): chữ khí chỉ ở dòng nav "柴油发电机组 … 燃气发电机组"; kangwo n101 b3 (17): "有害气体排放" / "harmful gases" (khí thải); yingtai n104 b7 (46): đoạn nói về "雾化柴油" (diesel); yingtai n109 b17 (38): tên trang "科克柴油发电机组" (diesel) + câu giới thiệu "柴油/燃气/双燃料" (khẩu hiệu cả hai, không là dấu hiệu).

Hiện trạng đọc ở `web/catalog.js` (`FUEL_PAGES`, `fuelPage(id, o, h0, part)`, dòng ~2413 "Fuel only from the FUEL_PAGES list"): `gensetsOf` không đọc dấu hiệu nhiên liệu của chính nó, chỉ nhận `fuel`, `fuelFrom`, `fuelWhy` từ mục `FUEL_PAGES` có `part: "genset"` (đúng như zc-power n109). Muốn bản ghi tổ máy mang `fuel` thì cần MỘT trong hai:
1. Mục `FUEL_PAGES` `part: "genset"` cho từng (ncc, n) ở bảng trên: không đổi mã đọc, 8 mục, 244 bản ghi. Danh sách tường minh, đúng tinh thần Khoa 20/11.
2. Cho `gensetsOf` gọi cùng luật `fuelOf` / `fuelSigns` như `fromSupplier` rồi thêm mức M cho "mã tổ máy đuôi -NG / -BG": mã mới, và sẽ chạm cả các bảng tổ máy khác (46 bảng `GENSET_TABLES`); chưa đo hệ quả, nên chỉ nêu.
Hai bảng vpower, teksan có mã đuôi -NG / -BG nhất quán 100% (đo trên 207 bản ghi); frs n107 100% (23); googol n101 / n102 mã GPAC… không đuôi (không có M, dùng B); westinpower mã LY… không đuôi (T).

## Ngoài nhóm 20: số bảng "chữ khí chỉ là menu / mẫu chung" (351 − 20 = 331 bảng)

Luật máy (không lấy mẫu), áp cho mọi dòng của tsv `bang-co-chu-khi-canh-bang.tsv` của từng bảng; một bảng chỉ vào nhóm khi MỌI dòng chữ của nó thoả luật:
- R1 "mẫu lặp": đoạn chữ quanh từ khoá (±25 ký tự) giống hệt nhau xuất hiện ở ≥ 3 bảng khác nhau của CÙNG NCC (menu, chân trang, câu mẫu).
- R3 "diesel cùng câu": đoạn chữ khí có chữ diesel / 柴油 ngay trong câu (không đủ để gọi là menu: có thể là câu "diesel và khí" thật).
- Còn lại: "chưa soát".

| nhóm (331 bảng) | bảng | bản ghi rỗng |
|---|---|---|
| R1 mẫu lặp ≥ 3 bảng cùng NCC (menu / mẫu chung theo luật máy) | **220** | 3.409 |
| R3 chữ khí cạnh chữ diesel trong cùng câu, chưa chứng minh là menu | **66** | 1.781 |
| chưa soát | **45** (27 bảng có cụm khí mạnh, 18 bảng chỉ chữ "gas" riêng như "exhaust gas turbochargers"; 0 bảng có chữ ở tiêu đề / tên trang, cả 45 ở dòng cạnh bảng) | 1.403 |
| cộng | 331 | 6.593 |

(6.593 + 266 của nhóm 20 = 6.859, khớp tổng.) Quyết định: chỉ 220 bảng là "menu / mẫu chung" theo luật máy; 66 bảng R3 và 45 bảng chưa soát KHÔNG được gọi là menu. Trong 45 bảng chưa soát có NCC nhiều bảng: jichai 5, zhengchi-power 4, gb-power 3, voltgent 3 (ví dụ gb-power n106, n116, n117: dòng nav "Nature Gas Generator Set" kèm tên dòng khác nhau mỗi trang nên luật R1 không bắt được; có thể là menu, chưa soát). Cũng chưa soát: trong 220 bảng R1, luật chỉ chứng minh chữ lặp, không chứng minh mọi lần lặp là menu (ví dụ comler-power n111: "康姆勒燃气发电机组" lặp ở mục nav, nhưng chưa mở trang xem bảng có phải máy khí).

## Việc chưa kiểm / rủi ro
- Không mở trang sống (maxAge 0): chỉ đọc tệp nguồn đã lưu (13–18/11/2026). Chữ nguyên văn trích từ tệp lưu.
- mwm n1007 / n1008: chữ khí nằm ngoài bảng đã lưu (`specTables`), và `FUEL_PAGES` mặc định so `header` của bảng đã lưu: nếu dùng mục có `header` phải lấy từ `s.specTables`.
- kingway n117: chưa mở trang sống xem bảng "Engine Specifications" ("Fuel | Biogas") có bản lưu riêng; bản lưu này chỉ có bảng nhãn.
- man-engines n104: không có nguồn nói dòng nào là khí; không suy từ tiền tố D / E.
- Luật R1 / R3 ở mục 351 − 20 là luật máy do tôi đặt trong phiên này (script `genbid-test\phan2.mjs`, kết quả `genbid-test\phan2-out.json`), chưa ai duyệt.
- Không có PR, không đổi mã / dữ liệu.

## Cần ghi nhớ
- Nhóm 20 chỉ có 10 bảng loại (1); trong 13 bảng tổ máy chỉ 8 bảng là khí (244 bản ghi), 5 bảng còn lại KHÔNG phải khí.
- Loại (1) không đổi `top` / `all` của gói đã đo (0 / 0); giá trị của việc ghi `fuel` cho tổ máy gắn với việc nối `gensetsOf` vào Gợi ý.
- Mahindra-powerol (6 trang) và Yanmar YTG: chữ "Gas" trong tên trang là mẫu chung, trang là diesel.
