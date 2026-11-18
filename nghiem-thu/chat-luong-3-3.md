# Chất lượng 3, chặng 3: đo top 30 ứng viên (18/11/2026)

- **Gốc so:** `dau-vao\ra-soat-lech-dong-cot\gop-lech-cot-9.json`, đo ở nhánh `lech-cot-9` e4f66d19.
- **Lượt đo:** nhánh TẠM cục bộ `tmp-cl3-do` = e4f66d19 + 7 commit của Chất lượng 3 (đầu nhánh e7b8ff7f).
  - Không đẩy nhánh này; nhánh `chat-luong-3` / PR #910 không đổi.
  - Dữ liệu `suppliers/cn` giống hệt lần đo gốc (không dính #911), nên phép so chỉ còn tác động của Chất lượng 3.
- **Lệnh:** `node genbid-test\lc8\do-gop.mjs . suppliers/cn ...\gop-chat-luong-3.json`, chạy một tiến trình song song với gopRow của Lệch cột 9. RAM trống thấp nhất 3,8 GB, không lỗi.
- **Kết quả ra:** 1.093 lượt (928 gói).
- **Tệp và script:** trong `dau-vao\chat-luong-3\c3\`.
  - `gopCl3.mjs` so từng lượt và truy từng dòng vào / ra về bản ghi danh mục. Kết quả: `gop-so.txt`.
  - `phanLoai.cjs` gom nhóm nguyên nhân.
  - `factCheck.mjs` truy các lượt không có bản ghi đổi về dữ kiện theo mã.
  - `cntCmp.mjs` truy từng dòng đổi trạng thái ở các lượt chỉ đổi số all / dropped. Kết quả: `so-all-dropped.txt`, chạy trên gopRow của 35 lượt, mã cũ ↔ mới.
  - `full.txt` / `tom-tat.md` là spec-diff e4f66d19 ↔ nhánh tạm: 196 đổi / 25 mất / 76 thêm, như PR.

## Tổng
| | lượt |
|---|--:|
| Không đổi gì (top, thứ tự, all, dropped) | 496 |
| Đổi tập top 30 | 417 |
| Chỉ đổi thứ tự | 141 |
| Chỉ đổi số all / dropped | 39 |
| **Tổng lượt đổi** | **597** |

Dòng vào / ra top (mỗi dòng truy về bản ghi của chính nó):

| Hướng | Trạng thái bản ghi của dòng | số dòng |
|---|---|--:|
| Ra | bản ghi ĐỔI (tất cả là gb-power) | 205 |
| Ra | bản ghi không đổi (bị chen) | 478 |
| Vào | bản ghi không đổi (lấp chỗ trống) | 657 |
| Vào | dòng mới có (huachai) | 10 |

**Mọi lượt đổi đều đã truy được nguyên nhân. Không lượt nào "không rõ".**

## Nguyên nhân theo nhóm
### 1. gb-power bỏ công suất rác "R 4/3" (L3B) — 431 lượt
- **Số lượt:** 337 đổi tập top, 79 chỉ đổi thứ tự, 4 chỉ đổi số all / dropped, 7 cùng với huachai, 4 cùng với xinzhengfa. Tính cả 3 lượt chỉ có huachai, 128 lượt nhóm 2 và 35 lượt nhóm 3 thì tổng là 597.
- **Số dòng:** 206 dòng gb-power ra top; không dòng gb-power nào vào. Các dòng còn lại vào / ra là do bị chen hoặc được lấp chỗ.
- Trước đây chân trang "GB POWER | 3/4" bị đọc thành công suất định mức 4 kVA / 3 kW, gắn vào 65 bản ghi gb-power. Công suất rác này làm hỏng xếp hạng theo hai cách:
  - **Khớp nhầm gói nhỏ.** Ở lượt 3 kVA (IB2200006257#0, IB2200066148#0), các tổ máy GBP500 / GBP130 / GBP625 (500 / 130 / 625 kVA) đứng hạng 1–4. Bỏ "R 4/3" thì chúng ra khỏi danh sách: all 42 → 8, top 9 → 5. **Đúng.**
  - **Che mức phạt công suất vượt.** Điểm trừ là 100 × (công suất của dòng / công suất gói − 1), và `rowPower` từng chọn mức "R 4" nên không bị trừ. Ví dụ IB2200011710#0 (30 kVA): GBP40 (prime 40 kVA) từ 278 điểm, hạng top 9, xuống 245 điểm, hạng 149. 245 = 278 − 33, đúng bằng mức phạt 40 / 30. **Đúng:** tổ máy 40 kVA nay bị trừ như mọi tổ máy vượt khác.
- Đã chạy `gopRow` hai bên để xác nhận ở IB2200006257#0 và IB2200011710#0.

### 2. Dữ kiện model mới từ 76 bản ghi thêm (chenxing, huachai) — 128 lượt
- Các lượt này không có dòng nào có bản ghi đổi. Ở mỗi lượt, `factCheck.mjs` tìm thấy ít nhất một dòng xê dịch mang mã động cơ / đầu phát mà bộ thông số theo mã đã đổi.
- `candidates` cộng điểm theo số dữ kiện của mã (8 / khoá động cơ, tối đa 8; 3 / khoá đầu phát, tối đa 6), và loại theo dữ kiện (xi lanh, dung tích).
- Mã gặp nhiều nhất, theo số lượt:
  - Đầu phát: UCI224D 34, PI044F 21, UCI224F 17, PI144J 13.
  - Động cơ: YC4D60-D21 32, 4BTA3.9-G2 28, YC6B180L-D20 23, 6BTA5.9-G2 20, WP6D132E200 18, 1106A-70TG1 14, 4BT3.9-G2 12, F2L912D 9, SC27G900D2 9.
- Ví dụ (gopRow hai bên):
  - IB2200029720#0: dòng 4BTA3.9-G2 / UCI224D của koten, sanq, stone +3 điểm.
  - IB2200012854#0: WP4D66E200 +8.
  - IB2200005266#0: victory V12F (F2L912D) bị loại `cyl`, vì nay biết F2L912D có 2 xi lanh, đúng thông số Deutz.

### 3. Chỉ đổi số all / dropped — 35 lượt (top 30 giữ nguyên)
Đã chạy gopRow hai bên cho đủ 35 lượt và truy từng dòng đổi trạng thái (`so-all-dropped.txt`):
- **44 dòng all → dropped:** đều là dòng động cơ Deutz của NCC khác. Chúng bị loại theo dữ kiện mới của chính mã đó, đọc từ các bảng huachai mới:
  - F3L912D 3 xi lanh: loại `cyl`, 15 dòng.
  - BF8L513 8 xi lanh: loại `cyl` / `maxDisp`, 13 dòng.
  - BF6M1015CP-LA 11,906 L: loại `disp` / `maxDisp`, 7 dòng.
  - BF6M1015: loại `cyl` / `maxDisp`, 4 dòng.
  - F6L912TD 6 xi lanh: 3 dòng.
  - BF6L913CD 6 xi lanh: 2 dòng.
  - Các số này khớp thông số Deutz (912: 1 xi lanh / 0,94 L; 1015: V6 / V8 132 × 145; 513: V8 125 × 130). Loại là đúng; trước đây chỉ là không có dữ kiện.
- **27 dòng mới vào all:** các bản ghi chenxing (16) / huachai (11) mới đọc được, nằm ngoài top.

### 4. huachai-deutz (10 lượt) và xinzhengfa (4 lượt), cùng hoặc ngoài nhóm 1
- **10 dòng huachai mới vào top 30.** Tất cả là tổ máy Deutz đọc theo tiêu đề phần:
  - 10GF F2L912D / PI044F (hạng 9, 23)
  - 15 kW F3L912D / PI144D (hạng 30)
  - 30GF F4L912D (hạng 24)
  - 40GF F4L912TD / UCI224D (hạng 13, 14)
  - 55GF F6L912TD (hạng 27)
  - 90GF F8L413F (hạng 27)
  - 120GF BF8L513 (hạng 29)
- **Dòng bị đẩy ra** là các dòng cuối top có bản ghi không đổi (hạng 26–30), cùng một dòng gb-power ở hạng 8 (GBP25, nhóm 1).
- **xinzhengfa ZF3GF** còn trong top ở cả hai bên. Bản ghi mất dòng điện "12.2" (WCHK, nằm trong danh sách "còn chưa rõ" ở chặng 2). Việc này đổi điểm dữ kiện, nên đổi thứ tự 4 lượt.

## Đánh giá
- Mọi xê dịch của top 30 bắt nguồn từ ba thay đổi:
  - (1) bỏ công suất rác của gb-power;
  - (2) 76 bản ghi chenxing / huachai mới đọc được và dữ kiện của chúng;
  - (3) bỏ dòng điện 12.2 A của xinzhengfa.
- Không thấy dòng nào vào / ra vì một số SAI mới.
- Rủi ro đã biết: dữ kiện của các bản ghi mới gắn cả thông số cấp tổ máy (điện áp, dòng điện, khối lượng, kích thước) vào mã động cơ / đầu phát. Đây là quy ước sẵn có cho mọi bảng dòng, không riêng Chất lượng 3.
- Nếu #902 (Lệch cột 9) phải sửa mã thì lượt đo này có thể phải đo lại (theo lời phiên điều phối).
