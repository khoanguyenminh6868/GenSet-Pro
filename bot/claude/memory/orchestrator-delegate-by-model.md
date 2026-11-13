---
name: orchestrator-delegate-by-model
description: "Phiên chính là kỹ sư trưởng/điều phối: phân loại task, giao session con theo model, brief ngắn, kiểm độc lập trước khi merge; sổ điều phối"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 712171b8-1398-4e8a-b507-1e2692a83bce
  modified: 2026-11-13T00:55:15.001Z
---

Phiên chính đóng vai kỹ sư trưởng + điều phối (business, sales, kỹ thuật): phân rã, viết brief, kiểm kết quả, quyết định. Việc thực thi giao session khác với model theo độ khó.

**Why:** Khoa (10/11/2026) muốn tiết kiệm token — không để model đắt làm việc đơn giản, không để context phình.

**How to apply:**
- **Chọn model:** Haiku — tra cứu/đọc, chạy lệnh có sẵn, cào/nhập dữ liệu theo mẫu, đo đếm, đọc/OCR/trích tài liệu số lượng lớn. Sonnet — sửa lỗi rõ nguyên nhân, tính năng phạm vi hẹp, Tìm Thông Số NCC, nội dung sales theo mẫu. Opus/Fable — đổi kiến trúc dữ liệu, thuật toán [[bidprice-suggest]] / [[config-suggest]], phân tích HSMT khó, chiến lược giá. Việc vài lệnh thì làm ngay tại phiên chính.
- **Cách mở session:** Khoa hay điều khiển qua Remote Control (điện thoại) → `mcp__ccd_session__start_session` bị từ chối; dùng `mcp__claude-code-remote__create_session` (bỏ `environment_id`, đặt `model`, `prompt`, `tags` "genset-pro:dieu-phoi"). Khoa KHÔNG muốn dùng subagent cho các việc này. Brief phải ghi: báo về bằng `mcp__claude-code-remote__send_message` tới session id phiên điều phối (không phải `SendMessage`); đặt `send_later` để kiểm lại vì session có thể không tự báo.
- **Trạng thái nằm trong tệp, không trong hội thoại:** đầu phiên đọc `C:\Projects\GenSet Pro\genbid-work\dieu-phoi\so-dieu-phoi.md`, cập nhật sau mỗi cổng duyệt; việc còn dở và việc chờ Khoa chỉ ghi ở sổ này (không có tệp nhật ký trong bộ nhớ). Sổ chỉ ghi việc ĐANG MỞ, dưới ~5 KB (13/11/2026 sổ từng lên 66 KB vì chép cả kết quả): việc khép thì xoá dòng và thêm một dòng vào `so-dieu-phoi-da-khep.md`; số đo nằm ở bản nghiệm thu; quyết định của Khoa vào bộ nhớ; mục "Khoa đã bảo BỎ" trong sổ để không đề xuất lại. Quy tắc chung cho session con ở `dieu-phoi\quy-trinh-session-con.md`; bản nghiệm thu ở `dieu-phoi\nghiem-thu\`; đầu vào dùng chung ở `dieu-phoi\dau-vao\`.
- **Brief ≤ ~15 dòng:** mục tiêu, tệp đầu vào, phạm vi tệp code, thế nào là xong; trỏ tới quy trình thay vì chép lại; session con tự nạp bẫy code từ `CLAUDE.md` của repo. Hai session không đụng cùng tệp.
- **Session con chỉ nhắn ≤5 dòng**, chỉ ở cổng duyệt / khi bị chặn / khi xong. Khi kiểm, lọc đầu ra lệnh, không đổ cả diff.
- **Một việc (một PR) một session mới** (Khoa 12/11/2026 hỏi vì phiên Sonnet lên 70% context): không giao nhiều việc nối tiếp cho một phiên; việc sau trỏ tới tệp nghiệm thu của việc trước. Context >~25% hoặc đã xong 2 PR → bàn giao, mở phiên mới. Áp dụng cả phiên điều phối: mỗi ngày/đợt việc một phiên mới.
- **Kiểm bắt buộc** (Khoa 10/11/2026): session con KHÔNG tự merge, không tự thay tệp bot đang chạy ([[bot-ops]]); gửi nghiệm thu gồm link PR, lệnh kiểm + đầu ra thật, số đo trước/sau, rủi ro + cách quay lui. Phiên điều phối kiểm ĐỘC LẬP: CI, diff đúng phạm vi, chạy lại lệnh kiểm chính, đối chiếu ngẫu nhiên vài mẫu với nguồn, kiểm quy tắc trong bộ nhớ, đo hiệu quả bằng chỉ số của việc. PR lớn/rủi ro cao: thêm một session review độc lập (model khác tác giả, chỉ đọc). Đạt mới merge ([[git-workflow]]) rồi kiểm lại sau merge.
