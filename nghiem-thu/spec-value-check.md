# Bộ kiểm giá trị từng thông số của bản chuẩn (nhánh `spec-value-check`)

Khoa 24/11/2026: "nên có bộ kiểm thử giá trị của từng thông số"; "trùng là trùng mã. sai là nằm ngoài dải hợp lý hoặc giá trị không đúng với thông số".

Giới hạn của lần soát: em đối chiếu vi phạm với bảng đã lưu trong `suppliers/cn/`, KHÔNG mở lại trang web hay PDF gốc. Với luật có trên 30 vi phạm, em soát 30 đầu; phần còn lại chưa soát từng dòng. Bộ kiểm chỉ báo: không sửa, không xoá, không ẩn dữ liệu, không đổi `spec-standard.mjs`, `catalog.js`, `spec-norm.js`, `config-bot.mjs`, `spec-fields.json`.

## 1. Kết quả

Lệnh: `node suppliers/spec-value-check.mjs [--out <thư mục>]`, khoảng 4 phút 40 giây. Danh sách đầy đủ ở `genbid-work\spec-value-check\`: `violations.jsonl` (trường, model, NCC, giá trị, chữ gốc, vị trí nguồn, dòng nguồn, luật), `duplicates.json`, `summary.json`.

- Kiểm **319.712 giá trị**, không lấy mẫu; 55 trường có luật, 75 trường chưa có luật.
- **1.730 giá trị sai**, trong đó 1.315 là một lỗi duy nhất (mục 2).
- 1.337 giá trị "chưa chuẩn": chữ của trường enum chưa về giá trị chuẩn (Turbo-charged, Electronic control…). Đây là việc của bước 4, không tính là sai.
- **65 nhóm trùng mã** (mục 5).

| Luật | Nghĩa | Số vi phạm | Kết quả soát tay |
|---|---|---:|---|
| `gia-tri-hong` | giá trị là chữ `[object Object]` | 1.315 | Thật, lỗi bộ sinh bản chuẩn |
| `hinh-hoc` | dung tích lệch > 5 % so với xi lanh × bore × hành trình của chính dòng | 200 | 30 / 30 đầu thật mâu thuẫn; luật không chỉ ra ô nào sai |
| `ngoai-dai` | ngoài dải của trường | 66 | Thật, sau khi sửa luật |
| `lech-cong-suat` | tiêu hao, khối lượng, dòng điện không hợp công suất của dòng | 46 | Thật, 11 ca khối lượng googol cần Khoa xem |
| `so-chieu` | kích thước không đủ 3 số (hoặc bội của 3) | 45 | 30 / 30 đầu thật: nguồn có dấu cách trong số ("240 0×880×1360") hoặc số dính nhau |
| `lan-toc-do` | số vòng quay nằm trong số công suất ("15/20/1500") | 45 | 30 / 30 đầu: nguồn đúng, bản chuẩn đọc sai cột |
| `sai-loai` | giá trị không đúng loại thông số | 8 | Thật |
| `nham-muc` | standby nhỏ hơn prime trên cùng dòng nguồn | 4 | Thật, nguồn ghi vậy |
| `ti-le-kw-kva` | kW / kVA ngoài 0,5–1,2 | 1 | Thật: depco DPK-DYM-44 ghi "35kW/344kVA" |

## 2. Lỗi lớn nhất: toàn bộ khí thải của bản chuẩn bị hỏng

Cả **1.315 / 1.315** giá trị `engine.emission` là chữ `[object Object]`. Nguyên nhân: `valueOf` của `suppliers/spec-standard.mjs` dòng 58 viết `String(n.enum)`, trong khi `n.enum` của khí thải là object hoặc mảng object. Chữ gốc (`raw`) vẫn đúng, ví dụ "STAGE 3A", "T2". Theo yêu cầu em KHÔNG sửa tệp này. Phiên đang sửa `spec-standard.mjs` cần sửa trước khi web đọc bản chuẩn. Kiểm chéo cũ không bắt được vì nó so `String(n.enum)` với chính nó.

## 3. Ví dụ vi phạm đã soát, theo nguồn

- **Đơn vị / loại:** bdadl, fukangsi, pengpai ghi tiêu hao "≤418" dưới nhãn g/kWh cho máy 1.500 kW (24 giá trị, số giống L/h). yingtai n107 kích thước 2580×1100×1666 mang đơn vị m. aosif n1088 "50% ethylene" ở dung tích nước làm mát; aosif n1086 "Piston Cooling: Oil cooled" ở làm mát khí nạp; repower-gas n1001 "KCN 7805" (mã dầu) ở dung tích dầu; jet-power n125 "Turbocharged" ở kiểu động cơ.
- **Lệch cột:** jiangchai và fukangsi có cột 油耗 (L/H) chép đúng số kW standby (J20C100M: 100 L/h, máy 100 kW). legapower n101: số kVA PRP đọc thành tiêu hao (LG385C 350 L/h). wintpower n105: "180/225" đọc thành tiêu hao.
- **Gõ sai ở nguồn:** huipu "128*14", "170*19", tiêu hao 22337; jlmech "200210"; aoke "3130*115*1850"; jiangchai "202*0.86*1.46"; gfe-power tỉ số nén "16 3:1" đọc thành 3.
- **Nhầm mức:** depco DPK-DTY-70 prime 70 kVA, standby 69 kVA; shanhua HL200GF ghi 常用功率 240 kW, 备用功率 220 kW; HL240GF standby 288 kW, prime 317 kW; tecgen TG34YDS prime 38 kVA, standby 34 kVA.
- **Mâu thuẫn hình học:** depco ghi Perkins 403D-15G 4 xi lanh với 1,496 L (84×90×4 = 1,995 L); huipu KTA50-G3 ghi 12 xi lanh với 50 L; mingbang 6LTAA8.9-G2 ghi 114×135 với 8,9 L.
- **Số vi phạm vì số khác của dòng sai:** endress 4BT3.9-G2: tiêu hao 8,4 L/h đúng với 36,4 kW, nhưng bản chuẩn gắn công suất 20 kW vì bảng liệt kê nhiều mức. Sai nằm ở công suất. bison BS170F tương tự (lệch cột đã biết).

## 4. Luật đã sửa sau khi soát (báo nhầm số đúng)

| Luật ban đầu | Báo nhầm | Sửa |
|---|---|---|
| Tốc độ theo tập RPM của `absurdOf` | 42 số thật (ZS195 2000, ZS1100 2200 v/p) | Bỏ tập, chỉ giữ dải 600–6.000 |
| Trần tiêu hao 800 L/h cho mọi máy | Máy 3 MW (aosif AW3500 854 L/h) | Có kW thì so theo kW, trần chỉ khi không có kW |
| Dải L/h theo kW cho mọi máy | Máy nhỏ (powerpack PG13-Y) | Máy ≤ 30 kW nới theo tỉ lệ 300 / 260 g/kWh của `likely` |
| Kích thước đúng 3 số | 15 ô ghi hai bản open / silent | Nhận bội của 3 |
| Đơn vị xét cả ô | "2650 kg / 600 L", "220V / 50Hz", "260L (7–8 hours)" | Chỉ xét đơn vị ngay sau số của giá trị |
| Công suất động cơ nhiều số | 219 ô so mảng sai | Xét từng số |
| Làm mát phải có chữ tiếng Anh / Trung | "wassergekühlt" | Thêm tiếng Đức |

## 5. Trùng mã: 65 nhóm

Trùng = cùng mã sau khi bỏ dấu, nằm ở nhiều khoá. Động cơ 48, tổ máy 13 (chỉ so trong cùng NCC), đầu phát 4. Thêm 23 mã đầu phát khoá theo NCC ("STC-10" của các xưởng khác nhau) là cố ý, không tính.

- **37 nhóm có dấu `^` / `★`:** tách có chủ ý (Khoa 21/11/2026 về `^` của Baudouin; `★` của ettes là nơi sản xuất). Ví dụ `6M31G800/6` và `6M31G800/6^`.
- **13 nhóm ngoặc `(M)` / `(E)`:** `KTA19-D(M)` và `KTA19-DM`, `1100F(E)` và `1100FE`.
- **15 nhóm còn lại:** `4HTAA4.3*G34` và `4HTAA4.3-G34`, `ECP 28-2S/4C` và `ECP28.2S4C`, `(YD485D)` và `YD485D`, `R-C1375D5/S` và `R-C1375D5-S`, `4BTA3.9-GM4/7` và `4BTA3.9-GM47`.

## 6. Điểm cần Khoa quyết

1. **Khí thải:** cho phiên đang sửa `spec-standard.mjs` sửa lỗi `[object Object]` trước bước 5 (đề xuất: có).
2. **Trùng mã:** gộp 28 nhóm (M)/(E) và "còn lại" không? Đề xuất: soát từng nhóm, chỉ gộp khi có nguồn. Riêng `4BTA3.9-GM4/7` chưa rõ là một mã.
3. **Khối lượng googol (11 giá trị):** bảng có cả công suất động cơ lẫn tổ máy, còn cột "Weight (kg)" không nói là của cái nào. Số 1.480 kg cho máy 625 kVA thấp hơn mức 2,5 kg/kVA của luật có sẵn, nên em nghi là khối lượng động cơ (chưa có nguồn xác nhận). Coi là khối lượng động cơ hay tổ máy?
4. **Dải "cần Khoa xem"** ở bảng mục 7: chưa có luật sẵn, em đặt lỏng theo dữ liệu thật trong `cn/`.
5. **Vi phạm do nguồn ghi sai:** giữ nguyên và chỉ báo, hay đưa vào `dropspec` / `fixspec` theo từng ca? Bộ kiểm hiện không thay đổi gì.

## 7. Luật, căn cứ và số vi phạm theo trường

| Trường | Luật | Căn cứ dải | Số giá trị | Sai | Chưa chuẩn | Vi phạm |
|---|---|---|---:|---:|---:|---|
| genset.supplier | code | id hồ sơ NCC, không rỗng | 31443 | 0 | 0 |  |
| genset.model | code | mã không rỗng, có chữ hoặc số | 31675 | 0 | 0 |  |
| genset.brand_country | country | mã nước 2 chữ của COUNTRY_GROUP (catalog.js) | 31443 | 0 | 0 |  |
| genset.engine_model | code | mã không rỗng | 39400 | 0 | 0 |  |
| genset.alternator_model | code | mã không rỗng | 327 | 0 | 0 |  |
| genset.controller_model | code | mã không rỗng | 513 | 0 | 0 |  |
| genset.power | genset_power (cần Khoa xem) | kW / kVA 0,5-1,2: luật bảng nhãn catalog.js (hosem n136); standby >= prime: titledPowers; trần theo số lớn nhất có thật trong cn/ (16.875 kVA) | 58923 | 5 | 0 | nham-muc 4, ti-le-kw-kva 1 |
| genset.frequency | {50, 60} | tần số lưới | 10546 | 0 | 0 |  |
| genset.voltage | 100 – 15000 | VOLTS của absurdOf: 110 V tới 13,8 kV | 3291 | 2 | 0 | sai-loai 1, ngoai-dai 1 |
| genset.phases | {1, 3} | 1 hoặc 3 pha | 2378 | 0 | 0 |  |
| genset.power_factor | 0.6 – 1 (cần Khoa xem) | dữ liệu cn/ 0,7-1; nới 0,6 | 532 | 0 | 0 |  |
| genset.current | 0.5 – 40000 | so công suất của dòng bằng absurdOf (mọi điện áp 208 V-13,8 kV); trần rộng theo máy lớn nhất cn/ | 1746 | 1 | 0 | lech-cong-suat 1 |
| genset.freq_regulation | 0 – 10 (cần Khoa xem) | dữ liệu cn/ 0,25-5 %; nới 10 % | 150 | 0 | 0 |  |
| genset.fuel | enum | values của spec-fields.json | 660 | 0 | 0 |  |
| genset.fuel_100 | fuel | L/h theo kW của dòng 0,12-0,45 và trần 800 (likely, catalog.js); g/kWh 150-300 (saneSpecs) | 9518 | 52 | 0 | lech-cong-suat 27, ngoai-dai 25 |
| genset.fuel_75 | fuel | L/h theo kW 0,09-0,36, trần 650 (likely); g/kWh 150-300 | 682 | 4 | 0 | lech-cong-suat 4 |
| genset.fuel_50 | fuel | L/h theo kW 0,06-0,26, trần 450 (likely); g/kWh 150-300 | 419 | 3 | 0 | lech-cong-suat 3 |
| genset.tank | 1 – 100000 (cần Khoa xem) | dữ liệu cn/ 4-6.900 L; bồn ngoài có thể lớn, dải lỏng | 934 | 0 | 0 |  |
| genset.runtime | 0.5 – 200 (cần Khoa xem) | dữ liệu cn/ 6,5-13 h; dải lỏng | 545 | 0 | 0 |  |
| genset.dimensions | dims | mỗi chiều 300-16.000 mm hoặc 0,3-16 m (likely, catalog.js); cm quy theo cùng dải | 15502 | 80 | 0 | ngoai-dai 35, so-chieu 45 |
| genset.weight | 30 – 80000 | 30-80.000 kg (likely); 2,5-150 kg/kVA (checkSpec qua absurdOf) | 13421 | 11 | 0 | lech-cong-suat 11 |
| genset.noise | 40 – 120 | 40-120 (likely); chỉ xét đơn vị ngay sau số của giá trị, khoảng cách đo (7 m) không tính | 389 | 0 | 0 |  |
| engine.brand | code | tên hãng không rỗng | 4751 | 0 | 0 |  |
| engine.model | code | mã không rỗng | 6224 | 0 | 0 |  |
| engine.brand_country | country | ENGINE_COUNTRY / CN_MODEL (catalog.js) | 4822 | 0 | 0 |  |
| engine.made_in | country | mã nước; ? = chưa rõ | 6777 | 0 | 0 |  |
| engine.power_kwm | 1 – 20000 (cần Khoa xem) | standby >= prime; trần theo động cơ lớn nhất cn/ (3.311 kWm), nới cho máy thật; rpm theo dữ liệu | 3437 | 45 | 0 | lan-toc-do 45 |
| engine.power_hp | 1 – 27000 (cần Khoa xem) | như power_kwm, đổi hệ số 1,36 | 0 | 0 | 0 |  |
| engine.cylinders | 1 – 20 | 1-20 (likely, checkSpec); chữ V / L sau số là bố trí xi lanh | 3037 | 0 | 0 |  |
| engine.cyl_layout | enum | values của spec-fields.json | 1496 | 0 | 0 |  |
| engine.bore_stroke | 50 – 400 | mỗi số 50-400 mm (likely, catalog.js) | 3187 | 3 | 0 | ngoai-dai 3 |
| engine.displacement | 0.05 – 300 | 0,05-300 L (absurdOf: YC16VC 105 L, 8WH32 257 L); SN.selfCheck: lệch > 5 % so với xi lanh x bore x hành trình của chính dòng | 3605 | 200 | 0 | hinh-hoc 200 |
| engine.compression | 6 – 30 (cần Khoa xem) | dữ liệu cn/ phần lớn 11-24; dải lỏng 6-30, không mang đơn vị | 950 | 1 | 0 | ngoai-dai 1 |
| engine.engine_type | text | phải nêu kiểu động cơ | 98 | 3 | 0 | sai-loai 3 |
| engine.aspiration | enum | values + same của spec-fields.json | 695 | 0 | 522 | ngoai-danh-sach 522 |
| engine.charge_cooling | text | phải nêu môi chất làm mát khí nạp | 3 | 1 | 0 | sai-loai 1 |
| engine.governor | enum | values + same của spec-fields.json | 1696 | 0 | 531 | ngoai-danh-sach 531 |
| engine.cooling | text | COOL của catalog.js: phải nêu môi chất | 692 | 0 | 0 |  |
| engine.starting | text | phải nêu cách khởi động / điện áp khởi động | 276 | 0 | 0 |  |
| engine.coolant_capacity | 0.5 – 5000 (cần Khoa xem) | dữ liệu cn/ 18-510 L; dải lỏng | 151 | 3 | 0 | sai-loai 3 |
| engine.oil_capacity | 0.3 – 3000 (cần Khoa xem) | dữ liệu cn/ 0,75-520 L, 1 số 2.419 cần soát; dải lỏng | 1704 | 1 | 0 | ngoai-dai 1 |
| engine.speed | 600 – 6000 | dữ liệu cn/ 1.000-3.600; không dùng tập RPM của absurdOf vì chặn nhầm số thật (ZS195 2000, ZS1100 2200 v/p của zhengdian n103) | 2055 | 0 | 0 |  |
| engine.emission | emission | phải là thang và mức đọc được, không phải chữ hỏng | 1315 | 1315 | 0 | gia-tri-hong 1315 |
| alternator.brand | code | tên hãng không rỗng | 620 | 0 | 0 |  |
| alternator.model | code | mã không rỗng | 3026 | 0 | 0 |  |
| alternator.made_in | country | mã nước; ? = chưa rõ | 3046 | 0 | 0 |  |
| alternator.ratings | alt_ratings | kW / kVA như tổ máy; hiệu suất tờ hãng 80-97 %; standby >= continuous cùng điện áp, tần số | 9585 | 0 | 0 |  |
| alternator.insulation | enum | values của spec-fields.json | 503 | 0 | 79 | ngoai-danh-sach 79 |
| alternator.ip | text | dạng IPnn | 320 | 0 | 0 |  |
| alternator.excitation | enum | values của spec-fields.json | 341 | 0 | 205 | ngoai-danh-sach 205 |
| alternator.voltage_regulation | 0 – 10 (cần Khoa xem) | dữ liệu cn/ 0,5-5 %; nới 10 % | 197 | 0 | 0 |  |
| alternator.thd_no_load | 0 – 15 (cần Khoa xem) | dữ liệu cn/ < 2 %; dải lỏng | 38 | 0 | 0 |  |
| controller.brand | code | tên hãng không rỗng | 209 | 0 | 0 |  |
| controller.model | code | mã không rỗng | 209 | 0 | 0 |  |
| controller.made_in | country | mã nước; ? = chưa rõ | 210 | 0 | 0 |  |

## 8. Trường CHƯA có luật (75)

Các trường này chưa có giá trị nào trong bản chuẩn (bước 4 mới đọc), nên chưa có dữ liệu làm căn cứ dải. Khi trường có giá trị thì phải thêm luật vào `suppliers/spec-value-rules.json`.

- **genset (11):** series, brand, made_in, genset_type, overload, load_step, iso8528_class, ambient, breaker, battery, standards
- **engine (3):** genset_power, fuel_system, electrical_vdc
- **alternator (16):** brand_country, winding_pitch, wires, altitude, overspeed, air_flow, short_circuit, avr, thd_linear_load, tif, thf, poles, bearing, type, cooling, standards
- **controller (45):** order_code, brand_country, kind, auto_start_stop, mains_failure, remote_start, scheduler, prot_earth_fault, prot_reverse_power, prot_overcurrent, prot_mains_decoupling, emergency_stop, ecu_support, protections, display, measure_voltage, measure_frequency, measure_current, accuracy, usb, rs232, rs485, ethernet, can, modbus_rtu, modbus_tcp, snmp, remote_monitoring, cellular_sms, event_log, data_logging, plc, synchronising, load_sharing, load_demand, dead_bus, max_sets, governor_avr_control, languages, dc_supply, front_ip, operating_temp, dimensions, io, ul

## 9. Kiểm tra

PR https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1158 (đã merge). `node --test suppliers/*.test.mjs` đạt 1.638 / 1.638 trên máy; CI (suppliers, server) xanh.

## 10. Sửa bộ sinh bản chuẩn (PR 2, nhánh `spec-standard-sua`)

PR nháp https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1161, chưa merge. CI (suppliers, server) xanh. `node --test suppliers/*.test.mjs` đạt 1.648 / 1.648 trên máy.

**Sửa gì:**

- **Khí thải.** Giá trị là danh sách `{ scale, level }` lấy từ lớp chuẩn hoá (`levelsOf`), thay cho `String(n.enum)`. Nguồn không ghi thang thì `scale: null` kèm `missing: scale`, không đoán. Chữ nguồn giữ ở `raw`, nên "Tier 2" và "T2" cùng thang là một giá trị. Đã soát mọi `String(` trong tệp: chỉ dòng này ép object thành chữ.
- **Công suất động cơ không đơn vị.** Số không đơn vị nằm ở cột `figure` của `power_kwm`, kèm `missing: unit`. Số vẫn hiện, nhưng không mang nghĩa kWm hay HP. Bộ trường không đổi: `figure` là một ô của bảng, không phải trường mới.
  - Có **71 mục** thuộc loại này, không chỉ 5 ô của ettes-power. 66 mục còn lại (xinhengxin 46, beidou 16, hosem 9, hanyang 1, tính cả trùng doc) cũng được lớp chuẩn hoá ghi `missing: unit`.
  - Em áp cùng một luật cho cả 71 mục. Nếu chỉ sửa 5 ô thì 66 số không đơn vị vẫn nằm dưới khoá `kwm`, trái nguyên tắc điều phối nêu.
- **Kiểm chéo** (`spec-standard-check.mjs`). Nay so tập thang + mức với lớp chuẩn hoá, và tính giá trị chứa chữ "[object" là không giải thích được. Chạy bản kiểm mới trên mã cũ (`origin/main`) thì ra `unexplained` 1.977, thoát 1. Trên nhánh này thì ra 0, thoát 0.

**So băm từng doc, toàn `cn/`:**

| Mục | Trước | Sau |
|---|---:|---:|
| Doc | 9.685 | 9.685 |
| Giá trị | 319.712 | 319.721 |
| Giá trị khí thải | 1.315 | 1.324 |
| Chuỗi "[object" | 1.315 | 0 |
| Doc đổi băm | | 1.015 (1.004 khí thải, 69 công suất động cơ) |
| Doc đổi ở trường khác | | **0** |

Số giá trị khí thải tăng 9, vì trước đây mọi mức của một model bị gộp chung dưới chữ "[object Object]".

**Bộ kiểm giá trị sau khi sửa:**

- `gia-tri-hong` 1.315 → 0.
- `lan-toc-do` 45 → 35: 10 ô không đơn vị nay ở cột `figure`.
- Thêm 71 mục "chưa chuẩn" loại `thieu-don-vi`.
- Các luật khác không đổi. Tổng: 405 sai, 1.408 chưa chuẩn.

Luật khí thải đổi theo cấu trúc mới: danh sách `{ scale, level }`, thang thuộc `QUAL` của `spec-norm.js` hoặc để trống.

Test `kw-hp-sua.test.mjs` của #1160 kỳ vọng khoá `kwm`, nên em sửa sang cột `figure`.
