# thu-tu-hang: thứ tự ổn định giữa dòng cùng điểm + Doosan / Hyundai một nhóm hãng (PR draft từ origin/main 95ecba26)

**Kết luận: xong cả hai, test 1.495 / 1.495 đạt ở commit 1 (xem "Kiểm" cho commit 2); KHÔNG đo top 30 (đúng brief). Điểm không đổi ở mọi dòng; top 30 chỉ đổi (a) thứ tự giữa các dòng cùng điểm, (b) chỗ cắt ở hạng 30 khi có hoà, (c) lượt có Doosan / Hyundai dưới trần mỗi hãng hoặc `MAKE_ROWS`.**

PR: (điền sau khi mở). Nhánh `thu-tu-hang`, worktree `wt-thu-tu-hang`, merge-base = origin/main 95ecba26 (#1012). Hai commit riêng.

## Tệp đổi
- `suppliers/config-bot.mjs` (commit 1: `cmpStr`, `gap` dời lên trước lần sắp xếp, `rowOrder`; commit 2: `makeGroup`, hai chỗ dùng).
- `suppliers/cand-tie-order.test.mjs` (commit 1), `suppliers/cand-make-group.test.mjs` (commit 2).
- Không đụng `web/catalog.js`, không đụng `genbid-hsmt\`.

## (1) Thứ tự ổn định giữa ứng viên cùng điểm
**Nguyên nhân (đọc code, chưa tái hiện trên dữ liệu thật của #1012):** `candidates` xếp `rows.sort((x, y) => y.score - x.score)` (config-bot.mjs, trước dòng `perEngine`) và cuối hàm `out.sort(...)` cùng kiểu. `Array.prototype.sort` ổn định, nên hai dòng cùng điểm giữ nguyên thứ tự lúc đẩy vào `rows`, tức thứ tự duyệt `cat.engines` rồi `e.uses`, do `web/catalog.js` quyết (Map theo thứ tự gặp NCC / bảng). Đổi MỘT khoá động cơ không liên quan (gộp P126TI-11 vào -II ở #1012, thêm NCC, gộp dòng) làm đổi thứ tự duyệt → hai dòng hoà điểm đổi chỗ. Hơn nữa `pick` lấy theo thứ tự `rows` dưới trần mỗi hãng / NCC / động cơ, nên ở biên hạng 30 thì không chỉ thứ tự mà cả TẬP 30 dòng đổi theo thứ tự duyệt. Cặp ví dụ (stone-power NTA855G2 ↔ rise-power P126TIII, 269 điểm): phù hợp mô tả, em CHƯA chạy lại để xác nhận từng cặp.

**Sửa:** khoá phụ tất định, điểm không đổi: `điểm giảm → gap → choiceKey → chữ ô khác`.
- `gap(r)` (có sẵn, bước 5 % trên cỡ HSMT): dòng gần cỡ HSMT trước. Chọn vì cùng là tiêu chí mà `sync` / `MAKE_ROWS` đã dùng để chọn trong nhóm hãng, nên hai nơi nhất quán. Thực tế điểm đã có phần thưởng cỡ máy nên `gap` hiếm khi hoà (thử với 790 vs 750 kVA: điểm đã khác); khoá này gần như không đổi gì, chỉ giữ cho nhất quán.
- `choiceKey(r)` = `supplierId \n khoá động cơ \n khoá đầu phát` (có sẵn, đã là danh tính dòng của `seen`): so theo thứ tự đơn vị mã (`cmpStr`, không `localeCompare` để mọi máy như nhau). Chọn khoá này thay vì "tên NCC" đơn thuần vì cùng NCC có thể có hai dòng cùng điểm (hai động cơ), cần khoá thứ hai.
- `String(u.other)` là khoá cuối cho hai dòng trùng cả `choiceKey` (hiếm; `seen` sẽ loại một dòng, nên cần biết dòng nào trước).
- Đã áp ở cả hai lần sắp xếp (`rows` và `out`).
Cùng tập dòng thì cùng thứ tự bất kể thứ tự duyệt (test: đảo thứ tự NCC ba kiểu, thứ tự `top` y hệt; test CHẾT trên origin/main: "not ok").

**Kỳ vọng top 30 cho điều phối đối chiếu:**
- Mọi `score` giữ nguyên từng dòng (không đụng chỗ tính điểm).
- Dòng hoà điểm đổi chỗ so với #1012: thứ tự cuối cùng là NCC theo chữ cái (a < z), khoá động cơ theo chữ cái. Đổi chỗ chỉ giữa các dòng cùng điểm.
- Ở biên hạng 30: nếu có ≥ 2 dòng hoà điểm vắt qua hạng 30 và trần mỗi hãng / NCC / động cơ chặn, dòng được giữ nay là dòng có (gap nhỏ hơn, NCC đứng đầu bảng chữ cái); tập 30 có thể đổi 1–2 dòng ở những lượt đó. Số lượt đổi: KHÔNG đo, không ước tính.
- Cặp 269 điểm IB2400371783#0 / IB2500597081#1: kỳ vọng `rise-power` (r) đứng TRƯỚC `stone-power` (s) nếu cùng `gap`. Điều phối đối chiếu ở lần đo kế tiếp; từ nay thứ tự này không đổi khi thay khoá động cơ khác.

## (2) Doosan / Hyundai một nhóm hãng
**Kiểm quy tắc Khoa (bộ nhớ `config-suggest.md`) trước khi sửa:** không mâu thuẫn. Quy tắc 16/11/2026: "cặp cùng hãng giữ cả hai" (Doosan / Hyundai / Daewoo ở `SAME_MAKER`, chuỗi `e.make` giữ cả hai tên), và 19/11 Khoa bảo bỏ "đổi thứ tự / trần CN_ROWS ↔ PER_SUPPLIER": em KHÔNG đụng thứ tự hay trần, chỉ chuẩn hoá NHÃN nhóm khi đếm. Khoa chưa nói gì về việc nhóm theo hãng đầu của chuỗi.

**Sửa (hẹp):** `makeGroup(m) = m === "Hyundai" ? "Doosan" : m`, dùng ở `makeOf` (trần mỗi hãng `perMake`) và ở `byMake` của vòng `MAKE_ROWS` (nhóm G7 / G20). `e.make`, điểm (`makeNamed` +300), xuất xứ, `keptMakes` KHÔNG đổi.
- Chỉ Doosan + Hyundai (đúng brief). **Daewoo CHƯA gộp** dù `SAME_MAKER` coi cùng hãng: bốn động cơ P180LES / P034TI / P126TI2 / P222LE2 / P222LESII ghi "Daewoo", gộp thêm sẽ đổi nhiều nhóm hơn; cần điều phối / Khoa quyết (đề xuất: gộp, một dòng đổi `makeGroup`).
- Hãng đứng ĐẦU chuỗi là hãng dùng (như cũ): "Daewoo / Doosan" vẫn ở nhóm Daewoo.

**Kỳ vọng:** các động cơ P126TI ("Doosan / Hyundai" nay), P086TII ("Hyundai / Doosan"), P222LE11 ("Hyundai") chuyển sang nhóm "Doosan" cùng P158LE, P222LE…; trần mỗi hãng đếm chung một nhóm → ở lượt không nêu hãng và dưới `MAKE_CAP`, số dòng Doosan / Hyundai trong top 30 giảm (không tăng); ở lượt G7 / G20 không nêu hãng, một nhóm "Doosan" thay vì "Doosan" + "Hyundai" nên chỗ `MAKE_ROWS` dành cho "Hyundai" biến mất, chuyển cho hãng khác. Lượt nêu hãng / model động cơ (`capOn` tắt, `byMake` tắt) KHÔNG đổi.

## Kiểm
- `node --test suppliers/cand-tie-order.test.mjs suppliers/cand-make-group.test.mjs`: 3 / 3 đạt. Trên origin/main: `cand-tie-order` test 1 "not ok", `cand-make-group` "not ok" (đã chạy trước khi sửa để xác nhận test bắt được lỗi).
- Commit 1: `node --test web/test/*.test.mjs suppliers/*.test.mjs`: tests 1495, pass 1495, fail 0.
- Commit 2 + toàn bộ: xem dòng dưới (điền khi chạy xong).
- CI: xem PR.

## Mẫu đối chiếu (3) và số đo
Không áp dụng chỉ số đo: brief bảo KHÔNG tự đo top 30; không có số trước / sau. Ba mẫu kiểm bằng test fixture (dữ liệu giả có `country: "CN"`), không phải nguồn NCC: (a) ba NCC cùng dòng QSK23-G2 hoà điểm, đảo thứ tự danh sách 3 kiểu → thứ tự `alpha, mid, zeta`; (b) trần 1 mỗi hãng, `max 2`, ba NCC (P222LE ghi Hyundai, P158LE ghi Doosan, QSK23-G2 ghi Cummins) → top gồm đúng MỘT dòng Doosan / Hyundai + Cummins; (c) top luôn điểm giảm dần.

## Rủi ro và quay lui
- Thứ tự mới nghiêng về NCC có tên đứng đầu bảng chữ cái khi hoà biên: rủi ro nhỏ, đã nêu. Quay lui: revert PR (hai commit độc lập, có thể revert riêng).
- Chuẩn hoá nhóm Doosan làm các lượt có cả hai tên mất 1 chỗ trong trần: chủ ý.
- Chưa kiểm: tái hiện cặp #1012 trên dữ liệu thật; số lượt đổi top 30; `rankConfigs` / `perMakeConfigs` (trần cấu hình, `ONE_CONFIG_MAKES`) KHÔNG đổi và vẫn tách theo chuỗi hãng, nếu cần chuẩn hoá cả nơi đó thì là việc khác.
- Chưa có bẫy mới để ghi vào `suppliers/CLAUDE.md` ngoài hai dòng của PR (xem PR).

## Cần ghi nhớ
- Daewoo có gộp vào nhóm Doosan / Hyundai không (Khoa quyết).
- Thứ tự hoà điểm hiện: điểm → gap → (NCC, khoá động cơ, đầu phát) → chữ ô; đo top 30 so với số cũ sẽ thấy đổi chỗ ở những lượt hoà điểm.
