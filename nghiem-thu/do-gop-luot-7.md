# Đo gộp lượt 7: #1234, #1235, #1237, #1238 (+ #1241, + cây tích hợp)

Phiên ĐO của điều phối, 25/11/2026. Không chép chữ HSMT; chỉ mã gói, số liệu, tên model, tên NCC. Cách đo và tiêu chí như lượt 6 (`do-gop-luot-6.md` mục 2, 3). TSV: `nghiem-thu/do-gop-luot-7-pr.tsv` (15.939 dòng; cột: bước đo, lượt, loại, NCC, động cơ, đầu phát, băm khoá dòng, hạng / điểm trước và sau, PR, nhóm, cơ chế, **nguyên văn dòng nguồn trong `cn/`**; dòng nhiều khối không có dòng đơn trong `cn/` thì ghi khoá chữ chuẩn hoá). Kết quả nén (5 trường `top`, `topScore`, `all`, `dropped`, `rowflag`) ở nhánh mồ côi `do-gop-luot-7-ket-qua`.

## Kết luận từng PR

Gốc `main` **6da9a53b** (main nay đã tới 5056cbde: thêm #1232 catalog camda / mecca, #1229 tiêu hao, #1242 do-gop; các cây đều giữ gốc 6da9a53b để so cùng nền; cần đo lại nếu muốn nền mới). Mỗi PR đo RIÊNG, gộp `--no-ff` vào 6da9a53b (sạch, không xung đột).

| PR | Nhánh | Đổi ở `all` | Đổi ở top 30 | Kết luận |
|---|---|---:|---:|---|
| **#1234** ngoại lệ 1006TG2A = Lovol, "18·2" = 18,2 | `ngoai-le-1006-182` | 1.211 dòng / 62 lượt | **158 dòng, 15 lượt / 15 gói** | **Merge được.** 20 dòng 1006TG2A (jet-power 8, wintpower 9, victory-generator 3) vào lại top 30 ở **14 lượt**, đúng kỳ vọng, đều +60 hãng Lovol. Dòng 1104C44TAG1 bị loại theo tỉ số nén: 37 dòng trong `all` ở 1 lượt, **2 dòng ra khỏi top 30** (IB2400325367#0), ít hơn kỳ vọng ~10 (mục 4.1). 0 chưa giải thích. |
| **#1235** ô động cơ viết lạ (họ P2) | `buoc-3-p2` | 1.855 dòng / 424 lượt | **195 dòng, 18 lượt / 17 gói** | **Cần Khoa quyết một điểm, còn lại đúng.** 132 bản ghi mới / 14 bản ghi đổi; 10 dòng bản ghi mới vào top 30 đều khớp ô nguồn; 0 chưa giải thích. Bốn NCC `DASH_FIX` (aosif, jiangchai-xuzhou, walter-yangzhou, westinpower): **0 lượt top 30 đổi**, 181 dòng `all` ở 68 lượt: gỡ được không đụng top. Điểm cần Khoa biết: 9 dòng cgm-italia ra top 30 vì động cơ đổi sang mã Deutz (mục 4.2). |
| **#1237** định mức tờ đầu phát | `buoc-3-dau-phat-dinh-muc` | **0** | **0** | **Merge được.** Kết quả **giống `main` từng byte** (`cmp`), đúng kỳ vọng "đầu vào `candidates` không đổi"; `keysOfModel` tách "/" không làm đổi dòng nào. |
| **#1238** nhãn đầu phát | `buoc-4-c` | 58.464 dòng / 840 lượt | **15.560 dòng, 813 lượt / 688 gói** | **Merge được, kèm một sửa nhỏ không chặn.** Mọi dòng đổi điểm khớp đúng +3 × số loại thông số đầu phát thêm (tối đa 6): 9.194 dòng `diem-khop`, 0 lệch, 0 chưa giải thích. 260 model đầu phát đổi tập khoá (không động cơ nào). Lưu ý: 3 mã LVSI804R / T / W (stamford-avk-china n1066–1068) ghi khoá `avr` từ **một câu văn** (mục 4.4); điểm không đổi. |
| **#1241** aosif n123 AW1125 (dropspec) | `aosif-aw1125` | **0** | **0** | **Merge được.** Không dòng nào trong `all` / top đổi; chỉ 7 dòng-lượt (4 khoá) vốn đã bị loại `esp` nay thêm lý do `cyl` / `disp` (mục 4.5). |

Tương tác: #1234 ↔ #1238 chung 58 dòng `all` (cộng điểm độc lập: +60 và +3 × khoá, không xung đột); #1235 ↔ #1238 chung 385 lượt, 6 dòng top; #1234 ↔ #1235 chung 59 lượt nhưng 0 dòng chung. **Có đụng cùng dòng, nên đã đo cây tích hợp cả bốn** (mục 5): 19 dòng / 18 lượt chỉ đổi khi gộp, đều giải thích được (bản ghi mới #1235 + nhãn đầu phát #1238).

## Tóm tắt số liệu

| Cây | Commit đo | Lượt đổi top | Gói | Dòng top đổi | Dòng `all` đổi | Chưa giải thích |
|---|---|---:|---:|---:|---:|---:|
| `main` | 6da9a53b | gốc | | | | |
| main + #1234 | a217265f | 15 | 15 | 158 | 1.211 | 0 |
| main + #1235 | ab67cc84 (đầu mới 1d78eb35, xem dưới) | 18 | 17 | 195 | 1.855 | 0 |
| main + #1237 | a2aa873c | 0 | 0 | 0 | 0 | 0 |
| main + #1238 | fbe8eedb | 813 | 688 | 15.560 | 58.464 | 0 |
| main + #1241 | c0288521 | 0 | 0 | 0 | 0 | 0 |
| tích hợp 4 PR (đầu #1235 mới) | 3865a75f | 819 | 694 | 15.768 | 61.472 | 0 |

Cùng MỘT bản bidhist (tải 25/11/2026 00:43 UTC, 1.556 doc, 928 gói máy phát, 1.057 lượt, 436 NCC, 0 lượt lỗi). **#1235:** đầu nhánh nay là `1d78eb35`; đã đo ở `e206b610`. `git diff e206b610 1d78eb35 --stat`: chỉ `web/CLAUDE.md` và `web/catalog.js` (2 + 2 dòng): đổi chữ ghi chú `khoa` của `DASH_FIX` ("chờ Khoa xác nhận" → "Khoa 25/11/2026"), không đổi mã đọc → kết quả đo giữ nguyên; cây tích hợp dùng đầu mới.

## 1. Cách đo

- `NODE_USE_ENV_PROXY=1 node do-gop-x.mjs <cây> <cây>/suppliers/cn <out> --bidhist <bản chung>`: bản sao `suppliers/do-gop.mjs` (cây 5 PR đo bằng bản 6da9a53b, #1241 và tích hợp bằng bản 5056cbde có chạy tiếp), phần tính giữ nguyên, ghi thêm tệp chẩn đoán (120 dòng đầu của `all` mỗi lượt: khoá, điểm, lý do, luật, tập khoá thông số động cơ / đầu phát, hãng; mọi dòng `dropped` kèm luật; bảng toàn cục hãng + khoá thông số mỗi động cơ / đầu phát; mọi bản ghi động cơ). Không đổi kết quả top 30. Tệp kết quả đẩy lên chỉ gồm 5 trường.
- Khoá dòng: `NCC | động cơ | đầu phát | chữ dòng`; dòng bị loại tra bằng khoá bỏ đầu phát.
- Dòng ngoài 120 dòng đầu của chẩn đoán: dự đoán điểm bằng bảng toàn cục (nhóm `diem-khop-bang`); khớp đúng từng điểm hoặc ghi là lệch (không gặp).

## 2. Tiêu chí quy cơ chế (máy kiểm từng dòng)

`diem-khop` (đổi điểm = +8 × loại thông số động cơ (≤ 8) + 3 × loại thông số đầu phát (≤ 6) + 60 hãng động cơ + 300 / 80 / 40 theo lý do có điểm, khớp đúng từng điểm), `diem-khop-bang` (như trên nhưng dòng ngoài 120 đầu, tính bằng bảng toàn cục), `ban-ghi-moi`, `ban-ghi-doi` (khoá động cơ / công suất / tần số / đầu phát / hãng của bản ghi đổi), `luat-loai` (vào `ruled`), `het-bi-loai` (luật bị bỏ: **0 dòng ở mọi cây**), `he-qua-truc-tiep` / `he-qua-day-chuyen` (điểm và luật giữ nguyên, có dòng gốc phía trên đổi), `diem-lech` (điểm đổi nhưng không khớp dự đoán: **0**), `chua` (lượt đổi mà không có dòng gốc nào: **0**), `chi-doi-khi-gop`.

## 3. Phân loại 100 % dòng top 30 đổi

| Nhóm | #1234 | #1235 | #1237 | #1238 | #1241 |
|---|---:|---:|---:|---:|---:|
| diem-khop | 4 | | | 9.069 | |
| diem-khop-bang | 16 | | | 125 | |
| ban-ghi-moi | | 10 | | | |
| ban-ghi-doi | | 9 | | | |
| luat-loai | 2 | | | | |
| he-qua-truc-tiep | 94 | 159 | | 6.366 | |
| he-qua-day-chuyen | 42 | 17 | | | |
| diem-lech / chua | 0 | 0 | 0 | 0 | 0 |
| **Tổng** | **158** | **195** | **0** | **15.560** | **0** |

## 4. Từng PR

### 4.1 #1234 (158 dòng, 15 lượt)

- **1006TG2A Lovol** (20 dòng `vao`, 14 lượt / 14 gói): `makeException` giữ Lovol; điểm +60 đúng từng điểm (4 dòng trong 120 đầu khớp theo dòng chẩn đoán, 16 dòng ngoài khớp bảng toàn cục: hãng «» → «Lovol», khoá không đổi). jet-power 8, wintpower 9, victory-generator 3. Nguồn: jet-power n137 dòng 176 `| P-110 | … | 1006TG2A | L6 | … | JET274C` (trang n137 là trang "Silent Water Cooled LOVOL Diesel Generator Set"). 20 dòng ra khỏi top là dòng đẩy xuống (hệ quả: wintpower 1006TAG1A, longkai-power D1146, elitech-power R6105IZLD…).
- **"18·2 :1" = 18,2**: weiman-fujian n111 dòng 71, 72 (1104C-44TAG1 / TAG2) ghi `18·2 :1`; hai dòng khác của chính trang (114, 115) ghi `18.2:1` / `18.2 :1`. Với main, giá trị `18·2` không đọc được làm tập giá trị tỉ số nén của động cơ 1104C44TAG1 lẫn (`18.23`, `18·2`, `18.2`) nên luật loại tỉ số nén **không áp** (bẫy comprFig lượt 5); sau PR cả ba giá trị là 18,2 / 18,23 nên luật áp: HSMT của IB2400325367 ghi 17,3:1 (IB2300165131 16,1; IB2300340905 17,5) và 1104C44TAG1 bị loại `compr`.
- **Lệch kỳ vọng ~10 dòng 1104C44TAG1 / TAG2 ở IB2300165131#0, IB2300340905#0, IB2400325367#0**: thực tế `compr` loại thêm **37 khoá** (27 NCC) 1104C44TAG1 trong 15 gói (mục `dropped`: 37 dòng-lượt / 37 khoá "compr (main: không loại)" + 102 dòng-lượt vốn đã bị loại bởi `cyl` / `disp` / `prime` nay thêm `compr`), nhưng trong top 30 chỉ đổi ở **IB2400325367#0** (sanq-power hạng 6, dingbo hạng 13 ra; hai dòng thay: jet-power R4110AZLD, elitech-power 4ZT32G11 vào = hệ quả). Ở IB2300165131#0 và IB2300340905#0 `all` không có dòng 1104C44TAG1 ở cả hai cây (đã bị loại sẵn bởi luật khác), top giữ nguyên. **1104C44TAG2 không đổi** vì tập tỉ số nén của TAG2 còn lẫn `18.3:1` và `18,2 : 1` (khác 18.2) nên luật vẫn không áp: còn lại cho điều phối nếu muốn gom.
- **Soát "hết bị loại": 0 dòng** (không luật nào bị bỏ; chỉ thêm `compr`).
- Kết luận: **merge được.**

### 4.2 #1235 (195 dòng, 18 lượt / 17 gói)

- Bản ghi: **+132 mới** (kaihua-genset 21, nenjo-generator 18, cgm-italia 15, walter-yangzhou 12, longkai-power 6, previa-ningde 6, wintpower 6, zhengdian-zhengzhou 6, jiangchai-xuzhou 5, xingguang-jiangsu 5, tellhow-power 5, rise-power 5, landtop-fuzhou 3, world-power-fuzhou 3, huadong-yangzhou 3, aosif 3, victory-generator 2, baifa-power 2, senci-jiangsu / senci / uleengen / bdadl-shanghai / fukangsi-yangzhou / jianghao-genset 1) và **14 bản ghi đổi** (đều cgm-italia n101: khoá động cơ B50 / B100 / B200 / B300 / B400 → mã Deutz của cột "Engine": BF4M 1013 FC, BF6M 1013 EC, BF8M 1015 C G2, TCD 2013 L06 4V…).
- **10 dòng bản ghi mới vào top 30 (đối chiếu ô nguồn, 10 / 10 đúng):** kaihua-genset n104 dòng 158 / 159 (`KH-100GF | 137.5 | 110 | 125 | 100 | P086T1-1`, `KH-120GF …`) → động cơ P086T11, công suất khớp; kaihua n102 dòng 147 (`KH-640GF … P222FE-11`) và n103 dòng 170 (`KH-600GF … P222FE-11`) → P222FE11; longkai-power n123 dòng 99 `LG500DS … P180FE`, dòng 140 `LG504DS/I … P180FE`, dòng 94 `LG370DS … P158FE`; uleengen n125 dòng 163 `UD250GF | 200 | 250 | BF6M1015 LA GB | 225 | … | UCI274H`. Mã động cơ = ô "Engine Model", công suất đúng ô theo tiêu đề. Kiểm cả 14 bản ghi đổi: mã khoá = ô "BF… / TCD…" của dòng nguồn bỏ khoảng trắng, 14 / 14 đúng.
- **9 dòng ra do `ban-ghi-doi` (cgm-italia B200 / B300)**: khoá động cơ B300 → BF6M1013FCG2 (Deutz). **Cơ chế chưa nêu trong thân PR:** `NO_GROUP = {Deutz}` (Khoa 11/11/2026 "loại Deutz ra khỏi G7") nên ở lượt G7 / G7+EU các dòng cgm-italia mang động cơ Deutz không còn trong tập động cơ của lượt (không vào `all` cũng không vào `dropped`); trước đó chúng nằm dưới động cơ "B200 / B300 / B400" (hãng FPT, thuộc G7). Đúng luật hiện hành (cột nguồn ghi Deutz) nhưng là thay đổi hành vi cho cgm-italia ở HSMT G7.
- **Soát "hết bị loại": 30 dòng-lượt (19 `prime`, 11 `band`; 10 khoá cgm-italia)** là dòng của khoá cũ (B200 / B300 / B400); khoá mới (mã Deutz) vắng khỏi `all` / `dropped` của lượt vì lý do `NO_GROUP` ở trên, **không phải luật bị bỏ**; 11 trường hợp khoá mới còn bị loại cùng luật. 0 dòng thật sự hết bị loại.
- **Bốn NCC `DASH_FIX` (chờ Khoa xác nhận):** bản ghi mới walter-yangzhou 12, jiangchai-xuzhou 5, aosif 3 (westinpower 0 mới); top 30: **0 dòng, 0 lượt** do bốn NCC; `all`: 181 dòng ở 68 lượt. Gỡ bốn NCC này không đổi top 30.
- Dòng top 30 khác: 159 + 17 hệ quả.
- Kết luận: **cần Khoa quyết** (a) bốn NCC `DASH_FIX` (đầu mới 1d78eb35 ghi "Khoa 25/11/2026", coi như đã duyệt: điều phối xác nhận), (b) biết tác dụng Deutz / G7 của cgm-italia; còn lại merge được.

### 4.3 #1237 (0 dòng)

`main.json` và `pr1237.json` giống từng byte; bảng toàn cục hãng + khoá thông số cũng giống. Đầu vào `candidates` không đổi (định mức tờ đầu phát dùng ở `ratings.mjs`, không vào khoá thông số của `candidates`); `keysOfModel` sửa "/4" không làm đổi dòng. Kết luận: **merge được** (không tác dụng lên top 30; tác dụng ở dữ liệu `ratings`, ngoài phạm vi đo này).

### 4.4 #1238 (15.560 dòng, 813 lượt / 688 gói)

- 260 model đầu phát đổi tập khoá (không động cơ nào): **thêm** `bearing` 133, `wires` 148, `overspeed` 69, `thf` 38, `airflow` 11, `avr` 14, `poles` 2, `pitch` 1; **mất** `excit` 5 (S1L2Y, S1L2J, LVSI804R / T / W; mỗi mã mất `excit` và thêm `avr`, net 0). `diem-khop` 9.069 + 125 bảng: độ lệch điểm +3 (7.253 dòng), +6 (921), +12 (3 dòng). 0 `diem-lech`, 0 `chua`. Dòng `vào` 983, `ra` 983 là hệ quả của đổi điểm.
- Nguồn kiểm (mẫu theo từng loại): `overspeed` UCI274C "MAXIMUM OVERSPEED 2250 Rev/Min" (stamford-avk-china n1002), TALA44C "Overspeed 2250 R.P.M." (leroy-somer-fuzhou n1003); `thf` UCI224G "电话谐波系数 THF ＜2%" (shanhua n1016); `airflow` S0L1P1 "Cooling Air Flow 0,583 m3/s" (himoinsa-china n130); `wires` TALA49C "Number of wires 6 or 12" (leroy-somer-fuzhou n1006), LSA472S4 "Wires 12" (depco-power n2272); `bearing` LSA463L11 "No.of bearings 1" (depco-power n2274); `poles` HLF30 "Number of Poles 4" (huali-shandong n2002); `pitch` LSA493M65 "Winding Pitch 2/3" (koten-power n1028); `avr` S164G128 "Voltage regulator A.V.R" (genlitec n1010), S1L2J "AVR Type AVR Power" (stamford-avk-china n1055). Đúng.
- **Nhận nhầm còn sót (không đổi điểm, cần sửa nhỏ):** `avr` của LVSI804R / T / W lấy nhãn là nửa câu "…the Automatic Voltage Regulator (AVR) to the main exciter." giá trị "terminal box contains the AVR and provides ample space for" (stamford-avk-china n1066–1068): câu văn không phải thông số; trước PR cùng ô được ghi `excit` (cũng nhầm), nên điểm không đổi (−3 +3). Luật `alternator.avr` `must` chỉ đòi có chữ; nên chặn câu dài.
- Soát "hết bị loại": **0** (không luật bị bỏ; `dropped` không đổi).
- Kết luận: **merge được**; sửa nhỏ `avr` / câu văn ở PR sau.

### 4.5 #1241 (0 dòng)

Dòng của khoá `8M33D1012E311^` (aosif và NCC khác): **không dòng nào trong `all` ở mọi lượt** ở cả hai cây (mã "^" bị loại `esp` ở HSMT công suất liên tục, nên không vào `all`); nên không có "hết bị loại" và không có −8 điểm / loại thông số. Thay đổi chỉ ở `dropped`: 7 dòng-lượt / 4 khoá vốn đã bị loại `esp` nay thêm lý do `cyl` (4 + 1) và `disp` (1 + 2). Bản ghi: 1 bản ghi đổi (bỏ xi lanh "12V", dung tích "31.8"). Kết luận: **merge được**, không đụng top 30.

## 5. Cây tích hợp (4 PR, 3865a75f) so `main`: 15.768 dòng top, 819 lượt / 694 gói

Gộp `--no-ff` bốn nhánh (đầu #1235 mới) vào 6da9a53b: **sạch, không xung đột**. Quy về bước đo riêng (theo `lượt@dòng`): chỉ #1238 khớp 15.307 dòng; chỉ #1234 95; chỉ #1235 94; #1234 + #1238 28; #1235 + #1238 11; khác hạng / điểm vì dòng của PR khác cùng lượt: 95 + 21 + 86 + 9 + 3; **chỉ đổi khi gộp: 19 dòng / 18 lượt** = dòng uleengen `UD250GF | BF6M1015 LA GB | UCI274H` (bản ghi mới của #1235) vào top 30 hạng 25, điểm **271 = 268 (#1235) + 3 (#1238: đầu phát UCI274H thêm khoá)**; 268 riêng không đủ vào top 30. Gồm cả dòng đổi hạng (vd IB2300278731#0 uleengen YC4A140LD20 18 → 19). Không tương tác nào khác; 0 chưa giải thích, 0 hết bị loại. Dòng có trong TSV (bước `main→tích hợp 4 PR`, nhóm `chi-doi-khi-gop`).

## 6. Sự cố khởi động lại container (chỉ điều quan sát được)

- Lần chạy đầu: 5 cây (`main` + 4 PR) song song, bắt đầu ~00:44 (giờ máy). Tiến độ cuối quan sát được ~01:02: `main` tới gói 200, các cây PR 100–300. Lệnh chờ tiếp theo thoát mã **137**; sau đó hệ thống báo container khởi động lại. `uptime -s` của lần chạy mới: 01:09:53.
- Lúc đó: 5 tiến trình `do-gop` song song trên 4 lõi, RAM máy 15 GB. **RAM đỉnh mỗi cây của lần đầu: không đo được** (script cũ không in). Không có tệp kết quả nào của lần đầu (script cũ chỉ ghi ở cuối).
- `dmesg` (sau khởi động lại) không có dòng `oom` / `killed`; log kernel trước khi khởi động lại không còn để xem.
- Mất ~**26 phút** chạy (00:44 → ~01:09) + chạy lại từ đầu 01:10 → 02:05 (5 cây song song, ~53 phút).
- Quan sát RAM sau đó (script mới in `rssDinhMB`, kèm chẩn đoán): cây đơn #1241 đỉnh **3.749 MB**, cây tích hợp đỉnh **2.734 MB**, chạy 2 cây song song (không xung đột); tiến độ giữa chừng cùng cây: ~0,5 GB (2 %), ~1,5 GB (27 %), ~2,3 GB (77 %).

## 7. Việc đề nghị điều phối

1. Merge #1234, #1237, #1241, #1238 (độc lập; #1234 + #1238 cộng điểm không xung đột). Sửa nhỏ #1238: chặn `avr` từ câu văn (3 mã stamford-avk-china n1066–1068).
2. #1235: hỏi Khoa (a) bốn NCC `DASH_FIX` (đã ghi "Khoa 25/11/2026" ở 1d78eb35); (b) cgm-italia Deutz ra khỏi lượt G7 (đúng `NO_GROUP`, nhưng PR không nêu).
3. Còn mở ngoài phạm vi: tỉ số nén 1104C44TAG2 còn `18.3:1` / `18,2 : 1` nên luật `compr` không áp (nếu muốn nhất quán với TAG1); main đã tiến tới 5056cbde, đo lại nếu cần nền mới.
