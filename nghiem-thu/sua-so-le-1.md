**Kết luận: PR draft sửa 3 bản ghi đúng như nêu (spec-diff: 3 bản ghi đổi, 0 khác; 1.334 / 1.334 test xanh) + simpson 3 bản ghi `fuel` (commit riêng). Mục (4) tecnogen DỪNG: nguyên nhân nằm ở bộ đọc cột, ngoài ROW_EXCEPTIONS. Mục (5): chỉ tìm hiểu, đã giải thích (bên dưới). Simpson: điều phối nói 10 bản ghi đổi `fuel`, thực đo chỉ 3 (7 bản ghi GX đã là xăng trên main từ trước).**

Link PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1016 (DRAFT, nhánh `sua-so-le`, đầu nhánh `6ed045eb`, merge-base `95ecba26`).
CI GitHub: server, spec-diff, suppliers, web đều pass. `web` đỏ một lần ở `file-transfer.spec.mjs:311` ("Bỏ tệp tải tay": toast "Đã tải lên 2 tệp" thay vì "Đã bỏ tệp"), test giao diện không liên quan thay đổi này; chạy lại job đó thì pass (1m39s). Test cục bộ: 1334 / 1334.

## 1. Tệp đã đổi
- `web/catalog.js`: `ROW_EXCEPTIONS` (3 mục mới / 1 mục đổi) + `FUEL_PAGES` simpson (`rest`) + `fuelPage`.
- `web/CLAUDE.md`: ghi mục mới + bẫy khớp dòng của bản ghi PDF / bảng nhãn.
- `suppliers/sua-so-le-1.test.mjs` (mới), `suppliers/bang-bo-sot.test.mjs`, `suppliers/fuel.test.mjs`.
- Không đụng `genbid-hsmt\`, `suppliers/config-bot.mjs`, phần ĐỌC MÃ của `catalog.js`.

## 2. Lệnh kiểm + đầu ra thật
- `node --test suppliers/*.test.mjs` → `# tests 1334 / # pass 1334 / # fail 0`.
- `node suppliers/spec-diff.mjs git:95ecba26 .` → `bản ghi cũ 61041, mới 61041 | khác 3 | chỉ cũ 0, chỉ mới 0`; `đảo vai: 0 → 0`. Liệt kê đủ:
  - `aosif n1079 bảng 177`: `cyl: 4 → ∅`
  - `depco-power n2102 bảng 106`: `cyl: 6 → 8; disp: 11.051 → 14.618`
  - `green-power-generators n115 bảng 16`: `cyl` 16 → 12 (cột "cyl bỏ/đổi/thêm" của tóm tắt: dòng này trước là `dropspec` rỗng, nay có 12)
  - Tóm tắt khoá: `{"cyl bỏ":1,"cyl đổi":1,"disp đổi":1,"cyl thêm":1}`. Chưa đọc được: `ngoại lệ theo dòng 68 → 70` (đúng hai mục mới có note).
- spec-diff KHÔNG so trường `fuel` của bản ghi. Đo `fuel` bằng `dieu-phoi\dau-vao\nhom-con-lai\pr3\soat-fuel.mjs` (catalog gốc ↔ nhánh, mọi NCC, `fromSupplier` + `gensetsOf`): `bản ghi 62741; đổi nhiên liệu 3; khác ngoài nhiên liệu 3` (3 bản ghi này là aosif / depco / green-power ở trên); 3 dòng đổi `fuel`: simpson n124 b15 dòng 0 ZS168FA, dòng 1 ZS182F, dòng 3 ZS190F: `-→dual/K`.
- Số đo trước / sau: ĐO, không ước tính.

## 3. Từng dòng, đối chiếu nguồn
1. **aosif n1079 QSL9-G5** (`dropspec` cyl; Khoa duyệt 21/11 "fix"). Tệp `suppliers/cn/aosif.json` bảng n1079 ("Datasheet: 255705512637.pdf"): `"| Model | QSL9-G5"` (khối tổ máy) rồi, ở "Engine specification": `"| Model | QSL9-G7"`, `"| No. of cylinder | 4"`, `"| Bore x Stroke | 107x124mm"`, `"| Displacement | 6.69L"`. Cùng NCC: n1078 (cùng QSL9-G5) ghi 6; AC330 / AC395 (QSL9-G5) ghi `6L`. Không ghi số thay (dropspec). Khớp qua `model: "QSL9-G5"` + dòng `| No. of cylinder | 4` (bản ghi không có `line`).
   - **Việc ngoài phạm vi, chưa làm**: cùng khối QSL9-G7 còn để lại trên bản ghi QSL9-G5: `bore 107x124mm`, `disp 6.69L`, `compr 17.3:1` (số này cũng không phải 114x145 / 8.9 L của QSL9). Brief chỉ duyệt cyl → xin Khoa / điều phối duyệt thêm `keys: ["bore","disp","compr"]`.
2. **depco n2102 P158LE-1 (DPK-DD-441)**: nguồn `suppliers/cn/depco-power.json` bảng n2102 ("Custom Hyundai Ranges 60Hz 353 kW …"): `"| Cylinder | 6 | Cooling system | Water-cooling"`, `"| Cylider arrangemant | IN-LINE | Bore and Stroke(mm) | 128 X 142"`, `"| Governor | Electrical | Displacement(L) | 11.051"`. → `fixspec` cyl 6→8, disp 11.051→14.618 (số 11.051 là của P126TI như brief nói). Căn cứ (a): 128×142×8 = 14,62 L của CHÍNH dòng (lệch 0 %); (b): depco n2101 / n2182 (P158LE cùng 128 X 142) ghi 8 / 14.618 / 14.62, và P158LE-1 ở bdadl n133, fukangsi n2008, jianghao n106, haifeng n2006, taihai n105, huatai n108, wintpower n146 (và nhiều NCC khác) ghi 8 xi lanh / 14.618 L (kiểm trên toàn bộ bản ghi catalog, không lấy mẫu). Spec mang `fixed`, bản ghi mang `fixed[]`. Lưu ý: dòng gốc ghi "Arrangement: 6L" và "Cylinder | 6" hai lần: số 6 là của nguồn, ta sửa có dấu. Nếu Khoa không muốn sửa mà chỉ bỏ thì đổi `act` thành `dropspec` (1 dòng).
3. **green-power n115 GP1000 A/M** (12V 1600 G31F): dòng `| GP1000 A/M | O | 910 | 1005 | 12V 1600 G31F | E | 16 | …`. Kiểm bằng trang hãng MTU (mở 21/11/2026, firecrawl): `https://www.mtu-solutions.com/content/dam/mtu/products/power-generation/powergeneration-product-list-latest/3239091_MTU_Gendrive_spec_12V1600Gx0_Gx1_3B_A2A.pdf`: bảng liệt kê `12V 1600 G31F | 806 (1081)` và dòng "Cylinder configuration 12 cyl" (đoạn trích của kết quả tìm kiếm trên chính tệp này; lần scrape có hỏi trực tiếp chỉ trả lại bảng model, câu "12 cyl" lấy từ kết quả tìm kiếm của đúng URL đó, chưa tự đọc lại trang 2). Trang MTU đã lưu `suppliers/sources/mtu-rolls-royce/101.md` dòng 2945 cũng ghi `806 kW … 12V 1600 G31F`, nhưng không có dòng cylinder. Dòng không có bore × stroke nên (a) được thay bằng tài liệu hãng. `fixspec` 16 → 12 (trước là `dropspec`).

## 4. Tecnogen mất số xi lanh sau #784: DỪNG, báo điều phối
- Dòng: `tecnogen n2008 bảng 7 dòng 3`, `KL45TSX` (động cơ KDI2504TM). Trước #784 (`687921d7^`) có `cyl: 4`; sau #784 và trên main hiện tại: không có cyl, nhưng thêm `weight: 1050` (spec-diff `git:687921d7^ git:687921d7`: `{"fuel bỏ":223,"fuel đổi":33,"cyl bỏ":1,"weight thêm":1}`, dòng `cyl: 4 → ∅; fuel: 6.6 → ∅; weight: ∅ → 1050`). Hai dòng kế (KL33TSX, KL71TSX) vẫn có cyl: KHÔNG phải của cột; hiện trên main chỉ có `weight=1050`, không còn cyl.
- Điểm riêng của dòng: là dòng duy nhất của tecnogen có hai ô placeholder viết `- - -` (kVA 60 Hz và tiêu hao 1800 v/p), các dòng khác dùng `--`. Chữ dòng: `| KL45TSX | 45 | 41 | - - - | - - - | KDI2504TM | M | 4 | 2482 | 37.3 | - - - | 6.6 | - - - | T | AUS7310 | …| 1050`. Có ba ô `- - -` (không phải hai: cả cột kWm 1800 v/p).
- Nguyên nhân chưa chứng minh đến cùng: khớp với việc #784 đổi cách gán nhãn "Cons. 70%" khỏi `fuel`, nên một lượt đọc theo vị trí (`walkedSpecs`) kết thúc khác ở dòng có ô `- - -`; kết quả là cyl rơi, weight vào. Sửa phải ở bộ đọc cột (`walkedSpecs` / nhãn fuel của `SPECS` trong `web/catalog.js`, phần ĐỌC MÃ do S2 giữ), và `ROW_EXCEPTIONS` không có cơ chế THÊM thông số (`fixspec` chỉ thay giá trị đang có). Theo brief: DỪNG, không sửa. Đề nghị: giao S2 (hoặc phiên khác) sửa bộ đọc rồi `spec-diff` phải chỉ đổi đúng dòng này (`cyl ∅ → 4`).

## 5. Vì sao huatai / liangzi ghi 16,12 L cho TAD1345GE không bị số đông 12,78 L loại (CHỈ TÌM HIỂU, không sửa)
Đọc mã, KHÔNG chạy lại `candidates` trên gói thật (chưa kiểm bằng chạy):
- Số đông chỉ là một giá trị CHUNG của động cơ, không loại từng dòng theo số riêng của dòng. `tally` (`web/catalog.js`) cho `win = 12.78` (12,78 từ aoke / bdadl / fukangsi / lees / pengpai / huipu (đã `fixspec` ở #1012) ≥ 3 NCC và ≥ 3 × số NCC ghi 16,12: huatai + liangzi = 2).
- `candidates` (`suppliers/config-bot.mjs`, `below` / `majOf` ~dòng 1680; trần `maxDisp` ~dòng 1716) khi có `mj` thì xét CẢ động cơ theo số thắng (`mj.win` / `dispExact`), không đọc số của dòng. Nên: HSMT đòi tối thiểu N L: mọi dòng của TAD1345GE (kể cả huatai / liangzi) bị loại hoặc cùng đạt theo 12,78; HSMT đòi trần: tương tự. Dòng huatai / liangzi không "bị loại vì 16,12": 16,12 chỉ không có tác dụng nào (không dùng để loại, cũng không để giữ). Muốn dòng đó hết hiện số sai ở danh mục / hồ sơ thì phải `dropspec` / `fixspec` riêng (chưa được giao): huatai n103 `360GF`, liangzi n113 + n140 `LZ- V360`. Hình học các dòng này: huatai ghi bore 144/165 (= TAD1642GE, 16,12 L), tức dòng chép số của TAD1642GE (cùng kiểu mingbang), không phải số của TAD1345GE (131×158×6 = 12,78).
- #1012 chỉ sửa các dòng `dropspec → fixspec` (huipu 1278 → 12.78...), không đụng huatai / liangzi.

## 6. Simpson n124 (commit riêng `6ed045eb`)
- Cơ chế sẵn có không có giá trị "không phải diesel, không rõ loại". Cách hẹp nhất dùng được mà không đụng `config-bot.mjs`: `FUEL_PAGES` mục simpson thêm `rest` → 3 bản ghi động cơ không phải Honda GX (ZS168FA, ZS182F, ZS190F) nhận `fuel: "dual"`, `fuelFrom: "K"`, `fuelWhy` = "QUYẾT ĐỊNH của Khoa 21/11/2026 (không có nguồn hãng) …". `fuelOff` loại `dual` khỏi HSMT diesel (kể cả HSMT không nêu nhiên liệu) và cho HSMT khí / xăng đi qua (đúng "không rõ loại"). 7 bản ghi GX giữ `gasoline` / mức D như trên main (căn cứ Honda, không đổi).
- Tác dụng phụ cần biết: khi HSMT nêu nhiên liệu khí / xăng thì check "Nhiên liệu (HSMT)" không phát cho dòng này; khi HSMT diesel, check `not_met` ghi "Dòng bảng của simpson-power ghi xăng / khí" (chữ cố định của `kind()` trong `config-bot.mjs`, phần S3) cộng `fuelWhy` nói rõ là quyết định. Nếu cần chữ "không rõ loại" đúng nghĩa thì phải sửa `kind()` (config-bot.mjs, ngoài phạm vi).
- Bốn dòng "31HP" / "35HP" (SGH1160E, SGH3200E, SGH1180E, SGH3300E) KHÔNG có bản ghi động cơ trong catalog (không là mã), nên không có chỗ ghi `fuel`: chúng không vào gói diesel của Gợi ý sẵn (không có bản ghi động cơ để chọn). Kiểm bằng `soat-fuel.mjs`: simpson n124 có đúng 10 bản ghi: 7 GX + 3 ZS.
- So với brief ("10 bản ghi đổi fuel"): thực đo 3, vì 7 bản ghi GX đã `gasoline` trên main.

## 7. Rủi ro còn lại + cách quay lui
- depco: sửa có dấu (không chỉ bỏ); nếu Khoa muốn chỉ bỏ: đổi `act` thành `dropspec`, `keys: ["cyl","disp"]` (một mục).
- green-power: dựa vào tài liệu MTU; câu "Cylinder configuration 12 cyl" lấy từ kết quả tìm kiếm của URL đó (xem mục 3).
- simpson `dual`: nhãn "xăng / khí" hiển thị trong check có thể gây hiểu là nguồn ghi vậy; `fuelWhy` + mức K nói rõ là quyết định.
- Quay lui: `git revert` hai commit (116965e6, 6ed045eb) hoặc từng commit riêng; cn/ không đụng.

## 8. Chưa kiểm được
- CI của GitHub trên PR chưa chạy xong khi viết tệp này.
- Tác động lên top 30 Gợi ý KHÔNG đo (brief cấm tự đo).
- Nguyên nhân gốc tecnogen KL45TSX chưa tìm tận mã (dừng theo brief).
- Mục 5: chưa chạy `candidates` trên HSMT thật.

## Cần ghi nhớ (cho điều phối)
- ROW_EXCEPTIONS cho bản ghi từ PDF datasheet / bảng nhãn khớp qua `model` hoặc `genset` + một dòng nằm trong `lines.rows` (đã ghi vào `web/CLAUDE.md`).
- Việc dở đề xuất: (a) aosif QSL9-G5 còn bore / disp / compr lấy từ khối QSL9-G7; (b) tecnogen KL45TSX (bộ đọc); (c) huatai n103 / liangzi n113 + n140 TAD1345GE 16,12 L (số của TAD1642GE).

---

# BỔ SUNG 21/11/2026 (điều phối thêm (a)–(d) vào cùng PR #1016; mỗi mục một commit)

**Kết luận bổ sung: spec-diff so merge-base 95ecba26 = 6 bản ghi đổi thông số (đúng danh sách bên dưới, 0 khác); soat-fuel = 5 bản ghi đổi `fuel` (1 kingway, 1 man-engines, 3 simpson), 0 bản ghi `fuel` khác; test cục bộ 1.337 / 1.337 sau (d); CI GitHub (server, spec-diff, suppliers, web) pass trên đầu nhánh 6c332218. MTU đã tự mở PDF: "Cylinder configuration 12 cyl. - 90°V". Mục (c): không ghi "diesel" cho 8 dòng D vì cơ chế không có giá trị diesel tường minh (nêu bên dưới).**

Commit (theo thứ tự): `2e46a386` (a) · `b709cea4` (b) · `80565aa6` (c) · `a938ee72` + `c3034a29` (d) · các commit ghi chú `web/CLAUDE.md`. Đầu nhánh: xem tin báo.

## Số đo (đo, không ước tính)
- `node suppliers/spec-diff.mjs git:95ecba26 .` (sau (a)(b)(c)): `bản ghi cũ 61041, mới 61041 | khác 6 | chỉ cũ 0, chỉ mới 0`; đảo vai 0 → 0. Liệt kê đủ:
  1. `aosif n1079 bảng 177`: `cyl: 4 → ∅; bore: 107x124mm → ∅; disp: 6.69L → ∅; compr: 17.3:1 → ∅`
  2. `depco-power n2102 bảng 106`: `cyl: 6 → 8; disp: 11.051 → 14.618`
  3. `green-power-generators n115 bảng 16`: `cyl: ∅ → 12` (so với main: trước là dropspec rỗng)
  4. `huatai-yangzhou n103 bảng 2`: `bore: 144/165 → ∅; disp: 16.12 → ∅`
  5. `liangzi-yangzhou n113 bảng 12`: `disp: 16.12 → ∅`
  6. `liangzi-yangzhou n140 bảng 26`: `disp: 16.12 → ∅`
  (liangzi n141 chép nguyên văn dòng n113 → gộp vào bản ghi n113 như `also`, nên chỉ hiện 2 bản ghi liangzi; kiểm bằng test: không còn bản ghi TAD1345GE nào của liangzi có dung tích.)
- `soat-fuel.mjs` (gốc ↔ nhánh, mọi NCC, `fromSupplier` + `gensetsOf`): `bản ghi 62741; đổi nhiên liệu 5`:
  - `kingway-power n117 b12` (vai đầu phát "Kingway KAI250" / KGD250B): `-→gas/B`
  - `man-engines n104 b4 dòng 8` (E3262): `-→gas/D`
  - `simpson-power n124 b15` dòng 0, 1, 3 (ZS168FA, ZS182F, ZS190F): `-→dual/K`
  (Cột "KHÁC NGOÀI NHIÊN LIỆU" của script trùng đúng 6 bản ghi thông số ở trên, không bản ghi nào khác.)

## (a) aosif n1079 QSL9-G5
`dropspec` keys cyl, bore, disp, compr. Khối "Engine specification" trong `cn/aosif.json` n1079 (dòng 8883–8896): `| Model | QSL9-G7`, `| No. of cylinder | 4`, `| Bore x Stroke | 107x124mm`, `| Displacement | 6.69L`, `| Compression ratio | 17.3:1`: cả khối là của dòng QSL9-G7 (aosif n1078 cùng QSL9-G5 ghi 6 xi lanh). Test `suppliers/sua-so-le-1.test.mjs`: bore, disp, compr, cyl rỗng; `current` 433A giữ.

## (b) TAD1345GE ghi số của TAD1642GE
- Nguồn từng dòng (mở từng dòng): huatai `suppliers/cn/huatai-yangzhou.json` dòng 248 `| 360GF | 360 | TAD1345GE | 6L | 144/165 | 16.12 | 48 | 3100 | 3200*1100*1800`; liangzi dòng 694 (n113), 1048 (n140, "沃尔沃遍达"), 1082 (n141): `| LZ- V360 | 360/450 | … | TAD1345GE | 6 L | 16.12 | 48 | ≤200 | …`.
- Số sai: 16,12 L (và bore 144/165 của huatai) là số của TAD1642GE: aoke, bdadl, fukangsi, lees, pengpai, huipu ghi `TAD1642GE disp=16.12`, haifeng / huipu / jianghao / kangwo / lees ghi bore 144×165 cho TAD1642GE; TAD1345GE là 131×158 và 12,78 L (Volvo Penta bulletin `suppliers/sources/volvo-penta/1011.md`: "12.78 liter, in-line 6 cylinder"). Số xi lanh 6L / 6 L đúng → giữ. Chỉ bỏ khoá thật sự sai: huatai bore + disp, liangzi disp. Không ghi số thay.
- Ngoài phạm vi, phát hiện thêm (CHƯA sửa): `bdadl-shanghai n134` TAD1345GE-B `cyl=6, disp=16.1` (cũng số TAD1642GE); mingbang n125 đã bỏ từ trước. Xin điều phối quyết có thêm `dropspec` cho bdadl n134 không.

## (c) man-engines n104 (9 bản ghi)
- Cơ chế: `FUEL_PAGES` mục `man-engines`, `engines: { E3262: <trang hãng> }`, mức D. Chỉ dòng E3262 ghi `gas`. Tự mở trang MAN (firecrawl scrape, 21/11/2026) `https://www.man.eu/engines/en/products/power-generation/gas/man-motor-e3262.html`: "E3262 naturally aspired engine with natural gas" và "Both the E3262 LE232 for natural gas and the E3262 LE242 for biogas and other special gases deliver 450 kWmech at 1,500 rpm (50 Hz)". (E3262 là động cơ khí; bản biogas cũng là khí → `gas`.) Các câu này lấy từ trang đã mở, không từ đoạn trích tìm kiếm.
- 8 dòng D2676 / D2862 / D3872: ĐỂ TRỐNG. Cơ chế KHÔNG có giá trị `diesel` tường minh, và `fuelOff` (`config-bot.mjs`) trả TRUE cho HSMT diesel khi dòng có bất kỳ `fuel` nào (`want === "diesel"` → nhánh cuối `false`, `!false`) nên ghi "diesel" sẽ LOẠI chính các dòng diesel khỏi gói diesel. Không chế thêm. PDF hãng (marine-auxiliary-en.pdf tr. 16 / 22 / 28, "Fuel: DIN EN 590") không đọc lại ở lượt này (đã đọc ở nhien-lieu-4-bang.md); không dùng. Nếu muốn ghi diesel tường minh thì phải sửa `fuelOff` (S3).

## (d) kingway-power n117 (Khoa 21/11 "Khí")
- `FUEL_PAGES` mục `kingway-power`, `fuel: "gas"`, mức B, `header: ""` (bảng đã lưu không có dòng tiêu đề; trang được cào lại có thì mục tự hết hiệu lực). Chữ nguồn: `suppliers/sources/kingway-power/117.md` dòng 74 "| Engine Specifications" … dòng 83 `| Fuel | Biogas`; trang thuộc "Gas Generagtor Set > Biogas Generator Set". Bảng đã lưu trong `cn/kingway-power.json` n117 KHÔNG mang dòng Fuel / Compression ratio (chỉ có Model, Rated /Standby Power(KW), Cylinder Number, Bore x Stroke, Rated speed, Displacement, Voltage, Frequency): vì thế phải qua `FUEL_PAGES`, và `why` nói rõ.
- Lưu ý bộ đọc (ngoài phạm vi): bản ghi duy nhất của n117 hiện là vai ĐẦU PHÁT "Kingway KAI250" (genset KGD250B) mang cả cyl / bore / disp của động cơ; không có bản ghi động cơ SC9D340D2 như `nhien-lieu-4-bang.md` mô tả. `fuel` gắn vào bản ghi duy nhất đó. Không có datasheet hãng SDEC đã xác nhận (xem nhien-lieu-4-bang.md mục 2), không dùng trang sdec-engine.com.

## Căn cứ MTU (mục 3 trước): đã mở PDF
`https://www.mtu-solutions.com/content/dam/mtu/products/power-generation/powergeneration-product-list-latest/3239091_MTU_Gendrive_spec_12V1600Gx0_Gx1_3B_A2A.pdf` (firecrawl scrape trực tiếp, 21/11/2026): bảng liệt kê `12V 1600 G31F | 806 (1081)`; dòng "Cylinder confi guration | 12 cyl. - 90°V | 12 cyl. - 90°V" (cột Gx0 / Gx1). Căn cứ `fixspec` 16 → 12 của green-power giờ là câu đọc trực tiếp từ tài liệu hãng.

## Còn lại / cần ghi nhớ
- bdadl n134 TAD1345GE-B 16,1 L (ở trên); bộ đọc n117 kingway (vai đầu phát, không bản ghi động cơ); `fuelOff` không có diesel tường minh (nếu cần ghi diesel cho 8 dòng man-engines D thì sửa ở config-bot).
- Tecnogen KL45TSX: đã chuyển S2.
