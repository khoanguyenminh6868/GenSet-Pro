# catalog-b-1: dấu chú thích trong mã động cơ, mã cột khác đọc làm động cơ, ba dạng ô đầu phát, ngoại lệ huatai n111 (19/11/2026)

PR DRAFT: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/948 — nhánh `catalog-b`, commit **30621946**, gốc `origin/main` **a89b88be** (có #941, #945). KHÔNG tự merge.
Tệp soát / script: `genbid-work\dieu-phoi\dau-vao\catalog-b\` (mọi đường dẫn dưới đây tương đối thư mục này).

## Kết luận
- Bốn việc làm xong trong `web/catalog.js`; spec-diff toàn bộ: **60.086 → 60.073** bản ghi; 68 đổi, 37 mất, 24 thêm, ở 52 bảng / 24 NCC; **đảo vai 0 → 0**; mọi dòng đã giải thích theo việc (mục 2).
- row-flags: 165 → 160 cờ (drop 23 → 18), mọi cờ đổi giải thích được (mục 4). Test **1320/1320**; `quality --check` không chỉ số nào xấu đi.
- Cần điều phối / Khoa quyết: (a) `★` của ettes-power (15 khoá) — chú thích nguồn nói ★ = **Perkins China sản xuất**, em GIỮ TÁCH (không gộp bừa); (b) `^` của Baudouin / Weichai không có chú thích ở nguồn nào, em GỘP (lý do mục 1). Chi tiết ở "Cần quyết".
- Top 30: chưa đo (theo brief, điều phối đo cloud gốc a89b88be ↔ nhánh 30621946).

## Tệp đã đổi (PR)
- `web/catalog.js`: `keyOf` (dấu cuối `^ ×`, gạch `– —`), `MARK_TAIL`, `MARK_KEEP`, `tidyModel(cell, list, keep)`, `brandedCode`; `engCol` + luật cột "Engine" trong bảng ngang; `splitAltCell` (một hãng nhiều mã, tần số theo mã), `bareAltCodes`, `spaced`, `oneAlt` trong bảng nhãn; 3 dòng `ROW_EXCEPTIONS`.
- `suppliers/catalog-b.test.mjs` (mới, 9 ca, dòng thật: tellhow n115, ettes n146, tecnogen n2005, bruno n101, taihai n102, saudi n109/n110/n115/n128, gb-power n1020, acepow n127, huatai n111).
- `suppliers/alt-fg-wilson.test.mjs`: ca "một hãng hai model KHÔNG tách" đổi thành tách (đúng quyết định việc 3); `suppliers/fixtures/power-titles.json`: ca bruno n101 ghi động cơ "MCP 120-80" (chính lỗi việc 2) → đổi sang dòng YANMAR 2TNV70 cùng bảng, cùng mục đích ca (hai số kVA thập phân không ghép).
- `web/CLAUDE.md`: một mục bẫy catalog-b + dòng ngoại lệ huatai.
- Không đụng `config-bot.mjs`, `genbid-hsmt\`, `cn/`, web thật.

## 1. Việc 1 — khoá động cơ dính ký tự lạ
Đo lại trên a89b88be (`odd-keys-goc.txt`): 6.929 khoá, 70 có ký tự lạ, **52** có khoá sạch tồn tại riêng (★ 33, ^ 13 …; 19 khoá `2*…` của baifa đã biến mất nhờ #945). Sau (`odd-keys-nhanh.txt`): 6.889 khoá, 33 có ký tự lạ, **16** còn tách = 15 ★ ettes (giữ có chủ ý) + `4HTAA43*G34` frs (không sửa).

Nghĩa của từng dấu (quét mọi dòng ngoài bảng của tệp nguồn, `1-odd-nguon.mjs` → `odd-nguon.txt`):
| dấu | NCC | chú thích nguồn | xử lý |
|---|---|---|---|
| ★ | ettes-power (15 khoá, n145/146) | "Models with mark of "★" means the engine made by Perkins China, other models are made in UK." (146.md:213) | **giữ tách** (`MARK_KEEP`) — phân biệt nơi sản xuất; dòng không tự ghi nên `madeAt` không biết |
| ★ | tellhow-power (18 khoá) | "Those marked with ★ are optional engines provided with the national stage-III emission report" (107/115/126.md) | bỏ (ghi chú giấy tờ khí thải, không đổi động cơ) |
| ^ | baifa, landtop, weichai×2, mecca, chuangyuan, aosif, voltgent, jet, waeta (13 khoá) | KHÔNG có chú thích ở nguồn nào (mecca 5001 chỉ có "Contact Mecca team for Baudouin China Stage III models"; baifa: mọi dòng đều "CHINA STAGE3" nhưng chỉ dòng công suất cao nhất mỗi khung có ^) | bỏ: mã Baudouin / Weichai đã tự mã hoá đủ biến thể (E310/E311, /5 /6), ^ không đổi mã |
| × | tellhow n102/103 (QSNT-G4×, KTA50-G15×) | không chú thích (chỉ có chú thích cho `*`) | bỏ (dấu cuối mã) |
| – — | powerlink (KTA50–G3, 4 bản ghi bảng nhãn), fengfa (6CT8.3–GM115), zhengdian (4135D—1) | — | là gạch nối |
| * giữa mã | frs-shenyang n106 "4HTAA4.3*G34" (hàng xóm -G33 / -G35) | — | **không sửa** (lỗi gõ; sửa là đoán) |

Từng cặp khoá cũ → mới (`6-cap-gop.mjs` trên gốc → `cap-gop.tsv`, đủ cột hãng / cyl / disp / bore / công suất của hai bên): 36 khoá gộp, hãng hai bên trùng ở mọi cặp có hãng (6 khoá baifa/tellhow trước không hãng). **Mâu thuẫn thông số: 1 cặp** — aosif n123 `8M33D1012E311^` ghi "12V | 31.8" (của 12M26), khoá sạch 8 xi lanh / 26,14 L. Sau gộp: phiếu cyl {8:1, 8l:1, 12v:1}, không giá trị thắng — y như trước (gốc cũng không thắng); row-flags không gắn cờ (cần nhiều phiếu hơn). Công suất: không cặp nào ngoài dải 0,8–1,25 × kW/kVA của khoá sạch. Đổi số đông: depco WP6D180E201 cờ cylMaj "6 × 6" → "6 × 7" (thêm phiếu của jet/waeta sau khi bỏ ^).

## 2. spec-diff toàn bộ (`node suppliers/spec-diff.mjs git:a89b88be . --out spec-diff-cuoi.txt --md spec-diff-cuoi.md`)
Đầu ra thật: `bản ghi cũ 60086, mới 60073 | khác 68 | chỉ cũ 37, chỉ mới 24 | bảng có đổi 52`, `{"model":65,"power":5,"cyl bỏ":4,"weight thêm":4}`, `đảo vai: 0 → 0 | tự kiểm: cần soát tay 4`. Soát theo khoá NCC|n|bảng|dòng|vai|model (`3-soat.mjs`, chép từ catalog-a, cột nguồn của bảng nhãn lấy chữ các dòng bảng): **`soat-cuoi.tsv`** (194 dòng, cùng cột với catalog-a, `dong-nguon` có ở MỌI dòng — đã kiểm 0 dòng trống), `soat-cuoi.md`. Đổi model = một cặp MẤT + MỚI trong tsv.

| việc | NCC (bản ghi) | lớp | giải thích |
|---|---|---|---|
| 1 | tellhow 35, baifa 5, mecca 3, weichai-heavy 2, weichai-power 2, chuangyuan 2, aosif 1, jet 1, waeta 1, landtop 1, voltgent 1, fengfa 1, zhengdian 1 | đổi model (bỏ ★ ^ × / gạch dài) | cùng dòng, model sạch; khoá gộp với model thật |
| 1 | ettes 4 (n146 b51 "403D-11G ★") | đổi chữ model ("403D-11G ★" → "403D-11G★") | khoá KHÔNG đổi (403D11G★), chỉ bỏ dấu cách trước ★ |
| 1 | generatordieselchina n128 1 | đổi chữ model "245–343 kWm" → "245-343 kWm" | bản ghi rác có sẵn (dòng bảng xuất xứ Cummins), khoá không đổi; ngoài phạm vi |
| 1 | powerlink n2001 4 | không hiện trong spec-diff (chữ model bảng nhãn giữ "KTA50–G3") | khoá builder đổi KTA50–G3 → KTA50G3 (gộp với 201 dòng / 101 NCC) |
| 2 | tecnogen n2005 b4: 4 đổi + 1 mất | dòng 0/1/3/4: động cơ AUS7310-1x → S3L2 SD / S4L2 SD; dòng 7 (MI45TSX*, "S4S DT SD") mất | power dòng 0 "P 11.8/9.7 S 13.2/10" → "P 10 S 11 kVA", dòng 4 "P 3.5/2.9" → "P 15 S 16.5" (cũ đọc nhầm cột kWm / tiêu hao, mới đúng cột 50 Hz); weight +560 ×4 (cột Kg, đúng); **cyl 3/4 → ∅ ×4** (giá trị cũ đúng, nay mất: thiếu, không sai — 4 mục "(!)" của tự kiểm) |
| 2 | bruno n101/103/104: 5 mất | động cơ "MCP 120-80" ×3, "Q401 AUS-80" ×2 (cột STANDARD PANEL) | ô "Engine" = "KOHLER KDW 702" (3 từ, không là mã) → để thiếu |
| 2 | eastern-lion n114 / n142 / n144: 26 động cơ + 4 đầu phát mất | động cơ "EL 2xx/3xx/4xx" (là ĐẦU PHÁT, cột "Alternator model"); đầu phát "RUIFEN6120" (cột Controller) | ô "Engine model" = "4105ZD(小泵）", "D114系列WLD171", "6126ZLD新" (chữ Hán, không là mã) → để thiếu; đầu phát lấy theo vị trí "mã sau động cơ" cũng bỏ. n142 thành "bảng không cho bản ghi nào" (3.112 → 3.113) |
| 3 | saudi-diesel 17 thêm | n109 TAL-A44-M + TAL-A46-C; n115 TAL-A47-D (50) + TAL-A47-F (60); n117 TAL-A49B (50) + TAL-A49-C (60); 11 ô một mã "Leroy Somer TAL-…" (n110 TAL-A46-F tần số 50, n111–114, 116, 118–122) | hãng Leroy-Somer từ chính ô; 11 ô một mã trước không đọc vì hãng hai từ "Leroy Somer" (cùng gốc với dạng (ii)) |
| 3 | gb-power n1010 "Leroy Somer LSA 43.2 L6", n1020 "STAMFORD HCI 444D"; tecgen-fujian n125 "UCI 274J"; genlitec n132/133/142/143 "Leroy Somer LL5114H / LL7224J / LL7224L" | 7 thêm | hãng + mã có dấu cách / hãng hai từ + mã `ALT_CODE` |
| 3 | acepow n127 | 1 mất: đầu phát "UC274D / UCI274D" | hai mã không hãng → để thiếu, note "một ô ghi hai mã" (25 → 26) |
| 4 | huatai n111 b10 dòng 12–14 | power "rated 140 kW/165 kVA" → ∅ ×3 | ngoại lệ nopower (note "ngoại lệ theo dòng" 5 → 8) |

Cờ ⚠ của `3-soat.mjs` (56, mọi cờ đã xem): "model có ngoặc / gạch chéo" = mã Baudouin "/5" "/6" (thật); "mã động cơ không có trong dòng" = mã đã chuẩn hoá (★, –, —) khác chữ dòng; "không công suất / không model tổ máy" ở saudi, genlitec, gb, tellhow, huatai = như bản gốc của cùng dòng (bảng nhãn không có model tổ máy; huatai là chủ ý).

Chưa đọc được (`4-unread-cmp.mjs` gốc ↔ nhánh → `unread-cmp.tsv`, 40 mục): +32 "ô động cơ không đọc được, mã ở cột khác" (tecnogen 1, bruno 5, eastern-lion 26), +1 "một ô ghi hai mã" (acepow), +3 "ngoại lệ theo dòng" (huatai), +1 "bảng không cho bản ghi nào" (eastern-lion n142), −3 "dòng điện / điện áp theo vị trí không khớp" (bruno, dòng không còn bản ghi động cơ).

## 3. Việc 2 — nguyên nhân chung và đếm NCC khác
Nguyên nhân: bảng ngang lấy động cơ = mã đầu tiên không dạng đầu phát; khi ô dưới tiêu đề "Engine" không đọc được (tecnogen "S4S DT SD" ba từ; "S3L2 SD" bị coi là khung Stamford), mã của cột kế (bảng điện AUS7310) bị lấy. Luật mới (chỉ khi dòng tiêu đề có đúng một ô "Engine" và trùng khít số ô với dòng, mã đã lấy đứng BÊN PHẢI cột đó, ô dưới tiêu đề có cả chữ lẫn số): ô đó dạng `ALT_CODE` → là động cơ; không là mã → dòng không có động cơ.
Cùng lỗi ở NCC khác (đếm trên toàn bộ cn): bruno 5 dòng, eastern-lion 26 dòng (đều đã sửa, xem bảng trên). **Bản đầu** (mọi phía, ô chỉ là số cũng tính) đụng 334 dòng, 12 đảo vai: tiêu đề "常用功率" đè hai ô "KVA | KW" làm lệch cột (taihai 123, ettes 82, kangwo 15, xingguang 22) và sanq n113 (tiêu đề "Engine Model" đè cột đầu phát Stamford) — đã thu hẹp, đo lại còn đúng các dòng trên. Ngoài phạm vi (không sửa, ghi lại): zhengchi-power n102–104 (517 dòng) mã tổ máy "ZCDL-…" đứng TRƯỚC cột "柴油机型号" bị đọc làm động cơ — cùng họ lỗi, phía trái; cần việc riêng.

## 4. row-flags (`node suppliers/row-flags.mjs`, `--json`; so `5-rowflags-cmp.mjs` → `row-flags-cmp.txt`)
Gốc: `bản ghi 60086 …, bị gắn cờ 165, trong đó bị loại (mức drop) 23`. Nhánh: `bản ghi 60073 …, bị gắn cờ 160, … 18`.
Mất: huatai WD305TAD68 / WD327TAD78 / WD327TAD82 `absurd current` (việc 4: hết công suất 165 kVA nên dòng điện 1267–1538,5 A không còn bị so — đúng brief); bruno MCP 120-80 ×2 `absurd` (bản ghi sai đã mất). Đổi: depco WP6D180E201 cylMaj (số đông 6 × 6 → 6 × 7). Mới: 0.

## 5. Lệnh kiểm + đầu ra thật
- `node --test suppliers/*.test.mjs web/test/*.test.mjs` → `# tests 1320 # pass 1320 # fail 0` (`test-full.txt`). Lượt đầu 2 hỏng, đều là ca ghi nhận cách đọc cũ đã đổi có chủ ý (sửa như mục "Tệp đã đổi").
- `node suppliers/quality.mjs --check` → "--check: không chỉ số nào xấu đi quá ngưỡng." (`quality-check.txt`).
- spec-diff, row-flags như trên; lượt trung gian `spec-diff-1/2/3.*` giữ lại để thấy quá trình thu hẹp.

## 6. Ba mẫu đối chiếu nguồn (bản lưu `suppliers/sources/<id>/<n>.md`, chưa mở lại URL)
1. ettes-power n146, https://www.ettesgenerator.com/Perkins-2000-Series-pd46817356.html (Accessed 2026-11-13): dòng "| EP-10 | 7 | 9 | 8 | 10 | 403A-11G1★ |…" và chú thích "Models with mark of "★" means the engine made by Perkins China" → giữ khoá 403A11G1★.
2. tecnogen n2005, https://www.tecnogen.com/1500-1800-rpm/series-enermax/enermax-mitsubishi/ (Accessed 2026-11-14): tiêu đề "… | Aspiration | Standard panel | Automatic panel" / "… | Engine | …", dòng "| MI45TSX* | 42 | 40 | 54 | 49 | S4S DT SD | … | T | AUS7310 | ACP 7320 |" → AUS7310 ở cột Standard panel, không còn là động cơ.
3. saudi-diesel n115, https://www.saudidiesel.com.sa/our-products/power-equipment/bobcat-large-generators/pg610w/ (Accessed 2026-11-13): "| Alternator | Leroy Somer TAL-A47-D (50 Hz) / TAL-A47-F (60 Hz)" → TAL-A47-D (50 Hz) + TAL-A47-F (60 Hz), hãng Leroy-Somer.
(thêm) huatai n111, http://www.yzhuatai.cn/index.php?s=index/show/index&id=13: "| 700GF | 140/165 | 1267 | WD305TAD68 |…" dưới "输出功率 Power of output (KW/KVA)" (xem `huatai-n111-1.md`).

## 7. Để nguyên và vì sao
- ★ ettes 15 khoá (cần quyết, xem dưới). `4HTAA4.3*G34` (lỗi gõ). Khoá lạ không có khoá sạch (`,` cgm "119,21106A70TG1", `:` …, gordon "L6111×139"): ngoài brief, là rác khác loại.
- saudi "S54D / S5C", "MG-S63H / S6H"… (hai mã không hãng, mã không dạng `ALT_CODE`), depco "DPC184E/TAL-A40-F…" (mã tương đương), jet / camda "mã/công suất": như cũ.
- zhengchi (mã tổ máy làm động cơ), eastern-lion n142 đầu phát EL 2xx nay không có bản ghi nào (trước đó bị đọc làm động cơ; đọc lại làm đầu phát cần luật cột đầu phát, chưa làm).
- tecnogen n2005: 4 số xi lanh đúng (3, 4) mất khi động cơ chuyển sang cột Engine (lượt đi từ ô động cơ không tới cột "Cylinder" của tiêu đề hai tầng) — thiếu, không sai.
- Đầu phát "(50 Hz)" ở bảng ngang: chưa gặp, không đổi.

## 8. Rủi ro + quay lui
- Rủi ro: luật cột "Engine" có thể chạm bảng mới cào sau này có tiêu đề trùng khít ô nhưng lệch nghĩa → chỉ làm MẤT động cơ (không gán sai), có note để tìm (`unread-tables.mjs --reason "ô động cơ không đọc được, mã ở cột khác"`). Gộp khoá ^ đổi số đông của 13 khoá (thêm 1 phiếu mỗi khoá; chỉ 1 cặp mâu thuẫn, không đổi kết quả). Top 30 chưa đo: các dòng đổi điểm dự kiến ở gói đòi MTU 4000 / Volvo TAD / Baudouin M33 (khoá gộp), Leroy-Somer TAL (saudi) và gói 30–50 kVA (tecnogen).
- Quay lui: `git revert` commit 30621946 (một commit; không đổi dữ liệu `cn/`).

## Chưa kiểm
- Top 30 (điều phối đo cloud; em giải thích mọi lượt đổi khi có tệp ở `dau-vao\catalog-b\top30-cloud\`).
- md5 JSON `build()` gốc ↔ nhánh: không đo riêng (spec-diff + builder qua `odd-keys`, `cap-gop`, row-flags đã so); bidprice, web thật: không đo. Không mở lại URL nguồn.

## Cần Khoa / điều phối quyết
1. ★ ettes-power: giữ tách (hiện tại) hay gộp với model Perkins và đưa "Perkins China" vào nơi sản xuất của dòng (`madeAt`, việc riêng: đọc chú thích cuối bảng)?
2. ^ Baudouin / Weichai: em gộp vì không có chú thích; nếu Khoa biết ^ là biến thể (vd. Stage III Trung Quốc) thì thêm `^` vào `MARK_KEEP` theo NCC.
3. Việc riêng đề xuất (không tự mở): zhengchi mã tổ máy làm động cơ (517 dòng); eastern-lion đọc "EL xxx" làm đầu phát; "RUIFEN6120" / controller đọc làm đầu phát ở bảng khác của eastern-lion.

## Cần ghi nhớ
- Khoa 19/11 duyệt cả bốn việc catalog-b: đã làm ở PR #948 (draft).
- Bẫy mới (đã ghi `web/CLAUDE.md`): luật cột "Engine" phải giới hạn (bên phải + ô có chữ); bản rộng đụng 334 dòng vì tiêu đề gộp ô.
- `3-soat.mjs` của catalog-a in "undefined" ở cột nguồn cho bản ghi bảng nhãn; bản catalog-b đã sửa (dùng `textOf`).
