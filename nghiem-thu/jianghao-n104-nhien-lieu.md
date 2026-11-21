**Kết luận: main (41fc98e3) ĐÃ ghi jianghao n104 = khí (29 bản ghi, mức T) từ PR #982 (Khoa 20/11) — chính #982 làm số lần dòng JHRQ trong `all` rơi 813 → 7 (28 khoá → 7 khoá; 453 lượt → 3 lượt; top 2 → 0), đúng luật thiết kế, không phải lỗi. Nguồn tiếng Trung của chính NCC nói khí 3 lần (tiêu đề, mục "燃料分类", chú thích 1) nhưng cột động cơ của chính bảng khí đó đề "柴油机型号"; KHÔNG có nguồn nào (hãng hay NCC) nói riêng JHRQ là diesel hay có bộ đánh lửa / trộn khí; hãng: Cummins bản khí mang tên khác (GTA855, G5.9, QSK19G…), Weichai bản khí WP10NG ≠ "P10" của NCC. Lựa chọn cho Khoa: K = giữ khí (hiện trạng) · R = bỏ mục jianghao khỏi `FUEL_PAGES` (để trống, 29 bản ghi quay lại gói diesel). Câu 4: 351 bảng / 65 NCC (6.859 bản ghi) có chữ khí cạnh bảng mà bản ghi `fuel` rỗng; ~20 bảng có chữ khí ngay ở tiêu đề / tên trang sản phẩm, trong đó 13 bảng (382 bản ghi `gensetsOf`) vì luật hiện tại không đọc nhiên liệu cho tổ máy.**

# Điều tra thêm jianghao-genset n104 (Khoa 21/11/2026)

Chỉ đọc: không sửa mã, không ghi web, không PR. Không lặp lại phần đã có ở `nhien-lieu-4-bang.md` mục 1 (trang NCC tiếng Anh, chú thích ①, bảng Cummins). Trích ≤ 15 từ. Đã mở tận nơi (`maxAge 0`, 21/11/2026) các trang ghi "(mở)"; dòng "(tìm kiếm)" chỉ là đoạn trích công cụ tìm kiếm.

## (1) JHRQ là máy khí hay diesel? — theo nguồn

**Trang tiếng Trung của chính NCC** (mở): `https://www.jsjhpower.com/Fuel/184.html`, tên trang "燃气发电机组-江苏江豪发电机组有限公司", nằm ở "产品中心 > 燃料分类" (mục cha "燃料分类" liệt kê "燃气发电機组" và, ở dòng "上一篇", "汽油发电机组" `Fuel/100.html`; diesel nằm ở "品牌分类"). Trang tiếng Anh `jhgensets.com/Products_detail/32.html` là bản dịch cùng trang (mở lại 21/11, cùng nội dung bản lưu).

| ý | chữ nguyên văn (tiếng Trung) | ghi chú |
|---|---|---|
| mô tả | "以液化气、天然气等可燃气体为燃烧物，代替汽油、柴油作为发动机动力" | khí hoá lỏng / khí tự nhiên; bản EN trùng |
| nhiên liệu khác | "诸如：瓦斯气，秸秆气，沼气等" | |
| chú thích 1 | "以上机组可采用天燃气、石油伴生气，沼气，秸秆气，煤气等气体作为燃料" | "可采用" = CÓ THỂ dùng; liệt kê 5 loại khí, KHÔNG ghi diesel |
| tiêu đề bảng | "燃气发电机组：" và "康明斯燃气发电机组" | |
| tiêu đề cột động cơ | "柴油机型号" (cả hai bảng) | TỰ ghi "động cơ DIESEL" ở cột; bản EN dịch thành "Engine model" |
| cột "FuelCon. (L)" bản EN | tiếng Trung là "排气量(L)" = dung tích xi lanh | KHÔNG phải tiêu hao nhiên liệu (4B: 3,9 L = 102×120×4); bảng không có cột tiêu hao (g/kWh hay m³/h) — khác bảng diesel cùng NCC có cột "Dis. g/kw.h" ≈ 200 |
| đoạn lập luận | "燃气轮机处于高速旋转状态…低频噪声优于柴油发电机组" | dùng "燃气轮机" (tuabin khí) cho cả mẫu; mâu thuẫn kỹ thuật, không dùng làm bằng chứng |

Không có chữ về bộ trộn khí, đánh lửa (点火), tỉ số nén, hay đơn vị m³ trong trang / bảng. Không tìm được catalogue PDF hay trang chi tiết riêng từng model JHRQ (trang liệt kê chỉ có hai bảng gộp, không có link "Click"/chi tiết cho JHRQ). Truy vấn đã thử: "江苏江豪发电机 燃气发电机组 JHRQ"; "JHRQ-300 gas generator set Jianghao catalogue pdf 江豪 燃气发电机组 样本 JHRQ"; `jsjhpower.com/Fuel/` (mở, chỉ một mục "燃气发电机组"). Kết quả tìm kiếm còn ghi hồ sơ công ty "high quality Diesel and Gas Generator set" (tìm kiếm, chưa mở) — chỉ nói công ty làm cả hai.

**So công suất cùng động cơ, bảng khí (JHRQ, 104.md) ↔ bảng diesel của chính jianghao (JHK-…GF, `sources/jianghao-genset/111.md`, hai bảng "Dongfeng/Chongqing Cummins")** — kW tổ máy:

| động cơ | khí JHRQ | diesel JHK (bảng 1 / bảng 2 của 111.md) |
|---|---|---|
| 4B / 4BT3.9 | 30, 40 (4B) | 4B3.9-G2: 15, 20 · 4BT3.9-G2: 24, 30 / 30, 40 (bảng 2) |
| 6B / 6BT5.9 | 50 (6B); 60, 80, 90 (6BT) | 6BT5.9-G2: 80 / 100; 6BTA5.9-G2: 100 / 120 |
| 6CT / 6CTA8.3 | 100, 120, 130 | 6CTA8.3-G2: 150 / 170; 6CTAA8.3-G2: 180 / 190 |
| 6LT / 6LTAA8.9 | 150, 160 (6LT); 180 (6LT8.9) | 6LTAA8.9-G2: 200 / 220; G3: 220 / 250 |
| NT855 | 200, 220, 250, 280 | NT855-GA: 200 / 220; NTA855-G1A…G2A: 250–300 |
| KT19 / KTA19 | 300, 350, 400, 440 | KTA19-G3A…G8: 400–500 |
| KT38 | 500, 600, 700, 750 | KT38-GA: 600; KTA38-G2…G9: 650–1000 (bảng 2: KT38-G 660) |
| KT50 | 800, 980, 1100 | KTA50-G3 / G8: 1100, 1200 (bảng 2: 1200, 1500) |

Đọc số (không kết luận thay Khoa): phần lớn công suất khí THẤP hơn diesel cùng động cơ (6CT 100–130 vs 150–190; KT19 300–440 vs 400–500; KT50 800–1100 vs 1100–1500), nhưng có 2 trường hợp BẰNG diesel: NT855 200 kW (JHRQ-200 = JHK-200GF NT855-GA) và KT38 600 kW (JHRQ-600 = JHK-600GF KT38-GA); 4B 30 kW (khí) = 4BT3.9-G2 30 kW (diesel). Hàng JHRQ-200 còn có "dòng điện 312,5 A" ứng 250 kVA và bore×stroke "125*147" cạnh dung tích "14 L" (125×147×6 ≈ 11 L): dấu hiệu bảng sao từ mẫu khác, độ tin cậy của số thấp.

## (2) Động cơ: hãng có bản KHÍ trùng tên NCC ghi không?

Trang hãng đã mở 21/11:
- **Cummins NT855**: PDF `https://www.cummins.com/sites/default/files/2019-05/NT855G6.pdf` — "NT855-G6 … 14 litre, six-cylinder NTA855"; hệ nhiên liệu "Cummins PT", bảng tiêu hao "L/ph" (lít), không ghi diesel bằng chữ → diesel suy từ PT + L/h, chưa phải chữ nguyên văn. Bản KHÍ cùng cỡ 14 L mang tên khác: "GTA855 Gas Series … 14 liter spark ignited" (`cummins.com/en-na/g-drive-engines/products/gta855-gas-series`, mở) — tổ máy C230N6 ghi 180 kW propane / 230 kW khí tự nhiên 60 Hz (PDF `…/2018-09/C230N6_A042J415.pdf`, mở); JHRQ NT855 ghi 200–280 kW (50 Hz, kW tổ máy).
- **Cummins KT38**: PDF `…/2019-05/kta38g3_3.pdf` (mở): "KTA38 … most robust and cost-effective diesel engine" (tên hãng KTA38-G3). **KT50**: `…/2023-07/KTA50-G3.PDF` (mở): "KTA50-Series … diesel engine". Hai tên NCC (KT38, KT50) bỏ chữ A; bản khí không tìm thấy dưới tên KT38 / KT50.
- **Cummins 4B / 6B / 6BT / 6CT / 6LT / KT19**: 4BT3.9, 6CTAA8.3, KTA19 đã mở ở phiên trước (diesel); `…/generators/products/6bt59` (tìm kiếm): "industrial diesel". Bản khí cùng lớp dung tích mang tên G5.9 / QSJ5.9G (`…/g-drive-engines/products/g59-stoichiometric-gas-series`, `…/generators/products/qsj59g`) và QSK19G / HSK78G (tìm kiếm). Không tên nào trùng "4B / 6B / 6BT / 6LT / KT19 / KT38 / KT50".
- **Weichai** (mở): `weichaipower.com/…/gas/2026090122030167356/` — bản khí là "WP10NG … 天然气", model WP10D200E300NG, 126×130 mm, 9,73 L, 155–216 kW động cơ → tổ máy 120–180 kWe. NCC ghi "Weichai Steyr P10 / P12" với 126*155 mm và 11,6 L (cỡ WP12, không phải 9,73 L của WP10NG) → KHÔNG trùng bản khí của hãng.
- **Chaochai (Dongfeng Chaoyang)**: trang hãng cũ `dfmc.com.cn/zt/35/35/century_dfgd_6.html` (mở) chỉ nói "朝阳牌柴油机" họ 102 (4102…) và rằng động cơ CNG là của "东风南充" — không nói riêng CY4102 khí. Bản CNG "CY4102-N3B" chỉ thấy ở trang bán lại (không dùng).
- **Huafeng**: phiên trước đã mở `en.powerhf.com/pro/gas/0614/20.html`: dòng khí là PHF… không có HF6105Q / ZQ.
- **SDEC**: SC9DT210D2 / SC13GT260D2 không tìm được trang hãng; NCC jianghao ghi cho cùng nhà sản xuất ở bảng DIESEL (105.md): SC9D310D2, SC9D340D2, SC13G355D2, SC13G420D2 (chữ "G" trong SC13G… ở đây là mã tổ máy diesel). "SC13GT260D2" khác SC13G…D2 một chữ "T".
Truy vấn: "Cummins natural gas generator engine B5.9G C8.3G L9G GTA855 QSK19G QSK38G…", "Cummins QSK19G natural gas engine OR QSK38G OR QSK50G", "Cummins B5.9G natural gas engine 6BT5.9 gas version…", "潍柴 WP10 WP12 天然气发动机…", "上柴 SC9DT210D2 SC13GT260D2 …", "朝柴 CY4102 燃气 天然气 发动机 华丰 HF6105Q …".
Chưa mở: Cummins 6LT / 6LT8.9 (không tên khớp), QSK19G / QSK38G / QSK50G (chỉ đoạn trích tìm kiếm).

**Đọc kết quả**: bản khí chính hãng có tồn tại ở các lớp 5,9 / 14 / 19 L nhưng dưới tên khác với tên NCC ghi; không có bản khí hãng tên KT38 / KT50 / 6BT / 6LT. NCC có thể bán bộ chuyển khí trên động cơ diesel, hoặc ghi sai tên: nguồn không phân định. **Không rõ.**

## (3) Vì sao số lần dòng JHRQ trong `all` rơi 813 → 7

**Do PR #982** (`63eaca25`, "catalog: nhiên liệu theo bảng (jianghao n104 khí…)", 20/11/2026 15:25 +0700), nằm giữa hai mốc: 79e9b175 (trước) và 95ecba26 (sau). #982 thêm `{ supplierId: "jianghao-genset", ns: [104], fuel: "gas" … }` vào `FUEL_PAGES` (`web/catalog.js`): 29 bản ghi `fuel = gas`, `fuelFrom = T`, lý do là chú thích ①. Đã kiểm: `git log 79e9b175..95ecba26 -- web/catalog.js suppliers/config-bot.mjs` = 26 commit (#982 là một); dữ liệu NCC `suppliers/cn/jianghao-genset.json` và `suppliers/sources/jianghao-genset` KHÔNG đổi giữa hai mốc (git log rỗng); chữ "jianghao" trong `web/catalog.js` hiện chỉ ở mục `FUEL_PAGES` (và chú thích). Gốc của tệp đo `doosan-hau-to` (97cce88c) đã chứa #982, gốc của `may-khi` (79e9b175) chưa (`git merge-base --is-ancestor`). Tôi KHÔNG đọc từng diff của 25 commit còn lại; kết luận "do #982" dựa trên: dữ liệu NCC không đổi + mục `FUEL_PAGES` là nơi duy nhất nhắc jianghao + hai tệp khác nhau đúng ở 28 khoá JHRQ. Cơ chế ở `suppliers/config-bot.mjs`: `fuelOfHsmt` trả "diesel" khi HSMT không nêu nhiên liệu; `fuelOff(want, useFuel)` loại bản ghi có `fuel = gas` khỏi gợi ý của HSMT diesel.

So khoá dòng hai tệp `gop-nhanh.json.gz` (đo, không ước tính): khoá có `jianghao-genset|…|JHRQ…`:
- `may-khi\top30-cloud` (#958): 28 khoá, **813** lần trong `all`, 453 lượt; top: 2 (IB2300204696#0 hạng 8 JHRQ100GF; IB2200004914#0 hạng 27 JHRQ130).
- `doosan-hau-to\top30-cloud`: 7 khoá, **7** lần, 3 lượt (IB2200042854#0: JHRQ80, JHRQ80GF, JHRQ90, JHRQ100; IB2400302943#0: JHRQ280, JHRQ300; IB2400614433#1: JHRQ220); top: 0.
- 21 khoá biến mất (492 lần); 7 khoá còn nhưng giảm từ 321 lần xuống 7 (mỗi khoá 1). Tổng mất 806 + 0 vào.
- 3 lượt còn lại: chưa kiểm vì sao (khả năng: HSMT nêu khí / nhiều nhiên liệu nên `fuelOff` không loại; chữ HSMT không có trong tệp đo, bidhist ở cloud).
Kết luận: loại này ĐÚNG THEO LUẬT, không oan so với quyết định "khí" của #982; "oan" hay không là hệ quả của câu (1): nếu jianghao thực ra là diesel thì loại oan 29 bản ghi.

**Đính chính tệp `nhien-lieu-4-bang.md` mục 1**: tệp đó trình bày jianghao như đang "rỗng" (đề xuất G = giữ rỗng; ghi "phân loại cũ chỉ xét bảng"), nhưng main hiện ghi khí. G thực chất là **hoàn tác một phần #982** (bỏ mục jianghao khỏi `FUEL_PAGES`), không phải "giữ nguyên".

## (4) Chữ khí cạnh bảng nhưng bản ghi `fuel` rỗng (toàn `suppliers/cn`)

Đo bằng `quet-canh-bang.mjs` (main 41fc98e3): 435 NCC (status ≠ incomplete), 9.928 bảng, 62.741 bản ghi (`fromSupplier` + `gensetsOf`), 61.902 có `fuel` rỗng. Một bảng được liệt kê khi có ≥ 1 bản ghi fuel rỗng VÀ chữ khí ở tiêu đề bảng / dòng đầu tệp nguồn (tên trang) / ≤ 8 dòng chữ ngay trước hoặc sau bảng trong tệp nguồn (`strong` = gas generator/engine/set, natural gas, biogas, LPG/CNG/LNG, 燃气, 沼气, 天然气…; `weak` = chữ "gas" đứng riêng). Tệp: `dau-vao\nhien-lieu-canh-bang\bang-co-chu-khi-canh-bang.tsv` (685 dòng: NCC, n, bảng, "rỗng/tổng", vị trí, mức, câu nguyên văn, url, tiêu đề). Chỉ đếm, không đề xuất sửa luật.

| | bảng | NCC |
|---|---|---|
| có chữ khí (strong hoặc weak) cạnh bảng, có bản ghi fuel rỗng | **351** | **65** |
| trong đó strong | 292 | 50 |
| bảng mà bản ghi rỗng chỉ đến từ `gensetsOf` (tổ máy không mã động cơ; `gensetsOf` chủ ý không đọc nhiên liệu, chỉ `FUEL_PAGES`) | 13 (382 bản ghi) | |
| bảng còn lại: bản ghi từ `fromSupplier` | 338 (6.477 bản ghi) | |
| đã được phiên trước phân loại "diesel bị nhầm" (menu, khẩu hiệu "柴油、燃气", m³/h nước): 116 bảng · đã phân loại "khí" mà fuel còn rỗng: 3 (googol n101, n102, westinpower n113; đều chỉ có bản ghi `gensetsOf`) · "không rõ": 3 (kingway n117, man n104, simpson n124 phần 3/10) · chưa phân loại: 229 | | |

**Ứng viên rõ nhất** (chữ khí ngay ở tiêu đề / tên trang của sản phẩm, 64 dòng trong `ung-vien-tieu-de-trang.tsv`; số = bản ghi fuel rỗng / tổng):
- frs-shenyang n107 (23/23): "燃气发电机组 - 沈阳福瑞斯动力设备有限公司" · googol n101 (5/5), n102 (6/6): "Gas Genset COP:1000-2500kVA" / "…350-750kVA" · westinpower n113 (3/3): "Natural Gas Generator Sets with Liyu Engines" (+ chú thích "Liyu gas engine…")
- teksan n104 (110/110): "The Best Natural Gas Generators are Here -Teksan" · teksan n106 (71/71): "Biogas Generator" · vpower-hk n101 (15/15): "VPower | 天然气系列" · n102 (11/11): "VPower | 沼气系列" — năm bảng này và frs / googol / westin đều là bản ghi `gensetsOf` (13 bảng, 382 bản ghi).
- kingway-power n117 (1/1): "70KW Double Membrane Biogas Storage Tank…" · man-engines n104 (9/9): "Compact MAN diesel and gas engines as auxiliary engines" · simpson-power n124 (3/10): "SIMPSON-GasGenerators".
- Hỗn hợp diesel + khí (không phải bằng chứng một loại): mahindra-powerol n2002–2007 "…Diesel & Gas Gensets" (6 bảng), yanmar n2002 "YTG SERIES｜Diesel/Gas Generators"; mwm n1007 / n1008 chỉ dòng "From: https://www.mwm.net/en/gas-engines-gensets/…".
Ghi chú đo: 229 bảng chưa phân loại phần lớn chỉ có chữ khí ở dòng trước / sau (menu, quảng cáo) — chưa soát tay từng bảng; tệp tsv liệt kê đủ để soát.

## Lựa chọn cho Khoa (jianghao n104)

- **K — giữ khí (hiện trạng, #982)**: dựa trên MỌI chữ của chính NCC (tiêu đề, mục "燃料分类", chú thích 1, hai bảng "燃气"); không nguồn nào nói riêng JHRQ là diesel. Rủi ro: cột "柴油机型号" + tên động cơ trùng bản diesel của hãng + 2 mức công suất bằng bản diesel; 29 bản ghi không còn thành ứng viên cho HSMT diesel / HSMT không nêu nhiên liệu (453 lượt trong đo 20/11).
- **R — để trống (bỏ mục jianghao khỏi `FUEL_PAGES`)**: 29 bản ghi quay lại gói diesel (813 lần `all`, 2 lần top ở tệp #958). Rủi ro: đưa máy mà NCC tự gọi là máy khí vào gợi ý HSMT diesel.
- Không có phương án L (loại hẳn) mới: K đã làm tương đương với HSMT diesel.
- Điểm chưa phân định được bằng nguồn: có phải tổ máy chạy khí chuyển đổi từ động cơ diesel (công suất thấp hơn ở 6 / 8 họ động cơ), hay chữ "gas" là quảng cáo (công suất bằng diesel ở NT855 200 kW, KT38 600 kW). Chỉ NCC (hỏi giá) trả lời được; không có phương án trả lời bằng nguồn công khai.

## Cần ghi nhớ (cho phiên điều phối)
- main đã ghi jianghao n104 khí từ #982; tệp `nhien-lieu-4-bang.md` mục 1 nói như "đang rỗng": cần đính chính trong sổ.
- 13 bảng tổ máy (`gensetsOf`) có chữ khí ở tiêu đề mà `fuel` rỗng (frs n107, googol n101/102, westin n113, teksan n104/106, vpower-hk n101/102, …; 382 bản ghi): quyết định riêng của Khoa (luật hiện tại chỉ đọc nhiên liệu của tổ máy qua `FUEL_PAGES`).
- Việc chưa kiểm: lý do 3 lượt còn JHRQ (cần bidhist cloud); trang Cummins 6LT / QSK19G / QSK38G / QSK50G; trang hãng SDEC / Chaochai cho đúng mã; chữ HSMT của lượt đã mất ứng viên (453 lượt).
- Tệp đã tạo ngoài nghiệm thu: `dau-vao\nhien-lieu-canh-bang\` (`quet-canh-bang.mjs`, `split.mjs`, hai tệp tsv). Không sửa repo, không PR, không ghi web.
