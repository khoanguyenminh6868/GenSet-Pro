# Nghiệm thu: nhãn "Công suất chưa xác nhận" (việc 2)

- PR (DRAFT, chưa merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/842 — nhánh `nhan-cong-suat`
- Tệp đổi: `web/index.html` (hằng `CFG_POWER_ITEM/NOT`, `cfgPowerUnclear`, `cfgPowerChip`, chip trong `<summary>` thẻ cấu hình), `web/test/static.test.mjs` (+1 ca), `web/test/power-label.spec.mjs` (mới). KHÔNG đụng `catalog.js`, `config-bot.mjs`.

## Hành vi
Thẻ hiện chip vàng "Công suất chưa xác nhận" ngay sau chip kết quả, trong tiêu đề thẻ (thấy cả khi thẻ thu gọn), khi có mục kiểm: tên chứa "công suất/power", không phải công suất động cơ / đầu phát / hệ số / quá tải, không thuộc `part` engine/alternator, và `cfgGridSt` = "unclear" (trạng thái chưa rõ, hoặc "đạt" nhưng chưa khớp nguồn). Không sort, không ghi dữ liệu.

## Kiểm (đầu ra thật)
- `node --test web/test/*.test.mjs`: 159 pass, 0 fail (có ca static mới: đúng/sai cho 4 mục bị loại, `confirm`, `met`).
- Playwright (Edge, `PW_CHANNEL=msedge`) `power-label.spec.mjs`: 2 passed — desktop 1366 và 375 px: đúng 1 thẻ có nhãn (#2), thẻ #1 không có, thứ tự thẻ giữ nguyên, nhãn nằm trong màn hình, trang không tràn ngang.
- Toàn bộ Playwright: 79 passed, 1 failed lần đầu (`requests.spec.mjs` "nhịp tim 3 phút 30 giây", ca theo thời gian); chạy riêng lại đạt → chập chờn, không liên quan thay đổi.
- Dữ liệu thử: seed gói IB2600586587, thẻ #2 được patch "Công suất liên tục" → `unclear` ngay trong spec (seed không đổi).

## Ảnh chụp (`nghiem-thu/anh-nhan-cong-suat/`)
`the2-co-nhan-375.png`, `the2-co-nhan-1366.png` (có nhãn), `the1-khong-nhan-375.png`, `the1-khong-nhan-1366.png` (không nhãn).

## Số đo / 3 mẫu nguồn
Không áp dụng (chỉ hiển thị, không đổi dữ liệu). Chưa kiểm trên dữ liệu Supabase thật (chỉ seed thử).

## Rủi ro / quay lui
Chip dài hơn có thể xuống dòng ở 375 px (đã thấy xuống dòng gọn, không tràn). Quay lui: revert PR. Nhãn dựa vào tên mục kiểm; mục công suất đặt tên lạ (không có chữ "công suất/power") sẽ không có nhãn.

## Cần ghi nhớ
Không có.
