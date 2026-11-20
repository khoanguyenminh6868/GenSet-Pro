# Danh mục trong hệ thống (tổ máy 100 kVA, từ 100% đến 120%), 50 Hz — code đã xếp sẵn

Thứ tự ưu tiên khi xếp: model động cơ / hãng động cơ HSMT nêu, bộ điều khiển HSMT nêu, động cơ có nhiều thông số có nguồn, rồi mới tới đầu phát; công suất càng sát càng tốt.

## Ứng viên (30 dòng tổ máy, tốt nhất trước)

### 1. DHY110KSE — động cơ HY4A140Z-D25 (nguồn không ghi hãng), đầu phát 274C
- supplierId: hyundai-power-products, n: 5001, quốc gia: ES, độ tin cậy: medium, vai trò: genset_oem
  line: | DHY110KSE | 100KVA/ 80KW | 110KVA/ 88KW | HY4A140Z-D25 | 274C | COMAP AMF9
  datasheet tổ máy DHY110KSE (nguồn tier A, một model, nhãn | đơn vị | giá trị; mọi dòng của mọi khối là của tổ máy này, trích nguyên dòng làm sourceQuote cho cả động cơ / đầu phát / tổ máy):
    [DHY110KSE] | Prime Power | KVA / KW | 100 / 80 ; | Standby Power | KVA / KW | 110 / 88 ; | Power Factor | 0.8 ; | Frequency | Hz | 50 ; | Rate Voltage | V | 400/230 ; | Rate Current | A | 144.3 ; | Controller | AMF9 ; | Control Voltage | DC / V | 24 ; | Battery Capacity | Ah | 60×2 ; | Coolant Capacity | L | 34 ; | Fuel Tank Capacity(Base frame) | L | 245 ; | Fuel consumption @25/50/75/100% load | L / hour | 8.25/13.2/18.7/24.6 ; | Running Time | Hour | 9.3 ; | Length | mm | 2700 ; | Width | mm | 1000 ; | Height | mm | 1600 ; | Weight net | Kg | 1476 ; | Sound Level (7m, 75% load) | dB | 72
    [DHY110KSE Voltage] | Steady state regulation | % | ≤±0.5 ; | Dynamic voltage renewal | % | ≤+20~-15 ; | Stable time | Sec | 2.0 ; | Waveform distortion | % | ≤3
    [DHY110KSE Frequency] | Steady state regulation | % | ≤±1 ; | Dynamic frequency renewal | % | ≤+10~-7 ; | Stable time | Sec | ≤3
    [DHY110KSE Diesel engine] | Engine Model | HY4A140Z-D25 ; | Prime power | Kw | 100 ; | Structure | 4 cylinder,inline ; | Fuel type | Diesel ; | Fuel consumption @25/50/75/100% load | L/Hour | 8.25/13.2/18.7/24.6 ; | Governor | Electrical ; | Coolling | Water ; | Aspiration | Turbocharging intercooled ; | Bore | mm | 108 ; | Stroke | 132 ; | Displacement | L | 4.75
    [DHY110KSE Alternator] | Alternator Model | 274C ; | Prime power | kVA | 100 ; | Structure | 1 bearing ; | Excitation mode | Self-excitation ; | Insulation class | H ; | Protection class | IP23 ; | AVR Model | AS440 ; | Benefits and Feature | HYUNDAI high quality and performance brushless alternator, with AVR
    [DHY110KSE Control panel measurement, displayment] | Genset prime power Kw | ● standard ; | Power factor | ● standard ; | engine speed | ● standard ; | Phase to neutral voltage | ● standard ; | Phase to phase voltage | ● standard ; | Genset frequency | ● standard ; | Genset current | ● standard ; | Mains Phase to neutral voltage | ○ optional ; | Mains Phase to phase voltage | ○ optional ; | Mains frequency | ○ optional ; | engine oil pressure | ● standard ; | engine water temperature | ● standard ; | fuel level | ● standard ; | battery voltage | ● standard ; | genset power KVA | ● standard ; | Genset running time | ● standard ; | Genset output KWh | ● standard ; | History file | ● standard
    [DHY110KSE Control panel alarm, shutdown function] | Low oil pressure warning,shutdown | ● standard ; | High water temperature warning,shutdown | ● standard ; | Engine over and under speed shutdown | ● standard ; | Low fuel level warning,shutdown | ● standard ; | battery low and high voltage warning | ● standard ; | battery chargering failure | ● standard ; | Genset low and high voltage warning, shut down | ● standard ; | Alternator 3 phase voltage unbalance shut down | ● standard ; | Alternator low and high frequency warning,shut down | ● standard ; | Genset over load shutdown | ● standard ; | Alternator 3 phase current unbalance shutdown | ● standard ; | Mains low and high voltage warning | ○ optional ; | Mains low and high frequency warning | ○ optional
    [DHY110KSE Control panel other functions] | Remote start and stop | ● standard ; | RS232 card | ○ optional ; | USB card | ● standard ; | RS485 card | ○ optional ; | Multi language display | ● standard ; | GPRS communication | ○ optional ; | GPS communication | ○ optional ; | CAN communication | ● standard
    [trang của hãng ghi model này] Hersteller: GRV POWER PRODUCTS SL ; Licensed by HYUNDAI Corporation Holdings, Korea ; Diesel Notstromaggregat DHY110KSE ; 50Hz Standby 110KVA ; Use Chinese High quality vehicle engine ; HY4A140Z-D25 ; DHY110KSE
  bộ điều khiển trong dòng: AMF9
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): AMF9
  lý do xếp: tổ máy đúng model HSMT nêu đích danh; dòng ghi bộ điều khiển ComAp AMF9; bộ điều khiển có datasheet hãng

### 2. bảng "DHY110KSE Diesel engine" (tổ máy HSMT nêu) — động cơ HY4A140Z-D25 (nguồn không ghi hãng), đầu phát không ghi
- supplierId: hyundai-power-products, n: 5001, quốc gia: ES, độ tin cậy: medium, vai trò: genset_oem
  bảng một model: | Engine Model | HY4A140Z-D25 ; | Prime power | Kw | 100 ; | Structure | 4 cylinder,inline ; | Fuel type | Diesel ; | Fuel consumption @25/50/75/100% load | L/Hour | 8.25/13.2/18.7/24.6 ; | Governor | Electrical ; | Coolling | Water ; | Aspiration | Turbocharging intercooled ; | Bore | mm | 108 ; | Stroke | 132 ; | Displacement | L | 4.75
  thông số trong dòng: Governor = Electrical ; Aspiration = Turbocharging intercooled ; Bore = 108 ; Displacement = 4.75
  datasheet tổ máy DHY110KSE: như ứng viên 1 ở trên
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): AMF9
  lý do xếp: tổ máy đúng model HSMT nêu đích danh; NCC có hồ sơ bộ điều khiển ComAp AMF9; bộ điều khiển có datasheet hãng

### 3. SC100E6 — động cơ 6BT5.9-G2 (hãng Cummins, theo dòng bảng), đầu phát UCI224G (Stamford)
- supplierId: stone-power, n: 106, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | SC100E6 | 88 | 80 | 110 | 100 | 6BT5.9-G2 | UCI224G | MP-70-4 | WHI 274C
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): ComAp (không ghi model), DSE6020, DSE7320, Harsen (không ghi model), HGM6110
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp, Deep Sea DSE6020, Deep Sea DSE7320; bộ điều khiển có datasheet hãng

### 4. P110/H1 — động cơ 1104C-44TAG2 (hãng Perkins, theo dòng bảng), đầu phát UCI274C (Stamford)
- supplierId: fdk-energy, n: 103, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | P110/H1 CONTACT | 110KVA/ 88KW | 100KVA/ 80KW | 1104C-44TAG2 | Perkins China | Stamford UCI274C | Click Here | Download
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): InteliGen, DSE3110, DSE7320, DSE8610, HGM6110N, HGM6110NC, HGM6120CAN, HGM9510
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp InteliGen, Deep Sea DSE3110, Deep Sea DSE7320; bộ điều khiển có datasheet hãng

### 5. P-110 — động cơ 1104C-44TAG2 (hãng Perkins, theo dòng bảng), đầu phát UCI274C (Stamford)
- supplierId: jet-power, n: 129, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | P-110 | 110 | 88 | 100 | 80 | 1104C-44TAG2 | 4L | 105 x 127 | 4.4 | 22.6 | UCI274C | 2150*760*1250 | 1067 | 2850*1080*1550 | 1567
  thông số trong dòng: Weight = 1067 ; Fuel Consumption = 22.6 ; Displacement = 4.4 ; Bore x stroke = 105 x 127 ; No. of Cylinder = 4L ; (L x W x H) = 2150*760*1250
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): ComAp (không ghi model), DSE6020, DSE7320, HGM6120N
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp, Deep Sea DSE6020, Deep Sea DSE7320; bộ điều khiển có datasheet hãng

### 6. TGP110S — động cơ 1104C-44TAG2 (hãng Perkins, theo dòng bảng), đầu phát UCI274C (Stamford)
- supplierId: tecgen-fujian, n: 121, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  bảng một model: | Model Number | TGP110S ; | Genset Model | TG110PS ; | Prime Power | 100KVA/80KW ; | Standby Power | 110KVA/88KW ; | Rated Voltage (V) | 380 ; | Rated Frequency (Hz) | 50 ; | Rated Speed (RPM) | 1500 ; | Power Factor (COS&cent;) | 0.8 (lagging) ; | Engine Model | 1104C-44TAG2 ; | Engine Power(KW) | 103 ; | Bore*Stroke (mm*mm) | 105*127 ; | Displacement (Liter) | 4.41 ; | Starting Method | DC 24V Electrical Starting ; | Fuel Consumption (g/kw.h) | 205 ; | Alternator Model | UCI274C ; | Voltage Regulation, Steady State | 1.00%
  thông số trong dòng: Rated Voltage (V) = 380 ; Rated Speed (RPM) = 1500 ; Engine Power(KW) = 103 ; Bore*Stroke (mm*mm) = 105*127 ; Displacement (Liter) = 4.41 ; Starting Method = DC 24V Electrical Starting ; Fuel Consumption (g/kw.h) = 205 ; Voltage Regulation, Steady State = 1.00%
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): AMF20, AMF25, DSE6020, DSE7320, SGC-420, Harsen (không ghi model), Mebay (không ghi model), HGM6120N
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp AMF20, ComAp AMF25, Deep Sea DSE6020; bộ điều khiển có datasheet hãng

### 7. FDK-CD110/H1 — động cơ 6BT5.9-G2 (hãng Cummins, theo dòng bảng), đầu phát UCI274C (Stamford)
- supplierId: fdk-energy, n: 1007, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  bảng một model: CUMMINS MODEL: 6BT5.9G2 ; General Features: ; | FDK Diesel Generator Set | Data ; | Genset Model | FDK-CD110/H1 ; | Engine Make | Cummins ; | Prime Power | 80KW/100KVA ; | Engine Model | 6BT5.9G2 ; | Standby Power | 88KW/110KVA ; | Alternator model | Stamford UCI274C ; | Output Frequency / Rated speed | 50Hz/1500rpm ; | Rated Voltage | 230V/400V ; | Phase | Three ; (1) Prime power: The rating is available for an unlimited of annual operating hours in variable load applications, in accordance with ; (2) Standby power: The rating is applicable for supplying emergency power in variable load applications for up to 200 hours per year in ; (3) Rated voltage: available with customer requirement. ; | Engine Specifications | (DETAILED in APPENDIX) ; | Aspiration | Turbo-charged ; | Engine Manufacturer | Cummins (China ; | Bore x Stroke (mm x mm) | 102×120 ; | Cylinder quantity | 6 ; | Compression Ratio | 17.3:1 ; | Cylinder Arrangement | Not available ; | Prime power / Speed (KW/RPM) | 961500 ; | Standby power/ Speed (KW/RPM) | 106/1500 ; | Speed governor | Electronic | Fuel Consumption at 100% load | 208 at 1500rpm ; | Piston Speed | 6.0m/s ; | Friction Energy Output | 12.7kw ; | Starter motor | DC24V ; | Total Lubrication System | Capacity ; | Alternator | DC24V ; Alternator Specifications ; | Alternator model | UCI274C ; | Number of phase | 3 ; | Alternator manufacturer | STAMFORD ; | Rated voltage | 400V ; | Exciter type | Single bearing, Brushless, ; | Self-excited | Power factor | 0.8 ; | Rated output prime power | 100 KVA ; | Voltage regulation NL-FL | ≤±1% ; | Rated speed | 1500 rpm ; | Insulation grade | H ; | Rated frequency | 50Hz ; | Protection grade | IP23 ; | Alternator option: Leroy Somer, MECC, Marathon, | Engga, Faraday ; | make | the ; | Generator set | Alternator ; Weight ; | Overall Size: | 2150×820×1293 ; | Overall Size: | 2800X1250X1750 ; | L×W×H (mm) | L×W×H (mm) ; | Weight (kg) | 1100 ; | Weight (kg) | 1900
  thông số trong dòng: Rated Voltage = 230V/400V ; Phase = Three ; Aspiration = Turbo-charged ; Bore x Stroke (mm x mm) = 102×120 ; Cylinder quantity = 6 ; Compression Ratio = 17.3:1 ; Speed governor = Electronic ; Exciter type = Single bearing, Brushless, ; Voltage regulation NL-FL = ≤±1% ; Rated speed = 1500 rpm ; Insulation grade = H ; Protection grade = IP23 ; Overall Size: = 2150×820×1293 ; Weight (kg) = 1100
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): InteliGen, DSE3110, DSE7320, DSE8610, HGM6110N, HGM6110NC, HGM6120CAN, HGM9510
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp InteliGen, Deep Sea DSE3110, Deep Sea DSE7320; bộ điều khiển có datasheet hãng

### 8. KC100D5 — động cơ 6BT5.9-G2 (hãng Cummins, theo dòng bảng), đầu phát UCI274C (Stamford)
- supplierId: koten-power, n: 5001, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | KC100D5 | 80 | 100 | 88 | 110 | 6BT5.9-G2 | UCI 274C
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): ComAp (không ghi model), Deep Sea (không ghi model), HGM6110N, HGM6120N
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp, Deep Sea, SmartGen HGM6110N; bộ điều khiển có datasheet hãng

### 9. SC100M5 — động cơ 6BT5.9-G1 (hãng Cummins, theo dòng bảng), đầu phát UCI274C (Stamford)
- supplierId: stone-power, n: 107, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | SC100M5 | 88 | 80 | 110 | 100 | 6BT5.9-G1 | UCI274C | MP-80-4 | WHI 274C
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): ComAp (không ghi model), DSE6020, DSE7320, Harsen (không ghi model), HGM6110
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp, Deep Sea DSE6020, Deep Sea DSE7320; bộ điều khiển có datasheet hãng

### 10. UW100GF — động cơ WP4.1D100E200 (hãng Weichai / Deutz, theo dòng bảng), đầu phát UCI274C (Stamford)
- supplierId: uleengen, n: 101, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | UW100GF | 80 | 100 | WP4.1D100E200 | 90 | 4.L | 105×118 | 4.09 | 18.7 | UCI274C | 2000x820x1400 | 1000
  thông số trong dòng: Overall Size(mm) = 2000x820x1400 ; Gross Weight(kg) = 1000
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): ComAp (không ghi model), DSE6020, DSE6120, DSE7320, DSE7420, DSE8610, DEIF (không ghi model), Harsen (không ghi model), HGM6110, HGM6120, HGM9510
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp, Deep Sea DSE6020, Deep Sea DSE6120; bộ điều khiển có datasheet hãng

### 11. CD110V2/H1 — động cơ 4BTAA3.9-G3 (hãng Cummins, theo dòng bảng), đầu phát UCI274C (Stamford)
- supplierId: fdk-energy, n: 102, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | CD110V2/H1 CONTACT | 110KVA/ 88KW | 100KVA/ 80KW | 4BTAA3.9-G3 | Cummins (China Dongfeng) | Stamford UCI274C | Click Here |
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): InteliGen, DSE3110, DSE7320, DSE8610, HGM6110N, HGM6110NC, HGM6120CAN, HGM9510
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp InteliGen, Deep Sea DSE3110, Deep Sea DSE7320; bộ điều khiển có datasheet hãng

### 12. WT-FA100 — động cơ CA4DF2-12D (hãng FAWDE, theo dòng bảng), đầu phát UCI274C (Stamford)
- supplierId: wintpower, n: 107, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | WT-FA100 | 72/98 | 80/100 | CA4DF2-12D | UCI 274C | TAL-A44-D | WT274G80
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): AMF25, DKG-309, DSE4620, DSE7320, SmartGen (không ghi model)
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp AMF25, Datakom DKG-309, Deep Sea DSE4620; bộ điều khiển có datasheet hãng

### 13. W110-H1 — động cơ WP4.1D100E200 (hãng Weichai / Deutz, theo dòng bảng), đầu phát NIANFENG NF274C
- supplierId: fdk-energy, n: 108, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | W110-H1 CONTACT | 110KVA/ 88KW | 100KVA/ 80KW | WP4.1D100E200 | WEICHAI (China) | NIANFENG NF274C | Click Here | Download
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): InteliGen, DSE3110, DSE7320, DSE8610, HGM6110N, HGM6110NC, HGM6120CAN, HGM9510
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp InteliGen, Deep Sea DSE3110, Deep Sea DSE7320; bộ điều khiển có datasheet hãng

### 14. LG75WP — động cơ WP4.1D100E200 (hãng Weichai / Deutz, theo dòng bảng), đầu phát LK274C
- supplierId: longkai-power, n: 1129, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  bảng một model: | POWER YOUR FUTURE | WP4.1D100E200 ; | Weichai Generator | Prime Power: 80KW/100KVA ; generator will be ready to run: “peace of ; | Model | LG75WP ; Alternator ; | Rated prime power | kva | 100 ; | Model | LONGKAI | LK274C ; | Rated standard power | kva | 110 ; | Rated voltage line to line | V | 400/230 ; | Phase | 3 ; | Rated current | A | 144.3 ; | Voltage | V | 400/230 ; | Maximun sound level | dB(@7m) | 96 ; | Engine-Weichai | Power factor | 0.8 ; | Model | WP4.1D100E200 ; | Frequency | Hz | 50 ; | Aspiration | Turbocharged&Intercooling ; | Prime power | KW | 80 ; | Exciter Type | Brushless, self-excitation ; | No. cylinders | 4 in line ; | Voltage regulation | % | ±0.5 ; | Displacement | Liquid | 4.1 ; | Protection Grade | IP 23 ; | Bore*Stroke | mm | 105*118 ; | Insulation grade | H/H ; | Compression ratio | 17.5:1 ; | Rated speed | r/min | 1500 ; Controller-DEEPSEA ; | Rated net power(with | fan) ; | Model | DSE6120MK3 ; | Governor type | Electronic speed ; | Start Motor | V | 24 ; | 100% load(Prime power) | L/h | 18.7 ; | 75% load(Prime power) | L/h ; | 50% load(Prime power) | L/h ; | Fuel tank capacity | L | 360 ; | (continuous operation) | Auto generator control module ; | Cooling System | ATS auto load transfer screen ; Dimensions(Basic unit) ; Alternator: single bearing alternator IP23, ; | Weight | kg | 900 ; | Weight | kg | 1300 ; Generator ; | Max loading weight | kg | 1300
  thông số trong dòng: Rated voltage line to line = 400/230 ; Phase = 3 ; Rated current = 144.3 ; Power factor = 0.8 ; Aspiration = Turbocharged&Intercooling ; Exciter Type = Brushless, self-excitation ; Protection Grade = IP 23 ; Bore*Stroke = 105*118 ; Insulation grade = H/H ; Compression ratio = 17.5:1 ; Rated speed = 1500 ; Governor type = Electronic speed ; 100% load(Prime power) = 18.7 ; Fuel tank capacity = 360 ; Weight = 900
  bộ điều khiển trong dòng: DSE6120 MKIII
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): DSE6120
  lý do xếp: dòng ghi bộ điều khiển Deep Sea DSE6120 MKIII; bộ điều khiển có datasheet hãng

### 15. US80GF — động cơ SC4H140D2 (hãng SDEC, theo dòng bảng), đầu phát 274C
- supplierId: uleengen, n: 123, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | US80GF | 80 | 100 | SC4H140D2 | 95 | 4 | 105*124 | 4.3 | 18.7 | 274C | 2700X900X1650 | 2100
  thông số trong dòng: Overall Size(mm) = 2700X900X1650 ; Gross Weight (kg) = 2100
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): ComAp (không ghi model), DSE6020, DSE6120, DSE7320, DSE7420, DSE8610, DEIF (không ghi model), Harsen (không ghi model), HGM6110, HGM6120, HGM9510
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp, Deep Sea DSE6020, Deep Sea DSE6120; bộ điều khiển có datasheet hãng

### 16. UX100GF — động cơ CA6DF2D-14D (hãng FAWDE, theo dòng bảng), đầu phát 274C
- supplierId: uleengen, n: 135, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | UX100GF | 80 | 100 | CA6DF2D-14D | 96 | 6 | 110*115 | 6.55 | 20 | 274C | 2600×1000×1600 | 1600
  thông số trong dòng: Overall Size open frame type(mm) = 2600×1000×1600 ; Gross Weight(kg) = 1600
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): ComAp (không ghi model), DSE6020, DSE6120, DSE7320, DSE7420, DSE8610, DEIF (không ghi model), Harsen (không ghi model), HGM6110, HGM6120, HGM9510
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp, Deep Sea DSE6020, Deep Sea DSE6120; bộ điều khiển có datasheet hãng

### 17. WT-FA110 — động cơ CA6DF2D-14D (hãng FAWDE, theo dòng bảng), đầu phát UCI274C (Stamford)
- supplierId: wintpower, n: 107, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | WT-FA110 | 85/106 | 88/110 | CA6DF2D-14D | UCI 274C | TAL-A44-D | WT274G80
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): AMF25, DKG-309, DSE4620, DSE7320, SmartGen (không ghi model)
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp AMF25, Datakom DKG-309, Deep Sea DSE4620; bộ điều khiển có datasheet hãng

### 18. V-110 — động cơ TAD551GE (hãng Volvo Penta, theo dòng bảng), đầu phát UCI274C (Stamford)
- supplierId: jet-power, n: 132, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | V-110 | 110 | 88 | 100 | 80 | TAD551GE | 4 / In Line | 108×130 mm | 4.76 | Electronic | 18.0:1 | UCI274C
  thông số trong dòng: Compression Ratio = 18.0:1 ; Governing Type = Electronic ; Displacement (L) = 4.76 ; Bore / Stroke = 108×130 mm
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): ComAp (không ghi model), DSE6020, DSE7320, HGM6120N
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp, Deep Sea DSE6020, Deep Sea DSE7320; bộ điều khiển có datasheet hãng

### 19. LG80BD — động cơ 4M10G110/5 (hãng Baudouin, theo dòng bảng), đầu phát LSA 44.3 S5 (Leroy-Somer)
- supplierId: longkai-power, n: 108, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | LG80BD | 88 | 110 | 80 | 100 | 4M10G110/5 | LK274C | LSA 44.3 S5 | OP2050*880*1230 | AT2938*1080*1690 |
  thông số trong dòng: DIMENSION = OP2050*880*1230
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): DSE6120
  lý do xếp: NCC có hồ sơ bộ điều khiển Deep Sea DSE6120; bộ điều khiển có datasheet hãng

### 20. HC-BD110 — động cơ 4M10G110/5 (hãng Baudouin, theo dòng bảng), đầu phát TAL-A44-D (Leroy-Somer)
- supplierId: kaihua-genset, n: 119, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | HC-BD110 | 110 | 100 | 4M10G110/5 | TAL-A44-D | | 2810*1140*1830 | Download
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): InteliGen, DSE6020, DSE6120, DSE6120 MKII, DSE7320, DSE8610, HGM6120UC, HGM7120UC, HGM9510
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp InteliGen, Deep Sea DSE6020, Deep Sea DSE6120; bộ điều khiển có datasheet hãng

### 21. SC113E5 — động cơ 6BTA5.9-G2 (hãng Cummins, theo dòng bảng), đầu phát UCI274D (Stamford)
- supplierId: stone-power, n: 107, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | SC113E5 | 100 | 90 | 125 | 113 | 6BTA5.9-G2 | UCI274D | MP-90-4 | WHI 274D
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): ComAp (không ghi model), DSE6020, DSE7320, Harsen (không ghi model), HGM6110
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp, Deep Sea DSE6020, Deep Sea DSE7320; bộ điều khiển có datasheet hãng

### 22. UD100GF — động cơ BF4M1013EC (hãng Deutz, theo dòng bảng), đầu phát 274C
- supplierId: uleengen, n: 104, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | UD100GF | 80 | 100 | BF4M1013EC | Deutz | 102 | 4 | 108*130 | 4.764 | 18.8 | 274C | 2300x900x1700 | 1150
  thông số trong dòng: Overall Size(mm) = 2300x900x1700 ; Gross Weight(kg) = 1150
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): ComAp (không ghi model), DSE6020, DSE6120, DSE7320, DSE7420, DSE8610, DEIF (không ghi model), Harsen (không ghi model), HGM6110, HGM6120, HGM9510
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp, Deep Sea DSE6020, Deep Sea DSE6120; bộ điều khiển có datasheet hãng

### 23. BC110 — động cơ 6BT5.9-G1 (hãng Cummins, theo dòng bảng), đầu phát BW-274C
- supplierId: bobig-power, n: 111, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | BC110 | 80 | 100 | 88 | 110 | 6BT5.9-G1 | 86 | BW-274C | 1900*700*1200 | 2500*970*1200
  thông số trong dòng: Size = 1900*700*1200 ; Engine power/kw = 86
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): AMF20, AMF25, DSE4520, DSE6020, DSE6120, DSE6120 MKII, DSE7320, Harsen (không ghi model), HGM6110, HGM6120U
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp AMF20, ComAp AMF25, Deep Sea DSE4520; bộ điều khiển có datasheet hãng

### 24. BSD110 — động cơ SC4H160D2 (hãng SDEC, theo dòng bảng), đầu phát BW-274C
- supplierId: bobig-power, n: 170, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | BSD110 | 80 | 100 | 88 | 110 | SC4H160D2 | 105 | BW-274C | 2000*850*1580 | 2750*1100*1430
  thông số trong dòng: Size = 2000*850*1580 ; Engine power(kw) = 105
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): AMF20, AMF25, DSE4520, DSE6020, DSE6120, DSE6120 MKII, DSE7320, Harsen (không ghi model), HGM6110, HGM6120U
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp AMF20, ComAp AMF25, Deep Sea DSE4520; bộ điều khiển có datasheet hãng

### 25. SD-110 — động cơ SC4H160D2 (hãng SDEC, theo dòng bảng), đầu phát JET274C
- supplierId: jet-power, n: 136, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | SD-110 | 110 | 88 | 100 | 80 | SC4H160D2 | L4 | Electric | 4.3 | 105x124 | JET274C
  thông số trong dòng: Bore×Stroke = 105x124 ; Displacement = 4.3
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): ComAp (không ghi model), DSE6020, DSE7320, HGM6120N
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp, Deep Sea DSE6020, Deep Sea DSE7320; bộ điều khiển có datasheet hãng

### 26. BC110S — động cơ 4BTA3.9-G13 (hãng Cummins, theo dòng bảng), đầu phát BW-224G
- supplierId: bobig-power, n: 101, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | BC110S | 80 | 100 | 88 | 110 | 4BTA3.9-G13 | 97 | BW-224G | 2120*850*1400 | 2850*1040*1430
  thông số trong dòng: Engine power/kw = 97
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): AMF20, AMF25, DSE4520, DSE6020, DSE6120, DSE6120 MKII, DSE7320, Harsen (không ghi model), HGM6110, HGM6120U
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp AMF20, ComAp AMF25, Deep Sea DSE4520; bộ điều khiển có datasheet hãng

### 27. RDL80-60 — động cơ D1146 (hãng Doosan / Hyundai, theo dòng bảng), đầu phát LSA44.2VS3
- supplierId: rise-power, n: 120, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | RDL80-60 | 80/100 | 88/110 | D1146 | LSA44.2VS3 | 2200×820×1370 | 2900×1080×1600 | 1350 | 2900
  thông số trong dòng: Dimension = 2200×820×1370
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): DSE6110, DSE7320, DSE8610
  lý do xếp: NCC có hồ sơ bộ điều khiển Deep Sea DSE6110, Deep Sea DSE7320, Deep Sea DSE8610; bộ điều khiển có datasheet hãng

### 28. GF-110 — động cơ R6105AZLD (hãng Ricardo, theo dòng bảng), đầu phát JET274C
- supplierId: jet-power, n: 116, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | GF-110 | 110 | 88 | 100 | 80 | R6105AZLD | L6 | Mechanical | 6.7 | 105×130 | JET274C
  thông số trong dòng: Bore×Stroke = 105×130 ; Displacement = 6.7
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): ComAp (không ghi model), DSE6020, DSE7320, HGM6120N
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp, Deep Sea DSE6020, Deep Sea DSE7320; bộ điều khiển có datasheet hãng

### 29. APYT-75 — động cơ LR4M3L-D (hãng YTO, theo dòng bảng), đầu phát UC274C
- supplierId: acepow-fuan, n: 129, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | APYT-75 | 50 | 3 | 75 | 83 | 94 | 103 | UC274C | LR4M3L-D
  thông số trong dòng: Phase = 3
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): AMF20, AMF25, MRS10, MRS16, DKG-116, DSE3110, DSE6120, DSE7320, DSE8610, Harsen (không ghi model), HGM6110, HGM6120, HGM6120N
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp AMF20, ComAp AMF25, ComAp MRS10; bộ điều khiển có datasheet hãng

### 30. APYT-75 — động cơ LR4M3L-D (hãng YTO, theo dòng bảng), đầu phát UC224G
- supplierId: acepow-fuan, n: 129, quốc gia: CN, độ tin cậy: medium, vai trò: genset_oem
  line: | APYT-75 | 60 | 3 | 75 | 83 | 94 | 103 | UC224G | LR4M3L-D
  thông số trong dòng: Phase = 3
  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): AMF20, AMF25, MRS10, MRS16, DKG-116, DSE3110, DSE6120, DSE7320, DSE8610, Harsen (không ghi model), HGM6110, HGM6120, HGM6120N
  lý do xếp: NCC có hồ sơ bộ điều khiển ComAp AMF20, ComAp AMF25, ComAp MRS10; bộ điều khiển có datasheet hãng

