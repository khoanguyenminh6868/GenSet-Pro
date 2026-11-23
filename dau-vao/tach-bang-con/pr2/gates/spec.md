<!-- spec-diff -->
## Kiểm chéo danh mục (spec-diff): git:0d589bda ↔ .

- Bản ghi: 63.550 → 63.559; **857** đổi, 9725 mất, 9734 thêm, ở 1119 bảng của 27 NCC
- Tổ máy bảng không ghi mã động cơ (`gensetsOf`, chưa nối Gợi ý): 1.700 → 1.700; 10 đổi, 53 mất, 53 thêm (bản đầy đủ: phần "tổ máy" của artifact)
- Đảo vai động cơ ↔ đầu phát (mã mà ≥ 3 NCC khác đọc ở vai kia): 0 → **0** ✅
- Tự kiểm số với công suất của dòng: 759 giá trị đổi / thêm không tự xác nhận được (soát tay)
- Chưa đọc được (`node suppliers/unread-tables.mjs`, để thiếu thay vì đoán): bảng không cho bản ghi nào: 3.070 → 3.079; bỏ thông số theo bảng: 558 → 558; dòng là cặp nhãn | giá trị: 287 → 286; bảng dọc: không có mã động cơ: 254 → 254; dòng điện / điện áp theo vị trí không khớp công suất: 222 → 222; bảng dọc: công suất có nhãn mức nhưng không đọc được số / đơn vị: 144 → 144; số vô lý so với công suất: 137 → 137; bảng dọc: bảng ghi từ hai model tổ máy trở lên: 108 → 108; ngoại lệ theo dòng: 91 → 91; dòng tổng quan dòng máy: một dải công suất, không là một tổ máy: 90 → 90; số bằng đúng công suất của dòng, không là khối lượng / độ ồn: 77 → 77; tổ máy nhiều động cơ: 70 → 70; bảng dọc: một dòng Model ghi hai mã: trang nhiều sản phẩm: 70 → 70; một ô ghi hai mã: 66 → 66; dòng không đúng bố cục cột của bảng tổ máy: không đọc: 53 → 53; mã đầu phát trùng model tổ máy: 37 → 37; thông số không đúng dạng: để trống: 34 → 34; cặp a/b dưới nhãn không ghi mức / đơn vị: 34 → 34; bảng dọc: không có công suất prime / standby ghi rõ ở phần tổ máy: 33 → 33; dòng không ghi động cơ (bảng có mã động cơ trong danh sách): không đọc: 28 → 28; công suất đầu phát không đọc được: 15 → 15; ô động cơ không đọc được, mã ở cột khác: 14 → 14; hai model trùng khoá (keyOf bỏ dấu chấm), số khác nhau: không đọc: 10 → 10; dòng không có model đọc được: 10 → 10; bảng dọc: không có model tổ máy: 9 → 9; model ghi hai lần với số khác nhau: không đọc: 8 → 8; điện áp trùng công suất của dòng: 6 → 6; dòng bảng tổ máy không có model: 6 → 6; dòng điện tổ máy không khớp công suất: 5 → 5; số trong model khác công suất 50 Hz của dòng: 4 → 4; dòng máy lẫn với dòng tiêu đề: 4 → 4; công suất prime không đọc được: để trống: 4 → 4; ô mã viết dấu － toàn chiều rộng, đọc như '-': 4 → 4; prime lớn hơn standby: để trống cả hai: 3 → 3; bảng dọc: thông số ghi hai lần khác số: 3 → 3; công suất standby không đọc được: để trống: 3 → 3; bảng máy khí: dòng máy trong tiêu đề không đọc thêm: 2 → 2; trang có hai động cơ: số liệu kích cỡ động cơ không rõ của động cơ nào: 2 → 2; số có dấu phẩy nghìn / thập phân không rõ: 2 → 2; bảng đầu phát / động cơ rời trong danh sách đổi tiêu đề: không đọc: 1 → 1; dòng bảng động cơ không có model: 1 → 1; ô dòng điện không đọc được thành số: 1 → 1
- Thay đổi là chủ ý thì không chặn; vẫn phải soát MỌI dạng và đo top 30 ứng viên bằng tay (bộ nhớ kiem-cheo-toan-bo). Bản đầy đủ: artifact `spec-diff` của lượt chạy.

### Theo NCC

| NCC | dòng đổi | đổi | mất | thêm |
|---|--:|--:|--:|--:|
| rcg-power | 3122 | 50 | 1536 | 1536 |
| kaihua-genset | 2209 | 3 | 1099 | 1107 |
| agestar | 2094 | 194 | 950 | 950 |
| yanan-power | 1354 | 0 | 677 | 677 |
| xingguang-jiangsu | 1278 | 0 | 639 | 639 |
| voltgent | 1164 | 0 | 582 | 582 |
| excel-power-ningde | 1145 | 0 | 572 | 573 |
| nenjo-generator | 1130 | 0 | 565 | 565 |
| legapower | 1024 | 50 | 487 | 487 |
| mamo-power | 818 | 0 | 409 | 409 |
| victory-generator | 792 | 0 | 396 | 396 |
| westinpower | 682 | 118 | 282 | 282 |
| pauway-tianjin | 628 | 0 | 314 | 314 |
| comappower | 548 | 188 | 180 | 180 |
| gtl-power | 346 | 0 | 173 | 173 |
| gordon-power | 324 | 80 | 122 | 122 |
| yanfa-yancheng | 306 | 14 | 146 | 146 |
| minsun-motor | 238 | 78 | 80 | 80 |
| hosem-power | 236 | 0 | 118 | 118 |
| chuangyuan-zhongshan | 178 | 0 | 89 | 89 |
| world-power-fuzhou | 162 | 60 | 51 | 51 |
| frs-shenyang | 142 | 0 | 71 | 71 |
| keliang-fuan | 134 | 0 | 67 | 67 |
| wudong-wuxi | 128 | 12 | 58 | 58 |
| rise-power | 76 | 0 | 38 | 38 |
| powerzoo | 56 | 10 | 23 | 23 |
| yanmar | 2 | 0 | 1 | 1 |

### Dạng thay đổi (vài ví dụ mỗi dạng)

**THÊM bản ghi**: 9734 lượt, 27 NCC
```
agestar n105 b7 dòng 7 BF8M1015C-LA G2: engine BF8M1015C-LA G2
    | GD495(S) | 495 | 396 | 450 | 360 | BF8M1015C-LA G2 | 85.4 | Electrical | ASG314F | 3800*1400*2100 | 4630
chuangyuan-zhongshan n103 b4 dòng 0 WP3.2D20E310: engine WP3.2D20E310
    | 1 | 14 | 400 | 1500 | 0.8 | 50 | 1500*800*1000 | 600 | WP3.2D20E310 | 4/98/105 | 3.17
comappower n105 b9 dòng 0 4M06G20/5: engine 4M06G20/5
    | COM20B | 20kW | 16kW | 15kW | 18.75kW | 4M06G20/5 | 4 | COM20B
```
**MẤT bản ghi**: 9725 lượt, 27 NCC
```
agestar n105 b6 dòng 8 BF6M1015-LA GA: engine BF6M1015-LA GA
    | GD248(S) | 248 | 198 | 225 | 180 | BF6M1015-LA GA | 42.7 | Electrical | ASG274J | 3600*1280*2050 | 2790
chuangyuan-zhongshan n103 b3 dòng 28 WP3.2D20E310: engine WP3.2D20E310
    | 1 | 14 | 400 | 1500 | 0.8 | 50 | 1500*800*1000 | 600 | WP3.2D20E310 | 4/98/105 | 3.17
comappower n105 b10 dòng 33 16M33G2000/5: engine 16M33G2000/5
    | COM2000B | 2000kVA | 1600kW | 1500kVA | 1875kW | 16M33G2000/5 | 16 | COM2000B
```
**power**: 683 lượt, 11 NCC
```
agestar n105 b7 dòng 0 BF4M2012: P 79/63 S 87/70 → P 225/180 S 248/198
    | GD87(S) | 87 | 70 | 79 | 63 | BF4M2012 | 16.5 | Mechanical | ASG224G | 2700*1030*1500 | 1510
comappower n105 b10 dòng 2 4M06G35/5: P 31.25/25 S 35/28 → P 33/26.4 S 37.5/30
    | COM35B | 35kVA | 28kW | 25kVA | 31.25kW | 4M06G35/5 | 4 | COM35B
gordon-power n108 b9 dòng 0 403D-11G: P 11.25/9 S 12.5/10 → P 180/144 S 200/160
    | GD-P13 | 9 | 11.25 | 10 | 12.5 | 403D-11G | 1800 | 10.7 | 3 | 3L-77×81 | 1.131 | 115×74×99 | 180×84×110
```
**genset**: 663 lượt, 11 NCC
```
agestar n105 b7 dòng 0 BF4M2012: GD87(S) → GD248(S)
    | GD87(S) | 87 | 70 | 79 | 63 | BF4M2012 | 16.5 | Mechanical | ASG224G | 2700*1030*1500 | 1510
comappower n105 b10 dòng 0 4M06G20/5: COM20B → COM25B
    | COM20B | 20kW | 16kW | 15kW | 18.75kW | 4M06G20/5 | 4 | COM20B
gordon-power n108 b9 dòng 0 403D-11G: GD-P13 → GD-P200
    | GD-P13 | 9 | 11.25 | 10 | 12.5 | 403D-11G | 1800 | 10.7 | 3 | 3L-77×81 | 1.131 | 115×74×99 | 180×84×110
```
**model**: 625 lượt, 12 NCC
```
agestar n105 b7 dòng 0 BF4M2012: BF4M2012 → BF6M1015-LA GA
    | GD87(S) | 87 | 70 | 79 | 63 | BF4M2012 | 16.5 | Mechanical | ASG224G | 2700*1030*1500 | 1510
comappower n105 b10 dòng 0 4M06G20/5: 4M06G20/5 → 4M06G20/6
    | COM20B | 20kW | 16kW | 15kW | 18.75kW | 4M06G20/5 | 4 | COM20B
gordon-power n108 b9 dòng 0 403D-11G: 403D-11G → 1106A-70TAG3
    | GD-P13 | 9 | 11.25 | 10 | 12.5 | 403D-11G | 1800 | 10.7 | 3 | 3L-77×81 | 1.131 | 115×74×99 | 180×84×110
```
**dims đổi**: 261 lượt, 3 NCC
```
agestar n105 b7 dòng 0 BF4M2012: 2700*1030*1500 → 3600*1280*2050
    | GD87(S) | 87 | 70 | 79 | 63 | BF4M2012 | 16.5 | Mechanical | ASG224G | 2700*1030*1500 | 1510
kaihua-genset n101 b0 dòng 0 KTA50-G8: 5100*2280*2500 → 6175x2600x2840
    | KH-1120GF | 1650 | 1320 | 1400 | 1120 | KTA50-G8 | 5100*2280*2500 | 13000
westinpower n110 b10 dòng 0 4H4.3-G21: 1800*820*1247 → 2170*880*1359
    | TS034 | 34 | 27 | 31 | 25 | 4H4.3-G21 | 4.3 | 9.5 | 1800*820*1247 | 2396*1056*1723
```
**other**: 238 lượt, 4 NCC
```
agestar n105 b7 dòng 0 BF4M2012: ASG224G → ASG274J
    | GD87(S) | 87 | 70 | 79 | 63 | BF4M2012 | 16.5 | Mechanical | ASG224G | 2700*1030*1500 | 1510
minsun-motor n117 b21 dòng 0 YC4D65-D20: SY-A 184G → SY-A 184E
    | GF-Y37.5 | 37.5 | 30 | YC4D65-D20 | SY-A 184G
rcg-power n101 b1 dòng 0 4B3.9-G11: TAL-A40-G → S0L2-G1
    | R-DC25D6-S | 25 kVA / 20 kW | 28 kVA / 22 kW | 4B3.9-G11 | TAL-A40-G | PDF
```
**freq**: 236 lượt, 2 NCC
```
agestar n105 b7 dòng 0 BF4M2012: 60 → 50
    | GD87(S) | 87 | 70 | 79 | 63 | BF4M2012 | 16.5 | Mechanical | ASG224G | 2700*1030*1500 | 1510
legapower n102 b3 dòng 0 6R1600G70FS: 60 → 50
    | LG340M | 340 | 310 | 58.1 | 6R1600G70FS | 6L | ECM | 10.50 |
agestar n105 b7 dòng 0 ASG224G: 60 → 50
    | GD87(S) | 87 | 70 | 79 | 63 | BF4M2012 | 16.5 | Mechanical | ASG224G | 2700*1030*1500 | 1510
```
**fuel đổi**: 102 lượt, 3 NCC
```
gordon-power n108 b9 dòng 0 403D-11G: 3 → 41.6
    | GD-P13 | 9 | 11.25 | 10 | 12.5 | 403D-11G | 1800 | 10.7 | 3 | 3L-77×81 | 1.131 | 115×74×99 | 180×84×110
legapower n102 b3 dòng 11 16V2000G85: 212.5 → 170
    | LG1250M | 1250 | 1138 | 212.5 | 16V2000G85 | 16V | ECM | 31.84 |
wudong-wuxi n109 b7 dòng 0 WD180E3TAD61: 196 → 198
    | WD180E3TAD61 | 1500 | 608 | 669 | 196 | ≤700
```
**weight đổi**: 92 lượt, 2 NCC
```
agestar n105 b7 dòng 0 BF4M2012: 1510 → 2790
    | GD87(S) | 87 | 70 | 79 | 63 | BF4M2012 | 16.5 | Mechanical | ASG224G | 2700*1030*1500 | 1510
kaihua-genset n101 b0 dòng 0 KTA50-G8: 13000 → 15152
    | KH-1120GF | 1650 | 1320 | 1400 | 1120 | KTA50-G8 | 5100*2280*2500 | 13000
agestar n105 b7 dòng 0 ASG224G: 1510 → 2790
    | GD87(S) | 87 | 70 | 79 | 63 | BF4M2012 | 16.5 | Mechanical | ASG224G | 2700*1030*1500 | 1510
```
**speed đổi**: 80 lượt, 1 NCC
```
gordon-power n108 b9 dòng 0 403D-11G: 1800 → 1500
    | GD-P13 | 9 | 11.25 | 10 | 12.5 | 403D-11G | 1800 | 10.7 | 3 | 3L-77×81 | 1.131 | 115×74×99 | 180×84×110
gordon-power n108 b9 dòng 1 403D-15G: 1800 → 1500
    | GD-P17 | 12 | 15 | 13.2 | 16.5 | 403D-15G | 1800 | 14.7 | 4.27 | 3L-84×90 | 1.496 | 115×74×99 | 180×84×110
gordon-power n108 b9 dòng 2 403A-15G2: 1800 → 1500
    | GD-P20 | 14.4 | 18 | 16 | 20 | 403A-15G2 | 1800 | 16 | 5 | 3L-84×90 | 1.496 | 115×74×99 | 180×84×110
```
**cyl đổi**: 77 lượt, 3 NCC
```
comappower n105 b10 dòng 8 4M10G110/5: 4 → 6
    | COM110B | 110kVA | 88kW | 80kVA | 100kW | 4M10G110/5 | 4 | COM110B
legapower n102 b3 dòng 10 16V2000G45: 16V → 12V
    | LG1130M | 1130 | 1025 | 195.9 | 16V2000G45 | 16V | ECM | 31.84 |
world-power-fuzhou n103 b3 dòng 0 BF4M2012: 4 → 3
    | WDPG-D60 | 48 | 60 | 53 | 66 | BF4M2012 | 4 | M |
```
**weight bỏ**: 30 lượt, 1 NCC
```
westinpower n112 b16 dòng 0 E0834 E312: 652 → ∅
    | RN50NT | 40 | 50 | E0834 E312 | UCI224D | 4/L | 108*125 | 4.6 | 31.9 | 46.8 | 76 | 100AH/24V | S203-C80 | 1875*740*940 | 652
westinpower n112 b16 dòng 1 E0834 E302: 830 → ∅
    | RN70NT | 56 | 70 | E0834 E302 | UCI224F | 4/L | 108*125 | 4.6 | 36.5 | 52.8 | 106 | 100AH/24V | A1N125 TMF125/1250 FF 3P | 2075*740*960 | 830
westinpower n112 b16 dòng 2 E0836 E312: 930 → ∅
    | RN71NT | 57 | 71 | E0836 E312 | UCI224F | 6/L | 108*125 | 6.9 | 33.3 | 55.2 | 107 | 100AH/24V | A1N125 TMF125/1250 FF 3P | 2340*740*960 | 930
```
**disp đổi**: 27 lượt, 1 NCC
```
westinpower n112 b16 dòng 0 E0834 E312: 4.6 → 3.9
    | RN50NT | 40 | 50 | E0834 E312 | UCI224D | 4/L | 108*125 | 4.6 | 31.9 | 46.8 | 76 | 100AH/24V | S203-C80 | 1875*740*940 | 652
westinpower n112 b16 dòng 1 E0834 E302: 4.6 → 4.0
    | RN70NT | 56 | 70 | E0834 E302 | UCI224F | 4/L | 108*125 | 4.6 | 36.5 | 52.8 | 106 | 100AH/24V | A1N125 TMF125/1250 FF 3P | 2075*740*960 | 830
westinpower n112 b16 dòng 2 E0836 E312: 6.9 → 6.0
    | RN71NT | 57 | 71 | E0836 E312 | UCI224F | 6/L | 108*125 | 6.9 | 33.3 | 55.2 | 107 | 100AH/24V | A1N125 TMF125/1250 FF 3P | 2340*740*960 | 930
```
**current bỏ**: 23 lượt, 1 NCC
```
westinpower n112 b16 dòng 0 E0834 E312: 76 → ∅
    | RN50NT | 40 | 50 | E0834 E312 | UCI224D | 4/L | 108*125 | 4.6 | 31.9 | 46.8 | 76 | 100AH/24V | S203-C80 | 1875*740*940 | 652
westinpower n112 b16 dòng 1 E0834 E302: 106 → ∅
    | RN70NT | 56 | 70 | E0834 E302 | UCI224F | 4/L | 108*125 | 4.6 | 36.5 | 52.8 | 106 | 100AH/24V | A1N125 TMF125/1250 FF 3P | 2075*740*960 | 830
westinpower n112 b16 dòng 2 E0836 E312: 107 → ∅
    | RN71NT | 57 | 71 | E0836 E312 | UCI224F | 6/L | 108*125 | 6.9 | 33.3 | 55.2 | 107 | 100AH/24V | A1N125 TMF125/1250 FF 3P | 2340*740*960 | 930
```
**eff bỏ**: 23 lượt, 1 NCC
```
westinpower n112 b16 dòng 0 E0834 E312: 31.9 → ∅
    | RN50NT | 40 | 50 | E0834 E312 | UCI224D | 4/L | 108*125 | 4.6 | 31.9 | 46.8 | 76 | 100AH/24V | S203-C80 | 1875*740*940 | 652
westinpower n112 b16 dòng 1 E0834 E302: 36.5 → ∅
    | RN70NT | 56 | 70 | E0834 E302 | UCI224F | 4/L | 108*125 | 4.6 | 36.5 | 52.8 | 106 | 100AH/24V | A1N125 TMF125/1250 FF 3P | 2075*740*960 | 830
westinpower n112 b16 dòng 2 E0836 E312: 33.3 → ∅
    | RN71NT | 57 | 71 | E0836 E312 | UCI224F | 6/L | 108*125 | 6.9 | 33.3 | 55.2 | 107 | 100AH/24V | A1N125 TMF125/1250 FF 3P | 2340*740*960 | 930
```
**makes**: 12 lượt, 1 NCC
```
comappower n101 b2 dòng 0 YC4D65-D20: Ricardo,Yanmar,Yangdong → Ricardo
    | COM41 | 41kVA | 33kW | 38kVA | 30kW | YC4D65-D20 | 4 | COM41
comappower n101 b2 dòng 1 YC4D80Z-D20: Ricardo,Yanmar,Yangdong → Ricardo
    | COM62 | 62kVA | 50kW | 56kVA | 45kW | YC4D80Z-D20 | 4 | COM62
comappower n101 b2 dòng 2 YC4D100Z-D20: Ricardo,Yanmar,Yangdong → Ricardo
    | COM75 | 75kVA | 60kW | 69kVA | 55kW | YC4D100Z-D20 | 4 | COM75
```
**bore đổi**: 9 lượt, 1 NCC
```
westinpower n112 b16 dòng 9 E2676 LE202: 126*166 → 128*166
    | RN250NT | 200 | 250 | E2676 LE202 | S4L1S-C | 6/L | 126*166 | 12.4 | 39.4 | 49.1 | 380 | 200AH/24V | T5N400 TMA R400 FF 3P | 3319*1080*1206 | 1795
westinpower n112 b17 dòng 2 E2876 TE302: 128*166 → 108*125
    | 3 | RB150N | 120 | 150 | E2876 TE302 | 6/L | 128*166 | 12.8 | 2975*835*1210
westinpower n112 b17 dòng 3 E2676 LE212: 126*166 → 108*125
    | 4 | RB255N | 204 | 255 | E2676 LE212 | 6/L | 126*166 | 12.4 | 3339*870*1206
```
**weight thêm**: 8 lượt, 1 NCC
```
westinpower n112 b17 dòng 0 E0834 LE322: ∅ → 652
    | 1 | RB90N | 72 | 90 | E0834 LE322 | 4/L | 108*125 | 4.6 | 2355*809*1080
westinpower n112 b17 dòng 1 E0836 LE302: ∅ → 830
    | 2 | RB125N | 100 | 125 | E0836 LE302 | 6/L | 108*125 | 6.9 | 2830*740*1080
westinpower n112 b17 dòng 2 E2876 TE302: ∅ → 930
    | 3 | RB150N | 120 | 150 | E2876 TE302 | 6/L | 128*166 | 12.8 | 2975*835*1210
```
**current thêm**: 8 lượt, 1 NCC
```
westinpower n112 b17 dòng 0 E0834 LE322: ∅ → 76
    | 1 | RB90N | 72 | 90 | E0834 LE322 | 4/L | 108*125 | 4.6 | 2355*809*1080
westinpower n112 b17 dòng 1 E0836 LE302: ∅ → 106
    | 2 | RB125N | 100 | 125 | E0836 LE302 | 6/L | 108*125 | 6.9 | 2830*740*1080
westinpower n112 b17 dòng 2 E2876 TE302: ∅ → 107
    | 3 | RB150N | 120 | 150 | E2876 TE302 | 6/L | 128*166 | 12.8 | 2975*835*1210
```
**eff thêm**: 8 lượt, 1 NCC
```
westinpower n112 b17 dòng 0 E0834 LE322: ∅ → 31.9
    | 1 | RB90N | 72 | 90 | E0834 LE322 | 4/L | 108*125 | 4.6 | 2355*809*1080
westinpower n112 b17 dòng 1 E0836 LE302: ∅ → 36.5
    | 2 | RB125N | 100 | 125 | E0836 LE302 | 6/L | 108*125 | 6.9 | 2830*740*1080
westinpower n112 b17 dòng 2 E2876 TE302: ∅ → 33.3
    | 3 | RB150N | 120 | 150 | E2876 TE302 | 6/L | 128*166 | 12.8 | 2975*835*1210
```
**fuel bỏ**: 7 lượt, 3 NCC
```
gordon-power n114 b12 dòng 8 DP158LC: 83.4 → ∅
    | GD-DS580 | 420 | 525 | 464 | 580 | DP158LC | 1800 | 466 | 83.4 | V8-128×142 | 14.6 | 305×143×195 | 470×170×223
legapower n102 b3 dòng 9 12V2000G85: 170 → ∅
    | LG980M | 980 | 890 | 170 | 12V2000G85 | 12V | ECM | 23.88 |
westinpower n111 b13 dòng 13 1706A-E93TAG1: 75.2 → ∅
    | TP400 | 400 | 320 | 364 | 290 | 1706A-E93TAG1 | 9.29 | 75.2 | |
```
**bore thêm**: 7 lượt, 1 NCC
```
westinpower n115 b23 dòng 0 4006-23TRS1: ∅ → 160*190
    | 1 | RB385PT | 307 | 385 | 4006-23TRS1 | 22.92 | 3780*1720*2220 | 4960
westinpower n115 b23 dòng 1 4006-E23TRS3: ∅ → 160*190
    | 2 | RB388PT | 310 | 388 | 4006-E23TRS3 | 22.92 | 3780*1720*2220 | 4960
westinpower n115 b23 dòng 2 4006-23TRS2: ∅ → 160*190
    | 3 | RB470PT | 375 | 468 | 4006-23TRS2 | 22.92 | 3780*1720*2220 | 5138
```
**disp bỏ**: 6 lượt, 2 NCC
```
legapower n104 b7 dòng 20 KTA50-G9: 50.3 → ∅
    | C1720 | 1720 | 1563 | 330 | KTA50-G9 | 16V | Electronic | 50.3 |
westinpower n111 b13 dòng 13 1706A-E93TAG1: 9.29 → ∅
    | TP400 | 400 | 320 | 364 | 290 | 1706A-E93TAG1 | 9.29 | 75.2 | |
legapower n104 b7 dòng 21 KTA50-G9: 50.3 → ∅
    | C1875 | 1875 | N.A. | 330 | KTA50-G9 | 16V | Electronic | 50.3 |
```
**disp thêm**: 5 lượt, 2 NCC
```
legapower n104 b7 dòng 13 QSK23-G3: ∅ → 37.8
    | C988 | 988 | 894 | 189 | QSK23-G3 | 6L | ECM | 23.15 |
westinpower n111 b14 dòng 27 4012-46TAG3A: ∅ → 45.842
    | TP1880 | 1880 | 1500 | 1700 | 1350 | 4012-46TAG3A | 45.842 | 356 | 5000*2200*2565 | 12192*2438*2896
legapower n104 b7 dòng 14 QST30-G3: ∅ → 37.8
    | C1125 | 1125 | 1025 | 207 | QST30-G3 | 12V | ECM | 30.48 |
```
**gov thêm**: 4 lượt, 1 NCC
```
legapower n104 b7 dòng 13 QSK23-G3: ∅ → Electronic
    | C988 | 988 | 894 | 189 | QSK23-G3 | 6L | ECM | 23.15 |
legapower n104 b7 dòng 14 QST30-G3: ∅ → Electronic
    | C1125 | 1125 | 1025 | 207 | QST30-G3 | 12V | ECM | 30.48 |
legapower n104 b7 dòng 16 QSK38-G5: ∅ → Electronic
    | C1320 | 1320 | 1200 | 262 | QSK38-G5 | 12V | ECM | 37.7 |
```
**dims thêm**: 3 lượt, 1 NCC
```
westinpower n111 b13 dòng 13 1706A-E93TAG1: ∅ → 2830*1120*1660
    | TP400 | 400 | 320 | 364 | 290 | 1706A-E93TAG1 | 9.29 | 75.2 | |
westinpower n111 b13 dòng 15 2206A-E13TAG6: ∅ → 2830*1125*1703
    | TP500 | 500 | 400 | 438 | 350 | 2206A-E13TAG6 | 12.5 | 91 | |
westinpower n111 b13 dòng 27 4012-46TAG3A: ∅ → 4699*2070*2269
    | TP1880 | 1880 | 1500 | 1700 | 1350 | 4012-46TAG3A | 45.842 | 356 | 5000*2200*2565 |
```
**gov bỏ**: 2 lượt, 1 NCC
```
legapower n104 b7 dòng 20 KTA50-G9: Electronic → ∅
    | C1720 | 1720 | 1563 | 330 | KTA50-G9 | 16V | Electronic | 50.3 |
legapower n104 b7 dòng 21 KTA50-G9: Electronic → ∅
    | C1875 | 1875 | N.A. | 330 | KTA50-G9 | 16V | Electronic | 50.3 |
```
**dims bỏ**: 2 lượt, 1 NCC
```
westinpower n111 b14 dòng 27 4012-46TAG3A: 5000*2200*2565 → ∅
    | TP1880 | 1880 | 1500 | 1700 | 1350 | 4012-46TAG3A | 45.842 | 356 | 5000*2200*2565 | 12192*2438*2896
westinpower n112 b16 dòng 10 E3262 E302: 3893*1500*1600 → ∅
    | RN350NT | 280 | 350 | E3262 E302 | HCI544C | 12/V | 132*157 | 25.8 | 38.7 | 54.9 | 531 | 200AH/24V | T5N630 PR221DS-LS/I R630 FF 3P | 3893*1500*1600 | 2873
```
**fuel thêm**: 2 lượt, 2 NCC
```
westinpower n111 b14 dòng 27 4012-46TAG3A: ∅ → 356
    | TP1880 | 1880 | 1500 | 1700 | 1350 | 4012-46TAG3A | 45.842 | 356 | 5000*2200*2565 | 12192*2438*2896
wudong-wuxi n109 b7 dòng 11 WD360E3TAD140: ∅ → 195
    | WD360E3TAD140 | 1500 | 1439 | | 192 |
```
… còn 2 dạng nữa (xem bản đầy đủ).

### Không tự xác nhận được

| dạng | số |
|---|--:|
| dims đổi: mới tự xác nhận, cũ cũng hợp lệ | 261 |
| fuel đổi: mới không kiểm được, cũ ? | 102 |
| weight đổi: mới tự xác nhận, cũ cũng hợp lệ | 92 |
| speed đổi: mới tự xác nhận, cũ cũng hợp lệ | 80 |
| cyl đổi: mới tự xác nhận, cũ cũng hợp lệ | 77 |
| weight bỏ: mới không kiểm được | 30 |
| disp đổi: mới tự xác nhận, cũ cũng hợp lệ | 27 |
| current bỏ: mới không kiểm được | 23 |
| eff bỏ: mới không kiểm được | 23 |
| bore đổi: mới không kiểm được, cũ ? | 9 |
| eff thêm: mới không kiểm được | 8 |
| fuel bỏ: mới không kiểm được | 7 |
| bore thêm: mới không kiểm được | 7 |
| disp bỏ: mới không kiểm được | 6 |
| gov bỏ: mới không kiểm được | 2 |
| dims bỏ: mới không kiểm được | 2 |
| fuel thêm: mới không kiểm được | 2 |
| bore bỏ: mới không kiểm được | 1 |

```
agestar n105 b7 dòng 0 dims: 2700*1030*1500 → 3600*1280*2050 | {"standby":{"kVA":248,"kW":198},"prime":{"kVA":225,"kW":180}}
agestar n105 b7 dòng 0 weight: 1510 → 2790 | {"standby":{"kVA":248,"kW":198},"prime":{"kVA":225,"kW":180}}
agestar n105 b7 dòng 0 dims: 2700*1030*1500 → 3600*1280*2050 | {"standby":{"kVA":248,"kW":198},"prime":{"kVA":225,"kW":180}}
agestar n105 b7 dòng 0 weight: 1510 → 2790 | {"standby":{"kVA":248,"kW":198},"prime":{"kVA":225,"kW":180}}
agestar n105 b7 dòng 1 dims: 2700*1030*1500 → 3400*1200*1900 | {"standby":{"kVA":275,"kW":220},"prime":{"kVA":250,"kW":200}}
agestar n105 b7 dòng 1 weight: 1510 → 2810 | {"standby":{"kVA":275,"kW":220},"prime":{"kVA":250,"kW":200}}
agestar n105 b7 dòng 1 dims: 2700*1030*1500 → 3400*1200*1900 | {"standby":{"kVA":275,"kW":220},"prime":{"kVA":250,"kW":200}}
agestar n105 b7 dòng 1 weight: 1510 → 2810 | {"standby":{"kVA":275,"kW":220},"prime":{"kVA":250,"kW":200}}
agestar n105 b7 dòng 2 dims: 2800*1130*1640 → 3400*1200*1900 | {"standby":{"kVA":303,"kW":242},"prime":{"kVA":275,"kW":220}}
agestar n105 b7 dòng 2 weight: 1650 → 2870 | {"standby":{"kVA":303,"kW":242},"prime":{"kVA":275,"kW":220}}
agestar n105 b7 dòng 2 dims: 2800*1130*1640 → 3400*1200*1900 | {"standby":{"kVA":303,"kW":242},"prime":{"kVA":275,"kW":220}}
agestar n105 b7 dòng 2 weight: 1650 → 2870 | {"standby":{"kVA":303,"kW":242},"prime":{"kVA":275,"kW":220}}
… còn 747
```
