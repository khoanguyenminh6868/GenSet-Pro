# Giá trị sai của bản chuẩn: soát từng ca (nhánh `gia-tri-sai`)

Khoa 24/11/2026: "Đưa từng ca vào danh sách để bỏ hoặc sửa"; 11 khối lượng googol → không gán động cơ / tổ máy, đánh dấu "cần xác nhận".

Gốc đo cố định: main `8832317f` (#1161). Danh sách đầy đủ từng ca: `gia-tri-sai.tsv` cạnh tệp này (cột: ca, luật, trường, model, nguồn, giá trị, chữ dòng, nhóm a–e, hành động, căn cứ). Script và số đo: `genbid-work\gia-tri-sai\` (`dump.mjs`, `classify.mjs`, `splice.mjs`, `before/`, `after/`, `diff.md`, `diff-full.txt`).

## 1. Kết quả

| | trước (main) | sau (nhánh) |
|---|---:|---:|
| Vi phạm "sai" (trừ `gia-tri-hong`, đã sửa ở #1161) | **404** | **293** |
| "Cần xác nhận" (mức mới, không tính sai) | 0 | 11 |
| "Chưa chuẩn" (không thuộc việc này) | 1.408 | 1.408 |

404 trên main mới nhất = 415 của báo cáo cũ trừ 10 ca ricardo `lan-toc-do` đã được #1160 sửa (và 1 ca chênh do sắp xếp lại). 293 ca còn lại: **95 nhóm (b)** + **198 nhóm (c)**, không ca nào ngoài hai nhóm này.

| Nhóm | Số ca | Hành động |
|---|---:|---|
| (a) nguồn ghi sai, biết ô | 99 | 130 mục `ROW_EXCEPTIONS` (`dropspec` 128, `nopower` 2), kể cả bảng chép lại cùng dòng |
| (b) bộ đọc đọc sai | 95 | không đưa vào ngoại lệ; danh sách việc sửa code ở mục 3 |
| (c) mâu thuẫn hình học, không biết ô sai | 200 | đã có luật ở `quality.mjs` (`SN.selfCheck`); 2 ca tự hết nhờ `dropspec` bore của (a) |
| (d) luật báo nhầm | 0 | không ca nào: mọi ca soát đều thật sự sai hoặc mâu thuẫn |
| (e) googol khối lượng | 11 | `unsurespec`: giữ hiện, cờ `unconfirmed`, không chấm / lọc |

`fixspec`: không dùng ca nào. Không ca (a) nào có giá trị đúng nguyên văn trong cùng nguồn (cùng trang / bảng) hay tờ hãng trong repo.

## 2. Nhóm (a): 99 ca, 130 mục

| Nguồn | Ô | Ca | Căn cứ |
|---|---|---:|---|
| bdadl n104/105/112/116–119, fukangsi n2007/2009, pengpai n103/104/111/115–118 (+ bản chép n127/129/131/135) | tiêu hao dưới "燃油消耗 (g/kw.h)": ≤120–139, ≤310–432 | 24 | ngoài 150–300 g/kWh; bảng mẫu chép chung ba NCC |
| jiangchai n102/103/106/109/110 (+ n121), fukangsi n2011 | cột "油耗（L/H）" chép số kW dự phòng (100, 420, 650…), J20V440M "8" | 13 | số trùng đúng ô 备用功率 |
| longkai n1085 / n1104 / n1107 (+ n1055 / n1056) | tiêu hao 100 / 75 / 50 % (18,3 L/h cho 288 kW…) | 9 | ≈ 0,06 L/kWh |
| acepow n149 APX-85 "≤7", aosif n115 AD697 "734", huipu n102 HP-K1000 "22337" | tiêu hao | 3 | không hợp công suất / gõ sai |
| yingtai n107 (24 ca, 25 mục: thêm dòng thứ hai của 404GF) | kích thước mm dưới tiêu đề "L*W*H(m)" | 24 | đơn vị của tiêu đề sai; không có đơn vị đúng trong nguồn → bỏ |
| yingtai n108 (7), changchai n2001, jiangchai n105 J20P160M | kích thước 4–6 số ("3.3*1.44*2*2.16", hai bộ dính nhau) | 9 | ô nguồn thừa số |
| aoke n127, bdadl n117/n128, pengpai n116, jiangchai n110, jlmech n104 JL-320GF, penlucky n102, xinzhengfa n109, acepow n149 APX-50 | một chiều mất chữ số ("3130*115*1850", "3000*1150*170", "202*0.86*1.46") | 11 | ngoài 300–16.000 mm |
| huipu n102 PTAA1340G3 "128*14", QTA4320G7 "170*19", jlmech n104 YC6C1320-D31 "200210" | bore | 3 | gõ sai, ngoài 50–400 mm |
| gfe-power n1023 "16 3:1" | tỉ số nén | 1 | mất dấu chấm, không biết 16,3 hay 16 |
| depco n2050 DPK-DTY-70 (standby 55kW/69kVA < prime 70 kVA), n2013 DPK-DYM-44 ("35kW/344kVA") | công suất | 2 | `nopower` như tiền lệ kaihua |

Bẫy gặp khi làm (đã ghi `web/CLAUDE.md`):
- Bộ kiểm chỉ báo NGUỒN ĐẦU của mỗi giá trị, nên sau khi bỏ ở nguồn đầu thì dòng thứ hai lộ ra (bdadl n129 LZ1750 khối lượng 14400, yingtai 404GF dòng 4180 kg). Script tìm thêm mọi dòng cùng model, cùng ô sai ở cùng cột (chỉ khi ô sai là duy nhất trong dòng: J20C88M "88" vừa là kW dự phòng vừa là 油耗, dòng 6BT ghi 17 L/h không đụng).
- Dòng chép nguyên văn ở bảng khác cùng NCC bị `mergeRepeats` đưa số lại → liệt kê đủ mọi `n` (19 mục "chép nguyên văn").
- `rowExceptions` trước chỉ áp MỤC ĐẦU khớp: LZ1750 đã có `dropspec weight` (19/11) nên mục tiêu hao bị bỏ qua. Nay áp mọi mục khớp theo thứ tự (`applyRowException`).

## 3. Nhóm (b): 95 ca, việc sửa code (không sửa trong việc này)

| Mã | Mẫu lỗi | Ca | Nguồn |
|---|---|---:|---|
| B1 | ô công suất động cơ kèm tốc độ: "47@1500" (nhãn kW@RPM), "18kw/1500", "24kW At 1500R.P.M.", "118-125/3000" → spec-norm `engPower` đọc số vòng quay thành một mức công suất | 35 | penlucky n116/119/120, eastern-lion n129, yunnei n102/n104, hosem n136 |
| B2 | số có dấu cách trong ô kích thước ("240 0×880×1360", "6200 × 1950 ×3 000") | 36 | zhengdian n101/104/108 |
| B3 | "230V - 3 Phase": số pha đọc thành điện áp | 2 | hosem n110 |
| B4 | nhãn nhận nhầm trường: "Coolant Ratio" → dung tích nước (3), "Type of lub-oil" → dung tích dầu, "Piston Cooling" → làm mát khí nạp, "Engine Type \| 6 cylinder in line" → kiểu động cơ (là bố trí xi lanh) | 6 | aosif n1062/1078/1086/1088, repower-gas n1001, yihua n106 |
| B5 | tiêu đề hai tầng "Engine type" trên "No. of Cylinder \| Aspirated": "Turbocharged" vào kiểu động cơ | 2 | jet-power n125 |
| B6 | lệch cột: legapower n101 ("KVA" trên "ESP \| PRP": kVA PRP vào tiêu hao, 5), wintpower n105 (tiêu đề tầng hai thiếu ô model: "180/225" vào tiêu hao, 4), tecgen n127 (4 cột mà dòng công suất 2 ô, 1), bison n1003 BS170F (đã biết, 1) | 11 | |
| B7 | endress n1017: trang liệt kê nhiều mức "Power [kVA/kW]", bộ đọc gắn 20 kW; tiêu hao 8,4 L/h đúng với 36,4 kW | 1 | |
| B8 | shanhua n1024 / n1028: dòng ĐỘNG CƠ "常用功率 Base Output Power (kW)" đọc thành công suất tổ máy (bảng tổ máy đúng: 220 / 200 kW); HL240GF dòng động cơ còn tự ghi base 317 > standby 288 | 2 | |

Ghi chú: tecgen n127 còn ghi "33kW / 34kVA" cho TG41 (nguồn gõ sai), nhưng ca báo là do bộ đọc gán ô cho TG34YDS.

## 4. Nhóm (c): 200 ca `hinh-hoc` (198 còn lại)

Định nghĩa của luật chính là `SN.selfCheck` (xi lanh × π/4 × bore² × hành trình lệch dung tích của chính dòng > 5 %), nên mọi ca đều đã được `quality.mjs` bỏ khỏi phiếu (cả xi lanh, bore, dung tích của dòng). Không đoán ô sai.

**Cần Khoa biết:** `config-bot` (`majorityOf` / `candidates`) KHÔNG dùng `selfCheck`: số của các dòng này vẫn bỏ phiếu số đông ở Gợi ý. Theo NCC: depco 63, mingbang 37, huipu 20, hanyang 17, yunding 9, kanpor 7, aosif 7, khác ≤ 5. Tỉ lệ ghi / tính: 52 ca 0,5–0,8; 49 ca 1,3–2; 9 ca lệch gấp ~2 hoặc ~10 (mingbang YC6C1320L-D20 79,2 L = 2 × 39,6; jianghao n101 404D-22TG "22" = 2,2 mất dấu chấm; huipu HP425D 25,8 = 2 × 12,9). Ca mất dấu chấm như jianghao có thể `fixspec` nếu Khoa cho (hình học 2,217 L lệch 0,8 %, cần thêm ≥ 2 NCC hoặc tờ hãng ghi 2,2). Danh sách đủ: lọc `nhom = c` trong TSV.

## 5. Nhóm (e): googol, 11 khối lượng

`unsurespec` (mới, cạnh `unitspec`): khớp NCC + n + model tổ máy + chữ dòng nguyên văn + `from` = chữ ô. Spec giữ, mang `unconfirmed { why, khoa }`; `spec-norm` thêm `missing: confirm`; config-bot `NORM_GAP` có "confirm" (khoaRules so khối lượng → "Chưa rõ: cần xác nhận…", cả cách đọc cũ khi tắt cờ), `absurdOf` không xét (dòng không còn bị row-flags `absurd` vì khối lượng này). `spec-value-check` báo mức "cần xác nhận" (11), không "sai". googol là NCC của `GENSET_TABLES`: ngoại lệ dòng nay áp cả bản ghi `gensetsOf`.

## 6. Đo ảnh hưởng

- `spec-diff git:8832317f .`: bản ghi `fromSupplier` 62.160 → 62.160, **77 đổi, 0 mất, 0 thêm**, 40 bảng / 16 NCC; chỉ dạng: tiêu hao bỏ 60, kích thước bỏ 23, bore bỏ 3, tỉ số nén bỏ 1, công suất (nopower depco) 3; `gensetsOf` 1.700 → 1.700, 26 đổi (yingtai n107 kích thước bỏ), 0 mất, 0 thêm; đảo vai 0 → 0. 87 giá trị "tự kiểm cần soát tay" đều là số BỎ của chính các dòng trong danh sách.
- Đối chiếu: mọi bảng có bản ghi đổi đều có trong danh sách (0 ngoài danh sách). Mục không làm đổi bản ghi: bảng chép lại (bản ghi đã gộp vào bản đầu qua `mergeRepeats`) và googol (chỉ thêm cờ, `gensetsOf` không đổi số).
- `quality.mjs --check`: QUALITY.
- `node --test suppliers/*.test.mjs`: TESTS. `catalog-hy.test.mjs` sửa: đếm ghi chú "ngoại lệ theo dòng" của yingtai chỉ ở n101 / n2003 (n107 / n108 của việc này thêm ghi chú). Test mới `suppliers/gia-tri-sai.test.mjs`.
- `node --test web/test/*.test.mjs`: 171 / 171.
- Fixture `regress-config`: 8 / 8 đạt, KHÔNG đổi. NCC bị đụng có trong dữ liệu đóng băng: longkai (cả 6 lượt), aosif (5 lượt), acepow (1 lượt). Model đụng: longkai LG288C / LG520C / LG600C (chỉ tiêu hao), aosif AD697 (tiêu hao), acepow APX-50 / APX-85; không thay đổi kết quả nào của fixture.
- `spec-diff.mjs` sửa một dòng (`brief`: `r.dims` không phải mảng làm chết khi `spec-norm.js` đổi; lỗi có sẵn).

## 7. Cần Khoa quyết

1. (c) 198 ca hình học: có cho config-bot bỏ phiếu số đông của dòng `selfCheck` xấu như `quality.mjs` không? (đề xuất: có, đo top 30 trước.)
2. (b) 8 mẫu lỗi bộ đọc: giao phiên sửa theo thứ tự B2 (36 ca, một luật ghép số), B1 (35), B6 (11), còn lại.
3. googol: tìm nguồn xác nhận khối lượng là của động cơ hay tổ máy; có nguồn thì bỏ `unsurespec` hoặc chuyển sang trường đúng.
