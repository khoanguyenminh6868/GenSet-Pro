# Đầu phát: hãng nào chưa có datasheet (kiểm kê 24/11/2026)

Tính bằng script trên toàn bộ `suppliers/cn/*.json` (436 hồ sơ) + tờ đã lưu `suppliers/sources/`, không lấy mẫu. Gốc: `main` ngày 24/11/2026. Chỉ đọc, chưa sửa dữ liệu.

## 1. Tóm tắt theo hãng

"Model" = một khoá đầu phát sau khi chuẩn hoá như catalog đang làm (bỏ dấu cách, gạch ngang, dấu chấm; "UCI 274C" = "UCI274C"), có ít nhất một NCC ghi. "Có tờ" xem mục 5.

| Hãng (theo cách repo đã ghi) | Model NCC ghi | Có tờ + có bảng định mức | Có tờ nhưng chưa ra bảng định mức | KHÔNG có tờ | Số NCC ghi nhóm không tờ | Số lần ghi nhóm không tờ |
|---|---|---|---|---|---|---|
| Stamford | 325 | 85 | 45 | **195** (60%) | 35 | 886 |
| Leroy-Somer | 192 | 102 | 4 | **86** (44.8%) | 15 | 178 |
| Mecc Alte | 47 | 18 | 0 | **29** (61.7%) | 4 | 42 |
| Marathon | 39 | 0 | 0 | **39** (100%) | 5 | 129 |
| FG Wilson | 16 | 0 | 9 | **7** (43.8%) | 2 | 9 |
| Engga | 0 | 0 | 0 | **0** (0%) | 0 | 0 |
| Faraday | 0 | 0 | 0 | **0** (0%) | 0 | 0 |
| Kwise | 0 | 0 | 0 | **0** (0%) | 0 | 0 |
| Evotec | 0 | 0 | 0 | **0** (0%) | 0 | 0 |
| Siemens | 0 | 0 | 0 | **0** (0%) | 0 | 0 |
| WEG | 0 | 0 | 0 | **0** (0%) | 0 | 0 |
| chưa rõ hãng | 2088 | 42 | 120 | **1926** (92.2%) | 66 | 4808 |
| **Tổng** | 2707 | 247 | 178 | **2282** (84.3%) | 78 | 6052 |

**Đọc bảng:** 2.282 / 2.707 model (84.3%) không có tờ nào. Phần lớn nằm ở dòng "chưa rõ hãng" (1926) vì NCC thường chỉ ghi mã, không ghi hãng; repo chỉ gắn hãng khi NCC ghi hãng ở cột / ô / tên trang. Không đoán hãng từ mã.

### Nhóm "chưa rõ hãng" tách thêm (chỉ để tham khảo, KHÔNG dùng để tính hãng ở trên)

| Cách tách | Model | Có tờ + bảng | Có tờ, chưa bảng | KHÔNG tờ | Số NCC (nhóm không tờ) | Số lần ghi (nhóm không tờ) |
|---|---|---|---|---|---|---|
| Mã thuộc họ Stamford (UCI/UCD/HCI/PI…/S?L?, theo `ALT_CODE_FAMILY` của catalog) | 32 | 4 | 7 | **21** (65.6%) | 10 | 28 |
| Mã thuộc họ Leroy-Somer (LSA/TAL) | 57 | 14 | 0 | **43** (75.4%) | 6 | 124 |
| Mã thuộc họ Mecc Alte (ECO/ECP) | 152 | 8 | 0 | **144** (94.7%) | 2 | 218 |
| Mã không thuộc họ nào trong danh sách trên | 1847 | 16 | 113 | **1718** (93%) | 59 | 4438 |

Chưa tính hãng cho 1847 model "không thuộc họ nào" (WT, STC, BC, LTP, SY-A, MX, mã trần như 274C…): cần Khoa / NCC nói hãng, hoặc tìm trên internet theo mã.

## 2. Hãng chưa có hồ sơ / datasheet trong repo

Hồ sơ NCC-hãng đầu phát (`role: alternator_maker`) có 40 bản. Chỉ **4** có tờ datasheet (nguồn số 1001–1999): Stamford (`stamford-avk-china`, 68 tờ), Leroy-Somer (`leroy-somer-fuzhou`, 20), Mecc Alte (`mecc-alte`, 18), `xinrongbang-fujian` (1 tờ). Mọi hãng khác dưới đây có hồ sơ (trang web) nhưng **không có tờ datasheet nào**:

| Hãng | Hồ sơ trong repo | Tờ datasheet (n 1001–1999) | Model gắn được trong catalog (từ bảng của chính hãng) |
|---|---|---|---|
| Marathon | `marathon-generators` (2 nguồn, 1 bảng) | 0 | 0 |
| Marathon (Geshin, Trung Quốc) | `geshin-marathon` (1 nguồn, 0 bảng) | 0 | 0 |
| Engga | `engga` (5 nguồn, 4 bảng) | 0 | 0 |
| Faraday | `faraday-wuxi` (12 nguồn, 10 bảng) | 0 | 0 |
| Kwise | `kwise-generator` (10 nguồn, 8 bảng) | 0 | 0 |
| Evotec | `evotec-power` (9 nguồn, 8 bảng) | 0 | 0 |
| Marelli Motori | `marelli-motori` (4 nguồn, 1 bảng) | 0 | 0 |
| Sincro | `sincro-soga` (34 nguồn, 35 bảng) | 0 | 0 |
| Linz Electric | `linz-electric` (3 nguồn, 2 bảng) | 0 | 0 |
| Nishishiba (NSDK) | `nishishiba` (1 nguồn, 0 bảng) | 0 | 0 |
| Agestar | `agestar` (23 nguồn, 35 bảng) | 0 | 53 |
| Keliang | `keliang-fuan` (6 nguồn, 8 bảng) | 0 | 63 |
| Eastern Lion | `eastern-lion-fuan` (50 nguồn, 63 bảng) | 0 | 108 |
| Nenjo | `nenjo-generator` (14 nguồn, 19 bảng) | 0 | 40 |
| Gordon | `gordon-power` (15 nguồn, 20 bảng) | 0 | 26 |
| Gloria (shangyan-jiangsu) | `shangyan-jiangsu` (18 nguồn, 16 bảng) | 0 | 12 |
| Shengfeng (晟丰) | `shengfeng-fuan` (11 nguồn, 10 bảng) | 0 | 86 |
| Werna | `werna-alternator` (4 nguồn, 3 bảng) | 0 | 0 |
| HGI | `hgi-generators` (8 nguồn, 7 bảng) | 0 | 0 |
| C.GEN | `cgen-alternator` (8 nguồn, 6 bảng) | 0 | 0 |
| Firstall | `firstall-power` (3 nguồn, 3 bảng) | 0 | 0 |
| Siemens | không có hồ sơ riêng (chỉ 5 dòng bảng của 4 NCC có chữ "Siemens") | 0 | 0 |
| WEG | không có hồ sơ riêng (2 dòng bảng của 1 NCC có chữ "WEG") | 0 | 0 |
| FG Wilson | không có hồ sơ hãng | 0 | 16 model NCC ghi |

Còn 15 hồ sơ hãng đầu phát Trung Quốc ít nguồn (1–12 nguồn; boss-fujian, cssc-electric, dingol, falande-jiangsu, gooall-fujian, huawei-fuan, jiali-liuzhou, lingyu-jiangsu, nianfeng-fujian, sanhe-fujian, weike-wuxi, zhenjiang-cssc-hyundai, hutai-fujian, liangdi-fujian, lanzhou-electric): đều không có tờ. Engga / Faraday / Kwise / Evotec: bảng của họ hiện là bảng kích từ / bảng khác, chưa cho model nào vào catalog đầu phát (cột cuối = 0).

## 3. Model không có tờ: ưu tiên (top 60 theo số lần NCC ghi)

Danh sách ĐỦ 2282 model ở `dau-phat-chua-co-datasheet.tsv` (cột: hang, khoa, cach_viet_pho_bien, so_ncc, so_lan_ghi, ho_ma_goi_y, ten_co_trong_to_hang, ghi_chu_rac, ncc). Cột `ten_co_trong_to_hang` ghi tờ của hãng (nguồn đã lưu) có nhắc chuỗi khoá nhưng chưa nối được (xem mục 5).

| # | Hãng | Khoá | Cách viết gốc phổ biến nhất | NCC | Lần ghi | Tờ hãng có nhắc tên? |
|---|---|---|---|---|---|---|
| 1 | Stamford | S1L2J1 | S1L2-J1 | 9 | 40 | stamford-avk-china |
| 2 | Stamford | HCI444FS | HCI444FS | 11 | 32 | shengfeng-fuan |
| 3 | chưa rõ hãng | UC224E | UC224E | 1 | 26 | stamford-avk-china |
| 4 | Stamford | UCI274ES | UCI274ES | 7 | 25 | stamford-avk-china |
| 5 | chưa rõ hãng | UC274C | UC274C | 1 | 25 | stamford-avk-china |
| 6 | Stamford | S5L1DD41 | S5L1D-D41 | 4 | 24 |  |
| 7 | chưa rõ hãng | BC184G | BC184G | 1 | 24 |  |
| 8 | chưa rõ hãng | LTP274S200 | LTP274S-200 | 1 | 21 |  |
| 9 | Stamford | UCI274H1 | UCI 274H1 | 4 | 20 |  |
| 10 | chưa rõ hãng | SYA224D | SY-A 224D | 1 | 20 |  |
| 11 | chưa rõ hãng | SYA184G | SY-A 184G | 1 | 19 |  |
| 12 | chưa rõ hãng | BC184H | BC184H | 1 | 18 |  |
| 13 | chưa rõ hãng | LTP184S32 | LTP184S-32 | 1 | 18 |  |
| 14 | chưa rõ hãng | UC224D | UC224D | 1 | 18 | stamford-avk-china |
| 15 | Stamford | UCDI274K1 | UCDI274K1 | 4 | 17 |  |
| 16 | chưa rõ hãng | HC434F | HC434F | 2 | 17 |  |
| 17 | chưa rõ hãng | BC184ES | BC184ES | 1 | 17 |  |
| 18 | chưa rõ hãng | LTP274S80 | LTP274S-80 | 1 | 17 |  |
| 19 | chưa rõ hãng | LTP184S25 | LTP184S-25 | 1 | 16 |  |
| 20 | chưa rõ hãng | SYA184E | SY-A 184E | 1 | 16 |  |
| 21 | Stamford | LVI634G | LVI634G | 6 | 15 |  |
| 22 | chưa rõ hãng | 184ES | 184ES | 2 | 15 | agestar+firstall-power |
| 23 | chưa rõ hãng | UC274H | UC274H | 2 | 15 | stamford-avk-china |
| 24 | chưa rõ hãng | BC184E | BC184E | 1 | 15 |  |
| 25 | chưa rõ hãng | LTP184S30 | LTP184S-30 | 1 | 15 |  |
| 26 | chưa rõ hãng | LTP314S300 | LTP314S-300 | 1 | 15 |  |
| 27 | Stamford | UCI224G1 | UCI224G1 | 4 | 14 | stamford-avk-china |
| 28 | chưa rõ hãng | LTP274S100 | LTP274S-100 | 1 | 14 |  |
| 29 | chưa rõ hãng | LTP274S160 | LTP274S-160 | 1 | 14 |  |
| 30 | Stamford | SYA274C | SY-A 274C | 1 | 14 |  |
| 31 | Leroy-Somer | LSA532M9 | LSA 53.2M9 | 5 | 13 | leroy-somer-fuzhou |
| 32 | Stamford | UCI274C1 | UCI 274C1 | 4 | 13 | stamford-avk-china |
| 33 | Leroy-Somer | LSA472VS2 | LSA47.2VS2 | 3 | 13 |  |
| 34 | chưa rõ hãng | BW314F | BW-314F | 1 | 13 |  |
| 35 | chưa rõ hãng | LTP184S20 | LTP184S-20 | 1 | 13 |  |
| 36 | Stamford | SYA274G | SY-A 274G | 1 | 13 |  |
| 37 | Stamford | UCI274E1 | UCI274E1 | 4 | 12 | stamford-avk-china |
| 38 | Stamford | UCI274F1 | UCI 274F1 | 4 | 12 | stamford-avk-china |
| 39 | chưa rõ hãng | JET224E | JET224E | 1 | 12 |  |
| 40 | chưa rõ hãng | JET224G | JET224G | 1 | 12 |  |
| 41 | chưa rõ hãng | JET274C | JET274C | 1 | 12 |  |
| 42 | chưa rõ hãng | LTP184S22 | LTP184S-22 | 1 | 12 |  |
| 43 | chưa rõ hãng | LTP314S320 | LTP314S-320 | 1 | 12 |  |
| 44 | chưa rõ hãng | LTP354S400 | LTP354S-400 | 1 | 12 |  |
| 45 | chưa rõ hãng | SYA184H | SY-A 184H | 1 | 12 |  |
| 46 | chưa rõ hãng | SYA224E | SY-A 224E | 1 | 12 |  |
| 47 | Stamford | SYA274F | SY-A 274F | 1 | 12 |  |
| 48 | chưa rõ hãng | UC274F | UC274F | 1 | 12 | stamford-avk-china |
| 49 | Stamford | S0L2F1 | S0L2-F1 | 5 | 11 | stamford-avk-china |
| 50 | Stamford | HCI544D1 | HCI544D1 | 4 | 11 |  |
| 51 | Stamford | HCI544E1 | HCI 544E1 | 3 | 11 |  |
| 52 | chưa rõ hãng | LSA462L6 | LSA46.2L6 | 2 | 11 |  |
| 53 | chưa rõ hãng | BW274C | BW-274C | 1 | 11 |  |
| 54 | chưa rõ hãng | JET274J | JET274J | 1 | 11 |  |
| 55 | chưa rõ hãng | JET444E | JET444E | 1 | 11 |  |
| 56 | chưa rõ hãng | JET634D | JET634D | 1 | 11 |  |
| 57 | chưa rõ hãng | LTP274S180 | LTP274S-180 | 1 | 11 |  |
| 58 | chưa rõ hãng | LTP314S250 | LTP314S-250 | 1 | 11 |  |
| 59 | chưa rõ hãng | LTP314S280 | LTP314S-280 | 1 | 11 |  |
| 60 | chưa rõ hãng | LTP404S800 | LTP404S-800 | 1 | 11 |  |

Không có tờ, sau khi tách khoá nghi rác: 2191 model sạch + 91 khoá nghi rác (mục 4). Trong 2191 model sạch, 164 có chuỗi tên nằm trong tờ hãng nhưng chưa nối được.

## 4. Khoá trông như rác / không phải model (không tự loại, 91 khoá)

Dấu hiệu (một khoá có thể dính nhiều): "chỉ số (+1 chữ), thiếu tiền tố" 41; "quá ngắn" 16; "không có chữ số" 0; "chứa từ không phải mã" 1; "trùng khoá với một mã động cơ" 33; "trùng model tổ máy" 0.
Cần Khoa duyệt trước khi tìm internet: khoá thiếu tiền tố ("274C", "184E") thường là cột đầu phát bị cắt hãng ("UCI274C" / "WT-274C"); khoá trùng mã động cơ ("P126TI", "P086TI1") là mã Doosan bị đọc nhầm sang đầu phát.

| Khoá | Cách viết gốc | NCC | Lần ghi | Lý do nghi |
|---|---|---|---|---|
| 224E | 224E | 3 | 27 | chỉ số (+1 chữ), thiếu tiền tố |
| 274C | 274C | 4 | 26 | chỉ số (+1 chữ), thiếu tiền tố |
| 274K | 274K | 3 | 20 | chỉ số (+1 chữ), thiếu tiền tố |
| 184J | 184J | 1 | 19 | chỉ số (+1 chữ), thiếu tiền tố |
| 224D | 224D | 2 | 18 | chỉ số (+1 chữ), thiếu tiền tố |
| 164D | 164D | 3 | 17 | chỉ số (+1 chữ), thiếu tiền tố |
| 184G | 184G | 2 | 17 | chỉ số (+1 chữ), thiếu tiền tố |
| 224F | 224F | 4 | 16 | chỉ số (+1 chữ), thiếu tiền tố |
| 184E | 184E | 2 | 15 | chỉ số (+1 chữ), thiếu tiền tố |
| 274G | 274G | 2 | 15 | chỉ số (+1 chữ), thiếu tiền tố |
| 274E | 274E | 2 | 12 | chỉ số (+1 chữ), thiếu tiền tố |
| 274F | 274F | 2 | 12 | chỉ số (+1 chữ), thiếu tiền tố |
| JET274F | JET274F | 1 | 11 | trùng khoá với một mã động cơ |
| JET444FS | JET444FS | 1 | 11 | trùng khoá với một mã động cơ |
| P126TI | P126TI | 4 | 10 | trùng khoá với một mã động cơ |
| 4ES | 4ES | 1 | 10 | quá ngắn |
| JET274K | JET274K | 1 | 10 | trùng khoá với một mã động cơ |
| 164C | 164C | 3 | 9 | chỉ số (+1 chữ), thiếu tiền tố |
| 224G | 224G | 3 | 9 | chỉ số (+1 chữ), thiếu tiền tố |
| WR544C | WR544C | 1 | 9 | trùng khoá với một mã động cơ |
| 164B | 164B | 2 | 8 | chỉ số (+1 chữ), thiếu tiền tố |
| JET444F | JET444F | 1 | 8 | trùng khoá với một mã động cơ |
| JET274H | JET274H | 1 | 7 | trùng khoá với một mã động cơ |
| 274D | 274D | 2 | 6 | chỉ số (+1 chữ), thiếu tiền tố |
| 5FS | 5FS | 1 | 6 | quá ngắn |
| JET444D | JET444D | 1 | 6 | trùng khoá với một mã động cơ |
| P086TI | P086TI | 3 | 5 | trùng khoá với một mã động cơ |
| P086TI1 | P086TI-1 | 3 | 5 | trùng khoá với một mã động cơ |
| 315C | 315C | 1 | 5 | chỉ số (+1 chữ), thiếu tiền tố |
| P126TIII | P126T I-II | 2 | 4 | trùng khoá với một mã động cơ |
| P158LE | P158LE | 2 | 4 | trùng khoá với một mã động cơ |
| MA2114F | MA2114F | 1 | 4 | trùng khoá với một mã động cơ |
| WR274EL | WR274EL | 1 | 4 | trùng khoá với một mã động cơ |
| 734F | 734F | 2 | 3 | chỉ số (+1 chữ), thiếu tiền tố |
| 224C | 224C | 1 | 3 | chỉ số (+1 chữ), thiếu tiền tố |
| 5ES | 5ES | 1 | 3 | quá ngắn |
| 444F | 444F | 2 | 2 | chỉ số (+1 chữ), thiếu tiền tố |
| 544F | 544F | 2 | 2 | chỉ số (+1 chữ), thiếu tiền tố |
| 634G | 634G | 2 | 2 | chỉ số (+1 chữ), thiếu tiền tố |
| 734C | 734C | 2 | 2 | chỉ số (+1 chữ), thiếu tiền tố |
| MXH6304 | MX-H-630-4 | 2 | 2 | trùng khoá với một mã động cơ |
| 162G | 162G | 1 | 2 | chỉ số (+1 chữ), thiếu tiền tố |
| 184F | 184F | 1 | 2 | chỉ số (+1 chữ), thiếu tiền tố |
| 544C | 544C | 1 | 2 | chỉ số (+1 chữ), thiếu tiền tố |
| 634E | 634E | 1 | 2 | chỉ số (+1 chữ), thiếu tiền tố |
| 634F | 634F | 1 | 2 | chỉ số (+1 chữ), thiếu tiền tố |
| 734G | 734G | 1 | 2 | chỉ số (+1 chữ), thiếu tiền tố |
| K274I | K274I | 1 | 2 | trùng khoá với một mã động cơ |
| MA4114B | MA4114B | 1 | 2 | trùng khoá với một mã động cơ |
| MA4114D | MA4114D | 1 | 2 | trùng khoá với một mã động cơ |
| 182J | 182J | 1 | 1 | chỉ số (+1 chữ), thiếu tiền tố |
| 182K | 182K | 1 | 1 | chỉ số (+1 chữ), thiếu tiền tố |
| 274J | 274J | 1 | 1 | chỉ số (+1 chữ), thiếu tiền tố |
| 314D | 314D | 1 | 1 | chỉ số (+1 chữ), thiếu tiền tố |
| 314F | 314F | 1 | 1 | chỉ số (+1 chữ), thiếu tiền tố |
| 315D | 315D | 1 | 1 | chỉ số (+1 chữ), thiếu tiền tố |
| 4FS | 4FS | 1 | 1 | quá ngắn |
| 634B | 634B | 1 | 1 | chỉ số (+1 chữ), thiếu tiền tố |
| 634C | 634C | 1 | 1 | chỉ số (+1 chữ), thiếu tiền tố |
| 634D | 634D | 1 | 1 | chỉ số (+1 chữ), thiếu tiền tố |
| 734B | 734B | 1 | 1 | chỉ số (+1 chữ), thiếu tiền tố |
| 734D | 734D | 1 | 1 | chỉ số (+1 chữ), thiếu tiền tố |
| 734E | 734E | 1 | 1 | chỉ số (+1 chữ), thiếu tiền tố |
| DC24V | DC24V | 1 | 1 | trùng khoá với một mã động cơ |
| MA5114G | MA5114G | 1 | 1 | trùng khoá với một mã động cơ |
| MXH8304 | MX-H-830-4 | 1 | 1 | trùng khoá với một mã động cơ |
| S1L2Y1ALTERNATOR | S1L2-Y1Alternator | 1 | 1 | chứa từ không phải mã |
| S4G | S4G | 1 | 1 | quá ngắn |
| S5E | S5E | 1 | 1 | quá ngắn |
| S6E | S6E | 1 | 1 | quá ngắn |
| S6F | S6F | 1 | 1 | quá ngắn |
| S6G | S6G | 1 | 1 | quá ngắn |
| SA22470 | SA224-70 | 1 | 1 | trùng khoá với một mã động cơ |
| SA274180 | SA274-180 | 1 | 1 | trùng khoá với một mã động cơ |
| SA314360 | SA314-360 | 1 | 1 | trùng khoá với một mã động cơ |
| SA404874 | SA404-874 | 1 | 1 | trùng khoá với một mã động cơ |
| ST2 | ST-2 | 1 | 1 | quá ngắn |
| ST2 | ST-2 | 1 | 1 | quá ngắn |
| ST3 | ST-3 | 1 | 1 | quá ngắn |
| ST3 | ST-3 | 1 | 1 | quá ngắn |
| ST5 | ST-5 | 1 | 1 | quá ngắn |
| ST5 | ST-5 | 1 | 1 | quá ngắn |
| ST5 | ST-5 | 1 | 1 | quá ngắn |
| WHI274F | WHI274F | 1 | 1 | trùng khoá với một mã động cơ |
| WHI274G | WHI274G | 1 | 1 | trùng khoá với một mã động cơ |
| WHI274H | WHI274H | 1 | 1 | trùng khoá với một mã động cơ |
| WHI274K | WHI274K | 1 | 1 | trùng khoá với một mã động cơ |
| WHI4D | WHI4D | 1 | 1 | trùng khoá với một mã động cơ |
| WHI4F | WHI4F | 1 | 1 | trùng khoá với một mã động cơ |
| WHI4G | WHI4G | 1 | 1 | trùng khoá với một mã động cơ |
| WHI6D | WHI6D | 1 | 1 | trùng khoá với một mã động cơ |

## 5. Định nghĩa "có datasheet" và hạn chế của cách đếm

**Cách nối (dùng đúng hàm của code, không viết lại):** `CAT.build(suppliers).alternators` cho khoá model; `sourceRatings` + `ratingsFor` (`suppliers/config-bot.mjs`) cho tờ có bảng định mức; `modelFacts` cho thông số đọc từ tờ. Khoá chuẩn hoá bằng `CAT.keyOf` (bỏ dấu cách, `-`, `_`, `.`), cộng đúng 4 cặp tên Stamford S4L1D và 5 cặp Mecc Alte ECO38 mà `ratingsFor` đã tường minh.

- **A. Có tờ + có bảng định mức**: `ratingsFor(RT.alt, model)` có ít nhất một dòng (kVA / điện áp / tần số / cấp nhiệt đọc từ tờ). Nguồn tờ: stamford-avk-china, leroy-somer-fuzhou, mecc-alte, cộng bản chép tờ ở gfe-power và wintpower (18 model A chỉ có tờ chép của NCC, không có tờ hãng).
- **B. Có tờ nhưng chưa ra bảng định mức**: không có A, nhưng `ratingsFor(RT.attr, model)` có thuộc tính tờ (cách điện, cực, THD…) HOẶC `modelFacts` có thông số từ tờ của NCC-hãng đầu phát / tờ nguồn 1001–1999.
- **C. Không có tờ**: không có A, không có B.
- Thông số lấy từ dòng bảng của chính NCC tổ máy (nguồn 2001+) KHÔNG tính là tờ hãng.

**Phạm vi:** 3045 khoá đầu phát trong catalog; bỏ 338 khoá chỉ nằm trong bảng của chính hãng (không NCC tổ máy nào ghi) → còn 2707 khoá. "Số NCC" / "số lần ghi" chỉ tính NCC không phải hãng đầu phát; "lần ghi" = số dòng bảng nhắc khoá (một NCC có thể ghi nhiều dòng cho một model).

**Hạn chế:**
1. Chỉ nối khi tên khớp đúng sau chuẩn hoá. Lệch như "LVSI804R" ↔ tờ "LV 804 R" (xem `ratings-pi7-ls.md`), hoặc "UC224E" ↔ tờ có chữ "UC224E" trong bảng không đọc được thành dòng định mức: tính vào C. Cột `ten_co_trong_to_hang` (dò chuỗi khoá, từ 5 ký tự, trong toàn bộ nguồn đã lưu + bảng của hồ sơ hãng đầu phát) báo 169 model C mà tờ hãng có nhắc; đây là dò chuỗi con nên có thể trùng ngẫu nhiên, chưa xác minh từng cái.
2. Hãng chỉ là hãng repo đã ghi (`make`: cột / ô / tên trang NCC). 2088 model chưa rõ hãng; cột `ho_ma_goi_y` trong tsv chỉ là tiền tố mã (3 họ trong catalog), không dùng đếm. Hãng Trung Quốc khác (Engga, Faraday, Kwise, Evotec…) không xuất hiện thành hãng của khoá nào vì repo chưa ghi hãng đó cho khoá đầu phát nào.
3. Khoá riêng NCC (khoá catalog dạng `NCC|mã`, ví dụ STC-xx; 138 khoá, 138 trong nhóm không tờ, cột `khoa_rieng_ncc`) đếm riêng từng NCC; không coi là rác.
4. Khoá rác lẫn trong C (mục 4) nên số C trên bảng tóm tắt đã gồm chúng; trừ đi để ra số model sạch.
5. Không kiểm tra tờ có đúng model hay không ngoài việc `ratingsFor` đọc được; không đo số model "tờ dải" (một tờ cho nhiều model) riêng.
6. Số liệu theo `main` lúc chạy, tờ nguồn `suppliers/sources/` đang có trong git (tờ chỉ lưu ngoài git, như DSE, không tính).
