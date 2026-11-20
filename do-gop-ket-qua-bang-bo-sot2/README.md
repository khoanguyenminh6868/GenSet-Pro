# Đo top 30 gợi ý cấu hình – PR #967

- SHA gốc (merge-base origin/main và PR, cũng là đầu origin/main lúc đo): `8b5184ebe016488909423be8d2fbd62679c89956`
- SHA PR #967: `498527887d3f88c92ddeeceb1070a6c8667b95e4`
- Cùng một bộ bidhist (tải 2026-11-20T08:31:02Z, 928 gói máy phát cung cấp, 432 NCC); bidhist KHÔNG đưa vào repo.
- Số lượt: gốc 1093, PR 1093. Lượt lỗi: 0 cả hai.
- Thời gian: gốc 2322 s, PR 2666 s.

## Lệnh đã chạy (từ thư mục `wt-a`, script lấy từ nhánh PR)

```
NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs ../wt-goc ../wt-goc/suppliers/cn gop-goc.json --save-bidhist bidhist.json
NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs ../wt-a ../wt-a/suppliers/cn gop-a.json --bidhist bidhist.json
gzip -9 gop-goc.json gop-a.json
```

Lần chạy đầu bị cắt do giới hạn thời gian nền ở lượt PR; chạy lại lượt PR với cùng bidhist.

## Tệp

- `gop-goc.json.gz`, `gop-a.json.gz`: theo khoá `<số thông báo>#<chỉ số cỡ>` → `top` (khoá dòng), `topScore`, `all` (khoá dòng + điểm), `dropped`, `rowflag`.
- Chỉ chứa số thông báo, khoá dòng, điểm.
