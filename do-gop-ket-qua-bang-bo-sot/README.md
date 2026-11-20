# Đo Gợi ý cấu hình (top 30): gốc so với PR #967

- GỐC: main `2ed96b02e367d7bd615fadaaa81552d11caa0997`
- NHÁNH: PR #967 `c9276ef2843554d96d94d1350487c2c38902c9e4`
- Cùng một tệp bidhist (tải lúc 2026-11-20T05:29:35Z, 1556 doc, 928 gói máy phát, 432 NCC). Tệp bidhist KHÔNG nằm trong repo.
- Lệnh (chạy song song, không lỗi lượt nào):
  - `NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs ../wt-goc ../wt-goc/suppliers/cn gop-goc.json --bidhist <bidhist.json>`
  - `NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs ../wt-nhanh ../wt-nhanh/suppliers/cn gop-nhanh.json --bidhist <bidhist.json>`
  - (bidhist tải trước bằng `--save-bidhist` ở lượt gốc)
- Tệp: `gop-*.json.gz` (khoá `<số thông báo>#<chỉ số cỡ>` → top / topScore / all / dropped / rowflag), `gop-*.meta.json`.

## Kết quả
- Số lượt: 1093 (mỗi bên), lỗi: 0, lượt chỉ có ở một bên: 0
- Giống hệt (mọi trường): 875
- Khác (ít nhất một trường: top, điểm, all, dropped hoặc rowflag): 218
  - Trong đó đổi danh sách top 30 (thứ tự hoặc thành phần): 54
  - Top 30 giữ nguyên, khác ở điểm / all / dropped / rowflag: 164
