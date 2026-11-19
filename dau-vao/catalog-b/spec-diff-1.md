<!-- spec-diff -->
## Kiểm chéo danh mục (spec-diff): git:a89b88be ↔ .

- Bản ghi: 60.086 → 59.818; **610** đổi, 305 mất, 37 thêm, ở 135 bảng của 31 NCC
- Đảo vai động cơ ↔ đầu phát (mã mà ≥ 3 NCC khác đọc ở vai kia): 0 → **12** ❌ TĂNG (chặn)
- Tự kiểm số với công suất của dòng: 8 giá trị đổi / thêm không tự xác nhận được (soát tay)
- Chưa đọc được (`node suppliers/unread-tables.mjs`, để thiếu thay vì đoán): bảng không cho bản ghi nào: 3.112 → 3.125; ô động cơ không đọc được, mã ở cột khác: 0 → 334; dòng điện / điện áp theo vị trí không khớp công suất: 230 → 227; dòng là cặp nhãn | giá trị: 164 → 164; số vô lý so với công suất: 139 → 123; dòng tổng quan dòng máy: một dải công suất, không là một tổ máy: 90 → 90; số bằng đúng công suất của dòng, không là khối lượng / độ ồn: 77 → 77; tổ máy nhiều động cơ: 40 → 40; mã đầu phát trùng model tổ máy: 37 → 37; cặp a/b dưới nhãn không ghi mức / đơn vị: 34 → 34; một ô ghi hai mã: 25 → 26; ngoại lệ theo dòng: 5 → 8; điện áp trùng công suất của dòng: 6 → 6; dòng máy lẫn với dòng tiêu đề: 5 → 5; dòng điện tổ máy không khớp công suất: 5 → 5; bảng máy khí: dòng máy trong tiêu đề không đọc thêm: 2 → 2; trang có hai động cơ: số liệu kích cỡ động cơ không rõ của động cơ nào: 2 → 2; số có dấu phẩy nghìn / thập phân không rõ: 2 → 2; ô dòng điện không đọc được thành số: 1 → 1
- Thay đổi là chủ ý thì không chặn; vẫn phải soát MỌI dạng và đo top 30 ứng viên bằng tay (bộ nhớ kiem-cheo-toan-bo). Bản đầy đủ: artifact `spec-diff` của lượt chạy.

### Theo NCC

| NCC | dòng đổi | đổi | mất | thêm |
|---|--:|--:|--:|--:|
| zhengchi-power | 525 | 517 | 8 | 0 |
| taihai-taizhou | 136 | 0 | 123 | 13 |
| ettes-power | 86 | 4 | 82 | 0 |
| tellhow-power | 35 | 35 | 0 | 0 |
| eastern-lion-fuan | 30 | 4 | 26 | 0 |
| sanq-power | 24 | 12 | 12 | 0 |
| xingguang-jiangsu | 22 | 0 | 22 | 0 |
| weichai-heavy-machinery | 18 | 8 | 10 | 0 |
| saudi-diesel | 17 | 0 | 0 | 17 |
| kangwo-guangdong | 15 | 0 | 15 | 0 |
| baifa-power | 5 | 5 | 0 | 0 |
| bruno-generators | 5 | 0 | 5 | 0 |
| tecnogen | 5 | 4 | 1 | 0 |
| genlitec | 4 | 0 | 0 | 4 |
| huatai-yangzhou | 3 | 3 | 0 | 0 |
| mecca-power | 3 | 3 | 0 | 0 |
| chuangyuan-zhongshan | 2 | 2 | 0 | 0 |
| kaihua-genset | 2 | 2 | 0 | 0 |
| weichai-power | 2 | 2 | 0 | 0 |
| gb-power | 2 | 0 | 0 | 2 |
| acepow-fuan | 1 | 0 | 1 | 0 |
| aosif | 1 | 1 | 0 | 0 |
| fengfa-taizhou | 1 | 1 | 0 | 0 |
| generatordieselchina | 1 | 1 | 0 | 0 |
| jet-power | 1 | 1 | 0 | 0 |
| jlmech-wuhan | 1 | 1 | 0 | 0 |
| landtop-fuzhou | 1 | 1 | 0 | 0 |
| voltgent | 1 | 1 | 0 | 0 |
| waeta-fujian | 1 | 1 | 0 | 0 |
| zhengdian-zhengzhou | 1 | 1 | 0 | 0 |
| tecgen-fujian | 1 | 0 | 0 | 1 |

### Dạng thay đổi (vài ví dụ mỗi dạng)

**model**: 596 lượt, 20 NCC
```
aosif n123 b21 dòng 19 8M33D1012E311^: 8M33D1012E311^ → 8M33D1012E311
    | AW1125 | 1000/800 | 1125/900 | 8M33D1012E311^ | 218.9 | 12V | 31.8 |
baifa-power n101 b3 dòng 34 8M33G6D3/5^: 8M33G6D3/5^ → 8M33G6D3/5
    | BF-BD1100-3 | 1100 | 1000 | 8M33G6D3/5^ | | CHINA STAGE3 | CHINA
chuangyuan-zhongshan n103 b3 dòng 47 8M33D975E310^: 8M33D975E310^ → 8M33D975E310
    | 20 | 800 | 400 | 1500 | 0.8 | 50 | 4200*1800*2300 | 7200 | 8M33D975E310^ | 8/150/185 | 26.14
```
**MẤT bản ghi**: 305 lượt, 11 NCC
```
acepow-fuan n127 b34 dòng L UC274D / UCI274D: alternator UC274D / UCI274D
    (bảng nhãn)
bruno-generators n101 b0 dòng 0 MCP 120-80: engine MCP 120-80
    | SL 9506 KL | 6 | 250 W | 1500 W | AC | 230 V | 5.3 | 4.5 | 6.5 | 6 | KOHLER KDW 702 | 686 | 5 | 5.9 | 0.8 | 0.7 | N | 140 | 245 | 130 | 230 | 245 | 280 | 920 | 1050 | MCP 120-80
eastern-lion-fuan n114 b18 dòng 14 EL 224E: engine EL 224E
    | GF/GFS-HC67 | 48 | 60 | 53 | 67 | 4105ZD(小泵） | 56 | EL 224E | 48 | RUIFEN6120 | Detail
```
**THÊM bản ghi**: 37 lượt, 5 NCC
```
gb-power n1010 b25 dòng L LSA 43.2 L6: alternator LSA 43.2 L6
    (bảng nhãn)
genlitec n132 b31 dòng L LL5114H: alternator LL5114H
    (bảng nhãn)
saudi-diesel n109 b5 dòng L TAL-A44-M: alternator TAL-A44-M
    (bảng nhãn)
```
**other**: 26 lượt, 5 NCC
```
eastern-lion-fuan n114 b18 dòng 14 RUIFEN6120: EL 224E → null
    | GF/GFS-HC67 | 48 | 60 | 53 | 67 | 4105ZD(小泵） | 56 | EL 224E | 48 | RUIFEN6120 | Detail
kaihua-genset n119 b23 dòng 25 S6L1D-F4: 1250Z → 12M33D1108E200
    | HC-BD1250 | 1250Z | 1135 | 12M33D1108E200 | S6L1D-F4 | 4600*2100*2300 | ISO 20'ft HQ | Download
sanq-power n113 b18 dòng 0 S8000AM1.S500: PI144G → null
    | SQFP33 | 26/33 | 24/30 | S8000AM1.S500 | PI144G | 3L | 2.9
```
**cyl thêm**: 14 lượt, 2 NCC
```
sanq-power n113 b18 dòng 0 S8000AM1.S500: ∅ → 3L
    | SQFP33 | 26/33 | 24/30 | S8000AM1.S500 | PI144G | 3L | 2.9
zhengchi-power n132 b31 dòng 1 ZCDL-C280: ∅ → 6
    | 250KW | 280KW | 康明斯 | ZCDL-C280 | MTAA11-G3 | 50Hz | 230/400 | 6.3/10.5 | 200g/kw.h | 三相四线 | 6 | 108 | 3100×1300×1760 | 3200 | 更多
sanq-power n113 b18 dòng 1 NEF45AM2.S500: ∅ → 4L
    | SQFP55 | 44/55 | 40/50 | NEF45AM2.S500 | UCI224D | 4L | 4.5
```
**weight thêm**: 6 lượt, 2 NCC
```
tecnogen n2005 b4 dòng 0 AUS7310-17: ∅ → 560
    | MI12MSX* | 11 | 10 | 13.2 | 12 | S3L2 SD | M | 3 | 1318 | 9.7 | 11.8 | 2.1 | 2.5 | N | AUS7310-17 | ACP 7320 | 65 | 75 | 150 | 80 | 125 | 560
zhengchi-power n132 b31 dòng 1 ZCDL-C280: ∅ → 3200
    | 250KW | 280KW | 康明斯 | ZCDL-C280 | MTAA11-G3 | 50Hz | 230/400 | 6.3/10.5 | 200g/kw.h | 三相四线 | 6 | 108 | 3100×1300×1760 | 3200 | 更多
tecnogen n2005 b4 dòng 1 AUS7310-17: ∅ → 560
    | MI17MSX* | 14.8 | 13.5 | 18.8 | 17 | S4L2 SD | M | 4 | 1758 | 13.7 | 16.2 | 2.8 | 3.4 | N | AUS7310-17 | ACP 7320 | 65 | 75 | 150 | 80 | 125 | 560
```
**power**: 5 lượt, 2 NCC
```
huatai-yangzhou n111 b10 dòng 12 WD305TAD68: R 165/140 → ∅
    | 700GF | 140/165 | 1267 | WD305TAD68 | 750 | 12缸V型 | 196 | 55 | 3800×1800×2100 | 4550
tecnogen n2005 b4 dòng 0 AUS7310-17: P 11.8/9.7 S 13.2/10 → P 10/· S 11/·
    | MI12MSX* | 11 | 10 | 13.2 | 12 | S3L2 SD | M | 3 | 1318 | 9.7 | 11.8 | 2.1 | 2.5 | N | AUS7310-17 | ACP 7320 | 65 | 75 | 150 | 80 | 125 | 560
huatai-yangzhou n111 b10 dòng 13 WD327TAD78: R 165/140 → ∅
    | 800GF | 140/165 | 1448 | WD327TAD78 | 858 | 12缸V型 | 196 | 60 | 3900×1850×2100 | 5000
```
**cyl bỏ**: 4 lượt, 1 NCC
```
tecnogen n2005 b4 dòng 0 AUS7310-17: 3 → ∅
    | MI12MSX* | 11 | 10 | 13.2 | 12 | S3L2 SD | M | 3 | 1318 | 9.7 | 11.8 | 2.1 | 2.5 | N | AUS7310-17 | ACP 7320 | 65 | 75 | 150 | 80 | 125 | 560
tecnogen n2005 b4 dòng 1 AUS7310-17: 4 → ∅
    | MI17MSX* | 14.8 | 13.5 | 18.8 | 17 | S4L2 SD | M | 4 | 1758 | 13.7 | 16.2 | 2.8 | 3.4 | N | AUS7310-17 | ACP 7320 | 65 | 75 | 150 | 80 | 125 | 560
tecnogen n2005 b4 dòng 3 AUS7310-14: 3 → ∅
    | MI12TSX* | 11.5 | 10.5 | 14.2 | 12.9 | S3L2 SD | M | 3 | 1318 | 9.7 | 11.8 | 2 | 2.5 | N | AUS7310-14 | ACP 7320 | 65 | 75 | 150 | 80 | 125 | 560
```
**voltage thêm**: 2 lượt, 1 NCC
```
zhengchi-power n132 b31 dòng 1 ZCDL-C280: ∅ → 230/400
    | 250KW | 280KW | 康明斯 | ZCDL-C280 | MTAA11-G3 | 50Hz | 230/400 | 6.3/10.5 | 200g/kw.h | 三相四线 | 6 | 108 | 3100×1300×1760 | 3200 | 更多
zhengchi-power n132 b31 dòng 2 ZCDL-M275: ∅ → 230/400
    | 250KW | 275KW | 奔驰 | ZCDL-M275 | 6R1600G20F | 50Hz | 230/400 | 6.3/10.5 | 200g/kw.h | 三相四线 | 6 | 105 | 2900×1150×1650 | 2620 | 更多
```
**fuel thêm**: 2 lượt, 1 NCC
```
zhengchi-power n132 b31 dòng 1 ZCDL-C280: ∅ → 200g/kw.h
    | 250KW | 280KW | 康明斯 | ZCDL-C280 | MTAA11-G3 | 50Hz | 230/400 | 6.3/10.5 | 200g/kw.h | 三相四线 | 6 | 108 | 3100×1300×1760 | 3200 | 更多
zhengchi-power n132 b31 dòng 2 ZCDL-M275: ∅ → 200g/kw.h
    | 250KW | 275KW | 奔驰 | ZCDL-M275 | 6R1600G20F | 50Hz | 230/400 | 6.3/10.5 | 200g/kw.h | 三相四线 | 6 | 105 | 2900×1150×1650 | 2620 | 更多
```
**disp thêm**: 2 lượt, 1 NCC
```
zhengchi-power n132 b31 dòng 1 ZCDL-C280: ∅ → 108
    | 250KW | 280KW | 康明斯 | ZCDL-C280 | MTAA11-G3 | 50Hz | 230/400 | 6.3/10.5 | 200g/kw.h | 三相四线 | 6 | 108 | 3100×1300×1760 | 3200 | 更多
zhengchi-power n132 b31 dòng 2 ZCDL-M275: ∅ → 105
    | 250KW | 275KW | 奔驰 | ZCDL-M275 | 6R1600G20F | 50Hz | 230/400 | 6.3/10.5 | 200g/kw.h | 三相四线 | 6 | 105 | 2900×1150×1650 | 2620 | 更多
```

### Đảo vai

| NCC vai ← vai kia | cũ | mới |
|---|--:|--:|
| sanq-power engine←alternator | 0 | 12 |

Ca đảo vai MỚI:
```
sanq-power n113 b18 dòng 0 đọc engine=PI144G | alternator ở 8 NCC khác
    | SQFP33 | 26/33 | 24/30 | S8000AM1.S500 | PI144G | 3L | 2.9
sanq-power n113 b18 dòng 1 đọc engine=UCI224D | alternator ở 14 NCC khác
    | SQFP55 | 44/55 | 40/50 | NEF45AM2.S500 | UCI224D | 4L | 4.5
sanq-power n113 b18 dòng 2 đọc engine=UCI224G | alternator ở 17 NCC khác
    | SQFP88 | 70/88 | 64/80 | NEF45SM3.S500 | UCI224G | 4L | 4.5
sanq-power n113 b18 dòng 3 đọc engine=UCI274D | alternator ở 12 NCC khác
    | SQFP132 | 106/132 | 96/120 | NEF45TM3.S500 | UCI274D | 4L | 4.5
sanq-power n113 b18 dòng 4 đọc engine=UCI274E | alternator ở 16 NCC khác
    | SQFP138 | 110/138 | 100/125 | NEF67SM1.S500 | UCI274E | 6L | 6.7
sanq-power n113 b18 dòng 5 đọc engine=UCI274G | alternator ở 17 NCC khác
    | SQFP187 | 150/187 | 136/170 | NEF67TM4.S500 | UCI274G | 6L | 6.7
sanq-power n113 b18 dòng 6 đọc engine=UCI274H | alternator ở 16 NCC khác
    | SQFP220 | 176/220 | 160/200 | NEF67TM7.S500 | UCI274H | 6L | 6.7
sanq-power n113 b18 dòng 7 đọc engine=UCDI274K | alternator ở 12 NCC khác
    | SQFP275 | 220/275 | 200/250 | CURSOR87TE3.S550 | UCDI274K | 6L | 8.7
sanq-power n113 b18 dòng 8 đọc engine=HCI444D | alternator ở 8 NCC khác
    | SQFP330 | 264/330 | 240/300 | CURSOR87TE4.S550 | HCI444D | 6L | 8.7
sanq-power n113 b18 dòng 9 đọc engine=HCI544C | alternator ở 12 NCC khác
    | SQFP495 | 400/495 | 360/450 | CR13TE6W. S550 | HCI544C | 6L | 12.9
sanq-power n113 b18 dòng 10 đọc engine=HCI544D | alternator ở 9 NCC khác
    | SQFP550 | 440/550 | 400/500 | CR13TE7W. S550 | HCI544D | 6L | 12.9
sanq-power n113 b18 dòng 11 đọc engine=HCI544E | alternator ở 10 NCC khác
    | SQFP660 | 528/660 | 480/600 | CR16TE1W.S550 | HCI544E | 6L | 15.9
```

### Không tự xác nhận được

| dạng | số |
|---|--:|
| cyl bỏ: mới không kiểm được | 4 |
| fuel thêm: mới không kiểm được | 2 |
| disp thêm: mới KHÔNG xác nhận | 2 |

```
tecnogen n2005 b4 dòng 0 cyl: 3 → ∅ | {"standby":{"kVA":11},"prime":{"kVA":10}}
tecnogen n2005 b4 dòng 1 cyl: 4 → ∅ | {"standby":{"kVA":14.8},"prime":{"kVA":13.5}}
tecnogen n2005 b4 dòng 3 cyl: 3 → ∅ | {"standby":{"kVA":11.5},"prime":{"kVA":10.5}}
tecnogen n2005 b4 dòng 4 cyl: 4 → ∅ | {"standby":{"kVA":16.5},"prime":{"kVA":15}}
zhengchi-power n132 b31 dòng 1 fuel: ∅ → 200g/kw.h | {"rated":{"kW":250},"standby":{"kW":280}}
zhengchi-power n132 b31 dòng 1 disp: ∅ → 108 | {"rated":{"kW":250},"standby":{"kW":280}}
zhengchi-power n132 b31 dòng 2 fuel: ∅ → 200g/kw.h | {"rated":{"kW":250},"standby":{"kW":275}}
zhengchi-power n132 b31 dòng 2 disp: ∅ → 105 | {"rated":{"kW":250},"standby":{"kW":275}}
```
