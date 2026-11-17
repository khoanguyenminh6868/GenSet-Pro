---
name: kiem-cheo-toan-bo
description: "Sửa mã đọc dữ liệu thì kiểm chéo TOÀN BỘ bản ghi và mọi dòng vào / ra top 30, không lấy mẫu (Khoa 17/11/2026)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: e29b519c-5c26-49eb-b979-b2c611c0a295
  modified: 2026-11-17T20:59:06.735Z
---

Khoa 17/11/2026, khi duyệt sửa lỗi đọc lệch dòng / cột: "cần cross check toàn bộ chứ không phải chỉ làm vài mẫu. Làm kỹ coi chừng sai".

**Why:** dữ liệu có số (công suất, khối lượng, giá) sai một dòng là sai cấu hình / giá gợi ý; lấy mẫu từng bỏ sót.

**How to apply:** sửa `web/catalog.js` hay bot đọc bảng → so MỌI trường của MỌI bản ghi trước ↔ sau, gom theo dạng thay đổi và xem hết từng dạng; đo top 30 toàn bộ gói rồi giải thích TỪNG dòng vào / ra (lượt mà không dòng nào tự đổi thì chạy lại bằng mã cũ và mới, so điểm / luật loại). Script sẵn ở `genbid-work\dieu-phoi\dau-vao\ra-soat-lech-dong-cot\` (cmpSpec, verSpec, swap, gopWhy2, gopRow, gopRowCmp, engFacts). Xem thêm [[quy-tac-luong]].

Mẹo máy này: `git push --force-with-lease` trần bị từ chối (không có ref remote-tracking của nhánh) → `git push "--force-with-lease=<nhánh>:<sha cũ trên remote>" origin <nhánh>`.
