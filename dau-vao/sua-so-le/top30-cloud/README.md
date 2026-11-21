# Đo top 30 gợi ý cấu hình: GỐC so với NHÁNH (PR 1016)

- SHA gốc (merge-base origin/main, pr1016): 95ecba261c22057cbf8036e987c62ae0726068c8
- SHA nhánh (pr1016): 73139d5a361716bc5f44c0a20fade45bc0a10e61
- Giờ tải bidhist (dùng chung cho hai lượt): 2026-11-21T03:23:17.559Z (1556 doc)
- Số gói: 928 (NCC: 435)
- Số lượt mỗi tệp: 1093 (gốc) / 1093 (nhánh); không có lượt nào thiếu ở một phía
- Số lượt lỗi: 0 (gốc) / 0 (nhánh)
- Giống hệt: 1015 lượt; khác: 78 lượt
- Thời gian: gốc 1877 s, nhánh 1911 s

Cả hai lượt dùng cùng `suppliers/cn` của nhánh. Khoá tệp JSON: `<số thông báo>#<chỉ số dòng>`; mỗi giá trị gồm `top`, `topScore`, `all`, `dropped`, `rowflag` (khoá dòng catalog và điểm). Không chứa bidhist hay chữ HSMT.
