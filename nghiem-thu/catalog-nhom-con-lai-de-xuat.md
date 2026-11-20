# Bốn nhóm bảng còn lại của catalog: khảo sát + phương án (20/11/2026)

Việc CHỈ ĐỌC (Khoa 20/11: "tìm phương án xử lý"): không sửa mã, không PR, không ghi web. Đo trên `origin/main` **389935b3** bằng `fromSupplier` THẬT của `web/catalog.js` chạy trên toàn bộ `suppliers/cn` (9.812 bảng, 65.916 bản ghi). `suppliers/cn`, `web/catalog.js`, `suppliers/config-bot.mjs` không đổi từ 79e9b175 (`git diff --stat` rỗng) nên số top 30 lấy từ lượt đo cloud gốc `dau-vao\catalog-c\top30-cloud\gop-goc.json.gz` (79e9b175, 1.093 lượt, 928 gói) là số của main hiện tại. Script + bảng đủ: `dau-vao\nhom-con-lai\` (mục cuối).

## KHOA ĐÃ TRẢ LỜI (20/11/2026, qua điều phối)
1 = **B** (EL / ELS + 3 số là mã đầu phát, CHỈ danh sách bảng eastern-lion) · 2 = **tìm cách đọc bản ghi** (n156 → bản ghi đầu phát: thiết kế đường đọc rồi làm) · 3 = **có** (jianghao n104 → khí; làm sau khi #958 + #963 merge) · 4 = **C** (tìm datasheet 6 động cơ simpson: `simpson-n124-nhien-lieu.md`) · 5 = **chưa quyết** (Khoa hỏi thêm về C) · 6 = **C** (chỉ yingtai n101 / n2003) · 7 = **C** (huatai n111: "额定功率" → công suất động cơ VÀ công suất tổ máy từ tên "NNNGF").

## Câu hỏi cho Khoa (mỗi câu một chữ)

1. **eastern-lion:** "EL 164D" / "ELS 184F" là mã ĐẦU PHÁT của chính NCC (cột "Alternator model", trang "EL Series Brushless Alternator"); "RUIFEN6120" là BỘ ĐIỀU KHIỂN (cột "Controller"). Không phải mã động cơ, không phải mã tổ máy, không phải tên hãng (đã mở lại trang sống 20/11). Đọc "EL/ELS + 3 số" làm mã đầu phát? **A** thêm mẫu vào `ALT_CODE` (khuyến nghị) · **B** chỉ cho danh sách bảng eastern-lion · **C** để nguyên.
2. **eastern-lion n156** (bảng chính hãng "EL Series", 48 model, công suất 50 / 60 Hz, hiện 0 bản ghi) thành bản ghi đầu phát? **C** có · **K** không (khuyến nghị K lúc này: cần đường đọc mới cho bảng của hãng đầu phát).
3. **jianghao n104** (2 bảng, 29 bản ghi, "không rõ"): ngay dưới bảng trang ghi "The above generators can be used natural gas, oil filed gas, bio-gas…". Ghi nhiên liệu khí cho 29 bản ghi (ngoại lệ cấp bảng, trên nền #958)? **C** có (khuyến nghị) · **K** không.
4. **simpson n124** (10 bản ghi, lọt top 25 lần / 21 gói, hạng 1 ở 1 lượt): trang sống tên "SIMPSON-GasGenerators" nhưng KHÔNG ghi nhiên liệu nào. **A** giữ như cũ · **B** loại khỏi gói diesel tới khi rõ · **C** giao việc tìm datasheet động cơ (ZS168FA, ZS182F, ZS190F, GX390, GX630, GX690) trên trang hãng động cơ rồi quyết (khuyến nghị C; trong lúc chờ là A).
5. **164 bảng chữ khí / xăng, 0 bản ghi:** **A** chỉ lưu phân loại này (khuyến nghị) · **B** gắn nhiên liệu theo bảng ngay (hôm nay 0 bản ghi đổi) · **C** đọc 12 bảng tổ máy xăng (119 dòng) cho 32 gói xăng.
6. **29 bảng đầu phát / động cơ rời:** **A** để nguyên · **B** đọc cả 29 · **C** chỉ đọc yingtai n101 / n2003 (bảng động cơ Cummins, cùng dữ liệu hai thứ tiếng) làm nguồn thông số động cơ (khuyến nghị C, đo top 30 trước khi merge).
7. **huatai n111:** **A** để nguyên · **B** đọc cột "额定功率 power (KW)" thành công suất động cơ, CHỈ bảng này (khuyến nghị; Gợi ý dự kiến 0 đổi) · **C** như B và lấy công suất tổ máy từ tên "NNNGF".

## Kết luận bằng số

| nhóm | bảng | dòng | đang ra | phát hiện chính |
|---|--:|--:|---|---|
| 1 eastern-lion (mọi bảng có ô EL / ELS / RUIFEN) | 55 | 1.199 | 22 bảng đúng (690 dòng, động cơ + đầu phát); 14 bảng tổng quan đúng là 0; **15 bảng thiếu đầu phát** (294 dòng); **3 bảng đọc EL làm ĐỘNG CƠ** (26 bản ghi) và **RUIFEN6120 làm ĐẦU PHÁT** (4 bản ghi); 1 bảng đầu phát chính hãng 0 bản ghi | lọt top: 40 lần / 32 gói là dòng thiếu đầu phát; bản ghi sai vai 0 lần top (EL-động cơ 972 lần trong `all`, 370 lượt; RUIFEN-đầu phát 200 lần `all`) |
| 2a nhiên liệu "không rõ" | 5 | 77 | 49 bản ghi, `fuel` rỗng ở #958 | jianghao: nguồn GHI khí (câu dưới bảng) → nên là khí; simpson: không ghi gì (25 lần top); man E3262, kingway: không rõ |
| 2b chữ khí / xăng, 0 bản ghi | 164 | 3.436 | 0 bản ghi (đo lại trên main) | 89 tổ máy khí / biogas / CHP, 31 động cơ khí của hãng, 12 tổ máy xăng, 1 động cơ xăng, 5 bộ điều khiển, 3 không phải tổ máy, 23 không rõ / rao bán. 7 bảng sẽ đọc ở #959 |
| 3 đầu phát / động cơ rời | 29 | 798 | 0 bản ghi | 20 bảng đầu phát (599 dòng, 514 model; 149 khoá đã có, 62 khoá trùng NCC khác: STC / ST là tên dòng chung) + 9 bảng động cơ (199 dòng; 134 khoá đã có) |
| 4 huatai n111 | 1 | 17 | 17 động cơ, KHÔNG công suất | cột công suất động cơ (259–1.012 kW) không đọc; 17 dòng không bao giờ thành ứng viên (không công suất) |

PR mở cùng `web/catalog.js` và vùng đụng: xem mục 5.


## 1. Nhóm 1 — eastern-lion "EL xxx" và "RUIFEN6120"

### 1.1 Nguồn thật nói gì
- Trang sống `https://easternlion.net/products/diesel-generator-set/engine-by-huachai-series/datasheet` (mở 20/11/2026, firecrawl `maxAge: 0`): dòng tiêu đề `| Model | Prime power (kW) | Prime power (kVA) | Standby power (kW) | Standby power (kVA) | Engine model | Engine power (kW) | Alternator model | Alternator power (kW) | Controller |`, dòng `| GF/GFS-HC18 | 13 | 16 | 14 | 18 | 2105D | 18.7 | EL 164D | 12.8 | RUIFEN6120 |`; phía trên bảng có nhãn "Controller RUIFEN6120". Trang danh mục (n114) có tiêu đề nhóm cột `| | Genset Specification 400/230V 50HZ | Engine | Brushless Alternator | Controller | Datasheet`.
- `EL` / `ELS`: n156 `https://easternlion.net/products/brushless-alternator/el-series/` "EL Series Brushless Alternator | EASTERNLION" liệt kê EL 164A… (cột 50Hz / 60Hz Output, SAE Size, Core Length). Hồ sơ NCC: `role: alternator_maker`, brand "EASTERNLION". ELS = bản 60 Hz (các trang "60HZ Engine By …"). **Kết luận: mã đầu phát của chính eastern-lion.** Quét toàn bộ cn: ô dạng `ELS? + 3 số` CHỈ có ở eastern-lion (1.192 ô, 0 ô ở NCC khác) → thêm vào `ALT_CODE` không đụng NCC khác.
- `RUIFEN6120`: 25 tệp nguồn ghi "Controller RUIFEN6120" (song song "Controller Smartgen 6120", "Controller Mebay 6120"). Là model bộ điều khiển; HÃNG của nó nguồn không ghi → **không rõ** (hồ sơ `controllers` hiện có Mebay, SmartGen HGM6120, không có RUIFEN). Bản ghi động cơ hiện đã mang `controller=RUIFEN6120` từ cột Controller.

### 1.2 Mã đọc ra gì (mọi bảng, `bang-day-du.tsv` cột nhóm 1 có tiêu đề cột nguyên văn + 2 dòng)
Ba dạng bảng: (a) trang danh mục, hai dòng tiêu đề như trên; (b) trang "…— Generator set specification sheet" (`/datasheet`), một dòng tiêu đề bắt đầu bằng ô rỗng `| | Model | Prime power (kW) | … | Controller`; (c) bảng tổng quan `| | | Power range | models | Engine | Alternator | Controller |`, dòng `| Engine By Cummins | 22 – 444 kW | 40 | 4BTA3.9-G2 | EL 274K | Smartgen 6120 | View details →`.

| lớp | bảng | dòng | hiện ra |
|---|--:|--:|---|
| đúng | 22 | 690 | động cơ + đầu phát EL đủ (bộ điều khiển "Smartgen 6120" không phải mã nên "EL" là mã DUY NHẤT sau động cơ → lấy làm đầu phát) |
| tổng quan (c) | 14 | 98 | 0 bản ghi, note "dòng tổng quan dòng máy" — đúng (lech-cot-11) |
| **thiếu đầu phát** | 15 | 294 | 268 động cơ, 0 đầu phát: "RUIFEN6120" là mã thứ hai sau động cơ nên luật "một mã sau động cơ" không chọn; 26 dòng ô động cơ chữ Hán ("4105ZD(小泵）", "D114系列WLD171") để trống động cơ (catalog-b) |
| **sai vai** | 3 | 68 | n147 (22 dòng): ô động cơ "D114系列WLD171" không là mã, bảng dạng (b) lệch một ô nên chốt `engCol` của catalog-b không bắt → **22 bản ghi động cơ "EL 274F"…"EL 404E"** (`engPower` = 128… thật ra là kW đầu phát); n149 (3 dòng "EL 274H/J/K") và n126 (1 dòng "EL 224E", ô động cơ "4105ZD(小泵）") cũng thế → **26 bản ghi động cơ sai vai**; cùng các dòng đó "RUIFEN6120" thành **4 bản ghi ĐẦU PHÁT** sai vai |
| bảng đầu phát chính hãng | 1 | 49 | n156: 0 bản ghi (chưa có đường đọc bảng của hãng đầu phát; chỉ động cơ có) |

Danh sách đủ: 

- **1-dung** (22 bảng, 690 dòng): eastern-lion-fuan n107/b6 (22), n108/b7 (40), n109/b9 (52), n110/b11 (60), n111/b12 (54), n112/b14 (34), n113/b16 (26), n119/b25 (52), n120/b26 (60), n121/b27 (54), n123/b30 (13), n125/b31 (26), n127/b33 (12), n135/b38 (22), n137/b39 (12), n140/b41 (19), n143/b46 (13), n145/b50 (19), n148/b53 (13), n150/b55 (13), n172/b61 (40), n173/b62 (34)
- **1-tongquan (đúng: không bản ghi)** (14 bảng, 98 dòng): eastern-lion-fuan n108/b8 (8), n109/b10 (8), n111/b13 (8), n112/b15 (8), n113/b17 (4), n114/b19 (8), n116/b22 (8), n117/b24 (4), n122/b29 (2), n129/b36 (8), n141/b43 (8), n142/b45 (8), n143/b47 (8), n144/b49 (8)
- **1-thieu-dau-phat (RUIFEN sau EL)** (15 bảng, 294 dòng): eastern-lion-fuan n114/b18 (27), n115/b20 (21), n116/b21 (24), n117/b23 (21), n122/b28 (15), n128/b34 (24), n129/b35 (17), n133/b37 (21), n139/b40 (17), n141/b42 (15), n142/b44 (22), n144/b48 (19), n146/b51 (15), n151/b56 (15), n152/b57 (21)
- **1-EL-doc-lam-dong-co** (3 bảng, 68 dòng): eastern-lion-fuan n126/b32 (27), n147/b52 (22), n149/b54 (19)
- **1-bang-dau-phat-EL (0 bản ghi)** (1 bảng, 49 dòng): eastern-lion-fuan n156/b60 (49)


Gợi ý hôm nay (đo cloud 79e9b175): eastern-lion lọt top 677 lần; **40 lần ở 32 lượt / 32 gói là dòng thiếu đầu phát** (khoá `…|<động cơ>||…`, cả 40 có RUIFEN); dòng loại này nằm trong ứng viên `all` 11.200 lần / 648 lượt. Động cơ "EL…" sai vai: 0 lần top, 972 lần `all` / 370 lượt. RUIFEN làm đầu phát: 0 top, 200 `all`.

### 1.3 Phương án
| | làm gì | bản ghi (ước tính theo dòng; số thật đo bằng spec-diff khi có code) | Gợi ý cấu hình | rủi ro |
|---|---|---|---|---|
| **A (khuyến nghị)** | thêm `ELS?\s?\d{3}[A-Z]{0,2}` vào `ALT_CODE` (dòng 44) | +362 liên kết / bản ghi đầu phát EL (294 + 68), −26 động cơ sai vai, −4 đầu phát RUIFEN sai vai; 22 bảng đúng và 14 bảng tổng quan không đổi | có: 32 lượt / 32 gói đang có dòng eastern-lion thiếu đầu phát trong top → `u.other` có giá trị → `choiceKey` (gộp trùng theo đầu phát), luật nơi sản xuất đầu phát, `check` đầu phát đổi được; 648 lượt có dòng như vậy trong `all`. Phải đo top 30 cloud | thấp: mẫu chỉ khớp ô eastern-lion; n147 / n126 / n149 dòng ô động cơ chữ Hán vẫn KHÔNG có động cơ (đúng "thà thiếu") |
| B | như A nhưng chỉ bảng trong danh sách (khoá NCC + n) | như A | như A | nhiều mã hơn A cho cùng kết quả; danh sách phải theo nguồn cào lại |
| C | để nguyên | 0 | 0 | 26 động cơ "EL…" + 4 đầu phát "RUIFEN6120" sai vai ở lại; 294 dòng thiếu đầu phát |

Câu 2 (n156): cần đường đọc mới "bảng của hãng đầu phát: ô đầu là model, công suất 50 / 60 Hz" (hiện chỉ có cho hãng động cơ). +48 bản ghi đầu phát có công suất riêng; ảnh hưởng `check` / `altKva` của cấu hình eastern-lion (677 lần top dùng đầu phát EL). Đề xuất để sau A, việc riêng.


## 2. Nhóm 2 — nhiên liệu "không rõ" và bảng chữ khí 0 bản ghi

### 2.1 Năm bảng "không rõ" (may-khi-1 mục 85; #958 để `fuel` rỗng)
- **jianghao-genset n104** (b4, 9 dòng, bản ghi engine 5) — Gas Generator-Jiangsu Jianghao Generator Co.,Ltd.
  - cột: `| Type | Output Power | Cuurrent (A) | Engine model | Cylinder | Bore*Stroke (mm) | FuelCon. (L) | Lube capacity （L） | Dimension(mm ) L*W*H | Weight(kg) // | KW | KVA`
  - `| JHRQ-30GF | 30 | 37.5 | 54 | Chaochai CY4102 | 4 | 102*118 | 3.856 | 7 | 2000*750*1300 | 760`
  - `| JHRQ-50GF | 50 | 62.5 | 90 | Huafeng HF6105Q | 6 | 105*115 | 3.6 | 15 | 2000*750*1300 | 850`
- **jianghao-genset n104** (b5, 27 dòng, bản ghi engine 24) — Gas Generator-Jiangsu Jianghao Generator Co.,Ltd.
  - cột: `| Type | Output Power | Cuurrent (A) | Engine model | Cylinder | Bore*Stroke (mm) | FuelCon. (L) | Lube capacity（L） | Dimension(mm ) L*W*H | Weight(kg) // | KW | KVA`
  - `| JHRQ-30 | 30 | 37.5 | 54 | 4B | 4L | 102*120 | 3.9 | 11 | 2000*750*1300 | 760`
  - `| JHRQ-40 | 40 | 50 | 72 | 4B | 4L | 102*120 | 3.9 | 11 | 2000*750*1300 | 760`
- **kingway-power n117** (b12, 18 dòng, bản ghi alternator 1) — China 70KW Double Membrane Biogas Storage Tank For Waste Water Treatment Manufac …
  - cột: (không có dòng tiêu đề: bảng dọc một máy, nhãn | giá trị)
  - `Model: KGD250B`
  - `Prime Power:250KVA/200KW`
- **man-engines n104** (b4, 9 dòng, bản ghi engine 9) — Compact MAN diesel and gas engines as auxiliary engines | MAN Engines
  - cột: `| Output kW 1) 50 Hz / 60 Hz | Engine model | Cylinders | Model | Displacement in litres`
  - `| 190/220 | D2676 | 6 | in-line | 12.4`
  - `| 280/330 | D2676 | 6 | in-line | 12.4`
- **simpson-power n124** (b15, 14 dòng, bản ghi engine 10) — SIMPSON-GasGenerators
  - cột: `| 机 组 型 号 | 备 用 功 率 ( kW/kVA) | 发 动 机 型 号 | 机 组 尺 寸 (mm) ( 长×宽×高) | 机 组 数 据`
  - `| SGH2200X | 2.2/2.2 | ZS168FA | 623×468×491 |`
  - `| SGH4200X | 4.2/4.2 | ZS182F | 710×549×595 |`

| bảng | bản ghi | nguồn thật (mở nguồn lưu + trang sống khi cần) | top 30 (79e9b175) |
|---|--:|---|---|
| jianghao n104 b4 + b5 | 5 + 24 | `http://www.jhgensets.com/Products_detail/32.html`, tệp nguồn dòng 82 "Gas Electric Generator：" trước bảng 1, dòng 94 "Cummins, gas electric generator：" trước bảng 2, dòng 124 chú thích ① ngay dưới hai bảng: máy chạy khí thiên nhiên / khí đồng hành / biogas / khí rơm / khí than. Model "JHRQ-…". Cột "FuelCon. (L)" (lí do lần trước chấm "không rõ") vẫn mâu thuẫn chữ, nhưng câu ① nói thẳng về "the above generators" → **khí** | 2 lần / 2 gói (hạng 8, 27); `all` 813 |
| simpson n124 b15 | 10 | `http://www.simpsonpower.cn/en/chanpinDetail/870.aspx`, mở lại 20/11: tên trang "SIMPSON-GasGenerators", KHÔNG câu nào ghi nhiên liệu; menu trang có cả "Natural Gas Genset" và "Gasoline Genset", liên kết không cho biết trang 870 thuộc mục nào → **không rõ** (khí hay xăng). Động cơ ZS168FA, GX390, GX630, GX690… (nhiên liệu của chúng: không rõ theo nguồn này) | **25 lần / 24 lượt / 21 gói, hạng 1 ở 1 lượt**; `all` 552 |
| man-engines n104 b4 | 9 | `https://www.man.eu/engines/en/products/marine/auxiliary-motors/auxiliary-motors.html`, mở lại 20/11: trang nói chung "diesel and gas engines", KHÔNG ghi model nào là khí → **không rõ** từng dòng (E3262 / D2676…). Bản ghi không công suất (cột "Output kW 1) 50 Hz / 60 Hz" không đọc) | 0 / `all` 0 |
| kingway n117 b12 | 1 | trang biogas (URL ".../biogas-generator-set/...", đoạn "Biogas generator set is a power generation device that uses biogas as fuel…") nhưng sản phẩm tên "Double Membrane Biogas Storage Tank" (bể chứa), bảng KGD250B → **khí** nếu là tổ máy; bản ghi duy nhất là ĐẦU PHÁT "Kingway KAI250" | 0 / 0 |

Phát hiện ngoài phạm vi (ghi lại, không sửa): kingway n117 là bảng dọc một máy; động cơ "SC9D340D2" KHÔNG thành bản ghi, còn bản ghi đầu phát KAI250 mang cả `cyl=6; bore=114x144; disp=8.9` của động cơ (thông số phạm vi engine treo trên bản ghi đầu phát; `builder` lọc theo phạm vi nên có thể không hiện, chưa kiểm).

**Phương án**
| | làm gì | bản ghi | Gợi ý (kèm #963: gói diesel loại dòng có `fuel`) | rủi ro |
|---|---|---|---|---|
| A | giữ rỗng cả 5 | 0 | 0 | simpson tiếp tục lọt top 25 lần dù tên trang ghi "Gas" |
| **B (khuyến nghị)** | ngoại lệ cấp bảng, có trích nguồn: jianghao n104 (2 bảng) = khí; kingway n117 = khí; simpson / man để rỗng | 30 bản ghi có `fuel` khí (29 + 1) | jianghao ra khỏi gói diesel: −2 lần top / 2 gói, −813 `all`; kingway 0 | thấp: câu nguồn nói thẳng; danh sách, không phải luật |
| C | B + simpson loại khỏi gói diesel ("nghi không phải diesel") | B + 10 bản ghi cờ mới | thêm −25 lần top / 21 gói | trái "không suy ra": nguồn không ghi nhiên liệu; cần trường / cờ mới. Chỉ làm nếu Khoa chọn 4B |

### 2.2 164 bảng chữ khí / xăng, 0 bản ghi (`may-khi\phan-loai-ngoai-catalog.tsv`)
Ghép đủ 164 / 164 bảng với `cand.json` (chỉ số bảng) và đo lại trên main 389935b3: **cả 164 vẫn 0 bản ghi** → Gợi ý hôm nay KHÔNG bị ảnh hưởng. Lí do 0 bản ghi: 158 bảng không có note dòng (không mã động cơ / đầu phát, hoặc bảng dọc / bảng ngang theo cột model), 5 "dòng là cặp nhãn | giá trị", 1 "số vô lý". Phân lớp soát tay theo tiêu đề + cột + dòng mẫu + URL (đủ 164 dòng, tiêu đề cột nguyên văn + 2 dòng: `bang-day-du.tsv`, nhóm `2b`):

- **2b-XTM tổ máy xăng** (12 bảng, 119 dòng): bison-zhejiang n114/b16 (14), n114/b17 (14), n114/b18 (13); endress-stromerzeuger n102/b0 (11); gordon-power n105/b7 (15); grupel n103/b1 (2), n107/b3 (2); kena-chongqing n108/b2 (8); kigerpower n2010/b9 (18); zc-power n109/b11 (5), n109/b12 (4), n110/b13 (13)
- **2b-KTM tổ máy khí / biogas / LPG / CHP** (89 bảng, 1487 dòng): camda-generator n101/b0 (2), n102/b1 (2), n103/b2 (2), n104/b3 (2), n141/b49 (10); frs-shenyang n107/b6 (23); gtl-power n106/b5 (36), n131/b9 (35); haitai-weifang n101/b0 (6); haut-power n102/b2 (4), n102/b3 (4), n108/b14 (4), n108/b15 (4), n110/b18 (4); kerui-gas n101/b0 (5); liyu-power n101/b0 (5), n102/b1 (5), n103/b2 (5), n104/b3 (5), n104/b4 (5); mhiet n104/b12 (9); pauway-tianjin n107/b6 (3), n108/b7 (6), n108/b8 (6), n108/b9 (5), n108/b10 (6), n108/b11 (6), n109/b12 (7), n117/b13 (8), n117/b14 (8), n117/b15 (7), n117/b16 (7); pulita-energy n101/b0 (10), n102/b1 (11), n103/b2 (10); senci n2001/b11 (8); sevenpower-chengdu n101/b0 (17), n103/b1 (23), n104/b2 (6), n105/b3 (16), n106/b4 (30), n107/b5 (28), n108/b6 (17), n109/b7 (31), n111/b8 (28), n112/b9 (6), n114/b10 (27), n115/b11 (12), n116/b12 (14), n117/b13 (16), n118/b14 (16), n119/b15 (17), n120/b16 (19), n121/b17 (30), n122/b18 (28), n123/b19 (31), n124/b20 (29), n125/b21 (17), n126/b22 (22), n127/b23 (23), n128/b24 (24), n130/b25 (24), n131/b26 (7), n134/b27 (31), n135/b28 (26), n136/b29 (29), n137/b30 (29), n138/b31 (29), n139/b32 (25), n140/b33 (22), n141/b34 (25), n142/b35 (25), n143/b36 (22), n144/b37 (29), n145/b38 (26); stemac n101/b0 (3), n101/b1 (6), n101/b2 (7); supermaly n108/b7 (25); superwatt-swt n109/b9 (18); teksan n104/b3 (110), n106/b5 (71), n152/b51 (14), n153/b52 (14), n154/b53 (13); vpower-hk n101/b0 (15), n102/b1 (11); wagna-power n102/b1 (5), n103/b2 (14)
- **2b-N không phải tổ máy (robot thoát nước / máy phát + bơm / lọc biogas)** (3 bảng, 23 dòng): camda-generator n140/b48 (6); frs-shenyang n111/b9 (13); vantek-jiangsu n111/b13 (4)
- **2b-N bộ điều khiển (chữ khí/xăng trong datasheet)** (5 bảng, 1443 dòng): comap n1007/b6 (202); deep-sea-electronics n1007/b6 (183), n1008/b7 (189), n1009/b8 (170); smartgen n1003/b2 (699)
- **2b-KDC động cơ khí của hãng** (30 bảng, 189 dòng): deutz-ag n101/b0 (15); man-engines n1006/b15 (4), n1006/b16 (4), n1006/b17 (4), n1006/b18 (4), n1006/b19 (2), n1006/b20 (2), n1006/b21 (4), n1006/b22 (3), n1006/b23 (2), n1006/b24 (5), n1006/b25 (3), n1006/b26 (8), n1006/b27 (2), n1006/b28 (2), n1006/b29 (4), n1006/b30 (3), n1006/b31 (2), n1006/b32 (8), n1006/b33 (2), n1006/b34 (5), n1006/b35 (13), n1006/b36 (2), n1006/b37 (4), n1006/b38 (8), n1006/b39 (2), n1006/b40 (4), n1006/b41 (58); volvo-penta n113/b12 (6); yanmar n108/b7 (4)
- **2b-XDC động cơ xăng rời** (1 bảng, 12 dòng): jet-power n120/b17 (12)
- **2b-KR không rõ / dải công suất / so sánh / tin** (11 bảng, 130 dòng): kachai-hangzhou n105/b4 (24), n107/b5 (24), n108/b6 (20); powgen-argentina n2001/b1 (1); shunfeng-changzhou n108/b5 (15); winco n101/b0 (2), n1007/b10 (5), n1007/b11 (6), n1007/b12 (21); zc-power n106/b6 (6), n109/b10 (6)
- **2b-KDC động cơ hãng, lẫn diesel + khí (chú thích '* For natural gas')** (1 bảng, 3 dòng): scania-engines n2001/b8 (3)
- **2b-KR rao bán máy cũ (tuabin, CAT khí)** (12 bảng, 30 dòng): younes-bros n109/b8 (2), n110/b9 (2), n111/b10 (2), n112/b11 (2), n113/b12 (2), n114/b13 (3), n115/b14 (3), n116/b15 (3), n117/b16 (3), n118/b17 (3), n119/b18 (3), n120/b19 (2)

Ghi chú lớp: KTM gồm trang CHP / biogas / LPG / khí thiên nhiên (sevenpower 39 bảng đều có "NG consumption m³/kW.h" hoặc "Biogas consumption"); stemac (URL "GruposGeradoresGas", "Cons Nm3/h", động cơ "…N0/6"); superwatt n109 (Shenny, "Gas consumption（m³/h）"). KDC: man n1006 "Brochure Power Gas", volvo G17 "Fuel type | Natural gas", yanmar dual fuel tàu thuỷ, deutz G 2.2 / 2.9 "gas and gasoline engines". KR: kachai "Gasoline Standby Generator Range" nhưng ô là dải "Power（KW）: 1000KW" (không rõ máy xăng 1.000 kW, không suy ra), winco n1007 "GASEOUS-DIESEL-BOOKLET" lẫn hai loại, shunfeng n108 "生物质燃气系列柴油发电机组" (tên vừa khí sinh khối vừa "diesel", động cơ 8300DS 500–600 vòng/phút), zc n106 / n109 b10 bảng so sánh, powgen tin lắp đặt, younes rao bán tuabin / CAT khí đã qua sử dụng. 

Bảng #959 (việc C) SẼ đọc thành tổ máy: frs n107, teksan n104 / n106, vpower n101 / n102, zc n109 b11 / b12 (7 bảng, 239 dòng) — #959 chưa ghi nhiên liệu cho chúng.

Lịch sử HSMT (may-khi-3, 1.259 gói): khí 0 gói, xăng 32 gói → chỉ bảng XĂNG có thể có ích cho Gợi ý.

**Phương án**
| | làm gì | bản ghi | Gợi ý | rủi ro |
|---|---|---|---|---|
| **A (khuyến nghị)** | lưu phân loại này (tệp tsv ở sổ), không code | 0 | 0 | không |
| B | gắn nhiên liệu theo bảng (danh sách) ngay, để khi bảng được đọc (#959, việc D) bản ghi mang sẵn `fuel` | 0 hôm nay; 7 bảng #959 (239 dòng) có `fuel` khi #959 merge | 0 (#959 chưa nối Gợi ý) | thấp; nhưng làm trước khi có bản ghi là việc sớm |
| C | đọc 12 bảng tổ máy xăng (bison 3, endress, gordon n105, grupel 2, kena, kigerpower n2010, zc n109 b11 / b12, zc n110: 119 dòng) bằng danh sách kiểu `GENSET_TABLES`, `fuel` = xăng | ≈ 119 dòng; 2 bảng (zc n109 b11 / b12, 9 dòng) ĐÃ nằm trong `GENSET_TABLES` của #959 (chỉ thiếu `fuel`); 10 bảng còn lại là bảng model chạy ngang theo cột (bison 3, gordon, kena, zc n110) hoặc bảng nhãn một máy (endress, grupel 2, kigerpower): cần bộ đọc bảng dọc của việc D | chỉ khi tổ máy được nối Gợi ý (việc C PA2); phục vụ 32 gói xăng | trung bình: 10 / 12 bảng là dạng chưa có bộ đọc |


## 3. Nhóm 3 — 29 bảng đầu phát / động cơ rời (catalog-c-de-xuat lớp A / E)

Chỉ số bảng của `dem-g.mjs` (main abb28c67) vẫn trỏ đúng 29 bảng trên 389935b3 (tên trang khớp). Cả 29: **0 bản ghi** (đường đọc chỉ ra bản ghi khi dòng có mã tổ máy + mã động cơ / đầu phát, hoặc bảng của hãng động cơ). 798 dòng thô.

- A · **eastern-lion-fuan n154** (b58, 21 dòng, bản ghi 0) — STC Series Brush Alternator | EASTERNLION
  - cột: `| | Model | 50Hz Output (kW) | 50Hz Output (kVA) | 60Hz Output (kW) | 60Hz Output (kVA)`
  - `| STC-8 | 8 | 10 | 9.6 | 12`
  - `| STC-10 | 10 | 12.5 | 12 | 15`
- A · **gordon-power n117** (b17, 28 dòng, bản ghi 0) — ST/STC from China manufacturer - GORDON
  - cột: `| Model | Output | Current | Pole | Frq. | Speed // | kW | kVA | A | Number | Hz | rpm`
  - `| ST-2 | 2 | 2.5 | 8.7 | 4 | 50/60 | 1500/1800`
  - `| ST-3 | 3 | 3.6 | 13 | 4 | 50/60 | 1500/1800`
- A · **jet-power n119** (b16, 49 dòng, bản ghi 0) — Wholesale Brushless Synchronous Alternator Supply | Jet Power
  - cột: `| MODEL | 3-PHASE 50Hz /380V-440V | 3-PHASE 60Hz / 416V-480V | PACKAGE | WEIGHT // | (KVA) | (KW) | (KVA) | (KW) | LXWXH | kg`
  - `| JET164A | 8.1 | 6.5 | 9.6 | 7.7 | 49X45X58 | 86`
  - `| JET164B | 11 | 8.8 | 13 | 10.4 | 49X45X58 | 93`
- A · **keliang-fuan n108** (b4, 25 dòng, bản ghi 0) — Three Phase A.C Synchronous Generator STC series Manufacturer & Factor …
  - cột: `| Model | Output | Installing dimensions | External dimensions // | KW | KVA | A | B | C | D | E | F | G | H | K | a | b | h1 | h | L1 | L2`
  - `| STC-3 | 3 | 3.8 | 216 | 178 | 89 | Ø32 | 80 | 10 | 27 | 132 | 13 | 34 | 250 | 18 | 400 | 480 | 270`
  - `| STC-5 | 5 | 6.3 | 254 | 254 | 108 | Ø38 | B0 | 12 | 33 | 160 | 16 | 50 | 310 | 25 | 450 | 580 | 325`
- A · **keliang-fuan n124** (b6, 19 dòng, bản ghi 0) — Single Phase A.C Synchronous Generator ST series Manufacturer & Factor …
  - cột: `| Model | Output (kW) | Installing Dimensions | External Dimensions // | A | B | C | D | E | F | G | H | K | a | b | h1 | h | L1 | L2 | g`
  - `| ST-2 | 2 | 216 | 178 | 89 | Ø32 | 80 | 10 | 27 | 132 | 12 | 34 | 250 | 18 | 385 | 480 | 270 | 35`
  - `| ST-3 | 3 | 216 | 178 | 89 | Ø32 | 80 | 10 | 27 | 132 | 12 | 34 | 250 | 18 | 385 | 480 | 270 | 35`
- A · **landtop-fuzhou n114** (b2, 9 dòng, bản ghi 0) — Single Phase Brush Alternator - LANDTOP
  - cột: `| Model | Rated Output (KW) | Current (A) | Voltage (V) | Rated Speed (r/min) | Frequency (Hz) | N,W (kg) | G.W (kg) | Size(cm) | 20″ PCS // | Series Connection | Parallel Connection | Series Connection | Parallel Connection`
  - `| ST-2 | 2 | 8.7 | 17.4 | 230V | 115V | 1500/1800 | 50/60 | 43.5 | 51.5 | 51*29*43 | 455`
  - `| ST-3 | 3 | 13 | 26 | 44.5 | 52.5 | 51*29*43 | 455`
- A · **landtop-fuzhou n115** (b3, 11 dòng, bản ghi 0) — Three Phase Brush Alternator - LANDTOP
  - cột: `| Model | Rated Output (KW) | Rated Capacity (Kva) | Rated Current (A) | Rated Speed (r/min) | Rated Voltage (V) | Frequency (Hz) | N,W (kg) | G.W (kg) | Size(cm) | 20″ PCS`
  - `| STC-3 | 3 | 3.8 | 5.4 | 1500/1800 | 400/230 | 50/60 | 45 | 53 | 51*29*43 | 455`
  - `| STC-5 | 5 | 6.3 | 9 | 70 | 80 | 61*34*50 | 279`
- A · **lanzhou-electric n102** (b0, 15 dòng, bản ghi 0) — TZH系列交流同步发电机-兰州电机股份有限公司
  - cột: `| 型号 | 额定容量 KVA | 额定功率 KW | 额定电流 A | 额定转速 r/min | 效率 % | 重量 kg | 最大功率 KW | 型号 | 额定容量 KVA`
  - `| TZH-180S4-TH | 15 | 12 | 21.7 | 1500 | 84.5 | 210 | 8.4`
  - `| 7ZH-180AA4-7H | 20 | 16 | 28.9 | 1500 | 85.3 | 245 | 11.2`
- A · **longkai-power n113** (b3, 112 dòng, bản ghi 0) — Longkai Brushless Alternator from China manufacturer - Longkai
  - cột: `| Model | KW/3PH/50Hz | 1PH/50Hz | Dimension(cm) | Weight(kg) | PDF`
  - `| 380V | 400V | 415V | 230V`
  - `| LK164A | 6.5 | 6.5 | 6.5 | 4.3 | 49*45*58 | 86 |`
- A · **nenjo-generator n101** (b0, 46 dòng, bản ghi 0) — HJI600-1000KW-Jiangsu Nenjo Generator Technology Co., Ltd.
  - cột: `| High base | ModeL | KW | KW // | 机座高 | 型 号 | 三相 Three phase 50H1500RPM400V | 三相 Three phase 60HZ1800RPM440V // | 常用 Prime power 40℃ | 备用 Standby power 27℃ | 常用 Prime power 40℃ | 备用 Standby power 27℃`
  - `| Center height 中心高 160 | HJI-6.5 | 6.5 | 7.1 | 8.2 | －`
  - `| HJI-8.8 | 8.8 | 9.7 | 11 | －`
- A · **nenjo-generator n111** (b6, 46 dòng, bản ghi 0) — HJI1120-2000KW-Jiangsu Nenjo Generator Technology Co., Ltd.
  - cột: `| High base | ModeL | KW | KW // | 机座高 | 型 号 | 三相 Three phase 50H1500RPM400V | 三相 Three phase 60HZ1800RPM440V // | 常用 Prime power 40℃ | 备用 Standby power 27℃ | 常用 Prime power 40℃ | 备用 Standby power 27℃`
  - `| 中心高 160 | HJI-6.5 | 6.5 | 7.1 | 8.2 | －`
  - `| HJI-8.8 | 8.8 | 9.7 | 11 | －`
- A · **shengfeng-fuan n104** (b2, 11 dòng, bản ghi 0) — STC系列单相/三相三次谐波交流同步发电机-福安市晟丰电机有限公司
  - cột: `| 型号 | 额定功率 (kW) | 额定容量 (kVA) | 额定电流 (A) | 功率因数 (cos&Phi;) | 额定转速 (r/min)`
  - `| STC-3 | 3 | 3.8 | 5.4 | 0.8 | 1500`
  - `| STC-5 | 5 | 6.3 | 9`
- A · **shengfeng-fuan n106** (b4, 35 dòng, bản ghi 0) — TFW2系列无刷三相交流同步发电机-福安市晟丰电机有限公司
  - cột: `| 型号 | 额定功率 (KW) | 额定功率 (KVA) | 频率 (HZ) | 电压 (v)`
  - `| TFW2-10 | 10 | 12.5 | 50/60 | 400V`
  - `| TFW2-12 | 12 | 15 | 50/60 | 400V`
- A · **shengfeng-fuan n111** (b7, 35 dòng, bản ghi 0) — TFW2 Series Brushless Three-phase A.C.Sychronous Generators-Fuan sheng …
  - cột: `| Model | Rated Power (KW) | Rated Capacity (KVA) | Fre. (HZ) | Voltage (v)`
  - `| TFW2-10 | 10 | 12.5 | 50/60 | 400V`
  - `| TFW2-12 | 12 | 15 | 50/60 | 400V`
- A · **xinhengxin-fujian n108** (b7, 42 dòng, bản ghi 0) — Brushless Alternator - Buy Power Generator Product on Fujian Xinhengxi …
  - cột: `| MODEL | Rate Power （KW） | Rate Capacity （KW） | Fre. (Hz) | Voltage (V)`
  - `| XHX-6.5 | 6.5 | 7.8 | 50/60 | 400V`
  - `| XHX-7.5 | 7.5 | 9.4 | 50/60 | 400V`
- A · **xinhengxin-fujian n110** (b9, 8 dòng, bản ghi 0) — Brush Alternator ST - Buy Power Generator Product on Fujian Xinhengxin …
  - cột: `| Model | Output | Current(A) | Voltage(V) | Rated P.F | No.of poles | Speed(r.p.m) | Volt.regulation // | (kW) | Series | Parallel | Series | Parallel | (CosΦ) | 50HZ | 60HZ | (%)`
  - `| ST-2 | 2 | 8.7 | 17.4 | 230 | 115 | 1.0 | 4 | 1500 | 1800 | ±5`
  - `| ST-3 | 3 | 13 | 26 | 4 | 1500 | 1800`
- A · **xinhengxin-fujian n118** (b17, 10 dòng, bản ghi 0) — Stc- Buy STC Brush Alternator on Fujian Xinhengxin Motor Co.,ltd.
  - cột: `| Model | Prime | Voltage | Current | No.of pole | Speed | Volt.regulation // | (kW) | (kVA) | (V) | (A) | (r.p.m) | (%)`
  - `| STC-3 | 3 | 3.8 | 230/400 | 5.4 | 4 | 1500 | ±5`
  - `| STC-5 | 5 | 6.3 | 9 | 4 | 1500`
- A · **yihua-fujian n105** (b4, 13 dòng, bản ghi 0) — TFW2 Series Compound Excitation A. C. Synchronous Alternator Generator
  - cột: `| Model | Rated Power (KW/KVA) | Rated Volt(V) | Rated Curr. (A) | Rated Speed (r/min) | Frequency (Hz) | Max.directly-starting Motor (kW)`
  - `| TFX-10 | 10/12.5 | 400 | 18.1 | 1500 | 50 | 7`
  - `| TFX-12 | 12/15 | 400 | 21.6 | 1500 | 50 | 8.4`
- A · **yingtai-jiangsu n115** (b27, 19 dòng, bản ghi 0) — ST/STC 有刷发电机-英泰集团有限公司
  - cột: `| 型号 | 容量KVA | 功率KW | 电压V | 电流A | 相数 | 频率HZ | 防护等级IP | 绝缘等级 | 调压率%`
  - `| STC5 | 6.25 | 5 | 400 | 9 | 3 | 50 | 21 | B | 5`
  - `| STC7.5 | 9.375 | 7.5 | 400 | 13.5 | 3 | 50 | 21 | B | 5`
- A · **yingtai-jiangsu n116** (b28, 45 dòng, bản ghi 0) — YTW 无刷发电机-英泰集团有限公司
  - cột: `| 型号 | 容量KVA | 功率KW | 电压V | 电流A | 相数 | 频率HZ | 防护等级IP | 绝缘等级 | 调压率%`
  - `| YTW6.5 | 8.125 | 6.5 | 400 | 11.7 | 3 | 50 | 21 | H | 1`
  - `| YTW9 | 11.25 | 9 | 400 | 16.2 | 3 | 50 | 21 | H | 1`
- E · **kangjin-power n101** (b0, 4 dòng, bản ghi 0) — 6CTA8.3 Diesel Engine | Offer OEM/ODM Customization Services - Kangjin …
  - cột: `| | Model | Rated Power (kW@rpm) | Max Torque (N·m@rpm)`
  - `| 6CTA8.3-C190-II | 142 @ 2200 | 860 @ 1400`
  - `| 6CTA8.3-C215-II | 160 @ 2200 | 908 @ 1500`
- E · **kangjin-power n102** (b1, 6 dòng, bản ghi 0) — QSB6.7 Diesel Engine | Offer OEM/ODM Customization Services - Kangjin  …
  - cột: `| | Model | Rated Power (kW@rpm) | Max Torque (N·m@rpm)`
  - `| QSB6.7-C130-30 | 99 @ 2200 | 580 @ 1400`
  - `| QSB6.7-C155-30 | 116 @ 2000 | 622 @ 1500`
- E · **penlucky n116** (b7, 3 dòng, bản ghi 0) — 4BT3.9-GM Marine Generator Engine（47-65KW) | SHANDONG PENLUCKY POWER E …
  - cột: `| Model | Rated power output (kW@RPM) | Peak torque (N.m@RPM) | Cylinders | Displacement (L) | Aspiration`
  - `| 4BT3.9-GM47 | 47@1500 | 52@1500 | 4 | 3.9 | charged, inter-cooled`
  - `| 4BT3.9-GM55 | 55@1500 | 61@1500 | 4 | 3.9 | charged, inter-cooled`
- E · **penlucky n119** (b8, 8 dòng, bản ghi 0) — Cummins 6BT5.9-GM Series Marine Generator Engine(80-115KW) | SHANDONG  …
  - cột: `| Model | Rated power output (kW@RPM) | Peak torque (N.m@RPM) | Cylinders | Displacement (L) | Aspiration`
  - `| 6BT5.9-GM80 | 80@1500 | 88@1500 | 6 | 5.9 | charged`
  - `| 6BT5.9-GM83 | 83@1500 | 92@1500 | 6 | 5.9 | charged`
- E · **penlucky n120** (b9, 4 dòng, bản ghi 0) — Cummins 6CTA8.3-GM Series Genuine Marine Auxiliary Engine(115-175KW) | …
  - cột: `| Model | Rated power output (kW@RPM) | Peak torque (N.m@RPM) | Cylinders | Displacement (L) | Aspiration`
  - `| 6CT8.3-GM115 | 115@1500 | 126@1500 | 6 | 8.3 | Ordinary charged`
  - `| 6CT8.3-GM129 | 129@1800 | 142@1800 | 6 | 8.3 | Ordinary charged`
- E · **rise-power n131** (b34, 20 dòng, bản ghi 0) — SDEC Diesel Engine | Diesel Engine | RISE Power
  - cột: `| Model | Standby Power(kW) | Cylinders | Displacement (L) | Fuel Consumption(L/h) | Oil Consumption(g/kWh) | Lube Capacity(L) | Coolant Capacity(L) | Dimensions // | L*W*H(mm) | Weight (kg)`
  - `| SC4H95D2 | 68 | 4L | 4.3 | < 14.8 | ≦0.3 | 15 | 6.8 | 1053*717*1158 | 430`
  - `| SC4H115D2 | 86 | 4L | 4.3 | < 18.7 | ≦0.3 | 15 | 6.8 | 1053*717*1158 | 430`
- E · **yingtai-jiangsu n101** (b1, 57 dòng, bản ghi 0) — 英泰/原装进口康明斯柴油发电机组, 英泰/原装进口康明斯柴油发电机组 供应 - 英泰集团有限公司
  - cột: `| 品 牌 Br and | 发 动 机 型 号 En g ine Ty pe | 功 率 (主用) Power (KW) | 功率 (备用) Po wer (KW) | 缸 数 No Of Cylin ders | 缸径 *行程 Bore /Strokse (MM) | 排 气 量 Exha ust Csp acity (L) | 压 缩 比 Com pression Ratio | 机 油 容 量 Lubri cating Cap acity (L)  …`
  - `| 进口 康明斯 Import Cummins | X2.5G2 | 24.4 | 27 | 3 | 91.4X127 | 2.5 | 18.5:1 | 6.5 | 204 | 6 | 机械 | 15 | N/A`
  - `| X3.3G1 | 32 | 36 | 4 | 91.4X127 | 3.3 | 18.5:1 | 6.5 | 226 | 8.5 | 机械 | 16 | N/A`
- E · **yingtai-jiangsu n2003** (b34, 56 dòng, bản ghi 0) — Yingtai / Imported Cummins
  - cột: `| 品 牌 Br and | 发 动 机 型 号 En g ine Ty pe | 功 率 (主用) Power (KW) | 功率 (备用) Po wer (KW) | 缸 数 No Of Cylin ders | 缸径 *行程 Bore /Strokse (MM) | 排 气 量 Exha ust Csp acity (L) | 压 缩 比 Com pression Ratio | 机 油 容 量 Lubri cating Cap acity (L)  …`
  - `| 进口 康明斯 Import Cummins | X2.5G2 | 24.4 | 27 | 3 | 91.4X127 | 2.5 | 18.5:1 | 6.5 | 204 | 6 | 机械 | 15 | N/A`
  - `| X3.3G1 | 32 | 36 | 4 | 91.4X127 | 3.3 | 18.5:1 | 6.5 | 226 | 8.5 | 机械 | 16 | N/A`
- E · **zhengdian-zhengzhou n103** (b2, 41 dòng, bản ghi 0) — 常柴发电机组|常柴发电机|常柴柴油发电机组|常柴柴油发电机---郑州郑电发电机有限公司专业生产柴油发电机组
  - cột: `| 产品型号 | 规格 | 功率 KW | 转速 r/min`
  - `| ZS195 | 单机（世纪型） | 8.8 | 2000`
  - `| ZS195 | 单机（常柴豹） | 8.8 | 2000`

### 3.1 Đếm khoá (CAT.keyOf thật, so với mọi bản ghi động cơ / đầu phát của main)
- **A (20 bảng, 599 dòng, 514 model):** 149 model đã có khoá đầu phát trong catalog; 62 trong đó do NCC KHÁC ghi. Trùng là dòng "STC-5…STC-30" / "ST-2…" (tên dòng đầu phát chổi than dùng chung ở nhiều xưởng: eastern-lion, gordon, keliang, landtop, shengfeng, xinhengxin, yingtai), còn "JET164…" (47) và "LK184…" (40) là khoá do chính jet-power / longkai ghi ở bảng tổ máy. 365 model chưa có khoá (dòng: nenjo HJI 2 bảng 92, shengfeng TFW2 2 bảng 70, yingtai YTW 45, xinhengxin XHX 42, lanzhou TZH 15…; nenjo / shengfeng là cùng bảng hai lần).
- **E (9 bảng, 199 dòng, 196 model):** 134 model đã có khoá động cơ (do NCC khác ghi, 3.416 lượt dùng không tính trùng n101 / n2003). Catalog CHƯA có cho các khoá đó: yingtai Cummins (52 khoá, 2.058 lượt dùng) thiếu dung tích ở 10 khoá, số xi lanh 5, đường kính × hành trình 12; rise SDEC 20 khoá đã đủ mọi loại; penlucky tàu thuỷ 9 khoá thiếu đường kính 4; zhengdian ZS195 thiếu cả ba. Model mới: kangjin 10 (động cơ công trình 2.200 vòng/phút), penlucky n116 3, zhengdian (ô đầu lặp "ZS195 | 单机（世纪型）": 39 "model" thực ra là biến thể chữ Hán).

### 3.2 Phương án
| | làm gì | bản ghi | Gợi ý cấu hình | rủi ro |
|---|---|---|---|---|
| **A** | để nguyên | 0 | 0 | không (thiếu, không sai) |
| B | danh sách tường minh (như `GENSET_TABLES`) cho cả 29: đầu phát rời (công suất 50 / 60 Hz riêng của đầu phát) + động cơ rời (công suất động cơ, xi lanh, dung tích…) | ≈ +599 dòng đầu phát (514 model), +199 dòng động cơ (196 model) | có: (i) đầu phát: `altKva` / `check` công suất đầu phát cho cấu hình jet (47 khoá), longkai (40) và mọi cấu hình dùng "STC-…" của 6 NCC; (ii) động cơ: bản ghi bảng động cơ không công suất tổ máy nên KHÔNG thành ứng viên, nhưng thông số gộp theo khoá đổi: +8 điểm / loại thông số mới, phiếu số đông dung tích / xi lanh (`dispVoters`, `cylMaj`) và luật dung tích / xi lanh tối thiểu cho các dòng dùng 134 khoá. Phải đo top 30 | CAO: STC / ST gộp đầu phát khác xưởng vào một khoá; kangjin (máy công trình, 2.200 vòng/phút) và penlucky (máy tàu) đưa công suất / thông số không phải phát điện vào khoá chung; zhengdian ô model chữ Hán |
| **C (khuyến nghị)** | chỉ yingtai n101 + n2003 (cùng dữ liệu Trung / Anh, cột "品牌 Brand / 发动机型号 Engine Type / 功率(主用) / 功率(备用) / 缸数 / 缸径*行程 / 排气量…") làm nguồn thông số ĐỘNG CƠ, không công suất tổ máy | ≈ 57 dòng / 56 model (52 khoá đã có) | có: thêm dung tích cho 10 khoá Cummins, xi lanh 5, đường kính 12 → đổi điểm / luật dung tích của các dòng dùng 52 khoá (2.058 lượt dùng). Phải đo top 30 cloud, soát mọi lượt đổi | trung bình: bảng yingtai từng lệch cột (tiêu đề hai tầng ở catalog-c); phải soát từng số với dòng nguồn (và so với số NCC khác cho cùng khoá trước khi nhận) |

Ghi chú: phần đầu phát (A) chỉ có ích khi `check` / `altKva` cần công suất đầu phát; hiện không có yêu cầu nào chờ nó → để sau.


## 4. Nhóm 4 — huatai n111

- **huatai-yangzhou n111** (b10, 17 dòng, bản ghi engine 17) — 无锡动力系列柴油发电机组-扬州华泰电气有限公司
  - cột: `| 组型号Type of set | 输出功率 Power of output (KW/KVA) | 额定电流Rated current (A) | 柴油机参数 Parameters of set | 机组尺寸及重量 Size and weight of machine set // | 型号 Type | 额定功率 power (KW) | 缸数及类型Numbers& Type of cylinder | 燃油消耗 (g/kw.h)Consumption of fuel(g/kw.h) | 机油容量 Oil ca …`
  - `| 200GF | 135/320 | 362 | WD129TAD23 | 259 | 6缸直列 | 198 | 24 | 2700×900×1400 | 1900`
  - `| 250GF | 138/150 | 452.5 | WD135TAD28 | 308 | 6缸直列 | 198 | 24 | 2700×900×1400 | 2000`

Tiêu đề cột đầy đủ (hai tầng): tầng 1 `| 组型号Type of set | 输出功率 Power of output (KW/KVA) | 额定电流Rated current (A) | 柴油机参数 Parameters of set | 机组尺寸及重量 Size and weight of machine set`; tầng 2 `| 型号 Type | 额定功率 power (KW) | 缸数及类型Numbers& Type of cylinder | 燃油消耗 (g/kw.h)Consumption of fuel(g/kw.h) | 机油容量 Oil capacity (L) | 长×宽×高 Length Width Height (MM) | 净重 Net Weight (kg)` (tầng 2 nằm dưới ô "柴油机参数" và "机组尺寸及重量").

**Mã đọc ra (17 / 17 dòng):** bản ghi động cơ WD129TAD23 … WD327TAD92, `power` RỖNG ở cả 17 (cột "输出功率 (KW/KVA)" ghi "135/320", "138/150", "140/165", "145/165" là đường kính / hành trình: 14 dòng không qua cặp kW/kVA, 3 dòng 700/800/850GF là ngoại lệ `nopower` Khoa 19/11), thông số `current` (362…1810), `weight`, `fuel` (198 / 196). KHÔNG đọc: "额定功率 power (KW)" = 259, 308, 340, 373, 388, 420, 460, 512, 530, 556, 618, 680, 750, 858, 902, 970, 1012 (nhãn không khớp mẫu `engPower` "(engine|gross).*(power|output)"; nới mẫu cho "额定功率" thì sai: 134 ô tiêu đề / 121 bảng trong cn dùng "额定功率" cho công suất TỔ MÁY), "6缸直列" / "12缸V型" (xi lanh), dầu bôi trơn, kích thước.

**Nguồn nói gì:** công suất động cơ = cột "额定功率" dưới "柴油机参数" (rõ). Công suất tổ máy: KHÔNG có cột đúng; tên "200GF … 1000GF". Kiểm chéo (không phải nguồn ghi): (i) 167 / 167 dòng "NNNGF" ở 11 bảng khác của huatai có kW đọc được = đúng số trong tên; (ii) dòng điện của bảng = kW tên ở 400 V, cosφ 0,8 (200GF: 362 A ↔ 200,6 kW … 1000GF: 1.810 A ↔ 1.003 kW, lệch ≤ 0,4%); (iii) công suất động cơ / số trong tên = 1,01–1,29.

**Gợi ý hôm nay:** 17 dòng không công suất → `near` loại → 0 lần trong `all` của mọi lượt (khoá huatai "WD…" duy nhất trong `all` là WD10D153E10 của bảng khác, 1 lần, 0 top). 17 khoá động cơ đều có ở 4–9 NCC khác (133 bản ghi), KHÔNG khoá nào có `engPower`.

| | làm gì | bản ghi | Gợi ý | rủi ro |
|---|---|---|---|---|
| A | để nguyên | 0 | 0 | thiếu công suất động cơ (đúng "thà thiếu") |
| **B (khuyến nghị)** | ngoại lệ CHỈ bảng này (khoá huatai + n111 + tiêu đề nguyên văn): ô "额定功率 power (KW)" thành `engPower` (và có thể "缸数及类型" → `cyl` 6L / 12V) | 17 bản ghi đổi: +`engPower` (+`cyl` nếu chọn) | dự kiến 0: `engPower` thuộc `ROW_ONLY` (không gộp theo khoá), chỉ thành sự kiện "engPrime/engStandby" khi nhãn ghi mức + công suất tổ máy của dòng có (`ratedFacts`); dòng không công suất nên không thành ứng viên. `cyl` THÌ gộp theo khoá (17 khoá đã có xi lanh ở 2–10 bản ghi khác) → phiếu số đông thêm 1: phải đo | thấp |
| C | B + công suất tổ máy = số trong tên "NNNGF" (mức: không ghi → `rated` / chưa rõ mức) | 17 bản ghi có công suất | CÓ: 17 dòng Wudong 200–1.000 kW thành ứng viên ở các gói cùng dải. Phải đo top 30 | trái quy tắc trong code ("only to keep a current, never as the set's power") và "không suy ra": số là suy từ tên + kiểm chéo, nguồn không ghi. Chỉ làm nếu Khoa duyệt rõ |


## 5. Đụng PR đang mở (`web/catalog.js`, so vùng sửa của từng PR với main)

Vùng của PR (dòng trên nền của PR): **#954** catalog-b3: `subline` (~490), `addMake` (~1162), tiêu đề cột tổ máy (~1250), làm sạch ô (~1263), chọn `gi` trong khối chọn động cơ / đầu phát của dòng (~1283), thêm `TABLE_DROPS` / `MAKE_LEVEL_LOW` / `DASH_FIX` ngay sau `ROW_EXCEPTIONS` (~1350). **#957** dropspec: mục `dropspec` trong `ROW_EXCEPTIONS` (~1383). **#958** fuel: `PRIME` (~79), `titledPowers` (~297, 719), `gasTable` / bộ phát hiện nhiên liệu (~834–946), `fromSupplier` đầu bảng (~1149), gắn `fuel` (~1449), `builder` gộp (~1419), `api` (~2232). **#959** việc C: `GENSET_TABLES` + `gensetsOf` (~1773–1940), `builder` / `unread` (~1946–2070), `api`. **#963** chỉ `suppliers/config-bot.mjs` (`fuelOfHsmt`, `fuelOff`, `candidates`, `check`).

| phương án | chỗ sửa | đụng |
|---|---|---|
| 1A (`ALT_CODE`) | dòng 44 (hằng số) | không PR nào sửa dòng 44 (#958 gần nhất ở ~79). NHƯNG hành vi đi qua khối chọn động cơ / đầu phát mà #954 sửa (`gi`, ~1283) → đo lại sau khi #954 merge |
| 1B (danh sách bảng) | cạnh `ROW_EXCEPTIONS` / sau `rowExceptions` | #954 (TABLE_DROPS ngay đó), #957 (dropspec) — dễ xung đột văn bản |
| 2 (n156, bảng hãng đầu phát) | cạnh nhánh "engine maker's own table" (~1238) | #954 (~1250, 1263) sát bên |
| 3 / 2a-B (jianghao, kingway `fuel`) | bộ nhiên liệu của #958 (danh sách ngoại lệ cấp bảng) | **#958** (phải xếp chồng lên #958 hoặc làm sau merge); dùng ở Gợi ý qua **#963** |
| 4B / 2a-C (simpson loại khỏi gói diesel) | cờ mới ở catalog (#958) + luật ở `candidates` | **#958** + **#963** |
| 5B (nhiên liệu theo bảng cho 164) | danh sách nhiên liệu của #958 | **#958**; 7 bảng cũng là bảng của **#959** |
| 5C (12 bảng xăng) | `GENSET_TABLES` | **#959** (zc n109 b11 / b12 đã ở đó) + **#958** (`fuel`) |
| 6B / 6C (bảng động cơ / đầu phát rời) | danh sách mới kiểu `GENSET_TABLES`, `builder` | **#959** (cùng `builder`, `unread`) |
| 7B / 7C (huatai) | `ROW_EXCEPTIONS` (mục huatai đã có ở ~1364) hoặc danh sách cột theo bảng | #954 (~1350, sửa dòng `return mergeRepeats(...)` ngay trên), #957 (~1383, cùng mảng) |

Thứ tự đề xuất: chờ #954, #957, #958, #959 merge rồi mới mở PR cho 1A / 3 / 7B (mỗi việc một PR nhỏ, đo spec-diff + top 30 cloud như thường lệ).

## 6. Rủi ro còn lại / chưa kiểm
- Số bản ghi của các phương án là ƯỚC TÍNH theo dòng (chưa có code); số thật đo bằng `spec-diff` + `do-gop.mjs` khi làm.
- Top 30 dùng lượt cloud 79e9b175 (main hiện tại không đổi cn / catalog / config-bot từ đó), CHƯA tính #954 / #957 / #958 / #959 / #963.
- Không kiểm trang sống của 164 bảng nhóm 2b từng bảng (phân lớp theo chữ đã lưu + URL); không kiểm trang sống jianghao / kingway (dùng tệp nguồn đã lưu 13–14/11).
- Hãng của "RUIFEN6120": không rõ (nguồn không ghi).
- simpson: nhiên liệu không rõ; đánh giá theo động cơ (GX…) cần nguồn của hãng động cơ, chưa tìm.

## 7. Tệp
`genbid-work\dieu-phoi\dau-vao\nhom-con-lai\`: `bang-day-du.tsv` (254 bảng của bốn nhóm: nhóm, lớp, NCC, n, chỉ số bảng, số dòng, bản ghi hiện tại, tên trang, tiêu đề cột NGUYÊN VĂN, dòng 1, dòng 2), `g2b.tsv` (164 bảng + dấu hiệu nhiên liệu + URL), script `do-all.mjs <repo> all.json` (chạy `fromSupplier` thật, ~100 s, `all.json` 28 MB không lưu), `g1.mjs`, `g2b.mjs`, `g3.mjs`, `g3b.mjs`, `g3c.mjs`, `phu-luc.mjs`. Đếm top 30 bằng lệnh node một dòng trên `dau-vao\catalog-c\top30-cloud\gop-goc.json.gz` (khoá `NCC|động cơ|đầu phát||…`).

## Cần ghi nhớ
- eastern-lion: EL / ELS = đầu phát của chính NCC; RUIFEN6120 = bộ điều khiển (trang sống 20/11). 26 bản ghi động cơ "EL…" và 4 bản ghi đầu phát "RUIFEN6120" đang sai vai (0 lần top).
- jianghao n104 có câu nguồn ghi khí (chờ Khoa câu 3); simpson n124 không nguồn nào ghi nhiên liệu.
- huatai n111: không khoá nào trong 17 có `engPower`; "额定功率" ở 121 bảng là công suất tổ máy → không nới mẫu chung.
- Chờ Khoa 7 câu ở đầu tệp.
