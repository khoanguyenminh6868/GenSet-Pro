# Soát 28 nhóm trùng mã (ngoặc "(M)"/"(E)" và nhóm còn lại)

Việc soát chỉ đọc. Không sửa mã, không sửa dữ liệu, không tra internet. Dữ liệu: `GenbidCatalog.build` trên `suppliers/cn/*.json` ở main `8832317f`, và danh sách `duplicates.json` (28 nhóm không có `^` / `★`). Các nhóm dưới đây đánh số theo thứ tự trong danh sách đó. Chi tiết: `dau-vao\trung-ma\ket-luan.tsv` (bảng dưới), `chi-tiet.tsv` (mọi dòng nguồn của động cơ, đầu phát), `chi-tiet-to-may.tsv` (dòng nguồn của tổ máy).

## Kết quả

| Kết luận | Số nhóm | Nhóm |
|---|---|---|
| Cùng một mã, có bằng chứng | 12 | 2, 4, 9, 10, 12, 15, 18, 20, 21, 22, 23, 24 |
| Khác mã, có bằng chứng | 1 | 28 |
| Chưa đủ bằng chứng (giữ riêng) | 9 | 1, 3, 5, 6, 7, 17, 25, 26, 27 |
| Khoa đã quyết để riêng (24/11/2026), không đề xuất lại | 6 | 8, 11, 13, 14, 16, 19 |

Nhóm "mức vừa": 4, 21, 22, 23, 24. Bằng chứng có nhưng không phải bản sao nguyên văn của một dòng; xin Khoa duyệt riêng.

6 mã Cummins "(M)" là `4BTA3.9-G2(M)`, `6BT5.9-G2(M)`, `KTA19-G3(M)`, `KTA19-G4(M)`, `KTA38-G(M)`, `NTA855-G2(M)`. Nguồn: PR #1115 (còn mở, test `ma-dong-co-trung-3.test.mjs`, ghi "Khoa 24/11/2026"). Chúng khớp 6 nhóm 8, 11, 13, 14, 16, 19. Chỉ ghi nhận một dữ kiện, không đề xuất: huayuan-weifang n103 (cùng một bảng) viết `4BTA3.9-G2M`, `6BT5.9-G2M` ở dòng 0–2 và `KTA19-G3(M)`, `NTA855-G2(M)`... ở dòng 10–14.

## Bảng 28 nhóm

Cột "bản ghi" là số lần dùng khoá A + khoá B (động cơ, đầu phát) hoặc số dòng bảng (tổ máy).

| # | Khoá A ↔ khoá B | Kết luận | Bằng chứng | Bản ghi |
|---|---|---|---|---|
| 1 | `ECP282S/4C` ("ECP 28-2S/4C", endress) ↔ `ECP282S4C` ("ECP28.2S4C" himoinsa-china; "ECP28-2S4C" welland-power) | chưa đủ | Không có trường chung: endress n120/n141/n1012 là bộ 15/12 kVA/kW, 60 Hz, 3TNV88-GGE, 1642 cc, điện áp 220/127 V. himoinsa n139/n140 là 8,1 kVA, 3TNV76HSPU, 1,116 L. welland n101 r132 là 9 kVA, Perkins 403A-11G1, 1 pha. Tờ hãng Mecc Alte (`datasheets/mecc-alte.json` n1009) viết "ECP28 2S4 C", không có dạng "/". | 3+3 |
| 2 | `ECP28M/4C` ("ECP 28-M/4C", endress n113, n114, n1013, n1024) ↔ `ECP28M4C` ("ECP28 M4C", "ECP28 M4 C", "ECP28-M4 C", endress) | **cùng một mã** | Cùng NCC viết hai cách cho cùng dòng. endress n114 "ECP 28-M/4C" và n144 "ECP28 M4 C": cả hai 50 Hz, PRP 18,3/14,6 kVA/kW, động cơ 2190 cc, 17,3 kW (mã động cơ khác chữ: 4TNV88-BIGE / -BIPGE). Cùng 4 trường độc lập. Tờ hãng Mecc Alte viết "ECP28 M4 C". Lưu ý: n133/n140 "ECP28 M4C" đi cùng động cơ 3170 cc / 25 kW, nên đầu phát này ghép được nhiều động cơ. | 4+4 |
| 3 | `ECP322S/4C` ("ECP32-2S/4C", endress n118, n125, n1020) ↔ `ECP322S4C` ("ECP32 2S4 C", endress n109, n1017) | chưa đủ | Không trường chung: "ECP32-2S/4C" là 50 Hz, 4TNV98CT-IYE, 3319 cc. "ECP32 2S4 C" là 60 Hz, Cummins 4BT3.9-G2, 3900 cc. Nhóm 2 cho thấy endress có hai cách viết cho một máy, nhưng đem áp sang nhóm 3 là suy theo cách đặt tên. Tờ hãng viết "ECP32 2S4 C". | 3+2 |
| 4 | `UCI274C(80KW)` (jinlongteng-fujian n101, 4 dòng) ↔ `UCI274C80KW` ("UCI274C-80KW", yihua-fujian n106) | **cùng một mã (mức vừa)** | Cùng mã gốc UCI274C và cùng mức 80 kW. jinlongteng gắn "(nnKW)" cho mọi đầu phát trong bảng (UCI224E(48KW), UCI274D(96KW), UCI274E(112KW)…). yihua ghi "Rated Output 80KW" và dải điện áp 380/220, 400/231, 415/240, 440/254 trùng "VOLTAGE SERIES STAR" của tờ hãng Stamford UCI274C-311 (`datasheets/stamford-avk-china.json` n1002). Chưa chứng minh gộp về `UCI274C` trơn (hơn 150 lần ghi trong 37 tệp NCC): tờ hãng không ghi kW. | 4+1 |
| 5 | `1100F(E)` (zc-power n105) ↔ `1100FE` (xinhengxin-fujian n101) | chưa đủ | Cặp này lệch số: zc 100x84 mm, 660 cc; xinhengxin 100*85 mm, 0,667 L. Công suất: zc ZC-10S 10,0 kW (tối đa 10,5), xinhengxin động cơ 9,2/9,8 kW. | 1+1 |
| 6 | `186FA(E)` (zc-power) ↔ `186FAE` (xinhengxin) | chưa đủ | Hình học trùng (86x72, 418 cc) nhưng 418 cc suy ra từ 86x72 nên không phải hai trường độc lập. Tỉ số nén lệch: zc 19:1, xinhengxin 19,5. | 1+1 |
| 7 | `192F(E)` (zc-power) ↔ `192FE` (xinhengxin) | chưa đủ | Chỉ trùng hình học (92x75; 498 cc / 0,499 L), không độc lập. xinhengxin không ghi tỉ số nén cho 192FE (dòng "Compression Ratio" có hai giá trị). | 1+1 |
| 8 | `4BTA39G2(M)` ↔ `4BTA39G2M` | Khoa đã quyết để riêng | lees-power n113, xingguang-jiangsu n123 (dạng "(M)") ↔ huayuan-weifang n103 (dạng "M"). | 2+2 |
| 9 | `4BTA39GM4/7` (kangwo-guangdong n108 t8 r1, dòng CCFJ40JW) ↔ `4BTA39GM47` (22 lần, 10 NCC) | **cùng một mã** | Cùng NCC, cùng bảng, dòng ngay trên (r0, CCFJ30JW) viết "4BTA3.9-GM47". Hai dòng cùng ghi công suất động cơ "47/1500", 4 xi lanh, 3,9 L. fengfa-taizhou n101 r1 cùng tên tổ máy CCFJ40JW, 40/50 kW/kVA, kích thước 1740*850*1270 và 800 kg đều trùng dòng kangwo, mã "4BTA3.9-GM47". | 1+22 |
| 10 | `4HTAA43*G34` (frs-shenyang n106 r23, FRS-80SP) ↔ `4HTAA43G34` (21 lần, 16 NCC) | **cùng một mã** | Cùng bảng: G31, G32, G33, *G34, G35, G36 (chỉ một dòng có "*", còn lại "-"); dòng 6HTAA6.5-G34 viết "-G34". 80 kW, 4 xi lanh, 4,3 L khớp các dòng "4HTAA4.3-G34" của NCC khác (APP-95GF, BDA-S80 cùng 80 kW). | 1+21 |
| 11 | `6BT59G2(M)` ↔ `6BT59G2M` | Khoa đã quyết để riêng | lees-power n113, xingguang-jiangsu n122 ↔ huayuan-weifang n103. | 2+1 |
| 12 | `KTA19D(M)` (mecca-power n190, walter-yangzhou n116) ↔ `KTA19DM` (7 NCC) | **cùng một mã** | walter-yangzhou viết cả hai: CCFJ350JW "KTA19-D(M)" (n116) và CCFJ350YW "KTA19-DM" (n114), cùng 350 kW; tiêu hao 84,82 = 84,82, hành trình 159*159, 6 xi lanh, 19 L. mecca-power cũng viết cả hai ở n187/n188 và n190 nhưng số tiêu hao không khớp nhất quán (82,5 / 83,0 ở 300 kW; KTA38: 167 / 135,0 ở 500 kW và 167 / 167,0 ở 600 kW), nên chỉ coi là phụ. | 5+30 |
| 13 | `KTA19G3(M)` ↔ `KTA19G3M` | Khoa đã quyết để riêng | huayuan-weifang n103 r12 ↔ rise-power n106, victory-generator n113. | 1+3 |
| 14 | `KTA19G4(M)` ↔ `KTA19G4M` | Khoa đã quyết để riêng | huayuan-weifang n103 r13 ↔ rise-power, victory-generator, xinzhengfa, zhengdian-zhengzhou. | 1+5 |
| 15 | `KTA38D(M)` (mecca-power, walter-yangzhou) ↔ `KTA38DM` (6 NCC) | **cùng một mã** | walter-yangzhou n116 CCFJ600JW "KTA38-D(M)" và n114 CCFJ600YW "KTA38-DM", cùng 600 kW: tiêu hao 146,11 và 146,12 (lệch 0,01), 159*159, 12 xi lanh, 38 L. | 7+41 |
| 16 | `KTA38G(M)` ↔ `KTA38GM` | Khoa đã quyết để riêng | huayuan-weifang n103 r14 ↔ victory-generator n113. | 1+3 |
| 17 | `NT855D(M)` (mecca-power n190, 5 dòng) ↔ `NT855DM` (kaihua-genset n115, taihai-taizhou n117, yanfa-yancheng n111) | chưa đủ | Không NCC nào viết cả hai. Dung tích 14 L và 6 xi lanh là của mọi NT855 nên không phân biệt. Cùng bảng mecca n190 viết "D(M)" cho KTA19 và KTA38 (đã có bằng chứng ở nhóm 12, 15), nhưng suy sang NT855 là suy theo cách viết cả bảng. | 5+4 |
| 18 | `NTA855D(M)` (walter-yangzhou n116) ↔ `NTA855DM` (8 NCC) | **cùng một mã** | walter-yangzhou n116 CCFJ250JW "NTA855-D(M)" và n114 CCFJ250YW "NTA855-DM", cùng 250 kW: tiêu hao 61,18 = 61,18, hành trình 140*152, 6 xi lanh, 14 L. | 1+30 |
| 19 | `NTA855G2(M)` ↔ `NTA855G2M` | Khoa đã quyết để riêng | huayuan-weifang n103 r10 ↔ rise-power, victory-generator, xinzhengfa, zhengdian-zhengzhou. | 1+5 |
| 20 | `(YD485D)` (acepow-fuan n114 r19, APYD-15 60 Hz) ↔ `YD485D` (6 lần, 4 NCC) | **cùng một mã** | Trong 33 dòng của bảng chỉ một ô động cơ có ngoặc; dãy 60 Hz YD480D, (YD485D), YND485D khớp dãy 50 Hz. Công suất APYD-15 (15 / 16,5 kW, 18,8 / 20,6 kVA) trùng EP-YD15 của excel-power, YD485D, 15 / 16,5 kW và 18,75 / 20,6 kVA; "18KW/1800rpm" trùng cột công suất động cơ 18 kW của mamo-power TYD21. `web/CLAUDE.md` đã ghi đây là lỗi đọc chưa sửa. | 1+6 |
| 21 | `KH*2000GF` (kaihua-genset n111 r40) ↔ `KH2000GF` ("KH-2000GF", 5 bảng n101, n105, n109, n112, n117) | **cùng một mã (mức vừa)** | Cùng NCC. 2750/2500 kVA trùng ở hai trường. Trong bảng n111 chỉ dòng này có "*", nằm giữa KH-1800GF và KH-2200GF. Lưu ý: KH-2000GF đã có 4 động cơ khác nhau trong các bảng của kaihua (20V4000G23, 4016-61TRG3X, 12M55D2420E311, YC16VC3300-D31), nên động cơ khác không phân biệt. `KH-2000GF2` (n109) là mã khác, giữ. | 1+5 |
| 22 | `RC1375D5/S` ("R-C1375D5/S") ↔ `RC1375D5S` ("R-C1375D5-S"), rcg-power n103, n120, n124 | **cùng một mã (mức vừa)** | Cùng NCC, ba bảng giống nhau: chính 1375/1100 kVA/kW, dự phòng 1500/1200, động cơ KTA50-G8. Khác duy nhất đầu phát (LSA50.2L7 so với S6L1D-H4). Tên "R-C1875D5A-S" được NCC dùng cho cả hai đầu phát (LSA52.3S5 và S7L1D-F4), tức tên không mã hoá đầu phát. Rủi ro: nếu "/S" và "-S" là hai bản đầu phát cố ý thì gộp mất phân biệt. | 3+3 |
| 23 | `RC1500D5/S` ↔ `RC1500D5S` ("R-C1500D5-S") | **cùng một mã (mức vừa)** | Như nhóm 22: 1500/1200 và 1650/1320 kVA/kW, động cơ KTA50-GS8; đầu phát LSA50.2L8 so với S7L1D-C4. | 3+3 |
| 24 | `RC1875D5/S` ↔ `RC1875D5S` ("R-C1875D5-S") | **cùng một mã (mức vừa)** | Như nhóm 22: 1875/1500 và 2063/1650, động cơ QSK50-G16; đầu phát LSA52.3S5 so với S7L1D-F4. | 3+3 |
| 25 | `SC250E5` ↔ `SC250E5#` (stone-power n107 r23, r24) | chưa đủ | Công suất (220/200 kW, 275/250 kVA) và đầu phát (UCD274K, MP-200-4, WHI 274K) trùng, nhưng động cơ khác (6LTAA8.9-G2 / NT855-GA). Dấu "#" không có chú thích trong nguồn. Cùng bảng NCC dùng lặp một tên cho hai động cơ khác không có "#" (SC180M5, SC450E5, SC500E5). Cùng loại dấu NCC tự gắn như `^` (Khoa 21/11/2026 tách). | 1+1 |
| 26 | `SC350E5` ↔ `SC350E5#` (n107 r27, r28) | chưa đủ | Như nhóm 25: động cơ NTA855-G2A / NTA855-G4. | 1+1 |
| 27 | `SC500E5` ↔ `SC500E5#` (n107 r33, r34, r35) | chưa đủ | Như nhóm 25: khoá trơn có QSZ13-G3 và KTA19-G3A, khoá "#" có KTA19-G4. | 2+1 |
| 28 | `TCG1000N5` ("TCG-1000N5") ↔ `※TCG1000N5` (ettes-power n103 r3, r4) | **khác mã** | Cùng 1000 kWe nhưng động cơ khác (TCG3016V16S CG132-16 / TCG2020V12K CG170-12), công suất động cơ 1042 / 1187 kW, dung tích 35 / 53,1 L, nhiệt 1100 / 1177 kWt, hiệu suất điện 40,5 / 43,0 %. Khác ≥ 4 trường độc lập. Dấu "※" cũng đứng trước TCG-400N5, 1125N5, 2300N5 như một nhãn dòng. | 1+1 |

## Đề xuất cách gộp (chỉ cho các nhóm "cùng một mã", cần Khoa duyệt trước khi sửa)

Nơi sửa cho động cơ là `ENGINE_CELL_LIST` (`web/catalog.js` quanh dòng 1943–1975, dạng "ô=mã"). `splitEngineCells` gặp ô có đúng một mã thì đổi `model` về mã đó và giữ nguyên số liệu của dòng. Bảng này không tách theo NCC: ô khớp `keyOf` sẽ đổi ở mọi NCC.

| Nhóm | Mục thêm | Bản ghi đổi khoá |
|---|---|---|
| 9 | `"4BTA3.9-GM4/7=4BTA3.9-GM47"` | 1 (kangwo n108 r1) |
| 10 | `"4HTAA4.3*G34=4HTAA4.3-G34"` | 1 (frs-shenyang n106 r23) |
| 12 | `"KTA19-D(M)=KTA19-DM"` | 5 (mecca 3, walter 2) |
| 15 | `"KTA38-D(M)=KTA38-DM"` | 7 (mecca 4, walter 3) |
| 18 | `"NTA855-D(M)=NTA855-DM"` | 1 (walter) |
| 20 | `"(YD485D)=YD485D"` | 1 (acepow n114 r19) |

- Nhóm 12 và 15: bằng chứng mạnh là của walter-yangzhou, còn mecca-power chỉ là phụ. Gộp theo bảng này đổi cả dòng mecca. Muốn chỉ đổi walter thì cần một bảng riêng theo NCC.
- PR #1115 (còn mở) cũng thêm mục vào cùng khối `catalog.js` quanh dòng 1972. Nên sửa sau khi #1115 vào main để tránh xung đột.
- Nhóm 2 và 4 (đầu phát) và nhóm 21 đến 24 (tổ máy): `catalog.js` chưa có bảng tường minh tương đương (`ENGINE_CELL_LIST` chỉ xử lý `kind === "engine"`). Muốn gộp phải thêm bảng cùng kiểu. Nhóm 2 đổi 4+4 bản ghi, nhóm 4 đổi 4+1. Nhóm 21 đổi 1 dòng bảng (khoá tổ máy theo NCC), nhóm 22 đến 24 mỗi nhóm đổi 3 dòng.
- Nhóm 4 và các nhóm "mức vừa" (21 đến 24): đề xuất chỉ gộp hai khoá với nhau. Gộp `UCI274C(80KW)` về `UCI274C` trơn thì cần quyết định riêng.

## Điểm cần Khoa quyết

1. Nhóm 22 đến 24 (RCG "/S" và "-S"): gộp, hay giữ riêng vì có thể là hai bản đầu phát? Dữ liệu nghiêng về gộp (tên D5A-S dùng cho cả hai đầu phát), nhưng nguồn không nói gì về ý nghĩa của "/" và "-".
2. Nhóm 25 đến 27 ("#" của stone-power): có coi như `^` (tách cố ý) không? Nguồn không chú thích "#".
3. Nhóm 12 và 15: gộp cả mecca-power hay chỉ walter-yangzhou?
