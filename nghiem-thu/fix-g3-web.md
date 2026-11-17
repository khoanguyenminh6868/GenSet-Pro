# Nghiệm thu fix-g3 (web + server): 3 lỗi từ đợt phủ test 13/11/2026

PR: (xem cuối tệp / báo của phiên) — nhánh `fix-g3-web`, 3 commit, mỗi lỗi một commit. Worktree `wt-fix-g3`.

## Tệp đã đổi
- `web/index.html`: `initDb()` (gọi `needSup()` khi đã có màn hình mở), `loadHist()` (không nhớ kết quả rỗng khi chưa có db), `specsTableHtml`, `qualificationRequirements`, `contractTermsHtml`.
- `web/test/smoke.spec.mjs`: bỏ 2 `test.fixme`; thêm 5 ca mở thẳng bằng link; ca Phân tích không còn fixme.
- `server/src/muasamcong.ts` (`asNumber`), `server/test/muasamcong-more.test.ts` (bỏ 3 `todo`, thêm ca số thập phân).

## Lỗi 1: mở thẳng link màn hình
Nguyên nhân: `openScreenFromUrl()` chạy trước khi `initDb()` có `state.db` → `needSup()` thoát sớm (supLoad không bật), `modal()` xoá hash. Màn "Nhà thầu" cùng gốc: `loadHist()` nhớ promise rỗng khi chưa có db.
Sửa: cuối `initDb()` gọi `needSup()` nếu `#ov` đang mở (màn hình đã mở nhưng chưa có dữ liệu; subscribe → `supChanged` vẽ lại, `renderCatalog` đặt lại hash); `loadHist()` khi chưa có db trả rỗng mà không memo, `initDb()` gọi lại có db.
- Trước (đo, theo test-t7): `/#dong-co` kẹt "Đang tải nhà cung cấp…", hash mất. `/#nha-thau` trước sửa: ca mới đỏ (không có dòng nhà thầu).
- Sau (đo, Playwright + Browser pane): `/#dong-co` hiện 328 model, hash giữ `#dong-co`; ca `#dau-phat`, `#bo-dieu-khien`, `#nha-cung-cap`, `#nha-thau` xanh.
- `#cdt/<tên>` và `#goi/<TBMT>` đã có ca sẵn (mở bằng `openApp(hash)`), vẫn xanh.

## Lỗi 2: tab Phân tích in trích nguồn
Gate bằng `SHOW_SRC`: Thông số kỹ thuật (`s.quote`, cột "Nguồn"/`s.reference`: bỏ cả cột khi tắt; cảnh báo "Chưa kiểm chứng" chuyển xuống cột Yêu cầu để không mất), Điều khoản hợp đồng (`x.quote`, `x.reference`), Yêu cầu năng lực (`q.reference`).
- Trước (đo): ca test ghi 60 câu/chỗ dẫn chiếu `SRCQ_…` lộ ở tab Phân tích (chạy lại bản cũ: đỏ).
- Sau (đo): 0 `SRCQ_` trong `#dbody`; bảng thông số 36 dòng, tiêu đề chỉ "Hạng mục | Yêu cầu".
Danh sách chỗ in `quote`/`reference`/`hsmtQuote`/`sourceQuote` đã rà (grep toàn tệp):
- Đã gate sẵn bằng SHOW_SRC: 1831–1835 (chip hint báo giá), 2141 (`x.basis` điều khoản vay), 3607–3609 (`requirementQuote`), 3612 (`q.quote`), 3882, 3924 (`z.quote`), 3942 (nguồn thông số + quote, `!SHOW_SRC → ""`), 4021 (`sourceQuote`), 4089 (`hint.line`), 4335 và 4424 (`offeredRef`), 4371/4374 (Điểm cần lưu ý: reference, quote), 4404 (`e.quote`, `hsmtQuote` Tự kiểm).
- Mới gate trong PR: 4345, 4381, 4392 (dòng gốc).
- Không đổi, không phải trích HSMT: 3496 (hộp "Nguồn" ở màn Nhà cung cấp: câu trích từ trang NCC, hiện trong màn "Mỗi thông tin đều có nguồn kèm theo"; ngoài phạm vi, nếu Khoa muốn ẩn cũng thì báo).
- Chép văn bản gửi chủ đầu tư và xuất tệp: không sửa; chúng nêu nguyên văn theo thiết kế (chú thích dòng 3854) và không đi qua các hàm trên.

## Lỗi 3: `asNumber`
`"2.500.000.000 đ"` → 2500000000; `"45.000.000"` → 45000000; `"Không công bố"` → undefined; `"1250.5"`, 1250.5 → 1250.5 (cũng `"1.250,5"` → 1250.5, `"1,250,000"` → 1250000). Lưu ý: `"1.500"` một dấu chấm + đúng 3 chữ số đọc là 1500 (kiểu Việt); số thập phân 3 chữ số sau dấu chấm bị hiểu là nghìn.

## Lệnh kiểm đã chạy (đầu ra thật)
- `node --test web/test/static.test.mjs`: pass 10, fail 0.
- `PW_CHANNEL=msedge npx playwright test` (web/test): 20 passed.
- `server`: `npm run typecheck` sạch; `npx tsx --test test/*.test.ts`: tests 32, pass 32, fail 0, todo 0. (Lệnh `npm test` trên Windows báo "Could not find test\*.test.ts" do glob; không liên quan.)

## Rủi ro / chưa kiểm
- `needSup()` sau `initDb()` chỉ khi có modal mở; không kiểm trên Supabase thật (dùng DB giả).
- Cột "Nguồn" bị bỏ ở Thông số kỹ thuật: bố cục di động (`.s-ref`) vẫn tương thích (không có ô).
- Quay lui: revert 3 commit của PR.

## Cần ghi nhớ
- Không có.
