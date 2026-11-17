# Phủ test: trạng thái sau đợt 1–2 (13/11/2026) và việc còn lại

Đã gộp: #622 #624 (rà soát + sửa 8 lỗi), #626 T1, #627 T2, #628 T3, #630 T4, #631 T8, #632 F2, #633 F1, #636 T7, #643 T5.
Bot: `genbid-sync.js`, `sync-pure.js`, `ocr-pdf.js` đã chép sang `genbid-hsmt\` 13/11 (bản cũ `.bak-20261113-t5`);
`Backup-GenBidBot.ps1 -Check` chỉ còn khác `claude\memory\supplier-db.md` (có từ trước, ngoài việc này).
Job CI hiện có: `suppliers`, `server`, `app` (ci.yml), `api`, `web`, `bot` (workflow riêng).

## Còn phải giao
- **T6 bot PowerShell** (Sonnet, Pester trên pwsh CI): `GenBid-Bot.ps1`, `Get-GenBidBidderTargets.ps1`, `Merge-GenBidFeed.ps1`,
  `Publish-GenBidHsmt.ps1`. Lưu ý từ T5: pwsh 7 `ConvertFrom-Json` đổi chuỗi ISO thành DateTime → `Sig` có thể khác bản
  5.1; đối chiếu chữ ký với `bot/test/sync-rules.test.mjs`. Test đặt ở `bot/test/` (không đặt trong `bot/genbid-hsmt/`: Stop hook).
- 4 hàm `config-bot.mjs` chưa phủ (`pdfToText`, `findPrep`, `specPrep`, `specPost`): cần tách `prep` để tiêm đường dẫn.
- Web chưa phủ: YCKT / Đối chiếu / Tạo HSDT (cần tệp + CDN), Báo giá NCC / Sổ báo giá (cần báo giá bịa), gửi yêu cầu cho
  bot, điện thoại, `_lite` / `db.full`. `server/`: nhánh trình duyệt.

## Lỗi tìm ra ở đợt 2, CHƯA sửa (chờ Khoa duyệt)
| # | Chỗ | Lỗi | Số đo | Nguồn |
|---|---|---|---|---|
| 1 | bot `SERVICE_RE` (`sync-pure.js`) | `\bthu[êe]\b` không khớp "thuê" có dấu → gói thuê máy vẫn tự Gợi ý cấu hình + giá (trái quy tắc Khoa 12/11) | 88/111 tên gói có "thuê" | test-t5.md |
| 2 | bot `specsPick` | tệp Chương V / YCKT có chữ "HSMT" trong tên bị coi là HSMT cả bộ; có webform thì bị loại hẳn | 102/1.472 gói có tên như vậy, 25 gói chọn thêm tệp thừa | test-t5.md |
| 3 | web `index.html` | mở thẳng `#dong-co` / `#dau-phat` / `#bo-dieu-khien` kẹt "Đang tải nhà cung cấp…" (`openScreenFromUrl` chạy trước `initDb`) | tái hiện được | test-t7.md |
| 4 | web tab Phân tích | in câu trích HSMT và cột "Nguồn" không qua `SHOW_SRC` (trái quy tắc Khoa 10–11/11) | 3 bảng | test-t7.md |
| 5 | bot `bidders-extract.js` | không đọc hàng chào mẫu BD.CG.02.0192 → "Hàng chào" của nhà thầu trúng trống | chưa đo | test-t5.md |
| 6 | bot sổ chi API | một dòng `null` trong sổ làm bỏ mọi dòng sau → chi tính thiếu | sổ hiện không có dòng như vậy | test-t5.md |
| 7 | `server` `asNumber` | "2.500.000.000 đ" ra không có giá; "Không công bố" ra 0 đồng | cổng hiện trả số nên chưa gây hại | test-t8.md |
| 8 | bot `garbled()` | không bắt chữ hỏng font kiểu "3456ÿ89ÿ" | chưa đo | test-t5.md |
| 9 | bot `GENSET_RE` MPĐ; `isGensetName` máy phát điện gió | đã biết từ #622 | 0 gói sót đo được | test-review.md |

`server/`: chỉ `muasamcong.ts` còn dùng (workflow `tender-lookup.yml`); `index.ts`, `claude.ts`, `documents.ts`,
`sampleTenders.ts` nghi mã chết (chỉ app Expo / Render gọi) → Khoa quyết xoá hay giữ.

## Cập nhật 13/11 (sau "giao t6 và sửa 7 lỗi, lỗi 2 đo kỹ")
- ĐÃ GỘP: #647 G3 (link thẳng Danh mục / Nhà thầu, tab Phân tích qua SHOW_SRC, `asNumber`), #656 T6 (178 ca Pester, job `bot-ps` + `bot-ps-win`, không sửa script bot).
- #645 G1 (4 lỗi bot): kiểm xong nội dung, CI xanh, nhưng CONFLICTING → đã nhắn phiên G1 (`local_dfe9695e-9985-40ab-9e8c-a628f2fcee4d`) rebase. Gộp xong điều phối chép 6 tệp sang `genbid-hsmt\`: `sync-pure.js`, `genbid-sync.js`, `goods-read.js` (MỚI, cơ chế `//@include`), `history-extract.js`, `bidders-extract.js`, `ocr-pdf.js` (thiếu `goods-read.js` thì lịch sử + nhà thầu chết); rồi `Backup-GenBidBot.ps1 -Check`.
- #648 G2 (`specsPick`): CHỜ KHOA DUYỆT, không merge. Số đo (`nghiem-thu\fix-g2-specspick.md`): 102 gói có tên vừa Chương V/YCKT vừa HSMT → 77 đúng, 25 đọc thêm tệp thừa (130,8 MB, 1.510 trang, chữ gửi agent thừa 34%), 0 gói kết quả kém đi; phương án A đổi đúng 25 gói đó + 3/71 gói hiện tại (2 ca có webform), 0 gói đang đúng bị đổi; không cần đọc lại. Sau #645 gộp thì #648 phải rebase (cùng tệp `sync-pure.js`) và chép lại `sync-pure.js`.
- `server/` mã chết: Render trả 404 `x-render-routing: no-server` (13/11) → máy chủ Express không còn; chờ Khoa xác nhận không dùng app Expo rồi xoá `app/`, `index.ts`, `claude.ts`, `documents.ts`, `sampleTenders.ts`, `render.yaml`, `server/Dockerfile`, job CI `app`.

## Cập nhật 13/11 (Khoa: "1. ok" duyệt #648; "2. ok xóa" app + server Express)
- #645: điều phối tự gộp main (xung đột `apiBudgetOf` với PR "Cấu hình hệ thống" của phiên khác: giữ số chi sửa tay + bỏ qua dòng không phải object) và thêm ngoại lệ "căn hộ / nhà / văn phòng cho thuê" (IB2500020231 bị chặn nhầm; sau sửa 110/111 tên có "thuê" là dịch vụ). Đã đẩy lên nhánh `fix/g1-bot` từ worktree `wt-g1-merge` (xoá sau khi gộp). CHỜ CI → merge → chép 6 tệp bot → `Backup -Check`.
- #648: Khoa đã duyệt. Sau #645: gộp main vào nhánh, CI, merge, chép lại `sync-pure.js`.
- X1 xoá app + server Express: phiên `local_d50bedca-34f1-41eb-a370-036c45f2847d` (Sonnet), nghiệm thu `del-x1.md`, PR nháp chờ điều phối kiểm rồi merge.

## KHÉP 13/11 (tối)
ĐÃ GỘP: #645 G1 (4 lỗi bot + ngoại lệ "căn hộ cho thuê"), #648 G2 (`specsPick`, Khoa duyệt), #677 gỡ app Expo + máy chủ Express (điều phối làm nốt vì phiên X1 hết hạn mức; thư mục `wt-del-x1` còn đó). Bot: đã chép `goods-read.js`, `sync-pure.js`, `genbid-sync.js`, `history-extract.js`, `bidders-extract.js`, `ocr-pdf.js` (bản cũ `.bak-20261113-g1`, `sync-pure.js.bak-20261113-g2`); `Backup -Check` chỉ còn `claude\memory\supplier-db.md`. CHƯA chạy lượt Sync / lịch sử / nhà thầu thật bằng bản mới: xem lượt Sync kế (10:10 / 14:10 / 18:10) có lỗi "goodsOf is not defined" / "Cannot find module" không.
Còn mở: lỗi #9 (MPĐ, máy phát điện gió), 4 hàm `config-bot.mjs` chưa phủ, phần web chưa phủ (YCKT, Đối chiếu, Tạo HSDT, Báo giá NCC, điện thoại), nhánh trình duyệt của `server/`. Dọn worktree của các phiên con (`wt-test-t*`, `wt-fix-*`, `wt-g2-specspick`, `wt-del-x1`) và lưu trữ phiên: chờ Khoa.
