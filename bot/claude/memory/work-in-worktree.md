---
name: work-in-worktree
description: "Sửa code GenSet-Pro trong worktree riêng (wt-*), không đổi nhánh ở checkout chính vì bot chạy từ đó"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 0f7f83b0-9fa4-4d90-8a6e-6bea54a5f19d
  modified: 2026-11-11T11:13:19.872Z
---

Mọi thay đổi code làm trong worktree riêng: `git -C "C:\Projects\GenSet Pro\GenSet-Pro" worktree add ../wt-<tên> -b <nhánh> origin/main`. Checkout chính `C:\Projects\GenSet Pro\GenSet-Pro` luôn để ở `main`.

**Why:** checkout chính là `-RepoDir` của GenBid-Bot.ps1: bot tự `fetch` + `merge --ff-only --autostash origin/main` ở đó rồi chạy `suppliers/config-bot.mjs`, `bidprice-bot.mjs` từ đó. Đổi nhánh hoặc để tệp sửa dở ở đó thì bot chạy code dở hoặc không cập nhật được (10/11/2026 lỡ làm PR #470 trên checkout chính, may không có lượt bot nào chạy).

**How to apply:** Khoa dặn (11/11/2026): sau khi tạo PR và PR đã merge thì tự xoá luôn worktree + thư mục wt-* của chính mình, không cần hỏi (`git worktree remove --force` rồi `rm -rf`; còn sót thư mục bị khoá thì để đó). CHỈ xoá worktree mình tạo; khi dọn hàng loạt wt-* phải kiểm tra từng cái ngay trước lúc xoá (nhánh đã merge, không có thay đổi chưa commit, không phải của phiên đang chạy). 11/11 lỡ xoá wt-ds-ocr của phiên OCR đang chạy vì nó được tạo sau lúc kiểm tra. Thử UI cục bộ thì trỏ server thử vào `<worktree>/web`. Liên quan [[pull-latest-main-first]], [[bot-restart-after-update]].
