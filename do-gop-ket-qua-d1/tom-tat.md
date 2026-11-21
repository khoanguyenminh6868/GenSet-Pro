# Đo PR #1013 (dau-phat-hang-d1) — top 30 Gợi ý cấu hình

- Gốc = merge-base `95ecba261c22057cbf8036e987c62ae0726068c8` (= origin/main lúc đo); nhánh = `2b126c17e235f8e3c6810fb8914995489bdaabff`. Mã giống nhau, thư mục cn khác. Chung một bidhist (2026-11-21T01:05:27.800Z, 928 gói, 435 NCC gốc / 435 NCC nhánh).
- Số lượt: 1093 (gốc 1093, nhánh 1093); lượt lỗi: gốc 0, nhánh 0; lượt chỉ có một bên: 0
- Giống hệt: 1093
- Đổi tập top 30: 0
- Cùng tập, chỉ đổi thứ tự: 0
- Cùng tập, có đổi điểm: 0
- Dòng đổi điểm BẤT THƯỜNG (đầu phát không phải Mecc Alte ECP/ECO / Stamford S6/S7): 0
- Dòng hạng 1–5 gốc ra khỏi top 30: 0

## Dòng hạng 1–5 gốc ra khỏi top 30
(không có)

## Dòng BẤT THƯỜNG
(không có)

## Chi tiết từng lượt có đổi


## Ghi chú
- Hai tệp kết quả (`goc.json.gz`, `nhanh.json.gz`; nén gzip vì bản thô 157 MB vượt giới hạn 100 MB của GitHub; giải nén ra thì) GIỐNG TỪNG BYTE (`cmp`), dù `cn/mecc-alte.json` và `cn/stamford-avk-china.json` của hai bên khác nhau (md5 mecc-alte: fc1ac02f… ↔ 90e0f7c3…). Trong top 30 gốc có 46 dòng đầu phát Mecc Alte và 405 dòng Stamford nhưng không dòng nào đổi điểm / vào / ra.
- Chưa kiểm vì sao dữ liệu mới không tới `candidates` (chỉ đo, không sửa mã).
- bidhist lưu ngoài repo, không commit.
