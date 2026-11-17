# Nghiệm thu: BCĐG-4 — chọn trang cho gói liên danh, post bcdg thử lại

PR (DRAFT, chưa merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/591 — nhánh `bcdg-4` (từ origin/main 6f2017a), worktree `wt-bcdg-4`. Không chép vào `genbid-hsmt\`, không ghi web thật.

## Tệp đã đổi
- `bot/genbid-hsmt/bcdg-reason.js` — `jvNames` (tên liên danh lấy từ dòng/ô có tên hoặc MST mình), `mentionsJv` (so khớp chịu lỗi OCR: tên ngắn <7 ký tự khớp nguyên với dấu phân cách lỏng, tên dài lệch ≤1 ký tự); `pagesToRead` chọn thêm trang nhắc tên liên danh ± 1, chỉ khi trang có tên mình cho thấy liên danh.
- `bot/genbid-hsmt/genbid-sync.js` — `post(rows, {retry, delays})`: bcdg thử lại 2 lần (3 s, 10 s) khi lỗi mạng hoặc HTTP 429/5xx, hạn 90 s mỗi lần, log `e.cause` + cỡ thân; lệnh `bcdg --keys` bắt lỗi từng gói (một gói lỗi không dừng cả lượt).
- `suppliers/bcdg.test.mjs` — +4 test.

## Lỗi 1: liên danh
Cache `_ocr\IB2600483082` lượt nhanh f1..f9 (ĐO bằng `genbid-test\bcdg4\pick.js`):
- Trước: trang chọn 4,5,6 (chỉ trang 5 nhắc MST "vn4101623015 | Liên danh TN-HA").
- Sau: tên liên danh "tn-ha" → chọn 4,5,6,7,8,9 (thêm trang 8 "- Liên danh TN-HA: Không đáp ứng về kỹ thuật…" và hàng xóm).
- 5 gói cache khác (IB2400120387, 2600320499, 2600354007, 2600419125, 2600480017): jv rỗng, tập trang chọn KHÔNG đổi (kiểm bằng cùng script, jv []).
- Test: gói không liên danh không thêm trang; liên danh ở dòng nhà thầu khác không bị nhận.
- Chạy thật `--local --reread --profile bcdgtest` (bản thử `genbid-test\kit-bcdg`, log `genbid-test\bcdg4\run1.log`): cache có thêm p7,p8,p9; kết quả verdict "fail", reason "- Liên danh TN-HA: Không đáp ứng về kỹ thuật do không đạt điểm tối thiểu … mức tiêu thụ nhiên liệu … Prime … 50% công suất); tổng điểm kỹ thuật (51 điểm) … tối thiểu 70 điểm" = đúng như bản OCR đủ `genbid-test\bcdg\text\IB2600483082.txt` (trước: reason rỗng).

## Lỗi 2: `fetch failed`
- Reread vẫn TẢI LẠI tệp (để đọc chữ) — đó là thiết kế; không upload lại. Lỗi nằm ở `post` cuối, không phải ở tải.
- NGUYÊN NHÂN CHƯA CHỨNG MINH ĐƯỢC: log cũ chỉ có "fetch failed", không có `e.cause`. Suy đoán mạnh nhất: kết nối giữ sẵn tới Vercel (đã dùng ở `doc()` đầu lượt) bị đóng bên kia sau hơn 10 phút OCR, rồi POST dùng lại socket chết (`UND_ERR_SOCKET other side closed`); hai lần lỗi đều sau đoạn OCR dài. Thân yêu cầu nhỏ (một tài liệu bcdg), nên không phải quá lớn. Bản sửa không phụ thuộc nguyên nhân: thử lại sẽ mở kết nối mới, và nếu vẫn lỗi thì log có `cause` để biết.
- Kiểm bằng máy chủ giả (`genbid-test\bcdg4\post-test.js`, trích mã thật): ngắt 2 lần rồi 200 → OK sau 3 lần; 503 rồi 200 → OK; hỏng hẳn → lỗi "fetch failed [UND_ERR_SOCKET other side closed] (50 B, thử 3 lần)"; không `retry` → hành vi cũ (1 lần).

## Kiểm đã chạy
- `node --check` 2 tệp bot ok. `node --test suppliers/*.test.mjs`: `# tests 479 / # pass 479 / # fail 0`.

## Rủi ro / quay lui
- Gói liên danh OCR kỹ nhiều trang hơn (IB2600483082: 6/9 trang, vẫn trong trần 10 phút, dùng cache). Tên liên danh ngắn (3–6 ký tự) có thể khớp nhầm đoạn chữ khác → chỉ tốn thêm trang, không sai nội dung.
- Retry ghi tài liệu cùng id nên lặp an toàn. Quay lui: revert PR.

## Chưa kiểm được
- Reread thật `IB2400120387` (19 MB) ghi web: nguyên nhân thật chưa tái hiện (không ghi web thật). Chạy lại lệnh `--reread` thật sau khi triển khai và đọc log `cause` nếu còn lỗi.
- Gói liên danh khác ngoài IB2600483082 (không có mẫu).
