<!-- spec-diff -->
## Kiểm chéo danh mục (spec-diff): git:671797e4 ↔ .

- Bản ghi: 59.786 → 60.096; **2883** đổi, 64 mất, 374 thêm, ở 130 bảng của 14 NCC
- Đảo vai động cơ ↔ đầu phát (mã mà ≥ 3 NCC khác đọc ở vai kia): 0 → **0** ✅
- Tự kiểm số với công suất của dòng: 692 giá trị đổi / thêm không tự xác nhận được (soát tay)
- Chưa đọc được (`node suppliers/unread-tables.mjs`, để thiếu thay vì đoán): bảng không cho bản ghi nào: 3.111 → 3.112; dòng điện / điện áp theo vị trí không khớp công suất: 230 → 230; dòng là cặp nhãn | giá trị: 164 → 164; số vô lý so với công suất: 139 → 139; dòng tổng quan dòng máy: một dải công suất, không là một tổ máy: 90 → 90; số bằng đúng công suất của dòng, không là khối lượng / độ ồn: 77 → 77; tổ máy nhiều động cơ: 6 → 40; mã đầu phát trùng model tổ máy: 37 → 37; cặp a/b dưới nhãn không ghi mức / đơn vị: 34 → 34; một ô ghi hai mã: 25 → 25; điện áp trùng công suất của dòng: 6 → 6; dòng điện tổ máy không khớp công suất: 5 → 5; ngoại lệ theo dòng: 5 → 5; dòng máy lẫn với dòng tiêu đề: 0 → 5; trang có hai động cơ: số liệu kích cỡ động cơ không rõ của động cơ nào: 2 → 2; số có dấu phẩy nghìn / thập phân không rõ: 2 → 2; ô dòng điện không đọc được thành số: 1 → 1
- Thay đổi là chủ ý thì không chặn; vẫn phải soát MỌI dạng và đo top 30 ứng viên bằng tay (bộ nhớ kiem-cheo-toan-bo). Bản đầy đủ: artifact `spec-diff` của lượt chạy.

### Theo NCC

| NCC | dòng đổi | đổi | mất | thêm |
|---|--:|--:|--:|--:|
| fdk-energy | 1303 | 1101 | 18 | 184 |
| pengpai-yangzhou | 426 | 426 | 0 | 0 |
| bdadl-shanghai | 383 | 383 | 0 | 0 |
| fukangsi-yangzhou | 321 | 321 | 0 | 0 |
| xingguang-jiangsu | 287 | 287 | 0 | 0 |
| honny-dongguan | 168 | 168 | 0 | 0 |
| baifa-power | 150 | 58 | 46 | 46 |
| zhengdian-zhengzhou | 74 | 74 | 0 | 0 |
| penlucky | 68 | 0 | 0 | 68 |
| yunding-jiangsu | 52 | 52 | 0 | 0 |
| elitech-power | 50 | 0 | 0 | 50 |
| simpson-power | 21 | 13 | 0 | 8 |
| agg-fuzhou | 10 | 0 | 0 | 10 |
| rcg-power | 8 | 0 | 0 | 8 |

### Dạng thay đổi (vài ví dụ mỗi dạng)

**weight thêm**: 1130 lượt, 3 NCC
```
bdadl-shanghai n104 b2 dòng 0 KTA50-G15: ∅ → 13000
    | BDA-C1500 | 1500/1875 | 重庆康明斯 | KTA50-G15 | 16 | 50 | 177 | ≤209 | 5700*2200*2700 | 13000
fukangsi-yangzhou n2001 b0 dòng 0 NT855-GA: ∅ → 2500
    | FKS-C200 | 200/250 | 重庆康明斯 | NT855-GA | 6 | 14 | 37 | ≤201 | 2900*980*1750 | 2500
pengpai-yangzhou n103 b2 dòng 0 KTA50-G15: ∅ → 13000
    | PPDL-C1500 | 1500/1875 | 重庆康明斯 | KTA50-G15 | 16 | 50 | 177 | ≤209 | 5700*2200*2700 | 13000
```
**genset**: 1101 lượt, 1 NCC
```
fdk-energy n101 b0 dòng 0 M4M045D: O38-H1 CONTACT → O38-H1
    | O38-H1 CONTACT | 38KVA/ 30KW | 35KVA/ 28KW | M4M045D | OMDL-30-4 | OMD4800 | Click Here
fdk-energy n101 b0 dòng 1 M4M075D: O63-H1 CONTACT → O63-H1
    | O63-H1 CONTACT | 63KVA/ 50KW | 56KVA/ 45KW | M4M075D | OMDL-50-4 | OMD4800 | Click Here
fdk-energy n101 b0 dòng 2 M6M132D: O94-H1 CONTACT → O94-H1
    | O94-H1 CONTACT | 94KVA/ 75KW | 88KVA/ 70KW | M6M132D | OMDL-75-4 | OMD4800 | Click Here
```
**fuel thêm**: 455 lượt, 2 NCC
```
honny-dongguan n101 b0 dòng 0 PTAA6L-EG490: ∅ → 109
    | HGM550E | 550 | 500 | 440 | 400 | 109 | 722 | PTAA6L-EG490 | 490 | 445 | L6 | 135 | 166 | 14 | 15.5:1 | GP500-4P | 3400 | 1300 | 1650 | 3400
xingguang-jiangsu n101 b0 dòng 0 NT855-GA: ∅ → ≤191
    | XG-220GF | 200/220 | NT855-GA | 231/254 | 6 | 39 | ≤191 | 国 II | 3000×1040×1655 | 2800
honny-dongguan n101 b0 dòng 0 GP500-4P: ∅ → 109
    | HGM550E | 550 | 500 | 440 | 400 | 109 | 722 | PTAA6L-EG490 | 490 | 445 | L6 | 135 | 166 | 14 | 15.5:1 | GP500-4P | 3400 | 1300 | 1650 | 3400
```
**THÊM bản ghi**: 374 lượt, 7 NCC
```
agg-fuzhou n115 b14 dòng 23 LYX15H-G350: engine LYX15H-G350
    | DC330G6-NG | 330/264 | LYX15H-G350 | AGG
baifa-power n101 b3 dòng 64 QSB3.9-G31: engine QSB3.9-G31
    | BF-C28Q-3 | 28 | 25 | CUMMINS (CHINA) | QSB3.9-G31 | ECM | S0L2-M1 | Stage IIIA / CHINA STAGE3 | CHINA
elitech-power n1001 b78 dòng 32 BFM3 G1: engine BFM3 G1
    | EPS18DZA-3 | Deutz | 18kVA | 20kVA | BFM3 G1 | 50Hz | 3-Phase | DOWNLOAD PDF | eps18dza-3-deutz-18kva-diesel-generator-specs
```
**cyl thêm**: 74 lượt, 1 NCC
```
zhengdian-zhengzhou n101 b0 dòng 0 4B3.9-G1: ∅ → 4
    | 20GF | 22 | 20 | 39 /36 | 4B3.9-G1 | 27 /24 | 4 | 102 | 120 | 3.9 | 16.5:1 | 11 | 229 | 850 | 17 00×750×1230
zhengdian-zhengzhou n101 b0 dòng 1 4B5.9-G2: ∅ → 4
    | 2 0GF | 22 | 20 | 39 /36 | 4B5.9-G2 | 27 /24 | 4 | 102 | 120 | 3.9 | 16.5:1 | 11 | 229 | 850 | 17 00×750×1230
zhengdian-zhengzhou n101 b0 dòng 2 4BT3.9-G1: ∅ → 4
    | 3 0GF | 33 | 30 | 5 9/54 | 4BT3.9-G1 | 40 /36 | 4 | 102 | 120 | 3.9 | 16.5:1 | 11 | 214 | 900 | 18 00×780×1230
```
**makes**: 72 lượt, 3 NCC
```
baifa-power n101 b3 dòng 0 QSK19-G17: Cummins → 
    | BF-C625-3 | 625 | 569 | QSK19-G17 | | CHINA STAGE3 | CHINA
fdk-energy n103 b2 dòng 262 16KTA76-G31: Cummins → 
    | SC3250-H1 CONTACT | 3250KVA/ 2600KW | 3000KVA/ 2400KW | 16KTA76-G31 | NIANFENG FD8B-4 | NIANFENG FD8B-4 | Click Here |
simpson-power n102 b1 dòng 1 16V4000G63: Mitsubishi → 
    | SP2000D-U | 2000/2500 | 16V4000G63 | 7330×2150×2836 | SP2000D-U.pdf
```
**MẤT bản ghi**: 64 lượt, 2 NCC
```
baifa-power n101 b0 dòng 30 2*TAD1355GE: engine 2*TAD1355GE
    | BF-V900TWIN-T3 | 900 | 820 | VOLVO PENTA | 2*TAD1355GE | EMS2 / ECU | 2*S4L1D-F41 | STAGE IIIA/ TIER 3 | SWEDEN
fdk-energy n109 b8 dòng 48 NTA855-G1: engine NTA855-G1
    | CC340-H2 CONTACT | 344KVA/ 275KW | 312KVA/ 250KW | NTA855-G1 | Cummins (CCEC CHINA) | Stamford S4L1D-D41 | Click Here
baifa-power n101 b0 dòng 30 2*S4L1D-F41: alternator 2*S4L1D-F41
    | BF-V900TWIN-T3 | 900 | 820 | VOLVO PENTA | 2*TAD1355GE | EMS2 / ECU | 2*S4L1D-F41 | STAGE IIIA/ TIER 3 | SWEDEN
```
**current thêm**: 52 lượt, 1 NCC
```
yunding-jiangsu n2001 b0 dòng 0 NT855-GA: ∅ → 360
    | YDK-200GF | 200 | 250 | 360 | NT855-GA | 6 | 140*152 | 14 | 38 | 191 | 3000*1050*1800 | 2550
yunding-jiangsu n2001 b0 dòng 1 NTA855-G1A: ∅ → 450
    | YDK-250GF | 250 | 312.5 | 450 | NTA855-G1A | 6 | 140*152 | 14 | 38 | 193 | 3100*1050*1800 | 2600
yunding-jiangsu n2001 b0 dòng 2 NTA855-G1B: ∅ → 504
    | YDK-280GF | 280 | 350 | 504 | NTA855-G1B | 6 | 140*152 | 14 | 38 | 209 | 3100*1050*1800 | 2700
```

### Không tự xác nhận được

| dạng | số |
|---|--:|
| fuel thêm: mới không kiểm được | 455 |
| weight thêm: mới KHÔNG xác nhận | 237 |

```
bdadl-shanghai n104 b2 dòng 13 weight: ∅ → 12000 | null
bdadl-shanghai n104 b2 dòng 14 weight: ∅ → 1440 | null
bdadl-shanghai n105 b3 dòng 9 weight: ∅ → 10110 | null
bdadl-shanghai n105 b3 dòng 10 weight: ∅ → 10000 | null
bdadl-shanghai n105 b3 dòng 11 weight: ∅ → 11000 | null
bdadl-shanghai n106 b4 dòng 10 weight: ∅ → 9100 | null
bdadl-shanghai n106 b4 dòng 11 weight: ∅ → 9600 | null
bdadl-shanghai n111 b9 dòng 10 weight: ∅ → 5750 | null
bdadl-shanghai n112 b10 dòng 6 weight: ∅ → 5100 | null
bdadl-shanghai n126 b24 dòng 0 weight: ∅ → 710 | null
bdadl-shanghai n126 b24 dòng 1 weight: ∅ → 710 | null
bdadl-shanghai n126 b24 dòng 2 weight: ∅ → 580 | null
… còn 680
```
