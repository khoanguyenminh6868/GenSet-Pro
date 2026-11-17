# Nghiệm thu cfg-chuyen-mon-2 — Kiểm tra tổ hợp

PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/504 (draft, nhánh `cfg-combo`, đã rebase lên origin/main 0b28915 sau #503 của tuyến B)

## Tệp đã đổi
- `web/conversions.js` — 2 công thức mới kèm `basis`:
  - `kwe_from_kwm`: Pₑ (kWe) = Pₘ (kWm) × η (%) / 100 — "Hiệu suất đầu phát η = công suất điện ra / công suất cơ vào trục (IEC 60034-2-1)".
  - `bmep_4s`: BMEP (bar) = 1200 × P (kW) / (V (L) × n (v/p)) — động cơ 4 kỳ, 1 chu trình / 2 vòng.
- `suppliers/config-bot.mjs` — `hsmtCombo(text, reqs)`, `enginePowerOf(row)`, `comboChecks(c, …)`, `comboNotes(result, combo)`; gọi trong `check()` (sau `confirmChecks`); `rfqOf` thêm câu hỏi của `c.comboAsk`, và dòng yêu cầu `load_step` hỏi "Gửi kết quả thử nhận tải một bước theo ISO 8528-5…". `REQ_VERSION` 4 → 5.
- `suppliers/reqcodes.mjs` — mã `alt_excitation` (Kích từ PMG / AREP) và `alt_short_circuit` (Ngắn mạch duy trì 300% / 10 s), đặt trước `alt_type`; kind `model`.
- `web/index.html` — chỉ phần cấu hình: `cfgComboHtml` (cảnh báo `c.warnings` dạng note vàng; dòng xám "Cân bằng công suất: …", BMEP) gọi ngay trước khối câu hỏi gửi NCC. Grep trước: tên chưa có. Không đụng phần Giá gợi ý / Tổng quan.
- `suppliers/combo.test.mjs` (mới, 7 test).
- Không đụng `web/bidprice.js`, `suppliers/bidprice-bot.mjs`, `genbid-hsmt\`.

## Hành vi (không đổi trạng thái check nào, không đổi xếp hạng)
1. **Cân bằng công suất**: chỉ tính khi (a) dòng tổ máy ghi công suất động cơ kèm mức — nhãn/giá trị có "prime/PRP/COP/liên tục" hoặc "standby/ESP/dự phòng", hoặc nhãn "(prime/standby)" với giá trị "a/b"; "Engine power (kW) = 264" không có mức thì KHÔNG dùng (prime và standby lệch ~10%, đoán sẽ quyết định kết quả); (b) thông số theo model của đầu phát có "Efficiency" 80–99,9% (loại "Mechanical Efficiency" — số ~38% là hiệu suất nhiệt động cơ bị gán nhầm cho đầu phát trong danh mục), mọi nguồn ghi cùng số (lệch > 0,5 → không dùng). So với kWe cùng mức của dòng tổ máy và kWe của yêu cầu công suất HSMT (lấy số lớn hơn). Thấp hơn → `c.warnings`; thiếu số → "chưa kiểm được, thiếu …". kVA đầu phát ≥ kVA tổ máy: **không kiểm được** — danh mục không có công suất định mức của đầu phát theo model.
2. **Quá tải trên ESP**: câu HSMT có "quá tải / overload" + 10% / 110% và "dự phòng / standby / ESP" (không có "liên tục / prime") → `notes` "Cần làm rõ HSMT … theo ISO 8528-1 mức ESP không có quá tải". Không đổi trạng thái.
3. **Hiện trường**: nhiệt độ môi trường / làm việc / vận hành > 40 °C (≤ 60, bỏ "nhỏ nhất / tối thiểu"), độ cao > 1.000 m (bỏ "cường độ cao") → câu hỏi xin đường giảm công suất (nếu HSMT chưa có yêu cầu mã `ambient` — có thì dòng đó đã hỏi đường giảm công suất). Không tính số: không nguồn nào có hệ số giảm công suất.
4. **Nhận tải / G2–G3**: yêu cầu `load_step`, hoặc `iso8528_class` có ghi class / 8528-5, hoặc câu HSMT tương ứng → câu hỏi xin kết quả thử ISO 8528-5; BMEP tính khi có kWm có mức + dung tích + tốc độ, chỉ để tham khảo, KHÔNG kết luận.
5. **Loại tải**: bơm chữa cháy (không tính "phòng cháy chữa cháy"), khởi động trực tiếp / DOL, UPS, biến tần / VFD, ngắn mạch duy trì / 300% (3 In) 10 s, PMG / AREP / nam châm vĩnh cửu → mỗi loại một câu hỏi rfq (bỏ khi check của mã tương ứng đã đạt). Câu trích là dòng HSMT chứa nó. Mã mới làm `missingCodes` báo "MÃ YÊU CẦU CHƯA CÓ" cho agent khi HSMT nêu mà yêu cầu chưa có.

## Lệnh kiểm + đầu ra thật
```
cd wt-cfg-kind/suppliers && node --test      # sau rebase lên 0b28915
# pass 173
# fail 0
```
CI PR #504 (run 42843017409, f0ba19c): app pass 52s, server pass 12s, suppliers pass 12s; Vercel bỏ qua build, Supabase Preview skipping.
Web cục bộ (serve.js, dữ liệu thật IB2600574589 qua code mới + 1 cảnh báo mẫu ghi rõ "(MẪU THỬ GIAO DIỆN)" để xem cách hiện): thẻ #1 hiện note vàng cảnh báo + dòng xám "Cân bằng công suất: chưa kiểm được, thiếu công suất động cơ có ghi mức prime / standby trên dòng tổ máy; hiệu suất đầu phát theo model."; khối câu hỏi gửi NCC có "[Đầu phát JET444F] Loại tải: Kích từ PMG / AREP", "[Tổ máy SD-440] Điều kiện hiện trường — nhiệt độ môi trường 50 °C", dòng "Nhận tải một bước" hỏi kết quả thử ISO 8528-5; console không lỗi.

## Số đo (ĐO trên 12 configmatch, 57 cấu hình; HSMT tải chỉ đọc qua `hsmtTextOf`; script scratchpad `measure3.mjs`)
| Loại | Gói | Cấu hình |
|---|---|---|
| Cảnh báo cân bằng công suất (thấp hơn yêu cầu) | 0 | 0 |
| Cân bằng công suất tính được (đạt) | 0 | 0 |
| Chưa kiểm được cân bằng công suất | 12 | 57 (thiếu công suất động cơ có mức: 56; thiếu hiệu suất đầu phát: 55) |
| Cần làm rõ HSMT: quá tải trên ESP | 0 | — |
| Hiện trường > 40 °C / > 1.000 m | 2 (IB2600574589 50 °C, IB2600603983 45 °C) | 10 (5 câu hỏi mới; 5 qua dòng yêu cầu ambient sẵn có) |
| Nhận tải / G2–G3 (câu hỏi; BMEP tính được 0) | 3 (IB2600574589, IB2600594596 hai cỡ, IB2600603983) | 18 |
| Loại tải: kích từ PMG / AREP | 2 (IB2600574589, IB2600592684 hai cỡ) | 16 |
| Loại tải: ngắn mạch 300% / 10 s | 1 (IB2600603983) | 5 |
| Bơm chữa cháy / DOL / UPS / biến tần | 0 | 0 |
Trạng thái check, tỉ lệ đạt / không đạt / chưa rõ / xác nhận, hạng #1: không đổi (code không đổi trạng thái nào).

**Độ phủ dữ liệu cho cân bằng công suất (toàn danh mục, doc-cache supplier 10/11):** 29.003 dòng tổ máy; chỉ 49 dòng ghi công suất động cơ kèm mức; 43 trong số đó có đầu phát, 0 có hiệu suất đầu phát theo model → 0 cấu hình tính được. Hiệu suất đầu phát chỉ có 59 dòng (một phần là "Mechanical Efficiency" ~38%, đã loại). Bảng xếp theo cột của hãng động cơ (cameo-power: "Engine Power(kw) (prime/standby) | 40/44 | 53/59 …", 116 dòng engine_maker) chưa thành thông số theo model vì `engPower` nằm trong `ROW_ONLY`. Muốn kiểm thật cần: (1) đưa `engPower` có mức từ datasheet hãng động cơ vào `modelFacts`, (2) bổ sung hiệu suất + công suất định mức đầu phát (Stamford / Leroy-Somer / Mecc Alte) — đề xuất làm sau, cần duyệt vì đụng `catalog.js` / `modelFacts`.

## 3 ca đối chiếu tay với nguồn (HSMT)
1. **IB2600603983 — hiện trường + ngắn mạch 300%.** HSMT dòng "Nhiệt độ môi trường lớn nhất 45oC" (và "Nhiệt độ môi trường nhỏ nhất 0oC" — code bỏ, đúng). HSMT bảng đầu phát dòng 539–541: "19 Quá tải 300% (3 IN) trong 10 / % / giây" → `short300`, 5 cấu hình có câu hỏi "Xác nhận đầu phát duy trì dòng ngắn mạch 300% trong 10 s (thường cần kích từ PMG / AREP), gửi đường cong suy giảm ngắn mạch". Dòng 443–445 "13 Khả năng đáp ứng tải — Đóng tải từ mức 0% tải đến 100% tải trong vòng 20 giây" là yêu cầu `load_step` → dòng đó hỏi kết quả thử ISO 8528-5. Đối chiếu: đúng nội dung HSMT; "300% … 10 giây" ở mục "Quá tải" của đầu phát chính là ngắn mạch duy trì (3 In / 10 s), không phải quá tải công suất.
2. **IB2600574589 — PMG, G2/G3, 50 °C, quá tải prime.** HSMT dòng 188 "III.1 … vĩnh cửu (PMG)." (ô "Kiểu kích từ … nam châm vĩnh cửu (PMG)") → câu hỏi kích từ cho 5 cấu hình (đầu phát JET444F… nguồn không ghi PMG). Dòng 101 "Class G2 / G3 hoặc tương đương" + 110 "ISO 8528-5 Class G2" → nhận tải. Dòng 175–176 "két nước thiết kế phù hợp với nhiệt độ môi trường vận hành khắc nghiệt ≥ 50°C" → hiện trường 50 °C. Dòng 95–96 "Khả năng chạy quá tải 110% công suất liên tục trong 01 giờ mỗi 12 giờ" → KHÔNG ghi "cần làm rõ HSMT" (quá tải trên prime, đúng ISO 8528-1) — đúng.
3. **IB2600594596 — G3, 40 °C.** HSMT "Khả năng đáp ứng/ Cấp hiệu xuất Class G3" → nhận tải (8 cấu hình, 2 cỡ). "Nhiệt độ làm việc ≥ 40 °C" → KHÔNG thêm câu hỏi giảm công suất (không > 40 °C) — đúng theo brief. Yêu cầu "ISO 8528, ISO 3046" (mã iso8528_class, không ghi class) không bị tính là nhận tải — đã sửa sau lần đo đầu (lần đầu code lấy câu "8528, ISO 3046" làm câu nhận tải).
Cân bằng công suất: không có ca thật nào đủ số (xem độ phủ); kiểm bằng test với dòng mẫu "Prime power / Speed (KW/RPM) = 284/1500", η 92,3% → 262,1 kWe ≥ 250 (đạt), η 85% → 241,4 < 250 (cảnh báo), yêu cầu HSMT 272 kW → cảnh báo theo HSMT.

## "Thương hiệu G7" khác "xuất xứ G7" — ĐỀ XUẤT, CHƯA ĐỔI HÀNH VI (chờ duyệt)
**Hiện trạng:** `originOfHsmt` chỉ trả nhóm (g7 / g20 / g7eu / g20eu), không phân biệt HSMT nói thương hiệu hay xuất xứ. Lọc: động cơ theo hãng (`CAT.groupIn`, `ENGINE_COUNTRY`, bỏ động cơ TQ sản xuất theo giấy phép) + NCC đặt tại nước trong nhóm (`groupSuppliers`, #490). Hệ quả:
- HSMT "thương hiệu G7": tổ máy Cummins / Perkins do nhà máy của chính hãng ở Trung Quốc (Cummins Power Generation China…) đáng lẽ đạt, nhưng bị bỏ vì NCC đặt ở CN → lọc quá chặt.
- HSMT "xuất xứ G7": động cơ hãng G7 sản xuất tại Trung Quốc (DCEC / CCEC) qua NCC ở nước G7 vẫn lọt vì code chỉ xét hãng, không xét nơi sản xuất động cơ → lọc thiếu (dữ liệu không ghi nơi sản xuất; chỉ CO chứng minh).
- Tách hai trường hợp: **chưa**.
**Số đo trên kho HSMT (1.499 gói có chữ, `genbid-work/specs/*/text.txt`, scratchpad `g7.mjs`):** 200 gói `originOfHsmt` thấy G7/G20; câu trích nói thương hiệu / hãng / nhãn hiệu (không nói xuất xứ): 29; nói xuất xứ / nhập khẩu / nguồn gốc: 77; cả hai: 18; không rõ từ câu trích (nhãn ở dòng trên, "Origin" tiếng Anh…): 76. Trong 12 gói đo: IB2600603983 "Nhà sản xuất/ nhãn hiệu Nhóm các nước khối G7, EU" (thương hiệu / nhà sản xuất).
**Đề xuất:**
1. `originOfHsmt` trả thêm `basis`: "brand" khi câu trích + 2 dòng trên chỉ có thương hiệu / hãng / nhãn hiệu / nhà sản xuất; "origin" khi có xuất xứ / nhập khẩu / nguồn gốc / made in / origin; còn lại "origin" (an toàn, như hiện nay).
2. `basis: "brand"`: giữ lọc hãng động cơ; lọc NCC đổi thành: giữ NCC đặt tại nước nhóm HOẶC NCC là chính hãng tổ máy thuộc nhóm (genset_oem có `familyOf` là hãng G7, không phải xưởng lắp ráp mang tên hãng ngoại — cùng quy tắc `CN_FAMILY` của đồng bộ thương hiệu); xưởng lắp ráp TQ chào động cơ G7 vẫn bỏ. Ghi chú trên kết quả: "HSMT đòi thương hiệu G7: tổ máy chính hãng sản xuất ngoài nhóm vẫn được gợi ý; xuất xứ thực tế cần xác nhận".
3. `basis: "origin"`: giữ lọc hiện tại + thêm câu hỏi rfq cho mọi cấu hình "Xác nhận nước sản xuất động cơ / đầu phát / tổ máy, gửi CO" (động cơ hãng G7 có nhà máy TQ: Cummins DCEC/CCEC, Perkins Vô Tích…). `genset_origin`: met bằng code khi NCC đặt tại nước trong nhóm (đúng ý điều phối "nơi lắp ráp = nước NCC").
4. Đo trước khi bật: chạy `originOfHsmt` mới trên 200 gói, xem tay 29 + 18 ca để kiểm `basis`.

## Rủi ro còn lại
- `REQ_VERSION` 5: lượt Gợi ý lại tới của mọi gói không dùng lại yêu cầu cũ (agent đọc lại HSMT, thêm vài phút / gói) — để mã mới được gán.
- Câu hỏi loại tải dựa trên chữ HSMT: "UPS" / "biến tần" có thể là hàng hóa khác trong cùng gói (không phải tải của máy phát) → câu hỏi thừa, không ảnh hưởng xếp hạng. IB2600592684 "Model: TAL-A473-C (kích từ AREP)" là dòng HSMT liệt kê model (có thể là máy hiện có) → câu hỏi kích từ có thể thừa.
- Cân bằng công suất hầu như luôn "chưa kiểm được" với dữ liệu hiện nay (xem độ phủ) — dòng xám trên mọi cấu hình.
- Quá tải trên ESP: 0 ca trong 12 gói, chỉ kiểm bằng test.
- Tiến trình `config-bot.mjs run` đang chạy giữ code cũ.

## Quay lui
Revert PR #504 (một commit). Kết quả configmatch ghi bằng code mới có thêm `combo`, `comboAsk`, `warnings`, và câu hỏi trong `rfq` — web cũ bỏ qua các trường lạ; `REQ_VERSION` về 4 thì lượt sau lại tính yêu cầu lại một lần.

## Chưa kiểm được
- Cân bằng công suất trên ca thật (không ca nào đủ số); kVA đầu phát ≥ kVA tổ máy (không có dữ liệu).
- Hệ số giảm công suất theo nhiệt độ / độ cao (không nguồn nào có).
- Chưa chạy `check --dir` đầy đủ (cần suppliers.json của lượt); đo bằng các hàm mới trên 12 configmatch + HSMT tải về.
- Chưa xem trên Vercel preview.
