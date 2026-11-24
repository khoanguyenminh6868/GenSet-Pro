# Đầu phát Stamford: tìm tờ hãng cho model NCC ghi mà repo chưa có (24/11/2026)

Lô 1, phiên con trên KhoaMiniPC. Nhánh `stamford-thieu` (worktree `wt-stamford-thieu`), chưa merge.

## 1. Cách làm
- Lấy TSV `dau-phat-chua-co-datasheet.tsv`, lọc hãng Stamford: 195 khoá không tờ (đúng số kiểm kê).
- Danh sách tờ chính hãng: duyệt 100% các trang `https://www.stamford-avk.com/downloads/data-sheets?page=N` (fetch thường, trang công khai, không đăng nhập) → 883 đường dẫn PDF `…/sites/stamfordavk/files/…`. Đối chiếu từng khoá TSV (bỏ ký tự không chữ số, so chuỗi con) với 883 tên tệp và với 74 nguồn hiện có của hồ sơ.
- Lưu bằng `maker-datasheets.mjs stamford-avk-china <url…>` (dùng `pdftotext` xpdf của Git for Windows: bản Poppler trên PATH không có `-table`, phải đặt `C:\Program Files\Git\mingw64\bin` lên đầu PATH) → `merge-specs.mjs stamford-avk-china` → `verify.mjs`.

## 2. Tờ loại (a) — trang hãng stamford-avk.com — đã thêm (nguồn 1069–1074)
| n | Tờ | URL | Khoá NCC khớp |
|---|---|---|---|
| 1069 | HCI 434D/444D – Winding 311 | https://www.stamford-avk.com/sites/stamfordavk/files/HCI4D-311-TD-EN_Rev_A.pdf | HCI4D (1 NCC) khớp đúng tên tệp; **tên trong tờ là "434D/444D"** |
| 1070 | HCI634K – Winding 311 and 312 | https://www.stamford-avk.com/sites/stamfordavk/files/HCI6K-311-312-TD-EN_Rev_A.pdf | HCI6K (1 NCC): tên tệp "HCI6K", tiêu đề tờ "HCI634K" → **lệch, không gộp**, chỉ lưu tờ |
| 1071 | S5L1S-D4 Wdg.311 | …/files/ES10462001_S5L1S-D4-B-W311.pdf | S5L1SD4(440KW) |
| 1072 | S5L1S-E4 Wdg.311 | …/files/ES10462002_S5L1S-E4-B-W311.pdf | S5L1SE4(488KW) |
| 1073 | S5L1S-F4 Wdg.311 | …/files/ES10462003_S5L1S-F4-B-W311.pdf | S5L1SF4(536KW) |
| 1074 | S4L1S-F4 Wdg.311 | …/files/ESA057E452_S4L1S-F4-D-W311.pdf | S4L1SF4(320KW) |

Ghi chú: ở 1071–1074 khoá NCC có "(xxxKW)" gắn sau mã; tôi coi phần trong ngoặc là ghi chú công suất, nhưng khoá catalog vẫn khác tên, nên **chưa gắn** — để điều phối / Khoa quyết. Chỉ lấy winding 311 (cùng kiểu các tờ 1016–1068 đã lưu); các winding khác (06/07/13/14/17/25/26/27/28/311-1P) của cùng model có trên trang hãng, chưa lưu.

## 3. Model lệch tên (KHÔNG gộp theo suy luận)
- Đuôi "1": UCI274E1, UCI274F1, UCI274C1, UCI274D1, UCI274G1, UCI274H1, UCI224F1, UCI224G1, UCI224E1, UCDI274J1, UCDI274K1, HCI544C1/D1/E1/F1/FS1, PI734C1/D1/E1/ES1, S1L2J1 (40 lần, 9 NCC). Trang hãng không có tên có đuôi "1"; tờ cùng gốc đã có trong repo (vd UCI274E-311 = 1011, S1L2-J-E-W311 = 1055). Đuôi "1" có thể là mã winding / đời, không biết: để nguyên.
- "41": S5L1DD41, S5L1DG41, S4L1SD41, S4LIDF41 (có "I" thay "1"): hãng ghi "S5L1D-D4…"; không gộp.
- HCI544C/D/E/F: tờ 1009–1010, 1049–1050 ghi "HCI534D/544D" (đã có); khoá NCC "HCI544D1" là đuôi "1".
- Khoá ngắn không tiền tố (164B/C/D, 184E/G, 224D/E/F/G): không phải tên đầy đủ (thiếu UC / BC / BS / UCI…), không tìm theo khoá này.
- "(kW)" trong ngoặc: UCI274C(80KW), UCI274D(96KW), UCI224E/F/G(48/58/68KW), UCDI274J/K(184/200KW), S4L1D…, S6L1D…, S7L1D…(KW): tờ cùng model đã có (1002, 1003, 1013, 1014, 1016–1033, 1040–1041, 1015) hoặc nằm ở mục 2 — tên khoá catalog có "(…KW)", không gộp.
- P126TI, P086TI, P126T I-II: trùng khoá với mã động cơ (Perkins), không phải đầu phát Stamford. LVI634D/E/F/G, PI734…: xem mục 4.
- SY-A 274C…314F (1 NCC, nhiều dòng): không rõ có phải Stamford (tiền tố "SY-A"); không có trên trang hãng → không tìm.

## 4. Không tìm được tờ trên trang hãng / bản hãng đăng lại
- LVI634D/E/F/G (4–6 NCC, 15 lần cho G): trang hãng không có "LVI634" (chỉ có LVSI804, đã lưu); tìm web không ra tờ hãng. Chưa xác nhận.
- BC164D, BS164B/C/D, BS184E/G/H, BS224E, BS274C/D/F, UC224C/F: không có trên trang hãng (tiền tố BC/BS/UC224 không có).
- HCI444FS, UCI274ES, PI734ES (tên có đuôi "S"/"FS"): không có tên đó trên trang hãng.
- S1L2-J1: không có. Mới chỉ thấy bản Scribd (không phải nguồn hãng) cho S1L2-Y1 / R1, không dùng.
- Còn lại trong 195 khoá chưa duyệt từng khoá (lô 1 dừng): các khoá ≤ 2 lần ghi, S6L1D/S7L1D(kW) (tờ có sẵn trong 1021–1033, 1058).

## 5. Mục (c): một nguồn internet ghi thông số
Chưa làm: không có mục nào đủ điều kiện (tìm thấy toàn bản Scribd / trang bên thứ ba chép lại, không có LVI634 / BC / BS). Không đưa gì vào hồ sơ.

## 6. Số liệu
- Nguồn tờ hãng của hồ sơ `stamford-avk-china`: 1001–1068 (68 tờ) → 1001–1074 (74 tờ), +6.
- Số model có tờ / có bảng định mức (kiểm kê gốc: 85 có tờ + bảng, 45 có tờ chưa bảng, 195 không tờ): **chưa tính lại** (không chạy lại script kiểm kê, không Sync). `ratings.mjs` chưa chắc đọc được dòng định mức của HCI 434D/444D, HCI634K, S5L1S, S4L1S-F4: chưa đo.
- `node suppliers/verify.mjs`: 436 bản ghi, 0 lỗi.
- `node --test suppliers/*.test.mjs`: 1726 / 1726 đạt.

## 7. Chưa làm
Duyệt từng khoá còn lại; winding khác của các model; tìm bản hãng đăng lại (loại b) cho LVI634 / BC / BS; quyết định có gộp tên "(kW)" và đuôi "1".
