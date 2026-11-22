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

**Đáng ngờ, chờ Khoa:** 657 dòng (14 dòng top 30) lệch đúng 0,1 so với HSMT; theo luật hiện tại vẫn loại.

| Số của động cơ / HSMT | Dòng |
|---|---|
| 16,5 / 16,6 | 397 |
| 14,5 / 14,6 | 246 |
| 16,8 / 16,7 | 6 |
| 16,4 / 16,5 | 5 |
| 17,5 / 17,6 | 3 |

Sau sửa, gói IB2600603983 trên main mới: Baudouin = #6 6M33G750/5 kaihua, #10 6M31G825/5 voltgent, #20 6M31G825/5 weichai. Toàn bộ test `suppliers/*.test.mjs`: 1492/1492. **Số đo cloud là của d0edb654, cần đo lại trên SHA mới của #1062.**

## Lệnh

```powershell
$env:GENBID_LOCAL_SUPPLIERS="1"; node suppliers/config-bot.mjs prep --key IB2600603983 --out <thư mục>\prep --origin all
```

Bảng điểm lấy từ bản `config-bot.mjs` có móc theo dõi ở commit 795aa1fb (khớp 30/30 dòng `catalog.md` của lệnh trên). Sau sửa: cùng lệnh, chạy trong `wt-cand-compr`.
