# Đo gộp lượt 4: 6 PR nháp chạm `candidates` (nhánh `tich-hop-luot-4-do-gop`)

Phiên con của điều phối, 24/11/2026. Đo MỘT lượt cho cả 6 PR (Khoa: không đo lẻ từng PR). Báo cáo không chép chữ HSMT; chỉ mã gói, số liệu, tên model, tên NCC.

## Tóm tắt

| Mục | Kết quả |
|---|---|
| Nhánh tích hợp | `tich-hop-luot-4-do-gop` (HEAD `ca393493`), từ `origin/main` `2917500f`. **Không phải `tich-hop-luot-4`**: tên đó đã có trên remote của phiên khác (head `d8a41abb`, gộp các nhánh `fix/*`), không đụng tới. Chưa mở PR, chưa merge main. |
| Thứ tự gộp | #1166, #1170, #1178, #1168, #1169, #1174, đúng yêu cầu |
| Xung đột | **2**: `web/catalog.js` (khi gộp #1168) và `web/CLAUDE.md` (khi gộp #1174); cả hai là hai bên cùng thêm vào một danh sách / một khối ghi chú, giữ cả hai. 4 lần gộp còn lại sạch (kể cả `quality-baseline.json` tự gộp). Chi tiết mục 1. |
| Sửa ngoài giải xung đột | **1** dòng test: `suppliers/gop-trung-ma.test.mjs` (#1168) `at(109, 43)` → `at(109, 20)`. Không phải do hai PR đụng nhau: `origin/main` đã trích lại `cn/kaihua-genset.json` sau gốc của #1168, dòng `KH-2000GF2` nay ở n109 dòng 20. Commit riêng. |
| Test | suppliers **1.757 test, 1.755 đạt, 0 lỗi, 2 bỏ qua** (sau chỉnh test; trước đó 1 lỗi đúng ca trên). web **171/171**. `verify.mjs`: 436 hồ sơ, 0 lỗi. `quality.mjs --check`: không chỉ số nào xấu đi. |
| spec-diff (so `origin/main`) | 63.678 → 63.678 bản ghi, **3.464 đổi, 0 mất, 0 thêm**, 634 bảng / 58 NCC; đảo vai 0 → 0; `gensetsOf` 34 đổi |
| spec-value-check (main → nhánh) | "sai" **405 → 345** (−60); "chưa chuẩn" 419 → 419; "cần xác nhận" 0 → 11 |
| Điều kiện đo | bidhist tải 24/11/2026 07:43 UTC (1.556 doc, 928 gói, **1.093 lượt**, 436 NCC), dùng CHUNG một bản cho 3 ref; 0 lượt lỗi. Bidhist ở ngoài repo, không commit. |
| **Gói / lượt top 30 đổi** | gốc `7d15b54c` ↔ tích hợp: **796 / 928 gói, 968 / 1.093 lượt**, 18.072 dòng. `origin/main` ↔ tích hợp (phần của 6 PR): **720 gói, 869 lượt, 13.020 dòng** (7.190 đổi hạng, 3.478 đổi điểm, 1.176 ra, 1.176 vào). Gốc ↔ `main` (#1148, #1160 và 45 PR khác đã merge chưa đo): 424 gói, 469 lượt, 6.959 dòng. |
| **Dòng chưa giải thích** | **39** (phần 6 PR) + **925** (phần gốc→main). Mục 4 và 5. |
| Dòng cần soát | **33** (phần 6 PR): giá trị dung tích mới bị bộ kiểm hình học gắn "sai". Mục 4.3. |

### Kết luận theo PR

| PR | Dòng top 30 đổi do PR này | Kết luận |
|---|---:|---|
| #1166 BĐK tên tắt | **0** | Về top 30: an toàn merge. |
| #1170 BĐK đúng model | **0** | An toàn merge. |
| #1169 giá trị sai (ROW_EXCEPTIONS) | **0** | An toàn merge. spec-diff có "fuel bỏ 60", "dims bỏ 23": không dòng nào vào / ra / đổi điểm top 30. |
| #1178 geo-vote | **0** | An toàn merge, nhưng hiệu lực gần như bằng không với top 30 (PR tự nói: 2 mã). Tắt `GENBID_GEO_VOTE=0` chạy lại 73 lượt có dòng vào / ra: kết quả loại dòng không khác. |
| #1168 gộp trùng mã | **20** (1 ra, 1 vào, 18 dịch hạng) | An toàn merge. Một động cơ: `NTA855-D(M)` của walter-yangzhou về khoá `NTA855-DM`, gói IB2400111485#0. |
| **#1174 nhãn thông số** | **12.980** | **Cần quyết / sửa trước khi merge.** Đổi top 30 ở 869 lượt vì thưởng +8 mỗi loại thông số động cơ (oil / disp / compr / start) và luật tỉ số nén đổi theo giá trị mới. 33 dòng dựa trên dung tích mới bị bộ kiểm hình học đánh sai (kangwo S175M / S180M, mingbang TAD531GE, taihai 6135AD3, zhengchi 12M33D1450E310). Mục 4.4. |

Giới hạn của kết luận "0 dòng": đo gộp, nên một dòng bị hai PR kéo ngược nhau sẽ triệt tiêu. Cơ chế của #1166 / #1170 / #1169 / #1178 không chung đường điểm với nhau (BĐK: +40 datasheet; ROW_EXCEPTIONS: số liệu ở nguồn; geo-vote: phiếu số đông) nên khả năng này thấp, nhưng tôi chưa đo lẻ.

## 1. Gộp nhánh

Thứ tự và kết quả (`git merge --no-ff` từ `origin/<nhánh>` mới fetch):

| # | Nhánh | PR | Kết quả |
|---|---|---|---|
| 1 | `wt-bdk-ten-tat` | #1166 | sạch |
| 2 | `ctl-dong-dung-model` | #1170 | sạch |
| 3 | `geo-vote` | #1178 | sạch |
| 4 | `gop-trung-ma` | #1168 | **xung đột `web/catalog.js`** |
| 5 | `gia-tri-sai` | #1169 | sạch |
| 6 | `claude/fix-spec-labels` | #1174 | **xung đột `web/CLAUDE.md`** |

**Xung đột 1: `web/catalog.js`, mảng `ENGINE_CELL_LIST` (quanh dòng 1980).** #1166 / main đã có khối "ma-dong-co-trung PR 3" (28 mục `…(3B)`, `…(3D)` và ghi chú các mã `(M)` Cummins để riêng); #1168 thêm khối "gop-trung-ma" (6 mục `4BTA3.9-GM4/7=…`, `4HTAA4.3*G34=…`, `KTA19-D(M)=…`, `KTA38-D(M)=…`, `NTA855-D(M)=…`, `(YD485D)=…`). Cả hai là thêm mục vào cùng danh sách, không trùng khoá. Giải: giữ cả hai khối, khối của main trước, của #1168 sau; chỉ bỏ ba dòng dấu xung đột. Không đổi mục nào.

**Xung đột 2: `web/CLAUDE.md` (dòng 83–87).** #1169 thêm mục "Giá trị sai do nguồn (gia-tri-sai…)", #1174 thêm mục "Nhãn `SPECS` mới đọc được…" liền sau cùng một mục. Giải: giữ cả hai mục theo thứ tự trên; bỏ dấu xung đột.

**Kỳ vọng test đổi:** một ca duy nhất, ghi ở bảng tóm tắt: `gop-trung-ma.test.mjs`, `at(109, 43)` → `at(109, 20)`; lý do: dữ liệu `cn/kaihua-genset.json` trên main đã trích lại (tách bảng con, #1105 / #1110 / #1111), không phải do #1168 và #1174 đổi chung. Các kỳ vọng `cand-disp-c`, `cand-disp-round` mà #1174 tự cập nhật vẫn đạt trên nhánh tích hợp; `config-accuracy.test.mjs` (#1170) đạt. Không PR nào cùng đổi một kỳ vọng test.

## 2. Test và kiểm tra (trên nhánh tích hợp, chờ xong trong lượt)

- `node --test suppliers/*.test.mjs`: 1.757 test, 1.755 đạt, **0 lỗi**, 2 bỏ qua (hai ca "19 gói thật …" cần dữ liệu ngoài repo, có sẵn). Lần chạy đầu 1.754 đạt / 1 lỗi (ca kaihua nói trên).
- `node --test web/test/*.test.mjs`: 171 / 171. (CI `test-web.yml` còn chạy `static.test.mjs` và Playwright; tôi không chạy Playwright.)
- `node suppliers/verify.mjs`: 436 bản ghi, 0 lỗi. `node suppliers/quality.mjs --check`: không chỉ số nào xấu đi quá ngưỡng (compr nằm ở mốc 76, đúng như #1174 đã nâng).
- `node suppliers/spec-diff.mjs git:origin/main .`: 3.464 bản ghi đổi. Theo khoá (lượt đổi): oil thêm 1.776, disp thêm 1.094, compr thêm 565, coolant thêm 408, thd bỏ 64, fuel bỏ 60, model 32, dims bỏ 23, start thêm 22, power 3, bore bỏ 3, compr bỏ 1, genset 1. Đảo vai 0 → 0. Lớp chuẩn hoá (spec-norm): 1.746 thông số đổi kết quả. Số "đổi" khớp từng khoá với báo cáo của #1174 (oil / disp / compr / coolant / start / thd) và #1169 (fuel / dims), và #1168 (model 32).
- `node suppliers/spec-value-check.mjs`: main 405 sai / 419 chưa chuẩn → nhánh 345 sai / 419 chưa chuẩn / 11 cần xác nhận. (Số 405 trùng báo cáo #1174; #1169 tự đo 404 trên gốc cũ của nó.) Trùng mã 65 → 56 nhóm.

## 3. Cách đo top 30

- `NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs <cây code> <cn của chính cây đó> <out> --bidhist <bản chung>` cho ba cây: gốc `7d15b54c` (trước #1148), `origin/main` `2917500f`, nhánh tích hợp `ca393493`. Mỗi lượt 37–42 phút. Bidhist tải một lần (`--save-bidhist`) rồi dùng chung.
- **Lệch so hướng dẫn trong `suppliers/CLAUDE.md`**: tài liệu nói gốc và nhánh dùng CHUNG `cn`. Tôi để mỗi cây dùng `cn` của chính nó vì cả #1166 (`cn/woodward.json`, datasheets), main (tách bảng con, dựng lại hồ sơ) lẫn các PR đều đổi `cn`; đo với cn chung sẽ bỏ phần dữ liệu của chính các PR. Nếu Khoa muốn cn chung thì phải đo lại.
- So khoá dòng bỏ trường đầu phát (theo ghi chú `suppliers/CLAUDE.md`).
- Chẩn đoán thêm (không phải đo lẻ top 30): (a) xuất tập khoá thông số `modelFacts` theo model ở cả ba cây (`factkeys`); (b) chạy lại `candidates` chỉ cho các lượt có dòng vào / ra do tập ứng viên đổi (73 lượt phần 6 PR, 338 lượt phần gốc→main) kèm mã luật loại (`ruled`); (c) cùng 73 lượt với `GENBID_GEO_VOTE=0`. Script ở thư mục làm việc phiên con, không nằm trong repo.

## 4. Phần của 6 PR (`origin/main` ↔ tích hợp)

Bảng từng dòng: `nghiem-thu/do-gop-luot-4-6pr.tsv` (13.020 dòng; cột: lượt, loại, NCC, động cơ, hạng và điểm hai bên, nguyên nhân, PR, đánh giá). Mọi gói có top 30 đổi (720 gói) đều có mặt.

### 4.1 Cơ chế (đã kiểm bằng máy cho từng dòng)

Điểm `candidates` có hai thành phần phụ thuộc thông số: **+8 × số loại thông số của động cơ** (`eKeys`, tối đa 8) và **+3 × số loại thông số của đầu phát** (tối đa 6). Tôi xuất tập khoá thông số của từng model ở hai cây và dự đoán độ lệch điểm của MỖI dòng đổi điểm:

- **3.478 dòng đổi điểm: 3.470 khớp dự đoán đúng từng điểm** (−3: 2.384 dòng, mất khoá `thd` của đầu phát; +8: 1.052; +16: 17; +5: 14; −8: 3). 8 dòng còn lại là +600: gói IB2300130792#0, model 6BT5.9-G1 do HSMT nêu tên, trước bị luật tỉ số nén −600, nay hết (giá trị `compr` đọc mới); 8 dòng này cũng được máy giải thích (luật `compr` ở `main`, không có ở nhánh).
- Khoá thông số đổi (số model): oil 748 (284 thêm khoá), disp 581, compr 289, controller 42, thd (đầu phát) 38 mất, start 22, cyl 6 và bore 5 (mất do gộp khoá của #1168), `2206CE13TAG2L` mất 1 compr (ô "16 3:1" của gfe-power bị `compr.ok` mới loại: đúng).
- Dòng **vào / ra**: 1.176 dòng mỗi chiều. Do điểm riêng đổi: ra 397 + vào 480; do bị dòng khác vượt / nhường: ra 667 + 34, vào 500 + 15; do tập ứng viên đổi: ra 78 + vào 181 (phân tích dưới).
- Dòng **chỉ đổi hạng** (7.190): hệ quả của các dòng trên; mỗi dòng đã kiểm có ít nhất một dòng đổi (điểm / vào / ra) ở vị trí cao hơn hoặc bằng trong cùng lượt.

### 4.2 Dòng đổi tập ứng viên (do luật loại)

Chạy lại `candidates` ở 73 lượt này, đọc `ruled` của từng dòng:

| Nhóm | Số dòng | Nguyên nhân | PR |
|---|---:|---|---|
| vào: main loại bằng `compr`, nhánh không | 173 | HSMT ghi tỉ số nén chính xác; giá trị `compr` mới đọc được (ví dụ "17.3 ： 1" dấu hai chấm toàn chiều rộng của voltgent / longkai, 17.5 của chenxing: có giá trị trùng HSMT hoặc mâu thuẫn giữa NCC) nên luật không còn kết luận loại ("không đọc được / mâu thuẫn thì giữ dòng") | #1174 |
| ra: nhánh loại bằng `compr` | 60 | giá trị mới (chenxing, zhengdian…) đồng nhất khác HSMT | #1174 |
| ra: nhánh loại bằng `maxDisp` / `disp` | 9 + 8 | 排气量 mới đọc được cho model trước đó chưa có dung tích: P222LE (zhengdian 21,927 L), TAD531GE (số đông 4,76 L), TBD604BL6 (zhengdian 26,56 L), TBD620V12, G128ZLD11… Tôi chưa kiểm đúng sai từng giá trị; ca bị bộ kiểm hình học gắn cờ ở mục 4.3 | #1174 |
| vào: main loại bằng `maxDisp` / `disp` | 5 + 3 | thêm giá trị làm số đông tan (WP13D440E200, WP12D317E200, SC8D250D2) | #1174 |
| đổi khoá model | 1 | `NTA855-D(M)` → `NTA855-DM` | #1168 |

`GENBID_GEO_VOTE=0` ở 73 lượt này không làm đổi kết quả loại của dòng nào: **không dòng nào do #1178**.

### 4.3 Dòng cần soát (33)

Dòng đổi điểm / vào / ra có nguyên nhân là khoá dung tích (`disp`) mà bộ kiểm hình học (`spec-value-check`, luật `hinh-hoc`, mức "sai") gắn cờ ở chính model đó:

| Model | NCC có giá trị bị gắn "sai" | Dòng |
|---|---|---:|
| S180M | kangwo-guangdong | 19 (xinzhengfa 10, kangwo 9) |
| S175M | kangwo-guangdong | 8 |
| TAD531GE | mingbang-mbkl | 4 (dingbo) |
| 6135AD3 | taihai-taizhou | 1 |
| 12M33D1450E310 | zhengchi-power | 1 (longkai-power) |

Ghi chú về giới hạn: cờ ở mức MODEL + trường, không chứng minh được giá trị gây ra chính dòng đó (có thể cờ ở NCC khác trong cùng khoá). Các NCC kangwo / zhengchi / haifeng / taihai đã được #1174 tự nêu là đề xuất `dropspec`.

### 4.4 Đánh giá #1174

- Cơ chế của #1174 khớp ý PR: thêm 排气量 / 压缩比 / 启动方式 / nhãn dầu-nước làm mát làm tăng số loại thông số, và bỏ THF khỏi THD làm mất khoá `thd` của đầu phát (−3 cho 2.384 dòng). Độ đúng của giá trị mới tôi chỉ kiểm được ở `disp` (bộ kiểm hình học); PR tự nêu khoảng 5 % số `disp` mới sai hình học. `compr`, dầu, `start` không có bộ kiểm tương đương trong lượt này.
- Nhưng hiệu ứng lên Gợi ý rộng: **869 / 1.093 lượt đổi top 30**; thưởng +8 mỗi loại thông số khiến dòng thuộc model có nhiều NCC ghi thêm nhãn nhảy hạng so với dòng không có.
- Việc Khoa cần quyết / PR cần sửa trước merge: (1) giữ hay tách 排气量 (PR hỏi); riêng 5 nhóm model ở 4.3 dựa vào dung tích mà bộ kiểm chính nó báo sai, nên dùng `dropspec` / `TABLE_DROPS` cho kangwo, zhengchi, taihai, mingbang trước; (2) có chấp nhận thưởng +8 / loại thông số làm đổi hạng hàng loạt hay không; (3) mốc `compr` 48 → 76 (đã đạt `--check`).

### 4.5 39 dòng chưa giải thích (6 PR)

Lượt IB2300147640#0, IB2300232318#0, IB2300356962#0, IB2400303471#0: dòng cùng điểm đổi chỗ (vào / ra / dịch hạng, 30 + 5 + 4) mà điểm riêng giữ nguyên. Cùng lượt, tập `all` đổi lớn (ví dụ IB2300147640#0: 784 → 824 ứng viên, 88 dòng đổi điểm) nên nghi luật B (chia chỗ theo model / NCC) và trần mỗi NCC xếp lại các dòng cùng điểm khi tập ứng viên đổi, tức hệ quả gián tiếp của #1174 (IB2300232318#0 còn thêm đổi khoá `(YD485D)` → `YD485D` của #1168). Tôi chưa kiểm từng dòng nên ghi "chưa giải thích", không gán PR.

## 5. Phần gốc → `main` (#1148, #1160 và các PR đã merge chưa đo)

Bảng từng dòng: `nghiem-thu/do-gop-luot-4-goc-main.tsv` (6.959 dòng, 424 gói). Gồm 4.482 dòng đổi hạng, 279 đổi điểm, 1.104 ra, 1.092 vào.

Phần đã gán cơ chế và PR ứng viên (PR ứng viên = PR đã sửa `cn/<NCC>.json` hoặc `datasheets/<NCC>.json` trong khoảng, hoặc luật tương ứng; một dòng có thể có nhiều PR ứng viên, chưa phân tách):

- **611 dòng ra do luật số pha** (`ruled: phase`; HSMT đòi 3 pha loại dòng một pha): **#1118**.
- **35 dòng vào** do luật tần số mới ("giữ dòng không ghi tần số, cần xác nhận"): **#1114**; 12 dòng ra do luật tần số trên dòng phân đoạn Hz: #1114 / #1118 / #1111.
- Điểm đầu phát +12 (vreg, insul, ip, eff; 150 dòng sanq / stone / acepow / sinogen…): đoán theo tên model đầu phát (tờ hãng Stamford PI734 / LVSI804 → **#1164, #1149, #1140**; chưa phân tách ba PR) (+3 mỗi loại thông số đầu phát). +8 do khoá động cơ mới, +40 bộ điều khiển có datasheet SmartGen: **#1148, #1154, #1149, #1140**.
- Dòng NCC thêm / mất vì dựng lại hồ sơ (tách bảng con): **#1105, #1110, #1111**.
- **#1160 (kW/Hp ricardo)**: không có dòng nào gán được cho #1160. Trong các dòng vào / ra được chẩn đoán, không dòng nào có mã luật `band` hay `prime`. Điều này không chứng minh tác động bằng 0 ở phần 925 dòng chưa giải thích.
- **#1148 (bỏ trần 700, bảng bộ điều khiển)**: chỉ đổi dữ liệu bộ điều khiển (SmartGen / Datakom / Deif / Sices…); tác động lên top 30 qua +40 datasheet BĐK (377 dòng có #1148 là PR ứng viên). Chưa tách riêng với #1154 / #1149 / #1140 (cùng NCC smartgen).

**925 dòng chưa giải thích** (13 % của 6.959): 380 dòng chỉ dịch hạng mà không truy được dòng đổi nào ở phía trên; 76 dòng đổi điểm +8 do khoá `emission` / `oil` của động cơ (không commit nào trong khoảng đưa khoá này vào code: nghi dữ liệu bảng mới của NCC KHÁC cho cùng động cơ nhờ tách bảng con, chưa truy được NCC); 346 dòng vào + 123 dòng ra "dòng mới / mất trong tập ứng viên của NCC" mà tệp `cn` của NCC đó không đổi trong khoảng. Cột đánh giá ghi "CHƯA GIẢI THÍCH" cho từng dòng. Tôi chưa có cách truy tiếp trong phạm vi lượt này (cần chạy so lẻ từng commit).

## 6. Việc đề nghị điều phối

1. Merge #1166, #1170, #1169, #1178, #1168 (về top 30 không đổi / đổi 20 dòng). Trước khi merge #1168: sửa test `gop-trung-ma.test.mjs` như commit trong nhánh tích hợp (dòng 109/20) vì main đã đổi dữ liệu.
2. #1174: hỏi Khoa 3 điểm ở 4.4; đề nghị bổ sung `dropspec` cho kangwo / zhengchi / mingbang / taihai trước.
3. Nhánh `tich-hop-luot-4` của phiên khác trên remote không liên quan; tên nhánh của lượt này là `tich-hop-luot-4-do-gop`.
4. 39 + 925 dòng chưa giải thích: cần đo lẻ từng commit nếu Khoa muốn đóng hết.

Tệp tạm của phiên (bidhist, JSON đo, script) ở thư mục tạm của phiên con, ngoài repo; không có token hay khoá nào được đọc / in.
