# Nghiệm thu: Gợi ý giá chuyên môn — PR 2 (giao diện)

- PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/505 (DRAFT, nhánh `bidprice-expert-ui`, rebase trên origin/main 5633f65, đã có #502, #503, #504)
- Làm theo quyết định của điều phối (10/11): giá theo nhóm chỉ hiện với nhóm `foreign`, là dòng tham khảo, ghi "chưa qua bước so cấu hình"; gói chưa có contractTerms thì một dòng "Phân tích lại…"; lắp đặt / ống xả chỉ gợi ý khi HSMT nêu thành hạng mục riêng.

## Tệp đã đổi
| Tệp | Nội dung |
|---|---|
| `web/index.html` | `costHintsOf`/`costHintsHtml` (dưới Chi phí phát sinh), `askQuoteCost(key, preset)`, `quoteStaleChip`, `financeOf`/`financeHtml`/`askFinance`, cảnh báo `feasibility` + báo giá cũ trong `profitHtml` (giá vốn cộng chi phí vốn), `bpConfigHtml` (chỉ foreign) trong `bidPriceHtml`, `rivalsHtml` ở Tổng quan sau `competeHtml`; CSS `.qhints .finbox .fintable .frisk .rself .bpcfg`; `askQuoteAll` và lưu Chi phí phát sinh giữ các trường khác của tài liệu |
| `web/bidprice.js` | `costHints`: `OWN_ITEM` (lắp đặt, ống xả chỉ khi tên mục Thông số kỹ thuật nêu); số/% trong câu dạng Việt (0,5%/ngày; 108,9%) |
| `suppliers/bidprice.test.mjs` | test hạng mục riêng; sửa kỳ vọng định dạng |

Grep trước khi thêm: không có hàm trùng tên (`rivalsHtml`, `financeHtml`, `askFinance`, `costHintsHtml`, `costHintsOf`, `quoteStaleChip`, `bpConfigHtml`, `financeOf`). Mọi chỗ ghi dùng `dbSet`/`saveQuote` như code hiện có (updated_at do tầng DB/shim đặt như các chỗ ghi quote khác). Vòng qua `state.quote` vẫn qua `quoteLedger` (bỏ khoá `_`). Câu trích (`quote`/`basis`) chỉ in khi `SHOW_SRC`.

## Lệnh kiểm + đầu ra thật
```
node --test suppliers/*.test.mjs        (sau rebase lên main mới)
# pass 173
# fail 0
node -e '…new Function(script)…'        → ok (2 khối script của index.html không lỗi cú pháp)
```
Thử cục bộ: `serve.js` (bản sao của serve.js phiên trước + seed thêm) phục vụ `wt-gia-ui/web` ở cổng 8795, DB giả. Seed: gói IB2699000001 mang Phân tích thật của IB2600594596 (có contractTerms), lãi 9%, 90 ngày, một dòng giá ngày 2026-03-01, bidprice có `byConfig` foreign (số giả để vẽ); gói IB2699000002 mang Phân tích của IB2600586587 bỏ contractTerms. Console không lỗi.

Đã bấm thử thật:
- "+ Vỏ cách âm" → hộp Chi phí phát sinh mở với dòng "Vỏ cách âm", con trỏ ở ô số; nhập 120.000.000, Lưu → ghi `quote/IB2699000001.cost` = `{fx, extras:[…, {Vỏ cách âm, vnd, 120000000}], days: 90}` (giữ `days`), nút đổi thành "✓ Vỏ cách âm".
- "Lãi suất, số ngày" → 10%, 120 ngày, Lưu → `quote/_cost` = `{fx:{CNY,EUR,USD}, vat:8, rate:10, …}` (giữ tỷ giá, thuế), `quote/IB2699000001.cost.days = 120` (giữ extras); dòng tóm tắt đổi thành "Lãi suất vay 10%/năm · thực hiện hợp đồng 120 ngày · cộng vào giá vốn 30,6 triệu".
- Đẩy giá vốn lên trên giá gói → "Giá gói khó khả thi. Giá vốn cộng chi phí vốn 5.565.390.130 đ (giá vốn 5.539.000.000 đ + chi phí vốn 26.390.130 đ) bằng 108,9% giá gói 5.108.670.000 đ: không thể bỏ giá dưới giá gói mà có lãi."
- Gói không có contractTerms → "Chi phí vốn: Phân tích lại để đọc điều khoản hợp đồng (tạm ứng, thanh toán, bảo đảm hợp đồng, bảo hành)." (không có bảng trống).
- Điện thoại 375 px: không cuộn ngang (scrollWidth 375), bảng chi phí vốn và đối thủ thành thẻ một cột.

## Ảnh chụp (`genbid-work\dieu-phoi\nghiem-thu\gia-chuyen-mon-2-anh\`)
1. `1-desktop-khoan-chi-goi-y.jpg` — nút khoản chi gợi ý dưới Chi phí phát sinh
2. `2-desktop-gia-von-canh-bao-chi-phi-von.jpg` — giá vốn gồm chi phí vốn, cờ báo giá cũ, cảnh báo không khả thi, bảng chi phí vốn, "✓ Vỏ cách âm"
3. `3-desktop-gia-tham-khao-ngoai-tq.jpg` — dòng "Tham khảo — nếu chào cấu hình #3 (động cơ Cummins…)" dưới 3 mức giá
4. `4-desktop-doi-thu.jpg` — mục Đối thủ (Tổng quan)
5. `5-mobile-chi-phi-von.jpg`, 6. `6-mobile-doi-thu.jpg`

## Số đo
Không có chỉ số mới cho PR giao diện (backtest không đổi: logic giá không đổi). Khoản chi gợi ý trên 3 gói mẫu của PR 1 sau quy tắc hạng mục riêng:
- IB2600586587: bỏ "Ống khói, giảm thanh" (chỉ có "Ống xả" trong Phụ kiện đi kèm); "Lắp đặt, xây móng" vẫn còn vì HSMT có mục riêng "Lắp đặt, chạy thử".
- IB2600594596: bỏ "Lắp đặt" (chỉ trong "Phạm vi công việc"); "Ống khói" vẫn còn (mục riêng "Ống thoát gió nóng, ống khói").
- IB2600592684: không đổi (vỏ cách âm, kiểm định, bảo hành 24 tháng).

## Rủi ro còn lại + quay lui
- Bảo đảm và phạt tính trên giá gói (giá dự thầu chưa biết) → hơi cao hơn thật; ghi rõ trong chú thích code, câu trên web ghi "giá dự thầu".
- Số ngày thực hiện lưu theo gói (`quote/<key>.cost.days`), không lưu chung ở `quote/_cost` như brief viết, vì mỗi gói có thời hạn khác nhau; lãi suất lưu chung. Điều phối đổi được nếu muốn.
- Ô số dùng `numIn` như các ô khác: "9.5" bị hiểu là 95 (dấu chấm là phân cách nghìn) → lãi suất > 50% bị chặn, báo "vd 9"; nhập "9,5" đúng.
- "Động cơ khi trúng" của đối thủ đọc hãng trong dòng hàng trúng (ENGINE_BRANDS), có thể bắt nhầm chữ trùng tên hãng (vd FPT).
- Quay lui: revert squash commit của PR; dữ liệu mới (`quote/_cost.rate`, `quote/<key>.cost.days`) là trường thêm, code cũ bỏ qua.

## Chưa kiểm được
- Trên Vercel thật (chưa merge); với kết quả `bidprice` thật có `byConfig` (cần bot chạy lại một gói sau #503).
