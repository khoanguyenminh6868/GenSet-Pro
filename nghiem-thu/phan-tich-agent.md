# Nghiệm thu: Phân tích HSMT qua agent — chốt đọc đủ (P4, 12/11)

PR nháp #568 (https://github.com/khoanguyenminh6868/GenSet-Pro/pull/568), nhánh `phan-tich-agent`, worktree `C:\Projects\GenSet Pro\wt-phan-tich-agent` (từ origin/main 1a11335). Không chạy agent thật, không ghi lên web, `genbid-hsmt\` không bị đụng.

## Tệp đổi
- `suppliers/agent-read.mjs` (mới, CLI + hàm): `prep <thư mục>...` — input.md qua `writeForRead` (dùng lại của config-bot.mjs) → `input-N.md` ≤ mức Read + `read-order.json` + mục "Cách đọc" nối vào TASK.md (chạy lại không nhân đôi). `guard --log <log> <thư mục>...` — `readTrace` một lần, mỗi thư mục lọc Read của riêng nó, ghi `read-guard.json` { incomplete, notes[], stopped, error ≤ 300 ký tự }, in dòng `CHỐT ĐỌC <gói>: …` cho log bot. Hàm mới: `taskReadRule`, `prepDir`, `guardDir`, `guardDirs` (không trùng tên hàm có sẵn).
- `suppliers/read-guard.mjs`: `traceUnder(trace, dir)` + `guardTrace(dir, trace, { under })`; `guardRun` giữ nguyên hành vi (gọi guardTrace). Một lượt có nhiều thư mục nên chỉ tính Read có đường dẫn nằm dưới thư mục của gói (không phân biệt `\`/`/`, hoa/thường).
- `bot/genbid-hsmt/GenBid-Bot.ps1` `Invoke-Agent`: có `$RepoDir\suppliers\agent-read.mjs` thì chạy `prep` trước; agent chạy `--output-format stream-json --verbose`; chi phí API lấy từ dòng `"type":"result"` cuối log; sau lượt chạy `guard`. Hàm mới `Invoke-Node-File`. Không có repo → như cũ (stream-json vẫn dùng).
- `bot/genbid-hsmt/genbid-sync.js` `finish`: đọc `read-guard.json`; `incomplete` và có result.json → KHÔNG đăng kết quả, chỉ đăng reqDoc lỗi (≤ 300 ký tự, "… Giữ kết quả cũ."), kết quả cũ trên web giữ nguyên; còn lại `guard.notes` (vd. lượt dừng nhưng đọc đủ) nối vào notes của Phân tích.
- `suppliers/agent-read.test.mjs` (6 test).

Dùng cho mọi loại việc có thư mục AGENT (analysis, compare, hsdt, tlkt, supplier…), vì chung `Invoke-Agent`.

## Lệnh kiểm + đầu ra thật
```
cd wt-phan-tich-agent\suppliers; node --test
→ tests 381, pass 381, fail 0   (main 375 + 6)
```
Cổng khác: `node --check bot/genbid-hsmt/genbid-sync.js` OK; trình phân tích PowerShell: GenBid-Bot.ps1 không lỗi cú pháp. (`node suppliers/verify.mjs` không chạy lại: không đụng dữ liệu NCC.)

Gói mẫu IB2600575567 (bản chép mới của genbid-sync.js ở `genbid-test\`, md5 f738469486d1b8a8a869343fecd2a011 = bản trong PR):
```
node genbid-sync.js prep --sigs "analysis:IB2600575567|t" --out %TEMP%\pa-prep --test --dry   (chỉ GET)
→ DIR …\analysis-IB2600575567 ; SUMMARY: chuẩn bị 1/1 việc ; AGENT = "dữ liệu quá lớn cho một lần gọi" ; input.md 584.670 byte
node suppliers/agent-read.mjs prep <thư mục>
→ analysis-IB2600575567: input-1.md … input-20.md   (ghép các phần = input.md; TASK.md có mục Cách đọc)
```
Giả lập log stream-json đọc 19/20 phần rồi dừng đúng lúc kết thúc:
```
node suppliers/agent-read.mjs guard --log %TEMP%\pa-fake.log <thư mục>
→ CHỐT ĐỌC analysis-IB2600575567: ĐỌC THIẾU — Agent chưa đọc hết input.md (thiếu dòng 10784–11199 / 11199): kết quả có thể thiếu — bấm gửi lại yêu cầu. Giữ kết quả cũ.
```
Log agent cũ 27–31/10 (`run-20261029-211012-agent.log`, định dạng `json`): `node suppliers/read-guard.mjs <log>` → "KHÔNG có dòng result", 0 Read — đúng như B7: log cũ không có dấu vết đọc, nên không đo được lượt cũ nào đọc thiếu.

## Số đo
- Đo: IB2600575567 trước → 558.578 ký tự (số điều phối), input.md dựng lại hôm nay 584.670 byte; nay 20 phần, agent phải Read 20 lần (~290 nghìn token, ước tính) thay vì 1 lần Read bị từ chối/cắt. Chi phí lượt này cao hơn lượt cũ (bản cũ đọc thiếu) — ước tính, chưa đo bằng lượt thật.
- Test chứng minh: hai thư mục một lượt — a đọc đủ, b thiếu → chỉ b bị chặn; đường dẫn Windows hoa/thường; Read thư mục khác không tính; lượt không có dòng result nhưng đọc đủ → giữ kết quả + ghi chú; thư mục cũ không có read-order.json bị bỏ qua.

## Cách chép vào bot (điều phối làm sau khi gộp)
```
copy /Y "C:\Projects\GenSet Pro\genbid-hsmt\GenBid-Bot.ps1" "C:\Projects\GenSet Pro\genbid-hsmt\GenBid-Bot.ps1.bak-20261112-p4"
copy /Y "C:\Projects\GenSet Pro\genbid-hsmt\genbid-sync.js" "C:\Projects\GenSet Pro\genbid-hsmt\genbid-sync.js.bak-20261112-p4"
copy /Y "C:\Projects\GenSet Pro\GenSet-Pro\bot\genbid-hsmt\GenBid-Bot.ps1" "C:\Projects\GenSet Pro\genbid-hsmt\GenBid-Bot.ps1"
copy /Y "C:\Projects\GenSet Pro\GenSet-Pro\bot\genbid-hsmt\genbid-sync.js" "C:\Projects\GenSet Pro\genbid-hsmt\genbid-sync.js"
powershell -File "C:\Projects\GenSet Pro\GenSet-Pro\bot\Backup-GenBidBot.ps1"
```
(bản live trước khi sửa: GenBid-Bot.ps1 md5 9a2a6661…, genbid-sync.js md5 7136211f… — đều bằng main). Phải RESTART task "GenBid Bot" (GenBid-Bot.ps1 nạp một lần); genbid-sync.js và agent-read.mjs là tiến trình mới mỗi lượt. Lệnh kiểm sau khi chạy lượt agent thật: `Select-String "CHỐT ĐỌC" genbid-bot-logs\bot-2026-11.log`, `node suppliers\read-guard.mjs genbid-bot-logs\run-<stamp>-agent.log`.

## Quay lui
Chép lại hai tệp `.bak-20261112-p4` và restart bot (hoặc revert PR #568). Kết quả đã đăng không đổi dạng; `agent-read.mjs` không dùng nữa vô hại.

## Rủi ro
- Agent đọc bằng Bash dù đã cấm → guard báo thiếu, kết quả bị giữ lại (không đăng): có thể gặp nhiều ở lượt đầu; người dùng thấy lỗi ngắn và bấm gửi lại.
- Lượt agent nhiều thư mục: bị `error_max_turns` giữa chừng → thư mục đọc đủ + có result.json vẫn được đăng kèm ghi chú "bị dừng giữa chừng"; thư mục thiếu bị giữ.
- Gói rất dài (≥ 20 phần) tốn thêm vòng/token; nếu quá đắt cân nhắc trần ký tự cho đường agent (không đổi trong PR này).
- Khi guard lỗi (node/ repo thiếu): không có read-guard.json → hành vi cũ (đăng kết quả), không chặn.

## Chưa kiểm / ngoài phạm vi
- Lượt agent thật với stream-json (cú pháp `--verbose` + stdin file, chi phí từ dòng result bằng PowerShell) và `finish` thật với read-guard.json (đọc mã + `node --check`, chưa chạy post).
- `part-<i>.txt` của Tạo bản dịch (60.000 ký tự/phần) và `hsmt-full.txt` không nằm trong read-order (dịch dùng ask một lần; hsmt-full chỉ grep). Tệp scan đọc bằng ảnh PNG: không có chốt.
