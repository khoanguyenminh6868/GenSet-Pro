<!-- spec-diff -->
## Kiểm chéo danh mục (spec-diff): git:d8db6166 ↔ .

- Bản ghi: 59.064 → 59.791; **123** đổi, 79 mất, 806 thêm, ở 86 bảng của 16 NCC
- Đảo vai động cơ ↔ đầu phát (mã mà ≥ 3 NCC khác đọc ở vai kia): 0 → **0** ✅
- Tự kiểm số với công suất của dòng: 25 giá trị đổi / thêm không tự xác nhận được (soát tay)
- Chưa đọc được (`node suppliers/unread-tables.mjs`, để thiếu thay vì đoán): bảng không cho bản ghi nào: 3.191 → 3.112; dòng điện / điện áp theo vị trí không khớp công suất: 230 → 230; dòng là cặp nhãn | giá trị: 164 → 164; số vô lý so với công suất: 139 → 139; dòng tổng quan dòng máy: một dải công suất, không là một tổ máy: 90 → 90; số bằng đúng công suất của dòng, không là khối lượng / độ ồn: 77 → 77; mã đầu phát trùng model tổ máy: 37 → 37; cặp a/b dưới nhãn không ghi mức / đơn vị: 34 → 34; tổ máy nhiều động cơ: 6 → 6; điện áp trùng công suất của dòng: 6 → 6; dòng điện tổ máy không khớp công suất: 5 → 5; trang có hai động cơ: số liệu kích cỡ động cơ không rõ của động cơ nào: 2 → 2; số có dấu phẩy nghìn / thập phân không rõ: 2 → 2; một ô ghi hai mã: 1 → 1; ô dòng điện không đọc được thành số: 1 → 1
- Thay đổi là chủ ý thì không chặn; vẫn phải soát MỌI dạng và đo top 30 ứng viên bằng tay (bộ nhớ kiem-cheo-toan-bo). Bản đầy đủ: artifact `spec-diff` của lượt chạy.

### Theo NCC

| NCC | dòng đổi | đổi | mất | thêm |
|---|--:|--:|--:|--:|
| simpson-power | 270 | 21 | 79 | 170 |
| jinjia-power | 262 | 0 | 0 | 262 |
| rcg-power | 106 | 0 | 0 | 106 |
| kaihua-genset | 69 | 0 | 0 | 69 |
| agg-fuzhou | 64 | 0 | 0 | 64 |
| aj-power | 54 | 27 | 0 | 27 |
| cgm-italia | 32 | 32 | 0 | 0 |
| mpmc-powertech | 32 | 0 | 0 | 32 |
| voltgent | 31 | 0 | 0 | 31 |
| baifa-power | 24 | 18 | 0 | 6 |
| tecnogen | 22 | 22 | 0 | 0 |
| green-power-generators | 14 | 0 | 0 | 14 |
| huadong-yangzhou | 9 | 0 | 0 | 9 |
| agg-power | 8 | 0 | 0 | 8 |
| rise-power | 6 | 3 | 0 | 3 |
| visa-gensets | 5 | 0 | 0 | 5 |

### Dạng thay đổi (vài ví dụ mỗi dạng)

**THÊM bản ghi**: 806 lượt, 14 NCC
```
agg-fuzhou n102 b1 dòng 63 DC09 072A 02-12: engine DC09 072A 02-12
    | S313E5 | 313/250 | 275/220 | DC09 072A 02-12 | Scania
agg-power n2048 b47 dòng 2 DC16 072A 02-13: engine DC16 072A 02-13
    700/560
aj-power n103 b2 dòng 0 MA4114D S4L1D-C: alternator MA4114D S4L1D-C
    | AJ280 | 50hz | Three Phase | 1500 | 250.0 | 280.0 | | DC9 072A 02-11 | MA4114D S4L1D-C | AJ280 Scania Three Phase Scania 50Hz
```
**model**: 84 lượt, 4 NCC
```
aj-power n103 b2 dòng 0 MA4114D S4L1D-C: MA4114D S4L1D-C → DC9 072A 02-11
    | AJ280 | 50hz | Three Phase | 1500 | 250.0 | 280.0 | | DC9 072A 02-11 | MA4114D S4L1D-C | AJ280 Scania Three Phase Scania 50Hz
baifa-power n104 b6 dòng 24 4 months: 4 months → DC13 320A 02-61
    | BF-SC385-V | 385 | 350 | SCANIA | DC13 320A 02-61 | ECU | S4L1D-E41 | 46.4 | STAGE V | SWEDEN | 4 months | ●
cgm-italia n101 b5 dòng 0 B300: B300 → DC09 072A 02 11
    | 250S | | 250 | 200 | 275 | 220 | DC09 072A 02 11 | E | 0 | 5 | 294.9/220 | 38 | 250 | B300 | 2470 | 2800x1310x1800 | C300 | 3130 | 3700x1435x2250 | 69 | QM250 | QA250
```
**MẤT bản ghi**: 79 lượt, 1 NCC
```
simpson-power n112 b7 dòng 0 S12R-PTA2-C: engine S12R-PTA2-C
    | SP1200D-L | 1200/1500 | S12R-PTA2-C | 4715×2136×2758 | SP1200D-L.pdf
simpson-power n112 b7 dòng 1 S12R-PTAA2-C: engine S12R-PTAA2-C
    | SP1320D-L | 1320/1650 | S12R-PTAA2-C | 5219×2192×3056 | SP1320D-L.pdf
simpson-power n112 b7 dòng 2 S16R-PTA-C: engine S16R-PTA-C
    | SP1500D-L | 1500/1875 | S16R-PTA-C | 5476×2289×3056 | SP1500D-L.pdf
```
**other**: 42 lượt, 3 NCC
```
aj-power n103 b2 dòng 0 MA4114D S4L1D-C: null → MA4114D S4L1D-C
    | AJ280 | 50hz | Three Phase | 1500 | 250.0 | 280.0 | | DC9 072A 02-11 | MA4114D S4L1D-C | AJ280 Scania Three Phase Scania 50Hz
baifa-power n104 b6 dòng 24 S4L1D-E41: 4 months → DC13 320A 02-61
    | BF-SC385-V | 385 | 350 | SCANIA | DC13 320A 02-61 | ECU | S4L1D-E41 | 46.4 | STAGE V | SWEDEN | 4 months | ●
rise-power n119 b24 dòng 0 MP-200-4: null → DC9 65A 10-93
    | RSCM200 | DC9 65A 10-93 | MP-200-4 | 50 | 200 | 253 | 220 | 278
```
**cyl bỏ**: 22 lượt, 1 NCC
```
tecnogen n2004 b3 dòng 0 AUS7310: 5 → ∅
    | SA275TSX | 275 | 250 | 308 | 280 | DC09 072A 02 11 | E | 5 | 9300 | 220 | 241 | 34,0 | 39,7 | T | AUS7310 | ACP 7320 | 68 | 600 | 390 | 120 | 223 | 3690
tecnogen n2004 b3 dòng 1 AUS7310: 5 → ∅
    | SA300TSX | 300 | 275 | 335 | 305 | DC09 072A 02 12 | E | 5 | 9300 | 242 | 263 | 37,0 | 43,0 | T | AUS7310 | ACP 7320 | 68 | 600 | 390 | 120 | 223 | 3760
tecnogen n2004 b3 dòng 2 AUS7310: 5 → ∅
    | SA330TSX | 330 | 300 | 360 | 325 | DC09 072A 02 13 | E | 5 | 9300 | 261 | 282 | 40,4 | 45,9 | T | AUS7310 | ACP 7320 | 68 | 600 | 390 | 120 | 223 | 3760
```
**weight thêm**: 22 lượt, 1 NCC
```
tecnogen n2004 b3 dòng 0 AUS7310: ∅ → 3690
    | SA275TSX | 275 | 250 | 308 | 280 | DC09 072A 02 11 | E | 5 | 9300 | 220 | 241 | 34,0 | 39,7 | T | AUS7310 | ACP 7320 | 68 | 600 | 390 | 120 | 223 | 3690
tecnogen n2004 b3 dòng 1 AUS7310: ∅ → 3760
    | SA300TSX | 300 | 275 | 335 | 305 | DC09 072A 02 12 | E | 5 | 9300 | 242 | 263 | 37,0 | 43,0 | T | AUS7310 | ACP 7320 | 68 | 600 | 390 | 120 | 223 | 3760
tecnogen n2004 b3 dòng 2 AUS7310: ∅ → 3760
    | SA330TSX | 330 | 300 | 360 | 325 | DC09 072A 02 13 | E | 5 | 9300 | 261 | 282 | 40,4 | 45,9 | T | AUS7310 | ACP 7320 | 68 | 600 | 390 | 120 | 223 | 3760
```
**dims thêm**: 18 lượt, 1 NCC
```
simpson-power n102 b1 dòng 0 16V4000G23: ∅ → 7330×2150×2836
    | SP1800D-U | 1800/2250 | MTU | 16V4000G23 | 7330×2150×2836 | SP1800D-U.pdf
simpson-power n102 b1 dòng 1 16V4000G63: ∅ → 7330×2150×2836
    | SP2000D-U | 2000/2500 | 16V4000G63 | 7330×2150×2836 | SP2000D-U.pdf
simpson-power n102 b1 dòng 2 20V4000G23: ∅ → 7600×2760×2950
    | SP2200D-U | 2200/2750 | 20V4000G23 | 7600×2760×2950 | SP2200D-U.pdf
```
**makes**: 4 lượt, 1 NCC
```
simpson-power n102 b1 dòng 8 4016-61TRG3: Mitsubishi → Mitsubishi,Perkins
    | SP2000D-P | 2000/2500 | 4016-61TRG3 | 6140×2300×3020 | SP2000D-P.pdf
simpson-power n113 b8 dòng 35 QSZ13-G2:  → Cummins
    | SP0330D-C | 330/413 | QSZ13-G2 | 3410×1230×1920 | SP0330D-C.pdf
simpson-power n113 b8 dòng 36 QSZ13-G2:  → Cummins
    | SP0400D-C | 400/500 | QSZ13-G2 | 3410×1230×1920 | SP0400D-C.pdf
```
**phase bỏ**: 3 lượt, 1 NCC
```
aj-power n103 b2 dòng 20 S4L1D-G: Three Phase → ∅
    | AJ615 | 60hz | Three Phase | 1800 | 550.0 | 606.3 | | DC16 093A 02-52 | S4L1D-G | AJ615 Three Phase Scania 60Hz
aj-power n103 b2 dòng 22 HCI544D: Three Phase → ∅
    | AJ670 | 60hz | Three Phase | 1800 | 608.8 | 671.3 | | DC16 093A 02-53 | HCI544D | AJ670 Three Phase Scania 60Hz
aj-power n103 b2 dòng 24 HCI544E: Three Phase → ∅
    | AJ710 | 60hz | Three Phase | 1800 | 661.3 | 730.0 | | DC16 093A 02-54 | HCI544E | AJ710 Three Phase Scania 60hz
```

### Không tự xác nhận được

| dạng | số |
|---|--:|
| cyl bỏ: mới không kiểm được | 22 |
| phase bỏ: mới không kiểm được | 3 |

```
aj-power n103 b2 dòng 20 phase: Three Phase → ∅ | {"prime":{"kVA":550},"standby":{"kVA":606.3}}
aj-power n103 b2 dòng 22 phase: Three Phase → ∅ | {"prime":{"kVA":608.8},"standby":{"kVA":671.3}}
aj-power n103 b2 dòng 24 phase: Three Phase → ∅ | {"prime":{"kVA":661.3},"standby":{"kVA":730}}
tecnogen n2004 b3 dòng 0 cyl: 5 → ∅ | {"standby":{"kVA":275},"prime":{"kVA":250}}
tecnogen n2004 b3 dòng 1 cyl: 5 → ∅ | {"standby":{"kVA":300},"prime":{"kVA":275}}
tecnogen n2004 b3 dòng 2 cyl: 5 → ∅ | {"standby":{"kVA":330},"prime":{"kVA":300}}
tecnogen n2004 b3 dòng 3 cyl: 5 → ∅ | {"standby":{"kVA":358},"prime":{"kVA":325}}
tecnogen n2004 b3 dòng 4 cyl: 6 → ∅ | {"standby":{"kVA":400},"prime":{"kVA":365}}
tecnogen n2004 b3 dòng 5 cyl: 6 → ∅ | {"standby":{"kVA":450},"prime":{"kVA":410}}
tecnogen n2004 b3 dòng 6 cyl: 6 → ∅ | {"standby":{"kVA":500},"prime":{"kVA":455}}
tecnogen n2004 b3 dòng 7 cyl: 6 → ∅ | {"standby":{"kVA":550},"prime":{"kVA":500}}
tecnogen n2004 b3 dòng 8 cyl: 8V → ∅ | {"standby":{"kVA":600},"prime":{"kVA":550}}
… còn 13
```
