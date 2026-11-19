# Nghiệm thu: Publish đọc .doc / .xlsx / .rar (lần 1, 19/11/2026)

PR (draft, chưa merge):
- https://github.com/khoanguyenminh6868/GenSet-Pro/pull/946 → `main` (bot)
- https://github.com/khoanguyenminh6868/GenSet-Pro/pull/947 → `hsmt-inbox` (`ingest.py`). Nên merge #947 trước hoặc cùng lúc #946.

## Bước 1: xác minh mô tả trong sổ (đo, không ước tính)

Mô tả "Publish chưa đọc .xlsx/.doc/.rar" đúng một nửa:
- `Publish-GenBidHsmt.ps1` (`Get-FileText`) chỉ đọc `.pdf` (pdftotext), `.docx`, `.txt`. Action `ingest.py` (nhánh hsmt-inbox) đọc `.pdf .docx .txt .jpg .jpeg .png .tif .tiff`. Cả hai bỏ .doc/.xlsx/.rar không phải vì thiếu công cụ hay cố ý loại, mà vì chưa viết (ingest chạy trên Ubuntu không có Word / unrar).
- Nhưng `genbid-sync.js` (`fileText`, `ocrHsmt`) ĐÃ đọc được cả ba (Word COM cho .doc, `xlsxText`, UnRAR/tar cho tệp nén) và chạy trước Phân tích / Đối chiếu / Tạo HSDT, ghi chữ bù lên web. Bot sandbox đọc .doc bằng antiword qua đúng đường này (`platform.js` `wordTextLinux`), không phải đường Publish.
- **Lỗi thật phát hiện thêm:** từ PR #593 (12/11, "/_gh cần đăng nhập") `ocrHsmt` tải tệp `fetch(/_gh/<id>)` không gửi token → HTTP 401 → `continue`, không đánh dấu `ocrTried`, không log ra tệp log chung. Từ 12/11 không có .doc/.rar/.xlsx/scan mới nào được đọc bù. Kiểm: `curl https://genset-pro-web.vercel.app/_gh/709547521` → `401`; có token → tải được (cả 238 tệp bên dưới tải bằng token, 0 lỗi HTTP).

Đếm trên toàn bộ 1551 tài liệu `hsmt` của web (đọc `Get-GenBidRequests.ps1 -Kind docs -Coll hsmt`, chỉ đọc), mọi tệp, không lấy mẫu:

| đuôi | có chữ | không chữ, chưa thử | không chữ, đã thử (ocrTried) |
|---|---|---|---|
| .doc | 89 | 2 | 0 |
| .rar | 138 (+1 OCR) | 4 | 0 |
| .xlsx | 4 (đều do lệnh specs) | 0 | 0 |
| .xls | 0 tệp | | |
| (tham khảo) .zip | 7 | 2 | 6 |

Danh sách đủ các tệp ba loại đang không có chữ trên web (6):
- IB2500441397 `0.2 Tiêu chuẩn VTTB B CAP - 8.10.2025.rar` (20,9 MB)
- IB2600576655 `2026102161235697_Yeu cau ky thuat.rar` (29,1 MB)
- IB2600587068 `13a_E-HSMT.doc`
- IB2600591659 `Tài liệu gói số 7.rar` (16,5 MB)
- IB2600599032 `CHUONG V.rar`
- IB2600599817 `Mục 3, Chương III - Tiêu chuẩn dánh giá HSDT.doc`

Log máy (`genbid-bot-logs`) chỉ có 2 dòng `Đọc được chữ` cho ba loại này; các lượt Phân tích ghi log ở chỗ khác nên không đếm được số lần 401 từ log.

## Bước 2: thay đổi (PR #946, #947)

Tệp đổi (#946): `bot/genbid-hsmt/genbid-sync.js`, `sync-pure.js`, `Publish-GenBidHsmt.ps1`, `README.md`, `bot/test/archive-read.test.mjs` (mới), `bot/test/Publish-GenBidHsmt.Tests.ps1`. (#947): `ingest.py`.

- `ocrHsmt` gửi `Authorization: Bearer <token ingest>` khi tải `/_gh` (chỉ khi URL cùng host với web).
- Lệnh `node genbid-sync.js publish-text --file F --name N --out O` → `O.txt` (chữ) + `O.json` (`chars`, `needOcr`, `notes`). Cùng `fileText` nhưng không OCR: PDF chỉ pdftotext, PDF scan / hỏng font / ảnh bên trong tệp nén → `needOcr`. Chữ không nằm trong JSON vì `ConvertFrom-Json` của PowerShell 5.1 dừng ở 2 MB (một tệp thật cho 3,4 triệu ký tự).
- Publish: `.doc .rtf .xlsx .zip .rar .7z` → `publish-text`. `needOcr` khác rỗng → để trống cả tệp (hasText false) cho Phân tích OCR cả tệp như cũ (không có chữ trùng lặp). Lý do → `files[].readNote`. `-NoInbox` (lệnh specs) không gọi node vì specs tự đọc rồi ghi đè.
- `archiveText`: liệt kê trước (`unrar lt -p-` / `tar -tvf`); > 500 mục, > 1 GB giải nén, hay mục có `..` / đường dẫn tuyệt đối → không giải nén, ghi lý do. Sau giải nén bỏ liên kết và mọi thứ có realpath ngoài thư mục. Tối đa 30 tệp (như cũ), lồng 2 lớp (như cũ, giờ có ghi chú). Mật khẩu (UnRAR mã 11, tar "Passphrase/Encrypted"), tệp hỏng (UnRAR mã 1/2/3, tar lỗi) → ghi lý do, vẫn đọc phần giải nén được. Word mở .doc kèm mật khẩu giả → tệp có mật khẩu lỗi ngay (6 s) thay vì treo hộp thoại ẩn tới 180 s.
- `ocrHsmt`: tệp thử không ra chữ thì ghi `readNote` cạnh `ocrTried`.
- `ingest.py` (#947): web đã có đúng các asset của lần đăng này (cùng asset id) và có `textChunks` → chỉ đánh dấu hsmtreq xong, không ghi lại hsmt/hsmttext; kiểm lại ngay trước khi ghi. Chạy tay (KEYS) ghi lại như cũ.

Không cần phần mềm mới: Windows dùng Word + `C:\Program Files\WinRAR\UnRAR.exe` (đã có trên KHOAMINIPC; `Install-GenBidBot.ps1` đã kiểm WinRAR), sandbox dùng antiword + unrar (đã có trong `bot/sandbox/setup-sandbox.sh`). Nên không sửa `Install-GenBidBot.ps1` / `SETUP-CLAUDE.md`.

## Lệnh kiểm + đầu ra thật

```
node --test bot/test/*.test.mjs          → # pass 137  # fail 0   (7 ca mới trong archive-read.test.mjs)
for f in bot/genbid-hsmt/*.js; node --check → không lỗi
Invoke-Pester bot/test/Publish-GenBidHsmt.Tests.ps1 (Windows PowerShell 5.1, Pester 5)  → PASSED 30 FAILED 0
```
CI của PR (test-bot, test-bot-ps) chưa xem kết quả lúc viết.

Ca biên (tự tạo, scratchpad, `node kit/genbid-sync.js publish-text`):
```
ok.rar       {"chars":163,"needOcr":[],"notes":[]}
pw-head.rar  {"chars":0,"notes":["pw-head.rar: có mật khẩu"]}            (mã hoá cả tên tệp)
pw-file.rar  {"chars":0,"notes":["pw-file.rar: có mật khẩu"]}
broken.rar   {"chars":80,"notes":["broken.rar: tệp nén có lỗi (hỏng hoặc thiếu một phần), đọc 1 tệp giải nén được"]}  (cắt còn 200 byte)
lvl2.rar     {"chars":175,"notes":[]}                                    (rar trong rar)
lvl3.rar     {"chars":0,"notes":["lvl3.rar/lvl2.rar/ok.rar: tệp nén lồng quá 2 lớp, không đọc"]}
trav.zip     {"chars":0,"notes":["trav.zip: có mục đường dẫn ra ngoài thư mục (../evil.txt), không giải nén"]}
plain.doc    {"chars":45}   pw.doc {"chars":0,"notes":["pw.doc: Word không mở được (tệp hỏng, có mật khẩu, hoặc máy không có Word)"]} (6 s)
```
Gọi thật từ Windows PowerShell 5.1 (`genbid-test\pub-dxr\ps-harness.ps1`, nạp `Get-FileText`/`Get-NodeText` của Publish) với tệp tên `Yêu cầu kỹ thuật (bản thử).doc` → 45 ký tự, chữ đúng dấu.

## Bước 3: thử trên TẤT CẢ tệp ba loại (genbid-test\pub-dxr)

`node run.js`: tải 238 tệp (2,2 GB) bằng token, chạy `publish-text` bản mới từng tệp. Kết quả đủ từng tệp (số ký tự, needOcr, ghi chú, giây): `C:\Projects\GenSet Pro\genbid-test\pub-dxr\results.tsv`; chữ đọc được: `...\pub-dxr\out\`.

| | Publish cũ | Publish mới |
|---|---|---|
| .doc (91) | 0 có chữ | **91** có chữ (248 … 108.575 ký tự) |
| .xlsx (4) | 0 | **4** |
| .rar (143) | 0 | **59** có chữ; 84 để OCR (`needOcr`: 64 tệp nén có PDF scan / bản vẽ bên trong) |
| 6 tệp web đang thiếu chữ | | 2 .doc + 2 .rar có chữ; 2 .rar để OCR (IB2600576655, IB2600591659: bản vẽ / tài liệu PDF scan bên trong) |

- 0 lỗi tải, 0 lỗi chạy, 0 tệp mật khẩu / hỏng trong dữ liệu thật. 7 ghi chú "có N tệp, chỉ đọc 30 tệp đầu" (IB2300270603, IB2500441397, IB2500530402, IB2600203764, IB2600297878, IB2600433407, IB2600576655).
- Tổng thời gian 1.359 s cho 238 tệp (.doc ~6 s/tệp qua Word; rar lớn nhất 30 s). Sau lượt chạy không còn tiến trình WINWORD nào.
- 74 trong 84 .rar để OCR có đọc được một phần chữ nhưng bị bỏ (theo quy tắc cả tệp chờ OCR).

Đối chiếu với nội dung mở bằng đường khác:
1. IB2200012797 `Yeu cau ky thuat (1).doc`: 3 dòng chữ mới đọc đều có trong `hsmttext/IB2200012797_0` trên web (đọc trước đây). Ví dụ "TCVN 6627-9: 2011(IEC 60034-9: 2007) về giới hạn mức ồn."
2. IB2600337362 `2.Phu-luc-2.YCKT-thay-the-may-phat-dien-so-1-DC-HN01-Rev4.6.xlsx`: 3 dòng có trên web, ví dụ "Nhiệt độ tăng cho phép của đầu phát điện | ≥ 125oC | Đạt: Đáp ứng".
3. IB2600599032 `CHUONG V.rar` (web đang thiếu chữ): giải nén tay bằng WinRAR, đọc `document.xml` của 3 tệp .docx bằng .NET (`man-check.ps1`): 6/6 đoạn có trong chữ bot đọc, ví dụ "6. Thuyết minh kế hoạch đào tạo, hướng dẫn sử dụng, vận hành thiết bị"; 2 tệp .xlsx ra 14 "### Sheet".
4. IB2600587068 `13a_E-HSMT.doc` (web thiếu chữ): 108.575 ký tự, cùng đường Word như 89 .doc đã có chữ trên web.

Không đăng lại gì lên web thật.

## Chưa kiểm được
- **Sandbox Ubuntu:** chưa chạy. Cùng mã (`unrar lt` của RARLAB cùng định dạng; bsdtar `-tvf` cùng định dạng; antiword). antiword không phân biệt .doc có mật khẩu → ghi chú chung "không đọc được".
- `ingest.py`: máy không có Python, chưa chạy; cần xem log lượt Action đầu sau khi merge.
- `ocrHsmt` có token: chưa chạy lượt Phân tích thật (không được ghi web); chỉ kiểm tải bằng token trong `run.js`.
- CI của hai PR.

## Rủi ro + quay lui
- Publish lâu hơn: ~6 s mỗi .doc, tới vài chục giây mỗi .rar lớn; trong timeout 120 phút của `ps("Publish-GenBidHsmt.ps1")`. Mỗi lệnh node có timeout riêng (Word 180 s, giải nén 300 s).
- Tệp nén rất lớn cho nhiều chữ (IB2500441397: 3,4 triệu ký tự ~ 18 đoạn hsmttext). Như `ocrHsmt` hiện tại, không mới.
- Nếu #946 vào mà #947 chưa: Action ghi đè chữ .doc/.rar Publish vừa ghi (như trước PR, chỉ phí công).
- Quay lui: revert PR; trên máy chép lại `genbid-sync.js`, `sync-pure.js`, `Publish-GenBidHsmt.ps1` từ `.bak` (sau khi điều phối chép sang `genbid-hsmt\`). Không có dữ liệu web bị đổi.

## Việc cần Khoa / điều phối quyết
1. Duyệt merge #947 rồi #946, chép sang `genbid-hsmt\` (genbid-sync.js, sync-pure.js, Publish-GenBidHsmt.ps1, README.md). Không cần restart bot (mỗi lượt là tiến trình mới).
2. Đọc lại tệp cũ trên web (bước riêng, chưa làm): `node genbid-sync.js ocr-hsmt --key <K>` cho 6 tệp ở trên (sau khi merge, có token mới tải được). Có OCR, ghi web.
3. Tệp nén có PDF scan bên trong (84/143): giữ quy tắc "cả tệp chờ OCR" (hiện tại), hay Publish ghi phần chữ đọc được ngay và Phân tích chỉ OCR phần scan (phải sửa ocrHsmt để thay khối chữ cũ, tránh trùng)?
4. Giới hạn 30 tệp mỗi tệp nén (7 tệp vượt): giữ hay nâng?

## Cần ghi nhớ
- `/_gh/<asset>` cần token ingest (Bearer) từ 12/11/2026; mọi chỗ bot tải tệp HSMT phải gửi token. Còn một chỗ chưa sửa (ngoài phạm vi): lời nhắc trong `genbid-sync.js` (dòng "Tệp tải tay trên web, tải về bằng Invoke-WebRequest") bảo Claude tải `/_gh` không kèm token → sẽ 401.
- Action `ingest.py` sau #947 không ghi đè gói bot đã ghi thẳng cùng asset; chạy tay (KEYS) thì vẫn ghi đè.
