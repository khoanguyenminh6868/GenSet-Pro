# Nghiệm thu: Tìm NCC đổi sang dải 100–120% (PR C, nhánh `find-band`)

Worktree `C:\Projects\GenSet Pro\wt-find-band` từ origin/main 174cb5a (sau PR A). Không chạy agent, không ghi web.

## Tệp đổi (`suppliers/config-bot.mjs`, `suppliers/find-band.test.mjs`)
- Hàm nhỏ `inBand(x, value)` = `value × NEAR_LOW ≤ x ≤ value × NEAR_HIGH` (+1e-9 cho sai số số thực), dùng hằng của `candidates()` (0.995 và 1.2).
- `fitsCap` (productLines của NCC mới): `min ≤ cap × 1.4 && max ≥ cap × 0.95` → `min ≤ cap × NEAR_HIGH && max ≥ cap × NEAR_LOW`. Cận dưới trước đây 95%, nay 99,5%.
- `engineRows`: `rowPower ∈ [100%, 140%]` → `inBand`. Cận dưới trước đây đúng 100% (không dung sai), nay 99,5%: một dòng 398 kVA cho gói 400 nay vào.
- `mergeFind.near`: như `engineRows` (cùng `inBand`).
- Chú thích hàm; chữ trong `note` của cấu hình fromFind: "từ 100% đến 140% công suất của gói" → "từ 100% đến 120%". `find-prompt.md`, `README.md`, `config-prompt.md` không ghi dải của Tìm NCC (grep "140" / "95%" không có). `altFits` không đụng.

## Đo trên doc-cache (không agent, không post)
- configmatch.json (md5 d106239e…, 12 gói / 14 cỡ): **số cấu hình `fromFind` và số NCC `fromFind` dưới cấu hình: 0.** Không có dòng nào ở 120–140% (hay ở bất kỳ dải nào): các lượt Gợi ý lại sau đó đã tạo lại cấu hình, không còn đánh dấu fromFind.
- findmatch.json (4 gói có lượt Tìm NCC: IB2600581294 cỡ 500, IB2600581977 cỡ 250, IB2600592684 cỡ 500, IB2600594596 cỡ 300; 12 NCC `added`): chạy lại phép chọn dòng với bản ghi NCC hiện tại (supplier.json 12/11), `scratchpad\ffind2.mjs`:
| gói | NCC đã thêm | dòng ở 100–140% (cũ) | dòng ở 100–120% (mới) | rơi (120–140%) |
|---|---|---|---|---|
| IB2600581294 500 | haut-power, powerzoo, owell-generators | 1 (haut-power), 0, 0 | 1, 0, 0 | 0 |
| IB2600581977 250 | bdadl-shanghai, wiseke-taizhou, xinzhengfa | 3, 0, 1 | 3, 0, 1 | 0 |
| IB2600592684 500 | rcg-power, starlight-power, mpmc-powertech | 0, 0, 0 | 0, 0, 0 | 0 |
| IB2600594596 300 | cummins-inc, ade-power, younes-bros | 1, 1, 1 | 1, 1, 1 | 0 |
Tổng 12 NCC: 8 dòng ở dải cũ, 8 ở dải mới, **0 dòng rơi**; 6 NCC có dòng ở cả hai dải. Nếu Tìm lại các gói này với dải mới: không NCC nào mất chỗ gắn.
- Chỉ đo được những gói có findmatch; 8 gói còn lại chưa từng chạy Tìm NCC.

## Test
`node --test` (suppliers/): 306 pass, 0 fail (302 + 4 mới trong `find-band.test.mjs`). Test cũ của `fitsCap`, `mergeFind` (cỡ 250: dòng 237,5 ra, 275 và 300 vào) vẫn đúng không sửa. `verify.mjs`: không đụng dữ liệu. Test mới: `fitsCap` (dòng dừng ở 397 không, 398 có; bắt đầu ở 480 có, 481 không; 250 → 300 ở biên 120% có; 520–560 không); `engineRows` (cỡ 400: 397 không, 398, 400, 480 có, 481 không; 250 → 300 có; nhiều cỡ); `mergeFind` (cỡ 400: chỉ NCC có dòng 398, 400, 480 tạo cấu hình).

## Rủi ro
- Một NCC chỉ có cỡ liền trên (vd 313 kVA cho gói 250, 125%) không còn được gắn vào cấu hình khi Tìm: đúng ý quyết định, nhưng nếu dải cho `candidates()` hay Tìm NCC sau này lệch nhau thì NCC tìm thấy có thể không vào ứng viên lần sau.
- `fitsCap` thu cận dưới từ 95% xuống 99,5%: một dòng sản phẩm kết thúc ở 96–99% của gói (vd 490 kVA cho gói 500) nay không còn "hợp công suất" (fits false), nên Tìm NCC có thể báo NCC đó không đủ công suất nếu agent chỉ tìm được dòng này.
- Quay lui: revert PR; sau merge restart bot.

## Chưa kiểm
- Chưa chạy Tìm NCC thật; đo chỉ trên bản ghi NCC hiện tại với cap của lượt cũ.
- 8 gói chưa có findmatch.
