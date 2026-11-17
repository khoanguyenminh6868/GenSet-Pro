# Soát tay ngưỡng dung tích (min/max) của 155 gói sau #576

Chỉ đọc: không agent, không web, không PR merge. Mã soát: main f214592 (có #576). Script `genbid-work\dieu-phoi\soat-nguong\` (`list.mjs` dựng 155 gói/167 lượt từ `loai-nguon\out\d-*.jsonl` — lượt có dòng "loại thêm" ở #576; `show.mjs`, `multi.mjs`, `ctx.mjs` in nguồn; `table.mjs`/`md.mjs` dựng bảng). Phán là kết quả đọc từng câu nguồn (và văn bản HSMT quanh nó với gói đa cỡ), không suy theo mẫu.

## Kết quả
{{SUM}}

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

## Bảng 155 gói
