# fix-h3-genset-name — tách luật tên gói / dòng hàng hoá máy phát

PR nháp: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/682 (nhánh `fix-h3-genset-name`, worktree `C:\Projects\GenSet Pro\wt-h3-genset-name`, chưa gỡ cho tới khi điều phối kiểm). CI: chờ chạy trên PR (cục bộ xanh, xem dưới).

## Đã đổi
- `web/bidprice.js`: `isGensetName` thành luật TÊN GÓI = (luật cũ hoặc "MPĐ/MPD" đứng riêng, lookbehind/lookahead `\p{L}`) và không phải máy phát điện gió / mặt trời / năng lượng / tua-bin gió / pin mặt trời / quang điện / Solar / Wind, trừ khi tên có diesel, dự phòng, kVA (`SET_RE`). Thêm `isGensetRow` = luật cũ nguyên văn, xuất ra. RENEW_RE chỉ khớp khi chữ năng lượng tái tạo đứng sát "máy phát"/"phát điện" (gói hỗn hợp "điện năng lượng mặt trời, Máy phát điện; …" vẫn nhận).
- `bot/genbid-hsmt/sync-pure.js` `isGenset`: cùng luật tên gói. `server/src/muasamcong.ts` `isGeneratorTender`: thêm MPĐ + loại tái tạo; vẫn là luật nới nhất ("phát điện" đứng riêng giữ), không có PLANT_RE.
- `suppliers/bidprice-backtest.mjs` dòng 50 dùng `isGensetRow`; `suppliers/CLAUDE.md` ghi quy tắc.
- Test: bỏ 2 `todo` ở `suppliers/domain.test.mjs` (+ ca dòng vật tư, tua-bin gió, điện mặt trời + diesel); `bot/test/sync-rules.test.mjs` (MPĐ, tái tạo, ca so ba nơi trên cùng danh sách 11 tên; bản server được đọc từ regex trong `.ts`); `server/test/muasamcong-more.test.ts` (`Phát điện mặt trời` nay false).

## Bảng nơi gọi → hàm
| Nơi | Dòng (sau sửa) | Đối tượng | Hàm |
|---|---|---|---|
| bidprice.js `unitsOf` | 57 | dòng hàng hoá | `isGensetRow` |
| `goodsGroup` | ~225 | dòng hàng hoá | `isGensetRow` |
| `isSetRow` | ~256 | dòng hàng hoá | `isGensetRow` |
| `candidates` lọc gói | ~300 | tên gói | `isGensetName` |
| `candidates` movesOldSet | ~312 | dòng hàng hoá | `isGensetRow` |
| rivals/bảng giá (3 chỗ) | ~479, 701, 931 | tên gói | `isGensetName` |
| `compRows` genset | ~538 | tên gói | `isGensetName` |
| `suppliers/bidprice-backtest.mjs` 39 / 50 | | tên gói / hàng hoá | `isGensetName` / `isGensetRow` |
| `suppliers/gaps.mjs` 61 | | tên gói | `isGensetName` (không đổi mã) |
| `web/index.html` 813, 2090, 2119, 2181 | CHỈ ĐỌC | tên gói (`d.bidName`, `t.bidName`) | `isGensetName` = luật tên gói mới → **không cần sửa index.html** |
| `web/index.html` 883 | | `isGenset` riêng: `includes("máy phát điện")` | ngoài phạm vi; vẫn nhận gói máy phát điện gió ở mục "new/skip" — nên báo điều phối nếu muốn đồng bộ |

## Số đo (đo thật, bidhist 13/11 22:46: 1556 gói, 1627 phần, 8250 dòng hàng hoá, 1405 tên khác nhau)
- Tên gói đổi (true→false): **4**. Tên phần: 3 (cùng các tên đó). Chiều false→true: 0 (không có tên gói chỉ ghi MPĐ trong bộ này).
- Dòng hàng hoá: dùng `isGensetRow` → **0 đổi**. (Nếu dùng luật tên gói mới cho dòng hàng hoá sẽ có 4 dòng đổi false→true, đều là vật tư MPĐ: đó là lý do phải tách.)
- `unitsOf` 0, `goodsGroup` 0, `cfgPower` 0 gói đổi. `candidates` (40 gói mẫu, K 500): `list` 0 đổi; `total` (tổng phần có kết quả trong mẫu) 1368→1363 (5 phần của 4 gói loại ra, chỉ là con số đếm).
- `suppliers/regress-bidprice.test.mjs`: xanh, mẫu không đổi. `node suppliers/*.test.mjs`: 784 pass, 0 fail, 0 todo. `bot/test/*.test.mjs`: 104 pass. `server` (tsx --test, 32 pass; `tsc --noEmit` sạch). Lưu ý: `npm test` của server không chạy trên Windows vì glob `test/*.test.ts` không được shell mở; chạy `npx tsx --test $(ls test/*.test.ts)`.
- `bidprice-backtest.mjs` trước/sau (origin/main so nhánh, cùng bản chụp bidhist): **giống hệt** (mọi dòng, trừ dòng đầu có thời gian chạy).
- `analysis.json`: không có tên gói trong đó (chỉ keyInfo/technicalSpecs…), nên không có gì để đo cho luật tên; `cfgPower` đo trên bidhist.

## 4 tên đổi (xem tay: đều đúng là không phải tổ máy diesel)
1. "08/VMC-ĐGCSN: Mua sắm hàng hóa phục vụ sản xuất cụm cơ khí và máy phát điện gió giai đoạn EVT" — linh kiện sản xuất máy phát điện gió.
2–4. "Vật tư Offskid cho nâng cấp hệ thống điều khiển máy phát điện Solar TG-A / TG-B / TG-C trên GNTT" — hệ thống điều khiển tổ phát tua-bin Solar (Solar Turbines) trên giàn khoan, không phải tổ máy diesel. (Loại nhờ `\bsolar\b`; rủi ro: tên có hãng/thương hiệu "Solar" mà là tổ máy diesel thật chưa thấy trong 1405 tên.)
Lần đo đầu (RENEW rộng hơn) loại nhầm "Gói thầu số 30: Hệ thống cung cấp điện và điện năng lượng mặt trời, Máy phát điện; Âm thanh, camera…" (gói hỗn hợp có mua máy phát); đã thu hẹp RENEW_RE, nay giữ nguyên, có trong ca test.

## "Máy phát" khác tổ máy lọt qua (quét 1405 tên gói/phần)
Kiểu máy phát hàn / xung / tín hiệu / sóng: 8 tên có từ khoá; **0 tên chỉ nói "máy phát hàn/xung/sóng" bị nhận** (luật cũ đã không nhận "Máy phát hàn", "Máy phát xung"). 5 tên được nhận vì có thêm một máy phát điện thật hoặc vật tư máy phát điện ("Mua sắm 03 máy phát hàn 15kVA và 01 máy phát điện 3 pha 30kVA", "Trang bị máy phát điện cho xe phát sóng lưu động", "…vật tư sửa chữa xe công trình, máy hàn, máy tiện, máy phát điện", "Mua sắm bộ sinh hàn nước cho máy phát điện Caterpillar", "Gói số 8: Thiết bị điện… Tổ máy phát điện diesel…"). Không sửa (không rõ ràng; bot thà nhận thừa). Hai tên đầu và "bộ sinh hàn" là gói vật tư, đã do `bidKind`/dịch vụ xử lý phía sau.

## Tệp bot điều phối cần chép sang `genbid-hsmt\`
`bot/genbid-hsmt/sync-pure.js` (không cần sửa `genbid-sync.js`; chỉ `isGenset` đổi). Sau khi merge: Backup-GenBidBot.ps1, chép sync-pure.js, restart tác vụ theo `bot-ops`. Tác dụng: Sync / lịch sử nhận gói chỉ ghi "MPĐ", bỏ gói máy phát điện gió/Solar tua-bin. Web (`web/bidprice.js`) tự lên Vercel khi merge; `suppliers/` chạy từ checkout.

## Rủi ro / quay lui
- Gói chỉ ghi "MPĐ" nay vào feed (cần là tổ máy; MPĐ cũng gọi là "máy phát điện" nên rủi ro thấp). Quay lui: revert PR.
- Tên có "Solar"/"wind" mà là tổ máy thật nhưng không ghi diesel / dự phòng / kVA sẽ bị bỏ — đã thấy 0 trong dữ liệu; luật đã kèm ngoại lệ `SET_RE`.
- Server `isGeneratorTender` không có PLANT_RE (giữ như cũ, nới hơn bot).
- Chưa kiểm: CI GitHub trên PR; không thử trên bot thật / web thật.

## Cần ghi nhớ
- Luật tên gói nằm ở ba nơi (đã ghi vào `suppliers/CLAUDE.md`; test so ba nơi).
- `web/index.html:883` còn `isGenset` riêng (`includes("máy phát điện")`) cho mục "skip": chưa đổi, có thể giao riêng.
- `server` `npm test` lỗi glob trên Windows.
