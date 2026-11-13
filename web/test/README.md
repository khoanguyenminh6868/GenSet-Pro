# Test giao diện web

- `static.test.mjs` — kiểm tĩnh `web/index.html` (không cần trình duyệt): không có hai `function` trùng tên ở cấp ngoài
  cùng, mọi màn của `navSnap` có trong `navRestore`, `SHOW_SRC = false`, thứ tự mặc định. `node --test web/test/static.test.mjs`.
- Playwright trên `index.html` thật (job `web` của `.github/workflows/test-web.yml`, chỉ khi đụng `web/**`):
  - `smoke.spec.mjs` — danh sách gói theo tab, mở gói và các tab, Nhà cung cấp, Nhà thầu, Danh mục, Chủ đầu tư, Back, không
    câu trích nguồn nào lộ ra, thao tác ghi đổi `updated_at`.
  - `price.spec.mjs` — Báo giá NCC, tỷ giá + thuế dùng chung (`quote/_cost`), Chi phí phát sinh, giá vốn, bảng lợi nhuận kỳ
    vọng, báo giá cũ > 180 ngày, Sổ báo giá.
  - `requests.spec.mjs` — các nút gửi yêu cầu cho bot (Phân tích, Gợi ý cấu hình, Tìm NCC, Gợi ý giá, Lấy tệp), "đang chờ",
    "máy bot tắt" (nhịp tim > 3 phút).
  - `files.spec.mjs` — YCKT tiếng Anh, Đối chiếu TLKT, Tạo HSDT, Đối chiếu HSDT: đọc tệp PDF / DOCX / XLSX, gửi yêu cầu, hiện
    kết quả, tệp PDF / Word tải về có nội dung.
  - `mobile.spec.mjs` — điện thoại 390×844 có cảm ứng: thẻ gói, ghi chú, Back 4 bước, bảng rộng cuộn ngang, không tràn ngang.
  - `misc.spec.mjs` — bộ lọc cột / thứ tự tạm, xoá gói, tạo dự án, chi tiết Danh mục, giao diện sáng / tối, `_lite` + `db.full`.
- `serve.mjs` — server thử: phục vụ `web/`, thay `/shim.js` (Supabase) bằng `fake-shim.js` (DB trong bộ nhớ, ghi lại mọi lần
  ghi ở `window.__gb.writes`, yêu cầu gửi bot ở `window.__gb.api`), nạp `fixtures/seed.json`, bỏ thẻ script supabase-js.

## Chạy cục bộ (Windows)
```
cd web/test
npm ci
node serve.mjs 4317            # xem bằng Browser pane: http://127.0.0.1:4317/ , #goi/IB2600586587 ...
$env:PW_CHANNEL="msedge"; npx playwright test   # dùng Edge có sẵn (máy này không tải được chromium của Playwright)
$env:PW_PORT="4391"            # cổng khác khi 4317 đang bận (worktree khác đang chạy server thử)
```

## Dữ liệu
- `fixtures/seed.json` do `fixtures/make-seed.mjs` dựng từ `genbid-work\doc-cache` (analysis, configmatch, bidhist), 5 NCC
  của `suppliers/cn` và lượt hồi quy T4 `suppliers/fixtures/runs/IB2600586587` (Giá gợi ý). Dựng lại:
  `node web/test/fixtures/make-seed.mjs` rồi xem diff. Không đưa giá vốn, báo giá NCC (`quote/*`), token, email vào đây
  (repo công khai). Câu trích nguồn được gắn tiền tố `SRCQ_` để test `SHOW_SRC` phát hiện nếu lộ ra. Gói đang mở là gói giả
  `IB2699…`, ngày đóng thầu 2030 để test không phụ thuộc giờ hệ thống. Đổi gói mẫu thì sửa bảng `TAB` ở đầu `smoke.spec.mjs`.
- Dữ liệu riêng của một ca: `test.use({ patch: { colls, full, scratch } })` (xem đầu `fake-shim.js`): trộn tài liệu vào seed
  (null = bỏ), bản đầy đủ cho `db.full` của tài liệu `_lite`, `scratch: "fail"` để trang tự đọc chữ trong tệp.
- `fixtures/fake-data.mjs` — dữ liệu BỊA: báo giá, tỷ giá, chi phí, 60 gói lịch sử (giá trúng 0,80 / 0,90 / 0,98 giá gói)
  để đường xác suất thắng tính được bằng tay. Số mong đợi tính từ công thức của `web/bidprice.js`.
- `fixtures/real-api.mjs` — cho yêu cầu trang gửi đi qua handler thật `web/api/webreq.js` (Supabase giả của
  `web/api/test/harness.mjs`): kiểm trường nào bot thật sự nhận.
- `fixtures/files.mjs` — tệp mẫu nhỏ (PDF viết tay, DOCX, XLSX) và đọc lại tệp trang xuất ra (pdf.js legacy, mammoth).

## Thư viện CDN
`fixtures.mjs` chặn mạng ngoài; thư viện của `LIBS` trong `index.html` (jsPDF, docx, xlsx, pdf.js + worker, mammoth) và
phông DejaVu (`/_blob/<id>`, `ITALIC_URL`) được trả từ `node_modules` (devDependencies cùng phiên bản), nên SRI của trang vẫn
được trình duyệt kiểm. Đổi phiên bản trong `LIBS` thì đổi cả `package.json` và bảng `LOCAL` trong `fixtures.mjs`.

## Bẫy
- `page.clock.setFixedTime` làm giờ đứng yên: `updatedAt` của hai lần lưu liền nhau trùng nhau nên khung chi tiết không vẽ
  lại. Dùng `page.clock.install({ time })` (giờ chạy tiếp). Đồng hồ giả còn làm lệch mốc 3 giây của "Đã gửi yêu cầu phân
  tích": chỉ cài giờ cho ca cần ngày cố định (báo giá cũ, nhịp tim bot, mã dự án).
- Hàm trong `index.html` không phải biến toàn cục: không gọi được từ `page.evaluate`; đọc qua giao diện hoặc `window.__gb`.

Lỗi tìm thấy để ở `test.fixme` (không làm đỏ CI): xem `genbid-work\dieu-phoi\nghiem-thu\test-t7.md` và `test-h2-web.md`.
