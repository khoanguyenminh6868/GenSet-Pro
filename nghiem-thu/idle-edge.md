# Kiểm #1187 (idle() + rAF rỗng) trên Edge thật và giả lập điện thoại

Máy KhoaMiniPC, Windows, Edge thật (`channel: "msedge"`, profile tạm Playwright, không đụng profile của Khoa). Worktree `wt-idle-edge`, main b8400d92.
Mỗi ô 4 lượt: mở `#goi/IB2600586587`, mở tab cấu hình (`page.click`, hoặc `page.tap` cho cột "tap"), đếm callback `requestIdleCallback` của catalog build.
TRƯỚC = `git show 53bac29f~1:web/index.html`, SAU = main (có #1187). Điện thoại = devices Pixel 7 / iPhone 14 chạy trên Edge (chromium, `hasTouch`, UA di động).

| cấu hình | thao tác | bản | callback hết hạn / tổng (4 lượt) | tổng thời gian rải việc, ms (từng lượt) |
|---|---|---|---|---|
| Edge headless | click | TRƯỚC | **19 / 24** | 1468, 1518, 1568, 277 |
| Edge headless | click | SAU | 0 / 20 | 252, 210, 166, 176 |
| Edge có giao diện | click | TRƯỚC | **20 / 24** | 1541, 206, 1517, 1545 |
| Edge có giao diện | click | SAU | 0 / 19 | 224, 180, 173, 201 |
| Pixel 7 | click | TRƯỚC | 0 / 19 | 326, 206, 221, 205 |
| Pixel 7 | click | SAU | 0 / 19 | 278, 169, 164, 171 |
| Pixel 7 | tap | TRƯỚC | 0 / 21 | 278, 201, 211, 209 |
| Pixel 7 | tap | SAU | 0 / 23 | 225, 203, 179, 219 |
| iPhone 14 | click | TRƯỚC | 0 / 22 | 240, 209, 224, 204 |
| iPhone 14 | click | SAU | 0 / 22 | 210, 182, 201, 172 |
| iPhone 14 | tap | TRƯỚC | 0 / 24 | 227, 167, 208, 231 |
| iPhone 14 | tap | SAU | 0 / 23 | 237, 185, 199, 210 |

Chờ từng callback TRƯỚC, Edge headless: 1005, 56, 53, 59, 66, 52 (lượt 1) — đúng kiểu bị bỏ đói (1 giây rồi ~50 ms hết hạn).

## Kết luận
- Edge Windows (cả cửa sổ hiện lẫn headless) TÁI LẬP đúng hiện tượng ở bản TRƯỚC (~80 % callback chỉ chạy khi hết hạn, 1,5 s thay vì 0,2 s) và #1187 sửa hết: 0 hết hạn, 166–252 ms. Khớp số đo Linux.
- `idle.spec.mjs` xanh trên Edge (bản SAU, `PW_CHANNEL=msedge`).
- Giả lập điện thoại (cả tap): KHÔNG bị bỏ đói ở bản TRƯỚC (cửa sổ di động giả lập có khung hình), nên không có hiện tượng khác để sửa; SAU không tệ hơn. Không có PR sửa, không có PR nháp.
- Hạn chế: đây là giả lập trên Edge desktop, chưa phải Chrome Android / Safari iOS thật (Safari không có `requestIdleCallback`, nhánh đó không đổi). Máy thật cần Khoa thử nếu muốn chắc.

Tệp đo tạm (không commit): `web/test/idle-matrix.spec.mjs`, `idle-matrix.config.mjs` trong `wt-idle-edge` (đã xoá sau khi đo; có thể dựng lại từ mô tả trên).
