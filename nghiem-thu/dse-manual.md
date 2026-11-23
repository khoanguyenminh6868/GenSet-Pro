# DSE Operator Manual — tiến độ (24/11/2026) — CHƯA TẢI ĐƯỢC, DỪNG

Trạng thái: **chưa tải tệp nào**. Không có `manuals\`, không có `protections.json`. Chưa commit, chưa sửa repo.

## Lý do dừng
- Model đang bán (controllers[] của deep-sea-electronics.json, bỏ DSE8003 MKII là màn hình): DSE3110, 4520 MKII, 6020 MKII, 6110/6120 MKIII, 7310/7320 MKII, 7410/7420 MKII, 8610 MKII, 8660 MKII, 8680 (12 model, dự kiến ~9 sổ tay vì 7310/7320, 7410/7420, 6110/6120... dùng chung).
- Extension Claude in Chrome thấy 2 trình duyệt trên máy:
  - "Browser 1" (đang dùng sẵn): trang `.../dse3110/downloads` hiện nút **Login / LOG IN | REGISTER**, không có Logout → **chưa đăng nhập**. Theo luật an toàn, dừng.
  - "Browser 2": mở tab mới tới trang downloads nhưng trang treo (JS/ảnh chụp timeout 45 s), không kiểm được đã đăng nhập chưa.
- Trang downloads của DSE3110 có mục "DSE3110 OPERATORS MANUAL" (thấy trong text trang).

## Việc cần Khoa
Đăng nhập deepseaelectronics.com trong trình duyệt mà extension điều khiển (hoặc cho biết Browser 1/2 là cái nào là Edge đã đăng nhập), rồi gọi lại phiên này.
Dữ liệu sau này sẽ nằm ở `genbid-work\dse-datasheets\manuals\` (ngoài git, repo public nên KHÔNG đưa vào git).
