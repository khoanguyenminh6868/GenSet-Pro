# Nghiệm thu doosan-hau-to-1

- PR (draft, chưa merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1012 — nhánh `doosan-hau-to`, đầu nhánh `c09662b3`, từ `origin/main` 97cce88c (brief ghi 780a278a trở lên).
- Tệp đổi: `web/catalog.js`, `web/CLAUDE.md`, `suppliers/catalog-doosan-p.test.mjs` (+1 ca), `suppliers/dropspec-2.test.mjs` (2 ca đổi kỳ vọng dropspec → fixspec).

## Phần 1 — hậu tố Doosan P

Cách làm: `keyOf` (khoá động cơ) thêm `DOOSAN_II = /^(P\d{3}(?:TI|LE))(?:11|IL)$/` → `$1II`, chạy SAU phần chuẩn hoá cũ (NFKC, bỏ dấu cách / gạch). Chỉ mã P###TI / P###LE.

Quét TOÀN BỘ `suppliers/cn` (435 tệp, 293 dòng NCC × biến thể, `grep -oE "P[0-9]{3}(TI|LE)[^|…]{0,12}"`). Mọi biến thể hậu tố và xử lý:

| Viết trong nguồn | Khoá cũ | Khoá mới | Ghi chú |
|---|---|---|---|
| P126TI-11 (aoke n130, jiangchai-xuzhou n101, zhengchi n133) | P126TI11 | P126TIII | GỘP vào -II |
| P222LE-11 (kaihua n103, n126) | P222LE11 | P222LEII | GỘP |
| P126TI-Il (jianghao n106) | P126TIIL | P126TIII | GỘP |
| P158LE-Ⅰ (victory, xingguang "-I") | P158LEI | P158LEI | ĐÃ gộp sẵn nhờ NFKC, không đổi |
| P126TI- Ⅱ (xingguang), P126TI II (green-power, saudi, "P126TI-II / P126TI") | P126TIII | P126TIII | đã gộp sẵn |
| P222LE-2, P126TI-2 (huatai n108) | P222LE2, P126TI2 | giữ | KHÔNG gộp, theo brief |
| P086TI-I (aosif, genlitec, xingguang) | P086TII | giữ | chỉ "-I" thật, không đụng |
| -1, -S, -S-II, trơ, P180LE, P034TI, "(E)", " PRP", " HCI444D…", "/149KW" | | giữ | không thuộc danh sách |
| **P126TI-** (kachai-hangzhou, hậu tố cụt) | P126TI | giữ | NGOÀI danh sách, không gộp — xin hỏi: có coi là P126TI không? (đang trùng khoá P126TI sẵn) |

Brief nêu "P158LEI (victory n106, xingguang n107)" và "-Ⅰ → -I": đã gộp sẵn từ trước PR này (NFKC), không cần sửa gì.

Đo `build()` gốc ↔ nhánh (`scratchpad\bld.mjs`, so khoá + chữ ký mọi động cơ):
- engines 6.562 → 6.559; alternators 2.710 → 2.710, controllers 187 → 187, md5 (alternators + controllers) y hệt.
- MẤT khoá: P126TI11 (3 NCC, 3 dòng), P222LE11 (1 NCC, 3 dòng), P126TIIL (1 NCC, 1 dòng); THÊM khoá: không.
- P126TIII: NCC thêm aoke, jiangchai-xuzhou, zhengchi, jianghao…; uses 53, tên gồm "P126TI-II ; P126TI-11 ; P126TI II ; P126TI-Il ; P126TI- Ⅱ". P222LEII: 5 → 6 NCC, uses 5 → 8 (thêm kaihua).
- Doosan còn 19 khoá, mọi biến thể -1 / -2 / -S / -I vẫn riêng.

## Phần 2 — dropspec → fixspec dung tích

Điều kiện (a) bore × stroke × xi lanh của chính dòng ≤ 2 % VÀ (b) tài liệu hãng hoặc ≥ 2 NCC khác cùng số:

| Dòng | Động cơ | (a) | (b) | Kết quả |
|---|---|---|---|---|
| jlmech n103 JL-1000GF | 4012-46TWG2A | 160×190×12 = 45.84 L (lệch 0,1 %) | 21 NCC khác ghi 45.8 / 45.84 / 45.842 (agestar, aoke, depco, hanyang, legapower, weiman, bdadl, liangzi, pengpai, frs, fukangsi, huipu, jianghao, jinjia, mingbang, wintpower, yunding, fdk, gb-power, westinpower…) | 458 → 45.8 |
| huipu n105 HP-P1330 | 4012-46TAG2A | như trên | 21 NCC khác, cùng bộ số | 458 → 45.8 |
| huipu n106 HP-V280 | TAD1341GE | 131×158×6 = 12.78 L | Volvo Penta bulletin TAD1341GE-B: "Displacement, l 12.78" (`suppliers/sources/volvo-penta/1010.md:76`); lees 12.78 | 1278 → 12.78 |
| huipu n106 HP-V400 | TAD1345GE | 131×158×6 = 12.78 L | Volvo bulletin TAD1344/1345GE (`1011.md:71`) 12.78; aoke, bdadl, fukangsi, lees, pengpai 12.78 | 1278 → 12.78 |

Cả 4 đều đạt → không dòng nào giữ dropspec. Lưu ý: số lượng NCC đếm bằng `disp.mjs` trên bản ghi `fromSupplier`; datasheet Perkins 4012-46 KHÔNG có dung tích trong `sources/perkins` (chỉ bảng công suất), nên căn cứ (b) của 2 dòng Perkins là số đông NCC, không phải tài liệu hãng.

## Lệnh kiểm + đầu ra thật
- `node --test suppliers/*.test.mjs bot/test/*.test.mjs` → tests 1485, pass 1485, fail 0. `node --test web/test/*.test.mjs` → 161 / 161.
- `node suppliers/spec-diff.mjs git:origin/main .`: bản ghi cũ 61.041, mới 61.041; khác 4; chỉ cũ 0, chỉ mới 0; `{"disp thêm":4}`; tự kiểm: 4 "mới tự xác nhận", cần soát tay 0; đảo vai 0 → 0; "tổ máy" 0 đổi. Bốn bản ghi: huipu n105 HP-P1330 ∅→45.8; huipu n106 HP-V280, HP-V400 ∅→12.78; jlmech n103 JL-1000GF ∅→45.8 (đều là dropspec cũ → số sửa, không bản ghi nào khác đổi; giải thích mỗi cái ở bảng trên).
- `build()` thêm 4 động cơ đổi thông số disp (không khoá nào thêm / mất): 4012-46TWG2A (45.8: 9 → 10 NCC, +jlmech), 4012-46TAG2A (45.8: +huipu), TAD1341GE (12.78: 1 → 2 NCC, +huipu), TAD1345GE (12.78: 5 → 6 NCC +huipu; **có thêm giá trị thắng `win` = 12.78**, trước là chưa có win vì 12.78 ×5 chưa gấp ≥ 3 lần 16.12 ×2 — nay 6 so 2 thì thắng). Đây là hệ quả ngoài dòng huipu: `candidates` sẽ loại dòng TAD1345GE ghi dung tích khác 12.78 (huatai, liangzi ghi 16.12).
- `node suppliers/quality.mjs --check`: "không chỉ số nào xấu đi quá ngưỡng".
- Số đo trước / sau: ĐO (build + spec-diff), không ước tính. Top 30 KHÔNG đo (điều phối giao cloud).

## 3 mẫu đối chiếu nguồn
1. JL-1000GF: `suppliers/sources/agestar/111.md:117` "GP1375(S) … 4012-46TWG2A | 265 | 45.842".
2. HP-V280: `suppliers/sources/volvo-penta/1010.md:76` "Displacement, l (in³) … 12.78 (780)" (TAD1341GE-B).
3. HP-V400: `suppliers/sources/volvo-penta/1011.md:71` "Displacement, l (in³) … 12.78 (780)" (TAD1344GE / TAD1345GE).

## Rủi ro còn lại + quay lui
- TAD1345GE có `win` mới → có thể đổi top 30 (loại dòng huatai / liangzi 16.12): cần đo cloud trước khi merge nếu muốn biết.
- Gộp `-11`/`-Il` cho động cơ Doosan là theo nhận định của Khoa; nếu sai thì xoá hằng `DOOSAN_II`. Quay lui: `git revert` squash commit.
- Hai dòng Perkins dựa số đông NCC (không có datasheet Perkins lưu trong repo).

## Chưa kiểm được
- Top 30 ứng viên (không giao). CI GitHub PR #1012: web, server, suppliers, spec-diff đều pass.
- P126TI- (kachai-hangzhou, hậu tố cụt): chờ quyết.

## Cần ghi nhớ
- Hỏi Khoa: kachai-hangzhou "P126TI-" có coi là P126TI không (đang đã trùng khoá P126TI).
- Quy tắc mới (đã ghi web/CLAUDE.md): `keyOf` gộp Doosan -11/-Il → -II; JL-1000GF, HP-P1330, HP-V280/V400 là fixspec.
