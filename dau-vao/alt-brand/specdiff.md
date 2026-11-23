<!-- spec-diff -->
## Kiểm chéo danh mục (spec-diff): git:8f830469 ↔ .

- Bản ghi: 62.006 → 62.006; **39** đổi, 0 mất, 0 thêm, ở 6 bảng của 4 NCC
- Tổ máy bảng không ghi mã động cơ (`gensetsOf`, chưa nối Gợi ý): 1.700 → 1.700; 0 đổi, 0 mất, 0 thêm (bản đầy đủ: phần "tổ máy" của artifact)
- Đảo vai động cơ ↔ đầu phát (mã mà ≥ 3 NCC khác đọc ở vai kia): 0 → **0** ✅
- Tự kiểm số với công suất của dòng: 0 giá trị đổi / thêm không tự xác nhận được (soát tay)
- Chưa đọc được (`node suppliers/unread-tables.mjs`, để thiếu thay vì đoán): bảng không cho bản ghi nào: 3.068 → 3.068; bỏ thông số theo bảng: 558 → 558; dòng là cặp nhãn | giá trị: 287 → 287; bảng dọc: không có mã động cơ: 254 → 254; dòng điện / điện áp theo vị trí không khớp công suất: 222 → 222; bảng dọc: công suất có nhãn mức nhưng không đọc được số / đơn vị: 144 → 144; số vô lý so với công suất: 141 → 141; bảng dọc: bảng ghi từ hai model tổ máy trở lên: 108 → 108; ngoại lệ theo dòng: 91 → 91; dòng tổng quan dòng máy: một dải công suất, không là một tổ máy: 90 → 90; số bằng đúng công suất của dòng, không là khối lượng / độ ồn: 77 → 77; bảng dọc: một dòng Model ghi hai mã: trang nhiều sản phẩm: 70 → 70; một ô ghi hai mã: 66 → 66; dòng không đúng bố cục cột của bảng tổ máy: không đọc: 53 → 53; tổ máy nhiều động cơ: 40 → 40; mã đầu phát trùng model tổ máy: 37 → 37; thông số không đúng dạng: để trống: 34 → 34; cặp a/b dưới nhãn không ghi mức / đơn vị: 34 → 34; bảng dọc: không có công suất prime / standby ghi rõ ở phần tổ máy: 33 → 33; dòng không ghi động cơ (bảng có mã động cơ trong danh sách): không đọc: 28 → 28; công suất đầu phát không đọc được: 15 → 15; ô động cơ không đọc được, mã ở cột khác: 14 → 14; dòng không có model đọc được: 12 → 12; hai model trùng khoá (keyOf bỏ dấu chấm), số khác nhau: không đọc: 10 → 10; bảng dọc: không có model tổ máy: 9 → 9; model ghi hai lần với số khác nhau: không đọc: 8 → 8; điện áp trùng công suất của dòng: 6 → 6; dòng bảng tổ máy không có model: 6 → 6; dòng máy lẫn với dòng tiêu đề: 5 → 5; dòng điện tổ máy không khớp công suất: 5 → 5; số trong model khác công suất 50 Hz của dòng: 4 → 4; công suất prime không đọc được: để trống: 4 → 4; ô mã viết dấu － toàn chiều rộng, đọc như '-': 4 → 4; prime lớn hơn standby: để trống cả hai: 3 → 3; bảng dọc: thông số ghi hai lần khác số: 3 → 3; công suất standby không đọc được: để trống: 3 → 3; bảng máy khí: dòng máy trong tiêu đề không đọc thêm: 2 → 2; trang có hai động cơ: số liệu kích cỡ động cơ không rõ của động cơ nào: 2 → 2; số có dấu phẩy nghìn / thập phân không rõ: 2 → 2; dòng bảng động cơ không có model: 1 → 1; ô dòng điện không đọc được thành số: 1 → 1
- Thay đổi là chủ ý thì không chặn; vẫn phải soát MỌI dạng và đo top 30 ứng viên bằng tay (bộ nhớ kiem-cheo-toan-bo). Bản đầy đủ: artifact `spec-diff` của lượt chạy.

### Theo NCC

| NCC | dòng đổi | đổi | mất | thêm |
|---|--:|--:|--:|--:|
| kaihua-genset | 26 | 26 | 0 | 0 |
| baifa-power | 6 | 6 | 0 | 0 |
| sr-genset | 4 | 4 | 0 | 0 |
| penlucky | 3 | 3 | 0 | 0 |

### Dạng thay đổi (vài ví dụ mỗi dạng)

**makes**: 38 lượt, 4 NCC
```
baifa-power n101 b1 dòng 0 LSA 53.2M12: Stamford → 
    | BF-C3763Q-T2 | 3763 | 3363 | QSK95-G10 | | LSA 53.2M12 | TIER 2 | USA
kaihua-genset n119 b23 dòng 0 TAL-A42-H: Stamford → 
    | HC-BD70 | 68.8 | 62.5 | 4M10G70/5 | TAL-A42-H | | 2440*1060*1680 | Download
penlucky n103 b4 dòng 41 PI734E1: Leroy-Somer → 
    | PLW2500B73 | 2500 | 2272 | 20M33G2000/6 | PI734E1 | 7010*2680*2980 | | view
```
**power**: 1 lượt, 1 NCC
```
baifa-power n101 b1 dòng 11 4M08G8D3/5: R 37.5/30 → P 30/· S 37.5/·
    | BF-BD38-T3 | 37.5 | 30 | 4M08G8D3/5 | | STAGE 3A/ CHINA STAGE3 | CHINA
```
