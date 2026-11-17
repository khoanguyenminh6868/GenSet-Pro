# Nghiệm thu cfg-r4 — hai quy tắc Khoa duyệt 11/11 ("ok làm đi")

PR (DRAFT, chưa merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/532 — nhánh `cfg-r4`, commit 34a3afb, đã rebase trên origin/main 0a83c7a (gồm #530 CTL_WORDS, #531). Worktree `C:\Projects\GenSet Pro\wt-cfg-r4`.

## Tệp đổi
- `suppliers/config-bot.mjs` (+92 / −2): `modelFacts` gắn cờ `sheet`; hàm mới `makerSheetChecks` (gọi trong `check()` ngay sau `altAttrChecks`); nhánh (A) trong `khoaRules`; hằng `START_COOL`, `NOT_STATED`, `AMBIENT_ROW`, `SHEET_KEY`, `SHEET_CMP`, `SHEET_CLASS`, 2 câu mới trong `RULE_NOTE`. Không đụng vùng `CTL_WORDS`. Không đổi `REQ_VERSION`, `reqcodes.mjs`, web.
- `suppliers/cfg-r4.test.mjs` (mới, 11 test).

## Lệnh kiểm + đầu ra thật
- `cd suppliers && node --test` → `# pass 247  # fail 0` (sau rebase).
- `node suppliers/verify.mjs` → `433 bản ghi, 0 có lỗi`.
- Không chạy agent, không ghi web / Supabase, không đụng `genbid-hsmt\`, không sửa ở checkout bot.

## Quy tắc như đã làm
### A — khởi động / làm mát (`khoaRules`, rule `khoi-dong-lam-mat`)
Mã `starting` / `cooling`, check đang "chưa rõ" (không conflict / version / nhóm) hoặc chưa có check → xác nhận khi đặt hàng (confirm, order), `why` "ắc quy, bộ sạc, két nước, quạt chọn theo đơn hàng", ghi chú "nguồn của cấu hình không ghi điểm này; ắc quy, bộ sạc, két nước và quạt do nhà lắp ráp chọn theo đơn hàng (Khoa 11/11)". Giữ `offered` / `sourceQuote` của agent.
Không áp khi nguồn CÓ ghi:
- dòng bảng có số `start` / `cooling` (catalog.js), hoặc chữ trên dòng / tiêu đề cột / tên bảng: khởi động (start, khởi động, đề điện/đề 24, ắc quy, battery, charger, bộ sạc, 启动, "24V DC"…); làm mát (cool, radiator, làm mát, két nước, quạt, fan, 冷却 / 水冷 / 风冷 / 水箱…). "Water Cooled" ở tên bảng → coi là có ghi, giữ chưa rõ;
- agent có `sourceQuote`, có chữ số trong `offered`, hoặc `offered` khác các câu "nguồn không ghi / chưa ghi / không có nguồn ghi / chưa rõ / (trống)";
- cấu hình không có dòng bảng của mình (nguồn internet / dòng không còn) → giữ nguyên (cùng khuôn #523).
Làm mát kèm nhiệt độ ("két nước + quạt, nhiệt độ môi trường ≥ 50°C"): có yêu cầu `ambient` riêng → phần nhiệt độ xét ở đó (quy tắc vỏ máy), ghi chú trỏ sang; không có yêu cầu ambient riêng mà dòng ghi °C / ambient → giữ nguyên (quy tắc ambient không so số); không ghi → confirm cùng két nước, ghi chú nói thêm nhiệt độ. Không đếm hai lần.
Mã khác (engine_type, governor, fuel_system, emission, aspiration, speed) không đổi (có test).

### B — nguồn ghi khác nhau → theo tờ hãng (`makerSheetChecks`, rule `to-hang`)
- `modelFacts`: fact có `sheet: true` khi (1) bảng của NCC role `engine_maker` / `alternator_maker` mà tên bảng nêu đúng một mã và mã đó có trong danh mục (không tính tờ của khung TAL-A46 chia cho các model con), hoặc (2) dòng bảng của NCC role đó (khóa danh mục = mã chính xác). "Datasheet:" của nhà lắp ráp / genset_oem (vd. Wintpower, gfe-power) KHÔNG tính. Không khớp gần tên.
- Áp cho check "chưa rõ" (kể cả conflict) hoặc chưa có, mã: compression, displacement, cylinders, governor, aspiration, alt_insulation, alt_efficiency. Điều kiện: có tờ hãng; các tờ hãng không khác nhau; có ít nhất một nguồn khác (không phải tờ hãng) ghi khác → so giá trị tờ hãng với HSMT → đạt / không đạt. `offered` = giá trị tờ hãng, `sourceQuote` + `factSrc` = dòng tờ hãng, `makerOver` = id nhà lắp ráp ghi khác, ghi chú "Code ghi: các nguồn ghi khác nhau; theo tờ thông số hãng (<id> [n]); trang nhà lắp ráp <id> ghi khác." (không trích nguyên văn, #527).
- Không so: tỉ số nén không có ≤ / ≥; số xi lanh kèm kiểu bố trí; điều tốc không nói điện tử / cơ khí ("có bộ điều tốc tự động"); emission và mã khác → giữ chưa rõ.
- "Khác nhau" do code tự đọc: cấp cách điện so chữ cấp (B/F/H/C); tỉ số nén so số đầu (bỏ ":1"); còn lại như `disagree`.
- Đạt / không đạt có sẵn giữ nguyên. Chạy `check()` lần hai: check của B về lại "đạt" (code cũ gắn conflict → B gỡ lại); đã thử chạy check hai lần trên 44 cấu hình: 0 khác biệt ở check của A/B (7 khác biệt có sẵn, không thuộc hai quy tắc).

## Đo (ĐO, không ước)
Cách đo như cfg-r3 (script `base.mjs`/`cmp.mjs`/`rfqcmp.mjs` chép sang scratchpad `…\f009e721-…\scratchpad\r4\`): 12 configmatch trong `genbid-work\doc-cache\configmatch.json` (chụp 11/11, bản tệp 10/11 17:59) + `supplier.json` (chụp, bản 11/11 16:25), chạy `check()` + `rankConfigs` + `rfqOf`, không gọi agent. 44 cấu hình (cfg-r3 đo 48: main sau đó có #524–#526 bỏ bớt cấu hình). Nền = origin/main 0a83c7a; sau = 34a3afb (cùng nền + commit này).

### "Chưa rõ" theo phần
| phần | nền | sau |
|---|---|---|
| tổ máy | 174 | 174 |
| động cơ | 261 | 225 |
| đầu phát | 158 | 158 |
| bộ điều khiển | 87 | 87 |

### "Chưa rõ" theo mã (chỉ mã đổi)
| mã | nền | sau |
|---|---|---|
| starting | 31 | 8 |
| cooling | 18 | 6 |
| governor | 19 | 18 |
Số điều phối đo sơ bộ (starting 34, cooling 22) lệch vì lọc từ khoá; số trên theo mã yêu cầu của code.

### Mọi check đổi trạng thái (nền → sau)
| loại | số |
|---|---|
| starting chưa rõ → xác nhận khi đặt hàng | 23 |
| cooling chưa rõ → xác nhận khi đặt hàng | 12 |
| starting (chưa có check) → xác nhận khi đặt hàng | 3 |
| cooling (chưa có check) → xác nhận khi đặt hàng | 4 |
| governor chưa rõ → **đạt** (quy tắc B) | 1 |
| → không đạt | **0** |
Danh sách từng check: scratchpad `r4\changes2.json`.
- Gói có đổi (A): IB2600574589 #1–#4 (cooling #1–#3), IB2600581294 #1–#6, IB2600581977 #1–#4, IB2600586587 #3–#6, IB2600592684-1 #1–#2, IB2600592684-2 #1–#3, #5, IB2600594596-2 #1, #3, #4, IB2600602880 #1 (cooling).
- Đạt mới (B): IB2600594596-1 #3 WP10D320E200, "Bộ điều tốc" HSMT "Điện tử" → Electronic Governor theo tờ weichai-power [113]; acepow-fuan [104] ghi khác.

### Không mất
- **0 "không đạt" mất.**
- Bảng câu hỏi NCC (`rfqOf`): 44 cấu hình, 974 → 973 điểm; 1 bớt do thành đạt (governor ở trên), **0 điểm mất**. 42 check confirm của A đều nằm ở tầng 4 "Xác nhận khi đặt hàng".

### Thứ hạng `rankConfigs` đổi — 1 gói: IB2600586587
| cấu hình | trước | sau |
|---|---|---|
| 1106A-70TAG4 + UCI274G + HGM6120N | #1 | #1 |
| 1106A-70TAG4 + UCI274H + HGM6120CAN | #2 | #4 |
| YC6A275-D30 + NIANFENG NF274H + HGM6120CAN | #3 | #2 |
| WP10D200E200 + NIANFENG NF274H + HGM6120CAN | #4 | #6 |
| YC6A275-D30 + EL 274H + Smartgen 6120 | #5 | #3 |
| 6CTAA8.3-G2 + UCI274H + HGM6120CAN | #6 | #5 |
Lý do: #1, #2 (1106A) đã có starting/cooling "đạt" từ nguồn; các cấu hình khác bị 2 "chưa rõ" động cơ ở hai mã này, nay thành confirm (không bị phạt khi xếp) → số chưa rõ động cơ giảm, cấu hình động cơ TQ (tie-break `cnOf`) lên trên 1106A + UCI274H. Đây là hệ quả trực tiếp của quy tắc (confirm ngang với đạt khi xếp hạng) — điều phối xem có chấp nhận không. 11 gói khác không đổi.

## Đo trước quy tắc B — số ca thật
Duyệt mọi model động cơ / đầu phát của 44 cấu hình (`factConflicts` + vai trò NCC): nguồn khác nhau có dính tờ hãng chỉ ở
- weichai-power (engine_maker): governor WP10D200E200, WP10D320E200 ("Electronic Governor" vs Mechanical của acepow-fuan / jet-power); emission WP13D490E310, WP10D200E200, WP10D320E200 ("Non-Road Emission Exempt" vs T2/T3/国Ⅱ) — các cấu hình này không có check emission;
- stamford-avk-china (alternator_maker): vreg UCI274G/H, UCDI274K (tờ có hai mức ±0,5 / ±1,0% → hai giá trị tờ hãng, không áp; vả lại do `vregChecks`), insul (CLASS H vs H — cùng giá trị, xem "Lỗi phát hiện"), eff (westinpower 38,0 — số rác, không có check).
→ **1 ca thật đổi trạng thái** (IB2600594596-1 #3 governor). IB2600586587 #4 governor ("Có bộ điều tốc tự động") không so được → giữ. Ví dụ tỉ số nén Cummins 16.8:1 / aosif 17.3:1: không có trong dữ liệu đo (0 cặp tỉ số nén khác nhau có tờ hãng ở model của 44 cấu hình); có test riêng.

## Mẫu đối chiếu tay (nguyên văn trong `suppliers/sources/`)
### A
1. IB2600574589 #1 (6ETAA12.8-G21 + JET444F), HSMT "24 VDC" và "Két nước + quạt đầu trục, nhiệt độ môi trường ≥ 50°C" (không có yêu cầu ambient riêng): nguồn jet-power [101] (URL dòng 1 https://www.jetgenset.com/50hz-16kva-to-2500kva-sdec-diesel-generator-set.html), dòng 205 "| SD-440 | 440 | 352 | 400 | 320 | 6ETAA12.8-G21 | 6L | 130×161 | 12.8 | 190 | JET444F" — không có đề / ắc quy / két nước / °C → cả hai confirm order (cooling kèm ghi chú nhiệt độ). Chữ "Water Cooled Generator" dòng 11/48/72 là menu trang, không thuộc bảng (catalog không đưa vào tiêu đề bảng).
2. IB2600592684-2 #1 (QSZ13-G3 + HCI544C), HSMT "DC 24V", "Két nước kết hợp quạt gió": nguồn uleengen [103] (https://www.uleengen.com/500-1000kva-diesel-generator/), dòng 114 "| UC500GF | 400 | 500 | QSZ13-G3 | Cummins | 450 | 6.L | 130×163 | 13 | 93.5 | HCI544C | 3300x1460x2100 | 3550" — dòng không ghi → confirm. Đáng chú ý: dòng 167 cùng trang (mô tả chung, không thuộc dòng) ghi đề 12V/24V và két nước 40/50 °C "at your choice" → đúng tinh thần "chọn khi đặt hàng".
3. Không áp: IB2600574589 #4 (WP13D385E200) cooling — jet-power [135], tên bảng "WEICHAI Water Cooled Diesel Generator Wholesale | Jet Power" → giữ chưa rõ. IB2600592684-2 #4/#5 (yongcai-elecmama [117]) tiêu đề "50HZ 1500rpm Water-cooled Cummins Diesel Engine…" → giữ.
### B
1. Áp: IB2600594596-1 #3 WP10D320E200, HSMT "Điện tử". weichai-power [113] (URL en.weichaipower.com…, dòng 1): khối dòng 383–389 "WP10D320E200 | 6 | 126×130 | Electronic Governor | Non-Road Emission Exempt" (catalog đọc thành dòng "| WPG350*8 | 1500 | 350/280 | 320/250 | WP10D320E200 | 6 | 126×130 | Electronic Governor | Non-Road Emission Exempt"). acepow-fuan [104] (http://www.acepow.net/sale-13598301-…html) dòng 142 "| APW-250 | … | WP10D320E200 | 290 | 363 | 1#11.5-136 | T2 | Mechanically" và dòng 143 cùng model "… | T2 | Electronic" → nhà lắp ráp chào cả hai bản; theo tờ hãng → đạt.
2. Không áp: IB2600586587 #4 WP10D200E200, HSMT "Có bộ điều tốc tự động": weichai-power [113] "Electronic Governor" vs acepow-fuan [104] dòng 134 "| APW-150 | … | WP10D200E200 | … | Mechanically" → yêu cầu không phải điện tử / cơ khí → không so, giữ chưa rõ.
3. Không áp: IB2600586587 #2/#6 UCI274H, cách điện: stamford-avk-china [1012] "CLASS H" vs fdk-energy [1011] "H" — cùng cấp, không phải mâu thuẫn → quy tắc B không áp (vẫn chưa rõ do lỗi dưới).

## Lỗi phát hiện ngoài phạm vi (KHÔNG sửa, chờ điều phối)
1. `disagree` / `factConflicts` coi "H" và "H" (hay "CLASS H" và "H") là **khác nhau**: `sigOf` bỏ từ 1 ký tự nên cả hai không có từ → `!x.words.some(...)` = true. Hậu quả đo được: alt_insulation "chưa rõ (nguồn khác nhau)" ở IB2600581977 #4 (HCI444E: gb-power H / shanhua H), IB2600586587 #2, #6 (UCI274H), IB2600592684-2 #1, #4 (HCI544C: gb-power H / shanhua H). Sửa đúng (so chữ cấp) có thể thêm ~5 "đạt".
2. `disagree` coi "16.8:1" và "17.3:1" là **giống nhau** (cùng số 1; và 16,8/17,3 chỉ lệch 2,9% < 3% làm tròn) → tỉ số nén khác nhau không bao giờ thành "nguồn khác nhau". Quy tắc B tự so số đầu nên không dính; phần còn lại của code vẫn dính.

## Rủi ro + quay lui
- A: nhận "nguồn có ghi" bằng chữ; nhà lắp ráp ghi bằng từ khác (vd. chỉ "WC") sẽ bị confirm thay vì so → có thể che một "không đạt" (vd. dòng ghi đề 12 V mà HSMT đòi 24 V nhưng không chữ nào khớp). Đề 12/24 V và két nước thường chọn theo đơn nên rủi ro thấp.
- A làm đổi thứ hạng (1 gói): cấu hình có số liệu "đạt" mất lợi thế so với cấu hình nguồn không ghi.
- B: "đạt" theo tờ hãng khi nhà lắp ráp chào bản khác (acepow có bản Mechanically) — hàng giao thực tế phụ thuộc bản chọn; ghi chú có id nhà lắp ráp ghi khác. Tờ hãng phải là NCC role engine_maker / alternator_maker: nếu role sai trong CSDL (vd. agestar ghi alternator_maker nhưng có số động cơ) thì chỉ ảnh hưởng đúng phần (động cơ cần engine_maker) nên agestar không thành tờ hãng động cơ.
- Quay lui: revert commit 34a3afb (một commit, độc lập). Trường mới `rule` ("khoi-dong-lam-mat" / "to-hang"), `makerOver`, `sheet` trên fact bị web cũ bỏ qua. Sau merge phải chờ tiến trình `config-bot.mjs run` thoát / restart bot (bẫy code cũ). Kết quả configmatch cũ chỉ đổi khi Gợi ý / check lại.

## Việc chưa kiểm
- Chưa chạy agent thật; chưa xem web hiển thị ghi chú mới (dùng sẵn `note` / `why`).
- Ví dụ tỉ số nén Cummins / aosif chỉ có trong test (0 ca trong dữ liệu đo).
- Không xem lại prompt agent (`config-prompt.md`): agent vẫn ghi "nguồn khác nhau → chưa rõ"; code sửa sau.

## Sửa theo điều phối (commit afa414f, cùng PR #532)
1. **Quy tắc B chặn theo NCC của cấu hình** (`makerSheetChecks`): nếu một nguồn ghi khác tờ hãng là của chính NCC cấu hình (supplierId của `src` engine / alternator / genset, hoặc trong `c.suppliers`) → giữ "chưa rõ", `makerBlocked` = id, ghi chú "tờ thông số hãng (<id> [n]) ghi khác nguồn của chính nhà cung cấp <id> trong cấu hình; nhà cung cấp có thể giao bản khác nên chưa theo tờ hãng, cần xác nhận" (chỉ id, không trích; chạy lại không nhân đôi ghi chú). Chỉ xét sau khi giá trị tờ hãng so được với HSMT (không ghi chú vào check mà quy tắc không quyết).
   - Ca thật IB2600594596-1 #3 WP10D320E200: dòng của cấu hình là uleengen [101] (`suppliers` chỉ uleengen), acepow-fuan không thuộc cấu hình → **vẫn đạt** theo weichai-power [113]. Đã xác nhận trên số đo.
2. **`disagree`: cấp cách điện** — giá trị chỉ là một chữ cấp B/F/H/C (có/không kèm "class / cấp / loại") so theo chữ cấp. Giá trị có chữ khác (vd. "CLASS H, 125 °C rise") vẫn theo cách cũ.
3. **`disagree`: tỉ số x:1** — khi ít nhất một bên dạng "x:1" và bên kia "x:1" hoặc số trần → so x đúng bằng, không dung sai 3% (16.8:1 ≠ 17.3:1; 17:1 = 17.0:1; số trần "17.3" vs "16.8:1" khác). Đại lượng khác giữ dung sai 3% (test: 12.5 / 12.54 L vẫn trùng).
- Test mới: 2 (chặn B; disagree); test tích hợp B sửa lại để nguồn ghi khác là NCC ngoài cấu hình. `node --test` **249 pass, 0 fail**; `verify.mjs` **433 bản ghi, 0 lỗi**. Đã rebase origin/main (không có commit mới).

### Đo lại (cùng cách, cùng bản chụp; nền = origin/main 0a83c7a, sau = afa414f)
| phần | nền | sau (34a3afb) | sau (afa414f) |
|---|---|---|---|
| tổ máy | 174 | 174 | 174 |
| động cơ | 261 | 225 | 225 |
| đầu phát | 158 | 158 | **153** |
| bộ điều khiển | 87 | 87 | 87 |
alt_insulation chưa rõ 29 → 24. Thứ hạng: như trước (chỉ IB2600586587, cùng 5 dòng đổi), sửa 2–3 không đổi thêm thứ hạng nào. Bảng câu hỏi NCC: 974 → **968**, 6 bớt do thành đạt (5 cách điện + 1 điều tốc), **0 điểm mất**; 42 confirm của A vẫn ở tầng 4. **0 "không đạt" mất.**

### Check đổi do sửa 2 (cách điện) — 5, đều "chưa rõ (nguồn khác nhau)" → "đạt"
Cả 5 là check agent đã ghi "đạt" có `factSrc` hợp lệ (dòng thông số của đúng model đầu phát), code cũ hạ vì coi "H"/"H" là mâu thuẫn; mỗi model có ≥ 2 nguồn cùng cấp H.
| gói / cấu hình | đầu phát | HSMT | nguồn agent trích (id [n], dòng nguyên văn) | nguồn khác cùng H |
|---|---|---|---|---|
| IB2600581977 #4 (TAD1352GE) | HCI444E | Loại H | shanhua [1040] dòng 104 "\| 绝缘等级 Insulation Class \| H" | gb-power [1021] dòng 88 "\| Insulation Class \| H" |
| IB2600586587 #4 (1106A-70TAG4) | UCI274H | Class H hoặc C | fdk-energy [1011] dòng 81 "\| Insulation grade \| H" | stamford-avk-china [1012] (tờ hãng, "CLASS H"; dòng 34 "The insulation system is class 'H'.") |
| IB2600586587 #5 (6CTAA8.3-G2) | UCI274H | Class H hoặc C | fdk-energy [1011] dòng 81 | stamford-avk-china [1012] |
| IB2600592684-2 #1 (QSZ13-G3) | HCI544C | Class H | shanhua [1039] dòng 100 "\| 绝缘等级 Insulation Class \| H" | gb-power [1023] dòng 88 "\| Insulation Class \| H" |
| IB2600592684-2 #4 (KTA19-G3A) | HCI544C | Class H | shanhua [1039] dòng 100 | gb-power [1023] dòng 88 |
(Thứ hạng của hai cấu hình UCI274H sau sắp xếp là #4, #5 — tức #2, #6 trước đây.) Lưu ý: IB2600592684-2 #1/#4 agent ghi `sourceQuote` chỉ là "H" — câu trích ngắn nhưng `factSrc` trỏ đúng dòng shanhua [1039]; code kiểm số/chữ qua dòng `factSrc` nên hợp lệ theo luật hiện có.

### Check đổi do sửa 3 (tỉ số nén) — 0
Mâu thuẫn mới thấy (trước đây bị coi là trùng): QSL9-G5 aosif [1078] 17.3:1 vs fdk-energy [1022] 16.8:1 (IB2600594596-1 #1, #2 — hai check compression đã "chưa rõ" sẵn, HSMT "≤ 17,0 : 1", không đổi; fdk-energy là nhà lắp ráp, không phải tờ hãng nên quy tắc B không áp); 6CTAA8.3-G2 aosif / jinlongteng 18.0:1 vs fdk-energy 16.5:1 (IB2600586587 #5, không có check compression). Không check compression "đạt" nào bị hạ.

### Rủi ro thêm
- Sửa 2/3 đổi `disagree` dùng chung (`factConflicts`, `hintFor`, `comboChecks`, gộp fact): chỉ giá trị đúng dạng chữ cấp / tỉ số mới đi nhánh mới. Số trần ≤ 2 chữ số đứng cạnh một giá trị "x:1" cùng mã sẽ so như tỉ số (chỉ xảy ra với mã compr).
- Quay lui: revert afa414f (độc lập với 34a3afb).
