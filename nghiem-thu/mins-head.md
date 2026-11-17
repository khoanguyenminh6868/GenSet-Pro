# Nghiệm thu: tiêu đề phần là ranh giới khối cỡ (PR nháp #586, nhánh `mins-head`)

## Sau #585 (main fd86b32) — bản hiện tại của PR, THAY cho phần "bản trước" bên dưới
PR https://github.com/khoanguyenminh6868/GenSet-Pro/pull/586, nhánh reset về origin/main fd86b32 rồi thêm lại chỉ phần #585 chưa có (bản cũ giữ ở nhánh cục bộ `mins-head-old`). Không chạy agent, không ghi web.

**Tệp đổi:** `suppliers/config-bot.mjs` (`sizeBlocks`: tiêu đề phần `Yêu cầu|Thông số kỹ thuật … máy phát điện … N kVA`, có hoặc không dấu đầu mục, < 200 ký tự, N khớp ĐÚNG MỘT cỡ của gói → mở khối cỡ đó tới tiêu đề kế, các câu công suất khác trong phần (đầu phát "≥ 12 KVA"…) không mở khối; tiêu đề không khớp cỡ nào chỉ đóng phần, văn bản sau đó đọc như #585); `suppliers/mins-size.test.mjs` +1 test. Bỏ so với bản trước: "Công suất định mức N kVA" đầu dòng (IB2500114642 250 kVA nay đã đúng nhờ #585: minCyl 6 own, 10,4 kVA null) — không cần nữa. Luật `agreed` giữ (IB2300245556 vẫn cần: tiêu đề 10.0 / 12 kVA không khớp cỡ 10,5 / 12,5 của sizesOf).

**Đo (trước = main fd86b32, `kiem-rong\mh.mjs`, `cmh.mjs`):** 243 gói nhiều cỡ / 620 cỡ: **2 gói, 13 lượt-ngưỡng đổi: 13 được, 0 bỏ, 0 đổi giá trị.** Gói một cỡ (1.014): 0 khác. configmatch hạng 1–3 (13 gói, 14 lượt, 31 cấu hình): 0 lượt đổi, 0 rơi. Test: 455 pass (454 + 1; gồm `mins-size-2.test.mjs`), verify 433 bản ghi 0 lỗi.
Thử đầu của bản này (tiêu đề không khớp cỡ vẫn mở khối không cỡ) làm mất 14 ca đúng của #585 ở IB2300245556; đã sửa như mô tả trên.

**Soát tay 13 ca (đúng hết):**
| gói | cỡ | ngưỡng | trước | sau | câu HSMT |
|---|---|---|---|---|---|
| IB2300245748 | 10 kVA | minPrime | null | 10 | "3 Công suất liên tục ≥ 10.5 ±0.5KVA" (phần B "Máy phát điện 10.0kVA") |
| | | maxFuel / 75 / 50 | null | 4,35 / 3,5 / 2,7 | "Tại 100% tải: ≤ 4,35 lít/giờ", "75% ≤ 3,5", "50% ≤ 2,7" |
| IB2300245748 | 12 kVA | minPrime | null | 12 | "≥ 12.5 ±0.5KVA" (phần C "12kVA") |
| | | maxFuel / 75 / 50 | null | 4,9 / 3,8 / 3,1 | "100% ≤ 4,9", "75% ≤ 3,8", "50% ≤ 3,1" |
| IB2500280002 | 11 kVA | minDisp / minCyl / minPrime | null | 0,79 / 2 / 11 | "7 Số xy lanh ≥2", "8 Tổng dung tích xilanh ≥ 0.79 lít", công suất liên tục 11 kVA (phần "B … 11KVA") |
| IB2500280002 | 15 kVA | minDisp / minPrime | null | 1,6 / 15 | "7 Tổng dung tích xilanh ≥ 1.6 lít" (phần "A … 15KVA") |
Nguyên nhân: tiêu đề phần "A / B Yêu cầu kỹ thuật đối với Máy phát điện N kVA" không có dấu "." sau chữ mục hoặc dài hơn 25 ký tự nên `isHead` của #585 không nhận; phần động cơ / nhiên liệu của cỡ nằm trong khối cỡ liền trước.

**Còn lại từ 12 gói / 38 ca của thử A:** 10 gói đã đúng sau #585 (IB2200046063, IB2400125924, IB2500271331, IB2500114642… kiểm bằng `st.mjs`) hoặc không đổi; không còn ca sai nào trong nhóm này. IB2400125924 12,5 kVA minPrime "not the size" (null, an toàn) — ngoài phạm vi.
**Đóng khối ở tiêu đề cấp trên / phần chung cuối văn bản:** chưa làm (không tìm thấy ca sai trong 243 gói; phần sau tiêu đề cuối vẫn thuộc khối cuối).
**Đánh giá:** lợi nhỏ (2 gói, 13 ca, tất cả là thêm ngưỡng đúng), rủi ro thấp (chỉ khi tiêu đề nêu đúng một cỡ của gói; 0 ca bỏ; 0 ảnh hưởng gói một cỡ / configmatch). Đề xuất: gộp nếu muốn ngưỡng nhiên liệu / Prime cho hai gói này; đóng #586 cũng không mất gì lớn.
**Quay lui:** revert PR; sau merge restart bot.

---
# (Bản trước #585, giữ để tham khảo; số liệu của bản này KHÔNG còn dùng)

PR nháp https://github.com/khoanguyenminh6868/GenSet-Pro/pull/586, worktree `C:\Projects\GenSet Pro\wt-mins-head` từ origin/main 8f29482 (đã gồm #584). Không chạy agent, không ghi web.

## Tệp đổi
- `suppliers/config-bot.mjs` (`sizeBlocks`): (1) nhận tiêu đề phần: dòng < 200 ký tự, có dấu đầu mục (A. / a) / I. / 1. / 1.2 / Phần II / `*`), rồi "Yêu cầu|Thông số kỹ thuật … máy phát điện … N kVA"; từ tiêu đề tới tiêu đề kế là một khối của cỡ N (N khớp một cỡ của gói, ±0,5%; không khớp = khối không cỡ, đóng khối cũ). Trong phần có tiêu đề, mọi câu công suất khác (đầu phát "≥ 12 KVA"…) không mở khối nữa. (2) "Công suất định mức [:] N kVA|kW" ĐẦU DÒNG (không dấu ≥) mở khối như prime. Luật "agreed" giữ nguyên.
- `suppliers/mins-size.test.mjs`: +2 test (12 test).

## 3. Luật "agreed" còn cần không? CÒN, chỉ cho IB2300245556
Chạy bản mới có / không luật agreed trên 243 gói: chỉ khác ở IB2300245556 (10,5 và 12,5 kVA: minDisp 2,3 L và minCyl 4 → null nếu bỏ, 4 ca). IB2300245748 và IB2400125924 đã đúng nhờ khối theo tiêu đề (cỡ 10 / 12 / 12,5 có khối riêng). Lý do IB2300245556 vẫn cần: sizesOf đọc cỡ 10,5 / 12,5 kVA trong khi tiêu đề ghi "10.0kVA" / "12kVA" nên tiêu đề không khớp cỡ nào (khối không cỡ), cỡ 10,5 / 12,5 không có khối riêng, ngưỡng lặp ở cả ba phần → agreed vẫn đúng (2,3 L, ≥ 4 xi lanh, giống nhau ở 3/3 phần). Kết luận: KHÔNG bỏ luật.

## Đo hồi quy (script `kiem-rong\mh.mjs`, `mh2.mjs`, `cmh.mjs`; so minsForSize của main với bản mới, mọi cỡ)
- 243 gói nhiều cỡ / 620 cỡ: **7 gói, 32 lượt-ngưỡng đổi: 28 được (null → giá trị), 4 bỏ (giá trị → null), 0 đổi sang giá trị khác.** Gói: IB2200046063, IB2300245556, IB2300245748, IB2400125924, IB2500114642, IB2500271331, IB2500280002.
- 1.014 gói một cỡ (và gói không có cỡ): `hintsOf` giống hệt (0 khác).
- configmatch: 13 gói, 14 lượt, 31 cấu hình hạng 1–3: **0 lượt đổi ngưỡng, 0 cấu hình rơi** (IB2600604739 thiếu HSMT, như lượt trước).
- Thử A của #584 đo 12 gói / 38 ca; nay còn 7 gói / 32 ca: IB2300253626, IB2400494037, IB2500403535, IB2500415487, IB2500531255, IB2600477305 không đổi (tiêu đề "Yêu cầu kỹ thuật của “Máy phát điện Diesel 20KVA…”" hay tiêu đề không có dấu đầu mục / cỡ không khớp, hoặc nay trùng kết quả cũ), và IB2300134577 / IB2300108940 (do câu "định mức" giữa dòng) đã loại bằng cách chỉ nhận "Công suất định mức" ở đầu dòng.

## Soát tay TẤT CẢ 32 ca (văn bản HSMT trong `kiem-rong\data\hc\`; số dòng theo văn bản kỹ thuật `technicalPart`)
| gói | cỡ | ngưỡng | trước | sau | câu HSMT | đúng/sai |
|---|---|---|---|---|---|---|
| IB2200046063 | 10,5 kVA | minDisp | null | 2,5 | "4 Dung tích xilanh≥ 2,5 lít" (d.86, phần "a. Yêu cầu kỹ thuật máy phát điện 10.5 KVA" d.33) | đúng |
| | | minCyl | null | 4 | "6 Số xilanh ≥ 4" (d.88) | đúng |
| | | maxFuel | null | 4 | "Tiêu thụ nhiên liệu mức 100% tải liên tục≤ 4,0 L/h" (d.67) | đúng |
| | | maxFuel75 | null | 3 | "mức 75% … ≤ 3,0 L/h" (d.68) | đúng |
| IB2200046063 | 13,5 kVA | minDisp | null | 2,5 | "23 Dung tích xilanh≥ 2.5" (d.268, phần "b. … 13.5KVA" d.217) | đúng |
| | | minCyl | null | 4 | "27 Số xilanh ≥ 4" (d.272) | đúng |
| | | maxFuel / 75 | null | 4,9 / 3,8 | "100% … ≤ 4,9 L/h", "75% … ≤ 3,8 L/h" (d.251–252) | đúng |
| IB2300245556 | 8,5 kVA | minPrime | null | 8,5 kVA | "3 Công suất liên tục ≥ 8.5 KVA" (d.309; phần A d.221) | đúng (trước: khối 8,5 kéo dài sang phần B nên "disagree") |
| | | maxFuel / 75 / 50 | null | 3,5 / 3,2 / 2,45 | "Tại 100% tải: ≤ 3,50 lít/giờ", "75% ≤ 3,20", "50% ≤ 2,45" (d.537–539) | đúng |
| IB2300245556 | 10,5 kVA | maxFuel / 75 / 50 | 4,9 / 3,8 / 3,1 | null | 4,9 / 3,8 / 3,1 là "Tại 100/75/50% tải" của MÁY 12 kVA (phần C d.1474, d.1805–1807); máy 10 kVA (phần B d.857) ghi 4,35 / 3,5 / 2,7 | **BỎ ĐÚNG** (trước gán nhầm ngưỡng của máy 12 kVA cho 10,5; sizesOf đọc 10,5 thay 10 nên không có khối riêng, null là an toàn) |
| IB2300245748 | 10 kVA | minPrime | null | 10 kVA | "3 Công suất liên tục ≥ 10.5 ±0.5KVA" (d.959, phần B "10.0kVA" d.860), giá trị = cỡ trong ±0,6% sau khi khối đúng | đúng |
| | | maxFuel / 75 / 50 | null | 4,35 / 3,5 / 2,7 | "Tại 100% tải: ≤ 4,35 lít/giờ", "75% ≤ 3,5", "50% ≤ 2,7" (d.1192–1194) | đúng |
| IB2300245748 | 12 kVA | minPrime | null | 12 kVA | "≥ 12.5 ±0.5KVA" (d.1579, phần C "12kVA" d.1480) | đúng |
| | | maxFuel / 75 / 50 | null | 4,9 / 3,8 / 3,1 | "100% ≤ 4,9", "75% ≤ 3,8", "50% ≤ 3,1" (d.1814–1816) | đúng |
| IB2400125924 | 12,5 kVA | maxFuel | null | 5 | "19 Tiêu thụ nhiên liệu Tại 100% tải: ≤ 5 lít/giờ" (d.764, phần B 12.5kVA d.541) | đúng |
| IB2500114642 | 10,4 kVA | minCyl | 6 | null | "- Số xylanh: 6" (d.93) nằm sau "- Công suất định mức 250KVA/200KW" (d.87), là của máy 250 kVA | **BỎ ĐÚNG** (trước gán nhầm cho 10,4) |
| IB2500114642 | 250 kVA | minCyl | null | 6 | "- Số xylanh: 6" (d.93) ngay dưới "Công suất định mức 250KVA/200KW" (d.87) | đúng |
| IB2500271331 | 12 kVA | minPrime | null | 12 kVA | Công suất liên tục = 12 kVA trong phần "A … Máy phát điện Diesel 12KVA/1pha" (d.121–761) | đúng |
| IB2500280002 | 11 kVA | minDisp | null | 0,79 | "8 … ≥ 0.79 lít" (Tổng dung tích xilanh, d.535–536; phần "B … 11KVA" d.420) | đúng |
| | | minCyl | null | 2 | "7 Số xy lanh ≥2" (d.534) | đúng |
| | | minPrime | null | 11 kVA | Công suất liên tục = 11 kVA trong phần B | đúng |
| IB2500280002 | 15 kVA | minDisp | null | 1,6 | "7 ≥ 1.6 lít" (Tổng dung tích xilanh, d.202–203; phần "A … 15KVA" d.21) | đúng |
| | | minPrime | null | 15 kVA | Công suất liên tục = 15 kVA trong phần A | đúng |
Kết quả soát: 28 ca được đều đúng; **4 ca "bỏ": cả 4 bỏ đúng, không oan** (3 ca nhiên liệu của IB2300245556 10,5 kVA là giá trị máy 12 kVA; 1 ca minCyl của IB2500114642 10,4 kVA là của máy 250 kVA). Các ca "được" của IB2300245556 / IB2300245748 / IB2400125924 từ #584 (minDisp 2,3 / minCyl 4 / 3) không đổi.

## Lệnh kiểm
- `node --test suppliers/`: 450 tests, 450 pass, 0 fail (448 + 2 mới).
- `node suppliers/verify.mjs`: 433 bản ghi, 0 có lỗi.

## 3 mẫu đối chiếu nguồn gốc
1. IB2300245556 10,5 kVA: fuel của phần C "12kVA" (d.1805 "Tại 100% tải: ≤ 4,9 lít/giờ") từng bị gán cho 10,5; phần B "10.0kVA" ghi "≤ 4,35 lít/giờ" (d.1180).
2. IB2500114642: "- Công suất định mức 250KVA/200KW" … "- Số xylanh: 6".
3. IB2200046063: "a. Yêu cầu kỹ thuật máy phát điện 10.5 KVA" … "Dung tích xilanh≥ 2,5 lít" … "b. Yêu cầu kỹ thuật kỹ thuật máy phát điện 13.5KVA" … "Tiêu thụ nhiên liệu mức 100% tải liên tục≤ 4,9 L/h".

## Rủi ro còn lại, quay lui
- Trong phần có tiêu đề, câu công suất của cỡ khác bị bỏ qua tới tiêu đề kế: nếu một HSMT đặt tiêu đề phần chung (không theo cỡ) bằng cùng kiểu chữ thì phần chung đi theo khối cỡ trước (chỉ gán / mất cho cỡ đó, không gán cho cỡ khác); phần sau tiêu đề cuối kéo tới hết văn bản (như trước).
- Tiêu đề không khớp cỡ của gói (IB2300245556: "10.0kVA" vs cỡ 10,5) thành khối không cỡ: ngưỡng của khối đó chỉ đi tới cỡ nào qua "agreed" hay mất (an toàn).
- Quay lui: revert PR; sau merge restart bot.

## Ngoài phạm vi (ghi, không sửa)
- sizesOf đọc IB2300245556 / IB2300245748 là 10,5 / 12,5 kVA (máy thật 10 / 12) từ dòng "≥ 10.5 / 12.5 ±0.5KVA" (công suất tối đa).
- Hai tiêu đề không dấu đầu mục ("Yêu cầu kỹ thuật của “Máy phát điện Diesel 12KVA…”" lặp lại ở phụ lục, IB2500271331 d.6543) không nhận; không ảnh hưởng kết quả.

## Chưa kiểm
- Chưa chạy agent thật; hạng configmatch của 7 gói đổi ngưỡng (không có trong bản chụp configmatch).
