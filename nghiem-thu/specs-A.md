# Nghiệm thu cổng A: sửa đọc lại specs (5 nhóm gói)

Trạng thái: CHƯA thay tệp thật, CHƯA ghi gì lên web (mọi lượt thử chạy `--dry`), CHƯA có PR. Bản gốc đã sao lưu: `genbid-hsmt\genbid-sync.js.bak-20261110-specsfix`, `genbid-hsmt\ocr-pdf.js.bak-20261110-specsfix` (hook Stop và Backup-GenBidBot.ps1 đều bỏ qua `*.bak*`, nên các tệp này chấp nhận được).
Bản thử: `C:\Projects\GenSet Pro\genbid-test\genbid-sync.js` và `ocr-pdf-new.js` (trong bản thử, genbid-sync trỏ tới `ocr-pdf-new.js`; khi thay thật phải đổi tên về `ocr-pdf.js` và sửa 2 chỗ gọi).

## Sự cố phát sinh (đã xử lý)
16:36–16:55 có hai tệp thử `*-new.js` nằm trong `genbid-hsmt\`: Stop hook chạy cả trong `claude -p` nên lượt Claude trả chữ không phải JSON. Phiên điều phối đã kiểm: không lượt bot nào chạy trong khoảng đó. Đã dời mọi bản thử sang `genbid-test\`.

## Các chỗ sửa (diff gốc → bản thử)
1. `ocr-pdf.js` (nhóm 2): trang OCR ra chữ rác (tỉ lệ ký tự nằm trong từ ≥3 chữ < 0,5) thì render lại PGM, đọc hướng bằng Tesseract OSD (`osd.traineddata` của bản cài Tesseract), xoay 90/180/270 trong JS (`rotatePgm`), OCR lại, giữ bản đọc tốt hơn; stderr thêm dòng `ROTATE <trang> <độ>`. Nguyên nhân gốc: 4 gói là scan xoay ngang (trang xen kẽ 90°/270°), không phải thiếu dpi/psm.
2. `genbid-sync.js` `chapterV()` (nhóm 4): thêm nhánh cuối, khi không có tiêu đề chương nào: lấy từ dòng riêng "YÊU CẦU KỸ THUẬT" (chữ hoa, sau 20% văn bản) trở đi. Nhánh "Chương V < 3000 ký tự → từ dòng Phần 2 cuối đến Phần 3" đã có sẵn trong code (không đụng).
3. `specsSource` (nhóm 3): không tệp nào nhận ra, không có webform, không có danh mục hàng hóa → tải tối đa 4 tệp không phải QĐ/phê duyệt (regex `APPROVAL`).
4. `unzipPlain` (nhóm 5, nguyên nhân riêng): `.zip` có tên tệp không phải UTF-8 thì tar.exe bỏ qua hết mục; dự phòng đọc bằng .NET trong `specsArchive` và `archiveText`. Kèm: khi chạy `--key K`, bỏ qua cờ `ocrTried` của tệp trên web (chỉ khi `--key`, lượt thường không đổi).
5. Nhóm 1 (.doc lỗi mã): KHÔNG cần sửa code. `wordText` hiện tại (format 2, 65001) đọc đúng; ba gói bị đọc trước bản sửa 03/11. Chỉ cần đọc lại.

## Kết quả từng gói (thử `--dry`, Sonnet)
| Nhóm | Gói | Kết quả |
|---|---|---|
| 1 | IB2500140418 | Word đọc đúng 28.829 B; 40 thông số, 12,5 kVA 1 pha ×24 máy |
| 1 | IB2300295227 | đọc đúng 4.799 ký tự (gia công gối máy phát): không phải tổ máy → "none" hợp lý |
| 1 | IB2400095607 | đọc đúng; gói xây dựng nhà xưởng → "none" hợp lý |
| 2 | IB2300094137 | OCR 8 trang xoay đúng, 17.286 B; 55 thông số, 300/330 kVA |
| 2 | IB2300018261 | OCR 8 trang, 15.671 B; 66 thông số, 300/330 kVA |
| 2 | IB2200069185 | OCR 7 trang, 8.155 B; 37 thông số, 150/165 kVA |
| 2 | IB2500049415 | OCR 10 trang, 9.681 B; 26 thông số, 80 và 400 kVA |
| 3 | IB2500331496 | đọc "Bản vẽ máy phát điện" (OCR 6 trang): 4 thông số, 250 kVA |
| 3 | IB2200060447 | 14 thông số, 300 kVA (Cummins hiện hữu) |
| 3 | IB2400169259 | 5 thông số, không ghi công suất |
| 3 | IB2200060256 | thuê MPĐ: 10 thông số, 400/50/40/30 kVA |
| 3 | IB2600110321, IB2600016019, IB2500077833, IB2400265258 | đọc 2–4 tệp, đều không phải tổ máy (lưới điện, tư vấn) → "none" có lý do cụ thể |
| 3 | IB2500188538 | chỉ có QĐ phê duyệt → vẫn "notext", có lý do |
| 4 | IB2600547578 | chapterV mới trả 24.713 ký tự từ "YÊU CẦU KỸ THUẬT" + Phụ lục 1 (trước: 150.000 ký tự đầu = chỉ dẫn + hợp đồng); Claude: chỉ phụ tùng (ổ bạc, dây quấn) → "none" đúng |
| 5 | IB2500143599 | zip đọc được (62 s): 30 thông số, nhiều cỡ 116–1650 kVA |
| 5 | IB2600279956, IB2600035196 | zip 22 PDF tiêu chuẩn VTTB lưới điện (~162 trang scan), KHÔNG phải tổ máy: dừng thử giữa chừng, chưa đọc hết; đề nghị để nguyên "notext" (lý do: zip tiêu chuẩn vật tư lưới điện) |
| 5 | IB2500062950, IB2500075505 | không có tệp HSMT trên muasamcong, không có danh mục → giữ "notext" (lý do cụ thể) |
Các gói trong tsv `specs-khong-chuong5-mpd.tsv`: 183 dòng, 58 "cung cấp/none", 56 "dịch vụ/khác/none", 52 "cung cấp/notext", 17 "dịch vụ/khác/notext"; phần lớn "none" là gói không phải tổ máy (xây lắp, tư vấn, phụ tùng), AI đã ghi lý do. Chỉ đọc lại các gói thuộc nguyên nhân 1–5 ở trên.

## Đối chứng không đổi
- `chapterV`: so cũ/mới trên 1.490 `text.txt` đang có: 1.489 giống hệt, 1 khác (IB2600547578, chủ đích).
- OCR: 4 PDF scan bình thường (QĐ phê duyệt, 2–3 trang): md5 đầu ra cũ = mới, 0 dòng ROTATE.
- Chọn tệp (`text.txt` trước/sau, chạy lại bằng code thử): IB2300057123 md5 b8ed2b6f = b8ed2b6f (giống). IB2200049404 khác (75d566a6 → fd85bb14, 35.338 → 11.949 B: bản cũ có thêm tệp "Mẫu 17 Hợp đồng"); chạy cùng gói bằng code THẬT hiện tại cũng ra fd85bb14 → khác biệt do quy tắc chọn tệp trước đó, không do bản sửa (bản mới bỏ hợp đồng là đúng). IB2300064290 và IB2400078017 chưa đối chứng được (IB2300064290: OCR tệp 29 MB quá 12 phút, đã dừng; IB2400078017 chưa chạy tới). `text.txt` gốc của 4 gói đã khôi phục.
- Mẫu OCR đối chiếu ảnh trang (IB2300094137 trang 2): ảnh ghi "Công suất liên tục ≥ 300 KVA / dự phòng ≥ 330 KVA / Điện áp 230/400V 3 pha 4 dây / ≥ 267 kWm"; OCR mới: "6 Công suất liên tục >300 KVA", "7 Công suất du phon: >330 KVA", "8 Điện áp _ 230/400V, 3 pha—4 diy", "8 … >267 kWm". Mất dấu vài chỗ, đúng số liệu.

## Rủi ro và quay lui
- OCR trang rác tốn thêm ~25 s/trang (OSD + OCR lại); chỉ trang có độ đọc < 0,5. Scan lớn nhiều trang xoay sẽ chậm hơn, vẫn chạy trong khung `OCR_PAR`.
- Nhóm 3: tải tối đa 4 tệp thay vì dừng, có thể OCR nhiều tệp lớn của gói không phải tổ máy (tốn thời gian, không hại dữ liệu).
- zip: gói zip lớn (như 2 gói VTTB) giờ được OCR thay vì bỏ qua ngay; cân nhắc.
- Quay lui: chép lại `.bak-20261110-specsfix` đè lên tệp thật (không cần restart; `genbid-sync.js` được gọi theo từng lượt).

## Chưa kiểm được
- Chưa ghi `analysis/<K>` thật; cần duyệt rồi chạy `--key` thật cho: IB2500140418, IB2300094137, IB2300018261, IB2200069185, IB2500049415, IB2500331496, IB2200060447, IB2400169259, IB2200060256, IB2500143599 (có thông số), và 4 gói "none" mới có lý do thật (IB2300295227, IB2400095607, IB2600547578, và các gói nhóm 3). Cần xoá mục `.genbid-specs.json` của các gói này trước khi chạy.
- 3 gói đối chứng chọn tệp chưa chạy hết (nêu trên).

## Bổ sung sau duyệt có điều kiện (10/11 tối)
1. Chốt chặn OSD trong `ocr-pdf.js`: tối đa 60 lần thử/tệp, thôi thử khi 8 lần đầu không xoay được trang nào; stderr thêm `OSD <lần thử> rotated <số trang xoay>`.
2. Đo scan HSMT nhiều trang, 30 trang đầu (`--max 30`), cũ so với mới, đo thật:
   - IB2600587429 "Phan 2. Yeu cau ky thuat..pdf" (68 trang): cũ 195 s, mới 156 s; md5 đầu ra 3e501d47f9 = 3e501d47f9; số trang thử OSD: 0.
   - IB2600595936 Scan_0087697.pdf (34 trang): cũ 153 s, mới 153 s; md5 281e5825a8 = 281e5825a8; OSD 0.
   - IB2600587068 HSMT.pdf (71 trang) 246 s và IB2600594745 E-HSMT.pdf (136 trang) 229 s: chỉ chạy bản mới, OSD 0 (không có dòng OSD).
   - Trong 120 trang scan thật, không trang nào có độ đọc < 0,5, nên chưa có ca "bảng đứng thẳng bị nghi nhầm" để đo thời gian thêm; chặn trên theo thiết kế là 8 lần thử OSD (≈ 8 × 25 s) rồi dừng cho tệp đó. Phần này là suy ra từ thiết kế, không phải đo.
   - Ca scan xoay IB2200069185 chạy lại với chốt chặn: `ROTATE` 5 trang, `OSD 5 rotated 5`; md5 69b49a80e1 = bản trước chốt chặn.
3. Chú thích sai nguồn đã đổi thành mô tả trung tính; không còn chữ `-new` (`grep ocr-pdf-new` = 0). Bản thử đã đổi tên: `genbid-test\ocr-pdf.js` và `genbid-test\genbid-sync.js` chính là bản sẽ lên PR.

## Đề nghị trình tự thay tệp (giảm thời gian bot lệch GitHub)
1. Duyệt cổng A.
2. Tôi tạo worktree, chép đúng 2 tệp mới vào `bot/genbid-hsmt/` (genbid-sync.js, ocr-pdf.js đã đổi tên), mở PR DRAFT, phiên điều phối merge.
3. Ngay sau khi merge: thay 2 tệp thật trong `genbid-hsmt\` bằng đúng bản trong PR, `Backup-GenBidBot.ps1 -Check` xác nhận khớp (tránh mốc Sync 10:10/14:10/18:10; trong `genbid-hsmt\` chỉ có tệp sẽ lên GitHub).
4. Chạy `--key` thật cho danh sách trên, rồi cập nhật `session-log.md`.
