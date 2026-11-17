# Nghiệm thu: OCR hai bước cho BCĐG scan

PR (DRAFT, chưa merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/587 — nhánh `bcdg-ocr` (từ origin/main 8f29482), worktree `C:\Projects\GenSet Pro\wt-bcdg-ocr` (đã gỡ sau khi xong). Không chép vào `genbid-hsmt\`.

## Tệp đã đổi
- `bot/genbid-hsmt/ocr-pdf.js`: `ocrFile(file, max, find, opts)` thêm `opts {locate, cache, deadline}`; CLI `--locate --cache <dir> --deadline <epoch ms>`. Không có `--locate` thì chạy y như cũ (luồng Phân tích, specs không đổi). Có thêm dòng stderr `SCAN n/m` (sớm, trước khi đọc trang; các bên khác chỉ đọc `OCR n/` nên không ảnh hưởng) và `PARTIAL`. Khi >3 trang scan: lượt nhanh 150 dpi (render 6 trang/lần để khỏi mở lại tệp lớn mỗi trang) mọi trang → trang nhắc công ty ±1 → OCR kỹ (250 dpi + OSD như cũ), tối đa `--max 60`; không trang nào → các trang để trống, reason rỗng, không thử lại. Quá `--deadline` thì dừng giữa chừng, in PARTIAL, giữ cache.
- `bot/genbid-hsmt/bcdg-reason.js`: `mentionsUs()` (so khớp bỏ dấu, lệch vài ký tự, MST chịu 1 chữ số sai/ký tự lạ giữa nhóm số); mục 5: tên liên danh lấy từ dòng có MST ("vn4101623015 | Liên danh TN-HA") rồi tìm lý do theo tên đó; "không đồng bộ/độ" là cụm lý do; bỏ đoạn trích trùng nội dung.
- `bot/genbid-hsmt/bcdg-step.js`: `deps.text(file, ms, m)`; `scan = t.ocr || t.scan`; OCR quá giờ vẫn dùng chữ đọc dở để trích lý do (vẫn noText + error + tries như cũ); tham số `reread`.
- `bot/genbid-hsmt/genbid-sync.js`: `bcdgText` dùng `--locate`, cache ở `GenBid-BCDG\_ocr\<TBMT>\<md5>\{f<n>,p<n>}.txt` (ngoài `GenBid-BCDG\<TBMT>` nên `bcdgCleanup`/`bcdgDownload` không xoá; xoá khi đọc xong trọn vẹn trừ `--keep`; `bcdgSweepCache` xoá thư mục >14 ngày); deadline của ocr-pdf = trần − 45 s; `bcdg --keys … --reread`.
- `suppliers/bcdg.test.mjs`: +6 test (mentionsUs, scan khi quá giờ, scan false, reread ×2, liên danh/"không đồng bộ"); ngưỡng corpus 19 gói ≥16.

## Kiểm đã chạy
- `node --check` 4 tệp → ok. `node --test suppliers/*.test.mjs` → **454 pass / 0 fail** (bcdg.test.mjs 27 test).
- Chạy thật `--local --reread` (profile bcdgtest, `GENBID_BCDG_DIR=genbid-test\bcdg-run`, bản thử `genbid-test\kit-bcdg\`; log `bcdg-run\ocr1.log`, `ocr2.log`; không upload, không ghi web). LƯU Ý ĐO: máy đang tải 100% CPU (có tiến trình `find / -iname *hsmttext*` pid 15428 của phiên khác chạy từ 12:13, ~10.000 s CPU, tôi không đụng) nên thời gian dưới đây chậm hơn bình thường ~3–5 lần: một lượt nhanh đo riêng là 5 s render + 12–23 s Tesseract/trang, không phải ~2 s.

| Gói | Loại | Thời gian đo | Kết quả |
|---|---|---|---|
| IB2400120387 (19,6 MB, 65 trang scan) | lượt 1 ở ngân sách 10 phút: quét nhanh xong 65 trang, thấy tên ở trang 3,10,11,12,15,17,45 → 16 trang cần kỹ, làm được 9 rồi dừng sớm; ghi `scan:true`, `noText`, `error "OCR quá giờ"`, tries 1 (trước: scan:false, hết 19 trang). Lượt 2 từ cache: ~6 phút (gồm tải) đọc nốt, hết error | 2 lượt | reason `1 (Cong ty TNHH Thiết bị Kỹ thuật Thảo Nguyên. Không đạt` = đúng bằng đoạn trích từ `text\IB2400120387.txt` (OCR 40 trang cũ) |
| IB2600248328 (4,2 MB, 12 trang) | 1 lượt, ~9 phút | reason: "TNHH Thiết bị Kỹ thuật Thảo Nguyên không đạt về kỹ thuật do E-HSMT yêu cầu: “Xudt xứ: Châu Âu” nhà thầu chào: “Xuất xứ: Trung Quốc”." Khớp `text\IB2600248328.txt` |
| IB2600374560 (2,4 MB, 10 trang) | ~4 phút | rỗng (như đoạn trích cũ: tên ngắt trong ô bảng; chưa sửa) |
| IB2400393199 (1,1 MB, 4 trang scan) | ~2 phút | rỗng (như cũ) |
Đã kiểm: OCR hai bước cho cùng đoạn trích với OCR đầy đủ ở hai gói có lý do; tiết kiệm trang ở IB2400120387 là 16/65 trang kỹ. CHƯA đo được "~2 s/trang" do máy tải; chưa so tổng thời gian đầy đủ hai bước với OCR cũ trên máy rảnh.
- Mục 5 (đo trên `genbid-test\bcdg\text`): 14/19 → **16/19** gói trích được: IB2600483082 (Liên danh TN-HA: "Không đáp ứng về kỹ thuật do không đạt điểm tối thiểu… tiêu thụ nhiên liệu 50% công suất") và IB2400254417 ("Thông số kỹ thuật không đồng độ từ một nhà sản xuất"). Còn rỗng: IB2400393199 (không có cụm lý do), IB2600374560 (bảng ngắt tên), IB2400564384 (chữ rối).

## 3 mẫu đối chiếu nguồn
1. IB2600248328 `BCĐG-0001.pdf` (fileId feac9fed-3e7b-4df8-a5ce-784c7b6cc15b): "nhà thầu chào: “Xuất xứ: Trung Quốc”" (khớp dòng trong `text\IB2600248328.txt`; OCR đọc "Xudt").
2. IB2600483082 (bảng mở thầu dòng 152 + dòng 199 của `text\IB2600483082.txt`): "- Liên danh TN-HA: Không đáp ứng về kỹ thuật do không đạt điểm tối thiểu…".
3. IB2400254417 (dòng 138 có vn4101623015; mục "4. CÔNG TY TNHH THIẾT BỊ KỸ THUẬT THẢO NGUYÊN – Thông số kỹ thuật không đồng độ…").
Nguồn: KQLCNT của từng TBMT trên muasamcong.

## Rủi ro còn lại + quay lui
- Lượt nhanh chỉ tìm tên bằng chữ OCR ở 150 dpi: trang scan nghiêng/ngược (như IB2600253287, 22/30 trang xoay 90°) có thể không khớp tên → bị bỏ qua → reason rỗng. Chưa thử gói đó với `--locate`. Nếu cần, thêm OSD vào lượt nhanh.
- Một số trang quan trọng không nhắc tên công ty (đoạn lý do "Thuyết minh…" ở trang riêng) sẽ không được OCR kỹ; chỉ ±1 trang.
- Cache OCR chiếm đĩa (png không lưu, chỉ txt nhỏ). `--reread` ở chế độ thường cần `bcdg/<TBMT>` đã có trên web; tệp không có `path` giữ nguyên lỗi (không upload).
- Quay lui: revert PR; bot chạy bản trước (ocr-pdf mặc định không `--locate`). Thư mục `GenBid-BCDG\_ocr` xoá tay được.
- Triển khai: sau merge chạy `bot\Backup-GenBidBot.ps1`/chép 4 tệp, restart tác vụ bot.

## Chưa kiểm được
Tổng thời gian trên máy rảnh; gói scan xoay (IB2600253287, IB2400564384 130 trang); `--reread` ghi web thật (chỉ `--local`); upload Supabase.
