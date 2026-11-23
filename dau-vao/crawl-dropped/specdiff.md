<!-- spec-diff -->
## Kiểm chéo danh mục (spec-diff): git:f713a80f2460bae9b6ec485fcc41d00eb32d2284 ↔ .

- Bản ghi: 62.063 → 63.350; **555** đổi, 4311 mất, 5598 thêm, ở 1327 bảng của 15 NCC
- Tổ máy bảng không ghi mã động cơ (`gensetsOf`, chưa nối Gợi ý): 1.700 → 1.700; 0 đổi, 0 mất, 0 thêm (bản đầy đủ: phần "tổ máy" của artifact)
- Đảo vai động cơ ↔ đầu phát (mã mà ≥ 3 NCC khác đọc ở vai kia): 0 → **0** ✅
- Tự kiểm số với công suất của dòng: 0 giá trị đổi / thêm không tự xác nhận được (soát tay)
- Chưa đọc được (`node suppliers/unread-tables.mjs`, để thiếu thay vì đoán): bảng không cho bản ghi nào: 3.068 → 3.069; bỏ thông số theo bảng: 558 → 558; dòng là cặp nhãn | giá trị: 287 → 287; bảng dọc: không có mã động cơ: 254 → 254; dòng điện / điện áp theo vị trí không khớp công suất: 222 → 222; bảng dọc: công suất có nhãn mức nhưng không đọc được số / đơn vị: 144 → 144; số vô lý so với công suất: 141 → 141; bảng dọc: bảng ghi từ hai model tổ máy trở lên: 108 → 108; ngoại lệ theo dòng: 91 → 91; dòng tổng quan dòng máy: một dải công suất, không là một tổ máy: 90 → 90; số bằng đúng công suất của dòng, không là khối lượng / độ ồn: 77 → 77; bảng dọc: một dòng Model ghi hai mã: trang nhiều sản phẩm: 70 → 70; một ô ghi hai mã: 66 → 66; dòng không đúng bố cục cột của bảng tổ máy: không đọc: 53 → 53; tổ máy nhiều động cơ: 40 → 40; mã đầu phát trùng model tổ máy: 37 → 37; thông số không đúng dạng: để trống: 34 → 34; cặp a/b dưới nhãn không ghi mức / đơn vị: 34 → 34; bảng dọc: không có công suất prime / standby ghi rõ ở phần tổ máy: 33 → 33; dòng không ghi động cơ (bảng có mã động cơ trong danh sách): không đọc: 28 → 28; công suất đầu phát không đọc được: 15 → 15; ô động cơ không đọc được, mã ở cột khác: 14 → 14; dòng không có model đọc được: 12 → 12; hai model trùng khoá (keyOf bỏ dấu chấm), số khác nhau: không đọc: 10 → 10; bảng dọc: không có model tổ máy: 9 → 9; model ghi hai lần với số khác nhau: không đọc: 8 → 8; điện áp trùng công suất của dòng: 6 → 6; dòng bảng tổ máy không có model: 6 → 6; dòng điện tổ máy không khớp công suất: 5 → 5; số trong model khác công suất 50 Hz của dòng: 4 → 4; dòng máy lẫn với dòng tiêu đề: 4 → 4; công suất prime không đọc được: để trống: 4 → 4; ô mã viết dấu － toàn chiều rộng, đọc như '-': 4 → 4; prime lớn hơn standby: để trống cả hai: 3 → 3; bảng dọc: thông số ghi hai lần khác số: 3 → 3; công suất standby không đọc được: để trống: 3 → 3; bảng máy khí: dòng máy trong tiêu đề không đọc thêm: 2 → 2; trang có hai động cơ: số liệu kích cỡ động cơ không rõ của động cơ nào: 2 → 2; số có dấu phẩy nghìn / thập phân không rõ: 2 → 2; dòng bảng động cơ không có model: 1 → 1; ô dòng điện không đọc được thành số: 1 → 1
- Thay đổi là chủ ý thì không chặn; vẫn phải soát MỌI dạng và đo top 30 ứng viên bằng tay (bộ nhớ kiem-cheo-toan-bo). Bản đầy đủ: artifact `spec-diff` của lượt chạy.

### Theo NCC

| NCC | dòng đổi | đổi | mất | thêm |
|---|--:|--:|--:|--:|
| mecca-power | 2687 | 536 | 1069 | 1082 |
| longkai-power | 2435 | 0 | 1125 | 1310 |
| previa-ningde | 1444 | 0 | 643 | 801 |
| aosif | 1091 | 0 | 531 | 560 |
| awt-aiweite | 582 | 0 | 20 | 562 |
| lees-power | 506 | 19 | 211 | 276 |
| taihai-taizhou | 502 | 0 | 249 | 253 |
| kangwo-guangdong | 304 | 0 | 141 | 163 |
| sanq-power | 302 | 0 | 147 | 155 |
| jianghao-genset | 209 | 0 | 48 | 161 |
| camda-generator | 172 | 0 | 86 | 86 |
| shengfeng-fuan | 92 | 0 | 0 | 92 |
| walter-yangzhou | 84 | 0 | 18 | 66 |
| jet-power | 46 | 0 | 22 | 24 |
| huayuan-weifang | 8 | 0 | 1 | 7 |

### Dạng thay đổi (vài ví dụ mỗi dạng)

**THÊM bản ghi**: 5598 lượt, 15 NCC
```
aosif n104 b4 dòng 0 DP023CAV: engine DP023CAV
    | AD33 | 30/24 | 33/26 | DP023CAV | 5.6 | 3 | 1.8 |
awt-aiweite n101 b1 dòng 0 403D-11G: engine 403D-11G
    | AWT-P8 | 7 | 9 | 8 | 10 | 403D-11G | 1200*700*1100 | 300 | 2000*850*1250 | 600
camda-generator n156 b52 dòng 0 12V2000G25: engine 12V2000G25
    | KDGM560S | 12V2000G25 | S2000/50HZ | 512/560 | LSA49.3S4/528KW
```
**MẤT bản ghi**: 4311 lượt, 14 NCC
```
aosif n105 b4 dòng 0 S6R2-PTA-C: engine S6R2-PTA-C
    | ASM750 | 625/500 | 750/600 | S6R2-PTA-C | 140 | 6L | 30 |
awt-aiweite n102 b1 dòng 0 YC4V35-D20: engine YC4V35-D20
    | AWT-Y20 | 20 kW / 25 kVA | 22 kW / 28 kVA | YC4V35-D20 | Shops, offices, telecom base stations
camda-generator n156 b51 dòng 0 12V2000G25: engine 12V2000G25
    | KDGM560S | 12V2000G25 | S2000/50HZ | 512/560 | LSA49.3S4/528KW
```
**model**: 536 lượt, 1 NCC
```
mecca-power n5001 b34 dòng 0 QSZ13-G6: QSZ13-G6 → 4BTAA3.3G14
    | MC425C | 310 | 388 | 340 | 425 | QSZ13-G6 |
mecca-power n5001 b34 dòng 1 QSZ13-G7: QSZ13-G7 → QSB5-G1
    | MC488C | 360 | 450 | 390 | 488 | QSZ13-G7 |
mecca-power n5001 b35 dòng 0 NTA855-G1: NTA855-G1 → QSB5-G1
    | MC275C | 200 | 250 | 220 | 275 | NTA855-G1 |
```
**genset**: 536 lượt, 1 NCC
```
mecca-power n5001 b34 dòng 0 QSZ13-G6: MC425C → MC66C
    | MC425C | 310 | 388 | 340 | 425 | QSZ13-G6 |
mecca-power n5001 b34 dòng 1 QSZ13-G7: MC488C → NC70C
    | MC488C | 360 | 450 | 390 | 488 | QSZ13-G7 |
mecca-power n5001 b35 dòng 0 NTA855-G1: MC275C → MC75C
    | MC275C | 200 | 250 | 220 | 275 | NTA855-G1 |
```
**power**: 529 lượt, 1 NCC
```
mecca-power n5001 b34 dòng 0 QSZ13-G6: P 388/310 S 425/340 → P 60/48 S 66/53
    | MC425C | 310 | 388 | 340 | 425 | QSZ13-G6 |
mecca-power n5001 b34 dòng 1 QSZ13-G7: P 450/360 S 488/390 → P 63/50 S 70/56
    | MC488C | 360 | 450 | 390 | 488 | QSZ13-G7 |
mecca-power n5001 b35 dòng 0 NTA855-G1: P 250/200 S 275/220 → P 69/55 S 75/60
    | MC275C | 200 | 250 | 220 | 275 | NTA855-G1 |
```
**freq**: 493 lượt, 1 NCC
```
mecca-power n5001 b34 dòng 0 QSZ13-G6: 60 → 50
    | MC425C | 310 | 388 | 340 | 425 | QSZ13-G6 |
mecca-power n5001 b34 dòng 1 QSZ13-G7: 60 → 50
    | MC488C | 360 | 450 | 390 | 488 | QSZ13-G7 |
mecca-power n5001 b35 dòng 0 NTA855-G1: 50 → 60
    | MC275C | 200 | 250 | 220 | 275 | NTA855-G1 |
```
**makes**: 19 lượt, 1 NCC
```
lees-power n101 b0 dòng 0 4008TAG2A:  → Perkins
    | LSP1100S3 | 1100 | 1000 | 880 | 800 | 4008TAG2A | PDF
lees-power n101 b0 dòng 1 4008-30TAG3:  → Perkins
    | LSP1250S3 | 1250 | 1136 | 1000 | 909 | 4008-30TAG3 | PDF
lees-power n101 b0 dòng 2 4012-46TWG2A:  → Perkins
    | LSP1400S3 | 1400 | 1273 | 1120 | 1018 | 4012-46TWG2A | PDF
```
