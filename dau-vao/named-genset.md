# Đầu vào: HSMT nêu đích danh hãng + model TỔ MÁY mà Gợi ý cấu hình ra hàng không liên quan (Khoa 12/11, IB2600601812)

## Sự việc (điều phối đo 12/11 trên configmatch lượt 15:50Z)
- HSMT IB2600601812 (100 kVA, đóng 16/11): "3 Nhà sản xuất Huyndai", "4 Mã hiệu DHY110K SE", "2 Nước sản xuất Trung Quốc hoặc tương đương". Yêu cầu đã đọc đúng: `genset_make` = "Huyndai", `genset_model` = "DHY110K SE", `genset_origin`.
- Kết quả: 6 cấu hình Yuchai / SDEC / Weichai / Perkins / Volvo / Cummins (fdk-energy…), check "Hãng sản xuất tổ máy" và "Model tổ máy" đều `unclear` "chỉ đạt nếu được chấp nhận hàng tương đương". Không có dòng nào của đúng model HSMT nêu. notes: "danh mục không có tổ máy hãng này", "Trên mạng chỉ thấy đại lý ngoài Trung Quốc bán model này".
- Lượt 09/11 từng ra 2 cấu hình Hyundai (động cơ HY6B135Z) lấy từ trang không chính thức; sau các quy tắc 12/11 thì mất.
- Model có thật: Hyundai DHY110KSE (thương hiệu Hyundai Power Products, hàng cấp phép, tổ máy diesel 1500 v/p, 110 kVA dự phòng / 100 kVA liên tục — đúng bằng số HSMT đòi, tức HSMT viết quanh model này). Trang thương hiệu: hyundaipower-de.com (có PDF manual dòng Diesel 1500), hyundaipowerequipment.co.uk; trang bán lại: genelite.com.au, micksgonebush.com.au.

## Nguyên nhân (chẩn đoán của điều phối, cần xác nhận trong code)
1. Dữ liệu: `suppliers/cn/` chỉ có hd-hyundai-heavy, hd-hyundai-infracore, zhenjiang-cssc-hyundai; không có Hyundai Power Products / dòng DHY.
2. Code: `named(hints, model)` trong `candidates()` chỉ nhận model động cơ / đầu phát có sẵn trong danh mục; không có đường riêng cho HÃNG + MODEL TỔ MÁY HSMT nêu. `config-bot.mjs` không có chữ "hyundai"; chính tả "Huyndai" không được chuẩn hoá.
3. Quy tắc chặn nhau: "HSMT không đòi G7 / G20 → chỉ NCC đặt tại Trung Quốc" + "trang bên bán (tier C) không vào danh mục" (Khoa 12/11) loại luôn nguồn duy nhất của model được nêu, dù HSMT chỉ đòi "Trung Quốc hoặc tương đương".
4. Prompt bước 5 bảo trả `configs: []` khi không có cấu hình đạt hãng được nêu; agent lại trả 6 cấu hình "tương đương" mà không có gì phân biệt trên thẻ.
