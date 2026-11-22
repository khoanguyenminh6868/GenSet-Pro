# Vì sao 6M31G825/5 ngoài 30 ứng viên (IB2600603983), 21/11/2026

**Trạng thái:** mã sửa ở PR draft [#1062](https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1062), SHA 8f5f079d, CHƯA merge. Đã kiểm: nguyên nhân và `prep` thật trên gói này, toàn bộ test `suppliers/*.test.mjs` (1492/1492), 78 lượt đổi của số đo trên d0edb654 (mục "Kiểm chéo").
**Chưa kiểm:** top 30 toàn bộ lượt trên SHA 8f5f079d. Mục "Việc còn lại" số 2 đã sửa trong PR: `6M33G8D3/5` và mã có tiền tố nước; sau sửa Baudouin = #6 6M33G750/5 kaihua, #10 6M31G825/5 voltgent, #20 6M31G825/5 weichai.

## Kết luận

1. **Không bước lọc nào loại 6M31G825/5.** Cả 4 dòng đều qua lọc (475 dòng qua, 936 bị loại), không cờ, không nằm trong `dropped`, không vướng trần NCC / động cơ.
2. **Mất ở bước chia chỗ theo hãng** (`pick` lượt 5). Baudouin được 3 chỗ: 6M33G750/5 kaihua, 6M33G825/5 longkai, 6M33G825/5 rcg. Chỗ thứ 3 về rcg vì luật B (`B_MIN_SUPPLIERS = 2`): model đã có 1 NCC được lấy NCC thứ hai trước model mới. 6M31 voltgent đứng thứ 8 trong danh sách Baudouin.
3. **Nguyên nhân gốc:** `candidates()` chưa lọc theo tỉ số nén. HSMT ghi trơ 14:1. 6M33G825/5 ghi 15.0:1 (koten-power) vẫn chiếm 2 chỗ, còn 6M31G825/5 đúng 14:1 (tờ hãng [1021]) thì không có chỗ.
4. **Điểm không phải lý do bị loại:** voltgent 222 và agg-fuzhou 132 đều cao hơn dòng thứ 30 (68). Top 30 chia theo hãng nên điểm chỉ so trong cùng hãng.

## Hai dòng được hỏi

Cột: hạng toàn bảng, điểm, hãng +60, bộ điều khiển +50, tờ bộ điều khiển +40, thông số động cơ, đầu phát +40, thông số đầu phát, độ tin +15, công suất.

| Dòng | Hạng | Điểm | Hãng | BĐK | Tờ BĐK | TS ĐC | ĐP | TS ĐP | Tin | CS | Vị trí trong Baudouin |
|---|---|---|---|---|---|---|---|---|---|---|---|
| voltgent VB825-5 | 89 | 222 | 60 | 50 | 40 | 64 | 0 | 0 | 15 | -7 | 8 |
| agg-fuzhou B825E5 | 308 | 132 | 60 | 0 | 0 | 64 | 0 | 0 | 15 | -7 | 23 |
| *6M33G825/5 longkai LG600BD (được chọn)* | 21 | 268 | 60 | 50 | 40 | 64 | 40 | 6 | 15 | -7 | 1 |
| *6M33G825/5 rcg R-WB750D5-S (được chọn)* | 41 | 234 | 60 | 50 | 0 | 64 | 40 | 12 | 15 | -7 | 3 |

Thông số động cơ của 6M31 và 6M33G825/5 ngang nhau (8 loại, +64). Khoảng cách đến từ dữ liệu: voltgent thiếu đầu phát, agg-fuzhou thiếu thêm bộ điều khiển (-90).

Tờ hãng [1021] của 6M31G825/5: 14:1; 156 L/h (100% PRP), 113 (75%), 77 (50%), trùng ngưỡng HSMT (156 và 77).

## 30 dòng trước khi sửa

Tỉ số nén so với 14:1 của HSMT.

| # | Hạng | Điểm | Hãng | Động cơ | NCC | Tỉ số nén | So HSMT |
|---|---|---|---|---|---|---|---|
| 1 | 1 | 281 | Volvo Penta | TWD1645GE | dingbo | 16.8 | khác |
| 2 | 2 | 278 | Perkins | 4006-23TAG2A | gb-power | 13.6 | khác |
| 3 | 3 | 277 | Mitsubishi | S6R2-PTAA-C | fdk-energy | 14.1 / 14 | khớp |
| 4 | 4 | 277 | Cummins | QSK23-G2 | fdk-energy | 16.0 | khác |
| 5 | 6 | 277 | Perkins | 4006-23TAG2A | uleengen | 13.6 | khác |
| 6 | 12 | 274 | Perkins | 4006-23TAG3A | fdk-energy | 13.6 | khác |
| 7 | 16 | 270 | Perkins | 4006-23TAG3A | uleengen | 13.6 | khác |
| 8 | 20 | 269 | Mitsubishi | S6R2-PTAA | fdk-energy | 14.1 | khớp |
| 9 | 21 | 268 | Baudouin | 6M33G825/5 | longkai-power | 15.0 | khác |
| 10 | 35 | 244 | Perkins | 2806A-E18TTAG4 | voltgent | - | không ghi |
| 11 | 39 | 235 | Baudouin | 6M33G750/5 | kaihua-genset | - | không ghi |
| 12 | 40 | 235 | Volvo Penta | TWD1645GE | sr-genset | 16.8 | khác |
| 13 | 41 | 234 | Baudouin | 6M33G825/5 | rcg-power | 15.0 | khác |
| 14 | 48 | 229 | Mitsubishi | S6R2-PTAA-C | wintpower | 14.1 / 14 | khớp |
| 15 | 51 | 228 | Cummins | KTAA19-G6A | jiuan-power | 13.9 / 13.0 | mâu thuẫn |
| 16 | 69 | 222 | Cummins | QSK23-G2 | aosif | 16.0 | khác |
| 17 | 113 | 214 | Cummins | QSK19-G20 | aosif | - | không ghi |
| 18 | 138 | 190 | Perkins | 2806A-E18TTAG4 | generatordieselchina | - | không ghi |
| 19 | 198 | 172 | Volvo Penta | TWD1673GE | comappower | - | không ghi |
| 20 | 215 | 165 | Scania | DC16 078A 02-43 | voltgent | - | không ghi |
| 21 | 217 | 165 | Scania | DC16 072A 02-13 | kaihua-genset | - | không ghi |
| 22 | 218 | 165 | Scania | DC16 078A 02-43 | kaihua-genset | - | không ghi |
| 23 | 225 | 163 | Mitsubishi | S6R-PTA-S | ettes-power | - | không ghi |
| 24 | 227 | 162 | MTU | 12V2000G63 | rise-power | - | không ghi |
| 25 | 376 | 118 | MTU | 12V1600G11F | mecca-power | - | không ghi |
| 26 | 439 | 80 | FPT | V20 TE2 | legapower | - | không ghi |
| 27 | 448 | 75 | Volvo Penta | TWD1645GE-B | walter-yangzhou | - | không ghi |
| 28 | 450 | 74 | Perkins | 2806A-E18TAG4 | pauway-tianjin | - | không ghi |
| 29 | 460 | 68 | MTU | 12V1600G11F | agg-fuzhou | - | không ghi |
| 30 | 462 | 68 | MAN | D2842LE203 | xinzhengfa | - | không ghi |

## Đã sửa theo lệnh Khoa (21/11/2026), chưa merge

HSMT ghi trơ một tỉ số nén, gói một cỡ: dòng có mọi nguồn ghi số khác bị loại (model HSMT nêu đích danh thì ở lại, trừ 600). Nguồn mâu thuẫn, không đọc được hoặc không ghi thì giữ.

Chạy lại trên gói này: Baudouin = #6 6M33G750/5 kaihua, **#9 6M31G825/5 voltgent VB825-5**, #13 `6M33G8D3/5 (6M33G825/5)` kaihua. agg-fuzhou B825E5 vẫn ngoài 30 vì thiếu đầu phát và bộ điều khiển.

## Việc còn lại / đề xuất

1. Merge luật tỉ số nén sau khi giải thích hết dòng vào/ra top 30 trên toàn bộ gói. **Ảnh hưởng gói khác: chưa có số.**
2. Khoá biến thể lọt luật: #13 ghi rõ 6M33G825/5 nhưng là khoá khác, 0 thông số; #15 `India 4006-23TAG2A` cũng vậy. Cần cho khoá dạng này nhận thông số của model trong ngoặc / sau tiền tố, có căn cứ. **Chưa sửa, chưa đo.**
3. Tiêu hao từ tờ hãng chưa thành thông số động cơ: `SPECS` khai `fuel*` scope `genset` nên `modelFacts` bỏ; nếu bỏ chặn thì đọc nhầm cột g/kWh (193 / 186 / 190 thay vì 156 / 113 / 77 L/h); `candidates` cũng chỉ xét tiêu hao trên chính dòng ứng viên. **Chưa sửa, chờ Khoa.**

## Kiểm chéo 78 lượt đổi của số đo cloud (22/11/2026)

Số đo: nhánh `do-gop-ti-so-nen-ket-qua` (f363d9e6), main 594dfb37 so với d0edb654. Chạy lại cục bộ trên đúng d0edb654: **78/78 lượt khớp top và all**.

| Nhóm dòng ra khỏi top / all | Số dòng |
|---|---|
| Loại do tỉ số nén | 26.258 |
| Loại do NCC ghi India, gói đòi G7/EU (4 lượt) | 9 |
| Không bị loại, chỉ bị đẩy khỏi top | 30 |
| **Tổng** | **26.297** |

**Loại OAN: 1.814 dòng (50 dòng top 30), trong 3 lượt, đã sửa:**

| Lượt | Dòng | Lỗi |
|---|---|---|
| IB2300046231#0 | 692 | Ô ghi chung số xi lanh và tỉ số nén: đọc 6 (số xi lanh) thành tỉ số nén; HSMT thật đòi lớn hơn 17,5 |
| IB2300343208#0 | 175 | Bản đọc HSMT ghi rõ dấu so sánh trước số 14 bị mất, không phải số trơ |
| IB2400564384#0 | 947 | Như trên, số 13,5 |

So `comprOf` mã cũ và mã sửa trên 1.259 gói: chỉ 4 gói đổi, gồm 3 gói trên và IB2600219527 (cùng lỗi số xi lanh, không nằm trong 78 lượt).

**(a) HSMT:** 71 lượt còn lại ghi trơ đúng một số. 14 lượt có công suất khác trong HSMT đều đã đọc: là số của đầu phát, mức dự phòng, máy đang có hoặc bản vẽ, không phải máy khác của gói. IB2200008211#0 (lượt mất QSB5.9-G30, D1146) ghi trơ 17,3:1, không oan.

**(b) Nguồn:** 537 động cơ bị loại đều có dòng nguồn thấy trong bảng của NCC, số trong 12–24, không có số lấy từ bảng nhiều model mà dòng không nêu model. 398 động cơ chỉ có một NCC ghi; Khoa 22/11 cho dùng nguồn NCC để loại. **Chưa đối chiếu các số này với tờ của hãng động cơ.**

**Lệch 0,1: Khoa quyết 22/11 "loại" (điều phối chuyển lời), luật không đổi.** 657 dòng (14 dòng top 30) lệch đúng 0,1 so với HSMT vẫn bị loại.

| Số của động cơ / HSMT | Dòng |
|---|---|
| 16,5 / 16,6 | 397 |
| 14,5 / 14,6 | 246 |
| 16,8 / 16,7 | 6 |
| 16,4 / 16,5 | 5 |
| 17,5 / 17,6 | 3 |

Sau sửa, gói IB2600603983 trên main mới: Baudouin = #6 6M33G750/5 kaihua, #10 6M31G825/5 voltgent, #20 6M31G825/5 weichai. Toàn bộ test `suppliers/*.test.mjs`: 1492/1492. **Số đo cloud là của d0edb654, cần đo lại trên SHA mới của #1062.**

## Sau #998 và Powerpack (22/11/2026, SHA 02c6c4dd, đã gộp main ae171d54)

`prep` thật IB2600603983: Baudouin = #9 6M31G825/5 voltgent, #19 6M31G825/5 weichai, #20 6M31G660/6 weichai-heavy. Không còn dòng India, không còn 6M33G750/5.

**Lỗi riêng, chưa sửa:** #20 ghi 1800 vòng/phút (60 Hz) mà vẫn vào gói 50 Hz, vì dòng không ghi tần số và luật tần số không đọc tốc độ.

Nơi sản xuất đọc từ ô động cơ của dòng, 55 dòng trong `cn/`:

| NCC | Dạng | Đọc thành | Dòng |
|---|---|---|---|
| kaihua-genset | India … | IN | 11 |
| kaihua-genset | UK … | GB | 11 |
| landtop-fuzhou | …(India) | IN | 9 |
| landtop-fuzhou | …(UK) | GB | 3 |
| comappower | …(UK) | GB | 1 |
| superwatt-swt | … SME | CN (nhà máy Mitsubishi Thượng Hải) | 1 |
| landtop-fuzhou | …(USA/EU) | không đọc | 10 |
| landtop-fuzhou | …(UK/EP) | không đọc | 3 |
| sr-genset | … EU | không đọc (có thể là tiêu chuẩn khí thải) | 6 |

Số đo lần 2 (8f5f079d, gốc 6f6e7931): 74 lượt đều nằm trong 78 lượt của lần 1, không có lượt mới. 4 lượt rời đi là 3 lượt oan đã sửa và IB2200100465 (gốc mới chỉ còn 100 dòng thay vì 390 nên luật không còn loại thêm). IB2600219527 không nằm trong 78 lượt. **Chưa gán luật từng dòng cho lần 2, và SHA 02c6c4dd cần đo lần 3.**

## Kiểm chéo lần đo 3 (22/11/2026, 02c6c4dd, gốc ae171d54)

Nhánh `do-gop-ti-so-nen3-ket-qua` (949d827b). Chạy lại cục bộ: **78/78 lượt khớp top và all**. Theo khoá duy nhất khớp số cloud: ra all 24.808, ra top 977.

| Dòng ra (đếm cả dòng trùng khoá) | Số dòng |
|---|---|
| Tỉ số nén | 24.893 |
| Nơi sản xuất (landtop India 11, kaihua India 6, superwatt SME 1) | 18 |
| Chỉ bị đẩy khỏi top | 27 |
| **Tổng** | **24.938** |

**Dòng loại oan: 0.** 74 lượt lọc tỉ số nén đều ghi trơ một số, không còn lượt có dấu so sánh hay số vô lý. 13 lượt có công suất khác đều nằm trong nhóm đã đọc ở lần 1. 539 động cơ bị loại đều có dòng nguồn thấy trong bảng NCC. **Chưa đối chiếu các số này với tờ của hãng động cơ.** 511 dòng (32 động cơ) chỉ bị loại nhờ số của Powerpack, đúng quyết định Khoa 22/11.

Lượt mới so lần 2 (5): IB2200100465 (9 dòng, có số Powerpack); IB2300390432, IB2400362458, IB2400495407, IB2500287209#1 (hậu tố India của landtop). Lượt rời: IB2600337362 (gốc mới không còn dòng kaihua 4012 nên nhánh không đổi).

**Còn sót, chưa sửa: dòng ghi India vẫn ở lại gói G7 / G7EU (88 dòng, 10 lượt), vì `placeInRow` chỉ đọc chữ dính ngay ô mã động cơ:**

| Dạng ghi | NCC | Dòng | Trong top 30 |
|---|---|---|---|
| "Perkins India", "Cummins India", "Cummins (India)" | fdk-energy | 28 | 4 |
| "… made in India" | bobig-power | 10 | 0 |
| Ô riêng "INDIA" | sanq-power | 10 | 0 |
| Ô riêng "INDIA" | baifa-power | 3 | 1 |
| Ô "UK/INDIA" (không rõ nơi nào, không suy ra) | sanq-power | 37 | 6 |

**Đối soát PR #1088 (22/11/2026, bản 3a323d1b).** Hai bộ số khác đơn vị, không có dòng nào thất lạc. 28 / 10 / 10 / 3 / 37 (tổng 88) là lượt-dòng ở 10 lượt gói G7 / G7EU của đo lần 3: một hàng nguồn xuất hiện ở nhiều lượt thì đếm nhiều lần. 27 / 8 / 16 / 5 / 35 là hàng trong danh mục `cn/`, không theo gói. Cả 88 lượt-dòng đều khớp được hàng danh mục và bản sửa đều xử lý:

| NCC, dạng ghi | Lượt-dòng | Hàng khác nhau trong 88 | Hàng trong `cn/` | Bản sửa đọc |
|---|---|---|---|---|
| fdk "Perkins / Cummins India" | 19 | 11 | 27 | IN |
| fdk "(India)" | 9 | 6 | 37 (đã đọc từ trước) | IN |
| bobig "made in India" | 10 | 5 | 8 | IN |
| sanq ô INDIA | 10 | 6 | 16 | IN |
| baifa ô INDIA | 3 | 1 | 5 | IN |
| sanq "UK/INDIA" | 37 | 22 | 35 | giữ, gắn cần xác nhận |

- 35 so với 37: 37 là lượt-dòng của 22 hàng khác nhau; 35 là số hàng UK/INDIA trong `cn/` (bảng n101: 13, n106: 22). Không có 2 hàng lệch.
- Lỗi đã sửa trong lúc đối soát: bản e6a567c5 tìm "UK/INDIA" ngay sau ô động cơ, nhưng cột thật "C/O of engine" nằm sau ô đầu phát, nên 0 / 35 hàng được gắn nhãn. Bản 3a323d1b gắn đủ 35 / 35. Số đo cloud của e6a567c5 không phản ánh nhãn này.
- Còn chữ India mà `placeInRow` không đọc, có bản ghi động cơ: 1 hàng, shanhua n1011 #18, bảng nhãn "制造商 Manufacturer | PERKINS ENGINE COMPANY LIMITED (India Factory)", động cơ 1103A-33TG2. Chưa sửa, chờ điều phối quyết.
- Có chữ India nhưng không có bản ghi động cơ nên không vào ứng viên: generatordieselchina 1, mahindra-powerol 1, woodward 4.

**Đối chiếu số đo cloud #1088 (e6a567c5 so 8bf8bca6, `do-gop-india-sot-ket-qua` 697df9eb).** Chạy lại đúng 10 lượt trên máy, cùng cách tính của `do-gop` (gốc 8bf8bca6, đầu 3a323d1b, bản bidhist đóng băng của lần đo 3). 5 dòng ra và 5 dòng vào top 30 trùng số đo cloud.

- **Cả 51 lượt-dòng India đều rời `all`, `ruled: made`, không dòng nào sót.** `tom-tat.md` chỉ in 16 vì `cmp.mjs`: lượt có đổi top 30 chỉ liệt kê dòng ra / vào TOP, không liệt kê dòng rời `all`. 4 lượt đổi top có 40 dòng rời `all` (in 5), 6 lượt còn lại có 11 dòng (in đủ). 5 + 11 = 16; 35 dòng không in.
- **Vì sao không thấy sanq:** 10 dòng sanq ô INDIA nằm ở IB2300000242 (4), IB2300194512 (4), IB2600337362 (2), đều là lượt đổi top, và không dòng nào ở top 30 gốc. Chúng có rời `all` nhưng công cụ không in. 37 dòng UK/INDIA vẫn ở lại (31 `all`, 6 top).

| Lượt | `madeRule.engine` | fdk | bobig | sanq | baifa | Rời `all` | Ra top |
|---|---|---|---|---|---|---|---|
| IB2300000242#0 | không có | 9 | 3 | 4 | | 16 | 1 |
| IB2300194512#0 | không có | 9 | 3 | 4 | | 16 | 1 |
| IB2300390432#0 | không có | 2 | | | | 2 | 0 |
| IB2400362458#0 | nơi sản xuất | | 1 | | 1 | 2 | 0 |
| IB2400495407#0 | nơi sản xuất | | 1 | | 1 | 2 | 0 |
| IB2500189675#0 | không có | 1 | | | | 1 | 0 |
| IB2500287209#1 | thương hiệu | 1 | 1 | | | 2 | 0 |
| IB2500342833#0 | thương hiệu | | | | 1 | 1 | 1 |
| IB2600337362#0 | thương hiệu | 5 | | 2 | | 7 | 2 |
| IB2600350175#0 | thương hiệu | 1 | 1 | | | 2 | 0 |

**5 dòng vào top 30: không phải India, nhưng chỉ 1 dòng sạch.**
- lees-power 4BTA3.9-G2(M), IB2500342833: dòng không ghi nơi sản xuất, giữ theo luật "không ghi thì không suy ra".
- fdk 4006-23TAG3A ghi "PERKINS CHINA" (IB2300000242, IB2300194512) và fdk KTA50-GS8, QSK50-G4 ghi "CUMMINS (CCEC CHINA)" (IB2600337362): NCC tự ghi nhà máy Trung Quốc ở gói G7/EU. Không có `ruled` vì `placeInRow` chỉ đọc India / UK / SME, và `madeAt` chỉ chạy khi `madeRule.engine` là nơi sản xuất (ba lượt này: không có hoặc thương hiệu). Đây là lỗ hổng cùng loại, #1088 làm chúng lộ ra vì đẩy dòng India đi.

**Cần Khoa quyết (chưa sửa):**
1. Dòng NCC tự ghi nhà máy Trung Quốc ("Perkins China", "CCEC China") ở gói G7/EU có loại như dòng India không?
2. 12 trong 51 dòng thuộc 4 lượt mà HSMT chỉ đòi THƯƠNG HIỆU. Luật cũ nhận nhà máy chính hãng ngoài nhóm khi chỉ đòi thương hiệu, còn `placeInRow` (quyết định 21/11) loại ở mọi gói G7/EU. Với lượt chỉ đòi thương hiệu: giữ loại India, hay trả lại cả dòng India lẫn dòng Trung Quốc?

**Khoa 22/11/2026 (qua điều phối):** giữ loại India ở mọi gói G7/EU, kể cả gói chỉ đòi thương hiệu. Dòng NCC tự ghi nhà máy Trung Quốc của động cơ cũng loại, nhưng đếm ảnh hưởng trước khi áp.

**Đếm dòng NCC tự ghi nhà máy Trung Quốc (chỉ đếm, CHƯA sửa luật).** Chỉ tính chữ ở chính dòng, mã không kèm chữ thì không tính. Danh mục `cn/` của 3a323d1b; lượt-dòng lấy từ kết quả đo lần 3 (#1062, 175 lượt G7 / G7EU), chưa trừ tác động của #1088.

| Dạng NCC ghi (hãng ngoài) | Hàng `cn/` | Lượt-dòng G7/G7EU | Trong top 30 |
|---|---|---|---|
| Nhà máy: "CCEC", "DCEC", 重庆康明斯, 东风康明斯, "Cummins (CCEC CHINA)" | 659 | 242 | 8 |
| Hãng + China: "Perkins China", "Cummins (China Dongfeng)" | 172 | 111 | 26 |
| Mã + China: "403A-15G1 made in china" | 12 | 23 | 5 |
| 潍柴博杜安 / Weichai Baudouin (tách riêng, cần Khoa xem) | 47 | 0 | 0 |
| **Cộng** | **890** | **376** (29 lượt, 238 hàng) | **39** (19 lượt) |

- Theo hãng, hàng `cn/`: Cummins 776, Perkins 64, Baudouin 47, Weichai 2, MTU 1. Lượt-dòng: Cummins 302, Perkins 73, MTU 1. Top 30: Cummins 27, Perkins 12.
- Theo NCC, hàng `cn/`: fdk-energy 279, bdadl-shanghai 137, pengpai-yangzhou 123, jiangchai-xuzhou 80, fukangsi-yangzhou 74, liangzi-yangzhou 70, aosif 61, yongcai-elecmama 20, bobig-power 12, aoke-yangzhou 10, shanhua 9, kc-generatorset 3, yingtai-jiangsu 3, jiuan-power 3, baifa-power 3, sunkings 1, tecgen-fujian 1, generatordieselchina 1.
- Theo NCC, lượt-dòng: fdk 133, pengpai 62, liangzi 46, fukangsi 41, aosif 27, bobig 23, bdadl 22, yongcai 12, jiangchai 3, baifa 3, sunkings 2, yingtai 2. Top 30: fdk 33, bobig 5, yongcai 1.
- Chưa tính: 160 hàng có ô đúng "CHINA" mà script chưa gắn được vào cột (baifa 127, comappower 11, suneco-linyi 11, yanan-power 11); 122 lượt-dòng G7/G7EU, 0 trong top 30. Bảng của các NCC này có cột "ENGINE MANUFACTURER / COUNTRY" hoặc "Engine origin", nên nhiều khả năng là nơi sản xuất động cơ, nhưng chưa soát từng hàng.
- Ngoài ra 504 hàng ghi China của hãng Trung Quốc / chưa rõ hãng không nằm trong bảng trên.
- Khi loại 39 dòng top, dòng khác sẽ lên thay, có thể gồm dòng Trung Quốc chưa đọc được. Số cuối phải đo cloud sau khi có PR.

**Luật nhà máy Trung Quốc (Khoa 22/11/2026), nhánh local `nha-may-tq` 28895472 dựng trên 3a323d1b, CHƯA đẩy, chờ #1088 merge.** `chinaPlantInRow`, `ruled: made` ở gói G7 / G7EU kể cả chỉ đòi thương hiệu; gói G20 không áp. Gộp shanhua "(India Factory)" đọc IN. Test `suppliers/*.test.mjs` 1536/1536 trước lần sửa ghi chú cuối. Chưa đo cloud. Danh sách từng hàng: `nghiem-thu/nha-may-tq-danh-sach.txt` (1.921 dòng, `DOC` / `KHONG` + lý do).

Đọc: **1.013 hàng** trong `cn/`.

| Dạng chữ | Hàng | Ví dụ nguyên văn |
|---|---|---|
| Tên nhà máy | 729 | 重庆康明斯 228, 东风康明斯 219, Cummins (CCEC CHINA) 84, Engine-DCEC Cummins 68, dongfeng Cummins 47, Cummins (DCEC CHINA) 26, CCEC 22, Chongqing Cummins 13, CCEC CUMMINS 9 |
| Hãng + China | 170 | Cummins (China Dongfeng), Perkins China, Cummins CHINA, MTU JV CHINA |
| Mã + China | 12 | 403A-15G1 made in china |
| Cột xuất xứ động cơ = CHINA | 102 | baifa cột "ENGINE MANUFACTURER / COUNTRY"; comappower n111, suneco-linyi n103, yanan-power n105 cột "Engine origin" |

Theo NCC: fdk-energy 277, bdadl-shanghai 125, pengpai-yangzhou 114, baifa-power 72, jiangchai-xuzhou 71, longkai-power 68, fukangsi-yangzhou 65, liangzi-yangzhou 62, aosif 61, yongcai-elecmama 20, bobig-power 12, comappower 11, suneco-linyi 11, yanan-power 11, aoke-yangzhou 10, shanhua 9, kc-generatorset 3, yingtai-jiangsu 3, jiuan-power 3, xinhengxin-fujian 2, sunkings 1, tecgen-fujian 1, generatordieselchina 1.

Có chữ China mà KHÔNG đọc: **908 hàng**.

| Lý do | Hàng |
|---|---|
| Hãng Trung Quốc (Yuchai 298, SDEC 114 …) | 406 |
| Baudouin / Weichai / 潍柴博杜安 (Khoa giữ) | 324 |
| Địa chỉ NCC (westinpower 126 …) | 133 |
| "JAPAN OR CHINA", hai nơi (comappower, suneco-linyi, yanan-power, mỗi NCC 10) | 30 |
| Chưa rõ hãng (baifa 9: mã M33 / M55 ô CHINA hoặc CHINA STAGE3; acepow 1) | 10 |
| Chỉ là thang khí thải (baifa 1, mecca-power 2) | 3 |
| "China brand AP186FA" của acepow-fuan (không phải nơi sản xuất động cơ) | 2 |

Cột không rõ thuộc động cơ hay tổ máy: không có trong 4 bảng đã đọc; cả 4 đều ghi rõ là của động cơ.

**Lỗi dữ liệu phát hiện thêm, chưa sửa:** baifa-power có 6 bảng để cả dòng dữ liệu trong trường `header` (tới 33 dòng), nên các dòng đó không vào danh mục, gồm 5 dòng ghi "UK/ CCEC" (QSK50-G3 / G4 / G7 / G13, QSK60-G23). Chúng hiện không phải ứng viên. Nếu sửa dữ liệu thì "UK/ CCEC" là hai nơi, cần Khoa quyết như "UK/INDIA".

**Cập nhật theo điều phối:** 30 hàng "JAPAN OR CHINA" (Mitsubishi S6R2 / S12R / S16R của comappower, suneco-linyi, yanan-power, mỗi NCC 10) làm giống UK/INDIA: ở G7 / G7EU giữ dòng, không trừ điểm, gắn "cần xác nhận nơi sản xuất động cơ (NCC ghi «JAPAN OR CHINA»)". G20 không áp. Lưu ý: nhóm `g20` trong `web/catalog.js` KHÔNG gồm Trung Quốc (có Ấn Độ), nên dòng ghi nhà máy Trung Quốc ở gói G20 hiện được giữ dù ngoài nhóm; muốn loại cần Khoa quyết.

**PR #1095 (draft, db61b26a, gốc main 04c8b8d7 sau khi #1088 merge):** gồm luật nhà máy Trung Quốc, "JAPAN OR CHINA", shanhua "(India Factory)". Test `suppliers/*.test.mjs` 1552/1552. Chưa đo cloud. Khoa 22/11/2026: gói G20 không loại dòng NCC tự ghi nhà máy Trung Quốc.

**Việc dở:** baifa-power có 6 bảng để dòng dữ liệu trong trường `header` nên các dòng đó không vào danh mục (gồm 5 dòng "UK/ CCEC"). Việc riêng, chưa làm.

**Kiểm chéo đo cloud #1089 (`do-gop-60hz-ket-qua` 409a9f67, gốc 7fc7fbb5, đầu 2773e3a8).** So đủ 1.093 lượt từ tệp kết quả; chạy lại 15 lượt đổi top bằng code đầu, 15/15 ra đúng top của cloud.

1. **20 dòng RA top:** 19 `ruled: freq`, 1 chỉ bị đẩy. 8 dòng weichai tự ghi "Rated speed (rpm) = 1800"; 11 dòng mã đuôi `/6` không ghi tốc độ (longkai, kaihua), bị loại theo các dòng khác của cùng mã. Dòng bị đẩy: previa-ningde 16M55G4000/5 (IB2300286234), điểm 132 trước và sau, vẫn ở `all` hạng 18. Mã này đã có longkai và voltgent trong top, nên hợp với luật B (mỗi model 2 NCC rồi nhường chỗ); chưa truy từng bước chọn.
2. **20 dòng VÀO top:** đều đã có trong `all` với cùng điểm, không dòng nào `ruled`, không dòng nào tự ghi 60 Hz. **Một dòng đáng ngờ:** kaihua `HC-BD1500-60 | 12M33D1320E201` (IB2400085846). Tên tổ máy có đuôi "-60", dòng không ghi Hz nên luật không đọc. kaihua có 32 dòng tên "-60": 24 mã `/6`, 8 mã khác (12M26D1012E201, 12M33D1108E201, 12M33D1265E201, 12M33D1320E201, 4M10G100/6 WP4.1D115E201, 4M10G83/6 WP4.1D95E201, 6M11G110/6 WP6D132E201, 6M11G135/6 WP6D158E201). Chưa sửa: đọc "-60" là suy từ tên, cần Khoa quyết.
3. **23 dòng ALL VÀO (pauway YC20VTD3000-D30, walter YC20VTD3300-D30):** chỉ MỘT nguồn ghi 50 Hz là comler-power n111: `| COMLER1800KW | 康姆勒 | YC20VTD3000-D30 | 2005 | 高压共轨 | 玉柴 | 400/230 | 3247.7 | 0.8 | 50 | 1500 | …` và `| COMLER2000KW | 康姆勒 | YC20VTD3300-D30 | 2205 | 高压共轨 | 玉柴 | 400/230 | 3608.5 | 0.8 | 50 | 1500 | …`. Các dòng từng làm chúng "chỉ 60": fdk-energy n103 `Y2500-H2 (60Hz)` / `Y2750-H2 (60Hz)` và n104 `Y2500-H2` / `Y2750-H2` (đều "Yuchai (China)"). Catalog kaichen ghi `KCY-2500GF … YC20VTD3300-D30` ở "trang 11 phải" (60 Hz). Repo KHÔNG có tờ hãng Yuchai cho hai mã này, nên không xác nhận được bản 50 Hz thật.
4. **Tần số:** cả 331 lượt đổi đều là gói 50 Hz (1.122 dòng rời). Không có lượt 60 Hz nào đổi, nên chiều "dòng 1500 bị loại ở gói 60 Hz" chưa có ca thật, chỉ có test.
5. **Dấu "^":** tờ hãng `sources/baudouin/1015.md` và `1018.md` chú thích nguyên văn "^ Primarily for ESP applications" (chủ yếu cho dự phòng). Chú thích trong `config-bot.mjs` nói "không nguồn nào giải thích" là sai với hai tờ này. Chưa đổi luật: gói đòi công suất liên tục (prime) có nên loại mã "^" là việc Khoa quyết.
6. **59 động cơ đổi trạng thái:** 49 mang đuôi `/5` `/6`; 10 không mang đuôi: YC16VC4200-D30, 4Z2.9-G42, 4Z2.9-G43, 16KTA76-G32, 16KTA76-G33, QSK19-G33, YCMJ12TAA500-G20 (thành "chỉ 50"), YC20VTD3000-D30, YC20VTD3300-D30 (hết "chỉ 60"), WP6D200E201 (thành "chỉ 60", 2 dòng weichai-heavy + weichai-power, không có dòng NCC khác). **0 dòng bị loại theo dòng khác mà mã không đuôi `/6`.** Phân loại 1.122 dòng rời: 323 mã `/6` theo dòng khác; 799 tự ghi "Rated speed (rpm) = 1800" (weichai-power 405, weichai-heavy-machinery 394).

**Lỗi 60 Hz, PR #1089 (22/11/2026, bản 2773e3a8).** Vì sao 6M31G660/6 lọt: luật 17/11 cần ít nhất hai dòng ghi tần số, mà dòng weichai "WPG660*76 | 1800 | …" chỉ có tốc độ, không có chữ Hz, nên động cơ này chỉ có 1 dòng ghi tần số. Bản sửa đọc cột tốc độ của chính dòng (`hzOfRow`). Trong `cn/`: đọc thêm 418 dòng 50 Hz, 100 dòng 60 Hz; 59 động cơ đổi trạng thái "chỉ một tần số"; 0 mã đuôi `/5` thành 60 Hz, 0 mã đuôi `/6` thành 50 Hz. YC20VTD3000-D30 và YC20VTD3300-D30 từ "chỉ 60 Hz" thành có cả hai, do dòng comler ghi 50 Hz / 1500 v/p, nên dòng không ghi tần số của hai mã này không còn bị loại.

**Kiểm chéo đo cloud #1095 (`do-gop-nha-may-tq-ket-qua` 2dac2607; 22/11/2026).** 1.061 lượt giống, 20 lượt đổi top (ra 59, vào 59), 12 lượt chỉ đổi `all`. 454 dòng RA = 445 rời `all` + 9 chỉ rời top.

- **(A) Có một lỗi loại oan, đã sửa ở 70abadc3:** longkai-power 27 dòng RA (6 trong top), đọc từ ô `Engine-DCEC Cummins` ở 68 hàng. Ô này là tên họ của mẫu trang (longkai còn có `Engine-SDEC`, `Engine-Weichai`), ghi cả trên KTA38 / KTA50 / QSK19, trong khi NCC khác ghi các mã đó là CCEC (KTA38-G2 11, KT38-GA 3, KTA50-G15 6, QSK19-G11 5) và không nguồn nào ghi DCEC. Sau sửa: 0 hàng longkai bị đọc. Số dòng trả lại phải xác nhận bằng đo cloud trên SHA mới.
- 9 dòng RA không có chữ nơi SX: chỉ bị đẩy khỏi top, không `ruled` (aosif QSK60-G8, cgm-italia 403A-11G, ettes-power 4BT3.9-G, gordon-power 404D-22G, mecca-power 5016A-E61TRG3, mingbang 4B3.9-G1/G2, powerzoo 4TNV98-GGE, rise-power 4BT3.9-G2, stone-power 6CTA8.3-G2).
- Các dòng RA còn lại có chữ ở đúng dòng hoặc đúng bảng của nó: aosif `Manufacturer | Chongqing/dongfeng Cummins` (datasheet một model), fdk `Engine Make | Cummins CHINA`, `Perkins CHINA`, shanhua `制造商 Manufacturer | CCEC CUMMINS`, sunkings, jiuan, xinhengxin, yingtai.
- **(B) baifa:** chỉ đọc ô cuối của bảng n101 có cột "ENGINE MANUFACTURER / COUNTRY". 72 hàng: "CHINA" 69, "CUMMINS (CHINA)" 2, "MTU JV CHINA" 1. Không dòng nào bị đọc theo cột mà ô cuối khác CHINA; dòng chỉ có "CHINA STAGE3" không bị đọc.
- **(C) Đã đọc theo lệnh điều phối, ở 5500c45b (99 hàng):** sanq ô "Wuxi" 44; fdk "Mitsubishi (SME Shanghai)" 27; 上海菱重 25 (bdadl-shanghai 9, fukangsi-yangzhou 8, pengpai-yangzhou 8); simpson "SME" 3. Sanq: 16 hàng ở bảng có tiêu đề "C/O of engine", 28 hàng ở bảng cùng bố cục nhưng thiếu tên cột hoặc ghi nhầm "Fuel Consumption"; cột đó ở cả ba bảng chỉ có Wuxi, UK/INDIA, USA, UK. Bốn ô stone-power "refer to SO…, guangxi neihe market" là ghi chú thị trường, không đọc.
- **(D) 59 dòng VÀO top:** không dòng nào ghi nơi SX ngoài nhóm đã đọc. 12 dòng có chữ nơi SX: trong nhóm (bobig "made in UK", fdk "PERKINS USA" 2, fdk "CUMMINS(UK)", kaihua "UK 4006-23TAG3A", sanq "USA"), nhãn chỉ ghi hãng (aosif QSK23-G2, fdk NTA855-G1B), và 3 dòng thuộc (C): fdk "SME Shanghai" 2, sanq 403A-15G1 "Wuxi" 1.

**PR chồng #1098 (`kaihua-60-esp`, 614d8b8b, base `nha-may-tq` 5500c45b; 22/11/2026, chưa đo cloud).**

- **kaihua "-60":** áp 35 hàng `HC-BD…-60` (số 32 báo trước đó thiếu 3 hàng viết "HC-BD 2060-60"). Không hàng nào tự ghi Hz hoặc tốc độ. Hai ô "1500" ở HC-BD1500-60 và HC-BD1650-60 là kVA (cột Standby / Prime), không phải v/p, nên không mâu thuẫn. 4 mã không mang "/6": 12M33D1265E201, 12M26D1012E201, 12M33D1320E201, 12M33D1108E201. Luật chỉ áp cho chính dòng, không làm động cơ thành "chỉ 60 Hz" với NCC khác.
- **Dòng GF, đã áp theo điều phối (Khoa đồng ý "-60" trong tên model của kaihua là 60 Hz, không giới hạn HC-BD):** bảng nguồn có 27 hàng `HC-…GF…-60` (n122 Perkins 26, n125 MTU 1), danh sách đủ ở `nghiem-thu\kaihua-60-gf.txt`. 26 hàng có bản ghi động cơ; `HC-14GF-60` ghi hai mã ("403D-15G or 403A-15G2") nên không có bản ghi. Không hàng nào, không bảng nào ghi 50 Hz / 1500 v/p. 12 hàng có hàng cùng tên không đuôi, cùng động cơ, và công suất đều cao hơn (ví dụ 33 → 38, 110 → 125, 330 → 380 kVA), hợp với bản 60 Hz. 15 hàng còn lại không có hàng đối chiếu cùng động cơ, chỉ dựa vào tên. **Nghi nguồn ghi sai:** `HC-65GF-60` ghi 38/35 kVA, 1103A-33G, trùng hệt `HC-34GF-60` dù tên là 65.
- **Mã "^":** 16 mã dạng Baudouin, 24 hàng, 9 NCC (baudouin 7, baifa 5, mecca 3, weichai-heavy 2, weichai-power 2, chuangyuan 2, landtop 1, aosif 1, voltgent 1). `WP6D180E201^` không áp. Gói prime xác định bằng `cap.rating !== "standby"` (cỡ không ghi mức là prime, Khoa 21/11). Lý do loại `esp`; model HSMT nêu đích danh ở lại.
- Số lượt-dòng và top 30 của hai luật: xem kiểm chéo đo gộp ngay dưới.

**Kiểm chéo đo gộp 3 PR (`do-gop-gop-3pr-ket-qua` 24276766; đầu d871ccca + dca34de1, gốc 8b921737; 22/11/2026).** Origin, tần số, mức công suất tính lại từ bản bidhist trên máy (chụp 20/11): đủ 1.093 lượt, khớp cả 492 lượt của TSV. Không chạy do-gop toàn bộ.

1. **made:** 505 lượt-dòng `all` + 67 top, ở 32 lượt, chỉ g7 (17 lượt) và g7eu (15 lượt); 0 lượt G20 hoặc không xuất xứ. Cả 505 dòng tìm lại được chữ nơi SX ở chính dòng / bảng. Hai dòng aosif: chữ ở datasheet riêng của đúng model. KTA50-G15A [n1063] dòng 25/64 `| Manufacturer | Chongqing Cummins`, cùng bảng `| Model | KTA50-G15A`; QSK38-G26 [n1055] dòng 25/62, cùng chữ, cùng bảng `| Model | QSK38-G26`.
2. **VÀO top có chữ nhà máy:** fdk 4B3.9-G12 (8), bobig 1106A-70TG1 (1), sanq 403D-11G (2) đều ở lượt origin `all`, đúng. **fdk S6R2-PTAA-C (2) và S16R2-PTAW-C (1) ở lượt g7eu là chỗ hở:** dòng bảng của hai mã có "Mitsubishi (SME Shanghai)" nên bị loại, nhưng datasheet [n1117], [n1124] ghi `| Engine Make | SME`, `| Engine Manufacturer | SME` / `SME Shanghai` ở bảng nhãn, mà danh sách `CN_CELLS` chỉ đọc dòng bảng. Cùng dạng ở bảng nhãn: fdk 21 dòng nhãn, westinpower 28, aosif 5 (`Brand | SME`), superwatt 1. Chưa sửa, chờ quyết. Longkai `Engine-DCEC Cummins` VÀO ở g7eu (3) là đúng theo quyết định bỏ chữ mẫu.
3. **freq:** cả 1.173 lượt-dòng là gói 50 Hz, đều kaihua, đều có tên "-60". Bộ 1.093 lượt không có lượt nào `hints.freq = 60`, nên chiều "gói 60 Hz giữ dòng -60" chỉ có test, chưa có ca thật.
4. **esp:** 64 lượt-dòng, 33 lượt, không dòng nào ở top. Cả 33 lượt `cap.rating` trống (= prime). Soát số HSMT ghi: 11 không ghi mức; 15 có số liên tục đúng cỡ hoặc ghi liên tục; 0 lượt chỉ ghi dự phòng. **7 lượt (9 dòng) có cỡ là SỐ DỰ PHÒNG, kèm số liên tục thấp hơn:** IB2300073034 (2500 / 2250), IB2500102600 (2500 / 2250), IB2500432527 (1000 / 910), IB2600107089 (1675 / 1500), IB2600418114 (1000 / 900), IB2600511196 (1000 / 900), IB2600513216 (2750 / 2500). `cap` đọc từ tên gói nên không có `rating`. Chờ quyết.
   **Nguồn của "^":** tờ hãng có chú thích ESP chỉ phủ 3 mã: 16M33G2250/5^ [1018], 12M55G3000/5^ [1017], 16M55G4000/5^ [1019], tức 7 / 64 lượt-dòng. 57 / 64 là mã chỉ NCC ghi "^", không tờ hãng nào: 16M33D1980E310^ (chuangyuan 103, mecca 5001), 8M33D1012E311^ (aosif 123, mecca 5001), 8M33G900/6^ (mecca 5001, voltgent 110), và 4 mã baifa (12M55G6D3/5^, 16M33G8D3/5^, 20M33G4D3/5^, 8M33G6D3/5^). Bảng hãng [1005–1007] có ghi "^" ở 6M31G1000/5, 6M31G800/6, 20M33G2750/5, 6M11G176/6 nhưng các tệp đó không có câu chú thích; bốn mã này không có trong 33 lượt.
5. **61 dòng bị đẩy khỏi top:** cả 61 còn trong `all`, điểm không đổi.
6. **325 VÀO top:** 0 dòng `ruled`, 0 dòng tự ghi Hz khác gói, 0 tên "-60", 0 mã "^". Một dòng tự ghi 60 Hz (uleengen 403D-11G, IB2400265303) ở gói không ràng buộc tần số, đúng luật.

## Lệnh

```powershell
$env:GENBID_LOCAL_SUPPLIERS="1"; node suppliers/config-bot.mjs prep --key IB2600603983 --out <thư mục>\prep --origin all
```

Bảng điểm lấy từ bản `config-bot.mjs` có móc theo dõi ở commit 795aa1fb (khớp 30/30 dòng `catalog.md` của lệnh trên). Sau sửa: cùng lệnh, chạy trong `wt-cand-compr`.
