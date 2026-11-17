# Nghiệm thu: Gộp dòng lặp cùng NCC — 16/11/2026

Nhánh `gop-dong-lap` (worktree `wt-gop-dong-lap`), từ main `9f8ea2c4`. Khoa duyệt 14/11: "làm theo kiểu gộp".

## Đã đổi
- `web/catalog.js`: `fromSupplier` → `mergeRepeats`. Bản ghi cùng NCC, cùng loại (động cơ / đầu phát), cùng model, cùng dòng nguyên văn ở nhiều bảng → một bản ghi (bản đầu). Cộng dồn: hãng (mọi cặp tên + mức), thông số khác giá trị, công suất / tần số / đầu phát nếu bản đầu thiếu; nguồn của bản lặp vào `also: [{n, table, row, title}]`. Không gộp: bản ghi `fromLine`, bảng nhãn (không có `line`), hai bản khác tần số (wintpower WT-SC138 nằm cả bảng 50 Hz và 60 Hz).
- `suppliers/config-bot.mjs` `check`: tra dòng theo số nguồn nhận cả các `n` trong `also` (kết quả Gợi ý đã lưu trỏ nguồn của bản lặp vẫn tìm được dòng).
- `suppliers/catalog.test.mjs`: 2 ca (kente-power 3 trang lặp; 50/60 Hz).

## Số đo (main `9f8ea2c4` ↔ nhánh, cùng dữ liệu `suppliers/cn`)
| | main | nhánh |
|---|---|---|
| Bản ghi `fromSupplier` | 64.788 | 59.544 |
| Dòng lặp nguyên văn (cùng NCC, loại, model, dòng) | 5.250 ở 75 NCC (878 mang hãng khác bản đầu) | 6 (fromLine / khác tần số, cố ý giữ) |
| Dòng bảng động cơ / đầu phát (uses) | 51.588 / 13.200 | 47.701 / 11.843 |
| Model động cơ / đầu phát; có hãng; không hãng | 7.531 / 2.792; 5.748; 1.783 | y hệt |
| Model đổi hãng hiển thị | — | 2 (chỉ đổi thứ tự tên, đều là model rác "≤6S", "≤5S") |
| Model đổi số NCC / dải kVA / kW / giá trị thông số | — | 0 / 0 / 0 / 0 |
| Model đổi tần số | 29 (trước khi giữ riêng 50/60 Hz) | 0 sau sửa |
| `quality.mjs`: số model mâu thuẫn | cyl 138, disp 383, bore 136, compr 54 | y hệt (chỉ số đếm giá trị giảm theo số dòng bỏ) |

Ứng viên Gợi ý cấu hình (`candidates`, không agent, `GENBID_SPEC_NORM=1` như bot), 1.093 lượt (mọi gói máy phát có Chương V trong `genbid-test\noi-chuan-hoa\bidhist.json`, từng cỡ): top 30 y hệt 1.073; chỉ đổi thứ tự 12; đổi tập 8 lượt (9 dòng vào / 9 ra, đều là dòng cùng điểm của NCC nhiều dòng lặp như minsun-motor, fdk-energy: thứ tự gặp đổi nên dòng bằng điểm được chọn khác); hãng hiển thị của top 30 đổi 0. Số dòng loại (`dropped`) đổi ở 528 lượt vì bớt bản lặp.

Công cụ đo (thư mục tạm của phiên, chép lại nếu cần): `dup-count.mjs`, `cmp-build.mjs`, `do-gop.mjs`, `cmp-gop.mjs`.

## Test
`node --test suppliers/` 876 pass / 0 fail (gồm regress-config, regress-bidprice: không đổi fixture); web static + spec-norm 158 / 0; bot 120 / 0.

## Phát hiện ngoài phạm vi
- `quality.mjs --check` ĐỎ ngay trên main `9f8ea2c4` (cyl 138 > 113+5, disp 383 > 351+5, bore 136 > 111+5, compr 54 > 37+5): mốc là của #785 (14/11), các PR đọc thêm dòng 15–16/11 (#798–#800, #804) làm tăng số model mâu thuẫn. Nhánh này không đổi các số đó.

## Quay lui
Revert PR (một commit). Web và bot đọc thêm trường `also` (bỏ qua được).
