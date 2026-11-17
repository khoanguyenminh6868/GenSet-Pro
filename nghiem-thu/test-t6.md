# Nghiệm thu T6: test PowerShell của bot (Pester)

PR nháp: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/656 (nhánh `test-t6-bot-ps`, KHÔNG tự merge).

## Tệp đã đổi
Chỉ thêm tệp mới, **không sửa script nào của bot**, không có gì cần chép sang `genbid-hsmt\` hay restart task.
- `bot/test/TestHelpers.ps1` — nạp hàm bằng AST (không sửa script), đồng hồ giả, hàm khẳng định tự viết, bản chép `GenBid-Bot.ps1` đổi tên mutex.
- `bot/test/GenBid-Bot.Functions.Tests.ps1` (46 ca), `GenBid-Bot.Loop.Tests.ps1` (49), `Get-GenBidBidderTargets.Tests.ps1` (26),
  `Merge-GenBidFeed.Tests.ps1` (14), `Publish-GenBidHsmt.Tests.ps1` (27), `Send-GenBidIngest.Tests.ps1` (12), `GenBid-HSMT.Tests.ps1` (4).
  Tổng 178 ca, 4 ca `-Skip` có lý do (mục "Lỗi tìm thấy").
- `.github/workflows/test-bot-ps.yml` — hai job: `bot-ps` (ubuntu, pwsh 7, Pester 5.7.1) và `bot-ps-win` (windows-latest, Windows PowerShell 5.1, cùng Pester).

## Cách làm (để người sau cập nhật)
- Script của bot là script chạy thẳng: hàm nạp bằng `[Parser]::ParseFile` + `FindAll(FunctionDefinitionAst)`; `$script:` đổi thành `$global:` trong bản nạp
  để ca test đặt/đọc được trạng thái (đđổi chỉ ở bản nạp trong bộ nhớ). Script chạy trọn thì chạy bằng `& script` với lệnh ngoài thay bằng
  hàm giả ở phạm vi global (`powershell`, `gh`, `Invoke-WebRequest`, `Invoke-RestMethod`, `Start-Process`, `Get-Date`).
- `GenBid-Bot.ps1` chạy trọn MỘT vòng (`-Once -GatherSeconds 0`) từ **bản chép** đổi tên mutex (bot thật giữ `Global\GenBidBot`, nên trên máy Khoa
  chạy trực tiếp sẽ thoát ngay). Không tiến trình con nào được khởi động thật (`Start-Process` giả chỉ ghi tham số).
- Mọi tệp `.genbid-*`, `.anthropic-*`, `.hsmt-worker-*` nằm trong `TestDrive`. Không mạng, không `claude`, không `node`.
- Khẳng định tự viết (`Assert-Eq`…) thay cho `Should`: cú pháp `Should -Be` (Pester 4+/5) và `Should Be` (Pester 3.4 trên máy bot) loại trừ nhau.
  Bộ test chạy được trên Pester 3.4 + PowerShell 5.1 (đã chạy trên máy này: 174 đạt, 4 bỏ qua, ~36 s), và Pester 5.7.1 trên CI.
- Tệp test lưu UTF-8 **có BOM** (PowerShell 5.1 đọc tệp không BOM như ANSI, hỏng tiếng Việt).
- pwsh 7 đổi chuỗi ISO trong JSON thành DateTime → `TestHelpers.ps1` đặt `$PSDefaultParameterValues['ConvertFrom-Json:DateKind']='String'`
  khi cmdlet có tham số đó (7.5+), để chạy như 5.1.

## Hàm phủ
- **GenBid-Bot.ps1** (29 hàm): phủ `Log`, `Stamp`, `Read-Json`, `Get-Pending` (nhịp tim beat=0: lần đầu, <55 s, đúng 55 s, đổi `running`, `-BeatOnly`),
  `Get-Requests` (7 loại chữ ký, requestedAt mới = chữ ký mới, `.hsmt-worker-state` done), `Key-Of`, `Test-ClaudeLogin`, `Get-ApiBudget`, `Add-ApiSpend`,
  `Set-ClaudeAuth` (api / plan, ngưỡng 90 mặc định, `switchAtUsd` 98, dòng `exhausted`, kỳ làm mới ngày 2 + biên trước/sau ngày 2, dòng sổ hỏng), `Clear-ClaudeAuth`,
  `Test-WorkerRunning`, `Read-Pause`, `Wait-Worker` (hết hạn mức → tạm dừng tới giờ làm mới / +30 phút, 12am/12pm, ngày mai; API hết tiền ghi `exhausted`; khoá API sai;
  quá hạn chờ; xoá khoá worker chỉ ở lane browser), `Send-Unanswered`, `Get-PendingRetry`, `Invoke-Job` (-Resume khi lượt con chết, lane config không repo),
  `Start-Lane`, `Get-Lanes` (tiến trình sống/chết/pid tái dùng, tệp lượt hỏng, lượt dở bản cũ → đúng nhóm), vòng quét (lịch 10:10/14:10/18:10 mọi ngày kể cả T7/CN,
  bù mốc gần nhất khi máy tắt, mỗi mốc một lần, browser một lượt, ai không giới hạn, config một lượt, Lấy tệp trước Sync, Phân tích chờ Lấy tệp cùng gói,
  chữ ký đã giao không giao lại/không quên/dọn khỏi trạng thái, tạm dừng chỉ chặn lane ai và trả lời web bằng lý do, thiếu token chỉ ghi log).
- **Get-GenBidBidderTargets.ps1**: chọn theo giai đoạn (Đã nộp/Trúng/Bỏ qua/Chuẩn bị/Đang xem/Mới; loại Không trúng, Đã hủy, dự án, xoá, đã có kết quả), `joined`,
  ngưỡng 30 phút sau đóng thầu, `-Days` 180, kiểm lại 6 giờ (đóng ≤ 7 ngày) / 24 giờ, `checkedAt` trước đóng+30 phút không tính, ngày đóng của portalids,
  `tracked.tender` có notifyVersion mới hơn, sắp xếp + `-Max`, bcdg (MST 4101623015 kể cả viết có dấu chấm, thử lại 1 giờ/6 giờ, giveUp, `-BcdgMax`).
- **Merge-GenBidFeed.ps1**: `Sig` khớp 3 giá trị của `bot/test/sync-rules.test.mjs` (gói thường, đã huỷ, thiếu trường), lớp bọc `{data,version}`, thứ tự; chế độ Merge (mã 0/2,
  thay tại chỗ, mới nối cuối, gói đóng bị bỏ, `fetchedAt` ISO).
- **Publish-GenBidHsmt.ps1**: `Get-FileText` (ngưỡng trang scan 30% đúng biên, dưới 5 trang không xét, trang trống < 60 ký tự, hỏng font > 5% và chỉ khi > 2000 ký tự,
  tiếng Việt NFD và tiếng Nga không bị coi là hỏng, .txt, .docx, .docx hỏng, đuôi lạ), `Split-Utf8`, `Merge-Doc`, `Now-Iso`; chạy trọn với `gh` giả (`-NoCommit`):
  `release.json`, tên asset 01.pdf…, bỏ `manifest.csv` + tệp ẩn, `-MaxMB`, `error.txt`, `-NoInbox`.
- **Send-GenBidIngest.ps1**: chạy trọn (token Bearer không in ra, version + SHA, nội dung y hệt không gửi lại, bỏ lớp bọc, analysis chưa `done`, `-DryRun`, 401, lỗi khác, lô 200).
- **GenBid-HSMT.ps1** (phần thuần): `Get-SafeName`, `Read-List`, tham số mặc định.

## Chưa phủ và vì sao
- `GenBid-Bot.ps1`: `Find-Claude`, `Find-Node`, `Start-Run`, `Invoke-Script`, `Invoke-Node`, `Invoke-Node-File`, `Invoke-Worker`, `Invoke-Agent` (bật `node`/`claude` thật hoặc đọc đĩa máy),
  `Update-Repo` (git thật), nhánh `-Job` lane browser/ai không `-Resume` (chạy node thật). `Get-Lanes` nhánh mã thoát 4 → `ConfigWait` 2 phút (cần tiến trình do chính vòng quét khởi động,
  một vòng `-Once` không có); đoạn `Invoke-Config` sau khi có repo (cần `config-bot.mjs`).
- `Publish-GenBidHsmt.ps1`: nhánh không `-NoCommit` (git push, ghi thẳng lên web qua `Post-GenBidDocs.ps1`, chờ GitHub Action, `-QueueAnalysis`).
- `GenBid-HSMT.ps1`: `Test-Agent`, `Find-AgentExe`, `Start-Agent`, `Save-File`, `Invoke-Batch` (cổng 1234 / registry / tải thật).
- Các script khác (`Get-GenBidRequests.ps1`, `Post-GenBidDocs.ps1`, `Render-GenBidScan.ps1`, `Get-GenBidScratch.ps1`, `Test-GenBidBotGit.ps1`, `Backup/Install`): ngoài phạm vi giao.
- Lệnh cụ thể của PowerShell 5.1 trên Windows (Start-Process thật, mutex `Global\`) không chạy trong CI; job `bot-ps-win` chạy 5.1 thật nhưng vẫn với hàm giả.
- Tệp có dấu chấm đầu tên (`.hsmt-worker.lock`) là tệp ẩn với PowerShell trên Linux: `Test-WorkerRunning` dùng `Get-Item` không `-Force` nên không đọc được ở đó
  (không ảnh hưởng Windows). Ca khoá worker của vòng quét chỉ chạy trên Windows; ca ở `GenBid-Bot.Functions.Tests.ps1` dùng tên khoá không dấu chấm.

## Lỗi tìm thấy (CHƯA sửa; ca `-Skip` có lý do)
1. **`Merge-GenBidFeed.ps1`: `-Present` không có tác dụng.** `$present = @(…)` ghi đè tham số `[string]$Present` (PowerShell không phân biệt hoa thường), mảng bị ép lại thành chuỗi
   `"A C"`, `$present -contains $t.notifyNo` luôn sai. Hậu quả: gói còn trong kết quả tìm kiếm nhưng đã đóng thầu bị bỏ khỏi feed, vì chỉ còn xét ngày đóng. Đã chạy tay trên 5.1:
   `-Present 'A,C'` với C đã đóng → C bị bỏ. Cách sửa: đổi tên biến thành `$presentList`. Chưa đo số gói bị ảnh hưởng (cần biết bot còn gọi script này không: `sync-pure.js` có `feedMerge` riêng).
   Ca: `Merge-GenBidFeed.Tests.ps1` "gói còn trong kết quả tìm kiếm (-Present) được giữ…" (`-Skip`).
2. **`Publish-GenBidHsmt.ps1` `Get-FileText`: không bắt chữ hỏng font kiểu "3456ÿ89ÿ"** (ÿ sau NFD = y + dấu kết hợp U+0308, nằm trong dải được phép) — cùng gốc với lỗi #8 `garbled()` của `ocr-pdf.js`.
   Đã chạy: 400 lần "3456ÿ89ÿ " cho ra nguyên văn thay vì rỗng. Chưa đo trên gói thật. Ca `-Skip`.
3. **`Merge-GenBidFeed.ps1` `Sig` lệch bản JS khi gói thiếu trường `isInternet`**: JS ghi `"undefined"`, PS ghi chuỗi rỗng → chữ ký khác (Merge dùng để quyết gói "đổi"). Chưa tìm thấy gói thật thiếu trường này; ca `-Skip`.
4. **pwsh 7 (không phải bot): `ConvertFrom-Json` đổi chuỗi ISO thành DateTime** → `Sig` và chữ ký yêu cầu (`files:K|<ngày>`) khác bản 5.1; nếu một ngày bot chạy `pwsh` thay `powershell.exe` thì chữ ký
   `KNOWN` của Sync lệch toàn bộ feed. Bot hiện chạy `powershell.exe` 5.1 nên không gây hại. Ca khoá hành vi chỉ chạy trên pwsh < 7.5.
5. (Ghi nhận, không phải lỗi) `Merge-GenBidFeed.ps1`: gói không có `bidCloseDate` và không có trong `-Present` bị coi như đã đóng và bỏ khỏi feed (ca khoá hành vi).

## Kết quả chạy
- Máy này (Windows PowerShell 5.1, Pester 3.4.0): 174 đạt, 0 hỏng, 4 bỏ qua, ~36 s cả bộ (mỗi tệp 2–9 s; vượt 5 giây/tệp do khởi động PowerShell 5.1 và Pester, mỗi ca vòng quét chạy trọn một script).
- CI (PR #656): `bot-ps` (ubuntu, pwsh 7.6.9, Pester 5.7.1) xanh ~21 s; `bot-ps-win` (Windows PowerShell 5.1, Pester 5.7.1) xanh ~2,5 phút; các job cũ (app, bot, server, suppliers) vẫn xanh.
  Bài học khi chuyển lên pwsh/Linux: tên ca không được có cặp `<...>` (Pester 5+ coi là mẫu thay thế), tệp tên bắt đầu bằng dấu chấm là tệp ẩn, đường dẫn ghép bằng `\` thành tên tệp.

## Rủi ro và quay lui
Chỉ thêm test; gỡ bằng revert PR. Rủi ro: test đọc chuỗi tiếng Việt của log/lý do trong script (`'Lượt chạy bị dừng giữa chừng'`, `'API báo hết tiền'`…) nên đổi câu chữ ở script sẽ làm đỏ ca (cố ý: các câu đó là
thứ web hiển thị cho Khoa). `New-BotCopy` kiểm `Global\GenBidBot` còn trong script, nếu đổi tên mutex thì test báo rõ.

## Cần ghi nhớ
- Khoa/điều phối quyết: sửa lỗi 1 (đổi tên biến, 1 dòng) và lỗi 2 (cùng lúc với #8) hay không; nếu sửa là thay đổi bot → Backup + restart task.
- Máy bot có Pester 3.4.0: chạy `Invoke-Pester -Script bot\test` trong worktree (không cài gì thêm).
