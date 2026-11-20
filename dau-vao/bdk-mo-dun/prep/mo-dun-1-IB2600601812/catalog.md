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

## Thông số theo model (dùng cho mọi cấu hình có model đó; ghi factSrc như dưới)

### Động cơ HY4A140Z-D25
- Điều tốc: Electrical — factSrc: { "supplierId": "hyundai-power-products", "n": 5001, "line": "| Governor | Electrical" }
- Nạp khí: Turbocharging intercooled — factSrc: { "supplierId": "hyundai-power-products", "n": 5001, "line": "| Aspiration | Turbocharging intercooled" }
- Đường kính × hành trình: 108 — factSrc: { "supplierId": "hyundai-power-products", "n": 5001, "line": "| Bore | mm | 108" }
- Dung tích xi lanh: 4.75 — factSrc: { "supplierId": "hyundai-power-products", "n": 5001, "line": "| Displacement | L | 4.75" }

### Đầu phát 274C
- Kích từ / AVR: Self-excitation — factSrc: { "supplierId": "hyundai-power-products", "n": 5001, "line": "| Excitation mode | Self-excitation" }
- Cấp cách điện: H — factSrc: { "supplierId": "hyundai-power-products", "n": 5001, "line": "| Insulation class | H" }
- Cấp bảo vệ: IP23 — factSrc: { "supplierId": "hyundai-power-products", "n": 5001, "line": "| Protection class | IP23" }

### Động cơ 6BT5.9-G2 — hãng: Cummins
- Điều tốc: Electrical — factSrc: { "supplierId": "longkai-power", "n": 1063, "line": "| Governor type | Electrical" }
- Điều tốc: Electronic speed — factSrc: { "supplierId": "aosif", "n": 1015, "line": "| Governor | Electronic speed" }
- Dung tích xi lanh: 5.9L — factSrc: { "supplierId": "aosif", "n": 1015, "line": "| Displacement | 5.9L" }
- Dung tích xi lanh: 5.88L — factSrc: { "supplierId": "mingbang-mbkl", "n": 142, "line": "| Displacement | 5.88L" }
- Số xi lanh: 6 — factSrc: { "supplierId": "aosif", "n": 1015, "line": "| No. of cylinder | 6" }
- Số xi lanh: 6 — factSrc: { "supplierId": "fdk-energy", "n": 1006, "line": "| Cylinder quantity | 6" }
- Dầu bôi trơn: 16 — factSrc: { "supplierId": "bdadl-shanghai", "n": 124, "line": "| BDA-C80 | 80/100 | 东风康明斯 | 6BT5.9-G2 | 6 | 5.88 | 16 | ≤206 | 2100*850*1450 | 950" }
- Dầu bôi trơn: 16 — factSrc: { "supplierId": "fukangsi-yangzhou", "n": 2001, "line": "| FKS-C80 | 80/100 | 东风康明斯 | 6BT5.9-G2 | 6 | 5.88 | 16 | ≤210 | 2100*850*1450 | 950" } (tìm trên internet, trang chính hãng)
- Đường kính × hành trình: 102×120 mm — factSrc: { "supplierId": "mingbang-mbkl", "n": 142, "line": "| Bore×Stroke | 102×120 mm" }
- Đường kính × hành trình: 102x120mm — factSrc: { "supplierId": "aosif", "n": 1015, "line": "| Bore x Stroke | 102x120mm" }
- Tỉ số nén: 17.3:1 — factSrc: { "supplierId": "aosif", "n": 1015, "line": "| Compression ratio | 17.3:1" }
- Tỉ số nén: 17.3:1 — factSrc: { "supplierId": "fdk-energy", "n": 1006, "line": "| Compression Ratio | 17.3:1" }
- Làm mát: Water — factSrc: { "supplierId": "depco-power", "n": 2477, "line": "| Cylinder | 6 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Nạp khí: Turbo — factSrc: { "supplierId": "longkai-power", "n": 1063, "line": "| Aspiration | Turbo" }
- Nạp khí: Turbo-charged — factSrc: { "supplierId": "fdk-energy", "n": 1006, "line": "| Aspiration | Turbo-charged" }
- Tiêu chuẩn khí thải: 国Ⅱ — factSrc: { "supplierId": "senci-jiangsu", "n": 106, "line": "| | | 6BT5.9-G2 | 86/92 | 102X120 | 6 | 17 | ≤214 | 国Ⅱ | 2200*850*1600 | 1060" }
- Tiêu chuẩn khí thải: 国Ⅱ — factSrc: { "supplierId": "senci", "n": 2008, "line": "| | | 6BT5.9-G2 | 86/92 | 102X120 | 6 | 17 | ≤214 | 国Ⅱ | 2200*850*1600 | 1060" } (tìm trên internet, trang không phải của hãng)
- ⚠ Công suất động cơ (prime): các nguồn ghi khác nhau (86 kW / 96 kW / 100 kW) — không dùng làm "met"
- Công suất động cơ (prime): 86 — factSrc: { "supplierId": "weiman-fujian", "n": 110, "line": "| 80 | 100 | 88 | 110 | 6BT5.9-G2 | 86 | 92 | 214 | 22.3 | 6×102×120 | 5.9 | 17.3:1 | TC | More data" }
- Công suất động cơ (prime): 100 — factSrc: { "supplierId": "weiman-fujian", "n": 110, "line": "| WT-C110 | 80 | 100 | 88 | 110 | 6BT5.9-G2 | 100 | 110 | 235 | 28.5 | 6×102×120 | 5.9 | 17.3:1 | TC | More data" }
- Công suất động cơ (prime): 86 — factSrc: { "supplierId": "keliang-fuan", "n": 116, "line": "| 80 | 100 | 88 | 110 | 6BT5.9-G2 | 86 | 92 | 214 | 22.3 | 6×102×120 | 5.9 | 17.3:1 | TC | WT-274C | 2230×830×1490 | 1095 | 2900*1100*1600 | 2200" }
- Công suất động cơ (prime): 100 — factSrc: { "supplierId": "keliang-fuan", "n": 116, "line": "| WT-C110 | 80 | 100 | 88 | 110 | 6BT5.9-G2 | 100 | 110 | 235 | 28.5 | 6×102×120 | 5.9 | 17.3:1 | TC | WT-224G | 2230×830×1490 | 1095 | 2900*1100*1600 | 2200" }
- ⚠ Công suất động cơ (standby): các nguồn ghi khác nhau (92 kW / 106 kW / 110 kW) — không dùng làm "met"
- Công suất động cơ (standby): 92 — factSrc: { "supplierId": "weiman-fujian", "n": 110, "line": "| 80 | 100 | 88 | 110 | 6BT5.9-G2 | 86 | 92 | 214 | 22.3 | 6×102×120 | 5.9 | 17.3:1 | TC | More data" }
- Công suất động cơ (standby): 110 — factSrc: { "supplierId": "weiman-fujian", "n": 110, "line": "| WT-C110 | 80 | 100 | 88 | 110 | 6BT5.9-G2 | 100 | 110 | 235 | 28.5 | 6×102×120 | 5.9 | 17.3:1 | TC | More data" }
- Công suất động cơ (standby): 92 — factSrc: { "supplierId": "keliang-fuan", "n": 116, "line": "| 80 | 100 | 88 | 110 | 6BT5.9-G2 | 86 | 92 | 214 | 22.3 | 6×102×120 | 5.9 | 17.3:1 | TC | WT-274C | 2230×830×1490 | 1095 | 2900*1100*1600 | 2200" }
- Công suất động cơ (standby): 110 — factSrc: { "supplierId": "keliang-fuan", "n": 116, "line": "| WT-C110 | 80 | 100 | 88 | 110 | 6BT5.9-G2 | 100 | 110 | 235 | 28.5 | 6×102×120 | 5.9 | 17.3:1 | TC | WT-224G | 2230×830×1490 | 1095 | 2900*1100*1600 | 2200" }
- Khởi động: 24V Electrical starting — factSrc: { "supplierId": "mingbang-mbkl", "n": 142, "line": "| Starting Method | 24V Electrical starting" }

### Đầu phát UCI224G — hãng: Stamford
- ⚠ Ổn định điện áp: các nguồn ghi khác nhau (± 0.5 % / ± 1.0 % / ≤±1% / ±5%) — không dùng làm "met"
- Ổn định điện áp: ≤±1% — factSrc: { "supplierId": "gb-power", "n": 1011, "line": "| Voltage Regulation, | ≤±1%" }
- Ổn định điện áp: ±5% — factSrc: { "supplierId": "shanhua", "n": 1016, "line": "| 电压调节 Voltage Regulation | ±5%" }
- Ổn định điện áp: ≤±1% — factSrc: { "supplierId": "fdk-energy", "n": 1006, "line": "| Voltage regulation NL-FL | ≤±1%" }
- Ổn định điện áp: ± 0.5 % — factSrc: { "supplierId": "stamford-avk-china", "n": 1015, "line": "| VOLTAGE REGULATION | ± 0.5 % | ± 1.0 % | With 4% ENGINE GOVERNING" }
- Cấp cách điện: H — factSrc: { "supplierId": "fdk-energy", "n": 1006, "line": "| Insulation grade | H" }
- Cấp cách điện: H — factSrc: { "supplierId": "gb-power", "n": 1011, "line": "| Insulation Class | H" }
- ⚠ Cấp bảo vệ: các nguồn ghi khác nhau (IP23 / IP22) — không dùng làm "met"
- Cấp bảo vệ: IP23 — factSrc: { "supplierId": "stamford-avk-china", "n": 1015, "line": "| PROTECTION | IP23" }
- Cấp bảo vệ: IP23 — factSrc: { "supplierId": "fdk-energy", "n": 1006, "line": "| Protection grade | IP23" }
- Cấp bảo vệ: IP22 — factSrc: { "supplierId": "gb-power", "n": 1011, "line": "| Protection Class | IP22" }
- ⚠ Hiệu suất đầu phát: các nguồn ghi khác nhau (90.3 / 90.8 / 38.6) — không dùng làm "met"
- Hiệu suất đầu phát: 90.3 — factSrc: { "supplierId": "stamford-avk-china", "n": 1015, "line": "| Efficiency (%) | 90.3 | 90.6 | 90.7 | 91.0 | 89.8 | 90.2 | 90.4 | 90.9 | 89.7 | 90.1 | 90.3 | 90.8 | 89.6 | 89.9 | 90.1 | 90.7" }
- Hiệu suất đầu phát: 90.8 — factSrc: { "supplierId": "stamford-avk-china", "n": 1015, "line": "| Efficiency (%) | 90.8 | 91.0 | 91.1 | 91.3 | 90.5 | 90.8 | 90.9 | 91.0 | 90.3 | 90.6 | 90.9 | 90.9 | 90.2 | 90.4 | 90.7 | 90.8" }
- Hiệu suất đầu phát: 38.6 — factSrc: { "supplierId": "westinpower", "n": 112, "line": "| 1 | RB90NT | 72 | 90 | E0834 LE322 | UCI224G | 4/L | 108*125 | 4.58 | 38.6 | 49.0 | 137 | 100AH/24V | A2N250 TMF160/1600 FF 3P | 2305*809*960 | 899" }
- Kích từ / AVR: Single bearing, Brushless, — factSrc: { "supplierId": "fdk-energy", "n": 1006, "line": "| Exciter type | Single bearing, Brushless," }
- Méo sóng hài (THD): ＜2% — factSrc: { "supplierId": "shanhua", "n": 1016, "line": "| 电话谐波系数 THF | ＜2%" }

### Động cơ 1104C-44TAG2 — hãng: Perkins
- Điều tốc: ELECTRONIC — factSrc: { "supplierId": "genlitec", "n": 1016, "line": "| Governing Type | ELECTRONIC" }
- Điều tốc: Electronic — factSrc: { "supplierId": "ade-power", "n": 2057, "line": "| Engine Governor | Electronic" } (tìm trên internet, trang chính hãng)
- ⚠ Dung tích xi lanh: các nguồn ghi khác nhau (4.41 / 4.4 / 4.4L / 12.6) — không dùng làm "met"
- Dung tích xi lanh: 4.4L — factSrc: { "supplierId": "fdk-energy", "n": 1086, "line": "| Displacement | 4.4L" }
- Dung tích xi lanh: 4.4L — factSrc: { "supplierId": "genlitec", "n": 125, "line": "| Displacement | 4.4L" }
- Dung tích xi lanh: 4.4L — factSrc: { "supplierId": "westinpower", "n": 1147, "line": "| Displacement | 4.4L" }
- Dung tích xi lanh: 4.41 — factSrc: { "supplierId": "tecgen-fujian", "n": 121, "line": "| Displacement (Liter) | 4.41" }
- Số xi lanh: 4 — factSrc: { "supplierId": "genlitec", "n": 1016, "line": "| No. of Cylinders | 4" }
- Số xi lanh: 4 — factSrc: { "supplierId": "fdk-energy", "n": 1086, "line": "| Cylinder quantity | 4" }
- Dầu bôi trơn: 8.0 — factSrc: { "supplierId": "shanhua", "n": 1018, "line": "| 润滑油总容量Total Lubrication (L) | 8.0" }
- Dầu bôi trơn: 8 — factSrc: { "supplierId": "bdadl-shanghai", "n": 124, "line": "| BDA-P80 | 80/100 | 珀金斯 | 1104C-44TAG2 | 4 | 4.4 | 8 | ≤211 | 2150*900*1550 | 1200" }
- ⚠ Làm mát: các nguồn ghi khác nhau (Water / WATER / 水冷) — không dùng làm "met"
- Làm mát: WATER — factSrc: { "supplierId": "genlitec", "n": 1016, "line": "| Cooling Method | WATER" }
- Làm mát: 水冷 — factSrc: { "supplierId": "shanhua", "n": 1018, "line": "| 冷却方式 Cooling system | 水冷" }
- Làm mát: Water — factSrc: { "supplierId": "depco-power", "n": 2431, "line": "| Cylinder | 4 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- ⚠ Đường kính × hành trình: các nguồn ghi khác nhau (105 X 127 / 105×127 / 105*127 / 105 x 127mm / 100×127 / 105 x 127 / 100*127 / 105 / 105/127 / 105 mm ×127 mm) — không dùng làm "met"
- Đường kính × hành trình: 105 — factSrc: { "supplierId": "shanhua", "n": 1018, "line": "| 缸径 Bore(mm) | 105" }
- Đường kính × hành trình: 105 x 127mm — factSrc: { "supplierId": "genlitec", "n": 125, "line": "| Bore x Stroke | 105 x 127mm" }
- Đường kính × hành trình: 105*127 — factSrc: { "supplierId": "tecgen-fujian", "n": 121, "line": "| Bore*Stroke (mm*mm) | 105*127" }
- Đường kính × hành trình: 105 mm ×127 mm — factSrc: { "supplierId": "westinpower", "n": 1147, "line": "| Bore and Stroke | 105 mm ×127 mm" }
- ⚠ Tỉ số nén: các nguồn ghi khác nhau (18.23:1 / 18.3:1 / 18.2:1 / 18·2 :1 / 18.2 :1 / 18.2 : 1) — không dùng làm "met"
- Tỉ số nén: 18.3:1 — factSrc: { "supplierId": "genlitec", "n": 1016, "line": "| Compression Ratio | 18.3:1" }
- Tỉ số nén: 18.23:1 — factSrc: { "supplierId": "fdk-energy", "n": 1086, "line": "| Compression Ratio | 18.23:1" }
- Tỉ số nén: 18.2 : 1 — factSrc: { "supplierId": "westinpower", "n": 1147, "line": "| Compression ratio | 18.2 : 1" }
- Tỉ số nén: 18.2:1 — factSrc: { "supplierId": "shanhua", "n": 1018, "line": "| 压缩比 Compression ratio | 18.2:1" }
- ⚠ Nạp khí: các nguồn ghi khác nhau (Turbo charged / 涡轮增压Turbocharged) — không dùng làm "met"
- Nạp khí: Turbo charged — factSrc: { "supplierId": "fdk-energy", "n": 1086, "line": "| Aspiration | Turbo charged" }
- Nạp khí: 涡轮增压Turbocharged — factSrc: { "supplierId": "shanhua", "n": 1018, "line": "| 进气方式 Aspiration | 涡轮增压Turbocharged" }
- Tiêu chuẩn khí thải: T2 — factSrc: { "supplierId": "hanyang-weifang", "n": 101, "line": "| HY-81 | 1104C-44TAG2 | 90 | 100 | 4 | 105*127 | 4.4 | 216 | 2000*600*1200 | 1150 | T2" }
- Khởi động: DC 24V Electrical Starting — factSrc: { "supplierId": "tecgen-fujian", "n": 121, "line": "| Starting Method | DC 24V Electrical Starting" }
- Công suất động cơ (prime): 90 — factSrc: { "supplierId": "weiman-fujian", "n": 111, "line": "| WT-P110 | 80 | 100 | 88 | 110 | 1104C-44TAG2 | 90 | 100 | 205 | 22.6 | 4×105×127 | 4.41 | 18·2 :1 | TC | More data" }
- Công suất động cơ (prime): 102 — factSrc: { "supplierId": "weiman-fujian", "n": 111, "line": "| WT-P124 | 90 | 113 | 99 | 124 | 1104C-44TAG2 | 102 | 112 | 218 | 26.9 | 4×105 x 127 | 4.41 | 18.2 :1 | TC | More data" }
- Công suất động cơ (standby): 100 — factSrc: { "supplierId": "weiman-fujian", "n": 111, "line": "| WT-P110 | 80 | 100 | 88 | 110 | 1104C-44TAG2 | 90 | 100 | 205 | 22.6 | 4×105×127 | 4.41 | 18·2 :1 | TC | More data" }
- Công suất động cơ (standby): 112 — factSrc: { "supplierId": "weiman-fujian", "n": 111, "line": "| WT-P124 | 90 | 113 | 99 | 124 | 1104C-44TAG2 | 102 | 112 | 218 | 26.9 | 4×105 x 127 | 4.41 | 18.2 :1 | TC | More data" }

### Đầu phát UCI274C — hãng: Stamford
- ⚠ Ổn định điện áp: các nguồn ghi khác nhau (± 0.5 % / ± 1.0 % / ≤±1% / 1.00%) — không dùng làm "met"
- Ổn định điện áp: ≤±1% — factSrc: { "supplierId": "gb-power", "n": 1012, "line": "| Voltage Regulation, | ≤±1%" }
- Ổn định điện áp: ≤±1% — factSrc: { "supplierId": "fdk-energy", "n": 1007, "line": "| Voltage regulation NL-FL | ≤±1%" }
- Ổn định điện áp: 1.00% — factSrc: { "supplierId": "tecgen-fujian", "n": 121, "line": "| Voltage Regulation, Steady State | 1.00%" }
- Ổn định điện áp: ± 0.5 % — factSrc: { "supplierId": "stamford-avk-china", "n": 1002, "line": "| VOLTAGE REGULATION | ± 0.5 % | ± 1.0 % | With 4% ENGINE GOVERNING" }
- Cấp cách điện: H — factSrc: { "supplierId": "fdk-energy", "n": 1007, "line": "| Insulation grade | H" }
- Cấp cách điện: H — factSrc: { "supplierId": "gb-power", "n": 1012, "line": "| Insulation Class | H" }
- ⚠ Cấp bảo vệ: các nguồn ghi khác nhau (IP23 / IP22) — không dùng làm "met"
- Cấp bảo vệ: IP23 — factSrc: { "supplierId": "stamford-avk-china", "n": 1002, "line": "| PROTECTION | IP23" }
- Cấp bảo vệ: IP23 — factSrc: { "supplierId": "fdk-energy", "n": 1007, "line": "| Protection grade | IP23" }
- Cấp bảo vệ: IP22 — factSrc: { "supplierId": "gb-power", "n": 1012, "line": "| Protection Class | IP22" }
- ⚠ Hiệu suất đầu phát: các nguồn ghi khác nhau (90.7 / 90.9 / 90.30% / 36.4) — không dùng làm "met"
- Hiệu suất đầu phát: 90.7 — factSrc: { "supplierId": "stamford-avk-china", "n": 1002, "line": "| Efficiency (%) | 90.7 | 91.1 | 91.3" }
- Hiệu suất đầu phát: 90.30% — factSrc: { "supplierId": "huachai-deutz", "n": 122, "line": "| Rated voltage | 400/230V | Rated speed | 1500rpm | Efficiency | 90.30%" }
- Hiệu suất đầu phát: 90.9 — factSrc: { "supplierId": "stamford-avk-china", "n": 1002, "line": "| Efficiency (%) | 90.9 | 91.0 | 91.4 | 91.5 | 90.2 | 90.6 | 91.0 | 91.1 | 90.0 | 90.2 | 90.7 | 90.8 | 89.8 | 90.1 | 90.6 | 90.6" }
- Hiệu suất đầu phát: 36.4 — factSrc: { "supplierId": "westinpower", "n": 112, "line": "| RN95NT | 76 | 95 | E0836 E302 | UCI274C | 6/L | 108*125 | 6.9 | 36.4 | 53.6 | 144 | 100AH/24V | A2N250 TMF160/1600 FF 3P | 2440*740*1030 | 1000" }
- Kích từ / AVR: Single bearing, Brushless, — factSrc: { "supplierId": "fdk-energy", "n": 1007, "line": "| Exciter type | Single bearing, Brushless," }
- Kích từ / AVR: brushless self-exciting — factSrc: { "supplierId": "huachai-deutz", "n": 122, "line": "| Steady state frequency | ≤2.5% | Start mode | 24V electrical | Exciting way | brushless self-exciting" }

### Động cơ 6BT5.9-G1 — hãng: Cummins
- Số xi lanh: 6 — factSrc: { "supplierId": "aosif", "n": 1014, "line": "| No. of cylinder | 6" }
- Số xi lanh: 6 — factSrc: { "supplierId": "depco-power", "n": 2539, "line": "| Cylinder | 6 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Dung tích xi lanh: 5.9L — factSrc: { "supplierId": "aosif", "n": 1014, "line": "| Displacement | 5.9L" }
- Dung tích xi lanh: 5.88L — factSrc: { "supplierId": "mingbang-mbkl", "n": 139, "line": "| Displacement | 5.88L" }
- Điều tốc: Mechanical — factSrc: { "supplierId": "aosif", "n": 1014, "line": "| Governor | Mechanical" }
- Điều tốc: mechanical speed governors — factSrc: { "supplierId": "longkai-power", "n": 1061, "line": "| Governor type | mechanical speed governors" }
- Đường kính × hành trình: 102×120 mm — factSrc: { "supplierId": "mingbang-mbkl", "n": 139, "line": "| Bore×Stroke | 102×120 mm" }
- Đường kính × hành trình: 102x120mm — factSrc: { "supplierId": "aosif", "n": 1014, "line": "| Bore x Stroke | 102x120mm" }
- Tỉ số nén: 17.3:1 — factSrc: { "supplierId": "aosif", "n": 1014, "line": "| Compression ratio | 17.3:1" }
- Tỉ số nén: 17.3:1 — factSrc: { "supplierId": "depco-power", "n": 2539, "line": "| Cyle | 4 Staoke | Compression ratio | 17.3:1" } (tìm trên internet, trang chính hãng)
- Dầu bôi trơn: 16 — factSrc: { "supplierId": "bdadl-shanghai", "n": 124, "line": "| BDA-C80 | 80/100 | 东风康明斯 | 6BT5.9-G1 | 6 | 5.88 | 16 | ≤206 | 2100*850*1450 | 950" }
- Dầu bôi trơn: 16 — factSrc: { "supplierId": "fukangsi-yangzhou", "n": 2001, "line": "| FKS-C80 | 80/100 | 东风康明斯 | 6BT5.9-G1 | 6 | 5.88 | 16 | ≤210 | 2100*850*1450 | 950" } (tìm trên internet, trang chính hãng)
- Làm mát: Water — factSrc: { "supplierId": "depco-power", "n": 2539, "line": "| Cylinder | 6 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Tiêu chuẩn khí thải: T2 — factSrc: { "supplierId": "nenjo-generator", "n": 103, "line": "| HJ78C | 康明斯 Cummins | 78 | 83 | 6BT5.9-G1 | T2" }
- Tiêu chuẩn khí thải: 国Ⅱ — factSrc: { "supplierId": "senci-jiangsu", "n": 106, "line": "| | | 6BT5.9-G1 | 86/92 | 102X120 | 6 | 17 | ≤214 | 国Ⅱ | 2200*850*1600 | 1060" }
- Công suất động cơ (prime): 86 — factSrc: { "supplierId": "weiman-fujian", "n": 110, "line": "| WT-C110 | 80 | 100 | 88 | 110 | 6BT5.9-G1 | 86 | 92 | 208 | 21.7 | 6×102×120 | 5.9 | 17.3:1 | TC | More data" }
- Công suất động cơ (prime): 86 — factSrc: { "supplierId": "keliang-fuan", "n": 116, "line": "| WT-C110 | 80 | 100 | 88 | 110 | 6BT5.9-G1 | 86 | 92 | 208 | 21.7 | 6×102×120 | 5.9 | 17.3:1 | TC | WT-274C | 2230×830×1490 | 1095 | 2900*1100*1600 | 2200" }
- Công suất động cơ (standby): 92 — factSrc: { "supplierId": "weiman-fujian", "n": 110, "line": "| WT-C110 | 80 | 100 | 88 | 110 | 6BT5.9-G1 | 86 | 92 | 208 | 21.7 | 6×102×120 | 5.9 | 17.3:1 | TC | More data" }
- Công suất động cơ (standby): 92 — factSrc: { "supplierId": "keliang-fuan", "n": 116, "line": "| WT-C110 | 80 | 100 | 88 | 110 | 6BT5.9-G1 | 86 | 92 | 208 | 21.7 | 6×102×120 | 5.9 | 17.3:1 | TC | WT-274C | 2230×830×1490 | 1095 | 2900*1100*1600 | 2200" }
- Nạp khí: Turbo — factSrc: { "supplierId": "longkai-power", "n": 1061, "line": "| Aspiration | Turbo" }
- Khởi động: 24V Electrical starting — factSrc: { "supplierId": "mingbang-mbkl", "n": 139, "line": "| Starting Method | 24V Electrical starting" }

### Động cơ WP4.1D100E200 — hãng: Weichai / Deutz
- ⚠ Điều tốc: các nguồn ghi khác nhau (Electronic / Electrical / Mechanical / Electronic speed) — không dùng làm "met"
- Điều tốc: Electronic speed — factSrc: { "supplierId": "longkai-power", "n": 1129, "line": "| Governor type | Electronic speed" }
- Điều tốc: Electrical — factSrc: { "supplierId": "depco-power", "n": 2090, "line": "| Governor | Electrical | Displacement(L) | 4.087" } (tìm trên internet, trang chính hãng)
- Điều tốc: Electronic — factSrc: { "supplierId": "landtop-fuzhou", "n": 104, "line": "| LTP110W | 110 | 88 | 100 | 80 | Electronic | T2 | WP4.1D100E200 | LTP274-80" }
- Điều tốc: Electronic — factSrc: { "supplierId": "acepow-fuan", "n": 104, "line": "| APW-80 | 80 | 88 | UC274C | WP4.1D100E200 | 90 | 113 | 3#11.5-128 | T2 | Electronic" }
- Tiêu chuẩn khí thải: T2 — factSrc: { "supplierId": "landtop-fuzhou", "n": 104, "line": "| LTP110W | 110 | 88 | 100 | 80 | Electronic | T2 | WP4.1D100E200 | LTP274-80" }
- Tiêu chuẩn khí thải: 国Ⅱ — factSrc: { "supplierId": "senci-jiangsu", "n": 105, "line": "| | | WP4.1D100E200 | 90/100 | 105X118 | 4 | 13 | ≤201 | 国Ⅱ | 2100X950X1500 | 1130" }
- Số xi lanh: 4 — factSrc: { "supplierId": "depco-power", "n": 2090, "line": "| Cylinder | 4 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Số xi lanh: 4L — factSrc: { "supplierId": "aosif", "n": 124, "line": "| AW110 | 100/80 | 110/88 | WP4.1D100E200 | 21.4 | 4L | 4.1 |" }
- ⚠ Dung tích xi lanh: các nguồn ghi khác nhau (4.1 / 4.087 / 6.75 / 4.5 / 4.08) — không dùng làm "met"
- Dung tích xi lanh: 4.087 — factSrc: { "supplierId": "depco-power", "n": 2090, "line": "| Governor | Electrical | Displacement(L) | 4.087" } (tìm trên internet, trang chính hãng)
- Dung tích xi lanh: 4.1 — factSrc: { "supplierId": "aosif", "n": 124, "line": "| AW110 | 100/80 | 110/88 | WP4.1D100E200 | 21.4 | 4L | 4.1 |" }
- Dung tích xi lanh: 4.5 — factSrc: { "supplierId": "jlmech-wuhan", "n": 101, "line": "| JL-80GF | 80 | 100 | 144 | WP4.1D100E200 | 4 | 105*130 | 4.5 | 10 | 203" }
- Dung tích xi lanh: 4.08 — factSrc: { "supplierId": "waeta-fujian", "n": 107, "line": "| WTA-W110 | 110 | 88 | 100 | 80 | WP4.1D100E200 | 4 L | 4.08 | Wechai Series.xlsx" }
- Làm mát: Water — factSrc: { "supplierId": "depco-power", "n": 2090, "line": "| Cylinder | 4 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Đường kính × hành trình: 105*118 — factSrc: { "supplierId": "longkai-power", "n": 1129, "line": "| Bore*Stroke | mm | 105*118" }
- Đường kính × hành trình: 105 X 118 — factSrc: { "supplierId": "depco-power", "n": 2090, "line": "| Cylider arrangemant | IN-LINE | Bore and Stroke(mm) | 105 X 118" } (tìm trên internet, trang chính hãng)
- Tỉ số nén: 17.5:1 — factSrc: { "supplierId": "longkai-power", "n": 1129, "line": "| Compression ratio | 17.5:1" }
- Tỉ số nén: 17.5:1 — factSrc: { "supplierId": "depco-power", "n": 2090, "line": "| Cyle | 4 Staoke | Compression ratio | 17.5:1" } (tìm trên internet, trang chính hãng)
- ⚠ Dầu bôi trơn: các nguồn ghi khác nhau (10 / 17) — không dùng làm "met"
- Dầu bôi trơn: 10 — factSrc: { "supplierId": "jlmech-wuhan", "n": 101, "line": "| JL-80GF | 80 | 100 | 144 | WP4.1D100E200 | 4 | 105*130 | 4.5 | 10 | 203" }
- Dầu bôi trơn: 17 — factSrc: { "supplierId": "liangzi-yangzhou", "n": 122, "line": "| LZ-W90 | 90/112.5 | 潍柴动力 | WP4.1D100E200 | 4 | 4.1 | 17 | ≤220 | 2200*800*1400 | 1200 | 详细参数" }
- Nạp khí: Turbocharged&Intercooling — factSrc: { "supplierId": "longkai-power", "n": 1129, "line": "| Aspiration | Turbocharged&Intercooling" }

### Động cơ 4BTAA3.9-G3 — hãng: Cummins
- ⚠ Số xi lanh: các nguồn ghi khác nhau (4L / 4 / 6) — không dùng làm "met"
- Số xi lanh: 4 — factSrc: { "supplierId": "aosif", "n": 1017, "line": "| No. of cylinder | 4" }
- Số xi lanh: 4L — factSrc: { "supplierId": "aosif", "n": 101, "line": "| AC110-I | 100/80 | 110/88 | 4BTAA3.9-G3 | 24.7 | 4L | 3.9 |" }
- Số xi lanh: 4 — factSrc: { "supplierId": "yanan-power", "n": 101, "line": "| YN110C | 110kVA | 88kW | 100kVA | 80kW | 4BTAA3.9-G3 | 4 | YN110C" }
- Số xi lanh: 6 — factSrc: { "supplierId": "bdadl-shanghai", "n": 131, "line": "| BDA-C80 | 80/88 | 东风康明斯 | 4BTAA3.9-G3 | 6 | 3.92 | 16 | ≤210 | 2100*850*1450 | 950" }
- Dung tích xi lanh: 3.9 L — factSrc: { "supplierId": "aosif", "n": 1017, "line": "| Displacement | 3.9 L" }
- Dung tích xi lanh: 3.9 — factSrc: { "supplierId": "aosif", "n": 101, "line": "| AC110-I | 100/80 | 110/88 | 4BTAA3.9-G3 | 24.7 | 4L | 3.9 |" }
- Điều tốc: Electronic — factSrc: { "supplierId": "aosif", "n": 1017, "line": "| Governor | Electronic" }
- Đường kính × hành trình: 102x120 mm — factSrc: { "supplierId": "aosif", "n": 1017, "line": "| Bore x Stroke | 102x120 mm" }
- Đường kính × hành trình: 102*120 — factSrc: { "supplierId": "wiseke-taizhou", "n": 102, "line": "| WDL-88C1 | 100 / 80 | 110 / 88 | 4BTAA3.9-G3 | 96 | 106 | 4 | 102*120 | 1850*850*1200 | 1150" }
- Tỉ số nén: 18.0:1 — factSrc: { "supplierId": "aosif", "n": 1017, "line": "| Compression ratio | 18.0:1" }
- Tỉ số nén: 18:1 — factSrc: { "supplierId": "jinlongteng-fujian", "n": 101, "line": "| JDC110 | 80 | 100 | 88 | 110 | 4BTAA3.9-G3 | 96 | 106 | 212 | 24.7 | 4×102×120 | 3.9 | 18:1 | 10.9 | 22 | JLT274C(80KW) | UCI274C(80KW) | 2450*980*1450 | 1280 | 1900*750*1300 | 945" }
- ⚠ Dầu bôi trơn: các nguồn ghi khác nhau (16 / 11) — không dùng làm "met"
- Dầu bôi trơn: 16 — factSrc: { "supplierId": "bdadl-shanghai", "n": 131, "line": "| BDA-C80 | 80/88 | 东风康明斯 | 4BTAA3.9-G3 | 6 | 3.92 | 16 | ≤210 | 2100*850*1450 | 950" }
- Dầu bôi trơn: 11 — factSrc: { "supplierId": "yunding-jiangsu", "n": 2005, "line": "| YDK-90GF | 90 | 112.5 | 162 | 4BTAA3.9-G3 | 4 | 102*120 | 3.9 | 11 | 212 | 2000*850*1350 | 1100" } (tìm trên internet, trang chính hãng)
- Công suất động cơ (prime): 96 — factSrc: { "supplierId": "jinlongteng-fujian", "n": 101, "line": "| JDC110 | 80 | 100 | 88 | 110 | 4BTAA3.9-G3 | 96 | 106 | 212 | 24.7 | 4×102×120 | 3.9 | 18:1 | 10.9 | 22 | JLT274C(80KW) | UCI274C(80KW) | 2450*980*1450 | 1280 | 1900*750*1300 | 945" }
- Công suất động cơ (standby): 106 — factSrc: { "supplierId": "jinlongteng-fujian", "n": 101, "line": "| JDC110 | 80 | 100 | 88 | 110 | 4BTAA3.9-G3 | 96 | 106 | 212 | 24.7 | 4×102×120 | 3.9 | 18:1 | 10.9 | 22 | JLT274C(80KW) | UCI274C(80KW) | 2450*980*1450 | 1280 | 1900*750*1300 | 945" }
- Tiêu chuẩn khí thải: T2 — factSrc: { "supplierId": "nenjo-generator", "n": 103, "line": "| HJ87C | 康明斯 Cummins | 87 | 96 | 4BTAA3.9-G3 | T2" }

### Động cơ CA4DF2-12D — hãng: FAWDE
- Số xi lanh: 4 — factSrc: { "supplierId": "depco-power", "n": 2581, "line": "| Cylinder | 4 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Số xi lanh: 4 — factSrc: { "supplierId": "xinhengxin-fujian", "n": 120, "line": "| XHX-X75 | 75/93 | 83/103 | 50 | CA4DF2-12D | 84 | 15.4 | 4 | 2200x860x1300/1150 | 2600x1050x1430/1300" }
- Làm mát: Water — factSrc: { "supplierId": "depco-power", "n": 2581, "line": "| Cylinder | 4 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Đường kính × hành trình: 110 X 125 — factSrc: { "supplierId": "depco-power", "n": 2581, "line": "| Cylider arrangemant | IN-LINE | Bore and Stroke(mm) | 110 X 125" } (tìm trên internet, trang chính hãng)
- Tỉ số nén: 17.5:1 — factSrc: { "supplierId": "depco-power", "n": 2581, "line": "| Cyle | 4 Staoke | Compression ratio | 17.5:1" } (tìm trên internet, trang chính hãng)
- Điều tốc: Electrical — factSrc: { "supplierId": "depco-power", "n": 2581, "line": "| Governor | Electrical | Displacement(L) | 4.75" } (tìm trên internet, trang chính hãng)
- Dung tích xi lanh: 4.75 — factSrc: { "supplierId": "depco-power", "n": 2581, "line": "| Governor | Electrical | Displacement(L) | 4.75" } (tìm trên internet, trang chính hãng)
- Công suất động cơ (prime): 84 — factSrc: { "supplierId": "weiman-fujian", "n": 106, "line": "| WT-FD103 | 75 | 94 | 83 | 103 | CA4DF2-12D | 84 | 92 | 205 | 20.26 | 4×110×125 | 4.75 | 17:1 | TC | More data" }
- Công suất động cơ (prime): 84 — factSrc: { "supplierId": "keliang-fuan", "n": 107, "line": "| WT-FW103 | 75 | 94 | 83 | 103 | CA4DF2-12D | 84 | 92 | 205 | 20.26 | 4x110x125 | 4.75 | 17:1 | TC | WT-274C | 2260x860x1170 | 1035 | 2900x1100x1600 | 1780" }
- Công suất động cơ (standby): 92 — factSrc: { "supplierId": "weiman-fujian", "n": 106, "line": "| WT-FD103 | 75 | 94 | 83 | 103 | CA4DF2-12D | 84 | 92 | 205 | 20.26 | 4×110×125 | 4.75 | 17:1 | TC | More data" }
- Công suất động cơ (standby): 92 — factSrc: { "supplierId": "keliang-fuan", "n": 107, "line": "| WT-FW103 | 75 | 94 | 83 | 103 | CA4DF2-12D | 84 | 92 | 205 | 20.26 | 4x110x125 | 4.75 | 17:1 | TC | WT-274C | 2260x860x1170 | 1035 | 2900x1100x1600 | 1780" }

### Đầu phát NIANFENG NF274C
- Kích từ / AVR: Single bearing, Brushless, — factSrc: { "supplierId": "fdk-energy", "n": 1138, "line": "| Exciter type | Single bearing, Brushless," }
- Ổn định điện áp: ≤±1% — factSrc: { "supplierId": "fdk-energy", "n": 1138, "line": "| Voltage regulation NL-FL | ≤±1%" }
- Cấp cách điện: H — factSrc: { "supplierId": "fdk-energy", "n": 1138, "line": "| Insulation grade | H" }
- Cấp bảo vệ: IP23 — factSrc: { "supplierId": "fdk-energy", "n": 1138, "line": "| Protection grade | IP23" }

### Đầu phát LK274C
- Kích từ / AVR: Brushless, self-excitation — factSrc: { "supplierId": "longkai-power", "n": 1026, "line": "| Exciter Type | Brushless, self-excitation" }
- Cấp bảo vệ: IP 23 — factSrc: { "supplierId": "longkai-power", "n": 1026, "line": "| Protection Grade | IP 23" }
- Cấp cách điện: H/H — factSrc: { "supplierId": "longkai-power", "n": 1026, "line": "| Insulation grade | H/H" }

### Động cơ SC4H140D2 — hãng: SDEC
- Số xi lanh: 4 — factSrc: { "supplierId": "fdk-energy", "n": 1197, "line": "| Cylinder quantity | 4" }
- Số xi lanh: 4 — factSrc: { "supplierId": "depco-power", "n": 2234, "line": "| Cylinder | 4 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Dung tích xi lanh: 4.3L — factSrc: { "supplierId": "fdk-energy", "n": 1197, "line": "| Displacement | 4.3L" }
- Dung tích xi lanh: 4.3 — factSrc: { "supplierId": "depco-power", "n": 2234, "line": "| Governor | Electrical | Displacement(L) | 4.3" } (tìm trên internet, trang chính hãng)
- Dầu bôi trơn: 15 — factSrc: { "supplierId": "bdadl-shanghai", "n": 127, "line": "| BDA-S80 | 80/90 | 上柴动力 | SC4H140D2 | 4 | 4.3 | 15 | ≤215 | 2100*700*1450 | 1050" }
- Làm mát: Water — factSrc: { "supplierId": "depco-power", "n": 2234, "line": "| Cylinder | 4 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Đường kính × hành trình: 105×124 — factSrc: { "supplierId": "fdk-energy", "n": 1197, "line": "| Bore x Stroke (mm x mm) | 105×124" }
- Đường kính × hành trình: 105 X 124 — factSrc: { "supplierId": "depco-power", "n": 2234, "line": "| Cylider arrangemant | IN-LINE | Bore and Stroke(mm) | 105 X 124" } (tìm trên internet, trang chính hãng)
- Tỉ số nén: 16:1 — factSrc: { "supplierId": "fdk-energy", "n": 1197, "line": "| Compression Ratio | 16:1" }
- Tỉ số nén: 16.0:1 — factSrc: { "supplierId": "depco-power", "n": 2234, "line": "| Cyle | 4 Staoke | Compression ratio | 16.0:1" } (tìm trên internet, trang chính hãng)
- ⚠ Điều tốc: các nguồn ghi khác nhau (Electrical / Electronic / 电子调速E) — không dùng làm "met"
- Điều tốc: Electrical — factSrc: { "supplierId": "fdk-energy", "n": 1197, "line": "| Speed governor | Electrical" }
- Điều tốc: Electrical — factSrc: { "supplierId": "depco-power", "n": 2234, "line": "| Governor | Electrical | Displacement(L) | 4.3" } (tìm trên internet, trang chính hãng)
- Điều tốc: 电子调速E — factSrc: { "supplierId": "nenjo-generator", "n": 154, "line": "| HJ86SC | SC4H140D2 | 95/1500 | 105/1500 | 86 | 94 | 电子调速E | 国二 T2" }
- Điều tốc: Electronic — factSrc: { "supplierId": "landtop-fuzhou", "n": 121, "line": "| LTP110 SD | 110 | 88 | 100 | 80 | Electronic | G2 | SC4H140D2 | LTP274S-80" }
- Nạp khí: Turbo-charged — factSrc: { "supplierId": "fdk-energy", "n": 1197, "line": "| Aspiration | Turbo-charged" }
- Tiêu chuẩn khí thải: 国二 T2 — factSrc: { "supplierId": "nenjo-generator", "n": 154, "line": "| HJ86SC | SC4H140D2 | 95/1500 | 105/1500 | 86 | 94 | 电子调速E | 国二 T2" }

### Động cơ CA6DF2D-14D — hãng: FAWDE
- ⚠ Số xi lanh: các nguồn ghi khác nhau (6 / 4 L) — không dùng làm "met"
- Số xi lanh: 6 — factSrc: { "supplierId": "depco-power", "n": 2327, "line": "| Cylinder | 6 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Số xi lanh: 4 L — factSrc: { "supplierId": "waeta-fujian", "n": 112, "line": "| WTA-FW110 | 110 | 88 | 100 | 80 | CA6DF2D-14D | 4 L | 6.55 | Fawde Series.xlsx" }
- Số xi lanh: 6 — factSrc: { "supplierId": "xinhengxin-fujian", "n": 120, "line": "| XHX-X80 | 80/100 | 88/124 | 50 | CA6DF2D-14D | 96 | 16.2 | 6 | 2250x860x1300/1200 | 2800x1100x1550/1560" }
- Làm mát: Water — factSrc: { "supplierId": "depco-power", "n": 2327, "line": "| Cylinder | 6 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Đường kính × hành trình: 110 X 125 — factSrc: { "supplierId": "depco-power", "n": 2327, "line": "| Cylider arrangemant | IN-LINE | Bore and Stroke(mm) | 110 X 125" } (tìm trên internet, trang chính hãng)
- Tỉ số nén: 17.5:1 — factSrc: { "supplierId": "depco-power", "n": 2327, "line": "| Cyle | 4 Staoke | Compression ratio | 17.5:1" } (tìm trên internet, trang chính hãng)
- Điều tốc: Electrical — factSrc: { "supplierId": "depco-power", "n": 2327, "line": "| Governor | Electrical | Displacement(L) | 6.5" } (tìm trên internet, trang chính hãng)
- Dung tích xi lanh: 6.5 — factSrc: { "supplierId": "depco-power", "n": 2327, "line": "| Governor | Electrical | Displacement(L) | 6.5" } (tìm trên internet, trang chính hãng)
- Dung tích xi lanh: 6.55 — factSrc: { "supplierId": "waeta-fujian", "n": 112, "line": "| WTA-FW110 | 110 | 88 | 100 | 80 | CA6DF2D-14D | 4 L | 6.55 | Fawde Series.xlsx" }
- Công suất động cơ (prime): 96 — factSrc: { "supplierId": "weiman-fujian", "n": 106, "line": "| WT-FD110 | 80 | 100 | 88 | 110 | CA6DF2D-14D | 96 | 104 | 202 | 22.81 | 6×110×115 | 6.55 | 17:1 | TC | More data" }
- Công suất động cơ (prime): 96 — factSrc: { "supplierId": "keliang-fuan", "n": 107, "line": "| WT-FW110 | 80 | 100 | 88 | 110 | CA6DF2D-14D | 96 | 104 | 202 | 22.81 | 6x110x115 | 6.55 | 17:1 | TC | WT-274C | 2490x780x1340 | 1335 | 2900x1100x1600 | 1780" }
- Công suất động cơ (standby): 104 — factSrc: { "supplierId": "weiman-fujian", "n": 106, "line": "| WT-FD110 | 80 | 100 | 88 | 110 | CA6DF2D-14D | 96 | 104 | 202 | 22.81 | 6×110×115 | 6.55 | 17:1 | TC | More data" }
- Công suất động cơ (standby): 104 — factSrc: { "supplierId": "keliang-fuan", "n": 107, "line": "| WT-FW110 | 80 | 100 | 88 | 110 | CA6DF2D-14D | 96 | 104 | 202 | 22.81 | 6x110x115 | 6.55 | 17:1 | TC | WT-274C | 2490x780x1340 | 1335 | 2900x1100x1600 | 1780" }

### Động cơ TAD551GE — hãng: Volvo Penta
- Số xi lanh: 4 — factSrc: { "supplierId": "comappower", "n": 108, "line": "| COM110V | 110kVA | 88kW | 100kVA | 80kW | TAD551GE | 4 | COM110V" }
- Số xi lanh: 4 — factSrc: { "supplierId": "comappower", "n": 108, "line": "| COM125V | 125kVA | 100kW | 113kVA | 90kW | TAD551GE | 4 | COM125V" }
- Dung tích xi lanh: 4.76 — factSrc: { "supplierId": "jinjia-power", "n": 103, "line": "| JJV-90GF | 90 | 99 | 112.5 | TAD551GE | 4 | 4.76 | 214 | 1150 | 2100×960×1450" }
- Dung tích xi lanh: 4.76 — factSrc: { "supplierId": "bdadl-shanghai", "n": 134, "line": "| BDA-V80 | 80/88 | 沃尔沃奔达 | TAD551GE | 4 | 4.76 | 13 | ≤206 | 2100*960*1450 | 1150" }
- ⚠ Dầu bôi trơn: các nguồn ghi khác nhau (13 / 19) — không dùng làm "met"
- Dầu bôi trơn: 13 — factSrc: { "supplierId": "bdadl-shanghai", "n": 134, "line": "| BDA-V80 | 80/88 | 沃尔沃奔达 | TAD551GE | 4 | 4.76 | 13 | ≤206 | 2100*960*1450 | 1150" }
- Dầu bôi trơn: 13 — factSrc: { "supplierId": "fukangsi-yangzhou", "n": 2005, "line": "| FKS-V80 | 80/100 | 沃尔沃遍达 | TAD551GE | 4 | 4.76 | 13 | ≤206 | 2200*760*1380 | 1150" } (tìm trên internet, trang chính hãng)
- Dầu bôi trơn: 13 — factSrc: { "supplierId": "pengpai-yangzhou", "n": 126, "line": "| PPDL-V80 | 80/100 | 沃尔沃遍达 | TAD551GE | 4 | 4.76 | 13 | ≤206 | 2200*760*1380 | 1150" }
- Dầu bôi trơn: 19 — factSrc: { "supplierId": "xingguang-jiangsu", "n": 102, "line": "| XG-88GF-1 | 80/88 | TAD551GE | 91/100 | 4 | 19 | 218 | 国 III | 2200×720×1380 | 1200" }
- Tỉ số nén: 18.0:1 — factSrc: { "supplierId": "jet-power", "n": 132, "line": "| V-110 | 110 | 88 | 100 | 80 | TAD551GE | 4 / In Line | 108×130 mm | 4.76 | Electronic | 18.0:1 | UCI274C" }
- Điều tốc: Electronic — factSrc: { "supplierId": "jet-power", "n": 132, "line": "| V-110 | 110 | 88 | 100 | 80 | TAD551GE | 4 / In Line | 108×130 mm | 4.76 | Electronic | 18.0:1 | UCI274C" }
- Đường kính × hành trình: 108x130 — factSrc: { "supplierId": "senci-jiangsu", "n": 108, "line": "| | 80/88 | TAD551GE | 90/98 | 108x130 | 4 | 19 | 218 | 国Ⅲ | 2200X720X1380 | 1200" }
- Đường kính × hành trình: 108x130 — factSrc: { "supplierId": "senci", "n": 2004, "line": "| | 80/88 | TAD551GE | 90/98 | 108x130 | 4 | 19 | 218 | 国Ⅲ | 2200X720X1380 | 1200" } (tìm trên internet, trang không phải của hãng)
- Tiêu chuẩn khí thải: T3 — factSrc: { "supplierId": "nenjo-generator", "n": 142, "line": "| HJ81V | 沃尔沃 VOLVO | TAD551GE | 81.0 | 98.0 | T3" }
- Tiêu chuẩn khí thải: T3 — factSrc: { "supplierId": "nenjo-generator", "n": 142, "line": "| HJ88V | 沃尔沃 VOLVO | TAD551GE | 88.0 | 110.0 | T3" }

### Động cơ 4M10G110/5 — hãng: Baudouin
- Số xi lanh: 4 — factSrc: { "supplierId": "depco-power", "n": 2422, "line": "| Cylinder | 4 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Số xi lanh: 4 — factSrc: { "supplierId": "yanan-power", "n": 106, "line": "| YN110B | 110kVA | 88kW | 100kVA | 80kW | 4M10G110/5 | 4 | YN110B" }
- Làm mát: Water — factSrc: { "supplierId": "depco-power", "n": 2422, "line": "| Cylinder | 4 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Đường kính × hành trình: 105 X 118 — factSrc: { "supplierId": "depco-power", "n": 2422, "line": "| Cylider arrangemant | IN-LINE | Bore and Stroke(mm) | 105 X 118" } (tìm trên internet, trang chính hãng)
- Tỉ số nén: 17.5 : 1 — factSrc: { "supplierId": "westinpower", "n": 1123, "line": "| Compression ratio | 17.5 : 1" }
- Tỉ số nén: 17.5:1 — factSrc: { "supplierId": "depco-power", "n": 2422, "line": "| Cyle | 4 Staoke | Compression ratio | 17.5:1" } (tìm trên internet, trang chính hãng)
- Điều tốc: Electrical — factSrc: { "supplierId": "westinpower", "n": 1123, "line": "| Governor : type | Electrical" }
- Điều tốc: Electrical — factSrc: { "supplierId": "depco-power", "n": 2422, "line": "| Governor | Electrical | Displacement(L) | 4.088" } (tìm trên internet, trang chính hãng)
- Dung tích xi lanh: 4.087L — factSrc: { "supplierId": "westinpower", "n": 1123, "line": "| Displacement | 4.087L" }
- Dung tích xi lanh: 4.088 — factSrc: { "supplierId": "depco-power", "n": 2422, "line": "| Governor | Electrical | Displacement(L) | 4.088" } (tìm trên internet, trang chính hãng)
- Nạp khí: Turbocharged and Aftercooled — factSrc: { "supplierId": "westinpower", "n": 1123, "line": "| Aspiration and Cooling | Turbocharged and Aftercooled" }

### Đầu phát LSA 44.3 S5 — hãng: Leroy-Somer
- Kích từ / AVR: SHUNT — factSrc: { "supplierId": "leroy-somer-fuzhou", "n": 1009, "line": "| AVR | SHUNT" }
- Kích từ / AVR: SHUNT — factSrc: { "supplierId": "leroy-somer-fuzhou", "n": 1009, "line": "| Excitation system | SHUNT" }
- Cấp cách điện: H — factSrc: { "supplierId": "leroy-somer-fuzhou", "n": 1009, "line": "| Insulation class | H" }
- Cấp cách điện: H — factSrc: { "supplierId": "depco-power", "n": 2279, "line": "| No.of bearings | 1 | Insulation class | H" } (tìm trên internet, trang chính hãng)
- Ổn định điện áp: ± 0.5% — factSrc: { "supplierId": "leroy-somer-fuzhou", "n": 1009, "line": "| Voltage regulation (*) | ± 0.5% | ± 0.25%" }
- Cấp bảo vệ: IP 23 — factSrc: { "supplierId": "leroy-somer-fuzhou", "n": 1009, "line": "| Protection | IP 23" }
- Cấp bảo vệ: IP23 — factSrc: { "supplierId": "depco-power", "n": 2279, "line": "| Wires | 12 | Ingress protection | IP23" } (tìm trên internet, trang chính hãng)
- Méo sóng hài (THD): < 5% — factSrc: { "supplierId": "leroy-somer-fuzhou", "n": 1009, "line": "| Total Harmonic Distortion THD (**) on linear load ..: | < 5%" }
- Méo sóng hài (THD): < 2% — factSrc: { "supplierId": "leroy-somer-fuzhou", "n": 1009, "line": "| Total Harmonic Distortion THD (**) in no-load ........: | < 2%" }

### Đầu phát TAL-A44-D — hãng: Leroy-Somer
- Kích từ / AVR: SHUNT — factSrc: { "supplierId": "leroy-somer-fuzhou", "n": 1003, "line": "| AVR | SHUNT" }
- Cấp cách điện: H — factSrc: { "supplierId": "leroy-somer-fuzhou", "n": 1003, "line": "| Insulation class | H | Excitation system 6 wires" }
- Cấp bảo vệ: IP 23 — factSrc: { "supplierId": "leroy-somer-fuzhou", "n": 1003, "line": "| Protection | IP 23" }
- Ổn định điện áp:  1 % — factSrc: { "supplierId": "leroy-somer-fuzhou", "n": 1003, "line": "| Voltage regulation (*) |  1 % |  0.5 %" }

### Động cơ 6BTA5.9-G2 — hãng: Cummins
- ⚠ Dung tích xi lanh: các nguồn ghi khác nhau (5.9 / 8.3 / 5.9L / 5.88 / 5.88L) — không dùng làm "met"
- Dung tích xi lanh: 5.9L — factSrc: { "supplierId": "aosif", "n": 1020, "line": "| Displacement | 5.9L" }
- Dung tích xi lanh: 5.88L — factSrc: { "supplierId": "mingbang-mbkl", "n": 138, "line": "| Displacement | 5.88L" }
- Dung tích xi lanh: 5.9 — factSrc: { "supplierId": "tecgen-fujian", "n": 101, "line": "| Displacement (L) | 5.9" }
- Dung tích xi lanh: 5.9 — factSrc: { "supplierId": "depco-power", "n": 2476, "line": "| Governor | Electrical | Displacement(L) | 5.9" } (tìm trên internet, trang chính hãng)
- Điều tốc: Electronic speed — factSrc: { "supplierId": "aosif", "n": 1020, "line": "| Governor | Electronic speed" }
- Điều tốc: Electrical — factSrc: { "supplierId": "depco-power", "n": 2476, "line": "| Governor | Electrical | Displacement(L) | 5.9" } (tìm trên internet, trang chính hãng)
- Số xi lanh: 6 — factSrc: { "supplierId": "aosif", "n": 1020, "line": "| No. of cylinder | 6" }
- Số xi lanh: 6 — factSrc: { "supplierId": "fdk-energy", "n": 1008, "line": "| Cylinder quantity | 6" }
- ⚠ Dầu bôi trơn: các nguồn ghi khác nhau (16.4 / 16 / 12.1) — không dùng làm "met"
- Dầu bôi trơn: 16 — factSrc: { "supplierId": "bdadl-shanghai", "n": 131, "line": "| BDA-C92 | 92/100 | 东风康明斯 | 6BTA5.9-G2 | 6 | 5.88 | 16 | ≤210 | 2300*750*1270 | 1260" }
- Dầu bôi trơn: 16 — factSrc: { "supplierId": "bdadl-shanghai", "n": 123, "line": "| BDA-C100 | 100/125 | 东风康明斯 | 6BTA5.9-G2 | 6 | 5.88 | 16 | ≤206 | 2300*850*1400 | 1100" }
- Dầu bôi trơn: 16 — factSrc: { "supplierId": "fukangsi-yangzhou", "n": 2001, "line": "| FKS-C100 | 100/125 | 东风康明斯 | 6BTA5.9-G2 | 6 | 5.88 | 16 | ≤210 | 2300*850*1450 | 1100" } (tìm trên internet, trang chính hãng)
- Dầu bôi trơn: 16 — factSrc: { "supplierId": "pengpai-yangzhou", "n": 122, "line": "| PPDL-C100 | 100/125 | 东风康明斯 | 6BTA5.9-G2 | 6 | 5.88 | 16 | ≤206 | 2300*850*1400 | 1100" }
- Đường kính × hành trình: 102×120 mm — factSrc: { "supplierId": "mingbang-mbkl", "n": 138, "line": "| Bore×Stroke | 102×120 mm" }
- Đường kính × hành trình: 102x120mm — factSrc: { "supplierId": "aosif", "n": 1020, "line": "| Bore x Stroke | 102x120mm" }
- Tỉ số nén: 17.3:1 — factSrc: { "supplierId": "aosif", "n": 1020, "line": "| Compression ratio | 17.3:1" }
- Tỉ số nén: 17.3:1 — factSrc: { "supplierId": "fdk-energy", "n": 1008, "line": "| Compression Ratio | 17.3:1" }
- ⚠ Nạp khí: các nguồn ghi khác nhau (涡轮增压 / Turbo-charged) — không dùng làm "met"
- Nạp khí: Turbo-charged — factSrc: { "supplierId": "fdk-energy", "n": 1008, "line": "| Aspiration | Turbo-charged" }
- Nạp khí: 涡轮增压 — factSrc: { "supplierId": "chenxing-weifang", "n": 104, "line": "| 输出功率 | 100kw | 吸气方式 | 涡轮增压 | 额定功率 | 100kw" }
- Làm mát: Water — factSrc: { "supplierId": "depco-power", "n": 2476, "line": "| Cylinder | 6 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Làm mát: Water Cooling — factSrc: { "supplierId": "tecgen-fujian", "n": 106, "line": "| Cooling Method | Water Cooling | Ambient Temp | ≤40 C" }
- Tiêu chuẩn khí thải: T2 — factSrc: { "supplierId": "nenjo-generator", "n": 103, "line": "| HJ96C | 康明斯 Cummins | 96 | 105 | 6BTA5.9-G2 | T2" }
- Tiêu chuẩn khí thải: T2 — factSrc: { "supplierId": "nenjo-generator", "n": 103, "line": "| HJ109C | 康明斯 Cummins | 109 | 120 | 6BTA5.9-G2 | T2" }
- ⚠ Công suất động cơ (prime): các nguồn ghi khác nhau (106 kW / 120 kW) — không dùng làm "met"
- Công suất động cơ (prime): 106 — factSrc: { "supplierId": "weiman-fujian", "n": 110, "line": "| WT-C140 | 100 | 125 | 110 | 138 | 6BTA5.9-G2 | 106 | 116 | 211 | 27 | 6×102×120 | 5.9 | 17.3:1 | TC | More data" }
- Công suất động cơ (prime): 120 — factSrc: { "supplierId": "weiman-fujian", "n": 110, "line": "| WT-C140 | 100 | 125 | 110 | 138 | 6BTA5.9-G2 | 120 | 132 | 211 | 31 | 6×102×120 | 5.9 | 17.3:1 | TC | More data" }
- Công suất động cơ (prime): 106 — factSrc: { "supplierId": "keliang-fuan", "n": 116, "line": "| WT-C140 | 100 | 125 | 110 | 138 | 6BTA5.9-G2 | 106 | 116 | 211 | 27 | 6×102×120 | 5.9 | 17.3:1 | TC | WT-274D | 2230×830×1490 | 1170 | 2900*1100*1600 | 2270" }
- Công suất động cơ (prime): 120 — factSrc: { "supplierId": "keliang-fuan", "n": 116, "line": "| WT-C140 | 100 | 125 | 110 | 138 | 6BTA5.9-G2 | 120 | 132 | 211 | 31 | 6×102×120 | 5.9 | 17.3:1 | TC | WT-274C | 2230×830×1490 | 1170 | 2900*1100*1600 | 2270" }
- ⚠ Công suất động cơ (standby): các nguồn ghi khác nhau (116 kW / 132 kW) — không dùng làm "met"
- Công suất động cơ (standby): 116 — factSrc: { "supplierId": "weiman-fujian", "n": 110, "line": "| WT-C140 | 100 | 125 | 110 | 138 | 6BTA5.9-G2 | 106 | 116 | 211 | 27 | 6×102×120 | 5.9 | 17.3:1 | TC | More data" }
- Công suất động cơ (standby): 132 — factSrc: { "supplierId": "weiman-fujian", "n": 110, "line": "| WT-C140 | 100 | 125 | 110 | 138 | 6BTA5.9-G2 | 120 | 132 | 211 | 31 | 6×102×120 | 5.9 | 17.3:1 | TC | More data" }
- Công suất động cơ (standby): 116 — factSrc: { "supplierId": "keliang-fuan", "n": 116, "line": "| WT-C140 | 100 | 125 | 110 | 138 | 6BTA5.9-G2 | 106 | 116 | 211 | 27 | 6×102×120 | 5.9 | 17.3:1 | TC | WT-274D | 2230×830×1490 | 1170 | 2900*1100*1600 | 2270" }
- Công suất động cơ (standby): 132 — factSrc: { "supplierId": "keliang-fuan", "n": 116, "line": "| WT-C140 | 100 | 125 | 110 | 138 | 6BTA5.9-G2 | 120 | 132 | 211 | 31 | 6×102×120 | 5.9 | 17.3:1 | TC | WT-274C | 2230×830×1490 | 1170 | 2900*1100*1600 | 2270" }
- Khởi động: 24V Electrical starting — factSrc: { "supplierId": "mingbang-mbkl", "n": 138, "line": "| Starting Method | 24V Electrical starting" }

### Đầu phát UCI274D — hãng: Stamford
- ⚠ Ổn định điện áp: các nguồn ghi khác nhau (± 1% / ± 1.5 % / ≤±1%) — không dùng làm "met"
- Ổn định điện áp: ≤±1% — factSrc: { "supplierId": "fdk-energy", "n": 1008, "line": "| Voltage regulation NL-FL | ≤±1%" }
- Ổn định điện áp: ± 1.5 % — factSrc: { "supplierId": "stamford-avk-china", "n": 1003, "line": "| VOLTAGE REGULATION | ± 1.5 % | ± 1.0 % | With 4%" }
- Ổn định điện áp: ± 1% — factSrc: { "supplierId": "stamford-avk-china", "n": 1003, "line": "| VOLTAGE REGULATION | ± 1% | ± 0.5 % | With 4% ENGINE GOVERNING" }
- Cấp cách điện: H — factSrc: { "supplierId": "fdk-energy", "n": 1008, "line": "| Insulation grade | H" }
- Cấp cách điện: CLASS H — factSrc: { "supplierId": "stamford-avk-china", "n": 1003, "line": "| INSULATION SYSTEM | CLASS H" }
- Cấp bảo vệ: IP23 — factSrc: { "supplierId": "stamford-avk-china", "n": 1003, "line": "| PROTECTION | IP23" }
- Cấp bảo vệ: IP23 — factSrc: { "supplierId": "fdk-energy", "n": 1008, "line": "| Protection grade | IP23" }
- Hiệu suất đầu phát: 90.60% — factSrc: { "supplierId": "huachai-deutz", "n": 123, "line": "| Rated voltage | 400/230V | Rated speed | 1500rpm | Efficiency | 90.60%" }
- Hiệu suất đầu phát: 91.6 — factSrc: { "supplierId": "stamford-avk-china", "n": 1003, "line": "| Efficiency (%) | 91.6 | 92.0 | 92.2 | 91.4 | 91.7 | 92.0 | 91.2 | 91.6 | 91.8 | 91.1 | 91.5 | 91.7" }
- Kích từ / AVR: Single bearing, Brushless, — factSrc: { "supplierId": "fdk-energy", "n": 1008, "line": "| Exciter type | Single bearing, Brushless," }
- Kích từ / AVR: brushless self-exciting — factSrc: { "supplierId": "huachai-deutz", "n": 123, "line": "| Steady state frequency | ≤2.5% | Start mode | 24V electrical | Exciting way | brushless self-exciting" }

### Động cơ BF4M1013EC — hãng: Deutz
- Số xi lanh: 4L — factSrc: { "supplierId": "legapower", "n": 110, "line": "| LG105DE | 105 | 95 | 28 | BF4M1013EC | 4L | M | 4.76 |" }
- Số xi lanh: 4 — factSrc: { "supplierId": "world-power-fuzhou", "n": 103, "line": "| WDPG-D100 | 80 | 100 | 88 | 110 | BF4M1013EC | 4 | M |" }
- Đường kính × hành trình: 108/130 — factSrc: { "supplierId": "haifeng-taizhou", "n": 2005, "line": "| HF-80GF | 100 | 80 | BF4M1013EC | 4L | 108/130 | 19.4 | 2150×750×1550 | 1200" } (tìm trên internet, trang chính hãng)
- Khởi động: 24V — factSrc: { "supplierId": "victory-generator", "n": 126, "line": "| V84DG | 60 | 76 | 95 | 84 | 105 | BF4M1013EC | 28 | 4L | 24V | 2140 x 980 x 1700 | 1180" }
- Khởi động: 24V — factSrc: { "supplierId": "victory-generator", "n": 126, "line": "| V75DG | 50 | 68 | 85 | 75 | 93 | BF4M1013EC | 25.8 | 4L | 24V | 2140 x 980 x 1700 | 1180" }
- Tỉ số nén: 19:1 — factSrc: { "supplierId": "weiman-fujian", "n": 109, "line": "| WT-D116BF | 84 | 105 | 92 | 116 | BF4M1013EC | 97 | 102 | 212 | 24.2 | 4×108×130 | 4.764 | 19:1 | TC | More data" }
- Dung tích xi lanh: 4.76 — factSrc: { "supplierId": "wintpower", "n": 141, "line": "| WT-DE125 | 125/100 | 110/90 | 14 | BF4M1013EC | 4 | 4.76 | 24 | 108 | elec. | 2300*900*1700 | 1150" }
- Dung tích xi lanh: 4.76 — factSrc: { "supplierId": "wintpower", "n": 141, "line": "| WT-DE105 | 105/84 | 95/76 | 28 | BF4M1013EC | 4L | Elec | 4.76 | 2900*1080*2000 | 1950 | 2140*980*1700 | 1180" }
- Công suất động cơ (prime): 97 — factSrc: { "supplierId": "weiman-fujian", "n": 109, "line": "| WT-D116BF | 84 | 105 | 92 | 116 | BF4M1013EC | 97 | 102 | 212 | 24.2 | 4×108×130 | 4.764 | 19:1 | TC | More data" }
- Công suất động cơ (standby): 102 — factSrc: { "supplierId": "weiman-fujian", "n": 109, "line": "| WT-D116BF | 84 | 105 | 92 | 116 | BF4M1013EC | 97 | 102 | 212 | 24.2 | 4×108×130 | 4.764 | 19:1 | TC | More data" }

### Đầu phát BW-274C
- (chưa có thông số nào có nguồn)

### Động cơ SC4H160D2 — hãng: SDEC
- Số xi lanh: 4 — factSrc: { "supplierId": "depco-power", "n": 2236, "line": "| Cylinder | 4 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Số xi lanh: 4L — factSrc: { "supplierId": "legapower", "n": 108, "line": "| LG124SC | 124 | 113 | 25 | SC4H160D2 | 4L | Electronic | 4.3 |" }
- Dung tích xi lanh: 4.3 — factSrc: { "supplierId": "depco-power", "n": 2236, "line": "| Governor | Electrical | Displacement(L) | 4.3" } (tìm trên internet, trang chính hãng)
- Dung tích xi lanh: 4.3 — factSrc: { "supplierId": "legapower", "n": 108, "line": "| LG124SC | 124 | 113 | 25 | SC4H160D2 | 4L | Electronic | 4.3 |" }
- ⚠ Dầu bôi trơn: các nguồn ghi khác nhau (15 / 18 / 13) — không dùng làm "met"
- Dầu bôi trơn: 15 — factSrc: { "supplierId": "bdadl-shanghai", "n": 123, "line": "| BDA-S100 | 100/125 | 上柴股份 | SC4H160D2 | 4 | 4.3 | 15 | ≤206 | 2060*930*1190 | 1020" }
- Dầu bôi trơn: 15 — factSrc: { "supplierId": "fukangsi-yangzhou", "n": 2003, "line": "| FKS-S100 | 100/125 | 上柴动力 | SC4H160D2 | 4 | 4.3 | 15 | ≤205 | 2060*930*1190 | 1020" } (tìm trên internet, trang chính hãng)
- Dầu bôi trơn: 15 — factSrc: { "supplierId": "pengpai-yangzhou", "n": 122, "line": "| PPDL-S100 | 100/125 | 上柴股份 | SC4H160D2 | 4 | 4.3 | 15 | ≤206 | 2060*930*1190 | 1020" }
- Dầu bôi trơn: 15 — factSrc: { "supplierId": "pengpai-yangzhou", "n": 130, "line": "| PPDL-S100 | 100/125 | 上柴动力 | SC4H160D2 | 4 | 4.3 | 15 | ≤205 | 2060*930*1190 | 1020" }
- Đường kính × hành trình: 105*124 — factSrc: { "supplierId": "longkai-power", "n": 1003, "line": "| Bore*Stroke | mm | 105*124" }
- Đường kính × hành trình: 105 X 124 — factSrc: { "supplierId": "depco-power", "n": 2236, "line": "| Cylider arrangemant | IN-LINE | Bore and Stroke(mm) | 105 X 124" } (tìm trên internet, trang chính hãng)
- Làm mát: Water — factSrc: { "supplierId": "depco-power", "n": 2236, "line": "| Cylinder | 4 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Tỉ số nén: 16:1 — factSrc: { "supplierId": "longkai-power", "n": 1003, "line": "| Compression ratio | 16:1" }
- Tỉ số nén: 16.0:1 — factSrc: { "supplierId": "depco-power", "n": 2236, "line": "| Cyle | 4 Staoke | Compression ratio | 16.0:1" } (tìm trên internet, trang chính hãng)
- ⚠ Điều tốc: các nguồn ghi khác nhau (Electrical / Electronic / 电子调速E / Electronic speed controller) — không dùng làm "met"
- Điều tốc: Electrical — factSrc: { "supplierId": "depco-power", "n": 2236, "line": "| Governor | Electrical | Displacement(L) | 4.3" } (tìm trên internet, trang chính hãng)
- Điều tốc: Electronic — factSrc: { "supplierId": "legapower", "n": 108, "line": "| LG124SC | 124 | 113 | 25 | SC4H160D2 | 4L | Electronic | 4.3 |" }
- Điều tốc: Electronic — factSrc: { "supplierId": "legapower", "n": 108, "line": "| LG110SC | 110 | 100 | 22.2 | SC4H160D2 | 4L | Electronic | 4.3 |" }
- Điều tốc: 电子调速E — factSrc: { "supplierId": "nenjo-generator", "n": 154, "line": "| HJ95SC | SC4H160D2 | 105/1500 | 116/1500 | 95 | 104 | 电子调速E | 国二 T2" }
- Tiêu chuẩn khí thải: 国二 T2 — factSrc: { "supplierId": "nenjo-generator", "n": 154, "line": "| HJ95SC | SC4H160D2 | 105/1500 | 116/1500 | 95 | 104 | 电子调速E | 国二 T2" }
- Tiêu chuẩn khí thải: T2 — factSrc: { "supplierId": "hanyang-weifang", "n": 125, "line": "| HY-100 | SC4H160D2 | 105 | 116 | 4 | 105*124 | 4.3 | 195 | 1800*600*1200 | 1100 | T2" }
- Nạp khí: water-cooled,4 valves, Turbo charged — factSrc: { "supplierId": "longkai-power", "n": 1003, "line": "| Aspiration | water-cooled,4 valves, Turbo charged" }

### Đầu phát JET274C
- (chưa có thông số nào có nguồn)

### Động cơ 4BTA3.9-G13 — hãng: Cummins
- ⚠ Số xi lanh: các nguồn ghi khác nhau (4L / 4 / 6L) — không dùng làm "met"
- Số xi lanh: 4 — factSrc: { "supplierId": "aosif", "n": 1016, "line": "| No. of cylinder | 4" }
- Số xi lanh: 4L — factSrc: { "supplierId": "aosif", "n": 101, "line": "| AC105 | 95/76 | 105/84 | 4BTA3.9-G13 | 18.8 | 4L | 3.9 |" }
- Số xi lanh: 4 — factSrc: { "supplierId": "yanan-power", "n": 101, "line": "| YN105C | 105kVA | 84kW | 95kVA | 76kW | 4BTA3.9-G13 | 4 | YN105C" }
- Số xi lanh: 4 — factSrc: { "supplierId": "comappower", "n": 102, "line": "| COM105C | 105kVA | 84kW | 95kVA | 76kW | 4BTA3.9-G13 | 4 | COM105C" }
- ⚠ Dung tích xi lanh: các nguồn ghi khác nhau (3.9 / 3.9 L / 5.9) — không dùng làm "met"
- Dung tích xi lanh: 3.9 L — factSrc: { "supplierId": "aosif", "n": 1016, "line": "| Displacement | 3.9 L" }
- Dung tích xi lanh: 3.9 — factSrc: { "supplierId": "aosif", "n": 101, "line": "| AC105 | 95/76 | 105/84 | 4BTA3.9-G13 | 18.8 | 4L | 3.9 |" }
- Dung tích xi lanh: 3.9 — factSrc: { "supplierId": "yunding-jiangsu", "n": 2005, "line": "| YDK-80GF | 80 | 100 | 144 | 4BTA3.9-G13 | 4 | 102*120 | 3.9 | 11 | 210 | 1900*800*1350 | 980" } (tìm trên internet, trang chính hãng)
- Dung tích xi lanh: 5.9 — factSrc: { "supplierId": "victory-generator", "n": 110, "line": "| V75C | 50 | 68 | 85 | 75 | 94 | 4BTA3.9-G13 | 16 | 5.9 | 6L | electronic | 2140*950*1530 | 1270 | 2900*1030*2000 | 1740" }
- Điều tốc: Electronic — factSrc: { "supplierId": "aosif", "n": 1016, "line": "| Governor | Electronic" }
- Điều tốc: Electronic speed — factSrc: { "supplierId": "longkai-power", "n": 1058, "line": "| Governor type | Electronic speed" }
- Đường kính × hành trình: 102x120 mm — factSrc: { "supplierId": "aosif", "n": 1016, "line": "| Bore x Stroke | 102x120 mm" }
- Đường kính × hành trình: 102*120 — factSrc: { "supplierId": "longkai-power", "n": 1058, "line": "| Bore*Stroke | mm | 102*120" }
- Tỉ số nén: 18.0:1 — factSrc: { "supplierId": "aosif", "n": 1016, "line": "| Compression ratio | 18.0:1" }
- Tỉ số nén: 18:1 — factSrc: { "supplierId": "jinlongteng-fujian", "n": 101, "line": "| JDC105 | 76 | 95 | 84 | 105 | 4BTA3.9-G13 | 87 | 97 | 212 | 18.8 | 4×102×120 | 3.9 | 18:1 | 10.9 | 22 | JLT224GM(75KW) | UCI274C(80KW) | 2450*980*1400 | 1200 | 1900*750*1300 | 935" }
- Công suất động cơ (prime): 87 — factSrc: { "supplierId": "jinlongteng-fujian", "n": 101, "line": "| JDC105 | 76 | 95 | 84 | 105 | 4BTA3.9-G13 | 87 | 97 | 212 | 18.8 | 4×102×120 | 3.9 | 18:1 | 10.9 | 22 | JLT224GM(75KW) | UCI274C(80KW) | 2450*980*1400 | 1200 | 1900*750*1300 | 935" }
- Công suất động cơ (standby): 97 — factSrc: { "supplierId": "jinlongteng-fujian", "n": 101, "line": "| JDC105 | 76 | 95 | 84 | 105 | 4BTA3.9-G13 | 87 | 97 | 212 | 18.8 | 4×102×120 | 3.9 | 18:1 | 10.9 | 22 | JLT224GM(75KW) | UCI274C(80KW) | 2450*980*1400 | 1200 | 1900*750*1300 | 935" }
- Tiêu chuẩn khí thải: T2 — factSrc: { "supplierId": "nenjo-generator", "n": 105, "line": "| HJ79C | 康明斯 Cummins | 79 | 88 | 4BTA3.9-G13（水箱RadiatorLAT40°） | T2" }
- Tiêu chuẩn khí thải: T2 — factSrc: { "supplierId": "nenjo-generator", "n": 103, "line": "| HJ79C | 康明斯 Cummins | 79 | 88 | 4BTA3.9-G13 （水箱RadiatorLAT40°） | T2" }
- Dầu bôi trơn: 11 — factSrc: { "supplierId": "yunding-jiangsu", "n": 2005, "line": "| YDK-80GF | 80 | 100 | 144 | 4BTA3.9-G13 | 4 | 102*120 | 3.9 | 11 | 210 | 1900*800*1350 | 980" } (tìm trên internet, trang chính hãng)

### Đầu phát BW-224G
- (chưa có thông số nào có nguồn)

### Động cơ D1146 — hãng: Doosan / Hyundai
- Số xi lanh: 6 — factSrc: { "supplierId": "depco-power", "n": 2112, "line": "| Cylinder | 6 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Số xi lanh: 6L — factSrc: { "supplierId": "huatai-yangzhou", "n": 108, "line": "| 64GF | 64 | D1146 | 6L | 111/139 | 8.071 | 18 | 1900 | 2300*780*1200" }
- Dung tích xi lanh: 8.074 — factSrc: { "supplierId": "depco-power", "n": 2112, "line": "| Governor | Mechanical | Displacement(L) | 8.074" } (tìm trên internet, trang chính hãng)
- Dung tích xi lanh: 8.071 — factSrc: { "supplierId": "huatai-yangzhou", "n": 108, "line": "| 64GF | 64 | D1146 | 6L | 111/139 | 8.071 | 18 | 1900 | 2300*780*1200" }
- ⚠ Dầu bôi trơn: các nguồn ghi khác nhau (18 / 17.5 / 15.5) — không dùng làm "met"
- Dầu bôi trơn: 17.5 — factSrc: { "supplierId": "xingguang-jiangsu", "n": 107, "line": "| XG-70GF | 64/80 | D1146 | 70/88 | 6 | 17.5 | 200 | 国 II | 2500×850×1450 | 980" }
- Dầu bôi trơn: 18 — factSrc: { "supplierId": "aoke-yangzhou", "n": 143, "line": "| AOKE-D70 | 64KW | 70KW | 斗山 | D1146 | 6 | 8.071 | 18 | 195 | 2300*780*1200 | 1900 | | 详细参数" }
- Dầu bôi trơn: 18 — factSrc: { "supplierId": "aoke-yangzhou", "n": 144, "line": "| AOKE-D70 | 64KW | 70KW | 斗山 | D1146 | 6 | 8.071 | 18 | 195 | 2300 x 780 x 1200 | 1900 | | 详细参数" }
- Dầu bôi trơn: 15.5 — factSrc: { "supplierId": "zhengdian-zhengzhou", "n": 108, "line": "| 70GF1 | 70 | 64 | 126/115 | D1146 | 85/77 | 6 | 111 | 139 | 8.071 | 15.5 | 223 | 1300 | 2255 ×8 70 × 1260" }
- Đường kính × hành trình: 111 X 139 — factSrc: { "supplierId": "depco-power", "n": 2112, "line": "| Cylider arrangemant | IN-LINE | Bore and Stroke(mm) | 111 X 139" } (tìm trên internet, trang chính hãng)
- Đường kính × hành trình: 111/139 — factSrc: { "supplierId": "huatai-yangzhou", "n": 108, "line": "| 64GF | 64 | D1146 | 6L | 111/139 | 8.071 | 18 | 1900 | 2300*780*1200" }
- Làm mát: Water — factSrc: { "supplierId": "depco-power", "n": 2112, "line": "| Cylinder | 6 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Tỉ số nén: 17.5:1 — factSrc: { "supplierId": "depco-power", "n": 2112, "line": "| Cyle | 4 Staoke | Compression ratio | 17.5:1" } (tìm trên internet, trang chính hãng)
- Điều tốc: Mechanical — factSrc: { "supplierId": "depco-power", "n": 2112, "line": "| Governor | Mechanical | Displacement(L) | 8.074" } (tìm trên internet, trang chính hãng)
- Tiêu chuẩn khí thải: 国 II — factSrc: { "supplierId": "xingguang-jiangsu", "n": 107, "line": "| XG-70GF | 64/80 | D1146 | 70/88 | 6 | 17.5 | 200 | 国 II | 2500×850×1450 | 980" }

### Đầu phát LSA44.2VS3
- (chưa có thông số nào có nguồn)

### Động cơ R6105AZLD — hãng: Ricardo
- Tiêu chuẩn khí thải: T2 — factSrc: { "supplierId": "hanyang-weifang", "n": 120, "line": "| HY-100GF | R6105AZLD | 121 | 133 | 6 | 105*130 | 6.75 | 218 | 2400*700*1500 | 1200 | T2" }
- Dung tích xi lanh: 6.75 — factSrc: { "supplierId": "huatai-yangzhou", "n": 101, "line": "| 100GF | 100 | R6105AZLD | 6L | 105/130 | 6.75 | 18 | 1300 | 2400*750*1400" }
- Dung tích xi lanh: 6.7 — factSrc: { "supplierId": "jet-power", "n": 116, "line": "| GF-110 | 110 | 88 | 100 | 80 | R6105AZLD | L6 | Mechanical | 6.7 | 105×130 | JET274C" }
- Đường kính × hành trình: 105/130 — factSrc: { "supplierId": "huatai-yangzhou", "n": 101, "line": "| 100GF | 100 | R6105AZLD | 6L | 105/130 | 6.75 | 18 | 1300 | 2400*750*1400" }
- Đường kính × hành trình: 105×130 — factSrc: { "supplierId": "jet-power", "n": 116, "line": "| GF-110 | 110 | 88 | 100 | 80 | R6105AZLD | L6 | Mechanical | 6.7 | 105×130 | JET274C" }
- Số xi lanh: 6L — factSrc: { "supplierId": "huatai-yangzhou", "n": 101, "line": "| 100GF | 100 | R6105AZLD | 6L | 105/130 | 6.75 | 18 | 1300 | 2400*750*1400" }
- Số xi lanh: 6 — factSrc: { "supplierId": "hanyang-weifang", "n": 120, "line": "| HY-100GF | R6105AZLD | 121 | 133 | 6 | 105*130 | 6.75 | 218 | 2400*700*1500 | 1200 | T2" }
- Điều tốc: Mechanical — factSrc: { "supplierId": "landtop-fuzhou", "n": 116, "line": "| LTP138R | 138 | 110 | 125 | 100 | Mechanical | R6105AZLD | LTP274S-100" }
- Dầu bôi trơn: <=1.63 — factSrc: { "supplierId": "victory-generator", "n": 115, "line": "| V110T | 50 | 100 | 125 | 110 | 137.5 | R6105AZLD | <=218 | <=1.63 | 2470*800*1270 | 1450 | 2800*1150*1610 | 1650" }
- Dầu bôi trơn: <=1.63 — factSrc: { "supplierId": "victory-generator", "n": 115, "line": "| V110T | 60 | 100 | 125 | 110 | 137.5 | R6105AZLD | <=218 | <=1.63 | 2470*800*1270 | 1450 | 2800*1150*1610 | 1650" }
- Công suất động cơ (prime): 110 — factSrc: { "supplierId": "weiman-fujian", "n": 114, "line": "| WT-R140 | 100 | 125 | 110 | 138 | R6105AZLD | 110 | 121 | 218 | 28.21 | 6×105×130 | 6.75 | 17:1 | TC | WT-274D | 2450×770×1650 | 1310 | More data" }
- Công suất động cơ (standby): 121 — factSrc: { "supplierId": "weiman-fujian", "n": 114, "line": "| WT-R140 | 100 | 125 | 110 | 138 | R6105AZLD | 110 | 121 | 218 | 28.21 | 6×105×130 | 6.75 | 17:1 | TC | WT-274D | 2450×770×1650 | 1310 | More data" }

### Động cơ LR4M3L-D — hãng: YTO
- Dung tích xi lanh: 4.75 — factSrc: { "supplierId": "depco-power", "n": 2048, "line": "| Governor | Electrical | Displacement(L) | 4.75" } (tìm trên internet, trang chính hãng)
- Dung tích xi lanh: 4.75 — factSrc: { "supplierId": "depco-power", "n": 2068, "line": "| Governor | Mechanical | Displacement(L) | 4.75" } (tìm trên internet, trang chính hãng)
- ⚠ Nạp khí: các nguồn ghi khác nhau (Turbo /Inter cooling / Turbocharged and Intercooled) — không dùng làm "met"
- Nạp khí: Turbo /Inter cooling — factSrc: { "supplierId": "acepow-fuan", "n": 133, "line": "| 50 | 1500 | LR4M3L-D | 86 | 95 | Turbo /Inter cooling | 4.75" }
- Nạp khí: Turbo /Inter cooling — factSrc: { "supplierId": "acepow-fuan", "n": 133, "line": "| 60 | 1800 | LR4M3L-D | 90 | 98 | Turbo /Inter cooling | 4.75" }
- Nạp khí: Turbo /Inter cooling — factSrc: { "supplierId": "acepow-fuan", "n": 128, "line": "| 50 | 3 | LR4M3L-D | 86 | 95 | 110x125 | Turbo /Inter cooling | 4.75" }
- Nạp khí: Turbo /Inter cooling — factSrc: { "supplierId": "acepow-fuan", "n": 128, "line": "| 60 | 3 | LR4M3L-D | 90 | 98 | 110x125 | Turbo /Inter cooling | 4.75" }
- Đường kính × hành trình: 110x125 — factSrc: { "supplierId": "acepow-fuan", "n": 132, "line": "| 75 | 83 | 94 | 103 | LR4M3L-D | 86 | 95 | Electric | 110x125" }
- Đường kính × hành trình: 110x125 — factSrc: { "supplierId": "acepow-fuan", "n": 132, "line": "| 75 | 83 | 94 | 103 | LR4M3L-D | 90 | 98 | Electric | 110x125" }
- ⚠ Điều tốc: các nguồn ghi khác nhau (Electronic / Electric / Electrical / Mechanical) — không dùng làm "met"
- Điều tốc: Electrical — factSrc: { "supplierId": "depco-power", "n": 2048, "line": "| Governor | Electrical | Displacement(L) | 4.75" } (tìm trên internet, trang chính hãng)
- Điều tốc: Mechanical — factSrc: { "supplierId": "depco-power", "n": 2068, "line": "| Governor | Mechanical | Displacement(L) | 4.75" } (tìm trên internet, trang chính hãng)
- Điều tốc: Electronic — factSrc: { "supplierId": "acepow-fuan", "n": 130, "line": "| 50 | 94 | 103 | LR4M3L-D | 86 | 95 | Electronic | UC274C" }
- Điều tốc: Electronic — factSrc: { "supplierId": "acepow-fuan", "n": 130, "line": "| 60 | 94 | 103 | LR4M3L-D | 90 | 98 | Electronic | UC224G" }
- Công suất động cơ (standby): 95 — factSrc: { "supplierId": "acepow-fuan", "n": 132, "line": "| 75 | 83 | 94 | 103 | LR4M3L-D | 86 | 95 | Electric | 110x125" }
- Công suất động cơ (standby): 98 — factSrc: { "supplierId": "acepow-fuan", "n": 132, "line": "| 75 | 83 | 94 | 103 | LR4M3L-D | 90 | 98 | Electric | 110x125" }
- Số xi lanh: 4 — factSrc: { "supplierId": "depco-power", "n": 2048, "line": "| Cylinder | 4 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Số xi lanh: 4 — factSrc: { "supplierId": "xinhengxin-fujian", "n": 116, "line": "| XHX-DF68 | 68/85 | 75/110 | 50 | LR4M3L-D | 82 | 14.3 | 4 | 1950x850x1260/1050 | 2300x950x1300/1200" }
- Làm mát: Water — factSrc: { "supplierId": "depco-power", "n": 2048, "line": "| Cylinder | 4 | Cooling system | Water" } (tìm trên internet, trang chính hãng)
- Tỉ số nén: 17.0:1 — factSrc: { "supplierId": "depco-power", "n": 2048, "line": "| Cyle | 4 Staoke | Compression ratio | 17.0:1" } (tìm trên internet, trang chính hãng)

### Đầu phát UC274C
- (chưa có thông số nào có nguồn)

### Đầu phát UC224G
- (chưa có thông số nào có nguồn)

## Thông số bộ điều khiển (datasheet của hãng; ghi factSrc với supplierId, n và line là dòng nguyên văn) — đầu mỗi datasheet; TOÀN BỘ dòng ở controllers.md, tìm chức năng bằng grep trong đó

### AMF9 — datasheet của InteliLite 4 AMF9 (nhà cung cấp ghi AMF9: cần xác nhận đời) — supplierId: comap, n: 1012
- InteliLite 4
- AMF 9
- Order code: IL4AMF9XBAA
- | Controller | for single gen-set applications
- Datasheet
- Product description
- | Single Gen-set controller for stand-by and prime-power | RTC with battery back-up, full calendar and enhanced scheduler
- | applications | Detailed history log with up to 150 records, including user logins and configuration
- changes
- | Key benefits | Remote Display support via RS485 (special RD FW for InteliLite 4 controllers)
- | Great flexibility and wide range of application support | Up to 5 languages in one configuration, over 20 default languages available
- | Variable predefined configurations tailored for specific applications | Load shedding and dummy load management
- | User defined protections and setpoints, integrated PLC logic | Alternative configurations for genset with variable voltage and frequency
- | Full control with fast and reliable remote communication support | Tool for quick and organized configuration cloning in large production facilities
- | Built-in USB device, CAN interfaces | Application overview
- … (168 dòng nữa trong controllers.md)

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

### DSE3110 — supplierId: deep-sea-electronics, n: 1006
- DSEGenset® Data Sheet
- DSE3110 Manual & Auto Start Control Module
- Part Number: 3110-01
- Overview
- The DSE3110 can be utilised as a manual or auto start module for single gen-set applications or engine only applications. The module has been
- designed to work with non-electronic engines, providing advanced engine monitoring and protection features.
- The DSE3110 includes a back-lit icon LCD display which clearly shows the status of the generator set at all times. The module monitors engine speed,
- frequency, voltage and engine run hours and also displays the warning and shutdown status.
- The module includes fixed and configurable outputs as well as configurable inputs making this product ideal for a wide variety of applications. The
- module can either be programmed using the front panel or by using the DSE Configuration Suite PC software.
- | Key | Features
- | • | Back-lit icon LCD display
- | • | Generator frequency display
- | • | Front panel editing
- | • | Battery voltage display
- … (146 dòng nữa trong controllers.md)

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

### HGM6120N — supplierId: smartgen, n: 1001
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

### HGM6120 — datasheet của HGM6120N (nhà cung cấp ghi HGM6120: cần xác nhận đời) — supplierId: smartgen, n: 1001: các dòng như ở mục HGM6120N

## Nhà cung cấp khác có dòng ghi cùng động cơ (để chọn suppliers)

### 6BT5.9-G2
- supplierId: uleengen, n: 104, tổ máy: UC100GF, đi kèm: UCI274C
  line: | UC100GF | 80 | 100 | 6BT5.9-G2 | Cummins | 92 | 6.L | 102×120 | 5.88 | 18.7 | UCI274C | 2250×830×1550 | 1000
- supplierId: wintpower, n: 147, tổ máy: WT-C110, đi kèm: TAL-A44-D
  line: | WT-C110 | 100 | 110 | 80 | 88 | 6BT5.9G2 | TAL-A44-D
- supplierId: eastern-lion-fuan, n: 108, tổ máy: GFS-C80, đi kèm: EL 274C
  line: | GFS-C80 | 80 | 100 | 89 | 111 | 6BT5.9-G2 | 86KW | EL 274C | 80KW | Smartgen 6120 | Detail
- supplierId: acepow-fuan, n: 154, tổ máy: APC-84, đi kèm: UC274D
  line: | APC-84 | 84 | 105 | 92 | 115 | 6BT5.9-G2 | 96 | 106 | UC274D

### 1104C-44TAG2
- supplierId: uleengen, n: 104, tổ máy: UP100GF, đi kèm: UCI274C
  line: | UP100GF | 80 | 100 | 1104C-44TAG2 | Perkins | 90 | 6.L | 105×127 | 4.41 | 18.7 | UCI274C | 2240x960x1315 | 1030
- supplierId: koten-power, n: 4014, tổ máy: KP100D5, đi kèm: 274C
  line: | KP100D5 | 80 | 100 | 88 | 110 | 1104C-44TAG2 | 274C
- supplierId: bobig-power, n: 125, tổ máy: BP110, đi kèm: BW-274E
  line: | BP110 | 80 | 100 | 88 | 110 | 1104C-44TAG2 made in china | 81 | BW-274E | 1920*750*1250 | 2550*970*1280
- supplierId: eastern-lion-fuan, n: 111, tổ máy: GFS-P111, đi kèm: EL 274C
  line: | GFS-P111 | 80 | 100 | 89 | 111 | 1104C-44TAG2 | 48139 | EL 274C | 80 | Smartgen 6120 | Detail

### 6BT5.9-G1
- supplierId: hosem-power, n: 125, tổ máy: A-C110-1
  line: | A-C110-1 | 100 | 80 | 110 | 88 | 6BT5.9-G1 | 2475×800×1470 | 1150
- supplierId: longkai-power, n: 121, tổ máy: LG80C
  line: | LG80C | 110 | 88 | 100 | 80 | 6BT5.9-G1 | OP2200*880*1360 | AT2938*1080*1690 | Download
- supplierId: minsun-motor, n: 102, tổ máy: GF-C100, đi kèm: SY-A 274C
  line: | GF-C100 | 100 | 80 | 6BT5.9-G1 | SY-A 274C
- supplierId: penlucky, n: 102, tổ máy: PLC110, đi kèm: UCI274G1
  line: | PLC110 | 110 | 100 | 6BT5.9-G1 | UCI274G1 | 2300*830*1700 | 2810*1140*1830 | view

### WP4.1D100E200
- supplierId: bobig-power, n: 113, tổ máy: BWC110, đi kèm: BW-274C
  line: | BWC110 | 80 | 100 | 88 | 110 | WP4.1D100E200 | 90 | BW-274C | 2000*800*1500 | 2750*1040*1350
- supplierId: jet-power, n: 135, tổ máy: WP-110, đi kèm: JET274C
  line: | WP-110 | 110 | 88 | 100 | 80 | WP4.1D100E200 | 4L | Mechanical | 105×130 | 4.5 | 20 | JET274C
- supplierId: penlucky, n: 103, tổ máy: PLW110/B1, đi kèm: TAL-A44-D
  line: | PLW110/B1 | 110 | 100 | WP4. 1D100E200 | TAL-A44-D | 1930*860*1218 | 2810*1140*1830 | view
- supplierId: elitech-power, n: 1001, tổ máy: EPS100WCA-3
  line: | EPS100WCA-3 | WEICHAI POWER | 100kVA | 110kVA | WP4.1D100E200 | 50Hz | 3-Phase | DOWNLOAD PDF | eps100wca-3-weichai-100kva-diesel-generator-specs

### 4BTAA3.9-G3
- supplierId: sr-genset, n: 2002, đi kèm: UCI274C
  line: | 110 | 88 | 100 | 80 | 4BTAA3.9-G3 | Elec | UCI274C | TAL-A44-D | SA274-80 | 2250*990*1450 | 2960*1100*1650
- supplierId: aosif, n: 101, tổ máy: AC110-I
  line: | AC110-I | 100/80 | 110/88 | 4BTAA3.9-G3 | 24.7 | 4L | 3.9 |
- supplierId: elitech-power, n: 1001, tổ máy: EPS100CMA-3
  line: | EPS100CMA-3 | CUMMINS | 100KVA | 110KVA | 4BTAA3.9-G3 | 50Hz | 3-Phase | DOWNLOAD PDF | eps100cma-3-cummins-100kva-diesel-generator-specs
- supplierId: deman-power, n: 2015, tổ máy: DM110C
  line: DM110C        110kVA  88kW   100kVA  80kW         4BTAA3.9-G3        4          Contact  us
  (động cơ 4BTAA3.9-G3 theo dòng sản phẩm của bản ghi: datasheet tổ máy DM110C một model, chữ trang tách cột nên không dòng nào ghi cả động cơ và công suất; dòng trên là dòng bảng ghi công suất, dùng làm src.line / suppliers[].line)

### SC4H140D2
- supplierId: fdk-energy, n: 108, tổ máy: SC110V2-H1, đi kèm: NIANFENG NF274C
  line: | SC110V2-H1 CONTACT | 110KVA/ 88KW | 100KVA/ 80KW | SC4H140D2 | SHANGCHAI (China) | NIANFENG NF274C | Click Here | Download
- supplierId: kaihua-genset, n: 113, tổ máy: KH-80GF
  line: | KH-80GF | 110 | 100 | SC4H140D2 | 2100*890*1260 | 1040
- supplierId: mecca-power, n: 5001, tổ máy: MC110SD
  line: | MC110SD | 80 | 100 | 88 | 110 | SC4H140D2 |
- supplierId: landtop-fuzhou, n: 121, tổ máy: LTP110 SD, đi kèm: LTP274S-80
  line: | LTP110 SD | 110 | 88 | 100 | 80 | Electronic | G2 | SC4H140D2 | LTP274S-80

### CA6DF2D-14D
- supplierId: koten-power, n: 5001, tổ máy: KF100D5
  line: | KF100D5 | 80 | 100 | 88 | 110 | CA6DF2D-14D |
- supplierId: rcg-power, n: 107, tổ máy: R-XC100D5-S, đi kèm: WR274C
  line: | R-XC100D5-S | 100kVA / 80kW | 110kVA / 88kW | CA6DF2D-14D | WR274C | PDF
- supplierId: keliang-fuan, n: 107, tổ máy: WT-FW110, đi kèm: WT-274C
  line: | WT-FW110 | 80 | 100 | 88 | 110 | CA6DF2D-14D | 96 | 104 | 202 | 22.81 | 6x110x115 | 6.55 | 17:1 | TC | WT-274C | 2490x780x1340 | 1335 | 2900x1100x1600 | 1780
- supplierId: agestar, n: 101, tổ máy: GF110(S), đi kèm: ASG274C
  line: | GF110(S) | 110 | 88 | 100 | 80 | CA6DF2D-14D | 26.3 | Electronic | ASG274C | 3000*1100*1580 | 2450

### TAD551GE
- supplierId: rcg-power, n: 124, tổ máy: R-V100D5/S, đi kèm: UCI274C
  line: | R-V100D5/S | 100 kVA / 80 kW | 110 kVA / 88 kW | 沃尔沃 & TAD551GE | 斯坦福 & UCI274C | PDF
- supplierId: comappower, n: 108, tổ máy: COM110V
  line: | COM110V | 110kVA | 88kW | 100kVA | 80kW | TAD551GE | 4 | COM110V
- supplierId: rise-power, n: 111, tổ máy: RVM81
  line: | RVM81 | 101 | 81 | 111 | 89 | TAD551GE | 4L | 4.76 | < 22.8 | 2080*940*1550 | 1350 | 2920*1100*1750 | 1770
- supplierId: app-power-anpu, n: 5001, tổ máy: APP-80GF
  line: | APP-80GF | 80 | 100 | 88 | 110 | TAD551GE |

### 4M10G110/5
- supplierId: rcg-power, n: 112, tổ máy: R-WB100D5-S, đi kèm: UCI274C
  line: | R-WB100D5-S（Stage 2） | 100 kVA / 80 kW | 110 kVA / 88 kW | 4M10G110/5 | UCI274C | PDF
- supplierId: comappower, n: 105, tổ máy: COM110B
  line: | COM110B | 110kVA | 88kW | 80kVA | 100kW | 4M10G110/5 | 4 | COM110B
- supplierId: elitech-power, n: 1001, tổ máy: EPS100BDA-3
  line: | EPS100BDA-3 | Baudouin | 100kVA | 110kVA | 4M10G110/5 | 50Hz | 3-Phase | DOWNLOAD PDF | eps100bda-3-baudouin-100kva-diesel-generator-specs
- supplierId: voltgent, n: 110, tổ máy: VB110-5
  line: | VB110-5 | 110 | 88 | 100 | 80 | Baudouin | 4M10G110/5 | [EN] [RU] [ES] [PT]

### 6BTA5.9-G2
- supplierId: fdk-energy, n: 102, tổ máy: CD125/H1, đi kèm: Stamford UCI274D
  line: | CD125/H1 CONTACT | 125KVA/ 100KW | 113KVA/ 90KW | 6BTA5.9-G2 | Cummins (China Dongfeng) | Stamford UCI274D | Click Here | Download
- supplierId: dingbo, n: 108, tổ máy: XG-90GF, đi kèm: UCI274D14
  line: | XG-90GF | 90/112.5 | 99/123.75 | 6BTA5.9-G2 | UCI274D14 | 2150x830x1400 | 1200
- supplierId: tecgen-fujian, n: 101, tổ máy: TG124C, đi kèm: TGI274S90
  bảng một model: | Frequency | 50Hz | Warranty | Up To 2 Years Or 2000 Hours ; | Fuel Tank Capacity | Up To 10 Operation Hours | Voltage | 220/380V, 230/400V, 240/415V ; | Prime Genset Output | 90kW / 113kVA | Genset Type | Silent / Super Silent Type ; Prime Genset Output: 90kW / 113kVA ; Standby Genset Output: 99kW / 124kVA ; | Genset Model | TG124C | TG124CS ; | Frequency | 50Hz ; | Voltage | 400/230V ; | Phase | 3 ; | Prime Power | 90kW / 113kVA ; | Standby Power | 99kW / 124kVA ; | Engine Model | 6BTA5.9-G2 ; | Alternator Model | TGI274S90 ; | Controller | DSE7320 ; | Weight (kgs) | 1200 | 1850 ; | Bore of Stroke (mm) | 102 x 120 ; | Displacement (L) | 5.9 ; | Engine Oil capacity (L) | 10 ; | Fuel consumption | at 50Hz ; | Model | TGI274S90 ; | Model | DSE7320
- supplierId: acepow-fuan, n: 154, tổ máy: APC-92, đi kèm: UC274D
  line: | APC-92 | 92 | 115 | 100 | 125 | 6BTA5.9-G2 | 106 | 116 | UC274D

### BF4M1013EC
- supplierId: comappower, n: 107, tổ máy: COM110DZ
  line: | COM110DZ | 110kVA | 88kW | 100kVA | 80kW | BF4M1013EC | 4 | COM110DZ
- supplierId: kaihua-genset, n: 103, tổ máy: KH-80GF
  line: | KH-80GF | 110 | 88 | 100 | 80 | BF4M1013EC | 2150x750x1550 | 1200
- supplierId: kingway-power, n: 126, tổ máy: KGZS100
  line: | KGZS100 | 110 | 88 | 100 | 80 | 18.8 | 2100x1030x1560 | 3050x1100x1832 | BF4M1013EC
- supplierId: wintpower, n: 141, tổ máy: WT-DE125
  line: | WT-DE125 | 125/100 | 110/90 | 14 | BF4M1013EC | 4 | 4.76 | 24 | 108 | elec. | 2300*900*1700 | 1150

### SC4H160D2
- supplierId: longkai-power, n: 1003, tổ máy: LG90SC, đi kèm: LK274D
  bảng một model: | POWER YOUR FUTURE | SC4H160D2 ; | SDEC Generator | Prime Power: 90KW/113KVA ; generator will be ready to run: “peace of ; | Model | LG90SC ; Alternator ; | Rated prime power | kva | 113 ; | Model | LONGKAI | LK274D ; | Rated standard power | kva | 124 ; | Rated voltage line to line | V | 400/230 ; | Phase | 3 ; | Rated current | A | 162 ; | Voltage | V | 400/230 ; | Maximun sound level | dB(@7m) | ≤96 ; | Engine-SDEC | Power factor | 0.8 ; | Model | SC4H160D2 ; | Frequency | Hz | 50 ; | Aspiration | water-cooled,4 valves, Turbo charged ; | Prime power | KW | 96 ; | Exciter Type | Brushless, self-excitation ; | No. cylinders | 4 in line ; | Voltage regulation | % | ±0.5 ; | Displacement | Liquid | 4.3 ; | Protection Grade | IP 23 ; | Bore*Stroke | mm | 105*124 ; | Insulation grade | H/H ; | Compression ratio | 16:1 ; | Rated speed | r/min | 1500 ; Controller-DEEPSEA ; | Rated net power(with | fan) ; | Model | DSE6120MK3 ; | Governor type | E ; | Start Motor | V | 24V×4.5kW ; | 100% load(Prime power) | L/h | 25 ; | 75% load(Prime power) | L/h | 16.7 ; | 50% load(Prime power) | L/h | 12.8 ; Control Module Options ; | Fuel tank capacity | L | 340 ; | (continuous operation) | Auto generator control module ; | Cooling System | ATS auto load transfer screen ; Dimensions(Basic unit) ; Alternator: single bearing alternator IP23, ; | Weight | kg | 1580 ; | Weight | kg | 2170 ; Generator ; | Max loading weight | kg | 1700
- supplierId: rise-power, n: 107, tổ máy: RSM80
  line: | RSM80 | 100 | 80 | 110 | 88 | SC4H160D2 | 4L | 4.3 | < 20.7 | ≦0.3 | 15 | 6.8 | 2060*933*1185 | 1020
- supplierId: victory-generator, n: 108, tổ máy: V88SC
  line: | V88SC | 50 | 80 | 100 | 88 | 110 | SC4H160D2 | 4L | 4.3 | 2000*930*1600 | 1141
- supplierId: wintpower, n: 145, tổ máy: WT-SC110
  line: | WT-SC110 | 110/88 | 100/80 | 25 | SC4H160D2 | 4L | 4.3 | 600 | 24 | 116 | Elec. | 2000*930*1580 | 1115

### 4BTA3.9-G13
- supplierId: rcg-power, n: 101, tổ máy: R-DC100D5-S, đi kèm: UCI274C
  line: | R-DC100D5-S | 100 kVA / 80 kW | 110 kVA / 88 kW | 4BTA3.9-G13 | UCI274C | PDF
- supplierId: kaichen-jiangsu, n: 5001, tổ máy: KCC-100GF
  line: | KCC-100GF | 80 | 100 | 88 | 110 | 4BTA3.9-G13 |
- supplierId: victory-generator, n: 110, tổ máy: V88C
  line: | V88C | 50 | 80 | 100 | 88 | 110 | 4BTA3.9-G13 | 18.8 | 5.9 | 6L | electronic | 2140*950*1530 | 1270 | 2900*1030*2000 | 1740
- supplierId: long-gen, n: 110, tổ máy: LGCS-110, đi kèm: UCI274C
  line: | LGCS-110 | 80 | 100 | 88 | 110 | 4BTA3.9-G13 | UCI274C | WHI274C | 2000*800*1350 | 850 | 2500*950*1600 | 1350 | download

### D1146
- supplierId: victory-generator, n: 106, tổ máy: V88DE
  line: | V88DE | 60 | 80 | 100 | 88 | 110 | D1146 | 19 | 6L | 2250*1050*1450 | 1687
- supplierId: walter-yangzhou, n: 105, tổ máy: WET-HD110
  line: | WET-HD110 | 110 | 100 | Doosan | D1146 | 1900*800*1250
- supplierId: previa-ningde, n: 106, tổ máy: PR80DS/I
  line: | PR80DS/I | 110 | 88 | 100 | 80 | D1146 | OP1900*800*1250 | AT2688*1080*1450

### R6105AZLD
- supplierId: eastern-lion-fuan, n: 144, tổ máy: GFS-W111
  line: | GFS-W111 | 80 | 100 | 89 | 111 | R6105AZLD | 110 | EL 274C | 80 | RUIFEN6120 | Detail
- supplierId: kaichen-jiangsu, n: 5002
  line: | 80 | 100 | 88 | 110 | 100KVA | Ricardo | R6105AZLD | Kaichen | KCI-100 | mechanical | Silent Type | 2700*1100*1700 | 2320 | 80A H | Capable of continuous use for over 8 hours |
- supplierId: kachai-hangzhou, n: 2010, tổ máy: SWF80M
  line: | SWF80M | 100 | 110 | 80 | 88 | R6105AZLD | | TZH2-100 | K274A | 2250*850*1450 | 1250 | 2900*1130*1650 | 1650

### LR4M3L-D
- supplierId: elitech-power, n: 104, tổ máy: EPS100YTA-3S
  bảng một model: Model: EPS100YTA-3S | 100.0kVA | 3-Phase | 50Hz ; | Power (kVA) | 100.0 ; | Engine Model | LR4M3L-D ; | Phase | 3-Phase ; | Frequency (Hz) | 50Hz ; | Fuel Tank Capacity | 8 Hours | Extended Option Available ; Power(kVA): 22 ; Phase: 3-Phase ; Power(kVA): 55 ; Power(kVA): 200.0 ; Power(kVA): 10 ; Phase: 1-Phase, 3-Phase ; Power(kVA): 62.5 ; Power(kVA): 13
- supplierId: koten-power, n: 5001, tổ máy: KY100D6
  line: | KY100D6 | 80 | 100 | 88 | 110 | LR4M3L-D |
- supplierId: longkai-power, n: 128, tổ máy: LG80YTO
  line: | LG80YTO | 110 | 88 | 100 | 80 | LR4M3L-D | OP2250*880*1350 | AT2938*1080*1690 |
- supplierId: xingguang-jiangsu, n: 122, tổ máy: XG110S3
  line: | XG110S3 | 110 | 100 | Starlight | LR4M3L-D | PDF

## Động cơ khác trong khoảng công suất (40, điểm thấp hơn; mỗi động cơ một dòng)

- YC4D140-D31 (Yuchai) — supplierId: previa-ningde, n: 113
  line: | PR80YC | 110 | 88 | 100 | 80 | YC4D140-D31 | OP2250*880*1400 | AT2938*1080*1690
- 4HTAA4.3-G34 (SDEC) — supplierId: pengpai-yangzhou, n: 130
  line: | PPDL-S80 | 80/100 | 上柴动力 | 4HTAA4.3-G34 | 4 | 4.3 | 13 | ≤192 | 1950*890*1170 | 970
- YC4A140L-D25 (Yuchai) — supplierId: walter-yangzhou, n: 109
  line: | WET-90 | 112.5 | 90 | 105 | 84 | YC4A140L-D25 | 2100*1100*1300
- QSB5.9-G2 (Cummins) — supplierId: previa-ningde, n: 102
  line: | PR80C | 110 | 88 | 100 | 80 | QSB5.9-G2 | OP2200*880*1360 | AT3288*1130*1850
- QSB5.9-G30 (Cummins) — supplierId: aosif, n: 101
  line: | AC125-I | 112/90 | 125/100 | QSB5.9-G30 | 27.7 | 6L | 5.9 |
- LR6A3Z-D (YTO) — supplierId: depco-power, n: 2067
  bảng nhiều model theo cột (LR6A3Z-D là cột thứ 3 từ phải; sourceQuote là nguyên dòng, src.line là dòng "| Model | LR6A3Z-D | Fuel | Diesel"): Item NO.: → ? ; DPK-DTY-120S → ? ; Frequency(Hz): → ? ; 50 → ? ; Phase: → ? ; 3 → ? ; Voltage(V): → ? ; 380 → ? ; Engine: → ? ; YTO → ? ; Engine Model: → ? ; LR6A3Z-D → ? ; PRP (kW): → ? ; 88 → ? ; PRP (kVA): → ? ; 110 → ? ; ESP (kW): → ? ; 97 → ? ; ESP (kVA): → ? ; 121 → ? ; Arrangement: → ? ; 6L → ? ; Governor: → ? ; Mechanical → ? ; | Details Generator Set | GenSet Model | DPK-DTY-120S | Type | Silent → DPK-DTY-120S ; | Frequency (Hz) | 50 | Speed ( rpm ) | 1500 → 50 ; | Phase | 3 | Rated voltage | 380V → 3 ; | Prime output | 88kW/110kVA | Standby output | 97kW/121kVA → 88kW/110kVA ; | Cylinder | 6 | Cooling system | Water → 6 ; | N.W (kg) | 1450 | Size (L*W*H)mm | 2990*1100*1550 → 1450 ; | Fuel Con.(L/H) | 21.5 | Fuel capacity tank | 189 L → 21.5 ; | Running time (H) | 8 | Sound decibel | 70DB-75DB → 8 ; | Details Engine | Brand | YTO → ? ; | Model | LR6A3Z-D | Fuel | Diesel → LR6A3Z-D ; | Cylinder | 6 | Cooling system | Water-cooling → 6 ; | Cylider arrangemant | IN-LINE | Bore and Stroke(mm) | 105 X 125 → IN-LINE ; | Cyle | 4 Staoke | Compression ratio | 17.0:1 → 4 Staoke ; | Governor | Mechanical | Displacement(L) | 6.49 → Mechanical ; | Details Alternator | Brand | Depco, Stamford, Leroy somer → ? ; | Model | DPC274D/UCI274C/ N125G4/ TAL-A44-E → ? ; | No.of bearings | 1 | Insulation class | H → 1 ; | Wires | 12 | Ingress protection | IP23 → 12 ; | Excitation system | Shunt | Volrage | ±1% → Shunt
- LR4N5LP-D (YTO) — supplierId: previa-ningde, n: 101
  line: | PR80YTO | 110 | 88 | 100 | 80 | LR4N5LP-D | OP2250*880*1350 | AT2938*1080*1690
- YC4D155-D31 (Yuchai) — supplierId: previa-ningde, n: 113
  line: | PR90YC | 124 | 99 | 113 | 90 | YC4D155-D31 | OP2250*880*1400 | AT3288*1130*1850
- YC6B135Z-D20 (Yuchai) — supplierId: taihai-taizhou, n: 109
  line: | TH-90GF | 90 | 112.5 | 162 | YC6B135Z-D20 | 6 | 108×125 | 6.871 | 16 | ≤202 | 2250*800*1300 | 1300
- 4HTAA4.3-G21 (SDEC) — supplierId: walter-yangzhou, n: 110
  line: | WET-100 | 125 | 100 | 120 | 96 | 4HTAA4.3-G21 | 2170*880*1359
- BF4M2012C-G2 (Deutz) — supplierId: excel-power-ningde, n: 118
  line: | EP-DE110 | 88 | 110 | 96.8 | 121 | BF4M2012C G2 | 21.4 | 1850*900*1280 | 2400*1020*1500 |
- BF4M1013EC-G1 (Deutz) — supplierId: previa-ningde, n: 105
  line: | PR80D | 110 | 88 | 100 | 80 | BF4M1013EC G1 | OP2250*880*1500 | AT2938*1080*1690
- TD226B-6D (Deutz) — supplierId: gb-power, n: 1038
  bảng một model: | MODEL | GB-D100 ; | Standby Power(50Hz) | 88KW/110KVA ; | Prime Power(50Hz) | 80KW/100KVA ; | Engine | DEUTZ TD226B-6D ; | Alternator | STAMFORD UCI274C ; | Generator | Set ; | Voltage | Frequency ; | Phase | P.F ; | Standby | Standby ; | (COS￠) | Amps ; Prime Power(PRP):Prime power is available for an unlimited number of annual hours in ; | Copyright By GB POWER | 1/4 ; | Dimension | Of ; Generator Set ; | Dimension(L*W*H)/CM For Open Type | 235×85×190 CM ; | Net Weight/KG For Open Type | 1150KG ; | Dimension(L*W*H)/CM For Sound Proof Type | 323×117×180 CM ; | Net Weight/KG For Sound Proof Type | 1790 KG ; Dimension (L*W*H)/MM For Trailer Type ; | Engine Model | TD226B-6D ; | Manufacturer | DEUTZ JOINT VENTURE ; | Prime Power | 90KW/121HP ; | Standby Power | 99KW/133HP ; | Engine Configuration | 6Cylinder In Line, 4Stroke,Direct ; | Gas Feeding Model | Turbo Charged ; | Bore×Stroke | 105×120(MM) ; | Displacement | 6.23L ; | Engine | Rated Speed | 1500RPM ; | Speed Governor | Mechanical speed controller, ; | Starter Model | 24V DC Start ; | Fuel Consumption Standby | 22.7 L/H ; | Prime | 20.8 L/H ; | Compression Ratio | 16.0:1 ; | Cooling System | Water Cool ; | Copyright By GB POWER | 2/4 ; | Alternator Model | UCI274C ; | Manufacturer | STAMFORD company ; | Prime Output | 80KW/100KVA ; | Standby Output | 88KW/110KVA ; | Excitation Model | Brushless, Self-Exciting ; | Cooling Method | Air Cooling ; | Power Factor | 0.8 ; | Protection Class | IP22 ; | Insulation Class | H ; | Voltage Regulation, | ≤±1% ; | Alternator | Influence Factor ; | Frequency Reduce | 0-5% adjustable ; | Frequency Regulation, | ≤1.5% ; | Frequency Waving | ≤0.8% ; | Sudden Frequency Warp | ≤+12% ; | Sudden Frequency Warp | ≤-10% ; | Frequency Recovery Time | ≤5S ; Control Panel System ; | SMARTGE CONTROL MODEL/ MANUAL | OR ; | DEEPSEA CONTROL MODEL/ MANUAL OR ATS | USE ; | Copyright By GB POWER | 4/4
- TAD531GE (Volvo Penta) — supplierId: vantek-jiangsu, n: 105
  line: | TPD105V6 | 105 | 84 | 115 | 92 | TAD531GE | 2080×940×1550 | 1350
- 1004C-44TAG2 (Perkins) — supplierId: gb-power, n: 1013
  bảng một model: Standard Features ; | MODEL | GB-P100 ; | Standby Power(50Hz) | 88KW/110KVA ; | Prime Power(50Hz) | 80KW/100KVA ; | Engine | PERKINS 1004C-44TAG2 ; | Alternator | STAMFORD UCI274C ; | Generator | Set ; | Voltage | Frequency ; | Phase | P.F ; | Standby | Standby ; | (COS￠) | Amps ; Prime Power(PRP):Prime power is available for an unlimited number of annual hours in ; | Dimension | Of ; | Dimension(L*W*H)/CM For Open Type | 230×96×148 CM ; | Net Weight/KG For Open Type | 1150KGS ; | Dimension(L*W*H)/CM For Sound Proof | Type | 320×116×184 CM ; | Net Weight/KG For Sound Proof Type | 1700KGS ; Dimension (L*W*H)/MM For Trailer Type ; | Engine Model | 1004C-44TAG2 ; | Manufacturer | PERKINS ; | Emissions statement | EU2007(EU97/68/EC Stage Ⅱ ) ; | Prime Power | 91KW/122HP ; | Standby Power | 100KW/134HP ; | Engine Configuration | 4Cylinder In Line, 4Stroke,Direct Injection ; | Gas Feeding Model | Turbocharged ; | Bore×Stroke | 100×127(MM) ; | Engine | Displacement | 5.99L ; | Rated Speed | 1500RPM ; | Speed Governor | Electrical ; | Starter Model | 12V DC Start ; | Prime | 22.6L/H ; | Cooling System | Water Cool ; | Compression Ratio | 18．2:1 ; | Copyright By GB POWER | 2/4 ; | Alternator Model | UCI274C ; | Manufacturer | STAFMORD company ; | Prime Output | 80KW/100KVA ; | Standby Output | 88KW/110KVA ; | Excitation Model | Brushless, Self-Exciting ; | Cooling Method | Air Cooling ; | Power Factor | 0.8 ; | Protection Class | IP22 ; | Insulation Class | H ; | Voltage Regulation, | ≤±1% ; | Alternator | Influence Factor ; | Frequency Reduce | 0-5% adjustable ; | Frequency Regulation, | ≤1.5% ; | Frequency Waving | ≤0.8% ; | Sudden Frequency Warp | ≤+12% ; | Sudden Frequency Warp | ≤-10% ; | Frequency Recovery Time | ≤5S ; | GB POWER | 3/4 ; | DEEPSEA6020 CONTROL MODEL/ | MANUAL ; | Copyright By GB POWER | 4/4
- 6BT5.9-G2-96KW (Cummins) — supplierId: yihua-fujian, n: 106
  bảng một model: | GENERATOR SET MODEL | YH-100C ; | Prime Output (KVA/KW) | 100KVA/80KW ; | Standby Power(kVA/KW) | 110KVA/88KW ; | Engine Model | Cummins 6BT5.9-G2-96KW ; | Alternator Model | UCI274C-80KW ; | Rated Output | 80KW ; | Standby Output | 88KW ; | Rated Speed | 1500 RPM ; | Frequency | 50 HZ ; | Rated Voltage | 380/220V, 400/231V, 415/240V, 440/254V ; | Power Factor | 0.8 ; | Model | Cummins 6BT5.9-G2-96KW ; | Rated Output/Speed | 96KW/130.7HP/1500RPM ; | Standby Output/Speed | 105.6KW/143.7HP/1500RPM ; | Engine Type | 6 cylinder in line ; | Bore X Stroke | 102*120 mm ; | Displacement | 5.9L ; | Rated speed(rpm) | 1500 ; | Fuel Consumption/rated output | 214 g/h ; | Fuel Consumption/standby output | 213 g/h ; | Starting method | D.C. 24V Electric starting ; | ALTERNATOR MODEL | UCI274C-80KW ; | Continuous Output (KW) | 80KW ; | Power Efficiency | 0.866 ; | Voltage Regulation | ±1.5% with 4% engine govering ; Speed:1500/1800rpm ; Frequency :50/60HZ
- WP6D132E200 (Weichai) — supplierId: jet-power, n: 135
  line: | WP-125 | 125 | 100 | 114 | 91 | WP6D132E200 | 6L | Mechanical | 105×130 | 6.75 | 22.5 | JET274D
- R6105ZD (Ricardo) — supplierId: victory-generator, n: 115
  line: | V98T | 60 | 80 | 100 | 88 | 110 | R6105ZD | <=231 | <=1.63 | 2350*800*1270 | 1300 | 2800*1150*1610 | 1450
- BF6L913 (Deutz) — supplierId: xinzhengfa, n: 108
  line: | ZF88GF | 110 | 88 | 158.4 | 50/1500 | BF6L913 | 2070 × 1000 × 1280 | 1040
- 1104D-E44TAG2 (Perkins) — supplierId: excel-power-ningde, n: 112
  line: | EP-PE112.5 | 90 | 112.5 | 100 | 125 | 1104D-E44TAG2 | 23.45 | 1880*800*1240 | 2720*1080*1700 |
- QSB5.9-G3 (Cummins) — supplierId: eastern-lion-fuan, n: 172
  line: | GFS-C96Ⅱ | 96 | 120 | 107 | 133 | QSB5.9-G3 | 120KW | EL 274D | 96KW | Smartgen 6120
- 4HTAA4.3-G23 (SDEC) — supplierId: lees-power, n: 112
  line: | LSSC125S3 | 125 | 114 | 100 | 91 | 4HTAA4.3-G23 | PDF
- BF4M1013EC-G2 (Deutz) — supplierId: excel-power-ningde, n: 118
  line: | EP-DE120 | 96 | 120 | 105.6 | 132 | BF4M1013EC G2 | 23.1 | 1920*1000*1400 | 2720*1080*1520 |
- YC4A140L-D20 (Yuchai) — supplierId: previa-ningde, n: 113
  line: | PR80YC | 110 | 88 | 100 | 80 | YC4A140L-D20 | OP2250*880*1400 | AT2938*1080*1690
- YC4A140-D30 (Yuchai) — supplierId: previa-ningde, n: 113
  line: | PR80YC | 110 | 88 | 100 | 80 | YC4A140-D30 | OP2250*880*1400 | AT2938*1080*1690
- WP4.1D113E200 (Weichai) — supplierId: walter-yangzhou, n: 108
  line: | WET-100 | 125 | 100 | 112.5 | 90 | WP4.1D113E200 | 2250*880*1250
- 1006TG2A (Lovol) — supplierId: xinzhengfa, n: 106
  line: | ZF88GF | 88/110 | 1006TG2A | 2500*1000*1420 | 1246
- 4M10G6D3/5 (Baudouin) — supplierId: yanan-power, n: 106
  line: | YN110B | 110kVA | 88kW | 100kVA | 80kW | 4M10G6D3/5 | 4 | YN110B
- YC6B155L-D21 (Yuchai) — supplierId: yingtai-jiangsu, n: 106
  line: | 90GF | 90 | 112.5 | 100 | 125 | 162 | 180 | 1378 | 2.40*0.80*1.33 | YC6B155L-D21
- YCD4Y32D-130 (Yuchai) — supplierId: excel-power-ningde, n: 103
  line: | EP-YC100 | 80 | 100 | 88 | 110 | YCD4Y32D-130 | 20.52 | 2200*1050*1450 | 2800*1100*1600 |
- CA6DF2D-14D/96KW (FAWDE) — supplierId: jet-power, n: 134
  line: | XC-110 | 110 | 88 | 100 | 80 | CA6DF2D-14D/96KW | L6 | Electronic | 6.55 | 110×115 | JET274C/80KW | 2550*1000*1550 | 1350 | 2850*1080*1550 | 2150
- YC4A155-D30 (Yuchai) — supplierId: previa-ningde, n: 113
  line: | PR90YC | 124 | 99 | 113 | 90 | YC4A155-D30 | OP2250*880*1400 | AT3288*1130*1850
- WP6CD132E200 (Weichai) — supplierId: mamo-power, n: 110
  line: | TWP124M | 90 | 113 | 99 | 124 | WP6CD132E200 | IMO II | O | O
- YC6B155L-D20 (Yuchai) — supplierId: dingbo, n: 108
  line: | XG-90GF | 90/112.5 | 99/123.75 | YC6B155L-D20 | TFW2-90-4A | 2350x950x1400 | 1200
- 1006TAG1A (Lovol) — supplierId: suneco-linyi, n: 102
  line: | ECO130P | 130kVA | 104kW | 118kVA | 94kW | 1006TAG1A | 6 | ECO130P
- 1104A-44TG2 (Perkins) — supplierId: minsun-motor, n: 101
  line: | GF-P80 | 80 | 100 | 1104A-44TG2 | SY-A 224G
- WP4.1D95E201 (Weichai) — supplierId: jianghao-genset, n: 109
  line: | JHW-80GF | 100 | 80 | WP4.1D95E201 | 4 | 105*118 | 4.09 | 13 | 235 | 2000*800*1250 | 1100
- R6105IZLD (Ricardo) — supplierId: kaichen-jiangsu, n: 5002
  line: | 96 | 120 | 105.6 | 132 | 120KVA | Ricardo | R6105IZLD | Kaichen | KCI-120 | mechanical | Silent Type | 2700*1100*1700 | 2250 | 80A H | Capable of continuous use for over 8 hours |
- QSB3.9-G39 (Cummins) — supplierId: yanan-power, n: 101
  line: | YN110C | 110kVA | 88kW | 100kVA | 80kW | QSB3.9-G39 | 4 | YN110C
- YC4A165-D30 (Yuchai) — supplierId: previa-ningde, n: 113
  line: | PR96YC | 132 | 106 | 120 | 96 | YC4A165-D30 | OP2250*880*1400 | AT3288*1130*1850

## Tiêu đề bảng (header của mỗi bảng supplierId n, dùng được cho sourceQuote)

- hyundai-power-products n 5001: | Genset Model | Prime Power | Standby Power | Engine Model | Alternator Model | Control System
- stone-power n 106: | GENSET MODEL | Output(kW) | Output(kVA) | Engine | Alternator Model | Standby | Prime | Standby | Prime | Cummins | Stamford | Marathon | Wattek
- fdk-energy n 103: | | Genset Model | Standby Power | Prime Power | Engine Model | Engine Original | Alternator Model | Details | Download PDF
- jet-power n 129: | 400V / 50Hz / 1500RPM | Perkins Diesel Engine | Alternator | Open type | Soundproof type | Standby output | Prime Output | Model | No. of Cylinder | Bore x stroke | Displacement | Fuel Consumption | STAMFORD | Packing (mm) | Weight | Packing (mm) | Weight | KVA | KW | KVA | KW | （MM) | (L) | (L/H) @ Full Load | (L x W x H) | Kg | (L x W x H) | Kg
- koten-power n 5001: | Genset model | Prime kW | Prime kVA | Standby kW | Standby kVA | Engine model | Alternator
- stone-power n 107: | Genset Model | Genset Power(kW) | Genset Capacity(kVA) | Engine Model | Alternator | Standby | Prime | Standby | Prime | (Cummins) | Stamford | Marathon | Wattek
- uleengen n 101: | Genset Model | 50HZ | Diesel Engine | Alternator | Overall Size(mm) | Gross Weight(kg) | Power(kW) | Power(kVA) | Model | Rated Power(kW) | No. of Cylinder | Bore xStroke(mm) | Displacement(L) | Rated Fuel Consumption(L/h) | Model
- fdk-energy n 102: | | Genset Model | Standby Power | Prime Power | Engine Model | Engine Original | Alternator Model | Details | Download PDF
- wintpower n 107: | Genset Model | 50HZ PF=0.8 400/230V 3Phase 4Wire | Engine Model | Stamford Alternator | Leroy Somer Alternator | Wintpower Alternator | Prime Power | Standby Power | KW/KVA | KW/KVA
- fdk-energy n 108: | | Genset Model | Standby Power | Prime Power | Engine Model | Engine Original | Alternator Model | Details | Download PDF
- uleengen n 123: | Genset Model | 50HZ | Diesel Engine | Alternator | Overall Size(mm) | Gross Weight (kg) | Power (kW) | Power (kVA) | Model | Rated Power (kW) | No. of Cylinder | Bore xStroke (mm) | Displacement (L) | Rated Fuel Consumption (L/h) | Model
- uleengen n 135: | Genset Model | 50HZ | Diesel Engine | Alternator | Overall Size open frame type(mm) | Gross Weight(kg) | Power(kW) | Power(kVA) | Model | Rated Power(kW) | No. of Cylinder | Bore xStroke(mm) | Displacement(L) | Rated Fuel Consumption(L/h) | Model
- jet-power n 132: | Model | 400V / 50Hz / 1500RPM | VOLVO PENTA DIESEL ENGINE | Alternator | Standby Power | Prime Power | Engine | No. of Cylinders | Bore / Stroke | Displacement (L) | Governing Type | Compression Ratio | Stamford | kVA | kW | kVA | kW | （MM) | (L)
- longkai-power n 108: | GENSET MODEL | ESP | PRP | ENGINE TYPE | ALTERNATOR | DIMENSION | DATASHEET | KW | KVA | KW | KVA | Longkai | Leroy Sommer | OPEN TYPE | SILENT TYPE
- kaihua-genset n 119: | HICHAIPOWER Model | Standby kVA | Prime kVA | Engine Model | Alternator Stamford | Dimension mm Open Type | Soundproof Type | Data PDF
- uleengen n 104: | Genset Model | 50HZ | Diesel Engine | Alternator | Overall Size(mm) | Gross Weight(kg) | Power (kW) | Power (kVA) | Model | Engine brand | Rated Power(kW) | No. of Cylinder | Bore xStroke(mm) | Displacement (L) | Rated Fuel Consumption (L/h) | Model
- bobig-power n 111: | Gensets | Technical Data of Diesel Engine(50hz/1500rpm) | Alternator(50hz/1500rpm) | Size | Model | Gensets power(KW/KVA ) | Engine model | Engine power/kw | BOBIG | Open type (MM) | sounproof type (MM) | Prime | Standby | Prime
- bobig-power n 170: | Gensets | | Technical Data of Diesel Engine(50hz/1500rpm) | Alternator(50hz/1500rpm) | Size | Model | Gensets power(KW/KVA) | Engine model | Engine power(kw) | BOBIG | Open type (MM) | sounproof type (MM) | Prime | Standby | Prime
- jet-power n 136: | Model | 400V / 50Hz / 1500RPM | SDEC Diesel Engine | Alternator | Standby output | Prime Output | Model | Engine type | Displacement | Bore×Stroke | Brushless | KVA | KW | KVA | KW | No. of Cylinder | Governor | (L) | (MM)
- bobig-power n 101: | l | Gensets power(KW/KVA) | Engine model | Engine power/kw | BOBIG | Open type (MM) | sounproof type (MM) | Prime | Standby | Prime
- rise-power n 120: | Model | Power (kw/kVA) | Engine Model | Alternator Model | Dimension | Weight | Prime | Standby | Open Type | Sound Proof | Open Type | Sound Proof
- jet-power n 116: | Model | 400V / 50Hz / 1500RPM | Chinese Diesel Engine | Alternator | Standby Output | Prime Output | Model | Engine type | Displacement | Bore×Stroke | Brushless type | KVA | KW | KVA | KW | No. of Cylinder | Governor | (L) | (MM)
- acepow-fuan n 129: | GENSET | Alternator | Engine Model | Model | Frequ ency | Phase | Genset power(KW) | Genset power(KVA) | Model | Model | Rated | Standby | Rated | Standby
- wintpower n 147: | Gensets model | Power output(KVA) | Power output (KW) | Cummins Engine Model | Leroy Somer Alternator | Prime Power | Standby Power | Prime Power | Standby Power
- eastern-lion-fuan n 108: | | Genset Specification 400/230V 50HZ | Engine | Brushless Alternator | Controller | Datasheet | Model | Prime power (kW) | Prime power (kVA) | Standby power (kW) | Standby power (kVA) | Engine model | Engine power (kW) | Alternator model | Alternator power (kW) | Controller | Datasheet
- acepow-fuan n 154: | Model | 50Hz , 1500rpm,400V/230V | Engine Model | Engine | Alternator Model | Genset | Prime Power | Standby Power | Prime Power | Standby Power | KWe | KVA | KWe | KVA | KWm | KWm
- koten-power n 4014: | Genset model | Prime kW | Prime kVA | Standby kW | Standby kVA | Engine model | Alternator
- bobig-power n 125: | Gensets | Technical Data of Diesel Engine(50hz/1500rpm) | Alternator (50hz/1500rpm) | Size | Model | Gensets power(KW/KVA) | Engine model | Engine power/kw | BOBIG | Open type (MM) | sounproof type (MM) | Prime | Standby | Prime
- eastern-lion-fuan n 111: | | Genset Specification 400/230V 50HZ | Engine | Brushless Alternator | Controller | Datasheet | Model | Prime power (kW) | Prime power (kVA) | Standby power (kW) | Standby power (kVA) | Engine model | Engine power (kW) | Alternator model | Alternator power (kW) | Controller | Datasheet
- hosem-power n 125: | Model | Prime Power (KVA/KW) | Standby Power(KVA/KW) | Engine Model | Dimension(MM) | Weight(KG)
- longkai-power n 121: | GENSET MODEL | ESP | PRP | Engine type | Dimension | Datasheet | KVA | KW | KVA | KW | Open type (mm) | Silent type(mm)
- minsun-motor n 102: | MODEL | Rated Power | Cummins Engine | Minsun Alternator | KVA | KW
- penlucky n 102: | | Penlucky Model | Standby kVA | Prime kVA | Engine Model | Alternator Stamford | Dimension mm Open Type | Soundproof Type | Data PDF
- bobig-power n 113: | Gensets | | Technical Data of Diesel Engine(50hz/1500rpm) | Alternator(50hz/1500rpm) | Size | Model | Gensets power(KW/KVA) | Engine model | Engine power(kw) | BOBIG | Open type (MM) | sounproof type (MM) | Prime | Standby | Prime
- jet-power n 135: | Model | 400V / 50Hz / 1500RPM | WEICHAI Diesel Engine | Alternator | Standby output | Prime Output | Model | No. of Cylinder | Governor | Bore×Stroke | Displacement | Fuel consumption @100% Load（L/h） | Brushless | KVA | KW | KVA | KW | (MM) | (L)
- penlucky n 103: | | Penlucky Model | Standby kVA | Prime kVA | Engine Model | Alternator Leroy-Somer | Dimension mm Open Type | Soundproof Type | Data PDF
- elitech-power n 1001: | | Genset Model | Engine Brand | Prime Power | Standby Power | Engine Model | Freq. | Phase | Specification Download | SEO ID
- sr-genset n 2002: | Standby | Prime | Engine | Alternator | Open Type Dimension | Silent Type Dimension | kVA | kW | kVA | kW | Model | Gov | Stamford | Leroy Somer | SRGENSET
- aosif n 101: | Prime Power | Standby Power | Engine Model | Fuel Consumption | Cylinder | Displacement | KVA/KW | KVA/KW | | L/h
- deman-power n 2015: Genset Model  Standby Power  Prime Power          Engine Model       No. of     Details
- kaihua-genset n 113: | Genset Model | Standby Power | Prime Power | Engine Model | Dimension(mm) | Weight(kg) | KVA | KVA
- mecca-power n 5001: | Genset model | Prime kW | Prime kVA | Standby kW | Standby kVA | Engine model | Alternator
- landtop-fuzhou n 121: | Genset Model | Genset Standby Power | Genset Prime Power | Governor Type | Emission Standard | Engine Model | Alternator Model | KVA | KW | KVA | KW
- rcg-power n 107: | | Model | Prime Power | Standby Power | Engine | Alternator | Download
- keliang-fuan n 107: | Gensets | Technical Data of Diesel Engine(50hz/1500rpm) | Alternator | Size & Weight | Model | Gensets power(KW/KVA) | Engine model | Engine power(kw) | Fuel consumption | Cylinder*Bore*Stroke | Displacement(L) | Compr-ession Ratio | Asp. | WANTONG | Rated Voltage(V) | Open Type Size(mm) | Weight(KG) | Silent Type Size(mm) | Weight(KG) | Prime | Standby | Prime | Standby | G/kw.h | L/h | (Qty*mm*mm)
- agestar n 101: | Model | Specification 50HZ 400-230V | General specifications | Alternator | Dimensions | Weight | ESP | PRP | Engine type | Consumption 100% | Gov | MODEL | KVA | KW | KVA | KW | L/H | mm | kg
- rcg-power n 124: | | 型号 | 主电源 | 备用电源 | 发动机 | 交流发电机 | 下载
- comappower n 108: | | Genset Model | Standby power | /kw | Prime power | /kw | Engine Model | NO. of Cylinder | Detail Data
- rise-power n 111: | Model | Prime Power | Standby Power | Engine | Cylinders | Displacement (L) | Fuel Consumption(L/h) | Open Version | Soundproofed Version | kVA | kW | kVA | kW | L*W*H(mm) | Weight (kg) | L*W*H(mm) | Weight (kg)
- app-power-anpu n 5001: | Genset model | Prime kW | Prime kVA | Standby kW | Standby kVA | Engine model | Alternator
- rcg-power n 112: | | Model | Prime Power | Standby Power | Engine | Alternator | Download
- comappower n 105: | | Genset Model | Standby power | /kw | Prime power | /kw | Engine Model | NO. of Cylinder | Detail Data
- voltgent n 110: | Genset Model | Standby Power (kVA) | Standby Power (kW) | Prime Power (kVA) | Prime Power (kW) | Engine Brand | Engine Model | Data Sheet
- dingbo n 108: | Generator Model | PRP KW/KVA | EPS KW/KVA | Engine Model | Alternator Model | Dimension (mm) | Weight (kg)
- comappower n 107: | | Genset Model | Standby power | /kw | Prime power | /kw | Engine Model | NO. of Cylinder | Detail Data
- kaihua-genset n 103: | Genset Model | Standby Power | Prime power | Engine Model | Dimention | Weight | KVA | KW | KVA | KW | mm | KG
- kingway-power n 126: | KVA | KWKVA | KW | | | | | Genset Model | ESP | PRP | Fuel Cons L/H(75%) | OPEN L*W*H (mm) | CLIENT L*W*H (mm) | Engine Model
- wintpower n 141: | Genset Model | 50HZ PF=0.8 400/230V 3Phase 4Wire | Engine Model | cyl | displacement | Battery Vol. | Max power | Governor | Open Type Dimension | Standby Power | Prime Power | Cons 100% ( L/H ) | KVA/KW | KVA/KW | L | V | KW | | L×W×H ( MM ) | Weight KG
- rise-power n 107: | Model | Prime Power | Standby Power | Engine | Cylinders | Displacement (L) | Fuel Consumption(L/h) | Oil Consumption(g/kWh) | Lube Capacity(L) | Coolant Capacity(L) | Dimensions | kVA | kW | kVA | kW | L*W*H(mm) | Weight (kg)
- victory-generator n 108: | Genset Model | Frequency (Hz) | Prime Power | Standby Power | Engine Model | Cylinder | Displacement (L) | Dimensions (mm) | Weight (kg) | KW | KVA | KW | KVA
- wintpower n 145: | Genset Model | 50HZ PF=0.8 400/230V 3Phase 4Wire | Engine Model | cyl | displacement | Exhaust Gas Temp. | Battery Vol. | Max power | Governor | Open Type Dimension | Standby Power | Prime Power | Cons 100% ( L/H ) | KVA/KW | KVA/KW | L | ºC | V | KW | | L×W×H ( MM ) | Weight KG
- rcg-power n 101: | | Model | Prime Power | Standby Power | Engine | Alternator | Download
- kaichen-jiangsu n 5001: | Genset model | Prime kW | Prime kVA | Standby kW | Standby kVA | Engine model | Alternator
- victory-generator n 110: | Model | Frequency | Prime Power | Standby Power | Engine Model | Full-Load Diesel Consumption (L/H) | Displacement (L) | Cylinders & arrangement | Governor Type | Open Type | Silent Type | HZ | kW | kVA | kW | kVA | Dimension L*W*H (mm) | Weight (KG) | Dimension L*W*H (mm) | Weight (KG)
- long-gen n 110: | Model | Prime Power | Standby Power | Engine | Alternator | Dimension& Weight | | KW | kVA | KW | kVA | Cummins | Stamford | Longen | L*M*H(mm)(open) | KG(open) | L*M*H(mm) (silent) | KG(silent) | download
- victory-generator n 106: | Genset Model | Frequency (HZ) | Prime Power | Standby Power | Engine Model | Full-Load Fuel Consumption (L/H) | CYCLINDER | Generator Set | KW | KVA | KW | KVA | MEASUREMENT/ L*W*H (mm) | WEIGHT (kg)
- walter-yangzhou n 105: | GensetModel | Power（kVA） | EngineBrand | Engine Model | Dimension(MM)L*W*H | Standby | Prime
- previa-ningde n 106: | GENSET MODEL | ESP | PRP | Engine type | Dimension | KVA | KW | KVA | KW | Open type (mm) | Silent type(mm)
- eastern-lion-fuan n 144: | | Genset Specification 400/230V 50HZ | Engine | Brushless Alternator | Controller | Datasheet | Model | Prime power (kW) | Prime power (kVA) | Standby power (kW) | Standby power (kVA) | Engine model | Engine power (kW) | Alternator model | Alternator power (kW) | Controller | Datasheet
- kaichen-jiangsu n 5002: | Prime kW | Prime kVA | Standby kW | Standby kVA | Size | Engine make | Engine model | Alternator make | Alternator | Controller | Type | L*W*H (mm) | Weight (kg) | Battery | Fuel tank
- kachai-hangzhou n 2010: | Diesel Generator Model | Generator Specification | Engine Specifcation | Alternator Specifcation | Open Type | Silent Type | Power(KVA) ( KVA) | Power(KW) ( KW) | Engine | | KACHAI | Stamford | Dimension | Weight | Dimension | Weight | Prime | Standby | Prime | Standby | Model | Model | Model | L×W×H(mm) * * ( mm) | (kg) | L×W×H(mm) * * ( mm) | (kg)
- longkai-power n 128: | GENSET MODEL | ESP | PRP | Engine type | Dimension | Datasheet | KVA | KW | KVA | KW | Open type (mm) | Silent type(mm)
- xingguang-jiangsu n 122: | GensetModel | Power（kVA） | EngineBrand | EngineModel | Specifications | Standby | Prime
- previa-ningde n 113: | GENSET MODEL | ESP | PRP | Engine type | Dimension | KVA | KW | KVA | KW | Open type (mm) | Silent type(mm)
- pengpai-yangzhou n 130: | | 机组型号 | 输出功率 (KW/KVA) | 柴油机品牌 | 柴油机型号 | 缸数 | 排量 (L) | 润滑油容量(L) | 燃油消耗 (g/kw.h) | 外形尺寸(L×W×H) | 机组重量(KG)
- walter-yangzhou n 109: | Genset Model | Standby Power | Prime Power | Engine Model | Dimension(MM)L*W*H | KVA | KW | KVA | KW
- previa-ningde n 102: | GENSET MODEL | ESP | PRP | Engine type | Dimension | KVA | KW | KVA | KW | Open type (mm) | Silent type(mm)
- previa-ningde n 101: | GENSET MODEL | ESP | PRP | Engine type | Dimension | KVA | KW | KVA | KW | Open type (mm) | Silent type(mm)
- taihai-taizhou n 109: | 机组型号 | 输出功率(kw) | 电流(A) | 柴油机型号 | 缸数 | 缸径*行程（mm） | 排气量 (L) | 润滑油容量 （L） | 燃油消耗率 g/kw.h | 机组尺寸mm L×W×H | 机组重量 kg | KW | KVA
- walter-yangzhou n 110: | Genset Model | Standby Power | Prime Power | Engine Model | L*W*H (mm) | KVA | KW | KVA | KW
- excel-power-ningde n 118: | Genset Model | 50Hz,400/230V,3-Phase | Engine Model | Fuel consumption (L/h) 100% | Dimension (L×W×H) mm | Download | Prime Power (KW/KVA) | Standby Power (KW/KVA) | Open type | silent type
- previa-ningde n 105: | GENSET MODEL | ESP | PRP | Engine type | Dimension | KVA | KW | KVA | KW | Open type (mm) | Silent type(mm)
- vantek-jiangsu n 105: | 型号 | 额定功率 (KVA/KW) | 备用功率 (KVA/KW) | 柴油机型号 | 机组尺寸 (MM) | 重量 (KG)
- victory-generator n 115: | Genset model | Frequency | Prime Power | Standby Power | Engine model | Fuel comsuption | Lube comsuption | Open type | Silent Type | KW | KVA | KW | KVA | g/kw.h | g/kw.h | Dimension (mm) | Weight (kg) | Dimension (mm) | Weight (kg)
- xinzhengfa n 108: | 机组型号 | 输出功率 | 额定电流A | 频率/转速 Hz/RPM | 柴油机型号 | 机组外型尺寸(L × B × H)mm | 机组重量Kg | KVA | KW
- excel-power-ningde n 112: | Genset Model | 50Hz,400/230V,3-Phase | Engine Model | Fuel consumption (L/h) 100% | Dimension | Download | Prime Power (KW/KVA) | Standby Power (KW/KVA) | OPEN | SILENT
- eastern-lion-fuan n 172: | | Model | Prime power (kW) | Prime power (kVA) | Standby power (kW) | Standby power (kVA) | Engine model | Engine power (kW) | Alternator model | Alternator power (kW) | Controller
- lees-power n 112: | Model | Standby KVA | Prime KVA | Standby KW | Prime KW | Engine | Specifications
- walter-yangzhou n 108: | Genset Model | Standby Power | Prime Power | Engine Model | Dimension(MM)L*W*H | KVA | KW | KVA | KW
- xinzhengfa n 106: | 机组型号 Gensets Model | 输出功率 Output Power | 柴油机型号 Engine Model | 机组外形尺寸 Gensets Overall Dimensions | 重量 Weight | 凯通牌 Defeng Trademark | 千瓦/千伏安 kW/kVA | 长*宽*高mm L * W * H mm | 千克 Kg
- yanan-power n 106: | Genset Model | Standby power | Prime power | Engine Model | NO.of Cylinder | Detail Data
- yingtai-jiangsu n 106: | 机组型号 Genset Model | 主用功率（主用） | 备用功率（备用） | 电流（主用）Power(A) | 电流（备用）Power(A) | 净重 Net Weight (kg) | 外形尺寸 Overall Dimensions L*W*H(m) | 品牌 Brand | 发动机型号 Engine Type | KW | KVA | KW | KVA
- excel-power-ningde n 103: | Genset Model | 50Hz,400/230V,3-Phase | Engine Model | Fuel consumption (L/h) 100% | Dimension | Download | Prime Power (KW/KVA) | Standby Power (KW/KVA) | OPEN | SILENT
- jet-power n 134: | Model | 400V / 50Hz / 1500RPM | FAWDE Diesel Engine | Alternator | Open type | Soundproof type | Standby | Prime | Model | Engine type | Displacement | Bore×Stroke | JET POWER BRAND | Packing (mm) | Weight | Packing (mm) | Weight | KVA | KW | KVA | KW | No. of Cylinder | Governor | (L) | (MM) | BRUSHLESS TYPE | (L x W x H) | Kg | (L x W x H) | Kg
- mamo-power n 110: | GENSET MODL | PRIME POWER | PRIME POWER | STANDBY POWER | STANDBY POWER | ENGINE MODEL | EMISSION STANDARD | OPEN | SOUNDPROOF | (KW) | (KVA) | (KW) | (KVA)
- suneco-linyi n 102: | Genset Model | Standby power | Prime power | Engine Model | NO. of Cylinder | Detail Data
- minsun-motor n 101: | MODEL | Rated Power | Perkins Engine | Minsun Alternator | KVA | KW
- jianghao-genset n 109: | Model | Output KVA | Power KW | Engine model | Cylinder NO. | Bore*Stroke mm | displace - ment (L) | Lubricating Capacity (L) | Fuel Consumption g/kw.h | Dimension (L×W×H) mm | Weight (kg)
- yanan-power n 101: | Genset Model | Standby power | Prime power | Engine Model | NO. of Cylinder | Detail Data

## Bộ điều khiển (44) — của các nhà cung cấp có dòng ở trên, dòng nguyên văn trên trang của họ

### DSE7320 — hãng: Deep Sea — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: acepow-fuan, n: 113
  line: base frame 4. Breaker: 3-pole output manual circuit breaker as standard, 4 poles for option 5. Controller: DSE6120, DSE7320, DSE8610 and other deepsea models, Comap MRS10, MRS16, AMF20, AMF25 for option. 6. Silencer: Heavy duty industrial type
- supplierId: aosif, n: 1067
  line: | Control module | Deepsea 7320
- supplierId: bobig-power, n: 101
  line: Standard AMF control panel, including digital LED genset control model: HGM6120U, DSE7320, DSE6020, AMF20, AMF25
- supplierId: elitech-power, n: 3001
  line: Cummins generator hot for its global service and warranty. With DeepSea 7320 MKII controllers…
- supplierId: fdk-energy, n: 3001
  line: | CMS1375KVA-50Hz-R-2018-175 GET A QUOTE NOW | Cummins KTA50-G3 | 1375KVA/1100KW 1250KVA/1000KW | Year: 2018 | Stamford | 400V 50Hz/1500rpm | DSE7320 Three Phase | Open Good Used | Details
- supplierId: hosem-power, n: 2
  line: Hosem Power uses the most famous brand controller for our diesel generator, include Deepsea brand with model DSE7320, DSE6020 and DSE7420 controller, ComAp brand with m...
- supplierId: jet-power, n: 101
  line: • DSE6020, HGM6120N, DSE7320 (AMF) Series Standard control panel, Optional Automatic transfer switch (ATS) and Automatic parallel operation system, Remote control system.
- supplierId: kaihua-genset, n: 3002
  line: HGM9510 Deepsea 7320

### DSE8610 — hãng: Deep Sea — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: acepow-fuan, n: 113
  line: 4. Breaker: 3-pole output manual circuit breaker as standard, 4 poles for option 5. Controller: DSE6120, DSE7320, DSE8610 and other deepsea models, Comap MRS10, MRS16, AMF20, AMF25 for option. 6. Silencer: Heavy duty industrial type silencer
- supplierId: fdk-energy, n: 3002
  line: | CMS2200KVA-50Hz-R-2014-15 GET A QUOTE NOW | Cummins UK QSK60-G4 | 2200KVA/1800KW 2000KVA/1600KW | Hours: 1200 Year: 2014 | Stamford P I734F1 | 400V 50Hz/1500rpm | DSE8610 Three Phase | Open Good Used | Details
- supplierId: kaihua-genset, n: 3001
  line: To enhance operational convenience and monitoring capabilities, each base station is equipped with the Deep Sea 8610 controller along with the remote 890 module. This integrated control system serves as the "brain" of the power unit,
- supplierId: rise-power, n: 3001
  line: DSE8610 Auto Start Load Share Controller (multi-generator synchronization system)
- supplierId: uleengen, n: 3
  line: Deepsea DSE7320, DSE7420, DSE6120, DSE6020, DSE8610

### DSE6120 — hãng: Deep Sea — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: acepow-fuan, n: 106
  line: Genset Control panel: Deepsea DSE6120
- supplierId: aosif, n: 1001
  line: | Control module | Deepsea 6120
- supplierId: bobig-power, n: 113
  line: Weichai 800KW 1000kVA Power Diesel Generator Prime Power Silent Diesel Generator Set 50Hz 230V with DSE6120 Control Panel Standby ISO CE
- supplierId: hosem-power, n: 3002
  line: | Control System | Deepsea DSE6120
- supplierId: kaihua-genset, n: 107
  line: 3.DSE6120, Smartgen control system
- supplierId: longkai-power, n: 1001
  line: | Model | DSE6120MK3
- supplierId: uleengen, n: 1
  line: | Control panel | digital AMF Control panel with protection function, with controller Smartgen HGM6120, Deepsea DSE7320, DSE6120
- supplierId: voltgent, n: 1007
  line: | CONTROL | MODULE Deep Sea DSE6120

### HGM6110 — hãng: SmartGen — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: acepow-fuan, n: 103
  line: Control panel: Deepsea / ComAp / Harsen / Smartgen 6110
- supplierId: bobig-power, n: 111
  line: LCD Digital Display, Deepsea, ComAp, Deepsea / ComAp / Harsen / Smartgen 6110, Smartgen
- supplierId: dingbo, n: 3001
  line: 300KW silent diesel generator set with Cummins engine NTA855-G2A, Marathon MP-300-4A three phase generator and SmartGen 6110 automatic control module.
- supplierId: hosem-power, n: 3001
  line: Hosem Power uses the most famous brand controller for our diesel generator, include Deepsea brand with model DSE7320, DSE6020 and DSE7420 controller, ComAp brand with model MSR10, AMF25, Nano and IC-NT controller, Smartgen brand with HGM6110, HGM6120, HGM7110, HGM7210 and other models.
- supplierId: kaichen-jiangsu, n: 101
  line: Controller: Smartgen HGM6110
- supplierId: stone-power, n: 121
  line: | Control System: | Smartgen 6110 | Frequency: | 50HZ/1500rpm
- supplierId: uleengen, n: 3
  line: | Controller | Smartgen HGM6120, HGM6110, HGM9510

### DSE6020 — hãng: Deep Sea — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: bobig-power, n: 101
  line: Standard AMF control panel, including digital LED genset control model: HGM6120U, DSE7320, DSE6020, AMF20, AMF25
- supplierId: hosem-power, n: 2
  line: Hosem Power uses the most famous brand controller for our diesel generator, include Deepsea brand with model DSE7320, DSE6020 and DSE7420 controller, ComAp brand with m...
- supplierId: jet-power, n: 101
  line: • DSE6020, HGM6120N, DSE7320 (AMF) Series Standard control panel, Optional Automatic transfer switch (ATS) and Automatic parallel operation system, Remote control system.
- supplierId: kaihua-genset, n: 105
  line: 3.DSE6020, Smartgen control system
- supplierId: stone-power, n: 103
  line: | Control System | DSE6020 / DSE7320
- supplierId: tecgen-fujian, n: 107
  line: | Controller | DSE6020
- supplierId: uleengen, n: 3
  line: Deepsea DSE7320, DSE7420, DSE6120, DSE6020, DSE8610
- supplierId: victory-generator, n: 114
  line: 2. Mounted intelligent European Brand Deepsea DSE6020 control panel with Auto

### HGM6120N — hãng: SmartGen — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: acepow-fuan, n: 103
  line: Control module Smartgen HGM6120N /DSE3110
- supplierId: hosem-power, n: 3002
  line: | Controller | Smartgen HGM6120N
- supplierId: jet-power, n: 101
  line: • DSE6020, HGM6120N, DSE7320 (AMF) Series Standard control panel, Optional Automatic transfer switch (ATS) and Automatic parallel operation system, Remote control system.
- supplierId: koten-power, n: 101
  line: Standard Smartgen HGM6120N control moduel with AMF function, Optional for Deepsea, ComAp, Datakom,Deif ect.
- supplierId: tecgen-fujian, n: 102
  line: | Control System | Brand | Smartgen | Model | HGM6120N
- supplierId: yihua-fujian, n: 101
  line: | Smartgen HGM6120N controller | Net weight(kg): | 9500 | Net weight(kg): | 7900 |

### AMF25 — hãng: ComAp — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: acepow-fuan, n: 113
  line: 4 poles for option 5. Controller: DSE6120, DSE7320, DSE8610 and other deepsea models, Comap MRS10, MRS16, AMF20, AMF25 for option. 6. Silencer: Heavy duty industrial type silencer with flexible bellow,elbow. 7. Battery: Varta Brand,high
- supplierId: bobig-power, n: 3003
  line: | Controller | Smartgen,Deepsea,Comap AMF20,AMF25
- supplierId: hosem-power, n: 3001
  line: Hosem Power uses the most famous brand controller for our diesel generator, include Deepsea brand with model DSE7320, DSE6020 and DSE7420 controller, ComAp brand with model MSR10, AMF25, Nano and IC-NT controller, Smartgen brand with HGM6110, HGM6120, HGM7110, HGM7210 and other models.
- supplierId: tecgen-fujian, n: 111
  line: | Controller | ComAP IL-AMF 25
- supplierId: wintpower, n: 109
  line: | Control Panel- ComAp AMF25

### HGM6120 — hãng: SmartGen — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: acepow-fuan, n: 102
  line: | Generator Voltage: | 230V/400V | Generator Controller: | Deepsea, HGM6120
- supplierId: eastern-lion-fuan, n: 107
  line: Controller Smartgen 6120
- supplierId: hosem-power, n: 3001
  line: Hosem Power uses the most famous brand controller for our diesel generator, include Deepsea brand with model DSE7320, DSE6020 and DSE7420 controller, ComAp brand with model MSR10, AMF25, Nano and IC-NT controller, Smartgen brand with HGM6110, HGM6120, HGM7110, HGM7210 and other models.
- supplierId: uleengen, n: 1
  line: | Control panel | digital AMF Control panel with protection function, with controller Smartgen HGM6120, Deepsea DSE7320, DSE6120
- supplierId: victory-generator, n: 101
  line: 2. Mounted intelligent famous Brand Smartgen HGM6120 control panel with Auto

### DSE4520 — hãng: Deep Sea — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: bobig-power, n: 124
  line: Standard AMF control panel, including digital LED genset control model: HGM6120U, DSE4520, DSE6120, AMF8,AMF25

### AMF20 — hãng: ComAp — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: acepow-fuan, n: 104
  line: 4. Famous brand COMAP AMF20 controller
- supplierId: bobig-power, n: 3003
  line: | Controller | Smartgen,Deepsea,Comap AMF20,AMF25
- supplierId: tecgen-fujian, n: 125
  line: | Controller | ComAp AMF20
- supplierId: victory-generator, n: 104
  line: 2. Mounted intelligent European Brand ComAp AMF20 control panel with Auto

### DSE3110 — hãng: Deep Sea — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: acepow-fuan, n: 103
  line: Control module Smartgen HGM6120N /DSE3110
- supplierId: fdk-energy, n: 3002
  line: | CMS220KVA-50Hz-R-2011-116 GET A QUOTE NOW | Cummins 6CTA8.3-G2 | 220KVA/176KW 200KVA/160KW | Year: 2011 | EGGA | 400V 50Hz/1500rpm | DSE3110 | Soundproof Good Used | Details

### DSE7320MKII — hãng: Deep Sea — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: hosem-power, n: 112
  line: The Perkins diesel generator with Deepsea DSE7320MKII controller with AMF function. It has the completely protection of the diesel engine and alternator in good working

### DSE7420 — hãng: Deep Sea — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: hosem-power, n: 2
  line: Hosem Power uses the most famous brand controller for our diesel generator, include Deepsea brand with model DSE7320, DSE6020 and DSE7420 controller, ComAp brand with m...
- supplierId: uleengen, n: 3
  line: Deepsea DSE7320, DSE7420, DSE6120, DSE6020, DSE8610
- supplierId: voltgent, n: 101
  line: | P900-1 | 800 | 640 | 900 | 720 | 4006-23TAG3A | FGL70030 | DSE7420

### HGM9510 — hãng: SmartGen — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: fdk-energy, n: 3002
  line: | CMS1875KVA-60Hz-R-25 GET A QUOTE NOW | Cummins KTTA50-G2 | 1875KVA/1500KW 1750KVA/1400KW | Hours: 10 Year: 1998 | Stamford | 400V 60Hz/1800rpm | SmartGen HGM9510 Three Phase | Soundproof Good Used | Details
- supplierId: kaihua-genset, n: 3002
  line: HGM7120UC HGM9510
- supplierId: kingway-power, n: 102
  line: Controller Model: Smartgen HGM 9510
- supplierId: uleengen, n: 3
  line: | Controller | Smartgen HGM6120, HGM6110, HGM9510

### HGM6110N — hãng: SmartGen — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: fdk-energy, n: 3002
  line: | MTU1100KVA-50Hz-R-2000-12 GET A QUOTE NOW | MTU 16V2000G23 | 1100KVA/880KW 1000KVA/800KW | Hours: 100 Year: 2000 | Siemens MD-840/50 | 400V 50Hz/1500rpm | SmartGen HGM6110N Three Phase | Open Good Used | Details
- supplierId: hosem-power, n: 105
  line: | Controller | Smarten HGM6110N
- supplierId: koten-power, n: 1002
  line: | Control Panel | Smartgen HGM6110N

### DSE4620 — hãng: Deep Sea — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
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

### InteliGen — hãng: ComAp — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: comappower, n: 3001
  line: Integrarea inteligenței artificiale : Platformele folosesc AI pentru a oferi recomandări personalizate, jucătorii fiind ghidați către jocurile care se potrivesc cel mai bine stilului lor.
- supplierId: fdk-energy, n: 3002
  line: | PKS2200KVA-50Hz-R-2013-23 GET A QUOTE NOW | Perkins UK 4016TAG2A | 2200KVA/1800KW 2000KVA/1600KW | Hours: 10 Year: 2013 | Siements(CHINA) JFG5605-4/10500 | 10.5 KV 50Hz/1500rpm | ComAP InteliGen Three Phase | Open Good Used | Details
- supplierId: kaihua-genset, n: 3002
  line: IL-NT AMF InteliGen-NTC

### AMF8 — hãng: ComAp — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: hosem-power, n: 3003
  line: | Controller Modul | ComAp AMF8

### DSE6110 — hãng: Deep Sea — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: rise-power, n: 3001
  line: DSE6110 Auto Start Controller with basic protection

### HGM6120U — hãng: SmartGen — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: bobig-power, n: 101
  line: Standard AMF control panel, including digital LED genset control model: HGM6120U, DSE7320, DSE6020, AMF20, AMF25

### DSE7410 — hãng: Deep Sea — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: voltgent, n: 101
  line: | P250-5 | 230 | 184 | 250 | 200 | 1506A-E88TAG2 | LL5114H | DSE7410

### HGM6110NC — hãng: SmartGen — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: fdk-energy, n: 3002
  line: | CMS350KVA-50Hz-R-2021-159 GET A QUOTE NOW | Cummins NTA855-G1B | 344KVA/275KW 312KVA/250KW | Hours: 0 Year: 2021 | Faraday FD4M1-4 | 400V 50Hz/1500rpm | HGM6110NC Three Phase | Open Original Unused | Details

### HGM6120UC — hãng: SmartGen — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: kaihua-genset, n: 3002
  line: IC-NT-MINT-2013 HGM6120UC

### MRS10 — hãng: ComAp
- supplierId: acepow-fuan, n: 113
  line: breaker as standard, 4 poles for option 5. Controller: DSE6120, DSE7320, DSE8610 and other deepsea models, Comap MRS10, MRS16, AMF20, AMF25 for option. 6. Silencer: Heavy duty industrial type silencer with flexible bellow,elbow. 7.

### MRS16 — hãng: ComAp — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: acepow-fuan, n: 113
  line: as standard, 4 poles for option 5. Controller: DSE6120, DSE7320, DSE8610 and other deepsea models, Comap MRS10, MRS16, AMF20, AMF25 for option. 6. Silencer: Heavy duty industrial type silencer with flexible bellow,elbow. 7. Battery:
- supplierId: kingway-power, n: 3001
  line: | Controller | ComAp MRS16

### SGC-420 — hãng: DEIF
- supplierId: tecgen-fujian, n: 107
  line: | Controller | DEIF SGC-420 | Fuel Tank | Integrated-fuel-tank

### AMF9 — hãng: ComAp — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)
- supplierId: hyundai-power-products, n: 5001
  line: High quality controller of COMAP AMF9

### DKG-116 — hãng: Datakom
- supplierId: acepow-fuan, n: 104
  line: Control System DKG116

### DKG-309 — hãng: Datakom
- supplierId: wintpower, n: 2
  line: high voltage generator , dkg309 ,

### HGM7110 — hãng: SmartGen
- supplierId: hosem-power, n: 3001
  line: Hosem Power uses the most famous brand controller for our diesel generator, include Deepsea brand with model DSE7320, DSE6020 and DSE7420 controller, ComAp brand with model MSR10, AMF25, Nano and IC-NT controller, Smartgen brand with HGM6110, HGM6120, HGM7110, HGM7210 and other models.

### HGM7120UC — hãng: SmartGen
- supplierId: kaihua-genset, n: 3002
  line: HGM6120UC HGM7120UC

### HGM7210 — hãng: SmartGen
- supplierId: hosem-power, n: 3001
  line: Hosem Power uses the most famous brand controller for our diesel generator, include Deepsea brand with model DSE7320, DSE6020 and DSE7420 controller, ComAp brand with model MSR10, AMF25, Nano and IC-NT controller, Smartgen brand with HGM6110, HGM6120, HGM7110, HGM7210 and other models.

### IG200 — hãng: ComAp
- supplierId: sr-genset, n: 2001
  line: ComAp IG200 + Electrical breaker

### Deep Sea (không ghi model) — hãng: Deep Sea
- supplierId: deman-power, n: 2001
  line: | Control System | Deep Sea, Smartgen, ComAp, Xingnuo, Shuangling
- supplierId: dingbo, n: 1
  line: Deep Sea Controller Cabinet
- supplierId: jianghao-genset, n: 3
  line: 发货配置：500KW斯太尔发动机配全铜发电机，江豪定制型不锈钢四轮移动拖车，配深海液晶自启动控制屏。江豪发电机组为您提供柴油发…… 更多
- supplierId: kingway-power, n: 105
  line: Alternator brand: With Lerysomer/Meccalt/Marathon/Stamford etc. Controller: Deepsea/Smartgen etc. Warranty: 12 months/1000 working hours. Cooling method: Closed Water-cooled. Noise: 75dba@7m.
- supplierId: koten-power, n: 102
  line: 3- Controller optional: Smartgen/Deepsea/ComAp.
- supplierId: mecca-power, n: 112
  line: 2.Equipped with generator set control system, ATS system, remote control system, parallel operation system, optional control model, Deep sea, Smartgen , ComAp ,ect.
- supplierId: minsun-motor, n: 102
  line: Modern power management requires precise control, immediate visibility, and automated safeguards. This generator suite is equipped with advanced Deepsea or Smartgen intelligent control panels, designed to give operators complete command over the entire power ecosystem.
- supplierId: penlucky, n: 2
  line: BAUDOUIN and MITSUBISHI engines and world famous STAMFORD, Leroy Somer and Mecc Alte alternator. We also use WoodWard, Deep Sea and ComAp control module which are professional engine controllers as our core control module. Also we own abundant

### ComAp (không ghi model) — hãng: ComAp
- supplierId: deman-power, n: 2001
  line: | Control System | Deep Sea, Smartgen, ComAp, Xingnuo, Shuangling
- supplierId: elitech-power, n: 102
  line: • Controller: Integrated digital auto monitoring. (SmartGen/DeepSea/ComAp)
- supplierId: jet-power, n: 101
  line: 04. Equipped with advanced generator set control system, ATS system, remote control system, parallel operation system, optional control Brand, Deep sea, Smartgen , ComAp , Jet Power
- supplierId: koten-power, n: 102
  line: 3- Controller optional: Smartgen/Deepsea/ComAp.
- supplierId: mecca-power, n: 112
  line: 2.Equipped with generator set control system, ATS system, remote control system, parallel operation system, optional control model, Deep sea, Smartgen , ComAp ,ect.
- supplierId: penlucky, n: 2
  line: MITSUBISHI engines and world famous STAMFORD, Leroy Somer and Mecc Alte alternator. We also use WoodWard, Deep Sea and ComAp control module which are professional engine controllers as our core control module. Also we own abundant skills for
- supplierId: stone-power, n: 107
  line: 1) Controller Brand: Smartgen, Deepsea,ComAp
- supplierId: uleengen, n: 2
  line: it covers Auto start control panel, Synchronization panels, ATS etc. With controller such as Deepsea, Smartgen, ComAp, Deif, Harsen, etc.

### SmartGen (không ghi model) — hãng: SmartGen
- supplierId: deman-power, n: 2001
  line: | Control System | Deep Sea, Smartgen, ComAp, Xingnuo, Shuangling
- supplierId: elitech-power, n: 102
  line: • Controller: Integrated digital auto monitoring. (SmartGen/DeepSea/ComAp)
- supplierId: mecca-power, n: 112
  line: 2.Equipped with generator set control system, ATS system, remote control system, parallel operation system, optional control model, Deep sea, Smartgen , ComAp ,ect.
- supplierId: minsun-motor, n: 102
  line: Modern power management requires precise control, immediate visibility, and automated safeguards. This generator suite is equipped with advanced Deepsea or Smartgen intelligent control panels, designed to give operators complete command over the entire power ecosystem.
- supplierId: rcg-power, n: 2001
  line: Smartgen
- supplierId: wintpower, n: 101
  line: Hinsulation class. 3. Standard 50ºC radiator with safety guard, engine driven fan mounted on skid 4. DEEPSEA, COMAP, SMARTGEN controller brand with Auto/Manual start and AMF function 5. DELIXI, CHINT or ABB branded MCCB circuit breaker mounted.
- supplierId: xingguang-jiangsu, n: 2002
  line: Over the years, Xingguang has maintained close cooperation with Jiangsu University, Changzhou University, and Yangzhou University, while also collaborating with world-renowned engine manufacturers such as Shangchai, Weichai, Cummins, MTU Benz, DAEWO Daewoo Heavy Industries, UK's Perkins, Guangxi Yuchai, Sweden's Volvo, as well as generator manufacturers like Delco, LS Lilei Senma, Stamford, and Marathon, and controller manufacturers like Zhongzhi and Deep Sea. It has become an (OEM) supporting factory and technology center, establishing long-term and stable strategic partnerships with them.

### DEIF (không ghi model) — hãng: DEIF
- supplierId: mecca-power, n: 159
  line: We can offer controller brand like Deepsea,Smartgen,DEIF,MECCA,etc.
- supplierId: rcg-power, n: 2001
  line: DEIF
- supplierId: uleengen, n: 2
  line: it covers Auto start control panel, Synchronization panels, ATS etc. With controller such as Deepsea, Smartgen, ComAp, Deif, Harsen, etc.

### Mebay (không ghi model) — hãng: Mebay
- supplierId: eastern-lion-fuan, n: 127
  line: Controller Mebay 6120
- supplierId: tecgen-fujian, n: 127
  line: | Controller | Mebay DC52D | Delivery Time | 10 Working Days

### Harsen (không ghi model) — hãng: Harsen
- supplierId: acepow-fuan, n: 101
  line: 2. Equipped with Deep Sea,ComAp,Harsen,Smartgen famous control systems.
- supplierId: bobig-power, n: 3002
  line: | Control Panel | LCD Digital Display, Deepsea, ComAp, Deepsea / ComAp / Harsen / Smartgen 6110, Smartgen
- supplierId: stone-power, n: 102
  line: 2000KW 2500KVA Diesel Generator Set Deepsea Harsen Smartgen Control Panel
- supplierId: tecgen-fujian, n: 104
  line: 4. Deepsea,Comap,Harsen,Smartgen Set mounted control panel
- supplierId: uleengen, n: 2
  line: Auto start control panel, Synchronization panels, ATS etc. With controller such as Deepsea, Smartgen, ComAp, Deif, Harsen, etc.

### Woodward (không ghi model) — hãng: Woodward
- supplierId: penlucky, n: 2
  line: PERKINS, BAUDOUIN and MITSUBISHI engines and world famous STAMFORD, Leroy Somer and Mecc Alte alternator. We also use WoodWard, Deep Sea and ComAp control module which are professional engine controllers as our core control module. Also we own

### Shuangling (không ghi model) — hãng: Shuangling
- supplierId: deman-power, n: 2001
  line: | Control System | Deep Sea, Smartgen, ComAp, Xingnuo, Shuangling

### Xingnuo (không ghi model) — hãng: Xingnuo
- supplierId: deman-power, n: 2001
  line: | Control System | Deep Sea, Smartgen, ComAp, Xingnuo, Shuangling


# Nhà cung cấp trong hệ thống (CSDL supplier/<id>)

- acepow-fuan: FUAN ACEPOW EQUIPMENT CO.,LTD — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: http://www.acepow.net/, trụ sở: Fuan, Fujian, chứng nhận: ISO9001; CE; SASO; SONCAP, bộ điều khiển: AMF20; AMF25; MRS10; MRS16; DKG-116; DSE3110; DSE6120; DSE7320; DSE8610; Harsen (không ghi model); HGM6110; HGM6120; HGM6120N
- agestar: Fujian Agestar Electrical Machinery Co.,Ltd — vai trò: alternator_maker, trạng thái: partial, độ tin cậy: medium, quốc gia: CN, website: https://www.agestarem.com/, trụ sở: Fujian, thành lập: 2014
- aosif: Xiamen AOSIF Engineering Ltd — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.aosif.com/, trụ sở: Xiamen, Fujian, thành lập: 2001, bộ điều khiển: DSE6120; DSE7320
- app-power-anpu: Anpu Heavy Industry (Shandong) Co., Ltd. — vai trò: genset_oem, trạng thái: partial, độ tin cậy: medium, quốc gia: CN, website: https://www.appfdj.com/, trụ sở: Weifang, Shandong
- bobig-power: FUJIAN BOBIG ELECTRIC MACHINERY CO.,LTD — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.bobigpower.com/, trụ sở: Fujian, bộ điều khiển: AMF20; AMF25; DSE4520; DSE6020; DSE6120; DSE6120 MKII; DSE7320; Harsen (không ghi model); HGM6110; HGM6120U
- comappower: FUJIAN COMAPPOWER NEW ENERGY CO.,LTD — vai trò: genset_oem, trạng thái: partial, độ tin cậy: medium, quốc gia: CN, website: https://comappower.com/, trụ sở: Fujian, chứng nhận: ISO9001-2000; CE, bộ điều khiển: InteliGen
- deman-power: WeiFang Deman Power Technology Co., LTD. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.demanpower.com/, trụ sở: Weifang, Shandong, thành lập: 2014, bộ điều khiển: Deep Sea (không ghi model); SmartGen (không ghi model); ComAp (không ghi model); Xingnuo (không ghi model); Shuangling (không ghi model)
- depco-power: Fujian Depco Power Generation Co., Ltd. — vai trò: genset_oem, trạng thái: partial, độ tin cậy: medium, quốc gia: CN, website: https://www.depcogenerator.com/, trụ sở: Ningde, Fujian, thành lập: 2009, chứng nhận: ISO9001; ISO14001; ISO45001
- dingbo: Guangxi Dingbo Generator Set Manufacturing Co., Ltd. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.dieselgeneratortech.com/, trụ sở: Nanning, Guangxi, thành lập: 2006, chứng nhận: CE; ISO9001; ISO14001; CQC; ISO9001-2015; ISO14001:2015, bộ điều khiển: Deep Sea (không ghi model); HGM6110
- eastern-lion-fuan: Fuan EASTERNLION Electric Machines Co., Ltd — vai trò: alternator_maker, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://easternlion.net/, trụ sở: Fuan, Fujian, bộ điều khiển: Mebay (không ghi model); HGM6120
- elitech-power: Elitech Power — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://elitechpower.com/, chứng nhận: CE, bộ điều khiển: ComAp (không ghi model); DSE7320; SmartGen (không ghi model)
- excel-power-ningde: NINGDE EXCEL POWER CO.,LTD. — vai trò: genset_oem, trạng thái: partial, độ tin cậy: medium, quốc gia: CN, website: https://www.fjexcel.com/, trụ sở: Fuan, Fujian, chứng nhận: ISO9001; CE
- fdk-energy: Guangdong FuDianKang (FDK) Diesel Generator — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://fdkenergy.com/, trụ sở: Guangzhou, Guangdong, thành lập: 2000, chứng nhận: ISO9001; ISO45001; CE, bộ điều khiển: InteliGen; DSE3110; DSE7320; DSE8610; HGM6110N; HGM6110NC; HGM6120CAN; HGM9510
- gb-power: GB POWER CO.,LTD — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.gbpower.net/, trụ sở: Shanghai, Shanghai, chứng nhận: ISO9001; CE
- hosem-power: Fuzhou Hosem Power Co., Ltd. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.industrialgeneratorset.com/, trụ sở: Fuzhou, Fujian, bộ điều khiển: AMF25; AMF8; DSE6020; DSE6120; DSE7320; DSE7320 MKII; DSE7420; HGM6110; HGM6110N; HGM6120; HGM6120N; HGM7110; HGM7210
- hyundai-power-products: GRV POWER PRODUCTS, S.L. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: ES, website: https://www.hyundaipower-de.com/, trụ sở: Sta. Llogaia Alguema, bộ điều khiển: AMF9
- jet-power: JET Electric Machinery Co., Ltd. (Jet Power) — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.jetgenset.com/, trụ sở: Fuan, Fujian, thành lập: 2002, bộ điều khiển: ComAp (không ghi model); DSE6020; DSE7320; HGM6120N
- jianghao-genset: Jiangsu Jianghao Generator Co.,Ltd. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: http://www.jhgensets.com/, trụ sở: Jiangsu, chứng nhận: ISO9001：2008, bộ điều khiển: Deep Sea (không ghi model)
- kachai-hangzhou: Zhejiang Kachai Generator Co., Ltd — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.kachai.com/, trụ sở: Hangzhou, Zhejiang, chứng nhận: CE; BV; SGS; ISO
- kaichen-jiangsu: Jiangsu Kaichen Electric Power Equipment Co., Ltd. — vai trò: genset_oem, trạng thái: partial, độ tin cậy: medium, quốc gia: CN, website: https://www.kaichenpower.com/, trụ sở: Yangzhou, Jiangsu, bộ điều khiển: HGM6110
- kaihua-genset: Taizhou Kaihua Diesel Generator Sets Co., Ltd. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.kaihuagenset.com/, trụ sở: Taizhou, Jiangsu, thành lập: 2003, chứng nhận: ISO9001; CE; CCS; BV, bộ điều khiển: InteliGen; DSE6020; DSE6120; DSE6120 MKII; DSE7320; DSE8610; HGM6120UC; HGM7120UC; HGM9510
- keliang-fuan: Fuan Keliang Electrical Machinery Co.,Ltd. — vai trò: alternator_maker, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://motors-world.com/, trụ sở: Fu'an, Fujian, thành lập: 1991
- kingway-power: Qingdao Kingway Industry Co., Ltd. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.kingwaygenerator.com/, trụ sở: Qingdao, Shandong, chứng nhận: ISO; CE; ATEX; DNV; BV; CCS, bộ điều khiển: MRS16; Deep Sea (không ghi model); HGM9510
- koten-power: Fuzhou Koten Power Equipment Co.,Ltd. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.kotenpower.com/, trụ sở: Fuzhou, Fujian, chứng nhận: ISO9001; ISO14001, bộ điều khiển: ComAp (không ghi model); Deep Sea (không ghi model); HGM6110N; HGM6120N
- landtop-fuzhou: Fuzhou Landtop Co., Ltd. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.landtop.cn/, trụ sở: Fuzhou, Fujian, thành lập: 2011
- lees-power: Wuxi Lees Power Company Limited — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.leespower.com/, trụ sở: Wuxi, Jiangsu, chứng nhận: CE; ISO; CQC
- long-gen: JIANGSU LONGEN POWER TECHNOLOGY CO., LTD. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.long-gen.com/, trụ sở: Jiangsu
- longkai-power: Fuan Longkai Power Co.,Ltd. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.longkaipower.com/, trụ sở: Fuan, Fujian, thành lập: 2002, chứng nhận: ISO 9001; ISO 14001; CE; CCS; CCC, bộ điều khiển: DSE6120
- mamo-power: Mamo Power Technology Co., Ltd. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.mamopower.com/, thành lập: 2004, chứng nhận: CE; ISO9001; ISO14001
- mecca-power: MECCA POWER — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.meccapower.com.cn/, bộ điều khiển: ComAp (không ghi model); Deep Sea (không ghi model); DEIF (không ghi model); SmartGen (không ghi model)
- minsun-motor: Mindong Shengyuan Electromechanical Co., Ltd — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.minsun-motor.com/, trụ sở: Fu'an, Fujian, thành lập: 2000, bộ điều khiển: Deep Sea (không ghi model); SmartGen (không ghi model)
- pengpai-yangzhou: 扬州澎湃动力设备有限公司 — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: http://yzppdl.cn/, trụ sở: Yangzhou, Jiangsu
- penlucky: Shandong Penlucky Power Equipment Co., Ltd. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://penlucky.com/, trụ sở: Weifang, Shandong, thành lập: 2007, bộ điều khiển: ComAp (không ghi model); Deep Sea (không ghi model); Woodward (không ghi model)
- previa-ningde: Ningde Previa Power Co., Ltd. — vai trò: genset_oem, trạng thái: partial, độ tin cậy: low, quốc gia: CN, website: https://www.priuspower.com/, trụ sở: Ningde, Fujian
- rcg-power: Jiangsu Ruichang Gold Generating Equipment Co., Ltd. — vai trò: genset_oem, trạng thái: partial, độ tin cậy: medium, quốc gia: CN, website: https://www.rcgpower.com/, trụ sở: Wuxi, Jiangsu, bộ điều khiển: Deep Sea (không ghi model); SmartGen (không ghi model); DEIF (không ghi model)
- rise-power: RISE Power Equipment Inc. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://dieselpower-en.com/, trụ sở: Guangzhou, Guangdong, chứng nhận: ISO9001, bộ điều khiển: DSE6110; DSE7320; DSE8610
- sr-genset: SR GENSET — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://sr-genset.com/, chứng nhận: ISO9001, bộ điều khiển: Deep Sea (không ghi model); IG200
- stone-power: JIANGSU STONE POWER CO.,LTD — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.silentgeneratorset.com/, trụ sở: Jiangsu, bộ điều khiển: ComAp (không ghi model); DSE6020; DSE7320; Harsen (không ghi model); HGM6110
- suneco-linyi: Suneco Diesel Generators — vai trò: genset_oem, trạng thái: partial, độ tin cậy: low, quốc gia: CN, website: https://www.generators365.com/, trụ sở: Linyi, Shandong
- taihai-taizhou: 泰州泰海机电设备有限公司 — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: http://jstaihai.com/, trụ sở: Taizhou, Jiangsu
- tecgen-fujian: FUJIAN TECGEN POWER CO., LTD. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.dgdieselgenerator.com/, trụ sở: Fujian, bộ điều khiển: AMF20; AMF25; DSE6020; DSE7320; SGC-420; Harsen (không ghi model); Mebay (không ghi model); HGM6120N
- uleengen: Shandong Uleen Generator Co., Ltd. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.uleengen.com/, trụ sở: Shandong, thành lập: 2011, chứng nhận: CE; ISO9001; ISO14001, bộ điều khiển: ComAp (không ghi model); DSE6020; DSE6120; DSE7320; DSE7420; DSE8610; DEIF (không ghi model); Harsen (không ghi model); HGM6110; HGM6120; HGM9510
- vantek-jiangsu: 江苏万泰动力设备有限公司 — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: http://www.vantekpower.cn/, trụ sở: Jiangsu
- victory-generator: Victory Power Technology Co., Ltd. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.victorygenerator.com/, bộ điều khiển: AMF20; DSE6020; HGM6120
- voltgent: Voltgent — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.voltgent.com/, bộ điều khiển: ComAp (không ghi model); DSE6120; DSE7410; DSE7420
- walter-yangzhou: Yangzhou Walter Electrical Equipment Co., Ltd. — vai trò: genset_oem, trạng thái: partial, độ tin cậy: medium, quốc gia: CN, website: https://www.wetgenerator.com
- wintpower: FUZHOU WINTPOWER TECHNOLOGY CO., LTD — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.wintpower.com/, trụ sở: Fuzhou, Fujian, chứng nhận: ISO9001; ISO14001; CE, bộ điều khiển: AMF25; DKG-309; DSE4620; DSE7320; SmartGen (không ghi model)
- xingguang-jiangsu: Jiangsu Starlight Electricity Equipment Co., Ltd. — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.jsxggx.com/, trụ sở: Taixing, Jiangsu, thành lập: 2000, chứng nhận: ISO9001; ISO14000, bộ điều khiển: Deep Sea (không ghi model); SmartGen (không ghi model)
- xinzhengfa: 郑州新郑发发电设备厂 — vai trò: genset_oem, trạng thái: partial, độ tin cậy: medium, quốc gia: CN, website: http://www.cyfdjc.net/, trụ sở: Zhengzhou, Henan
- yanan-power: Fujian Yanan Technology Co., Ltd (Yanan Power Group) — vai trò: genset_oem, trạng thái: partial, độ tin cậy: medium, quốc gia: CN, website: https://www.yanan-motor.com/, trụ sở: Fujian, chứng nhận: ISO9001; ISO14001; ISO45001; UL; CCC; CE
- yihua-fujian: Fujian Yihua Electrical Machinery Co.,Ltd — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.yihua-genset.com/, trụ sở: Fu'an, Fujian, thành lập: 1994, chứng nhận: CE; SONCAP, bộ điều khiển: HGM6120N
- yingtai-jiangsu: Yingtai Group — vai trò: genset_oem, trạng thái: verified, độ tin cậy: medium, quốc gia: CN, website: https://www.yingtaigroup.com/, trụ sở: Yangzhou, Jiangsu, thành lập: 1972, chứng nhận: ISO9001; ISO14001; OHSAS18001