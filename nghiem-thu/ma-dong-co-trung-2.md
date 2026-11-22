# Nghiệm thu: mã động cơ trùng, PR 2 (tách ô hai mã)

- PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1087 (draft), nhánh `ma-dong-co-trung-2`, head `fffd4f9a6819eada102f1b762147698b254db972`, gốc `dccc4669`.
- Quyết định: Khoa 20/11/2026, câu 1 b): ô hai mã tách hai bản ghi; ngoặc là mã riêng của NCC thì giữ mã ngoài ngoặc.
- Cách làm: danh sách tường minh `ENGINE_CELL_LIST` trong `web/catalog.js`: 91 ô tách, 16 ô giữ mã ngoài ngoặc. Bản ghi tách bỏ thông số phạm vi động cơ, giữ công suất và thông số tổ máy.

## Số đo `build()` (so `dccc4669`)

- Khoá động cơ 6.328 → 6.238: mất 107, mới 17, thêm dòng 153, bớt dòng 0.
- Dòng động cơ 48.702 → 48.822. Đầu phát 3.026 và bộ điều khiển 187 không đổi.
- Đổi hãng 2 khoá, từ trống sang Cummins: QSK60-G11, QSK50-G11. 1 khoá mới không có hãng.
- 17 khoá mới: 13 mã MTU 4000 (lấy nguyên chữ nguồn, chưa đối chiếu datasheet hãng), DP372CC, DX22, DX37, PHF4075ZLD1.
- Test 1529 + 158 + 11 pass, `quality --check` đạt, CI xanh ở head.

## Chưa làm

- Top 30 chưa đo cloud.
- Không tách: DE2V1000 (genlitec), X:KD…/XE:KD… (koop), ZS1110/295D và ZS1115/2100D (sunny-weifang, tách làm mất hãng 4 khoá), 8300D/M-2, 4D24TG0/A, 4D24TG2/A, 4100/125Z-09D, "(M)", "(E)", số trơ trong ngoặc, mã Baudouin "/5" "/6" "/S".
- `COMPR_SAME` còn mục "6M33G8D3/5(6M33G825/5)" không khoá nào dùng, vô hại, chưa gỡ.
