# Mã động cơ trùng: một động cơ nằm dưới hai khoá (bước 1, chỉ đọc), 20/11/2026

Phiên điều phối: `session_011tAj4Mp31GbgmLRtLgBxSA`. Không sửa code. Script + đầu ra: `dieu-phoi\dau-vao\ma-dong-co-trung\`.

## Câu hỏi cần Khoa quyết

1. **Hai mã một ô "X (Y)" / "X / Y" (lớp A/B, 138 khoá động cơ)**: tách ô thành HAI bản ghi (mỗi mã một khoá, dòng NCC đếm cho cả hai), hay gán vào MỘT mã? Đề xuất: tách hai bản ghi, nhưng chỉ khi cả hai phần đều là mã động cơ đã có trong danh mục; khi một phần là mã nội bộ NCC / mã lạ (G45E1, QC50/60E, R1J01, 2V95...) thì giữ mã đầu, bỏ phần trong ngoặc. Ca gốc kaihua n119 "6M33G8D3/5 (6M33G825/5)": NCC tự ghi hai mã là một; nguồn hãng (`baudouin.json`) không có câu nào nói 6M33G8D3/5 = 6M33G825/5. Khoa chọn: (a) gán về một mã (mã nào?), (b) tách hai bản ghi, (c) để nguyên?
2. **Hậu tố " L" của Perkins** (2206C-E13TAG2 L, 2806A-E18TAG2 L..., 28 khoá, 143 dòng, 17 NCC — gồm sr-genset n2004 trong brief): KHÔNG nguồn nào trong `suppliers/sources` giải thích "L"; nguồn hãng `perkins/5001.md` chỉ có mã không "L". Gộp vào mã không "L" khi chưa có nguồn hay để riêng? Đề xuất: để riêng tới khi có nguồn (không suy ra).
3. **"Derate" (aj-power, 8 khoá) / "Switchable" (nenjo, sr-genset)**: cùng động cơ, nhưng "Derate" là động cơ chạy công suất hạ. Gộp khoá (để đếm chỗ) mà vẫn giữ chữ trong dòng nguồn — đồng ý?
4. **`madeAt` hiện KHÔNG đọc tiền tố nước**: đo trên 55 dòng "India …" / "UK …" / "(India)" / "(UK/EP)" / "(USA/EU)" / "… EU": 54 dòng ra "?" ngay hôm nay (chỉ "S16R2-PTAW-C SME" ra CN). Gộp khoá không làm mất gì (madeAt đọc dòng nguồn `u.line`, không đọc tên khoá; đo: giữ nguyên ở cả 55 dòng). Muốn `madeAt` đọc được "India"/"UK" thì là việc riêng — có làm không?

## (1) Danh sách theo lớp (động cơ; nguồn: bản web `doc-cache\supplier.json` 18/11, 309 NCC, 6 864 khoá động cơ)

Cách quét (`1-quet.mjs`): với mỗi khoá, tách tên theo dấu cách, ngoặc, "/" (hai cách: giữ "/" trong mã Baudouin/Weichai và tách theo "/"), ","; nếu một đoạn liền là khoá KHÁC đã có → nghi trùng. Phân lớp (`2-lop.mjs`) theo phần chữ thừa. Danh sách đầy đủ từng khoá: `lop-web.tsv` (1 077 khoá nghi trùng cả động cơ + đầu phát). Số liệu bản repo `suppliers/cn` (432 NCC) ở `quet-repo.txt`.

| Lớp | Khoá | Dòng | NCC | Ví dụ nguyên văn → khoá đích | Cùng động cơ? (căn cứ) |
|---|---|---|---|---|---|
| A. Hai mã, ngoặc "X (Y)" | 60 | 122 | 16 | kaihua n119 "6M33G8D3/5 (6M33G825/5)" → 6M33G8D3/5 (10 dòng) và 6M33G825/5 (22 dòng); comappower "4BTA3.9-G2(G45E1)"; fdk "4BTA3.9-G2 (QC50/60E)"; genlitec "DE2V1250 (2V95)"; yanan "12V4000G14F(3B) 12V4000G74F(3D)"; power-hf "PHF6100ZLD1(R1J01)" | Trộn: xem dưới |
| B. Hai mã, gạch "X / Y" hoặc hai mã cách nhau | 78 | 113 | 25 | victory "404A-22G1/ 404D-22G", "1104C-44TAG2/ 1104D-E44TAG2"; mingbang "6BT5.9-G1/G2"; comappower/yanan "12V1600G20S/G80S"; kaihua "WP10D320E200 6M16G350/5"; kc-generatorset "Chongkang/KTA38-G1B" (tên nhà máy, đã xếp lớp E) | Phần lớn KHÁC động cơ: xem dưới |
| C1. Công suất dính mã "X/38KW", "X(360KW)" | 128 | 141 | 4 (jet-power, mecca-power, weiman-fujian, bauer) | "Y4105D/38KW" → Y4105D; "12M33D1320E200/1200KW" | Chắc cùng: phần thừa là công suất tổ máy, ghi ngay trong ô |
| C2. Số dính mã (tốc độ / công suất đọc lẫn) | 55 | 89 | 4 (eastern-lion, cgm-italia, nenjo, bobig) | "WD129TAD23/1500" (vòng/phút); cgm "119,2 1106A-70TG1"; "1320 4012-46TAG2A"; "4006-23TAG3A 1800" | Chắc cùng: số là cột khác bị dính (lỗi đọc) |
| D. Nơi sản xuất | 49 | 55 | 5 (kaihua n122, landtop, comappower, sr-genset, superwatt) | "India 4006-23TAG2A", "UK 4006-23TAG2A", "1103A-33G(India)", "1206A-E70TTAG1(UK/EP)", "2206C-E13TAG2 (USA/EU)", "1104D-44TG2 EU", "S16R2-PTAW-C SME" | Cùng mã động cơ; khác nơi sản xuất. Gộp khoá, nơi sản xuất đọc từ dòng (xem câu hỏi 4) |
| E. Tên hãng / nhà máy dính mã | 67 | 73 | 7 | yongcai "FAW CA6DL2-27D", "Yangdong Y4100D"; saudi-diesel "Hyundai DP158LD"; superwatt "QSK38-G5 cummins", "WP7D264E310 Weichai"; jiuan "6ZTAA13-G2 (DCEC)"; stone "Mistubishi S16R-PTA2-C"; kc-generatorset "Dongfeng Cummins/4BT3.9-G2" | Chắc cùng: phần thừa là tên hãng (FAW, Yangdong chưa có trong ENGINE_BRANDS / hãng viết sau mã / viết sai "Mistubishi") |
| F1. Chữ mô tả đã rõ nghĩa | 15 | 38 | 3 (nenjo, sr-genset, aj-power) | nenjo n119 "4006-23TAG2A Switchable" (cột tiêu đề "转速可调 Switchable" = đổi được tốc độ); aj-power "403D-11G Derate"; "403D-11G commodity" | Cùng động cơ (Switchable: tiêu đề cột nói rõ). Derate: cùng động cơ, công suất hạ |
| F2. Chữ chưa rõ nghĩa | 28 | 143 | 17 | "2206C-E13TAG2 L" (eastern-lion, gfe, long-gen, nenjo, pauway, rcg, sr-genset n2004, yunding, lance-power…); landtop "M N4105ZDS"; rise-power "3512B HD"; welland "QSK60G3 HPI"; tecnogen "S4L2 SD"; voltgent "CR13TE7W. S550" | KHÔNG gộp khi chưa có nguồn. "3512B HD": Cat ghi riêng (rise-power n108 cùng dòng ghi 58,6 L, khác 3512B) → khác động cơ |
| G. Ngoặc quanh hậu tố (khoá chỉ khác "(" ")") | 16 | 193 | 26 | "KTA19-G4(M)" = "KTA19-G4M"; "NTA855-D(M)" = "NTA855-DM"; "4BTA3.9-GM4/7" = "4BTA3.9-GM47"; "186FA(E)" = "186FAE" | Cùng mã (chỉ khác cách viết). Lưu ý: "G2(M)" ≠ "G2" (nghĩa "M" chưa có nguồn) |
| X. Hậu tố mã (không phải trùng) | 161 | 2 067 | 131 | "KTA38-G5"→KTA38; Deutz "BF6M1015C-LA G1B"; Scania "DC13 072A 02-11"; MAN "E3262 LE212"; "K4100ZD-1"; "KTA19-G8A" | KHÁC động cơ / hậu tố công suất (đã chốt không gộp). Ghi ra để loại khỏi danh sách |

Đầu phát (`lop-web.tsv`, kind=alternators): C công suất dính mã 120 khoá / 168 dòng (jet-power "JET184H/30KW", jinlongteng "S4L1D-G4(360KW)"); B hai mã một ô 84 khoá (depco "DPC274F/TAL-A44-J": mã DEPCO + mã Leroy-Somer; aj-power "MA4114F S4L1D-E"; longkai "LK274F/S"); E "STAFMORD PI144K" (gb-power, sai chính tả Stamford) 5 khoá; G 4 khoá; H 86 khoá là báo nhầm (khoá đích là mã trần "274C" của NCC khác, không phải cùng đầu phát). Đầu phát trùng khoá không chiếm chỗ top 30 (chỗ tính theo động cơ) nên không đo ở (3).

### (2) Các ca hai mã một ô: cùng động cơ hay không (căn cứ nguồn)

- kaihua n119 "6M33G8D3/5 (6M33G825/5)" (825/750 kVA): NCC ghi mã mới kèm mã cũ. Nguồn hãng `baudouin/107.md` có họ "…D2/5", "…D3/5" (12M33G4D3/5) nhưng không câu nào nói tương đương mã kVA cũ; baifa ghi "…D3/5" kèm "STAGE 3A/ CHINA STAGE3". → Cùng động cơ THEO NCC, hãng chưa xác nhận. Ô này hiện là khoá thứ ba, chiếm một trong 3 chỗ `MAKE_ROWS` của Baudouin ở IB2600603983.
- kaihua n119/127 "WP10D320E200 6M16G350/5", "WP13D385E200 6M21G385/5", "6M11G110/6 WP6D132E201"…: mã Weichai + mã Baudouin trong một ô; cùng trang có dòng riêng "HC-BD330 | 6M16G350/5". Hai hãng khác nhau → không có nguồn nói là một động cơ; coi là HAI động cơ (NCC chào một trong hai).
- yanan n103 "12V4000G14F(3B) 12V4000G74F(3D)": hai mã MTU khác nhau (G14 / G74) → hai động cơ, tách hai bản ghi.
- victory "404A-22G1/ 404D-22G", "1104C-44TAG2/ 1104D-E44TAG2", "1104D-44TG1/ 1103A-33TG2": hai mã Perkins khác đời / khác máy → hai động cơ.
- "6BT5.9-G1/G2", "4Z2.3-G11/G21", "12V1600G20S/G80S", "KTA19-G4/G3A", "QSK50-G4/G11": hai hậu tố công suất → hai mã (đã chốt không gộp hậu tố công suất) → tách.
- comappower/deman/yanan "4BTA3.9-G2(G45E1)", fdk/sr-genset "4BTA3.9-G2 (QC50/60E)", power-hf "PHF6100ZLD1(R1J01)", genlitec "DE2V1250 (2V95)": phần trong ngoặc là mã khác (của nhà máy / NCC), không khoá nào khác dùng (trừ 2V9x: 2V95 1 dòng, 2V92 5, 2V88 2). Nguồn không nói nghĩa. → Gán về mã ngoài ngoặc (đó là khoá đã có 287 / 258 dòng), giữ phần ngoặc trong `names`.
- comappower/eastern-lion "YD4KD(YD485D)" / "(YD4KD) YD485D": hai mã của cùng hãng; nguồn không nói là một. → tách hai bản ghi hoặc hỏi.

## (3) Hệ quả trên top 30

**ĐO TRÊN MẪU, phần cả kho là ƯỚC TÍNH.** Bước ứng viên (`candidates`, mã main 1e712e19) chạy ~25 s/lượt nên cả 928 gói (~1 070 lượt) mất ~7 giờ; đã đo mẫu 1/5 số gói (gói thứ 0, 5, 10… trong `doc-cache\bidhist.json`, lọc như `noi-chuan-hoa-1/do-ung-vien.mjs`): **214 lượt** (`3-do.mjs 0..2 3 5`, gộp ở `do-mau-s5.json`). NCC: `doc-cache\supplier.json` 18/11.

Cách đếm: một lượt "dính" một lớp khi top 30 có ≥ 2 khoá KHÁC NHAU của cùng một nhóm (khoá thừa + khoá đích); "chỗ thừa" = số dòng top 30 mang khoá thừa trong nhóm đó.

| Lớp | Lượt dính (mẫu 214) | Chỗ thừa (mẫu) | Ước tính cả kho (×5) | Ví dụ (mẫu) |
|---|---|---|---|---|
| C1 công suất dính mã | 48 (22%) | 55 | ~240 lượt / ~275 chỗ | IB2300171891 11 kVA: #6 YD385D (tecgen n129) + … + #26 "YD385D/13KW" + #27 "YD385D/11KW" (jet-power n123/n124) |
| F1 Derate / Switchable | 8 | 20 | ~40 / ~100 | IB2500405459 750 kVA: #7 4006-23TAG3A (allam) + … + #24 "4006-23TAG3A Derate" (aj-power n104) |
| F2 chưa rõ nghĩa | 10 | 19 | ~50 / ~95 | IB2500571943 12 kVA: #1 S4L2 (geko) + #2 "S4L2 SD" (tecnogen n2005) (chưa rõ có cùng động cơ không) |
| A hai mã, ngoặc | 3 | 4 | ~15 / ~20 | IB2300194512 750 kVA: #9 6M33G825/5 (longkai n108) + #12 "6M33G8D3/5 (6M33G825/5)" (kaihua n119) + #22 6M33G825/5 (weichai-heavy-machinery); IB2600465194 4000 kVA: #3 "20V4000G44S(3B)" (comappower) + #11 20V4000G44S (agg) + #12 "20V4000G44S(3B) 20V4000G94S(3D)" (yanan) |
| B hai mã, gạch | 2 | 2 | ~10 / ~10 | IB2300296794 20 kVA: 404A-22G1 ×3 + 404D-22G ×3 + #14 "404A-22G1/ 404D-22G" (victory) |
| D nơi sản xuất | 1 | 1 | ~5 / ~5 | IB2300194512 750 kVA: #4 4006-23TAG2A (fdk n108) + #13 "India 4006-23TAG2A" (kaihua n122) |
| E tên hãng dính | 1 | 1 | ~5 / ~5 | IB2300296794 20 kVA: 404D-22G ×3 + #13 "404D-22G PERKINS" (superwatt n119) |
| C2 số dính mã | 0 | 0 | 0 (ít, không thấy trong mẫu) | — |
| G chỉ khác ngoặc | 0 | 0 | 0 (không thấy trong mẫu) | — |
| X hậu tố mã (KHÔNG phải trùng) | 12 | 32 | — | IB2200005800 320 kVA: P126TI-II + P126TI (Doosan hai đời) — không gộp |

- Lượt có ít nhất một lớp A–G dính: **61 đến 73 / 214** (29–34%; các lớp có thể trùng lượt; 73 là số lượt dính bất kỳ lớp nào kể cả X). Ước tính cả kho: ~300–370 lượt.
- **IB2600603983** (không có trong `doc-cache\bidhist.json`; lấy từ `dau-vao\ib2600603983\cand-out.txt`, cùng mã main): 1 chỗ thừa lớp A — #18 "6M33G8D3/5 (6M33G825/5)" (kaihua n119, 213 điểm) cạnh #13 6M33G825/5 (longkai n108, 238). Ô này chiếm chỗ thứ 3 trong `MAKE_ROWS = 3` của Baudouin → dòng tốt nhất của 6M31G825/5 (voltgent n110, 190 điểm) không vào. Gộp riêng ca này chưa đủ để 6M31G825/5 vào top 30 (hạng thô 141; phần còn lại là thiếu dữ liệu, xem `phan-tich.md`), nhưng giải phóng một chỗ Baudouin.
- Đọc kết quả: lớp gây trùng nhiều nhất là C1 (jet-power, mecca-power, weiman-fujian ghi "mã/công suất"), sửa an toàn nhất (bỏ "/<số>KW" ở bước đọc ô). Lớp A (ca gốc) hiếm (~1,4% lượt) nhưng rơi đúng vào các gói lớn.

## (4) Phương án sửa từng lớp

| Lớp | Cách sửa | Chỗ sửa | Rủi ro | Cách đo |
|---|---|---|---|---|
| C1, C2 (số / công suất dính) | Bỏ phần "/<số>KW", "(<số>KW)", "/1500", số đứng trước / sau mã khi số đó là ô khác — ở bước đọc ô (`tidyModel` / `canon`), KHÔNG ở `keyOf` | `web/catalog.js` (tidyModel), test `bot/test` không liên quan; test `suppliers/catalog-*.test.mjs` | Thấp. Bẫy: mã có số thật sau "/" (Baudouin "6M16G350/5", Weichai) — chỉ bỏ khi có đơn vị KW/KVA hoặc đúng 1500/1800 | `1-quet.mjs` trước/sau: lớp C về 0; `7-khoa.mjs` cho khoá đích (số dòng tăng, `kw`/`kva` không lệch) |
| D (nơi sản xuất) | Bỏ tiền tố / hậu tố nước ("India", "UK", "(UK/EP)", "(USA/EU)", " EU", " SME") khỏi tên model ở `tidyModel`; dòng nguồn giữ nguyên nên `madeAt` đọc như cũ | `web/catalog.js` | Thấp; `madeAt` hôm nay ra "?" ở 54/55 dòng này (đo `4-madeat.mjs`) → không mất gì. Nếu sau này cho `madeAt` đọc "India" thì đọc từ `u.line` | `4-madeat.mjs`: nơi sản xuất từng dòng giữ nguyên |
| E (tên hãng dính) | Thêm FAW, Yangdong (và tên nhà máy Chongkang, Dongfeng Cummins, Guangxi Yuchai, Pangu, Shigeyasu, DCEC) vào nhận hãng của `tidyModel`; nhận hãng viết SAU mã ("QSK38-G5 cummins") và trong ngoặc "(DCEC)"; "Mistubishi" thêm như cách viết sai | `web/catalog.js` (ENGINE_BRANDS / tidyModel / brandedCode) | Thấp; tên hãng còn làm `make` của bản ghi → kiểm `keptMakes` không đổi hãng của khoá đích | `1-quet.mjs` lớp E về 0; so `make` khoá đích trước/sau |
| G (chỉ khác ngoặc) | `keyOf` bỏ "(" ")" | `web/catalog.js` keyOf | Trung bình: `keyOf` dùng ở nhiều chỗ (bộ điều khiển, gensets, rowflags `CAT.keyOf(u.line)`, `cfgKey` lưu ở configmatch/memo) → khoá cũ đã lưu đổi; ô "X (Y)" chưa tách sẽ dính thành "XY" (vẫn khoá riêng như nay). Phải làm SAU khi tách lớp A | `1-quet.mjs` lớp G về 0; chạy `node --test suppliers/*.test.mjs`; so `cfgKey` các cấu hình lưu |
| F1 (Switchable / Derate / commodity) | Bỏ chữ ở `tidyModel` (danh sách chữ cố định, có nguồn nghĩa) | `web/catalog.js` | Derate: công suất của dòng thấp hơn mã gốc — dòng vẫn mang công suất riêng của nó; `kva`/`kw` của khoá đích giãn ra | `7-khoa.mjs` khoá đích |
| F2 (L, M, HD, HPI, SD, S550) | Không gộp tới khi có nguồn (câu hỏi 2). "3512B HD" giữ riêng (khác dung tích theo nguồn) | — | — | — |
| A/B (hai mã một ô) | Tách ô thành hai bản ghi khi cả hai phần là mã động cơ (như `splitAltCell` đã làm cho đầu phát); khi phần thứ hai là hậu tố ("G1/G2", "TAG3/4") thì dựng mã đủ ("6BT5.9-G2"); khi phần trong ngoặc là mã lạ không khoá nào khác dùng → giữ mã ngoài ngoặc | `web/catalog.js` (đọc dòng bảng tổ máy) | Cao nhất: một dòng NCC thành hai → điểm số dòng / đếm NCC / luật số đông của hai khoá đổi; chọn sai phần (mã nội bộ) tạo khoá rác | `1-quet.mjs` lớp A/B; `3-do.mjs` (chỗ thừa top 30); `kiem-cheo-toan-bo`: so mọi bản ghi trước/sau |
| (lớp nào cũng được) chỉ gộp khi đếm chỗ | Trong `candidates`, nhóm theo "khoá chuẩn" (alias → đích) khi đếm PER_ENGINE / MAKE_ROWS, không đổi danh mục | `suppliers/config-bot.mjs` | Thấp nhất, nhưng chỉ chữa triệu chứng: thông số / luật số đông vẫn tách đôi, web vẫn hiện hai dòng | `3-do.mjs` |

Thứ tự đề xuất: E, C, D, F1 (ở `tidyModel`, chắc cùng động cơ) → A/B (tách ô) → G (`keyOf`). Mỗi bước một PR, đo bằng `1-quet.mjs` + `3-do.mjs` + `7-khoa.mjs` (catalog-b).

## Script

- `1-quet.mjs [web|repo]` → `quet-*.json/txt`: mọi khoá nghi trùng.
- `2-lop.mjs [web|repo]` → `lop-*.json/tsv`, `tong-hop.txt`: phân lớp.
- `3-do.mjs [shard số-shard bước]` → `do-<shard>of<n>-s<bước>.json/txt`: top 30 trên gói doc-cache (đã chạy `0..2 3 5`, gộp `do-mau-s5.json`; chạy đủ `3-do.mjs` không đối số ~7 giờ).
- `4-madeat.mjs` → `madeat.tsv`: nơi sản xuất từng dòng trước / sau gộp.

## Chưa kiểm

- Nghĩa của "L" (Perkins), "M" (landtop KOFO, Cummins "(M)"), "G45E1", "QC50/60E", "R1J01", "D3" Baudouin: không có nguồn trong `suppliers/sources`; chưa tìm trên web (bước 1 chỉ đọc kho).
- Đầu phát: chỉ quét và phân lớp, chưa đo hệ quả (không chiếm chỗ top 30).

## Cần ghi nhớ

- `madeAt` không đọc tiền tố "India"/"UK"/"USA/EU" trong ô động cơ (54/55 dòng ra "?").
