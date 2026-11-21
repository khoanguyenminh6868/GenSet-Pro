# Powerpack Generator: thông số động cơ (nghiệm thu powerpack-1)

Nguồn: https://www.powerpackgenerator.com/ (danh mục 126 trang tổ máy, đọc hết, không lấy mẫu). Hồ sơ `suppliers/cn/powerpack.json` (country TR, role genset_oem), nguồn 1–2 (danh mục, Corporate), 101–226 (từng trang tổ máy).

## Số liệu
- 126/126 trang đã đọc; mỗi trang ghi: công suất prime/standby, hãng + model động cơ, số xi lanh, dung tích, đường kính, hành trình, TỈ SỐ NÉN, tiêu hao 100/75/50 % tải. 126/126 trang có tỉ số nén.
- Hãng (trang / model động cơ khác nhau): BAUDOUIN 34/34; FPT IVECO 17/17; HYUNDAI DOOSAN 15/15; KOFO 9/8; PERKINS 34/33; YANGDONG 10/10; YANMAR 7/7; tổng 124 model.
- So với `cn/` + `datasheets/` (bộ đọc `modelFacts` KHÔNG có hồ sơ Powerpack, khoá model theo `keyOf`): tỉ số nén CHƯA có trước đó ở 58 trang; đã có và KHỚP 61; LỆCH 7.

## Bộ đọc đã sửa (web/catalog.js, `verticalRecords`, cùng nhánh powerpack-1)
Trước sửa: 0 động cơ, 126/126 bảng không cho bản ghi nào. Sau sửa: 126/126 bảng → 126 bản ghi động cơ (`CAT.build`: 124 khoá động cơ, 124/124 có `uses` của powerpack). Sáu thay đổi, mọi thay đổi chỉ chạm bảng dọc: (1) model tổ máy lấy từ TIÊU ĐỀ trang khi bảng có tiêu đề phần 'Engine …' mà không có dòng Model tổ máy (đúng một mã trong tiêu đề, khác mã động cơ / đầu phát); (2) bảng định mức ngang 'Voltage, Frequency | Prime | Standby' + dòng '400V, 50 Hz | …' đọc prime / standby; (3) mã động cơ có hậu tố '/5', '/S' (Baudouin 6M33G750/5) hết bị loại ('A / B', '6BT5.9/6CT8.3' vẫn loại); (4) mã Doosan 'DP222CC / DP054CC / DP086CC' (isCode đọc '<số>CC' là dung tích cc) chỉ nhận trong bảng dọc, `isCode` toàn cục KHÔNG đổi (đổi nó thêm ~100 bản ghi ở NCC khác: việc riêng); (5) Bore + Stroke hai dòng → 'bore' = '150 × 185'; (6) ô đơn vị 'lt', 'lt/h' của trang (UNIT_CELL không biết) bỏ khỏi giá trị, 'lt' → 'L' khi gắn lại sau số tiêu hao ('151,1 L/h'), 'RPM / Hz.' + '1500/50' → speed '1500 rpm'; hãng 'HYUNDAI DOOSAN' → Doosan. Công suất động cơ 'kWm' CHƯA đọc (chữ nguồn không ghi tốc độ: quality xấu đi). Kiểm chéo toàn bộ: `spec-diff git:3687bb73 .` → 61.865 → 61.996 bản ghi, 0 đổi, 0 mất, 131 thêm (126 powerpack + 5 bản ghi động cơ mới ở NCC khác nhờ luật (3)/(4): aosif n1109 SP344CC, n1113 DP054CC, n1118 DP086CC, n1130 DP158CC (tên tổ máy là tên tệp PDF của chính nguồn), lees-power n1199 DP222CC, đều là bảng dọc thật), đảo vai 0, tự kiểm số 0 cần soát; row-flags: powerpack 0 dòng nghi. `quality.mjs --check`: chỉ còn compr mâu thuẫn 48 > 42 + 5 (là 6 ca thật bên dưới) → đã `--write-baseline`. Test mới `suppliers/bang-doc-powerpack.test.mjs`; `node --test suppliers/*.test.mjs web/test/*.test.mjs`: 1599 đạt.

## Bước 3 (đọc đúng model, TOÀN BỘ 126 trang)
`modelFacts` trên toàn `cn/` kèm powerpack, so với từng trang: 126/126 trang có mục động cơ; tỉ số nén, dung tích, số xi lanh của fact == số trang ghi ở 126/126 (Baudouin 34/34, Perkins 34/34, FPT 17/17, Doosan 15/15, Kofo 9/9, Yangdong 10/10, Yanmar 7/7), 0 lệch. Ví dụ 6M33G750/5: trước không có tỉ số nén; nay 15 : 1 (nguồn: powerpack). Bước CHỌN ứng viên của main chưa lọc theo tỉ số nén (luật #1062 chưa merge nên chưa chạy thử trên nhánh này): fact đã vào `modelFacts`, nên khi #1062 merge, 6M33G750/5 không còn lọt. Trang pg25-b ghi '17 17,5 : 1' (chữ nguồn lỗi), giữ nguyên.

## Đầu phát
Trang KHÔNG ghi hãng / model đầu phát: khối 'Alternator Technical Data' chỉ có thông số điện (số pha 3, hệ số công suất 0,8, 4 cực, cách điện H, IP 23, kích từ tự kích, AVR, ±1 %, đấu sao, 'Rated Power (Standby) 400V 50 Hz'). File datasheet PDF của từng trang (link 'Download Datasheet') chữ bị mã hoá (pdftotext ra ký tự rác), cùng nội dung với trang web, chưa OCR. Các dòng đầu phát đã nằm trong `specTables` của hồ sơ (chép nguyên văn); KHÔNG vào danh mục đầu phát vì không có model: không bản ghi đầu phát nào.

## Bước 4 (có thành ứng viên không)
CÓ THỂ, và đây là điều điều phối cần quyết: sau sửa, Powerpack là 126 bản ghi `fromSupplier` (role genset_oem, country TR) có công suất prime / standby, nên `candidates` coi các dòng Powerpack như dòng NCC thường (kể cả gói đòi nhóm NCC Trung Quốc nếu bộ lọc nước chỉ xét hãng động cơ). Chưa đo top 30 (đo trên cloud, `do-gop.mjs`). Cách chặn nếu Khoa muốn chỉ làm nguồn thông số: ghi `status: "incomplete"` (bot bỏ hồ sơ này khi nạp NCC, nhưng khi đó `modelFacts` cũng không dùng nó, mất tỉ số nén) hoặc chặn ở `candidates` theo `role` / `country`. Chưa làm.

## Mâu thuẫn với nguồn sẵn có (tờ hãng thắng, không sửa tờ hãng)
- fpt-iveco-diesel-generator-pg660-i (CR16TE1W.S550): compr Powerpack 15,5 : 1 ↔ nguồn sẵn có depco-power:16.5:1
- hyundai-doosan-diesel-generator-pg900-d (DP222CB): compr Powerpack 14,6 : 1 ↔ nguồn sẵn có depco-power:15.0:1, lees-power:17.3:1
- kofo-diesel-generator-pg220-k (6RT80-176DE): bore Powerpack 110 ↔ nguồn sẵn có jet-power:113×130
- perkins-diesel-generator-pg1385-p (4012-46TWG2A): compr Powerpack 12.8:1 ↔ nguồn sẵn có depco-power:13.1:1, fdk-energy:13:1, gb-power:13.6:1, weiman-fujian:13.6:1, westinpower:13.0: 1, westinpower:13 : 1
- perkins-diesel-generator-pg1650-p (4012-46TAG2A): compr Powerpack 12.8:1 ↔ nguồn sẵn có depco-power:13.1:1, fdk-energy:13:1, gb-power:13.6:1, weiman-fujian:13.6:1, westinpower:13.0: 1, westinpower:13 : 1
- perkins-diesel-generator-pg1875-p (4012-46TAG3A): compr Powerpack 12.8:1 ↔ nguồn sẵn có depco-power:13.1:1, fdk-energy:13:1, gb-power:13.6:1, weiman-fujian:13.6:1
- perkins-diesel-generator-pg2000-p (4016-61TRG1): compr Powerpack 13 : 1 ↔ nguồn sẵn có weiman-fujian:13.6:1
- perkins-diesel-generator-pg2250-p (4016-61TRG2): compr Powerpack 13 : 1 ↔ nguồn sẵn có weiman-fujian:13.6:1
- yangdong-diesel-generator-pg55-y (Y4105D): disp Powerpack 4,33 ↔ nguồn sẵn có depco-power:4.1, lees-power:4.087L, waeta-fujian:4.08, wintpower:4.1

## Bảng 126 trang
Cột: trang | hãng | model động cơ | xi lanh | dung tích (L) | đường kính × hành trình (mm) | tỉ số nén | tiêu hao 100/75/50 % (L/h) | định mức (prime / standby) | model có trong danh mục | so tỉ số nén | so dung tích/xi lanh/đường kính/hành trình (mới = nguồn sẵn có chưa ghi). Lưu ý: chưa phân biệt nguồn sẵn có là tờ hãng hay NCC; việc tờ hãng thắng cần soát tay bảy ca nén LỆCH

| trang | hãng | model | cyl | disp | bore × stroke | nén | L/h | định mức | trong DM | nén | khác |
|---|---|---|---|---|---|---|---|---|---|---|---|
| baudouin-diesel-generator-pg1000-b | BAUDOUIN | 12M26G1000/5 | 12 | 31,8 | 150 × 150 | 15,7 : 1 | 195,5/146,5/100,8 | 400V, 50 Hz ; 900 kVA / 720 kW ; 1000 kVA / 800 kW | có | khớp | khớp/khớp/khớp/mới |
| baudouin-diesel-generator-pg110-b | BAUDOUIN | 4M10G6D0 | 4 | 4,087 | 105 × 118 | 17,5 : 1 | 21,3/16/10,6 | 400V, 50 Hz ; 100 kVA / 80 kW ; 110 kVA / 88 kW | chưa | mới | mới/mới/mới/mới |
| baudouin-diesel-generator-pg1100-b | BAUDOUIN | 12M26G1100/5 | 12 | 31,8 | 150 × 150 | 15,7 : 1 | 207,1/155,3/106,6 | 400V, 50 Hz ; 1000 kVA / 800 kW ; 1100 kVA / 880 kW | có | khớp | khớp/khớp/khớp/mới |
| baudouin-diesel-generator-pg1250-b | BAUDOUIN | 12M33G1250/5 | 12 | 39,2 | 150 × 185 | 15 : 1 | 236,2/175/119,5 | 400V, 50 Hz ; 1150 kVA / 920 kW ; 1250 kVA / 1000 kW | có | khớp | khớp/khớp/khớp/mới |
| baudouin-diesel-generator-pg1400-b | BAUDOUIN | 12M33G1400/5 | 12 | 39,2 | 150 × 185 | 15 : 1 | 258,6/190,7/129,2 | 400V, 50 Hz ; 1250 kVA / 1000 kW ; 1400 kVA / 1120 kW | có | khớp | khớp/khớp/khớp/mới |
| baudouin-diesel-generator-pg150-b | BAUDOUIN | 6M11G150 | 6 | 6,75 | 105 × 130 | 18 : 1 | 30,2/23/15,9 | 400V, 50 Hz ; 135 kVA / 108 kW ; 150 kVA / 120 kW | chưa | mới | mới/mới/mới/mới |
| baudouin-diesel-generator-pg1500-b | BAUDOUIN | 12M33G1500/5 | 12 | 39,2 | 150 × 185 | 15 : 1 | 296,9/214,4/146,2 | 400V, 50 Hz ; 1375 kVA / 1100 kW ; 1500 kVA / 1200 kW | có | khớp | khớp/khớp/khớp/mới |
| baudouin-diesel-generator-pg165-b | BAUDOUIN | 6M11G4D0 | 6 | 6,75 | 105 × 130 | 18 : 1 | 32,6/24,6/16,7 | 400V, 50 Hz ; 150 kVA / 120 kW ; 165 kVA / 132 kW | chưa | mới | mới/mới/mới/mới |
| baudouin-diesel-generator-pg1650-b | BAUDOUIN | 12M33G1650/5 | 12 | 39,2 | 150 × 185 | 15 : 1 | 324/234,2/156,1 | 400V, 50 Hz ; 1500 kVA / 1200 kW ; 1650 kVA / 1320 kW | có | khớp | khớp/khớp/khớp/mới |
| baudouin-diesel-generator-pg1900-b | BAUDOUIN | 16M33G1900/5 | 16 | 52,3 | 150 × 185 | 15 : 1 | 364,3/265,4/179,7 | 400V, 50 Hz ; 1750 kVA / 1400 kW ; 1900 kVA / 1520 kW | có | mới | khớp/khớp/khớp/mới |
| baudouin-diesel-generator-pg20-b | BAUDOUIN | 4M06G2D0/S | 4 | 2,3 | 89 × 92 | 17,5 : 1 | 4,7/3,6/2,6 | 400V, 50 Hz ; 18 kVA / 14,4 kW ; 20 kVA / 16 kW | có | mới | mới/mới/mới/mới |
| baudouin-diesel-generator-pg2000-b | BAUDOUIN | 16M33G2000/5 | 16 | 52,3 | 150 × 185 | 15 : 1 | 401/290,7/194,7 | 400V, 50 Hz ; 1830 kVA / 1464 kW ; 2000 kVA / 1600 kW | có | mới | khớp/khớp/khớp/mới |
| baudouin-diesel-generator-pg220-b | BAUDOUIN | 6M16G2D0/S | 6 | 9,726 | 126 × 130 | 17 : 1 | 43,1/32,4/22,4 | 400V, 50 Hz ; 200 kVA / 160 kW ; 220 kVA / 176 kW | có | mới | mới/mới/mới/mới |
| baudouin-diesel-generator-pg2250-b | BAUDOUIN | 16M33G2250/5 | 16 | 52,3 | 150 × 185 | 14 : 1 | 428,6/311,3/208,8 | 400V, 50 Hz ; 2050 kVA / 1640 kW ; 2250 kVA / 1800 kW | có | mới | khớp/khớp/khớp/mới |
| baudouin-diesel-generator-pg25-b | BAUDOUIN | 4M06G4D0 | 4 | 2,3 | 89 × 92 | 17 17,5 : 1 | 6,1/4,5/3,2 | 400V, 50 Hz ; 23 kVA / 18,4 kW ; 25 kVA / 20 kW | chưa | mới | mới/mới/mới/mới |
| baudouin-diesel-generator-pg250-b | BAUDOUIN | 6M16G4D0/S | 6 | 9,726 | 126 × 130 | 17 : 1 | 50,9/38/25,8 | 400V, 50 Hz ; 230 kVA / 184 kW ; 250 kVA / 200 kW | có | mới | mới/mới/mới/mới |
| baudouin-diesel-generator-pg2500-b | BAUDOUIN | 20M33G2500/5 | 20 | 65,4 | 150 × 185 | 15 : 1 | 466,4/360,7/240,5 | 400V, 50 Hz ; 2250 kVA / 1800 kW ; 2500 kVA / 2000 kW | có | khớp | khớp/khớp/khớp/mới |
| baudouin-diesel-generator-pg275-b | BAUDOUIN | 6M16G6D0/S | 6 | 9,726 | 126 × 130 | 17 : 1 | 56,9/42,2/28,3 | 400V, 50 Hz ; 250 kVA / 200 kW ; 275 kVA / 220 kW | có | mới | mới/mới/mới/mới |
| baudouin-diesel-generator-pg2750-b | BAUDOUIN | 12M55G2750/5 | 12 | 65,65 | 180 × 215 | 16,5 : 1 | 513,6/381,3/263,3 | 400V, 50 Hz ; 2500 kVA / 2000 kW ; 2750 kVA / 2200 kW | có | mới | mới/khớp/khớp/mới |
| baudouin-diesel-generator-pg35-b | BAUDOUIN | 4M06G6D0 | 4 | 2,3 | 89 × 92 | 17,5 : 1 | 7,6/5,7/4 | 400V, 50 Hz ; 32 kVA / 25,6 kW ; 35 kVA / 28 kW | chưa | mới | mới/mới/mới/mới |
| baudouin-diesel-generator-pg350-b | BAUDOUIN | 6M16G350/5 | 6 | 9,726 | 126 × 130 | 17 : 1 | 70,5/52,3/35,4 | 400V, 50 Hz ; 320 kVA / 256 kW ; 350 kVA / 280 kW | có | khớp | khớp/khớp/khớp/mới |
| baudouin-diesel-generator-pg400-b | BAUDOUIN | 6M21G400/5 | 6 | 12,54 | 127 × 165 | 16 : 1 | 82,1/60,7/41 | 400V, 50 Hz ; 360 kVA / 288 kW ; 400 kVA / 320 kW | có | mới | khớp/khớp/mới/mới |
| baudouin-diesel-generator-pg44-b | BAUDOUIN | 4M06G8D0 | 4 | 2,3 | 89 × 92 | 17,5 : 1 | 9,5/7/4,7 | 400V, 50 Hz ; 40 kVA / 32 kW ; 44 kVA / 35 kW | chưa | mới | mới/mới/mới/mới |
| baudouin-diesel-generator-pg440-b | BAUDOUIN | 6M21G440/5 | 6 | 12,54 | 127 × 165 | 16 : 1 | 85,5/63,5/43,2 | 400V, 50 Hz ; 400 kVA / 320 kW ; 440 kVA / 352 kW | có | khớp | khớp/khớp/khớp/mới |
| baudouin-diesel-generator-pg50-b | BAUDOUIN | 4M06G50/5 | 4 | 2,3 | 89 × 92 | 17,5 : 1 | 10,7/8/5,4 | 400V, 50 Hz ; 45 kVA / 36 kW ; 50 kVA / 40 kW | có | khớp | khớp/khớp/khớp/mới |
| baudouin-diesel-generator-pg500-b | BAUDOUIN | 6M21G500/5 | 6 | 12,54 | 127 × 165 | 16 : 1 | 95,9/69,6/46,6 | 400V, 50 Hz ; 450 kVA / 360 kW ; 500 kVA / 400 kW | có | khớp | khớp/khớp/khớp/mới |
| baudouin-diesel-generator-pg55-b | BAUDOUIN | 4M10G10D0/S | 4 | 2,3 | 89 × 92 | 17,5 : 1 | 11,9/8,9/6 | 400V, 50 Hz ; 50 kVA / 40 kW ; 55 kVA / 44 kW | chưa | mới | mới/mới/mới/mới |
| baudouin-diesel-generator-pg550-b | BAUDOUIN | 6M21G550/5 | 6 | 12,54 | 127 × 165 | 15,2 : 1 | 109,5/75,3/51 | 400V, 50 Hz ; 500 kVA / 400 kW ; 550 kVA / 440 kW | có | khớp | khớp/khớp/khớp/mới |
| baudouin-diesel-generator-pg715-b | BAUDOUIN | 6M33G715/5 | 6 | 19,6 | 150 × 185 | 15 : 1 | 136,3/100/67,1 | 400V, 50 Hz ; 650 kVA / 520 kW ; 715 kVA / 572 kW | có | mới | khớp/khớp/khớp/mới |
| baudouin-diesel-generator-pg72-b | BAUDOUIN | 4M10G2D0 | 4 | 4,087 | 105 × 118 | 17,5 : 1 | 15/11,1/7,7 | 400V, 50 Hz ; 65 kVA / 52 kW ; 72 kVA / 58 kW | chưa | mới | mới/mới/mới/mới |
| baudouin-diesel-generator-pg750-b | BAUDOUIN | 6M33G750/5 | 6 | 19,6 | 150 × 185 | 15 : 1 | 151,1/111,2/75,5 | 400V, 50 Hz ; 680 kVA / 544 kW ; 750 kVA / 600 kW | có | mới | khớp/khớp/mới/mới |
| baudouin-diesel-generator-pg825-b | BAUDOUIN | 6M33G825/5 | 6 | 19,6 | 150 × 185 | 15 : 1 | 159,5/114,8/77,4 | 400V, 50 Hz ; 750 kVA / 600 kW ; 825 kVA / 660 kW | có | khớp | khớp/khớp/khớp/mới |
| baudouin-diesel-generator-pg88-b | BAUDOUIN | 4M10G4D0 | 4 | 4,087 | 105 × 118 | 17,5 : 1 | 18,8/13,5/9,1 | 400V, 50 Hz ; 80 kVA / 64 kW ; 88 kVA / 70 kW | chưa | mới | mới/mới/mới/mới |
| baudouin-diesel-generator-pg900-b | BAUDOUIN | 12M26G900/5 | 12 | 31,8 | 150 × 150 | 15,7 : 1 | 173,7/133,1/90,8 | 400V, 50 Hz ; 800 kVA / 640 kW ; 900 kVA / 720 kW | có | mới | khớp/khớp/mới/mới |
| fpt-iveco-diesel-generator-pg110-i | FPT IVECO | NEF45TM2A.S500 | 4 | 4,5 | 104 × 132 | 17,5 : 1 | 22/16,2/11 | 400V, 50 Hz ; 100 kVA / 80 kW ; 110 kVA / 88 kW | có | khớp | khớp/khớp/khớp/mới |
| fpt-iveco-diesel-generator-pg135-i | FPT IVECO | NEF45TM3.S500 | 4 | 4,5 | 104 × 132 | 17,5 : 1 | 27,6/21,6/14,4 | 400V, 50 Hz ; 123 kVA / 98 kW ; 135 kVA / 108 kW | có | khớp | khớp/khớp/khớp/mới |
| fpt-iveco-diesel-generator-pg187-i | FPT IVECO | NEF67TM4.S500 | 6 | 6,7 | 104 × 132 | 17,5 : 1 | 36,6/29,4/18 | 400V, 50 Hz ; 170 kVA / 136 kW ; 187 kVA / 150 kW | có | khớp | khớp/khớp/khớp/mới |
| fpt-iveco-diesel-generator-pg22-i | FPT IVECO | R24MAFS01.23A01 | 4 | 2,4 | 87 × 103 | 19:1 | 6,3/5,1/3,7 | 400V, 50 Hz ; 20 kVA / 16 kW ; 22 kVA / 17,6 kW | có | mới | mới/mới/mới/mới |
| fpt-iveco-diesel-generator-pg220-i | FPT IVECO | NEF67TM7.S502 | 6 | 6,7 | 104 × 132 | 17,5 : 1 | 38,3/33,9/21,8 | 400V, 50 Hz ; 200 kVA / 160 kW ; 220 kVA / 176 kW | có | mới | mới/mới/mới/mới |
| fpt-iveco-diesel-generator-pg275-i | FPT IVECO | NEF67TE8P.S550 | 6 | 6,7 | 104 × 132 | 17,5 : 1 | 51,5/41,2/26,2 | 400V, 50 Hz ; 250 kVA / 200 kW ; 275 kVA / 220 kW | chưa | mới | mới/mới/mới/mới |
| fpt-iveco-diesel-generator-pg33-i | FPT IVECO | R24MSFS01.31A01 | 4 | 2,4 | 87 × 103 | 17,8 : 1 | 7,8/5,9/3,9 | 400V, 50 Hz ; 30 kVA / 24 kW ; 33 kVA / 26,4 kW | có | mới | mới/mới/mới/mới |
| fpt-iveco-diesel-generator-pg330-i | FPT IVECO | CURSOR87TE4.S550 | 6 | 8,7 | 117 × 135 | 16,5 : 1 | 68,6/55,6/35,6 | 400V, 50 Hz ; 300 kVA / 240 kW ; 330 kVA / 264 kW | có | mới | mới/mới/mới/mới |
| fpt-iveco-diesel-generator-pg385-i | FPT IVECO | CURSOR13TE2A.S551 | 6 | 12,88 | 135 × 150 | 16,5 : 1 | 70/57,3/38,8 | 400V, 50 Hz ; 350 kVA / 280 kW ; 385 kVA / 308 kW | có | khớp | khớp/khớp/khớp/mới |
| fpt-iveco-diesel-generator-pg44-i | FPT IVECO | R24MSFS01.40A01 | 4 | 2,4 | 87 × 103 | 17,8:1 | 9,9/8,0/5,8 | 400V, 50 Hz ; 40 kVA / 32 kW ; 44 kVA / 35,2 kW | có | mới | mới/mới/mới/mới |
| fpt-iveco-diesel-generator-pg440-i | FPT IVECO | CURSOR13TE3A.S551 | 6 | 12,88 | 135 × 150 | 16,5 : 1 | 85,8/70,4/42,8 | 400V, 50 Hz ; 400 kVA / 320 kW ; 440 kVA / 352 kW | có | khớp | khớp/khớp/khớp/mới |
| fpt-iveco-diesel-generator-pg500-i | FPT IVECO | CR13TE6W.S550 | 6 | 12,88 | 135 × 150 | 16,5 : 1 | 89,9/72,5/51,8 | 400V, 50 Hz ; 450 kVA / 360 kW ; 500 kVA / 400 kW | có | khớp | khớp/khớp/khớp/mới |
| fpt-iveco-diesel-generator-pg55-i | FPT IVECO | R38MSNS01.55A02 | 4 | 3,76 | 102 × 115 | 17,5 : 1 | 13,8/11,6/7,9 | 400V, 50 Hz ; 50 kVA / 40 kW ; 55 kVA / 44 kW | có | mới | mới/mới/mới/mới |
| fpt-iveco-diesel-generator-pg550-i | FPT IVECO | CR13TE7W.S550 | 6 | 12,88 | 135 × 150 | 16,5 : 1 | 100,6/80,2/51,5 | 400V, 50 Hz ; 500 kVA / 400 kW ; 550 kVA / 440 kW | có | khớp | khớp/khớp/khớp/mới |
| fpt-iveco-diesel-generator-pg66-i | FPT IVECO | R38MSNS01.66A02 | 4 | 3,76 | 102 × 115 | 17,5 : 1 | 15,9/13,3/9,2 | 400V, 50 Hz ; 60 kVA / 48 kW ; 66 kVA / 53 kW | có | mới | mới/mới/mới/mới |
| fpt-iveco-diesel-generator-pg660-i | FPT IVECO | CR16TE1W.S550 | 6 | 15,9 | 141 × 170 | 15,5 : 1 | 115/87/58 | 400V, 50 Hz ; 600 kVA / 480 kW ; 660 kVA / 528 kW | có | LỆCH | khớp/khớp/khớp/mới |
| fpt-iveco-diesel-generator-pg88-i | FPT IVECO | NEF45SM3.S500 | 4 | 4,5 | 104 × 132 | 17,5 : 1 | 19,4/15,4/9,6 | 400V, 50 Hz ; 80 kVA / 64 kW ; 88 kVA / 70 kW | có | khớp | khớp/khớp/khớp/mới |
| hyundai-doosan-diesel-generator-pg1000-d | HYUNDAI DOOSAN | DP222CC | 12 | 21,927 | 128 × 142 | 14,6 : 1 | 192/162/75 | 400V, 50 Hz ; 900 kVA / 720 kW ; 1000 kVA / 800 kW | chưa | mới | mới/mới/mới/mới |
| hyundai-doosan-diesel-generator-pg220-d | HYUNDAI DOOSAN | DP054CC | 4 | 5 | 110 × 132 | 16,4 : 1 | 43/31,2/21,1 | 400V, 50 Hz ; 200 kVA / 160 kW ; 220 kVA / 176 kW | chưa | mới | mới/mới/mới/mới |
| hyundai-doosan-diesel-generator-pg250-d | HYUNDAI DOOSAN | DP086CB | 6 | 7,5 | 110 × 132 | 16,7 : 1 | 46,8/35,3/24,2 | 400V, 50 Hz ; 230 kVA / 184 kW ; 250 kVA / 200 kW | có | mới | khớp/khớp/mới/mới |
| hyundai-doosan-diesel-generator-pg275-d | HYUNDAI DOOSAN | DP086CC | 6 | 7,5 | 110 × 132 | 17 : 1 | 51,3/38,3/26,1 | 400V, 50 Hz ; 250 kVA / 200 kW ; 275 kVA / 220 kW | chưa | mới | mới/mới/mới/mới |
| hyundai-doosan-diesel-generator-pg300-d | HYUNDAI DOOSAN | DP086CD | 6 | 7,5 | 110 × 132 | 17 : 1 | 56,9/41,9/28,6 | 400V, 50 Hz ; 280 kVA / 224 kW ; 300 kVA / 240 kW | có | mới | khớp/khớp/mới/mới |
| hyundai-doosan-diesel-generator-pg330-d | HYUNDAI DOOSAN | DP086CE | 6 | 7,5 | 110 × 132 | 17 : 1 | 62,3/45,7/30,9 | 400V, 50 Hz ; 300 kVA / 240 kW ; 330 kVA / 264 kW | có | mới | khớp/khớp/mới/mới |
| hyundai-doosan-diesel-generator-pg400-d | HYUNDAI DOOSAN | DP126LB | 6 | 11,051 | 123 × 155 | 17,2 : 1 | 76/57,1/38,4 | 400V, 50 Hz ; 360 kVA / 288 kW ; 400 kVA / 320 kW | có | khớp | khớp/khớp/khớp/mới |
| hyundai-doosan-diesel-generator-pg470-d | HYUNDAI DOOSAN | P158LE | 8 | 14,618 | 128 × 142 | 15 : 1 | 81/59,1/39,8 | 400V, 50 Hz ; 410 kVA / 328 kW ; 470 kVA / 376 kW | có | khớp | khớp/khớp/khớp/mới |
| hyundai-doosan-diesel-generator-pg510-d | HYUNDAI DOOSAN | DP158LC | 8 | 14,618 | 128 × 142 | 15 : 1 | 99,6/72,9/48,9 | 400V, 50 Hz ; 450 kVA / 360 kW ; 510 kVA / 408 kW | có | khớp | khớp/khớp/khớp/mới |
| hyundai-doosan-diesel-generator-pg580-d | HYUNDAI DOOSAN | DP158LD | 8 | 14,618 | 128 × 142 | 15 : 1 | 115,1/83,4/55,1 | 400V, 50 Hz ; 530 kVA / 424 kW ; 580 kVA / 464 kW | có | khớp | khớp/khớp/khớp/mới |
| hyundai-doosan-diesel-generator-pg630-d | HYUNDAI DOOSAN | DP180LA | 10 | 18,273 | 128 × 142 | 15 : 1 | 123,6/94,2/64,8 | 400V, 50 Hz ; 570 kVA / 456 kW ; 630 kVA / 504 kW | có | khớp | khớp/khớp/khớp/mới |
| hyundai-doosan-diesel-generator-pg710-d | HYUNDAI DOOSAN | DP180LB | 10 | 18,273 | 128 × 142 | 15 : 1 | 136,4/103,8/71,2 | 400V, 50 Hz ; 640 kVA / 512 kW ; 710 kVA / 568 kW | có | khớp | khớp/khớp/khớp/mới |
| hyundai-doosan-diesel-generator-pg750-d | HYUNDAI DOOSAN | DP222LB | 12 | 21,927 | 128 × 142 | 15 : 1 | 147,1/109,2/73 | 400V, 50 Hz ; 680 kVA / 544 kW ; 750 kVA / 600 kW | có | khớp | khớp/khớp/khớp/mới |
| hyundai-doosan-diesel-generator-pg825-d | HYUNDAI DOOSAN | DP222LC | 12 | 21,927 | 128 × 142 | 15 : 1 | 161/119,1/79,3 | 400V, 50 Hz ; 750 kVA / 600 kW ; 825 kVA / 660 kW | có | khớp | khớp/khớp/khớp/mới |
| hyundai-doosan-diesel-generator-pg900-d | HYUNDAI DOOSAN | DP222CB | 12 | 21,927 | 128 × 142 | 14,6 : 1 | 190/146/102 | 400V, 50 Hz ; 800 kVA / 640 kW ; 900 kVA / 720 kW | có | LỆCH | khớp/khớp/khớp/mới |
| kofo-diesel-generator-pg110-k | KOFO | 4RT55-88D | 4 | 5,32 | 110 × 140 | 16 : 1 | 22,5/17,7/12,2 | 400V, 50 Hz ; 100 kVA / 80 kW ; 110 kVA / 88 kW | có | mới | khớp/khớp/mới/mới |
| kofo-diesel-generator-pg137-k | KOFO | 4RT55-110D | 4 | 5,32 | 110 × 140 | 16 : 1 | 24,5/18,4/13,2 | 400V, 50 Hz ; 125 kVA / 100 kW ; 137 kVA / 109,6 kW | có | mới | khớp/khớp/mới/mới |
| kofo-diesel-generator-pg150-k | KOFO | 6RT80-132D | 6 | 7,98 | 110 × 140 | 17 : 1 | 33/26/16 | 400V, 50 Hz ; 135 kVA / 108 kW ; 150 kVA / 120 kW | có | mới | khớp/khớp/mới/mới |
| kofo-diesel-generator-pg165-k | KOFO | 6RT80-132D | 6 | 7,98 | 110 × 140 | 17 : 1 | 36,3/28,5/17,5 | 400V, 50 Hz ; 150 kVA / 120 kW ; 165 kVA / 132 kW | có | mới | khớp/khớp/mới/mới |
| kofo-diesel-generator-pg220-k | KOFO | 6RT80-176DE | 6 | 7,98 | 110 × 140 | 17 : 1 | 39,7/29,8/19,8 | 400V, 50 Hz ; 200 kVA / 160 kW ; 220 kVA / 176 kW | có | mới | khớp/khớp/LỆCH/mới |
| kofo-diesel-generator-pg35-k | KOFO | N4100DS | 4 | 3,61 | 100 × 115 | 19 : 1 | 8,4/6,6/4,5 | 400V, 50 Hz ; 32 kVA / 25,6 kW ; 35 kVA / 28 kW | có | mới | mới/khớp/mới/mới |
| kofo-diesel-generator-pg50-k | KOFO | N4100ZDS | 4 | 3,61 | 100 × 115 | 19 : 1 | 12,4/9,3/6,2 | 400V, 50 Hz ; 45 kVA / 36 kW ; 50 kVA / 40 kW | chưa | mới | mới/mới/mới/mới |
| kofo-diesel-generator-pg70-k | KOFO | N4105ZDS | 4 | 4,15 | 105 × 120 | 17 : 1 | 14,8/11,1/7,4 | 400V, 50 Hz ; 63 kVA / 50,4 kW ; 70 kVA / 56 kW | có | mới | mới/khớp/mới/mới |
| kofo-diesel-generator-pg82-k | KOFO | N4105ZLDS | 4 | 4,15 | 105 × 120 | 17 : 1 | 13/9/6 | 400V, 50 Hz ; 74 kVA / 59,2 kW ; 82 kVA / 65,6 kW | có | mới | mới/khớp/mới/mới |
| perkins-diesel-generator-pg10-p | PERKINS | 403A-11G1 | 3 | 1,131 | 77 × 81 | 23 : 1 | 2,6/2/1,5 | 400V, 50 Hz ; 9 kVA / 7,2 kW ; 10 kVA / 8 kW | có | khớp | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg1000-p | PERKINS | 4008-30TAG1 | 8 | 30,561 | 160 × 190 | 13 : 1 | 195/143/98 | 400V, 50 Hz ; 910 kVA / 728 kW ; 1000 kVA / 800 kW | có | mới | mới/mới/mới/mới |
| perkins-diesel-generator-pg110-p | PERKINS | 1104C-44TAG2 | 4 | 4,4 | 105 × 127 | 18,2 : 1 | 22,6/17,1/11,8 | 400V, 50 Hz ; 100 kVA / 80 kW ; 110 kVA / 88 kW | có | khớp | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg1125-p | PERKINS | 4008-30TAG2 | 8 | 30,561 | 160 × 190 | 13 : 1 | 211/161/113 | 400V, 50 Hz ; 1020 kVA / 816 kW ; 1125 kVA / 900 kW | có | mới | mới/mới/mới/mới |
| perkins-diesel-generator-pg1250-p | PERKINS | 4008-30TAG3 | 8 | 30,561 | 160 × 190 | 13 : 1 | 244/188/120 | 400V, 50 Hz ; 1150 kVA / 920 kW ; 1250 kVA / 1000 kW | có | khớp | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg1385-p | PERKINS | 4012-46TWG2A | 12 | 45.84 | 160 × 190 | 12.8:1 | 259/196/143 | 400V, 50 Hz ; 1250 kVA / 1000 kW ; 1385 kVA / 1108 kW | có | LỆCH | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg15-p | PERKINS | 403A-15G1 | 3 | 1,496 | 84 × 90 | 22.5 : 1 | 3,7/2,8/2 | 400V, 50 Hz ; 13 kVA / 10,4 kW ; 15 kVA / 12 kW | có | khớp | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg150-p | PERKINS | 1106A-70TG1 | 6 | 7,01 | 105 × 135 | 18,2 : 1 | 30,3/22,7/15,9 | 400V, 50 Hz ; 135 kVA / 108 kW ; 150 kVA / 120 kW | có | khớp | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg1500-p | PERKINS | 4012-46TAG1A | 12 | 45.84 | 160 × 190 | 12.8:1 | 281/212/149 | 400V, 50 Hz ; 1364 kVA / 1091 kW ; 1500 kVA / 1200 kW | có | mới | khớp/khớp/mới/mới |
| perkins-diesel-generator-pg165-p | PERKINS | 1106A-70TAG2 | 6 | 7,01 | 105 × 135 | 16 : 1 | 33,4/24,7/16,4 | 400V, 50 Hz ; 150 kVA / 120 kW ; 165 kVA / 132 kW | có | khớp | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg1650-p | PERKINS | 4012-46TAG2A | 12 | 45.84 | 160 × 190 | 12.8:1 | 313/239/161 | 400V, 50 Hz ; 1500 kVA / 1200 kW ; 1650 kVA / 1320 kW | có | LỆCH | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg1875-p | PERKINS | 4012-46TAG3A | 12 | 45.84 | 160 × 190 | 12.8:1 | 374/272/183 | 400V, 50 Hz ; 1705 kVA / 1364 kW ; 1875 kVA / 1500 kW | có | LỆCH | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg200-p | PERKINS | 1106A-70TAG3 | 6 | 7,01 | 105 × 135 | 16 : 1 | 41,4/32/20,2 | 400V, 50 Hz ; 180 kVA / 144 kW ; 200 kVA / 160 kW | có | khớp | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg2000-p | PERKINS | 4016-61TRG1 | 16 | 61,123 | 160 × 190 | 13 : 1 | 383.8/299.8/206.8 | 400V, 50 Hz ; 1850 kVA / 1480 kW ; 2000 kVA / 1600 kW | có | LỆCH | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg22-p | PERKINS | 404A-22G1 | 4 | 2,216 | 84 × 90 | 23,3 : 1 | 5,3/4/2,9 | 400V, 50 Hz ; 20 kVA / 16 kW ; 22 kVA / 17,6 kW | có | khớp | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg220-p | PERKINS | 1106A-70TAG4 | 6 | 7,01 | 105 × 135 | 16 : 1 | 45,8/24,7/23,1 | 400V, 50 Hz ; 200 kVA / 160 kW ; 220 kVA / 176 kW | có | khớp | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg2250-p | PERKINS | 4016-61TRG2 | 16 | 61,123 | 160 × 190 | 13 : 1 | 418.1/317.7/223.5 | 400V, 50 Hz ; 2000 kVA / 1600 kW ; 2250 kVA / 1800 kW | có | LỆCH | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg250-p | PERKINS | 1206A-E70TTAG2 | 6 | 7,01 | 105 × 135 | 15,8 : 1 | 51/38/25,5 | 400V, 50 Hz ; 230 kVA / 184 kW ; 250 kVA / 200 kW | có | khớp | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg2500-p | PERKINS | 4016-61TRG3 | 16 | 61,123 | 160 × 190 | 13 : 1 | 470.6/350.8/244.5 | 400V, 50 Hz ; 2250 kVA / 1800 kW ; 2500 kVA / 2000 kW | có | khớp | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg275-p | PERKINS | 1206A-E70TTAG3 | 6 | 7,01 | 105 × 135 | 15,8 : 1 | 56,9/41,5/28,1 | 400V, 50 Hz ; 250 kVA / 200 kW ; 275 kVA / 220 kW | có | khớp | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg33-p | PERKINS | 1103A-33G | 3 | 3,3 | 105 × 127 | 19,25 : 1 | 7,3/5,6/4,1 | 400V, 50 Hz ; 30 kVA / 24 kW ; 33 kVA / 26,4 kW | có | khớp | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg350-p | PERKINS | 2206A-E13TAG2 | 6 | 12,5 | 130 × 157 | 16.3 : 1 | 65/49/34 | 400V, 50 Hz ; 320 kVA / 256 kW ; 350 kVA / 280 kW | có | khớp | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg400-p | PERKINS | 2206A-E13TAG2 | 6 | 12,5 | 130 × 157 | 16.3 : 1 | 71/54/37 | 400V, 50 Hz ; 360 kVA / 288 kW ; 400 kVA / 320 kW | có | khớp | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg450-p | PERKINS | 2206A-E13TAG3 | 6 | 12,5 | 130 × 157 | 16.3 : 1 | 81/62/42 | 400V, 50 Hz ; 400 kVA / 320 kW ; 450 kVA / 360 kW | có | khớp | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg50-p | PERKINS | 1103A-33TG1 | 3 | 3,3 | 105 × 127 | 17,25 : 1 | 10,5/8/5,6 | 400V, 50 Hz ; 45 kVA / 36 kW ; 50 kVA / 40 kW | có | khớp | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg500-p | PERKINS | 2506A-E15TAG1 | 6 | 15,2 | 137 × 171 | 16 : 1 | 95/72/50 | 400V, 50 Hz ; 450 kVA / 360 kW ; 500 kVA / 400 kW | có | mới | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg550-p | PERKINS | 2506A-E15TAG2 | 6 | 15,2 | 137 × 171 | 16 : 1 | 100/76/53 | 400V, 50 Hz ; 500 kVA / 400 kW ; 550 kVA / 440 kW | có | mới | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg66-p | PERKINS | 1103A-33TG2 | 3 | 3,3 | 105 × 127 | 17,25 : 1 | 14,6/10,8/7,6 | 400V, 50 Hz ; 60 kVA / 48 kW ; 66 kVA / 53 kW | có | khớp | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg660-p | PERKINS | 2806A-E18TAG1A | 6 | 18,1 | 145 × 183 | 14.5 : 1 | 123/90/61 | 400V, 50 Hz ; 600 kVA / 480 kW ; 660 kVA / 528 kW | có | khớp | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg700-p | PERKINS | 2806A-E18TAG2 | 6 | 18,1 | 145 × 183 | 14.5 : 1 | 132/97/66 | 400V, 50 Hz ; 650 kVA / 520 kW ; 700 kVA / 560 kW | có | khớp | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg72-p | PERKINS | 1104A-44TG1 | 4 | 4,4 | 105 × 127 | 17,25 : 1 | 14,8/11,2/8 | 400V, 50 Hz ; 65 kVA / 52 kW ; 72 kVA / 58 kW | có | khớp | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg850-p | PERKINS | 2806A-E18TTAG5 | 6 | 18,1 | 145 × 183 | 14:1 | 162/118/80 | 400V, 50 Hz ; 770 kVA / 616 kW ; 850 kVA / 680 kW | có | mới | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg88-p | PERKINS | 1104A-44TG2 | 4 | 4,4 | 105 × 127 | 17,25 : 1 | 18,7/14/9,7 | 400V, 50 Hz ; 80 kVA / 64 kW ; 88 kVA / 70 kW | có | khớp | khớp/khớp/khớp/mới |
| perkins-diesel-generator-pg900-p | PERKINS | 4006-23TAG3A | 6 | 22,921 | 160 × 190 | 13,6:1 | 175/132/91 | 400V, 50 Hz ; 800 kVA / 640 kW ; 900 kVA / 720 kW | có | khớp | khớp/khớp/khớp/mới |
| yangdong-diesel-generator-pg100-y | YANGDONG | Y4110ZLD | 4 | 4,3 | 110 × 118 | 18 : 1 | 16,2/12,5/8,8 | 400V, 50 Hz ; 90 kVA / 72 kW ; 100 kVA / 80 kW | có | khớp | khớp/khớp/khớp/mới |
| yangdong-diesel-generator-pg110-y | YANGDONG | YD4GZLD | 4 | 4,3 | 110 × 118 | 18 : 1 | 22,1/18,9/14,2 | 400V, 50 Hz ; 100 kVA / 80 kW ; 110 kVA / 88 kW | chưa | mới | mới/mới/mới/mới |
| yangdong-diesel-generator-pg13-y | YANGDONG | YD385D | 3 | 1,532 | 85 × 90 | 18 : 1 | 4,2/3,8/3,1 | 400V, 50 Hz ; 11,7 kVA / 9,36 kW ; 13 kVA / 10,4 kW | có | khớp | khớp/khớp/khớp/mới |
| yangdong-diesel-generator-pg22-y | YANGDONG | YND485D | 4 | 2,156 | 85 × 95 | 18 : 1 | 5,6/4,4/3,3 | 400V, 50 Hz ; 20 kVA / 16 kW ; 22 kVA / 17,6 kW | có | khớp | khớp/khớp/khớp/mới |
| yangdong-diesel-generator-pg27-y | YANGDONG | Y490D | 4 | 2,67 | 90 × 105 | 18 : 1 | 6,9/5,8/4,9 | 400V, 50 Hz ; 24,5 kVA / 19,5 kW ; 27 kVA / 21,6 kW | có | khớp | khớp/khớp/khớp/mới |
| yangdong-diesel-generator-pg33-y | YANGDONG | Y495D | 4 | 2,98 | 95 × 105 | 18 : 1 | 7,6/6/3,9 | 400V, 50 Hz ; 30 kVA / 24 kW ; 33 kVA / 26,4 kW | có | khớp | khớp/khớp/khớp/mới |
| yangdong-diesel-generator-pg44-y | YANGDONG | Y4102D | 4 | 3,88 | 100 × 118 | 18 : 1 | 8,3/6,6/5,1 | 400V, 50 Hz ; 40 kVA / 32 kW ; 44 kVA / 35,2 kW | có | khớp | khớp/khớp/khớp/mới |
| yangdong-diesel-generator-pg55-y | YANGDONG | Y4105D | 4 | 4,33 | 105 × 118 | 18 : 1 | 10,8/7,4/6,1 | 400V, 50 Hz ; 50 kVA / 40 kW ; 55 kVA / 44 kW | có | khớp | LỆCH/khớp/khớp/mới |
| yangdong-diesel-generator-pg70-y | YANGDONG | Y4105ZLD | 4 | 4,087 | 105 × 118 | 18 : 1 | 13,3/10,7/8,3 | 400V, 50 Hz ; 63 kVA / 50,4 kW ; 70 kVA / 56 kW | có | khớp | khớp/khớp/khớp/mới |
| yangdong-diesel-generator-pg80-y | YANGDONG | YD4EZLD | 4 | 4,087 | 105 × 118 | 18 : 1 | 13,5/10,9/8,4 | 400V, 50 Hz ; 72 kVA / 57,6 kW ; 80 kVA / 64 kW | có | khớp | khớp/khớp/khớp/mới |
| yanmar-diesel-generator-pg14-ym | YANMAR | 3TNV88-GGEA | 3 | 1,642 | 88 × 90 | 19.1:1 | 2,8/2,3/1,7 | 400V, 50 Hz ; 13 kVA / 10,4 kW ; 14 kVA / 11,2 kW | chưa | mới | mới/mới/mới/mới |
| yanmar-diesel-generator-pg20-ym | YANMAR | 4TNV88-GGEA | 4 | 2,19 | 88 × 90 | 19.1:1 | 3,8/3/2,3 | 400V, 50 Hz ; 18 kVA / 14,4 kW ; 20 kVA / 16 kW | chưa | mới | mới/mới/mới/mới |
| yanmar-diesel-generator-pg23-ym | YANMAR | 4TNV84T-GGEA | 4 | 1,995 | 84 × 90 | 18.9:1 | 4,4/3,5/2,6 | 400V, 50 Hz ; 21 kVA / 16,8 kW ; 23 kVA / 18,4 kW | chưa | mới | mới/mới/mới/mới |
| yanmar-diesel-generator-pg38-ym | YANMAR | 4TNV98-GGEA | 4 | 3,319 | 98 × 110 | 18.5:1 | 7/5,4/3,7 | 400V, 50 Hz ; 34 kVA / 27,2 kW ; 38 kVA / 30,4 kW | chưa | mới | mới/mới/mới/mới |
| yanmar-diesel-generator-pg46-ym | YANMAR | 4TNV98T-GGEA | 4 | 3,319 | 98 × 110 | 18.1:1 | 8,2/6,4/4,5 | 400V, 50 Hz ; 42 kVA / 33,6 kW ; 46 kVA / 36,8 kW | chưa | mới | mới/mới/mới/mới |
| yanmar-diesel-generator-pg55-ym | YANMAR | 4TNV106-GGEA | 4 | 4,412 | 106 × 125 | 18:1 | 10,1/7,5/5,3 | 400V, 50 Hz ; 50 kVA / 40 kW ; 55 kVA / 44 kW | chưa | mới | mới/mới/mới/mới |
| yanmar-diesel-generator-pg63-ym | YANMAR | 4TNV106T-GGEA | 4 | 4,412 | 106 × 125 | 18:1 | 11,2/8,5/6,1 | 400V, 50 Hz ; 57 kVA / 45,6 kW ; 63 kVA / 50,4 kW | chưa | mới | mới/mới/mới/mới |
