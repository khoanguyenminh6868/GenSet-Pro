# bo-doc-tieu-hao bước 1: vì sao 156 / 113 / 77 L/h của Baudouin 6M31G825/5 không tới check; rà mọi NCC (21/11/2026)

Việc: Khoa 20/11/2026 "3. ok sửa, check xem các cấu hình khác có cấu hình nào bị tương tự không". Chỉ đọc, gốc origin/main 95ecba26
(worktree `wt-tieu-hao`). Script + bảng: `dau-vao\bo-doc-tieu-hao\` (`scan.mjs`, `fuel-checks.mjs`, `fuel-src.mjs`, `goc\*.tsv`, `goc.json`).

## Gốc rễ (ba chỗ nối nhau)
1. `web/catalog.js` bảng nhãn (`fromLabelTable`, nhánh tiêu hao): tờ 1021 có dòng tiêu đề giữa bảng `| Rating | gr/kWh | L/hr` rồi
   `| 100% PRP | 193 | 156`. Bộ đọc không biết cột nào đơn vị gì, lấy số ĐẦU (193 = g/kWh) làm `fuel`, 186 làm `fuel75`, 190 làm `fuel50`,
   giá trị trơ không đơn vị → lớp chuẩn hoá `missing: unit`. Cùng lỗi khi ô đơn vị nằm CÙNG DÒNG (`| 100% load(Prime power) | L/h | 15`):
   ô "L/h" bị bỏ, số còn lại không đơn vị.
2. `suppliers/config-bot.mjs` `modelFacts`: tiêu hao (`fuel*`) có scope "genset" nên KHÔNG BAO GIỜ thành fact của động cơ, kể cả tờ hãng
   động cơ. Thêm nữa, tên bảng "Datasheet: 6M31G825/5 …" bị tách ở "/" → "6M31G825" (không có trong catalog) → đường đọc tờ (đường 1) bỏ cả tờ.
3. `fuelChecks` chỉ đọc dòng tổ máy của cấu hình (`row`); cấu hình #1 IB2600603983 không có dòng tổ máy ghi tiêu hao → luôn "chưa rõ".
   Tờ hãng động cơ không được dùng.
- Nhãn "N° of Cylinders / Valves | 6 / 24": SPECS `cyl` không nhận "a / b" → không có số xi lanh.
- Bảng "Engine data" theo dòng máy (n115 bảng 32 "6M31 - Baudouin…": `| Cylinders 6`, `| Bore & Stroke (mm) 149x177`, `| Total Displacement (L) 18.5`):
  không có model trong bảng, tên bảng là mã dòng "6M31" → đường 1 không gắn model nào; ô một cột "Cylinders 6" (nhãn + số không dấu ":") không đọc.

## Rà toàn bộ (61.041 bản ghi fromSupplier, 435 NCC; `goc\tieu-hao.tsv` 4.946 dòng = bản ghi × mức tải)
Chỉ tính bản ghi có chữ L/h trong ngữ cảnh tiêu hao mà số của mức tải đó không ra L/h.
- **Cả g/kWh lẫn L/h** (đúng loại lỗi 6M31G825/5): 234 dòng. lấy g/kWh 87 (generatordieselchina 45: dòng `342.9 / 457.1 L/h (@75% / @100%)`
  không đọc được nên `fuel` = dòng "Fuel Efficiency (g/kW·h)"; yingtai-jiangsu, yongcai, long-gen, distributor 4); không đơn vị 106
  (baudouin 3 = 6M31G825/5; jinlongteng 16, keliang 32, weiman 45, zhengdian 10: tiêu đề hai tầng "Fuel consumption" trên "g/kw.h | L/h"
  lệch cột, số đọc được là công suất động cơ / g/kWh); không có số 61 (yingtai 95 dòng tiêu đề lệch).
- **Chỉ L/h**: không đơn vị 986 (longkai-power 843: ô "L/h" cùng dòng; lees-power, hosem…), không có số 3.695 (chủ yếu bảng dòng có
  tiêu đề hai tầng lệch cột: uleengen 1.118, mecca 731, legapower 493, westinpower 332, wintpower… và bảng nhiều model cạnh nhau: changchai 26).
- Theo vai: engine_maker 29 dòng (baudouin 3 = 6M31G825/5, changchai 26 bảng nhiều model); còn lại genset_oem / distributor / alternator_maker
  (32 dòng alternator_maker là tờ tổ máy của stamford… cũng ghi tiêu hao).
- Xi lanh (`goc\xi-lanh.tsv`, 225 bản ghi động cơ dòng nhãn có xi lanh mà không có `cyl`): longkai 116 ("No. cylinders | 6 in line": "in line"
  có dấu cách không khớp), yangdong 67 (bảng nhiều model), changchai 15 ("缸数-缸径×行程 | 4-95×115"), kanpor 9 (ô "QTY"), lees 9 ("12缸V型水冷"),
  baudouin 1 ("Cylinders / Valves | 6 / 24"), lẻ 8.
- Bảng theo dòng máy không gắn model (`goc\dong-may.tsv`, NCC engine_maker): baudouin 33 bảng, perkins 10, ricardo-weifang 10, zichai 1,
  volvo-penta 1, fpt 1, quanchai 1 (các dòng "tieu-de-khong-1-ma" là tờ tổ máy / bộ điều khiển, không thuộc việc này).

## 17 lượt Gợi ý đã chụp (`goc.json` = check-all gốc; `goc-fuel-src.tsv`)
89 check tiêu hao, 78 "chưa rõ". Chỉ MỘT cấu hình "chưa rõ" mà nguồn của chính động cơ (tờ hãng) có số L/h: **IB2600603983 #1 6M31G825/5**
(3 mục). Các cấu hình khác: dòng tổ máy của cấu hình không ghi tiêu hao; số L/h có ở dòng tổ máy KHÁC (NCC khác, tổ máy khác công suất)
dùng chung động cơ (vd. S6R2-PTAA-C aosif 156,3 / 125,7 / 89,9; 6M33G825/5 koten-power 174 / 111 / 77): không phải số của cấu hình, không dùng.

## Đề xuất bước 2 (phạm vi)
Sửa: (a) bảng nhãn chọn cột theo ô đơn vị cùng dòng hoặc dòng tiêu đề đơn vị giữa bảng, ưu tiên L/h, ghi `unitCell` nguyên văn cho lớp chuẩn hoá;
(b) dòng "a / b L/h (@75% / @100%)" đọc theo mức tải ghi trong ô; (c) tiêu hao từ NCC engine_maker vào fact động cơ, `fuelChecks` dùng tờ hãng
khi dòng tổ máy không có số so được; (d) tên tờ giữ "/" trong mã; (e) xi lanh "Cylinders / Valves", "6 in line", "12缸V型";
(f) bảng dòng máy gắn vào model mà CÙNG trang (cùng nguồn n + tên bảng) liệt kê. Không sửa trong PR này: tiêu đề hai tầng lệch cột
(uleengen, weiman…: việc lớn của bộ đọc bảng dòng), bảng nhiều model cạnh nhau (changchai, yangdong), tờ Spec Sheet dòng máy không liệt kê model (1008–1020).
