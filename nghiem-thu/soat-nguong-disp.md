# Soát tay ngưỡng dung tích (min/max) của 155 gói sau #576

Chỉ đọc: không agent, không web, không PR merge. Mã soát: main f214592 (có #576). Script `genbid-work\dieu-phoi\soat-nguong\` (`list.mjs` dựng 155 gói/167 lượt từ `loai-nguon\out\d-*.jsonl` — lượt có dòng "loại thêm" ở #576; `show.mjs`, `multi.mjs`, `ctx.mjs` in nguồn; `table.mjs`/`md.mjs` dựng bảng). Phán là kết quả đọc từng câu nguồn (và văn bản HSMT quanh nó với gói đa cỡ), không suy theo mẫu.

## Kết quả
ĐÚNG 148 / SAI 6 / KHÔNG RÕ 1 (tổng 155 gói, 167 lượt; trong ĐÚNG có 43 gói "số trần", 6 gói có lượt đo lệch)

Cả 155 gói đều là NGƯỠNG TỐI THIỂU (không gói nào có max dung tích). Danh sách đang mở (feed/tracked): **không lấy được** (feed/tracked nằm ở web/Supabase, brief cấm đụng web). Đánh dấu thay thế: `[CM]` = có configmatch (3 gói: IB2600574589, IB2600581977, IB2600592684), `[mới 2026]` = IB26… (14 gói, nhiều khả năng còn mở). Điều phối đối chiếu với feed.

## Nhóm lỗi
| nhóm | gói | ghi chú |
|---|---|---|
| ngưỡng của cỡ khác (khối cỡ không dò ra → ngưỡng "chung" áp mọi cỡ) | 4: IB2300363623 (lượt 5 kW), IB2500385135 (lượt 10,5 kVA), IB2500512614 (lượt 22 kVA), IB2400313681 (lượt 42 kVA, lỏng) | `minsForSize` không thấy khối nào (`sizeBlocks` thiếu câu "≥ N kVA") → giá trị duy nhất ở mục của một cỡ bị áp cho cỡ kia. 3/4 loại oan thật (cỡ nhỏ nhận ngưỡng của cỡ lớn); IB2400313681 thì ngưỡng thấp hơn thật (OCR ">3.71ít" không đọc) nên không loại oan. **Không sửa** (cần dò mục theo cỡ, rủi ro; đề xuất việc riêng) |
| bỏ dung sai ± % | 2: IB2300087393 (12,9 L ± 3%), IB2300293753 (lượt 10 kVA, 1,3 L ± 5%) | cả kho 1.513 văn bản chỉ có 2 gói này. **Đã sửa trong PR nháp** |
| dung sai ghi lạ | 1: IB2500464050 ("30L + 1%") | KHÔNG RÕ; ±1% chỉ đổi 5 dòng |
| số trần (không ≥/>) | 43 gói tính trong ĐÚNG | số đọc đúng; hiểu là tối thiểu theo quy tắc L2 của Khoa (03/11). Rủi ro chung: nếu HSMT chỉ nêu mẫu động cơ thì động cơ nhỏ hơn chút (vd 410 kVA "13L" vs Baudouin 12,54 L) bị loại |
| đo #576 áp ngưỡng không theo cỡ | 6 gói / 8 lượt: IB2200046063, IB2200062073, IB2300120176, IB2300245556, IB2300245748, IB2400487460 | `measure2.mjs` gọi `hintsOf(text,"")` không truyền `sizing` như bot thật; mã thật cho `null` (không lọc) ở các lượt này → số "8.654 dòng loại thêm" và "155 gói" của #576 hơi cao (phần này không có thật) |

Không có gói nào mắc: nhầm đơn vị, nhầm lớn/nhỏ (`<` vs `≥`), dung tích nước/dầu/bình, thiết bị khác.

## Việc ngoài phạm vi thấy được (không sửa)
- Câu "Tổng dung tích Piston ≥ 12.78 lít", "Dung tích buồng đốt ≥ 4,4 lít" đọc đúng; nhưng "Dung tích xi-lanh: 13 Lít" (gạch nối, IB2600592684 mục 500 kVA) và "7,2551 lít" (IB2400495696, 4 chữ số thập phân) không đọc được.
- `candidates()` so `x < min` chính xác, không xét làm tròn (min 9,726 vs datasheet ghi 9,7): chưa đo.
- IB2300293753 mục 36 và 200 kVA ghi "< 2,9" và "< 6,8" (đọc là tối đa theo quy tắc `<`), bất thường so với "≥ 1,3" của 10 kVA; HSMT lạ.

## PR nháp (dung sai ±%)
Phạm vi: `suppliers/config-bot.mjs` (+`tolOf`/`lowered` trong `engineLists`: "± N%" ngay sau số dung tích tối thiểu hạ ngưỡng N%) + `suppliers/disp-tol.test.mjs` (2 test; test 1 đỏ trên mã cũ, xanh trên mã mới). Không đổi dải, MAKE_CAP, keep.
- `node --test suppliers/`: 419 tests, 419 pass, 0 fail. `node suppliers/verify.mjs` chạy bình thường.
- Đo trước/sau (đo, `measure3.mjs`, 6 tiến trình, 1.539 lượt, 0 lỗi, mã trước = origin/main f214592, có truyền sizing như bot thật): chỉ **1 lượt đổi**: IB2300087393 400 kVA, ngưỡng 12,9 → 12,513 L, dòng bị loại 608 → 271 (337 dòng loại oan được trả lại, chủ yếu WP13D385E200 12,53 L…), top 3 đổi, top 30 thêm 13 dòng. Lượt khác: 0 thay đổi (IB2300293753 10 kVA: 1,3 → 1,235 L không đổi dòng nào).
- Quay lui: revert commit; không cần restart bot.
- Chưa kiểm: nhóm "ngưỡng của cỡ khác" (4 gói) chưa sửa; số liệu 337 dòng chưa đối chiếu datasheet từng dòng.

## Bảng 155 gói

| gói | cỡ | ngưỡng code (dung tích) | câu nguồn (nguyên văn ≤150 ký tự) | phán |
|---|---|---|---|---|
| IB2200001635 | 100kVA | min 4.4 L | Dung tích buồng đốt ≥ 4,4 lít | **ĐÚNG** |
| IB2200012797 | 8.5kVA | min 1.6 L | 4 Dung tích xilanh ≥ 1,6 lít | **ĐÚNG** |
| IB2200012854 | 36kW | min 4.5 L | - Dung tích xylanh: 4,5 lít | **ĐÚNG** — số trần (L2) |
| IB2200016199 | 8.5kVA | min 1.826 L | 6 Tổng dung tích xilanh ≥ 1,826 lít | **ĐÚNG** |
| IB2200020589 | 12.5kVA | min 2.5 L | 4 Dung tích xilanh ≥ 2.5 Đạt Không đạt | **ĐÚNG** |
| IB2200029877 | 8.5kVA | min 2.1 L | 4 Dung tích xilanh ≥ 2,1 lít | **ĐÚNG** |
| IB2200029921 | 8.5kVA | min 2.1 L | 4 Dung tích xilanh ≥ 2,1 lít | **ĐÚNG** |
| IB2200029952 | 8.5kVA | min 2.1 L | 4 Dung tích xilanh ≥ 2,1 lít | **ĐÚNG** |
| IB2200030059 | 8.5kVA | min 2.1 L | 4 Dung tích xilanh ≥ 2,1 lít | **ĐÚNG** |
| IB2200037783 | 110kVA | min 5.9 L | - Dung tích xi lanh: 5900cc | **ĐÚNG** — số trần (L2) |
| IB2200046063 | 10.5kVA / 13.5kVA | 10.5: không áp; 13.5: không áp | 4 Dung tích xilanh ≥ 2,5 lít Đạt Không đạt | **ĐÚNG** (đo #576 áp ngưỡng không theo cỡ; mã thật không áp) |
| IB2200049662 | 500kVA | min 19 L | 8 Tổng dung tích xylanh 19 lít | **ĐÚNG** — số trần (L2) |
| IB2200052056 | 8.5kVA | min 2.26 L | 4 Dung tích xilanh ≥ 2.26 Đạt Không đạt | **ĐÚNG** |
| IB2200062073 | 12.5kVA / 30kVA | 12.5: không áp; 30: min 2.3 L | Dung tích xilanh ≥ 2,3 lít | **ĐÚNG** (đo #576 áp ngưỡng không theo cỡ; mã thật không áp) |
| IB2200067764 | 160kVA | min 8.3 L | Dung tích xi lanh: ≥ 8.3 L | **ĐÚNG** |
| IB2200071778 | 15kVA | min 2.54 L | Dung tích xy lanh ≥ 2.54 lít | **ĐÚNG** |
| IB2200082109 | 250kVA | min 9.726 L | 6 Dung tích xi lanh (L) 9.726 | **ĐÚNG** — số trần (L2) |
| IB2200100465 | 75kVA | min 4.837 L | - Dung tích xi lanh (L) 4,837 | **ĐÚNG** — số trần (L2) |
| IB2300020482 | 10kVA | min 1.6 L | 9 ¦ Dung tích xylanh > 1600 cc Bắt buộc | **ĐÚNG** |
| IB2300022380 | 48kW | min 3.9 L | Dung tích xilanh (L): 3.9 | **ĐÚNG** — số trần (L2) |
| IB2300022940 | 625kVA | min 19.6 L | Dung tích xi lanh ≥ 19,6 L | **ĐÚNG** |
| IB2300026252 | 15kVA | min 1.8 L | - Dung tích xy lanh (cc): ≥ 1.800 | **ĐÚNG** |
| IB2300042675 | 250kVA | min 11.051 L | Dung tích xi lanh ≥ 11.051 L | **ĐÚNG** |
| IB2300046353 | 15kVA | 15: min 1.95 L | 6 Tổng dung tích xilanh > 1,950 lít | **ĐÚNG** |
| IB2300048778 | 10kVA | min 1.809 L | Dung tich xy lanh > 1.809 lit | **ĐÚNG** |
| IB2300062472 | 8.5kVA | min 2.15 L | 10 Dung tích xi lanh ≥ 2,150 lít đáp ứng | **ĐÚNG** |
| IB2300065474 | 8.5kVA | min 2 L | Dung tích xilanh ≥ 2 lít | **ĐÚNG** |
| IB2300067330 | 10.5kVA | min 2.3 L | 4 Dung tích xilanh ≥ 2,3 lít Đạt | **ĐÚNG** |
| IB2300083611 | 60kVA | min 4.33 L | 6 Tổng dung tích xilanh > 4,33 lít | **ĐÚNG** |
| IB2300087393 | 400kVA | min 12.9 L | + Tổng dung tích xylanh: 12,9 L (± 3%) | **SAI** — bỏ dung sai ±%: '12,9 L (± 3%)' → ngưỡng thật ≥ 12,513 L; code dùng 12,9 (Volvo 12,78 L chẳng hạn bị loại) |
| IB2300088930 | 20kVA | min 2.9 L | Tổng dung tích xilanh ≥ 2,9 lít. | **ĐÚNG** |
| IB2300089150 | 45kVA | min 4.2 L | 8 Dung tích xylanh ≥ 4,2 L | **ĐÚNG** |
| IB2300102941 | 15kVA | 15: min 1.95 L | 6 Tổng dung tích xilanh > 1,950 lít | **ĐÚNG** |
| IB2300120176 | 12.5kVA / 40kVA | 12.5: không áp; 40: min 2.3 L | 6 Dung tích xilanh ≥ 2,3 lít Đạt Không đạt | **ĐÚNG** (đo #576 áp ngưỡng không theo cỡ; mã thật không áp) |
| IB2300131371 | 30kVA | min 3.331 L | - Dung tích xi lanh: 3.331L | **ĐÚNG** — số trần (L2) |
| IB2300133361 | 8.5kVA | min 2.3 L | Dung tích xilanh ≥ 2,3 lít | **ĐÚNG** |
| IB2300147640 | 200kVA | min 10.09 L | Dung tích xi lanh: 10.09 lít | **ĐÚNG** — số trần (L2) |
| IB2300158982 | 250kVA | min 8.9 L | Dung tích xi lanh 8.9 lít | **ĐÚNG** — số trần (L2) |
| IB2300179052 | 250kVA | min 8.9 L | + Dung tích xylanh 8.9L. | **ĐÚNG** — số trần (L2) |
| IB2300188511 | 2500kVA | min 78 L | Tổng dung tích xy- - ≥78 L | **ĐÚNG** |
| IB2300192935 | 1250kVA | min 49.03 L | Tổng dung tích xylanh 49.03 lít | **ĐÚNG** — số trần (L2) |
| IB2300198424 | 40kVA | min 3.765 L | 6 Tổng dung tích xilanh ≥ 3,765 lít. | **ĐÚNG** |
| IB2300204696 | 120kVA | min 7.7 L | Dung tích xi lanh 7.7 Lít | **ĐÚNG** — số trần (L2) |
| IB2300217401 | 10.5kVA | min 2.156 L | - Động cơ: Công xuất liên tục ≥17KW; Tốc độ quay 1500 vòng/phút; Số xi lanh 4; Hành trình piston (mm) 85x95; Tỷ lệ nén 18:01; Khởi động đề nổ; Dung t… | **ĐÚNG** |
| IB2300222010 | 15kVA | min 2.42 L | 3 Dung tích xilanh ≥ 2.42 L | **ĐÚNG** |
| IB2300239791 | 50kVA | min 4.3 L | Dung tích xy lanh ≥ 4.300 lít | **ĐÚNG** |
| IB2300245556 | 8.5kVA / 10.5kVA / 12.5kVA | 8.5: min 2.3 L; 10.5: min 2.3 L; 12.5: không áp | 5 Dung tích xilanh ≥ 2.3 lít Đạt Không đạt | **ĐÚNG** (đo #576 áp ngưỡng không theo cỡ; mã thật không áp) |
| IB2300245748 | 8.5kVA / 10kVA / 12kVA | 8.5: min 2.3 L; 10: không áp; 12: không áp | 5 Dung tích xilanh ≥ 2.3 lít Đạt Không đạt | **ĐÚNG** (đo #576 áp ngưỡng không theo cỡ; mã thật không áp) |
| IB2300247709 | 60kVA | min 3.9 L | Dung tích xi lanh: 3,9 lít; | **ĐÚNG** — số trần (L2) |
| IB2300252125 | 400kVA | min 14.618 L | Dung tích xy lanh 14,618 L | **ĐÚNG** — số trần (L2) |
| IB2300253227 | 100kVA | 100: min 5.9 L | - Tổng dung tích xi lanh: 5,9l | **ĐÚNG** — số trần (L2): 5,9 l nằm ở cả hai mục cỡ (100 và 150 kVA) |
| IB2300253626 | 220kVA | 220: min 11.945 L | Tổng dung tích xylanh 11,945 lít | **ĐÚNG** — số trần (L2): 11,945 L ở mục 2.2.1 máy 220 kVA (lượt đang xét); mục 7,5 kVA không có (plausible cắt) |
| IB2300254910 | 12.5kVA | min 2.27 L | Tổng dung tích xilanh ≥ 2,27 lít | **ĐÚNG** |
| IB2300255495 | 10.5kVA | min 2.156 L | - Động cơ: Công xuất liên tục ≥17KW; Tốc độ quay 1500 vòng/phút; Số xi lanh 4; Hành trình piston (mm) 85x95; Tỷ lệ nén 18:01; Khởi động đề nổ; Dung t… | **ĐÚNG** |
| IB2300255930 | 800kVA | min 22.9 L | 8 Tổng dung tích xilanh ≥ 22,9 lít | **ĐÚNG** |
| IB2300278731 | 100kVA | min 5.9 L | - Dung tích xy lanh: > 5.9 lít. | **ĐÚNG** |
| IB2300293753 | 10kVA | 10: min 1.3 L | 11 Tổng dung tích xy lanh ≥ 1,3 (lít) ± 5% | **SAI** — bỏ dung sai ±%: lượt 10 kVA: '≥ 1,3 (lít) ± 5%' → ≥ 1,235 L; code dùng 1,3 |
| IB2300299959 | 8.5kVA | min 1.64 L | 5 Dung tích xilanh ≥ 1.64 lít Đạt Không đạt | **ĐÚNG** |
| IB2300301452 | 31kVA | min 3.568 L | Dung tích xi lanh (L): ≥ 3,568 | **ĐÚNG** |
| IB2300315082 | 750kVA | min 21.927 L | + Dung tích xi lanh: 21.927 L | **ĐÚNG** — số trần (L2) |
| IB2300329776 | 8.5kVA | min 1.64 L | 5 Dung tích xilanh ≥ 1.64 lít Đạt | **ĐÚNG** |
| IB2300335088 | 8.5kVA | min 2 L | Dung tích xilanh ≥ 2 lít | **ĐÚNG** |
| IB2300335255 | 200kVA | min 8 L | - Dung tích xy lanh: ≥ 8.0 lít. | **ĐÚNG** |
| IB2300340671 | 75kVA | min 4.83 L | - Dung tích xi lanh: 4830CC | **ĐÚNG** — số trần (L2) |
| IB2300349583 | 18kVA | min 2.5 L | 8 ¦ Dung tich xylanh = 2.5L Bắt buộc | **ĐÚNG** — số trần (L2) |
| IB2300356137 | 80kVA | min 6.494 L | 5 Dung tích xi lanh > 6.494 L | **ĐÚNG** |
| IB2300356147 | 80kVA | min 4.95 L | Dung tích xi lanh: ≥ 4.95 L | **ĐÚNG** |
| IB2300359120 | 165kVA | min 6.8 L | 6 Dung tích xylanh 6.800 cm³ | **ĐÚNG** — số trần (L2) |
| IB2300363623 | 5kW / 15kVA | 5: min 1.758 L; 15: min 1.758 L | - Dung tích xy lanh: > 1.758 lit | **SAI** — ngưỡng của cỡ khác: lượt 5 kW nhận > 1.758 L của máy 15 kVA (mục kW ghi 'Dung tích động cơ > 456cc' không đọc); lượt 15 kVA đúng |
| IB2300364488 | 200kVA | min 7.98 L | - Dung tích xi lanh: 7.98 lít | **ĐÚNG** — số trần (L2) |
| IB2300370623 | 30kVA | min 2.54 L | Dung tích xilanh (L) 2.54 | **ĐÚNG** — số trần (L2) |
| IB2400026437 | 350kVA | min 11.051 L | - Dung tích xylanh: ≥ 11,051 lít | **ĐÚNG** |
| IB2400031785 | 23kVA | min 2.434 L | - Dung tích xi lanh: 2434cc | **ĐÚNG** — số trần (L2) |
| IB2400041536 | 410kVA | min 13 L | Dung tích xi lanh: 13L | **ĐÚNG** — số trần (L2) |
| IB2400054276 | 15kVA | min 2.27 L | - Dung tích xi lanh(L) 2,27 | **ĐÚNG** — số trần (L2) |
| IB2400063033 | 8kVA | min 1.64 L | 5 Dung tích xilanh >1.64 lít Đạt Không đạt | **ĐÚNG** |
| IB2400090868 | 15kVA | min 2.27 L | - Dung tích xi lanh(L) 2,27 | **ĐÚNG** — số trần (L2) |
| IB2400095756 | 300kVA | min 10.34 L | Tỷ số nén: 16.8; Dung tích xilanh (L): > 10.34. | **ĐÚNG** |
| IB2400103308 | 8.5kVA | min 1.645 L | 5 Dung tích xilanh ≥ 1.645 lít Đạt Không đạt | **ĐÚNG** |
| IB2400114476 | 45kVA | 45: min 4.5 L | 6 Tổng dung tích xilanh ≤1,826 lít | **ĐÚNG** — số trần (L2) |
| IB2400116787 | 12kVA / 40kVA | 12: min 2.3 L; 40: min 2.3 L | Tổng dung tích xilanh ≥ 2.3 lít | **ĐÚNG** |
| IB2400129388 | 300kVA | min 10.34 L | Tỷ số nén: 16.8; Dung tích xilanh (L): > 10.34. | **ĐÚNG** |
| IB2400134652 | 68kVA | min 4.087 L | - Dung tích xi lanh: > 4.087 lit. | **ĐÚNG** |
| IB2400153322 | 8kVA | min 1.64 L | 5 Dung tích xilanh >1.64 lít Dat Khong dat | **ĐÚNG** |
| IB2400159665 | 8.5kVA | min 2.67 L | 6 ¦ Tổng dung tích xilanh > 2,67 lít Dat Khong dat | **ĐÚNG** |
| IB2400164837 | 23kVA | min 2.672 L | 7 Dung tích xylanh 2.672 lít | **ĐÚNG** — số trần (L2) |
| IB2400216393 | 250kVA | min 8.9 L | + Dung tích xy lanh: 8.9 L | **ĐÚNG** — số trần (L2) |
| IB2400217107 | 125kVA | min 6.87 L | Dung tích xi lanh 6.87L | **ĐÚNG** — số trần (L2) |
| IB2400226406 | 8.5kVA | min 2 L | Dung tích xilanh ≥ 2 lít | **ĐÚNG** |
| IB2400257256 | 12kVA | min 2.3 L | 8 Dung tích xilanh ≥ 2300 cc Đạt Không đạt | **ĐÚNG** |
| IB2400282042 | 8.5kVA | min 1.532 L | 8 Dung tích xi lanh (lít) ≥ 1.532 lít | **ĐÚNG** |
| IB2400296884 | 12kVA | min 2.27 L | Tổng dung tích xilanh ≥ 2,27 lít | **ĐÚNG** |
| IB2400298819 | 250kVA | min 11.051 L | Dung tích xi lanh 11.051 L | **ĐÚNG** — số trần (L2) |
| IB2400303471 | 150kVA | min 6.75 L | - Dung tích xilanh: ≥ 6.75 L | **ĐÚNG** |
| IB2400311574 | 12.5kVA | min 2.3 L | 9 Dung tích xilanh: ≥ 2,3 lít | **ĐÚNG** |
| IB2400313681 | 30kVA / 42kVA | 30: min 3.3 L; 42: min 3.3 L | 6 Tong dung tich xilanh > 3.3 lit Dat Khong dat | **SAI** — ngưỡng của cỡ khác (lỏng): 30 kVA '> 3.3 lit' đúng; 42 kVA ghi '>3.71ít' (≈ 3,7 L, OCR) không đọc được → lượt 42 kVA dùng 3.3 (thấp hơn thật, không loại oan) |
| IB2400339967 | 10kVA | min 2.2 L | Dung tích xy lanh ≥ 2.2 lít | **ĐÚNG** |
| IB2400356423 | 16kVA | min 2.3 L | 5. Tổng dung tích xylanh ≥ 2,3 L | **ĐÚNG** |
| IB2400382139 | 12kVA | min 2.3 L | Tổng dung tích xilanh ≥ 2,3 lít | **ĐÚNG** |
| IB2400389856 | 100kVA | min 5.9 L | Dung tích xy lanh: 5.9 L, | **ĐÚNG** — số trần (L2) |
| IB2400434949 | 45kVA | min 4.5 L | 6 Tổng dung tích xilanh ≥ 4,5 lít | **ĐÚNG** |
| IB2400439995 | 250kVA | min 11.051 L | Dung tích xi lanh 11.051 L | **ĐÚNG** — số trần (L2) |
| IB2400440257 | 23kVA | min 2.672 L | Dung tích xylanh > 2.672 lít | **ĐÚNG** |
| IB2400442989 | 30kVA | min 2.4 L | - Tổng dung tích xy-lanh: ≥ 2,4 lít. Đáp ứng yêu cầu - Không đáp ứng yêu cầu | **ĐÚNG** |
| IB2400457172 | 8.5kVA | min 2.3 L | 4 Dung tích xilanh ≥ 2,3 lít Đạt Không đạt | **ĐÚNG** |
| IB2400470242 | 33kVA | min 3.9 L | Dung tích xy lanh: 3.9L | **ĐÚNG** — số trần (L2) |
| IB2400475145 | 8.5kVA | min 2.3 L | 9 Tổng dung tích xilanh ≥ 2,3 lít | **ĐÚNG** |
| IB2400481610 | 8.5kVA | min 1.645 L | 5 Dung tích xilanh ≥ 1.645 lít Đạt | **ĐÚNG** |
| IB2400487460 | 8.8kVA / 40kVA | 8.8: không áp; 40: min 3.9 L | Dung tích xilanh ≤ 2.3 lít | **ĐÚNG** — số trần (L2) (đo #576 áp ngưỡng không theo cỡ; mã thật không áp): lượt 40 kVA ≥ 3,9 L đúng; lượt 8,8 kVA mã thật không áp (đo #576 áp 3,9 nhầm) |
| IB2400493077 | 80kVA | min 4.5 L | 5 Dung tích xilanh ≥ 4.5 lít | **ĐÚNG** |
| IB2400495088 | 300kVA | min 11 L | Dung tích xilanh L ≥ 11 | **ĐÚNG** |
| IB2400495696 | 100kVA | 100: min 4.837 L | 4. ¦ Dung tich xylanh >4,837 lit | **ĐÚNG**: 4,837 L là của 100 kVA (động cơ 81,6 kW); 30/200 kVA (7,2551 L không đọc được) không nằm trong tập loại thêm |
| IB2400513782 | 12.5kVA | min 1.8 L | Tổng dung tích 7 >= 1,8 lít X xilanh | **ĐÚNG** |
| IB2400531851 | 12.5kVA | min 2.3 L | Dung tích xilanh ≥ 2300 cc | **ĐÚNG** |
| IB2400533611 | 630kVA | min 26.6 L | Tổng dung tích xy lanh Lít ≥26.6 | **ĐÚNG** |
| IB2400542354 | 12.5kVA | min 2.3 L | Dung tích xilanh ≥ 2300 cc | **ĐÚNG** |
| IB2400546306 | 125kVA | min 5.9 L | - Dung tích xy lanh (lít): 5.9 | **ĐÚNG** — số trần (L2) |
| IB2400560277 | 200kVA | min 8.8 L | Dung tích xylanh ≥ 8,8 lít | **ĐÚNG** |
| IB2400595350 | 50kVA | min 4.329 L | - Dung tích xi lanh: > 4.329 L | **ĐÚNG** |
| IB2400596787 | 630kVA | min 26.6 L | Tổng dung tích xy lanh Lít ≥26.6 | **ĐÚNG** |
| IB2500057816 | 100kVA | min 5.9 L | 5 Dung tích xi lanh 5.9 lít | **ĐÚNG** — số trần (L2) |
| IB2500084609 | 15kVA | min 2.43 L | Dung tích xi lanh (litres) ≥ 2.430 | **ĐÚNG** |
| IB2500189560 | 12.5kVA | min 2.3 L | Tổng dung tích xilanh ≥ 2.3 lít | **ĐÚNG** |
| IB2500198459 | 12kVA | min 2.3 L | 9 Tổng dung tích xilanh ≥ 2.3 lít Đạt Không đạt | **ĐÚNG** |
| IB2500211376 | 15kVA | min 2.43 L | Dung tích xi lanh (litres) ≥ 2.430 | **ĐÚNG** |
| IB2500271735 | 200kVA | min 7.98 L | Dung tích xi lanh(L) 7.98 | **ĐÚNG** — số trần (L2) |
| IB2500291421 | 550kVA | min 23.15 L | - Dung tích xilanh: 23.150 L | **ĐÚNG** — số trần (L2) |
| IB2500336823 | 12kVA | min 1.8 L | Tổng dung tích xilanh ≥ 1,8 lít | **ĐÚNG** |
| IB2500364714 | 500kVA | min 18.8 L | Dung tích xy lanh ≥ 18,8 lít | **ĐÚNG** |
| IB2500372309 | 630kVA | min 25 L | Dung tích xi lanh ≥ 25 L | **ĐÚNG** |
| IB2500385135 | 10.5kVA / 20kVA | 10.5: min 2.197 L; 20: min 2.197 L | Dung tích xy lanh 2.197 L | **SAI** — ngưỡng của cỡ khác: 2.197 L chỉ có ở mục 20 kVA (dòng 148); mục 10.5 kVA (động cơ 12.8 kW) không ghi dung tích → lượt 10.5 kVA bị áp nhầm; lượt 20 kVA đúng |
| IB2500442970 | 12.5kVA | min 2.67 L | 9 Tổng dung tích xilanh ≥ 2,67 lít | **ĐÚNG** |
| IB2500464050 | 750kVA | min 30 L | 2.7 ¦ Dung tich xilanh 30L + 1% | **KHÔNG RÕ** — dung sai ghi lạ: '30L + 1%': dấu + có thể là ±; nếu ± thì ≥ 29,7 L |
| IB2500471911 | 12kVA | min 2.3 L | Tổng dung tích xilanh ≥ 2,3 lít | **ĐÚNG** |
| IB2500473200 | 630kVA | min 26.6 L | Tổng dung tích xy lanh Lít ≥ 26.6 | **ĐÚNG** |
| IB2500476713 | 13kVA | min 2.3 L | Tổng dung tích xilanh ≥ 2.3 lít | **ĐÚNG** |
| IB2500498271 | 15kVA | min 2.3 L | Tổng dung tích xilanh ≥ 2,3 lít | **ĐÚNG** |
| IB2500512614 | 22kVA | 22: min 2.3 L | Tổng dung tích xy lanh ≥ 2.3 L | **SAI** — ngưỡng của cỡ khác: ≥ 2.3 L là của mục máy 40 kVA (1.3.1); 22 kVA là điều chuyển máy cũ, không có yêu cầu động cơ → lượt 22 kVA bị áp nhầm |
| IB2500532997 | 12kVA | min 2.3 L | Tổng dung tích xilanh ≥ 2.3 lít | **ĐÚNG** |
| IB2500553750 | 200kVA | min 9.726 L | - Dung tích xi lanh: 9.726L | **ĐÚNG** — số trần (L2) |
| IB2500611943 | 100kVA | min 4.7 L | Tổng dung tích xy lanh ≥ 4.7 L | **ĐÚNG** |
| IB2600252022 [mới 2026] | 100kVA | min 6.871 L | Dung tích xilanh: ≥6,871 L | **ĐÚNG** |
| IB2600315904 [mới 2026] | 354kVA | min 12.78 L | + Tổng dung tích Piston: ≥ 12.78 lít; | **ĐÚNG** |
| IB2600337362 [mới 2026] | 1500kVA | min 49 L | Dung tích xi lanh ¦ ≥ 49 lít ¦ Đạt: Đáp ứng | **ĐÚNG** |
| IB2600350175 [mới 2026] | 825kVA | min 28.14 L | 15 Dung tích xi lanh 28.14L | **ĐÚNG** — số trần (L2) |
| IB2600434462 [mới 2026] | 12kVA | min 2.3 L | 9 Tổng dung tích xilanh ≥ 2,3 lít | **ĐÚNG** |
| IB2600448676 [mới 2026] | 300kVA | min 11 L | - Dung tích xy lanh ≥ 11L | **ĐÚNG** |
| IB2600464766 [mới 2026] | 150kVA | min 6.7 L | (Displacement)≥ 6.7 lít đến 7.5 lít | **ĐÚNG** |
| IB2600472762 [mới 2026] | 750kVA | min 30 L | 2.8 Dung tích xi-lanh ≥ 30L | **ĐÚNG** |
| IB2600511162 [mới 2026] | 1500kVA | min 50 L | > Ấn - Dung tích xylanh: > 50 lít | **ĐÚNG** |
| IB2600574589 [mới 2026,CM] | 400kVA | min 12 L | II.3 Dung tích xi lanh Dung tích xi lanh tổng tối thiểu: ≥ 12 Lít. | **ĐÚNG** |
| IB2600581977 [mới 2026,CM] | 250kVA | min 11.05 L | Dung tích xy lanh ≥ 11,05 L | **ĐÚNG** |
| IB2600587429 [mới 2026] | 50kVA | min 3.61 L | - Dung tích xy lanh: 3.61 L | **ĐÚNG** — số trần (L2) |
| IB2600588204 [mới 2026] | 12kVA | min 2.3 L | Tổng dung tích xilanh ≥ 2.3 lít | **ĐÚNG** |
| IB2600592684 [mới 2026,CM] | 30kVA | 30: min 3.9 L | + Dung tích xi lanh: 3.9L | **ĐÚNG** — số trần (L2) |
