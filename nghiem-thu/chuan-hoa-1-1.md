# Nghiệm thu chuan-hoa-1 (lần 1) — 14/11/2026

PR (DRAFT): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/779 — nhánh `chuan-hoa-1`, commit `b331e77c`, từ main `2d25e7e9`.

## Tệp đã đổi
`web/catalog.js`; `web/CLAUDE.md`, `suppliers/CLAUDE.md`; `suppliers/schema.json`, `suppliers/verify.mjs`; mới `suppliers/spec-read.test.mjs`, `suppliers/schema-keys.test.mjs`; 4 hồ sơ `suppliers/cn/{denyo,airman,perkins-wuxi,marelli-motori}.json` (chỉ bỏ khoá `src` của bảng). Không đụng `spec-norm.js`, `quality.mjs`, workflow.

## Đã sửa (lỗi trong ket-qua.md)
1. `oil`: loại nhãn `consum|消耗|耗率|耗量`; thêm `润滑油`.
2. `eff`: loại `thermal|overall|total|electrical|热效|综合`.
3. `speed`: loại `torque|扭矩`.
4. `pf`: `cos` chỉ khớp cả từ (`(?<![a-z])cos(?![a-z])`).
5. `cooling`: kiểu giá trị `TXT` → `COOL` (phải nêu môi chất / "cool").
6. Từ khoá thêm: `吸气` (asp), `燃油率` (fuel), `润滑油` (oil).
7. `keyOf` bỏ `*†‡` cuối; `tidyModel` ở bảng ngang bỏ tiền tố hãng ("PERKINS 1103A-33G") và `*`, chỉ khi phần còn lại vẫn là mã. Không gộp O/0, I/1.
8. `schema.json` khai `specTables` (n/title/header/rows, `additionalProperties:false`) và `brandLicensed`; `verify.mjs` báo lỗi khoá lạ (hồ sơ + từng bảng; không có schema cạnh tệp thì bỏ qua, vì config-bot chép verify.mjs sang thư mục khác).
- Khoá `src` trong 56 bảng: là chỉ số thứ tự (denyo/airman: `src:[k]` cạnh `n:2000+k`; perkins-wuxi `[k+1]`; marelli `[1]`), không trỏ nguồn thật (denyo chỉ có nguồn 1 và 2001–2033, `src:[2]` không có nguồn nào), không code nào đọc (`grep`: chỉ `controllers[].src` và `productLines[].src` là khác). Trùng nghĩa với `n` → BỎ khỏi dữ liệu, không khai trong schema.

## Lệnh kiểm (đầu ra thật)
- `node --test suppliers/*.test.mjs` → `# pass 836  # fail 0` (gồm `regress-config`, `regress-bidprice`: 12 ca, KHÔNG đổi, `fixtures/runs` không đổi).
- `node --test web/test/static.test.mjs` → pass 10 / fail 0; `node --test bot/test/*.test.mjs` → pass 119 / fail 0.
- `node suppliers/verify.mjs` → `435 bản ghi, 0 có lỗi`.
- Playwright (UI) chưa chạy: không đổi `index.html`.
- `codeOf` / `reqcodes.mjs`: KHÔNG đổi từ khoá mã yêu cầu nên không đo `codeOf` (chỉ đổi `SPECS` của catalog).

## Số đo trước/sau (ĐO bằng audit1–5 trên worktree; đầu ra đầy đủ ở `chuan-hoa-1-1\audit-truoc\` và `audit-sau\`)
| Chỉ số | Trước | Sau |
|---|---|---|
| `oil` lấy nhầm suất tiêu hao dầu (audit5) | 282 / 1.949 | 0 / 3.522 (đủ thêm ô 润滑油 容量) |
| `eff` lấy hiệu suất điện tổ máy gas | 26 / 88 | 0 / 62 |
| `speed` lấy cột mô-men | 2 / 2.776 | 0 / 2.778 |
| `pf` nhãn "datos técnicos" | 0 giá trị, nhãn sai | specKey = null (test) |
| `cooling` ATS / Control module (audit3 "giá trị lệch cột") | 151 (128+23) + 1 | 0 (còn `excit` fdk-energy 382, ngoài phạm vi) |
| Ô tiêu đề không gán được mã (audit1) | 15.525 / 42.782 (36,3%) | 15.458 (36,1%) |
| Ô tiêu đề gán được mã | 8.988 | 9.042 |
| Bản ghi động cơ có `oil` / `asp` / `fuel` (audit2, dòng tổ máy) | 1.680 / 545 / 9.773 | 3.489 / 586 / 10.345 |
| `eff` / `cooling` (audit2) | 52 / 208 | 37 / 205 |
| Khoá lạ `src` trong specTables (audit4) | 56 bảng | 0 |
| Nhóm model chỉ khác O/0, I/L/1, `*`, ngoặc (audit3) | 95 | 60 (35 nhóm là `QSK19G4~QSK19G4*` nay cùng khoá) |
| Model mang tiền tố hãng trùng bản không tiền tố | 45 | 19 |
| Model động cơ (khoá chuẩn hoá) | 7.588 | 7.518 |
| Model bị gán ≥2 hãng | 617 | 617 (không đổi, đúng ý) |
| Mâu thuẫn dung tích / cyl / nén (audit3) | 352 / 113 / 37 | 352 / 113 / 37 |
Ghi chú: `燃油率` (59 ô) nay vào `fuel` (giá trị g/kWh, mẫu `Ng/kw.h` 75 → 635); 吸气方式 35 ô vào `asp`; "fuel" cũng tăng vì thế. 19 mã tiền tố còn lại gồm cả `VOLVOTAD1642GE`, `MITSUBISHIS12A2PTA`; chưa xác định nguyên nhân (có thể từ nguồn khác bảng ngang, vd. nhãn bên bán) — chưa xử lý.

## Chỉ ĐO (không sửa)
(a) Dòng lặp nguyên văn cùng NCC: thử tạm (lọc ở cuối `fromSupplier` theo `kind|line`, đã hoàn lại, KHÔNG nằm trong PR; đầu ra ở `audit-thu-bo-dong-lap\`):
- Bản ghi 63.576 → 58.268 (−5.308: động cơ 50.606 → 46.655, đầu phát 12.970 → 11.613); dòng tổ máy 49.348 → 45.447; công suất không đọc được 27,7% → 26,6%.
- Bản ghi động cơ từ dòng lặp 3.953 → 2.
- Model bị gán ≥2 hãng 617 → 555; model không rõ hãng 1.783 → 1.842; mâu thuẫn dung tích 352 → 345; cyl "≥2 NCC ghi" 1.344 → 1.339.
- `regress-config` / `regress-bidprice` / toàn bộ 836 test: KHÔNG đổi (pass 836).
- Lưu ý: dòng lặp là dòng tổ máy (cả bảng tiêu đề lẫn "spec" giống hệt) nên đếm một lần thì mất cả số NCC dùng làm bằng chứng ở các model phổ biến; chưa đo ảnh hưởng lên điểm xếp hạng ngoài lượt hồi quy đóng băng.
(b) 617 model ≥2 hãng: `chuan-hoa-1-1\sau-model-nhieu-hang.tsv` (model, hãng gán, số NCC, nhóm xuất xứ qua được, ghi chú). Qua `groupOf` hiện tại: g7 66, g20 101, g7eu 67, g20eu 102. Lọt NHỜ nhiều hãng (có ít nhất một hãng gán riêng một mình không qua lọc, vd. Baudouin + Deutz): g7 9, g20 5, g7eu 6, g20eu 2. 282 model vừa hãng TQ vừa hãng ngoài bị `cnMade` chặn khỏi lọc G7/G20 (mất nhờ thế, ngược chiều). Trong danh sách có "model" rác (`1-PHASE`, `100% copper`) — ngoài phạm vi, ghi lại.
(c) Nhóm O/0, I/1: `truoc-nhom-O0.txt` (95 nhóm, main) và `sau-nhom-O0.txt` (60 nhóm còn lại).

## 3 mẫu đối chiếu nguồn
1. bdadl-shanghai, nguồn 101 `http://www.bdadl.cn/?products_73/639.html`: tiêu đề "… | 润滑油 容量(L) | 燃油消耗 (g/kw.h) | …" → `润滑油 容量(L)` = oil (dung tích), `燃油消耗` = fuel.
2. wudong-wuxi, nguồn 102 `http://www.wdpower.com/product_item.asp?plt=79&Pone=130`: "… | 最低燃油耗（g/kW.h） | 机油消耗率（g/kW.h） | 排气温度（℃）" → 机油消耗率 không còn bị đọc là `oil`.
3. chenxing-weifang, nguồn 101 `https://www.wfchenxingpower.com/index.php?ac=article&at=read&did=1750`: "| 输出功率 | 200kw | 吸气方式 | 涡轮增压 | 额定功率 | 200kw" → 吸气方式 = asp "涡轮增压".
(Chưa mở lại trang gốc: dùng dòng đã lưu trong `specTables`, `verify.mjs` xanh xác nhận khớp nguồn đã tải.)

## Rủi ro còn lại + quay lui
- `cooling` nay cần môi chất/"cool": giá trị kiểu "Prime power", "ambient temp" bị bỏ (đúng), nhưng cách viết lạ không có từ khoá (vd. chỉ "Fan") sẽ rơi — đã thử trên toàn bộ 28 giá trị cũ, chỉ loại rác.
- `eff` loại "electrical": nếu đầu phát ghi "Electrical efficiency" thật thì mất; hiện dữ liệu chỉ có ở tổ máy gas.
- `verify.mjs` nay từ chối khoá lạ: lượt Tìm Thông Số của agent thêm khoá mới sẽ báo lỗi (có chủ ý).
- Quay lui: revert PR (không đổi dữ liệu nào ngoài bỏ `src`).

## Việc chưa kiểm được / phát hiện ngoài phạm vi
- Nhãn "Power factor" / 功率因数 không bao giờ ra `pf`: `specKeyOf` dòng 159 loại mọi nhãn có "power" trừ khi khớp danh sách ngoại lệ (không có "factor"). pf hiện chỉ lấy từ nhãn `cos…`. Chưa sửa (ngoài mục 1–6 brief; cần đo).
- Ô "Volvo Penta TAD734GE" trong bảng ngang không thành bản ghi (`isCode` từ chối cả ô có hai từ hãng).
- Chưa chạy Playwright.

## Cần ghi nhớ
- `src` trong specTables là rác chỉ số; schema giờ cấm khoá lạ.
- Quyết định chờ Khoa: gộp O/0·I/1 (60 nhóm), luật gán hãng cho 617 model, dedupe dòng lặp (giảm 5.308 bản ghi, 836 test vẫn xanh).
