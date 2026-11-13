---
name: git-workflow
description: "Quy trình git GenSet-Pro: lấy main mới nhất, làm trong worktree wt-*, tự merge PR (squash), tự xoá worktree của mình"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 712171b8-1398-4e8a-b507-1e2692a83bce
  modified: 2026-11-13T00:27:23.922Z
---

Repo: github.com/khoanguyenminh6868/GenSet-Pro, checkout chính `C:\Projects\GenSet Pro\GenSet-Pro`.

1. **Đầu phiên lấy main mới nhất** (Khoa 02/11/2026): `git fetch origin main` + `git pull --ff-only origin main`; nhánh mới luôn từ `origin/main`. Checkout chính thường có tệp `suppliers/` chưa commit do bot sửa: không stash/xoá. Pull xung đột → làm trong worktree mới và báo Khoa.
2. **Sửa code trong worktree riêng**: `git -C "C:\Projects\GenSet Pro\GenSet-Pro" worktree add ../wt-<tên> -b <nhánh> origin/main`. Checkout chính luôn để ở `main`, không có tệp sửa dở.
   **Why:** nó là `-RepoDir` của bot (bot tự `merge --ff-only --autostash origin/main` rồi chạy `suppliers/config-bot.mjs`, `bidprice-bot.mjs` từ đó).
3. **Tự merge PR, không hỏi** (Khoa 22/10/2026: "em tự merge hết toàn bộ PR không cần hỏi anh"): mark ready, squash, auto-merge khi check còn chạy; check đỏ thì sửa trước; rebase lên origin/main ngay trước khi merge (Khoa chạy nhiều phiên song song).
   **Why:** Vercel chỉ deploy từ `main`, Khoa không muốn làm nút cổ chai.
   Ngoại lệ: session con được điều phối giao việc KHÔNG tự merge, xem [[orchestrator-delegate-by-model]].
4. **PR merge xong tự xoá worktree + thư mục wt-* của mình, không hỏi** (Khoa 11/11/2026): `git worktree remove --force` rồi `rm -rf`; thư mục bị khoá (Permission denied) thì để đó. CHỈ xoá worktree mình tạo; dọn hàng loạt phải kiểm từng cái ngay trước lúc xoá (nhánh đã merge, không có thay đổi chưa commit, không phải của phiên đang chạy) — 11/11 đã lỡ xoá worktree của phiên OCR đang chạy. Commit WIP sớm.

Commit dữ liệu suppliers: `-c user.name=khoanguyenminh6868 -c user.email=...`. Sửa bot thì thêm bước ở [[bot-ops]].
