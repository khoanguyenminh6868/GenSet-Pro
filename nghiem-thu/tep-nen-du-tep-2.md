# Nghiệm thu: tệp nén không còn im lặng khi OCR lỗi + trang khổ rất lớn (lần 2, 20/11/2026)

PR (draft, chưa merge, chưa chép sang `genbid-hsmt\`): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/975 (commit 3d1d59fe)

## Tệp đổi
`bot/genbid-hsmt/genbid-sync.js`, `sync-pure.js` (`ocrFailNote`), `ocr-pdf.js` (3 tệp cần chép), `bot/test/ocr-big-page.test.mjs` (mới).

## Thay đổi
1. `ocrText`: OCR thoát lỗi (vd "libpng error: Read Error") và pdftotext cũng ≤ 40 ký tự chữ → `readNote(tên tệp con, "OCR lỗi (<lỗi ngắn>), chưa đọc")`. Tên là tên đầy đủ trong tệp nén (như `unreadList`).
2. `archiveText`: tệp con ra 0 chữ mà không phải scan chờ OCR (Publish) và chưa có ghi chú nào của chính nó → `readNote(tên, "không ra chữ")`. Không trùng với ghi chú đã có.
3. `ocr-pdf.js`: nguyên nhân thật chưa tái hiện từng bước, nhưng đo được: native Tesseract ở 250 dpi trả rỗng cho e46 (trang 4915 x 2326 pt = 138 triệu điểm ảnh) rồi nhánh PNG của tesseract.js chết "libpng error". Các bản vẽ khác cùng zip tới 170 triệu điểm ảnh đọc được ở 250 dpi, nên KHÔNG hạ dpi trước (không đổi gì cho trang đang đọc được). Chỉ khi native ra rỗng: đo khổ trang bằng `pdfinfo`, render lại ở dpi sao cho ảnh ≤ 50 triệu điểm ảnh (`renderDpi`, e46 → 150 dpi) và chạy native với giới hạn 20 phút (thay 5 phút). 50 triệu chọn vì đo thật: e46 ở 150 dpi = 49,6 triệu điểm ảnh, native đọc ra 7.628 ký tự (mất ~7 phút khi máy bận).

## Kiểm
```
node --test bot/test/*.test.mjs  → # pass 153  # fail 0   (4 ca mới: renderDpi trang thường / e46 = 150 / biên / khổ lạ, ocrFailNote)
```
Chạy THẬT trên đúng e46 (tệp lấy từ `b.rar` đã tải, không ghi web; bản sao `genbid-test\tep-nen\kit`):
- Trước: `node kit/ocr-pdf.js d46.pdf` → 0 ký tự, thoát lỗi, `libpng error: Read Error`.
- Sau: stderr `DPI 1 150 (lần thứ hai, ảnh nhỏ hơn)`, `OCR 1/1`, **7.628 ký tự** (`d46-after.txt`). Chất lượng là OCR bản vẽ: có chữ thật ("COOLING COUPLING HOUSING OF DIL IN...") lẫn ký tự nhiễu như các bản vẽ khác.
`publish-text` lại hai tệp nén thật (bản mới), so với lần chạy trước PR: IB2500441397 `.rar` 3.466.940 ký tự, 0 needOcr, 0 ghi chú, văn bản giống từng byte (`cmp`); IB2600576655 `.rar` 72.140 ký tự, 44 needOcr, 0 ghi chú, giống từng byte.

## Chưa kiểm được
- Nhánh `readNote` "OCR lỗi" / "không ra chữ" chạy trong luồng thật (`ocr-hsmt`): chưa có tệp lỗi để tái hiện (e46 nay đọc được); chỉ có test đơn vị cho câu chữ (`ocrFailNote`), phần gọi nằm trong `ocrText` / `archiveText` chưa có test tích hợp.
- Chưa đọc lại e46 lên web (không ghi web). Muốn có chữ e46 trên web cần đọc lại IB2600576655 lần nữa (OCR cả 44 bản vẽ > 1 giờ) hoặc nối riêng đoạn e46: quyết định của điều phối.
- Chưa đo thời gian e46 khi máy rảnh.

## Rủi ro + quay lui
Trang native rỗng giờ tốn thêm tới 20 phút một lần cho lần thử hai (chỉ khi lần đầu rỗng; trang trắng thật cũng rơi vào nhánh này nếu có kích thước lớn: thêm tối đa một lần render + native). Quay lui: revert PR.
