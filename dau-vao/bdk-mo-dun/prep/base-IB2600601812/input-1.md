# Gói thầu IB2600601812

Công suất đọc được: 100 kVA (chỉ để lọc danh mục; yêu cầu thật lấy từ HSMT)
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

## Xuất xứ động cơ: Tất cả

Không giới hạn xuất xứ động cơ (HSMT không đòi G7 / G20). Gợi ý cả cấu hình động cơ hãng Trung Quốc (Weichai, Yuchai, SDEC...) lẫn động cơ hãng nước khác; cấu hình động cơ hãng Trung Quốc đáp ứng HSMT tốt hơn hoặc ngang cấu hình động cơ hãng nước khác thì xếp trước (Khoa, 2026-11-05). Code xếp lại theo kết quả kiểm tra.
Nhà cung cấp (Khoa, 2026-11-10): HSMT không đòi G7 / G20 nên chỉ gợi ý nhà cung cấp ĐẶT TẠI TRUNG QUỐC (quốc gia CN trong catalog.md) có động cơ, đầu phát, bộ điều khiển phù hợp với HSMT; các bộ phận đó có thể là hãng Trung Quốc hoặc hãng nước khác (Cummins, Perkins, Stamford, Leroy-Somer, Deep Sea, ComAp, SmartGen...) do nhà cung cấp Trung Quốc chào. Code đã bỏ dòng của 71 nhà cung cấp ngoài Trung Quốc khỏi catalog.md và sẽ bỏ họ (cùng cấu hình lấy từ dòng bảng của họ) khỏi kết quả. Khi tìm trên internet (bước 4) cũng chỉ lấy nhà cung cấp / nhà máy tổ máy ở Trung Quốc, ghi `country` "CN" trong newCatalog.json.

## Tổ máy HSMT nêu đích danh: Huyndai DHY110K SE (hãng Hyundai)
HSMT ghi: "Nhà sản xuất Huyndai", "Mã hiệu DHY110K SE"
- Dòng catalog.md có lý do "tổ máy đúng model HSMT nêu đích danh" (hoặc "tổ máy hãng … HSMT nêu") là cấu hình phải gợi ý trước tiên; ghi `genset.model` / `genset.make` đúng như nguồn ghi.
- catalog.md không có model đó: làm bước 4 cho RIÊNG model này trước: tra trang của chính thương hiệu (trang hãng, hoặc đơn vị được cấp phép thương hiệu — tính là nguồn hãng, tier A/B), lưu trang, ghi `src.tier` của nguồn internet. Quy tắc "chỉ nhà cung cấp đặt tại Trung Quốc" KHÔNG áp cho riêng dòng model này; xuất xứ vẫn kiểm theo yêu cầu xuất xứ của HSMT (nguồn không ghi thì để chưa rõ, code chuyển thành cần chứng từ).
- Không có trang hãng / đơn vị cấp phép: được dùng tạm trang bên bán cho riêng model này (`src.tier` "C"); code gắn "chưa xác minh", mọi mục tối đa chưa rõ, không đưa vào danh mục.
- Cấu hình hãng / model khác vẫn gợi ý như thường (hàng tương đương; code gắn nhãn và cảnh báo khi HSMT không cho tương đương). Không trả `configs: []` chỉ vì không tìm được hãng / model HSMT nêu.

## Thông số kỹ thuật theo phân tích (chỉ để định hướng, trích dẫn phải lấy từ hsmt.txt)
- Loại máy: Máy phát điện diesel, có vỏ giảm âm, 100kVA, 03 pha (TBMT – Mẫu số 02B, Thông số kỹ thuật, mục I.1)
- Nước sản xuất tổ máy: Trung Quốc hoặc tương đương (Mẫu số 02B, mục I.2)
- Nhà sản xuất / nhãn hiệu tổ máy: Huyndai (viết như trong hồ sơ) (Mẫu số 02B, mục I.3; cột Nhãn hiệu, Hãng sản xuất)
- Mã hiệu tổ máy: DHY110K SE (Mẫu số 02B, mục I.4; cột Ký mã hiệu)
- Tình trạng, năm sản xuất: Mới 100%, sản xuất từ năm 2026 trở về sau (Mẫu số 02B, mục I.5; cột Năm sản xuất 'Từ 2026 trở về sau')
- Công suất liên tục tổ máy: ≥ 100 kVA (Mẫu số 02B, mục I.6)
- Công suất tối đa tổ máy: ≥ 110 kVA (Mẫu số 02B, mục I.7)
- Hệ số công suất: ≥ 0,8 (Mẫu số 02B, mục I.8)
- Điện áp định mức: 380V/220V (Mẫu số 02B, mục I.9)
- Tốc độ vòng quay: ≤ 1500 vòng/phút (Mẫu số 02B, mục I.10)
- Tần số: 50Hz (Mẫu số 02B, mục I.11)
- Điều chỉnh công suất khi thay đổi tải: Tự động điều chỉnh (Mẫu số 02B, mục I.12)
- Tiêu hao nhiên liệu 100% tải: ≤ 25 lít/giờ (Mẫu số 02B, mục I.13)
- Tiêu hao nhiên liệu 50% tải: ≤ 15 lít/giờ (Mẫu số 02B, mục I.14)
- Khả năng quá tải: 10% tải trong 01 giờ cho mỗi 24 giờ vận hành liên tục (Mẫu số 02B, mục I.15)
- Khung bệ máy: Xử lý bề mặt bằng hóa chất chống ôxy hóa, sơn tĩnh điện (Mẫu số 02B, mục I.16)
- Nhiên liệu: Dầu Diezel (Mẫu số 02B, mục I.17)
- Thời gian chạy liên tục: Không hạn chế (Mẫu số 02B, mục I.18)
- Dung tích bình nhiên liệu: ≥ 170 lít (Mẫu số 02B, mục I.19)
- Kích thước, trọng lượng tổ máy: Nêu cụ thể kích thước (DxRxC, mm) và trọng lượng (kg) (Mẫu số 02B, mục I.20–I.21)
- Động cơ – thông tin phải kê khai: Nêu cụ thể nước sản xuất, nhà sản xuất, mã hiệu, năm sản xuất, số xy lanh, tỉ số nén, hành trình xilanh; tình trạng Mới 100% (Mẫu số 02B, mục II.1–II.5, II.11, II.13, II.14)
- Công suất liên tục động cơ: ≥ 100 kVA/80kW (Mẫu số 02B, mục II.6)
- Công suất tối đa động cơ: ≥ 110 kVA/88kW (Mẫu số 02B, mục II.7)
- Loại động cơ: Diesel 4 kỳ (Mẫu số 02B, mục II.8)
- Hệ thống nhiên liệu: Bơm phun trực tiếp, điều khiển bằng điện tử (Mẫu số 02B, mục II.9)
- Kiểu điều tốc: Điện tử (Mẫu số 02B, mục II.10)
- Tốc độ quay động cơ: ≤ 1500 vòng/phút (Mẫu số 02B, mục II.12)
- Tiêu chuẩn khí thải: Phù hợp với điều kiện của Việt Nam (không nêu cấp tiêu chuẩn cụ thể) (Mẫu số 02B, mục II.15)
- Hệ thống nạp khí: Turbo tăng áp (Mẫu số 02B, mục II.16)
- Hệ thống khởi động: Mô tơ khởi động, kèm ắc quy (Mẫu số 02B, mục II.17)
- Hệ thống làm mát: Cưỡng bức tuần hoàn bằng két nước kết hợp quạt gió (Mẫu số 02B, mục II.18)
- Độ ồn: ≤ 70±5dB cách 7 mét, không vật chắn (không ghi đơn vị dB(A)) (Mẫu số 02B, mục II.19)
- Đầu phát – thông tin phải kê khai: Nêu cụ thể nước sản xuất, nhà sản xuất, mã hiệu, năm sản xuất; tình trạng Mới 100% (Mẫu số 02B, mục III.1–III.5)
- Điện áp, số pha – số dây đầu phát: 380V/220V; 3 pha - 4 dây (Mẫu số 02B, mục III.6–III.7)
- Kiểu đầu phát: Xoay chiều, từ trường quay, không chổi than, tự kích từ, tự động điều chỉnh điện áp (Mẫu số 02B, mục III.8)
- Công suất liên tục đầu phát: ≥ 100 kVA (Mẫu số 02B, mục III.9)
- Tần số định mức đầu phát: 50 Hz (Mẫu số 02B, mục III.10)
- Cấp cách điện: Cấp H (Mẫu số 02B, mục III.11)
- Dao động điện áp: ≤ ± 1% Uđm (Mẫu số 02B, mục III.12)
- Số vòng quay đầu phát: ≤ 1500 vòng/phút (Mẫu số 02B, mục III.13)
- Bộ điều khiển – thông tin, bố trí: Nêu cụ thể nước SX, nhà SX, mã hiệu, năm SX; mới 100%; gắn trên máy phát, có đèn chiếu sáng; chỉ thị, cảnh báo rõ ràng (Mẫu số 02B, cột Yêu cầu khác, mục IV.1–IV.5)
- Nguyên lý điều khiển: Kỹ thuật số (Mẫu số 02B, Yêu cầu khác, mục IV.6)
- Chức năng điều khiển: Kết hợp với tủ ATS; khởi động/tắt máy; dừng khẩn cấp; chọn chế độ làm việc, lập trình (Mẫu số 02B, Yêu cầu khác, mục IV.7)
- Điều khiển từ xa: Điều khiển từ xa qua Internet/5G: đóng mở máy và đọc thông số như trên màn hình bộ điều khiển (Mẫu số 02B, Yêu cầu khác, mục IV.7)
- Đo lường, hiển thị: Số giờ vận hành, số lần khởi động, nhật ký lỗi; P, S, U, I các pha, cosφ, f; tốc độ, nhiệt độ nước làm mát, điện áp ắc quy, nhiệt độ và áp suất bôi trơn, mức nhiên liệu (Mẫu số 02B, Yêu cầu khác, mục IV.8.1)
- Chức năng bảo vệ: Quá tải, ngắn mạch, điện áp cao/thấp, quá dòng, phát ngược công suất, nhiệt độ nước cao, áp lực nhớt thấp, vượt tốc, tần số cao/thấp, mức nhiên liệu thấp/hết, lệch điện áp AC giữa các pha (Mẫu số 02B, Yêu cầu khác, mục IV.8.2)
- Cổng giao tiếp: Cổng kết nối hệ thống kiểm soát từ xa, cổng USB, cổng đọc dữ liệu trực tiếp từ động cơ (Mẫu số 02B, Yêu cầu khác, mục IV.9)
- Vỏ giảm âm – vật liệu: Thép dày ≥ 2mm, sơn tĩnh điện; nêu cụ thể nước SX, nhà SX, mã hiệu, năm SX (Mẫu số 02B, Yêu cầu khác, mục V.1–V.5)
- Vỏ giảm âm – lỗ thông hơi: Có lưới chống chuột, rắn (Mẫu số 02B, Yêu cầu khác, mục V.6)
- Vỏ giảm âm – vật liệu cách âm: Chống cháy, dày 20 ÷ 50mm (Mẫu số 02B, Yêu cầu khác, mục V.7)
- Vỏ giảm âm – sơn, móc cẩu: Sơn tĩnh điện; có móc cẩu tổ máy (Mẫu số 02B, Yêu cầu khác, mục V.8–V.9)
- Tủ ATS – dòng định mức: ≥ 150A; nêu cụ thể nước SX, nhà SX, năm SX, mã hiệu (Mẫu số 02B, Yêu cầu khác, mục VI.1–VI.5)
- Tủ ATS – điện áp, tần số: 220/380V - 50 Hz (Mẫu số 02B, Yêu cầu khác, mục VI.6)
- Tủ ATS – điều khiển, vận hành, cấu tạo: Kỹ thuật số; tự động hoặc bằng tay; đặt trong hộp kim loại (Mẫu số 02B, Yêu cầu khác, mục VI.7–VI.9)
- Tủ ATS – đấu nối đồng bộ: Đấu nối đồng bộ với phần động lực và bộ điều khiển máy phát, có đầu chờ đấu lưới và phụ tải (Mẫu số 02B, Yêu cầu khác, mục VI.10)
- Tủ ATS – tự khởi động khi mất lưới: Có (Mẫu số 02B, Yêu cầu khác, mục VI.11)
- Phụ kiện kèm theo: Bình ắc quy (gồm dây và cọc); bộ giảm âm và bồn nhiên liệu (Mẫu số 02B, Yêu cầu khác, mục VII)
- Thời gian bảo hành: ≥ 12 tháng (Mẫu số 02B, Yêu cầu khác, mục VIII)

