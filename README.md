# Nghiệm thu bảng dọc chặng 2 (S7, nhánh `bang-doc-2`)

Chỉ dữ liệu NCC công khai (tiêu đề trang, lý do bỏ). Không chữ HSMT, không bidhist, không token.

- Main gốc: `656ce99675debfade7501db1f0af82120f0d86f2`. Phân loại bằng `1-trich.mjs` + `2-phan-loai.mjs` (nhánh `dau-vao-bang-doc`) trên main gốc: 3.128 bảng không cho bản ghi; V2 224 bảng / 24 NCC, V5 54 / 3, F1 41 / 7 (319 bảng / 32 NCC).
- `ban-ghi-moi.tsv`: MỌI bản ghi mới của chặng 2. **Rỗng (0 bản ghi)**: không bảng nào qua đủ hàng rào. Chạy trên toàn `cn/` (mọi nhóm, không chỉ V2 / V5 / F1) cũng 0 bản ghi mang `gensetFrom`.
- `v2-v5-f1-ket-cuc.tsv`: kết cục từng bảng trong 319 bảng (nhóm, NCC, n, chỉ số bảng, lý do chặn đầu tiên, mọi note "bảng dọc", tiêu đề nguyên văn).

| lý do (mỗi bảng một lý do, lý do đầu tiên chặn nó) | V2 | V5 | F1 | tổng |
|---|--:|--:|--:|--:|
| không phải bố cục dọc (< 60 % dòng ≤ 3 ô) | 0 | 54 | 4 | 58 |
| tiêu đề không có mã | 0 | 0 | 1 | 1 |
| tiêu đề nêu dòng sản phẩm / series | 2 | 0 | 0 | 2 |
| tiêu đề có mã lẫn công suất / nhiều lựa chọn ("/") | 2 | 0 | 0 | 2 |
| không có mã động cơ (ở dòng nhãn động cơ) | 218 | 0 | 36 | 254 |
| không có công suất prime / standby ghi rõ ở phần tổ máy | 2 | 0 | 0 | 2 |
| đọc được | 0 | 0 | 0 | 0 |
