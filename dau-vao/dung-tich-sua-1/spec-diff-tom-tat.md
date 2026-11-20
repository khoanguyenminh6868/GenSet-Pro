<!-- spec-diff -->
## Kiểm chéo danh mục (spec-diff): git:b8752924 ↔ .

- Bản ghi: 60.075 → 60.075; **76** đổi, 0 mất, 0 thêm, ở 11 bảng của 7 NCC
- Tổ máy bảng không ghi mã động cơ (`gensetsOf`, chưa nối Gợi ý): 1.700 → 1.700; 0 đổi, 0 mất, 0 thêm (bản đầy đủ: phần "tổ máy" của artifact)
- Đảo vai động cơ ↔ đầu phát (mã mà ≥ 3 NCC khác đọc ở vai kia): 0 → **0** ✅
- Tự kiểm số với công suất của dòng: 96 giá trị đổi / thêm không tự xác nhận được (soát tay)
- Chưa đọc được (`node suppliers/unread-tables.mjs`, để thiếu thay vì đoán): bảng không cho bản ghi nào: 3.067 → 3.067; dòng điện / điện áp theo vị trí không khớp công suất: 227 → 227; dòng là cặp nhãn | giá trị: 164 → 164; số vô lý so với công suất: 139 → 139; dòng tổng quan dòng máy: một dải công suất, không là một tổ máy: 90 → 90; số bằng đúng công suất của dòng, không là khối lượng / độ ồn: 77 → 77; dòng không đúng bố cục cột của bảng tổ máy: không đọc: 53 → 53; tổ máy nhiều động cơ: 40 → 40; mã đầu phát trùng model tổ máy: 37 → 37; thông số không đúng dạng: để trống: 34 → 34; cặp a/b dưới nhãn không ghi mức / đơn vị: 34 → 34; ô động cơ không đọc được, mã ở cột khác: 32 → 32; một ô ghi hai mã: 26 → 26; ngoại lệ theo dòng: 14 → 26; điện áp trùng công suất của dòng: 6 → 6; dòng bảng tổ máy không có model: 6 → 6; dòng máy lẫn với dòng tiêu đề: 5 → 5; dòng điện tổ máy không khớp công suất: 5 → 5; công suất prime không đọc được: để trống: 4 → 4; prime lớn hơn standby: để trống cả hai: 3 → 3; công suất standby không đọc được: để trống: 3 → 3; bảng máy khí: dòng máy trong tiêu đề không đọc thêm: 2 → 2; trang có hai động cơ: số liệu kích cỡ động cơ không rõ của động cơ nào: 2 → 2; số có dấu phẩy nghìn / thập phân không rõ: 2 → 2; ô dòng điện không đọc được thành số: 1 → 1
- Thay đổi là chủ ý thì không chặn; vẫn phải soát MỌI dạng và đo top 30 ứng viên bằng tay (bộ nhớ kiem-cheo-toan-bo). Bản đầy đủ: artifact `spec-diff` của lượt chạy.

### Theo NCC

| NCC | dòng đổi | đổi | mất | thêm |
|---|--:|--:|--:|--:|
| honny-dongguan | 36 | 36 | 0 | 0 |
| tellhow-power | 14 | 14 | 0 | 0 |
| mingbang-mbkl | 7 | 7 | 0 | 0 |
| waeta-fujian | 7 | 7 | 0 | 0 |
| jlmech-wuhan | 5 | 5 | 0 | 0 |
| yunding-jiangsu | 4 | 4 | 0 | 0 |
| frs-shenyang | 3 | 3 | 0 | 0 |

### Dạng thay đổi (vài ví dụ mỗi dạng)

**disp thêm**: 64 lượt, 5 NCC
```
frs-shenyang n103 b2 dòng 63 YC16VC3000-D31: ∅ → 105.56
    | FRS-1800Y | 1800 | 2000 | 7120*2630*3020 | 12192*2438*2896 | 20000 | 30000 | YC16VC3000-D31 | 16/V | 200*210 | 105.56 | ≤195 | 430 | 530
honny-dongguan n101 b0 dòng 36 QTA20V-EG2950D: ∅ → 108
    | HGM3300E | 3300 | 3000 | 2640 | 2400 | 611 | 4330 | QTA20V-EG2950D | 2950 | 2680 | V20 | 185 | 200 | 108 | 15：1 | GP3000-4P | 7300 | 2900 | 3300 | 21500
tellhow-power n123 b9 dòng 10 YC16VC3000-D31: ∅ → 105.56
    | THHY1800 | 1800 | 2000 | 7440×2555×3170 | 21800 | YC16VC3000-D31 * | 16/V | 105.56 | 206 | 430 | 650
```
**fuel thêm**: 14 lượt, 1 NCC
```
tellhow-power n123 b9 dòng 10 YC16VC3000-D31: ∅ → 206
    | THHY1800 | 1800 | 2000 | 7440×2555×3170 | 21800 | YC16VC3000-D31 * | 16/V | 105.56 | 206 | 430 | 650
tellhow-power n123 b9 dòng 11 YC16VC3300-D31: ∅ → 206
    | THHY2000 | 2000 | 2200 | 7640×2555×3170 | 21950 | YC16VC3300-D31 * | 16/V | 105.56 | 206 | 430 | 650
tellhow-power n123 b9 dòng 12 YC16VC3600-D31: ∅ → 207
    | THHY2200 | 2200 | 2400 | 7740×2555×3170 | 22300 | YC16VC3600-D31 * | 16/V | 105.56 | 207 | 430 | 650
```
**disp bỏ**: 8 lượt, 2 NCC
```
jlmech-wuhan n104 b3 dòng 2 YCD4J12D-55: 433 → ∅
    | JL-40GF | 40 | 50 | 72 | YCD4J12D-55 | 4 | 105*125 | 433 | 11 | 225 | 1800*800*1100 | 800
mingbang-mbkl n125 b5 dòng 7 TAD1341GE: 3.3 → ∅
    | 8 | MB-V252 | 315 | 252 | 347 | 277 | TAD1341GE | 4 | 3.3 | 105*127 | 61.7 | 4000×1800×2300
mingbang-mbkl n125 b5 dòng 8 TAD1342GE: 3.3 → ∅
    | 9 | MB-V280 | 350 | 280 | 385 | 308 | TAD1342GE | 4 | 3.3 | 105*127 | 76.9 | 4000×1800×2300
```
**cyl bỏ**: 7 lượt, 1 NCC
```
mingbang-mbkl n125 b5 dòng 7 TAD1341GE: 4 → ∅
    | 8 | MB-V252 | 315 | 252 | 347 | 277 | TAD1341GE | 4 | 3.3 | 105*127 | 61.7 | 4000×1800×2300
mingbang-mbkl n125 b5 dòng 8 TAD1342GE: 4 → ∅
    | 9 | MB-V280 | 350 | 280 | 385 | 308 | TAD1342GE | 4 | 3.3 | 105*127 | 76.9 | 4000×1800×2300
mingbang-mbkl n125 b5 dòng 9 TAD1343GE: 4 → ∅
    | 10 | MB-V300 | 375 | 300 | 413 | 330 | TAD1343GE | 4 | 4.4 | 105*127 | 69.9 | 4000×1800×2300
```
**disp đổi**: 4 lượt, 1 NCC
```
jlmech-wuhan n102 b1 dòng 12 SC15G500D2: 142 → 14.2
    | JL-320GF | 320 | 400 | 576 | SC15G500D2 | 6 | 135*165 | 142 | 41 | 205 | 3100*1250*1650 | 2700
jlmech-wuhan n102 b1 dòng 13 sC15G500D2: 142 → 14.2
    | JL-350GF | 350 | 437.5 | 630 | sC15G500D2 | 6 | 135*165 | 142 | 41 | 205 | 3150*1250*1650 | 2800
jlmech-wuhan n103 b2 dòng 0 403D-15G: 149 → 1.496
    | JL-10GF | 10 | 2.5 | 18 | 403D-15G | 3 | 84*90 | 149 | 6 | 248 | 1250*700*1100 | 350
```
**bore thêm**: 3 lượt, 1 NCC
```
frs-shenyang n103 b2 dòng 63 YC16VC3000-D31: ∅ → 200*210
    | FRS-1800Y | 1800 | 2000 | 7120*2630*3020 | 12192*2438*2896 | 20000 | 30000 | YC16VC3000-D31 | 16/V | 200*210 | 105.56 | ≤195 | 430 | 530
frs-shenyang n103 b2 dòng 64 YC16VC3300-D31: ∅ → 200*210
    | FRS-2000Y | 2000 | 2200 | 7410*2630*3020 | 12192*2438*2896 | 20500 | 30500 | YC16VC3300-D31 | 16/V | 200*210 | 105.56 | ≤195 | 430 | 530
frs-shenyang n103 b2 dòng 65 YC16VC3600-D31: ∅ → 200*210
    | FRS-2200Y | 2200 | 2400 | 7580*2630*3020 | 12192*2438*2896 | 21000 | 31000 | YC16VC3600-D31 | 16/V | 200*210 | 105.56 | ≤195 | 430 | 530
```

### Không tự xác nhận được

| dạng | số |
|---|--:|
| disp thêm: mới KHÔNG xác nhận | 64 |
| fuel thêm: mới không kiểm được | 14 |
| disp bỏ: mới không kiểm được | 8 |
| cyl bỏ: mới không kiểm được | 7 |
| bore thêm: mới không kiểm được | 3 |

```
frs-shenyang n103 b2 dòng 63 disp: ∅ → 105.56 | {"rated":{"kW":1800},"standby":{"kW":2000}}
frs-shenyang n103 b2 dòng 63 bore: ∅ → 200*210 | {"rated":{"kW":1800},"standby":{"kW":2000}}
frs-shenyang n103 b2 dòng 64 disp: ∅ → 105.56 | {"rated":{"kW":2000},"standby":{"kW":2200}}
frs-shenyang n103 b2 dòng 64 bore: ∅ → 200*210 | {"rated":{"kW":2000},"standby":{"kW":2200}}
frs-shenyang n103 b2 dòng 65 disp: ∅ → 105.56 | {"rated":{"kW":2200},"standby":{"kW":2400}}
frs-shenyang n103 b2 dòng 65 bore: ∅ → 200*210 | {"rated":{"kW":2200},"standby":{"kW":2400}}
honny-dongguan n101 b0 dòng 36 disp: ∅ → 108 | {"standby":{"kVA":3300,"kW":2640},"prime":{"kVA":3000,"kW":2400}}
honny-dongguan n101 b0 dòng 36 disp: ∅ → 108 | {"standby":{"kVA":3300,"kW":2640},"prime":{"kVA":3000,"kW":2400}}
honny-dongguan n101 b0 dòng 37 disp: ∅ → 108 | {"standby":{"kVA":3438,"kW":2750},"prime":{"kVA":3125,"kW":2500}}
honny-dongguan n101 b0 dòng 37 disp: ∅ → 108 | {"standby":{"kVA":3438,"kW":2750},"prime":{"kVA":3125,"kW":2500}}
honny-dongguan n101 b0 dòng 38 disp: ∅ → 108 | {"standby":{"kVA":3438,"kW":2750},"prime":{"kVA":3125,"kW":2500}}
honny-dongguan n101 b0 dòng 38 disp: ∅ → 108 | {"standby":{"kVA":3438,"kW":2750},"prime":{"kVA":3125,"kW":2500}}
… còn 84
```
