# Việc (D): bộ đọc BẢNG DỌC, chặng 1

Nguồn: báo cáo phân loại `bang-chua-doc-1.md` (19/11/2026, cùng thư mục; số đếm theo main ngày đó, PHẢI đếm lại trên main hiện tại bằng `1-trich.mjs` + `2-phan-loai.mjs`).

Bảng dọc = bảng một máy, mỗi dòng là "nhãn | giá trị", NCC không có `productLines`. Nhóm theo báo cáo: V1 465 bảng (model ở dòng nhãn Model trong bảng), V2 232, V4 186, V5 53, F1 41 (model ở tiêu đề trang). Hiện cho 0 bản ghi.

Chủ dự án (19/11/2026): "làm sao để đọc được thông số đúng là được, cần tìm cách ngăn chặn rủi ro". Hàng rào đã trình chủ dự án:

1. Chặng 1 CHỈ nhóm V1 (model ở dòng nhãn Model trong chính bảng).
2. Model đọc ra không được trùng mã động cơ / đầu phát đã biết trong danh mục.
3. Bắt buộc có công suất mang nhãn prime / standby rõ; không có thì không ra bản ghi.
4. Bảng có từ hai mã model trở lên: bỏ.
5. Bản ghi mang dấu nguồn "bảng dọc" (một trường riêng) để lọc / gỡ được.
6. Bản ghi mới đi qua cổng row-flags như mọi bản ghi.
7. Liệt kê ĐỦ mọi bản ghi mới (NCC, n, bảng, model, mọi số đọc được, dòng nguồn nguyên văn) để điều phối soát từng dòng.
8. Chặng 2 (V2 / V5 / F1, model ở tiêu đề trang) KHÔNG làm trong PR này.

10 bảng tổ máy xăng chủ dự án bảo đọc khi làm bảng dọc (20/11/2026): bison-zhejiang n114 b16 (14 dòng), n114 b17 (14), n114 b18 (13); endress-stromerzeuger n102 b0 (11); gordon-power n105 b7 (15); grupel n103 b1 (2), n107 b3 (2); kena-chongqing n108 b2 (8); kigerpower n2010 b9 (18); zc-power n110 b13 (13). Xem từng bảng có thuộc dạng chặng 1 đọc được không; bảng nào không thì ghi rõ lý do, không ép.
