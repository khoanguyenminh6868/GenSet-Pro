# Nghiệm thu: ngưỡng HSMT theo cỡ máy, phần còn lại (PR nháp #584, nhánh `mins-rest`)

PR nháp https://github.com/khoanguyenminh6868/GenSet-Pro/pull/584, worktree `C:\Projects\GenSet Pro\wt-mins-rest` từ origin/main e7f0a1d (đã gồm #577 nhiên liệu). Không chạy agent, không ghi web. Không đụng phần nhiên liệu và phần loại theo độ tin của nguồn.

## Tệp đổi
- `suppliers/config-bot.mjs`: `checkNewConfigs` nhận `sizing` (đường Tìm NCC), `mergeFindIntoConfig` truyền `{ size, sizes }` từ `whole.sizes`; `minsForSize` thêm luật "đồng thuận" cho dung tích / xi lanh; `sizeBlocks` nhận công suất không dấu.
- `suppliers/mins-size.test.mjs`: +2 test (10 test).

## 1. Đường Tìm NCC
`hintsOf(text, extra)` ở `checkNewConfigs` (dòng ~3871, trước đây ~3441) không truyền cỡ: gói nhiều cỡ đọc ngưỡng toàn văn (null nếu hai cỡ khác nhau). Nay `mergeFindIntoConfig` giữ `size` của từng phần (`whole.sizes[i]`) và truyền `{ size, sizes: whole.sizes }` khi gói có >1 cỡ. `fitsCap`, `engineRows`, `mergeFind` không đọc ngưỡng (chỉ dải công suất `bandOf`), nên không cần đổi; lượt prep Tìm NCC (`prep(..., multi)` ở ~3691) đã truyền cỡ từ #561. Không có test riêng cho `checkNewConfigs` (gọi agent); phần đọc ngưỡng được test qua `hintsOf` với `sizing`.

## 2. Ba gói máy nhỏ (7 ca): lỗi đọc, đã sửa
Cả ba HSMT có các phần "A / B / C Yêu cầu kỹ thuật đối với máy phát điện N kVA", mỗi phần lặp lại đúng cùng yêu cầu động cơ. Dòng công suất "≥ N KVA" của đầu phát (hoặc dòng công suất không có chữ liên tục / dự phòng) mở khối sai, nên phần động cơ của cỡ cuối rơi vào khối cỡ liền trước hoặc khối không cỡ, và cỡ đó không có ngưỡng nào của riêng nó. Đây là ngưỡng chung hợp lệ bị bỏ (không phải ngưỡng của cỡ khác).

Luật mới (`how: "agreed"`, chỉ dung tích tối thiểu / tối đa và số xi lanh, không cho Prime và tiêu hao): khối của cỡ không nêu, và ≥ 2 khối khác (khối cùng một cỡ tính một) cùng nêu MỘT giá trị, và các khối đó chiếm ≥ nửa số khối khác → lấy giá trị đó. Khối nào nêu giá trị khác, hay khối nêu "lẫn" (null) → không lấy. IB2400487460 (5 ca đã được xác định là bỏ đúng: ngưỡng chỉ của máy 8,8 kVA, 2/10 khối nêu) không đổi.

| gói | cỡ | ngưỡng | trước | sau | câu HSMT |
|---|---|---|---|---|---|
| IB2300245556 | 12,5 kVA | minDisp | null | 2,3 L | "5 Dung tích xilanh ≥ 2.3 lít" (dòng 477 phần A, 1121 phần B, 1746 phần C) |
| IB2300245556 | 12,5 kVA | minCyl | null | 4 | "9 Số xilanh ≥4" (481 / 1125 / 1750) |
| IB2300245748 | 10 kVA | minDisp | null | 2,3 L | "5 Dung tích xilanh ≥ 2.3 lít" (480, 1134, 1746) |
| IB2300245748 | 10 kVA | minCyl | null | 4 | "9 Số xilanh ≥4" (484, 1138, 1760) |
| IB2300245748 | 12 kVA | minDisp | null | 2,3 L | như trên |
| IB2300245748 | 12 kVA | minCyl | null | 4 | như trên |
| IB2400125924 | 12,5 kVA | minCyl | null | 3 | "5 Số xilanh ≥3" (dòng 300 phần 8.5 kVA, 706 phần 12.5 kVA); dung tích: "Nhà thầu khai báo thông tin" (không ngưỡng) |

Lưu ý ngoài phạm vi (ghi, không sửa): IB2300245556 và IB2300245748 có cỡ sizesOf đọc là 10,5 / 12,5 kVA (từ dòng "Công suất tối đa ≥ 10,5 / 12,5") trong khi máy thật là 10 và 12 kVA; Prime tối thiểu ra null ở các cỡ đó (an toàn, chỉ lọc ít).

## 3. IB2300363623 (5 kW + 15 kVA): xử lý
HSMT ghi "- Công suất liên tục: 15kVA/ 12kW", "- Công suất dự phòng: 16.5kVA /13.2 kW" (hàng mục 1) và "- Công suất dự phòng: 5.8kW" (hàng mục 2; dòng liên tục của hàng mục 2 là OCR "SkW"), không có dấu ≥ nên `sizeBlocks` không thấy câu công suất nào. `sizeBlocks` nay nhận thêm "Công suất liên tục / dự phòng / cơ bản / Prime / Standby : N kVA|kW" (số liền sau nhãn, có dấu hai chấm, không dấu so sánh).
- 5 kW: minDisp 1,758 → null (1,758 L ">" là của máy 15 kVA: "- Dung tích xy lanh: > 1.758 lit", dòng 92; máy 5 kW ghi "> 456cc", không đọc được thành ngưỡng); dòng bị loại 61 → 0.
- 15 kVA: minDisp 1,758 giữ; minPrime null → 15 kVA / 12 kW.

## Đo hồi quy (620 lượt của 243 gói nhiều cỡ + 12 gói, `scratchpad\meas.mjs`, mã main e7f0a1d so mã mới)
Ngưỡng đổi ở **34 lượt-ngưỡng, 12 gói** (> 30: soát tay từng nhóm, đọc văn bản các gói có rủi ro). Theo nhóm:
- 7 ca mục 2 (3 gói): đúng, như trên.
- IB2300363623 (2 ca): đúng, mục 3.
- Gain Prime tối thiểu (14 ca, 6 gói): IB2300247840 (250 / 400 / 650 kVA), IB2300253227 (100 / 150), IB2400237184 (53 / 405), IB2400589278 (300 / 400 / 450), IB2500152724 (5 kW, 12,5 kVA), IB2400433961. Mỗi cỡ có "- Công suất liên tục: N kVA/…" đúng bằng cỡ, giá trị = cỡ.
- IB2400433961 (600 kVA, 1.500 kVA; 8 ca): trước 600 kVA nhận tiêu hao ≤ 304 và ≤ 228 L/h là của máy 1.500 kVA (HSMT: "+ Dung tích xi lanh: ≤ 39,2l" dưới "Công suất liên tục: 1500kVA/1200KW"). Nay 600 kVA: maxDisp 19,6, minCyl 6, Prime 600; 1.500 kVA: maxDisp 39,2, minCyl 12, Prime 1500, tiêu hao 304 / 228 (cỡ lớn giữ). Sửa đúng.
- IB2500114642 (8,3 / 10,4 / 250 kVA; 4 ca bỏ): trước mọi cỡ nhận minCyl 6 và minDisp 0,769 (của máy 8,3 kVA hoặc 250 kVA). Nay 8,3 kVA bỏ minCyl 6 (HSMT: máy 1 xy lanh), 10,4 kVA bỏ minDisp 0,769, 250 kVA bỏ cả hai. Chưa hết: "- Công suất định mức 250KVA/200KW" (nhãn "định mức", không "liên tục") không mở khối, nên khối 10,4 kVA vẫn nuốt "Số xylanh: 6" của máy 250 kVA và gán cho 10,4 (như trước); 250 kVA mất minCyl 6 đúng (lọc ít đi, không gán nhầm).
- IB2500394492 (1.600 kVA minCyl 12 → null): "1600kVA" là tổng hệ thống 2 tổ 750 kVA; 12 xi lanh là của máy 750 kVA. Bỏ là an toàn.
- Mất thêm: không ca nào đổi sang giá trị khác; 0 ca "lấy nhầm cỡ".

### Dòng bị loại / xếp hạng của các lượt đổi (`cm2.mjs`, bản chụp 12/11)
Ví dụ: IB2300245556 12,5 kVA 392 → 140 dòng xếp hạng (bị loại 0 → 252: dung tích < 2,3 L / xi lanh < 4, đúng HSMT); IB2400433961 1.500 kVA 1.020 → 265; IB2300363623 5 kW 66 → 127 (bỏ ngưỡng 1,758 L của cỡ khác). Top 30 đều còn đủ 30 dòng ở cả 24 lượt (bảng đủ trong `scratchpad\cm2.mjs` đầu ra).

### configmatch (cấu hình hạng 1–3 của lượt trước)
`scratchpad\cm.mjs`: doc-cache có 13 gói configmatch (1 thiếu HSMT), 14 lượt, 31 cấu hình hạng 1–3: **0 lượt đổi ngưỡng, 0 cấu hình rơi** (top → cut / ngoài). 12 gói đổi ngưỡng ở trên không có configmatch trong doc-cache nên không đo được hạng của chúng.

## 4. Chỉ đo (không sửa): so với bản hiện tại, thử trên bản sao `suppliers/_exp-*.mjs` (đã xoá)
| thử | gói bị ảnh hưởng | lượt-ngưỡng đổi | được / bỏ / đổi |
|---|---|---|---|
| A. đóng khối ở tiêu đề cấp cao ("A Yêu cầu kỹ thuật đối với máy phát điện N kVA", mở khối cho cỡ N) | 12 | 38 | 29 / 7 / 2 |
| B. nhận kW làm dấu cỡ trong gói tính bằng kVA (0,8) | 18 | 75 | 11 / 64 / 0 |
| C. công suất đầu phát (dòng "≥ N kVA" trong phần đầu phát, 1,0–1,4 × cỡ) làm dấu cỡ | 10 | 22 | 11 / 11 / 0 |
A: gói IB2200046063, IB2300245556, IB2300245748, IB2300253626, IB2400125924, IB2400494037, IB2500271331, IB2500280002, IB2500403535, IB2500415487, IB2500531255, IB2600477305. B: nhiều "bỏ" vì dòng kW của đầu phát / trục cắt khối cỡ (đúng lý do #561 chỉ đọc kW khi có cỡ kW): không nên làm. C: gói IB2300134577, IB2300245748, IB2400062394, IB2400125924, IB2400145438, IB2400265203, IB2400427929, IB2400487460, IB2600477305, IB2600562009. Chưa soát tay từng ca của A/B/C (chỉ đếm); A có vẻ đáng làm nhất (cứu cả nhóm C của mins-size.md: IB2200046063, IB2500280002, IB2500415487, IB2500403535). Điều phối quyết.

## Lệnh kiểm
- `node --test suppliers/`: 425 tests, 425 pass, 0 fail (423 + 2 mới).
- `node suppliers/verify.mjs`: 433 bản ghi, 0 có lỗi.

## 3 mẫu đối chiếu nguồn gốc (văn bản HSMT trong `kiem-rong\data\hc\`)
1. IB2300245556: "Dung tích xilanh ≥ 2.3 lít" và "Số xilanh ≥4" ở ba phần A (8.5kVA), B (10.0kVA), C (12kVA).
2. IB2400433961: "Công suất liên tục: 1500kVA/1200KW" … "+ Số xi lanh: 12 thẳng hàng hoặc xếp chữ V", "+ Dung tích xi lanh: ≤ 39,2l" (và 600kVA: "+ Số xi lanh: 6 thằng hàng", "≤ 19,6 lít").
3. IB2300363623: "- Công suất liên tục: 15kVA/ 12kW" … "- Dung tích xy lanh: > 1.758 lit" (hàng mục 1); "- Công suất dự phòng: 5.8kW" … "- Dung tích động cơ: > 456cc" (hàng mục 2).

## Rủi ro và quay lui
- Luật đồng thuận có thể gán ngưỡng chung cho cỡ mà HSMT thật sự không đòi (hai cỡ khác cùng nêu, cỡ này không nêu): tối đa lọc nhiều hơn một ngưỡng; chỉ 3 gói / 7 ca trong 243 gói.
- Nhận công suất không dấu thêm 27 ca ngoài 7 ca trên (9 gói), phần lớn là Prime = cỡ; khối do câu "dự phòng: 2750KVA" (IB2300247840, không khớp cỡ) tạo khối không cỡ cuối gói (an toàn).
- Chưa đóng khối ở tiêu đề (mục 4); IB2500114642 250 kVA ("Công suất định mức") còn lẫn.
- Quay lui: revert PR; sau merge restart bot.

## Chưa kiểm
- Chưa chạy agent thật; hạng của 12 gói đổi ngưỡng trong configmatch thật (không có bản chụp).
- Chưa soát từng ca của thử A/B/C.
