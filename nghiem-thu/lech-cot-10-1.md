# lech-cot-10: chốt chặn 3 dạng số sai của nguồn trong lịch sử giá (bidhist)

PR (draft, không tự merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/897 Nhánh `lech-cot-10`, worktree `wt-lech-cot-10` từ origin/main 0ebd4c55.

## Tệp đổi
- `web/bidprice.js`: `afterDiscount`, `bdPrice` (dùng lại), `lotGoods`, `LINE_OVER`; `candidates` lấy hàng qua `lotGoods`.
- `web/index.html`: `bdPrice` trỏ về `GenbidBidprice.bdPrice`; 2 chỗ `winPrice ?? finalPrice ?? bidPrice` dùng `bdPrice`; `histBidders` dùng `afterDiscount` và `lotGoods`; chi tiết lịch sử hiện hàng qua `lotGoods`.
- `bot/genbid-hsmt/sync-pure.js` (`histWinningPrice`) và `genbid-sync.js` (gọi ở 2 chỗ dựng gói: `historyRound`, `history`).
- Test: `suppliers/bidprice-rest.test.mjs` (+3 ca), `bot/test/sync-helpers.test.mjs` (+1 ca).

## Luật (đều có bằng chứng ngay trong dữ liệu, không chép số tay)
1. **B5**: giá sau giảm > giá dự thầu của chính nhà thầu (+0,1%) → bỏ giá sau giảm, dùng giá dự thầu. Ở web, đọc lúc dùng; không sửa dữ liệu lưu.
2. **IB2500304762 phần 2**: dòng hàng có số lượng × đơn giá > 1,25 × max(giá lô, giá trúng và giá dự thầu của nhà thầu trúng) → đơn giá dòng đó để thiếu (null). Dòng khác, số lượng, tên giữ.
3. **B4**: bot, `winningPrice` của danh sách tìm kiếm > tổng giá trúng của mọi nhà nhà thầu trúng trong các phần của trang kết quả (+0,5%) → null. Có nhà thầu trúng thiếu giá thì giữ.

## Chạy thử trên TOÀN BỘ bidhist (không ghi): `dau-vao\ra-soat-lech-dong-cot\dryPrice.mjs`
Nguồn: `genbid-work\doc-cache\bidhist.json` (cập nhật 18/11 06:30): 1.556 gói, 1.627 lô, 4.737 nhà thầu, 10.049 dòng hàng.
- Luật 1 đổi **1** nhà thầu: IB2500312373 PP2500312755, KIM BÌNH: dự thầu 25.056.000.000, sau giảm 62.640.000.000 (= giá phần 1) → dùng 25.056.000.000 (= giá trúng). Đúng số sai của nguồn.
- Luật 2 đổi **2** dòng, cùng lô IB2500304762 PP2500340917 (trúng 974.185.700): "Thép hình chữ I" 60 m × 96.000.000 (= 5,76 tỷ) và "Thép chữ U" 468 kg × 11.232.000 (= 5,26 tỷ; 468 × 24.000 = 11.232.000, tức đơn giá chính là thành tiền). Σ các dòng còn lại ≈ 0,87 tỷ, khớp giá trúng.
- Luật 3 (bot): trên mọi gói đã lưu, `winningPrice` > Σ giá trúng chỉ ở **1** gói: IB2200019427 (7.387.200.000 = 3 × 2.462.400.000). Không gói nào khác bị chạm.
- Không chạm số đúng: dòng có tích cao hơn giá trúng 1,02–1,16 lần (giảm giá trước khi trúng: IB2200028736 D19E 2,09 tỷ ↔ 1,94 tỷ; IB2200068759 2 × 651,9 triệu) đều giữ; giảm giá thật tới 44% của giá dự thầu không bị luật 1 đụng (chỉ khi sau giảm > dự thầu).

## Ba gói nêu trong việc
- IB2200019427: nhà thầu lặp đã sửa ở nguồn đọc (PR #893), dữ liệu lưu nay 0 nhà thầu lặp ở mọi gói (kiểm 1.627 lô). Còn lại là `winningPrice` 7,39 tỷ ở cấp gói, web không dùng trường này; luật 3 ngăn bot ghi lại. Giá trúng của lô (`winPrice`) = 2,4624 tỷ đúng.
- IB2500312373 lô 2: hết sai (luật 1). IB2500304762 phần 2: hết sai (luật 2).
- Ca test thật: 3 ca web + 1 ca bot ở trên. Test đạt: `node --test web\test\*.test.mjs` 161/161; `bot\test\*.test.mjs` 129/129; `suppliers\bidprice-rest.test.mjs` + `bidprice.test.mjs` 101/101; toàn bộ `suppliers\*.test.mjs` xem mục "việc chưa kiểm".

## Không sửa (không có luật an toàn), ghi lý do
- Dòng nhà thầu lặp: dữ liệu lưu không còn (0); luật đã có ở bot (`contractorsOf`, test extract.test.mjs). Không thêm luật bên web vì không có bản ghi nào để chạm.
- Lô mà đơn giá là thành tiền nhưng tích không vượt cả lô (vd còn ~15 gói B1 tỉ số 2–8 lần): không phân biệt được với giảm giá / liên danh, không sửa.
- IB2500025236 (winPrice 319,4 triệu ↔ sau giảm 865,4 triệu, dòng cáp 150 × 5.769.060 = 865,36 triệu) và IB2500085435 (293,9 triệu ↔ 755,3 triệu): khác với B5, không có giá dự thầu để biết bên nào đúng; ở IB2500085435 Σ hàng = đúng giá trúng (trúng một số nhóm), nên có thể đúng. Giữ, ghi để Khoa biết.

## Mẫu đối chiếu nguồn
Dữ liệu thô trang kết quả muasamcong (đã lưu ở `dau-vao\ra-soat-lech-dong-cot\`, rawH/rawRow). Chưa mở lại trang trực tuyến trong phiên này.
1. IB2500312373 lô PP2500312755: bidPrice 25.056.000.000 / finalPrice 62.640.000.000 (cùng giá trúng phần 1).
2. IB2500304762 lô PP2500340917: Thép hình chữ I, qty 60, unitPrice 96.000.000.
3. IB2200019427: winningPrice 7.387.200.000, lô BP2200166592 winPrice 2.462.400.000, numBidderJoin 2.

## Việc cần làm SAU merge (phiên điều phối duyệt, tôi không làm)
- Web tự có hiệu lực khi Vercel deploy; không ghi dữ liệu.
- Bot: chép `sync-pure.js` và `genbid-sync.js` sang `genbid-hsmt\` (không cần restart, mỗi lượt là tiến trình mới). Để `winningPrice` 7,39 tỷ của IB2200019427 được sửa lưu: `genbid-sync.js history --key IB2200019427` (ghi web thật, cần duyệt).

## Rủi ro và quay lui
- Ngưỡng 1,25 (luật 2) chọn rộng để không chạm giảm giá thật; dòng thành tiền nhỏ hơn cả lô vẫn lọt (chưa có cách an toàn). Quay lui: revert PR; không có dữ liệu bị ghi.

## Việc chưa kiểm được
- (đã chạy xong: suppliers 997/997 đạt)
- Chưa mở trang web dev để nhìn bằng mắt các màn lịch sử (chỉ test tĩnh `web/test`).

## Cần ghi nhớ
- Không có quyết định mới của Khoa. Hai gói IB2500025236 / IB2500085435 (winPrice ≪ sau giảm) để Khoa xem nếu muốn.
