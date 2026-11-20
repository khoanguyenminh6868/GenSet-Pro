# Nghiệm thu PR 2 — huatai n111 (7C) + yingtai n101 / n2003 (6C) (20/11/2026)

## Câu hỏi cho Khoa (mỗi câu một chữ)
1. **QSL9G2 / G3 / G4 tỉ số nén 17.8:1 của yingtai** (Cummins không có tờ cho G2–G4; tờ QSL9-G5 ghi 16.8:1, QSL9-G15/G16 16.1:1, yingtai ghi 17.8 cho cả G2–G5 — G5 đã sai theo hãng, có thể chép xuống): **A** giữ (khuyến nghị theo "không suy ra") · **B** bỏ riêng tỉ số nén của các dòng QSL9 yingtai (dropspec).
2. **QSK60G7 tỉ số nén 16.2:1** (Cummins ghi 14.5:1 cho QSK60-G4 / G8, tờ G7 không ghi): **A** giữ · **B** bỏ riêng.
3. **QSK19G4 mất giá trị thắng đường kính × hành trình** (đếm theo CHỮ: "159*159" 3 phiếu, "159x159" nay 2 → không còn gấp 3; config-bot đếm theo SỐ nên Gợi ý không bị): **A** để vậy, ghi nhận (khuyến nghị) · **B** mở việc đếm `win` của catalog theo số.

## Đối chiếu Cummins (yêu cầu điều phối 20/11/2026)
Nguồn: cummins.com (và mart.cummins.com), đọc 20/11 qua Firecrawl. "G-drive sheet" = cummins.com/sites/default/files/2019-06/<MODEL>.pdf (hay 2018-10/…): ghi bore / stroke / dung tích / xi lanh, KHÔNG ghi tỉ số nén.

### 14 số yingtai khác số NCC khác
| # | model | số | yingtai | NCC khác | Cummins ghi | URL | kết luận |
|---|---|---|---|---|---|---|---|
| 1 | KTA19G4 | bore | 159X160 | 159×159 (12 NCC) | Bore 159 / Stroke 159 mm | cummins.com/sites/default/files/2019-08/KTA19-G4%20Coolpac_3.pdf | **yingtai sai → dropspec bore** (commit riêng) |
| 2 | QSK60G13 | disp | 60.2 | 50.3 (1) | Displacement 60.2 L | cummins.com/sites/default/files/2018-10/QSK60-G13.pdf | yingtai đúng, NCC khác sai |
| 3 | QSL9G7 | disp | 8.8 | 8.9 (1) | Displacement 8.9L ("QSL9 G2 & G7") | cummins.com/en-na/generators/products/qsl9-g7-g2 | **yingtai sai → dropspec disp** (lưu ý: tờ QSL9-G5 ghi 8.8 litre, mart.cummins.com/imagelibrary/data/assetfiles/0070373.pdf: hãng làm tròn khác nhau theo tờ) |
| 4 | QSL9G5 | compr | 17.8:1 | 17.3 / 16.8 | Compression ratio 16.8:1 (engine QSL9-G5) | cummins.com/sites/default/files/Events/Mobile-Power-Launch/D-6572.pdf | **yingtai sai → dropspec compr** |
| 5–7 | QSB7G3 / G4 / G5 | compr | 17.2:1 | 17.3:1 (1) | hãng ghi cả hai: 17.2:1 (QSB6.7 180–225 kVA) và 17.3:1 (QSB6.7 160–250 kVA); tờ G-drive QSB7-G5 không ghi | cummins.com/sites/default/files/2023-05/180-225_kVA_QSB6.7_Specsheet_Rev-4.pdf; …/2024-11/160-250-kva-spec-sheet.pdf | không rõ |
| 8–10 | QSX15G4 / G6 / G8 | compr | 17.0:1 | 14:1 (1; G6/G8 có NCC khác ghi 17:1) | "Compression Ratio 17.0:1" ở tờ QSX15 bơm chữa cháy CFP15E-F45; tờ G-drive QSX15-G8 không ghi | mart.cummins.com/imagelibrary/data/assetfiles/0057180.pdf | nghiêng yingtai đúng (không phải tờ G-drive) |
| 11–12 | QSK50G3 / G4 | compr | 15.0:1 | 13.9:1 (1) | "Compression Ratio 15:1" (tổ máy QSK50 1750–1825 kVA) | cummins.com/sites/default/files/2021-01/PSBU-021-QSK50_1750_1825kVA-Rev-4.pdf | yingtai đúng (13.9 là của KTA50) |
| 13 | QSK60G7 | compr | 16.2:1 | 14.5:1 (1) | 14.5:1 cho QSK60-G4 / G8; tờ G7 không ghi | cummins.com/sites/default/files/PSBU-022-QSK60%202000_2250kVA-Rev-3%20April%202020.pdf | không rõ (nghiêng yingtai sai) → câu 2 |
| 14 | QSK38G2 | disp | 37.7 | 38 (1) | (không tra: hai số là một phiếu theo `roundCompat`, 37.7 làm tròn ra 38, lệch 0,8 %) | — | không phải mâu thuẫn |

Ngoài 14 số: yingtai ghi tỉ số nén 17.8:1 cho QSL9G2 / G3 / G4 (không NCC khác so được) → câu 1.

### 7 giá trị thắng (`win` của catalog) đổi
| model | số | trước → sau | Cummins ghi | URL | hướng |
|---|---|---|---|---|---|
| QSK19G4 | cyl | (không) → 6 | "in-line 6 cylinder" | cummins.com/sites/default/files/2019-06/QSK19G4.pdf | ĐÚNG |
| QSK19G4 | bore | 159*159 → (không) | Bore 159 / Stroke 159 | như trên | mất thắng, không sai số; cơ chế ở câu 3 |
| QSK23G3 | compr | (không) → 16.0:1 | tờ G-drive QSK23G3 / trang QSK23 không ghi | cummins.com/sites/default/files/2019-06/QSK23G3.pdf | không rõ |
| VTA28G6 | compr | (không) → 13.1:1 | tờ G-drive VTA28G6 / trang VTA28 không ghi | cummins.com/sites/default/files/2019-06/VTA28G6.pdf | không rõ |
| QSK78G9 / G18 | compr | (không) → 15.5:1 | trang QSK78 ghi bore 170 / stroke 190 / 77.6 L, không ghi tỉ số nén | cummins.com/en-na/generators/products/qsk78 | không rõ |
| QSL9G2 | compr | (không) → 17.8:1 | không có tờ G2; họ QSL9 trên cummins.com 16.1–16.8 | (xem #4) | không rõ, nghiêng SAI → câu 1 |

Sau dropspec (KTA19G4 bore, QSL9G5 compr, QSL9G7 disp; ở cả n101 và n2003): 0 giá trị thắng đổi theo hướng sai đã biết; 7 thay đổi trên giữ nguyên (không cái nào do 3 số đã bỏ). Hướng ĐÚNG: QSK19G4 cyl. Không rõ: 5 (QSK23G3, VTA28G6, QSK78G9, QSK78G18, QSL9G2). Tỉ số nén không thuộc `MAJ_KEYS` của `candidates` (chỉ xi lanh, dung tích); `makerSheetChecks` có so tỉ số nén.

**Cơ chế QSK19G4 bore:** `tally` của `catalog.js` đếm phiếu theo CHỮ đã gộp hoa thường / dấu cách (`vk`), thắng khi ≥ 3 NCC và gấp ≥ 3 lần mỗi giá trị khác. "159*159" 3 NCC; yingtai thêm "159x159" thành 2 NCC → 3 < 3 × 2 → không thắng. Số không đổi (cùng 159 × 159), chỉ cách viết chia phiếu. Không phải lỗi luật số đông mà là cách đếm theo chữ đã ghi trong suppliers/CLAUDE.md ("đếm theo CHỮ … QSK19-G4 không có `win`"); config-bot `majorityOf` đếm theo SỐ qua lớp chuẩn hoá nên Gợi ý không đổi. Chưa sửa.

PR nháp #973, nhánh `catalog-hy`, SHA **588709fe** (commit riêng dropspec 3 số Cummins trên 32934948; test 1.360 / 1.360; NCC khác đổi 0) (đã gộp main 59f3369e (#968); test sau gộp 1.359 / 1.359; `soat-hy` trên 59f3369e y như dưới). Quyết định: Khoa 20/11/2026 câu 6 = C, câu 7 = C (`catalog-nhom-con-lai-de-xuat.md`). Đo trong `dau-vao\nhom-con-lai\pr2\`.

## Thay đổi (`web/catalog.js`)
- `NAMED_POWER` (chỉ huatai n111, khoá NCC + n + dòng tiêu đề đầu nguyên văn): công suất tổ máy = số trong tên "NNNGF", mức `rated` (nguồn không ghi mức; cùng quy ước #968 "số không ghi prime / standby là `rated`"), bản ghi mang `powerFrom: "tên tổ máy"`; `engPower` = ô "额定功率 power (KW)" dưới "柴油机参数". Bỏ 3 ngoại lệ nopower 700/800/850GF của catalog-b (cả bảng đã theo tên).
- `ENGINE_TABLES` (chỉ yingtai n101 b1 / n2003): mỗi dòng → bản ghi động cơ, `power: null` (không là ứng viên), thông số `engPower` 主用 + 备用, `cyl`, `bore`, `disp`, `compr`. KHÔNG đọc: tiêu hao (g/kWh, L/h), dầu, nước, khí thải, kiểu điều tốc. Ô hãng "进口 康明斯 Import Cummins" chỉ ở dòng đầu → bỏ trước khi đếm ô; "/" để trống; dòng rác "| | | | | 9 …" bỏ + note.
- Test `suppliers/catalog-hy.test.mjs` (4 ca, dòng thật); `catalog-b.test.mjs` sửa ca huatai theo quyết định mới; bẫy ghi `web/CLAUDE.md`.

## Kiểm chéo toàn bộ
| Kiểm | Kết quả |
|---|---|
| spec-diff (`spec-diff.md`, gốc 1e712e19) | 60.073 → 60.129; 17 đổi, 0 mất, 56 thêm, 2 bảng / 2 NCC; đảo vai 0 → 0; tự kiểm số với công suất: 0 không tự xác nhận; "ngoại lệ theo dòng" 14 → 11; "bảng không cho bản ghi nào" 3.067 → 3.065; tổ máy 1.700 không đổi |
| `fromSupplier` mọi NCC (`soat-hy.mjs`, gốc 1e712e19 và lại trên 59f3369e) | **NCC khác đổi: 0**. huatai: ĐỔI 17 (n111). yingtai: MỚI 56 (n101 b1; n2003 trùng nguyên văn → gộp vào `also`) |
| `build()` (`kiem-build.txt`) | Động cơ 6.889 → 6.893 (+4 khoá chỉ yingtai ghi: KAT38G9, NT855G6, QSX15G13, QSX15G16), 69 khoá đổi (52 khoá yingtai + 17 khoá huatai). Đầu phát và bộ điều khiển: y gốc (md5 bộ điều khiển c04f0654… = c04f0654…) |
| Test | 1.359 / 1.359 trước merge; `quality.mjs --check` không xấu đi |

### 7C — 17 dòng huatai: tên → kW, đối chiếu ô nguồn (`soat-hy.tsv` phần `huatai`)
| tên | kW | động cơ | 额定功率 (×kW) | dòng điện nguồn ↔ kW ở 400 V cos φ 0,8 |
|---|---|---|---|---|
| 200GF | 200 | WD129TAD23 | 259 (1,29) | 362 ↔ 360,8 |
| 250GF | 250 | WD135TAD28 | 308 (1,23) | 452,5 ↔ 451,1 |
| 300GF | 300 | WD145TAD30 | 340 (1,13) | 543 ↔ 541,3 |
| 320GF | 320 | WD145TAD33L | 373 (1,17) | 579,2 ↔ 577,4 |
| 350GF | 350 | WD145TAD35 | 388 (1,11) | 633,5 ↔ 631,5 |
| 400GF | 400 | WD269TAD38 | 420 (1,05) | 724 ↔ 721,7 |
| 400GF | 400 | WD269TAD41 | 460 (1,15) | 724 ↔ 721,7 |
| 450GF | 450 | WD269TAD45 | 512 (1,14) | 814,5 ↔ 811,9 |
| 500GF | 500 | WD269TAD48 | 530 (1,06) | 905 ↔ 902,1 |
| 500GF | 500 | WD269TAD50 | 556 (1,11) | 905 ↔ 902,1 |
| 500GF | 500 | WD269TAD56 | 618 (1,24) | 905 ↔ 902,1 |
| 600GF | 600 | WD287TAD61L | 680 (1,13) | 1086 ↔ 1082,5 |
| 700GF | 700 | WD305TAD68 | 750 (1,07) | 1267 ↔ 1263,0 |
| 800GF | 800 | WD327TAD78 | 858 (1,07) | 1448 ↔ 1443,4 |
| 850GF | 850 | WD327TAD82 | 902 (1,06) | 1538,5 ↔ 1533,6 |
| 900GF | 900 | WD327TAD88 | 970 (1,08) | 1629 ↔ 1623,8 |
| 1000GF | 1000 | WD327TAD92 | 1012 (1,01) | 1810 ↔ 1804,2 |

Dòng điện lệch đều +0,32 % (nguồn dùng 1,81 A/kW) ở cả 17 dòng; động cơ / tổ máy 1,01–1,29. **Ô nguồn nói khác:** chỉ cột "输出功率 Power of output (KW/KVA)" ghi "135/320", "138/150", "138/160", "140/165", "145/165" — không đọc được là kW / kVA của tổ máy (cùng "138/150" cho 250GF → 500GF; 135/320 cho 200GF), là số đường kính / hành trình (catalog-b). Không ô nào khác ghi công suất tổ máy.

### 6C — yingtai: từng số ↔ NCC khác cùng khoá (`soat-hy.tsv` phần `so`)
- 56 bản ghi; số so (xi lanh, đường kính × hành trình, dung tích, tỉ số nén): trùng chữ NCC khác 110, chỉ yingtai ghi 57, khác chữ 57. Trong 57 khác chữ, 43 chỉ khác cách viết hoặc NCC khác không có phiếu so được (107X124 ↔ 107x124mm, 15.0:1 ↔ 15:1, 37.7 ↔ 38 làm tròn); **14 khác số thật (cần Khoa / soát hãng):**
  - KTA19G4 bore "159X160" (nguồn gõ sai; 12 NCC khác 159×159, giá trị thắng giữ 159*159).
  - QSK60G13 disp 60.2 ↔ 1 NCC 50.3; QSL9G7 disp 8.8 ↔ 1 NCC 8.9.
  - Tỉ số nén: QSB7G3/G4/G5 17.2 ↔ 17.3 (1 NCC); QSL9G5 17.8 ↔ 17.3 / 16.8; QSX15G4/G6/G8 17.0 ↔ 14 (1 NCC; G6/G8 có NCC khác ghi 17); QSK50G3/G4 15.0 ↔ 13.9; QSK60G7 16.2 ↔ 14.5.
- Giá trị thắng (`win` của catalog, đếm theo chữ) đổi 7 chỗ: 6 chỗ từ không có → có, đúng số yingtai (QSK19G4 cyl 6; tỉ số nén QSK23G3 16.0:1, VTA28G6 13.1:1, QSK78G9 / G18 15.5:1, QSL9G2 17.8:1: yingtai là phiếu thứ 3). 1 chỗ mất: QSK19G4 bore 159*159 → không thắng (yingtai thêm chữ "159x159", cách đếm theo CHỮ của `catalog.js`; `majorityOf` của config-bot đếm theo SỐ nên không bị).

## Ảnh hưởng Gợi ý (chờ đo top 30 cloud)
- huatai: 17 dòng Wudong 200–1.000 kW nay có công suất → thành ứng viên ở gói cùng dải (trước đây 0 lần trong `all`). Mức `rated` (candidates xếp sau prime 0,03).
- yingtai: bản ghi không công suất → không thành dòng ứng viên; số vào `facts` của 52 khoá Cummins có sẵn (2.058 lượt dùng) → luật số đông dung tích / xi lanh (`majorityOf`, `MAJ_KEYS`) có thêm 1 phiếu ở các khoá đó; `makerSheetChecks` / điểm có thể đổi khi khoá trước đây thiếu dung tích / xi lanh. Cần đo cả `all` lẫn top 30.

## Chưa làm / ngoài phạm vi
- Không sửa số nguồn gõ sai (KTA19G4 159X160): nếu Khoa muốn, thêm `dropspec` bore cho dòng đó.
- Tiêu hao, khí thải của bảng yingtai chưa đọc (chưa duyệt).
