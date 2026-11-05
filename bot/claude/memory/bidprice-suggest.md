---
name: bidprice-suggest
description: "Gợi ý giá đấu (bidprice-bot.mjs + web/bidprice.js): luồng, quy tắc chọn gói tương tự Khoa chốt, việc còn dở"
metadata:
  node_type: memory
  type: project
  originSessionId: 93e41953-82a9-4265-a2a5-f081042fd87d
  modified: 2026-11-04T13:21:01.195Z
---

**Luồng:** web gửi `bidpricereq/<TBMT>` (hoặc tự động sau Gợi ý cấu hình, `autoBidprice`) → `config-bot.mjs run` chạy `suppliers/bidprice-bot.mjs run --key` thành tiến trình con (sửa script không cần restart bot) → `bidprice/<TBMT>`. Code chọn gói cũ từ `bidhist` (`candidates` trong `web/bidprice.js`, dùng chung web+bot) → agent Claude Opus (`bidprice-prompt.md`) xếp mỗi gói giống/gần/khác/không đủ thông tin kèm câu trích nguyên văn từ chính mục `S…` đó → `check` bỏ gói có câu trích không khớp → `suggest` tính 3 mức giá (phân vị 25/50/75 tỷ lệ giá trúng/giá gói) chỉ từ gói ≥2 nhà thầu, cần ≥3 gói. Agent không ghi số tiền. Thử không đăng: `bidprice-bot.mjs try --key K --kva N --price P`.

**Quy tắc chọn gói tương tự (Khoa chốt 2026-11-03, PR #279, #280):**
- Công suất lệch ≤5% (`POWER_TOL`); xếp theo công suất, giá gói, độ giống cấu hình HSMT (`profileOf`/`compareCfg`: hãng động cơ/đầu phát/BĐK được nêu, vỏ cách âm, ATS, hoà đồng bộ, bồn dầu ngoài, trạm biến áp, 1 pha), cùng chủ đầu tư. KHÔNG xét hình thức đấu thầu, tuổi gói.
- Bỏ gói có động cơ khác nhóm (Trung Quốc / ngoài TQ) với động cơ cấu hình hạng 1 của Gợi ý cấu hình (chưa có thì theo HSMT). Nhóm gói cũ: `goodsGroup` chỉ đọc hàng là máy phát (bỏ cáp/ATS/MBA), không có thì dòng HSMT về động cơ/tổ máy.
- Gói di dời/lắp lại máy cũ KHÔNG vào ứng viên: `bidKind` "move" theo tên (trừ khi tên có mua sắm/trang bị/đầu tư); `movesOldSet` theo HSMT khi hàng trúng không có máy phát. Dịch vụ (sửa chữa, đại tu, trung tu, giám sát thi công, thuê, vật tư…) = "svc".
- samples.md có dòng "So cấu hình (code)" chỉ để gợi ý cho agent, không được chép làm câu trích.

**Thực tế:** mỗi gói chỉ ~14–30 ứng viên (< MAX 80), nên thứ tự xếp gần như không đổi kết quả; lọc (nhóm, loại gói) và dòng so cấu hình mới có tác dụng. Thử IB2600574589: 16 ứng viên, 0 câu trích sai, trung vị 75% giá gói. Bẫy: script import config-bot.mjs không được import ngược từ config-bot (#249, node thoát 13, kẹt `genbid-config.lock`).

**Gói nhiều cỡ máy (Khoa 04/11: chạy riêng từng cỡ như Gợi ý cấu hình, PR #332):** cỡ lấy từ `configmatch.result.sizes`, không có thì `sizesFor`. Giá gói chia theo số lượng × kVA^0,7 (`sharesOf`; đơn giá trúng bidhist cho mũ 0,69; lệch trung vị 8 điểm % trên 6 gói có đơn giá từng máy — dùng đơn giá/giá gói chia số máy của gói cũ lệch 12–51 vì thiếu số lượng). Mỗi cỡ chạy như gói riêng (basis.qty, perKva × số máy), `bidprice.result = {multi, sizes[{share,result}], levels (tổng các cỡ)}`; web `bidPriceMultiHtml`. Gói cũ cũng có thể nhiều cỡ: prompt dặn xếp "khác" trừ khi các cỡ gần trùng.

**Còn dở / Khoa chưa chọn:** giá riêng theo từng cấu hình/nhóm xuất xứ (ý 2); đưa hàng trúng `bidhist` sang xếp hạng cấu hình + cảnh báo giá không khả thi (ý 3–4); Gợi ý lại cấu hình nên tự gửi lại yêu cầu giá; gói "cải tạo…" kèm máy phát vẫn lọt (agent xếp khác). Kết quả bidprice trên web trước 03/11 tối là code cũ. Chưa kiểm nút thật trên Vercel.

Liên quan [[config-suggest]], [[session-log]].
