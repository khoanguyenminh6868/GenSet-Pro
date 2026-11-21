# Đo PR #1032 (DSE7310 / 7320 MKII operator manual) — top 30 Gợi ý cấu hình

- Gốc = merge-base `7bca1582879ae713ef559f228536b337f32580eb`; nhánh = đầu PR `19ae86c4965fe26079588eddf55f1152f63e841d` (origin/main lúc đo: `017616bd5a140c4260a3fe74becf6e9ab5841eb2`).
- PR chỉ đổi `suppliers/cn/deep-sea-electronics.json` (+356), `suppliers/datasheets/deep-sea-electronics.json`, `suppliers/sources/deep-sea-electronics/1016.md`.
- Mã: dùng mã nhánh cho cả hai bên; cn: gốc = cn của gốc, nhánh = cn của nhánh. Chung một bản bidhist (tải 2026-11-21T07:16:52Z, 1556 doc, 928 gói, 435 NCC; lưu ngoài repo, không commit).

## Kết quả
| | |
|---|---|
| Số lượt | 1093 (lỗi: **0**, cả hai bên) |
| Giống hệt (top, thứ tự, điểm, toàn bảng) | **1093** |
| Đổi tập top 30 | 0 |
| Chỉ đổi thứ tự | 0 |
| Đổi điểm | 0 |
| Dòng bảng ứng viên (tổng mọi lượt) | gốc 1.092.371 / nhánh 1.092.371 |
| Dòng mất hẳn / dòng mới | 0 / 0 |
| Dòng BẤT THƯỜNG | 0 |
| Dòng hạng 1–5 gốc ra khỏi top 30 | 0 |

Không có lượt nào đổi nên không có danh sách dòng vào/ra/đổi điểm. Kỳ vọng "không đổi hoặc chỉ dòng DSE7310/7320 đổi" được thoả (không đổi gì). Lưu ý: ngay cả dòng DSE7310/7320 cũng không xuất hiện thêm trong bảng ứng viên của bất kỳ lượt nào (có thể do không gói nào trong bidhist khớp, hoặc dòng mới bị lọc trước bảng) — chưa tra nguyên nhân vì ngoài phạm vi đo.

Thời gian chạy: gốc 2046 s, nhánh 2136 s. Tệp: `base.json.gz`, `nhanh.json.gz` (+ `.meta.json`); không có bidhist.
