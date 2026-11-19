**Kết luận bằng số: 82 bảng nhóm G chỉ có 46 bảng thật sự là tổ máy không mã động cơ: 1.753 dòng, 12 NCC (teksan 1.180, yingtai 348). 36 bảng còn lại là đầu phát rời (20 bảng, 593 dòng), động cơ rời (9 bảng, 198 dòng), 4 bảng CÓ mã động cơ mà bộ đọc bỏ sót (67 dòng) và 3 bảng không phải tổ máy thường (10 dòng). Chỉ 1 NCC (vpower-hk) hiện không có bản ghi động cơ nào. Trong số liệu bộ đọc hiện tại tính ra cho 1.753 dòng (tính xong rồi bỏ) có lỗi thật: googol đọc công suất động cơ thành kW tổ máy (18 dòng), "Continuous" thành prime (11 dòng), yingtai lẫn 33 dòng động cơ, tần số chỉ đọc được 17 / 1.753 dòng (teksan có 710 dòng 60 Hz). Khuyến nghị: phương án 1 (lưu + hiện ở hồ sơ NCC, CHƯA nối Gợi ý), chọn bảng theo DANH SÁCH TƯỜNG MINH, không theo luật. Phần nối vào Gợi ý: Khoa duyệt.**

# Việc (C): bản ghi "tổ máy không mã động cơ", bước 1: khảo sát + đề xuất (20/11/2026)

Chỉ đọc, chưa sửa code. Đo trên `main` abb28c67 (`suppliers/cn` hiện tại) bằng `fromSupplier` THẬT của `web/catalog.js`: script nạp bản sao trong bộ nhớ, gắn vết ở chỗ dòng có mã tổ máy (`gi >= 0`) mà không ra động cơ / đầu phát (`ei < 0 && ai < 0`), không sửa repo. Script và kết quả: `genbid-work\dieu-phoi\dau-vao\catalog-c\` (mục 6).

## 1. Đếm thật (a)

### 1.1 82 bảng nhóm G: soát tay TỪNG bảng (tiêu đề + dòng mẫu)

| lớp | bảng | dòng | NCC | ghi chú |
|---|--:|--:|--:|---|
| **T: tổ máy không mã động cơ** | **46** | **1.753** | **12** | đối tượng của việc này |
| A: đầu phát rời | 20 | 593 | 12 | eastern-lion STC, gordon ST, jet-power JET164, keliang ×2, landtop ×2, lanzhou TZH, longkai LK, nenjo HJI ×2, shengfeng ×3, xinhengxin ×3, yihua TFX, yingtai STC / YTW |
| E: động cơ rời | 9 | 198 | 5 | kangjin ×2, penlucky ×3 (máy tàu), rise n131 (SDEC), yingtai n101 b1 / n2003 (Cummins), zhengdian ZS195 |
| X: CÓ mã động cơ trong ô, bộ đọc bỏ sót | 4 | 67 | 2 | green-power n115 / n117 / n126 ("12V 1600 G10F", "KDW 702 (M)", "OC16 071A 02 81 (E)" dưới "MOTORE ENGINE"), lees-power n133 ("MTU 8V4000 GS/L32"). KHÔNG thuộc việc (C): là lỗi đọc mã động cơ, đề xuất việc riêng |
| O: không phải tổ máy thường | 3 | 10 | 2 | green-power n132 / n133 (tháp đèn chiếu sáng), vantek n111 (máy phát + bơm chìm) |

Số dòng ở đây là dòng mà `fromSupplier` duyệt tới có mã tổ máy; tổng 2.621 (bản R1-1 ghi 2.638 dòng thô, chênh là dòng tiêu đề phụ / dòng không mã).

### 1.2 46 bảng T theo NCC

| NCC | bảng | dòng | model khác nhau | dòng có công suất | bản ghi động cơ khác của NCC (đang có) | trạng thái hồ sơ |
|---|--:|--:|--:|--:|--:|---|
| teksan | 4 | 1.180 | 498 | 1.180 | 12 | partial |
| yingtai-jiangsu | 7 | 348 | 178 | 315 | 263 | verified |
| frs-shenyang | 3 | 60 | 59 | 60 | 225 | verified |
| googol | 9 | 29 | 29 | 29 | 32 | verified |
| acepow-fuan | 13 | 27 | 21 | 14 | 506 | verified |
| vpower-hk | 2 | 26 | 26 | 3 | **0** | verified |
| green-power-generators | 1 | 24 | 24 | 24 | 260 | partial |
| interpower-international | 1 | 23 | 23 | 23 | 12 | verified |
| kangwo-xiamen | 1 | 17 | 15 | 0 | 28 | verified |
| zc-power | 2 | 9 | 9 | 9 | 3 | verified |
| superwatt-swt | 2 | 7 | 7 | 7 | 97 | verified |
| westinpower | 1 | 3 | 3 | 3 | 492 | partial |

**NCC hiện vắng hẳn khỏi Gợi ý vì việc này: 1 (vpower-hk), và 23 / 26 dòng của nó bộ đọc không ra công suất (cột "电能 (kWe)" không là mức nào).** teksan gần như vắng (12 bản ghi động cơ so với 1.180 dòng tổ máy). Model tổ máy trùng chữ giữa hai NCC trong T: 0.

### 1.3 Trường của 1.753 dòng T (đo bằng bộ đọc hiện tại)

- **Công suất:** prime + standby 1.474; chỉ prime 72; chỉ standby 18; chỉ "rated" 94; rated + standby 9; không có 86 (acepow 13, kangwo 17, vpower 23, yingtai 33). Có kVA 1.635, có kW 1.609.
- **Dải (kVA đầu tiên đọc được):** ≤ 50: 212; 51–200: 333; 201–500: 418; 501–1.000: 405; 1.001–2.000: 202; > 2.000: 65; không có kVA: 118.
- **Hãng động cơ** (`makesFor` của chính bộ đọc, không đoán): 1.417 dòng có hãng; 336 không (yingtai 140, frs 60, teksan 35 vì "ERIN / YAVUZ MOTOR / FORD / PSI" không có trong `ENGINE_BRANDS`, vpower 26, interpower 23 dù tên trang ghi "Baudouin engine" — `titleHead` cắt tên trang ở " – " nên phần ngoặc không được đọc, acepow 23, kangwo 17, zc 9, westinpower 3). Theo hãng: Perkins 335, Baudouin 223, MAN 141, Hyundai 132, Doosan 116, Cummins 209, Volvo Penta 83, SDEC 46, Mitsubishi 44, Googol 29, John Deere 27…
- **Tần số:** chỉ **17 / 1.753** dòng có. teksan có cột "Hz" (470 dòng 50 Hz, **710 dòng 60 Hz**) nhưng số trơ dưới tiêu đề "Hz" không được đọc thành tần số.
- **Thông số khác:** khối lượng 76, kích thước 53, pha 28, hệ số công suất 28, đường kính / dung tích 28, tiêu hao 24, điện áp 18 (teksan có cột Voltage 208–480 V nhưng không đọc), hiệu suất 11, bình dầu / thời gian chạy / độ ồn / khởi động 7, dòng điện 1. Bảng yingtai có cột dòng điện / khối lượng / kích thước nhưng bộ đọc chỉ ra rất ít (tiêu đề hai tầng "功率（主用）" đè hai ô, chốt `onePair` của lệch cột).
- **Nhiên liệu:** catalog chưa có trường nhiên liệu. Trong T có máy khí / biogas (teksan n104 / n106: 181 dòng, frs n107, googol 11 + 18, vpower 26, westinpower 3) và máy xăng nhỏ (frs n108 37, zc-power 9).

### 1.4 Lỗi của chính số liệu đọc ra (soát MỌI 1.753 dòng, `soat-cs.mjs`)

Các số này hôm nay `fromSupplier` tính xong rồi bỏ, nên chưa ai soát. Thành bản ghi thì chúng hiện ra:

1. **googol n107–n117 (18 dòng):** tiêu đề "Engine (Output Power) Standby / Prime (kW)" rồi "Genset Standby / Prime (kW/kVA)": bộ đọc ghép kW của ĐỘNG CƠ với kVA của tổ máy (PTAA20V-EG1120C: standby 1.120 kW / 1.250 kVA, đúng ra tổ máy 1.000 kW / 1.250 kVA). 36 cặp kW / kVA ngoài 0,75–0,86.
2. **googol n101 / n102 (11 dòng):** "Continuous Power (kW/kVA)" đọc thành prime, trái quy tắc web/CLAUDE.md (continuous / COP không là mức nào).
3. **yingtai n109 b17 (33 dòng):** bảng tổ máy có lẫn 33 dòng ĐỘNG CƠ googol (PTAA13EG1 | 346 | 378 | L6 | 128×166 …): thành bản ghi tổ máy là sai vai.
4. **acepow (13 dòng):** dòng 2–3 của bảng là bảng kích thước dính vào ("APX-200 | 2800 | 1100 | 1600 | 1910 | 1990"): không công suất, nhưng thành bản ghi tổ máy rác.
5. **teksan (77 dòng "rated"):** Prime ghi "TBA" / "N/A" / "0" (máy khí) nên bộ đọc gọi cột Standby là "rated"; 1 dòng (TJ180DW prime 165 kVA / 144 kW, tỉ số 0,87) cũng thành rated.
6. **frs n107:** ô số xi lanh "11;1" (nguồn gõ sai), bộ đọc đã bỏ; không lỗi thêm.

### 1.5 Ngoài 82 bảng (đo cho biết quy mô, KHÔNG thuộc việc này)

Cùng điều kiện "có mã tổ máy, không ra động cơ / đầu phát" trên toàn `suppliers/cn`: **7.973 dòng / 1.076 bảng / 146 NCC.** Ngoài 82 bảng R1-G: 2.605 dòng ở 436 bảng chưa cho bản ghi (lớp T theo luật thô, 55 NCC; phần lớn là bảng dọc / bảng nhãn / mảnh bảng của nhóm V, F, Z — liên quan việc (D)), 2.080 dòng ở 495 bảng ĐÃ cho bản ghi (2.024 là dòng lẻ thiếu ô động cơ trong bảng tổ máy đang đọc), 667 dòng ở bảng chưa cho bản ghi của hãng đầu phát / hãng động cơ hoặc trang đầu phát (2.621 + 2.605 + 2.080 + 667 = 7.973). Chưa soát những dòng này.

**Thử một luật chọn bảng thay cho soát tay** (`luat-bang.mjs`: tiêu đề / tên trang có chữ tổ máy, không chữ đầu phát / động cơ, NCC không phải hãng đầu phát / động cơ, bảng chưa cho bản ghi): chọn 30 / 46 bảng T, sót 16 (googol 9, frs 2, vpower 2, interpower, yingtai n112, acepow n110), chọn nhầm 7 bảng không phải T (3 X, 3 O, zhengdian E) và kéo thêm 153 bảng ngoài R1-G (1.476 dòng, `luat-bang-ngoai-r1g.tsv`: nhiều bảng nhãn "Type: | Silent…", bảng động cơ acepow n126…). **Luật kiểu này vừa sót vừa nhầm: không dùng được.**

## 2. Cấu trúc dữ liệu (b)

### 2.1 Đề xuất

- **Không thêm vào đầu ra của `fromSupplier`.** Hàm mới `gensetsOf(s, notes)` (cùng tệp, dùng chung `tidyTable`, `titledPowers`, `rowSpecs`, `makesFor`), chỉ duyệt bảng nằm trong danh sách tường minh `GENSET_TABLES` (như `ROW_EXCEPTIONS`): khoá NCC + `n` + chữ dòng tiêu đề đầu NGUYÊN VĂN (nguồn cào lại đổi tiêu đề thì tự hết hiệu lực, ghi note). Mỗi mục ghi bảng đã soát, ngày, lý do; dòng loại riêng trong bảng (33 dòng động cơ yingtai, 13 dòng kích thước acepow) loại bằng điều kiện ghi rõ trong mục (vd. "dòng phải có công suất", "dòng không có ô xi lanh 'L6'"), không đoán.
  Lý do không trộn vào `fromSupplier`: `builder` làm `maps[o.kind]` (kind lạ thì `undefined` → lỗi), `row-flags-lib.mjs` (`rowKey` theo vai, `o.kind === "engine"`), `spec-diff.mjs` (khoá + đếm đảo vai engine ↔ alternator), `quality.mjs`, `unread()` đều duyệt `fromSupplier` và mặc định chỉ có hai vai. Hàm riêng giữ nguyên MỌI đầu ra cũ (spec-diff phải ra 0 thay đổi bản ghi cũ).
- **Bản ghi dòng:** `{ supplierId, n, table, row, title, line, header, kind: "genset", model, power, freq, specs, makes (hãng động cơ, như bản ghi động cơ: dòng bảng > tiêu đề cột > tên trang), fuel? }` (`fuel` chỉ khi có trường nhiên liệu được duyệt, xem 5.3).
- **`CAT.build` / `builder`:** thêm `gensets: []` cạnh `engines / alternators / controllers`. **Khoá = `supplierId | keyOf(model)`** (tên tổ máy là của từng NCC: "200GF", "20GF" có ở nhiều NCC; trong T đo được 0 trùng nhưng toàn catalog thì có). Một khoá nhiều dòng (teksan 1.180 dòng / 498 model vì mỗi điện áp / tần số một dòng; yingtai "200GF" ba dòng ba biến thể Cummins) giữ cả ở `uses`, như bản ghi động cơ. `finish()` dùng lại cho kva / kw / specs / makes; `specs` lấy phạm vi `genset` + `engine` (dòng ghi xi lanh / dung tích của động cơ không mã).
- **`unread()`:** tính bảng của `gensetsOf` là "đã dùng" (unread-tables giảm đúng số bảng trong danh sách).

### 2.2 Chỗ đọc kết quả (grep đủ, `main` abb28c67)

| chỗ | đọc gì | ảnh hưởng nếu thêm `gensets` |
|---|---|---|
| `web/catalog.js` `builder` / `build` / `unread` / `suggest` (1935: `cat.engines` / `cat.alternators`) | | sửa ở PR 1 |
| `suppliers/config-bot.mjs` `candidates` (1462: chỉ `cat.engines`), `prep` (2106–2113 `byOrigin(full.engines…)`), `modelFacts` (778–795: engine / alternator), `check` (2421–2544 `built.engines`), 2652 / 2871 / 3087 / 3420, `catalogMd` 4838 / 4880, 4975 / 5113, `partsOf` 5291 (Tìm Thông Số) | | KHÔNG đổi nếu không nối (phương án 1); `partsOf` có thể thêm tổ máy để agent Tìm Thông Số biết NCC đã có gì |
| `suppliers/do-gop.mjs` (đo top 30) | `full.engines` | không đổi |
| `suppliers/gaps.mjs` 73–143 ("Việc cần thu thập", `engines.length`) | | không đổi; có thể thêm số tổ máy |
| `suppliers/catalog-pdf.mjs` 202, `ocr-specs.mjs` 37, `discover.mjs` 199, `catalog-stats.mjs` | danh sách model động cơ / đầu phát đã biết | không đổi |
| `suppliers/row-flags-lib.mjs` 34 / 39 / 125, `spec-diff.mjs` 57–141, `quality.mjs` 57 | `fromSupplier` | không đổi (đó là lý do dùng hàm riêng). Muốn gắn cờ / soát chéo dòng tổ máy thì thêm `gensetsOf` vào ba script này ở PR 1 (đề xuất: có, để `spec-diff` in mọi bản ghi tổ máy mới cho soát) |
| `web/index.html` `supModelsHtml` 3710 (chi tiết NCC: `part(engine / alternator / controller)`), danh mục `CAT_KIND` 3826 / 3929 / 3976 / 4025, `catBuild` 3848, 4812 / 4849 / 4862 | | hiển thị ở PR 2 (mục 4) |
| bot `bot/genbid-hsmt/*.js` | không đọc catalog | không đổi |

## 3. Nối vào Gợi ý cấu hình (c) — KHOA DUYỆT TRƯỚC KHI CÓ CODE

`candidates` hôm nay duyệt `cat.engines` rồi từng `e.uses`; MỌI luật gắn với bản ghi động cơ `e`: khoá `e.key` (trần `PER_ENGINE`, `choiceKey`, `keep`), hãng `e.make` (+60, `engineMakes` +300, trần mỗi hãng `MAKE_CAP`, đặc thù hãng `trait`), xuất xứ `CAT.originOf(e)` (12 chỗ dành hãng TQ `CN_ROWS`, `viaCn`), nơi sản xuất `CAT.madeAt(e, u)` (G7 / G20 `madeRule`), thông số gộp của model `facts engine:<key>` (+8 × số loại, dung tích / xi lanh tối thiểu, trần dung tích, số đông `majorityOf` / `dispVoters`, bố trí xi lanh), model nêu đích danh `named(hints, e.model)` (+1000), tần số của động cơ (luật `freq` thứ hai). Sau `candidates`, agent dựng cấu hình có `engine.model` và `check` chấm từng mục theo datasheet động cơ / đầu phát. Dòng tổ máy không mã động cơ không có `e`, không có `facts`, không có đầu phát.

Luật vẫn áp được cho dòng tổ máy: dải công suất `near`, prime tối thiểu (`lowPrime`), tần số của chính dòng (khi đọc được), tiêu hao của chính dòng, model tổ máy HSMT nêu (`gNamed`, đã đọc `u.genset` / `u.line`), hãng tổ máy HSMT nêu (`NG.makerOf`), bộ điều khiển trên dòng / hồ sơ NCC, cờ dòng (`blocked`, cần `rowKey` cho vai "genset"). Hãng động cơ khi bảng ghi (1.417 / 1.753 dòng) cho phép xét `engineMakes`, `trait`, xuất xứ / nhóm G7 THEO HÃNG; KHÔNG xét được nơi sản xuất (`madeAt` cần model), số xi lanh, dung tích, bố trí xi lanh, số đông.

### Phương án 1 — chỉ lưu + hiện ở hồ sơ NCC, CHƯA nối Gợi ý (khuyến nghị bước này)
- Hệ quả đo được: Gợi ý KHÔNG đổi (top 30 mọi lượt phải giống hệt gốc: đo `do-gop.mjs` để xác nhận, kỳ vọng 0 lượt đổi vì `candidates` không đọc `gensets`). Hồ sơ NCC trên web thêm mục "Tổ máy (bảng không ghi mã động cơ)": 12 NCC, ~1.750 dòng (sau khi bỏ dòng lỗi ở 1.4), vpower-hk lần đầu có dữ liệu cấu hình. Làm nền cho việc (D) (bảng dọc một máy).
- Rủi ro gợi ý sai: 0. Rủi ro hiển thị: số đọc sai ở 1.4 hiện ra → phải sửa / loại trước khi hiện (nằm trong PR 1).

### Phương án 2 — nối, nhưng CHỈ khi HSMT không đòi gì về động cơ mà dòng không trả lời được
- Dòng tổ máy vào `candidates` như ứng viên riêng (không `e`), chỉ ở lượt mà `hints` KHÔNG có: `minDisp`, `maxDisp`, `minCyl`, `cylLayout`, model động cơ nêu đích danh, `madeRule.engine` (nơi sản xuất động cơ), `trait` mà dòng không ghi hãng, `engineMakes` mà dòng không ghi hãng; HSMT đòi tần số thì dòng phải đọc được tần số (không đọc được → loại, ngược với dòng động cơ đang "không ghi thì giữ": thà thiếu). Điểm: không cộng `8 × số loại thông số động cơ`, không +60 hãng khi không có hãng; cấu hình agent dựng ghi "động cơ: chưa rõ model (bảng NCC chỉ ghi hãng X)" và `check` để mục động cơ "chưa rõ" (cần sửa `check` / prompt).
- Hệ quả: CHƯA ĐO (cần `bidhist` + hints của mọi lượt: đo ở cloud bằng `do-gop.mjs` sau khi có code). Ước tính định tính: lượt nào HSMT ghi xi lanh / dung tích tối thiểu (phần lớn gói lớn) thì dòng tổ máy bị loại hết; gói nhỏ / gói không ghi động cơ thì teksan / yingtai vào được.
- Rủi ro gợi ý sai: vừa. (i) Không kiểm được động cơ đạt / không đạt ngoài các ngưỡng HSMT ghi bằng số mà code đọc ra; ngưỡng code chưa đọc được (`hints-audit` có mục "thiếu") thì dòng tổ máy lọt qua mà không ai chấm. (ii) teksan là hãng Thổ Nhĩ Kỳ: "xuất xứ" của tổ máy ≠ hãng động cơ; HSMT đòi xuất xứ tổ máy thì cần luật riêng. (iii) Cấu hình không có model động cơ khó làm hồ sơ dự thầu.

### Phương án 3 — nối luôn, trừ điểm
- Như phương án 2 nhưng không chặn theo `hints`: mọi luật động cơ "không xét được" coi như không vi phạm, dòng bị trừ (vd. −300) và ghi lý do "không rõ model động cơ: chưa kiểm xi lanh / dung tích / nơi sản xuất".
- Hệ quả: CHƯA ĐO. Rủi ro gợi ý sai: CAO: dòng 6 xi lanh 5,9 L của NCC chỉ ghi tổ máy sẽ lọt gói "≥ 8 L" (cùng dòng ấy nếu ghi mã động cơ thì bị `disp` loại) — tức là THIẾU dữ liệu lại được đối xử tốt hơn CÓ dữ liệu sai số. Trái nguyên tắc "thà thiếu còn hơn sai".

**Khuyến nghị:** phương án 1 ngay (PR 1 + PR 2). Phương án 2 chỉ sau khi Khoa xem hồ sơ NCC có tổ máy và duyệt ba câu: (a) dòng tổ máy có được làm cấu hình khi không có model động cơ không; (b) HSMT đòi tần số mà dòng không ghi thì loại (đề xuất: loại); (c) máy khí / xăng có được vào gói diesel không (đề xuất: không, cần trường nhiên liệu). Phương án 3: không khuyến nghị.

## 4. Kế hoạch PR (d)

**Không đụng `web/catalog.js` tới khi PR của phiên B3 (zhengchi) merge.**

1. **PR 1 — catalog (chỉ `web/catalog.js` + test + script đo):** `GENSET_TABLES` (46 bảng soát tay, mỗi mục khoá NCC + n + tiêu đề nguyên văn) + `gensetsOf` + `builder().gensets` + `unread` tính bảng đã dùng. Sửa / chặn số sai ở 1.4 trong phạm vi bảng của danh sách: googol cột "Engine (Output Power)" không là công suất tổ máy (hoặc để trống công suất 18 dòng), "Continuous" không là mức (11 dòng để trống mức hay bỏ: Khoa chọn), loại 33 dòng động cơ yingtai n109 và 13 dòng kích thước acepow, teksan cột "Hz" / "Voltage" đọc thành tần số / điện áp CHỈ ở bảng trong danh sách, teksan "TBA / N/A / 0" ở Prime thì cột kia là standby (theo tiêu đề "Standby (ESP)"). 4 bảng X và 3 bảng O KHÔNG đưa vào.
   Kiểm: test `suppliers/catalog-c.test.mjs` lấy dòng thật (mỗi NCC ≥ 1 dòng + các ca lỗi ở 1.4); `spec-diff git:<gốc> .` phải ra 0 thay đổi bản ghi động cơ / đầu phát (hàm riêng) — nếu thêm `gensetsOf` vào spec-diff thì in đủ mọi bản ghi tổ máy mới để soát; md5 JSON `build()` phần `engines / alternators / controllers` y gốc (web/CLAUDE.md); `quality --check` không xấu đi; `unread-tables` giảm đúng 46 bảng; soát MỌI ~1.700 bản ghi tổ máy cạnh dòng nguồn (script in model / công suất / tần số / hãng / thông số cạnh chữ dòng; kiểm tự động kW/kVA 0,75–0,86, prime ≤ standby, mỗi số có trong chữ dòng).
   Đo top 30 (điều phối, cloud): `do-gop.mjs` gốc ↔ nhánh, chung bidhist + cn; kỳ vọng 0 lượt đổi (`candidates` không đọc `gensets`) — đây là phép kiểm "không rò rỉ".
2. **PR 2 — web hiển thị (`web/index.html`):** mục "Tổ máy (bảng không ghi mã động cơ)" trong `supModelsHtml` (model, công suất prime / standby, tần số, hãng động cơ nếu bảng ghi, số dòng); tuỳ chọn tab "Tổ máy" ở danh mục. Thử bằng UI thật (`web/test/serve.mjs`), Playwright.
3. **PR 3 — config-bot (CHỈ khi Khoa chọn phương án 2):** ứng viên tổ máy trong `candidates` + điều kiện `hints`, `rowKey` vai "genset" cho `blocked`, prompt + `check` cho cấu hình không model động cơ, test `cand-genset.test.mjs`. Đo top 30 cloud: liệt kê MỌI dòng tổ máy vào / ra top ở MỌI lượt kèm lý do (như bảng lớp A–F của R1-1), điều phối soát.
4. Việc riêng đề xuất (không tự mở): 4 bảng X (green-power ×3, lees-power: mã động cơ có dấu cách / ngoặc "(E)" / "(M)" không thành mã, 67 dòng); 20 bảng đầu phát rời + 9 bảng động cơ rời của nhóm G (bản ghi đầu phát / động cơ không tổ máy: cũng là loại bản ghi mới, ~790 dòng); 2.605 dòng tổ máy không động cơ ngoài R1-G (mục 1.5, gắn với việc (D)).

## 5. Rủi ro còn lại / việc chưa kiểm

1. Hãng ở tên trang bị cắt (`titleHead`): interpower "Baudouin engine" không thành hãng. Không sửa trong PR 1 (đổi `titleHead` đụng mọi bảng đang đọc).
2. Hãng không có trong `ENGINE_BRANDS` (teksan ERIN, YAVUZ MOTOR, FORD, PSI: 35 dòng) để trống hãng.
3. Nhiên liệu: catalog chưa có trường. PR 1 có thể ghi `fuel` chỉ từ chữ tên bảng / tiêu đề ("Natural Gas Generators", "Biogas", "燃气", "沼气", "Gasoline") — CẦN Khoa duyệt (là trường mới, cũng dùng được cho bảng động cơ khí đang đọc).
4. Chưa đo: top 30 (cần code), hints của các lượt (phương án 2 / 3).
5. Số đo tính trên `main` abb28c67; PR B3 (zhengchi) merge xong phải chạy lại `do-to-may.mjs` (phần zhengchi không thuộc 82 bảng, kỳ vọng không đổi số ở đây).

## 6. Tệp

`genbid-work\dieu-phoi\dau-vao\catalog-c\`: `do-to-may.mjs <repo> hits.json` (gắn vết, ~50 s; `hits.json` 5 MB không lưu vào sổ, chạy lại để có), `phan-tich.mjs hits.json <chan-doan-nhanh-con-lai.tsv>` (bảng theo lớp → `bang-phan-loai.tsv`), `dem-g.mjs` (nhãn soát tay 82 bảng + đếm, cần `hits.json` cùng thư mục → `t-rows.json`: MỌI 1.753 dòng T với công suất / thông số / hãng đọc được), `soat-cs.mjs` (soát công suất), `luat-bang.mjs hits.json` (thử luật chọn bảng → `luat-bang-ngoai-r1g.tsv`).

## Cần ghi nhớ

- Việc (C) bước 1 xong 20/11/2026; chờ Khoa chọn phương án nối Gợi ý (1 / 2 / 3) + ba câu ở mục 3 + trường nhiên liệu (5.3). PR 1 chờ PR B3 (zhengchi) merge vì cùng `web/catalog.js`.
- Đề xuất việc riêng: 4 bảng X (mã động cơ có dấu cách / ngoặc không đọc, 67 dòng); bản ghi đầu phát / động cơ rời của nhóm G (29 bảng, ~790 dòng); 2.605 dòng tổ máy không động cơ ngoài R1-G.
