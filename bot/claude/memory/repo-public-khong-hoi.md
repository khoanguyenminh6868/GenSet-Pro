---
name: repo-public-khong-hoi
description: Repo GenSet-Pro PUBLIC tạm tới 01/12/2026 (hết phút Actions tháng 11), tác vụ hẹn giờ tự chuyển về private
metadata:
  node_type: memory
  type: project
  originSessionId: 712171b8-1398-4e8a-b507-1e2692a83bce
  modified: 2026-11-17T09:23:20.238Z
---

Repo GenSet-Pro public từ 05/11/2026 (để CI không tính phút). 17/11 Khoa bảo chuyển private; chuyển xong thì Actions từ chối
mọi job ("payments failed / spending limit"): 2.000 phút miễn phí tháng 11 của tài khoản đã hết (~1.670 phút chỉ riêng
01–05/11 khi repo còn private; hạn mức chung cho mọi repo private của tài khoản, kể cả 247power.vn). Khoa chọn: **public tạm
tới 01/12/2026**, rồi private lại. Tác vụ hẹn giờ `genset-repo-private-0112` (08:07 sáng 01/12, giờ VN) tự chuyển private, thử
một workflow; vẫn bị từ chối thì để public và báo Khoa.

Cùng ngày đã cắt CI (#855) để vừa 2.000 phút/tháng (dự kiến ~1.000–1.300): workflow test chỉ chạy trên PR, `concurrency` huỷ
lượt cũ, PR chỉ sao lưu bộ nhớ (`bot/claude/**`) không chạy test, Pester Windows chỉ khi sửa `.ps1` / `bot/test/`.

**Why:** Khoa muốn repo private (bộ nhớ nội bộ: lý do bị loại thầu, cách tính giá), nhưng không trả thêm phút Actions.

**How to apply:** trong lúc public, không hỏi lại về bảo mật repo. Đừng thêm trigger `push`/`schedule` tốn phút cho workflow mới.
Sau khi private, CI bỗng không chạy giữa tháng → nghi hết phút (github.com/settings/billing/usage), báo Khoa. Vẫn không đưa
token / khoá vào git ([[bot-ops]]).
