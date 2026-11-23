<!-- spec-diff -->
## Kiểm chéo danh mục (spec-diff): git:a95b8ab5 ↔ .

- Bản ghi: 63.350 → 63.550; **565** đổi, 5415 mất, 5615 thêm, ở 838 bảng của 11 NCC
- Tổ máy bảng không ghi mã động cơ (`gensetsOf`, chưa nối Gợi ý): 1.700 → 1.700; 0 đổi, 9 mất, 9 thêm (bản đầy đủ: phần "tổ máy" của artifact)
- Đảo vai động cơ ↔ đầu phát (mã mà ≥ 3 NCC khác đọc ở vai kia): 0 → **0** ✅
- Tự kiểm số với công suất của dòng: 130 giá trị đổi / thêm không tự xác nhận được (soát tay)
- Chưa đọc được (`node suppliers/unread-tables.mjs`, để thiếu thay vì đoán): bảng không cho bản ghi nào: 3.069 → 3.070; bỏ thông số theo bảng: 558 → 558; dòng là cặp nhãn | giá trị: 287 → 287; bảng dọc: không có mã động cơ: 254 → 254; dòng điện / điện áp theo vị trí không khớp công suất: 222 → 222; bảng dọc: công suất có nhãn mức nhưng không đọc được số / đơn vị: 144 → 144; số vô lý so với công suất: 141 → 137; bảng dọc: bảng ghi từ hai model tổ máy trở lên: 108 → 108; ngoại lệ theo dòng: 91 → 91; dòng tổng quan dòng máy: một dải công suất, không là một tổ máy: 90 → 90; số bằng đúng công suất của dòng, không là khối lượng / độ ồn: 77 → 77; tổ máy nhiều động cơ: 40 → 70; bảng dọc: một dòng Model ghi hai mã: trang nhiều sản phẩm: 70 → 70; một ô ghi hai mã: 66 → 66; dòng không đúng bố cục cột của bảng tổ máy: không đọc: 53 → 53; mã đầu phát trùng model tổ máy: 37 → 37; thông số không đúng dạng: để trống: 34 → 34; cặp a/b dưới nhãn không ghi mức / đơn vị: 34 → 34; bảng dọc: không có công suất prime / standby ghi rõ ở phần tổ máy: 33 → 33; dòng không ghi động cơ (bảng có mã động cơ trong danh sách): không đọc: 28 → 28; công suất đầu phát không đọc được: 15 → 15; ô động cơ không đọc được, mã ở cột khác: 14 → 14; hai model trùng khoá (keyOf bỏ dấu chấm), số khác nhau: không đọc: 10 → 10; dòng không có model đọc được: 12 → 10; bảng dọc: không có model tổ máy: 9 → 9; model ghi hai lần với số khác nhau: không đọc: 8 → 8; điện áp trùng công suất của dòng: 6 → 6; dòng bảng tổ máy không có model: 6 → 6; dòng điện tổ máy không khớp công suất: 5 → 5; số trong model khác công suất 50 Hz của dòng: 4 → 4; dòng máy lẫn với dòng tiêu đề: 4 → 4; công suất prime không đọc được: để trống: 4 → 4; ô mã viết dấu － toàn chiều rộng, đọc như '-': 4 → 4; prime lớn hơn standby: để trống cả hai: 3 → 3; bảng dọc: thông số ghi hai lần khác số: 3 → 3; công suất standby không đọc được: để trống: 3 → 3; bảng máy khí: dòng máy trong tiêu đề không đọc thêm: 2 → 2; trang có hai động cơ: số liệu kích cỡ động cơ không rõ của động cơ nào: 2 → 2; số có dấu phẩy nghìn / thập phân không rõ: 2 → 2; dòng bảng động cơ không có model: 1 → 1; ô dòng điện không đọc được thành số: 1 → 1; bảng đầu phát / động cơ rời trong danh sách đổi tiêu đề: không đọc: 0 → 1
- Thay đổi là chủ ý thì không chặn; vẫn phải soát MỌI dạng và đo top 30 ứng viên bằng tay (bộ nhớ kiem-cheo-toan-bo). Bản đầy đủ: artifact `spec-diff` của lượt chạy.

### Theo NCC

| NCC | dòng đổi | đổi | mất | thêm |
|---|--:|--:|--:|--:|
| mecca-power | 2674 | 371 | 1143 | 1160 |
| longkai-power | 2388 | 0 | 1194 | 1194 |
| previa-ningde | 1886 | 14 | 936 | 936 |
| acepow-fuan | 1690 | 0 | 845 | 845 |
| baifa-power | 824 | 91 | 329 | 404 |
| taihai-taizhou | 728 | 0 | 311 | 417 |
| jet-power | 718 | 2 | 358 | 358 |
| lees-power | 236 | 10 | 113 | 113 |
| huayuan-weifang | 231 | 17 | 107 | 107 |
| shengfeng-fuan | 218 | 60 | 79 | 79 |
| hnd-henan | 2 | 0 | 0 | 2 |

### Dạng thay đổi (vài ví dụ mỗi dạng)

**THÊM bản ghi**: 5615 lượt, 11 NCC
```
acepow-fuan n109 b13 dòng 0 JE493DB-03: engine JE493DB-03
    | 20.0 | 25.0 | 22.0 | 27.5 | BC184ES | ISUZU | JE493DB-03 | 24 | 27
baifa-power n101 b0 dòng 4 1106D-E70TAG2: engine 1106D-E70TAG2
    | BF-P154-T3 | 154 | 140 | 1106D-E70TAG2 | | UCI 274E | STAGE 3A | CHINA
hnd-henan n101 b1 dòng 4 TD234V6: engine TD234V6
    | TD234V6 | 116 | 132 | - | - | - | - | - | - | - | - | - | 210/0.85 | 213/0.82
```
**MẤT bản ghi**: 5415 lượt, 10 NCC
```
acepow-fuan n109 b12 dòng 4 JE493DB-03: engine JE493DB-03
    | 20.0 | 25.0 | 22.0 | 27.5 | BC184ES | ISUZU | JE493DB-03 | 24 | 27
baifa-power n101 b1 dòng 0 TWD1645GE: engine TWD1645GE
    | BF-V770-T2 | 770 | 700 | VOLVO | TWD1645GE | EMS2 / ECU | S5L1D-G4 | STAGE II /TIER 2 | SWEDEN
huayuan-weifang n102 b1 dòng 21 4B3.9-G2: engine 4B3.9-G2
    | HY 20C | 20 | 22 | 4B3.9-G2 | 1680 * 730 * 1100 | 715
```
**genset**: 565 lượt, 7 NCC
```
baifa-power n101 b0 dòng 2 4BTAA3.3G14: BF-C66Q-T3 → BF-P88-T3
    | BF-C66Q-T3 | 66 | 60 | CUMMINS | 4BTAA3.3G14 | | S1L2-Y | STAGE 3A | INDIA
huayuan-weifang n113 b13 dòng 0 F8L413F: HY90GF → HY22GF
    | HY90GF | 90 | 99 | F8L413F | COP | 117 | 129 | 1500 | 风冷 | 2100×1200×1330
jet-power n136 b32 dòng 0 SC33W1150D2: SD-1000 → SD-69
    | SD-1000 | 1000 | 800 | 900 | 720 | SC33W1150D2 | L6 | Electric | 32.8 | 180x215 | JET634D
```
**power**: 565 lượt, 7 NCC
```
baifa-power n101 b0 dòng 2 4BTAA3.3G14: P 60/· S 66/· → P 80/· S 88/·
    | BF-C66Q-T3 | 66 | 60 | CUMMINS | 4BTAA3.3G14 | | S1L2-Y | STAGE 3A | INDIA
huayuan-weifang n113 b13 dòng 0 F8L413F: P ·/90 → ∅
    | HY90GF | 90 | 99 | F8L413F | COP | 117 | 129 | 1500 | 风冷 | 2100×1200×1330
jet-power n136 b32 dòng 0 SC33W1150D2: P 900/720 S 1000/800 → P 63/50 S 69/55
    | SD-1000 | 1000 | 800 | 900 | 720 | SC33W1150D2 | L6 | Electric | 32.8 | 180x215 | JET634D
```
**model**: 564 lượt, 7 NCC
```
baifa-power n101 b0 dòng 2 4BTAA3.3G14: 4BTAA3.3G14 → 1104D-E44TAG1
    | BF-C66Q-T3 | 66 | 60 | CUMMINS | 4BTAA3.3G14 | | S1L2-Y | STAGE 3A | INDIA
huayuan-weifang n113 b13 dòng 0 F8L413F: F8L413F → D226B-3D
    | HY90GF | 90 | 99 | F8L413F | COP | 117 | 129 | 1500 | 风冷 | 2100×1200×1330
jet-power n136 b32 dòng 0 SC33W1150D2: SC33W1150D2 → SC4H95D2
    | SD-1000 | 1000 | 800 | 900 | 720 | SC33W1150D2 | L6 | Electric | 32.8 | 180x215 | JET634D
```
**freq**: 186 lượt, 3 NCC
```
lees-power n5001 b243 dòng 0 6CTAA8.3-G2: 60 → 50
    | LSC250S3-6 | 184 | 230 | 200 | 250 | 6CTAA8.3-G2 |
mecca-power n5001 b46 dòng 0 DP054CA: null → 50
    | MC138D | 100 | 125 | 110 | 138 | DP054CA |
shengfeng-fuan n108 b7 dòng 0 404D-22TAG: 60 → 50
    | YH-P28KW | 60HZ | 28/36 | 30.8/39.6 | 404D-22TAG | PI144F | Elec
```
**other**: 149 lượt, 3 NCC
```
baifa-power n101 b0 dòng 2 4BTAA3.3G14: S1L2-Y → UCI 224G
    | BF-C66Q-T3 | 66 | 60 | CUMMINS | 4BTAA3.3G14 | | S1L2-Y | STAGE 3A | INDIA
jet-power n136 b32 dòng 0 SC33W1150D2: JET634D → JET224E
    | SD-1000 | 1000 | 800 | 900 | 720 | SC33W1150D2 | L6 | Electric | 32.8 | 180x215 | JET634D
shengfeng-fuan n108 b6 dòng 0 1103A-33G: PT144G → PI044G
    | YH-P24kw | 50HZ | 24/30 | 26.4/33 | 1103A-33G | PT144G | Mech.
```
**makes**: 60 lượt, 2 NCC
```
baifa-power n101 b0 dòng 2 4BTAA3.3G14: Cummins → 
    | BF-C66Q-T3 | 66 | 60 | CUMMINS | 4BTAA3.3G14 | | S1L2-Y | STAGE 3A | INDIA
previa-ningde n102 b2 dòng 0 QSB7-G5: Cummins → 
    | PR185C | 250 | 200 | 230 | 185 | QSB7-G5 | OP2650*1000*1800 | AT3588*1180*2150
baifa-power n101 b0 dòng 6 NEF45SM1F.S500: FPT → 
    | BF-FP65-T3 | 65 | 60 | FPT | NEF45SM1F.S500 | | | STAGE IIIA | ITALY
```
**emission đổi**: 53 lượt, 1 NCC
```
baifa-power n101 b0 dòng 3 QSB5-G1: TIER 3/ STAGE 3A/ CHINA STAGE3 → STAGE 3A
    | BF-C70-T3 | 70 | 63 | QSB5-G1 | | S1L2-Y | TIER 3/ STAGE 3A/ CHINA STAGE3 | TBA
baifa-power n101 b0 dòng 3 S1L2-Y: TIER 3/ STAGE 3A/ CHINA STAGE3 → STAGE 3A
    | BF-C70-T3 | 70 | 63 | QSB5-G1 | | S1L2-Y | TIER 3/ STAGE 3A/ CHINA STAGE3 | TBA
baifa-power n101 b0 dòng 14 TAD851GE: STAGE IIIA/ TIER 3 → TIER 3/ STAGE 3A/ CHINA STAGE3
    | BF-V220-T3 | 220 | 200 | VOLVO | TAD851GE | EMS2 / ECU | UCI 274H1 | STAGE IIIA/ TIER 3 | INDIA
```
**gov bỏ**: 26 lượt, 1 NCC
```
baifa-power n101 b0 dòng 14 TAD851GE: EMS2 / ECU → ∅
    | BF-V220-T3 | 220 | 200 | VOLVO | TAD851GE | EMS2 / ECU | UCI 274H1 | STAGE IIIA/ TIER 3 | INDIA
baifa-power n101 b0 dòng 14 UCI 274H1: EMS2 / ECU → ∅
    | BF-V220-T3 | 220 | 200 | VOLVO | TAD851GE | EMS2 / ECU | UCI 274H1 | STAGE IIIA/ TIER 3 | INDIA
baifa-power n101 b0 dòng 15 TAD851GE: EMS2 / ECU → ∅
    | BF-V250-T3 | 250 | 230 | VOLVO | TAD851GE | EMS2 / ECU | UCDI 274J1 | STAGE IIIA/ TIER 3 | INDIA
```
**gov thêm**: 25 lượt, 1 NCC
```
baifa-power n101 b1 dòng 10 5008AC-E30TAG3: ∅ → EMS2 / ECU
    | | 1124 | 5008AC-E30TAG3 | | TIER 2 | TBA
baifa-power n101 b1 dòng 11 QST30-G4: ∅ → EMS2 / ECU
    | BF-C1100Q-T2 | 1100 | 1000 | CUMMINS | QST30-G4 | | S6L1D-E4 | TIER 2/ CHINA STAGE3 | USA
baifa-power n101 b1 dòng 11 S6L1D-E4: ∅ → EMS2 / ECU
    | BF-C1100Q-T2 | 1100 | 1000 | CUMMINS | QST30-G4 | | S6L1D-E4 | TIER 2/ CHINA STAGE3 | USA
```
**emission bỏ**: 14 lượt, 1 NCC
```
baifa-power n101 b1 dòng 2 QSK23-G8: TIER 2/ CHINA STAGE3 → ∅
    | BF-C825Q-T2 | 825 | 750 | CUMMINS | QSK23-G8 | | S5L1D-H41 | TIER 2/ CHINA STAGE3 | INDIA
baifa-power n101 b1 dòng 3 QSK23-G9: TIER 2/ CHINA STAGE3 → ∅
    | BF-C900Q-T2 | 900 | 810 | QSK23-G9 | | S6L1D-C4 | TIER 2/ CHINA STAGE3 | INDIA
baifa-power n101 b1 dòng 4 2806C-E18TTAG6: TIER 2 → ∅
    | BF-P895-T2 | 895 | 813 | PERKINS | 2806C-E18TTAG6 | | S6L1D-C4 | TIER 2 | USA
```
**cyl thêm**: 12 lượt, 1 NCC
```
huayuan-weifang n113 b13 dòng 0 F8L413F: ∅ → 3
    | HY90GF | 90 | 99 | F8L413F | COP | 117 | 129 | 1500 | 风冷 | 2100×1200×1330
huayuan-weifang n113 b13 dòng 1 F8L413F: ∅ → 3
    | HY100GF | 100 | 110 | F8L413F | COP | 117 | 129 | 1500 | 风冷 | 2550×1300×1330
huayuan-weifang n113 b13 dòng 2 F10L413: ∅ → 3
    | HY120GF | 120 | 132 | F10L413 | COP | 147 | 161 | 1500 | 风冷 | 2100×1200×1330
```
**weight thêm**: 12 lượt, 1 NCC
```
huayuan-weifang n113 b13 dòng 0 F8L413F: ∅ → 800
    | HY90GF | 90 | 99 | F8L413F | COP | 117 | 129 | 1500 | 风冷 | 2100×1200×1330
huayuan-weifang n113 b13 dòng 1 F8L413F: ∅ → 800
    | HY100GF | 100 | 110 | F8L413F | COP | 117 | 129 | 1500 | 风冷 | 2550×1300×1330
huayuan-weifang n113 b13 dòng 2 F10L413: ∅ → 800
    | HY120GF | 120 | 132 | F10L413 | COP | 147 | 161 | 1500 | 风冷 | 2100×1200×1330
```
**fuel thêm**: 12 lượt, 1 NCC
```
huayuan-weifang n113 b13 dòng 0 F8L413F: ∅ → 215
    | HY90GF | 90 | 99 | F8L413F | COP | 117 | 129 | 1500 | 风冷 | 2100×1200×1330
huayuan-weifang n113 b13 dòng 1 F8L413F: ∅ → 215
    | HY100GF | 100 | 110 | F8L413F | COP | 117 | 129 | 1500 | 风冷 | 2550×1300×1330
huayuan-weifang n113 b13 dòng 2 F10L413: ∅ → 215
    | HY120GF | 120 | 132 | F10L413 | COP | 147 | 161 | 1500 | 风冷 | 2100×1200×1330
```
**disp thêm**: 12 lượt, 1 NCC
```
huayuan-weifang n113 b13 dòng 0 F8L413F: ∅ → 3.12
    | HY90GF | 90 | 99 | F8L413F | COP | 117 | 129 | 1500 | 风冷 | 2100×1200×1330
huayuan-weifang n113 b13 dòng 1 F8L413F: ∅ → 3.12
    | HY100GF | 100 | 110 | F8L413F | COP | 117 | 129 | 1500 | 风冷 | 2550×1300×1330
huayuan-weifang n113 b13 dòng 2 F10L413: ∅ → 3.12
    | HY120GF | 120 | 132 | F10L413 | COP | 147 | 161 | 1500 | 风冷 | 2100×1200×1330
```
**emission thêm**: 9 lượt, 1 NCC
```
baifa-power n101 b0 dòng 6 NEF45SM1F.S500: ∅ → STAGE 3A
    | BF-FP65-T3 | 65 | 60 | FPT | NEF45SM1F.S500 | | | STAGE IIIA | ITALY
baifa-power n101 b0 dòng 7 NEF45TE1P.S551: ∅ → STAGE 3A
    | BF-FP88-T3 | 88 | 80 | FPT | NEF45TE1P.S551 | | | STAGE IIIA/ TIER 3 | ITALY
baifa-power n101 b0 dòng 8 NEF45TE2p.9S550: ∅ → STAGE 3A
    | BF-FP110-T3 | 110 | 100 | FPT | NEF45TE2p.9S550 | | | STAGE IIIA/ TIER 3 | ITALY
```
**bore đổi**: 2 lượt, 1 NCC
```
jet-power n136 b32 dòng 0 SC33W1150D2: 180x215 → 105x124
    | SD-1000 | 1000 | 800 | 900 | 720 | SC33W1150D2 | L6 | Electric | 32.8 | 180x215 | JET634D
jet-power n136 b32 dòng 0 JET634D: 180x215 → 105x124
    | SD-1000 | 1000 | 800 | 900 | 720 | SC33W1150D2 | L6 | Electric | 32.8 | 180x215 | JET634D
```
**disp đổi**: 2 lượt, 1 NCC
```
jet-power n136 b32 dòng 0 SC33W1150D2: 32.8 → 4.3
    | SD-1000 | 1000 | 800 | 900 | 720 | SC33W1150D2 | L6 | Electric | 32.8 | 180x215 | JET634D
jet-power n136 b32 dòng 0 JET634D: 32.8 → 4.3
    | SD-1000 | 1000 | 800 | 900 | 720 | SC33W1150D2 | L6 | Electric | 32.8 | 180x215 | JET634D
```

### Không tự xác nhận được

| dạng | số |
|---|--:|
| emission đổi: mới không kiểm được, cũ ? | 53 |
| gov bỏ: mới không kiểm được | 26 |
| emission bỏ: mới không kiểm được | 14 |
| weight thêm: mới KHÔNG xác nhận | 12 |
| fuel thêm: mới không kiểm được | 12 |
| emission thêm: mới không kiểm được | 9 |
| bore đổi: mới không kiểm được, cũ ? | 2 |
| disp đổi: mới tự xác nhận, cũ cũng hợp lệ | 2 |

```
baifa-power n101 b0 dòng 3 emission: TIER 3/ STAGE 3A/ CHINA STAGE3 → STAGE 3A | {"standby":{"kVA":110},"prime":{"kVA":100}}
baifa-power n101 b0 dòng 3 emission: TIER 3/ STAGE 3A/ CHINA STAGE3 → STAGE 3A | {"standby":{"kVA":110},"prime":{"kVA":100}}
baifa-power n101 b0 dòng 6 emission: ∅ → STAGE 3A | {"standby":{"kVA":198},"prime":{"kVA":180}}
baifa-power n101 b0 dòng 7 emission: ∅ → STAGE 3A | {"standby":{"kVA":220},"prime":{"kVA":200}}
baifa-power n101 b0 dòng 8 emission: ∅ → STAGE 3A | {"standby":{"kVA":248},"prime":{"kVA":225}}
baifa-power n101 b0 dòng 10 emission: ∅ → STAGE 3A | {"standby":{"kVA":440},"prime":{"kVA":400}}
baifa-power n101 b0 dòng 11 emission: ∅ → STAGE 3A | {"standby":{"kVA":550},"prime":{"kVA":500}}
baifa-power n101 b0 dòng 12 emission: ∅ → STAGE 3A | {"standby":{"kVA":66},"prime":{"kVA":60}}
baifa-power n101 b0 dòng 14 emission: STAGE IIIA/ TIER 3 → TIER 3/ STAGE 3A/ CHINA STAGE3 | {"standby":{"kVA":80},"prime":{"kVA":72}}
baifa-power n101 b0 dòng 14 gov: EMS2 / ECU → ∅ | {"standby":{"kVA":80},"prime":{"kVA":72}}
baifa-power n101 b0 dòng 14 emission: STAGE IIIA/ TIER 3 → TIER 3/ STAGE 3A/ CHINA STAGE3 | {"standby":{"kVA":80},"prime":{"kVA":72}}
baifa-power n101 b0 dòng 14 gov: EMS2 / ECU → ∅ | {"standby":{"kVA":80},"prime":{"kVA":72}}
… còn 118
```
