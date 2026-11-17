# Nghiệm thu cfg-chuyen-mon-3 — Cân bằng công suất chạy trên dữ liệu thật

PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/507 (draft, nhánh `cfg-power`, trên origin/main 93ea919 — đã có #505, #506; 4 commit: d041e93, fcca3e8, ce86062)

## Sửa theo điều phối (10/11, commit d0c0d7a) — THAY cho phần số đo / danh sách cảnh báo bên dưới
Điều phối đối chiếu tay và chỉ ra: (1) fdk-energy "Prime power / Speed = 144kw/1500" là kWe của tổ máy FDK-P198 (144 kW prime), không phải kWm → ca #10–13 sai; (2) sanq-power đuôi "-6" là máy 60 Hz không ghi tần số, bị so với kWm 1500 v/p → ca #1, 7, 9, 13, 19 sai; (3) mọi ca kVA là bảng 60 Hz của jet-power, thiếu ~1,2 lần → bảng Leroy-Somer đã lưu thiếu cột. Đã sửa:
- a. `ratedFacts(label, value, { maker, setPower })`: số của nhà lắp ráp chỉ nhận khi nhãn nêu động cơ (engine / động cơ / 发动机 / 柴油机) VÀ lớn hơn kWe cùng mức của chính tổ máy trên dòng đó; số của hãng động cơ (role engine_maker) cũng bị loại nếu ≤ kWe bên cạnh. Theo model (`kwmOf`): chỉ dùng khi có số của hãng động cơ, hoặc ≥ 2 nhà cung cấp khác nhau khớp ≤ 3%. Số của chính dòng tổ máy qua cùng phép thử.
- b. Chỉ kết luận khi dòng tổ máy / tiêu đề bảng ghi tần số (`row.freq`) hoặc số kWm của chính dòng ghi tốc độ; số kWm theo model phải ghi tốc độ khớp tần số đó. Không ghi → không tính, không cảnh báo.
- c. kVA đầu phát: không còn `warnings`. kVA lớn nhất < kVA prime trên dòng ghi 50 Hz → câu hỏi rfq "Xác nhận kVA định mức đầu phát ở cấp nhiệt chào (datasheet đã lưu ghi lớn nhất … kVA)"; 60 Hz / không ghi tần số → bỏ.
- d. Câu cảnh báo cân bằng công suất kết thúc "— cần NCC xác nhận công suất động cơ (gross/net) và hiệu suất đầu phát." (không khẳng định máy thiếu).
Test: `combo.test.mjs` viết lại 3 test PR 3 (cả hai phía của mỗi quy tắc: 144 = 144 kWe bị loại, nhãn không nêu động cơ bị loại, một nguồn nhà lắp ráp không dùng / một nguồn hãng dùng, dòng không ghi tần số không tính và không cảnh báo, 1500 v/p không dùng cho 60 Hz, kVA dưới mức chỉ hỏi ở 50 Hz). `node --test`: 177/177.

**Đo lại (ĐO, doc-cache supplier 10/11, scratchpad `measure4.mjs`, `kvaask.mjs`, `m12.mjs`):**
| Chỉ số | Trước PR 3 | PR 3 bản đầu | Sau sửa theo điều phối |
|---|---|---|---|
| Toàn danh mục: dòng tổ máy tính được cân bằng công suất | 0 | 56 | **0** |
| Toàn danh mục: cảnh báo thiếu công suất | 0 | 17 | **0** |
| Toàn danh mục: cảnh báo kVA đầu phát | 0 | 12 | **0** (12 dòng "dưới mức": 11 dòng 60 Hz, 1 không ghi tần số → 0 câu hỏi) |
| 12 configmatch: cấu hình tính được | 0/57 | 0/57 | 0/57 |
| Thông số kWm có mức theo model | 0 | 257 dòng / 230 model | 48 dòng / 47 model, **không dòng nào ghi tốc độ** → không dùng được |
| Dòng tổ máy ghi tần số | — | — | 6.703 / 29.003 |
**Còn 0 ca cảnh báo.** Lý do: không còn nguồn kWm nào vừa là của động cơ (hãng động cơ, hoặc nhãn nêu động cơ và > kWe), vừa ghi tốc độ, vừa đi cùng đầu phát có hiệu suất. Datasheet hãng động cơ trong hệ thống hầu như không có (engine_maker: bảng nhiều model mất tiêu đề cột). Kiểm tra sẽ chỉ chạy được khi lưu datasheet hãng động cơ (Cummins / Perkins / Weichai / Yuchai / SDEC, ghi "Prime … kWm @ 1500 rpm") và datasheet đầu phát theo model — điều phối đang hỏi Khoa.
CI sau sửa (d0c0d7a, run 42846745988): app pass 47s, server pass 13s, suppliers pass 16s.
Danh sách 27 ca và 3 ca đối chiếu bên dưới là của BẢN ĐẦU (đã sai theo điều phối), giữ lại để đối chiếu; không ca nào còn ra cảnh báo.

## Tệp đã đổi
- `suppliers/config-bot.mjs`
  - `ratedPower(label, value)` (tách từ `enginePowerOf`), `ratedFacts`, `RATED_KEY`: công suất động cơ **có ghi mức** (prime/standby, kW) thành thông số theo model với khoá riêng `engPrime` / `engStandby` (nguồn: dòng tổ máy và bảng hãng động cơ một model). Không ghi mức ("Engine power (kW) = 264") → không dùng. `engPower` vẫn trong `ROW_ONLY` cho mọi việc khác.
  - `factConflicts`: hai nguồn cùng mức lệch > 3% (theo kW) = mâu thuẫn; mức prime và standby không bị coi là mâu thuẫn. `catalog.md` của agent hiện thêm dòng "Công suất động cơ (prime/standby)" kèm factSrc.
  - `kwmOf(ep, engFacts, freq)`: kWm của dòng tổ máy, không có thì thông số theo model; **chỉ dùng ở đúng tần số** (tốc độ ghi trong nguồn: 1500/3000 v/p ↔ 50 Hz, 1800/3600 ↔ 60 Hz theo n = 120f/p; số không ghi tốc độ không dùng cho dòng 60 Hz); dòng không ghi tần số thì dùng và câu chữ ghi rõ "thông số theo model ở 1500 v/p; dòng tổ máy không ghi tần số".
  - `effRange`: hiệu suất đầu phát = **khoảng** mọi số của các dòng "Efficiency" (80–99,9%; bỏ "Mechanical Efficiency"); nguồn không trùng khoảng → không dùng.
  - `altKvaOf` / `altKvaRange`: dòng kVA của datasheet đầu phát đã lưu (Leroy-Somer "| TAL-A42-C | kVA | …", "| TAL-A42-C kVA | …", Faraday "额定容量（KVA）", Mecc Alte "13kVA"), chỉ dòng có model đầu phát có trong danh mục; kVA lớn nhất mỗi nguồn, nguồn lệch > 3% → không dùng. Không cào mới.
  - `comboChecks`: kWe = kWm × η tính ở hai đầu khoảng (`kwe_from_kwm`). Đạt khi đầu thấp ≥ yêu cầu; **cảnh báo** khi đầu cao < yêu cầu; còn lại "chưa kết luận". kVA đầu phát: cảnh báo chỉ khi kVA LỚN NHẤT của model < kVA prime tổ máy.
- `web/index.html` (phần cấu hình, `cfgPowerShown`): không hiện dòng "chưa kiểm được"; hiện khi đạt / chưa kết luận; cảnh báo vẫn hiện. `c.combo` giữ nguyên.
- `suppliers/combo.test.mjs`: +4 test (khoảng, kWm theo model + 3% + tần số, kVA đầu phát).
- KHÔNG sửa `web/catalog.js` → không đổi `build()` / `builder().step` (không cần so md5).

## Vì sao dùng khoảng, không "cùng cấp nhiệt"
Bảng datasheet đã lưu mất tiêu đề cột: Stamford "| Efficiency (%) | 90.9 | 91.0 | 91.4 | 91.5 | 90.2 | …" (cột điện áp / tải không còn nhãn), Leroy-Somer "| TAL-A44-J | kVA | 143 | 150 | 143 | 73 | 129 | …" (cột cấp nhiệt H/F, 3 pha/1 pha, 50/60 Hz không còn nhãn). Chọn một cột là đoán. Khoảng [nhỏ nhất, lớn nhất] chỉ kết luận khi mọi cột cùng một phía — cùng cách `conversions.js` dùng khoảng khối lượng riêng diesel. Hệ quả: "cùng mức / cấp nhiệt" của kVA đầu phát **không kiểm được**; chỉ bắt được trường hợp ngay cả mức lớn nhất của đầu phát (gồm cả cột 60 Hz / cấp nhiệt cao) vẫn nhỏ hơn kVA prime tổ máy.

## Lệnh kiểm + đầu ra thật
```
cd wt-cfg-kind/suppliers && node --test      # trên 93ea919
# pass 176
# fail 0
```
Web cục bộ (serve.js, IB2600574589 qua code mới + 1 cảnh báo mẫu ghi rõ "(MẪU THỬ GIAO DIỆN)"): không thẻ nào còn dòng "chưa kiểm được, thiếu…"; cảnh báo vẫn hiện; console không lỗi.
CI PR #507 (run 42845649586, ce86062): app pass 1m13s, server pass 15s, suppliers pass 16s.

## Số đo trước / sau (ĐO; doc-cache supplier 10/11; scratchpad `measure4.mjs`, "trước" = cùng script trên worktree tạm origin/main 93ea919)
| Chỉ số | Trước | Sau |
|---|---|---|
| 12 configmatch: cấu hình tính được cân bằng công suất | 0/57 | 0/57 |
| 12 configmatch: cấu hình có kWm có mức (theo model) | 0/57 | 20/57 |
| 12 configmatch: cấu hình có hiệu suất đầu phát | 2/57 | 2/57 |
| 12 configmatch: cấu hình có kVA đầu phát | 0/57 | 2/57 (không cảnh báo) |
| Toàn danh mục: dòng tổ máy tính được (29.003 dòng; 7.655 có model đầu phát) | 0 | 56 (đạt 36, chưa kết luận 3, **cảnh báo 17**) |
| Toàn danh mục: cảnh báo kVA đầu phát | 0 | 12 (437 dòng có kVA đầu phát, không kết luận) |
| Thông số theo model: kWm có mức | 0 | 257 dòng, 230 model động cơ |
| Model đầu phát có khoảng hiệu suất dùng được | — | 20 |
| Model đầu phát có dòng kVA | 0 | 216 |
Hạng / trạng thái check: không đổi.

**Vì sao 12 configmatch vẫn 0:** đầu phát của chúng hầu như không có datasheet hiệu suất (JET444F, EL 314G, Nianfeng NF274H, BW-354D, TFW2…; Stamford HCI444/HCI544/S5L1D chưa lưu datasheet theo model) — 2/57 có hiệu suất; động cơ thiếu kWm có mức ở 37/57 (Weichai WP…, Yuchai YC6T…, SDEC 6ETAA12.8, Volvo TAD1351/1352GE, QSZ13-G3, KTAA19-G5…). Muốn chạy được trên gói thật cần lưu datasheet Stamford HCI/S-series + Leroy-Somer TAL theo model (đã có trang nguồn trong bộ nhớ `config-suggest.md`) và datasheet công suất động cơ (Cummins / Weichai / Yuchai / SDEC) — cần duyệt vì là cào mới.

## Mọi ca cảnh báo (27 ca riêng; 17 dòng công suất + 12 dòng kVA, có dòng trùng ở nhiều bảng)
| # | NCC | Tổ máy | Cảnh báo | Nguồn |
|---|---|---|---|---|
| 1 | sanq-power | SQP100-6 | Cân bằng công suất: Động cơ 73,4 kWm (prime, thông số theo model ở 1500 v/p; dòng tổ máy không ghi tần số) × hiệu suất đầu phát 90,3–91,3% = 66,3–67 kWe < 72 kWe prime (dòng tổ máy). | kWm: fdk-energy#1085 «Prime power / Speed (KW/RPM) = 73.4kw/1500» · η: stamford-avk-china#1001 |
| 2 | keliang-fuan | WT-C140 | Cân bằng công suất: Động cơ 106 kWm (prime) × hiệu suất đầu phát 89,8–91,5% = 95,2–97 kWe < 100 kWe prime (dòng tổ máy). | kWm: fdk-energy#1008 «Prime power / Speed (KW/RPM) = 106/1500» · η: wintpower#1004 |
| 3 | long-gen | LGCS-145 | Cân bằng công suất: Động cơ 106 kWm (prime, thông số theo model ở 1500 v/p; dòng tổ máy không ghi tần số) × hiệu suất đầu phát 91,1–92,2% = 96,6–97,7 kWe < 105 kWe prime (dòng tổ máy). | kWm: fdk-energy#1008 · η: stamford-avk-china#1003 |
| 4 | keliang-fuan | WT-C150 | Cân bằng công suất: Động cơ 120 kWm (prime) × hiệu suất đầu phát 91–92,5% = 109,2–111 kWe < 112 kWe prime (dòng tổ máy). | kWm: fdk-energy#1009 «… = 120/1500» · η: wintpower#1005 |
| 5 | jet-power | C-200 | Công suất đầu phát: mức lớn nhất trong datasheet của TAL-A44-J là 165 kVA < 180 kVA prime của tổ máy (dòng tổ máy) | kVA: leroy-somer-fuzhou#1003 «TAL-A44-J ¦ kVA ¦ 143 ¦ 150 ¦ 143 ¦ 73 …» (bảng jet-power là 60 Hz) |
| 6 | jet-power | C-220 | Công suất đầu phát: TAL-A44-K lớn nhất 187,5 kVA < 200 kVA prime | kVA: leroy-somer-fuzhou#1003 |
| 7 | sanq-power | SQP127-6 | Cân bằng công suất: Động cơ 93,6 kWm (prime, theo model 1500 v/p; dòng không ghi tần số) × 89,8–91,5% = 84,1–85,6 kWe < 90 kWe prime | kWm: fdk-energy#1086 «… = 93.6kw/1500» · η: stamford-avk-china#1002 |
| 8 | jet-power | C-275 | Công suất đầu phát: TAL-A44-M lớn nhất 220 kVA < 250 kVA prime | kVA: leroy-somer-fuzhou#1003 |
| 9 | sanq-power | SQP85-6 | Cân bằng công suất: 59,6 kWm (prime, theo model 1500 v/p) × 90,3–91,3% = 53,8–54,4 kWe < 62 kWe prime | kWm: fdk-energy#1084 · η: stamford-avk-china#1001 |
| 10 | jet-power | P-200 | Cân bằng công suất: 144 kWm (prime) × 91,9–93% = 132,3–133,9 kWe < 144 kWe prime | kWm: fdk-energy#1089 «… = 144kw/1500» · η: stamford-avk-china#1005 |
| 11 | meao-jiangsu | MP-144GF | Cân bằng công suất: 144 kWm (prime, theo model 1500 v/p) × 91,9–93% = 132,3–133,9 kWe < 144 kWe prime | kWm: fdk-energy#1089 · η: stamford-avk-china#1005 |
| 12 | sanq-power | SQP200 | Cân bằng công suất: 144 kWm × 91,9–93% = 132,3–133,9 kWe < 144 kWe prime | kWm: fdk-energy#1089 · η: stamford-avk-china#1005 |
| 13 | sanq-power | SQP220-6 | Cân bằng công suất: 144 kWm × 91,9–92,9% = 132,3–133,8 kWe < 160 kWe prime | kWm: fdk-energy#1089 · η: stamford-avk-china#1004 |
| 14 | jet-power | C-176 | Công suất đầu phát: TAL-A44-H lớn nhất 151,5 kVA < 160 kVA prime | kVA: leroy-somer-fuzhou#1003 |
| 15 | keliang-fuan | WT-C303 | Cân bằng công suất: 231 kWm (prime) × 92,2–93,2% = 213–215,3 kWe < 220 kWe prime | kWm: fdk-energy#1049 «… = 231/1500» · η: wintpower#1007 |
| 16 | jet-power | P-17 | Cân bằng công suất: 13 kWm (prime) × 82,4–85% = 10,7–11,1 kWe < 12 kWe prime | kWm: fdk-energy#1079 «… = 13kw/1500» · η: stamford-avk-china#1007 |
| 17 | meao-jiangsu | MP-12GF | như #16 (dòng không ghi tần số) | kWm: fdk-energy#1079 · η: stamford-avk-china#1007 |
| 18 | sanq-power | SQP16 | Cân bằng công suất: 13 kWm × 80,6–83,4% = 10,5–10,8 kWe < 12 kWe prime | kWm: fdk-energy#1079 · η: stamford-avk-china#1006 |
| 19 | sanq-power | SQP20-6 | Cân bằng công suất: 13 kWm × 80,6–83,4% = 10,5–10,8 kWe < 14 kWe prime | kWm: fdk-energy#1079 · η: stamford-avk-china#1006 |
| 20 | penlucky | PLY175 | Công suất đầu phát: TAL-A44-J lớn nhất 165 kVA < 175 kVA prime | kVA: leroy-somer-fuzhou#1003 |
| 21 | jet-power | HD-253 | Công suất đầu phát: TAL-A44-M lớn nhất 220 kVA < 230 kVA prime | kVA: leroy-somer-fuzhou#1003 |
| 22 | jet-power | HD-193T4 | Công suất đầu phát: TAL-A44-J lớn nhất 165 kVA < 174 kVA prime | kVA: leroy-somer-fuzhou#1003 |
| 23 | jet-power | HD-163T4 | Công suất đầu phát: TAL-A44-E lớn nhất 137,5 kVA < 148 kVA prime | kVA: leroy-somer-fuzhou#1003 |
| 24 | jet-power | HD-220T4 | Công suất đầu phát: TAL-A44-L lớn nhất 200 kVA < 219 kVA prime | kVA: leroy-somer-fuzhou#1003 |
| 25 | jet-power | HD-261T3 | Công suất đầu phát: TAL-A44-M lớn nhất 220 kVA < 261 kVA prime | kVA: leroy-somer-fuzhou#1003 |
| 26 | jet-power | HD-163T3 | Công suất đầu phát: TAL-A44-E lớn nhất 137,5 kVA < 163 kVA prime | kVA: leroy-somer-fuzhou#1003 |
| 27 | jet-power | HD-219T3 | Công suất đầu phát: TAL-A44-K lớn nhất 187,5 kVA < 219 kVA prime | kVA: leroy-somer-fuzhou#1003 |
Danh sách đầy đủ (kèm dòng bảng): scratchpad `measure4-list.txt`. Nguồn: fdk-energy #1008 = https://fdkenergy.com/wp-content/uploads/2026/03/CD125-H1-6BTA5.9G2.pdf, #1086 = …/P110-H1.pdf; stamford-avk-china #1002 = https://www.stamford-avk.com/sites/stamfordavk/files/UCI274C-311-TD-EN_Rev_D.pdf, #1003 = …/UCI274D-14-TD-EN_Rev_C.pdf; leroy-somer-fuzhou #1003 = https://www.leroy-somer.com/documentation_pdf/6610_en.pdf.

## 3 ca đối chiếu tay
1. **long-gen LGCS-145 (#3).** Dòng bảng (https://www.long-gen.com/high-quality-cummins-diesel-generator-17kw-1340kw-product/): "| LGCS-145 | 105 | 131 | 116 | 145 | 6BTA5.9-G2 | UCI274D | …" → prime 105 kW / 131 kVA. Động cơ: fdk-energy CD125-H1-6BTA5.9G2.pdf "| Prime power / Speed (KW/RPM) | 106/1500". Đầu phát: Stamford UCI274D-14 TD "| Efficiency (%) | 91.6 | 92.0 | 92.2 | 91.4 | 91.7 | 92.0 | 91.2 | …" (khoảng 91,1–92,2%). 106 × 0,922 = 97,7 < 105 → cảnh báo đúng: không cột hiệu suất nào cho ra 105 kWe từ 106 kWm (cần ≥ 99,1%).
2. **sanq-power SQP127-6 (#7).** Dòng (http://www.gz-sanqpower.com/Perkins/Powered-by-Perkins.html): "| SQP127-6 | 100/127 | 90/112 | 1104C-44TAG2 | UCI274C | …" → prime 90 kW. Động cơ: fdk-energy P110-H1.pdf "Prime power / Speed (KW/RPM) | 93.6kw/1500". Đầu phát: Stamford UCI274C-311 TD, hai dòng Efficiency 89,8–91,5%. 93,6 × 0,915 = 85,6 < 90 → cảnh báo đúng. Dòng này không ghi tần số (câu chữ cảnh báo nói rõ). Trên cùng bảng, SQP110 (80 kW prime cùng động cơ) ra "đạt" 84,1–85,6 ≥ 80 — nhất quán.
3. **jet-power C-200 (#5, kVA).** Dòng (https://www.jetgenset.com/60hz-cummins-water-cooled-diesel-generator-set-supply.html, bảng **60 Hz**): "| C-200 | 200 | 160 | 180 | 144 | 6CTA8.3-G2 | … | TAL-A44-J" → prime 180 kVA. Leroy-Somer 6610_en.pdf "| TAL-A44-J | kVA | 143 | 150 | 143 | 73 | 129 | 135 | 129 | 66 | 150 | …", lớn nhất 165 kVA (gồm cả cột 60 Hz) < 180 → cảnh báo đúng. Cân bằng công suất của dòng này KHÔNG tính (thông số động cơ 6CTA8.3-G2 theo model ở 1500 v/p, dòng 60 Hz) — đúng chặn tần số (ce86062).

## Rủi ro còn lại
- Mọi kWm theo model trong các ca cảnh báo đến từ một nguồn (fdk-energy, "Prime power / Speed (KW/RPM)" trên datasheet tổ máy của họ). Nếu fdk ghi nhầm thì cảnh báo nhầm; quy tắc 3% chỉ bắt khi có nguồn thứ hai.
- Dòng tổ máy không ghi tần số (77% danh mục) dùng kWm 1500 v/p — nếu thực ra là bảng 60 Hz thì so sai; câu cảnh báo ghi rõ điều này.
- kVA đầu phát: chỉ bắt khi cả mức lớn nhất (mọi cột) < kVA prime; trường hợp đầu phát nhỏ hơn ở đúng cấp nhiệt nhưng có cột lớn hơn ở cấp khác thì không bắt.
- Agent thấy thêm dòng "Công suất động cơ (prime/standby)" trong catalog.md → có thể dùng làm factSrc cho check "Công suất động cơ" (code kiểm nguyên văn như mọi factSrc).
- Tiến trình `config-bot.mjs run` đang chạy giữ code cũ.

## Quay lui
Revert PR #507 (4 commit, có thể squash). Không dữ liệu nào trên web bị đổi; configmatch ghi bằng code mới có thêm `combo.altKva`, `combo.power.value` là khoảng — web cũ bỏ qua.

## Chưa kiểm được
- Cân bằng công suất trên cấu hình của gói thật (0/57 vì thiếu hiệu suất đầu phát, xem trên).
- "Cùng cấp nhiệt" cho kVA đầu phát (bảng đã lưu mất tiêu đề cột).
- Chưa xem trên Vercel preview.
