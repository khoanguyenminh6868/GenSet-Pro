# Đo top 30 gợi ý cấu hình, PR #1002

- SHA gốc (merge-base origin/main và pr1002, đã kiểm --is-ancestor): 0d4d99d1cf262ab973032d0a9a71df7a761131ed
- SHA PR #1002: 572b8bdb1dcb80a48494a0e964fb02e3a225598e
- Số lượt: 1093 mỗi bên (928 gói, 432 NCC), lỗi: 0
- Thời gian: gốc 2286 s, PR 2451 s
- bidhist tải 2026-11-20T11:17:26Z (1556 doc), dùng chung cho hai bên (không commit)
- Lệnh (chạy từ checkout repo, worktree ở ngoài):
  - `NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs wt-goc wt-goc/suppliers/cn gop-goc.json --save-bidhist bidhist.json`
  - `NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs wt-a wt-a/suppliers/cn gop-a.json --bidhist bidhist.json`
- Tệp: gop-goc.json.gz, gop-a.json.gz (khoá dòng + top 30 chuỗi cấu hình). Chưa phân tích khác biệt.
