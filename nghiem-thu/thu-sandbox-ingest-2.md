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
