# Nghiệm thu: lọc cứng ứng viên `candidates()` (PR A, nhánh `cand-filter`)

Worktree `C:\Projects\GenSet Pro\wt-cand-filter` (từ origin/main 05bcec4). Trước = origin/main (`wt-base-filter`, tạm). Không chạy agent, không ghi web.

## Tệp đổi
- `suppliers/config-bot.mjs`: `candidates()`.
- `suppliers/config-prompt.md`: "power 95–140%" → "100–120%".
- Test: `suppliers/cand-filter.test.mjs` (mới, 5 test); `suppliers/config-accuracy.test.mjs` (3 test cũ đổi: dòng dưới ngưỡng nay không có trong `top`, có trong `dropped`).

## Cách làm
1. **Dải công suất** `near`: 95%–140% → `NEAR_LOW = 0.995` … `NEAR_HIGH = 1.2` (export). Cận dưới 0.995 là dung sai làm tròn mà `gap` và kiểm Prime của chính `candidates()` đang dùng. Cận trên cộng 1e-9 để 250×1.2, 600×1.2 không rớt do số thực. Tiêu đề `catalog.md` ghi "từ 100% đến 120%".
2. **Loại hẳn**: dung tích < min, số xi lanh < min, Prime < min, dung tích > max không trừ 600 điểm nữa mà bỏ dòng khỏi `rows` / `top`; dòng bỏ nằm ở trường mới `dropped` (kèm `ruled`: `disp|maxDisp|cyl|prime`). Giữ nguyên: điều kiện "mọi nguồn có số đều dưới ngưỡng" (nguồn lệch nhau / không có số → không loại), `plausible()`. Ngoại lệ: dòng `named` (HSMT ghi đúng model động cơ) vẫn ở lại, trừ 600 + lý do như cũ. Dòng `keep` dưới ngưỡng vẫn bị loại (lượt `candidates` gọi lại cho `keep` dùng cùng hàm). Tiêu hao nhiên liệu vượt (−300) giữ nguyên, chỉ thêm cờ `fuelOver` trên dòng để đo.
3. **`r.score > 0`** (giữ chỗ sync, MAKE_ROWS): rà lại. Dòng dưới ngưỡng không còn trong `rows` nên các chỗ đó không thấy chúng nữa (trước đây dòng "bị loại" mà có điểm hãng/model HSMT nêu cao vẫn có thể có điểm > 0 và được giữ chỗ). Điều kiện `score > 0` vẫn cần cho dòng bị trừ nhiên liệu (−300) và giữ nguyên. Dòng `named` dưới ngưỡng có điểm 400+ nên vẫn được xét như trước. Chỉ sửa chú thích.
4. `catalogMd` dùng `all` (= `rows`) để liệt kê thêm NCC / động cơ ở các mục sau: dòng bị loại nay cũng không vào các mục đó (cùng ý: động cơ dưới ngưỡng).

## Chỗ cùng dải đã rà (không phải `altFits`)
| chỗ | dải | quyết định |
|---|---|---|
| `candidates()` `near` (config-bot.mjs ~791) | 95–140% | ĐỔI (chọn ứng viên cho agent) |
| tiêu đề `catalogMd` + `config-prompt.md` dòng 30 | chữ "95–140%" | ĐỔI cho khớp |
| `fitsCap` (~3223, productLines của NCC) | 0.95 … 1.4 | KHÔNG ĐỔI: dùng cho Tìm NCC (`findCheck` xem NCC mới tìm có hợp công suất), không chọn ứng viên cho agent. Cần Khoa quyết nếu muốn 100–120% |
| `engineRows` (~3229), `mergeFind.near` (~3266) | 100% … 140% | KHÔNG ĐỔI: mergeFind gắn NCC Tìm NCC vào cấu hình đã gợi ý. Đã dùng cận dưới 100% sẵn; nếu đổi 140% → 120% thì NCC tìm thêm ở 120–140% sẽ không vào cấu hình. Cần Khoa quyết |
| `altFits` (~741, đầu phát 1–1.4 lần tổ máy) | 0.995 … 1.4 | KHÔNG ĐỤNG (theo chỉ thị) |

## Số đo (14 cỡ của 12 gói; `scratchpad\met.mjs`, `cmpA.mjs`, `cmpA.out`; bản chụp supplier = doc-cache/supplier.json 12/11, configmatch = doc-cache/configmatch.json md5 d106239e…; có `keep` từ configmatch như lượt thật)
Tổng 14 cỡ: dòng qua lọc công suất 61.196 → 48.507 (đổi dải); bị loại thêm theo ngưỡng 4.581 dòng (Prime 3.146, dung tích tối thiểu 1.430, số xi lanh 5, dung tích tối đa 0; một dòng có thể dính hai lý do); còn lại 44.235 dòng xếp hạng. **Số cỡ còn < 30 dòng: trước 0, sau 0** (cả 14 cỡ đủ 30; ít nhất còn 316 dòng xếp hạng ở IB2600592684 30).

| cỡ | dòng trong dải trước → sau | loại: dung tích min / max / xi lanh / Prime | còn xếp hạng | động cơ khác nhau trong 30 | hãng động cơ trong 30 (trước → sau) |
|---|---|---|---|---|---|
| IB2600574589 400 | 2925 → 1810 | 173/0/2/499 | 1247 | 18 → 17 | Cummins11 Yuchai8 Volvo4 Weichai4 Perkins3 → như cũ |
| IB2600581294 500 | 3094 → 1814 | 0/0/0/430 | 1384 | 18 → 17 | Cummins9 Yuchai8 Perkins6 Volvo4 Baudouin1 Wudong1 Weichai1 → Cummins10 Yuchai8 Volvo4 Perkins3 Weichai3 Baudouin1 Wudong1 |
| IB2600581977 250 | 2709 → 1553 | 928/0/2/271 | 550 | 20 → 19 | Cummins17 SDEC3 Volvo2 Perkins2 Yuchai2 Doosan2 Wudong1 Weichai1 → Cummins18 SDEC5 Doosan2 Wudong1 MAN1 Perkins1 Weichai1 Yuchai1 |
| IB2600586587 160 | 1752 → 1176 | 0/0/0/415 | 761 | 18 → 18 | Yuchai12 Perkins7 Cummins7 Weichai2 Volvo1 MAN1 → Yuchai12 Cummins8 Perkins5 Weichai2 Volvo1 Lovol1 SDEC1 |
| IB2600592658 500 | 3011 → 1765 | 0/0/0/408 | 1357 | 11 → 12 | Cummins30 → Cummins30 |
| IB2600592684 30 | 1139 → 645 | 329/0/0/0 | 316 | 8 → 10 | Cummins30 → Cummins28 Hyundai1 Perkins1 |
| IB2600592684 500 | 3011 → 1765 | 0 | 1765 | 11 → 12 | Cummins30 → Cummins30 |
| IB2600594596 300 | 2700 → 1558 | 0 | 1558 | 15 → 15 | như cũ (Cummins11 Yuchai6 Volvo5 Weichai4 Perkins3 Doosan1) |
| IB2600594596 400 | 3016 → 1862 | 0 | 1862 | 21 → 20 | Cummins13 Yuchai7 Volvo5 Perkins3 Doosan1 Weichai1 → Cummins10 Yuchai7 Volvo5 Perkins5 Weichai2 Doosan1 |
| IB2600595853 500 | 3011 → 1765 | 0/0/0/408 | 1357 | 11 → 12 | Cummins30 → Cummins30 |
| IB2600599817 (không cỡ) | 29757 → 29757 | 0 | 29757 | 18 → 18 | như cũ; catalog.md giống hệt (md5 trùng) |
| IB2600601812 100 | 1677 → 1005 | 0/0/0/183 | 822 | 23 → 23 | Yuchai8 Cummins5 Perkins4 Volvo2 SDEC2 Deutz2 Baudouin2 Ricardo2 Weichai1 Lovol1 FAWDE1 |
| IB2600602880 150 | 2024 → 1143 | 0/0/0/214 | 929 | 12 → 12 | Cummins30 → Cummins30 |
| IB2600603983 700 | 1370 → 889 | 0/0/1/318 | 570 | 24 → 22 | Cummins10 Perkins8 Volvo3 Baudouin3 Mitsubishi3 MTU3 (trước có thêm MAN2) |

Số hãng động cơ khác nhau trong 30 dòng (trước → sau) theo từng cỡ: 5→5, 7→7, 8→8, 6→7, 1→1, 1→3, 1→1, 6→6, 6→6, 1→1, 5→5, 11→11, 1→1, 7→6. Nhóm xuất xứ động cơ / NCC: gần như không đổi (đổi ≤ 2 dòng; IB2600581294 500: động cơ ngoài do NCC TQ chào 19→17, động cơ TQ 10→12; IB2600601812 100: 18→17 và 12→13). Kích thước catalog.md 14 cỡ: 2.021.877 → 1.961.050 ký tự (−3,0%; từng cỡ từ −16,0% (IB2600581977 250) đến +4,1% (IB2600592684 30)). Các dòng `named`: 48 → 48.

**Tiêu hao nhiên liệu (CHƯA đổi, chỉ đo "nếu loại")**: dòng bị trừ −300 nằm trong tập còn xếp hạng: IB2600574589 400: 48 dòng (31 động cơ), IB2600581294 500: 88 (50), IB2600601812 100: 18 (13), IB2600603983 700: 44 (20), 10 cỡ còn lại 0. Trong 30 dòng đầu: **0 dòng ở cả 14 cỡ** (vì −300 đã đẩy chúng xuống). Loại hẳn thì 30 dòng không đổi; tập xếp hạng nhỏ đi 198 dòng tổng; không cỡ nào xuống dưới 30.

## Hồi quy: cấu hình của lượt trước (configmatch.json) còn dòng trong danh sách mới không
54 cấu hình ở 12 gói / 14 cỡ (so tập dòng của chính các NCC của cấu hình × động cơ đó): **top 34** (trong đó 1 cấu hình đổi từ ngoài 30 vào 30: IB2600581294 500 hạng 4 WP13D490E310), ngoài 30 nhưng còn dòng 8 (như trước), **mất vì ngoài dải 100–120%: 6**, không có dòng nào của NCC đó từ trước 3 (QSZ13-G3 depco-power ×2, P126TI rehlko ở 250), không có động cơ trong catalog 3 (như trước). **Mất vì dưới ngưỡng HSMT: 0** (không cấu hình nào).

Mất vì ngoài dải (tỉ lệ công suất dòng nhỏ nhất của NCC so với cỡ):
| cỡ | hạng | cấu hình | công suất dòng của NCC | ghi chú |
|---|---|---|---|---|
| IB2600581977 250 | 1 | TAD1351GE (jet-power, dingbo, rise-power) | 125–136% (jet-power 313 kVA) | mất cả cấu hình hạng 1 |
| IB2600581977 250 | 3 | WP12D317E200 (bobig, jet-power, longkai) | 125% | trước cũng ngoài 30 |
| IB2600581977 250 | 5 | TAD1352GE | 130–160% | |
| IB2600586587 160 | 1 | 1106A-70TAG4 (tecgen-fujian, hosem-power, uleengen) | 125% (200 kVA) | động cơ còn 1 dòng của dingbo (187,5 kVA = 117%); 3 NCC của cấu hình mất |
| IB2600592684 30 | 4 | 4BT3.9-G2 (aosif, fdk-energy, dingbo) | 125–150% | động cơ còn dòng của NCC khác (minsun-motor, rise-power) |
| IB2600592684 30 | 5 | QSB3.9-G33 | 123–207% | |

**IB2600594596 400 kVA**: HSMT có hai ngưỡng dung tích (dòng 185 "≥ 14,5 L", dòng 370 "≥ 9 L" cho cỡ 300) nên `engineMins` ra `minDisp = null`, `minCyl = null` (một HSMT hai giá trị khác nhau thì không đọc): **không có ngưỡng nào áp dụng, không dòng nào bị loại** (0 dòng loại cả hai cỡ). Rehlko P158LE: **còn** (hạng 1 cấu hình = top→top; hạng 2 aosif cut→cut như trước). QSG12-G4 (6 dòng, 0 trong 30), TAD1355GE (16 dòng, 1 trong 30), YC6K520-D30 (19 dòng, 2 trong 30): **không bị loại bởi ngưỡng** (vì ngưỡng không đọc ra), cũng không đổi vì dải: tỉ lệ công suất 100–120% (TAD1355GE có thêm 1 dòng ở 1037% = số lẻ của bảng, vốn ngoài dải cũ).

## Test
`node --test` (suppliers/): 302 pass, 0 fail (297 test có sẵn, 3 trong đó sửa, + 5 mới). `node suppliers/verify.mjs`: 433 bản ghi, 0 lỗi. Test mới: biên 397/398/400/480/481/600 cho cỡ 400; 250→300 và 600→720 ở biên 120%; loại theo từng ngưỡng (dung tích min, dung tích max, Prime; xi lanh) kèm `dropped.ruled`; ngoại lệ `named` (còn, điểm 0<s<1000, có lý do); nguồn lệch nhau / không có số thì không loại; dòng `keep` dưới ngưỡng vẫn bị loại.

## Rủi ro
- Mất cấu hình hạng 1 của IB2600581977 250 (TAD1351GE, jet-power 313 kVA = 125%) và IB2600586587 160 (1106A-70TAG4, 3 NCC): hệ quả trực tiếp của dải 120% Khoa chốt. Gợi ý lại các gói này sẽ khác.
- Dải 120% bỏ các dòng mà NCC chỉ có cỡ liền trên (250 → 313 kVA). Với cỡ nhỏ (IB2600592684 30) bước cỡ chuẩn lớn hơn 20% nên có ít dòng hơn (316 xếp hạng).
- `catalogMd` mục "NCC khác chào động cơ" và "động cơ khác" lấy từ `rows`: nay không có dòng dưới ngưỡng / ngoài dải.
- Tìm NCC (`fitsCap`, `engineRows`, `mergeFind`) vẫn 95–140% / 100–140%: một NCC mới tìm thấy ở 120–140% vẫn gắn vào cấu hình nhưng dòng đó không vào ứng viên lần sau (chờ Khoa quyết).
- Quay lui: revert PR; sau merge restart bot (GenBid-Bot.ps1 nạp một lần).

## Chưa kiểm
- Chưa chạy agent thật; chưa biết chất lượng cấu hình agent chọn từ danh sách mới.
- Bản chụp web (supplier / hsmt) là bản 12/11; `prevResult` (configmatch) là lượt trước, tập `keep` lấy từ đó.
- Chưa đo tiêu hao nhiên liệu loại hẳn trên bản chạy thật (chỉ đếm dòng có cờ).
