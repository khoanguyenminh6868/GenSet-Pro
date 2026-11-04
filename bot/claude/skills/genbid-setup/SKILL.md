---
name: genbid-setup
description: Cài bot GenBid (GenSet-Pro) lên một máy Windows khác hoặc máy mới khi máy cũ hư. Dùng khi Khoa nói "setup bot trên máy khác", "cài lại bot", "chuyển bot sang máy mới", "máy cũ hư".
---

# Cài bot GenBid trên máy khác

Mọi logic của bot nằm trong repo riêng tư `khoanguyenminh6868/GenSet-Pro`, thư mục `bot/` (Khoa, 2026-11-04).

1. Kiểm `git`, `gh` có chưa (`gh auth status`). Chưa có thì bảo Khoa cài `winget install Git.Git GitHub.cli` và tự chạy `gh auth login` (repo riêng tư; em không gõ mật khẩu).
2. Clone: `git clone https://github.com/khoanguyenminh6868/GenSet-Pro.git "C:\Projects\GenSet Pro\GenSet-Pro"` (đã có thì `git -C ... pull --ff-only origin main`).
3. Đọc `C:\Projects\GenSet Pro\GenSet-Pro\bot\SETUP-CLAUDE.md` và làm đúng theo đó: hỏi Khoa các câu ở mục 0 trước (máy cũ còn chạy bot không, đường dẫn, ổ đĩa cũ, token, bật ngay không), rồi cài bằng `bot\Install-GenBidBot.ps1`, rồi kiểm.

Không in hay chép token ra chat/log; không vượt reCAPTCHA muasamcong.
