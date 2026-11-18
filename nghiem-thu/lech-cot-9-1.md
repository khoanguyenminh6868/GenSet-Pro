# Lệch cột 9 — chặng 1: `candidates` loại theo giá trị thắng số đông

PR (DRAFT, chưa merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/902 — nhánh `lech-cot-9`, đầu nhánh d4906d75, rebase lên origin/main 7d632e30.

## CẬP NHẬT 18/11 — Khoa chọn (d)
Khoa (nguyên văn): "làm (d) trước. (c) để đo và làm sau".
- Commit d4906d75: luật số đông CHỈ áp cho số xi lanh (`MAJ_KEYS = {cyl}`): xi lanh tối thiểu (`below`) và nhánh số xi lanh ghi trơ theo động cơ. Dung tích tối thiểu và tối đa: code y như main (`git diff origin/main` không còn dòng nào đổi ở hai chỗ đó). Lý do của dòng dung tích không ghi số phiếu.
- Test: 2 test dung tích đổi thành "số đông KHÔNG dùng → không loại ai, như trước" (min: 18,9 × 3 : 30 × 1; max: 30 × 3 : 18,9 × 1), thêm ca mọi nguồn dưới ngưỡng vẫn loại. `node --test suppliers` → `# tests 1012 # pass 1012 # fail 0`; `node --test web/test/*.test.mjs` → `# tests 161 # pass 161 # fail 0`.
- `gopRow.mjs` lại cho 2 gói (main 7d632e30 ↔ nhánh), kết quả giống lượt trước: IB2400517601#0 và IB2400617546#0, mỗi gói agg-power `650/520` (top#6 điểm 136) và tecnogen `CU715TSX*` (top#7 điểm 136) → LOẠI [cyl]; không dòng nào khác đổi.
- `suppliers/CLAUDE.md`: ghi rõ chỉ số xi lanh + quyết định của Khoa.
- Phần bên dưới là bản ghi lượt đầu (cả dung tích). Danh sách 191 nhóm dung tích giữ lại làm đầu vào cho việc (c). Với (d), chỗ luật mới có thể đổi kết quả là 108 nhóm số xi lanh, giá trị thắng đúng cả 108.

## Tệp đã đổi
- `suppliers/config-bot.mjs`: `majorityOf(figs)` (export) + `BLOCK` (export, để script kiểm dùng); trong `candidates`: `below` (dung tích / xi lanh tối thiểu), trần dung tích (`maxDisp`), số xi lanh ghi trơ (`cylExact`, nhánh dòng không tự ghi số). Lý do của dòng HSMT nêu đích danh có thêm "(số đông nhà cung cấp: 6 × 4, 12 × 1)"; `dropped[].src[key]` có `win`, `votes`.
- `suppliers/cand-majority.test.mjs` (mới, 7 test).
- `suppliers/CLAUDE.md`: ghi luật mới + bẫy bảng mẫu chép chung.

## Thiết kế (chỗ khác với brief)
- Brief bảo dùng `win` của `web/catalog.js`. **Không dùng được nguyên**: catalog đếm phiếu theo CHỮ (chữ thường, bỏ cách). QSK19-G4: `{"6":10,"6l":4,"v12":1}` → 10 không gấp 3 lần 4 → `win = null`, ca thật không sửa được. Nên `candidates` tính lại bằng `CAT.tally` (cùng hàm, cùng luật ≥ 3 NCC / gấp ≥ 3 lần, một NCC một phiếu) trên SỐ đã đọc qua lớp chuẩn hoá (cùng hàm đọc `dispOf` / `cylOf` mà `below` dùng). Không sửa `catalog.js`. Cách đếm này trùng cách `quality.mjs` đếm mâu thuẫn (`normCanon`, bước `win`).
- NCC chỉ có số "không so được" (BLOCK: thiếu đơn vị…) tính như phiếu cho giá trị đứng thứ hai: giá trị thắng phải vẫn thắng. (Trước: một BLOCK là không loại.)
- Phiếu tính trên số của động cơ (`modelFacts`) + số của chính dòng, như `below`.
- Không dung sai: 18,9 và 19 là hai giá trị (Khoa đã bỏ dung sai 2% khi so giữa NCC, 17/11).
- Số xi lanh ghi trơ: dòng tự ghi số thì vẫn theo ô của nó (như cũ); chỉ nhánh "theo động cơ" dùng giá trị thắng. Chỉ ở `candidates`; `makerSheetChecks` không đổi (đúng quyết định Khoa 17/11).
- Áp thêm cho trần dung tích (`maxDisp`): cùng kiểu "mọi nguồn" như `below`. Bố trí xi lanh (luật ≥ 2 NCC) không đổi.
- Luật chỉ LOẠI THÊM, không cứu dòng nào: mọi nguồn dưới ngưỡng thì giá trị thắng (là một trong số đó) cũng dưới.

## Lệnh kiểm và đầu ra thật
- `node --test suppliers` → `# tests 1001 # pass 1001 # fail 0`.
- `node --test web/test/*.test.mjs` → `# tests 161 # pass 161 # fail 0`.
- `node --test suppliers/cand-majority.test.mjs` → 7/7 (ca QSK19-G4 rút gọn; đối chứng 2 NCC ghi 6 + 1 ghi V 12 → không ai bị loại, như cũ; dung tích min 18,9 × 3 vs 30 × 1; đối chứng 2 : 1; dung tích max; xi lanh ghi trơ 12 × 3 vs 6 × 1 và đối chứng 2 : 1; dòng HSMT nêu đích danh ở lại kèm lý do).
- `gopRow.mjs` cho 2 gói, base (origin/main) ↔ nhánh, `gopRowCmp.cjs` (đo thật):
  ```
  == IB2400517601#0 cap 630 kVA origin g20   dòng 90 → 90
   agg-power|650/520                    top#6 hạng 11 điểm 136 Cummins QSK19G4 → LOẠI [cyl]
   tecnogen||CU715TSX*|…|QSK19G4|E|6|…  top#7 hạng 12 điểm 136 Cummins QSK19G4 → LOẠI [cyl]
  == IB2400617546#0 (giống hệt)
  ```
  Không dòng nào khác đổi trạng thái / điểm ở top của hai gói. Dòng tecnogen tự ghi "6" ở cột xi lanh; trước đây vẫn giữ vì nguồn longkai "V 12" làm "mọi nguồn" không thoả.

## Danh sách đầy đủ chỗ luật mới có thể đổi kết quả (đã xem HẾT)
Script `dau-vao\ra-soat-lech-dong-cot\winDiff.mjs <worktree> winDiff.txt winDiff.json` (đọc như `candidates`, theo từng dòng của động cơ). 6.869 động cơ, 1.051 có giá trị thắng; **299 nhóm model + thông số có ít nhất một nguồn ghi khác** (108 xi lanh, 191 dung tích). Chi tiết từng nhóm, NCC theo từng giá trị và dòng nguồn ghi khác: `winDiff.txt`.

**Số xi lanh (108 nhóm): giá trị thắng đúng cả 108** theo mã model (QSK19 6, KTA38 12, KTA50 16, 403A 3, 4BTA 4, WP10 6, TAD13/16 6, TAD531 4, 16M33 16, 12M26/12M33 12, MTU 16V2000 16, BF8M1015 8, DP158LD 8, YC6C 6…). Nguồn sai là lệch cột / gõ nhầm: bdadl-shanghai (8 / 10 cho Weichai 12M, 6 cho KTA38, 12 cho KTA50…), mingbang-mbkl (4 cho TAD7/13/16, 1006TAG), depco-power (4 cho WP10/WP13/WP6, 6 cho BF8M1015), longkai "V 12" cho QSK19, aoke-yangzhou (12 cho MTU 16V2000 / Perkins 4016)…

**Dung tích (191 nhóm): 184 đúng, 7 SAI.** Đúng: phần lớn chỉ khác làm tròn (4,4 / 4,41; 12,88 / 12,9; 9,726 / 9,72) hoặc nguồn lệch cột rõ (agestar 13 cho NTA855, mingbang 4,4 cho TAD1641, victory-generator 6,25 cho WP10/12/13, bdadl 31,8 cho 12M33). **Sai** (đối chiếu đường kính × hành trình và mã):
| Model | Thắng | Phiếu | Đúng | Vì sao |
|---|---|---|---|---|
| MTU 6R1600G70F / G80F | 8,2 | bdadl, fukangsi, pengpai : wintpower 10,5 | 10,5 | MTU 1600 = 1,75 L/xi lanh |
| MTU 8V1600G70F / G80F | 11,6 | cùng bộ ba : wintpower 14 | 14 | như trên |
| MTU 10V1600G70F | 13,5 | cùng bộ ba : wintpower 17,5 | 17,5 | như trên |
| MTU 12V1600G80F | 23,88 | cùng bộ ba : wintpower 21 | 21 | như trên |
| Volvo TAD1341GE | 9,36 | bdadl, fukangsi, pengpai, huatai, liangzi : lees 12,78, huipu 1278, mingbang 3,3 | 12,78 | đường kính × hành trình 131 × 158 × 6 = 12,78 L (6 NCC ghi); 9,36 L và 120/138 (huatai) là của TAD941GE |

Nguyên nhân: các NCC TQ chép CHUNG một bảng mẫu (dòng khác tên model nhưng số giống hệt: bdadl "BDA-V250 | 250/312.5 | 沃尔沃遍达 | TAD1341GE | 6 | 9.36 | 34 | ≤202 | 2900*1100*1600 | 2450", liangzi "LZ- V250 | … | TAD1341GE | 6 L | 9.36 | 34 | ≤202 | 2900*1100*1600 | 2450"). Không dòng nào trùng nguyên văn giữa các NCC nên gộp dòng lặp không bắt được. Bỏ riêng bộ ba bdadl / fukangsi / pengpai: 38 / 299 nhóm hết giá trị thắng (gồm cả 7 nhóm sai), không nhóm nào đổi giá trị.

Ảnh hưởng nếu merge nguyên: HSMT đòi dung tích tối thiểu nằm giữa giá trị thắng sai và giá trị đúng (vd ≥ 15 L với MTU 10V1600: đúng 17,5 đạt, thắng 13,5 → loại) thì dòng của 7 model này bị loại oan. Trước đây chúng ở lại (wintpower / lees ghi đúng). Số gói bị ảnh hưởng thật: chưa đo (chặng 2).

## 3 mẫu đối chiếu nguồn
1. QSK19-G4, longkai-power (`suppliers/cn/longkai-power.json`, nguồn n1104): «No. cylinders | V 12»; 15 NCC khác ghi 6 / 6L (aosif, depco-power, fdk-energy, yunding-jiangsu…; tecnogen dòng "CU715TSX* | … | QSK19G4 | E | 6 | 19000"). Cummins QSK19 là 6 xi lanh thẳng hàng.
2. TAD1341GE, bdadl-shanghai: «| BDA-V250 | 250/312.5 | 沃尔沃遍达 | TAD1341GE | 6 | 9.36 | 34 | ≤202 | 2900*1100*1600 | 2450»; lees-power ghi 12.78 và «131x158»; haifeng-taizhou, taihai-taizhou «131/158».
3. Weichai 12M33D1108E200, bdadl-shanghai: «| BDA-W900 | 900/1000 | 潍柴博杜安 | 12M33D1108E200 | 8 | 39.2 | 113 | ≤210 | …» (8 xi lanh: sai; 16 NCC khác ghi 12) — luật mới xét theo 12.

## Rủi ro còn lại + quay lui
- 7 model trên (xem bảng) bị giá trị thắng sai → có thể loại oan. Cần Khoa quyết (dưới).
- Quay lui: revert commit 91256c91 (một commit, chỉ `config-bot.mjs`, test, CLAUDE.md).

## Chưa kiểm
- Chặng 2: top 30 toàn bộ gói (chờ "đo đi", sau PR Lệch cột 8).
- Số xi lanh: không có giá trị đúng kiểu đường kính × hành trình để tự kiểm; đã đối chiếu theo mã model (kiến thức hãng), không mở trang hãng.

## CẦN KHOA QUYẾT (trước khi merge)
Luật số đông bị bảng mẫu chép chung đánh lừa ở 7 model (MTU 1600 ×6, TAD1341GE). Chọn:
- (a) Áp nguyên luật (≥ 3 NCC, gấp ≥ 3 lần), chấp nhận 7 model có thể bị loại oan khi HSMT đòi dung tích tối thiểu trong khoảng giữa.
- (b) Thêm chốt: dung tích thắng phải khớp (±5%) đường kính × hành trình × số xi lanh khi các số này cũng có giá trị thắng; lệch thì coi như không có giá trị thắng (bắt được TAD1341GE; MTU 1600 không có đường kính × hành trình thắng nên vẫn sai).
- (c) Gộp các NCC có số giống hệt cho cùng model (cùng bộ số ở mọi cột) thành MỘT phiếu (bắt được cả 7; cần đo lại vì đổi cả `tally` cho mọi model).
- (d) Chỉ áp cho số xi lanh (108 nhóm đều đúng), dung tích giữ cách cũ.
Em nghiêng về (d) trước (an toàn, đủ sửa ca QSK19-G4), (c) làm sau nếu Khoa muốn cả dung tích.

## Cần ghi nhớ
- `catalog.js` `win` đếm theo chữ, không dùng được cho so số; số đông theo số nằm ở `majorityOf` (config-bot).
- NCC TQ chép chung bảng mẫu: bdadl-shanghai, fukangsi-yangzhou, pengpai-yangzhou (cùng nhóm số), thêm huatai-yangzhou, liangzi-yangzhou cho dòng Volvo → "số đông" không độc lập.
- Script mới: `dau-vao\ra-soat-lech-dong-cot\winDiff.mjs`.
