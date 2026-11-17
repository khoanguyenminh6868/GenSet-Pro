# Soát ngưỡng HSMT đợt 3: giảm mục "thiếu" (17/11/2026)

Brief: `dau-vao/soat-nguong-thieu-brief.md`. PR DRAFT (chưa merge, chưa chép sang bot): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/850
Nhánh `soat-thieu`, worktree `C:\Projects\GenSet Pro\wt-soat-thieu` (từ `origin/main` ae0559d0; main chưa có commit mới lúc gửi).
Chỉ sửa `suppliers/config-bot.mjs` (`engineLists` + hàm mới `inlineCyl`, `powerRead` + hàm mới `fuelFigures`) và thêm `suppliers/mins-thieu.test.mjs`.
Không đụng `originOfHsmt`, `candidates`, `originChecks`, `hintsOf` (vùng của phiên `noi-san-xuat`).

## Lệnh và đầu ra thật
Phân tích chụp cố định trước khi đo (phiên khác có thể ghi đè giữa chừng): bản chép `doc-cache\analysis.json` → `analysis.json` tạm, dùng cho cả trước và sau.
```
node suppliers\hints-audit.mjs --texts "C:\Projects\GenSet Pro\genbid-work\specs" --analysis <bản chụp> --out <tệp>
trước (origin/main): SUMMARY: 1499 gói, 1243 có Phân tích; lệch 9, thiếu 664; gói có lệch: 9
sau  (PR #850):      SUMMARY: 1499 gói, 1243 có Phân tích; lệch 9, thiếu 274; gói có lệch: 8
```
Danh sách sau: `soat-nguong-3-sau.json` (cùng thư mục).

| | Trước | Sau |
|---|---|---|
| Thiếu maxFuel (100%) | 238 | 97 |
| Thiếu maxFuel75 | 144 | 71 |
| Thiếu maxFuel50 | 98 | 57 |
| Thiếu minCyl | 184 | 49 |
| **Thiếu tổng** | **664** | **274** |
| **Lệch** | **9** | **9** |

`node --test suppliers/`: 918 pass, 0 fail (trước 905 + 13 ca mới). `node suppliers/quality.mjs --check`: "không chỉ số nào xấu đi quá ngưỡng".

### Lệch sau (9) — không ca nào do code đọc sai
Ra khỏi danh sách: IB2400487460 (≥3 và ≥4 của hai cỡ: code giờ null, đúng), IB2300230061 (4 và 6 của hai cỡ: null, đúng).
Thêm vào:
- IB2400313213 maxFuel: "Ở 25% tải < 118 lit/h và ở 100% <486 lit/h". Code 118 @25%, 486 @100% (đúng); Phân tích xếp 118 vào 100%. **Phân tích sai.**
- IB2400265203 maxFuel75: gói 2 cỡ (40 kW và 80 kW). Code đọc "≤ 23 l/h (tại 80 kW)" / "ở tải 100% định mức" và "≤ 17 l/h (tại 60kW)" / "75% định mức" đúng của máy 80 kW; hai số 12 / 9 của máy 40 kW không có mức tải. Audit không chia cỡ; bot chạy theo cỡ (`minsForSize`) thì máy 40 kW không lấy 17. **Không sai.**
Còn lại 7 ca cũ (đều Phân tích sai / nhiều cỡ / nhiễu audit, xem `soat-nguong-2.md`).

## So code cũ ↔ mới trên toàn bộ 1.499 chữ HSMT (không chỉ gói có Phân tích)
426 ngưỡng mới đọc ra: maxFuel 159, maxFuel75 77, maxFuel50 41, minCyl 149 (95 gói có `cylExact` = số chính xác).
14 ngưỡng thành null (maxFuel 2, maxFuel75 4, minCyl 8): xem từng gói đều là gói nhiều cỡ mà code mới thấy thêm số của cỡ kia
(vd IB2300120176: 4,5 / 3,5 L/h của máy nhỏ và 10,7 / 8 L/h của máy lớn; trước đây lấy 8 cho mọi cỡ). Hướng an toàn (bỏ lọc, không loại nhầm).

### Bảng MẤT (main đọc ra, nhánh null khi gọi `hintsOf` không chia cỡ) — điều phối hỏi 17/11
Cả 14 mục thuộc 12 gói đều là **gói nhiều cỡ máy** (`sizesOf` trên chữ HSMT ra 2–7 cỡ). Không chia cỡ, main chỉ thấy số của
MỘT cỡ và áp cho mọi cỡ; nhánh đọc thêm số của cỡ khác nên các số khác nhau → null (đúng luật "nhiều cỡ không gán được thì
không đọc"). Bot chạy gói nhiều cỡ bằng `hintsOf(text, "", {size, sizes})` → `minsForSize` theo từng khối. So từng cỡ
(`hintsOf` có sizing + `plausible`), nhánh **bằng hoặc hơn** main ở mọi cỡ, không cỡ nào mất số:

| Gói | Main, không chia cỡ | Dòng HSMT gây khác | Main theo cỡ | Nhánh theo cỡ |
|---|---|---|---|---|
| IB2500039578 | minCyl 6 | "Số xy lanh ≥6" (500 kVA) và "2 Động cơ" / "4 thì, 16 xilanh xếp hình chữ V" (2.250 kVA) | 500: 6 · 2250: – | 500: 6 · 2250: **16** |
| IB2500114642 | minCyl 6, **cylExact** (áp cả máy 8,3 kVA!) | "-Loại động cơ 4 thì, 1 xylanh" (8,3 kVA) và "- Số xylanh: 6" (250 kVA) | 8,3: – · 250: 6 (exact) | 8,3: **1** · 250: 6 |
| IB2500280002 | minCyl 2 | "6 ≥ 3 thẳng hàng" (một cỡ) và "7 Số xy lanh ≥2" (cỡ kia) | 11: – · 15: – | 11: – · 15: – |
| IB2600490227 | minCyl 2 | bảng hiệu chỉnh: 10 kVA "2 xi lanh" → "≥ 2 xi lanh"; 50 kVA "6 xi lanh" → "4 xi lanh" | 10: 2 | 10: 2 |
| IB2400186078 | minCyl 1, maxFuel 4.2, maxFuel75 3.2 | "≥ 1 xy lanh" của máy nhỏ, khối máy 12 kVA "≥ 4"; tiêu hao từng cỡ | 19 kW: 4.2/3.2, còn lại – | 6 kVA: **2.6/2** · 12 kVA: **4 xl, 4.2/3.2** · 19 kW: 4.2/3.2 |
| IB2300120176 | maxFuel75 8 | 4,5 / 3,5 L/h (máy nhỏ) và 10,7 / 8 L/h (40 kVA) | 40: 4 xl, 75%: 8 | 40: 4 xl, **100%: 10.7**, 75%: 8 |
| IB2400218348 | maxFuel75 42.6 | 7,9 / 5,7 L/h (30 kVA) và 56,9 / 42,6 L/h (250 kVA) | 30: 7.9 · 250: 56.9/42.6 | 30: 7.9/**5.7** · 250: 56.9/42.6 |
| IB2500410768 | maxFuel 28.3 | 7,5 / 28,3 / 43,1 L/h của 30 / 100 / 200 kVA | 30: 7.5 · 100: 28.3 · 200: 43.1 | như main |
| IB2300230061, IB2400145438, IB2400313681, IB2400487460 | (điều phối đã cho phép) | hai cỡ / xe nâng cùng gói: 150 & 136 kVA; 7 & 12 kVA; 30 & 42 kVA ("> 4 thẳng hàng" và ">6"); 8,8 & 40 kVA ("≥ 3" và "≥ 4") | | |

Kết luận: không phải hồi quy, không sửa code (nếu sửa cho main "có số" lại thì là áp số một cỡ cho cỡ kia, như IB2500114642
từng loại mọi động cơ ≠ 6 xi lanh cho cả máy 8,3 kVA). Lệnh: `scratchpad\persize.mjs <gói...>` (hintsOf main ↔ nhánh, có / không chia cỡ).

### Đọc sai mới theo cỡ: IB2400313681 (điều phối báo 17/11, đã sửa — commit dd9c42c2)
Cỡ 30 kVA nhánh ra minCyl 6 từ dòng OCR "5 | S6 xy lanh, kiểu b tri > 4 thắng hàng" ("S6" = "Số" hỏng; ngưỡng thật > 4) → sẽ loại nhầm động cơ 4 xi lanh.
Sửa `inlineCyl`: số dính chữ cái phía trước không là số xi lanh; dòng có "> N / ≥ N thẳng hàng / chữ V" thì không đọc số trơ giữa câu
(ngưỡng có dấu đã do luật nhãn đọc). Test: ca "S6 xy lanh" + "6 xilanh ... tỷ số nén ≥ 17: 1" vẫn ra 6. Sau sửa: 30 kVA trống (như main), 42 kVA 4 xi lanh.

Quét toàn kho THEO CỠ (`hintsOf` không chia cỡ + từng cỡ của `sizesOf`), mọi minCyl nhánh ra mà dòng nguồn có số dính chữ trước "xy lanh" hoặc
"N xy lanh" cùng dòng với dấu so sánh và số khác (script `scan-glued.mjs`, scratchpad phiên này):
| Gói | Cỡ | minCyl | Dấu hiệu | Dòng | Đánh giá |
|---|---|---|---|---|---|
| IB2400313681 | 30 kVA | 6 (trước sửa) | số dính chữ + "> 4" | "5 / S6 xy lanh, kiểu b tri > 4 thắng hàng" | **sai → đã sửa (nay trống)** |
| IB2400285076 | cả gói | 6 (tối thiểu) | "≥ 17" cùng dòng | "Động cơ: 6 xilanh, bố trí thẳng hàng, tỷ số nén ≥ 17: 1" | đúng (17 là tỷ số nén) |
| IB2300108940 | cả gói, 10 kVA | 2 | "30/10" cùng dòng (dòng webform dài) | "…ĐỘNG CƠ…Loại4 thì, giải nhiệt quạt gióSố xy lanh 2 xi lanhTổng dung tích xy lanh≥ 674 cc…" | đúng |
Sau sửa còn 2 mục, cả hai đúng. Đo lại: thiếu 274, lệch 9 (không đổi); `node --test suppliers/` 919 pass, 0 fail. Nhánh đã gộp `origin/main` (#851; force-push sau rebase bị chặn nên dùng merge, squash khi merge PR không khác).

## Soi tay (ngẫu nhiên, nguyên văn HSMT)
58 mục mới đọc, chọn ngẫu nhiên 3 lượt (26 mọi loại, 14 xi lanh, 18 xi lanh sau sửa). **Sai: 1 trước sửa, 0 sau sửa.**
Ca sai (đã sửa, có test): IB2300015080 "Số lượng xi lanh của" / "2 ≥ 16 (*)" → code đọc 2 (số thứ tự hàng); nay 16 (tối thiểu).
Một số mục đã soi (giá trị code đọc ← dòng HSMT):
| Gói | Code | Dòng HSMT |
|---|---|---|
| IB2300269124 | maxFuel 180 | "+ Mức tiêu thụ nhiên liệu chế độ 100% công suất:" / "<=180 lit/h" |
| IB2300239791 | maxFuel 14 | "Mức tiêu thụ nhiên" / "< 14 L/h" / "liệu tại 100% tải" |
| IB2300285618 | maxFuel75 47 | "- Tiêu hao nhiên liệu:" / "+ 75% tải: 47 l/h," |
| IB2400607862 | maxFuel 8.76 | "Tiêu hao nhiên liệu (100% CS): 8.76Lít/ Giờ" |
| IB2400313681 | maxFuel 11 | "Mức tiêu thụ nhiên liệu < 11 lit/gio tai (100 %) tai dinh mức" |
| IB2500291421 | maxFuel 81.8 | "- Tiêu thụ nhiên liệu ( 100% tải): 81.8 L/h" |
| IB2600064878 | maxFuel75 3.6 | "16 máy phát điện ở ≤ 3,6 l/h (tại 9 kW)" (9/12 kW = 75%); câu "Ví dụ ... là 3,6 l/h" không đọc |
| IB2200052323 | maxFuel75 2.9 | "Tiêu thụ nhiên liệu mức" / "15 ≤ 2,9 L/h" / "75% tải liên tục" |
| IB2300356137 | maxFuel75 14.5 | "7 Tiêu hao nhiên liệu" / "< 14.5 L/h ở 75% tải" |
| IB2400533611 | maxFuel 135 | "Tiêu hao nhiên liệu ở L/h ≤ 135" / "mức100%tải" |
| IB2500448140 | maxFuel75 60 | "Mức tiêu hao nhiên liệu / < 60 lít/giờ tại 75% tai;" |
| IB2300178837 | maxFuel 3 | "9 Mức tiêu thụ nhiên liêu ≤ 3 lít/h" |
| IB2200043097 | maxFuel 4 / 75: 3.1 | "15 ≤ 4,0 L/h" / "100% tải liên tục"; "16 ≤ 3,1 L/h" / "75% tải liên tục" |
| IB2400453053 | 94 / 71 / 50 | "Tại 100% tải ≤ 94 lít/h" / "Tại 75% tải ≤ 71 lít/h" / "Tại 50% tải ≤ 50 lít/h" |
| IB2600118095 | maxFuel 3.9 | "- Tiêu hao nhiên liệu: 3.9 L/h" |
| IB2300147640 | minCyl 6 (chính xác) | "Số xi lanh: 6L" |
| IB2400497572 | minCyl 3 (tối thiểu) | "Số xy lanh, kiểu bố trí" / "≥ 3 thẳng hàng." |
| IB2600325773 | minCyl 20 (chính xác) | "- Loại 4kỳ, 20 xy lanh, hình chữ V" |
| IB2400367420 | minCyl 6 (chính xác) | "- Số xy-lanh 6 xy lanh, xếp thẳng" |
| IB2500364714 | minCyl 6 (chính xác) | "Động cơ Diesel 4 chu kỳ, 6 xi lanh thẳng hàng, có Tuabin tăng áp" |
| IB2400577658 | minCyl 6 (chính xác) | "Số xy-lanh / Bố trí: 06 xy lanh xếp thắng hàng" |
| IB2600308125 | minCyl 6 (tối thiểu) | "Diesel, 4 kỳ, ≥ 6 xi-lanh, phun nhiên liệu điện tử" |
| IB2300134577 | minCyl 3 (tối thiểu) | "4 Số xilanh, dung tích ≥3 CB Kiểm tra tài liệu của hãng" |
| IB2400474549 | minCyl 2 (tối thiểu) | "Loại động cơ: 4 thì 2 xi lanh" / "* Hàng hóa tương tự để nhà thầu tham khảo" (tham khảo → không là số chính xác) |

## Dạng dòng HSMT của mục thiếu (trước → sau, số gói)
Phân loại tự động bằng regex trên dòng chứa số Phân tích ghi, gần đúng (một dòng chỉ vào một dạng đầu tiên khớp).
| Loại | Dạng | Gói trước | Gói còn thiếu | Ví dụ (nguyên văn) |
|---|---|---|---|---|
| xi lanh | C2 "N xi lanh" giữa câu tả động cơ | 102 | 14 | IB2200005266 "Động cơ Diesel 4 thì, 1 xi lanh, phun nhiên liệu"; IB2200012854 "- Động cơ 4 thì, 4 xylanh, phun nhiên liệu trực tiếp" |
| tiêu hao | F6 số không dấu có nhãn | 102 | 49 | IB2200018828 "Suất tiêu hao nhiên liệu tại 100% tải: 161 lít/giờ"; IB2300027083 "Tiêu hao nhiên liệu (100% CS): 15,66 L/h" |
| tiêu hao | F3 dấu "<" | 62 | 21 | IB2200015404 "10 tải 100% định mức <5.5 lít/giờ"; IB2400440994 "22 Tiêu hao nhiên liệu tại 100% tải <5.4 lít/ giờ" |
| tiêu hao | khác (OCR hỏng, bảng nhiều cỡ, nhãn lạ) | 36 | 22 | IB2400043110 "Suất tiêu hao dầu tối đa 22 35 59 88,5 104,5 140 (lít/giờ)" (nhiều cỡ) |
| xi lanh | C1 nhãn + "≥ N thẳng hàng" dòng dưới | 35 | 3 | IB2300048642 "Số xy lanh, kiểu bố trí" / "≥ 3 thẳng hàng"; IB2200062073 "Số xilanh , bố trí" / "≥ 4, thẳng hàng" |
| tiêu hao | F2 khoảng / ~ / ≥ (cố ý không đọc) | 31 | 16 | IB2200043601 "khoảng 13 đến 15L/h"; IB2300083662 "+ Mức 100% tải ~ 42.1 lít/giờ" |
| tiêu hao | không thấy dòng (Phân tích lấy chỗ khác / OCR) | 29 | 17 | IB2200022333, IB2300048778 |
| xi lanh | C3 nhãn biến thể / bị gộp dòng trên | 22 | 8 | IB2200029877 "8 Số xilanh ≥ 4" (dưới "7 Tỉ số nén ≤ 19"); "Số xy-lanh 6 xy lanh"; "Số xi lanh: 6L" |
| tiêu hao | F5 mức tải ở dòng dưới số | 21 | 5 | IB2200052323 "Tiêu thụ nhiên liệu mức" / "14 ≤ 3,5 L/h" / "100% tải liên tục" |
| tiêu hao | F1 có ± (cố ý không đọc) | 19 | 15 | IB2400493077 "≤ 21±2 lít/giờ"; IB2600278676 "(≤19,4 lít/h ±5%)" |
| xi lanh | khác (OCR hỏng, nhiều cỡ) | 17 | 14 | IB2200029975 bảng lệch hàng; "S6 xi lanh >3 Bat bu6c" (OCR) |
| tiêu hao | F4 đơn vị trước số | 14 | 5 | IB2400533611 "Tiêu hao nhiên liệu ở L/h ≤ 135" / "mức100%tải"; IB2400588970 "(lít/giờ) ≤ 320" |
| xi lanh | C4 "≤ N" / "< N" (tối đa, cố ý không đọc) | 5 | 5 | IB2200004914 "Số xy lanh: ≤ 6" |
| xi lanh | không thấy dòng | 3 | 3 | IB2300023194, IB2400085846 |

## Dạng còn bỏ (vì sao)
- **Có dung sai ±** ("≤ 21±2 lít/giờ", "≤19,4 lít/h ±5%"): HSMT cho phép cao hơn số ghi; đọc số ghi sẽ loại nhầm. Trước đây `lowest()` còn biến 21±2 thành ngưỡng **19** (chặt hơn HSMT): đã sửa, đọc tiêu hao trên chữ chưa trừ dung sai. Phân tích nhiều gói này ghi sai (2 / 0,5 L/h = chính phần dung sai).
- **"khoảng", "~", "≈", "từ … đến"**: số gần đúng, không phải giới hạn.
- **"≥ N L/h"** cho tiêu hao (HSMT viết nhầm dấu): không biết ý HSMT.
- **Số xi lanh "≤ N" / "< N"**: là trần, không phải tối thiểu; code không có ngưỡng trần số xi lanh (Phân tích đọc thành 6).
- **Gói nhiều cỡ trong một dòng / bảng** ("22 35 59 88,5 104,5 140 (lít/giờ)", "12 kiểu V hoặc 6 / thẳng hàng", "6 or 8- or 12-cylinder"): không gán được cỡ.
- **OCR hỏng** ("Tieu hao nhien lieu ... < 69 lit/gia", "lí/giờ", "LíUgiờ", "S6 xi lanh"): đơn vị / nhãn sai chữ, đọc dễ nhầm số.
- **Số trơ một mình dưới nhãn** ("Số xilanh:" / "4" / "Đạt", "Tiêu hao nhiên liệu tối đa (lít/giờ)" / "1.65"): số một mình thường là số thứ tự hàng sau; không đọc (quy tắc cũ).
- **Đơn vị gãy dòng** ("Tiêu hao nhiên liệu 100% tải: 40" / "lít/h"; "≤ 80 lít" / "/h"): ít gói, để lại.
- **Mức tải ghi kiểu "% 100 PRP"**, "@100 tải": không nhận mức → số không có mức tải, chỉ dùng khi cả gói không ghi mức nào.

## Rủi ro
- **Số xi lanh trơ giữa câu là số chính xác** ("Động cơ 4 thì, 6 xy lanh, thẳng hàng" → `cylExact`, `candidates` loại động cơ có số xi lanh khác khi mọi nguồn ghi số khác). Đây là luật đã có (Khoa: "HSMT ghi rõ 6 thì nên loại 12") cho dòng bắt đầu bằng "6 xi lanh"; nay áp cả giữa câu: 95 gói mới có `cylExact`. Chặn: "hoặc"/"or", động cơ xuồng/tàu/xe, "tối thiều" (OCR), hàng hoá "tham khảo / tương tự" (→ tối thiểu). Gói mô tả "hàng tham khảo" theo cách khác vẫn có thể bị coi là chính xác.
- **Số tiêu hao không dấu là mức tối đa** ("Tiêu hao nhiên liệu (100% CS): 17.7 L/h"): như Phân tích; dòng ứng viên vượt số này bị loại. `plausible()` vẫn bỏ số không hợp cỡ máy.
- **Mức tải ở dòng dưới số**: chỉ khi dòng của số không ghi mức, dòng dưới không có số tiêu hao khác; mức của hàng trên (trước nhãn) bị bỏ; hai bên khác nhau thì số đó không có mức dùng được.
- Chưa đo ảnh hưởng lên top ứng viên thật của các gói (chưa chạy `check` lại); regress `regress-config` / `regress-bidprice` vẫn xanh.

## Quay lui
Revert PR #850 (một commit, chỉ `config-bot.mjs` + tệp test mới). Chưa chép sang bot nên bot không bị ảnh hưởng tới khi merge + `update-bot`.
