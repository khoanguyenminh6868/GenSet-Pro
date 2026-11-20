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
