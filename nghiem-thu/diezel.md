# Nghiệm thu: luật "Diezel" (isGensetName) — 2026-11-17

**Kết luận: KHÔNG CÓ GÌ ĐỂ SỬA. Lỗi đã được sửa và merge từ trước: PR #692 (commit facb240e, 13/11/2026), mở ở cả 3 nơi. Không tạo worktree `wt-diezel`, không mở PR.**

## Đã có trên main
- 3 nơi: `web/bidprice.js` (isGensetName, SET_RE), `bot/genbid-hsmt/sync-pure.js` (isGenset), `server/src/muasamcong.ts` (isGeneratorTender, SET_RE). Cả ba SET_RE đều nhận `[dđ]i[eê][sz][eê][ln]` (Diezel / Diesen / điêzen). Không nằm trong config-bot.mjs / catalog.js / reqcodes.mjs.
- Test: `bot/test/sync-rules.test.mjs` (so cả ba nơi trên cùng danh sách, có "Sửa chữa máy phát điện Diezel số 2 Tổ máy 300MW", Diezen, Diesen, điêzen). Server: `server/test/muasamcong*.test.ts`.
- Bản bot trong `genbid-hsmt\sync-pure.js` GIỐNG bản trong git (cmp, không khác).

## Đã chạy
- `node --test bot/test/sync-rules.test.mjs`: 53 pass, 0 fail.
- `npx tsx --test test/muasamcong.test.ts` (server): 0 fail.
- Chưa chạy `suppliers/` và `web/test` (Playwright): không đổi mã nên không cần.

## Số đo (ĐO)
- Commit #692 ghi: 1/1.301 tên gói đổi (đúng IB2400069058), 0/5.842 dòng hàng hoá đổi.
- Tôi đo lại trên `genbid-test\noi-chuan-hoa\bidhist.json` (1556 gói, trường `docs`): luật trước #692 (từ `facb240e^`) vvs hiện tại → 0 gói đổi. Tệp này không chứa IB2400069058 và không có tên nào có Diezel/Diesen/điêzen, nên không thể thấy gói vào/ra ở đây. Bản đo đủ nằm ở thông điệp commit #692 (bộ dữ liệu khi đó).
- Script đo: `genbid-test\diezel-old\cmp.mjs`.

## Rủi ro / việc chưa kiểm
- Nếu Khoa vẫn thấy IB2400069058 bị loại trong Gợi ý giá: nguyên nhân khác (bot/web chưa cập nhật bản #692, hoặc gói nằm ngoài bidhist). Kiểm `update-bot` đã chạy chưa.

## Cần ghi nhớ
- Mục "phủ test còn mở" của sổ điều phối về Diezel có thể đóng.
