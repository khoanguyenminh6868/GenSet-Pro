# DSE Operator Manual — nghiệm thu (24/11/2026)

**DỮ LIỆU NÀY CHƯA VÀO GIT** (và không được vào: tài liệu phải đăng nhập mới tải được, repo đang public). Toàn bộ nằm ở
`C:\Projects\GenSet Pro\genbid-work\dse-datasheets\manuals\` (ngoài git). Không sửa repo, không commit. Các tệp giữ nguyên, không xoá
(bản gốc PDF cũng còn trong `C:\Users\Khoa\Downloads\`, tên theo DSE).

## 1. Tải
Dùng Browser 2 (Edge trên máy này) đã đăng nhập, điều hướng tới `.../downloads/operators-manual/<id>`; mỗi tệp một lần, cách 6 s. Cả 9 sổ tay tải được, cỡ tệp khớp kiểm fetch trước đó.

| Tệp | Model phủ | id | Bytes |
|---|---|---|---|
| DSE3110-operator-manual.pdf | DSE3110 | 31 | 1.186.008 |
| DSE4520-MKII-operator-manual.pdf | DSE4520 MKII (sổ tay chung DSE4510 MKII) | 908 | 3.232.977 |
| DSE6020-MKII-operator-manual.pdf | DSE6020 MKII (sổ tay "DSE60xx MKII") | 29 | 2.622.422 |
| DSE6110-MKIII-operator-manual.pdf | DSE6110 MKIII + DSE6120 MKIII | 1103 | 5.319.796 |
| DSE7310-MKII-operator-manual.pdf | DSE7310 MKII + DSE7320 MKII | 855 | 5.063.678 |
| DSE7410-MKII-operator-manual.pdf | DSE7410 MKII + DSE7420 MKII | 962 | 6.287.649 |
| DSE8610-MKII-operator-manual.pdf | DSE8610 MKII | 892 | 4.639.700 |
| DSE8660-MKII-operator-manual.pdf | DSE8660 MKII | 1454 | 3.929.586 |
| DSE8680-operator-manual.pdf | DSE8680 | 93 | 1.414.030 |

Model trong `controllers[]`: 12 bộ điều khiển (3110, 4520 MKII, 6020 MKII, 6110/6120 MKIII, 7310/7320 MKII, 7410/7420 MKII, 8610 MKII, 8660 MKII, 8680) → 9 sổ tay, không model nào thiếu. DSE8003 MKII (màn hình, không phải bộ điều khiển) bỏ qua. URL trang + URL tệp + ngày + cỡ: `manuals\urls.tsv`. Chữ: `manuals\<MODEL>.txt` (`pdftotext -layout -enc UTF-8`).

### Đọc hết, không cắt (Khoa 24/11/2026)
`.txt` là toàn bộ `pdftotext -layout` của cả PDF, số trang PDF = số dấu ngắt trang trong txt (khớp từng tệp); bộ trích `protections-extract.js` quét mọi dòng của mỗi txt, không giới hạn dòng. Không có bước nào cắt bớt.

| Sổ tay | Trang PDF | Dòng txt | Bytes txt |
|---|---|---|---|
| DSE3110 | 56 | 2.582 | 119.629 |
| DSE4520-MKII | 142 | 6.509 | 315.697 |
| DSE6020-MKII | 154 | 6.625 | 216.086 |
| DSE6110-MKIII | 148 | 6.766 | 331.925 |
| DSE7310-MKII | 209 | 9.581 | 452.472 |
| DSE7410-MKII | 236 | 10.740 | 495.879 |
| DSE8610-MKII | 246 | 11.213 | 529.782 |
| DSE8660-MKII | 186 | 8.130 | 372.560 |
| DSE8680 | 72 | 3.222 | 105.424 |

## 2. Trích danh mục bảo vệ — `protections.json`
`node protections-extract.js` → `protections.json`; `node verify-quotes.js` → **1093 mục, 0 sai** (mọi `quote`/`lines` có nguyên văn đúng dòng `line` trong txt; mã thoát 0).
Mỗi mục: `name`, `class` (warning / trip / shutdown theo mục sổ tay), `section`, `quote` (dòng đầu NGUYÊN VĂN), `lines` (mọi dòng cột tên), `page` (trang PDF), `line` (dòng trong txt).

| Model | Mục | warning | trip | shutdown |
|---|---|---|---|---|
| DSE3110 | 16 | 5 | 1 | 10 |
| DSE4520 MKII | 107 | 32 | 26 | 49 |
| DSE6020 MKII | 58 | 23 | 6 | 29 |
| DSE6110 MKIII | 143 | 57 | 28 | 58 |
| DSE7310 MKII | 202 | 77 | 49 | 76 |
| DSE7410 MKII | 214 | 88 | 49 | 77 |
| DSE8610 MKII | 200 | 71 | 59 | 70 |
| DSE8660 MKII | 135 | 78 | 57 | — (không có mục Shutdown trong sổ tay) |
| DSE8680 | 18 | 8 | 10 | — (không có) |

### GIỚI HẠN — đọc trước khi dùng số mục
- Bảng trong PDF 2 cột (Fault | Description); chữ trích theo cột "Fault". **407/1093 mục (`multi:true`) là cụm nhiều dòng liền nhau trong cột tên: có thể là một tên xuống dòng HOẶC nhiều tên sát nhau bị dính** (vd 3110: "High Coolant Temperature Under Speed Over Speed" là 3 tên). Vì vậy **"số mục" ≠ số bảo vệ thật**, nhất là 3110 / 6110 / 7xxx / 86xx (nhiều chú thích IEEE C37.2 trong cột tên). Muốn đếm chính xác cần tách tay hoặc đọc PDF.
- 7 mục `straddle:true`: tên dài chạm ranh giới cột, có thể cụt chữ cuối.
- Sổ tay 3110/4520/6020 ghi lỗi theo icon + tên; 7xxx/8610 kèm mã IEEE C37.2 trong tên (giữ nguyên, không bỏ).
- Một số lỗi là "tuỳ chọn / phụ thuộc cấu hình" (ghi chú "Due to module configuration…", cờ cấu hình) nằm ở cột mô tả, chưa trích; `class` chỉ theo tiêu đề mục.

## 3. Bảo vệ xuất hiện ở nhiều model nhất (đề xuất trường cho bộ trường chuẩn)
Đếm khái niệm bằng regex trên `name` (`concepts.js` → `concepts.md`; tên sổ tay khác nhau giữa dòng, vd "Low Oil Pressure" / "Oil Pressure Low", nên là bước gộp, không phải nguyên văn). Số liệu là cận dưới vì mục dính (xem trên).

Có ở 8/9 model (mọi model có ắc quy cảnh báo): **điện áp ắc quy thấp**, **điện áp ắc quy cao** (đều ở dạng warning).
Có ở 7/9 (mọi bộ điều khiển động cơ: 3110, 4520, 6020, 6110, 7310, 7410, 8610): **áp suất dầu thấp, quá tốc, thiếu tốc, không khởi động được, không dừng được, dừng khẩn cấp, thấp áp máy phát, quá/thiếu tần số máy phát, mức nhiên liệu thấp, lỗi sạc/charge alternator, lỗi ECU**.
Có ở 6/9: quá áp máy phát, quá dòng, quá tải kW, đến hạn bảo dưỡng (4520 trở lên, không có ở 3110).
Có ở 5/9: nhiệt độ nước làm mát cao (3110, 6110, 7310, 7410, 8610), ngắn mạch, mất tín hiệu tốc độ Mag-PU, không hoà đồng bộ, không đóng/mở máy cắt.
Có ở 4/9: công suất ngược, mất kích từ, thứ tự pha nghịch/mất cân bằng (chỉ 7310/7410/8610 + 4520 mục "unbalance").
Có ở 3/9: chạm đất (7310, 7410, 8610).

Nhận xét cho điều phối:
- **Lõi cho "bộ trường bảo vệ" (có ở mọi dòng 3110 → 8610):** áp suất dầu thấp, nhiệt độ nước cao, quá tốc, thiếu tốc, không khởi động, không dừng, dừng khẩn cấp, điện áp/tần số máy phát cao/thấp, nhiên liệu thấp, lỗi sạc, ắc quy cao/thấp. Chỗ "nhiệt độ nước cao" chỉ đếm 5/9 vì 4520/6020 ghi "Coolant Temperature Sensor Open Circuit" (đứt cảm biến) trong phần trích, chưa thấy mục nước cao riêng — cần đọc tay PDF trước khi kết luận máy đó không có.
- **Nhóm điện/hoà đồng bộ (chỉ dòng 7xxx/86xx):** quá dòng, công suất ngược, mất kích từ, chạm đất, thứ tự pha nghịch, ngắn mạch, không hoà đồng bộ/đóng/mở máy cắt.
- DSE8660 MKII và DSE8680 là module hoà/bus-tie, không có bảo vệ động cơ (áp suất dầu, tốc độ…) — chỉ bảo vệ bus/hoà đồng bộ/ắc quy.
- DSE3110 ít nhất (≈16 cụm, nhiều cụm dính): chỉ bảo vệ cơ bản; tên "Generator Under/Over Voltage/Frequency" dính vào cụm.
- Mục kiểu "Charger ID 0 to 3 …", "2130/2131/2133 ID … Input" là của module mở rộng, không phải bảo vệ của bộ điều khiển.

## 4. Còn lại / việc đề xuất
- Tách tên dính (đọc PDF các cụm `multi`) trước khi dùng số đếm làm dữ liệu chuẩn; hoặc chỉ dùng danh sách khái niệm ở mục 3.
- Chưa so với `deep-sea-electronics.json`; chưa đưa gì lên web.
- `manuals\receive.js` là script phụ (máy chủ nhận tệp 127.0.0.1) đã thử không dùng được với Browser 1; tiến trình đã tắt, giữ tệp. `agg.txt` là kết quả đếm tên đơn dòng (không dùng).
