# catalog-doosan-p: mã Doosan "P…TI / P…LE" là động cơ ở bảng không có cột đầu phát (PR draft từ origin/main 66cc1008, điều phối giao 20/11/2026)

## Sửa gì
`web/catalog.js`, trong `fromSupplier`, ngay trước luật `DOOSAN_P` hiện có (một dòng + chú thích):
`if (hasEngineCol && ei < 0 && ai < 0 && alt.length === 1 && DOOSAN_P.test(cells[alt[0]].trim())) ai = alt[0];`
Nguyên nhân gốc: `ai` chỉ được gán khi bảng có cột đầu phát (`hasAltCol`). Bảng chỉ có cột động cơ thì `ai` luôn −1, luật `DOOSAN_P` (điều kiện `ai >= 0`) không bao giờ chạy, và dòng "… | P126TI | …" không có bản ghi động cơ nào. Luật cũ sau đó chạy như cũ (mã Doosan thành động cơ, đầu phát = mã dạng đầu phát KHÁC của dòng nếu có). Không chạm nơi nào khác. Mục bẫy: `web/CLAUDE.md` (catalog-doosan-p). Test: `suppliers/catalog-doosan-p.test.mjs` (4 ca: aoke n130 (P126TI-11), huatai n108 (3 dòng), kaihua n126 (tiêu đề phụ KVA | KW), ca KHÔNG đổi: bảng không có tiêu đề động cơ, dòng có hai ô dạng đầu phát).

## Đo (`spec-diff git:origin/main .`, origin/main = 66cc1008)
- Bản ghi 60.654 → 60.942; **khác 0, chỉ cũ 0, chỉ mới 288** (toàn `engine`); bảng có đổi 49 (40 cặp NCC / `n`); đảo vai 0 → 0; tổ máy `gensetsOf` 0 đổi, 0 mất, 0 thêm. "bỏ thông số theo bảng" 555 → 558: nhiều khả năng do ba bản ghi zhengchi mới (n133 / n136 / n139) vào bảng 整机编号, nơi `TABLE_DROPS` (đã duyệt ở #954) bỏ cyl / disp; em CHƯA đối chiếu từng note.
- Mã thêm theo ô nguồn: P126TI 55, P158LE 44, P086TI 37, P126TI-II 36, P086TI-1 35, P158LE-1 25, P222LE-S 8, P222LE-1 8, P158LE-S 8, P180LE 6, P222LE-II 4, P086TI-I 3, P126TI-11 3, P222LE-11 3, P222LE 2, P180LE-S 2, P158LE-Ⅰ 2, và 1 dòng mỗi mã: P222LE-S-II, P222LE-2, P158LE-I, P126TI-Il, P126TI-2, P126TI- Ⅱ, P034TI. Mọi mã đều dạng `DOOSAN_P`.
- 40 cặp (NCC, n): aoke-yangzhou n130 / n133 / n136, aosif n104 / n115, bdadl-shanghai n133, excel-power-ningde n117, fukangsi-yangzhou n2008, haifeng-taizhou n2006, huatai-yangzhou n108, jiangchai-xuzhou n101, jianghao-genset n106, kaihua-genset n103 / n108 / n126, lees-power n105, legapower n106, longkai-power n123, mamo-power n108, mecca-power n113 / n129, nenjo-generator n146, previa-ningde n106, taihai-taizhou n105 / n114, teksan n103, victory-generator n106, waeta-fujian n106, walter-yangzhou n104 / n105 / n113, wintpower n146, world-power-fuzhou n103, xingguang-jiangsu n107 / n121 / n122, zhengchi-power n133 / n136 / n139, zhengdian-zhengzhou n108.

## Soát ĐỦ 288 dòng (không lấy mẫu): `genbid-test\b3\dsoat.cjs` trên bản đầy đủ `--out` của spec-diff (`out\sd-doosan-full.txt`, danh sách bản ghi `out\doosan-recs.json`)
Với MỖI bản ghi mới, từ chữ dòng nguồn và dòng tiêu đề của bảng:
1. mã động cơ là MỘT ô nguyên của dòng (288 / 288);
2. dòng có đúng MỘT ô dạng `P\d{3}(TI|LE)` (288 / 288);
3. ô đó đứng dưới cột tiêu đề "柴油机型号 / 发动机型号 / Engine Model" (cho phép chỉ số cột xê dịch bằng số ô thêm của tiêu đề phụ "KVA | KW" / "主用 | 备用": `ie ≤ cột ≤ ie + (số ô dòng − số ô tiêu đề)`): **278 / 288 đạt tự động; 10 dòng còn lại (kaihua-genset n126 dòng 27–33, taihai-taizhou n105 dòng 22–23) soát bằng mắt**: tiêu đề "Model | Standby Power (KVA | KW) | Prime Power (KVA | KW) | Engine Model | Dimension …" với dòng "KH-300GF2 | 413 | 330 | 375 | 300 | P158LE | 3300x1390x1780 | 2885" và "TH-300GF | 375 | 300 | P158LE-1 | 8V | 128/142 | 14.618 | …" (cột "技术文档" / "Detail Data" không có ô dữ liệu nên chỉ số lệch một): P158LE / P158LE-1 / P180LE / P222LE-… đứng ngay sau các cột công suất, dưới "Engine Model" / "发动机型号". Cả 10 đúng.
4. 63 dòng có ô hãng 斗山 / 韩国斗山 / Doosan / Hyundai ngay trên dòng; 225 dòng còn lại không có ô hãng (hãng đọc từ tiêu đề / tên trang; xem dưới).
Kết luận: 288 / 288 là mã động cơ Doosan đứng đúng cột động cơ; không dòng nào là đầu phát.
Chữ viết của NCC GIỮ NGUYÊN, không gộp: "P126TI-11" (3), "P126TI-Il" (chữ l thường, 1), "P158LE-Ⅰ" / "P126TI- Ⅱ" (chữ số La Mã Unicode, 2 + 1), "P222LE-S-II", "P222LE-2" … là cách viết của NCC; hãng ghi tên "P126TI-II" (trang hd-hyundaiengine.com/en/engine/generator-detail/14, thấy qua kết quả tìm kiếm, chưa mở cả trang); các hậu tố khác chưa kiểm với hãng → không khẳng định. Gộp "-11" / "-Il" / "-Ⅱ" vào "-II" là suy ra, cần Khoa duyệt (`keyOf` chưa làm).

## Hệ quả ở `build()` (`origin/main` ↔ nhánh, `out\dmk.txt`, `dmk.mjs`)
Động cơ 6.535 → 6.546: **11 động cơ mới** (P158LES, P222LE1, P126TI11, P158LEI, P180LES, P222LE11, P034TI, P126TI2, P126TIIL, P222LE2, P222LESII, khoá đã bỏ gạch), **11 động cơ có thêm dòng**: P158LE 18 → 62 dòng (12 → 33 NCC), P086TI 17 → 54 (10 → 30), P126TI 14 → 69 (8 → 29), P126TIII 12 → 49, P086TI1 7 → 42, P158LE1 6 → 31, P222LES 2 → 10, P180LE 3 → 9, P222LEII 1 → 5, P086TII 2 → 5, P222LE 2 → 4. Không động cơ nào MẤT.
**Hãng đổi ở 7 động cơ có sẵn** (chuỗi `e.make`; Doosan / Hyundai / Daewoo là cùng một hãng, `SAME_MAKER`): P126TI "Hyundai / Doosan" → "Doosan / Hyundai"; P158LE1 "Hyundai" → "Doosan / Hyundai"; P086TII "Doosan" → "Hyundai / Doosan"; P222LES, P180LE, P222LEII, P222LE "?" (chưa rõ hãng) → "Doosan". Đáng để Khoa / điều phối biết khi đo cloud: `candidates` lấy hãng đầu của chuỗi (`makeOf`: `split(" / ")[0]`) cho `MAKE_CAP` / `MAKE_ROWS` / `byOrigin`, nên đổi thứ tự "Doosan / Hyundai" ↔ "Hyundai / Doosan" đổi nhãn nhóm của P126TI (Hyundai → Doosan) và P086TII (Doosan → Hyundai); và bốn động cơ từ "?" thành "Doosan" nay được tính vào trần hãng Doosan (và nhóm G20 theo hãng). Hãng của động cơ mới: P158LES, P222LE1, P126TI11, P126TIIL Doosan; P158LEI "?" (hai NCC, không hãng rõ); P180LES, P034TI, P126TI2, P222LE2, P222LESII "Daewoo"; P222LE11 "Hyundai". Em KHÔNG sửa hãng (không là việc của PR này; hãng lấy theo luật `keptMakes` hiện có).
Chưa đo top 30 (cloud); đề xuất điều phối đo `do-gop.mjs` main 66cc1008 ↔ nhánh: kỳ vọng đổi chủ yếu ở lượt có Doosan trong nhóm hãng G20 / `MAKE_ROWS`.

## Kiểm
- `node --test web/test/*.test.mjs suppliers/*.test.mjs`: xem dòng cuối (điền khi xong).
- `quality.mjs --check`: xem dòng cuối.
- Mã `ZCDL-Q363` (zhengchi n112, "653.4" ở ô 柴油机型号, không là mã) vẫn KHÔNG đọc: đúng như đã đề xuất, không đoán mã từ dòng Q396.

## Cần ghi nhớ / đề xuất (CHƯA làm)
- Gộp cách viết của NCC "-11" / "-Il" / "-Ⅱ" / "-Ⅰ" vào "-II" / "-I": suy ra, cần Khoa duyệt.
- Thứ tự ổn định giữa các dòng cùng điểm của `candidates` (ưu tiên dòng gần cỡ HSMT, rồi tên NCC): đề xuất từ nghiệm thu catalog-b3 ("Top 30 cloud f"), chưa làm.
- Hãng Doosan / Hyundai / Daewoo viết ba kiểu nên `makeOf` (hãng đầu chuỗi) đổi theo thứ tự: nếu muốn nhóm ổn định, chuẩn hoá tên hãng trong `makeOf` thành tên chuẩn của nhóm `SAME_MAKER`: việc của config-bot, chưa làm.
