# Kiểm: bot dự phòng Vercel Sandbox + ingest.py sau #946 (24/11/2026, KhoaMiniPC)

Chỉ kiểm, chưa sửa. Không bật/tắt bot thật, không đổi biến Vercel, không Sync. `genbid-bot` giữ `stopped` (snapshot `snap_lQOImxkKUGBWi5eRd3XgXNcszVHF`). Sandbox tạm `genbid-probe-kiem` (từ snapshot đó, sin1, không persistent) đã xoá.

## Kết luận
Còn chạy được; chưa thấy lỗi mới ở mã. Một điểm CHƯA xác nhận được (mục 4): bật Agent bằng Java của #1103 trong sandbox tạm.

## 1. ingest.py (nhánh hsmt-inbox)
- `ingest.py` không đổi từ #947 (2a194318): sha256 `99505754…828485` giống ở đầu nhánh hiện tại `25dea951` (`git show origin/hsmt-inbox:ingest.py | sha256sum` = `git show 25dea951:ingest.py | sha256sum`).
- Action `hsmt inbox` các lượt push gần nhất đều `success` (gh run list): 24/11 02:52 (25dea951), 23/11 13:28, 23/11 07:14, 20/11 02:17, 20/11 01:51 (lượt thử #947), 19/11 03:11, 18/11, 17/11.
- Nghiệm thu 1+2 (20/11) vẫn đúng: push thường giữ chữ bot, `KEYS` (chạy tay) luôn ghi đè (cách dùng, không phải lỗi).

## 2. Thay đổi sau #946 đụng sandbox / đọc tệp (git log origin/main --since=2026-11-19)
#950 (ocrHsmt ghi lô nhỏ), #960 (đọc đủ tệp nén), #961 (bỏ tệp NUL / ZIP AES), #975, #1103 (Agent bằng Java), #1133 (Sync lỗi thử lại), #1146 (khoá `FIRECRAWL_KEY_2`).
- #1146: `web/api/_sandbox.js` `botEnv` thêm `FIRECRAWL_KEY_2`; `start-bot.sh` ghi `$KIT/.firecrawl-key-2` và `unset` biến. Đúng khuôn của `FIRECRAWL_KEY`; `web/api/test/wake.test.mjs` pass 21/21. Biến Vercel `FIRECRAWL_KEY_2` có đặt hay chưa: không kiểm (không đọc biến Vercel).

## 3. Kiểm chạy (đầu ra thật)
- Windows, `git archive origin/main bot web` (83ec53ec) → `node --test bot/test/*.test.mjs`: 157 test, 156 pass, 1 fail = `ba nơi (bidprice.js, sync-pure.js, muasamcong.ts)` ENOENT `server/src/muasamcong.ts`: do bản chép của tôi không có thư mục `server/`, không phải lỗi mã.
- `node --check genbid-sync.js`; `bash -n start-egp-agent.sh`, `bash -n bot/sandbox/start-bot.sh`: ok.
- Sandbox tạm (Linux) mã main 83ec53ec: `node --test archive-read.test.mjs sync-text.test.mjs` → 28 pass, 0 fail.
- #961 trên Linux thật (chưa từng kiểm sau sửa): `7z a -pX -mem=AES256 pw.zip a.txt` rồi `node genbid-sync.js publish-text --file pw.zip` → `pw.zip: có mật khẩu` / `SUMMARY: 0 ký tự, 1 ghi chú` (trước #961: 21 ký tự NUL). ĐẠT.

## 4. Chưa xác nhận: #1103 (bật Agent bằng Java) trong sandbox tạm
`bash start-egp-agent.sh` (main) trong sandbox tạm, 2 lần (lần 1 timeout 110 s; lần 2 sau `wineserver -k`, log sạch, timeout 75 s):
```
Java của Agent không mở cổng 1234 sau 60 giây, thử vỏ egp-edoc-agent.exe.
/vercel/egp-agent.out: "2026/11/24 08:06:59 exit status 1"     (vỏ .exe thoát ngay, đúng lỗi #1103 mô tả)
```
Chạy tay đúng lệnh của `egp-edoc-agent.bat` (java.exe … com.fis.egp.ServiceApp, `WINEDEBUG=err+all`, DISPLAY :99): 80 giây không mở cổng 1234, `/tmp/j.out` chỉ có cảnh báo Wine (`getaddrinfo Failed to resolve your host name IP`, winebth), không thấy tiến trình java.exe còn sống sau đó; không có thông báo lỗi Java.
Ngược lại, thư mục `C:\MPI\EGP-AGENT\logs` trong snapshot sửa lần cuối 24/11 02:51:47 UTC và `egp-agent.out` cũ có log Agent khởi động đủ (DownloadFileShareWorker… started, CheckUpdate chọn phiên bản 2.0.1) → lượt thật 24/11 (gói IB2600617248, push inbox 02:52 UTC) Agent CHẠY được.
Nên: trong sandbox thật Agent lên được; trong sandbox tạm không tái hiện (khác có thể: lượt thật do bot chạy qua setsid/nohup từ PowerShell; sandbox tạm chạy qua lệnh MCP; hoặc Java lên chậm hơn 60 s lúc khởi động nguội). Chưa kết luận lỗi.

## 5. Đề xuất (chưa sửa)
1. Trước khi tin #1103 ổn định: xem log lượt thật gần nhất trong sandbox `genbid-bot` (`~/egp-agent.out`, dòng "Agent đã sẵn sàng sau N giây" hay "Java của Agent không mở cổng") — cần bật sandbox, ngoài phạm vi kiểm này. Nếu hay thấy "Java … không mở cổng", nâng 60 s lên ~90 s.
2. Cách kiểm sạch hơn: cho `start-egp-agent.sh` ghi `Agent sẵn sàng bằng Java|vỏ exe sau N giây` vào `sandbox.out` để thấy ngay nhánh nào chạy.
3. Mục đã biết còn mở: tệp `.doc` có mật khẩu qua antiword chưa thử; OCR/Phân tích đầy đủ trên sandbox không nằm trong lần kiểm này.

## Dọn
`genbid-probe-kiem` đã xoá; không PR, không đổi tệp trong repo / `genbid-hsmt\`; thư mục chép tạm nằm ở scratchpad của phiên.
