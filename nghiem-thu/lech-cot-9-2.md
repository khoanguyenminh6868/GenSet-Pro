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

TABLE_CYL

## 3. Bước DỮ LIỆU (O → X)

DATA_PART

## 4. Trả lời 4 câu của điều phối

ANSWERS
