---
name: pull-latest-main-first
description: "Đầu mỗi phiên GenSet-Pro: lấy latest main về trước khi làm gì (Khoa, 2026-11-02)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 6fa5a3fd-d652-4e83-8fc0-67f86dc39a60
  modified: 2026-11-01T19:39:38.885Z
---

Trước khi bắt đầu bất kỳ việc gì trong GenSet-Pro, lấy main mới nhất trên GitHub (origin = github.com/khoanguyenminh6868/GenSet-Pro), không dựa vào bản main cục bộ: `git fetch origin main` rồi `git pull --ff-only origin main` ở `C:\Projects\GenSet Pro\GenSet-Pro`, và tạo nhánh/worktree mới từ `origin/main`.

**Why:** 2026-11-02 checkout main đang chậm 8 commit so với origin (bot và các PR tự merge đẩy lên liên tục), Khoa dặn luôn lấy bản mới nhất trước.

**How to apply:** Thư mục main thường có file `suppliers/` chưa commit do bot sửa: không stash/xoá chúng; `--ff-only` vẫn chạy được nếu không đụng file. Nếu pull báo xung đột thì làm trong worktree mới từ `origin/main` và báo Khoa. Xem thêm [[session-log]], [[merge-prs-without-asking]].
