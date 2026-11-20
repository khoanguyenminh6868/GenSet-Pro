# Nghiệm thu bang-bo-sot-1: đọc 4 bảng tổ máy có mã động cơ bị bỏ sót

- PR draft: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/967 (nhánh `bang-bo-sot-1`, SHA `31ba36b179bb6be3415fdcd2c80392feea19d697`, gốc main `091b5c26`). Không tự merge.
- Khoa duyệt 20/11/2026 (qua điều phối): 4 bảng lớp X của `catalog-c-de-xuat.md` 1.1 (green-power ×3, lees-power ×1) đưa vào đọc như bảng thường.

## Tệp đổi
- `web/catalog.js`: `ENGINE_CELL_TABLES` (danh sách tường minh: NCC + n + dòng tiêu đề đầu nguyên văn + số ô / vị trí ô) và `listedEngineRows(s, already, note)`, gọi bằng một dòng cuối `fromSupplier` (`out.push(...listedEngineRows(s, out, note))`). Không đụng `isCode`, `gensetsOf`, config-bot.
- `suppliers/bang-bo-sot.test.mjs` (5 test, dòng thật), `web/CLAUDE.md` (mục "Bảng bỏ sót").

## Cách đọc
| Bảng | ô động cơ | công suất | ghi chú |
|---|---|---|---|
| green-power n115 (MTU, 29 dòng) | ô 4 "12V 1600 G10F" | PRP kVA ô 2 = prime, ESP kVA ô 3 = standby, 50 Hz (tiêu đề "kVA - 50 Hz") | hãng MTU từ tên trang; cyl, tiêu hao 75 %, bồn, khối lượng ("N.A." bỏ) |
| green-power n117 (Kohler, 19 dòng) | ô 4 "KDW 702 (M)" → "KDW 702" | như trên | "(M)"/"(E)" = cột REG của dòng; tên trang "Relhko" viết sai → không gán hãng; thêm khí thải |
| green-power n126 (Scania khí, 3 dòng) | ô 6 "OC16 071A 02 81 (E)" | PRP ô 2; ESP "/" bỏ | hãng Scania từ tên trang |
| lees-power n133 (20 dòng) | ô 1 "MTU 8V4000 GS/L32" → hãng MTU (dòng bảng) + "8V4000 GS/L32" | "Electrical Power KW" không ghi mức → `rated` (quy ước titledPowers) | tần số để trống (đuôi "-6" không suy ra 60 Hz); kích thước, khối lượng |

Dòng sai số ô (bản cách âm green không ghi động cơ, dòng lees chỉ có số "800 | 43.0 …") → bỏ + note "dòng không ghi động cơ (bảng có mã động cơ trong danh sách): không đọc". Tiêu đề đổi → không đọc + note "đổi tiêu đề". Bảng đã có bản ghi (bộ đọc thường sau này đọc được) → không đọc lần hai.

## Lệnh và kết quả (chạy 20/11/2026 trên máy Khoa)
- `node suppliers/spec-diff.mjs git:091b5c26 . --out x/sd-full.txt --md x/sd.md`: bản ghi 60.073 → 60.116; **0 đổi, 0 mất, 43 thêm**, chỉ 4 bảng (green 27, lees 16); tổ máy `gensetsOf` 1.700 → 1.700 (0/0/0); đảo vai 0 → 0; tự kiểm 0.
- unread: "bảng không cho bản ghi nào" 3.067 → 3.063 (đúng 4 bảng này); "dòng không ghi động cơ (bảng có mã động cơ trong danh sách)" 0 → 28 (24 green + 4 lees); mọi lý do khác giữ nguyên số.
- md5 `build()`: alternators / controllers / gensets giống hệt gốc; engines 6.889 → 6.901. Để rỗng dòng 4 bảng (giữ chỉ số bảng) thì engines = gốc `af5b72830bdcd0875ec2833f076ddc10` → không bản ghi nào ngoài 4 bảng đổi. 12 model mới (8 MTU GS/L32 / L64FNER của lees; KDI 2504 TCR, KDI 1903 TCR, KSD 1403 TC, KSD 1403 TCA không hãng); 21 model có sẵn thêm lượt dùng (12V1600G10F +2, 18V2000G26F, 16V4000G14F, OC16071A0281/82/83, KDW702, KDW1003, KSD1403NA …), hãng không đổi ở model nào.
- `node suppliers/row-flags.mjs --json` trước / sau: 158 dòng, hai tệp JSON giống hệt (bản ghi mới không bị gắn cờ, dòng bảng khác không đổi).
- Soát 43 bản ghi cạnh chữ dòng (`dau-vao/catalog-c/soat-x.mjs`): model, genset, số công suất, thông số đều có nguyên văn trong dòng; "bản ghi: 43, ca lệch kiểm tự động: 0".
- Kiểm 71 dòng (29+19+3+20) của 4 bảng có nguyên văn trong trang nguồn đã lưu (`src-x.mjs`, Accessed 2026-11-13): 71/71. 67 dòng "có mã" của đề xuất = 43 bản ghi + 24 dòng không ghi động cơ.
- Trang sống: lees (Firecrawl 20/11) khớp cả 16 dòng model; greenpowergen.it không phản hồi (Firecrawl ERR_EMPTY_RESPONSE, trình duyệt treo) → chưa so trang sống của green.
- `node --test suppliers/*.test.mjs` 1.199 pass / 0 fail; `node --test web/test/*.test.mjs` 161 / 0; `node suppliers/quality.mjs --check` không xấu đi.
- Script: `dau-vao/catalog-c/soat-x.mjs`, `md5-x.mjs`, `src-x.mjs`.

## 3 mẫu nguồn
1. green n115 — https://www.greenpowergen.it/prodotti/gruppi-elettrogeni-stazionari/mtu/ : `| GP610 A/M | O | 550 | 600 | 12V 1600 G10F | E | 12 | 90.8 | 340 | 3500 | 1500 | 2100 | 4000 | | | |` → động cơ 12V 1600 G10F (khoá 12V1600G10F), tổ máy GP610 A/M, prime 550 / standby 600 kVA, 50 Hz, 12 xi lanh, 90.8 L/h 75 %, bồn 340, 4000 kg.
2. green n126 — https://www.greenpowergen.it/prodotti/gruppi-elettrogeni-gpl-gruppi-elettrogeni-a-metano/gruppi-elettrogeni-a-gas-scania/ : `| GP385A/G | O | 350 | / | / | / | OC16 071A 02 81 (E) | METANO / BIOGAS METHANE / BIOGAS | E | 8 | | | |` → OC16 071A 02 81, prime 350 kVA, không standby, 8 xi lanh.
3. lees n133 — https://www.leespower.com/MTU-GAS-GENERATOR-SET-pd106395538.html : `| LSMU800NGE3 | MTU 8V4000 GS/L32 | 776 | 41.9 | 46.7 | 88.6 | 500 | 4000×2000×2300 | 10000 | PDF` → MTU 8V4000 GS/L32, rated 776 kW, 4000×2000×2300, 10000 kg.
(Thêm: n117 https://www.greenpowergen.it/prodotti/gruppo-elettrogeno-gruppi-elettrogeni-diesel-benzina-1500-rpm/kohler/ "KDW 702 (M)".)

## Rủi ro, quay lui
- n126 và lees NGE3 là máy khí (metan / khí tự nhiên): trước khi có trường nhiên liệu (#958 `fuelOf`) chúng vào ứng viên như động cơ diesel. Top 30 cloud sẽ cho thấy có lọt hay không.
- Mức "rated" của lees (kW không ghi prime/standby): không dùng làm prime.
- 4 model Kohler mới không có hãng (tên trang viết sai "Relhko"): đúng "thà thiếu".
- Quay lui: revert PR (một khối mã + một dòng gọi).

## Chưa kiểm
- Top 30 ứng viên (điều phối đo cloud).
- Trang sống greenpowergen.it.

## Cần ghi nhớ
- Danh sách tường minh, khoá bằng tiêu đề đầu nguyên văn: cào lại đổi tiêu đề thì bảng tự thôi đọc và có note, phải thêm lại tay.
- Nếu sau này `isCode` / bộ đọc thường đọc được bảng nào trong danh sách, `listedEngineRows` tự nhường (không đọc lần hai) — nên xoá mục khỏi danh sách khi đó.

## Vòng 2: gộp main 2ed96b02 (#958 fuelOf + #963 Gợi ý theo nhiên liệu), điều phối 20/11/2026
- SHA `c9276ef2843554d96d94d1350487c2c38902c9e4`. Xung đột `web/catalog.js` (cuối `fromSupplier`): đặt `out.push(...listedEngineRows(...))` TRƯỚC khối nhiên liệu → bản ghi 4 bảng qua cùng `fuelSigns` / `fuelFrom` / `fuelPage`. `web/CLAUDE.md`: giữ cả mục Nhiên liệu, mục Tổ máy (bản main, có #968) và mục Bảng bỏ sót.
- Nhiên liệu MỌI bản ghi 4 bảng (`dau-vao/catalog-c/fuel-x.mjs`):
  - green n126 Scania (3): `gas` / `B` / `bảng ghi "METANO"` (ô dòng "METANO / BIOGAS METHANE / BIOGAS") — tự ra, không cần FUEL_PAGES.
  - lees n133 (16, cả bản -6): `gas` / `T` / `URL ghi "GAS GENERATOR"` (https://www.leespower.com/MTU-GAS-GENERATOR-SET-pd106395538.html) — tự ra.
  - green n115 MTU (16), n117 Kohler (8): không có trường fuel (trang không ghi nhiên liệu ở bảng / URL n115; URL n117 "diesel-benzina" là trang chung diesel + xăng, fuelOf không gán) → không fuel sai.
- build(): engines khi để rỗng 4 bảng = gốc 2ed96b02 `c1903b1c6a777fc2f8199bae128fb04f`; spec-diff `git:2ed96b02 .`: 60.073 → 60.116, 0 đổi / 0 mất / +43, đảo vai 0, tổ máy 1.700 không đổi.
- Test: `bang-bo-sot.test.mjs` 6/6 (thêm fuel n126, lees, n115 không fuel); `suppliers/*.test.mjs` 1.214/0; `web/test/*.test.mjs` 161/0.
- Hệ quả Gợi ý: dòng của n126 / lees (fuel gas) bị `candidates` loại ở gói diesel (`ruled: "fuel"`), như dòng khí khác — rủi ro máy khí lọt vào ứng viên ở vòng 1 hết.

## Top 30 cloud (main 2ed96b02 ↔ c9276ef2, điều phối đo 20/11/2026)
Chạy lại cục bộ: **135 / 140 lượt trùng cloud**, 5 lượt giải thích bằng số cloud (dưới). Tệp: `dau-vao/bang-bo-sot/top30-cloud/` (gop-goc / gop-nhanh / so.txt của điều phối; phân tích của tôi: `an.txt`, `an2.txt`, `fd.txt`, script `ids.mjs`, `do.mjs`, `an.mjs`, `an2.mjs`, `facts.mjs`, `fd.mjs`, `gas.mjs`, `mm2.mjs`, `thu.mjs`). Chạy lại cục bộ 140 lượt khác (gốc + nhánh, ghi `ruled`): 135/140 trùng cloud; 5 lượt máy nhỏ (IB2200052056#0, IB2300133361#0/#1, IB2400457172#0, IB2500416364#0) lệch vì bản chụp chữ HSMT cục bộ khác cloud — giải thích từ chính số cloud (`mm2.mjs`): chỉ thêm dòng green Kohler (KSD1403NA / TC, KDW1003) vào all / top, không khoá NCC khác nào đổi.

### Vì sao khoá NCC khác đổi: facts động cơ (`fd.txt`)
Dòng 4 bảng không đổi số đông dung tích / tần số / công suất của model nào; chỉ THÊM thông số model chưa có: `cyl` cho 12V1600G21F (12), 12V1600G31F (**16**), 12V4000G14RF (12), 16V2000G26F / G36F (16), OC16071A0281/82/83 (8), và `cyl` + `emission` (STAGE V) cho KDW702, KDW1003, KSD1403NA / TC / TCA, KDI1903TCR, KDI2504TCR. Các model MTU khác đã có cyl, chỉ thêm phiếu trùng giá trị.
- Điểm: `score += 8 * min(eKeys.size, 8)` (`config-bot.mjs:1562`, số khoá thông số của động cơ) → +8 mỗi dòng MTU (thêm cyl), +16 mỗi dòng Kohler (cyl + emission). Đây là toàn bộ cặp "rời all / vào all" cùng số lần trong so.txt (voltgent, westinpower ×6 khoá, mecca, agg-fuzhou, xingguang, tellhow 12V4000G14RF; mecca / lees 12V1600G21F / G31F; baifa / pauway 16V2000G26F / G36F; cgm KDW702 / KDW1003; wacker KSD1403NA): 281 lượt-khoá cùng số bản, `why` không đổi, chỉ điểm Δ8 / Δ16 (`an.txt` 1a).
- Rời hẳn all (35 lượt-khoá, `an.txt` 1b + `an2.txt`), mọi khoá đều `ruled: cyl`. Luật xi lanh (`config-bot.mjs:1613`, `1617–1623`: HSMT ghi đúng số → `cylExact`, số khác bị loại; trước đây model chưa có cyl nên không xét):
  | khoá | lượt | HSMT | xi lanh hãng | kết luận |
  |---|---|---|---|---|
  | pauway / baifa 16V2000G26F, G36F | 5+4 / 5+4 (IB2300005377, 2300096122, 2500320544, 2500432527, 2600418114) | đúng 12 | 16 | đúng mong muốn (baifa ở dropped dưới khoá không đầu phát, cùng `cyl`) |
  | lees / mecca 12V1600G21F | IB2400377756 (≥ 16), IB2200018828, IB2300268389 (đúng 6) | 16 / 6 | 12 | đúng mong muốn |
  | mecca / lees **12V1600G31F** | IB2300096122, 2300254479, 2300315082, 2300005377, 2500320544, 2500432527, 2600418114 (đúng 12) | 12 | 12 | **HỒI QUY** (7 lượt-khoá): số đông cyl = 16 chỉ từ dòng green GP1000 A/M |
  | mecca 12V1600G31F | IB2200018828, IB2300268389 (đúng 6) | 6 | 12 | kết quả đúng nhưng do số 16 sai; với `dropspec` thì về như gốc (không có cyl, không xét) |
  | agg-fuzhou OC16071A0282 (S375G5NG, S400G6NG) | IB2400302943 (đúng 6, thẳng hàng) | 6 | 8 (V8) | đúng mong muốn |
  | cgm-italia KDW1003 | IB2200035219 (6 kVA, đúng 1) | 1 | 3 | đúng mong muốn |
  | wacker-neuson KSD1403NA | IB2600588204 (≥ 4) | 4 | 3 | đúng mong muốn |
- Ra top (`an2.txt` b, 49 lượt đổi top; lượt có khoá ra mà không có dòng 4 bảng vào hay khoá tăng điểm: 0): tecnogen 400830TAG3 / QST30G4 / 2806AE18TTAG4, cgm 400830TAG3, visa DC16320A0263, aj-power DC16093A0254, genesal DC13072A, fdk 403A11G1, saudi S12RPTAR1 — điểm không đổi, bị dòng green-power vào top chen; baifa 12V2000G26F (IB2300000242, 2300194512), 16V2000G16F (IB2600350175) — bị mecca 12V1600G21F / G31F +8 chen; suneco D905E2BG (IB2400186078) — bị cgm KDW1003 +16 chen; cgm KDW1003 (IB2200035219), wacker KSD1403NA (IB2600588204) — rời all vì cyl (trên). 
### Số đúng theo tài liệu hãng
- MTU: "12V"/"16V"/"20V" = số xi lanh chữ V; 12V 1600 "Cylinder configuration 12 V" — https://www.mtu-solutions.com/content/dam/mtu/products/oil---gas-onshore/mtu-series-1600/3236610_OG_spec_12V1600.pdf ; 16V 2000 "No. of cylinders 16" — https://www.mtu-solutions.com/content/dam/mtu/products/defense/marine-and-offshore-service-and-supply/main-propulsion/mtu-series-2000/3231701_Marine_spec_12V16V2000M92_1DS.pdf ; Gendrive 12V/16V/18V 2000 Gx6 — https://www.mtu-solutions.com/content/dam/mtu/products/power-generation/powergeneration-product-list-latest/3239201_MTU_Gendrive_spec_12V16V18V2000Gx6_3D_3E_3F_A2A.pdf . → green 12V1600G21F 12, 12V4000G14RF 12, 16V2000G26F/G36F 16: ĐÚNG; **12V1600G31F 16: SAI** (dòng nguồn `| GP1000 A/M | O | 910 | 1005 | 12V 1600 G31F | E | 16 | 139 | …`). 12V2000G26F, 16V2000G16F, 12V1600G21F của NCC khác không đổi số liệu (chỉ bị chen).
- Scania OC16: "No of cylinders 90° V8" — https://www.scania.com/content/dam/scanianoe/market/master/products-and-services/engines/pdf/specs/power-gen1/OC1671A_407-426kW.pdf → 8 đúng.
- Kohler (https://resources.kohler.com/power/kohler/enginesUS/pdf/Diesel_Full_Line.pdf): KDW 702 = 2, KDW 1003 = 3, KSD 1403 (NA/TC/TCA) = 3, KDI 1903 TCR = 3, KDI 2504 TCR = 4 → đúng cả 7.
### Dòng 4 bảng trong ứng viên
- 19 dòng khí (green n126 OC16…, lees LSMU…NGE3): **0** trong all và top ở cả 1.093 lượt (`gas.mjs`); trong 140 lượt chạy lại, dòng 4 bảng bị loại `fuel` 12 lần.
- Dòng green-power (n115 / n117) vào all 116 lượt-dòng (79 lượt), top 66 (42 lượt): dòng diesel MTU / Kohler, công suất đúng cỡ.
### Đề xuất (chưa commit, chờ duyệt)
`ROW_EXCEPTIONS` thêm `{ supplierId: "green-power-generators", n: 115, genset: "GP1000 A/M", line: <dòng nguyên văn trên>, act: "dropspec", keys: ["cyl"] }`. Thử cục bộ (`thu.mjs`, đã hoàn lại tệp): facts 12V1600G31F hết cyl; 9 lượt-khoá mecca / lees 12V1600G31F về đúng điểm gốc; top (bỏ dòng green) giống gốc ở cả 10 lượt có liên quan; dòng green GP1000 A/M chỉ còn bị loại theo prime / fuel75 như mọi dòng khác.

## Vòng 3: sửa hồi quy GP1000 A/M (điều phối duyệt 20/11/2026)
- SHA `49852788` (gộp main e1da9414 #957: hai nhóm mục `ROW_EXCEPTIONS` giữ cả hai, không xung đột). `ROW_EXCEPTIONS` thêm green-power n115 GP1000 A/M `dropspec` `["cyl"]` (dòng nguyên văn `| GP1000 A/M | O | 910 | 1005 | 12V 1600 G31F | E | 16 | 139 | …`), `khoa: "điều phối 20/11/2026"`. **Ứng viên chuyển `fixspec`** (cyl = 12, căn cứ mã "12V" + spec MTU 12V 1600) khi cơ chế `fixspec` (quy tắc mới của Khoa 20/11/2026 "số đúng kiểm được thì sửa có căn cứ", PR khác) vào main.
- Test: `bang-bo-sot.test.mjs` 7/7 (thêm ca GP1000 không cyl, giữ công suất / khối lượng, có note; GP880 vẫn cyl 12); `suppliers/*.test.mjs` 1.260/0; `web/test/*.test.mjs` 161/0; quality `--check` không xấu đi; spec-diff `git:e1da9414 .`: 60.237 → 60.280, 0 đổi / 0 mất / +43, đảo vai 0, ngoại lệ theo dòng 27 → 28, tổ máy 1.700 không đổi. CI xanh.
- Thử cục bộ trước khi commit (`thu.mjs`): 9 lượt-khoá mecca / lees 12V1600G31F về đúng điểm gốc, top 10 lượt liên quan (bỏ dòng green) giống gốc.
- Vòng 3b (gộp main e0b64666: #982, #987…): SHA `ed1e05ac`. Xung đột `web/CLAUDE.md` (hai mục Nhiên liệu / Ngoại lệ đổi thứ tự): lấy bản main, gắn lại câu GP1000. Phần riêng của PR so main (`git diff -U0`, dòng +/-) của `web/catalog.js`, `bang-bo-sot.test.mjs`, `web/CLAUDE.md` có md5 GIỐNG HỆT bản 49852788 so e1da9414. spec-diff `git:origin/main .`: 60.237 → 60.280, 0 đổi / 0 mất / +43, đảo vai 0, tổ máy 1.700 không đổi (y như vòng 3). Test suppliers 1.275/0, web 161/0, quality OK, CI xanh, PR MERGEABLE.

## Đo lần cuối (top30-cloud-2) + gộp main 0d4d99d1
- 3 mục lẻ và 3 nhóm MTU RỜI TRỌN của `top30-cloud-2` (`le.mjs`) đúng các lượt đã giải thích ở mục "Top 30 cloud", đều `ruled: cyl` do #967 đưa số xi lanh (đúng theo hãng) vào facts, KHÔNG do lệch main #982 / #987: agg-fuzhou OC16071A0282 S375G5NG / S400G6NG — IB2400302943#0 (HSMT đúng 6 xi lanh thẳng hàng; OC16 là V8, green n126); cgm-italia KDW1003 — IB2200035219#0 (6 kVA, HSMT đúng 1; KDW1003 3 xi lanh, green n117); wacker-neuson KSD1403NA — IB2600588204#0 (HSMT ≥ 4; KSD1403 3, green n117). 16V2000G26F 5 lượt / G36F 4 lượt (baifa + pauway, HSMT đúng 12, động cơ 16) và 12V1600G21F (lees IB2200018828 / IB2400377756, mecca IB2300268389 / IB2400377756; HSMT 6 / ≥ 16, động cơ 12) khớp vòng trước.
- SHA `81b19945` (gộp main 0d4d99d1: #954, #969, #973, #986). Xung đột `web/CLAUDE.md`: lấy khối của main, đặt lại mục "Bảng bỏ sót" (md5 dòng y ed1e05ac) sau mục "Mã đầu phát riêng", gắn lại câu GP1000 vào mục Ngoại lệ. Phần riêng so main: `web/catalog.js`, `bang-bo-sot.test.mjs` md5 diff giống hệt ed1e05ac; `web/CLAUDE.md` chữ thêm vào giống từng ký tự (`wd.mjs`; md5 diff khác chỉ vì dòng Ngoại lệ của main dài thêm). spec-diff `git:origin/main .`: 60.710 → 60.753, 0 đổi / 0 mất / +43, đảo vai 0, tổ máy 1.700 không đổi. Test suppliers 1.307/0, web 161/0, quality OK, CI xanh, MERGEABLE.
