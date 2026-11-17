# Soát ngưỡng HSMT toàn kho (việc 4, 17/11/2026)

Lệnh: `node suppliers\hints-audit.mjs --texts genbid-work\specs` → `soat-nguong.json` (trước), `soat-nguong-sau.json` (sau sửa).
1.499 gói, 1.243 có Phân tích. **Trước: lệch 16 (15 gói), thiếu 669. Sau: lệch 9, thiếu 664.** (đo thật)

## LỆCH (16)

| Gói | Dòng HSMT (nguyên văn) | Code đọc | Phân tích đọc | Bên sai |
|---|---|---|---|---|
| IB2300204857 | "≤ 34 Lít/ giờ với mức 75% tải (chế độ vận hành liên tục)" | maxFuel 34 (100%) | 34 @75% | **Code** (chữ "với mức" sau số) — đã sửa |
| IB2300230061 | "3.9 Tiêu thụ nhiên liệu ≤ 23 lít/giờ ở chế độ hoạt động 75% tải liên tục" | maxFuel 23 | 23 @75% | **Code** — đã sửa |
| IB2400389666 | "8 Tiêu hao nhiên liệu ≤53 L/h (khi mức tải là 75%)" | maxFuel 53 | 53 @75% | **Code** — đã sửa |
| IB2500073242 | "≤23 L/h (khi mức tải là" … dòng dưới "75%)" (ô gãy dòng) | maxFuel 23 | 23 @75% | **Code** — đã sửa |
| IB2500261097 | "- Tiêu thụ nhiên liệu: ≤ 85 L/h (khi mức tải là 75%)." | maxFuel 85 | 85 @75% | **Code** — đã sửa |
| IB2600438484 | "14 Tiêu hao nhiên liệu ở mức ≤ 150.1 lít/giờ / hoạt động 75% tải"; "15 … ≤ 198.2 lít/giờ / hoạt động 100% tải" | maxFuel75 = 198.2 (sai) | 150.1 @75% | **Code** (nhãn "hoạt động" dưới số) — đã sửa: 150.1 @75, 198.2 @100 |
| IB2200029975 | "Số xilanh, đường kính x hành trình mm: 2.197" (bảng lệch hàng; "4 - 87 x 92.4" nằm ở dòng công suất) | minCyl 2, **cylExact** → loại động cơ khác 2 xi lanh | 4 xi lanh | **Code** (2 lấy từ "2.197") — đã sửa: không đọc số có phần thập phân (→ null). Phân tích đúng (4) |
| IB2400063033 | "9 Số xilanh >3 Đạt Không đạt" | minCyl 3, **cylExact** (bị loại động cơ ≠ 3 xi lanh!) | 19 (lấy "Tỉ số nén >19:1") | **Code** sai ở chỗ coi ">3" là số chính xác — đã sửa (không còn exact). Phân tích cũng sai (19). Giữ minCyl 3 (không +1) |
| IB2300364915 | "≤ 84 lít/giờ tại 75% tải và ≤ 113 lít/giờ tại 100% tải" | 113 @100, 84 @75 | cả hai xếp @75% | **Phân tích** |
| IB2500314401 | "≤ 53.5 lít/giờ tại 75% tải và ≤ 70.6 lít/giờ tại 100% tải" | 70.6 @100 | cả hai @75% | **Phân tích** |
| IB2500381511 | "Mức tiêu hao 50% tải: Chế độ liên tục ≤ 232 lít/giờ" (75%: 336) | maxFuel50 232 | 336 và 232 cùng @75% | **Phân tích** |
| IB2600350175 | "13 Tiêu hao … mức 100% tải ≤ 220 lít/giờ; 14 … mức 75% tải ≤ 160 lít/giờ" | maxFuel75 160 | 220 và 160 cùng @100% | **Phân tích** |
| IB2300230061 (xi lanh) | "≥ 4/3318cm3" (một cỡ) và "6 xy lanh xếp hình V" (cỡ khác) | 4 | 6 | Không sai: gói nhiều cỡ, mỗi cỡ một số (Phân tích lấy cỡ khác) |
| IB2300293753 | "Số xy lanh ≥3" (máy 36 kVA, bản gốc ghi "<3"), 200 kVA "< 6" | 3 | 6 | Không sai: nhiều cỡ; Phân tích lấy "<6" của cỡ khác |
| IB2400265203 | "Số xilanh, dung tích ≥ 3, cung cấp thông tin dung tích xi lanh" | 3 | 1 | **Phân tích / công cụ soát** (dòng Phân tích chính nó ghi ≥ 3; "1" là nhiễu của bộ đọc audit, "Phần 1") |
| IB2400487460 | "Số xilanh ≥ 3" (8,8 kVA) và "≥ 4 thẳng hàng" (40 kVA) | 3 | 4 | Không sai cho cỡ 8,8 kVA; cỡ 40 kVA code không đọc dòng "≥ 4 thẳng hàng" (lỏng hơn, không loại nhầm) |

Sau sửa còn 9 dòng "lệch": toàn bộ là ca "Phân tích sai / nhiều cỡ / nhiễu audit" ở bảng trên (kể cả IB2400063033: code còn 3 nhưng hết exact, Phân tích 19 sai).

## THIẾU (code không đọc ra): 669 → 664, chỉ đếm
Trước: maxFuel 239, maxFuel75 149, maxFuel50 98, minCyl 183. Sau: maxFuel 238, maxFuel75 144, maxFuel50 98, minCyl 184 (+1: IB2200029975 từ "2" sai thành null, đúng).
Chủ yếu: Phân tích ghi mức tiêu hao / xi lanh từ chữ mà code không có nhãn nhận (bảng dạng khác). Không loại nhầm ai, chỉ không lọc được.

## Sửa (PR draft)
Chỉ `suppliers/config-bot.mjs` (`powerMins` phần tiêu hao: chữ dẫn / gãy dòng sau con số, nhãn "hoạt động" dưới số; `engineLists`: không đọc số thập phân, ">N" không là số chính xác) + ca test dòng thật trong `fuel-max.test.mjs`, `mins-fix2.test.mjs`. `node --test suppliers/`: 905 pass, 0 fail. `quality --check`: không xấu đi.
Rủi ro: regex "chữ dẫn" rộng hơn trước (nhận "với / khi mức tải là / ở chế độ hoạt động" trước %); quay lui = revert PR.
Việc chưa kiểm: đo ảnh hưởng lên top ứng viên thật của 6 gói fuel (chưa chạy `check` lại từng gói).
