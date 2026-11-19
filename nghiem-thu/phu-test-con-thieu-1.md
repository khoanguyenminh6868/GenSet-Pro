# Nghiệm thu: phủ test còn thiếu sau đợt 13/11 (phiên con wt-phu-test-3)

PR (DRAFT, không tự merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/935 — nhánh `test/phu-con-thieu`.
Chỉ THÊM test (+2 dòng README của `web/test`), không đổi mã sản phẩm. Không gọi web thật / Supabase thật.

## Tệp đã thêm
- `server/test/muasamcong-browser.test.ts` (8 ca)
- `web/test/file-transfer.spec.mjs` (15 ca)
- `web/test/back-forward.spec.mjs` (30 ca: 14 × 2 thiết bị + 2 ca phụ × 2)
- `web/test/README.md` (mô tả hai spec mới)

## Cách hiểu "còn thiếu" của tôi (sổ ghi ba chữ, không nêu mã)
**(a) Nhánh trình duyệt của `server/`**: `server/` chỉ còn `src/muasamcong.ts` (sau #677). Nhánh trình duyệt = `searchViaBrowser` + đường `auto` của `searchRaw` (gọi trực tiếp bị đòi reCAPTCHA / lỗi → thử lại bằng Chromium không đầu). Trước đó `muasamcong*.test.ts` chỉ phủ `direct` với fetch giả.
**(b) Tải tệp báo giá / HSMT của dự án**: tôi hiểu là cả hai chiều, trên bản web: báo giá NCC (`addQuoteFiles`, `openQuoteFile`, `askRemoveQuote`) và tệp HSMT / dự án (`downloadHsmtFile`, `fetchSiteFile`, `openPdf`, `addProjectFiles`, `askRemoveProjectFile`). Grep `qfiles|qopen|qdel|dlfile|openpdf|pdel` trong `web/test` trước đó: 0 chỗ. Nếu Khoa chỉ muốn "tải VỀ", phần upload là thừa nhưng vô hại.
**(c) Forward sau Back từ link thẳng**: `navTap / navSync / navRestore / popstate` của `index.html` (PR #691 sửa Back). `back-link.spec.mjs` chỉ gọi `goBack`; chưa test nào gọi `goForward`.

## Kết quả từng phần
### (a) 8 ca, chạy thật bằng Edge cục bộ trên cổng giả `127.0.0.1` (`MUASAMCONG_ORIGIN`)
Phủ: `browser` không gọi trực tiếp, mỗi từ khoá một token MỚI (tok-1/2/3), đúng site key + action `submit`, tải trang 1 lần cho 3 từ khoá; bộ lọc `bidCloseDate` theo `openOnly`; `auto`: 401 → trình duyệt (2 lượt: `?token=` rỗng rồi có token); `direct` không mở trình duyệt; `auto` + HTTP 500 vẫn thử trình duyệt rồi nêu `HTTP 500`; cổng trả số trong trang → `CaptchaRequiredError`; không có site key → lỗi, 0 lượt tìm; `fetchOpenGeneratorTenders` mode browser.
CHƯA phủ: (1) trang không bao giờ có `grecaptcha` (timeout 30 s thật, quá chậm cho CI); (2) `goto` quá 45 s; (3) trình duyệt không khởi động được (`CHROMIUM_PATH` sai); (4) `browser.close()` trong `finally` chỉ gián tiếp (không đo tiến trình mồ côi). Test BỎ QUA (skip, ghi lý do) khi máy không có Chromium / Chrome / Edge: trên CI ubuntu-latest tôi chưa biết có chạy hay skip, xem log job `server` (chưa kiểm).
Lưu ý: `npm test` của `server` dùng glob `test/*.test.ts` không chạy trên Windows cmd (`Could not find`), nên cục bộ chạy liệt kê tệp; CI Linux không bị.

### (b) 15 ca, Playwright + Edge, tất cả xanh (chạy 2 worker)
Báo giá: hiện tên/cỡ, PDF = nút Xem, tệp khác = Tải về (tải đúng tên + nội dung, qua `genbidFetch` đúng URL); PDF mở tab mới bằng link `blob:` ; lỗi lấy tệp → toast + tab PDF đóng + danh sách giữ; Upload 2 tệp (kho tạm `quote` → `/api/quote upload`, lưu SAU mỗi tệp, giữ tệp cũ + trường `memo`); tệp > 45 MB bị chặn trước khi tải, tệp lỗi giữa chừng không mất tệp đã lên; xoá một tệp (Huỷ không đổi, xác nhận → `delete` đúng id).
HSMT / dự án: tải về tệp không phải PDF; URL không bắt đầu bằng một `/` bị từ chối (không gọi `genbidFetch`); lỗi lấy tệp; xem PDF bằng pdf.js (1 trang, canvas, Tải về lưu đúng byte, lỗi hiện trong khung); Upload .txt (assets, `hsmttext/<key>_0`, `hsmt/<key>` `manual` + `hasText`, cùng tên thì thay); tệp < 40 ký tự / ảnh; kho assets thiếu / lỗi; Bỏ tệp (Huỷ / xác nhận, chữ của tệp bị bỏ mất khỏi `hsmttext`).
CHƯA phủ: `/api/quote` và `/_gh/` thật (handler phía Vercel, thuộc job `api`); đọc chữ DOCX/PDF khi tải lên dự án (`readFile` với tệp thật, đã phủ ở `files.spec.mjs` cho tab khác); tải lên bằng kéo thả (`#pDrop` drop event); điện thoại; nút "Upload" của HSMT khi chờ bot (`refetchHtml`) dùng cùng `#pFiles` nên chỉ phủ gián tiếp; `openBcdgFile` (báo cáo đánh giá E-HSDT).
Giả lập trong ca: `genbidFetch`, `genbidScratch` (bọc), `genbidApi('/api/quote')`, `claude.use('assets')`. Không sửa `fake-shim.js`.

### (c) 30 ca (5 link × máy tính / điện thoại × 2 + 4 ca chung × 2 + 2)
Kết quả đo: sau Back hết (link → bước → Back → Back → trang chủ), `Forward` LUÔN mở lại bước đã bỏ (cả 5 link, cả 2 thiết bị); Back kế đó về trang chủ, Back nữa vẫn ở trang. Forward ở mục cuối không làm gì; sau nút Đóng, Forward / Back không mở lại gói; bước mới sau Back xoá nhánh Forward; trang chủ không link: Back/Forward/Back/Back đúng từng bước.
Không tìm ra lỗi sản phẩm nào ở (c).
CHƯA phủ / quan sát cần quyết: (1) mở link rồi Back NGAY mà chưa chạm gì: `navStack` chưa có mục đệm (`navTap` chỉ chạy sau click/keydown đầu tiên) nên Back rời trang về trang trước. Đúng theo chú thích mã ("lần chạm đầu"), tôi coi là thiết kế, KHÔNG assert; ca đo sai ban đầu của tôi chính là cái này. (2) Reload giữa chừng rồi Back/Forward (history.state `gb` còn, `navStack` mất, `popstate` bị bỏ qua vì `navStack.length < 2`): chưa đo. (3) Back/quẹt thật trên điện thoại (việc 1 của "Phủ test còn mở" trong `chi-tiet-viec-mo.md`): Playwright chỉ giả `goBack`, cần Khoa thử tay.

## Lỗi tìm ra
Không có (không ca `todo` nào). Ba lần ca đỏ trong lúc viết đều do giả định sai của chính test (ví dụ trên, favicon bị đếm là GET, token dùng lại giữa hai phiên trình duyệt), không phải mã sản phẩm.

## Lệnh đã chạy + đầu ra
- `npx playwright test back-forward.spec.mjs file-transfer.spec.mjs back-link.spec.mjs --workers=2` (PW_CHANNEL=msedge): **59 passed (1.6m)**.
- `npx tsx --test test/muasamcong.test.ts test/muasamcong-more.test.ts test/muasamcong-browser.test.ts`: tests 40, pass 40, fail 0, skipped 0; `tsc --noEmit` không lỗi.
- `node --test web/test/static.test.mjs`: 11/11.
- CHƯA chạy toàn bộ `npx playwright test` cục bộ (máy đang bận phép đo nặng); dựa vào CI job `web` của PR. Một lần chạy chung 45 ca có 1 ca báo "grid không thấy" (`openApp` hết 10 s lúc nhiều ca chạy song song cùng máy đang nặng), chạy lại 59 ca thì xanh; ca đó là `file-transfer` "không lấy được tệp" (chập chờn do tải máy, chưa tái hiện lại).

## Rủi ro / quay lui
Chỉ thêm tệp test: quay lui = xoá 3 tệp + 2 dòng README. Rủi ro: test (a) phụ thuộc có trình duyệt trên CI; chập chờn do tải máy ở (b) nếu CI chậm (timeout 30 s / ca, `retries: 0`).

## Cần ghi nhớ (điều phối chuyển sổ)
- Mục (6) "Phủ test còn mở" của `chi-tiet-viec-mo.md` / `so-dieu-phoi.md`: nhánh trình duyệt `server/`, tải tệp báo giá/HSMT, Forward sau Back → ĐÓNG sau khi PR #935 gộp; còn lại: Back thật trên điện thoại (Khoa thử tay), reload + Back, `openBcdgFile`, kéo thả `#pDrop`.
