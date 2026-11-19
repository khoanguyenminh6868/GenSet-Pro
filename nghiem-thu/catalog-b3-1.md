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
