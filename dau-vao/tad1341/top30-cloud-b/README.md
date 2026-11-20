# Đo top 30 gợi ý cấu hình — PR #1006

- Gốc (merge-base origin/main, pr1006): e7ea34f84c64dadd5e497de37861e61f3f7d41ff
- PR #1006 head: 1e86f7dfc09b6f738c069b6e7559d6b20d70f175
- Bộ bidhist chung tải lúc 2026-11-20T12:09:21Z (1556 doc), 928 gói, 435 NCC, 1093 lượt (cả hai lần)
- Lệnh (chạy trong thư mục chứa wt-goc, wt-a):
  - NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs wt-goc wt-goc/suppliers/cn gop-goc.json --save-bidhist bidhist.json  (2613 s)
  - NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs wt-a wt-a/suppliers/cn gop-a.json --bidhist bidhist.json  (2768 s)
  - (do-gop.mjs lấy từ checkout main, cùng một bản cho cả hai lần)
- Lỗi: xem số lượt lỗi trong meta (luotLoi): gốc/PR = 0/0
- Không đưa bidhist/chữ HSMT vào nhánh này.
