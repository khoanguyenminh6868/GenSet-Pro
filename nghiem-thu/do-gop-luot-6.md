# Đo gộp lượt 6: #1207, #1227, #1228 (nhánh `tich-hop-luot-6-do-gop`)

Phiên con của điều phối, 24/11/2026. Báo cáo không chép chữ HSMT; chỉ mã gói, số liệu, tên model, tên NCC. Cách đo và tiêu chí như lượt 5 (`do-gop-luot-5.md` mục 2, 3).

## Kết luận từng PR

| PR | Nhánh | Dòng top 30 đổi khi đo riêng (so `main`) | Kết luận |
|---|---|---:|---|
| **#1207** ô "ALTERNATOR: hãng mã" | `o-alternator-doc` | **1.233** (100 lượt / 97 gói) | **An toàn merge.** 133 dòng gốc đều là dòng energy-gruppi / fudiankang-hunan nay có đầu phát (khoá dòng thêm mã đầu phát), điểm tăng **đúng từng điểm** theo dự đoán (+40, +40 + 3 × khoá thông số đầu phát, +80 khi HSMT nêu hãng đầu phát); 1.100 dòng còn lại là hệ quả trực tiếp. 18 ô đầu phát khớp nguồn. Bộ kiểm giá trị: sai 118 → 118 (cùng danh sách). Lưu ý nhỏ: commit của PR có dòng `Co-Authored-By` ghi tên model, squash merge sẽ bỏ. |
| **#1227** bước 3 họ R3 | `buoc-3-r3` | **5.878** (699 lượt / 593 gói) | **Cần Khoa quyết một điểm, còn lại đúng.** Mọi dòng có cơ chế, 0 dòng chưa giải thích; mọi bản ghi mới vào top 30 (60 tổ hợp NCC × động cơ, 69 dòng nguồn) và **cả 22 bản ghi camda n155 bảng 54** (thêm 16 của bảng 55) khớp ô nguồn: **0 sai**. Điểm cần quyết: bản ghi mới camda n158 ("powered by Perkins", dòng tiêu đề do `HEADER_LINES` trả lại) ghi hãng Perkins cho **1006TG2A**, trái với Lovol (tiêu đề cột jet-power n137); `keptMakes` 1 NCC ↔ 1 NCC → **1006TG2A mất hãng**, mọi dòng 1006TG2A −60 điểm: **20 dòng ra khỏi top 30** ở 14 lượt (jet-power 8, wintpower 9, victory-generator 3). Đúng luật hiện hành, nhưng đổi điểm của 18 NCC chào mã này. Xem mục 5. |
| **#1228** bước 3 họ L1 | `buoc-3-l1` | **170** (13 lượt / 13 gói) | **An toàn merge.** 9 dòng bản ghi mới koten (4 tổ hợp, khớp nguồn), 5 dòng 404D-22G1 nay có hãng Perkins (+60; +300 khi HSMT nêu Perkins; đúng: 404D-22G1 là mã Perkins), 156 dòng hệ quả. Bộ kiểm: sai 118 → 118; "chưa chuẩn" 317 → 325 (+8 ô kiểu hút khí koten / pulita chưa có giá trị chuẩn, không sai). |

Thứ tự merge: ba PR độc lập về top 30 (tích hợp = tổng ba đo riêng, mục 4.4). Chữ chỉ xung đột ở dòng `const api = {…}` cuối `web/catalog.js` giữa #1227 (`HEADER_LINES`) và #1228 (`columnSheets`): PR merge sau cần gộp tay giữ cả hai tên (mục 1). #1207 và #1228 merge được ngay; #1227 sau khi Khoa quyết điểm 1006TG2A (hoặc merge luôn nếu chấp nhận "chưa rõ hãng").

## Tóm tắt

| Mục | Kết quả |
|---|---|
| Nhánh tích hợp | `tich-hop-luot-6-do-gop` HEAD `dd07d79c`, từ `origin/main` `81771049` (#1226); đã đẩy, không mở PR. Gộp merge commit theo thứ tự #1207, #1227, #1228. |
| Xung đột | **1**, `web/catalog.js` dòng `api` (mục 1). `web/CLAUDE.md` tự gộp (đủ 3 mục của 3 PR). |
| Test (tích hợp) | suppliers **1.898 test: 1.896 đạt, 0 lỗi, 2 bỏ qua**. `web/test/*.test.mjs` 171 / 171 (gồm spec-norm 158, cap-read), `web/test/static.test.mjs` 11 / 11. Playwright: 141 đạt, 4 hỏng ở `file-transfer.spec.mjs`; `main` cũng 141 đạt / 4 hỏng ở cùng tệp. Chạy lại riêng tệp này 2 lần mỗi bên: ca 76, 230, 259 hỏng ở mọi lần cả hai bên; ca 290 / 312 / 325 / 335 lúc hỏng lúc không ở cả hai bên → không do PR. `verify.mjs`: 436 hồ sơ, 0 lỗi. `quality.mjs --check`: không chỉ số nào xấu đi quá ngưỡng. |
| spec-diff (tích hợp so `main`) | 64.410 → 64.845 bản ghi; **56 đổi, 0 mất, 435 thêm**, 79 bảng / 11 NCC; **đảo vai 0 → 0**; tự kiểm cần soát tay 0; `gensetsOf` 0 đổi. Đúng bằng tổng ba PR: thêm 18 + 340 + 77, đổi 18 (`other`, #1207) + 38 (`power`, camda n155, #1227). "Bảng không cho bản ghi nào" 3.186 → 3.127. |
| Bộ kiểm giá trị (`spec-value-check`, số ca "sai") | main **118** · #1207 118 · #1227 118 · #1228 118 · tích hợp **118**; danh sách `violations.jsonl` so từng dòng: #1207 / #1227 giống hệt main; #1228 và tích hợp chỉ thêm 8 dòng mức "chưa chuẩn" (`aspiration`: koten LR4A3L-D, LR4B5-D, LR4M3L-D, LR4M3L-D88, LR6B3L-D, YT3A2Z-D, YT3B2-D; pulita 404D-22TG). **Không ca sai mới.** "Cần xác nhận" 11 → 11. |
| quality (mâu thuẫn hằng số, cột "gồm thiếu đơn vị") | bore 50 / 1025 → 54 / 1032 (#1227 jet-power D1703 / V2203 "87×92.5" ↔ depco "87×92.4"; #1228 kanpor F4L912 / F4L912T, đã nêu trong PR); cyl, disp, compr không tăng. |
| Điều kiện đo | bidhist tải 24/11 20:32 UTC (1.556 doc, 928 gói), dùng CHUNG cho 5 cây, ngoài repo, không commit. Mỗi cây dùng `cn` của chính nó. **1.057 lượt** mỗi cây, 0 lượt lỗi. 5 cây chạy song song, mỗi cây ≈ 68 phút. |
| Top 30 tích hợp so `main` | **768 lượt / 653 gói, 7.199 dòng** (508 đổi điểm, 4.562 đổi hạng, 1.069 ra, 1.060 vào). |
| Dòng chưa giải thích | **0** ở cả 4 bước. |
| Dòng SAI | **0** (mục 5). Điểm cần Khoa quyết: 20 dòng 1006TG2A ra khỏi top 30 vì mất hãng (#1227). |

## 1. Gộp nhánh

`git merge --no-ff` từ `origin/<nhánh>` mới fetch, trên `origin/main` `81771049`:

| # | Nhánh | PR | Kết quả |
|---|---|---|---|
| 1 | `o-alternator-doc` | #1207 | sạch (PR tách từ `b8400d92`, sau main 26 commit; gộp không xung đột) |
| 2 | `buoc-3-r3` | #1227 | sạch |
| 3 | `buoc-3-l1` | #1228 | **xung đột `web/catalog.js`** |

**Xung đột (`web/catalog.js`, dòng 4329, `const api = { … }`):** #1227 thêm `HEADER_LINES` vào giữa danh sách xuất (sau `GENSET_TABLES`), #1228 thêm `columnSheets` vào cuối. Giải: giữ dòng của HEAD (#1227) và thêm `, columnSheets` ở cuối: dòng xuất có cả hai tên, không bỏ tên nào. `web/CLAUDE.md`: ba PR thêm ba mục ở ba chỗ khác nhau, git tự gộp, đủ ba mục.

Không sửa mã PR nào, không chỉnh test nào. Ba cây đo riêng (main + một PR) gộp sạch.

## 2. Cách đo

- `NODE_USE_ENV_PROXY=1 node do-gop-x.mjs <cây> <cây>/suppliers/cn <out> --bidhist <bản chung>`. `do-gop-x.mjs` là bản sao `suppliers/do-gop.mjs` của `main`, phần tính giữ nguyên, chỉ ghi thêm tệp chẩn đoán: 120 dòng đầu của `all` mỗi lượt (khoá, điểm, tập khoá thông số động cơ / đầu phát, lý do, luật, hãng) và mọi dòng `dropped` (khoá, luật, lý do). Không đổi kết quả top 30.
- Thêm bảng toàn cục mỗi cây (catalog `build` + `modelFacts`): hãng và tập khoá thông số của từng động cơ / đầu phát, và mọi bản ghi động cơ (NCC | động cơ | dòng → công suất, tần số, `other`). Dùng để dự đoán điểm cho dòng nằm ngoài 120 dòng đầu, và để biết dòng là bản ghi MỚI hay bản ghi ĐỔI công suất.
- Cây đo (đều từ `main` `81771049`): `main`; main + #1207; main + #1227; main + #1228; tích hợp.
- Khoá dòng: đủ 4 trường `NCC | động cơ | đầu phát | chữ dòng` như lượt 5; dòng bị loại tra bằng khoá bỏ đầu phát.
- Script, dữ liệu đo, bidhist ở thư mục tạm của phiên con, ngoài repo.

## 3. Tiêu chí quy cơ chế (máy kiểm từng dòng, không lấy mẫu)

Như lượt 5, thêm ba nhóm cho dạng thay đổi của lượt này (cột `nhóm` của TSV):

- `diem-khop`: điểm riêng đổi và độ lệch **khớp đúng từng điểm** với dự đoán: +8 × loại thông số động cơ (tối đa 8), +3 × loại thông số đầu phát (tối đa 6), +60 hãng động cơ, +300 khi HSMT nêu hãng đó. Cột `cơ chế` ghi khoá / hãng thêm, mất.
- `dau-phat-khop` (mới): khoá dòng đổi vì dòng nay có đầu phát (`sup|động cơ||dòng` → `sup|động cơ|mã|dòng`); độ lệch điểm giữa hai khoá khớp đúng +40 + 3 × khoá thông số đầu phát (+80 nếu "đầu phát HSMT nêu").
- `ban-ghi-moi` (mới): dòng của bản ghi động cơ không có ở `main` (có trong danh sách bản ghi mới của cây PR).
- `diem-cong-suat-doi` / `cong-suat-doi` (mới): dòng của bản ghi ĐỔI công suất (camda n155): điểm đổi chỉ ở phần trừ vượt cỡ (`rowPower / cỡ`), khoá thông số và lý do không đổi; hoặc dòng vào danh sách ứng viên nhờ công suất mới.
- `luat-loai`, `he-qua-truc-tiep`, `he-qua-day-chuyen`: như lượt 5.
- Không gặp ở lượt này: `diem-lech` (trừ 1 dòng soát tay, mục 4.3), `he-qua-ngoai`, `chua`.

## 4. Kết quả từng bước

TSV: `nghiem-thu/do-gop-luot-6-pr.tsv` (14.480 dòng; cột: bước đo, lượt, loại, NCC, động cơ, đầu phát, băm chữ dòng, hạng / điểm trước và sau, PR, nhóm, cơ chế, quy về (bước tích hợp)). Gồm 3 bước đo riêng + bước tích hợp.

### 4.1 #1207 (main → main + #1207): 1.233 dòng, 100 lượt / 97 gói

| Nhóm | Dòng | Chi tiết |
|---|---:|---|
| dau-phat-khop | 133 | energy-gruppi 74 (Linz PRO18 / PRO22 / PRO28: +55 = 40 + 3 × 5 khoá; Mecc Alte ECO40 / ECO43: +40, chưa có thông số; 2 dòng +135 = 40 + 15 + 80 "đầu phát HSMT nêu"), fudiankang-hunan 59 (Stamford S1L2 / UCI224G / UCI274H / S4L1D / S5L1D / S6L1D: +52 = 40 + 3 × 4). 100 vào, 33 ra; **33 dòng "ra" đều có dòng "vào" cùng chữ dòng ở cùng lượt** (chỉ đổi khoá vì thêm mã đầu phát). |
| he-qua-truc-tiep | 1.100 | 984 dịch hạng, 92 ra, 24 vào. Ví dụ IB2400073944#0: energy-gruppi 4008TAG1A + ECO43-2S/4 từ hạng 8 (209) lên hạng 1 (249), các dòng phía dưới dịch một hạng, cgm-italia TWD1744GE và tecnogen 2806A-E18TTAG5 ra, cgm-italia 2806A-E18TTAG5 vào (trần NCC / động cơ). |

Ô đầu phát nguồn kiểm lại: fudiankang-hunan n2001 / 2003 / 2004 / 2007 / 2009 "Alternator Model: Stamford …" và energy-gruppi n2001 / 2005 / 2008 / 2012 "ALTERNATOR:" + dòng sau, khớp mã ghi vào bản ghi.

### 4.2 #1227 (main → main + #1227): 5.878 dòng, 699 lượt / 593 gói

| Nhóm | Dòng | Gốc |
|---|---:|---|
| ban-ghi-moi | 785 | camda-generator 571 (n137 Cummins 50 / 60 Hz, n158 Perkins 50 Hz; 41 động cơ), jet-power 209 (n111 Kubota: D1703 64, V1505 55, D1105 28, D905 16, V2003T 15, V3300T 8, V2403 7, V2203 5, D1803 4, V3300 4, V3800T 3), hosem-power 5 (n106 Weichai WP2.3CD25E200, WP4.1CD83E200, WP10CD200E200). Vào top ở 578 lượt. |
| diem-khop | 581 | **+8 `emission`** 510 dòng: tờ jet-power n111 (bản ghi mới) có cột "Emission level" → các động cơ Kubota V1505, D1703, D1105, V3300, V2003T, V2203, V3300T thêm khoá `emission` cho mọi NCC chào mã đó (wintpower, hgi-generators, stephill, elitech-power, sanyu-kogyo, agestar, depco-power); **+40** 47 dòng D905 (thêm bore, cyl, disp, emission, gov); **+16** 4 dòng V2403 (bore, disp); **−60** 20 dòng 1006TG2A mất hãng (mục 5). |
| diem-cong-suat-doi / cong-suat-doi | 18 / 1 | camda n155 (mức sửa): 4012-46TWG3A 10, 4008TAG1A 7, 4012-46TWG2A 2; điểm ±1…12 do prime mới (đúng) thay prime cũ (sai) trong phần trừ vượt cỡ. |
| luat-loai | 14 | **9 dòng D905 bị loại `cyl`** (wintpower 5, agestar 4; IB2200035219, IB2200062524, IB2200066148, IB2400384429, IB2500144659): D905 nay có số xi lanh 3 (jet-power n111, đúng: Kubota D905 3 xi lanh); HSMT các gói này ghi 1 hoặc 2 xi lanh (đã đọc HSMT kiểm, không chép). Đúng; các dòng D905E2BG của NCC khác đã bị loại vì cùng lý do trên `main`. **5 dòng camda n155** bị loại `band` (4) / `prime` (1): ví dụ IB2200093803#0 KDGC2000S prime nay 1.800 kW (đúng ô nguồn), ngoài 100–120 % của 2.000 kW; `main` đọc prime 2.000 kW (sai, là kW dự phòng). Đúng. |
| he-qua-truc-tiep / day-chuyen | 4.435 / 44 | |
| chưa giải thích | **0** | |

Thay đổi hãng toàn cục của #1227 (catalog): 1006TG2A Lovol → không hãng; QSKTAA19-G3 NR2 không hãng → Cummins (camda n137; không đổi dòng top 30 nào ngoài dòng camda mới); 20M33G2750/5 Weichai → "Baudouin / Weichai" (cặp `SAME_MAKER`, không đổi điểm). Động cơ mới: 5 mã Baudouin DCP, Kubota D1803, V3800T.

Số lượt top ngắn lại: 6 lượt (D905 bị loại ở gói máy nhỏ, ít ứng viên), 1 lượt dài thêm (IB2200052323#0).

### 4.3 #1228 (main → main + #1228): 170 dòng, 13 lượt

| Nhóm | Dòng | Gốc |
|---|---:|---|
| ban-ghi-moi | 9 | koten-power n157 YT4B2Z-D 3, n159 LR4B5-D 3, n238 404D-22G1 2, n139 4Z3.2-G11 1 |
| diem-khop | 5 | 404D-22G1 không hãng → Perkins (koten n238 "Engine Brand \| Perkins"): +60 (3 dòng) và +360 = +60 + 300 "hãng động cơ Perkins HSMT nêu" (2 dòng: world-power-fuzhou IB2300296794#0 khớp máy; voltgent IB2400224420#0 **soát tay**: dòng xếp thứ 146 trong `all` nên ngoài 120 dòng chẩn đoán; cả 120 dòng đầu của lượt có lý do "hãng động cơ Perkins HSMT nêu"). |
| he-qua-truc-tiep / day-chuyen | 154 / 2 | |
| chưa giải thích | **0** | |

### 4.4 Tích hợp (3 PR) so `main`: 7.199 dòng, 768 lượt / 653 gói

| Quy về | Dòng |
|---|---:|
| #1227, khớp đúng bước đo riêng | 5.791 |
| #1207, khớp đúng | 1.173 |
| #1228, khớp đúng | 152 |
| cả hai đo riêng đều đổi dòng này, khớp đúng một / cả hai bên | 8 + 3 + 2 (#1207 + #1227); 3 + 2 + 1 (#1227 + #1228) |
| đo riêng có đổi, khác hạng khi gộp (dòng của PR khác cùng lượt) | 45 + 8 + 7 + 2 + 2 |
| **chỉ đổi khi gộp** | **0** |

Không có tương tác mới giữa ba PR: nhóm cơ chế của bước tích hợp là tổng ba bước riêng (ban-ghi-moi 789, diem-khop 586, dau-phat-khop 133, luat-loai 14, cong-suat 19, hệ quả 5.658).

## 5. Đối chiếu bản ghi mới / đổi với dòng nguồn (`suppliers/cn/`, `suppliers/sources/`)

Mọi tổ hợp (NCC, động cơ) của bản ghi MỚI xuất hiện trong top 30 (60 tổ hợp, 69 dòng nguồn): máy so model tổ máy = ô đầu, mã động cơ = ô dưới "Engine Model", mỗi số dự phòng / prime = đúng ô theo tiêu đề trả lại, tần số = tần số của bảng; soát tay ô nguồn trong `sources/<id>/<n>.md`.

| NCC (nguồn) | Tổ hợp / dòng | Kết luận |
|---|---:|---|
| camda-generator n137 bảng 45 (50 Hz) / 46 (60 Hz), n158 bảng 59 (50 Hz) | 42 / 51 | **Đúng 51 / 51.** Tiêu đề trả lại "Genset Model \| Standby power \| Prime power \| Engine Model …" có nguyên văn ở `sources/camda-generator/137.md` dòng 121–124, 171–174 và `158.md` dòng 119–124; số dự phòng = ô 1–2, prime = ô 3–4, động cơ = ô 5. KDGC69S (4BTA3.9-G11): prime "76 \| 6" gõ sai ở nguồn, không đọc (chỉ dự phòng 86 / 69), đúng luật cũ. KDGC1500S (KTA50-G15) prime "--": chỉ dự phòng, đúng. |
| jet-power n111 bảng 10 (400 V / 50 Hz / 1500 rpm) | 11 / 11 | **Đúng 11 / 11.** Ví dụ K-7D5 D905 dự phòng 7 kVA / 5,6 kW, prime 6,4 / 5,1, 3 xi lanh, 0,898 L, 72 × 73,6. Số xi lanh / dung tích / lỗ × hành trình của 11 mã Kubota hợp lý với số Kubota công bố (D-series 3 xi lanh, V-series 4 xi lanh; đối chiếu theo hiểu biết chung, không tra tờ hãng trong repo). Hai dòng cùng model K-22D5 (V2003T, V2403 EGV) là hai dòng của nguồn. |
| hosem-power n106 bảng 5 | 3 / 3 | **Đúng 3 / 3** (mức `rated`, kW / kVA ô 1–2, động cơ ô 4). Thiếu, không sai: tần số không đọc từ ô "50/400". Nguồn ghi model A-WC100M ba lần với 100 / 120 / 150 kW (lỗi nguồn); bản ghi WP10CD200E200 = dòng 150 kW / 182 kW động cơ, khớp. Trang là tổ máy tàu thuỷ (tiêu đề "Marine"). |
| koten-power n139 / n157 / n159 / n238 | 4 / 4 | **Đúng 4 / 4** (soát tay cột 0 = 50 Hz): KS30D5 4Z3.2-G11 (động cơ từ bảng "Engine Model" liền sau, 1500 rpm ↔ 50 Hz) prime 24 kW / 30 kVA, dự phòng 26,4 / 33; KDY-60/S YT4B2Z-D 48 / 60, 53 / 66; KDY-50/S LR4B5-D 40 / 50, 44 / 55; KDP-20/S 404D-22G1 16 / 20, 18 / 22. |

**22 bản ghi camda n155 bảng 54 đổi mức (kiểm cả 22, thêm 16 của bảng 55):** máy so từng bản ghi (11 dòng × động cơ + đầu phát) với ô nguồn: genset = ô 0, dự phòng kVA / kW = ô 1 / 2, prime kVA / kW = ô 3 / 4, model động cơ / đầu phát = ô 5 / 6: **22 / 22 đúng** (bảng 55: 16 / 16, tần số 60 Hz). `main` đọc prime kW = ô 2 (kW dự phòng), không có prime kVA: sai, PR sửa đúng. Trong top 30 các bản ghi này đổi 24 dòng (19 điểm / vào, 5 bị loại `band` / `prime`), mục 4.2; đều theo số đúng.

**Điểm cần Khoa quyết (#1227): hãng của 1006TG2A.** `main`: Lovol (một nguồn mức "tiêu đề cột": jet-power n137). #1227 thêm camda n158 KDGP106S1 1006TG2A dưới dòng tiêu đề "… powered by Perkins …" (trả lại nguyên văn từ `sources/camda-generator/158.md`), cũng mức "tiêu đề cột" → Perkins. `keptMakes`: 1 NCC ↔ 1 NCC, không bên nào ≥ 3 → **không hãng**. Hệ quả: 18 NCC chào 1006TG2A (17 trên `main` + camda) mất +60; 20 dòng (jet-power 8, wintpower 9, victory-generator 3) ra khỏi top 30 ở 14 lượt. Bộ đọc đúng ô; câu hỏi là chính sách hãng:
- (a) giữ như PR (chưa rõ hãng, đúng luật hiện hành);
- (b) coi Perkins / Lovol là một nhà sản xuất cho dòng 1000 (Lovol làm 1004 / 1006 theo giấy phép Perkins), như cặp Baudouin / Weichai của `SAME_MAKER`: 1006TG2A giữ hãng; lưu ý khi đó dòng Lovol được +300 ở gói HSMT nêu Perkins (và ngược lại);
- (c) không lấy hãng từ dòng tiêu đề trả lại của `HEADER_LINES` (coi như tên trang, mức 1): Lovol thắng.

## 6. Việc đề nghị điều phối

1. Merge #1207 và #1228 (độc lập). PR merge sau trong cặp #1227 / #1228 phải gộp tay dòng `api` của `web/catalog.js` (giữ `HEADER_LINES` và `columnSheets`).
2. #1227: hỏi Khoa điểm 1006TG2A (mục 5, a / b / c). Nếu chọn (a) thì merge được ngay; (b) / (c) là PR nhỏ riêng (đo lại 14 lượt có dòng 1006TG2A).
3. Ngoài phạm vi, ghi lại: hosem n106 không đọc tần số "50/400"; nguồn hosem ghi model A-WC100M ba lần; bore jet-power "87×92.5" ↔ depco "87×92.4" và kanpor F4L912 (quality, không chặn).
