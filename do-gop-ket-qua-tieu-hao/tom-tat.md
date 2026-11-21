# Đo top 30 — PR #1022 (fix/bo-doc-tieu-hao)
- sha gốc (merge-base với origin/main): 2d2ce26d39ec0947d064336b2b44b0af32776da7
- sha đầu nhánh lúc đo: f47bedcd9f44541cec17f1a7ca6b737829480c20
- lượt: 1093 (lỗi gốc 0, lỗi nhánh 0); so được 1093
- giống hệt: 692; đổi tập top 30: 248; chỉ đổi thứ tự: 0; đổi điểm (cùng tập): 153
  (so top theo khoá dòng bỏ trường đầu phát; "giống hệt" kể cả lượt chỉ đổi khoá đầu phát)
- số dòng trong bảng ứng viên (all), cộng mọi lượt so được: gốc 1088450, nhánh 1087363 (-1087)
- dòng MẤT HẲN khỏi bảng (lượt-dòng): 1087; dòng MỚI vào bảng: 0; dòng đổi điểm: 8771; dòng đổi đầu phát (cùng dòng): 0

## Dòng mất hẳn khỏi bảng — theo NCC
longkai-power 723; agg-fuzhou 67; lees-power 63; cgm-italia 56; ade-power 33; kaihua-genset 25; genmac 22; generatordieselchina 18; xinhengxin-fujian 10; weichai-power 9; electra-molins 8; koten-power 8; landtop-fuzhou 8; coelmo 6; interpower-international 5; previa-ningde 5; weichai-heavy-machinery 4; yihua-fujian 3; mecca-power 3; yanan-power 3; voltgent 2; sr-genset 1; penlucky 1; deman-power 1; baifa-power 1; world-power-fuzhou 1; liangzi-yangzhou 1

## Dòng mất hẳn — theo model
8M21G660/5 42; 6M31G660/5 24; 8M33G770/6 24; P126TIII 24; 4BT39G1 19; SC10E380D2 19; SC8D280D2 17; QSB39G2 16; 4B39G1 16; 6M31G750/5 16; 6M31G528/6 15; 4B39G2 15; QSZ13G6 15; 6M11G4D0/S 15; 4BT39G2 14; SC9D310D2 14; 6DTAA89G24 14; 6CTAA83G2 14; QSZ13G3 13; 6LTAA95G3 13; QSB67G4 13; SC12E460D2 13; 6ETAA118G21 13; SC33G1150D2 12; 6ETAA128G32 12; 6KTAA25G35 12; 4B39G11 12; 6ZTAA13G4 11; QSZ13G5 11; 6ETAA128G31 11; QSZ13G10 11; 4B39G12 11; 6CTAA83G9 11; 6M11G2D0/S 11; WP10D238E200 10; QSZ13G7 10; 6KTAA25G36 10; KTA19G4 10; SC9D340D2 10; 6DTAA89G23 10

## 50 dòng mất hẳn đầu tiên (lượt | NCC | model | điểm gốc | từng trong top 30)
- IB2200004566#0 | longkai-power | 4BT39G2 | 264 | không | |POWERYOURFUTURE|4BT39G2|CUMMINSGENERATOR|PRIMEPOWER:32KW/40
- IB2200004566#0 | longkai-power | 4BT39G1 | 264 | có | |POWERYOURFUTURE|4BT39G1|CUMMINSGENERATOR|PRIMEPOWER:32KW/40
- IB2200004914#0 | ade-power | 6M16G2D0/S | 155 | có | |STANDBYPOWER(ESP)RATING|182KVA/145KW|PRIMEPOWER(PRP)RATING|
- IB2200004914#0 | ade-power | 6M16G2D0/S | 145 | không | |STANDBYPOWER(ESP)RATING|200KVA/160KW|PRIMEPOWER(PRP)RATING|
- IB2200004916#0 | longkai-power | 4BT39G2 | 264 | không | |POWERYOURFUTURE|4BT39G2|CUMMINSGENERATOR|PRIMEPOWER:32KW/40
- IB2200004916#0 | longkai-power | 4BT39G1 | 264 | có | |POWERYOURFUTURE|4BT39G1|CUMMINSGENERATOR|PRIMEPOWER:32KW/40
- IB2200015953#0 | longkai-power | SC8D280D2 | 278 | có | |POWERYOURFUTURE|SC8D280D2|SDECGENERATOR|PRIMEPOWER:160KW/20
- IB2200015953#0 | longkai-power | SC9D310D2 | 265 | có | |POWERYOURFUTURE|SC9D310D2|SDECGENERATOR|PRIMEPOWER:180KW/22
- IB2200015953#0 | longkai-power | WP10D238E200 | 263 | có | |POWERYOURFUTURE|WP10D238E200|WEICHAIGENERATOR|PRIMEPOWER:18
- IB2200015953#0 | longkai-power | 6DTAA89G24 | 257 | không | |POWERYOURFUTURE|6DTAA89G24|SDECGENERATOR|PRIMEPOWER:180KW/2
- IB2200018828#0 | longkai-power | 6WTAA35G32 | 267 | có | |POWERYOURFUTURE|6WTAA35G32|SDECGENERATOR|PRIMEPOWER:728KW/9
- IB2200018828#0 | longkai-power | SC33G1150D2 | 171 | không | |POWERYOURFUTURE|SC33W1150D2|SDECGENERATOR|PRIMEPOWER:700KW/
- IB2200020589#0 | ade-power | 4M06G2D0/S | 154 | không | |STANDBYPOWER(ESP)RATING|14KVA/11KW|PRIMEPOWER(PRP)RATING|13
- IB2200020589#0 | ade-power | 4M06G2D0/S | 138 | không | |STANDBYPOWER(ESP)RATING|17KVA/13KW|PRIMEPOWER(PRP)RATING|15
- IB2200021336#0 | longkai-power | 6BTAA59G2 | 274 | có | |POWERYOURFUTURE|6BTAA59G2|CUMMINSGENERATOR|PRIMEPOWER:100KW
- IB2200021336#0 | longkai-power | 6HTAA65G21 | 247 | có | |POWERYOURFUTURE|6HTAA65G21|SDECGENERATOR|PRIMEPOWER:110KW/1
- IB2200022333#1 | longkai-power | 6ETAA128G32 | 478 | có | |POWERYOURFUTURE|6ETAA128G32|SDECGENERATOR|PRIMEPOWER:320KW/
- IB2200022333#1 | longkai-power | QSZ13G7 | 478 | không | |POWERYOURFUTURE|QSZ13G7|CUMMINSGENERATOR|PRIMEPOWER:320KW/4
- IB2200022333#1 | longkai-power | 6ZTAA13G4 | 469 | không | |POWERYOURFUTURE|6ZTAA13G4|CUMMINSGENERATOR|PRIMEPOWER:350KW
- IB2200022333#1 | longkai-power | SC25G610D2 | 469 | có | |POWERYOURFUTURE|SC25G610D2|SDECGENERATOR|PRIMEPOWER:350KW/4
- IB2200022333#1 | longkai-power | QSZ13G2 | 465 | không | |POWERYOURFUTURE|QSZ13G2|CUMMINSGENERATOR|PRIMEPOWER:360KW/4
- IB2200022333#1 | longkai-power | QSZ13G5 | 465 | không | |POWERYOURFUTURE|QSZ13G5|CUMMINSGENERATOR|PRIMEPOWER:360KW/4
- IB2200022333#1 | longkai-power | 6ETAA128G31 | 465 | không | |POWERYOURFUTURE|6ETAA128G31|SDECGENERATOR|PRIMEPOWER:360KW/
- IB2200022333#1 | longkai-power | QSZ13G3 | 459 | không | |POWERYOURFUTURE|QSZ13G3|CUMMINSGENERATOR|PRIMEPOWER:380KW/4
- IB2200022333#1 | lees-power | DP158LC | 123 | không | |型号|LSDS510S3|备用功率|KVA|510|主用功率|KVA|463|Ø柴油发电机组符合ISO85285要求,
- IB2200030282#0 | sr-genset | 6HTAA65G21 | 193 | không | |145|132|132|120|6HTAA65G21|ELEC|SA274120|2550*1150*1515|340
- IB2200032133#0 | kaihua-genset | 8M21G660/5 | 205 | không | |HCBD660|660|600|8M21G660/5|S5L1DE41||5030*1860*2550|DOWNLOA
- IB2200032133#0 | ade-power | 8M21G660/5 | 140 | không | |STANDBYPOWER(ESP)RATING|648KVA/518KW|PRIMEPOWER(PRP)RATING|
- IB2200032133#0 | ade-power | 8M21G660/5 | 140 | không | |STANDBYPOWER(ESP)RATING|648KVA/518KW|PRIMEPOWER(PRP)RATING|
- IB2200032133#0 | agg-fuzhou | 6M31G660/5 | 55 | không | |B660E5|660/528|600/480|6M31G660/5
- IB2200032133#0 | cgm-italia | 6M31G660/5 | 55 | không | |600B||600|480|660|528|6M31G660/5|E|0|8|7263/5418|400|B750|5
- IB2200032133#0 | agg-fuzhou | 6M31G528/6 | 55 | không | |B660E6|660/528|600/480|6M31G528/6
- IB2200035219#0 | ade-power | 4M06G2D0/S | 141 | có | |STANDBYPOWER(ESP)RATING|8KVA/64KW|PRIMEPOWER(PRP)RATING|7KV
- IB2200037783#0 | longkai-power | WP6D132E200 | 264 | có | |POWERYOURFUTURE|WP6D132E200|WEICHAIGENERATOR|PRIMEPOWER:100
- IB2200038691#0 | longkai-power | QSZ13G10 | 278 | có | |POWERYOURFUTURE|QSZ13G10|CUMMINSGENERATOR|PRIMEPOWER:400KW/
- IB2200038691#0 | longkai-power | 6KTAA25G36 | 278 | có | |POWERYOURFUTURE|6KTAA25G36|SDECGENERATOR|PRIMEPOWER:400KW/5
- IB2200038691#0 | longkai-power | 6KTAA25G35 | 263 | có | |POWERYOURFUTURE|6KTAA25G35|SDECGENERATOR|PRIMEPOWER:460KW/5
- IB2200038691#0 | xinhengxin-fujian | KTA19G4 | 226 | không | |CUMMINSGENERATOR|PRIMEPOWER:|450KW/562KVAGENERATORWILLBEREA
- IB2200038691#0 | kaihua-genset | 8M21G660/5 | 205 | không | |HCBD660|660|600|8M21G660/5|S5L1DE41||5030*1860*2550|DOWNLOA
- IB2200038751#0 | longkai-power | 4BTA39G11 | 270 | có | |POWERYOURFUTURE|4BTA39G11|CUMMINSGENERATOR|PRIMEPOWER:52KW/
- IB2200038751#0 | longkai-power | QSB39G2 | 270 | có | |POWERYOURFUTURE|QSB39G2|CUMMINSGENERATOR|PRIMEPOWER:48KW/60
- IB2200038751#0 | longkai-power | SC4H95D2 | 263 | không | |POWERYOURFUTURE|SC4H95D2|SDECGENERATOR|PRIMEPOWER:55KW/6875
- IB2200038751#0 | longkai-power | 4HT43G22 | 247 | không | |POWERYOURFUTURE|4HT43G22|SDECGENERATOR|PRIMEPOWER:55KW/6875
- IB2200038751#0 | longkai-power | 4BTA39G258KW | 162 | không | |POWERYOURFUTURE|4BTA39G258KW|CUMMINSGENERATOR|PRIMEPOWER:52
- IB2200043601#0 | longkai-power | QSB39G2 | 250 | không | |POWERYOURFUTURE|QSB39G2|CUMMINSGENERATOR|PRIMEPOWER:48KW/60
- IB2200044785#0 | longkai-power | 4BT39G2 | 264 | không | |POWERYOURFUTURE|4BT39G2|CUMMINSGENERATOR|PRIMEPOWER:32KW/40
- IB2200044785#0 | longkai-power | 4BT39G1 | 264 | có | |POWERYOURFUTURE|4BT39G1|CUMMINSGENERATOR|PRIMEPOWER:32KW/40
- IB2200049662#0 | longkai-power | 6KTAA25G36 | 278 | có | |POWERYOURFUTURE|6KTAA25G36|SDECGENERATOR|PRIMEPOWER:400KW/5
- IB2200049662#0 | longkai-power | 6KTAA25G35 | 263 | có | |POWERYOURFUTURE|6KTAA25G35|SDECGENERATOR|PRIMEPOWER:460KW/5
- IB2200049662#0 | kaihua-genset | 8M21G660/5 | 205 | không | |HCBD660|660|600|8M21G660/5|S5L1DE41||5030*1860*2550|DOWNLOA

## Dòng mới vào bảng — theo NCC
(không)
## Dòng mới vào bảng — theo model
(không)

## Dòng hạng 1–5 của gốc ra khỏi top 30 nhánh (liệt kê hết)
- IB2200018828#0 hạng 5 | longkai-power | 6WTAA35G32 | điểm 267 | mất khỏi bảng nhánh
- IB2200049662#0 hạng 2 | longkai-power | 6KTAA25G36 | điểm 278 | mất khỏi bảng nhánh
- IB2300134568#0 hạng 4 | longkai-power | 4B39G2 | điểm 278 | mất khỏi bảng nhánh
- IB2300134568#0 hạng 5 | longkai-power | 4B39G11 | điểm 278 | mất khỏi bảng nhánh
- IB2300230061#0 hạng 3 | genmac | 6M11G4D0/S | điểm 173 | mất khỏi bảng nhánh
- IB2300254479#0 hạng 5 | rcg-power | S12A2PTA | điểm 241 | còn trong bảng nhánh (điểm 241)
- IB2300260615#1 hạng 1 | longkai-power | 20M33G2000/6 | điểm 238 | mất khỏi bảng nhánh
- IB2300260615#1 hạng 2 | longkai-power | 20M33G2250/5 | điểm 238 | mất khỏi bảng nhánh
- IB2300260615#1 hạng 3 | kaihua-genset | 20M33G2000/6 | điểm 228 | mất khỏi bảng nhánh
- IB2300260615#1 hạng 4 | longkai-power | 12M55G2250/6 | điểm 225 | mất khỏi bảng nhánh
- IB2300260615#1 hạng 5 | longkai-power | 20M33G2200/6 | điểm 225 | mất khỏi bảng nhánh
- IB2300278513#0 hạng 4 | longkai-power | SC27G900D2 | điểm 274 | mất khỏi bảng nhánh
- IB2300278513#0 hạng 5 | dingbo | TWD1645GE | điểm 273 | còn trong bảng nhánh (điểm 273)
- IB2400031785#0 hạng 2 | longkai-power | 4B39G2 | điểm 278 | mất khỏi bảng nhánh
- IB2400031785#0 hạng 3 | longkai-power | 4B39G11 | điểm 278 | mất khỏi bảng nhánh
- IB2400164837#0 hạng 1 | longkai-power | 4B39G2 | điểm 278 | mất khỏi bảng nhánh
- IB2400238834#0 hạng 5 | longkai-power | 6BTAA59G2 | điểm 278 | mất khỏi bảng nhánh
- IB2400275648#1 hạng 2 | genmac | 4M10G4D0/S | điểm 168 | mất khỏi bảng nhánh
- IB2400367420#0 hạng 1 | cgm-italia | 6M31G725/5 | điểm 107 | mất khỏi bảng nhánh
- IB2400367420#0 hạng 4 | cgm-italia | 6M31G750/5 | điểm 75 | mất khỏi bảng nhánh
- IB2400367420#0 hạng 5 | cgm-italia | 6M33G4D5/S | điểm 68 | mất khỏi bảng nhánh
- IB2400440257#0 hạng 1 | longkai-power | 4B39G2 | điểm 278 | mất khỏi bảng nhánh
- IB2400440994#0 hạng 5 | longkai-power | 4B39G2 | điểm 278 | mất khỏi bảng nhánh
- IB2400489270#0 hạng 1 | longkai-power | 4B39G2 | điểm 278 | mất khỏi bảng nhánh
- IB2400493077#0 hạng 1 | genmac | 4M10G4D0/S | điểm 173 | mất khỏi bảng nhánh
- IB2400529458#0 hạng 2 | genmac | 4M06G8D0/S | điểm 173 | mất khỏi bảng nhánh
- IB2400533611#0 hạng 5 | longkai-power | SC27G900D2 | điểm 271 | mất khỏi bảng nhánh
- IB2400573523#0 hạng 4 | longkai-power | SC25G610D2 | điểm 269 | mất khỏi bảng nhánh
- IB2400596787#0 hạng 5 | longkai-power | SC27G900D2 | điểm 271 | mất khỏi bảng nhánh
- IB2500073242#0 hạng 4 | genmac | 6M11G2D0/S | điểm 161 | mất khỏi bảng nhánh
- IB2500073242#0 hạng 5 | genmac | 6M11G4D0/S | điểm 161 | mất khỏi bảng nhánh
- IB2500177769#0 hạng 5 | longkai-power | 6LTAA95G1 | điểm 278 | mất khỏi bảng nhánh
- IB2500291421#1 hạng 2 | longkai-power | 6KTAA25G35 | điểm 273 | mất khỏi bảng nhánh
- IB2500386455#0 hạng 1 | genmac | 4M06G10D0/S | điểm 173 | mất khỏi bảng nhánh
- IB2500553750#0 hạng 3 | interpower-international | 6M16G2D0/S | điểm 173 | mất khỏi bảng nhánh
Tổng: 35

## NCC / model ra-vào top 30 nhiều nhất
- NCC ra: longkai-power 273; cgm-italia 27; bobig-power 24; uleengen 23; genmac 14; jet-power 13; tecgen-fujian 12; kaihua-genset 12; stone-power 11; acepow-fuan 10; sanq-power 8; rcg-power 7; wintpower 6; fdk-energy 6; dingbo 6
- NCC vào: jet-power 83; longkai-power 82; acepow-fuan 37; uleengen 32; dingbo 30; bobig-power 29; wintpower 27; sanq-power 25; cgm-italia 19; stone-power 15; genmac 10; rcg-power 9; kaihua-genset 8; fdk-energy 7; rise-power 4
- model ra: 4BT39G1 17; 4B39G2 17; SC27G755D2 14; SC8D280D2 12; 4B39G11 12; Y4102D 11; 6ETAA128G32 9; 6KTAA25G36 9; WP23D25E200 9; 4B39G12 9; SC12E420D2 9; QSB39G2 8; SC9D340D2 8; 6LTAA89G2 7; 6LTAA89G3 7
- model vào: K4100D 66; 4B39G2 15; WD269TAD43 13; SC8D280D2 7; 4M10G70/5 7; 6M16G275/5 7; CA6DL230D 7; 4BT39G1 6; YM6S9LDB 6; 4B39G11 6; SC7H250D2 6; 6ETAA118G21 6; 6LTAA89G2 5; SC27G900D2 5; 404D22TG 5

## Dòng đổi điểm theo mức chênh (số lượt-dòng; tổng 8771)
-300: 181; +24: 744; +16: 113; +8: 7733
Chênh lớn nhất (30 đầu):
- IB2200038691#0 | westinpower | 2506CE15TAG2 | 229 → -71 (-300)
- IB2200038691#0 | westinpower | 2506CE15TAG2 | 229 → -71 (-300)
- IB2200038691#0 | westinpower | 2506CE15TAG2 | 229 → -71 (-300)
- IB2200038691#0 | westinpower | 2806CE18TAG1A | 211 → -89 (-300)
- IB2200038691#0 | westinpower | 2806CE18TAG1A | 211 → -89 (-300)
- IB2200038691#0 | westinpower | 2806CE18TAG1A | 211 → -89 (-300)
- IB2200062073#1 | westinpower | 1103A33G | 229 → -71 (-300)
- IB2200062073#1 | westinpower | 1103A33G | 229 → -71 (-300)
- IB2200062073#1 | westinpower | 1103A33G | 229 → -71 (-300)
- IB2200087789#1 | westinpower | 1206AE70TTAG3 | 229 → -71 (-300)
- IB2200087789#1 | westinpower | 1206AE70TTAG3 | 229 → -71 (-300)
- IB2200087789#1 | westinpower | 1206AE70TTAG3 | 229 → -71 (-300)
- IB2200087789#1 | westinpower | YC6MK350D30 | 229 → -71 (-300)
- IB2200087789#2 | westinpower | 2506CE15TAG1 | 216 → -84 (-300)
- IB2200087789#2 | westinpower | 2506CE15TAG1 | 215 → -85 (-300)
- IB2200087789#2 | westinpower | 2506CE15TAG1 | 215 → -85 (-300)
- IB2200093803#0 | westinpower | 401661TRG3 | 429 → 129 (-300)
- IB2200093803#0 | westinpower | 401661TRG3 | 429 → 129 (-300)
- IB2200093814#0 | westinpower | S16RPTAC | 215 → -85 (-300)
- IB2200093814#0 | westinpower | S16RPTAC | 215 → -85 (-300)
- IB2200093814#0 | westinpower | S16RPTAC | 215 → -85 (-300)
- IB2300013484#0 | westinpower | S16RPTAC | 215 → -85 (-300)
- IB2300013484#0 | westinpower | S16RPTAC | 215 → -85 (-300)
- IB2300013484#0 | westinpower | S16RPTAC | 215 → -85 (-300)
- IB2300030889#0 | westinpower | 1104C44TAG2 | 229 → -71 (-300)
- IB2300030889#0 | westinpower | 1104C44TAG2 | 229 → -71 (-300)
- IB2300030889#0 | westinpower | 1104C44TAG2 | 229 → -71 (-300)
- IB2300046353#1 | westinpower | 404D22G | 229 → -71 (-300)
- IB2300046353#1 | westinpower | 404D22G | 229 → -71 (-300)
- IB2300046353#1 | westinpower | 404D22G | 229 → -71 (-300)

## 10 lượt đổi nhiều nhất (số dòng vào/ra top 30; số dòng mất/mới trong bảng)
- IB2300278513#0: ra 8, vào 8; bảng mất 7, mới 0
- IB2300260615#1: ra 6, vào 6; bảng mất 25, mới 0
- IB2200087789#1: ra 5, vào 5; bảng mất 11, mới 0
- IB2300273061#2: ra 5, vào 5; bảng mất 11, mới 0
- IB2600412115#0: ra 5, vào 5; bảng mất 11, mới 0
- IB2500129189#0: ra 5, vào 5; bảng mất 10, mới 0
- IB2300057123#0: ra 5, vào 5; bảng mất 6, mới 0
- IB2200015953#0: ra 5, vào 5; bảng mất 4, mới 0
- IB2300232850#1: ra 5, vào 5; bảng mất 0, mới 0
- IB2400302943#0: ra 4, vào 4; bảng mất 12, mới 0
