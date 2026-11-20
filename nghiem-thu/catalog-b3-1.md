# catalog-b3 — nghiệm thu 1 (20/11/2026)

PR draft: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/954 (nhánh `catalog-b3`, từ abb28c67; SHA đẩy: `dbe247af`). Worktree `wt-catalog-b3` (còn giữ tới khi quyết xong).
Tệp đổi: `web/catalog.js`, `suppliers/catalog-b3.test.mjs` (mới). Chưa có bẫy mới ghi vào `web/CLAUDE.md` (chờ quyết điểm 1 bên dưới).

## ĐANG CHỜ QUYẾT (chặn merge)
Sửa việc 1 làm `quality --check` đỏ (CI chặn PR sửa catalog.js) và 2 test đỏ. Nguyên nhân KHÔNG nằm ở luật cột mà ở dữ liệu nguồn zhengchi:
cột "缸数 | 排量(L)" của zhengchi trước đây gắn vào bản ghi động cơ giả "ZCDL-…" (vô hại); nay gắn vào động cơ thật nên thành phiếu cho động cơ đó.
Đối chiếu với NCC khác (cùng model, 1 % dung sai; `agree.mjs` trong `genbid-test\b3`):
- xi lanh: 316 model khớp, 57 lệch, 111 không NCC khác ghi; dung tích: 157 khớp, **164 lệch**, 118 không NCC khác ghi.
- ví dụ lệch: WP2.3D25E200 zhengchi "6 xi lanh, 8.2 L" (NCC khác: 4 × 12, 2.3 L); TAD1351GE "14.6 L" (số đông 12.78); 6M33D670E200 "12 xi lanh, 18.2 L" (số đông 6, 19.6 L); QSB3.9-G3 "6, 8.2" (số đông 4). Nguồn tự lệch cả với chính nó (YC16VC4000 ghi 20 xi lanh 95.42 L).
- đo: `quality --check` cyl 25 → 39, disp 199 → 213 (mốc 25 + 5 / 199 + 5); test đỏ `cand-disp-c` (TAD1351GE: thêm phiếu 14.6 × 1) và `cand-disp-round` (6DTAA89G34: thêm 14.6 × 1); cờ `cylMaj` +90 dòng zhengchi (chỉ hiện cờ, không loại) và −5 / +1 dòng NCC khác (bdadl 2, haifeng, liangzi, yanan mất; longkai +1) vì phiếu xi lanh của zhengchi pha loãng số đông QSB3.9-G3, KTA50-G15A, WP4.6ND138E310.
Các cách xử lý (em nghiêng về B, nhưng cần Khoa / điều phối quyết vì đụng "không bỏ dữ liệu nguồn"):
- A. Giữ nguyên dữ liệu đọc, `--write-baseline` + sửa hai test theo số phiếu mới (14.6 × 1), ghi lý do. Dữ liệu sai nhập vào số đông; một NCC một phiếu nên thường bị thắng, nhưng bảng điểm nhiều model đổi.
- B. Chỉ bỏ `cyl` và `disp` của bảng zhengchi 整机编号 (cột "缸数 / 排量" không đáng tin: dung tích lệch 51 %). Là luật theo NCC, không theo danh sách mã: cần Khoa duyệt trong code (vd. danh sách NCC "cột thông số động cơ không tin" cạnh `MARK_KEEP`).
- C. Không sửa việc 1 (giữ động cơ giả ZCDL): em không khuyên, bản ghi động cơ "ZCDL-…" sai model.
Em chưa làm B / A vì brief chỉ nêu "sửa đúng nguyên nhân"; nhắn lại hướng thì em làm trong cùng PR.

## Việc 1: zhengchi-power
Nguồn: `suppliers/cn/zhengchi-power.json`, bảng n102–n150 (610 dòng máy). Tiêu đề: `| 功率 | 备用功率 | 品牌 | 整机编号 | 柴油机型号 | 频率 | …` (n101 khác: `| | 机组型号 | … | 柴油机型号`, đã đọc đúng, không đổi).
Nguyên nhân (luật cột, không phải danh sách mã): `gi = codes[0] === 0 || 1 ? codes[0] : -1` — model tổ máy chỉ nhận ở cột 0 / 1; ở n102+ nó ở cột 3 nên `gi = -1`, mã đầu tiên (ZCDL-…) lấy làm động cơ và mã thật ở cột "柴油机型号" bị bỏ. Sửa:
1. `gensetCol(n)`: đúng một ô tiêu đề (dòng tiêu đề đúng số ô của dòng) khớp `^(整机|机组|发电机组|成套机组)(型号|编号|代号)$` hoặc "genset / generator set model"; `gi` nhận mã đầu tiên ở cột > 1 chỉ khi nó đứng đúng cột đó.
2. `titledPowers`: nhánh `subline` ("dòng tiêu đề phụ bắt đầu bằng công suất, ngay sau model") chỉ khi `gi ≤ 1`; công suất của zhengchi nằm TRƯỚC cột model nên đọc từ tiêu đề ở vị trí cột.
Kết quả: ZCDL-… là `genset`, động cơ là 柴油机型号 (YC12VC2270L-D20…), công suất `rated 1380 / standby 1500` như cũ (nhãn "功率" không ghi prime: luật cũ, không đổi).
Dòng không có mã động cơ đọc được → KHÔNG tạo bản ghi động cơ (không lấy mã tổ máy thay): 11 dòng, đều do ô động cơ viết dấu gạch ngang toàn chiều rộng "YC12VTD2000－D30" (U+FF0D) không qua `isCode` (n112 dòng 7, n113 dòng 3, n114 dòng 4…). Chưa sửa U+FF0D (ngoài phạm vi, sẽ thêm bản ghi: đề xuất `keyOf` / `isCode` coi "－" là "-").

### Kiểm chéo toàn bộ (`spec-diff.mjs git:abb28c67 .`, đầu ra thật; tệp `genbid-test\b3\out\full1.txt`, `tom1.md`)
```
bản ghi cũ 60073, mới 60062 | khác 514 | chỉ cũ 11, chỉ mới 0 | bảng có đổi 59
{"model":514,"genset":514,"voltage thêm":2,"fuel thêm":2,"cyl thêm":2,"disp thêm":2,"weight thêm":2}
đảo vai: 0 → 0 | tự kiểm: cần soát tay 4
Chưa đọc được (unread-tables) mọi chỉ số: cũ = mới
```
Phân loại MỌI bản ghi đổi / mất / thêm (đếm theo NCC): chỉ `zhengchi-power`, 525 dòng = 514 đổi + 11 mất + 0 thêm; NCC khác 0.
- 514 đổi: chỉ hai trường `model` (mã tổ máy → mã động cơ thật) và `genset` (trống → mã tổ máy); công suất, hãng, tần số, `other`, các thông số khác y như cũ. Đảo vai = 0 → 0.
- 11 mất: nhóm "ô động cơ dấu － toàn chiều rộng" ở trên, đúng thiết kế (thà thiếu).
- 4 thông số "cần soát tay" (n132 bảng 31, dòng 1 ZCDL-C280 và dòng 2 ZCDL-M275): thêm cyl / disp / fuel / voltage / weight cho 2 dòng mà bản ghi cũ không có thông số: 6 xi lanh, "排量 108" / "105" L, 200 g/kW.h, 230/400 V, 3200 / 2620 kg. Là chữ nguyên văn của dòng; dung tích 108 L vô lý (nguồn gõ nhầm 10.8) và `row-flags` đã gắn `absurd` cho cùng số ở aoke-yangzhou (xem dưới).
`row-flags.mjs --json` trước → sau: 158 → 244 dòng cờ. Thêm 91: zhengchi 90 (`cylMaj`, chỉ hiện), longkai 1 (`cylMaj`); mất 5 (`cylMaj`: bdadl-shanghai 130 KTA50-G15A, bdadl 128 WP4.6ND138E310, haifeng 2001 / liangzi 123 / yanan 101 QSB3.9-G3). Không có cờ `absurd` / loại mới. Hai dòng aoke-yangzhou (`absurd` disp 108 / 105) vốn có ở cả hai bên.

### Test
`node --test web/test/*.test.mjs suppliers/*.test.mjs`: 1345 ca, 1343 đạt, 2 đỏ (hai ca cand-disp nêu trên, kỳ vọng pin theo số phiếu thật). `suppliers/catalog-b3.test.mjs` 3 ca đạt (dòng thật n110: model / genset / công suất; dòng ô động cơ "－"; n101 không đổi). `quality --check`: XẤU ĐI (cyl, disp nêu trên). main (abb28c67) sạch cả hai.

### 3 mẫu đối chiếu nguồn
Nguồn: bản lưu trong `suppliers/cn/zhengchi-power.json` (trang chính hãng 正驰动力, bảng "1500KW柴油发电机组", "2500KW", "900KW柴油发电机组"; chưa đối chiếu lại trang sống).
1. n110 dòng 1 "| 1380KW | 1500KW | 玉柴 | ZCDL-Y1500 | YC12VC2270L-D20 | …": genset ZCDL-Y1500, động cơ YC12VC2270L-D20, 1380 / 1500 kW.
2. n102 dòng 1 "| 2600KW | 3000KW | 潍柴博杜安 | ZCDL-B3000 | 16M55D3300E310 | …": động cơ 16M55D3300E310.
3. n119 dòng 0 "| 720KW | 800KW | 博杜安 | ZCDL-B800 | 12M26D902E200 | …": động cơ 12M26D902E200.

## Việc 2: "1600/1750" dưới "输出功率 (KW/KVA)" — KHÔNG sửa, bằng chứng
Mở bản lưu của bdadl-shanghai (n104, n105, … n129, n127/128), fukangsi-yangzhou (n2009 …), pengpai-yangzhou (n103, n131) (`pairs.mjs` quét MỌI dòng đọc ra công suất rỗng có một ô "a/b"):
- Cặp "1600/1750" không phải kW/kVA chuẩn: 1600 / 1750 = 0,914. Mọi dòng ở nhóm "mã LZ / M" (Mitsubishi 菱重, MTU 奔驰) đều ~0,89–0,94 (bdadl n101–n119: 28 dòng, mọi q ≥ 0,889; fukangsi "(KW)": 29 dòng, mọi q ≥ 0,86; pengpai "(KW/KVA)": 29 dòng, mọi q ≥ 0,86), 1,1 × là kiểu prime / standby cùng đơn vị (500/550, 580/640, 900/1000, 1000/1100, 1100/1200, 1200/1300, 1600/1750).
- Trong CÙNG bảng n104 / pengpai n103, các dòng khác dùng cặp đúng kW/kVA (1500/1875, 1600/2000, 1800/2250: 0,8) dưới cùng tiêu đề "(KW/KVA)", nên tiêu đề không nói được dòng nào là loại nào; cặp "20/25" (0,8) vẫn đọc kW/kVA như cũ.
- Cùng dòng LZ1750 nằm ở bảng n129 (菱重系列) của bdadl dưới tiêu đề "输出功率 (主用/备用)" = prime/standby, nhưng KHÔNG đơn vị; bảng "(主用/备用)" của bdadl có 216 dòng (q 0,83–0,94) đều không đơn vị. fukangsi n2009 chỉ ghi "(KW)".
Kết luận: cặp là prime / standby nhiều khả năng cùng đơn vị, nhưng đơn vị (kW hay kVA) không được ghi ở nguồn cho nhóm này, và tiêu đề "(KW/KVA)" mâu thuẫn với chính dữ liệu. Theo luật hiện hành (web/CLAUDE.md: "prime / standby trong đơn vị không ai viết → không đọc") và nguyên tắc "không suy ra": giữ không công suất cho 28 + 29 + 29 + 14 (fukangsi không tiêu đề) + 216 dòng (tổng 316 dòng). Khoa quyết nếu muốn đọc "a/b = prime/standby kW" cho nhóm KW/KVA khi q > 0,86 (là suy ra từ độ lớn, em không làm).

## Top 30
Chưa đo (đúng brief: điều phối đo cloud). Cần đo sau khi quyết điểm chặn (A / B), vì A đưa thêm phiếu cyl / disp của zhengchi vào `majorityOf`.

## Rủi ro / quay lui
Chỉ đổi cách đọc cột tổ máy khi tiêu đề nêu đích danh (`gensetCol`): quay lui = revert commit `dbe247af`. Chỉ ảnh hưởng zhengchi (spec-diff: 0 NCC khác).

## Cần ghi nhớ (cho điều phối)
- zhengchi: cột 缸数 / 排量 không đáng tin (dung tích lệch 51 % so NCC khác) — chờ quyết A / B.
- bẫy mới đề xuất ghi `web/CLAUDE.md` khi PR chốt: model tổ máy ở cột > 1 đọc theo tiêu đề `gensetCol`; `subline` của `titledPowers` chỉ khi `gi ≤ 1`.
- U+FF0D (－) trong mã động cơ zhengchi (11 dòng): đề xuất coi là "-".

---
## CẬP NHẬT 20/11 (Khoa chọn B) — commit 2
Điều phối chuyển quyết định: Khoa chọn B. `TABLE_DROPS` + `tableDrops` (catalog.js): danh sách tường minh, khớp NCC `zhengchi-power` + chữ tiêu đề "整机编号", bỏ `cyl` + `disp`, ghi "Khoa 20/11/2026" + lý do, note "bỏ thông số theo bảng". Bảng n101 (机组型号) KHÔNG bỏ: kiểm riêng, xi lanh 15 / 15 khớp NCC khác; cột "排气量" không đọc ra số disp. Bẫy ghi `web/CLAUDE.md`.
Kiểm lại (đầu ra thật):
- spec-diff abb28c67 ↔ nhánh: `{"model":514,"genset":514,"disp bỏ":512,"cyl bỏ":512,"voltage thêm":2,"fuel thêm":2,"weight thêm":2}`; bản ghi 60073 → 60062 (11 mất, 0 thêm); đảo vai 0 → 0; "cần soát tay 1026" = 512 × 2 số bỏ + 2 fuel thêm (đều dòng n132 bảng 31, nay chỉ voltage / fuel / weight; cyl / disp không còn). Thông số bỏ ở 512 bản ghi động cơ zhengchi, mọi bảng 整机编号 (n102–n160).
- row-flags: 158 → 158 dòng, 0 thêm, 0 mất (5 dòng cylMaj mất + longkai +1 đã về như main).
- `quality --check`: không chỉ số nào xấu đi. Không sửa baseline.
- `node --test web/test/*.test.mjs suppliers/*.test.mjs`: 1346 / 1346 đạt (hai ca cand-disp tự xanh, không sửa).

---
## Top 30 (đo cloud a52179ee ↔ 19dbcb42, phân tích 20/11; chưa sửa code)
Dữ liệu: `dau-vao\catalog-b3\top30-cloud\gop-goc/nhanh.json.gz`. Script em: `genbid-test\b3\chk.cjs` (so MỌI dòng-lượt của `all` theo đa tập khoá@điểm), `bld.mjs` (so `build()` gốc ↔ nhánh theo từng động cơ), `cls.cjs`, `top.cjs`, `dogop1.mjs` (chạy `candidates` hai lượt IB2400073761, IB2600337362 gốc ↔ nhánh).
### Phân loại MỌI dòng-lượt (không phải cặp khoá zhengchi): 3.828 = 3.787 đổi điểm + 40 chỉ gốc + 1 chỉ nhánh; 0 dòng không giải thích được
Mọi dòng đổi điểm đều thuộc một động cơ mà `build()` đổi HÃNG (`e.make`); `candidates` dòng 1503 `if (e.make) score += 60` và 300 "hãng động cơ HSMT nêu" (`makeNamed`).
| lớp | dòng-lượt | điểm | động cơ | nguyên nhân |
|---|--:|---|---|---|
| L2a hãng → chưa rõ, nhóm Ricardo 4105 / 6105 / 6108 | 1.930 (R6105AZLD 691, R4105ZD 476, R6105ZD 421, R6108ZLD 342) | −60 | 4 | zhengchi ghi 潍柴 (Weichai) ở ô 品牌 (mức "dòng bảng", cao nhất) cạnh Ricardo của elitech / ...; hai tên không cùng hãng (`SAME_MAKER` chỉ có Kofo↔Ricardo, Weichai↔Deutz / Baudouin) và Ricardo không còn ≥ 3× → chưa rõ hãng |
| L2b hãng → chưa rõ, nhóm Mitsubishi S12R / S16R | 1.663 (S12RPTA2C 713, S16RPTAC 645, S16RPTA2C 305), trong đó 156 dòng −360 (HSMT nêu hãng Mitsubishi: mất 300 + 60) | −60 / −360 | 3 | zhengchi ghi 上柴 (SDEC) ở ô 品牌 thành phiếu thứ hai cho SDEC (cùng jiangchai-xuzhou): Mitsubishi 5 NCC < 3 × 2 (trước: 5 > 3 × 1) → chưa rõ. Chênh MỘT phiếu |
| L2c chưa rõ → có hãng | 194 (WD150D15 132, WD129D11 62) | +60 | 2 | zhengchi ghi 锡柴 (FAWDE) ở dòng bảng; nguồn khác chỉ ở mức tên trang (Cummins, Wudong): FAWDE thành hãng duy nhất ở mức cao nhất |
| L3 luật tần số | 40 chỉ gốc (+1 chỉ nhánh: cùng lớp đổi hãng) | dòng biến mất | TAD734GE 31, YCA08350D30 4, WP7D264E310 2, TAD733GE 1, KP9D310D2 1, WD129TAD25 1; lượt IB2400073761 (HSMT 60 Hz?) | `ruled: freq` (luật Khoa 17/11 "động cơ mà mọi dòng ghi tần số đều ghi tần số kia, ≥ 2 dòng → loại dòng không ghi tần số"): zhengchi thêm dòng ghi "50Hz" nên động cơ đủ 2 dòng ghi tần số, mọi dòng đều 50 Hz. Xác nhận bằng chạy `candidates` hai bên: 40 / 40 dòng gone đều `freq` ở nhánh, 0 ở gốc |
Số động cơ đổi hãng: 22 (`build()` 827 động cơ có khác biệt; 351 động cơ "ZCDL-…" giả biến mất, số NCC / kW của động cơ thật đổi theo); cả 22 đều có phiếu zhengchi: Ricardo → chưa rõ (4), Mitsubishi → chưa rõ (3), Wudong → FAWDE (4 + 2 + 2), Weichai → Weichai/Deutz / Baudouin / Baudouin (2 + 2 + 2 + 1)...
Phiếu hãng của zhengchi đáng tin: ô 品牌 khớp hãng các NCC khác (mức dòng bảng, `SAME_MAKER` tính cùng hãng) ở **288 / 295** động cơ có cả hai; lệch 7: Weichai ≠ Ricardo (4: R4105ZD, R6105ZD, R6105AZLD, R6108ZLD), SDEC ≠ Mitsubishi (2: S16RPTAA2C, S16R2PTAWC), Cummins ≠ Perkins (1: 1104DE44TAG2).
### Lớp L1 — dòng zhengchi (1.320 dòng gốc ↔ 1.374 dòng nhánh; 436 cặp khoá): ĐÚNG
Mã ZCDL → động cơ thật là chủ ý. Điểm đổi của cặp = `8 × min(số khoá thông số của động cơ, 8)` (dòng 1541) đổi (động cơ thật có thêm khoá của NCC khác, tối đa +64; B bỏ cyl + disp: −16) cộng 60 khi hãng động cơ thật khác (`e.make`).
### Hiệu ứng lan (lượt top đổi = 131: 39 chỉ đổi thứ tự bằng điểm, 92 đổi tập)
Dòng NCC khác rời top mà điểm KHÔNG đổi (50 dòng, ví dụ IB2200021336: longkai QSB59G3 274, sanq 1106A70TG1 271, kaihua 6M11G150/5 261 / 252, rise TD226B6D 261 rời, thay bằng 247 / 245 / 244): do chỗ giữ `CN_ROWS` (12 dòng hãng Trung Quốc) và giới hạn mỗi NCC / động cơ đổi theo các dòng L2 vừa mất 60 điểm (jet-power R6105AZLD 269 → 209), không phải zhengchi chen vào (0 / 50 có dòng zhengchi cùng động cơ trong top nhánh). Đây là hệ quả của L2, không phải lớp riêng.
### Kết luận (1)(2)
- Không lớp nào do dữ liệu zhengchi "làm bẩn" hãng / facts: phiếu hãng khớp 97,6 %; cyl / disp (cột kém) đã bỏ bằng B. Mọi chênh điểm là luật hiện hành (`keptMakes` ngưỡng ≥ 3 NCC và gấp ≥ 3×; luật tần số; 60 / 300 điểm theo `e.make`) áp với một phiếu thật mới. Điểm yếu là ngưỡng: MỘT phiếu (zhengchi) làm Mitsubishi S12R / S16R rơi khỏi "Mitsubishi" dù 5 NCC ghi Mitsubishi.
### Đề xuất / câu hỏi cho Khoa (CHƯA làm, cần nguồn chính hãng, không suy ra)
1. Mitsubishi ↔ SDEC cho S12R-PTA2-C / S16R-PTA-C / S16R-PTAA2-C (nguồn ghi 上柴 hay 上海菱重 / 三菱): có cùng một hãng không? Nếu thêm `["Mitsubishi","SDEC"]` vào `SAME_MAKER` thì trả lại hãng cho 1.663 dòng-lượt (kể cả 156 dòng +360 khi HSMT nêu Mitsubishi); phải có trang chính hãng (sdeciepower.com Khoa đã nhận là nguồn chính hãng) nói SDEC sản xuất / lắp động cơ Mitsubishi theo giấy phép, vì "không suy ra".
2. Weichai ↔ Ricardo cho R4105 / R6105 / R6108 (Kofo↔Ricardo đã có): thêm cặp `["Weichai","Ricardo"]` trả hãng cho 1.930 dòng-lượt; cần trang chính hãng Weichai nói động cơ R-series là Weichai-Ricardo.
3. Giữ nguyên các lớp còn lại (WD → FAWDE: ô 品牌 của zhengchi ghi 锡柴 cho động cơ WD, nguồn khác chỉ mức tên trang; luật tần số: 40 dòng, đúng luật).
Nếu Khoa không muốn đổi `SAME_MAKER`, tác động ròng của PR là: 3.437 dòng-lượt −60 và 156 dòng-lượt −360 (tổng 3.593 mất điểm), 194 dòng-lượt +60, 41 dòng đổi tập, 131 lượt đổi top (92 đổi tập). Em chưa sửa code.


---
## Hãng (20/11, chỉ đọc + tra web công khai; CHƯA sửa code)
Yêu cầu điều phối: (1) bảng đủ 22 động cơ đổi hãng + 7 động cơ zhengchi ghi hãng khác NCC khác; (2) nguồn chính hãng; (3) đếm các phương án. Số liệu: `build()` gốc (abb28c67) ↔ nhánh (9c7846e1), script `genbid-test\b3\h1.mjs`, `d7.mjs`, `sim.mjs`, `tab.mjs`; "dòng-lượt" = số dòng-lượt trong `all` của đo cloud (`top30-cloud`) đổi điểm vì động cơ đó.

### (1a) Bảng ĐỦ 22 động cơ đổi hãng (`e.make`)
"Phiếu" = tên hãng → các NCC bỏ phiếu ở MỨC CAO NHẤT của động cơ đó (`keptMakes`: ≥ 3 NCC và gấp ≥ 3× tên khác thì thắng, không thì "chưa rõ"; mức: dòng bảng > tiêu đề cột / hãng tự SX > tên trang). Cột zhengchi: ô 品牌 nguyên văn của dòng bảng zhengchi (bảng số n, mã tổ máy) và phiếu nó thành. Dòng-lượt: `N×−60` = N dòng-lượt mất 60 điểm; `×60` = được 60; `×−gốc` / `×+nhánh` = chỉ có ở một bên (luật tần số). 0 = động cơ không có dòng nào trong `all` đổi điểm.

| # | động cơ | hãng gốc → nhánh | phiếu gốc (mức cao nhất) | phiếu nhánh | zhengchi 品牌 nguyên văn (bảng n, mã tổ máy) | dòng-lượt đổi |
|--:|---|---|---|---|---|---|
| 1 | WP6D132E200 | Weichai → Weichai/Deutz | [dòng bảng] Weichai 9: bdadl-shanghai, depco-power, elitech-power, fdk-energy, fukangsi-yangzhou, jiangchai-xuzhou, liangzi-yangzhou, pengpai-yangzhou, uleengen | [dòng bảng] Weichai 9: bdadl-shanghai, depco-power, elitech-power, fdk-energy, fukangsi-yangzhou, jiangchai-xuzhou, liangzi-yangzhou, pengpai-yangzhou, uleengen; Deutz 1: zhengchi-power | n143 ZCDL-H110 品牌="道依茨"→Deutz/dòng bảng | 0 |
| 2 | S16R-PTA-C | Mitsubishi → (chưa rõ) | [dòng bảng] Mitsubishi 5: fdk-energy, powerlink-shanghai, voltgent, walter-yangzhou, xingguang-jiangsu; SDEC 1: jiangchai-xuzhou | [dòng bảng] Mitsubishi 5: fdk-energy, powerlink-shanghai, voltgent, walter-yangzhou, xingguang-jiangsu; SDEC 2: jiangchai-xuzhou, zhengchi-power | n110 Z22S1500 品牌="上柴"→SDEC/dòng bảng; n112 ZCDL-S1500 品牌="上柴"→SDEC/dòng bảng; n161 ZCDL-S1450 品牌="1450"→SDEC/tên trang | 603×-60, 42×-360 |
| 3 | S12R-PTA2-C | Mitsubishi → (chưa rõ) | [dòng bảng] Mitsubishi 5: aosif, fdk-energy, voltgent, walter-yangzhou, xingguang-jiangsu; SDEC 1: jiangchai-xuzhou | [dòng bảng] Mitsubishi 5: aosif, fdk-energy, voltgent, walter-yangzhou, xingguang-jiangsu; SDEC 2: jiangchai-xuzhou, zhengchi-power | n115 ZCDL-S1165 品牌="上柴"→SDEC/dòng bảng; n161 ZCDL-S1160 品牌="1160"→SDEC/tên trang | 636×-60, 77×-360 |
| 4 | S16R-PTA2-C | Mitsubishi → (chưa rõ) | [dòng bảng] Mitsubishi 4: fdk-energy, voltgent, walter-yangzhou, xingguang-jiangsu; SDEC 1: jiangchai-xuzhou | [dòng bảng] Mitsubishi 4: fdk-energy, voltgent, walter-yangzhou, xingguang-jiangsu; SDEC 2: jiangchai-xuzhou, zhengchi-power | n109 ZCDL-S1600 品牌="上柴"→SDEC/dòng bảng; n161 ZCDL-S1600 品牌="1600"→SDEC/tên trang | 268×-60, 37×-360 |
| 5 | 12M26D902E200 | Weichai → Weichai/Baudouin | [dòng bảng] Weichai 3: depco-power, elitech-power, kc-generatorset | [dòng bảng] Weichai 3: depco-power, elitech-power, kc-generatorset; Baudouin 1: zhengchi-power | n119 ZCDL-B800 品牌="博杜安"→Baudouin/dòng bảng; n162 ZCDL-W792 品牌="792"→Weichai/tên trang; n162 ZCDL-W880 品牌="880"→Weichai/tên trang | 0 |
| 6 | 6M33D670E200 | Weichai → Weichai/Baudouin | [dòng bảng] Weichai 3: depco-power, elitech-power, fdk-energy | [dòng bảng] Weichai 3: depco-power, elitech-power, fdk-energy; Baudouin 1: zhengchi-power | n123 ZCDL-B600 品牌="博杜安"→Baudouin/dòng bảng | 0 |
| 7 | 16M33D1680E310 | Weichai → Weichai/Baudouin | [dòng bảng] Weichai 2: elitech-power, fdk-energy | [dòng bảng] Weichai 2: elitech-power, fdk-energy; Baudouin 1: zhengchi-power | n110 Z22B1520 品牌="博杜安"→Baudouin/dòng bảng; n162 ZCDL-W1520 品牌="1520"→Weichai/tên trang | 0 |
| 8 | 12M55D2210E310 | Weichai → Baudouin | [tiêu đề cột] Weichai 2: jet-power, yunding-jiangsu | [dòng bảng] Baudouin 1: zhengchi-power | n105 ZCDL-B2000 品牌="博杜安"→Baudouin/dòng bảng; n162 ZCDL-W2000 品牌="2000"→Weichai/tên trang | 0 |
| 9 | R6105AZLD | Ricardo → (chưa rõ) | [dòng bảng] Ricardo 2: elitech-power, kaichen-jiangsu | [dòng bảng] Ricardo 2: elitech-power, kaichen-jiangsu; Weichai 1: zhengchi-power | n142 ZCDL-W110 品牌="潍柴"→Weichai/dòng bảng | 691×-60 |
| 10 | R4105ZD | Ricardo → (chưa rõ) | [dòng bảng] Ricardo 1: kaichen-jiangsu | [dòng bảng] Ricardo 1: kaichen-jiangsu; Weichai 1: zhengchi-power | n152 ZCDL-W51 品牌="潍柴"→Weichai/dòng bảng | 476×-60 |
| 11 | R6105ZD | Ricardo → (chưa rõ) | [dòng bảng] Ricardo 1: kaichen-jiangsu | [dòng bảng] Ricardo 1: kaichen-jiangsu; Weichai 1: zhengchi-power | n147 ZCDL-W76 品牌="潍柴"→Weichai/dòng bảng | 421×-60 |
| 12 | WD269TAD56 | Wudong/Wudong → FAWDE | [tiêu đề cột] Wudong 2: shengfeng-fuan, xingguang-jiangsu | [dòng bảng] FAWDE 1: zhengchi-power | n124 ZCDL-X560 品牌="锡柴"→FAWDE/dòng bảng | 0 |
| 13 | WP4D108E200 | Weichai → Weichai/Deutz | [dòng bảng] Weichai 4: bdadl-shanghai, fukangsi-yangzhou, liangzi-yangzhou, pengpai-yangzhou | [dòng bảng] Weichai 4: bdadl-shanghai, fukangsi-yangzhou, liangzi-yangzhou, pengpai-yangzhou; Deutz 1: zhengchi-power | n146 ZCDL-H90 品牌="道依茨"→Deutz/dòng bảng | 0 |
| 14 | WD287TAD61L | Wudong → FAWDE | [tiêu đề cột] Wudong 2: shengfeng-fuan, xingguang-jiangsu | [dòng bảng] FAWDE 1: zhengchi-power | n123 ZCDL-X610 品牌="锡柴"→FAWDE/dòng bảng | 0 |
| 15 | WD327TAD88 | Wudong/Wudong → FAWDE | [tiêu đề cột] Wudong 1: xingguang-jiangsu | [dòng bảng] FAWDE 1: zhengchi-power | n117 ZCDL-X880 品牌="锡柴"→FAWDE/dòng bảng; n118 ZCDL-X880 品牌="锡柴"→FAWDE/dòng bảng | 0 |
| 16 | WD129TD17 | Wudong → FAWDE | [tiêu đề cột] Wudong 1: shengfeng-fuan | [dòng bảng] FAWDE 1: zhengchi-power | n136 ZCDL-X175 品牌="锡柴"→FAWDE/dòng bảng | 0 |
| 17 | WD327TAD82 | Wudong/Wudong → FAWDE | [tiêu đề cột] Wudong 1: xingguang-jiangsu | [dòng bảng] FAWDE 1: zhengchi-power | n120 ZCDL-X820 品牌="锡柴"→FAWDE/dòng bảng | 0 |
| 18 | WD129D11 | (chưa rõ) → FAWDE | [tên trang] Cummins 1: sanq-power; Wudong 2: taihai-taizhou, wintpower | [dòng bảng] FAWDE 1: zhengchi-power | n142 ZCDL-X110 品牌="锡柴"→FAWDE/dòng bảng | 62×60 |
| 19 | WD129TAD25 | Wudong/Wudong → FAWDE | [tiêu đề cột] Wudong 1: shengfeng-fuan | [dòng bảng] FAWDE 1: zhengchi-power | n133 ZCDL-X260 品牌="锡柴"→FAWDE/dòng bảng | 1×-gốc |
| 20 | WD150D15 | (chưa rõ) → FAWDE | [tên trang] Cummins 1: sanq-power; Wudong 2: taihai-taizhou, wintpower | [dòng bảng] FAWDE 1: zhengchi-power | n139 ZCDL-X140 品牌="锡柴"→FAWDE/dòng bảng | 132×60 |
| 21 | R6108ZLD | Ricardo → (chưa rõ) | [dòng bảng] Ricardo 1: elitech-power | [dòng bảng] Ricardo 1: elitech-power; Weichai 1: zhengchi-power | n138 ZCDL-W150 品牌="潍柴"→Weichai/dòng bảng | 342×-60 |
| 22 | 12M33D1450E310 | Weichai → Baudouin | [tên trang] Weichai 1: zhengchi-power | [dòng bảng] Baudouin 1: zhengchi-power | n112 ZCDL-B1320 品牌="博杜安"→Baudouin/dòng bảng; n162 ZCDL-W1320 品牌="1320"→Weichai/tên trang | 1×+nhánh |

Tổng dòng-lượt đổi điểm từ 22 động cơ này: R-series 1.930 (−60) + S12R/S16R 1.663 (−60; 156 trong đó −360) + WD 194 (+60) + 40 chỉ gốc + 1 chỉ nhánh (khớp mục "Top 30"). Lưu ý bảng trên: R4105ZD, R6105ZD chỉ có 1 phiếu Ricardo (kaichen-jiangsu); R6105AZLD 2; R6108ZLD 1 (elitech-power) — nên chỉ cần MỘT phiếu zhengchi là hãng đổi thành "chưa rõ" (ngưỡng ≥ 3 NCC không đạt ở cả hai phía; xem (3)).

### (1b) 7 động cơ zhengchi ghi hãng KHÁC các NCC khác (295 − 288)
Mức dòng bảng, phiếu NCC khác ↔ zhengchi (nguyên văn 品牌):
| động cơ | NCC khác (dòng bảng) | zhengchi 品牌 | hãng sau đổi |
|---|---|---|---|
| R6105AZLD | Ricardo: elitech, kaichen-jiangsu | n142 潍柴 | chưa rõ (trong 22) |
| R6108ZLD | Ricardo: elitech | n138 潍柴 | chưa rõ (trong 22) |
| R4105ZD | Ricardo: kaichen-jiangsu | n152 潍柴 | chưa rõ (trong 22) |
| R6105ZD | Ricardo: kaichen-jiangsu | n147 潍柴 | chưa rõ (trong 22) |
| S16R-PTAA2-C | Mitsubishi: fdk, powerlink, voltgent, walter-yangzhou, xingguang-jiangsu | n110 ZCDL-S1680 上柴 (n161 ZCDL-S1720 ô này là "1720", lệch cột → mức tên trang) | Mitsubishi (5 ≥ 3×1: giữ) |
| S16R2-PTAW-C | Mitsubishi: fdk, voltgent, xingguang-jiangsu | n106, n108 ZCDL-S1960 上柴 (cùng một NCC = 1 phiếu) | Mitsubishi (3 ≥ 3×1: giữ) |
| 1104D-E44TAG2 | Perkins: comler, nenjo, uleengen, xingguang-jiangsu | n145 ZCDL-P88 康明斯 | Perkins (4 ≥ 3×1: giữ) |
Vậy trong 7 chỉ 4 (R-series) đổi hãng; 3 còn lại zhengchi bất đồng nhưng ngưỡng vẫn giữ hãng. Hai nhóm còn lại của 22 (S12R-PTA2-C, S16R-PTA-C, S16R-PTA2-C: Mitsubishi vs SDEC) zhengchi KHÔNG bất đồng với "đa số": jiangchai-xuzhou đã ghi SDEC ở dòng bảng, zhengchi thêm phiếu thứ hai cho SDEC (上柴) làm tỉ lệ 4–5 : 2 < 3× nên hãng thành "chưa rõ" (S12R/S16R: một phiếu zhengchi đủ lật). Các động cơ 12M / 16M33 (博杜安 → Baudouin) và WP (道依茨 → Deutz) zhengchi ghi tên khác NCC khác nhưng `SAME_MAKER` (Baudouin↔Weichai, Weichai↔Deutz) coi cùng hãng nên tính là khớp; nhóm WD (锡柴 → FAWDE) NCC khác chỉ ở mức thấp hơn (tên trang / tiêu đề cột) nên không phải "bất đồng" cùng mức.

### (2) Nguồn chính hãng (tra 20/11/2026; trích nguyên văn ngắn)
**S12R / S16R bản Thượng Hải — 上海菱重 (SME) là ai, "上柴" của zhengchi có chỉ SME không**
- MHI (Mitsubishi Heavy Industries), thông cáo 2013-12-20, https://www.mhi.com/jp/news/1312205464.html : "上海菱重発動機有限公司（Shanghai MHI Engine Co., Ltd.…）" là công ty sản xuất–bán động cơ diesel thành lập cùng "上海柴油机股份有限公司（Shanghai Diesel Engine Co., Ltd.）"; "当社と上海ディーゼルの折半出資により設立" (hai bên góp vốn 50 / 50); sản phẩm đầu: động cơ "S12R－PTA－C" 1.190 kW 1500 vòng/phút; "当社がライセンス供与する出力500～1,600kWのディーゼルエンジン" (động cơ 500–1.600 kW do MHI cấp licence).
- Kết luận chỉ từ nguồn này: SME là liên doanh 50/50 giữa MHI và Shanghai Diesel (上柴); nó là CÔNG TY RIÊNG, không phải "SDEC" tự sản xuất, cũng không phải "Mitsubishi" thuần. Nguồn không nói "SDEC và Mitsubishi là một hãng".
- zhengchi (https://www.zcdl.com.cn/index.php?m=content&c=index&a=lists&catid=41, mở sống 20/11): trang "上柴发电机热销型谱" liệt kê CẢ động cơ SC4H… / SC7H… / SC9D… / SC13G… / SC25G… / SC27G… / SC33W… (dòng riêng của SDEC) LẪN S6R2-PTAA-C, S12R-PTA-C, S12R-PTA2-C, S12R-PTAA2-C, S16R-PTA-C, S16R-PTA2-C, S16R-PTAA2-C (ZCDL-S640 … ZCDL-S1720), với khối thông số "品牌：上柴 … 类型：国产品牌". Vậy "上柴" ở zhengchi là nhãn của CẢ DANH MỤC (SDEC + dòng licence Mitsubishi), KHÔNG chỉ SME; không có ô nào ghi "上海菱重" trong bảng zhengchi.
- Các NCC khác tự ghi "上海菱重" ở ô 柴油机品牌 (bdadl-shanghai, fukangsi, pengpai: `BDA-LZ1750 | 1600/1750 | 上海菱重 | S16R-PTAA2-C`), và mô tả "上海菱重发动机有限公司是由上海柴油机股份有限公司和日本三菱重工业株式会社共同组建的合资公司" (trang NCC: baifapower.cn/about_44, chntec.com.cn, lnsc.cn — KHÔNG phải nguồn chính hãng, chỉ khớp với MHI).
- Tóm lại cho Khoa: nguồn chính hãng nói đây là liên doanh MHI–Shanghai Diesel 50/50. "Cùng một nhà sản xuất" (SAME_MAKER Mitsubishi↔SDEC) là suy ra, nguồn không nói thẳng.

**R4105 / R6105 / R6108 — "潍柴" của zhengchi chỉ Weichai Power hay nhà máy Weifang Ricardo / Huafeng**
- https://www.zcdl.com.cn/index.php?m=content&c=index&a=lists&catid=39 (mở sống 20/11): "潍柴系列热销型谱" gộp: WP2.1D18E2 … WP13D385E200 (WP), 6M26D… / 12M26D… (M26 / M33), PHF4056ZD1 … PHF6132ZLD1, K4100D5-1 / K4102D3-1, R6113ZLD1, D226B-3D, 495D10-1 — nhiều tiền tố khác nhau trong cùng một danh mục tên "潍柴". Vậy "潍柴" ở zhengchi là nhãn của cả danh mục gồm nhiều tiền tố động cơ khác nhau, không cho biết từng động cơ do Weichai Power hay nhà máy khác sản xuất.
- https://www.ricardoengines.com/ : tiêu đề trang "Weifang Ricardo Diesel Engine", "We are factory. We have 10 years experience of engine manufacture." (không có chữ "Weichai").
- https://www.powerhf.com/ : "华丰动力股份有限公司前身创始于1920年，原名为潍县华丰机器厂" (Huafeng, Duy Phường). Trang chủ không nhắc Weichai Power hay Ricardo.
- https://www.weichaipower.com/ (tra tên công ty / sản phẩm phát điện): không thấy dòng R4105 / R6105 / R6108 trong các trang đã mở.
- KẾT LUẬN: quan hệ "R-series Weifang Ricardo / Huafeng" ↔ "Weichai Power" — **không rõ** theo nguồn chính hãng đã tra (không có trang nào nói cùng một hãng, cũng không có trang nào nói khác). Em KHÔNG suy ra.

**Các nhóm còn lại** (không đòi nguồn mới, chỉ ghi): WD → FAWDE (zhengchi 锡柴, mức dòng bảng; NCC khác chỉ mức tên trang / tiêu đề cột Wudong / Cummins); 12M / 16M33 → Baudouin (zhengchi 博杜安); WP → Deutz (zhengchi 道依茨). `SAME_MAKER` hiện có Baudouin↔Weichai và Weichai↔Deutz, nên "Weichai/Baudouin", "Weichai/Deutz" vẫn là Weichai.

### (3) Ước lượng các phương án (đếm thật bằng `sim.mjs` trên `build()`; "về như gốc" = hãng có/không có và tên gốc ⊆ tên mới; tổng 3.828 dòng-lượt của 22 động cơ)
| phương án | động cơ khác gốc | dòng-lượt về như gốc | động cơ khác nhánh hiện tại | ghi chú |
|---|--:|--:|--:|---|
| (a) giữ luật, chấp nhận | 22 (7 mất hãng, 2 được hãng) | 39 / 3.828 | 0 | −3.593 điểm-lượt như mục Top 30 |
| (b) bỏ cột 品牌 của bảng 整机编号 làm phiếu hãng (thêm "make" vào `TABLE_DROPS`) | 0 | 3.828 / 3.828 | 38 | 18 động cơ CÓ hãng ở nhánh mà MẤT hãng khi bỏ (WD129D11, WD150D15 = FAWDE; HBKMS171Z/227Z/780Z/840Z, JSQSK60D8 = Cummins; TCR300/500/550/600/700/750/780/890 = Tongchai; WEWP12ZLD/WEWP13ZLD = Weichai; YC4D55ZD20 = Yuchai): 29 dòng-lượt zhengchi (12 động cơ) trong `all` nhánh cloud sẽ mất `+60` hãng |
| (c) chỉ bỏ phiếu hãng của zhengchi ở 7 động cơ ghi khác NCC khác | 18 | 1.969 / 3.828 | 4 | trả lại 4 R-series (1.930) + 39; S12R/S16R (1.663) và WD (194) vẫn đổi |
| (d1) SAME_MAKER Mitsubishi↔SDEC | — | 1.702 / 3.828 | — | trả S12R/S16R (+39) |
| (d2) SAME_MAKER Weichai↔Ricardo | — | 1.969 / 3.828 | — | trả R-series (+39) |
| (d3) cả d1 + d2 | — | 3.632 / 3.828 | 14 | 4 động cơ được hãng, 0 mất; còn lại 194 = WD (FAWDE) |
Chưa mô phỏng: tác động của (b)–(d) lên điểm xuất xứ / G7 / luật tần số ngoài hãng và lên top 30 (cần đo cloud lại). Lưu ý riêng: (b) bỏ phiếu hãng của zhengchi ở MỌI bảng 整机编号 — kể cả nơi zhengchi là NCC duy nhất có phiếu hãng (18 động cơ ở trên), nên mất thông tin đúng; (c) giữ các phiếu đúng nhưng chỉ sửa 4 động cơ.

### Việc chờ Khoa (em chưa làm)
1. (d1) Mitsubishi↔SDEC: nguồn chính hãng (MHI) nói liên doanh 50/50 chứ không nói "một hãng" → có coi là SAME_MAKER không? Cần Khoa quyết (dựa vào nguồn, không suy ra).
2. (d2) Weichai↔Ricardo: nguồn chính hãng KHÔNG xác nhận (không rõ) → không thêm cặp trừ khi Khoa nói rõ.
3. (b) / (c): chọn có thể làm không cần xác nhận hãng, bằng đếm ở bảng trên.
Em giữ worktree `wt-catalog-b3`, PR #954 DRAFT, không sửa thêm gì.
