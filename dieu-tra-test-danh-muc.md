# Điều tra test "danh mục thiếu model rồi bản nhà cung cấp mới về" (web/test/cfg-ctl-module.spec.mjs:52)

Phạm vi: `origin/main` ngày 2026-11-21, Linux (4 CPU), Chromium 1243 có sẵn, `npm ci` trong `web/test`, `--trace off`.

## Kết quả chạy
- `--repeat-each 30 --workers 1`: **30/30 đạt**, nhưng thời gian từng lần chia hai nhóm:
  - 5 lần ~0,8–0,9 s (lần 7, 19, 20, 24, 25);
  - 25 lần **"1,0 m"**, tức khoảng 58–60 s (hiển thị làm tròn của reporter).
- Chạy với số worker mặc định: **CHƯA chạy** (mỗi đợt 30 lần mất ~26 phút do nhóm 60 s).
- Không tái lập được lỗi hết giờ trên Linux, nhưng thấy ngay nguyên nhân: test đang chạy sát mốc `expect` 60 000 ms.

## Nguyên nhân (đã đo)
Bước đầu của test `await expect(blk).toContainText("chưa có trong danh mục", { timeout: 60000 })` chờ danh mục dựng xong
(`catWarm()` trong `web/index.html`, ~dòng 3863). Danh mục dựng rải qua `idle()` = `requestIdleCallback(fn, { timeout: 1000 })`,
mỗi bước đọc một nhà cung cấp hoặc một phần của `builder.step()`.

Trong ca này trang không bao giờ rảnh: chèn thử vào `requestIdleCallback` thì mọi lần gọi đều có `timeRemaining() = 0` và `didTimeout = true`
(lần gọi cách nhau ~1000 ms: 1486, 2487, 3548, 4580… ms). Mỗi bước vì thế chạy đúng 1 lần/giây; ~60 bước → danh mục sẵn sàng sau
**~58–61 s** (đo riêng: 60,9 s, `n = 60` lần gọi). Trước đó `.cfgctl` vẫn là thẻ `<a>` (nhánh `!catReady()` của `cfgCtlHtml`), nên không có chữ
"chưa có trong danh mục". Bước 1 hết giờ đúng lúc ~60 s: lần debug của tôi chờ 60 000 ms rồi **hỏng** ở bước này (4/4 lần trong bản có thêm log),
lần chạy nguyên bản thì qua vì sẵn sàng ~1–2 s trước mốc. Nhóm 0,8 s là lần danh mục dựng ngay (trang có lúc rảnh); chưa xác định điều kiện.

Vậy: khoảng cách giữa thời gian thật (~58–61 s) và timeout 60 s gần bằng 0; máy Windows chậm hơn/nhanh hơn vài % là chập chờn ~50%
(khớp "2/4 lần"). `test.setTimeout(150000)` không giúp vì giới hạn gắn với `expect` 60 s. CI xanh vì runner có lúc ở nhóm nhanh hoặc
sát mốc nhưng chưa vượt; không có `retries` (config: `retries: 0`), nên đây là rủi ro thật, không phải CI che.

Chưa làm rõ vì sao `timeRemaining()` luôn 0 (có thể do trang bận liên tục trong headless: `setInterval` 10 s/30 s/60 s ở index.html:2485, 2515,
5550–5556 không đủ giải thích; cần trace profiler).

## Đề xuất bản vá
1. Test (tự tin cao ~90% khắc phục chập chờn): bỏ phụ thuộc vào 60 s idle. Bước 1 đổi timeout thành `120000` (đủ cho `setTimeout(150000)`
   của ca, hoặc nâng `test.setTimeout` lên 240000), bước 2 giữ 60 000. Cách này chỉ đẩy mốc xa, ca vẫn chậm ~1 phút.
2. Mã (tự tin trung bình, thấy nhanh hơn rõ): `idle()` ở index.html:3862 — khi `timeRemaining()` là 0 mà `didTimeout` thì `read`/`make`
   vẫn chạy 1 bước nhỏ; cho mỗi bước chạy ngân sách thời gian cố định (ví dụ ~12 ms theo đồng hồ `performance.now()`) thay vì `d.timeRemaining()`,
   hoặc dùng nhánh `setTimeout(…, 30)` có sẵn thay cho `requestIdleCallback` khi `didTimeout`. Cần kiểm trên điện thoại (mục đích gốc của
   `idle` là không giật) trước khi đổi.
3. Tạm thời trong test: sau `openTab`, gọi `page.evaluate(() => window.GenbidCatalog.build(...))` hay ép `catalog()` (đường đồng bộ, `catalog()` hoàn
   tất ngay khi cần) rồi chờ — tránh chờ rải rác; mức tự tin thấp hơn vì phụ thuộc hàm nội bộ.

Khuyến nghị: làm (1) ngay; (2) là gốc, nên mở việc riêng.
