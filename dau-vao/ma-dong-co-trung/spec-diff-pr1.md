<!-- spec-diff -->
## Kiểm chéo danh mục (spec-diff): git:cf0b0448 ↔ .

- Bản ghi: 60.075 → 60.075; **447** đổi, 0 mất, 0 thêm, ở 107 bảng của 20 NCC
- Tổ máy bảng không ghi mã động cơ (`gensetsOf`, chưa nối Gợi ý): 1.700 → 1.700; 0 đổi, 0 mất, 0 thêm (bản đầy đủ: phần "tổ máy" của artifact)
- Đảo vai động cơ ↔ đầu phát (mã mà ≥ 3 NCC khác đọc ở vai kia): 0 → **0** ✅
- Tự kiểm số với công suất của dòng: 0 giá trị đổi / thêm không tự xác nhận được (soát tay)
- Chưa đọc được (`node suppliers/unread-tables.mjs`, để thiếu thay vì đoán): bảng không cho bản ghi nào: 3.067 → 3.067; dòng điện / điện áp theo vị trí không khớp công suất: 227 → 227; dòng là cặp nhãn | giá trị: 164 → 164; số vô lý so với công suất: 139 → 139; dòng tổng quan dòng máy: một dải công suất, không là một tổ máy: 90 → 90; số bằng đúng công suất của dòng, không là khối lượng / độ ồn: 77 → 77; dòng không đúng bố cục cột của bảng tổ máy: không đọc: 53 → 53; tổ máy nhiều động cơ: 40 → 40; mã đầu phát trùng model tổ máy: 37 → 37; thông số không đúng dạng: để trống: 34 → 34; cặp a/b dưới nhãn không ghi mức / đơn vị: 34 → 34; ô động cơ không đọc được, mã ở cột khác: 32 → 32; một ô ghi hai mã: 26 → 26; ngoại lệ theo dòng: 14 → 14; điện áp trùng công suất của dòng: 6 → 6; dòng bảng tổ máy không có model: 6 → 6; dòng máy lẫn với dòng tiêu đề: 5 → 5; dòng điện tổ máy không khớp công suất: 5 → 5; công suất prime không đọc được: để trống: 4 → 4; prime lớn hơn standby: để trống cả hai: 3 → 3; công suất standby không đọc được: để trống: 3 → 3; bảng máy khí: dòng máy trong tiêu đề không đọc thêm: 2 → 2; trang có hai động cơ: số liệu kích cỡ động cơ không rõ của động cơ nào: 2 → 2; số có dấu phẩy nghìn / thập phân không rõ: 2 → 2; ô dòng điện không đọc được thành số: 1 → 1
- Thay đổi là chủ ý thì không chặn; vẫn phải soát MỌI dạng và đo top 30 ứng viên bằng tay (bộ nhớ kiem-cheo-toan-bo). Bản đầy đủ: artifact `spec-diff` của lượt chạy.

### Theo NCC

| NCC | dòng đổi | đổi | mất | thêm |
|---|--:|--:|--:|--:|
| eastern-lion-fuan | 104 | 104 | 0 | 0 |
| jet-power | 85 | 85 | 0 | 0 |
| weiman-fujian | 39 | 39 | 0 | 0 |
| yongcai-elecmama | 36 | 36 | 0 | 0 |
| landtop-fuzhou | 25 | 25 | 0 | 0 |
| aj-power | 24 | 24 | 0 | 0 |
| mecca-power | 24 | 24 | 0 | 0 |
| kaihua-genset | 22 | 22 | 0 | 0 |
| cgm-italia | 19 | 19 | 0 | 0 |
| sr-genset | 13 | 13 | 0 | 0 |
| kc-generatorset | 12 | 12 | 0 | 0 |
| saudi-diesel | 12 | 12 | 0 | 0 |
| superwatt-swt | 9 | 9 | 0 | 0 |
| nenjo-generator | 8 | 8 | 0 | 0 |
| bauer-generator | 7 | 7 | 0 | 0 |
| jiuan-power | 3 | 3 | 0 | 0 |
| tecgen-fujian | 2 | 2 | 0 | 0 |
| aksa-power | 1 | 1 | 0 | 0 |
| comappower | 1 | 1 | 0 | 0 |
| stone-power | 1 | 1 | 0 | 0 |

### Dạng thay đổi (vài ví dụ mỗi dạng)

**model**: 447 lượt, 20 NCC
```
aj-power n101 b0 dòng 2 403D-11G Derate: 403D-11G Derate → 403D-11G
    | AJ10 | 50hz | Three Phase | 1500 | 9.0 | 10.0 | | 403D-11G Derate | MA1114B | AJ10 Emissions Optimised Three Phase 50Hz
aksa-power n2005 b4 dòng 0 4045HFG20 (103kW): 4045HFG20 (103kW) → 4045HFG20
    400 / 231                         88.0                              110                                       80.0                           100                         159
bauer-generator n2001 b0 dòng 0 ZH490D/22KW: ZH490D/22KW → ZH490D
    Dauerleistung [kW/kVA/PS] 12/15/16,32
```
