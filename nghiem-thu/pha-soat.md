# Soát số pha gói (24/11/2026, phiên pha-soat)

PR NHÁP: nhánh `pha-soat` (worktree `wt-pha-soat`, gốc origin/main `1999b631`), chạm `suppliers/config-bot.mjs` (`phasesIn`, `PH3`, `PH1`, `PH_AUX`) + test `suppliers/pha-menh-de.test.mjs`. Không merge. Đụng `candidates` (số pha lọc dòng) → điều phối đo gộp.
Bảng từng gói (531 dòng, có câu trích ngắn) NGOÀI git: `genbid-work\tan-so-pha-2411-local\pha-soat-531.tsv`.

## 1. Dựng lại danh sách (không khớp 49 + 225)
Lệnh: `node pha-soat/dung-lai.mjs <wt> <out>` (scratch phiên; mỗi gói bidhist cục bộ, `hintsOf(text,"",null).phase` = số pha code ở cấp gói; Phân tích = dòng `technicalSpecs` có nhãn pha, không phải ATS / tủ / biến dòng).
Mã `phases` của Phân tích (nhóm "khong-ghi" của phiên trước) KHÔNG có trong `doc-cache` (`analysis.generatorSets` chỉ 22 gói) nên không dựng lại được đúng 49 / 225. Thay bằng tập RỘNG HƠN, soát hết: 531 gói = mọi gói bidhist (cung cấp) có code null (229) ∪ code 3 mà Phân tích không có dòng nhãn pha (142) ∪ 160 gói của `pha-hsmt-lech.tsv` (nhóm cũ). 37 gói trong nhóm cũ nay không còn trong bidhist cung cấp (gói sửa chữa / bảo trì: IB2200075778, IB2300000347, IB2300008330…), không xét.

## 2. Kết quả 531 gói (đủ từng gói trong tsv)
| Kết luận | Gói |
|---|---|
| code null, HSMT không ghi pha tổ máy (chỉ dòng ATS / tủ / bảo vệ / sạc) hoặc ghi cả 1 và 3 pha theo cỡ: ĐÚNG | 189 |
| code 3 hoặc 1, chữ HSMT chỉ ghi đúng loại đó: ĐÚNG | 265 + 3 (1 pha) |
| code null mà HSMT ghi rõ 1 hoặc 3 pha tổ máy: SAI (đã sửa) | 16 (13 → 3 pha, 3 → 1 pha) |
| code null, chữ cục bộ KHÔNG chứa dòng pha, Phân tích ghi (không thể đọc từ chữ): THIẾU CHỮ | 24 (13 gói 1 pha: IB2200012797, 2200029877, 2200030059, 2300120176, 2300337008, 2400124734, 2400127023, 2400180911, 2400265303, 2500118275, 2500118294, 2500314001*, 2600280799 …; 3 pha: IB2200063776, 2300073418, 2300248981, 2300343668, 2400023840, 2400265203, 2400470041, 2400533348, 2500573995, 2600192365; cả hai: 2300163186, 2500287209) |
| không còn trong bidhist cung cấp | 37 |
Soát tay 6 gói mà tự động không kết luận: IB2200064629 (3, đúng), IB2300111838 (3, đúng), IB2300252701 (null đúng: máy hiện hữu, chỉ MCCB 3P), IB2400027592 (3 đúng), IB2500314001 (1 đúng, sau sửa), IB2600341462 (3 đúng, sau sửa).
Code SAI trước khi sửa: 0 gói code 3 mà HSMT ghi 1 pha; 0 gói code 1 mà HSMT ghi 3 pha. Mọi lỗi là chiều "null lẽ ra có số". Ca code 3 mà dòng nhãn Phân tích không ghi: HSMT có chữ "3 pha" ở dòng mô tả máy / đầu phát, code đúng (xem tsv).

## 3. Gốc lỗi (16 gói code null sai) và sửa
1. Dòng chứa thiết bị khác ở MỘT mệnh đề bị bỏ cả dòng: "Tổ máy … 3 pha, 4 dây; … ATS do cùng nhà sản xuất" (IB2300046166, IB2400043707), "điện áp 400V/50Hz/3 pha; cấp bảo vệ IP23" (IB2400459339, IB2500456429), "02 máy … 3 pha, nhiên liệu diesel, kèm tủ ATS" (IB2600341462, IB2500061368), "Đầu phát điện 3 pha: … IP 23" (IB2400085846), "máy 8,5 kVA, 1 pha, …; kèm 21 bộ ATS" (IB2400103308, IB2500076938, IB2500314001, IB2400497000, IB2600027651). Sửa: nhãn (chữ trước dấu ":" cuối) là thiết bị khác → bỏ dòng; không thì cắt ở ";" / ". " / ", " và chỉ bỏ mệnh đề có thiết bị khác. "tủ điều khiển" (của tổ máy) không tính là thiết bị khác; "chống sét", "Văn bản ghi …" (ghi chú của người đọc, IB2200016981) thêm vào `PH_AUX`.
2. Cách viết "3P/4W", "3P-4W", "230V/400V/3P/50Hz", "số pha 3", "3PH+N" không đọc (IB2400311290, IB2500394492, IB2300194512, IB2500189675, IB2500430242, IB2300296794): `PH3` / `PH1` nhận "3P", "1P", "số pha 3", dòng có "3P/4W" được xét dù không có chữ "pha".
Giữ nguyên: dòng chỉ ghi pha ở nhãn thiết bị khác ("Tủ ATS: 3 pha 4 cực", "Aptomat 1 pha", "chạm đất 1 pha", "MCCB (3P)", "Biến tần … ngõ ra 3 pha") vẫn không tính; thử lần đầu (cắt mệnh đề không xét nhãn) làm 3 lượt sai (3 → null, 1 pha từ dòng bảo vệ) và đã sửa.

## 4. Đo bằng mã: mọi lượt đổi pha trước / sau (1.093 lượt bidhist cục bộ, `pha-goi-nhieu-co/pha-luot.mjs`, `origin/main 1999b631` ↔ `pha-soat`)
Đổi số pha 28 lượt (19 gói): không rõ → 3 pha: 23 (nhiều cỡ 17, một cỡ 6); không rõ → 1 pha: 5 (một cỡ 3, nhiều cỡ 2); thêm 1 lượt chỉ đổi `how.phase` (IB2500394492 lượt 1600 kVA, vẫn không rõ). 3 → 1: 0, 1 → 3: 0, có số → không rõ: 0. 1.064 lượt không đổi. Từng lượt đã đọc chữ: IB2200064629, IB2300046166 (4), IB2300194512, IB2400043707 (2), IB2400085846, IB2400103308, IB2400311290, IB2400459339 (2), IB2400497000 (20 kVA), IB2400563426 (70 kVA), IB2500061368 (2), IB2500076938, IB2500189675, IB2500314001, IB2500394492 (750 kVA), IB2500430242, IB2500597081 (80 kVA), IB2600027651 (20 kVA 1 pha, 60 kVA 3 pha), IB2600341462 (3).
Còn null có chủ ý (đúng): IB2200016981 (8 kVA 1 pha + 40 kVA 3 pha; HSMT tự mâu thuẫn, ghi chú "Văn bản ghi … 1 pha"), IB2500394492 lượt 1.600 kVA (dòng "Tổ máy 3P/4W" không gắn được cỡ).
Số liệu `candidates` (số dòng bị loại thêm theo pha) CHƯA đo: cần đo top 30 trên cloud cùng các PR khác.

## 5. Việc không do mã
- 24 gói THIẾU CHỮ: chữ bidhist `config.text` bị cắt 6.000 ký tự (`CONFIG_TEXT_MAX`, 363 / 1.259 gói chạm 5.999) và dòng pha không nằm trong nhóm `CONFIG_KEY` ưu tiên của `bot/genbid-hsmt/sync-pure.js configText`. Gợi ý (chưa làm, đụng bot, phải Backup / restart / chép sang `genbid-hsmt\`): thêm `s[ốo]\s*pha|\bpha\b` vào `CONFIG_KEY`; chữ cũ phải cào lại mới có.
- Tập 49 + 225 theo đếm phiên trước: 225 là "code 3, Phân tích không ghi" theo mã `phases`; theo dòng nhãn Phân tích còn 142 (mục 1), phần còn lại Phân tích CÓ ghi 3 pha.
- Kiểm: `node --test suppliers/*.test.mjs` xem PR.
