### A1 — 164 bảng, 11 NCC

*Định nghĩa:* Nằm trọn trong một bảng đã đọc của cùng NCC: ≥90% dòng khác nhau (chuẩn hoá chữ thường, bỏ ký tự không phải chữ/số, ≥6 ký tự) có trong MỘT bảng đã cho bản ghi; bảng chưa đọc có ≥2 dòng

- NCC `aosif`, bảng n=1030 (thứ tự trong hồ sơ b79), 6 dòng, tiêu đề: `Datasheet: 260845915778.pdf`
  ```
  | Rated output | Fuel consumption rate | ISO9001 | ISO14001
  | 100%Standby | 209g/KW.h | 51L/h | ISO8528 | ISO12100
  | 100%Prime | 205g/KW.h | 45L/h | ISO13849 | EN12601
  ```
- NCC `bison-zhejiang`, bảng n=1002 (thứ tự trong hồ sơ b22), 4 dòng, tiêu đề: `Datasheet: View the diesel generator Catalog`
  ```
  | Rated frequency(Hz) | 50/60 | 50/60 | 50/60 | 50/60 | 50/60 | 50/60
  | Rated voltage(V) | 110/220/380 | 11 0/220/380 | 110/220/380 | 11 0/220/380 | 110/220/380 | 110/220/380
  | Max power(KW) | 2.0 | 3.0 | 5.0 | 6.0 | 10.5 | 12
  ```
- NCC `haut-power`, bảng n=153 (thứ tự trong hồ sơ b95), 4 dòng, tiêu đề: `400kW VOLVO diesel generator 500kVA 3 phase generator price`
  ```
  | Genset | HT-400 | Prime Power (KW) | 400
  | Rated frequency(Hz) | 50/60 | Prime Power (KVA) | 500
  | Rated speed(Rpm) | 1500/1800 | Phase | 3 Phase
  ```

### A2 — 10 bảng, 2 NCC

*Định nghĩa:* Nằm trọn trong một bảng đã đọc của NCC khác: như A1 nhưng bảng chứa ở NCC khác; bảng chưa đọc có ≥4 dòng, dòng có ở >300 bảng đã đọc không tính

- NCC `perkins`, bảng n=103 (thứ tự trong hồ sơ b2), 8 dòng, tiêu đề: `404D-22TG Diesel Engines | Perkins`
  ```
  | Rated Speed | 1500/1800 rpm 1500/1800 rpm
  | Emissions | UN ECE R96 Stage IIIA constant speed and U.S. EPA Stationary Emergency Engine UN ECE R96 Stage IIIA constant speed and U.S. EPA Stationary Emergency Engine
  | Prime | 27.4 kVA 27.4 kVA
  ```
- NCC `shengfeng-fuan`, bảng n=102 (thứ tự trong hồ sơ b1), 7 dòng, tiêu đề: `CATALOGUE ENGINE MKWY490D-福安市晟丰电机有限公司`
  ```
  | Engine Rated Speed | rpm | 1500 | 1800
  | Generator set Frequency | Hz | 50 | 60
  | Engine Standby Power (LTP) | kW | 26,4 | 30,8
  ```
- NCC `perkins`, bảng n=117 (thứ tự trong hồ sơ b16), 7 dòng, tiêu đề: `1106A-70TG Diesel Engines | Perkins`
  ```
  | Rated Speed | 1500/1800 rpm 1500/1800 rpm
  | Prime | 135 kVA 135 kVA
  | Standby | 150 kVA 150 kVA
  ```

### B1 — 7 bảng, 5 NCC

*Định nghĩa:* Lặp đúng một bảng chưa đọc khác (nội dung chuẩn hoá giống hệt; bản đầu tiên ở lại nhóm của nó)

- NCC `agco-power`, bảng n=104 (thứ tự trong hồ sơ b3), 5 dòng, tiêu đề: `CORE50 Engine - AGCO Power`
  ```
  | | | CORE80 | CORE75 | CORE50
  | Cylinders | 6 | 6 | 4
  | Max output kW | 208-252 kW | 160-250 kW | 118-165 kW
  ```
- NCC `camda-generator`, bảng n=102 (thứ tự trong hồ sơ b1), 2 dòng, tiêu đề: `100 KW Biogas Generator for Industrial Renewable Energy Power Systems - Camda New Energy Equipment Co., Ltd`
  ```
  | No. of Cylinders | 6 | Engine power(KW) | 145
  | Bore * Stroke (mm) | 140 * 152 | Compression Ratio | 0.459027778
  ```
- NCC `panda-power`, bảng n=151 (thứ tự trong hồ sơ b8), 25 dòng, tiêu đề: `OEM 120KW/150KVA mobile trailer diesel generator silent waterproof diesel generator set electric power generat …(cắt)`
  ```
  Output Type: AC 3/Three Phase Output Type
  Rated Voltage: 400/230V
  Rated Current: 217A
  ```

### C1 — 4 bảng, 2 NCC

*Định nghĩa:* Không phải bảng tổ máy: không dòng nào có từ công suất (kVA/kW…), prime/standby, động cơ, đầu phát; không dòng Model; <40% dòng bắt đầu bằng mã model

- NCC `endress-stromerzeuger`, bảng n=1018 (thứ tự trong hồ sơ b69), 13 dòng, tiêu đề: `Endress Generators: Detail view`
  ```
  Endress Generators: Detail view
  | Weight in kg ca. | 10,5
  | Dimensions L x W x H [mm] | 400 x 300 x 320
  ```
- NCC `hyundai-power-products`, bảng n=5001 (thứ tự trong hồ sơ b3), 3 dòng, tiêu đề: `DHY110KSE Frequency`
  ```
  | Steady state regulation | % | ≤±1
  | Dynamic frequency renewal | % | ≤+10~-7
  | Stable time | Sec | ≤3
  ```

### H1 — 145 bảng, 21 NCC

*Định nghĩa:* Đầu phát rời: không dòng nào (và tiêu đề không) có từ tổ máy (genset / generating set / generator set / 机组); ≥2 dòng có từ đầu phát (alternator, Stamford, winding, excitation, reactance, poles, IP23…) và không ít hơn số dòng có từ động cơ

- NCC `genlitec`, bảng n=1020 (thứ tự trong hồ sơ b138), 5 dòng, tiêu đề: `Datasheet: Download as PDF`
  ```
  | Motor Starting Capability* | kVA | 233 | 219 | 199 | 259
  | Short Circuit Capacity** | % | 270 | 270 | 270 | 270
  | Reactances | Xd | 3.34 | 3.6 | 3.984 | 2.67
  ```
- NCC `shanhua`, bảng n=1008 (thứ tự trong hồ sơ b29), 12 dòng, tiêu đề: `Datasheet: View Details`
  ```
  | 50Hz | 1500 rpm | 400V
  | 备用功率 Standby Power | 33 | 41.25
  | 50Hz | 1500 rpm | 400V
  ```
- NCC `stamford-avk-china`, bảng n=1014 (thứ tự trong hồ sơ b13), 16 dòng, tiêu đề: `Datasheet: UCDI274K - Winding 311`; mã model nhìn thấy: UCDI274K
  ```
  UCDI274K - Winding 311
  | VOLTAGE REGULATION | ± 0.5 % | ± 1.0 % | With 4% ENGINE GOVERNING
  | VOLTAGE REGULATION | ± 1.0 % | ± 1.0 % | With 4% ENGINE GOVERNING
  ```

### M1 — 231 bảng, 36 NCC

*Định nghĩa:* Động cơ rời: không có từ tổ máy như H1, không có chữ kVA nào (công suất động cơ tính kWm / kW); ≥2 dòng có từ động cơ (bore, stroke, displacement, cylinders, governor…) và đầu phát không nhiều hơn

- NCC `genlitec`, bảng n=1018 (thứ tự trong hồ sơ b124), 13 dòng, tiêu đề: `Datasheet: Download as PDF`
  ```
  | and | conforming | to BS2869 classA2,EN590
  | Air System | 50 Hz | 60 Hz
  | Combustion Air Flow Prime | m³/min (cfm) | 2.2 (76)
  ```
- NCC `kachai-hangzhou`, bảng n=2002 (thứ tự trong hồ sơ b14), 25 dòng, tiêu đề: `SCC300D (Cummins KTA19-G2, Kachai K314G)`; mã model nhìn thấy: SCC300D, KTA19-G2, K314G
  ```
  | SPECIFICATION OF DIESEL GENERATOR
  | Prime Power (50HZ) | 300kw/375kva
  | Standby Power (50HZ) | 330kw/413KVA
  ```
- NCC `volvo-penta`, bảng n=1010 (thứ tự trong hồ sơ b23), 25 dòng, tiêu đề: `Datasheet: TAD1342GE-B — Volvo Penta product bulletin`; mã model nhìn thấy: TAD1342GE-B
  ```
  | Net engine prime power kWm, 50 Hz / 1500 rpm | 303 kWm / 1500 rpm
  | Net engine standby power kWm, 50 Hz / 1500 rpm | 333 kWm / 1500 rpm
  | Net engine prime power kWm, 60 Hz / 1800 rpm | 345 kWm / 1800 rpm
  ```

### O1 — 15 bảng, 7 NCC

*Định nghĩa:* Chủ đề khác: không có từ tổ máy, động cơ, đầu phát, prime/standby; ≤1 dòng nhắc công suất; chỉ có từ nhiên liệu / tải / ồn / kích thước / trọng lượng; không dòng nào bắt đầu bằng mã model

- NCC `gfe-power`, bảng n=1001 (thứ tự trong hồ sơ b26), 2 dòng, tiêu đề: `Datasheet: KOHLER-SDMO-J44.pdf`
  ```
  | Fuel system | Radiator & Engine capacity (l) | 16,10
  | Maximum fuel pump flow (l/h) | 111 | Fan power 50Hz (kW) | 1,30
  | Max head on fuel return line (m) | 3,60 | Fan air flow w/o restriction (m3/s) | 1,86
  ```
- NCC `green-power-generators`, bảng n=135 (thứ tự trong hồ sơ b37), 2 dòng, tiêu đề: `Generatori portatili - Green Power Generators`
  ```
  | | MODELLO MODEL | POTENZA POWER (1PH - 230V kVA) | POTENZA POWER (3PH - 400V kVA) | AVVIAMENTO STARTING | ALIMENTAZIONE FUELING | SERBATOIO TANK (l) | DIMENSIONI (LxLxA …(cắt)
  | EMI 2000IS | 1,8 | - | Strappo / Recoil | Benzina / Gasoline | 4,2 | 510x300x475 | 24
  | EMI 3000IE | 3,3 | - | Elettrico / Electric | Benzina / Gasoline | 10 | 645x480x500 | 46
  ```
- NCC `sevenpower-chengdu`, bảng n=112 (thứ tự trong hồ sơ b9), 6 dòng, tiêu đề: `50Hz 240kw 300kva Natural Gas CHP Generator BHKW With Turbo`
  ```
  | thermal output(KWt) | kWt | 342
  | NG consumption | m3/kW.h | 0.29
  | NG consumption per hour | m3/h | 69.6
  ```

### S1 — 15 bảng, 1 NCC

*Định nghĩa:* Danh mục dòng sản phẩm / liên kết: ≥2 dòng có 'Power range', 'View details →', 'catalog' (một dòng = một dòng sản phẩm, không phải model), median ≥4 ô

- NCC `eastern-lion-fuan`, bảng n=111 (thứ tự trong hồ sơ b13), 8 dòng, tiêu đề: `Engine By Perkins Series | EASTERNLION`
  ```
  | | | Power range | models | Engine | Alternator | Controller |
  | Engine By Cummins 2 | 200 – 1311 kW | 34 | MTA11-G2A | EL 314E | Smartgen 6120 | View details →
  | Engine By Cummins | 22 – 444 kW | 40 | 4BTA3.9-G2 | EL 274K | Smartgen 6120 | View details →
  ```
- NCC `eastern-lion-fuan`, bảng n=116 (thứ tự trong hồ sơ b22), 8 dòng, tiêu đề: `Engine By Kofo Series | EASTERNLION`
  ```
  | | | Power range | models | Engine | Alternator | Controller |
  | Engine By Cummins 2 | 200 – 1311 kW | 34 | MTA11-G2A | EL 314E | Smartgen 6120 | View details →
  | Engine By Cummins | 22 – 444 kW | 40 | 4BTA3.9-G2 | EL 274K | Smartgen 6120 | View details →
  ```
- NCC `eastern-lion-fuan`, bảng n=142 (thứ tự trong hồ sơ b45), 8 dòng, tiêu đề: `Engine By Woling Series | EASTERNLION`
  ```
  | | | Power range | models | Engine | Alternator | Controller |
  | Engine By Cummins 2 | 200 – 1311 kW | 34 | MTA11-G2A | EL 314E | Smartgen 6120 | View details →
  | Engine By Cummins | 22 – 444 kW | 40 | 4BTA3.9-G2 | EL 274K | Smartgen 6120 | View details →
  ```

### L1 — 61 bảng, 2 NCC

*Định nghĩa:* Niêm yết máy (bán lại / máy cũ): 2 dòng đầu có ≥4 trong Manufacturer / Model / Year / Hours / Condition / Wattage / Version…, kèm Year hoặc Hours hoặc Condition

- NCC `younes-bros`, bảng n=108 (thứ tự trong hồ sơ b7), 3 dòng, tiêu đề: `Kawasaki M1A 03 – Younes Bros`
  ```
  | | Manufacturer | Model | Year | Wattage | kVA | Voltage | Frequency | Fuel Type | Condition | Hours
  | Kawasaki | M1A-03 | 1985 | 1350 kW | 1687 | 4160 | 60 Hz | Diesel | Used | 785
  | Kawasaki | M1A-03 | 785
  ```
- NCC `visa-gensets`, bảng n=101 (thứ tự trong hồ sơ b0), 25 dòng, tiêu đề: `Second hand | visa.it`
  ```
  | | MODEL | KVA | VERSION | ENGINE | ALTERNATOR | YEAR | PANEL | RECOMMENDED USE
  | BD20B | 20 | Open | Baudouin | | 2023 | Guard REvolution AMF | Stand-By
  | GSP33TWIS3 | 30 | Soundproof | Perkins | Sincro | 2017 | Manual version | Stand-By
  ```
- NCC `younes-bros`, bảng n=147 (thứ tự trong hồ sơ b46), 3 dòng, tiêu đề: `Caterpillar 3412 – Younes Bros`
  ```
  | | Manufacturer | Model | Year | Wattage | kVA | Voltage | Frequency | Fuel Type | Condition | Hours
  | Caterpillar | 3412 | 2011 | 580 kW | 725 | 400 | 50 Hz | Diesel | New | 0
  | Caterpillar | 3412 | 0
  ```

### P1 — 181 bảng, 24 NCC

*Định nghĩa:* Dòng thô pdftotext: <30% dòng có gạch đứng, ô tách bằng dấu cách (cột không rõ)

- NCC `cummins-china-investment`, bảng n=2001 (thứ tự trong hồ sơ b28), 1 dòng, tiêu đề: `Cummins Global Product Guide – 50 Hz model range – International – C44D5e`; mã model nhìn thấy: C44D5e
  ```
      Model  Name  Standby    Prime     Engine  Model      Emissions  Compliance        Standard  Alternator  Standard  Control  Sound  Enclosure
      C44D5e       44    35   40   32   B3.3-G14       EU  Stage                  IIIA  UCI224C               PS0600             •
  ```
- NCC `kwise-generator`, bảng n=2002 (thứ tự trong hồ sơ b1), 9 dòng, tiêu đề: `KAL184 – 50Hz/1500RPM, PF 0.8, Cont./125K/40℃ và Standby/163K/27℃ (kVA)`; mã model nhìn thấy: KAL184A1, KAL184B1, KAL184C2, KAL184D2, KAL184E3 …
  ```
  50Hz/1500RPM                           Standard Winding      / Power Factor 0.8                 Special winding
  KAL184A1      kVA        20      20         20     19        22.4    22.4        22.4     20.9  13.6     16
  KAL184B1      kVA        22.5    22.5       22.5   21.4      25      25          25       23.5  15.3     18
  ```
- NCC `senci`, bảng n=2001 (thứ tự trong hồ sơ b9), 25 dòng, tiêu đề: `SENCI 2025 Industrial Genset catalogue - Pangu series 50Hz`; mã model nhìn thấy: SC500PG, SC560PG, SC600PG, SC700PG, SC750PG …
  ```
  PRP/ESP    Engine model    Prime/Standby  Bore-                                Machine   Fuel                    Open Type
  SC500PG   400/440    PTAA6L-EG490    450/490        135X166                         6    30        202.5        国Ⅲ         3300X1170X1610  3370
  SC560PG   450/500    PTAA8V-EG575    510/575        135X145                         8    28        199.2        国Ⅲ         3050X1400X2070  3970
  ```

### T1 — 204 bảng, 39 NCC

*Định nghĩa:* Nhiều model xếp CỘT: có dòng nhãn Model với ≥2 mã khác nhau, các dòng khác là nhãn thông số đứng đầu dòng

- NCC `genlitec`, bảng n=1011 (thứ tự trong hồ sơ b88), 5 dòng, tiêu đề: `Datasheet: Download as PDF`; mã model nhìn thấy: GSC20S5-I, GSC20D5-I
  ```
  | Power (KVA) | 20 | 22
  | Model | GSC20S5-I | GSC20D5-I
  | Power (KW) | 16 | 17.6
  ```
- NCC `koten-power`, bảng n=174 (thứ tự trong hồ sơ b86), 11 dòng, tiêu đề: `Supply Kofo Series 80KW 100KVA Ricardo Silent Diesel Generator Set Wholesale Factory - Fuzhou Koten Power Equi …(cắt)`; mã model nhìn thấy: KR100D5, KR118D6
  ```
  | Genset Specification | Genset Model | KR100D5 | KR118D6
  | Frequency | 50Hz | 60Hz
  | Prime Power | 80kW | 100kVA | 94kW | 118kVA
  ```
- NCC `slong-power`, bảng n=148 (thứ tự trong hồ sơ b13), 16 dòng, tiêu đề: `China SLONG Home Standby Generator High Performance Dual Fuel Compatible with LPG Gasoline and Natural Gas Man …(cắt)`; mã model nhìn thấy: SL6500W-SE-DF, SL8000W-SE-DF, SL9000W-SE-DF, SL10000W-SE-DF, SL12000W-SE-DF
  ```
  | Model | SL6500W-SE-DF | SL8000W-SE-DF | SL9000W-SE-DF | SL10000W-SE-DF | SL12000W-SE-DF
  | Frequency | 50 Hz / 60 Hz | 50 Hz / 60 Hz | 50 Hz / 60 Hz | 50 Hz / 60 Hz | 50 Hz / 60 Hz
  | Rated output: Gasoline | 5.0 kW | 6.0 kW | 7.0 kW | 8.0 kW | 10.0 kW
  ```

### R1 — 249 bảng, 57 NCC

*Định nghĩa:* Nhiều model xếp DÒNG, có dòng tiêu đề cột (một trong 2 dòng đầu không bắt đầu bằng mã, có từ công suất/prime/standby): ô mô tả model (ô đầu, hoặc ô 2 nếu ô đầu là số thứ tự) của ≥40% dòng là mã, median ≥4 ô/dòng

- NCC `googol`, bảng n=102 (thứ tự trong hồ sơ b2), 6 dòng, tiêu đề: `Gas Genset COP:350-750kVA & Gas Genset COP:350-750kVA生产厂家 &价格 &工厂 - Chongqing Googol Engine-Tech. Co.,Ltd.`; mã model nhìn thấy: GPAC335-400-50, GPAC400-400-50, GPAC450-400-50, GPAC500-400-50, GPAC625-400-50 …
  ```
  | No. | Gas Genset Model | Continuous Power（kW/kVA) | Frequency（Hz） | Voltage (V) | Generator Efficiency
  | 1 | GPAC335-400-50 | 280/350 | 50 | 400 | 93.8%
  | 2 | GPAC400-400-50 | 320/400 | 50 | 400 | 93.4%
  ```
- NCC `kente-power`, bảng n=168 (thứ tự trong hồ sơ b42), 24 dòng, tiêu đề: `Tuam Tshoj KT-SDEC Series Diesel Generator Chaw tsim tshuaj paus thiab Hoobkas |KENT`; mã model nhìn thấy: KT-SC70, KT-SC88, KT-SC110, KT-SC125, KT-SC138 …
  ```
  | Genset Qauv | 50HZ PF = 0.8 400/230V 3phase 4Wire | Cav Qauv | cil | Npog | Storke | hloov chaw | Tus tswv xeev | Qhib Hom Dimension
  | KT-SC70 | 70/55 ib | 63/50 ib | 15.1 | SC4H95D 2 | 4L | 105 | 124 | 4.3 | Elec. | 1980 * 880 * 1510 | 960 ua
  | KT-SC88 | 88/70 ib | 80/64 ib | 19 | SC4H115D2 | 4L | 105 | 124 | 4.3 | Elec. | 1980 * 880 * 1510 | 1020
  ```
- NCC `wartsila`, bảng n=101 (thứ tự trong hồ sơ b1), 5 dòng, tiêu đề: `Wärtsilä genset solutions – diesel gensets and marine auxiliary engines`; mã model nhìn thấy: 6L20DF, 8L20DF, 9L20DF
  ```
  | | 60 Hz | 50 Hz
  | Engine type | 195 kW/cyl, 1200 rpm | 160 kW/cyl, 1000 rpm
  | 6L20DF | 1170 | 1123 | 960 | 920
  ```

### R2 — 68 bảng, 12 NCC

*Định nghĩa:* Nhiều model xếp DÒNG, KHÔNG dòng tiêu đề cột (mọi dòng đều bắt đầu bằng mã model): cột nào là công suất phải đoán từ giá trị

- NCC `conductorjasa`, bảng n=104 (thứ tự trong hồ sơ b9), 1 dòng, tiêu đề: `Genset 800 kVA Cummins, Baudouin & Perkins – JERBINDO`; mã model nhìn thấy: BJPS-800-WP
  ```
  | BJPS-800-WP 8M33G900/5 800 kVA prime | 8M33G900/5 | 800 | 900 | 127,2 L/jam | 3925 × 1865 × 2020 mm
  ```
- NCC `dingbo`, bảng n=109 (thứ tự trong hồ sơ b15), 6 dòng, tiêu đề: `Cummins Generators | 25KVA - 3000KVA Cummings Generator`; mã model nhìn thấy: 4B3.9-G2, QSB3.9, QSB5.9, QSL8.9, QSZ13-G7
  ```
  | | Engine family | Listed set ratings | Go to the model
  | 4B3.9-G2 (3.9 L) | 20 kW / 25 kVA | 25 kVA
  | QSB3.9 (G35, G37, G39) | 50 kW, 75 kW, 90 kW | 50 kW · 75 kW · 90 kW
  ```
- NCC `mecc-alte`, bảng n=101 (thứ tự trong hồ sơ b0), 16 dòng, tiêu đề: `Permanent Magnet Generator | Mecc Alte`; mã model nhìn thấy: P.F.1, PM3G, PM5G, PM7G
  ```
  | PMG DC - FIXED SPEED | PMG DC - VARIABLE SPEED | PMG AC & INVERTER
  | PM3G - Lento | 3 | 1500-2500 | 2 | 1500-2500 | 3 | 1500-2500
  | PM3G - Medio | 5.5 | 2500-3600 | 4 | 2500-3600 | 4.5 | 2500-3600
  ```

### F1 — 41 bảng, 7 NCC

*Định nghĩa:* Mảnh bảng ≤3 dòng, không nhãn Model; tiêu đề trang có mã nhìn giống model

- NCC `gfe-power`, bảng n=103 (thứ tự trong hồ sơ b1), 2 dòng, tiêu đề: `Baudouin 2750kVA Diesel Generator - GFE3000BSC`; mã model nhìn thấy: GFE3000BSC
  ```
  | | kWe | kVA
  | Prime Power (PRP) | 2200 | 2750
  | Emergency Standby Power (ESP) | 2400 | 3000
  ```
- NCC `grupel`, bảng n=101 (thứ tự trong hồ sơ b0), 2 dòng, tiêu đề: `Portable Generator GR3000 - 3kW - GRUPEL`; mã model nhìn thấy: GR3000
  ```
  | | | kVA | kW
  | Stand-by Power (STP) | 3,8 | 3
  | Prime Power (PRP) | 3,5 | 2,8
  ```
- NCC `ruiji-fuan`, bảng n=2001 (thứ tự trong hồ sơ b0), 1 dòng, tiêu đề: `福康四气门FK1100-TLD11 /1100KW`; mã model nhìn thấy: FK1100-TLD11
  ```
  福康四气门FK1100-TLD11 /1100KW
  FK1100-TLD11 /1100KW柴油机是我公司为满足大功率需求自主研发的一款产品。采用高增压技术，更大限度使用排气能量，柴油机的燃油经济
  ```

### F2 — 183 bảng, 24 NCC

*Định nghĩa:* Mảnh bảng ≤3 dòng, không nhãn Model; tiêu đề không có mã

- NCC `bobig-power`, bảng n=171 (thứ tự trong hồ sơ b38), 2 dòng, tiêu đề: `25kW SDEC Diesel Generator | Super Silent Frame | CE Certified`
  ```
  | Specification | Prime Power | Standby Power
  | Rated Power (kVA) | 31 | 34
  | Power Rating (kW) | 25 | 28
  ```
- NCC `perkins`, bảng n=124 (thứ tự trong hồ sơ b30), 1 dòng, tiêu đề: `Product Comparison | Perkins`
  ```
  | 29 kWe 29 kWe | 21.3 kWe 21.3 kWe | 32.1 kWe 32.1 kWe
  ```
- NCC `powgen-argentina`, bảng n=2001 (thứ tự trong hồ sơ b1), 1 dòng, tiêu đề: `Minera Rio Colorado: grupo electrógeno a gas natural 500kVA`
  ```
  MINERA RIO COLORADO
  El 21 de junio del 2025, POWGEN instaló un Grupo electrógeno a Gas Natural de 500kVA con motor Scania OC16, alternador Weg, cabina isonorizada con tablero de comando y co …(cắt)
  ```

### V1 — 465 bảng, 31 NCC

*Định nghĩa:* Một máy dạng dọc (≥60% dòng ≤3 ô: nhãn | giá trị), CÓ dòng nhãn Model với mã

- NCC `endress-stromerzeuger`, bảng n=123 (thứ tự trong hồ sơ b20), 24 dòng, tiêu đề: `Endress Generators: Detail view`; mã model nhìn thấy: 1103A-33TG2
  ```
  | Prime power (PRP) [kVA/kW] | 60,1/48,1
  | Frequency [Hz] | 50
  | Weight in kg ca. | 823
  ```
- NCC `longkai-power`, bảng n=1034 (thứ tự trong hồ sơ b80), 10 dòng, tiêu đề: `Datasheet: Download`; mã model nhìn thấy: LK274K
  ```
  | Rated prime power | kva | 250
  | Maximun sound level | dB(@7m) | 96
  | Voltage | V | 400/230
  ```
- NCC `ronsun-power`, bảng n=114 (thứ tự trong hồ sơ b13), 14 dòng, tiêu đề: `100kW 125kVA Biomass Generator Set - Ronsun Power`; mã model nhìn thấy: GF-100
  ```
  Genset Model: GF-100
  Rated Power (kW / kVA): 100 / 125
  Standby Power (kW / kVA): 110 / 137.5
  ```

### V6 — 140 bảng, 2 NCC

*Định nghĩa:* Một máy dạng dọc như V1 nhưng ≥3 dòng dùng dấu chấm dẫn (Manufacturer……CUMMINS | Fuel consumption): nhãn và giá trị dính trong một ô

- NCC `lees-power`, bảng n=1021 (thứ tự trong hồ sơ b54), 41 dòng, tiêu đề: `Datasheet: PDF`; mã model nhìn thấy: LSC170S3
  ```
  | MODEL: | LSC170S3
  | Powered | by
  | EU2、EU3 nonroad emissions regulations.(≤560KW) | vibration spring isolators.
  ```
- NCC `gfe-power`, bảng n=1029 (thứ tự trong hồ sơ b66), 29 dòng, tiêu đề: `Datasheet: Baudouin_6M16G300-5_Engine_Datasheet.pdf`; mã model nhìn thấy: 6M16G300/5
  ```
  | Model : | 6M16G300/5
  | PowerKit | Engine Datasheet
  | Net Engine | Output
  ```
- NCC `lees-power`, bảng n=1139 (thứ tự trong hồ sơ b172), 43 dòng, tiêu đề: `Datasheet: PDF`; mã model nhìn thấy: LSC1000S3-6
  ```
  | MODEL: | LSC1000S3-6
  | Powered | by CUMMINS
  | EPA, ESE Tier3 or Tier4 nonroad emissions | vibration spring isolators.
  ```

### V2 — 232 bảng, 25 NCC

*Định nghĩa:* Một máy dạng dọc, không dòng Model nhưng tiêu đề trang có mã nhìn giống model

- NCC `dianbida`, bảng n=123 (thứ tự trong hồ sơ b20), 7 dòng, tiêu đề: `DD-50-玉柴发电机组-柴油发电机组厂家_价格_移动/静音发电机组-电必达动力设备(江苏)有限公司-官网`; mã model nhìn thấy: DD-50
  ```
  额定功率：50(kw)
  备用功率：55(kw)
  重量：820(kg)
  ```
- NCC `lei-shing-hong`, bảng n=2006 (thứ tự trong hồ sơ b43), 5 dòng, tiêu đề: `1206A-E70TTAG2`; mã model nhìn thấy: 1206A-E70TTAG2
  ```
  1206A-E70TTAG2
  | 机组功率主用 | 184 KW/230 KVA
  | Engine Power主用 | 200KW
  ```
- NCC `vpower-hk`, bảng n=1004 (thứ tự trong hồ sơ b9), 23 dòng, tiêu đề: `Datasheet: PPU2300NG`; mã model nhìn thấy: PPU2300NG
  ```
  | Electrical power COP | acc.
  | Fuel consumption: | [kW+5%] | 5116 | 3953 | 2796
  | Thermal efficiency: | [%] | 42.3 | 43.4 | 45.6
  ```

### V3 — 281 bảng, 56 NCC

*Định nghĩa:* Một máy dạng dọc, không dòng Model và tiêu đề không có mã

- NCC `depco-power`, bảng n=2091 (thứ tự trong hồ sơ b95), 43 dòng, tiêu đề: `Custom Hyundai Ranges 60Hz 1100 kVA Diesel Generator manufacturer & factory | Depcogenerator.com`
  ```
  Item NO.:
  DPK-DD-1100
  Frequency(Hz):
  ```
- NCC `jichai-huanneng`, bảng n=109 (thứ tự trong hồ sơ b8), 6 dòng, tiêu đề: `4500KW Natural Gas Generator Set Suppliers and Manufacturers China - New Energy - Jichai Huanneng`
  ```
  | Rated power（kW） | 5200
  | Rated voltage（V） | 10.5
  | Frequency（Hz） | 50
  ```
- NCC `sevenpower-chengdu`, bảng n=111 (thứ tự trong hồ sơ b8), 28 dòng, tiêu đề: `Electric Start Super Silent Low Noise 3 Phase Single Phase 6kw 8kw 10KVA Micro CHP Generator Set`
  ```
  | thermal output(KWt) | kWt | 21
  | NG consumption | m3/kW.h | 0.396
  | Certificate | — | CE
  ```

### V4 — 186 bảng, 25 NCC

*Định nghĩa:* Một máy dạng dọc kép: ≥50% dòng 4 ô, nhãn | giá trị | nhãn | giá trị

- NCC `haut-power`, bảng n=103 (thứ tự trong hồ sơ b4), 4 dòng, tiêu đề: `50kW generator diesel electric generator Cummins diesel generator`; mã model nhìn thấy: HT-50
  ```
  | Genset | HT-50 | Prime Power (KW) | 50
  | Rated frequency(Hz) | 50/60 | Prime Power (KVA) | 62.5
  | Rated speed(Rpm) | 1500/1800 | Phase | 3 Phase
  ```
- NCC `honto-power`, bảng n=114 (thứ tự trong hồ sơ b1), 15 dòng, tiêu đề: `Box Type Substation Manufacturer - Prefabricated Compact Substation 10-35kV | Shandong Honto`
  ```
  | | Model | HV Side (kV) | LV Side (kV) | Rated Capacity (kVA)
  | YBW | 10kV/20kV/35kV | 0.4 | 50
  | YBW | 10kV/20kV/35kV | 0.4 | 80
  ```
- NCC `stone-power`, bảng n=133 (thứ tự trong hồ sơ b40), 3 dòng, tiêu đề: `110KW 138KVA Low Noise Diesel Generator With Deep Sea 6020 Control System`
  ```
  | Gensets Model | Prime | Standby
  | SC138E5 | 110 | 138 | 150 | 120
  | Voltage | 380V-415V | 220V-240V | 190V-208V
  ```

### O2 — 34 bảng, 3 NCC

*Định nghĩa:* Bảng tiêu thụ nhiên liệu / công suất theo mức tải: ≥50% dòng bắt đầu '75%…', '100%Prime…', không mã model

- NCC `aosif`, bảng n=1113 (thứ tự trong hồ sơ b244), 5 dòng, tiêu đề: `Datasheet: 264725580181.pdf`
  ```
  | Rated output | Fuel consumption rate | ISO9001 | ISO14001
  | 100%Standby | *g/KW.h | 45.8L/h | ISO8528 | ISO12100
  | 100%Prime | *g/KW.h | 43.0L/h | ISO13849 | EN12601
  ```
- NCC `koten-power`, bảng n=115 (thứ tự trong hồ sơ b29), 3 dòng, tiêu đề: `Supply 30kva Baudouin Silent Diesel Generator Set Wholesale Factory - Fuzhou Koten Power Equipment Co.,Ltd.`
  ```
  | 100% Prime power | 7.6 | 9.3
  | 75% Prime power | 5.7 | 7.1
  | 50% Prime power | 4 | 5
  ```
- NCC `quanchai`, bảng n=105 (thứ tự trong hồ sơ b4), 4 dòng, tiêu đề: `380D - Anhui Quanchai Engine Co.,ltd`
  ```
  | POWER 功率 | RATED 常用 | STANDBY 备用
  | 100% FULL LOAD 100% 负荷 | 2.61 | 2.7
  | 75% LOAD 75% 负荷 | 1.9 | 2.1
  ```

### R3 — 6 bảng, 2 NCC

*Định nghĩa:* Nhiều dòng, MỖI DÒNG bắt đầu bằng SỐ (công suất), không có cột model; median ≥5 ô: dòng thuộc model nào chưa rõ (model ở tiêu đề / bảng khác)

- NCC `yingtai-jiangsu`, bảng n=103 (thứ tự trong hồ sơ b6), 35 dòng, tiêu đề: `英泰/东风康明斯柴油发电机组, 英泰/东风康明斯柴油发电机组 供应 - 英泰集团有限公司`
  ```
  | 功率(主用)Power(KW) | 功率(备用Power(KW) | 缸数 No Of Cylinders | 缸径/行程 Bore/Strokse (mm) | 排气量 Exhaust Cspacity (L) | 压缩比 Compression Ratio | 机油容量 Lubricating Capacity (L) | 燃油耗 …(cắt)
  | 24 | 27 | 4 | 102*120 | 3.9L | 17.3:1 | 10.9 | 228 | 6.7 | 机械调速 | 21 | ∕
  | 24 | 27 | 4 | 102*120 | 3.9L | 17.3:1 | 10.9 | 228 | 6.7 | 电子调速 | 21 | ∕
  ```
- NCC `gfe-power`, bảng n=1024 (thứ tự trong hồ sơ b50), 4 dòng, tiêu đề: `Datasheet: 2206C-E13TAG2_ElectropaK.pdf`
  ```
  | 1500 | Prime Power | 350 | 280 | 324 | 434 | 305 | 409
  | Standby Power | 400 | 320 | 368 | 493 | 349 | 469
  | 1800 | Prime Power | 400 | 320 | 373 | 500 | 349 | 468
  ```
- NCC `yingtai-jiangsu`, bảng n=110 (thứ tự trong hồ sơ b19), 28 dòng, tiêu đề: `MTU发电机组-英泰集团有限公司`
  ```
  | 主用 功率 Power(KW) | 备 用功率 Power(KW) | 缸数 No Of Cylinders | 缸径*行程 Bore/Strokse (MM) | 排气量 Exhaust Cspacity (L) | 压缩比 Compression Ratio | 机油容量 Lubricating Capacity (L) | 燃油 …(cắt)
  | 250 | 288 | 6/L | 122*150 | 11 | 17.5:1 | 43 | 201 | 52 | 电控共轨 | 89 | EPA2级
  | 280 | 322 | 6/L | 122*150 | 11 | 17.5:1 | 43 | 199 | 61.5 | 电控共轨 | 89 | EPA2级
  ```

### T3 — 102 bảng, 23 NCC

*Định nghĩa:* Nhiều cột giá trị (median ≥5 ô), nhãn thông số đứng đầu ≥60% dòng, không dòng Model nhận được (model có thể ở tiêu đề cột bị mất / ở dòng trên)

- NCC `genlitec`, bảng n=1020 (thứ tự trong hồ sơ b135), 2 dòng, tiêu đề: `Datasheet: Download as PDF`
  ```
  | Fuel Consumption at | 110 % Load | 100 % Load | 75 % Load | 50 % Load
  | (US gal/hr) | 35.1 (9.3) | 32.4 (8.6) | 25 (6.6) | 16.7 (4.4)
  | (US gal/hr) | - | 35.1 (9.3) | 27.3 (7.2) | 18.4 (4.9)
  ```
- NCC `mwm`, bảng n=105 (thứ tự trong hồ sơ b13), 14 dòng, tiêu đề: `Gas Engine TCG 2020`
  ```
  | | | TCG 2020 V12 RW = Optimized for high total efficiency at requested power
  | Engine type | 50 Hz | 60 Hz | 50 Hz | 60 Hz
  | Electrical output | kW | 1,125 | 1,125 | 1,200 | 1,200
  ```
- NCC `sincro-soga`, bảng n=164 (thứ tự trong hồ sơ b28), 7 dòng, tiêu đề: `PTO GENERATORS - IP23 - 3 PHASE - BRUSHES / COMPOUND - 2 POLES / LIGHT DUTY - AGROWATT`
  ```
  | model | kVA (S1) – H class 400V 50 Hz | kW driving power | HP (recommended) tractor power | rated rpm pto speed
  | AWT 2-13 | 13,5 | 13,4 | 42 | 430
  | AWT 2-16 | 16 | 15,6 | 49 | 430
  ```

### V5 — 53 bảng, 2 NCC

*Định nghĩa:* Bảng nhỏ hỗn hợp (≤12 dòng, ≤6 ô), tiêu đề trang có mã nhìn giống model, không khớp luật dọc / ngang

- NCC `teksan`, bảng n=114 (thứ tự trong hồ sơ b13), 2 dòng, tiêu đề: `TJ12BD-1`; mã model nhìn thấy: TJ12BD-1
  ```
  | Standby (ESP) | kVA | 12
  | Canopied | 950 x 2200 x 1450 | 809 | 90 | 63
  | Open Skid | 950 x 1650 x 1060 | 535 | 90 | TBA
  ```
- NCC `powerlink-shanghai`, bảng n=2003 (thứ tự trong hồ sơ b83), 4 dòng, tiêu đề: `QSV Series QSV250PS`; mã model nhìn thấy: QSV250PS
  ```
  | Engine Model | 1206A-E70TTAG3 | 1206A-E70TTAG3 | 1206A-E70TTAG3 | 1206A-E70TTAG3
  | Engine Brand | Perkins | Perkins | Perkins | Perkins
  | Voltage | 380V | 400V | 415V | 440V
  ```
- NCC `teksan`, bảng n=163 (thứ tự trong hồ sơ b61), 2 dòng, tiêu đề: `TJ60BD`; mã model nhìn thấy: TJ60BD
  ```
  | Standby (ESP) | kVA | 57
  | Canopied | 950 x 2400 x 1410 | 890 | 140 | 70
  | Open Skid | 950 x 1950 x 1070 | 640 | 140 | N/A
  ```

### Z — 114 bảng, 29 NCC

*Định nghĩa:* Chưa xếp được

- NCC `green-power-generators`, bảng n=103 (thứ tự trong hồ sơ b4), 12 dòng, tiêu đề: `Gruppi elettrogeni a Cardano - Green Power Generators`
  ```
  | | MODELLO MODEL | POTENZA POWER | TENSIONE VOLTAGE | PRESA DI FORZA POWER TAKE-OFF | DIMENSIONI DIMENSIONS | PESO WEIGHT | POTENZA TRATTORE TRACTOR POWER
  | GP 22 TR/S-C | 20 | 16 | 400 / 230 | 430 | 805 x 580 x 985 | 175 | 40
  | GP 33 TR/S-C | 30 | 24 | 400 / 230 | 430 | 855 x 580 x 985 | 217 | 60
  ```
- NCC `mwm`, bảng n=1015 (thứ tự trong hồ sơ b36), 35 dòng, tiêu đề: `Datasheet: EN`
  ```
  | Natural gas applications | 1) | 1)
  | TCG 3020 Series | V20 | V20 | V20 | V20 | V20 | V20 | V20 | V20
  | Configuration | P2) | R3) | PV4) | RV5) | P2) | R3) | PV4) | RV5)
  ```
- NCC `shangyan-jiangsu`, bảng n=107 (thứ tự trong hồ sơ b5), 12 dòng, tiêu đề: `30KVA-46.9KVA GR180 4-Pole Three Phase Alternator-SHANGYAN POWER`
  ```
  | Model | 50Hz (3000rpm) | 60Hz (3600rpm)
  | Voltage(series) | 380 | 400 | 415 | 440 | 416 | 440 | 460 | 480
  | Voltage (parallel) | 190 | 200 | 208 | 220 | 208 | 220 | 230 | 240
  ```

