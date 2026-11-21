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
