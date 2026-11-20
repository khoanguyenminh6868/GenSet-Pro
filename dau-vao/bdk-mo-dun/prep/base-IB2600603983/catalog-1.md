# Danh mục trong hệ thống (tổ máy 700 kVA, từ 100% đến 120%), 50 Hz — code đã xếp sẵn

Thứ tự ưu tiên khi xếp: model động cơ / hãng động cơ HSMT nêu, bộ điều khiển HSMT nêu, động cơ có nhiều thông số có nguồn, rồi mới tới đầu phát; công suất càng sát càng tốt.

## Ứng viên (30 dòng tổ máy, tốt nhất trước)

### 1. XG-560GF — động cơ TWD1645GE (hãng Volvo Penta, theo dòng bảng), đầu phát LSA49.3 M6
- supplierId: dingbo, n: 108, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | XG-560GF | 560/700 | 616/770 | TWD1645GE | LSA49.3 M6 | 3460x1400x2100 | 3600
  thông số trong dòng: Dimension (mm) = 3460x1400x2100 ; Weight (kg) = 3600
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): Deep Sea (không ghi model), HGM6110
  lý do xếp: NCC có hồ sơ bộ điều khiển Deep Sea, SmartGen HGM6110; bộ điều khiển có datasheet hãng

### 2. (không ghi model tổ máy) — động cơ 4006-23TAG2A (hãng Perkins, theo dòng bảng), đầu phát LVI634B (Stamford)
- supplierId: gb-power, n: 1027, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  bảng một model: Standard Features ; | MODEL | GB-P700 ; | Standby Power(50Hz) | 616KW/770KVA ; | Prime Power(50Hz) | 560KW/700KVA ; | Engine | PERKINS 4006-23TAG2A ; | Alternator | STAMFORD LVI634B ; | Generator | Set ; | Voltage | Frequency ; | Phase | P.F ; | Standby | Standby ; | (COS￠) | Amps ; Prime Power(PRP):Prime power is available for an unlimited number of annual hours in ; | Dimension | Of ; | Dimension(L*W*H)/CM For Open Type | 460×180×225A CM ; | Net Weight/KG For Open Type | 5900KGS ; | Dimension(L*W*H)/CM For Sound Proof | Type | 606×244×260 CM ; | Net Weight/KG For Sound Proof Type | 7300KGS ; Dimension (L*W*H)/MM For Trailer Type ; | Engine Model | 4006-23TAG2A ; | Manufacturer | PERKINS UK ; | Emissions statement | EU2007(EU97/68/EC Stage Ⅱ ) ; | Prime Power | 620KW/831HP ; | Standby Power | 685KW/918HP ; | Engine Configuration | 6Cylinder In Line, 4Stroke,Direct Injection ; | Gas Feeding Model | Turbocharged Air-Air after cooled ; | Engine | Bore×Stroke | 160×190(MM) ; | Displacement | 22.92L ; | Rated Speed | 1500RPM ; | Speed Governor | Electrical ; | Starter Model | 24V DC Start ; | Prime | 157L/H ; | Cooling System | Water Cool ; | Compression Ratio | 13.6:1 ; | Copyright By GB POWER | 2/4 ; | Alternator Model | LVI634B ; | Manufacturer | STAMFORD company ; | Prime Output | 600KW/750KVA ; | Standby Output | 660KW/825KVA ; | Excitation Model | Brushless, Self-Exciting ; | Cooling Method | Air Cooling ; | Power Factor | 0.8 ; | Protection Class | IP22 ; | Insulation Class | H ; | Voltage Regulation, | ≤±1% ; | Alternator | Influence Factor ; | Frequency Reduce | 0-5% adjustable ; | Frequency Regulation, | ≤1.5% ; | Frequency Waving | ≤0.8% ; | Sudden Frequency Warp | ≤+12% ; | Sudden Frequency Warp | ≤-10% ; | Frequency Recovery Time | ≤5S ; | GB POWER | 3/4 ; | DEEPSEA6020 CONTROL MODEL/ | MANUAL ; | Copyright By GB POWER | 4/4
  thông số trong dòng: Dimension(L*W*H)/CM For Open Type = 460×180×225A CM ; Net Weight/KG For Open Type = 5900KGS ; Emissions statement = EU2007(EU97/68/EC Stage Ⅱ ) ; Displacement = 22.92L ; Speed Governor = Electrical ; Cooling System = Water Cool ; Compression Ratio = 13.6:1 ; Power Factor = 0.8 ; Protection Class = IP22 ; Insulation Class = H ; Voltage Regulation, = ≤±1% ; Frequency Regulation, = ≤1.5%
  bộ điều khiển trong dòng: DSE6020
  lý do xếp: dòng ghi bộ điều khiển Deep Sea DSE6020; bộ điều khiển có datasheet hãng

### 3. CG825E/H1 — động cơ QSK23-G2 (hãng Cummins, theo dòng bảng), đầu phát S5L1D-H41 (Stamford)
- supplierId: fdk-energy, n: 103, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | CG825E/H1 CONTACT | 825KVA/ 660KW | 750KVA/ 600KW | QSK23-G2 | Cummins (India) | Stamford S5L1D-H41 | Click Here | Download
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): InteliGen, DSE3110, DSE7320, DSE8610, HGM6110N, HGM6110NC, HGM6120CAN, HGM9510
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp InteliGen, Deep Sea DSE3110, Deep Sea DSE7320; bộ điều khiển có datasheet hãng

### 4. UP750GF — động cơ 4006-23TAG2A (hãng Perkins, theo dòng bảng), đầu phát S5L1D-H41 (Stamford)
- supplierId: uleengen, n: 103, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | UP750GF | 600 | 750 | 4006-23TAG2A | Perkins | 628 | 6.L | 160×190 | 22.9 | 140 | S5L1D-H41 | 4450x1750x2350 | 4706
  thông số trong dòng: Overall Size(mm) = 4450x1750x2350 ; Gross Weight(kg) = 4706
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): ComAp (không ghi model), DSE6020, DSE6120, DSE7320, DSE7420, DSE8610, DEIF (không ghi model), Harsen (không ghi model), HGM6110, HGM6120, HGM9510
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp, Deep Sea DSE6020, Deep Sea DSE6120; bộ điều khiển có datasheet hãng

### 5. M825/H1 — động cơ S6R2-PTAA-C (hãng Mitsubishi, theo dòng bảng), đầu phát S5L1D-H41 (Stamford)
- supplierId: fdk-energy, n: 103, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | M825/H1 CONTACT | 825KVA/ 660KW | 750KVA/ 600KW | S6R2-PTAA-C | Mitsubishi (SME Shanghai) | Stamford S5L1D-H41 | Click Here | Download
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): InteliGen, DSE3110, DSE7320, DSE8610, HGM6110N, HGM6110NC, HGM6120CAN, HGM9510
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp InteliGen, Deep Sea DSE3110, Deep Sea DSE7320; bộ điều khiển có datasheet hãng

### 6. P825/H1 — động cơ 4006-23TAG3A (hãng Perkins, theo dòng bảng), đầu phát S5L1D-H4 (Stamford)
- supplierId: fdk-energy, n: 103, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | P825/H1 CONTACT | 825KVA/ 660KW | 750KVA/ 600KW | 4006-23TAG3A | Perkins China | Stamford S5L1D-H4 | Click Here | Download
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): InteliGen, DSE3110, DSE7320, DSE8610, HGM6110N, HGM6110NC, HGM6120CAN, HGM9510
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp InteliGen, Deep Sea DSE3110, Deep Sea DSE7320; bộ điều khiển có datasheet hãng

### 7. KP750D5 — động cơ 4006-23TAG2A (hãng Perkins, theo dòng bảng), đầu phát LVI634B (Stamford)
- supplierId: koten-power, n: 4014, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | KP750D5 | 600 | 750 | 660 | 825 | 4006-23TAG2A | LVI634B
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): ComAp (không ghi model), Deep Sea (không ghi model), HGM6110N, HGM6120N
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp, Deep Sea, SmartGen HGM6110N; bộ điều khiển có datasheet hãng

### 8. UP800GF — động cơ 4006-23TAG3A (hãng Perkins, theo dòng bảng), đầu phát S6L1D-C41 (Stamford)
- supplierId: uleengen, n: 103, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | UP800GF | 640 | 800 | 4006-23TAG3A | Perkins | 675 | 6.L | 160×190 | 22.9 | 150 | S6L1D-C41 | 4450x1750x2350 | 4706
  thông số trong dòng: Overall Size(mm) = 4450x1750x2350 ; Gross Weight(kg) = 4706
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): ComAp (không ghi model), DSE6020, DSE6120, DSE7320, DSE7420, DSE8610, DEIF (không ghi model), Harsen (không ghi model), HGM6110, HGM6120, HGM9510
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp, Deep Sea DSE6020, Deep Sea DSE6120; bộ điều khiển có datasheet hãng

### 9. M825N/H1 — động cơ S6R2-PTAA (hãng Mitsubishi, theo dòng bảng), đầu phát S5L1D-H41 (Stamford)
- supplierId: fdk-energy, n: 103, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | M825N/H1 CONTACT | 825KVA/ 660KW | 750KVA/ 600KW | S6R2-PTAA | Mitsubishi (SME Shanghai) | Stamford S5L1D-H41 | Click Here |
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): InteliGen, DSE3110, DSE7320, DSE8610, HGM6110N, HGM6110NC, HGM6120CAN, HGM9510
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp InteliGen, Deep Sea DSE3110, Deep Sea DSE7320; bộ điều khiển có datasheet hãng

### 10. P900-1 — động cơ 4006-23TAG3A (hãng Perkins, theo dòng bảng), đầu phát FGL70030 (FG Wilson)
- supplierId: voltgent, n: 101, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | P900-1 | 800 | 640 | 900 | 720 | 4006-23TAG3A | FGL70030 | DSE7420
  thông số trong dòng: Control Panel = DSE7420
  bộ điều khiển trong dòng: DSE7420
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): ComAp (không ghi model), DSE6120, DSE7410, DSE7420
  lý do xếp: dòng ghi bộ điều khiển Deep Sea DSE7420; bộ điều khiển có datasheet hãng

### 11. SM750E5 — động cơ S6R2-PTAA (hãng Mitsubishi, theo dòng bảng), đầu phát MX-600-4 (Marathon)
- supplierId: stone-power, n: 102, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | SM750E5 | 660 | 600 | 825 | 750 | S6R2-PTAA | LVI 634B | MX-600-4 | WHI 6B
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): ComAp (không ghi model), DSE6020, DSE7320, Harsen (không ghi model), HGM6110
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp, Deep Sea DSE6020, Deep Sea DSE7320; bộ điều khiển có datasheet hãng

### 12. P780-1 — động cơ 2806A-E18TTAG4 (hãng Perkins, theo dòng bảng), đầu phát LL7224J (Leroy-Somer)
- supplierId: voltgent, n: 101, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | P780-1 | 706 | 564.8 | 780 | 624 | 2806A-E18TTAG4 | LL7224J | FG100
  thông số trong dòng: Control Panel = FG100
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): ComAp (không ghi model), DSE6120, DSE7410, DSE7420
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp, Deep Sea DSE6120, Deep Sea DSE7410; bộ điều khiển có datasheet hãng

### 13. LG600BD — động cơ 6M33G825/5 (hãng Baudouin, theo dòng bảng), đầu phát LSA49.3 M65 (Leroy-Somer)
- supplierId: longkai-power, n: 108, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | LG600BD | 660 | 825 | 600 | 750 | 6M33G825/5 | LK634B | LSA49.3 M65 | OP3800*1600*2200 | AT5680*2100*2500 |
  thông số trong dòng: DIMENSION = OP3800*1600*2200
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): DSE6120
  lý do xếp: NCC có hồ sơ bộ điều khiển Deep Sea DSE6120; bộ điều khiển có datasheet hãng

### 14. HC-BD760 — động cơ 6M33G750/5 (hãng Baudouin, theo dòng bảng), đầu phát S5L1D-G4 (Stamford)
- supplierId: kaihua-genset, n: 119, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | HC-BD760 | 760 | 700 | 6M33G750/5 | S5L1D-G4 | 3650*1638*2050 | 5530*1860*2550 | Download
  thông số trong dòng: Dimension mm Open Type = 3650*1638*2050
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): InteliGen, DSE6020, DSE6120, DSE6120 MKII, DSE7320, DSE8610, HGM6120UC, HGM7120UC, HGM9510
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp InteliGen, Deep Sea DSE6020, Deep Sea DSE6120; bộ điều khiển có datasheet hãng

### 15. WT-MEZ770 — động cơ S6R2-PTAA-C (hãng Mitsubishi, theo dòng bảng), đầu phát không ghi
- supplierId: wintpower, n: 102, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | WT-MEZ770 | 770/616 | 700/560 | 163 | S6R2-PTAA-C | 6L | 29.96 | 24 | 710 | Elec. | 3870*1675*2134 | 5021
  thông số trong dòng: cyl = 6L ; displacement = 29.96 ; Weight KG = 5021 ; L×W×H ( MM ) = 3870*1675*2134
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): AMF25, DKG-309, DSE4620, DSE7320, SmartGen (không ghi model)
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp AMF25, Datakom DKG-309, Deep Sea DSE4620; bộ điều khiển có datasheet hãng

### 16. CDC710KVA — động cơ KTAA19-G6A (hãng Cummins, theo dòng bảng), đầu phát không ghi
- supplierId: jiuan-power, n: 109, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  bảng một model: | Model | CDC710KVA ; | Prime Power | 568KW/710KVA ; | Standby Power | 640KW/800KVA ; | Frequency/Speed | 50Hz/1500rpm, 60Hz/1800rpm ; | Phase Wires | 3 phase 4 wire ; | Power Factor | 0.8 (Lagging) ; | Engine Model | Cummins KTAA19-G6A ; | Cylinders | 6 ; | Bore x Stroke(mm) | 159 x 159mm ; | Starting Method | 24V DC electrical start ; | Voltage | 415/240V, 400/230V, 380/220V ; | Protection Rating | IP23 (standard), optional IP55 ; | Dimensions (L×W×H) | 4700 x 2100 x 2400mm ; | Weight (KGS) | 7000kg ; | Noise (Db) | ≤ 7 2db@7m ; Power: From 20kVA to 5000kVA (5MW).
  thông số trong dòng: Phase Wires = 3 phase 4 wire ; Cylinders = 6 ; Bore x Stroke(mm) = 159 x 159mm ; Starting Method = 24V DC electrical start ; Voltage = 415/240V, 400/230V, 380/220V ; Dimensions (L×W×H) = 4700 x 2100 x 2400mm ; Weight (KGS) = 7000kg
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): ComAp (không ghi model), DSE6120, DSE7220, DSE7320, HGM6120, HGM6120CAN, HGM6120CAN-4G, HGM6120N, HGM9510N
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp, Deep Sea DSE6120, Deep Sea DSE7220; bộ điều khiển có datasheet hãng

### 17. AC825 — động cơ QSK19-G20 (hãng Cummins, theo dòng bảng), đầu phát không ghi
- supplierId: aosif, n: 102, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | AC825 | 750/600 | 825/660 | QSK19-G20 | 155 | 6L | 18.9 |
  thông số trong dòng: Fuel Consumption (L/h) = 155 ; Cylinder = 6L ; Displacement = 18.9
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): DSE6120, DSE7320
  lý do xếp: NCC có hồ sơ bộ điều khiển Deep Sea DSE6120, Deep Sea DSE7320; bộ điều khiển có datasheet hãng

### 18. HC-BD825 — động cơ 6M33G8D3/5 (6M33G825/5) (hãng Baudouin, theo tên trang), đầu phát S5L1D-H41 (Stamford)
- supplierId: kaihua-genset, n: 119, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | HC-BD825 | 825 | 750 | 6M33G8D3/5 (6M33G825/5) | S5L1D-H41 | 4000*2100*2080 | 5530*1860*2550 | Download
  thông số trong dòng: Dimension mm Open Type = 4000*2100*2080
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): InteliGen, DSE6020, DSE6120, DSE6120 MKII, DSE7320, DSE8610, HGM6120UC, HGM7120UC, HGM9510
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp InteliGen, Deep Sea DSE6020, Deep Sea DSE6120; bộ điều khiển có datasheet hãng

### 19. COM775V — động cơ TWD1673GE (hãng Volvo Penta, theo tên trang), đầu phát không ghi
- supplierId: comappower, n: 108, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | COM775V | 775kVA | 620kW | 705kVA | 564kW | TWD1673GE | 6 | COM775V
  thông số trong dòng: NO. of Cylinder = 6
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): InteliGen
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp InteliGen; bộ điều khiển có datasheet hãng

### 20. KH-560GF — động cơ DC16 078A 02-43 (hãng Scania, theo dòng bảng), đầu phát không ghi
- supplierId: kaihua-genset, n: 114, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | KH-560GF | 770 | 616 | 700 | 560 | DC16 078A 02-43 | 4300*1800*2430 | 4500
  thông số trong dòng: Dimension = 4300*1800*2430 ; Weight(KG) = 4500
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): InteliGen, DSE6020, DSE6120, DSE6120 MKII, DSE7320, DSE8610, HGM6120UC, HGM7120UC, HGM9510
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp InteliGen, Deep Sea DSE6020, Deep Sea DSE6120; bộ điều khiển có datasheet hãng

### 21. KH-561GF — động cơ DC16 072A 02-13 (hãng Scania, theo tên trang), đầu phát không ghi
- supplierId: kaihua-genset, n: 114, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | KH-561GF | 771 | 617 | 701 | 561 | DC16 072A 02-13 | 4300*1800*2430 | 4500
  thông số trong dòng: Dimension = 4300*1800*2430 ; Weight(KG) = 4500
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): InteliGen, DSE6020, DSE6120, DSE6120 MKII, DSE7320, DSE8610, HGM6120UC, HGM7120UC, HGM9510
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp InteliGen, Deep Sea DSE6020, Deep Sea DSE6120; bộ điều khiển có datasheet hãng

### 22. ES-788 — động cơ S6R-PTA-S (hãng Mitsubishi, theo tên trang), đầu phát không ghi
- supplierId: ettes-power, n: 159, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | ES-788 | 570 | 713 | 630 | 788 | S6R-PTA-S | TBA | 6.L | TBA | 4080*1715*2000 | 5650 |
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): ComAp (không ghi model), DSE8620, DEIF (không ghi model), Woodward (không ghi model)
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp, Deep Sea DSE8620, DEIF; bộ điều khiển có datasheet hãng

### 23. RMM576 — động cơ 12V2000G63 (hãng MTU, theo tên trang), đầu phát không ghi
- supplierId: rise-power, n: 118, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | RMM576 | 720/576 | 781/625 | 12V2000G63 | 4000*1750*2050 | 5900
  thông số trong dòng: Dimension = 4000*1750*2050 ; Weight(kg) = 5900
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): DSE6110, DSE7320, DSE8610
  lý do xếp: NCC có hồ sơ bộ điều khiển Deep Sea DSE6110, Deep Sea DSE7320, Deep Sea DSE8610; bộ điều khiển có datasheet hãng

### 24. MC825M — động cơ 12V1600G11F (hãng MTU, theo tên trang), đầu phát không ghi
- supplierId: mecca-power, n: 5001, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | MC825M | 600 | 750 | 660 | 825 | 12V1600G11F |
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): ComAp (không ghi model), Deep Sea (không ghi model), DEIF (không ghi model), SmartGen (không ghi model)
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp, Deep Sea, DEIF

### 25. BF-M880-T2 — động cơ 12V2000G26F (hãng MTU, theo dòng bảng), đầu phát S6L1D-C4 (Stamford)
- supplierId: baifa-power, n: 101, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | BF-M880-T2 | 880 | 800 | MTU | 12V2000G26F | | S6L1D-C4

### 26. IV800 — động cơ V20 TE2 (hãng FPT, theo tên trang), đầu phát không ghi
- supplierId: legapower, n: 109, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | IV800 | 800 | 720 | 144.5 | V20 TE2 | 6L | ECM | 20 |
  thông số trong dòng: Cyl = 6L

### 27. WET-620 — động cơ TWD1645GE-B (hãng Volvo Penta, theo tên trang), đầu phát không ghi
- supplierId: walter-yangzhou, n: 111, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | WET-620 | 775 | 620 | 700 | 560 | TWD1645GE-B | 3300*1400*1800
  thông số trong dòng: Dimension(MM)L*W*H = 3300*1400*1800

### 28. HDSC700 — động cơ DC16 072A 02-16 (hãng Scania, theo tên trang), đầu phát không ghi
- supplierId: huadong-yangzhou, n: 106, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | HDSC700 | 700/560 | 770/616 | 1014 | 138 | DC16 072A 02-16 | 680 | 3680×1205×2210 | 4350
  thông số trong dòng: 100% 负载燃油耗 （L/h） = 138 ; 净重量 （Kg） = 4350 ; 外形尺寸（mm） L ×W×H = 3680×1205×2210

### 29. PWP777 — động cơ 2806A-E18TAG4 (hãng Perkins, theo dòng bảng), đầu phát không ghi
- supplierId: pauway-tianjin, n: 104, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | PWP777 | 565/706.25 | 621.5/777 | 2806A-E18TAG4 | VIEW PDF

### 30. ZF600GF — động cơ D2842LE203 (hãng MAN, theo tên trang), đầu phát không ghi
- supplierId: xinzhengfa, n: 107, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | ZF600GF | 750 | 600 | 1082 | 50/1500 | D2842LE203 | 3270 × 1610 × 1995 | 4250
  thông số trong dòng: 机组外型尺寸(L × B × H)mm = 3270 × 1610 × 1995 ; 机组重量Kg = 4250 ; 额定电流A = 1082

