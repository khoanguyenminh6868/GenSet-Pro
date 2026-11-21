<!-- spec-diff -->
## Kiểm chéo danh mục (spec-diff): git:2d2ce26d39ec0947d064336b2b44b0af32776da7 ↔ .

- Bản ghi: 61.041 → 61.041; **303** đổi, 0 mất, 0 thêm, ở 145 bảng của 7 NCC
- Tổ máy bảng không ghi mã động cơ (`gensetsOf`, chưa nối Gợi ý): 1.700 → 1.700; 0 đổi, 0 mất, 0 thêm (bản đầy đủ: phần "tổ máy" của artifact)
- Đảo vai động cơ ↔ đầu phát (mã mà ≥ 3 NCC khác đọc ở vai kia): 0 → **0** ✅
- Tự kiểm số với công suất của dòng: 99 giá trị đổi / thêm không tự xác nhận được (soát tay)
- Lớp chuẩn hoá (spec-norm): 1257 thông số đổi kết quả
- Chưa đọc được (`node suppliers/unread-tables.mjs`, để thiếu thay vì đoán): bảng không cho bản ghi nào: 3.135 → 3.135; bỏ thông số theo bảng: 558 → 558; dòng điện / điện áp theo vị trí không khớp công suất: 227 → 227; dòng là cặp nhãn | giá trị: 164 → 164; số vô lý so với công suất: 141 → 141; dòng tổng quan dòng máy: một dải công suất, không là một tổ máy: 90 → 90; số bằng đúng công suất của dòng, không là khối lượng / độ ồn: 77 → 77; ngoại lệ theo dòng: 68 → 74; dòng không đúng bố cục cột của bảng tổ máy: không đọc: 53 → 53; tổ máy nhiều động cơ: 40 → 40; mã đầu phát trùng model tổ máy: 37 → 37; thông số không đúng dạng: để trống: 34 → 34; cặp a/b dưới nhãn không ghi mức / đơn vị: 34 → 34; dòng không ghi động cơ (bảng có mã động cơ trong danh sách): không đọc: 28 → 28; một ô ghi hai mã: 26 → 26; ô động cơ không đọc được, mã ở cột khác: 14 → 14; điện áp trùng công suất của dòng: 6 → 6; dòng bảng tổ máy không có model: 6 → 6; dòng máy lẫn với dòng tiêu đề: 5 → 5; dòng điện tổ máy không khớp công suất: 5 → 5; công suất prime không đọc được: để trống: 4 → 4; ô mã viết dấu － toàn chiều rộng, đọc như '-': 4 → 4; prime lớn hơn standby: để trống cả hai: 3 → 3; công suất standby không đọc được: để trống: 3 → 3; bảng máy khí: dòng máy trong tiêu đề không đọc thêm: 2 → 2; trang có hai động cơ: số liệu kích cỡ động cơ không rõ của động cơ nào: 2 → 2; số có dấu phẩy nghìn / thập phân không rõ: 2 → 2; dòng bảng động cơ không có model: 1 → 1; ô dòng điện không đọc được thành số: 1 → 1
- Thay đổi là chủ ý thì không chặn; vẫn phải soát MỌI dạng và đo top 30 ứng viên bằng tay (bộ nhớ kiem-cheo-toan-bo). Bản đầy đủ: artifact `spec-diff` của lượt chạy.

### Theo NCC

| NCC | dòng đổi | đổi | mất | thêm |
|---|--:|--:|--:|--:|
| longkai-power | 227 | 227 | 0 | 0 |
| generatordieselchina | 45 | 45 | 0 | 0 |
| huatai-yangzhou | 17 | 17 | 0 | 0 |
| lees-power | 9 | 9 | 0 | 0 |
| jiuan-power | 2 | 2 | 0 | 0 |
| xinhengxin-fujian | 2 | 2 | 0 | 0 |
| baudouin | 1 | 1 | 0 | 0 |

### Dạng thay đổi (vài ví dụ mỗi dạng)

**cyl thêm**: 256 lượt, 5 NCC
```
baudouin n1021 b97 dòng L 6M31G825/5: ∅ → 6 / 24
    (bảng nhãn)
huatai-yangzhou n111 b10 dòng 0 WD129TAD23: ∅ → 6缸直列
    | 200GF | 135/320 | 362 | WD129TAD23 | 259 | 6缸直列 | 198 | 24 | 2700×900×1400 | 1900
lees-power n1119 b152 dòng L 12V4000G63: ∅ → 12缸V型水冷
    (bảng nhãn)
```
**fuel đổi**: 93 lượt, 2 NCC
```
baudouin n1021 b97 dòng L 6M31G825/5: 193 → 156
    (bảng nhãn)
generatordieselchina n101 b0 dòng L 20V4000G23F: 342.9 → 342.9 / 457.1 L/h (@75% / @100%)
    (bảng nhãn)
baudouin n1021 b97 dòng L 6M31G825/5: 186 → 113
    (bảng nhãn)
```
**fuel thêm**: 6 lượt, 1 NCC
```
jiuan-power n136 b35 dòng L 1706A-E93TAG1: ∅ → 58.5 / 42.8 / 29.3 L/h (100% / 75% / 50% standby)
    (bảng nhãn)
jiuan-power n136 b35 dòng L 1706A-E93TAG1: ∅ → 58.5 / 42.8 / 29.3 L/h (100% / 75% / 50% standby)
    (bảng nhãn)
jiuan-power n136 b35 dòng L 1706A-E93TAG1: ∅ → 58.5 / 42.8 / 29.3 L/h (100% / 75% / 50% standby)
    (bảng nhãn)
```

### Không tự xác nhận được

| dạng | số |
|---|--:|
| fuel đổi: mới không kiểm được, cũ ? | 93 |
| fuel thêm: mới không kiểm được | 6 |

```
baudouin n1021 b97 dòng L fuel: 193 → 156 | null
baudouin n1021 b97 dòng L fuel: 186 → 113 | null
baudouin n1021 b97 dòng L fuel: 190 → 77 | null
generatordieselchina n101 b0 dòng L fuel: 342.9 → 342.9 / 457.1 L/h (@75% / @100%) | {"prime":{"kW":2000,"kVA":2500},"standby":{"kW":2200,"kVA":2750}}
generatordieselchina n101 b0 dòng L fuel: 192 → 342.9 / 457.1 L/h (@75% / @100%) | {"prime":{"kW":2000,"kVA":2500},"standby":{"kW":2200,"kVA":2750}}
generatordieselchina n101 b0 dòng L fuel: 342.9 → 342.9 / 457.1 L/h (@75% / @100%) | {"prime":{"kW":2000,"kVA":2500},"standby":{"kW":2200,"kVA":2750}}
generatordieselchina n101 b0 dòng L fuel: 192 → 342.9 / 457.1 L/h (@75% / @100%) | {"prime":{"kW":2000,"kVA":2500},"standby":{"kW":2200,"kVA":2750}}
generatordieselchina n101 b0 dòng L fuel: 342.9 → 342.9 / 457.1 L/h (@75% / @100%) | {"prime":{"kW":2000,"kVA":2500},"standby":{"kW":2200,"kVA":2750}}
generatordieselchina n101 b0 dòng L fuel: 192 → 342.9 / 457.1 L/h (@75% / @100%) | {"prime":{"kW":2000,"kVA":2500},"standby":{"kW":2200,"kVA":2750}}
generatordieselchina n103 b2 dòng L fuel: 205.1 → 205.1 / 273.4 L/h (@75% / @100%) | {"prime":{"kW":1137,"kVA":1421.2},"standby":{"kW":1250,"kVA":1562.5}}
generatordieselchina n103 b2 dòng L fuel: 202 → 205.1 / 273.4 L/h (@75% / @100%) | {"prime":{"kW":1137,"kVA":1421.2},"standby":{"kW":1250,"kVA":1562.5}}
generatordieselchina n103 b2 dòng L fuel: 205.1 → 205.1 / 273.4 L/h (@75% / @100%) | {"prime":{"kW":1137,"kVA":1421.2},"standby":{"kW":1250,"kVA":1562.5}}
… còn 87
```

### Lớp chuẩn hoá: dạng thay đổi

**fuel đổi missing**: 461 lượt, 7 NCC
```
baudouin n1021 b97 dòng L 6M31G825/5: "156": 193 missing unit → 156 L/h
    (bảng nhãn)
generatordieselchina n101 b0 dòng L 20V4000G23F: "342.9 / 457.1 L/h (@75% / @100%)": 192 g/kWh missing load → 457.1 L/h
    (bảng nhãn)
lees-power n1119 b152 dòng L 12V4000G63: "384.05": 384.05 missing unit → 384.05 L/h
    (bảng nhãn)
```
**fuel50 đổi missing**: 268 lượt, 5 NCC
```
baudouin n1021 b97 dòng L 6M31G825/5: "77": 190 missing unit → 77 L/h
    (bảng nhãn)
gfe-power n1005 b28 dòng L QSK50-G17: "0": missing unit,value → L/h missing value
    (bảng nhãn)
lees-power n1119 b152 dòng L 12V4000G63: "200.03": 200.03 missing unit → 200.03 L/h
    (bảng nhãn)
```
**fuel75 đổi missing**: 266 lượt, 5 NCC
```
baudouin n1021 b97 dòng L 6M31G825/5: "113": 186 missing unit → 113 L/h
    (bảng nhãn)
gfe-power n1005 b28 dòng L QSK50-G17: "0": missing unit,value → L/h missing value
    (bảng nhãn)
lees-power n1119 b152 dòng L 12V4000G63: "289.54": 289.54 missing unit → 289.54 L/h
    (bảng nhãn)
```
**cyl thêm**: 256 lượt, 5 NCC
```
baudouin n1021 b97 dòng L 6M31G825/5: "6 / 24": ∅ → 6 missing layout
    (bảng nhãn)
huatai-yangzhou n111 b10 dòng 0 WD129TAD23: "6缸直列": ∅ → 6
    | 200GF | 135/320 | 362 | WD129TAD23 | 259 | 6缸直列 | 198 | 24 | 2700×900×1400 | 1900
lees-power n1119 b152 dòng L 12V4000G63: "12缸V型水冷": ∅ → 12
    (bảng nhãn)
```
**fuel thêm**: 2 lượt, 1 NCC
```
jiuan-power n136 b35 dòng L 1706A-E93TAG1: "58.5 / 42.8 / 29.3 L/h (100% / 75% / 50% standby)": ∅ → 58.5 L/h
    (bảng nhãn)
jiuan-power n137 b36 dòng L 1706A-E93TAG2: "52.3 / 38.7 / 26.5 L/h (100% / 75% / 50%)": ∅ → 52.3 L/h
    (bảng nhãn)
```
**fuel75 thêm**: 2 lượt, 1 NCC
```
jiuan-power n136 b35 dòng L 1706A-E93TAG1: "58.5 / 42.8 / 29.3 L/h (100% / 75% / 50% standby)": ∅ → 42.8 L/h
    (bảng nhãn)
jiuan-power n137 b36 dòng L 1706A-E93TAG2: "52.3 / 38.7 / 26.5 L/h (100% / 75% / 50%)": ∅ → 38.7 L/h
    (bảng nhãn)
```
**fuel50 thêm**: 2 lượt, 1 NCC
```
jiuan-power n136 b35 dòng L 1706A-E93TAG1: "58.5 / 42.8 / 29.3 L/h (100% / 75% / 50% standby)": ∅ → 29.3 L/h
    (bảng nhãn)
jiuan-power n137 b36 dòng L 1706A-E93TAG2: "52.3 / 38.7 / 26.5 L/h (100% / 75% / 50%)": ∅ → 26.5 L/h
    (bảng nhãn)
```
