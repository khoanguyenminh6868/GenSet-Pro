# Stamford: tên model lệch chữ số cuối ↔ tờ hãng (24/11/2026)

**Trạng thái: DỪNG sau Bước 1 (luật context 30 %). KHÔNG sửa code, KHÔNG có PR.** Worktree `C:\Projects\GenSet Pro\wt-stamford-ten-lech` (nhánh `wt-stamford-ten-lech`, từ `origin/main` b62dd298) đã tạo, sạch, chưa commit gì.

## Bằng chứng tìm được, theo họ

Nguồn đã soát: 64 tờ / tài liệu trong `suppliers/sources/stamford-avk-china/` (1–1059, 2001 = Ratings Book Ed4), 282 PDF ở `genbid-work\alt-datasheets\stamford\pdf` (đổi sang text), tìm web, Parts Manual Current Products I26 (186 trang; hỏi trích nguyên văn → không có đoạn nào giải thích cấu trúc mã).
KHÔNG có tài liệu hãng nào nói "chữ số cuối = số ổ đỡ" hay giải thích cấu trúc mã model. Giả thuyết của điều phối (chữ số cuối = số ổ đỡ) **chưa được chứng minh ở họ nào**.

### S4L1D (C, D, E, F) — CÓ bằng chứng yếu nhưng trực tiếp: hãng tự gọi một tờ bằng cả hai tên
Cùng một tờ, tên tệp trên stamford-avk.com ghi "…4", tiêu đề trong tờ ghi "…41":
- `1016.md`: URL `https://www.stamford-avk.com/sites/stamfordavk/files/A056E878-S4L1D-D4-D-W311.pdf`; tiêu đề "S4L1D-D41 Wdg.311 - Technical Data Sheet" (chân trang "S4L1D-D41_A056E878 Rev.D_24.08.2020").
- `1017.md`: …`ESA056E879-S4L1D-E4-H-W311.pdf` ↔ "S4L1D-E41 Wdg.311 - Technical Data Sheet".
- `1019.md`: …`A056E876-S4L1D-C4-F-W311.pdf` ↔ "S4L1D-C41 Wdg.311 - Technical Data Sheet".
- `1059.md`: …`ESA056E880-S4L1D-F4-G-W311.pdf` ↔ "S4L1D-F41 Wdg.311 - Technical Data Sheet".
Giới hạn: bằng chứng là cách hãng gọi tên tờ, KHÔNG phải câu giải thích ý nghĩa chữ số. Không nói "1" là số ổ đỡ. S4L1D-G4 (1020) hãng ghi "G4" cả tên tệp lẫn tiêu đề: không có bằng chứng cho G4 ↔ G41.
Luật khả dĩ (nếu Khoa chấp nhận mức bằng chứng này): khoá `S4L1D-C4/D4/E4/F4` ≡ `S4L1D-C41/D41/E41/F41` (đúng 4 cặp, viết tường minh, không là luật "bỏ chữ số cuối"). Ước lượng từ `trung-ten.json`: S4L1D-D4 (5 NCC), E4 (3 NCC) thêm tờ; C4 / F4 chưa đếm.

### S5 / S6 / S7 — KHÔNG có bằng chứng
Tờ hãng ghi "S7L1D-F4 Wdg.312", "S5L1D-C4 Wdg.311"… (tên tệp và tiêu đề nhất quán, không bản "41"). Không tài liệu nào của hãng dùng "S7L1D-F41", "S6L1D-G41", "S5L1D-H41". → Không gộp (nhóm lớn nhất: S7L1D-F41 10 NCC, G41 9, C41 7, H41 7…).

### S0 / S1 — KHÔNG có bằng chứng
Tờ ghi "S1L2-Y Winding 311 / 711", "S0L2-P …"; Ratings Book ghi "S0L2-K | 1, 2" (cột chú thích, 1 = chỉ một ổ đỡ, theo chú thích "1. Available with single bearing only"; "2. Auxiliary winding option available (winding 711)"). Chữ số trong cột đó là số chú thích, không phải hậu tố tên. Không có "S1L2-Y1" / "S0L2-P1" ở tài liệu hãng. → Không gộp.

### UC / UCD (UCI274H1, UCDI274K1…) — KHÔNG có bằng chứng
Tờ UCI274H (`1012.md`) có bảng "| 1 BEARING | 2 BEARING" (cùng một tờ ghi cân nặng cả hai bản) — cho thấy một tờ phủ cả hai kiểu ổ đỡ, nhưng không có chỗ nào nói mã "UCI274H1" là một trong hai. Ratings Book dùng tên không đuôi. → Không gộp.

### HC (HCI544C1 ↔ "HCI 534C/544C") — KHÔNG có bằng chứng
Tờ ghi "HCI 534C/544C - Winding 311" (cũng có "1 Bearing | 2 Bearing"); không có "HCI544C1" ở tài liệu hãng. → Không gộp.

### Đuôi "S" và tên thiếu tiền tố — theo lệnh Khoa không gộp (HCI544FS, HCI444FS / ES, UCI274ES, "224D" ↔ "UCI224D"): vẫn không có bằng chứng riêng.

## Số liệu trước / sau
Chưa đo (chưa viết code). Số trước: 243 model Stamford thiếu tờ, 91 có ≥ 2 NCC (PR #1128).

## Việc chưa làm / quyết định cần Khoa
1. Khoa quyết: bằng chứng S4L1D (tờ hãng tự ghi "D4" ở URL và "D41" ở tiêu đề) có đủ để gộp 4 cặp C/D/E/F không? Nếu CÓ: làm Bước 2–3 (luật tường minh trong `suppliers/config-bot.mjs` `keysOfModel` / `ratingsFor`, hoặc `CAT.keyOf` — cần xem lại chỗ nào quyết "thiếu tờ" trong `thieu-to.mjs` của điều phối, vì danh mục đo bằng `r.ratingRows`, `attrKeys`, `makerSup`); thêm tờ bằng chứng nếu cần; test (có ca KHÔNG gộp: "S4L1D-G41", đuôi S, "224D"); đo `CAT.build` MỌI model đổi trạng thái; ghi bẫy vào `suppliers/CLAUDE.md`.
2. Các họ còn lại: muốn gộp thì phải có tài liệu hãng khác (ví dụ hỏi hãng / đại lý, hoặc trang tra mã của Stamford có đăng nhập — không dùng). Hiện không gộp gì.
3. Dọn: `git worktree remove ../wt-stamford-ten-lech` nếu không làm tiếp.
