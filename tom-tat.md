# ĐO LƯỢT 9: top 30 "Gợi ý cấu hình" cho #1239 (longkai-maxpower) và #1240 (mecca-freq-532)

Không chép chữ HSMT: tệp kết quả chỉ có số thông báo, khoá dòng NCC và điểm. bidhist tải 2026-11-25T01:02:38Z (1556 doc, 928 gói, 1057 lượt, 436 NCC), dùng CHUNG một bản cho hai nhánh, cùng thư mục `suppliers/cn` của từng nhánh.

## Nhánh đo
- Nền `nen-luot-9` = origin/main (6da9a53b) + merge origin/doc-hz-gtl (#1232, chưa merge) → commit 04315085.
- Tích hợp `tich-hop-luot-9` = nền + merge longkai-maxpower (#1239) + merge mecca-freq-532 (#1240) → commit 568a70f7.
- Xung đột duy nhất: `suppliers/CLAUDE.md` khi merge mecca: hai bên cùng thêm hai dòng giống hệt (engine-key-junk, doc-hz-gtl) ở cùng chỗ, giữ MỘT bản. `web/catalog.js` tự gộp, không xung đột.
- Test trên nhánh tích hợp: `node --test suppliers/*.test.mjs` 1917 test, 1915 đạt, 0 lỗi (2 bỏ qua); `node --test web/test/*.test.mjs` 171/171 đạt.
- Lần chạy nền đầu bị `timeout 3000` của chính phiên này cắt lúc ~lượt 700; chạy lại đầy đủ (4070 s). Hai lần cùng bidhist, cùng code.

## Kết quả tổng
- 1057 lượt, 0 lượt lỗi cả hai bên. **1052 lượt top 30 và điểm GIỐNG HỆT.** Chỉ 5 lượt đổi: IB2300015591#0, IB2300302196#0 (hai gói này ra cùng danh sách), IB2300153051#0, IB2400104884#0, IB2400470041#0.
- 73 dòng đổi (bảng đầy đủ bên dưới, không lấy mẫu): 5 dòng bị loại khỏi danh sách đầy đủ, 61 dịch hạng cùng điểm, 6 dòng vào top 30, 1 dòng ra top 30. **Không dòng nào đổi điểm; không dòng mới xuất hiện trong danh sách đầy đủ.**
- Số lượng hàng mecca trong top 30 (cộng mọi gói): 217 → 216; longkai 1790 → 1790.

## #1239 longkai-maxpower: AN TOÀN MERGE
Dòng bị loại (chỉ 2 bản ghi, 4 lần xuất hiện), đối chiếu thẳng với bản ghi nguồn (`fromSupplier`, nền so tích hợp):
| Bản ghi | nền | tích hợp | top 30 bị ảnh hưởng |
|---|---|---|---|
| longkai-power n1101 bảng #215, LG460C, KTA19-G8 | standby 575 kW (nay engPower=575) | không có standby; còn prime 650 kVA, rated 715 kVA | IB2300015591#0, IB2300302196#0, IB2400104884#0 (nền hạng 16 / 16 / 12, điểm 573; gói cần 500 kW) |
| longkai-power n1159 bảng #313, LG1800WP, 20M33D2210E310 | standby 1989 kW (nay engPower=1989) | không có standby; còn prime 2250 kVA, rated 2475 kVA | IB2400470041#0 (nền hạng 5, điểm 270; gói cần 1800 kW) |
575 kW / 1989 kW là công suất động cơ kèm quạt ("Max power(with fan)"), lớn hơn standby thật của tổ máy; ở nền chúng khiến hai dòng khớp cỡ 500 kW / 1800 kW sai. Mất khớp này là đúng ý PR. Mọi dòng longkai khác còn trong top 30 giữ nguyên điểm. Các dòng longkai VÀO top 30 (KTA38G2/LK634B ở hạng 30 của IB2300015591 và IB2300302196, QSK19G6 hạng 24 của IB2400104884, 12M55G2250/6 hạng 22 của IB2400470041) đều đã có điểm đó ở nền (558 / 558 / 558 / 246) và chỉ vào vì trần 4 dòng mỗi NCC (`PER_SUPPLIER`) mở chỗ khi dòng bị loại rời đi.
Lưu ý (ngoài phạm vi PR): bản ghi n1101 #215 và n1159 #313 còn "prime 650 kVA / rated 715 kVA" (nhiều khả năng là cột đầu phát xen kẽ, tờ ghi hai cột xen nhau), không do #1239 gây ra.

## #1240 mecca-freq-532: AN TOÀN MERGE
Chỉ MỘT bản ghi mecca đổi trong top 30: **mecca-power n5001 bảng #54, MC138D (DP054CA; prime 125 kVA / 100 kW, standby 138 kVA / 110 kW)**, gói IB2300153051#0 (HSMT yêu cầu 50 Hz), nền hạng 13 điểm 457 → bị loại.
- Đối chiếu `suppliers/mecca-freq-532.json`: mục `{n:5001, genset:MC138D, power:[125,100,138,110], freq:60, tables:[54]}`; nguồn ghi tần số: n5001 bảng #53, tiêu đề "Catalog mecca-power-catalog-2026 — trang 13 phải (60Hz)" (bản ghi cùng mã, cùng công suất, tần số RÕ trong tên bảng). Bản ghi bảng #54 ("trang 14 trái") không ghi tần số, được gắn 60 Hz theo luật cùng mã + cùng công suất của PR. Gói đòi 50 Hz, bản ghi nay 60 Hz → rời gói 50 Hz: ĐÚNG.
- Dòng đầy đủ đổi theo: agg-fuzhou DP054CA/H138E5 vào top (hạng 15, điểm 407, không đổi) vì trần động cơ DP054CA (3 dòng) mở chỗ; taihai-taizhou, haifeng-taizhou dịch hạng.
- Kiểm thêm: có 6 hàng mecca trong top 30 (4 gói) thuộc 96 bản ghi được gắn freq: tất cả mới có freq 50 (nền null hoặc 50) trong gói HSMT 50 Hz hoặc không nêu Hz, điểm và hạng không đổi (MC330D, MC165D, MC186D, MC2750C, MC2500P×2). Không bản ghi mecca nào được gắn 50 Hz vào gói 50 Hz mà đổi kết quả.
- Các bản ghi mecca còn lại được gắn freq (95 bản ghi) không có mặt trong top 30 của gói nào đổi.

## Dòng không quy được trực tiếp (liệt kê đủ)
Hai dòng ở IB2400470041#0, hệ quả bậc hai của luật chọn top (trần NCC / động cơ / luật B models), không có bản ghi nguồn nào đổi:
1. **comappower · S16RPTAA2 · COM2475SL**: nền hạng 28, điểm 229 → ra khỏi top 30 (vẫn trong danh sách đầy đủ, hạng điểm 71 ở tích hợp).
2. **byc-power · YCC80TA3000G30 · BYYC2500**: không có trong top nền → vào hạng 30, điểm 213 (điểm không đổi).
Hai dòng này không thuộc longkai hay mecca, bản ghi và điểm của chúng không đổi. Nghi do dòng longkai 12M55G2250/6 (điểm 246) vào top ở hạng 22 làm đổi thứ tự chọn của luật B / trần theo hãng. Chưa kiểm chứng cơ chế đến cùng; không phải lỗi dữ liệu của hai PR.

## Kết luận
- #1239: **an toàn merge.** Mọi thay đổi top 30 quy được về việc hai dòng longkai mất "standby" giả (công suất động cơ).
- #1240: **an toàn merge.** Mọi thay đổi top 30 của mecca quy được về MC138D 60 Hz rời gói 50 Hz, khớp mục trong mecca-freq-532.json và tên bảng nguồn.
- Cả hai phụ thuộc #1232 (doc-hz-gtl, chưa merge): đo này lấy #1232 làm nền; merge #1232 trước.

## Bảng đầy đủ 73 dòng đổi (nền → tích hợp)
Kết quả thô nén gzip: `nen.json.gz`, `th.json.gz` (giải nén ra ~129 MB mỗi tệp, vượt giới hạn 100 MB của GitHub). Khoá đầy đủ ở `thay-doi.json`. Hạng/điểm là top 30 của lượt.

### IB2300015591#0 (16 dòng đổi)

| NCC · khoá động cơ · mã máy | hạng nền → tích hợp | điểm nền → tích hợp | loại | nguyên nhân |
|---|---|---|---|---|
| longkai-power · KTA19G8 · POWERYOURFUTURE | 16 → – | 573 → – | BỊ LOẠI khỏi danh sách | mất standby: 'Max power(with fan)' thành engPower (#1239) |
| longkai-power · KT38G · POWERYOURFUTURE | 17 → 16 | 570 → 570 | dịch hạng | một dòng phía trên rời top30 |
| bobig-power · 2806AE18TAG2 · BP688 | 18 → 17 | 569 → 569 | dịch hạng | một dòng phía trên rời top30 |
| dingbo · KTA19G8 · XG500GF | 19 → 18 | 569 → 569 | dịch hạng | một dòng phía trên rời top30 |
| bobig-power · KTAA19G5 · BC6875S | 20 → 19 | 569 → 569 | dịch hạng | một dòng phía trên rời top30 |
| sinogen · QSK19G4 · CDLO520PSOA | 21 → 20 | 568 → 568 | dịch hạng | một dòng phía trên rời top30 |
| gb-power · 400623TAG2A · MODEL | 22 → 21 | 566 → 566 | dịch hạng | một dòng phía trên rời top30 |
| jet-power · 400623TAG2A · P800 | 23 → 22 | 565 → 565 | dịch hạng | một dòng phía trên rời top30 |
| camda-generator · KT38GA · KDGC640S | 24 → 23 | 562 → 562 | dịch hạng | một dòng phía trên rời top30 |
| sinogen · KT38GA · CDLO580PSOA | 25 → 24 | 562 → 562 | dịch hạng | một dòng phía trên rời top30 |
| jet-power · 400623TAG3A · P825 | 26 → 25 | 561 → 561 | dịch hạng | một dòng phía trên rời top30 |
| longkai-power · QSK19G12 · POWERYOURFUTURE | 27 → 26 | 561 → 561 | dịch hạng | một dòng phía trên rời top30 |
| uleengen · 400623TAG2A · UP750GF | 28 → 27 | 561 → 561 | dịch hạng | một dòng phía trên rời top30 |
| uleengen · KTA38G2 · UC750GF | 29 → 28 | 561 → 561 | dịch hạng | một dòng phía trên rời top30 |
| sinogen · KTA38G2 · CDLO600PSOA | 30 → 29 | 558 → 558 | dịch hạng | một dòng phía trên rời top30 |
| longkai-power · KTA38G2 · POWERYOURFUTURE | – → 30 | – → 558 | VÀO top30 | chỗ trống: trần NCC (4) / động cơ (3) mở khi dòng bị loại rời đi; điểm không đổi |

### IB2300153051#0 (4 dòng đổi)

| NCC · khoá động cơ · mã máy | hạng nền → tích hợp | điểm nền → tích hợp | loại | nguyên nhân |
|---|---|---|---|---|
| mecca-power · DP054CA · MC138D | 13 → – | 457 → – | BỊ LOẠI khỏi danh sách | gắn freq 60 Hz > HSMT 50 Hz (#1240) |
| taihai-taizhou · P086TI1 · TH100GF | 14 → 13 | 431 → 431 | dịch hạng | một dòng phía trên rời top30 |
| haifeng-taizhou · P086TI1 · HF100GF | 15 → 14 | 431 → 431 | dịch hạng | một dòng phía trên rời top30 |
| agg-fuzhou · DP054CA · H138E5 | – → 15 | – → 407 | VÀO top30 | chỗ trống: trần NCC (4) / động cơ (3) mở khi dòng bị loại rời đi; điểm không đổi |

### IB2300302196#0 (16 dòng đổi)

| NCC · khoá động cơ · mã máy | hạng nền → tích hợp | điểm nền → tích hợp | loại | nguyên nhân |
|---|---|---|---|---|
| longkai-power · KTA19G8 · POWERYOURFUTURE | 16 → – | 573 → – | BỊ LOẠI khỏi danh sách | mất standby: 'Max power(with fan)' thành engPower (#1239) |
| longkai-power · KT38G · POWERYOURFUTURE | 17 → 16 | 570 → 570 | dịch hạng | một dòng phía trên rời top30 |
| bobig-power · 2806AE18TAG2 · BP688 | 18 → 17 | 569 → 569 | dịch hạng | một dòng phía trên rời top30 |
| dingbo · KTA19G8 · XG500GF | 19 → 18 | 569 → 569 | dịch hạng | một dòng phía trên rời top30 |
| bobig-power · KTAA19G5 · BC6875S | 20 → 19 | 569 → 569 | dịch hạng | một dòng phía trên rời top30 |
| sinogen · QSK19G4 · CDLO520PSOA | 21 → 20 | 568 → 568 | dịch hạng | một dòng phía trên rời top30 |
| gb-power · 400623TAG2A · MODEL | 22 → 21 | 566 → 566 | dịch hạng | một dòng phía trên rời top30 |
| jet-power · 400623TAG2A · P800 | 23 → 22 | 565 → 565 | dịch hạng | một dòng phía trên rời top30 |
| camda-generator · KT38GA · KDGC640S | 24 → 23 | 562 → 562 | dịch hạng | một dòng phía trên rời top30 |
| sinogen · KT38GA · CDLO580PSOA | 25 → 24 | 562 → 562 | dịch hạng | một dòng phía trên rời top30 |
| jet-power · 400623TAG3A · P825 | 26 → 25 | 561 → 561 | dịch hạng | một dòng phía trên rời top30 |
| longkai-power · QSK19G12 · POWERYOURFUTURE | 27 → 26 | 561 → 561 | dịch hạng | một dòng phía trên rời top30 |
| uleengen · 400623TAG2A · UP750GF | 28 → 27 | 561 → 561 | dịch hạng | một dòng phía trên rời top30 |
| uleengen · KTA38G2 · UC750GF | 29 → 28 | 561 → 561 | dịch hạng | một dòng phía trên rời top30 |
| sinogen · KTA38G2 · CDLO600PSOA | 30 → 29 | 558 → 558 | dịch hạng | một dòng phía trên rời top30 |
| longkai-power · KTA38G2 · POWERYOURFUTURE | – → 30 | – → 558 | VÀO top30 | chỗ trống: trần NCC (4) / động cơ (3) mở khi dòng bị loại rời đi; điểm không đổi |

### IB2400104884#0 (14 dòng đổi)

| NCC · khoá động cơ · mã máy | hạng nền → tích hợp | điểm nền → tích hợp | loại | nguyên nhân |
|---|---|---|---|---|
| longkai-power · KTA19G8 · POWERYOURFUTURE | 12 → – | 573 → – | BỊ LOẠI khỏi danh sách | mất standby: 'Max power(with fan)' thành engPower (#1239) |
| longkai-power · KT38G · POWERYOURFUTURE | 13 → 12 | 570 → 570 | dịch hạng | một dòng phía trên rời top30 |
| dingbo · KTA19G8 · XG500GF | 14 → 13 | 569 → 569 | dịch hạng | một dòng phía trên rời top30 |
| bobig-power · KTAA19G5 · BC6875S | 15 → 14 | 569 → 569 | dịch hạng | một dòng phía trên rời top30 |
| sinogen · QSK19G4 · CDLO520PSOA | 16 → 15 | 568 → 568 | dịch hạng | một dòng phía trên rời top30 |
| sanq-power · KT38G · SQC700 | 17 → 16 | 563 → 563 | dịch hạng | một dòng phía trên rời top30 |
| camda-generator · KT38GA · KDGC640S | 18 → 17 | 562 → 562 | dịch hạng | một dòng phía trên rời top30 |
| sinogen · KT38GA · CDLO580PSOA | 19 → 18 | 562 → 562 | dịch hạng | một dòng phía trên rời top30 |
| longkai-power · QSK19G12 · POWERYOURFUTURE | 20 → 19 | 561 → 561 | dịch hạng | một dòng phía trên rời top30 |
| uleengen · KTA38G2 · UC750GF | 21 → 20 | 561 → 561 | dịch hạng | một dòng phía trên rời top30 |
| sinogen · KTA38G2 · CDLO600PSOA | 22 → 21 | 558 → 558 | dịch hạng | một dòng phía trên rời top30 |
| longkai-power · KTA38G2 · POWERYOURFUTURE | 23 → 22 | 558 → 558 | dịch hạng | một dòng phía trên rời top30 |
| sinogen · QSK19G20 · CDLO600PSOA | 24 → 23 | 558 → 558 | dịch hạng | một dòng phía trên rời top30 |
| longkai-power · QSK19G6 · POWERYOURFUTURE | – → 24 | – → 558 | VÀO top30 | chỗ trống: trần NCC (4) / động cơ (3) mở khi dòng bị loại rời đi; điểm không đổi |

### IB2400470041#0 (23 dòng đổi)

| NCC · khoá động cơ · mã máy | hạng nền → tích hợp | điểm nền → tích hợp | loại | nguyên nhân |
|---|---|---|---|---|
| longkai-power · 20M33D2210E310 · POWERYOURFUTURE | 5 → – | 270 → – | BỊ LOẠI khỏi danh sách | mất standby: 'Max power(with fan)' thành engPower (#1239) |
| fdk-energy · YC16VC3300D31 · Y2750H1CONTACT | 6 → 5 | 270 → 270 | dịch hạng | một dòng phía trên rời top30 |
| dingbo · 401661TRG3 · XG1800GF | 7 → 6 | 269 → 269 | dịch hạng | một dòng phía trên rời top30 |
| dingbo · YC16VC3000D31 · XG1800GF | 8 → 7 | 269 → 269 | dịch hạng | một dòng phía trên rời top30 |
| acepow-fuan · 12M55D2210E310 · APW1800 | 9 → 8 | 269 → 269 | dịch hạng | một dòng phía trên rời top30 |
| jet-power · 12M55D2210E310 · WP2500 | 10 → 9 | 269 → 269 | dịch hạng | một dòng phía trên rời top30 |
| jet-power · S16R2PTAWC · M2500 | 11 → 10 | 269 → 269 | dịch hạng | một dòng phía trên rời top30 |
| stone-power · S16R2PTAW · SM2250E5 | 12 → 11 | 269 → 269 | dịch hạng | một dòng phía trên rời top30 |
| fdk-energy · 12KTA58G31 · SC2500H1CONTACT | 13 → 12 | 265 → 265 | dịch hạng | một dòng phía trên rời top30 |
| dingbo · 16V4000G63 · XG1900GF | 14 → 13 | 263 → 263 | dịch hạng | một dòng phía trên rời top30 |
| bobig-power · 20M33D2210E310 · BWC2475 | 15 → 14 | 261 → 261 | dịch hạng | một dòng phía trên rời top30 |
| longkai-power · 12M55G2750/5 · LG2000WP | 16 → 15 | 259 → 259 | dịch hạng | một dòng phía trên rời top30 |
| dingbo · YC16VC3300D31 · XG2000GF | 17 → 16 | 258 → 258 | dịch hạng | một dòng phía trên rời top30 |
| bobig-power · 12M55D2450E310 · BWC2750 | 18 → 17 | 258 → 258 | dịch hạng | một dòng phía trên rời top30 |
| jet-power · 12M55D2450E310 · WP2750 | 19 → 18 | 258 → 258 | dịch hạng | một dòng phía trên rời top30 |
| sanq-power · QSK60G7 · SQIC25006 | 20 → 19 | 256 → 256 | dịch hạng | một dòng phía trên rời top30 |
| jet-power · 12KTA58G31 · SD2500 | 21 → 20 | 253 → 253 | dịch hạng | một dòng phía trên rời top30 |
| longkai-power · 20M33G2200/6 · LG1800WP | 22 → 21 | 246 → 246 | dịch hạng | một dòng phía trên rời top30 |
| comappower · S16RPTAA2 · COM2475SL | 28 → – | 229 → – | RA top30 (vẫn trong danh sách đầy đủ) | KHÔNG QUY ĐƯỢC trực tiếp (xem mục 'Không quy được') |
| jinjia-power · YC12VC2700D31 · JJY1800GF | 29 → 28 | 229 → 229 | dịch hạng | một dòng phía trên rời top30 |
| wintpower · H16V190ZL · WTJ2750E | 30 → 29 | 226 → 226 | dịch hạng | một dòng phía trên rời top30 |
| longkai-power · 12M55G2250/6 · LG1800WP | – → 22 | – → 246 | VÀO top30 | chỗ trống: trần NCC (4) / động cơ (3) mở khi dòng bị loại rời đi; điểm không đổi |
| byc-power · YCC80TA3000G30 · BYYC2500 | – → 30 | – → 213 | VÀO top30 | chỗ cuối top30 sau khi comappower rời; KHÔNG QUY ĐƯỢC trực tiếp |
