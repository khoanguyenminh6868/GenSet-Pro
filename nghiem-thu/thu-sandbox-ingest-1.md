# Nghiệm thu: chạy thử đường đọc tệp trên Sandbox + ingest.py (lần 1, 20/11/2026)

Không PR, không sửa code, không ghi web, không đụng bot Windows và sandbox `genbid-bot` (đang `stopped`, giữ nguyên snapshot `snap_0aiWBWL7lFdcjF4eC4XkuXGrZJeg`).
Cách thử ít xâm lấn: tạo sandbox TẠM từ đúng snapshot đó (`genbid-probe-tmp`, vùng sin1, không persistent), chạy xong xoá. Sau đó sandbox tạm thứ hai `genbid-probe-py` (image universal, có Python) cho `ingest.py`, cũng đã xoá. Mã chạy = main `79e9b175` (đã có #946 #947).

## A. Sandbox Ubuntu (image `vercel/sandbox/ubuntu@sha256:e8adf419…`)

### Công cụ có trong snapshot
`command -v`: antiword `/usr/bin/antiword` OK; **catdoc MISSING** (không cần, antiword đủ); `unrar` `/usr/local/bin/unrar` (UNRAR 7.23 RARLAB) OK; `7z`/`7za` OK; `bsdtar` 3.8.5 OK; `unzip`, `pdftotext`, `tesseract`, `node`, `pwsh`, `wine` OK. Tessdata: hệ thống chỉ `eng osd`, nhưng bot dùng `~/genset-pro/.genbid-tessdata-best/{eng,osd,vie}.traineddata` (có đủ). Word không có trên Ubuntu: `.doc` đọc qua `antiword -m UTF-8.txt` (`platform.js` `wordTextLinux`).

### Đường đọc: `node genbid-sync.js publish-text --file F --name N --out O` (đúng lệnh Publish gọi)
Tệp thật tải từ release công khai. Kết quả (đầu ra thật, mỗi tệp < 1 s):

| Tệp | Sandbox | Windows (nghiệm thu lần 1, cùng tệp) |
|---|---|---|
| `.xlsx` IB2600337362/02.xlsx | 7766 ký tự, needOcr [] | **7766** (bằng nhau) |
| `.rar` IB2600599032/02.rar (CHUONG V) | 109178 ký tự, needOcr [] | **109178** (bằng nhau) |
| `.zip` IB2600599032/01.zip | 9757 | (lần 2: 9.722 không kể trắng, khớp) |
| `.doc` IB2200012797/02.doc | 12245 ký tự; chữ+số 9608, 3015 từ | Word: chữ+số 9603, 3012 từ (khác ~5 ký tự) |
| `.doc` IB2600599817/03.doc | 12726 ký tự, đầu tệp "Chương III. TIÊU CHUẨN ĐÁNH GIÁ E-HSDT Mục 3…", không U+FFFD | Windows 10.917 không kể trắng |

Khác biệt `.doc` chỉ do antiword in khung bảng bằng `|` (1815 / 1989 dấu `|`) nên số "ký tự" lớn hơn; nội dung chữ khớp Word. Dấu tiếng Việt đúng.

Ca biên (tự tạo trong sandbox bằng 7z / python / cắt tệp):
```
broken.rar (cắt 100000 byte) {"chars":10708,"notes":["broken.rar: tệp nén hỏng (sai CRC), đọc 2 tệp giải nén được"]}
ok.7z                        {"chars":28,"notes":[]}
pw.7z (mã hoá tên tệp)       {"chars":0,"notes":["pw.7z: có mật khẩu"]}
trav.zip (../evil.txt)       {"chars":0,"notes":["trav.zip: có mục đường dẫn ra ngoài thư mục (../evil.txt), không giải nén"]}  (không có /tmp/evil.txt)
lvl2.zip (rar trong zip)     {"chars":109190}
lvl3.zip                     {"chars":0,"notes":["lvl3.zip/lvl2b.zip/lvl2.zip: tệp nén lồng quá 2 lớp, không đọc"]}
pw.zip (AES-256, mã hoá nội dung) {"chars":32,"notes":["pw.zip: có mật khẩu, đọc 1 tệp giải nén được"]}   ← LỖI NHỎ, xem dưới
t.tgz                        {"chars":0,"notes":[]}   (đuôi .tgz không nằm trong danh sách Publish: .doc .rtf .xlsx .zip .rar .7z; không phải lỗi)
```

### Lỗi tìm thấy
**ZIP mã hoá AES (nội dung)**: `bsdtar -tvf` liệt kê bình thường (`a.txt`, 21 byte), `bsdtar -x` không giải mã được và ghi 21 byte NUL; mã coi là "đọc được 1 tệp" → `hsmttext` có 21 ký tự NUL (`--- a.txt ---\n^@^@…`), ghi chú "có mật khẩu, đọc 1 tệp giải nén được" gây hiểu nhầm. Chưa gặp trong 143 .rar / 7 .zip thật (không có tệp mật khẩu nào). Windows dùng cùng `tar.exe` (bsdtar) nên nhiều khả năng giống. Đề xuất (không sửa): sau giải nén bỏ tệp toàn byte NUL / không đếm chữ nếu > 90% là NUL, hoặc dùng `7z l -slt` kiểm `Encrypted = +` trước.

### Kết luận A: ĐẠT
Mọi công cụ cần có trong image; đường .doc / .xlsx / .rar / .zip / .7z chạy được, kết quả khớp Windows. Không cần cài thêm gì. Chưa thử: lượt Phân tích / OCR đầy đủ trên sandbox (ngoài phạm vi; OCR có tessdata vie), antiword với .doc có mật khẩu (gộp ghi chú chung).

## B. ingest.py (nhánh `hsmt-inbox`, workflow `hsmt inbox`)

### Đọc
Workflow chạy khi push đụng `inbox/**` hoặc `workflow_dispatch` (nhập `keys` → biến `KEYS`). Mã ở `hsmt-inbox:ingest.py` (sha `6275fb62…`, #947 = commit `2a194318`). Cần secrets `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`; `.doc/.rar` không nằm trong `TEXT_EXT` nên ingest không tải / đọc chúng.

### Chạy cục bộ cùng đầu vào (máy Windows không có Python → chạy trong sandbox tạm với Python 3.14.4)
Đầu vào: `ingest.py` đúng commit #947 + `inbox/IB2600599032/release.json` thật (CHUONG III.zip + CHUONG V.rar); Supabase thay bằng máy chủ giả trong tiến trình (không có khoá thật, không ghi web). 5 kịch bản, đầu ra thật:

| # | Trạng thái web giả | Kết quả |
|---|---|---|
| 1 | hsmt có đúng 2 asset + `textChunks:2` (bot đã ghi), push thường | `already on the web from the bot (2 files), text kept`; chỉ ghi `hsmtreq`; `hsmt` giữ nguyên (dấu `BOT` còn, hasText true, textChunks 2). **Đạt mục đích #947** |
| 2 | web chưa có gì | ghi `hsmt` mới: 2 tệp `hasText:false`, 0 chunk (hành vi cũ, đúng thiết kế) |
| 3 | như 1 nhưng `KEYS` đặt (chạy tay) | **GHI ĐÈ**: hasText true → false, textChunks 2 → 0 |
| 4 | web có asset khác | ghi đè (đúng) |
| 5 | đúng asset nhưng thiếu `textChunks` | ghi đè (đúng) |

### Chạy thật trên Action
**CHƯA chạy**, lý do:
- `workflow_dispatch` với `keys` luôn đặt `KEYS` → kịch bản 3: GHI ĐÈ chữ .doc/.rar bot đã ghi. Không dùng được để thử "không ghi đè".
- Cách duy nhất thử đúng đường #947 là push một commit đụng `inbox/<gói đã có>` lên `hsmt-inbox` (ví dụ sửa `release.json` giữ nguyên nội dung nhưng khác byte): sẽ ghi `hsmtreq/<gói>.doneAt` trên web thật và thêm commit vào nhánh. Không bị chặn vì hạn mức (các lượt `hsmt inbox` 17–19/11 đều `success`, 21–34 s), nhưng đây là ghi lên web + repo: xin điều phối / Khoa duyệt gói nào. Đề xuất: IB2600599032 (hsmt có textChunks sau lần 2) hoặc IB2600587068; kỳ vọng log `already on the web from the bot (N files), text kept`, `hsmt` không đổi.
- Lượt Action 19/11 03:11 (IB2600609524, trước #947) thành công; chưa có lượt nào sau #947 (merge 19/11 18:51 +0700) vì chưa có gói mới đẩy lên `hsmt-inbox` (commit gần nhất vẫn 19/11 10:11).

### Kết luận B: logic ĐẠT trên máy chủ giả; lượt Action thật chưa thử (chờ duyệt, hoặc đợi gói mới tự chạy và xem log).
Lưu ý: nếu Publish chưa ghi xong `hsmt` lúc Action chạy (Action chạy trước), kịch bản 2 vẫn xảy ra, rồi Publish ghi đè sau (như trước). Thứ tự bình thường: Publish ghi web rồi push inbox.

## Thiếu / đề xuất
- Không thiếu gói, quyền hay token nào cho A. B cần quyền push `hsmt-inbox` + duyệt ghi `hsmtreq` để thử Action thật.
- Đề xuất sửa nhỏ (chưa mở PR): lọc tệp toàn NUL sau giải nén (ZIP AES).
- Bẫy cũ còn đó: lời nhắc "tải /_gh bằng Invoke-WebRequest" thiếu token (nghiệm thu publish-doc-xlsx-rar-1).

## Dọn
Hai sandbox tạm đã xoá (`genbid-probe-tmp`, `genbid-probe-py`); `genbid-bot` không bị khởi động. Không tệp nào trong repo / `genbid-hsmt\` bị đổi.

## Cần ghi nhớ
- Thử sandbox không cần tắt bot Windows: tạo sandbox tạm từ snapshot `genbid-bot` (phải đúng vùng `sin1`, `persistent:false`), chạy lệnh qua Vercel MCP, rồi `delete_sandbox`.
- `KEYS` (chạy tay) của `ingest.py` luôn ghi đè; chỉ push thường mới được bảo vệ bởi #947.
