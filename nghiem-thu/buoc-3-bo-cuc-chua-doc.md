**Kết luận bằng số (đo trên toàn bộ `suppliers/cn`, main `028ab6be`): 3.193 / 10.432 bảng thông số (191 NCC, 37.975 dòng) không cho bản ghi nào; trong đó 507 bảng không cần sửa (lặp bảng đã đọc, đã đọc ở tệp nguồn / tờ hãng, máy cũ, chủ đích), còn 2.686 bảng thuộc 21 họ bố cục. Thêm 58 bảng đọc thiếu dòng máy (905 dòng) và 775 bảng đọc ra model nhưng ô số gần như không vào trường chuẩn. Ba họ lợi nhiều model nhất: tiêu đề nhiều tầng / lệch ô (74 bảng, ~480 mã chưa có), dòng máy không có dòng tiêu đề (143 bảng, ~450), model xoay ngang theo cột (228 bảng, ~430). Tờ đầu phát: 13 hãng có tờ định mức thật mà `ratings.mjs` không ra số (111 tệp), lớn nhất Linz 33, Soga 18, Kwise 16, Shangyan 14, Firstall 9, Faraday 9.**

# Chuẩn hoá datasheet, bước 3: bố cục / bảng chưa đọc (kiểm kê chỉ đọc)

Phiên con của phiên điều phối, 24/11/2026. Không sửa mã, không sửa dữ liệu, không mở PR sửa code. Đọc trên clone sạch ở **`028ab6bee96a8563597838cde1c9878b3c2eaaf7`** (= `origin/main` lúc chạy). Thay cho bản heuristic `buoc-3-kiem-ke.md` (SHA 8832317f): bản này đo MỌI bảng bằng chính bộ đọc của repo, có số ô / số dòng ra model cho từng bảng.

## 0. Cách đo (đọc trước)

Script tạm viết ngoài repo (thư mục scratchpad của phiên cloud, KHÔNG commit, mất khi phiên đóng; mô tả đủ để viết lại):

| bước | script | làm gì |
|---|---|---|
| 1 | `measure.mjs` | Nạp `web/catalog.js`, `spec-norm.js`, `suppliers/spec-standard.mjs` của repo. Với mỗi NCC (trừ `incomplete`, `controller_maker`) gọi `CAT.fromSupplier(s, notes)` + `CAT.gensetsOf(s, notes)` (đúng như `CAT.unread`); gọi `standardOf(all, { audit })` để biết giá trị nào vào trường chuẩn. Mỗi bảng ghi: số dòng, **ô có chữ** (`CAT.cellsOf`, ô khác rỗng ở các dòng, không tính dòng tiêu đề), **ô có số**, số bản ghi, **dòng ra model** (dòng có bản ghi trỏ tới, so theo `o.row` + chữ dòng), dòng lặp ở bảng khác (`also`), số model, **giá trị vào trường chuẩn** (sự kiện `audit` có `fid`, không `drop`), **ô nhận chuẩn** (ô của dòng chứa giá trị model / công suất / giá trị chuẩn đó), **dòng máy** (dòng có ô `CAT.isCode` và ≥ 2 ô số), dòng máy không ra bản ghi + lý do ghi chú của bộ đọc. 41 giây cho 10.518 bảng. |
| 2 | `ratings-scan.mjs` | `ratingsOf` của `suppliers/ratings.mjs` trên MỌI `sources/<id>/<n>.md` (8.949 tệp), cùng cổng chữ như `sourceRatings` của config-bot. |
| 3 | `facts-scan.mjs` | `modelFacts(build, suppliers)` của `config-bot.mjs` (tờ hãng theo model ở tên tờ, hằng số động cơ) + `controllerSheetFacts` cho từng bảng của NCC `controller_maker`: bảng nào config-bot vẫn dùng dù catalog không ra bản ghi. |
| 4 | `classify.mjs` | Gán họ bố cục: luật thuần trên chữ bảng (vị trí ô "Model / 型号", số ô mã `isCode`, số ô mỗi dòng, có / không dòng tiêu đề, tiêu đề nhiều tầng, ô "Nhãn: giá trị", dấu chấm dẫn, chữ cách bằng dấu cách) + lý do ghi chú của `fromSupplier`. Bảng đọc thiếu dòng (58 bảng) gán họ TAY theo từng bảng đã mở. |
| 5 | `alt-scan.mjs`, `alt-report.cjs` | Tờ đầu phát: trạng thái từng tệp nguồn của NCC vai `alternator_maker` (+ gfe-power, wintpower) và dòng định mức nguyên văn. |

Định nghĩa và giới hạn:
- **"Bảng 0 bản ghi"** = đúng định nghĩa `CAT.unread()`: 3.193 bảng (khớp số "bảng không cho bản ghi nào" của `unread-tables.mjs` trên cùng SHA).
- **"Đọc thiếu dòng"** = bảng có bản ghi mà ≥ 3 dòng máy (và ≥ 20 % dòng máy) không ra bản ghi, không nằm ở `also`. **"Đọc thiếu ô"** = bảng có bản ghi, ≥ 10 ô số, mà ô nhận chuẩn < 20 % ô số.
- **"Mã thấy / mã chưa có"** là ƯỚC LƯỢNG: lấy mã nhìn thấy ở vị trí của họ (dòng Model ngang, ô mã đầu dòng, tên trang…), qua `CAT.keyOf`, lọc chỉ giữ chuỗi có cả chữ và số; "chưa có" = không là khoá model / tổ máy / `other` của bất kỳ bản ghi `fromSupplier` + `gensetsOf` nào của 436 NCC. Còn lẫn nhiễu (vd. stone-power "380V415V", keliang "50HZ1500RPM"), sai số cỡ ± 10–15 %. Không phải số bản ghi.
- "Ô nhận chuẩn" so chữ ô với giá trị (số so theo giá trị số trong ô): là cận dưới, ô ghép ("lt | 3,3") có thể không khớp.
- Mọi ví dụ dưới đây là chữ nguyên văn của `specTables` (`n` = số nguồn, "bảng i" = chỉ số trong `specTables`, vì `n` không duy nhất).
- Chi tiết từng bảng (10.518 dòng, mọi bảng kể cả bảng đọc tốt): `buoc-3-bo-cuc-chua-doc.tsv` cùng thư mục (cột ở mục 8).

## 1. Toàn cảnh

| chỉ số | số |
|---|--:|
| NCC có `specTables` / tổng NCC | 326 / 436 |
| Bảng (trừ 86 bảng của 7 NCC hãng BĐK) | 10.432 |
| Dòng / ô có chữ / ô có số (các bảng đó) | 205.382 / 879.943 / 649.127 |
| Bảng cho ≥ 1 bản ghi (kể cả chỉ qua `also`) | 7.239 |
| **Bảng 0 bản ghi** | **3.193** (191 NCC, 37.975 dòng, 108.392 ô số) |
| Dòng máy (có mã + ≥ 2 ô số), toàn bộ | 53.577, ra bản ghi 47.345, **không ra 6.232** |
| … trong đó ở bảng ĐÃ có bản ghi | 1.201 (905 dòng nằm ở 58 bảng "đọc thiếu dòng") |
| Ô số của bảng đã đọc / ô nhận chuẩn | 540.735 / 372.526 (69 %) |
| Bảng đọc thiếu ô (< 20 % ô số vào chuẩn) | 775 (84 NCC, 22.498 dòng) |
| Bảng hãng BĐK / dòng / bảng 0 dòng ra model | 86 / 59.720 / 19 |

## 2. Không cần sửa bố cục (507 bảng 0 bản ghi + 2 bảng đọc thiếu chủ đích)

| mã | họ | bảng | NCC | dòng | ghi chú |
|---|---|--:|--:|--:|---|
| Z0a | lặp nguyên văn ≥ 90 % dòng của bảng đã đọc cùng NCC | 205 | 14 | 1.536 | aosif bảng "Rated output \| Fuel consumption rate" lặp; nên loại khỏi `unread()` |
| Z0b | bản dịch máy của bảng đã đọc (kente "I-KT-SC70", "Imodeli yeGenset") | 36 | 1 | 717 | mã sau khi bỏ "I-" đã là khoá của kente (680 dòng máy) |
| Z0c | lặp bảng đã đọc của NCC khác (perkins.com ↔ perkins-wuxi) | 10 | 2 | 73 | |
| Z1 | đọc ở TỆP NGUỒN bằng `ratings.mjs` (Stamford 74, Leroy-Somer 21, gfe 16, wintpower 14, Mecc Alte 10, Cummins 1) | 136 | 6 | 2.550 | đúng thiết kế (CLAUDE: định mức đầu phát đọc từ tệp nguồn) |
| Z2 | config-bot dùng qua `modelFacts` (model ở tên tờ): volvo-penta 25, perkins 9 | 34 | 2 | 346 | Gợi ý có số; **bản chuẩn KHÔNG có** (spec-standard không đọc `modelFacts`) — xem mục 5 |
| Z9 | máy cũ / trang bán lại (younes-bros…) + bảng không có số | 66 | 6 | 235 | |
| K4 | tổ máy nhiều động cơ "2*TAD1344GE" (baifa TWIN) | 6 + 2 | 1 | 81 | chủ đích |
| K5 | dòng tổng quan dòng máy (eastern-lion "Power range \| models") | 14 | 1 | 98 | chủ đích |

## 3. Họ bố cục cần sửa

Cột: **bảng / NCC / dòng / dòng máy không ra / mã chưa có (ước)**. "Chạm candidates" = PR làm đổi bản ghi động cơ có công suất tổ máy (hoặc `facts` mà luật loại dùng) nên đổi danh sách ứng viên Gợi ý cấu hình.

### 3.1 Bảng xếp dòng (mỗi dòng một máy)

**R3. Dòng máy dưới tiêu đề nhiều tầng / tiêu đề thiếu ô** — 74 / 20 / 771 / 631 / **~483**
- Tiêu đề có 2–3 dòng mà dòng trên không phủ cột model / động cơ, hoặc số ô tiêu đề lệch ≥ 2 so với dòng. Không có ghi chú nào (bỏ im lặng).
- camda-generator n137 (bảng 43) «Cummins Powered Open Diesel Generator…»: `H | Open Type | kVA | kW | kVA | kW` / `R | KDGC22S | 27 | 22 | 25 | 20 | 4B3.9-G2 | PI144E | 1580×650×1146 | 777` (44 dòng, 9 bảng, ~232 mã).
- baudouin n120 (bảng 53) «12M33 - Baudouin PowerKit»: `H | DCP | Data Centre Engine Power | Data Centre Genset Power` / `H | 50Hz | kWm | | kWe | kVA | RPM |` / `R | 12M33G1265/5 | 1018 | | 900 | 1125 | 1500 |`.
- Khác: sanq 3 (58), mamo 3 (49), stone-power 19 (một máy, "Gensets Model | Prime | Standby" / "kW | kVA | kW | kVA"), victory, cgm.
- Sửa: `web/catalog.js` `titledPowers` + chọn cột model / động cơ khi tiêu đề thiếu ô đầu (camda: tiêu đề chỉ phủ phần công suất, mã đứng trước); bảng động cơ Baudouin DCP đi danh sách tường minh. Test `suppliers/*.test.mjs` dòng thật; đo `spec-diff`, `cmpP/revP`. **Chạm candidates.**

**R2. Dòng máy không có dòng tiêu đề (bảng tách trang / phần nối)** — 143 / 16 / 2.317 / 1.276 / **~453**
- green-power n1001 (catalog PDF, 6 bảng, ~225 mã), conductorjasa 43 bảng (genset, mã đã có phần lớn), mwm 43 (datasheet khí 8 thứ tiếng), man-engines 16, kwise 8 (tờ đầu phát), wartsila 6, mecc-alte 5.
- conductorjasa n105 (bảng 11): `R | CJPS C-500 WP QSZ13-G10 500 kVA prime | QSZ13-G10 | 500 | 550 | 74 L/jam | 3600 × 1450 × 2100 mm` (không tiêu đề; hai số 500 \| 550 không ghi đơn vị — bản trước đã đề nghị HOÃN vì phải suy ra).
- wartsila n101 (bảng 1): `R | | 60 Hz | 50 Hz` / `R | 6L20DF | 1170 | 1123 | 960 | 920`.
- Sửa: chỉ bảng có tiêu đề ở bảng LIỀN TRƯỚC cùng nguồn, cùng số ô (nối tiêu đề, như `crawl-dropped` / `tach-bang-con` ở `suppliers/crawl-specs.mjs` `tablesOf`) — cào lại / dựng lại `cn/` + `specs/`; bảng không có tiêu đề nào thì để thiếu. **Chạm candidates** (green-power, wartsila).

**R1. Dòng máy dưới tiêu đề một tầng, không đọc được cột động cơ** — 38 / 14 / 458 / 353 / ~159
- Phần lớn là máy không phải tổ máy diesel thường: sincro PTO "AWBM 4-22" (máy phát gắn đầu kéo), power-hf động cơ PHF, green-power máy xăng / PTO, werna đầu phát.
- sincro-soga n163 (bảng 29): `H | model | kVA (S1) – H class 230V 50 Hz | kW driving power | HP (recommended) tractor power | rated rpm pto speed` / `R | AWBM 4-22 | 22 | 27,1 | 56 | 430`.
- power-hf n101 (bảng 0): `H | 系列 | 机器型号 | 标定功率(kW) | 1h功率(kW) | 转速（rpm) | …` / `R | PHF2D | R2105D3-1 | 13 | 14.3 | 1300 | 自然吸气 | 机械调速 | 3kW混电机组`.
- Sửa: tổ máy không mã động cơ → `GENSET_TABLES` (danh sách tường minh, `gensetsOf`); động cơ rời → `LOOSE_TABLES`. Không chạm candidates (`gensets` chưa nối config-bot; bản ghi rời không là ứng viên).

**R5. Bảng động cơ rời** — 18 / 9 / 362 / 305 / ~125 (camda 2 bảng 72 mã, jet-power 38, mecca, yingtai, acepow).
- acepow n126 (bảng 36): `H | Model | Engine Power(KW) | Bore / stroke | Intake | Displacement | …` / `R | YT3B2-D | 36 | 38 | 108x120 | Natural | 3.3 | <5% |`.
- yingtai n2006 (bảng 37): `R | 403A-11G1 | 8 | 9 | 3 | 77x81 | 1.13 | 23.0:1 | 4.9 | ≤252 | 2.42 | 机械 | 5.2 | ／`.
- Sửa: `ENGINE_TABLES` / `LOOSE_TABLES` (web/catalog.js, danh sách tường minh, soát số với NCC khác vì vào phiếu số đông). **Chạm candidates** qua `facts` / số đông (xi lanh, dung tích).

**R6. Bảng đầu phát rời** — 35 / 9 / 800 / 606 / ~368 (faraday 10 bảng 108 mã, rise "Marathon GM-…" 80, sincro 72, victory 50, mecc-alte Zanardi 41). Xem mục 4 (cùng gốc với tờ đầu phát).

**P1. Dòng biến thể không ghi mã động cơ** (đọc thiếu dòng) — 21 bảng / 1 NCC (green-power) / 643 / 369 / ~316
- green-power n110 (bảng 11): dòng bản trần có động cơ, ngay dưới là dòng bản cách âm chỉ có model + kích thước: `R | GP22 S/B | S | 100 | 2100 | 870 | 1165 | 710`.
- Sửa: danh sách tường minh "dòng biến thể kế thừa động cơ / công suất của dòng trên" (CLAUDE `ENGINE_CELL_TABLES` đã ghi "dòng bản cách âm không ghi động cơ bỏ + note" — cần Khoa duyệt cho kế thừa). **Chạm candidates.**

**P2. Ô động cơ viết lạ, dòng bị bỏ KHÔNG ghi chú** — 20 bảng / 15 NCC / 471 / 148 / ~60. Đo `CAT.isCode` từng ô:
- `DP054CC`, `DP086CC`, `DP158CC` → false (đuôi "CC" bị coi là cc; chú thích trong `catalog.js` ~dòng 2355 đã biết, chưa sửa ở bảng ngang). **70 dòng / 19 NCC** có ô `DPxxxCC` ở bảng ngang (đếm bằng regex trên `cn/`). mecca-power n5001 (bảng 54): `R | MC220D | 160 | 200 | 176 | 220 | DP054CC |`.
- `DC13 507A 300` (Scania + số kVA không chữ "KVA": agg-fuzhou n112, voltgent n107), `YC12VTD1350N－D30` (gạch toàn chiều rộng, aosif n112), `4BTA3.9-G2 （QC50/60E)` (nenjo n103/n105), `QSK38- G26 *` (tellhow), `BF4M 2011 C` (cgm), `1104C-44TAG1/ 1104D-E44TAG 1 ★` (ettes n146/n164), `Weichai Steyr P10` (jianghao), `DC12 59A 10-32A` (huadong n106) → false.
- `P086T1-1` (kaihua, zhengdian), `P086TA` / `P158FE` (xingguang), `U I224D` (fengmao) → `isCode` true mà dòng vẫn không ra bản ghi, không ghi chú: **chưa tra nguyên nhân**.
- Sửa: `isCode` / `SCANIA_CODE` / `engineCode` cho từng mẫu (DOOSAN "DPxxxCx" trước "cc"), dòng còn lại ghi `note` thay vì bỏ im lặng. Bẫy CLAUDE: đổi `isCode` làm đổi dòng NCC khác → đo `spec-diff --gate` + danh sách model trước/sau. **Chạm candidates.**

**P3–P6** (mỗi họ 1 NCC): huadong n102 dòng con "45 \| NT855-GA \| 254 …" (phương án động cơ khác, không model tổ máy, 6 dòng); yingtai n107/n109/n116 + keliang n108/n124 + lanzhou n102 bảng rời đọc một phần (153 dòng); hatz n2001 model "3.2-2-1/S100" (9 dòng); green-power n1001 bảng 44 catalog PDF ghép hai cột máy một dòng (132 dòng, `| / | M2 | A2 | GP95 S/V | 85 | 93 | …`).

### 3.2 Model xoay ngang, tờ dọc, nhãn chung ô

**L1. Model xoay ngang theo cột** — 228 / 42 / 2.617 / 103 / **~431** (+ mwm 6 bảng đọc được 1 cột, 73 dòng)
- Dòng "Model / Genset Model / 型号" có ≥ 2 mã, mỗi cột một máy (thường 50 Hz | 60 Hz). Lý do ghi chú thường gặp: "bảng dọc: một dòng Model ghi hai mã: trang nhiều sản phẩm", "công suất có nhãn mức nhưng không đọc được số / đơn vị".
- koten-power n212 (bảng 106, 46 bảng): `R | Genset Specification | Genset Model | KF40D5 | KF45D6` / `R | Frequency | 50Hz | 60Hz` / `R | Prime Power | 32kW | 40kVA | 36kW | 45kVA` (hai ô mỗi máy).
- gdf-guangzhou n116 (bảng 12, 15 bảng ~60 mã): `R | Engine Model | | 6 G32A | 8G32 | 8G32A | 9G32` / `R | Power | kW | 2750 | 3380 | 3700 | 4180`.
- Khác: liyu 38, itc 28, kanpor (đầu phát STF) 27, huayuan 21, bison 20, yongcai 10 bảng, genlitec 9, volvo-penta 8, mwm 18 (động cơ khí).
- Sửa: `isLabelTable` hiện chỉ nhận khi dòng TIÊU ĐỀ đầu là "Model \| mã \| mã" và không dòng nào bắt đầu bằng mã; cần bộ đọc cột cho dòng Model nằm trong `rows`, ô đơn vị chen giữa ("\| kW \|"), cặp kW \| kVA mỗi máy (ghép theo `onePair`). Tệp: `web/catalog.js` (`isLabelTable`, `fromLabelTable` / `verticalRecords`), test mới. **Chạm candidates** (koten, yongcai, bison là tổ máy có động cơ).

**V1. Tờ dọc một máy, có model, KHÔNG ghi mã động cơ** — 208 / 23 / 2.316 / – / ~70 (longkai 101 bảng, ronsun 32, teksan 15, generac 10). Lý do ghi chú "bảng dọc: không có mã động cơ".
- longkai n1002 (bảng 37): `H | Rated prime power | kva | 85` / `H | Model | LONGKAI | LK224G` / `R | Engine-SDEC | Power factor | 0.8` (tờ ĐẦU PHÁT LK224G, không phải tổ máy).
- ronsun n113 (bảng 12): `R Genset Model: SG100-SYN` / `R Rated Power (kW / kVA): 100 kW / 125 kVA`.
- Sửa: cần quyết định của Khoa (bản trước đã nêu): cho bảng dọc tạo bản ghi tổ máy không động cơ (như `gensetsOf`) hay bỏ. Không chạm candidates nếu đi `gensets`.

**V3. Tờ dọc bị coi là "nhiều sản phẩm"** — 105 / 10 / 1.670 / – / ~98 (astra 49, kubota-japan 28, dingbo 13). Mở mẫu: phần lớn là MỘT máy, "model thứ hai" là ô "Unit" hoặc dòng Model của động cơ:
- kubota-japan n104 (bảng 3): `R | MODEL | Unit | SQ-3200` / `R | Standby Output | kVA (kW) | 22.0 (17.6)`.
- astra n102 (bảng 1): `R | Model | AS165W` / `R | Rated Power (kW/kVA) | 120/150` (dòng Model thứ hai ở dưới là của động cơ).
- Sửa: luật "từ hai model" của `verticalRecords` (bỏ ô "Unit"/"单位", Model sau tiêu đề Engine là động cơ — CLAUDE bang-doc-1 bẫy (2)). **Chạm candidates** khi có mã động cơ.

**V5. Tờ dọc một máy, model chỉ ở tên trang** — 124 / 18 / 2.133 / – / ~79 (linz 33 tờ đầu phát, koten 19, baudouin 13, perkins 12). `linz n1005`: `R PRO18S A/4` / `R | Insulation Class | H`. Sửa: lấy model từ tên tờ CHỈ cho tờ hãng một model (như `titleModelKeys` của config-bot) — để bản chuẩn cũng có.

**V2 / V4.** Tờ dọc: công suất không đọc được (45 bảng, ettes 32 "Power Rating (kW/kVa ) | 40/50", ronsun) và có dòng Model mà bộ đọc dọc không chạy (15 bảng, ronsun "Genset Model: GF-1000/1250", dingbo "Rated power: 700KW/875KVA" không có dòng Model). Sửa trong `verticalPower` / điều kiện vào `verticalRecords`.

**L5. Hai cặp nhãn \| giá trị một dòng (dọc kép)** — 172 / 12 / 777 (haut-power 139 bảng, 25 tổ máy HT-…, liangdi 8, acepow 5, stone 5).
- haut-power n124 (bảng 43): `R | Engine Item No. | 4006-23TAG2A | Cylinder No. | 6` / `R | Prime Power (KW) | 620 | Fuel Consumption | 155L/h`.
- Sửa: `cellsOf` / `fromLabelTable` tách dòng 4 ô thành hai cặp khi ô 1 và ô 3 là nhãn (bước 4 đã đếm phần nhãn của cặp thứ hai). **Chạm candidates** (haut có mã động cơ).

**L3 / L4. Nhãn và giá trị chung một ô** — L4 dấu chấm dẫn: 140 / 2 / 5.670 (lees-power 137 datasheet, 135 model LSP…/LSC…; giá trị là thông số cho model ĐÃ có từ bảng khác); L3 "Nhãn: giá trị" sau dấu `|`: 16 / 2 (baudouin 14 "\| Cylinders: 4", supermaly "\| Genset Model：SP28GFS").
- lees n1079 (bảng 120): `R | MODEL: | LSC950S3-6` / `R | Powered | by` (PDF hai cột, dòng "Manufacturer………CUMMINS").
- Sửa: `cellsOf` hiện chỉ tách "nhãn: giá trị" khi dòng KHÔNG bắt đầu bằng "|" → thêm tách trong ô; lees cần bộ tách "……" riêng. Lợi: thông số, không thêm model. **Chạm candidates** qua `facts` (lees, baudouin).

**L8. Dòng chữ thô (pdftotext, cột cách bằng dấu cách)** — 225 / 31 / 2.127 (cummins-china-investment 43 bảng một dòng, tide-power 27, pramac 21, lance 17, mahindra 12, senci 12, scania 11).
- tide-power n2001 (bảng 3): `H PRP   PRP   ESP    ESP     ENGINE      REG.  …` / `R 500   625   550    688     KT38-G      12V/TC       DSE6120  FB625-C1 …`.
- cummins-china-investment n2001 (bảng 2): `H     Model  Name      Standby     Prime               Engine  Model …` / `R     C220D5           220   176   200   160           6CTAA8.3-G7 …`.
- Mã chưa đếm được (một ô chứa cả dòng); ước theo bản trước (nhóm P1 cũ): ~780 khoá chưa có. Sửa: chạy lại `catalog-pdf.mjs --rows/--spread` hay `pdftotext -table` cho tệp nguồn (`suppliers/catalog-pdf.mjs`, dựng lại `cn/`), KHÔNG viết bộ tách theo dấu cách trong `catalog.js` (cột lệch khi ô trống). **Chạm candidates.**

### 3.3 Bảng không model / bảng phụ (thông số rời)

| mã | họ | bảng | NCC | dòng | ví dụ |
|---|---|--:|--:|--:|---|
| B1 | bảng phụ của tờ ĐÃ đọc: model ở bảng khác cùng nguồn (tách trang / tách khối) | 166 | 22 | 1.662 | genlitec n1014 `\| Air System \| 50 Hz \| 60 Hz` / `\| Combustion Air Flow Prime \| m³/min (cfm) \| 4.8 (170)`; shanhua n1002 `\| 备用功率 Standby Power \| 1320 \| 1650` |
| T1 | nhiều cột, nhãn đầu dòng, không dòng Model | 272 | 47 | 1.708 | teksan n108 `H \| Standby (ESP) \| kVA \| 8` / `R \| Canopied \| 700 x 1750 x 1200 \| 485`; lei-shing-hong n2001 `\| 机组功率主用 \| 720 KW/900 KVA` |
| V6 | tờ dọc không có model | 235 | 35 | 2.900 | dianbida n102 `额定功率：20(kw)` (51 bảng; model chỉ ở URL / tên trang "DD-20"); elitech n161 `Power(kVA): 10` |
| M1 | thông số động cơ không mã ở dòng | 72 | 16 | 723 | mwm n102 `\| Electrical output \| kW \| 1,380 \| 1,380`; yangdong n102 `\| Engine Standby Power (LTP) \| kW \| 50.4 \| 55.6` |
| Z8 | mảnh ≤ 3 dòng, ≤ 3 ô | 195 | 19 | 312 | perkins n123 "Product Comparison" 92 bảng; bobig `\| Rated Power (kVA) \| 625 \| 688` |
| Z7 | chưa xếp | 160 | 32 | 1.933 | sevenpower CHP 27, koten 25, vpower 19 (máy khí: hiệu suất, nhiệt) |

Sửa: B1 cần "ngữ cảnh tờ" (model của bảng khác cùng `n` khi tờ chỉ một model) — `web/catalog.js` `fromSupplier` (chạm mọi bảng tờ PDF, rủi ro cao); T1 / V6 / M1 / Z7 phần lớn không gắn được model: **để thiếu**, trừ teksan (52 bảng T1, model ở tên trang "TJ8PE-1") và lei-shing-hong (43, tên trang "4008TAG1A E-unit") có thể đi đường V5.

### 3.4 Đọc ra model nhưng ô số không vào trường chuẩn (775 bảng)

"Nhãn nhận" = ô số có nhãn (ô trước, hoặc tiêu đề cột) mà `CAT.specKey` nhận hoặc là nhãn công suất: phần này hỏng do BỐ CỤC; "nhãn không nhận" = việc của bước 4 (nhãn).

| mã | họ | bảng | NCC | ô số | nhãn nhận / không | model-lượt | ví dụ |
|---|---|--:|--:|--:|---|--:|---|
| C1 | tờ một máy chỉ ra công suất qua `productLines` (`fromLine`), phần nhãn \| giá trị không đọc | 249 | 32 | 4.976 | 1.999 / 1.169 | 474 | kirloskar n2013 `Prime Rating at rated rpm (as per ISO8528)1` rồi dòng sau `750 kVA` (nhãn và giá trị khác dòng); longhong n2004 `\| 发电机组型号： Generator set model: \| LHGF-75`; electra-molins (cách bằng dấu cách) |
| C2 | bảng nhãn ra model, thông số không vào chuẩn | 397 | 18 | 15.559 | 8.503 / 5.287 | 530 | powerlink n2005 (124 bảng) `H \| Engine Model \| QSK60G3 \| QSK60G3 \| …` / `\| Voltage \| 3300V \| …` (một máy, cột theo điện áp); aosif 112 `\| Prime Power \| 125KVA/100KW` / `Engine` (tiêu đề phần là dòng không "\|"); keypower 89 `Fuel cons L/H(100%):` |
| C3 | bảng ngang ra model, cột thông số không đọc | 129 | 37 | 12.201 | 5.380 / 5.425 | 565 | perkins n5001 (19 bảng) `H \| Engine model \| Prime kWm \| Standby kWm \| Prime kWe …` (kWm không vào `power_kwm`); baudouin n1006 (19) tiêu đề ba tầng `\| 4M06G2D0/S \| 23 \| 25 \| 18 \| 23 …`; kc-generatorset 17 (cả tờ nằm trên vài dòng siêu dài) |

C3 có 55 bảng của hãng động cơ (perkins 19, baudouin 19, hnd 4, googol 3, wartsila 3…; 345 model-lượt): đây là chỗ thiếu `power_kwm` của tờ hãng động cơ. Sửa C1: cho bảng nhãn có `fromLine` đọc tiếp nhãn \| giá trị (nhãn và giá trị khác dòng: luật riêng); C2: tiêu đề phần không "\|" ("Engine", "Generator") + bảng cột theo điện áp; C3: cột kWm theo tiêu đề (`COLUMN_SPECS` hoặc luật "kWm" ở `rowSpecs`). Tệp `web/catalog.js`, `spec-norm.js` (đơn vị kWm), test. **Chạm candidates** (C3 kWm dùng ở `enginePowerOf`; C1/C2 cho `facts`).

## 4. Tờ đầu phát chưa ra định mức (theo hãng)

Đo trên 459 tệp nguồn của 40 NCC vai `alternator_maker` + gfe-power, wintpower (`ratings.mjs` qua cổng chữ như config-bot; tệp có bản ghi động cơ catalog cùng `n` là trang TỔ MÁY, loại ra). Danh sách từng tệp (154 tệp "không ra") không commit vì việc này chỉ thêm hai tệp; bảng dưới gom theo hãng.

Đã ra: Stamford 75 / 79 tệp (181 model; PI7 / LVSI804 mà bản trước báo 0 nay đã ra), Leroy-Somer 21 / 27 (130 model), Mecc Alte 10 / 22 (65), wintpower 14 / 16, gfe 4 tệp. Ra bản ghi đầu phát từ bảng (catalog `ALT_TABLES` / `LOOSE_TABLES`): eastern-lion n156, gordon n117, keliang n108, shengfeng n106, lanzhou n102.

**Hãng có tờ định mức THẬT mà không ra số** (dạng: A = model một ô, ô kế là nhãn kVA / 额定容量, số theo điện áp ngang, dòng kW bên dưới không có model; B = tờ một model, nhãn định mức theo cấp nhiệt ở ô đầu; C = mỗi dòng một model, kW / kVA ở cột; D = câu chữ; E = chữ thô pdftotext):

| hãng (NCC) | tệp | dạng | dòng định mức nguyên văn |
|---|--:|---|---|
| Linz (linz-electric) | 33 | B | n1001 `\| Rated Power in Class H \| kVA \| 33 \| 50 \| 50 \| 48 \| 42 …` / `\| (125°C/40°C) \| kW \| 26.4 \| 40 \| 40 …` (model "PRO18L F/4" ở tên tờ) |
| Soga / Sincro (sincro-soga) | 18 | C | n127 `\| model \| frame size mm \| kVA (S1) – H class 230V 50 Hz \| …` / `\| R80 MBL \| 80 \| 1,2 \| 1,5 \| 68 \| 69` (phẩy thập phân) |
| Kwise (kwise-generator) | 16 | A + E | n1001 `\| KAL164A1 \| kVA \| 8.1 \| 8.1 \| 8.1 \| 7.7 \| 9.1 …` / `\| kW \| 6.5 \| 6.5 …`; n2001 cùng tờ dạng chữ thô `KAL164A1      kVA        8.1     8.1` |
| Shangyan (shangyan-jiangsu) | 14 | A | n109 `\| GR270C \| Rated capacity(KVA) \| 100.0 \| 100.0 \| 100.0 \| 106.0 …` / `\| Rated power(KW) \| 80.0 …` |
| Faraday (faraday-wuxi) | 9 | A, C | n101 `\| FD2A-4 \| 额定容量（KVA） \| 42.5 \| 42.5 \| 42.5 \| 52.5 …` / `\| 额定功率（KW） \| 34.0 …`; n102 `\| FDH5-4Y5F1 \| 625 \| 500 \| FDH5-4Y5F2 \| 625 \| 500` (hai máy một dòng) |
| Firstall (firstall-power) | 9 | A, B, E | n1001 `\| Rated power at Class H (125ºC) temperature rise \| kVA \| 2135 \| 2200 …` / `\| 额定功率在H(125ºC)温升 \| kW \| 1708 …` |
| Mecc Alte Zanardi / CTP (mecc-alte) | 4 | C, A | n102 `\| BTP3 S/2 \| 2 \| 13kVA \| 15.6kVA`; n1004 `\| KVA \| 25 \| 74 \| 76,5 \| 76 \| 7,2 …` |
| Leroy-Somer (leroy-somer-fuzhou) | 3 | A, E | n1022 LSA 43.2 `\| 43.2 S1 \| kVA \| 35 \| 35 \| 35 \| 35 \| 24 \| 33 …` (khối không qua `lsRatings`) |
| Keliang | 1 | D | n101 `YH-164A: Prime 6.5 kW (8.1 kVA) / Standby 7.2 kW (9.0 kVA)` |
| Marathon, Marelli | 1 + 1 | E | marathon n1 `RATINGS      572RSL6429    406        325  500 …` |
| wintpower, gfe | 1 + 1 | A | wintpower n1001 WT164G `\| kVA BASE RATING FOR \| 22.5 …`, `\| kVA \| 10.0 …` (tờ Stamford-giống, khối không khớp `stamfordRatings`) |
| Bảng đầu phát rời trong trang tổ máy (R6, catalog) | 35 bảng | C | rise-power n103 `\| GM-8.6-4 \| 8.6 \| 11 \| 200/400V \| 15.5 \| 50Hz …`; victory, xingguang, minsun |

Không có tờ (chỉ dải công suất trong câu: "6.8–2500 kVA"): eastern-lion 8 trang, evotec 5, cgen, engga, hutai, lingyu; 23 hãng còn lại không có dòng định mức nào trong tệp nguồn. shengfeng n3 thực ra là bảng TỔ MÁY (`GF/GFS-90 … WD12911`) chưa đọc.

Sửa: thêm bộ đọc dạng A (một hàm cho Kwise / Shangyan / Faraday / Firstall / Leroy LSA 43.2) và B (Linz) vào `suppliers/ratings.mjs` + cổng chữ của `sourceRatings` (`config-bot.mjs`; Linz, Shangyan, Faraday không qua cổng `RATINGS|TEMPERATURE RISE`); test đọc tệp nguồn thật (`ls-ratings.test.mjs` làm mẫu). Chạm Gợi ý cấu hình ở danh sách hãng đầu phát (`makerAlts`, `altNeedOf`) và bản chuẩn `ratings`, **không chạm `candidates`**.

## 5. Tờ hãng động cơ và bộ điều khiển

- **Động cơ** (bảng của NCC vai `engine_maker` trong các họ): C3 55 bảng (perkins / baudouin kWm theo cột), Z2 34 (volvo-penta 25 product bulletin "Net engine prime power kWm, 50 Hz / 1500 rpm \| 328 kWm / 1500 rpm" + perkins 9: config-bot dùng qua `modelFacts`, nhưng `spec-standard.mjs` chỉ lấy từ `CAT.build` + `sourceRatings` nên bản chuẩn KHÔNG có các số này), Z8 98 (perkins "Product Comparison"), L1 31, M1 30, R2 26 (mwm, man), V5 26, L8 18, T1 16, L3 14 (baudouin "\| Cylinders: 4"). Việc đáng làm nhất: cho bản chuẩn nhận số tờ hãng động cơ mà config-bot đã đọc (`modelFacts` sheet / `makerConst`) — một PR ở `spec-standard.mjs`, không chạm catalog.
- **Bộ điều khiển**: 86 bảng / 59.720 dòng của 7 NCC hãng; `controllerSheetFacts` ra dòng cho 67 bảng, 3.266 dòng không gắn model. 19 bảng 0 dòng: 9 tờ Deep Sea dòng G (DSEG8600, 8660, 8680, 8900, 8007, 8500, 7400, 7300, 4500; tên tờ "Datasheet: Series Data Sheet", không có model → bẫy đã ghi ở CLAUDE "sửa tay title trước merge-specs", CHƯA làm) và 10 tờ mô-đun (CM2-4G-GPS, CM3-Ethernet, CM-RS232-485, DSE890 / 891 / 855, DSEWebNet, DSENet, tờ tuỳ chọn) — mô-đun do `ctl-module.mjs` đọc riêng, đúng thiết kế. Bố cục văn xuôi của tờ BĐK không phải lỗi đọc dòng (mọi dòng vào `facts` dạng chữ); còn `spec-fields.json` phần controller có 48 trường mà 0 trường có `key` (chưa có code đọc) — việc của bước 4/5, không phải bố cục.

## 6. Xếp hạng theo model được lợi và chia PR

Model = "mã chưa có" ước lượng (mục 0); họ không thêm model xếp theo giá trị số thêm được.

| hạng | PR (độc lập) | họ | bảng / NCC | model lợi (ước) | tệp chạm | chạm `candidates` |
|--:|---|---|---|--:|---|---|
| 1 | Bảng ngang tiêu đề nhiều tầng / thiếu ô (camda, sanq, mamo, baudouin DCP) | R3 | 74 / 20 | ~480 | `web/catalog.js` (`titledPowers`, chọn cột), test mới, `fixtures/power-titles.json` | **Có** |
| 2 | Model xoay ngang theo cột (koten, gdf, bison, yongcai, liyu, itc) | L1 | 228 / 42 | ~430 | `web/catalog.js` (`isLabelTable`, bộ đọc cột), test | **Có** |
| 3 | Ô động cơ viết lạ: DOOSAN `DPxxxCC`, Scania "DC13 507A 300", gạch toàn chiều rộng, ngoặc ghi chú; dòng bỏ phải ghi note | P2 | 20 / 15 (+70 dòng DPxxxCC / 19 NCC) | ~60 + dòng mới của model đã có | `web/catalog.js` (`isCode`, `SCANIA_CODE`, `engineCode`) | **Có** |
| 4 | Định mức tờ đầu phát dạng A + B (Linz, Kwise, Shangyan, Faraday, Firstall, LSA 43.2, Soga) | mục 4 | ~130 tệp / 11 hãng | ~370 (R6 + tờ) | `suppliers/ratings.mjs`, `sourceRatings` (config-bot), test | Không (chạm danh sách hãng đầu phát) |
| 5 | Bảng không tiêu đề nối tiêu đề bảng liền trước (green-power catalog, wartsila, man) — cào / dựng lại dữ liệu | R2, P6 | 144 / 16 | ~530 (green-power ~300) | `suppliers/crawl-specs.mjs` `tablesOf` + dựng lại `cn/`, `specs/` | **Có** |
| 6 | green-power dòng biến thể kế thừa động cơ (cần Khoa duyệt) | P1 | 21 / 1 | ~316 | `web/catalog.js` danh sách tường minh | **Có** |
| 7 | Tờ dọc: "nhiều sản phẩm" giả + công suất không đọc + Model không chạy | V3, V2, V4 | 165 / ≤ 20 | ~120 | `web/catalog.js` (`verticalRecords`, `verticalPower`) | Có (khi có mã động cơ) |
| 8 | Chữ thô pdftotext: cào lại bằng `-table` / `catalog-pdf.mjs` (cummins-china, tide, pramac, lance, senci) | L8 | 225 / 31 | chưa đếm được (bản trước ~780 khoá) | `suppliers/catalog-pdf.mjs`, dữ liệu `cn/` | **Có** |
| 9 | Dọc kép hai cặp một dòng (haut 139) + nhãn "X: y" trong ô (baudouin) | L5, L3 | 188 / 14 | ~40 (haut 25 tổ máy) + thông số | `web/catalog.js` (`cellsOf` / `fromLabelTable`) | **Có** (facts) |
| 10 | Cột kWm tờ hãng động cơ (perkins, baudouin) + bản chuẩn nhận số `modelFacts` của tờ hãng (volvo-penta) | C3, Z2 | 89 / 11 | 0 model mới, ~345 model-lượt có `power_kwm` | `web/catalog.js` / `suppliers/spec-standard.mjs` | Có nếu đổi catalog; không nếu chỉ `spec-standard` |
| 11 | Tờ một máy: nhãn và giá trị khác dòng / "Nhãn：giá trị" (C1, C2) và lees "……" (L4) | C1, C2, L4 | 786 / ~50 | 0 model mới; ~10.500 ô số có nhãn nhận được (C1 + C2) | `web/catalog.js` | **Có** (facts) |
| 12 | Bảng rời động cơ / đầu phát + tổ máy không động cơ theo danh sách tường minh | R5, R1, P4 | 62 / ≤ 26 | ~350 | `LOOSE_TABLES`, `ENGINE_TABLES`, `GENSET_TABLES` | R5: có (số đông); R1 / P4: không |
| 13 | Tờ dọc không mã động cơ (V1) → bản ghi tổ máy | V1 | 208 / 23 | ~70 | cần Khoa quyết thiết kế | Không (nếu đi `gensets`) |
| – | Loại khỏi danh sách `unread()` các bảng lặp / đã đọc ở nguồn / tờ hãng | Z0, Z1, Z2 | 421 | 0 | `web/catalog.js` `unread` hoặc `unread-tables.mjs` | Không |
| – | Để thiếu (không gắn được model, ít giá trị) | B1, T1, V6, M1, Z7, Z8 | 1.100 bảng | — | — | — |
| – | Hãng BĐK dòng G: sửa tay `title` 9 tờ DSE trước `merge-specs` | BĐK | 9 / 1 | 9 model BĐK | `datasheets/deep-sea-electronics.json`, `cn/` | Không (facts BĐK) |

Thứ tự đề xuất: 3 (nhỏ, sửa lỗi im lặng) → 1 → 2 → 4 → 7 → 9 → 10 → 5 / 8 (đụng dữ liệu, cào lại) → 6, 13 (chờ Khoa). PR 1, 2, 3, 7, 9, 11 cùng sửa `web/catalog.js`: làm tuần tự (CLAUDE: hai phiên không sửa một tệp lớn cùng lúc), mỗi PR đo `spec-diff --gate`, `quality --check`, top 30 trên cloud (`do-gop.mjs`) vì chạm candidates.

## 7. Chưa kiểm / hạn chế

- Họ của bảng 0 bản ghi gán bằng luật trên chữ bảng; đã mở tay mẫu 3–10 bảng mỗi họ (khoảng 130 bảng), chưa mở hết. Đã thấy lẫn: R1 có máy PTO / động cơ; L1 có tờ động cơ mwm (mã "TCG 3016"); V5 có tờ đầu phát Linz; T1 / Z7 lẫn bảng máy khí CHP.
- "Mã chưa có" là ước lượng (mục 0), có nhiễu; không đếm bản ghi sẽ sinh. L8 không đếm được mã.
- P2: `P086T1-1`, `P086TA`, `P158FE`, `U I224D` qua `isCode` mà dòng vẫn không ra bản ghi, không ghi chú: chưa tra trong `fromSupplier`. mecca n5001 `DP054CC` đã xác định do `isCode`.
- Dòng máy không ra ở bảng có bản ghi ngoài 58 bảng đã xếp: 296 dòng rải rác (< 3 dòng / bảng), chưa xếp họ.
- Tờ đầu phát: "dòng định mức" nhận bằng regex (kVA / kW + ≥ 3 số, hoặc mã + ≥ 4 ô); trang tổ máy loại theo bản ghi động cơ cùng `n` nên trang tổ máy chưa đọc (shengfeng n3) có thể lọt vào danh sách.
- C1–C3 chỉ phân biệt "nhãn nhận / không nhận" bằng `CAT.specKey` của ô trước hoặc tiêu đề cột cuối, không mô phỏng bộ đọc.
- Không đo top 30 / `candidates` (chỉ đọc).

## 8. Tệp

- `nghiem-thu/buoc-3-bo-cuc-chua-doc.tsv`: 10.518 dòng = mọi bảng `specTables`. Cột: `ncc, vai, n, ti` (chỉ số bảng), `ho` (mã họ như báo cáo; trống = đọc bình thường), `loai` (`zero` 0 bản ghi / `rows` đọc thiếu dòng / `cells` đọc thiếu ô / `doc` đọc bình thường / `bdk`), `so_dong, o_co_chu, o_co_so, ban_ghi, dong_ra_model, dong_lap_also, model_ra, gia_tri_vao_truong_chuan, o_nhan_chuan, dong_may, dong_may_khong_ra, ma_thay, ma_chua_co_uoc, dong_fact_configbot` (dòng `modelFacts` / `controllerSheetFacts`), `ly_do_ghi_chu` (lý do của `fromSupplier`: số mục), `ten_bang`, `dong_dau_nguyen_van` (dòng tiêu đề đầu + 2 dòng, cắt 300 ký tự).
- Script và đầu ra trung gian (`tables.jsonl`, `fam.jsonl`, `ratings.jsonl`, `facts.jsonl`, `alt-files.tsv`) chỉ ở scratchpad của phiên cloud, không commit (mất khi phiên đóng); mục 0 mô tả đủ để viết lại.
