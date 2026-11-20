# Đo top 30 gợi ý cấu hình — PR #1005

- Gốc (merge-base origin/main, pr1005): e7ea34f84c64dadd5e497de37861e61f3f7d41ff
- SHA PR #1005: 0507f7d7d44a3531871dd4973d5e4ae5afd3ab91
- bidhist: cùng một bản tải lúc 2026-11-20T12:06:41Z (1556 doc), 928 gói, 435 NCC (không commit)
- Số lượt: gốc 1093 (1805 s), PR 1093 (1832 s); lượt lỗi: 0 ở cả hai
- Lệnh:
  - `NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs wt-goc wt-goc/suppliers/cn gop-goc.json --save-bidhist bidhist.json`
  - `NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs wt-a wt-a/suppliers/cn gop-a.json --bidhist bidhist.json`
- Giải nén: `gunzip` hai tệp `.json.gz`. Chưa phân tích khác biệt.
