# 9 dòng "mức loại" — phần 3: đề xuất (20/11/2026, CHỈ ĐỀ XUẤT, không đổi mã)

## KHOA QUYẾT (20/11/2026, qua điều phối)
1. Năm dòng jlmech: KHÔNG chỉ bỏ; SỬA thành số đúng khi có căn cứ kiểm được: ngoại lệ mới `fixspec` (cạnh `dropspec`) với điều kiện (a) bore × stroke × số xi lanh của CHÍNH dòng ra số sửa ≤ 2 % và (b) tài liệu hãng hoặc ≥ 2 NCC khác ghi cùng số; thiếu (a) hoặc (b) thì chỉ `dropspec`. Bản ghi mang dấu đã sửa.
2. Cổng 100 L: làm B3.
3. mingbang n125 (đã sửa lại): "sửa nếu có căn cứ", cùng điều kiện (a) + (b) từng dòng, từng khoá (cyl, disp); không đủ thì `dropspec`.
4. TAD1341GE 9,36 L (5 dòng bdadl / fukangsi): đo trước khi làm, nhánh RIÊNG, không gộp vào PR khác.
Thực hiện 1 + 2 + 3: nhánh `dung-tich-sua-1`; nghiệm thu `dung-tich-sua-1.md`.

Phạm vi đếm: toàn bộ `suppliers/cn` (60.073 bản ghi, 10.176 bản ghi động cơ có `disp`), đọc bằng `catalog.js` trên `79e9b175` (trước PR #957) hoặc bản thử nghiệm (worktree `wt-optb`, KHÔNG commit). Số liệu nằm trong scratchpad: `optA.json` (176 bản ghi), `optB1-full.txt`, `optB2-full.txt`, `optB3-full.txt`, `optC` (in ra màn hình). Hình học = bore × stroke × số xi lanh của CHÍNH dòng đó (π/4 · bore² · stroke · n). Chưa đối chiếu tài liệu hãng cho từng động cơ, trừ khi ghi rõ.

## (a) Nhãn đơn vị lệch ("(mm)", "(A)") so với khoá `disp`

Hiện trạng: 176 bản ghi động cơ có `disp` mà `normFig` không đọc ra L / cc. Phân loại theo hình học (±5 %):
| nguồn | bản ghi | đúng L | ×10 | ×100 | không có hình học |
|---|--:|--:|--:|--:|--:|
| jlmech n102 "Displacement (mm)" | 29 | 27 | 2 (142 ↔ 14,17: JL-320GF, JL-350GF) | 0 | 0 |
| jlmech n104 "Displacement (mm)" | 38 | 35 | 0 | 2 (249 ↔ 2,49: JL-30GF; 433 ↔ 4,33: JL-40GF) | 1 (39,58) |
| honny n101/102/103 "排量 (A)" (chữ nguồn tự ghi) | 66 | — | — | — | 66 (bản ghi thiếu bore / cyl; ở mức bảng 88/90 dòng khớp hình học) |
| himoinsa / himoinsa-china "Displacement" không đơn vị (dấu phẩy thập phân) | 43 | — | — | — | 43 |
Cộng 176: 62 đúng, 4 sai, 110 chưa kiểm được. Mọi bản ghi vẫn đi vào `build()` (YCD4J12D-55 hiện 433 L, không có `win`).

**A1 — bỏ hàng đơn vị khi số ô ≠ số cột tiêu đề.** Đếm: 1.270 / 1.901 bảng có ≥ 2 dòng tiêu đề lệch số ô (agestar, acepow, aosif… vì dòng thứ hai là tiêu đề con, không phải hàng đơn vị). Sẽ đổi cách đọc ~2/3 số bảng. Loại.

**A2 — nhãn nêu đơn vị không phải thể tích thì coi như "không đơn vị".** Ngược quy tắc Khoa 14/11 (nhãn nêu đơn vị khác ≠ không ghi). Tác dụng thật ngang A3 (xem dưới) vì "không đơn vị" cũng chỉ kiểm bằng ngưỡng; thêm rủi ro đổi cách đọc ở 7 bảng. Không khuyến nghị.

**A3 — khi đơn vị không đọc được, áp ngưỡng `absurdOf` (L/kW 0,01–0,3, > 300 L) lên số thô.** Đếm: bắt đúng 4 dòng jlmech (JL-320GF, JL-350GF, JL-30GF, JL-40GF), 0 dòng đúng bị oan trong 176 (62 dòng đúng L đều nằm trong ngưỡng; honny / himoinsa không dòng nào chạm). Hạn chế: chỉ kiểm được khi có công suất cùng dòng; luật mới trong `row-flags`, ra cờ `absurd` = loại cả dòng (không chỉ `disp`).

**A4 — `dropspec` `disp` cho các dòng sai (không đổi luật).** Cùng 4 dòng ở A3, thêm 1 dòng A3 không thấy: jlmech n103 JL-10GF (`| 3 | 84*90 | 149 |` ↔ hình học 1,5 L; nhãn "(L)" đọc được nhưng bản ghi không có kW nên `absurdOf` không chạy, chỉ còn ngưỡng > 300 L). Tổng 5 dòng, 0 dòng đúng bị ảnh hưởng. Nhược: phải liệt kê tay; nguồn cào lại đổi chữ thì tự hết hiệu lực (đúng ý Khoa: lỗi một số của nguồn xử lý theo dòng).

**Khuyến nghị (a):** A4 (5 dòng jlmech, cùng cơ chế PR #957, cần Khoa duyệt như huipu). Không thêm luật. Rủi ro: thấp (thu hẹp 5 giá trị, không thêm số). Nếu muốn chắn lỗi tương lai: A3 sau, kèm đo lại toàn bộ.

### (a′) Thêm: `absurdOf` không kiểm dòng chỉ có `rated` / `standby`
Đọc lại 10.176 bản ghi: dung tích đọc ra L, L/kW ngoài 0,01–0,3 (hoặc > 300 L) = 21 bản ghi; row-flags chỉ thấy 1 (depco S6B-PTA, đường prime), 20 dòng còn lại không có prime nên lọt:
- jianghao n101 404D-22TG: 22 L cho 25 kW, hình học 2,22 L (sai ×10).
- bdadl n119 và pengpai n118 1506C-E88TAG5: 87 L cho 240 kW (mã E88 = 8,8 L; chưa tra tài liệu Perkins).
- zhengchi n157 (3 dòng), n158 (9), n159 (5): 8,2 / 18,2 L cho tổ máy 12–25 kW (17 dòng; không có bore / cyl để đối chiếu; con số bất thường nhưng KHÔNG xác minh được từ nguồn).
Đề xuất: không mở rộng luật (cờ `absurd` loại cả dòng, 17 dòng zhengchi chưa chứng minh sai); chỉ `dropspec` `disp` cho 3 dòng có hình học / mã (jianghao ×1, bdadl ×1, pengpai ×1) nếu Khoa duyệt. Zhengchi 17 dòng: để Khoa quyết, hoặc tra thêm.

## (b) Cổng `likely` cho `disp` (0,4–100 L) ở hai chỗ đọc (`lined()` và vòng đọc trái / phải)

Tác hại hiện tại: giá trị ngoài cổng chặn việc đọc (dòng không có `disp`), nên dung tích đúng > 100 L cũng mất (YC16VC 16 xi lanh 200×210 = 105,56 L: frs n103 ×3, hanyang n107 ×4, yunding n2006 ×4, tellhow n123 ×7, n130 ×7, waeta n108 ×7, honny n101/n102 36 dòng QTA20V 108 L; liangzi n101 ×3 là 65,65 L, nằm trong cổng).

| phương án | bản ghi đổi | thêm đúng | thêm sai | mất đúng / phụ |
|---|--:|--:|--:|---|
| B1: nâng trần lên 300 L | 146 | 70 (honny 36 → 108; 105,56 ×32; …) | 2 (zhengchi n132 ZCDL-C280, 108 và 105: chép từ aoke, dòng MTAA11-G3 thực ~11 L) | 76 (agestar n104/n118: 5,9 L → ∅, chưa rõ nguyên nhân) + 16 "fuel thêm" |
| B2: nhận ngoài cổng khi khớp bore × stroke × cyl của dòng (±3 %) | 11 | 11 (frs ×3, hanyang ×4, yunding ×4 = 105,56 L) | 0 | 7 `engPower` hanyang bị bỏ (2005, 2206, 2205, 2426, 2405, 2646, 2673 kW): chưa rõ vì sao, cần xem trước; thêm đúng bore ×7, cyl ×4 |
| B3: nhận ≤ 300 L khi L/kW của chính dòng trong 0,01–0,3 | 64 | 64 (honny 36 = 108 L; 105,56 L ×28: tellhow 14, waeta 7, yunding 4, frs 3) | 0 | 0 mất, 0 phụ (bảng đầy đủ `optB3-full.txt`) |

Ghi chú: B3 không phủ hanyang (bản ghi hanyang không có công suất tổ máy → không có kW để so), tức 4 dòng 105,56 L vẫn thiếu; B2 phủ nhưng kéo theo mất `engPower`. 105,56 L = π/4·20²·21·16 (hình học trong bảng), CHƯA đối chiếu tài liệu Yuchai YC16VC. 108 L của honny khớp hình học trong chính bảng (đã kiểm ở bước B1). Không phương án nào thêm giá trị cho các dòng aoke / jlmech / huipu đã `dropspec`.

**Khuyến nghị (b):** B3 (0 mất, 0 thêm sai, 64 dòng thêm đúng). Hanyang ×4 để sau, chỉ khi tìm ra vì sao B2 làm rơi `engPower`. Không làm B1 (146 bản ghi, mất 76 đúng, thêm 2 sai). Rủi ro B3: kW của dòng sai thì lọc sai (đã thấy: zhengchi 108 L / 250 kW = 0,43 > 0,3 nên bị chặn đúng); đo toàn bộ cloud nếu lên PR.

Thứ tự đề xuất: A4 (5 dòng) cùng (a′) 3 dòng → B3 sau khi Khoa duyệt; mỗi PR kèm spec-diff toàn bộ + đo cloud đủ (không lấy mẫu).

---

# Lỗi có sẵn (không do PR #957) — theo yêu cầu điều phối

## 1. mingbang-mbkl n125 (15 dòng) ghi 4 xi lanh cho mọi động cơ Volvo
Bảng `| No. | GENSET Model | Prime | Standby | Engine Model | Cylinder (nos) | Displacement (L) | Bore*Stroke | Fuel | Dimension |`. Cả 15 dòng ghi 4 xi lanh; dung tích 1,1–6,0 L; bore×stroke 77×81 … 105×127 (bảng như chép từ họ động cơ nhỏ):

| # | model | engine | cyl | disp | bore×stroke | hình học trong dòng |
|--:|---|---|--:|--:|---|---|
| 1 | MB-V68 | TAD530GE | 4 | 1,1 | 77×81 | 1,51 L (lệch dòng) |
| 2 | MB-V80 | TAD531GE | 4 | 1,5 | 84×90 | 2,00 L (lệch) |
| 3 | MB-V104 | TAD532GE | 4 | 2,2 | 84×100 | 2,22 L |
| 4 | MB-V120 | TAD731GE | 4 | 2,2 | 84×100 | 2,22 L |
| 5 | MB-V150 | TAG732GE | 4 | 3,3 | 105×127 | 4,40 L (lệch) |
| 6 | MB-V160 | TAD733GE | 4 | 3,3 | 105×127 | 4,40 L (lệch) |
| 7 | MB-V200 | TAD734GE | 4 | 3,3 | 105×127 | 4,40 L (lệch) |
| 8 | MB-V252 | TAD1341GE | 4 | 3,3 | 105×127 | 4,40 L (lệch) |
| 9 | MB-V280 | TAD1342GE | 4 | 3,3 | 105×127 | 4,40 L (lệch) |
| 10 | MB-V300 | TAD1343GE | 4 | 4,4 | 105×127 | 4,40 L |
| 11 | MB-V320 | TAD1344GE | 4 | 4,4 | 105×127 | 4,40 L |
| 12 | MB-V360 | TAD1345GE | 4 | 4,4 | 105×127 | 4,40 L |
| 13 | MB-V400 | TAD1641GE | 4 | 4,4 | 105×127 | 4,40 L |
| 14 | MB-V480 | TAD1642GE | 4 | 4,4 | 105×127 | 4,40 L — ĐÃ `dropspec` cyl + disp (PR #957) |
| 15 | MB-V500 | TWD1643GE | 4 | 6,0 | 100×127 | 3,99 L (lệch) |

Tài liệu hãng đã tra: Volvo Penta D13 (TAD1341GE-B): "in-line 6-cylinder, 12.8-liter" (volvopenta.com); TAD1345GE 12,78 L (bản tin Welland); TAD1642GE: bore 144, stroke 165, 16,12 L (bản tin kỹ thuật Volvo Penta, raad-eng.com/techdata/volvo/prodbull/tad1642ge.pdf); dòng D16 "in-line 6-cylinder, 16.1-liter". Các dòng TAD530–734 / TAG732 CHƯA tra tài liệu hãng (fukangsi n2005 và bdadl n134 ghi 4,76 L / 4 xi lanh và 7,15 L / 6 xi lanh, nhưng đó là bảng của nhà cung cấp, không phải tài liệu hãng).

Đề xuất `dropspec`: dòng 8–13 và 15 (7 dòng mới; V480 đã làm) bỏ `cyl` + `disp`; `bore` (105×127 ↔ 131×158 / 144×165 của Volvo) bỏ hay giữ là việc Khoa quyết (ở PR #957 điều phối đã chọn giữ bore của V480). Dòng 1–7: chỉ bỏ `disp` ở các dòng tự mâu thuẫn với bore × stroke (1, 2, 5, 6, 7) — tối thiểu; còn lại chờ tra tài liệu Volvo.

## 2. "9,36 L" của TAD1341GE thắng phiếu (`win`)
Nguồn ghi 9,36 cho TAD1341GE: bdadl n118 (BDA-V250 TAD1341GE; BDA-V250 TAD1342GE; BDA-V270 TAD1351GE(欧三)) và fukangsi n2005 (FKS-V250 TAD1341GE, FKS-V280 TAD1342GE), tổng 5 dòng, đều ở bảng nhãn "排量 (L)"; mingbang n125 ghi 3,3 → 9,36 thắng 2/3. Tài liệu hãng (Volvo D13): 12,8 L. Cùng bảng fukangsi ghi đúng 12,78 cho TAD1343 / 1344 / 1345GE, nên lỗi là cặp V250 / V280 (nhiều khả năng 9,36 L là dung tích dòng D9; chưa tra tài liệu D9 trong phiên này). Lưu ý: bảng bdadl n134 ghi TAD1341GE-B 12,1 L, TAD1342GE-B 12,1, TAD1343GE-B 12,3, TAD1345GE-B 16,1, TAD733GE 12,1, TAD734GE 12,1 — cũng lệch tài liệu (không thuộc yêu cầu này, chỉ liệt kê).
Đề xuất `dropspec` `disp` cho 5 dòng bdadl n118 ×3 + fukangsi n2005 ×2. Phải ghi rõ hệ quả: IB2300127113 đòi ≥ 14 L; hiện TAD1341GE bị loại nhờ 9,36 / 3,3 (kết quả đúng nhờ vô tình, 12,78 L < 14). Bỏ cả hai nguồn thì khoá này không còn giá trị nào; hành vi của bộ lọc khi không còn giá trị `disp` (đi qua hay loại) CHƯA kiểm, phải đo trước khi merge, vì có thể biến một khoá bị loại đúng thành ứng viên. Hệ thống chưa có chỗ ghi giá trị tham chiếu từ tài liệu hãng (nguyên tắc "không ghi số thay"), nên đây là điểm cần Khoa quyết.

## 3. meao 6R1600G20F "không thấy" ở nhánh
Chờ kết quả đo cloud 1.093 lượt của điều phối.
