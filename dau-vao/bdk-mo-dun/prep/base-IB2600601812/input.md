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

## Phần kỹ thuật của HSMT
--- Tệp: 3. QĐ phê duyệt PA-DT mua sam TB 2027.pdf ---
TỔNG CÔNG TY                        CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
  ĐIỆN LỰC MIỀN TRUNG                             Độc lập - Tự do - Hạnh phúc
CÔNG TY ĐIỆN LỰC ĐẮK LẮK
                                             Đắk
                                             Đắk Lắk,
                                                 Lắk, ngày
                                                      ngày 10 tháng 9 năm 2026
       Số:
       Số:10821/QĐ-ĐLPC

                               QUYẾT ĐỊNH
                    Về việc phê duyệt Phương án-dự toán
            Dự án: Mua sắm thiết bị phục vụ SXKD ĐLPC năm 2027


                  GIÁM ĐỐC CÔNG TY ĐIỆN LỰC ĐẮK LẮK


     Căn cứ Luật Đấu thầu số 22/2023/QH15 ngày 23/6/2023 được sửa đổi bổ sung tại
Luật số 57/2024/QH15 ngày 29/11/2024 và Luật số 90/2025/QH15 ngày 25/6/2025;
      Căn cứ Nghị định số 214/2025/NÐ-CP ngày 04/8/2025 của Chính phủ về Quy định
chi tiết một số điều và biện pháp thi hành Luật Đấu thầu về lựa chọn nhà thầu;
      Căn cứ Thông tư 79/2025/TT-BTC ngày 04-08-2025 của Bộ Tài chính hướng dẫn
việc cung cấp, đăng tải thông tin về lựa chọn nhà thầu và mẫu hồ sơ đấu thầu trên Hệ
thống mạng đấu thầu quốc gia;
     Căn cứ Quyết định số 252/QĐ-HĐTV ngày 15/04/2026 của Hội đồng thành viên
Tổng công ty Điện lực miền Trung về việc ban hành Quy chế phân cấp của EVNCPC;
     Căn cứ Quyết định số 2632/QĐ-EVNCPC ngày 04/5/2026 của Tổng công ty Điện
lực miền Trung về việc ban hành Quy định phân cấp của Tổng giám đốc EVNCPC cho
người đứng đầu các đơn vị trực thuộc EVNCPC;
     Căn cứ Quyết định số 4016/QĐ-EVNCPC ngày 30/6/2026 của Tổng công ty Điện
lực miền Trung về việc tạm giao kế hoạch ĐTXD năm 2027 – ĐLPC;
     Căn cứ Quyết định số 7720/QĐ-ĐLPC ngày 01/7/2026 của Công ty Điện lực Đắk
Lắk về việc tạm giao nhiệm vụ điều hành quản lý dự án các công trình ĐTXD ĐLPC
năm 2027;
     Căn cứ Quyết định số 7879/QĐ-ĐLPC ngày 06/7/2026 của Giám đốc Công ty Điện
lực Đắk Lắk về việc phê duyệt Tổng tiến độ các công trình đầu tư xây dựng tỉnh Đắk Lắk
năm 2027;
   Căn cứ Phương án kỹ thuật – dự toán dự án: Mua sắm thiết bị phục vụ SXKD
ĐLPC năm 2027 do Công ty Điện lực Đắk Lắk lập tháng 9 năm 2026;
     Căn cứ Báo cáo thẩm định số 947/ĐT ngày 09/9/2026 của các thành viên tham gia
thẩm định về việc Báo cáo thẩm định Phương án - dự toán dự án: Mua sắm thiết bị phục
vụ SXKD ĐLPC năm 2027;
     Theo đề nghị tại Tờ trình số 10749/TTr-ĐLPC ngày 09/9/2026 của Công ty Điện
lực Đắk Lắk về việc thẩm định, phê duyệt Phương án - dự toán dự án: Mua sắm thiết bị
phục vụ SXKD ĐLPC năm 2027;
     Theo đề nghị của Trưởng phòng Quản lý Đầu tư.
                                    QUYẾT ĐỊNH:

   Điều 1. Phê duyệt Phương án - dự toán dự án: Mua sắm thiết bị phục vụ SXKD
ĐLPC năm 2027, với nội dung chính như sau:
       1. Tên dự án: Mua sắm thiết bị phục vụ SXKD ĐLPC năm 2027;
       2. Quy mô mua sắm thiết bị:
  TT                        Tên thiết bị                     Đơn vị tính    Số lượng
   1     Camera nhiệt ống kính tầm xa                             Bộ            01
         Máy quay chuyên nghiệp Sony PXW-Z200 +
         Chân máy quay Libec TH-Z Tripod + Thẻ nhớ
   2                                                              Bộ            01
         CFexpress Lexar Professional 160GB Type A
         GOLD Series LCAGOLD160G-RNENG
   3     Máy photocopy Canon iR 2925i (3 trong 1)                 Bộ            01
   4      Máy phát điện 100kVA                                      Bộ           01
       3. Dự toán chi phí mua sắm:                           904.636.424 đồng.
       Trong đó:        Chi phí mua sắm thiết bị (sau thuế): 861.558.499 đồng.
                        Chi phí dự phòng:                       43.077.925 đồng.
       4. Nguồ n vố n: ĐTPT Công ty mẹ;
                              ̣ Năm 2027;
       5. Thời gian thực hiên:
       6. Yêu cầu kỹ thuật thiết bị: Theo Phương án kỹ thuật – dự toán kèm theo.
      Điều 2. Ban Quản lý dự án ĐTXD Công ty Điện lực Đắk Lắk chịu trách nhiệm
triển khai các bước tiếp theo đảm bảo tuân thủ các quy định hiện hành.
     Điều 3. Quyết định này có hiệu lực thi hành kể từ ngày ký. Trưởng các Phòng, Ban
thuộc Công ty có liên quan căn cứ quyết định thi hành./.

 Nơi nhận:                                                     GIÁM ĐỐC
 - PGĐ ĐTXD, PGĐ ĐT (để chỉ đạo);
 - QLDA (phối hợp);
 - Lưu: VT, ĐT.




                                                            Trần Văn Thuận

--- Tệp: 3. QD-PD-KHLCNT mua sắm thiết bị 2027.pdf ---
TỔNG CÔNG TY                        CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
  ĐIỆN LỰC MIỀN TRUNG                             Độc lập - Tự do - Hạnh phúc
CÔNG TY ĐIỆN LỰC ĐẮK LẮK
                                             Đắk
                                             Đắk Lắk,
                                                 Lắk, ngày
                                                      ngày 04 tháng 10 năm 2026
       Số:
       Số:11840/QĐ-ĐLPC

                                 QUYẾT ĐỊNH
                  Về việc phê duyệt kế hoạch lựa chọn nhà thầu
          Dự án: Mua sắm thiết bị phục vụ SXKD ĐLPC năm 2027
                  GIÁM ĐỐC CÔNG TY ĐIỆN LỰC ĐẮK LẮK

     Căn cứ Luật Đấu thầu số 22/2023/QH15 ngày 23/6/2023 được sửa đổi bổ sung tại
Luật số 57/2024/QH15 ngày 29/11/2024 và Luật số 90/2025/QH15 ngày 25/6/2025;
      Căn cứ Nghị định số 214/2025/NÐ-CP ngày 04/8/2025 của Chính phủ về Quy định
chi tiết một số điều và biện pháp thi hành Luật Đấu thầu về lựa chọn nhà thầu;
     Căn cứ Nghị định số 349/2026/NĐ-CP ngày 09/9/2026 của Chính phủ sửa đổi, bổ
sung một số điều của các Nghị định quy định chi tiết một số điều và biện pháp thi hành
Luật Đấu thầu về lựa chọn nhà thầu;
      Căn cứ Thông tư 79/2025/TT-BTC ngày 04-08-2025 của Bộ Tài chính hướng dẫn
việc cung cấp, đăng tải thông tin về lựa chọn nhà thầu và mẫu hồ sơ đấu thầu trên Hệ
thống mạng đấu thầu quốc gia;
     Căn cứ Quyết định số 252/QĐ-HĐTV ngày 15/04/2026 của Hội đồng thành viên
Tổng công ty Điện lực miền Trung về việc ban hành Quy chế phân cấp của EVNCPC;
     Căn cứ Quyết định số 2632/QĐ-EVNCPC ngày 04/5/2026 của Tổng công ty Điện
lực miền Trung về việc ban hành Quy định phân cấp của Tổng giám đốc EVNCPC cho
người đứng đầu các đơn vị trực thuộc EVNCPC;
     Căn cứ Quyết định số 243/QĐ-HĐTV ngày 14/4/2026 của Hội đồng thành viên
Tổng công ty Điện lực miền Trung về việc ban hành quy chế mua sắm trong Tổng công
ty Điện lực miền Trung;
     Căn cứ Quyết định số 4016/QĐ-EVNCPC ngày 30/6/2026 của Tổng công ty Điện
lực miền Trung về việc tạm giao kế hoạch ĐTXD năm 2027 – ĐLPC;
     Căn cứ Quyết định số 7720/QĐ-ĐLPC ngày 01/7/2026 của Công ty Điện lực Đắk
Lắk về việc tạm giao nhiệm vụ điều hành quản lý dự án các công trình ĐTXD ĐLPC
năm 2027;
     Căn cứ Quyết định số 7879/QĐ-ĐLPC ngày 06/7/2026 của Giám đốc Công ty Điện
lực Đắk Lắk về việc phê duyệt Tổng tiến độ các công trình đầu tư xây dựng tỉnh Đắk Lắk
năm 2027;
     Căn cứ Quyết định số 10821/QĐ-ĐLPC ngày 10/9/2026 của Công ty Điện lực Đắk
Lắk về việc phê duyệt phương án - dự toán Mua sắm thiết bị phục vụ SXKD ĐLPC năm
2027;
     Căn cứ Báo cáo thẩm định số 1024/ĐT ngày 02/10/2026 của Công ty Điện lực Đắk
Lắk về việc thẩm định kế hoạch lựa chọn nhà thầu dự án: Mua sắm thiết bị phục vụ
SXKD ĐLPC năm 2027;
     Theo đề nghị tại Tờ trình số 1286/QLDA ngày 30/9/2026 của Ban Quản lý dự án
đầu tư xây dựng về việc phê duyệt kế hoạch nhà thầu dự án: Mua sắm thiết bị phục vụ
SXKD ĐLPC năm 2027;
     Theo đề nghị của Trưởng phòng Quản lý Đầu tư.

                                    QUYẾT ĐỊNH:

   Điều 1. Phê duyệt kế hoạch lựa chọn nhà thầu dự án: Mua sắm thiết bị phục vụ
SXKD ĐLPC năm 2027, với nội dung chi tiết theo phụ lục đính kèm.
     Điều 2. Quyết định này có hiệu lực thi hành kể từ ngày ký. Trưởng các Phòng, Ban
thuộc Công ty có liên quan căn cứ quyết định thi hành./.


 Nơi nhận:                                                  GIÁM ĐỐC
 - PGĐ ĐTXD, PGĐ ĐT (để chỉ đạo);
 - QLDA (phối hợp);
 - Lưu: VT, ĐT.




                                                         Trần Văn Thuận
                                                        Phụ lục
                 BẢNG TỔNG HỢP PHẦN CÔNG VIỆC THUỘC KẾ HOẠCH LỰA CHỌN NHÀ THẦU
                   (Kèm theo Quyết định số: … ngày … tháng 10 năm 2026 của Công ty Điện lực Đắk Lắk)



                                                                             Hình                Thời                       Thời
                                                                                     Phương
                                                                             thức                gian                       gian
                                                                                     thức lựa         Thời gian Loại
                                                                   Nguồn      lựa                  tổ                       thực     Tùy
                                                    Giá gói thầu                       chọn            bắt đầu  hợp
                      Tên gói thầu                                  vốn      chọn                chức                       hiện    chọn
     Tên                                                                                nhà            tổ chức đồng
TT                                                                            nhà                 lựa                        gói    mua
     chủ                                                                               thầu           lựa chọn
                                                                             thầu                chọn                       thầu    thêm
     đầu                                                                                              nhà thầu
                                                                                                  nhà
      tư
                                                                                                 thầu
                          Tóm tắt công việc chính
           Tên gói thầu
                               của gói thầu
                                                                             Chào
             Gói thầu
                           Cung cấp 01 máy phát                                giá                                 Theo
           01/TB.2027:                                              ĐTPT             Một giai     Tối
                            điện 100kVA hãng                                  trực                         Quý      đơn      90     Không
1            Cung cấp                               466.000.000    Công ty           đoạn một    đa 60
                           Huyndai/Trung Quốc                                tuyến                       IV/2026   giá cố   ngày   áp dụng
             máy phát                                                mẹ              túi hồ sơ   ngày
                                                                               rút                                  định
           điện 100kVA
     Công                                                                     gọn
       ty   Gói thầu                                                         Chào
                        Cung cấp 01 camera
     Điện 02/TB.2027:                                                          giá                                 Theo
                       nhiệt ống kính tầm xa                        ĐTPT             Một giai     Tối
      lực  Cung cấp                                                           trực                         Quý      đơn      90     Không
2                            nhãn hiệu              113.080.000    Công ty           đoạn một    đa 60
     Đắk Camera nhiệt                                                        tuyến                       IV/2026   giá cố   ngày   áp dụng
                        HIKMICRO/Trung                               mẹ              túi hồ sơ   ngày
     Lắk ống kính tầm                                                          rút                                  định
                               Quốc
              xa                                                              gọn
          Gói thầu số Cung cấp 01 Máy quay                                   Chào                                  Theo
                                                                    ĐTPT             Một giai     Tối
          03/TB.2027:   chuyên nghiệp Sony                                     giá                         Quý      đơn      90     Không
3                                                                  Công ty           đoạn một    đa 60
           Cung cấp   PXW-Z200 + Chân máy           241.342.750               trực                       IV/2026   giá cố   ngày   áp dụng
                                                                     mẹ              túi hồ sơ   ngày
           máy quay quay Libec TH-Z Tripod                                   tuyến                                  định
               phim và máy    + Thẻ nhớ CFexpress                            rút
                photocopy       Lexar Professional                           gọn
                             160GB Type A GOLD
                            Series LCAGOLD160G-
                               RNENG và 01 Máy
                               photocopy Canon iR
                                 2925i (3 trong 1)
                 Tổng giá gói thầu                 820.422.750

Ghi chú:      - Giá gói thầu được lập trên cơ sở dự toán thuế GTGT 10%. Trong quá trình lựa chọn nhà thầu, ký hợp đồng, Chủ đầu tư thực
hiện theo chính sách thuế GTGT hiện hành;
              - Thời gian thực hiện gói thầu (Thời gian thực hiện các công việc của hợp đồng): Tính từ ngày hợp đồng có hiệu lực đến ngày
       nghiệm thu bàn giao hoàn thành gói thầu (bao gồm cả dịch vụ liên quan nếu có), không bao gồm thời gian hoàn thành nghĩa vụ bảo
       hành, trong đó thời gian giao hàng như bảng trên.

--- Thông báo mời thầu ---
Thông tin cơ bản
Mã E-TBMT
IB2600601812
Ngày đăng tải
09/11/2026 08:12
Phiên bản thay đổi
00
Trạng thái
Đã đăng tải
Thông tin chung của KHLCNT
Mã KHLCNT
PL2600334705
Phân loại KHLCNT
Chi đầu tư phát triển
Tên dự án/dự toán mua sắm
Mua sắm thiết bị phục vụ SXKD ĐLPC năm 2027
Thông tin gói thầu
Tên gói thầu
Gói thầu 01/TB.2027: Cung cấp máy phát điện 100kVA
Chủ đầu tư
CÔNG TY ĐIỆN LỰC ĐẮK LẮK - CHI NHÁNH TỔNG CÔNG TY ĐIỆN LỰC MIỀN TRUNG
Chi tiết nguồn vốn
ĐTPT của Tổng công ty Điện lực miền Trung
Lĩnh vực
Hàng hóa
Hình thức LCNT
Chào giá trực tuyến theo quy trình rút gọn
Loại hợp đồng
Đơn giá cố định
Địa điểm thực hiện gói thầu
Phường Buôn Ma Thuột, Tỉnh Đắk Lắk
Thời gian thực hiện gói thầu
90 Ngày
Thông tin chào giá
Thời điểm bắt đầu chào giá trực tuyến
13/11/2026 08:00
Thời điểm kết thúc chào giá trực tuyến
16/11/2026 10:00
Giá trần
466.000.000 VND
Bước giá
1.300.000 VND
Hiệu lực của đơn dự thầu
60 ngày
Phạm vi cung cấp
Mẫu số 02B. PHẠM VI CUNG CẤP HÀNG HÓA (áp dụng đối với loại hợp đồng theo đơn giá)
Xuất Excel
STT	Danh mục hàng hóa	Đơn vị tính	Khối lượng	Ký mã hiệu	Nhãn hiệu	Hãng sản xuất	Xuất xứ của hàng hóa	Năm sản xuất	Thông số kỹ thuật	Địa điểm dự án	Ngày giao hàng sớm nhất	Ngày giao hàng muộn nhất	Yêu cầu khác
1	Máy phát điện 100kVA	Bộ	1	DHY110K SE	Huyndai	Huyndai	Trung Quốc hoặc tương đương	Từ 2026 trở về sau	I Thông số kỹ thuật chung tổ máy phát điện 1 Loại máy Máy phát điện diesel có vỏ giảm âm, công suất 100kVA, 03 pha 2 Nước sản xuất Trung Quốc hoặc tương đương 3 Nhà sản xuất Huyndai 4 Mã hiệu DHY110K SE 5 Tình trạng Mới 100% 6 Công suất liên tục ≥ 100 kVA 7 Công suất tối đa ≥ 110 kVA 8 Hệ số công suất ≥ 0,8 9 Điện áp định mức 380V/220V 10 Tốc độ vòng quay ≤ 1500 vòng/phút 11 Tần số 50Hz 12 Điều chỉnh công suất khi thay đổi tải Tự động điều chỉnh 13 Tiêu hao nhiên liệu ở mức 100% tải ≤ 25 lít/giờ 14 Tiêu hao nhiên liệu ở mức 50% tải ≤ 15 lít/giờ 15 Khả năng quá tải 10% tải trong vòng 01 giờ cho mỗi 24 giờ vận hành liên tục 16 Khung bệ máy Được xử lý bề mặt bằng hóa chất để tránh ôxy hóa và sơn tĩnh điện 17 Nhiên liệu sử dụng Dầu Diezel 18 Thời gian chạy liên tục Không hạn chế 19 Dung tích bình nhiên liệu ≥ 170 lít 20 Kích thước (DxRxC) (mm) Nêu cụ thể 21 Trọng lượng tổ hợp máy phát điện (kg) Nêu cụ thể II Thông số kỹ thuật động cơ: 1 Nước sản xuất Nêu cụ thể 2 Nhà sản xuất Nêu cụ thể 3 Mã hiệu Nêu cụ thể 4 Tình trạng Mới 100% 5 Năm sản xuất Nêu cụ thể 6 Công suất liên tục ≥ 100 kVA/80kW 7 Công suất tối đa ≥ 110 kVA/88kW 8 Loại động cơ Diesel 4 kỳ 9 Hệ thống nhiên liệu Bơm phun trực tiếp, điều khiển bằng điện tử 10 Kiểu điều tốc Điện tử 11 Số xy lanh Nêu cụ thể 12 Tốc độ quay ≤ 1500 vòng/phút 13 Tỉ số nén Nêu cụ thể 14 Hành trình xilanh Nêu cụ thể 15 Tiêu chuẩn khí thải Phù hợp với điều kiện của Việt Nam 16 Hệ thống nạp khí Turbo tăng áp 17 Hệ thống khởi động Bằng môtơ khởi động, kèm theo ắc quy 18 Hệ thống làm mát Làm mát cưỡng bức tuần hoàn bằng két nước, kết hợp với quạt gió 19 Độ ồn cách 7 mét (không vật chắn) ≤ 70±5dB III Thông số kỹ thuật đầu phát điện 1 Nước sản xuất Nêu cụ thể 2 Nhà sản xuất Nêu cụ thể 3 Mã hiệu Nêu cụ thể 4 Tình trạng Mới 100% 5 Năm sản xuất Nêu cụ thể 6 Điện áp 380V/220V 7 Số pha - số dây 3 pha - 4 dây 8 Kiểu đầu phát Xoay chiều, từ trường quay, không chổi than, tự động kích từ, tự động điều chỉnh điện áp 9 Công suất liên tục ≥ 100 kVA 10 Tần số định mức 50 Hz 11 Cấp cách điện Cấp H 12 Dao động điện áp ≤ ± 1% Uđm 13 Số vòng quay ≤ 1500 vòng/phút	Số 53 Trần Quý Cáp - Phường Buôn Ma Thuột-tỉnh Đắk Lắk	30	90	IV Thông số kỹ thuật bộ điều khiển 1 Nước sản xuất Nêu cụ thể 2 Nhà sản xuất Nêu cụ thể 3 Mã hiệu Nêu cụ thể 4 Tình trạng Mới 100%. Bảng điều khiển được bố trí thuận lợi, ở nơi dể thấy, dể nhìn, dể thao tác. Tất cả hệ thống chỉ thị, cảnh báo trên bảng điều khiển rõ ràng, chính xác; thiết kế gắn trên máy phát, có đèn chiếu sáng. 5 Năm sản xuất Nêu cụ thể 6 Nguyên lý điều khiển Kỹ thuật số 7 Chức năng điều khiển: + Kết hợp được với tủ ATS. + Khởi động máy và tắt máy. + Dừng máy khẩn cấp. + Chọn lựa các chế độ làm việc; điều khiển trạng thái và lập trình. + Chức năng điều khiển từ xa qua cổng Internet/5G, điều khiển đóng mở máy và đọc được các thông số như trên màn hình của bộ điều khiển . 8 Chức năng do lường, hiển thị các thông số máy và chức năng bảo vệ 1. Đo lường Thông số chung: + Số giờ vận hành máy. + Số lần khởi động máy. + Nhật ký lỗi. Thông số đầu phát: + Công suất tác dụng, công suất biểu kiến. + Điện áp các pha. + Dòng điện các pha. + Hệ số công suất. + Tần số. Thông số động cơ: + Tốc độ động cơ. + Nhiệt độ nước làm mát. + Điện áp ắc quy. + Nhiệt độ, Áp suất bôi trơn. + Mức nhiên liệu trong thùng chứa. 2. Bảo vệ + Quá tải. + Ngắn mạch. + Điện áp cao/thấp. + Quá dòng. + Phát ngược công suất. + Nhiệt độ nước làm mát quá cao. + Áp lực dầu nhớt thấp dưới mức cho phép. + Vượt tốc. + Tần số quá cao/quá thấp cho phép. + Điện áp quá cao/quá thấp cho phép. + Mức nhiên liệu thấp/ Hết nhiên liệu. + Sai lệch điện áp AC giữa các pha quá lớn. 9 Các cổng giao tiếp + Cổng kết nối với hệ thống kiểm soát từ xa. + Cổng kết nối USB. + Cổng cho phép liên kết và đọc dữ liệu trực tiếp từ động cơ. V Vỏ giảm âm 1 Nước sản xuất Nêu cụ thể 2 Nhà sản xuất Nêu cụ thể 3 Mã hiệu Nêu cụ thể 4 Năm sản xuất Nêu cụ thể 5 Vật liệu chế tạo Thép dày ≥ 2mm, sơn tĩnh điện 6 Các lỗ thông hơi Được ngăn bằng lưới để chống chuột, rắn v.v. thâm nhập vào thùng máy 7 Vật liệu cách âm Vật liệu chống cháy, dày 20 ÷ 50mm 8 Sơn thùng cách âm Sơn tĩnh diện 9 Móc cẩu để cẩu tổ máy Có VI Tủ chuyển đổi nguồn tự động (ATS) 1 Nước sản xuất Nêu cụ thể 2 Nhà sản xuất Nêu cụ thể 3 Năm sản xuất Nêu cụ thể 4 Mã hiệu Nêu cụ thể 5 Dòng tải định mức ≥ 150A 6 Điện áp - tần số làm việc 220/380V - 50 Hz 7 Nguyên lý điều khiển Kỹ thuật số 8 Chế độ vận hành Tự động hoặc bằng tay 9 Cấu tạo Đặt trong hộp kim loại. 10 Tính đồng bộ Bộ ATS phải được đấu nối đồng bộ với phần động lực và bộ điều khiển của máy phát điện và có đầu chờ để đấu nối với điện lưới và phụ tải. 11 Bộ ATS có chức năng tự động khởi động máy phát và đóng điện cấp tải trong trường hợp mất điện lưới cấp điện cho các phụ tải Có VII Phụ kiện kèm theo máy 1 Bình ắc quy (bao gồm dây và cọc) Có 2 Bộ giảm âm và bồn nhiên liệu Có VIII Thời gian bảo hành ≥ 12 tháng.Ghi chú: Do chưa xác định rõ ràng được mức thuế GTGT cụ thể trong giai đoạn LCNT. Chủ đầu tư tạm xác định mức thuế suất GTGT là 10%, yêu cầu các nhà thầu tính toán và chào thầu với mức thuế GTGT là 10%. Chủ đầu tư sẽ tính toán giá chào thầu tương ứng với mức thuế GTGT là 10% để làm cơ sở đánh giá thầu và ký hợp đồng.
Chi phí dự phòng (%) 0

Thời điểm kết thúc chào giá trực tuyến

10:00

16/11/2026

Thời gian còn lại

6 ngày 23 giờ 48 phút 50 giây

 Quay trở lại
Các trang liên quan
Cổng Dịch vụ công quốc gia
Cổng thông tin điện tử Bộ Tài chính
Liên kết nhanh
Thông báo
Tin tức
Hướng dẫn
Đào tạo
Địa chỉ:

Cục Quản lý đấu thầu:
Tầng 1, Tòa nhà Cục Quản lý đấu thầu, Số 4, Ngõ Hàng Chuối 1, phố Hàng Chuối, Phường Hai Bà Trưng, Hà Nội.

Trung tâm Đấu thầu qua mạng quốc gia:
Tầng 6, Tòa nhà Cục Quản lý đấu thầu, Số 4, Ngõ Hàng Chuối 1, phố Hàng Chuối, Phường Hai Bà Trưng, Hà Nội.

Liên hệ
Tổng đài: 19006126
Email: hotro@muasamcong.gov.vn
f
Zalo Official Account

© 2022 Trung tâm Đấu thầu qua mạng quốc gia. Cục Quản lý đấu thầu. Bộ Tài chính.

### Danh mục hàng hóa (tab Thông tin chung)
STT	Danh mục hàng hóa	Đơn vị tính	Khối lượng	Ký mã hiệu	Nhãn hiệu	Hãng sản xuất	Xuất xứ của hàng hóa	Năm sản xuất	Thông số kỹ thuật	Địa điểm dự án	Ngày giao hàng sớm nhất	Ngày giao hàng muộn nhất	Yêu cầu khác
1	Máy phát điện 100kVA	Bộ	1	DHY110K SE	Huyndai	Huyndai	Trung Quốc hoặc tương đương	Từ 2026 trở về sau	I Thông số kỹ thuật chung tổ máy phát điện 1 Loại máy Máy phát điện diesel có vỏ giảm âm, công suất 100kVA, 03 pha 2 Nước sản xuất Trung Quốc hoặc tương đương 3 Nhà sản xuất Huyndai 4 Mã hiệu DHY110K SE 5 Tình trạng Mới 100% 6 Công suất liên tục ≥ 100 kVA 7 Công suất tối đa ≥ 110 kVA 8 Hệ số công suất ≥ 0,8 9 Điện áp định mức 380V/220V 10 Tốc độ vòng quay ≤ 1500 vòng/phút 11 Tần số 50Hz 12 Điều chỉnh công suất khi thay đổi tải Tự động điều chỉnh 13 Tiêu hao nhiên liệu ở mức 100% tải ≤ 25 lít/giờ 14 Tiêu hao nhiên liệu ở mức 50% tải ≤ 15 lít/giờ 15 Khả năng quá tải 10% tải trong vòng 01 giờ cho mỗi 24 giờ vận hành liên tục 16 Khung bệ máy Được xử lý bề mặt bằng hóa chất để tránh ôxy hóa và sơn tĩnh điện 17 Nhiên liệu sử dụng Dầu Diezel 18 Thời gian chạy liên tục Không hạn chế 19 Dung tích bình nhiên liệu ≥ 170 lít 20 Kích thước (DxRxC) (mm) Nêu cụ thể 21 Trọng lượng tổ hợp máy phát điện (kg) Nêu cụ thể II Thông số kỹ thuật động cơ: 1 Nước sản xuất Nêu cụ thể 2 Nhà sản xuất Nêu cụ thể 3 Mã hiệu Nêu cụ thể 4 Tình trạng Mới 100% 5 Năm sản xuất Nêu cụ thể 6 Công suất liên tục ≥ 100 kVA/80kW 7 Công suất tối đa ≥ 110 kVA/88kW 8 Loại động cơ Diesel 4 kỳ 9 Hệ thống nhiên liệu Bơm phun trực tiếp, điều khiển bằng điện tử 10 Kiểu điều tốc Điện tử 11 Số xy lanh Nêu cụ thể 12 Tốc độ quay ≤ 1500 vòng/phút 13 Tỉ số nén Nêu cụ thể 14 Hành trình xilanh Nêu cụ thể 15 Tiêu chuẩn khí thải Phù hợp với điều kiện của Việt Nam 16 Hệ thống nạp khí Turbo tăng áp 17 Hệ thống khởi động Bằng môtơ khởi động, kèm theo ắc quy 18 Hệ thống làm mát Làm mát cưỡng bức tuần hoàn bằng két nước, kết hợp với quạt gió 19 Độ ồn cách 7 mét (không vật chắn) ≤ 70±5dB III Thông số kỹ thuật đầu phát điện 1 Nước sản xuất Nêu cụ thể 2 Nhà sản xuất Nêu cụ thể 3 Mã hiệu Nêu cụ thể 4 Tình trạng Mới 100% 5 Năm sản xuất Nêu cụ thể 6 Điện áp 380V/220V 7 Số pha - số dây 3 pha - 4 dây 8 Kiểu đầu phát Xoay chiều, từ trường quay, không chổi than, tự động kích từ, tự động điều chỉnh điện áp 9 Công suất liên tục ≥ 100 kVA 10 Tần số định mức 50 Hz 11 Cấp cách điện Cấp H 12 Dao động điện áp ≤ ± 1% Uđm 13 Số vòng quay ≤ 1500 vòng/phút	Số 53 Trần Quý Cáp - Phường Buôn Ma Thuột-tỉnh Đắk Lắk	30	90	IV Thông số kỹ thuật bộ điều khiển 1 Nước sản xuất Nêu cụ thể 2 Nhà sản xuất Nêu cụ thể 3 Mã hiệu Nêu cụ thể 4 Tình trạng Mới 100%. Bảng điều khiển được bố trí thuận lợi, ở nơi dể thấy, dể nhìn, dể thao tác. Tất cả hệ thống chỉ thị, cảnh báo trên bảng điều khiển rõ ràng, chính xác; thiết kế gắn trên máy phát, có đèn chiếu sáng. 5 Năm sản xuất Nêu cụ thể 6 Nguyên lý điều khiển Kỹ thuật số 7 Chức năng điều khiển: + Kết hợp được với tủ ATS. + Khởi động máy và tắt máy. + Dừng máy khẩn cấp. + Chọn lựa các chế độ làm việc; điều khiển trạng thái và lập trình. + Chức năng điều khiển từ xa qua cổng Internet/5G, điều khiển đóng mở máy và đọc được các thông số như trên màn hình của bộ điều khiển . 8 Chức năng do lường, hiển thị các thông số máy và chức năng bảo vệ 1. Đo lường Thông số chung: + Số giờ vận hành máy. + Số lần khởi động máy. + Nhật ký lỗi. Thông số đầu phát: + Công suất tác dụng, công suất biểu kiến. + Điện áp các pha. + Dòng điện các pha. + Hệ số công suất. + Tần số. Thông số động cơ: + Tốc độ động cơ. + Nhiệt độ nước làm mát. + Điện áp ắc quy. + Nhiệt độ, Áp suất bôi trơn. + Mức nhiên liệu trong thùng chứa. 2. Bảo vệ + Quá tải. + Ngắn mạch. + Điện áp cao/thấp. + Quá dòng. + Phát ngược công suất. + Nhiệt độ nước làm mát quá cao. + Áp lực dầu nhớt thấp dưới mức cho phép. + Vượt tốc. + Tần số quá cao/quá thấp cho phép. + Điện áp quá cao/quá thấp cho phép. + Mức nhiên liệu thấp/ Hết nhiên liệu. + Sai lệch điện áp AC giữa các pha quá lớn. 9 Các cổng giao tiếp + Cổng kết nối với hệ thống kiểm soát từ xa. + Cổng kết nối USB. + Cổng cho phép liên kết và đọc dữ liệu trực tiếp từ động cơ. V Vỏ giảm âm 1 Nước sản xuất Nêu cụ thể 2 Nhà sản xuất Nêu cụ thể 3 Mã hiệu Nêu cụ thể 4 Năm sản xuất Nêu cụ thể 5 Vật liệu chế tạo Thép dày ≥ 2mm, sơn tĩnh điện 6 Các lỗ thông hơi Được ngăn bằng lưới để chống chuột, rắn v.v. thâm nhập vào thùng máy 7 Vật liệu cách âm Vật liệu chống cháy, dày 20 ÷ 50mm 8 Sơn thùng cách âm Sơn tĩnh diện 9 Móc cẩu để cẩu tổ máy Có VI Tủ chuyển đổi nguồn tự động (ATS) 1 Nước sản xuất Nêu cụ thể 2 Nhà sản xuất Nêu cụ thể 3 Năm sản xuất Nêu cụ thể 4 Mã hiệu Nêu cụ thể 5 Dòng tải định mức ≥ 150A 6 Điện áp - tần số làm việc 220/380V - 50 Hz 7 Nguyên lý điều khiển Kỹ thuật số 8 Chế độ vận hành Tự động hoặc bằng tay 9 Cấu tạo Đặt trong hộp kim loại. 10 Tính đồng bộ Bộ ATS phải được đấu nối đồng bộ với phần động lực và bộ điều khiển của máy phát điện và có đầu chờ để đấu nối với điện lưới và phụ tải. 11 Bộ ATS có chức năng tự động khởi động máy phát và đóng điện cấp tải trong trường hợp mất điện lưới cấp điện cho các phụ tải Có VII Phụ kiện kèm theo máy 1 Bình ắc quy (bao gồm dây và cọc) Có 2 Bộ giảm âm và bồn nhiên liệu Có VIII Thời gian bảo hành ≥ 12 tháng.Ghi chú: Do chưa xác định rõ ràng được mức thuế GTGT cụ thể trong giai đoạn LCNT. Chủ đầu tư tạm xác định mức thuế suất GTGT là 10%, yêu cầu các nhà thầu tính toán và chào thầu với mức thuế GTGT là 10%. Chủ đầu tư sẽ tính toán giá chào thầu tương ứng với mức thuế GTGT là 10% để làm cơ sở đánh giá thầu và ký hợp đồng.
Chi phí dự phòng (%) 0