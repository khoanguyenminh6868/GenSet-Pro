**Kết luận: 4 bảng = 39 bản ghi catalog (jianghao n104 bảng 4: 5; jianghao n104 bảng 5: 24; kingway n117: 1; man-engines n104: 9). Top 30 gần nhất (doosan-hau-to, 20/11 16:13): 0 lần trong top của cả 4 bảng (jianghao 7 lần trong `all`, kingway và man 0); lượt #958 (79e9b175, 20/11 01:08): 2 lần / 2 lượt / 2 gói, đều jianghao (hạng 8 và 27). Nguồn hãng: MAN rõ cả 9 dòng (8 diesel, 1 khí tự nhiên); Cummins ghi diesel cho 4BT3.9 / 6CTAA8.3 / KTA19 (còn 6B, 6BT, 6LT, NT855, KT38, KT50 chỉ gián tiếp hoặc chưa đọc); Chaochai CY4102, Huafeng HF6105Q/ZQ, Weichai "Steyr P10/P12", SDEC SC9DT210D2 / SC13GT260D2: không rõ theo hãng. Phát hiện: trang jianghao và kingway TỰ GHI nhiên liệu khí ngoài bảng, trái với datasheet hãng (diesel) → mâu thuẫn giữa hai nguồn. Đề xuất: man-engines n104 = X (ghi theo hãng), jianghao + kingway = G (giữ rỗng).**

# Nhiên liệu của 4 bảng "không rõ" còn lại (Khoa 21/11/2026)

Chỉ đọc: không sửa mã, không ghi web, không PR. Cách làm như `simpson-n124-nhien-lieu.md`. Trang NCC mở lại 21/11 (`maxAge 0`), nội dung trùng tệp lưu 13/11.

Ghi chú nguồn: "trích" ≤ 15 từ. Dòng đánh dấu (kết quả tìm kiếm) là đoạn trích của công cụ tìm kiếm, CHƯA mở lại trang.

## 1. jianghao-genset n104 — hai bảng (bản ghi 5 + 24)

**Trang NCC**: `http://www.jhgensets.com/Products_detail/32.html` (lưu `suppliers/sources/jianghao-genset/104.md`). Tên trang "Gas Generator-Jiangsu Jianghao Generator Co.,Ltd.", mục "Generator Set(Fuel)". Tiêu đề bảng 1 "Gas Electric Generator：", bảng 2 "Cummins, gas electric generator：". Tiêu đề cột `Type | Output Power KW / KVA | Current (A) | Engine model | Cylinder | Bore*Stroke (mm) | FuelCon. (L) | Lube capacity (L) | Dimension | Weight`. Cột bảng KHÔNG có tên nhiên liệu (FuelCon. đơn vị lít).

Chữ nhiên liệu CÓ trên trang nhưng ngoài bảng (phân loại cũ chỉ xét bảng nên không thấy):
- Mô tả: "liquefied petroleum gas, natural gas and other combustible gases as combustion, instead of gasoline, diesel as power" (câu của NCC).
- Chú thích ① dưới bảng: "The above generators can be used natural gas, oil filed gas, bio-gas, straw gas, coal gas and other gases as fuel."
- Phần "Structural characteristics" dưới trang lại nói "diesel generator set" (chữ dùng chung với mẫu diesel; mâu thuẫn nội bộ).

**Bảng 4 (9 dòng, 5 bản ghi: 6 model động cơ gộp theo `engineKey`)** — mẫu tổ máy / công suất kW / động cơ:
JHRQ-30GF 30 Chaochai CY4102 · JHRQ-50GF 50 Huafeng HF6105Q · JHRQ-80GF 80 Huafeng HF6105ZQ · JHRQ-100GF 100 Weichai Steyr P10 · JHRQ-120GF 120 Weichai Steyr P10 · JHRQ-150GF 150 Weichai Steyr P10 · JHRQ-220GF 220 Weichai Steyr P12 · JHRQ-100GF 100 SDEC SC9DT210D2 · JHRQ-150GF 150 SDEC SC13GT260D2.

**Bảng 5 (27 dòng, 24 bản ghi)** — JHRQ-30 / -40 (4B) · -50 (6B) · -60 / -80 / -90 (6BT) · -100 / -120 / -130 (6CT) · -150 / -160 (6LT) · -180 (6LT8.9) · -200 / -220 / -250 / -280 (NT855) · -300 / -350 / -400 / -440 (KT19) · -500 / -600 / -700 / -750 (KT38) · -800 / -980 / -1100 (KT50). Công suất 30 → 1100 kW.

**Datasheet / trang HÃNG động cơ**

| động cơ | hãng | URL | trích | nhiên liệu theo hãng |
|---|---|---|---|---|
| 4B (4BT3.9) | Cummins | https://www.cummins.com/en-na/generators/products/4bt39 (mở 21/11) | "Rugged 4-cycle, industrial diesel delivers reliable power" ; cột fuel type "Diesel" | diesel |
| 6B / 6BT (5.9) | Cummins | https://www.cummins.com/en-in/generators/tier-4-certified-generator-sets?page=6 (kết quả tìm kiếm: "6BT5.9 … Fuel Type. Diesel") — mở lại trang KHÔNG thấy dòng này | — | diesel (gián tiếp, chưa xác minh được) |
| 6CT (6CTAA8.3) | Cummins | https://www.cummins.com/en-na/generators/products/6ctaa83 (mở 21/11) | "Rugged 4-cycle, industrial diesel delivers reliable power" ; fuel type "Diesel" | diesel |
| 6LT / 6LT8.9 | Cummins | không tìm được trang hãng đúng tên (chỉ ra "6LTAA9.5", khác tên) | — | không rõ |
| NT855 | Cummins | https://www.cummins.com/sites/default/files/2019-05/NT855G6.pdf (kết quả tìm kiếm: "Non-Regulated", không thấy chữ diesel) | — | không rõ (chưa đọc PDF) |
| KT19 (KTA19) | Cummins | https://www.cummins.com/en-na/g-drive-engines/products/diesel-kta19-series (mở 21/11) | cột Fuel Type "Diesel" ; "heavy-duty diesel engines on the market" | diesel (ghép tên KT19 ≈ KTA19, NCC không ghi hậu tố) |
| KT38 | Cummins | https://www.cummins.com/sites/default/files/2019-05/kta38g3_3.pdf (kết quả tìm kiếm: "most robust and cost-effective diesel engine") | — | diesel gián tiếp; tên hãng KTA38, NCC ghi KT38 |
| KT50 | Cummins | https://www.cummins.com/sites/default/files/2023-07/KTA50-G3.PDF (kết quả tìm kiếm: "diesel engine …") | — | diesel gián tiếp; tên KTA50 vs KT50 |
| CY4102 | Dongfeng Chaoyang (Chaochai) | https://www.dfmc.com.cn/zt/35/35/century_dfgd_6.html (kết quả tìm kiếm: họ "CY" có "102, 3升, D, 燃气 bốn dòng") | chỉ liệt kê họ, không nói riêng CY4102 | không rõ: CY4102 có cả bản diesel (CY4102-C3) lẫn bản CNG (CY4102-N3B) theo trang bán lại; trang hãng không phân định |
| HF6105Q / HF6105ZQ | Weifang Huafeng (Power HF) | https://en.powerhf.com/pro/gas/0614/20.html (mở 21/11) | dòng khí hãng liệt kê là PHF3020ZX1Q … PHF6260ZL1Q: "Biogas, natural gas, liquefied gas" | không rõ: tên HF6105Q / ZQ KHÔNG có trên trang hãng; không ghép sang PHF |
| Weichai Steyr P10 / P12 | Weichai | https://www.weichaipower.com/ (trang WP12 có, không nói tới "Steyr P10/P12") | — | không rõ: tên NCC không khớp tên hãng (WP10 / WP12), không ghép |
| SDEC SC9DT210D2 / SC13GT260D2 | Shanghai Diesel (SDEC) | không tìm được trang hãng cho hai mã này | — | không rõ |

Truy vấn đã thử: "Weichai Steyr P10 P12 generator engine diesel" (không trang hãng), "潍柴 WP10 WP12 斯太尔 发电 柴油机 官网"; "Chaochai CY4102 diesel engine Chaoyang Diesel", "东风朝柴 CY4102 …"; "Huafeng HF6105Q HF6105ZQ engine Weifang Huafeng"; "SC9DT210D2 SC13G260D2 SDEC generator engine"; `site:sdec.com.cn` (www.sdec.com.cn không phân giải DNS); Cummins "6LTAA8.9-G", "6CTAA8.3-G" "KTA19-G".

**Đọc kết quả (không suy thêm)**
- Trang NCC nói bộ máy dùng được các khí (câu NCC); datasheet hãng Cummins (4B, 6CT, KT19) nói động cơ là diesel. Hai điều không được giải quyết bằng nguồn: có thể NCC bán bộ chuyển khí trên động cơ diesel, có thể chữ "gas" là quảng cáo. **Không rõ.**
- CY4102, HF6105Q/ZQ, Weichai P10/P12, SDEC SC9DT210D2/SC13GT260D2: hãng không xác nhận → không rõ.

**Bản ghi catalog**: bảng 4 = 5, bảng 5 = 24 (tổng 29).
**Top 30**: `doosan-hau-to\top30-cloud\gop-nhanh.json.gz` (1093 lượt, 928 gói; khoá bắt đầu `jianghao-genset|…|JHRQ…`): top = 0 lần; `all` = 7 lần (bảng 4 GF: 1 lần / 1 lượt / 1 gói; bảng 5: 6 lần / 3 lượt / 3 gói). Lượt #958 `may-khi\top30-cloud\gop-nhanh.json.gz` (cùng 1093 lượt): top = 2 lần / 2 lượt / 2 gói (hạng 8 `SC9DT210D2|JHRQ100GF`, hạng 27 `6CT|JHRQ130`); `all` = 147 (bảng 4) + 666 (bảng 5) = 813 lần. `all` rơi từ 813 xuống 7 giữa hai tệp: CHƯA lý giải (không mở thêm).

**Lựa chọn cho Khoa**
- **X** ghi theo hãng: chỉ ghi được diesel cho dòng Cummins 4B / 6CT / KT19 (≈ 10–11 bản ghi theo mã); phần còn lại rỗng. Trái với chữ của chính trang NCC (khí) → có nguy cơ sai.
- **L** loại cả 2 bảng (29 bản ghi) khỏi gói diesel: dựa vào chữ "Gas Generator" + chú thích ① của NCC. Lượt #958: bỏ 2 lần khỏi top.
- **G** giữ rỗng. **Đề xuất: G** — hai nguồn (trang NCC nói khí, hãng nói diesel) mâu thuẫn và ít ảnh hưởng (0 lần top ở tệp mới, 2 lần ở tệp cũ).

## 2. kingway-power n117 — 1 bản ghi

**Trang NCC**: `https://www.kingwaygenerator.com/gas-generagtor-set/biogas-generator-set/70kw-double-membrane-biogas-storage-tank-for.html` (lưu `suppliers/sources/kingway-power/117.md`). Tên trang "70KW Double Membrane Biogas Storage Tank For Waste Water Treatment", mục "Gas Generagtor Set > Biogas Generator Set". Tiêu đề cột `Model | Type | Prime Power | Standby Power | SDEC Engine Model | Alternator Model | Controller Model`. Chỉ 1 dòng tổ máy: KGD250B, Open Type, 250KVA/200KW prime, 275KVA/220KW standby, SDEC SC9D340D2, alternator Kingway KAI250, controller Smartgen HGM 9510. Ngoài bảng thông số: "uses biogas as fuel"; bảng "Engine Specifications" có dòng "Fuel | Biogas" và "Compression ratio 16.5:1" (số này là của động cơ diesel — NCC không nói; không dùng). Tiêu đề / hình trang là "biogas storage tank" mà thông số là tổ máy 250 kVA: tiêu đề mâu thuẫn với thân trang.

**Datasheet hãng SDEC SC9D340D2**: không tìm được trang HÃNG đã xác nhận. Trang `https://sdec-engine.com/sdec-sc9d340d2-g-drive-engine/` (tên "Shanghai Diesel-SDEC Engine") ghi "Used Fuel | Diesel Fuel Oil", nhưng nội dung nhắc "EMAC" bán / tuỳ biến → chưa xác nhận là trang của hãng, KHÔNG dùng theo quy tắc. Truy vấn: "SDEC SC9D340D2 diesel engine generator drive", "Shanghai Dongfeng SDEC SC9D340D2 engine specification", "上柴 SC9D340D2 …".

**Đọc**: trang NCC nói khí sinh học (Fuel Biogas); không có nguồn hãng. Chưa mâu thuẫn trực tiếp, nhưng nhãn "Biogas" nằm ở bảng thông số động cơ của chính trang (loại B, không phải T như phân loại cũ ghi) — **cần đọc lại luật nếu Khoa muốn dùng**; phiên này không đổi phân loại.

**Bản ghi catalog**: 1 (SC9D340D2). **Top 30**: 0 lần trong cả hai tệp (khoá `kingway-power|…|KGD250B`; không có trong `all`).

**Lựa chọn**: X ghi "khí sinh học" theo chữ NCC (B: nằm trong bảng của trang; nhưng không có hãng) · L loại · G giữ rỗng. **Đề xuất: G** (1 bản ghi, 0 lần top; tên trang "storage tank" làm nguồn kém tin).

## 3. man-engines n104 — 9 dòng = 9 bản ghi

**Trang NCC = trang hãng**: `https://www.man.eu/engines/en/products/marine/auxiliary-motors/auxiliary-motors.html` (lưu `suppliers/sources/man-engines/104.md`, mở lại 21/11). Tên trang "Compact MAN diesel and gas engines as auxiliary engines". Tiêu đề cột `Output kW 50 Hz / 60 Hz | Engine model | Cylinders | Model | Displacement in litres`.

| dòng | kW 50/60 Hz | động cơ |
|---|---|---|
| 1 | 190/220 | D2676 |
| 2 | 280/330 | D2676 |
| 3 | 290/290 | D2676 |
| 4 | 360/410 | D2676 |
| 5 | 375/445 | D2676 |
| 6 | 600/700 | D2862 |
| 7 | 700/800 | D2862 |
| 8 | 840/960 | D3872 |
| 9 | 500/580 | E3262 |

Trang không ghi nhiên liệu cho từng dòng (chỉ nói chung "diesel and gas engines").

**Datasheet hãng (cùng hãng MAN Engines)**

| động cơ | URL | trích | nhiên liệu |
|---|---|---|---|
| D2676 (5 dòng) | `https://www.man.eu/content/dam/man/man-engines/doc/produkte/marine-1/marine-auxiliary-en.pdf` (mở 21/11, tr. 16) | "4-stroke diesel engine, watercooled" ; "Fuel: DIN EN 590" | diesel |
| D2862 (2 dòng) | cùng PDF, tr. 22 | "4-stroke diesel engine, watercooled" ; "Fuel: DIN EN 590" | diesel |
| D3872 (1 dòng) | cùng PDF, tr. 28 | "4-stroke diesel engine, watercooled" ; "Fuel: DIN EN 590" | diesel |
| E3262 (1 dòng) | `https://www.man.eu/engines/en/products/power-generation/gas/man-motor-e3262.html` (kết quả tìm kiếm, chưa mở) và `…/power-generation-gas.html` | "E3262 naturally aspired engine with natural gas" ; "Engines for natural gas combustion" | khí tự nhiên |

**Bản ghi catalog**: 9. **Top 30**: 0 lần; không khoá nào của `man-engines` có trong `all` của hai tệp (khoá `man-engines|…` = 0).

**Lựa chọn**: **X** ghi `fuel` theo hãng: 8 bản ghi diesel (D2676, D2862, D3872), 1 bản ghi khí (E3262, có thể đã nằm trong bảng B của man-engines n105/111 cho E3262). Đây là loại bằng chứng "theo hãng động cơ" như câu 4 = C của simpson, nên nhất quán. · L không phù hợp (bảng trộn diesel và khí). · G giữ rỗng. **Đề xuất: X** (9/9 dòng có nguồn hãng; 0 lần top nên chưa đổi kết quả gợi ý hiện nay).

## Cần ghi nhớ (cho phiên điều phối)
- Không sửa gì ngoài `genbid-work\dieu-phoi\nghiem-thu\`; không PR; không ghi web.
- Phân loại jianghao và kingway ở `phan-loai-bang.tsv` chỉ xét chữ TRONG bảng; trang jianghao (chú thích ① + mô tả) và kingway ("Fuel | Biogas") có chữ khí ngoài bảng. Luật B / T / M có thể cần xét "chữ cạnh bảng" (cân nhắc, chưa làm).
- Việc chưa kiểm: PDF NT855, KT38, KT50; trang Cummins cho 6B, 6BT, 6LT; trang MAN E3262 (mới đọc đoạn trích tìm kiếm); SDEC / Weichai / Chaochai / Huafeng đúng mã; vì sao `all` của jianghao rơi từ 813 xuống 7 giữa hai tệp top 30.
