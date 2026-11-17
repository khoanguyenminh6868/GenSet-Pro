# Nghiệm thu: sửa mâu thuẫn số liệu động cơ kiểu depco-power (nhánh `depco-sua`)

Ngày 17/11/2026. PR draft: xem cuối tệp (mục "PR"). Không merge, chờ phiên điều phối quyết.

## Phạm vi (theo Khoa 17/11)
Chỉ làm đề xuất 1–3. KHÔNG làm đề xuất 4 (dung sai dung tích 2%).
1. Dòng tự mâu thuẫn (xi lanh × π/4 × bore² × hành trình lệch dung tích >5%) bị đánh dấu, không tính là mâu thuẫn giữa NCC.
2. Một NCC một phiếu mỗi trường. NCC có hai giá trị cho cùng một model: lấy giá trị trùng số đông, không có số đông thì không phiếu.
3. `quality --check` bỏ ca đã có giá trị thắng theo luật số đông (≥3 NCC và ≥3× mỗi giá trị khác).

**Cách xử lý đề xuất 4:** đã có làm trong lần đầu, rồi gỡ sau tin của Khoa. Phần đó chỉ đổi cách ĐẾM trong `quality.mjs`, không đổi giá trị danh mục hay điểm ứng viên, nên GIỮ lượt đo top 30 đang chạy (không chạy lại) và chỉ đo lại quality trên code đã gỡ. Đã gỡ khỏi code, test, `suppliers/CLAUDE.md` và baseline (disp 107/105 → 197/195).

## Tệp đổi (6)
- `web/spec-norm.js`: thêm `selfCheck(norm, tol=0.05)`.
- `web/catalog.js`: thêm `tally(bySup)`, xuất ra `api`; `finish()` gắn `win` và `votes` cho cyl/disp/bore/compr của động cơ (`values` và thứ tự giữ nguyên).
- `suppliers/quality.mjs`: `conflictsOf(key, get, opts)`; mỗi mã có `steps {old,self,one,win}`.
- `suppliers/quality-baseline.json`: chỉ mục `conflicts`.
- `suppliers/depco-sua.test.mjs`: 8 test, dùng dòng depco thật.
- `suppliers/CLAUDE.md`: một dòng ghi quality không đếm gì nữa.

## Lệnh và kết quả thật
```
node suppliers/quality.mjs --check
  cyl    138/1400 -> 24/1400
  disp   384/1082 -> 197/1080 (gồm giá trị thiếu đơn vị: 195/1080)
  bore   166/917  -> 36/790   (loose 45/917)
  compr   55/162  -> 33/162
  --check: không chỉ số nào xấu đi quá ngưỡng.
node --test suppliers/            -> tests 959, pass 959, fail 0   (sau rebase lên origin/main 0c738e3e)
node --test suppliers/depco-sua.test.mjs suppliers/spec-read.test.mjs -> 28/28
```
Đếm đủ đơn vị theo từng bước (đo, không ước):
| trường | cũ | +tự kiểm | +một NCC một phiếu | +số đông |
|---|---|---|---|---|
| cyl | 138 | 95 | 80 | 24 |
| disp | 383 | 357 | 329 | 197 |
| bore | 136 | 101 | 83 | 36 |
| compr | 54 | 54 | 47 | 33 |

Số "cũ" (138/383/136/54) khớp đúng `depco-phan-loai.md`, tức đã tái hiện chính xác trước khi sửa.

## Top 30 ứng viên, main so với nhánh (đo thật)
`do-gop.mjs` (GENBID_SPEC_NORM=1) chạy trên 928 gói (1093 lượt công suất), mỗi bên một tiến trình, nền, khoảng 1,5 giờ; so bằng `cmp-gop.mjs`:
```
runs 1093, err 0, same 1093, orderOnly 0, setChanged 0, rowsIn 0, rowsOut 0,
allCountChanged 0, droppedCountChanged 0, makeShownChanged 0
```
Kết quả: KHÔNG gói nào đổi. Vì thế bước "soi tay 5 gói đổi nhiều nhất" không có đối tượng; không có gói nào để soi. (Cột onlyA/onlyB = 1093 chỉ là số khoá của mỗi tệp, không phải khác biệt.) Giải thích: `config-bot.mjs` không đọc `win`/`votes`, chỉ đọc `values`.
Hệ quả: PR này chỉ giảm số mâu thuẫn trên báo cáo chất lượng; nó chưa làm điểm ứng viên đúng hơn. Muốn vậy phải cho `candidates` dùng `win` (việc sau, chưa làm, cần Khoa duyệt).

## 10 ca hết mâu thuẫn / 10 ca còn lại (trích từ `quality --check`, số NCC mỗi giá trị)
Hết mâu thuẫn (cyl): 1006TAG 4×1/6×3; 403D-11G 3×16/4×1; TAD1344GE 6×13/4×1; WP4.1D80E200 4×14/6×1; KTA50-G15A 16×3/12×1; QSK19-G3 6×4/12×1; DP126LB 6×5/8×1; BF8M1015C-LA G2 8×9/6×1; WD145TAD35 6×3/12×1; 16M33D1980E310 16×4/12×1.
Hết mâu thuẫn (disp): 4B3.9-G2 3.9×17/4.5×1; NT855-GA 10.8×1/14×15; QSZ13-G3 13×16/14×1/19.6×1; TAD530GE 4.8×5/1.1×1; YC6A245-D30 7.3×6/7.8×1; 2806A-E18TAG2 18.1×16/18×3; WP2.3D48E200 2.3×6/3.1×1/2.5×1; 10V1600G70F 13.5×3/17.5×1; 8V1600G80F 11.6×3/14×1; 6ETAA11.8-G22 11.8×2/11.6×1.
Còn lại (cyl): 12M33G1300/6 16×1/12×2; 8M33D800E310 6×1/8×1; 8M33D975E310 6×1/8×2; CA6DF2-19D 6×2/4×1; CA6DL1-24D 6×2/4×1; NT151LU30 6×1/12×1; QSK38-G10 8×1/6×1/12×1; QSK38-G3 12×1/16×1; QSK38-G9 6×1/12×1; QXK60-G3 16×1/12×1.
Còn lại (disp): 12V2000G25 21×3/23.9×3; 4008TAG2A 30.6×11/30.5×4/30×1; 6KTAA25-G39 25.2×4/25×3; KTA19-G9A 19×2/18.9×1; KTA50-GS8 50.3×9/37.8×2/50×8; QSK19-G14 18.9×1/19×2; QSX15-G8 15×1/92×1; S6R2-PTA 6×2/30×2/14.6×1; WD129TAD25 12.9×2/25.8×1; YC4D100Z-D20 4.2×1/4.8×1.
(Danh sách bore, compr đầy đủ chạy lại bằng `quality --check`.) Ca còn lại phần lớn là mâu thuẫn thật giữa ít NCC (1–2 phiếu mỗi bên) hoặc làm tròn gần nhau (25.2 so 25, 30.6 so 30.5): luật số đông chủ ý không đoán.

## 3 mẫu đối chiếu nguồn (depcogenerator.com, `suppliers/cn/depco-power.json`)
1. **WP10D264E201**: https://www.depcogenerator.com/weichai-ranges-60hz-275-kva-diesel-generator_p776.html. Dòng ghi "Cylinder | 4", "Bore and Stroke(mm) | 126 X 130", "Displacement(L) | 9.726". Tính 4 × π/4 × 12,6² × 13,0 = 6,48 L ≠ 9,726 L. Trang tự mâu thuẫn (6 xi lanh mới khớp), nên `selfCheck` đánh dấu.
2. **6M33G660/6**: https://www.depcogenerator.com/baudouin-ranges-825-kva-60hz-diesel-generator_p402.html. "Cylinder | 12", "150 X 185", "19.6": 12 xi lanh không khớp 19,6 L (6 xi lanh mới khớp). `selfCheck` đánh dấu.
3. **4006-23TAG3A**: 25 NCC ghi 6 xi lanh, depco ghi cả 6 và 8, một NCC khác ghi 8. Sau sửa thắng 6 (26 phiếu, 8 chỉ 1). Test `tally` dựng đúng ca này. Chưa mở trang nguồn của dòng depco "8" để trích nguyên văn (xem phần chưa kiểm).

## Rủi ro và hoàn tác
- Chỉ đổi đếm trong báo cáo chất lượng và thêm hai trường `win`/`votes` vào danh mục; `values` và điểm ứng viên giữ nguyên (đã đo). Rủi ro thấp.
- `catalog.js` dùng chung web và bot: `build()` đã chạy trong test; giá trị danh mục không đổi (top 30 y hệt).
- Baseline hạ xuống nghĩa là sau này mâu thuẫn tăng nhẹ vẫn dưới ngưỡng `conflictRise` 5 so với mức đã hạ; nếu thấy kiểm soát lỏng, nâng lại baseline.
- Hoàn tác: revert PR (không đụng dữ liệu `suppliers/cn`).

## Chưa kiểm
- Chưa mở lại từng trang depco để trích nguyên văn cho ca 4006-23TAG3A.
- Chưa chạy Playwright của web (đổi chỉ ở `catalog.js` thêm trường, không đổi giao diện).
- Chưa đo ảnh hưởng nếu `candidates` dùng `win`.
- CI trên PR chưa chạy tại lúc viết.

## Cần ghi nhớ
- `quality --check` đếm mâu thuẫn theo 3 lớp: bỏ dòng tự mâu thuẫn, một NCC một phiếu, bỏ model có giá trị thắng số đông (≥3 NCC và ≥3× giá trị khác). `catalog.js` có `win`/`votes` nhưng `config-bot.mjs` chưa dùng chúng.
- Khoa chốt KHÔNG dùng dung sai dung tích 2%.
- Muốn cải thiện thật điểm ứng viên cần cho `candidates` đọc `win` (chưa duyệt).

## PR
https://github.com/khoanguyenminh6868/GenSet-Pro/pull/890 (draft, chưa merge)
