# Chuẩn hoá datasheet, bước 4: kiểm kê nhãn thông số còn thiếu (chỉ đọc)

Phiên con của phiên điều phối `session_011tAj4RELb5EqrbU4sd2uN5`, 24/11/2026. Không sửa code, dữ liệu, không commit. Đọc checkout chính `C:\Projects\GenSet Pro\GenSet-Pro` ở **SHA 8832317fad54ebc5825a965eb830aceb17a8c47a** (`main`, sạch). Mọi script và TSV ở `genbid-work\dieu-phoi\dau-vao\buoc-4\` (đọc từ đây, chạy lại được).

## 0. Cách đo và giới hạn (đọc trước)

- Kho nhãn (`harvest.mjs`, `node harvest.mjs`, 22 giây): **10.158 bảng / 263.633 dòng** `specTables` của `suppliers/cn/*.json` (436 NCC) + **1.791 tệp nguồn** `sources/<id>/1001–1999.md` và `3001+.md` (tệp 2xxx, 6xxx của hãng BĐK dùng riêng ở mục 5). Nhãn lấy bằng `CAT.cellsOf` của `web/catalog.js` ở ba nơi: ô đầu của dòng «nhãn | giá trị», MỌI ô của dòng tiêu đề cột, và cặp «nhãn | giá trị | nhãn | giá trị» cùng một dòng (acepow: «Cooling method | Closed… | Winding/ Pitch | 100% Copper 2/3 Pitch»; cặp thứ hai trở đi trước đây không ai đọc). Bảng phân vai (`alt` / `eng` / `gen`) chỉ theo TIÊU ĐỀ bảng nên thô.
- **model-ô** = số ô có giá trị: dòng «nhãn | v1 | v2…» tính mỗi ô sau nhãn, ô tiêu đề cột tính số dòng dữ liệu có ô cùng chỉ số khác rỗng. Là cận trên của «số model sẽ có giá trị»: một model nằm ở nhiều bảng bị đếm nhiều lần, và ô có thể không hợp lệ sau bộ lọc `ok` của `SPECS`. KHÔNG phải số model riêng biệt; chưa chạy thử đọc thật (không sửa code).
- Nhãn trong bảng xếp hạng do em DUYỆT TAY sau khi đọc ví dụ (`xep-hang.mjs`, danh sách nhãn trong tệp). Các nhãn bị loại vì mơ hồ ghi ở mục 2. `truong-chat.tsv` có mọi nhãn khớp từ điển regex neo (595 nhãn, kèm ví dụ nguyên văn); `truong-nhan.tsv` là bản lỏng, nhiều nhiễu.
- Số liệu enum ở mục 4 lấy từ bản chuẩn sinh lại ở SHA này (`node suppliers/spec-standard.mjs --out dau-vao\buoc-4\std-out`: 9.685 doc, khớp 1.337 giá trị ngoài danh sách của `spec-value-check.md`: aspiration 522, governor 531, insulation 79, excitation 205).
- Mục 5 (BĐK): đếm TÀI LIỆU có cụm chữ, KHÔNG phải model có chức năng. Cụm chữ trong mục lục, tên công ty, nhật ký sửa đổi, cột kia của tờ hai cột đều tính; xem 5.1.

## 1. Xếp hạng trường theo lợi ích

Xếp theo model-ô (bảng cn). Cột «nguồn» = số dòng nhãn trong tệp nguồn thô / số NCC (chỉ để biết còn thêm bao nhiêu nếu đọc cả tệp nguồn, không cộng vào model-ô). «Hiện nay» = tình trạng trong `chuan-hoa-b2.md` mục 2 + `specKey` thật (đã thử bằng `thu-specKey.mjs`).

| # | Trường | Model-ô | Dòng | NCC (bảng) | Nguồn dòng / NCC | Hiện nay | Hành động |
|---|---|---|---|---|---|---|---|
| 1 | `genset.genset_type (cột Open/Silent)` | 9.139 | 344 | 28 | 863 / 6 | chưa sinh (cột phân vỏ) | tiêu đề cột 'Open type' / 'Silent type' / 'canopy': không phải cặp nhãn – giá trị |
| 2 | `alternator.wires` | 2.227 | 842 | 14 | 401 / 15 | chưa sinh; 'Wires' đang nhận nhầm sang phase | nhận 'Wires', 'No of Leads', 'Leads', 'Terminals', 'Number of wires'; bỏ khỏi phase |
| 3 | `engine.genset_power` | 1.523 | 242 | 19 | 88 / 5 | chưa sinh | nhận nhãn cột trong bảng ĐỘNG CƠ (cùng dòng với công suất tổ máy) |
| 4 | `engine.electrical_vdc` | 1.103 | 788 | 32 | 531 / 20 | chưa sinh; 'Starting voltage / system' đang vào `start` | nhận nhãn điện áp hệ thống khởi động / ắc quy; tách khỏi starting |
| 5 | `alternator.avr` | 998 | 590 | 23 | 549 / 18 | chưa sinh; 'Voltage Regulator', 'AVR', 'AVR type' đang nhận nhầm sang vreg / excit | nhận 'AVR Model', 'Regulator', 'Voltage regulator (type)', 'AVR type', 'AVR', '调压器' |
| 6 | `engine.displacement` | 920 | 82 | 13 | 55 / 4 | đã sinh 2.547 model | thêm 排气量, Hubraum, 'Engine capacity' |
| 7 | `engine.coolant_capacity` | 843 | 200 | 19 | 412 / 9 | đã sinh 149 model; mất nhãn có chữ 'capacity' | sửa chặn `capacity` ở đầu specKeyOf |
| 8 | `genset.made_in` | 769 | 26 | 2 | 13 / 3 | chưa sinh | nhận 'Origin', '产地', 'Place of origin', 'Assembled in' |
| 9 | `genset.ambient` | 701 | 285 | 16 | 659 / 23 | chưa sinh (trùng alternator.altitude) | nhận altitude / operating temperature / ambient |
| 10 | `engine.fuel_system` | 657 | 270 | 23 | 997 / 17 | chưa sinh | nhận 'Fuel System', 'Injection system/type', 'Fuel injection system' |
| 11 | `engine.oil_capacity` | 646 | 246 | 22 | 572 / 17 | đã sinh 1.093 model; mất nhãn có chữ 'capacity' | sửa chặn `capacity` ở đầu specKeyOf |
| 12 | `genset.breaker` | 573 | 368 | 11 | 418 / 13 | chưa sinh | nhận 'Circuit breaker', 'Breaker', 'MCCB' |
| 13 | `genset.genset_type` | 543 | 58 | 13 | 140 / 2 | chưa sinh | nhận 'Genset type', '机组类型', 'Enclosure type'; tiêu đề cột 'Open type / Silent type' cần bộ đọc cấu trúc bảng |
| 14 | `alternator.altitude` | 512 | 171 | 11 | 468 / 14 | chưa sinh (trùng genset.ambient) | nhận 'Altitude (requirement)'; ghi vào ambient của tổ máy hay altitude của đầu phát: cần Khoa |
| 15 | `engine.compression` | 425 | 83 | 12 | 9 / 1 | đã sinh 844 model; thiếu nhãn tiếng Trung | thêm 压缩比 |
| 16 | `alternator.poles` | 369 | 141 | 11 | 610 / 11 | chưa sinh | nhận 'Poles', 'Pole', 'No of poles', 'Pole number' |
| 17 | `engine.engine_type` | 256 | 141 | 12 | 274 / 5 | đã sinh 98 model | thêm 'Cycle', 'Combustion system', 'Combustion chamber' |
| 18 | `alternator.bearing` | 255 | 37 | 6 | 767 / 13 | chưa sinh | nhận 'Bearing', '轴承数', 'Number of bearings' |
| 19 | `genset.series` | 236 | 39 | 10 | 26 / 5 | chưa sinh | nhận 'Series', '系列', 'Serie' |
| 20 | `alternator.type` | 194 | 95 | 13 | 22 / 2 | chưa sinh | nhận 'Alternator type', 'Generator type', '电机类型' |
| 21 | `genset.battery` | 133 | 63 | 14 | 246 / 18 | chưa sinh | nhận 'Battery', 'Battery capacity', 'Battery voltage' (hiện → voltage) |
| 22 | `genset.freq_regulation` | 119 | 32 | 8 | 14 / 7 | đã sinh 150 model | thêm 'Steady state frequency', 'Frequency accuracy' |
| 23 | `alternator.overspeed` | 108 | 86 | 10 | 153 / 11 | chưa sinh | nhận 'Overspeed', 'Maximum overspeed' |
| 24 | `alternator.short_circuit` | 97 | 44 | 5 | 195 / 7 | chưa sinh; '短路电流' đang nhận nhầm sang current | nhận 'Short circuit capacity/ratio', '短路能力', '短路电流' |
| 25 | `alternator.air_flow` | 79 | 79 | 3 | 341 / 11 | chưa sinh | nhận 'Cooling air flow', 'Air flow' |
| 26 | `engine.power_hp` | 72 | 34 | 6 | 11 / 3 | chưa sinh ('cn/ không có số HP') | nhận cột 'CV', 'HP', 'BHP', 'Engine HP' |
| 27 | `alternator.thf` | 55 | 55 | 2 | 53 / 3 | chưa sinh; 'THF' đang nhận nhầm sang thd | nhận 'THF', 'Telephone harmonic factor', '电话谐波系数' |
| 28 | `engine.starting` | 54 | 52 | 6 | 0 / 0 | đã sinh 224 model | thêm 启动方式 / 起动方式 / 启动系统 |
| 29 | `genset.overload` | 52 | 43 | 7 | 47 / 7 | chưa sinh | nhận 'Overload', '过载能力' |
| 30 | `genset.iso8528_class` | 33 | 28 | 2 | 14 / 2 | chưa sinh | nhận 'Performance class' (cẩn thận 'Leistungsklasse' = hạng công suất) |
| 31 | `alternator.tif` | 19 | 19 | 1 | 91 / 5 | chưa sinh | nhận 'Telephone influence factor', 'TIF' |
| 32 | `alternator.thd_no_load` | 11 | 4 | 3 | 92 / 6 | đã sinh 38 model (thd) | thêm 'Waveform distortion', '波形畸变率' |
| 33 | `genset.load_step` | 5 | 1 | 1 | 54 / 2 | chưa sinh | nhận 'One-step load acceptance', 'Load acceptance ability' |
| 34 | `alternator.winding_pitch` | 5 | 3 | 3 | 440 / 10 | chưa sinh | nhận 'Winding pitch' |

Đọc bảng này cẩn thận:
- Hạng 1 («Open type / Silent type») không phải nhãn: là tiêu đề cột chia bảng theo loại vỏ, cần bộ đọc cấu trúc bảng (cột = model, tiêu đề = giá trị `genset_type`), không nhận nhãn được.
- Hạng 2 `alternator.wires` ≈ 2.227 model-ô chủ yếu là MỘT NCC (depco-power `| Wires | 12`, 1.967 ô); lợi ích thật nhỏ hơn số này (14 NCC bảng).
- `engine.genset_power` (hạng 3): nhãn «kWe», «Genset power», «机组功率», «Electrical output» trong bảng ĐỘNG CƠ là công suất điện của tổ máy mà nguồn ghi cho động cơ, đúng định nghĩa trường. Nhãn «Alternator power (kW)» (eastern-lion-fuan, 1.055 ô, đã LOẠI khỏi danh sách duyệt) là công suất đầu phát, không dùng. Cần biết vai bảng (bảng động cơ, không phải bảng tổ máy).
- `engine.electrical_vdc` (hạng 4): hiện «Starting voltage / Starter voltage / Starting system» được `specKey` nhận vào `start` (→ `engine.starting`), giá trị «DC24V» vào cột «Khởi động». Muốn có `electrical_vdc` phải TÁCH khỏi `start`: không thêm được mà không đổi `start`.
- `genset.made_in` (hạng 8) 769 ô nhưng chỉ 2 NCC (mecca-power «Origin» 754 ô); `genset.ambient` / `alternator.altitude` dùng chung nhãn «Altitude», phải quyết gán vào trường nào (cần Khoa). Trong tệp nguồn của comap / deif «Altitude 4000 m» là của BĐK.
- `genset.iso8528_class`: «Leistungsklasse | 20 kVA» (avs-aggregatebau, 130 ô) là HẠNG CÔNG SUẤT, không phải cấp G1–G4: đã loại. Còn lại «Performance class acc. ISO-8528/5» (5 dòng, 1 NCC). Gần như không có dữ liệu.
- `genset.overload`: hầu hết «Overload» của nguồn là bảo vệ quá tải của BĐK (comap, deif), không phải khả năng chịu quá tải của tổ máy. Thật chỉ ~18 ô «过载能力» của hengke-jiangsu.
- `genset.standards` / `alternator.standards`, `alternator.cooling`, `genset.brand`, `genset.series` («Range» chung): KHÔNG nhận theo nhãn trần được, xem mục 2.

## 2. Nhãn → trường (ví dụ nguyên văn) và nhận nhầm

Ví dụ lấy từ `truong-chat.tsv` (cột vi_du_1..3) và `nhan-khong-nhan-bang.tsv`; dạng `NCC #số nguồn hay nN = bảng (kiểu): dòng`.

### 2.1 Nhãn nên nhận (theo trường)

- **engine.coolant_capacity / engine.oil_capacity (ĐÃ có key, mất nhãn «… capacity»)**: «Coolant Capacity», «Cooling System Capacity», «冷却液容量», «Oil Capacity», «Lubricating oil capacity», «Lube oil capacity», «Engine oil capacity», «Oil sump capacity». `specKeyOf` (web/catalog.js, khoảng dòng 250) trả `null` ngay cho mọi nhãn có «capacity» (chặn công suất) nên các nhãn này không bao giờ đến `SPECS`. Đã thử trực tiếp: `specKey('Oil Capacity')`, `('Coolant Capacity')`, `('Total Oil Capacity')`, `('Lubricating oil capacity')`, `('Cooling System Capacity')` đều không nhận; «Fuel Tank Capacity» nhận được vì ngoại lệ có «tank». Ví dụ: acepow-fuan #n102: `| Coolant capacity(L) : | 12 | Excitation system : | Brushless`; genlitec #n1013: `| Cooling System Capacity | l (US gal) | 106 (28)`; aosif #n1093: `| Engine Coolant Capacity | 79 L`; hosem-power #n102: `| Cooling Water Capacity | L | 15.9` (843 + 646 model-ô, xep-hang.tsv).
- **engine.compression**: «压缩比». regex chỉ có «compression»: `specKey('压缩比')` → không nhận. cat-tianjin #n2001: `| 压缩比 | 17.25:1 17.25:1`. 425 ô / 12 NCC.
- **engine.displacement**: «排气量», «Hubraum», «Engine capacity», «Cubic capacity». regex có «排量» chưa có «排气量». KHÔNG nhận «Capacity» trơ: acepow-fuan #n102 `| Capacity (kVA): | 15` là công suất.
- **engine.starting**: «启动方式», «起动方式», «启动系统». regex /start/ chỉ tiếng Anh.
- **genset.power_factor**: «功率因素». đánh máy sai (因素 thay 因数).
- **genset.current**: «Current» trơ (95 dòng / 25 NCC), «Rated currency» (gõ sai). regex chỉ «rated current» / «电流»; «Current» trơ vừa tên cột vừa tên dòng; cần xét vai bảng.
- **genset.noise**: «Sound decibel» (646 dòng, 2 NCC). chưa khớp /noise|sound\s*(level|pressure)|db/ vì «decibel»; ví dụ: lees-power.
- **genset.fuel_100**: «Fuel Con.(L/H)» (649 dòng, 3 NCC). regex cần «consum» / «cons.»; «Con.» chưa khớp.
- **genset.weight**: «N.W (kg)» (714 dòng, 4 NCC). chưa khớp /weigh|重量|毛重/.
- **genset.voltage**: «Volrage» (gõ sai, 645 dòng, 1 NCC), «Output voltage», «Voltage output». —.
- **genset.dimensions**: «Length», «Width», «Height» thành ba dòng. cần ghép ba dòng, không nhận được theo nhãn đơn.
- **alternator.poles**: «Poles», «Pole», «Pole number», «No of poles». genpower-turkey #n101 (row:alt): `| Pole | 4 | 4 | …`; koten-power #n1028: `| Poles | 4`; jet-power #n109: `| Pole number | 2 | 2 | 2 | 2`.
- **alternator.bearing**: «Bearing», «轴承数», «No.of bearings», «Number of bearings». huali-shandong #n2014: `| Bearing | 1`; frs-shenyang #n101: `| 励磁方式 | 无刷自励磁 | 轴承数 | 单轴承`; sanq-power #1001: `| • Bearing Number | 1`.
- **alternator.wires**: «Wires», «No of Leads», «Leads», «Number of wires», «Terminals». depco-power #n166: `| Wires | 12 | Ingress protection | IP23`; powerpack #n101: `| No of Leads | | 12/6`; hipower: `• 12 Leads (3-Phase, Non 600V)`.
- **alternator.avr**: «AVR Model», «Voltage regulator (type)», «Regulator», «AVR type». genlitec #n1013: `| AVR Model: | R150`; aosif #n1121: `| Voltage Regulator | type IC`; aosif #n1001: `| Voltage regulator type | AVR`.
- **alternator.overspeed**: «Overspeed», «Maximum overspeed», «Overspeed: rpm». stamford-avk-china #n1001: `| MAXIMUM OVERSPEED | 2250 Rev/Min`; genlitec #n1013: `| Overspeed: rpm | 2250` (comap #n1001 `| Overspeed | 12` là BĐK, không lấy).
- **alternator.air_flow**: «Cooling air flow», «Air flow (m3/s)», «Cooling air». himoinsa-china #n101: `Cooling Air Flow: 0,8 m3/s`; gfe-power #1025: `| Air flow (m3/s) | 0.48`.
- **alternator.short_circuit**: «Short circuit capacity», «Short circuit ratio», «Sustained short circuit», «短路能力». genlitec #n1013: `| Short Circuit Capacity** | % | 300 | 300 | 300 | 300`; aosif #1065: `| Sustained Short Circuit | 7200A` (Short circuit ratio = 1/Xd là hệ số khác dòng duy trì: tách hay gộp cần Khoa).
- **alternator.winding_pitch**: «Winding pitch». gfe-power #n1025: `| Winding pitch | 2/3 | (Winding 6S or | 6)`. Bảng cn 5 ô, nguồn 440 dòng / 10 NCC: chủ yếu ở nguồn, chưa vào bảng.
- **alternator.tif / thf**: «Telephone influence factor (TIF)», «TIF», «THF», «电话谐波系数 THF». xinhengxin-fujian #1002: `| Telephone Influence Factor (TIF) | ＜50`; hyundai-power-products #5001: `| THF | ＜2%`; gfe-power #1008: `| Telephone Interference | THF<2% | TIF<50`.
- **alternator.thd_linear_load**: gần như không có nhãn riêng. chỉ 1 nguồn: «Total Harmonic Distortion THD ( ) on linear load»; không đáng làm riêng.
- **engine.fuel_system**: «Fuel System», «Injection System», «Injection Type», «Fuel injection system». aosif #n1065: `| Fuel System | Max. coolant temerature | 96.1 ℃` (cột «Fuel System» của nhiều bảng chứa mã hãng: `catalog.js` đã cảnh báo; baudouin #n1021: `| Injection System | Direct`).
- **engine.power_hp**: cột «CV», «HP», «BHP», «Engine HP». green-power-generators #n103: `| | kVA | kW | V | GIRI/MIN | L x La x A (mm) | KG | CV`; baudouin #n1021: `| kWm | BHP | kWm | BHP |…`; winco #n1002: `| ENGINE HP | 4.6`. `chuan-hoa-b2` ghi «cn/ hiện không có số ghi HP»: có, ~70 ô / 6 NCC dạng tiêu đề cột.
- **engine.electrical_vdc**: «Engine Electrical System», «Starting voltage», «Starter voltage». powerpack #n101: `| Engine Electrical System | VDC | 24`; aosif #n1001: `| Starting Voltage | DC24V`.
- **genset.breaker**: «Circuit Breaker», «Breaker», «MCCB», «Breaker model». ade-power #n2001: `| Circuit Breaker | 4-Pole`; stone-power #n128: `| MCCB: | ABB,Chint,etc | Genset Type: | Open,Silent,Container,Trailer Type For Optional`.
- **genset.battery**: «Battery», «Battery capacity», «Battery voltage». hyundai-power-products #n5001: `| Battery Capacity | Ah | 60×2`; voltgent #1001: `| Number of batteries | 2`.
- **genset.genset_type**: «机组类型», «Genset type», «Enclosure type», «Unit type». frs-shenyang #n101: `| 机组类型 | 开架式、静音式、拖车式、集装箱式、车载式 | 防护等级 | IP22…`; tecgen-fujian #n107: `| Genset Type | Silent | Prime Output | 68kW / 85kVA`; lees-power #1001: `| Unit type | Prime | 75%` (là mức công suất, không phải loại vỏ: cẩn thận).
- **genset.made_in / series / load_step / ambient**: «Origin», «产地», «Assembled in», «Series», «系列», «One-step load acceptance», «Altitude», «Operating temperature». mecca-power #n101: `| KVA / KW | KVA/KW | Model | Origin | 100% | L`; winco #1002: `| ASSEMBLED IN | USA`; superwatt-power #3001: `Place of Origin : UK`; lees-power #1093: `| One-step load acceptance | 100% of Rating(ALTERNATOR)`; atlas-copco-power #n101: `| Operating temperature (min/max) (2) | ºC | -10/50 …`; gdf-guangzhou #n101: `| 系列Series | | 320系列`.

### 2.2 Nhãn `specKey` đã nhận sang khoá KHÁC (nhận nhầm đã thấy)

Liệt kê bằng `nhan-nham.mjs` (nhãn theo khoá, 40 nhãn đầu mỗi khoá, `nhan-da-nhan.tsv`) và `an-xep2.mjs` (trạng thái `nhan-sang-khoa-khac`). Dòng = số dòng trong bảng cn; mỗi giá trị còn phải qua bộ lọc `ok` của `SPECS` mới thành số liệu, nên «giá trị lọt vào bản chuẩn» ghi riêng khi đã kiểm.

| Nhãn | Hiện nhận sang | Dòng (NCC) | Đáng ra | Lọt vào bản chuẩn? |
|---|---|---|---|---|
| «电话谐波系数 THF» / «Telephone harmonic factor (THF)» | `thd` (→ `alternator.thd_no_load`) | 47 + 8 (2) | `alternator.thf` | **CÓ, đã kiểm**: cả 38 / 38 giá trị `thd_no_load` của bản chuẩn là `＜2%` của shanhua, nguyên dòng nguồn `| 电话谐波系数 THF | ＜2%`. `thd_no_load` hiện KHÔNG chứa THD thật nào; mọi giá trị là THF. (script: đoạn đọc `std-out\alternator-*.json` trường `thd_no_load`) |
| «Wires», «Number of wires», «Leads», «Phase / Wire» | `phase` (→ `genset.phases`) | 675 + 24 + 6 (3) | `alternator.wires` (riêng «Phase/Wire» = pha: đúng) | giá trị «12» không qua bộ lọc `phase` (`/^[13]$|…/`) nên không lọt; nhãn bị chiếm |
| «Voltage regulator», «Voltage regulator type», «调压器», «调压方式» | `vreg` (→ `voltage_regulation`) | 263 + 134 + 9 + 17 (8) | `alternator.avr` | giá trị «type IC», «AVR» không có «%» nên bị loại: nhãn bị chiếm |
| «AVR», «AVR type», «AVR regulation» | `excit` | 75 + 24 + 16 | `alternator.avr` | **chưa kiểm**: bộ lọc `excit` chứa `\bavr\b`, nên «AVR R150» có thể lọt thành kích từ; trong 341 giá trị `excitation` của bản chuẩn không thấy chữ AVR, nên với dữ liệu hiện nay không lọt |
| «短路电流», «过电流» | `current` | 13 + 13 (1) | `alternator.short_circuit` / ngưỡng quá dòng | **chưa kiểm** (số dòng nhỏ, có thể lọt vì giá trị bắt đầu bằng số) |
| «Battery voltage», «Cranking motor voltage», «Auxiliary voltage», «电压波动率(%)», «Voltage, frequency» | `voltage` | 15 + 133 + 50 + 46 + 138 | `genset.battery`, `engine.electrical_vdc`, không thuộc bộ trường (波动率), … | bộ lọc `voltage` đòi ≥ 3 chữ số đầu: «24» không lọt; «电压波动率» có thể lọt, chưa kiểm |
| «Starting voltage», «Starter voltage», «Starting system», «Starter motor» | `start` (→ `engine.starting`) | 166 + 75 + 209 + 111 | `engine.electrical_vdc` (V) và `starting` (loại) | đang lọt: «DC24V» nằm ở cột Khởi động |
| «Governing Class» | `gov` | 28 (2) | `genset.iso8528_class` | giá trị «ISO 8528» không qua bộ lọc `gov`: không lọt |
| «Amps per phase» | `phase` | 312 (1) | `genset.current` (kiểu khác) | bị loại (giá trị là số lớn) |
| «Lub oil heater», «Heat rejected to water & lube oil», «Lube oil change period» | `oil` | 134 + 24 + 16 | không thuộc trường | **chưa kiểm**: bộ lọc `oil` chỉ đòi số đầu (`N`) nên «2 kW», «250 hrs» có thể lọt thành dung tích dầu |
| «Maximum allowable intake», «Intake air alarm temperature», «Intake air flow», «进气阻力», «Max. combustion air intake restriction» | `asp` | 84 + 60 + 50 + 17 + 24 | `engine.air_*` không có trường | giá trị số không qua bộ lọc chữ (turbo / natural…): không lọt |
| «Max allowable resistance of starting circuit», «Motor starting capability» (đầu phát), «Start delay», «DEEPSEA 6120 Auto start & auto mains» | `start` | 60 + 37 + 13 + 128 | không thuộc trường | **chưa kiểm** |
| «Short circuit protection», «Generator protection», «Environmental protection agency … to conform to» | `ip` | 16 + 173 + 18 | không phải IP | bộ lọc `ip\s?\d` chặn; chưa kiểm |
| «Beautiful and anti-rust, and can further reduce the noise» (câu quảng cáo) | `noise` | 133 (1) | — | chưa kiểm |

Bẫy đã ghi sẵn trong `suppliers/CLAUDE.md`: «Number of wires» → `phase`, «AVR type», «Cylinder Configuration: Line» nhận nhãn nhưng bỏ giá trị. Phát hiện mới trong bước này: THF → THD (lọt thật), «capacity» chặn oil / coolant, «Starting voltage» chiếm bởi `start`.

## 3. Nhãn phổ biến mà `specKey` KHÔNG nhận

`nhan-khong-nhan.mjs` → `nhan-khong-nhan-bang.tsv` (12.925 nhãn khác nhau chưa nhận, từ bảng cn) và `nhan-khong-nhan-nguon.tsv` (13.241, từ nguồn); loại nhãn là mã model (`isCode`) và nhãn mà `specKey` nhận sau khi bỏ ngoặc. `de-xuat-300.mjs` xếp **300 nhãn đầu** theo số NCC dùng (≥ 3 NCC có 482 nhãn), rồi số dòng, kèm đề xuất → `de-xuat-300.tsv` (đủ 300 dòng, cột «loai», «de_xuat», 2 ví dụ). Phân loại 300 nhãn:

| Loại | Số nhãn | Số dòng | Ý nghĩa |
|---|---|---|---|
| MA | 17 | 13.527 | mã model (đọc bằng `headerRows` / `isCode`, không qua specKey) |
| CONG-SUAT | 49 | 22.061 | công suất (đọc bằng `powersIn`, bảng `power`) |
| TAN-SO | 10 | 4.231 | tần số (`freqIn`, trường `genset.frequency` không có key) |
| TIEU-DE-CUM | 8 | 3.641 | tiêu đề cụm (Engine | Alternator) |
| NHIEU | 24 | 1.877 | chữ nhiễu / nhãn quá chung |
| FIELD | 30 | 3.472 | thuộc một trường của bộ (đề xuất ở cột de_xuat) |
| THUONG-HIEU | 8 | 2.119 | hãng (`brand` của động cơ / tổ máy theo vai bảng) |
| GIA-TRI | 132 | 12.216 | giá trị lọt vào cột nhãn (tên hãng, «400KW», «6L», «Open type») |
| BDK | 19 | 1.557 | nhãn của tờ bộ điều khiển (mục 5) |
| KHONG-TRUONG | 3 | 489 | nhãn thật không có trong bộ trường |

**Kết luận: trong 300 nhãn phổ biến nhất, chỉ 30 nhãn thuộc một trường của bộ nhưng chưa được nhận** (bảng 2.1); 132 là giá trị lọt vào cột nhãn, 49 là công suất, 17 là mã model. Phần việc thật của bước 4 nằm ở các nhãn ÍT phổ biến (1–2 NCC) của mục 1, không ở 300 nhãn đầu. Cần Khoa xem riêng: «Connection / Connection type / 接线方式» (kiểu nối sao–tam giác, 443 + 58 dòng) và «Type» trơ (35 NCC): không biết loại gì.

### 3.1 Nhãn phổ biến KHÔNG có trường trong bộ (không đề xuất thêm trường; để Khoa xem)

Đếm trên toàn kho nhãn (`nhan-khong-co-truong.mjs`):

| Nhóm nhãn | Dòng bảng | NCC bảng | Dòng nguồn | NCC nguồn | Nhãn thường gặp |
|---|---|---|---|---|---|
| moment of inertia / inertia | 16 | 4 | 82 | 9 | moment of inertia(70); inertia of flywheel(5); inertia of crankshaft(5); inertia(4) |
| temperature rise | 68 | 12 | 618 | 14 | temp rise(138); temperature rise and motor starting(138); lnsulation class , temperature rise(109); class - temp rise(91) |
| coupling | 2 | 2 | 361 | 6 | coupling(363) |
| exhaust gas flow / temperature | 213 | 27 | 478 | 20 | exhaust gas flow(170); exhaust temperature(129); 排气量(44); exhaust gas flow prime(36) |
| exhaust system / back pressure | 37 | 4 | 771 | 13 | max back pressure(319); exhaust system(168); exhaust system(ripple flex exhaust pipe,(165); max. allowable back pressure(80) |
| oil consumption | 122 | 21 | 260 | 10 | oil consumption(187); lube oil consumption at full(64); lube oil consumption(36); 机油消耗率 oil consumption(27) |
| heat rejection / radiated heat | 56 | 4 | 59 | 4 | heat radiation to room prime(36); heat radiation to room standby(36); heat rejection to coolant ht(11); radiated heat to ambiant(10) |
| combustion air / intake air flow | 350 | 9 | 336 | 12 | engine air flow(298); intake air alarm temperature(123); intake air flow(112); combustion air flow prime(36) |
| flywheel / SAE housing | 41 | 14 | 113 | 11 | sae adaptor(30); flywheel teeth(14); flywheel and housing(13); flywheel(12) |
| torque | 11 | 5 | 19 | 3 | 扭矩 torque(17); max torque(6); peak torque(4); torque /speed(2) |
| mean piston speed | 167 | 8 | 159 | 6 | piston speed(253); mean piston speed(39); 活塞速度 piston speed(34) |
| bmep | 73 | 6 | 50 | 5 | 平均有效压力(39); bmep prime(36); bmep standby(36); bmep @ esp(5) |
| warranty | 318 | 4 | 55 | 11 | warranty(361); warranty period(2); service/ warranty(2); best-in-class standard warranty(1) |
| connection (star/delta) | 528 | 16 | 190 | 8 | connection type(481); winding connection(134); 接线方式(58); connection(41) |
| waveform / voltage distortion (thd) | 39 | 8 | 273 | 11 | waveform distortion(94); total harmonic distortion thd(32); waveform nema = tif(23); waveform distors. full load ll/ln(20) |
| efficiency alt | 386 | 17 | 201 | 7 | efficiency(534); generator efficiency(28); 效率(21); alternator efficiency(4) |
| rotor / stator type | 175 | 8 | 1.046 | 9 | weight wound stator(164); weight wound rotor(164); stator winding(95); xl stator leakage reactance(86) |
| rated speed alt | 1.325 | 71 | 215 | 25 | speed(1077); 转速(239); rpm(224) |
| fuel tank autonomy duration | 0 | 0 | 12 | 1 | fuel autonomy at full load(4); discharge autonomy 100% / 75% rated power(4); discharge autonomy 50% / 25% rated power(4) |
| engine weight | 554 | 18 | 244 | 10 | dry weight(524); 净重 engine weight,dry(77); engine weight dry(36); engine weight wet(36) |
| thermal efficiency / electrical efficiency | 278 | 8 | 78 | 2 | thermal efficiency(130); electrical efficiency(68); electrical efficiency3)(21); thermal efficiency3)(21) |
| lubrication system / oil pressure | 398 | 20 | 949 | 26 | lubrication system(359); oil pressure(297); total lubrication system(140); total lubrication system capacity(139) |
| firing order | 7 | 3 | 4 | 3 | firing order(10); 发火顺序(1) |
| rotation / direction | 177 | 11 | 209 | 11 | rated rotation speed(310); rotation(27); rotation from flywheel end(11); ● direction of rotation(11) |

Nổi bật: rated speed của đầu phát (đã có `speed` của động cơ), hiệu suất đầu phát (`eff` có key, nhưng bộ trường không có trường `efficiency`: 386 dòng, 17 NCC), áp suất / lưu lượng khí xả, tiêu hao dầu, trọng lượng khô động cơ, nhiệt toả, bảo hành (318 dòng, 4 NCC), «connection» (kiểu nối). Không tính nhãn nào là «sai»; chỉ liệt kê.

## 4. Enum chưa chuẩn (aspiration, governor, insulation, excitation)

Nguồn: `enum-cach-viet.mjs` đọc bản chuẩn sinh lại → `enum-cach-viet.tsv` (mọi cách viết, số lần = số giá trị trong bản chuẩn, số model, số NCC); `enum-de-xuat.mjs` → `enum-de-xuat.tsv` (từng cách viết → đề xuất + lý do). Tổng khớp b2: aspiration 695 (ngoài danh sách 522), governor 1.696 (531), insulation 503 (79 ở b2; ở đây tính theo từng giá trị), excitation 341 (205).

| Trường | Tổng giá trị | Đã khớp `values`/`same` | Đề xuất quy được (cùng nghĩa rõ ràng) | Cần Khoa xem |
|---|---|---|---|---|
| `engine.aspiration` | 695 | 173 | 473 (turbo 308, turbo_aftercooled 128, natural 37) | 49 |
| `engine.governor` | 1.696 | 1.165 | 458 (electronic 355, mechanical 90, ecu 13) | 73 |
| `alternator.insulation` | 503 | 271 | 212 (H 211, F 1) | 20 |
| `alternator.excitation` | 341 | 136 | 4 (shunt 4) | 201 |

Ghi chú: `genset.fuel` (660 giá trị) chỉ có gas / gasoline / dual, không có «diesel» (nguồn không ghi chữ diesel ở chỗ đó); `engine.cyl_layout` (1.496 giá trị: «6L», «12V», «6 in line», «12缸V型») ĐÃ ra `inline` / `V` trong bản chuẩn (suy từ `cond.layout`) nên không có mặt trong 1.337 giá trị ngoài danh sách; `genset.iso8528_class` và `controller.kind` chưa sinh nên không có số.

### 4.1 `engine.aspiration` (63 cách viết)
Đề xuất thêm vào `same` của `spec-fields.json` (cùng nghĩa rõ ràng):
- **turbo** (tăng áp, không ghi làm mát khí nạp): «Turbo-charged» 135, «Turbocharged» 42, «Turbo charged» 38, «涡轮增压» 67, «涡轮增压 Turbo» 9, «Turbo» (đã có), «TURBOCHARGED» 3, «增压» 4, «Turbocharging» 1, «turbo charger» 1, «涡轮增压Turbocharged» 5; kèm «Turbocharged&No-Intercooling» 2 (ghi rõ không làm mát).
- **turbo_aftercooled** (tăng áp + làm mát khí nạp; đã có `same` cho «Turbocharged, Intercooled» nên «Intercooler / aftercooler / air-to-air / charge air cooled / LTA» cùng nghĩa): «增压中冷» 32, «Turbocharging and intercooling» 22, «Turbo /Inter cooling» 14, «Turbocharged & Air-to-air» 11, «Turbo Charger & Inter Cooler» 11, «Turbo charged, air to air cooled» 4, «Turbo, Water/Air cooling» 4, «Turbocharged and air-to-air charge cooled» 3, «Turbo, Air/Air Cooling» 6, «Turbo-charged , After cooler» 3, «Turbocharged & Charge Air Cooled» 2, «LTA» 2, «Turbocharged , LTA» 1, «Turbo, charge air cooled» 1, … (đủ trong TSV).
- **natural**: «Naturally Aspirated» 11, «自然吸气» 11 (+«自然吸气 Natural» 1), «Naturally» 6, «Naturally aspirated» 4, «Air natural aspirated» 2, «Natural intake» 2.
- **Cần Khoa xem (49 giá trị)**: chuỗi bị CẮT ở ô: «Turbocharged and» 25, «Turbo,» 9, «Turbocharged and Air» 2, «Turbocharged &» 2, «Turbocharged ,» 2 (mất chữ «Aftercooled» của ô sau: lỗi đọc ô bị tách, không đoán turbo hay turbo_aftercooled); «Aftercooled» 4 (không ghi tăng áp); «Supercharged non-intercooled» 1 (supercharged ≠ turbo?); «Natural Turbocharged & Aftercooled» 1 (ghi cả hai); ô dính nhiều thông số «water-cooled,4 valves, Turbo charged» 3, «In-line,4strokes,4valves,water-cooled,Turbo charged with aftercooler» 1.

### 4.2 `engine.governor` (51 cách viết)
- **electronic**: «Electric» 68, «Electronic control» 102, «EFC Electrical» 45, «电子调速E» 36, «Electronic speed» 30, «Electronic speed controller» 26, «FORTRUST Electronic» 25, «电子» 6, «GAC Electrical» 4, «Electroni speed» 2, «electric» 2, «Electronic governing» 1, «Quantum Electronic» 1, … (Electric = Electrical, vốn đã có trong `same`).
- **mechanical**: «Mechanic» 45, «Mechanically» 21, «机械调速M» 10, «机械调» 6, «Mmechanical / mechanical speed governors» 6.
- **ecu**: «EMS2 / ECU» 13.
- **Cần Khoa xem (73 giá trị)**: mô tả hệ thống phun lọt vào cột điều tốc (không phải điều tốc): «Electronically Controlled Common Rail System» 16, «Electric Unit Pump System» 8, «Electronically-control high pressure common» 3, «Electronic unit pump» 1, «Electronically controlled unit pump» 1; ghi cả hai: «Electronic/M» 26, «Mechanical/ Electrical» 7+4, «Electronic/mechanical» 1, «Electric/Mechanical» 1; «Electronic ECM» / «ECM Electronic» 2 (vừa electronic vừa ECM); «G-Drive Governor» 1, «BYC P7100/Electronic» 1 (P7100 là bơm cơ khí).

### 4.3 `alternator.insulation` (14 cách viết, nhiều dòng nguồn dính)
- **H**: «H/H» 47 (nhãn «Insulation class/temperature rise class»), «Class H» 3, «H class» 7, «| Insulation class | H» 61 + 30 + 22 + 12 + 18 + 7 + 3 (ô dính nguyên dòng bảng, kể cả «| Insulation class | H | Excitation system 6 wire»: LỖI ĐỌC gộp ô, giá trị lấy theo chữ cạnh nhãn). **F**: «Class F» 1.
- **Cần Khoa xem (20)**: «H /IP22 or F/IP21» 20 (tổ hợp cách điện + IP, hai lựa chọn).
- Nên sửa gốc ở bộ đọc ô dính (cùng loại với 90 giá trị excitation «Single bearing, Brushless,»): giá trị «dòng bảng nguyên dòng» không bao giờ là chữ nguồn đúng.

### 4.4 `alternator.excitation` (16 cách viết)
- **shunt** (4): «Brushless, shunt-excited» 4.
- **Cần Khoa quyết (201 giá trị)**: «Brushless, self-excitation» 46, «brushless self-exciting» 20, «Brush less,self-exciting» 15, «无刷自励磁» 13, «Self-excited» 8, «Brushless, self-excited» 2 … Đây là KIỂU (không chổi than, tự kích), KHÔNG phải một trong shunt / arep / pmg / aux_winding; gán shunt sẽ sai (tự kích gồm shunt và AREP). Hoặc thêm giá trị `self_excited`, hoặc để `missing: enum`: Khoa quyết. «Single bearing, Brushless,» 90 là ô dính «bearing» (nên là `alternator.bearing`), cùng bẫy ô dính ở mục 4.3.

## 5. Bộ điều khiển: 46 trường chưa sinh

### 5.1 Kho và cách đếm
`bdk-cum-chu.mjs` (`node bdk-cum-chu.mjs`): 241 tài liệu = **DSE 136** (136 PDF datasheet / manual trong `genbid-work\dse-datasheets`, `pdftotext -layout`), **DSE-web 39** (`sources/deep-sea-electronics/1xxx,6xxx`), **ComAp 23** (1 PDF + `sources/comap`, `comappower`), **SmartGen 22** (8 PDF + 14 nguồn), **DEIF 6**, **SICES 6**, **Datakom 5**, **Woodward 4**. Số trong bảng = số tài liệu có cụm chữ (khớp một regex tiếng Anh theo cụm chữ manual thật). KHÔNG phải số model có chức năng, vì:
- tờ DSE hai cột bị `pdftotext -layout` trộn dòng (dse123: «allows synchronising of control synchronising and loadsharing DSE7510 or DSE8610, the LED will Industrial Environment»): cụm chữ thấy được nhưng không biết thuộc cột nào / model nào; nên đọc lại bằng `pdftotext` không `-layout` hoặc theo cột;
- mục lục («4.3 AUTO START/STOP OPERATION …… 8»), nhật ký sửa đổi («Added UL certification parameters»), tên công ty («DEEP SEA ELECTRONICS PLC»: lần đầu khớp «plc» của 171 / 241 tài liệu, sau khi sửa `(?<!electronics )\bplc\b` còn 12), ô «Optional» / «not supported» đều là cụm chữ chưa phải khả năng. Em đã loại «timer» khỏi `scheduler`, tên công ty khỏi `plc`, «ul» trơ khỏi `ul`;
- tờ SmartGen `HGM9510N_HGM9530N` / `HGM7110N_HGM7120N` / `HGM410_HGM420` là tờ NHIỀU model: một tài liệu = 2–3 model, và nhiều chức năng khác nhau giữa các model của cùng tờ.

### 5.2 Bảng cụm chữ → trường (số tài liệu có cụm / tổng tài liệu của hãng)

| Trường | Kiểu | DSE | SICES | SmartGen | ComAp | DEIF | Datakom | Woodward | DSE-web | Tổng | Đọc được bằng | Ghi chú |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `order_code` | text | 129/136 | 1/6 | 1/22 | 21/23 | 2/6 | 0/5 | 2/4 | 35/39 | 191 | bảng cấu trúc | DSE: «PART NO'S» dạng bảng 2 cột (RELATED MATERIALS PART NO'S); ComAp: «Order code: IL4AMF25BAA» (từ khoá dùng được) |
| `kind` | enum | 125/136 | 5/6 | 22/22 | 19/23 | 6/6 | 4/5 | 3/4 | 33/39 | 217 | từ khoá + bảng | kind = tổ hợp nhiều khả năng (AMF + sync + bus tie…); suy từ tên dòng máy («DSE8660 MKII Synchronising & Load Sharing Auto Start Control Module») chắc hơn quét chữ |
| `auto_start_stop` | bool | 99/136 | 5/6 | 22/22 | 0/23 | 2/6 | 2/5 | 0/4 | 27/39 | 157 | từ khoá | «Auto Start»: có cả ở tên tờ lẫn mục lục; tên tờ DSE ghi rõ loại |
| `mains_failure` | bool | 79/136 | 5/6 | 22/22 | 6/23 | 5/6 | 4/5 | 1/4 | 22/39 | 144 | từ khoá | AMF / mains failure; cẩn thận «loss of mains» (ROCOF) khác mất lưới AMF |
| `remote_start` | bool | 42/136 | 5/6 | 22/22 | 2/23 | 1/6 | 5/5 | 0/4 | 9/39 | 86 | từ khoá | «Remote start on load» / «remote start»; DSE có cả «start on remote» trong mô tả đầu vào |
| `scheduler` | bool | 39/136 | 5/6 | 19/22 | 7/23 | 0/6 | 2/5 | 1/4 | 6/39 | 79 | từ khoá | «scheduler», «exerciser», «weekly»; bỏ «timer» (hẹn giờ trễ khởi động khác) |
| `prot_earth_fault` | bool | 31/136 | 4/6 | 12/22 | 13/23 | 2/6 | 0/5 | 1/4 | 9/39 | 72 | từ khoá | «Earth fault protection», «ground fault» |
| `prot_reverse_power` | bool | 18/136 | 1/6 | 16/22 | 15/23 | 4/6 | 2/5 | 1/4 | 3/39 | 60 | từ khoá | ComAp: «Reverse power | 32R» / «Reverse Power 32R Underfrequency»; SmartGen «reverse power» |
| `prot_overcurrent` | bool | 12/136 | 5/6 | 22/22 | 17/23 | 4/6 | 2/5 | 1/4 | 2/39 | 65 | từ khoá | «over current / IDMT / short circuit»: «short circuit» có thể là bảo vệ ngắn mạch đầu phát |
| `prot_mains_decoupling` | bool | 31/136 | 4/6 | 7/22 | 11/23 | 3/6 | 0/5 | 2/4 | 9/39 | 67 | từ khoá | ROCOF / vector shift: ComAp `| ROCOF | 81R`; DSE5510 «ROCOF & vector shift»; SmartGen HGM9510N «Mains ROCOF» |
| `emergency_stop` | bool | 36/136 | 4/6 | 22/22 | 12/23 | 4/6 | 3/5 | 1/4 | 13/39 | 95 | từ khoá | «emergency stop»: gần như mọi manual; ít phân biệt model |
| `ecu_support` | bool | 51/136 | 5/6 | 17/22 | 17/23 | 5/6 | 4/5 | 2/4 | 16/39 | 117 | từ khoá | J1939 / ECU / ECM; DSE dùng «Electronic engine capability» |
| `protections` | text | 125/136 | 5/6 | 22/22 | 19/23 | 6/6 | 5/5 | 3/4 | 37/39 | 222 | bảng cấu trúc | «Protection / alarm / shutdown» có ở gần như mọi tờ: danh mục chi tiết cần bảng (DSE chỉ có trong Operator Manual đăng nhập) |
| `display` | text | 119/136 | 6/6 | 22/22 | 19/23 | 5/6 | 4/5 | 3/4 | 36/39 | 214 | từ khoá (kiểu) + số | «132x64 LCD», «Graphical Colour Display», «Large graphic monochromatic LCD»: đọc được chữ kiểu; kích thước là số |
| `measure_voltage` | text | 88/136 | 5/6 | 22/22 | 19/23 | 5/6 | 3/5 | 1/4 | 23/39 | 166 | bảng cấu trúc | «AC voltage Input: AC15V - AC360V (ph-N)» (SmartGen), «Voltage Measurement ±1% Full Scale Phase to Neutral» (DSE): dải nằm trong bảng thông số; từ khoá «voltage measurement» chỉ báo có |
| `measure_frequency` | text | 128/136 | 1/6 | 4/22 | 18/23 | 2/6 | 1/5 | 1/4 | 35/39 | 190 | bảng cấu trúc | dải ghi trong bảng thông số («3.5 Hz to 75 Hz») |
| `measure_current` | text | 28/136 | 5/6 | 22/22 | 18/23 | 4/6 | 2/5 | 1/4 | 15/39 | 95 | bảng cấu trúc | «CT Secondary Current Rated 5A» (SmartGen) |
| `accuracy` | text | 28/136 | 5/6 | 4/22 | 18/23 | 4/6 | 3/5 | 3/4 | 17/39 | 82 | bảng cấu trúc | «±1 % of full scale»: nhiều giá trị theo đại lượng |
| `usb` | bool | 89/136 | 5/6 | 21/22 | 17/23 | 4/6 | 2/5 | 3/4 | 28/39 | 169 | từ khoá | «USB» |
| `rs232` | bool | 52/136 | 5/6 | 5/22 | 19/23 | 1/6 | 2/5 | 1/4 | 10/39 | 95 | từ khoá | «RS232» / «RS-232» |
| `rs485` | bool | 63/136 | 5/6 | 20/22 | 19/23 | 4/6 | 1/5 | 1/4 | 19/39 | 132 | từ khoá | «RS485» |
| `ethernet` | bool | 54/136 | 5/6 | 11/22 | 17/23 | 3/6 | 0/5 | 3/4 | 21/39 | 114 | từ khoá | «Ethernet» / «RJ45» |
| `can` | bool | 41/136 | 5/6 | 15/22 | 11/23 | 5/6 | 4/5 | 3/4 | 14/39 | 98 | từ khoá | «CAN port», «J1939 / CANBUS»; gộp với ecu_support nếu không tách |
| `modbus_rtu` | bool | 42/136 | 5/6 | 2/22 | 11/23 | 3/6 | 0/5 | 1/4 | 13/39 | 77 | từ khoá | «Modbus RTU»; nhiều tờ ghi «Modbus» trơ |
| `modbus_tcp` | bool | 17/136 | 4/6 | 0/22 | 5/23 | 2/6 | 0/5 | 1/4 | 11/39 | 40 | từ khoá | «Modbus TCP» (ComAp: «Support of Modbus RTU/TCP, SNMP v1/v2c/v3»: một câu cho ba trường) |
| `snmp` | bool | 16/136 | 3/6 | 0/22 | 9/23 | 0/6 | 0/5 | 0/4 | 9/39 | 37 | từ khoá | DSE7410/7420 MKII: «SNMP functionality» |
| `remote_monitoring` | bool | 74/136 | 5/6 | 22/22 | 13/23 | 5/6 | 5/5 | 3/4 | 25/39 | 152 | từ khoá | DSEWebNet, SCADA, «cloud», GPRS |
| `cellular_sms` | bool | 41/136 | 5/6 | 12/22 | 16/23 | 3/6 | 3/5 | 1/4 | 7/39 | 88 | từ khoá | GSM / 3G / 4G / SMS / modem |
| `event_log` | text | 63/136 | 5/6 | 19/22 | 8/23 | 4/6 | 2/5 | 2/4 | 10/39 | 113 | từ khoá + số | DSE «Event log (15)» (số trong ngoặc), ComAp «history log with up to 100 records»: có mẫu số liệu |
| `data_logging` | bool | 50/136 | 3/6 | 0/22 | 8/23 | 2/6 | 2/5 | 1/4 | 18/39 | 84 | từ khoá | «data logging», «trend» |
| `plc` | bool | 7/136 | 0/6 | 1/22 | 1/23 | 0/6 | 2/5 | 0/4 | 1/39 | 12 | từ khoá | «PLC»: nhớ loại tên công ty DSE; SmartGen «PLC function»; ComAp «integrated PLC logic» |
| `synchronising` | bool | 52/136 | 5/6 | 9/22 | 11/23 | 5/6 | 2/5 | 3/4 | 25/39 | 112 | từ khoá | «synchronising / synchronizing / paralleling» |
| `load_sharing` | bool | 46/136 | 4/6 | 9/22 | 6/23 | 3/6 | 1/5 | 2/4 | 20/39 | 91 | từ khoá | «load sharing / droop» |
| `load_demand` | bool | 32/136 | 2/6 | 9/22 | 11/23 | 5/6 | 2/5 | 2/4 | 7/39 | 70 | từ khoá | «load demand / load dependent / load shedding»; «load control» của SmartGen KHÔNG tính |
| `dead_bus` | bool | 18/136 | 2/6 | 6/22 | 0/23 | 0/6 | 0/5 | 2/4 | 5/39 | 33 | từ khoá | «dead bus sensing» (DSE5510); SmartGen «Dead Bus Volt» |
| `max_sets` | number | 9/136 | 4/6 | 0/22 | 5/23 | 3/6 | 0/5 | 2/4 | 2/39 | 25 | từ khoá + số | «Link up to 16 generators» (DSE5510), «Parallel operation up to 32 gen-sets» (ComAp 1004/1005): có mẫu số |
| `governor_avr_control` | text | 55/136 | 4/6 | 22/22 | 11/23 | 4/6 | 3/5 | 1/4 | 24/39 | 124 | từ khoá + bảng | «governor / AVR / speed bias»: tên gọi, kiểu điều khiển (analog / CAN) cần bảng |
| `languages` | text | 55/136 | 3/6 | 22/22 | 7/23 | 5/6 | 2/5 | 2/4 | 17/39 | 113 | từ khoá | «Up to 5 languages in one configuration», «Two languages»: số ngôn ngữ ghi trong câu; danh sách ngôn ngữ cần bảng |
| `dc_supply` | text | 136/136 | 5/6 | 22/22 | 21/23 | 5/6 | 3/5 | 2/4 | 36/39 | 230 | bảng cấu trúc | «DC(8~35)V» (SmartGen), mục «DC SUPPLY» của DSE: đọc khoảng «a ~ b V» từ bảng thông số; từ khoá chỉ có mục lục |
| `front_ip` | text | 109/136 | 5/6 | 22/22 | 11/23 | 4/6 | 3/5 | 3/4 | 25/39 | 182 | từ khoá + số | «IP65 - Front of module…» (DSE), «Protection degree (front IP50, IP65 with gasket)» (ComAp) |
| `operating_temp` | text | 100/136 | 5/6 | 15/22 | 17/23 | 4/6 | 2/5 | 0/4 | 35/39 | 178 | bảng cấu trúc | «Operating temperature» + dải trong bảng |
| `dimensions` | text | 136/136 | 6/6 | 22/22 | 18/23 | 4/6 | 3/5 | 2/4 | 35/39 | 226 | bảng cấu trúc | mục «DIMENSIONS» (DSE) / «OVERALL DIMENSION» (SmartGen): kích thước nằm dưới mục; ComAp «Cut-out: 118 × 92 mm» |
| `io` | table | 108/136 | 5/6 | 22/22 | 18/23 | 4/6 | 3/5 | 2/4 | 31/39 | 193 | bảng cấu trúc | bảng «inputs / outputs» (DSE2131: «Number Negative Switching Digital Input…»); số ngõ khác nhau theo model |
| `ul` | bool | 16/136 | 1/6 | 2/22 | 3/23 | 5/6 | 2/5 | 2/4 | 13/39 | 44 | từ khoá | «UL Listed: Standard - UL 6200:2019» (DSE2131); ComAp bảng «UL | 6200» |

### 5.3 Trường nào đọc bằng từ khoá, trường nào cần bảng cấu trúc
- **Từ khoá được (27 trường bool)**: auto_start_stop, mains_failure, remote_start, scheduler, prot_earth_fault, prot_reverse_power, prot_overcurrent, prot_mains_decoupling, emergency_stop, ecu_support, usb, rs232, rs485, ethernet, can, modbus_rtu, modbus_tcp, snmp, remote_monitoring, cellular_sms, data_logging, plc, synchronising, load_sharing, load_demand, dead_bus, ul. Điều kiện để đáng tin: (a) văn bản theo TỪNG model (DSE: mỗi tệp là một model; SmartGen / ComAp tờ nhiều model cần tách), (b) chỉ tính câu mô tả khả năng (bỏ mục lục, nhật ký sửa đổi, tên công ty), (c) ghi bool CÓ chỉ khi chữ khẳng định; không thấy chữ ≠ «không có» (`missing`).
- **Cần bảng cấu trúc**: kind (suy từ tên dòng máy + khả năng), protections (danh mục), measure_voltage / frequency / current, accuracy, dc_supply, operating_temp, dimensions, io (số ngõ), languages (danh sách), governor_avr_control, order_code (bảng «Ordering information»), display (kiểu từ chữ, kích thước từ số), event_log và max_sets (số trong câu: «Event log (15)», «up to 16 generators»: có mẫu số nên đọc bằng regex số), front_ip (mã IP trong câu).
- **Không cần chữ**: `brand_country`, `made_in` (đã sinh theo hồ sơ hãng cho 209 model theo b2), `brand`, `model`.
- **Rủi ro lớn nhất**: DSE chỉ có «danh mục bảo vệ chi tiết» trong Operator Manual phải đăng nhập (đã ghi ở `suppliers/CLAUDE.md` bẫy Deep Sea): `protections` / `prot_*` của DSE chỉ đọc được ở mức câu quảng cáo của datasheet. Kho `genbid-work\dse-datasheets\manuals` có thư mục `manuals` (chưa mở trong lần kiểm kê này: chưa kiểm).

## 6. Đề xuất chia PR (mỗi PR một nhóm trường)

Mọi PR đổi `web/catalog.js` / `web/spec-norm.js` phải chạy `node suppliers/quality.mjs --check` và `spec-diff.mjs` (CI `spec-diff.yml`), và thêm ca test lấy dòng thật vào `web/test/spec-norm.test.mjs` hoặc test riêng; PR đổi `suppliers/spec-fields.json` (thêm `key`, `same`) cần Khoa duyệt trường (CLAUDE.md: «Thêm / đổi trường phải do Khoa duyệt»; thêm `key` cho trường đã duyệt thì em coi là không thêm trường, nhưng nên hỏi).

| PR | Nhóm trường | Nội dung | Tệp sẽ sửa | Lợi ích (model-ô) | Rủi ro |
|---|---|---|---|---|---|
| **A** | engine: oil_capacity, coolant_capacity, compression, displacement, starting (key ĐÃ có) | bỏ chặn «capacity» cho nhãn oil / coolant / lube / water; thêm 压缩比, 排气量 / Hubraum, 启动方式 / 起动方式 | `web/catalog.js` (đầu `specKeyOf`, regex `oil` / `coolant` / `compr` / `disp` / `start`), `web/test/spec-norm.test.mjs` (hoặc test mới), `suppliers/quality-baseline` nếu số đổi | ≈ 843 + 646 + 425 + 920 + 54 | thấp–vừa: nhãn «capacity» trơ (116 ô «Capacity» 2 NCC) có thể là dung tích hoặc công suất, giữ loại; kiểm số lọt bằng `spec-diff` |
| **B** | enum: aspiration, governor, insulation | thêm `same` ở `spec-fields.json` theo `enum-de-xuat.tsv` (chỉ dòng «cùng nghĩa rõ ràng»); bộ đọc ô dính («| Insulation class | H») | `suppliers/spec-fields.json` (`same`), `suppliers/spec-standard.mjs` (`enumOf`: bỏ tiền tố «| nhãn |», «H class», «Class H»), `suppliers/spec-standard-sua.test.mjs` hoặc test mới | giảm ≈ 473 / 458 / 212 giá trị «chưa chuẩn» | thấp; «Cần Khoa xem» để nguyên `missing: enum` |
| **C** | alternator: poles, bearing, wires, avr, overspeed, air_flow, short_circuit, winding_pitch, tif, thf | thêm nhãn vào `SPECS` (trường mới có key), tách nhãn đang nhận nhầm (Wires → phase, AVR → vreg / excit, THF → thd, 短路电流 → current) | `web/catalog.js` (`SPECS` + `not` của `phase`, `vreg`, `excit`, `thd`, `current`), `web/spec-norm.js` (bộ đọc số: poles, bearing, wires, overspeed, air_flow), `suppliers/spec-fields.json` (thêm `key`), `suppliers/spec-standard.mjs` (tự theo `byKey`), test | ≈ 2.227 + 998 + 369 + 255 + 108 + 79 + 97 + (tif / thf / winding_pitch chủ yếu ở nguồn) | vừa: ô dính, nhiều NCC chỉ 1 nguồn; **sửa ngay THF → thd** vì bản chuẩn hiện đang chứa THF như THD |
| **D** | engine: fuel_system, electrical_vdc, power_hp, genset_power, engine_type | nhận nhãn mới; tách `electrical_vdc` khỏi `start`; HP / CV / BHP là cột tiêu đề; `genset_power` chỉ trong bảng động cơ | `web/catalog.js` (`SPECS`; `start`), `web/spec-norm.js` (đọc HP, kWe), `suppliers/spec-fields.json`, `suppliers/spec-standard.mjs` (`power_hp`, `genset_power` là bảng), test | ≈ 1.523 + 1.103 + 657 + 72 + 256 | vừa–cao: `genset_power` cần vai bảng (loại «Alternator power»); `Fuel System` có mã hãng |
| **E** | genset: breaker, battery, ambient / altitude, series, made_in, genset_type (nhãn), overload, load_step | nhận nhãn tối thiểu | `web/catalog.js`, `spec-norm.js` (text), `spec-fields.json`, test | ≈ 573 + 133 + 701 + 236 + 769 + 543 | thấp lợi ích / nhiều mơ hồ (Altitude 2 trường, Overload của BĐK, Origin 1 NCC): **đề nghị làm sau, hỏi Khoa trước** |
| **F** | genset_type từ cột «Open type / Silent type» | bộ đọc cấu trúc bảng (tiêu đề cột = giá trị) | `web/catalog.js` (đọc bảng), `suppliers/spec-standard.mjs`, test | ≈ 9.139 | cao: không phải nhãn; cần thiết kế riêng |
| **G** | controller: 27 trường bool + số / bảng | bộ đọc từ khoá THEO TỪNG MODEL cho `suppliers/controllers.mjs` hoặc tệp mới `controllers-features.mjs`; pdftotext lại không `-layout`; bỏ mục lục, nhật ký, tên công ty | `suppliers/controllers.mjs` hoặc mới, `suppliers/spec-standard.mjs` (phần controller), `suppliers/spec-fields.json` (không cần `key`: bool theo dòng nguồn), test `suppliers/controllers.test.mjs` | 209 model của bản chuẩn | cao: «cụm chữ có ≠ có chức năng»; mỗi bool phải kèm dòng nguồn (đã là quy định: «có / không + dòng nguồn») |

Thứ tự đề nghị: **C (phần THF → thd) ngay** (sửa giá trị SAI trong bản chuẩn), rồi **A** (nhanh, key đã có), **B**, **D**, **G**, rồi **E / F** sau khi Khoa trả lời các câu hỏi dưới.

## 7. Cần Khoa quyết
1. `excitation`: «Brushless, self-excited» (201 giá trị) thêm giá trị `self_excited` hay để `missing`?
2. «Altitude» → `genset.ambient` hay `alternator.altitude` (hoặc cả hai)?
3. Cột «Open type / Silent type» làm `genset.genset_type` (PR F)?
4. `Short circuit ratio` (1/Xd) có vào `short_circuit` («Dòng ngắn mạch duy trì») không, hay chỉ «Sustained short circuit»?
5. Chuỗi bị cắt ô «Turbocharged and» (25 + ~15): xử lí ở bộ đọc ô (gộp ô kế) hay để `missing`?
6. Thêm `key` vào `spec-fields.json` cho các trường chưa key (poles, bearing…) có cần duyệt lại không?

## 8. Tệp
`genbid-work\dieu-phoi\dau-vao\buoc-4\`: `harvest.mjs` (kho nhãn) → `labels.json` / `labels.tsv`; `an-xep.mjs`, `an-xep2.mjs` → `truong-nhan.tsv`, `truong-chat.tsv`, `truong-chat-tong.tsv`; `xep-hang.mjs` → `xep-hang.tsv`; `nhan-nham.mjs` → `nhan-da-nhan.tsv`; `thu-specKey.mjs` (thử trực tiếp `specKey`); `nhan-khong-nhan.mjs` → `nhan-khong-nhan-bang.tsv`, `nhan-khong-nhan-nguon.tsv`; `de-xuat-300.mjs` → `de-xuat-300.tsv`; `nhan-khong-co-truong.mjs` → `nhan-khong-co-truong.tsv`; `enum-cach-viet.mjs`, `enum-de-xuat.mjs` → `enum-cach-viet.tsv`, `enum-de-xuat.tsv`; `bdk-cum-chu.mjs` → `bdk-cum-chu.tsv`, `bdk-cum-chu-vidu.tsv`, văn bản PDF ở `bdk-text\`; `lap-bao-cao.mjs` sinh tệp này. Lệnh chạy lại: `node harvest.mjs; node an-xep2.mjs; node xep-hang.mjs; node nhan-khong-nhan.mjs; node de-xuat-300.mjs; node nhan-khong-co-truong.mjs; node bdk-cum-chu.mjs; node lap-bao-cao.mjs`; enum cần `node suppliers/spec-standard.mjs --out <thư mục>` (≈ 4 phút, ghi 9.685 tệp 45 MB) rồi `node enum-cach-viet.mjs; node enum-de-xuat.mjs`.

