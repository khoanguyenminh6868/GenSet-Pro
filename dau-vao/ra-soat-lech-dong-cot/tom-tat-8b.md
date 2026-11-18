<!-- spec-diff -->
## Kiểm chéo danh mục (spec-diff): git:origin/main ↔ .

- Bản ghi: 59.222 → 59.237; **65** đổi, 3 mất, 18 thêm, ở 7 bảng của 5 NCC
- Đảo vai động cơ ↔ đầu phát (mã mà ≥ 3 NCC khác đọc ở vai kia): 3 → **1** ✅
- Tự kiểm số với công suất của dòng: 29 giá trị đổi / thêm không tự xác nhận được (soát tay)
- Thay đổi là chủ ý thì không chặn; vẫn phải soát MỌI dạng và đo top 30 ứng viên bằng tay (bộ nhớ kiem-cheo-toan-bo). Bản đầy đủ: artifact `spec-diff` của lượt chạy.

### Theo NCC

| NCC | dòng đổi | đổi | mất | thêm |
|---|--:|--:|--:|--:|
| acepow-fuan | 36 | 18 | 0 | 18 |
| sr-genset | 29 | 29 | 0 | 0 |
| mecca-power | 16 | 15 | 1 | 0 |
| vantek-jiangsu | 4 | 2 | 2 | 0 |
| hosem-power | 1 | 1 | 0 | 0 |

### Dạng thay đổi (vài ví dụ mỗi dạng)

**voltage bỏ**: 29 lượt, 1 NCC
```
sr-genset n2001 b0 dòng 11 4FWZL1: 104.5 → ∅
    | 50 | 400 | 95 | 118.75 | 104.5 | 130.625 | SRGENSET | 4FWZL1 | SRGENSET | SAL274C2 | PDF
sr-genset n2001 b0 dòng 11 SAL274C2: 104.5 → ∅
    | 50 | 400 | 95 | 118.75 | 104.5 | 130.625 | SRGENSET | 4FWZL1 | SRGENSET | SAL274C2 | PDF
sr-genset n2004 b6 dòng 14 1106A-70TG1: 119 → ∅
    | 50 | 400 | 108 | 135 | 119 | 149 | Perkins | 1106A-70TG1 | Nidec | TAL-A44-H
```
**other**: 20 lượt, 2 NCC
```
acepow-fuan n155 b64 dòng 0 Y480BD: null → BC164C
    | APW-10.5 | 3 | 50 | 10.5 | 12 | 13 | 14 | BC164C | 10.8 | 12 | Y480BD
vantek-jiangsu n101 b0 dòng 11 3S0: N855-DM → null
    | CCFJ280J-WTP | 280 | 3S0 | N855-DM | 317 | 6 | 2998-1000-1790 | 2950
acepow-fuan n155 b64 dòng 1 Y480BD: null → BC164D
    | APW-12 | 3 | 50 | 12 | 13 | 15 | 17 | BC164D | 12.8 | 14 | Y480BD
```
**THÊM bản ghi**: 18 lượt, 1 NCC
```
acepow-fuan n155 b64 dòng 0 BC164C: alternator BC164C
    | APW-10.5 | 3 | 50 | 10.5 | 12 | 13 | 14 | BC164C | 10.8 | 12 | Y480BD
acepow-fuan n155 b64 dòng 1 BC164D: alternator BC164D
    | APW-12 | 3 | 50 | 12 | 13 | 15 | 17 | BC164D | 12.8 | 14 | Y480BD
acepow-fuan n155 b64 dòng 2 BC164E: alternator BC164E
    | APW-15 | 3 | 50 | 15 | 17 | 19 | 21 | BC164E | 15 | 17 | Y485BD
```
**power**: 16 lượt, 2 NCC
```
hosem-power n136 b34 dòng L QSZ13-G3: P 500/· S ·/22 → ∅
    (bảng nhãn)
mecca-power n5001 b41 dòng 11 TCD12.1: P 325/260 S 1000/800 → P 375/300 S 413/330
    | MC1000D | 260 | 325 | 800 | 1000 | TCD12.1 |
mecca-power n5001 b41 dòng 12 TCD12.1: P 375/300 S 413/330 → P 450/360 S 495/396
    | MC413D | 300 | 375 | 330 | 413 | TCD12.1 |
```
**genset**: 15 lượt, 1 NCC
```
mecca-power n5001 b41 dòng 11 TCD12.1: MC1000D → MC413D
    | MC1000D | 260 | 325 | 800 | 1000 | TCD12.1 |
mecca-power n5001 b41 dòng 12 TCD12.1: MC413D → MC495D
    | MC413D | 300 | 375 | 330 | 413 | TCD12.1 |
mecca-power n5001 b41 dòng 13 TCD13.0: MC495D → MC550D
    | MC495D | 360 | 450 | 396 | 495 | TCD13.0 |
```
**model**: 8 lượt, 2 NCC
```
mecca-power n5001 b41 dòng 12 TCD12.1: TCD12.1 → TCD13.0
    | MC413D | 300 | 375 | 330 | 413 | TCD12.1 |
vantek-jiangsu n101 b0 dòng 11 3S0: 3S0 → N855-DM
    | CCFJ280J-WTP | 280 | 3S0 | N855-DM | 317 | 6 | 2998-1000-1790 | 2950
mecca-power n5001 b41 dòng 14 TCD13.0: TCD13.0 → BF6M1015-LA
    | MC550D | 400 | 500 | 440 | 550 | TCD13.0 |
```
**MẤT bản ghi**: 3 lượt, 2 NCC
```
mecca-power n5001 b41 dòng 26 BF8M1015CP-LA: engine BF8M1015CP-LA
    | MC619D | 450 | 563 | 495 | 619 | BF8M1015CP-LA |
vantek-jiangsu n101 b0 dòng 11 N855-DM: alternator N855-DM
    | CCFJ280J-WTP | 280 | 3S0 | N855-DM | 317 | 6 | 2998-1000-1790 | 2950
vantek-jiangsu n101 b1 dòng 7 NTA855-DM: alternator NTA855-DM
    | CCFJ250Y-WTP | 250 | 312.S | NTA855-DM | 284 | 6 | 3020-1100-1750 | 2850
```

### Đảo vai

| NCC vai ← vai kia | cũ | mới |
|---|--:|--:|
| depco-power engine←alternator | 1 | 1 |
| vantek-jiangsu alternator←engine | 2 | 0 |

### Không tự xác nhận được

| dạng | số |
|---|--:|
| voltage bỏ: mới không kiểm được | 29 |

```
sr-genset n2001 b0 dòng 11 voltage: 104.5 → ∅ | {"rated":{"kW":95,"kVA":118.75},"standby":{"kW":104.5,"kVA":130.625}}
sr-genset n2001 b0 dòng 11 voltage: 104.5 → ∅ | {"rated":{"kW":95,"kVA":118.75},"standby":{"kW":104.5,"kVA":130.625}}
sr-genset n2004 b6 dòng 14 voltage: 119 → ∅ | {"rated":{"kW":108,"kVA":135},"standby":{"kW":119,"kVA":149}}
sr-genset n2004 b6 dòng 14 voltage: 119 → ∅ | {"rated":{"kW":108,"kVA":135},"standby":{"kW":119,"kVA":149}}
sr-genset n2004 b6 dòng 15 voltage: 119 → ∅ | {"rated":{"kW":108,"kVA":135},"standby":{"kW":119,"kVA":149}}
sr-genset n2004 b6 dòng 16 voltage: 144 → ∅ | {"rated":{"kW":120,"kVA":150},"standby":{"kW":144,"kVA":165}}
sr-genset n2004 b6 dòng 16 voltage: 144 → ∅ | {"rated":{"kW":120,"kVA":150},"standby":{"kW":144,"kVA":165}}
sr-genset n2004 b6 dòng 17 voltage: 144 → ∅ | {"rated":{"kW":120,"kVA":150},"standby":{"kW":144,"kVA":165}}
sr-genset n2004 b6 dòng 18 voltage: 176 → ∅ | {"rated":{"kW":160,"kVA":200},"standby":{"kW":176,"kVA":220}}
sr-genset n2004 b6 dòng 18 voltage: 176 → ∅ | {"rated":{"kW":160,"kVA":200},"standby":{"kW":176,"kVA":220}}
sr-genset n2004 b6 dòng 19 voltage: 176 → ∅ | {"rated":{"kW":160,"kVA":200},"standby":{"kW":176,"kVA":220}}
sr-genset n2004 b6 dòng 20 voltage: 220 → ∅ | {"rated":{"kW":200,"kVA":250},"standby":{"kW":220,"kVA":275}}
… còn 17
```
