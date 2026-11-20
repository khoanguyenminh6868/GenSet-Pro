# Đo top 30 Gợi ý cấu hình: cặp 1

- GỐC  = main `adc8d0c04b69399b11faa935a19e4c2bbac776db`
- NHÁNH = khi-fuel-2 `b0150c649bc3be6c8bd8e954df72c786e443df82`
- Lệnh (cùng tệp bidhist, tải 1 lần lúc 2026-11-20T02:07:56Z, không commit):
  - `NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs <wt-gốc> <wt-gốc>/suppliers/cn gop-goc.json [--save-bidhist|--bidhist] <bidhist>`
  - `NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs <wt-nhánh> <wt-nhánh>/suppliers/cn gop-nhanh.json --bidhist <bidhist>`
- Số lượt: 1093 mỗi bên (928 gói, 432 nhà cung cấp), 0 lượt lỗi.
- Lượt giống hoàn toàn (mọi trường): 317; khác ở `all`/`dropped`: 776.
- Lượt đổi top (top hoặc topScore khác): 106.
- Tệp: `gop-*.json.gz` (khoá lượt -> top, topScore, all, dropped, rowflag), `*.meta.json`.
- Chỉ có khoá dòng và điểm; không có bidhist hay chữ HSMT.
