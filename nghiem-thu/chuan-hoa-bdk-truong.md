# Đề xuất bộ trường chuẩn cho bộ điều khiển (BĐK) — từ datasheet Deep Sea

Ngày 24/11/2026. Nguồn: datasheet công khai (tải không cần đăng nhập) của mảng DSEGenset trên deepseaelectronics.com, lưu ở
`suppliers/sources/deep-sea-electronics/1001…1039.md`. Chỉ là ĐỀ XUẤT; chưa sửa `reqcodes.mjs`, `web/catalog.js`, `web/spec-norm.js`, `schema.json`.

## 0. Phạm vi và cách đọc số liệu

- Trang DSEGenset liệt kê 42 sản phẩm đang bán (8 nhóm) + khoảng 95 sản phẩm ngừng bán (trang /genset/obsolete). Hồ sơ trước đó có 17 bảng
  (nguồn 1001–1016). PR này thêm 21 datasheet đang bán (nguồn 1017–1039, trừ 1032/1033): 12 của BĐK / màn hình (DSEG8600, 8660, 8680, 810, 8900, 8007, 8500,
  7400, 7300, 4500, DSE8680, DSE7570) và 9 của module (DSE2160, 2170, 8003 MKII, DSEG0123, DSE2548, 2157, 2152, 2133, 2131). Datasheet DSE892 và DSE857 đã tải về genbid-work nhưng KHÔNG đưa vào PR: thêm cả hai làm 3 test của `ctl-twin.test.mjs` hỏng (thuộc phần mô-đun truyền thông của phiên khác).
- Số liệu dưới đây quét 23 datasheet BĐK (gồm cả các datasheet cũ 1001–1011 và 1016; datasheet chung cho cặp -10/-20 tính 1). Số "datasheet có
  ghi" = số datasheet có dòng khớp từ khoá, không phải số model.
- Số đếm là số datasheet CÓ DÒNG chứa từ khoá, không phải số datasheet "xác nhận chức năng" — chưa lọc ngữ cảnh. Một số từ khoá ồn
  (vd. "PLC" trùng tên công ty "Deep Sea Electronics PLC", "Email" trùng chân trang) đã loại khỏi bảng.
- **Phát hiện quan trọng**: datasheet Deep Sea KHÔNG ghi danh mục bảo vệ (quá tốc, thấp áp dầu, quá nhiệt, quá điện áp, ngắn mạch …):
  "overspeed" chỉ 1 chỗ, "low oil pressure" 1 chỗ, "short circuit" 1 chỗ. Danh mục này nằm trong Operator Manual (057-xxx), mà
  tải Operator Manual cần đăng nhập (curl không cookie trả 403; sổ tay DSE7310 MKII xác nhận 403). Xem mục 5.

## 1. ctl_make / ctl_model / ctl_origin (core)

| Trường | Dạng giá trị | Số datasheet | Trích nguyên văn | Chữ datasheet dùng |
|---|---|---|---|---|
| Hãng | danh sách cố định | tất cả | "DEEP SEA ELECTRONICS UK" (chân trang, [1001]) | DSEGenset®, Deep Sea Electronics |
| Model + mã đặt hàng | chuỗi, "Part Number" | các datasheet đời MKII/G8 | "Part Number: 7310-03 / 7320-03" [1001]; "DSEG8680 \| Bus Tie Controller \| G8680-01" [1017] | Part Number |
| Xuất xứ | chuỗi | KHÔNG ghi trong datasheet | trang about (nguồn 6001): "We manufacture our products in one place, the United Kingdom." | — (chỉ nguồn 6001) |

## 2. ctl_type — loại BĐK

Trường đề xuất `loại`: danh sách cố định {Khởi động tay/tự động, AMF (mất điện lưới), Hoà đồng bộ & chia tải, Chuyển nguồn tự động (ATS) + mains,
Bus tie, Điều khiển từ xa/hiển thị}.

| Giá trị | Số datasheet | Trích nguyên văn | Chữ datasheet |
|---|---|---|---|
| Manual & Auto Start | 4 | "DSE3110 Manual & Auto Start Control Module" [1006] | "Manual / Automatic Start Controller" [1001] |
| Auto Mains (Utility) Failure (AMF) | 8 | "DSE7320 MKII Automatic Mains (Utility) Failure (AMF) Controller" [1001] | Auto Mains (Utility) Failure |
| Synchronising & Load Sharing | 11 | "DSE8610 MKII Synchronising & Load Sharing" [1027]; "Synchronising control over either side of the bus" [1019] | Synchronising, Load Sharing |
| Auto Transfer Switch + mains | 4 | "DSE8660 MKII Auto Transfer Switch & Mains (Utility) Control Module" [1005] | Auto Transfer Switch |
| Bus tie | 7 | "DSEG8680 \| Bus Tie Controller" [1017] | Bus Tie |

## 3. ctl_start_amf — khởi động, dừng, tự động cấp điện

| Trường | Dạng | Số datasheet | Trích nguyên văn | Chữ datasheet |
|---|---|---|---|---|
| Khởi động / dừng tự động & chuyển tải theo lưới | có/không | 5 | "Automatic start and stopping of generator and transfer of load based on mains (utility) availability" [1001] | Automatic start and stopping |
| Phát hiện mất điện lưới | có/không | 12 | "Mains (utility) failure detection including mains (utility) decoupling" [1004] | Mains (utility) failure detection |
| Khởi động từ xa (đầu vào) | có/không | 7 | "Remote start input" [1006] | Remote start |
| Hẹn giờ chạy máy | có/không | 6 | "Engine run-time scheduler" [1007] | Scheduler |
| Điều khiển tay (nút mặt trước) | có/không | 12 | "Manual front panel and automatic control modes" | Manual / Automatic |
| Bộ chuyển nguồn / transfer | có/không | xem ctl_type ATS | — | — |

## 4. ctl_protection — bảo vệ, dừng máy

Datasheet chỉ ghi một số bảo vệ ở mức tên chức năng; KHÔNG có danh mục đủ (xem mục 0, 5).

| Trường | Dạng | Số datasheet | Trích nguyên văn | Chữ datasheet |
|---|---|---|---|---|
| Đo dòng chạm đất (Earth fault) | có/không | 8 | "Measurement Inputs \| 3 Phase with Earth Fault" [1001] | Earth Fault |
| Công suất ngược (Reverse power) | có/không | 2 | "• Reverse power alarms" [1010] | Reverse power |
| Quá dòng | có/không | 1 | "Over current protection" [1010] | Over current |
| Bảo vệ mất lưới / decoupling (ROCOF, vector shift) | có/không | 7 | "Mains (utility) failure detection including mains (utility) decoupling" [1004] | Mains decoupling |
| Đầu vào dừng khẩn cấp | có/không | 11 | "Emergency Stop Input" [1001] | Emergency Stop |
| Hỗ trợ ECU/ECM động cơ điện tử (CAN) | có/không | 13 | "Latest ECU / ECM support for a wide range of engine manufacturers" [1001] | ECU / ECM |
| Quá tốc, thấp áp dầu, nhiệt, quá/thấp áp, ngắn mạch | — | ≤ 1 | KHÔNG đủ trong datasheet | cần Operator Manual |

## 5. HSMT hỏi nhưng datasheet KHÔNG ghi (ghi riêng)

| Mã | Điều HSMT hỏi | Tình trạng |
|---|---|---|
| ctl_origin | Xuất xứ BĐK | datasheet không ghi; dùng nguồn trang about (6001) |
| ctl_protection | Danh mục bảo vệ chi tiết (quá tốc, thấp áp dầu, nhiệt độ cao, quá áp, ngắn mạch, mất kích từ) | KHÔNG có trong datasheet; chỉ có trong Operator Manual (đăng nhập). "loss of excitation": 0 datasheet; "over/under speed", "over/under voltage": 0 datasheet |
| ctl_alarm_log | Số sự kiện lưu | chỉ DSE8660 MKII (250 sự kiện, [1005]) và DSE6010/20 MKII ("Configurable event log (50)", [1007]) ghi số; đa số chỉ ghi "event log" |
| ctl_comm | Wi-Fi, Bluetooth | 0 datasheet |
| ctl_measure | Hệ số công suất, kWh, kvar đo từ BĐK | gần như không (power factor 1 chỗ, kWh 1 chỗ) |
| ctl_display_lang | Danh sách ngôn ngữ cụ thể | datasheet chỉ ghi "Multiple language support", không liệt kê |
| ctl_display_lang | Ngôn ngữ tiếng Việt | không ghi |

## 6. ctl_measure — đo lường, hiển thị

| Trường | Dạng | Số datasheet | Trích nguyên văn | Chữ datasheet |
|---|---|---|---|---|
| Kiểu màn hình | danh sách cố định {LCD văn bản, màu TFT, màu cảm ứng} | LCD/text 14; màu 9; cảm ứng 2 | "4-line back-lit LCD" [1019]; "Optically bonded 10.1” colour display for harsh environments." [1020]; "Display \| 10.1” TFT" [1020] | LCD, colour display, TFT, touchscreen |
| Đo điện áp (phạm vi V) | số + đơn vị (khoảng) | 20 | "Voltage Range \| 15 V to 415 V Phase to Neutral / 25 V to 720 V Phase to Phase" [1001] | Voltage Range |
| Dải tần số | số + Hz | 21 | "Frequency Range \| 3.5 Hz to 75 Hz" [1001] | Frequency Range |
| Đo dòng (Current Range) và nguồn CT | số + A | 13 | "Current Range \| 0 A to 1 A / 0 A to 5 A" [1001] | Current Range |
| Độ chính xác | số + % | 12 | "Accuracy \| ±1 %" [1001] | Accuracy |
| Số kênh đo điện áp (máy phát / lưới) | số | ~ | "Number \| DSE7310 MKII: 1 / DSE7320 MKII: 2" [1001] | Number |

## 7. ctl_comm — truyền thông, giám sát từ xa

| Trường | Dạng | Số datasheet | Trích nguyên văn | Chữ datasheet |
|---|---|---|---|---|
| USB | có/không | 22 | "USB \| CONFIGURABLE" [1011] | USB |
| RS232 | có/không | 8 | "RS232 \| 1 Modbus RTU Port" [1001] | RS232 |
| RS485 | có/không | 15 | "RS485 \| 1 Modbus RTU Port" [1001] | RS485 |
| Modbus RTU | có/không | 13 | "Integrated RS232 and RS485 ports providing Modbus RTU support" [1001] | Modbus RTU |
| Modbus TCP | có/không | 10 | "Integrated Ethernet port providing Modbus TCP support" [1026] | Modbus TCP |
| SNMP | có/không | 9 | "Integrated Ethernet port providing Modbus TCP and SNMP v2c" [1004] | SNMP v2c |
| Ethernet | có/không | 15 | "Ethernet \| 1 10/100 Ethernet Port" [1003] | Ethernet |
| CAN / ECU (J1939) | có/không | 20 | "CAN \| 3 Fully Isolated CAN Ports" [1004] | CAN |
| DSENet (mở rộng) | có/không | 14 | "DSENet® expansion support" [1001] | DSENet |
| DSEWebNet (giám sát từ xa) | có/không | 12 | "DSEWebNet®" [1001]; gateway "DSE890 MKII \| DSEWebNet® / IoT Gateway - 4G (GSM/Ethernet) \| 0890-04" [1002] | DSEWebNet, IoT Gateway |
| 4G / GSM (qua module) | có/không | 2 (BĐK), 1012 (module) | "4G Connectivity" [1012] | 4G |
| SMS | có/không | 1 (DSE8660 MKII) | "and SMS messaging. Comprehensive communications are also available via RS232, RS485 & Ethernet" [1005] | SMS |

Lưu ý: 4G/GSM, Internet, 5G là chức năng của MODULE (DSE890/891/892/857), không phải BĐK — trùng với `ctl-module.mjs` hiện có.

## 8. ctl_alarm_log — cảnh báo, nhật ký

| Trường | Dạng | Số datasheet | Trích nguyên văn | Chữ datasheet |
|---|---|---|---|---|
| Nhật ký sự kiện | có/không + số sự kiện | 8 (có số: 2) | "The comprehensive event log will record up to 250 events to facilitate maintenance." [1005]; "Configurable event log (50)" [1007] | event log |
| Ghi dữ liệu theo thời gian | số tham số | 11 | "Data logging of up to 10 parameters" [1001]; DSE86x0: "up to 20 parameters" | Data logging |
| Cảnh báo (đèn LED, còi, màn hình) | có/không | 14 | "System alarms are annunciated on the LCD screen (multiple language options available), illuminated LED and audible sounder." [1004] | annunciated |
| PLC (logic lập trình) | có/không | 13 (dòng "PLC functionality") | "Advanced PLC functionality including multi-purpose PIDs" [1001] | PLC functionality |

## 9. ctl_parallel — hoà đồng bộ, chia tải

| Trường | Dạng | Số datasheet | Trích nguyên văn | Chữ datasheet |
|---|---|---|---|---|
| Hoà đồng bộ | có/không | 12 | "Slip sync and sync (phase) lock synchronising control" [1017] | Synchronising |
| Chia tải | có/không | 9 | "DSE8610 MKII Synchronising & Load Sharing" [1027] | Load Sharing |
| Chia tải theo nhu cầu (load demand) | có/không | 5 | "Advanced load demand schemes including automatic start / stop on" [1004] | Load demand |
| Hoà vào thanh cái chết | có/không | 5 | "Dead bus synchronising" [1017] | Dead bus |
| Liên lạc giữa các tổ (AMSC) | có/không | 5 | "Advanced multi-set communication (AMSC) link with optional" [1017] | AMSC |
| Bus tie / bus segments | có/không | 7 | "Flexible bus segments" [1017] | Bus tie |
| Tích hợp governor / AVR | có/không | 7 | "Integrated governor and AVR control" [1017] | Governor / AVR |

## 10. ctl_display_lang

| Trường | Dạng | Số datasheet | Trích nguyên văn | Chữ datasheet |
|---|---|---|---|---|
| Đa ngôn ngữ | có/không | 14 | "Multiple language support" [1001] | Multiple language |
| Danh sách ngôn ngữ | — | 0 | không ghi | — |

## 11. Trường ngoài mã ctl_* nhưng datasheet ghi ổn định (đề xuất thêm)

| Trường | Dạng | Số datasheet | Trích nguyên văn |
|---|---|---|---|
| Điện áp nguồn DC | số + V (khoảng) | 23 | "Continuous Voltage Rating \| 8 V to 35 V DC continuous" [1001] |
| Cấp bảo vệ IP mặt trước | danh sách cố định (IP65…) | 23 | "IP65 - IP65 - From the front of the module when the gasket is installed into a control" [1001] |
| Nhiệt độ vận hành | số + °C (khoảng) | 23 | "Operating Temperature \| -30 °C to +70 °C / -22 °F to +158 °F" [1001] |
| Kích thước (R×C×S) | số + mm | 18 | "Overall (W x H x D) \| 245 mm x 184 mm x 51 mm" [1004] |
| Số ngõ vào số / ngõ ra | số | 19 / 21 | "Number \| 6" (mục Analogue Inputs, [1001]) |
| Chứng nhận UL | có/không | — | "UL Listed: Standard - UL 6200:2nd Edition" [1002] |
| Phần mềm cấu hình | tên | 24 | "PC configuration using DSE Configuration Suite" [1001] |

## 12. Khuyến nghị cho điều phối

1. Chuẩn hoá thành dạng **có/không + dòng nguồn** cho các chức năng liệt kê ở mục 3, 4, 7, 9; **số + đơn vị** cho mục 6 và 11.
2. Bảo vệ chi tiết (ctl_protection): datasheet không đủ. Cần Operator Manual (cần đăng nhập, xem báo cáo) — hỏi Khoa có cho commit chữ
   của sổ tay lên repo hay không; hoặc giữ ngoài git.
3. Hạn chế: số đếm là khớp từ khoá theo datasheet, chưa phải "xác nhận chức năng" từng model; khi hiện lên web nên lấy từng model → dòng nguồn.
4. Datasheet dùng chung cho cặp model (DSE7310/7320 …): khi gán chức năng cho model riêng phải theo dòng nguồn ghi tên model (đã có cách làm ở `config-bot.mjs modelFacts`).
5. Tài liệu đời cũ (đã ngừng: DSE7320 không MKII, DSE4510/20, 5xxx…): đã tải về `genbid-work\dse-datasheets\` nhưng CHƯA đưa vào repo, vì thêm datasheet DSE7320 đời cũ làm thay đổi kết quả chọn "bộ thấp nhất đủ" của `ctl-twin.test.mjs` / `ctl-module.test.mjs` (4 test hỏng). Cần điều phối quyết.
