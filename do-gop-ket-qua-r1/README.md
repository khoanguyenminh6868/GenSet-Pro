# Đo top 30 Gợi ý cấu hình — vòng r1 (chỉ đo, không PR)

- GỐC: `d8db6166fe0628575d76a08ab092eb015476c475` (main)
- NHÁNH: `82587105843d93a299855038a2b0cb6126512e25` (`catalog-bang-r1`, PR #941)
- Script: `suppliers/do-gop.mjs` của `origin/main` (cả hai commit chưa có tệp này) dùng cho cả hai lượt; `<thư mục code>` = `<thư mục cn>`/.. = worktree của từng commit.
- bidhist tải MỘT lần lúc `2026-11-19T08:36:00.361Z` (1556 doc, lưu ngoài repo, không commit); lượt gốc `--save-bidhist`, lượt nhánh `--bidhist`.

| | gốc | nhánh |
|---|---|---|
| gói | 928 | 928 |
| NCC | 432 | 432 |
| lượt | 1093 | 1093 |
| lượt lỗi | 0 | 0 |
| thời gian | 1908 s (script: 1878 s) | 1887 s (script: 1887 s) |
| RAM đỉnh (RUSAGE_CHILDREN) | 2694 MB | 2468 MB |

Hai lượt chạy song song (nhánh khởi động ~1,5 phút sau gốc).

sha256 tệp giải nén:
- `gop-goc.json`: `db7c92148ecff85e74a459546ee197ddcd49f178467e9a858892da13c6dbc73c`
- `gop-nhanh.json`: `fc2086ff8ad218af46f465655c5e3ba1503c1eaab13f43f859c1d7a4df605339`

Định dạng: `{ "<số thông báo>#<chỉ số>": { top, topScore, all: [[khoá dòng NCC, điểm]…], dropped, rowflag } }`.

## So nhanh (không thay cho việc soát của phiên khác)
So `top` + `topScore` theo mảng; `all` theo đa tập khoá→điểm (sắp xếp, không so mảng bằng `!==`); thêm `dropped` và `rowflag`.

- Tổng lượt: 1093 (không lượt nào thiếu ở một bên)
- Giống hệt: **148**
- Lượt top đổi (top hoặc topScore khác): **209**
- Lượt chỉ `all` đổi (top giống): **718**
- Lượt chỉ `dropped`/`rowflag` đổi: **18**
- Lượt lỗi: **0** (cả hai bên)
