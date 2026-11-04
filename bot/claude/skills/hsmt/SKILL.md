---
name: "hsmt"
description: "Chạy một lượt Worker HSMT GenBid trên máy Windows bằng code (genbid-sync.js, không dùng AI): tìm thầu mới trên muasamcong, đọc thông báo mời thầu, tải HSMT lên GitHub Release, lấy nhà thầu và gửi lên bản web Vercel. Dùng khi Khoa nói chạy worker, Sync, lấy tệp, hoặc /hsmt."
---

# Chạy Worker HSMT (một lượt)

Khoa Nguyen approved this job on 2026-10-21. Since 2026-10-26 the round is code: do not do its steps yourself. Never create another cron, loop or scheduled task from this skill.

1. In `C:\Projects\GenSet Pro`, run `node "C:\Projects\GenSet Pro\genbid-hsmt\genbid-sync.js" sync --force` (a few minutes; it opens a small Chromium window). For pending "Lấy tệp" requests only: `... genbid-sync.js files`.
2. The last line of its output starts with `SUMMARY: `. Exit code 4 = another round is running.
3. Tell Khoa in Vietnamese, in a few lines: open tenders, new ones, files fetched, bidders, errors (e.g. "muasamcong yêu cầu xác minh").

Phân tích, Đối chiếu, Tạo bản tiếng Anh and Tạo HSDT tham khảo are answered by the local bot `GenBid-Bot.ps1` (it prepares the data with `genbid-sync.js prep`, calls Claude, posts with `genbid-sync.js finish`). Details: `C:\Projects\GenSet Pro\.hsmt-worker.md`.

## Never

- Bypass or solve muasamcong's reCAPTCHA or any other verification.
- Print, copy or send the token in `.genbid-ingest-token`.
- Put analysis, notes, bid prices or HSDT files into git or onto GitHub.
