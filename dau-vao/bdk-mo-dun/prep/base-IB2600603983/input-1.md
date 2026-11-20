# Gói thầu IB2600603983

Công suất đọc được: 700 kVA (chỉ để lọc danh mục; yêu cầu thật lấy từ HSMT)
Lệnh lưu trang web: node "C:\Projects\GenSet Pro\wt-bdk-base\suppliers\config-bot.mjs" save --dir . --url "<url>"
Lệnh kiểm tra result.json: node "C:\Projects\GenSet Pro\wt-bdk-base\suppliers\config-bot.mjs" check --dir .
Lệnh kiểm tra newCatalog.json (khi có): node "C:\Projects\GenSet Pro\wt-bdk-base\suppliers\config-bot.mjs" find-check --dir .



## Mã yêu cầu (bắt buộc: mỗi requirement có `code` từ bảng này; code quyết định `item`, `part`, `level`; không có mã nào hợp thì `other` với item tự đặt)
| code | item (tên dùng trong result.json) | part | level | kind |
|---|---|---|---|---|
| power_prime | Công suất liên tục | genset | core | model |
| power_standby | Công suất dự phòng | genset | core | model |
| fuel_consumption_75 | Tiêu hao nhiên liệu 75% tải | genset | core | model |
| fuel_consumption_50 | Tiêu hao nhiên liệu 50% tải | genset | core | model |
| fuel_consumption | Tiêu hao nhiên liệu 100% tải | genset | core | model |
| overload | Khả năng quá tải | genset | core | model |
| load_step | Nhận tải một bước | genset | core | model |
| iso8528_class | Cấp vận hành ISO 8528-5 (G2/G3) | genset | core | model |
| standards | Tiêu chuẩn, chứng nhận tổ máy (ISO 3046, IEC 60034, CE, ISO 9001) | genset | core | document |
| prototype | Thử nghiệm mẫu (prototype test) | genset | core | document |
| genset_make | Hãng sản xuất tổ máy | genset | core | model |
| genset_model | Model tổ máy | genset | core | model |
| genset_origin | Xuất xứ tổ máy | genset | core | model |
| alt_vreg | Ổn định điện áp | alternator | core | model |
| freq_regulation | Ổn định tần số | genset | core | model |
| voltage | Điện áp | genset | core | order |
| frequency | Tần số | genset | core | model |
| phases | Số pha | genset | core | order |
| current | Dòng điện định mức | genset | core | model |
| power_factor | Hệ số công suất | genset | core | model |
| ambient | Nhiệt độ môi trường làm việc | genset | core | site |
| fuel | Nhiên liệu | genset | core | model |
| fuel_tank | Bồn nhiên liệu | genset | option | order |
| noise | Độ ồn | genset | option | site |
| dimensions | Kích thước | genset | option | model |
| weight | Khối lượng | genset | option | model |
| genset_type | Loại tổ máy (trần / vỏ cách âm, cố định / di động) | genset | core | order |
| breaker | Áp-tô-mát / MCCB đầu ra | genset | option | order |
| canopy | Vỏ cách âm | genset | option | order |
| battery | Ắc quy | genset | option | order |
| exhaust | Hệ thống xả, giảm thanh, lưu lượng khí xả | genset | option | model |
| engine_make | Hãng động cơ | engine | core | model |
| engine_model | Model động cơ | engine | core | model |
| engine_origin | Xuất xứ động cơ | engine | core | model |
| engine_type | Kiểu động cơ | engine | core | model |
| cylinders | Số xi lanh | engine | core | model |
| displacement | Dung tích xi lanh | engine | core | model |
| bore_stroke | Đường kính × hành trình piston | engine | core | model |
| aspiration | Nạp khí (tăng áp, làm mát khí nạp) | engine | core | model |
| governor | Bộ điều tốc | engine | core | model |
| coolant_capacity | Dung tích nước làm mát | engine | core | model |
| oil_capacity | Dung tích dầu bôi trơn | engine | core | model |
| cooling | Hệ thống làm mát động cơ | engine | core | model |
| starting | Hệ thống khởi động | engine | core | model |
| engine_power | Công suất động cơ | engine | core | model |
| speed | Tốc độ quay | engine | core | model |
| emission | Tiêu chuẩn khí thải | engine | core | model |
| compression | Tỷ số nén | engine | core | model |
| fuel_system | Hệ thống nhiên liệu (phun) | engine | core | model |
| air_filter | Lọc gió, lọc dầu, lọc nhiên liệu | engine | option | order |
| alt_make | Hãng đầu phát | alternator | core | model |
| alt_model | Model đầu phát | alternator | core | model |
| alt_origin | Xuất xứ đầu phát | alternator | core | model |
| alt_excitation | Kích từ đầu phát (PMG / AREP) | alternator | core | model |
| alt_short_circuit | Dòng ngắn mạch duy trì (300% / 10 s) | alternator | core | model |
| alt_type | Kiểu đầu phát (không chổi than, tự kích) | alternator | core | model |
| alt_power | Công suất đầu phát | alternator | core | model |
| alt_insulation | Cấp cách điện | alternator | core | model |
| alt_ip | Cấp bảo vệ đầu phát (IP) | alternator | core | order |
| alt_avr | Điều chỉnh điện áp (AVR) | alternator | core | order |
| alt_poles | Số cực đầu phát | alternator | core | model |
| alt_bearing | Ổ đỡ đầu phát | alternator | core | model |
| alt_pitch | Bước quấn dây đầu phát (2/3) | alternator | core | model |
| alt_winding | Dây quấn đầu phát | alternator | core | model |
| alt_efficiency | Hiệu suất đầu phát | alternator | core | model |
| alt_thd | Méo sóng hài (THD) | alternator | core | model |
| alt_cooling | Làm mát đầu phát | alternator | core | model |
| alt_standard | Tiêu chuẩn đầu phát | alternator | core | document |
| ctl_make | Hãng bộ điều khiển | controller | core | model |
| ctl_model | Model bộ điều khiển | controller | core | model |
| ctl_origin | Xuất xứ bộ điều khiển | controller | core | model |
| ctl_type | Loại bộ điều khiển | controller | core | model |
| ctl_start_amf | Khởi động, dừng, tự động cấp điện (AMF) | controller | core (nhóm, có parts) | model |
| ctl_protection | Bảo vệ, dừng máy | controller | core (nhóm, có parts) | model |
| ctl_measure | Đo lường, hiển thị | controller | core (nhóm, có parts) | model |
| ctl_comm | Truyền thông, giám sát từ xa | controller | core (nhóm, có parts) | model |
| ctl_alarm_log | Cảnh báo, nhật ký sự kiện | controller | core (nhóm, có parts) | model |
| ctl_parallel | Hoà đồng bộ, chia tải | controller | core | model |
| ctl_display_lang | Ngôn ngữ, màn hình bộ điều khiển | controller | option | order |
| other | (tên tự đặt) | theo HSMT | theo HSMT | model |

## Xuất xứ động cơ: G7 hoặc EU (Mỹ, Anh, Đức, Pháp, Ý, Nhật, Canada và các nước Liên minh Châu Âu)
(Bot tự chọn vì HSMT ghi: "2 Nhà sản xuất/ nhãn hiệu Nhóm các nước khối G7, EU")
Chỉ gợi ý động cơ của hãng thuộc một nước G7 / EU (US, GB, DE, FR, IT, JP, CA, AT, BE, BG, HR, CY, CZ, DK, EE, FI, GR, HU, IE, LV, LT, LU, MT, NL, PL, PT, RO, SK, SI, ES, SE; hãng nước ngoài: Cummins US, Perkins GB, Baudouin FR, Volvo Penta SE, MTU DE, Mitsubishi JP, Kubota JP, Yanmar JP, Isuzu JP, Scania SE, John Deere US, MWM DE, Kohler US, Lister Petter GB, Honda JP, Caterpillar US, FPT IT, MAN DE, Detroit Diesel US), kể cả khi tìm trên internet; ghi "make" của động cơ. Không gợi ý động cơ của hãng Trung Quốc (Weichai, Yuchai, SDEC...), kể cả loại sản xuất theo giấy phép. Không gợi ý động cơ Deutz (Khoa, 2026-11-11: không tính là G7 / G20 / EU). Động cơ nguồn không ghi hãng thì không gợi ý.
Nhà cung cấp (Khoa, 2026-11-10): HSMT chỉ đòi động cơ / đầu phát / bộ điều khiển của hãng G7 / EU, KHÔNG đòi cả tổ máy xuất xứ G7 / EU. Vì vậy gợi ý nhà cung cấp ĐẶT TẠI TRUNG QUỐC (quốc gia CN trong catalog.md) chào tổ máy lắp động cơ hãng G7 / EU (Cummins, Perkins, MTU, Volvo Penta, Mitsubishi...), đầu phát hãng G7 / EU (Stamford, Leroy-Somer, Mecc Alte, Marelli...) và bộ điều khiển hãng G7 / EU (Deep Sea, ComAp...) theo đúng bộ phận nào HSMT đòi; đầu phát / bộ điều khiển hãng Trung Quốc (SmartGen, Nianfeng...) ở bộ phận HSMT đòi G7 / EU là Không đạt. Code đã bỏ dòng của 60 nhà cung cấp ngoài Trung Quốc khỏi catalog.md và sẽ bỏ họ khỏi kết quả; khi tìm trên internet (bước 4) cũng chỉ lấy nhà cung cấp / nhà máy tổ máy ở Trung Quốc, ghi `country` "CN".

## Thông số kỹ thuật theo phân tích (chỉ để định hướng, trích dẫn phải lấy từ hsmt.txt)
- Loại máy: Máy phát điện diesel di động có vỏ giảm âm đồng bộ, công suất 700kVA, 3 pha (Chương V, Mục B.II.2, I.1)
- Điều kiện sử dụng: Máy di động, lắp ngoài trời, thường xuyên được cẩu móc và di chuyển để cấp điện cho sự kiện, lễ hội (Chương V, Mục B.II.1.1)
- Cấu thành và thử xuất xưởng trọn bộ: Trọn bộ tổ máy được lắp ráp hoàn chỉnh và thử nghiệm xuất xưởng tại nhà sản xuất (Chương V, Mục B.II.1.1)
- Điều kiện môi trường: Nhiệt độ 0–45oC; độ ẩm cực đại 100%; độ cao đến 1000 m; gió lớn nhất 160 km/h; nhiệt đới hóa (Chương V, Mục B.I.1, B.I.4.1(1))
- Hệ thống điện: 0,38 kV, 50 Hz, trung tính nối đất trực tiếp (Chương V, Mục B.I.2, B.I.3.1)
- Công suất tổ máy: Liên tục ≥ 700 kVA; tối đa ≥ 770 kVA; hệ số công suất ≥ 0,8 (Chương V, Mục B.II.2, I.5–I.7)
- Điện áp, tần số, tốc độ tổ máy: 380/220 V; 50 Hz; ≤ 1.500 vòng/phút (Chương V, Mục B.II.2, I.8–I.10)
- Tiêu hao nhiên liệu: ≤ 156 lít/giờ ở 100% tải; ≤ 113 lít/giờ ở 70% tải; ≤ 77 lít/giờ ở 50% tải (Chương V, Mục B.II.2, I.12)
- Khả năng đáp ứng tải: Đóng tải từ 0% đến 100% trong vòng 20 giây (Chương V, Mục B.II.2, I.13)
- Khả năng quá tải tổ máy: 10% tải trong 01 giờ cho mỗi chu kỳ 12 giờ liên tục; Pmax = 1,1Pdm (Chương V, Mục B.II.2, I.14; B.II.1.3)
- Khung bệ máy: Xử lý bề mặt hóa chất chống oxy hóa và sơn tĩnh điện (Chương V, Mục B.II.2, I.15)
- Nhiên liệu, thời gian chạy: Dầu Diesel; thời gian chạy liên tục không hạn chế (Chương V, Mục B.II.2, I.16–I.17)
- Bình nhiên liệu: ≥ 1.000 lít, lắp chung trên máy (Chương V, Mục B.II.2, I.18 và VII.3; B.II.1.2)
- Kích thước tối đa có vỏ giảm âm: ≤ 5800 x 2000 x 2800 mm (DxRxC); vỏ đặt được ngoài trời, phù hợp cho cẩu và chở bằng xe tải (Chương V, Mục B.II.2, I.19)
- Trọng lượng tổ máy: Nhà thầu nêu cụ thể (kg) (Chương V, Mục B.II.2, I.20)
- Móc cẩu: Có vị trí móc cẩu ở chân đế và mặt máy (Chương V, Mục B.II.2, I.21)
- Độ ồn: ≤ 70 ± 5dB tại 7 mét, không vật chắn (Chương V, Mục B.II.2, I.22; B.II.1.2)
- Động cơ – xuất xứ: Nhà sản xuất/nhãn hiệu thuộc nhóm các nước khối G7, EU; nước sản xuất và mã hiệu nêu cụ thể (Chương V, Mục B.II.2, II.1–II.3)
- Động cơ – tình trạng, năm sản xuất: Mới 100%; sản xuất từ năm 2026 trở về sau (Chương V, Mục B.II.2, II.4–II.5)
- Động cơ – tiêu chuẩn chế tạo: ISO 8528/1, ISO 3046/1:1986, BS 5514/1 (Chương V, Mục B.II.2, II.6)
- Động cơ – công suất: Liên tục ≥ 600 kWm; tối đa ≥ 660 kWm (Chương V, Mục B.II.2, II.7–II.8)
- Động cơ – loại: Diesel 4 kỳ, làm mát bằng nước; 6 xy lanh thẳng hàng; ≤ 1500 vòng/phút (Chương V, Mục B.II.2, II.9, II.12, II.13)
- Động cơ – hệ thống nhiên liệu, điều tốc: Bơm phun trực tiếp, phun điện tử (ECU – High Pressure Common Rail); điều tốc điện tử ECU (Chương V, Mục B.II.2, II.10–II.11)
- Động cơ – tỉ số nén, hành trình: Tỉ số nén 14 : 01; hành trình xilanh nêu cụ thể (Chương V, Mục B.II.2, II.14–II.15)
- Động cơ – nạp khí: Turbo tăng áp, làm mát khí nạp sau turbo (Chương V, Mục B.II.2, II.16)
- Động cơ – khởi động: Mô tơ DC kèm acquy 24V, có bộ tự động sạc acquy (Chương V, Mục B.II.1.2; B.II.2, II.17)
- Động cơ – làm mát, bôi trơn, xả: Làm mát cưỡng bức tuần hoàn bằng két nước gắn trên máy và quạt; bôi trơn cưỡng bức bằng bơm bánh răng; ống xả có giảm thanh (Chương V, Mục B.II.1.2; B.II.2, II.18)
- Động cơ – khí thải: Phù hợp QCVN 19:2024/BTNMT (Chương V, Mục B.II.2, II.19)
- Đầu phát – xuất xứ, năm sản xuất: Nhà sản xuất/nhãn hiệu thuộc nhóm nước G7, EU; mới 100%; sản xuất từ năm 2026 trở về sau (Chương V, Mục B.II.2, III.2–III.5)
- Đầu phát – tiêu chuẩn chế tạo: ISO 8528/1, ISO 3046/1:1986, BS 5514/1, IEC60034, NEMA MG 1.32-33, ISO 8528-3 (Chương V, Mục B.II.2, III.6)
- Đầu phát – điện áp, số pha: 220/380 – 230/400 V; 3 pha – 4 dây (Chương V, Mục B.II.2, III.7–III.8)
- Đầu phát – kiểu: Xoay chiều, từ trường quay, không chổi than, tự kích từ, AVR tự động điều chỉnh điện áp (Chương V, Mục B.II.2, III.9, III.16, III.17)
- Đầu phát – công suất: Định mức ≥ 750 / 600 kVA/kWm; dự phòng ≥ 825 / 660 kVA/kWm (Chương V, Mục B.II.2, III.10–III.11)
- Đầu phát – tần số, tốc độ, quá tốc: 50 Hz; số vòng quay ≥ 1.500 vòng/phút; quá tốc độ ≤ 2250 vòng/phút (Chương V, Mục B.II.2, III.12, III.13, III.18)
- Đầu phát – cách điện: Cấp H (Chương V, Mục B.II.2, III.14)
- Đầu phát – dao động điện áp: Bảng thông số ghi ≤ ± 0,5% Udm; mục B.II.1.3 ghi ≤ ±1,5%Udm khi chuyển tải 0–100%Pđm (Chương V, Mục B.II.2, III.15; B.II.1.3)
- Đầu phát – quá tải: 300% (3 IN) trong 10 giây (Chương V, Mục B.II.2, III.19)
- Bộ điều khiển – xuất xứ, năm sản xuất: Nhà sản xuất/nhãn hiệu thuộc nhóm nước G7, EU; mới 100%; sản xuất từ năm 2026 trở về sau; gắn trên máy, có đèn chiếu sáng (Chương V, Mục B.II.2, IV.2–IV.5)
- Bộ điều khiển – chức năng: Kết hợp với tủ ATS; khởi động/tắt máy; dừng khẩn cấp; chọn chế độ và lập trình; điều khiển từ xa qua Internet/4G (đóng mở máy, đọc thông số); cài đặt tần số qua điều tốc; tự duy trì tần số 50 Hz (Chương V, Mục B.II.2, IV.6)
- Bộ điều khiển – đo lường, cảnh báo, dừng máy: Đo số giờ chạy, số lần khởi động, nhật ký lỗi, thông số đầu phát và động cơ. Cảnh báo và dừng máy theo danh sách, gồm phát ngược công suất, lệch pha, sai lệch điện áp giữa các pha, ngắn mạch. Mục B.II.1.4 có thêm ngưỡng dừng nhiệt độ nước >90oC (Chương V, Mục B.II.2, IV.7; B.II.1.4)
- Bộ điều khiển – cổng giao tiếp, ngôn ngữ, IP: Cổng kết nối giám sát từ xa; RS232, RS485, Ethernet, BMS; USB; LCD tiếng Việt hoặc tiếng Anh; IP65 (Chương V, Mục B.II.2, IV.8–IV.10)
- Bảng điều khiển – thiết bị: Áptômát tổng và cầu dao cách ly đầu cực máy phát; đèn chiếu sáng vận hành ban đêm; nút khởi động, dừng, dừng khẩn cấp, thử chức năng an toàn (Chương V, Mục B.II.1.4.b)
- Vỏ giảm âm – vật liệu: Thép dày ≥ 2mm (Chương V, Mục B.II.2, V.5)
- Vỏ giảm âm – vật liệu cách âm: Dày 100÷150mm (Chương V, Mục B.II.2, V.8)
- Vỏ giảm âm – sơn: Sơn tĩnh điện, chống sét gỉ cao (Chương V, Mục B.II.1.5; B.II.2, V.7)
- Vỏ giảm âm – thông gió: Có lỗ thông hơi, ngăn bằng lưới chống chuột, rắn xâm nhập (Chương V, Mục B.II.1.5; B.II.2, V.6)
- Vỏ giảm âm – cửa: Cửa mở về mọi phía; có chốt liên động và khóa (Chương V, Mục B.II.1.5)
- Vỏ giảm âm – che chắn, móc cẩu: Cách âm và che kín mưa nắng tốt; có móc cẩu (Chương V, Mục B.II.1.5)
- Vỏ giảm âm – tích hợp: Hoàn thiện đồng bộ với tổ máy; tích hợp đồng bộ tủ ATS, phù hợp di động ngoài trời (Chương V, Mục B.II.2, V.9)
- Vỏ giảm âm – nhận dạng: Nêu cụ thể nước sản xuất, nhà sản xuất, mã hiệu (Chương V, Mục B.II.2, V.1–V.3)
- ATS – nhận dạng: Nêu cụ thể nước sản xuất, nhà sản xuất, mã hiệu (Chương V, Mục B.II.2, VI.1–VI.3)
- ATS – dòng định mức: ≥ 1.250 A (Chương V, Mục B.II.2, VI.4)
- ATS – điện áp, tần số: 220/380 V – 50 Hz (Chương V, Mục B.II.2, VI.5)
- ATS – chế độ và điều khiển: Tự động và bằng tay; điều khiển kỹ thuật số, 02 cấp (bằng tay tại chỗ và tự động) (Chương V, Mục B.II.1.6; B.II.2, VI.6)
- ATS – vỏ tủ: Vỏ/hộp kim loại bằng thép dày 2-3mm, sơn tĩnh điện (Chương V, Mục B.II.2, VI.7)
- ATS – máy cắt: 02 máy cắt ACB 1250A, 03 pha – 03 cực (Chương V, Mục B.II.2, VI.7)
- ATS – liên động, đèn báo, sạc: Khóa liên động cô lập nguồn lưới với nguồn máy phát; đèn báo trạng thái; bộ sạc bình tự động từ điện lưới (Chương V, Mục B.II.2, VI.7)
- ATS – điều kiện và thời gian chuyển: Tự khởi động máy khi mất lưới, lưới quá thấp, quá cao hoặc mất pha. Thời gian chuyển sang nguồn máy phát 0-60s, tùy chỉnh. Lưới phục hồi thì chuyển tải về lưới ngay. Máy chạy làm mát 1-5 phút rồi tắt. Giá trị khởi động và thời gian trễ cài đặt từ 0s – 60s (Chương V, Mục B.II.2, VI.8)
- ATS – đấu nối: Đấu nối đồng bộ với phần động lực và bộ điều khiển máy phát; có đầu chờ đấu nối lưới và phụ tải (Chương V, Mục B.II.1.6; B.II.2, VI.9)
- ATS – lắp đặt, cấp bảo vệ: Tích hợp trong vỏ tổ máy, kín nước IP65 (Chương V, Mục B.II.2, VI.9)
- Acquy khởi động: 02 bình, ≥ 120Ah (Chương V, Mục B.II.2, VII.1)
- Bộ sạc acquy: Đầu vào 220VAC, đầu ra 24VDC, 3A (Chương V, Mục B.II.2, VII.2)
- Bình giảm thanh: Trang bị đồng bộ, phù hợp máy phát (Chương V, Mục B.II.2, VII.4)
- Tủ bảo vệ đầu phát: MCCB/ACB 1.250A bảo vệ đầu cực đầu phát (Chương V, Mục B.II.2, VII.5)
- Dầu bôi trơn, dung dịch chống đông: Trang bị đồng bộ kèm theo, phù hợp máy phát (Chương V, Mục B.II.2, VII.6–VII.7)
- Bộ dụng cụ sửa chữa: Tua-vít, mỏ lết, bộ lục giác, bộ cờ-lê, bút thử điện, bộ dụng cụ mở lọc (Chương V, Mục B.II.2, VII.8)
- Tiêu chuẩn chế tạo tổ máy: TCVN 9729:2013 hoặc tương đương (Chương V, Mục B.II.1.9)
- Thí nghiệm xuất xưởng: Theo TCVN 9729-6, TCVN 6627-1 hoặc tương đương: đo điện trở một chiều cuộn Stato và Roto, đo tổn hao không tải ở cosφ = 1, thử điện áp chịu thử. Biên bản nộp khi giao hàng (Chương V, Mục B.II.1.10; B.I.4.2)
- Nghiệm thu sơ bộ: Chạy thử liên tục 2h với các mức tải đến Pđm, có đại diện bên mua chứng kiến. Bên bán chuẩn bị nhiên liệu, dầu, nước làm mát, accu, bộ thử tải (Chương V, Mục B.II.1.10.3)
- Đào tạo: Bố trí chuyên gia nhà sản xuất hoặc cán bộ kỹ thuật đại lý đào tạo lắp đặt, vận hành (Chương V, Mục B.I.4.1(6))
- Đóng gói, ký hiệu: Kiện hàng bền, niêm phong; ký hiệu đấu nối bằng tiếng Việt hoặc tiếng Anh (Chương V, Mục B.II.1.11)

