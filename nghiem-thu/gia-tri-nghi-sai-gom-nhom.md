# Giá trị nghi sai: lọc và gom nhóm để Khoa quyết (24/11/2026)

**Phạm vi:** mọi ca mức "sai" của bộ kiểm giá trị, **345 ca**, phân hết (không lấy mẫu), mỗi ca thuộc đúng một nhóm. Danh sách từng ca: `gia-tri-nghi-sai-gom-nhom.tsv` (cạnh tệp này).

| Loại | Số nhóm | Số ca | Ai quyết |
|---|---:|---:|---|
| 1. Lỗi bộ đọc (nguồn ghi đúng, máy đọc sai) | 9 | 101 | Không cần Khoa; điều phối giao sửa code |
| 2. Đã có giá trị đúng từ nguồn khác (tờ hãng hoặc ≥ 3 NCC khác cùng ghi) | 10 | 105 | Khoa OK một lần cho cả loại (đề xuất ở dưới) |
| 3. Cần Khoa quyết | 1 | 25 | Khoa (câu hỏi ở dưới) |
| 4. Chưa quyết được, để dành cho tab | 6 | 114 | Cần hỏi NCC / tài liệu hãng |
| **Tổng** | **26** | **345** | |

**Loại 2, đề xuất chung:** bỏ ô lệch ở đúng dòng đó (không sửa thành số khác). Gợi ý cấu hình hiện đã dùng đúng số xi lanh ở cả 105 ca. Dung tích: dùng đúng ở 85 ca. 12 ca chưa có số dung tích thắng. 8 ca chưa có chuẩn dung tích để so.

### Các nhóm cần Khoa quyết

**1. Nhận "2 NCC khác cùng ghi" làm căn cứ để biết ô nào sai? (25 ca)**
- Tình huống: dòng tự mâu thuẫn (số xi lanh × đường kính × hành trình không ra dung tích ghi). Ô lệch thì có ≥ 3 NCC khác (hoặc tờ hãng) ghi số khác. Nhưng các ô còn lại chỉ có đúng 2 NCC khác xác nhận, chưa đủ mức 3 NCC đang dùng.
- NCC: depco 8, hanyang 4, zhengchi 4, genlitec 2, jiuan 2, aosif, huatai, jet-power, mingbang, yunding (mỗi NCC 1).
- Ví dụ: depco n2354 BF8M1015CP-LA G5 "Cylinder | 6 … Bore and Stroke(mm) | 132 X 145 … Displacement(L) | 15.874". 11 NCC ghi 8 xi lanh; 132 × 145 chỉ 2 NCC khác ghi. hanyang n107 YC4D155-D31 "| 4 | 108*115 | 4.84 |": 5 NCC ghi 4,21 L; 108 × 115 chỉ 2 NCC. aosif n1024 QSB5.9-G31 "Displacement | 3.9 L" với 6 × 102 × 120 (= 5,9 L).
- Đề xuất: **nhận** (rồi xử lý như loại 2: bỏ ô lệch). Lý do: ô lệch đã có ≥ 3 nguồn chống. Thay số vào thì dòng tự khớp. Không có NCC nào ghi số thứ ba cho các ô còn lại.
- Lưu ý: 4 ca 6LTAA9.5-G1 dựa vào đường kính 116 (4 NCC). Nhưng còn 2 NCC ghi 116,5 và 1 NCC ghi 117. Nếu Khoa muốn chặt hơn thì để 4 ca này ở tab.

---

## Chi tiết (cho điều phối)

### 0. Trạng thái đã dùng

- `origin/tich-hop-luot-4` (d8a41abb) **có** trên origin nhưng **không chứa** #1169 / #1174 / #1178, cũng không chứa main mới. Vì vậy em không dùng nhánh đó.
- Em dựng tạm trong máy, không push: `origin/main` 83ec53ec + `gia-tri-sai` 7f674632 (#1169) + `claude/fix-spec-labels` df32d242 (#1174) + `geo-vote` 726c60d2 (#1178). Chỉ có một xung đột: `web/CLAUDE.md`, chỉ là chữ, em giữ cả hai bên.
- `node suppliers/spec-value-check.mjs`: 328.796 giá trị, **345 sai**, 419 chưa chuẩn, 11 cần xác nhận (googol, ngoài phạm vi). 345 = 95 ca không phải hình học + 250 ca `hinh-hoc`.
- So với báo cáo `gia-tri-sai.md` (gốc 8832317f): 95 ca không phải hình học khớp 1–1 với 95 ca nhóm (b) B1–B8, ghép theo trường + model + NCC n + luật, 0 ca lệch. Ca hình học tăng 200 → 250 vì #1174 thêm nhãn `排气量` (PR ghi +50: kangwo, zhengchi, haifeng, taihai, cldj).

### 1. Cách phân ca hình học (250 ca)

- Mỗi ca: bộ số của chính dòng (`useGeo` = `SN.selfCheck`, cùng chỗ gọi với bộ kiểm). Lấy mọi dòng cùng động cơ của NCC KHÁC (`CAT.engines[].uses`, `useGeo` / `normalizeRecord` từng dòng) và fact tờ hãng (`modelFacts`, `sheet: true`).
- "Chuẩn" của từng ô (xi lanh, đường kính, hành trình, dung tích) lấy theo thứ tự:
  1. Tờ hãng (một số, không mâu thuẫn).
  2. Nếu không có tờ hãng: số được ≥ 3 NCC khác ghi và gấp ≥ 3 lần số đứng thứ hai.
  - Cách so: dung tích cùng nhau nếu lệch ≤ 1 %, ô khác phải bằng nhau. Mỗi NCC một phiếu, KHÔNG gộp bảng chép chung như `dispVoters`.
- **Loại 2** khi đủ cả 3 điều:
  - cả bốn ô đều có chuẩn (dung tích được thiếu chuẩn, nếu bộ số đã thay khớp dung tích dòng ghi trong 2 %);
  - dòng lệch chuẩn ở ít nhất một ô;
  - thay số chuẩn vào thì dòng tự khớp (≤ 5 %).
- **Loại 3, nhóm 1:** chỉ đạt khi hạ ngưỡng xuống ≥ 2 NCC và gấp ≥ 2 lần.
- **Loại 4:** các ca còn lại. Không đoán, không nội suy.
- **Lỗi bộ đọc trong ca hình học (B9):** soát mọi ca ở bảng xoay (model theo cột, 67 ca). Ô bộ đọc lấy được so với ô đúng cột của động cơ. 6 ca kanpor lấy `缸径*行程` sai cột → loại 1. Bảng có tiêu đề: các ô đọc ra đúng là ô của dòng nguồn. Trang nhãn depco: nguồn tự ghi sai (ví dụ "Model | WP13D510E311 … Cylinder | 4"), bộ đọc đúng.
- "Gợi ý có đang dùng giá trị đúng": em đo lá phiếu số đông mức động cơ, có luật hình học của #1178. Cách đo giống `geo-vote.test.mjs`: `geoRows` + `geoKeep`, rồi `majorityOf` (xi lanh) / `dispVoters` + `majorityRound` (dung tích). Em chưa chạy `candidates` đầy đủ. Gợi ý không bỏ phiếu đường kính × hành trình.
- Script: `/tmp/.../scratchpad/js/` (`geo.mjs`, `classify.mjs`, `colcheck.mjs`, `build.mjs`). Thư mục này ngoài git, mất khi container bị thu hồi. Muốn đo lại thì chạy lại từ đầu theo mô tả trên.

### 2. Loại 1: lỗi bộ đọc (9 nhóm, 101 ca), không cần Khoa quyết

| Nhóm | Mẫu | Ca | Ví dụ: nguồn nguyên văn → đọc ra → đúng theo nguồn | Chỗ sửa |
|---|---|---:|---|---|
| L1-B1 | Ô công suất động cơ có kèm tốc độ: số vòng quay bị đọc thành một mức công suất | 35 (eastern-lion 17, penlucky 13, yunnei 3, hosem 1, ricardo 1) | penlucky n116 "\| 4BT3.9-GM47 \| 47@1500 \| 52@1500 \|" → kWm [47, 1500] → 47 kWm ở 1500 v/p. eastern-lion n129 "18kw/1500" → [18, 1500] → 18 kW ở 1500 v/p | `web/spec-norm.js` `engPower` (dòng ~489) |
| L1-B2 | Số kích thước có dấu cách ở giữa | 36 (zhengdian n101/104/108) | n101 "240 0×880×1360" → [240, 0, 880, 1360] → 2400 × 880 × 1360. n104 "6200 × 1950 ×3 000" → [6200, 1950, 3, 0] → 6200 × 1950 × 3000 | `web/spec-norm.js` `dims` (~240): ghép chữ số tách bởi một dấu cách, chỉ khi ra đúng 3 số |
| L1-B3 | Số pha bị đọc thành điện áp | 2 (hosem n110, một ô, hai luật) | "\| Voltage \| 230V - 3 Phase \|" → "230-3" → 230 V, 3 pha | `web/spec-norm.js` `voltage` (~400) |
| L1-B4 | Nhãn bị nhận nhầm trường | 6 (aosif n1062/1078/1086/1088, repower-gas n1001, yihua n106) | aosif n1088 "\| Coolant Ratio \| 50% ethylene \|" → dung tích nước làm mát → là tỉ lệ pha, không phải dung tích. repower-gas "\| Type of lub-oil \| KCN 7805 (sulfur content<=200mg/m3) \|" → dung tích dầu 7805 → là mã loại dầu | `web/catalog.js` `specKeyOf` (~255) / `SPECS` (~200). #1174 đã sửa nhãn "capacity", nhưng 6 ca này vẫn còn |
| L1-B5 | Tiêu đề hai tầng: kiểu nạp khí rơi vào kiểu động cơ | 2 (jet-power n125) | "\| K-22 \| … \| V2003-T-E2BG-CHN-1/20.4KW \| 4 \| Turbocharged \| 1.999 \|" → kiểu động cơ "Turbocharged" → là kiểu nạp khí | `web/catalog.js` ghép tiêu đề hai tầng / `walkedSpecs` (~1339) |
| L1-B6 | Lệch cột giữa tiêu đề và dòng | 11 (legapower 5, wintpower 4, tecgen 1, bison 1) | legapower n101 "\| LG385C \| 385 \| 350 \| N.A \| QSZ13-G6 \|" → tiêu hao 350 L/h → 350 là kVA PRP, tiêu hao nguồn ghi N.A. wintpower n105 "\| WT-YTO248 \| 198/248 \| 180/225 \|" → tiêu hao 180/225 → là công suất prime kW / kVA | `web/catalog.js` căn tiêu đề với dòng (legapower "KVA" trên "ESP \| PRP"; wintpower tiêu đề tầng hai thiếu ô model) |
| L1-B7 | Trang nhãn nhiều mức công suất: gắn sai mức | 1 (endress n1017) | "\| Fuel consumption @ 75% PRP [L/h] \| 8,4 \|" so với công suất 20 kW → công suất đúng là 36,4 kW (PRP 45,5 / 36,4 cùng trang) | `web/catalog.js` chọn công suất ở trang "Power [kVA/kW]" |
| L1-B8 | Dòng công suất của ĐỘNG CƠ bị đọc thành công suất tổ máy | 2 (shanhua n1024, n1028) | HL200GF: dòng động cơ "常用功率 Base Output Power (kW)" → tổ máy prime 240 kW → bảng tổ máy ghi standby 220 / prime 200 kW | `web/catalog.js` khối động cơ của bảng nhãn shanhua |
| L1-B9 (mới) | Bảng xoay (model theo cột): ô `缸径*行程` lấy sai cột. Ô `缸数` / `排量` cùng bảng đọc đúng | 6 (kanpor n102 ×2, n103, n120, n121, n122) | n102 "\| 缸径*行程 \| mm*mm \| 114×135 \| 114×135 \| 140×152 \| 140×152 \| 125×147 \|", NTA855-GA ở cột 3 → 114×135 → 140×152. n103 6CTA8.3-G2 cột 4 "… \| 102×120 \| 114×135 \| 114×135" → 102×120 → 114×135 | `web/catalog.js` đọc bảng nhãn model theo cột (`isLabelTable` ~1127 trở đi). Em chưa tìm ra dòng code gây lỗi. Lỗi này cũng đưa đường kính sai vào `u.specs`, nên Gợi ý cũng thấy số sai |

### 3. Loại 2: đã có giá trị đúng từ nguồn khác (10 nhóm, 105 ca)

Hành động chung đề xuất: **bỏ ô lệch** ở dòng đó (`dropspec` theo dòng, như #1169). Em không đề xuất sửa thành số khác: luật `fixspec` đòi tự kiểm trong 2 % VÀ tờ hãng hoặc ≥ 2 NCC. Nhiều ca đạt luật đó, nhưng Khoa chưa cho sửa hàng loạt. Cột "Gợi ý" = lá phiếu số đông hiện tại (mục 1).

| Nhóm | Ca | Ô lệch | Ví dụ (nguồn → ô lệch → số đúng, căn cứ) | Gợi ý hiện tại |
|---|---:|---|---|---|
| L2-depco-power | 26 | xi lanh 18, dung tích 5, đường kính × hành trình 3 | n2017 "Model \| WP13D510E311 … Cylinder \| 4 … 127 X 165 … Displacement(L) \| 12.54" → 4 xi lanh → 6 (≥ 3 NCC). n2616 1103A-33G "Displacement" 2.216 → 3,3 L (24 NCC; tờ hãng perkins-wuxi n2005 ghi 3 xi lanh) | xi lanh đúng 26; dung tích đúng 17, không thắng 2, chưa có chuẩn 7 |
| L2-mingbang-mbkl | 17 | dung tích 6, hành trình 3, xi lanh 2, nhiều ô 6 | n123 "\| YC6C1320L-D20 \| 6 \| 79.2 \| 200*210 \|" → 79,2 → 39,584 L (≥ 3 NCC). n125 "\| TAD530GE \| 4 \| 1.1 \| 77*81 \|" → 108 × 130, 4,76 L (≥ 3 NCC) | xi lanh đúng 17; dung tích đúng 13, không thắng 4 |
| L2-zhengchi-power | 14 | đường kính + hành trình + dung tích 9 (n162 ghi "159*159" cho mọi máy 12M33 / 16M33 / 12M55 / 16M55), dung tích 4, đường kính 1 | n162 "\| 16M33D1680E310 \| 16 \| 159*159 \| 60L \|" → 150 × 185, 52,3 L. n161 "\| SC4H160D2 \| 4 \| 105* 124 \| 4L \|" → 4,3 L | xi lanh đúng 14; dung tích đúng 12, không thắng 2 |
| L2-kangwo-guangdong | 8 | hành trình 5, đường kính + hành trình 2, hành trình + dung tích 1 | n102 "\| SC9D340D2 \| 6 \| 135*150 \| 8.82 \|" → 114 × 144. n102 "\| SC8D280D2 \| 6 \| 114*144 \| 8.27 \|" → hành trình 135 | xi lanh đúng 8; dung tích đúng 7, không thắng 1 |
| L2-hanyang-weifang | 7 | hành trình 5, đường kính + hành trình 1, xi lanh 1 | n102 "\| 6ZTAA13-G4 \| … \| 6 \| 114*145 \| 13 \|" → 130 × 163. n125 "\| SC15G500D2 \| … \| 135*150 \| 14.2 \|" → hành trình 165 | xi lanh đúng 7; dung tích đúng 5, chưa có chuẩn 1, không thắng 1 |
| L2-jet-power | 4 | đường kính + hành trình + dung tích | n135 "\| WP2.3D33E200 \| 4L \| Mechanical \| 102×118 \| 2.5 \|" → 89 × 92, 2,3 L (≥ 9 NCC) | đúng 4 / 4 |
| L2-yunding-jiangsu | 4 | xi lanh 2, đường kính 1, đường kính + hành trình 1 | n2008 "\| WP13D440E310 \| 9 \| 127*165 \| 12.54 \|" → 9 xi lanh → 6. n2007 "\| SC4H180D2 \| 4 \| 135*150 \| 4.3 \|" → 105 × 124 | đúng 4 / 4 |
| L2-haifeng-taizhou | 3 | đường kính + hành trình (+ dung tích) | n2010 "\| 16M33D1680E310 \| 16V \| 180/215 \| 65.65 \|" → 150 × 185, 52,3 L | đúng 3 / 3 |
| L2-taihai-taizhou | 3 | xi lanh 2, nhiều ô 1 | n108 "\| SC33W990D2 \| 12 \| 180*215 \| 32.8 \|" → 12 → 6 xi lanh (tờ hãng sdec n2010). n101 QSK78-G9 "16V" → 18 (4 NCC) | xi lanh đúng 3; dung tích đúng 2, không thắng 1 |
| L2-khac | 19 | 13 NCC, mỗi NCC ≤ 2 ca | huipu n103 "\| KTA50-G3 \| 12 \| 159*159 \| 50 \|" → 12 → 16 xi lanh (32 NCC). jianghao n101 "\| 404D-22TG \| 4 \| 84*100 \| 22 \|" → 22 → 2,216 L (mất dấu chấm; 11 NCC) | xi lanh đúng 19; dung tích đúng 18, không thắng 1 |

Lưu ý căn cứ: ở các nhóm trên, "≥ 3 NCC" đếm mỗi NCC một phiếu. Nếu vài NCC chép chung một bảng mẫu thì số NCC độc lập ít hơn. Ở mọi ca loại 2, chuẩn có ít nhất 3 NCC khác nhau. Phần lớn chuẩn có 5–30 NCC, chi tiết ở cột `chuan` của TSV.

### 4. Loại 3: cần Khoa quyết (1 nhóm, 25 ca)

Câu hỏi ở đầu tệp. Danh sách từng ca: `nhom = L3-1` trong TSV. Cột `chi_tiet` ghi số NCC khác theo từng ô. Theo ô lệch: xi lanh 7, hành trình 6, đường kính + hành trình 4, đường kính + hành trình + dung tích 4, dung tích 3, đường kính 1. Gợi ý hiện tại: xi lanh đúng 25 / 25. Dung tích: đúng 22, không thắng 2, chưa có chuẩn 1.

Em không thấy dải nào của luật quá hẹp hay quá rộng. Cả 95 ca không phải hình học đều là đọc sai, không có ca đúng bị báo sai (khớp soát tay ở `gia-tri-sai.md`). Ở ca hình học, em xem các ca chỉ lệch 5–10 %: không có động cơ nào mà số đông NCC cùng ghi một bộ số tự lệch. Nếu có thì đó mới là dấu hiệu số danh nghĩa của hãng, cần nới ngưỡng. Vì vậy em không đề xuất nhóm "nới dải".

### 5. Loại 4: chưa quyết được, để dành cho tab (6 nhóm, 114 ca)

Lý do chung: không biết ô nào của dòng sai. Ô đó không có tờ hãng, và cũng không có ≥ 2 NCC khác (ở ngưỡng nhóm 3: ≥ 2 NCC) cho chuẩn đủ bốn ô. Muốn biết thì phải hỏi NCC hoặc tìm tờ hãng.

| Nhóm | Ca | Chi tiết lý do |
|---|---:|---|
| L4-depco-power | 29 | 25: không NCC khác / tờ hãng nào đủ chuẩn (Iveco / FPT CR13, CURSOR13, FAW CA6D*, Xinchai 4D35ZD, Kubota V3300, YTO, Weichai WP12D317E201, YM6H4L-D…). 4: chỉ một phần ô có chuẩn (8M33G800/6, 8M33G1000/5 ghi 150 × 150, hành trình 185 chỉ có 2 NCC khác; BF8M1015CP-LA G1A đường kính × hành trình chỉ 1 NCC khác; LR4B5-D) |
| L4-mingbang-mbkl | 19 | 10: các ô có chuẩn đều khớp dòng, ô còn lại không có chuẩn (S16R-PTA "37.1", S16R-PTAA2 "49"…). 6: không có nguồn khác. 3: lệch chuẩn ở 1–2 ô nhưng ô khác chưa có chuẩn (YC4A100Z-D20, S12A2-PTA, YC6TD780L-D20) |
| L4-huipu-power | 18 | Không NCC khác nào ghi các động cơ này với đủ số (HPV*, HP*, WP4.*D*E2 "105*120 \| 4.5"…) |
| L4-kangwo-guangdong | 9 | 8: không có nguồn khác (L28M, 110AC-44TAG2…). 1: 1104C-44TAG1 "100*127 \| 4.41", đường kính 105 × 3 NCC / 100 × 2 NCC, chưa đủ gấp ba (cũng chưa đủ gấp đôi) |
| L4-hanyang-weifang | 6 | 3: không có nguồn. 2: chuẩn từng phần khớp dòng. 1: 6LTAA9.5-G3, đường kính chỉ có 116 × 3 / 116,5 × 2 / 140 × 2 |
| L4-khac | 33 | 15 NCC (taihai 5, aosif 4, haifeng 4, yunding 4, genlitec 3, huatai 3, fengfa 2, 1 ca mỗi NCC: chenxing, fukangsi, huachai, jianghao, pengpai, superwatt, victory, zhengchi). 22: không có nguồn. 9: chuẩn từng phần khớp dòng. 2: lệch hai ô, ô khác thiếu chuẩn (YC4D80-D34: dung tích 4,21 × 5 / 3,86 × 3) |

Tổng loại 4 theo lý do: không có tờ hãng / NCC khác đủ số 82; các ô có chuẩn khớp dòng, ô còn lại không có chuẩn 23; lệch chuẩn nhưng ô khác chưa có chuẩn 7; lệch hai ô và thiếu chuẩn 2.

### 6. TSV

`gia-tri-nghi-sai-gom-nhom.tsv`, mỗi ca một dòng. Các cột:
- `ncc`, `n`, `ma`, `truong`, `gia_tri` (giá trị đọc ra; ca hình học là dung tích), `luat`, `loai`, `nhom`;
- `o_lech` (loại 2 / 3), `chuan` (số chuẩn và nguồn), `goi_y` (lá phiếu hiện tại);
- `chi_tiet` (bộ số của dòng, lý do, số NCC khác theo từng ô), `dong_nguon` (dòng bảng nguồn nguyên văn; trang nhãn thì là các dòng nhãn liên quan).
