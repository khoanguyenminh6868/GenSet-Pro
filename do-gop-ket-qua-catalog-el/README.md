# Đo Gợi ý cấu hình (top 30): main vs catalog-el (PR #969)

- GỐC: main `1e712e199eb3492dd82c7c665e1810efa53d950c`
- NHÁNH: catalog-el `da6879e99fffd04b6bb4ac76368f226331b51407`
- Dữ liệu: cùng một tệp bidhist (tải 2026-11-20T03:20:55Z; 928 gói máy phát, 432 NCC), không đưa vào repo.
- Lệnh (từ main, `suppliers/do-gop.mjs`):
  - `NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs ../wt-goc ../wt-goc/suppliers/cn gop-goc.json --save-bidhist bidhist.json`
  - `NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs ../wt-nhanh ../wt-nhanh/suppliers/cn gop-nhanh.json --bidhist bidhist.json`
- Số lượt: 1093 (mỗi bên), lỗi 0 (gốc 2113 s, nhánh 2086 s).
- So sánh theo khoá lượt `notifyNo#chỉ số cỡ`: top 30 (khoá dòng) + điểm giống hệt = **730**; khác = **363**.
- Số lượt đổi top (danh sách/thứ tự khoá dòng top khác) = **363** (mọi lượt khác đều đổi top).
- Tệp .gz: JSON `{lượt: {top, topScore, all, dropped, rowflag}}`, chỉ khoá dòng và điểm.
