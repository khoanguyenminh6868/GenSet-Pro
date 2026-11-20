# Nghiệm thu: suy giảm đầu phát theo hiện trường, PR B2, lần 1 (ĐANG DỞ, tạm dừng 20/11 theo lệnh Khoa)

**Đã có:**
- Worktree `wt-dau-phat-b2`, nhánh `dau-phat-b2`, commit 7ed17297. Chưa push, chưa có PR.
- `makerDerate` lấy hệ số suy giảm từ nguồn đã lưu:
  - Stamford: theo câu trên chính tờ của model.
  - Leroy-Somer, chỉ model LSA: theo bảng cấp H và bảng độ cao trong nguồn [6003] = 6627_en.pdf. Nguồn lưu bằng `fetch-source.mjs`; `verify` qua (435 bản ghi, 0 lỗi).
- Check công suất đầu phát: đạt hoặc không đạt, có ghi phép tính. Riêng IB2600603983: 820 × 0.973 = 797,9 ≥ 750 → đạt.
- `MAKER_PLANT` thêm `stamford-avk-china` = Trung Quốc.
- Test: `node --test suppliers/` 1270 / 1270 qua.

**Đang dở:** kiểm chéo 17 lượt chạy nền: gốc 8b5184eb → `dau-vao\dau-phat-hang-b\goc-b2.json`, nhánh → `nhanh-b2.json`. Chưa đọc kết quả.

**Bước kế tiếp:**
1. `node so-ab.mjs goc-b2.json nhanh-b2.json > so-ab-b2.txt`, liệt kê mọi cấu hình đổi (suy giảm, Stamford → Trung Quốc).
2. Push `dau-phat-b2`, mở PR draft, chờ CI.
3. Viết đủ nghiệm thu này, Sync sổ, báo điều phối.
4. Xoá worktree `wt-dau-phat-b2-base`.
