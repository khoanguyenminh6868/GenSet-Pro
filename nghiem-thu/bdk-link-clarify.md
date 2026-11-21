# bdk-link-clarify (PR #1024): link bộ phận theo tài liệu hãng, gộp câu hỏi làm rõ trùng (21/11/2026)

Việc: Khoa xem IB2600603983 (configmatch 2026-11-21T03:54:13Z), nêu 2 lỗi web. Nhánh `bdk-link-clarify`.

## Sửa
- `web/index.html`: động cơ / đầu phát nguồn `maker` có link mở Thông số (LSA 49.3 M8); mô-đun có link mở hồ sơ hãng (`compat.supplierId`; DSE890 MKII không phải bộ điều khiển nên không có trang trong danh mục).
- "(chưa có trong danh mục)": ô này trước đây mất `.cfgctl`, nên khi danh mục dựng từ bản nhà cung cấp còn thiếu model rồi bản mới về, `partsFill()` không đọc lại, chữ nằm mãi tới khi vẽ lại thẻ. Nay giữ `.cfgctl`.
- `suppliers/config-bot.mjs` `clarifyOf`: bỏ mục agent khi CÙNG tên mục VÀ chung ít nhất một câu trích với mục của code; giữ mục của code.

## Căn cứ nguyên nhân "chưa có trong danh mục"
- Hồ sơ `deep-sea-electronics` đang đăng trên web giống repo (21 bộ điều khiển, có DSE7320 MKII, DSE7420 MKII), không nằm trong `supdeleted`; `keyOf` khớp khoá. Giả thuyết "danh mục lưu tên không có MKII" là sai.
- Cơ chế trên được dựng lại bằng test (danh mục thiếu model, rồi bản nhà cung cấp mới về). CHƯA quan sát trực tiếp trên trang đã đăng nhập của Khoa (khung trình duyệt của phiên chưa đăng nhập, không có dữ liệu): sau khi merge cần Khoa mở lại gói để xác nhận.

## Chưa làm, cần Khoa quyết
- Link PDF gốc: KHÔNG thêm. `web/CLAUDE.md` quy định mọi link nguồn phải gate bằng `SHOW_SRC` (đang tắt), ngoại lệ duy nhất là "Dòng nghi sai". Muốn hiện PDF ở thẻ cấu hình thì Khoa phải duyệt thêm ngoại lệ.

## Đo gộp câu hỏi
17 lượt chụp + bản mới IB2600603983: 20 mục, 17 của agent, gộp 2, đều là "Ổn định điện áp" của IB2600603983 (±0,5% / ±1,5%). Không gộp nhầm. Kết quả đã lưu chỉ hết trùng khi gói chạy lại `check`.

## Kiểm trên dữ liệu thật
`run-2.mjs`: check của nhánh trên configmatch đang đăng, 0 problems (`goc-2.json` → `sau-2.json`, chưa đăng lên web). `shot-link.mjs` (web origin/main ↔ nhánh, thẻ #2): link đầu phát 0 → 1, mô-đun 0 → 1; "Ổn định điện áp" trong phần hiển thị 2 → 1.

## Ảnh (`bdk-mo-dun-4\`)
`truoc-link-2.png` / `sau-link-2.png`, `truoc-lam-ro.png` / `sau-lam-ro.png`.

## Test
- `node --test suppliers/*.test.mjs web/test/spec-norm.test.mjs`: 1499 / 1499 đạt.
- Playwright toàn bộ (Edge, 2 worker): 137 đạt, 1 hỏng là ca mới của PR do chờ danh mục quá 20 giây khi chạy song song. Đã nới thời gian chờ; chạy lại riêng `cfg-ctl-module` hai lượt: 8 / 8 đạt. Chưa chạy lại toàn bộ sau khi nới.
