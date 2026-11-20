# Nghiệm thu: thử Action ingest.py + sửa ZIP AES (lần 2, 20/11/2026)

## 1. Push thử lên `hsmt-inbox` cho IB2600599032: KHÔNG làm được (bị chặn quyền)
- (a) ĐÃ làm: lưu nguyên `hsmt` + 2 chunk `hsmttext` + `hsmtreq` của gói vào `C:\Projects\GenSet Pro\genbid-work\thu-sandbox\truoc-IB2600599032.json` (203.396 byte; chunk 150.319 + 6.642 byte; script `snap.mjs` cùng thư mục, chỉ đọc).
- (b) ĐẠT: web có đúng 2 asset `/_gh/748062160` (CHUONG III.zip), `/_gh/748062158` (CHUONG V.rar) = `release.json`; `textChunks` = 2 > 0; cả hai tệp hasText true → rơi kịch bản 1.
- (c) BỊ CHẶN: lệnh commit + `git push origin HEAD:hsmt-inbox` bị bộ phân loại quyền của phiên từ chối (lý do "Unsanctioned Communication": lệnh ghi lên repo/web dựa trên duyệt của phiên điều phối, không phải của Khoa trong chat). Không chạy gì (không commit, không push), không tìm đường vòng. Đã gỡ worktree tạm `wt-inbox-thu`.
- (d)(e) chưa làm. Web không bị đổi.
- Để làm tiếp: Khoa tự xác nhận trong chat phiên này (hoặc tự chạy lệnh push), hoặc thêm quy tắc quyền cho `git push` lên `hsmt-inbox`. Việc cần làm: thêm 1 byte `\n` cuối `inbox/IB2600599032/release.json` trên `origin/hsmt-inbox`, push thường; xem log Action có "already on the web from the bot (2 files), text kept"; chạy lại `node genbid-work\thu-sandbox\snap.mjs IB2600599032 sau.json` rồi so với `truoc` (chỉ `hsmtreq.doneAt` được đổi).

## 2. Lỗi ZIP AES: PR draft https://github.com/khoanguyenminh6868/GenSet-Pro/pull/961
- Tệp đổi: `bot/genbid-hsmt/sync-pure.js` (`isNulFile`), `genbid-sync.js` (`archiveText` bỏ tệp toàn NUL, ghi chú "có mật khẩu"), `bot/test/archive-read.test.mjs` (+1 ca).
- Kiểm: `node --test bot/test/*.test.mjs` → pass 149, fail 0; `node --check genbid-sync.js` ok.
- Chưa kiểm: chạy trên ZIP AES thật (máy này không có 7z; sandbox thử đã xoá). Cách kiểm sau merge: tạo `7z a -pX -mem=AES256 pw.zip a.txt`, `node genbid-sync.js publish-text --file pw.zip ...` → kỳ vọng `chars 0`, ghi chú "có mật khẩu".
- Không tự merge, không chép sang `genbid-hsmt\`. Quay lui: revert PR.

## Cập nhật: push thử ĐÃ chạy (Khoa xác nhận trong chat, 20/11/2026)
- Commit `8f80bdb2` trên `hsmt-inbox` (thêm `\n` cuối `inbox/IB2600599032/release.json`), push thường, không workflow_dispatch.
- Action `hsmt inbox`: success. Log: `Tenders: IB2600599032` → `IB2600599032: already on the web from the bot (2 files), text kept`.
- So web trước/sau (`genbid-work\thu-sandbox\truoc-…json`, `sau-…json`): `hsmt` giống từng ký tự, 2 chunk `hsmttext` giống từng ký tự; chỉ `hsmtreq.doneAt` đổi (2026-11-14T16:25:10Z → 2026-11-20T01:51:52Z).
- Kết luận B: ĐẠT trên Action thật. #947 giữ chữ bot khi push thường.

## Kiểm #961 trên Windows (20/11/2026, `genbid-test\zipnul\`, không ghi web)
- Máy không có 7z và WinRAR `Rar.exe` không có `-afzip`: tạo ZIP AES-256 (WinZip AE-2) bằng `mk-aes-zip.mjs` (Node crypto) với `a.txt` + `c.docx` (01.docx của IB2600599817), mật khẩu thử. `C:\Windows\System32\tar.exe -tvf` liệt kê 2 tệp (đọc được như ZIP mã hoá thật).
- **Khác Linux:** tar.exe (bsdtar Windows) KHÔNG ghi NUL; nó dừng "Couldn't read passphrase" (mã 1) và để tệp 0 byte. Mã main đã ghi "có mật khẩu" nhưng thêm "đọc 1 tệp giải nén được" (tệp rỗng). Sửa thêm ở #961 (commit mới): bỏ cả tệp 0 byte khi lý do là mật khẩu.
- Đầu ra thật, mã main `86203cd4` so nhánh #961:
```
[main pw.zip]  {"chars":0,"notes":["pw.zip: có mật khẩu, đọc 1 tệp giải nén được"]}
[#961 pw.zip]  {"chars":0,"notes":["pw.zip: có mật khẩu"]}
[main 02.rar]  chars 109178   [#961 02.rar] chars 109178   (chữ GIỐNG từng byte, cmp)
[main 01.zip]  chars 9722     [#961 01.zip] chars 9722     (chữ GIỐNG từng byte, cmp)
```
(9722 trên Windows; 9757 ở sandbox Linux là cách đếm khác của cùng chữ, không liên quan #961.)
- `node --test bot/test/*.test.mjs`: pass 149, fail 0.
- Chưa kiểm trên Windows: ZIP AES do 7z thật tạo (dùng bản tự tạo đúng định dạng). Nhánh NUL (Linux bsdtar) đã thấy ở sandbox, test đơn vị `isNulFile`; chưa chạy lại trên sandbox sau sửa.
