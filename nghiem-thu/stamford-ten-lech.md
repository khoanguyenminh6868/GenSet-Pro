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

## Bước 2–3 (làm 24/11/2026, theo chỉ dẫn điều phối: gộp tường minh bốn cặp S4L1D)
Mã: `SAME_SHEET` + `ratingsFor` trong `suppliers/config-bot.mjs` (bảng tên tương đương C4↔C41, D4↔D41, E4↔E41, F4↔F41, hai chiều, chú thích nêu n1016 / 1017 / 1019 / 1059 và hai cách hãng ghi). Không đổi tên hiển thị, không sửa `cn/*.json`. Test mới trong `suppliers/ratings.test.mjs`: bốn cặp nhận tờ; S4L1D-G4 / G41, S7L1D-F41, S1L2-Y1, HCI544FS, "224D" KHÔNG gộp. Bẫy ghi ở `suppliers/CLAUDE.md` (kể cả: "chữ số cuối = số ổ đỡ" không có bằng chứng hãng). PR nháp: xem dưới.

Đo `CAT.build` (3.024 model đầu phát, 326 Stamford; script `ratingsFor` cũ ↔ mới, MỌI model):
- Stamford thiếu tờ (không `ratingRows`, không `attrKeys`, không `makerSup`): 243 → 239; có ≥ 2 NCC: 91 → 87.
- Model đổi trạng thái: ĐÚNG 4, không model nào khác (hãng khác: 0 đổi).
  | Model | NCC | trước | sau |
  |---|---|---|---|
  | S4L1D-D4 | 5 | 0 dòng định mức, 0 thuộc tính | 64 dòng, 4 thuộc tính (tờ D41) |
  | S4L1D-F4 | 4 | 0 / 0 | 64 dòng, 4 thuộc tính (tờ F41) |
  | S4L1D-E4 | 3 | 0 / 0 | 32 dòng, 4 thuộc tính (tờ E41) |
  | S4L1D-C4 | 3 | 0 / 0 | 32 dòng, 6 thuộc tính (tờ C41) |
- Chiều ngược (C41 / D41 / E41 / F41 nhận tờ gắn khoá …4): không đổi vì danh mục không có tờ khoá …4 (mọi tờ hãng lưu tên …41); chiều ngược có trong test.
- Fixture `regress-config`: không đổi (test đạt, không cần cập nhật). Test `ratings`, `dau-phat-hang`, `dau-phat-hang-d`, `regress-config` 41/41 đạt. `web/catalog.js` không sửa.
- Còn thiếu tờ: 239 model (87 có ≥ 2 NCC), các họ không có bằng chứng giữ nguyên.

## Việc chưa làm / quyết định cần Khoa
1. Khoa quyết: bằng chứng S4L1D (tờ hãng tự ghi "D4" ở URL và "D41" ở tiêu đề) có đủ để gộp 4 cặp C/D/E/F không? Nếu CÓ: làm Bước 2–3 (luật tường minh trong `suppliers/config-bot.mjs` `keysOfModel` / `ratingsFor`, hoặc `CAT.keyOf` — cần xem lại chỗ nào quyết "thiếu tờ" trong `thieu-to.mjs` của điều phối, vì danh mục đo bằng `r.ratingRows`, `attrKeys`, `makerSup`); thêm tờ bằng chứng nếu cần; test (có ca KHÔNG gộp: "S4L1D-G41", đuôi S, "224D"); đo `CAT.build` MỌI model đổi trạng thái; ghi bẫy vào `suppliers/CLAUDE.md`.
2. Các họ còn lại: muốn gộp thì phải có tài liệu hãng khác (ví dụ hỏi hãng / đại lý, hoặc trang tra mã của Stamford có đăng nhập — không dùng). Hiện không gộp gì.
3. Dọn: `git worktree remove ../wt-stamford-ten-lech` nếu không làm tiếp.
