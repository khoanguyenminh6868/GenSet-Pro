<!-- spec-diff -->
## Kiểm chéo danh mục (spec-diff): git:1e712e19 ↔ .

- Bản ghi: 60.073 → 60.129; **17** đổi, 0 mất, 56 thêm, ở 2 bảng của 2 NCC
- Tổ máy bảng không ghi mã động cơ (`gensetsOf`, chưa nối Gợi ý): 1.700 → 1.700; 0 đổi, 0 mất, 0 thêm (bản đầy đủ: phần "tổ máy" của artifact)
- Đảo vai động cơ ↔ đầu phát (mã mà ≥ 3 NCC khác đọc ở vai kia): 0 → **0** ✅
- Tự kiểm số với công suất của dòng: 0 giá trị đổi / thêm không tự xác nhận được (soát tay)
- Chưa đọc được (`node suppliers/unread-tables.mjs`, để thiếu thay vì đoán): bảng không cho bản ghi nào: 3.067 → 3.065; dòng điện / điện áp theo vị trí không khớp công suất: 227 → 227; dòng là cặp nhãn | giá trị: 164 → 164; số vô lý so với công suất: 139 → 139; dòng tổng quan dòng máy: một dải công suất, không là một tổ máy: 90 → 90; số bằng đúng công suất của dòng, không là khối lượng / độ ồn: 77 → 77; dòng không đúng bố cục cột của bảng tổ máy: không đọc: 53 → 53; tổ máy nhiều động cơ: 40 → 40; mã đầu phát trùng model tổ máy: 37 → 37; thông số không đúng dạng: để trống: 34 → 34; cặp a/b dưới nhãn không ghi mức / đơn vị: 34 → 34; ô động cơ không đọc được, mã ở cột khác: 32 → 32; một ô ghi hai mã: 26 → 26; ngoại lệ theo dòng: 14 → 11; điện áp trùng công suất của dòng: 6 → 6; dòng bảng tổ máy không có model: 6 → 6; dòng máy lẫn với dòng tiêu đề: 5 → 5; dòng điện tổ máy không khớp công suất: 5 → 5; công suất prime không đọc được: để trống: 4 → 4; prime lớn hơn standby: để trống cả hai: 3 → 3; công suất standby không đọc được: để trống: 3 → 3; bảng máy khí: dòng máy trong tiêu đề không đọc thêm: 2 → 2; trang có hai động cơ: số liệu kích cỡ động cơ không rõ của động cơ nào: 2 → 2; số có dấu phẩy nghìn / thập phân không rõ: 2 → 2; ô dòng điện không đọc được thành số: 1 → 1; dòng bảng động cơ không có model: 0 → 1
- Thay đổi là chủ ý thì không chặn; vẫn phải soát MỌI dạng và đo top 30 ứng viên bằng tay (bộ nhớ kiem-cheo-toan-bo). Bản đầy đủ: artifact `spec-diff` của lượt chạy.

### Theo NCC

| NCC | dòng đổi | đổi | mất | thêm |
|---|--:|--:|--:|--:|
| yingtai-jiangsu | 56 | 0 | 0 | 56 |
| huatai-yangzhou | 17 | 17 | 0 | 0 |

### Dạng thay đổi (vài ví dụ mỗi dạng)

**THÊM bản ghi**: 56 lượt, 1 NCC
```
yingtai-jiangsu n101 b1 dòng 0 X2.5G2: engine X2.5G2
    | 进口 康明斯 Import Cummins | X2.5G2 | 24.4 | 27 | 3 | 91.4X127 | 2.5 | 18.5:1 | 6.5 | 204 | 6 | 机械 | 15 | N/A
yingtai-jiangsu n101 b1 dòng 1 X3.3G1: engine X3.3G1
    | X3.3G1 | 32 | 36 | 4 | 91.4X127 | 3.3 | 18.5:1 | 6.5 | 226 | 8.5 | 机械 | 16 | N/A
yingtai-jiangsu n101 b1 dòng 2 S3.8G4: engine S3.8G4
    | S3.8G4 | 38.7 | 43.4 | 4 | 97X128 | 3.8 | 17.5:1 | 11 | 218 | 9.9 | 机械 | 17.2 | N/A
```
**power**: 17 lượt, 1 NCC
```
huatai-yangzhou n111 b10 dòng 0 WD129TAD23: ∅ → R ·/200
    | 200GF | 135/320 | 362 | WD129TAD23 | 259 | 6缸直列 | 198 | 24 | 2700×900×1400 | 1900
huatai-yangzhou n111 b10 dòng 1 WD135TAD28: ∅ → R ·/250
    | 250GF | 138/150 | 452.5 | WD135TAD28 | 308 | 6缸直列 | 198 | 24 | 2700×900×1400 | 2000
huatai-yangzhou n111 b10 dòng 2 WD145TAD30: ∅ → R ·/300
    | 300GF | 138/160 | 543 | WD145TAD30 | 340 | 6缸直列 | 198 | 24 | 2800×900×1500 | 2200
```
**engPower thêm**: 17 lượt, 1 NCC
```
huatai-yangzhou n111 b10 dòng 0 WD129TAD23: ∅ → 259
    | 200GF | 135/320 | 362 | WD129TAD23 | 259 | 6缸直列 | 198 | 24 | 2700×900×1400 | 1900
huatai-yangzhou n111 b10 dòng 1 WD135TAD28: ∅ → 308
    | 250GF | 138/150 | 452.5 | WD135TAD28 | 308 | 6缸直列 | 198 | 24 | 2700×900×1400 | 2000
huatai-yangzhou n111 b10 dòng 2 WD145TAD30: ∅ → 340
    | 300GF | 138/160 | 543 | WD145TAD30 | 340 | 6缸直列 | 198 | 24 | 2800×900×1500 | 2200
```
