# Sửa sau đo lượt 3 (24/11/2026)

## SHA đầu nhánh (đã push, chưa merge), đều chứa main `b62dd298`
| PR | Nhánh | SHA | Test | verify / quality / spec-diff --gate |
|---|---|---|---|---|
| #1105 | fix/crawl-dropped-rows | 2950420e | 1.619 đạt, 0 lỗi | xanh |
| #1110 | fix/tach-bang-con | 5cdc0086 | 1.626 đạt, 0 lỗi | xanh |
| #1111 | fix/tach-bang-con-2 | 763d993c | 1.631 đạt, 0 lỗi | xanh |
| #1115 | ma-dong-co-keyof | ab47894d | 1.614 đạt, 0 lỗi | xanh |
| #1118 | fix/mot-pha-hai-tan-so | 378726b8 | 1.633 đạt, 0 lỗi | xanh |

Bản tích hợp tạm #1111 + #1118 (không push): 1.645 đạt, 0 lỗi. Ghép hai nhánh này xung đột ở `suppliers/CLAUDE.md`, phải giữ phần của cả hai.

## CHƯA LÀM
- Main đã đi tiếp tới `07dcd57d` (13 commit, gồm #1133, #1145) sau lần kiểm: điểm 4 phải merge main lần nữa vào cả 5 nhánh và chạy lại cổng.
- Mô tả PR #1115 và #1118 trên GitHub còn nội dung cũ ("33 khoá", "chờ quyết"): phải sửa theo mục 3, 5, 6, 7 dưới đây.
- Chưa đo 1.093 lượt top 30 (không thuộc phiên này).
- Worktree `wt-sua-l3`, `wt-sua-l3-goc` chưa gỡ (`wt-sua-l3-goc` đang ở commit tạm `92a82135`, không push).

## 1. baifa mất `made`
Gốc: #1110. Tách bảng con làm dòng rơi vào hai bảng baifa n101 có tiêu đề vỡ chữ "ENGINE MANUF ACTURER / COUNTRY", regex không khớp. Đã sửa `ENGINE_ORIGIN_COL`, có test.
So mọi khoá dòng với main (48.236 khoá chung): china / place / places mất 0 (trước sửa 33 dòng baifa). Bảng mất nhận dạng cột xuất xứ: 2 (đều baifa n101). simpson 5 bảng tiêu đề có dấu cách là từ trước, 3 dòng SME vẫn đọc được.
Tần số đổi (không dòng nào mất): acepow 23, excel-power 207, gtl 29, hosem 30, keliang 32, kaihua thêm 100.
1.401 dòng mới: 22 có chữ China mà không đọc, 19 chỉ là thang khí thải, 3 baifa có ô CHINA. Toàn baifa có 61 dòng ô CHINA không đọc, đều mã Baudouin: đúng luật "Baudouin không đọc".

## 2. Khoá rác
Sửa ở #1105 (`isCode`): `20FT` (longkai, previa), `20HQ` / `40HQ` (lees-power, 4 bản ghi), `60HZ?` (shengfeng-fuan). Thêm: keliang 16, long-gen 7, wintpower 3 dòng nhận lại mã đầu phát thật.
Chưa sửa, việc riêng: ô `DP222CC` trơn có 38 lần trong `cn/` nhưng chỉ 3 bản ghi động cơ, chưa rõ nguyên nhân.

## 3 + 5. #1115
6 mã Cummins "(M)" để riêng, quyết định của Khoa 24/11/2026, ghi trong mã và test. Còn gộp 27 mã MTU. So main: 31 bản ghi đổi `model`, đều comappower, 0 mất, 0 thêm.

## 4. Đưa lên main
Xong tới `b62dd298`, chỉ merge, không rebase / force-push. Xem "CHƯA LÀM".

## 6. #1118 chiều ngược
`rowPhaseOf`: gói đòi 1 pha loại dòng có căn cứ ba pha (`ruled: phase`, why nêu chữ căn cứ); dòng không có căn cứ thì giữ, "cần xác nhận số pha".
Phát hiện thêm: cột Phase của elitech, aj-power, welland lệch một ô vì tiêu đề mở bằng ô trống. Đã sửa. Đọc được thêm: aj-power 20 dòng một pha + 115 ba pha, welland 23 + 274, elitech 467 ba pha, acepow 76 ba pha.
Trên bản tích hợp (49.637 dòng): một pha 217 (cột 58, phân đoạn 24, dự phòng 135); ba pha 2.579 (cột 950, tiêu đề 1.418, phân đoạn 211); không kết luận 46.841.

## 7. Căn cứ dự phòng: 135 dòng
Danh sách đủ từng dòng: `sua-sau-do-luot-3-pha.txt` (cùng thư mục).
- Đuôi -1P (91): agg-fuzhou 85, kachai-hangzhou 5, voltgent 1.
- Tên trang Single Phase (44): ade-power 24, acepow-fuan 16, yongcai-elecmama 4.
- superwatt-swt 15 dòng "-1P" có cột pha ghi 1-phase nên theo cột. Không dòng "-1P" nào có cột ghi 3 pha, không NCC nào dùng "1P" với nghĩa rõ ràng khác.

**Cần hỏi lại Khoa:** voltgent `P2500-1P` (n101, 4016-61TRG3X, máy 2.500 kVA) đang bị tính là một pha theo luật, nên bị loại ở gói 3 pha.
Nên xem thêm: acepow-fuan n136, 16 dòng APYD nhận một pha từ tên trang "1000KVA Single Phase 75KW…", tên trang này tự mâu thuẫn về công suất.
