<!-- spec-diff -->
## Kiểm chéo danh mục (spec-diff): git:ab5c5e07 ↔ .

- Bản ghi: 61.229 → 61.199; **0** đổi, 30 mất, 0 thêm, ở 2 bảng của 1 NCC
- Tổ máy bảng không ghi mã động cơ (`gensetsOf`, chưa nối Gợi ý): 1.700 → 1.700; 0 đổi, 0 mất, 0 thêm (bản đầy đủ: phần "tổ máy" của artifact)
- Đảo vai động cơ ↔ đầu phát (mã mà ≥ 3 NCC khác đọc ở vai kia): 0 → **0** ✅
- Tự kiểm số với công suất của dòng: 0 giá trị đổi / thêm không tự xác nhận được (soát tay)
- Chưa đọc được (`node suppliers/unread-tables.mjs`, để thiếu thay vì đoán): bảng không cho bản ghi nào: 3.112 → 3.112; bỏ thông số theo bảng: 558 → 558; dòng điện / điện áp theo vị trí không khớp công suất: 227 → 227; dòng là cặp nhãn | giá trị: 164 → 164; số vô lý so với công suất: 141 → 141; dòng tổng quan dòng máy: một dải công suất, không là một tổ máy: 90 → 90; số bằng đúng công suất của dòng, không là khối lượng / độ ồn: 77 → 77; ngoại lệ theo dòng: 70 → 70; một ô ghi hai mã: 26 → 56; dòng không đúng bố cục cột của bảng tổ máy: không đọc: 53 → 53; tổ máy nhiều động cơ: 40 → 40; mã đầu phát trùng model tổ máy: 37 → 37; thông số không đúng dạng: để trống: 34 → 34; cặp a/b dưới nhãn không ghi mức / đơn vị: 34 → 34; dòng không ghi động cơ (bảng có mã động cơ trong danh sách): không đọc: 28 → 28; ô động cơ không đọc được, mã ở cột khác: 14 → 14; điện áp trùng công suất của dòng: 6 → 6; dòng bảng tổ máy không có model: 6 → 6; dòng máy lẫn với dòng tiêu đề: 5 → 5; dòng điện tổ máy không khớp công suất: 5 → 5; công suất prime không đọc được: để trống: 4 → 4; ô mã viết dấu － toàn chiều rộng, đọc như '-': 4 → 4; prime lớn hơn standby: để trống cả hai: 3 → 3; công suất standby không đọc được: để trống: 3 → 3; bảng máy khí: dòng máy trong tiêu đề không đọc thêm: 2 → 2; trang có hai động cơ: số liệu kích cỡ động cơ không rõ của động cơ nào: 2 → 2; số có dấu phẩy nghìn / thập phân không rõ: 2 → 2; dòng bảng động cơ không có model: 1 → 1; ô dòng điện không đọc được thành số: 1 → 1
- Thay đổi là chủ ý thì không chặn; vẫn phải soát MỌI dạng và đo top 30 ứng viên bằng tay (bộ nhớ kiem-cheo-toan-bo). Bản đầy đủ: artifact `spec-diff` của lượt chạy.

### Theo NCC

| NCC | dòng đổi | đổi | mất | thêm |
|---|--:|--:|--:|--:|
| sanq-power | 30 | 0 | 30 | 0 |

### Dạng thay đổi (vài ví dụ mỗi dạng)

**MẤT bản ghi**: 30 lượt, 1 NCC
```
sanq-power n111 b16 dòng 0 TAD550GE(530GE): engine TAD550GE(530GE)
    | SQV95 | 75/95 | 68/85 | TAD550GE(530GE) | Germany | UCI224G | 217 | 1290 | 1850 | 2080×940×1550 | 2810×1140×1830 |
sanq-power n111 b16 dòng 1 TAD551GE(531GE): engine TAD551GE(531GE)
    | SQV110 | 88/110 | 80/100 | TAD551GE(531GE) | Germany | UCI274C | 218 | 1350 | 1900 | 2080×920×1550 | 2810×1140×1830 |
sanq-power n111 b16 dòng 2 TAD750GE(532GE): engine TAD750GE(532GE)
    | SQV145 | 114/145 | 105/130 | TAD750GE(532GE) | Germany | UCI274E | 214 | 1400 | 2000 | 2080×920×1550 | 2810×1140×1830 |
```
