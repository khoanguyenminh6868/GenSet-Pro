# Nghiệm thu cfg-chuyen-mon-4 — Tách "thương hiệu G7" và "xuất xứ G7"

PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/512 (draft, nhánh `cfg-g7`; commit d106603 trên fe1a719, rồi GỘP origin/main 14b7c13 vào nhánh — merge commit 111cb4d, không rebase vì force-push bị chặn; #511 không trùng tệp). Khoa duyệt 11/11 ("làm 1, 2").

## Phạm vi so với #509 (điều phối nhắc 11/11)
- #509 (`scope` parts | genset) giữ nguyên: scope "parts" (HSMT chỉ đòi hãng G7/EU cho động cơ / đầu phát / BĐK) → NCC ở Trung Quốc, không đổi gì. `basis` CHỈ có nghĩa ở scope "genset".
- Không đổi: lựa chọn xuất xứ tay trên web (cn/g7/g20/other) — `basis` chỉ áp khi bot tự đọc xuất xứ từ HSMT (meta.json); gói không đòi G7/G20 (#506).
- IB2600603983: `originOfHsmt` → `{ origin: g7eu, scope: "parts", basis: "origin" }` → kết quả #509 giữ nguyên (đo dưới).

## Tệp đã đổi
- `suppliers/config-bot.mjs`
  - `basisOfLine`, `BASIS_ORIGIN`, `BASIS_BRAND`, `ROW_START`: một dòng G7/G20 là "brand" khi nhãn gần nhất (chính dòng; không có thì dòng trên; không vượt qua dòng mở đầu một hàng có số thứ tự / tiêu đề mục) nói hãng / thương hiệu / nhãn hiệu / nhà sản xuất mà KHÔNG nói xuất xứ, nước sản xuất, sản xuất tại / ở, nhập khẩu, nguồn gốc, made in, origin, lắp ráp (kể cả lỗi OCR / gõ dấu: "xut xü", "Sán xuất tại").
  - `originOfHsmt` trả thêm `basis`: xét MỌI dòng G7/G20 của HSMT (trừ ví dụ / ưu đãi / chấm điểm trên dòng hoặc ô của nó; dòng xuất xứ nới rộng như "G7/EU/Asean" VẪN tính); "brand" chỉ khi scope "genset" và mọi dòng là brand; còn lại "origin" (lọc như cũ).
  - `brandMakers(suppliers, origin)` + tham số `brand` của `groupSuppliers`: basis "brand" giữ thêm genset_oem đặt ngoài nhóm có họ hãng (familyOf của tên / brands) thuộc nước trong nhóm VÀ hồ sơ có `relatedIds` tới NCC cùng họ đặt trong nhóm (nhà máy của chính hãng). Xưởng lắp ráp mang tên hãng ngoại không có liên kết vẫn bỏ.
  - `prep`: `brand = auto?.basis === "brand" && !partsOnly`; meta.json ghi `basis` (chỉ khi tự đọc + nhóm G7/G20); `originAuto.basis`; input.md thêm đoạn cho agent khi brand.
  - `check(result, { …, basis })`, `checkDir` đọc `meta.basis`, `mergeFind` / `mergeChecked` / tệp meta của Tìm NCC dùng `result.originBasis`. Ghi chú `notes` "HSMT đòi thương hiệu G7 (không nói nơi sản xuất) …"; chỉ một ghi chú loại này (chạy lại thì thay).
  - `originChecks` (basis "origin"): `c.originAsk` câu hỏi "Xuất xứ G7 (CO)" — "Gửi CO hoặc nêu nước sản xuất của động cơ, đầu phát và tổ máy" vào bảng câu hỏi (`rfqOf`); `genset_origin` đạt bằng code (byCode) khi một NCC của cấu hình đặt tại nước trong nhóm; ngoài nhóm không ghi gì.
- `suppliers/g7basis.test.mjs` (mới, 6 test, hai phía); `config-accuracy.test.mjs` (kỳ vọng cũ thêm `basis: "brand"` cho ô "2 Nhà sản xuất/ nhãn hiệu Nhóm các nước khối G7, EU").
- Không đụng `web/`, `catalog.js`, bidprice.

## Lệnh kiểm + đầu ra thật
```
cd wt-cfg-g7/suppliers && node --test        # sau khi gộp main 14b7c13
# pass 184
# fail 0
```
CI PR #512 (run 42954113947, 111cb4d): app pass 1m4s, server pass 14s, suppliers pass 19s.

## Xem tay trước khi bật lọc (kho `genbid-work/specs/*/text.txt`, 1.499 gói có chữ; scratchpad `g7b.mjs`, `g7table.mjs`)
200 gói `originOfHsmt` thấy G7/G20: scope parts 42, scope genset 158 → **basis brand 11, origin 147**.

Sửa bộ đọc trong lúc xem (mỗi vòng chạy lại cả kho):
1. Bản đầu chỉ xét dòng được chọn → 19 brand, trong đó 3 SAI (origin đọc thành brand): IB2200043247 (nhãn OCR "Thucmg hiu và xut xü" = "Thương hiệu và xuất xứ"), IB2400503492 ("3 Xuất xứ Hãng sản xuất thuộc các nước G7" ở dòng khác), IB2500533266 ("Sán xuất tại các nước EU, G7"). → xét mọi dòng + biến thể OCR / dấu.
2. IB2400349459: "3 Xuất xứ Nhập khẩu đồng bộ từ các nước G7/EU/Asean" bị bỏ vì có ASEAN → đọc brand, SAI (máy TQ không đạt xuất xứ đó). → dòng xuất xứ nới rộng vẫn tính.
3. Nhãn gần nhất: ô "2 Nhà sản xuất/ nhãn hiệu: G7, EU" không bị dòng hàng trên "1 Nước sản xuất: Nêu cụ thể" kéo sang origin → thêm IB2400473260 (đúng brand, xem dưới). IB2400482562 chuyển về origin — ĐÚNG: nhãn ô tổ máy là "Thương hiệu / Hãng sản / xuất/Xuất xứ: EU/G7" (dòng 27–29, chữ "Xuất xứ" ở dòng DƯỚI) — bản trước đọc sai là brand.
4. "1 Động cơ EU, G7 hoặc G20" không lấy nhãn "2.2 Thương hiệu" của mục trên (không vượt qua hàng có số thứ tự).

**11 ca brand (xem tay từng ca, cả 5 dòng quanh mọi dòng G7/G20 không có chữ xuất xứ / sản xuất tại / nhập khẩu / lắp ráp liên quan):**
| TBMT | Câu trong HSMT | Đúng? |
|---|---|---|
| IB2300000242 | "7 Hãng sản xuất EU/G7" | đúng |
| IB2300236743 | "Thương hiệu: G7" (4 bộ phận) | đúng |
| IB2400146806 | ĐỘNG CƠ / ĐẦU PHÁT "Thương hiệu / Hãng sản xuất: EU/G7"; MCCB, ATS "Thương hiệu: EU/G7" | đúng |
| IB2400155713 | "Thiết bị — Hãng sản xuất: G20" | đúng |
| IB2400208175 | "Hãng sản xuất thuộc nhóm các nước công nghiệp phát triển G7" (tổ máy, động cơ, đầu phát, bảng ĐK) | đúng |
| IB2400473260 | "4 Thương hiệu: Hàng hóa có thương hiệu thuộc nhóm nước EU; G7 hoặc Việt Nam"; động cơ "Thương hiệu thuộc các hãng EU hoặc G7"; "2 Xuất xứ: Nhà thầu cung cấp thông tin" (không ràng buộc) | đúng |
| IB2500068145 | "3 Thương hiệu: Nhóm các nước G7" | đúng |
| IB2500084609 | "Thương hiệu: G7" | đúng |
| IB2500211376 | "Thương hiệu: G7" | đúng |
| IB2500271331 | "1 Hãng sản xuất … Thương hiệu thuộc các hãng EU hoặc G7" (dòng "sơ đồ lắp ráp" gần đó không phải yêu cầu xuất xứ) | đúng |
| IB2500512614 | ĐỘNG CƠ / ĐẦU PHÁT "Thương hiệu / Hãng sản xuất EU/G7"; ATS, MCCB "Thương hiệu: EU/G7" | đúng |
**Không còn ca "origin" nào bị đọc thành "brand"** trong các ca đã xem.

**Bảng 47 ca theo phân loại câu trích hôm 10/11 (29 "brand" + 18 "cả hai")** — cột cuối: dòng làm gói thành origin (hoặc lý do):
| TBMT | Phân loại 10/11 | Câu trích | scope | basis | Dòng quyết định |
|---|---|---|---|---|---|
| IB2200008717 | brand | Động cơ, đầu phát, do các hãng thuộc các nước G7 sản xuất và lắp | genset | origin | "…sản xuất và lắp ráp đồng bộ … tại các nước G7, và được nhập khẩu trực tiếp nguyên bộ" — đúng |
| IB2200052323 | brand | Nhà thầu đề xuất/Thương hiệu các hãng thuộc các nước G7 | parts | origin | scope parts (#509) |
| IB2300000242 | brand | Hãng sản xuất EU/G7 | genset | brand | đúng |
| IB2300067330 | brand | Thương hiệu bảng Thuộc các hãng các nước G7 | parts | origin | scope parts |
| IB2300127113 | brand | - Thương hiệu: EU/G7 | parts | origin | scope parts |
| IB2300194512 | brand | 1 Thương hiệu G7, châu Âu, sản xuất theo công nghệ của các | genset | origin | "chứng nhận xuất xứ (CQ) … sản xuất theo công nghệ … G7" — an toàn |
| IB2300223728 | brand | - Hãng sản xuất máy phát điện thuộc các nước khối G7 | genset | origin | "…do các hãng … G7 sản suất, lắp ráp tại các nước thuộc…" — đúng |
| IB2300230061 | brand | Hãng sản xuất thuộc các nước G7. | genset | origin | "có xuất xứ từ hãng thuộc G7" — đúng |
| IB2300236144 | brand | Thương hiệu thuộc các hãng EU hoặc G7 | parts | origin | scope parts |
| IB2300249535 | brand | - Hãng sản xuất máy phát điện thuộc các nước khối G7 hoặc tương | genset | origin | "…sản suất, lắp ráp…" — đúng |
| IB2300266461 | brand | Động cơ, đầu phát, do các hãng … G7 sản xuất và lắp | genset | origin | như IB2200008717 — đúng |
| IB2300292168 | brand | như trên | genset | origin | như trên — đúng |
| IB2400073944 | brand | Thương hiệu của các nhà sản xuất từ các nước G7, châu Âu. | genset | origin | "3 Công nghệ: Sản xuất theo công nghệ của các nước G7" (không rõ là gì) — an toàn |
| IB2400124734 | brand | Thương hiệu thuộc các hãng EU hoặc G7 | parts | origin | scope parts |
| IB2400180911 | brand | Thương hiệu thuộc các hãng EU hoặc G7 | parts | origin | scope parts |
| IB2400349459 | brand | 2 Thương hiệu G7/EU | genset | origin | "3 Xuất xứ Nhập khẩu đồng bộ từ các nước G7/EU/Asean" — đúng |
| IB2400470242 | brand | 1. Động cơ: thương hiệu thuộc các nhóm nước G7 | parts | origin | scope parts |
| IB2400513782 | brand | 1 Hãng sản xuất Thuộc các nước G7 | parts | origin | scope parts |
| IB2500073242 | brand | 2.2 Thương hiệu G20, G7, EU | genset | origin | "1 Động cơ EU, G7 hoặc G20" (không rõ thương hiệu hay xuất xứ) — an toàn |
| IB2500271331 | brand | Thương hiệu thuộc các hãng EU hoặc G7 | genset | brand | đúng |
| IB2500287209 | brand | + Động cơ có thương hiệu của các nước G7 … | parts | origin | scope parts |
| IB2500416364 | brand | đồng bộ động cơ thương hiệu G7, đầu phát | parts | origin | scope parts |
| IB2500512614 | brand | Thương hiệu / Hãng sản xuất EU/G7 | genset | brand | đúng |
| IB2500598824 | brand | Thương hiệu: từ các nước EU hoặc G7 | genset | origin | "Xuất xứ: Xuất sứ EU/G7" — đúng |
| IB2600027651 | brand | Thương hiệu: từ các nước EU hoặc G7 | genset | origin | "Xuất xứ: Xuất sứ EU/G7" — đúng |
| IB2600083151 | brand | - Động cơ diesel: thương hiệu G7 | genset | origin | chữ HSMT lỗi mã ký tự ("ĈӝQJFѫGLHVHOWKѭѫQJKLӋu G7") không đọc được nhãn — an toàn (đúng ra là brand) |
| IB2600098464 | brand | Thương hiệu: G7/G20 | genset | origin | "Xuất xứ: G7/G20/Thái Lan" — đúng |
| IB2600309163 | brand | 4.2 Thương hiệu bộ điều khiển: EU/G7 | parts | origin | scope parts |
| IB2600350175 | brand | 1 Hãng sản xuất Thương hiệu thuộc các nước G7 | parts | origin | scope parts |
| IB2200004914 | cả hai | Bộ điều khiển ATS … Xuất xứ G7 | parts | origin | scope parts |
| IB2300190927 | cả hai | - Xuất xứ và thương hiệu lắp ráp của tổ máy: Các nước G7 | genset | origin | đúng |
| IB2400058723 | cả hai | - Tổ máy có nhãn hiệu và xuất xứ thuộc các nước G7/Châu Âu | genset | origin | đúng |
| IB2400229394 | cả hai | - Xuất xứ thương hiệu và sản phẩm: G7/Châu Âu | genset | origin | đúng |
| IB2400265303 | cả hai | Xuất xứ nhà thầu đề xuất; Thương hiệu thuộc các nước G7 | parts | origin | scope parts |
| IB2400422974 | cả hai | … vật tư chính hãng, xuất xứ EU/G7 | genset | origin | đúng |
| IB2400454375 | cả hai | … xuất xứ rõ ràng (nêu rõ hãng và nước sản xuất). … G7. | genset | origin | đúng |
| IB2400560982 | cả hai | - Thương hiệu có xuất xứ từ nhóm các nước G7. | parts | origin | scope parts |
| IB2500360458 | cả hai | 1 Yêu cầu Thương hiệu các nước G7, xuất xứ G20 | genset | origin | đúng |
| IB2500402318 | cả hai | Xuất xứ (hãng sản xuất/lắp ráp tổ máy phát điện): G7 hoặc Việt Nam | genset | origin | đúng |
| IB2500459891 | cả hai | … thương hiệu từ các nước G20, có xuất xứ từ các nước … | genset | origin | đúng |
| IB2500460613 | cả hai | Hàng hóa có thương hiệu xuất xứ thuộc nhóm nước EU; G7 | genset | origin | đúng |
| IB2500500319 | cả hai | Hàng hóa có thương hiệu xuất xứ thuộc nhóm nước EU; G7 | genset | origin | đúng |
| IB2500536474 | cả hai | Máy phát điện sản xuất tại các nước G7 … | genset | origin | đúng |
| IB2600021464 | cả hai | Xuất xứ hãng sản xuất / Châu âu/ G7 | genset | origin | đúng |
| IB2600337362 | cả hai | Xuất xứ hãng sản xuất / Châu Âu/ G7 | genset | origin | đúng |
| IB2600395994 | cả hai | … xuất xứ chính hãng thương hiệu G7. Không chấp nhận … OEM. | genset | origin | đúng |
| IB2600490077 | cả hai | Thương hiệu, xuất xứ: G7 | parts | origin | scope parts |
Tóm tắt: "cả hai" → origin 18/18. "brand" (câu trích) → brand 3, origin 26 (12 do scope parts của #509; 14 có dòng xuất xứ / lắp ráp / không rõ, trong đó IB2600083151 là chữ lỗi mã — chiều an toàn).

## Số đo trước / sau (ĐO, không chạy agent; doc-cache supplier 10/11; scratchpad `measure5.mjs`: `groupSuppliers` → `byOrigin` → `candidates`)
`brandMakers`: g7 / g7eu / g20 → **cat-tianjin** (CN; brands FG Wilson, Cat; relatedIds caterpillar US, fg-wilson GB; "Công ty con 100% của Caterpillar … Thiên Tân"), **mhi-china** (CN; brands Mitsubishi; relatedIds mhiet JP; "Tổ máy MGS-CN 520–2200 kW lắp ráp tại Trung Quốc"). bdadl-shanghai (tên Baudouin, không liên kết) không vào.
| Gói | origin / scope / basis | NCC trong nhóm trước → sau | dòng bảng | ứng viên |
|---|---|---|---|---|
| IB2600603983 | g7eu / parts / origin | 324 → 324 (NCC ở TQ theo #509) | 14.903 → 14.903 | 30 → 30 (sanq-power, tecgen-fujian, yongcai, uleengen, jet-power, dingbo, koten, fdk…) — giữ đúng #509 |
| IB2300000242 | g7eu / genset / brand | 91 → 93 | 1.429 → 1.429 | 5 → 5 |
| IB2300236743 | g7 / genset / brand | 80 → 82 | 1.285 → 1.285 | 5 → 5 |
| IB2400146806 | g7eu / genset / brand | 91 → 93 | 1.429 → 1.429 | 4 → 4 |
| IB2400155713 | g20 / genset / brand | 96 → 98 | 1.358 → 1.358 | 4 → 4 |
| IB2400208175 | g7 / genset / brand | 80 → 82 | 1.285 → 1.285 | 4 → 4 |
| IB2400473260 | g7eu / genset / brand | 91 → 93 | 1.429 → 1.429 | 5 → 5 |
| IB2500068145 | g7 / genset / brand | 80 → 82 | 1.285 → 1.285 | 9 → 9 |
| IB2500084609, IB2500211376 | g7 / genset / brand | 80 → 82 | 1.285 → 1.285 | 5 → 5 |
| IB2500271331 | g7eu / genset / brand | 91 → 93 | 1.429 → 1.429 | 5 → 5 |
| IB2500512614 | g7eu / genset / brand | 91 → 93 | 1.429 → 1.429 | 4 → 4 |
| IB2400058723, IB2500402318, IB2600395994 | g7(eu) / genset / origin | không đổi (91, 80, 80) | không đổi | 6, 6, 5 — không đổi |
**Hiệu quả thực tế hiện nay nhỏ:** 2 nhà máy chính hãng vào nhóm nhưng cat-tianjin không có bảng thông số, mhi-china có 1 bảng nhưng không dòng nào đúng cỡ các gói trên → ứng viên chưa đổi. Lợi ích đến khi các nhà máy chính hãng có bảng (Tìm Thông Số) hoặc agent tìm trên internet (input.md đã dặn khi basis brand). Phần "xuất xứ" thêm câu hỏi CO cho mọi cấu hình của gói đòi xuất xứ G7/G20 (147 gói scope genset có basis origin trong kho).

## Rủi ro còn lại
- `relatedIds` do discover ghi (có nguồn, nhưng là đánh giá của agent): một NCC liên kết nhầm sẽ được giữ ở gói "brand". Hiện chỉ 2 NCC.
- Bộ đọc basis dựa vào chữ: HSMT lỗi mã ký tự (IB2600083151) hay nhãn ở xa hơn 2 dòng → "origin" (an toàn).
- `genset_origin` đạt theo nước của NCC, không phải nơi sản xuất thực của tổ máy — vì thế luôn kèm câu hỏi CO.
- Tiến trình `config-bot.mjs run` đang chạy giữ code cũ.

## Quay lui
Revert PR #512. Kết quả mới có thêm `originBasis`, `originAuto.basis`, `c.originAsk` — code cũ bỏ qua; meta.json `basis` bị bỏ qua.

## Chưa kiểm được
- Chưa chạy agent / check trên một gói "brand" thật (không chạy agent theo brief); lượt sau của các gói G7 sẽ là lần đầu.
- Web không hiện `originAuto` (chỉ `notes`), không đổi web trong PR này.
