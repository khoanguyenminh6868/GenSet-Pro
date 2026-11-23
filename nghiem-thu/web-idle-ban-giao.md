# Bàn giao: test web chập chờn + idle() (phiên con wt-web-idle, 23/11/2026)

## Trạng thái
- Phần 1: PR #1102 đã merge (main 6fa9d80a). Ca `file-transfer.spec.mjs:311` "Bỏ tệp tải tay": helper `toast()` dùng `.first()` → `.last()`.
- Phần 2: PR NHÁP #1107, nhánh `idle-fix`, SHA 8cb69e8147bf8bd2a142d8e2d913c4a1114c605b, CHƯA merge. Worktree `C:\Projects\GenSet Pro\wt-idle-fix` còn giữ (có `web/test/node_modules`); merge xong thì gỡ worktree + nhánh local `idle-fix`.
- Thư mục rỗng `C:\Projects\GenSet Pro\wt-web-idle` có thể còn sót (git đã gỡ worktree, lúc xoá thư mục bị "Permission denied"): xoá tay được.

## Phần 1 (đã xong)
- Nguyên nhân: mỗi thông báo là một thẻ `.toast` riêng sống 2,6 giây; hai thông báo cách ~250 ms trên CI nên `.first()` là thẻ cũ, thẻ mới chỉ là `.first()` trong ~250 ms. 9 / 157 lượt test-web đỏ (19–22/11).
- Đo cơ chế: `.first()` đỏ 5/5 ở 50 ms, 2/5 ở 150 ms, 0/5 từ 250 ms; `.last()` 0/35. Ca thật trên máy Windows 0/20 trước và sau (Edge chậm, không tái lập).

## Phần 2 (#1107)
- Kiểm chẩn đoán cũ bằng CI thật: CI KHÔNG bị (12/12 lượt, ca `cfg-ctl-module.spec.mjs:52` chạy 0,7–1,2 s). Chỉ máy Windows / máy cloud bị.
- Đo `requestIdleCallback` lúc dựng danh mục (Edge, 9 lần, 1 lần cửa sổ hiện): 58–59 lần gọi, 57–58 lần chỉ chạy vì hết hạn 1 giây, chờ ~59 s cho 0,2–0,3 s việc. Chromium 156 không qua Playwright (khung Browser) cũng bị → người dùng Windows có thể bị, không chỉ test.
- Sửa `idle()` (`web/index.html` ~3862): lần gọi hết hạn được lát 15 ms cố định, lần kế chờ tối đa 50 ms; được cấp thời gian rảnh thật thì như cũ. Nhánh Safari không đổi.
- Sau sửa: 5–6 lần gọi, chờ ~1,3 s; ca thật 10/10 đạt 3,4–5,3 s (trước 5/6 lần mất 1–2 phút); cả bộ spec web 143/143; static 11/11.

## Chưa làm / chưa rõ
- Vì sao Chromium không cấp thời gian rảnh cho trang GenBid: CHƯA xác định. Đã loại animation CSS, timer của trang, từng phần tử con của body. Trang trắng cùng trình duyệt được cấp 50 ms đều; thêm vòng `requestAnimationFrame` thì trang GenBid hết bị. Trang tải lại lúc bị lúc không.
- Chưa đo với dữ liệu nhà cung cấp thật (seed chỉ 5 hồ sơ) và chưa thử trên điện thoại.
- Hạn chờ 300000 / 120000 ms của ca `cfg-ctl-module.spec.mjs:52` giữ nguyên, chỉ sửa chú thích.

## Bẫy mới
- Dụng cụ đo có vòng `requestAnimationFrame` làm trang "rảnh" và che mất hiện tượng: đừng đếm khung hình bằng rAF khi đo idle.
- `gh run view --log-failed` của lượt đỏ in "9 × locator resolved to …": đọc dòng này trước khi đoán nguyên nhân (cho biết thẻ nào đang là `.first()`).
- Bẫy `idle()` đã ghi vào `web/CLAUDE.md` (trong #1107); bẫy `.toast` đã ghi vào `web/test/README.md` (#1102).
