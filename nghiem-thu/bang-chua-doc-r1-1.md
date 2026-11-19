**Kết luận bằng số: 40 / 249 bảng R1 (16%) nay đọc được (9 NCC: jinjia 18, simpson 12, agg-fuzhou 2, conductorjasa 2, green-power 2, huadong, kaihua, rcg, voltgent); toàn catalog thêm 887 bản ghi, 507 model tổ máy chưa có ở gốc (đo, `suppliers/cn` hiện tại); 209 bảng R1 để nguyên vì không có luật đọc an toàn: 82 chỉ có model tổ máy (catalog chưa có loại bản ghi tổ máy không động cơ — cần Khoa quyết), 40 bản dịch máy của bảng kente đã đọc, 38 đầu phát / động cơ rời, 33 tiêu đề không nêu cột động cơ, 15 không tiêu đề, 1 không mã.**

# Bảng chưa đọc, nhóm R1 — chặng 2: sửa bộ đọc (19/11/2026)

- Phiên con của điều phối `session_011tAj4PT2GrYzPqLYkLFfvV`. Khoa duyệt "ok làm nhóm 1".
- PR (DRAFT, không tự merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/941 — nhánh `catalog-bang-r1`.
- **Commit gốc `d8db6166` (origin/main), commit nhánh `82587105843d93a299855038a2b0cb6126512e25`.** Top 30 CHƯA đo (theo brief: đo trên cloud bằng `suppliers/do-gop.mjs`).
- Tệp đổi: `web/catalog.js` (+70 / −9), `web/CLAUDE.md` (bẫy mới), `suppliers/bang-r1.test.mjs` (mới, 11 ca dòng thật), `suppliers/unread-tables.json` (chụp lại).
- Không đụng `suppliers/config-bot.mjs`, `genbid-hsmt\`, web thật.
- Tệp làm việc: `genbid-work\dieu-phoi\dau-vao\bang-chua-doc-r1\` (mục 7).

## 1. Vì sao 249 bảng R1 không ra bản ghi (chạy thật `fromSupplier` của gốc, không đoán)

Cách đo: `1-chan-doan.mjs` nạp bản sao `catalog.js` có gắn vết ở 3 chốt (dòng không có ô mã; dòng có mã mà không ra động cơ / đầu phát; bảng đi đường bảng nhãn), chạy `fromSupplier` cả hồ sơ NCC, gom theo bảng. Mọi 249 bảng còn nguyên vị trí trong `cn/` hiện tại.

| nguyên nhân chốt (gốc) | bảng | NCC |
|---|--:|--:|
| có mã nhưng không ra động cơ / đầu phát | 206 | 51 |
| đi đường bảng nhãn (không có dòng tiêu đề) | 33 | 9 (jinjia 18, wartsila 6, man-engines 3, …) |
| không dòng nào có ô mã | 10 | 4 (sincro-soga 7, …) |

Tách nhóm 206 theo vết: 108 bảng mỗi dòng chỉ có MỘT mã (model tổ máy, hoặc model động cơ / đầu phát trong bảng rời), 97 bảng ≥ 2 mã mà tiêu đề không cho biết cột động cơ, 1 bảng không mã tổ máy.

**Lưu ý về hai nguyên nhân ghi trong brief:** (a) "tiêu đề nhiều ô hơn dòng ≥ 3" phần lớn là tiêu đề HAI–BA tầng (kente, yingtai, googol, teksan), không phải dòng dữ liệu dính; dính THẬT chỉ có jinjia (18 bảng, đi đường bảng nhãn vì `header` rỗng) và simpson (dòng dữ liệu đầu nằm trong dòng tiêu đề thứ 2, xem mục 6). (b) tiêu đề dịch máy: chỉ kente (40 bảng) — đều là bản dịch của bảng tiếng Anh n101 / n102 đã đọc (mục 4).

## 2. Đã sửa (luật rõ ràng, mỗi luật kèm bảng thật)

| # | nguyên nhân | luật | bảng R1 được đọc |
|---|---|---|--:|
| 1 | bảng không tiêu đề, dòng đầu = tiêu đề + dòng máy đầu (jinjia) | `stuckHeader`: dòng đầu là k tiêu đề (đầu là Model / 型号, không ô nào là số hay mã) rồi k ô bắt đầu bằng mã, và MỌI dòng khác đúng k ô → tách thành tiêu đề + dòng 0 (giữ chỉ số, chữ là phần sau tiêu đề, nguyên văn) | 18 |
| 2 | mã Scania viết bốn cụm "DC09 072A 02-11", "DC13 072A 02 11", "OC16 071A 02-82", "DC9 65A 10-93" không qua `isCode` (≤ 1 dấu cách) | `SCANIA_CODE` cho phép tới 3 dấu cách | 6 (agg-fuzhou 2, green-power 2, huadong, kaihua, voltgent) + bản ghi ở bảng đang đọc (mục 3) |
| 3 | tiêu đề chữ Hán cách từng chữ ("发 动 机 型 号", simpson) | `tidyTable` gộp chuỗi ≥ 4 chữ Hán cách một dấu cách; chuỗi ngắn hơn / dấu cách giữa hai từ giữ nguyên (chỉ chạm simpson 16 bảng + yingtai n101 / n2003) | 12 |
| 4 | ô "沃尔沃 & TAD530GE" (hãng chữ Hán & mã, rcg n124) | bỏ phần "Hán &" trước mã khi xác định mã; hãng vẫn đọc từ chữ dòng (Volvo Penta, Leroy-Somer) | 1 |
| 5 | tiêu đề "Mesin" (tiếng Indonesia: động cơ) | thêm `\bmesin\b` vào `ENGINE_LBL`; trong cn/ chỉ conductorjasa n124 / n125 có từ này | 2 |
| 6 | (sai phát hiện khi soát) tiêu đề chỉ đơn vị kế thừa mức: jinjia "Prime Power (kW) \| Standby (kW) \| kVA" → 25 kVA thành của standby 22 kW (0,88) trong khi là của prime 20 kW | trong `titledPowers`: số dưới tiêu đề kế thừa mức mà cặp kW/kVA của mức đó không ra 0,75–0,86 (hoặc đúng 1) → bỏ số kế thừa (không đoán sang mức khác) | (sửa 262 bản ghi jinjia trước khi chốt; bảng đang đọc: 1 bản ghi comappower) |
| 7 | (sai phát hiện khi soát) "6BT5.9-G1(G2)" / "4B3.9-G1（G2）" (một ô hai mã) | dòng không cho bản ghi, ghi chú "một ô ghi hai mã" (để trống ô thì "SP0022D-C.pdf" thành động cơ) | — |

Từ khoá thêm: chỉ "Mesin" (conductorjasa). KHÔNG thêm: từ dịch máy của kente ("Cav Qauv", "Imodeli yeNjini", "Model Injan", "Qaabka Matoorka" … ~20 thứ tiếng), "原动机 Prime mover" (yingtai n102 / n2010, nghĩa chắc là động cơ nhưng chữ "Prime" trùng từ khoá mức công suất của `PW_TITLE` → nguy cơ đọc lệch; 4 bảng 26 dòng), "主电源" (rcg, "nguồn chính" — không chắc là prime; rcg n124 vì vậy chỉ có standby), "MARCA / MODELO" (stemac, không rõ MODELO là của gì).

## 3. Kiểm chéo toàn bộ gốc ↔ nhánh (`spec-diff.mjs git:d8db6166 .`, bản cuối)

- Bản ghi 59.064 → 59.787; khác 124; chỉ gốc 80, chỉ nhánh 803 (theo khoá spec-diff); 89 bảng có đổi; **đảo vai 0 → 0**; tự kiểm "cần soát tay" 25 (đã soát hết, dưới).
- Bảng không cho bản ghi nào (toàn catalog): 3.191 → 3.110.
- Soát theo bản ghi (`4-soat-moi.mjs`, khoá NCC|n|bảng|dòng|vai|model; MỌI bản ghi, không lấy mẫu): **mới 887, mất 164, đổi 40.**

**164 "mất" — từng lớp:**
| lớp | số | giải thích |
|---|--:|---|
| simpson: dòng nguyên văn nay đọc ở bảng ĐỨNG TRƯỚC (bảng R1 mới đọc) | 74 | `mergeRepeats` gộp vào bản ghi đó qua `also` — script tìm được bản ghi chủ cho cả 74 |
| khoá đổi vì model rác được thay bằng mã đúng | 84 | tecnogen "AUS7310" / "Q7310AUS" (bảng điện) 22, cgm "B300 / B400 / B750" (khung bệ) 32, baifa "4 months" (thời gian giao) 6, aj-power đầu phát "MA4114D S4L1D-C"… đọc làm ĐỘNG CƠ 24 (nay là bản ghi đầu phát, động cơ là mã Scania) |
| simpson "4B3.9-G1(G2)" / "4BT3.9-G1(G2)" / "6BT5.9-G1(G2)" | 6 | một ô hai mã: bỏ (luật 7) |

**40 "đổi" ở bảng đang đọc:** aj-power 27 (thêm `other` = mã Scania; 3 dòng mất "phase": nay động cơ đúng ô 7 nhưng tiêu đề "Engine" (cột hãng, ô trống) ở ô 6 → chốt có sẵn "tiêu đề động cơ đè ô khác thì không xếp theo vị trí" chặn; mất số, không đọc sai), tecnogen 22 (động cơ đúng ô → dòng khớp dòng tiêu đề thứ 2 (23 ô, có "Engine", "Kg") → luật có sẵn "dòng tiêu đề con đặt tên mọi cột": thêm khối lượng 3690…5310 kg đúng cột "Kg"; mất số xi lanh vì dòng đó không có tiêu đề "Cylinder"), simpson 21 (thêm kích thước — tiêu đề "机 组 尺 寸" nay nhận được; 4 lượt `makes` thêm hãng từ dòng lặp đã gộp: SP2000D-P "Mitsubishi" → "Mitsubishi, Perkins" (4016-61TRG3 là Perkins, `keptMakes` chọn mức dòng bảng), QSZ13 thêm Cummins), rise n119 3 (`other` thêm mã Scania), comappower 1 (COM500V "500kVA | 463kW" dưới "/kw" kế thừa standby: 463/500 = 0,93 → bỏ 463 kW). Các lớp `model` 84 / `other` 42 là cùng các dòng trên.

**25 ca "(!)" của spec-diff:** 3 aj-power phase, 22 tecnogen cyl — giải thích ngay trên.

**887 bản ghi mới — tự gắn cờ** (mỗi công suất / thông số phải có trong chữ dòng nguồn, kW/kVA 0,75–0,86, prime ≤ standby, có model tổ máy): 55 cờ, soát hết:
- 32 mpmc (bảng nhãn, script so nhầm khi chưa ghép chữ bảng nhãn) + 8 agg-power (bản ghi `fromLine` từ `productLines`: dòng nguồn chỉ là "700/560", standby đọc từ cột bên): soát tay đều đúng nguồn.
- 14 green-power, 10 conductorjasa, 6 rise, 3 simpson "không công suất": tiêu đề công suất đứng sau ô động cơ / hai tầng không khớp → để thiếu (đúng luật "thà thiếu"). simpson BF4L913 "50/625", 4008TAG2A "800/1125" (nguồn gõ sai) → không ra cặp.
- 7 simpson kW/kVA = 1 ("2.2/2.2", máy xăng nhỏ một pha): `fitPair` nhận kVA = kW như luật cũ.
- 5 conductorjasa "model có /": mã Baudouin thật "6M33G825/5", "12M33G1400/5".
- 5 visa-gensets "không model tổ máy": bảng "KVA PRP | ENGINE BRAND | MODEL" (danh mục động cơ theo cỡ máy), cùng cách đọc các dòng động cơ khác của bảng đó (đang đọc).
- **CÒN NGHI, KHÔNG SỬA ĐƯỢC TRONG PHẠM VI (cần quyết):**
  - kaihua n114, 4 dòng máy khí OC16 (KH-291GF, KH-327GF, KH-364GF, KH-316GF): tiêu đề "Standby Power | Prime power" trên "360 | 288 | 364 | 291" → theo tiêu đề prime > standby (nguồn tự mâu thuẫn); luật cũ (`powersIn` chặt) ghép theo độ lớn → đọc ra prime 360/288, standby 364/291. Đã thử luật "tiêu đề trái số thì để trống công suất": đúng cho 4 dòng này nhưng đổi ~90 bản ghi bảng đang đọc (wintpower, longkai, previa, yingtai, meao…) và sinh số SAI (wintpower n105 cặp "30/38" thành tiêu hao) → bỏ.
  - mpmc n114 MS530-2: dòng đầu bảng "Standby Power: 553kVA/530kW", dòng nhãn "663kVA / 530kW" (nguồn tự mâu thuẫn); `fromLabelTable` lấy số đầu → standby 553 kVA / 530 kW (0,96). Đã thử luật "một mức ghi hai số thì bỏ mức": đổi ~1.000 bản ghi bảng đang đọc (fdk-energy 242, westinpower 145, keypower 100…) → bỏ. row-flags không gắn cờ dòng này.

**row-flags** (`row-flags.mjs --json`, gốc ↔ nhánh): 162 → 162 dòng, đúng cùng khoá; không cờ mới. **`quality.mjs --check`**: "không chỉ số nào xấu đi quá ngưỡng". **Test**: `node --test suppliers/*.test.mjs web/test/{spec-norm,cap-read,static}.test.mjs` 1.298 / 1.298 qua (gồm 11 ca mới). `unread-tables.json` chụp lại (3.298 bảng có ghi chú / không bản ghi).

## 4. 209 bảng R1 để nguyên (danh sách đủ từng bảng: `dau-vao\bang-chua-doc-r1\con-lai.md`, `chan-doan-nhanh-con-lai.tsv`)

| loại | ý nghĩa / vì sao không đọc | bảng | NCC | dòng |
|---|---|--:|--:|--:|
| K | bản dịch máy ~20 thứ tiếng của bảng kente tiếng Anh n101 / n102 đã đọc. Đã kiểm 805 dòng: mọi model tổ máy đều đã có bản ghi (8 chỗ khác chỉ là mã kèm chữ dịch "KT2-W65 Fotoen", 7 dòng phụ trống); đọc thêm chỉ ra bản lặp + rác dịch ("15. 12", "Trydan.") | 40 | 1 | 805 |
| G | mỗi dòng chỉ một mã. Gồm: model TỔ MÁY không có mã động cơ (acepow "Generating Set Model \| Prime \| Standby" 13, teksan 4 bảng 1.180 dòng — cột Engine chỉ ghi hãng, yingtai "机组型号" 7, googol 9, frs, interpower, vpower, zc, kangwo, superwatt…), và trong G còn lẫn bảng đầu phát (STC / ST / TFW / YTW / LK164 / JET164 / HJI: eastern-lion, gordon, jet-power n119, keliang ×2, landtop ×2, lanzhou, longkai, nenjo ×2, shengfeng ×3, xinhengxin ×2, yihua, yingtai n115 / n116) và động cơ (kangjin ×2, penlucky ×3, rise n131, yingtai n101 b1 / n2003, zhengdian ZS195). `fromSupplier` chỉ ra bản ghi động cơ / đầu phát; bản ghi "tổ máy không động cơ" là thiết kế mới | 82 | 29 | 2.638 |
| A | đầu phát rời (hãng đầu phát, hoặc tiêu đề đầu là đầu phát): faraday 3, sincro-soga 12, xingguang 2, excel-power 2, rise 2, victory n102, hipower n1001 (thực ra mảnh bảng nhãn) | 23 | 7 | 292 |
| E | động cơ rời (tiêu đề đầu là động cơ, không cột model tổ máy): yingtai 8 ("发动机型号 Engine Type"), power-hf 4, acepow n126, kofo n101, superwatt n111 | 15 | 5 | 393 |
| U | ≥ 2 mã nhưng tiêu đề không cho biết cột động cơ: dòng tiêu đề chỉ còn đơn vị (camda 10 "Open Type \| kVA \| kW", sanq 3, mamo 3, jet-power 2, hosem, mecca 2), "Model" trơ hai lần (victory n109), "Configuration Reference" (superwatt), "MARCA \| MODELO" (stemac), "原动机 Prime mover" (yingtai 4), mingbang (đầu phát + "MB Series"), rise n104 (Model / New Model), westinpower n113 b20 (ô ắc quy), green-power n134 (máy bơm), acepow n116 | 33 | 15 | 707 |
| L | không tiêu đề, không phải kiểu dính dòng đầu: wartsila 6 (mảnh bảng động cơ), man-engines 3, mwm, rise n128, winco, xinhengxin n1002, conductorjasa n111, green-power n1001 | 15 | 8 | 173 |
| N | không ô mã (acepow n110: bảng tiêu hao theo % tải) | 1 | 1 | 1 |

**Bảng đầu phát / động cơ rời — luật phân biệt và kết quả:** bảng là đầu phát rời khi NCC là hãng đầu phát (faraday, xingguang, sincro-soga, excel-power) hoặc ô tiêu đề đầu là "Alternator (Model)"; động cơ rời khi ô tiêu đề đầu là động cơ ("Engine Model / Type", "发动机型号", "系列 | 型号 … 适配机组") và không có cột model tổ máy. Trong `fromSupplier`, các bảng này KHÔNG ra bản ghi nào (dòng chỉ có một mã → mã đó bị coi là model tổ máy `gi`, không có ô động cơ / đầu phát → không bản ghi) — kiểm bằng vết: 0 bản ghi từ 23 + 15 bảng (và ~30 bảng đầu phát / động cơ nằm trong nhóm G). 40 bảng mới đọc được đều có cột model tổ máy + cột động cơ (kiểm tay tiêu đề từng bảng). Tổng bảng đầu phát / động cơ rời trong R1 ≈ 38 + ~30 (trong G) ≈ 68 / 249 = 27% (thấp hơn ước 40% của chặng 1).

## 5. Ba mẫu đối chiếu nguồn (dòng nguyên văn trong `suppliers/cn`)

1. jinjia-power n101 (bảng 0, dòng 0): `| JJC-20GF | 20 | 22 | 25 | 4B3.9-G11 | 4 | 3.9 | 208 | 700 | 1650x720x1200` dưới "Model | Prime Power (kW) | Standby (kW) | kVA | Engine | Cyl. | Displacement (L) | Fuel (g/kW·h) | Weight (kg) | Dimensions (mm)" → động cơ 4B3.9-G11, tổ máy JJC-20GF, prime 20 kW, standby 22 kW (25 kVA bỏ vì không rõ mức), xi lanh 4, 3.9 L, 208 g/kWh, 700 kg, 1650x720x1200, hãng Cummins (tên trang).
2. kaihua-genset n114 (bảng 16, dòng 0): `| KH-200GF | None | None | 250 | 200 | DC09 320A 02-61 | 3400*1300*1900 | 2600` → động cơ DC09 320A 02-61 (Scania), tổ máy KH-200GF, 250 kVA / 200 kW mức "rated" (ô "None" làm tiêu đề không xếp được; luật ghép chặt cũ), 3400*1300*1900, 2600 kg.
3. simpson-power n101 (bảng 0, dòng 0): `| SP0011D-P | 11/14 | Perkins | 403D-15G | 1100×550×1030 | SP0011D-P.pdf` dưới "机 组 型 号 | 备 用 功 率 ( kW/kVA) | 发 动 机 品 牌 | 发 动 机 型 号 | 机 组 尺 寸 …" → động cơ 403D-15G, hãng Perkins, tổ máy SP0011D-P, standby 14 kVA / 11 kW, 1100×550×1030.
(URL nguồn: `sources/<NCC>/<n>.md` của từng hồ sơ; chưa mở lại trang web gốc — chỉ đối chiếu với bảng đã lưu.)

## 6. Rủi ro còn lại / chưa làm / quay lui

- **Top 30 chưa đo** (theo brief): cần điều phối đo `do-gop.mjs` gốc `d8db6166` ↔ nhánh `82587105`. Bản ghi mới chủ yếu là động cơ Scania (DC09/DC13/DC16), jinjia (Cummins / Yuchai / Volvo / Perkins / Mitsubishi / MTU…), simpson → dự kiến top 30 đổi ở gói Scania / jinjia / simpson.
- Dòng dữ liệu nằm trong dòng tiêu đề thứ 2 (simpson n102 "SP1800D-L…", và cả bảng ĐANG đọc: baifa 90 dòng, penlucky 34, welland 12, agg-fuzhou 10, simpson 8, visa 3 — tổng 157 dòng tiêu đề trong cn/): KHÔNG sửa (đổi chỉ số dòng / cách đọc của bảng đang đọc, ngoài phạm vi R1). Đề xuất việc riêng.
- Gộp dấu cách Hán ngắn ("机组重 量", "排 气 量"): làm thì thêm ~1.150 khối lượng + ~450 tiêu hao ở 9 NCC đang đọc (pengpai, bdadl, fukangsi, xingguang, honny, zhengdian, yunding…) — có vẻ đúng nhưng chưa soát; đề xuất việc riêng.
- 4 dòng kaihua OC16 và mpmc MS530-2 (mục 3) còn số nghi.
- mpmc "tank = 5500 kg / 1150 L" (nhãn "Weight / Tank Capacity" gộp) là cách đọc cũ của mọi bảng mpmc, không do việc này.
- Quay lui: revert PR #941 (một commit, chỉ `catalog.js` + test + CLAUDE.md + snapshot).

## 7. Tệp (`genbid-work\dieu-phoi\dau-vao\bang-chua-doc-r1\`)

- `1-chan-doan.mjs` (vết từng bảng), `2-gom.mjs`, `3-phan-loai-con-lai.mjs`, `4-soat-moi.mjs` (soát mọi bản ghi gốc ↔ nhánh), `dbg-walk.mjs` (in từng lượt `walkedSpecs` của một dòng).
- `chan-doan-goc.json` / `chan-doan-nhanh.json` (vết 249 bảng, gốc / nhánh), `con-lai.md` + `chan-doan-nhanh-con-lai.tsv` (209 bảng còn lại, từng bảng có tiêu đề + 2 dòng).
- `soat-cuoi.md` / `soat-cuoi.tsv`: MỌI bản ghi mới / mất / đổi in cạnh dòng nguồn (model, tổ máy, kVA / kW prime / standby, động cơ ↔ đầu phát, hãng, thông số, cờ ⚠) — **cho điều phối soát lại**; `soat-cuoi-model-to-may-moi.txt` (507 khoá tổ máy mới).
- `spec-diff-cuoi.txt` / `.md` (bản cuối), `spec-diff-1…5` (các lượt thử, mục 2–3), `row-flags-goc.json` / `row-flags-nhanh.json`.

## 8. Top 30 (đo cloud: gốc d8db6166 ↔ nhánh 82587105; 928 gói / 1.093 lượt / 0 lỗi)

Tệp ở `dau-vao\bang-chua-doc-r1\top30-cloud\`: `cmp-top30.md` (tóm tắt), `cmp-dong.tsv` (MỌI dòng đổi của mọi lượt + lớp), `cmp-ef.tsv` (dòng bị đẩy / được kéo, kèm lý do), `cmp-moi-vao-top.tsv`, `cmp-ct.md` + `ct-dropped.tsv` (chạy lại 101 lượt trên máy), `cmp-d1-model.tsv`; script `cmp-top30.mjs`, `luot-chi-tiet.mjs`, `cmp-ct.mjs`, `chk-top.mjs`, `chk-fe*.mjs`, `chk-d1.mjs`. `all` so theo ĐA TẬP khoá → điểm; khoá dòng bỏ trường đầu phát khi tra bản ghi. **Dòng "không rõ": 0.**

Lớp của một dòng (theo bản ghi động cơ của chính dòng, khoá NCC | model | chữ dòng, so `fromSupplier` gốc ↔ nhánh): **A1** bản ghi mới ở bảng gốc đã đọc (mã Scania bốn cụm thay model rác), **A2** bản ghi mới ở bảng R1, **B1** bản ghi mất (model rác / ô hai mã), **C** bản ghi của chính dòng đổi, **D1** dòng không đổi nhưng bản ghi KHÁC của cùng model động cơ mới / mất / đổi (đổi thông số gộp, số đông, hãng → đổi điểm hoặc luật loại), **D2** như D1 cho model đầu phát, **E / F** dòng không đổi, điểm không đổi, vào / ra top vì luật chọn top. Điểm của một dòng chỉ phụ thuộc chính dòng + thông số / hãng của model động cơ và đầu phát của nó, nên mọi dòng đổi mà không thuộc A–D đều phải là E / F; kết quả: 0 dòng ngoài các lớp.

Lượt (1.093): giống hệt 148; **top đổi 209** = 82 đổi tập dòng + 7 cùng tập chỉ đổi điểm (D1) + 120 cùng tập, cùng điểm, chỉ đổi THỨ TỰ các dòng hoà điểm (thứ tự duyệt động cơ đổi vì có model mới; sort giữ thứ tự cũ cho dòng hoà); **chỉ `all` đổi 718**; **chỉ `dropped` đổi 18** (+1 lượt IB2200018828#0 cũng đổi `dropped` nhưng đã đếm ở nhóm hoà điểm).

| | A2 | A1 | B1 | C | D1 | D2 | E / F | tổng |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| `all` vào (dòng) | 11.241 | 2.233 | | | 120 | | | 13.594 |
| `all` ra | | | 902 | 2 | 75 | | | 979 |
| `all` đổi điểm | | | | 3 | 1.159 | 36 | | 1.198 |
| top vào | 67 | 37 | | | 29 | 1 | 16 (E) | 150 |
| top ra | | | 38 | 1 | 28 | 2 | 65 (F) | 134 |

**(1) 718 lượt chỉ `all` đổi, 18 lượt chỉ `dropped` đổi.** `all` là mọi dòng qua dải công suất (`near`) và các ngưỡng HSMT; 887 bản ghi mới (jinjia, simpson, aj-power Scania…) vào `all` của 858 lượt (A2) / 244 lượt (A1) nhưng điểm không đủ vào top. `all` ra 902 dòng là bản ghi model rác cũ (tecnogen AUS7310, cgm B300/B400/B750, baifa "4 months", aj-power đầu phát làm động cơ) nay mang mã đúng: chúng ra với khoá cũ và vào lại (A1) với khoá mới. `dropped` chỉ là SỐ dòng bị luật HSMT loại; chạy lại 101 lượt trên máy (bidhist máy 18/11, `luot-chi-tiet.mjs`; gốc khớp cloud 101/101 lượt: `all`, top, `dropped`) cho danh sách: ở 19 lượt chỉ đổi `dropped`, chênh của TỪNG lượt bằng đúng số bản ghi mới bị loại (vào 80: ngưỡng prime 40, dung tích 22, xi lanh 13, nhiều ngưỡng cùng lúc 5) trừ bản ghi mất (ra 7, ngưỡng prime); `rowflag` không đổi ở lượt nào. Ở các lượt khác còn có dòng CŨ đổi lý do loại (`maxDisp` → `maxDisp,cyl`…): 132 dòng, 100 % thuộc model động cơ có bản ghi mới / mất (D1; 98 ở IB2400238834#0).

**(2) Dòng CŨ đổi điểm: 1.198 dòng, TẤT CẢ đều TĂNG** (|Δ| ≤ 10: 810, 11–50: 335, > 50: 53, lớn nhất 80). D1 1.159: 34 model; thông số gộp của model đổi (thêm dung tích / xi lanh / tiêu hao từ dòng mới, số đông `win`) ở mọi model, trong đó 6R1600G10F (MTU, +1 dòng) chiếm 640 dòng-lượt, SC10E420D2 209, 8V1600G20F 201, YC6K570D30 158, 1106A70TG1 97; hãng đổi ở 2 model: 4016TAG không hãng → Perkins (bản ghi simpson mới ghi Perkins), AUS7310 không hãng → Mitsubishi (xem dưới). D2 36 dòng: model đầu phát có bản ghi R1 mới. C 3 dòng: simpson SP1540DP / 4016TAG (bản ghi đổi: thêm kích thước, hãng). Từng dòng: `cmp-dong.tsv`; từng model: `cmp-d1-model.tsv`.
- Sót từ gốc, KHÔNG do nhánh tạo: tecnogen MI45TSX* (động cơ Mitsubishi "S4S DT SD") vẫn đọc mã đầu phát "AUS7310" làm động cơ (gốc cũng vậy). 21 dòng AUS7310 khác nay thành mã Scania nên khoá AUS7310 chỉ còn dòng này, hãng thành Mitsubishi, điểm −10 → 50 (IB2300135189#0, không vào top). Ghi vào việc đề xuất.

**(3) Dòng mới vào top thiếu công suất: 45 / 104 dòng, 34 / 48 lượt.** 43 không có prime: simpson 25 (chỉ standby, máy xăng / diesel nhỏ 4–11,5 kVA), rcg 9 (chỉ standby, Volvo Penta), kaihua 6 (chỉ "rated": cột Standby ghi "None"), huadong 3 (standby + rated); 2 không có kVA: jinjia YC12VC2700D31 / YC12VC2510D31, nhưng hai lượt đó HSMT ghi kW (1.800 / 1.600 kW) nên so cùng đơn vị, tỉ số 1,00. Dải (`cap` thật từ chạy lại): mọi 104 dòng mới vào top có prime tương đương (prime, không có thì standby ÷ 1,1, rồi rated) / cap = 0,90–1,27; **không dòng nào ngoài dải**. 17 dòng có prime tương đương dưới cap (standby ÷ 1,1 < cap, ví dụ rcg TAD1343GEB standby 413 kVA ở gói 410 kVA): cùng cách xử lý như mọi dòng chỉ-standby đang có. 4 dòng trên 1,25 là simpson ZS182F 4,2 kVA ở gói 3 kVA, đã bị trừ điểm (−25).

**(4) Dòng bị đẩy khỏi top (F, 65 dòng, điểm không đổi):** hoà điểm ở biên 29 (điểm bằng điểm cuối top mới, chỉ đổi thứ tự); điểm dưới biên mới (dòng mới điểm cao hơn vào) 13; trần 4 dòng / NCC 7; trần 3 dòng / động cơ 2; chỗ dành (12 dòng hãng TQ / hãng G7-G20) hoặc trần hãng 14. E 16 (được kéo vào): trần 4 dòng / NCC (dòng cùng NCC ra) 12, hoà điểm 2, trước bị chặn 1, chỗ dành 1. Lý do E / F suy theo luật chọn top (`candidates` dòng 1563–1620), không chạy lại từng bước `pick`. Dòng điểm cao bị đẩy (≥ 150): stone-power KT38G 273 (IB2300000242#0), fdk-energy 4HTAA4.3-G34 274 (IB2400459339#1), eastern-lion YC4A190 257, uleengen YC4A180 253, bobig 4HTAA4.3 253 (IB2400238834#0), kaihua WP13 217 (IB2500314401#0), victory 2806A 162; đủ 36 dòng "thật" (không hoà điểm) ở `cmp-ef.tsv`.

## 9. Ngoại lệ theo dòng (Khoa 19/11/2026), commit 57350670

- `ROW_EXCEPTIONS` trong `catalog.js` (repo chưa có cơ chế ngoại lệ dòng chạy cả web lẫn bot; `rowok` là trạng thái web): khớp NCC + n + model tổ máy + chữ dòng nguyên văn, ghi note "ngoại lệ theo dòng". kaihua n114 KH-291 / 327 / 364 / 316GF `nopower` (bản ghi giữ, công suất trống); mpmc n114 MS530-2 `drop`. Không sửa `suppliers/cn`.
- `spec-diff git:82587105 .`: đúng 5 bản ghi (4 power → trống, 1 mất), đảo vai 0 → 0; 1.301 test qua (3 test mới: 5 dòng, dòng bên cạnh KH-512GF / KH-200GF / MS500-2 không đổi, chữ nguồn đổi thì ngoại lệ hết hiệu lực); `quality --check` không xấu đi; `unread-tables.json` +1 bảng (mpmc n114).
- Chạy lại 101 lượt trên máy với code này: khác 82587105 chỉ ở 12 lượt, đều do các dòng kaihua OC16 rời `all` (công suất trống nên không qua dải) và `dropped` −1 / −2 ở 2 lượt (IB2300025731#0, IB2400116021#0).

## Cần ghi nhớ

- Khoa đã quyết 19/11: (1) bản ghi "tổ máy không mã động cơ" làm (VIỆC SAU, không trong PR #941); (2) kaihua OC16 4 dòng để trống công suất; (3) mpmc MS530-2 bỏ — (2)(3) đã làm ở mục 9.
- Đề xuất thêm: tecnogen MI45TSX* còn đọc "AUS7310" (mã đầu phát) làm động cơ (mục 8 (2)).
- Việc đề xuất riêng (không tự mở): dòng dữ liệu nằm trong dòng tiêu đề thứ 2 (157 dòng / 6 NCC); gộp dấu cách Hán ngắn ở tiêu đề (9 NCC đang đọc).
