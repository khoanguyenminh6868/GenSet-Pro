# dau-phat-hang D1 — datasheet chính hãng Mecc Alte + Stamford > 750 kVA (21/11/2026)

Nhánh `dau-phat-hang-d1`, chỉ dữ liệu. Quy trình `maker-datasheets.mjs` → `merge-specs.mjs` → `verify.mjs` (435 bản ghi, 0 lỗi).
So với origin/main mọi bản ghi `cn/`: chỉ 2 bản ghi đổi, chỉ THÊM (không mất bảng / dòng / nguồn nào):
- mecc-alte: bảng 14 → 24, dòng 188 → 394, nguồn 10 → 20, manufacturing 5 (giữ nguyên).
- stamford-avk-china: bảng 20 → 33, dòng 301 → 461, nguồn 25 → 38, manufacturing 6 (giữ nguyên).
Test `suppliers/*.test.mjs`: 1.332 / 1.332 đạt.

## Mecc Alte — 10 tờ dải 4 cực 3 pha (nguồn 1007–1016)
URL lấy từ link "Family catalogue" trên trang sản phẩm meccalte.com (`/en/products/alternators/industrial/<dải>`), dạng
`https://www.meccalte.com/dds/pdf/<n>`: ECP3 4 C (133), ECP4 4 C (161), ECP28 4 C (55), ECP30 4 C (163), ECP32 4 C (57),
ECP34 4 C (69), ECO38 4 C (129), ECO40 4 C (139), ECO43 4 A (4), ECO46 4 A (5).
- Mỗi tờ có bảng "Ratings 50Hz" / "Ratings 60Hz", cột STANDBY-163/27, STANDBY-150/40, **H-125/40**, F-105/40, B-80/40 × 4 điện áp
  (vd. ECO46: 380/400/415/440 V cho Parallel Star), mỗi model một dòng kVA + một dòng kW. Phủ khoảng ECP3 (nhỏ nhất) → ECO46 VL4
  (H-125/40, 50 Hz, 400 V: 2.800 kVA). 30–2.500 kVA 50 Hz phủ đủ.
- Có bảng **"Derating coefficients"** (nhiệt độ 25–70 °C × độ cao ≤1000 … ≤6000 m, vd. ≤1000 m: 40 °C 1, 45 °C 0.96, 50 °C 0.93) → dùng cho D2.
- Tên model có dấu cách ("ECO46 1S4 A"); tiêu đề tờ là tên dải ("ECO46 4 A"), không phải một model → D2 đọc từ tệp nguồn.
- Bỏ 93 dòng `datasheets/mecc-alte.json` chỉ là danh sách tên model (mảnh tiêu đề cột bảng điện kháng "| A | ECO46 1.5S4",
  "| Data | ECO46 1S4 A | …") trước `merge-specs`; mọi dòng còn lại nguyên văn.
- KHÔNG lấy: dải cũ ECP3/ECP28A/ECP32B/ECP34A/ECO38A/ECO40B (trang sản phẩm không có link tờ), bản 1 pha / 2 cực, ECO49 / trung thế
  (không thuộc trang Industrial), Ratings Book MAU3716 (sách nhiều dải, đã có tờ từng dải).
- Nơi SX: tờ chỉ in địa chỉ các công ty con (Ý, Anh, Tây Ban Nha, "Mecc Alte Alternator Haimen LTD" TQ, Ấn Độ), KHÔNG nói dải nào
  làm ở đâu → không thêm gì vào `manufacturing[]`; giữ 4 mục có nguồn [6001] ("manufacturing taking place in Italy, the UK, India
  and China") + mục Khoa chốt 16/11 (mặc định Ý).

## Stamford > 750 kVA — 13 tờ (nguồn 1021–1033), dạng giống tờ S5L1D-H4 [1018] đã có
S6L1D-C4 / D4 / E4 / F4 Wdg.311/312, S6L1D-G4 / H4 Wdg.312, S7L1D-C4 / D4 / E4 / F4 / G4 / H4 / K4 Wdg.312 (URL từ kết quả tìm kiếm
stamford-avk.com). Mỗi tờ có "kVA Base Rating (Class H)" 50 Hz 380/400/415/440 + 60 Hz, và câu suy giảm "3% for every 5°C … exceeds
40°C" / "3% for every 500 meters … exceeds 1000 meters". S7L1D-K4: dòng base rating chỉ 3 số (| 2700 | 2800 | 2700) — D2 xem kỹ.
Đã có trước: S5L1D-H4 (750 kVA H ở 400 V).
- KHÔNG lấy: HCI634G–K (dải cũ, cùng định mức S6L1D-C…F theo Ratings Book [2001]); S9 (tờ / brochure chỉ thấy 10,5 kV trung thế),
  P80 / LVSI804 (chỉ thấy tờ Wdg 13 điện áp 600–690 V và sổ tay) → không có tờ hạ thế 380–440 V trong kết quả tìm kiếm.
- **Cần điều phối / Khoa**: `MAKER_PLANT` coi mọi tờ của `stamford-avk-china` là Trung Quốc (Khoa 20/11). Trang hãng [6003]:
  "The Stamford facility manufactures the STAMFORD range, including the S4, S5, S6 and S7" (nhà máy Anh); trang TQ [1] không nêu dải
  nào làm ở Vô Tích. Tờ S6 / S7 là tờ toàn cầu, không ghi nơi SX → D2 có giữ "Trung Quốc" cho S6 / S7 không?
