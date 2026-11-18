# Nghiệm thu: Chất lượng 1, chặng 1 (cổng kiểm theo dòng — chỉ phát hiện)

## Cập nhật 18/11/2026 — sửa theo quyết định của Khoa (commit 7bea37c0057889c6415f55c4d10a791c19c68ea3, PR #923)
Khoa quyết (qua điều phối): (1) BỎ "bảng đọc được ít dòng"; (2) số xi lanh lệch số đông: CHỈ HIỆN CỜ; (3) số vô lý: LOẠI khỏi gợi ý, Khoa bấm "cho dùng" khi cần; (4) đảo vai: KHÔNG dùng; (5) NCC quá nửa bảng nghi: điều phối chạy lệnh mỗi lần rà sổ.
- `row-flags.mjs`: xoá hẳn mã `lowRead` và `swap` (không để mã chết; bỏ cả tuỳ chọn `--skip` chỉ dùng cho chúng); thêm `LEVEL = { absurd: "drop", cylMaj: "show" }` và `dropped(f)` (dòng bị loại khi có ít nhất một lý do mức drop); tóm tắt in số bị loại; `--json` ghi thêm `drop`.
- Test: bỏ ca lowRead, thêm ca mức (`absurd` → drop, `cylMaj` → không drop, chỉ hai lý do). `node --test suppliers/row-flags.test.mjs` → `# pass 6  # fail 0`.
- `suppliers/CLAUDE.md`: mục cổng kiểm ghi mức và hai dấu hiệu Khoa bỏ (vì sao, đừng thêm lại).
- Số mới, chạy lại toàn bộ cn (`node suppliers/row-flags.mjs`, gốc 140caccd):
```
bản ghi 58963 (khoá khác nhau 58394), bị gắn cờ 193, trong đó bị loại (mức drop) 51
    51  absurd (drop)  số vô lý so với công suất của dòng
   143  cylMaj (show)  số xi lanh lệch số đông NCC khác
NCC quá nửa số bảng bị nghi:
  huipu-power: 4/6
```
(193 = 51 + 143 − 1 dòng có cả hai: mingbang TAD1642GE.) Soát từng dòng của 51 / 143 như ở dưới, không đổi. Các mục "lowRead", "swap" bên dưới là số của vòng đầu, giữ để biết vì sao Khoa bỏ.

- PR (draft, KHÔNG tự merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/923 — nhánh `chat-luong-1`, gốc `origin/main` 140caccd (đã gồm #910).
- Tệp đổi: `suppliers/row-flags.mjs` (mới), `suppliers/row-flags.test.mjs` (mới), `suppliers/CLAUDE.md` (thêm một mục: cổng kiểm + bẫy).
- KHÔNG đụng `suppliers/config-bot.mjs`, `web/catalog.js`, `web/index.html`; không ghi web; không đo top 30; không sửa dữ liệu NCC.

## (a) Thiết kế (đề xuất cho chặng 2 — mọi thứ dưới đây CHƯA CÓ trừ khi ghi "đã có")

**Cờ lưu ở đâu.** Không lưu: tính lại mỗi lượt Gợi ý cấu hình bằng `flagRows(all)` (row-flags.mjs, đã có ở PR này) trên CHÍNH danh sách NCC mà `prep` của config-bot đã nạp. Vì vậy sau mỗi lượt Tìm Thông Số (bot mở PR dữ liệu → `mergeWhenGreen` → main → workflow `supplier-publish` đăng web — đã có), lượt Gợi ý kế tiếp tự thấy cờ mới, không cần bước nào thêm. Chạy toàn bộ ~20 giây (đo trên máy này, nạp cả config-bot).

**Khoá dòng** (`rowKey`, đã có): `NCC | vai (engine/alternator) | model chuẩn hoá | 12 ký tự sha1 của chữ nguyên văn của dòng` (bảng nhãn: tên tổ máy + mọi dòng của bảng). Không dùng số nguồn `n` / số bảng vì cào lại đánh số lại (test `rowKey` kiểm). Chữ dòng đổi (nguồn cập nhật) → khoá đổi → quyết định cũ không áp, dòng được xét lại (cố ý). Lưu ý: 58.963 bản ghi chỉ có 58.394 khoá: dòng giống hệt chữ ở hai bảng của cùng NCC dùng chung một quyết định.

**Đơn vị loại = cả dòng bảng.** Cờ gắn ở bản ghi (động cơ hoặc đầu phát); chặng 2 loại MỌI dòng ứng viên (`u` của `candidates`) đứng trên cùng NCC + bảng + dòng có ít nhất một bản ghi bị cờ (Khoa: "chặn theo dòng"; dòng sạch cùng NCC vẫn dùng).

**Quyết định của Khoa lưu ở đâu** (CHƯA CÓ, phải làm mới): coll web mới `rowok/<supplierId>` = `{ [rowKey]: { d: "ok" | "drop", by, at } }`, do hai nút trên web ghi (giống cách `supexcl/<id>` đang lưu loại trừ NCC). config-bot đọc coll này cùng lúc với `supexcl` / `supdeleted` (`sup-skip.mjs`, đã có). "Dòng này đúng, cho dùng" = bỏ qua cờ của khoá đó; "Bỏ hẳn" = loại khoá đó kể cả khi cờ mất (vd. sau khi sửa mã đọc). Không ai bấm: dòng có cờ cứ bị loại khỏi gợi ý, hệ thống chạy bình thường.

**Luồng:** Tìm Thông Số → PR dữ liệu → main → đăng web (đã có) → lượt Gợi ý: `prep` nạp NCC → `flagRows` → `candidates` bỏ dòng có cờ (trừ khoá "ok"), bỏ khoá "drop" → kết quả (CHƯA CÓ: phần nối vào `candidates`, chặng 2, khi config-bot.mjs rảnh).

**Màn hình** (CHƯA CÓ, phải làm mới ở `web/index.html` / `web/app.js`, màn Nhà cung cấp): danh sách NCC hiện nhãn "n dòng nghi sai"; màn chi tiết NCC thêm mục liệt kê từng dòng: model, vai, lý do (chữ của `REASONS` + chi tiết, vd. `voltage "1100" (nhãn "额定电压")`), chữ nguyên văn của dòng, link nguồn (URL dòng đầu của `sources/<id>/<n>.md`) và hai nút. Người dùng: Khoa, chỉ khi cần model đó. Web không chạy được row-flags.mjs (cần config-bot); đề xuất: workflow `supplier-publish` chạy `row-flags.mjs --json` rồi đăng thêm coll `rowflags/<supplierId>` để web đọc. CHƯA kiểm cách workflow đó ghi web — chặng 2 xác định.

**NCC quá nửa số bảng bị nghi → sổ điều phối** (CHƯA CÓ ai tự ghi): `row-flags.mjs` in danh sách (`overHalf`). Chưa có tác vụ nào tự ghi vào sổ (sổ là nhánh `dieu-phoi` trên máy, CI không ghi được). Đề xuất: phiên điều phối chạy `node suppliers/row-flags.mjs --skip lowRead` khi rà sổ, hoặc cần Khoa chọn cách khác.

## (b) Phát hiện — số đo thật trên toàn bộ suppliers/cn (gốc 140caccd + nhánh)

Lệnh: `node suppliers/row-flags.mjs` (tóm tắt), `--list <lý do>` (từng dòng), `--skip lowRead`. Test: `node --test suppliers/row-flags.test.mjs` → `# pass 6  # fail 0`.

```
bản ghi 58963 (khoá khác nhau 58394), bị gắn cờ 999
    51  absurd  số vô lý so với công suất của dòng      (52 cặp dòng × số: yongcai QC380D vướng 2 số)
   143  cylMaj  số xi lanh lệch số đông NCC khác
     1  swap  mã đảo vai động cơ ↔ đầu phát
   807  lowRead  bảng có tỉ lệ dòng đọc được thấp
--skip lowRead: bị gắn cờ 194
```

NCC quá nửa số bảng nghi — có `lowRead`: allam-power 12/12, green-power-generators 12/20, hatz 1/1, hechai-changzhou 13/13, hengke-jiangsu 13/13, hengtong-jiangsu 14/14, huipu-power 4/6, kusing-guangzhou 11/11, longhong-foshan 15/15 (trừ huipu, tất cả do `lowRead` nhầm: tờ một tổ máy). Không `lowRead`: chỉ **huipu-power 4/6** (absurd 3 — dung tích "458", "1278" dưới nhãn "Swept volume(L)": nguồn mất dấu chấm; cylMaj 5).

Theo NCC (không `lowRead`, dòng cờ / bản ghi): bdadl-shanghai 26/447, depco-power 26/830, mingbang-mbkl 18/218, xinhengxin-fujian 18/339, aoke-yangzhou 15/172, victory-generator 9/636, yingtai-jiangsu 9/263, huipu-power 8/149, longkai-power 5/1109, 29 NCC khác 1–4 dòng. Bản đầy đủ: chạy lệnh trên.

### Soát HẾT các dòng bị cờ, theo dạng (không lấy mẫu)

Phân ba loại: **A** = mã đọc lệch (lỗi của bộ đọc, cờ đúng); **B** = đọc đúng ô nhưng nguồn tự ghi sai (Khoa 18/11: giữ nguyên dữ liệu, cờ chỉ loại khỏi gợi ý); **C** = số / dòng đúng, cờ nhầm.

**absurd — 52 cặp (51 dòng): A 32, B 18, C 2.**
- A: yingtai n113 điện áp "1100"/"1300" = công suất dự phòng (hàng thiếu ô điện áp) ×6; yingtai n111 "净重" 115.2 = dòng điện ×1; yanfa n107 "排量" 2.5 / 58.8 = tiêu hao (tiêu đề hai tầng) ×2; cgm-italia "kg" 39,6 / 334,4 / 321,2 = kW dự phòng ×3; hosem n1001 "Circuit Breaker Rated Current" 3200 đọc là dòng định mức ×2; mwm n1028 công suất đọc 3,333 thành 3.333 kW (khối lượng 43,100 bị cờ) ×1; yongcai n172 trang nhiều động cơ gán công suất / tốc độ của dòng khác ×2; zhengdian "5 9/54" (chữ OCR) ×1; aosif "Maximum Over Speed" đọc là tốc độ ×2; xinhengxin "Motor Size" (2 số) đọc là kích thước ×12.
- B: mingbang TAD1642GE 4.4 L; aoke MTAA11-G3 "108", 6R1600 "105" (L); huipu "458"/"1278" ×3; jlmech "458" L; jlmech kích thước "30001030*1550" ×2; depco S6B-PTA 12,88 L ở tổ 32 kW (trang 275 kVA tự mâu thuẫn); fdk QSK50 "1107kw" (nguồn ghi) ×2; huatai n111 công suất ô "140/165" cho 700–850GF ×3; jiangchai "7200" A; westinpower "1191" v/p; cameo YC4D105 "35/41".
- C: bruno-generators n101 (tháp đèn, 1050 / 1120 kg thật cho máy 5 kVA) ×2.

Trước khi nới, `checkSpec` chặn 4.310 cặp; các nới và vì sao (đã xem theo nhóm bảng, mỗi bảng ≥ 3 dòng): dòng không công suất (checkSpec trả false khi không có gì để so); "1,963kg" đọc thành 1; dung tích cc / phẩy mơ hồ; tổ cao thế 10,5 / 6,3 kV (honny, yingtai); 220 V 60 Hz (westinpower, xinhengxin, aosif); dòng chỉ ghi standby (sdec: dòng điện theo prime); dòng chỉ ghi kVA (công suất động cơ); động cơ chậm 1000–1450 v/p (jichai 190); dung tích >100 L thật (Yuchai YC16VC 105,56; Weichai WH32 193 / 257; Jichai 6L2632 102); danh sách điện áp "220,230,240". Rủi ro: nới làm lọt dòng lệch tình cờ khớp (vd. changchai 17,3 A cho 12 kW — có thể nguồn lạ, nay KHÔNG bị cờ).

**cylMaj — 143 dòng: B ~140, A 1, chưa rõ 1, C 0 (theo hiểu biết của em về số xi lanh thật của từng động cơ; chưa đối chiếu datasheet hãng).**
- Mọi giá trị thắng số đông khớp số xi lanh thật (KTA50 16, KTA38/KT38 12, QSK38 12, QSK19/KTA19 6, 403A/403D/D226B 3, WP4/4BTA/QSB3.9 4, WP10/WP13/TAD13xx 6, BF8M1015 8, 12M26/12M33 12, 16M33 16 ...). Dòng lệch đều là ô nguồn tự ghi (bảng mẫu TQ: bdadl 26, mingbang 18 — TAD13xx/16xx ghi "4 | 3.3/4.4 | 105*127"; depco trang "Details" ghi "Cylinder | 4" cho WP10/WP13, "6" cho BF8M1015, "8L" cho 4006; comappower tự ghi KTA50-G3 "16" ở COM1375C và "12" ở COM1575C cùng trang).
- A: hosem n134 DP158LD "6 Cylinder In Line" — trang có hai động cơ (DP158LD và QSZ13-G3), số xi lanh thuộc QSZ13.
- Chưa rõ: taihai QTA4320G7 "20" (số đông 16 × 3); không xác minh được.
- Lưu ý: config-bot (#902) đã xét số xi lanh theo số đông, nên dòng loại vì `cylMaj` chủ yếu mất tổ máy / đầu phát / công suất ĐÚNG của dòng đó.

**swap — 1 dòng: C 1.** depco n2102 P158LE-1 đọc là động cơ (đúng: Doosan P158LE), 3 NCC khác đọc là đầu phát (sai, vd. green-power n108 đọc P086TI / P126TI II / P158LE là đầu phát). Dấu hiệu này đang trỏ ngược.

**lowRead — 807 dòng ở 172 bảng: A ~12, đọc đúng ~795 (cờ nhầm ~98%).**
- Nguyên nhân bảng "đọc ít": 78 bảng (448 bản ghi) phần lớn dòng không đọc nằm NGUYÊN VĂN ở bảng khác cùng NCC (`fromSupplier` bỏ dòng trùng: dòng đã đọc ở bảng kia, không mất); 67 bảng (67 bản ghi) là tờ một tổ máy (allam, hechai, hengke, hengtong, kusing, longhong...: dòng nhãn có mã, chỉ một bản ghi); 27 bảng (292 bản ghi) bị bộ đọc bỏ dòng (hậu tố "(国三)", chữ dịch máy...).
- Soát từng bản ghi: 662 có NCC khác đọc cùng model cùng vai (đối chứng); 145 không đối chứng → xem tay hết: sai 9 (eastern-lion n109/n129 dòng tổng quan dòng máy "Engine By Cummins | 22 – 444 kW | 40" đọc thành tổ máy ×4; uleengen n132/n133/n136 đầu phát "224E", "184J", "164B", "164C", "184E" đọc là động cơ / tiêu hao "184J" đọc là đầu phát ×5) + 3 trong nhóm có đối chứng (green-power n108 động cơ Doosan đọc là đầu phát, xem swap).
- Kết luận: tỉ lệ đọc của bảng KHÔNG cho biết dòng đã đọc có sai; nó cho biết dòng bị BỎ (thà thiếu). Danh sách bảng bỏ dòng đã có ở `unread-tables.mjs` (#910).

### Ước tỉ lệ gắn cờ nhầm (C / tổng)
| lý do | dòng | A đọc lệch | B nguồn sai | C nhầm |
|---|---|---|---|---|
| absurd | 51 (52 cặp) | 32 | 18 | 2 (~4%) |
| cylMaj | 143 | 1 | ~140 (+1 chưa rõ) | 0 |
| swap | 1 | 0 | 0 | 1 (100%) |
| lowRead | 807 | ~12 | 0 | ~795 (~98%) |
(đo, không ước — trừ cột B của cylMaj dựa vào hiểu biết số xi lanh thật, chưa đối chiếu datasheet hãng.)

## 3 mẫu đối chiếu với nguồn
1. absurd A — yingtai-jiangsu n113, https://www.yingtaigroup.com/pd43525735.html: dòng `| 1000GF | 1000 | 1100 | 114.3 | 11330 | 6.40×2.04×2.64 | KTA50-G3 |` dưới tiêu đề `功率（KW） | 额定电压 | 电流` (con số 1100 là công suất dự phòng, đọc thành điện áp).
2. cylMaj B — comappower n102, https://comappower.com/product/cummins-powered-genset/: `| COM1575C | 1575kVA | 1260kW | 1375kVA | 1100kW | KTA50-G3 | 12 |` và cùng trang `| COM1375C | ... | KTA50-G3 | 16 |`.
3. absurd A — yanfa-yancheng n107, http://www.yanfapower.cn/product1.asp?Product_ID=1524: `| YC-200GF | 200 | 250 | 180 | 225 | QSL9-G2 | 9 | 231 | 58.8 |` (dung tích 9 L, 58.8 là tiêu hao L/h, bị đọc là dung tích).

## Rủi ro + cách quay lui
- PR chỉ thêm mô-đun và test, không ai gọi tới → không đổi hành vi bot / web. Quay lui: revert PR.
- `absurdOf` có nới: lọt được dòng lệch tình cờ khớp (đã ghi ở trên). `cylMaj` dựa vào `majorityOf` hiện tại; bảng mẫu TQ chép chung có thể tạo "số đông" sai (ở 143 dòng chưa thấy ca nào).

## Chưa kiểm được
- Không đối chiếu datasheet hãng cho số xi lanh (dựa hiểu biết). QTA4320G7 chưa rõ.
- Bản ghi `lowRead` có đối chứng (662): chỉ kiểm model + vai, không kiểm công suất / thông số khác của dòng.
- Không đo top 30 (brief cấm khi chưa hỏi điều phối). Chưa kiểm cách `supplier-publish` ghi web (cho đề xuất coll `rowflags`).

## Câu cần Khoa quyết (viết sẵn để chuyển)
1. **Bảng đọc được ít dòng**: soát hết 807 dòng bị cờ thì ~795 dòng đọc ĐÚNG (bảng trông "đọc ít" vì dòng trùng ở bảng khác hoặc là tờ một tổ máy). Em đề xuất BỎ dấu hiệu này khỏi việc loại dòng (danh sách bảng bỏ dòng đã có ở unread-tables). Anh đồng ý bỏ không?
2. **Số xi lanh lệch số đông**: 143 dòng, gần hết là nguồn tự ghi sai số xi lanh (bảng mẫu TQ), phần còn lại của dòng (tổ máy, công suất, đầu phát) vẫn đúng; Gợi ý cấu hình đã xét số xi lanh theo số đông từ #902. Loại cả dòng khỏi gợi ý (mất ~143 dòng, nhiều nhất bdadl 26, depco 24, mingbang 18), hay chỉ hiện cờ trên màn Nhà cung cấp mà không loại?
3. **Số vô lý**: 51 dòng = 32 đọc lệch + 18 nguồn tự sai + 2 cờ nhầm (tháp đèn bruno). Loại cả 51 khỏi gợi ý như thiết kế, Khoa bấm "cho dùng" khi cần?
4. **Đảo vai**: dấu hiệu này hiện chỉ gắn cờ 1 dòng và là dòng ĐÚNG (P158LE là động cơ Doosan; 3 NCC khác đọc nhầm là đầu phát). Tạm không dùng để loại dòng cho tới khi sửa cách đọc mã Doosan?
5. **NCC quá nửa bảng nghi → sổ điều phối**: chưa có tác vụ nào tự ghi sổ. Để phiên điều phối chạy `row-flags.mjs --skip lowRead` khi rà sổ (hiện chỉ huipu-power 4/6), hay anh muốn cách khác?

## Cần ghi nhớ
- Bẫy (đã ghi `suppliers/CLAUDE.md` trong PR): `checkSpec` áp cho mọi số chặn nhầm nhiều số đúng; `fromSupplier` bỏ dòng trùng giữa bảng làm "tỉ lệ đọc" thấp giả.
- Phát hiện ngoài phạm vi (KHÔNG sửa): green-power-generators n108 đọc động cơ Doosan (P086TI, P126TI II, P158LE) là đầu phát; uleengen n132/n133/n136 đọc đầu phát / tiêu hao là động cơ; eastern-lion n109/n129 đọc dòng tổng quan dòng máy thành tổ máy; hosem n1001 đọc "Circuit Breaker Rated Current" là dòng định mức; aosif đọc "Maximum Over Speed" là tốc độ; xinhengxin "Motor Size" là kích thước; mwm n1028 đọc công suất "3,333" thành 3.333 kW.
- Worktree `wt-chat-luong-1` giữ lại cho chặng 2 (chưa gỡ).
