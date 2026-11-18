<!-- spec-diff -->
## Kiểm chéo danh mục (spec-diff): git:b797f746 ↔ .

- Bản ghi: 58.912 → 58.963; **196** đổi, 25 mất, 76 thêm, ở 109 bảng của 12 NCC
- Đảo vai động cơ ↔ đầu phát (mã mà ≥ 3 NCC khác đọc ở vai kia): 1 → **1** ✅
- Tự kiểm số với công suất của dòng: 230 giá trị đổi / thêm không tự xác nhận được (soát tay)
- Chưa đọc được (`node suppliers/unread-tables.mjs`, để thiếu thay vì đoán): bảng không cho bản ghi nào: — → 3.177; dòng điện / điện áp theo vị trí không khớp công suất: — → 230; số vô lý so với công suất: — → 212; dòng là cặp nhãn | giá trị: — → 164; mã đầu phát trùng model tổ máy: — → 37; cặp a/b dưới nhãn không ghi mức / đơn vị: — → 34; tổ máy nhiều động cơ: — → 6; dòng điện tổ máy không khớp công suất: — → 5; một ô ghi hai mã: — → 1
- Thay đổi là chủ ý thì không chặn; vẫn phải soát MỌI dạng và đo top 30 ứng viên bằng tay (bộ nhớ kiem-cheo-toan-bo). Bản đầy đủ: artifact `spec-diff` của lượt chạy.

### Theo NCC

| NCC | dòng đổi | đổi | mất | thêm |
|---|--:|--:|--:|--:|
| power-hf | 105 | 105 | 0 | 0 |
| gb-power | 65 | 65 | 0 | 0 |
| huachai-deutz | 55 | 0 | 16 | 39 |
| chenxing-weifang | 43 | 0 | 6 | 37 |
| yingtai-jiangsu | 14 | 14 | 0 | 0 |
| zhengdian-zhengzhou | 5 | 5 | 0 | 0 |
| bruno-generators | 3 | 3 | 0 | 0 |
| xinzhengfa | 2 | 2 | 0 | 0 |
| zichai | 2 | 0 | 2 | 0 |
| cameo-power | 1 | 0 | 1 | 0 |
| kangwo-guangdong | 1 | 1 | 0 | 0 |
| yunding-jiangsu | 1 | 1 | 0 | 0 |

### Dạng thay đổi (vài ví dụ mỗi dạng)

**current bỏ**: 116 lượt, 6 NCC
```
kangwo-guangdong n110 b12 dòng 5 L28M: 36 → ∅
    | GKW-15GF | 15 | 20 | 36 | L28M | 1 | 128/115 | 1.6 | 265.2 | 1300*700*900 | 460
power-hf n109 b10 dòng 12 PHF6110ZLD1(R2J01): 100 → ∅
    | 13 | PHF-100RX | 100 | 110 | 180 | PHF6110ZLD1(R2J01) | ● | ● | ●
xinzhengfa n101 b0 dòng 0 S175M: 12.2 → ∅
    | ZF3GF | 3.75 | 3 | 12.2 | 50/3000 | S175M | 630 × 480 × 510 | 65
```
**voltage bỏ**: 114 lượt, 3 NCC
```
bruno-generators n103 b1 dòng 0 Q401 AUS-80: 225 → ∅
    | MB 9504 KL | 4 | 250 W | 1000 W | DC | 48 V | - | - | - | - | KOHLER LDW 702 | 686 | - | 5,9 | - | 0,35 | N | 110 | 235 | 148 | 225 | 235 | 202 | 883 | 1060 | Q401 AUS-80
power-hf n109 b10 dòng 12 PHF6110ZLD1(R2J01): 110 → ∅
    | 13 | PHF-100RX | 100 | 110 | 180 | PHF6110ZLD1(R2J01) | ● | ● | ●
yingtai-jiangsu n113 b24 dòng 4 QSK50-G3: 1230 → ∅
    | 1120GF | 1120 | 1230 | 128 | 11830 | 6.40×2.04×2.64 | QSK50-G3 | 进口康明斯 | 1210 | 1401 | 16 | 50.3 | ≤197 | 电喷
```
**THÊM bản ghi**: 76 lượt, 2 NCC
```
chenxing-weifang n101 b0 dòng L NT855-GA: engine NT855-GA
    (bảng nhãn)
huachai-deutz n102 b1 dòng L BF6M1015CP-LA: engine BF6M1015CP-LA
    (bảng nhãn)
chenxing-weifang n102 b1 dòng L 6CTA8.3-G2: engine 6CTA8.3-G2
    (bảng nhãn)
```
**power**: 65 lượt, 1 NCC
```
gb-power n1001 b16 dòng L 403D-11G: P 10/8 S 11/8.8 R 4/3 → P 10/8 S 11/8.8
    (bảng nhãn)
gb-power n1001 b16 dòng L PI044E: P 10/8 S 11/8.8 R 4/3 → P 10/8 S 11/8.8
    (bảng nhãn)
gb-power n1002 b17 dòng L 403D-15G: P 12.5/10 S 14/11 R 4/3 → P 12.5/10 S 14/11
    (bảng nhãn)
```
**MẤT bản ghi**: 25 lượt, 4 NCC
```
cameo-power n112 b11 dòng 0 CK7000S: engine CK7000S
    | Model | CK7000S | CK7500S | CK8500S | CK9500S | CK12000S | CK15000S | CK18000S
chenxing-weifang n101 b0 dòng 0 NT855-GA: engine NT855-GA
    | 机组型号 | 200GF | 型号 | NT855-GA | 型号 | 200GF
huachai-deutz n102 b1 dòng 6 IP23/H: engine IP23/H
    | Steady state volt deviation | ≤±1% | Fuel consumption | 208g /kwh | Protection/ insulation | IP23/H
```

### Đảo vai

| NCC vai ← vai kia | cũ | mới |
|---|--:|--:|
| depco-power engine←alternator | 1 | 1 |

### Không tự xác nhận được

| dạng | số |
|---|--:|
| current bỏ: mới không kiểm được | 116 |
| voltage bỏ: mới không kiểm được | 114 |

```
bruno-generators n103 b1 dòng 0 voltage: 225 → ∅ | null
bruno-generators n103 b1 dòng 1 voltage: 225 → ∅ | null
bruno-generators n104 b2 dòng 1 voltage: 225 → ∅ | {"standby":{"kVA":244,"kW":190},"prime":{"kVA":9.5,"kW":7.6}}
kangwo-guangdong n110 b12 dòng 5 current: 36 → ∅ | {"rated":{"kW":15,"kVA":20}}
power-hf n109 b10 dòng 12 voltage: 110 → ∅ | {"prime":{"kW":100},"standby":{"kW":110}}
power-hf n109 b10 dòng 12 current: 100 → ∅ | {"prime":{"kW":100},"standby":{"kW":110}}
power-hf n109 b10 dòng 13 voltage: 132 → ∅ | {"prime":{"kW":120},"standby":{"kW":132}}
power-hf n109 b10 dòng 13 current: 120 → ∅ | {"prime":{"kW":120},"standby":{"kW":132}}
power-hf n109 b10 dòng 14 voltage: 330 → ∅ | {"prime":{"kW":300},"standby":{"kW":330}}
power-hf n109 b10 dòng 14 current: 300 → ∅ | {"prime":{"kW":300},"standby":{"kW":330}}
power-hf n109 b10 dòng 15 voltage: 385 → ∅ | {"prime":{"kW":350},"standby":{"kW":385}}
power-hf n109 b10 dòng 15 current: 350 → ∅ | {"prime":{"kW":350},"standby":{"kW":385}}
… còn 218
```
