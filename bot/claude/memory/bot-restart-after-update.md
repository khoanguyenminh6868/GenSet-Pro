---
name: bot-restart-after-update
description: "GenBid-Bot.ps1 chạy liên tục qua task \"GenBid Bot\" — sửa script xong phải restart task, không thì bot chạy bản cũ"
metadata:
  node_type: memory
  type: project
  originSessionId: f850c40c-af27-4cb3-875b-20575e70daf9
  modified: 2026-11-03T13:57:22.759Z
---

Task Windows "GenBid Bot" chạy `genbid-hsmt\GenBid-Bot.ps1` trong một vòng lặp vô hạn, nạp script một lần lúc khởi động. 2026-11-01: yêu cầu Tìm NCC IB2600581977 kẹt ~1 ngày vì bot chạy từ 29/10 (bản cũ chỉ gọi config-bot.mjs khi có `config`, bỏ qua `find`) dù script đã sửa 31/10.

Từ 03/11 mỗi lượt chạy thành tiến trình con `GenBid-Bot.ps1 -Job` (nạp bản script hiện tại), nhưng vòng điều phối vẫn là bản lúc khởi động → sửa phần điều phối vẫn phải restart. genbid-sync.js, config-bot.mjs, bidprice-bot.mjs chạy tiến trình mới mỗi lượt → không cần.

**Why:** sửa script không có hiệu lực tới khi restart; yêu cầu bị bỏ qua im lặng, không báo lỗi về web.
**How to apply:** sau mỗi lần sửa GenBid-Bot.ps1, chạy `Stop-ScheduledTask 'GenBid Bot'; Start-ScheduledTask 'GenBid Bot'` (kiểm không có lượt worker đang chạy trước). Khi yêu cầu "chưa xong", so CreationDate của tiến trình powershell GenBid-Bot với LastWriteTime của script. Liên quan [[supplier-db]].
