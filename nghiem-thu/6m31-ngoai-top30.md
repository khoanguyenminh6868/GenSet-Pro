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

**Lỗi 60 Hz, PR #1089 (22/11/2026, bản 2773e3a8, chưa đo cloud).** Vì sao 6M31G660/6 lọt: luật 17/11 cần ít nhất hai dòng ghi tần số, mà dòng weichai "WPG660*76 | 1800 | …" chỉ có tốc độ, không có chữ Hz, nên động cơ này chỉ có 1 dòng ghi tần số. Bản sửa đọc cột tốc độ của chính dòng (`hzOfRow`). Trong `cn/`: đọc thêm 418 dòng 50 Hz, 100 dòng 60 Hz; 59 động cơ đổi trạng thái "chỉ một tần số"; 0 mã đuôi `/5` thành 60 Hz, 0 mã đuôi `/6` thành 50 Hz. YC20VTD3000-D30 và YC20VTD3300-D30 từ "chỉ 60 Hz" thành có cả hai, do dòng comler ghi 50 Hz / 1500 v/p, nên dòng không ghi tần số của hai mã này không còn bị loại.

## Lệnh

```powershell
$env:GENBID_LOCAL_SUPPLIERS="1"; node suppliers/config-bot.mjs prep --key IB2600603983 --out <thư mục>\prep --origin all
```

Bảng điểm lấy từ bản `config-bot.mjs` có móc theo dõi ở commit 795aa1fb (khớp 30/30 dòng `catalog.md` của lệnh trên). Sau sửa: cùng lệnh, chạy trong `wt-cand-compr`.
