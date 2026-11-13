# web/ — quy tắc và bẫy

Chỉ bản web Vercel + bot Windows được dùng; không phát triển nhánh artifact claude.ai (`!window.genbidWeb`).

## index.html
- Là một script lớn: hàm trùng tên thì hàm khai báo sau đè hàm trước, không báo lỗi → grep tên trước khi thêm hàm. Hai phiên không sửa tệp này cùng lúc.
- Thư viện CDN tải theo nhu cầu: thêm vào `LIBS` của `loadLib(name)`.
- Trong h`` viết thuộc tính dạng `data-x="${...}"` (chuỗi `'data-x="y"'` bị escape). `<input>` thiếu `type` không ăn CSS ô nhập của trang.
- Trích nguồn: dữ liệu vẫn giữ, nhưng màn hình KHÔNG in (`SHOW_SRC = false`). Mọi chỗ hiện câu trích/dòng nguồn/link nguồn phải gate bằng nó; chữ hiển thị mới (note, why) không được chứa câu trích hay số của nguồn.
- Danh sách gói: mọi tab mở theo ngày đăng giảm dần (`DEFAULT_SORT`), không lưu thứ tự theo người dùng.
- Back/quẹt trên điện thoại luôn về màn hình trước: màn hình/chi tiết/hộp thoại mới phải thêm vào `navSnap`/`navRestore`; đổi URL dùng `replaceState(history.state, …)`, không dùng null.
- Việc chậm phải có spinner: `busy.js` tự bọc fetch; việc không qua fetch (thư viện, dựng PDF, đọc tệp) bọc `window.genbidBusy(promise)`.
- Chữ trên màn hình: "Chi phí phát sinh" (không dùng "khoản thêm"); "% gói cũ trúng ≥ mức này" (không gọi là xác suất thắng). Danh sách gợi ý tự vẽ, không dùng `<datalist>`.

## Dữ liệu (Supabase Free: egress 5 GB/tháng)
- MỌI chỗ ghi `docs` phải đổi `updated_at` (IndexedDB của web, doc-cache của bot, view đều dựa vào).
- Mọi truy vấn phân trang phải có `.order(...)` (thiếu thì mất dòng).
- `allTenders()` memo theo identity của state → luôn THAY object, đừng sửa tại chỗ.
- `analysis` trên web là bản rút gọn (`_lite`); cần thông số của gói KHÁC gói đang mở thì gọi `db.full` trước.
- `hsmttext` tải theo từng tài liệu `hsmttext/<K>_<i>` (cả collection → Vercel 502).
- `api/requests.js`: KHÔNG lọc yêu cầu theo cửa sổ thời gian ở `kind=all` (bot quên chữ ký đã giao, lượt con không báo lỗi được).
- `api/webreq.js` lọc trường yêu cầu theo danh sách: thêm trường mới vào yêu cầu thì phải thêm ở đó.
- `state.quote`: bỏ qua khoá bắt đầu bằng `_` (`quote/_cost` = tỷ giá + thuế dùng chung); lưu `quote/*` phải giữ trường khác (`{...cũ, ...mới}`). `numIn` coi "." là phân cách nghìn.
- `GenbidCatalog.build` mất 4–7 s: không gọi `catalog()` đồng bộ lúc mở màn hình. Sửa `catalog.js`: so md5 JSON của `build()` trên `suppliers/cn` với bản origin/main.
- `bidprice.js`, `catalog.js`, `conversions.js` dùng chung cho web và bot (`suppliers/`): sửa thì chạy test của cả hai.

## Thử cục bộ
- Máy không có Python/playwright. Dùng `C:\Projects\GenSet Pro\.claude\launch.json` + serve.js (shim DB giả; nạp `suppliers/cn/*.json` và dump bidhist từ `genbid-work\doc-cache`), trỏ vào `<worktree>/web`.
- Thử bằng UI thật, không chép code ra console. Đổi hash không tải lại trang → reload thật. Mở gói bằng `#goi/<TBMT>` rồi bấm tab. Xoá localStorage `genbid:capScan` sau khi đổi dữ liệu thử.
- Preview Vercel của PR bị "Ignored Build Step"; chỉ `main` được deploy.
