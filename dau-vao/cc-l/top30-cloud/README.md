# Đo top 30 Gợi ý cấu hình: gốc vs PR #1064

- SHA gốc (merge-base origin/main, pr1064): `04a2c6314b7912f53e0594da5ffa483b61730633`
- SHA nhánh (head PR #1064): `e6bc573e7a9806cf62070201d492d9f6d28692ad`
- bidhist tải một lần lúc 2026-11-21T17:39:14Z (1556 doc, 928 gói máy phát, 435 NCC), dùng chung cho hai lượt; không commit.
- Giờ chạy (UTC, 2026-11-21): gốc 17:39 → 18:10 (1835 s); nhánh 17:40 → 18:11 (1883 s), chạy song song.
- Số lượt: gốc 1093, nhánh 1093 (cùng tập khoá, không thiếu); số lỗi: 0 / 0.
- So sánh trên đúng 5 trường dưới đây: giống 1051 lượt, khác 42 lượt; trong đó `top` khác nhau ở 19 lượt.

## Nội dung tệp (danh sách trắng)
Mỗi lượt, khoá `<số thông báo>#<n>`, chỉ giữ 5 trường: `top` (mảng khoá dòng NCC), `topScore`, `all` (mảng [khoá dòng, điểm]), `dropped` (số), `rowflag`.
Khoá dòng NCC là dữ liệu NCC công khai.

Trường đã bỏ: không có trường nào khác. `do-gop.mjs` (bản `suppliers/do-gop.mjs` ở cả hai SHA đo, dòng ghi `top/topScore/all/dropped/rowflag`) vốn chỉ ghi ra đúng 5 trường này; `hint`, chữ thông số HSMT và tên gói chỉ dùng nội bộ khi tính, không được ghi ra. Tệp ở đây vẫn được lọc lại cứng theo danh sách trắng bằng script riêng, và đã grep kiểm: không còn `hint`/`bidName`; tập tên trường đúng 5.

## Cách chạy
Worktree detach ở từng SHA; script nạp code từ đúng thư mục worktree truyền ở tham số đầu:

    NODE_USE_ENV_PROXY=1 node wt-goc/suppliers/do-gop.mjs wt-goc wt-goc/suppliers/cn gop-goc.json --save-bidhist /tmp/bidhist.json
    NODE_USE_ENV_PROXY=1 node wt-nhanh/suppliers/do-gop.mjs wt-nhanh wt-nhanh/suppliers/cn gop-nhanh.json --bidhist /tmp/bidhist.json

`.gz` = JSON đã lọc 5 trường, gzip -9.
