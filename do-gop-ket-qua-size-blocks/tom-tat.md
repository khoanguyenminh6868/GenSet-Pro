# Đo top 30 ứng viên: gốc vs PR #1066 (size-blocks)

Gốc main 1ab27de7c85b50531327dbf45dfcc78c7a7a8313, đầu PR #1066 ebee0f9bf585cab217395890516bfb423b8f9b59. Cùng một bản bidhist (tải lúc 2026-11-21T18:28:21.063Z), cùng cn; 928 gói, 1093 lượt so được (chỉ một bên: 0; lỗi: 0).

- Giống hệt (top, điểm, all, số dropped): **1073**
- Đổi tập (dòng ra/vào top hoặc all): **20**
- Chỉ đổi thứ tự / điểm / số dropped (cùng tập): **0**
- Tổng `dropped`: gốc 401827, nhánh 404820

## Số dòng
- Ra khỏi `all`: **3164**; vào `all`: **183**
- Ra khỏi top 30: **127**; vào top 30: **122**

Ghi chú: "luật loại" lấy từ `rowflag` trong tệp kết quả (công cụ chỉ ghi rowflag, không ghi luật khác); hạng cũ/mới: số trong top 30, hoặc `all#n` = hạng trong `all` của phía kia.

## Theo NCC (ra top 30)
- sanq-power: 15
- fdk-energy: 13
- longkai-power: 13
- jet-power: 10
- uleengen: 9
- acepow-fuan: 9
- kaihua-genset: 7
- stone-power: 6
- elitech-power: 6
- minsun-motor: 4
- wintpower: 4
- tecgen-fujian: 4
- bobig-power: 3
- dingbo: 3
- hosem-power: 2
- rise-power: 2
- comappower: 2
- voltgent: 2
- sr-genset: 1
- koten-power: 1
- westinpower: 1
- kingway-power: 1
- agg-fuzhou: 1
- lees-power: 1
- victory-generator: 1
- mecca-power: 1
- suneco-linyi: 1
- excel-power-ningde: 1
- world-power-fuzhou: 1
- genlitec: 1
- huali-shandong: 1

## Theo NCC (vào top 30)
- jet-power: 14
- wintpower: 10
- fdk-energy: 10
- uleengen: 9
- elitech-power: 9
- longkai-power: 9
- sanq-power: 7
- acepow-fuan: 6
- victory-generator: 5
- minsun-motor: 4
- eastern-lion-fuan: 4
- koten-power: 3
- comappower: 3
- gb-power: 3
- bobig-power: 2
- kente-power: 2
- jianghao-genset: 2
- tecgen-fujian: 2
- kaihua-genset: 2
- penlucky: 2
- rcg-power: 2
- dingbo: 1
- gordon-power: 1
- byc-power: 1
- aosif: 1
- huaquan-power: 1
- sr-genset: 1
- rise-power: 1
- baifa-power: 1
- mecca-power: 1
- landtop-fuzhou: 1
- stone-power: 1
- yongcai-elecmama: 1

## Các lượt đổi (20)
| lượt | loại | ra top | vào top | ra all | vào all | dropped gốc→nhánh |
|---|---|---|---|---|---|---|
| IB2200070865#0 | doi-tap | 0 | 0 | 6 | 0 | 663→669 |
| IB2200100465#0 | doi-tap | 27 | 27 | 290 | 0 | 946→1236 |
| IB2300102941#0 | doi-tap | 6 | 6 | 149 | 0 | 79→228 |
| IB2300102941#1 | doi-tap | 2 | 2 | 16 | 0 | 77→93 |
| IB2300163186#2 | doi-tap | 3 | 3 | 108 | 0 | 58→166 |
| IB2300163186#3 | doi-tap | 26 | 26 | 1437 | 0 | 100→1544 |
| IB2300163844#1 | doi-tap | 10 | 10 | 314 | 0 | 349→664 |
| IB2300356962#1 | doi-tap | 4 | 4 | 191 | 0 | 0→191 |
| IB2400100405#0 | doi-tap | 3 | 3 | 3 | 0 | 377→380 |
| IB2400145438#2 | doi-tap | 8 | 8 | 65 | 0 | 0→65 |
| IB2400145438#3 | doi-tap | 10 | 10 | 0 | 183 | 185→2 |
| IB2400375383#0 | doi-tap | 4 | 4 | 132 | 0 | 587→721 |
| IB2400375383#1 | doi-tap | 1 | 1 | 53 | 0 | 2161→2214 |
| IB2400427929#0 | doi-tap | 5 | 0 | 8 | 0 | 171→179 |
| IB2400427929#1 | doi-tap | 0 | 0 | 8 | 0 | 258→266 |
| IB2400427929#2 | doi-tap | 7 | 7 | 127 | 0 | 90→217 |
| IB2400448320#0 | doi-tap | 4 | 4 | 132 | 0 | 587→721 |
| IB2400448320#1 | doi-tap | 1 | 1 | 53 | 0 | 2161→2214 |
| IB2500114642#2 | doi-tap | 0 | 0 | 27 | 0 | 64→91 |
| IB2500222084#0 | doi-tap | 6 | 6 | 45 | 0 | 190→235 |

## Mọi dòng ra / vào top 30 của các lượt đổi tập (249)
| lượt | | động cơ (mã; khoá không chứa hãng) | NCC | hạng cũ | hạng mới | luật loại |
|---|---|---|---|---|---|---|
| IB2200100465#0 | RA | WP41D80E200 | uleengen | 1 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | CA4DF212D | uleengen | 2 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | LR4B3ZD | acepow-fuan | 3 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | SC4H115D2 | fdk-energy | 4 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | 4HTAA43G33 | fdk-energy | 5 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | 4BTA39G11 | stone-power | 6 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | 4BTA39G13 | longkai-power | 7 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | SC4H115D2 | longkai-power | 8 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | 1104C44TAG1 | sanq-power | 9 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | 1104A44TG2 | sanq-power | 10 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | BF4M2012CG1 | acepow-fuan | 11 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | CA4DF212D | acepow-fuan | 12 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | 4BTA39G11 | bobig-power | 13 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | Y4110ZLD | acepow-fuan | 14 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | 4HT43G23 | longkai-power | 15 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | TAD530GE | dingbo | 17 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | WP4CD100E200 | uleengen | 19 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | 1104A44TG2 | sr-genset | 20 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | WP41D80E200 | minsun-motor | 21 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | 1104A44TG1 | minsun-motor | 22 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | WP41D80E201 | minsun-motor | 24 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | 4ZTAA41G21 | minsun-motor | 25 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | LR4M3LD | koten-power | 26 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | 1104C44TAG1 | westinpower | 27 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | 1104C44TAG2 | elitech-power | 28 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | BF4M2012CG1 | elitech-power | 29 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | RA | BF4M2012C | kingway-power | 30 | ra khỏi all | khác/không ghi |
| IB2200100465#0 | VÀO | YC4D100ZD20 | minsun-motor | all#91 | 4 | - |
| IB2200100465#0 | VÀO | YC4A100ZD20 | minsun-motor | all#92 | 5 | - |
| IB2200100465#0 | VÀO | R4110AZLD | jet-power | all#93 | 6 | - |
| IB2200100465#0 | VÀO | WP41CD83E200 | uleengen | all#109 | 7 | - |
| IB2200100465#0 | VÀO | YC6108ZC | uleengen | all#111 | 8 | - |
| IB2200100465#0 | VÀO | CA4F212DYFD10W | acepow-fuan | all#125 | 9 | - |
| IB2200100465#0 | VÀO | CA4F212DYFD10W | bobig-power | all#126 | 10 | - |
| IB2200100465#0 | VÀO | YC4A140LD20 | elitech-power | all#141 | 11 | - |
| IB2200100465#0 | VÀO | 4RT5588D | koten-power | all#144 | 12 | - |
| IB2200100465#0 | VÀO | 4RT5588D | elitech-power | all#146 | 13 | - |
| IB2200100465#0 | VÀO | BF6L913D | victory-generator | all#148 | 14 | - |
| IB2200100465#0 | VÀO | R4105ZLD | minsun-motor | all#152 | 15 | - |
| IB2200100465#0 | VÀO | N4105ZLDS | kente-power | all#154 | 16 | - |
| IB2200100465#0 | VÀO | R4105BZLDS | kente-power | all#155 | 17 | - |
| IB2200100465#0 | VÀO | 4RT5588D | wintpower | all#166 | 18 | - |
| IB2200100465#0 | VÀO | 4BTA39G2(G52E1) | comappower | all#181 | 19 | - |
| IB2200100465#0 | VÀO | TAD55OGE | comappower | all#182 | 20 | - |
| IB2200100465#0 | VÀO | R6105AZD | eastern-lion-fuan | all#183 | 21 | - |
| IB2200100465#0 | VÀO | LR4M3D | elitech-power | all#191 | 22 | - |
| IB2200100465#0 | VÀO | YC4D100ZD20 | jianghao-genset | all#195 | 23 | - |
| IB2200100465#0 | VÀO | YC4D90ZD20 | jianghao-genset | all#196 | 24 | - |
| IB2200100465#0 | VÀO | YC4A110ZD20 | elitech-power | all#202 | 25 | - |
| IB2200100465#0 | VÀO | YC4A115D30 | eastern-lion-fuan | all#205 | 26 | - |
| IB2200100465#0 | VÀO | CA4F212DYFD10W | longkai-power | all#207 | 27 | - |
| IB2200100465#0 | VÀO | 4100AZLD | eastern-lion-fuan | all#208 | 28 | - |
| IB2200100465#0 | VÀO | R4108IZLD | eastern-lion-fuan | all#212 | 29 | - |
| IB2200100465#0 | VÀO | 4105ZLD | uleengen | all#226 | 30 | - |
| IB2300102941#0 | RA | 403A15G2 | sanq-power | 3 | ra khỏi all | khác/không ghi |
| IB2300102941#0 | RA | 403A15G2 | jet-power | 4 | ra khỏi all | khác/không ghi |
| IB2300102941#0 | RA | 403A15G2 | kaihua-genset | 5 | ra khỏi all | khác/không ghi |
| IB2300102941#0 | RA | 403D15G | sanq-power | 6 | ra khỏi all | khác/không ghi |
| IB2300102941#0 | RA | D1703 | wintpower | 13 | ra khỏi all | khác/không ghi |
| IB2300102941#0 | RA | V1505 | wintpower | 14 | ra khỏi all | khác/không ghi |
| IB2300102941#0 | VÀO | 4TNV84TGGE | wintpower | all#45 | 21 | - |
| IB2300102941#0 | VÀO | 4TNV84TGGE | sanq-power | all#51 | 23 | - |
| IB2300102941#0 | VÀO | 4DW9129D | wintpower | all#52 | 24 | - |
| IB2300102941#0 | VÀO | YSD490D | tecgen-fujian | all#61 | 28 | - |
| IB2300102941#0 | VÀO | YD485D/17KW | jet-power | all#62 | 29 | - |
| IB2300102941#0 | VÀO | 404A22G | gb-power | all#65 | 30 | - |
| IB2300102941#1 | RA | 403A15G2 | sanq-power | 3 | ra khỏi all | khác/không ghi |
| IB2300102941#1 | RA | 403A15G2 | kaihua-genset | 27 | ra khỏi all | khác/không ghi |
| IB2300102941#1 | VÀO | K4100D | jet-power | all#53 | 29 | - |
| IB2300102941#1 | VÀO | V2203 | wintpower | all#54 | 30 | - |
| IB2300163186#2 | RA | 4BTA39G11 | stone-power | 2 | ra khỏi all | khác/không ghi |
| IB2300163186#2 | RA | 4BTA39G13 | longkai-power | 19 | ra khỏi all | khác/không ghi |
| IB2300163186#2 | RA | 4BTA39G13 | bobig-power | 25 | ra khỏi all | khác/không ghi |
| IB2300163186#2 | VÀO | 1104C44TAG2 | jet-power | all#9 | 5 | - |
| IB2300163186#2 | VÀO | SC4H160D2 | jet-power | all#91 | 29 | - |
| IB2300163186#2 | VÀO | LR4M3LD | acepow-fuan | all#92 | 30 | - |
| IB2300163186#3 | RA | 1106A70TAG3 | sanq-power | 1 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | 1106A70TAG4 | tecgen-fujian | 2 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | 6CTAA83G2 | sanq-power | 3 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | 6CTAA83G2 | stone-power | 4 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | 6CTAA83G2 | stone-power | 5 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | 1106A70TAG4 | sanq-power | 6 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | 1106A70TAG3 | jet-power | 8 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | 6CTA83G1 | sanq-power | 9 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | CA6DL124D | wintpower | 10 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | 6CTA83G2 | stone-power | 11 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | 6CTA83G1 | stone-power | 12 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | 6CTA83G2 | hosem-power | 13 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | YC6A275D30 | fdk-energy | 14 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | SC8D280D2 | fdk-energy | 16 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | 1206AE70TTAG1 | tecgen-fujian | 17 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | YCD6Q33H6260 | fdk-energy | 18 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | SC8D280D2 | longkai-power | 19 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | WP6D167E200 | longkai-power | 20 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | SC7H250D2 | longkai-power | 21 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | TAD753GE | jet-power | 22 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | TAD752GE | jet-power | 23 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | BF6M1013FCG3 | acepow-fuan | 25 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | P086TI | rise-power | 27 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | SC7H250D2 | jet-power | 28 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | BF6M1013FCG2 | acepow-fuan | 29 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | RA | CA6DL124D | bobig-power | 30 | ra khỏi all | khác/không ghi |
| IB2300163186#3 | VÀO | YC6A245LD21 | fdk-energy | all#49 | 3 | - |
| IB2300163186#3 | VÀO | WP10D200E200 | longkai-power | all#54 | 4 | - |
| IB2300163186#3 | VÀO | NT855GA | fdk-energy | all#70 | 5 | - |
| IB2300163186#3 | VÀO | NT855GA | sanq-power | all#73 | 6 | - |
| IB2300163186#3 | VÀO | YC6A245LD21 | wintpower | all#117 | 9 | - |
| IB2300163186#3 | VÀO | 6M16G220/5 | longkai-power | all#126 | 10 | - |
| IB2300163186#3 | VÀO | WP10D238E200 | longkai-power | all#135 | 11 | - |
| IB2300163186#3 | VÀO | 6DTAA89G24 | longkai-power | all#143 | 12 | - |
| IB2300163186#3 | VÀO | 6M16G220/5 | kaihua-genset | all#177 | 13 | - |
| IB2300163186#3 | VÀO | 6DTAA89G24 | jet-power | all#184 | 14 | - |
| IB2300163186#3 | VÀO | NTA855GA | fdk-energy | all#210 | 15 | - |
| IB2300163186#3 | VÀO | WD129TD17 | wintpower | all#211 | 16 | - |
| IB2300163186#3 | VÀO | WP10D200E201 | penlucky | all#223 | 17 | - |
| IB2300163186#3 | VÀO | SC13G280D2 | dingbo | all#224 | 18 | - |
| IB2300163186#3 | VÀO | YM6H4LD | koten-power | all#235 | 19 | - |
| IB2300163186#3 | VÀO | WD129TD16 | sanq-power | all#390 | 20 | - |
| IB2300163186#3 | VÀO | WD129TD16 | wintpower | all#431 | 21 | - |
| IB2300163186#3 | VÀO | WP10CD238E200 | uleengen | all#449 | 22 | - |
| IB2300163186#3 | VÀO | WP10D200E201 | gordon-power | all#456 | 23 | - |
| IB2300163186#3 | VÀO | 6M16G250/5 | rcg-power | all#464 | 24 | - |
| IB2300163186#3 | VÀO | 1106CPATAG4 | wintpower | all#484 | 25 | - |
| IB2300163186#3 | VÀO | YCA73TAA245G20 | byc-power | all#599 | 26 | - |
| IB2300163186#3 | VÀO | R6126ZLD | jet-power | all#624 | 27 | - |
| IB2300163186#3 | VÀO | WP10D238E201 | koten-power | all#625 | 28 | - |
| IB2300163186#3 | VÀO | WP10D238E201 | aosif | all#628 | 29 | - |
| IB2300163186#3 | VÀO | 6M16G250/5 | elitech-power | all#633 | 30 | - |
| IB2300163844#1 | RA | YC4V45ZD20 | fdk-energy | 1 | ra khỏi all | khác/không ghi |
| IB2300163844#1 | RA | 404D22TG | kaihua-genset | 3 | ra khỏi all | khác/không ghi |
| IB2300163844#1 | RA | WP23D33E200 | fdk-energy | 4 | ra khỏi all | khác/không ghi |
| IB2300163844#1 | RA | WP23D33E200 | uleengen | 5 | ra khỏi all | khác/không ghi |
| IB2300163844#1 | RA | 4DW9239D | wintpower | 10 | ra khỏi all | khác/không ghi |
| IB2300163844#1 | RA | 404D22TG | sanq-power | 13 | ra khỏi all | khác/không ghi |
| IB2300163844#1 | RA | YCDV254FHZ40 | fdk-energy | 14 | ra khỏi all | khác/không ghi |
| IB2300163844#1 | RA | 4B39G12 | acepow-fuan | 24 | all#41 | khác/không ghi |
| IB2300163844#1 | RA | 4M06G35/5 | longkai-power | 28 | ra khỏi all | khác/không ghi |
| IB2300163844#1 | RA | WP23D40E200 | longkai-power | 30 | ra khỏi all | khác/không ghi |
| IB2300163844#1 | VÀO | 1103A33G | uleengen | all#11 | 3 | - |
| IB2300163844#1 | VÀO | 4B39G12 | fdk-energy | all#33 | 9 | - |
| IB2300163844#1 | VÀO | S8000AM1S500 | sanq-power | all#56 | 18 | - |
| IB2300163844#1 | VÀO | YT3B2D | acepow-fuan | all#64 | 23 | - |
| IB2300163844#1 | VÀO | 4BT39G2 | fdk-energy | all#72 | 24 | - |
| IB2300163844#1 | VÀO | QSB39G33 | fdk-energy | all#75 | 25 | - |
| IB2300163844#1 | VÀO | 4Z32G21 | jet-power | all#89 | 27 | - |
| IB2300163844#1 | VÀO | 4DX2145D | wintpower | all#90 | 28 | - |
| IB2300163844#1 | VÀO | YC4D60D21 | huaquan-power | all#95 | 29 | - |
| IB2300163844#1 | VÀO | 1103A33TG1 | gb-power | all#96 | 30 | - |
| IB2300356962#1 | RA | 1103A33TG1 | sanq-power | 1 | ra khỏi all | khác/không ghi |
| IB2300356962#1 | RA | 1103A33TG1 | kaihua-genset | 3 | ra khỏi all | khác/không ghi |
| IB2300356962#1 | RA | YT3A2ZD | acepow-fuan | 14 | ra khỏi all | khác/không ghi |
| IB2300356962#1 | RA | 4M06G55/6 | longkai-power | 30 | all#62 | khác/không ghi |
| IB2300356962#1 | VÀO | WP23D48E200 | longkai-power | all#19 | 5 | - |
| IB2300356962#1 | VÀO | BFM3T | acepow-fuan | all#61 | 19 | - |
| IB2300356962#1 | VÀO | 4ZT32G21 | jet-power | all#84 | 29 | - |
| IB2300356962#1 | VÀO | WP23D58E201 | jet-power | all#88 | 30 | - |
| IB2400100405#0 | RA | QSK50G17 | fdk-energy | 9 | ra khỏi all | khác/không ghi |
| IB2400100405#0 | RA | QSK50G24 | agg-fuzhou | 23 | ra khỏi all | khác/không ghi |
| IB2400100405#0 | RA | QSK50G24 | lees-power | 24 | ra khỏi all | khác/không ghi |
| IB2400100405#0 | VÀO | 401661TRG3 | fdk-energy | all#41 | 24 | - |
| IB2400100405#0 | VÀO | S16R2PTAWC | sr-genset | all#53 | 29 | - |
| IB2400100405#0 | VÀO | 401661TRG3X | uleengen | all#54 | 30 | - |
| IB2400145438#2 | RA | 403D11G | kaihua-genset | 1 | ra khỏi all | khác/không ghi |
| IB2400145438#2 | RA | 403D11G | hosem-power | 3 | ra khỏi all | khác/không ghi |
| IB2400145438#2 | RA | 403D11G | sanq-power | 4 | ra khỏi all | khác/không ghi |
| IB2400145438#2 | RA | YD385D | tecgen-fujian | 9 | ra khỏi all | khác/không ghi |
| IB2400145438#2 | RA | YD385D/11KW | jet-power | 22 | ra khỏi all | khác/không ghi |
| IB2400145438#2 | RA | YD380D | victory-generator | 26 | ra khỏi all | khác/không ghi |
| IB2400145438#2 | RA | 403A11G1 | longkai-power | 27 | ra khỏi all | khác/không ghi |
| IB2400145438#2 | RA | YD380D | comappower | 28 | ra khỏi all | khác/không ghi |
| IB2400145438#2 | VÀO | 403A15G1 | sanq-power | all#9 | 5 | - |
| IB2400145438#2 | VÀO | YD385D | uleengen | all#23 | 9 | - |
| IB2400145438#2 | VÀO | YD480D/14KW | jet-power | all#87 | 24 | - |
| IB2400145438#2 | VÀO | 404D22G | elitech-power | all#120 | 25 | - |
| IB2400145438#2 | VÀO | CATC15 | rise-power | all#124 | 27 | - |
| IB2400145438#2 | VÀO | F2L912D | victory-generator | all#127 | 28 | - |
| IB2400145438#2 | VÀO | 4DW8128D | minsun-motor | all#129 | 29 | - |
| IB2400145438#2 | VÀO | WP23D25E200 | penlucky | all#132 | 30 | - |
| IB2400145438#3 | RA | 403A15G2 | kaihua-genset | 3 | all#13 | khác/không ghi |
| IB2400145438#3 | RA | 403D15G | sanq-power | 7 | all#21 | khác/không ghi |
| IB2400145438#3 | RA | YD485D/17KW | jet-power | 22 | all#92 | khác/không ghi |
| IB2400145438#3 | RA | 3TNV84TGGE | sanq-power | 24 | all#98 | khác/không ghi |
| IB2400145438#3 | RA | YC4V35D20 | elitech-power | 25 | all#108 | khác/không ghi |
| IB2400145438#3 | RA | 403D15G | longkai-power | 26 | all#110 | khác/không ghi |
| IB2400145438#3 | RA | 4Z23G11 | voltgent | 27 | all#117 | khác/không ghi |
| IB2400145438#3 | RA | WP23D25E200 | elitech-power | 28 | all#123 | khác/không ghi |
| IB2400145438#3 | RA | 403A15G1 | longkai-power | 29 | all#130 | khác/không ghi |
| IB2400145438#3 | RA | F2L912 | uleengen | 30 | all#146 | khác/không ghi |
| IB2400145438#3 | VÀO | 403D15G | gb-power | mới trong all | 1 | - |
| IB2400145438#3 | VÀO | 403D15G | sanq-power | mới trong all | 2 | - |
| IB2400145438#3 | VÀO | 403A15G1 | sanq-power | mới trong all | 3 | - |
| IB2400145438#3 | VÀO | 403A15G1 | jet-power | mới trong all | 4 | - |
| IB2400145438#3 | VÀO | 403A15G1 | kaihua-genset | mới trong all | 5 | - |
| IB2400145438#3 | VÀO | WP23D25E200 | elitech-power | mới trong all | 25 | - |
| IB2400145438#3 | VÀO | YD385D | elitech-power | mới trong all | 26 | - |
| IB2400145438#3 | VÀO | YD385D | comappower | mới trong all | 27 | - |
| IB2400145438#3 | VÀO | K4100D | elitech-power | mới trong all | 29 | - |
| IB2400145438#3 | VÀO | F2L912D | victory-generator | mới trong all | 30 | - |
| IB2400375383#0 | RA | YC4A190D30 | fdk-energy | 14 | ra khỏi all | khác/không ghi |
| IB2400375383#0 | RA | WP6D152E200 | jet-power | 19 | all#68 | khác/không ghi |
| IB2400375383#0 | RA | SC4H180D2 | dingbo | 23 | ra khỏi all | khác/không ghi |
| IB2400375383#0 | RA | WP6D158E201 | uleengen | 26 | all#95 | khác/không ghi |
| IB2400375383#0 | VÀO | 1106A70TAG2 | fdk-energy | all#5 | 4 | - |
| IB2400375383#0 | VÀO | WP6D152E200 | uleengen | all#23 | 9 | - |
| IB2400375383#0 | VÀO | WP6D158E201 | jet-power | all#81 | 22 | - |
| IB2400375383#0 | VÀO | 6M11G160/6 | longkai-power | all#106 | 28 | - |
| IB2400375383#1 | RA | SC4H180D2 | elitech-power | 22 | ra khỏi all | khác/không ghi |
| IB2400375383#1 | VÀO | TAD853GE | victory-generator | all#85 | 27 | - |
| IB2400427929#0 | RA | D1105E2BG | comappower | 8 | ra khỏi all | khác/không ghi |
| IB2400427929#0 | RA | D1105E2BG | mecca-power | 13 | ra khỏi all | khác/không ghi |
| IB2400427929#0 | RA | D1105E2BG | suneco-linyi | 17 | ra khỏi all | khác/không ghi |
| IB2400427929#0 | RA | D905E2BG | excel-power-ningde | 18 | ra khỏi all | khác/không ghi |
| IB2400427929#0 | RA | 403D11G1 | world-power-fuzhou | 20 | ra khỏi all | khác/không ghi |
| IB2400427929#2 | RA | 1103A33G | fdk-energy | 1 | ra khỏi all | khác/không ghi |
| IB2400427929#2 | RA | 1103A33G | kaihua-genset | 2 | ra khỏi all | khác/không ghi |
| IB2400427929#2 | RA | 1103A33G | uleengen | 3 | ra khỏi all | khác/không ghi |
| IB2400427929#2 | RA | S8000AM1S500 | sanq-power | 9 | ra khỏi all | khác/không ghi |
| IB2400427929#2 | RA | CATC33 | rise-power | 16 | ra khỏi all | khác/không ghi |
| IB2400427929#2 | RA | 1103A33G1 | voltgent | 19 | ra khỏi all | khác/không ghi |
| IB2400427929#2 | RA | 1103A33G1 | genlitec | 25 | ra khỏi all | khác/không ghi |
| IB2400427929#2 | VÀO | 4TNV98GGE | wintpower | all#21 | 5 | - |
| IB2400427929#2 | VÀO | 4B39G1 | longkai-power | all#22 | 6 | - |
| IB2400427929#2 | VÀO | 4B39G2 | bobig-power | all#28 | 8 | - |
| IB2400427929#2 | VÀO | 4B39G12 | acepow-fuan | all#43 | 9 | - |
| IB2400427929#2 | VÀO | 1103D33G2 | baifa-power | all#556 | 26 | - |
| IB2400427929#2 | VÀO | R24MSNS0131A02 | mecca-power | all#579 | 27 | - |
| IB2400427929#2 | VÀO | 1103A33G(INDIA) | landtop-fuzhou | all#609 | 29 | - |
| IB2400448320#0 | RA | YC4A190D30 | fdk-energy | 14 | ra khỏi all | khác/không ghi |
| IB2400448320#0 | RA | WP6D152E200 | jet-power | 19 | all#68 | khác/không ghi |
| IB2400448320#0 | RA | SC4H180D2 | dingbo | 23 | ra khỏi all | khác/không ghi |
| IB2400448320#0 | RA | WP6D158E201 | uleengen | 26 | all#95 | khác/không ghi |
| IB2400448320#0 | VÀO | 1106A70TAG2 | fdk-energy | all#5 | 4 | - |
| IB2400448320#0 | VÀO | WP6D152E200 | uleengen | all#23 | 9 | - |
| IB2400448320#0 | VÀO | WP6D158E201 | jet-power | all#81 | 22 | - |
| IB2400448320#0 | VÀO | 6M11G160/6 | longkai-power | all#106 | 28 | - |
| IB2400448320#1 | RA | SC4H180D2 | elitech-power | 22 | ra khỏi all | khác/không ghi |
| IB2400448320#1 | VÀO | TAD853GE | victory-generator | all#85 | 27 | - |
| IB2500222084#0 | RA | WP23D33E200 | huali-shandong | 1 | ra khỏi all | khác/không ghi |
| IB2500222084#0 | RA | WP23D40E200 | fdk-energy | 4 | ra khỏi all | khác/không ghi |
| IB2500222084#0 | RA | 4BT39G1 | tecgen-fujian | 9 | all#17 | khác/không ghi |
| IB2500222084#0 | RA | WP23D40E200 | jet-power | 14 | ra khỏi all | khác/không ghi |
| IB2500222084#0 | RA | WP23D48E200 | uleengen | 20 | ra khỏi all | khác/không ghi |
| IB2500222084#0 | RA | WP23D48E200 | acepow-fuan | 24 | ra khỏi all | khác/không ghi |
| IB2500222084#0 | VÀO | 4BT39G2 | stone-power | all#14 | 5 | - |
| IB2500222084#0 | VÀO | 4BT39G1 | fdk-energy | all#4 | 7 | - |
| IB2500222084#0 | VÀO | BFM3T | acepow-fuan | all#69 | 24 | - |
| IB2500222084#0 | VÀO | 4M08G10D3/5 | rcg-power | all#77 | 28 | - |
| IB2500222084#0 | VÀO | YANGDONGY4105D | yongcai-elecmama | all#78 | 29 | - |
| IB2500222084#0 | VÀO | YANGDONGY4105D | tecgen-fujian | all#79 | 30 | - |
