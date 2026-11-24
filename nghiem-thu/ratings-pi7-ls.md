# ratings-pi7-ls — PR 1: Stamford PI7 / LVSI804 (24/11/2026)

PR nháp: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1164 (nhánh `ratings-pi7`, worktree `wt-ratings-pi7`). Chỉ sửa `suppliers/ratings.mjs`, thêm `suppliers/ratings-pi7.test.mjs`, một dòng bẫy ở `suppliers/CLAUDE.md`.

## Nguyên nhân
- Nguyên nhân thật không phải "Winding 13 / 0.8 Power | Factor" xuống dòng: tờ viết tần số ở Ô ĐẦU dòng điện áp ("| 50Hz | Star (V) | 380 | 400 …"), `ST_VOLTS` chỉ nhận "Series Star (V)" hoặc "| Star (V)" đứng đầu → không thấy dòng điện áp → 0 dòng. Hàng kVA không lệch cột (12 / 16 số khớp số cột).
- Model: tiêu đề "| PI734F - Technical Data Sheet | Winding 07" và "| LV 804 S | WDG 12 - Technical Data Sheet" không khớp mẫu "- Winding NNN" nên model rơi về "|".

## Sửa
- `ST_VOLTS` nhận thêm "| 50Hz | Star (V)"; tần số đọc từ ô đó (`ST_HZ_OWN`), chỉ khi các cách cũ không ra.
- `modelAt`: khi không có "- Winding / Wdg." thì lấy ô trước "- Technical Data Sheet" / "| WDG N" ("LV 804 S" → `LV804S`).
- Không nội suy, không quy đổi kW ↔ kVA; khối số ô ≠ số cột vẫn bị bỏ như cũ.

## Kiểm
- `dump-ratings.mjs` + `so-dump.mjs` gốc (origin/main) ↔ nhánh trên 3034 tệp: giữ y 17.643, mất / đổi 0, mới 272, chỉ ở: stamford-avk-china 1060 (32), 1061 (12), 1062 (32), 1063 (32), 1064 (4), 1065–1068 (32 × 4), và wintpower/1015 WT734C (32; cùng mẫu, tờ ngoài danh sách nhắm tới nhưng cùng bố cục — nên giữ).
- Test mới: lấy dòng từ tệp nguồn thật, kiểm mọi dòng `lines` có trong nguồn, số kVA / kW có trong dòng, kW ≈ 0,8 kVA (≤ 0,5 %), thứ tự F ≤ H ≤ Standby 150 ≤ Standby 163 theo từng (Hz, V), vài ô tay (PI734C 50 Hz 400 V H 1550 / 1240 / 95,4; PI734F 60 Hz 600 V; LV804S 60 Hz 480 V standby 3585).
- `node --test suppliers/*.test.mjs`: 1654 / 1654 đạt (cả `ls-ratings`, `dau-phat-hang`, `dau-phat-hang-d`, `ratings`, `regress-config`; fixture không đổi).

## Đo
- Model đầu phát có dòng định mức (`ratingsOf` trên mọi tệp nguồn): 350 → 355 (thêm LV804S / R / T / W, WT734C; PI734B–F đã có model từ tờ khác, nay thêm dòng); dòng định mức đầu phát 14.193 → 14.465.
- `spec-standard.mjs --stats`, trường `ratings` của đầu phát: model 235 → 235; số giá trị 9.585 → 9.697 (+112). LV804x chưa có trong bản chuẩn (không NCC nào ghi theo khoá đó).

## Có đụng `candidates` không?
Không. `candidates` (config-bot.mjs ~dòng 1826) không gọi `sourceRatings` / `ratingsOf`; chỉ `check` (dòng ~2978 → `RT`) và `makerAlts` (dòng ~4761) dùng. Hệ quả ở `check`: `makerAlts` đọc tờ 1001–1999 của stamford-avk-china nên PI734B–F và LV804x giờ thành đầu phát "theo datasheet hãng" khi HSMT cần cỡ ≥ khoảng 1.400 kVA; `sourceRatings` cũng gắn `altSheetAttrs` cho các tờ một model này (insulation, v.v.). `web/catalog.js` không đổi.

## Còn mở
- Tên NCC "LVSI804R / LVSI 804S" ↔ tên tờ "LV804R": chưa kiểm `CAT.keyOf` có gộp hai tên không. Nếu không, `ratingsFor` không nối được; cần thêm cặp trong `SAME_SHEET` (config-bot.mjs, ngoài phạm vi PR này; cần tài liệu hãng gọi một tờ bằng hai tên).
- CI của PR #1164: xem trạng thái ở PR.
