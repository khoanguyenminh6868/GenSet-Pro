<!-- spec-diff -->
## Kiểm chéo danh mục (spec-diff): git:5fd1612c ↔ .

- Bản ghi: 61.863 → 61.870; **3** đổi, 0 mất, 7 thêm, ở 10 bảng của 4 NCC
- Tổ máy bảng không ghi mã động cơ (`gensetsOf`, chưa nối Gợi ý): 1.700 → 1.700; 0 đổi, 0 mất, 0 thêm (bản đầy đủ: phần "tổ máy" của artifact)
- Đảo vai động cơ ↔ đầu phát (mã mà ≥ 3 NCC khác đọc ở vai kia): 0 → **0** ✅
- Tự kiểm số với công suất của dòng: 3 giá trị đổi / thêm không tự xác nhận được (soát tay)
- Lớp chuẩn hoá (spec-norm): 3 thông số đổi kết quả
- Chưa đọc được (`node suppliers/unread-tables.mjs`, để thiếu thay vì đoán): bảng không cho bản ghi nào: 3.082 → 3.078; bỏ thông số theo bảng: 558 → 558; bảng dọc: không có mã động cơ: 247 → 247; dòng điện / điện áp theo vị trí không khớp công suất: 222 → 222; dòng là cặp nhãn | giá trị: 164 → 164; bảng dọc: công suất có nhãn mức nhưng không đọc được số / đơn vị: 144 → 144; số vô lý so với công suất: 141 → 141; bảng dọc: bảng ghi từ hai model tổ máy trở lên: 108 → 108; dòng tổng quan dòng máy: một dải công suất, không là một tổ máy: 90 → 90; ngoại lệ theo dòng: 77 → 77; số bằng đúng công suất của dòng, không là khối lượng / độ ồn: 77 → 77; một ô ghi hai mã: 66 → 66; bảng dọc: một dòng Model ghi hai mã: trang nhiều sản phẩm: 66 → 66; dòng không đúng bố cục cột của bảng tổ máy: không đọc: 53 → 53; tổ máy nhiều động cơ: 40 → 40; mã đầu phát trùng model tổ máy: 37 → 37; thông số không đúng dạng: để trống: 34 → 34; cặp a/b dưới nhãn không ghi mức / đơn vị: 34 → 34; bảng dọc: không có công suất prime / standby ghi rõ ở phần tổ máy: 32 → 32; dòng không ghi động cơ (bảng có mã động cơ trong danh sách): không đọc: 28 → 28; bảng dọc: không có model tổ máy: 22 → 22; công suất đầu phát không đọc được: 15 → 15; ô động cơ không đọc được, mã ở cột khác: 14 → 14; dòng không có model đọc được: 12 → 12; hai model trùng khoá (keyOf bỏ dấu chấm), số khác nhau: không đọc: 10 → 10; model ghi hai lần với số khác nhau: không đọc: 8 → 8; điện áp trùng công suất của dòng: 6 → 6; dòng bảng tổ máy không có model: 6 → 6; dòng máy lẫn với dòng tiêu đề: 5 → 5; dòng điện tổ máy không khớp công suất: 5 → 5; số trong model khác công suất 50 Hz của dòng: 4 → 4; công suất prime không đọc được: để trống: 4 → 4; ô mã viết dấu － toàn chiều rộng, đọc như '-': 4 → 4; prime lớn hơn standby: để trống cả hai: 3 → 3; bảng dọc: thông số ghi hai lần khác số: 3 → 3; công suất standby không đọc được: để trống: 3 → 3; bảng máy khí: dòng máy trong tiêu đề không đọc thêm: 2 → 2; trang có hai động cơ: số liệu kích cỡ động cơ không rõ của động cơ nào: 2 → 2; số có dấu phẩy nghìn / thập phân không rõ: 2 → 2; dòng bảng động cơ không có model: 1 → 1; ô dòng điện không đọc được thành số: 1 → 1
- Thay đổi là chủ ý thì không chặn; vẫn phải soát MỌI dạng và đo top 30 ứng viên bằng tay (bộ nhớ kiem-cheo-toan-bo). Bản đầy đủ: artifact `spec-diff` của lượt chạy.

### Theo NCC

| NCC | dòng đổi | đổi | mất | thêm |
|---|--:|--:|--:|--:|
| winco | 3 | 2 | 0 | 1 |
| endress-stromerzeuger | 3 | 0 | 0 | 3 |
| gillette-generators | 3 | 0 | 0 | 3 |
| victory-generator | 1 | 1 | 0 | 0 |

### Dạng thay đổi (vài ví dụ mỗi dạng)

**THÊM bản ghi**: 7 lượt, 3 NCC
```
endress-stromerzeuger n129 b26 dòng 2 3TNV80-FPGE: engine 3TNV80-FPGE
    | Engine Type | Yanmar - 3TNV80-FPGE
gillette-generators n101 b0 dòng 7 GX390: engine GX390
    | ENGINE MODEL (WARRANTY) | HONDA GX390 O.H.V. (3 YEARS)
winco n1001 b5 dòng 4 GC160: engine GC160
    | ENGINE MODEL | GC160 OHC
```
**disp thêm**: 3 lượt, 2 NCC
```
victory-generator n123 b35 dòng L LA186FAG: ∅ → 418
    (bảng nhãn)
winco n1002 b6 dòng L GC160: ∅ → 160CC
    (bảng nhãn)
winco n1003 b7 dòng L VANGUARD 3564: ∅ → 570CC
    (bảng nhãn)
```

### Không tự xác nhận được

| dạng | số |
|---|--:|
| disp thêm: mới KHÔNG xác nhận | 3 |

```
victory-generator n123 b35 dòng L disp: ∅ → 418 | null
winco n1002 b6 dòng L disp: ∅ → 160CC | null
winco n1003 b7 dòng L disp: ∅ → 570CC | null
```

### Lớp chuẩn hoá: dạng thay đổi

**disp thêm**: 3 lượt, 2 NCC
```
victory-generator n123 b35 dòng L LA186FAG: "418": ∅ → 0.418 L
    (bảng nhãn)
winco n1002 b6 dòng L GC160: "160CC": ∅ → 0.16 L
    (bảng nhãn)
winco n1003 b7 dòng L VANGUARD 3564: "570CC": ∅ → 0.57 L
    (bảng nhãn)
```
