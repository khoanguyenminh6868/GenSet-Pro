<!-- spec-diff -->
## Kiểm chéo danh mục (spec-diff): git:origin/main ↔ .

- Bản ghi: 59.016 → 59.064; **10** đổi, 0 mất, 48 thêm, ở 43 bảng của 2 NCC
- Đảo vai động cơ ↔ đầu phát (mã mà ≥ 3 NCC khác đọc ở vai kia): 0 → **0** ✅
- Tự kiểm số với công suất của dòng: 0 giá trị đổi / thêm không tự xác nhận được (soát tay)
- Chưa đọc được (`node suppliers/unread-tables.mjs`, để thiếu thay vì đoán): bảng không cho bản ghi nào: 3.191 → 3.191; dòng điện / điện áp theo vị trí không khớp công suất: 230 → 230; dòng là cặp nhãn | giá trị: 164 → 164; số vô lý so với công suất: 139 → 139; dòng tổng quan dòng máy: một dải công suất, không là một tổ máy: 90 → 90; số bằng đúng công suất của dòng, không là khối lượng / độ ồn: 77 → 77; mã đầu phát trùng model tổ máy: 37 → 37; cặp a/b dưới nhãn không ghi mức / đơn vị: 34 → 34; tổ máy nhiều động cơ: 6 → 6; điện áp trùng công suất của dòng: 6 → 6; dòng điện tổ máy không khớp công suất: 5 → 5; trang có hai động cơ: số liệu kích cỡ động cơ không rõ của động cơ nào: 2 → 2; số có dấu phẩy nghìn / thập phân không rõ: 2 → 2; một ô ghi hai mã: 1 → 1; ô dòng điện không đọc được thành số: 1 → 1
- Thay đổi là chủ ý thì không chặn; vẫn phải soát MỌI dạng và đo top 30 ứng viên bằng tay (bộ nhớ kiem-cheo-toan-bo). Bản đầy đủ: artifact `spec-diff` của lượt chạy.

### Theo NCC

| NCC | dòng đổi | đổi | mất | thêm |
|---|--:|--:|--:|--:|
| generatordieselchina | 30 | 0 | 0 | 30 |
| genlitec | 28 | 10 | 0 | 18 |

### Dạng thay đổi (vài ví dụ mỗi dạng)

**THÊM bản ghi**: 48 lượt, 2 NCC
```
generatordieselchina n101 b0 dòng L S7L1D-J4: alternator S7L1D-J4
    (bảng nhãn)
genlitec n122 b21 dòng L FGL70030: alternator FGL70030
    (bảng nhãn)
generatordieselchina n101 b0 dòng L LSA 52.3 L12: alternator LSA 52.3 L12
    (bảng nhãn)
```
**makes**: 10 lượt, 1 NCC
```
genlitec n1013 b97 dòng L FGL70030:  → FG Wilson
    (bảng nhãn)
genlitec n1014 b103 dòng L FGL30020:  → FG Wilson
    (bảng nhãn)
genlitec n1015 b109 dòng L FGL20060:  → FG Wilson
    (bảng nhãn)
```
