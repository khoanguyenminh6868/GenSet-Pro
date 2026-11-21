# bo-doc-tieu-hao-3: giải thích đo cloud #1022 (21/11/2026)

Đo cloud ở f47bedcd so với 2d2ce26d. Chạy lại `candidates` trên mọi lượt có đổi: 0 lượt không chạy lại được. Bidhist dùng bản máy (20/11 12:30).
Script và kết quả: `dau-vao\bo-doc-tieu-hao\cloud\` (`giai-thich-2.json` = code đã có 3 dropspec; `soat-dt`, `soat-nguong`, `soat-muc`, `soat-khoi`, `so-diem`, `tong-hop`; các tệp `soat-nguong/muc/khoi.txt` có chữ HSMT).

**Kết luận: #1022 (HEAD 177ad0f3) CHƯA nên merge.** Còn 33 dòng bị loại oan do lỗi tách ngưỡng theo cỡ máy (mục "Lỗi mới"), trong đó có cả top 5 của IB2300260615 #1. Sửa xong phải đo cloud lại.

## (a) 1.087 dòng mất

796 dòng có luật tiêu hao; 292 dòng có luật xi lanh / kiểu xi lanh / dung tích (285 chỉ vì nhóm này; một dòng có thể thuộc cả hai nhóm).

### Tiêu hao

- **longkai:** nhãn "100% load(Prime power)", L/h, trong khối động cơ của tờ tổ máy.
- **generatordieselchina (18 dòng): loại đúng.** 100 % = Prime × g/kWh / 0,84 khớp cả 7 model.
- **26 dòng loại oan: ĐÃ SỬA** (177ad0f3, dropspec "điều phối 21/11/2026"). Thân tờ là bộ số của động cơ khác: longkai n1053 QSB3.9-G2 (16), n1069 QSB6.7-G3 (9), n1144 6M33D633E200 (1). Chạy lại: cả 26 không còn bị loại.
- **538 dòng máy lớn hơn công suất HSMT: Khoa 21/11/2026 "loại như hiện tại", không quy tỉ lệ.**
- **Chưa kết luận:** n1124 WP2.3D33E200 (2 dòng): tiêu đề Prime 26 kW, thân 18 kW, 6.4 L/h. Tạm giữ loại.
- **Rủi ro ngược (đạt oan, chưa sửa):** n1085 QSM11-G2 18.3 L/h / 280 kW, n1104 QSK19-G4 38.4 / 536, n1107 KT38-GA 37 / 500 (khoảng 0,07 L/kWh, quá thấp).

### Xi lanh, dung tích: 292 dòng, 45 động cơ, 80 lượt

- **Số của động cơ:** 43/45 khớp hình học (xi lanh × đường kính × hành trình ↔ dung tích) và tên model, không điểm lệch.
- 2 động cơ có một nguồn ghi sai, không làm dòng nào bị loại sai: 20M33G2250/5 (yanan-power ghi 16, nguồn khác 20; luật ở đây là dung tích), WD145TAD35 (một dòng xingguang ghi 12, số đông 6, HSMT ≥ 8).
- **Ngưỡng 1 xi lanh IB2200035219 (6 kVA): đúng.** HSMT ghi "4 thì, 1 xi lanh", 0.499 L.
- **Ngưỡng HSMT:** đã đối chiếu 80 lượt với chữ HSMT. Trừ lỗi dưới đây, ngưỡng đọc đúng.
- Hai chỗ đọc sai chưa làm mất dòng nào: IB2300022940 "12 kiểu V hoặc 6 thẳng hàng" đọc thành đúng 12 xi lanh (4 dòng vẫn bị loại đúng vì dung tích); IB2400275648 trần dung tích 8 lấy từ câu "Tiêu hao ≤ 8,0 lít/giờ".

### Lỗi mới: ngưỡng của cỡ máy khác (33 dòng loại oan)

`sizeBlocks` chia khối theo câu nêu công suất, không theo nhãn đầu dòng, nên dòng "Phần 1 - Máy 500 kVA: … dung tích xi lanh: < 20 lít" rơi vào khối 2.000 kVA. Lỗi có sẵn trên `main`; #1022 làm lộ ra vì thêm số động cơ để so.

| Lượt | Ngưỡng sai | Dòng oan |
|---|---|--:|
| IB2300260615 #1 (2.000 kVA) | dung tích ≤ 20 L của máy 500 kVA | 25 |
| IB2300162912 #0 (750 kVA) | dung tích ≥ 78 L, tiêu hao của máy 2.500 kVA | 5 |
| IB2300046353 #1 (20 kVA) | dung tích, xi lanh, tiêu hao của máy 15 kVA | 3 |

8 / 33 dòng thuộc top 30 gốc, 5 dòng là top 5 của IB2300260615 #1. Cách đo: bỏ các dòng có nhãn đầu dòng nêu cỡ khác rồi đọc lại ngưỡng; gói không có nhãn đầu dòng thì cách này không phát hiện được.

**Phạm vi nếu sửa:** ngưỡng đổi ở 55 / 361 lượt nhiều cỡ. Nhiều lượt sẽ có thêm ngưỡng đúng trước đây bị thiếu, nên có thể loại thêm dòng khác: chưa đo.

## (b) 8.771 dòng đổi điểm: giải thích hết, 0 dư

- 8.590 dòng khớp đúng +8 × số loại thông số động cơ mới (+8: 7.733; +16: 113; +24: 744). 181 dòng khớp đúng −300.
- Loại thông số thêm (lượt-dòng): fuel 5.629, disp 2.324, bore 1.271, cyl 967; mất 0.
- −300: westinpower 180, longkai 1 (6BT5.9-G2 18.2 > 12.5 ở 75 %, IB2400389856). "Fuel Consumption | Litre/hour" của westinpower bằng đúng dòng "100% (of the Prime Power)". 24 bộ số, 1 bộ thứ tự sai ở nguồn: 1706A-E93TAG2 n1103 (78.4 / 79.2 / 82.1 ở 100 / 75 / 50 %), 8 lượt-dòng −300 theo 78.4.

## (c) 35 dòng hạng 1–5 gốc ra khỏi top 30

- 33 dòng bị loại: tiêu hao 17, trần dung tích 11, dung tích tối thiểu 5.
- **5 dòng oan:** cả top 5 của IB2300260615 #1 (trần dung tích của máy 500 kVA).
- 28 dòng còn lại bị loại đúng theo số động cơ và ngưỡng đã soát.
- 2 dòng còn trong bảng, chỉ tụt hạng: rcg-power S12A2-PTA, dingbo TWD1645GE.

## Kiểm tra ở 177ad0f3

Test suppliers 1.356 / 1.356, spec-norm 148 / 148, `verify` đạt, `quality --check` đạt. `spec-diff` (70b8bcd8 ↔ 177ad0f3): 6 bản ghi đổi, 0 mất, 0 thêm, chỉ 3 bảng longkai. CHƯA đo cloud lại ở SHA này.

## Việc tiếp (điều phối 21/11/2026)

1. Lỗi `sizeBlocks` có sẵn trên main, KHÔNG chặn #1022. Phiên #1036 sửa sau khi #1036 merge; phiên này không sửa. Danh sách ở mục dưới.
2. #1022: gộp main, CI xanh, báo SHA; điều phối giao đo cloud theo SHA đó.
3. E + C + D, A, G, B chỉ bắt đầu sau khi #1022 merge. `wt-do-1022-nhanh`, `wt-do-1022-goc` còn giữ tới khi đo lại xong.

Tệp có trích chữ HSMT (`soat-nguong.txt`, `soat-muc.txt`) đã chuyển sang `genbid-work\doc-cache\soat-1022\` (ngoài git). Hai tệp này từng lên nhánh `dieu-phoi` ở commit 5b0099d7; lịch sử chưa xoá.

## Danh sách cho phiên sửa `sizeBlocks`

Tạo bằng `dau-vao\bo-doc-tieu-hao\cloud\soat-khoi-ds.mjs`. Cách phát hiện: bỏ các dòng có nhãn đầu dòng nêu cỡ khác rồi đọc lại ngưỡng, nên gói không có nhãn đầu dòng không nằm trong danh sách.

### 33 dòng oan

Hạng = hạng trong top 30 gốc. Dòng HSMT tính từ 1 trên `config.text` của bidhist 20/11 12:30.

| Lượt | NCC | Model | Hạng | Luật loại | Nhãn cỡ của dòng ngưỡng | Khối bị gán nhầm |
|---|---|---|--:|---|---|---|
| IB2300046353#1 | longkai-power | 4B3.9-G2 | 9 | fuel, fuel75, fuel50 | Máy 15 kVA 1 pha (dòng 30–50) | cỡ 20, dòng 17–52 |
| IB2300046353#1 | longkai-power | 4B3.9-G11 | 16 | fuel, fuel75, fuel50 | Máy 15 kVA 1 pha (dòng 30–50) | cỡ 20, dòng 17–52 |
| IB2300046353#1 | longkai-power | 4B3.9-G1 | - | fuel, fuel75, fuel50 | Máy 15 kVA 1 pha (dòng 30–50) | cỡ 20, dòng 17–52 |
| IB2300162912#0 | koten-power | 8M33G770/6 | - | disp | Phần I - Máy 2500 kVA (dòng 21–29) | cỡ 750, dòng 15–29 |
| IB2300162912#0 | landtop-fuzhou | 8M33G770/6 | - | disp | Phần I - Máy 2500 kVA (dòng 21–29) | cỡ 750, dòng 15–29 |
| IB2300162912#0 | agg-fuzhou | 12M26G704/6 | - | disp | Phần I - Máy 2500 kVA (dòng 21–29) | cỡ 750, dòng 15–29 |
| IB2300162912#0 | agg-fuzhou | 6M31G700/6 | - | disp | Phần I - Máy 2500 kVA (dòng 21–29) | cỡ 750, dòng 15–29 |
| IB2300162912#0 | agg-fuzhou | 8M33G770/6 | - | disp | Phần I - Máy 2500 kVA (dòng 21–29) | cỡ 750, dòng 15–29 |
| IB2300260615#1 | longkai-power | 20M33G2000/6 | 1 | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |
| IB2300260615#1 | longkai-power | 20M33G2250/5 | 2 | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |
| IB2300260615#1 | kaihua-genset | 20M33G2000/6 | 3 | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |
| IB2300260615#1 | longkai-power | 12M55G2250/6 | 4 | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |
| IB2300260615#1 | longkai-power | 20M33G2200/6 | 5 | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |
| IB2300260615#1 | longkai-power | 12M55G2550/5 | - | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |
| IB2300260615#1 | voltgent | 20M33G2000/6 | 22 | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |
| IB2300260615#1 | penlucky | 20M33G2000/6 | - | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |
| IB2300260615#1 | voltgent | 12M55G2550/5 | - | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |
| IB2300260615#1 | mecca-power | 20M33G2250/5 | - | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |
| IB2300260615#1 | deman-power | 20M33G2000/6 | - | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |
| IB2300260615#1 | mecca-power | 20M33G2000/6 | - | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |
| IB2300260615#1 | previa-ningde | 20M33G2000/6 | - | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |
| IB2300260615#1 | previa-ningde | 20M33G2250/5 | - | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |
| IB2300260615#1 | previa-ningde | 12M55G2250/6 | - | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |
| IB2300260615#1 | previa-ningde | 20M33G2200/6 | - | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |
| IB2300260615#1 | mecca-power | 12M55G2550/5 | - | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |
| IB2300260615#1 | weichai-power | 20M33G2250/5 | - | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |
| IB2300260615#1 | previa-ningde | 12M55G2550/5 | - | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |
| IB2300260615#1 | weichai-power | 20M33G2000/6 | - | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |
| IB2300260615#1 | agg-fuzhou | 20M33G2250/5 | - | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |
| IB2300260615#1 | yanan-power | 20M33G2250/5 | - | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |
| IB2300260615#1 | agg-fuzhou | 20M33G2000/6 | - | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |
| IB2300260615#1 | yanan-power | 20M33G2000/6 | - | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |
| IB2300260615#1 | yanan-power | 12M55G2550/5 | - | maxDisp | Phần 1 - Máy 500 kVA (dòng 33–46) | cỡ 2000, dòng 16–46 |

### 55 lượt nhiều cỡ có ngưỡng đổi

Ngưỡng hiện tại → ngưỡng khi bỏ dòng có nhãn cỡ khác. Cột cuối: số dòng mất chỉ vì ngưỡng đó.

| Lượt | Cỡ | Ngưỡng đổi | Dòng oan |
|---|--:|---|--:|
| IB2300046353#0 | 15 | minDisp - → 1.95; minCyl - → 4; maxFuel - → 4.93; maxFuel75 - → 3.61; maxFuel50 - → 2.7 | 0 |
| IB2300046353#1 | 20 | minDisp 1.95 → -; minCyl 4 → -; maxFuel 4.93 → -; maxFuel75 3.61 → -; maxFuel50 2.7 → - | 3 |
| IB2300102941#0 | 15 | maxFuel - → 4.93; maxFuel75 - → 3.61; maxFuel50 - → 2.7 | 0 |
| IB2300102941#1 | 20 | maxFuel - → 5.12; maxFuel75 - → 3.84; maxFuel50 - → 2.95 | 0 |
| IB2300108940#1 | 20 | minDisp - → 2.197; minCyl 2 → -; maxFuel - → 5.5 | 0 |
| IB2300134577#0 | 50 | minCyl - → 3; maxFuel - → 12; maxFuel75 - → 9 | 0 |
| IB2300134577#1 | 100 | minCyl - → 3; maxFuel - → 23; maxFuel75 - → 17 | 0 |
| IB2300134577#2 | 150 | maxFuel - → 37; maxFuel75 - → 30 | 0 |
| IB2300162912#0 | 750 | minDisp 78 → -; maxFuel 503.2 → -; maxFuel75 370 → -; maxFuel50 251.8 → - | 5 |
| IB2300162912#1 | 2275 | minDisp - → 78; maxFuel - → 503.2; maxFuel75 - → 370; maxFuel50 - → 251.8 | 0 |
| IB2300163186#2 | 100 | minDisp 2.3 → - | 0 |
| IB2300163186#3 | 200 | minDisp 2.3 → - | 0 |
| IB2300163844#0 | 8 | minCyl 3 → - | 0 |
| IB2300163844#1 | 30 | minCyl - → 3 | 0 |
| IB2300243355#1 | 450 | minCyl - → 6 | 0 |
| IB2300253227#0 | 100 | minDisp - → 5.9; minCyl - → 6 | 0 |
| IB2300260615#0 | 500 | maxDisp - → 20 | 0 |
| IB2300260615#1 | 2000 | maxDisp 20 → - | 25 |
| IB2300293753#0 | 10 | maxDisp - → 1.3 | 0 |
| IB2300293753#2 | 200 | maxDisp 1.3 → - | 0 |
| IB2400058723#0 | 630 | maxDisp - → 19.6 | 0 |
| IB2400058723#1 | 800 | maxDisp - → 32 | 0 |
| IB2400114476#0 | 12 | maxDisp - → 1.826 | 0 |
| IB2400114476#1 | 45 | maxDisp 1.826 → - | 0 |
| IB2400237184#0 | 53 | minDisp - → 3.62; maxFuel75 - → 8.25 | 0 |
| IB2400237184#1 | 405 | minDisp - → 11.6; maxFuel75 - → 71.25 | 0 |
| IB2400275648#0 | 30 | maxDisp 8 → -; minCyl - → 4 | 0 |
| IB2400275648#1 | 60 | maxDisp 8 → - | 0 |
| IB2400291063#1 | 132 | minDisp 1.8 → -; minCyl 3 → - | 0 |
| IB2400365165#0 | 7.2 | maxFuel75 - → 4.25 | 0 |
| IB2400433961#0 | 600 | maxDisp - → 19.6; minCyl - → 6 | 0 |
| IB2400433961#1 | 1500 | maxDisp - → 39.2; minCyl - → 12 | 0 |
| IB2400487460#0 | 8.8 | maxDisp - → 2.3 | 0 |
| IB2400487460#1 | 40 | maxDisp 2.3 → - | 0 |
| IB2400495696#0 | 30 | maxFuel - → 9.5 | 0 |
| IB2400495696#2 | 200 | minCyl 4 → - | 0 |
| IB2400589278#0 | 300 | minCyl - → 6; maxFuel - → 70 | 0 |
| IB2400589278#1 | 400 | minCyl - → 6; maxFuel - → 89.1 | 0 |
| IB2400589278#2 | 450 | maxFuel - → 89.1 | 0 |
| IB2500089757#0 | 30 | minDisp - → 2.54; minCyl - → 4; maxFuel - → 9.5 | 0 |
| IB2500089757#1 | 100 | minDisp - → 4.837; minCyl - → 4; maxFuel - → 28.3 | 0 |
| IB2500089757#2 | 200 | minCyl 4 → - | 0 |
| IB2500177469#0 | 8.5 | minCyl - → 3 | 0 |
| IB2500385135#0 | 10.5 | minDisp 2.197 → -; minCyl 4 → - | 0 |
| IB2500385135#1 | 20 | minDisp - → 2.197; minCyl - → 4 | 0 |
| IB2500403535#0 | 8.5 | minCyl 3 → -; maxFuel75 - → 2.5 | 0 |
| IB2500410768#0 | 30 | maxFuel - → 7.5 | 0 |
| IB2500410768#2 | 200 | maxFuel 7.5 → - | 0 |
| IB2500533266#0 | 100 | minDisp - → 4.3; minCyl - → 4 | 0 |
| IB2500533266#1 | 250 | minDisp 4.3 → -; minCyl 4 → - | 0 |
| IB2600128010#0 | 250 | maxFuel - → 60; maxFuel50 - → 36 | 0 |
| IB2600128010#1 | 500 | maxFuel - → 105; maxFuel50 - → 55 | 0 |
| IB2600477305#1 | 15 | minCyl 3 → -; maxFuel 4 → -; maxFuel75 3.2 → -; maxFuel50 2.4 → - | 0 |
| IB2600562009#0 | 30 | maxFuel - → 5.4 | 0 |
| IB2600562009#1 | 50 | maxFuel 5.4 → - | 0 |
