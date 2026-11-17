# Nghiệm thu H2 — test giao diện web, phần "Chưa phủ" của T7 (13/11/2026)

PR nháp: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/685 (nhánh `test-h2-web`, worktree `wt-test-h2-web`). Không tự merge.
Không sửa `web/index.html` hay mã sản phẩm, không cần móc thử. Không đụng `web/bidprice.js`, `suppliers/config-bot.mjs`.

## Tệp
- Mới: `web/test/price.spec.mjs`, `requests.spec.mjs`, `files.spec.mjs`, `mobile.spec.mjs`, `misc.spec.mjs`;
  `web/test/fixtures/fake-data.mjs` (dữ liệu BỊA), `fixtures/files.mjs` (tệp mẫu PDF/DOCX/XLSX, đọc lại tệp tải về),
  `fixtures/real-api.mjs` (cho yêu cầu đi qua `web/api/webreq.js` thật với Supabase giả của `web/api/test/harness.mjs`).
- Sửa: `web/test/fake-shim.js` (dữ liệu theo ca `window.__gbPatch`: trộn tài liệu, bản đầy đủ cho `db.full` của tài liệu
  `_lite`, `scratch: "fail"`; `downloads.save` như shim thật để bắt tệp tải về; `genbidScratch` giả trả đường dẫn như thật),
  `fixtures.mjs` (route CDN → `node_modules`, fixture `patch`, `libs`, `reqsOf`, `openTab`), `playwright.config.mjs`
  (`PW_PORT`; `reuseExistingServer: false` — cổng 4317 trên máy đang có server của worktree khác, dùng lại là test nhầm mã),
  `package.json` (+ devDependencies cùng phiên bản `LIBS`: jspdf 2.5.1, docx 8.5.0, xlsx 0.18.5, pdfjs-dist 3.11.174,
  mammoth 1.8.0, dejavu-fonts-ttf 2.37.3 — SRI sha384 của 5 tệp thư viện khớp đúng chuỗi trong `index.html`, đã đo),
  `README.md`, `web/CLAUDE.md` (mục Thử cục bộ: Playwright chạy được qua Edge; đổi `LIBS` thì đổi cả test).

## Luồng đã phủ (36 ca mới + 4 fixme; cả bộ 56 ca + 4 fixme, 10 ca tĩnh)
### 1. Báo giá NCC / Sổ báo giá / lợi nhuận (`price.spec.mjs`, 4 ca)
- Danh sách chọn NCC chỉ có NCC yêu thích không bị loại trừ (tecgen, hosem; abz yêu thích nhưng loại trừ thì không có).
- Nhập qua UI: chọn NCC → `quote/<TBMT>` (giữ trường khác `memo`, `updatedAt` đổi, `updated_at` mới); dòng giá "12.500" USD × 2
  (dấu chấm = nghìn); chưa có tỷ giá → "Chưa có tỷ giá USD", chưa có giá vốn, bảng lợi nhuận ẩn; Tỷ giá, thuế GTGT → `quote/_cost`
  `{fx:{USD:25000}, vat:10}` giữ `rate` cũ; Chi phí phát sinh 5.000.000 đồng + 2% tiền hàng → `cost.extras`, dòng giá còn nguyên.
  Giá vốn tính tay: 2×12.500×25.000 = 625.000.000; phát sinh 5.000.000 + 2%×625.000.000 = 17.500.000; thuế 10%×642.500.000
  = 64.250.000; tổng 706.750.000 → dòng "Tiền hàng … = giá vốn 706,8 triệu", KPI Giá vốn, bảng lợi nhuận hiện.
- Bảng lợi nhuận: 60 gói lịch sử BỊA (2 nhà thầu, giá trúng 0,80 / 0,90 / 0,98 giá gói) → w(r) = 1 / 2/3 / 1/3 / 0. Giá gói
  906.120.000: mức kỳ vọng cao nhất r = 0,89 (2/3 × (806.446.800 − 706.750.000) = 66,5 triệu), giá bỏ 806.447.000, "67%",
  lãi 99,7 triệu; các mức lỗ (r ≤ 0,78) có lớp `ploss`, không có lợi nhuận kỳ vọng; 98% → 0%.
- Báo giá cũ (giờ cố định 13/11/2026): dòng 196 ngày → "Báo giá cũ 196 ngày: nên hỏi lại giá"; đúng 180 ngày → không; không
  ngày → "Chưa ghi ngày báo giá"; khung lợi nhuận nhắc "2 dòng giá cũ".
- Sổ báo giá: 3 dòng của 2 gói, mới nhất trước, lọc NCC → "1 / 3 dòng giá", bấm mã gói → mở gói đó ở tab Giá gợi ý.
### 2. Gửi yêu cầu cho bot (`requests.spec.mjs`, 9 ca + 1 fixme) — mỗi yêu cầu kiểm cả bản trang gửi lẫn bản `webreq.js` thật lưu
- Phân tích lại → `analysisreq` `{key, notifyNo, bidName}`, "Đã gửi yêu cầu phân tích" rồi "Đang chờ Agent phân tích... (vừa gửi)".
- Gợi ý cấu hình chọn G7 + Yêu cầu khác → `configreq` `origin: "g7"`, `extra`; nút và ô chọn khoá khi đang chờ.
- Tìm (cả gói) → `findreq` `origin: "all"`, không `target`. Tìm nhà cung cấp cho cấu hình #2 (bỏ NCC) → `target` {rank 2,
  engine/alternator/controller/genset model + make}.
- Gợi ý giá → `bidpricereq.basis` {kva 160, price, bidForm, investorName}.
- Lấy lại tệp → `hsmtreq` có `sourceUrl` https muasamcong.mof.gov.vn (webreq giữ); Phân tích khi chưa có tệp → không gửi, báo.
- Đang chờ 5 phút + nhịp tim 2:30 → không cảnh báo; 3:30 → "Agent chưa nhận yêu cầu (lần cuối kết nối lúc …)"; không có
  `botstatus` → "Agent chưa kết nối…".
### 3. Tab cần tệp (`files.spec.mjs`, 7 ca)
- YCKT tiếng Anh: bản dịch có sẵn hiện đúng mục/điểm/in đậm; Tải PDF → "160kVA - Technical requirements.pdf", đọc lại bằng
  pdf.js có "Technical Requirement", tiêu đề mục, "Prime power 160 kVA"; Tạo lại → `translationreq`.
- Đối chiếu TLKT, tải lên hỏng: YCKT DOCX (mammoth), đề xuất PDF (pdf.js + worker) + XLSX (xlsx: "### Sheet: …", ô nối " | ")
  → `tlktreq.text/reqText` có chữ đọc được, `uploadError` nêu tên tệp; webreq giữ nguyên. Tải lên được + ô Cấu hình nhập tay →
  `files: []`, `text` = tiêu đề + chữ nhập, `reqFiles` đường dẫn `tlkt/<TBMT>/…`.
- Kết quả TLKT có sẵn: điểm 72, "Còn điểm cần làm rõ", 1 Đạt / 1 Không đạt / 1 Chưa rõ, câu hỏi (1), điểm khác (1), không lộ
  `requirementRef/offeredRef`; Tải PDF tiếng Anh → tên `<TBMT> Technical compliance review EN.pdf`, có "Score 72/100",
  "Clarifications needed", dòng bảng, câu hỏi; không gửi yêu cầu dịch.
- Tạo HSDT (tải lên hỏng): template DOCX + cấu hình PDF → `templateText/configText`. HSDT có sẵn: sửa tại chỗ được, Tải Word →
  `HSDT tham khao <TBMT>.docx`, đọc lại bằng mammoth đủ tiêu đề, tên gói, lưu ý, mục, bảng, danh mục "☐ … (bắt buộc)".
- Đối chiếu HSDT (gói Chuẩn bị HSDT): điểm 64, "Có rủi ro, sửa được", "Tự kiểm hồ sơ dự thầu (1 vấn đề)", tài liệu thiếu (1),
  không lộ dẫn chiếu; Đối chiếu lại → hỏi, xoá `compare/<TBMT>` (op delete), `comparereq` có tệp `hsdt/<TBMT>/…` + chữ dán.
### 4. Điện thoại 390×844 cảm ứng (`mobile.spec.mjs`, 6 ca + 2 fixme)
- Thẻ gói (`display:grid`, nằm gọn màn), ghi chú nội bộ trên thẻ (nhãn "Ghi chú"); chạm mở gói toàn màn, sửa ghi chú → `tracked`,
  Back → thẻ hiện ghi chú mới.
- Back 4 bước: Nhà thầu → một nhà thầu → gói → chủ đầu tư, Back×4 về đúng từng màn, Back thêm vẫn ở trang.
- Các tab gói không tràn ngang, không phần tử thò ra màn; bảng 8 cột (HSDT bịa) cuộn ngang trong khung, trang không cuộn theo.
- Nhà cung cấp danh sách / chi tiết không tràn ngang.
### 5. Khác (`misc.spec.mjs`, 10 ca + 1 fixme)
- Lọc Chủ đầu tư (chọn), Công suất (">200"), sắp theo tên / công suất, Xoá lọc, tải lại trang về mặc định; đổi tab: thứ tự về
  ngày đăng, bộ lọc cột (trừ Trạng thái) vẫn giữ — **khoá hành vi**, chưa rõ Khoa muốn giữ hay bỏ.
- Xoá gói (Đã đóng): hỏi, `deleted/<TBMT>` {notifyNo, bidName}, rời danh sách, số trên tab giảm; tab Mới không có ô chọn.
- Tạo dự án: nút Tạo khoá khi chưa có tên, `manual/DA-…` mã "DA-2026-11-13-01", mở dự án, tab Dự án 2.
- Danh mục từ hàng trúng thầu (gói BỊA): "1106A-70" → "3 model gần giống" mở Danh mục lọc sẵn đúng 3 model; "1106A-70TAG3" →
  "Xem thông số" mở chi tiết (loại, mọi nhóm thông số, bảng nguồn của 3 NCC, hash `#dong-co`); Back về gói.
- Sáng / tối: máy để sáng hay tối trang đều tối (`data-theme="dark"` đặt cứng) — **khoá hành vi**.
- `_lite`: bản rút gọn dựng bằng `api/lite.js` thật; danh sách đọc công suất từ bản rút gọn, chưa đọc bản đầy đủ nào; mở gói →
  `db.full("analysis/<TBMT>")` đúng một gói, tab Phân tích đủ 100% dòng thông số; chưa có bản đầy đủ → "Đang tải kết quả phân tích...".

## Lỗi tìm thấy (`test.fixme`, không làm đỏ CI) — cách tái hiện
1. **Gợi ý giá từ web mất tỉnh / lĩnh vực / ngày đóng thầu** (`requests.spec.mjs`). `index.html bidBasis` gửi `location, field,
   bidCloseDate` ("cho dự báo số nhà thầu của bot"); `suppliers/bidprice-bot.mjs:128` đọc `b.location/b.field/b.bidCloseDate`
   cho `nbForecast`; nhưng `web/api/webreq.js bidBasis` (dòng 90) chỉ giữ kva, price, capText, bidForm, investorName. Tái hiện:
   bỏ `.fixme` → bản trang gửi có 3 trường, bản webreq lưu thì không. Hệ quả: ba mức giá hiệu chỉnh của yêu cầu từ web dự báo
   số nhà thầu không theo tỉnh/lĩnh vực và không cắt theo ngày đóng thầu (chưa đo trên dữ liệu thật). Sửa: thêm 3 trường vào
   `bidBasis` của webreq.js (+ test API).
2. **Back bỏ qua màn Nhà thầu mở từ bảng nhà thầu của gói** (`mobile.spec.mjs`, cả máy tính). Bấm mở một gói ở danh sách → tab
   Tổng quan bấm tên một nhà thầu → bấm một gói của nhà thầu đó → Back: khung chi tiết đóng, về danh sách (đáng lẽ về màn nhà thầu,
   rồi gói đầu). Mở màn Nhà thầu bằng nút đầu trang thì đúng.
3. **Gói mở thẳng bằng link `#goi/<TBMT>` không thành một bước Back** (`misc.spec.mjs`). Mở `/#goi/<TBMT>` → bấm "N model gần
   giống" / "Xem thông số" → Back: đóng luôn gói. `navTap()` lần chạm đầu chỉ đẩy `NAV_HOME`. Mở gói bằng bấm ở danh sách thì đúng.
   Ảnh hưởng link gói gửi cho người khác.
4. **Nhãn dài thò ra mép phải ở tab Cấu hình gợi ý trên điện thoại** (`mobile.spec.mjs`). Bề rộng 390 px, gói IB2600586587, tab
   Cấu hình gợi ý, mở các phần gập: `.chip.mut` "dòng bảng không ghi đầu phát NIANFENG NF…" (cột Chào của bảng so) rộng hơn màn.
   Chỉ lộ trên CI (ubuntu + chromium, phông rộng hơn); Edge trên Windows vừa khít nên lượt CI đầu (run 43365193928) mới thấy.
   Trang không cuộn ngang (phần thò ra bị cắt / che). Các tab khác đạt.

## Lệnh kiểm đã chạy (đầu ra thật)
- `node --test web/test/static.test.mjs` → `# pass 10 # fail 0`.
- Cục bộ Edge: `PW_PORT=4391 PW_CHANNEL=msedge npx playwright test` → `3 skipped, 56 passed (1.9m)`.
- Mỗi ca `fixme` đã chạy bỏ `.fixme` và thấy đỏ đúng chỗ (1: thiếu location/field/bidCloseDate trong bản webreq; 2 và 3: drawer
  đóng sau Back).
- CI job `web` (ubuntu + chromium): commit đầu d1db49db (run 43365193928) đỏ 1 ca → lỗi 4 (chip tràn), tách thành fixme.
  Commit sau, run 43365526928, 3 lượt liền (lần đầu + chạy lại 2 lần): `56 passed (27.2s) 4 skipped`, `56 passed (33.3s)`,
  `56 passed (34.6s)`; cả job 57 s / 72 s / 67 s (< 3 phút). Job `CI` cũ xanh.

## Số đo
- Ca Playwright: trước 14 + 2 fixme (T7, 2 fixme T7 đã được sửa trên main nên nay xanh: 20 ca) → sau 56 + 4 fixme (đo).
- Hàm cấp ngoài cùng của index.html (277) được tệp test nhắc tên: trước 8, sau 17 (đếm tên, đo). Test chạy qua UI nên phủ nhiều
  hàm hơn mà không nhắc tên (quoteCostHtml, profitHtml, requestWorker, uploadOrText, readFile, translationPdf, tlktPdf,
  hsdtDocx, partFind, askDelete, askNewProject…).

## Chưa phủ + lý do
- Chi phí vốn (`financeCost`, nút "Lãi suất, số ngày"): đang tắt (`SHOW_FINANCE = false`, Khoa 12/11) nên không có trên màn hình.
- Tải tệp báo giá lên (`api/quote.js`, `genbidScratch` → bucket quote) và mở tệp báo giá: cần storage thật; DB giả từ chối.
- Tải tay tệp HSMT của dự án (`addProjectFiles` → `assets.upload`, `hsmttext/*`): DB giả không có kho tệp.
- PDF tiếng Anh tự tải khi bot dịch xong (`checkAutoPdf`) và Tải PDF khi chưa có bản dịch (gửi `tlktreq translate:true`): chưa viết.
- HSMT chỉ định hãng (`quoteNeedOf`/`quoteMisfits`): gói mẫu không chỉ định hãng.
- Quẹt thật bằng ngón tay: trình duyệt điện thoại đổi quẹt thành Back của lịch sử, test dùng `page.goBack()`.
- Chọn "Tính theo báo giá của" nhiều NCC, kịch bản số nhà thầu (`data-pscen`): chưa viết.

## Rủi ro / quay lui
- `npm ci` của job `web` tải thêm ~6 gói (jspdf, docx, xlsx, pdfjs-dist, mammoth, dejavu) — job vẫn dưới 3 phút (xem CI).
  `xlsx@0.18.5` trên npm có cảnh báo bảo mật (chỉ là devDependency của test, cùng bản trang tải từ cdnjs).
- Đổi giao diện (id, nhãn) có thể làm ca đỏ: sửa ca theo quy tắc mới. Quay lui: revert PR (chỉ thêm/sửa tệp trong `web/test`
  và một dòng `web/CLAUDE.md`).

## Cần ghi nhớ
- Hai "khoá hành vi" cần Khoa xác nhận: đổi tab giữ bộ lọc cột (chỉ bỏ lọc Trạng thái); trang luôn tối, không theo máy.
- Ba lỗi trên cần phiên sửa: (1) `web/api/webreq.js` (nhỏ); (2), (3) `index.html` (Back/navTap — một phiên một lúc).
