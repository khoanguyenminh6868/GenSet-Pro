# Lệch cột 9, chặng 2: đo top 30 toàn bộ gói (PR #902, luật (d) số đông số xi lanh)

PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/902 (DRAFT, nhánh `lech-cot-9`, commit `e4f66d19`, rebase lên main `b9d4f06d`). Không merge.
Thư mục số liệu: `genbid-work\dieu-phoi\dau-vao\ra-soat-lech-dong-cot\`.

## 0. Hai lần đo ở đâu (gốc cho Chất lượng 3)

| Tệp | Mã (code) | Dữ liệu `suppliers/cn` |
|---|---|---|
| `gop-lech-cot-8.json` | `e0f51ec8` (nhánh lech-cot-8 TRƯỚC rebase; nền main `bb82a3c3` #898) | `e0f51ec8`: tới #898 + dữ liệu của #901 (mecca …); THIẾU #904, #906, #907, #909 |
| `gop-lech-cot-9.json` | `e4f66d19` (nhánh lech-cot-9 = main `b9d4f06d` + PR #902) | `b9d4f06d` (tới #901 và #909) |

- Mã chọn ứng viên của `e0f51ec8` và `b9d4f06d` GIỐNG nhau: `git diff e0f51ec8 b9d4f06d -- suppliers/config-bot.mjs` chỉ đổi phần Tìm NCC (`sameSupplier`, `catalogRecords`, `checkDir`, `findCheck`: #907), không đụng `candidates` / `modelFacts` / `hintsOf`; `web/catalog.js`, `web/bidprice.js` không đổi. #899 chỉ thêm `spec-diff.mjs`.
- Dữ liệu khác (8 tệp): #904 denyo, #906 yanmar, #907 kubota → kubota-japan, #909 starlight-power → xingguang-jiangsu, yingtai-group → yingtai-jiangsu.
- Main hiện tại (`63038d4b`) có thêm #911 (gộp hichai-power vào kaihua-genset) SAU `b9d4f06d`: Chất lượng 3 lấy `gop-lech-cot-9.json` làm gốc thì dữ liệu gốc là `b9d4f06d`, chưa có #911.
- Vì vậy gop 8 → gop 9 = BƯỚC DỮ LIỆU (O: dữ liệu `e0f51ec8`, mã main → X: dữ liệu `b9d4f06d`, mã main) + BƯỚC LUẬT (d) (X → N: cùng dữ liệu, mã nhánh). Đo tách bằng `gopRow.mjs` (ghi từng dòng: trạng thái, điểm, luật loại), mã main ở worktree `wt-lech-cot-9-base` (`b9d4f06d`), dữ liệu cũ chép từ `git show e0f51ec8:suppliers/cn/*`.
- Nhánh chỉ khác main khi HSMT đòi số xi lanh (`hints.minCyl`): `majorityOf` chỉ được gọi trong `below("cyl", hints.minCyl)` và nhánh `cylExact`. `cylKeys.mjs`: 402 / 1.093 lượt có `minCyl` (217 ghi trơ, `cylExact`). 691 lượt còn lại đi đúng đường mã main, nên ở đó N = X.

## 1. Tổng gop 8 ↔ gop 9 (mọi lượt)

1.093 lượt: top giống hệt 854; chỉ đổi thứ tự 68; đổi tập 171 (ra 495 dòng, vào 472). Lỗi 0.

## 2. Bước LUẬT (d): `cylAB.cjs rowCyl-main.json rowCyl-lc9.json winDiff.json` → `cylAB.txt`

402 lượt có minCyl, cùng dữ liệu `b9d4f06d`, main ↔ nhánh: top giống hệt 291; chỉ đổi thứ tự 0; đổi tập 111 (ra 418, vào 391).

| Kết luận | Số |
|---|---|
| Dòng (mọi hạng, cả ngoài top) thêm luật loại `[cyl]` theo số đông, động cơ có nhóm xi lanh trong `winDiff` | 12.572 |
| Dòng đổi khác ngoài thêm `[cyl]` | 0 (14 dòng in "đổi" là ảo của khoá, xem dưới) |
| RA khỏi top: bị loại `[cyl]` theo số đông | 399 |
| RA: bị đẩy, giới hạn mỗi hãng (`MAKE_CAP` 10) | 8 |
| RA: bị đẩy, giới hạn mỗi động cơ (`PER_ENGINE` 3) | 6 |
| RA: bị đẩy, giới hạn mỗi NCC (`PER_SUPPLIER` 4) | 2 |
| RA: bị đẩy, NCC đủ 4 dòng qua suất hãng TQ (`CN_ROWS` 12) | 3 |
| RA: khác | **0** |
| VÀO: lấp chỗ (đã có ở main, ngoài top 30, điểm không đổi) | 391 |
| VÀO: khác | **0** |

- Không dòng nào đổi điểm, không dòng nào được "cứu": luật chỉ thêm loại.
- 19 dòng RA không bị loại là dây chuyền của luật chọn trong `candidates` (`pick`, config-bot.mjs ~1515–1572), điểm của chúng không đổi:
  - Giới hạn động cơ / NCC / hãng: dòng `[cyl]` bị loại nhả suất của NCC / hãng của nó; một dòng điểm ≥ cùng động cơ (hoặc cùng NCC, cùng hãng) vào lấy suất, dòng điểm thấp hơn cùng nhóm hết suất. Vd. IB2200038691: sanq-power `SQD550` DP158LD (8 xi lanh, HSMT đúng 6) bị loại → sanq-power `SQP550` 2506C-E15TAG2 điểm 284 vào → động cơ 2506C-E15TAG2 đủ 3 dòng → uleengen `UP500GF` (281) ra. Đây là "uleengen ra, sanq vào" ở câu 2 của điều phối.
  - `CN_ROWS` (IB2200065274, HSMT ≥ 12 xi lanh): các dòng SDEC SC33W990D2 / SC33W1150D2 (6 xi lanh) bị loại; suất 12 dòng hãng TQ chọn trước lấy thêm các dòng SDEC điểm thấp của fdk-energy (225, 217, 213, 205) → fdk-energy đủ 4 dòng → ba dòng Cummins KTA38G2 / KTA38G2B / KT38GA của fdk-energy (284, đứng #0 #1 #3 ở main) hết suất. Đây là hệ quả của luật chọn sẵn có (CN_ROWS chọn trước, PER_SUPPLIER), không phải lỗi của (d); ghi để điều phối quyết có cần xem lại thứ tự CN_ROWS ↔ PER_SUPPLIER không.
- 14 dòng "đổi" của cooltech-shanghai `PRIME POWER 80KW/100KVA` (14 lượt): hai dòng cùng chữ, khác động cơ (TAD531GE và 6BT59G2) chung khoá `NCC | dòng` của `gopRow`; ở nhánh dòng TAD531GE bị loại `[cyl]` (TAD531GE 4 xi lanh, 4 × 16 NCC; HSMT đòi 6) nên khoá hiện dòng 6BT59G2 (139). Không dòng nào đổi điểm.
- 12 lượt top ngắn lại (không đủ dòng lấp; 418 − 391 = 27 dòng): IB2300054067 30→29, IB2300062472 24→19, IB2300325153 30→29, IB2300374375 30→29, IB2400159665 23→22, IB2400257256 22→14, IB2400475109 14→13, IB2400517601 18→16, IB2400531851 13→11, IB2400617546 18→16, IB2500460613#2 13→11, IB2600588204 19→18.

### 2a. 399 dòng ra do `[cyl]`, gom theo động cơ (`cylGroup.cjs` → `cylGroup.md`)

Giá trị số đông của mọi động cơ dưới đây khớp số xi lanh thật của model (403 = 3 xi lanh, 4BT / QSB3.9 / TAD53x / 4HTAA4.3 / WP4 / YC4A / YD480 = 4, KTA50 = 16, KTA38 / KT38 = 12, DP158 = V8, 8M33 = 8, D226B-3D = 3, còn lại 6). Nguồn ghi khác đều là NCC lẻ ghi sai (cột "Nguồn ghi khác").

Bảng đủ 48 động cơ, mỗi động cơ một dòng: `dau-vao\ra-soat-lech-dong-cot\cylGroup.md`. Mười dòng nhiều nhất:

| Động cơ | Hãng | Xi lanh số đông | Phiếu NCC | Nguồn ghi khác | HSMT đòi | Dòng ra | Lượt |
|---|---|---|---|---|---|---|---|
| 403D15G | Perkins | 3 | 3 × 18, 4 × 1 | depco-power «4» | ≥ 4, đúng 4 | 79 | 33 |
| 403A15G1 | Perkins | 3 | 3 × 13, 4 × 2 | depco-power «4»; huipu-power «4» | ≥ 4, đúng 4 | 38 | 14 |
| 403A11G1 | Perkins | 3 | 3 × 11, 4 × 1 | huipu-power «4» | ≥ 4, đúng 4 | 32 | 14 |
| 403A15G2 | Perkins | 3 | 3 × 13, 4 × 2 | depco-power «4»; huipu-power «4» | ≥ 4, đúng 4 | 27 | 13 |
| 4BTA39G13 | Cummins | 4 | 4 × 6, 6 × 1 | victory-generator «6L» | đúng 6, ≥ 6 | 24 | 12 |
| 403D11G | Perkins | 3 | 3 × 16, 4 × 1 | depco-power «4» | ≥ 4, đúng 4 | 18 | 6 |
| TAD531GE | Volvo Penta | 4 | 4 × 16 | aoke-yangzhou «6» | đúng 6, ≥ 6 | 16 | 14 |
| KTA50G3 | Cummins | 16 | 12 × 3, 16 × 29 | bdadl-shanghai «10»; comappower, huipu-power, mingbang-mbkl, suneco-linyi, xinhengxin-fujian, xinzhengfa, yingtai-jiangsu «12» | đúng 12 | 14 | 5 |
| 4BTAA39G3 | Cummins | 4 | 4 × 4, 6 × 1 | bdadl-shanghai «6» | đúng 6, ≥ 6 | 12 | 12 |
| YD480D | Yangdong | 4 | 3 × 1, 4 × 9 | victory-generator «3» | đúng 3 | 12 | 5 |

Các động cơ điều phối nêu ở câu 2 (đủ trong `cylGroup.md`): 4HTAA43G36 (SDEC, 4 xi lanh, 4 × 6 : 6 × 1 hanyang-weifang «6», HSMT đúng 6, 6 dòng / 3 lượt); D226B3D (3, 3 × 9 : 4 × 1 aoke-yangzhou «4», HSMT đúng 4, 5 / 5); TD226B3D (3, 3 × 8 : 4 × 1 aoke-yangzhou, đúng 4, 4 / 4); DP158LD (8, 8 × 13 : 6 × 1 hosem-power «6 Cylinder In Line», HSMT đúng 6, 8 / 7); SC33W990D2 (6, 6 × 24 : 12 × 3, HSMT ≥ 12 / đúng 12, 11 / 7); QSK19G4 (6, 6 × 15 : 12 × 1 longkai «V 12», HSMT ≥ 10 / ≥ 12, 5 / 3). 2506C-E15TAG2 và YC6K520-D30 KHÔNG có dòng ra do `[cyl]`: xem câu 2 ở mục 4.

## 3. Bước DỮ LIỆU (O → X)

Script: `dataStep.cjs` (theo khoá, mọi lượt), `decomp.cjs` → `decomp.txt`, `pushWhy.cjs`, `orderWhy.cjs`, `allWhy.cjs`. Số liệu từng dòng: `rowDL-cu.json` (mã main `b9d4f06d`, dữ liệu `e0f51ec8`, 172 lượt mà bước dữ liệu đổi top), `rowDL-moi-nocyl.json` (dữ liệu `b9d4f06d`, 87 lượt trong đó không có minCyl), `rowCyl-main.json` (85 lượt còn lại). Lượt gopRow dữ liệu cũ đầu tiên bị ngắt khi máy mất kết nối 16:17; đo lại 16:30 (đã báo điều phối).

Kiểm khớp: top của O (mã main, dữ liệu cũ) = top của `gop-lech-cot-8.json` ở cả 172 lượt, top của N = `gop-lech-cot-9.json` (0 lỗi). Vậy mã `e0f51ec8` ↔ `b9d4f06d` cho cùng kết quả trên cùng dữ liệu, như diff mã đã cho thấy. Bẫy công cụ: khoá `gopRow` là `NCC | dòng`, nên hai dòng cùng chữ khác động cơ / đầu phát gộp làm một. Ở 68 lượt có khoá trùng trong top, chỉ so được TẬP, không so được thứ tự.

Thay đổi dữ liệu theo NCC (`catDiff.mjs` → `catDiff.txt`; dòng danh mục = động cơ | dòng, mọi bản ghi): 46.537 → 46.376 (−161).

| NCC | Dòng | PR | Ghi chú |
|---|---|---|---|
| yingtai-group | 162 → 0 | #909 | 162 dòng đều TRÙNG HỆT dòng có sẵn của yingtai-jiangsu (cùng động cơ, cùng chữ): xoá là mất hẳn |
| starlight-power | 348 → 0 | #909 | chuyển nguyên sang xingguang-jiangsu (351 → 699); xingguang nhận thêm 2 bộ điều khiển |
| kubota | 1 → 0 | #907 | gộp vào kubota-japan (dòng của kubota không thêm vào kubota-japan) |
| denyo | 32 → 33 | #904 | +1 dòng |
| yanmar | 0 → 1 | #906 | +1 dòng |

Bước dữ liệu O → X, 1.093 lượt: top giống hệt 921; chỉ đổi thứ tự 102; đổi tập 70 (ra 80, vào 81).

| Dòng ra / vào (70 lượt đổi tập) | Số | Cơ chế |
|---|---|---|
| RA starlight-power, VÀO cùng dòng mang id xingguang-jiangsu | 40 / 40 | đổi id (gộp #909), cùng điểm; khoá do-gop có NCC nên tính là ra + vào |
| RA bị đẩy bởi dòng xingguang-jiangsu lên điểm | 15 | xem dưới |
| RA bị đẩy bởi dòng mới của dữ liệu (denyo 14, yanmar 1 vào) | 14 | dòng denyo `88/110KVA` mới (#904) |
| RA hoà điểm ở ranh giới hạng 30 | 11 | dòng ra và dòng vào cùng điểm; thứ tự danh mục đổi (bỏ dòng yingtai-group, chuyển dòng starlight) nên `rows.sort` (ổn định) xếp dòng kia lên trước. Vd. IB2200049404: eastern-lion-fuan `GF/GFSYC320` YC6K520D30 ↔ bobig-power `BWC413` WP13D405E200, cùng 269, hạng #29 |
| VÀO dòng xingguang-jiangsu lên điểm | 14 | |
| VÀO dòng mới (denyo 14, yanmar 1) | 15 | |
| VÀO lấp chỗ, điểm không đổi | 12 | |
| Dòng ra / vào khác | **0** | |

Mọi đổi điểm ở bước dữ liệu (172 lượt): CHỈ dòng xingguang-jiangsu, 345 dòng +50 và 27 dòng +250. Không NCC nào khác đổi điểm. Hồ sơ xingguang-jiangsu nhận `controllers` (2) của starlight-power, nên mọi dòng của nó có `offers`:
- +50: `if (offers.length) score += 50` (config-bot.mjs ~1405). Khoản này KHÔNG ghi `why`, nên trong lý do không thấy.
- +250: thêm +200 "có bộ điều khiển hãng HSMT nêu", ở gói có nêu hãng bộ điều khiển (IB2500380933, IB2400607862, IB2400425513, IB2400237184 …).

Vd. IB2200005266 (ZH490D, điều phối hỏi): HSMT ≥ 4 xi lanh nhưng (d) không đổi gì ở lượt này. Dòng xingguang-jiangsu `XG10GF` ZS1100 lên 90 → 140, vào top; landtop-fuzhou `LTP14R` ZH490D bị đẩy ra. `all` / `dropped` không đổi vì không có dòng nào mất hay bị loại.

## 4. Trả lời 4 câu của điều phối

**Câu 1. "all" giảm mà "dropped" không tăng tương ứng: do dữ liệu, không do (d).**
- (d) không bao giờ làm mất dòng. Nó chỉ chuyển dòng từ all sang dropped: ở 402 lượt có minCyl, 12.572 dòng thêm `[cyl]`, 0 dòng đổi khác. Ở 691 lượt không có minCyl, mã nhánh = mã main.
- Dòng biến mất hẳn là dòng của yingtai-group, xoá ở #909 vì trùng hệt yingtai-jiangsu.
- Kiểm từng dòng ở 87 lượt không minCyl có gopRow cả hai bộ dữ liệu (`allWhy.cjs`):
  - Ở MỌI lượt, all giảm đúng bằng số dòng yingtai-group trong all của gốc; dropped giảm đúng bằng số dòng yingtai-group bị loại ở gốc. Vd. 8 lượt all −14 / dropped −6 ↔ yingtai-group all 14 / dropped 6; 5 lượt −20 / 0 ↔ 20 / 0.
  - Các lượt +1 / +2 là dòng mới của denyo / yanmar.
  - Không NCC nào ngoài 8 tệp dữ liệu đổi số dòng (87 / 87).
- Trên cả 1.093 lượt (gop 8 → X, theo khoá): all giảm 804 lượt (−1 … −27), tăng 21 (+1, +2), giữ 268. Với lượt có minCyl, số này còn cộng phần (d) chuyển all → dropped.
- Theo NCC / tệp: bảng `catDiff` ở mục 3 (yingtai-group −162, kubota −1, denyo +1, yanmar +1; starlight-power 348 chuyển id sang xingguang-jiangsu).
- Chưa kiểm từng dòng ở 921 lượt mà bước dữ liệu không đổi top (không có gopRow dữ liệu cũ cho chúng). Ở đó all giảm theo cùng cơ chế (dòng trùng bị xoá), nhưng chưa đối chiếu bằng số từng lượt.

**Câu 2. Mỗi dòng RA truy về đâu.** gop 8 → 9: 171 lượt đổi tập, 495 dòng ra. Tách hai bước:
- Bước luật (d), 418 dòng ra / 111 lượt (mục 2):
  - 399 dòng bị loại `[cyl]` theo số đông. Bảng theo động cơ ở mục 2a: số xi lanh thắng, phiếu NCC, NCC ghi khác, yêu cầu của gói. Mọi giá trị thắng đúng với model thật.
  - 19 dòng bị đẩy theo luật chọn sẵn có (động cơ 6, NCC 2, hãng 8, CN_ROWS 3), điểm không đổi.
  - 2506C-E15TAG2 (uleengen `UP500GF` ra, sanq `SQP550` vào) là ca PER_ENGINE: sanq-power `SQD550` DP158LD bị loại `[cyl]` → `SQP550` (284) vào → 2506C-E15TAG2 đủ 3 dòng → uleengen (281) ra.
- Bước dữ liệu, 80 dòng ra / 70 lượt (mục 3):
  - 40 đổi id starlight → xingguang.
  - 15 bị đẩy bởi dòng xingguang lên điểm (+50 / +250, bộ điều khiển nhận từ starlight). Vd. ZH490D ở IB2200005266.
  - 14 bị đẩy bởi dòng mới denyo / yanmar.
  - 11 hoà điểm ở hạng 30. YC6K520-D30 thuộc nhóm này: eastern-lion-fuan `GF/GFSYC320` ra ở 9 lượt, fdk-energy `Y413V1` ở 1 lượt (IB2400026437); không có dòng YC6K520D30 nào bị loại `[cyl]`.
  - Dòng thứ 11 của nhóm hoà điểm là dingbo `XG380GF` TAD1650GE (IB2600374560).
- Các nhóm điều phối nêu: 403D-15G / 403A-15G1 / G2 / 403A-11G1, 4BTA3.9-G13, 4BTAA3.9-G3, 4HTAA4.3-G36, D226B-3D / TD226B-3D, TAD531GE, DP158LD đều là `[cyl]` (mục 2a).
- Tổng hai bước (418 + 80 = 498) hơn 495 dòng ra của gop 8 ↔ 9 đúng 3 dòng: 3 dòng ra ở bước dữ liệu rồi vào lại ở bước luật (lấp chỗ dòng `[cyl]`), nên gop 8 ↔ 9 không thấy (`sum3.cjs`: 80 + 418 − 3 = 495; 0 dòng vào ở bước dữ liệu rồi ra ở bước luật).
- Không còn dòng RA nào chưa giải thích.

**Câu 3. Mỗi dòng VÀO.**
- Bước luật: 391 dòng, tất cả lấp chỗ (đã có ở main, hạng 31+, điểm không đổi). 12 lượt top ngắn lại vì không đủ dòng lấp.
- Bước dữ liệu: 81 dòng.
  - 40 cùng dòng mang id xingguang.
  - 15 dòng mới (denyo 14, yanmar 1).
  - 14 dòng xingguang-jiangsu lên điểm (+50 / +250).
  - 12 lấp chỗ, điểm không đổi.
- Không dòng VÀO nào đổi điểm ngoài 14 dòng xingguang (do dữ liệu, không do (d)).

**Câu 4. Đổi thứ tự khi không dòng nào bị loại** (68 lượt gop 8 ↔ 9; ở bước dữ liệu 102 lượt, bước luật 0 lượt).
- (d) không gây đổi thứ tự: 0 / 402 lượt.
- Bước dữ liệu, 102 lượt:
  - 51 lượt: đổi chỗ trong nhóm cùng điểm (dãy điểm của top 30 giữ nguyên). `rows.sort((x, y) => y.score - x.score)` ổn định, nên dòng cùng điểm theo thứ tự danh mục. Thứ tự này đổi khi xoá dòng yingtai-group và chuyển dòng starlight sang xingguang (động cơ / dòng được nạp ở chỗ khác trong `CAT.build`).
  - 25 lượt: một dòng xingguang-jiangsu lên điểm (+50) nhảy hạng trong top. Vd. IB2300204696 `XG100GF` 6105AZLD lên #8, IB2300305914 `XG8GF` ZS195 lên #16. Các ví dụ IB2200006257#1, IB2200012797, IB2200016199 có xingguang-jiangsu trong nhóm đổi chỗ.
  - 26 lượt: có khoá NCC | dòng trùng trong top. gopRow không cho thứ tự thật nên chưa giải thích tới từng vị trí; tập top giống nhau.

## 5. Để điều phối quyết

1. **CN_ROWS chọn trước rồi mới tới PER_SUPPLIER** (`candidates`, `pick`; IB2200065274, HSMT ≥ 12 xi lanh).
   - Khi dòng TQ bị loại, suất 12 dòng hãng TQ lấy tiếp dòng TQ điểm thấp. Một NCC (fdk-energy) lấy liền 4 dòng SDEC (225 / 217 / 213 / 205), đủ PER_SUPPLIER 4.
   - Vì thế ba dòng Cummins KTA38G2 / KTA38G2B / KT38GA điểm 284 (hạng #0 #1 #3 ở main) của chính NCC này hết suất.
   - Đây không phải lỗi của (d); (d) chỉ làm lộ ra. Có muốn PER_SUPPLIER ưu tiên dòng điểm cao của NCC (hoặc CN_ROWS không tính vào PER_SUPPLIER) không?
2. **+50 điểm "có bộ điều khiển" không ghi `why`** (`if (offers.length) score += 50`). Gộp starlight-power vào xingguang-jiangsu (#909) làm 372 dòng xingguang đổi điểm mà lý do không đổi. Có muốn ghi lý do cho khoản này không?
3. **Bẫy công cụ:** khoá `gopRow.mjs` là NCC | dòng nên gộp hai dòng cùng chữ khác động cơ / đầu phát (cooltech-shanghai TAD531GE / 6BT59G2; 68 lượt có khoá trùng trong top). Phiên sau dùng gopRow nên đổi khoá thành NCC | động cơ | dòng như `do-gop.mjs`.
4. Gốc cho Chất lượng 3: `gop-lech-cot-9.json`, mã = main `b9d4f06d` + #902 (nay là `b797f746`), dữ liệu `b9d4f06d`. Main hiện tại có thêm #911 (hichai-power → kaihua-genset), chưa có trong gốc này.
