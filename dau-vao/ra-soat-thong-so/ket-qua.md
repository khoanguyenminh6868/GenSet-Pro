# Rà soát chuẩn lưu thông số NCC (14/11/2026, main `2d25e7e9`)

Đầu vào chung cho hai việc: `chuan-hoa-1` (sửa lỗi đọc) và `chuan-hoa-2` (lớp chuẩn hoá). Khoa duyệt "làm 1,2" ngày 14/11/2026.

## Cách đo lại
Chép cả thư mục này sang thư mục tạm CỦA MÌNH (audit2 ghi `all.json` cạnh script, hai phiên chạy chung sẽ ghi đè nhau), rồi:
`node audit1.cjs <đường dẫn worktree>` … `audit5.cjs` (chạy audit2 trước audit3–5). Chỉ đọc. Lưu đầu ra trước/sau vào bản nghiệm thu.

## Hiện trạng
- Bảng lưu nguyên văn: `specTables[] = {n, title, header[], rows[]}`. Thông số do `web/catalog.js` đọc lúc chạy (`SPECS`, 34 mã; `fromSupplier`, `rowSpecs`, `walkedSpecs`). Giá trị giữ dạng chuỗi `{key, label, value}`.
- 435 hồ sơ, 329 có bảng, 9.161 bảng, 173.266 dòng → 63.576 bản ghi (50.606 động cơ, 12.970 đầu phát); 49.348 dòng tổ máy.

## Số đo gốc (để so trước/sau)
| Chỉ số | Giá trị | Script |
|---|---|---|
| Ô tiêu đề không gán được mã | 15.525 / 42.782 (36,3%) | audit1 |
| Dòng tổ máy không đọc được công suất | 13.652 (27,7%) | audit2 |
| Chỉ "rated" (không rõ chế độ) | 6.999 (14,2%) | audit2 |
| Không rõ tần số | 36.615 (74,2%) | audit2 |
| Tiêu hao không ghi mức tải | 8.333 / 10.807 | audit2 |
| Tiêu hao không ghi đơn vị | 3.431 (cả fuel75/50) | audit2 |
| Độ ồn không ghi khoảng cách | 319 / 534 | audit2 |
| Mâu thuẫn dung tích / đk×ht / tỉ số nén / số xi lanh | 352/966, 144/851, 37/122, 113/1.344 | audit3 |
| Nhóm model chỉ khác O/0, I/L/1, dấu `*`, ngoặc | 95 | audit3 |
| Model mang tiền tố hãng trùng bản không tiền tố | 45 | audit3 |
| Model bị gán ≥2 hãng | 617 (8,1%) | audit3 |
| Model không rõ hãng | 1.805 (23,8%) | audit3 |
| Bản ghi động cơ từ dòng lặp cùng NCC | 3.953 (8,2%) | audit4 |
| Bảng tổ máy (cào) không ra bản ghi | 1.593 / 4.044 | audit4 |
| Khoá lạ `src` trong specTables | 56 bảng (denyo 33, airman 11, perkins-wuxi 11, marelli-motori 1); ở denyo là `src:[1]` cạnh `n:2001` | audit4 |
| `oil` lấy nhầm suất tiêu hao dầu (g/kWh) | 282 / 1.949 | audit5 |
| `eff` lấy hiệu suất điện tổ máy gas | 26 / 88 | audit5 |
| `cooling` = "ATS auto load transfer screen" / "Control module…" | 151 dòng (longkai-power), 1 (xinhengxin-fujian) | audit3 |
| `speed` lấy cột mô-men ("peak torque nm- rpm") | 2 | audit5 |
| Khối lượng nhãn gross / net lẫn nhau | 3.056 / 18.669 có nhãn | audit5 |
| Kích thước/khối lượng có ghi trần / vỏ | 6.594 / 40.474 | audit5 |

## Lỗi đọc đã thấy (việc 1)
1. `oil` (dung tích dầu): nhãn "机油消耗率（g/kw.h）", "lube oil consumption…", "机油 耗率" bị nhận. Thiếu loại trừ `consum|消耗|耗率`.
2. `eff` (hiệu suất đầu phát): nhận "electrical / thermal / overall efficiency" của tổ máy gas.
3. `speed`: nhận "最大扭矩 n·m/r/min", "peak torque nm- rpm".
4. `pf`: `cos` khớp cả "datos técnicos…" (chưa lấy giá trị sai nào, nhưng nhãn sai).
5. `cooling`: kiểu giá trị `TXT` quá rộng, cột lệch đưa chữ ATS / control module vào.
6. Từ khoá sót: `润滑油 容量` (dung tích dầu, 126 ô tiêu đề), `吸气方式` (nạp khí, 35), `燃油率` (59).
7. `keyOf`: không bỏ dấu `*` chú thích cuối model (QSK19-G4*), không bỏ tiền tố hãng ở bảng ngang (PERKINS 1103A-33G).
8. `schema.json` không khai `specTables`, `brandLicensed`; `verify.mjs` không đối chiếu khoá với schema.

## KHÔNG làm trong hai việc này (cần Khoa quyết)
- Gộp model chỉ khác O/0, I/1 (là suy ra): chỉ xuất danh sách.
- Đổi luật gán hãng cho 617 model nhiều hãng (WP… vừa Weichai vừa Baudouin / Deutz do tên trang): đụng quy tắc xuất xứ G7 trong bộ nhớ `config-suggest.md`. Chỉ đo ảnh hưởng và xuất danh sách.
