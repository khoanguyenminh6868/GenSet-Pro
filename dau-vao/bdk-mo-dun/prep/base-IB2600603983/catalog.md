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

## Thông số theo model (dùng cho mọi cấu hình có model đó; ghi factSrc như dưới)

### Động cơ TWD1645GE — hãng: Volvo Penta
- Công suất động cơ (prime): 595 kWm / 1500 rpm — factSrc: { "supplierId": "volvo-penta", "n": 1008, "line": "| Net engine prime power kWm, 50 Hz / 1500 rpm | 595 kWm / 1500 rpm" }
- Công suất động cơ (prime): 619 kWm / 1800 rpm — factSrc: { "supplierId": "volvo-penta", "n": 1008, "line": "| Net engine prime power kWm, 60 Hz / 1800 rpm | 619 kWm / 1800 rpm" }
- Công suất động cơ (standby): 681 kWm / 1800 rpm — factSrc: { "supplierId": "volvo-penta", "n": 1008, "line": "| Net engine standby power kWm, 60 Hz / 1800 rpm | 681 kWm / 1800 rpm" }
- Đường kính × hành trình: 144*165 — factSrc: { "supplierId": "lees-power", "n": 1165, "line": "| 缸径x冲程 | mm | 144*165" }
- Đường kính × hành trình: 144x165 — factSrc: { "supplierId": "lees-power", "n": 1175, "line": "| Bore x Stroke | mm | 144x165" }
- Dung tích xi lanh: 16.12 — factSrc: { "supplierId": "volvo-penta", "n": 1008, "line": "| Displacement, l | 16.12" }
- Dung tích xi lanh: 16.12 — factSrc: { "supplierId": "lees-power", "n": 1175, "line": "| Displacement | L | 16.12" }
- Tỉ số nén: 16.8:1 — factSrc: { "supplierId": "volvo-penta", "n": 1008, "line": "| Compression ratio | 16.8:1" }
- Tỉ số nén: 16.8:1 — factSrc: { "supplierId": "lees-power", "n": 1175, "line": "| Compression Ratio | 16.8:1" }
- Số xi lanh: 6 cylinder Diesel L — factSrc: { "supplierId": "lees-power", "n": 1175, "line": "| Cylinder No.& Configuration | 6 cylinder Diesel L" }
- Số xi lanh: 6 — factSrc: { "supplierId": "yanan-power", "n": 107, "line": "| YN770V | 715kVA | 572kW | 650kVA | 520kW | TWD1645GE | 6 | YN770V" }
- ⚠ Dầu bôi trơn: các nguồn ghi khác nhau (64 / 48 / 42) — không dùng làm "met"
- Dầu bôi trơn: 48 — factSrc: { "supplierId": "lees-power", "n": 1165, "line": "| 机油容量 | L | 48" }
- Dầu bôi trơn: 64 — factSrc: { "supplierId": "bdadl-shanghai", "n": 134, "line": "| BDA-V560 | 560/620 | 沃尔沃奔达 | TWD1645GE | 6 | 16.12 | 64 | ≤210 | 3450*1450*1900 | 4280" }
- Dầu bôi trơn: 42 — factSrc: { "supplierId": "xingguang-jiangsu", "n": 102, "line": "| XG-616GF | 560/616 | TWD1645GE | 595/654 | 6 | 42 | 191 | 国 III | 3460×1400×2100 | 3600" }
- Dầu bôi trơn: 48 — factSrc: { "supplierId": "victory-generator", "n": 111, "line": "| V616PT | 560 | 700 | 616 | 770 | TWD1645GE | CN III | 144*165 | 6 | 16.12 | 48 | 199 | 3400*1350*2000 | 3800" }
- ⚠ Tiêu chuẩn khí thải: các nguồn ghi khác nhau (国三 / Stage II / 国Ⅲ / CN III / 国 III) — không dùng làm "met"
- Tiêu chuẩn khí thải: 国Ⅲ — factSrc: { "supplierId": "senci-jiangsu", "n": 108, "line": "| | 550/605 | TWD1645GE | 595/655 | 144X165 | 6 | 42 | 191 | 国Ⅲ | 3460X1400X2100 | 3600" }
- Tiêu chuẩn khí thải: 国Ⅲ — factSrc: { "supplierId": "senci", "n": 2004, "line": "| | 550/605 | TWD1645GE | 595/655 | 144X165 | 6 | 42 | 191 | 国Ⅲ | 3460X1400X2100 | 3600" } (tìm trên internet, trang không phải của hãng)
- Tiêu chuẩn khí thải: 国 III — factSrc: { "supplierId": "xingguang-jiangsu", "n": 102, "line": "| XG-616GF | 560/616 | TWD1645GE | 595/654 | 6 | 42 | 191 | 国 III | 3460×1400×2100 | 3600" }
- Tiêu chuẩn khí thải: Stage II — factSrc: { "supplierId": "jet-power", "n": 122, "line": "| V-750T2 | 750 | 600 | 680 | 544 | TWD1645GE | L6 | EMS | 16.12 | 144*165 | 133 | Stage II | ECO40 3L4C" }
- Nạp khí: 涡轮增压 — factSrc: { "supplierId": "lees-power", "n": 1165, "line": "| 进气方式 | 涡轮增压" }

### Đầu phát LSA49.3 M6
- Cấp bảo vệ: IP 23 — factSrc: { "supplierId": "leroy-somer-fuzhou", "n": 1012, "line": "| Protection | IP 23" }
- Cấp bảo vệ: IP 23 — factSrc: { "supplierId": "leroy-somer-fuzhou", "n": 1012, "line": "● Degree of protection: IP 23" }
- Cấp cách điện: H — factSrc: { "supplierId": "leroy-somer-fuzhou", "n": 1012, "line": "| Insulation class | H" }
- Kích từ / AVR: AREP / PMG — factSrc: { "supplierId": "leroy-somer-fuzhou", "n": 1012, "line": "| Excitation system | AREP / PMG" }
- Ổn định điện áp: ± 0.25% — factSrc: { "supplierId": "leroy-somer-fuzhou", "n": 1012, "line": "| Voltage regulation (*) | ± 0.25%" }

### Động cơ 4006-23TAG2A — hãng: Perkins
- Điều tốc: Electronic — factSrc: { "supplierId": "fdk-energy", "n": 1103, "line": "| Governor type | Electronic" }
- Điều tốc: Electrical — factSrc: { "supplierId": "gb-power", "n": 1027, "line": "| Speed Governor | Electrical" }
- Dung tích xi lanh: 22.92L — factSrc: { "supplierId": "fdk-energy", "n": 1103, "line": "| Displacement | 22.92L" }
- Dung tích xi lanh: 22.92L — factSrc: { "supplierId": "gb-power", "n": 1027, "line": "| Displacement | 22.92L" }
- Số xi lanh: 6 — factSrc: { "supplierId": "fdk-energy", "n": 1103, "line": "| Cylinder quantity | 6" }
- Số xi lanh: 6 — factSrc: { "supplierId": "depco-power", "n": 2449, "line": "| Cylinder | 6 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- ⚠ Dầu bôi trơn: các nguồn ghi khác nhau (105 / 113 / 113.4) — không dùng làm "met"
- Dầu bôi trơn: 113 — factSrc: { "supplierId": "bdadl-shanghai", "n": 111, "line": "| BDA-P600 | 600/750 | 珀金斯 | 4006-23TAG2A | 6 | 23 | 113 | ≤205 | 4000*1710*2270 | 5400" }
- Dầu bôi trơn: 113 — factSrc: { "supplierId": "pengpai-yangzhou", "n": 110, "line": "| PPDL-P600 | 600/750 | 珀金斯 | 4006-23TAG2A | 6 | 23 | 113 | ≤205 | 4000*1710*2270 | 5400" }
- Dầu bôi trơn: 113 — factSrc: { "supplierId": "liangzi-yangzhou", "n": 110, "line": "| LZ- P600 | 600/750 | 珀金斯 | 4006-23TAG2A | 6L | 23 | 113 | ≤210 | 4000*1710*2270 | 5400 | 详细参数" }
- Dầu bôi trơn: 113.4 — factSrc: { "supplierId": "xingguang-jiangsu", "n": 103, "line": "| XG-660GF | 600/660 | 4006-23TAG2A | 658/724 | 6 | 113.4 | ≤ 205 | 国 II | 4100×1750×2170 | 5300" }
- Làm mát: Water Cool — factSrc: { "supplierId": "gb-power", "n": 1027, "line": "| Cooling System | Water Cool" }
- Làm mát: Water — factSrc: { "supplierId": "depco-power", "n": 2449, "line": "| Cylinder | 6 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Đường kính × hành trình: 160×190 — factSrc: { "supplierId": "fdk-energy", "n": 1103, "line": "| Bore x Stroke (mm x mm) | 160×190" }
- Đường kính × hành trình: 160 X 190 — factSrc: { "supplierId": "depco-power", "n": 2449, "line": "| Cylider arrangemant | IN-LINE | Bore and Stroke(mm) | 160 X 190" } (tìm trên internet, trang chính hãng)
- Tỉ số nén: 13.6:1 — factSrc: { "supplierId": "fdk-energy", "n": 1103, "line": "| Compression Ratio | 13.6:1" }
- Tỉ số nén: 13.6:1 — factSrc: { "supplierId": "gb-power", "n": 1027, "line": "| Compression Ratio | 13.6:1" }
- Nạp khí: Turbo charged — factSrc: { "supplierId": "fdk-energy", "n": 1103, "line": "| Aspiration | Turbo charged" }
- Khởi động: 24V — factSrc: { "supplierId": "fdk-energy", "n": 1103, "line": "| Starter motor | 24V" }
- ⚠ Tiêu chuẩn khí thải: các nguồn ghi khác nhau (EU2007(EU97/68/EC Stage Ⅱ ) / T2 / 国 II) — không dùng làm "met"
- Tiêu chuẩn khí thải: EU2007(EU97/68/EC Stage Ⅱ ) — factSrc: { "supplierId": "gb-power", "n": 1027, "line": "| Emissions statement | EU2007(EU97/68/EC Stage Ⅱ )" }
- Tiêu chuẩn khí thải: T2 — factSrc: { "supplierId": "hanyang-weifang", "n": 101, "line": "| HY-597 | 4006-23TAG2A | 628 | 691 | 6 | 160*190 | 22.9 | 202 | 4000*1000*1950 | 5500 | T2" }
- Tiêu chuẩn khí thải: 国 II — factSrc: { "supplierId": "xingguang-jiangsu", "n": 103, "line": "| XG-660GF | 600/660 | 4006-23TAG2A | 658/724 | 6 | 113.4 | ≤ 205 | 国 II | 4100×1750×2170 | 5300" }
- Công suất động cơ (prime): 632 — factSrc: { "supplierId": "weiman-fujian", "n": 111, "line": "| WT-P825 | 600 | 750 | 660 | 825 | 4006-23TAG2A | 632 | 695 | 202 | 155 | 6×160×190 | 22.921 | 13.6:1 | TC | More data" }
- Công suất động cơ (prime): 638 — factSrc: { "supplierId": "weiman-fujian", "n": 111, "line": "| WT-P825 | 600 | 750 | 660 | 825 | 4006-23TAG2A | 638 | 702 | 222 | 177 | 6×160×190 | 22.921 | 13.6:1 | TC | More data" }
- Công suất động cơ (standby): 695 — factSrc: { "supplierId": "weiman-fujian", "n": 111, "line": "| WT-P825 | 600 | 750 | 660 | 825 | 4006-23TAG2A | 632 | 695 | 202 | 155 | 6×160×190 | 22.921 | 13.6:1 | TC | More data" }
- Công suất động cơ (standby): 702 — factSrc: { "supplierId": "weiman-fujian", "n": 111, "line": "| WT-P825 | 600 | 750 | 660 | 825 | 4006-23TAG2A | 638 | 702 | 222 | 177 | 6×160×190 | 22.921 | 13.6:1 | TC | More data" }

### Đầu phát LVI634B — hãng: Stamford
- Cấp bảo vệ: IP22 — factSrc: { "supplierId": "gb-power", "n": 1027, "line": "| Protection Class | IP22" }
- Cấp cách điện: H — factSrc: { "supplierId": "gb-power", "n": 1027, "line": "| Insulation Class | H" }
- Ổn định điện áp: ≤±1% — factSrc: { "supplierId": "gb-power", "n": 1027, "line": "| Voltage Regulation, | ≤±1%" }

### Động cơ QSK23-G2 — hãng: Cummins
- Số xi lanh: 6 — factSrc: { "supplierId": "aosif", "n": 1088, "line": "| No. of cylinder | 6" }
- Số xi lanh: 6 — factSrc: { "supplierId": "fdk-energy", "n": 1028, "line": "| Cylinder quantity | 6" }
- Dung tích xi lanh: 23.1L — factSrc: { "supplierId": "aosif", "n": 1088, "line": "| Displacement | 23.1L" }
- Dung tích xi lanh: 23 — factSrc: { "supplierId": "aosif", "n": 103, "line": "| AC810 | 750/600 | 810/650 | QSK23-G2 | 151 | 6L | 23 |" }
- Làm mát khí nạp / piston: Air-to-Air Heat — factSrc: { "supplierId": "aosif", "n": 1088, "line": "| Charge Air Cooling | Air-to-Air Heat" }
- Điều tốc: ECU — factSrc: { "supplierId": "aosif", "n": 1088, "line": "| Governor | ECU" }
- Đường kính × hành trình: 170x170mm — factSrc: { "supplierId": "aosif", "n": 1088, "line": "| Bore x Stroke | 170x170mm" }
- Đường kính × hành trình: 170×170 — factSrc: { "supplierId": "fdk-energy", "n": 1028, "line": "| Bore x Stroke (mm x mm) | 170×170" }
- Khởi động: 24V — factSrc: { "supplierId": "aosif", "n": 1088, "line": "| Starting Voltage | DC24V" }
- Nạp khí: Turbo-charged — factSrc: { "supplierId": "fdk-energy", "n": 1028, "line": "| Aspiration | Turbo-charged" }
- Tỉ số nén: 16.0:1 — factSrc: { "supplierId": "fdk-energy", "n": 1028, "line": "| Compression Ratio | 16.0:1" }

### Đầu phát S5L1D-H41 — hãng: Stamford
- ⚠ Kích từ / AVR: các nguồn ghi khác nhau (Single bearing, Brushless, / Brush less,self-exciting) — không dùng làm "met"
- Kích từ / AVR: Single bearing, Brushless, — factSrc: { "supplierId": "fdk-energy", "n": 1027, "line": "| Exciter type | Single bearing, Brushless," }
- Kích từ / AVR: Brush less,self-exciting — factSrc: { "supplierId": "shanhua", "n": 1046, "line": "| 励磁方式 Exciter Type | Brush less,self-exciting" }
- ⚠ Ổn định điện áp: các nguồn ghi khác nhau (≤±1% / ±5%) — không dùng làm "met"
- Ổn định điện áp: ±5% — factSrc: { "supplierId": "shanhua", "n": 1046, "line": "| 电压调整Voltage Regulation | ±5%" }
- Ổn định điện áp: ≤±1% — factSrc: { "supplierId": "fdk-energy", "n": 1027, "line": "| Voltage regulation NL-FL | ≤±1%" }
- Cấp cách điện: H — factSrc: { "supplierId": "fdk-energy", "n": 1027, "line": "| Insulation grade | H" }
- Cấp cách điện: H — factSrc: { "supplierId": "shanhua", "n": 1046, "line": "| 绝缘等级 Insulation Class | H" }
- Cấp bảo vệ: IP23 — factSrc: { "supplierId": "fdk-energy", "n": 1027, "line": "| Protection grade | IP23" }
- Cấp bảo vệ: IP23 — factSrc: { "supplierId": "shanhua", "n": 1046, "line": "| 防护等级 Protection Grade | IP23" }
- Méo sóng hài (THD): ＜2% — factSrc: { "supplierId": "shanhua", "n": 1046, "line": "| 电话谐波系数 THF | ＜2%" }

### Động cơ S6R2-PTAA-C — hãng: Mitsubishi
- Số xi lanh: 6 — factSrc: { "supplierId": "aosif", "n": 1132, "line": "| No. of cylinder | 6" }
- Số xi lanh: 6 — factSrc: { "supplierId": "fdk-energy", "n": 1117, "line": "| Cylinder quantity | 6" }
- Dung tích xi lanh: 29.96L — factSrc: { "supplierId": "aosif", "n": 1132, "line": "| Displacement | 29.96L" }
- Dung tích xi lanh: 30 — factSrc: { "supplierId": "aosif", "n": 105, "line": "| ASM825 | 750/600 | 825/660 | S6R2-PTAA-C | 165 | 6L | 30 |" }
- Điều tốc: Electrical — factSrc: { "supplierId": "aosif", "n": 1132, "line": "| Governor | Electrical" }
- Điều tốc: Electronic — factSrc: { "supplierId": "fdk-energy", "n": 1117, "line": "| Speed governor | Electronic | Fuel Consumption at 100% load" }
- Đường kính × hành trình: 170x220mm — factSrc: { "supplierId": "aosif", "n": 1132, "line": "| Bore x Stroke | 170x220mm" }
- Đường kính × hành trình: 170×220 — factSrc: { "supplierId": "fdk-energy", "n": 1117, "line": "| Bore x Stroke (mm x mm) | 170×220" }
- ⚠ Tỉ số nén: các nguồn ghi khác nhau (14.1:1 / 14:1) — không dùng làm "met"
- Tỉ số nén: 14:1 — factSrc: { "supplierId": "fdk-energy", "n": 1117, "line": "| Compression Ratio | 14:1" }
- Tỉ số nén: 14.1:1 — factSrc: { "supplierId": "aosif", "n": 1132, "line": "| Compression ratio | 14.1:1" }
- Dầu bôi trơn: 55 — factSrc: { "supplierId": "bdadl-shanghai", "n": 111, "line": "| BDA-LZ640 | 580/640 | 上海菱重 | S6R2-PTAA-C | 6 | 30 | 55 | ≤170 | 4023×1810×1953 | 5750" }
- Dầu bôi trơn: 55 — factSrc: { "supplierId": "fukangsi-yangzhou", "n": 2009, "line": "| FKS-LZ640 | 580/640 | 上海菱重 | S6R2-PTAA-C | 6 | 30 | 55 | ≤170 | 4023×1810×1953 | 5750" } (tìm trên internet, trang chính hãng)
- Nạp khí: Turbo charged — factSrc: { "supplierId": "fdk-energy", "n": 1117, "line": "| Aspiration | Turbo charged" }
- Khởi động: 24V — factSrc: { "supplierId": "fdk-energy", "n": 1117, "line": "| Starter motor | 24V" }

### Động cơ 4006-23TAG3A — hãng: Perkins
- Điều tốc: Electronic — factSrc: { "supplierId": "fdk-energy", "n": 1104, "line": "| Governor type | Electronic" }
- Điều tốc: ELECTRONIC — factSrc: { "supplierId": "genlitec", "n": 1013, "line": "| Governing Type | ELECTRONIC" }
- Dung tích xi lanh: 22.9L — factSrc: { "supplierId": "genlitec", "n": 122, "line": "| Displacement | 22.9L" }
- Dung tích xi lanh: 22.92L — factSrc: { "supplierId": "fdk-energy", "n": 1104, "line": "| Displacement | 22.92L" }
- ⚠ Số xi lanh: các nguồn ghi khác nhau (6 / 8L / 6L / 6 L) — không dùng làm "met"
- Số xi lanh: 6 — factSrc: { "supplierId": "jiuan-power", "n": 135, "line": "| Cylinders | 6" }
- Số xi lanh: 6 — factSrc: { "supplierId": "genlitec", "n": 1013, "line": "| No. of Cylinders | 6" }
- Số xi lanh: 6 — factSrc: { "supplierId": "fdk-energy", "n": 1104, "line": "| Cylinder quantity | 6" }
- Số xi lanh: 6 — factSrc: { "supplierId": "depco-power", "n": 2448, "line": "| Cylinder | 6 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- ⚠ Dầu bôi trơn: các nguồn ghi khác nhau (105 / 113 / 113.4) — không dùng làm "met"
- Dầu bôi trơn: 113 — factSrc: { "supplierId": "bdadl-shanghai", "n": 111, "line": "| BDA-P640 | 640/800 | 珀金斯 | 4006-23TAG3A | 6 | 23 | 113 | ≤205 | 4000*1710*2270 | 5400" }
- Dầu bôi trơn: 113 — factSrc: { "supplierId": "pengpai-yangzhou", "n": 110, "line": "| PPDL-P640 | 640/800 | 珀金斯 | 4006-23TAG3A | 6 | 23 | 113 | ≤205 | 4000*1710*2270 | 5400" }
- Dầu bôi trơn: 113.4 — factSrc: { "supplierId": "xingguang-jiangsu", "n": 103, "line": "| XG-704GF | 640/704 | 4006-23TAG3A | 705/776 | 6 | 113.4 | ≤ 205 | 国 II | 4100×1750×2170 | 5500" }
- Dầu bôi trơn: 113 — factSrc: { "supplierId": "liangzi-yangzhou", "n": 109, "line": "| LZ- P640 | 640/800 | 珀金斯 | 4006-23TAG3A | 6L | 22.92 | 113 | ≤214 | 4010*1710*2120 | 5600 | 详细参数" }
- Làm mát: WATER — factSrc: { "supplierId": "genlitec", "n": 1013, "line": "| Cooling Method | WATER" }
- Làm mát: Water — factSrc: { "supplierId": "depco-power", "n": 2448, "line": "| Cylinder | 6 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Đường kính × hành trình: 160 x 190mm — factSrc: { "supplierId": "genlitec", "n": 122, "line": "| Bore x Stroke | 160 x 190mm" }
- Đường kính × hành trình: 160 x 190mm — factSrc: { "supplierId": "jiuan-power", "n": 135, "line": "| Bore x Stroke(mm) | 160 x 190mm" }
- Tỉ số nén: 13.6:1 — factSrc: { "supplierId": "fdk-energy", "n": 1104, "line": "| Compression Ratio | 13.6:1" }
- Tỉ số nén: 13.6:1 — factSrc: { "supplierId": "genlitec", "n": 1013, "line": "| Compression Ratio | 13.6:1" }
- Nạp khí: Turbo charged — factSrc: { "supplierId": "fdk-energy", "n": 1104, "line": "| Aspiration | Turbo charged" }
- Khởi động: 24V — factSrc: { "supplierId": "fdk-energy", "n": 1104, "line": "| Starter motor | 24V" }
- Khởi động: 24V DC — factSrc: { "supplierId": "genlitec", "n": 122, "line": "| Starting Voltage | 24V DC" }
- Tiêu chuẩn khí thải: T2 — factSrc: { "supplierId": "hanyang-weifang", "n": 101, "line": "| HY-641 | 4006-23TAG3A | 675 | 756 | 6 | 160*190 | 22.9 | 210 | 4000*1000*1950 | 5800 | T2" }
- Tiêu chuẩn khí thải: 国 II — factSrc: { "supplierId": "xingguang-jiangsu", "n": 103, "line": "| XG-704GF | 640/704 | 4006-23TAG3A | 705/776 | 6 | 113.4 | ≤ 205 | 国 II | 4100×1750×2170 | 5500" }
- Công suất động cơ (prime): 679 — factSrc: { "supplierId": "weiman-fujian", "n": 111, "line": "| WT-P880 | 640 | 800 | 704 | 880 | 4006-23TAG3A | 679 | 760 | 210 | 172 | 6×160×190 | 22.921 | 13.6:1 | TC | More data" }
- Công suất động cơ (prime): 715 — factSrc: { "supplierId": "weiman-fujian", "n": 111, "line": "| WT-P 935 | 680 | 850 | 748 | 935 | 4006-23TAG3A | 715 | 795 | 226 | 200 | 6×160×190 | 22.921 | 13.6:1 | TC | More data" }
- Công suất động cơ (standby): 760 — factSrc: { "supplierId": "weiman-fujian", "n": 111, "line": "| WT-P880 | 640 | 800 | 704 | 880 | 4006-23TAG3A | 679 | 760 | 210 | 172 | 6×160×190 | 22.921 | 13.6:1 | TC | More data" }
- Công suất động cơ (standby): 795 — factSrc: { "supplierId": "weiman-fujian", "n": 111, "line": "| WT-P 935 | 680 | 850 | 748 | 935 | 4006-23TAG3A | 715 | 795 | 226 | 200 | 6×160×190 | 22.921 | 13.6:1 | TC | More data" }

### Đầu phát S5L1D-H4 — hãng: Stamford
- Kích từ / AVR: Single bearing, Brushless, — factSrc: { "supplierId": "fdk-energy", "n": 1103, "line": "| Exciter type | Single bearing, Brushless," }
- Ổn định điện áp: ≤±1% — factSrc: { "supplierId": "fdk-energy", "n": 1103, "line": "| Voltage regulation NL-FL | ≤±1%" }
- Cấp cách điện: H — factSrc: { "supplierId": "fdk-energy", "n": 1103, "line": "| Insulation grade | H" }
- Cấp bảo vệ: IP23 — factSrc: { "supplierId": "fdk-energy", "n": 1103, "line": "| Protection grade | IP23" }

### Đầu phát S6L1D-C41 — hãng: Stamford
- Kích từ / AVR: Single bearing, Brushless, — factSrc: { "supplierId": "fdk-energy", "n": 1029, "line": "| Exciter type | Single bearing, Brushless," }
- ⚠ Ổn định điện áp: các nguồn ghi khác nhau (≤±1% / ±5%) — không dùng làm "met"
- Ổn định điện áp: ±5% — factSrc: { "supplierId": "shanhua", "n": 1001, "line": "| 电压调整Voltage Regulation | ±5%" }
- Ổn định điện áp: ≤±1% — factSrc: { "supplierId": "fdk-energy", "n": 1029, "line": "| Voltage regulation NL-FL | ≤±1%" }
- Cấp cách điện: H — factSrc: { "supplierId": "fdk-energy", "n": 1029, "line": "| Insulation grade | H" }
- Cấp cách điện: H — factSrc: { "supplierId": "shanhua", "n": 1001, "line": "| 绝缘等级 Insulation Class | H" }
- Cấp bảo vệ: IP23 — factSrc: { "supplierId": "fdk-energy", "n": 1029, "line": "| Protection grade | IP23" }
- Cấp bảo vệ: IP23 — factSrc: { "supplierId": "shanhua", "n": 1001, "line": "| 防护等级 Protection Grade | IP23" }
- Méo sóng hài (THD): ＜2% — factSrc: { "supplierId": "shanhua", "n": 1001, "line": "| 电话谐波系数 THF | ＜2%" }

### Động cơ S6R2-PTAA — hãng: Mitsubishi
- Số xi lanh: 6 — factSrc: { "supplierId": "depco-power", "n": 2250, "line": "| Cylinder | 6 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Số xi lanh: 6 — factSrc: { "supplierId": "jinjia-power", "n": 108, "line": "| JJSL-600GF | 600 | 660 | 750 | S6R2-PTAA | 6 | 30 | 196 | 5750 | 4000*1800*1950" }
- Đường kính × hành trình: 170 X 220 — factSrc: { "supplierId": "depco-power", "n": 2250, "line": "| Cylider arrangemant | IN-LINE | Bore and Stroke(mm) | 170 X 220" } (tìm trên internet, trang chính hãng)
- Đường kính × hành trình: 170×220 — factSrc: { "supplierId": "mingbang-mbkl", "n": 124, "line": "| 2 | MB-M600 | 750 | 600 | 825 | 660 | S6R2-PTAA | 6 | 18.6 | 170×220 | 205 | 6000×2300×2930" }
- ⚠ Dung tích xi lanh: các nguồn ghi khác nhau (6 / 29.96 / 30 / 18.6) — không dùng làm "met"
- Dung tích xi lanh: 29.96 — factSrc: { "supplierId": "depco-power", "n": 2250, "line": "| Governor | Electrical | Displacement(L) | 29.96" } (tìm trên internet, trang chính hãng)
- Dung tích xi lanh: 30 — factSrc: { "supplierId": "jinjia-power", "n": 108, "line": "| JJSL-600GF | 600 | 660 | 750 | S6R2-PTAA | 6 | 30 | 196 | 5750 | 4000*1800*1950" }
- Dung tích xi lanh: 18.6 — factSrc: { "supplierId": "mingbang-mbkl", "n": 124, "line": "| 2 | MB-M600 | 750 | 600 | 825 | 660 | S6R2-PTAA | 6 | 18.6 | 170×220 | 205 | 6000×2300×2930" }
- Dung tích xi lanh: 6 — factSrc: { "supplierId": "fukangsi-yangzhou", "n": 2009, "line": "| FKS-SL660 | 600 /660 | 日本三菱 | S6R2-PTAA | 6 | 170 | 220 | 6 | 29.96 | 211 | 4275×1752×2500 | 6600" } (tìm trên internet, trang chính hãng)
- Dầu bôi trơn: 29.96 — factSrc: { "supplierId": "fukangsi-yangzhou", "n": 2009, "line": "| FKS-SL660 | 600 /660 | 日本三菱 | S6R2-PTAA | 6 | 170 | 220 | 6 | 29.96 | 211 | 4275×1752×2500 | 6600" } (tìm trên internet, trang chính hãng)
- Dầu bôi trơn: 29.96 — factSrc: { "supplierId": "bdadl-shanghai", "n": 129, "line": "| BDA-SL660 | 600 /660 | 日本三菱 | S6R2-PTAA | 6 | 170 | 220 | 6 | 29.96 | ≤211 | 4275×1752×2500 | 6600" }
- Làm mát: Water — factSrc: { "supplierId": "depco-power", "n": 2250, "line": "| Cylinder | 6 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Tỉ số nén: 14.1:1 — factSrc: { "supplierId": "depco-power", "n": 2250, "line": "| Cyle | 4 Staoke | Compression ratio | 14.1:1" } (tìm trên internet, trang chính hãng)
- Điều tốc: Electrical — factSrc: { "supplierId": "depco-power", "n": 2250, "line": "| Governor | Electrical | Displacement(L) | 29.96" } (tìm trên internet, trang chính hãng)

### Đầu phát FGL70030 — hãng: FG Wilson
- Cấp cách điện: H — factSrc: { "supplierId": "genlitec", "n": 1013, "line": "| Insulation Class: | H" }
- Kích từ / AVR: SHUNT — factSrc: { "supplierId": "genlitec", "n": 1013, "line": "| Excitation System: | SHUNT" }

### Đầu phát MX-600-4 — hãng: Marathon
- (chưa có thông số nào có nguồn)

### Động cơ 2806A-E18TTAG4 — hãng: Perkins
- Đường kính × hành trình: 145 x 183mm — factSrc: { "supplierId": "genlitec", "n": 142, "line": "| Bore x Stroke | 145 x 183mm" }
- Đường kính × hành trình: 145*183 — factSrc: { "supplierId": "hanyang-weifang", "n": 101, "line": "| HY-565 | 2806A-E18TTAG4 | 595 | 657 | 6 | 145*183 | 18.1 | 202 | 3600*800*1850 | 4500 | T2" }
- Dung tích xi lanh: 18.1L — factSrc: { "supplierId": "genlitec", "n": 142, "line": "| Displacement | 18.1L" }
- Dung tích xi lanh: 18.1 — factSrc: { "supplierId": "hanyang-weifang", "n": 101, "line": "| HY-565 | 2806A-E18TTAG4 | 595 | 657 | 6 | 145*183 | 18.1 | 202 | 3600*800*1850 | 4500 | T2" }
- Tiêu chuẩn khí thải: T2 — factSrc: { "supplierId": "hanyang-weifang", "n": 101, "line": "| HY-565 | 2806A-E18TTAG4 | 595 | 657 | 6 | 145*183 | 18.1 | 202 | 3600*800*1850 | 4500 | T2" }
- Số xi lanh: 6 — factSrc: { "supplierId": "yunding-jiangsu", "n": 2002, "line": "| YDP-560GF | 560 | 700 | 1008 | 2806A-E18TTAG4 | 6 | 145*183 | 18.1 | 68 | 200 | 4300*1600*2200 | 5000" } (tìm trên internet, trang chính hãng)
- Dầu bôi trơn: 68 — factSrc: { "supplierId": "yunding-jiangsu", "n": 2002, "line": "| YDP-560GF | 560 | 700 | 1008 | 2806A-E18TTAG4 | 6 | 145*183 | 18.1 | 68 | 200 | 4300*1600*2200 | 5000" } (tìm trên internet, trang chính hãng)

### Đầu phát LL7224J — hãng: Leroy-Somer
- (chưa có thông số nào có nguồn)

### Động cơ 6M33G825/5 — hãng: Baudouin
- ⚠ Điều tốc: các nguồn ghi khác nhau (ECU / Electronic control) — không dùng làm "met"
- Điều tốc: ECU — factSrc: { "supplierId": "ade-power", "n": 2029, "line": "| Engine Governor | ECU" } (tìm trên internet, trang chính hãng)
- Điều tốc: ECU — factSrc: { "supplierId": "landtop-fuzhou", "n": 122, "line": "| LTP825B | 825 | 660 | 750 | 600 | ECU | 6M33G825/5 | LTP404S -600" }
- Điều tốc: Electronic control — factSrc: { "supplierId": "weichai-heavy-machinery", "n": 119, "line": "| WPG825*7 | 1500 | 825/660 | 750/600 | 6M33G825/5 | 6 | 150×185 | Electronic control | Non-Road Emission Exempt" }
- Điều tốc: Electronic control — factSrc: { "supplierId": "weichai-power", "n": 133, "line": "| WPG825*7 | 1500 | 825/660 | 750/600 | 6M33G825/5 | 6 | 150×185 | Electronic control | Non-Road Emission Exempt" }
- ⚠ Số xi lanh: các nguồn ghi khác nhau (6 / 8 L) — không dùng làm "met"
- Số xi lanh: 6 — factSrc: { "supplierId": "yanan-power", "n": 106, "line": "| YN825B | 825kVA | 660kW | 750kVA | 600kW | 6M33G825/5 | 6 | YN825B" }
- Số xi lanh: 6 — factSrc: { "supplierId": "comappower", "n": 105, "line": "| COM825B | 825kVA | 660kW | 600kVA | 750kW | 6M33G825/5 | 6 | COM825B" }
- Số xi lanh: 8 L — factSrc: { "supplierId": "waeta-fujian", "n": 103, "line": "| WTA-B825 | 825 | 660 | 750 | 600 | 6M33G825/5 | 8 L | 19.6 | Baudouin Series.xlsx" }
- Số xi lanh: 6 — factSrc: { "supplierId": "weichai-heavy-machinery", "n": 119, "line": "| WPG825*7 | 1500 | 825/660 | 750/600 | 6M33G825/5 | 6 | 150×185 | Electronic control | Non-Road Emission Exempt" }
- Dung tích xi lanh: 19.6 — factSrc: { "supplierId": "waeta-fujian", "n": 103, "line": "| WTA-B825 | 825 | 660 | 750 | 600 | 6M33G825/5 | 8 L | 19.6 | Baudouin Series.xlsx" }
- Đường kính × hành trình: 150×185 — factSrc: { "supplierId": "weichai-heavy-machinery", "n": 119, "line": "| WPG825*7 | 1500 | 825/660 | 750/600 | 6M33G825/5 | 6 | 150×185 | Electronic control | Non-Road Emission Exempt" }
- Đường kính × hành trình: 150×185 — factSrc: { "supplierId": "weichai-power", "n": 133, "line": "| WPG825*7 | 1500 | 825/660 | 750/600 | 6M33G825/5 | 6 | 150×185 | Electronic control | Non-Road Emission Exempt" }
- Tiêu chuẩn khí thải: Non-Road Emission Exempt — factSrc: { "supplierId": "weichai-heavy-machinery", "n": 119, "line": "| WPG825*7 | 1500 | 825/660 | 750/600 | 6M33G825/5 | 6 | 150×185 | Electronic control | Non-Road Emission Exempt" }
- Tiêu chuẩn khí thải: Non-Road Emission Exempt — factSrc: { "supplierId": "weichai-power", "n": 133, "line": "| WPG825*7 | 1500 | 825/660 | 750/600 | 6M33G825/5 | 6 | 150×185 | Electronic control | Non-Road Emission Exempt" }

### Đầu phát LSA49.3 M65 — hãng: Leroy-Somer
- (chưa có thông số nào có nguồn)

### Động cơ 6M33G750/5 — hãng: Baudouin
- Điều tốc: Electronic — factSrc: { "supplierId": "ade-power", "n": 2027, "line": "| Engine Governor | Electronic" } (tìm trên internet, trang chính hãng)
- Số xi lanh: 6 — factSrc: { "supplierId": "yanan-power", "n": 106, "line": "| YN750B | 750kVA | 600kW | 675kVA | 540kW | 6M33G750/5 | 6 | YN750B" }
- Số xi lanh: 6 — factSrc: { "supplierId": "comappower", "n": 105, "line": "| COM750B | 750kVA | 600kW | 540kVA | 675kW | 6M33G750/5 | 6 | COM750B" }
- Dung tích xi lanh: 19.6 — factSrc: { "supplierId": "waeta-fujian", "n": 103, "line": "| WTA-B750 | 750 | 600 | 688 | 550 | 6M33G750/5 | 6 L | 19.6 | Baudouin Series.xlsx" }

### Đầu phát S5L1D-G4 — hãng: Stamford
- Cấp cách điện: H — factSrc: { "supplierId": "fdk-energy", "n": 1116, "line": "| Insulation grade | H" }
- Cấp bảo vệ: IP23 — factSrc: { "supplierId": "fdk-energy", "n": 1116, "line": "| Protection grade | IP23" }

### Động cơ KTAA19-G6A — hãng: Cummins
- Dung tích xi lanh: 18.9 — factSrc: { "supplierId": "tecgen-fujian", "n": 126, "line": "| Displacement (Liter) | 18.9" }
- Dung tích xi lanh: 19 — factSrc: { "supplierId": "depco-power", "n": 2457, "line": "| Governor | Electrical | Displacement(L) | 19" } (tìm trên internet, trang chính hãng)
- Điều tốc: Electrical — factSrc: { "supplierId": "depco-power", "n": 2457, "line": "| Governor | Electrical | Displacement(L) | 19" } (tìm trên internet, trang chính hãng)
- Điều tốc: Electronic — factSrc: { "supplierId": "legapower", "n": 101, "line": "| LG688C | 688 | 625 | 127.8 | KTAA19G6A | 6L | Electronic | 19 |" }
- Số xi lanh: 6 — factSrc: { "supplierId": "jiuan-power", "n": 109, "line": "| Cylinders | 6" }
- Số xi lanh: 6 — factSrc: { "supplierId": "fdk-energy", "n": 1065, "line": "| Cylinder quantity | 6" }
- Dầu bôi trơn: 50 — factSrc: { "supplierId": "bdadl-shanghai", "n": 130, "line": "| BDA-C500 | 500/550 | 重庆康明斯 | KTAA19-G6A | 6 | 19 | 50 | ≤203 | 3600*1500*2100 | 4750" }
- Dầu bôi trơn: 50 — factSrc: { "supplierId": "bdadl-shanghai", "n": 112, "line": "| BDA-C550 | 550/687.5 | 重庆康明斯 | KTAA19-G6A | 6 | 19 | 50 | ≤202 | 3750*1550*2100 | 4100" }
- Làm mát: Water — factSrc: { "supplierId": "depco-power", "n": 2457, "line": "| Cylinder | 6 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Làm mát: Water Cooling — factSrc: { "supplierId": "tecgen-fujian", "n": 126, "line": "| Cooling Method | Water Cooling | Ambient Temp | ≤40 C" }
- Đường kính × hành trình: 159*159 — factSrc: { "supplierId": "tecgen-fujian", "n": 126, "line": "| Bore*Stroke (mm*mm) | 159*159" }
- Đường kính × hành trình: 159 x 159mm — factSrc: { "supplierId": "jiuan-power", "n": 109, "line": "| Bore x Stroke(mm) | 159 x 159mm" }
- ⚠ Tỉ số nén: các nguồn ghi khác nhau (13.9:1 / 13.0:1) — không dùng làm "met"
- Tỉ số nén: 13.0:1 — factSrc: { "supplierId": "fdk-energy", "n": 1065, "line": "| Compression Ratio | 13.0:1" }
- Tỉ số nén: 13.9:1 — factSrc: { "supplierId": "depco-power", "n": 2457, "line": "| Cyle | 4 Staoke | Compression ratio | 13.9:1" } (tìm trên internet, trang chính hãng)
- Tỉ số nén: 13.9:1 — factSrc: { "supplierId": "weiman-fujian", "n": 110, "line": "| WT-C688 | 500 | 625 | 550 | 688 | KTAA19-G6A | 550 | 610 | 206 | 134.75 | 6×159×159 | 18.9 | 13.9:1 | TC | More data" }
- Tỉ số nén: 13.9:1 — factSrc: { "supplierId": "jinlongteng-fujian", "n": 101, "line": "| JCC688 | / | / | 550 | 688 | KTAA19-G6A | / | 610 | 208stp | 149.5stp | 6×159×159 | 18.9 | 13.9:1 | 50 | 80 | JLT544FS(500KW) | S5L1S-F4(536KW) | 5000*1900*2150 | 5970 | 3700*1570*2080 | 4270" }
- Nạp khí: Turbo-charged — factSrc: { "supplierId": "fdk-energy", "n": 1065, "line": "| Aspiration | Turbo-charged" }
- Khởi động: 24V DC electrical start — factSrc: { "supplierId": "jiuan-power", "n": 109, "line": "| Starting Method | 24V DC electrical start" }
- Khởi động: DC 24V Electrical Starting — factSrc: { "supplierId": "tecgen-fujian", "n": 126, "line": "| Starting Method | DC 24V Electrical Starting" }
- ⚠ Công suất động cơ (prime): các nguồn ghi khác nhau (550 kW / 600 kW) — không dùng làm "met"
- Công suất động cơ (prime): 600 — factSrc: { "supplierId": "weiman-fujian", "n": 110, "line": "| WT-C756 | 550 | 688 | 605 | 756 | KTAA19-G6A | 600 | 664 | 206 | 145 | 6×159×159 | 18.9 | 13:1 | TC | More data" }
- Công suất động cơ (prime): 550 — factSrc: { "supplierId": "weiman-fujian", "n": 110, "line": "| WT-C688 | 500 | 625 | 550 | 688 | KTAA19-G6A | 550 | 610 | 206 | 134.75 | 6×159×159 | 18.9 | 13.9:1 | TC | More data" }
- Công suất động cơ (prime): 600 — factSrc: { "supplierId": "keliang-fuan", "n": 116, "line": "| WT-C756 | 550 | 688 | 605 | 756 | KTAA19-G6A | 600 | 664 | 206 | 145 | 6×159×159 | 18.9 | 13:1 | TC | WT-C5E | 3400×1258×2050 | 4700 | 4600*1800*2200 | 4420" }
- Công suất động cơ (prime): 550 — factSrc: { "supplierId": "keliang-fuan", "n": 116, "line": "| WT-C688 | 500 | 625 | 550 | 688 | KTAA19-G6A | 550 | 610 | 206 | 134.75 | 6×159×159 | 18.9 | 13.9:1 | TC | WT-C5FS | 3650×1570×2080 | 4528 | 4800*1800*2200 | 4530" }
- ⚠ Công suất động cơ (standby): các nguồn ghi khác nhau (610 kW / 664 kW) — không dùng làm "met"
- Công suất động cơ (standby): 610 — factSrc: { "supplierId": "wiseke-taizhou", "n": 101, "line": "| WDL-550C1 | — | 688 / 550 | KTAA19-G6A | — | 610 | 6 | 159*159 | 4350*1800*2350 | 7000" }
- Công suất động cơ (standby): 664 — factSrc: { "supplierId": "wiseke-taizhou", "n": 101, "line": "| WDL-600C2 | — | 750 / 600 | KTAA19-G6A | — | 664 | 6 | 159*159 | 4350*1800*2350 | 7000" }
- Công suất động cơ (standby): 664 — factSrc: { "supplierId": "weiman-fujian", "n": 110, "line": "| WT-C756 | 550 | 688 | 605 | 756 | KTAA19-G6A | 600 | 664 | 206 | 145 | 6×159×159 | 18.9 | 13:1 | TC | More data" }
- Công suất động cơ (standby): 610 — factSrc: { "supplierId": "weiman-fujian", "n": 110, "line": "| WT-C688 | 500 | 625 | 550 | 688 | KTAA19-G6A | 550 | 610 | 206 | 134.75 | 6×159×159 | 18.9 | 13.9:1 | TC | More data" }
- Tiêu chuẩn khí thải: 国 II — factSrc: { "supplierId": "xingguang-jiangsu", "n": 101, "line": "| XG-550GF-1 | 500/550 | KTAA19-G6A | /610 | 6 | 50 | ≤216 | 国 II | 3600×1550×2200 | 4590" }

### Động cơ QSK19-G20 — hãng: Cummins
- Số xi lanh: 6-L — factSrc: { "supplierId": "voltgent", "n": 1022, "line": "| Cylinders and arrangement | 6-L" }
- Số xi lanh: 6L — factSrc: { "supplierId": "aosif", "n": 102, "line": "| AC825 | 750/600 | 825/660 | QSK19-G20 | 155 | 6L | 18.9 |" }
- ⚠ Dung tích xi lanh: các nguồn ghi khác nhau (18.9 / 38 / 18.9 L / 19) — không dùng làm "met"
- Dung tích xi lanh: 18.9 L — factSrc: { "supplierId": "voltgent", "n": 1022, "line": "| Displacement | 18.9 L" }
- Dung tích xi lanh: 18.9 — factSrc: { "supplierId": "aosif", "n": 102, "line": "| AC825 | 750/600 | 825/660 | QSK19-G20 | 155 | 6L | 18.9 |" }
- Dung tích xi lanh: 19 — factSrc: { "supplierId": "waeta-fujian", "n": 110, "line": "| WTA-C825 | 825 | 660 | 750 | 600 | QSK19-G20 | 6 L | 19 | CUMMINS Series.xlsx" }
- Dung tích xi lanh: 38 — factSrc: { "supplierId": "bdadl-shanghai", "n": 130, "line": "| BDA-C600 | 600/660 | 重庆康明斯 | QSK19-G20 | 6 | 38 | 135 | ≤203 | 4000*1500*2000 | 5200" }
- ⚠ Dầu bôi trơn: các nguồn ghi khác nhau (135 / 84) — không dùng làm "met"
- Dầu bôi trơn: 135 — factSrc: { "supplierId": "bdadl-shanghai", "n": 130, "line": "| BDA-C600 | 600/660 | 重庆康明斯 | QSK19-G20 | 6 | 38 | 135 | ≤203 | 4000*1500*2000 | 5200" }
- Dầu bôi trơn: 84 — factSrc: { "supplierId": "yunding-jiangsu", "n": 2001, "line": "| YDK-600GF | 600 | 750 | 1080 | QSK19-G20 | 6 | 159*159 | 19 | 84 | 194 | 3800*1950*2300 | 5100" } (tìm trên internet, trang chính hãng)
- Đường kính × hành trình: 159 × 159 mm — factSrc: { "supplierId": "voltgent", "n": 1022, "line": "| Bore × stroke | 159 × 159 mm" }
- Đường kính × hành trình: 159*159 — factSrc: { "supplierId": "yunding-jiangsu", "n": 2001, "line": "| YDK-600GF | 600 | 750 | 1080 | QSK19-G20 | 6 | 159*159 | 19 | 84 | 194 | 3800*1950*2300 | 5100" } (tìm trên internet, trang chính hãng)
- Kiểu động cơ: 4-stroke diesel — factSrc: { "supplierId": "voltgent", "n": 1022, "line": "| Engine type | 4-stroke diesel" }
- Làm mát: Water cooled — factSrc: { "supplierId": "voltgent", "n": 1022, "line": "| Cooling system | Water cooled" }
- Điều tốc: ECU — factSrc: { "supplierId": "voltgent", "n": 1022, "line": "| Governor type | ECU" }

### Động cơ 6M33G8D3/5 (6M33G825/5) — hãng: Baudouin
- (chưa có thông số nào có nguồn)

### Động cơ TWD1673GE — hãng: Volvo Penta
- Số xi lanh: 6 — factSrc: { "supplierId": "comappower", "n": 108, "line": "| COM775V | 775kVA | 620kW | 705kVA | 564kW | TWD1673GE | 6 | COM775V" }

### Động cơ DC16 078A 02-43 — hãng: Scania
- (chưa có thông số nào có nguồn)

### Động cơ DC16 072A 02-13 — hãng: Scania
- (chưa có thông số nào có nguồn)

### Động cơ S6R-PTA-S — hãng: Mitsubishi
- (chưa có thông số nào có nguồn)

### Động cơ 12V2000G63 — hãng: MTU
- (chưa có thông số nào có nguồn)

### Động cơ 12V1600G11F — hãng: MTU
- (chưa có thông số nào có nguồn)

### Động cơ 12V2000G26F — hãng: MTU
- (chưa có thông số nào có nguồn)

### Đầu phát S6L1D-C4 — hãng: Stamford
- Kích từ / AVR: Single bearing, Brushless, — factSrc: { "supplierId": "fdk-energy", "n": 1104, "line": "| Exciter type | Single bearing, Brushless," }
- Ổn định điện áp: ≤±1% — factSrc: { "supplierId": "fdk-energy", "n": 1104, "line": "| Voltage regulation NL-FL | ≤±1%" }
- Cấp cách điện: H — factSrc: { "supplierId": "fdk-energy", "n": 1104, "line": "| Insulation grade | H" }
- Cấp bảo vệ: IP23 — factSrc: { "supplierId": "fdk-energy", "n": 1104, "line": "| Protection grade | IP23" }

### Động cơ V20 TE2 — hãng: FPT
- Số xi lanh: 6L — factSrc: { "supplierId": "legapower", "n": 109, "line": "| IV800 | 800 | 720 | 144.5 | V20 TE2 | 6L | ECM | 20 |" }
- Số xi lanh: 6L — factSrc: { "supplierId": "legapower", "n": 109, "line": "| IV858T2 | 858 | 780 | 160 | V20 TE2 | 6L | ECM | 20 |" }

### Động cơ TWD1645GE-B — hãng: Volvo Penta
- (chưa có thông số nào có nguồn)

### Động cơ DC16 072A 02-16 — hãng: Scania
- (chưa có thông số nào có nguồn)

### Động cơ 2806A-E18TAG4 — hãng: Perkins
- (chưa có thông số nào có nguồn)

### Động cơ D2842LE203 — hãng: MAN
- (chưa có thông số nào có nguồn)

## Thông số bộ điều khiển (datasheet của hãng; ghi factSrc với supplierId, n và line là dòng nguyên văn) — đầu mỗi datasheet; TOÀN BỘ dòng ở controllers.md, tìm chức năng bằng grep trong đó

### HGM6110 — datasheet của HGM6110N (nhà cung cấp ghi HGM6110: cần xác nhận đời) — supplierId: smartgen, n: 1001
- HGM6100N SERIES
- (HGM6110N/6120N/6110NC/6120NC/6110CAN/6120CAN)
- GENSET CONTROLLER
- USER MANUAL
- +86-371-67981000(overseas)
- All rights reserved. No part of this publication may be reproduced in any material form (including
- photocopying or storing in any medium by electronic means or other) without the written permission of
- the copyright holder.
- SmartGen reserves the right to change the contents of this document without prior notice.
- Table 1 – Software Version
- | Date | Version
- Note
- Original Release
- Changed back panel picture of controller;
- Modified Insulation Intensity description.
- … (678 dòng nữa trong controllers.md)

### DSE6020 — datasheet của DSE6020 MKII (nhà cung cấp ghi DSE6020: cần xác nhận đời) — supplierId: deep-sea-electronics, n: 1007
- DSEGenset
- | DSE6010/20 MKII | ENVIRONMENTAL TESTING STANDARDS
- | AUTO START AND AUTO MAINS FAILURE | ELECTRO-MAGNETIC COMPATIBILITY
- BS EN 61000-6-2
- | CONTROL MODULES | EMC Generic Immunity Standard for
- the Industrial Environment
- BS EN 61000-6-4
- EMC Generic Emission Standard for
- | FEATURES | the Industrial Environment
- ELECTRICAL SAFETY
- BS EN 60950
- Safety of Information Technology Equipment,
- | Using the DSE Configuration Suite | including Electrical Business Equipment
- | Control Module and the DSE6020 | electronic MPU and alternator
- | PC Software the controller is easy | TEMPERATURE
- … (89 dòng nữa trong controllers.md)

### DSE7320 — datasheet của DSE7320 MKII (nhà cung cấp ghi DSE7320: cần xác nhận đời) — supplierId: deep-sea-electronics, n: 1001
- DSEGenset® Data Sheet
- | DSE7310 MKII Auto Start & DSE7320 MKII | Auto
- | Mains | (Utility)
- | Failure | Control
- Modules
- Part Number: 7310-03 / 7320-03
- | DSE7310 MKII | DSE7320 MKII
- Overview
- The DSE7310 MKII is an auto start control module and the DSE7320 MKII is an auto mains (utility) failure control module suitable for a wide variety of
- single, diesel or gas, gen-set applications. Monitoring an extensive number of engine parameters, the modules will display warnings, shutdown and
- engine status information on the back-lit LCD screen, illuminated LEDs and remote PC.
- The DSE7320 MKII will also monitor the mains (utility) supply. The modules include USB, RS232 and RS485 ports as well as dedicated DSENet®
- terminals for system expansion. Both modules are compatible with electronic (CAN) and non-electronic (magnetic pick-up/alternator sensing) engines
- and offer an extensive number of flexible inputs, outputs and extensive engine protections so the system can be easily adapted to meet the most
- demanding industry requirements. The extensive list of features includes enhanced event and performance monitoring, remote communications & PLC
- … (223 dòng nữa trong controllers.md)

### DSE8610 — datasheet của DSE8610 MKII (nhà cung cấp ghi DSE8610: cần xác nhận đời) — supplierId: deep-sea-electronics, n: 1004
- DSEGenset® Data Sheet
- | DSE8610 MKII Synchronising & Load Sharing | Auto
- | Start | Control
- Module
- Part Number: 8610-02
- Overview
- The DSE8610 MKII is a market-leading Synchronising Auto Start Control Module suitable for use in a multi-generator loadshare system, designed to
- synchronise up to 32 generators including electronic and non-electronic engines. The DSE8610 MKII monitors the generator and indicates operational
- status and fault conditions, automatically starting or stopping the engine on load demand or fault conditions.
- System alarms are annunciated on the LCD screen (multiple language options available), illuminated LED and audible sounder. The event log records
- 250 events to facilitate easy maintenance, and an extensive number of fixed and flexible monitoring, metering and protection features are included.
- Designed to offer increased built in support for active sensors for 0 V to 10 V & 4 mA to 20 mA. Comprehensive communication and system expansion
- options are available.
- Using the DSE PC Configuration Suite Software allows easy alteration of the operational sequences, timers and alarms. With all communication ports
- capable of being active at the same time, the DSE8610 MKII is ideal for a wide variety of demanding load share applications. The Advanced PLC tool
- … (238 dòng nữa trong controllers.md)

### HGM9510 — supplierId: smartgen, n: 1003
- GENSET PARALLEL (WITH GENSET) CONTROLLER
- USER MANUAL
- +86-371-67981000 (overseas)
- All rights reserved. No part of this publication may be reproduced in any material form (including
- photocopying or storing in any medium by electronic means or other) without the written permission of
- the copyright holder.
- SmartGen reserves the right to change the contents of this document without prior notice.
- Table 1 Software Version
- | Date | Version
- Contents
- Original release.
- Modify the outside drawing and the main display description;
- Modify some parameters’ default value; Add the description of
- “Power Management Mode” and “Load Shedding Control”.
- | 2016-11-03 | 1.2 | 1. Add timer setting of gas gen-set.
- … (684 dòng nữa trong controllers.md)

### InteliGen — datasheet của InteliGen NT (nhà cung cấp ghi InteliGen: cần xác nhận đời) — supplierId: comap, n: 1004
- InteliGen NT
- Order code: IG-NT GC
- Gen-set controller
- Datasheet
- Product description
- | Comprehensive paralleling gen-set controller | Extendable with ComAp's extension modules
- | Parallel operation up to 32 gen-sets | True RMS (TRMS) is used with Voltage, Current
- | High level control for complex systems | and Power measurement
- | Key features | Application overview
- Load sharing and VAr sharing via CAN
- Virtual shared inputs and outputs via CAN
- Support of wide range of applications
- Single or multiple gen-sets in parallel to mains
- operation with automatic back up function, multiple
- island operation
- … (156 dòng nữa trong controllers.md)

### InteliGen — datasheet của InteliGen NT (nhà cung cấp ghi InteliGen: cần xác nhận đời) — supplierId: comap, n: 1006
- BaseBox
- Order code: IG-NT-BB
- Gen-set Controller
- | Comprehensivegen-set controllerforbothsingle | CompatiblewithComAp's InteliVisiondisplays
- | andmultiplegensets operatinginstandby or | Activee-mail messagingandSMS
- | paralleling modes | Extensive built-in protection functions
- | To be used in conjunction with detachable colour | Standard protections
- displays InteliVision5orInteliVision8
- | Support of engines withECU (Electronic Control | User configurable protection
- | Unit) | ExtendablewithComAp's extensionmodules
- | Completeintegratedgen-set solutionandsignal | Application overview
- sharingviaCAN bus –minimum external
- components needed
- Many communicationoptions –easy remote
- supervising and servicing
- … (168 dòng nữa trong controllers.md)

### InteliGen — datasheet của InteliGen NTC (nhà cung cấp ghi InteliGen: cần xác nhận đời) — supplierId: comap, n: 1005
- InteliGenNTC
- Order code: IG-NTC GC
- Gen-set controller
- Datasheet
- Product description
- | Comprehensive paralleling gen-set controller | Extendable with ComAp's extension modules
- | Parallel operation up to 32 gen-sets | True RMS (TRMS) is used with Voltage, Current
- | High level control for complex systems | and Power measurement
- | Key features | Application overview
- Load sharing and VAr sharing via CAN
- Virtual shared inputs and outputs via CAN
- Support of wide range of applications
- Single or multiple gen-sets in parallel to mains
- operation with automatic back up function, multiple
- island operation
- … (155 dòng nữa trong controllers.md)

### InteliGen — datasheet của InteliGen NTC (nhà cung cấp ghi InteliGen: cần xác nhận đời) — supplierId: comap, n: 1007
- InteliGen NTC
- BaseBox
- Order code: IG-NTC-BB
- Gen-set Controller
- | Product description | Extensive built-in protection functions
- | Comprehensive paralleling gen-set controller | Standard protections
- | Parallel operation up to 32 gen-sets | User configurable protection
- | High level control for complex systems | Extendable with ComAp's extension modules
- | CHP and gas engine controller | Application overview
- Key features
- Extended communication capabilities
- Full Modbus slave support
- GPS and AirGate support and more
- Active e-mail messaging and SMS
- | | InteliGen NTC BaseBox Datasheet | | Related HW ver: 2.0 | | Related SW ver: 3.3.0 | | Date of issue: 5/4/2022
- … (134 dòng nữa trong controllers.md)

### InteliGen — datasheet của InteliGen 500 (nhà cung cấp ghi InteliGen: cần xác nhận đời) — supplierId: comap, n: 1008
- InteliGen 500 G2
- Order code: IG4500XXBAA
- | Controller | for multiple gen-set applications
- Datasheet
- Product description
- | A paralleling controller with 5" colour display for advanced and more | Modbus Client which can initiate Modbus communication and
- | complex diesel gen-set applications, supporting both single and multiple | control 3rd party devices*
- | gen-sets running in grid-tied or island operations. | Built-in PLC interpreter with the use-to-use PLC Editor
- | Key benefits | Remote connection and monitoring
- | Great flexibility and wide range of applications support | AirGate 2.0 for easy connection to your equipment remotely,
- | User-defined protections and setpoints, large PLC interpreter | without worrying about your asset’s IP address
- | and easy extendability using SW key features | WebSupervisor—the cloud-based tool for fleet management
- | Comunication capabilities and protocols | User-defined protections and setpoints on top of default
- | In-built USB host/device, CAN, RS485 and Ethernet ports | parameters
- | Modbus RTU/TCP, SNMP v1, v2c and v3, J1939 | Compatible load/Var sharing and power management with
- … (204 dòng nữa trong controllers.md)

### InteliGen — datasheet của InteliGen 4 (nhà cung cấp ghi InteliGen: cần xác nhận đời) — supplierId: comap, n: 1009
- InteliGen4 200
- Order code: IG4200XXBAA, IG4200XXBLA
- | Controller | for multiple gen-set applications
- Datasheet
- Product description
- | InteliGen4 200 is a diesel gen-set control unit for common paralleling | User-defined protections and setpoints on top of default
- | applications supporting both single and multiple gen-sets running in grid-tied | parameters
- | or island operations. | Compatible load/Var sharing and power management with other
- | Key benefits | ComAp solutions
- | Great flexibility to fit all application needs | Slots for plug-in modules for 4G and GPS, additional Ethernet port,
- | User-defined protections and setpoints, ease-to-use PLC | RS232/485 connection or additional binary inputs/outputs
- | interpreter and plug-in modules for I/O extension | One hardware for more applications, enabling an easy switch
- | Comunication capabilities and protocols | between MINT and SPtM application
- | In-built USB host/device, CAN and RS485 | Possibility to have also mains application in a gen-set
- | Plug-in modules for ethernet and 4G connectivity | controller
- … (184 dòng nữa trong controllers.md)

### InteliGen — datasheet của InteliGen 1000 (nhà cung cấp ghi InteliGen: cần xác nhận đời) — supplierId: comap, n: 1013
- InteliGen
- Order code: IG31000XBBB
- | Datasheet | Gen-set
- controller for complex applications
- | Product description | CAN bus redundancy ensuring that a redundant CAN line
- be created and take over in case of CAN failure*
- | InteliGen 1000 is the most advanced gen-set controller for | Compliant with international grid codes
- multiple gen-sets with paralleling operations, with or without
- | connection to the mains or other source. Intended primarily for | European EN 50549, including national implementations
- | complex applications, this high-end controller will help you | as VDE-AR-N 4110:2018, VDE-AR-N 4105:2018, G99,
- | control and monitor demanding projects with critical | TÖR, American IEEE 1547 and others
- | infrastructures such as data centers, hospitals and banks. | Compatible load/VAr sharing and power management
- with other ComAp solutions
- | Key benefits | Several load transfer options with possibility of less than
- | Great flexibility for the most complex applications | 100 ms load transfer
- … (265 dòng nữa trong controllers.md)

### HGM6110N — supplierId: smartgen, n: 1001: các dòng như ở mục HGM6110

### HGM6120CAN — supplierId: smartgen, n: 1001
- HGM6100N SERIES
- (HGM6110N/6120N/6110NC/6120NC/6110CAN/6120CAN)
- GENSET CONTROLLER
- USER MANUAL
- +86-371-67981000(overseas)
- All rights reserved. No part of this publication may be reproduced in any material form (including
- photocopying or storing in any medium by electronic means or other) without the written permission of
- the copyright holder.
- SmartGen reserves the right to change the contents of this document without prior notice.
- Table 1 – Software Version
- | Date | Version
- Note
- Original Release
- Changed back panel picture of controller;
- Modified Insulation Intensity description.
- … (678 dòng nữa trong controllers.md)

### HGM6110NC — supplierId: smartgen, n: 1001
- HGM6100N SERIES
- (HGM6110N/6120N/6110NC/6120NC/6110CAN/6120CAN)
- GENSET CONTROLLER
- USER MANUAL
- +86-371-67981000(overseas)
- All rights reserved. No part of this publication may be reproduced in any material form (including
- photocopying or storing in any medium by electronic means or other) without the written permission of
- the copyright holder.
- SmartGen reserves the right to change the contents of this document without prior notice.
- Table 1 – Software Version
- | Date | Version
- Note
- Original Release
- Changed back panel picture of controller;
- Modified Insulation Intensity description.
- … (677 dòng nữa trong controllers.md)

### HGM6120 — datasheet của HGM6120N (nhà cung cấp ghi HGM6120: cần xác nhận đời) — supplierId: smartgen, n: 1001
- HGM6100N SERIES
- (HGM6110N/6120N/6110NC/6120NC/6110CAN/6120CAN)
- GENSET CONTROLLER
- USER MANUAL
- +86-371-67981000(overseas)
- All rights reserved. No part of this publication may be reproduced in any material form (including
- photocopying or storing in any medium by electronic means or other) without the written permission of
- the copyright holder.
- SmartGen reserves the right to change the contents of this document without prior notice.
- Table 1 – Software Version
- | Date | Version
- Note
- Original Release
- Changed back panel picture of controller;
- Modified Insulation Intensity description.
- … (680 dòng nữa trong controllers.md)

### HGM6120N — supplierId: smartgen, n: 1001: các dòng như ở mục HGM6120

## Nhà cung cấp khác có dòng ghi cùng động cơ (để chọn suppliers)

### TWD1645GE
- supplierId: sr-genset, n: 2007, đi kèm: S5L1D-E4
  line: | 799 | 639 | 726 | 581 | TWD1645GE | Elec | S5L1D-E4 | TAL-A473-E | SA354-576 | 4100*1710*2200 | 5350*1912*2560
- supplierId: comappower, n: 108, tổ máy: COM770V
  line: | COM770V | 770kVA | 616kW | 700kVA | 560kW | TWD1645GE | 6 | COM770V
- supplierId: victory-generator, n: 111, tổ máy: V616PT
  line: | V616PT | 560 | 700 | 616 | 770 | TWD1645GE | CN III | 144*165 | 6 | 16.12 | 48 | 199 | 3400*1350*2000 | 3800
- supplierId: rcg-power, n: 124, tổ máy: R-V700D5/S, đi kèm: S5L1D-G4
  line: | R-V700D5/S | 700kVA / 560kW | 770kVA / 616kW | 沃尔沃 & TWD1645GE | 斯坦福 & S5L1D-G4 | PDF

### 4006-23TAG2A
- supplierId: fdk-energy, n: 108, tổ máy: P825/H1, đi kèm: Stamford S5L1D-H4
  line: | P825/H1 CONTACT | 825KVA/ 660KW | 750KVA/ 600KW | 4006-23TAG2A | Perkins China | Stamford S5L1D-H4 | Click Here | Download
- supplierId: bobig-power, n: 125, tổ máy: BP821U, đi kèm: BW-LV6D
  line: | BP821U | 597 | 746 | 657 | 821 | 4006-23TAG2A made in UK | 597 | BW-LV6D | 4500*1800*2745 | 5600*2200*2550
- supplierId: dingbo, n: 108, tổ máy: XG-600GF, đi kèm: MX-600-4
  line: | XG-600GF | 600/750 | 660/825 | 4006-23TAG2A | MX-600-4 | 4100x1750x2170 | 5300
- supplierId: eastern-lion-fuan, n: 111, tổ máy: GFS-P833, đi kèm: EL 354H
  line: | GFS-P833 | 600 | 750 | 667 | 833 | 4006-23TAG2A | 368518.1657 | EL 354H | 600 | Smartgen 6120 | Detail

### QSK23-G2
- supplierId: aosif, n: 103, tổ máy: AC810
  line: | AC810 | 750/600 | 810/650 | QSK23-G2 | 151 | 6L | 23 |
- supplierId: mecca-power, n: 134, tổ máy: MC800C
  line: | MC800C | 798 | 638 | 725 | 580 | QSK23-G2 | CN | 151.0 | 6L | 23.2 | ECM | 3880*1502*2200 | 5905
- supplierId: legapower, n: 104, tổ máy: C800
  line: | C800 | 800 | 725 | 151 | QSK23-G2 | 6L | ECM | 23.1 |
- supplierId: huadong-yangzhou, n: 103, tổ máy: HDCP750
  line: | HDCP750 | 750/600 | 825/660 | 1086 | 138 | QSK23-G2 | 720 | 4410×1740×2215 | 6595

### S6R2-PTAA-C
- supplierId: sr-genset, n: 2008, đi kèm: S5L1D-H41
  line: | 825 | 660 | 750 | 600 | S6R2-PTAA-C | S5L1D-H41 | 4080*1715*2000 | 20'GP Container
- supplierId: rcg-power, n: 106, tổ máy: R-SM750D5-S, đi kèm: S5L1D-H4
  line: | R-SM750D5-S | 750kVA / 600kW | 825kVA / 660kW | S6R2-PTAA-C | S5L1D-H4 | PDF
- supplierId: comappower, n: 111, tổ máy: COM825SL
  line: | COM825SL | 825kVA | 660kW | 750kVA | 600kW | S6R2-PTAA-C | CHINA | 6 | COM825SL
- supplierId: ettes-power, n: 159, tổ máy: ES-825
  line: | ES-825 | 600 | 750 | 660 | 825 | S6R2-PTAA-C | 710 | 6.L | TBA | 4080*1715*2000 | 5650 |

### 4006-23TAG3A
- supplierId: bobig-power, n: 125, tổ máy: BP880U, đi kèm: BW-LV6G
  line: | BP880U | 640 | 800 | 704 | 880 | 4006-23TAG3A made in UK | 641 | BW-LV6G | 4500*1800*2745 | 5600*2200*2550
- supplierId: dingbo, n: 108, tổ máy: XG- 640GF, đi kèm: MX-640-4
  line: | XG- 640GF | 640/800 | 704/880 | 4006-23TAG3A | MX-640-4 | 4100x1750x2170 | 5500
- supplierId: eastern-lion-fuan, n: 111, tổ máy: GFS-P889, đi kèm: EL 404C
  line: | GFS-P889 | 640 | 800 | 711 | 889 | 4006-23TAG3A | 377034.9908 | EL 404C | 640 | Smartgen 6120 | Detail
- supplierId: rcg-power, n: 104, tổ máy: R-P800D5-S, đi kèm: TAL-A49-C
  line: | R-P800D5-S | 800kVA / 640kW | 880kVA / 704kW | 4006-23TAG3A | TAL-A49-C | PDF

### S6R2-PTAA
- supplierId: rcg-power, n: 105, tổ máy: R-JM750D5-S, đi kèm: TAL-A49-B
  line: | R-JM750D5-S | 750kVA / 600kW | 825kVA / 660kW | S6R2-PTAA | TAL-A49-B | PDF
- supplierId: comappower, n: 111, tổ máy: COM825SL
  line: | COM825SL | 825kVA | 660kW | 750kVA | 600kW | S6R2-PTAA | JAPAN OR CHINA | 6 | COM825SL
- supplierId: generatordieselchina, n: 127, tổ máy: R-JM750D5/S
  line: | R-JM750D5/S | 660 / 825 | 600 / 750 | S6R2-PTAA | 105.0 / 140.0 | Details →
- supplierId: eastpower-genset, n: 2001, tổ máy: VPD750S5
  line: | VPD750S5 | 750 | 600 | 825 | 660 | S6R2-PTAA | 4080×1715×1985 | 5482

### 2806A-E18TTAG4
- supplierId: sr-genset, n: 2004, đi kèm: S5L1D-F4
  line: | 882.2 | 706.2 | 802 | 642 | 2806A-E18TTAG4 | ECM | S5L1D-F4 | TAL-A473-F | SA354-648 | 5000*2182*2460 | 5400*2260*2500
- supplierId: generatordieselchina, n: 125, tổ máy: R-P700D5/S
  line: | R-P700D5/S | 616 / 770 | 560 / 700 | 2806A-E18TTAG4 | 108.0 / 144.0 | Details →
- supplierId: yunding-jiangsu, n: 2002, tổ máy: YDP-560GF
  line: | YDP-560GF | 560 | 700 | 1008 | 2806A-E18TTAG4 | 6 | 145*183 | 18.1 | 68 | 200 | 4300*1600*2200 | 5000
- supplierId: genlitec, n: 142, đi kèm: Leroy Somer LL7224J
  bảng một model: | Genset Model | FG Wilson P780-1 ; | Prime Power | 700kVA/560kW ; | Standby Power | 780kVA/624kW ; | Frequency | 50Hz ; | Engine | Perkins 2806A-E18TTAG4 ; | Alternator | Leroy Somer LL7224J ; | Fuel Tank Capacity | 1702 Liters ; | Engine Model | Perkins 2806A-E18TTAG4 ; | Bore x Stroke | 145 x 183mm ; | Displacement | 18.1L ; | Voltage | 24V

### 6M33G825/5
- supplierId: rcg-power, n: 112, tổ máy: R-WB750D5-S, đi kèm: TAL-A49-B
  line: | R-WB750D5-S（Stage 2） | 750 kVA / 600 kW | 825 kVA / 660 kW | 6M33G825/5 | TAL-A49-B | PDF
- supplierId: comappower, n: 105, tổ máy: COM825B
  line: | COM825B | 825kVA | 660kW | 600kVA | 750kW | 6M33G825/5 | 6 | COM825B
- supplierId: koten-power, n: 4005, tổ máy: KB750D5
  line: | KB750D5 | 600 | 750 | 660 | 825 | 6M33G825/5 |
- supplierId: westinpower, n: 108, tổ máy: TB825
  line: | TB825 | 825 | 660 | 750 | 600 | 6M33G825/5 | 19.6 | 161.5 | 3700*1360*2085 | 6058*2438*2591

### KTAA19-G6A
- supplierId: comappower, n: 102, tổ máy: COM750C
  line: | COM750C | 750kVA | 600kW | N/A | N/A | KTAA19-G6A | 6 | COM750C
- supplierId: ettes-power, n: 144, tổ máy: ★ EC-750B
  line: | ★ EC-750B | N/A | N/A | 600 | 750 | KTAA19-G6A | 664/890 | 6.L | 19 | 3650*1638*2050 | 5000 |
- supplierId: rise-power, n: 113, tổ máy: RCM600S
  line: | RCM600S | N/A | N/A | 750 | 600 | KTAA19-G6A | 6L | 18.9 | < 142 | 50 | 3525*1550*2030 | 4100 | 5000*1980*2370 | 6800
- supplierId: long-gen, n: 110, tổ máy: LGCS-750, đi kèm: S5L1D-F4
  line: | LGCS-750 | N/A | N/A | 600 | 750 | KTAA19-G6A | S5L1D-F4 | WHI5FS | 3430*1520*2200 | 3600 | 4800*2000*2530 | 6000 | download

### QSK19-G20
- supplierId: voltgent, n: 102, tổ máy: VC825-5-S3
  line: | VC825-5-S3 | 825 | 660 | 750 | 600 | Cummins | QSK19-G20 | [EN] [RU] [ES] [PT]
- supplierId: deman-power, n: 2353, tổ máy: DM825C
  line: DM825C        825kVA         660kW     750kVA       600kW    QSK19-G20  6          Contact  us
  (động cơ QSK19-G20 theo dòng sản phẩm của bản ghi: datasheet tổ máy DM825C một model, chữ trang tách cột nên không dòng nào ghi cả động cơ và công suất; dòng trên là dòng bảng ghi công suất, dùng làm src.line / suppliers[].line)
- supplierId: yunding-jiangsu, n: 2001, tổ máy: YDK-600GF
  line: | YDK-600GF | 600 | 750 | 1080 | QSK19-G20 | 6 | 159*159 | 19 | 84 | 194 | 3800*1950*2300 | 5100
- supplierId: app-power-anpu, n: 5001, tổ máy: APP-600GF
  line: | APP-600GF | 600 | 750 | 660 | 825 | QSK19-G20 |

### DC16 078A 02-43
- supplierId: voltgent, n: 107, tổ máy: VS770-5
  line: | VS770-5 | 770 | 616 | 700 | 560 | Scania | DC 16 078A 02-43 | [EN] [RU] [ES] [PT]
- supplierId: mpmc-powertech, n: 125, tổ máy: MS700-1
  bảng một model: Prime Power: 700kVA/560kW ; Standby Power: 770kVA/616kW ; | Genset Model | MS700-1 ; | Standby Power kVA / kW | 770kVA / 616kW ; | Prime Power kVA / kW | 700kVA / 560kW ; | Engine Model | DC16 078A 02-43 ; | Prime Power (Engine) | 621kW ; | Cylinders / Displacement | 8 / 16.4L ; | Fuel Consumption 100% Load | 138.7 L/H ; | Engine Noise @1m 100% Load | 114dB(A) ; | Dimension L*W*H | 4200×1650×2520 mm ; | Dimension L*W*H | 5800×1822×2522 mm ; | Dimension L*W*H | 5800×2000×2550 mm ; | Dimension L*W*H | 20GP
- supplierId: agg-fuzhou, n: 102, tổ máy: S770E5
  line: | S770E5 | 770/616 | 700/560 | DC16 078A 02-43 | Scania

### 12V1600G11F
- supplierId: agg-fuzhou, n: 108, tổ máy: M825E5
  line: | M825E5 | 825/660 | 750/600 | 12V1600G11F

### 12V2000G26F
- supplierId: mecca-power, n: 5001, tổ máy: MC880M
  line: | MC880M | 640 | 800 | 704 | 880 | 12V2000G26F |
- supplierId: agg-fuzhou, n: 108, tổ máy: M880E5
  line: | M880E5 | 880/704 | 800/640 | 12V2000G26F

## Động cơ khác trong khoảng công suất (40, điểm thấp hơn; mỗi động cơ một dòng)

- QSK23-G3 (Cummins) — supplierId: aosif, n: 103
  line: | AC900 | 810/648 | 900/720 | QSK23-G3 | 161 | 6L | 23 |
- TWD1744GE (Volvo Penta) — supplierId: lees-power, n: 104
  line: | LSV881S3-6 | 881 | 801 | 705 | 641 | TWD1744GE | PDF
- 2806A-E18TTAG5 (Perkins) — supplierId: lees-power, n: 108
  line: | LSP850S3 | 850 | 773 | 680 | 618 | 2806A-E18TTAG5 | PDF
- TWD1653GE (Volvo Penta) — supplierId: vantek-jiangsu, n: 106
  line: | TPD650V5 | 650 | 520 | 715 | 572 | TWD1653GE | 3750×1350×2100 | 4750
- 2806A-E18TAG2 L (Perkins) — supplierId: sr-genset, n: 2004
  line: | 50 | 400 | 520 | 650 | 572 | 715 | Perkins | 2806A-E18TAG2 L | SRGENSET | SAL354F4
- QSK19-G21 (Cummins) — supplierId: yanan-power, n: 101
  line: | YN900C | 900kVA | 720kW | 819kVA | 655kW | QSK19-G21 | 6 | YN900C
- 8M33G1D0/5 (Baudouin) — supplierId: kaihua-genset, n: 119
  line: | HC-BD880-III | 880 | 800 | 8M33G1D0/5 | S6L1D-C41 | 4200*2100*2080 | ISO 20'ft HQ | Download
- India 4006-23TAG3A (Perkins) — supplierId: kaihua-genset, n: 122
  line: | HC-880GF | 880 | 800 | India 4006-23TAG3A | S6L1D-C4 | 3965*1710*2200 | ISO 20'ft GP | Download
- UK 4006-23TAG3A (Perkins) — supplierId: kaihua-genset, n: 122
  line: | HC-880GF | 880 | 800 | UK 4006-23TAG3A | S6L1D-C4 | 3965*1710*2200 | ISO 20'ft GP | Download
- India 4006-23TAG2A (Perkins) — supplierId: kaihua-genset, n: 122
  line: | HC-825GF | 825 | 750 | India 4006-23TAG2A | S5L1D-H1 | 3965*1710*2200 | ISO 20'ft GP | Download
- UK 4006-23TAG2A (Perkins) — supplierId: kaihua-genset, n: 122
  line: | HC-825GF | 825 | 750 | UK 4006-23TAG2A | S5L1D-H1 | 3965*1710*2200 | ISO 20'ft GP | Download
- QSK19-G11X (Cummins) — supplierId: liangzi-yangzhou, n: 109
  line: | LZ-C650 | 650/812.5 | 重庆康明斯 | QSK19-G11X | 6 | 19 | 50 | ≤196 | 3750*1550*2100 | 4600 | 详细参数
- 6M31G825/5 (Baudouin) — supplierId: agg-fuzhou, n: 107
  line: | B825E5 | 825/660 | 750/600 | 6M31G825/5
- 2806C-E18TAG1A (Perkins) — supplierId: xingguang-jiangsu, n: 121
  line: | XG700S3-6 | 700 | - | Perkins | 2806C-E18TAG1A | PDF
- 6M31G900/5 (Baudouin) — supplierId: agg-fuzhou, n: 107
  line: | B880E5 | 880/704 | 800/640 | 6M31G900/5
- QSK19-G4 (Cummins) — supplierId: pengpai-yangzhou, n: 125
  line: | PPDL-C600 | 600/750 | 重庆康明斯 | QSK19-G4 | 6 | 18.9 | 50 | ≤195 | 3700*1550*2100 | 4000
- 6M33G8D3/5 (Baudouin) — supplierId: yanan-power, n: 106
  line: | YN813B | 813kVA | 650kW | 750kVA | 600kW | 6M33G8D3/5 | 6 | YN813B
- QSK19-G34 (Cummins) — supplierId: aosif, n: 102
  line: | AC900 | 819/655 | 900/720 | QSK19-G34 | 171.2 | 6L | 18.9 |
- QSK19-G33 (Cummins) — supplierId: mecca-power, n: 5001
  line: | MC825C | 600 | 750 | 660 | 825 | QSK19-G33 |
- 4006-23TAG2A Switchable (Perkins) — supplierId: sr-genset, n: 2004
  line: | 825 | 660 | 750 | 600 | 4006-23TAG2A Switchable | Elec | S5L1D-E4 | TAL-A473-E | SA354-600 | 4350*1750*2270 | 5400*2260*2500
- K38N (Cummins) — supplierId: penlucky, n: 102
  line: | PLC600G | | 750 | K38N | S5L1D-H4 | | | view
- VAT28-G6 (Cummins) — supplierId: penlucky, n: 102
  line: | PLC825V | 825 | 750 | VAT28-G6 | S5L1D-H4 | 3850*1750*2050 | ISO 20’ft GP | view
- QSK19-G8 (Cummins) — supplierId: agg-fuzhou, n: 105
  line: | CU813E6 | 813/650 | 738/590 | QSK19-G8
- DC16 078A 02-44 (Scania) — supplierId: agg-fuzhou, n: 112
  line: | S800E6 | 800/640 | 728/582 | DC16 078A 02-44
- 2806C-E18TAG3 (Perkins) — supplierId: excel-power-ningde, n: 112
  line: | EP-PE737.5 | 590 | 737.5 | 649 | 822 | 2806C-E18TAG3 | 145.00 | 3450*1200*1980 | 4700*1600*2230 |
- 5006A-E23TAG1 (Perkins) — supplierId: agg-fuzhou, n: 106
  line: | P825E5A | 825/660 | 750/600 | 5006A-E23TAG1
- QSK19-G11 (Cummins) — supplierId: pengpai-yangzhou, n: 125
  line: | PPDL-C650 | 650/812.5 | 重庆康明斯 | QSK19-G11 | 6 | 18.9 | 50 | ≤195 | 3700*1550*2100 | 4500
- 5006A-E23TAG2 (Perkins) — supplierId: agg-fuzhou, n: 106
  line: | P900E5 | 900/720 | 800/640 | 5006A-E23TAG2
- 2806A-E18TTAG4/5 (Perkins) — supplierId: kaihua-genset, n: 105
  line: | KH-640GF | 880 | 704 | 800 | 640 | 2806A-E18TTAG4/5 | 4450x1710x2290 | 5422
- QSK19-G5 (Cummins) — supplierId: jianghao-genset, n: 111
  line: | JHK-600GF | 750 | 600 | QSK19-G5 | 6/L | 159*159 | 19 | 84.4 | 212 | 3500*1500*2000 | 5100
- 2806A-E18TAG2 (Perkins) — supplierId: simpson-power, n: 110
  line: | SP0572D-P | 572/715 | 2806A-E18TAG2 | 3300×1550×2100 | SP0572D-P.pdf
- S6R2-PTA-C (Mitsubishi) — supplierId: simpson-power, n: 113
  line: | SP0600D-L | 600/750 | 菱重 | S6R2-PTA-C | 3805×1557×2146 | SP0600D-L.pdf
- 2806A-E18TAG1A (Perkins) — supplierId: sime-darby-elco-foshan, n: 2010
  line: 600-750 kVA (480-600 kWe)
  (động cơ 2806A-E18TAG1A theo dòng sản phẩm của bản ghi: datasheet tổ máy 2806A-E18TAG1A một model, chữ trang tách cột nên không dòng nào ghi cả động cơ và công suất; dòng trên là dòng bảng ghi công suất, dùng làm src.line / suppliers[].line)
- S6R2-PTA (Mitsubishi) — supplierId: simpson-power, n: 104
  line: | SP0600D-M | 600/750 | S6R2-PTA | 3818×1600×2000 | SP0600D-M.pdf
- S6R-PTA (Mitsubishi) — supplierId: simpson-power, n: 104
  line: | SP0560D-M | 560/700 | S6R-PTA | 3595×1422×2150 | SP0560D-M.pdf
- QSK19-G3 (Cummins) — supplierId: huadong-yangzhou, n: 103
  line: | HDCP650 | 650/520 | 715/572 | 941 | 130 | QSK19-G3 | 634 | 3650×1525×1950 | 4620
- 6M33G6D2/5 (Baudouin) — supplierId: weichai-power, n: 119
  line: | WPG700*7 | 1500 | 700/560 | / | 6M33G6D2/5 | 6 | 150×185 | Electronic control | EPA Tier II
- 5006AC-E23TAG2 (Perkins) — supplierId: mecca-power, n: 5001
  line: | MC900P | 640 | 800 | 720 | 900 | 5006AC-E23TAG2 |
- 5006AC-E23TAG1 (Perkins) — supplierId: mpmc-powertech, n: 111
  bảng một model: Prime Power: 750kVA/600kW ; Standby Power: 825kVA/660kW ; | Genset Model | MP750-1 ; | Standby Power kVA / kW | 825kVA / 660kW ; | Prime Power kVA / kW | 750kVA / 600kW ; | Engine Model | 5006AC-E23TAG1 ; | Prime Power (Engine) | 638kW ; | Cylinders / Displacement | 6 / 22.92L ; | Engine Noise Level @1m 100% Load | 102.9dB(A) ; | Fuel Consumption 100% Load | 155.5 L/H
- DC16 078A 02-45 (Scania) — supplierId: agg-fuzhou, n: 112
  line: | S800E6A | 800/640 | 750/600 | DC16 078A 02-45

## Tiêu đề bảng (header của mỗi bảng supplierId n, dùng được cho sourceQuote)

- dingbo n 108: | Generator Model | PRP KW/KVA | EPS KW/KVA | Engine Model | Alternator Model | Dimension (mm) | Weight (kg)
- fdk-energy n 103: | | Genset Model | Standby Power | Prime Power | Engine Model | Engine Original | Alternator Model | Details | Download PDF
- uleengen n 103: | Genset Model | 50HZ | Diesel Engine | Alternator | Overall Size(mm) | Gross Weight(kg) | Power(kW) | Power(kVA) | Model | Engine brand | Rated Power(kW) | No. of Cylinder | Bore xStroke(mm) | Displacement(L) | Rated Fuel Consumption(L/h) | Model
- koten-power n 4014: | Genset model | Prime kW | Prime kVA | Standby kW | Standby kVA | Engine model | Alternator
- voltgent n 101: | Model | Prime Power (Kva) | Prime Power (kWe) | Standby Power (kVA) | Standby Power (kWe) | Engine Model | Alternator Model | Control Panel
- stone-power n 102: | GENSET MODEL | OUTPUT(kW) | OUTPUT(kVA) | ENGINE | ALTERNATOR | STANDBY | PRIME | STNADBY | PRIME | MITSUBISHI | STAMFORD | MARATHON | WATTEK
- longkai-power n 108: | GENSET MODEL | ESP | PRP | ENGINE TYPE | ALTERNATOR | DIMENSION | DATASHEET | KW | KVA | KW | KVA | Longkai | Leroy Sommer | OPEN TYPE | SILENT TYPE
- kaihua-genset n 119: | HICHAIPOWER Model | Standby kVA | Prime kVA | Engine Model | Alternator Stamford | Dimension mm Open Type | Soundproof Type | Data PDF
- wintpower n 102: | Genset Model | 50HZ PF=0.8 400/230V 3Phase 4Wire | Engine Model | cyl | displacement | Battery Vol. | Max power | Governor | Open Type Dimension | Standby Power | Prime Power | Cons 100% ( L/H ) | KVA/KW | KVA/KW | L | V | KW | | L×W×H ( MM ) | Weight KG
- aosif n 102: | Prime Power | Standby Power | Engine Model | Fuel Consumption | Cylinder | Displacement | KVA/KW | KVA/KW | | L/h
- comappower n 108: | | Genset Model | Standby power | /kw | Prime power | /kw | Engine Model | NO. of Cylinder | Detail Data
- kaihua-genset n 114: | Genset Model | Standby Power | Prime power | Engine model | Dimension | Weight(KG) | KVA | KW | KVA | KW
- ettes-power n 159: | Model | Prime Power | Standby Power | Engine Model | Max Power (kW/Hp) | Cyls.& Type | Dspl. (liters) | Overall Dimmension (mm) | Weight (kg) | PDF D/L | kW | kVa | kW | kVa
- rise-power n 118: | Model | Power (kVA/kW) | Engine Model | Dimension | Weight(kg) | Prime | Standby | Open Type | Open Type
- mecca-power n 5001: | Genset model | Prime kW | Prime kVA | Standby kW | Standby kVA | Engine model | Alternator
- baifa-power n 101: | BAIFA MODEL | POWER | DIESEL ENGINE | ALTERNATOR | Emission | ENGINE MANUFACTURER / COUNTRY | Standby KVA | Prime KVA | Brand | Model | Gov. | STAMFORD | BF-V770-T2 | 770 | 700 | VOLVO | TWD1645GE | EMS2 / ECU | S5L1D-G4 | STAGE II /TIER 2 | SWEDEN | TBA | 836 | 760 | VOLVO | TWD1744GE | ECM4 | S5L1D-H41 | STAGE II /TIER 2 | SWEDEN | BF-C825Q-T2 | 825 | 750 | CUMMINS | QSK23-G8 | | S5L1D-H41 | TIER 2/ CHINA STAGE3 | INDIA | BF-C900Q-T2 | 900 | 810 | QSK23-G9 | | S6L1D-C4 | TIER 2/ CHINA STAGE3 | INDIA | BF-P895-T2 | 895 | 813 | PERKINS | 2806C-E18TTAG6 | | S6L1D-C4 | TIER 2 | USA | BF-P938-T …
- legapower n 109: | Genset Specification 400/230V 50HZ | Engine Soecification | Datasheet | Genset Model | KVA | Cons 100%（L/h） | Engine Model | Cyl | Gov | Displacement(L) | ESP | PRP
- walter-yangzhou n 111: | Genset Model | Standby Power | Prime Power | Engine Model | Dimension(MM)L*W*H | KVA | KW | KVA | KW
- huadong-yangzhou n 106: | 机组型号 | 输出功率（KVA/KW） | 额定电流 (A) | 100% 负载燃油耗 （L/h） | 发动机 | 外形尺寸（mm） L ×W×H | 净重量 （Kg） | 额定功率 | 备用功率 | 型号 | 最大功率 （KW）
- pauway-tianjin n 104: | 发电机组型号 | 主用功率 (kW/kVA) | 备用功率 (kW/kVA) | 发动机型号 | 下载
- xinzhengfa n 107: | 机组型号 | 输出功率 | 额定电流A | 频率/转速 Hz/RPM | 柴油机型号 | 机组外型尺寸(L × B × H)mm | 机组重量Kg | KVA | KW
- sr-genset n 2007: | Standby | Prime | Engine | Alternator | Open Type Dimension | Silent Type Dimension | kVA | kW | kVA | kW | Model | Gov | Stamford | Leroy Somer | SRGENSET
- victory-generator n 111: | Genset Model | Prime Power | Standby Power | Engine model | Emission Standards | Bore*Stroke | CYL | Displacement | Lube | Fuel consumption | Dimension | Weight | KW | KVA | KW | KVA | (mm) | (L) | (L) | g/kw.h | (mm) | (Kg)
- rcg-power n 124: | | 型号 | 主电源 | 备用电源 | 发动机 | 交流发电机 | 下载
- fdk-energy n 108: | | Genset Model | Standby Power | Prime Power | Engine Model | Engine Original | Alternator Model | Details | Download PDF
- bobig-power n 125: | Gensets | Technical Data of Diesel Engine(50hz/1500rpm) | Alternator (50hz/1500rpm) | Size | Model | Gensets power(KW/KVA) | Engine model | Engine power/kw | BOBIG | Open type (MM) | sounproof type (MM) | Prime | Standby | Prime
- eastern-lion-fuan n 111: | | Genset Specification 400/230V 50HZ | Engine | Brushless Alternator | Controller | Datasheet | Model | Prime power (kW) | Prime power (kVA) | Standby power (kW) | Standby power (kVA) | Engine model | Engine power (kW) | Alternator model | Alternator power (kW) | Controller | Datasheet
- aosif n 103: | Prime Power | Standby Power | Engine Model | Fuel Consumption | Cylinder | Displacement | KVA/KW | KVA/KW | | L/h
- mecca-power n 134: | Model | LTP | PRP | Engine | Fuel Cons. | Cylinder | Displacement | Gov. | Dimention | Weight | KVA / KW | KVA/KW | Model | Origin | L/H(100%) | L | L*W*H (MM) | KGS
- legapower n 104: | Genset Specification 400/230V 50HZ | Engine Soecification | Datasheet | Genset Model | KVA | Cons 100%（L/h） | Engine Model | Cyl | Gov | Displacement(L) | ESP | PRP
- huadong-yangzhou n 103: | 机组型号 | 输出功率（KVA/KW） | 额定电流 (A) | 100% 负载燃油耗 （L/h） | 发动机 | 外形尺寸（mm） L ×W×H | 净重量 （Kg） | 额定功率 | 备用功率 | 型号 | 最大功率 （KW）
- sr-genset n 2008: | Standby | Prime | Engine | Alternator | Open Type Dimension | Silent Type Dimension | kVA | kW | kVA | kW | Stamford
- rcg-power n 106: | | Model | Prime Power | Standby Power | Engine | Alternator | Download
- comappower n 111: | | Genset Model | Standby power | /kw | Prime power | /kw | Engine Model | Engine origin | NO. of Cylinder | Detail Data
- rcg-power n 104: | | Model | Prime Power | Standby Power | Engine | Alternator | Download
- rcg-power n 105: | | Model | Prime Power | Standby Power | Engine | Alternator | Download
- generatordieselchina n 127: | | Model | Standby kW / kVA | Prime kW / kVA | Engine Model | Fuel L/h @75% / @100% | View
- eastpower-genset n 2001: | Model | Prime Power (KVA/KW) | Standby Power (KVA/KW) | Engine | Deminsions (MM) | Weight (KG)
- sr-genset n 2004: | Standby | Prime | Engine | Alternator | Open Type Dimension | Silent Type Dimension | kVA | kW | kVA | kW | Model | Gov | Stamford | Leroy Somer | SRGENSET
- generatordieselchina n 125: | | Model | Standby kW / kVA | Prime kW / kVA | Engine Model | Fuel L/h @75% / @100% | View
- yunding-jiangsu n 2002: | 机组型号 Model | 功率Power | 电流 A Current | 发动机型号 Engine model Cyl | 缸数 inder | 缸径 *行程 Bore*Stroke | 排气量L Displacement | 机油容L Lube oil | 油耗g/kw .hConsumption | 尺寸mm Size | 重量Kg Weight | KW | KVA
- rcg-power n 112: | | Model | Prime Power | Standby Power | Engine | Alternator | Download
- comappower n 105: | | Genset Model | Standby power | /kw | Prime power | /kw | Engine Model | NO. of Cylinder | Detail Data
- koten-power n 4005: | Genset model | Prime kW | Prime kVA | Standby kW | Standby kVA | Engine model | Alternator
- westinpower n 108: | Genset Model | Standby Power | Prime Power | Engine Model | Displacement (L) | Fuel Consumption (L/h) | | | | kVA | kW | kVA | kW | | | | L*W*H (mm) | L*W*H (mm)
- comappower n 102: | | Genset Model | Standby power | /kw | Prime power | /kw | Engine Model | NO. of Cylinder | Detail Data
- ettes-power n 144: | Model | Prime Power | Standby Power | Engine Model | Max Power (kW/Hp) | Cyls.& Type | Dspl. (liters) | Overall Dimmension (mm) | Weight (kg) | PDF Download | kW | kVa | kW | kVa
- rise-power n 113: | Model | Prime Power | Standby Power | Engine | Cylinders | Displacement (L) | Fuel Consumption(L/h) | Lube Capacity(L) | Open Version | Soundproofed Version | kVA | kW | kVA | kW | L*W*H(mm) | Weight (kg) | L*W*H(mm) | Weight (kg)
- long-gen n 110: | Model | Prime Power | Standby Power | Engine | Alternator | Dimension& Weight | | KW | kVA | KW | kVA | Cummins | Stamford | Longen | L*M*H(mm) (open) | KG (open) | L*M*H(mm) (silent) | KG (silent) | download
- voltgent n 102: | Genset Model | Standby Power (kVA) | Standby Power (kW) | Prime Power (kVA) | Prime Power (kW) | Engine Brand | Engine Model | Data Sheet
- deman-power n 2353: Genset Model  Standby Power  (kVA/kW)  Prime Power (kVA/kW)  Engine     No. of     Details
- yunding-jiangsu n 2001: | 机组型号 Model | 功率Power | 电流 A Current | 发动机型号 Engine model | 缸数 Cylinder | 缸径*行程 Bore*Stroke D | 排气量 L isplacemen | 机油容量L t Lube oil | 油耗g/kw .h Consumption | 尺寸mm Size | 重量Kg Weight | KW | KVA | 重庆康明斯(国三)系列
- app-power-anpu n 5001: | Genset model | Prime kW | Prime kVA | Standby kW | Standby kVA | Engine model | Alternator
- voltgent n 107: | Genset Model | Standby Power (kVA) | Standby Power (kW) | Prime Power (kVA) | Prime Power (kW) | Engine Brand | Engine Model | Data Sheet
- agg-fuzhou n 102: | | 发电机型号 | ESP (kVA/kW) | PRP (kVA/kW) | 发动机型号 | 品牌
- agg-fuzhou n 108: | | 发电机型号 | ESP (kVA/kW) | PRP (kVA/kW) | 发动机型号
- lees-power n 104: | Model | Standby KVA | Prime KVA | Standby KW | Prime KW | Engine | Specifications
- lees-power n 108: | Model | Standby KVA | Prime KVA | Standby KW | Prime KW | Engine | Specifications
- vantek-jiangsu n 106: | 型号 | 额定功率 (KVA/KW) | 备用功率 (KVA/KW) | 柴油机型号 | 机组尺寸 (MM) | 重量 (KG)
- yanan-power n 101: | Genset Model | Standby power | Prime power | Engine Model | NO. of Cylinder | Detail Data
- kaihua-genset n 122: | HICHAIPOWER Model | Standby kVA | Prime kVA | Engine Model | Alternator Stamford | Dimension mm Open Type | Dimension mm Soundproof Type | Data PDF
- liangzi-yangzhou n 109: | 机组型号 | 输出功率 (KW/KVA) | 柴油机品牌 | 柴油机型号 | 缸数 | 排量(L) | 润滑油容量(L) | 燃油消耗 (g/kw.h) | 外形尺寸(L×W×H) | 机组重量 (KG) | 详细
- agg-fuzhou n 107: | | 发电机型号 | ESP (kVA/kW) | PRP (kVA/kW) | 发动机型号
- xingguang-jiangsu n 121: | GensetModel | Power（kVA） | EngineBrand | EngineModel | Specifications | Standby | Prime
- pengpai-yangzhou n 125: | | 机组型号 | 输出功率 (KW/KVA) | 柴油机品牌 | 柴油机型号 | 缸数 | 排量 (L) | 润滑油容量(L) | 燃油消耗 (g/kw.h) | 外形尺寸(L×W×H) | 机组重量(KG)
- yanan-power n 106: | Genset Model | Standby power | Prime power | Engine Model | NO.of Cylinder | Detail Data
- penlucky n 102: | | Penlucky Model | Standby kVA | Prime kVA | Engine Model | Alternator Stamford | Dimension mm Open Type | Soundproof Type | Data PDF
- agg-fuzhou n 105: | | 发电机型号 | ESP (kVA/kW) | PRP (kVA/kW) | 发动机型号
- agg-fuzhou n 112: | | 发电机型号 | ESP (kVA/kW) | PRP (kVA/kW) | 发动机型号
- excel-power-ningde n 112: | Genset Model | 50Hz,400/230V,3-Phase | Engine Model | Fuel consumption (L/h) 100% | Dimension | Download | Prime Power (KW/KVA) | Standby Power (KW/KVA) | OPEN | SILENT
- agg-fuzhou n 106: | | 发电机型号 | ESP (kVA/kW) | PRP (kVA/kW) | 发动机型号
- kaihua-genset n 105: | Gerset Model | Standby Power | Prime Power | Engine Model | Dimension(mm) | Weight (KG) | KVA | KW | KVA | KW
- jianghao-genset n 111: | Model | Output KVA | Power KW | Engine model | Cylinder NO. | Bore*Stroke mm | displace - ment (L) | Lubricating Capacity (L) | Fuel Consumption g/kw.h | Dimension (L×W×H) mm | Weight (kg)
- simpson-power n 110: | 机组型号 | 备用功率 ( kW/kVA) | 发动机型号 | 机组尺寸 (mm) ( 长×宽×高) | 机组数据
- simpson-power n 113: | 机组型号 | 备用功率 ( kW/kVA) | 发动机品牌 | 发动机型号 | 机组尺寸 (mm) ( 长 × 宽 × 高 ) | 机组数据
- sime-darby-elco-foshan n 2010: 2806A-E18TAG1A
- simpson-power n 104: | 机组型号 | 备用功率 ( kW/kVA) | 发动机品牌 | 发动机型号 | 机组尺寸 (mm) ( 长 × 宽 × 高 ) | 机组数据
- weichai-power n 119: | Genset Model | Rated speed (rpm) | Standby Power (kVA/kW) | Prime Power (kVA/kW) | Baudouin Engine Model | Cylinders | Bore × Stroke (mm) | Governing System | Emission standard

## Bộ điều khiển (42) — của các nhà cung cấp có dòng ở trên, dòng nguyên văn trên trang của họ

### DSE7320 — hãng: Deep Sea — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: aosif, n: 1067
  line: | Control module | Deepsea 7320
- supplierId: bobig-power, n: 101
  line: Standard AMF control panel, including digital LED genset control model: HGM6120U, DSE7320, DSE6020, AMF20, AMF25
- supplierId: fdk-energy, n: 3001
  line: | CMS1375KVA-50Hz-R-2018-175 GET A QUOTE NOW | Cummins KTA50-G3 | 1375KVA/1100KW 1250KVA/1000KW | Year: 2018 | Stamford | 400V 50Hz/1500rpm | DSE7320 Three Phase | Open Good Used | Details
- supplierId: generatordieselchina, n: 101
  line: This model is rated 2000 kW Prime / 2200 kW Standby at 50Hz (1500 rpm), with a Stamford / Leroy-Somer alternator and DSE7320 controller. Key differences below.
- supplierId: jiuan-power, n: 101
  line: Separate insulated control compartment inside container pre-installed Deepsea DSE7320 LCD controller (Smartgen/ComAp optional) with bilingual English-Chinese screen, real-time monitoring of voltage,
- supplierId: kaihua-genset, n: 3002
  line: HGM9510 Deepsea 7320
- supplierId: rise-power, n: 3001
  line: DSE7320 Auto Mains (Utility) Failure Controller (Communications and Expansion)
- supplierId: stone-power, n: 103
  line: | Control System | DSE6020 / DSE7320

### DSE8610 — hãng: Deep Sea — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: fdk-energy, n: 3002
  line: | CMS2200KVA-50Hz-R-2014-15 GET A QUOTE NOW | Cummins UK QSK60-G4 | 2200KVA/1800KW 2000KVA/1600KW | Hours: 1200 Year: 2014 | Stamford P I734F1 | 400V 50Hz/1500rpm | DSE8610 Three Phase | Open Good Used | Details
- supplierId: generatordieselchina, n: 127
  line: or Leroy-Somer TAL/LSA), enclosure (open skid, soundproof canopy or containerized) and controller options ( Deep Sea DSE 8610 or DSE 7320 standard; ComAp and SmartGen optional) also affect the final price. Tell us the required kW, voltage and
- supplierId: kaihua-genset, n: 3001
  line: To enhance operational convenience and monitoring capabilities, each base station is equipped with the Deep Sea 8610 controller along with the remote 890 module. This integrated control system serves as the "brain" of the power unit,
- supplierId: rise-power, n: 3001
  line: DSE8610 Auto Start Load Share Controller (multi-generator synchronization system)
- supplierId: uleengen, n: 3
  line: Deepsea DSE7320, DSE7420, DSE6120, DSE6020, DSE8610
- supplierId: westinpower, n: 3001
  line: The generator set equipped in the data center applies TC QSK60-G21 engine, DSE8610 synchronizing & load sharing control module, and DSE8004 graphical remote overview display.

### DSE6120 — hãng: Deep Sea — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: aosif, n: 1001
  line: | Control module | Deepsea 6120
- supplierId: bobig-power, n: 113
  line: Weichai 800KW 1000kVA Power Diesel Generator Prime Power Silent Diesel Generator Set 50Hz 230V with DSE6120 Control Panel Standby ISO CE
- supplierId: jiuan-power, n: 111
  line: practice. Each CDS55KVA is constructed as an ISO8528 certified genset — the SDEC 4ZT3.5-G21 engine, Deepsea DSE6120 controller, and single-bearing full-copper alternator are matched by specification and sequentially load-aged at 25%,
- supplierId: kaihua-genset, n: 107
  line: 3.DSE6120, Smartgen control system
- supplierId: longkai-power, n: 1001
  line: | Model | DSE6120MK3
- supplierId: uleengen, n: 1
  line: | Control panel | digital AMF Control panel with protection function, with controller Smartgen HGM6120, Deepsea DSE7320, DSE6120
- supplierId: voltgent, n: 1007
  line: | CONTROL | MODULE Deep Sea DSE6120

### HGM6110 — hãng: SmartGen — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: bobig-power, n: 111
  line: LCD Digital Display, Deepsea, ComAp, Deepsea / ComAp / Harsen / Smartgen 6110, Smartgen
- supplierId: dingbo, n: 3001
  line: 300KW silent diesel generator set with Cummins engine NTA855-G2A, Marathon MP-300-4A three phase generator and SmartGen 6110 automatic control module.
- supplierId: stone-power, n: 121
  line: | Control System: | Smartgen 6110 | Frequency: | 50HZ/1500rpm
- supplierId: uleengen, n: 3
  line: | Controller | Smartgen HGM6120, HGM6110, HGM9510

### DSE6020 — hãng: Deep Sea — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: bobig-power, n: 101
  line: Standard AMF control panel, including digital LED genset control model: HGM6120U, DSE7320, DSE6020, AMF20, AMF25
- supplierId: kaihua-genset, n: 105
  line: 3.DSE6020, Smartgen control system
- supplierId: stone-power, n: 103
  line: | Control System | DSE6020 / DSE7320
- supplierId: uleengen, n: 3
  line: Deepsea DSE7320, DSE7420, DSE6120, DSE6020, DSE8610
- supplierId: victory-generator, n: 114
  line: 2. Mounted intelligent European Brand Deepsea DSE6020 control panel with Auto

### HGM6120N — hãng: SmartGen — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: jiuan-power, n: 129
  line: Operational automation is spearheaded by an intelligent digital AMF control panel (standard with SmartGen HGM6120N or Deep Sea DSE6120 ). Designed for seamless single-unit emergency standby and utility monitoring, the module
- supplierId: koten-power, n: 101
  line: Standard Smartgen HGM6120N control moduel with AMF function, Optional for Deepsea, ComAp, Datakom,Deif ect.

### AMF25 — hãng: ComAp — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: bobig-power, n: 3003
  line: | Controller | Smartgen,Deepsea,Comap AMF20,AMF25
- supplierId: wintpower, n: 109
  line: | Control Panel- ComAp AMF25

### HGM6120 — hãng: SmartGen — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: eastern-lion-fuan, n: 107
  line: Controller Smartgen 6120
- supplierId: jiuan-power, n: 123
  line: voltage (±1% steady-state error) and THD below 5%. This 275KVA Perkins generator adopts Deep Sea DSE7320 or SmartGen HGM6120 controllers to monitor phase voltage, current, frequency, power factor, oil pressure, coolant temperature and runtime.
- supplierId: uleengen, n: 1
  line: | Control panel | digital AMF Control panel with protection function, with controller Smartgen HGM6120, Deepsea DSE7320, DSE6120
- supplierId: victory-generator, n: 101
  line: 2. Mounted intelligent famous Brand Smartgen HGM6120 control panel with Auto

### DSE4520 — hãng: Deep Sea — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: bobig-power, n: 124
  line: Standard AMF control panel, including digital LED genset control model: HGM6120U, DSE4520, DSE6120, AMF8,AMF25
- supplierId: generatordieselchina, n: 115
  line: This model is rated 150 kW Prime / 165 kW Standby at 50Hz (1500 rpm), with a Stamford / Leroy-Somer alternator and DSE4520 controller. Key differences below.

### AMF20 — hãng: ComAp — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: bobig-power, n: 3003
  line: | Controller | Smartgen,Deepsea,Comap AMF20,AMF25
- supplierId: victory-generator, n: 104
  line: 2. Mounted intelligent European Brand ComAp AMF20 control panel with Auto

### DSE3110 — hãng: Deep Sea — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: fdk-energy, n: 3002
  line: | CMS220KVA-50Hz-R-2011-116 GET A QUOTE NOW | Cummins 6CTA8.3-G2 | 220KVA/176KW 200KVA/160KW | Year: 2011 | EGGA | 400V 50Hz/1500rpm | DSE3110 | Soundproof Good Used | Details

### DSE7420 — hãng: Deep Sea — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: uleengen, n: 3
  line: Deepsea DSE7320, DSE7420, DSE6120, DSE6020, DSE8610
- supplierId: voltgent, n: 101
  line: | P900-1 | 800 | 640 | 900 | 720 | 4006-23TAG3A | FGL70030 | DSE7420

### HGM9510 — hãng: SmartGen — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: fdk-energy, n: 3002
  line: | CMS1875KVA-60Hz-R-25 GET A QUOTE NOW | Cummins KTTA50-G2 | 1875KVA/1500KW 1750KVA/1400KW | Hours: 10 Year: 1998 | Stamford | 400V 60Hz/1800rpm | SmartGen HGM9510 Three Phase | Soundproof Good Used | Details
- supplierId: kaihua-genset, n: 3002
  line: HGM7120UC HGM9510
- supplierId: uleengen, n: 3
  line: | Controller | Smartgen HGM6120, HGM6110, HGM9510

### DSE8620 — hãng: Deep Sea — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: ettes-power, n: 1
  line: The gensets run as standby-emergency power, by synchronizing to mains grid with two ACB & Deepsea 8620 control modules, supplying non-stop...

### HGM6110N — hãng: SmartGen — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: fdk-energy, n: 3002
  line: | MTU1100KVA-50Hz-R-2000-12 GET A QUOTE NOW | MTU 16V2000G23 | 1100KVA/880KW 1000KVA/800KW | Hours: 100 Year: 2000 | Siemens MD-840/50 | 400V 50Hz/1500rpm | SmartGen HGM6110N Three Phase | Open Good Used | Details
- supplierId: koten-power, n: 1002
  line: | Control Panel | Smartgen HGM6110N

### DSE4620 — hãng: Deep Sea — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: generatordieselchina, n: 114
  line: This model is rated 160 kW Prime / 176 kW Standby at 50Hz (1500 rpm), with a Stamford / Leroy-Somer alternator and DSE4620 controller. Key differences below.
- supplierId: wintpower, n: 101
  line: | Control Panel -DEEPSEA4620

### DSE6120 MKII — hãng: Deep Sea
- supplierId: bobig-power, n: 122
  line: Automatically transfers between mains (utility) and generator (DSE6120 MKIII only) for convenience
- supplierId: kaihua-genset, n: 108
  line: 3.DSE6120MKII, Smartgen control system 6.Battery and battery switch

### HGM6120CAN — hãng: SmartGen — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: fdk-energy, n: 3002
  line: | SC413KVA-50Hz-R-2020-165 GET A QUOTE NOW | Shangchai SDEC SC12E460D2 | 413KVA/330KW 375KVA/300KW | Year: 2020 | Faraday FD4L1-4 | 400V 50Hz/1500rpm | HGM6120CAN Three Phase | Open Good Used | Details
- supplierId: jiuan-power, n: 131
  line: diesel engine, coupled with a genuine brushless Stamford S4L1D-G41 alternator. Automated by the intelligent SmartGen HGM6120CAN digital AMF controller with J1939 CANbus engine telemetry. Designed for mission-critical standby power backup and

### InteliGen — hãng: ComAp — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: comappower, n: 3001
  line: Integrarea inteligenței artificiale : Platformele folosesc AI pentru a oferi recomandări personalizate, jucătorii fiind ghidați către jocurile care se potrivesc cel mai bine stilului lor.
- supplierId: fdk-energy, n: 3002
  line: | PKS2200KVA-50Hz-R-2013-23 GET A QUOTE NOW | Perkins UK 4016TAG2A | 2200KVA/1800KW 2000KVA/1600KW | Hours: 10 Year: 2013 | Siements(CHINA) JFG5605-4/10500 | 10.5 KV 50Hz/1500rpm | ComAP InteliGen Three Phase | Open Good Used | Details
- supplierId: kaihua-genset, n: 3002
  line: IL-NT AMF InteliGen-NTC

### DSE6110 — hãng: Deep Sea — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: rise-power, n: 3001
  line: DSE6110 Auto Start Controller with basic protection

### HGM6120U — hãng: SmartGen — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: bobig-power, n: 101
  line: Standard AMF control panel, including digital LED genset control model: HGM6120U, DSE7320, DSE6020, AMF20, AMF25

### DSE7410 — hãng: Deep Sea — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: voltgent, n: 101
  line: | P250-5 | 230 | 184 | 250 | 200 | 1506A-E88TAG2 | LL5114H | DSE7410

### DSE7220 — hãng: Deep Sea — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: jiuan-power, n: 109
  line: Factory-fitted Deepsea7220 LCD controller (Smartgen/ComAp optional) with bilingual English-Chinese display, real-time monitoring of voltage,

### HGM6110NC — hãng: SmartGen — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: fdk-energy, n: 3002
  line: | CMS350KVA-50Hz-R-2021-159 GET A QUOTE NOW | Cummins NTA855-G1B | 344KVA/275KW 312KVA/250KW | Hours: 0 Year: 2021 | Faraday FD4M1-4 | 400V 50Hz/1500rpm | HGM6110NC Three Phase | Open Original Unused | Details

### HGM6120UC — hãng: SmartGen — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: kaihua-genset, n: 3002
  line: IC-NT-MINT-2013 HGM6120UC

### AGC — hãng: DEIF
- supplierId: mpmc-powertech, n: 2003
  line: Multi-unit parallel operation with intelligent load sharing, managed through DSE or DEIF AGC controllers, gives the plant N+X redundancy with master-standby rotation rather than a single point of failure.

### DKG-309 — hãng: Datakom
- supplierId: wintpower, n: 2
  line: high voltage generator , dkg309 ,

### DSE8004 — hãng: Deep Sea
- supplierId: westinpower, n: 3001
  line: The generator set equipped in the data center applies TC QSK60-G21 engine, DSE8610 synchronizing & load sharing control module, and DSE8004 graphical remote overview display.

### easYgen-1800 — hãng: Woodward
- supplierId: westinpower, n: 1032
  line: |  | easYgen-1800 only: For Mains,

### HGM6120CAN-4G — hãng: SmartGen
- supplierId: jiuan-power, n: 133
  line: brushless alternators—the genuine Leroy-Somer TAL-A473-E or Stamford S5L1D-E41. Fully orchestrated by the SmartGen HGM6120CAN-4G digital AMF controller with integrated 4G IoT cloud telemetry and ECU direct CANbus communication. Engineered for

### HGM7120UC — hãng: SmartGen
- supplierId: kaihua-genset, n: 3002
  line: HGM6120UC HGM7120UC

### HGM9510N — hãng: SmartGen
- supplierId: jiuan-power, n: 135
  line: and coupled with a genuine brushless Stamford S6L1D-C41 alternator. Fully integrated with an intelligent SmartGen HGM9510N digital paralleling and load-sharing control system. Engineered for continuous industrial prime power and critical

### IG200 — hãng: ComAp
- supplierId: sr-genset, n: 2001
  line: ComAp IG200 + Electrical breaker

### Deep Sea (không ghi model) — hãng: Deep Sea
- supplierId: deman-power, n: 2001
  line: | Control System | Deep Sea, Smartgen, ComAp, Xingnuo, Shuangling
- supplierId: dingbo, n: 1
  line: Deep Sea Controller Cabinet
- supplierId: eastpower-genset, n: 2001
  line: Controller: Smartgen, Comap, Deep Sea Etc.
- supplierId: jianghao-genset, n: 3
  line: 发货配置：500KW斯太尔发动机配全铜发电机，江豪定制型不锈钢四轮移动拖车，配深海液晶自启动控制屏。江豪发电机组为您提供柴油发…… 更多
- supplierId: koten-power, n: 102
  line: 3- Controller optional: Smartgen/Deepsea/ComAp.
- supplierId: mecca-power, n: 112
  line: 2.Equipped with generator set control system, ATS system, remote control system, parallel operation system, optional control model, Deep sea, Smartgen , ComAp ,ect.
- supplierId: mpmc-powertech, n: 2003
  line: Multi-unit parallel operation with intelligent load sharing, managed through DSE or DEIF AGC controllers, gives the plant N+X redundancy with master-standby rotation rather than a single point of failure.
- supplierId: penlucky, n: 2
  line: BAUDOUIN and MITSUBISHI engines and world famous STAMFORD, Leroy Somer and Mecc Alte alternator. We also use WoodWard, Deep Sea and ComAp control module which are professional engine controllers as our core control module. Also we own abundant

### ComAp (không ghi model) — hãng: ComAp
- supplierId: deman-power, n: 2001
  line: | Control System | Deep Sea, Smartgen, ComAp, Xingnuo, Shuangling
- supplierId: eastpower-genset, n: 2001
  line: Controller: Smartgen, Comap, Deep Sea Etc.
- supplierId: ettes-power, n: 101
  line: • Control System: Deepsea, ComAp or DEIF
- supplierId: generatordieselchina, n: 125
  line: the industrial 4000 Series (1,800kW). Every genset is paired with a Stamford or Leroy-Somer alternator and Deep Sea / ComAp controller — assembled and load-tested at our manufacturing facility in Jiangsu, China per ISO 8528 standards.
- supplierId: jiuan-power, n: 101
  line: Separate insulated control compartment inside container pre-installed Deepsea DSE7320 LCD controller (Smartgen/ComAp optional) with bilingual English-Chinese screen, real-time monitoring of voltage, current, coolant/oil temp, oil
- supplierId: koten-power, n: 102
  line: 3- Controller optional: Smartgen/Deepsea/ComAp.
- supplierId: mecca-power, n: 112
  line: 2.Equipped with generator set control system, ATS system, remote control system, parallel operation system, optional control model, Deep sea, Smartgen , ComAp ,ect.
- supplierId: penlucky, n: 2
  line: MITSUBISHI engines and world famous STAMFORD, Leroy Somer and Mecc Alte alternator. We also use WoodWard, Deep Sea and ComAp control module which are professional engine controllers as our core control module. Also we own abundant skills for

### SmartGen (không ghi model) — hãng: SmartGen
- supplierId: deman-power, n: 2001
  line: | Control System | Deep Sea, Smartgen, ComAp, Xingnuo, Shuangling
- supplierId: eastpower-genset, n: 2001
  line: Controller: Smartgen, Comap, Deep Sea Etc.
- supplierId: generatordieselchina, n: 125
  line: — open skid, soundproof canopy or containerized enclosure, Stamford or Leroy-Somer alternator, Deep Sea, ComAp or SmartGen controller, and options such as ATS. Tell us the required kW, voltage and destination country and we will quote the
- supplierId: mecca-power, n: 112
  line: 2.Equipped with generator set control system, ATS system, remote control system, parallel operation system, optional control model, Deep sea, Smartgen , ComAp ,ect.
- supplierId: rcg-power, n: 2001
  line: Smartgen
- supplierId: wintpower, n: 101
  line: Hinsulation class. 3. Standard 50ºC radiator with safety guard, engine driven fan mounted on skid 4. DEEPSEA, COMAP, SMARTGEN controller brand with Auto/Manual start and AMF function 5. DELIXI, CHINT or ABB branded MCCB circuit breaker mounted.
- supplierId: xingguang-jiangsu, n: 2002
  line: Over the years, Xingguang has maintained close cooperation with Jiangsu University, Changzhou University, and Yangzhou University, while also collaborating with world-renowned engine manufacturers such as Shangchai, Weichai, Cummins, MTU Benz, DAEWO Daewoo Heavy Industries, UK's Perkins, Guangxi Yuchai, Sweden's Volvo, as well as generator manufacturers like Delco, LS Lilei Senma, Stamford, and Marathon, and controller manufacturers like Zhongzhi and Deep Sea. It has become an (OEM) supporting factory and technology center, establishing long-term and stable strategic partnerships with them.
- supplierId: yunding-jiangsu, n: 2001
  line: 控制系统采用英国深海、捷克科迈、郑州众智、上海孚创等知名品牌

### DEIF (không ghi model) — hãng: DEIF
- supplierId: ettes-power, n: 101
  line: • Control System: Deepsea, ComAp or DEIF
- supplierId: mecca-power, n: 159
  line: We can offer controller brand like Deepsea,Smartgen,DEIF,MECCA,etc.
- supplierId: rcg-power, n: 2001
  line: DEIF
- supplierId: uleengen, n: 2
  line: it covers Auto start control panel, Synchronization panels, ATS etc. With controller such as Deepsea, Smartgen, ComAp, Deif, Harsen, etc.
- supplierId: westinpower, n: 108
  line: Hybrid power support: generator controller in the micro-grid system and DEIF ASC-4 controller (PV and Battery).

### Mebay (không ghi model) — hãng: Mebay
- supplierId: eastern-lion-fuan, n: 127
  line: Controller Mebay 6120
- supplierId: yunding-jiangsu, n: 2001
  line: 控制系统采用英国深海、捷克科迈、郑州众智、上海孚创等知名品牌

### Harsen (không ghi model) — hãng: Harsen
- supplierId: bobig-power, n: 3002
  line: | Control Panel | LCD Digital Display, Deepsea, ComAp, Deepsea / ComAp / Harsen / Smartgen 6110, Smartgen
- supplierId: stone-power, n: 102
  line: 2000KW 2500KVA Diesel Generator Set Deepsea Harsen Smartgen Control Panel
- supplierId: uleengen, n: 2
  line: Auto start control panel, Synchronization panels, ATS etc. With controller such as Deepsea, Smartgen, ComAp, Deif, Harsen, etc.

### Woodward (không ghi model) — hãng: Woodward
- supplierId: ettes-power, n: 102
  line: • Adopting highly intelligent gas control system of USA Woodward EGS, Germany Heinzmann or Motortech, the air fuel ratio can be automatically adjusted as per fluctuation of gas components.
- supplierId: penlucky, n: 2
  line: PERKINS, BAUDOUIN and MITSUBISHI engines and world famous STAMFORD, Leroy Somer and Mecc Alte alternator. We also use WoodWard, Deep Sea and ComAp control module which are professional engine controllers as our core control module. Also we own

### Shuangling (không ghi model) — hãng: Shuangling
- supplierId: deman-power, n: 2001
  line: | Control System | Deep Sea, Smartgen, ComAp, Xingnuo, Shuangling

### Xingnuo (không ghi model) — hãng: Xingnuo
- supplierId: deman-power, n: 2001
  line: | Control System | Deep Sea, Smartgen, ComAp, Xingnuo, Shuangling


# Nhà cung cấp trong hệ thống (CSDL supplier/<id>)

- agg-fuzhou: 福州德塔电源技术有限公司 — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.aggpower.cn/, trụ sở: Fuzhou, Fujian
- aosif: Xiamen AOSIF Engineering Ltd — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.aosif.com/, trụ sở: Xiamen, Fujian, thành lập: 2001, bộ điều khiển: DSE6120; DSE7320
- app-power-anpu: Anpu Heavy Industry (Shandong) Co., Ltd. — vai trò: genset_oem, trạng thái: partial, độ tin cậy: medium, quốc gia: CN, website: https://www.appfdj.com/, trụ sở: Weifang, Shandong
- baifa-power: Baifa Power (百发动力) — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.baifapower.cn/
- bobig-power: FUJIAN BOBIG ELECTRIC MACHINERY CO.,LTD — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.bobigpower.com/, trụ sở: Fujian, bộ điều khiển: AMF20; AMF25; DSE4520; DSE6020; DSE6120; DSE6120 MKII; DSE7320; Harsen (không ghi model); HGM6110; HGM6120U
- comappower: FUJIAN COMAPPOWER NEW ENERGY CO.,LTD — vai trò: genset_oem, trạng thái: partial, độ tin cậy: medium, quốc gia: CN, website: https://comappower.com/, trụ sở: Fujian, chứng nhận: ISO9001-2000; CE, bộ điều khiển: InteliGen
- deman-power: WeiFang Deman Power Technology Co., LTD. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.demanpower.com/, trụ sở: Weifang, Shandong, thành lập: 2014, bộ điều khiển: Deep Sea (không ghi model); SmartGen (không ghi model); ComAp (không ghi model); Xingnuo (không ghi model); Shuangling (không ghi model)
- dingbo: Guangxi Dingbo Generator Set Manufacturing Co., Ltd. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.dieselgeneratortech.com/, trụ sở: Nanning, Guangxi, thành lập: 2006, chứng nhận: CE; ISO9001; ISO14001; CQC; ISO9001-2015; ISO14001:2015, bộ điều khiển: Deep Sea (không ghi model); HGM6110
- eastern-lion-fuan: Fuan EASTERNLION Electric Machines Co., Ltd — vai trò: alternator_maker, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://easternlion.net/, trụ sở: Fuan, Fujian, bộ điều khiển: Mebay (không ghi model); HGM6120
- eastpower-genset: Yangzhou East Power Equipment Co., Ltd — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.eastpowergenset.com/, trụ sở: Yangzhou, Jiangsu, bộ điều khiển: SmartGen (không ghi model); ComAp (không ghi model); Deep Sea (không ghi model)
- ettes-power: Ettes Power — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.ettesgenerator.com/, thành lập: 1998, chứng nhận: ISO9001:2008; ISO14001; CE, bộ điều khiển: ComAp (không ghi model); DSE8620; DEIF (không ghi model); Woodward (không ghi model)
- excel-power-ningde: NINGDE EXCEL POWER CO.,LTD. — vai trò: genset_oem, trạng thái: partial, độ tin cậy: medium, quốc gia: CN, website: https://www.fjexcel.com/, trụ sở: Fuan, Fujian, chứng nhận: ISO9001; CE
- fdk-energy: Guangdong FuDianKang (FDK) Diesel Generator — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://fdkenergy.com/, trụ sở: Guangzhou, Guangdong, thành lập: 2000, chứng nhận: ISO9001; ISO45001; CE, bộ điều khiển: InteliGen; DSE3110; DSE7320; DSE8610; HGM6110N; HGM6110NC; HGM6120CAN; HGM9510
- gb-power: GB POWER CO.,LTD — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.gbpower.net/, trụ sở: Shanghai, Shanghai, chứng nhận: ISO9001; CE
- generatordieselchina: Fuzhou H&C imp&exp Co., Ltd — vai trò: genset_oem, trạng thái: verified, độ tin cậy: low, quốc gia: CN, website: https://generatordieselchina.com/, trụ sở: Fuzhou, Fujian, chứng nhận: ISO 9001; ISO 14001; CE, bộ điều khiển: ComAp (không ghi model); DSE4520; DSE4620; DSE7320; DSE8610; SmartGen (không ghi model)
- genlitec: Genlitec (Fuzhou) Power Equipment Co., Ltd. — vai trò: genset_oem, trạng thái: partial, độ tin cậy: medium, quốc gia: CN, website: https://www.genlitecpower.com
- huadong-yangzhou: 扬州市华东动力机械有限公司 — vai trò: genset_oem, trạng thái: partial, độ tin cậy: medium, quốc gia: CN, website: http://www.yzhddl.com/, trụ sở: Yangzhou, Jiangsu
- jianghao-genset: Jiangsu Jianghao Generator Co.,Ltd. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: http://www.jhgensets.com/, trụ sở: Jiangsu, chứng nhận: ISO9001：2008, bộ điều khiển: Deep Sea (không ghi model)
- jiuan-power: Guangzhou JIUAN Mechanical and Electrical Co.,LTD — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.jiuangenerator.com/, trụ sở: Guangzhou, Guangdong, thành lập: 2008, chứng nhận: CE; ISO; BV; SASO, bộ điều khiển: ComAp (không ghi model); DSE6120; DSE7220; DSE7320; HGM6120; HGM6120CAN; HGM6120CAN-4G; HGM6120N; HGM9510N
- kaihua-genset: Taizhou Kaihua Diesel Generator Sets Co., Ltd. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.kaihuagenset.com/, trụ sở: Taizhou, Jiangsu, thành lập: 2003, chứng nhận: ISO9001; CE; CCS; BV, bộ điều khiển: InteliGen; DSE6020; DSE6120; DSE6120 MKII; DSE7320; DSE8610; HGM6120UC; HGM7120UC; HGM9510
- koten-power: Fuzhou Koten Power Equipment Co.,Ltd. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.kotenpower.com/, trụ sở: Fuzhou, Fujian, chứng nhận: ISO9001; ISO14001, bộ điều khiển: ComAp (không ghi model); Deep Sea (không ghi model); HGM6110N; HGM6120N
- lees-power: Wuxi Lees Power Company Limited — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.leespower.com/, trụ sở: Wuxi, Jiangsu, chứng nhận: CE; ISO; CQC
- legapower: Fujian Everstrong Lega Power Equipments Co., Ltd. — vai trò: genset_oem, trạng thái: partial, độ tin cậy: medium, quốc gia: CN, website: https://www.legapower.com
- liangzi-yangzhou: 扬州量子电力设备有限公司 — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.lzpower.cn/, trụ sở: Yangzhou, Jiangsu
- long-gen: JIANGSU LONGEN POWER TECHNOLOGY CO., LTD. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.long-gen.com/, trụ sở: Jiangsu
- longkai-power: Fuan Longkai Power Co.,Ltd. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.longkaipower.com/, trụ sở: Fuan, Fujian, thành lập: 2002, chứng nhận: ISO 9001; ISO 14001; CE; CCS; CCC, bộ điều khiển: DSE6120
- mecca-power: MECCA POWER — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.meccapower.com.cn/, bộ điều khiển: ComAp (không ghi model); Deep Sea (không ghi model); DEIF (không ghi model); SmartGen (không ghi model)
- mpmc-powertech: MPMC Powertech Corp. — vai trò: genset_oem, trạng thái: partial, độ tin cậy: medium, quốc gia: CN, website: https://www.mpmc-china.com/, trụ sở: Shanghai, Shanghai, bộ điều khiển: Deep Sea (không ghi model); AGC
- pauway-tianjin: PAUWAY — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://pauway.cn/, trụ sở: Tianjin, Tianjin
- pengpai-yangzhou: 扬州澎湃动力设备有限公司 — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: http://yzppdl.cn/, trụ sở: Yangzhou, Jiangsu
- penlucky: Shandong Penlucky Power Equipment Co., Ltd. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://penlucky.com/, trụ sở: Weifang, Shandong, thành lập: 2007, bộ điều khiển: ComAp (không ghi model); Deep Sea (không ghi model); Woodward (không ghi model)
- rcg-power: Jiangsu Ruichang Gold Generating Equipment Co., Ltd. — vai trò: genset_oem, trạng thái: partial, độ tin cậy: medium, quốc gia: CN, website: https://www.rcgpower.com/, trụ sở: Wuxi, Jiangsu, bộ điều khiển: Deep Sea (không ghi model); SmartGen (không ghi model); DEIF (không ghi model)
- rise-power: RISE Power Equipment Inc. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://dieselpower-en.com/, trụ sở: Guangzhou, Guangdong, chứng nhận: ISO9001, bộ điều khiển: DSE6110; DSE7320; DSE8610
- sime-darby-elco-foshan: Foshan Sime Darby Elco Power Equipment Limited — vai trò: distributor, trạng thái: partial, độ tin cậy: medium, quốc gia: CN, website: https://en.elco-sime.com/, trụ sở: Foshan, Guangdong
- simpson-power: SIMPSON (China) Ltd — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: http://www.simpsonpower.cn/, chứng nhận: ISO9001; OHSAS18001
- sr-genset: SR GENSET — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://sr-genset.com/, chứng nhận: ISO9001, bộ điều khiển: Deep Sea (không ghi model); IG200
- stone-power: JIANGSU STONE POWER CO.,LTD — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.silentgeneratorset.com/, trụ sở: Jiangsu, bộ điều khiển: ComAp (không ghi model); DSE6020; DSE7320; Harsen (không ghi model); HGM6110
- uleengen: Shandong Uleen Generator Co., Ltd. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.uleengen.com/, trụ sở: Shandong, thành lập: 2011, chứng nhận: CE; ISO9001; ISO14001, bộ điều khiển: ComAp (không ghi model); DSE6020; DSE6120; DSE7320; DSE7420; DSE8610; DEIF (không ghi model); Harsen (không ghi model); HGM6110; HGM6120; HGM9510
- vantek-jiangsu: 江苏万泰动力设备有限公司 — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: http://www.vantekpower.cn/, trụ sở: Jiangsu
- victory-generator: Victory Power Technology Co., Ltd. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.victorygenerator.com/, bộ điều khiển: AMF20; DSE6020; HGM6120
- voltgent: Voltgent — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.voltgent.com/, bộ điều khiển: ComAp (không ghi model); DSE6120; DSE7410; DSE7420
- walter-yangzhou: Yangzhou Walter Electrical Equipment Co., Ltd. — vai trò: genset_oem, trạng thái: partial, độ tin cậy: medium, quốc gia: CN, website: https://www.wetgenerator.com
- weichai-power: Weichai Power Co., Ltd. — vai trò: engine_maker, trạng thái: verified, độ tin cậy: high, quốc gia: CN, website: https://en.weichaipower.com/, trụ sở: Weifang, Shandong, thành lập: 2002, đại lý tại Việt Nam: Weichai Việt Nam (VP Hà Nội: Charm Vit Tower, 117 Trần Duy Hưng; VP TP.HCM: Đại Minh Convention Tower, 77 Hoàng Văn Thái, Q.7)
- westinpower: Westinpower — vai trò: genset_oem, trạng thái: partial, độ tin cậy: medium, quốc gia: CN, website: https://power-gensets.com/, trụ sở: Guangdong, thành lập: 2003, bộ điều khiển: DSE8004; DSE8610; DEIF (không ghi model); easYgen-1800
- wintpower: FUZHOU WINTPOWER TECHNOLOGY CO., LTD — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.wintpower.com/, trụ sở: Fuzhou, Fujian, chứng nhận: ISO9001; ISO14001; CE, bộ điều khiển: AMF25; DKG-309; DSE4620; DSE7320; SmartGen (không ghi model)
- xingguang-jiangsu: Jiangsu Starlight Electricity Equipment Co., Ltd. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.jsxggx.com/, trụ sở: Taixing, Jiangsu, thành lập: 2000, chứng nhận: ISO9001; ISO14000, bộ điều khiển: Deep Sea (không ghi model); SmartGen (không ghi model)
- xinzhengfa: 郑州新郑发发电设备厂 — vai trò: genset_oem, trạng thái: partial, độ tin cậy: medium, quốc gia: CN, website: http://www.cyfdjc.net/, trụ sở: Zhengzhou, Henan
- yanan-power: Fujian Yanan Technology Co., Ltd (Yanan Power Group) — vai trò: genset_oem, trạng thái: partial, độ tin cậy: medium, quốc gia: CN, website: https://www.yanan-motor.com/, trụ sở: Fujian, chứng nhận: ISO9001; ISO14001; ISO45001; UL; CCC; CE
- yunding-jiangsu: 江苏云顶发电机有限公司 — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://fdjze.com/, trụ sở: Taizhou, Jiangsu, bộ điều khiển: Deep Sea (không ghi model); ComAp (không ghi model); SmartGen (không ghi model); Mebay (không ghi model); Deep Sea (không ghi model); ComAp (không ghi model); SmartGen (không ghi model); Mebay (không ghi model); Deep Sea (không ghi model); ComAp (không ghi model); SmartGen (không ghi model); Mebay (không ghi model)