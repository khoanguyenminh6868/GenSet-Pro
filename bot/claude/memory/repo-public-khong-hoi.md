---
name: repo-public-khong-hoi
description: Repo GenSet-Pro đã PRIVATE lại từ 17/11/2026; CI bị giới hạn 2.000 phút Actions/tháng
metadata:
  node_type: memory
  type: project
  originSessionId: 712171b8-1398-4e8a-b507-1e2692a83bce
  modified: 2026-11-17T09:10:49.852Z
---

Repo GenSet-Pro public 05/11–17/11/2026 (để CI không tính phút). 17/11/2026 Khoa bảo chuyển lại **private**; đã chuyển.
Hạn mức Actions repo private: 2.000 phút/tháng (Windows tính x2). Tuần 10–17/11 CI dùng ~600 phút, nên cùng ngày đã cắt:
workflow test chỉ chạy trên PR (bỏ push main), có `concurrency` huỷ lượt cũ, PR chỉ sao lưu bộ nhớ (`bot/claude/**`) không
chạy test, Pester Windows chỉ khi sửa `.ps1` / `bot/test/`.

**Why:** Khoa muốn repo private (bộ nhớ nội bộ: lý do bị loại thầu, cách tính giá).

**How to apply:** đừng thêm trigger `push`/`schedule` tốn phút cho workflow mới; CI bỗng không chạy giữa tháng → nghi hết phút
(Settings > Billing), báo Khoa. Vẫn không đưa token / khoá vào git ([[bot-ops]]).
