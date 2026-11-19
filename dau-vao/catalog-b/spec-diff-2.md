<!-- spec-diff -->
## Kiểm chéo danh mục (spec-diff): git:a89b88be ↔ .

- Bản ghi: 60.086 → 60.077; **72** đổi, 33 mất, 24 thêm, ở 52 bảng của 24 NCC
- Đảo vai động cơ ↔ đầu phát (mã mà ≥ 3 NCC khác đọc ở vai kia): 0 → **0** ✅
- Tự kiểm số với công suất của dòng: 4 giá trị đổi / thêm không tự xác nhận được (soát tay)
- Chưa đọc được (`node suppliers/unread-tables.mjs`, để thiếu thay vì đoán): bảng không cho bản ghi nào: 3.112 → 3.113; dòng điện / điện áp theo vị trí không khớp công suất: 230 → 227; dòng là cặp nhãn | giá trị: 164 → 164; số vô lý so với công suất: 139 → 139; dòng tổng quan dòng máy: một dải công suất, không là một tổ máy: 90 → 90; số bằng đúng công suất của dòng, không là khối lượng / độ ồn: 77 → 77; tổ máy nhiều động cơ: 40 → 40; mã đầu phát trùng model tổ máy: 37 → 37; cặp a/b dưới nhãn không ghi mức / đơn vị: 34 → 34; ô động cơ không đọc được, mã ở cột khác: 0 → 32; một ô ghi hai mã: 25 → 26; ngoại lệ theo dòng: 5 → 8; điện áp trùng công suất của dòng: 6 → 6; dòng máy lẫn với dòng tiêu đề: 5 → 5; dòng điện tổ máy không khớp công suất: 5 → 5; bảng máy khí: dòng máy trong tiêu đề không đọc thêm: 2 → 2; trang có hai động cơ: số liệu kích cỡ động cơ không rõ của động cơ nào: 2 → 2; số có dấu phẩy nghìn / thập phân không rõ: 2 → 2; ô dòng điện không đọc được thành số: 1 → 1
- Thay đổi là chủ ý thì không chặn; vẫn phải soát MỌI dạng và đo top 30 ứng viên bằng tay (bộ nhớ kiem-cheo-toan-bo). Bản đầy đủ: artifact `spec-diff` của lượt chạy.

### Theo NCC

| NCC | dòng đổi | đổi | mất | thêm |
|---|--:|--:|--:|--:|
| tellhow-power | 35 | 35 | 0 | 0 |
| eastern-lion-fuan | 30 | 4 | 26 | 0 |
| saudi-diesel | 17 | 0 | 0 | 17 |
| baifa-power | 5 | 5 | 0 | 0 |
| bruno-generators | 5 | 0 | 5 | 0 |
| tecnogen | 5 | 4 | 1 | 0 |
| ettes-power | 4 | 4 | 0 | 0 |
| genlitec | 4 | 0 | 0 | 4 |
| huatai-yangzhou | 3 | 3 | 0 | 0 |
| mecca-power | 3 | 3 | 0 | 0 |
| chuangyuan-zhongshan | 2 | 2 | 0 | 0 |
| weichai-heavy-machinery | 2 | 2 | 0 | 0 |
| weichai-power | 2 | 2 | 0 | 0 |
| gb-power | 2 | 0 | 0 | 2 |
| acepow-fuan | 1 | 0 | 1 | 0 |
| aosif | 1 | 1 | 0 | 0 |
| fengfa-taizhou | 1 | 1 | 0 | 0 |
| generatordieselchina | 1 | 1 | 0 | 0 |
| jet-power | 1 | 1 | 0 | 0 |
| landtop-fuzhou | 1 | 1 | 0 | 0 |
| voltgent | 1 | 1 | 0 | 0 |
| waeta-fujian | 1 | 1 | 0 | 0 |
| zhengdian-zhengzhou | 1 | 1 | 0 | 0 |
| tecgen-fujian | 1 | 0 | 0 | 1 |

### Dạng thay đổi (vài ví dụ mỗi dạng)

**model**: 65 lượt, 16 NCC
```
aosif n123 b21 dòng 19 8M33D1012E311^: 8M33D1012E311^ → 8M33D1012E311
    | AW1125 | 1000/800 | 1125/900 | 8M33D1012E311^ | 218.9 | 12V | 31.8 |
baifa-power n101 b3 dòng 34 8M33G6D3/5^: 8M33G6D3/5^ → 8M33G6D3/5
    | BF-BD1100-3 | 1100 | 1000 | 8M33G6D3/5^ | | CHINA STAGE3 | CHINA
chuangyuan-zhongshan n103 b3 dòng 47 8M33D975E310^: 8M33D975E310^ → 8M33D975E310
    | 20 | 800 | 400 | 1500 | 0.8 | 50 | 4200*1800*2300 | 7200 | 8M33D975E310^ | 8/150/185 | 26.14
```
**MẤT bản ghi**: 33 lượt, 4 NCC
```
acepow-fuan n127 b34 dòng L UC274D / UCI274D: alternator UC274D / UCI274D
    (bảng nhãn)
bruno-generators n101 b0 dòng 0 MCP 120-80: engine MCP 120-80
    | SL 9506 KL | 6 | 250 W | 1500 W | AC | 230 V | 5.3 | 4.5 | 6.5 | 6 | KOHLER KDW 702 | 686 | 5 | 5.9 | 0.8 | 0.7 | N | 140 | 245 | 130 | 230 | 245 | 280 | 920 | 1050 | MCP 120-80
eastern-lion-fuan n114 b18 dòng 14 EL 224E: engine EL 224E
    | GF/GFS-HC67 | 48 | 60 | 53 | 67 | 4105ZD(小泵） | 56 | EL 224E | 48 | RUIFEN6120 | Detail
```
**THÊM bản ghi**: 24 lượt, 4 NCC
```
gb-power n1010 b25 dòng L LSA 43.2 L6: alternator LSA 43.2 L6
    (bảng nhãn)
genlitec n132 b31 dòng L LL5114H: alternator LL5114H
    (bảng nhãn)
saudi-diesel n109 b5 dòng L TAL-A44-M: alternator TAL-A44-M
    (bảng nhãn)
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
**other**: 4 lượt, 1 NCC
```
eastern-lion-fuan n114 b18 dòng 14 RUIFEN6120: EL 224E → null
    | GF/GFS-HC67 | 48 | 60 | 53 | 67 | 4105ZD(小泵） | 56 | EL 224E | 48 | RUIFEN6120 | Detail
eastern-lion-fuan n144 b48 dòng 14 RUIFEN6120: EL 274H → null
    | GFS-W222 | 160 | 200 | 178 | 222 | 6126ZLD新 | 215 | EL 274H | 160 | RUIFEN6120 | Detail
eastern-lion-fuan n144 b48 dòng 15 RUIFEN6120: EL 274J → null
    | GFS-W250 | 180 | 225 | 200 | 250 | 6126ZLD新 | 215 | EL 274J | 184 | RUIFEN6120 | Detail
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
**weight thêm**: 4 lượt, 1 NCC
```
tecnogen n2005 b4 dòng 0 AUS7310-17: ∅ → 560
    | MI12MSX* | 11 | 10 | 13.2 | 12 | S3L2 SD | M | 3 | 1318 | 9.7 | 11.8 | 2.1 | 2.5 | N | AUS7310-17 | ACP 7320 | 65 | 75 | 150 | 80 | 125 | 560
tecnogen n2005 b4 dòng 1 AUS7310-17: ∅ → 560
    | MI17MSX* | 14.8 | 13.5 | 18.8 | 17 | S4L2 SD | M | 4 | 1758 | 13.7 | 16.2 | 2.8 | 3.4 | N | AUS7310-17 | ACP 7320 | 65 | 75 | 150 | 80 | 125 | 560
tecnogen n2005 b4 dòng 3 AUS7310-14: ∅ → 560
    | MI12TSX* | 11.5 | 10.5 | 14.2 | 12.9 | S3L2 SD | M | 3 | 1318 | 9.7 | 11.8 | 2 | 2.5 | N | AUS7310-14 | ACP 7320 | 65 | 75 | 150 | 80 | 125 | 560
```

### Không tự xác nhận được

| dạng | số |
|---|--:|
| cyl bỏ: mới không kiểm được | 4 |

```
tecnogen n2005 b4 dòng 0 cyl: 3 → ∅ | {"standby":{"kVA":11},"prime":{"kVA":10}}
tecnogen n2005 b4 dòng 1 cyl: 4 → ∅ | {"standby":{"kVA":14.8},"prime":{"kVA":13.5}}
tecnogen n2005 b4 dòng 3 cyl: 3 → ∅ | {"standby":{"kVA":11.5},"prime":{"kVA":10.5}}
tecnogen n2005 b4 dòng 4 cyl: 4 → ∅ | {"standby":{"kVA":16.5},"prime":{"kVA":15}}
```
