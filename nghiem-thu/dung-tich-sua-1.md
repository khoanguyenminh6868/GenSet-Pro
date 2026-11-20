# dung-tich-sua-1 — nghiệm thu (20/11/2026)

Nhánh `dung-tich-sua-1` (từ `origin/main` b8752924, không chồng lên #957). Thực hiện quyết định của Khoa 20/11 (câu 1, 2, 3 của `9-dong-loai-3-de-xuat.md`). Câu 4 (TAD1341GE 9,36 L) làm ở nhánh riêng, chưa làm.
Dữ liệu đo: `genbid-work\dieu-phoi\dau-vao\dung-tich-sua-1\` (`spec-diff-day-du.txt` = MỌI bản ghi đổi, `spec-diff-tom-tat.md`, `row-flags-truoc.json` / `row-flags-sau.json`).

## 1. Thay đổi trong mã (`web/catalog.js`)
- **`fixspec`** (ngoại lệ mới cạnh `dropspec` trong `ROW_EXCEPTIONS`): khớp dòng y như `dropspec` (NCC + n + model tổ máy + chữ dòng nguồn nguyên văn); `fixes: [{ key, from, to, why, src }]`; chỉ thay khi giá trị spec đúng chữ `from`. Spec mang `fixed: { from, why, src }`, bản ghi mang `fixed[]`; `uses` của `build()` giữ nguyên bản ghi, nên hồ sơ / danh mục hiện được là "đã sửa". Mỗi lần khớp ghi note "ngoại lệ theo dòng". Chưa nối giao diện (chỉ mang dữ liệu).
- **Cổng B3** (`likely`, khoá `disp`): ngoài 0,4–100 L chỉ nhận khi ≤ 300 L VÀ L/kW của chính tổ máy trong 0,01–0,3.
- **mingbang n125**: `dropspec` cyl + disp cho 7 dòng.
- Test `suppliers/dungtich-sua-1.test.mjs` (7 ca, dòng thật); `web/CLAUDE.md` ghi `fixspec` và cổng B3.

## 2. Năm dòng jlmech (câu 1): điều kiện (a) hình học ≤ 2 % VÀ (b) tài liệu hãng / ≥ 2 NCC cùng số
| dòng | nguồn ghi | số sửa | (a) hình học của dòng | (b) căn cứ khác | kết quả |
|---|---|---|---|---|---|
| n102 JL-320GF (SC15G500D2) | 142 | 14.2 | 6 × 135 × 165 = 14.17 L, lệch 0,2 % | 14.2: bdadl n127, hanyang n125, sanq n121 (3 NCC); 14.16: 12 NCC | **fixspec** |
| n102 JL-350GF (sC15G500D2) | 142 | 14.2 | như trên | như trên | **fixspec** |
| n104 JL-30GF (YC2115ZD) | 249 | 2.49 | 2 × 115 × 120 = 2.49 L, lệch 0,1 % | 2.49: fukangsi n2002, pengpai n129 | **fixspec** |
| n103 JL-10GF (403D-15G) | 149 | 1.496 | 3 × 84 × 90 = 1.496 L, lệch 0 % | 1.496: depco n2440, genlitec ×3, gb-power, weiman, wintpower (1.5: jianghao, mingbang, aoke, rise, waeta); chưa lấy URL Perkins | **fixspec** (số sửa lấy số NCC ghi 1.496, không phải 1.49 chặt từ "149": 1.49 làm vỡ phiếu 403D15G của `cand-disp-round.test`) |
| n104 JL-40GF (YCD4J12D-55) | 433 | — | 4 × 105 × 125 = 4.33 L (khớp) | KHÔNG: chỉ jlmech ghi động cơ này; tìm tài liệu hãng không ra (`firecrawl_search` YCD4J12D-55: không có trang hãng) | **dropspec** disp (giữ xi lanh) |
Dòng chưa đủ căn cứ cho `fixspec` thì nêu: chỉ JL-40GF.

## 3. mingbang n125, đủ 15 dòng (câu 3, sửa lại: sửa nếu có căn cứ, không thì bỏ)
Mọi dòng ghi 4 xi lanh. Tài liệu hãng đã tra: Volvo Penta D13 (TAD1341GE-B…) "in-line 6-cylinder, 12.8-liter" (volvopenta.com/industrial/power-generation-engines/power-generation-engine-range/d13-eu-stage-ii-epa-tier-2/); TAD1345GE 12,78 L (tickets.wellandpower.net/hc/en-us/articles/360011714058-All-About-the-Volvo-Penta-TAD1345GE-Engine); TAD1642GE bore 144, stroke 165, 16,12 L (raad-eng.com/techdata/volvo/prodbull/tad1642ge.pdf), dòng D16 "in-line 6-cylinder, 16.1-liter" (volvopenta.com). Bore / stroke của dòng (105*127, 100*127) KHÔNG phải của hãng (131×158 cho D13, 144×165 cho D16) nên (a) KHÔNG đạt ở mọi dòng TAD13xx / TAD16xx: không sửa được cyl lẫn disp.

| # | model | engine | cyl | disp | bore×stroke | cyl | disp | căn cứ |
|--:|---|---|--:|--:|---|---|---|---|
| 1 | MB-V68 | TAD530GE | 4 | 1,1 | 77×81 | giữ | giữ | chưa tra tài liệu hãng; hình học dòng 1,51 L ≠ 1,1 (tự mâu thuẫn); chưa có lệnh bỏ |
| 2 | MB-V80 | TAD531GE | 4 | 1,5 | 84×90 | giữ | giữ | như dòng 1 (hình học 2,00 L) |
| 3 | MB-V104 | TAD532GE | 4 | 2,2 | 84×100 | giữ | giữ | chưa tra; hình học 2,22 L khớp 2,2 |
| 4 | MB-V120 | TAD731GE | 4 | 2,2 | 84×100 | giữ | giữ | chưa tra (fukangsi / bdadl ghi 6 xi lanh 7,15 L, đó là NCC không phải hãng) |
| 5 | MB-V150 | TAG732GE | 4 | 3,3 | 105×127 | giữ | giữ | chưa tra; hình học 4,40 L ≠ 3,3 |
| 6 | MB-V160 | TAD733GE | 4 | 3,3 | 105×127 | giữ | giữ | như dòng 5 |
| 7 | MB-V200 | TAD734GE | 4 | 3,3 | 105×127 | giữ | giữ | như dòng 5 |
| 8 | MB-V252 | TAD1341GE | 4 | 3,3 | 105×127 | **bỏ** | **bỏ** | hãng: 6 xi lanh 12,8 L; bore / stroke dòng sai → (a) ✗ |
| 9 | MB-V280 | TAD1342GE | 4 | 3,3 | 105×127 | **bỏ** | **bỏ** | như dòng 8 |
| 10 | MB-V300 | TAD1343GE | 4 | 4,4 | 105×127 | **bỏ** | **bỏ** | như dòng 8 |
| 11 | MB-V320 | TAD1344GE | 4 | 4,4 | 105×127 | **bỏ** | **bỏ** | như dòng 8 |
| 12 | MB-V360 | TAD1345GE | 4 | 4,4 | 105×127 | **bỏ** | **bỏ** | hãng / Welland: 12,78 L; như dòng 8 |
| 13 | MB-V400 | TAD1641GE | 4 | 4,4 | 105×127 | **bỏ** | **bỏ** | dòng D16 6 xi lanh 16,1 L; bore / stroke dòng sai (144×165) |
| 14 | MB-V480 | TAD1642GE | 4 | 4,4 | 105×127 | (PR #957: bỏ) | (PR #957: bỏ) | bulletin hãng 144×165, 16,12 L; không có trong PR này vì #957 chưa merge |
| 15 | MB-V500 | TWD1643GE | 4 | 6,0 | 100×127 | **bỏ** | **bỏ** | chưa tra tài liệu hãng; hình học dòng 3,99 L ≠ 6,0 (tự mâu thuẫn) → (a) ✗ |
Kết quả: không dòng nào đủ căn cứ để SỬA; 7 dòng bỏ cyl + disp (8–13, 15). Bore giữ (không có lệnh). Dòng 1–7: chưa đụng; dòng 1, 2, 5, 6, 7 tự mâu thuẫn hình học (đề xuất `dropspec` disp, chờ Khoa).

## 4. Cổng B3: đo toàn bộ `suppliers/cn` (spec-diff b8752924 ↔ nhánh)
- Bản ghi 60.075 → 60.075; **76 đổi**, 0 mất, 0 thêm, 11 bảng của 7 NCC; đảo vai 0 → 0.
- Dạng đổi: disp thêm 64, bore thêm 3, disp đổi 4 (jlmech fixspec ×4), disp bỏ 8 (mingbang ×7 + JL-40GF), cyl bỏ 7 (mingbang), fuel thêm 14.
- Theo bảng: frs n103 3 (105.56), honny n101 18 + n102 18 (108, chia hai bảng), jlmech 5, mingbang n125 7, tellhow n123 7 + n130 7 (105.56), waeta n108 7, yunding n2006 4. MỌI dòng đổi liệt kê ở `spec-diff-day-du.txt`; không bản ghi nào ngoài danh sách này đổi.
- **Phụ ngoài cổng** (đã soát): `fuel` +14 ở tellhow n123 / n130: dòng `| THHY1800 | … | YC16VC3000-D31 * | 16/V | 105.56 | 206 | 430 | 650 |`: trước đây việc đọc dừng ở dung tích 105.56 nên không tới cột tiêu hao 206 g/kWh; nay đọc (hợp lý với tổ máy 1.800 kW). `bore` +3 ở frs n103 (200*210, khớp 16 × 200 × 210 = 105.56 L).
- B3 KHÔNG phủ hanyang n107 (HY-1800 / 2000 / 2200 / 2400, 105,56 L, và `engPower` 2005 / 2205 / 2405 / 2673): bản ghi hanyang không có công suất tổ máy để so L/kW; vẫn thiếu dung tích ở 4 dòng đó.
- **row-flags** trước ↔ sau: 159 → 152 dòng bị cờ (loại 17 → 17). 7 dòng cờ `cylMaj` của mingbang TAD1341–1345GE, TAD1641GE, TWD1643GE hết vì không còn số 4 xi lanh; không cờ mới.
- Test: `suppliers/*.test.mjs` 1250/1250 (một ca `cand-disp-round` 403D15G đã chuyển số sửa từ 1.49 sang 1.496, xem mục 2); `web/test/*.test.mjs` 161/161; `quality --check` không chỉ số nào xấu đi.
- CHƯA đo top 30 cloud (để điều phối đo đủ như đã báo); CHƯA đo bidhist.

## 5. Dòng `dropspec` đã có (#957 và đã merge): dòng nào ĐỦ (a) + (b) để chuyển sang `fixspec`? (chỉ liệt kê, CHƯA đổi)
| dòng | khoá, số nguồn | (a) | (b) | kết luận |
|---|---|---|---|---|
| #957 jlmech n103 JL-1000GF (4012-46TWG2A) | disp 458 | 12 × 160 × 190 = 45.84 L (0,1 % với 45.8) | 45.8 / 45.842 ở ≥ 30 NCC (agestar, aoke, depco, fdk, frs, fukangsi, jianghao, mingbang, …) | **ĐỦ** → 458 → 45.8 |
| #957 huipu n105 HP-P1330 (4012-46TAG2A) | disp 458 | 12 × 160 × 190 = 45.84 L | 45.8 / 45.842 ở ≥ 30 NCC (jlmech n103, huali, mingbang, …) | **ĐỦ** → 458 → 45.8 |
| #957 huipu n106 HP-V280 (TAD1341GE) | disp 1278 | 6 × 131 × 158 = 12.78 L | Volvo D13 12,8 L (volvopenta.com), fukangsi n2005 12.78 (TAD1343–1345GE) | **ĐỦ** → 1278 → 12.78 |
| #957 huipu n106 HP-V400 (TAD1345GE) | disp 1278 | 6 × 131 × 158 = 12.78 L | Welland: TAD1345GE 12,78 L; fukangsi 12.78 | **ĐỦ** → 1278 → 12.78 |
| #957 aoke n129 AOKE-C280 (MTAA11-G3) | disp 108 | ✗ dòng không có bore / stroke | — | giữ `dropspec` |
| #957 aoke n129 AOKE-M275 (6R1600G20F) | disp 105 | ✗ không có bore / stroke (MTU 6R1600: 122 × 150 × 6 = 10.5 L chỉ nằm ngoài dòng) | — | giữ |
| #957 jlmech n104 JL-180GF / JL-220GF | dims "30001030*1550" / "31001100*1750" | ✗ kích thước, không có công thức hình học; tách chữ số mơ hồ (3000*1030 hay 300*01030) | — | giữ |
| #957 aosif n123 AW1000 | cyl 12V, disp 31.8 | ✗ không có bore / stroke | — | giữ |
| #957 cameo n107 SC-70YC | engPower 35/41 | ✗ không phải đại lượng hình học | — | giữ |
| #957 jiangchai n107 J20B400M | current 7200 | ✗ | — | giữ |
| #957 mingbang n125 MB-V480 | cyl 4, disp 4.4 | ✗ bore / stroke dòng sai (xem mục 3) | — | giữ |
| #957 westinpower n1064 TP880L | speed 1191 | ✗ | — | giữ |
| đã merge: khối lượng LZ1750 (bdadl n104, fukangsi n2009, pengpai n103 + n131), C20 (fukangsi n2001, pengpai n125) | weight 1440 / 5500 | ✗ khối lượng không có công thức hình học | — | giữ |
Không xét #953 (aosif AW1125) vì chưa merge. Vậy 4 dòng đủ điều kiện: JL-1000GF, HP-P1330, HP-V280, HP-V400.

## 6. Kiểm nốt bằng (a) các bản ghi nhãn lệch đơn vị (110 bản ghi chưa kiểm)
- **honny n101 / n102 / n103 ("排量 (A)", 66 bản ghi, 90 dòng bảng)**: bore, stroke, số xi lanh nằm ở các cột riêng (缸数 / 缸径 / 行程). 88 / 90 dòng khớp hình học ≤ 5 %. 2 dòng lệch: n102 HGM1500EBHV10.5 (PTAA20V-EG1345) và HGM1650EBHV10.5 (PTAA20V-EG1480): ô xi lanh ghi "V16" (hình học 16 × 135 × 145 = 33.2 L) nhưng dung tích nguồn 42 khớp 20 xi lanh (41.5 L) và tên động cơ ghi 20V → số dung tích đúng, ô xi lanh "V16" sai (lỗi có sẵn, không đụng ở PR này).
- **himoinsa / himoinsa-china (43 bản ghi, dung tích "1,642 L" dấu phẩy)**: bảng không ghi số xi lanh (chỉ "Bore and Stroke: 88 x 90 mm"), nên KHÔNG đủ (a); chưa kiểm được.
- **jlmech n101–n104 (toàn bộ 113 dòng)**: ngoài 5 dòng ở mục 2 và JL-1000GF: n101 JL-90GF (4 × 105 × 118 = 4.09 L, nguồn 4.5, lệch 10 %: chưa rõ cột nào sai), n104 JL-100GF (dung tích "6.B7", OCR; 6 × 108 × 125 = 6.87 L: ứng viên `fixspec`, chưa tra (b)), n104 JL-880GF (bore "200210" mất `*`, dung tích 39.58 khớp 6 × 200 × 210). Không sửa các dòng này (ngoài phạm vi, chưa duyệt).

## 7. Việc chưa làm / hạn chế
- Câu 4 (TAD1341GE 9,36 L, 5 dòng bdadl n118 ×3 + fukangsi n2005 ×2): nhánh riêng, chưa làm.
- Chưa đo top 30 cloud và bidhist (điều phối đo).
- Hanyang n107 ×4 chưa phủ bởi B3.
- (a′) (3 dòng jianghao / bdadl / pengpai ở `absurdOf` dòng chỉ rated / standby): Khoa chưa quyết, không làm ở đây.
