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

## Phần kỹ thuật của HSMT
Chương V. YÊU CẦU VỀ KỸ THUẬT


A. GIỚI THIỆU CHUNG VỀ DỰ ÁN/ KẾ HOẠCH VÀ GÓI THẦU:
I.       Tóm tắt về dự án/ Kế hoạch:
     -   Tên dự án/ Kế hoạch: Trang bị máy phát điện phục vụ SXKD-GLPC năm 2027
     -   Quy mô và địa điểm hạng mục công trình:
     -   Thời gian thực hiện dự án: Năm 2027
     -   Địa điểm thực hiện các dự án/ Kế hoạch: Tỉnh Gia Lai.
II.      Tên và nội dung chủ yếu của gói thầu:
1.       Danh mục hàng hóa: Nhà thầu chịu trách nhiệm cung ứng đầy đủ hàng hóa với số
         lượng như bảng dưới đây
         Bảng tổng hợp danh mục hàng hóa
                                                                  Đơn      Khối     Ghi
 TT                        Danh mục hàng hóa
                                                                   vị     lượng     chú
          Máy phát điện dung lượng 700kVA 3 pha – 380/220V,
     1                                                      Máy                02
          Chạy bằng dầu diesel
2.       Danh mục các Dịch vụ liên quan: Không
III. Địa điểm giao hàng và thực hiện dịch vụ:
1.       Địa điểm giao hàng:
     -   Kho vật tư Công ty Điện lực Gia Lai (Kho cơ sở 1 – Địa chỉ: Phù Cát, tỉnh Gia Lai);
2.       Địa điểm thực hiện dịch vụ:
3.       Thời gian thực hiện:
     -   Thời gian giao hàng, chi tiết theo bảng sau:
                                                                          Khối lượng
         TT                Danh mục hàng hóa                   Đơn vị
                                                                            tổng
              Máy phát điện dung lượng 700kVA 3 pha –
         1                                                       Máy                 02
              380/220V, Chạy bằng dầu diesel
  - Trong vòng 120 ngày kể từ ngày hợp đồng có hiệu lực (theo tiến độ công trình nhưng
không quá ngày giao hàng muộn nhất theo Mẫu số 01A - webform trên Hệ thống).
B. CÁC YÊU CẦU KỸ THUẬT
I.       YÊU CẦU CHUNG:
I.1. Điều kiện môi trường làm việc của hàng hóa:
     Nhiệt độ môi trường lớn nhất                                          45oC
  Nhiệt độ môi trường nhỏ nhất                                                 0oC
  Khí hậu                                                           Nhiệt đới, nóng ẩm
  Độ ẩm cực đại                                                               100%
  Độ cao lắp đặt thiết bị so với mực nước biển                           Đến 1000 m
  Vận tốc gió lớn nhất                                                       160 km/h
I.2. Điều kiện vận hành của hệ thống điện:
 Điện áp danh định của hệ thống (kV)                                  0,38
 Sơ đồ nối                                                3 pha                    1 pha
                                                   Trung tính nối đất        Trung tính nối đất
 Chế độ nối đất trung tính
                                                       trực tiếp                 trực tiếp
 Điện áp làm việc lớn nhất của thiết bị (kV)              ≥ 0,4                   ≥ 0,23
 Tần số (Hz)                                                            50
I.3. Đặc điểm lưới điện: khu vực nhiệt đới, thường xuyên chịu ảnh hưởng bão lụt
I.3.1.     Lưới điện 0,4kV:
  -      Điện áp danh định                         : 0,38 kV.
  -      Điện áp làm việc lớn nhất                 : 0,4 kV.
  -      Chế độ làm việc của hệ thống              : Trung tính nối đất trực tiếp.
I.4. Yêu cầu kỹ thuật chung:
I.4.1.     Đối với vật tư, thiết bị:
         (1) Phải được nhiệt đới hóa và phù hợp điều kiện môi trường làm việc tại mục 1.
    (2) Thiết kế, chế tạo và thí nghiệm phù hợp với tiêu chuẩn Việt Nam, IEC, IEEE,
ANSI hoặc các tiêu chuẩn tương đương.
     (3) Tiêu chuẩn kỹ thuật áp dụng tương đương là tiêu chuẩn quy định về thiết kế, chế
tạo và thí nghiệm bằng hoặc tốt hơn tiêu chuẩn được trích dẫn áp dụng.
     (4) Có đầy đủ biên bản thử nghiệm theo yêu cầu tại Chương V, Mục B.I.4.3- Danh
mục các tài liệu chứng minh nguồn gốc và chất lượng hàng hóa và có đầy đủ các hạng mục
thử nghiệm đáp ứng yêu cầu được nêu tại mục B.II.1-Các yêu cầu chi tiết của E-HSMT.
     (5) Tất cả các hàng hóa và vật liệu, vật tư sử dụng cho hàng hóa phải mới, chưa qua
sử dụng, sử dụng toàn bộ các cải tiến mới nhất về thiết kế và vật liệu, trừ trường hợp có
quy định cụ thể khác trong hợp đồng.
     (6) Bên bán phải có trách nhiệm bố trí chuyên gia nhà sản xuất (hoặc cán bộ kỹ thuật
của đại lý bán hàng có chuyên môn) đào tạo cán bộ quản lý sử dụng của Bên mua nắm rõ,
làm chủ công nghệ trong việc lắp đặt, vận hành thiết bị.
I.4.2.     Yêu cầu về biên bản thử nghiệm đối với VTTB:
  - Biên bản thử nghiệm điển hình của các VTTB phải do đơn vị thí nghiệm độc lập phát
hành.
  - Biên bản thí nghiệm chứng minh hàng hóa đáp ứng yêu cầu của E-HSMT đối với các
hàng hóa nêu trong mục B.I.4.3 trong Chương V. Yêu cầu về mặt kỹ thuật của E-HSMT.
  -      Biên bản thử nghiệm điển hình: Nhà thầu phải cung cấp với E-HSDT.
  -      Biên bản thử nghiệm xuất xưởng: Nhà thầu cung cấp tại thời điểm giao hàng.
I.4.3.     Danh mục các tài liệu chứng minh nguồn gốc và chất lượng hàng hóa:
  - Các hàng hóa chào thầu là hàng mới 100%, có nguồn gốc xuất xứ rõ ràng, hợp pháp
kèm theo Danh mục tài liệu chứng minh nguồn gốc, chất lượng VTTB như sau:
                                                     Giấy
                                                                  Tài liệu kỹ  Xác nhận
                                                    chứng
                                                                  thuật (Bản của đơn vị
      TT            Tên vật tư - thiết bị            nhận
                                                                vẽ, Catalogue, sử dụng
                                                     kiểm
                                                                      …)       cuối cùng
                                                     định
             Máy phát điện dung lượng 700kVA
      1      3 pha – 380/220V, Chạy bằng dầu         X (*)               X
             diesel
  Ghi chú:
  -      Dấu "X" là các tài liệu bắt buộc hồ sơ dự thầu phải cung cấp.
  - Biên bản thử nghiệm điển hình của VTTB phải đáp ứng yêu cầu tại mục B.II Các yêu
cầu chi tiết Chương V của E-HSMT.
  - X (*): Nhà thầu cung cấp “Giấy chứng nhận xác nhận sản phẩm tổ máy phát điện
của nhà sản xuất đáp ứng tiêu chuẩn TCVN 9729 hoặc ISO 8528 hoặc tương đương" hoặc
"Giấy chứng nhận xác nhận nhà sản xuất đáp ứng tiêu chuẩn TCVN 9729 hoặc ISO 8528
hoặc tương đương về thử nghiệm tổ máy phát điện" do tổ chức có chức năng và độc lập
với nhà sản xuất ban hành.
II.      YÊU CẦU THÔNG SỐ KỸ THUẬT:
II.1. Các yêu cầu chi tiết:
         1. Các yêu cầu chi tiết:
    Máy phát điện di động 700kVA lắp đặt ngoài trời, thường xuyên cẩu móc, di chuyển
lắp đặt ngoài trời phục vụ cấp điện các sự kiện, lễ hội. Máy được trang bị vỏ chống ồn để
tránh các tác động của thời tiết.
   Máy phát điện di động 700kVA bao gồm máy phát điện (đầu phát), động cơ diesel,
thùng nhiên liệu, két nước làm mát, tủ bảng điều khiển, bộ chuyển đổi nguồn tự động, vỏ
máy phát giảm thanh được lắp ráp hoàn chỉnh.
    Trọn bộ Tổ máy điện dự phòng hạ áp (bao gồm máy phát, động cơ diesel, thùng nhiên
liệu, két nước làm mát, tủ bảng điều khiển, có bộ chuyển đổi nguồn tự động) phải được lắp
ráp hoàn chỉnh và thử nghiệm xuất xưởng tại Nhà sản xuất và được chịu trách nhiệm bởi
Nhà sản xuất.
   Hình ảnh minh họa:




       2. Động cơ:
   -    Loại động cơ diesel 4 kỳ.
   -    Số vòng quay: ≤ 1.500 vòng/phút.
   -    Hệ thống nạp khí: có turbo tăng áp và làm mát khí nạp.
   -    Hệ thống làm mát: bằng nước (có két nước gắn trên máy). Có quạt làm mát và truyền
        động quạt.
   -    Hệ thống bôi trơn: cưỡng bức bằng bơm bánh răng.
   -    Hệ thống nhiên liệu: thùng nhiên liệu lắp chung trên máy. Hệ thống bơm nhiên liệu
        kiểm bơm cao áp điện tử.
   -    Hệ thống khởi động: bằng mô tơ điện một chiều. Có bộ tự động sạc điện cho accu.
        Accu có điện áp 24V.
   -    Hệ thống xả: có bố trí ống giảm thanh.
   -    Độ ồn tối đa: ≤ 70dB ± 5dB với khoảng cách 7m không vật chắn.
   -    Điều tốc: Điện tử.
       3. Máy phát điện (đầu phát):
   -    Loại máy phát 3 pha.
   -    Công suất định mức Pdm = ≥ 700kVA.
   -    Khả năng quá tải Pmax = 1,1Pdm.
   -    Số vòng quay: ≤ 1.500 vòng/phút (bằng số vòng quay của động cơ diesel).
-    Tần số: 50Hz.
-    Điện áp định mức: 220/380V. Cấp cách điện H.
-    Hệ số công suất Cosđm ≥ 0,8.
-    Kích từ: không chổi than, tự động điều chỉnh điện áp, đảm bảo dao động điện áp ≤
     ±1,5%Udm trong quá trình chuyển đổi tải từ 0 đến 100%Pđm.
    4. Hệ thống đo lường bảo vệ:
a) Hệ thống điều khiển – bảo vệ tổ hợp:
-    Bộ kiểm tra máy phát điện, đo lường và hệ thống điều khiển kết hợp bộ điều tốc và
     điều áp (AVR) điện tử kỹ thuật số dựa trên bộ vi xử lý, cho phép máy hoạt động với
     độ tin cậy cao và đặc tính máy được tối ưu.
-    Hệ thống khởi động thông minh: kết hợp điều khiển phun nhiên liệu và điều khiển
     kích từ để giảm tối đa độ vượt quá điện áp và tần số, hạn chế khói đen.
-    Các chức năng bảo vệ tiêu chuẩn:
     + Cảnh báo: nhiệt độ nước làm mát cao/thấp, áp lực dầu bôi trơn thấp, sự cố cảm
       biến lực nhớt, sự cố cảm biến nhiệt độ, mức nhiên liệu trong bồn thấp, accu yếu,
       điện áp DC cao/thấp, quá dòng, cắt tải khi quá tải.
     + Dừng máy: khi nhiệt độ nước làm mát cao (>900C), mức nước làm mát thấp, áp
       lực dầu bôi trơn thấp; điện áp AC cao/thấp, bộ kích từ hỏng, quá dòng, ngắn
       mạch, tần số quá thấp, vượt tốc, dừng khẩn cấp khi có sự cố.
b) Bảng điều khiển được trang bị:
-    Màn hình tinh thể lỏng (LCD) thông báo trạng thái/cảnh báo: các thông tin về toàn
     bộ thông số vận hành của tổ máy.
-    Hiển thị được các thông số phần cơ: áp suất dầu bôi trơn, nhiệt độ nước làm mát,
     điện áp accu khởi động, đồng hồ tốc độ, mức nhiên liệu trong thùng chứa.
-    Hiển thị được các thông số phần điện: điện áp, dòng điện, tần số, công suất và số
     giờ vận hành.
-    Nút bấm khởi động, dừng máy, dừng khẩn cấp, thử các chức năng an toàn.
-    Có áptômát tổng và cầu dao cách ly đầu cực máy phát.
-    Có đèn chiếu sáng để vận hành ban đêm.
    5. Vỏ giảm âm bao che bảo vệ:
-    Có tính năng cách âm và che kín (mưa, nắng) tốt. Được sơn tĩnh điện, chống sét gỉ
     cao.
-    Có lỗ thông hơi và có cửa mở về mọi phía để tiện cho việc vận hành, sửa chữa.
-    Các cử có chốt liên động và có khóa.
-    Có móc cẩu để cẩu máy.
   - Có các lỗ thông hơi phải được ngăn bằng lưới để chống chuột, rắn.. thâm nhập vào
   thùng máy.
     6. Tủ chuyển đổi nguồn tự động (ATS):
   - Tủ chuyển đổi nguồn tự động sử dụng hệ thống điều khiển bằng kỹ thuật số, có 02
cấp điều khiển bằng tay tại chổ và tự động.
   - Bộ ATS phải được đấu nối đồng bộ với phần động lực và bộ điều khiển của máy
phát điện và có đầu chờ để đấu nối với điện lưới và phụ tải.
   - Bộ ATS có chức năng tự động khởi động máy phát và đóng điện cấp tải trong trường
hợp mất điện lưới cấp điện cho các phụ tải.
     7. Chế độ vận hành tổ máy phát:
     Chế độ vận hành của tổ máy phát điện có thể ảnh hưởng đến các đặc tính tính năng
nhất định và phải được khách hàng tính đến khi đồng ý với các yêu cầu của nhà sản xuất.
      1. Chế độ vận hành liên tục với tải ổn định: Chế độ vận hành liên tục với tải ổn định
là chế độ vận hành không bị giới hạn về thời gian của một tổ máy phát điện, có tính đến
thời gian bảo dưỡng, ở những nơi áp dụng có phụ tải điện không đổi.
      2. Chế độ vận hành liên tục với tải thay đổi Chế độ vận hành liên tục với tải thay đổi
là chế độ vận hành không bị giới hạn về thời gian của một tổ máy phát điện, có tính đến
thời gian bảo dưỡng, ở những nơi áp dụng có phụ tải điện thay đổi.
      3 Chế độ vận hành trong thời gian giới hạn với tải ổn định: Chế độ vận hành trong
thời gian giới hạn với tải ổn định là chế độ vận hành bị giới hạn về thời gian của một tổ
máy phát điện, ở những nơi áp dụng có phụ tải điện không đổi.
      4. Chế độ vận hành trong thời gian giới hạn với tải thay đổi: Chế độ vận hành trong
thời gian giới hạn với tải thay đổi là chế độ vận hành bị giới hạn về thời gian của một tổ
máy phát điện, ở những nơi áp dụng có phụ tải điện thay đổi.
     8. Chế độ khởi động và điều khiển:
     1. Yêu cầu chung: Các chế độ khởi động và điều khiển trong quá trình vận hành thông
thường của tổ máy phát điện bao gồm:
     a. Khởi động.
     b. Giám sát.
     c. Điều chỉnh điện áp, tần số và đồng bộ hóa tại nơi áp dụng.
     d. Đóng cắt.
     e. Dừng.
     Các chế độ này có thể thực hiện hoàn toàn hoặc một phần bằng tay hoặc tự động.
     2. Chế độ vận hành bằng tay: Quá trình khởi động và điều khiển tổ máy phát điện
được thực hiện bằng tay.
     3. Chế độ vận hành bán tự động: Ở chế độ này, một số chức năng của tổ máy phát
điện được khởi động và điều khiển bằng tay và phần còn lại được thực hiện một cách tự
động.
     4. Chế độ vận hành tự động: Ở chế độ này, quá trình khởi động và điều khiển tổ máy
phát điện được thực hiện một cách hoàn toàn tự động.
   9. Tiêu chuẩn chế tạo: Máy phát điện dự phòng hạ áp được chế tạo theo tiêu chuẩn
TCVN 9729:2013 hoặc các tiêu chuẩn tương đương.
     10. Yêu cầu về thí nghiệm:
     1. Khi giao hàng Nhà cung cấp phải kèm biên bản thí nghiệm xuất xưởng của thiết bị
để chứng minh các đặc tính kỹ thuật chào thầu.
   2. Máy phát phải được thí nghiệm xuất xưởng theo tiêu chuẩn TCVN 9729 6:201,
TCVN 6627-1 hoặc tiêu chuẩn tương đương gồm các hạng mục chính sau:
     a. Đo điện trở một chiều các cuộn dây Stato và Roto.
     b. Đo tổn hao không tải ở hệ số công suất bằng 1.
      c. Thử nghiệm điện áp chịu thử. Việc yêu cầu các hạng mục thử nghiệm xuất xưởng
có thể được thỏa thuận giữa người mua và nhà cung cấp trong quá trình mua sắm hàng hóa.
Ngoài các hạng mục thử nghiệm trên, người mua có thể yêu cầu bổ sung các hạng mục thử
nghiệm theo TCVN 9729-6:2013.
      3. Trước khi tiếp nhận máy phát phải tiến hành chứng kiến thử nghiệm, nghiệm thu
sơ bộ bằng cách cho máy phát chạy thử liên tục 2h với các chế độ tải khác nhau đến Pđm.
Khi tiến hành thử nghiệm phải bố trí cán bộ kỹ thuật và chuẩn bi ̣ đầy đủ nhiên liệu, dầu
bôi trơn, nước làm mát, điện accu, bộ thử tải... để thử tải cho máy. Việc kiểm tra nghiệm
thu, thử tải phải có sự chứng kiến đại diện bên mua. Ngoài hạng mục thử nghiệm này, trong
một số trường hợp cần thiết, người mua có thể yêu cầu bổ sung các hạng mục thử nghiệm
nghiệm thu tại nhà máy theo TCVN 9729-6:2013.
     11. Yêu cầu về đóng gói:
      Toàn bộ các loại hàng hóa phải được đóng vào các bao bì, kiện hàng phù hợp (gọi
chung là kiện hàng). Mỗi kiện hàng phải phù hợp theo các tiêu chuẩn đóng gói bao bì để
tránh mọi dạng hư hỏng trong khi vận chuyển, việc đóng gói phải bền vững, không bị phá
vỡ khi phơi ở nơi nhiệt độ cao, nước mặn và mưa… trong quá trình vận chuyển, bốc xếp
và lưu kho bãi. Kích thước và trọng lượng của kiện hàng phải tính toán phù hợp cho việc
bốc xếp, vận chuyển và phải được niêm phong đầy đủ để tránh sai sót, phức tạp trong quá
trình giao nhận hàng.
     Các ký hiệu đấu nối đầu dây, giắc cắm hoàn thiện máy phát điện: Tiếng Việt hoặc
Tiếng Anh.
II.2. YÊU CẦU THÔNG SỐ KỸ THUẬT:
         ĐẶC TÍNH KỸ              Đơn vị                               Nhà thầu
STT                                               YÊU CẦU
           THUẬT                   tính                                 chào
      Thông số kỹ thuật
I.
      chung máy phát điện
 1    Loại máy                               Máy phát điện diesel di
                                              động có vỏ giảm âm
                                   kVA
                                               đồng bộ, công suất
                                                700kVA, 3 pha
 2    Nước sản xuất (Quốc gia                      Nêu cụ thể
      nơi máy phát được lắp
      ráp hoàn chỉnh và xuất
      xưởng)
 3    Nhà sản xuất (Nhà sản                        Nêu cụ thể
      xuất chịu trách nhiệm
      lắp ráp hoàn chỉnh máy
      phát và xuất xưởng)
 4    Mã hiệu                                      Nêu cụ thể
 5    Công suất liên tục           kVA               ≥ 700
 6    Công suất tối đa             kVA               ≥ 770
 7    Hệ số công suất                                 ≥ 0,8
 8    Điện áp định mức              V               380/220
 9    Tốc độ vòng quay           vòng/phút          ≤ 1.500
10    Tần số                        Hz                 50
11    Điều chỉnh công suất khi               Tự động điều chỉnh khi
      thay đổi tải                                thay đổi tải
12    Tiêu hao nhiên liệu
 +    Tiêu hao nhiên liệu ở                       ≤ 156 lít/giờ
      mức 100% tải
 +    Tiêu hao nhiên liệu ở                       ≤ 113 lít/giờ
      mức 70% tải
 +    Tiêu hao nhiên liệu ở                        ≤ 77 lít/giờ
      mức 50% tải
13    Khả năng đáp ứng tải             Đóng tải từ mức 0% tải
                                      đến 100% tải trong vòng
                                              20 giây
14    Khả năng quá tải                 10% tải trong vòng 01
                                      giờ cho mỗi chu kỳ hoạt
                                       động trong 12 giờ liên
                                                 tục
15    Khung bệ máy                     Được xử lý bề mặt hóa
                                      chất để tránh oxy hóa và
                                            sơn tĩnh điện
16    Nhiên liệu sử dụng                    Dầu Diesel
17    Thời gian chạy liên tục             Không hạn chế
18    Dung tích bình nhiên                    ≥ 1.000
                                lít
      liệu
19    Kích thước máy có vỏ             ≤ 5800 x 2000 x 2800
      giảm âm (DxRxC) tối đa           Vỏ giảm âm được thiết
                                       kế đặt được ngoài trời,
                                mm    đảm bảo tính liên tục và
                                      linh hoạt cho hoạt động
                                      cẩu, vận chuyển bằng xe
                                                 tải.
20    Trọng lượng tổ hợp máy                Nêu cụ thể
                                kg
      phát điện
21    Móc cẩu để cẩu tổ máy            Có vị trí móc cẩu chân
      thường xuyên di động                đế và mặt máy
      làm việc
22    Độ ồn cách 7 mét (không
                                            ≤ 70 ± 5dB
      vật chắn)
      Thông số kỹ thuật
II.
      động cơ
1     Nước sản xuất                         Nêu cụ thể
2     Nhà sản xuất/ nhãn hiệu         Nhóm các nước khối G7,
                                               EU
3     Mã hiệu                               Nêu cụ thể
4     Tình trạng                                  Mới 100%
5     Năm sản xuất                          Từ năm 2026 trở về sau
6     Tiêu chuẩn chế tạo                       ISO 8528/1, ISO
                                            3046/1:1986, BS 5514/1
7     Công suất liên tục          kWm                ≥ 600
8     Công suất tối đa            kWm                ≥ 660
9     Loại động cơ                            Diesel 4 kỳ, làm mát
                                                  bằng nước
10    Hệ thống nhiên liệu                   Bơm phun trực tiếp, điều
                                             khiển phun nhiên liệu
                                              bằng điện tử (ECU -
                                            High Pressure Common
                                                     Rail)
11    Kiểu điều tốc                              Điện tử - ECU
12    Số xylanh                              6 xy lanh, bố trí thẳng
                                                     hàng
13    Tốc độ quay               vòng/phút           ≤ 1500
14    Tỉ số nén                                     14 : 01
15    Hành trình xilanh                           Nêu cụ thể
16    Hệ thống nạp khí                      Turbo tăng áp – làm mát
                                               khí nạp sau turbo
17    Hệ thống khởi động                      Bằng moto DC khởi
                                             động, kèm theo acquy
18    Hệ thống làm mát                      Làm mát cưỡng bức tuần
                                            hoàn bằng két nước, kết
                                               hợp với quạt gió
19    Tiêu chuẩn khí thải                     Phù hợp với QCVN
                                               19:2024/BTNMT
      Thông số kỹ thuật đầu
III
      phát điện
1     Nước sản xuất                               Nêu cụ thể
2     Nhà sản xuất/ nhãn hiệu               Nhóm các nước khối G7,
                                                     EU
3    Mã hiệu                                     Nêu cụ thể
4    Tình trạng                                  Mới 100%
5    Năm sản xuất                          Từ năm 2026 trở về sau
6    Tiêu chuẩn chế tạo                        ISO 8528/1, ISO
                                           3046/1:1986, BS 5514/1,
                                            IEC60034, NEMA MG
                                             1.32-33, ISO 8528-3
7    Điện áp                      V           220/380 - 230/400
8    Số pha – số dây                            3 pha – 4 dây
9    Kiểu đầu phát                          Xoay chiều, từ trường
                                            quay, không chổi than,
                                           tự động kích từ, tự động
                                              điều chỉnh điện áp
10   Công suất định mức        kVA/kWm           ≥ 750 / 600
11   Công suất dự phòng        kVA/kWm           ≥ 825 / 660
12   Tần số định mức              Hz                 50
13   Số vòng quay              Vòng/phút           ≥ 1.500
14   Cấp cách điện                                 Cấp H
15   Dao động điện áp                          ≤ ± 0,5% Udm
16   Hệ thống kích từ                        Không chổi than, tự
                                               động kích từ
17   Ổn định điện áp                       Tự động ổn định điện áp
                                                 bằng AVR
18   Quá tốc độ                Vòng/phút           ≤ 2250
19   Quá tải                                300% (3 IN) trong 10
                                  %
                                                   giây
     Thông số kỹ thuật bộ
IV
     điều khiển
1    Nước sản xuất                               Nêu cụ thể
2    Nhà sản xuất/ nhãn hiệu               Nhóm các nước khối G7,
                                                    EU
3    Mã hiệu                                     Nêu cụ thể
4   Tình trạng                Mới 100%. Bảng điều
                             khiển được bố trí thuận
                              lợi, ở nơi dễ thấy, dễ
                            nhìn, dễ thao tác. Tất cả
                              hệ thống chỉ thị, cảnh
                            báo trên bảng điều khiển
                            rõ rằng, chính xác, thiết
                            kế gắn trên máy phát, có
                                 đèn chiếu sáng.
5   Năm sản xuất            Từ năm 2026 trở về sau
6   Chức năng điều khiển    + Kết hợp với tủ ATS.
                            + Khởi động máy và tắt
                            máy.
                            + Dừng máy khẩn cấp.
                            + Chọn lựa các chế độ
                            làm việc, điều khiển trạng
                            thái và lập trình.
                            + Chức năng điều khiển
                            từ     xa   qua    cổng
                            Internet/4G, điều khiển
                            đóng mở máy và đọc
                            được các thông số trên
                            màn hình của bộ điều
                            khiển.
                            + Cài đặt, hiệu chỉnh giá
                            trị tần số máy phát thông
                            qua hệ thống điều tốc của
                            động cơ.
                            + Tần số danh định 50
                            Hz; có chức năng tự động
                            duy trì tần số ổn định khi
                            phụ tải thay đổi.
    Chức năng đo lường,     1. Đo lường:
    hiển thị các thông số   -   Thông số chung:
7   máy và chức năng bảo        + Số giờ vận hành
    vệ                          máy.
    + Số lần khởi động
    máy.
    + Nhật ký lỗi.
-   Thông số đầu phát:
    + Công suất tác dụng,
    công suất biểu kiến.
    + Điện áp các pha.
    + Dòng điện các pha.
    + Hệ số công suất.
    + Tần số.
-   Thông số động cơ:
    + Tốc độ động cơ.
    + Nhiệt độ nước làm
    mát.
    + Điện áp acquy.
    + Nhiệt độ, Áp suất
    bôi trơn.
    + Mức nhiên liệu
    trong thùng chứa.
 2. Cảnh báo và dừng
máy để bảo vệ:
    *Cảnh báo:
 + Nhiệt độ nước làm
mát cao;
  + Áp lực dầu nhớt
thấp;
  + Sự cố cảm biến áp
suất nhớt;
  + Sự cố cảm biến áp
nhiệt độ;
   + Mức nhiên liệu trong
thùng dầu thấp/ Hết nhiên
liệu;
 + Ắc qui yếu / Điện áp
DC cao/thấp;
                               + Quá dòng / Cắt tải
                             khi quá tải
                                Dừng máy khi:
                               + Nhiệt độ nước làm
                             mát cao quá mức cho
                             phép.
                               + Áp lực dầu nhớt thấp
                             hơn mức cho phép.
                               + Vượt tốc.
                               + Mức nước làm mát
                             thấp hơn mức cho phép;
                               + Tần số quá cao/quá
                             thấp.
                               + Điện áp AC quá
                             cao/quá thấp.
                               + Sai lệch điện áp AC
                             giữa các pha quá lớn.
                               + Quá dòng trên mức
                             cho phép.
                               + Lệch pha quá mức
                             cho phép.
                              + Vượt công suất quá
                             mức cho phép.
                               + Phát ngược công suất
                             quá mức cho phép.
                               + Ngắn mạch.
                               + Dừng khẩn cấp.
8    Các cổng giao tiếp      + Cổng kết nối với hệ
                             thống kiểm soát từ xa.
                             + Cổng kết nối tiêu
                             chuẩn: RS232, RS485,
                             Ethernet, BMS.
                             + Cổng kết nối USB.
     Ngôn ngữ hiển thị màn    Tiếng Việt hoặc Tiếng
9
     hình LCD                         Anh
10   Cấp bảo vệ                       IP65
     Vỏ giảm âm bao che
V
     bảo vệ
1    Nước sản xuất                             Nêu cụ thể
2    Nhà sản xuất                              Nêu cụ thể
3    Mã hiệu                                   Nêu cụ thể
5    Vật liệu chế tạo                       Thép dày ≥ 2mm
6    Các lỗ thông hơi                   Được ngăn bằng lưới để
                                        chống chuột, rắn.. thâm
                                         nhập vào thùng máy.
7    Sơn thùng cách âm                        sơn tĩnh điện
8    Vật liệu cách âm                       Dày 100÷150mm
9    Tính đồng bộ                       - Vỏ giảm âm phải được
                                        hoàn thiện đồng bộ với tổ
                                        máy phát điện.
                                          - Vỏ giảm âm phải tích
                                        hợp đồng bộ tủ chuyển
                                        nguồn tự động (ATS) phù
                                        hợp cho việc di động hoạt
                                        động ngoài trời.
     Tủ chuyển đổi nguồn
VI
     tự động (ATS)
1    Nước sản xuất                             Nêu cụ thể
2    Nhà sản xuất                              Nêu cụ thể
3    Mã hiệu                                   Nêu cụ thể
4    Dòng tải định mức            A              ≥ 1.250
5    Điện áp – tần số làm việc   V-Hz        220/380-50Hz
6    Chế độ vận hành                      Tự động và bằng tay
7    Cấu tạo                            Tất cả các thiết bị được
                                        đặt trong vỏ/hộp kim loại
                                        bằng thép dày 2-3mm,
                                        được sơn tĩnh điện:
                                        + Trang bị 02 máy cắt
                                        ACB - 1250A, 03 pha –
                                        03 cực.
                            + Khóa liên động an toàn
                            để cô lập giữa nguồn lưới
                            và nguồn máy phát.
                            + Trang bị các đèn báo
                            tình trạng hoạt động.
                            + Trang bị bộ sạc bình tự
                            động từ điện lưới.
8     Nguyên lý hoạt động   + Khi mất điện lưới hoặc
                            khi điện lưới quá thấp,
                            quá cao, mất pha, máy sẽ
                            tự động khởi động. Thời
                            gian chuyển đổi sang
                            nguồn máy phát là 0-60s,
                            tùy chỉnh
                            + Khi điện lưới phục hồi
                            hoàn toàn, bộ ATS ngay
                            lập tức chuyển phụ tải
                            sang nguồn lưới. Máy tự
                            động tắt sau khi chạy làm
                            mát 1-5 phút, tùy chỉnh.
                            + Các giá trị khởi động,
                            thời gian trễ có thể cài đặt
                            theo yêu cầu từ 0s – 60s.
9     Tính đồng bộ          + Bộ ATS phải được đấu
                            nối đồng bộ với phần
                            động lực và bộ điều khiển
                            của máy phát điện và có
                            đầu chờ để đấu nối với
                            điện lưới và phụ tải.
                            + Tủ ATS được tích hợp
                            đồng bộ trong vỏ tổ máy
                            phát điện đảm bảo độ kín
                            nước IP65, rất phù hợp
                            cho việc di động hoạt
                            động ngoài trời.
VII   Phụ kiện
1     Bộ acquy khởi động    Có trang bị kèm theo 02
                                 bình, ≥120Ah
  2    Bộ sạc acquy                             Có trang bị kèm theo.
                                                Nguồn điện đầu vào
                                                  220VAC, đầu ra
                                                     24VDC, 3A
  3    Bình dầu                                        ≥ 1000
                                     lít
                                                Có trang bị kèm theo.
  4    Bình giảm thanh                        Có trang bị đồng bộ kèm
                                               theo Phù hợp máy phát
  5    Tủ bảo vệ đầu phát                           Có trang bị
                                               MCCB/ACB, 1.250A
                                              bảo vệ đầu cực đầu phát
                                                       điện
  6    Dầu bôi trơn                           Có trang bị đồng bộ kèm
                                               theo Phù hợp máy phát
  7    Dung dịch chống đông                   Có trang bị đồng bộ kèm
       cặn                                     theo Phù hợp máy phát
  8    Bộ dụng cụ sửa chữa cơ                  Tua-vít, mỏ lết, bộ lục
       bản                                     giác, bộ cờ-lê, bút thử
                                              điện, bộ dụng cụ mở lọc


Ghi chú:
    - Đối với các yêu cầu bắt buộc phải nêu rõ thông số, giải pháp,… trong bảng yêu cầu
thông số kỹ thuật của VTTB thì trong E-HSDT Nhà thầu phải nêu cụ thể, đầy đủ thông số,
mô tả giải pháp... Không được ghi “đáp ứng/đảm bảo/tuân thủ E-HSMT,…”

--- Tệp: 61-2027-MSMF-Chuong-VII-Dieu-Kien-Cu-The-HD-Phan-Dinh-Kem-.pdf ---
