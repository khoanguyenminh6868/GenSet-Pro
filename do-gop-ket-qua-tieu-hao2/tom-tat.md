# Tóm tắt đo top 30: gốc vs nhánh (PR #1022)

- Tổng lượt: 1093; chỉ một bên: 0; lỗi: 0
- Giống hệt (top, điểm, all, dropped, rowflag): **229**
- Đổi tập top 30 (có dòng ra/vào top 30): **264**
- Cùng tập top 30 nhưng đổi tập all (dòng ra/vào ngoài top 30): **110**
- Chỉ đổi thứ tự (cùng tập top, cùng tập all): **158**
- Chỉ đổi điểm hoặc số dropped/rowflag (cùng tập top và all, cùng thứ tự): **332**

## Chi tiết mọi lượt đổi tập (264)

### IB2200001635#0  (top ra 1, vào 1; dropped gốc 578 → nhánh 578)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Perkins / 1004C44TAG2 + UCI274C / gb-power / dòng STANDARDFEATURES|MODEL|G… / hạng 29 → còn trong all nhánh, điểm 260→260
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 6BT59G296KW + UCI274C80KW / yihua-fujian / dòng |GENERATORSETMODEL|YH100… / hạng 27 ← đã có trong all gốc, điểm 256→264
all: ra 0, vào 0

### IB2200004566#0  (top ra 1, vào 1; dropped gốc 239 → nhánh 241)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / S38G4 + PI144J / sanq-power / dòng |SQIC44|35/44|32/40|S38G… / hạng 30 → còn trong all nhánh, điểm 229→229
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / victory-generator / dòng |V32T|60|28|35|32|40|K41… / hạng 30 ← đã có trong all gốc, điểm 221→229
all: ra 2, vào 0

### IB2200004914#0  (top ra 1, vào 1; dropped gốc 735 → nhánh 737)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 6M16G2D0/S / ade-power / dòng |STANDBYPOWER(ESP)RATING… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- FPT / NEF67TE2PV / cgm-italia / dòng |E170F||170|136|187|1496… / hạng 28 ← đã có trong all gốc, điểm 69→69
all: ra 2, vào 0

### IB2200004916#0  (top ra 1, vào 1; dropped gốc 239 → nhánh 241)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / S38G4 + PI144J / sanq-power / dòng |SQIC44|35/44|32/40|S38G… / hạng 30 → còn trong all nhánh, điểm 229→229
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / victory-generator / dòng |V32T|60|28|35|32|40|K41… / hạng 30 ← đã có trong all gốc, điểm 221→229
all: ra 2, vào 0

### IB2200015404#0  (top ra 2, vào 2; dropped gốc 200 → nhánh 200)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- FAWDE / 4DW9129D + PI144D / wintpower / dòng |WTFA22|16/20|18/22|4DW9… / hạng 20 → còn trong all nhánh, điểm 242→242
- Weichai / WP23D25E200 + JET184D / jet-power / dòng |WP23|23|18|20|16|WP23D2… / hạng 30 → còn trong all nhánh, điểm 236→236
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D + JET184D / jet-power / dòng |GF21|21|17|19|15|K4100D… / hạng 18 ← đã có trong all gốc, điểm 234→242
- Yanmar / 4TNV84TGGE + PI144D / wintpower / dòng |WTYM22|16/20|18/22|4TNV… / hạng 19 ← đã có trong all gốc, điểm 242→242
all: ra 0, vào 0

### IB2200015953#0  (top ra 5, vào 5; dropped gốc 956 → nhánh 960)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC8D280D2 + LK274H / longkai-power / dòng |POWERYOURFUTURE|SC8D280… / hạng 9 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC9D310D2 + LK274J / longkai-power / dòng |POWERYOURFUTURE|SC9D310… / hạng 18 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Weichai / WP10D238E200 + LK274J / longkai-power / dòng |POWERYOURFUTURE|WP10D23… / hạng 19 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 6DTAA89G21 + JET274H / jet-power / dòng |SD220|220|176|200|160|6… / hạng 28 → còn trong all nhánh, điểm 253→253
- SDEC / 6DTAA89G21 + BW274H / bobig-power / dòng |BSD220|160|200|176|220|… / hạng 30 → còn trong all nhánh, điểm 253→253
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC8D280D2 + JET274H / jet-power / dòng |SD220|220|176|200|160|S… / hạng 14 ← đã có trong all gốc, điểm 269→269
- SDEC / 6DTAA89G21 + LK274H / longkai-power / dòng |POWERYOURFUTURE|6DTAA89… / hạng 18 ← đã có trong all gốc, điểm 262→262
- Baudouin / 6M16G250/5 + LSA463S4 / longkai-power / dòng |LG184BD|2024|253|184|23… / hạng 20 ← đã có trong all gốc, điểm 258→258
- SDEC / SC9D310D2 + BW274J / bobig-power / dòng |BSD248|180|225|198|248|… / hạng 24 ← đã có trong all gốc, điểm 256→256
- Weichai / WP10D238E200 + JET274J / jet-power / dòng |WP250|250|200|225|180|W… / hạng 25 ← đã có trong all gốc, điểm 256→256
all: ra 4, vào 0

### IB2200018828#0  (top ra 2, vào 2; dropped gốc 1703 → nhánh 1705)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 6WTAA35G32 + LK634D / longkai-power / dòng |POWERYOURFUTURE|6WTAA35… / hạng 5 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Yuchai / YC6C1220D31 + NIANFENGNFS6D / fdk-energy / dòng |Y1000N/H1CONTACT|1000KV… / hạng 9 → còn trong all nhánh, điểm 234→234
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / 6WTAA35G32 + NIANFENGNFS6D / fdk-energy / dòng |SC1000V2H1CONTACT|1000K… / hạng 5 ← đã có trong all gốc, điểm 259→259
- Yuchai / YC6C1220D31 / westinpower / dòng |TY1000|1000|800|913|730… / hạng 25 ← đã có trong all gốc, điểm 194→194
all: ra 2, vào 0

### IB2200021336#0  (top ra 2, vào 2; dropped gốc 599 → nhánh 601)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 6BTAA59G2 + LK274D / longkai-power / dòng |POWERYOURFUTURE|6BTAA59… / hạng 11 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 6HTAA65G21 + BW274E / bobig-power / dòng |BSD151|110|138|121|151|… / hạng 30 → còn trong all nhánh, điểm 238→238
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 6BTAA59G2 + UCI274E / sanq-power / dòng |SQC150|120/150|110/138|… / hạng 16 ← đã có trong all gốc, điểm 269→269
- Baudouin / 6M11G150/5 + LSA443M6 / longkai-power / dòng |LG110BD|1188|1485|108|1… / hạng 27 ← đã có trong all gốc, điểm 255→255
all: ra 2, vào 0

### IB2200022333#1  (top ra 3, vào 3; dropped gốc 966 → nhánh 975)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / QSZ13G7 + LK444F / longkai-power / dòng |POWERYOURFUTURE|QSZ13G7… / hạng 11 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 6ETAA128G32 + LK444F / longkai-power / dòng |POWERYOURFUTURE|6ETAA12… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Perkins / 2506CE15TAG1 + S4L1DG41 / kaihua-genset / dòng |HC500GF|500|450|2506CE1… / hạng 30 → còn trong all nhánh, điểm 468→468
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 6ZTAA13G4 + HCI544C / stone-power / dòng |SC450E5|400|360|500|450… / hạng 20 ← đã có trong all gốc, điểm 474→474
- SDEC / 6ETAA128G32 + BK314FS / bobig-power / dòng |BSD440|320|400|352|440|… / hạng 23 ← đã có trong all gốc, điểm 469→469
- Weichai / WP13D440E310 + LK544C / longkai-power / dòng |POWERYOURFUTURE|WP13D44… / hạng 27 ← đã có trong all gốc, điểm 469→469
all: ra 9, vào 0

### IB2200035219#0  (top ra 1, vào 0; dropped gốc 49 → nhánh 50)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 4M06G2D0/S / ade-power / dòng |STANDBYPOWER(ESP)RATING… / hạng 6 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- (không có)
all: ra 1, vào 0

### IB2200037783#0  (top ra 1, vào 1; dropped gốc 1229 → nhánh 1230)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / WP6D132E200 + LK274D / longkai-power / dòng |POWERYOURFUTURE|WP6D132… / hạng 20 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Weichai / WP6D132E200 + BW274D / bobig-power / dòng |BWC138|100|125|110|138|… / hạng 29 ← đã có trong all gốc, điểm 255→255
all: ra 1, vào 0

### IB2200038691#0  (top ra 3, vào 3; dropped gốc 1325 → nhánh 1331)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 6KTAA25G36 + LK544C / longkai-power / dòng |POWERYOURFUTURE|6KTAA25… / hạng 19 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSZ13G10 + LK544C / longkai-power / dòng |POWERYOURFUTURE|QSZ13G1… / hạng 20 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 6ETAA128G3101 + JET544C / jet-power / dòng |SD550|550|440|500|400|6… / hạng 30 → còn trong all nhánh, điểm 261→261
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / KTAA19G5 + HCI544D / yongcai-elecmama / dòng |YCM440CC|605|484|550|44… / hạng 21 ← đã có trong all gốc, điểm 274→274
- Baudouin / 6M21G460/6 + LSA473M8 / longkai-power / dòng |LG400BD|440|550|400|500… / hạng 28 ← đã có trong all gốc, điểm 265→265
- Weichai / 6M33D572E200 + LK544E / longkai-power / dòng |POWERYOURFUTURE|6M33D57… / hạng 29 ← đã có trong all gốc, điểm 263→263
all: ra 5, vào 0

### IB2200038751#0  (top ra 2, vào 2; dropped gốc 191 → nhánh 195)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4BTA39G11 + LK224F / longkai-power / dòng |POWERYOURFUTURE|4BTA39G… / hạng 16 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 4HT43G22 + LK224F / longkai-power / dòng |POWERYOURFUTURE|4HT43G2… / hạng 30 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 4BTA39G11 + UCI224F / sanq-power / dòng |SQC80|64/80|58/72|4BTA3… / hạng 24 ← đã có trong all gốc, điểm 264→264
- Cummins / S38G7 + UCI224E / sanq-power / dòng |SQIC66|53/66|48/60|S38G… / hạng 30 ← đã có trong all gốc, điểm 240→240
all: ra 4, vào 0

### IB2200044785#0  (top ra 1, vào 1; dropped gốc 239 → nhánh 241)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / S38G4 + PI144J / sanq-power / dòng |SQIC44|35/44|32/40|S38G… / hạng 30 → còn trong all nhánh, điểm 229→229
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / victory-generator / dòng |V32T|60|28|35|32|40|K41… / hạng 30 ← đã có trong all gốc, điểm 221→229
all: ra 2, vào 0

### IB2200049662#0  (top ra 2, vào 2; dropped gốc 2503 → nhánh 2514)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 6KTAA25G36 + LK544C / longkai-power / dòng |POWERYOURFUTURE|6KTAA25… / hạng 2 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 6KTAA25G35 + LK544E / longkai-power / dòng |POWERYOURFUTURE|6KTAA25… / hạng 7 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / QSK19G12 + LK544E / longkai-power / dòng |POWERYOURFUTURE|QSK19G1… / hạng 10 ← đã có trong all gốc, điểm 247→247
- Baudouin / 6M33G660/5 + LSA473L9 / longkai-power / dòng |LG480BD|528|660|480|600… / hạng 11 ← đã có trong all gốc, điểm 245→245
all: ra 10, vào 0

### IB2200052716#1  (top ra 1, vào 1; dropped gốc 4 → nhánh 4)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Yangdong / YD485D/17KW + JET164D/128KW / jet-power / dòng |YD17|165|132|15|12|YD48… / hạng 30 → còn trong all nhánh, điểm 237→237
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D + JET184D / jet-power / dòng |GF21|21|17|19|15|K4100D… / hạng 23 ← đã có trong all gốc, điểm 234→242
all: ra 0, vào 0

### IB2200053768#0  (top ra 1, vào 1; dropped gốc 33 → nhánh 33)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Perkins / 404D22G / elitech-power / dòng MODEL:EPS125PKA3S|13KVA|… / hạng 26 → còn trong all nhánh, điểm 225→225
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 26 ← đã có trong all gốc, điểm 217→225
all: ra 0, vào 0

### IB2200062073#0  (top ra 1, vào 1; dropped gốc 13 → nhánh 13)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Caterpillar / CATC15 + LC1114D / rise-power / dòng |DE135E3|125|10|135|108|… / hạng 30 → còn trong all nhánh, điểm 221→221
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 29 ← đã có trong all gốc, điểm 217→225
all: ra 0, vào 0

### IB2200062073#1  (top ra 2, vào 2; dropped gốc 341 → nhánh 345)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G12 + LK184G / longkai-power / dòng |POWERYOURFUTURE|4B39G12… / hạng 22 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Weichai / WP23D40E200 + LK184H / longkai-power / dòng |POWERYOURFUTURE|WP23D40… / hạng 30 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / 4Z32G21 + JET184G / jet-power / dòng |SD35|35|28|313|25|4Z32G… / hạng 29 ← đã có trong all gốc, điểm 249→249
- FAWDE / 4DX2145D + PI144H / wintpower / dòng |WTFA34|25/31|28/34|4DX2… / hạng 30 ← đã có trong all gốc, điểm 248→248
all: ra 4, vào 0

### IB2200064629#0  (top ra 1, vào 1; dropped gốc 596 → nhánh 598)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- FAWDE / 4DW9129DYFD10W + BW184ES / bobig-power / dòng |BFA22|16|20|18|22|4DW91… / hạng 30 → còn trong all nhánh, điểm 413→413
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / 495D + STC20 / sunny-weifang / dòng |DB20GF|20/25|495D|STC20… / hạng 28 ← đã có trong all gốc, điểm 412→420
all: ra 2, vào 0

### IB2200073368#0  (top ra 1, vào 1; dropped gốc 102 → nhánh 106)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Yuchai / YC6B135ZD20 + WT274C / wintpower / dòng |WTYC113|80/100|90/113|Y… / hạng 30 → còn trong all nhánh, điểm 265→265
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 6BT59G296KW + LK274D / longkai-power / dòng |POWERYOURFUTURE|6BT59G2… / hạng 21 ← đã có trong all gốc, điểm 262→270
all: ra 4, vào 0

### IB2200073825#0  (top ra 3, vào 3; dropped gốc 61 → nhánh 65)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC4H115D2 + LK224G / longkai-power / dòng |POWERYOURFUTURE|SC4H115… / hạng 17 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSB39G3 + LK224G/S / longkai-power / dòng |POWERYOURFUTURE|QSB39G3… / hạng 18 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Perkins / 1104CE44TAG1 + UCI224G / gb-power / dòng STANDARDFEATURES|MODEL|G… / hạng 30 → còn trong all nhánh, điểm 255→255
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC4H115D2 + JET224G / jet-power / dòng |SD88|88|70|80|64|SC4H11… / hạng 17 ← đã có trong all gốc, điểm 269→269
- Baudouin / 4M10G88/5 + LSA443S2 / longkai-power / dòng |LG64BD|704|88|64|80|4M1… / hạng 21 ← đã có trong all gốc, điểm 268→268
- Cummins / 6BT59G1 + LK274C / longkai-power / dòng |POWERYOURFUTURE|6BT59G1… / hạng 26 ← đã có trong all gốc, điểm 261→261
all: ra 4, vào 0

### IB2200083057#0  (top ra 2, vào 2; dropped gốc 753 → nhánh 759)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 6KTAA25G36 + LK544C / longkai-power / dòng |POWERYOURFUTURE|6KTAA25… / hạng 23 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Volvo Penta / TAD1345GEB + ECO402S4C / jet-power / dòng |V500T2|500|400|450|360|… / hạng 29 → còn trong all nhánh, điểm 269→269
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / 6ETAA128G31 + JET544C / jet-power / dòng |SD500|500|400|450|360|6… / hạng 28 ← đã có trong all gốc, điểm 269→269
- Weichai / 6M33D572E200 + LK544E / longkai-power / dòng |POWERYOURFUTURE|6M33D57… / hạng 30 ← đã có trong all gốc, điểm 263→263
all: ra 5, vào 0

### IB2200087789#2  (top ra 2, vào 2; dropped gốc 867 → nhánh 874)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 6ETAA128G32 + LK444F / longkai-power / dòng |POWERYOURFUTURE|6ETAA12… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Perkins / 2506CE15TAG1 + S4L1DG41 / kaihua-genset / dòng |HC500GF|500|450|2506CE1… / hạng 30 → còn trong all nhánh, điểm 268→268
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / 6ETAA128G32 + BK314FS / bobig-power / dòng |BSD440|320|400|352|440|… / hạng 23 ← đã có trong all gốc, điểm 269→269
- Weichai / WP13D440E310 + LK544C / longkai-power / dòng |POWERYOURFUTURE|WP13D44… / hạng 27 ← đã có trong all gốc, điểm 269→269
all: ra 7, vào 0

### IB2200100465#0  (top ra 3, vào 3; dropped gốc 946 → nhánh 949)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4BTA39G13 + LK224G / longkai-power / dòng |POWERYOURFUTURE|4BTA39G… / hạng 7 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC4H115D2 + LK224G / longkai-power / dòng |POWERYOURFUTURE|SC4H115… / hạng 8 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 4HT43G23 + LK224G / longkai-power / dòng |POWERYOURFUTURE|4HT43G2… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 4BTA39G13 / longkai-power / dòng |LG68C|94|75|85|68|4BTA3… / hạng 21 ← đã có trong all gốc, điểm 216→216
- SDEC / SC4H115D2 / longkai-power / dòng |LG68SC|95|75|85|68|SC4H… / hạng 22 ← đã có trong all gốc, điểm 216→216
- Cummins / QSB39G3 + EL224G / eastern-lion-fuan / dòng |GFSC68I|68|85|76|94|QSB… / hạng 30 ← đã có trong all gốc, điểm 208→208
all: ra 3, vào 0

### IB2300002060#1  (top ra 5, vào 5; dropped gốc 766 → nhánh 772)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 6KTAA25G36 + LK544C / longkai-power / dòng |POWERYOURFUTURE|6KTAA25… / hạng 20 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC25G690D2 + LK544C / longkai-power / dòng |POWERYOURFUTURE|SC25G69… / hạng 21 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSZ13G10 + LK544C / longkai-power / dòng |POWERYOURFUTURE|QSZ13G1… / hạng 22 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Deutz / BF8M1015CPG1A + TFW24004 / dingbo / dòng |XG400GF|400/500|440/550… / hạng 29 → còn trong all nhánh, điểm 261→261
- Weichai / 6M26D484E200 + BW354D / bobig-power / dòng |BWC550|400|500|440|550|… / hạng 30 → còn trong all nhánh, điểm 261→261
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Weichai / 6M26D484E200 + LK544C / longkai-power / dòng |POWERYOURFUTURE|6M26D48… / hạng 24 ← đã có trong all gốc, điểm 270→270
- Cummins / QSK19G13 + LK544C / longkai-power / dòng |POWERYOURFUTURE|QSK19G1… / hạng 25 ← đã có trong all gốc, điểm 270→270
- SDEC / SC25G690D2 + 1FC23544 / dingbo / dòng |XG400GF|400/500|440/550… / hạng 26 ← đã có trong all gốc, điểm 269→269
- Weichai / 6M33D572E200 + LK544E / longkai-power / dòng |POWERYOURFUTURE|6M33D57… / hạng 28 ← đã có trong all gốc, điểm 263→263
- Wudong / WD269TAD43 + LSA472M7 / wintpower / dòng |WTW550E|550|440KW|500|4… / hạng 30 ← đã có trong all gốc, điểm 254→262
all: ra 6, vào 0

### IB2300005377#0  (top ra 2, vào 2; dropped gốc 1054 → nhánh 1055)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / 12M33D1108E200 + LK634F / longkai-power / dòng |POWERYOURFUTURE|12M33D1… / hạng 17 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSK38G5 + BW404F / bobig-power / dòng |BC1320S|960|1200|1056|1… / hạng 21 → còn trong all nhánh, điểm 249→249
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / QSK38G1 + LK634E / longkai-power / dòng |POWERYOURFUTURE|QSK38G1… / hạng 17 ← đã có trong all gốc, điểm 262→262
- Weichai / 12M33D1108E200 + S6L1DF4 / kaihua-genset / dòng |HCBD1250|1250|1135|12M3… / hạng 18 ← đã có trong all gốc, điểm 261→261
all: ra 1, vào 0

### IB2300010852#0  (top ra 3, vào 3; dropped gốc 540 → nhánh 552)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / QSZ13G7 + LK444F / longkai-power / dòng |POWERYOURFUTURE|QSZ13G7… / hạng 19 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Weichai / WP13D405E200 + LK444F / longkai-power / dòng |POWERYOURFUTURE|WP13D40… / hạng 21 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 6ETAA128G32 + LK444F / longkai-power / dòng |POWERYOURFUTURE|6ETAA12… / hạng 22 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Weichai / WP13D385E200 + LK444FS / longkai-power / dòng |POWERYOURFUTURE|WP13D38… / hạng 27 ← đã có trong all gốc, điểm 278→278
- Cummins / 6ZTAA13G3 + HCI444FS1 / dingbo / dòng |XG300GF|300/375|330/412… / hạng 29 ← đã có trong all gốc, điểm 278→278
- Cummins / 6ZTAA13G3 + LK444F / longkai-power / dòng |POWERYOURFUTURE|6ZTAA13… / hạng 30 ← đã có trong all gốc, điểm 278→278
all: ra 12, vào 0

### IB2300022940#0  (top ra 2, vào 2; dropped gốc 2128 → nhánh 2135)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC27G900D2 + LK544F / longkai-power / dòng |POWERYOURFUTURE|SC27G90… / hạng 7 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / KTA38G / sunkings / dòng |SCF700|500|625|560|700|… / hạng 25 → còn trong all nhánh, điểm 229→229
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC27G900D2 + BW354F / bobig-power / dòng |BSD743|540|675|594|743|… / hạng 13 ← đã có trong all gốc, điểm 261→261
- Cummins / KT38GA + LK634B / longkai-power / dòng |POWERYOURFUTURE|KT38GA|… / hạng 14 ← đã có trong all gốc, điểm 258→258
all: ra 6, vào 0

### IB2300030889#0  (top ra 4, vào 4; dropped gốc 883 → nhánh 889)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / Deutz / WP41D100E200 + LK274C / longkai-power / dòng |POWERYOURFUTURE|WP41D10… / hạng 10 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 4HTAA43G21 + LK274C / longkai-power / dòng |POWERYOURFUTURE|4HTAA43… / hạng 22 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 6BT59G296KW + LK274D / longkai-power / dòng |POWERYOURFUTURE|6BT59G2… / hạng 26 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 6BT59G296KW + UCI274C80KW / yihua-fujian / dòng |GENERATORSETMODEL|YH100… / hạng 27 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Weichai / Deutz / WP41D100E200 + BW274C / bobig-power / dòng |BWC110|80|100|88|110|WP… / hạng 17 ← đã có trong all gốc, điểm 269→269
- SDEC / 4HTAA43G21 + JET274C / jet-power / dòng |SD110|110|88|100|80|4HT… / hạng 26 ← đã có trong all gốc, điểm 253→253
- FPT / NEF45TM3S500 + UCI274D / sanq-power / dòng |SQFP132|106/132|96/120|… / hạng 29 ← đã có trong all gốc, điểm 248→248
- Baudouin / 4M10G6D3/5 + UCI274C / rcg-power / dòng |RWB100D5S(STAGE3)|100KV… / hạng 30 ← đã có trong all gốc, điểm 244→244
all: ra 6, vào 0

### IB2300031444#0  (top ra 3, vào 3; dropped gốc 1235 → nhánh 1241)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 6KTAA25G36 + LK544C / longkai-power / dòng |POWERYOURFUTURE|6KTAA25… / hạng 19 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSZ13G10 + LK544C / longkai-power / dòng |POWERYOURFUTURE|QSZ13G1… / hạng 20 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Volvo Penta / TAD1346GE + ECO403S4C / jet-power / dòng |V550T2|550|440|500|400|… / hạng 30 → còn trong all nhánh, điểm 261→261
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / QSK19G13 + LK544C / longkai-power / dòng |POWERYOURFUTURE|QSK19G1… / hạng 24 ← đã có trong all gốc, điểm 270→270
- Weichai / 6M33D572E200 + LK544E / longkai-power / dòng |POWERYOURFUTURE|6M33D57… / hạng 27 ← đã có trong all gốc, điểm 263→263
- Yuchai / YC6TD780D31 + TFW24504A / dingbo / dòng |XG450GF|450/5625|495/61… / hạng 30 ← đã có trong all gốc, điểm 256→256
all: ra 5, vào 0

### IB2300044204#0  (top ra 1, vào 1; dropped gốc 166 → nhánh 166)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Perkins / 403A15G1 / longkai-power / dòng |LG12P|17|13|15|12|403A1… / hạng 30 → còn trong all nhánh, điểm 222→222
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS15RKA3|RICARDO|15KVA… / hạng 26 ← đã có trong all gốc, điểm 214→222
all: ra 0, vào 0

### IB2300046353#0  (top ra 1, vào 1; dropped gốc 236 → nhánh 236)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Perkins / 404A22G + STAFMORDPI144D / gb-power / dòng STANDARDFEATURES|MODEL|G… / hạng 30 → còn trong all nhánh, điểm 237→237
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D + JET184D / jet-power / dòng |GF21|21|17|19|15|K4100D… / hạng 21 ← đã có trong all gốc, điểm 234→242
all: ra 0, vào 0

### IB2300046353#1  (top ra 1, vào 1; dropped gốc 17 → nhánh 17)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Perkins / 404D22G + S0L2M1 / kaihua-genset / dòng |HC24GF60|26|24|404D22G|… / hạng 30 → còn trong all nhánh, điểm 261→261
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D + JET184D / jet-power / dòng |GF21|21|17|19|15|K4100D… / hạng 28 ← đã có trong all gốc, điểm 261→269
all: ra 0, vào 0

### IB2300056149#0  (top ra 1, vào 1; dropped gốc 757 → nhánh 757)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Deutz / BF8M1015CPG1A + TFW24004 / dingbo / dòng |XG400GF|400/500|440/550… / hạng 30 → còn trong all nhánh, điểm 261→261
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Wudong / WD269TAD43 + LSA472M7 / wintpower / dòng |WTW550E|550|440KW|500|4… / hạng 30 ← đã có trong all gốc, điểm 254→262
all: ra 0, vào 0

### IB2300057123#0  (top ra 3, vào 3; dropped gốc 701 → nhánh 707)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC7H220D2 + LK274F / longkai-power / dòng |POWERYOURFUTURE|SC7H220… / hạng 6 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC7H230D2 + LK274G / longkai-power / dòng |POWERYOURFUTURE|SC7H230… / hạng 8 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSB67G4 + LK274G / longkai-power / dòng |POWERYOURFUTURE|QSB67G4… / hạng 18 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC7H230D2 + 1FC22824 / dingbo / dòng |XG150GF|150/1875|165/20… / hạng 27 ← đã có trong all gốc, điểm 252→252
- FAWDE / CA6DL124D + BW274G / bobig-power / dòng |BFA206|150|188|165|206|… / hạng 29 ← đã có trong all gốc, điểm 251→251
- Yuchai / YC6A245LD21 + WT274H / wintpower / dòng |WTYC200|150/188|160/200… / hạng 30 ← đã có trong all gốc, điểm 251→251
all: ra 6, vào 0

### IB2300074496#0  (top ra 1, vào 1; dropped gốc 1829 → nhánh 1834)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 8M21G660/5 + S5L1DE41 / kaihua-genset / dòng |HCBD660|660|600|8M21G66… / hạng 20 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Doosan / DP180LB/556KW + JET544FS/500KW / jet-power / dòng |DS688|688|550|625|500|D… / hạng 30 ← đã có trong all gốc, điểm 217→217
all: ra 4, vào 0

### IB2300078874#0  (top ra 2, vào 2; dropped gốc 499 → nhánh 503)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 6CTAA83G9 + LK274J / longkai-power / dòng |POWERYOURFUTURE|6CTAA83… / hạng 14 → không còn trong all nhánh (công cụ không ghi lý do khác)
- YTO / YM6H4LFD + UC274J / acepow-fuan / dòng |APYT190|60|3|190|209|23… / hạng 30 → còn trong all nhánh, điểm 269→269
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 6M16G275/5 + LSA463S5 / longkai-power / dòng |LG200BD|220|275|200|250… / hạng 21 ← đã có trong all gốc, điểm 273→273
- Cummins / 6LTAA89G3 + UC274K / acepow-fuan / dòng |APC200|200|250|220|275|… / hạng 29 ← đã có trong all gốc, điểm 269→269
all: ra 4, vào 0

### IB2300087393#0  (top ra 3, vào 3; dropped gốc 974 → nhánh 981)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / QSZ13G7 + LK444F / longkai-power / dòng |POWERYOURFUTURE|QSZ13G7… / hạng 11 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 6ETAA128G32 + LK444F / longkai-power / dòng |POWERYOURFUTURE|6ETAA12… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Perkins / 2506CE15TAG1 + S4L1DG41 / kaihua-genset / dòng |HC500GF|500|450|2506CE1… / hạng 30 → còn trong all nhánh, điểm 268→268
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / QSNTG3 + LK444F / longkai-power / dòng |POWERYOURFUTURE|QSNTG3|… / hạng 14 ← đã có trong all gốc, điểm 278→278
- SDEC / 6ETAA128G32 + BK314FS / bobig-power / dòng |BSD440|320|400|352|440|… / hạng 23 ← đã có trong all gốc, điểm 269→269
- Weichai / WP13D440E310 + LK544C / longkai-power / dòng |POWERYOURFUTURE|WP13D44… / hạng 27 ← đã có trong all gốc, điểm 269→269
all: ra 7, vào 0

### IB2300088930#0  (top ra 1, vào 1; dropped gốc 829 → nhánh 830)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Yangdong / Y4100D/345KW + JET184F/22KW / jet-power / dòng |YD28|28|22|25|20|Y4100D… / hạng 30 → còn trong all nhánh, điểm 212→212
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / 495D + STC20 / sunny-weifang / dòng |DB20GF|20/25|495D|STC20… / hạng 26 ← đã có trong all gốc, điểm 212→220
all: ra 1, vào 0

### IB2300092659#0  (top ra 3, vào 3; dropped gốc 1234 → nhánh 1240)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 6KTAA25G36 + LK544C / longkai-power / dòng |POWERYOURFUTURE|6KTAA25… / hạng 19 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSZ13G10 + LK544C / longkai-power / dòng |POWERYOURFUTURE|QSZ13G1… / hạng 20 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Volvo Penta / TAD1346GE + ECO403S4C / jet-power / dòng |V550T2|550|440|500|400|… / hạng 30 → còn trong all nhánh, điểm 261→261
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / QSK19G13 + LK544C / longkai-power / dòng |POWERYOURFUTURE|QSK19G1… / hạng 24 ← đã có trong all gốc, điểm 270→270
- Weichai / 6M33D572E200 + LK544E / longkai-power / dòng |POWERYOURFUTURE|6M33D57… / hạng 27 ← đã có trong all gốc, điểm 263→263
- Yuchai / YC6TD780D31 + TFW24504A / dingbo / dòng |XG450GF|450/5625|495/61… / hạng 30 ← đã có trong all gốc, điểm 256→256
all: ra 5, vào 0

### IB2300096122#0  (top ra 2, vào 2; dropped gốc 1328 → nhánh 1332)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Mitsubishi / S12A2PTA / comappower / dòng |COM963SL|963KVA|770KW|8… / hạng 24 → còn trong all nhánh, điểm 226→226
- ? / SC33G1150D2 + LK634D / longkai-power / dòng |POWERYOURFUTURE|SC33W11… / hạng 29 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 12M26G1000/6 + LSA493L10 / longkai-power / dòng |LG820BD|8976|1122|816|1… / hạng 20 ← đã có trong all gốc, điểm 237→237
- FAWDE / R820GE + R7204 / rcg-power / dòng |R900D5/S|900KVA/720KW|9… / hạng 30 ← đã có trong all gốc, điểm 159→159
all: ra 4, vào 0

### IB2300102941#0  (top ra 1, vào 1; dropped gốc 81 → nhánh 81)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Yuchai / YCDV254FHZ25 + NIANFENGNF184D / fdk-energy / dòng |Y23V2H1CONTACT|23KVA/18… / hạng 30 → còn trong all nhánh, điểm 240→240
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D + JET184D / jet-power / dòng |GF21|21|17|19|15|K4100D… / hạng 27 ← đã có trong all gốc, điểm 234→242
all: ra 0, vào 0

### IB2300102941#1  (top ra 2, vào 2; dropped gốc 77 → nhánh 80)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G2 + LK184F / longkai-power / dòng |POWERYOURFUTURE|4B39G2|… / hạng 10 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 4B39G11 + LK184E / longkai-power / dòng |POWERYOURFUTURE|4B39G11… / hạng 18 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 4B39G11 + BC184E / acepow-fuan / dòng |APC17|17|20|19|24|4B39G… / hạng 22 ← đã có trong all gốc, điểm 269→269
- Ricardo / K4100D + JET184D / jet-power / dòng |GF21|21|17|19|15|K4100D… / hạng 27 ← đã có trong all gốc, điểm 261→269
all: ra 3, vào 0

### IB2300108940#1  (top ra 2, vào 2; dropped gốc 229 → nhánh 232)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G2 + LK184F / longkai-power / dòng |POWERYOURFUTURE|4B39G2|… / hạng 7 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 4B39G11 + LK184E / longkai-power / dòng |POWERYOURFUTURE|4B39G11… / hạng 13 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 4B39G11 + BW184ES / bobig-power / dòng |BC22|16|20|18|22|4B39G1… / hạng 15 ← đã có trong all gốc, điểm 269→269
- Cummins / 4B39G2 + PI144E / sanq-power / dòng |SQC27|22/27|20/25|4B39G… / hạng 28 ← đã có trong all gốc, điểm 253→253
all: ra 3, vào 0

### IB2300116009#0  (top ra 1, vào 1; dropped gốc 2215 → nhánh 2220)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 8M21G660/5 + S5L1DE41 / kaihua-genset / dòng |HCBD660|660|600|8M21G66… / hạng 6 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Volvo Penta / TWD1653GEVOLVO / superwatt-swt / dòng |RATEDVOLTAGE|380V/400V/… / hạng 30 ← đã có trong all gốc, điểm 165→165
all: ra 4, vào 0

### IB2300120176#0  (top ra 1, vào 1; dropped gốc 72 → nhánh 72)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / WP23D25E200 + TALA40D / penlucky / dòng |PLW165/B1|165|15|WP23D2… / hạng 30 → còn trong all nhánh, điểm 216→216
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 25 ← đã có trong all gốc, điểm 213→221
all: ra 0, vào 0

### IB2300123990#0  (top ra 1, vào 1; dropped gốc 268 → nhánh 268)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Yangdong / Y495D + 184G / uleengen / dòng |UY30GFS|24|30|Y495D|27|… / hạng 18 → còn trong all nhánh, điểm 469→469
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D + 184G / uleengen / dòng |UH30GF|24|30|K4100D|184… / hạng 19 ← đã có trong all gốc, điểm 461→469
all: ra 0, vào 0

### IB2300130792#0  (top ra 1, vào 1; dropped gốc 975 → nhánh 978)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 6BT59G296KW + LK274D / longkai-power / dòng |POWERYOURFUTURE|6BT59G2… / hạng 25 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Lovol / 1006TG2A + UCI274C / wintpower / dòng |WTL110|80/100|88/110|10… / hạng 30 ← đã có trong all gốc, điểm 244→244
all: ra 3, vào 0

### IB2300131187#0  (top ra 1, vào 1; dropped gốc 78 → nhánh 78)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / WP23D25E200 + TALA40D / penlucky / dòng |PLW165/B1|165|15|WP23D2… / hạng 30 → còn trong all nhánh, điểm 216→216
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 25 ← đã có trong all gốc, điểm 213→221
all: ra 0, vào 0

### IB2300134568#0  (top ra 2, vào 2; dropped gốc 97 → nhánh 100)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G2 + LK184F / longkai-power / dòng |POWERYOURFUTURE|4B39G2|… / hạng 4 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 4B39G11 + LK184E / longkai-power / dòng |POWERYOURFUTURE|4B39G11… / hạng 5 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 4B39G11 + BW184ES / bobig-power / dòng |BC22|16|20|18|22|4B39G1… / hạng 16 ← đã có trong all gốc, điểm 269→269
- Cummins / 4B39G2 + PI144E / sanq-power / dòng |SQC27|22/27|20/25|4B39G… / hạng 24 ← đã có trong all gốc, điểm 264→264
all: ra 3, vào 0

### IB2300135650#0  (top ra 2, vào 2; dropped gốc 171 → nhánh 174)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G2 + LK184F / longkai-power / dòng |POWERYOURFUTURE|4B39G2|… / hạng 7 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 4B39G11 + LK184E / longkai-power / dòng |POWERYOURFUTURE|4B39G11… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 4B39G11 + BW184ES / bobig-power / dòng |BC22|16|20|18|22|4B39G1… / hạng 17 ← đã có trong all gốc, điểm 269→269
- Cummins / 4B39G2 + PI144E / sanq-power / dòng |SQC27|22/27|20/25|4B39G… / hạng 29 ← đã có trong all gốc, điểm 253→253
all: ra 3, vào 0

### IB2300136320#0  (top ra 1, vào 1; dropped gốc 101 → nhánh 101)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Perkins / 404A22G + STAFMORDPI144D / gb-power / dòng STANDARDFEATURES|MODEL|G… / hạng 30 → còn trong all nhánh, điểm 237→237
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D + JET184D / jet-power / dòng |GF21|21|17|19|15|K4100D… / hạng 22 ← đã có trong all gốc, điểm 234→242
all: ra 0, vào 0

### IB2300139360#0  (top ra 1, vào 1; dropped gốc 111 → nhánh 111)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G1 + PI144E / stone-power / dòng |SC25M5|22|20|28|25|4B39… / hạng 28 → còn trong all nhánh, điểm 253→253
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D + JET184E / jet-power / dòng |GF25|25|20|23|18|K4100D… / hạng 27 ← đã có trong all gốc, điểm 246→254
all: ra 0, vào 0

### IB2300139580#0  (top ra 1, vào 1; dropped gốc 145 → nhánh 148)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G12 + LK184G / longkai-power / dòng |POWERYOURFUTURE|4B39G12… / hạng 24 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Weichai / WP23D40E200 + LK184H / longkai-power / dòng |POWERYOURFUTURE|WP23D40… / hạng 30 ← đã có trong all gốc, điểm 253→253
all: ra 3, vào 0

### IB2300139646#0  (top ra 1, vào 1; dropped gốc 158 → nhánh 161)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G2 + LK184F / longkai-power / dòng |POWERYOURFUTURE|4B39G2|… / hạng 7 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 4B39G2 + PI144E / sanq-power / dòng |SQC27|22/27|20/25|4B39G… / hạng 28 ← đã có trong all gốc, điểm 253→253
all: ra 3, vào 0

### IB2300146335#0  (top ra 3, vào 3; dropped gốc 1780 → nhánh 1783)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 6ETAA118G21 + LK444E / longkai-power / dòng |POWERYOURFUTURE|6ETAA11… / hạng 20 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC12E460D2 + LK444E / longkai-power / dòng |POWERYOURFUTURE|SC12E46… / hạng 21 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSZ13G6 + LK444E / longkai-power / dòng |POWERYOURFUTURE|QSZ13G6… / hạng 23 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC12E460D2 + BW314F / bobig-power / dòng |BSD385|280|350|308|385|… / hạng 25 ← đã có trong all gốc, điểm 252→252
- SDEC / 6ETAA118G21 + JET444EM / jet-power / dòng |UK385S|385|308|350|280|… / hạng 27 ← đã có trong all gốc, điểm 252→252
- SDEC / SC15G500D2 + JET444FS1 / jet-power / dòng |SD385|385|308|350|280|S… / hạng 28 ← đã có trong all gốc, điểm 252→252
all: ra 3, vào 0

### IB2300146729#0  (top ra 2, vào 2; dropped gốc 537 → nhánh 541)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC12E420D2 + LK444E / longkai-power / dòng |POWERYOURFUTURE|SC12E42… / hạng 18 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / NTA855G2 + HCI444D / stone-power / dòng |SC344E6|303|275|379|344… / hạng 27 → còn trong all nhánh, điểm 269→269
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 6LTAA95G1 + LK444ES / longkai-power / dòng |POWERYOURFUTURE|6LTAA95… / hạng 22 ← đã có trong all gốc, điểm 271→271
- Perkins / 2206CE13TAG2 + HCI444E / sanq-power / dòng |SQP400|320/400|280/350|… / hạng 30 ← đã có trong all gốc, điểm 267→267
all: ra 4, vào 0

### IB2300147640#0  (top ra 4, vào 4; dropped gốc 654 → nhánh 660)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC8D280D2 + LK274H / longkai-power / dòng |POWERYOURFUTURE|SC8D280… / hạng 14 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC9D310D2 + LK274J / longkai-power / dòng |POWERYOURFUTURE|SC9D310… / hạng 23 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Weichai / WP10D238E200 + LK274J / longkai-power / dòng |POWERYOURFUTURE|WP10D23… / hạng 25 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Perkins / 1206AE70TTAG2 + BW274K / bobig-power / dòng |BP248|180|225|198|248|1… / hạng 30 → còn trong all nhánh, điểm 256→256
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC8D280D2 + JET274H / jet-power / dòng |SD220|220|176|200|160|S… / hạng 18 ← đã có trong all gốc, điểm 269→269
- Baudouin / 6M16G250/5 + LSA463S4 / longkai-power / dòng |LG184BD|2024|253|184|23… / hạng 25 ← đã có trong all gốc, điểm 258→258
- SDEC / SC9D310D2 + BW274J / bobig-power / dòng |BSD248|180|225|198|248|… / hạng 29 ← đã có trong all gốc, điểm 256→256
- Weichai / WP10D238E200 + JET274J / jet-power / dòng |WP250|250|200|225|180|W… / hạng 30 ← đã có trong all gốc, điểm 256→256
all: ra 6, vào 0

### IB2300147913#0  (top ra 1, vào 1; dropped gốc 347 → nhánh 353)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC8D280D2 + LK274H / longkai-power / dòng |POWERYOURFUTURE|SC8D280… / hạng 16 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC8D280D2 + BW274H / bobig-power / dòng |BSD220|160|200|176|220|… / hạng 26 ← đã có trong all gốc, điểm 269→269
all: ra 6, vào 0

### IB2300162912#1  (top ra 3, vào 3; dropped gốc 447 → nhánh 457)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 12M55G2750/5 + LSA523L12 / longkai-power / dòng |LG2000WP|2200|2750|2000… / hạng 4 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 12M55G2750/5 / voltgent / dòng |VB27505|2750|2200|2500|… / hạng 17 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 12M55G2550/5 / voltgent / dòng |VB25505|2550|2040|2280|… / hạng 22 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- MTU / 16V4000G14S(3B) / comappower / dòng |COM2625MTU|2625KVA|2100… / hạng 23 ← đã có trong all gốc, điểm 170→170
- MTU / 16V4000G74S(3D) / comappower / dòng |COM2625MTU|2625KVA|2100… / hạng 24 ← đã có trong all gốc, điểm 170→170
- Perkins / INDIA401661TRG3 / kaihua-genset / dòng |HC2500GF|2500|22725|IND… / hạng 25 ← đã có trong all gốc, điểm 165→165
all: ra 10, vào 0

### IB2300165112#0  (top ra 4, vào 4; dropped gốc 883 → nhánh 889)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / Deutz / WP41D100E200 + LK274C / longkai-power / dòng |POWERYOURFUTURE|WP41D10… / hạng 10 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 4HTAA43G21 + LK274C / longkai-power / dòng |POWERYOURFUTURE|4HTAA43… / hạng 22 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 6BT59G296KW + LK274D / longkai-power / dòng |POWERYOURFUTURE|6BT59G2… / hạng 26 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 6BT59G296KW + UCI274C80KW / yihua-fujian / dòng |GENERATORSETMODEL|YH100… / hạng 27 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Weichai / Deutz / WP41D100E200 + BW274C / bobig-power / dòng |BWC110|80|100|88|110|WP… / hạng 17 ← đã có trong all gốc, điểm 269→269
- SDEC / 4HTAA43G21 + JET274C / jet-power / dòng |SD110|110|88|100|80|4HT… / hạng 26 ← đã có trong all gốc, điểm 253→253
- FPT / NEF45TM3S500 + UCI274D / sanq-power / dòng |SQFP132|106/132|96/120|… / hạng 29 ← đã có trong all gốc, điểm 248→248
- Baudouin / 4M10G6D3/5 + UCI274C / rcg-power / dòng |RWB100D5S(STAGE3)|100KV… / hạng 30 ← đã có trong all gốc, điểm 244→244
all: ra 6, vào 0

### IB2300165519#0  (top ra 1, vào 1; dropped gốc 111 → nhánh 111)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G1 + PI144E / stone-power / dòng |SC25M5|22|20|28|25|4B39… / hạng 28 → còn trong all nhánh, điểm 253→253
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D + JET184E / jet-power / dòng |GF25|25|20|23|18|K4100D… / hạng 27 ← đã có trong all gốc, điểm 246→254
all: ra 0, vào 0

### IB2300177056#0  (top ra 2, vào 2; dropped gốc 32 → nhánh 32)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Perkins / 404D22TG + PI144E / sanq-power / dòng |SQP30|24/30|22/27|404D2… / hạng 13 → còn trong all nhánh, điểm 270→270
- Yangdong / Y490D + 184EF / uleengen / dòng |UY25GFS|20|25|Y490D|24|… / hạng 19 → còn trong all nhánh, điểm 269→269
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Perkins / 404D22TG + S0L2M1 / uleengen / dòng |UP25GF|20|25|404D22TG|P… / hạng 7 ← đã có trong all gốc, điểm 281→281
- Cummins / 4BT39G2 + PI144G / sanq-power / dòng |SQC33|264/33|24/30|4BT3… / hạng 27 ← đã có trong all gốc, điểm 258→258
all: ra 0, vào 0

### IB2300188511#0  (top ra 1, vào 1; dropped gốc 561 → nhánh 562)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / 16M55D2900E310 + LK734HG / longkai-power / dòng |POWERYOURFUTURE|16M55D2… / hạng 8 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / QSK78G24 + LVSI804T / ade-power / dòng |STANDBYPOWER(ESP)RATING… / hạng 28 ← đã có trong all gốc, điểm 188→188
all: ra 1, vào 0

### IB2300190927#1  (top ra 1, vào 1; dropped gốc 100 → nhánh 103)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC7H220D2 + LK274F / longkai-power / dòng |POWERYOURFUTURE|SC7H220… / hạng 22 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 6BTA59G2 + BW274D / bobig-power / dòng |BC15125S|110|138|121|15… / hạng 30 ← đã có trong all gốc, điểm 269→269
all: ra 3, vào 0

### IB2300191244#0  (top ra 1, vào 1; dropped gốc 1219 → nhánh 1221)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 6LTAA95G3 + LK444DS / longkai-power / dòng |POWERYOURFUTURE|6LTAA95… / hạng 20 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 6LTAA95G3 + BW314D / bobig-power / dòng |BC303|220|275|242|303|6… / hạng 27 ← đã có trong all gốc, điểm 259→259
all: ra 2, vào 0

### IB2300194791#0  (top ra 1, vào 1; dropped gốc 757 → nhánh 757)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Deutz / BF8M1015CPG1A + TFW24004 / dingbo / dòng |XG400GF|400/500|440/550… / hạng 30 → còn trong all nhánh, điểm 261→261
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Wudong / WD269TAD43 + LSA472M7 / wintpower / dòng |WTW550E|550|440KW|500|4… / hạng 30 ← đã có trong all gốc, điểm 254→262
all: ra 0, vào 0

### IB2300204857#0  (top ra 2, vào 2; dropped gốc 78 → nhánh 81)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC8D280D2 + LK274H / longkai-power / dòng |POWERYOURFUTURE|SC8D280… / hạng 19 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC7H250D2 + JET274G / jet-power / dòng |SD200|200|160|180|144|S… / hạng 28 → còn trong all nhánh, điểm 269→269
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC8D280D2 + JET274H / jet-power / dòng |SD220|220|176|200|160|S… / hạng 25 ← đã có trong all gốc, điểm 269→269
- SDEC / SC7H250D2 + 1FC22824 / dingbo / dòng |XG150GF|150/1875|165/20… / hạng 28 ← đã có trong all gốc, điểm 269→269
all: ra 3, vào 0

### IB2300205363#1  (top ra 1, vào 1; dropped gốc 699 → nhánh 699)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / 6M26D484E200 + BW354D / bobig-power / dòng |BWC550|400|500|440|550|… / hạng 30 → còn trong all nhánh, điểm 261→261
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Wudong / WD269TAD43 + LSA472M7 / wintpower / dòng |WTW550E|550|440KW|500|4… / hạng 29 ← đã có trong all gốc, điểm 254→262
all: ra 0, vào 0

### IB2300212042#0  (top ra 1, vào 1; dropped gốc 1236 → nhánh 1237)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- ? / 4BTA39G258KW + LK224F / longkai-power / dòng |POWERYOURFUTURE|4BTA39G… / hạng 19 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Quanchai / QC498ZLD / elitech-power / dòng |EPS70QCA3|QUANCHAI|70KV… / hạng 30 ← đã có trong all gốc, điểm 157→157
all: ra 1, vào 0

### IB2300212821#1  (top ra 1, vào 1; dropped gốc 6 → nhánh 6)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Quanchai / QC385D + ELECMAMA164B / yongcai-elecmama / dòng |YCM9QC50|12|10|11|9|QUA… / hạng 30 → còn trong all nhánh, điểm 213→213
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 30 ← đã có trong all gốc, điểm 208→216
all: ra 0, vào 0

### IB2300214975#0  (top ra 1, vào 1; dropped gốc 929 → nhánh 933)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC12E420D2 + LK444E / longkai-power / dòng |POWERYOURFUTURE|SC12E42… / hạng 13 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 6M16G350/5 + TALA46F / kaihua-genset / dòng |HCBD330|330|300|6M16G35… / hạng 30 ← đã có trong all gốc, điểm 265→265
all: ra 4, vào 0

### IB2300220302#0  (top ra 1, vào 1; dropped gốc 232 → nhánh 238)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC8D280D2 + LK274H / longkai-power / dòng |POWERYOURFUTURE|SC8D280… / hạng 23 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- YTO / YM6H4LD + UC274H / acepow-fuan / dòng |APYT160|50|3|160|176|20… / hạng 30 ← đã có trong all gốc, điểm 469→469
all: ra 6, vào 0

### IB2300225452#0  (top ra 3, vào 3; dropped gốc 245 → nhánh 245)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Yangdong / Y490D + 184EF / uleengen / dòng |UY25GFS|20|25|Y490D|24|… / hạng 17 → còn trong all nhánh, điểm 469→469
- Perkins / 404D22TG + PI144F / jet-power / dòng |P30|30|24|27|22|404D22T… / hạng 21 → còn trong all nhánh, điểm 461→461
- Cummins / 4B39G11 + S0L2M1 / sr-genset / dòng |275|22|25|20|4B39G11|ME… / hạng 30 → còn trong all nhánh, điểm 441→441
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Perkins / 404D22TG + S0L2M1 / uleengen / dòng |UP25GF|20|25|404D22TG|P… / hạng 7 ← đã có trong all gốc, điểm 481→481
- Ricardo / 495D + STC20 / sunny-weifang / dòng |DB20GF|20/25|495D|STC20… / hạng 29 ← đã có trong all gốc, điểm 437→445
- SDEC / 4Z30G21 + JET184F / jet-power / dòng |SD30|30|24|275|22|4Z30G… / hạng 30 ← đã có trong all gốc, điểm 443→443
all: ra 0, vào 0

### IB2300230061#0  (top ra 3, vào 1; dropped gốc 28 → nhánh 31)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 6M11G4D0/S / genmac / dòng EXPRESSG151BO1651506M11G… / hạng 3 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 6M11G4D0/S / cgm-italia / dòng |150B||150|120|165|132|6… / hạng 9 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 6M11G4D0/S / coelmo / dòng POTENZAPRP(KVA)150POTENZ… / hạng 10 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- FPT / B200 / cgm-italia / dòng |150F||150|120|165|132|F… / hạng 11 ← đã có trong all gốc, điểm 75→75
all: ra 3, vào 0

### IB2300232318#0  (top ra 1, vào 1; dropped gốc 5 → nhánh 5)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Perkins / 404A22G1 + PI144D / jet-power / dòng |P22|22|18|20|16|404A22G… / hạng 29 → còn trong all nhánh, điểm 242→242
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D + JET184D / jet-power / dòng |GF21|21|17|19|15|K4100D… / hạng 27 ← đã có trong all gốc, điểm 236→244
all: ra 0, vào 0

### IB2300232318#1  (top ra 2, vào 2; dropped gốc 9 → nhánh 9)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Perkins / 404A22G1 + S0L2G1 / uleengen / dòng |UP20GF|16|20|404A22G1|P… / hạng 7 → còn trong all nhánh, điểm 276→276
- Yuchai / YCDV254FHZ25 + NIANFENGNF184D / fdk-energy / dòng |Y23V2H1CONTACT|23KVA/18… / hạng 20 → còn trong all nhánh, điểm 268→268
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Perkins / 404A22G1 + S0L2G1 / fdk-energy / dòng |P23/H1CONTACT|23KVA/18K… / hạng 7 ← đã có trong all gốc, điểm 276→276
- Yangdong / YSD490D + 164D / uleengen / dòng |UY20GFS|16|20|YSD490D|2… / hạng 28 ← đã có trong all gốc, điểm 264→264
all: ra 0, vào 0

### IB2300232850#0  (top ra 1, vào 1; dropped gốc 32 → nhánh 32)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- FAWDE / 4DW8128D + SYA164B / minsun-motor / dòng |GFF125|125|10|4DW8128D|… / hạng 30 → còn trong all nhánh, điểm 221→221
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 26 ← đã có trong all gốc, điểm 217→225
all: ra 0, vào 0

### IB2300236144#0  (top ra 1, vào 1; dropped gốc 198 → nhánh 200)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4BTA39G11 + LK224F / longkai-power / dòng |POWERYOURFUTURE|4BTA39G… / hạng 18 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC4H95D2 + JET224E / jet-power / dòng |SD69|69|55|63|50|SC4H95… / hạng 27 ← đã có trong all gốc, điểm 264→264
all: ra 2, vào 0

### IB2300247709#0  (top ra 1, vào 1; dropped gốc 361 → nhánh 365)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4BTA39G11 + LK224F / longkai-power / dòng |POWERYOURFUTURE|4BTA39G… / hạng 20 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 4M10G70/5 + TALA42H / kaihua-genset / dòng |HCBD70|688|625|4M10G70/… / hạng 30 ← đã có trong all gốc, điểm 461→461
all: ra 4, vào 0

### IB2300248981#0  (top ra 1, vào 1; dropped gốc 29 → nhánh 30)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 16M33G2000/5 / weichai-heavy-machinery / dòng |WPG2000*7|1500|2000/165… / hạng 30 → còn trong all nhánh, điểm 130→130
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 16M33G1650/6 / weichai-heavy-machinery / dòng |WPG1650*76|1800|2000/16… / hạng 30 ← đã có trong all gốc, điểm 122→130
all: ra 1, vào 0

### IB2300254479#0  (top ra 2, vào 2; dropped gốc 1572 → nhánh 1578)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Mitsubishi / S12A2PTA + TALA49C / rcg-power / dòng |RJM800D5S|800KVA/640KW|… / hạng 5 → còn trong all nhánh, điểm 241→241
- Doosan / Hyundai / DP222CB / aosif / dòng |AD894|813/650|900/720|D… / hạng 13 → còn trong all nhánh, điểm 221→221
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Doosan / Hyundai / DP222CB + TALA49C / rcg-power / dòng |RHD810D5S|810KVA/648KW|… / hạng 6 ← đã có trong all gốc, điểm 233→233
- Volvo Penta / TWD1744GE / mecca-power / dòng |MC833V|606|758|666|833|… / hạng 30 ← đã có trong all gốc, điểm 173→173
all: ra 6, vào 0

### IB2300260615#0  (top ra 2, vào 2; dropped gốc 1095 → nhánh 1097)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / QSZ13G10 + LK544C / longkai-power / dòng |POWERYOURFUTURE|QSZ13G1… / hạng 21 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Volvo Penta / TAD1641GE + LSA472M7 / dingbo / dòng |XG400GF|400/500|440/550… / hạng 30 → còn trong all nhánh, điểm 262→262
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / KTAA19G5 + HCI544D / yongcai-elecmama / dòng |YCM440CC|605|484|550|44… / hạng 23 ← đã có trong all gốc, điểm 274→274
- Weichai / 6M33D572E200 + LK544E / longkai-power / dòng |POWERYOURFUTURE|6M33D57… / hạng 30 ← đã có trong all gốc, điểm 263→263
all: ra 2, vào 0

### IB2300269124#0  (top ra 2, vào 2; dropped gốc 1393 → nhánh 1398)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 12M26G1000/5 + S6L1DD4 / rcg-power / dòng |RWB900D5S(STAGE2)|900KV… / hạng 23 → còn trong all nhánh, điểm 228→228
- ? / SC33G1150D2 + LK634D / longkai-power / dòng |POWERYOURFUTURE|SC33W11… / hạng 30 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 12M26G900/5 + LSA493M8 / longkai-power / dòng |LG650BD|7172|8965|652|8… / hạng 16 ← đã có trong all gốc, điểm 239→247
- FAWDE / R728GE + R6404 / rcg-power / dòng |R800D5/S|800KVA/640KW|8… / hạng 30 ← đã có trong all gốc, điểm 165→165
all: ra 5, vào 0

### IB2300269619#0  (top ra 1, vào 1; dropped gốc 699 → nhánh 699)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / 6M26D484E200 + BW354D / bobig-power / dòng |BWC550|400|500|440|550|… / hạng 30 → còn trong all nhánh, điểm 261→261
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Wudong / WD269TAD43 + LSA472M7 / wintpower / dòng |WTW550E|550|440KW|500|4… / hạng 29 ← đã có trong all gốc, điểm 254→262
all: ra 0, vào 0

### IB2300274793#1  (top ra 2, vào 2; dropped gốc 867 → nhánh 874)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 6ETAA128G32 + LK444F / longkai-power / dòng |POWERYOURFUTURE|6ETAA12… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Perkins / 2506CE15TAG1 + S4L1DG41 / kaihua-genset / dòng |HC500GF|500|450|2506CE1… / hạng 30 → còn trong all nhánh, điểm 268→268
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / 6ETAA128G32 + BK314FS / bobig-power / dòng |BSD440|320|400|352|440|… / hạng 23 ← đã có trong all gốc, điểm 269→269
- Weichai / WP13D440E310 + LK544C / longkai-power / dòng |POWERYOURFUTURE|WP13D44… / hạng 27 ← đã có trong all gốc, điểm 269→269
all: ra 7, vào 0

### IB2300274793#2  (top ra 5, vào 5; dropped gốc 766 → nhánh 772)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 6KTAA25G36 + LK544C / longkai-power / dòng |POWERYOURFUTURE|6KTAA25… / hạng 20 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC25G690D2 + LK544C / longkai-power / dòng |POWERYOURFUTURE|SC25G69… / hạng 21 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSZ13G10 + LK544C / longkai-power / dòng |POWERYOURFUTURE|QSZ13G1… / hạng 22 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Deutz / BF8M1015CPG1A + TFW24004 / dingbo / dòng |XG400GF|400/500|440/550… / hạng 29 → còn trong all nhánh, điểm 261→261
- Weichai / 6M26D484E200 + BW354D / bobig-power / dòng |BWC550|400|500|440|550|… / hạng 30 → còn trong all nhánh, điểm 261→261
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Weichai / 6M26D484E200 + LK544C / longkai-power / dòng |POWERYOURFUTURE|6M26D48… / hạng 24 ← đã có trong all gốc, điểm 270→270
- Cummins / QSK19G13 + LK544C / longkai-power / dòng |POWERYOURFUTURE|QSK19G1… / hạng 25 ← đã có trong all gốc, điểm 270→270
- SDEC / SC25G690D2 + 1FC23544 / dingbo / dòng |XG400GF|400/500|440/550… / hạng 26 ← đã có trong all gốc, điểm 269→269
- Weichai / 6M33D572E200 + LK544E / longkai-power / dòng |POWERYOURFUTURE|6M33D57… / hạng 28 ← đã có trong all gốc, điểm 263→263
- Wudong / WD269TAD43 + LSA472M7 / wintpower / dòng |WTW550E|550|440KW|500|4… / hạng 30 ← đã có trong all gốc, điểm 254→262
all: ra 6, vào 0

### IB2300277166#0  (top ra 1, vào 1; dropped gốc 1100 → nhánh 1105)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / QSB67G4 + LK274G / longkai-power / dòng |POWERYOURFUTURE|QSB67G4… / hạng 11 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Deutz / BF6M1013FCG2 + 274G / uleengen / dòng |UD188GF|150|188|BF6M101… / hạng 28 ← đã có trong all gốc, điểm 251→251
all: ra 5, vào 0

### IB2300278513#0  (top ra 7, vào 7; dropped gốc 865 → nhánh 872)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC27G900D2 + LK544F / longkai-power / dòng |POWERYOURFUTURE|SC27G90… / hạng 4 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 6KTAA25G33 + LK544F / longkai-power / dòng |POWERYOURFUTURE|6KTAA25… / hạng 10 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Weichai / 6M33D633E200 + JET544F / jet-power / dòng |WP725|725|580|650|520|6… / hạng 14 → còn trong all nhánh, điểm 269→269
- Cummins / QSK19G4 + HCI544F1 / dingbo / dòng |XG520GF|520/650|572/715… / hạng 15 → còn trong all nhánh, điểm 269→269
- Weichai / 6M33D670E200 + BW354F / bobig-power / dòng |BWC756|550|688|605|756|… / hạng 25 → còn trong all nhánh, điểm 263→263
- SDEC / SC33W990D2 + LK634B / longkai-power / dòng |POWERYOURFUTURE|SC33W99… / hạng 28 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 6KTAA25G32 + LK634B / longkai-power / dòng |POWERYOURFUTURE|6KTAA25… / hạng 29 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Weichai / 6M33D633E200 + LK544F / longkai-power / dòng |POWERYOURFUTURE|6M33D63… / hạng 1 ← đã có trong all gốc, điểm 278→278
- Cummins / QSK19G4 + LK544F / longkai-power / dòng |POWERYOURFUTURE|QSK19G4… / hạng 2 ← đã có trong all gốc, điểm 278→278
- Weichai / 6M33D670E200 + LK544F / longkai-power / dòng |POWERYOURFUTURE|6M33D67… / hạng 6 ← đã có trong all gốc, điểm 274→274
- Cummins / KTA38G1 + LK634B/S / longkai-power / dòng |POWERYOURFUTURE|KTA38G1… / hạng 19 ← đã có trong all gốc, điểm 268→268
- SDEC / SC27G900D2 + BW354F / bobig-power / dòng |BSD743|540|675|594|743|… / hạng 23 ← đã có trong all gốc, điểm 265→265
- Yuchai / YC6TD1000D30 + TFW26004A / dingbo / dòng |XG600GF|600/750|660/825… / hạng 29 ← đã có trong all gốc, điểm 254→254
- SDEC / 6KTAA25G320 + JET634B / jet-power / dòng |SD825|825|660|750|600|6… / hạng 30 ← đã có trong all gốc, điểm 254→254
all: ra 7, vào 0

### IB2300284871#0  (top ra 1, vào 1; dropped gốc 296 → nhánh 298)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / S38G4 + PI144J / sanq-power / dòng |SQIC44|35/44|32/40|S38G… / hạng 30 → còn trong all nhánh, điểm 229→229
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / victory-generator / dòng |V32T|60|28|35|32|40|K41… / hạng 30 ← đã có trong all gốc, điểm 221→229
all: ra 2, vào 0

### IB2300285618#0  (top ra 3, vào 3; dropped gốc 244 → nhánh 255)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 6LTAA95G1 + HCI444ES / fdk-energy / dòng CUMMINSMODEL:6LTAA95G1GE… / hạng 7 → còn trong all nhánh, điểm 281→281
- Cummins / 6LTAA95G1 + LK444ES / longkai-power / dòng |POWERYOURFUTURE|6LTAA95… / hạng 24 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC12E420D2 + LK444E / longkai-power / dòng |POWERYOURFUTURE|SC12E42… / hạng 25 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC13G420D2 + NIANFENGNF314E / fdk-energy / dòng |SC344V2H1CONTACT|344KVA… / hạng 25 ← đã có trong all gốc, điểm 277→277
- Cummins / 6ZTAA13G3 + HCI444D / stone-power / dòng |SC375E6|330|300|413|375… / hạng 26 ← đã có trong all gốc, điểm 270→270
- Cummins / 6LTAA95G1 + BW314D / bobig-power / dòng |BC34375S|250|313|275|34… / hạng 28 ← đã có trong all gốc, điểm 269→269
all: ra 11, vào 0

### IB2300288169#0  (top ra 2, vào 2; dropped gốc 2203 → nhánh 2205)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / WP13D405E200 + LK444F / longkai-power / dòng |POWERYOURFUTURE|WP13D40… / hạng 6 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Weichai / WP13D440E310 + LK544C / longkai-power / dòng |POWERYOURFUTURE|WP13D44… / hạng 12 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Weichai / WP13D405E200 + BW354C / bobig-power / dòng |BWC454|330|413|363|454|… / hạng 15 ← đã có trong all gốc, điểm 266→266
- Weichai / WP13D440E310 + BW354C / bobig-power / dòng |BWC495|360|450|396|495|… / hạng 19 ← đã có trong all gốc, điểm 256→256
all: ra 2, vào 0

### IB2300292168#0  (top ra 1, vào 1; dropped gốc 4 → nhánh 4)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Yanmar / 3TNV82AGGE + TALA40C / sr-genset / dòng |132|1056|120|96|3TNV82A… / hạng 30 → còn trong all nhánh, điểm 217→217
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 30 ← đã có trong all gốc, điểm 213→221
all: ra 0, vào 0

### IB2300305484#0  (top ra 3, vào 3; dropped gốc 508 → nhánh 516)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / QSZ13G7 + LK444F / longkai-power / dòng |POWERYOURFUTURE|QSZ13G7… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 6ETAA128G32 + LK444F / longkai-power / dòng |POWERYOURFUTURE|6ETAA12… / hạng 19 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Volvo Penta / TAD1344GEB + ECO401S4C / jet-power / dòng |V440T2|440|352|400|320|… / hạng 30 → còn trong all nhánh, điểm 269→269
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / QSNTG3 + LK444F / longkai-power / dòng |POWERYOURFUTURE|QSNTG3|… / hạng 18 ← đã có trong all gốc, điểm 278→278
- SDEC / 6ETAA118G31 + LK444E / longkai-power / dòng |POWERYOURFUTURE|6ETAA11… / hạng 23 ← đã có trong all gốc, điểm 278→278
- SDEC / 6ETAA128G32 + BK314FS / bobig-power / dòng |BSD440|320|400|352|440|… / hạng 28 ← đã có trong all gốc, điểm 269→269
all: ra 8, vào 0

### IB2300307974#0  (top ra 1, vào 1; dropped gốc 585 → nhánh 588)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 6BTAA59G2 + LK274D / longkai-power / dòng |POWERYOURFUTURE|6BTAA59… / hạng 10 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 6BTAA59G2 + UCI274E / sanq-power / dòng |SQC150|120/150|110/138|… / hạng 14 ← đã có trong all gốc, điểm 269→269
all: ra 3, vào 0

### IB2300312776#0  (top ra 1, vào 1; dropped gốc 106 → nhánh 106)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Quanchai / QC380D / elitech-power / dòng |EPS10QCA3|QUANCHAI|10KV… / hạng 30 → còn trong all nhánh, điểm 197→197
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 29 ← đã có trong all gốc, điểm 191→199
all: ra 0, vào 0

### IB2300319233#0  (top ra 1, vào 1; dropped gốc 699 → nhánh 699)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / 6M26D484E200 + BW354D / bobig-power / dòng |BWC550|400|500|440|550|… / hạng 30 → còn trong all nhánh, điểm 261→261
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Wudong / WD269TAD43 + LSA472M7 / wintpower / dòng |WTW550E|550|440KW|500|4… / hạng 29 ← đã có trong all gốc, điểm 254→262
all: ra 0, vào 0

### IB2300335255#0  (top ra 1, vào 1; dropped gốc 131 → nhánh 135)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC8D280D2 + LK274H / longkai-power / dòng |POWERYOURFUTURE|SC8D280… / hạng 16 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC8D280D2 + BW274H / bobig-power / dòng |BSD220|160|200|176|220|… / hạng 26 ← đã có trong all gốc, điểm 269→269
all: ra 4, vào 0

### IB2300340905#0  (top ra 3, vào 3; dropped gốc 873 → nhánh 878)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 4HTAA43G21 + LK274C / longkai-power / dòng |POWERYOURFUTURE|4HTAA43… / hạng 22 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 6BT59G296KW + LK274D / longkai-power / dòng |POWERYOURFUTURE|6BT59G2… / hạng 26 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 6BT59G296KW + UCI274C80KW / yihua-fujian / dòng |GENERATORSETMODEL|YH100… / hạng 27 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / 4HTAA43G21 + JET274C / jet-power / dòng |SD110|110|88|100|80|4HT… / hạng 26 ← đã có trong all gốc, điểm 253→253
- FPT / NEF45TM3S500 + UCI274D / sanq-power / dòng |SQFP132|106/132|96/120|… / hạng 29 ← đã có trong all gốc, điểm 248→248
- Baudouin / 4M10G6D3/5 + UCI274C / rcg-power / dòng |RWB100D5S(STAGE3)|100KV… / hạng 30 ← đã có trong all gốc, điểm 244→244
all: ra 5, vào 0

### IB2300343668#0  (top ra 3, vào 3; dropped gốc 197 → nhánh 204)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC33W990D2 + LK634B / longkai-power / dòng |POWERYOURFUTURE|SC33W99… / hạng 12 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 6KTAA25G32 + LK634B / longkai-power / dòng |POWERYOURFUTURE|6KTAA25… / hạng 13 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSK23G2 + HCI634G / sanq-power / dòng |SQIC810|650/810|600/750… / hạng 25 → còn trong all nhánh, điểm 269→269
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / KTA38G1 + LK634B/S / longkai-power / dòng |POWERYOURFUTURE|KTA38G1… / hạng 12 ← đã có trong all gốc, điểm 278→278
- Baudouin / 6M33G825/5 + LSA493M65 / longkai-power / dòng |LG600BD|660|825|600|750… / hạng 16 ← đã có trong all gốc, điểm 275→275
- SDEC / SC33W990D2 + JET634B / jet-power / dòng |SD825|825|660|750|600|S… / hạng 25 ← đã có trong all gốc, điểm 269→269
all: ra 7, vào 0

### IB2300346506#0  (top ra 2, vào 2; dropped gốc 1425 → nhánh 1427)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 6LTAA89G2 + UCD274K / uleengen / dòng |UC250GF|200|250|6LTAA89… / hạng 7 → còn trong all nhánh, điểm 278→278
- SDEC / SC10E380D2 + LK444DS / longkai-power / dòng |POWERYOURFUTURE|SC10E38… / hạng 12 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- FAWDE / CA6DM2J39D + 4ES / uleengen / dòng |UX300GF|240|300|CA6DM2J… / hạng 24 ← đã có trong all gốc, điểm 249→249
- Perkins / 1206AE70TTAG3 + TALA46D / sr-genset / dòng |50|400|200|250|220|275|… / hạng 30 ← đã có trong all gốc, điểm 241→241
all: ra 2, vào 0

### IB2300360864#0  (top ra 1, vào 1; dropped gốc 451 → nhánh 452)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 4HT43G21 + LK224E / longkai-power / dòng |POWERYOURFUTURE|4HT43G2… / hạng 28 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Yanmar / 4TNV106GGE + UCI224D / sanq-power / dòng |SQY55|44/55|40/50|4TNV1… / hạng 30 ← đã có trong all gốc, điểm 236→236
all: ra 1, vào 0

### IB2300363623#2  (top ra 1, vào 1; dropped gốc 64 → nhánh 64)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / WP23D25E200 + TALA40D / penlucky / dòng |PLW165/B1|165|15|WP23D2… / hạng 30 → còn trong all nhánh, điểm 241→241
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D + JET184D / jet-power / dòng |GF21|21|17|19|15|K4100D… / hạng 27 ← đã có trong all gốc, điểm 234→242
all: ra 0, vào 0

### IB2300372629#0  (top ra 1, vào 1; dropped gốc 99 → nhánh 102)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G2 + LK184F / longkai-power / dòng |POWERYOURFUTURE|4B39G2|… / hạng 7 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 4B39G2 + PI144E / sanq-power / dòng |SQC27|22/27|20/25|4B39G… / hạng 30 ← đã có trong all gốc, điểm 253→253
all: ra 3, vào 0

### IB2400008052#1  (top ra 1, vào 1; dropped gốc 88 → nhánh 92)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 6BT59G296KW + LK274D / longkai-power / dòng |POWERYOURFUTURE|6BT59G2… / hạng 22 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / QSB5G3 / aosif / dòng GENERALPERFORMANCEDATA|P… / hạng 30 ← đã có trong all gốc, điểm 705→705
all: ra 4, vào 0

### IB2400026437#0  (top ra 2, vào 2; dropped gốc 826 → nhánh 832)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / QSZ13G6 + LK444E / longkai-power / dòng |POWERYOURFUTURE|QSZ13G6… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC15G500D2 + LK444F / longkai-power / dòng |POWERYOURFUTURE|SC15G50… / hạng 20 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Weichai / WP13D385E200 + LK444FS / longkai-power / dòng |POWERYOURFUTURE|WP13D38… / hạng 20 ← đã có trong all gốc, điểm 271→271
- Yuchai / YC6MJ480LD20 + WT444E / wintpower / dòng |WTYC375|280/350|300/375… / hạng 30 ← đã có trong all gốc, điểm 265→265
all: ra 6, vào 0

### IB2400031211#0  (top ra 1, vào 1; dropped gốc 699 → nhánh 699)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / 6M26D484E200 + BW354D / bobig-power / dòng |BWC550|400|500|440|550|… / hạng 30 → còn trong all nhánh, điểm 261→261
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Wudong / WD269TAD43 + LSA472M7 / wintpower / dòng |WTW550E|550|440KW|500|4… / hạng 29 ← đã có trong all gốc, điểm 254→262
all: ra 0, vào 0

### IB2400031785#0  (top ra 3, vào 3; dropped gốc 331 → nhánh 335)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G2 + LK184F / longkai-power / dòng |POWERYOURFUTURE|4B39G2|… / hạng 2 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 4B39G11 + LK184E / longkai-power / dòng |POWERYOURFUTURE|4B39G11… / hạng 3 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Yanmar / 4TNV98GGE + PI144H / sanq-power / dòng |SQY35|28/35|25/31|4TNV9… / hạng 26 → còn trong all nhánh, điểm 240→240
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 4B39G11 + BW184ES / bobig-power / dòng |BC2475S|18|23|20|25|4B3… / hạng 5 ← đã có trong all gốc, điểm 269→269
- Cummins / 4B39G2 + PI144E / sanq-power / dòng |SQC27|22/27|20/25|4B39G… / hạng 9 ← đã có trong all gốc, điểm 269→269
- Ricardo / 495D + STC20 / sunny-weifang / dòng |DB20GF|20/25|495D|STC20… / hạng 29 ← đã có trong all gốc, điểm 228→236
all: ra 4, vào 0

### IB2400061965#0  (top ra 1, vào 1; dropped gốc 145 → nhánh 148)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G12 + LK184G / longkai-power / dòng |POWERYOURFUTURE|4B39G12… / hạng 24 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Weichai / WP23D40E200 + LK184H / longkai-power / dòng |POWERYOURFUTURE|WP23D40… / hạng 30 ← đã có trong all gốc, điểm 253→253
all: ra 3, vào 0

### IB2400064139#0  (top ra 2, vào 2; dropped gốc 82 → nhánh 85)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G2 + LK184F / longkai-power / dòng |POWERYOURFUTURE|4B39G2|… / hạng 7 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 4B39G11 + LK184E / longkai-power / dòng |POWERYOURFUTURE|4B39G11… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 4B39G11 + BW184ES / bobig-power / dòng |BC22|16|20|18|22|4B39G1… / hạng 17 ← đã có trong all gốc, điểm 269→269
- Perkins / 404D22TG + PI144E / gb-power / dòng |MODEL|GBP25|STANDBYPOWE… / hạng 30 ← đã có trong all gốc, điểm 253→253
all: ra 3, vào 0

### IB2400067035#0  (top ra 2, vào 2; dropped gốc 508 → nhánh 513)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 6CTAA83G9 + LK274J / longkai-power / dòng |POWERYOURFUTURE|6CTAA83… / hạng 14 → không còn trong all nhánh (công cụ không ghi lý do khác)
- YTO / YM6H4LFD + UC274J / acepow-fuan / dòng |APYT190|60|3|190|209|23… / hạng 30 → còn trong all nhánh, điểm 269→269
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 6M16G275/5 + LSA463S5 / longkai-power / dòng |LG200BD|220|275|200|250… / hạng 21 ← đã có trong all gốc, điểm 273→273
- Cummins / 6LTAA89G3 + UC274K / acepow-fuan / dòng |APC200|200|250|220|275|… / hạng 29 ← đã có trong all gốc, điểm 269→269
all: ra 5, vào 0

### IB2400067509#0  (top ra 1, vào 1; dropped gốc 69 → nhánh 69)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / WP23D25E200 + TALA40D / penlucky / dòng |PLW165/B1|165|15|WP23D2… / hạng 30 → còn trong all nhánh, điểm 216→216
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 25 ← đã có trong all gốc, điểm 213→221
all: ra 0, vào 0

### IB2400079896#1  (top ra 1, vào 1; dropped gốc 88 → nhánh 92)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 6BT59G296KW + LK274D / longkai-power / dòng |POWERYOURFUTURE|6BT59G2… / hạng 22 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / QSB5G3 / aosif / dòng GENERALPERFORMANCEDATA|P… / hạng 30 ← đã có trong all gốc, điểm 705→705
all: ra 4, vào 0

### IB2400113875#0  (top ra 2, vào 2; dropped gốc 163 → nhánh 165)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4BTA39G11 + LK224F / longkai-power / dòng |POWERYOURFUTURE|4BTA39G… / hạng 11 → không còn trong all nhánh (công cụ không ghi lý do khác)
- FAWDE / CA4DF212D + 224F / uleengen / dòng |UX75GF|60|75|CA4DF212D|… / hạng 30 → còn trong all nhánh, điểm 255→255
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 4BTA39G11 + UCI224F / sanq-power / dòng |SQC80|64/80|58/72|4BTA3… / hạng 12 ← đã có trong all gốc, điểm 275→275
- SDEC / 4HT43G22 + LK224F / longkai-power / dòng |POWERYOURFUTURE|4HT43G2… / hạng 28 ← đã có trong all gốc, điểm 258→258
all: ra 2, vào 0

### IB2400134652#0  (top ra 2, vào 2; dropped gốc 514 → nhánh 516)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 4HT43G22 + LK224F / longkai-power / dòng |POWERYOURFUTURE|4HT43G2… / hạng 20 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Weichai / WP41D80E200 + LK224F / longkai-power / dòng |POWERYOURFUTURE|WP41D80… / hạng 24 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Weichai / WP41D80E200 + BW224F / bobig-power / dòng |BWC83|60|75|66|83|WP41D… / hạng 23 ← đã có trong all gốc, điểm 259→259
- SDEC / SC4H115D2 + BW224G / bobig-power / dòng |BSD88|64|80|70|88|SC4H1… / hạng 30 ← đã có trong all gốc, điểm 251→251
all: ra 2, vào 0

### IB2400144224#0  (top ra 1, vào 1; dropped gốc 4 → nhánh 4)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Yanmar / 3TNV82AGGE + TALA40C / sr-genset / dòng |132|1056|120|96|3TNV82A… / hạng 30 → còn trong all nhánh, điểm 217→217
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 30 ← đã có trong all gốc, điểm 213→221
all: ra 0, vào 0

### IB2400145438#2  (top ra 1, vào 1; dropped gốc 0 → nhánh 0)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Yanmar / 3TNV82AGGE + TALA40C / sr-genset / dòng |132|1056|120|96|3TNV82A… / hạng 30 → còn trong all nhánh, điểm 217→217
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 30 ← đã có trong all gốc, điểm 213→221
all: ra 0, vào 0

### IB2400145438#3  (top ra 2, vào 2; dropped gốc 185 → nhánh 185)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Yangdong / YD485D/17KW + JET164D/128KW / jet-power / dòng |YD17|165|132|15|12|YD48… / hạng 22 → còn trong all nhánh, điểm 228→228
- Deutz / F2L912 + 164D / uleengen / dòng |UD15GF|12|15|F2L912|14|… / hạng 30 → còn trong all nhánh, điểm 220→220
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D + JET184D / jet-power / dòng |GF21|21|17|19|15|K4100D… / hạng 22 ← đã có trong all gốc, điểm 222→230
- Ricardo / K4100D / elitech-power / dòng |EPS15RKA3|RICARDO|15KVA… / hạng 26 ← đã có trong all gốc, điểm 212→220
all: ra 0, vào 0

### IB2400152304#0  (top ra 1, vào 1; dropped gốc 17 → nhánh 17)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Perkins / 404A22G1 + S0L2G1 / uleengen / dòng |UP20GF|16|20|404A22G1|P… / hạng 5 → còn trong all nhánh, điểm 481→481
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Perkins / 404D22TG + PI144E / gb-power / dòng |MODEL|GBP25|STANDBYPOWE… / hạng 30 ← đã có trong all gốc, điểm 453→453
all: ra 0, vào 0

### IB2400164837#0  (top ra 3, vào 3; dropped gốc 756 → nhánh 766)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G2 + LK184F / longkai-power / dòng |POWERYOURFUTURE|4B39G2|… / hạng 1 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 4B39G12 + LK184G / longkai-power / dòng |POWERYOURFUTURE|4B39G12… / hạng 25 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 4Z30G21 + JET184F / jet-power / dòng |SD30|30|24|275|22|4Z30G… / hạng 26 → còn trong all nhánh, điểm 233→233
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 4B39G2 + S0L2M1 / uleengen / dòng |UC25GF|20|25|4B39G2|CUM… / hạng 5 ← đã có trong all gốc, điểm 272→272
- Ricardo / K4100D + JET184G / jet-power / dòng |GF33|33|26|30|24|K4100D… / hạng 21 ← đã có trong all gốc, điểm 231→239
- Ricardo / 495D + STC20 / sunny-weifang / dòng |DB20GF|20/25|495D|STC20… / hạng 23 ← đã có trong all gốc, điểm 228→236
all: ra 10, vào 0

### IB2400185291#0  (top ra 3, vào 3; dropped gốc 508 → nhánh 516)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / QSZ13G7 + LK444F / longkai-power / dòng |POWERYOURFUTURE|QSZ13G7… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 6ETAA128G32 + LK444F / longkai-power / dòng |POWERYOURFUTURE|6ETAA12… / hạng 19 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Volvo Penta / TAD1344GEB + ECO401S4C / jet-power / dòng |V440T2|440|352|400|320|… / hạng 30 → còn trong all nhánh, điểm 269→269
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / QSNTG3 + LK444F / longkai-power / dòng |POWERYOURFUTURE|QSNTG3|… / hạng 18 ← đã có trong all gốc, điểm 278→278
- SDEC / 6ETAA118G31 + LK444E / longkai-power / dòng |POWERYOURFUTURE|6ETAA11… / hạng 23 ← đã có trong all gốc, điểm 278→278
- SDEC / 6ETAA128G32 + BK314FS / bobig-power / dòng |BSD440|320|400|352|440|… / hạng 28 ← đã có trong all gốc, điểm 269→269
all: ra 8, vào 0

### IB2400208175#0  (top ra 1, vào 1; dropped gốc 17 → nhánh 18)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 12M26G2D0/S / cgm-italia / dòng |1000B||1000|800|1100|88… / hạng 14 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Perkins / 400830TAG3 / cgm-italia / dòng |1125P||1125|900|1250|10… / hạng 8 ← đã có trong all gốc, điểm 126→126
all: ra 1, vào 0

### IB2400215103#1  (top ra 1, vào 1; dropped gốc 2 → nhánh 2)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Perkins / 404D22G + PI144D / sanq-power / dòng |SQP22|18/22|16/20|404D2… / hạng 30 → còn trong all nhánh, điểm 242→242
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D + JET184D / jet-power / dòng |GF21|21|17|19|15|K4100D… / hạng 29 ← đã có trong all gốc, điểm 234→242
all: ra 0, vào 0

### IB2400216847#0  (top ra 1, vào 1; dropped gốc 380 → nhánh 380)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / QSK60G8 / aosif / dòng |AC2500I|2250/1800|2500/… / hạng 26 → còn trong all nhánh, điểm 221→221
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 16M55G2640/6 + LSA523UL16C6S/4 / longkai-power / dòng |LG2200WP|2420|3025|2200… / hạng 24 ← đã có trong all gốc, điểm 219→227
all: ra 0, vào 0

### IB2400218348#0  (top ra 1, vào 1; dropped gốc 113 → nhánh 116)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G12 + LK184G / longkai-power / dòng |POWERYOURFUTURE|4B39G12… / hạng 24 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Weichai / WP23D40E200 + LK184H / longkai-power / dòng |POWERYOURFUTURE|WP23D40… / hạng 30 ← đã có trong all gốc, điểm 253→253
all: ra 3, vào 0

### IB2400218348#1  (top ra 2, vào 2; dropped gốc 496 → nhánh 500)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 6CTAA83G9 + LK274J / longkai-power / dòng |POWERYOURFUTURE|6CTAA83… / hạng 14 → không còn trong all nhánh (công cụ không ghi lý do khác)
- YTO / YM6H4LFD + UC274J / acepow-fuan / dòng |APYT190|60|3|190|209|23… / hạng 30 → còn trong all nhánh, điểm 269→269
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 6M16G275/5 + LSA463S5 / longkai-power / dòng |LG200BD|220|275|200|250… / hạng 21 ← đã có trong all gốc, điểm 273→273
- Cummins / 6LTAA89G3 + UC274K / acepow-fuan / dòng |APC200|200|250|220|275|… / hạng 29 ← đã có trong all gốc, điểm 269→269
all: ra 4, vào 0

### IB2400236068#1  (top ra 3, vào 3; dropped gốc 2270 → nhánh 2295)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 8M21G660/5 + S5L1DE41 / kaihua-genset / dòng |HCBD660|660|600|8M21G66… / hạng 10 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 6M31G600/6 / weichai-heavy-machinery / dòng |WPG600*76|1800|750/600|… / hạng 28 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 6M31G660/6 / weichai-heavy-machinery / dòng |WPG660*76|1800|825/660|… / hạng 29 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Perkins / UK400623TAG2A + S5L1DH1 / kaihua-genset / dòng |HC825GF|825|750|UK40062… / hạng 25 ← đã có trong all gốc, điểm 191→191
- Mitsubishi / S6RPTA / eastpower-genset / dòng |VPD600S5|600|480|660|52… / hạng 28 ← đã có trong all gốc, điểm 181→181
- Cummins / QSK19G7 / comappower / dòng |COM688C|688KVA|550KW|62… / hạng 29 ← đã có trong all gốc, điểm 173→173
all: ra 24, vào 0

### IB2400238834#0  (top ra 3, vào 3; dropped gốc 1293 → nhánh 1308)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 6BTAA59G2 + LK274D / longkai-power / dòng |POWERYOURFUTURE|6BTAA59… / hạng 5 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSB59G3 + LK274D / longkai-power / dòng |POWERYOURFUTURE|QSB59G3… / hạng 6 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 4HTAA43G22 + LK274D / longkai-power / dòng |POWERYOURFUTURE|4HTAA43… / hạng 20 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 4M12G2D3/5 + TALA44J / rcg-power / dòng |RWB125D5S(STAGE3)|125KV… / hạng 26 ← đã có trong all gốc, điểm 241→241
- Yuchai / YC4A190D30 + TALA44H / penlucky / dòng |PLY150|150|1375|YC4A190… / hạng 27 ← đã có trong all gốc, điểm 231→231
- SDEC / 4HTAA43G36 + WR274DL / rcg-power / dòng |RSC125D5S|125KVA/100KW|… / hạng 28 ← đã có trong all gốc, điểm 229→229
all: ra 15, vào 0

### IB2400255232#0  (top ra 2, vào 2; dropped gốc 149 → nhánh 153)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G1 + LK184F / longkai-power / dòng |POWERYOURFUTURE|4B39G1|… / hạng 14 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 4B39G12 + LK184G / longkai-power / dòng |POWERYOURFUTURE|4B39G12… / hạng 24 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 4B39G1 + PI144F / stone-power / dòng |SC27M5|24|22|30|27|4B39… / hạng 23 ← đã có trong all gốc, điểm 269→269
- Weichai / WP23D40E200 + LK184H / longkai-power / dòng |POWERYOURFUTURE|WP23D40… / hạng 30 ← đã có trong all gốc, điểm 253→253
all: ra 4, vào 0

### IB2400257900#0  (top ra 2, vào 2; dropped gốc 373 → nhánh 382)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / QSB67G4 + LK274G / longkai-power / dòng |POWERYOURFUTURE|QSB67G4… / hạng 8 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC8D280D2 + LK274H / longkai-power / dòng |POWERYOURFUTURE|SC8D280… / hạng 23 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC7H230D2 + 1FC22824 / dingbo / dòng |XG150GF|150/1875|165/20… / hạng 25 ← đã có trong all gốc, điểm 265→265
- Yuchai / YC6A245LD21 + WT274H / wintpower / dòng |WTYC200|150/188|160/200… / hạng 26 ← đã có trong all gốc, điểm 265→265
all: ra 9, vào 0

### IB2400258097#0  (top ra 3, vào 3; dropped gốc 925 → nhánh 937)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / QSZ13G7 + LK444F / longkai-power / dòng |POWERYOURFUTURE|QSZ13G7… / hạng 5 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSZ13G5 + LK544B / longkai-power / dòng |POWERYOURFUTURE|QSZ13G5… / hạng 23 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSZ13G2 + LK544B / longkai-power / dòng |POWERYOURFUTURE|QSZ13G2… / hạng 24 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / QSNTG4X + LK544B / longkai-power / dòng |POWERYOURFUTURE|QSNTG4X… / hạng 22 ← đã có trong all gốc, điểm 561→561
- Cummins / QSZ13G2 + 315C / acepow-fuan / dòng |APC350|350|438|375|468|… / hạng 25 ← đã có trong all gốc, điểm 560→560
- Cummins / QSK19G14 + LK544B / longkai-power / dòng |POWERYOURFUTURE|QSK19G1… / hạng 27 ← đã có trong all gốc, điểm 557→557
all: ra 12, vào 0

### IB2400268013#0  (top ra 2, vào 2; dropped gốc 171 → nhánh 174)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G2 + LK184F / longkai-power / dòng |POWERYOURFUTURE|4B39G2|… / hạng 7 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 4B39G11 + LK184E / longkai-power / dòng |POWERYOURFUTURE|4B39G11… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 4B39G11 + BW184ES / bobig-power / dòng |BC22|16|20|18|22|4B39G1… / hạng 17 ← đã có trong all gốc, điểm 269→269
- Cummins / 4B39G2 + PI144E / sanq-power / dòng |SQC27|22/27|20/25|4B39G… / hạng 29 ← đã có trong all gốc, điểm 253→253
all: ra 3, vào 0

### IB2400268027#0  (top ra 1, vào 1; dropped gốc 34 → nhánh 34)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Yanmar / 3TNV82AGGE + TALA40C / sr-genset / dòng |132|1056|120|96|3TNV82A… / hạng 30 → còn trong all nhánh, điểm 217→217
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 30 ← đã có trong all gốc, điểm 213→221
all: ra 0, vào 0

### IB2400275648#0  (top ra 4, vào 3; dropped gốc 12 → nhánh 17)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 4M06G8D0/S / genmac / dòng EDITG31BO33304M06G8D0/S1… / hạng 1 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 4M06G6D0/S / cgm-italia / dòng |30B||30|24|33|264|4M06G… / hạng 14 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 4M06G6D0/S / coelmo / dòng POTENZAPRP(KVA)30POTENZA… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 4M06G8D0/S / cgm-italia / dòng |40B||40|32|44|352|4M06G… / hạng 23 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Yanmar / 4TNV98GECS / genmac / dòng ALPHAG30YO33304TNV98GECS… / hạng 3 ← đã có trong all gốc, điểm 165→165
- Perkins / 404JE22TA / cgm-italia / dòng |V40P||40|32|44|352|404J… / hạng 21 ← đã có trong all gốc, điểm 42→42
- FPT / R24MSFS0140A01 / cgm-italia / dòng |E40F||40|32|44|352|R24M… / hạng 23 ← đã có trong all gốc, điểm 42→42
all: ra 5, vào 0

### IB2400275648#1  (top ra 2, vào 2; dropped gốc 16 → nhánh 18)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 4M10G4D0/S / genmac / dòng EDITG61BO69634M10G4D0/S1… / hạng 2 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 4M10G2D0/S / cgm-italia / dòng |65B||65|52|715|572|4M10… / hạng 16 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Kohler / KDI3404TM / genmac / dòng ALPHAG60KO6862KDI3404TM1… / hạng 6 ← đã có trong all gốc, điểm 162→162
- Cummins / 4BTAA33G13 / cgm-italia / dòng |60CU||60|48|66|528|4BTA… / hạng 10 ← đã có trong all gốc, điểm 83→83
all: ra 2, vào 0

### IB2400285076#0  (top ra 3, vào 3; dropped gốc 658 → nhánh 662)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC8D280D2 + LK274H / longkai-power / dòng |POWERYOURFUTURE|SC8D280… / hạng 12 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC9D310D2 + LK274J / longkai-power / dòng |POWERYOURFUTURE|SC9D310… / hạng 23 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Weichai / WP10D238E200 + LK274J / longkai-power / dòng |POWERYOURFUTURE|WP10D23… / hạng 25 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC8D280D2 + JET274H / jet-power / dòng |SD220|220|176|200|160|S… / hạng 18 ← đã có trong all gốc, điểm 269→269
- SDEC / 6DTAA89G21 + LK274H / longkai-power / dòng |POWERYOURFUTURE|6DTAA89… / hạng 24 ← đã có trong all gốc, điểm 262→262
- Baudouin / 6M16G250/5 + LSA463S4 / longkai-power / dòng |LG184BD|2024|253|184|23… / hạng 26 ← đã có trong all gốc, điểm 258→258
all: ra 4, vào 0

### IB2400302943#0  (top ra 4, vào 4; dropped gốc 856 → nhánh 868)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 6ETAA118G21 + LK444E / longkai-power / dòng |POWERYOURFUTURE|6ETAA11… / hạng 12 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC12E460D2 + LK444E / longkai-power / dòng |POWERYOURFUTURE|SC12E46… / hạng 13 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSZ13G6 + LK444E / longkai-power / dòng |POWERYOURFUTURE|QSZ13G6… / hạng 16 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC15G500D2 + LK444F / longkai-power / dòng |POWERYOURFUTURE|SC15G50… / hạng 20 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC12E460D2 + BW314F / bobig-power / dòng |BSD385|280|350|308|385|… / hạng 24 ← đã có trong all gốc, điểm 269→269
- SDEC / 6ETAA118G21 + JET444EM / jet-power / dòng |UK385S|385|308|350|280|… / hạng 26 ← đã có trong all gốc, điểm 269→269
- Yuchai / YC6MJ480LD20 + WT444E / wintpower / dòng |WTYC375|280/350|300/375… / hạng 29 ← đã có trong all gốc, điểm 265→265
- Cummins / NTAA855G7A + HCI444F / stone-power / dòng |SC400E5|350|320|438|400… / hạng 30 ← đã có trong all gốc, điểm 264→264
all: ra 12, vào 0

### IB2400313213#0  (top ra 2, vào 2; dropped gốc 356 → nhánh 359)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / 12M55D2700E310 + LK734HM / longkai-power / dòng |POWERYOURFUTURE|12M55D2… / hạng 8 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Weichai / 16M55D2900E310 + LK734HG / longkai-power / dòng |POWERYOURFUTURE|16M55D2… / hạng 11 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 12M55G2500/6 + LSA523L12 / longkai-power / dòng |LG2000WP|2200|2750|2000… / hạng 15 ← đã có trong all gốc, điểm 238→246
- Baudouin / 16M55G3000/5 + LSA523UL16C6S/4 / longkai-power / dòng |LG2200WP|2420|3025|2200… / hạng 17 ← đã có trong all gốc, điểm 235→243
all: ra 3, vào 0

### IB2400313681#0  (top ra 1, vào 1; dropped gốc 270 → nhánh 270)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Yangdong / Y495D + 184G / uleengen / dòng |UY30GFS|24|30|Y495D|27|… / hạng 21 → còn trong all nhánh, điểm 269→269
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D + 184G / uleengen / dòng |UH30GF|24|30|K4100D|184… / hạng 22 ← đã có trong all gốc, điểm 261→269
all: ra 0, vào 0

### IB2400325367#0  (top ra 3, vào 3; dropped gốc 573 → nhánh 579)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4BTA39G13 + LK224G / longkai-power / dòng |POWERYOURFUTURE|4BTA39G… / hạng 11 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC4H115D2 + LK224G / longkai-power / dòng |POWERYOURFUTURE|SC4H115… / hạng 12 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSB39G3 + LK224G/S / longkai-power / dòng |POWERYOURFUTURE|QSB39G3… / hạng 14 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC4H115D2 + JET224G / jet-power / dòng |SD88|88|70|80|64|SC4H11… / hạng 12 ← đã có trong all gốc, điểm 269→269
- Baudouin / 4M10G88/5 + LSA443S2 / longkai-power / dòng |LG64BD|704|88|64|80|4M1… / hạng 13 ← đã có trong all gốc, điểm 268→268
- Weichai / WP41D80E201 + TALA44C / penlucky / dòng |PLW88/B1|88|80|WP41D80E… / hạng 30 ← đã có trong all gốc, điểm 233→233
all: ra 6, vào 0

### IB2400352866#0  (top ra 1, vào 1; dropped gốc 124 → nhánh 130)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / QSZ13G10 + LK544C / longkai-power / dòng |POWERYOURFUTURE|QSZ13G1… / hạng 18 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / QSK19G14 + LK544B / longkai-power / dòng |POWERYOURFUTURE|QSK19G1… / hạng 24 ← đã có trong all gốc, điểm 570→570
all: ra 6, vào 0

### IB2400355321#0  (top ra 1, vào 1; dropped gốc 80 → nhánh 80)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / WP23D25E200 + TALA40D / penlucky / dòng |PLW165/B1|165|15|WP23D2… / hạng 30 → còn trong all nhánh, điểm 216→216
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 25 ← đã có trong all gốc, điểm 213→221
all: ra 0, vào 0

### IB2400362865#0  (top ra 2, vào 1; dropped gốc 18 → nhánh 24)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 6M11G4D0/S / cgm-italia / dòng |150B||150|120|165|132|6… / hạng 13 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 6M11G4D0/S / coelmo / dòng POTENZAPRP(KVA)150POTENZ… / hạng 14 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- FPT / N67TEVP0600 / cgm-italia / dòng |V150F|150|120|150|120|N… / hạng 10 ← đã có trong all gốc, điểm 80→80
all: ra 6, vào 0

### IB2400367041#0  (top ra 5, vào 5; dropped gốc 766 → nhánh 772)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 6KTAA25G36 + LK544C / longkai-power / dòng |POWERYOURFUTURE|6KTAA25… / hạng 20 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC25G690D2 + LK544C / longkai-power / dòng |POWERYOURFUTURE|SC25G69… / hạng 21 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSZ13G10 + LK544C / longkai-power / dòng |POWERYOURFUTURE|QSZ13G1… / hạng 22 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Deutz / BF8M1015CPG1A + TFW24004 / dingbo / dòng |XG400GF|400/500|440/550… / hạng 29 → còn trong all nhánh, điểm 261→261
- Weichai / 6M26D484E200 + BW354D / bobig-power / dòng |BWC550|400|500|440|550|… / hạng 30 → còn trong all nhánh, điểm 261→261
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Weichai / 6M26D484E200 + LK544C / longkai-power / dòng |POWERYOURFUTURE|6M26D48… / hạng 24 ← đã có trong all gốc, điểm 270→270
- Cummins / QSK19G13 + LK544C / longkai-power / dòng |POWERYOURFUTURE|QSK19G1… / hạng 25 ← đã có trong all gốc, điểm 270→270
- SDEC / SC25G690D2 + 1FC23544 / dingbo / dòng |XG400GF|400/500|440/550… / hạng 26 ← đã có trong all gốc, điểm 269→269
- Weichai / 6M33D572E200 + LK544E / longkai-power / dòng |POWERYOURFUTURE|6M33D57… / hạng 28 ← đã có trong all gốc, điểm 263→263
- Wudong / WD269TAD43 + LSA472M7 / wintpower / dòng |WTW550E|550|440KW|500|4… / hạng 30 ← đã có trong all gốc, điểm 254→262
all: ra 6, vào 0

### IB2400367420#0  (top ra 3, vào 0; dropped gốc 87 → nhánh 90)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 6M31G725/5 / cgm-italia / dòng |650B||650|520|715|572|6… / hạng 1 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 6M31G750/5 / cgm-italia / dòng |680B||680|544|748|5984|… / hạng 4 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 6M33G4D5/S / cgm-italia / dòng |V750B||750|600|825|660|… / hạng 5 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- (không có)
all: ra 3, vào 0

### IB2400371783#0  (top ra 2, vào 2; dropped gốc 545 → nhánh 550)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC12E420D2 + LK444E / longkai-power / dòng |POWERYOURFUTURE|SC12E42… / hạng 16 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 6LTAA95G1 + LK444ES / longkai-power / dòng |POWERYOURFUTURE|6LTAA95… / hạng 20 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / NTA855G2 + HCI444D / stone-power / dòng |SC344E6|303|275|379|344… / hạng 24 ← đã có trong all gốc, điểm 269→269
- FAWDE / CA6DM2J39D + 4ES / uleengen / dòng |UX300GF|240|300|CA6DM2J… / hạng 26 ← đã có trong all gốc, điểm 269→269
all: ra 5, vào 0

### IB2400375383#0  (top ra 1, vào 1; dropped gốc 587 → nhánh 594)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC7H220D2 + LK274F / longkai-power / dòng |POWERYOURFUTURE|SC7H220… / hạng 18 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 6M11G160/6 + LSA443L10 / longkai-power / dòng |LG120BD|132|165|120|150… / hạng 28 ← đã có trong all gốc, điểm 268→268
all: ra 7, vào 0

### IB2400377756#0  (top ra 1, vào 1; dropped gốc 1964 → nhánh 1968)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- ? / SC33G1150D2 + LK634D / longkai-power / dòng |POWERYOURFUTURE|SC33W11… / hạng 29 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / 6KTAA25G37 / voltgent / dòng |VSC8255S3|825|660|750|6… / hạng 30 ← đã có trong all gốc, điểm 165→165
all: ra 4, vào 0

### IB2400382139#0  (top ra 1, vào 1; dropped gốc 69 → nhánh 69)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / WP23D25E200 + TALA40D / penlucky / dòng |PLW165/B1|165|15|WP23D2… / hạng 30 → còn trong all nhánh, điểm 216→216
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 25 ← đã có trong all gốc, điểm 213→221
all: ra 0, vào 0

### IB2400389666#0  (top ra 2, vào 2; dropped gốc 492 → nhánh 496)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC12E420D2 + LK444E / longkai-power / dòng |POWERYOURFUTURE|SC12E42… / hạng 18 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / NTA855G2 + HCI444D / stone-power / dòng |SC344E6|303|275|379|344… / hạng 27 → còn trong all nhánh, điểm 269→269
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 6LTAA95G1 + LK444ES / longkai-power / dòng |POWERYOURFUTURE|6LTAA95… / hạng 22 ← đã có trong all gốc, điểm 271→271
- Perkins / 2206CE13TAG2 + HCI444E / sanq-power / dòng |SQP400|320/400|280/350|… / hạng 30 ← đã có trong all gốc, điểm 267→267
all: ra 4, vào 0

### IB2400416979#0  (top ra 1, vào 1; dropped gốc 64 → nhánh 64)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Yangdong / YD4KD + BC164D / acepow-fuan / dòng |APYD12|50HZ|12|132|150|… / hạng 30 → còn trong all nhánh, điểm 237→237
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D + JET184D / jet-power / dòng |GF21|21|17|19|15|K4100D… / hạng 22 ← đã có trong all gốc, điểm 234→242
all: ra 0, vào 0

### IB2400428063#0  (top ra 1, vào 1; dropped gốc 39 → nhánh 39)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Yangdong / YD485D/17KW + JET164D/128KW / jet-power / dòng |YD17|165|132|15|12|YD48… / hạng 30 → còn trong all nhánh, điểm 237→237
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D + JET184D / jet-power / dòng |GF21|21|17|19|15|K4100D… / hạng 23 ← đã có trong all gốc, điểm 234→242
all: ra 0, vào 0

### IB2400429380#0  (top ra 3, vào 3; dropped gốc 186 → nhánh 195)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / QSZ13G7 + LK444F / longkai-power / dòng |POWERYOURFUTURE|QSZ13G7… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 6ETAA128G32 + LK444F / longkai-power / dòng |POWERYOURFUTURE|6ETAA12… / hạng 19 → không còn trong all nhánh (công cụ không ghi lý do khác)
- YTO / YM6S9LFDA + HC434FS / acepow-fuan / dòng |APYT320|50|3|320|352|40… / hạng 30 → còn trong all nhánh, điểm 269→269
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / QSNTG3 + LK444F / longkai-power / dòng |POWERYOURFUTURE|QSNTG3|… / hạng 18 ← đã có trong all gốc, điểm 278→278
- SDEC / 6ETAA118G31 + LK444E / longkai-power / dòng |POWERYOURFUTURE|6ETAA11… / hạng 23 ← đã có trong all gốc, điểm 278→278
- SDEC / 6ETAA128G32 + BK314FS / bobig-power / dòng |BSD440|320|400|352|440|… / hạng 30 ← đã có trong all gốc, điểm 269→269
all: ra 9, vào 0

### IB2400433961#1  (top ra 1, vào 1; dropped gốc 1368 → nhánh 1370)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / Weichai / 12M33D1450E310 + LK734B / longkai-power / dòng |POWERYOURFUTURE|12M33D1… / hạng 9 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- MTU / 18V2000G76S / comappower / dòng |COM1500MTU|1500KVA|1200… / hạng 25 ← đã có trong all gốc, điểm 173→173
all: ra 2, vào 0

### IB2400440257#0  (top ra 3, vào 3; dropped gốc 753 → nhánh 763)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G2 + LK184F / longkai-power / dòng |POWERYOURFUTURE|4B39G2|… / hạng 1 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 4B39G12 + LK184G / longkai-power / dòng |POWERYOURFUTURE|4B39G12… / hạng 25 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 4Z30G21 + JET184F / jet-power / dòng |SD30|30|24|275|22|4Z30G… / hạng 26 → còn trong all nhánh, điểm 233→233
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 4B39G2 + S0L2M1 / uleengen / dòng |UC25GF|20|25|4B39G2|CUM… / hạng 5 ← đã có trong all gốc, điểm 272→272
- Ricardo / K4100D + JET184G / jet-power / dòng |GF33|33|26|30|24|K4100D… / hạng 21 ← đã có trong all gốc, điểm 231→239
- Ricardo / 495D + STC20 / sunny-weifang / dòng |DB20GF|20/25|495D|STC20… / hạng 23 ← đã có trong all gốc, điểm 228→236
all: ra 10, vào 0

### IB2400440994#0  (top ra 3, vào 3; dropped gốc 97 → nhánh 100)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G2 + LK184F / longkai-power / dòng |POWERYOURFUTURE|4B39G2|… / hạng 5 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 4B39G11 + LK184E / longkai-power / dòng |POWERYOURFUTURE|4B39G11… / hạng 6 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Deutz / BFM3G1 + BC184E / acepow-fuan / dòng |HPDD16|16|200|176|220|B… / hạng 30 → còn trong all nhánh, điểm 261→261
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 4B39G11 + BC184E / acepow-fuan / dòng |APC17|17|20|19|24|4B39G… / hạng 19 ← đã có trong all gốc, điểm 269→269
- Ricardo / K4100D + JET184E / jet-power / dòng |GF25|25|20|23|18|K4100D… / hạng 25 ← đã có trong all gốc, điểm 256→264
- Cummins / 4B39G2 + PI144E / stone-power / dòng |SC25E5|22|20|28|25|4B39… / hạng 30 ← đã có trong all gốc, điểm 264→264
all: ra 3, vào 0

### IB2400442989#0  (top ra 2, vào 2; dropped gốc 621 → nhánh 624)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G12 + LK184G / longkai-power / dòng |POWERYOURFUTURE|4B39G12… / hạng 17 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Yangdong / Y4105D + BC184H / acepow-fuan / dòng |APYD30|50HZ|30|33|38|41… / hạng 27 → còn trong all nhánh, điểm 242→242
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 4B39G12 + BC184G / acepow-fuan / dòng |APC25|25|30|27|34|4B39G… / hạng 20 ← đã có trong all gốc, điểm 261→261
- Ricardo / 495D + STC24 / sunny-weifang / dòng |DB24GF|24/30|495D|STC24… / hạng 27 ← đã có trong all gốc, điểm 237→245
all: ra 3, vào 0

### IB2400448320#0  (top ra 1, vào 1; dropped gốc 587 → nhánh 594)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC7H220D2 + LK274F / longkai-power / dòng |POWERYOURFUTURE|SC7H220… / hạng 18 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 6M11G160/6 + LSA443L10 / longkai-power / dòng |LG120BD|132|165|120|150… / hạng 28 ← đã có trong all gốc, điểm 268→268
all: ra 7, vào 0

### IB2400453053#0  (top ra 1, vào 1; dropped gốc 32 → nhánh 34)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 8M21G660/5 / ade-power / dòng |STANDBYPOWER(ESP)RATING… / hạng 16 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 6M21G550/5 / ade-power / dòng |STANDBYPOWER(ESP)RATING… / hạng 10 ← đã có trong all gốc, điểm 206→206
all: ra 2, vào 0

### IB2400459339#1  (top ra 1, vào 1; dropped gốc 588 → nhánh 588)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Deutz / TD226B6D + LSA442S75 / rise-power / dòng |RDL80|80/100|88/110|TD2… / hạng 30 → còn trong all nhánh, điểm 254→254
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 6BT59G296KW + UCI274C80KW / yihua-fujian / dòng |GENERATORSETMODEL|YH100… / hạng 30 ← đã có trong all gốc, điểm 249→257
all: ra 0, vào 0

### IB2400470041#0  (top ra 1, vào 1; dropped gốc 9 → nhánh 9)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Mitsubishi / S16R2PTAW + LSA523L9 / rcg-power / dòng |RJM2250D5S|2250KVA/1800… / hạng 28 → còn trong all nhánh, điểm 238→238
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 20M33G2200/6 + LSA523S7 / longkai-power / dòng |LG1800WP|1980|2475|1800… / hạng 26 ← đã có trong all gốc, điểm 238→246
all: ra 0, vào 0

### IB2400475145#1  (top ra 1, vào 1; dropped gốc 118 → nhánh 118)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Quanchai / QC380D / elitech-power / dòng |EPS10QCA3|QUANCHAI|10KV… / hạng 30 → còn trong all nhánh, điểm 197→197
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 29 ← đã có trong all gốc, điểm 191→199
all: ra 0, vào 0

### IB2400479497#0  (top ra 2, vào 2; dropped gốc 195 → nhánh 195)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Perkins / 404D22TG + PI144E / sanq-power / dòng |SQP30|24/30|22/27|404D2… / hạng 11 → còn trong all nhánh, điểm 270→270
- Yangdong / Y490D + 184EF / uleengen / dòng |UY25GFS|20|25|Y490D|24|… / hạng 17 → còn trong all nhánh, điểm 269→269
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Perkins / 404D22TG + S0L2M1 / uleengen / dòng |UP25GF|20|25|404D22TG|P… / hạng 8 ← đã có trong all gốc, điểm 281→281
- Cummins / X25G2 + PI144E / sanq-power / dòng |SQIC275|22/275|20/25|X2… / hạng 24 ← đã có trong all gốc, điểm 254→254
all: ra 0, vào 0

### IB2400482562#0  (top ra 1, vào 1; dropped gốc 13 → nhánh 13)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Kohler / KDI2504TM / tecnogen / dòng |KL33TSX|33|30|||KDI2504… / hạng 16 → còn trong all nhánh, điểm 45→45
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Perkins / 1103D33G3/G2 / tecnogen / dòng |PK37TSX**|33|30|40|36|1… / hạng 15 ← đã có trong all gốc, điểm 45→45
all: ra 0, vào 0

### IB2400484488#0  (top ra 1, vào 1; dropped gốc 612 → nhánh 616)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC12E420D2 + LK444E / longkai-power / dòng |POWERYOURFUTURE|SC12E42… / hạng 17 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- FAWDE / CA6DM2J39D + 4ES / uleengen / dòng |UX300GF|240|300|CA6DM2J… / hạng 26 ← đã có trong all gốc, điểm 269→269
all: ra 4, vào 0

### IB2400489270#0  (top ra 2, vào 2; dropped gốc 402 → nhánh 405)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G2 + LK184F / longkai-power / dòng |POWERYOURFUTURE|4B39G2|… / hạng 1 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Yuchai / YCDV254FHZ35 + NIANFENGNF184F / fdk-energy / dòng |Y28H1CONTACT|28KVA/22KW… / hạng 17 → còn trong all nhánh, điểm 264→264
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 4B39G2 + S0L2M1 / fdk-energy / dòng CUMMINSMODEL:4B39G2GENER… / hạng 6 ← đã có trong all gốc, điểm 272→272
- Yangdong / Y4100D + TG184S24 / tecgen-fujian / dòng |TG30YD|33|27|30|24|Y410… / hạng 27 ← đã có trong all gốc, điểm 239→239
all: ra 3, vào 0

### IB2400489361#0  (top ra 2, vào 2; dropped gốc 351 → nhánh 361)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 6LTAA95G1 + LK444ES / longkai-power / dòng |POWERYOURFUTURE|6LTAA95… / hạng 22 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC12E420D2 + LK444E / longkai-power / dòng |POWERYOURFUTURE|SC12E42… / hạng 23 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC13G420D2 + LK444ES / longkai-power / dòng |POWERYOURFUTURE|SC13G42… / hạng 24 ← đã có trong all gốc, điểm 278→278
- Cummins / NTA855G4 + HCI444E / sanq-power / dòng |SQC390|312/390|283/354|… / hạng 25 ← đã có trong all gốc, điểm 277→277
all: ra 10, vào 0

### IB2400491226#0  (top ra 4, vào 4; dropped gốc 1071 → nhánh 1075)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC8D280D2 + LK274H / longkai-power / dòng |POWERYOURFUTURE|SC8D280… / hạng 6 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC9D310D2 + LK274J / longkai-power / dòng |POWERYOURFUTURE|SC9D310… / hạng 18 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 6DTAA89G21 + JET274H / jet-power / dòng |SD220|220|176|200|160|6… / hạng 26 → còn trong all nhánh, điểm 253→253
- Baudouin / 6M16G220/5 + N200G4 / kaihua-genset / dòng |HCBD220|220|200|6M16G22… / hạng 27 → còn trong all nhánh, điểm 253→253
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC8D280D2 + JET274H / jet-power / dòng |SD220|220|176|200|160|S… / hạng 14 ← đã có trong all gốc, điểm 269→269
- SDEC / 6DTAA89G21 + LK274H / longkai-power / dòng |POWERYOURFUTURE|6DTAA89… / hạng 19 ← đã có trong all gốc, điểm 262→262
- Baudouin / 6M16G250/5 + LSA463S4 / longkai-power / dòng |LG184BD|2024|253|184|23… / hạng 21 ← đã có trong all gốc, điểm 258→258
- SDEC / SC9D310D2 + BW274J / bobig-power / dòng |BSD248|180|225|198|248|… / hạng 25 ← đã có trong all gốc, điểm 256→256
all: ra 4, vào 0

### IB2400493077#0  (top ra 2, vào 0; dropped gốc 14 → nhánh 16)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 4M10G4D0/S / genmac / dòng EDITG81BO88804M10G4D0/S1… / hạng 1 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 4M10G4D0/S / cgm-italia / dòng |80B||80|64|88|704|4M10G… / hạng 9 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- (không có)
all: ra 2, vào 0

### IB2400495088#0  (top ra 2, vào 2; dropped gốc 1216 → nhánh 1221)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC12E420D2 + LK444E / longkai-power / dòng |POWERYOURFUTURE|SC12E42… / hạng 9 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC13G420D2 + LK444ES / longkai-power / dòng |POWERYOURFUTURE|SC13G42… / hạng 11 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC13G420D2 + 1FC22844 / dingbo / dòng |XG250GF|250/3125|275/34… / hạng 29 ← đã có trong all gốc, điểm 265→265
- SDEC / SC12E420D2 + 4ES / uleengen / dòng |US250GF|250|313|SC12E42… / hạng 30 ← đã có trong all gốc, điểm 265→265
all: ra 5, vào 0

### IB2400495696#0  (top ra 1, vào 1; dropped gốc 544 → nhánh 545)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- FAWDE / 4DW9342D + 184G / uleengen / dòng |UX30GF|24|30|4DW9342D|3… / hạng 30 → còn trong all nhánh, điểm 237→237
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / 495D + STC24 / sunny-weifang / dòng |DB24GF|24/30|495D|STC24… / hạng 28 ← đã có trong all gốc, điểm 237→245
all: ra 1, vào 0

### IB2400495696#2  (top ra 3, vào 3; dropped gốc 634 → nhánh 637)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC8D280D2 + LK274H / longkai-power / dòng |POWERYOURFUTURE|SC8D280… / hạng 14 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC9D310D2 + LK274J / longkai-power / dòng |POWERYOURFUTURE|SC9D310… / hạng 23 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Perkins / 1206AE70TTAG2 + BW274K / bobig-power / dòng |BP248|180|225|198|248|1… / hạng 30 → còn trong all nhánh, điểm 256→256
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC8D280D2 + JET274H / jet-power / dòng |SD220|220|176|200|160|S… / hạng 18 ← đã có trong all gốc, điểm 269→269
- SDEC / 6DTAA89G21 + LK274H / longkai-power / dòng |POWERYOURFUTURE|6DTAA89… / hạng 25 ← đã có trong all gốc, điểm 262→262
- Baudouin / 6M16G250/5 + LSA463S4 / longkai-power / dòng |LG184BD|2024|253|184|23… / hạng 27 ← đã có trong all gốc, điểm 258→258
all: ra 3, vào 0

### IB2400497000#0  (top ra 1, vào 1; dropped gốc 5 → nhánh 5)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Yangdong / YD485D/17KW + JET164D/128KW / jet-power / dòng |YD17|165|132|15|12|YD48… / hạng 30 → còn trong all nhánh, điểm 237→237
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D + JET184D / jet-power / dòng |GF21|21|17|19|15|K4100D… / hạng 23 ← đã có trong all gốc, điểm 234→242
all: ra 0, vào 0

### IB2400497572#0  (top ra 1, vào 1; dropped gốc 69 → nhánh 69)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / WP23D25E200 + TALA40D / penlucky / dòng |PLW165/B1|165|15|WP23D2… / hạng 30 → còn trong all nhánh, điểm 216→216
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 25 ← đã có trong all gốc, điểm 213→221
all: ra 0, vào 0

### IB2400503492#0  (top ra 2, vào 2; dropped gốc 23 → nhánh 25)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 6M31G660/5 / cgm-italia / dòng |600B||600|480|660|528|6… / hạng 11 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 6M31G750/5 / cgm-italia / dòng |680B||680|544|748|5984|… / hạng 14 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- ? / 8M21G5D3/5 / cgm-italia / dòng |E600B||600|480|660|528|… / hạng 13 ← đã có trong all gốc, điểm 15→15
- ? / 6M33G2D5/5 / cgm-italia / dòng |V625B||625|500|6875|550… / hạng 14 ← đã có trong all gốc, điểm 11→11
all: ra 2, vào 0

### IB2400517601#0  (top ra 2, vào 1; dropped gốc 61 → nhánh 63)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 6M31G750/5 / cgm-italia / dòng |680B||680|544|748|5984|… / hạng 14 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 6M33G4D5/S / cgm-italia / dòng |V750B||750|600|825|660|… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Doosan / Hyundai / DP222LC / cgm-italia / dòng |750DS||750|600|825|660|… / hạng 11 ← đã có trong all gốc, điểm 120→120
all: ra 2, vào 0

### IB2400529458#0  (top ra 2, vào 2; dropped gốc 13 → nhánh 15)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 4M06G8D0/S / genmac / dòng EDITG41BO44404M06G8D0/S1… / hạng 2 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 4M06G8D0/S / cgm-italia / dòng |40B||40|32|44|352|4M06G… / hạng 10 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- John Deere / 3029TFU20 / genmac / dòng ALPHAG40JO44403029TFU201… / hạng 4 ← đã có trong all gốc, điểm 165→165
- FPT / R24MSFS0140A01 / cgm-italia / dòng |E40F||40|32|44|352|R24M… / hạng 12 ← đã có trong all gốc, điểm 75→75
all: ra 2, vào 0

### IB2400533611#0  (top ra 3, vào 3; dropped gốc 2047 → nhánh 2053)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC27G900D2 + LK544F / longkai-power / dòng |POWERYOURFUTURE|SC27G90… / hạng 5 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / VTA28G5 + TALA473F / rcg-power / dòng |RC625D5S|625KVA/500KW|6… / hạng 19 → còn trong all nhánh, điểm 233→233
- Baudouin / 8M21G660/5 + S5L1DE41 / kaihua-genset / dòng |HCBD660|660|600|8M21G66… / hạng 23 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC27G900D2 + BW354F / bobig-power / dòng |BSD743|540|675|594|743|… / hạng 10 ← đã có trong all gốc, điểm 262→262
- Cummins / KT38GA + LK634B / longkai-power / dòng |POWERYOURFUTURE|KT38GA|… / hạng 11 ← đã có trong all gốc, điểm 259→259
- Ricardo / K29G1210D + JET634B / jet-power / dòng |GF825|825|660|750|600|K… / hạng 30 ← đã có trong all gốc, điểm 202→202
all: ra 5, vào 0

### IB2400560277#0  (top ra 2, vào 2; dropped gốc 1469 → nhánh 1471)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC9D310D2 + LK274J / longkai-power / dòng |POWERYOURFUTURE|SC9D310… / hạng 13 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Weichai / WP10CD238E200 + MPH1804 / uleengen / dòng |CCFJ180W|180|225|WP10CD… / hạng 27 → còn trong all nhánh, điểm 224→224
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 6M16G250/5 + LSA463S4 / longkai-power / dòng |LG184BD|2024|253|184|23… / hạng 16 ← đã có trong all gốc, điểm 258→258
- SDEC / SC9D310D2 + BW274J / bobig-power / dòng |BSD248|180|225|198|248|… / hạng 18 ← đã có trong all gốc, điểm 256→256
all: ra 2, vào 0

### IB2400563426#1  (top ra 1, vào 1; dropped gốc 56 → nhánh 60)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / QSB39G3 + LK224G/S / longkai-power / dòng |POWERYOURFUTURE|QSB39G3… / hạng 22 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 4M10G88/5 + LSA443S2 / longkai-power / dòng |LG64BD|704|88|64|80|4M1… / hạng 26 ← đã có trong all gốc, điểm 254→254
all: ra 4, vào 0

### IB2400564384#0  (top ra 1, vào 1; dropped gốc 1013 → nhánh 1015)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / QSZ13G10 + LK544C / longkai-power / dòng |POWERYOURFUTURE|QSZ13G1… / hạng 21 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / QSK19G13 + LK544C / longkai-power / dòng |POWERYOURFUTURE|QSK19G1… / hạng 25 ← đã có trong all gốc, điểm 270→270
all: ra 2, vào 0

### IB2400573523#0  (top ra 1, vào 1; dropped gốc 2509 → nhánh 2513)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC25G610D2 + LK544B / longkai-power / dòng |POWERYOURFUTURE|SC25G61… / hạng 4 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- MTU / 10V1600G10F / ettes-power / dòng |ET500|360|450|400|500|1… / hạng 28 ← đã có trong all gốc, điểm 208→208
all: ra 4, vào 0

### IB2400577658#0  (top ra 1, vào 1; dropped gốc 408 → nhánh 413)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC7H220D2 + LK274F / longkai-power / dòng |POWERYOURFUTURE|SC7H220… / hạng 29 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC7H220D2 + BW274E / bobig-power / dòng |BSD165|120|150|132|165|… / hạng 30 ← đã có trong all gốc, điểm 260→260
all: ra 5, vào 0

### IB2400589278#0  (top ra 2, vào 2; dropped gốc 537 → nhánh 541)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC12E420D2 + LK444E / longkai-power / dòng |POWERYOURFUTURE|SC12E42… / hạng 18 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / NTA855G2 + HCI444D / stone-power / dòng |SC344E6|303|275|379|344… / hạng 27 → còn trong all nhánh, điểm 269→269
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 6LTAA95G1 + LK444ES / longkai-power / dòng |POWERYOURFUTURE|6LTAA95… / hạng 22 ← đã có trong all gốc, điểm 271→271
- Perkins / 2206CE13TAG2 + HCI444E / sanq-power / dòng |SQP400|320/400|280/350|… / hạng 30 ← đã có trong all gốc, điểm 267→267
all: ra 4, vào 0

### IB2400589278#1  (top ra 3, vào 3; dropped gốc 1147 → nhánh 1153)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / QSZ13G7 + LK444F / longkai-power / dòng |POWERYOURFUTURE|QSZ13G7… / hạng 11 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 6ETAA128G32 + LK444F / longkai-power / dòng |POWERYOURFUTURE|6ETAA12… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Perkins / 2506CE15TAG1 + S4L1DG41 / uleengen / dòng |UP450GF|360|450|2506CE1… / hạng 30 → còn trong all nhánh, điểm 268→268
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 6ZTAA13G4 + HCI544C / stone-power / dòng |SC450E5|400|360|500|450… / hạng 20 ← đã có trong all gốc, điểm 274→274
- SDEC / 6ETAA128G32 + BK314FS / bobig-power / dòng |BSD440|320|400|352|440|… / hạng 22 ← đã có trong all gốc, điểm 269→269
- Weichai / WP13D440E310 + LK544C / longkai-power / dòng |POWERYOURFUTURE|WP13D44… / hạng 26 ← đã có trong all gốc, điểm 269→269
all: ra 6, vào 0

### IB2400589278#2  (top ra 3, vào 3; dropped gốc 1049 → nhánh 1056)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 6ETAA128G31 + LK544B / longkai-power / dòng |POWERYOURFUTURE|6ETAA12… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSZ13G5 + LK544B / longkai-power / dòng |POWERYOURFUTURE|QSZ13G5… / hạng 16 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 6KTAA25G36 + LK544C / longkai-power / dòng |POWERYOURFUTURE|6KTAA25… / hạng 28 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / QSZ13G3 + HCI544C / uleengen / dòng |UC500GF|400|500|QSZ13G3… / hạng 19 ← đã có trong all gốc, điểm 276→276
- SDEC / 6ETAA128G31 + JET544C / jet-power / dòng |SD500|500|400|450|360|6… / hạng 25 ← đã có trong all gốc, điểm 269→269
- Baudouin / 6M21G500/5 + LSA473M7 / longkai-power / dòng |LG360BD|396|495|360|450… / hạng 29 ← đã có trong all gốc, điểm 265→265
all: ra 7, vào 0

### IB2400596787#0  (top ra 3, vào 3; dropped gốc 2047 → nhánh 2053)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC27G900D2 + LK544F / longkai-power / dòng |POWERYOURFUTURE|SC27G90… / hạng 5 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / VTA28G5 + TALA473F / rcg-power / dòng |RC625D5S|625KVA/500KW|6… / hạng 19 → còn trong all nhánh, điểm 233→233
- Baudouin / 8M21G660/5 + S5L1DE41 / kaihua-genset / dòng |HCBD660|660|600|8M21G66… / hạng 23 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC27G900D2 + BW354F / bobig-power / dòng |BSD743|540|675|594|743|… / hạng 10 ← đã có trong all gốc, điểm 262→262
- Cummins / KT38GA + LK634B / longkai-power / dòng |POWERYOURFUTURE|KT38GA|… / hạng 11 ← đã có trong all gốc, điểm 259→259
- Ricardo / K29G1210D + JET634B / jet-power / dòng |GF825|825|660|750|600|K… / hạng 30 ← đã có trong all gốc, điểm 202→202
all: ra 5, vào 0

### IB2400602840#1  (top ra 2, vào 2; dropped gốc 1362 → nhánh 1367)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 12M26G1000/5 + S6L1DD4 / rcg-power / dòng |RWB900D5S(STAGE2)|900KV… / hạng 23 → còn trong all nhánh, điểm 228→228
- ? / SC33G1150D2 + LK634D / longkai-power / dòng |POWERYOURFUTURE|SC33W11… / hạng 30 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 12M26G900/5 + LSA493M8 / longkai-power / dòng |LG650BD|7172|8965|652|8… / hạng 16 ← đã có trong all gốc, điểm 239→247
- FAWDE / R728GE + R6404 / rcg-power / dòng |R800D5/S|800KVA/640KW|8… / hạng 30 ← đã có trong all gốc, điểm 165→165
all: ra 5, vào 0

### IB2400617546#0  (top ra 2, vào 1; dropped gốc 61 → nhánh 63)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 6M31G750/5 / cgm-italia / dòng |680B||680|544|748|5984|… / hạng 14 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 6M33G4D5/S / cgm-italia / dòng |V750B||750|600|825|660|… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Doosan / Hyundai / DP222LC / cgm-italia / dòng |750DS||750|600|825|660|… / hạng 11 ← đã có trong all gốc, điểm 120→120
all: ra 2, vào 0

### IB2500008885#0  (top ra 2, vào 2; dropped gốc 892 → nhánh 893)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / 6M33D670E200 + LK544F / longkai-power / dòng |POWERYOURFUTURE|6M33D67… / hạng 15 → còn trong all nhánh, điểm 274→274
- Weichai / 6M33D633E200 + HC534FS / acepow-fuan / dòng |APW520|520|650|580|725|… / hạng 24 → còn trong all nhánh, điểm 269→269
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Weichai / 6M33D633E200 + LK544F / longkai-power / dòng |POWERYOURFUTURE|6M33D63… / hạng 11 ← không có trong all gốc
- Yuchai / YC6TD840D31 + TFW25004A / dingbo / dòng |XG500GF|500/625|550/687… / hạng 30 ← đã có trong all gốc, điểm 269→269
all: ra 1, vào 1

### IB2500031588#0  (top ra 2, vào 2; dropped gốc 51 → nhánh 51)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Perkins / 404D22TG + PI144E / sanq-power / dòng |SQP30|24/30|22/27|404D2… / hạng 13 → còn trong all nhánh, điểm 270→270
- Yangdong / Y490D + 184EF / uleengen / dòng |UY25GFS|20|25|Y490D|24|… / hạng 19 → còn trong all nhánh, điểm 269→269
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Perkins / 404D22TG + S0L2M1 / uleengen / dòng |UP25GF|20|25|404D22TG|P… / hạng 7 ← đã có trong all gốc, điểm 281→281
- Cummins / 4BT39G2 + PI144G / sanq-power / dòng |SQC33|264/33|24/30|4BT3… / hạng 27 ← đã có trong all gốc, điểm 258→258
all: ra 0, vào 0

### IB2500039578#0  (top ra 1, vào 1; dropped gốc 18 → nhánh 18)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 6M31G725/5 / cgm-italia / dòng |650B||650|520|715|572|6… / hạng 16 → còn trong all nhánh, điểm 89→97
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 6M21G8D0/S / cgm-italia / dòng |500B||500|400|550|440|6… / hạng 16 ← đã có trong all gốc, điểm 75→99
all: ra 0, vào 0

### IB2500039578#1  (top ra 2, vào 1; dropped gốc 14 → nhánh 16)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 16M55G3000/5 / cgm-italia / dòng |2800B||2800|2240|3080|2… / hạng 11 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 16M55G3300/5 / cgm-italia / dòng |3000B||3000|2400|3300|2… / hạng 13 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Perkins / 401661TRG3X / cgm-italia / dòng |2500P||2500|2000|2500|2… / hạng 13 ← đã có trong all gốc, điểm 75→75
all: ra 2, vào 0

### IB2500042107#0  (top ra 5, vào 5; dropped gốc 766 → nhánh 772)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 6KTAA25G36 + LK544C / longkai-power / dòng |POWERYOURFUTURE|6KTAA25… / hạng 20 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC25G690D2 + LK544C / longkai-power / dòng |POWERYOURFUTURE|SC25G69… / hạng 21 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSZ13G10 + LK544C / longkai-power / dòng |POWERYOURFUTURE|QSZ13G1… / hạng 22 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Deutz / BF8M1015CPG1A + TFW24004 / dingbo / dòng |XG400GF|400/500|440/550… / hạng 29 → còn trong all nhánh, điểm 261→261
- Weichai / 6M26D484E200 + BW354D / bobig-power / dòng |BWC550|400|500|440|550|… / hạng 30 → còn trong all nhánh, điểm 261→261
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Weichai / 6M26D484E200 + LK544C / longkai-power / dòng |POWERYOURFUTURE|6M26D48… / hạng 24 ← đã có trong all gốc, điểm 270→270
- Cummins / QSK19G13 + LK544C / longkai-power / dòng |POWERYOURFUTURE|QSK19G1… / hạng 25 ← đã có trong all gốc, điểm 270→270
- SDEC / SC25G690D2 + 1FC23544 / dingbo / dòng |XG400GF|400/500|440/550… / hạng 26 ← đã có trong all gốc, điểm 269→269
- Weichai / 6M33D572E200 + LK544E / longkai-power / dòng |POWERYOURFUTURE|6M33D57… / hạng 28 ← đã có trong all gốc, điểm 263→263
- Wudong / WD269TAD43 + LSA472M7 / wintpower / dòng |WTW550E|550|440KW|500|4… / hạng 30 ← đã có trong all gốc, điểm 254→262
all: ra 6, vào 0

### IB2500056085#0  (top ra 3, vào 3; dropped gốc 145 → nhánh 151)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 6KTAA25G36 + LK544C / longkai-power / dòng |POWERYOURFUTURE|6KTAA25… / hạng 24 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC25G690D2 + LK544C / longkai-power / dòng |POWERYOURFUTURE|SC25G69… / hạng 25 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSZ13G10 + LK544C / longkai-power / dòng |POWERYOURFUTURE|QSZ13G1… / hạng 26 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 6ZTAA13G4 + DC24V / sunkings / dòng |MODELNUMBER:|SHX500|ENG… / hạng 25 ← đã có trong all gốc, điểm 275→275
- Weichai / 6M26D484E200 + LK544C / longkai-power / dòng |POWERYOURFUTURE|6M26D48… / hạng 28 ← đã có trong all gốc, điểm 270→270
- SDEC / SC25G690D2 + 1FC23544 / dingbo / dòng |XG400GF|400/500|440/550… / hạng 29 ← đã có trong all gốc, điểm 269→269
all: ra 6, vào 0

### IB2500067556#1  (top ra 1, vào 1; dropped gốc 0 → nhánh 0)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Caterpillar / CATC15 + LC1114D / rise-power / dòng |DE135E3|125|10|135|108|… / hạng 30 → còn trong all nhánh, điểm 221→221
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 29 ← đã có trong all gốc, điểm 217→225
all: ra 0, vào 0

### IB2500073242#0  (top ra 5, vào 0; dropped gốc 24 → nhánh 33)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 6M11G2D0/S / genmac / dòng PYREXG131BS1451306M11G2D… / hạng 4 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 6M11G4D0/S / genmac / dòng EXPRESSG141BO1501406M11G… / hạng 6 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 6M11G2D0/S / interpower-international / dòng 400/23010513181155145119… / hạng 7 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 6M11G2D0/S / electra-molins / dòng MODELO:EMB2150… / hạng 8 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 6M11G4D0/S / coelmo / dòng POTENZAPRP(KVA)150POTENZ… / hạng 22 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- (không có)
all: ra 9, vào 0

### IB2500124299#0  (top ra 1, vào 1; dropped gốc 355 → nhánh 356)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / QSB67G4 + LK274G / longkai-power / dòng |POWERYOURFUTURE|QSB67G4… / hạng 8 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / QSB67G4 / victory-generator / dòng |V160C|50|144|180|160|20… / hạng 18 ← đã có trong all gốc, điểm 210→210
all: ra 1, vào 0

### IB2500129189#0  (top ra 4, vào 4; dropped gốc 624 → nhánh 634)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / WP10D264E200 + LK274K / longkai-power / dòng |POWERYOURFUTURE|WP10D26… / hạng 12 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 6CTAA83G9 + LK274J / longkai-power / dòng |POWERYOURFUTURE|6CTAA83… / hạng 14 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 6LTAA89G3 + LK274K / longkai-power / dòng |POWERYOURFUTURE|6LTAA89… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
- YTO / YM6H4LFD + UC274J / acepow-fuan / dòng |APYT190|60|3|190|209|23… / hạng 30 → còn trong all nhánh, điểm 269→269
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Weichai / WP10D264E200 + UCI274K / uleengen / dòng |UW250GF|200|250|WP10D26… / hạng 16 ← đã có trong all gốc, điểm 275→275
- Baudouin / 6M16G275/5 + LSA463S5 / longkai-power / dòng |LG200BD|220|275|200|250… / hạng 20 ← đã có trong all gốc, điểm 273→273
- Cummins / 6LTAA89G3 + UC274K / acepow-fuan / dòng |APC200|200|250|220|275|… / hạng 28 ← đã có trong all gốc, điểm 269→269
- Cummins / NTA855G1A + HCI444D / stone-power / dòng |SC288E5|250|230|313|288… / hạng 30 ← đã có trong all gốc, điểm 269→269
all: ra 10, vào 0

### IB2500140418#0  (top ra 1, vào 1; dropped gốc 18 → nhánh 18)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Perkins / 404D22G / elitech-power / dòng MODEL:EPS125PKA3S|13KVA|… / hạng 26 → còn trong all nhánh, điểm 225→225
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 26 ← đã có trong all gốc, điểm 217→225
all: ra 0, vào 0

### IB2500143055#0  (top ra 1, vào 1; dropped gốc 706 → nhánh 706)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / 6M26D484E200 + BW354D / bobig-power / dòng |BWC550|400|500|440|550|… / hạng 30 → còn trong all nhánh, điểm 261→261
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Wudong / WD269TAD43 + LSA472M7 / wintpower / dòng |WTW550E|550|440KW|500|4… / hạng 29 ← đã có trong all gốc, điểm 254→262
all: ra 0, vào 0

### IB2500152724#2  (top ra 1, vào 1; dropped gốc 32 → nhánh 32)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- FAWDE / 4DW8128D + SYA164B / minsun-motor / dòng |GFF125|125|10|4DW8128D|… / hạng 30 → còn trong all nhánh, điểm 221→221
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 26 ← đã có trong all gốc, điểm 217→225
all: ra 0, vào 0

### IB2500177769#0  (top ra 1, vào 1; dropped gốc 1102 → nhánh 1109)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 6ETAA118G21 + LK444E / longkai-power / dòng |POWERYOURFUTURE|6ETAA11… / hạng 18 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Doosan / Hyundai / P126TIII + LSA462VL12 / rise-power / dòng |RDL27660|276/345|304/38… / hạng 28 ← đã có trong all gốc, điểm 261→261
all: ra 7, vào 0

### IB2500206907#0  (top ra 3, vào 3; dropped gốc 603 → nhánh 610)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 6CTAA83G9 + LK274J / longkai-power / dòng |POWERYOURFUTURE|6CTAA83… / hạng 14 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 6LTAA89G3 + LK274K / longkai-power / dòng |POWERYOURFUTURE|6LTAA89… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
- YTO / YM6H4LFD + UC274J / acepow-fuan / dòng |APYT190|60|3|190|209|23… / hạng 30 → còn trong all nhánh, điểm 269→269
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 6M16G275/5 + LSA463S5 / longkai-power / dòng |LG200BD|220|275|200|250… / hạng 20 ← đã có trong all gốc, điểm 273→273
- Cummins / 6LTAA89G3 + UC274K / acepow-fuan / dòng |APC200|200|250|220|275|… / hạng 28 ← đã có trong all gốc, điểm 269→269
- Cummins / NTA855G1A + HCI444D / stone-power / dòng |SC288E5|250|230|313|288… / hạng 30 ← đã có trong all gốc, điểm 269→269
all: ra 7, vào 0

### IB2500249932#0  (top ra 1, vào 1; dropped gốc 707 → nhánh 709)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / 6M26D484E200 + BW354D / bobig-power / dòng |BWC550|400|500|440|550|… / hạng 30 → còn trong all nhánh, điểm 261→261
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Wudong / WD269TAD43 + LSA472M7 / wintpower / dòng |WTW550E|550|440KW|500|4… / hạng 29 ← đã có trong all gốc, điểm 254→262
all: ra 2, vào 0

### IB2500261097#0  (top ra 2, vào 2; dropped gốc 2388 → nhánh 2393)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC27G755D2 + LK544D / longkai-power / dòng |POWERYOURFUTURE|SC27G75… / hạng 6 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 8M21G660/5 + S5L1DE41 / kaihua-genset / dòng |HCBD660|660|600|8M21G66… / hạng 27 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC27G755D2 + JET544ES / jet-power / dòng |SD625|625|500|563|450|S… / hạng 8 ← đã có trong all gốc, điểm 256→256
- SDEC / 12GTAA27G33 + WR544DL / rcg-power / dòng |RSC563D5S|563KVA/450KW|… / hạng 30 ← đã có trong all gốc, điểm 192→192
all: ra 4, vào 0

### IB2500266050#0  (top ra 1, vào 1; dropped gốc 12 → nhánh 12)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Yangdong / YD485D/17KW + JET164D/128KW / jet-power / dòng |YD17|165|132|15|12|YD48… / hạng 28 → còn trong all nhánh, điểm 228→228
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D + JET184D / jet-power / dòng |GF21|21|17|19|15|K4100D… / hạng 26 ← đã có trong all gốc, điểm 225→233
all: ra 0, vào 0

### IB2500271331#1  (top ra 1, vào 1; dropped gốc 255 → nhánh 255)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Yangdong / Y4102D + TGI184S25 / tecgen-fujian / dòng |RATECURRENT(A)|566|694|… / hạng 30 → còn trong all nhánh, điểm 266→266
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D + JET184G / jet-power / dòng |GF33|33|26|30|24|K4100D… / hạng 28 ← đã có trong all gốc, điểm 261→269
all: ra 0, vào 0

### IB2500279384#0  (top ra 2, vào 2; dropped gốc 171 → nhánh 174)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G2 + LK184F / longkai-power / dòng |POWERYOURFUTURE|4B39G2|… / hạng 7 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 4B39G11 + LK184E / longkai-power / dòng |POWERYOURFUTURE|4B39G11… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 4B39G11 + BW184ES / bobig-power / dòng |BC22|16|20|18|22|4B39G1… / hạng 17 ← đã có trong all gốc, điểm 269→269
- Cummins / 4B39G2 + PI144E / sanq-power / dòng |SQC27|22/27|20/25|4B39G… / hạng 29 ← đã có trong all gốc, điểm 253→253
all: ra 3, vào 0

### IB2500280002#1  (top ra 1, vào 1; dropped gốc 3 → nhánh 3)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Yanmar / 4TNV88BIECS / genmac / dòng DUPLEXG20YOE320184TNV88B… / hạng 14 → còn trong all nhánh, điểm 145→145
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 4M06G4D0/S / genmac / dòng EDITG21BO22204M06G4D0/S1… / hạng 14 ← đã có trong all gốc, điểm 140→164
all: ra 0, vào 0

### IB2500281552#0  (top ra 1, vào 1; dropped gốc 922 → nhánh 925)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / Weichai / 12M33D1450E310 + LK734B / longkai-power / dòng |POWERYOURFUTURE|12M33D1… / hạng 20 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Perkins / INDIA401246TAG2A + S7L1DC41 / kaihua-genset / dòng |HC1650GF|1650|1500|INDI… / hạng 29 ← đã có trong all gốc, điểm 217→217
all: ra 3, vào 0

### IB2500291421#1  (top ra 3, vào 3; dropped gốc 2578 → nhánh 2584)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 6KTAA25G35 + LK544E / longkai-power / dòng |POWERYOURFUTURE|6KTAA25… / hạng 2 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 6KTAA25G34 + LK544FS / longkai-power / dòng |POWERYOURFUTURE|6KTAA25… / hạng 7 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 8M21G660/5 + S5L1DE41 / kaihua-genset / dòng |HCBD660|660|600|8M21G66… / hạng 18 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / 6KTAA25G31 / elitech-power / dòng |EPS825SDA3|SDEC|625KVA|… / hạng 16 ← đã có trong all gốc, điểm 215→215
- SDEC / 6KTAA25G321 / elitech-power / dòng |EPS1000SDA3|SDEC|625KVA… / hạng 18 ← đã có trong all gốc, điểm 215→215
- Scania / DC13093A0273 / voltgent / dòng |VS6006|600|480|550|440|… / hạng 30 ← đã có trong all gốc, điểm 165→165
all: ra 5, vào 0

### IB2500302333#0  (top ra 3, vào 3; dropped gốc 698 → nhánh 705)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC7H220D2 + LK274F / longkai-power / dòng |POWERYOURFUTURE|SC7H220… / hạng 6 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC7H230D2 + LK274G / longkai-power / dòng |POWERYOURFUTURE|SC7H230… / hạng 8 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSB67G4 + LK274G / longkai-power / dòng |POWERYOURFUTURE|QSB67G4… / hạng 22 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC7H250D2 + 1FC22824 / dingbo / dòng |XG150GF|150/1875|165/20… / hạng 28 ← đã có trong all gốc, điểm 252→252
- Yuchai / YC6A245D30 + TFW21504A / dingbo / dòng |XG150GF|150/1875|165/20… / hạng 29 ← đã có trong all gốc, điểm 252→252
- SDEC / SC7H230D2 + 1FC22824 / dingbo / dòng |XG150GF|150/1875|165/20… / hạng 30 ← đã có trong all gốc, điểm 252→252
all: ra 7, vào 0

### IB2500337925#0  (top ra 1, vào 1; dropped gốc 32 → nhánh 32)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- FAWDE / 4DW8128D + SYA164B / minsun-motor / dòng |GFF125|125|10|4DW8128D|… / hạng 30 → còn trong all nhánh, điểm 221→221
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 26 ← đã có trong all gốc, điểm 217→225
all: ra 0, vào 0

### IB2500351271#0  (top ra 1, vào 1; dropped gốc 816 → nhánh 818)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 6WTAA35G32 + LK634D / longkai-power / dòng |POWERYOURFUTURE|6WTAA35… / hạng 21 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 12M26G1000/5 + LSA493L9 / longkai-power / dòng |LG720BD|792|990|720|900… / hạng 16 ← đã có trong all gốc, điểm 268→268
all: ra 2, vào 0

### IB2500360231#0  (top ra 1, vào 1; dropped gốc 5 → nhánh 7)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 16M55G3000/5 / cgm-italia / dòng |2800B||2800|2240|3080|2… / hạng 16 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Mitsubishi / S16R2PTAW2E / cgm-italia / dòng |2500MH||2500|2000|2750|… / hạng 16 ← đã có trong all gốc, điểm 99→99
all: ra 2, vào 0

### IB2500363177#0  (top ra 1, vào 1; dropped gốc 69 → nhánh 69)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / WP23D25E200 + TALA40D / penlucky / dòng |PLW165/B1|165|15|WP23D2… / hạng 30 → còn trong all nhánh, điểm 216→216
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 25 ← đã có trong all gốc, điểm 213→221
all: ra 0, vào 0

### IB2500363403#0  (top ra 1, vào 1; dropped gốc 415 → nhánh 418)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC7H220D2 + LK274F / longkai-power / dòng |POWERYOURFUTURE|SC7H220… / hạng 19 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Perkins / 1106A70TAG3 + UCI274G / tecgen-fujian / dòng |MODELNUMBER|TG200P|GENS… / hạng 30 ← đã có trong all gốc, điểm 464→464
all: ra 3, vào 0

### IB2500385135#0  (top ra 1, vào 1; dropped gốc 104 → nhánh 104)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Deutz / F2L912D / victory-generator / dòng |VD12F|50|10|125|12|15|F… / hạng 30 → còn trong all nhánh, điểm 202→202
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 27 ← đã có trong all gốc, điểm 197→205
all: ra 0, vào 0

### IB2500385135#1  (top ra 2, vào 2; dropped gốc 262 → nhánh 265)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G2 + LK184F / longkai-power / dòng |POWERYOURFUTURE|4B39G2|… / hạng 7 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 4B39G11 + LK184E / longkai-power / dòng |POWERYOURFUTURE|4B39G11… / hạng 13 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 4B39G11 + BW184ES / bobig-power / dòng |BC22|16|20|18|22|4B39G1… / hạng 14 ← đã có trong all gốc, điểm 269→269
- Cummins / 4B39G2 + PI144E / sanq-power / dòng |SQC27|22/27|20/25|4B39G… / hạng 27 ← đã có trong all gốc, điểm 253→253
all: ra 3, vào 0

### IB2500386455#0  (top ra 2, vào 2; dropped gốc 13 → nhánh 15)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 4M06G10D0/S / genmac / dòng EDITG51BO55504M06G10D0/S… / hạng 1 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 4M06G10D0/S / cgm-italia / dòng |50B||50|40|55|44|4M06G1… / hạng 11 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- John Deere / 3029HFU20 / genmac / dòng ALPHAG60JO65593029HFU201… / hạng 6 ← đã có trong all gốc, điểm 147→147
- Perkins / 904JE36TA / cgm-italia / dòng |V60P||60|48|66|528|904J… / hạng 19 ← đã có trong all gốc, điểm 55→55
all: ra 2, vào 0

### IB2500386628#0  (top ra 1, vào 1; dropped gốc 7 → nhánh 7)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- FPT / B750 / cgm-italia / dòng |600F||600|480|660|528|F… / hạng 16 → còn trong all nhánh, điểm 72→72
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 6M31G750/5 / cgm-italia / dòng |680B||680|544|748|5984|… / hạng 16 ← đã có trong all gốc, điểm 58→82
all: ra 0, vào 0

### IB2500403535#1  (top ra 1, vào 1; dropped gốc 37 → nhánh 37)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Yanmar / 3TNV82AGGE + TALA40C / sr-genset / dòng |132|1056|120|96|3TNV82A… / hạng 30 → còn trong all nhánh, điểm 217→217
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 30 ← đã có trong all gốc, điểm 213→221
all: ra 0, vào 0

### IB2500415487#1  (top ra 1, vào 1; dropped gốc 0 → nhánh 0)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Yanmar / 4TNV88BIECS / genmac / dòng DUPLEXG20YOE320184TNV88B… / hạng 5 → còn trong all nhánh, điểm 145→145
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 4M06G4D0/S / genmac / dòng EDITG21BO22204M06G4D0/S1… / hạng 5 ← đã có trong all gốc, điểm 140→164
all: ra 0, vào 0

### IB2500448140#0  (top ra 3, vào 3; dropped gốc 1438 → nhánh 1446)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / QSZ13G5 + LK544B / longkai-power / dòng |POWERYOURFUTURE|QSZ13G5… / hạng 12 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSZ13G2 + LK544B / longkai-power / dòng |POWERYOURFUTURE|QSZ13G2… / hạng 13 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSZ13G3 + LK544C / longkai-power / dòng |POWERYOURFUTURE|QSZ13G3… / hạng 18 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / QSZ13G2 + HCI544C1 / dingbo / dòng |XG350GF|350/4375|385/48… / hạng 15 ← đã có trong all gốc, điểm 562→562
- Cummins / QSK19G14 + LK544B / longkai-power / dòng |POWERYOURFUTURE|QSK19G1… / hạng 18 ← đã có trong all gốc, điểm 560→560
- Cummins / QSZ13G7 / hosem-power / dòng |AC456|415|332|456|365|Q… / hạng 25 ← đã có trong all gốc, điểm 528→528
all: ra 8, vào 0

### IB2500473200#0  (top ra 1, vào 1; dropped gốc 2135 → nhánh 2146)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 8M21G660/5 + S5L1DE41 / kaihua-genset / dòng |HCBD660|660|600|8M21G66… / hạng 23 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Yuchai / YCTD20900G31 + 544F / byc-power / dòng |BYYC750|560|700|600|750… / hạng 30 ← đã có trong all gốc, điểm 202→202
all: ra 10, vào 0

### IB2500474495#0  (top ra 3, vào 3; dropped gốc 544 → nhánh 553)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 6CTAA83G9 + LK274J / longkai-power / dòng |POWERYOURFUTURE|6CTAA83… / hạng 14 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 6LTAA89G3 + LK274K / longkai-power / dòng |POWERYOURFUTURE|6LTAA89… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
- YTO / YM6H4LFD + UC274J / acepow-fuan / dòng |APYT190|60|3|190|209|23… / hạng 30 → còn trong all nhánh, điểm 269→269
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 6M16G275/5 + LSA463S5 / longkai-power / dòng |LG200BD|220|275|200|250… / hạng 20 ← đã có trong all gốc, điểm 273→273
- Cummins / 6LTAA89G3 + UC274K / acepow-fuan / dòng |APC200|200|250|220|275|… / hạng 28 ← đã có trong all gốc, điểm 269→269
- Cummins / NTA855G1A + HCI444D / stone-power / dòng |SC288E5|250|230|313|288… / hạng 30 ← đã có trong all gốc, điểm 269→269
all: ra 9, vào 0

### IB2500474803#0  (top ra 2, vào 2; dropped gốc 1038 → nhánh 1045)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 6KTAA25G36 + LK544C / longkai-power / dòng |POWERYOURFUTURE|6KTAA25… / hạng 20 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 6KTAA25G35 + LK544E / longkai-power / dòng |POWERYOURFUTURE|6KTAA25… / hạng 25 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / 6KTAA25G310 + JET544ES / jet-power / dòng |SD625|625|500|563|450|6… / hạng 29 ← đã có trong all gốc, điểm 256→256
- Yuchai / YC6T660LD20 + WT544D / wintpower / dòng |WTYC550|400/500|/|YC6T6… / hạng 30 ← đã có trong all gốc, điểm 253→253
all: ra 6, vào 0

### IB2500498271#0  (top ra 1, vào 1; dropped gốc 3 → nhánh 3)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Yanmar / 4TNV88BIECS / genmac / dòng DUPLEXG20YOE320184TNV88B… / hạng 10 → còn trong all nhánh, điểm 145→145
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 4M06G4D0/S / genmac / dòng EDITG21BO22204M06G4D0/S1… / hạng 10 ← đã có trong all gốc, điểm 140→164
all: ra 0, vào 0

### IB2500512614#0  (top ra 2, vào 2; dropped gốc 0 → nhánh 0)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- John Deere / 3029DFU20 / genmac / dòng ALPHAG30JO33303029DFU201… / hạng 15 → còn trong all nhánh, điểm 129→129
- Kohler / B20 / cgm-italia / dòng |E25KH||25|20|275|22|KOH… / hạng 23 → còn trong all nhánh, điểm 61→61
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Kohler / KDI2504TM30 / genmac / dòng ALPHAG30KO3330KDI2504TM3… / hạng 15 ← đã có trong all gốc, điểm 129→129
- Baudouin / 4M06G6D0/S / cgm-italia / dòng |30B||30|24|33|264|4M06G… / hạng 22 ← đã có trong all gốc, điểm 47→71
all: ra 0, vào 0

### IB2500531255#1  (top ra 1, vào 1; dropped gốc 0 → nhánh 0)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- FPT / F36ETVP03A85 / cgm-italia / dòng |V82F||82|656|82|656|FPT… / hạng 18 → còn trong all nhánh, điểm 74→74
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 4M10G4D0/S / cgm-italia / dòng |80B||80|64|88|704|4M10G… / hạng 18 ← đã có trong all gốc, điểm 69→93
all: ra 0, vào 0

### IB2500553750#0  (top ra 3, vào 1; dropped gốc 27 → nhánh 30)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 6M16G2D0/S / interpower-international / dòng 400/23016020017622028874… / hạng 3 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 6M16G2D0/S / cgm-italia / dòng |200B||200|160|220|176|6… / hạng 11 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 6M16G4D0/S / cgm-italia / dòng |230B||230|184|253|2024|… / hạng 18 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- FPT / B200 / cgm-italia / dòng |200F||200|160|220|176|F… / hạng 16 ← đã có trong all gốc, điểm 75→75
all: ra 3, vào 0

### IB2500570880#0  (top ra 2, vào 2; dropped gốc 26 → nhánh 29)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 6M16G6D0/S / interpower-international / dòng 400/23020025022027536156… / hạng 13 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 6M16G6D0/S / ade-power / dòng |STANDBYPOWER(ESP)RATING… / hạng 16 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Scania / DC9072A0212 + MA4114ES4L1DD / aj-power / dòng |AJ310|50HZ|THREEPHASE|1… / hạng 28 ← đã có trong all gốc, điểm 103→103
- FPT / CURSOR87TE4 / coelmo / dòng POTENZAPRP(KVA)300POTENZ… / hạng 29 ← đã có trong all gốc, điểm 103→103
all: ra 3, vào 0

### IB2500597081#0  (top ra 3, vào 3; dropped gốc 366 → nhánh 372)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4BTA39G13 + LK224G / longkai-power / dòng |POWERYOURFUTURE|4BTA39G… / hạng 13 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSB39G3 + LK224G/S / longkai-power / dòng |POWERYOURFUTURE|QSB39G3… / hạng 14 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 4HT43G23 + LK224G / longkai-power / dòng |POWERYOURFUTURE|4HT43G2… / hạng 25 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Perkins / 1104CE44TAG1 + UCI224G / gb-power / dòng STANDARDFEATURES|MODEL|G… / hạng 25 ← đã có trong all gốc, điểm 255→255
- Volvo Penta / TAD530GE + LSA443S4 / dingbo / dòng |XG68GF|68/85|75/9375|TA… / hạng 26 ← đã có trong all gốc, điểm 254→254
- Yangdong / Y4110ZLD + UC224F / acepow-fuan / dòng |APYD60|50HZ|60|66|75|83… / hạng 27 ← đã có trong all gốc, điểm 253→253
all: ra 6, vào 0

### IB2500597081#1  (top ra 3, vào 3; dropped gốc 564 → nhánh 570)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC12E420D2 + LK444E / longkai-power / dòng |POWERYOURFUTURE|SC12E42… / hạng 16 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC13G420D2 + LK444ES / longkai-power / dòng |POWERYOURFUTURE|SC13G42… / hạng 18 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 6LTAA95G1 + LK444ES / longkai-power / dòng |POWERYOURFUTURE|6LTAA95… / hạng 20 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / NTA855G2 + HCI444D / stone-power / dòng |SC344E6|303|275|379|344… / hạng 23 ← đã có trong all gốc, điểm 269→269
- FAWDE / CA6DM2J39D + 4ES / uleengen / dòng |UX300GF|240|300|CA6DM2J… / hạng 25 ← đã có trong all gốc, điểm 269→269
- YTO / YM6S4LFD + HC434CS / acepow-fuan / dòng |APYT220|50|3|220|242|27… / hạng 26 ← đã có trong all gốc, điểm 269→269
all: ra 6, vào 0

### IB2500626302#0  (top ra 3, vào 3; dropped gốc 87 → nhánh 91)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 8M21G660/5 / ade-power / dòng |STANDBYPOWER(ESP)RATING… / hạng 8 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 6M31G725/5 / cgm-italia / dòng |650B||650|520|715|572|6… / hạng 18 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Baudouin / 6M31G660/5 / cgm-italia / dòng |600B||600|480|660|528|6… / hạng 27 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 6M21G8D3/5 / cgm-italia / dòng |E500B||500|400|550|440|… / hạng 9 ← đã có trong all gốc, điểm 139→139
- Baudouin / 6M21G8D0/S / cgm-italia / dòng |500B||500|400|550|440|6… / hạng 15 ← đã có trong all gốc, điểm 75→99
- Scania / DC13507A / scania-engines / dòng GROSSPOWER600660600660KV… / hạng 27 ← đã có trong all gốc, điểm 66→66
all: ra 4, vào 0

### IB2600027651#1  (top ra 1, vào 1; dropped gốc 3 → nhánh 3)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4BTAA33G13 / cgm-italia / dòng |60CU||60|48|66|528|4BTA… / hạng 22 → còn trong all nhánh, điểm 83→83
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 4M10G2D0/S / cgm-italia / dòng |65B||65|52|715|572|4M10… / hạng 21 ← đã có trong all gốc, điểm 75→99
all: ra 0, vào 0

### IB2600064878#0  (top ra 1, vào 1; dropped gốc 4 → nhánh 4)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Caterpillar / CATC15 + LC1114D / rise-power / dòng |DE135E3|125|10|135|108|… / hạng 30 → còn trong all nhánh, điểm 217→217
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 29 ← đã có trong all gốc, điểm 213→221
all: ra 0, vào 0

### IB2600072892#0  (top ra 3, vào 3; dropped gốc 603 → nhánh 610)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 6CTAA83G9 + LK274J / longkai-power / dòng |POWERYOURFUTURE|6CTAA83… / hạng 14 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 6LTAA89G3 + LK274K / longkai-power / dòng |POWERYOURFUTURE|6LTAA89… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
- YTO / YM6H4LFD + UC274J / acepow-fuan / dòng |APYT190|60|3|190|209|23… / hạng 30 → còn trong all nhánh, điểm 269→269
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 6M16G275/5 + LSA463S5 / longkai-power / dòng |LG200BD|220|275|200|250… / hạng 20 ← đã có trong all gốc, điểm 273→273
- Cummins / 6LTAA89G3 + UC274K / acepow-fuan / dòng |APC200|200|250|220|275|… / hạng 28 ← đã có trong all gốc, điểm 269→269
- Cummins / NTA855G1A + HCI444D / stone-power / dòng |SC288E5|250|230|313|288… / hạng 30 ← đã có trong all gốc, điểm 269→269
all: ra 7, vào 0

### IB2600075436#0  (top ra 1, vào 0; dropped gốc 3 → nhánh 4)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 4M10G6D0/S / cgm-italia / dòng |100B||100|80|110|88|4M1… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- (không có)
all: ra 1, vào 0

### IB2600075436#1  (top ra 3, vào 3; dropped gốc 0 → nhánh 0)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- John Deere / 4045HFU20 / genmac / dòng GAMMAG125JO1341214045HFU… / hạng 8 → còn trong all nhánh, điểm 164→164
- FPT / NEF45TM3 / genmac / dòng GAMMAG130IO134122NEF45TM… / hạng 9 → còn trong all nhánh, điểm 163→163
- FPT / NEF67SM1 / tecnogen / dòng |IV141TSX|140|125|160|14… / hạng 19 → còn trong all nhánh, điểm 71→71
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 6M11G2D0/S / genmac / dòng PYREXG131BS1451306M11G2D… / hạng 2 ← đã có trong all gốc, điểm 157→181
- Baudouin / 4M10G4D0/S / genmac / dòng PYREXG141BS1501404M10G4D… / hạng 3 ← đã có trong all gốc, điểm 156→180
- FPT / NEF45TM3 / tecnogen / dòng |IV140TSX|1375|125|||NEF… / hạng 20 ← đã có trong all gốc, điểm 71→71
all: ra 0, vào 0

### IB2600112737#0  (top ra 1, vào 0; dropped gốc 3 → nhánh 4)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 4M10G6D0/S / cgm-italia / dòng |100B||100|80|110|88|4M1… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- (không có)
all: ra 1, vào 0

### IB2600112737#1  (top ra 3, vào 3; dropped gốc 0 → nhánh 0)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- John Deere / 4045HFU20 / genmac / dòng GAMMAG125JO1341214045HFU… / hạng 8 → còn trong all nhánh, điểm 164→164
- FPT / NEF45TM3 / genmac / dòng GAMMAG130IO134122NEF45TM… / hạng 9 → còn trong all nhánh, điểm 163→163
- FPT / NEF67SM1 / tecnogen / dòng |IV141TSX|140|125|160|14… / hạng 19 → còn trong all nhánh, điểm 71→71
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 6M11G2D0/S / genmac / dòng PYREXG131BS1451306M11G2D… / hạng 2 ← đã có trong all gốc, điểm 157→181
- Baudouin / 4M10G4D0/S / genmac / dòng PYREXG141BS1501404M10G4D… / hạng 3 ← đã có trong all gốc, điểm 156→180
- FPT / NEF45TM3 / tecnogen / dòng |IV140TSX|1375|125|||NEF… / hạng 20 ← đã có trong all gốc, điểm 71→71
all: ra 0, vào 0

### IB2600118095#0  (top ra 3, vào 3; dropped gốc 238 → nhánh 242)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G2 + LK184F / longkai-power / dòng |POWERYOURFUTURE|4B39G2|… / hạng 11 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 4B39G11 + LK184E / longkai-power / dòng |POWERYOURFUTURE|4B39G11… / hạng 19 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Weichai / WP23D25E200 + LK184E / longkai-power / dòng |POWERYOURFUTURE|WP23D25… / hạng 27 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 4B39G11 + BC184E / acepow-fuan / dòng |APC17|17|20|19|24|4B39G… / hạng 23 ← đã có trong all gốc, điểm 269→269
- Weichai / WP23D25E200 + S0L2M1 / uleengen / dòng |UW25GF|20|25|WP23D25E20… / hạng 29 ← đã có trong all gốc, điểm 256→256
- Yangdong / Y490D + TG184S18 / tecgen-fujian / dòng |TG25YD|25|20|23|18|Y490… / hạng 30 ← đã có trong all gốc, điểm 254→254
all: ra 4, vào 0

### IB2600128010#1  (top ra 5, vào 5; dropped gốc 766 → nhánh 772)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 6KTAA25G36 + LK544C / longkai-power / dòng |POWERYOURFUTURE|6KTAA25… / hạng 20 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC25G690D2 + LK544C / longkai-power / dòng |POWERYOURFUTURE|SC25G69… / hạng 21 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSZ13G10 + LK544C / longkai-power / dòng |POWERYOURFUTURE|QSZ13G1… / hạng 22 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Deutz / BF8M1015CPG1A + TFW24004 / dingbo / dòng |XG400GF|400/500|440/550… / hạng 29 → còn trong all nhánh, điểm 261→261
- Weichai / 6M26D484E200 + BW354D / bobig-power / dòng |BWC550|400|500|440|550|… / hạng 30 → còn trong all nhánh, điểm 261→261
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Weichai / 6M26D484E200 + LK544C / longkai-power / dòng |POWERYOURFUTURE|6M26D48… / hạng 24 ← đã có trong all gốc, điểm 270→270
- Cummins / QSK19G13 + LK544C / longkai-power / dòng |POWERYOURFUTURE|QSK19G1… / hạng 25 ← đã có trong all gốc, điểm 270→270
- SDEC / SC25G690D2 + 1FC23544 / dingbo / dòng |XG400GF|400/500|440/550… / hạng 26 ← đã có trong all gốc, điểm 269→269
- Weichai / 6M33D572E200 + LK544E / longkai-power / dòng |POWERYOURFUTURE|6M33D57… / hạng 28 ← đã có trong all gốc, điểm 263→263
- Wudong / WD269TAD43 + LSA472M7 / wintpower / dòng |WTW550E|550|440KW|500|4… / hạng 30 ← đã có trong all gốc, điểm 254→262
all: ra 6, vào 0

### IB2600184876#0  (top ra 1, vào 1; dropped gốc 4 → nhánh 4)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Yanmar / 3TNV82AGGE + TALA40C / sr-genset / dòng |132|1056|120|96|3TNV82A… / hạng 30 → còn trong all nhánh, điểm 217→217
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 30 ← đã có trong all gốc, điểm 213→221
all: ra 0, vào 0

### IB2600225281#0  (top ra 1, vào 1; dropped gốc 69 → nhánh 69)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / WP23D25E200 + TALA40D / penlucky / dòng |PLW165/B1|165|15|WP23D2… / hạng 30 → còn trong all nhánh, điểm 216→216
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 25 ← đã có trong all gốc, điểm 213→221
all: ra 0, vào 0

### IB2600313010#0  (top ra 3, vào 3; dropped gốc 163 → nhánh 175)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC7H220D2 + LK274F / longkai-power / dòng |POWERYOURFUTURE|SC7H220… / hạng 11 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC7H230D2 + LK274G / longkai-power / dòng |POWERYOURFUTURE|SC7H230… / hạng 12 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSB67G4 + LK274G / longkai-power / dòng |POWERYOURFUTURE|QSB67G4… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Perkins / 1106A70TAG2 + UCI274F1 / kaihua-genset / dòng |HC165GF60|185|168|1106A… / hạng 24 ← đã có trong all gốc, điểm 269→269
- YTO / LR6M3LD + UC274F / acepow-fuan / dòng |APYT130|50|3|130|143|16… / hạng 25 ← đã có trong all gốc, điểm 269→269
- Cummins / 6BTAA59G12 + BW274E / bobig-power / dòng |BC17875S|130|163|143|17… / hạng 26 ← đã có trong all gốc, điểm 269→269
all: ra 12, vào 0

### IB2600315904#0  (top ra 1, vào 1; dropped gốc 1176 → nhánh 1176)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 6ETAA128G21 + JET444F / jet-power / dòng |SD440|440|352|400|320|6… / hạng 24 → còn trong all nhánh, điểm 248→248
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Volvo Penta / TAD1351GE + ECO382L4C / jet-power / dòng |V358T3|358|286|325|260|… / hạng 17 ← đã có trong all gốc, điểm 269→269
all: ra 0, vào 0

### IB2600327799#1  (top ra 3, vào 3; dropped gốc 0 → nhánh 0)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- John Deere / 4045HFU20 / genmac / dòng GAMMAG125JO1341214045HFU… / hạng 8 → còn trong all nhánh, điểm 164→164
- FPT / NEF45TM3 / genmac / dòng GAMMAG130IO134122NEF45TM… / hạng 9 → còn trong all nhánh, điểm 163→163
- FPT / NEF67SM1 / tecnogen / dòng |IV141TSX|140|125|160|14… / hạng 19 → còn trong all nhánh, điểm 71→71
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 6M11G2D0/S / genmac / dòng PYREXG131BS1451306M11G2D… / hạng 2 ← đã có trong all gốc, điểm 157→181
- Baudouin / 4M10G4D0/S / genmac / dòng PYREXG141BS1501404M10G4D… / hạng 3 ← đã có trong all gốc, điểm 156→180
- FPT / NEF45TM3 / tecnogen / dòng |IV140TSX|1375|125|||NEF… / hạng 20 ← đã có trong all gốc, điểm 71→71
all: ra 0, vào 0

### IB2600334541#1  (top ra 5, vào 5; dropped gốc 766 → nhánh 772)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / 6KTAA25G36 + LK544C / longkai-power / dòng |POWERYOURFUTURE|6KTAA25… / hạng 20 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC25G690D2 + LK544C / longkai-power / dòng |POWERYOURFUTURE|SC25G69… / hạng 21 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / QSZ13G10 + LK544C / longkai-power / dòng |POWERYOURFUTURE|QSZ13G1… / hạng 22 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Deutz / BF8M1015CPG1A + TFW24004 / dingbo / dòng |XG400GF|400/500|440/550… / hạng 29 → còn trong all nhánh, điểm 261→261
- Weichai / 6M26D484E200 + BW354D / bobig-power / dòng |BWC550|400|500|440|550|… / hạng 30 → còn trong all nhánh, điểm 261→261
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Weichai / 6M26D484E200 + LK544C / longkai-power / dòng |POWERYOURFUTURE|6M26D48… / hạng 24 ← đã có trong all gốc, điểm 270→270
- Cummins / QSK19G13 + LK544C / longkai-power / dòng |POWERYOURFUTURE|QSK19G1… / hạng 25 ← đã có trong all gốc, điểm 270→270
- SDEC / SC25G690D2 + 1FC23544 / dingbo / dòng |XG400GF|400/500|440/550… / hạng 26 ← đã có trong all gốc, điểm 269→269
- Weichai / 6M33D572E200 + LK544E / longkai-power / dòng |POWERYOURFUTURE|6M33D57… / hạng 28 ← đã có trong all gốc, điểm 263→263
- Wudong / WD269TAD43 + LSA472M7 / wintpower / dòng |WTW550E|550|440KW|500|4… / hạng 30 ← đã có trong all gốc, điểm 254→262
all: ra 6, vào 0

### IB2600341462#0  (top ra 2, vào 2; dropped gốc 255 → nhánh 255)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G2 + PI144E / stone-power / dòng |SC30E6|26|24|33|30|4B39… / hạng 13 → còn trong all nhánh, điểm 278→278
- Yangdong / Y490D + 184E / uleengen / dòng |UY30GFS|24|30|Y490D|28|… / hạng 20 → còn trong all nhánh, điểm 269→269
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 4B39G2 + S0L2P1 / uleengen / dòng |UC30GF|24|30|4B39G2|CUM… / hạng 10 ← đã có trong all gốc, điểm 281→281
- SDEC / 4Z30G21 + JET184F / jet-power / dòng |SD33|33|264|30|24|4Z30G… / hạng 30 ← đã có trong all gốc, điểm 253→253
all: ra 0, vào 0

### IB2600365013#0  (top ra 1, vào 1; dropped gốc 331 → nhánh 335)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / QSB67G4 + LK274G / longkai-power / dòng |POWERYOURFUTURE|QSB67G4… / hạng 10 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Volvo Penta / TAD753GE + UCI274H / jet-power / dòng |V220|220|176|200|160|TA… / hạng 30 ← đã có trong all gốc, điểm 265→265
all: ra 4, vào 0

### IB2600412115#0  (top ra 4, vào 4; dropped gốc 139 → nhánh 149)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / WP6D152E200 + LK274F/S / longkai-power / dòng |POWERYOURFUTURE|WP6D152… / hạng 16 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC7H220D2 + LK274F / longkai-power / dòng |POWERYOURFUTURE|SC7H220… / hạng 18 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC7H230D2 + LK274G / longkai-power / dòng |POWERYOURFUTURE|SC7H230… / hạng 20 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC7H230D2 + JET274F / jet-power / dòng |SD176|176|141|160|128|S… / hạng 26 → còn trong all nhánh, điểm 269→269
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Weichai / WP6D152E200 + JET274F / jet-power / dòng |WP165|165|132|150|120|W… / hạng 21 ← đã có trong all gốc, điểm 269→269
- Yuchai / YC6B205LD20 + TFW21204A / dingbo / dòng |XG120GF|120/150|132/165… / hạng 28 ← đã có trong all gốc, điểm 269→269
- SDEC / SC4H180D2 + 1FC22814 / dingbo / dòng |XG120GF|120/150|132/165… / hạng 29 ← đã có trong all gốc, điểm 269→269
- Weichai / WP6D167E200 + LK274G / longkai-power / dòng |POWERYOURFUTURE|WP6D167… / hạng 30 ← đã có trong all gốc, điểm 268→268
all: ra 10, vào 0

### IB2600419125#0  (top ra 1, vào 1; dropped gốc 103 → nhánh 103)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Quanchai / QC380D / elitech-power / dòng |EPS10QCA3|QUANCHAI|10KV… / hạng 30 → còn trong all nhánh, điểm 197→197
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 29 ← đã có trong all gốc, điểm 191→199
all: ra 0, vào 0

### IB2600448676#0  (top ra 2, vào 2; dropped gốc 1274 → nhánh 1279)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- SDEC / SC12E420D2 + LK444E / longkai-power / dòng |POWERYOURFUTURE|SC12E42… / hạng 9 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / SC13G420D2 + LK444ES / longkai-power / dòng |POWERYOURFUTURE|SC13G42… / hạng 11 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / SC13G420D2 + NIANFENGNF314E / fdk-energy / dòng |SC344V2H1CONTACT|344KVA… / hạng 23 ← đã có trong all gốc, điểm 266→266
- Doosan / Hyundai / P126TI + LSA462L9 / rise-power / dòng |RDL25060|250/313|275/34… / hạng 27 ← đã có trong all gốc, điểm 265→265
all: ra 5, vào 0

### IB2600450900#0  (top ra 1, vào 1; dropped gốc 15 → nhánh 15)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Perkins / 404D22G / elitech-power / dòng MODEL:EPS125PKA3S|13KVA|… / hạng 26 → còn trong all nhánh, điểm 225→225
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Ricardo / K4100D / elitech-power / dòng |EPS13RKA3|RICARDO|13KVA… / hạng 26 ← đã có trong all gốc, điểm 217→225
all: ra 0, vào 0

### IB2600470479#0  (top ra 3, vào 3; dropped gốc 603 → nhánh 610)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 6CTAA83G9 + LK274J / longkai-power / dòng |POWERYOURFUTURE|6CTAA83… / hạng 14 → không còn trong all nhánh (công cụ không ghi lý do khác)
- Cummins / 6LTAA89G3 + LK274K / longkai-power / dòng |POWERYOURFUTURE|6LTAA89… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
- YTO / YM6H4LFD + UC274J / acepow-fuan / dòng |APYT190|60|3|190|209|23… / hạng 30 → còn trong all nhánh, điểm 269→269
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 6M16G275/5 + LSA463S5 / longkai-power / dòng |LG200BD|220|275|200|250… / hạng 20 ← đã có trong all gốc, điểm 273→273
- Cummins / 6LTAA89G3 + UC274K / acepow-fuan / dòng |APC200|200|250|220|275|… / hạng 28 ← đã có trong all gốc, điểm 269→269
- Cummins / NTA855G1A + HCI444D / stone-power / dòng |SC288E5|250|230|313|288… / hạng 30 ← đã có trong all gốc, điểm 269→269
all: ra 7, vào 0

### IB2600472762#0  (top ra 1, vào 0; dropped gốc 30 → nhánh 31)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Baudouin / 6M33G4D5/S / cgm-italia / dòng |V750B||750|600|825|660|… / hạng 11 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- (không có)
all: ra 1, vào 0

### IB2600477305#1  (top ra 1, vào 1; dropped gốc 0 → nhánh 0)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Yanmar / 4TNV88BIECS / genmac / dòng DUPLEXG20YOE320184TNV88B… / hạng 5 → còn trong all nhánh, điểm 145→145
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Baudouin / 4M06G4D0/S / genmac / dòng EDITG21BO22204M06G4D0/S1… / hạng 5 ← đã có trong all gốc, điểm 140→164
all: ra 0, vào 0

### IB2600478079#0  (top ra 2, vào 2; dropped gốc 919 → nhánh 929)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / QSZ13G7 + LK444F / longkai-power / dòng |POWERYOURFUTURE|QSZ13G7… / hạng 11 → không còn trong all nhánh (công cụ không ghi lý do khác)
- SDEC / 6ETAA128G32 + LK444F / longkai-power / dòng |POWERYOURFUTURE|6ETAA12… / hạng 15 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Cummins / 6ZTAA13G4 + HCI544C / stone-power / dòng |SC450E5|400|360|500|450… / hạng 20 ← đã có trong all gốc, điểm 274→274
- SDEC / 6ETAA128G32 + BK314FS / bobig-power / dòng |BSD440|320|400|352|440|… / hạng 23 ← đã có trong all gốc, điểm 269→269
all: ra 10, vào 0

### IB2600511196#0  (top ra 1, vào 1; dropped gốc 560 → nhánh 561)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Weichai / 12M33D1108E200 + LK634F / longkai-power / dòng |POWERYOURFUTURE|12M33D1… / hạng 25 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- Weichai / 12M33D1108E200 + S6L1DF4 / kaihua-genset / dòng |HCBD1250|1250|1135|12M3… / hạng 26 ← đã có trong all gốc, điểm 261→261
all: ra 1, vào 0

### IB2600562009#0  (top ra 1, vào 1; dropped gốc 341 → nhánh 344)
Ra khỏi top 30 (hãng / động cơ + đầu phát / NCC / dòng / hạng cũ → trạng thái ở nhánh):
- Cummins / 4B39G12 + LK184G / longkai-power / dòng |POWERYOURFUTURE|4B39G12… / hạng 22 → không còn trong all nhánh (công cụ không ghi lý do khác)
Vào top 30 (hạng mới ← trạng thái ở gốc):
- SDEC / 4Z32G21 + JET184G / jet-power / dòng |SD35|35|28|313|25|4Z32G… / hạng 30 ← đã có trong all gốc, điểm 249→249
all: ra 3, vào 0

## Lượt cùng tập top 30 nhưng đổi tập all (110)

| lượt | dòng ra khỏi all | dòng vào all |
|---|---|---|
| IB2200020589#0 | 2 | 0 |
| IB2200030282#0 | 1 | 0 |
| IB2200032133#0 | 6 | 0 |
| IB2200065274#0 | 5 | 0 |
| IB2200065469#0 | 3 | 0 |
| IB2200070865#0 | 8 | 0 |
| IB2200082109#0 | 2 | 0 |
| IB2200087789#0 | 3 | 0 |
| IB2200087789#1 | 2 | 0 |
| IB2200093803#0 | 2 | 0 |
| IB2200093814#0 | 2 | 0 |
| IB2200098082#0 | 2 | 0 |
| IB2200100977#0 | 1 | 0 |
| IB2200101576#0 | 5 | 0 |
| IB2200106999#0 | 3 | 0 |
| IB2300002060#0 | 2 | 0 |
| IB2300013484#0 | 2 | 0 |
| IB2300031541#0 | 1 | 0 |
| IB2300042675#0 | 1 | 0 |
| IB2300083611#0 | 1 | 0 |
| IB2300119452#0 | 1 | 0 |
| IB2300131371#0 | 3 | 0 |
| IB2300134577#0 | 1 | 0 |
| IB2300134577#1 | 4 | 0 |
| IB2300134577#2 | 1 | 0 |
| IB2300158982#0 | 6 | 0 |
| IB2300162912#0 | 1 | 0 |
| IB2300163844#1 | 3 | 0 |
| IB2300190927#0 | 3 | 0 |
| IB2300192935#0 | 1 | 0 |
| IB2300193337#0 | 1 | 0 |
| IB2300215868#0 | 3 | 0 |
| IB2300217672#0 | 2 | 0 |
| IB2300231276#0 | 1 | 0 |
| IB2300233670#0 | 1 | 0 |
| IB2300238745#0 | 2 | 0 |
| IB2300239791#0 | 4 | 0 |
| IB2300252125#0 | 1 | 0 |
| IB2300260615#1 | 1 | 0 |
| IB2300268389#0 | 4 | 0 |
| IB2300273061#0 | 3 | 0 |
| IB2300273061#2 | 2 | 0 |
| IB2300274793#0 | 2 | 0 |
| IB2300275764#0 | 2 | 0 |
| IB2300278731#0 | 3 | 0 |
| IB2300308988#0 | 4 | 0 |
| IB2300315082#0 | 5 | 0 |
| IB2300324220#0 | 2 | 0 |
| IB2300340070#0 | 1 | 0 |
| IB2300340114#0 | 1 | 0 |
| IB2300347693#0 | 3 | 0 |
| IB2300356137#0 | 1 | 0 |
| IB2300356147#0 | 1 | 0 |
| IB2300364488#0 | 6 | 0 |
| IB2300364915#0 | 6 | 0 |
| IB2400062394#0 | 1 | 0 |
| IB2400062394#1 | 4 | 0 |
| IB2400085846#0 | 3 | 0 |
| IB2400100405#0 | 1 | 0 |
| IB2400122312#0 | 2 | 0 |
| IB2400122841#0 | 2 | 0 |
| IB2400131610#0 | 3 | 0 |
| IB2400141856#0 | 11 | 0 |
| IB2400236068#0 | 6 | 0 |
| IB2400237184#0 | 1 | 0 |
| IB2400237184#1 | 4 | 0 |
| IB2400258597#0 | 8 | 0 |
| IB2400270154#0 | 1 | 0 |
| IB2400298819#0 | 1 | 0 |
| IB2400299108#0 | 3 | 0 |
| IB2400299108#2 | 4 | 0 |
| IB2400303471#0 | 1 | 0 |
| IB2400333932#0 | 1 | 0 |
| IB2400355810#0 | 1 | 0 |
| IB2400375383#1 | 1 | 0 |
| IB2400390611#0 | 7 | 0 |
| IB2400425513#0 | 2 | 0 |
| IB2400439995#0 | 1 | 0 |
| IB2400440222#0 | 2 | 0 |
| IB2400448320#1 | 1 | 0 |
| IB2400545050#0 | 5 | 0 |
| IB2400546306#0 | 1 | 0 |
| IB2400560854#0 | 3 | 0 |
| IB2400562787#0 | 3 | 0 |
| IB2400607862#0 | 2 | 0 |
| IB2500031588#1 | 1 | 0 |
| IB2500089757#0 | 1 | 0 |
| IB2500102600#0 | 2 | 0 |
| IB2500268545#0 | 1 | 0 |
| IB2500287209#1 | 1 | 0 |
| IB2500314401#0 | 1 | 0 |
| IB2500327119#1 | 3 | 0 |
| IB2500337345#0 | 2 | 0 |
| IB2500344346#0 | 1 | 0 |
| IB2500364714#0 | 8 | 0 |
| IB2500372309#0 | 3 | 0 |
| IB2500394492#0 | 3 | 0 |
| IB2500410768#0 | 3 | 0 |
| IB2500464050#0 | 4 | 0 |
| IB2500533266#1 | 1 | 0 |
| IB2500569560#0 | 1 | 0 |
| IB2600128010#0 | 2 | 0 |
| IB2600184587#0 | 1 | 0 |
| IB2600217137#0 | 1 | 0 |
| IB2600252436#0 | 2 | 0 |
| IB2600253287#0 | 1 | 0 |
| IB2600308125#0 | 1 | 0 |
| IB2600334541#0 | 2 | 0 |
| IB2600347583#0 | 1 | 0 |
| IB2600490077#0 | 4 | 0 |
