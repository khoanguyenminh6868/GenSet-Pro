<!-- spec-diff -->
## Kiểm chéo danh mục (spec-diff): git:7d632e30 ↔ .

- Bản ghi: 59.222 → 59.212; **234** đổi, 11 mất, 1 thêm, ở 61 bảng của 16 NCC
- Đảo vai động cơ ↔ đầu phát (mã mà ≥ 3 NCC khác đọc ở vai kia): 3 → **3** ✅
- Tự kiểm số với công suất của dòng: 254 giá trị đổi / thêm không tự xác nhận được (soát tay)
- Thay đổi là chủ ý thì không chặn; vẫn phải soát MỌI dạng và đo top 30 ứng viên bằng tay (bộ nhớ kiem-cheo-toan-bo). Bản đầy đủ: artifact `spec-diff` của lượt chạy.

### Theo NCC

| NCC | dòng đổi | đổi | mất | thêm |
|---|--:|--:|--:|--:|
| power-hf | 105 | 105 | 0 | 0 |
| gb-power | 65 | 65 | 0 | 0 |
| sr-genset | 23 | 23 | 0 | 0 |
| yingtai-jiangsu | 14 | 14 | 0 | 0 |
| yingtai-group | 12 | 12 | 0 | 0 |
| zhengdian-zhengzhou | 5 | 5 | 0 | 0 |
| chenxing-weifang | 4 | 0 | 4 | 0 |
| bruno-generators | 3 | 3 | 0 | 0 |
| huachai-deutz | 3 | 0 | 3 | 0 |
| huatai-yangzhou | 3 | 3 | 0 | 0 |
| kubota | 2 | 0 | 1 | 1 |
| xinzhengfa | 2 | 2 | 0 | 0 |
| zichai | 2 | 0 | 2 | 0 |
| cameo-power | 1 | 0 | 1 | 0 |
| kangwo-guangdong | 1 | 1 | 0 | 0 |
| yunding-jiangsu | 1 | 1 | 0 | 0 |

### Dạng thay đổi (vài ví dụ mỗi dạng)

**voltage bỏ**: 135 lượt, 5 NCC
```
bruno-generators n103 b1 dòng 0 Q401 AUS-80: 225 → ∅
    | MB 9504 KL | 4 | 250 W | 1000 W | DC | 48 V | - | - | - | - | KOHLER LDW 702 | 686 | - | 5,9 | - | 0,35 | N | 110 | 235 | 148 | 225 | 235 | 202 | 883 | 1060 | Q401 AUS-80
power-hf n109 b10 dòng 13 PHF6132ZLD1(R4J01): 132 → ∅
    | 14 | PHF-120RX | 120 | 132 | 216 | PHF6132ZLD1(R4J01) | ● | ● | ●
sr-genset n2001 b0 dòng 11 4FWZL1: 104.5 → ∅
    | 50 | 400 | 95 | 118.75 | 104.5 | 130.625 | SRGENSET | 4FWZL1 | SRGENSET | SAL274C2 | PDF
```
**current bỏ**: 119 lượt, 7 NCC
```
huatai-yangzhou n111 b10 dòng 12 WD305TAD68: 1267 → ∅
    | 700GF | 140/165 | 1267 | WD305TAD68 | 750 | 12缸V型 | 196 | 55 | 3800×1800×2100 | 4550
kangwo-guangdong n110 b12 dòng 5 L28M: 36 → ∅
    | GKW-15GF | 15 | 20 | 36 | L28M | 1 | 128/115 | 1.6 | 265.2 | 1300*700*900 | 460
power-hf n109 b10 dòng 12 PHF6110ZLD1(R2J01): 100 → ∅
    | 13 | PHF-100RX | 100 | 110 | 180 | PHF6110ZLD1(R2J01) | ● | ● | ●
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
**MẤT bản ghi**: 11 lượt, 5 NCC
```
cameo-power n112 b11 dòng 0 CK7000S: engine CK7000S
    | Model | CK7000S | CK7500S | CK8500S | CK9500S | CK12000S | CK15000S | CK18000S
chenxing-weifang n101 b0 dòng 0 NT855-GA: engine NT855-GA
    | 机组型号 | 200GF | 型号 | NT855-GA | 型号 | 200GF
huachai-deutz n108 b6 dòng 0 10GF: engine 10GF
    | Model | 10GF | Model | F2L912D | Model | PI044F
```
**THÊM bản ghi**: 1 lượt, 1 NCC
```
kubota n2001 b0 dòng 1 D1703: engine D1703
    | Prime Output | kVA (kW) | 11.2 (11.2)
```

### Đảo vai

| NCC vai ← vai kia | cũ | mới |
|---|--:|--:|
| vantek-jiangsu alternator←engine | 2 | 2 |
| depco-power engine←alternator | 1 | 1 |

### Không tự xác nhận được

| dạng | số |
|---|--:|
| voltage bỏ: mới không kiểm được | 135 |
| current bỏ: mới không kiểm được | 119 |

```
bruno-generators n103 b1 dòng 0 voltage: 225 → ∅ | null
bruno-generators n103 b1 dòng 1 voltage: 225 → ∅ | null
bruno-generators n104 b2 dòng 1 voltage: 225 → ∅ | {"standby":{"kVA":244,"kW":190},"prime":{"kVA":9.5,"kW":7.6}}
huatai-yangzhou n111 b10 dòng 12 current: 1267 → ∅ | {"rated":{"kVA":165,"kW":140}}
huatai-yangzhou n111 b10 dòng 13 current: 1448 → ∅ | {"rated":{"kVA":165,"kW":140}}
huatai-yangzhou n111 b10 dòng 14 current: 1538.5 → ∅ | {"rated":{"kVA":165,"kW":140}}
kangwo-guangdong n110 b12 dòng 5 current: 36 → ∅ | {"rated":{"kW":15,"kVA":20}}
power-hf n109 b10 dòng 12 current: 100 → ∅ | {"prime":{"kW":100},"standby":{"kW":110}}
power-hf n109 b10 dòng 13 voltage: 132 → ∅ | {"prime":{"kW":120},"standby":{"kW":132}}
power-hf n109 b10 dòng 13 current: 120 → ∅ | {"prime":{"kW":120},"standby":{"kW":132}}
power-hf n109 b10 dòng 14 voltage: 330 → ∅ | {"prime":{"kW":300},"standby":{"kW":330}}
power-hf n109 b10 dòng 14 current: 300 → ∅ | {"prime":{"kW":300},"standby":{"kW":330}}
… còn 242
```
