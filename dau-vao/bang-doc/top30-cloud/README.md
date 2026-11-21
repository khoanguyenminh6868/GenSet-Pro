# Đo top 30 Gợi ý cấu hình — PR 1045, GỐC vs NHÁNH

- GỐC: c66cf4d9fdf0a4a060a4d532fc92dd2d21ca0c6e (merge-base origin/main, pr1045) — đúng như yêu cầu
- NHÁNH: 54900f1a05180d152cb7237b8a460be93d307bda (pr1045) — đúng như yêu cầu
- Cả hai lượt dùng CÙNG `suppliers/cn` của NHÁNH (435 NCC) và CÙNG một bản bidhist, tải lúc 2026-11-21T11:22:34.833Z (1556 doc, 928 gói máy phát)
- Số lượt: 1093 mỗi bên; lượt lỗi: 0 (cả hai)
- Giống / khác (so JSON từng lượt theo khoá lượt): 608 giống, 485 khác
- Thời gian chạy: GỐC 2456 s, NHÁNH 2291 s
- Tệp: `gop-goc.json.gz`, `gop-nhanh.json.gz` (chỉ số thông báo, khoá dòng NCC, điểm, cờ; không có bidhist/token/chữ HSMT)
- Lưu ý: "giống/khác" là so chuỗi JSON nguyên của từng lượt (gồm điểm và cờ), không chỉ thứ tự top 30.
