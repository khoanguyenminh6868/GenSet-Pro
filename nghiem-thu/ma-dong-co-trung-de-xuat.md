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

(điền sau khi `3-do.mjs` chạy xong)

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
- `3-do.mjs` → `do.json/txt`: top 30 trên mọi gói doc-cache.
- `4-madeat.mjs` → `madeat.tsv`: nơi sản xuất từng dòng trước / sau gộp.

## Chưa kiểm

- Nghĩa của "L" (Perkins), "M" (landtop KOFO, Cummins "(M)"), "G45E1", "QC50/60E", "R1J01", "D3" Baudouin: không có nguồn trong `suppliers/sources`; chưa tìm trên web (bước 1 chỉ đọc kho).
- Đầu phát: chỉ quét và phân lớp, chưa đo hệ quả (không chiếm chỗ top 30).

## Cần ghi nhớ

- `madeAt` không đọc tiền tố "India"/"UK"/"USA/EU" trong ô động cơ (54/55 dòng ra "?").
