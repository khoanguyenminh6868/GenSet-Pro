# Đo top 30 "Gợi ý cấu hình": GỐC vs NHÁNH catalog-b3 (PR #954)

- GỐC: main `091b5c26d1f71260441f0d60e5cf8b928bc521b6`
- NHÁNH: catalog-b3 `5a513b4b790531f71bcb7205840ea7b4f268e668`
- Cùng một tệp bidhist (tải 2026-11-20T02:46:10Z, 928 gói máy phát, 432 NCC), không commit tệp này.
- Lệnh:
  - `NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs ../wt-goc ../wt-goc/suppliers/cn /tmp/gop-goc.json --save-bidhist /tmp/bidhist.json`
  - `NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs ../wt-nhanh ../wt-nhanh/suppliers/cn /tmp/gop-nhanh.json --bidhist /tmp/bidhist.json`
- Số lượt: 1093 mỗi bên, 0 lỗi (GỐC 1692 s, NHÁNH 1618 s).
- So sánh theo từng lượt (khoá thông báo#chỉ số): `top` + `topScore` y hệt = giống.
  - Giống: 1027
  - Khác: 66 (cả 66 đều đổi danh sách `top`, tức đổi top: 66)
  - Lượt thiếu ở nhánh: 0
- Tệp `.gz` chỉ chứa khoá dòng và điểm (top, topScore, all), không có chữ HSMT, không token.
- Không kết luận ở đây; việc đánh giá thuộc điều phối.
