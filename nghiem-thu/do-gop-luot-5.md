# Đo gộp lượt 5: 6 PR nháp + `bo-o-lech-4` (nhánh `tich-hop-luot-5-do-gop`)

Phiên con của điều phối, 24/11/2026. Báo cáo không chép chữ HSMT; chỉ mã gói, số liệu, tên model, tên NCC. Phần A xong và ghi trước theo yêu cầu điều phối (16:05); phần B (925 dòng cũ) đang đo, sẽ bổ sung vào mục 6 của chính tệp này.

## Kết luận từng PR

| PR | Nhánh | Dòng top 30 đổi khi đo riêng (so `main`) | Kết luận |
|---|---|---:|---|
| **#1174** nhãn thông số | `claude/fix-spec-labels` | **12.735** (840 lượt / 718 gói) | **Cần sửa trước khi merge** (và vẫn còn các điểm cần Khoa quyết của lượt 4). Lỗi mới tìm thấy: ô tỉ số nén viết dấu hai chấm toàn chiều rộng ("17.3：1", "17.3 ： 1", "16.5：1"…) mà #1174 nay đọc được thì `comprFig` trả null, `comprOff` coi là "không đọc được" và **bỏ luật loại** → **123 dòng vào top 30 sai** (động cơ có tỉ số khác HSMT mà không bị loại). Gộp với #1203 thành **196 dòng**. Sửa: `comprFig` nhận "：" (U+FF1A) như ":". 33 dòng dựa dung tích sai của lượt 4 thì #1202 + `bo-o-lech-4` đã gỡ hết. |
| **#1202** bỏ 126 ô lệch | `bo-o-lech-126` (base #1174) | so #1174 riêng: **58** (5 lượt) | **An toàn merge cùng / sau #1174.** 5 dòng đổi luật loại số xi lanh, cả 5 đúng theo động cơ thật; 53 dòng còn lại là hệ quả trong cùng lượt. Bộ kiểm giá trị 345 → 219 ca sai. Gỡ cờ dung tích sai của TAD531GE (4 dòng còn bị loại nhưng nay đúng: 4,76 L < 5,9 L HSMT đòi). |
| **`bo-o-lech-4`** (PR nháp của phiên khác) | `bo-o-lech-4` (base #1202) | so #1174+#1202: **49** (16 lượt) | **An toàn merge sau #1202.** Bỏ 4 ô dung tích sai (kangwo S175M / S180M, zhengchi 12M33D1450E310, taihai 6135AD-3): **29 dòng dựa dung tích sai còn lại → 0**. Bộ kiểm 219 → 215 sai. |
| **#1203** sửa bộ đọc 9 mẫu | `bo-doc-9-mau` | **645** (69 lượt / 68 gói) | **An toàn merge** về top 30 khi đứng riêng: mọi dòng có cơ chế, không dòng sai (mục 4.4). Bộ kiểm 293 → 196 sai, "chưa chuẩn" 304 → 312. Lưu ý: bản ghi động cơ mới của shanhua mang ô "18：1" / "17：1" chỉ #1174 đọc được, nên khi có cả hai PR mà chưa sửa `comprFig` thì thêm 66 dòng sai (đã tính trong 196 ở dòng #1174). |
| **#1201** định mức Leroy LSA 43.2 / 53.2 / 54.2 | `ls-ratings-1022-6003` | **0** | **An toàn merge.** Bộ kiểm: thêm 264 giá trị, số sai giữ 293. |
| **#1200** khoá tờ Linz | `linz-noi-model` | **0** | **An toàn merge.** |
| **#1192** hãng Stamford cho LVSI804W | `claude/lvsi804w-stamford` | **0** | **An toàn merge.** |

Thứ tự merge đề nghị: #1201, #1200, #1192, #1203 (độc lập, sạch); #1174 chỉ sau khi sửa `comprFig` (hoặc một PR nhỏ sửa `comprFig` merge trước); rồi #1202, rồi `bo-o-lech-4`.

## Tóm tắt

| Mục | Kết quả |
|---|---|
| Nhánh tích hợp | `tich-hop-luot-5-do-gop` HEAD `2aee16f2`, từ `origin/main` `e286f5e1`; đã đẩy, không mở PR. Gộp merge commit theo thứ tự #1174, #1202, #1203, #1201, #1200, #1192, rồi `bo-o-lech-4` (điều phối bổ sung 12:58). |
| Xung đột | **2**, đều `web/CLAUDE.md` (mục 1). Không xung đột mã. `quality-baseline.json`, `web/catalog.js` tự gộp. |
| Test (nhánh tích hợp cuối, có `bo-o-lech-4`) | suppliers **1.810 test: 1.808 đạt, 0 lỗi, 2 bỏ qua**. web `cap-read` + `spec-norm` 160/160, `static` 11/11. Playwright (trước khi gộp lech-4): 141 đạt, 3 hỏng ở `file-transfer.spec.mjs`; `main` hỏng đúng 3 ca đó (tên tệp tải về trên Chromium của máy cloud), không do PR. `verify.mjs`: 436 hồ sơ, 0 lỗi. `quality.mjs --check`: không chỉ số nào xấu đi. |
| spec-diff (tích hợp 6 PR so `main`) | 63.746 → 63.773 bản ghi; 3.505 đổi, 0 mất, 27 thêm (shanhua, #1203), 689 bảng / 57 NCC; đảo vai 0 → 0; spec-norm 1.954 thông số đổi kết quả. |
| Bộ kiểm giá trị (`spec-value-check`, số ca "sai") | main **293** · #1174 345 · #1174+#1202 219 · +lech-4 215 · #1203 196 · #1201 / #1200 / #1192 293 · tích hợp 6 PR **122** · tích hợp + lech-4 **118**. "Chưa chuẩn" 304 → 312 (chỉ #1203, +8); "cần xác nhận" 11 → 11. |
| Điều kiện đo | bidhist tải 24/11 12:43 UTC (1.556 doc, 928 gói), dùng CHUNG cho mọi lần đo, ngoài repo, không commit. Mỗi cây dùng `cn` của chính nó. `main` hiện có #1185 (sizesOf) nên phần A có **1.057 lượt** (lượt 4: 1.093). 0 lượt lỗi ở mọi cây. |
| Top 30 tích hợp (cuối) so `main` | **841 lượt / 722 gói, 12.494 dòng** (3.360 đổi điểm, 6.806 đổi hạng, 1.164 ra, 1.164 vào). |
| Dòng chưa giải thích (phần A) | **0** (tiêu chí ở mục 3). 39 dòng chưa giải thích của lượt 4: **đóng cả 39** (32 dây chuyền, 7 hệ quả trực tiếp, đều #1174). |
| Dòng SAI (phần A) | **123** (#1174 riêng) / **196** (tích hợp): luật tỉ số nén bị bỏ vì ô "N：1" không đọc được. **33 → 29 → 0** dòng dựa dung tích sai (#1174 → +#1202 → +lech-4). |

## 1. Gộp nhánh

`git merge --no-ff` từ `origin/<nhánh>` mới fetch, trên `origin/main` `e286f5e1`:

| # | Nhánh | PR | Kết quả |
|---|---|---|---|
| 1 | `claude/fix-spec-labels` | #1174 | **xung đột `web/CLAUDE.md`** |
| 2 | `bo-o-lech-126` | #1202 | **xung đột `web/CLAUDE.md`** |
| 3 | `bo-doc-9-mau` | #1203 | sạch |
| 4 | `ls-ratings-1022-6003` | #1201 | sạch |
| 5 | `linz-noi-model` | #1200 | sạch |
| 6 | `claude/lvsi804w-stamford` | #1192 | sạch |
| 7 | `bo-o-lech-4` | (nháp, phiên khác) | sạch |

**Xung đột 1 (`web/CLAUDE.md`, dòng 83–88):** `main` đã thêm hai mục "catalog-3-loi" và "Giá trị sai do nguồn"; #1174 thêm mục "Nhãn `SPECS` mới đọc được…" vào cùng chỗ. Giải: giữ cả ba mục (hai của main trước, của #1174 sau), bỏ dấu xung đột.

**Xung đột 2 (`web/CLAUDE.md`, khi gộp #1202):** #1202 chứa main cũ + #1174 nên có lại hai mục "Nhãn `SPECS`…" và "Giá trị sai do nguồn" theo thứ tự khác. Hai mục giống bên HEAD **từng ký tự** (đã so). Giải: giữ khối HEAD (đủ ba mục), bỏ khối lặp.

Không sửa mã PR nào, không chỉnh test nào. Cây đo riêng từng PR (main + PR) cũng chỉ xung đột `web/CLAUDE.md` (không ảnh hưởng chạy), lấy bản của PR.

## 2. Cách đo

- `NODE_USE_ENV_PROXY=1 node do-gop-x.mjs <cây> <cây>/suppliers/cn <out> --bidhist <bản chung>`; `do-gop-x.mjs` là bản sao `suppliers/do-gop.mjs` (main), phần tính giữ nguyên, chỉ thêm tệp chẩn đoán: mỗi dòng của `all` + `dropped` ghi khoá, điểm, luật loại, tập khoá thông số động cơ / đầu phát (`modelFacts`), nhãn lý do. Không đổi kết quả top 30.
- Cây đo (đều từ `main` `e286f5e1`): `main`; main+#1174; main+#1174+#1202; main+#1174+#1202+`bo-o-lech-4`; main+#1203; main+#1201; main+#1200; main+#1192; tích hợp 6 PR; tích hợp + lech-4. Mỗi lần 55–65 phút (4 lần song song).
- Khoá dòng: đủ 4 trường `NCC | động cơ | đầu phát | chữ dòng`. **Không bỏ trường đầu phát** như hướng dẫn cũ: `keyOf` của chữ dòng giữ dấu `|` và cắt ngắn, nên bỏ trường đầu phát làm hai dòng anh em (fdk-energy S5L1D-H41 / S5L1D-H4) trùng khoá và sinh 16 dòng "lệch điểm" giả. Dòng bị loại (`dropped`) không mang đầu phát trong khoá: tra lại bằng khoá bỏ đầu phát.
- Script, dữ liệu đo, bidhist ở thư mục tạm của phiên con, ngoài repo.

## 3. Tiêu chí quy cơ chế (máy kiểm từng dòng, không lấy mẫu)

Mỗi dòng top 30 đổi được xếp vào một nhóm (cột `nhóm` của TSV):

- `diem-khop`: điểm riêng đổi, và độ lệch **khớp đúng từng điểm** với dự đoán từ khoá thông số (+8 × loại thông số động cơ, tối đa 8; +3 × loại thông số đầu phát, tối đa 6), hãng động cơ (+60), và các lý do có điểm (named +1000, đầu phát HSMT nêu +80, BĐK có datasheet +40…). Cột `cơ chế` ghi khoá thêm / mất.
- `luat-loai`: dòng vào / ra vì luật loại (`ruled`) đổi: compr, disp, maxDisp, cyl….
- `he-qua-truc-tiep`: điểm và luật của dòng giữ nguyên; trong phần chênh lệch giữa tập dòng xếp TRÊN nó ở hai bên có ít nhất một dòng gốc (đổi điểm / luật / có mặt).
- `he-qua-day-chuyen`: phần chênh phía trên chỉ gồm dòng giữ điểm, các dòng này lại bị đẩy / nhường bởi dòng gốc trong top (ví dụ IB2300356962#0: rise-power CATC15 +8 `oil` chiếm một chỗ dành nhóm hãng, dòng thứ tư của tecgen ra, 16 dòng phía dưới nhích 1 hạng).
- Nhóm khác có trong script nhưng **không gặp ở phần A**: `diem-lech` (điểm đổi không khớp dự đoán), `he-qua-luat-B`, `he-qua-ngoai`, `thu-tu-cung-diem`, `chua`.

## 4. Kết quả từng bước

TSV: `nghiem-thu/do-gop-luot-5-pr.tsv` (25.981 dòng; cột: bước đo, lượt, loại, NCC, động cơ / đầu phát, băm chữ dòng, hạng / điểm trước và sau, PR, nhóm, cơ chế, đánh giá). Gồm 7 bước đo riêng + bước tích hợp (cột PR quy về PR).

### 4.1 #1174 (main → main+#1174): 12.735 dòng, 840 lượt

| Nhóm | Dòng | Chi tiết |
|---|---:|---|
| diem-khop | 4.297 | −3 mất `thd` đầu phát 2.647; +8 `oil` 943; +8 `compr` 477; +8 `disp` 38; tổ hợp (+0 / +5 / +16 …) 192 |
| luat-loai | 265 | hết bị loại compr 176; bị loại compr 64; bị loại maxDisp 9 / disp 8; hết bị loại maxDisp 5 / disp 3. Thêm 8 dòng `diem-khop` "−600 compr" ở model HSMT nêu tên |
| he-qua-truc-tiep | 8.034 | 6.932 dịch hạng, 642 ra, 460 vào |
| he-qua-day-chuyen | 139 | |
| chưa giải thích | **0** | |

Cùng ba cơ chế lượt 4 đã nêu (+8 / loại thông số, −3 `thd`, luật tỉ số nén); số khác lượt 4 chút ít vì `main` nay đã có #1166 / #1168 / #1169 / #1170 / #1178 / #1185.

**Lỗi tỉ số nén (mới).** Kiểm từng dòng "hết bị loại compr" (184 = 176 + 8): đọc toàn bộ giá trị `compr` của động cơ trong `modelFacts` cây #1174, chạy `comprFig` / so tỉ số HSMT:

| Lý do luật không còn loại | Dòng | Đánh giá |
|---:|---:|---|
| có ô không đọc được: "17.3：1", "17.3 ： 1", "16.1：1", "16.5：1", "17.1：1", "15：1", "16.8 ： 1", "14.2：1", "14.5：1", "13.5：1", "18.0：1", "13 ： 1", "14.7 ： 1" | **123** | **SAI**. Ví dụ: QSB59G30 / QSB59G31 / QSB59G33, QSB39G31 / QSB39G33 ("17.3 ： 1"); 6BT59G2, 6BTAA59G12, 6CTA83G1, 4BTA39G11 ("17.3：1"); TAD1641GE / TAD1651GE / TWD1653GE ("16.5：1"); MTA11G2 ("16.1：1"); P126TI ("17.1：1"); P158LE, DP222CA ("15：1"). Trước #1174 các ô này không đọc nên giá trị cũ một mình kết luận loại; nay thêm một giá trị null là luật bỏ qua. |
| các NCC ghi khác nhau (mâu thuẫn) | 56 | đúng luật ("mâu thuẫn thì giữ dòng"): TD226B6D, WP6D152E200, NT855GA, SC9D310D2, 6BTA59G2, KTA38G, SC12E460D2… |
| có giá trị trùng HSMT | 5 | đúng luật (6BTA59G2) |

64 dòng "bị loại compr" mới: giá trị đọc mới đồng nhất và khác HSMT; đúng theo luật nếu giá trị nguồn đúng (tôi không kiểm từng giá trị với tờ hãng).

**33 dòng dựa dung tích sai** (lượt 4, tái lập đủ 33): S180M 19, S175M 8 (+8 `disp` từ ô của kangwo-guangdong, dòng của xinzhengfa / kangwo), TAD531GE 4 (dingbo bị loại `disp` do ô mingbang-mbkl), 6135AD3 1 (taihai), 12M33D1450E310 1 (longkai bị loại maxDisp do ô zhengchi).

### 4.2 #1202 (main+#1174 → main+#1174+#1202): 58 dòng, 5 lượt

| Lượt | Dòng | Gốc | Đánh giá |
|---|---:|---|---|
| IB2300026252#0 | 22 | victory-generator YD480D bị loại `cyl` (số đông nay 4 xi lanh, HSMT ghi 3) | đúng: YD480D là 4 xi lanh; ô "3" của victory sai |
| IB2400333932#0 | 20 | taihai-taizhou QSK78G9 bị loại `cyl` (số đông 18 × 4, HSMT 16) | đúng: QSK78 18 xi lanh; ô "16V" của taihai sai |
| IB2300305099#0 | 8 | mingbang-mbkl TAD734GE bị loại `cyl` (6 × 16, HSMT 4) | đúng: TAD734GE 6 xi lanh |
| IB2200032133#0, IB2400236068#0 | 4 + 4 | yunding-jiangsu WP13D440E310 hết bị loại `cyl` (ô "9" không còn là số xi lanh) | đúng: WP13 6 xi lanh |

53 dòng còn lại: hệ quả trực tiếp trong 5 lượt trên. Với 33 dòng dung tích sai: #1202 còn **29** (TAD531GE hết cờ: ô lệch của mingbang bị bỏ; 4 dòng dingbo vẫn bị loại nhưng đúng: số đông 4,76 L × 3, HSMT đòi ≥ 5,9 L).

### 4.3 `bo-o-lech-4` (main+#1174+#1202 → + lech-4): 49 dòng, 16 lượt

28 dòng −8 mất `disp` (24 đổi điểm + 4 ra) đúng ở S175M / S180M / 6135AD3; 1 dòng hết bị loại maxDisp (longkai 12M33D1450E310); 20 dòng hệ quả trực tiếp. 29 dòng dung tích sai còn lại: **không còn dòng nào đổi** so `main` (đo main → main+#1174+#1202+lech-4: 12.733 dòng, 0 dòng dựa dung tích bị gắn sai).

### 4.4 #1203 (main → main+#1203): 645 dòng, 69 lượt

| Cơ chế | Dòng | Gốc |
|---|---:|---|
| +8 `start` | 54 | bảng nhãn shanhua "công suất động cơ dưới tiêu đề bị tách ô": 27 bản ghi động cơ mới có đúng model (trước model đọc thành "参") → YC6B180LD20, 12M33D1210E200, 16M33D1800E310, 12M33D1450E310 có thêm khoá `start` |
| −8 `engType` | 45 | "Turbocharged" dưới nhãn "Engine type" về `asp` (đã có) nên mất một loại: longkai / yihua 6BT59G296KW, jet-power / long-gen V2003TE2BGCHN1 |
| +16 `asp`, `start` | 9 | 16V4000G23F, YC6T660LD21 (bản ghi shanhua mới) |
| hết bị loại compr | 10 | 6BT59G2: tờ shanhua thêm giá trị đọc được; 5 dòng có giá trị trùng HSMT, 5 dòng mâu thuẫn giữa NCC → đúng luật |
| hệ quả trực tiếp / dây chuyền | 505 / 22 | |

### 4.5 #1201, #1200, #1192: 0 dòng

Đo riêng từng PR: top 30 giống `main` ở cả 1.057 lượt.

### 4.6 Tích hợp (6 PR + lech-4) so `main`: 12.494 dòng, 841 lượt

| Quy về | Dòng |
|---|---:|
| chuỗi #1174 / #1202 / lech-4, khớp đúng bước đo riêng | 11.312 |
| chuỗi, khác hạng khi gộp (dòng của #1203 cùng lượt) | 505 |
| #1203 khớp đúng | 88 |
| cả hai đo riêng đều đổi dòng này (khớp đúng một bên / cả hai) | 25 + 86 + 209 |
| một / cả hai đổi nhưng khác hạng khi gộp | 31 + 91 |
| **chỉ đổi khi gộp** | **147** |

147 dòng chỉ đổi khi gộp: 71 dòng hết bị loại compr (66 trong đó **SAI**: bản ghi shanhua mới của #1203 có ô "18：1" / "17：1" / "17.5：1" / "16.8：1" mà chỉ nhãn 压缩比 của #1174 đọc ra; YC6MK350LD20 14, WP6D132E200 14, WP41D66E200 10, WP10D264E200 10, QSZ13G10 6…; ví dụ IB2200008211#0 jet-power WP6D132E200: main / lech-4 / #1203 đều loại "18:1 ≠ 17,3:1", tích hợp thì giữ, điểm 257); 10 dòng vào nhờ +8 / +16 `compr` / `start` (cùng lý do); 66 dòng hệ quả trực tiếp. Không dòng nào ngoài các cơ chế trên.

Tổng dòng SAI do tỉ số nén không đọc được ở tích hợp: **196** (123 như #1174 riêng + 73 do bản ghi mới của #1203).

### 4.7 39 dòng chưa giải thích của lượt 4

Đối chiếu theo (lượt, loại, NCC, động cơ) với main → #1174: **khớp 39 / 39**: 32 `he-qua-day-chuyen`, 7 `he-qua-truc-tiep`. Cả 4 lượt (IB2300147640#0, IB2300232318#0, IB2300356962#0, IB2400303471#0) có dòng gốc của #1174 (+8 `oil` / luật compr) trong top; các dòng cùng điểm đổi chỗ vì dòng gốc chiếm chỗ dành nhóm hãng / trần NCC rồi kéo các dòng dưới. Không cần giả thuyết thứ tự nạp.

## 5. Việc đề nghị điều phối

1. Merge ngay được: #1201, #1200, #1192, #1203.
2. #1174: sửa `comprFig` nhận dấu hai chấm toàn chiều rộng ("N：1", "N ： 1", "N ：1") trước khi merge (thêm test với các ô ở bảng 4.1); đo lại top 30 sau sửa (kỳ vọng 123 dòng "hết bị loại compr" sai biến mất; nếu đã merge #1203 thì 196). Các điểm Khoa cần quyết của lượt 4 (+8 mỗi loại thông số làm đổi hạng hàng loạt; giữ 排气量) vẫn mở.
3. #1202 rồi `bo-o-lech-4` merge sau #1174: không còn dòng nào dựa dung tích sai.

## 6. Phần B: 925 dòng cũ chưa giải thích (đang đo)

Đã có: đo lại gốc `7d15b54c` ↔ `2917500f` cùng bidhist: 469 lượt / 424 gói, **6.960 dòng** (lượt 4: 6.959); khớp **6.958 / 6.959** dòng lượt 4 và **925 / 925** dòng chưa giải thích. Phân nhóm 925 dòng ở mức gốc→cuối: 718 hệ quả trực tiếp, 97 dây chuyền, 96 đổi điểm khớp khoá thông số, 12 đổi đầu phát của dòng, 2 luật loại.

Đang đo: 14 commit trung gian chạm mã chạy / `cn/` (lọc theo bao đóng import của `config-bot.mjs`: `cn/`, `datasheets/`, `config-bot.mjs`, `ratings.mjs`, `crawl-specs.mjs`, `web/catalog.js`, `spec-norm.js`…), chỉ 469 lượt có đổi. Ước tính xong khoảng 17:15 (dưới 3 giờ), sẽ bổ sung vào mục này và `do-gop-luot-5-925.tsv`.
