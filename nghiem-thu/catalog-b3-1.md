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


### (3e) Phương án (e) — phiếu hãng từ ô 品牌 của bảng zhengchi 整机编号 tính ở MỨC TÊN TRANG (điều phối yêu cầu 20/11; chưa sửa code PR)
Cách đếm: `genbid-test\b3\e2.mjs` (vá trong bộ nhớ `makesFor` của `web/catalog.js`: với `s.id === "zhengchi-power"` và tiêu đề cột có 整机编号, cả hai nhánh `cell.length === 1` và `row.length === 1` trả mức "tên trang" thay vì "dòng bảng"). Lưu ý bẫy: vá MỖI nhánh `cell` thì KHÔNG đổi gì (0 động cơ khác nhánh hiện tại) vì zhengchi đi nhánh `row` (ô 品牌 nằm trong rowText, `brandCell` không truyền) — phải vá cả hai. So `build()` gốc (abb28c67) ↔ (e) trên TOÀN BỘ động cơ có ở hai bên (so chuỗi tên hãng).
- Động cơ khác gốc trên toàn bộ `build()`: **1** — 12M33D1450E310: Weichai → Baudouin/Weichai (gốc chỉ có phiếu tên trang của chính zhengchi "ZCDL-W1320 品牌=1320→Weichai"; nay thêm phiếu tên trang 博杜安 → Baudouin; hai tên cùng mức nên hiện cả hai, `SAME_MAKER` coi là cùng hãng). Ngoài 22 động cơ: **không có** động cơ nào đổi.
- Dòng-lượt về như gốc: **3.828 / 3.828**. Động cơ khác nhánh hiện tại: 22 (cả 22 trả về gốc).
- 22 động cơ: Mitsubishi S12R-PTA2-C / S16R-PTA-C / S16R-PTA2-C → Mitsubishi (có lại); Ricardo R4105ZD / R6105ZD / R6105AZLD / R6108ZLD → Ricardo (không còn xung đột); WP6D132E200, WP4D108E200 → Weichai (Deutz bị bỏ); 12M26D902E200, 6M33D670E200, 16M33D1680E310, 12M55D2210E310 → Weichai; WD269TAD56, WD327TAD88, WD327TAD82, WD129TAD25 → Wudong/Wudong; WD287TAD61L, WD129TD17 → Wudong; WD129D11, WD150D15 → (chưa rõ) như gốc.
- 18 động cơ mà zhengchi là phiếu duy nhất: 16 vẫn có hãng (HBKMS171Z/227Z/780Z/840Z, JSQSK60D8 = Cummins; TCR300/500/550/600/700/750/780/890 = Tongchai; WEWP12ZLD/WEWP13ZLD = Weichai; YC4D55ZD20 = Yuchai) vì mức tên trang vẫn đủ khi không có phiếu cao hơn; chỉ WD129D11 và WD150D15 mất FAWDE (về "chưa rõ" như gốc, mất +60 hãng ở 194 dòng-lượt so với nhánh hiện tại, bằng gốc).
- 7 động cơ (1b): R6105AZLD, R6108ZLD, R4105ZD, R6105ZD → Ricardo (`makeConflict` false); S16R-PTAA2-C, S16R2-PTAW-C → Mitsubishi và 1104D-E44TAG2 → Perkins, như trước.
- Chưa mô phỏng: xuất xứ / G7 / luật tần số ngoài hãng, top 30 (cần đo cloud). So với (b): (e) không làm mất hãng của 16/18 động cơ duy nhất-zhengchi, chỉ mất 2 (WD).


---
## DOOSAN_P (chuẩn bị cho PR draft RIÊNG sau khi #954 merge; chưa sửa code ở #954)
**Mã vá thử** (worktree tạm `wt-b3-doosan`, không commit, đã xoá): trong `fromSupplier`, ngay trước luật `DOOSAN_P` hiện có, thêm
`if (hasEngineCol && ei < 0 && ai < 0 && alt.length === 1 && DOOSAN_P.test(cells[alt[0]].trim())) ai = alt[0];` — bảng KHÔNG có cột đầu phát nên `ai` luôn −1 (`ai` chỉ gán khi `hasAltCol`), luật `DOOSAN_P` (điều kiện `ai >= 0`) không bao giờ chạy và dòng không có bản ghi động cơ nào. Phần còn lại của luật không đổi (mã Doosan thành động cơ, đầu phát = mã dạng đầu phát KHÁC nếu có).
**Đo** `spec-diff git:HEAD(5a513b4b) .`: bản ghi 60.066 → 60.354; khác 0, chỉ cũ 0, chỉ mới **288** (toàn `engine`); bảng đổi 49 → **MỌI** ngoại ứng ở đây (không bản ghi nào đang có đổi). Mã thêm (theo ô nguồn): P126TI (kèm -II / -11) 97, P158LE (kèm -1 / -S) 80, P086TI (kèm -1 / -I) 75, P222LE 27, P180LE 8, P034TI 1 — đều dạng `DOOSAN_P`. Bản đầy đủ: `genbid-test\b3\out\sd-doosan.txt`.
**Liệt kê hết bảng bị ảnh hưởng (NCC nN: số bản ghi động cơ thêm):** aoke-yangzhou n130 1, n133 1, n136 1; aosif n104 3, n115 3; bdadl-shanghai n133 13; excel-power-ningde n117 12; fukangsi-yangzhou n2008 13; haifeng-taizhou n2006 8; huatai-yangzhou n108 9; jiangchai-xuzhou n101 6; jianghao-genset n106 19; kaihua-genset n103 7, n108 5, n126 14; lees-power n105 2; legapower n106 12; longkai-power n123 5; mamo-power n108 11; mecca-power n113 11, n129 10; nenjo-generator n146 10; previa-ningde n106 10; taihai-taizhou n105 2, n114 6; teksan n103 1; victory-generator n106 16; waeta-fujian n106 10; walter-yangzhou n104 9, n105 1, n113 10; wintpower n146 16; world-power-fuzhou n103 6; xingguang-jiangsu n107 6, n121 6, n122 1; zhengchi-power n133 1, n136 1, n139 1; zhengdian-zhengzhou n108 9. Tổng 288 trên 40 cặp (NCC, n); spec-diff đếm 49 bảng vì một số n có hơn một bảng.
Lưu ý: PR này làm rộng hơn 3 dòng zhengchi điều phối nêu (288 bản ghi ở ~35 NCC, tất cả mã Doosan trước đó bị bỏ vì bảng không có cột đầu phát). Mọi bản ghi đều là mã `DOOSAN_P` dưới cột động cơ; chưa soát tay từng dòng, cần soát khi làm PR riêng (đo cloud / quality sau).
**Đối chiếu trang hãng:** "P126TI-II" có trang chính hãng HD Hyundai Infracore (HD Hyundai Engine): https://www.hd-hyundaiengine.com/en/engine/generator-detail/14 ("An 11-liter engine (maximum output: 342 kWm) for an inline, six-cylinder, turbo/intercooler generator" — mô tả công cụ tìm kiếm, em chưa mở cả trang). Catalog "Doosan Diesel Engine Series for Generator" (7–995 kW) của HD Hyundai Infracore đăng ở pdf.directindustry.com/pdf/hd-hyundai-infracore/doosan-diesel-engine-series-generator/26469-953489.html (chưa mở PDF kiểm từng mã). P086TI chỉ thấy qua trang không chính hãng (scribd "PU086TI"), P158LE chưa kiểm riêng → KHÔNG khẳng định cho P086TI / P158LE; hậu tố "-11", "-1", "-I" của zhengchi / NCC khác không có trong tên hãng (hãng ghi "P126TI-II"), nên "P126TI-11" là cách viết của NCC.
**ZCDL-Q363 (n112):** nguồn `suppliers/sources/zhengchi-power/128.md:145` ghi nguyên văn `| 330KW | 363KW | 乾能 | ZCDL-Q363 | 653.4 | 50Hz | … | 6 | 14.6 | 3130×1115×1850 | 3000`; ô 柴油机型号 = "653.4" (số, không là mã; dòng Q396 liền trên ghi "12V135AZLD-1"). Không thấy mã động cơ ở nơi nào khác trong nguồn zhengchi cho Q363. Đề xuất: để nguyên (không bản ghi động cơ, đã là hành vi đúng của `isCode`), không đoán mã từ Q396. Chưa sửa.


---
## Top 30 cloud bản (e) (đo của điều phối main 091b5c26 ↔ 5a513b4b, `dau-vao\catalog-b3\top30-cloud-e\`; em phân tích 20/11, chưa đẩy commit)
Số điều phối: 973 / 1.093 lượt giống (trước (e): 770); 56 lượt khác tập ứng viên; 483 khoá rời / 441 khoá vào; 66 lượt đổi top (24 đổi tập). Script em: `genbid-test\b3\e3.cjs`, `e4.mjs`, `e5.cjs`, `e6.cjs`, `e7.cjs`, `e9.cjs`; chạy lại `candidates` một lượt hai bản: `dogop1.mjs` (ONLY=IB2400073761) → `out\e1-main.json`, `out\e1-nhanh.json`.

### (1) 40 khoá NCC KHÁC rời `all` — đều là luật tần số, và đều ở MỘT lượt
Cả 40 khoá nằm ở một lượt **IB2400073761#0**; không NCC nào khác. Chạy lại `candidates` đúng lượt đó ở hai bản (dogop1): bản main KHÔNG loại dòng nào của 6 động cơ dưới đây bằng `freq`; bản nhánh loại đúng **40** dòng với `ruled = freq` (`config-bot.mjs` 1654–1658: `hints.freq && !u.freq`, mọi dòng có tần số của động cơ ghi một tần số khác HSMT, ≥ 2 dòng → trừ 600). Đây là cùng 40 dòng của lớp L3 ở mục "Top 30" trước (TAD734GE 31, YCA08350D30 4, WP7D264E310 2, TAD733GE 1, KP9D310D2 1, WD129TAD25 1); (e) không đổi gì ở lớp này.
Cơ chế (đếm bằng `build()`): mỗi động cơ ở main chỉ có **1** dòng có tần số (50 Hz) → luật cần ≥ 2 nên không chạy; ở nhánh dòng zhengchi mang MÃ ĐỘNG CƠ THẬT thêm dòng thứ hai 50 Hz → luật chạy. Dòng zhengchi đó KHÔNG "chiếm chỗ" trong top (không dòng zhengchi nào vào top); nó chỉ thêm một dòng có tần số:
| động cơ | dòng có tần số ở main → nhánh | dòng zhengchi thêm | số khoá NCC khác rời |
|---|---|---|---|
| TAD734GE | 50:1 → 50:2 | n135 ZCDL-V219 (50Hz) | 31 |
| YCA08350D30 | 50:1 → 50:2 | n135 ZCDL-Y235 (50Hz) | 4 |
| WP7D264E310 | 0 → 50:2 | n134 + n135 ZCDL-W220 (50Hz) | 2 |
| TAD733GE | 50:1, 60:1 → 50:2, 60:1 | n136 ZCDL-V179 (50Hz) | 1 |
| KP9D310D2 | 50:1 → 50:2 | n135 ZCDL-K200 (50Hz) | 1 |
| WD129TAD25 | 50:1 → 50:2 | n133 ZCDL-X260 (50Hz) | 1 |
Lưu ý chưa giải thích hết: TAD733GE ở `build()` của em có CẢ dòng 60 Hz nên luật lẽ ra không chạy, nhưng chạy `candidates` thật vẫn ghi `freq` cho dòng xingguang-jiangsu|TAD733GE (`e.uses` trong config-bot có thể đã lọc theo xuất xứ / đồng bộ khác `build()` thô). Tần số HSMT của lượt em chưa đọc từ bidhist (chỉ biết nó khác 50 vì TAD734GE chỉ có dòng 50 Hz mà bị loại).
Danh sách ĐỦ 40 khoá (lượt | NCC | động cơ | điểm ở bản gốc), tất cả IB2400073761#0:
1. IB2400073761#0 | dingbo | TAD734GE | điểm 257
2. IB2400073761#0 | fdk-energy | YCA08350D30 | điểm 245
3. IB2400073761#0 | sr-genset | TAD734GE | điểm 223
4. IB2400073761#0 | sr-genset | TAD734GE | điểm 220
5. IB2400073761#0 | rcg-power | TAD734GE | điểm 213
6. IB2400073761#0 | rcg-power | TAD734GE | điểm 207
7. IB2400073761#0 | comappower | TAD734GE | điểm 205
8. IB2400073761#0 | kaihua-genset | TAD734GE | điểm 205
9. IB2400073761#0 | kaihua-genset | TAD734GE | điểm 205
10. IB2400073761#0 | rcg-power | YCA08350D30 | điểm 205
11. IB2400073761#0 | comappower | TAD734GE | điểm 203
12. IB2400073761#0 | xingguang-jiangsu | TAD733GE | điểm 165
13. IB2400073761#0 | jianghao-genset | TAD734GE | điểm 165
14. IB2400073761#0 | mingbang-mbkl | TAD734GE | điểm 165
15. IB2400073761#0 | world-power-fuzhou | TAD734GE | điểm 165
16. IB2400073761#0 | xingguang-jiangsu | TAD734GE | điểm 165
17. IB2400073761#0 | xingguang-jiangsu | TAD734GE | điểm 165
18. IB2400073761#0 | yunding-jiangsu | YCA08350D30 | điểm 165
19. IB2400073761#0 | jianghao-genset | TAD734GE | điểm 155
20. IB2400073761#0 | meao-jiangsu | TAD734GE | điểm 155
21. IB2400073761#0 | yunding-jiangsu | WP7D264E310 | điểm 155
22. IB2400073761#0 | eastern-lion-fuan | KP9D310D2 | điểm 145
23. IB2400073761#0 | app-power-anpu | TAD734GE | điểm 115
24. IB2400073761#0 | bdadl-shanghai | TAD734GE | điểm 115
25. IB2400073761#0 | fukangsi-yangzhou | TAD734GE | điểm 115
26. IB2400073761#0 | haifeng-taizhou | TAD734GE | điểm 115
27. IB2400073761#0 | huadong-yangzhou | TAD734GE | điểm 115
28. IB2400073761#0 | kangwo-guangdong | TAD734GE | điểm 115
29. IB2400073761#0 | liangzi-yangzhou | TAD734GE | điểm 115
30. IB2400073761#0 | pengpai-yangzhou | TAD734GE | điểm 115
31. IB2400073761#0 | pengpai-yangzhou | TAD734GE | điểm 115
32. IB2400073761#0 | taihai-taizhou | TAD734GE | điểm 115
33. IB2400073761#0 | walter-yangzhou | TAD734GE | điểm 115
34. IB2400073761#0 | walter-yangzhou | TAD734GE | điểm 115
35. IB2400073761#0 | app-power-anpu | YCA08350D30 | điểm 115
36. IB2400073761#0 | app-power-anpu | WP7D264E310 | điểm 115
37. IB2400073761#0 | vantek-jiangsu | TAD734GE | điểm 113
38. IB2400073761#0 | vantek-jiangsu | TAD734GE | điểm 112
39. IB2400073761#0 | shengfeng-fuan | WD129TAD25 | điểm 107
40. IB2400073761#0 | kangwo-guangdong | TAD734GE | điểm 105

### (2) 441 khoá VÀO
Toàn bộ 441 khoá vào (1.197 lượt-khoá) là **zhengchi-power**; không khoá nào của NCC khác (em đối chiếu từng khoá: 0 không phải zhengchi). Cả 441 khoá có tên động cơ (phần thứ hai của khoá) đúng bằng ô NGAY SAU mã tổ máy ZCDL… trong dòng nguồn (441 / 441, 0 lệch): đúng cột 柴油机型号, không lấy mã tổ máy làm động cơ.
### (3) 24 lượt đổi tập top (ra / vào)
- **Không dòng zhengchi nào VÀO top** ở cả 24 lượt (đếm số khoá zhengchi trong top gốc / nhánh: 0 / 0, trừ IB2600219527#0: 1 / 0). Vậy không có dòng zhengchi mới cần soát mã động cơ / công suất ở top.
- 1 lượt có zhengchi RA: **IB2600219527#0**: ra `zhengchi-power|ZCDLD100` @71 (dòng nguồn n143 `| 90KW | 100KW | 斗山 | ZCDL-D100 | D1146T | …`: mã tổ máy bị đọc làm động cơ ở bản gốc), vào `long-gen|WHI224G` @127. Ở nhánh dòng đó thành khoá `zhengchi-power|D1146T` @119 (động cơ D1146T đúng cột, công suất 90 / 100 KW giữ như nguồn) nên không còn trong top (top 30 nay lấy dòng 127 trước 119). Đúng kỳ vọng.
- 23 lượt còn lại là dòng NCC khác đổi chỗ, điểm KHÔNG đổi ở mọi dòng (đã kiểm: cùng khoá, cùng điểm ở `all` hai bản), chỉ thứ hạng trong `all` xê dịch vài bậc vì các dòng zhengchi khoá ZCDL… (hạng đầu) nay là khoá động cơ thật:
  - **jet-power TAD751GE @276 ra, jet-power WP6D132E200 @269 vào**: 13 lượt (IB2300046166#0, 2300111838#0, 2300134577#2, 2300136367#0, 2300190927#1, 2300220257#0, 2300340274#0, 2400043707#1, 2400062394#2, 2400515309#0, 2400566322#0, 2500015269#0, 2500061368#0). TAD751GE ở cùng hạng #63 / điểm 276 hai bản; WP6D132E200 (Weichai, xuất xứ cn) từ #98 lên #93. Top 30 gốc có 13 dòng hãng Trung Quốc, nhánh 14 (đo ở lượt IB2300046166#0: Volvo Penta 1 → 0, Weichai 3 → 4): một dòng cn thêm một chỗ (đúng cơ chế `CN_ROWS = 12` giữ chỗ cho hãng Trung Quốc, `config-bot.mjs` ~1706) nên dòng hãng ngoại (Volvo 276) mất chỗ cuối cho dòng cn 269. Em CHƯA chạy từng bước `pick` để chỉ ra đúng dòng nào chiếm chỗ cn; kết luận trên dựa vào hạng và số dòng cn trong top.
  - **sanq-power 1106A70TAG4 / tecgen-fujian 1106A70TAG3 ra, sanq-power 1106A70TAG3 / hosem-power 1106A70TAG4 @272 vào**: 8 lượt (IB2200023019#0, 2200023806#0, 2300163186#3, 2300204857#0, 2300293753#2, 2300329118#0, 2400032948#1; và IB2300220302#0 biến thể @484/@481: ra sanq 1106A70TAG4 + wintpower 1106A70TAG3, vào sanq 1106A70TAG3 + uleengen 1106A70TAG4). Điểm bằng nhau (284 / 284); hạng đổi vài bậc (sanq TAG4 #22 → #32, tecgen TAG3 #34 → #24…): chênh bằng thứ tự bằng điểm trong `all`, kèm giới hạn `PER_ENGINE = 3` / `PER_SUPPLIER = 4`.
  - IB2200084263#0: ra uleengen WP10D264E200 @475, vào voltgent 1506AE88TAG3 @475 (hạng #71 → #74 và #76 → #73, điểm bằng nhau). IB2500410852#0: ra eastern-lion YC6MK350LD20 @269, vào dingbo 1506AE88TAG3 @269 (#87 → #89, #90 → #83, điểm bằng nhau).
  Chưa có dòng nào trong 23 lượt này có điểm đổi; mọi đổi tập là đổi thứ tự trong cùng điểm / giữ chỗ cn.


---
## Đóng 3 điểm trước khi merge #954 (điều phối 20/11; chỉ đọc + trace, chưa đẩy commit)
Trace: `genbid-test\b3\dogop-trace.mjs` (bản sao `config-bot.mjs` có thêm dòng ghi từng bước `pick`, tệp tạm đã xoá), `tr.cjs`, `e10.mjs`, `e11.mjs`; kết quả `out\tr-main.json`, `out\tr-nhanh.json`.
**(1) IB2400073761#0 — HSMT yêu cầu tần số gì; 40 dòng bị `freq` có đúng không.** Văn bản HSMT (bidhist) ghi "Máy 250 kVA (STT 1): Tần số: 50 & 60hz" (CẢ HAI tần số). `hintsOf` (`config-bot.mjs` ~946): `f50 = /\b50\s?hz\b/i`, `f60 = /\b60\s?hz\b/i`; "50 & 60hz" chỉ khớp f60 (sau "50" là " &", không phải "hz") → `hints.freq = 60` (trace: main 60, nhánh 60). Vậy 40 dòng bị loại vì "động cơ chỉ có dòng 50 Hz, HSMT yêu cầu 60 Hz" là LOẠI OAN: HSMT chấp nhận 50. Đây KHÔNG phải lỗi do zhengchi: bản main đã loại oan 431 dòng bằng cùng luật (NTA855G1A 38 dòng, YC6MK350LD20 30, WP10D264E200 22, …), nhánh 471 = 431 + 40. 40 dòng thêm là các động cơ mà zhengchi cộng dòng 50 Hz thứ hai (1 → 2 dòng có tần số, ngưỡng của luật). Hồi quy nhẹ: số dòng bị loại oan tăng 40 ở MỘT lượt (do dữ liệu mới làm lộ một lỗi đọc tần số có sẵn). Lỗi gốc ở `hintsOf`: đếm gói trong bidhist (1.259 gói có text) có `hintsOf = 60` mà HSMT viết 50 & 60 / 50/60 / 50 hoặc 60 Hz: **8 gói** (IB2200058001, IB2400073761, IB2400270596, IB2400454375, IB2500240059, IB2500314001, IB2500500319, IB2500551987). Đề xuất (PR riêng, chưa làm): nhận "50 & 60 Hz", "50/60 Hz", "50 hoặc 60 Hz", "50-60 Hz" là CẢ HAI (freq = null).
**(2) TAD733GE.** `build()` có dòng 60 Hz của **pramac n2007** (`225.12`), nhưng `byOrigin(…, "all", cn, grp)` (`config-bot.mjs` 459–470) với `grp` chỉ giữ dòng của NCC ở Trung Quốc ("every make, in the rows of the suppliers based in China"): dòng pramac (Ý) không nằm trong `e.uses` của `candidates`. Còn lại `known = [kaichen-jiangsu:50, zhengchi-power:50]` (nhánh) so với `[kaichen-jiangsu:50]` (main) → ≥ 2 và đều 50 ≠ 60 → `freq`. Không mâu thuẫn: `build()` thô khác danh sách dòng của `candidates`.
**(3) 13 lượt jet TAD751GE@276 ra / WP6D132E200@269 vào — trace `pick` lượt IB2300046166#0.** `hints.freq = 50`, `origin all`, `CN_ROWS` bật, 672 dòng cn, `max 30`, `makeCap 10`.
- Bước CN (`pick(rows.filter(cn), 12)`): 11 dòng đầu GIỐNG HỆT hai bản; dòng thứ 12 khác: main `dingbo|YC6B205LD20@269`, nhánh `jet-power|WP6D132E200@269`. Cùng điểm 269 nên do thứ tự trong `rows` (sort ổn định theo điểm, hòa theo thứ tự `build().engines`): thứ tự ứng viên cn ở điểm 269: main … dingbo YC6B205LD20 (vị trí 21) … jet WP6D132E200 (26); nhánh jet WP6D132E200 (21) lên TRƯỚC dingbo YC6B205LD20 (22).
- Vì sao đổi thứ tự: `build().engines` theo thứ tự (chỉ số) — WP6D132E200: main 123 → nhánh 118, YC6B205LD20: 122 → 123. `build()` xếp động cơ theo số NCC / số dòng giảm dần: WP6D132E200 ở main có 53 dòng / 44 NCC (đứng ngay SAU YC6B205LD20: 54 dòng / 44 NCC); ở nhánh dòng zhengchi mang mã động cơ thật cộng cho nó 1 dòng và 1 NCC (54 dòng / 45 NCC) nên xếp TRƯỚC YC6B205LD20 (54 / 44). (Chỉ số tuyệt đối còn dịch vì 351 động cơ ZCDL giả biến mất; thứ quyết định là thứ tự tương đối của hai động cơ.)
- Bước điền (`pick(rows, 30)`): ở nhánh jet-power đã có 4 chỗ (WP6D132E200 ở bước CN + 1106A70TAG2, 1106A70TG1, 1106A70TAG3) = `PER_SUPPLIER = 4` → TAD751GE@276 (dòng thứ 5 của jet-power) bị bỏ; main jet-power có 1106A70TAG2, TG1, TAG3, TAD751GE (4). `dingbo|YC6B205LD20@269` (bước CN ở main) rơi xuống bước điền ở nhánh và vẫn được chọn → số dòng cn trong top 13 → 14, ngoại lai (Volvo Penta) 1 → 0.
- Mười hai lượt còn lại: **cùng khoá ra / vào, cùng hạng** (TAD751GE #63@276 = 2 bản; WP6D132E200 #98 → #93; hai lượt IB2400566322#0 và IB2500015269#0 là #75 → #78 và #116 → #111, cùng cặp ra / vào); em CHƯA trace từng lượt, kết luận "cùng cơ chế" dựa trên cặp khoá, điểm và hạng giống hệt. (13 lượt: IB2300046166#0, 2300111838#0, 2300134577#2, 2300136367#0, 2300190927#1, 2300220257#0, 2300340274#0, 2400043707#1, 2400062394#2, 2400515309#0, 2400566322#0, 2500015269#0, 2500061368#0.)
- Kết luận: hòa điểm 269 ở bước CN chuyển từ dingbo sang jet do thứ tự động cơ trong catalog đổi; không dòng nào đổi điểm.
