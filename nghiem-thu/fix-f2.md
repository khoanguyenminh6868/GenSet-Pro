# Nghiệm thu F2 — 3 lỗi nhỏ từ đợt phủ test 13/11/2026

PR nháp: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/632 (nhánh `fix/f2-small-bugs`, 3 commit trên origin/main 8dc14822). Không tự merge.

## Tệp đã đổi
1. `suppliers/config-bot.mjs`, `suppliers/regress-config.test.mjs` (+1 ca), `suppliers/fixtures/runs/{IB2600594596/config-1,IB2600601812/config,IB2600603983/config}.expected.json`
2. `web/api/blob.js`, `web/api/test/small.test.mjs` (bỏ `todo`)
3. `suppliers/named-genset.mjs` (regex `[^.]*` → `.*?`), `suppliers/cover-named.test.mjs` (bỏ `todo`)

## Lỗi 1 — cách sửa
- Trong `check`, vòng kiểm từng check: check có `byCode` (do code đặt: Đồng bộ thương hiệu, quá tải theo quy tắc, cosφ = kW/kVA…) bỏ qua kiểm câu trích HSMT / câu trích nguồn / số; vẫn qua bước đặt lại `confirm → unclear` ở đầu vòng (confirmChecks quyết lại như cũ).
- Chống agent tự khai: `byCode` chỉ do code đặt (cả ~15 chỗ trong config-bot). Câu trả lời thô của agent vào `check` qua đúng 2 đường: `checkDir` (result.json) và `mergeChecked` (Tìm NCC / điền checks) → cả hai gọi `stripAgentCodeFlags` gỡ `byCode` khỏi requirements, checks, parts trước khi `check`. Đường kết quả đã lưu (keepFound, Gợi ý lại, restore-web) không qua hai chỗ này nên giữ cờ do code đặt.
- Ca test mới: agent gắn `byCode` vào check có câu trích bịa → `mergeChecked` vẫn báo cùng số điểm chưa khớp như check không gắn cờ.

## Số đo (ĐO, `node scratchpad\measure.mjs`: `check` + `rankConfigs` bản trước/sau, cùng dữ liệu)
Số "điểm chưa khớp nguồn" (`problems`), trước → sau:
- 5 lượt fixture (6 mục): 586587 0→0; 592684-1 0→0; 592684-2 0→0; **594596-1 9→0; 601812 6→0; 603983 5→0**. Tổng 20→0.
- 13 configmatch (22 kết quả theo cỡ máy), dùng NCC 433 của doc-cache, `hsmtText` rỗng (HSMT cả bộ không còn lưu cho các gói này → số tuyệt đối nhiễu vì câu trích HSMT đều "không khớp", chỉ so tương đối): tổng 1975→1862; giảm ở 586587 182→172, 592684-1 278→259, 592684-2 115→107, 594596-1 230→201, 594596-2 94→93, 601812 303→277; các gói còn lại không đổi.
- **0 trạng thái check đổi, 0 thứ hạng đổi, số check không đổi** trên cả 28 kết quả (so từng check theo vị trí).

## Mẫu hồi quy đổi có chủ ý
`GENBID_REGRESS_UPDATE=1`; `git diff suppliers/fixtures/runs` chỉ có 3 dòng `"problems": 9→0, 6→0, 5→0` (3 tệp expected). Không dòng nào khác (hạng, trạng thái, NCC, giá không đổi). Lý do: 20 điểm trước là check byCode bị đếm nhầm, đúng điểm 1 mục "Xem tay" của test-t4.

## Lỗi 2, 3
- blob: `id` "." hoặc ".." → 400 (trước: chuyển hướng tới `/blobs/..`). Ca `todo` đã bỏ, pass.
- brandLicensedChecks: gọi 2 lần với "GRV POWER PRODUCTS, S.L." chỉ còn 1 câu "Code ghi:". Ca `todo` đã bỏ, pass.

## Lệnh kiểm + đầu ra thật
- `node --test suppliers/*.test.mjs` → tests 777, pass 772, fail 0, todo 5 (của việc khác).
- `node --test web/api/test/*.test.mjs` → tests 162, pass 162, fail 0, todo 0.
- `node --test suppliers/regress-config.test.mjs` → pass 8, fail 0.
- CI PR #632: api, app, server, suppliers đều pass.

## Rủi ro còn lại + quay lui
- Check byCode không còn bị kiểm câu trích: nếu code ghi sai `sourceQuote` cho check byCode thì không còn bị phát hiện ở lần chạy lại (lần tạo ban đầu vẫn do chính code viết, không qua quote). Test hồi quy khoá phần còn lại.
- Bảng đo 13 configmatch không có HSMT nên chỉ chứng minh không đổi trạng thái/hạng, không chứng minh số tuyệt đối.
- Quay lui: revert từng commit (độc lập nhau).

## Việc chưa kiểm được
- 3 mẫu đối chiếu nguồn gốc: sửa này không đổi dữ liệu NCC/giá nên không có mẫu nguồn.

## Cần ghi nhớ
- Không có.
