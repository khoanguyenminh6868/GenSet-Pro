# Nghiệm thu: đọc lại 6 tệp thiếu chữ trên web (lần 2, 19–20/11/2026)

Không PR, không sửa code. Khoa cho phép ghi web cho các gói chứa 6 tệp (19/11). Chạy lần lượt từng gói từ `C:\Projects\GenSet Pro\genbid-hsmt\`:

```
node genbid-sync.js ocr-hsmt --key <K>     (K lần lượt: IB2600587068, IB2600599817, IB2600599032, IB2600591659, IB2600576655, IB2500441397)
```
Bản ghi `hsmt` trước (chỉ đọc) và sau, log từng gói, chữ mới: `C:\Projects\GenSet Pro\genbid-work\ocr-6-tep\` (`truoc-*.json`, `sau-*.json`, `chay-*.log`, `txt-*.json`). Bot "GenBid Bot" chạy suốt, không có node / Word / trình duyệt của bot đang làm gói nào; không dừng gì.

## Đường tải có token
Lượt chạy thật đầu tiên: `ocrHsmt` tải `/_gh` bằng token, **tải được cả 5 gói chạy xong, không có dòng "Không tải được" / HTTP 401** (log `chay-*.log`).

## Bảng 6 tệp (trước → sau)

| Gói | Tệp | hasText | Ký tự (không kể trắng) | OCR | Ghi chú |
|---|---|---|---|---|---|
| IB2600587068 | 13a_E-HSMT.doc | false → **true** | 108.575 | 0 | Word |
| IB2600599817 | Mục 3, Chương III - Tiêu chuẩn dánh giá HSDT.doc | false → **true** | 10.917 | 0 | Word |
| IB2600599032 | CHUONG V.rar | false → **true** | 109.178 | 0 | |
| IB2600591659 | Tài liệu gói số 7.rar | false → **true** | 499.644 | 371 trang (5 PDF scan) | nhiều chữ Trung/Anh, ít dấu tiếng Việt (754) |
| IB2600576655 | 2026102161235697_Yeu cau ky thuat.rar | false → **true** | 136.680 | 29 trang (29 bản vẽ PDF 1 trang) | zip lồng 48 tệp, chỉ đọc 30 đầu (có ghi trong log) |
| IB2500441397 | 0.2 Tiêu chuẩn VTTB B CAP - 8.10.2025.rar | false → **false (không đổi)** | đọc được ở máy, KHÔNG ghi được | | **LỖI** xem dưới |

Cả 5 tệp đã ghi: không còn `ocrTried`, không có `readNote` (không có ghi chú lỗi).

### Lỗi: IB2500441397
`ocrHsmt` đọc được chữ (42 tệp, đọc 30 đầu, ~3,4 triệu ký tự) nhưng ghi lên web **HTTP 413 FUNCTION_PAYLOAD_TOO_LARGE** (`genbid-sync.js:1478`: gửi mọi chunk `hsmttext` + `hsmt` trong MỘT yêu cầu `post`). Không ghi gì (hsmt vẫn `hasText:false`, không `ocrTried`, `textChunks` 0). Không thử lại, không sửa code theo brief. Cần một PR sửa `ocrHsmt` ghi theo lô nhỏ (hoặc giới hạn chữ mỗi tệp). Gói này nên làm ở PR riêng rồi đọc lại.

## Khác biệt ngoài 6 tệp
- **Tệp khác của cùng gói: không đổi** (hasText, ocr, ocrTried so khớp từng tệp trong `truoc` / `sau`): IB2600576655 (docx, pdf), IB2600587068 (HSMT.pdf 71 trang, QD_HSMT.pdf 2 trang), IB2600591659 (2 docx, 1 pdf), IB2600599817 (docx, pdf).
- **Ngoại lệ:** `CHUONG III.zip` (gói IB2600599032) không nằm trong 6 tệp nhưng cùng gói, đang `hasText:false` chưa thử → `ocrHsmt` đọc luôn (hasText false → **true**, 9.722 ký tự). Lệnh sẵn có không cho giới hạn theo tên tệp. Chữ thêm vào, không mất gì.
- Chữ cũ của gói (`hsmttext`) không lưu trước khi chạy (brief chỉ yêu cầu bản ghi `hsmt`), nên không so được chữ cũ từng byte; `ocrHsmt` chỉ nối thêm chữ mới sau chữ cũ. `textChunks`: IB2600576655 1→2, IB2600587068 1→2, IB2600591659 2→5, IB2600599032 0→2, IB2600599817 1→1.

## Đối chiếu chữ mới (không rác?)
Không có ký tự lỗi U+FFFD ở tệp nào.
- `13a_E-HSMT.doc`: mở đầu "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM … HỒ SƠ MỜI THẦU (E-HSMT)", giữa tệp là điều khoản liên danh: tiếng Việt đúng.
- `Mục 3, Chương III … .doc`: "Chương III. TIÊU CHUẨN ĐÁNH GIÁ E-HSDT Mục 3. Tiêu chuẩn đánh giá về kỹ thuật…", giữa tệp có mục bảo hành: đúng.
- `CHUONG V.rar`: "Cam kết đặt máy Miễn dịch- SH.docx … MẪU D CỘNG HÒA XÃ HỘI…", bảng "Tiêu chí chi tiết cơ bản": đúng (khớp kết luận lần 1: 3 docx, 2 xlsx).
- Chữ OCR scan (kém sạch hơn): `Tài liệu gói số 7.rar` có chữ Trung + Anh của tài liệu tuabin Dongfang (đúng nguồn); `…Yeu cau ky thuat.rar` là OCR bản vẽ kỹ thuật, đoạn giữa có chữ Anh đúng ("STEAM ADMISSION BOX FOR HEATING…") lẫn ký tự nhiễu do khung bản vẽ. Hạn chế của OCR bản vẽ, không phải lỗi tải.
- Tên mục trong `CHUONG III.zip` mất dấu ("e0-CDT. HNG DN THC HIN.docx": tên tệp trong zip mã hoá cũ), nội dung bên trong đúng tiếng Việt.

## Gói Phân tích đã chạy trước trên chữ thiếu (nên Phân tích lại, tôi không chạy)
- **IB2600587068**: Phân tích xong 23/10/2026 (`done`, hsmt-worker), trước khi có 108.575 ký tự E-HSMT.
- **IB2600599817**: Phân tích xong 04/11/2026, trước khi có Mục 3 Chương III (tiêu chuẩn đánh giá).
- IB2600576655, IB2600591659, IB2600599032, IB2500441397: chưa có Phân tích.

## Việc còn lại
1. IB2500441397: sửa `ocrHsmt` ghi theo lô (PR riêng), rồi chạy lại `ocr-hsmt --key IB2500441397`.
2. Khoa quyết Phân tích lại IB2600587068, IB2600599817 (và các gói còn lại nếu cần).
3. Bẫy: lời nhắc "tải `/_gh` bằng Invoke-WebRequest" vẫn thiếu token (nghiệm thu lần 1).
