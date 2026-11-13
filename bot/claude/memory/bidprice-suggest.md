---
name: bidprice-suggest
description: "Giá gợi ý (bidprice-bot.mjs + web/bidprice.js) và sổ báo giá: quy tắc Khoa chốt chọn gói tương tự, số liệu thị trường, điều đã thử không hiệu quả, việc chờ quyết"
metadata:
  node_type: memory
  type: project
  originSessionId: 712171b8-1398-4e8a-b507-1e2692a83bce
  modified: 2026-11-13T00:29:03.871Z
---

**Luồng:** `bidpricereq/<TBMT>` (web, hoặc tự gửi sau mỗi lượt Gợi ý cấu hình) → `suppliers/bidprice-bot.mjs run --key` → `bidprice/<TBMT>`. Code chọn gói cũ từ `bidhist` (`web/bidprice.js`, dùng chung web + bot) → agent Opus xếp mỗi gói giống/gần/khác kèm câu trích nguyên văn → 3 mức giá = phân vị tỷ lệ giá trúng/giá gói, chỉ từ gói ≥2 nhà thầu, cần ≥3 gói. Agent không ghi số tiền và giữ mức đã xếp ở lượt trước (buộc xếp lại: `GENBID_BIDPRICE_RERATE=1`). Thử không đăng: `bidprice-bot.mjs try --key K --kva N --price P`. Hậu kiểm: `suppliers/bidprice-backtest.mjs`.

## Quy tắc Khoa chốt (chọn gói tương tự)
- Công suất lệch ≤5% (10% khi HSMT đòi đồng bộ thương hiệu), so cùng mức liên tục/dự phòng. Xếp theo công suất, giá gói, độ giống cấu hình HSMT, cùng chủ đầu tư. KHÔNG xét hình thức đấu thầu, tuổi gói.
- Bỏ gói có động cơ khác nhóm xuất xứ (TQ / ngoài TQ; hãng ngoại sản xuất tại TQ so được với cả hai) với cấu hình hạng 1 của Gợi ý cấu hình.
- Bỏ gói di dời/lắp lại máy cũ, gói dịch vụ, gói có tổ máy hãng/xuất xứ Việt Nam.
- Gói đòi đồng bộ thương hiệu: gói cũ tổ máy lắp ráp → "khác".
- Gói nhiều cỡ máy: chạy riêng từng cỡ, giá gói chia theo số lượng × kVA^0,7.
- Chỉ dùng gói có cạnh tranh (≥2 nhà thầu).

## Báo giá NCC và giá vốn (web)
- Tỷ giá + thuế GTGT lưu MỘT lần ở `quote/_cost` cho mọi gói; mọi vòng lặp qua `state.quote` phải bỏ khoá bắt đầu bằng `_`; lưu `quote/*` phải giữ trường khác (`{...cũ, ...mới}`). Không đoán tỷ giá.
- Giá vốn chỉ lấy báo giá mà mọi dòng khớp hãng HSMT chỉ định. Báo giá >180 ngày là cũ.
- Chữ trên màn hình: "Chi phí phát sinh" (không dùng "khoản thêm"). Danh sách gợi ý tự vẽ, không dùng `<datalist>` (Khoa chê xấu). Web ghi "% gói cũ trúng ≥ mức này", không gọi là xác suất thắng.
- Bot chưa đọc tệp báo giá ra dòng giá (đang nhập tay).

## Số liệu thị trường (bidhist, đo 09/11, 1.627 lô)
- Giá trúng/giá gói trung vị 0,962; quyết định chủ yếu bởi SỐ NHÀ THẦU (1 nhà thầu 0,991 → ≥7 nhà thầu 0,782); 32% lô chỉ 1 nhà thầu. TQ 0,856 vs ngoài TQ 0,950. Năm không tạo xu hướng.
- Đơn giá theo kVA sai ±64% → neo vào giá gói (sai trung vị 6%).
- 28% lượt dự thầu bị loại kỹ thuật/năng lực. 50% lô có chủ đầu tư từng mua; 46% trong đó người thắng cũ thắng lại.
- Thảo Nguyên 71 lượt: 18 trúng, 26 thua giá (cao hơn người thắng trung vị 7,1% giá gói), 17 bị loại kỹ thuật; khi trúng cách người kế 1,8%.
- Hàng trúng hiếm khi ghi model: 5% ghi model động cơ, 56% ghi hãng tổ máy.

## Đã thử, không hiệu quả (đừng làm lại)
- Dự báo số nhà thầu: chỉ chủ đầu tư, tỉnh, lĩnh vực có ích và chỉ là xu hướng (~42% đúng); giá gói, hình thức, công suất, G7 không giúp.
- Lệch ở gói TQ (+7 điểm) và gói ≥6 nhà thầu (+12,5) không sửa được bằng dữ liệu trước đóng thầu (hồi quy về trung bình).
- Phân vị nội suy: ngoài mẫu kém hơn. Hiện phủ khoảng [thấp, cao] ~62%, sai mức giữa ~5,7 điểm.
- Mức thấp dao động giữa các lượt là do agent lật một gói ranh giới trong pool 7–8 gói, không phải lỗi code.
- Giá theo nhóm cấu hình chỉ tốt hơn với nhóm ngoài TQ.

## Chờ Khoa quyết
- Thêm gói 1 nhà thầu theo dự báo (giảm sai 5,7 → 4,7 nhưng trái quy tắc "chỉ gói có cạnh tranh").
- Phân vị nội suy (em nghiêng không làm).
- Gói đòi đồng bộ thương hiệu thường thiếu gói cũ tương tự → không ra giá.

**Bẫy:** `numIn` coi "." là phân cách nghìn. Thử giao diện: mở gói bằng `#goi/<TBMT>` rồi bấm tab; xoá localStorage `genbid:capScan` sau khi đổi dữ liệu thử.

Liên quan [[config-suggest]], [[session-log]].
