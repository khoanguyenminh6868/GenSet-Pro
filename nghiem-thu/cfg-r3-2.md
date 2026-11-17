# Nghiệm thu cfg-r3-2 — quy tắc Khoa duyệt 11/11 ("ok, em làm 4 ý trên đi")

Cùng PR (DRAFT) https://github.com/khoanguyenminh6868/GenSet-Pro/pull/523, commit b08fa88 (sau a4e5e90 của phần 1–2, xem `cfg-r3-1.md`). Cách đo, bản chụp supplier và bảng "chưa rõ" theo mã: như `cfg-r3-1.md` (cột "sau phần 3–4").

## Tệp đã đổi
- `suppliers/config-bot.mjs`: `khoaRules(c, reqs, row, { origin })` gọi trong `check()` sau `altAttrChecks`; `rfqOf` đưa lý do (`why`) của điểm confirm vào ghi chú dòng câu hỏi.
- `suppliers/cfg-r3.test.mjs`: 4 test (`khoaRules` 1/2/3 + bảng câu hỏi NCC).

## Quy tắc như đã làm
1. **Vỏ máy** (dimensions / weight / noise / ambient): dòng tổ máy của cấu hình không có số → confirm (order), ghi chú "phụ thuộc vỏ cách âm / két nước do nhà lắp ráp chọn". Dòng có số → so: đạt / không đạt; hai bản (open / silent) trên tiêu đề, độ ồn khác khoảng cách hay có dải ±, HSMT đòi "có vỏ giảm âm" mà dòng không nói bản nào → giữ nguyên. HSMT ghi số cố định (không ≤ / ≥) → confirm + ghi chú "số cố định, có thể chép từ một model". Cấu hình không có dòng bảng của mình (nguồn internet / dòng không còn) → giữ nguyên.
2. **Quá tải**: đạt khi tiêu đề bảng của dòng ghi rõ cột Prime/PRP (cùng `ratedRowPower` của phần 1–2) và HSMT đòi ≤ 10% trong ≤ 1 giờ mỗi ≥ 12 giờ (10% / 1 h / 24 h lỏng hơn PRP nên cũng đạt — có test, chưa có ca thật có dòng); còn lại confirm (order). Ghi chú căn cứ: "ISO 8528-1: định mức Prime (PRP) cho phép quá tải 10% trong 1 giờ mỗi 12 giờ vận hành". Quá tải ghi theo standby/dự phòng/ESP → giữ nguyên (clarifyOf hỏi chủ đầu tư).
3. **Kê khai**: câu HSMT (quote, bỏ số thứ tự dòng bảng và đơn vị trong ngoặc) + requirement có "nêu cụ thể / nêu rõ / ghi rõ / kê khai / nhà thầu ghi…" và KHÔNG có dấu ≥ ≤ < > ± hay chữ số → confirm (document). Có ngưỡng lẫn chữ "nêu" (vd. "≤ 3000 kg (nêu cụ thể)") → không áp (test).
4. Không áp kê khai cho: genset_origin / engine_origin / alt_origin / ctl_origin ở gói có lọc G7/G20 (`origin` g7/g20/g7eu/g20eu); genset_make, brand_sync, iso8528_class, load_step, power_prime/standby. genset_origin / alt_origin không kê khai: giữ nguyên.
Chung: chỉ đổi check "chưa rõ" (không conflict / version / nhóm) hoặc thêm check khi cấu hình chưa có; "đạt" / "không đạt" có sẵn giữ nguyên.

## Số dòng đổi theo từng quy tắc (ĐO, 48 cấu hình, a4e5e90 → b08fa88)
| Quy tắc | Mã | Đổi |
|---|---|---|
| (1) vỏ máy | ambient | 19 unclear → confirm (order) |
| | noise | 13 unclear + 1 mới → confirm (order) |
| | dimensions | 18 unclear + (1 mới, kê khai) → confirm (order) 18 |
| | weight | 13 → confirm (order) (+ 1 check mới) |
| | — đạt / không đạt mới | **0 / 0** (ca duy nhất có số so được, IB2600603983 #3 UP750GF 4450x1750x2350 ≤ 5800x2000x2800, HSMT "có vỏ giảm âm", dòng không nói bản → giữ chưa rõ) |
| (2) quá tải | overload | 7 unclear → met; 2 unclear → confirm (order) |
| (3) kê khai | weight 4, dimensions 1, cylinders 2, compression 2, bore_stroke 2, ctl_model 2 | 13 → confirm (document) (gồm check mới cho cấu hình chưa có) |
| (4) | genset_origin, alt_origin, engine_origin, ctl_origin, genset_make ở IB2600603983 (g7eu) | 18 dòng "Nêu cụ thể" giữ chưa rõ, đúng quy tắc |

Tổng "chưa rõ" tổ máy 270 → 195 (ambient 23→4, dimensions 20→2, noise 19→6, weight 17→1, overload 12→3); động cơ 306→300; BĐK 100→99. Còn lại của nhóm (1) là cấu hình không có dòng bảng của mình (12/13) + 1 ca có số không so được.

## Bảng đếm của mục 3 brief (sau bước 0 = nền main, và sau PR)
| Nhóm | Nền: chưa rõ | trong đó nguồn CÓ ghi số | không có dòng bảng | Sau PR: chưa rõ |
|---|---|---|---|---|
| kích thước / khối lượng / độ ồn / nhiệt độ | 79 | 4 | 14 | 13 |
| quá tải 110% | 12 | 7 (dòng ghi rõ cột Prime) | 3 | 3 |
| "nêu cụ thể / ghi rõ" | 30 | — (không ngưỡng) | — | 18 (đều ở gói G7 hoặc hãng tổ máy) |
| genset_origin | 21 | 0 | 7 | 21 |
| genset_make | 9 | 0 | 3 | 9 |
| iso8528_class | 20 | 0 | 5 | 20 |
| load_step | 10 | 0 | 1 | 10 |

## Không mất gì
- **0 "không đạt" mất** (so từng check theo item + thứ tự xuất hiện, nền → sau cả hai phần).
- **0 thứ hạng đổi** ở cả 12 gói (mọi cấu hình cùng gói được đổi giống nhau).
- **Bảng câu hỏi NCC (`rfqOf`)**: 48 cấu hình, điểm 1.116 → 1.109; 7 điểm bớt đều do check thành "đạt" (quá tải); **0 điểm mất**; điểm confirm nằm ở dòng "Cấu hình đặt hàng" (tầng 4) / "Chứng từ" (tầng 5) kèm lý do. Nền main → sau PR: 1.150 → 1.109, 41 bớt vì đạt, 0 mất.

## Mẫu đối chiếu (1 mẫu mỗi quy tắc)
1. **Vỏ máy → confirm** — IB2600581977 #1 (TAD1351GE + HCI444ES): HSMT ambient "≥ 40 °C"; nguồn jet-power [132] https://www.jetgenset.com/water-cooled-volvo-penta-diesel-generator-set-wholesale.html dòng "| V-344 | 344 | 275 | 313 | 250 | TAD1351GE | 6 / In Line | 131×158 mm | 12.78 | Electronic | 18.1:1 | HCI444ES" — không có °C / kích thước / dB → confirm (order). Số cố định: IB2600592684-1 #1, HSMT khối lượng "1.100 kg" (không ≤) → confirm + ghi chú số cố định (nguồn voltgent [103] https://www.voltgent.com/diesel-gensets/powered-by-cummins.html, dòng không có khối lượng).
2. **Quá tải → đạt** — IB2600603983 #2 (4006-23TAG3A + S5L1D-H4): HSMT "14 Khả năng quá tải 10% tải trong vòng 01 [giờ…12 giờ]"; nguồn fdk-energy [103] https://fdkenergy.com/diesel-generator-set-9-3250kva/ tiêu đề "| | Genset Model | Standby Power | Prime Power | …", dòng "| P825/H1 CONTACT | 825KVA/ 660KW | 750KVA/ 600KW | 4006-23TAG3A | Perkins China | Stamford S5L1D-H4 |…" → đạt (PRP 750 kVA). Ngược lại #3 UP750GF (uleengen, "Power(kW) | Power(kVA)" không nhãn) → confirm (order).
3. **Kê khai → cần chứng từ** — IB2600601812 #1/#2: HSMT "14 Hành trình xilanh Nêu cụ thể", "11 Số xy lanh Nêu cụ thể", "13 Tỉ số nén Nêu cụ thể" → confirm (document). Không áp: IB2600603983 "2 Nước sản xuất (Quốc gia … Nêu cụ thể" (genset_origin, gói g7eu).

## Rủi ro + quay lui
- (1) có thể sinh "không đạt" mới khi dòng ghi số vượt ngưỡng HSMT (0 ca trong dữ liệu đo); "có vỏ / không vỏ" chỉ nhận qua chữ open/silent/canopy trên tiêu đề hoặc nhãn — bảng ghi hai bản mà không có chữ đó sẽ bị so với số đầu tiên.
- (2) đạt dựa trên nhãn cột "Prime/PRP" của nhà lắp ráp (không phải tờ hãng động cơ); đúng quy tắc Khoa duyệt.
- (3) nhận dạng bằng chữ; HSMT kê khai mà có chữ số khác (vd. "Nêu cụ thể (Model 2024)") sẽ không áp → vẫn chưa rõ (an toàn).
- Quay lui: revert commit b08fa88 (độc lập với phần 1–2). Trường mới `rule`, `why` trên check bị web cũ bỏ qua.

## Sửa theo điều phối (commit bdbcd39)
- **(A) Quá tải:** chỉ "đạt" khi tiêu đề cột ghi Prime / PRP / 主用 / 常用 (`PRP_HEAD`); cột chỉ ghi Continuous / liên tục → confirm (order), ghi chú "định mức Continuous không cho quá tải theo ISO 8528-1". `ROW_RATING` cho công suất / cosφ / dòng điện không đổi (test: `ratedRowPower` vẫn đọc cột Continuous là prime).
  - Đo: **0 ca met → confirm** — 7 ca "đạt" đều có tiêu đề Prime/PRP: IB2600574589 #1 "| Standby output | Prime Output |", #2 "| Prime power (kW) | Prime power (kVA) |", #4 "| PRP KW/KVA | EPS KW/KVA |", #5 "| Standby output | Prime Output |"; IB2600603983 #2 "| Standby Power | Prime Power |", #4 "| Prime Power (Kva) | Prime Power (kWe) |", #5 "| Prime kW | Prime kVA |".
- **(B) Vỏ máy + kê khai:** (i) confirm giữ `offered` / `sourceQuote` cũ — 46 check confirm nay giữ chữ của agent, trong đó 8 có số (IB2600592684-2 #1 "3300x1460x2100 mm", "3550 kg"; #2 "4500*1800*2745 mm"; IB2600601812 #1 "3200 x 1050 x 1760 mm", "1570 kg", số xi lanh "6"…). (ii) HSMT có ngưỡng, nguồn dòng bảng không có số mà agent đã có số → giữ "chưa rõ": **0 ca** trong dữ liệu (các ca agent có số đều thuộc HSMT số cố định, kê khai, hoặc cấu hình không có dòng bảng — vốn đã giữ nguyên; có test). (iii) số cố định: vẫn confirm, giữ `offered`, ghi chú chỉ nêu "số cố định" khi agent có số.
- Đo lại (cùng bản chụp): trạng thái mọi check **không đổi** so với b08fa88; tổng "chưa rõ" tổ máy vẫn **195** (nền 298); **0 "không đạt" mất, 0 thứ hạng đổi**; bảng câu hỏi NCC 1.150 → 1.109, 0 điểm mất.
- `node --test` 218 pass (thêm 2 test), `verify.mjs` 432 bản ghi 0 lỗi.

## Việc chưa kiểm
- Chưa chạy agent thật; chưa xem web hiển thị ghi chú confirm mới (dùng sẵn trường `note`).
- Quá tải 1 h / 24 h (IB2600601812) chưa có ca thật có dòng bảng (cả 2 cấu hình là nguồn internet → giữ nguyên).
