# Tra cứu sẵn: chức năng bộ điều khiển HSMT nêu × datasheet

Code dò trước bằng đúng bộ từ khoá mà lệnh check dùng để gợi ý dòng (CÓ THỂ TRA ĐƯỢC). Đây chỉ là chỉ dẫn tìm: đọc dòng, tự kết luận đạt / không đạt / chưa rõ; "không thấy dòng nào" chỉ nghĩa là không dòng nào có các từ khoá đó — muốn chắc thì grep controllers.md bằng từ khác. Câu trích và factSrc vẫn được check kiểm như cũ.

## Chức năng HSMT nêu (dòng HSMT đầu tiên có chữ đó)

- F1: "1\tMáy phát điện 100kVA\tBộ\t1\tDHY110K SE\tHuyndai\tHuyndai\tTrung Quốc hoặc tương đương\tTừ 2026 trở về sau\tI Thông số kỹ thuật chung tổ máy phát điện 1 Loại máy Máy " — từ khoá datasheet: over\s?-?voltage|high voltage
- F2: "1\tMáy phát điện 100kVA\tBộ\t1\tDHY110K SE\tHuyndai\tHuyndai\tTrung Quốc hoặc tương đương\tTừ 2026 trở về sau\tI Thông số kỹ thuật chung tổ máy phát điện 1 Loại máy Máy " — từ khoá datasheet: overload|over\s?-?current|over\s?-?power
- F3: "1\tMáy phát điện 100kVA\tBộ\t1\tDHY110K SE\tHuyndai\tHuyndai\tTrung Quốc hoặc tương đương\tTừ 2026 trở về sau\tI Thông số kỹ thuật chung tổ máy phát điện 1 Loại máy Máy " — từ khoá datasheet: short\s?-?circuit
- F4: "1\tMáy phát điện 100kVA\tBộ\t1\tDHY110K SE\tHuyndai\tHuyndai\tTrung Quốc hoặc tương đương\tTừ 2026 trở về sau\tI Thông số kỹ thuật chung tổ máy phát điện 1 Loại máy Máy " — từ khoá datasheet: oil pressure
- F5: "1\tMáy phát điện 100kVA\tBộ\t1\tDHY110K SE\tHuyndai\tHuyndai\tTrung Quốc hoặc tương đương\tTừ 2026 trở về sau\tI Thông số kỹ thuật chung tổ máy phát điện 1 Loại máy Máy " — từ khoá datasheet: coolant temp|engine temp|high temp
- F6: "1\tMáy phát điện 100kVA\tBộ\t1\tDHY110K SE\tHuyndai\tHuyndai\tTrung Quốc hoặc tương đương\tTừ 2026 trở về sau\tI Thông số kỹ thuật chung tổ máy phát điện 1 Loại máy Máy " — từ khoá datasheet: over\s?-?speed
- F7: "1\tMáy phát điện 100kVA\tBộ\t1\tDHY110K SE\tHuyndai\tHuyndai\tTrung Quốc hoặc tương đương\tTừ 2026 trở về sau\tI Thông số kỹ thuật chung tổ máy phát điện 1 Loại máy Máy " — từ khoá datasheet: battery (voltage|under|over|low|high)|plant supply|(low|high) battery
- F8: "1\tMáy phát điện 100kVA\tBộ\t1\tDHY110K SE\tHuyndai\tHuyndai\tTrung Quốc hoặc tương đương\tTừ 2026 trở về sau\tI Thông số kỹ thuật chung tổ máy phát điện 1 Loại máy Máy " — từ khoá datasheet: event log|events
- F9: "1\tMáy phát điện 100kVA\tBộ\t1\tDHY110K SE\tHuyndai\tHuyndai\tTrung Quốc hoặc tương đương\tTừ 2026 trở về sau\tI Thông số kỹ thuật chung tổ máy phát điện 1 Loại máy Máy " — từ khoá datasheet: engine hours|hours run|running hours|run time|hour meter
- F10: "1\tMáy phát điện 100kVA\tBộ\t1\tDHY110K SE\tHuyndai\tHuyndai\tTrung Quốc hoặc tương đương\tTừ 2026 trở về sau\tI Thông số kỹ thuật chung tổ máy phát điện 1 Loại máy Máy " — từ khoá datasheet: power factor|\bpf\b
- F11: "1\tMáy phát điện 100kVA\tBộ\t1\tDHY110K SE\tHuyndai\tHuyndai\tTrung Quốc hoặc tương đương\tTừ 2026 trở về sau\tI Thông số kỹ thuật chung tổ máy phát điện 1 Loại máy Máy " — từ khoá datasheet: \bkW\b|\bkVA\b|\bkvar\b
- F12: "1\tMáy phát điện 100kVA\tBộ\t1\tDHY110K SE\tHuyndai\tHuyndai\tTrung Quốc hoặc tương đương\tTừ 2026 trở về sau\tI Thông số kỹ thuật chung tổ máy phát điện 1 Loại máy Máy " — từ khoá datasheet: voltage (measurement|range|sensing)|(generator|mains|bus|phase).{0,20}voltage|\bVs?(L-?L|L-?N|ph-?ph|ph-?n)\b
- F13: "1\tMáy phát điện 100kVA\tBộ\t1\tDHY110K SE\tHuyndai\tHuyndai\tTrung Quốc hoặc tương đương\tTừ 2026 trở về sau\tI Thông số kỹ thuật chung tổ máy phát điện 1 Loại máy Máy " — từ khoá datasheet: current (measurement|sensing|range)|\bCT\b|(generator|phase|load).{0,15}current
- F14: "1\tMáy phát điện 100kVA\tBộ\t1\tDHY110K SE\tHuyndai\tHuyndai\tTrung Quốc hoặc tương đương\tTừ 2026 trở về sau\tI Thông số kỹ thuật chung tổ máy phát điện 1 Loại máy Máy " — từ khoá datasheet: frequency
- F15: "1\tMáy phát điện 100kVA\tBộ\t1\tDHY110K SE\tHuyndai\tHuyndai\tTrung Quốc hoặc tương đương\tTừ 2026 trở về sau\tI Thông số kỹ thuật chung tổ máy phát điện 1 Loại máy Máy " — từ khoá datasheet: USB
- F16: "3     Máy photocopy Canon iR 2925i (3 trong 1)                 Bộ            01" — từ khoá datasheet: J1939|CAN
- F17: "1\tMáy phát điện 100kVA\tBộ\t1\tDHY110K SE\tHuyndai\tHuyndai\tTrung Quốc hoặc tương đương\tTừ 2026 trở về sau\tI Thông số kỹ thuật chung tổ máy phát điện 1 Loại máy Máy " — từ khoá datasheet: AMF|mains (\(utility\) )?fail|automatic mains
- F18: "1\tMáy phát điện 100kVA\tBộ\t1\tDHY110K SE\tHuyndai\tHuyndai\tTrung Quốc hoặc tương đương\tTừ 2026 trở về sau\tI Thông số kỹ thuật chung tổ máy phát điện 1 Loại máy Máy " — từ khoá datasheet: auto start|remote start
- F19: "1\tMáy phát điện 100kVA\tBộ\t1\tDHY110K SE\tHuyndai\tHuyndai\tTrung Quốc hoặc tương đương\tTừ 2026 trở về sau\tI Thông số kỹ thuật chung tổ máy phát điện 1 Loại máy Máy " — từ khoá datasheet: \bLCD\b|graphic display|display (size|type|resolution)
- F20: "1\tMáy phát điện 100kVA\tBộ\t1\tDHY110K SE\tHuyndai\tHuyndai\tTrung Quốc hoặc tương đương\tTừ 2026 trở về sau\tI Thông số kỹ thuật chung tổ máy phát điện 1 Loại máy Máy " — từ khoá datasheet: synchron|load ?shar|parallel
- F21: "1\tMáy phát điện 100kVA\tBộ\t1\tDHY110K SE\tHuyndai\tHuyndai\tTrung Quốc hoặc tương đương\tTừ 2026 trở về sau\tI Thông số kỹ thuật chung tổ máy phát điện 1 Loại máy Máy " — từ khoá datasheet: fuel level|low fuel
- F22: "1\tMáy phát điện 100kVA\tBộ\t1\tDHY110K SE\tHuyndai\tHuyndai\tTrung Quốc hoặc tương đương\tTừ 2026 trở về sau\tI Thông số kỹ thuật chung tổ máy phát điện 1 Loại máy Máy " — từ khoá datasheet: \bmanual\b|\bauto\b mode|stop\/reset

## AMF9
- F1: { "supplierId": "comap", "n": 1012, "line": "| Overvoltage | 59" } (datasheet InteliLite 4 AMF9: cần xác nhận đời)
- F2: { "supplierId": "comap", "n": 1012, "line": "| Overcurrent | 50/50TD" } (datasheet InteliLite 4 AMF9: cần xác nhận đời)
- F6: { "supplierId": "comap", "n": 1012, "line": "| Overspeed | 12" } (datasheet InteliLite 4 AMF9: cần xác nhận đời)
- F7: { "supplierId": "comap", "n": 1012, "line": "| Aux Battery Under Voltage | 27X" } (datasheet InteliLite 4 AMF9: cần xác nhận đời)
- F12: { "supplierId": "comap", "n": 1012, "line": "| Voltage measurement | 4 Vpk-pk to 50 Vpk-pk in range 4 Hz to 1 kHz" } (datasheet InteliLite 4 AMF9: cần xác nhận đời)
- F13: { "supplierId": "comap", "n": 1012, "line": "Current measurement" } (datasheet InteliLite 4 AMF9: cần xác nhận đời)
- F14: { "supplierId": "comap", "n": 1012, "line": "| User defined protections and setpoints, integrated PLC logic | Alternative configurations for genset with variable voltage and frequency" } (datasheet InteliLite 4 AMF9: cần xác nhận đời)
- F15: { "supplierId": "comap", "n": 1012, "line": "| Built-in USB device, CAN interfaces | Application overview" } (datasheet InteliLite 4 AMF9: cần xác nhận đời)
- F16: { "supplierId": "comap", "n": 1012, "line": "| Built-in USB device, CAN interfaces | Application overview" } (datasheet InteliLite 4 AMF9: cần xác nhận đời)
- F17: { "supplierId": "comap", "n": 1012, "line": "AMF 9" } (datasheet InteliLite 4 AMF9: cần xác nhận đời)
- không thấy dòng nào: F3, F4, F5, F8, F9, F10, F11, F18, F19, F20, F21, F22

## DSE7320
- F12: { "supplierId": "deep-sea-electronics", "n": 1001, "line": "Voltage Measurement" } (datasheet DSE7320 MKII: cần xác nhận đời)
- F13: { "supplierId": "deep-sea-electronics", "n": 1001, "line": "Current Measurement" } (datasheet DSE7320 MKII: cần xác nhận đời)
- F14: { "supplierId": "deep-sea-electronics", "n": 1001, "line": "| Frequency Range | 3.5 Hz to 75 Hz" } (datasheet DSE7320 MKII: cần xác nhận đời)
- F15: { "supplierId": "deep-sea-electronics", "n": 1001, "line": "The DSE7320 MKII will also monitor the mains (utility) supply. The modules include USB, RS232 and RS485 ports as well as dedicated DSENet®" } (datasheet DSE7320 MKII: cần xác nhận đời)
- F16: { "supplierId": "deep-sea-electronics", "n": 1001, "line": "terminals for system expansion. Both modules are compatible with electronic (CAN) and non-electronic (magnetic pick-up/alternator sensing) engines" } (datasheet DSE7320 MKII: cần xác nhận đời)
- F17: { "supplierId": "deep-sea-electronics", "n": 1001, "line": "The DSE7310 MKII is an auto start control module and the DSE7320 MKII is an auto mains (utility) failure control module suitable for a wide variety of" } (datasheet DSE7320 MKII: cần xác nhận đời)
- F18: { "supplierId": "deep-sea-electronics", "n": 1001, "line": "| DSE7310 MKII Auto Start & DSE7320 MKII | Auto" } (datasheet DSE7320 MKII: cần xác nhận đời)
- F19: { "supplierId": "deep-sea-electronics", "n": 1001, "line": "engine status information on the back-lit LCD screen, illuminated LEDs and remote PC." } (datasheet DSE7320 MKII: cần xác nhận đời)
- F22: { "supplierId": "deep-sea-electronics", "n": 1001, "line": "| • | Manual front panel and automatic control modes" } (datasheet DSE7320 MKII: cần xác nhận đời)
- không thấy dòng nào: F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F20, F21

## DSE6020
- F5: { "supplierId": "deep-sea-electronics", "n": 1007, "line": "| pressure, coolant temperature, | major axes" } (datasheet DSE6020 MKII: cần xác nhận đời)
- F13: { "supplierId": "deep-sea-electronics", "n": 1007, "line": "| LOAD CURRENT | 1 OF 4" } (datasheet DSE6020 MKII: cần xác nhận đời)
- F14: { "supplierId": "deep-sea-electronics", "n": 1007, "line": "| frequency, voltage, current, power | Through USB Communication both | 8 Hz to 500 Hz @ 2 GN" } (datasheet DSE6020 MKII: cần xác nhận đời)
- F15: { "supplierId": "deep-sea-electronics", "n": 1007, "line": "| frequency, voltage, current, power | Through USB Communication both | 8 Hz to 500 Hz @ 2 GN" } (datasheet DSE6020 MKII: cần xác nhận đời)
- F16: { "supplierId": "deep-sea-electronics", "n": 1007, "line": "| and fuel level, the modules give | modules can be configured using | 6010-04" } (datasheet DSE6020 MKII: cần xác nhận đời)
- F17: { "supplierId": "deep-sea-electronics", "n": 1007, "line": "| AUTO START AND AUTO MAINS FAILURE | ELECTRO-MAGNETIC COMPATIBILITY" } (datasheet DSE6020 MKII: cần xác nhận đời)
- F18: { "supplierId": "deep-sea-electronics", "n": 1007, "line": "| AUTO START AND AUTO MAINS FAILURE | ELECTRO-MAGNETIC COMPATIBILITY" } (datasheet DSE6020 MKII: cần xác nhận đời)
- F19: { "supplierId": "deep-sea-electronics", "n": 1007, "line": "| indicated on a large back-lit LCD | front panel editor. | at 95% RH 48 Hours" } (datasheet DSE6020 MKII: cần xác nhận đời)
- F21: { "supplierId": "deep-sea-electronics", "n": 1007, "line": "| and fuel level, the modules give | modules can be configured using | 6010-04" } (datasheet DSE6020 MKII: cần xác nhận đời)
- F22: { "supplierId": "deep-sea-electronics", "n": 1007, "line": "| DSE6010/20 MKII Operator Manual | 057-230" } (datasheet DSE6020 MKII: cần xác nhận đời)
- không thấy dòng nào: F1, F2, F3, F4, F6, F7, F8, F9, F10, F11, F12, F20

## HGM6110
- F1: { "supplierId": "smartgen", "n": 1001, "line": "| Insulation Intensity | Apply AC2.2kV voltage between high voltage terminal and low voltage" } (datasheet HGM6110N: cần xác nhận đời)
- F2: { "supplierId": "smartgen", "n": 1001, "line": "functions of over/under voltage, over/under frequency, over current and over power;" } (datasheet HGM6110N: cần xác nhận đời)
- F4: { "supplierId": "smartgen", "n": 1001, "line": "data (such as water temperature, oil pressure, speed and fuel consumption, etc.) but also can" } (datasheet HGM6110N: cần xác nhận đời)
- F5: { "supplierId": "smartgen", "n": 1001, "line": "of low oil pressure, high temperature, under speed, failed to charge and Aux. input (be configured)" } (datasheet HGM6110N: cần xác nhận đời)
- F6: { "supplierId": "smartgen", "n": 1001, "line": "speed running. If there is high temperature, low oil pressure, over speed and abnormal voltage" } (datasheet HGM6110N: cần xác nhận đời)
- F7: { "supplierId": "smartgen", "n": 1001, "line": "| Battery Voltage (VB) | V" } (datasheet HGM6110N: cần xác nhận đời)
- F8: { "supplierId": "smartgen", "n": 1001, "line": "|  | Event log, real-time clock, scheduled start & stop function (can be set as start unit once a" } (datasheet HGM6110N: cần xác nhận đời)
- F9: { "supplierId": "smartgen", "n": 1001, "line": "Accumulated running hours" } (datasheet HGM6110N: cần xác nhận đời)
- F10: { "supplierId": "smartgen", "n": 1001, "line": "| Power factor | PF" } (datasheet HGM6110N: cần xác nhận đời)
- F11: { "supplierId": "smartgen", "n": 1001, "line": "Each and total active power kW" } (datasheet HGM6110N: cần xác nhận đời)
- F12: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" } (datasheet HGM6110N: cần xác nhận đời)
- F13: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" } (datasheet HGM6110N: cần xác nhận đời)
- F14: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" } (datasheet HGM6110N: cần xác nhận đời)
- F15: { "supplierId": "smartgen", "n": 1001, "line": "from front panel or use USB interface (or RS485 interface) to adjust via PC. It can be widely used in all" } (datasheet HGM6110N: cần xác nhận đời)
- F16: { "supplierId": "smartgen", "n": 1001, "line": "(HGM6110N/6120N/6110NC/6120NC/6110CAN/6120CAN)" } (datasheet HGM6110N: cần xác nhận đời)
- F18: { "supplierId": "smartgen", "n": 1001, "line": "remote start signal;" } (datasheet HGM6110N: cần xác nhận đời)
- F19: { "supplierId": "smartgen", "n": 1001, "line": "Fixed LCD contrast ratio description;" } (datasheet HGM6110N: cần xác nhận đời)
- F20: { "supplierId": "smartgen", "n": 1001, "line": "| 2 | DC input B+ | 2.5mm2 | over 30m, better to double wires in parallel. Max. 20A" } (datasheet HGM6110N: cần xác nhận đời)
- F21: { "supplierId": "smartgen", "n": 1001, "line": "| Fuel level (FL) | %" } (datasheet HGM6110N: cần xác nhận đời)
- F22: { "supplierId": "smartgen", "n": 1001, "line": "USER MANUAL" } (datasheet HGM6110N: cần xác nhận đời)
- không thấy dòng nào: F3, F17

## DSE8610
- F8: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "System alarms are annunciated on the LCD screen (multiple language options available), illuminated LED and audible sounder. The event log records" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F9: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "load change, genset optimisation and balancing of engine hours" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F12: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "Voltage Measurement" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F13: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "| Current Range | 0 | A to 1" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F14: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "| Frequency Range | 3.5 Hz to 75 Hz" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F15: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "| USB A | 1 Data Storage Port" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F16: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "| CAN | 3 Fully Isolated CAN Ports" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F17: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "| • | Mains (utility) failure detection including mains (utility) decoupling" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F18: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "The DSE8610 MKII is a market-leading Synchronising Auto Start Control Module suitable for use in a multi-generator loadshare system, designed to" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F19: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "System alarms are annunciated on the LCD screen (multiple language options available), illuminated LED and audible sounder. The event log records" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F20: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "| DSE8610 MKII Synchronising & Load Sharing | Auto" } (datasheet DSE8610 MKII: cần xác nhận đời)
- F22: { "supplierId": "deep-sea-electronics", "n": 1004, "line": "| • | Manual front panel and automatic control modes" } (datasheet DSE8610 MKII: cần xác nhận đời)
- không thấy dòng nào: F1, F2, F3, F4, F5, F6, F7, F10, F11, F21

## HGM9510
- F1: { "supplierId": "smartgen", "n": 1003, "line": "generator, controller has over voltage, under voltage, over frequency, under frequency, over current," }
- F2: { "supplierId": "smartgen", "n": 1003, "line": "generator, controller has over voltage, under voltage, over frequency, under frequency, over current," }
- F4: { "supplierId": "smartgen", "n": 1003, "line": "frequently-used data (such as water temperature, oil pressure, engine speed, fuel consumption and" }
- F5: { "supplierId": "smartgen", "n": 1003, "line": "|  | Metal fixing clips enable perfect in high temperature environment;" }
- F6: { "supplierId": "smartgen", "n": 1003, "line": "low oil pressure, over speed and abnormal voltage during generator running, controller can protect" }
- F7: { "supplierId": "smartgen", "n": 1003, "line": "| Battery Voltage (VB) | V (unit)" }
- F8: { "supplierId": "smartgen", "n": 1003, "line": "| Event Log | ●" }
- F9: { "supplierId": "smartgen", "n": 1003, "line": "|  | Accumulative total run time and total electric energy of A and B. Users can reset it as 0 and" }
- F10: { "supplierId": "smartgen", "n": 1003, "line": "total apparent power, each phase and average power factor (positive and negative), accumulated" }
- F12: { "supplierId": "smartgen", "n": 1003, "line": "1. Modify the description of GOV and AVR voltage range SW2 in" }
- F13: { "supplierId": "smartgen", "n": 1003, "line": "|  | Collects and shows 3-phase voltage, current, power parameter and frequency of Bus/Gens;" }
- F14: { "supplierId": "smartgen", "n": 1003, "line": "voltage 120/240V and frequency 50/60Hz;" }
- F15: { "supplierId": "smartgen", "n": 1003, "line": "17 USB .......................................................................................................................................................... 76" }
- F16: { "supplierId": "smartgen", "n": 1003, "line": "16 CONNECTIONS OF CONTROLLER WITH J1939 ENGINE..................................................................... 66" }
- F17: { "supplierId": "smartgen", "n": 1003, "line": "| AMF | ●" }
- F18: { "supplierId": "smartgen", "n": 1003, "line": "5.4 AUTO START/STOP OPERATION ..................................................................................................... 18" }
- F19: { "supplierId": "smartgen", "n": 1003, "line": "5.3 LCD DISPLAY ..................................................................................................................................... 13" }
- F20: { "supplierId": "smartgen", "n": 1003, "line": "GENSET PARALLEL (WITH GENSET) CONTROLLER" }
- F21: { "supplierId": "smartgen", "n": 1003, "line": "|  | 2 configurable sensors can be set as sensor of temperature, oil pressure or fuel level;" }
- F22: { "supplierId": "smartgen", "n": 1003, "line": "USER MANUAL" }
- không thấy dòng nào: F3, F11

## DSE3110
- F7: { "supplierId": "deep-sea-electronics", "n": 1006, "line": "| • | Battery voltage display" }
- F12: { "supplierId": "deep-sea-electronics", "n": 1006, "line": "| • | Generator voltage display" }
- F14: { "supplierId": "deep-sea-electronics", "n": 1006, "line": "frequency, voltage and engine run hours and also displays the warning and shutdown status." }
- F15: { "supplierId": "deep-sea-electronics", "n": 1006, "line": "| USB B | 1 Programmable Port" }
- F16: { "supplierId": "deep-sea-electronics", "n": 1006, "line": "The DSE3110 can be utilised as a manual or auto start module for single gen-set applications or engine only applications. The module has been" }
- F18: { "supplierId": "deep-sea-electronics", "n": 1006, "line": "DSE3110 Manual & Auto Start Control Module" }
- F19: { "supplierId": "deep-sea-electronics", "n": 1006, "line": "The DSE3110 includes a back-lit icon LCD display which clearly shows the status of the generator set at all times. The module monitors engine speed," }
- F22: { "supplierId": "deep-sea-electronics", "n": 1006, "line": "DSE3110 Manual & Auto Start Control Module" }
- không thấy dòng nào: F1, F2, F3, F4, F5, F6, F8, F9, F10, F11, F13, F17, F20, F21

## InteliGen
- F1: { "supplierId": "comap", "n": 1004, "line": "| Overvoltage | 59" } (datasheet InteliGen NT: cần xác nhận đời)
- F2: { "supplierId": "comap", "n": 1004, "line": "| Overload | 32" } (datasheet InteliGen NT: cần xác nhận đời)
- F6: { "supplierId": "comap", "n": 1006, "line": "| Overspeed | 12" } (datasheet InteliGen NT: cần xác nhận đời)
- F7: { "supplierId": "comap", "n": 1008, "line": "| Aux Battery Under Voltage | 27X" } (datasheet InteliGen 500: cần xác nhận đời)
- F10: { "supplierId": "comap", "n": 1004, "line": "| Power factor | 55" } (datasheet InteliGen NT: cần xác nhận đời)
- F12: { "supplierId": "comap", "n": 1004, "line": "| Voltage measurement | measurement | 0.2 %" } (datasheet InteliGen NT: cần xác nhận đời)
- F13: { "supplierId": "comap", "n": 1004, "line": "| Current measurement | PWM | 500÷3000 Hz / 5 V / max. 10 mA" } (datasheet InteliGen NT: cần xác nhận đời)
- F14: { "supplierId": "comap", "n": 1004, "line": "Frequency input" } (datasheet InteliGen NT: cần xác nhận đời)
- F15: { "supplierId": "comap", "n": 1004, "line": "| InteliVision 8 | Color 8\" display for advanced monitoring, control & trending, USB capable | INTELIVISION 8" } (datasheet InteliGen NT: cần xác nhận đời)
- F16: { "supplierId": "comap", "n": 1004, "line": "Load sharing and VAr sharing via CAN" } (datasheet InteliGen NT: cần xác nhận đời)
- F20: { "supplierId": "comap", "n": 1004, "line": "| Comprehensive paralleling gen-set controller | Extendable with ComAp's extension modules" } (datasheet InteliGen NT: cần xác nhận đời)
- không thấy dòng nào: F3, F4, F5, F8, F9, F11, F17, F18, F19, F21, F22

## HGM6110N
- F1: { "supplierId": "smartgen", "n": 1001, "line": "| Insulation Intensity | Apply AC2.2kV voltage between high voltage terminal and low voltage" }
- F2: { "supplierId": "smartgen", "n": 1001, "line": "functions of over/under voltage, over/under frequency, over current and over power;" }
- F4: { "supplierId": "smartgen", "n": 1001, "line": "data (such as water temperature, oil pressure, speed and fuel consumption, etc.) but also can" }
- F5: { "supplierId": "smartgen", "n": 1001, "line": "of low oil pressure, high temperature, under speed, failed to charge and Aux. input (be configured)" }
- F6: { "supplierId": "smartgen", "n": 1001, "line": "speed running. If there is high temperature, low oil pressure, over speed and abnormal voltage" }
- F7: { "supplierId": "smartgen", "n": 1001, "line": "| Battery Voltage (VB) | V" }
- F8: { "supplierId": "smartgen", "n": 1001, "line": "|  | Event log, real-time clock, scheduled start & stop function (can be set as start unit once a" }
- F9: { "supplierId": "smartgen", "n": 1001, "line": "Accumulated running hours" }
- F10: { "supplierId": "smartgen", "n": 1001, "line": "| Power factor | PF" }
- F11: { "supplierId": "smartgen", "n": 1001, "line": "Each and total active power kW" }
- F12: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" }
- F13: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" }
- F14: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" }
- F15: { "supplierId": "smartgen", "n": 1001, "line": "from front panel or use USB interface (or RS485 interface) to adjust via PC. It can be widely used in all" }
- F16: { "supplierId": "smartgen", "n": 1001, "line": "(HGM6110N/6120N/6110NC/6120NC/6110CAN/6120CAN)" }
- F18: { "supplierId": "smartgen", "n": 1001, "line": "remote start signal;" }
- F19: { "supplierId": "smartgen", "n": 1001, "line": "Fixed LCD contrast ratio description;" }
- F20: { "supplierId": "smartgen", "n": 1001, "line": "| 2 | DC input B+ | 2.5mm2 | over 30m, better to double wires in parallel. Max. 20A" }
- F21: { "supplierId": "smartgen", "n": 1001, "line": "| Fuel level (FL) | %" }
- F22: { "supplierId": "smartgen", "n": 1001, "line": "USER MANUAL" }
- không thấy dòng nào: F3, F17

## HGM6110NC
- F1: { "supplierId": "smartgen", "n": 1001, "line": "| Insulation Intensity | Apply AC2.2kV voltage between high voltage terminal and low voltage" }
- F2: { "supplierId": "smartgen", "n": 1001, "line": "functions of over/under voltage, over/under frequency, over current and over power;" }
- F4: { "supplierId": "smartgen", "n": 1001, "line": "data (such as water temperature, oil pressure, speed and fuel consumption, etc.) but also can" }
- F5: { "supplierId": "smartgen", "n": 1001, "line": "of low oil pressure, high temperature, under speed, failed to charge and Aux. input (be configured)" }
- F6: { "supplierId": "smartgen", "n": 1001, "line": "speed running. If there is high temperature, low oil pressure, over speed and abnormal voltage" }
- F7: { "supplierId": "smartgen", "n": 1001, "line": "| Battery Voltage (VB) | V" }
- F8: { "supplierId": "smartgen", "n": 1001, "line": "|  | Event log, real-time clock, scheduled start & stop function (can be set as start unit once a" }
- F9: { "supplierId": "smartgen", "n": 1001, "line": "Accumulated running hours" }
- F10: { "supplierId": "smartgen", "n": 1001, "line": "| Power factor | PF" }
- F11: { "supplierId": "smartgen", "n": 1001, "line": "Each and total active power kW" }
- F12: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" }
- F13: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" }
- F14: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" }
- F15: { "supplierId": "smartgen", "n": 1001, "line": "from front panel or use USB interface (or RS485 interface) to adjust via PC. It can be widely used in all" }
- F16: { "supplierId": "smartgen", "n": 1001, "line": "(HGM6110N/6120N/6110NC/6120NC/6110CAN/6120CAN)" }
- F18: { "supplierId": "smartgen", "n": 1001, "line": "remote start signal;" }
- F19: { "supplierId": "smartgen", "n": 1001, "line": "Fixed LCD contrast ratio description;" }
- F20: { "supplierId": "smartgen", "n": 1001, "line": "| 2 | DC input B+ | 2.5mm2 | over 30m, better to double wires in parallel. Max. 20A" }
- F21: { "supplierId": "smartgen", "n": 1001, "line": "| Fuel level (FL) | %" }
- F22: { "supplierId": "smartgen", "n": 1001, "line": "USER MANUAL" }
- không thấy dòng nào: F3, F17

## HGM6120CAN
- F1: { "supplierId": "smartgen", "n": 1001, "line": "| Insulation Intensity | Apply AC2.2kV voltage between high voltage terminal and low voltage" }
- F2: { "supplierId": "smartgen", "n": 1001, "line": "functions of over/under voltage, over/under frequency, over current and over power;" }
- F4: { "supplierId": "smartgen", "n": 1001, "line": "data (such as water temperature, oil pressure, speed and fuel consumption, etc.) but also can" }
- F5: { "supplierId": "smartgen", "n": 1001, "line": "of low oil pressure, high temperature, under speed, failed to charge and Aux. input (be configured)" }
- F6: { "supplierId": "smartgen", "n": 1001, "line": "speed running. If there is high temperature, low oil pressure, over speed and abnormal voltage" }
- F7: { "supplierId": "smartgen", "n": 1001, "line": "| Battery Voltage (VB) | V" }
- F8: { "supplierId": "smartgen", "n": 1001, "line": "|  | Event log, real-time clock, scheduled start & stop function (can be set as start unit once a" }
- F9: { "supplierId": "smartgen", "n": 1001, "line": "Accumulated running hours" }
- F10: { "supplierId": "smartgen", "n": 1001, "line": "| Power factor | PF" }
- F11: { "supplierId": "smartgen", "n": 1001, "line": "Each and total active power kW" }
- F12: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" }
- F13: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" }
- F14: { "supplierId": "smartgen", "n": 1001, "line": " Can measure and display 3 phase voltage, 3 phase current, frequency, power parameter of" }
- F15: { "supplierId": "smartgen", "n": 1001, "line": "from front panel or use USB interface (or RS485 interface) to adjust via PC. It can be widely used in all" }
- F16: { "supplierId": "smartgen", "n": 1001, "line": "(HGM6110N/6120N/6110NC/6120NC/6110CAN/6120CAN)" }
- F17: { "supplierId": "smartgen", "n": 1001, "line": "| monitoring and mains/generator automatic switching control (AMF), especially | suitable for" }
- F18: { "supplierId": "smartgen", "n": 1001, "line": "2) HGM6110: When “remote start” input is active, it enters into “Start Delay”." }
- F19: { "supplierId": "smartgen", "n": 1001, "line": "Fixed LCD contrast ratio description;" }
- F20: { "supplierId": "smartgen", "n": 1001, "line": "| 2 | DC input B+ | 2.5mm2 | over 30m, better to double wires in parallel. Max. 20A" }
- F21: { "supplierId": "smartgen", "n": 1001, "line": "| Fuel level (FL) | %" }
- F22: { "supplierId": "smartgen", "n": 1001, "line": "USER MANUAL" }
- không thấy dòng nào: F3

