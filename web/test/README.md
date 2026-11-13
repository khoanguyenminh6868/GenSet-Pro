# Test giao diện web

- `static.test.mjs` — kiểm tĩnh `web/index.html` (không cần trình duyệt): không có hai `function` trùng tên ở cấp ngoài
  cùng, mọi màn của `navSnap` có trong `navRestore`, `SHOW_SRC = false`, thứ tự mặc định. `node --test web/test/static.test.mjs`.
- `smoke.spec.mjs` — test khói Playwright trên `index.html` thật: danh sách gói theo tab, mở gói và các tab, Nhà cung cấp,
  Nhà thầu, Danh mục, Chủ đầu tư, Back, không câu trích nguồn nào lộ ra, thao tác ghi đổi `updated_at`. Chạy trên CI (job
  `web` của `.github/workflows/test-web.yml`, chỉ khi đụng `web/**`).
- `serve.mjs` — server thử: phục vụ `web/`, thay `/shim.js` (Supabase) bằng `fake-shim.js` (DB trong bộ nhớ, ghi lại mọi lần
  ghi ở `window.__gb.writes`), nạp `fixtures/seed.json`, bỏ thẻ script supabase-js. Không mạng, không token.

## Chạy cục bộ (Windows)
```
cd web/test
npm ci
node serve.mjs 4317            # xem bằng Browser pane: http://127.0.0.1:4317/ , #goi/IB2600586587 ...
$env:PW_CHANNEL="msedge"; npx playwright test   # dùng Edge có sẵn (máy này không tải được chromium của Playwright)
```

## Dữ liệu mẫu
`fixtures/seed.json` do `fixtures/make-seed.mjs` dựng từ `genbid-work\doc-cache` (analysis, configmatch, bidhist), 5 NCC
của `suppliers/cn` và lượt hồi quy T4 `suppliers/fixtures/runs/IB2600586587` (Giá gợi ý). Dựng lại:
`node web/test/fixtures/make-seed.mjs` rồi xem diff. Không đưa giá vốn, báo giá NCC (`quote/*`), token, email vào (repo công khai).
Câu trích nguồn được gắn tiền tố `SRCQ_` để test `SHOW_SRC` phát hiện nếu lộ ra. Gói đang mở là gói giả `IB2699…`, ngày đóng
thầu 2030 để test không phụ thuộc giờ hệ thống. Đổi gói mẫu thì sửa bảng `TAB` ở đầu `smoke.spec.mjs` theo quy tắc nghiệp vụ.

Lỗi tìm thấy để ở `test.fixme` (không làm đỏ CI): xem `genbid-work\dieu-phoi\nghiem-thu\test-t7.md`.
