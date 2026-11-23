# DSE Operator Manual — tiến độ (24/11/2026) — CHƯA TẢI ĐƯỢC, DỪNG

Trạng thái: **chưa tải tệp nào**. Không có `manuals\`, không có `protections.json`. Chưa commit, chưa sửa repo.

## Lý do dừng
- Model đang bán (controllers[] của deep-sea-electronics.json, bỏ DSE8003 MKII là màn hình): DSE3110, 4520 MKII, 6020 MKII, 6110/6120 MKIII, 7310/7320 MKII, 7410/7420 MKII, 8610 MKII, 8660 MKII, 8680 (12 model, dự kiến ~9 sổ tay vì 7310/7320, 7410/7420, 6110/6120... dùng chung).
- Extension Claude in Chrome thấy 2 trình duyệt trên máy:
  - "Browser 1" (đang dùng sẵn): trang `.../dse3110/downloads` hiện nút **Login / LOG IN | REGISTER**, không có Logout → **chưa đăng nhập**. Theo luật an toàn, dừng.
  - "Browser 2": mở tab mới tới trang downloads nhưng trang treo (JS/ảnh chụp timeout 45 s), không kiểm được đã đăng nhập chưa.
- Trang downloads của DSE3110 có mục "DSE3110 OPERATORS MANUAL" (thấy trong text trang).

## Cập nhật lần 2 (sau khi Khoa đăng nhập)
- Browser 1: ĐÃ đăng nhập (có "Log out", không còn "Login"). Lấy được link Operator Manual (9 tệp, tải thử bằng fetch trong trang đều 200 application/pdf):
  DSE3110=operators-manual/31 (1.186.008 B), DSE4520 MKII (chung 4510 MKII)=908 (3.232.977), DSE6020 MKII (DSE60xx)=29 (2.622.422), DSE6110/6120 MKIII=1103 (5.319.796), DSE7310/7320 MKII=855 (5.063.678), DSE7410/7420 MKII=962 (6.287.649), DSE8610 MKII=892 (4.639.700), DSE8660 MKII=1454 (3.929.586), DSE8680=93 (1.414.030). Đường dẫn: `/genset/<danh-mục>/<model>/downloads/operators-manual/<id>`.
- NHƯNG tệp KHÔNG về được máy này: bấm tải (anchor blob + điều hướng thẳng) không thấy tệp ở `C:\Users\Khoa\Downloads` hay đâu trên ổ đĩa; trang cũng không gọi được `http://127.0.0.1` (cả no-cors) → Browser 1 nhiều khả năng chạy trên máy khác / profile khác (list_connected_browsers chỉ Browser 2 có `onThisComputer`).
- Browser 2 (cùng máy này): treo mọi lệnh JS/ảnh chụp, không xác định được đã đăng nhập chưa.
- Bước phụ (đã dọn): máy chủ nhận tệp `manuals\receive.js` (127.0.0.1:8765) đã tắt tiến trình; tệp script còn nằm trong `manuals\`.

## Việc cần Khoa
Đăng nhập deepseaelectronics.com trong trình duyệt mà extension điều khiển (hoặc cho biết Browser 1/2 là cái nào là Edge đã đăng nhập), rồi gọi lại phiên này.
Dữ liệu sau này sẽ nằm ở `genbid-work\dse-datasheets\manuals\` (ngoài git, repo public nên KHÔNG đưa vào git).
