# Nghiệm thu: Gợi ý lại giữ lại kết quả Tìm NCC (nhánh `keep-find`)

## Tệp đổi
- `suppliers/config-bot.mjs`: hàm export mới `keepFound(result, prevResult, opts)`; `answer()` gọi nó ngay sau `checkDir` (trước `attachWon` và xếp hạng cuối), truyền `prevResult` đúng cỡ máy (`sameSize`); `rankConfigs` miễn hạn mức 2 cấu hình/hãng cho cấu hình có `keptFind`.
- `suppliers/keep-find.test.mjs`: 8 test mới.

## Cách làm (không gọi agent, không `post`)
1. NCC `fromFind` dưới cấu hình cũ mà kết quả mới có cấu hình cùng động cơ (và cùng đầu phát khi cả hai nêu; đúng phép `same` của `mergeFind`) → thêm lại dưới cấu hình mới, không trùng.
2. Cấu hình cũ `fromFind` mà kết quả mới không có cấu hình tương đương → giữ nguyên (nhà cung cấp + checks), cho chạy lại `check()` (cấu hình con với yêu cầu của lượt này): xuất xứ, nhóm G7/G20, Việt Nam, nguồn, `confirmChecks`, `khoaRules`...; rồi `rankConfigs`. Gắn `fromFind` + `keptFind`.
3. Không giữ: NCC không còn trong `suppliers` (NCC bị loại `supexcl` đã được `web/api/requests.js` lọc khỏi danh sách đó), ngoài nhóm xuất xứ, dòng bảng không còn, đặt tại Việt Nam; cấu hình mà dòng bảng của động cơ/tổ máy không còn hoặc hết NCC thì bỏ. Nguồn kiểu trang internet (không còn tệp lưu) cũng không giữ.
4. Yêu cầu HSMT lượt này khác lượt trước (so `reqHash` khi cả hai có; không thì so mã yêu cầu): vẫn giữ, thêm vào `gaps` của cấu hình "điểm đối chiếu là của lần đọc HSMT trước, bấm Tìm NCC lại" và 1 dòng `notes`; code không tự tạo "đạt".
5. 1 dòng `notes` ghi số cấu hình / NCC giữ lại. Không có gì `fromFind` thì kết quả y nguyên (kể cả `notes`).
6. Hạn mức 2/hãng (#526): **cấu hình giữ lại không tính vào hạn mức** (flag `keptFind` trong `rankConfigs`); các lọc còn lại (trùng động cơ + đầu phát gộp NCC, tối đa 3 hàng/động cơ) vẫn áp dụng. Không đặt trần tổng 6 cho phần giữ lại. Nếu muốn trần thì sửa 1 dòng.
7. NCC thêm lại vào cấu hình cũ không bị cắt ở 3 NCC (giống `mergeFind`, vốn không cắt).

## Kết quả kiểm trên IB2600594596 (dữ liệu thật, không agent, không ghi web)
**Phát hiện lệch với mô tả:** bản TRƯỚC (`configmatch-before-run.json`, `at` 2026-11-11T05:05Z) và bản SAU (`doc-cache/configmatch.json`, 13:00Z) đều **không có** cờ `fromFind` nào (0 cấu hình, 0 NCC; toàn tệp chỉ 12 gói). Tìm NCC gộp vào sau 05:05Z nên trạng thái "ngay trước lượt 13:00Z" không có trong hai tệp. Cấu hình D440 / P158LE ở bản trước là kết quả agent tự tìm (nguồn trang internet), không có cờ. Vì vậy:
- Chạy hàm với (SAU, TRƯỚC) nguyên trạng → 0 giữ lại, kết quả y nguyên (đúng như "gói không có gì fromFind").
- Dựng lại trạng thái "trước khi mất" bằng chính `mergeFind` (code thật, bản ghi NCC thật trong `supplier.json`) trên bản trước/sau, rồi chạy `keepFound` với bản SAU làm kết quả mới:
  - **300 kVA**: `mergeFind` tạo QSL9-G5 / ade-power (cấu hình `fromFind`); `keepFound` đưa lại: giữ 1 cấu hình, vào hạng #5 trong 6 cấu hình (còn #6 QSL9G5 của cummins-inc), checks `{not_met:1, unclear:2, confirm:6}` (cấu hình chỉ có kiểm công suất theo code + checks code tự thêm, vì Tìm NCC chưa đối chiếu agent), nhà cung cấp `ade-power*`. Note: "Giữ lại từ Tìm NCC lần trước ... 1 cấu hình (QSL9-G5)."
  - **400 kVA**: `mergeFind` tạo P158LE / rehlko trên bản SAU; `keepFound` đưa lại, hạng #1 trong 4 cấu hình. Hai biến thể:
    - không thay checks: `{not_met:1, unclear:2, confirm:11}`;
    - gán vào cấu hình đó các checks của bản TRƯỚC (46 check: 36 đạt / 10 chưa rõ — giả lập `checkNewConfigs`): sau kiểm lại `{met:2, unclear:44, not_met:1}`, giữ nguyên trạng thái 12/47 dòng. Gần như mọi dòng đổi từ đạt → chưa rõ vì check cũ trích trang datasheet internet (`web/N.txt`) mà lượt mới không còn trang đó để đối chiếu nên `check()` hạ "đạt" thành "chưa rõ"; "Bộ điều khiển của cấu hình: không đạt (mới)" vì cấu hình dựng bằng code chưa ghi bộ điều khiển (agent ghi APM403 trong lượt cũ); "Đồng bộ thương hiệu" met → unclear do cấu hình không còn tên hãng tổ máy. Đây là giả lập, không phải số thật của lượt mất: `checkNewConfigs` thật dùng catalog nên check của nó dựa trên dòng bảng và sẽ qua `check()` bình thường.
- Phạm vi ảnh hưởng: trong `configmatch.json` hiện có (12 gói) **0** gói có cấu hình / NCC `fromFind` (kết quả lượt 13:00Z đã mất). Số gói thật trên web chưa đếm được (không đọc Supabase).

## Test
- `node --test` trong `suppliers/`: 269 pass, 0 fail (main trước 249; 8 test mới của `keepFound` + test khác từ main mới nhất).
- `node suppliers/verify.mjs`: 433 bản ghi, 0 có lỗi.

## Rủi ro + quay lui
- Cấu hình giữ lại có thể lỗi thời nếu hãng đổi thông số; mọi check chạy lại qua `check()` nên check không còn kiểm được bị hạ về "chưa rõ", không có "đạt" mới; có `gaps` khi HSMT đổi.
- Cấu hình giữ lại luôn đứng ngoài hạn mức 2/hãng, có thể làm số cấu hình lên >6.
- So khớp cấu hình theo động cơ (+ đầu phát) bằng `keyOf` giống `mergeFind`: biến thể ghi tên động cơ khác (QSL9-G5 / QSL9G5) mà khác đầu phát vẫn là hai cấu hình.
- Quay lui: revert PR (hàm thuần, chỉ thêm 1 lời gọi trong `answer()` và 2 điều kiện `keptFind` trong `rankConfigs`). Sau merge cần restart bot (`GenBid-Bot.ps1` nạp một lần).

## Chưa kiểm
- Chưa chạy `answer()` thật (không agent, không web); kiểm bằng hàm thuần và dữ liệu cache.
- Chưa có trạng thái thật trước 13:00Z của IB2600594596 (xem phát hiện trên) — nên chưa tái hiện đúng số "20 đạt / 3 chưa rõ". Nếu Khoa còn bản đó (Supabase lịch sử) thì chạy lại để so.
- Chưa đếm số gói thật có `fromFind` trên web.
- Nhiều cỡ: logic chọn `prevResult` đúng cỡ nằm sẵn trong `answer()` (`sameSize`), chưa có test cho đường `answer()` (cần agent).
