<!-- spec-diff -->
## Kiểm chéo danh mục (spec-diff): git:origin/main ↔ .

- Bản ghi: 60.073 → 60.497; **308** đổi, 26 mất, 450 thêm, ở 19 bảng của 1 NCC
- Tổ máy bảng không ghi mã động cơ (`gensetsOf`, chưa nối Gợi ý): 1.700 → 1.700; 0 đổi, 0 mất, 0 thêm (bản đầy đủ: phần "tổ máy" của artifact)
- Đảo vai động cơ ↔ đầu phát (mã mà ≥ 3 NCC khác đọc ở vai kia): 0 → **0** ✅
- Tự kiểm số với công suất của dòng: 10 giá trị đổi / thêm không tự xác nhận được (soát tay)
- Chưa đọc được (`node suppliers/unread-tables.mjs`, để thiếu thay vì đoán): bảng không cho bản ghi nào: 3.067 → 3.065; dòng điện / điện áp theo vị trí không khớp công suất: 227 → 227; dòng là cặp nhãn | giá trị: 164 → 164; số vô lý so với công suất: 139 → 139; dòng tổng quan dòng máy: một dải công suất, không là một tổ máy: 90 → 90; số bằng đúng công suất của dòng, không là khối lượng / độ ồn: 77 → 77; dòng không đúng bố cục cột của bảng tổ máy: không đọc: 53 → 53; tổ máy nhiều động cơ: 40 → 40; mã đầu phát trùng model tổ máy: 37 → 37; thông số không đúng dạng: để trống: 34 → 34; cặp a/b dưới nhãn không ghi mức / đơn vị: 34 → 34; một ô ghi hai mã: 26 → 26; ngoại lệ theo dòng: 14 → 14; ô động cơ không đọc được, mã ở cột khác: 32 → 14; điện áp trùng công suất của dòng: 6 → 6; dòng bảng tổ máy không có model: 6 → 6; dòng máy lẫn với dòng tiêu đề: 5 → 5; dòng điện tổ máy không khớp công suất: 5 → 5; công suất prime không đọc được: để trống: 4 → 4; prime lớn hơn standby: để trống cả hai: 3 → 3; công suất standby không đọc được: để trống: 3 → 3; bảng máy khí: dòng máy trong tiêu đề không đọc thêm: 2 → 2; trang có hai động cơ: số liệu kích cỡ động cơ không rõ của động cơ nào: 2 → 2; số có dấu phẩy nghìn / thập phân không rõ: 2 → 2; ô dòng điện không đọc được thành số: 1 → 1
- Thay đổi là chủ ý thì không chặn; vẫn phải soát MỌI dạng và đo top 30 ứng viên bằng tay (bộ nhớ kiem-cheo-toan-bo). Bản đầy đủ: artifact `spec-diff` của lượt chạy.

### Theo NCC

| NCC | dòng đổi | đổi | mất | thêm |
|---|--:|--:|--:|--:|
| eastern-lion-fuan | 784 | 308 | 26 | 450 |

### Dạng thay đổi (vài ví dụ mỗi dạng)

**THÊM bản ghi**: 450 lượt, 1 NCC
```
eastern-lion-fuan n114 b18 dòng 0 EL 164D: alternator EL 164D
    | GF/GFS-HC18 | 13 | 16 | 14 | 18 | 2105D | 18.7 | EL 164D | 12.8 | RUIFEN6120 | Detail
eastern-lion-fuan n114 b18 dòng 1 EL 184E: alternator EL 184E
    | GF/GFS-HC26 | 18 | 23 | 20 | 26 | 2110D | 20 | EL 184E | 18 | RUIFEN6120 | Detail
eastern-lion-fuan n114 b18 dòng 2 EL 184F: alternator EL 184F
    | GF/GFS-HC31 | 22 | 28 | 24 | 31 | 490D | 24 | EL 184F | 22 | RUIFEN6120 | Detail
```
**other**: 308 lượt, 1 NCC
```
eastern-lion-fuan n114 b18 dòng 0 2105D: null → EL 164D
    | GF/GFS-HC18 | 13 | 16 | 14 | 18 | 2105D | 18.7 | EL 164D | 12.8 | RUIFEN6120 | Detail
eastern-lion-fuan n114 b18 dòng 1 2110D: null → EL 184E
    | GF/GFS-HC26 | 18 | 23 | 20 | 26 | 2110D | 20 | EL 184E | 18 | RUIFEN6120 | Detail
eastern-lion-fuan n114 b18 dòng 2 490D: null → EL 184F
    | GF/GFS-HC31 | 22 | 28 | 24 | 31 | 490D | 24 | EL 184F | 22 | RUIFEN6120 | Detail
```
**MẤT bản ghi**: 26 lượt, 1 NCC
```
eastern-lion-fuan n126 b32 dòng 14 EL 224E: engine EL 224E
    | GF/GFS-HC67 | 48 | 60 | 53 | 67 | 4105ZD(小泵） | 56 | EL 224E | 48 | RUIFEN6120
eastern-lion-fuan n147 b52 dòng 0 EL 274F: engine EL 274F
    | GF/GFS-WL128 | 128 | 160 | 142 | 178 | D114系列WLD171 | 171KW | EL 274F | 128 | Smartgen 6120
eastern-lion-fuan n147 b52 dòng 1 EL 274H: engine EL 274H
    | GF/GFS-WL160 | 160 | 200 | 178 | 223 | D114系列WLD206 | 206KW | EL 274H | 160 | Smartgen 6120
```
**controller thêm**: 6 lượt, 1 NCC
```
eastern-lion-fuan n116 b21 dòng 0 K4100DS: ∅ → RUIFEN6120
    | GF/GFS-KF10 | 10 | 13 | 11 | 14 | K4100DS | 30.1 | EL 164C | 10.8KW | RUIFEN6120 | Detail
eastern-lion-fuan n116 b21 dòng 1 K4100DS: ∅ → RUIFEN6120
    | GF/GFS-KF12 | 12 | 15 | 13 | 17 | K4100DS | 30.1 | EL 164D | 12.8KW | RUIFEN6120 | Detail
eastern-lion-fuan n126 b32 dòng 14 RUIFEN6120: ∅ → RUIFEN6120
    | GF/GFS-HC67 | 48 | 60 | 53 | 67 | 4105ZD(小泵） | 56 | EL 224E | 48 | RUIFEN6120
```
**model**: 4 lượt, 1 NCC
```
eastern-lion-fuan n126 b32 dòng 14 RUIFEN6120: RUIFEN6120 → EL 224E
    | GF/GFS-HC67 | 48 | 60 | 53 | 67 | 4105ZD(小泵） | 56 | EL 224E | 48 | RUIFEN6120
eastern-lion-fuan n149 b54 dòng 14 RUIFEN6120: RUIFEN6120 → EL 274H
    | GFS-W222 | 160 | 200 | 178 | 222 | 6126ZLD新 | 215 | EL 274H | 160 | RUIFEN6120
eastern-lion-fuan n149 b54 dòng 15 RUIFEN6120: RUIFEN6120 → EL 274J
    | GFS-W250 | 180 | 225 | 200 | 250 | 6126ZLD新 | 215 | EL 274J | 184 | RUIFEN6120
```
**engPower đổi**: 4 lượt, 1 NCC
```
eastern-lion-fuan n126 b32 dòng 14 RUIFEN6120: 48 → 56
    | GF/GFS-HC67 | 48 | 60 | 53 | 67 | 4105ZD(小泵） | 56 | EL 224E | 48 | RUIFEN6120
eastern-lion-fuan n149 b54 dòng 14 RUIFEN6120: 160 → 215
    | GFS-W222 | 160 | 200 | 178 | 222 | 6126ZLD新 | 215 | EL 274H | 160 | RUIFEN6120
eastern-lion-fuan n149 b54 dòng 15 RUIFEN6120: 184 → 215
    | GFS-W250 | 180 | 225 | 200 | 250 | 6126ZLD新 | 215 | EL 274J | 184 | RUIFEN6120
```

### Không tự xác nhận được

| dạng | số |
|---|--:|
| controller thêm: mới không kiểm được | 6 |
| engPower đổi: mới tự xác nhận, cũ cũng hợp lệ | 4 |

```
eastern-lion-fuan n116 b21 dòng 0 controller: ∅ → RUIFEN6120 | {"prime":{"kW":10,"kVA":13},"standby":{"kW":11,"kVA":14}}
eastern-lion-fuan n116 b21 dòng 1 controller: ∅ → RUIFEN6120 | {"prime":{"kW":12,"kVA":15},"standby":{"kW":13,"kVA":17}}
eastern-lion-fuan n126 b32 dòng 14 engPower: 48 → 56 | {"prime":{"kW":48,"kVA":60},"standby":{"kW":53,"kVA":67}}
eastern-lion-fuan n126 b32 dòng 14 controller: ∅ → RUIFEN6120 | {"prime":{"kW":48,"kVA":60},"standby":{"kW":53,"kVA":67}}
eastern-lion-fuan n149 b54 dòng 14 engPower: 160 → 215 | {"prime":{"kW":160,"kVA":200},"standby":{"kW":178,"kVA":222}}
eastern-lion-fuan n149 b54 dòng 14 controller: ∅ → RUIFEN6120 | {"prime":{"kW":160,"kVA":200},"standby":{"kW":178,"kVA":222}}
eastern-lion-fuan n149 b54 dòng 15 engPower: 184 → 215 | {"prime":{"kW":180,"kVA":225},"standby":{"kW":200,"kVA":250}}
eastern-lion-fuan n149 b54 dòng 15 controller: ∅ → RUIFEN6120 | {"prime":{"kW":180,"kVA":225},"standby":{"kW":200,"kVA":250}}
eastern-lion-fuan n149 b54 dòng 16 engPower: 200 → 260 | {"prime":{"kW":200,"kVA":250},"standby":{"kW":222,"kVA":278}}
eastern-lion-fuan n149 b54 dòng 16 controller: ∅ → RUIFEN6120 | {"prime":{"kW":200,"kVA":250},"standby":{"kW":222,"kVA":278}}
```
