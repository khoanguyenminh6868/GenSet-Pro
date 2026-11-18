# Nghiệm thu: Chất lượng 1, chặng 2 (đang làm)

Gốc: `origin/main` fd82387d (đã có #923). Worktree `wt-chat-luong-1b`, nhánh `chat-luong-1b`. PR NHÁP https://github.com/khoanguyenminh6868/GenSet-Pro/pull/924 (commit 52326046), chưa merge.

## B(ii) — đã làm (PR #924), chờ điều phối duyệt
Làm theo đề xuất B(i) và câu trả lời của điều phối bên dưới. Chi tiết từng tệp ở mô tả PR.
- **Workflow (cần xem trước khi merge)**: `supplier-publish.yml` thêm bước "Row flags" (`node suppliers/row-flags.mjs --post`) sau Publish; thêm `paths`: `suppliers/row-flags.mjs`, `suppliers/spec-diff.mjs`, `web/catalog.js`, `web/spec-norm.js`, `web/conversions.js`. Không cần npm (row-flags chỉ import tệp trong repo). Chưa chạy thật: lần đầu sau merge sẽ ghi `rowflags/current` (193 dòng, ~130 KB, một dòng `activity_log`).
- **Màn hình**: nhãn "n dòng nghi sai" ở danh sách; mục "Dòng nghi sai" ở chi tiết NCC (mở sẵn khi còn dòng chưa cho dùng). Ảnh trên server thử, dữ liệu giả lấy dòng thật của hosem-power: `chat-luong-1-2-danh-sach.png`, `chat-luong-1-2-chi-tiet.png` (cạnh tệp này).
- **Quyền**: `rowOkCan()` = `isSuperadmin() && !state.readOnly && !!state.db`. Để cho mọi thành viên thì bỏ `isSuperadmin() &&`.
- **Không viết ẩu**: `ROWFLAGS_IN_CONFIG = false` (B(iii) chưa làm). Dòng mức loại hiện "Mức loại" (không phải "Bị loại khỏi gợi ý"), mục ghi "Gợi ý cấu hình chưa dùng các quyết định này." B(iii) đổi hằng này thành true.
- **Test**: `row-flags.test.mjs` 7/7. Playwright toàn bộ 86/86 (Edge), trong đó `web/test/row-flags.spec.mjs` mới có 3 ca. Chưa ghi web thật.

### Chỗ khác thiết kế chặng 1
1. Cờ là MỘT doc `rowflags/current`, không phải mỗi NCC một doc (lý do ở B(i) đề xuất 1).
2. Bot (B(iii)) tự tính cờ, không đọc `rowflags/current` (B(i) đề xuất 3).
3. Trường `line` đổi thành `text`: chữ nguyên văn của dòng; bảng nhãn thì là tên tổ máy + các dòng. Link nguồn KHÔNG nằm trong doc: web lấy từ `sources` của hồ sơ NCC theo `n`, vì hồ sơ đã có trên web.
4. Thêm: bấm lại nút đang chọn thì bỏ quyết định (xoá khoá khỏi `rowok/<NCC>`). Dòng "Bỏ hẳn" vẫn được đếm trong nhãn "n dòng nghi sai"; chỉ dòng "cho dùng" không đếm.
5. `rowok/<NCC>` được ghi đè cả doc. Hai người bấm cùng lúc trên cùng NCC thì người sau đè người trước, giống cách `supexcl` đang làm. Quyền mặc định chỉ Superadmin nên ít khi gặp.

## B(i) — đã kiểm, đề xuất đưa cờ lên web

### Hiện có (đã kiểm trong mã)
- `supplier-publish.yml`: chạy khi push main đổi `suppliers/cn/**` (hoặc chạy tay); `node suppliers/upload.mjs --only <tệp đổi>` ghi thẳng bảng `docs` của Supabase bằng service key (`coll: "supplier"`, `updated_at` = giờ chạy). Chỉ đăng bản ghi đổi (egress).
- Quyền ghi của web: RLS `docs_members` cho MỌI thành viên ghi MỌI coll (không có danh sách coll). Web ghi `supexcl/<id>` bằng `dbSet` (`web/index.html` 3425–3435); trigger ghi nhật ký `activity_log` cho mọi coll (trừ botstatus, prefs).
- Bot đọc web qua `/api/requests?kind=docs&coll=…`, chỉ coll trong `READABLE` (`web/api/requests.js` dòng 12): `rowok` CHƯA có trong đó → phải thêm (sửa `web/api/requests.js`).
- `SHOW_SRC = false` (`web/index.html` 687, Khoa 10/11/2026): màn hình KHÔNG in câu trích / dòng nguồn / link nguồn; mọi chỗ hiện chúng phải gate bằng cờ này (`web/CLAUDE.md`). → Đụng thiết kế 18/11 ("chữ nguyên văn + link nguồn"): cần Khoa quyết (câu 1).
- Kích thước: `row-flags.mjs --json` toàn bộ cờ hiện tại = 76 KB (193 dòng, có chữ nguyên văn).

### Đề xuất (CHƯA làm)
1. **Cờ lên web: MỘT doc `rowflags/current`** `{ at, commit, rows: [{ key, supplierId, n, url, table, row, kind, model, line, drop, reasons }] }` (khác thiết kế chặng 1, vốn là `rowflags/<supplierId>`: cờ số xi lanh dựa số đông của MỌI NCC nên một NCC đổi có thể đổi cờ của NCC khác; một doc = một lần ghi, không phải dọn doc cũ của NCC hết cờ). Bước mới trong `supplier-publish.yml`, sau Publish: `node suppliers/row-flags.mjs --post` (tuỳ chọn mới) tính trên toàn bộ `cn/` rồi chỉ ghi khi nội dung khác bản trên web (đọc lại doc trước khi ghi → không đổi `updated_at` vô ích). Thêm `web/catalog.js`, `web/spec-norm.js`, `web/conversions.js`, `suppliers/row-flags.mjs` vào `paths` của workflow (đổi mã đọc cũng đổi cờ); khi đó bước Publish vẫn chỉ đăng NCC đổi (không có thì thoát 0, như hiện nay). `url` = dòng `URL:` của `sources/<id>/<n>.md` (thư mục `sources/` không lên web).
2. **Quyết định của Khoa: `rowok/<supplierId>`** `{ [rowKey]: { d: "ok" | "drop", by, at } }` (như thiết kế chặng 1). Web ghi bằng `dbSet` (như `supexcl`); thêm nhãn nhật ký `rowok: "dòng nghi sai của nhà cung cấp"` vào `LOG_COLL` (`web/shim.js`); thêm `rowok` vào `READABLE` của `web/api/requests.js` để config-bot đọc (`allDocs("rowok")`).
3. **Bot (chặng B(iii)) KHÔNG đọc `rowflags/current`**: tự tính `flagRows` trên danh sách NCC nó đã nạp (như thiết kế chặng 1). Lệch có thể có: checkout của bot chưa kéo main mới thì mã đọc khác bản workflow vừa tính → web và gợi ý lệch nhau tới lượt bot kéo main kế tiếp (bot tự `merge --ff-only origin/main` mỗi vòng).
4. **Màn hình (B(ii))**: danh sách NCC hiện nhãn "n dòng nghi sai" (đếm dòng của NCC trong `rowflags/current`, trừ dòng Khoa đã "cho dùng"); màn chi tiết NCC thêm mục liệt kê dòng (model, vai, lý do, mức: "bị loại khỏi gợi ý" / "chỉ cảnh báo", chữ nguyên văn + link nguồn tuỳ câu 1) và hai nút. Nút chỉ đổi `rowok`, không đổi dữ liệu NCC.

### Điều phối trả lời (18/11/2026)
- Câu 1: làm (a): mục "dòng nghi sai" hiện chữ nguyên văn + link nguồn, CHỈ ở mục này; không bật `SHOW_SRC` chỗ khác; ghi ngoại lệ trong `web/CLAUDE.md`.
- Câu 2: đang hỏi Khoa; trong lúc chờ: quyền bấm là MỘT chỗ kiểm duy nhất, mặc định chỉ Superadmin, đổi sang mọi thành viên chỉ một dòng.
- Hướng `rowflags/current` + `rowok/<supplierId>` + bước mới trong `supplier-publish.yml`: đồng ý; không ghi web thật khi thử; bước workflow mới phải có trong PR để điều phối xem trước khi merge.

### Câu đã hỏi (đã trả lời ở trên)
1. **Hiện chữ nguyên văn + link nguồn?** Web đang tắt mọi trích nguồn trên màn hình (`SHOW_SRC = false`, quyết định của anh 10/11/2026). Mục "dòng nghi sai" mới: (a) hiện chữ nguyên văn của dòng + link trang nguồn chỉ ở mục này (ngoại lệ, vì không có chúng thì khó biết dòng đúng hay sai), hay (b) theo `SHOW_SRC`: chỉ hiện model, lý do và con số bị nghi?
2. **Ai được bấm "Dòng này đúng, cho dùng" / "Bỏ hẳn"?** (a) chỉ Superadmin (như Tìm thông số NCC), hay (b) mọi thành viên (như Loại trừ NCC)?
