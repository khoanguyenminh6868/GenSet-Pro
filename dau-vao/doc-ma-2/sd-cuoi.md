<!-- spec-diff -->
## Kiểm chéo danh mục (spec-diff): git:95ecba26 ↔ .

- Bản ghi: 61.041 → 61.229; **26** đổi, 0 mất, 188 thêm, ở 64 bảng của 13 NCC
- Tổ máy bảng không ghi mã động cơ (`gensetsOf`, chưa nối Gợi ý): 1.700 → 1.700; 0 đổi, 0 mất, 0 thêm (bản đầy đủ: phần "tổ máy" của artifact)
- Đảo vai động cơ ↔ đầu phát (mã mà ≥ 3 NCC khác đọc ở vai kia): 0 → **0** ✅
- Tự kiểm số với công suất của dòng: 0 giá trị đổi / thêm không tự xác nhận được (soát tay)
- Chưa đọc được (`node suppliers/unread-tables.mjs`, để thiếu thay vì đoán): bảng không cho bản ghi nào: 3.112 → 3.112; bỏ thông số theo bảng: 558 → 558; dòng điện / điện áp theo vị trí không khớp công suất: 227 → 227; dòng là cặp nhãn | giá trị: 164 → 164; số vô lý so với công suất: 141 → 141; dòng tổng quan dòng máy: một dải công suất, không là một tổ máy: 90 → 90; số bằng đúng công suất của dòng, không là khối lượng / độ ồn: 77 → 77; ngoại lệ theo dòng: 68 → 70; dòng không đúng bố cục cột của bảng tổ máy: không đọc: 53 → 53; tổ máy nhiều động cơ: 40 → 40; mã đầu phát trùng model tổ máy: 37 → 37; thông số không đúng dạng: để trống: 34 → 34; cặp a/b dưới nhãn không ghi mức / đơn vị: 34 → 34; dòng không ghi động cơ (bảng có mã động cơ trong danh sách): không đọc: 28 → 28; một ô ghi hai mã: 26 → 26; ô động cơ không đọc được, mã ở cột khác: 14 → 14; điện áp trùng công suất của dòng: 6 → 6; dòng bảng tổ máy không có model: 6 → 6; dòng máy lẫn với dòng tiêu đề: 5 → 5; dòng điện tổ máy không khớp công suất: 5 → 5; công suất prime không đọc được: để trống: 4 → 4; ô mã viết dấu － toàn chiều rộng, đọc như '-': 4 → 4; prime lớn hơn standby: để trống cả hai: 3 → 3; công suất standby không đọc được: để trống: 3 → 3; bảng máy khí: dòng máy trong tiêu đề không đọc thêm: 2 → 2; trang có hai động cơ: số liệu kích cỡ động cơ không rõ của động cơ nào: 2 → 2; số có dấu phẩy nghìn / thập phân không rõ: 2 → 2; dòng bảng động cơ không có model: 1 → 1; ô dòng điện không đọc được thành số: 1 → 1
- Thay đổi là chủ ý thì không chặn; vẫn phải soát MỌI dạng và đo top 30 ứng viên bằng tay (bộ nhớ kiem-cheo-toan-bo). Bản đầy đủ: artifact `spec-diff` của lượt chạy.

### Theo NCC

| NCC | dòng đổi | đổi | mất | thêm |
|---|--:|--:|--:|--:|
| bdadl-shanghai | 94 | 0 | 0 | 94 |
| pengpai-yangzhou | 94 | 0 | 0 | 94 |
| baudouin | 7 | 7 | 0 | 0 |
| baifa-power | 5 | 5 | 0 | 0 |
| mecca-power | 3 | 3 | 0 | 0 |
| chuangyuan-zhongshan | 2 | 2 | 0 | 0 |
| weichai-heavy-machinery | 2 | 2 | 0 | 0 |
| weichai-power | 2 | 2 | 0 | 0 |
| aosif | 1 | 1 | 0 | 0 |
| jet-power | 1 | 1 | 0 | 0 |
| landtop-fuzhou | 1 | 1 | 0 | 0 |
| voltgent | 1 | 1 | 0 | 0 |
| waeta-fujian | 1 | 1 | 0 | 0 |

### Dạng thay đổi (vài ví dụ mỗi dạng)

**THÊM bản ghi**: 188 lượt, 2 NCC
```
bdadl-shanghai n101 b0 dòng 0 YC16VC3300-D31: engine YC16VC3300-D31
    | BDA-Y2200 | 2200/2750 | 玉柴机器股份 | YC16VC3300-D31(国三) | 16 | 105.56 | 280 | ≤195 | 6500*2300*2600 | 14000
pengpai-yangzhou n101 b0 dòng 0 YC16VC3300-D31: engine YC16VC3300-D31
    | PPDL-Y2200 | 2200/2750 | 玉柴机器股份 | YC16VC3300-D31(国三) | 16 | 105.56 | 280 | ≤195 | 6500*2300*2600 | 14000
bdadl-shanghai n101 b0 dòng 1 YC16VC3600-D31: engine YC16VC3600-D31
    | BDA-Y2400 | 2400/3000 | 玉柴机器股份 | YC16VC3600-D31(国三) | 16 | 105.56 | 280 | ≤195 | 6500*2300*2600 | 16000
```
**model**: 26 lượt, 11 NCC
```
aosif n123 b21 dòng 19 8M33D1012E311: 8M33D1012E311 → 8M33D1012E311^
    | AW1125 | 1000/800 | 1125/900 | 8M33D1012E311^ | 218.9 | 12V | 31.8 |
baifa-power n101 b3 dòng 34 8M33G6D3/5: 8M33G6D3/5 → 8M33G6D3/5^
    | BF-BD1100-3 | 1100 | 1000 | 8M33G6D3/5^ | | CHINA STAGE3 | CHINA
baudouin n121 b55 dòng 3 12M55G3000/5: 12M55G3000/5 → 12M55G3000/5^
    | 12M55G3000/5^ | 2420 | 2700 | 2200 | 2750 | 3000 |
```
