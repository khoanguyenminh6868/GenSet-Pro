# Nghiệm thu: ghép đầu phát ghi kèm hãng ở `candidates`

PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/873 (draft, nhánh `ghep-dau-phat`, worktree `wt-ghep-dau-phat`)

## Đã đổi
- `suppliers/config-bot.mjs`: hàm mới `altOf(alts, cell)` (xuất ra): tra `keyOf(ô)`, không thấy thì bóc tối đa 3 từ hãng đầu phát ở đầu ô (theo `CAT.ALT_BRANDS`) rồi tra lại. `candidates` dùng nó thay `alts.get(CAT.keyOf(u.other))`. Không đoán: hãng lạ hoặc mã không có trong danh mục → `null`. Không đụng `catalog.js`.
- `suppliers/alt-cell.test.mjs` (mới, 3 test, dòng thật của fdk-energy "Stamford S5L1D-C41").
- `suppliers/CLAUDE.md`: một dòng bẫy (khoá dòng của do-gop có trường đầu phát).

## Kiểm
- `node --test suppliers/`: 937 pass, 0 fail.
- `node suppliers/quality.mjs --check`: "không chỉ số nào xấu đi quá ngưỡng".

## Đo (ĐO, không ước tính)
1. Dòng ứng viên (47.239 dòng có `line`/`lines`) có ô đầu phát (`other`): 11.297. Ghép được với danh mục:
   - trước: 10.715 (94,8%); sau: 11.195 (99,1%); thêm 480 dòng.
   - Còn lại 102 dòng không ghép: ô rác ("55A", "24V × 80A", "Self-excited,4-pole…"), ô hai hãng ("Stamford UCI274H / Leroy-Somer TAL-A44-M"), FG Wilson (hãng không thuộc `ALT_BRANDS`), mã "MG-S73G / S7G". Không sửa (ngoài phạm vi, ghi bên dưới).
   - Tức là lỗi KHÔNG phải "hầu như không chạy": 95% ô vốn đã ghép; chỉ ô có chữ hãng (nhiều nhất fdk-energy, uleengen…) bị hụt.
2. Top 30 ứng viên của 1.093 gói lịch sử (`do-gop.mjs`, `GENBID_SPEC_NORM=1`, main `origin/main` 4f4144bd so nhánh), so bằng `cmp-ghep.mjs` (khoá dòng BỎ trường đầu phát; `cmp-gop` gốc báo 713 gói đổi nhưng một phần chỉ là khoá đổi):
   - giống hệt 379; chỉ đổi thứ tự 16; đổi tập hợp 698 gói; 1.892 dòng vào / 1.892 dòng ra (TB 2,7 dòng mỗi gói đổi); không gói lỗi.
   - Số dòng top 30 có đầu phát ghép được tăng 277 (tổng 1.093 gói).
   - `all` và `dropped` không đổi (không dòng nào bị loại thêm/bớt).
   - Cơ chế: dòng ghi "Stamford …" nay nhận điểm đầu phát như dòng ghi mã trơ (+40 có bản ghi, +3 mỗi khoản thông số, +80 nếu HSMT nêu đầu phát, và chấm nơi sản xuất đầu phát ở gói đòi nhóm).
3. Soi tay 5 gói đổi nhiều nhất (8 dòng đổi mỗi gói): IB2300000242, IB2300015591, IB2300192935, IB2300275764, IB2400164837. Cả 5 cùng một kiểu: dòng fdk-energy / uleengen / gb-power (ô "Stamford S5L1DH41", "UCDI274K", "S6L1DG41"…) vốn bị hụt điểm đầu phát nay lên đầu (ví dụ IB2300000242: fdk KTA38G2|S5L1DH41 và QSK23G2|S5L1DH41 từ ngoài top 30 lên hạng 0–1); dòng bị đẩy ra là dòng sanq-power / bobig / eastern-lion / rcg (cùng công suất, đầu phát HCI/BW/EL/TALA) ở cuối top. Công suất và động cơ đúng cỡ gói, không thấy dòng sai cỡ lọt vào. Chưa đối chiếu tay với nguồn gốc từng dòng.

## Mẫu đối chiếu nguồn
Ô thật trong `suppliers/cn/fdk-energy.json`: `| CD550EV1/H1 CONTACT | 550KVA/ 440KW | 500KVA/ 400KW | QSZ13-G3 | Cummins (China Dongfeng) | Stamford S5L1D-C41 | Click Here |`; `| CG688-H1 CONTACT | … | VTA28-G5 | Cummins (India) | Stamford S5L1D-F41 |` (đều ghép được sau sửa). Đối chiếu URL gốc của trang fdk-energy chưa làm (không đổi dữ liệu NCC).

## Rủi ro / quay lui
- Thứ hạng 698/1.093 gói đổi trong top 30 (hướng: dòng ghi hãng đầu phát ngang hàng dòng ghi mã trơ). Agent xếp hạng thấy tập ứng viên khác; không đổi `build()` hay dữ liệu.
- Quay lui: revert PR.

## Chưa kiểm
- Chưa chạy agent thật (không đo chất lượng xếp hạng cuối).
- Không sửa: ô hai hãng ("Stamford X / Leroy-Somer Y"), FG Wilson không có trong `ALT_BRANDS` (`catalog.js`, phiên khác đang sửa), ô nhiễu ("55A").

## Cần ghi nhớ
- Đề xuất việc nhỏ: thêm FG Wilson (và ô hai hãng) vào đọc đầu phát trong `catalog.js` khi tệp rảnh.
- Script đo: `genbid-test\cmp-ghep.mjs`, `genbid-test\ghep-dau-phat-count.mjs` (ngoài git).
