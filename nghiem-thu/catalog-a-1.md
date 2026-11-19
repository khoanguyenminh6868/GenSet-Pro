**Kết luận bằng số (đo, `suppliers/cn` hiện tại, gốc 671797e4 ↔ nhánh c977a26b): +388 bản ghi mới (224 dòng máy chưa từng đọc ở 7 NCC, 209 model tổ máy chưa có), 18 bản ghi gộp vào bản ghi khác (không mất dữ liệu), +1.130 khối lượng, +455 tiêu hao, +52 dòng điện, +74 xi lanh ở 9 NCC đang đọc; đảo vai 0 → 0; mọi số mới đều có trong chữ dòng nguồn. Số đo khác ước của brief ở (a): dòng máy trong tiêu đề là 422 dòng / 9 NCC (không phải 157 / 6) — ước cũ bỏ sót fdk-energy 174, elitech 50, rcg 41. Còn 5 giá trị nguồn ghi sai rõ (1440 kg cho máy 1600 kW ×3, 5500 kg cho máy 20 kW ×2) cần quyết.**

# catalog-a — dòng máy nằm trong tiêu đề + gộp dấu cách chữ Hán của tiêu đề (19/11/2026)

- Phiên con của điều phối. Khoa 19/11/2026 duyệt "Làm" cả hai (đề xuất của #941).
- PR (DRAFT, không tự merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/945 — nhánh `catalog-a`, **commit c977a26b**, gốc `671797e4` (origin/main, đã có #941).
- Tệp đổi: `web/catalog.js` (`tidyTable` + `headerRows`, +29 / −8), `suppliers/catalog-a.test.mjs` (mới, 8 ca dòng thật), `suppliers/bang-r1.test.mjs` (1 ca của #941 khẳng định "KHÔNG gộp 机组重 量" → đổi thành "gộp, đọc ra 13000 kg"), `web/CLAUDE.md` (mục bẫy catalog-a; sửa câu "KHÔNG làm" của mục R1), `suppliers/unread-tables.json` (chụp lại: +5 ghi chú "dòng máy lẫn với dòng tiêu đề").
- Ngoài phạm vi brief "chỉ catalog.js + test": ba tệp sau cùng ở trên — bắt buộc vì test cũ khẳng định hành vi ngược lại, mục CLAUDE.md cũ thành sai, snapshot là thói quen của PR đọc. Không đụng `suppliers/config-bot.mjs`, `genbid-hsmt\`, web thật, `suppliers/cn`.
- Tệp làm việc: `genbid-work\dieu-phoi\dau-vao\catalog-a\` (mục 8).

## 1. Đo lại phạm vi trước khi viết

**(a)** `1-quet-tieu-de.cjs` quét MỌI bảng: 852 dòng tiêu đề (thứ 2 trở đi) có ô mã. Lọc "ô mã ở cùng vị trí với dòng đầu của bảng, ≤ ô 1" (`2-do-a.cjs`): 496 dòng / 17 NCC; xem tay từng bảng (`do-a-goc.tsv`):
- Dòng máy thật (ô ĐẦU là model tổ máy): **422 dòng / 9 NCC** — fdk-energy 174, baifa 90, elitech 50, rcg 41, penlucky 34, welland 12, agg-fuzhou 10, simpson 8, visa 3. Trong đó chưa có bản ghi nào mang chữ dòng: 401 (welland 12 + fdk 9 đã đọc ở bảng khác).
- Không phải dòng máy (74): longkai 64 ("| STAMFORD | UCI224F" — mảnh bảng nhãn PDF), generatordieselchina 2, xinhengxin 3 ("| Model | …"), camda / aosif / keliang / sunkings / taylor 1 mỗi NCC (cặp nhãn | giá trị). Luật mới loại hết nhờ "ô ĐẦU là mã".
- Lệch với brief: brief ghi 157 / 6 NCC (= baifa 90 + penlucky 34 + welland 12 + agg 10 + simpson 8 + visa 3). Ba NCC bị sót có ô trống ở đầu dòng tiêu đề thứ nhất ("| | Genset Model | …") — cùng một kiểu, nên làm chung.

**(b)** Đúng như ước: +1.130 khối lượng (bdadl, fukangsi, pengpai), +455 tiêu hao (honny 168 L/h, xingguang 287 g/kWh); thêm dòng điện yunding 52, xi lanh zhengdian 74 (ước cũ không nêu).

## 2. Luật (trong `tidyTable`, trước mọi bước đọc)

| | luật | vì sao an toàn |
|---|---|---|
| (b) | `HAN_SP`: bỏ MỌI dấu cách giữa hai chữ Hán, CHỈ ở tiêu đề (gộp luôn luật "≥ 4 chữ cách chữ" của #941) | một ô tiêu đề là một tiêu đề; dòng không đụng ("重庆 康明斯" là hãng + nơi) |
| (a) | `headerRows`: từ dòng tiêu đề thứ 2, dòng đầu tiên có ≥ 3 ô, **ô đầu** là mã, có số; dòng đầu của bảng cũng bắt đầu bằng mã; bảng không phải bảng nhãn → mọi dòng từ đó tới hết tiêu đề chuyển sang dòng, đánh số `rows.length + j` (chỉ số dòng cũ giữ nguyên → khoá spec-diff / soát của bản ghi cũ không đổi) | dòng tiêu đề con trước chúng giữ (baifa "Standby KVA \| Prime KVA \| Brand …") |
| (a) không chắc | sau dòng máy đầu tiên còn dòng không phải dòng máy → **để nguyên cả bảng**, note "dòng máy lẫn với dòng tiêu đề" (vào `unread-tables`) | 5 bảng (mục 5) |

## 3. Kiểm chéo toàn bộ (`spec-diff.mjs git:origin/main .`, + `3-soat.mjs` theo khoá NCC|n|bảng|dòng|vai|model, MỌI bản ghi)

```
bản ghi cũ 59786, mới 60156 | khác 1783 | chỉ cũ 18, chỉ mới 388 | bảng có đổi 122
{"makes":72,"weight thêm":1130,"fuel thêm":455,"current thêm":52,"cyl thêm":74}
đảo vai: 0 → 0 | tự kiểm: cần soát tay 692
Chưa đọc được: … dòng máy lẫn với dòng tiêu đề: 0 → 5; (mọi lý do khác không đổi)
```
`3-soat.mjs`: mới 388, mất 18 (18 gộp qua `also`), đổi 2.940 (+2.106 bản ghi chỉ đổi chữ tiêu đề lưu kèm `header`, không đổi số).

| NCC | mới | mất | đổi | (a)/(b) | giải thích |
|---|--:|--:|--:|---|---|
| fdk-energy | 184 | 18 | 1 | a | 92 dòng × (động cơ + đầu phát); 18 mất = 9 dòng mà chữ trùng dòng tiêu đề nay đọc ở bảng đứng trước → gộp qua `also`; 1 đổi = 16KTA76-G31 mất hãng "Cummins" lấy từ dòng khác trong tiêu đề |
| baifa-power | 60 | 0 | 58 | a | 35 dòng mới (35 động cơ + 25 đầu phát); 30 dòng trùng chữ giữa n101 b3 / n103 b5 → gộp; 58 đổi = mất hãng (mục 4) |
| elitech-power | 50 | 0 | 0 | a | 50 dòng, bảng không cột đầu phát |
| penlucky | 68 | 0 | 0 | a | 34 dòng × 2 |
| agg-fuzhou | 10 | 0 | 0 | a | 10 dòng (xem rủi ro "COP") |
| rcg-power | 8 | 0 | 0 | a | 4 dòng × 2 (n105–n107); n120 để nguyên |
| simpson-power | 8 | 0 | 13 | a | 8 dòng; 13 đổi = mất hãng "Mitsubishi" gán nhầm cho MTU 16V/20V4000 (12) + 4016-61TRG3 còn Perkins (1) |
| welland-power | 0 | 0 | 0 | a | 12 dòng đều trùng chữ dòng ở bảng khác → gộp, không bản ghi mới |
| bdadl / fukangsi / pengpai | 0 | 0 | 411 / 366 / 447 | b | khối lượng +383 / +321 / +426; còn lại chỉ đổi nhãn ("润滑油 容量" → "润滑油容量") |
| honny-dongguan | 0 | 0 | 168 | b | tiêu hao "燃油 消耗 (L)" +168 |
| xingguang-jiangsu | 0 | 0 | 287 | b | tiêu hao g/kWh +287 |
| yunding-jiangsu | 0 | 0 | 319 | b | dòng điện +52; 267 chỉ đổi nhãn ("排 气 量" → "排气量", "缸 径" …) |
| zhengdian-zhengzhou | 0 | 0 | 96 | b | xi lanh "缸 数" +74; 22 chỉ đổi nhãn |
| huadong / kangwo / liangzi / xinzhengfa | 0 | 0 | 120 / 214 / 373 / 67 | b | CHỈ đổi chữ nhãn của thông số đã đọc, giá trị y nguyên (`4-nhan.mjs` → `nhan-doi.tsv`: 14 dạng, mọi bản ghi) |

Nhãn đổi mà giá trị như cũ: 14 dạng / 1.457 lượt (`nhan-doi.tsv`). Hai dạng đáng nói: bdadl / pengpai `weight.label` "重量 (kg)" → "机组重量(KG)" (19 + 20): giá trị cũ, nhãn nay lấy từ bảng khác cùng chữ dòng (gộp `mergeRepeats`).

**Mọi bản ghi mới (388):** đều từ dòng chuyển (`6-dong-chuyen.mjs`: 388 / 388, ngoài 0); cờ tự kiểm của `3-soat.mjs` (model / tổ máy / mọi số công suất và thông số phải có trong chữ dòng, kW/kVA 0,75–0,86, prime ≤ standby, có model tổ máy): **0 cờ**. Model + tổ máy có trong chữ dòng: 388 / 388. Mức công suất đối chiếu tiêu đề từng bảng: fdk "Standby Power | Prime Power" (250 / 225 kVA đúng thứ tự), baifa "Standby KVA | Prime KVA", penlucky "Primary Powe /KW", elitech "Prime | Standby", rcg "Prime | Standby", simpson "备用功率 (kW/kVA)".

## 4. Giá trị mới: đơn vị + độ hợp lý so với công suất CỦA CHÍNH DÒNG (`5-hop-ly.mjs` → `hop-ly-1.tsv`, mọi giá trị)

| NCC | khoá | ok | nghi | không có công suất để so | ghi chú |
|---|---|--:|--:|--:|---|
| bdadl | weight | 376 | 1 | 6 | kg/kW 5–80 |
| fukangsi | weight | 317 | 2 | 2 | |
| pengpai | weight | 422 | 2 | 2 | |
| honny | fuel | 168 | 0 | 0 | nhãn "燃油 消耗 (L)" không ghi /h: soát tay 168 / 168 nằm 0,15–0,35 L/h/kW prime → là L/h ở 100% tải; spec-norm sẽ báo thiếu đơn vị giờ (không đoán) |
| xingguang | fuel | 287 | 0 | 0 | g/kWh 150–300 |
| yunding | current | 52 | 0 | 0 | A/kW 1,6–2,0 |
| zhengdian | cyl | 74 | 0 | 0 | 1 giá trị "6" cho H16V190ZL (nguồn ghi 6) → row-flags `cylMaj` bắt |

10 "không có công suất để so" (bản ghi không đọc được công suất — có từ trước): soát tay theo chữ dòng — 710 / 580 / 800 kg cho máy 20 kW, 2.268 / 1.900 kg cho 200 kW, 2.800 kg cho 320 kW: hợp lý.
**5 nghi = nguồn ghi sai, đọc đúng ô:** "| BDA-LZ1750 | 1600/1750 | … | 1440" (+ FKS-LZ1750, PPDL-LZ1750: 1.440 kg cho máy 1.600 kW — 0,9 kg/kW) và "| FKS-C20 | 20/25 | … | 5500" (+ PPDL-C20: 5.500 kg cho 20 kW). Hai dòng 5500 kg bị row-flags gắn `absurd` mức drop (config-bot loại khỏi gợi ý). Ba dòng 1440 kg KHÔNG bị chốt nào bắt (bản ghi không có công suất nên `saneSpecs` / row-flags không xét) → **cần quyết** (mục 7).

Đã cân nhắc chốt trên (> 150–200 kg/kVA bỏ): trong cả catalog chỉ bắt thêm bruno-generators (đèn chiếu sáng 1.050–1.120 kg, số đúng, 198–211 kg/kVA) — sát ngưỡng 220 của dòng sai → KHÔNG thêm luật.

**Hãng (mục `makes`, 72):** mọi lượt là hãng "via tiêu đề cột" lấy từ chữ của dòng máy KHÁC đang nằm trong tiêu đề. Sai rõ ở: Baudouin 12M33/16M33/20M33/8M33/12M55/16M55 → "Cummins" (19), MTU 12V/16V/20V4000 → "Cummins" (7, baifa) / "Mitsubishi" (12, simpson), fdk 16KTA76 (đầu phát Nianfeng) → Cummins (từ "Cummins (USA)" của dòng khác). Đúng tình cờ: baifa KTA/QSK (Cummins, 32) — nay trống ở bản ghi dòng, hãng vẫn có qua bản ghi của NCC khác (`keptMakes`). Đúng luật "thà thiếu".

## 5. Để nguyên và vì sao

| bảng | dòng | vì sao |
|---|--:|---|
| baifa n101 b1 | 25 dòng máy + 8 dòng lẫn | trong tiêu đề có dòng model "TBA" và dòng bắt đầu bằng ô trống (dòng nối của dòng trên): không phân biệt được dòng máy với phần nối → note |
| rcg n120 b18 | 37 | sau dòng máy là dòng tiêu đề lặp lại (bản chữ Hán "| | 型号 | 主电源 …") rồi 16 dòng "| | | | | | PDF" → note |
| visa n101 / n102 / n105 | 1 mỗi bảng | dòng 2 là đèn chiếu sáng ("TORRE FARO VB9 + LED", ô đầu không là mã); dòng S12 không có mã động cơ (ô "undefined") — đọc cũng không ra bản ghi |
| longkai 64, generatordieselchina 2, xinhengxin 3, camda / aosif / keliang / sunkings / taylor | 74 | không phải dòng máy (mảnh bảng nhãn, cặp nhãn | giá trị) — luật không chạm |

Danh sách đủ: `dong-may-lan.tsv` (5 note), `do-a-goc.tsv` (496 dòng quét), `dong-chuyen.tsv` (357 dòng chuyển, từng dòng cho bản ghi nào).

## 6. Lệnh kiểm + đầu ra thật

- `node --test suppliers/*.test.mjs web/test/*.test.mjs` → `# tests 1309 # pass 1309 # fail 0` (8 ca mới: fdk n103, baifa n101 tiêu đề con, simpson n102 / penlucky n108 / elitech n1001, rcg n120 để nguyên + note, longkai mảnh bảng nhãn không chạm, welland trùng chữ → gộp, bdadl / xingguang / honny / yunding / zhengdian tiêu đề Hán).
- `node suppliers/quality.mjs --check` → "--check: không chỉ số nào xấu đi quá ngưỡng."
- `row-flags.mjs --json` gốc ↔ nhánh: 162 → 165. Mới 3: fukangsi n2001 4B3.9-G1 + pengpai n125 4B3.9-G1 `absurd` drop "weight 5500" (nguồn sai, mục 4), zhengdian n104 H16V190ZL `cylMaj` show (nguồn ghi 6 xi lanh). 9 cờ cũ chỉ đổi số đếm số đông (vd "12 × 28" → "12 × 29": thêm phiếu xi lanh từ zhengdian), không cờ nào mất.

## 7. Ba mẫu đối chiếu nguồn (`suppliers/sources/<id>/<n>.md`)

1. fdk-energy n103, URL https://fdkenergy.com/diesel-generator-set-9-3250kva/ — dòng tiêu đề thứ 2 "| CG250-H1 CONTACT | 250KVA/ 200KW | 225KVA/ 180KW | QSL9-G2 | Cummins (USA) | Stamford UCDI274J |" dưới "Standby Power | Prime Power" → động cơ QSL9-G2, đầu phát UCDI274J, standby 250 kVA / 200 kW, prime 225 kVA / 180 kW (dòng 412, sau 412 dòng sẵn có).
2. bdadl-shanghai n104, URL http://www.bdadl.cn/?products_47/89.html — tiêu đề "机组重 量(KG)", dòng "| BDA-C1500 | 1500/1875 | 重庆康明斯 | KTA50-G15 | … | 13000" → khối lượng 13000 kg (8,7 kg/kW).
3. elitech-power n1001, URL https://elitechpower.com/technical-data-center/ — dòng tiêu đề thứ 2 "| EPS18DZA-3 | Deutz | 18kVA | 20kVA | BFM3 G1 |" dưới "Prime Power | Standby Power" → động cơ BFM3 G1 (Deutz), prime 18 kVA, standby 20 kVA.
(Chỉ đối chiếu với trang đã lưu, chưa mở lại trang web gốc.)

## 8. Rủi ro còn lại / chưa làm / quay lui

- **Top 30 CHƯA đo** (theo brief): điều phối đo cloud gốc `671797e4` ↔ nhánh `c977a26b`, để kết quả ở `dau-vao\catalog-a\top30-cloud\`. Dự kiến đổi ở: gói Cummins / Mitsubishi / MTU / Baudouin lớn (fdk, baifa, rcg), Deutz nhỏ (elitech), Weichai (penlucky); khối lượng / tiêu hao mới làm đổi luật loại `khoaRules` / `fuelChecks` ở gói có ngưỡng khối lượng / tiêu hao; hãng mất ở baifa / simpson có thể đổi chỗ dành hãng TQ.
- **Cần quyết (Khoa):** 3 dòng 1.440 kg cho máy 1.600 kW (bdadl n104, fukangsi n2009, pengpai n103: "…LZ1750 | 1600/1750 | 上海菱重 | S16R-PTAA2-C | … | 1440") không chốt nào bắt. Đề xuất: thêm vào `ROW_EXCEPTIONS` một kiểu mới "bỏ khối lượng" (cần Khoa duyệt) hoặc để nguyên.
- **Lỗi có sẵn, không do việc này:** agg-fuzhou "COP (kVA/kW)" đọc thành prime (luật trong CLAUDE.md nói COP không là mức nào) — cả bảng gốc đang đọc vậy, 10 dòng mới theo cùng cách. bdadl / fukangsi / pengpai không đọc được công suất "1600/1750" dưới "输出功率 (KW/KVA)" (có từ trước).
- `useNormCtx` của config-bot lấy dòng thô `t.rows` làm bối cảnh bảng: bản ghi từ dòng chuyển có chữ dòng của chính nó nhưng bối cảnh `rows` không chứa nó; `header` của bản ghi là tiêu đề đã chỉnh. Chỉ ảnh hưởng chuẩn hoá đơn vị khi cần dòng khác của bảng (decimal comma) — không đo được tác động ngoài top 30.
- Màn "Dòng nghi sai" hiện "dòng r.row + 1": dòng chuyển hiện số sau dòng cuối của bảng (không phải vị trí trong trang).
- Quay lui: revert PR #945 (một commit).

## 9. Tệp (`genbid-work\dieu-phoi\dau-vao\catalog-a\`)

- `soat-cuoi.tsv` / `.md`: MỌI bản ghi mới / mất / đổi, cột như `bang-chua-doc-r1\soat-cuoi.tsv` (loai…co, `dong-nguon` = chữ dòng nguồn mọi NCC) + cột cuối `doi` (trường đổi: cũ → mới) — để điều phối chạy lại `chkr1.cjs`. `soat-cuoi-model-to-may-moi.txt` (= `soat-1-…`, 209 khoá).
- `spec-diff-cuoi.txt` / `.md`; `row-flags-goc.json` / `row-flags-nhanh.json`; `hop-ly-1.tsv`; `nhan-doi.tsv`; `dong-chuyen.tsv`; `dong-may-lan.tsv`; `do-a-goc.tsv`, `quet.tsv`.
- Script: `1-quet-tieu-de.cjs`, `2-do-a.cjs`, `3-soat.mjs` (bản của `4-soat-moi.mjs` R1, thêm cột `doi`, tách bản ghi chỉ đổi tiêu đề lưu kèm), `4-nhan.mjs`, `5-hop-ly.mjs`, `6-dong-chuyen.mjs`; `goc\web\catalog.js` = origin/main 671797e4.

## Cần ghi nhớ

- Khoa 19/11 duyệt "Làm" (a) + (b): đã làm ở PR #945.
- Chờ quyết: 3 dòng 1.440 kg (mục 8); đề xuất cơ chế "bỏ một thông số" cho `ROW_EXCEPTIONS`.
- Đề xuất việc riêng (không tự mở): agg-fuzhou "COP" đọc thành prime (cả bảng cũ); bdadl / fukangsi / pengpai không đọc được công suất "1600/1750"; baifa n101 b1 + rcg n120 (62 dòng máy lẫn tiêu đề) cần luật riêng.
