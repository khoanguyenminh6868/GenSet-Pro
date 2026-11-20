# Đo top 30 gợi ý cấu hình — nhánh tad1341-9-36

- SHA gốc (merge-base origin/main với nhánh): 5b50f6f64bc5f8c36a319b32ab2dfb41479a52e1
- SHA đầu nhánh `tad1341-9-36`: 3fea249dc350ded857a8f405e1ed92133f7f18fd
- Bộ bidhist dùng chung: tải 2026-11-20T08:46:38Z (1556 doc), 928 gói, 432 NCC. Không commit bidhist.
- Số lượt: gốc 1093 (lỗi 0, 2490 s), nhánh 1093 (2467 s). Không có lỗi.

Lệnh đã chạy (worktree wt-goc ở SHA gốc, wt-a ở SHA nhánh):

    NODE_USE_ENV_PROXY=1 node wt-goc/suppliers/do-gop.mjs wt-goc wt-goc/suppliers/cn gop-goc.json --save-bidhist <bidhist.json>   (bị ngắt khi worker khởi động lại, chạy lại bằng --bidhist cùng tệp)
    NODE_USE_ENV_PROXY=1 node wt-goc/suppliers/do-gop.mjs wt-goc wt-goc/suppliers/cn gop-goc.json --bidhist <bidhist.json>
    NODE_USE_ENV_PROXY=1 node wt-a/suppliers/do-gop.mjs wt-a wt-a/suppliers/cn gop-a.json --bidhist <bidhist.json>

Ghi chú: do-gop.mjs mỗi bên lấy từ chính worktree của nó. Kết quả chỉ có số thông báo, khoá dòng, điểm.
