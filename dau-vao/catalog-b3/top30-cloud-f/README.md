# Đo Gợi ý cấu hình (top 30): GỐC vs NHÁNH (PR #954)

- GỐC = merge-base của PR #954 với main = `dc3defc27f40b0ca74b12c8ad4c53c7bb1c4fb08` (trùng đầu `origin/main` lúc đo)
- NHÁNH = PR #954 `dd5a8d023ba3fe638b108ec9d940bca963205026`
- Cùng một tệp bidhist (tải 2026-11-20T07:09:53Z, 1556 doc, 928 gói máy phát, 432 NCC; không commit).
- Lệnh (cùng tệp bidhist cho hai lượt; lần đầu GỐC dùng `--save-bidhist`, chạy lại cả hai với `--bidhist` vì lượt đầu bị dừng do quá giờ):
  - `NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs ../wt-goc ../wt-goc/suppliers/cn gop-goc.json --bidhist <bidhist>`
  - `NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs ../wt-nhanh ../wt-nhanh/suppliers/cn gop-nhanh.json --bidhist <bidhist>`
- Tệp: `gop-*.json.gz` (khoá `thôngbáo#lượt` → top khoá dòng, điểm, all, dropped, rowflag), `*.meta.json`. Chỉ số, khoá dòng, điểm.

## Kết quả
- Số lượt: 1093 (mỗi bên), lỗi 0, thiếu 0
- Giống hệt (top, điểm, all, dropped, rowflag): 430
- Khác ở ít nhất một trường: 663
- Đổi danh sách top 30 (khoá hoặc thứ tự): 66
- Đổi top 1: 0
- Đổi điểm top 30: 22; đổi `all`: 663; đổi số `dropped`: 10; đổi `rowflag`: 0
