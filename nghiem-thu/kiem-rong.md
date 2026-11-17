# Kiểm rộng `candidates()` sau #555 / #556 / #557

Chỉ kiểm, không sửa mã, không mở PR, không chạy agent, không `post()`, không đọc/ghi Supabase, không đụng token. Mã đọc từ checkout chính `C:\Projects\GenSet Pro\GenSet-Pro` (main ff2efb0, không đổi nhánh, không sửa tệp ở đó). **Lưu ý: toàn bộ số đo chạy trên mã ff2efb0 (có #555/#556/#557, chưa có #561); lúc xong báo cáo main đã sang 87dda3d (#561 "Ngưỡng HSMT theo từng cỡ máy"), nên N3 và mục 8 có thể đã đổi: chạy lại `setup-old.mjs`, `thr.mjs`, `runall.mjs` để đo lại.** Script và kết quả nằm ở `C:\Projects\GenSet Pro\genbid-work\dieu-phoi\kiem-rong\` (ngoài git). Mọi con số dưới đây là đầu ra của script trong thư mục đó, trừ chỗ ghi "mắt" (soát tay).

## Tóm tắt

1. **Phạm vi**: 1.162 gói / 1.539 lượt (gói × cỡ) / 219 cỡ khác nhau (0,5 kVA đến 375.000 kVA, trung vị 150 kVA; 376 lượt ≤20 kVA, 172 lượt >1000 kVA); 243 gói nhiều cỡ (620 lượt cỡ), 919 gói một cỡ; 101 lượt đòi đồng bộ thương hiệu; 1.311 lượt không đòi G7/G20, 228 lượt G7/G20 (kể cả EU); 95 gói không đọc được cỡ (bỏ). Đối chiếu: 13 lượt của 12 gói doc-cache cho đúng số của phiên trước (2.925→1.810, loại 173/0/2/499, tổng Prime 3.146, dung tích 1.430).
2. **Bất biến: 0 lỗi.** Mọi dòng trong top có công suất trong 99,5–120%, không dòng `ruled` nào ngoài `named`, không trùng dòng, không quá 30, đúng tần số. Trần 10/hãng bị vượt ở 19 lượt, tất cả giải thích được (13 lượt `sync` có ≤6 dòng miễn trần, trong đó 2 lượt cũng có `keep`; 2 lượt chỉ có `keep`; 4 lượt hết hãng khác nên lấp `free`); giới hạn 3/động cơ và 4/NCC bị vượt (22 chỗ) chỉ ở 7 gói có `keep` từ configmatch.
3. **Thiếu ứng viên**: 56 cỡ có ứng viên ở dải cũ 95–140% mà dải mới (sau loại theo ngưỡng) còn <5 dòng; 44 cỡ do chính dải (40 cỡ ≤20 kVA; ví dụ 6 kVA: 0 dòng, dòng gần nhất ở 91,7% và 125%; 12 kVA: 7→4 dòng), 12 cỡ do ngưỡng. 25 cỡ top=0, trong đó 16 là công suất đọc sai (32–356 MW), 9 thật (0,5 kVA, 6 kVA, 4.000 kVA, 7.500×3 và 10.000 kVA ngoài catalog, 2 gói 2400 kW đòi prime ≥2400 kW). Dải mới giữ trung vị 59% số dòng của dải cũ.
4. **Ngưỡng đọc từ HSMT**: soát 78 ca (đã chọn thiên về gói nhiều cỡ / ngưỡng bất thường): đúng 59 (76%), sai 10 (13%), không chắc 9 (12%).
5. **Loại oan có hệ thống ở ngưỡng, không phải ở dải** (nghiêm trọng): (a) `< N lít` đọc thành TỐI THIỂU (3 gói); (b) dung tích làm mát / nước đọc thành dung tích xi lanh (3 gói, 80% dòng của cỡ bị loại); (c) gói nhiều cỡ: ngưỡng của cỡ này áp cho cỡ khác (≥4 gói). Cùng các lỗi ngưỡng khác (dung tích >100 L chia 1000, minPrime đọc số Standby), tính lại với ngưỡng sửa tay thì lấy lại được khoảng 4.060 dòng oan (2,4% tổng 170.968 dòng bị loại) tập trung ở ~21 gói (1,8% số gói).
6. **Tỉ lệ loại oan trong mẫu 90 dòng bị loại** (rải 52 gói, đủ 4 loại): đúng 81 (90%), oan 6 (6,7%), không chắc 3 (3,3%). Theo loại: Prime 0 oan/49, dung tích tối đa 0/12, xi lanh 1 oan/25, dung tích tối thiểu 5 oan/35. Prime: dòng chỉ ghi một công suất không rõ Prime/Standby KHÔNG bị coi là Prime (xem mục 5).
7. **Hồi quy configmatch**: 54 cấu hình đang hiển thị ở 13 cỡ: 42 còn dòng trong top, 6 rơi vì ra ngoài dải (mọi dòng ≥125% prime), 3 không có dòng NCC / 3 không có động cơ trong catalog (như trước); **0 rơi vì ngưỡng**.
8. **Tìm NCC**: trên 12 NCC / 4 gói của findmatch không có khác biệt; trên cả 432 hồ sơ × 219 cỡ: `fitsCap` 21.328 → 20.732 (−2,8%), NCC có dòng bảng trong dải 15.229 (100–140%) → 13.934 (−8,5%); không cỡ nào mất hết NCC.
9. **Gói nhiều cỡ**: 243 gói; 203 lượt cỡ (89 gói) có ít nhất một ngưỡng null vì HSMT ghi nhiều giá trị (minPrime 181, dung tích tối thiểu 67, xi lanh 64, dung tích tối đa 10); 30 gói >4 cỡ chỉ chạy 4 cỡ đầu.
10. **Lỗi theo mức nghiêm trọng**: NGHIÊM TRỌNG 4 (`<` đọc là tối thiểu; dung tích làm mát đọc là dung tích xi lanh; ngưỡng của cỡ khác; dải hẹp cho máy ≤20 kVA). TRUNG BÌNH 6 (dung tích >100 L chia 1000; minPrime đọc số Standby; minPrime lấy từ đầu phát; NFD; văn bản thiết bị khác; một nguồn sai làm loại oan). THẤP 5. Chi tiết ở mục 9.

Phụ lục (cùng thư mục): `out/phu-luc-A.md` (78 ca ngưỡng, nguyên văn HSMT), `out/phu-luc-B.md` (90 dòng bị loại, nguyên dòng bảng + supplierId#n), `out/phu-luc-C.md` (cỡ thiếu ứng viên), `out/phu-luc-D.md` (vi phạm trần), `out/phu-luc-E.md` (gói nhiều cỡ). Đường dẫn đầy đủ: `C:\Projects\GenSet Pro\genbid-work\dieu-phoi\kiem-rong\out\`.

---

## 0. Nguồn dữ liệu và cách đo

Máy này không có tệp `hsmttext` nào trong doc-cache (doc-cache chỉ có analysis, bidhist, configmatch, configreq, findmatch, supplier). Nguồn văn bản HSMT dùng được:

| nguồn | số gói dùng | ghi chú |
|---|---|---|
| `dieu-phoi\kiem-rong\data\hsmt-*.json` (bản sao từ scratchpad phiên `mins-size`/`cand-filter`) | 12 | văn bản HSMT thật của 12 gói configmatch (đúng thứ `prep` đọc từ web: `parts` + thông báo mời thầu) |
| `data\hc\*.json` (bản sao; phiên `mins-size` đã GET chỉ đọc) | 241 (trên 243 gói nhiều cỡ; 2 gói không có phân tích) | văn bản HSMT đầy đủ của các gói `sizesOf` ra ≥2 cỡ |
| `genbid-work\specs\*\text.txt` (đọc chương V kỹ thuật, 1.499 thư mục) | 1.004 | chỉ lấy gói có phân tích trong `doc-cache\analysis.json`; 256 thư mục thiếu phân tích bị bỏ; 239 trùng với nguồn trên thì lấy nguồn đầy đủ |
| `doc-cache\analysis.json` | 1.287 phân tích | cho `bidName`, `generatorCapacity`, `technicalSpecs` (tính cỡ như `prep`/`runAll`) |
| `doc-cache\supplier.json` (12/11 10:14) | 432 hồ sơ NCC (bỏ `status: incomplete`) | `CAT.build` như `prep` (`GENBID_LOCAL_SUPPLIERS` không dùng) |
| `doc-cache\configmatch.json`, `findmatch.json`, `configreq.json` | 12 / 4 / 12 gói | mục 6, 7, `keep` |

Không tìm thấy "bản quét ~390 HSMT ngày 03/11" dưới dạng tệp văn bản (chỉ còn trong chú thích mã config-bot.mjs "2026-11-03 scan of 390 HSMT"); `hsmt-inbox` có 32 thư mục tệp `.doc` gốc, không dùng. Nên tập đo thực tế là 12 + 241 + 1.004 = 1.257 gói có văn bản và phân tích, trong đó 1.162 đọc được cỡ.

Cách chạy: `lib.mjs` nạp mã thật (`config-bot.mjs` của checkout chính) và dựng `prep()` thu nhỏ: `hintsOf(text)`, `originOfHsmt(parts)`, `BP.brandSyncOf`, `partsOnlyOf`, `groupSuppliers`, `byOrigin`, `modelFacts`, rồi `candidates(cat, cap, hints, {suppliers, origin, cn, sync, keep, facts})`; cỡ từ `sizesOf` (gói ≥2 cỡ, tối đa `MAX_SIZES=4`) hoặc `capacity()`. Bản "dải cũ" là bản sao `old\config-bot-oldband.mjs` chỉ đổi `NEAR_LOW=0.95, NEAR_HIGH=1.4` (mọi thứ khác y nguyên, gồm loại theo ngưỡng và trần hãng, nên so sánh chỉ khác dải). Bản `old\config-bot-instr.mjs` (dải hiện tại) chỉ thêm ghi lại giá trị thô và dòng nguồn của `engineMins`/`powerMins`; 0 khác biệt với `hintsOf` thật trên mọi lượt. `keep` chỉ có ở 12 gói có configmatch (như lượt thật); các gói khác không có lượt trước.

Khác lượt thật: `bidName` lấy từ `analysis.keyInfo.bidName` (lượt thật lấy từ `configreq.bidName`, thường giống); `reqData.extra` (Yêu cầu khác) để trống; `focus` null.

---

## 1. Bao phủ

| chỉ số | giá trị |
|---|---|
| gói có văn bản + phân tích / chạy được | 1.257 / 1.162 (95 gói không đọc được cỡ) |
| lượt (gói × cỡ) | 1.539 (full12 13, hc243 616, specs 910) |
| gói một cỡ / nhiều cỡ | 919 / 243 (620 lượt cỡ; 2 cỡ 156 gói, 3 cỡ 40, 4 cỡ 17, ≥5 cỡ 30 gói, chỉ 4 cỡ đầu chạy) |
| cỡ khác nhau | 219 (đơn vị kW: 99 lượt) |
| phân bố cỡ quy kVA | ≤20: 376; 21–60: 188; 61–150: 242; 151–400: 336; 401–1000: 225; >1000: 172 (trung vị 150, p10 10, p90 1.265) |
| nhóm xuất xứ | không đòi (`all`) 1.311; G7 109; G7+EU 87; G20 24; G20+EU 8 (trong đó `partsOnly` 49, `brand` 14) |
| đồng bộ thương hiệu | có 101, không 1.438 |
| HSMT nêu hãng/model động cơ | 554 lượt (trần hãng tắt); trần hãng bật (`capOn`) 973 lượt |
| tần số HSMT | 50 Hz 961, 60 Hz 8, không nêu 570 |
| có ngưỡng đọc được (sau `plausible`) | 749 lượt: dung tích tối thiểu 267, tối đa 46, xi lanh 409, Prime 519 |
| lượt có dòng bị loại | 664 lượt / 622 gói; tổng 170.968 dòng (12,6% số dòng trong dải) |

Hạn chế bao phủ: 71% lượt là gói cũ (IB22…–IB25…) lấy từ `specs` chỉ có chương kỹ thuật; 12 gói mới (IB2600…) là văn bản HSMT đầy đủ. Số lượt cỡ lớn (>2.000 kVA) và cỡ lẻ (kW, MW) ít.

---

## 2. Bất biến trên mọi cỡ

Tất cả đo trên `top` (30 dòng) và `rows` (mọi dòng còn xếp hạng) của từng lượt (script: `runall.mjs`).

| bất biến | vi phạm |
|---|---|
| mọi dòng top có công suất (một trong prime/standby/rated, đơn vị của cỡ) trong [99,5%, 120%] | **0** (cả `top` và `rows`) |
| không dòng nào có `ruled` trừ `named` (trong `top` và `rows`) | **0** |
| không trùng `choiceKey` (NCC + động cơ + đầu phát), không trùng đối tượng | **0** |
| top ≤ 30; tần số dòng khớp `hints.freq` | **0** |
| trần 10 dòng / hãng khi HSMT không nêu hãng/model | 19 lượt vượt, **0 chưa giải thích** (phụ lục D): 13 lượt `sync` (dòng giữ chỗ cho hãng tổ máy được miễn trần, vượt n−10 ≤ 6; 2 trong số này cũng có `keep`), 2 lượt chỉ có `keep` (cấu hình lượt trước, thiết kế cho phép), 4 lượt hết hãng khác (`otherLeft=0`: máy 5 kW hãng "?" 13, 8,5 kVA Yanmar 11… lấp `free`) |
| ≤3 dòng/động cơ, ≤4 dòng/NCC | 22 vi phạm, tất cả ở 7 gói có `keep` từ configmatch (thiết kế: `keep` không bị hai giới hạn này chặn) |
| trần hãng bật mà top <30 | 160/973 lượt (hết dòng sau các giới hạn, không phải lỗi) |

Trong 288/566 lượt HSMT nêu hãng/model, một hãng chiếm >10 dòng (đúng: trần tắt).

---

## 3. Cỡ thiếu ứng viên (dải 99,5–120% so với dải cũ 95–140%)

Đếm số dòng của mỗi lượt (bin 0 / 1–9 / 10–29 / ≥30):

| chỉ số | 0 | 1–9 | 10–29 | ≥30 |
|---|---|---|---|---|
| dòng trong dải cũ 95–140% (trước khi loại ngưỡng) | 22 | 67 | 68 | 1.382 |
| dòng trong dải mới 99,5–120% (trước khi loại ngưỡng) | 23 | 90 | 108 | 1.318 |
| dòng còn xếp hạng sau khi loại ngưỡng (dải mới) | 25 | 101 | 109 | 1.304 |
| số dòng trong top (≤30) | 25 | 182 | 67 | 1.265 |

(top <30 còn vì giới hạn 3/động cơ, 4/NCC chứ không chỉ vì thiếu dòng; trong 303 lượt chạy đầy đủ dải cũ để so, top <30: dải cũ 232, dải mới 274.)

Dải mới giữ trung vị 59% số dòng của dải cũ (p10 50%, p90 77%); tổng dòng trong dải 2.263.610 → 1.352.889 → 1.181.921 sau loại ngưỡng. 26 lượt giữ <30% (phụ lục C3).

**Rủi ro lớn nhất (cỡ có ứng viên ở dải cũ mà dải mới <5 dòng): 56 lượt** (bảng đầy đủ: `phu-luc-C.md` C1):
- 44 do chính dải (mới <5 dòng trong dải): 40 là máy ≤20 kVA, 1 máy 23 kVA, 3 máy ≥101 kVA. Dòng gần nhất thường nằm ở ~92–97% (dưới dải) và 122,5–130% (trên dải). Máy nhỏ rơi vì catalog có bước cỡ thô (8,5 → 10 → 12 → 15 kVA): tender 12 kVA nhận 4 dòng (12 – 14,4 kVA), bỏ dòng 11 kVA (91,7%) và 15 kVA (125%). Cỡ ≤20 kVA: dải cũ có 61 lượt <10 dòng, dải mới 72.
- 12 do ngưỡng (≥5 dòng trong dải rồi bị loại): 12 kVA/12,5 kVA nhiều gói (`minDisp 2,3 L` loại 5 dòng, `minPrime 12 kVA` loại dòng prime 11 kVA), 1000 kVA (xi lanh ≥12 loại 4, prime 2), 800 kVA, 2 gói 2400 kW.
- Ví dụ nặng nhất: IB2400186078 (6 kVA, 2 cỡ): dải cũ 1 dòng, dải mới 0 (5,5 kVA ở 91,7%, 7,5 kVA ở 125%); IB2200066148 / IB2200006257 / IB2300150966 (3 kVA): 39 dòng → 1 (dòng gần nhất 90% và 125%).

**Cỡ top = 0 (25 lượt, phụ lục C2)**: 16 lượt (14 gói) là cỡ >20.000 kVA do `capacity()` đọc công suất trạm/nhà máy (32–356 MW) làm cỡ máy (không liên quan dải, nhưng agent nhận danh mục rỗng); 4 lượt 7.500–10.000 kVA không có dòng nào trong dải (dòng gần nhất ở 67% và 169–225%); IB2600325773 (4000 kVA, dòng gần nhất 77%) và IB2400121273 (0,5 kVA): catalog không có; IB2400186078 (6 kVA); IB2600304011 và IB2600126365 (2400 kW, HSMT đòi prime ≥2400 kW; 2 dòng trong dải, cả hai prime ~2240 kW nên bị loại đúng theo HSMT). Trong 9 cỡ thật, chỉ IB2400186078 (6 kVA) mất ứng viên chính vì dải hẹp; các cỡ còn lại catalog không có dòng ở bất kỳ dải nào (hoặc, 2 gói 2400 kW, HSMT đòi cao hơn mọi dòng có).

Dòng sát biên: cận dưới 0,995 loại dòng ở 97,2%–99% (IB2400475109 và IB2400446772: 1000 kVA, dòng 990 kVA ở 99,0%; IB2500381511: 2573 kVA, dòng ở 97,2%). Đây là thiết kế (dung sai làm tròn 0,5%), ghi lại để biết.

---

## 4. Ngưỡng đọc từ HSMT (78 ca; phụ lục A)

Phân loại 78 ca: **đúng 59, sai 10, không chắc 9**. Mỗi ca ghi ngưỡng, nguyên văn dòng HSMT mã đã dùng (ô nguồn `engineMins`; Prime thì dòng tìm bằng regex ngoài mã), kết luận và lý do ở `phu-luc-A.md`.

**Sai (10 ca, 8 kiểu)**: #19/#20 (`Dung tích xi lanh < 20 lít` thành tối thiểu 20 L), #37 (`Tổng dung tích làm mát: ≥ 22L` thành dung tích xi lanh), #22/#30 (ngưỡng của cỡ khác trong gói nhiều cỡ: 5 kW nhận 1,758 L của 15 kVA; 30 kVA nhận tối đa 1,826 L của 12 kVA), #62 (minPrime 42 kVA lấy từ phần đầu phát cho máy 40 kVA), #66 (`≥ 4/3318cm3` là của xe nâng trong gói có cầu trục, xe nâng), #11/#12/#52 (`4 xi lanh` là số thứ tự dòng bảng; `Dung tích ≥ 2.000 lít` là bồn nhiên liệu; vô hại).

**Không chắc (9 ca)**: #1/#73 (gói 550 kVA + 2500 kVA, mỗi cỡ nhận cả hai ngưỡng, may vô hại), #24 (50 vs 60 kVA), #64 (cỡ 800 mà prime ≥750), và 5 ca "con số trần = tối thiểu" (`Dung tích xi lanh 60,2 lít`, `5.9 lít`, `7.01 lít`, `21.927 L`, `Số xylanh 06 xylanh` không dấu so sánh): theo quy tắc của Khoa đây là tối thiểu, nhưng HSMT viết quanh một động cơ cụ thể và loại cả động cơ nhỏ hơn hợp lệ (ví dụ 5.9 L loại Baudouin 4,087 L cho máy 110 kVA).

**Đúng điển hình**: `Dung tích xi lanh ≥ 2,3 lít`; `≥ 3318cm3` thành 3,318 L; `720 cc` thành 0,72 L; `Dung tích động cơ Tối thiểu 21.900 cm3` thành 21,9 L; `Công suất liên tục: > 230/312.5` thành {230 kW, 312,5 kVA}; `Công suất liên tục (Prime): 600 kW / 750 kVA` thành 750 kVA; `Số xy lanh ≤6` không bị đọc thành tối thiểu.

Quét tự động rộng hơn 78 ca (cùng 1.539 lượt, `defects.mjs`):
- `< N` đọc là tối thiểu: 4 lượt / 3 gói (IB2300260615, IB2400564384: `Dung tích xi lanh < 20 lít`; IB2500360231: `< 78 lit`).
- dung tích làm mát / buồng đốt không loại: `Tổng dung tích làm mát ≥ 55L` (IB2300031444), `≥ 22L` (IB2300214975), `Dung tích làm mát: ≥ 42L` (IB2500314401): 3 gói; `Dung tích buồng đốt` 2 gói (có thể là dung tích xi lanh, đúng).
- bồn nhiên liệu `Dung tích ≥ 2.000 lít` đọc thành 2 L: IB2500110812, IB2500110816 (vô hại).
- số thứ tự dòng đọc thành số xi lanh (`4 xi lanh, tổng dung tích CB`…): 5 lượt / 4 gói (IB2300129273 ×2 cỡ, IB2500110812, IB2500110816, IB2300363513): vô hại (giá trị 2–4). 7 lượt còn lại của kiểu dòng `N xy lanh, …` là yêu cầu thật (`6 xy lanh, xếp thẳng`, `12 xilanh, bố trí hình V`).
- Unicode NFD: 384/1.257 gói có dấu tổ hợp (U+0300–036F); chuẩn hoá NFC cho thấy 9 ngưỡng đổi: 6 bị bỏ sót và 3 sai hẳn (xem mục 9).
- `plausible()` cắt: minDisp 7 lượt, maxDisp 4, minCyl 1, minPrime 11.

---

## 5. Loại oan (90 dòng bị loại; phụ lục B)

Tổng: 170.968 dòng bị loại: dung tích tối thiểu 59.789, dung tích tối đa 6.562, xi lanh 42.437, Prime 91.593 (một dòng có thể có hai lý do: 27.307 dòng). Prime chiếm 54%.

**Mẫu 90 dòng, 52 gói** (mỗi loại `ruled` ≥12 dòng; không có dòng của gói `named`): **đúng 81 (90%), oan 6 (6,7%), không chắc 3 (3,3%)**. Theo loại lý do: Prime 49 dòng, 0 oan; dung tích tối đa 12, 0 oan; xi lanh 25, 1 oan; dung tích tối thiểu 35, 5 oan, 3 không chắc.

**6 ca oan (mỗi ca có nguyên dòng ở phụ lục B)**:
- M19, M88, M89 (IB2300363623, cỡ 5 kW): động cơ 0,418–0,456 L đúng cỡ 5 kW bị loại vì `minDisp 1,758 L` của hạng mục 15 kVA.
- M20 (IB2300260615, cỡ 500 kVA): Deutz BF8M1015CP-LA G4 15,87 L, đúng HSMT (`< 20 lít` = tối đa), bị loại vì đọc thành tối thiểu 20 L.
- M21 (IB2500110816, 2400 kW): Yuchai YC16VC3600-D31 dung tích 105,56 L bị mã đọc thành 0,10556 L (n >100 mặc định là cc), cộng `minDisp 2` là bồn nhiên liệu.
- M35 (IB2400249622, 160 kVA): FAWDE CA6DL1-24D bị loại vì nguồn duy nhất ghi số xi lanh ("4 L") cho động cơ 6 xi lanh 7,7 L. Dữ liệu NCC sai; mã loại vì "mọi nguồn có số đều dưới ngưỡng" mà chỉ có một nguồn.

**Soát Prime (điều bạn hỏi)**: dòng chỉ ghi MỘT công suất không rõ Prime/Standby không bị coi là Prime. `candidates()` chỉ so với `u.power.prime`; `web/catalog.js` gán `prime` chỉ khi nhãn có prime/PRP/continuous/COP/liên tục/主用/常用 (dòng 315), còn lại là `rated`, và `lowPrime` bỏ qua `rated`. Trong 91.593 dòng bị loại vì Prime: 87.267 có cả standby+prime, 2.993 prime+standby, 1.078 prime+standby+rated, 80 prime+rated, và chỉ 175 chỉ có `prime`. Trong tập 2.962 mẫu "dòng prime không có chữ prime ở đầu bảng/dòng" (`unl.mjs`), 1.441 mang nhãn `rated/额定/cơ bản` (quy ước ≈ prime), còn 77 (chỉ một NCC: xingguang-jiangsu, đầu bảng `主 / 备用` và hai cặp `600/725 | 660/825`) gán theo quy ước "hai cặp, cặp lớn là dự phòng": các dòng đọc đúng. 49/49 dòng Prime trong mẫu loại đúng, kể cả 5 dòng nhãn `额定功率 / 备用功率` hay `Rated / Standby`.

Lỗi gần Prime tìm thấy: minPrime đọc số Standby (IB2200021335, IB2200075147: `163kVA liên tục Prime/180kVA dự phòng Standby` thành 180 kVA), và minPrime lấy từ đầu phát (mục 9).

**Mắt: mẫu không tính trọng số**; tỉ lệ 6,7% là của mẫu, tỉ lệ thật theo dòng thấp hơn (lỗi đều dồn ở ~20 gói): xem mục 9, tổng dòng oan đã định lượng ≈3.950 / 170.968 = 2,3%.

---

## 6. Hồi quy trên configmatch (54 cấu hình đang hiển thị)

Cách: với 12 gói / 14 cỡ trong `configmatch.json`, chạy `candidates` (có `keep`) rồi phân loại từng cấu hình (động cơ × NCC của cấu hình) theo `top` / còn dòng nhưng ngoài 30 / bị loại theo ngưỡng / ngoài dải / không có dòng của NCC đó / không có động cơ (`reg.mjs`, `out/reg.json`).

| trạng thái | dải mới | dải cũ |
|---|---|---|
| trong top | 42 | 48 |
| ngoài 30 nhưng còn dòng | 0 | 0 |
| **loại theo ngưỡng HSMT** | **0** | 0 |
| **ngoài dải công suất** | **6** | 0 |
| NCC của cấu hình không có dòng trong catalog | 3 | 3 |
| không có động cơ trong catalog | 3 | 3 |

6 cấu hình rơi vì dải (tỉ lệ công suất của dòng nhỏ nhất của NCC so với cỡ; mỗi số là prime, standby):
- IB2600581977 250 kVA hạng 1 Volvo Penta TAD1351GE (dingbo, jet-power, rise-power): 125–136% (hạng 1 mất, đây là cấu hình tốt nhất của gói);
- IB2600581977 250 kVA hạng 3 Weichai WP12D317E200 (bobig, jet-power, longkai-power): 125–138%;
- IB2600581977 250 kVA hạng 5 Volvo Penta TAD1352GE: 130–175%;
- IB2600586587 160 kVA hạng 1 Perkins 1106A-70TAG4 (hosem, tecgen, uleengen): 125% (200 kVA), 137,5%;
- IB2600592684 30 kVA hạng 4 Cummins 4BT3.9-G2 (aosif, fdk-energy, dingbo): 125–167%;
- IB2600592684 30 kVA hạng 5 Cummins QSB3.9-G33: 123–227%.
Tất cả khớp danh sách của phiên `cand-filter`. Cấu hình rơi vì ngưỡng: 0 nên không có ca nào để soát tay theo mục 5. Lưu ý: `keep` không cứu được cấu hình ngoài dải vì `keep` chỉ chọn trong `rows` (đã qua dải và ngưỡng).

---

## 7. Tìm NCC (`fitsCap`, `engineRows`, #557)

- 4 gói trong findmatch.json (12 NCC đã thêm): `fitsCap` cũ 12/12, mới 12/12; có dòng bảng ở dải 95–140%: 6, 100–140%: 6, mới 99,5–120%: 6; không NCC nào đổi (haut-power, bdadl-shanghai, xinzhengfa, cummins-inc, ade-power, younes-bros giữ dòng; 6 NCC còn lại không có dòng bảng ở bất kỳ dải nào). Cỡ 400 kVA của IB2600594596: fits 1/3 như cũ.
- Quy mô rộng (`find2.mjs`): với 219 cỡ khác nhau × 432 hồ sơ NCC: `fitsCap` cũ 21.328, mới 20.732 (−2,8%); NCC có dòng bảng trong dải: 95–140% 15.420, 100–140% (dải cũ của `engineRows`) 15.229, mới 13.934 (−8,5% so với 100–140%). **0 cỡ có NCC có dòng bảng ở 100–140% mà mới = 0; 0 cỡ có `fitsCap` cũ>0 mà mới = 0.** Cỡ mới có <3 NCC có dòng bảng: 13/219 (cỡ rất nhỏ hoặc rất lớn).
- Hạn chế: findmatch.json chỉ có 4 gói; không chạy `mergeFind` / `keepFound` (cần bản ghi thật).

---

## 8. Gói nhiều cỡ

243 gói, 620 lượt cỡ (30 gói có >4 cỡ chỉ chạy 4 cỡ đầu: các cỡ sau không có lượt gợi ý). `engineMins`/`powerMins` đọc trên toàn văn nên hai giá trị khác nhau cho một ngưỡng thì trả null cho mọi cỡ (danh sách đủ ở `phu-luc-E.md`).

- **Cỡ nhận ngưỡng null vì các cỡ khác ngưỡng: 203 lượt cỡ / 89 gói** (có ít nhất một ngưỡng null): minPrime 181 lượt, dung tích tối thiểu 67, xi lanh 64, dung tích tối đa 10.
- **Cỡ nhận ngưỡng của cỡ khác (không phải null mà là sai)**: phát hiện bằng mâu thuẫn trong văn bản rồi chạy lại với ngưỡng sửa tay (`quant.mjs`, `quant2.mjs`):
  - IB2400311120 (12/30/45 kVA): maxDisp 1,826 L (của máy 12 kVA) áp cho cả cỡ 30 và 45 kVA: cỡ 30 kVA bị loại 490 dòng, còn 155 dòng xếp hạng (đúng ra 453), top là Hyundai DM01VP, Yuchai YCV2.5T45… (≤1,8 L); cỡ 45 kVA bị loại 461 dòng (lấy lại 15 dòng; còn lại bị loại theo minDisp 4,5 L đúng).
  - IB2400487460 (8,8 / 40 kVA): cỡ 8,8 kVA nhận minDisp 3,9 L của máy 40 kVA: loại 119 dòng, còn 41 dòng (đúng ra 157): 93 dòng oan.
  - IB2300363623 (15 kVA và 5 kW): cỡ 5 kW nhận minDisp 1,758 L của 15 kVA: 13 dòng oan (còn 24 / đúng ra 37).
  - IB2400114476 (12 / 45 kVA): cả hai cỡ nhận minDisp 4,5 và maxDisp 1,826; `plausible()` cắt đúng mỗi cỡ (4,5 > max(4, 0,15×kVA) cho 12 kVA; maxDisp < minDisp cho 45 kVA). Đúng, nhờ `plausible()`, nhưng chỉ nhờ may.
  - IB2500039578 (550 / 2500 kVA): minDisp 13 L và maxDisp 60,2 L áp cho cả hai cỡ (vô hại).
  - IB2400030247 (50 kVA + …): minPrime 60 kVA cho cỡ 50 kVA (HSMT ghi 50 và 60): nếu thật là 50 thì loại oan 247 dòng.
  Quét heuristic chỉ phát hiện được trường hợp mâu thuẫn; ngưỡng đơn trị của cỡ khác không mâu thuẫn với gì thì không phát hiện được bằng script này.

---

## 9. Danh sách lỗi theo mức nghiêm trọng

Ghi mã đã đổi chỗ nào: `suppliers/config-bot.mjs` (`engineMins`, `powerMins`, `plausible`, `litres`, `candidates`) trừ chỗ ghi khác.

### NGHIÊM TRỌNG

**N1. `Dung tích xi lanh < N lít` bị đọc thành TỐI THIỂU N L.** `engineMins` có `MAXIMUM = ≤|<=|tối đa|không lớn hơn` (không có `<`) và `dl` coi con số trần sau `dung tích xi lanh` là tối thiểu. 3 gói / 4 cỡ: IB2300260615 (500 và 2000 kVA), IB2400564384 (500 kVA), IB2500360231 (2500 kVA, `< 78 lit`). Định lượng (chạy lại với maxDisp thay minDisp): IB2300260615 cỡ 500 kVA: loại 1.167 dòng, còn 599; đúng ra còn 1.594 (858 dòng oan), top đổi từ toàn KTA19 sang Volvo/Yuchai/Perkins; IB2400564384: 645 dòng oan; IB2500360231: 1 dòng.

**N2. Dung tích làm mát / nước bị đọc thành dung tích xi lanh.** `TANK_W` không có `làm mát`; HSMT có dòng `Tổng dung tích làm mát: ≥ 22L` thì `minDisp = 22` (cùng cơ chế với bồn nhiên liệu khi nhãn ở dòng khác). 3 gói: IB2300214975 (300 kVA, 22 L: 608 dòng oan, loại 82% số dòng trong dải), IB2500314401 (350 kVA, 42 L: loại 1.532 / 1.870 dòng; sửa được 119 dòng, phần còn lại là maxDisp thật), IB2300031444 (500 kVA, 55 L: 779 dòng oan). Hai trong ba gói còn bị Unicode NFD làm bỏ sót dòng dung tích xi lanh thật (xem M4), nên ngưỡng này không bị hai giá trị mâu thuẫn triệt tiêu.

**N3. Gói nhiều cỡ: ngưỡng của cỡ này áp cho cỡ khác** (mục 8): IB2400311120 (cỡ 30, 45 kVA), IB2400487460 (cỡ 8,8 kVA), IB2300363623 (cỡ 5 kW); ≥ 205 + 15 + 93 + 13 = 326 dòng oan, top của cỡ 30 kVA toàn động cơ ≤1,8 L. (Phiên khác đang sửa việc này; nêu để đối chiếu: cả trường hợp ngưỡng đơn trị của cỡ khác, không chỉ trường hợp null.)

**N4. Dải 99,5–120% cho máy nhỏ ≤20 kVA** (mục 3): 40 cỡ ≤20 kVA có ứng viên ở dải cũ mà dải mới <5 dòng; cỡ 6 kVA 0 dòng. Agent nhận 0–4 ứng viên cho cỡ phổ biến (8,5 / 12 / 12,5 / 15 kVA); cỡ 12 kVA: 7 → 4 dòng, rồi `minPrime 12 kVA` còn 1–3. Không phải lỗi mã, là hệ quả của quyết định dải.

### TRUNG BÌNH

**M1. Dung tích động cơ >100 L bị chia 1000 như cc** (`litres = n > 100 ? n/1000 : n`). Động cơ có dung tích >100 L trong catalog: Yuchai YC16VC3000/3300/3600/4000-D31 và YC16VC2470N-D30 (105,56 L, 105,6 L), Weichai 6WH32D3000-7.2/7.5 và 8WH32D4000-7.2/7.5 (193 L, 257 L), Googol JTA20V-NG2066 (107,5 L): 10 động cơ. Khi HSMT có minDisp (10 gói ≥2000 kVA trong 19 lượt thử) các dòng của chúng bị loại: 416 dòng oan (IB2300119452, IB2300188511, IB2400100405, IB2400216847, IB2400333932, IB2500102600: 56 dòng mỗi gói; IB2300260615 / IB2300233670: 15; IB2500110812 / IB2500110816: 25).

**M2. minPrime đọc số Standby**: `Máy phát điện 163kVA liên tục Prime/180kVA dự phòng Standby` → minPrime 180 kVA (regex `PRIME_LABEL … [^\n\d≥≤]{0,60}? (\d+) kVA` lấy số sau chữ Prime, `!STANDBY_W.test(line.slice(0, m.index + 20))` chỉ nhìn 20 ký tự nên bỏ sót "dự phòng" đứng sau số). 2 gói: IB2200021335, IB2200075147 (cỡ 163 kVA): loại 727 dòng Prime, đúng ra 526: 152 dòng oan (prime 163–179 kVA).

**M3. minPrime lấy từ phần đầu phát / động cơ khi HSMT không nêu số của tổ máy** (`list = own.length && … ? own : prime`): 30 lượt chỉ có minPrime từ phần `alt`/`engine`; 9 lượt lệch >3% so với cỡ: IB2300266461 (42 kVA cho máy 40; 3 dòng prime 40 kVA bị loại, đúng cỡ HSMT), IB2500386455 (60 kVA cho cỡ 50), IB2400475145 (10 cho cỡ 8,5: loại 85), IB2200016199 (12 cho cỡ 8,5: loại 130), IB2500442970 (13 cho 12,5: 48), IB2600511196 (900 cho 1000), IB2300230061 (136 cho 150), IB2500235727 (200 cho 220), IB2300254910 (12 cho 12,5). Nếu số của đầu phát cao hơn máy thì loại oan.

**M4. Văn bản Unicode NFD** (`i` + U+0301 thay vì `í`): `engineMins`/`powerMins` dùng `[íi]`, `[ừu]`… nên không khớp. 384 gói có dấu tổ hợp (cả 7/12 gói IB2600… thật); so `hintsOf(NFD)` với `hintsOf(NFC)`: 9 ngưỡng khác: bỏ sót 6 (IB2500114642 minCyl 6, IB2400440257 minDisp 2,672 và minCyl 4, IB2500364714 minPrime 500, IB2600308125 maxFuel 85, IB2300364915 maxDisp 14,6), sai hẳn 3 (IB2300214975 minDisp 22 vs null, IB2300031444 minDisp 55 vs null, IB2400470242 minPrime 30 vs 33). Gợi ý: `normalize("NFC")` ở đầu `hintsOf` / `technicalPart` (đã có ở `sizesOf`, `capacity`).

**M5. Ngưỡng của thiết bị khác trong cùng HSMT**: IB2300230061 (gói MS-02: máy phát, cầu trục, xe nâng) minDisp 3,318 L và minCyl 4 là của xe nâng (`Số xy lanh/dung tích xy lanh ≥ 4/3318cm3`; `Dung tích thùng dầu thủy lực`). Hậu quả nhỏ ở gói này (giá trị thấp) nhưng cho thấy mã không phân biệt thiết bị.

**M6. Một nguồn sai số xi lanh/dung tích làm loại oan** (`below()` chỉ cần "mọi nguồn có số đều dưới ngưỡng", một nguồn cũng đủ): M35 (FAWDE CA6DL1-24D, "4 L" của waeta-fujian). Dữ liệu NCC sai, nhưng mã không có chốt chặn nào (ví dụ cần ≥2 nguồn, hoặc đối chiếu bore × stroke × xi lanh với dung tích).

### THẤP / VÔ HẠI

- **L1**: số thứ tự dòng bảng đọc là số xi lanh (`4 xi lanh, tổng …`: IB2300129273 ×2 cỡ, IB2500110812, IB2500110816, IB2300363513: 5 lượt) và bồn nhiên liệu (`Dung tích ≥ 2.000 lít`: IB2500110812/16) đọc là dung tích: giá trị thấp nên không loại ai.
- **L2**: quy tắc "con số trần = tối thiểu" (Khoa 2026-11-03): HSMT viết quanh một động cơ (5.9 L, 7.01 L, 21.927 L, 60,2 L, 11.945 L…) loại động cơ nhỏ hơn hợp lệ. Không phải lỗi mã; nêu 9 ca "?" ở mục 4/5 để quyết định có giữ không.
- **L3** (dữ liệu catalog, ngoài phạm vi): dòng bảng có khối lượng (kg) bị đọc thành kW/kVA (frs-shenyang: 16 dòng trong top ở 4 lượt cỡ 3.875–4.000 kVA, động cơ 12–16 L với tổ máy 4 MVA; IB2500102600 M3: 2050/2725), cột công suất lệch (yingtai-jiangsu; Westinpower TP15 "rated 13 kVA/11 kW"), một số hồ sơ ghi số xi lanh sai. Ngưỡng dung tích/xi lanh lọc bớt các dòng này.
- **L4**: `capacity()` đọc công suất trạm / nhà máy (120–375 MW) làm cỡ máy ở 14 gói (16 lượt): danh mục rỗng; 30 gói >4 cỡ chỉ chạy 4 cỡ đầu (`MAX_SIZES`); 95 gói không đọc được cỡ.
- **L5**: cận 0,995 bỏ dòng ở 97–99% (IB2400475109 / IB2400446772: 990 kVA cho 1000 kVA).

---

## 10. Không kiểm được / hạn chế

- Không có văn bản HSMT thật của 1.004 gói `specs` (chỉ chương kỹ thuật của script `specs`, có thể khác `hsmttext` ở định dạng; ví dụ NFD). Chỉ 12 gói có đúng văn bản như `prep`. Không có `reqData.extra`, `focus`, hay cấu hình lượt trước ngoài 12 gói.
- Không có bản quét ~390 HSMT ngày 03/11 dưới dạng tệp.
- Mẫu loại oan (90 dòng) soát bằng mắt; không chạy kiểm chéo bằng nguồn thứ hai (datasheet hãng) cho từng dòng; đối chiếu chỉ giữa con số của dòng và ngưỡng, đơn vị, nhãn Prime/Standby, kW/kVA. Không kiểm xem con số bảng NCC có đúng với datasheet hãng.
- Phát hiện lỗi ngưỡng theo mẫu (regex) nên không đầy đủ: có thể còn kiểu đọc sai khác. Định lượng "dòng oan" dựa trên chạy lại `candidates()` với ngưỡng sửa tay (không phải ngưỡng đúng của HSMT, trừ chỗ tôi đối chiếu văn bản).
- Ngưỡng của gói nhiều cỡ: không gán được ngưỡng đơn trị cho cỡ cụ thể nếu không mâu thuẫn; việc đó thuộc phiên đang sửa.
- Không chạy `catalogMd()` (chỉ `candidates()`); không đo kích thước `catalog.md`, thời gian agent, số token.
- `mergeFind`/`keepFound` (cấu hình mới từ Tìm NCC) không chạy.

---

## 11. Cách chạy lại

Thư mục `C:\Projects\GenSet Pro\genbid-work\dieu-phoi\kiem-rong\`; chạy bằng Node 20 (cùng máy: đã dùng `node`); không cần mạng, không cần token. Thời gian: `runall` khoảng 10–45 phút cho 4 tiến trình (tuỳ máy rảnh).

```bash
cd "/c/Projects/GenSet Pro/genbid-work/dieu-phoi/kiem-rong"
node setup-old.mjs                 # tạo old/config-bot-oldband.mjs (dải 95-140%) và old/config-bot-instr.mjs (đọc nguồn ngưỡng) từ checkout chính
node thr.mjs                       # ngưỡng + nguồn cho mọi lượt -> out/thr.json
for i in 0 1 2 3; do node --max-old-space-size=3000 runall.mjs $i 4 > out/log-$i.txt 2>&1 & done   # -> out/run-*.jsonl
node analyze.mjs > out/analyze.txt # mục 1, 2, 3, 5 (thống kê)
node multi.mjs                     # mục 8 -> out/multi.json
node reg.mjs                       # mục 6 -> out/reg.json
node find.mjs; node find2.mjs      # mục 7
node thrsel.mjs; node sample.mjs   # chọn ca mục 4, mẫu mục 5 (mẫu đã đóng băng ở out/sample-frozen.json)
node defects.mjs; node quant.mjs; node quant2.mjs; node nfd2.mjs; node topsane.mjs; node unl.mjs; node risk.mjs   # mục 4, 9
node mkapp.mjs; node mkapp2.mjs    # sinh phụ lục A–E
```

`lib.mjs` đọc: mã `C:\Projects\GenSet Pro\GenSet-Pro\suppliers\config-bot.mjs` (checkout chính), `genbid-work\doc-cache\*.json`, `genbid-work\specs\*\text.txt`, `kiem-rong\data\` (bản sao HSMT 12 + 241 gói). Nếu checkout chính đổi sang main mới hơn, `node setup-old.mjs` phải chạy lại và kết quả thay đổi theo. `ctx.mjs <gói> <regex> [n] [dòng]` và `show.mjs <gói> <từ> <đến>` in nguyên văn HSMT quanh một chỗ để soát tay.
