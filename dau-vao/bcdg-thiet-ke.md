# BCĐG (Báo cáo đánh giá E-HSDT): thiết kế — chờ duyệt (chưa viết code)

Số liệu từ 19 gói đã tải tay ở `genbid-test\bcdg\`: 21 tệp, tổng 100 MB, trung vị ~1 MB, trung bình ~5 MB, lớn nhất 29 MB. 18/19 gói có đúng 1 tệp BCĐG. 10/19 là PDF scan (phải OCR, `text\*.err`).

## (a) Lúc nào bot tải
Trong `bidders(page)` của `genbid-sync.js`, ngay sau `bidders-extract.js` trên trang KQLCNT (trang đã nạp sẵn, không thêm lượt mở trang):
- `bidders-extract.js` thêm `reportFiles: [{id, name}]` vào doc `bidders/<TBMT>`, đọc từ `dtlKqlcnt.bideContractorInputResultDTO.reportFileId` và `evalReportFileInfo[].fileId` (cùng cách `probe.js`).
- Điều kiện tải: `final` = true, MST `4101623015` có trong `list` (mình đã nộp), `reportFiles` không rỗng, và chưa có `bcdg/<TBMT>` với cùng fileId. Gói đã trúng cũng tải (nhỏ, hữu ích); nếu muốn tiết kiệm có thể chỉ gói thua — xin quyết.
- Tải bằng `GenBid-HSMT.ps1 -List` (dùng lại, có md5, tệp vào `Downloads\GenBid-BCDG\<TBMT>\`, không đưa lên git).
- Gói cũ: `Get-GenBidBidderTargets.ps1` đã bỏ qua gói `final`, nên cần thêm điều kiện "final nhưng thiếu bcdg" cho lượt đầu (backfill 19 gói đã làm tay thì chép tệp có sẵn lên, không tải lại).

## (b) Lưu ở đâu
- Tệp: bucket **Supabase private `bcdg`** (`<TBMT>/<fileId>-<tên-sạch>.pdf`), không GitHub Release (repo public). Cùng kiểu `api/quote.js` (tạo bucket lúc dùng lần đầu, tải xuống chỉ cho thành viên đã đăng nhập).
- Bot không gửi tệp qua Vercel (giới hạn 4,5 MB/body): thêm `api/bcdg.js` (token ingest) trả **signed upload URL** của Supabase, bot PUT thẳng tệp lên Supabase. Egress Vercel ≈ 0.
- Metadata: coll mới `bcdg/<TBMT>` = `{files:[{id, name, size, md5, path}], reason, reasonQuote, scan, at, updated_at}`. Thêm `bcdg` vào `COLLS` của `ingest.js`; dùng `updated_at` theo mẫu các coll khác.

## (c) Web hiện gì
Trong mục Nhà thầu của gói (`biddersHtml`): dòng "Báo cáo đánh giá E-HSDT" với link tải (`/api/bcdg?id=…`, kiểm thành viên) và, nếu đọc được, một đoạn "Lý do bị loại" ngay dưới dòng của mình. Câu trích nguyên văn + số trang chỉ hiện khi `SHOW_SRC`. Không hiện gì khi chưa có BCĐG. Phải grep tên hàm trước khi thêm (index.html là một script lớn).

## (d) Có gọi AI tóm tắt lý do không
Đề xuất **không gọi AI mặc định**. Bot tự trích các dòng quanh tên/MST của mình trong văn bản (như `ctx.js`, đã dùng được cho 19 gói) và lưu làm `reasonQuote`; web hiện đoạn trích đó, kèm cụm "không đạt/loại" nếu khớp. Chỉ khi trích được mà không rõ lý do thì mới hiện nguyên đoạn. Tóm tắt bằng AI để dành thành nút bấm tay sau này (mỗi lần ~15 nghìn ký tự vào, 1 lượt Claude, ~vài nghìn đồng) — xin quyết nếu muốn bật tự động. Trong PDF scan ngày nay hay có bảng nên trích có thể rối; thà hiện đoạn thô còn hơn bịa lý do.

## (e) Tệp scan
Giữ nguyên quy tắc 04/11: `Get-FileText` trả '' khi ≥30% trang scan hoặc hỏng font → chạy `ocr-pdf.js` (có `--max N` trang; BCĐG scan dài nhất ở thử tay 40 trang, cần giới hạn ~40–60 trang quanh phần mình). OCR chỉ để lấy `reason`; tệp gốc vẫn lưu và cho tải. Đặt `scan: true` trong metadata, và nếu OCR không ra thì để trống `reason` chứ không đoán.

## Dung lượng / egress ước tính
- Backfill: 100 MB (lưu trữ Supabase free 1 GB; egress chỉ phát sinh khi bấm tải xuống).
- Về sau: mình nộp ~vài chục gói/năm, thua một phần → ~5 MB × ~20–30 = 100–150 MB/năm. Upload 1 lần, tải xuống theo click (không tự động/không preview).
- Metadata vài KB/gói, không đáng kể.

## Cần điều phối quyết
1. Gói trúng có tải BCĐG không (đề xuất: có)?
2. Duyệt (d): không gọi AI, chỉ trích đoạn?
3. Duyệt thêm điều kiện backfill cho gói `final` ở `Get-GenBidBidderTargets.ps1` (bot đang chạy phải restart sau khi chép bản mới).

## Kế hoạch bước 2 (sau duyệt)
Worktree `wt-bcdg`; sửa `bidders-extract.js`, `genbid-sync.js`, `Get-GenBidBidderTargets.ps1`, thêm `Send-GenBidBcdg.ps1` + `web/api/bcdg.js` + `ingest.js` + `web/index.html`; thử ở `genbid-test\`, ≥3 gói trong 19 (so md5 tệp tải với tệp tay), không ghi web thật. Nghiệm thu `nghiem-thu\bcdg.md`.
