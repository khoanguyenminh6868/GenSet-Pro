# ma-dong-co-trung PR 1: nghiệm thu (TẠM DỪNG 20/11/2026 theo điều phối, chờ "tiếp tục" sau 17:00)

- Đang làm dở: mã PR 1 đã sửa xong trong `wt-ma-dong-co-trung-1` (nhánh `ma-dong-co-trung-1`, gốc origin/main `cf0b0448`), gồm `web/catalog.js` (engineCode), `suppliers/ma-dong-co-trung.test.mjs`, và bẫy mới trong `web/CLAUDE.md`. CHƯA commit, CHƯA push.
- Đã đo xong: `quet-repo-goc` so với `quet-repo-pr1` (C1, C2, D, E, F1 về 0); `doi-khoa-pr1.tsv` (450 dòng đổi khoá) và `khoa-dich-pr1.tsv` (265 khoá đích, 0 lệch, 2 khoá đổi hãng sang FAWDE); cand IB2600603983 giữ nguyên 30 dòng.
- Lệnh nền đang chạy (bbxbhnp9u): spec-diff gate so với git:cf0b0448, quality --check, `node --test suppliers/ web/test/`. Log ghi vào `dau-vao/ma-dong-co-trung/{spec-diff,quality,test}-pr1.log`. CHƯA đọc kết quả.
- Bước kế tiếp: đọc 3 log và sửa nếu có lỗi → commit, push, mở PR DRAFT (ghi base cf0b0448, xếp cuối hàng chờ catalog.js) → viết đầy đủ tệp này → Sync sổ → báo điều phối. Gỡ `wt-mdct-goc` sau khi kiểm `git status`.
