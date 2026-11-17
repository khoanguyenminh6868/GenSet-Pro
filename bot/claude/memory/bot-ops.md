---
name: bot-ops
description: "Bot Windows GenBid: chạy từ genbid-hsmt/, bản sao trong git ở bot/; sửa xong phải Backup + PR và restart task; nơi thử; trả bằng API key"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 712171b8-1398-4e8a-b507-1e2692a83bce
  modified: 2026-11-17T14:30:31.070Z
---

Bot chạy từ `C:\Projects\GenSet Pro\genbid-hsmt\` (KHÔNG chạy từ repo); bản sao trong git ở `bot/` trên main (`bot/genbid-hsmt/`, `bot/claude/` skills + bộ nhớ này, `bot/windows-tasks/`, `Install-GenBidBot.ps1`, `Backup-GenBidBot.ps1`).

**Khoa (04/11/2026):** mọi logic bot phải nằm trên GitHub, máy hư thì clone về chạy tiếp.

**How to apply:**
- Sửa tệp trong `genbid-hsmt/` (hoặc skill/tác vụ Windows của bot) → cuối việc chạy `powershell -File bot\Backup-GenBidBot.ps1` trong một worktree từ origin/main, commit + PR + merge ([[git-workflow]]). Stop hook `Test-GenBidBotGit.ps1` chặn kết thúc lượt khi máy khác `bot/` trên origin/main. Tác vụ Windows mới → thêm vào Install-GenBidBot.ps1. Không đưa token/khoá (`.genbid-ingest-token`, `.claude-bot-token`, `.firecrawl-key`, `.anthropic-api-key`) hay `.genbid-*.json` vào git.
- **Restart sau khi sửa `GenBid-Bot.ps1`:** task "GenBid Bot" nạp vòng điều phối MỘT lần → dừng tiến trình bot (kiểm không có lượt đang chạy) rồi chạy lại. **Chỉ bật / tắt bot qua tác vụ (Khoa 17/11/2026):** dùng `bot\Update-GenBidBot.ps1` (dừng tác vụ, bật lại, chờ log "Bot GenBid bắt đầu"). KHÔNG bật bằng `Start-Process` / chạy tay `GenBid-Bot.ps1`: 17/11 Claude bật bot ngoài tác vụ, Khoa End tác vụ tưởng đã tắt nhưng bot vẫn nhận việc và chặn sandbox. Tác vụ chạy `conhost.exe --headless powershell.exe ... GenBid-Bot.ps1` (bot tự sửa tác vụ kiểu cũ lúc khởi động); kiểu cũ gọi thẳng powershell.exe từng treo khi Start-ScheduledTask từ phiên Claude (0,016 s CPU, không dòng log). End tác vụ chỉ tắt conhost: bot thấy conhost mất thì tự thoát (≤ 15 s); lượt con chạy chung console ẩn (`-NoNewWindow`), không nháy cửa sổ, sống tiếp khi bot thoát. Không thấy log "bắt đầu" sau 45 s → báo Khoa. Tác vụ tạo bằng quyền admin thì Claude sửa bị "Access is denied": Khoa chạy `powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Projects\GenSet Pro\GenSet-Pro\bot\Repair-GenBidBotTask.ps1"` (tự hiện UAC; KHOAMINIPC đã sửa 17/11, KayenGram chưa). Khoa tắt / bật bot bằng skill `/tat-bot` `/bat-bot` (chỉ tác vụ "GenBid Bot"; "GenBid DieuPhoi Sync" để riêng, đã chạy ẩn). Không restart thì yêu cầu bị bỏ qua im lặng. `genbid-sync.js`, `config-bot.mjs`, `bidprice-bot.mjs` chạy tiến trình mới mỗi lượt → không cần restart, nhưng tiến trình `config-bot.mjs run` đang chạy giữ code cũ tới khi thoát. Yêu cầu "chưa xong" → so CreationDate tiến trình với LastWriteTime script.
- **Thử script bot ở `C:\Projects\GenSet Pro\genbid-test\`, không đặt tệp lạ trong `genbid-hsmt\`:** Stop hook chạy cả trong `claude -p` của bot → Claude trả chữ không phải JSON, lượt bot lỗi. Thử bot cục bộ: chép script, đổi tên mutex `Global\GenBidBot`, chạy với `-Root/-RepoDir/-Endpoint` trỏ vào web giả.
- Máy mới / "setup bot trên máy khác" → skill `genbid-setup` (`bot/SETUP-CLAUDE.md`).

**Kiến trúc (03/11):** `GenBid-Bot.ps1` chỉ điều phối, mỗi lượt là tiến trình con `-Job <tệp>` (`.genbid-bot-jobs\`). 3 nhóm: browser (Lấy tệp/Sync/lịch, một lượt), ai (không giới hạn — Khoa), config (một `config-bot.mjs run` cho mọi gói, đọc hàng chờ mỗi 20 s; chạy cả Tìm NCC, Tìm Thông Số, giá đấu). Bot lấy yêu cầu từ Vercel `/api/requests`; nhịp tim ~60 s, web báo máy tắt sau 3 phút.

**Đọc tệp (genbid-sync.js):** Tesseract + tessdata_best ở `.genbid-tessdata-best`; `tar.exe` hỏng với đường dẫn tiếng Việt (chép sang tên không dấu), RAR dùng UnRAR.exe; .doc qua Word COM lưu format 2 + UTF-8. VNeGP Agent hay treo → khởi động lại Agent; khởi động lại lượt specs phải tắt cả Chrome hồ sơ `.genbid-browser-spec`. Chữ ký `sig` của feed phải khớp ở search-extract.js, genbid-sync.js, Merge-GenBidFeed.ps1.

**Trả bằng API key (Khoa 11–12/11):** có tệp `C:\Projects\GenSet Pro\.anthropic-api-key` thì các lượt Claude của bot dùng API; hạn mức 100 USD/tháng, làm mới ngày 2; sổ `.anthropic-api-spend.jsonl`, cấu hình `.anthropic-api-budget.json` (tiêu tới `switchAtUsd` — Khoa đặt 98 USD ngày 12/11 — hoặc API báo hết tiền → tự về gói tháng tới kỳ sau).
- **Sổ chi ghi dần (13/11, PR #684):** Khoa muốn số tiền API cập nhật mỗi khi dùng, không đợi lượt xong. `spendMeter` (sync-pure.js) đọc stream-json, ghi mỗi khi tăng ≥ 0,05 USD, cuối lượt chỉnh về `total_cost_usd`; lượt bị cắt vẫn được tính. Gọi Claude mới thì phải đi qua bộ đếm này (stream-json), đừng chỉ đọc dòng result.
- **Cấu hình hệ thống trên web (13/11):** nút bánh răng trên banner (chỉ Superadmin; nút "+" Chỉ lấy gói mới cũng chỉ Superadmin) → `settings/ai`: Phân tích / Gợi ý cấu hình / Gợi ý giá / Đối chiếu hồ sơ dùng API hay gói tháng, ngưỡng chuyển, số tiền API đã dùng Khoa sửa tay. Bot nhận theo nhịp tim, chép về `.genbid-ai-settings.json`; ngưỡng ở đây thắng `.anthropic-api-budget.json`. Số bot tính hiện ở `botstatus.api`.
- Đừng gọi `Test-GenBidBotGit.ps1` trực tiếp (treo chờ stdin); kiểm bằng `Backup-GenBidBot.ps1 -Check`.
