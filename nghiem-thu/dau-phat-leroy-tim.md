# Đầu phát Leroy-Somer: tìm tờ hãng cho model NCC ghi mà repo chưa có (24/11/2026)

Nhánh `leroy-thieu` (worktree `wt-leroy-thieu`), hồ sơ `suppliers/cn/leroy-somer-fuzhou.json`. Lô 1 (dừng sớm vì phần lớn thiếu nằm ở họ đời cũ hãng đã gỡ khỏi trang).

## 1. Kết quả: 1 tờ thêm vào repo (loại b)

| Model (khoá NCC → tờ) | Tờ | URL | Loại nguồn | Số nguồn |
|---|---|---|---|---|
| LSA472VS2 (13 lần / 3 NCC), LSA472S5 (10 / 4), LSA472M7 (10 / 4), LSA472S4 (4 / 3), cùng M8, L9 (khoá có đuôi "/…KW", xem mục 3) | LSA 47.2 Low Voltage Alternator 4 pole, 365–600 kVA 50 Hz / 456–750 kVA 60 Hz, "3782 en - 2021.06 / s", 6 khung VS2, S4, S5, M7, M8, L9 | https://www.depco.com/wp-content/uploads/2022/11/Leroy-Somer-LSA-47.2-Data-Sheet.pdf | (b) bản hãng do đại lý Depco đăng, tải công khai không đăng nhập | `leroy-somer-fuzhou` 1021 |

`lsRatings` đọc ra 168 dòng định mức, 6 model "LSA 47.2 VS2 / S4 / S5 / M7 / M8 / L9". Tên "LSA 47.2 …" ↔ khoá NCC "LSA472…" khác nhau chỉ ở dấu cách và dấu chấm (cùng cách `keyOf` chuẩn hoá); chưa gộp gì ngoài đó.

Tiêu đề bảng `specTables` n1021 đặt tay "Datasheet: LSA 47.2 - 365 to 600 kVA …" (dòng có trong tờ). Vì `isCode` chỉ nhận "LSA47.2" viết liền, tiêu đề có dấu cách KHÔNG gắn dòng của tờ vào `modelFacts` (như bảng "LSA Rating Table"); định mức vẫn đọc từ tệp nguồn qua `ratings.mjs`. Gắn `modelFacts` cho LSA 47.2 cần sửa `isCode` hay đổi tiêu đề thành "LSA47.2" (không có trong tờ): chưa làm, chờ điều phối.

## 2. Model không tìm được tờ loại (a) / (b)

| Model (số lần ghi / số NCC) | Họ | Kết quả |
|---|---|---|
| LSA462VL12, LSA462L9 (đều chỉ dạng "…/NNNKW") | LSA 46.2 | Catalogue hãng "3790 en" KHÔNG còn trên leroy-somer.com (`documentation_pdf/3790_en.pdf` trả trang 1,8 KB, không phải PDF). Chỉ có bản chép lại của bên không phải đại lý (SlideShare, abyaran.com) → không đủ loại (b). Xem mục (c) bên dưới. |
| LSA463S2 (1 / 1) | LSA 46.3 | Repo đã có tờ 46.3 (nguồn 1010, `documentation_pdf/5273_en.pdf`) nhưng tờ không ghi "S2" (chưa kiểm khung). Không gộp. |
| LSA502M8 (2 / 1), LSA502M7 (1 / 1), LSA502M6 | LSA 50.2 | Tờ 50.2 hãng đã có (1013, 6 khung M6, L7, L8, VL10 theo `lsRatings`): M7, M8 không có trong tờ. Không có tờ khác của hãng. |
| LSA532M9 (13 / 5, nhiều nhất), LSA542M10, LSA542UL14, LSA54XL75/85 | LSA 53.2 / 54.2 | Hãng KHÔNG có catalogue riêng cho 53.2 / 54.2 trên trang Catalogues (chỉ "rating table LSA" ref 6627 và EPD LSA 54.2). Bảng 6627 đã nằm trong repo từ trước ở nguồn 6003 (không phải bảng `specTables`, nên kiểm kê không tính là "có tờ"); tôi lấy lại 6627 và so: trùng, không thêm. `lsRatings` đọc 6003 ra 0 dòng (định dạng bảng nhiều khối winding khác): việc sửa bộ đọc là việc riêng, chưa làm. Trong 6627 có "LSA 53.2 M7 / M9 / M11 / M12" và "LSA 54.2 M10 / M11 / L14 / UL14 / UL17": khoá "LSA54XL…" của NCC KHÔNG có "XL" trong bảng hãng → lệch tên, không gộp. |
| LSA531UL70/80/85 | "LSA 53.1" | Bảng 6627 không có LSA 53.1 (chỉ 52.3, 53.2, 54.2). Không rõ NCC gõ thiếu hay là họ cũ: lệch tên, không gộp. |
| TALA47F / A / C / D, TALA44F / K …, TALA46B / G … , TALA4973F | TAL-A | Tờ hãng đang có là "TAL-A44", "TAL-A46", "TAL-A473", "TAL-A49" (1003–1006). "TALA47" không phải tên nào của hãng (TAL-A473 có "3"); không gộp theo suy luận. |
| TAL44D, TAL44B | TAL 044 | Tờ TAL 044 đã có (1017, đời mới); khung D/B trong tờ chưa soát. |
| LL7224L, LL7224J | không rõ | Tên không thuộc họ LSA / TAL; không tìm. |
| DPC184…, DPC224…, DPC274…, DPC314…, DPC354…, DPC404… "/TALA4xx" | mã tổ máy + đầu phát | Khoá ghép "mã tổ máy / đầu phát", không phải model đầu phát. Không tìm. |
| LSA40M7 | LSA 40 | Tờ 1007 là LSA 40; "M7" của khung này chưa soát. |

Họ "chưa rõ hãng" mã LSA / TAL (43 model): đều cùng danh sách trên (cột `hang` rỗng chỉ ở LL…, DPC… và vài khoá); không tự gắn hãng.

## 3. Khoá không phải model (không xoá dữ liệu)

- Khoá có đuôi kW dính liền ("LSA472M8/552KW", "LSA542M102736KW" = "LSA542M10" + "2736KW", "LSA54XL75/2440KW"): NCC ghi "model/kW" của tổ máy; phần "NNNKW" không thuộc tên đầu phát. Phần model phía trước tìm ra được trong tờ chỉ cho LSA 47.2 như trên, và phần còn lại chưa có tờ.
- Khoá "DPC…/TALA…": mã tổ máy ghép đầu phát.

## 4. Mục (c): chỉ ghi, KHÔNG đưa vào hồ sơ

Không có mục nào đủ để ghi. Các bản chép lại LSA 46.2 / LSA 47.2 (SlideShare 3790 "10.2004/b", abyaran.com 3790 "2012.11/h" / "06.2007/d") thuộc bên đăng không rõ thân phận. Tôi chưa mở và chưa trích nguyên văn: chưa có URL + câu trích + giá trị nào cho mục (c). LSA 46.2 vẫn "chưa tìm được".

## 5. Số liệu trước → sau

- Model Leroy-Somer có tờ: LSA 47.2 thêm 6 khung (VS2, S4, S5, M7, M8, L9) có tờ + có bảng định mức (168 dòng). Số model Leroy-Somer "không tờ" của kiểm kê: 86 khoá → 13 khoá họ LSA472 (4 khoá sạch + 9 khoá có đuôi "/KW") có tờ nếu tính lại, tức 86 → 73 theo đếm tay từ TSV; chưa chạy lại script kiểm kê.
- Các nguồn 6003 (6627) và 6004 (5706) đã có trong repo, không thêm trùng.

## 6. Kết quả kiểm

- `node suppliers/verify.mjs`: 436 bản ghi, 0 lỗi.
- `node --test suppliers/*.test.mjs` (1.726 ca): 1.726 đạt, 0 lỗi.
- Bẫy công cụ: `maker-datasheets.mjs` / `fetch-source.mjs` cần pdftotext của xpdf (có `-table`), nằm ở `C:\Program Files\Git\mingw64\bin`; trên máy này PATH có poppler đứng trước nên phải đặt Git lên đầu PATH, nếu không `-table` lỗi (maker-datasheets) hoặc rơi về `-layout` (fetch-source, ra khác tờ 1001–1020). Ghi vào `suppliers/CLAUDE.md` chưa làm.

## 7. Chưa làm

- Soát từng khung của LSA 40 / 46.3 / 49.3 / 50.2 / 52.3 / TAL-A với khoá NCC để biết khoá nào thực sự thiếu trong tờ.
- `lsRatings` cho bảng 6627 (LSA 53.2 / 54.2).
- LSA 46.2, 43.x: chờ quyết định nhận nguồn (c) hay nguồn đại lý khác.

# Lô 2 (24/11/2026, nhánh `leroy-thieu-2` từ `leroy-thieu` vì PR #1190 chưa merge; worktree `wt-leroy-thieu-2`)

## 8. Tờ đưa vào repo

| Model | Tờ | URL | Loại | Số nguồn |
|---|---|---|---|---|
| LSA 43.2 (khung S1, S15, S25, S35, M45, L65, L8) ↔ khoá NCC LSA432S1, S15, S25, S35, L65, L8 | "3819 en - 07.2009 / e", LSA 43.2 - 4 Pole, Electrical and mechanical data | https://woodstockpower.com/wp-content/uploads/2023/10/LSA_43.2.pdf | (b) tờ hãng do Woodstock Power đăng (tải công khai). LƯU Ý: Woodstock là nhà mua bán máy phát đã qua sử dụng, danh sách hãng trên site KHÔNG có Leroy-Somer: không phải đại lý của hãng như Depco. Tờ là tài liệu hãng nguyên bản (tiêu đề, mã 3819, tiêu chuẩn IEC 60034 / NEMA MG 1.22). Tôi xếp (b); nếu điều phối không nhận thân phận này thì bỏ nguồn 1022 (chỉ 3 tệp: `sources/leroy-somer-fuzhou/1022.md`, một mục trong `datasheets/` và một mục trong `cn/leroy-somer-fuzhou.json`). | 1022 |

- Tiêu đề bảng sửa tay thành "Datasheet: LSA 43.2 - 4 Pole" (câu có trong tờ; `maker-datasheets.mjs` chọn nhầm câu chuẩn "IEC 60034 …"). Như 47.2, dấu cách làm `isCode` không gắn `modelFacts`.
- `lsRatings` đọc 0 dòng từ 1022 (tờ ghi "43.2 S1 kVA …" không có chữ "LSA" ở đầu dòng). KHÔNG sửa bộ đọc (theo giao việc); đây là việc riêng.
- Khoá LSA432L68 (1 / 1): tờ chỉ có L65, L8: lệch tên, không gộp.

## 9. Không tìm được tờ loại (a) / (b)

| Model (số lần / NCC) | Họ | Kết quả |
|---|---|---|
| LSA493S4 (10 / 4), LSA493S4/528KW, /660KW; LSA493S4A | LSA 49.3 | Tờ hãng 5279 (nguồn 1012) chỉ có M6, M8, L9, L10; hai tờ hãng khác 6194 (LSA 49.3 IC6, 435–660 kVA) và 6199 (IC8) liệt kê L4, L6, L8, L9, L10, L11, không có S4. Không có S4 ở bản nào của hãng. Không gộp với LSA 49.1 S4 (khoá LSA491S4 [2 / 6]) dù cùng "S4". |
| LSA491S4, M6, M65, M75, L10, L11, S4A | LSA 49.1 | Trang hãng LSA 49.1 (moen.nidec.com) liên kết `http://www.leroy-somer.com/en-in/LSA-491_2018-11.pdf`: trả 404 "page no longer available" (kiểm 24/11). Hai tờ kèm là sổ tay AVR (4243, 4531, 4067), không phải tờ đầu phát. Không có bản đăng lại tìm được. |
| LSA40M7 (9 / 3), LSA40VS0 | LSA 40 | Tờ hãng 6242 (nguồn 1007): VS1, VS2, S3, S4, M5; tờ 1 pha 4842 (LSA 40, 10,5–16 kVA) có cùng họ. Không có M7 / VS0 ở tờ nào: lệch tên. |
| LSA462VL12, L9, L6, M5, M3 | LSA 46.2 | Hãng đã gỡ 3790 (lô 1). Chỉ có bản bên thứ ba (mục (c) dưới). |
| LSA442M95, S7, VS45, S75, VS3, L12; LSA432… khác | LSA 44.2 | Chỉ có bản bên thứ ba (mục (c)). |
| LSA512M60, S55, VL85, VL90 | LSA 51.2 | Chỉ có bản bên thứ ba (mục (c)). Bảng ấy có M60, S55, VL90, VL95; không có "VL85". |
| LSA422L9 / M7 | LSA 42.2 | Tờ hãng đang có là LSA 42.3 (1008). Chỉ thấy bản SlideShare "Réf. 2640 GB" (bên thứ ba); chưa mở. Không gộp 42.2 với 42.3. |
| LSA502M8, M7, S4; LSA501VL10 | LSA 50.2 / 50.1 | Tờ 4098 (1013): M6, L7, L8, VL10. Không có M7, M8, S4. Tìm lại 24/11: chỉ có bản Scribd / SlideShare của đúng tờ 4098. LSA501VL10: tờ 50.1 chưa thấy. |
| LSA532M9, M12; LSA542M10, UL14, L14; LSA54XL…; LSA531UL… | LSA 53.2 / 54.2 / 53.1 | Như lô 1 (bảng 6627 ở nguồn 6003; tên "XL", "53.1" không có trong bảng hãng). Không có tờ riêng; trang Catalogues hãng (đọc lại 24/11) chỉ có 6627 và EPD. |
| TALA…, TAL44B/D, TAL473F | TAL / TAL-A | Như lô 1: lệch tên. TAL473F: tờ hãng ghi "TAL 0473 F" (1019) và "TAL-A473-F" (1005); NCC ghi "TAL473F" thiếu "0" hay "-A": không gộp. |
| LL7224*, LL8224*, LL9324* | không rõ | Không phải họ LSA / TAL; không tìm. |

Phát hiện phụ: trang Catalogues hãng có thêm tờ đầu phát CHƯA có trong repo, nhưng không khoá NCC nào trong kiểm kê trỏ tới nên KHÔNG thêm: LSA 44.3 1 pha (5101), LSA 42.3 1 pha (4841), LSA 40 1 pha (4842), LSA 43.3 L7 IC7 (6103), LSA 49.3 IC6 (6194) / IC8 (6199), LSAH 42.3 (5968), LSAH 44.3 (5873), LSAM Marine (4715), 400 Hz (3675), LSPM nước (6619). Đã tải thử (công khai, 24/11) chỉ để đọc tên khung. Nếu điều phối muốn thì lô sau thêm bằng `maker-datasheets.mjs` (nhớ PATH xpdf).

## 10. Mục (c): chỉ ghi, KHÔNG đưa vào hồ sơ (một nguồn cho mỗi họ)

Cả ba là tờ hãng đăng lại bởi abyaran.com (không rõ thân phận): không đủ (b).

- LSA 46.2: https://abyaran.com/public/uploaded_files/LeroySumer%5bvkf%5d.pdf ("3790 en - 06.2007 / d"). Dòng nguyên văn (cột đầu 50 Hz, kVA): "46.2 L9 kVA 280 280 280 215 154 250 250 250 195 142 …" và "46.2 VL12 kVA 315 315 300 260 187 276 276 260 230 170 …", "46.2 L6 kVA 250 250 240 205 141 …", "46.2 M5 kVA 200 200 200 175 116 …". Chưa đọc nhãn cột từng số (không nội suy).
- LSA 44.2: https://abyaran.com/public/uploaded_files/LeroySumer%5bzAt%5d.pdf ("3820 en - 01.2005 / b"). "44.2 M95 kVA 150 150 145 125 94 …", "44.2 L12 kVA 165 165 165 135 102 …", "44.2 S7 kVA 120 125 120 120 73 …", "44.2 S75 kVA 130 135 130 125 83 …", "44.2 VS45 kVA 105 105 105 105 66 …", "44.2 VS3 kVA 90 90 90 90 55 …".
- LSA 51.2: https://abyaran.com/uploaded_files/AtPbv[DSw].pdf (tờ "LSA 51.2 … 1860 to 2500 kVA - 50 Hz / 2235 to 3000 kVA - 60 Hz"). "LSA 51.2 M60 kVA 2050 1864 1870 1700 2155 1975 2255 2050", "LSA 51.2 VL90 kVA 2360 2145 2150 1955 2500 2275 2595 2360".
- LSA 46.2 L9 / VL12 còn có hiệu suất trong bản SlideShare 3790 (https://www.slideshare.net/slideshow/lsa462/7710769): "LSA 46.2 VL12 … 95,7 P.F. : 1"; không dùng.

## 11. Đối chiếu nguồn 6003 (6627_en.pdf): bộ đọc không nhận, 3 dòng mẫu (chép nguyên văn, số dòng của `6003.md`)

```
557:  LSA  53.2  M9             -     C6S/4       Option  6             3  000     2 736         3 150       3  300    3  000     2 736   3 150         3  300    3  000       2  736  3 150       3    300
561:  LSA  54.2  M10            -     C6S/4       Option  6             3  420     3 119         3 591       3  762    3  420     3 119   3 591         3  762    3  420       3  119  3 591       3    762
563:  LSA  54.2  UL14           -     C6TS/4      Option  6             4  320     3 940         4 536       4  752    4  320     3 940   4 536         4  752    3  900       3  557  4 095       4    290
```
Mã dây quấn "C6S/4", "C6TS/4" nằm cùng dòng với tên khung: khoá NCC "LSA523UL16C6S/4" (8 lần / 2 NCC) có đuôi y hệt mã ấy; khoá "LSA542M102736KW" có "2736" là số kW trong dòng 557 / 1020 (kVA 3 000 / kW 2 736). Tôi chỉ ghi sự trùng chữ, không gộp khoá.

## 12. Số liệu trước → sau

- Khoá đầu phát Leroy-Somer NCC ghi mà repo có tờ: thêm 6 khoá họ LSA 43.2 (LSA432S1, S15, S25, S35, L65, L8; cả 6 đều thuộc nhóm "chưa rõ hãng" của kiểm kê, không gắn hãng). Model có tờ hãng trong repo: 47.2 (6 khung, lô 1) + 43.2 (7 khung) = 13 khung thêm sau PR #1190 trở lại đây. Chưa chạy lại script kiểm kê (đếm tay từ TSV).
- `verify.mjs`: 436 bản ghi, 0 lỗi. `node --test suppliers/*.test.mjs`: 1.726 ca, 1.726 đạt, 0 lỗi (PATH xpdf đứng đầu; chạy qua Bash vì PowerShell không mở rộng `*`).
- Bẫy pdftotext: kiểm lại 24/11: cùng PDF, poppler `-table` thoát mã 99 (chỉ in phiên bản), xpdf của Git thoát 0. Đã ghi vào `suppliers/CLAUDE.md` (mục "Bẫy cào / gộp").
