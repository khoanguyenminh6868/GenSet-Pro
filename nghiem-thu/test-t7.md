# Nghiệm thu T7 — test khói giao diện web (13/11/2026)

PR nháp: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/636 (nhánh `test-t7-web`, worktree `wt-test-t7`). Không tự merge.
Không sửa `web/index.html` hay mã sản phẩm (không cần móc thử: server thử chỉ bỏ thẻ script supabase-js lúc phục vụ).

## Tệp
- `.github/workflows/test-web.yml` — job `web` (ubuntu, node 22): `node --test static.test.mjs`, `npm ci`, cài chromium, `npx playwright test`; chỉ khi đụng `web/**`; hỏng thì tải trace lên artifact.
- `web/test/serve.mjs` — server thử (dựa trên `.claude/serve.js` cũ): phục vụ `web/`, `/shim.js` → `fake-shim.js`, `/__test/seed.json`; chặn `api/`, `test/`.
- `web/test/fake-shim.js` — DB giả cùng giao diện `db` của `shim.js` (doc/collection/onSnapshot/get/set/update/delete/full/refresh); ghi lại mọi lần ghi `window.__gb.writes` kèm `updated_at` tăng dần; `genbidApi` giả (`/api/webreq` trả `saved`); `genbidWeb = true`, vai trò superadmin.
- `web/test/fixtures/make-seed.mjs` → `fixtures/seed.json` (349 KB): 7 gói feed (1 thật IB2600586587 + 6 giả IB2699…, đóng thầu 2030), 8 bidhist thật (Thảo Nguyên trúng / không trúng / chưa có kết quả, 2 gói mẫu của Giá gợi ý, 3 gói một chủ đầu tư), tracked (Chuẩn bị / Đã nộp / Bỏ qua), 1 dự án, analysis + configmatch (2 cấu hình đầu) + bidprice (chạy lại `bidprice-bot check` trên lượt hồi quy T4) + bidders của IB2600586587, 5 NCC `suppliers/cn`, 1 supfav. Không quote/*, không giá vốn, email thay `[email]`. Giá có trong tệp là giá dự thầu / trúng công khai của muasamcong. Câu trích nguồn gắn tiền tố `SRCQ_`.
- `web/test/smoke.spec.mjs` (Playwright, 14 ca + 2 fixme), `fixtures.mjs` (chặn mạng ngoài, mỗi ca tự kiểm 0 lỗi console/pageerror), `playwright.config.mjs` (retries 0), `static.test.mjs` (10 ca), `package.json` (+lock, `@playwright/test` 1.64.1), `README.md`, `.gitignore`.

## Màn / luồng đã phủ
| Ca | Nội dung |
|---|---|
| tải trang | danh sách, KPI, 9 tab trạng thái, không hộp đăng nhập, 0 lỗi console |
| tab trạng thái | Tất cả / Mới / Chuẩn bị HSDT / Đã nộp / Trúng / Không trúng / Đã đóng (gồm Đã hủy TBMT) / Bỏ qua / Dự án: đúng gói theo quy tắc + số đếm trên tab, thứ tự ngày đăng giảm dần |
| không lưu thứ tự | xếp theo tên rồi đổi tab → về ngày đăng giảm dần |
| mở gói `#goi/IB2600586587` | Tổng quan (chủ đầu tư, bảng nhà thầu đủ dòng), Phân tích (tóm tắt), Cấu hình gợi ý (model động cơ 2 cấu hình), Giá gợi ý ("Đã gợi ý giá", nút Gợi ý lại) |
| SHOW_SRC | Cấu hình gợi ý: không câu trích nào trong chữ hiển thị + title/aria-label/alt/placeholder/href/value (kể cả phần gập) |
| Nhà cung cấp | danh sách 5 NCC, URL `#nha-cung-cap`, sao sẵn có, bấm sao → `supfav/<id>` {on:true} updated_at mới; chi tiết; Loại trừ → `supexcl/<id>`; về danh sách: dòng mờ + nhãn "Đã loại trừ" |
| Nhà thầu | danh sách, URL `#nha-thau`, trang một nhà thầu |
| Danh mục | mở bằng nút "Thông số" ở đầu trang, dựng xong không còn spinner |
| Chủ đầu tư `#cdt/<tên>` | 3 gói, mới đăng trước |
| Back (3 chuỗi) | gói → chủ đầu tư → gói khác → Back×3 (về tab Đã đóng, không rời trang); NCC → chi tiết → Back×2; Nhà thầu → nhà thầu → gói → Back×3 |
| ghi | Mới → Chuẩn bị HSDT (nút trên dòng) ghi `tracked/<TBMT>` stage + tender, updated_at mới, gói chuyển tab; Ghi chú nội bộ ghi `tracked/<TBMT>` note, giữ stage, hiện ở dòng danh sách |
| tĩnh | không `function` trùng tên cấp ngoài cùng (quét cột 0 + V8 dịch thân trong khối strict), ca phủ định tự chèn hàm trùng; navSnap có 4 màn sup/bd/cat/dlg và navRestore xử lý đủ; mọi trường navSnap được navRestore dùng, navKey ⊂ navSnap; màn `modal(mBanner)` ngoài navSnap chỉ có Sổ báo giá `#qlScr` (khoá hành vi: Back đóng như hộp thoại); không `replaceState(null`; `SHOW_SRC = false`; `DEFAULT_SORT` theo ngày đăng |

## Lỗi tìm thấy (`test.fixme`, không làm đỏ CI)
1. **Mở thẳng `/#dong-co` (cả `#dau-phat`, `#bo-dieu-khien`) kẹt "Đang tải nhà cung cấp..." mãi, hash mất khỏi URL.** `openScreenFromUrl()` (cuối script) chạy trước khi `initDb()` có `state.db` → `needSup()` thoát sớm, không ai đăng ký `supplier`. Kiểm trong Browser pane với DB giả; shim thật cũng await `ready` trước khi trả db nên cùng thứ tự (chưa kiểm trên web thật). `#nha-cung-cap` mở thẳng vẫn hiện.
2. **Tab Phân tích in câu trích HSMT và chỗ dẫn chiếu không qua `SHOW_SRC`**: bảng Thông số kỹ thuật (`specsTableHtml`: `s.quote`, cột "Nguồn" = `s.reference`), Điều khoản hợp đồng (`x.quote`, `x.reference`), Yêu cầu năng lực (`q.reference`). Mục Điểm cần lưu ý thì gate cả `quote` và `reference`. IB2600586587: ~60 câu/chỗ dẫn chiếu lộ. Cần Khoa xác nhận câu trích HSMT trong tab Phân tích có tính là "nguồn" phải ẩn không (quy tắc web/CLAUDE.md nói mọi câu trích).

Không phải lỗi: Cấu hình gợi ý đặt dòng nguồn vào thuộc tính `data-supline` (để cuộn tới dòng của NCC), không in ra.

## Lệnh kiểm đã chạy (đầu ra thật)
- `node --test web/test/static.test.mjs` → `# pass 10 # fail 0`, 0,43 s.
- Cục bộ bằng Edge có sẵn (`PW_CHANNEL=msedge npx playwright test`), 2 lượt liền: `14 passed, 2 skipped` (1.4m; 36.1s). Máy này chạy được Playwright qua Edge (không cần tải chromium).
- CI job `web` (run 43349436381, ubuntu + chromium): lần đầu `14 passed (8.1s), 2 skipped`; chạy lại 2 lần: `14 passed (5.7s)`, `14 passed (8.5s)` — không chập chờn. Cả job ~1 phút. Job CI cũ (`ci.yml`) cũng xanh.

## Số đo
- Trước: 0 test cho `index.html` / giao diện. Sau: 10 ca tĩnh + 14 ca khói + 2 fixme.
- Hàm cấp ngoài cùng của index.html (273) được tệp test nhắc tên: trước 0, sau 9 (initDb, openScreenFromUrl, needSup, modal, navSnap, navSync, navRestore, renderAll, fonts) — đo bằng script đếm tên; test khói chạy qua UI nên phủ nhiều hàm hơn mà không nhắc tên.

## Chưa phủ + lý do
- YCKT tiếng Anh, Đối chiếu TLKT, Tạo HSDT, Đối chiếu HSDT: cần tệp HSMT/HSDT + thư viện CDN (pdf.js, docx) — test chặn mạng ngoài.
- Báo giá NCC / Sổ báo giá / lợi nhuận: brief cấm đưa báo giá vào fixture; có thể thêm báo giá bịa sau nếu cần.
- Gửi yêu cầu cho bot (Phân tích, Gợi ý cấu hình, Gợi ý giá): genbidApi giả đã có, chưa viết ca.
- Điện thoại (bề rộng ≤ 640, quẹt Back), giao diện sáng/tối, bộ lọc cột, xoá gói, tạo dự án, chi tiết Danh mục.
- Dữ liệu `_lite` / `db.full` của shim thật (DB giả không có bản rút gọn).

## Rủi ro / quay lui
- Vercel phục vụ cả `web/test/*` như tệp tĩnh (seed.json công khai, cùng dữ liệu công khai đã có trong repo). Muốn ẩn: thêm `.vercelignore` — chưa làm vì ngoài phạm vi.
- Đổi giao diện (id, nhãn, thứ tự tab) có thể làm ca khói đỏ: sửa ca theo quy tắc mới. Quay lui: revert PR (chỉ thêm tệp).

## Cần ghi nhớ
- Thử cục bộ: `node web/test/serve.mjs 4317` thay cho `.claude/serve.js` cũ (nằm ở scratchpad phiên khác); Playwright chạy được trên máy này với `PW_CHANNEL=msedge` → nên sửa dòng "Máy không có Python/playwright" trong `web/CLAUDE.md` (chưa sửa: ngoài phạm vi chỉ thêm test).
- Hai lỗi trên cần phiên sửa (index.html: một phiên một lúc).
