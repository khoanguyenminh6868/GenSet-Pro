# Đo top 30 gợi ý cấu hình — PR 1020, gốc so với nhánh

- GỐC: `589596edc9055ba61224640ccc86fa8fda79a16d` (merge-base origin/main và pr1020)
- NHÁNH: `c189323688e08d520bccf3a72b85a0266e857a72` (pr1020)
- Cả hai lượt dùng cùng `suppliers/cn` của nhánh và cùng một bản bidhist, tải lúc 2026-11-21T06:12:49Z (bản bidhist không đưa vào repo).
- Số gói đo: 928 (meta); số lượt (khoá `<số thông báo>#<chỉ số>`): 1093 mỗi tệp, 890 số thông báo khác nhau trong khoá
- Số lượt lỗi: 0 (gốc), 0 (nhánh)
- Giống hệt: 691 lượt; khác: 402 lượt; lượt chỉ có ở một bên: 0
- Thời gian chạy: gốc 2544 s, nhánh 2484 s
- Mỗi lượt: `top` (khoá dòng), `topScore`, `all`, `dropped`, `rowflag`.
