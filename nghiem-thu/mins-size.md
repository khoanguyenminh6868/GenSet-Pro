# Nghiệm thu: ngưỡng HSMT theo từng cỡ máy (PR D, nhánh `mins-size`)

Worktree `C:\Projects\GenSet Pro\wt-mins-size` từ origin/main ff2efb0. Không chạy agent, không ghi web (chỉ GET văn bản HSMT của 243 gói để đo). Phương án đã được duyệt: ranh giới = câu nêu công suất tổ máy; ngưỡng bỏ → null; mở rộng cho `powerMins`.

## Tệp đổi
- `suppliers/config-bot.mjs`: `engineLists` (tách từ `engineMins`, kết quả `engineMins` không đổi), `powerRead` (tách từ `powerMins`, `powerMins` không đổi), `sizeBlocks`, `minsForSize` (mới), `hintsOf(text, extra, sizing)` (tham số thứ ba mới), `prep()` truyền `multi && { size, sizes }` cho `hintsOf`.
- `suppliers/mins-size.test.mjs` (mới, 8 test).

## Cách làm
- Gói một cỡ hoặc không truyền `sizing`: `hintsOf` y nguyên (code không chạy nhánh mới).
- Lượt theo cỡ (`multi`): `sizeBlocks` tìm các câu nêu công suất tổ máy: "≥ N kVA" có nhãn gần nhất là Liên tục/Prime (prime) hoặc Dự phòng/Standby (standby), không phải của động cơ ("động cơ", "tối đa"…); xét ở mọi phần (một tiêu đề lạ sẽ để lại phần động cơ / đầu phát và làm văn bản cỡ sau chảy vào khối này). Câu thuộc cỡ S khi prime trong 0,995–1,005 × S (NEAR_LOW), hoặc standby trong NEAR_LOW..NEAR_HIGH (1,0–1,2) × S; khớp hai cỡ hoặc không cỡ nào thì không thuộc cỡ nào (mở một khối không cỡ). Khối = từ câu đầu của dãy câu cùng cỡ tới câu đầu của dãy khác.
- `minsForSize`: với mỗi ngưỡng (dung tích tối thiểu, tối đa, số xi lanh, Prime tối thiểu, tiêu hao 100% / 75% / 50%): (1) khối của cỡ nêu ngưỡng, một giá trị → lấy; khối cùng cỡ mâu thuẫn → null; (2) khối của cỡ không nêu, không khối cỡ khác nào nêu, phần ngoài mọi khối (+ yêu cầu bổ sung từ web) nêu → lấy như hiện nay ("chung"); (3) còn lại → null, không bao giờ lấy của cỡ khác. Thêm: `minPrime` của một cỡ phải bằng chính cỡ đó (±0,6%), khác thì null (đo được 6 ca khối đọc nhầm prime của cỡ liền sau, vd khối 20 kVA ra 30). `plausible()` vẫn chạy sau (không đụng).

## Quét rộng: 243 gói nhiều cỡ trong doc-cache (683 cỡ)
`doc-cache/analysis.json` 1.287 phân tích → `sizesOf` ra 243 gói nhiều cỡ; đã GET văn bản HSMT cả 243 (`scratchpad\corpus2.mjs`). Tìm được khối: **65 gói** (49 gói tìm đủ khối cho mọi cỡ; 28 gói có câu công suất không gán được cỡ); 178 gói không có khối: kết quả y nguyên như hiện nay. Gói một cỡ: 0 thay đổi (kiểm 10 gói một cỡ trong 12 gói: hints giống hệt; catalog.md giống hệt).
So với đọc toàn văn hiện nay, theo từng ngưỡng trên 683 cỡ (giống hệt / null→null / ĐƯỢC mới / BỎ (có → null) / ĐỔI sang giá trị khác):
| ngưỡng | giống | null→null | được mới | bỏ | đổi |
|---|---|---|---|---|---|
| dung tích tối thiểu | 36 | 588 | 44 | 15 | 0 |
| dung tích tối đa | 4 | 668 | 2 | 9 | 0 |
| số xi lanh tối thiểu | 68 | 555 | 32 | 28 | 0 |
| **Prime tối thiểu** | 9 | 576 | 87 | 11 | 0 |
| tiêu hao 100% | 12 | 604 | 56 | 9 | 2 |
| tiêu hao 75% | 10 | 639 | 28 | 6 | 0 |
| tiêu hao 50% | 4 | 660 | 16 | 3 | 0 |
Nhóm động cơ (3 ngưỡng đầu): giống 108, được 78, bỏ 52, đổi 0. Nhóm công suất (4 ngưỡng sau): giống 35, được 187, bỏ 29, đổi 2.
"Đổi" 2 ca (tiêu hao 100%) cùng gói IB2500410768 (30, 100, 200 kVA): trước 28,3 L/h cho mọi cỡ (ngưỡng của máy 100 kVA); nay 30 kVA ≤ 7,5, 200 kVA ≤ 43,1 (đúng khối từng cỡ).
Prime tối thiểu "bỏ" 11 ca: 10 ca là giá trị cỡ khác đang áp (vd gói IB2300108940: máy 10 kVA bị đọc "≥ 20 kVA", IB2400030247: 50 kVA đọc 60, IB2600245437: 30 và 60 kVA đọc 2.300): hiện nay loại oan các dòng của cỡ nhỏ; 1 ca (IB2600354007 15 kVA đọc 30 từ khối 30 kVA).

## Soát tay các ca BỎ (81 ca: 52 ngưỡng động cơ + 29 ngưỡng công suất; danh sách đủ ở cuối)
Phân loại tự động (theo vị trí ngưỡng): A = cỡ có khối nhận ra riêng nhưng không nêu ngưỡng, ngưỡng nằm trong khối cỡ khác có nhãn: **24**; B = cỡ không có khối nhận ra, ngưỡng nằm trong khối cỡ khác có nhãn: **24**; C = ngưỡng nằm trong khối "không gán được cỡ" hoặc lẫn: **33**. Soát tay đọc văn bản quanh 19 mục (gói, cỡ, ngưỡng):
- Đúng là ngưỡng cỡ khác (bỏ đúng, trước đây loại oan): IB2300260615 (500 kVA nhận ≤ 66 L của 2.000 kVA; 2.000 kVA nhận "< 20 L" của 500), IB2400114476 (45 kVA nhận "≤ 1,826 L" của 12 kVA), IB2400311120 (30 và 45 kVA cùng ngưỡng 1,826 L), IB2300293753 (36 và 200 kVA nhận ≥ 1,3 L của 10 kVA), IB2400487460 (40 kVA nhận ≤ 2,3 L, ≥ 3 xi lanh, ≤ 3,5 L/h của máy 8,8 kVA), IB2600354007 (15 kVA nhận ≤ 4 L, ≥ 4 xi lanh, Prime ≥ 30 của 30 kVA), IB2200016981 (8 kVA nhận ≥ 4 xi lanh của 40 kVA), IB2200062073 và IB2300120176 (12,5 kVA nhận ≥ 2,3 L, ≥ 4 xi lanh, 8 L/h ở 75% của 30 / 40 kVA), IB2400186078 (12 kVA nhận ngưỡng của 6 kVA), IB2400275648 (60 kVA nhận ≥ 4 xi lanh của 30 kVA).
- **Có thể là ngưỡng chung hợp lệ bị bỏ (luật chưa nới, nêu để bạn biết)**: IB2300245556 (12,5 kVA: ≥ 2,3 L và ≥ 4 xi lanh có ở khối 8,5 kVA và 10,5 kVA, khối 12,5 kVA không có phần động cơ: bảng kỹ thuật chung cho cả ba máy nhỏ), IB2300245748 (10 và 12 kVA: 2,3 L và 4 xi lanh lặp ở 3 khối khác), IB2400125924 (12,5 kVA: ≥ 3 xi lanh ở 2 khối khác): tổng **12 ca (≥ 2 khối khác nêu cùng một giá trị mà khối của cỡ không nêu)** theo phép đếm tự động, trong đó 5 ca của IB2400487460 thật ra đúng là bỏ đúng (ngưỡng của máy 8,8 kVA) nên còn ~7 ca nghi trong 3 gói (IB2300245556, IB2300245748, IB2400125924).
- Ngưỡng nằm trong khối "không gán được cỡ" vì câu công suất của khối đó không khớp cỡ nào (33 ca, loại C): IB2200046063 (câu "Công suất liên tục tại 40°C Class H ≥ 14,5 kVA" và "≥ 15,5 kVA" là công suất đầu phát nên khối không thuộc 10,5 / 13,5 kVA; ≥ 2,5 L và ≥ 4 xi lanh có thể là ngưỡng đúng của máy 10,5 kVA và bị bỏ), IB2500039578 (550 / 2.500 kVA: ≥ 13 L, ≥ 6 xi lanh, ≤ 60,2 L trong khối không gán được; 60,2 L là của 2.500 kVA), IB2500280002 và IB2500415487 (11/15 và 12,5/15 kVA: ≥ 2 và ≥ 3 xi lanh), IB2400145438 (7/12/13,7 kVA: ≥ 3 xi lanh, ≤ 2,8 L/h), IB2400427929 (≥ 4 xi lanh trong khối 45 kVA bị bỏ ở 8,5 / 20 / 30 / 60 kVA). Với loại C không biết khối đó của cỡ nào: bỏ là an toàn nhưng có thể mất ngưỡng đúng của chính cỡ đó (một phần nhóm này là "ngưỡng đúng của cỡ có khối không nhận ra"). Cách làm tốt lên nếu bạn muốn (chưa làm): nhận thêm kiểu câu "đầu phát ≥ kVA" và kW làm dấu hiệu cỡ.
Kết luận soát tay: không có ca nào là lỗi mã hay lấy nhầm cỡ; có khoảng 7 ca (3 gói) có thể là ngưỡng chung bị bỏ do luật an toàn, và nhóm C (33) có thể chứa ngưỡng đúng bị bỏ vì khối không nhận ra cỡ.

## Soát tay các ca ĐƯỢC mới (Prime tối thiểu, 87 ca)
Đọc 23 ca rải đều (in dòng nêu và dòng đầu khối): IB2200016981 40 kVA (≥ 40,0 kVA/32 kW), IB2200087789 400 kVA (≥ 400 kVA/320 kW), IB2300044204 14 kVA (Continuous Power ≥ 14 kVA), IB2300162912 2.275 kVA (≥ 2275 kVA/1820 kW; câu đầu khối "≥ 2500 kVA/2000 kW" là standby), IB2300243355 450 kVA, IB2300260615 2.000 kVA, IB2300274793 250 kVA, IB2300389043 100 kVA, IB2400058723 800 kVA, IB2400125924 8,5 kVA, IB2400249622 160 kVA, IB2400299108 60 kVA, IB2400365165 7,2 kVA, IB2400508791 7 kVA (≥ 7 kVA (5,6 kW)), IB2500089757 200 kVA, IB2500287209 10 kVA, IB2500327119 320 kVA, IB2500500319 12 kVA (câu đầu khối "≥ 13,2 kVA" là standby), IB2600046158 500 kVA, IB2600112737 200 kVA, IB2600164177 160 kVA, IB2600334541 250 kVA, IB2600594596 400 kVA. Cả 23 là "Công suất liên tục (Prime) ≥ N kVA" của đúng cỡ đó trong khối của nó, giá trị = cỡ. Phát hiện duy nhất: 6/93 giá trị đọc nhầm (khối 20 kVA ra 30; 30 ra 45; 45 ra 60; 10,5 ra 12; 30 ra 59,5; 200 ra 100): do đó thêm luật "Prime tối thiểu phải bằng cỡ (±0,6%) hoặc null". Sau luật: được 87, đều bằng cỡ. Prime tối thiểu loại thêm các dòng có Prime < cỡ (dù Standby ≥ cỡ) nên là ngưỡng loại nhiều dòng nhất (xem IB2600594596 bên dưới: 513 dòng của cỡ 400).

## 12 gói / 14 cỡ và IB2600594596 (hồi quy)
- 10 gói một cỡ: hints giống hệt, catalog.md giống hệt md5, số dòng loại giống nhau. IB2600592684 (30 và 500 kVA): không có câu công suất tổ máy nhận ra, nên vẫn đọc toàn văn (3,9 L cho cả hai, như hiện nay), catalog.md giống hệt.
- IB2600594596:
  - **400 kVA** (≥ 14,5 L, ≥ 8 xi lanh, Prime ≥ 400): 1.539 / 1.862 dòng trong dải bị loại (xi lanh 1.442, dung tích 1.082, Prime 513; một dòng có thể dính nhiều lý do), 202 động cơ có dòng bị loại. QSG12-G4: bị loại (6 dòng, dung tích + xi lanh), TAD1355GE: bị loại (16 dòng), YC6K520-D30: bị loại (19 dòng); trong 30 dòng trước, TAD1355GE có 2 dòng, YC6K520-D30 có 2 dòng nay ra khỏi 30. **Rehlko P158LE còn** (2 dòng của rehlko và aosif, 0 dòng bị loại). 26 trong 30 dòng cũ ra khỏi 30.
  - **300 kVA** (≥ 9 L, ≥ 6 xi lanh, Prime ≥ 300): 404 / 1.558 dòng bị loại (Prime 288, dung tích 190, xi lanh 3), 82 động cơ; 5 dòng cũ ra khỏi 30 (yongcai-elecmama:NTA855-G1A, uleengen:1506A-E88TAG5, dingbo:NTA855-G1A, jet-power:TAD842GE, fg-wilson:1506A-E88TAG5; hay gặp: 1506A-E88TAG5 ×56 dòng, 6LTAA9.5-G3 ×35 vì Prime < 300; 6LTAA8.9 / QSL8.9 vì dung tích < 9 L). QSG12-G4 / TAD1355GE / YC6K520-D30 / P158LE không có dòng nào trong dải 300 kVA (không liên quan).
  - **Cấu hình lượt trước (configmatch) rơi vì ngưỡng mới: 0 ở cả hai cỡ.** 300 kVA: #1 QSL9-G5, #2 P126TI-II, #3 6LTAA9.5-G1, #4 YC6MK420-D30, #5 YC6MK420L-D20, #6 WP10D320E200: đều không có dòng bị loại và còn nguyên số dòng trong 30. 400 kVA: #1 P158LE (rehlko) và #2 P158LE (aosif): còn.

## Test
`node --test` (suppliers/): 331 pass, 0 fail (323 + 8 mới); `node suppliers/verify.mjs` 0 lỗi. Test mới: hai khối đọc đúng ngưỡng từng cỡ (≥14,5 / ≥8 và ≥9 / ≥6), `engineMins` toàn văn vẫn null; không `sizing` / chỉ một cỡ → như cũ; tiêu hao + Prime theo khối; ngưỡng chung ngoài khối đi cho mọi cỡ; ngưỡng chỉ có ở khối cỡ khác → null; các khối cùng cỡ mâu thuẫn → null, đồng ý → giá trị; câu công suất khớp hai cỡ → khối không cỡ; biên prime 0,995 và standby 1,0–1,2; không có câu công suất → như cũ; yêu cầu bổ sung ở ngoài khối.

## Rủi ro
- Chỉ gói nhiều cỡ có câu công suất tổ máy nhận ra mới đổi (65/243); 178 gói vẫn null như cũ khi hai cỡ khác ngưỡng.
- Bỏ (81 ca) có thể mất ngưỡng chung hoặc ngưỡng đúng của cỡ có khối không nhận ra (xem soát tay); mất ngưỡng chỉ làm lọc ít đi, không bao giờ gán nhầm.
- Phần chung ở cuối văn bản sau khối cuối bị tính vào khối cuối (chưa đóng khối ở tiêu đề cấp cao theo quyết định điều phối): ngưỡng ghi ở đó sẽ gán cho cỡ cuối; chỉ mất / gán cho cỡ cuối, không gán cho cỡ khác.
- IB2600594596 400 kVA: ngưỡng ≥ 8 xi lanh loại 83% dòng trong dải (chủ yếu động cơ 6 xi lanh 12–13 L): đúng theo HSMT nhưng còn ít động cơ V8+ trong catalog nên danh sách 30 dòng sẽ nghèo dữ liệu hơn; nhưng cấu hình đang chọn không rơi.
- Chỗ gọi `hintsOf` ở đường `keepFound` / catalogMd cho Tìm NCC (config-bot.mjs ~3441) vẫn đọc toàn văn (không truyền cỡ): gói nhiều cỡ vẫn thấy ngưỡng null ở đó (lọc ít hơn, không sai).
- Quay lui: revert PR; sau merge restart bot.

## Chưa làm
- Đóng khối ở tiêu đề cấp cao (quyết định điều phối: không làm trong PR này).
- Câu công suất tính bằng kW hay công suất đầu phát làm dấu cỡ (sẽ cứu một phần nhóm C).
- Chưa chạy agent thật; hồi quy dùng bản chụp 12/11 và configmatch lượt trước.
- Truyền cỡ cho đường `keepFound` (xem rủi ro).

## Danh sách 81 ca BỎ (gói | cỡ (các cỡ của gói) | ngưỡng | hiện nay | sau | loại A/B/C | giá trị của từng khối: "<cỡ khối>:<giá trị hoặc ->")
| gói | cỡ | ngưỡng | hiện nay | sau | loại | khối |
|---|---|---|---|---|---|---|
| IB2200016981 | 8 kVA (8 kVA | 40 kVA) | minCyl | 4 | null | A | 8 kVA:- ?:- 40 kVA:4 |
| IB2200046063 | 10,5 kVA (10,5 kVA | 13,5 kVA) | minDisp | 2.5 | null | C | ?:2.5 ?:- |
| IB2200046063 | 10,5 kVA (10,5 kVA | 13,5 kVA) | minCyl | 4 | null | C | ?:4 ?:- |
| IB2200046063 | 13,5 kVA (10,5 kVA | 13,5 kVA) | minDisp | 2.5 | null | C | ?:2.5 ?:- |
| IB2200046063 | 13,5 kVA (10,5 kVA | 13,5 kVA) | minCyl | 4 | null | C | ?:4 ?:- |
| IB2200062073 | 12,5 kVA (12,5 kVA | 30 kVA) | minDisp | 2.3 | null | B | ?:- 30 kVA:2.3 |
| IB2300030459 | 7.500 kVA (2.250 kVA | 7.500 kVA) | minPrime | 2250 | null | B |  |
| IB2300042764 | 7.500 kVA (2.250 kVA | 7.500 kVA) | minPrime | 2250 | null | B |  |
| IB2300108940 | 10 kVA (10 kVA | 20 kVA) | minPrime | 20 | null | B |  |
| IB2300120176 | 12,5 kVA (12,5 kVA | 40 kVA) | minDisp | 2.3 | null | B | ?:- 40 kVA:2.3 |
| IB2300120176 | 12,5 kVA (12,5 kVA | 40 kVA) | minCyl | 4 | null | B | ?:- 40 kVA:4 |
| IB2300120176 | 12,5 kVA (12,5 kVA | 40 kVA) | maxFuel75 | 8 | null | B | ?:- 40 kVA:8 |
| IB2300162912 | 750 kVA (750 kVA | 2.275 kVA) | maxFuel75 | 370 | null | A | 2.275 kVA:370 750 kVA:- ?:- |
| IB2300162912 | 750 kVA (750 kVA | 2.275 kVA) | maxFuel50 | 251.8 | null | A | 2.275 kVA:251.8 750 kVA:- ?:- |
| IB2300232850 | 12,5 kVA (12,5 kVA | 27 kVA) | minCyl | 4 | null | A | 12,5 kVA:- ?:- 27 kVA:4 ?:- |
| IB2300245556 | 12,5 kVA (8,5 kVA | 10,5 kVA | 12,5 kVA) | minDisp | 2.3 | null | A | 8,5 kVA:2.3 10,5 kVA:2.3 12,5 kVA:- |
| IB2300245556 | 12,5 kVA (8,5 kVA | 10,5 kVA | 12,5 kVA) | minCyl | 4 | null | A | 8,5 kVA:4 10,5 kVA:4 12,5 kVA:- |
| IB2300245748 | 10 kVA (8,5 kVA | 10 kVA | 12 kVA) | minDisp | 2.3 | null | C | 8,5 kVA:2.3 ?:2.3 ?:2.3 ?:- |
| IB2300245748 | 10 kVA (8,5 kVA | 10 kVA | 12 kVA) | minCyl | 4 | null | C | 8,5 kVA:4 ?:4 ?:4 ?:- |
| IB2300245748 | 12 kVA (8,5 kVA | 10 kVA | 12 kVA) | minDisp | 2.3 | null | C | 8,5 kVA:2.3 ?:2.3 ?:2.3 ?:- |
| IB2300245748 | 12 kVA (8,5 kVA | 10 kVA | 12 kVA) | minCyl | 4 | null | C | 8,5 kVA:4 ?:4 ?:4 ?:- |
| IB2300260615 | 500 kVA (500 kVA | 2.000 kVA) | maxDisp | 66 | null | A | 500 kVA:- 2.000 kVA:66 |
| IB2300260615 | 2.000 kVA (500 kVA | 2.000 kVA) | minDisp | 20 | null | A | 500 kVA:20 2.000 kVA:- |
| IB2300273061 | 100 kVA (100 kVA | 160 kVA | 250 kVA) | maxFuel50 | 36 | null | A | 100 kVA:- 160 kVA:- 250 kVA:36 |
| IB2300273061 | 160 kVA (100 kVA | 160 kVA | 250 kVA) | maxFuel50 | 36 | null | A | 100 kVA:- 160 kVA:- 250 kVA:36 |
| IB2300293753 | 36 kVA (10 kVA | 36 kVA | 200 kVA) | minDisp | 1.3 | null | A | 10 kVA:1.3 36 kVA:- 200 kVA:- |
| IB2300293753 | 200 kVA (10 kVA | 36 kVA | 200 kVA) | minDisp | 1.3 | null | A | 10 kVA:1.3 36 kVA:- 200 kVA:- |
| IB2400030247 | 50 kVA (50 kVA | 60 kVA) | minPrime | 60 | null | B |  |
| IB2400114476 | 12 kVA (12 kVA | 45 kVA) | minDisp | 4.5 | null | A | 12 kVA:- 45 kVA:4.5 ?:- |
| IB2400114476 | 45 kVA (12 kVA | 45 kVA) | maxDisp | 1.826 | null | A | 12 kVA:1.826 45 kVA:- ?:- |
| IB2400125924 | 12,5 kVA (8,5 kVA | 12,5 kVA) | minCyl | 3 | null | C | 8,5 kVA:3 ?:3 ?:- |
| IB2400145438 | 7 kVA (7 kVA | 12 kVA | 13,7 kVA) | minCyl | 3 | null | C | 12 kVA:- ?:3 |
| IB2400145438 | 7 kVA (7 kVA | 12 kVA | 13,7 kVA) | maxFuel | 2.8 | null | C | 12 kVA:- ?:2.8 |
| IB2400145438 | 12 kVA (7 kVA | 12 kVA | 13,7 kVA) | minCyl | 3 | null | C | 12 kVA:- ?:3 |
| IB2400145438 | 12 kVA (7 kVA | 12 kVA | 13,7 kVA) | maxFuel | 2.8 | null | C | 12 kVA:- ?:2.8 |
| IB2400145438 | 13,7 kVA (7 kVA | 12 kVA | 13,7 kVA) | minCyl | 3 | null | C | 12 kVA:- ?:3 |
| IB2400145438 | 13,7 kVA (7 kVA | 12 kVA | 13,7 kVA) | maxFuel | 2.8 | null | C | 12 kVA:- ?:2.8 |
| IB2400186078 | 12 kVA (6 kVA | 12 kVA) | minDisp | 0.499 | null | B | 6 kVA:0.499 ?:- |
| IB2400186078 | 12 kVA (6 kVA | 12 kVA) | minCyl | 1 | null | B | 6 kVA:1 ?:- |
| IB2400186078 | 12 kVA (6 kVA | 12 kVA) | maxFuel | 4.2 | null | B | 6 kVA:4.2 ?:- |
| IB2400186078 | 12 kVA (6 kVA | 12 kVA) | maxFuel75 | 3.2 | null | B | 6 kVA:3.2 ?:- |
| IB2400218348 | 30 kVA (30 kVA | 250 kVA) | maxFuel75 | 42.6 | null | A | 30 kVA:- 250 kVA:42.6 |
| IB2400248480 | 7.500 kVA (2.250 kVA | 7.500 kVA) | minPrime | 2250 | null | B |  |
| IB2400275648 | 60 kVA (30 kVA | 60 kVA) | minCyl | 4 | null | A | 30 kVA:4 60 kVA:- |
| IB2400311120 | 30 kVA (12 kVA | 30 kVA | 45 kVA) | maxDisp | 1.826 | null | A | 12 kVA:1.826 30 kVA:- 45 kVA:- |
| IB2400311120 | 45 kVA (12 kVA | 30 kVA | 45 kVA) | maxDisp | 1.826 | null | A | 12 kVA:1.826 30 kVA:- 45 kVA:- |
| IB2400365165 | 7,2 kVA (7,2 kVA | 12,5 kVA) | maxFuel75 | 4.5 | null | A | 12,5 kVA:4.5 ?:- 7,2 kVA:- ?:- |
| IB2400427929 | 8,5 kVA (8,5 kVA | 20 kVA | 30 kVA | 45 kVA | 60 kVA) | minCyl | 4 | null | A | 8,5 kVA:- ?:- 20 kVA:- 30 kVA:- 45 kVA:4 60 kVA:- |
| IB2400427929 | 20 kVA (8,5 kVA | 20 kVA | 30 kVA | 45 kVA | 60 kVA) | minCyl | 4 | null | A | 8,5 kVA:- ?:- 20 kVA:- 30 kVA:- 45 kVA:4 60 kVA:- |
| IB2400427929 | 30 kVA (8,5 kVA | 20 kVA | 30 kVA | 45 kVA | 60 kVA) | minCyl | 4 | null | A | 8,5 kVA:- ?:- 20 kVA:- 30 kVA:- 45 kVA:4 60 kVA:- |
| IB2400427929 | 60 kVA (8,5 kVA | 20 kVA | 30 kVA | 45 kVA | 60 kVA) | minCyl | 4 | null | A | 8,5 kVA:- ?:- 20 kVA:- 30 kVA:- 45 kVA:4 60 kVA:- |
| IB2400487460 | 8,8 kVA (8,8 kVA | 40 kVA) | minDisp | 3.9 | null | B | ?:- ?:- ?:- 40 kVA:3.9 ?:- ?:- ?:- ?:- 40 kVA:3.9 ?:- |
| IB2400487460 | 8,8 kVA (8,8 kVA | 40 kVA) | maxDisp | 2.3 | null | C | ?:2.3 ?:- ?:- 40 kVA:- ?:- ?:2.3 ?:- ?:- 40 kVA:- ?:- |
| IB2400487460 | 8,8 kVA (8,8 kVA | 40 kVA) | minCyl | 3 | null | C | ?:3 ?:- ?:- 40 kVA:- ?:- ?:3 ?:- ?:- 40 kVA:- ?:- |
| IB2400487460 | 8,8 kVA (8,8 kVA | 40 kVA) | maxFuel | 3.5 | null | C | ?:3.5 ?:- ?:- 40 kVA:null ?:- ?:3.5 ?:- ?:- 40 kVA:null ?:- |
| IB2400487460 | 40 kVA (8,8 kVA | 40 kVA) | maxDisp | 2.3 | null | C | ?:2.3 ?:- ?:- 40 kVA:- ?:- ?:2.3 ?:- ?:- 40 kVA:- ?:- |
| IB2400487460 | 40 kVA (8,8 kVA | 40 kVA) | minCyl | 3 | null | C | ?:3 ?:- ?:- 40 kVA:- ?:- ?:3 ?:- ?:- 40 kVA:- ?:- |
| IB2400487460 | 40 kVA (8,8 kVA | 40 kVA) | maxFuel | 3.5 | null | C | ?:3.5 ?:- ?:- 40 kVA:null ?:- ?:3.5 ?:- ?:- 40 kVA:null ?:- |
| IB2500027056 | 10.000 kVA (2.250 kVA | 10.000 kVA) | minPrime | 2250 | null | B |  |
| IB2500039578 | 550 kVA (550 kVA | 2.500 kVA) | minDisp | 13 | null | C | 2.500 kVA:- ?:- ?:- ?:- 550 kVA:- ?:13 550 kVA:- ?:- |
| IB2500039578 | 550 kVA (550 kVA | 2.500 kVA) | maxDisp | 60.2 | null | C | 2.500 kVA:- ?:60.2 ?:- ?:- 550 kVA:- ?:- 550 kVA:- ?:- |
| IB2500039578 | 550 kVA (550 kVA | 2.500 kVA) | minCyl | 6 | null | C | 2.500 kVA:- ?:- ?:- ?:- 550 kVA:- ?:6 550 kVA:- ?:- |
| IB2500039578 | 550 kVA (550 kVA | 2.500 kVA) | maxFuel | 104.2 | null | C | 2.500 kVA:- ?:null ?:- ?:- 550 kVA:- ?:104.2 550 kVA:- ?:- |
| IB2500039578 | 2.500 kVA (550 kVA | 2.500 kVA) | minDisp | 13 | null | C | 2.500 kVA:- ?:- ?:- ?:- 550 kVA:- ?:13 550 kVA:- ?:- |
| IB2500039578 | 2.500 kVA (550 kVA | 2.500 kVA) | maxDisp | 60.2 | null | C | 2.500 kVA:- ?:60.2 ?:- ?:- 550 kVA:- ?:- 550 kVA:- ?:- |
| IB2500039578 | 2.500 kVA (550 kVA | 2.500 kVA) | minCyl | 6 | null | C | 2.500 kVA:- ?:- ?:- ?:- 550 kVA:- ?:6 550 kVA:- ?:- |
| IB2500039578 | 2.500 kVA (550 kVA | 2.500 kVA) | maxFuel | 104.2 | null | C | 2.500 kVA:- ?:null ?:- ?:- 550 kVA:- ?:104.2 550 kVA:- ?:- |
| IB2500280002 | 11 kVA (11 kVA | 15 kVA) | minCyl | 2 | null | C | 15 kVA:- ?:- 15 kVA:- 11 kVA:- ?:2 11 kVA:- |
| IB2500280002 | 15 kVA (11 kVA | 15 kVA) | minCyl | 2 | null | C | 15 kVA:- ?:- 15 kVA:- 11 kVA:- ?:2 11 kVA:- |
| IB2500287209 | 10 kVA (10 kVA | 25 kVA) | maxFuel75 | 5.7 | null | A | 25 kVA:5.7 10 kVA:- |
| IB2500394492 | 1.600 kVA (750 kVA | 1.600 kVA) | minPrime | 750 | null | B |  |
| IB2500403535 | 8,5 kVA (8,5 kVA | 12 kVA) | minCyl | 3 | null | B | 12 kVA:3 |
| IB2500415487 | 12,5 kVA (12,5 kVA | 15 kVA) | minCyl | 3 | null | C | ?:3 15 kVA:- |
| IB2500415487 | 15 kVA (12,5 kVA | 15 kVA) | minCyl | 3 | null | C | ?:3 15 kVA:- |
| IB2500512614 | 22 kVA (22 kVA | 40 kVA) | minPrime | 40 | null | B |  |
| IB2600245437 | 30 kVA (30 kVA | 60 kVA) | minPrime | 2300 | null | B |  |
| IB2600245437 | 60 kVA (30 kVA | 60 kVA) | minPrime | 2300 | null | B |  |
| IB2600354007 | 15 kVA (15 kVA | 30 kVA) | maxDisp | 4 | null | B | 30 kVA:4 |
| IB2600354007 | 15 kVA (15 kVA | 30 kVA) | minCyl | 4 | null | B | 30 kVA:4 |
| IB2600354007 | 15 kVA (15 kVA | 30 kVA) | minPrime | 30 | null | B | 30 kVA:30 |
| IB2600354007 | 15 kVA (15 kVA | 30 kVA) | maxFuel | 11 | null | B | 30 kVA:11 |
