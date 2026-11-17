# mins-fix: nghiệm thu (PR nháp #564)

PR nháp https://github.com/khoanguyenminh6868/GenSet-Pro/pull/564, nhánh `mins-fix`, worktree `C:\Projects\GenSet Pro\wt-mins-fix`. Đầu nhánh `a01e47d` = 3 commit sửa (`0874e68`, `896b485`, `867baf4`) + gộp `origin/main` (#562 `read-guard`, #563 `technicalPart`/`tpCut`). Xung đột duy nhất ở `suppliers/config-bot.mjs` (`technicalPart`): giữ cả `.normalize("NFC")` của nhánh và `tpCut = false` của main (`densest` / `tpCut` / `hsmtGaps` nguyên vẹn).

## Lệnh kiểm đã chạy sau khi gộp
- `node --test suppliers/`: **366 tests, 366 pass, 0 fail** (352 trước gộp + test của #562/#563).
- `node suppliers/verify.mjs`: **433 bản ghi, 0 có lỗi**.

## Trạng thái từng mục
| mục | trạng thái |
|---|---|
| 1 `<`/`nhỏ hơn`/`dưới` là tối đa | xong, test IB2300260615, IB2400564384, IB2500360231, "Số xy lanh <6/<3" |
| 2 dung tích làm mát/nước/bồn/nhớt | xong, test IB2300214975, IB2500314401, IB2300031444, IB2500456429 |
| 3 `litres()` khi >100 L | xong (`litres`, `dispLitres`) |
| 4 minPrime nhầm số Standby | xong, test IB2200021335, IB2300237033 |
| 5 NFD | xong (`unflatten`, `technicalPart`, `hintsOf`) |
| 6 gói nhiều cỡ | IB2400311120, IB2400487460 hết nhờ #561. **IB2300363623 (5 kW + 15 kVA, HSMT ghi "Công suất liên tục: SkW" không có dấu ≥): CHƯA LÀM, không sửa** (cả hai cỡ vẫn nhận minDisp 1,758 L của cỡ 15 kVA). Hướng: nhận "nhãn Liên tục/Prime + ':' + số" không dấu, cẩn thận nhiễu đầu phát |
| 7 minPrime từ mục đầu phát/động cơ | xong: giữ nhưng đánh dấu `fromOther`, `plausible()` bỏ nếu lệch cỡ >1,2% |
| 8 thiết bị khác (xe nâng, cầu trục) | xong (`withoutOtherEquipment`) |
| 9 loại do một nguồn | chỉ đo (bên dưới), không đổi luật |
| dải ≤30 kVA | xong: 100–140% cho ≤30 kVA (24 kW), >30 kVA giữ 100–120%; `sizeBlocks` cố ý giữ `NEAR_HIGH` 1,2 (quan hệ standby/prime của một tổ máy, không phải dải ứng viên) |

## 16 ca soát tay của kiem-rong
15/16 hết (có test hoặc kiểm trên văn bản thật, ngưỡng nằm trong danh sách 47 bên dưới). **Còn 1 ca: IB2300363623** (M19/M88/M89 trong kiem-rong; xem mục 6). 10 ngưỡng sai: #19/#20 (`< 20 lít`), #37 (làm mát), #62 (Prime đầu phát), #22/#30 (đa cỡ, nhờ #561) đã hết; 6 dòng oan: #66 (xe nâng), #11/#12/#52 (bồn, số thứ tự dòng), M20, M21 (`litres`) đã hết, M35 là mục 9.

## Số đo dòng bị loại, mã trước (87dda3d) so mã sau (đo bằng `cand2.mjs`, mã trước chạy trên 38 lượt đổi ngưỡng)
Đo trước khi gộp main mới (#562/#563 chỉ đổi `technicalPart`/`tpCut`, chưa chạy lại; xem "chưa kiểm").

38 lượt đổi ngưỡng: tổng dòng bị loại **14.279 → 10.344**. Gói điều phối nêu (rows = dòng còn xếp hạng; loại theo lý do disp/maxDisp/cyl/prime):
| gói (cỡ) | rows | bị loại | lý do loại |
|---|---|---|---|
| IB2300260615 / IB2400564384 (500 kVA) | 483 → 1.184 | 1.283 → 582 | disp 1.167 → 0, maxDisp 0 → 172 (đúng: `< 20 L` là tối đa) |
| IB2500360231 (2.500 kVA) | 6 → 8 | 2 → 0 | disp 2 → 0 |
| IB2300214975 (300 kVA) | 217 → 1.008 | 1.283 → 492 | disp 1.234 → 319 (ngưỡng 22 → 9,7 L) |
| IB2300031444 (500 kVA) | 304 → 1.340 | 1.462 → 426 | disp 1.361 → 17 (55 → 12,5 L) |
| IB2500314401 (350 kVA) | 288 → 387 | 1.582 → 1.483 | disp 1.532 → 0, maxDisp 0 → 1.314 (42 L làm mát → tối đa 9,84 L) |
| IB2500110816 (2.400 kW) | 274 → 299 | 25 → 0 | disp 25 → 0 |
| IB2200021335 / IB2200075147 (163 kVA) | 566 → 1.293 | 727 → 0 | prime 727 → 0 (180 kVA Standby không còn là minPrime) |
Lưu ý IB2500314401: nay còn loại 1.314 dòng bằng maxDisp 9,84 L, phải đối chiếu tay (nếu 9,84 L đúng là "tối đa" thì đúng; nếu là dung tích thật của một động cơ cụ thể thì nên là so khớp, chưa kiểm HSMT).

## Thiếu ứng viên (56 cỡ của kiem-rong: có ứng viên ở dải cũ mà dải mới <5 dòng)
Đo lại bằng mã mới + dải 100–140% (≤30 kVA): **45 cỡ hết (≥5 dòng); còn 11 cỡ <5**, trong đó 2 cỡ (IB2600304011, IB2600126365, 2.400 kW) không chạy lại vì ngoài tập đo, giữ nguyên 0 dòng (cỡ ngoài catalog). 9 cỡ đã đo lại: 
- ≤30 kVA còn <5: **5 cỡ** — IB2300249535 (5 kVA: 1 dòng, dải cũ cũng chỉ 1), IB2300223728 (5 kVA: 1 dòng), IB2600545098 (4,5 kVA: 1 dòng), IB2400186078 (6 kVA: 0 → 1 dòng), IB2400482562 (23 kVA: 3 → 4 dòng; loại cyl 2). Cả 5 là cỡ nhỏ catalog gần như không có (dải cũ ≤1 dòng, trừ 23 kVA).
- >30 kVA còn <5: **4 cỡ**, do ngưỡng không do dải: IB2400475109 và IB2400446772 (1.000 kVA, 10 trong dải, loại cyl 4 + prime 2), IB2600243028 (800 kVA, loại disp 5 cyl 8 prime 5), IB2500381511 (2.573 kVA, nBand 4).
Trong 445 lượt ≤30 kVA đo bằng mã mới chỉ **6** lượt nRows <5 (5 cỡ trên + 1 cỡ khác không thuộc 56).

## Mục 9: loại chỉ dựa một nguồn (chỉ đo, 782 lượt, 337 lượt có ≥1 dòng bị loại chỉ vì một nguồn)
Tổng dòng bị loại: do dung tích 53.332, do xi lanh 45.904. Theo số nguồn của số liệu làm loại dòng:
| loại | 1 nguồn | 2 nguồn | 3+ nguồn | không nguồn |
|---|---|---|---|---|
| disp (dung tích) | 11.511 (21,6%) | 9.514 (17,8%) | 31.235 (58,6%) | 1.072 (2,0%) |
| cyl (số xi lanh) | 3.821 (8,3%) | 3.793 (8,3%) | 38.290 (83,4%) | 0 |
Dòng bị loại **chỉ vì** một nguồn (không còn lý do nào khác): disp **6.971**, cyl **2.368**. Tập trung nhiều ở IB2300253626 (233 dòng disp), IB2200067764 (172), IB2400217107 (156); cyl: IB2200106999 (75), IB2300298164 (74), IB2300340114 (71).
Giới hạn: `src.sources` đếm số nguồn của con số, **chưa tách "datasheet hãng" với "dòng bảng NCC"**, nên 1 nguồn có thể là datasheet hãng (đáng tin). Số liệu chặn trên của "chỉ dựa một dòng bảng NCC lẻ".
**Đề xuất (chưa làm)**: chỉ loại khi số liệu có datasheet hãng hoặc ≥2 nguồn; một dòng bảng NCC lẻ thì trừ điểm/đánh dấu chứ không loại. Trước khi đổi, ghi thêm loại nguồn (datasheet/bảng) vào `src` rồi đo lại để biết số dòng thật sự được cứu (≤ 6.971 + 2.368).

## 47 thay đổi ngưỡng (38 lượt / 36 gói; mã trước → mã sau theo `plausible()`; đã soát tay từng ca: không ca nào từ đúng thành sai)
Ghi chú: tên cột = loại ngưỡng; `lượt` = số thứ tự cỡ trong gói (null = một cỡ).
**Bỏ (lost, 23):** IB2300260615|0 minDisp 20; IB2300293753|1 minCyl 3; IB2300293753|2 minCyl 6; IB2500249901|0 minDisp 40; IB2500249901|1 minDisp 66; IB2200016199 minPrime 12kVA; IB2200021335 minPrime 180kVA; IB2200075147 minPrime 180kVA; IB2300230061 minPrime 136kVA; IB2300254910 minPrime 12kVA; IB2300266461 minPrime 42kVA; IB2300278731 minCyl 6; IB2400475145 minPrime 10kVA; IB2400564384 minDisp 20; IB2500110812 minDisp 2; IB2500110816 minDisp 2; IB2500235727 minPrime 200kVA; IB2500314401 minDisp 42; IB2500360231 minDisp 78; IB2500386455 minPrime 60kVA; IB2500442970 minPrime 13kVA; IB2500456429 minDisp 4,3; IB2600511196 minPrime 900kVA.
**Được (gained, 21):** IB2300260615|0 maxDisp 20; IB2500114642|2 minCyl 6; IB2500249901|0 maxDisp 40; IB2500249901|1 maxDisp 66; IB2200067367 minDisp 6; IB2300147640 minDisp 10,09; IB2300217401 minDisp 2,156; IB2300255495 minDisp 2,156; IB2300364915 maxDisp 14,6; IB2400440257 minDisp 2,672 và minCyl 4; IB2400491226 minDisp 7,47; IB2400564384 maxDisp 20; IB2500068145 maxFuel75 300 và maxFuel50 215; IB2500314401 maxDisp 9,84; IB2500360231 maxDisp 78; IB2500364714 minPrime 500kVA; IB2600217137 minDisp 13; IB2600308125 maxFuel 85; IB2600511196 minDisp 25.
**Đổi (changed, 3):** IB2300031444 minDisp 55 → 12,5; IB2300214975 minDisp 22 → 9,7; IB2400470242 minPrime 30kVA → 33kVA.
Theo loại: minDisp được 8 / bỏ 9 / đổi 2; maxDisp được 7 / bỏ 0; minCyl được 2 / bỏ 3; minPrime được 1 / bỏ 11 / đổi 1; maxFuel (100/75/50) mỗi cái được 1.

## Rủi ro
- `fromOther` (mục 7) giữ ngưỡng minPrime từ phần động cơ/đầu phát nếu bằng cỡ (giữ 47 ngưỡng đúng) và bỏ 9 ca lệch cỡ >1,2%: cỡ kW chưa có test (`plausible` nhánh `fromOther` với cỡ kW).
- `DISP_LABEL`/`DISP_BARE`/`ENGINE_LINES` là danh sách nhãn: mỗi lần thu hẹp phải chạy `diff2.mjs` xem có ngưỡng ĐÚNG biến mất không (đã từng mất 26).
- Dải 100–140% cho ≤30 kVA làm Tìm NCC (`mergeFind`/`fitsCap`/`engineRows`) đổi theo, và catalog.md/`config-prompt.md` đổi chữ; dải >30 kVA không đổi.
- Quay lui: revert 3 commit `0874e68`, `896b485`, `867baf4` (độc lập theo phần: dải ≤30 kVA nằm riêng ở `896b485`).

## Chưa kiểm / chưa làm
- Số đo ở trên làm TRƯỚC khi gộp main mới; chưa chạy lại `thr2.mjs`/`cand2.mjs` sau gộp (#562/#563 chỉ đụng `technicalPart`/`tpCut`, nhưng HSMT >250.000 ký tự có thể đổi ngưỡng).
- IB2300363623 (mục 6): chưa làm.
- Test còn thiếu: số thứ tự dòng "4 xi lanh, …" (L1); `sizeBlocks` có `kwSizes` (cần văn bản thật có "≥ 5 kW"); `plausible` nhánh `fromOther` cỡ kW; L2 (con số trần = tối thiểu) chờ quyết; L5 (cận 0,995).
- IB2500314401 (maxDisp 9,84 L loại 1.314 dòng) chưa đối chiếu HSMT.
- Mục 9: chưa tách datasheet hãng với bảng NCC.

## Tệp đo (scratchpad của phiên trước `…\094d5c0b-d5f3-4e81-b4c2-adfac61a8e2e\scratchpad\`)
`cand-fixc-0..5.jsonl` (782 lượt, 0 lỗi), `cand-baseA-*.jsonl`, `diff2.json` (47 thay đổi), `thr-base.json`/`thr-fix.json`. Lệnh chạy lại: `cand2.mjs <shard> 6 fixc` với `CODE` = `wt-mins-fix/suppliers/config-bot.mjs`, `RUNSET=runset.json`; phân tích: `an.mjs`, `l.mjs` trong scratchpad phiên này.
