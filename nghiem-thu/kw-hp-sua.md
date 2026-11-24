# kw-hp-sua: sửa cách đọc 15 ô công suất động cơ dưới nhãn kW/HP

Phiên con, worktree `wt-kw-hp-sua` từ `origin/main` 33523a27. Theo quyết định Khoa 24/11/2026 ("làm như em đề xuất"). `suppliers/cn/` KHÔNG sửa; `suppliers/spec-standard.mjs`, `spec-value-check*`, `spec-value-rules*` không đụng.

## Thay đổi
1. `web/catalog.js`: act mới `unitspec` trong `ROW_EXCEPTIONS` (khớp NCC + n + tổ máy + chữ dòng NGUYÊN VĂN + `from` = chữ ô). Danh sách tường minh 5 ô, ettes-power:
   - n143 ET-3750 (20V4000G63) `3311`; ET-3250 và ET-3438 (20V4000G63L) `2590`; ET-4000 (20V4000G63L) `3311`;
   - n145 EC-450M6 (K19-DM) `507/580`.
   Spec mang `unitMissing`; mỗi lần khớp ghi note "ngoại lệ theo dòng" (unread-tables: 99 → 104).
2. `web/spec-norm.js` `engPower`: (a) spec `unitMissing` → không đơn vị (`unit: null`, `missing: unit`; một số → `num`, cặp 507/580 → `options` [507, 580], không còn `cond.hp`); (b) nhãn có "kw/hp/rpm" + ô "a/b/c" với b/a trong 1,30–1,37 → a = kW, b = HP (`cond.hp`), c = v/p; ngoài tỉ số vẫn `ambiguous`.
3. `suppliers/config-bot.mjs`: `normFig` và nơi dựng fact `engPower` chuyển cờ `unitMissing` (bản dựng `{key,label,value}` làm mất cờ → đọc lại thành kW).
4. Test `suppliers/kw-hp-sua.test.mjs` (dòng thật), ghi chú ở `web/CLAUDE.md`.

KHÔNG có luật chung "nhãn kW/Hp một số": 44 ô một số còn lại của ettes-power giữ kW (test khẳng định đúng 5 spec có cờ).

## Kiểm chéo toàn bộ (`spec-diff` gốc cố định 33523a27 ↔ nhánh, 62.160 bản ghi)
- bản ghi cũ 62.160, mới 62.160; khác 0; chỉ cũ 0; chỉ mới 0; đảo vai 0 → 0; tự kiểm cần soát tay 0; tổ máy (`gensetsOf`) 0 đổi.
- Lớp chuẩn hoá: ĐÚNG 15 thông số đổi, 0 thông số khác (bản đầy đủ: scratchpad `out\full.txt`, `sum.md`). Chữ thô `spec-diff` báo "khác 0" vì cờ `unitMissing` không nằm trong chữ khoá / nhãn / giá trị; 5 ô thấy được ở phần chuẩn hoá.

| NCC / bảng / dòng | ô | trước | sau |
|---|---|---|---|
| ettes-power n143 b44 d24 ET-3250 | 2590 | 2590 kW, missing speed | 2590, missing unit, speed |
| ettes-power n143 b45 d13 ET-3438 | 2590 | 2590 kW | 2590, missing unit, speed |
| ettes-power n143 b45 d14 ET-3750 | 3311 | 3311 kW | 3311, missing unit, speed |
| ettes-power n143 b45 d15 ET-4000 | 3311 | 3311 kW | 3311, missing unit, speed |
| ettes-power n145 b49 d12 EC-450M6 | 507/580 | 507 kW | (không số), options 507 / 580, missing unit, speed |
| ricardo n101 K4100ZD | 41/56/1500 | ambiguous, speed | 41 kW (HP 56, 1500 v/p) |
| ricardo n102 K4100D | 30.1/40/1500 | idem | 30.1 kW |
| ricardo n104 495D | 26.5/36/1500 | idem | 26.5 kW |
| ricardo n105 490D | 21/28.5/1500 | idem | 21 kW |
| ricardo n106 2110D | 18/24/1500 | idem | 18 kW |
| ricardo n107 2100D | 15/20/1500 | idem | 15 kW |
| ricardo n108 295D | 13.5/18.4/1500 | idem | 13.5 kW |
| ricardo n109 K4102D | 33/44/1500 | idem | 33 kW |
| ricardo n110 K4102ZD | 44/59/1500 | idem | 44 kW |
| ricardo n111 ZH4105ZLD | 55/75/1500 | idem | 55 kW |

Cả 10 dòng ricardo có b/a = 1,329–1,366 (trong 1,30–1,37) nên đều đọc được. Dòng ricardo n103 495ZD (nhãn "kw/rpm", 36/49/1500) KHÔNG nằm trong 10 dòng của soát, nhãn không nêu HP → giữ `ambiguous` (test).

## Chứng minh 5 số không vào chỗ dùng làm công suất động cơ (test `kw-hp-sua.test.mjs`, dòng thật)
- `normFig` (config-bot): `ok = false`, `why` có "unit".
- `enginePowerOf(row)` = null; `ratedFacts(label, value)` = []. (Cả trước sửa cũng null vì nhãn "Max Power" không nêu prime / standby; nay còn bị chặn thêm một lớp ở `normFig`.)
- Bản chuẩn `standardOf([ettes-power])`, trường `power_kwm`: không mục nào có `unit: "kW"` với 3311 / 2590 / 507; các mục 3311 và 2590 còn trong bản chuẩn với `unit: null`, `missing: ["unit", "speed"]`. LƯU Ý: đúng như mọi số không đơn vị khác ở bản chuẩn, chúng vẫn nằm trong `power_kwm` kèm cờ thiếu đơn vị; `moveEnginePower` (spec-standard.mjs, không được sửa) xếp mục không đơn vị vào cột `kwm` của bảng. Người đọc bản chuẩn phải xem `missing`. Cặp 507/580 là `options`, không có `kwm` số. Nếu Khoa muốn loại hẳn khỏi `power_kwm` thì cần sửa `moveEnginePower` (phiên khác đang sửa tệp này).
- 10 dòng ricardo: `enginePowerOf` vẫn null (nhãn "Rated", không nêu prime / standby) → Gợi ý không đổi.

## Đo ứng viên top 30
Chưa chạy `do-gop` trên cloud. Căn cứ không đổi: (1) `candidates` đọc công suất động cơ qua `enginePowerOf`, nó null cả trước lẫn sau cho 15 dòng; (2) `suppliers/fixtures` / `fixtures/runs` không có model nào của 15 dòng (20V4000G63, 20V4000G63L, K19-DM, K4100D, K4100ZD, K4102D, K4102ZD, 495D, 490D, 2110D, 2100D, 295D, ZH4105ZLD; các trận khớp là mã khác như "Y495D", "495D 6" hay JJM của NCC khác); `regress-config` đạt. Số dòng ứng viên bị ảnh hưởng = 0 theo hai căn cứ này; chưa đo thực nghiệm bằng `do-gop.mjs`.

## Kiểm tra
- `node --test suppliers/*.test.mjs`: 1630 / 1630 đạt (kể cả test mới, đã đạt thêm sau khi bổ sung ca ricardo).
- `node --test web/test/*.test.mjs suppliers/kw-hp-sua.test.mjs`: 176 / 176 đạt.
- `node suppliers/quality.mjs --check`: không chỉ số nào xấu đi (không đổi baseline).
- Chưa chạy: Playwright (`web/test`, không đổi giao diện), CI sẽ chạy trên PR.
