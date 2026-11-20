# Bốn nhóm bảng còn lại của catalog: khảo sát + phương án (20/11/2026)

Việc CHỈ ĐỌC (Khoa 20/11: "tìm phương án xử lý"): không sửa mã, không PR, không ghi web. Đo trên `origin/main` **389935b3** bằng `fromSupplier` THẬT của `web/catalog.js` chạy trên toàn bộ `suppliers/cn` (9.812 bảng, 65.916 bản ghi). `suppliers/cn`, `web/catalog.js`, `suppliers/config-bot.mjs` không đổi từ 79e9b175 (`git diff --stat` rỗng) nên số top 30 lấy từ lượt đo cloud gốc `dau-vao\catalog-c\top30-cloud\gop-goc.json.gz` (79e9b175, 1.093 lượt, 928 gói) là số của main hiện tại. Script + bảng đủ: `dau-vao\nhom-con-lai\` (mục cuối).

## Câu hỏi cho Khoa (mỗi câu một chữ)

1. **eastern-lion:** "EL 164D" / "ELS 184F" là mã ĐẦU PHÁT của chính NCC (cột "Alternator model", trang "EL Series Brushless Alternator"); "RUIFEN6120" là BỘ ĐIỀU KHIỂN (cột "Controller"). Không phải mã động cơ, không phải mã tổ máy, không phải tên hãng (đã mở lại trang sống 20/11). Đọc "EL/ELS + 3 số" làm mã đầu phát? **A** thêm mẫu vào `ALT_CODE` (khuyến nghị) · **B** chỉ cho danh sách bảng eastern-lion · **C** để nguyên.
2. **eastern-lion n156** (bảng chính hãng "EL Series", 48 model, công suất 50 / 60 Hz, hiện 0 bản ghi) thành bản ghi đầu phát? **C** có · **K** không (khuyến nghị K lúc này: cần đường đọc mới cho bảng của hãng đầu phát).
3. **jianghao n104** (2 bảng, 29 bản ghi, "không rõ"): ngay dưới bảng trang ghi "The above generators can be used natural gas, oil filed gas, bio-gas…". Ghi nhiên liệu khí cho 29 bản ghi (ngoại lệ cấp bảng, trên nền #958)? **C** có (khuyến nghị) · **K** không.
4. **simpson n124** (10 bản ghi, lọt top 25 lần / 21 gói, hạng 1 ở 1 lượt): trang sống tên "SIMPSON-GasGenerators" nhưng KHÔNG ghi nhiên liệu nào. **A** giữ như cũ · **B** loại khỏi gói diesel tới khi rõ · **C** giao việc tìm datasheet động cơ (ZS168FA, ZS182F, ZS190F, GX390, GX630, GX690) trên trang hãng động cơ rồi quyết (khuyến nghị C; trong lúc chờ là A).
5. **164 bảng chữ khí / xăng, 0 bản ghi:** **A** chỉ lưu phân loại này (khuyến nghị) · **B** gắn nhiên liệu theo bảng ngay (hôm nay 0 bản ghi đổi) · **C** đọc 12 bảng tổ máy xăng (119 dòng) cho 32 gói xăng.
6. **29 bảng đầu phát / động cơ rời:** **A** để nguyên · **B** đọc cả 29 · **C** chỉ đọc yingtai n101 / n2003 (bảng động cơ Cummins, cùng dữ liệu hai thứ tiếng) làm nguồn thông số động cơ (khuyến nghị C, đo top 30 trước khi merge).
7. **huatai n111:** **A** để nguyên · **B** đọc cột "额定功率 power (KW)" thành công suất động cơ, CHỈ bảng này (khuyến nghị; Gợi ý dự kiến 0 đổi) · **C** như B và lấy công suất tổ máy từ tên "NNNGF".

## Kết luận bằng số

| nhóm | bảng | dòng | đang ra | phát hiện chính |
|---|--:|--:|---|---|
| 1 eastern-lion (mọi bảng có ô EL / ELS / RUIFEN) | 55 | 1.199 | 22 bảng đúng (690 dòng, động cơ + đầu phát); 14 bảng tổng quan đúng là 0; **15 bảng thiếu đầu phát** (294 dòng); **3 bảng đọc EL làm ĐỘNG CƠ** (26 bản ghi) và **RUIFEN6120 làm ĐẦU PHÁT** (4 bản ghi); 1 bảng đầu phát chính hãng 0 bản ghi | lọt top: 40 lần / 32 gói là dòng thiếu đầu phát; bản ghi sai vai 0 lần top (EL-động cơ 972 lần trong `all`, 370 lượt; RUIFEN-đầu phát 200 lần `all`) |
| 2a nhiên liệu "không rõ" | 5 | 77 | 49 bản ghi, `fuel` rỗng ở #958 | jianghao: nguồn GHI khí (câu dưới bảng) → nên là khí; simpson: không ghi gì (25 lần top); man E3262, kingway: không rõ |
| 2b chữ khí / xăng, 0 bản ghi | 164 | 3.436 | 0 bản ghi (đo lại trên main) | 89 tổ máy khí / biogas / CHP, 31 động cơ khí của hãng, 12 tổ máy xăng, 1 động cơ xăng, 5 bộ điều khiển, 3 không phải tổ máy, 23 không rõ / rao bán. 7 bảng sẽ đọc ở #959 |
| 3 đầu phát / động cơ rời | 29 | 798 | 0 bản ghi | 20 bảng đầu phát (599 dòng, 514 model; 149 khoá đã có, 62 khoá trùng NCC khác: STC / ST là tên dòng chung) + 9 bảng động cơ (199 dòng; 134 khoá đã có) |
| 4 huatai n111 | 1 | 17 | 17 động cơ, KHÔNG công suất | cột công suất động cơ (259–1.012 kW) không đọc; 17 dòng không bao giờ thành ứng viên (không công suất) |

PR mở cùng `web/catalog.js` và vùng đụng: xem mục 5.
