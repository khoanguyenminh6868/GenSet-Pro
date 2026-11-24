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
