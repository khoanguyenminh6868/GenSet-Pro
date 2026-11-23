# Đưa ba PR draft lên main mới + khoá động cơ rác (24/11/2026)

Phiên con của `session_011tAj4Mp31GbgmLRtLgBxSA`. Không tự merge, không đo 1.093 lượt top 30.

## 1. #1108 `fix/alt-brand-confirm` — gộp origin/main
- Xung đột duy nhất ở câu `return` cuối hàm dựng bản ghi NCC trong `web/catalog.js`; gỡ đúng câu điều phối giao: `return altMakeAsk(mergeRepeats(splitEngineCells(s, namedPower(s, tableDrops(s, rowExceptions(s, columnSpecs(s, out, note), note), note), note), note)));`
- Test `suppliers/*.test.mjs` 1595 / 1595. SHA đầu: `b22fabf6`. Đã đẩy. Worktree `wt-alt-brand` sạch.

## 2. #1109 `fix/to-hang-nhom-b` — gộp origin/main
- Gộp sạch, không xung đột. Test 1594 / 1594. SHA đầu: `5fedd4d3`. Đã đẩy. Worktree `wt-luu-bo-nho`.

## 3. #1105 `fix/crawl-dropped-rows` — gộp origin/main, đổi base sang main
- Xung đột `suppliers/crawl-specs.mjs` + `suppliers/CLAUDE.md`: #1105 đã chứa phần `headerEnd` của #1101 (tách `tableOf`), nên giữ bản #1105 cho các hunk xung đột (`git merge-file --ours`), các hunk không xung đột của main vẫn vào. Không rebase / force-push (#1110, #1111 dựng chồng không gãy).
- Test `crawl-dropped.test.mjs:93` đỏ 562 → 566. NGUYÊN NHÂN: #1087 (`ENGINE_CELL_LIST`, ma-dong-co-trung PR 2) tách bốn ô động cơ ghi hai mã của awt-aiweite thành mỗi mã một bản ghi: AWT-P175 "1206J-E70TTAG3/4", AWT-P350 "2206C-E13TAG2/3", AWT-P450 "2506C-E15TAG1/2", AWT-P710 "2806A-E18TTAG4/5" → +4 bản ghi động cơ, 0 mất, 0 đổi khác. Đo: gốc a95b8ab5 = 562, nay = 566, so từng bản ghi (kind | genset | model). Không liên quan #1101 / #1073. Sửa SỐ KỲ VỌNG trong test (566) kèm chú thích lý do; mã không đổi.
- Test 1597 / 1597. SHA đầu: `28615f52`. `gh pr edit 1105 --base main` xong. Worktree `wt-crawl-dropped`.

## 4. PR draft mới `fix/engine-key-junk` (worktree `wt-scania-time`)
- GỐC: baifa n101 bảng SCANIA có dòng "| BF-SC440-V | 440 | 400 | SCANIA | DC13 505A 400KVA | ECU | S4L1D-F41 | 51.1 | STAGE V | SWEDEN | 4 months |". Ô động cơ "DC13 505A 400KVA" (3 dấu cách) không qua `isCode` (`SCANIA_CODE` chỉ nhận dạng bốn cụm "DC13 320A 02-61"), nên ô đầu tiên qua `isCode` là "4 months" (cột thời gian giao hàng) và thành động cơ, khoá "4MONTHS". Cột đúng là cột "DC13 505A 400KVA".
- SỬA (web/catalog.js): `SCANIA_CODE` nhận thêm đuôi "NNNKVA"; `ENGINE_TRIM` bỏ đuôi kVA (model = "DC13 505A", vào cùng khoá với scania-engines / voltgent); `isCode` loại ô thời gian / áp suất / khối lượng / bánh xe, công suất ghi như mã, "Tire 2" / "Tier 3", "…Standard", "Combustion 3" / "Efficiency 2" / "mechanical 1".
- QUÉT TOÀN BỘ hồ sơ (`cn/`, 62.183 bản ghi, mọi model động cơ + đầu phát): khoá rác thấy được:
  | Model | NCC | Bản ghi |
  |---|---|---|
  | 4 months | baifa-power | 3 |
  | 7 Days | tecgen-fujian | 1 |
  | 1500 Hours (đầu phát) | tecgen-fujian | 1 |
  | 4 Wheels | cameo-power | 1 |
  | 22 bar, 25 bar | wartsila | 2 |
  | 6,500 lbs | byc-power | 1 |
  | 30kKVA, 38kKVA, 40kKVA, 42kKVA, 50kKVA, 60kKVA | elitech-power | 7 |
  | 18KW22.5KVA, 22KW27.5KVA | victory-generator | 2 |
  | Tire 2 (19), Tire3 (17) | yingtai-jiangsu | 36 |
  | IEC 60034 Standard (đầu phát) | camda-generator | 2 |
  | Combustion 3, Efficiency 2, mechanical 1 | man-engines | 3 |
- KẾT QUẢ so từng bản ghi (NCC, n, vai, tổ máy, model, dòng, hãng, công suất, tần số) gốc origin/main ↔ nhánh: 59 bản ghi mất (đúng 59 ô rác ở bảng trên), 12 bản ghi thay bằng mã thật (baifa 3 "DC13 505A"; elitech 7 + victory 2 đọc ra đúng mã Isuzu JE493… ở ô kế bên), 0 bản ghi khác đổi. Đã xem đủ 59 + 12 dòng.
- KHÔNG ĐỔI, chưa rõ nên không đụng: số trơ "195 / 1100 / 4100…" (zhengdian, `BARE_ENGINE_CELLS`, Khoa chốt); "388VA / 358VA / 413VA" (yanan-power, ô "YN388C | 388VA | 310kW": chưa rõ là mã hay công suất).
- yingtai "Tire 2" / "Tire3": 36 dòng mất bản ghi động cơ (ô là cột khí thải); động cơ Volvo D11… của các dòng đó vốn là TÊN tổ máy, không có ô mã động cơ riêng → không dựng bản ghi.
- Test mới `suppliers/engine-key-junk.test.mjs` (3 ca: quét cả `cn/`, baifa DC13 505A, mã thật vẫn nhận). Việc còn lại: xem thân PR / SHA ở tin nhắn cuối.
