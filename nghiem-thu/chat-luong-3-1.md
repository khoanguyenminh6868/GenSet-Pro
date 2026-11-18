# chat-luong-3, chặng 1: đường đọc "đoán" trong `web/catalog.js` — đo và đề xuất (18/11/2026)

Giao: phiên điều phối (Khoa duyệt 18/11/2026). Chặng 1 chỉ đo, KHÔNG mở PR, CHỜ Khoa chọn phương án.
Mốc so: main `7d632e30` (#903). Bản thử: worktree `wt-chat-luong-3` (không push), bản vá gắn nhãn `dau-vao\chat-luong-3\catalog-gan-nhan.patch`.

## Kết luận ngắn

1. **Tắt hẳn đường đoán thì mất rất nhiều số đúng để bỏ rất ít số sai.** Ví dụ đường lớn nhất (E2: chọn ô động cơ khi tiêu đề nhiều tầng không đặt được đúng ô) đi qua 23.671 / 59.222 bản ghi (40%) ở 109 NCC; NCC khác xác nhận đúng vai 20.877, mâu thuẫn 10. Tắt nó là bỏ 40% danh mục để gỡ 10 lỗi.
2. Lỗi đọc thật nằm ở **vài bố cục cụ thể**, không trải đều. Đề xuất (phương án C): **giữ mọi đường, thêm 3 chốt chặn hẹp** "không hiểu thì để thiếu":
   - L3B: ô "a/b" trong bảng nhãn chỉ ghép thành kVA / kW khi nhãn ghi mức / đơn vị (gb-power: chân trang "GB POWER | 3/4" đang thành 4 kVA / 3 kW ở 65 bản ghi).
   - WCHK: dòng điện / điện áp đọc theo vị trí phải khớp công suất của chính dòng (power-hf, yingtai, sr-genset, bruno: dòng thiếu ô làm lệch cột).
   - LROW: dòng bảng tự là cặp "nhãn | giá trị" (ô "型号" / "Model" giữa dòng) thì không đọc như dòng bảng.
   Ba chốt cùng nhau: bỏ khoảng **322 giá trị sai**, mất khoảng **6 giá trị đúng** (số đã soát theo NCC, chi tiết mục 4).
3. **"Danh sách bảng chưa đọc được" CHƯA có ở đâu cả.** Hôm nay đã có 3.266 / 9.787 bảng có dòng mà không cho bản ghi nào (222 NCC), không ai biết. Phải làm mới (mục 5).

## 1. Cách đo

- Gắn nhãn từng đường đoán trong bản sao `catalog.js` (mỗi bản ghi mang `guess`, mỗi thông số đọc theo vị trí mang `via`); `GENBID_GUESS_OFF=<đường>` tắt đường đó (để thiếu). Không tắt gì: `spec-diff.mjs git:origin/main .` ra **0 khác** trên 59.222 bản ghi (kiểm bản gắn nhãn không đổi hành vi).
- Mỗi đường: so main ↔ bản tắt bằng `diff()` của `suppliers/spec-diff.mjs` (mọi trường, mọi bản ghi `suppliers/cn`, không lấy mẫu), rồi phán xét MỌI giá trị mất / đổi theo dữ liệu các NCC KHÁC trên main:
  - vai động cơ / đầu phát: NCC khác đọc mã đó cùng vai = xác nhận; chỉ ở vai kia = mâu thuẫn; cả hai = luật số đông (≥3 NCC, gấp ≥3 lần), không thì "chưa rõ"; không ai có mã = "không đối chiếu".
  - công suất (cùng model, mức, đơn vị) và thông số động cơ (xi lanh, dung tích, đk × hành trình, tỉ số nén, công suất động cơ): trùng ±2% (công suất động cơ ±3%) một NCC khác = xác nhận; ≥2 NCC khác mà mọi số lệch >15% = mâu thuẫn.
  - thông số tổ máy (khối lượng, kích thước, tiêu hao, dòng điện, điện áp…): không có model chung để so → chỉ **tự kiểm** với công suất của chính dòng (`checkSpec` của spec-diff); dòng không có công suất thì "không kiểm được". Tự kiểm KHÔNG phải xác nhận của nguồn khác.
- **Giới hạn của phép xác nhận công suất (đã đo, không ước):** một model động cơ chạy nhiều cỡ tổ máy, nên số lệch 10% cũng "xác nhận" ở 42–51% ca (E2: 29.718 / 57.835; PW: 4.237 / 8.346; FL: 610 / 1.438). "Xác nhận" công suất là bằng chứng yếu; "mâu thuẫn" vẫn có nghĩa. Thông số động cơ chắc hơn: lệch 10% vẫn "xác nhận" chỉ 2% (S2), 1,6% (WR), 5% (WG), 20% (WE, do công suất động cơ).
- Lệnh, script, tệp ra: `genbid-work\dieu-phoi\dau-vao\chat-luong-3\` (`guess-measure.mjs`, `summarize.mjs`, `view.mjs`, `unread-now.mjs`; `out\summary.txt`, `out\ex-<đường>.json` = mọi ca kèm dòng nguồn, `out\full-<đường>.txt` = bản đầy đủ kiểu cmpSpec). Chạy lại: `node guess-measure.mjs <worktree> <thư mục ra> [đường,...]`.
- Không chạy đo top 30 (theo brief: máy đang chạy `do-gop.mjs`).

## 2. Các đường đoán và số đo (toàn bộ `suppliers/cn`)

Tổng: 59.222 bản ghi, 6.521 bảng cho ra bản ghi, 267 NCC.

### Gán vai động cơ / đầu phát (theo vị trí hoặc dạng mã)

| Đường | Đi qua: bản ghi / bảng / NCC | Tắt thì mất | Vai: xác nhận / mâu thuẫn / chưa rõ / không đối chiếu | Đề xuất |
|---|---|---|---|---|
| E2 tiêu đề có cột động cơ, không dòng tiêu đề nào đặt đúng ô (nhiều tầng, khác độ rộng) → mã đầu tiên không dạng đầu phát | 23.671 / 1.103 / 109 | 23.671 bản ghi động cơ; 6.024 đầu phát mất "ô kia" | 20.877 / 10 / 0 / 2.821 | Giữ |
| E3 không có ô tiêu đề động cơ (chỉ hãng động cơ trong tiêu đề) | 4.008 / 169 / 32 | 4.008 | 3.448 / 2 / 0 / 559 | Giữ |
| E4 bảng của hãng động cơ, mã đầu tiên của dòng | 733 / 121 / 20 | 733 | 309 / 1 / 0 / 423 | Giữ |
| A2 tiêu đề có cột đầu phát, không đặt đúng ô → theo `ALT_CODE` hoặc mã duy nhất sau động cơ | 6.377 / 345 / 42 | 6.377 | 2.620 / 3 / 64 / 3.729 | Giữ |
| A3 không có ô tiêu đề đầu phát, mã dạng đầu phát sau động cơ | 811 / 31 / 10 | 811 | 448 / 0 / 17 / 367 | Giữ |
| L1 bảng nhãn: "Model" trơ, vai theo thứ tự (Details) / dạng mã | 52 / 14 / 4 | 52 | 46 / 0 / 0 / 6 | Giữ |
| L2 bảng nhãn: "Model" kề dòng động cơ (himoinsa, hipower) | 167 / 86 / 3 | 148 bản ghi + 19 đổi | 145 / 0 / 0 / 22 | Giữ |
| G2 model tổ máy: ô 0 / 1 là mã, không tiêu đề model | 34.017 / 1.152 / 110 | trường `genset` của 34.017 bản ghi | không có nguồn để so | Giữ |

Lỗi vai thật (tất cả, đã xem dòng nguồn):
- uleengen n115 r20: `| CCFJ600W | 600 | 750 | 12平方米33cd748e200 | 680 | … | MX-H-630-4 |` — ô động cơ là chữ dịch máy hỏng (không phải mã), nên đầu phát MX-H-630-4 thành động cơ; tương tự `f6l912吨 … | 224E` (10 bản ghi, đều uleengen bản dịch tiếng Trung).
- xingguang-jiangsu n108: `| XG- 15GF | 15/19 | ZS1115或2100D | STC-15 |` — ô động cơ ghi hai mã nối bằng "或", đầu phát STC-15 thành động cơ (2).
- vantek n101 `| CCFJ280J-WTP | 280 | 3S0 | N855-DM |` ("3S0" OCR của 350; PR #901 đang sửa); chenxing-weifang `| 机组型号 | 30GF | 型号 | 4BT3.9-G2 | 型号 | 30GF` và huachai-deutz `| Model | 30GF | Model | F4L912D | Model | PI144J` (dòng tự là cặp nhãn | giá trị, model tổ máy thành động cơ / đầu phát).

### Công suất

| Đường | Đi qua | Tắt thì mất (giá trị) | xác nhận* / mâu thuẫn / chưa rõ / không đối chiếu | Đề xuất |
|---|---|---|---|---|
| PW tiêu đề không khớp dòng → ghép hai ô kề đúng hệ số 0,8 | 3.103 bản ghi / 173 bảng / 58 NCC | công suất của 3.087 bản ghi | 8.346 / 62 / 816 / 1.822 | Giữ |
| PWC mức lấy từ phần còn lại của tiêu đề / tên bảng | 113 / 4 / 4 | đổi mức thành "rated" | không có mâu thuẫn ở giá trị cũ | Giữ |
| L3 bảng nhãn: "a/b" không đơn vị ghép theo tỉ số | 497 / 411 / 12 | 475 bản ghi | 1.357 / 76 / 140 / 155 | **Thu hẹp (L3B)** |
| FL dòng máy Tìm NCC: số còn lại ghép theo tỉ số (`rowPowerOf`) | 507 / 507 / 6 | 507 | 1.438 / 0 / 12 / 17 | Giữ |

\* xác nhận công suất là bằng chứng yếu (mục 1).

- 62 mâu thuẫn của PW phần lớn là nguồn gõ sai, không phải đọc sai: yanan `| YN412C | 330kVA | 375kW | 300kVA | 280kW |`, comappower `| COM660PE | 275kVA | 220kW | 600kVA | 480kW |`; một phần là đọc đúng mà số đông lệch (máy nhỏ 5–9 kVA). yingtai-jiangsu 22 ca: bảng `主用功率（主用）| 备用功率（备用）| 电流…` trên `| 16GF | 16 | 20 | 30 | 25 | 28.8 | 36 |` đọc prime 20/16, standby 30/25 — nguồn tự lộn số (30 / 25 đứng sau 20).
- 76 mâu thuẫn của L3 đều là gb-power (lỗi đọc thật): dòng chân trang `| GB POWER | 3/4` (trang 3/4) thành công suất "rated 4 kVA / 3 kW" của 65 bản ghi.

### Thông số đọc theo vị trí

| Đường | Thông số đi qua (bản ghi / bảng / NCC) | Tắt thì mất (theo dòng) | Thông số động cơ: xác nhận / mâu thuẫn / không đối chiếu | Thông số tổ máy tự kiểm: hợp lý / vô lý / không kiểm được | Đề xuất |
|---|---|---|---|---|---|
| S2 dòng dài hơn tiêu đề 1 ô, ô đầu là mã → lệch 1 ô | 3.606 (944 / 38 / 3) | 3.606 | 1.227 / 15 / 767 | 514 / 0 / 1.056 | Giữ |
| WE đi từng ô từ ô động cơ / đầu phát | 39.490 (18.512 / 651 / 86) | 11.359 giá trị (đếm cả hai bản ghi của một dòng) trên 5.812 bản ghi | 3.394 / 46 / 796 | 2.262 / 119 / 2.187 | Giữ + **WCHK** |
| WG đi từ model tổ máy ở ô 0 | 17.361 (7.489 / 290 / 46) | 1.000 bản ghi | 127 / 1 / 229 | 949 / 7 / 105 | Giữ + **WCHK** |
| WR đi từ ô cuối (không ô nào biết vị trí) | 44.473 (17.503 / 689 / 85) | 6.747 bản ghi | 2.436 / 21 / 2.060 | 8.895 / 8 / 3.548 | Giữ + **WCHK** |

- "Mâu thuẫn" của thông số động cơ ở WE / WR phần lớn là NGUỒN ghi sai, đọc đúng cột: agestar `6BTAA5.9-G12 … | 8.3 |` (26 ca, báo cáo rà soát A5 đã ghi), victory `WP4D100E200 … | 6 | 105 | 120 | 6.25 |` (số của WP6). Lỗi đọc thật: yanfa-yancheng `| YC-200GF | … | QSL9-G2 | 9 | 231 | 58.8 |` (58,8 L/h tiêu hao thành dung tích, 8 ca).
- "Vô lý" của tổ máy gần như toàn là dòng điện / điện áp (mục 4).

## 3. Các phương án

| Phương án | Bỏ được (giá trị sai) | Mất (giá trị / bản ghi đúng) | Ghi chú |
|---|---|---|---|
| A. Tắt hết đường đoán | mọi lỗi kể trên (~400 giá trị) | ~35.600 bản ghi (E2 + E3 + E4 + A2 + A3), hàng chục nghìn thông số đã xác nhận | Không đề xuất |
| B. Tắt riêng L3 | 76 công suất sai (gb-power) | 1.357 công suất được xác nhận (westinpower, keypower, powerzoo…) | Không đề xuất: L3B làm được việc này mà không mất |
| B'. Tắt riêng WE / WR | ~120 dòng điện / điện áp sai | 3.394 / 2.436 thông số động cơ đã xác nhận + hàng nghìn kích thước, khối lượng hợp lý | Không đề xuất |
| **C. Giữ mọi đường + 3 chốt hẹp (L3B, WCHK, LROW)** | **~322** | **~6** | **Đề xuất** |
| Đã thử, bỏ: ONE (tiêu đề có cả cột động cơ lẫn đầu phát mà dòng chỉ một mã → để thiếu) | 8 vai sai | 3.790 động cơ đã xác nhận (dòng không ghi đầu phát rất phổ biến) | Quá tay |

Mỗi phương án đã chạy `spec-diff.mjs` (bản đầy đủ: `out\spec-diff-de-xuat.txt` / `.md` cho C, `out\spec-diff-E2.md` cho E2).

## 4. Phương án C chi tiết (đo trên bản thử, `spec-diff git:7d632e30 .` với `GENBID_GUESS_OFF=L3B,LROW,WCHK`)

Kết quả spec-diff: 59.222 → 59.212 bản ghi, 234 khác, 11 mất, 1 thêm, 61 bảng; `{"voltage bỏ":135,"power":65,"current bỏ":119}` (đếm cả bản ghi động cơ lẫn đầu phát của cùng dòng); đảo vai 3 → 3.

**L3B** — 65 bản ghi, tất cả gb-power: bỏ công suất "rated 4/3" (76 giá trị mâu thuẫn, 54 còn lại không có gì để so; cùng một dòng chân trang). Mất số đúng: 0 (bản đầu của chốt làm mất 571 công suất westinpower `| Power(ESP) | kVA/kw | 2500/2000`; đã sửa chốt để nhận ESP / PRP và ô đơn vị, đo lại còn 0).

**WCHK** — 246 giá trị (119 dòng điện, 127 điện áp), đã soát theo NCC:
- Sai, bỏ đúng (≈ 239): power-hf 105 + 85 (`| 13 | PHF-100RX | 100 | 110 | 180 | … | ● |`: dòng thiếu ô điện áp / tần số, 100 kW đọc thành dòng điện, 110 kW thành điện áp), yingtai 24 điện áp + 2 dòng điện (`| 1120GF | 1120 | 1230 | 128 |`: 1230 kW thành điện áp; `| 1000GF1 | | 1000 | 6300 |`: 6300 V thành dòng điện), sr-genset 15 (104,5 kVA thành điện áp; PR #901 cũng sửa), zhengdian 5 (`| CCFJ5-xx | 5/6.25 | 9.1 | 195 |`: 195 không phải dòng điện, 9,1 mới là), bruno 3 (tháp đèn).
- Đúng mà bị bỏ: huatai-yangzhou 3 (`| 700GF | 140/165 | 1267 |`: 1267 A đúng cho 700 kW, nhưng công suất của dòng đọc sai "140/165" nên không khớp).
- Chưa rõ: 4 (xinzhengfa 2, kangwo 1, yunding 1).
- Máy cao thế: bản đầu bỏ nhầm 65 dòng điện đúng (honny `HGM1100EHV10.5` 55 A ở 10,5 kV; yingtai 128 A ở 6,3 kV); đã thêm hệ số 3,3–11 kV, đo lại còn 0.

**LROW** — 11 bản ghi: bỏ 7 vai sai (zichai, cameo, huachai `| Model | 30GF | Model | F4L912D |`, chenxing đầu phát "30GF"), mất 3 động cơ đúng (chenxing NT855-GA, 4BT3.9-G2; huachai F3L912D). Kubota `| Model | - | D1703` chuyển sang dòng khác (1 mất, 1 thêm, cùng model).

**Ước tổng** (từ các con số trên, không phải phép đo riêng): bỏ ≈ 76 + 239 + 7 = **322** giá trị sai; mất ≈ 3 + 3 = **6** giá trị đúng. Ảnh hưởng tới top 30 ứng viên: **chưa đo** (đo ở chặng 2). Dòng điện / điện áp không phải tiêu chí loại của `candidates` hiện nay (tôi chưa kiểm hết `khoaRules` / `fuelChecks` có dùng không: kiểm ở chặng 2).

Không làm được bằng chốt (để thiếu cũng không gỡ được, cần sửa đọc riêng hoặc là lỗi nguồn): vai sai uleengen (ô động cơ là chữ dịch hỏng) và xingguang ("A或B") — mỗi loại cần nhận diện ô riêng; yanfa 58,8 L/h thành dung tích (cột đơn vị lệch); nguồn ghi sai (agestar, victory, yanan, comappower).

## 5. "Danh sách bảng chưa đọc được": nên nằm ở đâu

Đã có gì (kiểm trong repo, 18/11):
- `suppliers/quality.mjs`: tỉ lệ thiếu theo từng mã thông số, không theo bảng; không biết bảng nào không đọc được.
- `suppliers/spec-todo.mjs` + `spec-none.json`: theo NCC (NCC không có dòng bảng nào), không theo bảng.
- `suppliers/gaps.mjs` → `gaps/current` → màn Nhà cung cấp, mục "Việc cần thu thập": thông số thiếu so với nhu cầu HSMT, không nói bảng nào đọc hỏng.
- `suppliers/spec-diff.mjs` + CI `spec-diff.yml`: chỉ so hai bản mã, không có danh sách thường trực.
- `catalog.js` khi bỏ (saneSpecs, walkedSpecs dừng, titledPowers không khớp…) KHÔNG ghi lại gì: bỏ là mất dấu.
→ **Chưa có danh sách bảng chưa đọc được nào.** Hôm nay đã có 3.266 / 9.787 bảng có dòng (42.075 dòng, 222 NCC) không cho bản ghi nào (lees-power 166, haut-power 139, aosif 137, longkai 130, perkins 125…); một phần là bảng không phải máy phát (phụ kiện, tháp đèn), một phần là bố cục chưa hiểu — chưa phân loại.

Đề xuất (TẤT CẢ phải làm mới, chặng 2):
1. `catalog.js`: thêm `GenbidCatalog.unread(suppliers)` (hoặc trường đi kèm `build`) trả `{ supplierId, n, table, row, reason }` cho: bảng có dòng mà không ra bản ghi; dòng / giá trị bị chốt chặn bỏ (L3B, WCHK, LROW, và các chốt sẵn có `saneSpecs`, `titledPowers` veto). Không đổi kết quả `build`.
2. `suppliers/unread-tables.mjs`: in danh sách theo NCC / lý do; `--json` ghi `suppliers/unread-tables.json` (tệp trong repo, mỗi PR sửa đọc thấy nó đổi).
3. `spec-diff.mjs --md`: thêm một dòng "bảng / dòng chưa đọc được: trước → sau, theo lý do", để PR sửa mã đọc thấy ngay mình làm thêm hay bớt bảng không đọc được.
- Ai dùng: các phiên Claude sửa bộ đọc (chọn bảng nào đáng viết mã đọc). **Không thêm việc tay cho Khoa**, không có màn hình nào hiện danh sách này. Muốn hiện trên web (vd. trong "Việc cần thu thập") là việc riêng nữa, cần Khoa duyệt.

## 6. Khoa cần quyết

1. Chọn phương án: C (giữ mọi đường + L3B, WCHK, LROW) / chỉ một phần của C / khác.
2. "Danh sách bảng chưa đọc được": làm cả 3 phần mục 5 / chỉ tệp trong repo / để sau.
3. (Tuỳ chọn) có muốn hiện danh sách trên web không (việc mới, không nằm trong chặng 2 nếu không chọn).

## 7. Chưa kiểm được / rủi ro

- Top 30 ứng viên: chưa đo (cấm ở chặng 1). Chặng 2 đo trên toàn bộ gói như #892 / #894.
- Phán xét công suất là bằng chứng yếu (mục 1); thông số tổ máy chỉ tự kiểm, không có nguồn khác so.
- Tag đường đoán theo kết quả cuối: bản ghi gộp (`mergeRepeats`) chỉ mang nhãn của bản đầu; E2 / E3 phân theo "có dòng tiêu đề đúng độ rộng đặt ô đó" — tiêu đề lệch nhưng vẫn đúng ô vẫn tính là E2.
- PR #901 (lệch cột 8) cũng sửa sr-genset điện áp và vantek "3S0": chặng 2 rebase lên main sau #901 và đo lại; 15 ca sr-genset của WCHK sẽ không còn.
- Quay lui: bản thử chưa push; chặng 2 mỗi chốt một commit, gỡ riêng được.

## Tệp

- `genbid-work\dieu-phoi\dau-vao\chat-luong-3\`: `catalog-gan-nhan.patch` (bản thử, có công tắc `GENBID_GUESS_OFF` — chặng 2 KHÔNG đưa công tắc / nhãn này vào main, chỉ đưa chốt đã chọn), `guess-measure.mjs`, `summarize.mjs`, `view.mjs`, `unread-now.mjs`, `out\` (summary, ví dụ mọi ca, spec-diff).
- Worktree `C:\Projects\GenSet Pro\wt-chat-luong-3` (detached ở `7d632e30`, có bản vá chưa commit) giữ lại cho chặng 2.

## Cần ghi nhớ

- Đo "đường đoán": tắt hết đường đoán mất ~60% bản ghi (E2 riêng 40%) để gỡ vài chục lỗi; lỗi nằm ở bố cục cụ thể → chốt hẹp + danh sách chưa đọc được (chờ Khoa quyết).
- `checkSpec` của spec-diff trả `false` (vô lý) cho dòng điện / khối lượng / công suất động cơ khi dòng KHÔNG có công suất: đếm "vô lý" phải tách ca không có công suất (đã gặp: 700+ ca comler, hanyang báo vô lý nhầm). Có thể sửa trong spec-diff (ngoài phạm vi, chưa sửa).
- Xác nhận công suất theo model động cơ là yếu (~50% số lệch 10% vẫn trùng một NCC nào đó).
