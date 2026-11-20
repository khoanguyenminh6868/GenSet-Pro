# Nghiệm thu: tệp nén đọc đủ tệp (lần 1, 20/11/2026)

PR (draft, chưa merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/960 (commit 69a0c15c)

## Tệp đổi
`bot/genbid-hsmt/genbid-sync.js`, `sync-pure.js`, `ocr-pdf.js` (3 tệp này phải chép sang `genbid-hsmt\`), `bot/test/archive-read.test.mjs` (sửa 1 dòng), `bot/test/archive-all-files.test.mjs` (mới).

## Vì sao có mức 30
`git log -S`: đã có từ lần đưa bot lên git (#287, `walk(out).slice(0, 30)`), PR #946 chỉ đặt tên `ARCHIVE_LIMITS.files = 30` "như cũ". Không có lý do ghi lại (không commit message, không nghiệm thu nào). Không phải chốt chống bom: bom nén đã bị chặn ở bước liệt kê (500 mục, 1 GB giải nén, `..`, lồng 2 lớp) trước khi giải nén.

## Thay đổi
1. `ARCHIVE_LIMITS.files` 30 → 500 (= `entries`). Mọi chốt chống bom giữ nguyên (500 mục, 1 GB, lồng 2 lớp, đường dẫn ra ngoài, bỏ liên kết). Tệp nén vượt 500 mục vẫn không giải nén (có ghi chú).
2. `archiveOrder` (thuần, `sync-pure.js`): đọc tệp có chữ trước (docx, xlsx, doc, tệp nén lồng, PDF có lớp chữ), scan / ảnh sau. PDF được thăm dò bằng pdftotext + `pdfNeedsOcr` (cùng luật Publish).
3. Nếu vẫn có tệp bị cắt bởi trần số tệp: `readNote` nêu tên các tệp chưa đọc (`unreadList`, tối đa 8 tên + "(+N)").
4. Trần OCR hiện có: `ocr-pdf.js` chỉ OCR tối đa 300 trang scan mỗi PDF, trước đây cắt im lặng. Nay in `CAPPED 300/<tổng>` ra stderr, `ocrText` ghi vào `readNote` của tệp ("chỉ OCR 300 trong N trang scan..."). Cũng ghi `readNote` khi OCR quá 180 phút. Log OCR có thêm số giây mỗi tệp. KHÔNG đặt trần mới.
5. Chỗ khác dùng `ARCHIVE_LIMITS`: chỉ `archiveText`. `Publish-GenBidHsmt.ps1` / `publish-text` đi qua `archiveText` nên tự theo. `ingest.py` (nhánh hsmt-inbox) không giải nén tệp nén (chỉ zipfile cho docx) và có `OCR_MAX_PAGES = 300` riêng cho PDF: không sửa.
6. Đường ghi theo lô (#950): `batchRows` ≤ 15 đoạn / 3 MB mỗi yêu cầu, không phụ thuộc cỡ chữ; IB2500441397 nay 3.466.940 ký tự (không kể trắng) ≈ 27–28 đoạn (lần đọc 30 tệp trước ghi 27 đoạn, log chay-IB2500441397-lan2.log) ≈ 2 lô (12 tệp thêm là .doc nhỏ 70–200 KB). Chưa chạy ghi web thật.

## Lệnh kiểm + đầu ra
```
node --check genbid-sync.js ocr-pdf.js            → ok
node --test bot/test/*.test.mjs                   → # pass 148  # fail 0  (4 ca mới: trần 42/48/500, chốt bom 501 mục / 1 GB / '..', thứ tự, unreadList)
```
Chạy thật bản mới (bản sao `genbid-test\tep-nen\kit`, tải 2 tệp bằng token, không ghi web), `publish-text` không OCR:
- IB2500441397 `.rar` (20,9 MB): **42/42 tệp** có đoạn `--- tên ---` (trước 30), 3.466.940 ký tự, `notes: []`, 4 phút 15 giây (12 .doc thêm ≈ 6 s mỗi tệp qua Word).
- IB2600576655 `.rar`: 48 bản vẽ + 1 docx; 72.140 ký tự chữ sẵn; `needOcr` = **44 tệp** (4 PDF có chữ đọc luôn, 44 scan chờ OCR); 8,6 s.
- Thứ tự (kiểm bằng tệp zip thử `a-scan.pdf, b.txt, c-text.pdf`, lệnh `text` có OCR): log ra `b.txt`, `c-text.pdf` rồi mới OCR `a-scan.pdf` (28 s).

## Đo OCR thật (để chọn có đặt trần hay không)
Máy này, bot đang chạy, `ocr-pdf.js` trên bản vẽ 1 trang của IB2600576655 (11 tệp đo): **28 – 90 s mỗi trang, trung bình ≈ 45 s** (khổ lớn, xoay OSD), 1.600 – 4.600 ký tự mỗi trang; PDF có chữ: 0,3 s. Hệ quả: 44 bản vẽ ≈ 33 phút; trần 300 trang mỗi tệp (nếu toàn bản vẽ) ≈ 3,7 giờ, trần 180 phút của `ocrText` sẽ chạm trước, nay ghi rõ "OCR quá thời gian". Tài liệu chữ thường nhanh hơn nhiều (Tài liệu gói số 7: 371 trang). Không có số đo nào bắt buộc đặt trần mới nên không đặt; xem quyết định dưới.
Cỡ chữ lên web: 3,47 triệu ký tự trong 1 gói là lớn nhất đã thấy; web đọc tuần tự mọi đoạn, không giới hạn số đoạn (xem nghiệm thu ocr-ghi-theo-lo-1).

## 3 mẫu đối chiếu
1. IB2500441397: 12 tệp mới đọc (từ `54. Cosse ep dong 6mm2.doc` tới `97. 98. Ong nhua phang PVC.doc`) đều có tiêu đề trong `outa.txt` (đếm 42 tiêu đề `^--- `).
2. IB2600576655: nội dung bản vẽ lần trước OCR 29/48; lần này danh sách chờ OCR có đủ 44 tệp (kể cả 18 tệp trước bị bỏ).
3. Thứ tự: tệp zip thử như trên.
Chưa đối chiếu chữ các .doc mới từng câu với bản gốc mở bằng Word tay (cùng đường Word như 91 .doc đã kiểm ở nghiệm thu lần 1).

## Chưa kiểm được
- Nhánh `CAPPED` (scan > 300 trang) chưa chạy thật: không có tệp mẫu; mã đơn giản nhưng chưa có test đơn vị (chuỗi stderr nằm trong ocrText).
- Đọc lại thật + ghi web: chờ điều phối báo đã merge + chép.
- Thời gian OCR 44 bản vẽ chưa đo cả lượt (~33 phút ước từ 11 tệp).
- Sandbox Ubuntu chưa chạy (cùng mã).

## Rủi ro + quay lui
- Tệp nén nhiều scan chạy lâu hơn (không còn bị cắt ở 30). Giữ trần 180 phút mỗi PDF của `ocrText`; không có trần tổng mỗi tệp nén.
- Quay lui: revert PR, chép lại `.bak`.

## Việc cần điều phối / Khoa quyết
1. Merge #960 rồi chép `genbid-sync.js`, `sync-pure.js`, `ocr-pdf.js`.
2. Có cần trần OCR tổng mỗi tệp nén (vd 120 phút)? Đề xuất: chưa, 44 bản vẽ ≈ 33 phút là lớn nhất đã gặp.
3. Cách đọc lại gói đã `hasText:true` (IB2600576655: đã có chữ 30 bản vẽ): `ocrHsmt` bỏ qua tệp `hasText` ⇒ không đọc lại tệp nén. Cách đề xuất: đặt `hasText:false` cho riêng tệp `.rar` đó trong bản ghi `hsmt` (ghi web) rồi `ocr-hsmt --key`; `ocrHsmt` nối chữ mới SAU chữ cũ nên chữ 30 bản vẽ cũ nằm trùng với chữ mới (tăng gấp đôi chữ của 30 tệp). Cách sạch hơn: sau khi đặt hasText:false, đặt `textChunks` 0 cho gói... mất chữ các tệp khác (docx, pdf). Cần điều phối chọn; tôi chờ trước khi ghi web (IB2500441397: hasText vẫn false, chạy thẳng được).

## Đọc lại thật (20/11/2026)
- IB2500441397: 42/42 tệp, 3.466.984 ký tự không trắng, 27 đoạn, không U+FFFD, không readNote. IB2600576655: 2 đoạn, rar hasText true (ocr 45), docx + pdf cũ nguyên từng ký tự. Cách đọc lại: script ngoài repo `genbid-work\ocr-6-tep\reread.mjs` (cắt khối tệp nén, ghi lại, hasText:false rồi `ocr-hsmt`); đoạn thừa ghi rỗng (web không có lệnh xoá). OCR 44 bản vẽ mất > 1 giờ (63 - 180 s mỗi trang khi máy bận, không phải ~45 s như đo lúc máy rảnh; một trang 802 s).
- **Tệp e46 không ra chữ**: `e46-20 (WBQ)D220B-031000A1-1.PDF` trong `1. Bản vẽ gói 6-...zip`: 1 trang, khổ 4915 x 2326 pt (≈ 68 x 32 inch), 4,3 MB, tệp thật (không trắng, không mờ). Log `chay-IB2600576655-lan2.log` dòng 39: `OCR lỗi (e46-20 ... .PDF): libpng error: Read Error` (pdftoppm tạo PNG khổ khổng lồ ở 300 dpi, tệp PNG lỗi); mã rơi về pdftotext cho ra chuỗi rỗng. Chạy lại một lần để xác nhận đã bị dừng (quá lâu), nên nguyên nhân là theo log, chưa tái hiện.
- **Thiếu sót của mã (không phải hành vi đúng)**: `ocrText` khi `ocr-pdf.js` thoát lỗi chỉ `log(...)` rồi trả chữ pdftotext (rỗng), KHÔNG `readNote` → web không biết e46 chưa đọc. Chỉ tệp nén cả cái mới có `readNote` khi không ra chữ; tệp con ra 0 chữ im lặng. Tương tự khi tệp con scan nhưng OCR trả rỗng.
- Đề xuất (chưa làm): (1) `ocrText` gọi `readNote(name, "OCR lỗi: <ocrErr>, chưa đọc")` khi `r.status !== 0` và kết quả rỗng; (2) với tệp con trong tệp nén ra < 40 ký tự chữ, `readNote(name, "không ra chữ")`; (3) `ocr-pdf.js` hạ dpi khi trang quá lớn (cạnh > ~4000 pt) để PNG không lỗi.
