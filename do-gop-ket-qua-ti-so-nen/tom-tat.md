# Tóm tắt đo top 30: gốc vs cand-ti-so-nen (PR #1062)

Gốc: main 594dfb37f83564d2aebb7f5c11814758412eab7e. Đầu: nhánh cand-ti-so-nen d0edb65493e91cc0bcbc4a30c30327dca5fba228. Cùng một bản bidhist (tải lúc 2026-11-21T16:32:59.829Z), cùng thư mục cn của gốc.

- Tổng lượt: 1093 (chỉ một bên: 0; lỗi: 0)
- Giống hệt (top, điểm, all, dropped): **1015**
- Đổi tập top 30 (có dòng ra/vào top): **75** (tổng dòng ra 1035, dòng vào 1030)
- Chỉ đổi thứ tự/điểm trong top (cùng tập): **0**
- Top giống hệt nhưng all/dropped khác: **3**

Ghi chú: tệp kết quả của công cụ chỉ ghi khoá dòng (NCC|động cơ|alt|dòng), điểm, `all` và số `dropped`; KHÔNG ghi lý do loại (tỉ số nén hay nước sản xuất). Cột "trong all nhánh" cho biết dòng ra khỏi top còn là ứng viên (xuống hạng) hay bị loại khỏi all. Hãng = tiền tố khoá động cơ.

## Mọi lượt đổi tập

### IB2200008211#0 — top gốc 30, top nhánh 30; ra 10, vào 10; dropped 713 → 779

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 6 | 280 | CA6DF2D14D | wintpower | UCI274C |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 273 | QSB59G30 | fdk-energy | UCI274D |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 269 | D1146 | rise-power | LSA442VS3 |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 269 | LR6A3ZD | acepow-fuan | UC274C |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 261 | TD226B6D | rise-power | LSA442S75 |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 257 | WP6D132E200 | jet-power | JET274D |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 236 | TD226B6D | gb-power | UCI274C |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 229 | CA6DF2D14D | koten-power |  |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 229 | D1146T | kaihua-genset |  |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 229 | LR6A3ZD | koten-power |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 13 | 256 | 6BT59G296KW | yihua-fujian | UCI274C80KW |  | 45 |
| 20 | 232 | 1006TAG1A | wintpower | UCI274D |  | 59 |
| 23 | 229 | R6105IZLD | elitech-power |  |  | 84 |
| 24 | 225 | 6BG1ZL1 | acepow-fuan | UC274D |  | 106 |
| 25 | 222 | YCM48TAA140G20 | byc-power | 274C |  | 109 |
| 26 | 217 | 1006TAG1A | jet-power | JET274D |  | 151 |
| 27 | 213 | CA6DF2D14DYFD10W | bobig-power | BW274C |  | 164 |
| 28 | 211 | R6105IZLD | kaichen-jiangsu |  |  | 179 |
| 29 | 208 | YC6B180LD20 | elitech-power |  |  | 183 |
| 30 | 205 | R6105ZD | gordon-power |  |  | 184 |

### IB2200012854#0 — top gốc 30, top nhánh 30; ra 2, vào 2; dropped 785 → 794

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 258 | LR4B5D | acepow-fuan | UC224D |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 218 | LR4B5D | longkai-power |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 13 | 194 | 4JB1TS | acepow-fuan | UC224D |  | 18 |
| 30 | 173 | 4BTA39GM | victory-generator |  |  | 47 |

### IB2200018828#0 — top gốc 30, top nhánh 30; ra 15, vào 15; dropped 1703 → 1816

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 274 | 400623TAG3A | sanq-power | LVI634B |  | không (bị loại; lý do: công cụ không ghi) |
| 3 | 271 | 6WTAA35G32 | fdk-energy | NIANFENGNF404D |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 270 | YC6TH1220D31 | fdk-energy | NIANFENGNF404D |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 267 | 6WTAA35G32 | longkai-power | LK634D |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 259 | 6WTAA35G32 | jet-power | JET634D |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 259 | SC33W1150D2 | bobig-power | BW404D |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 228 | 6KTAA25G31 | kaihua-genset |  |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 228 | 6KTAA25G31 | voltgent |  |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 228 | YC6TD1000D30 | fudiankang-hunan |  | FDKGENSETMODEL:FDKY825/H1 | không (bị loại; lý do: công cụ không ghi) |
| 15 | 226 | 400623TAG3A | voltgent |  |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 222 | SC33W1150D2 | wintpower |  |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 219 | YC6TH1220D31 | kaihua-genset |  |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 214 | SC33W990D2 | beidou-yangzhou |  |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 188 | 400623TAG2A | jianghao-genset |  |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 188 | SC33W990D2 | jianghao-genset |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 2 | 259 | 6KTAA25G320 | fdk-energy | NIANFENGNFS6D |  | 10 |
| 4 | 238 | QSK23G3 | ade-power | HC6H |  | 13 |
| 18 | 177 | 8M33D800E201 | penlucky | TALA49B |  | 81 |
| 19 | 170 | K38N | penlucky | S6L1DE4 |  | 87 |
| 20 | 169 | 400623TAG3A(UK) | comappower |  |  | 88 |
| 21 | 167 | SA404874 | sr-genset | TALA49C |  | 95 |
| 22 | 166 | YC6C1220LD20 | mecca-power |  |  | 96 |
| 23 | 166 | YC61220D31 | penlucky | TALA49D |  | 97 |
| 24 | 166 | SAV6728 | sr-genset | TALA49D |  | 98 |
| 25 | 158 | YC6C1070LD20 | mingbang-mbkl |  |  | 102 |
| 26 | 158 | YC6C1070LD20 | jianghao-genset |  |  | 103 |
| 27 | 155 | 5008AE30TAG1 | kaihua-genset |  |  | 104 |
| 28 | 155 | R820GE | rcg-power | R7204 |  | 105 |
| 29 | 154 | COM1000DS | comappower |  |  | 107 |
| 30 | 146 | QSK38G9 | deman-power |  | DM1000C1000KVA800KW909KVA727KWQSK38G96CONTACTUS | 109 |

### IB2200021336#0 — top gốc 30, top nhánh 30; ra 18, vào 18; dropped 599 → 932

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 284 | 6BTA59G2 | stone-power | UCI274D |  | không (bị loại; lý do: công cụ không ghi) |
| 2 | 284 | 6BTA59G2 | fdk-energy | UCI274D |  | không (bị loại; lý do: công cụ không ghi) |
| 3 | 284 | QSB59G30 | fdk-energy | UCI274D |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 284 | 6BTA59G2 | sanq-power | UCI274D |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 284 | 6BT59G2 | stone-power | UCI274C |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 280 | CA6DF217D | wintpower | UCI274E |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 278 | 6BT59G2 | longkai-power | LK274D |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 277 | WP6D132E200 | fdk-energy | NIANFENGNF274E |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 274 | WP6D132E200 | longkai-power | LK274D |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 272 | TAD750GE | jet-power | UCI274E |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 269 | LR6A3ZD | acepow-fuan | UC274C |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 265 | QSB59G33 | fdk-energy | UCI274ES |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 265 | D1146T | rise-power | LSA442S7 |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 265 | LR6A3LD | acepow-fuan | UC274D |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 265 | CA6DF217D | uleengen | 274ES |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 261 | 6M11G150/5 | kaihua-genset | TALA44E |  | không (bị loại; lý do: công cụ không ghi) |
| 25 | 261 | TD226B6D | rise-power | LSA442VS45 |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 238 | 6HTAA65G21 | bobig-power | BW274E |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 13 | 237 | WP6D132E201 | penlucky | TALA44E |  | 97 |
| 14 | 233 | CA6DF217D/125KW | jet-power | JET274D1/100KW |  | 100 |
| 15 | 229 | R6105AZLD | eastern-lion-fuan | EL274D |  | 107 |
| 16 | 229 | QSB59G3 | eastern-lion-fuan | EL274D |  | 113 |
| 17 | 229 | R6105IZLD | kaichen-jiangsu |  |  | 115 |
| 18 | 229 | 1006TAG | wintpower | UCI274E |  | 116 |
| 19 | 225 | WP6D132E201 | kaihua-genset |  |  | 180 |
| 20 | 225 | 6CT83GM115 | uleengen | MPH1004 |  | 189 |
| 21 | 224 | TBD226B6D | rise-power | LSA442S75 |  | 195 |
| 22 | 220 | QSB5930 | fdk-energy | UCI274D |  | 209 |
| 23 | 216 | NEF67SM1S500 | sanq-power | UCI274E |  | 212 |
| 24 | 213 | YC6B155LD21 | eastern-lion-fuan | EL274D |  | 247 |
| 25 | 209 | CA6DF217DYFD10W | bobig-power | BW274D |  | 259 |
| 26 | 209 | CA6DF217DYFD10W | acepow-fuan | UC274DS |  | 260 |
| 27 | 209 | YCA48TAA180G20 | byc-power | 274D |  | 261 |
| 28 | 208 | CATC71 | rise-power | LC3114H |  | 263 |
| 29 | 205 | YC6B160ZD20 | longkai-power |  |  | 269 |
| 30 | 205 | BF6L913CD | victory-generator |  |  | 270 |

### IB2200030282#0 — top gốc 30, top nhánh 30; ra 4, vào 4; dropped 1573 → 1585

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 4 | 262 | TAD750GE | jet-power | UCI274E |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 254 | TD226B6D | rise-power | LSA442VS45 |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 251 | 6M11G150/5 | kaihua-genset | TALA44E |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 203 | TAD750GE | comappower |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 16 | 215 | 1006TAG | jet-power | JET274D1 |  | 33 |
| 28 | 194 | WP4D118E200 | victory-generator |  |  | 62 |
| 29 | 191 | 6M11G110/6WP6D132E201 | kaihua-genset | UCI274D1 |  | 64 |
| 30 | 191 | 6BT59G2(115) | bobig-power | BW274D |  | 67 |

### IB2200031154#0 — top gốc 30, top nhánh 30; ra 10, vào 10; dropped 713 → 779

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 6 | 280 | CA6DF2D14D | wintpower | UCI274C |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 273 | QSB59G30 | fdk-energy | UCI274D |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 269 | D1146 | rise-power | LSA442VS3 |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 269 | LR6A3ZD | acepow-fuan | UC274C |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 261 | TD226B6D | rise-power | LSA442S75 |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 257 | WP6D132E200 | jet-power | JET274D |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 236 | TD226B6D | gb-power | UCI274C |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 229 | CA6DF2D14D | koten-power |  |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 229 | D1146T | kaihua-genset |  |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 229 | LR6A3ZD | koten-power |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 13 | 256 | 6BT59G296KW | yihua-fujian | UCI274C80KW |  | 45 |
| 20 | 232 | 1006TAG1A | wintpower | UCI274D |  | 59 |
| 23 | 229 | R6105IZLD | elitech-power |  |  | 84 |
| 24 | 225 | 6BG1ZL1 | acepow-fuan | UC274D |  | 106 |
| 25 | 222 | YCM48TAA140G20 | byc-power | 274C |  | 109 |
| 26 | 217 | 1006TAG1A | jet-power | JET274D |  | 151 |
| 27 | 213 | CA6DF2D14DYFD10W | bobig-power | BW274C |  | 164 |
| 28 | 211 | R6105IZLD | kaichen-jiangsu |  |  | 179 |
| 29 | 208 | YC6B180LD20 | elitech-power |  |  | 183 |
| 30 | 205 | R6105ZD | gordon-power |  |  | 184 |

### IB2200049662#0 — top gốc 30, top nhánh 30; ra 16, vào 16; dropped 2503 → 2647

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 2 | 278 | 6KTAA25G36 | longkai-power | LK544C |  | không (bị loại; lý do: công cụ không ghi) |
| 3 | 270 | QSK19G13 | longkai-power | LK544C |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 268 | 6KTAA25G310 | fdk-energy | NIANFENGNF354E |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 268 | YC6TD780D31 | fdk-energy | NIANFENGNF354E |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 263 | 6KTAA25G35 | longkai-power | LK544E |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 263 | 6M33D572E200 | longkai-power | LK544E |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 256 | YC6TD780D31 | dingbo | TFW24504A |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 256 | 6KTAA25G310 | jet-power | JET544ES |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 254 | 6M33D572E200 | acepow-fuan | HC534E |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 229 | 6KTAA25G36 | rcg-power | WR544C |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 221 | QSK19G13 | comappower |  |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 221 | QSNTG4X | comappower |  |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 217 | KTA19G8E | voltgent |  |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 214 | 6KTAA25G35 | rcg-power | WR544E |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 209 | 6KTAA25G39 | sr-genset | SA354576 |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 209 | KTA19G8A | voltgent |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 14 | 206 | S6RPTA | ettes-power |  |  | 66 |
| 15 | 205 | X6170ZCD4404 | uleengen | MXH4004 |  | 67 |
| 16 | 205 | 8M21G660/5 | kaihua-genset | S5L1DE41 |  | 69 |
| 17 | 205 | YC6TD600LC20 | uleengen | MPH4004 |  | 72 |
| 18 | 200 | YC6TD780D30 | fdk-energy | NIANFENGNFS5E |  | 75 |
| 19 | 197 | K19DM | ettes-power |  |  | 79 |
| 20 | 197 | KTA19DM | kaihua-genset |  |  | 81 |
| 21 | 195 | QSK19G6 | longkai-power |  |  | 82 |
| 22 | 195 | QSK19G6 | comappower |  |  | 83 |
| 23 | 192 | YC6TD780LD20 | eastern-lion-fuan | EL354E |  | 89 |
| 24 | 189 | TBD604BL6 | ettes-power |  |  | 94 |
| 26 | 177 | WP13D490E311 | penlucky | TALA473A |  | 106 |
| 27 | 177 | YC6T660LD22 | penlucky | TALA473C |  | 107 |
| 28 | 176 | 6M33D572E201 | kaihua-genset |  |  | 113 |
| 29 | 176 | YC6TD780D32 | comappower |  |  | 114 |
| 30 | 173 | KTA19G4M | victory-generator |  |  | 122 |

### IB2200060818#0 — top gốc 30, top nhánh 30; ra 10, vào 10; dropped 713 → 779

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 6 | 280 | CA6DF2D14D | wintpower | UCI274C |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 273 | QSB59G30 | fdk-energy | UCI274D |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 269 | D1146 | rise-power | LSA442VS3 |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 269 | LR6A3ZD | acepow-fuan | UC274C |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 261 | TD226B6D | rise-power | LSA442S75 |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 257 | WP6D132E200 | jet-power | JET274D |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 236 | TD226B6D | gb-power | UCI274C |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 229 | CA6DF2D14D | koten-power |  |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 229 | D1146T | kaihua-genset |  |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 229 | LR6A3ZD | koten-power |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 13 | 256 | 6BT59G296KW | yihua-fujian | UCI274C80KW |  | 45 |
| 20 | 232 | 1006TAG1A | wintpower | UCI274D |  | 59 |
| 23 | 229 | R6105IZLD | elitech-power |  |  | 84 |
| 24 | 225 | 6BG1ZL1 | acepow-fuan | UC274D |  | 106 |
| 25 | 222 | YCM48TAA140G20 | byc-power | 274C |  | 109 |
| 26 | 217 | 1006TAG1A | jet-power | JET274D |  | 151 |
| 27 | 213 | CA6DF2D14DYFD10W | bobig-power | BW274C |  | 164 |
| 28 | 211 | R6105IZLD | kaichen-jiangsu |  |  | 179 |
| 29 | 208 | YC6B180LD20 | elitech-power |  |  | 183 |
| 30 | 205 | R6105ZD | gordon-power |  |  | 184 |

### IB2200064629#0 — top gốc 30, top nhánh 30; ra 12, vào 12; dropped 596 → 801

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 481 | 4B39G11 | fdk-energy | S0L2G1 |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 472 | YSD490D | tecgen-fujian | TGI184S16 |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 469 | YSD490D | acepow-fuan | BC184E |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 469 | 4B39G11 | bobig-power | BW184ES |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 461 | BFM3G1 | acepow-fuan | BC184E |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 456 | Y490D | tecgen-fujian | TG184S18 |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 456 | QSB39G31 | fdk-energy | S0L2P1 |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 444 | Y495D | tecgen-fujian | TG184S20 |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 444 | Y495D | acepow-fuan | BC184ES |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 444 | Y490D | uleengen | 184EF |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 437 | JE493DB04/21KW | jet-power | JET184D/16KW |  | có, hạng 20 |
| 22 | 429 | 4Z27G11 | voltgent |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 15 | 421 | 4DW9129D/21KW | jet-power | JET184E/18KW |  | 64 |
| 16 | 421 | JE493DB04 | uleengen | 164D |  | 65 |
| 18 | 413 | 4DW9129DYFD10W | acepow-fuan | BC184E |  | 80 |
| 22 | 413 | N4100DS30 | acepow-fuan | BC164E |  | 84 |
| 23 | 412 | 495D | sunny-weifang | STC20 |  | 87 |
| 24 | 405 | K4100DS | acepow-fuan | BC184E |  | 92 |
| 25 | 404 | 4BT39G2 | hosem-power |  |  | 109 |
| 26 | 397 | 495D | victory-generator |  |  | 126 |
| 27 | 397 | BFM3G3 | voltgent |  |  | 128 |
| 28 | 397 | 4Z29G42 | voltgent |  |  | 130 |
| 29 | 396 | 4DW9138D | victory-generator |  |  | 136 |
| 30 | 388 | 4DW9235DYFD10W | bobig-power | BW184F |  | 162 |

### IB2200069185#0 — top gốc 30, top nhánh 30; ra 7, vào 7; dropped 594 → 917

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 15 | 484 | CA6DF219D | wintpower | UCI274F |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 484 | WP6D152E200 | uleengen | UCI274E |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 478 | WP6D152E200 | longkai-power | LK274F/S |  | không (bị loại; lý do: công cụ không ghi) |
| 25 | 477 | 6CTA83G1 | sanq-power | UCI274F |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 476 | TAD751GE | jet-power | UCI274F |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 469 | WP6D152E200 | bobig-power | BW274E |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 469 | LR6B3LD | acepow-fuan | UC274E |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 22 | 477 | 6CTA83G2 | sanq-power | UCI274F |  | 45 |
| 25 | 469 | YC6B205LD20 | dingbo | TFW21204A |  | 66 |
| 26 | 469 | YC6B205LD20 | uleengen | 274E |  | 70 |
| 27 | 469 | R6105IZLD | uleengen | 274E |  | 73 |
| 28 | 464 | 1106A70TAG3 | jet-power | UCI274G |  | 86 |
| 29 | 464 | 1106A70TAG3 | tecgen-fujian | UCI274G |  | 89 |
| 30 | 464 | 6CTA83G2 | stone-power | UCI274G |  | 90 |

### IB2200082109#0 — top gốc 30, top nhánh 30; ra 18, vào 18; dropped 1390 → 1713

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 287 | MTA11G2 | sanq-power | UCDI274K |  | không (bị loại; lý do: công cụ không ghi) |
| 2 | 287 | NT855GA | sanq-power | UCDI274K |  | không (bị loại; lý do: công cụ không ghi) |
| 3 | 284 | NT855GA | stone-power | UCI274H |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 284 | YC6MK350LD20 | huali-shandong | HLF200 |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 281 | YC6MK350D30 | fdk-energy | NIANFENGNF274K |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 281 | YC6MK350LD20 | fdk-energy | NIANFENGNF274K |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 278 | MTA11G2 | longkai-power | LK274K |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 273 | SC9D340D2 | fdk-energy | NIANFENGNF274K |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 270 | SC9D340D2 | longkai-power | LK274K |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 269 | MTA11G2A | dingbo | HCI444C1 |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 269 | YC6MK350D30 | dingbo | TFW22004A |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 269 | NTA855G1A | stone-power | HCI444D |  | có, hạng 18 |
| 20 | 264 | MTAA11G3 | uleengen | HCI444D |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 261 | 6DTAA89G24 | jet-power | JET274J |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 253 | 6DTAA89G23 | jet-power | JET274K |  | không (bị loại; lý do: công cụ không ghi) |
| 25 | 253 | 6DTAA89G23 | bobig-power | BW274K |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 249 | YC6MK420LD20 | wintpower | WT444D |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 249 | CA6DM2J39D | uleengen | 4ES |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 3 | 275 | WP10D264E200 | uleengen | UCI274K |  | 18 |
| 7 | 271 | NTA855G1A | fdk-energy | S4L1DD41 |  | 26 |
| 10 | 268 | SC10E380D2 | longkai-power | LK444DS |  | 41 |
| 11 | 262 | QSNTG6 | longkai-power | LK274K |  | 48 |
| 14 | 255 | NTA855GA | fdk-energy | UCDI274K |  | 61 |
| 18 | 245 | WP10CD264E200 | uleengen | MPH2004 |  | 74 |
| 19 | 245 | 6M16G350/5 | kaihua-genset | TALA46F |  | 76 |
| 20 | 241 | 6ETAA118G22 | jet-power | JET444E |  | 86 |
| 21 | 241 | WP10D238E200 | penlucky | TALA44M |  | 88 |
| 22 | 237 | WD129TAD23 | wintpower | LSA462L6 |  | 90 |
| 23 | 229 | BF6M1015G1A | dingbo | TFW22004 |  | 104 |
| 24 | 229 | YM6S4LD | koten-power |  |  | 108 |
| 25 | 229 | NTA855G1 | eastern-lion-fuan | EL314C |  | 121 |
| 26 | 229 | WP10D238E200 | elitech-power |  |  | 132 |
| 27 | 229 | NTA855G1 | hosem-power |  |  | 134 |
| 28 | 225 | 618ZLD | jet-power | JET444D |  | 162 |
| 29 | 224 | WD129TAD25 | wintpower | LSA462L9 |  | 163 |
| 30 | 223 | CURSOR87TE3S550 | sanq-power | UCDI274K |  | 164 |

### IB2200083057#0 — top gốc 30, top nhánh 30; ra 21, vào 21; dropped 753 → 1855

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 287 | QSZ13G3 | koten-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 2 | 287 | 2506CE15TAG1 | gb-power | HCI544C | STANDARDFEATURES | không (bị loại; lý do: công cụ không ghi) |
| 3 | 287 | 2506CE15TAG2 | gb-power | HCI544C | STANDARDFEATURES | không (bị loại; lý do: công cụ không ghi) |
| 4 | 287 | KTA19G3A | yongcai-elecmama | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 287 | QSZ13G3 | uleengen | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 287 | 6ZTAA13G4 | stone-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 287 | KTA19G3 | sanq-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 287 | KTA19G3 | stone-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 287 | QSZ13G5 | koten-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 287 | 2506CE15TAG1 | sanq-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 287 | QSZ13G2 | sanq-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 284 | 2506CE15TAG2 | huali-shandong | HLF400 |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 284 | TAD1651GE | jet-power | HCI544D |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 284 | KTA19G3A | sanq-power | HCI544D |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 281 | YC6T660D31 | fdk-energy | NIANFENGNF354D |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 278 | TAD1651GE | dingbo | LSA472M7 |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 278 | 6KTAA25G36 | longkai-power | LK544C |  | không (bị loại; lý do: công cụ không ghi) |
| 25 | 273 | 6M21G550/5 | kaihua-genset | S5L1DC4 |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 273 | 6M21G550/5 | longkai-power | LSA473M8 |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 269 | TAD1345GEB | jet-power | ECO402S4C |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 265 | 6M21G500/5 | kaihua-genset | S4L1DG41 |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 3 | 284 | KTA19G4 | sanq-power | HCI544D |  | 27 |
| 9 | 274 | KTAA19G5 | yongcai-elecmama | HCI544D |  | 86 |
| 10 | 271 | QSX15G6 | sanq-power | HCI544C |  | 93 |
| 13 | 269 | KTAA19G5 | stone-power | HCI544C |  | 113 |
| 14 | 268 | QSX15G8 | sanq-power | HCI544D |  | 127 |
| 15 | 263 | KTAA19G6 | longkai-power | LK544E |  | 146 |
| 16 | 261 | 6M26D484E200 | bobig-power | BW354D |  | 151 |
| 17 | 261 | YC6T600LD22 | fdk-energy | NIANFENGNFS4J |  | 158 |
| 18 | 260 | 2206DE13TAG3 | kaihua-genset | S4L1DF41 |  | 159 |
| 19 | 257 | KTAA19G6 | hosem-power | HCI544E |  | 163 |
| 20 | 253 | YC6T660LD20 | wintpower | WT544D |  | 173 |
| 21 | 253 | YC6T660LD20 | dingbo | TFW24004A |  | 175 |
| 22 | 253 | 6M26D447E200 | jet-power | JET544C |  | 183 |
| 23 | 245 | TAD1641GEB | jet-power | ECO403S4C |  | 197 |
| 24 | 244 | YC6TD780LD20 | wintpower | WT544E |  | 199 |
| 25 | 244 | KTA19G2 | penlucky | S4L1DF41 |  | 201 |
| 26 | 241 | 6M21G8D3/5 | rcg-power | S5L1DC4 |  | 205 |
| 27 | 237 | 6M33D506E310 | acepow-fuan | HC534D |  | 225 |
| 28 | 237 | KTA19DM | uleengen | MPH4004 |  | 227 |
| 29 | 233 | YC6T600LD22 | penlucky | TALA473B |  | 235 |
| 30 | 229 | 6KTAA25G311 | rcg-power | WR544C |  | 249 |

### IB2200100465#0 — top gốc 30, top nhánh 30; ra 17, vào 17; dropped 946 → 1099

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 3 | 269 | LR4B3ZD | acepow-fuan | UC224E |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 268 | SC4H115D2 | fdk-energy | NIANFENGNF224G |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 268 | 4HTAA43G33 | fdk-energy | NIANFENGNF224G |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 267 | 4BTA39G11 | stone-power | UCI224G |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 265 | 4BTA39G13 | longkai-power | LK224G |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 265 | SC4H115D2 | longkai-power | LK224G |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 264 | 1104A44TG2 | sanq-power | UCI224F |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 261 | BF4M2012CG1 | acepow-fuan | UC224F |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 256 | 4BTA39G11 | bobig-power | BW224F |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 253 | Y4110ZLD | acepow-fuan | UC224F |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 249 | 4HT43G23 | longkai-power | LK224G |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 238 | WP4CD100E200 | uleengen | MPH644 |  | có, hạng 15 |
| 20 | 234 | 1104A44TG2 | sr-genset | TALA44C |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 222 | 1104A44TG1 | minsun-motor | SYA224F |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 209 | LR4M3LD | koten-power |  |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 208 | BF4M2012CG1 | elitech-power |  |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 208 | BF4M2012C | kingway-power |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 5 | 256 | CA4DF212D | uleengen | 224G |  | 31 |
| 15 | 208 | QSB39G3 | eastern-lion-fuan | EL224G |  | 85 |
| 16 | 208 | QSB39G3 | victory-generator |  |  | 87 |
| 17 | 205 | YC4D100ZD20 | minsun-motor | SYA224E |  | 91 |
| 18 | 204 | R4110AZLD | jet-power | JET224G |  | 93 |
| 19 | 204 | CA4DF212D/84KW | jet-power | JET224G/68KW |  | 94 |
| 20 | 201 | 4M10G110/5 | elitech-power |  |  | 96 |
| 21 | 201 | 4ZT32G11 | elitech-power |  |  | 99 |
| 22 | 200 | 4M10G88/5 | elitech-power |  |  | 102 |
| 23 | 196 | NEF45SM3S500 | voltgent |  |  | 112 |
| 24 | 192 | TAD530GE | comappower |  |  | 117 |
| 25 | 192 | YC4D120D31 | penlucky | TALA44D |  | 119 |
| 26 | 189 | 4BTA39G2 | jianghao-genset |  |  | 122 |
| 27 | 185 | 1104DE44TAG1 | rise-power |  |  | 124 |
| 28 | 185 | CA4F212DYFD10W | acepow-fuan | UC274C |  | 125 |
| 29 | 185 | CA4F212DYFD10W | bobig-power | BW274C |  | 126 |
| 30 | 184 | YCD4Y22D110 | eastern-lion-fuan | EL224G |  | 127 |

### IB2200106999#0 — top gốc 30, top nhánh 30; ra 7, vào 7; dropped 934 → 1088

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 9 | 484 | CA6DF2D14D | wintpower | UCI274C |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 470 | CA6DF217D | wintpower | UCI274E |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 469 | LR6A3ZD | acepow-fuan | UC274C |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 455 | LR6A3LD | acepow-fuan | UC274D |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 421 | 1006TG1A | gordon-power |  |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 375 | WP6D132E200 | runda-fujian |  |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 281 | QSB59G30 | fdk-energy | UCI274D |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 13 | 459 | YC6B180LD20 | wintpower | WT274E |  | 29 |
| 14 | 450 | YC6B155LD21 | wintpower | WT274D |  | 34 |
| 15 | 429 | 6BG1ZL1 | acepow-fuan | UC274D |  | 40 |
| 18 | 405 | 6CDF2D14DYFD10W | acepow-fuan | UC274C |  | 54 |
| 23 | 365 | WP41D100E210 | gordon-power |  |  | 64 |
| 29 | 270 | 6BTAA59G2 | stone-power | UCI274E |  | 88 |
| 30 | 269 | 6BT59G1 | bobig-power | BW274C |  | 91 |

### IB2300000242#0 — top gốc 30, top nhánh 30; ra 1, vào 1; dropped 80 → 82

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 21 | 205 | INDIA400623TAG2A | kaihua-genset | S5L1DH1 |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 22 | 198 | 2806AE18TTAG5 | generatordieselchina |  |  | 444 |

### IB2300022380#0 — top gốc 30, top nhánh 30; ra 21, vào 21; dropped 285 → 654

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 2 | 484 | 1104A44TG1 | uleengen | S1L2Y1 |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 480 | WP41D66E200 | uleengen | S1L2Y1 |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 477 | YC4D90ZD25 | fdk-energy | NIANFENGNF224F |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 477 | WP41D66E200 | fdk-energy | NIANFENGNF224F |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 477 | SC4H95D2 | fdk-energy | NIANFENGNF224F |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 477 | YC4D90D34 | fdk-energy | NIANFENGNF224F |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 476 | 1104A44TG1 | jet-power | UCI224F |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 472 | Y4105ZLD | tecgen-fujian | TGI224S44 |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 471 | 4110/125Z09D | wintpower | UCI224F |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 469 | Y4105ZLD | acepow-fuan | UC224E |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 469 | LR4B5D | acepow-fuan | UC224D |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 465 | 4BTA39G11 | bobig-power | BW224E |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 465 | YT4B2ZD | acepow-fuan | UC224E |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 465 | SC4H95D2 | jet-power | JET224E |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 457 | YD4EZLD | tecgen-fujian | TG224S50 |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 456 | 4BTA39G11 | wintpower | WT224F |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 449 | 4HT43G22 | bobig-power | BW224E |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 445 | 4HT43G21 | bobig-power | BW224E |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 429 | Y4102ZLD | gordon-power |  |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 429 | YC4D80D34 | comappower |  |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 425 | YC4D90D34 | comappower |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 3 | 484 | 4BTA39G2 | fdk-energy | S1L2Y1 |  | 9 |
| 4 | 472 | QSB39G2 | fdk-energy | S1L2Y1 |  | 27 |
| 8 | 453 | 4HTAA43G32 | fdk-energy | NIANFENGNF224F |  | 75 |
| 9 | 441 | WP4CD66E200 | uleengen | MPH504 |  | 79 |
| 13 | 433 | YC4D90ZD21 | uleengen | 224E |  | 85 |
| 14 | 432 | 4TNV106TGGE | wintpower | UCI224D |  | 88 |
| 15 | 429 | 1004TG | jet-power | JET224E |  | 96 |
| 16 | 428 | 1004TG | wintpower | UCI224E |  | 113 |
| 17 | 425 | DM03VG | jet-power | TALA42H |  | 114 |
| 19 | 421 | QSB39G2 | victory-generator |  |  | 134 |
| 20 | 421 | 4ZT41G21 | voltgent |  |  | 135 |
| 21 | 417 | WP4D66E200 | victory-generator |  |  | 150 |
| 22 | 416 | 4BTA39G2(QC58/67E) | fdk-energy | S1L2Y1 |  | 153 |
| 23 | 413 | 4DX2378DHMS20W | acepow-fuan | UC224E |  | 163 |
| 24 | 413 | R4105ZD | victory-generator |  |  | 165 |
| 25 | 413 | WP4CD66E200 | penlucky | TALA44E |  | 167 |
| 26 | 409 | YCD42T90G20 | byc-power | 224E |  | 177 |
| 27 | 409 | 4BG1Z | acepow-fuan | UC224E |  | 179 |
| 28 | 409 | 4DX2378DHMS20W | bobig-power | BW224E |  | 180 |
| 29 | 405 | YC4D80ZD20 | comappower |  |  | 185 |
| 30 | 401 | F6L912D | victory-generator |  |  | 191 |

### IB2300046231#0 — top gốc 30, top nhánh 30; ra 21, vào 21; dropped 170 → 862

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 2 | 284 | 6BTAA59G12 | koten-power | UCI274F |  | không (bị loại; lý do: công cụ không ghi) |
| 3 | 284 | 6BTAA59G12 | stone-power | UCI274F |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 284 | CA6DF219D | wintpower | UCI274F |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 284 | WP6D152E200 | uleengen | UCI274E |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 284 | 6BTA59G2 | stone-power | UCI274D |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 281 | YC6B205LD20 | wintpower | WT274F |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 281 | WP6D152E200 | fdk-energy | NIANFENGNF274FS |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 281 | SC7H205D2 | fdk-energy | NIANFENGNF274FS |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 281 | YC6B205LD20 | fdk-energy | NIANFENGNF274FS |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 281 | YC6A205D30 | fdk-energy | NIANFENGNF274FS |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 277 | 1106A70TAG3 | jet-power | UCI274F |  | có, hạng 26 |
| 19 | 277 | 6CTA83G1 | sanq-power | UCI274F |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 276 | TAD751GE | jet-power | UCI274F |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 271 | SC7H220D2 | longkai-power | LK274F |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 269 | SC7H220D2 | bobig-power | BW274E |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 269 | YC6A205D30 | dingbo | TFW21204A |  | không (bị loại; lý do: công cụ không ghi) |
| 25 | 269 | LR6B3LD | acepow-fuan | UC274E |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 269 | CA6DF219D | uleengen | 274E |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 269 | SC7H205D2 | uleengen | 274F |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 269 | D1146T | rise-power | LSA442S7 |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 269 | 6BTA59G2 | bobig-power | BW274D |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 2 | 284 | 1106A70TAG2 | fdk-energy | UCI274F |  | 5 |
| 5 | 284 | 6CTA83G2 | fdk-energy | UCI274F |  | 9 |
| 10 | 277 | 6CTA83G2 | sanq-power | UCI274F |  | 55 |
| 13 | 264 | 1106A70TAG3 | tecgen-fujian | UCI274G |  | 116 |
| 14 | 264 | 1106A70TAG3 | uleengen | UCI274G |  | 119 |
| 15 | 260 | TAD731GE | dingbo | LSA443L10 |  | 131 |
| 16 | 258 | QSB67G4 | longkai-power | LK274G |  | 137 |
| 17 | 257 | 6HTAA65G32 | fdk-energy | NIANFENGNF274FS |  | 138 |
| 18 | 245 | YCD6Q23H8210 | fdk-energy | NIANFENGNFS274FS |  | 156 |
| 19 | 245 | WP6CD152E200 | uleengen | MPH1204 |  | 157 |
| 20 | 244 | 1106CP6TAG2 | wintpower | UCI274F |  | 162 |
| 21 | 244 | 1006TAG | wintpower | UCI274E |  | 168 |
| 22 | 237 | R6110ZLD | jet-power | JET274F |  | 181 |
| 23 | 237 | TBD226B6D5 | rise-power | LSA442M95 |  | 182 |
| 24 | 237 | CA6DF219D/140KW | jet-power | JET274F/128KW |  | 183 |
| 25 | 237 | 6CTA83GM155 | uleengen | MPH1204 |  | 186 |
| 26 | 236 | TBD226B6D | rise-power | LSA442M95 |  | 187 |
| 27 | 236 | YC6A230LD20 | wintpower | WT274G |  | 188 |
| 28 | 229 | R6105IZLD | victory-generator |  |  | 209 |
| 29 | 229 | QSB67G3 | victory-generator |  |  | 217 |
| 30 | 229 | QSB59G3 | hosem-power |  |  | 293 |

### IB2300087393#0 — top gốc 30, top nhánh 30; ra 28, vào 28; dropped 974 → 2174

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 284 | 6ZTAA13G3 | stone-power | HCI444D |  | không (bị loại; lý do: công cụ không ghi) |
| 2 | 284 | WP13D385E200 | huali-shandong | HLF300 |  | không (bị loại; lý do: công cụ không ghi) |
| 3 | 281 | WP13D385E200 | fdk-energy | NIANFENGNF314H |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 281 | SC13E550D2 | fdk-energy | NIANFENGNF314H |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 281 | 6ETAA128G32 | fdk-energy | NIANFENGNF314H |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 281 | 6ZTAA13G2 | koten-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 281 | TAD1352GE | dingbo | LSA463L11 |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 281 | SC15G500D2 | fdk-energy | NIANFENGNF314G |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 278 | TAD1355GE | jet-power | HCI444F |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 278 | QSZ13G7 | longkai-power | LK444F |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 278 | NTAA855G7A | stone-power | HCI444F |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 278 | WP13D405E200 | longkai-power | LK444F |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 278 | NTAA855G7A | sanq-power | HCI444F |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 278 | 6ETAA128G32 | longkai-power | LK444F |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 278 | 6ZTAA13G4 | koten-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 278 | 6ZTAA13G2 | sanq-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 278 | NTAA855G7 | uleengen | HCI444F |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 278 | SC15G500D2 | longkai-power | LK444F |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 278 | NTAA855G7 | dingbo | HCI444FS1 |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 274 | 2506CE15TAG1 | sanq-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 269 | WP13D405E200 | jet-power | JET444F |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 269 | YM6S9LFDA | acepow-fuan | HC434FS |  | không (bị loại; lý do: công cụ không ghi) |
| 25 | 269 | YM6S9LFD | acepow-fuan | HC434F |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 269 | TAD1344GEB | jet-power | ECO401S4C |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 269 | TAD1355GE | dingbo | LSA472S5 |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 269 | YM6S9LDB | acepow-fuan | HC434ES |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 268 | 6M21G440/5 | kaihua-genset | S4L1DF41 |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 268 | 2506CE15TAG1 | kaihua-genset | S4L1DG41 |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 1 | 284 | QSNTG3 | fdk-energy | S4L1DF41 |  | 2 |
| 3 | 278 | QSNTG3 | longkai-power | LK444F |  | 32 |
| 4 | 275 | KTA19G2 | stone-power | HCI444E |  | 46 |
| 6 | 284 | KTA19G2 | fdk-energy | S4L1DF41 |  | 4 |
| 7 | 268 | YC6K600D30 | fdk-energy | NIANFENGNF314J |  | 119 |
| 8 | 264 | YC6T600LD22 | wintpower | WT544C |  | 134 |
| 9 | 261 | 6ETAA128G22 | jet-power | JET444FS |  | 136 |
| 10 | 261 | 6ETAA128G21 | jet-power | JET444F |  | 137 |
| 11 | 259 | TAD1650GE | dingbo | LSA472M7 |  | 156 |
| 12 | 258 | CR13TE6WS550 | sanq-power | HCI544C |  | 158 |
| 13 | 258 | QSX15G6 | sanq-power | HCI544C |  | 159 |
| 14 | 257 | YC6T550LD21 | wintpower | WT544C |  | 161 |
| 15 | 256 | TAD1650GE | jet-power | ECO402S4C |  | 163 |
| 16 | 254 | WD145TAD33L | wintpower | LSA472VS2 |  | 176 |
| 17 | 253 | CA6DN1J45D | acepow-fuan | HC434F |  | 178 |
| 18 | 253 | CA6DN1J45D | wintpower | HCI444FS |  | 179 |
| 19 | 252 | YC6T600LD22 | dingbo | TFW23504A |  | 180 |
| 20 | 252 | QSX15G6 | fdk-energy | S4L1DG41 |  | 183 |
| 21 | 248 | NTA855G7A | tecgen-fujian | TGI314S320 |  | 188 |
| 22 | 245 | YC6T550LD21 | dingbo | TFW23204A |  | 193 |
| 23 | 241 | NTA855G1B | penlucky | S4L1DE41 |  | 197 |
| 24 | 240 | 6M26D447E200 | acepow-fuan | HC534C |  | 206 |
| 25 | 236 | 6M21G2D3/5 | rcg-power | S4L1DF41 |  | 211 |
| 26 | 232 | YC6K600D30 | penlucky | TALA473B |  | 217 |
| 27 | 229 | CA6DM3J48D | bobig-power | BW314F |  | 355 |
| 28 | 228 | KTA19DM | uleengen | MPH3504 |  | 377 |
| 29 | 224 | 6M21G6D3/5 | rcg-power | TALA473B |  | 392 |
| 30 | 221 | 6ETAA128G21 | voltgent |  |  | 403 |

### IB2300089882#0 — top gốc 30, top nhánh 30; ra 15, vào 15; dropped 453 → 619

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 3 | 284 | 4DX2265D | wintpower | UCI224D |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 284 | 4BTA39G2 | koten-power | UCI224D |  | có, hạng 4 |
| 5 | 281 | YC4D80D34 | fdk-energy | NIANFENGNF224D |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 281 | YCD4V33H675 | fdk-energy | NIANFENGNF224D |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 278 | WP23D48E200 | uleengen | S1L2R1 |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 273 | 4M06G55/5 | longkai-power | LSA423M8 |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 269 | WP41D66E200 | jet-power | JET224D |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 269 | LR4B5D | acepow-fuan | UC224D |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 269 | WP23D48E200 | bobig-power | BW224D |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 269 | 4DX2265D | uleengen | 224D |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 268 | NEF45AM2S500 | sanq-power | UCI224D |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 264 | 1104A44TG1 | uleengen | S1L2Y1 |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 261 | BFM3C | acepow-fuan | UC224D |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 252 | S38G6 | sanq-power | UCI224D |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 252 | 4DX2378D | wintpower | UCI224E |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 6 | 269 | 4BTA39G2 | bobig-power | BW224D |  | 30 |
| 14 | 237 | JE493ZLDC02/51KW | jet-power | JET224D/40KW |  | 74 |
| 15 | 237 | Y4105ZLD/55KW | jet-power | JET224D/40KW |  | 75 |
| 16 | 237 | 4BTA39GM47 | uleengen | MPH404 |  | 76 |
| 17 | 237 | YC4D90ZD21 | uleengen | 224D |  | 77 |
| 18 | 236 | 4TNV106GGE | sanq-power | UCI224D |  | 80 |
| 19 | 236 | 4TNV106GGE | wintpower | UCI224D |  | 81 |
| 20 | 230 | 4BTA39G2(QC50/60E) | fdk-energy | S1L2R1 |  | 85 |
| 21 | 229 | YC4D60D21 | elitech-power |  |  | 89 |
| 22 | 229 | 4BT39G2 | victory-generator |  |  | 91 |
| 23 | 229 | 4BT39G2 | voltgent |  |  | 107 |
| 24 | 229 | Y4102ZD | victory-generator |  |  | 115 |
| 25 | 229 | Y4102ZD | gordon-power |  |  | 116 |
| 26 | 229 | 4DX2365D | acepow-fuan | UC224D |  | 117 |
| 27 | 229 | YC4D75D34 | dingbo | TFW2404A |  | 118 |

### IB2300092659#0 — top gốc 30, top nhánh 30; ra 20, vào 20; dropped 1234 → 2015

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 287 | QSZ13G3 | koten-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 2 | 287 | 2506CE15TAG1 | gb-power | HCI544C | STANDARDFEATURES | không (bị loại; lý do: công cụ không ghi) |
| 3 | 287 | 2506CE15TAG2 | gb-power | HCI544C | STANDARDFEATURES | không (bị loại; lý do: công cụ không ghi) |
| 4 | 287 | KTA19G3A | yongcai-elecmama | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 287 | QSZ13G3 | uleengen | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 285 | 2506CE15TAG1 | sanq-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 284 | 2506CE15TAG2 | huali-shandong | HLF400 |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 284 | TAD1651GE | jet-power | HCI544D |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 284 | KTA19G3A | sanq-power | HCI544D |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 284 | KTA19G3 | stone-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 281 | YC6T660D31 | fdk-energy | NIANFENGNF354D |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 278 | TAD1651GE | dingbo | LSA472M7 |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 278 | 6KTAA25G36 | longkai-power | LK544C |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 278 | QSZ13G10 | longkai-power | LK544C |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 275 | 6ZTAA13G4 | sunkings | DC24V |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 273 | 6M21G550/5 | kaihua-genset | S5L1DC4 |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 273 | 6M21G550/5 | longkai-power | LSA473M8 |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 268 | CR13TE7WS550 | sanq-power | HCI544D |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 262 | TAD1641GE | dingbo | LSA472M7 |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 261 | TAD1346GE | jet-power | ECO403S4C |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 10 | 269 | KTAA19G5 | stone-power | HCI544C |  | 84 |
| 11 | 268 | QSX15G8 | sanq-power | HCI544D |  | 86 |
| 12 | 263 | KTAA19G6 | longkai-power | LK544E |  | 101 |
| 14 | 257 | KTAA19G6 | hosem-power | HCI544E |  | 116 |
| 15 | 253 | YC6T660LD20 | wintpower | WT544D |  | 126 |
| 16 | 253 | YC6T660LD20 | fdk-energy | NIANFENGNFS5D |  | 127 |
| 17 | 245 | TAD1641GEB | jet-power | ECO403S4C |  | 148 |
| 18 | 244 | YC6TD780LD20 | wintpower | WT544E |  | 150 |
| 19 | 241 | 6M21G8D3/5 | rcg-power | S5L1DC4 |  | 153 |
| 20 | 237 | 6M33D506E310 | acepow-fuan | HC534D |  | 168 |
| 21 | 237 | KTA19DM | uleengen | MPH4004 |  | 170 |
| 22 | 229 | 6KTAA25G311 | rcg-power | WR544C |  | 187 |
| 23 | 229 | 6M21G8D3/5 | voltgent |  |  | 200 |
| 24 | 229 | KTA19G2 | penlucky | S4LIDF41 |  | 209 |
| 25 | 229 | TAD1650GE | victory-generator |  |  | 263 |
| 26 | 227 | 6M33D572E310 | acepow-fuan | HC534E |  | 286 |
| 27 | 226 | TAD1650GE | comappower |  |  | 288 |
| 28 | 223 | 2506CE15TAG3 | kaihua-genset | HCI544D1 |  | 315 |
| 29 | 221 | K25G829D | jet-power | JET544D |  | 323 |
| 30 | 221 | CATC15 | rise-power | LC6115F |  | 328 |

### IB2300119452#0 — top gốc 30, top nhánh 30; ra 5, vào 5; dropped 376 → 524

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 23 | 281 | YC16VC3300D31 | fdk-energy | NIANFENGNF4541 |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 269 | YC16VC3300D31 | dingbo | TFW220004A |  | không (bị loại; lý do: công cụ không ghi) |
| 25 | 269 | YC16VC3300D31 | uleengen | TCU468G |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 269 | 401661TRG3 | sanq-power | PI734G |  | có, hạng 45 |
| 30 | 269 | S16R2PTAW | stone-power | PI734H |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 23 | 281 | 401661TRG3 | fdk-energy | S7L1DH41 |  | 43 |
| 27 | 235 | 16M55G3000/5 | longkai-power | LSA523UL16C6S/4 |  | 73 |
| 28 | 232 | 16M55D2750E310 | jet-power | JET504B |  | 75 |
| 29 | 229 | 16V4000G63 | rise-power |  |  | 83 |
| 30 | 229 | 16V4000G63 | superwatt-power |  |  | 88 |

### IB2300130792#0 — top gốc 30, top nhánh 30; ra 9, vào 9; dropped 975 → 1232

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 9 | 287 | 6BT59G2 | stone-power | UCI224G |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 284 | 6BT59G2 | sanq-power | UCI274C |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 284 | 6BT59G2 | koten-power | UCI274C |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 271 | 6BTA59G2 | stone-power | UCI274D |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 271 | 6BTA59G2 | fdk-energy | UCI274D |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 271 | QSB59G30 | fdk-energy | UCI274D |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 270 | 6BTA59G2 | sanq-power | UCI274D |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 269 | LR6A3ZD | acepow-fuan | UC274C |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 261 | TD226B6D | rise-power | LSA442S75 |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 22 | 244 | 1006TG2A | wintpower | UCI274C |  | 95 |
| 23 | 240 | YC6B155LD21 | wintpower | WT274D |  | 99 |
| 24 | 237 | CA6DF2D14D/96KW | jet-power | JET274C/80KW |  | 100 |
| 25 | 232 | WP6CD132E200 | uleengen | MPH904 |  | 103 |
| 26 | 232 | YC6B155LD20 | dingbo | TFW2904A |  | 104 |
| 27 | 229 | CA6DF2D14D | koten-power |  |  | 110 |
| 28 | 229 | R6105AZLD | eastern-lion-fuan | EL274C |  | 114 |
| 29 | 229 | 1006TG2A | jet-power | JET274C |  | 119 |
| 30 | 229 | R6105IZLD | elitech-power |  |  | 120 |

### IB2300131371#0 — top gốc 30, top nhánh 30; ra 12, vào 12; dropped 1065 → 1263

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 5 | 273 | 4B39G12 | fdk-energy | S0L2P1 |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 269 | Y4100D | acepow-fuan | BC184G |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 269 | Y4100D | tecgen-fujian | TG184S24 |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 266 | Y4102D | tecgen-fujian | TG184S25 |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 266 | Y4102D | acepow-fuan | BC184G |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 266 | 4B39G12 | longkai-power | LK184G |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 257 | QSB39G33 | fdk-energy | S1L2K1 |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 256 | Y4105D | tecgen-fujian | TGI184S30 |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 242 | Y4105D | acepow-fuan | BC184H |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 242 | Y4102ZD | acepow-fuan | BC184H |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 242 | 4DX2153D | wintpower | PI144J |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 236 | Y4102ZD | tecgen-fujian | TG184S32 |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 19 | 213 | 4JB1T | acepow-fuan | BC184G |  | 127 |
| 20 | 213 | 4DW9239DHMS20W | acepow-fuan | BC184G |  | 128 |
| 21 | 213 | 4DW9342DYFD10W | bobig-power | BW184G |  | 129 |
| 22 | 213 | YCV25T45G20 | byc-power | 184GS |  | 130 |
| 23 | 213 | 4DW9239DHMS20W | bobig-power | BW184G |  | 131 |
| 24 | 213 | 4DW9342DYFD10W | acepow-fuan | BC184G |  | 132 |
| 25 | 210 | N4100DS30 | acepow-fuan | BC184G |  | 139 |
| 26 | 210 | 4DX2145DYFD10W | bobig-power | BW184G |  | 140 |
| 27 | 210 | YANGDONGY4105D | tecgen-fujian | TGI184S30 |  | 141 |
| 28 | 210 | Y4105D/38KW | jet-power | JET184H/30KW |  | 142 |
| 29 | 205 | WP23CD33E200 | uleengen | MPH244 |  | 154 |
| 30 | 205 | 4DX2145D | hosem-power |  |  | 155 |

### IB2300147640#0 — top gốc 30, top nhánh 30; ra 24, vào 24; dropped 654 → 1218

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 4 | 284 | 6CTAA83G2 | stone-power | UCI274H |  | có, hạng 9 |
| 5 | 284 | 6CTAA83G2 | stone-power | UCI274G |  | có, hạng 10 |
| 6 | 284 | 1106A70TAG4 | sanq-power | UCI274H |  | có, hạng 11 |
| 7 | 284 | WP10D200E200 | uleengen | UCI274H |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 281 | YC6A275D30 | fdk-energy | NIANFENGNF274H |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 281 | WP10D200E200 | fdk-energy | NIANFENGNF274H |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 281 | SC8D280D2 | fdk-energy | NIANFENGNF274H |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 281 | 1206AE70TTAG1 | tecgen-fujian | TALA44M |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 281 | YCD6Q33H6260 | fdk-energy | NIANFENGNF274H |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 278 | SC8D280D2 | longkai-power | LK274H |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 276 | TAD753GE | jet-power | UCI274H |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 271 | WP10D238E200 | uleengen | UCDI274J |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 269 | BF6M1013FCG3 | acepow-fuan | UC274H |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 269 | YM6H4LD | acepow-fuan | UC274H |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 269 | P086TI | rise-power | LSA462M5 |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 269 | BF6M1013FCG2 | acepow-fuan | UC274G |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 268 | 6M16G220/5 | longkai-power | LSA443VL14 |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 265 | SC9D310D2 | longkai-power | LK274J |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 265 | 1206AE70TTAG2 | tecgen-fujian | UCI274J |  | không (bị loại; lý do: công cụ không ghi) |
| 25 | 263 | WP10D238E200 | longkai-power | LK274J |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 256 | CA6DL227D | bobig-power | BW274J |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 256 | CA6DL227D | wintpower | UCD274J |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 256 | SC9D310D2 | jet-power | JET274J |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 256 | 1206AE70TTAG2 | bobig-power | BW274K |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 1 | 284 | 1106A70TAG4 | fdk-energy | UCI274H |  | 1 |
| 2 | 284 | 6CTAA83G2 | fdk-energy | UCI274H |  | 3 |
| 9 | 257 | 6HTAA65G34 | fdk-energy | NIANFENGNF274H |  | 87 |
| 10 | 256 | 1506AE88TAG2 | dingbo | MP1804A |  | 103 |
| 11 | 256 | 6LTAA89G2 | stone-power | UCD274J |  | 105 |
| 12 | 256 | 6LTAA89G2 | uleengen | UCD274J |  | 109 |
| 13 | 245 | TAD840GEB | jet-power | ECO382S4C |  | 128 |
| 14 | 245 | TAD733GE | dingbo | LSA443L14 |  | 129 |
| 15 | 237 | WD129TD17 | wintpower | LSA462M5 |  | 142 |
| 16 | 232 | SC13G280D2 | dingbo | 1FC22834 |  | 147 |
| 17 | 232 | 6DTAA89G32 | fdk-energy | NIANFENGNF274J |  | 148 |
| 18 | 229 | 6CTA83G2 | penlucky | UCI274G1 |  | 183 |
| 19 | 229 | 6CTA83G2 | rise-power |  |  | 191 |
| 20 | 229 | 6M12G6D3/5 | rcg-power | UCDI274J |  | 229 |
| 21 | 229 | WD129TD16 | sanq-power | LTG150 |  | 247 |
| 22 | 228 | DP086CBV | jet-power | TALA46C |  | 249 |
| 23 | 224 | WP10CD238E200 | uleengen | MPH1804 |  | 262 |
| 24 | 224 | CA6DL230D/227KW | jet-power | JET274J/184KW |  | 263 |
| 25 | 223 | DP086LA | rcg-power | UCDI274J |  | 266 |
| 26 | 221 | CATC71 | rise-power | LC5014F |  | 275 |
| 27 | 220 | TAD733GE | sr-genset | UCI274H |  | 278 |
| 28 | 220 | TAD732GE | rcg-power | UCI274G |  | 282 |
| 29 | 216 | 6CTAA83G9 | elitech-power |  |  | 302 |
| 30 | 216 | 6M12G6D3/5 | voltgent |  |  | 314 |

### IB2300158982#0 — top gốc 30, top nhánh 30; ra 11, vào 11; dropped 1002 → 1558

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 2 | 867 | NT855GA | fdk-energy | UCDI274K | CUMMINSMODEL:NT855GAGENERALFEATURES: | không (bị loại; lý do: công cụ không ghi) |
| 4 | 867 | QSL89G34 | fdk-energy | UCDI274K |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 867 | MTA11G2 | sanq-power | UCDI274K |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 867 | NT855GA | sanq-power | UCDI274K |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 864 | NT855GA | stone-power | UCI274H |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 844 | MTAA11G3 | uleengen | HCI444D |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 778 | MTA11G2 | longkai-power | LK274K |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 769 | MTA11G2A | dingbo | HCI444C1 |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 759 | NTA855G1A | dingbo | HCI444D1 |  | có, hạng 61 |
| 27 | 735 | MTA11G2 | mingbang-mbkl | MBC200 | ENGINEMODEL:CUMMINSMTA11G2 | không (bị loại; lý do: công cụ không ghi) |
| 28 | 729 | QSL89G34 | voltgent |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 5 | 859 | QSL89G4 | fdk-energy | UCDI274K |  | 14 |
| 8 | 851 | QSL9G3 | fdk-energy | UCDI274K |  | 25 |
| 9 | 851 | QSL9G3 | sanq-power | UCDI274K |  | 27 |
| 11 | 844 | NTA855G1A | sanq-power | HCI444D |  | 34 |
| 24 | 717 | QSL89G4 | hosem-power |  |  | 162 |
| 25 | 713 | QSNTG6 | longkai-power |  |  | 179 |
| 26 | 709 | 6LTAA95G1 | elitech-power |  |  | 181 |
| 27 | 697 | NTA855GA | longkai-power |  |  | 191 |
| 28 | 697 | NTA855DM | kaihua-genset |  |  | 192 |
| 29 | 697 | N855DM | ettes-power |  |  | 193 |
| 30 | 693 | QSL9G5 | aosif |  | GENERALPERFORMANCEDATA | 195 |

### IB2300165131#0 — top gốc 30, top nhánh 30; ra 22, vào 22; dropped 317 → 882

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 561 | 6BT59G2 | wintpower | TALA44D |  | không (bị loại; lý do: công cụ không ghi) |
| 2 | 553 | 4M10G110/5 | kaihua-genset | TALA44D |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 521 | YC4D140D31 | penlucky | TALA44D |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 521 | WP41D100E200 | penlucky | TALA44D |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 508 | YC4D155D31 | penlucky | TALA44D |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 487 | 6BT59G2 | stone-power | UCI224G |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 484 | 4BTAA39G3 | fdk-energy | UCI274C |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 484 | 6BT59G2 | koten-power | UCI274C |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 484 | 6BT59G1 | stone-power | UCI274C |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 484 | WP41D100E200 | uleengen | UCI274C |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 484 | CA4DF212D | wintpower | UCI274C |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 481 | YC4D140D31 | fdk-energy | NIANFENGNF274C |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 481 | WP41D100E200 | fdk-energy | NIANFENGNF274C |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 478 | CA6DF2D14D | wintpower | UCI274C |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 478 | CA6DF2D14D | uleengen | 274C |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 476 | TAD551GE | jet-power | UCI274C |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 471 | 6BTA59G2 | stone-power | UCI274D |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 470 | BF4M1013EC | uleengen | 274C |  | không (bị loại; lý do: công cụ không ghi) |
| 25 | 469 | 4BTA39G13 | bobig-power | BW224G |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 469 | LR4N5LPD | acepow-fuan | UC274C |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 469 | LR6A3ZD | acepow-fuan | UC274C |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 469 | 6BT59G1 | bobig-power | BW274C |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 5 | 484 | YC4A140LD20 | penlucky | TALA44D |  | 19 |
| 6 | 484 | YC4A165D30 | penlucky | TALA44D |  | 20 |
| 7 | 484 | YC4A155D30 | penlucky | TALA44D |  | 21 |
| 9 | 481 | SC4H140D2 | fdk-energy | NIANFENGNF274C |  | 40 |
| 11 | 476 | QSB59G2 | fdk-energy | UCI274C |  | 52 |
| 12 | 469 | SC4H140D2 | fdk-energy | NIANFENGNFS224H |  | 65 |
| 15 | 469 | SC4H160D2 | jet-power | JET274C |  | 79 |
| 16 | 465 | YC6B135ZD20 | wintpower | WT274C |  | 86 |
| 17 | 465 | RDC6N2 | rcg-power | RC274C |  | 87 |
| 18 | 465 | RDC6N2 | rcg-power | RC224GL |  | 88 |
| 19 | 456 | R6105AZLD | jet-power | JET274D |  | 99 |
| 20 | 454 | BF6L913 | uleengen | 274C |  | 106 |
| 21 | 454 | R6105ZD | uleengen | 274C |  | 108 |
| 22 | 453 | 4HTAA43G21 | bobig-power | BW274C |  | 109 |
| 23 | 452 | RDC6N3 | rcg-power | RC274D |  | 111 |
| 24 | 446 | YC4A140LD20 | uleengen | 274C |  | 113 |
| 25 | 444 | 1006TG2A | wintpower | UCI274C |  | 122 |
| 26 | 440 | YC6B155LD21 | wintpower | WT274D |  | 123 |
| 27 | 440 | 4HTAA43G23 | bobig-power | BW274D |  | 124 |
| 28 | 430 | 1006TAG1A | wintpower | UCI274D |  | 131 |
| 29 | 429 | 4HTAA43G34 | voltgent |  |  | 138 |
| 30 | 429 | SC4H160D2 | victory-generator |  |  | 144 |

### IB2300188511#0 — top gốc 30, top nhánh 30; ra 18, vào 18; dropped 561 → 710

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 281 | YC16VC3300D31 | fdk-energy | NIANFENGNF4541 |  | không (bị loại; lý do: công cụ không ghi) |
| 2 | 281 | YC16VC3000D31 | fdk-energy | NIANFENGNF454H |  | không (bị loại; lý do: công cụ không ghi) |
| 3 | 271 | YC16VC3600D31 | fdk-energy | NIANFENGNF564D |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 269 | YC16VC3300D31 | dingbo | TFW220004A |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 269 | YC16VC3300D31 | uleengen | TCU468G |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 269 | S16R2PTAW | stone-power | PI734H |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 259 | YC16VC3600D31 | dingbo | TFW222004A |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 258 | 16M55D2900E310 | longkai-power | LK734HG |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 253 | YC16VC4000D31 | fdk-energy | NIANFENGNF564E |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 249 | 16M55D2900E310 | jet-power | JET504D |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 245 | S16R2PTAWC/1960KW | jet-power | PI734G/2200KVA |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 241 | YC16VC4000D31 | uleengen | TCU528C |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 233 | S16R2PTAWC | sr-genset | S7L1DH41 |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 229 | YC16VC3000D31 | westinpower |  |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 229 | S16R2PTAW | wintpower |  |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 221 | S16R2PTAWE | comappower |  |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 221 | S16R2PTAWC | voltgent |  |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 206 | S16R2PTAWE | ade-power |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 1 | 241 | S16R2PTAW2E | fdk-energy | S7L1DJ41 |  | 20 |
| 2 | 241 | S16R2A2PTAWC | fdk-energy | S7L1DH41 |  | 23 |
| 8 | 213 | YCC105TA3000G31 | byc-power | 734G |  | 60 |
| 10 | 205 | 16KTA76G33 | fdk-energy | NIANFENGNFS7H |  | 67 |
| 11 | 203 | YCC105TA3600G31 | byc-power | QYI504B |  | 68 |
| 13 | 195 | 16KTA76G32 | fdk-energy | NIANFENGFD7H4 |  | 74 |
| 14 | 193 | YCC105TA4000G31 | byc-power | QYI564B |  | 75 |
| 18 | 188 | QSK78G24 | ade-power | LVSI804T |  | 87 |
| 19 | 188 | QSK78G23 | ade-power | LVSI804S |  | 88 |
| 20 | 181 | QTA16VEG2440D | honny-dongguan | GP25004P |  | 90 |
| 21 | 181 | QTA16VEG2220D | honny-dongguan | GP22504P |  | 93 |
| 22 | 181 | S16R2PTAC | aosif |  |  | 95 |
| 23 | 179 | S16R2PTAW2E | aksa-power |  | 400/23122000275020000025003969 | 97 |
| 24 | 177 | 16M55D2960E311 | kaihua-genset |  |  | 104 |
| 25 | 174 | YC16VC3300 | penlucky | LSA523L12 |  | 105 |
| 26 | 174 | YC16VC3000 | penlucky | LSA523S7 |  | 106 |
| 27 | 173 | 16V4000G24F(3B) | comappower |  |  | 110 |
| 28 | 173 | 16V4000G14S(3B) | comappower |  |  | 111 |

### IB2300194512#0 — top gốc 30, top nhánh 30; ra 1, vào 1; dropped 107 → 109

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 23 | 205 | INDIA400623TAG2A | kaihua-genset | S5L1DH1 |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 23 | 205 | UK400623TAG2A | kaihua-genset | S5L1DH1 |  | 434 |

### IB2300217672#0 — top gốc 30, top nhánh 30; ra 9, vào 9; dropped 2458 → 2559

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 3 | 261 | BF8M1015CPG1A | dingbo | TFW24004 |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 261 | BF8M1015CG2 | dingbo | TFW24004 |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 257 | BF8M1015CPLAG5 | uleengen | 5ES |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 248 | BF8M1015CPG2 | dingbo | TFW24504 |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 229 | BF8M1015CPLAG2 | kaihua-genset |  |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 229 | BF8M1015CPLAG2 | comappower |  |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 227 | BF8M1015CPLAG3 | wintpower |  |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 226 | BF8M1015CPLAG3 | comappower |  |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 224 | BF8M1015CPLAG4 | wintpower |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 4 | 242 | BF8M1015CPLAG | sanq-power | HCI544D |  | 10 |
| 13 | 205 | BF8M1015CPLAG2B | comappower |  |  | 63 |
| 19 | 192 | BF8M1015CPLAG3B | comappower |  |  | 72 |
| 25 | 171 | 2806AE18TAG1 | voltgent |  |  | 109 |
| 26 | 165 | 2506C/DE15TAG1 | victory-generator |  |  | 118 |
| 27 | 165 | 2506A/CE15TAG2 | victory-generator |  |  | 119 |
| 28 | 165 | DC13072A0214 | voltgent |  |  | 120 |
| 29 | 165 | DC13505A | voltgent |  |  | 121 |
| 30 | 165 | WP13D490E200 | elitech-power |  |  | 122 |

### IB2300247709#0 — top gốc 30, top nhánh 30; ra 10, vào 10; dropped 361 → 553

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 10 | 480 | WP41D66E200 | huali-shandong | HLF50 |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 479 | WP41D66E200 | uleengen | S1L2Y1 |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 476 | YC4D90ZD25 | fdk-energy | NIANFENGNF224F |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 476 | WP41D66E200 | fdk-energy | NIANFENGNF224F |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 476 | 1104A44TG1 | jet-power | UCI224F |  | có, hạng 156 |
| 18 | 471 | 4110/125Z09D | wintpower | UCI224F |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 469 | Y4105ZLD | acepow-fuan | UC224E |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 469 | LR4B5D | acepow-fuan | UC224D |  | không (bị loại; lý do: công cụ không ghi) |
| 25 | 465 | YC4D90D34 | dingbo | TFW2504A |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 464 | YT4B2ZD | acepow-fuan | UC224E |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 12 | 476 | 1104A44TG1 | fdk-energy | UCI224F |  | 163 |
| 14 | 471 | QSB39G2 | fdk-energy | S1L2Y1 |  | 170 |
| 23 | 456 | 4ZT41G21 | jet-power | JET224E |  | 214 |
| 24 | 448 | 4HT43G22 | bobig-power | BW224E |  | 224 |
| 25 | 447 | 4HT43G22 | longkai-power | LK224F |  | 225 |
| 26 | 440 | WP4CD66E200 | uleengen | MPH504 |  | 226 |
| 27 | 439 | 4M10G2D3/5 | rcg-power | S1L2Y1 |  | 228 |
| 28 | 438 | 4ZTAA41G21 | jet-power | JET224F |  | 229 |
| 29 | 436 | 4M10G2D3/5 | rcg-power | TALA42H |  | 232 |
| 30 | 436 | 4TNV106GGE | wintpower | UCI224D |  | 234 |

### IB2300252125#0 — top gốc 30, top nhánh 30; ra 20, vào 20; dropped 2538 → 2694

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 478 | DP158LC | sanq-power | HCI444F |  | không (bị loại; lý do: công cụ không ghi) |
| 2 | 474 | DP158LC | sanq-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 3 | 472 | P158LE | rise-power | LSA472S5 |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 467 | P158LE1 | rise-power | LSA472VS2 |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 466 | BF8M1015CLAG2 | sanq-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 465 | P158LE | rise-power | LSA472VS2 |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 452 | BF8M1015CG1A | dingbo | TFW23504 |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 441 | P158LE | rcg-power | TALA473A |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 429 | BF8M1015CLAG1A | uleengen |  |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 428 | DP158LC | rcg-power | TALA473B |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 427 | BF8M1015CLAG1A | wintpower |  |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 420 | BF8M1015CLAG1A | longkai-power |  |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 416 | DP158LD | hosem-power |  |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 414 | BF8M1015CPLAG1A | wintpower |  |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 410 | BF8M1015CPLAG1A | longkai-power |  |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 410 | BF8M1015CPLAG1A | kaihua-genset |  |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 408 | BF8M1015CLAG2 | wintpower |  |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 408 | BF8M1015CLAG2 | kaihua-genset |  |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 381 | P158LE1 | mecca-power |  |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 381 | P158LE1 | jianghao-genset |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 3 | 428 | BF8M1015CPLAG | sanq-power | HCI544C |  | 20 |
| 5 | 410 | TBD234V8B | rise-power | LSA472VS2 |  | 42 |
| 13 | 365 | 2206CE13TAG2/3 | kaihua-genset |  |  | 89 |
| 14 | 365 | V8128×142 | gordon-power |  |  | 90 |
| 15 | 365 | 2206C/DE13TAG2 | victory-generator |  |  | 92 |
| 16 | 365 | YM6S9L15 | wintpower |  |  | 93 |
| 17 | 365 | 2206A/CE13TAG3 | victory-generator |  |  | 94 |
| 18 | 365 | 2606A/CE13TAG2 | kaihua-genset |  |  | 95 |
| 19 | 365 | 8V1600G20G | kaihua-genset |  |  | 96 |
| 20 | 365 | RYC16N1 | rcg-power | RC444F |  | 99 |
| 21 | 365 | R360GE | rcg-power | R3204 |  | 100 |
| 22 | 365 | 2206DE13TAG3L | sr-genset | S4L1DF4 |  | 101 |
| 23 | 365 | YM6S9LDA | longkai-power |  |  | 102 |
| 24 | 365 | DC13072A0212 | voltgent |  |  | 103 |
| 25 | 365 | QSZ1333 | penlucky | S4L1DF41 |  | 104 |
| 26 | 365 | CHD314V8 | ettes-power |  |  | 105 |
| 27 | 365 | WT1360DE | kente-power | KT544C |  | 106 |
| 28 | 364 | CURSOR13TE2F | sr-genset | S4L1DF4 |  | 107 |
| 29 | 364 | WP13D405E201 | penlucky | TALA46H |  | 108 |
| 30 | 363 | SA314360 | sr-genset | P158LE |  | 109 |

### IB2300277166#0 — top gốc 30, top nhánh 30; ra 18, vào 18; dropped 1100 → 1367

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 284 | 6BTAA59G12 | uleengen | UCI274F |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 271 | 6CTA83G1 | stone-power | UCI274G |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 269 | LR6B3LD | acepow-fuan | UC274E |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 267 | LR6M3LD | acepow-fuan | UC274F |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 267 | CA6DL124D | wintpower | UCI274G |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 265 | WP6D167E200 | longkai-power | LK274G |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 263 | YC6A245LD21 | fdk-energy | NIANFENGNF274H |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 263 | YC6A245D30 | fdk-energy | NIANFENGNF274H |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 261 | BF6M1013ECG1 | acepow-fuan | UC274ES |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 258 | TAD752GE | jet-power | UCI274H |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 252 | BF6M1013ECG2 | acepow-fuan | UC274G |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 252 | YC6A245D30 | dingbo | TFW21504A |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 251 | 6CTA83G1 | bobig-power | BW274G |  | không (bị loại; lý do: công cụ không ghi) |
| 25 | 251 | CA6DL124D | bobig-power | BW274G |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 251 | YC6A245LD21 | wintpower | WT274H |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 251 | P086TI | uleengen | 274G |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 251 | WP10D200E200 | bobig-power | BW274G |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 136 | WP6D180E201 | weichai-heavy-machinery |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 12 | 251 | 6CTA83G2 | bobig-power | BW274F |  | 71 |
| 13 | 247 | QSB7G4 | sanq-power | UCI274G |  | 84 |
| 14 | 241 | 1106A70TAG2 | sr-genset | TALA44J |  | 86 |
| 15 | 240 | 6HTAA65G23 | jet-power | JET274G |  | 87 |
| 16 | 239 | 6HTAA65G33 | fdk-energy | NIANFENGNF274H |  | 88 |
| 17 | 235 | 6HTAA65G23 | bobig-power | BW274G |  | 89 |
| 18 | 229 | 6BTAA59G2 | minsun-motor | SYA274E |  | 95 |
| 19 | 228 | TAD732GE | dingbo | LSA443L13 |  | 98 |
| 20 | 227 | WP10CD200E200 | uleengen | MPH1504 |  | 102 |
| 21 | 220 | R6113ZLD | sunny-weifang | TFW1504 |  | 114 |
| 22 | 219 | CA6DL124/176KW | jet-power | JET274H/160KW |  | 115 |
| 23 | 219 | R6110ZLD | uleengen | 274G |  | 118 |
| 24 | 219 | 6LTAA89GM200 | uleengen | MPH1504 |  | 119 |
| 25 | 218 | 6M12G2D3/5 | rcg-power | UCI274H |  | 122 |
| 26 | 217 | TAD731GE | rcg-power | UCI274F |  | 123 |
| 28 | 216 | WD129TD16 | wintpower | LSA462M5 |  | 164 |
| 29 | 216 | 1106A70TAG2 | minsun-motor | SYA274F |  | 166 |
| 30 | 208 | CATC71 | rise-power | LC5014D |  | 225 |

### IB2300305484#0 — top gốc 30, top nhánh 30; ra 27, vào 27; dropped 508 → 1932

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 284 | 2206CE13TAG3 | kaihua-genset | S4L1DF41 |  | không (bị loại; lý do: công cụ không ghi) |
| 2 | 284 | 2206CE13TAG3 | sanq-power | HCI444E |  | không (bị loại; lý do: công cụ không ghi) |
| 3 | 284 | 2206CE13TAG2 | sanq-power | HCI444E |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 284 | 6ZTAA13G3 | stone-power | HCI444D |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 284 | WP13D385E200 | huali-shandong | HLF300 |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 281 | WP13D385E200 | fdk-energy | NIANFENGNF314H |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 281 | SC13E550D2 | fdk-energy | NIANFENGNF314H |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 281 | 6ETAA128G32 | fdk-energy | NIANFENGNF314H |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 281 | 6ZTAA13G2 | koten-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 281 | TAD1352GE | dingbo | LSA463L11 |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 281 | 2206CE13TAG2 | kaihua-genset | S4L1DE41 |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 278 | TAD1355GE | jet-power | HCI444F |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 278 | QSZ13G7 | longkai-power | LK444F |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 278 | NTAA855G7A | stone-power | HCI444F |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 278 | WP13D405E200 | longkai-power | LK444F |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 278 | NTAA855G7A | sanq-power | HCI444F |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 278 | 6ETAA128G32 | longkai-power | LK444F |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 278 | 6ZTAA13G4 | koten-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 278 | NTAA855G7 | uleengen | HCI444F |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 278 | SC15G500D2 | longkai-power | LK444F |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 278 | NTAA855G7 | dingbo | HCI444FS1 |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 278 | 2206AE13TAG3 | gb-power | HCI444F | STANDARDFEATURES | không (bị loại; lý do: công cụ không ghi) |
| 25 | 278 | 6ZTAA13G3 | dingbo | HCI444FS1 |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 269 | WP13D405E200 | jet-power | JET444F |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 269 | YM6S9LFDA | acepow-fuan | HC434FS |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 269 | YM6S9LFD | acepow-fuan | HC434F |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 269 | TAD1344GEB | jet-power | ECO401S4C |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 2 | 281 | YC6K500D31 | fdk-energy | NIANFENGNF314G |  | 29 |
| 3 | 281 | 6ETAA118G31 | fdk-energy | NIANFENGNF314G |  | 37 |
| 5 | 278 | QSNTG3 | longkai-power | LK444F |  | 50 |
| 6 | 278 | 6ETAA118G31 | longkai-power | LK444E |  | 66 |
| 7 | 275 | KTA19G2 | stone-power | HCI444E |  | 70 |
| 9 | 269 | BF6M1015CPLAG | sanq-power | HCI444FS |  | 124 |
| 10 | 268 | YC6K600D30 | fdk-energy | NIANFENGNF314J |  | 157 |
| 11 | 264 | YC6T600LD22 | wintpower | WT544C |  | 173 |
| 12 | 261 | 6ETAA128G22 | jet-power | JET444FS |  | 175 |
| 13 | 261 | 6ETAA128G21 | jet-power | JET444F |  | 176 |
| 14 | 261 | BF6M1015CG3A | dingbo | TFW23004 |  | 182 |
| 15 | 260 | KTA19G2 | bobig-power | BW314F |  | 187 |
| 16 | 259 | TAD1650GE | dingbo | LSA472M7 |  | 197 |
| 17 | 258 | CR13TE6WS550 | sanq-power | HCI544C |  | 199 |
| 18 | 258 | QSX15G6 | sanq-power | HCI544C |  | 200 |
| 19 | 257 | YC6T550LD21 | wintpower | WT544C |  | 202 |
| 20 | 256 | TAD1650GE | jet-power | ECO402S4C |  | 204 |
| 21 | 254 | WD145TAD33L | wintpower | LSA472VS2 |  | 218 |
| 22 | 253 | CA6DN1J45D | acepow-fuan | HC434F |  | 221 |
| 23 | 253 | YC6MJ480LD20 | dingbo | TFW23004A |  | 222 |
| 24 | 253 | CA6DN1J45D | wintpower | HCI444FS |  | 223 |
| 25 | 252 | YC6T600LD22 | dingbo | TFW23504A |  | 225 |
| 26 | 249 | 2206DE13TAG2 | kaihua-genset | S4L1DE41 |  | 232 |
| 27 | 248 | NTA855G7A | tecgen-fujian | TGI314S320 |  | 234 |
| 28 | 247 | 2206DE13TAG3 | kaihua-genset | S4L1DF41 |  | 239 |
| 29 | 241 | NTA855G1B | penlucky | S4L1DE41 |  | 244 |
| 30 | 241 | YC6K520D30 | penlucky | TALA473A |  | 245 |

### IB2300307974#0 — top gốc 30, top nhánh 30; ra 17, vào 17; dropped 585 → 928

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 284 | 6BTA59G2 | stone-power | UCI274D |  | không (bị loại; lý do: công cụ không ghi) |
| 2 | 284 | 6BTA59G2 | fdk-energy | UCI274D |  | không (bị loại; lý do: công cụ không ghi) |
| 3 | 284 | QSB59G30 | fdk-energy | UCI274D |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 284 | 6BTA59G2 | sanq-power | UCI274D |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 284 | 6BT59G2 | stone-power | UCI274C |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 280 | CA6DF217D | wintpower | UCI274E |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 278 | 6BT59G2 | longkai-power | LK274D |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 272 | TAD750GE | jet-power | UCI274E |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 269 | LR6A3ZD | acepow-fuan | UC274C |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 265 | QSB59G33 | fdk-energy | UCI274ES |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 265 | D1146T | rise-power | LSA442S7 |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 265 | WP6D132E200 | bobig-power | BW274D |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 265 | LR6A3LD | acepow-fuan | UC274D |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 265 | CA6DF217D | uleengen | 274ES |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 261 | 6M11G150/5 | kaihua-genset | TALA44E |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 255 | 6M11G150/5 | longkai-power | LSA443M6 |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 150 | WP6D132E200 | weichai-heavy-machinery |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 11 | 247 | 6HTAA65G21 | longkai-power | LK274E |  | 86 |
| 14 | 241 | WP6CD132E200 | uleengen | MPH1004 |  | 90 |
| 15 | 238 | 6HTAA65G21 | bobig-power | BW274E |  | 94 |
| 16 | 233 | CA6DF217D/125KW | jet-power | JET274D1/100KW |  | 100 |
| 17 | 229 | R6105AZLD | eastern-lion-fuan | EL274D |  | 107 |
| 18 | 229 | QSB59G3 | eastern-lion-fuan | EL274D |  | 113 |
| 19 | 229 | R6105IZLD | kaichen-jiangsu |  |  | 115 |
| 20 | 229 | 1006TAG | wintpower | UCI274E |  | 116 |
| 21 | 225 | 6CT83GM115 | uleengen | MPH1004 |  | 201 |
| 22 | 224 | TBD226B6D | rise-power | LSA442S75 |  | 207 |
| 23 | 220 | QSB5930 | fdk-energy | UCI274D |  | 220 |
| 24 | 216 | NEF67SM1S500 | sanq-power | UCI274E |  | 223 |
| 25 | 213 | YC6B155LD21 | eastern-lion-fuan | EL274D |  | 262 |
| 26 | 209 | CA6DF217DYFD10W | bobig-power | BW274D |  | 274 |
| 27 | 209 | CA6DF217DYFD10W | acepow-fuan | UC274DS |  | 275 |
| 28 | 209 | YCA48TAA180G20 | byc-power | 274D |  | 276 |
| 29 | 208 | CATC71 | rise-power | LC3114H |  | 278 |

### IB2300315082#0 — top gốc 30, top nhánh 30; ra 17, vào 17; dropped 1570 → 2038

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 284 | KTA38G2 | uleengen | S5L1DH41 |  | không (bị loại; lý do: công cụ không ghi) |
| 3 | 278 | KTA38G2 | longkai-power | LK634B |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 278 | KTA38G2 | yongcai-elecmama | LVI634B |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 277 | KTA38G2B | uleengen | S6L1DC41 |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 277 | KTA38G2B | fdk-energy | S6L1DC41 |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 273 | KT38G | stone-power | HCI544FS |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 268 | VTA28G6 | fdk-energy | S5L1DH41 |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 262 | QSK38G8 | longkai-power | LK634B |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 261 | KTA38G1 | stone-power | LVI634B |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 253 | HC12V132ZLLAG2 | sanq-power | LVI644B |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 249 | 12M26D902E200 | acepow-fuan | LV634D |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 249 | 12M26D902E200 | jet-power | JET634D |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 241 | DP222LC | rcg-power | TALA49B |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 241 | DP222LC | sr-genset | TALA49B |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 234 | S12A2PTA | rcg-power | S6L1DC4 |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 226 | S12A2PTA | comappower |  |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 214 | SC27G900D2 | beidou-yangzhou |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 4 | 262 | 12M26D792E200 | jet-power | JET634C |  | 26 |
| 8 | 232 | 12M26G900/5 | longkai-power | LSA493M8 |  | 70 |
| 12 | 225 | DP222CB | sr-genset | TALA49C |  | 116 |
| 13 | 225 | DP222CB | rcg-power | TALA49C |  | 117 |
| 14 | 225 | 12M33D902E310 | acepow-fuan | LV634C |  | 119 |
| 16 | 221 | HC12V132ZLLAG2A | longkai-power |  |  | 150 |
| 17 | 221 | HC12V132ZLLAG2A | wintpower |  |  | 151 |
| 18 | 221 | 12V2000G65 | ettes-power |  |  | 155 |
| 22 | 213 | YCTD201000G30 | byc-power | 634B |  | 201 |
| 23 | 213 | 12M33CD748E200 | uleengen | MXH6304 |  | 202 |
| 24 | 213 | 8M33G1D0/5 | kaihua-genset | S6L1DC41 |  | 204 |
| 25 | 213 | S12A2PTA2 | rcg-power | S6L1DD4 |  | 206 |
| 26 | 205 | HC12V132ZLLAG2B | comappower |  |  | 244 |
| 27 | 205 | 12M26D748E200 | kaichen-jiangsu |  |  | 245 |
| 28 | 205 | YCTH281070G31 | byc-power | 634C |  | 251 |
| 29 | 205 | YC6CL960LC20 | uleengen | MPH6004 |  | 252 |
| 30 | 198 | TBD620L6 | rise-power | LSA491M75 |  | 256 |

### IB2300340070#0 — top gốc 30, top nhánh 30; ra 11, vào 11; dropped 1138 → 1297

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 5 | 273 | 4B39G12 | fdk-energy | S0L2P1 |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 266 | Y4102D | tecgen-fujian | TG184S25 |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 266 | Y4102D | tecgen-fujian | TGI184S25 |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 266 | Y4102D | acepow-fuan | BC184G |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 266 | 4B39G12 | longkai-power | LK184G |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 261 | 4B39G12 | acepow-fuan | BC184G |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 257 | QSB39G33 | fdk-energy | S1L2K1 |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 256 | Y4105D | tecgen-fujian | TGI184S30 |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 242 | Y4105D | acepow-fuan | BC184H |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 242 | Y4105D | tecgen-fujian | TG184S30 |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 242 | Y4102ZD | acepow-fuan | BC184H |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 19 | 213 | 4JB1T | acepow-fuan | BC184G |  | 104 |
| 20 | 213 | 4DW9239DHMS20W | acepow-fuan | BC184G |  | 105 |
| 22 | 213 | YCV25T45G20 | byc-power | 184GS |  | 107 |
| 23 | 213 | 4DW9239DHMS20W | bobig-power | BW184G |  | 108 |
| 24 | 213 | 4DW9342DYFD10W | acepow-fuan | BC184G |  | 109 |
| 25 | 210 | N4100DS30 | acepow-fuan | BC184G |  | 115 |
| 26 | 210 | 4DX2145DYFD10W | bobig-power | BW184G |  | 116 |
| 27 | 210 | YANGDONGY4105D | tecgen-fujian | TGI184S30 |  | 117 |
| 28 | 210 | Y4105D/38KW | jet-power | JET184H/30KW |  | 118 |
| 29 | 208 | YC4D60D21 | penlucky | TALA42E |  | 125 |
| 30 | 205 | WP23CD33E200 | uleengen | MPH244 |  | 130 |

### IB2300340671#0 — top gốc 30, top nhánh 30; ra 4, vào 4; dropped 1123 → 1131

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 4 | 273 | YC4A100ZD25 | fdk-energy | NIANFENGNF224G |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 261 | YC4A100ZD25 | fdk-energy | NIANFENGNFS224F |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 249 | WP41D100E200 | jet-power | JET224G1 |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 221 | YC4A100ZD25 | kaichen-jiangsu |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 27 | 173 | R4105BZLDS | longkai-power |  |  | 41 |
| 28 | 173 | R4105BZLDS | wintpower |  |  | 42 |
| 29 | 173 | R4105AZLD | eastern-lion-fuan | EL224F |  | 43 |
| 30 | 173 | R4105ZLD | minsun-motor | SYA224F |  | 45 |

### IB2300340905#0 — top gốc 30, top nhánh 30; ra 14, vào 14; dropped 873 → 1103

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 7 | 281 | 4HTAA43G34 | fdk-energy | NIANFENGNF274C |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 281 | SC4H140D2 | fdk-energy | NIANFENGNF274C |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 278 | WP41D100E200 | longkai-power | LK274C |  | có, hạng 18 |
| 12 | 278 | SC4H140D2 | uleengen | 274C |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 276 | TAD551GE | jet-power | UCI274C |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 270 | BF4M1013EC | uleengen | 274C |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 269 | SC4H160D2 | bobig-power | BW274C |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 269 | SC4H160D2 | jet-power | JET274C |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 269 | LR4M3LD | acepow-fuan | UC274C |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 262 | 4HTAA43G21 | longkai-power | LK274C |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 261 | BF4M1013ECG1 | acepow-fuan | UC274C |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 253 | 4HTAA43G21 | bobig-power | BW274C |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 252 | QSB5G5 | sanq-power | UCI274C |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 248 | BF4M1013ECG2 | acepow-fuan | UC274D |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 7 | 281 | WP41D100E200 | fdk-energy | NIANFENGNF274C |  | 17 |
| 18 | 248 | NEF45TM3S500 | sanq-power | UCI274D |  | 75 |
| 19 | 246 | YC4A140LD20 | uleengen | 274C |  | 76 |
| 20 | 245 | YC4A140D30 | fdk-energy | NIANFENGNFS224H |  | 81 |
| 21 | 245 | WP41D113E200 | jet-power | JET274C |  | 83 |
| 22 | 244 | 4M10G6D3/5 | rcg-power | UCI274C |  | 85 |
| 23 | 241 | YC4D140D31 | penlucky | TALA44D |  | 87 |
| 24 | 229 | YC4A140LD25 | kaihua-genset |  |  | 98 |
| 25 | 229 | LR4N5LPD | longkai-power |  |  | 101 |
| 26 | 229 | 4M10G6D3/5 | voltgent |  |  | 124 |
| 27 | 229 | WP41D95E201 | minsun-motor | SYA224G |  | 143 |
| 28 | 223 | 6BG1ZL1 | acepow-fuan | UC274D |  | 149 |
| 29 | 223 | 4M12G1D3/5 | rcg-power | UCI274D |  | 150 |
| 30 | 222 | YCM48TAA140G20 | byc-power | 274C |  | 151 |

### IB2300343208#0 — top gốc 30, top nhánh 30; ra 7, vào 7; dropped 644 → 819

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 482 | 401661TRG2 | kaihua-genset | S7L1DF41 |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 481 | 4016TAG2A | uleengen | S7L1DG41 |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 469 | 4016TAG2A | sanq-power | PI734F |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 469 | 401661TRG2 | sanq-power | PI734F |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 465 | 12M55D2210E310 | longkai-power | LK544G |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 456 | 12M55D2210E310 | acepow-fuan | PI734H |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 430 | QSK50G17 | rcg-power | LSA523S6 |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 15 | 454 | 16M33G2250/5 | longkai-power | LSA523S6 |  | 55 |
| 22 | 427 | 12V4000G63 | rise-power |  |  | 102 |
| 23 | 423 | 20M33G2D3/5 | kaihua-genset | S7L1DG41 |  | 108 |
| 25 | 411 | 16M33G2250/5 | rcg-power | S7L1DG4 |  | 143 |
| 26 | 411 | 20M33G4D3/5 | kaihua-genset | S7L1DH41 |  | 146 |
| 28 | 405 | TBD620V16 | rise-power | LSA512M60 |  | 151 |
| 29 | 405 | 12M55D1870E310 | sunny-weifang |  |  | 153 |

### IB2300359120#0 — top gốc 30, top nhánh 30; ra 16, vào 16; dropped 636 → 959

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 7 | 284 | 6CTA83G1 | sanq-power | UCI274F |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 284 | CA6DF219D | wintpower | UCI274F |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 281 | YC6B205LD20 | fdk-energy | NIANFENGNF274FS |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 281 | YC6A205D30 | fdk-energy | NIANFENGNF274FS |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 276 | TAD751GE | jet-power | UCI274F |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 275 | 1106A70TAG3 | tecgen-fujian | UCI274G |  | có, hạng 18 |
| 16 | 275 | 6CTA83G1 | stone-power | UCI274G |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 271 | CA6DL124D | wintpower | UCI274G |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 269 | LR6M3LD | acepow-fuan | UC274F |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 269 | YC6A205D30 | dingbo | TFW21204A |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 269 | LR6B3LD | acepow-fuan | UC274E |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 269 | YC6B205LD20 | dingbo | TFW21204A |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 268 | 6CTA83G1 | longkai-power | LK274G |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 261 | DP086TA | uleengen | 274FS |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 255 | 1106A70TAG4 | huali-shandong | HLF150 |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 255 | CA6DL124D | bobig-power | BW274G |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 8 | 275 | 1106A70TAG3 | sanq-power | UCI274G |  | 23 |
| 16 | 255 | BF6M1013FCG2 | acepow-fuan | UC274G |  | 90 |
| 17 | 255 | BF6M1013FCG2 | uleengen | 274G |  | 105 |
| 18 | 247 | YC6A230LD20 | wintpower | WT274G |  | 108 |
| 19 | 245 | YCD6Q23H8210 | fdk-energy | NIANFENGNFS274FS |  | 109 |
| 20 | 239 | YC6A230D30 | dingbo | TFW21404A |  | 116 |
| 21 | 237 | R6110ZLD | jet-power | JET274F |  | 117 |
| 22 | 231 | TAD732GE | dingbo | LSA443L13 |  | 126 |
| 23 | 231 | WP10CD200E200 | uleengen | MPH1504 |  | 127 |
| 24 | 229 | R6105IZLD | victory-generator |  |  | 143 |
| 25 | 229 | R6105IZLD | eastern-lion-fuan | EL274F |  | 172 |
| 26 | 229 | R6105IZLD | gordon-power |  |  | 183 |
| 27 | 223 | BF6M1013FCG2 | comappower |  |  | 206 |
| 28 | 223 | R6110ZLD | uleengen | 274G |  | 219 |
| 29 | 223 | 6LTAA89GM200 | uleengen | MPH1504 |  | 220 |
| 30 | 223 | R6113ZLD | sunny-weifang | TFW1504 |  | 221 |

### IB2300370623#0 — top gốc 30, top nhánh 30; ra 13, vào 13; dropped 684 → 968

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 4 | 478 | 4TNV98GGE | wintpower | PI144G |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 473 | 4B39G12 | fdk-energy | S0L2P1 |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 469 | Y4100D | acepow-fuan | BC184G |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 469 | Y4100D | tecgen-fujian | TG184S24 |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 469 | Y495D | uleengen | 184G |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 466 | Y4102D | tecgen-fujian | TG184S25 |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 466 | Y4102D | acepow-fuan | BC184G |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 462 | V3300 | wintpower | PI144G |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 461 | 4B39G12 | acepow-fuan | BC184G |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 461 | BFM3G2 | acepow-fuan | BC184G |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 457 | QSB39G33 | fdk-energy | S1L2K1 |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 456 | Y4105D | tecgen-fujian | TGI184S30 |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 436 | Y4102ZD | tecgen-fujian | TG184S32 |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 13 | 442 | YC4D60D21 | wintpower | WT184H |  | 39 |
| 14 | 442 | 4DX2153D | wintpower | PI144J |  | 45 |
| 20 | 429 | 4M08G8D3/5 | voltgent |  |  | 73 |
| 21 | 429 | F4L912 | uleengen | 184G |  | 86 |
| 22 | 429 | 4B39G1 | elitech-power |  | MODEL:EPS30CUA3S | 88 |
| 23 | 421 | F4L912D | victory-generator |  |  | 99 |
| 24 | 421 | JE493DB01 | acepow-fuan | BC184F |  | 103 |
| 25 | 421 | 4DW9138D | victory-generator |  |  | 109 |
| 26 | 421 | JE493ZDB04 | acepow-fuan | BC184G |  | 110 |
| 27 | 421 | 4DW9138D | voltgent |  |  | 112 |
| 28 | 413 | 4JB1T | acepow-fuan | BC184G |  | 127 |
| 29 | 413 | 4DW9239DHMS20W | acepow-fuan | BC184G |  | 128 |
| 30 | 413 | 4DW9242D | koten-power |  |  | 129 |

### IB2400041536#0 — top gốc 30, top nhánh 30; ra 9, vào 9; dropped 1783 → 1967

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 8 | 277 | KTA19G3 | sanq-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 277 | KTA19G3 | stone-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 277 | 2506CE15TAG1 | sanq-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 271 | 2506CE15TAG1 | fdk-energy | S4L1DG4 |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 219 | 2506CE15TAG2 | jiuan-power |  |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 214 | SC15G500D2 | beidou-yangzhou |  |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 211 | SC9D340D2 | elitech-power |  |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 206 | S6A3PTA | wintpower |  |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 203 | S6A3PTA | comappower |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 9 | 277 | QSZ13G2 | sanq-power | HCI544C |  | 17 |
| 11 | 268 | QSZ13G5 | longkai-power | LK544B |  | 36 |
| 24 | 198 | X6170ZCD3904 | uleengen | MXH3504 |  | 260 |
| 25 | 195 | YC6T660LD21 | minsun-motor | SYA354C |  | 264 |
| 26 | 194 | YC6T660LD21 | kaihua-genset |  |  | 265 |
| 27 | 186 | 2506AE15TAG1 | voltgent |  |  | 275 |
| 28 | 186 | 2506CE15TAG1L | eastern-lion-fuan | EL354C |  | 276 |
| 29 | 182 | TBD604BL6 | ettes-power |  |  | 299 |
| 30 | 181 | YC6T600LD20 | elitech-power |  |  | 308 |

### IB2400064176#0 — top gốc 30, top nhánh 30; ra 10, vào 10; dropped 1727 → 1834

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 2 | 273 | 12M33G1100/6 | longkai-power | LSA502M6 |  | không (bị loại; lý do: công cụ không ghi) |
| 3 | 273 | 12M33G1400/5 | longkai-power | LSA502M6 |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 261 | 12M33G1650/5 | longkai-power | LSA502L8 |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 255 | 12M33G1500/5 | longkai-power | LSA502L8 |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 255 | 12M33G1500/5 | kaihua-genset | S6L1DH4 |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 249 | S12RPTAA2 | stone-power | PI734C |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 249 | YC12VC2070D31 | dingbo | TFW212004A |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 233 | 12M33G1400/5 | rcg-power | LSA502M6 |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 221 | 12M33G1100/6 | voltgent |  |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 217 | S12RPTA2 | comappower |  |  | có, hạng 67 |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 8 | 247 | 12M33G1300/6 | longkai-power | LSA502L8 |  | 26 |
| 12 | 245 | 12M33G1320/6 | longkai-power | LSA502L8 |  | 33 |
| 17 | 231 | S12RPTA2 | rcg-power | LSA502L7 |  | 49 |
| 24 | 213 | YCTD40TA1680G30 | byc-power | 634G |  | 94 |
| 25 | 205 | 12M33D1240E310 | kaichen-jiangsu |  |  | 121 |
| 26 | 203 | QSK38G3/G5 | sanq-power | PI734B |  | 131 |
| 27 | 203 | 12KTA58G36 | kaihua-genset |  |  | 133 |
| 28 | 203 | 12KTA58G36 | voltgent |  |  | 141 |
| 29 | 197 | 12V4000G14RF | voltgent |  |  | 144 |
| 30 | 197 | 12V4000G14RF | westinpower |  |  | 145 |

### IB2400100405#0 — top gốc 30, top nhánh 30; ra 3, vào 3; dropped 377 → 526

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 9 | 653 | QSK50G17 | fdk-energy | S7L1DJ41 |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 349 | S16R2PTAW | stone-power | PI734H |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 325 | S16R2PTAWC/1960KW | jet-power | PI734G/2200KVA |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 26 | 361 | 401661TRG3 | fdk-energy | S7L1DH41 |  | 41 |
| 29 | 297 | 401661TRG3X | uleengen | S7L1DJ41 |  | 54 |
| 30 | 297 | 401661TG3X | uleengen | S7L1DJ41 |  | 56 |

### IB2400122841#0 — top gốc 30, top nhánh 30; ra 7, vào 7; dropped 1010 → 1261

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 8 | 273 | 12M33G1100/6 | longkai-power | LSA502M6 |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 273 | 12M33G1400/5 | longkai-power | LSA502M6 |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 269 | QSK38G5 | stone-power | LVI634F |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 261 | YC12VC2070D31 | fdk-energy | NIANFENGNF454C |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 259 | S12RPTA2C | sanq-power | PI734B |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 255 | 12M33G1500/5 | kaihua-genset | S6L1DH4 |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 249 | YC12VC2070D31 | dingbo | TFW212004A |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 16 | 260 | 12M33D1320E200 | longkai-power | LK734B |  | 84 |
| 20 | 255 | 12KTA58G36 | fdk-energy | NIANFENGNF404H |  | 95 |
| 23 | 249 | 401246TAG2A | voltgent | LL8224N |  | 104 |
| 25 | 248 | 12M33D1320E201 | kaihua-genset | S6L1DG4 |  | 114 |
| 26 | 247 | 12M33G1300/6 | longkai-power | LSA502L8 |  | 115 |
| 28 | 245 | 12M33D1240E310 | acepow-fuan | LV634G |  | 118 |
| 30 | 229 | YC12VTD1680D30 | rcg-power | WR634G |  | 169 |

### IB2400164837#0 — top gốc 30, top nhánh 30; ra 4, vào 4; dropped 756 → 809

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 4 | 272 | QSB39G31 | fdk-energy | S0L2P1 |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 248 | 4TNV98GGE | wintpower | PI144G |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 242 | V3300 | wintpower | PI144G |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 240 | 4TNV98GGE | sanq-power | PI144H |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 15 | 243 | 4B39G12 | fdk-energy | S0L2P1 |  | 41 |
| 25 | 232 | 4B39G11 | rcg-power | S0L2M1 |  | 59 |
| 26 | 231 | 4B39G12 | acepow-fuan | BC184G |  | 62 |
| 29 | 220 | QC498D | wintpower | WT184G22 |  | 79 |

### IB2400185291#0 — top gốc 30, top nhánh 30; ra 27, vào 27; dropped 508 → 1932

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 284 | 2206CE13TAG3 | kaihua-genset | S4L1DF41 |  | không (bị loại; lý do: công cụ không ghi) |
| 2 | 284 | 2206CE13TAG3 | sanq-power | HCI444E |  | không (bị loại; lý do: công cụ không ghi) |
| 3 | 284 | 2206CE13TAG2 | sanq-power | HCI444E |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 284 | 6ZTAA13G3 | stone-power | HCI444D |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 284 | WP13D385E200 | huali-shandong | HLF300 |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 281 | WP13D385E200 | fdk-energy | NIANFENGNF314H |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 281 | SC13E550D2 | fdk-energy | NIANFENGNF314H |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 281 | 6ETAA128G32 | fdk-energy | NIANFENGNF314H |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 281 | 6ZTAA13G2 | koten-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 281 | TAD1352GE | dingbo | LSA463L11 |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 281 | 2206CE13TAG2 | kaihua-genset | S4L1DE41 |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 278 | TAD1355GE | jet-power | HCI444F |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 278 | QSZ13G7 | longkai-power | LK444F |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 278 | NTAA855G7A | stone-power | HCI444F |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 278 | WP13D405E200 | longkai-power | LK444F |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 278 | NTAA855G7A | sanq-power | HCI444F |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 278 | 6ETAA128G32 | longkai-power | LK444F |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 278 | 6ZTAA13G4 | koten-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 278 | NTAA855G7 | uleengen | HCI444F |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 278 | SC15G500D2 | longkai-power | LK444F |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 278 | NTAA855G7 | dingbo | HCI444FS1 |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 278 | 2206AE13TAG3 | gb-power | HCI444F | STANDARDFEATURES | không (bị loại; lý do: công cụ không ghi) |
| 25 | 278 | 6ZTAA13G3 | dingbo | HCI444FS1 |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 269 | WP13D405E200 | jet-power | JET444F |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 269 | YM6S9LFDA | acepow-fuan | HC434FS |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 269 | YM6S9LFD | acepow-fuan | HC434F |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 269 | TAD1344GEB | jet-power | ECO401S4C |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 2 | 281 | YC6K500D31 | fdk-energy | NIANFENGNF314G |  | 29 |
| 3 | 281 | 6ETAA118G31 | fdk-energy | NIANFENGNF314G |  | 37 |
| 5 | 278 | QSNTG3 | longkai-power | LK444F |  | 50 |
| 6 | 278 | 6ETAA118G31 | longkai-power | LK444E |  | 66 |
| 7 | 275 | KTA19G2 | stone-power | HCI444E |  | 70 |
| 9 | 269 | BF6M1015CPLAG | sanq-power | HCI444FS |  | 124 |
| 10 | 268 | YC6K600D30 | fdk-energy | NIANFENGNF314J |  | 157 |
| 11 | 264 | YC6T600LD22 | wintpower | WT544C |  | 173 |
| 12 | 261 | 6ETAA128G22 | jet-power | JET444FS |  | 175 |
| 13 | 261 | 6ETAA128G21 | jet-power | JET444F |  | 176 |
| 14 | 261 | BF6M1015CG3A | dingbo | TFW23004 |  | 182 |
| 15 | 260 | KTA19G2 | bobig-power | BW314F |  | 187 |
| 16 | 259 | TAD1650GE | dingbo | LSA472M7 |  | 197 |
| 17 | 258 | CR13TE6WS550 | sanq-power | HCI544C |  | 199 |
| 18 | 258 | QSX15G6 | sanq-power | HCI544C |  | 200 |
| 19 | 257 | YC6T550LD21 | wintpower | WT544C |  | 202 |
| 20 | 256 | TAD1650GE | jet-power | ECO402S4C |  | 204 |
| 21 | 254 | WD145TAD33L | wintpower | LSA472VS2 |  | 218 |
| 22 | 253 | CA6DN1J45D | acepow-fuan | HC434F |  | 221 |
| 23 | 253 | YC6MJ480LD20 | dingbo | TFW23004A |  | 222 |
| 24 | 253 | CA6DN1J45D | wintpower | HCI444FS |  | 223 |
| 25 | 252 | YC6T600LD22 | dingbo | TFW23504A |  | 225 |
| 26 | 249 | 2206DE13TAG2 | kaihua-genset | S4L1DE41 |  | 232 |
| 27 | 248 | NTA855G7A | tecgen-fujian | TGI314S320 |  | 234 |
| 28 | 247 | 2206DE13TAG3 | kaihua-genset | S4L1DF41 |  | 239 |
| 29 | 241 | NTA855G1B | penlucky | S4L1DE41 |  | 244 |
| 30 | 241 | YC6K520D30 | penlucky | TALA473A |  | 245 |

### IB2400216393#0 — top gốc 30, top nhánh 30; ra 26, vào 26; dropped 930 → 1513

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 2 | 287 | MTA11G2 | sanq-power | UCDI274K |  | không (bị loại; lý do: công cụ không ghi) |
| 3 | 287 | NT855GA | sanq-power | UCDI274K |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 284 | NT855GA | stone-power | UCI274H |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 284 | YC6MK350LD20 | huali-shandong | HLF200 |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 281 | YC6MK350D30 | fdk-energy | NIANFENGNF274K |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 281 | YC6MK350LD20 | fdk-energy | NIANFENGNF274K |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 281 | WP10D264E200 | fdk-energy | NIANFENGNF274K |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 278 | WP10D264E200 | longkai-power | LK274K |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 278 | MTA11G2 | longkai-power | LK274K |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 278 | 6LTAA89G3 | longkai-power | LK274K |  | có, hạng 12 |
| 15 | 273 | SC9D340D2 | fdk-energy | NIANFENGNF274K |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 273 | 6M16G275/5 | kaihua-genset | TALA46D |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 270 | SC9D340D2 | longkai-power | LK274K |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 269 | MTA11G2A | dingbo | HCI444C1 |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 269 | YM6S4LD | acepow-fuan | UC274K |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 269 | YC6MK350D30 | dingbo | TFW22004A |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 269 | P126TI | uleengen | 274K |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 264 | 1606AE93TAG5 | gb-power | HCI444D | STANDARDFEATURES | không (bị loại; lý do: công cụ không ghi) |
| 23 | 261 | 6DTAA89G24 | jet-power | JET274J |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 259 | P126TI | rise-power | LSA462L9 |  | không (bị loại; lý do: công cụ không ghi) |
| 25 | 259 | YM6S4LFD | acepow-fuan | HC434CS |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 253 | 6DTAA89G23 | jet-power | JET274K |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 253 | 6DTAA89G23 | bobig-power | BW274K |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 249 | P126TIII | rise-power | LSA462VL12 |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 249 | YC6MK420LD20 | wintpower | WT444D |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 249 | SC12E460D2 | jet-power | JET444D |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 1 | 287 | 6LTAA89G2 | fdk-energy | UCDI274K |  | 1 |
| 3 | 287 | 6LTAA89G3 | fdk-energy | UCDI274K |  | 11 |
| 5 | 279 | QSL89G4 | fdk-energy | UCDI274K |  | 21 |
| 8 | 271 | QSL9G3 | sanq-power | UCDI274K |  | 45 |
| 9 | 270 | 6LTAA95G3 | longkai-power | LK444DS |  | 52 |
| 10 | 269 | NTA855G1A | stone-power | HCI444D |  | 70 |
| 11 | 257 | 6DTAA89G33 | fdk-energy | NIANFENGNF274K |  | 98 |
| 12 | 245 | WP10CD264E200 | uleengen | MPH2004 |  | 115 |
| 13 | 241 | 6ETAA118G22 | jet-power | JET444E |  | 133 |
| 14 | 237 | WD129TAD23 | wintpower | LSA462L6 |  | 138 |
| 15 | 237 | YC6M350LD20 | uleengen | 274K |  | 139 |
| 16 | 235 | 6DTAA89G34 | bobig-power | BW314D |  | 147 |
| 17 | 229 | BF6M1015G1A | dingbo | TFW22004 |  | 163 |
| 18 | 225 | 618ZLD | jet-power | JET444D |  | 269 |
| 19 | 224 | WD129TAD25 | wintpower | LSA462L9 |  | 272 |
| 20 | 223 | CURSOR87TE3S550 | sanq-power | UCDI274K |  | 273 |
| 21 | 221 | SC9D355D2 | dingbo | 1FC22834 |  | 287 |
| 22 | 221 | R6126ZLD1 | jet-power | JET274K |  | 292 |
| 23 | 215 | 6M16G300/5 | rcg-power | S4L1DD41 |  | 367 |
| 24 | 213 | S6BPTA | comappower |  |  | 388 |
| 25 | 213 | YCMK10TAA350G20 | byc-power | 274K |  | 391 |
| 26 | 211 | 6R1600G10F | ettes-power |  |  | 404 |
| 27 | 209 | 6R1600G10F | kaihua-genset |  |  | 407 |
| 28 | 209 | SC13G420D2 | wintpower |  |  | 414 |
| 29 | 209 | SC13G420D2 | victory-generator |  |  | 420 |
| 30 | 205 | WP10D264E2016M16G220/6 | kaihua-genset | UCDI274J1 |  | 441 |

### IB2400229394#0 — top gốc 19, top nhánh 16; ra 5, vào 2; dropped 16 → 22

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 5 | 158 | 401661TRG1 | aj-power | MA7014D |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 121 | QSK50G7 | tecnogen |  |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 120 | QSK50G7 | agg-power |  | 1650/1320 | không (bị loại; lý do: công cụ không ghi) |
| 13 | 115 | QSK60G3 | tecnogen |  |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 114 | QSK60G3 | agg-power |  | 1875/1500 | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 4 | 171 | 401246TAG3A | aj-power | MA7014C |  | 4 |
| 15 | 76 | QSK50G6 | tecnogen |  |  | 26 |

### IB2400303471#0 — top gốc 30, top nhánh 30; ra 18, vào 18; dropped 966 → 1262

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 3 | 284 | CA6DF219D | wintpower | UCI274F |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 284 | 1106A70TAG2 | uleengen | UCI274F |  | có, hạng 8 |
| 5 | 284 | 1106A70TG1 | uleengen | UCI274E |  | có, hạng 12 |
| 6 | 284 | 6CTA83G2 | fdk-energy | UCI274F |  | có, hạng 6 |
| 9 | 281 | YC6B205LD20 | wintpower | WT274F |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 281 | YC6B205LD20 | fdk-energy | NIANFENGNF274FS |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 281 | YC6A205D30 | fdk-energy | NIANFENGNF274FS |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 277 | 6CTA83G1 | sanq-power | UCI274F |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 276 | BF6M1013ECG1 | uleengen | UCI274D |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 269 | YC6A205D30 | dingbo | TFW21204A |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 269 | WP6D158E201 | jet-power | JET274E |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 269 | LR6B3LD | acepow-fuan | UC274E |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 264 | 1106A70TAG3 | tecgen-fujian | UCI274G |  | có, hạng 46 |
| 25 | 264 | 6CTA83G1 | stone-power | UCI274G |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 261 | BF6M1013ECG1 | acepow-fuan | UC274ES |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 260 | LR6M3LD | acepow-fuan | UC274F |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 258 | CA6DF221D | wintpower | UCI274E |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 244 | BF6M1013ECG2 | acepow-fuan | UC274G |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 2 | 284 | 1106A70TAG2 | fdk-energy | UCI274F |  | 3 |
| 10 | 269 | 1106A70TG1 | kaihua-genset | UCI274E1 |  | 45 |
| 11 | 269 | R6105IZLD | uleengen | 274E |  | 60 |
| 15 | 264 | 1106A70TAG3 | sanq-power | UCI274G |  | 69 |
| 16 | 264 | 6CTA83G2 | stone-power | UCI274G |  | 75 |
| 18 | 256 | WP6D167E200 | jet-power | JET274G |  | 95 |
| 19 | 245 | YCD6Q23H8210 | fdk-energy | NIANFENGNFS274FS |  | 106 |
| 20 | 245 | WP6CD152E200 | uleengen | MPH1204 |  | 107 |
| 21 | 245 | YC6B210LD20 | fdk-energy | NIANFENGNFL274D |  | 108 |
| 22 | 245 | YC6B210LD20 | uleengen | 274ES |  | 110 |
| 23 | 236 | YC6A230LD20 | wintpower | WT274G |  | 126 |
| 24 | 229 | R6105IZLD | victory-generator |  |  | 135 |
| 25 | 228 | YC6A230D30 | dingbo | TFW21404A |  | 188 |
| 26 | 226 | TAD751GE | rcg-power | UCI274F |  | 191 |
| 27 | 221 | CATC71 | rise-power | LC3114J |  | 209 |
| 28 | 216 | WP6D167E200 | koten-power |  |  | 224 |
| 29 | 213 | 1106DE70TAG3 | eastern-lion-fuan | EL274F |  | 237 |
| 30 | 213 | 1106DE70TAG3 | comappower |  |  | 242 |

### IB2400325367#0 — top gốc 30, top nhánh 30; ra 14, vào 14; dropped 573 → 762

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 5 | 287 | 4BTA39G11 | koten-power | UCI224G |  | có, hạng 9 |
| 7 | 281 | WP41D80E200 | fdk-energy | NIANFENGNF224G |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 278 | WP41D80E200 | longkai-power | LK224F |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 275 | 4HTAA43G33 | fdk-energy | NIANFENGNF224G |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 272 | 4BTA39G13 | longkai-power | LK224G |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 271 | NEF45SM3S500 | sanq-power | UCI224G |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 265 | 4M10G88/5 | kaihua-genset | TALA44C |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 263 | CA4DF212D | acepow-fuan | UC224G |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 263 | CA4DF212D | uleengen | 224G |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 261 | BF4M2012CG1 | acepow-fuan | UC224F |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 256 | WP41D100E200 | jet-power | JET224G1 |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 255 | 1104CE44TAG1 | gb-power | UCI224G | STANDARDFEATURES | không (bị loại; lý do: công cụ không ghi) |
| 23 | 253 | Y4110ZLD | acepow-fuan | UC224F |  | không (bị loại; lý do: công cụ không ghi) |
| 25 | 251 | LR4M3LD | acepow-fuan | UC274C |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 4 | 287 | QSB39G37 | fdk-energy | UCI224G |  | 4 |
| 11 | 256 | 4HT43G23 | longkai-power | LK224G |  | 52 |
| 16 | 246 | QSB5G4 | sanq-power | UCI274C |  | 70 |
| 20 | 229 | 4M10G4D3/5 | voltgent |  |  | 116 |
| 21 | 229 | QSB39G37 | voltgent |  |  | 135 |
| 22 | 229 | 1104A44TG1 | minsun-motor | SYA224F |  | 138 |
| 23 | 224 | 4BTA39G2 | longkai-power |  |  | 145 |
| 24 | 221 | CATC44 | rise-power | LC3114D |  | 158 |
| 25 | 221 | QSB39G3 | penlucky | UCI224G1 |  | 160 |
| 26 | 216 | 1104C44TAG2 | elitech-power |  |  | 183 |
| 27 | 215 | 1104C44TAG2 | rise-power |  |  | 193 |
| 28 | 213 | 4ZTAA41G21 | voltgent |  |  | 200 |
| 29 | 213 | YCA48T110G20 | byc-power | 224GS |  | 201 |
| 30 | 211 | R4110AZLD | jet-power | JET224G |  | 213 |

### IB2400339967#0 — top gốc 30, top nhánh 30; ra 7, vào 7; dropped 490 → 500

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 3 | 204 | WP23D25E200 | elitech-power |  |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 204 | 4DW8123D | victory-generator |  |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 199 | 404D22G | elitech-power |  | MODEL:EPS125PKA3S | không (bị loại; lý do: công cụ không ghi) |
| 7 | 196 | 4DW8128D | minsun-motor | SYA164B |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 188 | 4M06G20/5 | elitech-power |  |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 184 | 404A22G1 | ade-power |  |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 159 | 4DW8123D | mecca-power |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 4 | 196 | 3TNV88GGE | acepow-fuan | BC164C |  | 7 |
| 9 | 181 | JE493DB04 | elitech-power |  |  | 17 |
| 14 | 164 | 4YT2320D | elitech-power |  |  | 22 |
| 24 | 148 | QC480D | elitech-power |  |  | 42 |
| 26 | 145 | 3N17D | rise-power | SLW88 |  | 44 |
| 27 | 145 | 3TNV82ABGGE | powerzoo |  |  | 45 |
| 28 | 145 | 3TNV88FUGGE | voltgent |  |  | 46 |

### IB2400356423#0 — top gốc 30, top nhánh 30; ra 12, vào 12; dropped 445 → 593

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 269 | 4Z23G21 | jet-power | JET164D |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 256 | 4B39G11 | fdk-energy | S0L2G1 |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 250 | 4B39G11 | tecgen-fujian | PI144D |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 250 | 4DW9129D | wintpower | PI144D |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 250 | 4Z27G11 | genlitec | S184G16 |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 247 | YSD490D | tecgen-fujian | TGI184S16 |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 244 | YSD490D | acepow-fuan | BC184E |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 244 | 4DW9129D | uleengen | 184ES |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 236 | BFM3G1 | acepow-fuan | BC184E |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 229 | 4Z23G11 | voltgent |  |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 229 | 4Z23G11 | rcg-power | WR164D |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 229 | 4Z23G21 | kaihua-genset |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 5 | 244 | YC4V35D20 | fdk-energy | NIANFENGNFS184D |  | 16 |
| 20 | 213 | 4DW8123DYFD10W | bobig-power | BW164D |  | 52 |
| 21 | 213 | N485D | yongcai-elecmama | ELECMAMA164D |  | 53 |
| 22 | 213 | 4M06G20/5 | elitech-power |  |  | 54 |
| 23 | 212 | 4B39G2 | kaihua-genset |  |  | 57 |
| 24 | 212 | JE493DB04/21KW | jet-power | JET184D/16KW |  | 58 |
| 25 | 212 | QC490D | yongcai-elecmama | ELECMAMA184E |  | 59 |
| 26 | 204 | 4Z23G12 | voltgent |  |  | 64 |
| 27 | 204 | N490D | wintpower | WT184G18 |  | 82 |
| 28 | 204 | 4M08G4D3/5 | voltgent |  |  | 86 |
| 29 | 204 | 4B39G1 | hosem-power |  |  | 93 |
| 30 | 202 | Y485BD | acepow-fuan | BC164E |  | 101 |

### IB2400371783#0 — top gốc 30, top nhánh 30; ra 14, vào 14; dropped 545 → 1359

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 2 | 284 | 1606AE93TAG5 | gb-power | HCI444D | STANDARDFEATURES | không (bị loại; lý do: công cụ không ghi) |
| 3 | 284 | 1506AE88TAG5 | sanq-power | HCI444D |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 284 | MTAA11G3 | uleengen | HCI444D |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 277 | TAD1351GE | dingbo | LSA463L10 |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 277 | YC6MK420LD20 | fdk-energy | NIANFENGNF314E |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 277 | TAD1351GE | jet-power | HCI444ES |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 277 | CA6DM2J39D | wintpower | HCI444ES |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 276 | CA6DM2J41D | wintpower | HCI444E |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 274 | MTAA11G3 | sanq-power | HCI444ES |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 273 | NTA855G2 | uleengen | HCI444ES |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 269 | 1506AE88TAG5 | bobig-power | BWC4D |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 269 | YC6MK420LD20 | wintpower | WT444D |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 269 | BF6M1015CLAG3A | uleengen | 4ES |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 139 | 1506AE88TAG5 | fg-wilson |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 14 | 269 | YM6S4LFD | acepow-fuan | HC434CS |  | 62 |
| 15 | 269 | YM6S4LD | acepow-fuan | UC274K |  | 64 |
| 16 | 268 | QSL9G5 | sanq-power | HCI444D |  | 66 |
| 17 | 266 | SC13G420D2 | fdk-energy | NIANFENGNF314E |  | 84 |
| 18 | 265 | 6M16G350/5 | kaihua-genset | TALA46F |  | 90 |
| 19 | 265 | WP12D317E200 | jet-power | JET444E |  | 91 |
| 20 | 265 | NTA855G1 | stone-power | HCI444C |  | 94 |
| 21 | 265 | P126TI | rise-power | LSA462L9 |  | 98 |
| 22 | 265 | 6ETAA118G21 | bobig-power | BW314DS |  | 99 |
| 23 | 265 | YM6S9LD | acepow-fuan | HC434DS |  | 100 |
| 24 | 265 | NTA855G1 | bobig-power | BW314D |  | 102 |
| 25 | 265 | SC12E420D2 | uleengen | 4ES |  | 115 |
| 26 | 261 | 6ETAA118G22 | jet-power | JET444E |  | 129 |
| 27 | 261 | 6ETAA118G21 | jet-power | JET444E |  | 134 |

### IB2400439995#0 — top gốc 30, top nhánh 30; ra 8, vào 8; dropped 1727 → 1903

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 287 | NT855GA | fdk-energy | UCDI274K | CUMMINSMODEL:NT855GAGENERALFEATURES: | không (bị loại; lý do: công cụ không ghi) |
| 2 | 287 | NT855GA | sanq-power | UCDI274K |  | không (bị loại; lý do: công cụ không ghi) |
| 3 | 284 | NT855GA | stone-power | UCI274H |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 284 | YC6MK350LD20 | huali-shandong | HLF200 |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 281 | YC6MK350LD20 | fdk-energy | NIANFENGNF274K |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 273 | SC9D340D2 | fdk-energy | NIANFENGNF274K |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 270 | SC9D340D2 | longkai-power | LK274K |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 219 | 2806CE18TAG1A | comappower |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 4 | 269 | NTA855G1A | stone-power | HCI444D |  | 19 |
| 7 | 255 | NTA855GA | fdk-energy | UCDI274K |  | 30 |
| 25 | 213 | QSNTG6 | comappower |  |  | 124 |
| 26 | 209 | SC13G420D2 | wintpower |  |  | 127 |
| 27 | 209 | SC13G420D2 | victory-generator |  |  | 128 |
| 28 | 205 | WP10D264E2016M16G220/6 | kaihua-genset | UCDI274J1 |  | 135 |
| 29 | 205 | TBD234V6A | rise-power | LSA462L6 |  | 136 |
| 30 | 205 | WD258D22 | wintpower | LSA462L6 |  | 137 |

### IB2400440257#0 — top gốc 30, top nhánh 30; ra 4, vào 4; dropped 753 → 807

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 4 | 272 | QSB39G31 | fdk-energy | S0L2P1 |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 248 | 4TNV98GGE | wintpower | PI144G |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 242 | V3300 | wintpower | PI144G |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 240 | 4TNV98GGE | sanq-power | PI144H |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 15 | 243 | 4B39G12 | fdk-energy | S0L2P1 |  | 41 |
| 25 | 232 | 4B39G11 | rcg-power | S0L2M1 |  | 59 |
| 26 | 231 | 4B39G12 | acepow-fuan | BC184G |  | 62 |
| 29 | 220 | QC498D | wintpower | WT184G22 |  | 79 |

### IB2400489270#0 — top gốc 30, top nhánh 30; ra 18, vào 18; dropped 402 → 692

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 2 | 277 | 404D22G | kaihua-genset | S0L2M1 |  | không (bị loại; lý do: công cụ không ghi) |
| 3 | 275 | 4TNV88GGE | wintpower | PI144D |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 272 | 4B39G2 | uleengen | S0L2M1 |  | có, hạng 5 |
| 6 | 272 | QSB39G31 | fdk-energy | S0L2P1 |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 272 | WP23D25E200 | uleengen | S0L2M1 |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 272 | 404D22TG | uleengen | S0L2M1 |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 271 | 404D22G | sanq-power | PI144D |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 269 | WP23D25E200 | fdk-energy | NIANFENGNF184E |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 269 | 4DW9235D | wintpower | PI144E |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 269 | 404D22TG | gb-power | PI144E |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 269 | 4B39G1 | stone-power | PI144E |  | có, hạng 12 |
| 16 | 265 | 4TNV84TGGE | wintpower | PI144E |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 264 | YCDV254FHZ35 | fdk-energy | NIANFENGNF184F |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 262 | V2003T | wintpower | PI144E |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 260 | WP23D33E200 | jet-power | JET184FS |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 260 | 4DW9235D | uleengen | 184FS |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 240 | 4TNV98GGE | sanq-power | PI144H |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 145 | WP23D33E200 | weichai-heavy-machinery |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 3 | 272 | 4B39G2 | fdk-energy | S0L2M1 | CUMMINSMODEL:4B39G2GENERALFEATURES: | 5 |
| 4 | 272 | 4B39G2 | fdk-energy | S0L2P1 |  | 7 |
| 10 | 260 | 4B39G1 | bobig-power | BW184F |  | 42 |
| 11 | 260 | Y490D | uleengen | 184EF |  | 45 |
| 12 | 259 | V2203 | wintpower | PI144D |  | 46 |
| 13 | 251 | 4BT39G1 | uleengen | S0L2P1 |  | 63 |
| 16 | 243 | 4B39G12 | fdk-energy | S0L2P1 |  | 81 |
| 18 | 239 | Y4100D | tecgen-fujian | TG184S24 |  | 89 |
| 19 | 234 | Y4102D | tecgen-fujian | TG184S25 |  | 96 |
| 20 | 234 | Y4102D | acepow-fuan | BC184G |  | 98 |
| 21 | 234 | 4B39G12 | longkai-power | LK184G |  | 100 |
| 22 | 233 | 4Z30G21 | jet-power | JET184F |  | 101 |
| 23 | 232 | 4B39G11 | rcg-power | TALA40G |  | 102 |
| 24 | 231 | K4100D | uleengen | 184G |  | 116 |
| 25 | 229 | YSD490D | elitech-power |  |  | 120 |
| 26 | 228 | JE493DB02/24KW | jet-power | JET184FS/20KW |  | 122 |
| 27 | 228 | 495D | sunny-weifang | STC20 |  | 124 |
| 28 | 221 | JE493DB02 | wintpower | PI144E |  | 145 |

### IB2400546306#0 — top gốc 30, top nhánh 30; ra 18, vào 18; dropped 1073 → 1497

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 284 | CA6DF217D | wintpower | UCI274E |  | không (bị loại; lý do: công cụ không ghi) |
| 2 | 281 | WP6D132E200 | fdk-energy | NIANFENGNF274E |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 276 | TAD750GE | jet-power | UCI274E |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 269 | QSB59G33 | fdk-energy | UCI274ES |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 269 | D1146T | rise-power | LSA442S7 |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 269 | WP6D132E200 | bobig-power | BW274D |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 269 | LR6A3LD | acepow-fuan | UC274D |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 269 | CA6DF217D | uleengen | 274ES |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 265 | 6M11G150/5 | kaihua-genset | TALA44E |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 264 | CA6DF219D | wintpower | UCI274F |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 264 | WP6D152E200 | uleengen | UCI274E |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 261 | YC6B205LD20 | wintpower | WT274F |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 260 | 6M11G150/5 | longkai-power | LSA443M6 |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 258 | WP6D152E200 | longkai-power | LK274F/S |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 256 | DP086TA | sanq-power | UCI274F |  | không (bị loại; lý do: công cụ không ghi) |
| 25 | 256 | TAD751GE | jet-power | UCI274F |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 252 | 6HTAA65G21 | longkai-power | LK274E |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 154 | WP6D132E200 | weichai-heavy-machinery |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 3 | 276 | 1106A70TG1 | sanq-power | UCI274E |  | 7 |
| 9 | 264 | QSB67G3 | fdk-energy | UCI274F |  | 42 |
| 12 | 249 | R6105IZLD | uleengen | 274E |  | 97 |
| 13 | 245 | WP6CD132E200 | uleengen | MPH1004 |  | 99 |
| 14 | 240 | TAD731GE | dingbo | LSA443L10 |  | 109 |
| 15 | 240 | QSB7G3 | sanq-power | UCI274F |  | 110 |
| 16 | 237 | CA6DF217D/125KW | jet-power | JET274D1/100KW |  | 112 |
| 17 | 237 | 6HTAA65G32 | fdk-energy | NIANFENGNF274FS |  | 113 |
| 18 | 234 | 1006TAG | wintpower | UCI274E |  | 115 |
| 19 | 229 | 1006TAG | jet-power | JET274D1 |  | 121 |
| 20 | 229 | R6105AZLD | gordon-power |  |  | 131 |
| 21 | 229 | R6105AZLD | victory-generator |  |  | 134 |
| 22 | 229 | TBD226B6D | rise-power | LSA442S75 |  | 146 |
| 23 | 229 | 6CT83GM115 | uleengen | MPH1004 |  | 150 |
| 24 | 225 | WP6CD152E200 | uleengen | MPH1204 |  | 158 |
| 25 | 224 | 1106CP6TAG2 | wintpower | UCI274F |  | 163 |
| 26 | 220 | NEF67SM1S500 | sanq-power | UCI274E |  | 191 |
| 28 | 205 | 6BT59G2(115) | bobig-power | BW274D |  | 301 |

### IB2400562787#0 — top gốc 30, top nhánh 30; ra 20, vào 20; dropped 262 → 728

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 3 | 353 | 4M06G55/5 | longkai-power | LSA423M8 |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 331 | 4M10G70/5 | kaihua-genset | TALA42H |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 327 | 4M10G70/5 | longkai-power | LSA423L9 |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 319 | YC4D80D34 | penlucky | TALA42F |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 313 | 4M06G55/5 | rcg-power | TALA42G |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 308 | WP41D66E200 | penlucky | TALA42H |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 307 | YC4D90D34 | penlucky | TALA42H |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 284 | 4DX2265D | wintpower | UCI224D |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 281 | YC4D80D34 | fdk-energy | NIANFENGNF224D |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 275 | 1104A44TG1 | uleengen | S1L2Y1 |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 272 | Y4105ZLD | tecgen-fujian | TGI224S44 |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 270 | WP41D66E200 | huali-shandong | HLF50 |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 270 | 1104A44TG1 | kaihua-genset | S1L2Y1 |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 269 | Y4105ZLD | acepow-fuan | UC224E |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 269 | LR4B5D | acepow-fuan | UC224D |  | không (bị loại; lý do: công cụ không ghi) |
| 25 | 269 | Y4105ZLD | tecgen-fujian | TG224S44 |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 269 | WP41D66E200 | uleengen | S1L2Y1 |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 269 | YC4D80D34 | fdk-energy | NIANFENGNFS224D |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 269 | Y4102ZLD | tecgen-fujian | TG224S40 |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 269 | 4TNV98TGGE | wintpower | PI144K |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 11 | 263 | BF4M2012 | hosem-power | UCI224E |  | 81 |
| 12 | 262 | 4TNV106TGGE | sr-genset | TALA42G |  | 82 |
| 13 | 261 | QSB39G2 | longkai-power | LK224E |  | 83 |
| 14 | 261 | QSB39G2 | fdk-energy | S1L2Y1 |  | 84 |
| 15 | 261 | 4ZT35G21 | jet-power | JET224D |  | 86 |
| 16 | 260 | BF4M2012 | acepow-fuan | UC224E |  | 87 |
| 17 | 260 | BF4M2012 | uleengen | 224E |  | 91 |
| 18 | 246 | 4ZT41G21 | jet-power | JET224E |  | 130 |
| 19 | 244 | WP41D66E201 | penlucky | TALA42H |  | 134 |
| 20 | 242 | 4HTAA43G32 | fdk-energy | NIANFENGNF224F |  | 136 |
| 21 | 241 | SP344CB | long-gen | TALA42H |  | 137 |
| 22 | 237 | JE493ZLDC02/51KW | jet-power | JET224D/40KW |  | 140 |
| 23 | 236 | 4TNV106GGE | sanq-power | UCI224D |  | 142 |
| 24 | 236 | 4TNV106GGE | wintpower | UCI224D |  | 143 |
| 25 | 230 | WP4CD66E200 | uleengen | MPH504 |  | 151 |
| 26 | 230 | 4BTA39G2(QC50/60E) | fdk-energy | S1L2R1 |  | 154 |
| 27 | 229 | 4M10G2D3/5 | rcg-power | S1L2Y1 |  | 163 |
| 28 | 229 | YC4D60D21 | elitech-power |  |  | 169 |
| 29 | 229 | 4BT39G2 | victory-generator |  |  | 171 |
| 30 | 229 | 4BT39G2 | voltgent |  |  | 185 |

### IB2400564384#0 — top gốc 30, top nhánh 30; ra 22, vào 22; dropped 1013 → 1960

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 355 | 6ZTAA13G4 | sunkings | DC24V |  | không (bị loại; lý do: công cụ không ghi) |
| 2 | 287 | QSZ13G3 | koten-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 3 | 287 | 2506CE15TAG1 | gb-power | HCI544C | STANDARDFEATURES | không (bị loại; lý do: công cụ không ghi) |
| 4 | 287 | 2506CE15TAG2 | gb-power | HCI544C | STANDARDFEATURES | không (bị loại; lý do: công cụ không ghi) |
| 5 | 287 | DP158LD | sanq-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 287 | KTA19G3A | yongcai-elecmama | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 287 | QSZ13G3 | uleengen | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 285 | 2506CE15TAG1 | sanq-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 284 | 2506CE15TAG2 | huali-shandong | HLF400 |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 284 | TAD1651GE | jet-power | HCI544D |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 284 | KTA19G3A | sanq-power | HCI544D |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 284 | KTA19G3 | stone-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 281 | YC6T660D31 | fdk-energy | NIANFENGNF354D |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 281 | YC6K660D30 | fdk-energy | NIANFENGNF354D |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 278 | TAD1651GE | dingbo | LSA472M7 |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 278 | QSZ13G10 | longkai-power | LK544C |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 273 | 6M21G550/5 | kaihua-genset | S5L1DC4 |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 273 | 6M21G550/5 | longkai-power | LSA473M8 |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 263 | 6M33D572E200 | longkai-power | LK544E |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 262 | TAD1641GE | dingbo | LSA472M7 |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 261 | BF8M1015CPG1A | dingbo | TFW24004 |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 256 | YC6TD780D31 | dingbo | TFW24504A |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 9 | 269 | KTAA19G5 | stone-power | HCI544C |  | 85 |
| 10 | 268 | QSX15G8 | sanq-power | HCI544D |  | 87 |
| 11 | 268 | KTAA19G6 | fdk-energy | S5L1DE41 |  | 94 |
| 12 | 263 | KTAA19G6 | longkai-power | LK544E |  | 100 |
| 13 | 261 | 6M26D484E200 | bobig-power | BW354D |  | 106 |
| 14 | 253 | YC6T660LD20 | wintpower | WT544D |  | 127 |
| 15 | 253 | YC6T660LD20 | fdk-energy | NIANFENGNFS5D |  | 128 |
| 16 | 247 | BF8M1015CPLAG | sanq-power | HCI544C |  | 150 |
| 17 | 245 | TAD1641GEB | jet-power | ECO403S4C |  | 152 |
| 18 | 244 | YC6TD780LD20 | wintpower | WT544E |  | 154 |
| 19 | 244 | QSK19G6 | longkai-power | LK544E |  | 155 |
| 20 | 241 | 6M21G8D3/5 | rcg-power | S5L1DC4 |  | 160 |
| 21 | 237 | 6M33D506E310 | acepow-fuan | HC534D |  | 177 |
| 22 | 237 | KTA19DM | uleengen | MPH4004 |  | 180 |
| 23 | 236 | TBD234V12 | rise-power | LSA472S4 |  | 181 |
| 24 | 230 | P180LE | rise-power | LSA472M7 |  | 188 |
| 25 | 229 | 6M21G8D3/5 | voltgent |  |  | 213 |
| 26 | 229 | KTA19G2 | penlucky | S4LIDF41 |  | 222 |
| 27 | 229 | TAD1650GE | victory-generator |  |  | 281 |
| 28 | 213 | YCT16660G31 | byc-power | 544C |  | 465 |
| 29 | 213 | YCT16TAA660G20 | byc-power | 544C |  | 476 |
| 30 | 209 | YCTD20780G31 | byc-power | 544D |  | 501 |

### IB2400587900#0 — top gốc 30, top nhánh 30; ra 16, vào 16; dropped 254 → 535

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 5 | 281 | YC4D80D34 | fdk-energy | NIANFENGNF224D |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 281 | YCD4V33H675 | fdk-energy | NIANFENGNF224D |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 281 | WP23D48E200 | fdk-energy | NIANFENGNF224D |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 278 | WP23D48E200 | uleengen | S1L2R1 |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 273 | 4M06G55/5 | longkai-power | LSA423M8 |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 269 | WP41D66E200 | jet-power | JET224D |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 269 | Y4102ZLD | tecgen-fujian | TG224S40 |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 269 | 4TNV98TGGE | wintpower | PI144K |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 269 | Y4102ZLD | uleengen | 224D |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 268 | NEF45AM2S500 | sanq-power | UCI224D |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 264 | 1104A44TG1 | uleengen | S1L2Y1 |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 262 | Y4105ZLD | tecgen-fujian | TGI224S44 |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 261 | BFM3C | acepow-fuan | UC224D |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 259 | Y4105ZLD | acepow-fuan | UC224E |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 252 | S38G6 | sanq-power | UCI224D |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 241 | 4HT43G21 | longkai-power | LK224E |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 14 | 249 | 4DX2378D | uleengen | 224E |  | 74 |
| 16 | 237 | JE493ZLDC02/51KW | jet-power | JET224D/40KW |  | 86 |
| 17 | 237 | Y4105ZLD/55KW | jet-power | JET224D/40KW |  | 87 |
| 18 | 237 | 4BTA39GM47 | uleengen | MPH404 |  | 88 |
| 19 | 237 | YC4D90ZD21 | uleengen | 224D |  | 89 |
| 20 | 236 | 4TNV106GGE | sanq-power | UCI224D |  | 92 |
| 21 | 236 | 4TNV106GGE | wintpower | UCI224D |  | 93 |
| 22 | 232 | 4DX2161D | hosem-power | AXC50HS |  | 96 |
| 23 | 230 | 4BTA39G2(QC50/60E) | fdk-energy | S1L2R1 |  | 98 |
| 24 | 229 | YC4D60D21 | elitech-power |  |  | 102 |
| 25 | 229 | LR4B5D | longkai-power |  |  | 105 |
| 26 | 229 | 4DX2365D | acepow-fuan | UC224D |  | 130 |
| 27 | 229 | YC4D75D34 | dingbo | TFW2404A |  | 131 |
| 28 | 229 | N4105ZD | jet-power | JET224D |  | 135 |
| 29 | 229 | 4B39G2 | penlucky | S0L2N1 |  | 157 |
| 30 | 229 | YC4D60D25 | kaihua-genset |  |  | 166 |

### IB2500008885#0 — top gốc 30, top nhánh 30; ra 20, vào 20; dropped 892 → 1640

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 284 | 2806AE18TAG2 | gb-power | HCI544FS | STANDARDFEATURES | không (bị loại; lý do: công cụ không ghi) |
| 5 | 284 | 2806CE18TAG1A | sanq-power | HCI544D |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 284 | 2806AE18TAG1A | gb-power | HCI544FS | STANDARDFEATURES | không (bị loại; lý do: công cụ không ghi) |
| 7 | 281 | 6KTAA25G39 | fdk-energy | NIANFENGNF354F |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 281 | 6M33D633E200 | kaihua-genset | S5L1DE41 |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 276 | TWD1653GE | jet-power | HCI544FS |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 275 | 6KTAA25G38 | fdk-energy | NIANFENGNF354H |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 274 | 6M33D670E200 | longkai-power | LK544F |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 273 | TWD1645GE | dingbo | LSA493M6 |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 272 | QSK19G4 | stone-power | HCI544F |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 272 | 2806AE18TAG2 | sanq-power | HCI544F |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 272 | 6KTAA25G33 | longkai-power | LK544F |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 272 | KTA19G8 | stone-power | HCI544E |  | có, hạng 22 |
| 23 | 270 | 400623TAG2A | gb-power | LVI634B | STANDARDFEATURES | không (bị loại; lý do: công cụ không ghi) |
| 24 | 269 | 6M33D633E200 | acepow-fuan | HC534FS |  | không (bị loại; lý do: công cụ không ghi) |
| 25 | 269 | QSK19G4 | dingbo | HCI544F1 |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 269 | 400623TAG2A | uleengen | S5L1DH41 |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 269 | 6KTAA25G39 | jet-power | JET544FS |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 269 | 6M33D572E200 | bobig-power | BW354FS |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 269 | 2806CE18TAG1A | kaihua-genset | HCI544E1 |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 6 | 284 | S6R2PTAC | fdk-energy | HCI544FS |  | 11 |
| 11 | 272 | KTA19G8 | sanq-power | HCI544E |  | 48 |
| 13 | 269 | YC6TD840D31 | dingbo | TFW25004A |  | 84 |
| 14 | 269 | KTAA19G5 | bobig-power | BW354ES |  | 87 |
| 15 | 266 | YC6TD1000D30 | fdk-energy | NIANFENGNF354H |  | 95 |
| 16 | 263 | YC6TD900D31 | dingbo | TFW25504A |  | 109 |
| 17 | 254 | YC6TD1000D30 | dingbo | TFW26004A |  | 131 |
| 18 | 254 | 6KTAA25G320 | jet-power | JET634B |  | 132 |
| 19 | 254 | S6R2PTAAC | sanq-power | HCI634G |  | 147 |
| 20 | 253 | YC6TD840LD20 | wintpower | WT544F |  | 154 |
| 21 | 252 | QSKTAA19G4 | stone-power | HCI544D |  | 155 |
| 22 | 245 | 6M33G715/5 | longkai-power | LSA493S4 |  | 157 |
| 23 | 245 | 6M33D633E310 | acepow-fuan | HC534FS |  | 158 |
| 24 | 245 | TWD1643GE | dingbo | LSA493S4A |  | 161 |
| 25 | 245 | 6M33D572E310 | acepow-fuan | HC534E |  | 162 |
| 26 | 241 | KTAA19G5 | rcg-power | S5L1DC4 |  | 172 |
| 27 | 237 | 6M33D605E200 | jet-power | JET544FS |  | 183 |
| 28 | 237 | TAD1642GEB | jet-power | ECO402L4C |  | 184 |
| 29 | 236 | 2806AE18TTAG4 | voltgent | LL7224J |  | 186 |
| 30 | 235 | 2806AE18TTAG5 | voltgent | LL7224L |  | 188 |

### IB2500092506#0 — top gốc 17, top nhánh 17; ra 1, vào 1; dropped 9 → 11

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 179 | S16R2PTAW | aj-power | MA7014E |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 10 | 115 | S16R2F1PTAW | aj-power | MA7014E |  | 14 |

### IB2500118115#0 — top gốc 30, top nhánh 30; ra 7, vào 7; dropped 458 → 468

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 4 | 204 | WP23D25E200 | elitech-power |  |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 204 | 4DW8123D | victory-generator |  |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 199 | 404D22G | elitech-power |  | MODEL:EPS125PKA3S | không (bị loại; lý do: công cụ không ghi) |
| 8 | 196 | 4DW8128D | minsun-motor | SYA164B |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 188 | 4M06G20/5 | elitech-power |  |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 159 | 4DW8123D | mecca-power |  |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 153 | YND485D | xingguang-jiangsu |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 5 | 196 | 3TNV88GGE | acepow-fuan | BC164C |  | 8 |
| 10 | 181 | JE493DB04 | elitech-power |  |  | 18 |
| 15 | 164 | 4YT2320D | elitech-power |  |  | 23 |
| 22 | 148 | QC480D | elitech-power |  |  | 42 |
| 28 | 136 | LA290 | victory-generator | VDG123 |  | 51 |
| 29 | 135 | YN25GB | acepow-fuan | BC164C |  | 55 |
| 30 | 135 | 403A15G1★ | ettes-power |  |  | 56 |

### IB2500129189#0 — top gốc 30, top nhánh 30; ra 23, vào 23; dropped 624 → 1285

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 287 | 1506AE88TAG3 | sanq-power | UCDI274K |  | không (bị loại; lý do: công cụ không ghi) |
| 3 | 287 | MTA11G2 | sanq-power | UCDI274K |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 287 | NT855GA | sanq-power | UCDI274K |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 284 | NT855GA | stone-power | UCI274H |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 284 | YC6MK350LD20 | huali-shandong | HLF200 |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 281 | YC6MK350D30 | fdk-energy | NIANFENGNF274K |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 281 | YC6MK350LD20 | fdk-energy | NIANFENGNF274K |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 281 | WP10D264E200 | fdk-energy | NIANFENGNF274K |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 278 | WP10D264E200 | longkai-power | LK274K |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 278 | MTA11G2 | longkai-power | LK274K |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 278 | CA6DL230D | wintpower | UCD274K |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 278 | 1206AE70TTAG3 | uleengen | UCD274K |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 275 | 1506AE88TAG3 | voltgent | LL5114H |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 273 | 6M16G275/5 | kaihua-genset | TALA46D |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 269 | MTA11G2A | dingbo | HCI444C1 |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 269 | CA6DL230D | acepow-fuan | UC274K |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 269 | SC9D310D2 | dingbo | 1FC22834 |  | không (bị loại; lý do: công cụ không ghi) |
| 25 | 269 | 1206AE70TTAG3 | koten-power | 274K |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 269 | YM6S4LD | acepow-fuan | UC274K |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 269 | YC6MK350D30 | dingbo | TFW22004A |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 269 | P126TI | uleengen | 274K |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 269 | 1206AE70TTAG2 | bobig-power | BWC4DS |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 269 | YM6H4LFD | acepow-fuan | UC274J |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 1 | 287 | 6LTAA89G2 | fdk-energy | UCDI274K |  | 1 |
| 5 | 279 | 6LTAA89G3 | sanq-power | HCI444D |  | 27 |
| 10 | 271 | QSL9G3 | sanq-power | UCDI274K |  | 56 |
| 11 | 270 | SC9D340D2 | longkai-power | LK274K |  | 63 |
| 12 | 269 | NTA855G1A | stone-power | HCI444D |  | 88 |
| 13 | 262 | 6DTAA89G23 | longkai-power | LK274K |  | 107 |
| 14 | 261 | 6LTAA95G3 | acepow-fuan | 314D |  | 113 |
| 15 | 257 | TAD734GE | dingbo | LSA463S5 |  | 128 |
| 16 | 257 | 6DTAA89G33 | fdk-energy | NIANFENGNF274K |  | 129 |
| 17 | 253 | 6DTAA89G23 | jet-power | JET274K |  | 134 |
| 18 | 253 | TAD841GE | jet-power | ECO382M4C |  | 137 |
| 19 | 247 | 6M12G8D3/5 | rcg-power | UCDI274K |  | 152 |
| 20 | 246 | TAD852GE | jet-power | ECO381L4C |  | 155 |
| 21 | 245 | WP10CD264E200 | uleengen | MPH2004 |  | 156 |
| 22 | 245 | YCA08350D30 | fdk-energy | NIANFENGNFS274K |  | 158 |
| 23 | 242 | 1506AE88TAG4 | sanq-power | HCI444D |  | 167 |
| 24 | 237 | WD129TAD23 | wintpower | LSA462L6 |  | 187 |
| 25 | 237 | YC6M350LD20 | uleengen | 274K |  | 189 |
| 26 | 235 | 6DTAA89G34 | bobig-power | BW314D |  | 197 |
| 27 | 229 | BF6M1015G1A | dingbo | TFW22004 |  | 213 |
| 28 | 229 | TAD754GE | rcg-power | UCDI274K |  | 233 |
| 29 | 229 | 6M12G8D3/5 | voltgent |  |  | 296 |
| 30 | 227 | 1506AE88TAG4 | voltgent | FG26A230 |  | 332 |

### IB2500189675#0 — top gốc 30, top nhánh 30; ra 2, vào 2; dropped 76 → 78

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 22 | 213 | 20M33G2500/5 | westinpower |  |  | có, hạng 144 |
| 26 | 164 | INDIA401661TRG3 | kaihua-genset |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 22 | 224 | 20M33G4D3/5 | kaihua-genset | S7L1DH41 |  | 109 |
| 30 | 125 | 5016ACE61TRG3 | mecca-power |  |  | 442 |

### IB2500206907#0 — top gốc 30, top nhánh 30; ra 25, vào 25; dropped 603 → 1354

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 287 | 1506AE88TAG3 | sanq-power | UCDI274K |  | không (bị loại; lý do: công cụ không ghi) |
| 3 | 287 | MTA11G2 | sanq-power | UCDI274K |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 287 | NT855GA | sanq-power | UCDI274K |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 284 | NT855GA | stone-power | UCI274H |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 284 | YC6MK350LD20 | huali-shandong | HLF200 |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 281 | YC6MK350D30 | fdk-energy | NIANFENGNF274K |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 281 | YC6MK350LD20 | fdk-energy | NIANFENGNF274K |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 281 | WP10D264E200 | fdk-energy | NIANFENGNF274K |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 278 | WP10D264E200 | longkai-power | LK274K |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 278 | MTA11G2 | longkai-power | LK274K |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 278 | 6LTAA89G3 | longkai-power | LK274K |  | có, hạng 14 |
| 16 | 278 | CA6DL230D | wintpower | UCD274K |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 278 | 1206AE70TTAG3 | uleengen | UCD274K |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 275 | 1506AE88TAG3 | voltgent | LL5114H |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 273 | SC9D340D2 | fdk-energy | NIANFENGNF274K |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 273 | 6M16G275/5 | kaihua-genset | TALA46D |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 269 | MTA11G2A | dingbo | HCI444C1 |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 269 | CA6DL230D | acepow-fuan | UC274K |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 269 | SC9D310D2 | dingbo | 1FC22834 |  | không (bị loại; lý do: công cụ không ghi) |
| 25 | 269 | 1206AE70TTAG3 | koten-power | 274K |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 269 | YM6S4LD | acepow-fuan | UC274K |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 269 | YC6MK350D30 | dingbo | TFW22004A |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 269 | P126TI | uleengen | 274K |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 269 | 1206AE70TTAG2 | bobig-power | BWC4DS |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 269 | YM6H4LFD | acepow-fuan | UC274J |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 1 | 287 | 6LTAA89G2 | fdk-energy | UCDI274K |  | 1 |
| 3 | 287 | 6LTAA89G3 | fdk-energy | UCDI274K |  | 13 |
| 5 | 279 | 6LTAA89G3 | sanq-power | HCI444D |  | 27 |
| 9 | 271 | QSL9G3 | sanq-power | UCDI274K |  | 56 |
| 10 | 270 | 6LTAA95G3 | longkai-power | LK444DS |  | 64 |
| 11 | 269 | NTA855G1A | stone-power | HCI444D |  | 88 |
| 12 | 257 | TAD734GE | dingbo | LSA463S5 |  | 128 |
| 13 | 257 | 6DTAA89G33 | fdk-energy | NIANFENGNF274K |  | 129 |
| 14 | 253 | TAD841GE | jet-power | ECO382M4C |  | 137 |
| 15 | 247 | 6M12G8D3/5 | rcg-power | UCDI274K |  | 152 |
| 16 | 245 | WP10CD264E200 | uleengen | MPH2004 |  | 156 |
| 17 | 245 | YCA08350D30 | fdk-energy | NIANFENGNFS274K |  | 158 |
| 18 | 242 | 1506AE88TAG4 | sanq-power | HCI444D |  | 167 |
| 19 | 241 | 6ETAA118G22 | jet-power | JET444E |  | 182 |
| 20 | 237 | WD129TAD23 | wintpower | LSA462L6 |  | 187 |
| 21 | 237 | CA6DL230D/227KW | jet-power | JET274K/200KW |  | 188 |
| 22 | 237 | YC6M350LD20 | uleengen | 274K |  | 189 |
| 23 | 235 | 6DTAA89G34 | bobig-power | BW314D |  | 197 |
| 24 | 229 | BF6M1015G1A | dingbo | TFW22004 |  | 213 |
| 25 | 229 | TAD754GE | rcg-power | UCDI274K |  | 233 |
| 26 | 229 | 6M12G8D3/5 | voltgent |  |  | 301 |
| 27 | 227 | 1506AE88TAG4 | voltgent | FG26A230 |  | 338 |
| 28 | 224 | WD129TAD25 | wintpower | LSA462L9 |  | 347 |
| 29 | 223 | TAD734GE | sr-genset | UCDI274K |  | 348 |
| 30 | 221 | TAD841GE | rcg-power | UCDI274K |  | 361 |

### IB2500222084#0 — top gốc 30, top nhánh 30; ra 13, vào 13; dropped 190 → 348

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 6 | 284 | 4BT39G2 | fdk-energy | S1L2K1 |  | có, hạng 2 |
| 7 | 275 | 4DX2153D | wintpower | PI144J |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 275 | 4TNV98GGE | wintpower | PI144H |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 275 | 4TNV98TGGE | wintpower | PI144J |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 269 | Y4102ZD | tecgen-fujian | TG184S32 |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 269 | Y4105D | acepow-fuan | BC184H |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 269 | Y4105D | tecgen-fujian | TG184S30 |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 269 | Y4102ZD | acepow-fuan | BC184H |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 263 | 4TNV98TGGE | sanq-power | PI144K |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 261 | 4B39G12 | bobig-power | BW184G |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 256 | WP23D48E200 | acepow-fuan | UC224D |  | có, hạng 44 |
| 27 | 250 | Y4102ZLD | acepow-fuan | UC224D |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 241 | 4TNV98GGE | sr-genset | TALA42C |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 7 | 275 | 4BT39G2 | sanq-power | PI144J |  | 17 |
| 13 | 268 | WP23D48E200 | fdk-energy | NIANFENGNF224D |  | 47 |
| 17 | 253 | V3300T | wintpower | PI144J |  | 65 |
| 21 | 241 | 4M08G10D3/5 | rcg-power | TALA42E |  | 77 |
| 22 | 237 | YANGDONGY4105D | yongcai-elecmama | ELECMAMA184J | GENSETMODEL:YCM32YD50PHASENUMBER:3PHASEPOWERFACTOR:08LAGGING | 78 |
| 23 | 237 | YANGDONGY4105D | tecgen-fujian | TGI184S30 |  | 79 |
| 24 | 237 | Y4105D/38KW | jet-power | JET184H/30KW |  | 80 |
| 25 | 237 | JE493ZLDB02/38KW | jet-power | JET184H/30KW |  | 81 |
| 26 | 236 | 4M06G44/5 | rcg-power | S1L2K1 |  | 82 |
| 27 | 229 | YC4D60D25 | kaichen-jiangsu |  |  | 101 |
| 28 | 229 | WP23D33E200 | koten-power |  |  | 130 |
| 29 | 229 | QC4105D | wintpower | WT184G30 |  | 158 |
| 30 | 229 | QC4105D | yongcai-elecmama | ELECMAMA184H |  | 165 |

### IB2500271735#0 — top gốc 23, top nhánh 21; ra 4, vào 2; dropped 26 → 29

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 216 | 1506AE88TAG2 | powerco-systems |  | PCS225P(PRIME)1506AE88TAG2225180250200 | không (bị loại; lý do: công cụ không ghi) |
| 12 | 123 | 1506AE88TAG1 | tecnogen |  |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 121 | 1506AE88TAG2 | tecnogen |  |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 65 | NEF67TM7 | mase-generators |  | •POTENZATRIFASE(EMERGENZA):220KVA400V•FATTOREDIPOTENZA:COSФ0,8 | có, hạng 27 |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 19 | 75 | NEF67TM7 | tecnogen |  |  | 23 |
| 20 | 75 | 6068HFU82 | tecnogen |  |  | 24 |

### IB2500281552#0 — top gốc 30, top nhánh 30; ra 5, vào 5; dropped 922 → 964

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 281 | YC12VTD2000D30 | fdk-energy | NIANFENGNF454C |  | không (bị loại; lý do: công cụ không ghi) |
| 2 | 281 | 12M33G1650/5 | longkai-power | LSA502L8 |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 269 | YC12VTD2000D30 | uleengen | TCU428G |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 241 | 12M33G1650/5 | rcg-power | LSA502L8 |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 229 | QSK38G31 | voltgent |  |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 12 | 257 | 12V4000G23F | uleengen | LSA502L8 |  | 39 |
| 22 | 240 | 12KTA58G34 | fdk-energy | NIANFENGNF454D |  | 62 |
| 27 | 217 | INDIA401246TAG2A | kaihua-genset | S7L1DC41 |  | 138 |
| 28 | 217 | UK401246TAG2A | kaihua-genset | S7L1DC41 |  | 139 |
| 30 | 213 | YCTD40TA2000G30 | byc-power | 734C |  | 168 |

### IB2500474803#0 — top gốc 30, top nhánh 30; ra 19, vào 19; dropped 1038 → 1682

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 2 | 287 | 2506CE15TAG1 | gb-power | HCI544C | STANDARDFEATURES | không (bị loại; lý do: công cụ không ghi) |
| 3 | 287 | 2506CE15TAG2 | gb-power | HCI544C | STANDARDFEATURES | không (bị loại; lý do: công cụ không ghi) |
| 4 | 287 | KTA19G3A | yongcai-elecmama | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 287 | KTA19G3 | sanq-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 287 | KTA19G3 | stone-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 287 | 2506CE15TAG1 | sanq-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 284 | 2506CE15TAG2 | huali-shandong | HLF400 |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 284 | TAD1651GE | jet-power | HCI544D |  | không (bị loại; lý do: công cụ không ghi) |
| 16 | 284 | KTA19G3A | sanq-power | HCI544D |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 281 | YC6T660D31 | fdk-energy | NIANFENGNF354D |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 278 | TAD1651GE | dingbo | LSA472M7 |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 278 | 6KTAA25G36 | longkai-power | LK544C |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 268 | 6KTAA25G310 | fdk-energy | NIANFENGNF354E |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 268 | YC6TD780D31 | fdk-energy | NIANFENGNF354E |  | không (bị loại; lý do: công cụ không ghi) |
| 25 | 263 | 6KTAA25G35 | longkai-power | LK544E |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 263 | 6M33D572E200 | longkai-power | LK544E |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 262 | TAD1641GE | dingbo | LSA472M7 |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 259 | 2806CE18TAG1A | bobig-power | BWC5F |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 256 | YC6TD780D31 | dingbo | TFW24504A |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 8 | 284 | KTA19G4 | sanq-power | HCI544D |  | 27 |
| 9 | 281 | QSZ13G10 | fdk-energy | S5L1DC41 |  | 39 |
| 11 | 278 | QSZ13G10 | longkai-power | LK544C |  | 67 |
| 13 | 275 | 6ZTAA13G4 | sunkings | DC24V |  | 70 |
| 16 | 261 | YC6T600LD22 | fdk-energy | NIANFENGNFS4J |  | 123 |
| 17 | 253 | YC6T660LD20 | wintpower | WT544D |  | 137 |
| 18 | 253 | YC6T660LD20 | fdk-energy | NIANFENGNFS5D |  | 138 |
| 19 | 253 | 6M26D447E200 | jet-power | JET544C |  | 147 |
| 20 | 245 | TAD1641GEB | jet-power | ECO403S4C |  | 160 |
| 21 | 244 | YC6TD780LD20 | wintpower | WT544E |  | 162 |
| 22 | 237 | 6M33D506E310 | acepow-fuan | HC534D |  | 181 |
| 23 | 233 | YC6T600LD22 | penlucky | TALA473B |  | 191 |
| 24 | 229 | 6KTAA25G311 | rcg-power | WR544C |  | 204 |
| 25 | 227 | 6M33D572E310 | acepow-fuan | HC534E |  | 356 |
| 26 | 223 | 2506CE15TAG3 | kaihua-genset | HCI544D1 |  | 381 |
| 27 | 221 | K25G829D | jet-power | JET544D |  | 385 |
| 28 | 221 | CATC15 | rise-power | LC6115F |  | 388 |
| 29 | 220 | WP13D510E3116M21G460/6 | kaihua-genset | S4L1DF41 |  | 410 |
| 30 | 217 | TAD1641GEB | sr-genset | S5L1DC4 |  | 426 |

### IB2600072892#0 — top gốc 30, top nhánh 30; ra 25, vào 25; dropped 603 → 1354

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 287 | 1506AE88TAG3 | sanq-power | UCDI274K |  | không (bị loại; lý do: công cụ không ghi) |
| 3 | 287 | MTA11G2 | sanq-power | UCDI274K |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 287 | NT855GA | sanq-power | UCDI274K |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 284 | NT855GA | stone-power | UCI274H |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 284 | YC6MK350LD20 | huali-shandong | HLF200 |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 281 | YC6MK350D30 | fdk-energy | NIANFENGNF274K |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 281 | YC6MK350LD20 | fdk-energy | NIANFENGNF274K |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 281 | WP10D264E200 | fdk-energy | NIANFENGNF274K |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 278 | WP10D264E200 | longkai-power | LK274K |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 278 | MTA11G2 | longkai-power | LK274K |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 278 | 6LTAA89G3 | longkai-power | LK274K |  | có, hạng 14 |
| 16 | 278 | CA6DL230D | wintpower | UCD274K |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 278 | 1206AE70TTAG3 | uleengen | UCD274K |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 275 | 1506AE88TAG3 | voltgent | LL5114H |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 273 | SC9D340D2 | fdk-energy | NIANFENGNF274K |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 273 | 6M16G275/5 | kaihua-genset | TALA46D |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 269 | MTA11G2A | dingbo | HCI444C1 |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 269 | CA6DL230D | acepow-fuan | UC274K |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 269 | SC9D310D2 | dingbo | 1FC22834 |  | không (bị loại; lý do: công cụ không ghi) |
| 25 | 269 | 1206AE70TTAG3 | koten-power | 274K |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 269 | YM6S4LD | acepow-fuan | UC274K |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 269 | YC6MK350D30 | dingbo | TFW22004A |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 269 | P126TI | uleengen | 274K |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 269 | 1206AE70TTAG2 | bobig-power | BWC4DS |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 269 | YM6H4LFD | acepow-fuan | UC274J |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 1 | 287 | 6LTAA89G2 | fdk-energy | UCDI274K |  | 1 |
| 3 | 287 | 6LTAA89G3 | fdk-energy | UCDI274K |  | 13 |
| 5 | 279 | 6LTAA89G3 | sanq-power | HCI444D |  | 27 |
| 9 | 271 | QSL9G3 | sanq-power | UCDI274K |  | 56 |
| 10 | 270 | 6LTAA95G3 | longkai-power | LK444DS |  | 64 |
| 11 | 269 | NTA855G1A | stone-power | HCI444D |  | 88 |
| 12 | 257 | TAD734GE | dingbo | LSA463S5 |  | 128 |
| 13 | 257 | 6DTAA89G33 | fdk-energy | NIANFENGNF274K |  | 129 |
| 14 | 253 | TAD841GE | jet-power | ECO382M4C |  | 137 |
| 15 | 247 | 6M12G8D3/5 | rcg-power | UCDI274K |  | 152 |
| 16 | 245 | WP10CD264E200 | uleengen | MPH2004 |  | 156 |
| 17 | 245 | YCA08350D30 | fdk-energy | NIANFENGNFS274K |  | 158 |
| 18 | 242 | 1506AE88TAG4 | sanq-power | HCI444D |  | 167 |
| 19 | 241 | 6ETAA118G22 | jet-power | JET444E |  | 182 |
| 20 | 237 | WD129TAD23 | wintpower | LSA462L6 |  | 187 |
| 21 | 237 | CA6DL230D/227KW | jet-power | JET274K/200KW |  | 188 |
| 22 | 237 | YC6M350LD20 | uleengen | 274K |  | 189 |
| 23 | 235 | 6DTAA89G34 | bobig-power | BW314D |  | 197 |
| 24 | 229 | BF6M1015G1A | dingbo | TFW22004 |  | 213 |
| 25 | 229 | TAD754GE | rcg-power | UCDI274K |  | 233 |
| 26 | 229 | 6M12G8D3/5 | voltgent |  |  | 301 |
| 27 | 227 | 1506AE88TAG4 | voltgent | FG26A230 |  | 338 |
| 28 | 224 | WD129TAD25 | wintpower | LSA462L9 |  | 347 |
| 29 | 223 | TAD734GE | sr-genset | UCDI274K |  | 348 |
| 30 | 221 | TAD841GE | rcg-power | UCDI274K |  | 361 |

### IB2600470479#0 — top gốc 30, top nhánh 30; ra 25, vào 25; dropped 603 → 1354

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 287 | 1506AE88TAG3 | sanq-power | UCDI274K |  | không (bị loại; lý do: công cụ không ghi) |
| 3 | 287 | MTA11G2 | sanq-power | UCDI274K |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 287 | NT855GA | sanq-power | UCDI274K |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 284 | NT855GA | stone-power | UCI274H |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 284 | YC6MK350LD20 | huali-shandong | HLF200 |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 281 | YC6MK350D30 | fdk-energy | NIANFENGNF274K |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 281 | YC6MK350LD20 | fdk-energy | NIANFENGNF274K |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 281 | WP10D264E200 | fdk-energy | NIANFENGNF274K |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 278 | WP10D264E200 | longkai-power | LK274K |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 278 | MTA11G2 | longkai-power | LK274K |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 278 | 6LTAA89G3 | longkai-power | LK274K |  | có, hạng 14 |
| 16 | 278 | CA6DL230D | wintpower | UCD274K |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 278 | 1206AE70TTAG3 | uleengen | UCD274K |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 275 | 1506AE88TAG3 | voltgent | LL5114H |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 273 | SC9D340D2 | fdk-energy | NIANFENGNF274K |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 273 | 6M16G275/5 | kaihua-genset | TALA46D |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 269 | MTA11G2A | dingbo | HCI444C1 |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 269 | CA6DL230D | acepow-fuan | UC274K |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 269 | SC9D310D2 | dingbo | 1FC22834 |  | không (bị loại; lý do: công cụ không ghi) |
| 25 | 269 | 1206AE70TTAG3 | koten-power | 274K |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 269 | YM6S4LD | acepow-fuan | UC274K |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 269 | YC6MK350D30 | dingbo | TFW22004A |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 269 | P126TI | uleengen | 274K |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 269 | 1206AE70TTAG2 | bobig-power | BWC4DS |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 269 | YM6H4LFD | acepow-fuan | UC274J |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 1 | 287 | 6LTAA89G2 | fdk-energy | UCDI274K |  | 1 |
| 3 | 287 | 6LTAA89G3 | fdk-energy | UCDI274K |  | 13 |
| 5 | 279 | 6LTAA89G3 | sanq-power | HCI444D |  | 27 |
| 9 | 271 | QSL9G3 | sanq-power | UCDI274K |  | 56 |
| 10 | 270 | 6LTAA95G3 | longkai-power | LK444DS |  | 64 |
| 11 | 269 | NTA855G1A | stone-power | HCI444D |  | 88 |
| 12 | 257 | TAD734GE | dingbo | LSA463S5 |  | 128 |
| 13 | 257 | 6DTAA89G33 | fdk-energy | NIANFENGNF274K |  | 129 |
| 14 | 253 | TAD841GE | jet-power | ECO382M4C |  | 137 |
| 15 | 247 | 6M12G8D3/5 | rcg-power | UCDI274K |  | 152 |
| 16 | 245 | WP10CD264E200 | uleengen | MPH2004 |  | 156 |
| 17 | 245 | YCA08350D30 | fdk-energy | NIANFENGNFS274K |  | 158 |
| 18 | 242 | 1506AE88TAG4 | sanq-power | HCI444D |  | 167 |
| 19 | 241 | 6ETAA118G22 | jet-power | JET444E |  | 182 |
| 20 | 237 | WD129TAD23 | wintpower | LSA462L6 |  | 187 |
| 21 | 237 | CA6DL230D/227KW | jet-power | JET274K/200KW |  | 188 |
| 22 | 237 | YC6M350LD20 | uleengen | 274K |  | 189 |
| 23 | 235 | 6DTAA89G34 | bobig-power | BW314D |  | 197 |
| 24 | 229 | BF6M1015G1A | dingbo | TFW22004 |  | 213 |
| 25 | 229 | TAD754GE | rcg-power | UCDI274K |  | 233 |
| 26 | 229 | 6M12G8D3/5 | voltgent |  |  | 301 |
| 27 | 227 | 1506AE88TAG4 | voltgent | FG26A230 |  | 338 |
| 28 | 224 | WD129TAD25 | wintpower | LSA462L9 |  | 347 |
| 29 | 223 | TAD734GE | sr-genset | UCDI274K |  | 348 |
| 30 | 221 | TAD841GE | rcg-power | UCDI274K |  | 361 |

### IB2600478079#0 — top gốc 30, top nhánh 30; ra 26, vào 26; dropped 919 → 2240

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 1 | 284 | 2206CE13TAG3 | kaihua-genset | S4L1DF41 |  | không (bị loại; lý do: công cụ không ghi) |
| 2 | 284 | 2206CE13TAG3 | sanq-power | HCI444E |  | không (bị loại; lý do: công cụ không ghi) |
| 3 | 281 | 2206CE13TAG2 | sanq-power | HCI444ES |  | không (bị loại; lý do: công cụ không ghi) |
| 4 | 281 | YC6K520D30 | fdk-energy | NIANFENGNF314H |  | không (bị loại; lý do: công cụ không ghi) |
| 5 | 281 | WP13D385E200 | fdk-energy | NIANFENGNF314H |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 281 | SC13E550D2 | fdk-energy | NIANFENGNF314H |  | không (bị loại; lý do: công cụ không ghi) |
| 7 | 281 | 6ETAA128G32 | fdk-energy | NIANFENGNF314H |  | không (bị loại; lý do: công cụ không ghi) |
| 8 | 281 | 6ZTAA13G2 | koten-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 9 | 278 | TAD1355GE | jet-power | HCI444F |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 278 | QSZ13G7 | longkai-power | LK444F |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 278 | NTAA855G7A | stone-power | HCI444F |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 278 | WP13D405E200 | longkai-power | LK444F |  | không (bị loại; lý do: công cụ không ghi) |
| 14 | 278 | NTAA855G7A | sanq-power | HCI444F |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 278 | 6ETAA128G32 | longkai-power | LK444F |  | không (bị loại; lý do: công cụ không ghi) |
| 17 | 278 | 6ZTAA13G4 | koten-power | HCI544C |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 278 | NTAA855G7 | uleengen | HCI444F |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 275 | 6ZTAA13G2 | stone-power | HCI444E |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 272 | P158LE | rise-power | LSA472S5 |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 269 | WP13D405E200 | jet-power | JET444F |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 269 | YM6S9LFDA | acepow-fuan | HC434FS |  | không (bị loại; lý do: công cụ không ghi) |
| 25 | 269 | YM6S9LFD | acepow-fuan | HC434F |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 269 | TAD1344GEB | jet-power | ECO401S4C |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 269 | TAD1355GE | dingbo | LSA472S5 |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 269 | YM6S9LDB | acepow-fuan | HC434ES |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 268 | 6M21G440/5 | kaihua-genset | S4L1DF41 |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 268 | 2506CE15TAG1 | kaihua-genset | S4L1DG41 |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 1 | 284 | QSNTG3 | fdk-energy | S4L1DF41 |  | 5 |
| 6 | 264 | YC6T600LD22 | wintpower | WT544C |  | 118 |
| 7 | 261 | 6ETAA128G22 | jet-power | JET444FS |  | 120 |
| 8 | 261 | 6ETAA128G21 | jet-power | JET444F |  | 121 |
| 9 | 260 | KTA19G2 | bobig-power | BW314F |  | 130 |
| 10 | 259 | TAD1650GE | dingbo | LSA472M7 |  | 140 |
| 11 | 258 | QSX15G6 | sanq-power | HCI544C |  | 143 |
| 12 | 257 | YC6T550LD21 | wintpower | WT544C |  | 145 |
| 13 | 256 | TAD1650GE | jet-power | ECO402S4C |  | 148 |
| 14 | 252 | YC6T600LD22 | dingbo | TFW23504A |  | 166 |
| 15 | 252 | QSX15G6 | fdk-energy | S4L1DG41 |  | 170 |
| 16 | 249 | 2206DE13TAG2 | kaihua-genset | S4L1DE41 |  | 174 |
| 17 | 248 | NTA855G7A | tecgen-fujian | TGI314S320 |  | 176 |
| 18 | 247 | 2206DE13TAG3 | kaihua-genset | S4L1DF41 |  | 181 |
| 19 | 245 | YC6T550LD21 | dingbo | TFW23204A |  | 182 |
| 20 | 243 | WD269TD35 | wintpower | LSA472S4 |  | 185 |
| 21 | 241 | NTA855G1B | penlucky | S4L1DE41 |  | 186 |
| 22 | 240 | 6M26D447E200 | acepow-fuan | HC534C |  | 192 |
| 23 | 238 | BF8M1015CLAG1 | sanq-power | HCI544C |  | 194 |
| 24 | 236 | WD269TAD41 | wintpower | LSA472M7 |  | 196 |
| 25 | 229 | 2206CE13TAG2L | sr-genset | S4L1DE4 |  | 219 |
| 26 | 229 | TBD236V8 | rise-power | LSA472S5 |  | 308 |
| 27 | 228 | BF8M1015CPLAG | sanq-power | HCI544C |  | 323 |
| 28 | 228 | KTA19DM | uleengen | MPH3504 |  | 324 |
| 29 | 226 | 6ETAA118G31 | fudiankang-hunan |  | FDKGENSETMODEL:FDKSC413V1/H1 | 339 |
| 30 | 224 | 6M21G6D3/5 | rcg-power | TALA473B |  | 345 |

### IB2600549116#0 — top gốc 30, top nhánh 30; ra 20, vào 20; dropped 722 → 1151

Ra khỏi top 30 (hạng cũ trong top gốc; còn trong all nhánh không):

| hạng cũ | điểm | hãng/động cơ | NCC | alt | dòng | trong all nhánh |
|---|---|---|---|---|---|---|
| 4 | 278 | SC7H220D2 | longkai-power | LK274F |  | không (bị loại; lý do: công cụ không ghi) |
| 6 | 272 | SC7H230D2 | longkai-power | LK274G |  | không (bị loại; lý do: công cụ không ghi) |
| 10 | 269 | SC7H230D2 | jet-power | JET274F |  | không (bị loại; lý do: công cụ không ghi) |
| 11 | 269 | LR6B3LD | acepow-fuan | UC274E |  | không (bị loại; lý do: công cụ không ghi) |
| 12 | 267 | LR6M3LD | acepow-fuan | UC274F |  | không (bị loại; lý do: công cụ không ghi) |
| 13 | 267 | CA6DL124D | wintpower | UCI274G |  | không (bị loại; lý do: công cụ không ghi) |
| 15 | 265 | WP6D167E200 | longkai-power | LK274G |  | không (bị loại; lý do: công cụ không ghi) |
| 18 | 263 | WP6D167E200 | jet-power | JET274G |  | không (bị loại; lý do: công cụ không ghi) |
| 19 | 263 | YC6A245LD21 | fdk-energy | NIANFENGNF274H |  | không (bị loại; lý do: công cụ không ghi) |
| 20 | 263 | YC6A245D30 | fdk-energy | NIANFENGNF274H |  | không (bị loại; lý do: công cụ không ghi) |
| 21 | 263 | SC7H250D2 | fdk-energy | NIANFENGNF274H |  | không (bị loại; lý do: công cụ không ghi) |
| 22 | 261 | BF6M1013ECG1 | acepow-fuan | UC274ES |  | không (bị loại; lý do: công cụ không ghi) |
| 23 | 258 | TAD752GE | jet-power | UCI274H |  | không (bị loại; lý do: công cụ không ghi) |
| 24 | 252 | BF6M1013ECG2 | acepow-fuan | UC274G |  | không (bị loại; lý do: công cụ không ghi) |
| 25 | 252 | 1106A70TAG4 | huali-shandong | HLF150 |  | không (bị loại; lý do: công cụ không ghi) |
| 26 | 252 | SC7H250D2 | dingbo | 1FC22824 |  | không (bị loại; lý do: công cụ không ghi) |
| 27 | 252 | YC6A245D30 | dingbo | TFW21504A |  | không (bị loại; lý do: công cụ không ghi) |
| 28 | 252 | 1106A70TAG4 | dingbo | MP1604A |  | không (bị loại; lý do: công cụ không ghi) |
| 29 | 251 | CA6DL124D | bobig-power | BW274G |  | không (bị loại; lý do: công cụ không ghi) |
| 30 | 251 | YC6A245LD21 | wintpower | WT274H |  | không (bị loại; lý do: công cụ không ghi) |

Vào top 30 (hạng mới; hạng cũ trong all gốc):

| hạng mới | điểm | hãng/động cơ | NCC | alt | dòng | hạng cũ trong all gốc |
|---|---|---|---|---|---|---|
| 11 | 244 | YC6A230LD20 | wintpower | WT274G |  | 98 |
| 12 | 242 | 1106CP6TAG3 | wintpower | UCI274F |  | 99 |
| 13 | 239 | 6HTAA65G33 | fdk-energy | NIANFENGNF274H |  | 102 |
| 14 | 236 | YC6A230D30 | dingbo | TFW21404A |  | 104 |
| 15 | 229 | QSB67G3 | eastern-lion-fuan | EL274F |  | 123 |
| 16 | 228 | TAD732GE | dingbo | LSA443L13 |  | 128 |
| 17 | 227 | 1106CP6TAG3 | jet-power | JET274F1 |  | 130 |
| 18 | 227 | WP10CD200E200 | uleengen | MPH1504 |  | 134 |
| 19 | 220 | R6113ZLD | sunny-weifang | TFW1504 |  | 180 |
| 20 | 219 | CA6DL124/176KW | jet-power | JET274H/160KW |  | 181 |
| 21 | 219 | R6113ZLD | jet-power | JET274G |  | 182 |
| 22 | 219 | R6110ZLD | uleengen | 274G |  | 184 |
| 23 | 219 | 6LTAA89GM200 | uleengen | MPH1504 |  | 185 |
| 24 | 218 | 6M12G2D3/5 | rcg-power | UCI274H |  | 188 |
| 25 | 217 | TAD731GE | rcg-power | UCI274F |  | 189 |
| 26 | 216 | WD129TD16 | wintpower | LSA462M5 |  | 240 |
| 27 | 213 | 1106DE70TAG3 | rise-power |  |  | 255 |
| 28 | 213 | SC8D220D2 | rise-power |  |  | 258 |
| 29 | 213 | SC8D220D2 | wintpower |  |  | 259 |
| 30 | 211 | 1106DE70TAG2 | rise-power |  |  | 274 |
