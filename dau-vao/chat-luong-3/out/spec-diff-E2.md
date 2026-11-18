<!-- spec-diff -->
## Kiểm chéo danh mục (spec-diff): git:7d632e30 ↔ .

- Bản ghi: 59.222 → 35.588; **6024** đổi, 23671 mất, 37 thêm, ở 1107 bảng của 109 NCC
- Đảo vai động cơ ↔ đầu phát (mã mà ≥ 3 NCC khác đọc ở vai kia): 3 → **1** ✅
- Tự kiểm số với công suất của dòng: 0 giá trị đổi / thêm không tự xác nhận được (soát tay)
- Thay đổi là chủ ý thì không chặn; vẫn phải soát MỌI dạng và đo top 30 ứng viên bằng tay (bộ nhớ kiem-cheo-toan-bo). Bản đầy đủ: artifact `spec-diff` của lượt chạy.

### Theo NCC

| NCC | dòng đổi | đổi | mất | thêm |
|---|--:|--:|--:|--:|
| uleengen | 1912 | 833 | 1079 | 0 |
| mecca-power | 1643 | 0 | 1643 | 0 |
| landtop-fuzhou | 1443 | 705 | 738 | 0 |
| wintpower | 1008 | 250 | 758 | 0 |
| jet-power | 938 | 469 | 469 | 0 |
| kachai-hangzhou | 833 | 408 | 425 | 0 |
| acepow-fuan | 830 | 349 | 481 | 0 |
| walter-yangzhou | 782 | 0 | 781 | 1 |
| yanan-power | 760 | 0 | 760 | 0 |
| long-gen | 741 | 367 | 374 | 0 |
| minsun-motor | 716 | 358 | 358 | 0 |
| waeta-fujian | 707 | 0 | 707 | 0 |
| legapower | 635 | 0 | 634 | 1 |
| aosif | 621 | 0 | 621 | 0 |
| sr-genset | 605 | 240 | 365 | 0 |
| welland-power | 594 | 297 | 297 | 0 |
| excel-power-ningde | 571 | 13 | 558 | 0 |
| victory-generator | 544 | 0 | 544 | 0 |
| rise-power | 527 | 124 | 403 | 0 |
| zhengchi-power | 525 | 3 | 522 | 0 |
| ettes-power | 458 | 0 | 458 | 0 |
| bobig-power | 429 | 214 | 215 | 0 |
| weiman-fujian | 416 | 20 | 396 | 0 |
| sanq-power | 413 | 180 | 208 | 25 |
| suneco-linyi | 397 | 197 | 200 | 0 |
| yunding-jiangsu | 393 | 0 | 393 | 0 |
| koten-power | 385 | 0 | 385 | 0 |
| fdk-energy | 375 | 187 | 188 | 0 |
| westinpower | 371 | 24 | 347 | 0 |
| app-power-anpu | 348 | 0 | 348 | 0 |
| starlight-power | 348 | 0 | 348 | 0 |
| baifa-power | 339 | 115 | 224 | 0 |
| cgm-italia | 338 | 0 | 338 | 0 |
| gordon-power | 325 | 0 | 325 | 0 |
| kaihua-genset | 325 | 0 | 325 | 0 |
| xinhengxin-fujian | 322 | 0 | 322 | 0 |
| hichai-power | 307 | 36 | 271 | 0 |
| kaichen-jiangsu | 285 | 0 | 285 | 0 |
| stone-power | 271 | 105 | 166 | 0 |
| haifeng-taizhou | 267 | 0 | 267 | 0 |
| … 69 NCC nữa | 5685 | | | |

### Dạng thay đổi (vài ví dụ mỗi dạng)

**MẤT bản ghi**: 23671 lượt, 109 NCC
```
acepow-fuan n104 b7 dòng 0 WP2.3D25E200: engine WP2.3D25E200
    | APW-18 | 18 | 20 | BC184E | WP2.3D25E200 | 23 | 29 | 4#7.5-104 | T2 | Mechanically
agestar n104 b4 dòng 0 4B3.9-G 1: engine 4B3.9-G 1
    | GC-30(S) | 30 | 24 | 27 | 22 | 4B3.9-G 1 | 6.5 | Mechanical | 3.9 | ASG184G | 2150*1000*1250 | 1000
aj-power n102 b1 dòng 15 MA2114F: engine MA2114F
    | AJ88 | 50hz | Three Phase | 1500 | 80.0 | 88.0 | | SP344CC | MA2114F | AJ88 Hyundai 50Hz
```
**other**: 6024 lượt, 36 NCC
```
acepow-fuan n104 b7 dòng 0 BC184E: WP2.3D25E200 → null
    | APW-18 | 18 | 20 | BC184E | WP2.3D25E200 | 23 | 29 | 4#7.5-104 | T2 | Mechanically
agestar n104 b4 dòng 0 ASG184G: 4B3.9-G 1 → null
    | GC-30(S) | 30 | 24 | 27 | 22 | 4B3.9-G 1 | 6.5 | Mechanical | 3.9 | ASG184G | 2150*1000*1250 | 1000
baifa-power n101 b0 dòng 0 S1L2-J: 1103D-33G2 → null
    | BF-P35-T3 | 35 | 32 | PERKINS | 1103D-33G2 | | S1L2-J | STAGE 3A | UK
```
**THÊM bản ghi**: 37 lượt, 4 NCC
```
legapower n2002 b26 dòng 0 SC9D340D2: engine SC9D340D2
    | LG275SC | 275 | 250 | 54.1 | SC9D340D2 | 6L | Electronic | 8.9 |
sanq-power n120 b24 dòng 0 WD129D11: engine WD129D11
    | SQWD138 | 125/138 | 100/110 | 180 | WD129D11 | LTG-100 | 6 | 12.9 | 213 | 1800 | 2650×900×1400
simpson-power n126 b17 dòng 1 F3L912: engine F3L912
    | SP0017D-D | 17/21 | F3L912 | 1200×700×1350 | SP0017D-D.pdf
```

### Đảo vai

| NCC vai ← vai kia | cũ | mới |
|---|--:|--:|
| depco-power engine←alternator | 1 | 1 |
| vantek-jiangsu alternator←engine | 2 | 0 |
