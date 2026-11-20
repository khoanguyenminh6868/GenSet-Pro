# may-khi-4 — kiểm toàn bộ đo đám mây cuối (main 091b5c26 ↔ khi-fuel-2 c70ce420)

Đầu vào: `dau-vao/may-khi/top30-cloud-2` (gop-goc / gop-nhanh, bidhist tải 2026-11-20T02:07:56Z). Nhiên liệu HSMT tính lại ở máy bằng
`fuelOfHsmt(technicalPart(text))` từ `doc-cache/bidhist.json` (đủ 890 thông báo); `fuel` của dòng lấy từ catalog dựng ở c70ce420,
khoá dòng đúng như `do-gop.mjs`. Script: `dau-vao/may-khi/4-kiem-loai.mjs`, `4-nguon-bang.mjs`, `4-mot-luot.mjs`.
Tệp: `4-loai-tung-khoa.tsv` (11.563 dòng = TỪNG khoá × lượt bị loại: fuel, fuelFrom, fuelWhy, nhiên liệu HSMT, nêu/mặc định, fuelOff,
kết luận), `4-tong.txt`, `4-nguon-bang.md` (nguồn từng bảng), `4-vao-top.tsv`, `4-vao-top-soi.md`, `4-ib12797.txt`.

## 1. Khoá bị loại: 520 khoá khác nhau, 11.563 cặp khoá × lượt

Mọi cặp đều có dòng trong catalog và `fuelOff(HSMT, fuel dòng) = true`; **0 dòng diesel / không ghi `fuel` bị loại** (0 BUG).

| fuel dòng @ HSMT | cặp khoá×lượt |
|---|---|
| gas @ diesel | 11.039 |
| gasoline @ diesel | 394 |
| dual @ diesel | 123 |
| gas @ gasoline | 7 |

Mọi lượt bị loại là HSMT "diesel" (nêu hoặc mặc định) hoặc xăng; không lượt nào loại dòng khi HSMT ghi khí (vì HSMT khí = 0 trong bidhist).

Theo NCC (khoá khác nhau / cặp khoá×lượt; mức fuelFrom): westinpower 71/2.067 (T), agg-fuzhou 42/1.308 (M), aosif 82/953 (B),
yingtai 31/871 (T), rise-power 20/826 (T), victory 23/816 (T 441 + B 375; gas 342, gasoline 375, dual 99), taihai 25/774 (B),
weiman 19/756 (T), penlucky 21/685 (M), kaihua 19/667 (T), huayuan 19/614 (B), naipute 14/485 (B 353 + T 132), simpson 10/405 (T),
ettes-power 97/187 (T), ronsun 3/50, power-hf 8/27, slong 4/24 (dual), cameo 3/14 (gasoline), jichai 1/13, tide 1/10, kiger 1/5 (gasoline),
mwm 4/4, innio 1/1, xinshengan 1/1. (Khớp số của điều phối.)

Nguồn khí đã mở từng bảng (`4-nguon-bang.md`) — đều là bảng khí thật:
- **aosif** (82 khoá, B): 10 bảng, tiêu đề "Cummins / Hyundai / Perkins / Weichai / Yuchai **Natural Gas** Series" và "Cummins **Biogas** Series"; bảng ghi chữ Natural Gas / Biogas.
- **ettes-power** (97, T): 5 bảng "MWM / MAN / Cummins **Natural Gas** Power Generator, CHP" và "MAN **Biogas** … CHP" (CHP = nhiệt điện kết hợp chạy khí).
- **yingtai** (31, T): "燃气发电机组" (n114). **taihai** (25, B): "天然气发电机组" (n118) và bảng ghi 燃气. **weiman** (19, T): "Gas Generator Set – WEIMAN" (n101).
- **kaihua** (19, T): "gas generator, Gas Generator-…" (n116); chữ DIESEL trong tên công ty không tính.
- **penlucky** (21, M): "Gaseous Industrial Generators", URL /gas-generator/, mã `GGP…*NG3`. **rise-power** (20, T): "Gas Powered Generator Set | Gas Generator". **huayuan** (19, B): "Cummings series gas generator set", cột 燃气.
- **naipute** (14): bảng ghi "Fuel Type | Natural gas / Biogas / LPG" (B) hoặc "biomass gas generator" (T). **victory**: bảng "Gasoline" (B) hoặc tiêu đề "Gasoline" / "Gas(LPG)" (T), đúng như fuel.test.

## 2. Mục "111 dòng đổi điểm": bỏ theo đính chính của điều phối

Một khoá xuất hiện nhiều lần trong cùng lượt với điểm khác nhau (kanpor `4BT39G1` = [139, 112] ở CẢ gốc lẫn nhánh) nên không có dòng còn lại nào đổi điểm.
(Tôi cũng chạy `4-mot-luot.mjs` ở hai bản cho IB2200011710#0: cả hai in 139 và 112 — khớp đính chính.)

## 3. 134 khoá vào top (193 cặp khoá×lượt)

Tất cả vào ở lượt HSMT diesel; không khoá nào là dòng khí / xăng (không dòng nào có `fuel` — nếu có thì `fuelOff` đã loại). Soát chữ khí / xăng
(gas, natural, NG, LPG, gasoline, petrol, 燃气…) trong tiêu đề, URL, dòng, mã: 6 khoá nghi, đều không phải máy khí:
- `gb-power n1024`: "Gas Feeding Model" = kiểu cấp khí nạp (datasheet diesel 2506C-E15TAG2).
- `sr-genset n2002` (4BTA3.9 Cummins diesel): trùng chữ "ng" trong "bảng 1" (regex soát khớp nhầm), không có chữ khí.
- `victory n125` (F6L913D): "Naturally aspirated".
- `victory n129 / n133` (LA290): tiêu đề "Diesel Twin-cylinder", cột "Gasoline Consumption" = nhãn sai của NCC; cố ý để rỗng (fuel.test).
Các khoá còn lại không có chữ khí / xăng nào (phần lớn tiêu đề ghi Diesel). Vì vậy: vào top = dòng diesel hoặc "không rõ" (rỗng), không có khí / xăng ghi rõ.
Rỗng ≠ diesel: các dòng này vào ở lượt diesel (HSMT nêu hoặc mặc định), đúng quy tắc Khoa ("thà thiếu còn hơn sai": dòng chưa rõ không bị loại).

## 4. IB2200012797#0 — 8 dòng victory LT620

HSMT "Máy phát điện chạy dầu Diesel", `fuelOfHsmt` = diesel (nêu, "chạy dầu"). LT620 (VT11000S/ME): bảng n130 "8.5KW~10.5KW Gasoline Twin-cylinder Generator"
và n132 "…Silent Gasoline Twin-cylinder Generator": `fuel = gasoline`, fuelFrom **B**, why `bảng ghi "gasoline"` — 8/8 dòng bị loại, đúng.
Quan sát phụ (không thuộc PR này, chưa kiểm): ở gốc các dòng này lên điểm 89–169 với công suất đọc "85/106 kVA" (có thể là 8.5/10.6 thiếu dấu thập phân)
nên mới vào top của gói 14 kW; xin điều phối cho biết có mở việc riêng không.

## Việc sau (ghi 20/11/2026, chưa sửa): victory LT620 "85/106 kVA"

Đã mở nguồn (victory-generator n130 "8.5KW~10.5KW Gasoline Twin-cylinder Generator", n132 "…Silent…", URL victorygenerator.com/victory/8.5kw-10.5kw-silent-gasoline-twin-cylinder-generator.html): ô ghi `Rated.AC output (KVA) | 8.5 | 10.6` và `9.5 | 11.9`
(Max 9.5/11.9 và 10.5/13.1); Rated Output của động cơ "17HP (12.5KW)", Max "20HP (14.7KW)". Bản ghi `fromSupplier` đọc ĐÚNG `rated kVA` 8.5 / 10.6 / 9.5 / 11.9.
"85/106" chỉ là chữ trong khoá dòng (`keyOf` bỏ dấu chấm), KHÔNG phải công suất đọc sai → giả thuyết "mất dấu thập phân" bị bác.
Còn lại chưa rõ: vì sao các dòng 8.5–11.9 kVA vẫn lọt top (điểm 89–169) ở IB2200012797 (HSMT ≥ 14 kW, ~17.5 kVA): chưa tra (có thể dải công suất `near` hoặc lấy kW động cơ 12.5 / 14.7); nếu muốn biết, mở việc riêng.

## Gộp main #968/#974 (20/11/2026)

khi-fuel-1 `ca56dcce`, khi-fuel-2 `b84feda9` (gộp origin/main d70bdf45; xung đột chỉ ở `web/CLAUDE.md`, giữ cả hai mục). Test 1362 / 1369 xanh.
So với c70ce420 bằng `4-so-hai-ban.mjs` (cây mã làm tham số; ra `4-hai-ban-c70ce420.json` và `4-hai-ban-b84feda9.json`): `diff` ra GIỐNG HỆT — md5 `build(cn)` engines /
alternators / controllers, md5 `fuel` / `fuelFrom` / `fuelWhy` của 694 uses có fuel, và với 6 fixture `suppliers/fixtures/runs` (NCC đóng băng): md5 build + md5 top / all / số dropped của `candidates`.
Khác biệt duy nhất của hai cây là phần `gensets` / `rated` của #968 (ngoài phạm vi so).

## Kết luận

Không phát hiện lỗi; không có commit mới ở khi-fuel-1 / khi-fuel-2 (c70ce420 giữ nguyên).
