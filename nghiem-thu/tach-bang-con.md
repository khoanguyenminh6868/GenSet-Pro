# tach-bang-con: tách bảng con trong một khối, giữ dòng máy thiếu ô (phiên con, 23/11/2026)

## Trạng thái
- Worktree `C:\Projects\GenSet Pro\wt-tach-bang-con`, nhánh `fix/tach-bang-con`, chồng lên #1105 (a95b8ab5). Mã `tablesOf` đã sửa, CHƯA commit, CHƯA sửa dữ liệu `cn/` / `specs/`.
- Worktree so sánh (bản gốc a95b8ab5, chỉ đọc): `C:\Projects\GenSet Pro\wt-tach-base`. Xong việc thì xoá.
- Script đo: `dau-vao\tach-bang-con\` (`measure`, `classify-added`, `rest84`, `shape`, `tabs`). Kết quả mới nhất: `m5\`.

## Luật đang dùng
1. Tiêu đề lặp: sau một dòng máy, gặp dòng ≥ 3 ô, không phải dòng số, ≥ 60 % ô trùng ô tiêu đề của bảng con hiện tại, và số ô ≥ 60 % dòng tiêu đề rộng nhất → bắt đầu bảng con mới (kèm các dòng tiêu đề ngay trên nó).
2. Dòng máy thiếu tối đa 2 ô so với dòng số rộng nhất được giữ, KHÔNG điền ô.
3. Tách mà có dòng của bảng cũ không còn ở bảng con nào, hoặc một phần không thành bảng → giữ nguyên khối.
4. Tiêu đề ở cuối khối, chưa có dòng dưới nó: chuyển cho khối sau. Khối mở bằng dòng máy và có tiêu đề lặp: phần đầu nhận tiêu đề của khối trước.

## Số đo `tablesOf` cũ ↔ mới (3.983 tệp nguồn, chưa phải số bản ghi)
- 41 NCC, 208 tệp, 217 bảng cũ đổi; tổng bảng 4.848 → 5.135. Dòng máy mất: 0. Dòng thêm (theo trang): 183.
- Phiên trước đếm 447 bảng / 66 NCC bằng luật thử khác, không lưu lại. Luật này chặt hơn, đổi 217 bảng / 41 NCC. **Chưa chứng minh phần chênh là không cần tách**: phải soát trước khi kết luận.
- 84 dòng: cứu được 80 (baifa 70 / 70, taihai 8 / 8, hnd 2 / 6).
- hnd-henan còn 4 dòng CỐ Ý không lấy (n101 L99, L109, L110, L111): bảng động cơ có ô gộp, dòng thiếu ô "功率kW" nên số lệch một cột; lấy vào sẽ đọc sai.

## Đáng ngờ, chưa quyết
- Bảng con chỉ một dòng: kaihua-genset n102, n118; taylor-power n103, n104.

## Kế hoạch chia PR (DRAFT, không tự merge)
- PR 1: mã + test + bẫy trong `suppliers/CLAUDE.md` + dữ liệu baifa-power, taihai-taizhou, hnd-henan, acepow-fuan.
- PR 2: 37 NCC còn lại, chồng lên PR 1. Quá lớn để soát thì chia tiếp theo cụm.
- Mỗi PR: so mọi bản ghi `fromSupplier` trước ↔ sau theo từng NCC, giải thích mọi thêm / mất / đổi; verify, quality --check, spec-diff --gate, `node --test suppliers/*.test.mjs`. Báo SHA để điều phối đo 1.093 lượt top 30.
