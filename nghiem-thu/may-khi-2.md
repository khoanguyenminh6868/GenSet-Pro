**Kết luận: PR 1 (catalog) xong, DRAFT: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/958 (nhánh `khi-fuel-1`, commit 623f4b89, nền origin/main 79e9b175 — từ a52179ee tới đó chỉ đổi 2 tệp bộ nhớ bot). Catalog ghi `fuel` cho 765 / 60.073 bản ghi (khí 696, xăng 44, xăng/khí 25; mức B 255, T 437, M 73); 156 bảng diesel bị nhầm và 5 bảng không rõ đều RỖNG; khác bảng phân loại tay đúng 1 nhóm (weichai-power n125–128, 10 bản ghi, cố ý không ghi) + bảng 0 bản ghi. COP: 47 bản ghi đổi công suất prime → rated (42 agg-fuzhou + 5 ngoài danh sách của brief, liệt kê ở mục 3). spec-diff: ngoài trường mới và nhóm COP, 0 bản ghi đổi.**

Phạm vi: `web/catalog.js`, `suppliers/fuel.test.mjs`, `web/CLAUDE.md`. Không đụng `config-bot.mjs`, `genbid-hsmt\`, web thật.

## 1. Luật (`fuelOf(bảng, url, dòng)` cạnh `gasTable`)
Theo mục 4.1–4.3 của `may-khi-1.md`. Nguồn dấu hiệu: B = chính bảng (ô nhãn "Fuel Type | …" / 燃料 / 燃气种类 + giá trị; chữ khí, xăng ở tiêu đề cột hoặc dòng bảng); M = mã model của CHÍNH dòng đuôi `-NG` / `*7NG` / `-LPG` / `-BG` kèm tiêu đề hoặc URL khí (URL lấy từ `s.sources[n].url`); T = chỉ tên trang hoặc URL. Gộp: một loại → mức mạnh nhất (B > M > T); khí + xăng → `dual`, mức yếu nhất trong hai loại. KHÔNG ghi khi: tiêu đề nêu cả diesel lẫn khí (menu, khẩu hiệu; chữ diesel trong tên công ty "… CO. LTD" không tính); diesel ở nguồn nào của trang cạnh chữ khí / xăng; m³/h trơ; mã động cơ trơ; "Gas" dính tên ("GasGenerators"); bể chứa khí; tiêu đề "Gas Generator" mà bảng ghi tiêu hao bằng lít.
`fuelWhy` = câu đọc được, vd. `bảng ghi "Fuel Type | Natural gas/Biogas"`, `mã model + URL: DC260G6-NG … natural gas`.
Giữ tới `build()`: trường nằm trên chính bản ghi `fromSupplier` nên là `cat.engines[].uses[i]` / `cat.alternators[].uses[i]` (cùng chỗ `line`, `n`, `table`).

## 2. Giao diện dữ liệu cho PR 2 (config-bot, phiên khác)
- Ở đâu: mỗi phần tử `uses` của `engines` và `alternators` trong kết quả `CAT.build()` (`u.fuel`, `u.fuelFrom`, `u.fuelWhy`); dòng nào không đủ dấu hiệu thì KHÔNG có ba khoá này (`undefined`, không phải chuỗi rỗng, không phải "diesel"). Cùng một model có thể có `uses` khác nhau về `fuel` (nhiều NCC / bảng): loại theo TỪNG use, không theo model.
- Giá trị: `fuel` ∈ `"gas"` | `"gasoline"` | `"dual"` (xăng + LPG / khí, vd. slong, victory n118); `fuelFrom` ∈ `"B"` | `"M"` | `"T"`; `fuelWhy` chuỗi.
- Luật gợi ý cho PR 2 (theo quyết định Khoa 20/11): HSMT nêu diesel → loại use có `fuel` (mọi giá trị); HSMT nêu khí → loại diesel nghĩa là use KHÔNG có `fuel` thì giữ (rỗng ≠ diesel; không thể loại use rỗng vì "không biết"); HSMT không nêu nhiên liệu → coi diesel (loại use có `fuel`); mức T dùng được (Khoa chốt). `fuelOf(table, url, line)` xuất ở `GenbidCatalog` nếu cần tính lại từ bảng.
- Bản ghi gộp: `mergeRepeats` giữ bản ghi đầu; hai bảng cùng dòng mà `fuel` khác nhau thì bỏ cả ba khoá (không đoán). Bản ghi `fromLine` (dòng máy Tìm NCC một model) cũng mang `fuel` của bảng chứa dòng đó.

## 3. COP / Continuous
Nguyên nhân: `PRIME` (catalog.js dòng 78) có `continuous | cop | liên tục`; `powersIn` (tiêu đề cột "COP (kVA/kW)") và bảng nhãn (`kind = PRIME.test(L)`) và `sheet 2 cặp` dùng nó làm "prime". Sửa: `PRIME_RATE = prime | PRP | 常用 | 主用` cho ba chỗ đó; `PRIME` cũ chỉ còn cho "nhãn có nêu mức" (dòng 745) và phía HSMT (dòng 1922, không đụng). Tiêu đề COP + standby một cặp vẫn `rated` như trước (không thành standby).
Bản ghi đổi (spec-diff `git:origin/main ↔ .`: "khác 47, chỉ cũ 0, chỉ mới 0, bảng có đổi 7, {"power":47}"; đảo vai 0 → 0):
| nhóm | bản ghi | đổi |
|---|---|---|
| agg-fuzhou n115 / 116 / 117 / 118 (đúng danh sách brief: 42 dòng, mỗi dòng một bản ghi động cơ) | 23 + 11 + 6 + 2 = 42 | prime kVA/kW → rated kVA/kW (ví dụ DC260G6-NG 260/208) |
| hosem-power n112 (đúng brief: 1 dòng nhãn, 2 bản ghi động cơ + đầu phát) | 2 | prime 200 kVA → rated 200 kVA |
| NGOÀI danh sách brief, cùng nguyên nhân: hosem-power n120 (A-C250HS: dòng "Continuous Output \| 250kVA") | 2 | thêm `rated` 250 kVA (prime 250 / standby 275 từ dòng khác giữ nguyên) |
| NGOÀI: bison-zhejiang n1003 (gasoline, bảng nhãn nhiều sản phẩm "Rated Power COP(KW)") BS170F / 1E45F | 1 | prime 0,65 → rated 0,65; `rated` 2,5 cũ bị đè (cả hai đều lấy từ bảng lệch cột sẵn) |
Không bản ghi nào MẤT; không đổi số khác. `cmp.cjs` riêng (so JSON mọi trường trừ trường mới): 49 "khác" = 47 trên + yihua-fujian n106 (2, chỉ khác thứ tự khoá `prime` / `rated`, giá trị y nhau). Row-flags (`row-flags.mjs --json`): 158 → 159 dòng; dòng MỚI duy nhất = bison n1003 BS170F `absurd` ("current 5.9/2.9") là hệ quả của dòng bison ở trên (bảng đã lệch cột, đáng bỏ), không dòng nào mất.

## 4. Kiểm
(a) Phân loại do code ra vs `phan-loai-bang.tsv`, TỪNG BẢNG (`fuelcmp.cjs` mức bảng, `reccmp.cjs` mức bản ghi, ở thư mục scratchpad của phiên; 9.812 bảng, 60.073 bản ghi):
- Mức bản ghi: 60.063 / 60.073 bản ghi khớp lớp phân tay (khí / xăng / dual / rỗng); 156 bảng diesel nhầm + 5 bảng không rõ: toàn bộ RỖNG. Lệch 10 bản ghi = weichai-power n125 (4), n126 (2), n127 (2), n128 (2): bảng chỉ có `PG…*7NG` + động cơ `…N0/5`, tiêu đề "Standard Land-based Generator Set" và URL không có chữ khí; phân tay chấm M nhờ trang cùng mẫu của weichai-heavy-machinery (có URL gas-generator-set) — suy theo NCC khác, trái luật 4.3 (M chỉ khi kèm tiêu đề / URL khí) nên KHÔNG ghi. Nếu Khoa muốn ghi: thêm bằng chứng cấp trang (một dòng ngoại lệ), không nới luật.
- Mức bảng, 0 bản ghi (không có gì để mang `fuel`, chỉ ghi lại): TRUTH-ONLY 28 bảng (green-power n102 / 134 / 135 / 1001, lees-power datasheet PDF 1081–1099, mwm datasheet FR / ES): luật phân tay theo cả NCC, code không thấy chữ khí trong bảng → rỗng. MISMATCH 3 bảng: green-power n127 ("Benzina 3000 rpm") và n135 ("Benzina / Gasoline") phân tay chấm "khí" do luật cả NCC, code đúng là xăng; slong n108 (URL ".../lp-gas-inverter… gasoline"; sau khi thêm "Lp Gas" thành dual). CODE-ONLY: 107 bảng không có bản ghi, đa số trong 164 bảng chưa soát của lần đọc (sevenpower-chengdu "Natural Gas CHP", younes-bros "Natural Gas", pauway "燃气", camda, haut-power, teksan…); tên trang hợp lý, chưa soát tay từng bảng (không ảnh hưởng Gợi ý vì 0 bản ghi).
- Mức (B / T / M) lệch phân tay 71 bảng: code tính theo đúng nơi chữ nằm: chữ trong bảng = B (ronsun "Biogas ≤0.3 m³/kW.h", victory "Gasoline Consumption", jichai, kingway) ; phân tay chấm B cả NCC nhưng bảng chỉ có chữ ở tiêu đề (lees 3, man-engines n105/111, rise-power 2, naipute 3, power-hf, repower-gas, victory n117 …) = T. M ra đúng 73 bản ghi: agg 42, penlucky n107 21, weichai-heavy 10.
(b) spec-diff toàn bộ: mục 3. Script đếm riêng (`cmp.cjs`, vì spec-diff không in trường mới): 60.073 bản ghi, trường mới 765, mọi trường khác y nguyên trừ nhóm COP.
(c) `node suppliers/quality.mjs --check`: "không chỉ số nào xấu đi quá ngưỡng". `node --test suppliers/*.test.mjs web/test/*.test.mjs`: tests 1348, pass 1348, fail 0. row-flags: mục 3. (`verify.mjs`/CI sẽ chạy lại trên PR.)
(d) `suppliers/fuel.test.mjs` (6 ca, dòng thật): B naipute n2001 / cameo n127 / slong n105 (dual) / huayuan n105; T kaihua n116, victory n119, n118 (dual, mức T), kigerpower n2011; M agg n115–118 + penlucky n107 + weichai-heavy n104 và ca giả (dòng không mang -NG chỉ còn T; -NG đứng một mình = null); KHÔNG ghi: powerzoo n101 / n169, chenxing n101, gillette n101, westinpower n1003, simpson n124, jianghao n104, victory n129 / n133, kingway n117, man-engines n104, penlucky n102, weichai-power n125; `uses` của `build()` agg-fuzhou 42 use mang `fuel` M, bảng khác không; COP rated.
`gasTable`: dùng `fuelFrom` cộng điều kiện cũ (giữ nguyên số bản ghi: note "bảng máy khí" 2 → 2; agg n117 / n118 không có dòng máy trong tiêu đề nên không đổi gì, `fuel` M cả bốn bảng).

## 5. Top 30
KHÔNG đo trên máy. SHA để điều phối đo cloud: `623f4b89` (nhánh `khi-fuel-1`; chỉ catalog, config-bot chưa đọc `fuel` nên Gợi ý chưa đổi gì từ trường mới). Kỳ vọng: chỉ đổi ở dòng COP (agg n115–118 prime → rated: 42 bản ghi động cơ; hosem n112; hosem n120; bison n1003) — những dòng khác 0.

## 6. 3 mẫu đối chiếu nguồn
1. B — naipute-weifang n2001, https://www.nptgasgenset.com/product/product-specifications-for-30-kw-natural-gas-biogas-generator/ : ô "Fuel Type | Natural gas/Biogas" ⇒ `fuel gas B`.
2. T — kaihua-genset n116, https://www.kaihuagenset.com/products/By-Function/Gas-Generator.html : tiêu đề "gas generator,Gas Generator-TAIZHOU KAIHUA DIESEL GENERATOR SETS CO. LTD" (diesel là tên công ty, bỏ qua) ⇒ `gas T`.
3. M — agg-fuzhou n115, https://www.aggpower.cn/agg-natural-gas-generator-sets : dòng "| DC260G6-NG | 260/208 | LY13-G280 | AGG" dưới tiêu đề "COP (kVA/kW)" ⇒ `gas M`, công suất `rated` 260/208.

## 7. Rủi ro còn lại, quay lui
- Mức T (kaihua, weiman, xinzhengfa, yingtai, xinshengan, kingway, westinpower n112…): chữ ở tên trang; nếu PR 2 loại theo T mà một trang bán cả diesel lẫn khí dưới cùng tiêu đề "Gas Generator…" thì loại nhầm (đã tách các ca nhập nhằng; không bắt được trang tiêu đề khí mà bảng diesel).
- "Gas" dính tên (simpson n124) và "Gas Generator" cách chữ (weiman, kaihua) phân biệt bằng dấu cách: bảo thủ nhưng là quy ước chữ, không phải bằng chứng nhiên liệu; simpson n124 rỗng (có thể là xăng).
- Bảng cùng trang khác nhiên liệu (vd. trang liệt kê khí + diesel nhưng tiêu đề không nêu diesel) nhận theo tiêu đề / URL (T): phụ thuộc cách bot đặt tên trang.
- Chưa kiểm: HSMT các lượt top nhắc nhiên liệu gì (cần bidhist, ngoài repo); 107 bảng mới có dấu hiệu nhưng 0 bản ghi chưa soát tay từng bảng.
- Quay lui: đóng PR / revert commit; trường mới tách biệt, bỏ đi thì mọi thứ khác y như cũ trừ nhóm COP (mục 3).

## Cần ghi nhớ
- Quyết định Khoa 20/11 đã áp: mức T có dùng; HSMT không nêu → diesel (phần này thuộc PR 2); sửa COP cùng đợt.
- Chờ Khoa: weichai-power n125–128 (10 bản ghi) có ghi bằng ngoại lệ cấp trang không; bison n1003 vốn lệch cột (dòng bị row-flags sau sửa COP).
