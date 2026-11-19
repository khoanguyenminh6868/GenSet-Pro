<!-- spec-diff -->
## Kiểm chéo danh mục (spec-diff): git:82587105 ↔ .

- Bản ghi: 59.787 → 59.786; **4** đổi, 1 mất, 0 thêm, ở 2 bảng của 2 NCC
- Đảo vai động cơ ↔ đầu phát (mã mà ≥ 3 NCC khác đọc ở vai kia): 0 → **0** ✅
- Tự kiểm số với công suất của dòng: 0 giá trị đổi / thêm không tự xác nhận được (soát tay)
- Chưa đọc được (`node suppliers/unread-tables.mjs`, để thiếu thay vì đoán): bảng không cho bản ghi nào: 3.110 → 3.111; dòng điện / điện áp theo vị trí không khớp công suất: 230 → 230; dòng là cặp nhãn | giá trị: 164 → 164; số vô lý so với công suất: 139 → 139; dòng tổng quan dòng máy: một dải công suất, không là một tổ máy: 90 → 90; số bằng đúng công suất của dòng, không là khối lượng / độ ồn: 77 → 77; mã đầu phát trùng model tổ máy: 37 → 37; cặp a/b dưới nhãn không ghi mức / đơn vị: 34 → 34; một ô ghi hai mã: 25 → 25; tổ máy nhiều động cơ: 6 → 6; điện áp trùng công suất của dòng: 6 → 6; dòng điện tổ máy không khớp công suất: 5 → 5; ngoại lệ theo dòng: 0 → 5; trang có hai động cơ: số liệu kích cỡ động cơ không rõ của động cơ nào: 2 → 2; số có dấu phẩy nghìn / thập phân không rõ: 2 → 2; ô dòng điện không đọc được thành số: 1 → 1
- Thay đổi là chủ ý thì không chặn; vẫn phải soát MỌI dạng và đo top 30 ứng viên bằng tay (bộ nhớ kiem-cheo-toan-bo). Bản đầy đủ: artifact `spec-diff` của lượt chạy.

### Theo NCC

| NCC | dòng đổi | đổi | mất | thêm |
|---|--:|--:|--:|--:|
| kaihua-genset | 4 | 4 | 0 | 0 |
| mpmc-powertech | 1 | 0 | 1 | 0 |

### Dạng thay đổi (vài ví dụ mỗi dạng)

**power**: 4 lượt, 1 NCC
```
kaihua-genset n114 b16 dòng 42 OC16 071A 02-81: P 360/288 S 364/291 → ∅
    | KH-291GF | 360 | 288 | 364 | 291 | OC16 071A 02-81 | 5200*2100*2390 | 5300
kaihua-genset n114 b16 dòng 43 OC16 071A 02-82: P 360/288 S 409/327 → ∅
    | KH-327GF | 360 | 288 | 409 | 327 | OC16 071A 02-82 | 5200*2100*2390 | 5300
kaihua-genset n114 b16 dòng 44 OC16 071A 02-83: P 360/288 S 455/364 → ∅
    | KH-364GF | 360 | 288 | 455 | 364 | OC16 071A 02-83 | 5200*2100*2390 | 5300
```
**MẤT bản ghi**: 1 lượt, 1 NCC
```
mpmc-powertech n114 b11 dòng L DC13 093A 02-75: engine DC13 093A 02-75
    (bảng nhãn)
```
