# Đo top 30 Gợi ý cấu hình trên cloud — catalog-a3 (không PR)

Công cụ: `suppliers/do-gop.mjs` của `origin/main` (10525fd) cho cả hai lượt; `NODE_USE_ENV_PROXY=1`; code + `<cn>` = `suppliers/cn` của worktree từng commit (không `npm ci`: `suppliers/` không có package.json).
Cùng MỘT bản bidhist, tải lúc **2026-11-19T12:17:13Z** (1556 doc, KHÔNG commit, lưu ngoài repo). Container 4 CPU / 16 GB. Hai lượt chạy song song.

Lệnh (từ worktree `origin/main`, `$S` = thư mục tạm):
```
NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs $S/wt-goc   $S/wt-goc/suppliers/cn   $S/ext/gop-goc.json   --save-bidhist $S/ext/bidhist.json
NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs $S/wt-nhanh $S/wt-nhanh/suppliers/cn $S/ext/gop-nhanh.json  --bidhist $S/ext/bidhist.json
```

| | commit | gói | NCC | lượt | lượt lỗi | giây |
|---|---|---|---|---|---|---|
| gốc | 671797e4d6c544045d8128934390bf5ae5379834 | 928 | 432 | 1093 | 0 | 2175 |
| nhánh (đầu PR #945, đúng `4600d59d`) | 4600d59dca859a6e1126b3b4a8363bc0e3b53708 | 928 | 432 | 1093 | 0 | 2206 |

Không lượt nào lỗi.

## So sánh gốc ↔ nhánh (1093 lượt)
Giống hệt = top + topScore theo mảng, `all` theo đa tập (khoá@điểm), dropped, rowflag. Mỗi lượt xếp vào đúng một nhóm theo thứ tự: top đổi → chỉ `all` đổi → chỉ dropped/rowflag đổi → giống hệt.

| giống hệt | top đổi | chỉ `all` đổi | chỉ dropped/rowflag đổi | lỗi |
|---|---|---|---|---|
| 286 | 229 | 544 | 34 | 0 |

sha256 (giải nén): gốc `2723b15324aa852aa7a85a9805cd725d47322c723a72022d05fe933e6cb7be0d`, nhánh `36411ea1860e817c3cda9756288ed134690459c27401990d5fa8c3e5c7b11ae1`.
(Trùng sha256 với "nhánh mới" của R1b là bình thường: gốc ở đây chính là phần nền đã gộp PR #941 — chưa kiểm ssâu hơn.)
