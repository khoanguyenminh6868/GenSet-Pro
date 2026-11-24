# Bước 3 — kiểm kê bố cục / bảng chưa đọc (chỉ đọc)

- Đọc trên: `origin/main` = `8832317f` (checkout chính `C:\Projects\GenSet Pro\GenSet-Pro` đúng SHA này, 24/11/2026). Không sửa code, không sửa dữ liệu, không PR, không commit.
- Lệnh đã chạy: `node suppliers/unread-tables.mjs` (tóm tắt), `node suppliers/unread-tables.mjs --json` (bản JSON chụp vào `dau-vao\buoc-3\unread-tables.json`, 3636 bảng).
- Lưu ý: `--json` ghi thẳng vào `suppliers/unread-tables.json` của repo (tham số tệp ra không được đọc). Đã chép bản chụp ra `dau-vao\buoc-3\` và `git checkout -- suppliers/unread-tables.json` để repo sạch. Nên sửa script nhận tham số `--json <tệp>` (hiện nhận, nhưng bản mặc định vẫn ghi vào repo) — chưa sửa.
- Script phụ (viết ngoài repo, scratchpad): `sig.mjs`, `fam.mjs` (phân họ bảng, heuristic), `ratings-zero.mjs` (quét `ratings.mjs` trên tệp `sources/<id>/<n>.md` của 40 NCC có vai `alternator_maker`, lấy từ `"role": "alternator_maker"` trong `suppliers/cn/*.json`), `alt-samples.mjs`, `pr-cover.mjs`. Kết quả quét: `scratchpad\ratings-zero.txt`.

## 1. Mẫu bố cục theo lợi ích

Số đếm lấy từ `unread-tables.json` (chính xác). Phân họ cho 3114 bảng "không cho bản ghi nào" là **heuristic theo dòng tiêu đề** (`fam.mjs`), chưa đọc từng bảng; ví dụ là dòng đầu của lý do, không phải ba dòng đầu của bảng. "Số dòng" của bảng: JSON không lưu, **chưa kiểm**.

### 1a. Theo lý do (đã có sẵn trong script, chính xác)

| Lý do (rút gọn) | mục | bảng | NCC | trong NCC PR nháp chạm | Ai đang lo |
|---|--:|--:|--:|--:|---|
| bảng không cho bản ghi nào | 3114 | 3114 | 191 | 620 (30 NCC) | một phần: #1105/#1110/#1111 (tách bảng con) |
| bảng dọc: không có mã động cơ | 254 | 254 | 25 | 131 | một phần (#1105/#1110) |
| dòng là cặp nhãn \| giá trị | 287 | 195 | 18 | 2 | **chưa ai** |
| dòng điện / điện áp theo vị trí không khớp công suất | 222 | 12 | 5 | 1 | **chưa ai** |
| một ô ghi hai mã | 194 | 53 | 24 | 137 | một phần (#1115 gộp khoá động cơ; ô hai mã không hãng chưa làm) |
| bảng dọc: công suất có nhãn mức nhưng không đọc được số / đơn vị | 144 | 62 | 6 | 3 | **chưa ai** |
| số vô lý so với công suất | 141 | 36 | 18 | 58 | một phần |
| bảng dọc: bảng ghi từ hai model tổ máy trở lên | 108 | 108 | 12 | 0 | **chưa ai** |
| ngoại lệ theo dòng | 104 | 53 | 21 | 22 | — (không phải mẫu bố cục) |
| bảng dọc: một dòng Model ghi hai mã | 70 | 70 | 11 | 2 | **chưa ai** |
| dòng không đúng bố cục cột của bảng tổ máy | 53 | 8 | 2 | 14 | **chưa ai** (acepow n105 t8: "| APX-200 | 2800 | 1100 | 1600 …") |
| tổ máy nhiều động cơ | 40 | 8 | 3 | 34 | — |
| mã đầu phát trùng model tổ máy | 37 | 37 | 1 | 0 | chưa ai (1 NCC) |
| bỏ thông số theo bảng (zhengchi, 59 bảng) | 558 | 59 | 1 | 0 | **không phải lỗi**: `TABLE_DROPS` chủ đích (web/CLAUDE.md) — không đưa vào lợi ích |
| dòng tổng quan dòng máy: một dải công suất | 90 | 14 | 1 | 0 | không phải tổ máy, không cần đọc |
| số bằng đúng công suất của dòng (không là khối lượng / độ ồn) | 77 | 9 | 4 | 0 | không phải lỗi bố cục |

NCC có nhiều mục nhất: zhengchi-power 562 (558 là `TABLE_DROPS` chủ đích), longkai-power 275, koten-power 243, power-hf 216, eastern-lion-fuan 177, lees-power 153, aosif 139, haut-power 139, yingtai-jiangsu 134, perkins 123.

### 1b. Phân họ 3114 bảng "không cho bản ghi nào" (heuristic theo tiêu đề, `fam.mjs`)

Xếp theo số bảng. Tổng = 3114 (kiểm đủ).

| Họ (heuristic) | bảng | NCC | Ví dụ (NCC · nguồn · bảng · dòng đầu nguyên văn) | Ghi chú |
|---|--:|--:|---|---|
| 1. Nhãn ở ô đầu, giá trị ngang (cặp nhãn \| giá trị, nhiều cặp mỗi dòng) | 1135 | 97 | acepow-fuan n110 t13 "R6105ZLDS 100KVA 400 Volt Diesel Engine Generator Set" · `\| Frequency: \| 50HZ \| Speed: \| 1500RMP`; acepow-fuan n116 t21 · `\| Rated Voltage: \| 400/230V,380 \| Speed: \| 1500/1800rpm`; acepow-fuan n120 t27 · `\| Generator \| Frequency(Hz) \| 50Hz \| 60Hz` | Chồng lên lý do "cặp nhãn \| giá trị" (287 mục). Mẫu lớn nhất, chưa ai làm. |
| 2. Model nằm ngang trên hàng tiêu đề | 1050 (714 + 336) | 61 + 18 | acepow-fuan n108 t11 "1500RPM 32KW 40KVA Canopy Diesel Generator" · `\| Model \| JE493DB-04 \| JE493DB-02 \| JE493ZDB-04 \| JE493ZDB-02`; agco-power n101 t0 "Browse engines - AGCO Power" · `\| \| \| CORE80 \| CORE75 \| CORE50 \| 98HD …`; acepow-fuan n101 t2 · `\| Genset Model \| Kw \| Kva \| Alternator` | Gồm hai họ: model ở ô tiêu đề (714) và mã ở ô tiêu đề thứ 2+ (336). Heuristic có lẫn: "Genset Model \| Kw \| Kva" là bảng cột (họ 4). Chưa đếm được dòng cứu được. |
| 3. Tiêu đề nhiều cột động cơ / kích thước | 213 | 39 | acepow-fuan n101 t1 "Four Stroke 20KVA 15KW Electric Start Silent Generator" · `\| Engine model \| Rated Power \| kWe \| Governor \| Type \| Combustion Chamber Type \| Number of cylinder`; biao-xiamen n105 t4 "50 Degree 1000kva Soundproof Perkins Diesel Generator Set 4008TAG2" · `\| Generator set model \| Voltage \| Hz \| Phase \| P.F. \| Prime Power \| Standby Power` | Một phần là bảng động cơ (không phải định mức tổ máy) — chưa kiểm tỉ lệ. |
| 4. Tiêu đề tiếng Trung (lẫn chữ Hán) | 234 | 34 | aosif n1049 t115 "Datasheet: 260908648754.pdf" · `\| consum油p耗ti率on \| rate \| ISO9001 \| ISO14001` (chữ bị lẫn); bison-zhejiang n1001 t19 "Datasheet: View the inverter generator Catalog" · `\| 静音变频发电机 \| ．R1250iS \| ．R2000iS …` | Tiêu đề bị lẫn chữ Hán / Latin (PDF). Chưa ai làm. |
| 5. Bảng ngắn (≤ 3 ô) | 366 | 59 | acepow-fuan n102 t4 "1800 RPM 230V 12KW Small Silent Diesel Generator" · `\| Main data : \| \| \|` | Phần lớn không phải bảng định mức; ưu tiên thấp. |
| 6. Khác (tiêu đề chữ thường, không nhận) | 116 | 29 | acepow-fuan n110 t15 · `\| APW-100 \| 100% Load \| 90% Load \| 70% Load …` | Chưa phân tích từng bảng. |

Hạn chế: họ 1 và 2 cần xem bảng để biết mỗi bảng cứu được bao nhiêu dòng (chưa kiểm). Họ 3 gồm bảng động cơ, không phải lỗi định mức tổ máy.

### 1c. Việc PR nháp đang làm (xem mục 4): chồng lên họ nào

- **Tách bảng con / dòng phân đoạn** (#1105, #1110, #1111): đúng họ "bảng con nối liền một tiêu đề" và "dòng phân đoạn Hz/Phase" — đã có PR, **không làm lại**. #1105 nói đã dựng lại 15 NCC, #1110 11 NCC, #1111 29 NCC.
- **Cột Phase lệch một ô** (#1118: elitech, aj-power, welland): đã có PR.
- **Ô động cơ "(M)" và ngoặc** (#1115): gộp khoá, không phải bố cục.
- Không PR nào nhắm họ 1 (cặp nhãn ngang), họ 2 (model ngang), họ 4 (tiêu đề Hán lẫn chữ), các lý do "dọc: hai model tổ máy / hai mã Model / không có công suất" — **chưa ai làm**.

## 2. Tờ hãng đầu phát (`alternator_maker`) chưa ra dòng định mức

Quét `ratingsOf` (`ratings.mjs`) trên 393 tệp `sources/<id>/<n>.md` của 40 NCC có vai `alternator_maker` (`scratchpad\ratings-zero.mjs`):

- Tổng 393 tệp: **90 ra dòng**, **303 không ra dòng**. Trong 303 có 222 tệp có cả chữ kVA/kW lẫn bảng (`|`), thuộc 25 NCC — đây là nhóm đáng xem; 81 tệp còn lại là trang chung / tin tức / danh mục.
- Đã xác minh (còn đúng): **Stamford PI7 n1060–1064** và **LVSI804 n1065–1068** (stamford-avk-china) vẫn 0 dòng; tệp có "kVA BASE RATING FOR REACTANCE | 1505 | 1550 …" và "LOCKED ROTOR". Nguyên nhân trong code **chưa kiểm**.
- **Leroy-Somer**: chỉ có `leroy-somer-fuzhou` là vai `alternator_maker`; trong các tệp không ra dòng chỉ có 1 tệp có kVA + bảng là n6002 (trang tin tức). Ghi chú "Leroy-Somer bảng nhiều model" (CLAUDE) **không khớp dữ liệu hiện nay** — chưa tìm được tệp nào đúng mô tả; cần người xác nhận.

Họ bố cục trong 222 tệp (đếm theo số tệp, mẫu dòng nguyên văn từ tệp):

| Họ | tệp | NCC (tệp) | Mẫu dòng nguyên văn | Ghi chú |
|---|--:|---|---|---|
| a. Cặp kW \| kVA lặp ngang trong một hàng | 22 + 12 + 9 + 11 | agestar 22, gordon-power 12, shengfeng-fuan 9, nenjo-generator 11 | agestar n101 `\| KVA \| KW \| KVA \| KW \| L/H \| mm \| kg`; gordon-power n101 `\| kW \| kVA \| kW \| kVA \| \| rpm \| kW \| L/h …`; nenjo n3 `\| KW \| KVA \| KW \| KVA \| %` | Nhiều model trong một dòng tiêu đề: chưa ai làm. |
| b. Model ở cột đầu, nhãn kVA / kW ở cột sau | 14 | keliang-fuan 5, faraday-wuxi 9 | keliang-fuan n101 L55 `\| YH-164A \| CAPACITY(KVA) \| 8.1 \| 8.1 …`; faraday-wuxi n101 L65 `\| FD2A-4 \| 额定容量（KVA） \| 42.5 …` | Bảng ngang theo model: chưa ai làm. |
| c. Tiêu đề / nhãn tiếng Trung | 5 | lanzhou-electric 1, hutai-fujian 4 | lanzhou-electric n102 L207 `\| 型号 \| 额定容量 KVA \| 额定功率 KW …`; hutai-fujian n101 L41 `\| 持续功率 Cont.AC output kW \| 5.7 \| 6` | Chưa ai làm. |
| d. Bảng ghép tổ máy → đầu phát (tra cứu) | 16 | shangyan-jiangsu | shangyan-jiangsu n101 L64 `\| GENSET-MODEL \| Power (kW) \| RPM \| ENGINE-MODEL \| ALTERNATOR MODEL` | Đây là bảng tra cứu, không phải định mức đầu phát: có thể không cần đọc. Chưa kiểm. |
| e. Tờ PDF Stamford: dòng "kVA BASE RATING …" và "LOCKED ROTOR" | 9 | stamford-avk-china (n1060–1068) | n1060 L100 `\| kVA BASE RATING FOR REACTANCE \| 1505 \| 1550 …` | Chưa rõ vì sao bộ đọc bỏ; chưa kiểm. |
| f. Trang một model, công suất trong câu / ô đơn | 7 | hgi-generators n2001 | `\| Output Power \| 21.6 kW (27.0 kVA)` | Một công suất một trang, không bảng: chưa kiểm. |
| g. Bảng nhiều khối "Power [kW] \| Speed Range" | 7 | mecc-alte | mecc-alte n101 L50 `\| Power [kW] \| Speed Range \| Power [kW] \| Speed Range …` | Chưa ai làm. |
| h. Chỉ có "kVA" trong chữ (không có bảng ghép được) | 98 | eastern-lion-fuan 50, sincro-soga 34, linz-electric 3, werna 3, engga 2, jiali 2, marathon 2, marelli 2 | eastern-lion-fuan n1 L49 "China's most trusted supplier 6.8–2500 kVA …" | Phần lớn là trang giới thiệu: có thể không có tờ định mức; **chưa kiểm** từng tệp. |
| i. Hãng khác (evotec 5, liangdi 4, leroy-somer-fuzhou 1) | 10 | | evotec-power n2002 `EVO228 Series \| 100 kVA Alternators`; liangdi-fujian n101 `\| 10KVA-40KVA` | Chưa phân tích. |

Các họ a, b, c, e, g chiếm phần lớn tệp có bảng định mức thật; ưu tiên họ a + b (68 tệp, 6 NCC: 54 + 14).

## 3. Việc "CHƯA sửa / CHƯA dời" trong CLAUDE (kiểm trên dữ liệu main)

| # | Việc (ghi trong CLAUDE) | Kết quả kiểm | Trạng thái |
|---|---|---|---|
| 1 | baifa: CHƯA dời penlucky n108, welland-power n104, visa-gensets n101/102/105 (lẫn "undefined") | visa-gensets: `cn/visa-gensets.json` còn chữ "undefined", 3 bảng / 6 mục chưa đọc. penlucky và welland-power: **không còn bảng chưa đọc** trong `unread-tables.json`. | visa **còn đúng**; penlucky/welland: không thấy trong danh sách, việc dời chưa kiểm |
| 2 | `tablesOf` BỎ HẲN dòng không đủ số khác số ô (việc riêng) | Trùng việc đang trong #1105/#1110 (tách bảng con, dòng phân đoạn). Code trên main **chưa kiểm**. | Đang làm trong PR — không làm lại |
| 3 | Ô nước khác (KOREA, JAPAN…) của baifa, sanq, comappower, mecca chưa đọc | Không có lý do riêng trong JSON (có 30 dòng khớp "japan" trong JSON, chưa phân tích). | **chưa kiểm** |
| 4 | Tiêu đề hai tầng lệch cột (uleengen, weiman, keliang), bảng nhiều model cạnh nhau (changchai, yangdong) | uleengen: 0 bảng chưa đọc; weiman: 0; changchai: 0 (không thấy trong danh sách). keliang: 4 bảng / 5 mục. yangdong: 11 bảng không cho bản ghi. | yangdong **còn đúng**; uleengen/weiman/changchai: không còn trong danh sách, đã đọc hoặc không có tệp — chưa kiểm sâu |
| 5 | hosem n104/109/118/120/129/134: công suất lấy dòng đầu mỗi nhãn | hosem-power: 11 bảng / 12 mục chưa đọc. Không tra từng n. | **còn đúng một phần**; số n cụ thể chưa kiểm |
| 6 | Ô hai mã không hãng "S5L1D-C41 / S5L1D-F41", "UC274D / UCI274D" (acepow) | Không thấy "S5L1D-C41" trong `cn/acepow-fuan.json`; "UC274DS" có trong cn. Chưa tra tệp nguồn. | **chưa kiểm** |
| 7 | Ô "－" toàn chiều rộng: 11 dòng zhengchi | `cn/zhengchi-power.json` có **4** dòng "－"; JSON có 4 mục / 4 bảng. Con số 11 trong CLAUDE không khớp. | **còn đúng, số đếm khác** (4 chứ không 11) — nên sửa CLAUDE |
| 8 | acepow n114 "(YD485D)" thành model | `cn/acepow-fuan.json`: `\| APS164D \| (YD485D) \| 18KW/1800rpm` — vẫn thành model có ngoặc. | **còn đúng** |
| 9 | cm3 chưa đọc; "2156毫升" đọc thành 2156 L; 129 ô cc chưa thành bản ghi | Không có lý do riêng trong JSON. | **chưa kiểm** |
| 10 | madeAt: "India / UK X", "(India)", "(UK/EP)"… chưa đọc | Không phải lý do của `unread-tables` (là lý do chuỗi nơi sản xuất). | **chưa kiểm** |
| 11 | DEIF AGC-200 / AGC-4 chưa đọc được (controller) | Không thuộc `unread-tables` (dữ liệu bộ điều khiển). | **chưa kiểm** |
| 12 | Tổ máy bảng không ghi mã động cơ, `GENSET_TABLES` 46 bảng / 12 NCC | JSON có lý do "dòng không ghi động cơ (bảng có mã động cơ trong danh sách)": 28 mục / 3 bảng / 1 NCC. Không đối chiếu đủ 46 bảng. | **một phần, chưa kiểm đủ** |
| 13 | CHƯA làm: `madeChecks` nơi sản xuất đầu phát; đồng bộ thương hiệu `BP.familyOf` | Không phải đọc bảng — ngoài phạm vi bước 3. | không kiểm |

Ghi chú còn sót: "Tiêu đề Engine | Modle" và "web/CLAUDE.md:43" nói hosem n136 — không kiểm.

## 4. Sáu PR nháp (đọc `gh pr view`, không sửa)

- **#1105** (`fix/crawl-dropped-rows`, chồng #1101): `tablesOf` — dòng phân đoạn một ô / dòng trống giữa tiêu đề làm cả khối bị bỏ; khối mở bằng mã máy thành bảng riêng; dựng lại 15 NCC (`cn/` + `specs/`). Họ: **bảng con nối liền một tiêu đề**.
- **#1110** (`fix/tach-bang-con`): tách bảng con nối liền trong một khối theo tiêu đề lặp; dựng lại 11 NCC (baifa, taihai, hnd, acepow, huayuan, jet, lees, longkai, mecca, previa, shengfeng). Họ: **bảng con nối liền một tiêu đề**.
- **#1111** (`fix/tach-bang-con-2`, chồng #1110): dựng lại 29 NCC còn lại; dòng phân đoạn Hz trên tiêu đề bảng con; dòng máy ít số trơn không là tiêu đề. Họ: **tách bảng con + dòng phân đoạn Hz**.
- **#1114** (`fix/tan-so-dong-khong-ghi`): luật tần số của `candidates` (giữ dòng không ghi tần số, "cần xác nhận"). **Không phải bố cục.**
- **#1115** (`ma-dong-co-keyof`): gộp 27 khoá MTU "(3B)/(3D)" của comappower bằng danh sách tường minh, không đổi `keyOf`; 6 "(M)" để riêng. **Không phải bố cục** (chạm một phần lý do "một ô ghi hai mã").
- **#1118** (`fix/mot-pha-hai-tan-so`, chồng #1105): số pha HSMT và số pha của dòng bảng (`rowPhaseOf`), "Cột Phase lệch một ô" (elitech, aj-power, welland), bỏ đọc "50/60Hz" thành 60 Hz. Họ: **cột lệch một ô** (một phần).

Chồng chéo với bước 3: #1105/#1110/#1111 đụng `tablesOf` (họ bảng con); #1118 đụng cột lệch một ô. Các họ 1a/1b mục 1, họ 2 (a–h) **không PR nào đụng**.

## 5. Đề xuất thứ tự (theo lợi ích, chưa sửa)

1. Họ 1b-1 "nhãn | giá trị ngang" (1135 bảng, 97 NCC) — lớn nhất, chưa ai làm; kèm lý do "cặp nhãn | giá trị" (287 mục).
2. Họ 1b-2 "model nằm ngang trên tiêu đề" (1050 bảng, 61 + 18 NCC) — cần xem bảng để tách họ đúng.
3. Lý do "bảng dọc: hai model tổ máy / công suất không đọc được / hai mã Model" (108 + 144 + 70 mục, 12/6/11 NCC) — chưa ai.
4. Tờ đầu phát họ 2a + 2b (68 tệp, 6 NCC: agestar, gordon, shengfeng, nenjo, keliang, faraday) — tờ hãng, chưa ai.
5. Họ 1b-4 tiêu đề lẫn chữ Hán (234 bảng, 34 NCC).
6. Sửa số đếm trong CLAUDE: "－" 11 → 4 (zhengchi).

Không đưa vào: `TABLE_DROPS` zhengchi (558 mục chủ đích), 90 dòng tổng quan dòng máy, 77 số trùng công suất, họ 1b-5 (bảng ngắn).

## 6. Chưa kiểm (ghi rõ)

- Số dòng cứu được của từng họ (cần đọc bảng).
- Nguyên nhân Stamford PI7/LVSI804 bị `ratings.mjs` bỏ.
- Tệp đầu phát họ h (98 tệp chữ kVA) có phải tờ định mức không.
- Các việc "chưa kiểm" ở mục 3.
- Mục 2 nói "Leroy bảng nhiều model": không tìm thấy tệp tương ứng.
