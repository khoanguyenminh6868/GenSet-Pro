# Hai việc nhỏ máy KhoaMiniPC (24/11/2026)

## (A) "tự động khi mất lưới (AMF) theo datasheet hãng;" ở IB2600603983 — KHÔNG phải lỗi lặp, không sửa code, không ghi web

- Chuỗi có hai lần nằm ở một chỗ duy nhất: `result.configs[7].controller.altLine` (doc `configmatch/IB2600603983`).
- Nội dung: "Phương án khác đạt tương đương: DSE7320 MKII + DSE890 MKII (…; tự động khi mất lưới (AMF) theo datasheet hãng; truyền thông …); DSE7420 MKII + DSE890 MKII (…; tự động khi mất lưới (AMF) theo datasheet hãng; truyền thông …)".
- Sinh ra bởi `altLineOf` (`suppliers/ctl-module.mjs:411`), gọi MỘT lần cho mỗi cấu hình ở `ctlAlternatives` (`config-bot.mjs:3407`, đầu hàm đã `delete c.controller.altLine`). Mỗi PHƯƠNG ÁN thêm `${KIND_VI[a.kind]} theo datasheet hãng; `: có hai phương án khác nhau (DSE7320 và DSE7420), cả hai đều loại AMF ⇒ hai câu giống chữ nhưng nói về hai bộ khác nhau. Không có đường nối lần hai (khác lỗi BMS ở `commWords`); chạy lại `check` cũng xoá rồi dựng lại, không cộng dồn.
- Bỏ một câu sẽ làm phương án thứ hai mất thông tin loại AMF, nên KHÔNG mở rộng `dedupe-notes.mjs`. Quét `dedupe-notes.mjs` (chỉ đọc) toàn bộ: IB2600603983 cho 0 lặp.
- Không tạo worktree / PR (đã tạo `wt-amf-lap` rồi xoá, không commit gì). Nguyên nhân "lặp" ở báo cáo mk-lap-3 là quét chung mọi câu > 25 ký tự lặp trong một chuỗi: bắt cả các phần tử hợp lệ như câu này.

## (B) IB2500441397 và IB2600576655 — chữ HSMT đã đủ tệp (đã đọc lại từ 20/11), không phải đọc lại

- `hsmt/IB2500441397.updatedAt` = 2026-11-20T01:52Z, `hsmt/IB2600576655.updatedAt` = 2026-11-20T07:44Z (sau #960). Nên hai gói đã được đọc lại bằng code mới, doc web phản ánh chuyện đó.
- Kiểm (số tệp trong tệp nén ↔ số tệp có đề mục trong `hsmttext` ghép lại):
  - IB2500441397: tải `hsmt-IB2500441397/01.rar` về thư mục tạm của phiên (đúng tệp web, 20 855 112 byte), giải nén bằng UnRAR: 42 tệp (+ 1 thư mục). Chữ trên web có 42 đề mục tệp trong tệp nén (+1 đề mục tệp rar) ⇒ so tên từng tệp: 0 thiếu. (Thiếu 12 trước đây = 42 − trần 30.)
  - IB2600576655: tệp nén `…Yeu cau ky thuat.rar` có zip lồng (Bản vẽ gói 6) + `Chương V…docx`. `publish-text` chạy lại bằng code hiện tại: 44 tệp chờ OCR + 6 tệp có chữ; chữ web có đủ 44/44 tên tệp chờ OCR (đã OCR, `ocr: 46` trang) + 4 tệp (e19, e38, e43, e5) + Chương V = 53 đề mục. Không thiếu tệp nào.
- Không có `analysis/<TBMT>` nào cho hai gói (1305 doc analysis, không có khoá này; không có `analysisreq` chờ): gói điện lưới / thuỷ điện, không phải máy phát điện nên chưa từng Phân tích. Vì vậy không xếp Phân tích lại.
- Không đổi code bot, không chạy `publish`, không bật / tắt tác vụ. Chỉ đọc web, tải 1 tệp rar từ release của repo, chạy `publish-text` ra thư mục tạm của phiên.

## Còn lại
- Không có PR nào được mở. Không ghi gì lên web.
