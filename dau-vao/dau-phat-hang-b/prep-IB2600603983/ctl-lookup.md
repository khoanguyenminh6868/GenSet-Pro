# Tra cứu sẵn: chức năng bộ điều khiển HSMT nêu × datasheet

Code dò trước bằng đúng bộ từ khoá mà lệnh check dùng để gợi ý dòng (CÓ THỂ TRA ĐƯỢC). Đây chỉ là chỉ dẫn tìm: đọc dòng, tự kết luận đạt / không đạt / chưa rõ; "không thấy dòng nào" chỉ nghĩa là không dòng nào có các từ khoá đó — muốn chắc thì grep controllers.md bằng từ khác. Câu trích và factSrc vẫn được check kiểm như cũ.

## Chức năng HSMT nêu (dòng HSMT đầu tiên có chữ đó)

- F1: "-    Khả năng quá tải Pmax = 1,1Pdm." — từ khoá datasheet: overload|over\s?-?current|over\s?-?power
- F2: "+ Ngắn mạch." — từ khoá datasheet: short\s?-?circuit
- F3: "+ Cảnh báo: nhiệt độ nước làm mát cao/thấp, áp lực dầu bôi trơn thấp, sự cố cảm" — từ khoá datasheet: oil pressure
- F4: "+ Cảnh báo: nhiệt độ nước làm mát cao/thấp, áp lực dầu bôi trơn thấp, sự cố cảm" — từ khoá datasheet: coolant temp|engine temp|high temp
- F5: "mạch, tần số quá thấp, vượt tốc, dừng khẩn cấp khi có sự cố." — từ khoá datasheet: over\s?-?speed
- F6: "mạch, tần số quá thấp, vượt tốc, dừng khẩn cấp khi có sự cố." — từ khoá datasheet: emergency stop
- F7: "-    Hệ thống khởi động: bằng mô tơ điện một chiều. Có bộ tự động sạc điện cho accu." — từ khoá datasheet: battery (voltage|under|over|low|high)|plant supply|(low|high) battery
- F8: "-    Hệ thống khởi động: bằng mô tơ điện một chiều. Có bộ tự động sạc điện cho accu." — từ khoá datasheet: charg(e|ing)\s*(alternator\s*)?(fail|alarm|warning|fault)|D\+\s*(fail|fault)
- F9: "lắp đặt ngoài trời phục vụ cấp điện các sự kiện, lễ hội. Máy được trang bị vỏ chống ồn để" — từ khoá datasheet: event log|events
- F10: "giờ vận hành." — từ khoá datasheet: engine hours|hours run|running hours|run time|hour meter
- F11: "-    Hệ số công suất Cosđm ≥ 0,8." — từ khoá datasheet: power factor|\bpf\b
- F12: "-    Công suất định mức Pdm = ≥ 700kVA." — từ khoá datasheet: \bkW\b|\bkVA\b|\bkvar\b
- F13: "Điện áp danh định của hệ thống (kV)                                  0,38" — từ khoá datasheet: voltage (measurement|range|sensing)|(generator|mains|bus|phase).{0,20}voltage|\bVs?(L-?L|L-?N|ph-?ph|ph-?n)\b
- F14: "-    Hiển thị được các thông số phần điện: điện áp, dòng điện, tần số, công suất và số" — từ khoá datasheet: current (measurement|sensing|range)|\bCT\b|(generator|phase|load).{0,15}current
- F15: "Tần số (Hz)                                                            50" — từ khoá datasheet: frequency
- F16: "chuẩn: RS232, RS485," — từ khoá datasheet: RS-?485
- F17: "chuẩn: RS232, RS485," — từ khoá datasheet: RS-?232
- F18: "+ Cổng kết nối USB." — từ khoá datasheet: USB
- F19: "Ethernet, BMS." — từ khoá datasheet: ethernet|TCP
- F20: "bằng điện tử (ECU -" — từ khoá datasheet: J1939|CAN
- F21: "6. Tủ chuyển đổi nguồn tự động (ATS):" — từ khoá datasheet: AMF|mains (\(utility\) )?fail|automatic mains
- F22: "- Bộ ATS có chức năng tự động khởi động máy phát và đóng điện cấp tải trong trường" — từ khoá datasheet: auto start|remote start
- F23: "-    Màn hình tinh thể lỏng (LCD) thông báo trạng thái/cảnh báo: các thông tin về toàn" — từ khoá datasheet: \bLCD\b|graphic display|display (size|type|resolution)
- F24: "- Bộ ATS phải được đấu nối đồng bộ với phần động lực và bộ điều khiển của máy" — từ khoá datasheet: synchron|load ?shar|parallel
- F25: "biến lực nhớt, sự cố cảm biến nhiệt độ, mức nhiên liệu trong bồn thấp, accu yếu," — từ khoá datasheet: fuel level|low fuel
- F26: "-      Chế độ làm việc của hệ thống              : Trung tính nối đất trực tiếp." — từ khoá datasheet: \bmanual\b|\bauto\b mode|stop\/reset

## DSE7320
- F6: { "supplierId": "deep-sea-electronics", "n": 1001, "line": "Emergency Stop Input" } (datasheet DSE7320 MKII: cần xác nhận đời)
- F13: { "supplierId": "deep-sea-electronics", "n": 1001, "line": "Voltage Measurement" } (datasheet DSE7320 MKII: cần xác nhận đời)
- F14: { "supplierId": "deep-sea-electronics", "n": 1001, "line": "Current Measurement" } (datasheet DSE7320 MKII: cần xác nhận đời)
- F15: { "supplierId": "deep-sea-electronics", "n": 1001, "line": "| Frequency Range | 3.5 Hz to 75 Hz" } (datasheet DSE7320 MKII: cần xác nhận đời)
- F16: { "supplierId": "deep-sea-electronics", "n": 1001, "line": "The DSE7320 MKII will also monitor the mains (utility) supply. The modules include USB, RS232 and RS485 ports as well as dedicated DSENet®" } (datasheet DSE7320 MKII: cần xác nhận đời)
- F17: { "supplierId": "deep-sea-electronics", "n": 1001, "line": "The DSE7320 MKII will also monitor the mains (utility) supply. The modules include USB, RS232 and RS485 ports as well as dedicated DSENet®" } (datasheet DSE7320 MKII: cần xác nhận đời)
- F18: { "supplierId": "deep-sea-electronics", "n": 1001, "line": "The DSE7320 MKII will also monitor the mains (utility) supply. The modules include USB, RS232 and RS485 ports as well as dedicated DSENet®" } (datasheet DSE7320 MKII: cần xác nhận đời)
- F20: { "supplierId": "deep-sea-electronics", "n": 1001, "line": "terminals for system expansion. Both modules are compatible with electronic (CAN) and non-electronic (magnetic pick-up/alternator sensing) engines" } (datasheet DSE7320 MKII: cần xác nhận đời)
- F21: { "supplierId": "deep-sea-electronics", "n": 1001, "line": "The DSE7310 MKII is an auto start control module and the DSE7320 MKII is an auto mains (utility) failure control module suitable for a wide variety of" } (datasheet DSE7320 MKII: cần xác nhận đời)
- F22: { "supplierId": "deep-sea-electronics", "n": 1001, "line": "| DSE7310 MKII Auto Start & DSE7320 MKII | Auto" } (datasheet DSE7320 MKII: cần xác nhận đời)
- F23: { "supplierId": "deep-sea-electronics", "n": 1001, "line": "engine status information on the back-lit LCD screen, illuminated LEDs and remote PC." } (datasheet DSE7320 MKII: cần xác nhận đời)
- F26: { "supplierId": "deep-sea-electronics", "n": 1001, "line": "| • | Manual front panel and automatic control modes" } (datasheet DSE7320 MKII: cần xác nhận đời)
- không thấy dòng nào: F1, F2, F3, F4, F5, F7, F8, F9, F10, F11, F12, F19, F24, F25

## DSE8610
- F6: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "Emergency Stop Input" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F9: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "System alarms are annunciated on the LCD screen (multiple language options available), illuminated LED and audible sounder. The event log records" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F10: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "load change, genset optimisation and balancing of engine hours" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F13: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "Voltage Measurement" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F14: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "| Current Range | 0 | A to 1" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F15: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "| Frequency Range | 3.5 Hz to 75 Hz" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F16: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "| • | Integrated RS232 and RS485 ports providing Modbus RTU" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F17: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "| • | Integrated RS232 and RS485 ports providing Modbus RTU" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F18: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "| USB A | 1 Data Storage Port" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F19: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "| • | Integrated Ethernet port providing Modbus TCP and SNMP v2c" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F20: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "| CAN | 3 Fully Isolated CAN Ports" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F21: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "| • | Mains (utility) failure detection including mains (utility) decoupling" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F22: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "The DSE8610 MKII is a market-leading Synchronising Auto Start Control Module suitable for use in a multi-generator loadshare system, designed to" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F23: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "System alarms are annunciated on the LCD screen (multiple language options available), illuminated LED and audible sounder. The event log records" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F24: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "| DSE8610 MKII Synchronising & Load Sharing | Auto" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F26: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "| • | Manual front panel and automatic control modes" } (datasheet DSE8610 MKII: cần xác nhận đời)
- không thấy dòng nào: F1, F2, F3, F4, F5, F7, F8, F11, F12, F25

## HGM9510
- F1: { "supplierId": "smartgen", "n": 1003, "line": "generator, controller has over voltage, under voltage, over frequency, under frequency, over current," }
- F3: { "supplierId": "smartgen", "n": 1003, "line": "frequently-used data (such as water temperature, oil pressure, engine speed, fuel consumption and" }
- F4: { "supplierId": "smartgen", "n": 1003, "line": "|  | Metal fixing clips enable perfect in high temperature environment;" }
- F5: { "supplierId": "smartgen", "n": 1003, "line": "low oil pressure, over speed and abnormal voltage during generator running, controller can protect" }
- F6: { "supplierId": "smartgen", "n": 1003, "line": "| 1 | Emergency Stop" }
- F7: { "supplierId": "smartgen", "n": 1003, "line": "| Battery Voltage (VB) | V (unit)" }
- F8: { "supplierId": "smartgen", "n": 1003, "line": "Temperature, Under speed and Charge Alternator Failure inputs are all inactive. As soon as this" }
- F9: { "supplierId": "smartgen", "n": 1003, "line": "| Event Log | ●" }
- F10: { "supplierId": "smartgen", "n": 1003, "line": "|  | Accumulative total run time and total electric energy of A and B. Users can reset it as 0 and" }
- F11: { "supplierId": "smartgen", "n": 1003, "line": "total apparent power, each phase and average power factor (positive and negative), accumulated" }
- F13: { "supplierId": "smartgen", "n": 1003, "line": "1. Modify the description of GOV and AVR voltage range SW2 in" }
- F14: { "supplierId": "smartgen", "n": 1003, "line": "|  | Collects and shows 3-phase voltage, current, power parameter and frequency of Bus/Gens;" }
- F15: { "supplierId": "smartgen", "n": 1003, "line": "voltage 120/240V and frequency 50/60Hz;" }
- F16: { "supplierId": "smartgen", "n": 1003, "line": "can be configured from front panel, and all parameters can be configured by USB interface (or RS485)" }
- F18: { "supplierId": "smartgen", "n": 1003, "line": "17 USB .......................................................................................................................................................... 76" }
- F19: { "supplierId": "smartgen", "n": 1003, "line": "| ETHERNET | ●" }
- F20: { "supplierId": "smartgen", "n": 1003, "line": "16 CONNECTIONS OF CONTROLLER WITH J1939 ENGINE..................................................................... 66" }
- F21: { "supplierId": "smartgen", "n": 1003, "line": "| AMF | ●" }
- F22: { "supplierId": "smartgen", "n": 1003, "line": "5.4 AUTO START/STOP OPERATION ..................................................................................................... 18" }
- F23: { "supplierId": "smartgen", "n": 1003, "line": "5.3 LCD DISPLAY ..................................................................................................................................... 13" }
- F24: { "supplierId": "smartgen", "n": 1003, "line": "GENSET PARALLEL (WITH GENSET) CONTROLLER" }
- F25: { "supplierId": "smartgen", "n": 1003, "line": "|  | 2 configurable sensors can be set as sensor of temperature, oil pressure or fuel level;" }
- F26: { "supplierId": "smartgen", "n": 1003, "line": "USER MANUAL" }
- không thấy dòng nào: F2, F12, F17

## InteliGen
- F1: { "supplierId": "comap", "n": 1004, "line": "| Overload | 32" } (datasheet InteliGen NT: cần xác nhận đời)
- F5: { "supplierId": "comap", "n": 1006, "line": "| Overspeed | 12" } (datasheet InteliGen NT: cần xác nhận đời)
- F6: { "supplierId": "comap", "n": 1013, "line": "| Dedicated terminal for safe Emergency Stop input. | Measurement | 3 phase Generator voltage" } (datasheet InteliGen 1000: cần xác nhận đời)
- F7: { "supplierId": "comap", "n": 1008, "line": "| Aux Battery Under Voltage | 27X" } (datasheet InteliGen 500: cần xác nhận đời)
- F8: { "supplierId": "comap", "n": 1008, "line": "| Charging fail threshold | Adjustable | 0-2 VDC close contact" } (datasheet InteliGen 500: cần xác nhận đời)
- F11: { "supplierId": "comap", "n": 1004, "line": "| Power factor | 55" } (datasheet InteliGen NT: cần xác nhận đời)
- F13: { "supplierId": "comap", "n": 1004, "line": "| Voltage measurement | measurement | 0.2 %" } (datasheet InteliGen NT: cần xác nhận đời)
- F14: { "supplierId": "comap", "n": 1004, "line": "| Current measurement | PWM | 500÷3000 Hz / 5 V / max. 10 mA" } (datasheet InteliGen NT: cần xác nhận đời)
- F15: { "supplierId": "comap", "n": 1004, "line": "Frequency input" } (datasheet InteliGen NT: cần xác nhận đời)
- F16: { "supplierId": "comap", "n": 1004, "line": "| InternetBridge-NT | Multiple Internet connections (PC and Modbus) to all controllers on CAN2 or RS485" } (datasheet InteliGen NT: cần xác nhận đời)
- F17: { "supplierId": "comap", "n": 1004, "line": "| inputs | RS232 | (1)" } (datasheet InteliGen NT: cần xác nhận đời)
- F18: { "supplierId": "comap", "n": 1004, "line": "| InteliVision 8 | Color 8\" display for advanced monitoring, control & trending, USB capable | INTELIVISION 8" } (datasheet InteliGen NT: cần xác nhận đời)
- F19: { "supplierId": "comap", "n": 1007, "line": "| Ethernet port | LAN/Internet, Modbus TCP," } (datasheet InteliGen NTC: cần xác nhận đời)
- F20: { "supplierId": "comap", "n": 1004, "line": "Load sharing and VAr sharing via CAN" } (datasheet InteliGen NT: cần xác nhận đời)
- F24: { "supplierId": "comap", "n": 1004, "line": "| Comprehensive paralleling gen-set controller | Extendable with ComAp's extension modules" } (datasheet InteliGen NT: cần xác nhận đời)
- không thấy dòng nào: F2, F3, F4, F9, F10, F12, F21, F22, F23, F25, F26

## DSE3110
- F6: { "supplierId": "deep-sea-electronics", "n": 1006, "line": "Emergency Stop Input" }
- F7: { "supplierId": "deep-sea-electronics", "n": 1006, "line": "| • | Battery voltage display" }
- F8: { "supplierId": "deep-sea-electronics", "n": 1006, "line": "| 7 | Charge Fail / Excite" }
- F13: { "supplierId": "deep-sea-electronics", "n": 1006, "line": "| • | Generator voltage display" }
- F15: { "supplierId": "deep-sea-electronics", "n": 1006, "line": "frequency, voltage and engine run hours and also displays the warning and shutdown status." }
- F18: { "supplierId": "deep-sea-electronics", "n": 1006, "line": "| USB B | 1 Programmable Port" }
- F20: { "supplierId": "deep-sea-electronics", "n": 1006, "line": "The DSE3110 can be utilised as a manual or auto start module for single gen-set applications or engine only applications. The module has been" }
- F22: { "supplierId": "deep-sea-electronics", "n": 1006, "line": "DSE3110 Manual & Auto Start Control Module" }
- F23: { "supplierId": "deep-sea-electronics", "n": 1006, "line": "The DSE3110 includes a back-lit icon LCD display which clearly shows the status of the generator set at all times. The module monitors engine speed," }
- F26: { "supplierId": "deep-sea-electronics", "n": 1006, "line": "DSE3110 Manual & Auto Start Control Module" }
- không thấy dòng nào: F1, F2, F3, F4, F5, F9, F10, F11, F12, F14, F16, F17, F19, F21, F24, F25

## HGM6110N
- F1: { "supplierId": "smartgen", "n": 1001, "line": "functions of over/under voltage, over/under frequency, over current and over power;" }
- F3: { "supplierId": "smartgen", "n": 1001, "line": "data (such as water temperature, oil pressure, speed and fuel consumption, etc.) but also can" }
- F4: { "supplierId": "smartgen", "n": 1001, "line": "of low oil pressure, high temperature, under speed, failed to charge and Aux. input (be configured)" }
- F5: { "supplierId": "smartgen", "n": 1001, "line": "speed running. If there is high temperature, low oil pressure, over speed and abnormal voltage" }
- F6: { "supplierId": "smartgen", "n": 1001, "line": "| 1 | Emergency Stop" }
- F7: { "supplierId": "smartgen", "n": 1001, "line": "| Battery Voltage (VB) | V" }
- F8: { "supplierId": "smartgen", "n": 1001, "line": "| 32(27) | Charging Failure Volt. | (0-30)V | 6.0" }
- F9: { "supplierId": "smartgen", "n": 1001, "line": "|  | Event log, real-time clock, scheduled start & stop function (can be set as start unit once a" }
- F10: { "supplierId": "smartgen", "n": 1001, "line": "Accumulated running hours" }
- F11: { "supplierId": "smartgen", "n": 1001, "line": "| Power factor | PF" }
- F12: { "supplierId": "smartgen", "n": 1001, "line": "Each and total active power kW" }
- F13: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" }
- F14: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" }
- F15: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" }
- F16: { "supplierId": "smartgen", "n": 1001, "line": "| 2023-10-16 | 2.2 | Added the RS485 baud rate setting and new AC system option" }
- F18: { "supplierId": "smartgen", "n": 1001, "line": "from front panel or use USB interface (or RS485 interface) to adjust via PC. It can be widely used in all" }
- F20: { "supplierId": "smartgen", "n": 1001, "line": "(HGM6110N/6120N/6110NC/6120NC/6110CAN/6120CAN)" }
- F22: { "supplierId": "smartgen", "n": 1001, "line": "remote start signal;" }
- F23: { "supplierId": "smartgen", "n": 1001, "line": "Fixed LCD contrast ratio description;" }
- F24: { "supplierId": "smartgen", "n": 1001, "line": "| 2 | DC input B+ | 2.5mm2 | over 30m, better to double wires in parallel. Max. 20A" }
- F25: { "supplierId": "smartgen", "n": 1001, "line": "| Fuel level (FL) | %" }
- F26: { "supplierId": "smartgen", "n": 1001, "line": "USER MANUAL" }
- không thấy dòng nào: F2, F17, F19, F21

## HGM6110NC
- F1: { "supplierId": "smartgen", "n": 1001, "line": "functions of over/under voltage, over/under frequency, over current and over power;" }
- F3: { "supplierId": "smartgen", "n": 1001, "line": "data (such as water temperature, oil pressure, speed and fuel consumption, etc.) but also can" }
- F4: { "supplierId": "smartgen", "n": 1001, "line": "of low oil pressure, high temperature, under speed, failed to charge and Aux. input (be configured)" }
- F5: { "supplierId": "smartgen", "n": 1001, "line": "speed running. If there is high temperature, low oil pressure, over speed and abnormal voltage" }
- F6: { "supplierId": "smartgen", "n": 1001, "line": "| 1 | Emergency Stop" }
- F7: { "supplierId": "smartgen", "n": 1001, "line": "| Battery Voltage (VB) | V" }
- F8: { "supplierId": "smartgen", "n": 1001, "line": "| 32(27) | Charging Failure Volt. | (0-30)V | 6.0" }
- F9: { "supplierId": "smartgen", "n": 1001, "line": "|  | Event log, real-time clock, scheduled start & stop function (can be set as start unit once a" }
- F10: { "supplierId": "smartgen", "n": 1001, "line": "Accumulated running hours" }
- F11: { "supplierId": "smartgen", "n": 1001, "line": "| Power factor | PF" }
- F12: { "supplierId": "smartgen", "n": 1001, "line": "Each and total active power kW" }
- F13: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" }
- F14: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" }
- F15: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" }
- F16: { "supplierId": "smartgen", "n": 1001, "line": "| 2023-10-16 | 2.2 | Added the RS485 baud rate setting and new AC system option" }
- F18: { "supplierId": "smartgen", "n": 1001, "line": "from front panel or use USB interface (or RS485 interface) to adjust via PC. It can be widely used in all" }
- F20: { "supplierId": "smartgen", "n": 1001, "line": "(HGM6110N/6120N/6110NC/6120NC/6110CAN/6120CAN)" }
- F22: { "supplierId": "smartgen", "n": 1001, "line": "remote start signal;" }
- F23: { "supplierId": "smartgen", "n": 1001, "line": "Fixed LCD contrast ratio description;" }
- F24: { "supplierId": "smartgen", "n": 1001, "line": "| 2 | DC input B+ | 2.5mm2 | over 30m, better to double wires in parallel. Max. 20A" }
- F25: { "supplierId": "smartgen", "n": 1001, "line": "| Fuel level (FL) | %" }
- F26: { "supplierId": "smartgen", "n": 1001, "line": "USER MANUAL" }
- không thấy dòng nào: F2, F17, F19, F21

## HGM6120CAN
- F1: { "supplierId": "smartgen", "n": 1001, "line": "functions of over/under voltage, over/under frequency, over current and over power;" }
- F3: { "supplierId": "smartgen", "n": 1001, "line": "data (such as water temperature, oil pressure, speed and fuel consumption, etc.) but also can" }
- F4: { "supplierId": "smartgen", "n": 1001, "line": "of low oil pressure, high temperature, under speed, failed to charge and Aux. input (be configured)" }
- F5: { "supplierId": "smartgen", "n": 1001, "line": "speed running. If there is high temperature, low oil pressure, over speed and abnormal voltage" }
- F6: { "supplierId": "smartgen", "n": 1001, "line": "| 1 | Emergency Stop" }
- F7: { "supplierId": "smartgen", "n": 1001, "line": "| Battery Voltage (VB) | V" }
- F8: { "supplierId": "smartgen", "n": 1001, "line": "| 32(27) | Charging Failure Volt. | (0-30)V | 6.0" }
- F9: { "supplierId": "smartgen", "n": 1001, "line": "|  | Event log, real-time clock, scheduled start & stop function (can be set as start unit once a" }
- F10: { "supplierId": "smartgen", "n": 1001, "line": "Accumulated running hours" }
- F11: { "supplierId": "smartgen", "n": 1001, "line": "| Power factor | PF" }
- F12: { "supplierId": "smartgen", "n": 1001, "line": "Each and total active power kW" }
- F13: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" }
- F14: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" }
- F15: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" }
- F16: { "supplierId": "smartgen", "n": 1001, "line": "| 2023-10-16 | 2.2 | Added the RS485 baud rate setting and new AC system option" }
- F18: { "supplierId": "smartgen", "n": 1001, "line": "from front panel or use USB interface (or RS485 interface) to adjust via PC. It can be widely used in all" }
- F20: { "supplierId": "smartgen", "n": 1001, "line": "(HGM6110N/6120N/6110NC/6120NC/6110CAN/6120CAN)" }
- F21: { "supplierId": "smartgen", "n": 1001, "line": "| monitoring and mains/generator automatic switching control (AMF), especially | suitable for" }
- F22: { "supplierId": "smartgen", "n": 1001, "line": "2) HGM6110: When “remote start” input is active, it enters into “Start Delay”." }
- F23: { "supplierId": "smartgen", "n": 1001, "line": "Fixed LCD contrast ratio description;" }
- F24: { "supplierId": "smartgen", "n": 1001, "line": "| 2 | DC input B+ | 2.5mm2 | over 30m, better to double wires in parallel. Max. 20A" }
- F25: { "supplierId": "smartgen", "n": 1001, "line": "| Fuel level (FL) | %" }
- F26: { "supplierId": "smartgen", "n": 1001, "line": "USER MANUAL" }
- không thấy dòng nào: F2, F17, F19

## HGM6110
- F1: { "supplierId": "smartgen", "n": 1001, "line": "functions of over/under voltage, over/under frequency, over current and over power;" } (datasheet HGM6110N: cần xác nhận đời)
- F3: { "supplierId": "smartgen", "n": 1001, "line": "data (such as water temperature, oil pressure, speed and fuel consumption, etc.) but also can" } (datasheet HGM6110N: cần xác nhận đời)
- F4: { "supplierId": "smartgen", "n": 1001, "line": "of low oil pressure, high temperature, under speed, failed to charge and Aux. input (be configured)" } (datasheet HGM6110N: cần xác nhận đời)
- F5: { "supplierId": "smartgen", "n": 1001, "line": "speed running. If there is high temperature, low oil pressure, over speed and abnormal voltage" } (datasheet HGM6110N: cần xác nhận đời)
- F6: { "supplierId": "smartgen", "n": 1001, "line": "| 1 | Emergency Stop" } (datasheet HGM6110N: cần xác nhận đời)
- F7: { "supplierId": "smartgen", "n": 1001, "line": "| Battery Voltage (VB) | V" } (datasheet HGM6110N: cần xác nhận đời)
- F8: { "supplierId": "smartgen", "n": 1001, "line": "| 32(27) | Charging Failure Volt. | (0-30)V | 6.0" } (datasheet HGM6110N: cần xác nhận đời)
- F9: { "supplierId": "smartgen", "n": 1001, "line": "|  | Event log, real-time clock, scheduled start & stop function (can be set as start unit once a" } (datasheet HGM6110N: cần xác nhận đời)
- F10: { "supplierId": "smartgen", "n": 1001, "line": "Accumulated running hours" } (datasheet HGM6110N: cần xác nhận đời)
- F11: { "supplierId": "smartgen", "n": 1001, "line": "| Power factor | PF" } (datasheet HGM6110N: cần xác nhận đời)
- F12: { "supplierId": "smartgen", "n": 1001, "line": "Each and total active power kW" } (datasheet HGM6110N: cần xác nhận đời)
- F13: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" } (datasheet HGM6110N: cần xác nhận đời)
- F14: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" } (datasheet HGM6110N: cần xác nhận đời)
- F15: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" } (datasheet HGM6110N: cần xác nhận đời)
- F16: { "supplierId": "smartgen", "n": 1001, "line": "| 2023-10-16 | 2.2 | Added the RS485 baud rate setting and new AC system option" } (datasheet HGM6110N: cần xác nhận đời)
- F18: { "supplierId": "smartgen", "n": 1001, "line": "from front panel or use USB interface (or RS485 interface) to adjust via PC. It can be widely used in all" } (datasheet HGM6110N: cần xác nhận đời)
- F20: { "supplierId": "smartgen", "n": 1001, "line": "(HGM6110N/6120N/6110NC/6120NC/6110CAN/6120CAN)" } (datasheet HGM6110N: cần xác nhận đời)
- F22: { "supplierId": "smartgen", "n": 1001, "line": "remote start signal;" } (datasheet HGM6110N: cần xác nhận đời)
- F23: { "supplierId": "smartgen", "n": 1001, "line": "Fixed LCD contrast ratio description;" } (datasheet HGM6110N: cần xác nhận đời)
- F24: { "supplierId": "smartgen", "n": 1001, "line": "| 2 | DC input B+ | 2.5mm2 | over 30m, better to double wires in parallel. Max. 20A" } (datasheet HGM6110N: cần xác nhận đời)
- F25: { "supplierId": "smartgen", "n": 1001, "line": "| Fuel level (FL) | %" } (datasheet HGM6110N: cần xác nhận đời)
- F26: { "supplierId": "smartgen", "n": 1001, "line": "USER MANUAL" } (datasheet HGM6110N: cần xác nhận đời)
- không thấy dòng nào: F2, F17, F19, F21

## HGM6120
- F1: { "supplierId": "smartgen", "n": 1001, "line": "functions of over/under voltage, over/under frequency, over current and over power;" } (datasheet HGM6120N: cần xác nhận đời)
- F3: { "supplierId": "smartgen", "n": 1001, "line": "data (such as water temperature, oil pressure, speed and fuel consumption, etc.) but also can" } (datasheet HGM6120N: cần xác nhận đời)
- F4: { "supplierId": "smartgen", "n": 1001, "line": "of low oil pressure, high temperature, under speed, failed to charge and Aux. input (be configured)" } (datasheet HGM6120N: cần xác nhận đời)
- F5: { "supplierId": "smartgen", "n": 1001, "line": "speed running. If there is high temperature, low oil pressure, over speed and abnormal voltage" } (datasheet HGM6120N: cần xác nhận đời)
- F6: { "supplierId": "smartgen", "n": 1001, "line": "| 1 | Emergency Stop" } (datasheet HGM6120N: cần xác nhận đời)
- F7: { "supplierId": "smartgen", "n": 1001, "line": "| Battery Voltage (VB) | V" } (datasheet HGM6120N: cần xác nhận đời)
- F8: { "supplierId": "smartgen", "n": 1001, "line": "| 32(27) | Charging Failure Volt. | (0-30)V | 6.0" } (datasheet HGM6120N: cần xác nhận đời)
- F9: { "supplierId": "smartgen", "n": 1001, "line": "|  | Event log, real-time clock, scheduled start & stop function (can be set as start unit once a" } (datasheet HGM6120N: cần xác nhận đời)
- F10: { "supplierId": "smartgen", "n": 1001, "line": "Accumulated running hours" } (datasheet HGM6120N: cần xác nhận đời)
- F11: { "supplierId": "smartgen", "n": 1001, "line": "| Power factor | PF" } (datasheet HGM6120N: cần xác nhận đời)
- F12: { "supplierId": "smartgen", "n": 1001, "line": "Each and total active power kW" } (datasheet HGM6120N: cần xác nhận đời)
- F13: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" } (datasheet HGM6120N: cần xác nhận đời)
- F14: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" } (datasheet HGM6120N: cần xác nhận đời)
- F15: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" } (datasheet HGM6120N: cần xác nhận đời)
- F16: { "supplierId": "smartgen", "n": 1001, "line": "| 2023-10-16 | 2.2 | Added the RS485 baud rate setting and new AC system option" } (datasheet HGM6120N: cần xác nhận đời)
- F18: { "supplierId": "smartgen", "n": 1001, "line": "from front panel or use USB interface (or RS485 interface) to adjust via PC. It can be widely used in all" } (datasheet HGM6120N: cần xác nhận đời)
- F20: { "supplierId": "smartgen", "n": 1001, "line": "(HGM6110N/6120N/6110NC/6120NC/6110CAN/6120CAN)" } (datasheet HGM6120N: cần xác nhận đời)
- F21: { "supplierId": "smartgen", "n": 1001, "line": "| monitoring and mains/generator automatic switching control (AMF), especially | suitable for" } (datasheet HGM6120N: cần xác nhận đời)
- F22: { "supplierId": "smartgen", "n": 1001, "line": "2) HGM6110: When “remote start” input is active, it enters into “Start Delay”." } (datasheet HGM6120N: cần xác nhận đời)
- F23: { "supplierId": "smartgen", "n": 1001, "line": "Fixed LCD contrast ratio description;" } (datasheet HGM6120N: cần xác nhận đời)
- F24: { "supplierId": "smartgen", "n": 1001, "line": "| 2 | DC input B+ | 2.5mm2 | over 30m, better to double wires in parallel. Max. 20A" } (datasheet HGM6120N: cần xác nhận đời)
- F25: { "supplierId": "smartgen", "n": 1001, "line": "| Fuel level (FL) | %" } (datasheet HGM6120N: cần xác nhận đời)
- F26: { "supplierId": "smartgen", "n": 1001, "line": "USER MANUAL" } (datasheet HGM6120N: cần xác nhận đời)
- không thấy dòng nào: F2, F17, F19

## HGM6120N
- F1: { "supplierId": "smartgen", "n": 1001, "line": "functions of over/under voltage, over/under frequency, over current and over power;" }
- F3: { "supplierId": "smartgen", "n": 1001, "line": "data (such as water temperature, oil pressure, speed and fuel consumption, etc.) but also can" }
- F4: { "supplierId": "smartgen", "n": 1001, "line": "of low oil pressure, high temperature, under speed, failed to charge and Aux. input (be configured)" }
- F5: { "supplierId": "smartgen", "n": 1001, "line": "speed running. If there is high temperature, low oil pressure, over speed and abnormal voltage" }
- F6: { "supplierId": "smartgen", "n": 1001, "line": "| 1 | Emergency Stop" }
- F7: { "supplierId": "smartgen", "n": 1001, "line": "| Battery Voltage (VB) | V" }
- F8: { "supplierId": "smartgen", "n": 1001, "line": "| 32(27) | Charging Failure Volt. | (0-30)V | 6.0" }
- F9: { "supplierId": "smartgen", "n": 1001, "line": "|  | Event log, real-time clock, scheduled start & stop function (can be set as start unit once a" }
- F10: { "supplierId": "smartgen", "n": 1001, "line": "Accumulated running hours" }
- F11: { "supplierId": "smartgen", "n": 1001, "line": "| Power factor | PF" }
- F12: { "supplierId": "smartgen", "n": 1001, "line": "Each and total active power kW" }
- F13: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" }
- F14: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" }
- F15: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" }
- F16: { "supplierId": "smartgen", "n": 1001, "line": "| 2023-10-16 | 2.2 | Added the RS485 baud rate setting and new AC system option" }
- F18: { "supplierId": "smartgen", "n": 1001, "line": "from front panel or use USB interface (or RS485 interface) to adjust via PC. It can be widely used in all" }
- F20: { "supplierId": "smartgen", "n": 1001, "line": "(HGM6110N/6120N/6110NC/6120NC/6110CAN/6120CAN)" }
- F21: { "supplierId": "smartgen", "n": 1001, "line": "| monitoring and mains/generator automatic switching control (AMF), especially | suitable for" }
- F22: { "supplierId": "smartgen", "n": 1001, "line": "2) HGM6110: When “remote start” input is active, it enters into “Start Delay”." }
- F23: { "supplierId": "smartgen", "n": 1001, "line": "Fixed LCD contrast ratio description;" }
- F24: { "supplierId": "smartgen", "n": 1001, "line": "| 2 | DC input B+ | 2.5mm2 | over 30m, better to double wires in parallel. Max. 20A" }
- F25: { "supplierId": "smartgen", "n": 1001, "line": "| Fuel level (FL) | %" }
- F26: { "supplierId": "smartgen", "n": 1001, "line": "USER MANUAL" }
- không thấy dòng nào: F2, F17, F19
