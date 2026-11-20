# Đo top 30 Gợi ý cấu hình: cặp 2

- GỐC  = main `091b5c26d1f71260441f0d60e5cf8b928bc521b6`
- NHÁNH = khi-fuel-2 `c70ce420a87e5b8425597e9a9338c7a992c85670`
- Lệnh (cùng tệp bidhist, tải 1 lần lúc 2026-11-20T02:07:56Z, không commit):
  - `NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs <wt-gốc> <wt-gốc>/suppliers/cn gop-goc.json [--save-bidhist|--bidhist] <bidhist>`
  - `NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs <wt-nhánh> <wt-nhánh>/suppliers/cn gop-nhanh.json --bidhist <bidhist>`
- Số lượt: 1093 mỗi bên (928 gói, 432 nhà cung cấp), 0 lượt lỗi.
- Lượt giống hoàn toàn (mọi trường): 317; khác ở `all`/`dropped`: 776.
- Lượt đổi top (top hoặc topScore khác): 106.
- Tệp: `gop-*.json.gz` (khoá lượt -> top, topScore, all, dropped, rowflag), `*.meta.json`.
- Chỉ có khoá dòng và điểm; không có bidhist hay chữ HSMT.
