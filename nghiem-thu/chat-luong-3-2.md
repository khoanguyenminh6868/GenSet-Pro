# Chất lượng 3, chặng 2: phần code + spec-diff (18/11/2026)

- PR (draft): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/910. Nhánh `chat-luong-3`, gốc là main b9d4f06d.
- Quyết định của Khoa: làm C, giữ lại 6 số đúng, làm đủ 3 phần danh sách bảng chưa đọc được. KHÔNG hiện danh sách trên web: màn hình nào cũng chưa có danh sách này.
- **Chưa đo top 30.** Việc này chờ phiên điều phối báo máy rảnh, rồi so với `gop-lech-cot-9.json`.

## Các commit
| commit | nội dung |
|---|---|
| b47f147f | `fromSupplier(s, notes)` + `unread()` + `suppliers/unread-tables.mjs` (phần 1) |
| 307fa61b | L3B: bảng nhãn chỉ ghép "a/b" thành kVA/kW khi nhãn ghi mức hoặc đơn vị |
| 4057878f | WCHK: dòng điện / điện áp đọc theo vị trí phải khớp công suất của dòng |
| aa07870f | Tờ chia phần (`sectionSheet`) + LROW |
| 184b2484 | Tiêu đề nhiều dòng, ô hai mã, điện áp chuẩn 230/400 và 400 V |
| (cuối) | spec-diff `--md` thêm dòng "Chưa đọc được" (phần 3), `suppliers/unread-tables.json` (phần 2), ghi chú CLAUDE.md, nới một test lệch cột 8 |

Tệp đổi:
- `web/catalog.js`
- `suppliers/spec-diff.mjs`, `suppliers/unread-tables.mjs` (mới), `suppliers/unread-tables.json` (mới)
- `suppliers/chat-luong-3.test.mjs` (mới, 13 ca dòng thật), `suppliers/spec-diff.test.mjs`, `suppliers/spec-read.test.mjs`
- `web/CLAUDE.md`, `suppliers/CLAUDE.md`

## Lệnh đã chạy
```
node --test suppliers/*.test.mjs        → 1026 pass / 0 fail
node --test web/test/*.test.mjs         → 161 pass / 0 fail
node suppliers/quality.mjs --check      → không chỉ số nào xấu đi quá ngưỡng
node suppliers/spec-diff.mjs git:b9d4f06d . --out c2/full.txt --md c2/tom-tat.md
node suppliers/unread-tables.mjs [--json]
```
- Thư mục đầu ra: `dau-vao\chat-luong-3\c2\` (`full.txt` là bản đầy đủ, `tom-tat.md` là bản tóm tắt).

## Kết quả spec-diff, main ↔ nhánh
- Số bản ghi: 59.076 → 59.127. Có 196 bản ghi đổi, 25 mất, 76 thêm, nằm ở 109 bảng của 12 NCC.
- Đảo vai động cơ ↔ đầu phát: 1 → 1.
- Số lượt theo dạng: `current bỏ` 116, `voltage bỏ` 114, `power` 65.
- Danh sách chưa đọc được (bên main chưa có nên ghi "—"):

| lý do | số mục | số bảng | số NCC |
|---|--:|--:|--:|
| bảng không cho bản ghi nào | 3.177 | 3.177 | 206 |
| dòng điện / điện áp theo vị trí không khớp công suất | 230 | 15 | 7 |
| số vô lý so với công suất | 213 | 44 | 22 |
| dòng là cặp nhãn \| giá trị | 164 | 72 | 17 |
| mã đầu phát trùng model tổ máy | 37 | 37 | 1 |
| cặp a/b dưới nhãn không ghi mức / đơn vị | 34 | 34 | 1 |
| tổ máy nhiều động cơ | 6 | 4 | 2 |
| một ô ghi hai mã | 1 | 1 | 1 |

### Soát từng dạng (đã xem hết `full.txt`)
- **power-hf, 105 dòng.** Các dòng n109, n111, n112… thiếu một ô. Vì vậy kW nằm ở cột dòng điện và kW dự phòng nằm ở cột điện áp ("PHF-100RX | 100 | 110 | 180": 180 A mới là dòng điện thật). Cả hai số sai đều đã bỏ. **Bỏ đúng.**
- **gb-power, 65 dòng.** Chân trang "GB POWER | 3/4" từng bị đọc thành công suất R 4/3. Nay đã bỏ, công suất thật của tờ vẫn giữ. **Đúng.**
- **yingtai-jiangsu, 14 dòng.** kW dự phòng (1230, 1360…) từng bị đọc thành điện áp. Nay đã bỏ. Dòng điện cao thế 128 A vẫn giữ. **Đúng.**
- **bruno, 3 dòng.** Điện áp 225 là một kích thước của tháp đèn. Đã bỏ. **Đúng.**
- **huachai-deutz (16 mất, 39 thêm) và chenxing-weifang (6 mất, 37 thêm).**
  - Bị mất: rác IP23/H ×11, "220V,400/230V", "12KW,10.8KW", COS&Phi ×2. Cũng mất các model tổ máy từng bị đọc làm động cơ / đầu phát (10GF, 30GF…).
  - Được thêm: động cơ Deutz / Cummins và đầu phát Stamford / Mecc Alte, đọc đúng theo tiêu đề phần.
  - Đã đối chiếu với tiêu đề phần từng bảng. **Đúng.**
- **zichai (2 mất), cameo-power (1 mất).** Đây là model tổ máy 200GF / 300GFM / 6300D/M hoặc CK7000S (dòng cặp nhãn) từng bị đọc làm động cơ. **Bỏ đúng.**
- **zhengdian 5 dòng.** Dòng điện 195 không khớp công suất của dòng. Bỏ đúng.
- **Còn chưa rõ (có thể là số đúng theo nguồn nhưng đã bị bỏ):**
  - xinzhengfa ZF24GF: 33.2 A (30 kVA / 24 kW, máy 400 V phải khoảng 43 A).
  - xinzhengfa ZF3GF: 12.2 A.
  - kangwo GKW-15GF: 36 A (15 kW / 20 kVA, khoảng 27–29 A).
  - yunding: 792.
  - Các ô này nằm đúng dưới tiêu đề "额定电流", nhưng số không khớp công suất. Theo nguyên tắc "thà thiếu", chúng được để thiếu và ghi vào danh sách chưa đọc được. Test lệch cột 8 (`spec-read.test.mjs`, ZF24GF) đã được nới để nhận 33.2 hoặc để thiếu; điều test giữ là không còn đọc nhầm kW 24 thành dòng điện.

### 6 số đúng mà phương án C ban đầu làm mất
- **huatai: 3 dòng điện.** Giữ lại nhờ kW trong tên model "700GF" (test huatai n111). Cột công suất trong nguồn của huatai là rác ("140/165"), nên không sửa được gốc mà không phải đoán.
- **chenxing / huachai: 3 động cơ.** Đọc lại được qua `sectionSheet` (test chenxing n108, huachai n116 / n118). Đọc lại được thêm hơn 70 bản ghi khác ở cùng dạng bảng.
- Hạn chế: huachai n110 / n114 ghi mã động cơ có dấu cách ("BF 8M 1015CP-LA G4"), không qua được `isCode`, nên không ra bản ghi động cơ (để thiếu).

## 3 mẫu nguồn
1. power-hf n109: `| 13 | PHF-100RX | 100 | 110 | 180 | PHF6110ZLD1(R2J01) | ● | ● | ●`. Tiêu đề có 11 ô, dòng chỉ có 10 ô. Trước đây đọc dòng điện 100, điện áp 110; nay để thiếu cả hai.
2. huachai n116: tiêu đề `| Generator-set | Diesel Engine (DEUTZ) | Alternator (Stamford)` đặt trên dòng `| Model | 30GF | Model | F4L912D | Model | PI144J`. Nay đọc ra động cơ F4L912D và đầu phát PI144J, công suất 30/33 kW (prime / standby) của tổ máy, không lấy 32 kW của động cơ.
3. gb-power n1001: `| GB POWER | 3/4` (chân trang số trang). Nay không còn đọc thành kVA/kW; vẫn giữ `| Prime Power(50Hz) | 8KW/10KVA`.

## Rủi ro / chưa kiểm
- Chưa đo top 30 ứng viên (đang chờ). Đổi danh mục có thể đổi hạng ứng viên ở các gói có động cơ của chenxing / huachai, vì 76 bản ghi mới.
- 230 giá trị đổi hoặc thêm không tự kiểm được bằng công suất của dòng. Phần lớn là thông số của các bản ghi chenxing / huachai mới (bảng nhãn). Đã xem theo dạng, chưa xem từng giá trị một.
- `suppliers/unread-tables.json` (1,1 MB) là bản chụp. Khi `cn/` đổi thì tệp này cũ đi; bản luôn mới là dòng "Chưa đọc được" trong spec-diff của mỗi PR.
- Bảng "không cho bản ghi nào" (3.177) gồm cả bảng phụ kiện / giá, không chỉ bảng máy. Danh sách chưa phân loại.
- WCHK chỉ áp cho đọc theo vị trí (shift=1, `walkedSpecs`). Đọc theo tiêu đề thì chưa có chốt này.
