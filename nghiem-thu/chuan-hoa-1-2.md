# Nghiệm thu chuan-hoa-1 (lần 2 = chuan-hoa-1b) — 14/11/2026

PR (DRAFT): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/781 — nhánh `chuan-hoa-1b` từ main `9c390352` (#779). Không tự merge.

## Tệp đã đổi
`web/catalog.js`, `suppliers/spec-read.test.mjs`. Không đổi dữ liệu, không đổi fixture.

## Thay đổi
1. `pf`: `specKeyOf` loại nhãn có "power" trừ danh sách ngoại lệ; thêm `power\s*factor|功率因数` vào ngoại lệ (nhãn "Rated power", "Prime Power (kW)" vẫn không phải `pf`).
2. Làm mát: nhãn Aftercooling / Charge Air Cooling / Piston Cooling / Inter-cooling / Air/Air|Water cooling / 增压空气 / 活塞冷却 không còn khớp `cooling`. Khoá mới `aircool` "Làm mát khí nạp / piston" (đứng trước `cooling`).
   - Lý do không chỉ loại bỏ: lần đầu chỉ loại, `regress-config` IB2600603983/config đỏ: tiêu chí HSMT "Nạp khí (tăng áp, làm mát khí nạp)" của cấu hình hạng 2 (Cummins QSK23-G2) từ `met` thành `unclear` (engine 8/0/6/0 → 7/0/7/0, problems 0→1) vì bằng chứng "Charge Air Cooling | Air-to-Air Heat" chỉ có qua nhãn bị đọc nhầm là `cooling`. Giữ dữ liệu bằng khoá riêng thì kết quả hồi quy KHÔNG đổi (không cập nhật fixture).
3. `fuel`: bỏ `%` khỏi dạng giá trị hợp lệ `FUEL_OK`.

## Lệnh kiểm
- `node --test suppliers/*.test.mjs web/test/static.test.mjs bot/test/*.test.mjs` → `# pass 968  # fail 0` (836 cũ + test web/bot; `spec-read.test.mjs` 11 ca); `regress-config`, `regress-bidprice` KHÔNG đổi, `git diff suppliers/fixtures` rỗng.
- `node suppliers/verify.mjs` → 435 bản ghi, 0 lỗi (không đổi dữ liệu).
- Số bản ghi (audit2): 63.576 (động cơ 50.606, đầu phát 12.970), không đổi so với #779.

## Số đo trước (main 9c390352) / sau (ĐO, so từng cặp bản ghi-nhãn-giá trị trên toàn bộ fromSupplier)
| Chỉ số | Trước | Sau |
|---|---|---|
| `pf` giá trị (dòng tổ máy, audit2) | 145 (nhãn `cos…`) | 1.175 giá trị mới → 993 dòng tổ máy (2,0%) |
| `cooling` nhãn Aftercooling / Charge Air / Piston | 3 bản ghi (aosif) | 0 (chuyển `aircool`: 3) |
| `fuel` giá trị phần trăm | 17 (lees-power) | 0 |
| Bản ghi bị mất so với trước | — | 21 cặp: 3 cooling→aircool, 17 fuel %, 1 `pf` "Factor (Cos Phi)" westinpower (dòng `undefined`, giá trị 0.8; xem dưới) |
Chi tiết: `chuan-hoa-1-2\pf-gia-tri-moi.tsv` (1.175 dòng: ncc, loại, khoá, nhãn, giá trị, dòng nguồn), `pf-nhan-moi.txt` (đếm theo nhãn).

### Nhãn → giá trị mới của `pf` (để kiểm không lấy nhầm cột khác)
Power Factor 285; 功率因数 229; 额定功率因数 218; Rated Power Factor(cosφ) 131; Power factor 110; 功率因数 Power Factor 64; Power Factor (Cos Phi) 50; Power factor(cosΦ) 14; 功率因数cosφ 12; 功率因数cos 10; Rated Power Factor 8; Power factor (φ) 7; Power factor Φ 6; "Power factor ()" 6; Power factor (cos?) 5; Power factor (Cos Φ) 4 …; nhãn còn lại ≤2 mỗi loại. Mọi nhãn đều có "power factor"/功率因数 — không có nhãn khác lọt vào. Giá trị: 0.8 ×1.084; "Cos Φ = 0.8" ×32; 1 ×25; "1.0 0.8" ×15; 0.7 ×8 (jichai H16V190, đúng cột "Power factor" của bảng nguồn 107); 0.8（lagging/滞后性）×5. Kiểu giá trị `pf` (`0[.,]\d|^1$`) vẫn chặn cột khác.
- Mất 1 giá trị westinpower: nhãn "Factor (Cos Phi)" = 0.8 (bản ghi không có dòng nguồn `undefined`) không còn ra `pf`; chưa xác định nguyên nhân (nhiều khả năng cùng bản ghi nay lấy nhãn "Power factor…" khác, nên cặp nhãn-giá trị đổi chứ không mất giá trị). Ảnh hưởng tối đa 1 giá trị.

## (3) lees-power "Gas Consumption" = "42%" — chỉ đo → đã sửa (nguyên nhân rõ, hẹp)
- Bảng lees-power nguồn 134 (`https://www.leespower.com/CUMMINS-GAS-GENERATOR-SET-pd181395538.html`): hàng tiêu đề 1 có 7 ô ("Model | Electrical Power KW | Electrical Efficiency | Gas Consumption | …"), hàng tiêu đề 2 "LEES | CUMMINS | n % | Nm3/h", nhưng dòng dữ liệu có thêm cột động cơ ("LSC1000NGE3 | K50N-G10H | 1000 | 42% | 252.9 | …"): tiêu đề ngắn hơn dữ liệu 1 cột nên "Gas Consumption" nằm trên ô "42%" (hiệu suất điện), tiêu hao thật là 252,9 Nm3/h.
- Không phải do #779: 20 dòng lees-power có "Gas Consumption" trước #779 cũng đã có (6 giá trị `42%`, 6×33%, …), chỉ là trước đó cạnh `eff`. Tổng 17 giá trị `%` bị đọc thành fuel (không phải 6): 33%×6, 38%×3, 40%×1, 41%×1, 42%×6.
- Sửa hẹp: `FUEL_OK` không nhận `%`. Không có giá trị `%` nào khác trong 11.878 giá trị `fuel` ngoài lees-power. Tiêu hao thật (12.2, 252.9 …) vẫn lệch sang cột "Open Type" vì cùng lỗi lệch tiêu đề: không sửa (cần xử lý hàng tiêu đề ngắn hơn dữ liệu, ngoài phạm vi).

## 3 mẫu đối chiếu nguồn
1. jichai nguồn 107 `https://www.jichai.com/product/190_series_800kw2000kw/6000_series_1200kw2000kw.html`: "| Genset model | Rated power kw | Rotate speed r/min | Frequency Hz | Voltage V | Engine model | Power factor" + dòng "| 1200GF | 1200 | 1000 | 50 | 600 | H16V190ZL-2 | 0.7" → pf 0.7.
2. aosif nguồn 1088 `https://www.aosif.com/w/files/doc/2025/12/255710133332.pdf`: "| Charge Air Cooling | Air-to-Air Heat" → `aircool`, không còn `cooling`.
3. lees-power nguồn 134 (URL trên): "| LSC1000NGE3 | K50N-G10H | 1000 | 42% | 252.9 | …" → không còn `fuel` 42%.
(Dòng lấy từ `specTables` đã qua verify; chưa mở lại trang gốc.)

## Rủi ro còn lại + quay lui
- Khoá mới `aircool` hiện chưa hiển thị riêng trong UI ngoài danh sách thông số động cơ (đi theo `SPECS`): kiểm bằng Playwright chưa chạy (không đổi `index.html`).
- Hệ số công suất đọc được nhiều hơn: các nơi dùng `pf` của hàng (so khớp tiêu chí `alt_pf` / giá gợi ý) có thể đổi kết quả với dữ liệu khác; regress đóng băng không đổi.
- Quay lui: revert PR.

## Cần ghi nhớ
- Bảng lees-power 134: tiêu đề ngắn hơn dữ liệu 1 cột → mọi cột sau "Electrical Power" lệch; chưa xử lý chung (tiêu đề lệch cột).
- Trước khi loại một nhãn khỏi khoá, kiểm `regress-config`: bằng chứng của tiêu chí có thể chỉ đến từ nhãn bị đọc nhầm.
