# Nghiệm thu chuan-hoa-1d (lần 1) — `fuel` chỉ là tiêu hao 100% tải — 14/11/2026

PR (DRAFT): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/784 — nhánh `chuan-hoa-1d` từ main `ffa74ebe` (#783). Không tự merge.

## Tệp đã đổi
`web/catalog.js`, `suppliers/spec-read.test.mjs` (+1 ca). Không đổi baseline, fixture, dữ liệu, `config-bot.mjs`, `spec-norm.js`, `quality.mjs`.

## Thay đổi
`catalog.js`: `OTHER_LOAD` = nhãn có `%` khác 100 / 75 / 50 (25%, 70%, 110%, 80%…), `1/4`, `¼`, `25/50…`; `NOT_FUEL_100` = `NOT_FUEL` + `OTHER_LOAD`, dùng làm mục "loại" của khoá `fuel`. Không thêm khoá mới. 75% / 50% vẫn do `fuel75` / `fuel50` đứng trước.

## Lệnh kiểm
```
node --test suppliers/*.test.mjs web/test/*.test.mjs  → tests 1000, pass 1000, fail 0
node suppliers/verify.mjs                             → 435 bản ghi, 0 có lỗi
node suppliers/quality.mjs --check                    → --check: không chỉ số nào xấu đi quá ngưỡng.
git status                                            → chỉ 2 tệp trên (regress-*, fixtures không đổi)
```

## Nhãn `fuel` mà nhãn nêu mức tải, trước (main ffa74ebe, ĐO trên 63.580 bản ghi)
Mọi nhãn `fuel` có `%` / "load" / 负载 / 载 (26 nhãn): các nhãn 100% hoặc "full load" (22 nhãn) + 4 nhãn mức khác: "Cons. 70%" 220 (tecnogen), "Fuel Consumption 25% load" 24 + "25%负载油耗" 9 (lees-power), "Fuel Consumption 110%" 2 (westinpower), "Fuel consumption @25/50/75/100% load" 1 (hyundai-power-products; một ô liệt kê bốn mức: bỏ).

## Nhãn = giá trị bị bỏ khỏi `fuel` (256 giá trị) — danh sách đầy đủ trong `chuan-hoa-1d-labels.txt`
| Số | Nhãn | NCC |
|---:|---|---|
| 220 | "Cons. 70%" (223, 230, 4, 10.8 …) | tecnogen |
| 24 | "Fuel Consumption 25% load" (15, 17, 21 … 85.50) | lees-power |
| 9 | "25%负载油耗" (113.51, 140.37, 184.20 …) | lees-power |
| 2 | "Fuel Consumption 110%" | westinpower |
| 1 | "Fuel consumption @25/50/75/100% load" = "8.25/13.2/18.7/24.6" | hyundai-power-products |
Kiểm: không một nhãn ghi "100%" / "full load" / không ghi mức tải nào bị bỏ (24 nhãn còn lại trong `fuel` có `%`/load đều là 100% hoặc toàn tải; nhãn không ghi mức, vd "Consumption", "燃油消耗率", "Fuel Consumption Standby", giữ nguyên).

## Giá trị thêm (hệ quả, 34)
- lees-power "Fuel Consumption 100% load" +24, "100%负载油耗" +9: trước đây ô 25% chiếm khoá `fuel` trước (nhãn đầu tiên thắng) nên 100% bị đè; nay `fuel` là 100% đúng nghĩa.
- tecnogen: "Kg" = 1050 vào `weight` +1, "Cylinder" = 4 mất 1 (cùng dòng với "Cons. 70%", đọc lại sau khi bỏ nhãn lệch). Xem dòng tecnogen trong cmp nếu cần.
Số bản ghi 63.580 = 63.580, công suất / tần số / hãng / model: 0 đổi.

## 3 mẫu đối chiếu (dòng trong specTables đã qua verify; chưa mở lại trang gốc)
1. lees-power (nguồn 1122): "Fuel Consumption 25% load | 85.50", "50% load | 158.50", "75% load | 233.25" → chỉ còn fuel50 / fuel75, và "100% load" thành `fuel`.
2. tecnogen: tiêu đề "Cons. 70%" → không còn `fuel`.
3. hyundai-power-products: "Fuel consumption @25/50/75/100% load" = "8.25/13.2/18.7/24.6" → không còn `fuel` (thà bỏ, giá trị đủ bốn mức).

## Rủi ro còn lại + quay lui
- Nhãn mức tải viết bằng chữ ("quarter load", "part load") hoặc không có `%` không bị bắt; không tìm thấy nhãn nào như vậy trong `fuel` hiện tại.
- Nhãn ghi mức tải 70% của tecnogen có thể là tiêu hao thật ở 70%; không có khoá cho nó (không thêm khoá mới theo yêu cầu).
- Quay lui: revert PR.

## Việc chưa kiểm được
- Chưa mở lại trang gốc; không chạy Playwright (không đổi `index.html`).

## Cần ghi nhớ
- `fuel` = 100% tải; nhãn tiêu hao mức khác bị bỏ, không có khoá cho 25% / 70% / 110%.
- Dọn: thư mục `wt-chuan-hoa-1c` chưa gỡ được (lệnh rm bị chặn an toàn vì là thư mục làm việc cũ của session): Khoa/điều phối gỡ tay (`git worktree remove --force ..\wt-chuan-hoa-1c`).
