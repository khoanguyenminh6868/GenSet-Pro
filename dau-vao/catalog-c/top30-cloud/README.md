# Đo top 30 Gợi ý cấu hình trên cloud — catalog-c1 (PR #959), không PR đo

Công cụ: `suppliers/do-gop.mjs` của `origin/main` 79e9b1750234f70d6aa6d4061dfcdbc85c5e27cb cho cả hai lượt; `NODE_USE_ENV_PROXY=1`; code + `<cn>` = `suppliers/cn` của worktree từng commit.
Cùng MỘT bản bidhist, tải lúc **2026-11-20T01:26:32.436Z** (1556 doc, KHÔNG commit, lưu ngoài repo). Hai lượt chạy song song (lượt nhánh bắt đầu sau khi bidhist đã lưu).

Lệnh (`$S` = thư mục tạm):
```
NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs $S/wt-goc   $S/wt-goc/suppliers/cn   $S/ext/gop-goc.json   --save-bidhist $S/ext/bidhist.json
NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs $S/wt-nhanh $S/wt-nhanh/suppliers/cn $S/ext/gop-nhanh.json  --bidhist $S/ext/bidhist.json
```
(`wt-goc` = `origin/main` 79e9b1750234f70d6aa6d4061dfcdbc85c5e27cb; `wt-nhanh` = đầu PR #959 (`git fetch origin pull/959/head`) 9e2329163c4317cfbe12c512f847dd72182475b3; cả hai SHA đã kiểm đúng. Cả hai lượt chạy từ `wt-goc` nên dùng `do-gop.mjs` của main.) Tệp `.json.gz` là kết quả gzip; `.gz.meta.json` là meta của lượt.

| | commit | gói | NCC | lượt | lượt lỗi | giây |
|---|---|---|---|---|---|---|
| gốc | 79e9b1750234f70d6aa6d4061dfcdbc85c5e27cb | 928 | 432 | 1093 | 0 | 2426 |
| nhánh | 9e2329163c4317cfbe12c512f847dd72182475b3 | 928 | 432 | 1093 | 0 | 2409 |

Không lượt nào lỗi.

## So sánh gốc ↔ nhánh (1093 lượt)
Giống hệt = top + topScore theo mảng, `all` theo đa tập (khoá@điểm), dropped, rowflag. Mỗi lượt vào đúng một nhóm theo thứ tự: top đổi → chỉ `all` đổi → chỉ dropped/rowflag đổi → giống hệt.

| giống hệt | top đổi | chỉ `all` đổi | chỉ dropped/rowflag đổi | lỗi |
|---|---|---|---|---|
| 1093 | 0 | 0 | 0 | 0 |

Không có lượt khác: không khoá rời / vào `all`, không khoá đổi điểm, không khoá ra / vào top, dropped và rowflag y hệt. Khớp kỳ vọng (PR chỉ thêm loại bản ghi mà Gợi ý chưa đọc).

sha256 (giải nén): gốc `f699248e51fc0d8047de597435f506d4f9156077ef13fb63c6f333832209ded4`, nhánh `f699248e51fc0d8047de597435f506d4f9156077ef13fb63c6f333832209ded4` (trùng nhau từng byte).
