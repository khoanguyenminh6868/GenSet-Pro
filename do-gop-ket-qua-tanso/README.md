# Đo top 30 "Gợi ý cấu hình": GỐC vs NHÁNH (PR #979)

- GỐC: main `2ed96b02e367d7bd615fadaaa81552d11caa0997`
- NHÁNH: PR #979 `7057b0f7c6229202018fc461b3f421fe43372539`
- Cùng một tệp bidhist (tải 2026-11-20T05:14:49Z, 1556 doc, 928 gói máy phát cung cấp, 432 NCC), không đưa vào repo.
- Lệnh:
  - `NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs ../wt-goc ../wt-goc/suppliers/cn gop-goc.json --save-bidhist bidhist.json`
  - `NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs ../wt-nhanh ../wt-nhanh/suppliers/cn gop-nhanh.json --bidhist bidhist.json`
- Tệp: `gop-*.json.gz` (khoá `<số thông báo>#<chỉ số cỡ>` -> `top`, `topScore`, `all`, `dropped`, `rowflag`), `gop-*.meta.json`. Chỉ khoá dòng và điểm, không có chữ HSMT.

## Kết quả (so `top` và `topScore`)

| | số lượt |
|---|---|
| Tổng lượt | 1093 |
| Giống hệt (top + điểm) | 1089 |
| Khác | 4 |
| Đổi top (danh sách khác) | 4 |
| Đổi tập hợp top (không chỉ thứ tự) | 4 |
| Đổi hạng 1 | 0 |
| Chỉ đổi điểm, top y nguyên | 0 |
| Lượt lỗi (cả hai bên) | 0 |

Không kết luận thay điều phối.
