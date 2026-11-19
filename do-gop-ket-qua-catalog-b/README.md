# Đo top 30 Gợi ý cấu hình trên cloud — catalog-b (không PR)

Công cụ: `suppliers/do-gop.mjs` (giống hệt ở hai commit); `NODE_USE_ENV_PROXY=1`; code + `cn` = `suppliers/cn` của worktree từng commit.
Cùng MỘT bản bidhist, tải lúc **2026-11-19T16:32:36Z** (1556 doc, KHÔNG commit, lưu ngoài repo). Container 4 CPU / 16 GB, hai lượt chạy song song.
SHA đầu nhánh `catalog-b` đúng `306219467073ee8eccb9919033fa28b5cea19fb1` như yêu cầu.

Lệnh (`$S` = thư mục tạm):
```
NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs $S/wt-goc   $S/wt-goc/suppliers/cn   $S/ext/gop-goc.json   --save-bidhist $S/ext/bidhist.json
NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs $S/wt-nhanh $S/wt-nhanh/suppliers/cn $S/ext/gop-nhanh.json  --bidhist $S/ext/bidhist.json
```
(`.meta.json` đổi tên thành `<tệp>.gz.meta.json` cho khớp tệp nén.)

| | commit | gói | NCC | lượt | lượt lỗi | giây |
|---|---|---|---|---|---|---|
| gốc (main) | a89b88be039d1e03e831f1b972d696ff96b100f6 | 928 | 432 | 1093 | 0 | 2175 |
| nhánh (catalog-b, đầu PR #948) | 306219467073ee8eccb9919033fa28b5cea19fb1 | 928 | 432 | 1093 | 0 | 2216 |

Không lượt nào lỗi.

## So sánh gốc ↔ nhánh (1093 lượt)
Giống hệt = top + topScore theo mảng, `all` theo đa tập (khoá@điểm), dropped, rowflag. Mỗi lượt vào đúng một nhóm theo thứ tự: top đổi → chỉ `all` đổi → chỉ dropped/rowflag đổi → giống hệt.

| giống hệt | top đổi | chỉ `all` đổi | chỉ dropped/rowflag đổi | lỗi |
|---|---|---|---|---|
| 368 | 146 | 575 | 4 | 0 |

(Số "blocked" ở stderr: gốc 22, nhánh 17.)
sha256 (giải nén): gốc `36411ea1860e817c3cda9756288ed134690459c27401990d5fa8c3e5c7b11ae1`, nhánh `bc2913e85fda017ebf75bf57a45fac968f059d44ddb0c6a0e5f7937d72670030`.
