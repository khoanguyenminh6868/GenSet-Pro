# Đo top 30 Gợi ý cấu hình trên cloud — so-dong-dung-tich (không PR)

Công cụ: `suppliers/do-gop.mjs` của `origin/main` (a89b88be) cho cả hai lượt; `NODE_USE_ENV_PROXY=1`; code + `<cn>` = `suppliers/cn` của worktree từng commit.
Cùng MỘT bản bidhist, tải lúc **2026-11-19T16:52:03Z** (1556 doc, KHÔNG commit, lưu ngoài repo). Container 4 CPU / 16 GB, hai lượt chạy song song.
Đầu nhánh `so-dong-dung-tich` đúng `93f4586c` (khớp yêu cầu).

Lệnh (`$S` = thư mục tạm):
```
NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs $S/wt-goc   $S/wt-goc/suppliers/cn   $S/ext/gop-goc.json   --save-bidhist $S/ext/bidhist.json
NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs $S/wt-nhanh $S/wt-nhanh/suppliers/cn $S/ext/gop-nhanh.json  --bidhist $S/ext/bidhist.json
```
(cả hai dùng tệp `do-gop.mjs` của worktree gốc; tệp `.meta.json` đặt tên theo tệp `.gz`.)

| | commit | gói | NCC | lượt | lượt lỗi | giây |
|---|---|---|---|---|---|---|
| gốc | a89b88be039d1e03e831f1b972d696ff96b100f6 | 928 | 432 | 1093 | 0 | 1737 |
| nhánh | 93f4586cfddf7c3248ccfad5f59eac731e5fd67c | 928 | 432 | 1093 | 0 | 1781 |

Không lượt nào lỗi.

## So sánh gốc ↔ nhánh (1093 lượt)
Mỗi lượt xếp vào đúng một nhóm theo thứ tự: top/topScore đổi → chỉ `all` đổi (đa tập khoá@điểm) → chỉ dropped/rowflag đổi → giống hệt.

| giống hệt | top đổi | chỉ `all` đổi | chỉ dropped/rowflag đổi | lỗi |
|---|---|---|---|---|
| 952 | 127 | 14 | 0 | 0 |

sha256 (giải nén): gốc `36411ea1860e817c3cda9756288ed134690459c27401990d5fa8c3e5c7b11ae1`, nhánh `4f6d85056fe7f1f7eb10cc7f9b0cd216e204d437f5ce3064d30ff04fc621fb8e`.
(Lưu ý: sha256 lượt gốc này trùng sha256 lượt "nhánh" của đo catalog-a3, tức a89b88be cho ra cùng kết quả với nhánh đó.)
