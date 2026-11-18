# Lệch cột 11: kiểm chéo THÊM / MẤT (theo yêu cầu điều phối 18/11/2026)

Bản code: nhánh `lech-cot-11` (PR #926) sau vòng phản biện. Gốc: origin/main 270b4eb4. Cùng dữ liệu `suppliers/cn`.
Công cụ: `kc.mjs` (trong thư mục scratch của phiên, in MỌI trường của MỌI bản ghi thêm / mất, cạnh dòng nguồn của bảng, kèm bản ghi cũ và mới của cùng dòng). Phần dưới tệp này là đầu ra nguyên văn (132 thêm, 79 mất theo khoá bản ghi "bảng|dòng|vai|model|mã tổ máy"; spec-diff đếm 96 / 43 vì khoá khác).

## Kết quả soát từng nhóm
| Nhóm | Bản ghi | Kết luận |
|---|---|---|
| Doosan P086TI / P126TI(-II) / P158LE / P180LE / P222LE(-S): agg-fuzhou n102 n111, green-power n108, jet-power n107, kaichen n5001 (2 bảng), rcg n113 (10 dòng), rise n120 (bảng 25, 26), sanq n105 n110, uleengen n5001 | 47 dòng nguồn (cả 19 dòng rise) | KHỚP. Mỗi mã đứng ở cột "Engine / MOTORE / 发动机型号 / Engine Model" của chính dòng nguồn; trước đó đọc thành đầu phát. Đầu phát thật (TAL-A…, LSA…, UCI…, S4L1D-…, HCI444E, 274G / 274K) nay đúng vai. Công suất của dòng không đổi. green-power n108: công suất không đọc được cả cũ lẫn mới (P=null), kích thước / tiêu hao không đọc (thiếu, không sai). |
| Khung đầu phát uleengen n132 n136 (164B, 164C, 164D, 184E, 184EF, 224E) | 8 dòng | KHỚP. Cột "交流发电机 / 模型" ghi mã khung; ô động cơ của các dòng này là chữ lỗi ("380码", "f6l912吨", "490天") nên không có bản ghi động cơ (cũ: bản ghi động cơ SAI mang mã khung). |
| uleengen n5001 trang 8: UD150GF "P086TI \| 274G", UD200GF "P126TI \| 274K" | 2 dòng | KHỚP (cũ đảo vai: động cơ 274G, đầu phát P086TI). |
| eastern-lion (5 bảng, 22 mất) | 22 | ĐÚNG Ý: dòng tổng quan "Power range \| models" của dòng máy, không là một tổ máy; công suất của các bản ghi cũ vốn là null. Mất cả mẫu "động cơ ↔ đầu phát" của dòng tổng quan (vd MTA11-G2A ↔ EL 314E): không đo được là cặp thật cho một tổ máy, nên bỏ. |
| yongcai n170 n171 n172 n173 (bảng nhãn nhiều động cơ) | 43 thêm, 4 đổi | KHỚP từng dòng, so với `suppliers/cn/yongcai-elecmama.json`: mỗi "Engine model : X" nay có bản ghi riêng, `engPower` lấy ĐÚNG dòng "Rated power ( KW/rpm )" ngay sau nó (C490BPG 40 kW / 2650 rpm; A495BPG "39 kW / 2500 rpm, 42 kW / 2650 rpm"; … Y4110ZLD 80/1500 85/1800; YD480Q 29/3000; QC4102D 33/1500 39.6/1800). Động cơ không có dòng công suất (4G33, YD480T) không có `engPower`. |
| yongcai n170 C490BPG "power R ·/70 → ∅" | 1 | Giá trị 70 kW cũ là dòng "Rated power output : 70kw" (dòng 37) trong chuỗi dòng công suất tổ máy chung ở giữa trang, không thuộc C490BPG (dòng 1: "Rated power ( KW/rpm ) : 40 kW / 2650 rpm"): bỏ đúng, thêm `engPower` 40 kW / 2650 rpm. |
| yongcai n172 QC380D "R 18.8 → ∅, speed 2350 → ∅" | 1 | "Rated output : 18.8 KW" và "Engine speed : 2350 rpm" (dòng 16, 17) đứng NGAY SAU "Engine model : QC385BT" (dòng 15), không thuộc QC380D (dòng 0). Nay gắn cho QC385BT (bản ghi mới: P rated 18.8 kW, speed 2350 rpm), QC380D chỉ còn 10/1500 12/1800. |
| rise-power n120 bảng 25 / 26: kích thước thêm cho 19 dòng | 19 | KHỚP: kích thước "Open Type" (cột đầu của "Dimension"), vd RDL160 2600×950×1520. Khối lượng không đọc ở bảng này (thiếu, không sai). |

## Ba chỗ mất giá trị đúng: đã sửa (vòng phản biện)
- cgm-italia n101 e63B: noise 69 giữ lại (số nằm ở cột cuối "dB(A) at 7 mt", bên phải ô động cơ, ngoài cột công suất). n1001 (số chỉ có trong ô công suất) vẫn bỏ.
- rise-power n120 RDL560-60: dims 3420×1390×1840 (cột "Open Type"), khối lượng 4200 giữ; trước: 4500×1900×1900 (cột "Sound Proof" đọc một lần, cho hai bản đọc không khớp nhau).
- sanq-power n110 SQD385: khối lượng 3120 ("Open type"), nhiên liệu 72. Cũ: 4495 (cột "Silent type"). Luật: hai lượt đi từ ô đã biết cùng chọn một ô thì lượt từ mép phải không thắng được.
  Hệ quả (đã soát): luật này còn thêm khối lượng cho 80 dòng sanq (n106 bảng 6, n109 bảng 14, n110 bảng 15, n111 bảng 16; 161 giá trị vì mỗi dòng có bản ghi động cơ và đầu phát); script kiểm từng dòng: số thêm LUÔN là ô đầu của cặp "mở < kín" liền nhau (80/80).

## Luật "phẩy nghìn" và `onePair` (mục 3)
- Số cuối cùng đọc qua `fnum` chỉ ở dòng công suất của bảng nhãn. Gắn móc đếm trên TOÀN BỘ `suppliers/cn`: chuỗi dạng d,ddd tới `fnum` 130 lần, TẤT CẢ ở mwm (không NCC nào khác). Trong 465 bảng nhãn có ô d,ddd (21 NCC: ade-power, himoinsa, hipower, winco, jiuan, koop, saudi-diesel, elitech, hanyang, DSE, man-engines, smartgen, teksan, shanhua, zc-power, mecc-alte, vpower-hk, xinhengxin, …) các ô khác không đi qua `fnum` nên cách đọc KHÔNG đổi, spec-diff xác nhận (mọi trường mọi bản ghi) không NCC nào khác đổi.
- mwm đổi: n1028 (3,333 → 3333; 3,77 → 3770), n1040 (1 → 1000, 1.125 → 1125, 1.2 → 1200, 1.56 → 1560): nguồn n1040 viết "from 1,000 to 1,560 kWel" và "| Electrical power | kW | 1,000 | 1,000 | 1,125 | 1,200 |": phẩy nghìn rõ ràng. n1008 (bảng tiếng Trung viết "U = 0,4 kV", phẩy thập phân): "1,000" không đọc, ghi note, không bản ghi nào đổi (power cũ cũng không có).
- `onePair` bỏ `x !== y`: móc trên toàn bộ cn thấy 15 dòng khác nhau có hai ô bằng nhau dưới tiêu đề công suất: yingtai n111 (mục đích), baifa, kachai-hangzhou (6 dòng), rise-power RCM140, yanan YN650V. Chỉ yingtai n111 đổi kết quả; bốn NCC kia KHÔNG có bản ghi nào đổi (spec-diff).

---
# Đầu ra nguyên văn của `kc.mjs`
# Kiểm chéo bản ghi THÊM / MẤT: 132 thêm, 79 mất (chỉ in dòng nguồn có thêm/mất; mỗi dòng nguồn kèm cả bản ghi cũ và mới của nó)

### agg-fuzhou n102 (bảng 1) — 中型：301-800 kVA-德塔
HEADER: ["| | 发电机型号 | ESP (kVA/kW) | PRP (kVA/kW) | 发动机型号 | 品牌"]
- dòng 42: `| H450D5 | 450/360 | 400/320 | P158LE | Hyundai`
    CŨ  MẤT alternator P158LE | genset=H450D5 | make= | P={"standby":{"kVA":450,"kW":360},"prime":{"kVA":400,"kW":320}} | 
    MỚI THÊM engine P158LE | genset=H450D5 | make= | P={"standby":{"kVA":450,"kW":360},"prime":{"kVA":400,"kW":320}} | 
- dòng 57: `| H500D6 | 500/400 | 450/360 | P158LE | Hyundai`
    CŨ  MẤT alternator P158LE | genset=H500D6 | make= | P={"standby":{"kVA":500,"kW":400},"prime":{"kVA":450,"kW":360}} | 
    MỚI THÊM engine P158LE | genset=H500D6 | make= | P={"standby":{"kVA":500,"kW":400},"prime":{"kVA":450,"kW":360}} | 

### agg-fuzhou n111 (bảng 10) — 现代-德塔
HEADER: ["| | 发电机型号 | ESP (kVA/kW) | PRP (kVA/kW) | 发动机型号"]
- dòng 14: `| H450D5 | 450/360 | 400/320 | P158LE`
    CŨ  MẤT alternator P158LE | genset=H450D5 | make= | P={"standby":{"kVA":450,"kW":360},"prime":{"kVA":400,"kW":320}} | 
    MỚI THÊM engine P158LE | genset=H450D5 | make= | P={"standby":{"kVA":450,"kW":360},"prime":{"kVA":400,"kW":320}} | 
- dòng 40: `| H500D6 | 500/400 | 450/360 | P158LE`
    CŨ  MẤT alternator P158LE | genset=H500D6 | make= | P={"standby":{"kVA":500,"kW":400},"prime":{"kVA":450,"kW":360}} | 
    MỚI THÊM engine P158LE | genset=H500D6 | make= | P={"standby":{"kVA":500,"kW":400},"prime":{"kVA":450,"kW":360}} | 

### eastern-lion-fuan n108 (bảng 8) — Engine By Cummins | EASTERNLION
HEADER: ["| | | Power range | models | Engine | Alternator | Controller |"]
- dòng 0: `| Engine By Cummins 2 | 200 – 1311 kW | 34 | MTA11-G2A | EL 314E | Smartgen 6120 | View details →`
    CŨ  MẤT engine MTA11-G2A | genset= | make= | P=null | controller=Smartgen 6120
    CŨ  MẤT alternator EL 314E | genset= | make= | P=null | controller=Smartgen 6120
- dòng 2: `| Engine By Kofo Series | 10 – 338 kW | 24 | K4100DS | EL 184G | RUIFEN6120 | View details →`
    CŨ  MẤT engine K4100DS | genset= | make= | P=null | 
- dòng 3: `| Engine By Longxin Series | 24 – 289 kW | 19 | R6105IZLD | EL 224E | RUIFEN6120 | View details →`
    CŨ  MẤT engine R6105IZLD | genset= | make= | P=null | 
- dòng 4: `| Engine By Lovol Series | 25 – 158 kW | 13 | 1003G | EL 274C | Smartgen 6120 | View details →`
    CŨ  MẤT engine 1003G | genset= | make= | P=null | controller=Smartgen 6120
    CŨ  MẤT alternator EL 274C | genset= | make= | P=null | controller=Smartgen 6120
- dòng 5: `| Engine By Perkins Series | 7.2 – 2000 kW | 54 | 403A-15G1 | EL 224G | Smartgen 6120 | View details →`
    CŨ  MẤT engine 403A-15G1 | genset= | make= | P=null | controller=Smartgen 6120
    CŨ  MẤT alternator EL 224G | genset= | make= | P=null | controller=Smartgen 6120
- dòng 6: `| Engine By Woling Series | 128 – 889 kW | 22 | D114系列WLD171 | EL 404D | Smartgen 6120 | View details →`
    CŨ  MẤT engine EL 404D | genset= | make= | P=null | 
- dòng 7: `| Engine By Wuxi Series | 48 – 1111 kW | 52 | WD129TAD23/1500 | EL 354C | Smartgen 6120 | View details →`
    CŨ  MẤT engine WD129TAD23/1500 | genset= | make= | P=null | controller=Smartgen 6120
    CŨ  MẤT alternator EL 354C | genset= | make= | P=null | controller=Smartgen 6120

### eastern-lion-fuan n109 (bảng 10) — Engine By Wuxi Series | EASTERNLION
HEADER: ["| | | Power range | models | Engine | Alternator | Controller |"]
- dòng 1: `| Engine By Cummins | 22 – 444 kW | 40 | 4BTA3.9-G2 | EL 274K | Smartgen 6120 | View details →`
    CŨ  MẤT engine 4BTA3.9-G2 | genset= | make= | P=null | controller=Smartgen 6120
    CŨ  MẤT alternator EL 274K | genset= | make= | P=null | controller=Smartgen 6120
- dòng 2: `| Engine By Huachai Series | 13 – 289 kW | 27 | 2105D | EL 224C | RUIFEN6120 | View details →`
    CŨ  MẤT engine 2105D | genset= | make= | P=null | 

### eastern-lion-fuan n113 (bảng 17) — 60HZ Engine By Cummins Series | EASTERNLION
HEADER: ["| | | Power range | models | Engine | Alternator | Controller |"]
- dòng 0: `| 60 HZ Engine By Cummins Series 2 | 200 – 1222 kW | 22 | NT855-GA | ELS 314E | Smartgen 6120 | View details →`
    CŨ  MẤT engine NT855-GA | genset= | make= | P=null | controller=Smartgen 6120
    CŨ  MẤT alternator ELS 314E | genset= | make= | P=null | controller=Smartgen 6120

### eastern-lion-fuan n117 (bảng 24) — 60HZ Engine By Yuxing Series | EASTERNLION
HEADER: ["| | | Power range | models | Engine | Alternator | Controller |"]
- dòng 1: `| 60HZ Engine By Cummins Series | 20 – 444 kW | 26 | 4BTA3.9-G2 | ELS 314G | Smartgen 6120 | View details →`
    CŨ  MẤT engine 4BTA3.9-G2 | genset= | make= | P=null | controller=Smartgen 6120
    CŨ  MẤT alternator ELS 314G | genset= | make= | P=null | controller=Smartgen 6120
- dòng 2: `| 60HZ Engine By Lovol Series | 27 – 178 kW | 13 | 1003G | ELS 274C | Smartgen 6120 | View details →`
    CŨ  MẤT engine 1003G | genset= | make= | P=null | controller=Smartgen 6120
    CŨ  MẤT alternator ELS 274C | genset= | make= | P=null | controller=Smartgen 6120
- dòng 3: `| 60HZ Engine By Yangdong Series | 10 – 59 kW | 15 | YD380D | ELS 164C | RUIFEN6120 | View details →`
    CŨ  MẤT engine YD380D | genset= | make= | P=null | 

### eastern-lion-fuan n129 (bảng 36) — Engine By Yunnei Series | EASTERNLION
HEADER: ["| | | Power range | models | Engine | Alternator | Controller |"]
- dòng 7: `| Engine By Yangdong Series | 8 – 56 kW | 15 | YD380D | EL 164C | RUIFEN6120 | View details →`
    CŨ  MẤT engine YD380D | genset= | make= | P=null | 

### green-power-generators n108 (bảng 9) — Gruppi elettrogeni Stazionari Hyundai - Green Power Generators
HEADER: ["| | MODELLO MODEL | TIPO TYPE | POTENZA POWER | MOTORE ENGINE | SERBATOIO TANK | DIMENSIONI DIMENSIONS | PESO WEIGHT | DOWNLOAD","| kVA - 50 Hz | MODELLO MODEL | REG | CIL. | CONSUMO AL 75% PRP CONSUMPTION AT 75% PRP | Lu | La | A | LEROY SOMER | LINZ | MECC ALTE | STAMFORD","| PRP | ESP | N. | L/h | L | mm | mm | mm | kg"]
- dòng 0: `| GP220 A/H | O | 200 | 210 | P086TI | E | 6 | 31.7 | 140 | 2850 | 1000 | 1400 | 1650 | | | |`
    CŨ  MẤT alternator P086TI | genset=GP220 A/H | make= | P=null | 
    MỚI THÊM engine P086TI | genset=GP220 A/H | make= | P=null | 
- dòng 8: `| GP330 A/H | O | 300 | 330 | P126TI II | E | 6 | 45.7 | 210 | 3000 | 1100 | 1650 | 1750 | | | |`
    CŨ  MẤT alternator P126TI II | genset=GP330 A/H | make= | P=null | 
    MỚI THÊM engine P126TI II | genset=GP330 A/H | make= | P=null | 
- dòng 14: `| GP440 A/H | O | 400 | 440 | P158LE | E | 8 | 65.1 | 290 | 3200 | 1300 | 1900 | 2340 | | | |`
    CŨ  MẤT alternator P158LE | genset=GP440 A/H | make= | P=null | 
    MỚI THÊM engine P158LE | genset=GP440 A/H | make= | P=null | 

### jet-power n107 (bảng 6) — 60Hz 73KVA to 1125KVA HYUNDAI Doosan Diesel Generator Set | Jet Power Generator
HEADER: ["| Model | 440V / 60Hz / 1800rpm | HYUNDAI Diesel Engine | Emission | Alternator","| Standby output | Prime Output | Model | No. of Cylinder | Displacement | Bore×Stroke | Fuel cons. | Leroy Somer","| KVA | KW | KVA | KW | (L) | (MM) | （ L/h ） | level"]
- dòng 10: `| HD-510 | 510 | 408 | 444 | 355 | P158LE | 8V | 14.6 | 128 x 142 | 102.5 | N/A | TAL-A473-A`
    CŨ  MẤT alternator P158LE | genset=HD-510 | make= | P={"standby":{"kVA":510,"kW":408},"prime":{"kVA":444,"kW":355}} | 
    MỚI THÊM engine P158LE | genset=HD-510 | make= | P={"standby":{"kVA":510,"kW":408},"prime":{"kVA":444,"kW":355}} | 
    MỚI THÊM alternator TAL-A473-A | genset=HD-510 | make= | P={"standby":{"kVA":510,"kW":408},"prime":{"kVA":444,"kW":355}} | 

### kaichen-jiangsu n5001 (bảng 13) — Catalog kaichen-jiangsu-catalog — trang 8 trái (50Hz)
HEADER: ["| Genset model | Prime kW | Prime kVA | Standby kW | Standby kVA | Engine model | Alternator"]
- dòng 5: `| KCD-190GF | 135 | 169 | 149 | 186 | P086TI-1 |`
    CŨ  MẤT alternator P086TI-1 | genset=KCD-190GF | make= | P={"prime":{"kW":135,"kVA":169},"standby":{"kW":149,"kVA":186}} | 
    MỚI THÊM engine P086TI-1 | genset=KCD-190GF | make= | P={"prime":{"kW":135,"kVA":169},"standby":{"kW":149,"kVA":186}} | 
- dòng 8: `| KCD-300GF | 220 | 275 | 242 | 303 | P126TI |`
    CŨ  MẤT alternator P126TI | genset=KCD-300GF | make= | P={"prime":{"kW":220,"kVA":275},"standby":{"kW":242,"kVA":303}} | 
    MỚI THÊM engine P126TI | genset=KCD-300GF | make= | P={"prime":{"kW":220,"kVA":275},"standby":{"kW":242,"kVA":303}} | 

### kaichen-jiangsu n5001 (bảng 14) — Catalog kaichen-jiangsu-catalog — trang 8 phải (60Hz)
HEADER: ["| Genset model | Prime kW | Prime kVA | Standby kW | Standby kVA | Engine model | Alternator"]
- dòng 10: `| KCD-500GF | 360 | 450 | 400 | 500 | P158LE |`
    CŨ  MẤT alternator P158LE | genset=KCD-500GF | make= | P={"prime":{"kW":360,"kVA":450},"standby":{"kW":400,"kVA":500}} | 
    MỚI THÊM engine P158LE | genset=KCD-500GF | make= | P={"prime":{"kW":360,"kVA":450},"standby":{"kW":400,"kVA":500}} | 

### rcg-power n113 (bảng 16) — R-H Series (Hyundai)-Jiangsu Ruichang Gold Generating Equipment Co. Ltd
HEADER: ["| | Model | Prime Power | Standby Power | Engine | Alternator | Download"]
- dòng 0: `| R-HD160D5-S | 160 kVA / 128 kW | 185 kVA / 148 kW | P086TI-1 | TAL-A44-K | PDF`
    CŨ  MẤT alternator P086TI-1 | genset=R-HD160D5-S | make= | P={"prime":{"kVA":160,"kW":128},"standby":{"kVA":185,"kW":148}} | 
    MỚI THÊM engine P086TI-1 | genset=R-HD160D5-S | make= | P={"prime":{"kVA":160,"kW":128},"standby":{"kVA":185,"kW":148}} | 
    MỚI THÊM alternator TAL-A44-K | genset=R-HD160D5-S | make= | P={"prime":{"kVA":160,"kW":128},"standby":{"kVA":185,"kW":148}} | 
- dòng 1: `| R-HD200D5-S | 200 kVA / 160 kW | 220 kVA / 176 kW | P086TI | TAL-A44-M | PDF`
    CŨ  MẤT alternator P086TI | genset=R-HD200D5-S | make= | P={"prime":{"kVA":200,"kW":160},"standby":{"kVA":220,"kW":176}} | 
    MỚI THÊM engine P086TI | genset=R-HD200D5-S | make= | P={"prime":{"kVA":200,"kW":160},"standby":{"kVA":220,"kW":176}} | 
    MỚI THÊM alternator TAL-A44-M | genset=R-HD200D5-S | make= | P={"prime":{"kVA":200,"kW":160},"standby":{"kVA":220,"kW":176}} | 
- dòng 3: `| R-HD250D5-S | 250 kVA / 200 kW | 275 kVA / 220 kW | P126TI | TAL-A46-D | PDF`
    CŨ  MẤT alternator P126TI | genset=R-HD250D5-S | make= | P={"prime":{"kVA":250,"kW":200},"standby":{"kVA":275,"kW":220}} | 
    MỚI THÊM engine P126TI | genset=R-HD250D5-S | make= | P={"prime":{"kVA":250,"kW":200},"standby":{"kVA":275,"kW":220}} | 
    MỚI THÊM alternator TAL-A46-D | genset=R-HD250D5-S | make= | P={"prime":{"kVA":250,"kW":200},"standby":{"kVA":275,"kW":220}} | 
- dòng 4: `| R-HD300D5-S | 300kVA / 240kW | 330kVA / 264kW | P126TI-II | TAL-A46-F | PDF`
    CŨ  MẤT alternator P126TI-II | genset=R-HD300D5-S | make= | P={"prime":{"kVA":300,"kW":240},"standby":{"kVA":330,"kW":264}} | 
    MỚI THÊM engine P126TI-II | genset=R-HD300D5-S | make= | P={"prime":{"kVA":300,"kW":240},"standby":{"kVA":330,"kW":264}} | 
    MỚI THÊM alternator TAL-A46-F | genset=R-HD300D5-S | make= | P={"prime":{"kVA":300,"kW":240},"standby":{"kVA":330,"kW":264}} | 
- dòng 6: `| R-HD400D5-S | 400 kVA / 320 kW | 440 kVA / 352 kW | P158LE | TAL-A473-A | PDF`
    CŨ  MẤT alternator P158LE | genset=R-HD400D5-S | make= | P={"prime":{"kVA":400,"kW":320},"standby":{"kVA":440,"kW":352}} | 
    MỚI THÊM engine P158LE | genset=R-HD400D5-S | make= | P={"prime":{"kVA":400,"kW":320},"standby":{"kVA":440,"kW":352}} | 
    MỚI THÊM alternator TAL-A473-A | genset=R-HD400D5-S | make= | P={"prime":{"kVA":400,"kW":320},"standby":{"kVA":440,"kW":352}} | 
- dòng 16: `| R-HD160D5-S | 160 kVA / 128 kW | 185 kVA / 148 kW | P086TI-1 | UCI274F | PDF`
    CŨ  MẤT alternator P086TI-1 | genset=R-HD160D5-S | make= | P={"prime":{"kVA":160,"kW":128},"standby":{"kVA":185,"kW":148}} | 
    MỚI THÊM engine P086TI-1 | genset=R-HD160D5-S | make= | P={"prime":{"kVA":160,"kW":128},"standby":{"kVA":185,"kW":148}} | 
    MỚI THÊM alternator UCI274F | genset=R-HD160D5-S | make= | P={"prime":{"kVA":160,"kW":128},"standby":{"kVA":185,"kW":148}} | 
- dòng 17: `| R-HD200D5-S | 200 kVA / 160 kW | 220 kVA / 176 kW | P086TI | UCI274H | PDF`
    CŨ  MẤT alternator P086TI | genset=R-HD200D5-S | make= | P={"prime":{"kVA":200,"kW":160},"standby":{"kVA":220,"kW":176}} | 
    MỚI THÊM engine P086TI | genset=R-HD200D5-S | make= | P={"prime":{"kVA":200,"kW":160},"standby":{"kVA":220,"kW":176}} | 
    MỚI THÊM alternator UCI274H | genset=R-HD200D5-S | make= | P={"prime":{"kVA":200,"kW":160},"standby":{"kVA":220,"kW":176}} | 
- dòng 19: `| R-HD250D5-S | 250 kVA / 200 kW | 275 kVA / 220 kW | P126TI | UCDI274K | PDF`
    CŨ  MẤT alternator P126TI | genset=R-HD250D5-S | make= | P={"prime":{"kVA":250,"kW":200},"standby":{"kVA":275,"kW":220}} | 
    MỚI THÊM engine P126TI | genset=R-HD250D5-S | make= | P={"prime":{"kVA":250,"kW":200},"standby":{"kVA":275,"kW":220}} | 
    MỚI THÊM alternator UCDI274K | genset=R-HD250D5-S | make= | P={"prime":{"kVA":250,"kW":200},"standby":{"kVA":275,"kW":220}} | 
- dòng 20: `| R-HD300D5-S | 300 kVA / 240 kW | 330 kVA / 264 kW | P126TI-II | S4L1D-D4 | PDF`
    CŨ  MẤT alternator P126TI-II | genset=R-HD300D5-S | make= | P={"prime":{"kVA":300,"kW":240},"standby":{"kVA":330,"kW":264}} | 
    MỚI THÊM engine P126TI-II | genset=R-HD300D5-S | make= | P={"prime":{"kVA":300,"kW":240},"standby":{"kVA":330,"kW":264}} | 
    MỚI THÊM alternator S4L1D-D4 | genset=R-HD300D5-S | make= | P={"prime":{"kVA":300,"kW":240},"standby":{"kVA":330,"kW":264}} | 
- dòng 23: `| R-HD400D5-S | 400 kVA / 320 kW | 440 kVA / 352 kW | P158LE | S4L1D-F4 | PDF`
    CŨ  MẤT alternator P158LE | genset=R-HD400D5-S | make= | P={"prime":{"kVA":400,"kW":320},"standby":{"kVA":440,"kW":352}} | 
    MỚI THÊM engine P158LE | genset=R-HD400D5-S | make= | P={"prime":{"kVA":400,"kW":320},"standby":{"kVA":440,"kW":352}} | 
    MỚI THÊM alternator S4L1D-F4 | genset=R-HD400D5-S | make= | P={"prime":{"kVA":400,"kW":320},"standby":{"kVA":440,"kW":352}} | 

### rise-power n120 (bảng 25) — DOOSAN DAEWOO Diesel Generator | Industrial Generator | RISE Power
HEADER: ["| Model | Power (kw/kVA) | Engine Model | Alternator Model | Dimension | Weight","| Prime | Standby | Open Type | Sound Proof | Open Type | Sound Proof"]
- dòng 3: `| RDL160 | 160/200 | 176/220 | P086TI | LSA46.2M5 | 2600×950×1520 | 3500×1120×1700 | 1650 | 3550`
    CŨ  MẤT alternator P086TI | genset=RDL160 | make= | P={"prime":{"kVA":200,"kW":160},"standby":{"kVA":220,"kW":176}} | 
    MỚI THÊM engine P086TI | genset=RDL160 | make= | P={"prime":{"kVA":200,"kW":160},"standby":{"kVA":220,"kW":176}} | dims=2600×950×1520
    MỚI THÊM alternator LSA46.2M5 | genset=RDL160 | make= | P={"prime":{"kVA":200,"kW":160},"standby":{"kVA":220,"kW":176}} | dims=2600×950×1520
- dòng 4: `| RDL220 | 220/275 | 242/303 | P126TI | LSA46.2L9 | 2900×1050×1550 | 3900×1300×1850 | 2200 | 4200`
    CŨ  MẤT alternator P126TI | genset=RDL220 | make= | P={"prime":{"kVA":275,"kW":220},"standby":{"kVA":303,"kW":242}} | 
    MỚI THÊM engine P126TI | genset=RDL220 | make= | P={"prime":{"kVA":275,"kW":220},"standby":{"kVA":303,"kW":242}} | dims=2900×1050×1550
    MỚI THÊM alternator LSA46.2L9 | genset=RDL220 | make= | P={"prime":{"kVA":275,"kW":220},"standby":{"kVA":303,"kW":242}} | dims=2900×1050×1550
- dòng 5: `| RDL240 | 240/300 | 264/330 | P126TI-II | LSA46.2VL12 | 3000×1050×1550 | 3900×1300×1850 | 2400 | 4250`
    CŨ  MẤT alternator P126TI-II | genset=RDL240 | make= | P={"prime":{"kVA":300,"kW":240},"standby":{"kVA":330,"kW":264}} | 
    MỚI THÊM engine P126TI-II | genset=RDL240 | make= | P={"prime":{"kVA":300,"kW":240},"standby":{"kVA":330,"kW":264}} | dims=3000×1050×1550
    MỚI THÊM alternator LSA46.2VL12 | genset=RDL240 | make= | P={"prime":{"kVA":300,"kW":240},"standby":{"kVA":330,"kW":264}} | dims=3000×1050×1550
- dòng 6: `| RDL300 | 300/375 | 330/413 | P158LE-1 | LSA47.2VS2 | 2800×1400×1850 | 3900×1600×2150 | 2800 | 4800`
    CŨ  MẤT alternator P158LE-1 | genset=RDL300 | make= | P={"prime":{"kVA":375,"kW":300},"standby":{"kVA":413,"kW":330}} | 
    MỚI THÊM engine P158LE-1 | genset=RDL300 | make= | P={"prime":{"kVA":375,"kW":300},"standby":{"kVA":413,"kW":330}} | dims=2800×1400×1850
    MỚI THÊM alternator LSA47.2VS2 | genset=RDL300 | make= | P={"prime":{"kVA":375,"kW":300},"standby":{"kVA":413,"kW":330}} | dims=2800×1400×1850
- dòng 7: `| RDL340 | 340/425 | 374/467 | P158LE | LSA47.2S5 | 2850×1400×1850 | 3900×1600×2150 | 2900 | 4800`
    CŨ  MẤT alternator P158LE | genset=RDL340 | make= | P={"prime":{"kVA":425,"kW":340},"standby":{"kVA":467,"kW":374}} | 
    MỚI THÊM engine P158LE | genset=RDL340 | make= | P={"prime":{"kVA":425,"kW":340},"standby":{"kVA":467,"kW":374}} | dims=2850×1400×1850
    MỚI THÊM alternator LSA47.2S5 | genset=RDL340 | make= | P={"prime":{"kVA":425,"kW":340},"standby":{"kVA":467,"kW":374}} | dims=2850×1400×1850
- dòng 8: `| RDL360 | 360/450 | 396/495 | P180LE | LSA47.2S5 | 3050×1400×1850 | 4100×1800×2250 | 3100 | 5000`
    CŨ  MẤT alternator P180LE | genset=RDL360 | make= | P={"prime":{"kVA":450,"kW":360},"standby":{"kVA":495,"kW":396}} | 
    MỚI THÊM engine P180LE | genset=RDL360 | make= | P={"prime":{"kVA":450,"kW":360},"standby":{"kVA":495,"kW":396}} | dims=3050×1400×1850
    MỚI THÊM alternator LSA47.2S5 | genset=RDL360 | make= | P={"prime":{"kVA":450,"kW":360},"standby":{"kVA":495,"kW":396}} | dims=3050×1400×1850
- dòng 9: `| RDL400 | 400/500 | 440/550 | P180LE | LSA47.2M7 | 3150×1400×1850 | 4200×1800×2250 | 3250 | 5200`
    CŨ  MẤT alternator P180LE | genset=RDL400 | make= | P={"prime":{"kVA":500,"kW":400},"standby":{"kVA":550,"kW":440}} | 
    MỚI THÊM engine P180LE | genset=RDL400 | make= | P={"prime":{"kVA":500,"kW":400},"standby":{"kVA":550,"kW":440}} | dims=3150×1400×1850
    MỚI THÊM alternator LSA47.2M7 | genset=RDL400 | make= | P={"prime":{"kVA":500,"kW":400},"standby":{"kVA":550,"kW":440}} | dims=3150×1400×1850
- dòng 10: `| RDL500 | 500/625 | 550/688 | P222LE | LSA49.1S4 | 3400×1400×2000 | 4800×1900×2250 | 4200 | 5800`
    CŨ  MẤT alternator P222LE | genset=RDL500 | make= | P={"prime":{"kVA":625,"kW":500},"standby":{"kVA":688,"kW":550}} | 
    MỚI THÊM engine P222LE | genset=RDL500 | make= | P={"prime":{"kVA":625,"kW":500},"standby":{"kVA":688,"kW":550}} | dims=3400×1400×2000
    MỚI THÊM alternator LSA49.1S4 | genset=RDL500 | make= | P={"prime":{"kVA":625,"kW":500},"standby":{"kVA":688,"kW":550}} | dims=3400×1400×2000
- dòng 11: `| RDL530 | 530/663 | 583/729 | P222LE-S | LSA49.1S4 | 3400×1400×2000 | 4800×1900×2250 | 4200 | 5800`
    CŨ  MẤT alternator P222LE-S | genset=RDL530 | make= | P={"prime":{"kVA":663,"kW":530},"standby":{"kVA":729,"kW":583}} | 
    MỚI THÊM engine P222LE-S | genset=RDL530 | make= | P={"prime":{"kVA":663,"kW":530},"standby":{"kVA":729,"kW":583}} | dims=3400×1400×2000
    MỚI THÊM alternator LSA49.1S4 | genset=RDL530 | make= | P={"prime":{"kVA":663,"kW":530},"standby":{"kVA":729,"kW":583}} | dims=3400×1400×2000
- dòng 12: `| RDL550 | NA | 550/688 | P222LE-II | LSA49.1M6 | 3400×1400×2000 | 4800×1900×2250 | 4200 | 5800`
    CŨ  MẤT alternator P222LE-II | genset=RDL550 | make= | P={"rated":{"kVA":688,"kW":550}} | 
    MỚI THÊM engine P222LE-II | genset=RDL550 | make= | P={"rated":{"kVA":688,"kW":550}} | dims=3400×1400×2000
    MỚI THÊM alternator LSA49.1M6 | genset=RDL550 | make= | P={"rated":{"kVA":688,"kW":550}} | dims=3400×1400×2000

### rise-power n120 (bảng 26) — DOOSAN DAEWOO Diesel Generator | Industrial Generator | RISE Power
HEADER: ["| Model | Power (kw/kVA) | Engine Model | Alternator Model | Dimension | Weight","| Prime | Standby | Open Type | Sound Proof | Open Type | Sound Proof"]
- dòng 2: `| RDL157-60 | 157/196 | 172/216 | P086TI-1 | LSA46.2M3 | 2600×950×1520 | 3500×1120×1700 | 1600 | 3500`
    CŨ  MẤT alternator P086TI-1 | genset=RDL157-60 | make= | P={"prime":{"kVA":196,"kW":157},"standby":{"kVA":216,"kW":172}} | 
    MỚI THÊM engine P086TI-1 | genset=RDL157-60 | make= | P={"prime":{"kVA":196,"kW":157},"standby":{"kVA":216,"kW":172}} | dims=2600×950×1520
    MỚI THÊM alternator LSA46.2M3 | genset=RDL157-60 | make= | P={"prime":{"kVA":196,"kW":157},"standby":{"kVA":216,"kW":172}} | dims=2600×950×1520
- dòng 3: `| RDL184-60 | 184/230 | 202/253 | P086TI | LSA46.2M5 | 2600×950×1520 | 3500×1120×1700 | 1650 | 3550`
    CŨ  MẤT alternator P086TI | genset=RDL184-60 | make= | P={"prime":{"kVA":230,"kW":184},"standby":{"kVA":253,"kW":202}} | 
    MỚI THÊM engine P086TI | genset=RDL184-60 | make= | P={"prime":{"kVA":230,"kW":184},"standby":{"kVA":253,"kW":202}} | dims=2600×950×1520
    MỚI THÊM alternator LSA46.2M5 | genset=RDL184-60 | make= | P={"prime":{"kVA":230,"kW":184},"standby":{"kVA":253,"kW":202}} | dims=2600×950×1520
- dòng 4: `| RDL250-60 | 250/313 | 275/344 | P126TI | LSA46.2L9 | 2900×1050×1550 | 3900×1300×1850 | 2200 | 4200`
    CŨ  MẤT alternator P126TI | genset=RDL250-60 | make= | P={"prime":{"kVA":313,"kW":250},"standby":{"kVA":344,"kW":275}} | 
    MỚI THÊM engine P126TI | genset=RDL250-60 | make= | P={"prime":{"kVA":313,"kW":250},"standby":{"kVA":344,"kW":275}} | dims=2900×1050×1550
    MỚI THÊM alternator LSA46.2L9 | genset=RDL250-60 | make= | P={"prime":{"kVA":313,"kW":250},"standby":{"kVA":344,"kW":275}} | dims=2900×1050×1550
- dòng 5: `| RDL276-60 | 276/345 | 304/380 | P126TI-II | LSA46.2VL12 | 3000×1050×1550 | 3900×1300×1850 | 2400 | 4250`
    CŨ  MẤT alternator P126TI-II | genset=RDL276-60 | make= | P={"prime":{"kVA":345,"kW":276},"standby":{"kVA":380,"kW":304}} | 
    MỚI THÊM engine P126TI-II | genset=RDL276-60 | make= | P={"prime":{"kVA":345,"kW":276},"standby":{"kVA":380,"kW":304}} | dims=3000×1050×1550
    MỚI THÊM alternator LSA46.2VL12 | genset=RDL276-60 | make= | P={"prime":{"kVA":345,"kW":276},"standby":{"kVA":380,"kW":304}} | dims=3000×1050×1550
- dòng 6: `| RDL323-60 | 323/412 | 363/453 | P158LE-1 | LSA47.2VS2 | 2800×1400×1850 | 3900×1600×2150 | 2800 | 4800`
    CŨ  MẤT alternator P158LE-1 | genset=RDL323-60 | make= | P={"prime":{"kVA":412,"kW":323},"standby":{"kVA":453,"kW":363}} | 
    MỚI THÊM engine P158LE-1 | genset=RDL323-60 | make= | P={"prime":{"kVA":412,"kW":323},"standby":{"kVA":453,"kW":363}} | dims=2800×1400×1850
    MỚI THÊM alternator LSA47.2VS2 | genset=RDL323-60 | make= | P={"prime":{"kVA":412,"kW":323},"standby":{"kVA":453,"kW":363}} | dims=2800×1400×1850
- dòng 7: `| RDL360-60 | 360/450 | 396/495 | P158LE | LSA47.2VS2 | 2850×1400×1850 | 3900×1600×2150 | 2900 | 4800`
    CŨ  MẤT alternator P158LE | genset=RDL360-60 | make= | P={"prime":{"kVA":450,"kW":360},"standby":{"kVA":495,"kW":396}} | 
    MỚI THÊM engine P158LE | genset=RDL360-60 | make= | P={"prime":{"kVA":450,"kW":360},"standby":{"kVA":495,"kW":396}} | dims=2850×1400×1850
    MỚI THÊM alternator LSA47.2VS2 | genset=RDL360-60 | make= | P={"prime":{"kVA":450,"kW":360},"standby":{"kVA":495,"kW":396}} | dims=2850×1400×1850
- dòng 8: `| RDL448-60 | 448/560 | 493/616 | P180LE | LSA47.2S5 | 3050×1400×1850 | 4100×1800×2250 | 3100 | 5000`
    CŨ  MẤT alternator P180LE | genset=RDL448-60 | make= | P={"prime":{"kVA":560,"kW":448},"standby":{"kVA":616,"kW":493}} | 
    MỚI THÊM engine P180LE | genset=RDL448-60 | make= | P={"prime":{"kVA":560,"kW":448},"standby":{"kVA":616,"kW":493}} | dims=3050×1400×1850
    MỚI THÊM alternator LSA47.2S5 | genset=RDL448-60 | make= | P={"prime":{"kVA":560,"kW":448},"standby":{"kVA":616,"kW":493}} | dims=3050×1400×1850
- dòng 9: `| RDL532-60 | 532/665 | 585/732 | P222LE | LSA49.1S4 | 3400×1400×2000 | 4800×1900×2250 | 4200 | 5800`
    CŨ  MẤT alternator P222LE | genset=RDL532-60 | make= | P={"prime":{"kVA":665,"kW":532},"standby":{"kVA":732,"kW":585}} | 
    MỚI THÊM engine P222LE | genset=RDL532-60 | make= | P={"prime":{"kVA":665,"kW":532},"standby":{"kVA":732,"kW":585}} | dims=3400×1400×2000
    MỚI THÊM alternator LSA49.1S4 | genset=RDL532-60 | make= | P={"prime":{"kVA":665,"kW":532},"standby":{"kVA":732,"kW":585}} | dims=3400×1400×2000
- dòng 10: `| RDL560-60 | 560/700 | 616/770 | P222LE-S | LSA49.1S4 | 3420×1390×1840 | 4500×1900×1900 | 4200 |`
    CŨ  MẤT alternator P222LE-S | genset=RDL560-60 | make= | P={"prime":{"kVA":700,"kW":560},"standby":{"kVA":770,"kW":616}} | weight=4200; dims=4500×1900×1900
    MỚI THÊM engine P222LE-S | genset=RDL560-60 | make= | P={"prime":{"kVA":700,"kW":560},"standby":{"kVA":770,"kW":616}} | dims=3420×1390×1840; weight=4200
    MỚI THÊM alternator LSA49.1S4 | genset=RDL560-60 | make= | P={"prime":{"kVA":700,"kW":560},"standby":{"kVA":770,"kW":616}} | dims=3420×1390×1840; weight=4200

### sanq-power n105 (bảng 5) — 韩国斗山柴油发电机组 -进口康明斯系列_帕金斯系列_斗山系列_菱重系列_合资康明斯系列-广州盛康动力设备有限公司
HEADER: ["| 机组型号 | 备用功率 | 常用功率 | 发动机型号 | 电机型号 | 耗油量 | 机组重量 (Kg) | 机组尺寸 (MM)","| kW/kVa | kW/kVa | 斗山","| 斯坦福 | L/H | 开放式 | 静音式 | 开放式 | 静音式"]
- dòng 6: `| SQD385 | 308/385 | 280/350 | P158LE-1 | HCI444E | 72 | 3120 | 4495 | 3050x1160x1645 | 4300x1483x2145`
    CŨ  MẤT alternator P158LE-1 | genset=SQD385 | make= | P={"standby":{"kVA":385,"kW":308},"prime":{"kVA":350,"kW":280}} | 
    MỚI THÊM engine P158LE-1 | genset=SQD385 | make= | P={"standby":{"kVA":385,"kW":308},"prime":{"kVA":350,"kW":280}} | 
    MỚI THÊM alternator HCI444E | genset=SQD385 | make= | P={"standby":{"kVA":385,"kW":308},"prime":{"kVA":350,"kW":280}} | 

### sanq-power n110 (bảng 15) — Powered by Doosan -Cummins genset|Perkins Genset|Imported Cummins|Diesel gensets -Guangzhou Sanq Power Equipment Co., Ltd.
HEADER: ["| Genset Model | Standby Power | Prime Power | Engine Model | Alternator Model | Fuel Consumption | Genset Weight (Kg) | Genset overall LxWxH (MM) | Click for Detail Data","| kW/kVa | kW/kVa | Doosan | Stamford | L/H | Open type | Silent type | Open Type | Silent type"]
- dòng 6: `| SQD385 | 308/385 | 280/350 | P158LE-1 | HCI444E | 72 | 3120 | 4495 | 3050x1160x1645 | 4300x1483x2145 |`
    CŨ  MẤT alternator P158LE-1 | genset=SQD385 | make= | P={"standby":{"kVA":385,"kW":308},"prime":{"kVA":350,"kW":280}} | dims=3050x1160x1645; weight=4495
    MỚI THÊM engine P158LE-1 | genset=SQD385 | make= | P={"standby":{"kVA":385,"kW":308},"prime":{"kVA":350,"kW":280}} | fuel=72; weight=3120; dims=3050x1160x1645
    MỚI THÊM alternator HCI444E | genset=SQD385 | make= | P={"standby":{"kVA":385,"kW":308},"prime":{"kVA":350,"kW":280}} | fuel=72; weight=3120; dims=3050x1160x1645

### uleengen n132 (bảng 54) — 道依茨水冷柴油发电机
HEADER: ["| 发电机组型号 | 50HZ | 柴油发动机 | 交流发电机 | 外形尺寸（mm） | 毛重 （kg）","| 功率（kW） | 功率（kVA） | 模型 | 额定功率 （kW） | 气缸数量 | 孔径x行程（mm） | 位移 L | 额定燃油消耗量 （L/h） | 模型"]
- dòng 6: `| UD60GF | 48 | 60 | f6l912吨 | 61 | 6 | 100*120 | 5.655 | 11.8 | 224E | 2250×800×1350 | 1200`
    CŨ  MẤT engine 224E | genset=UD60GF | make= | P={"rated":{"kW":48,"kVA":60}} | weight=1200; dims=2250×800×1350
    MỚI THÊM alternator 224E | genset=UD60GF | make= | P={"rated":{"kW":48,"kVA":60}} | dims=2250×800×1350; weight=1200

### uleengen n136 (bảng 61) — 10-60KVA超静音柴油发电机YTO阳东发电机组
HEADER: ["| 发电机组型号 | 50HZ | 柴油发动机 | 交流发电机 | 整体尺寸静音型（mm） | 毛重（kg）","| 功率（kW） | 功率（kVA） | 模型 | 额定功率（kW） | 气缸数量 | 孔径x行程（mm） | 排量（L） | 额定燃油消耗量（L/h） | 模型"]
- dòng 0: `| UY10GFS | 8 | 10 | 380码 | 10 | 3 | 80*90 | 1.357 | 1.9 | 164B | 1860x850x1200 | 700`
    CŨ  MẤT engine 164B | genset=UY10GFS | make= | P={"rated":{"kW":8,"kVA":10}} | weight=700; dims=1860x850x1200
    MỚI THÊM alternator 164B | genset=UY10GFS | make= | P={"rated":{"kW":8,"kVA":10}} | dims=1860x850x1200; weight=700
- dòng 1: `| UY12GFS | 10 | 12.5 | 码385d | 11 | 3 | 85*90 | 1.532 | 2.3 | 164C | 1860x850x1200 | 700`
    CŨ  MẤT engine 164C | genset=UY12GFS | make= | P={"rated":{"kW":10,"kVA":12.5}} | weight=700; dims=1860x850x1200
    MỚI THÊM alternator 164C | genset=UY12GFS | make= | P={"rated":{"kW":10,"kVA":12.5}} | dims=1860x850x1200; weight=700
- dòng 2: `| UY15GFS | 12 | 15 | 480码 | 14 | 4 | 80*90 | 1.809 | 2.8 | 164D | 1950x900x1300 | 720`
    CŨ  MẤT engine 164D | genset=UY15GFS | make= | P={"rated":{"kW":12,"kVA":15}} | weight=720; dims=1950x900x1300
    MỚI THÊM alternator 164D | genset=UY15GFS | make= | P={"rated":{"kW":12,"kVA":15}} | dims=1950x900x1300; weight=720
- dòng 4: `| UY25GFS | 20 | 25 | 490天 | 24 | 4 | 90*105 | 2.67 | 4.7 | 184EF | 2200x950x1200 | 800`
    CŨ  MẤT engine 184EF | genset=UY25GFS | make= | P={"rated":{"kW":20,"kVA":25}} | weight=800; dims=2200x950x1200
    MỚI THÊM alternator 184EF | genset=UY25GFS | make= | P={"rated":{"kW":20,"kVA":25}} | dims=2200x950x1200; weight=800

### uleengen n136 (bảng 62) — 10-60KVA超静音柴油发电机YTO阳东发电机组
HEADER: ["| 发电机组型号 | 60HZ | 柴油发动机 | 交流发电机 | 整体尺寸静音型（mm） | 毛重（kg）","| 功率（kW） | 功率（kVA） | 模型 | 额定功率（kW） | 气缸数量 | 孔径x行程（mm） | 排量（L） | 额定燃油消耗量（L/h） | 模型"]
- dòng 1: `| UY12GFS | 10 | 12.5 | 380码 | 12 | 3 | 80*90 | 1.357 | 1.9 | 164B | 1860x850x1200 | 700`
    CŨ  MẤT engine 164B | genset=UY12GFS | make= | P={"rated":{"kW":10,"kVA":12.5}} | weight=700; dims=1860x850x1200
    MỚI THÊM alternator 164B | genset=UY12GFS | make= | P={"rated":{"kW":10,"kVA":12.5}} | dims=1860x850x1200; weight=700
- dòng 2: `| UY15GFS | 12 | 15 | 480码 | 16 | 4 | 80*90 | 1.809 | 2.8 | 164C | 1950x900x1300 | 720`
    CŨ  MẤT engine 164C | genset=UY15GFS | make= | P={"rated":{"kW":12,"kVA":15}} | weight=720; dims=1950x900x1300
    MỚI THÊM alternator 164C | genset=UY15GFS | make= | P={"rated":{"kW":12,"kVA":15}} | dims=1950x900x1300; weight=720
- dòng 5: `| 30gfs | 24 | 30 | 490天 | 28 | 4 | 90*105 | 2.64 | 5.6 | 184E | 2200x950x1250 | 850`
    CŨ  MẤT engine 184E | genset=30gfs | make= | P={"rated":{"kW":24,"kVA":30}} | weight=850; dims=2200x950x1250
    MỚI THÊM alternator 184E | genset=30gfs | make= | P={"rated":{"kW":24,"kVA":30}} | dims=2200x950x1250; weight=850

### uleengen n5001 (bảng 69) — Catalog uleen-generator-catalog-2026 — trang 8 (50Hz)
HEADER: ["| Genset model | Prime kW | Prime kVA | Standby kW | Standby kVA | Engine model | Alternator"]
- dòng 1: `| UD150GF | 150 | 188 | 170 | 213 | P086TI | 274G`
    CŨ  MẤT engine 274G | genset=UD150GF | make= | P={"prime":{"kW":150,"kVA":188},"standby":{"kW":170,"kVA":213}} | 
    CŨ  MẤT alternator P086TI | genset=UD150GF | make= | P={"prime":{"kW":150,"kVA":188},"standby":{"kW":170,"kVA":213}} | 
    MỚI THÊM engine P086TI | genset=UD150GF | make= | P={"prime":{"kW":150,"kVA":188},"standby":{"kW":170,"kVA":213}} | 
    MỚI THÊM alternator 274G | genset=UD150GF | make= | P={"prime":{"kW":150,"kVA":188},"standby":{"kW":170,"kVA":213}} | 
- dòng 2: `| UD160GF | 160 | 200 | 176 | 220 | P086TI |`
    CŨ  MẤT alternator P086TI | genset=UD160GF | make= | P={"prime":{"kW":160,"kVA":200},"standby":{"kW":176,"kVA":220}} | 
    MỚI THÊM engine P086TI | genset=UD160GF | make= | P={"prime":{"kW":160,"kVA":200},"standby":{"kW":176,"kVA":220}} | 
- dòng 3: `| UD200GF | 200 | 250 | 220 | 275 | P126TI | 274K`
    CŨ  MẤT engine 274K | genset=UD200GF | make= | P={"prime":{"kW":200,"kVA":250},"standby":{"kW":220,"kVA":275}} | 
    CŨ  MẤT alternator P126TI | genset=UD200GF | make= | P={"prime":{"kW":200,"kVA":250},"standby":{"kW":220,"kVA":275}} | 
    MỚI THÊM engine P126TI | genset=UD200GF | make= | P={"prime":{"kW":200,"kVA":250},"standby":{"kW":220,"kVA":275}} | 
    MỚI THÊM alternator 274K | genset=UD200GF | make= | P={"prime":{"kW":200,"kVA":250},"standby":{"kW":220,"kVA":275}} | 
- dòng 4: `| UD250GF | 250 | 313 | 275 | 344 | P126TI-II |`
    CŨ  MẤT alternator P126TI-II | genset=UD250GF | make= | P={"prime":{"kW":250,"kVA":313},"standby":{"kW":275,"kVA":344}} | 
    MỚI THÊM engine P126TI-II | genset=UD250GF | make= | P={"prime":{"kW":250,"kVA":313},"standby":{"kW":275,"kVA":344}} | 
- dòng 5: `| UD300GF | 300 | 375 | 330 | 413 | P158LE-1 |`
    CŨ  MẤT alternator P158LE-1 | genset=UD300GF | make= | P={"prime":{"kW":300,"kVA":375},"standby":{"kW":330,"kVA":413}} | 
    MỚI THÊM engine P158LE-1 | genset=UD300GF | make= | P={"prime":{"kW":300,"kVA":375},"standby":{"kW":330,"kVA":413}} | 

### yongcai-elecmama n170 (bảng 58) — Chinese Diesel Engines | Yangzhou Yongcai Machinery Co., Ltd.
HEADER: []
- dòng undefined: `(nhãn)`
    CŨ  = engine C490BPG | genset= | make= | P={"rated":{"kW":70}} | 
    MỚI = engine C490BPG | genset= | make= | P=null | engPower=40 kW / 2650 rpm
    MỚI THÊM engine A495BPG | genset= | make= | P=null | engPower=39 kW / 2500 rpm, 42 kW / 2650 rpm
    MỚI THÊM engine A498BPG | genset= | make= | P=null | engPower=45 kW / 2500 rpm
    MỚI THÊM engine NC485BPG | genset= | make= | P=null | engPower=30 kW / 2600 rpm
    MỚI THÊM engine LR4B5-15 | genset= | make= | P=null | engPower=48/1500
    MỚI THÊM engine CZ380Q | genset= | make= | P=null | engPower=12/1500
    MỚI THÊM engine ZN385Q | genset= | make= | P=null | engPower=13/1500
    MỚI THÊM engine CZ480Q | genset= | make= | P=null | engPower=15/1500 18/1800
    MỚI THÊM engine ZN485Q | genset= | make= | P=null | engPower=18/1500 20/1800
    MỚI THÊM engine ZN490B | genset= | make= | P=null | engPower=21/1500 24/1800
    MỚI THÊM engine 4L68 | genset= | make= | P=null | engPower=24/1500 29/1800
    MỚI THÊM engine 4L88 | genset= | make= | P=null | engPower=29/1500
    MỚI THÊM engine 4G33 | genset= | make= | P=null | 

### yongcai-elecmama n171 (bảng 59) — Yangdong Diesel Engine | Yangzhou Yongcai Machinery Co., Ltd.
HEADER: []
- dòng undefined: `(nhãn)`
    CŨ  = engine YD380D | genset= | make= | P=null | engPower=10/1500 12/1800
    MỚI = engine YD380D | genset= | make= | P=null | engPower=10/1500 12/1800
    MỚI THÊM engine YD385D | genset= | make= | P=null | engPower=11/1500 13/1800
    MỚI THÊM engine YD480D | genset= | make= | P=null | engPower=14/1500 16/1800
    MỚI THÊM engine YD4KD | genset= | make= | P=null | engPower=15/1500 18/1800
    MỚI THÊM engine YND485D | genset= | make= | P=null | engPower=17/1500 20/1800
    MỚI THÊM engine YSD490D | genset= | make= | P=null | engPower=21/1500 25/1800
    MỚI THÊM engine Y490D | genset= | make= | P=null | engPower=24/1500 28/1800
    MỚI THÊM engine Y495D | genset= | make= | P=null | engPower=27/1500 30/1800
    MỚI THÊM engine Y4100D | genset= | make= | P=null | engPower=30/1500 33/1800
    MỚI THÊM engine Y4102D | genset= | make= | P=null | engPower=33/1500 36/1800
    MỚI THÊM engine Y4105D | genset= | make= | P=null | engPower=38/1500 45/1800
    MỚI THÊM engine Y4102ZLD | genset= | make= | P=null | engPower=48/1500 53/1800
    MỚI THÊM engine Y4105ZLD | genset= | make= | P=null | engPower=55/1500 60/1800
    MỚI THÊM engine YD4EZLD | genset= | make= | P=null | engPower=63/1500 70/1800
    MỚI THÊM engine Y4110ZLD | genset= | make= | P=null | engPower=80/1500 85/1800
    MỚI THÊM engine YD480DE | genset= | make= | P=null | engPower=14/1500
    MỚI THÊM engine YND485DE | genset= | make= | P=null | engPower=17/1500
    MỚI THÊM engine YND490DE | genset= | make= | P=null | engPower=18.9/1500
    MỚI THÊM engine Y380T | genset= | make= | P=null | engPower=14.7/2400
    MỚI THÊM engine Y385T | genset= | make= | P=null | engPower=18.5/2350
    MỚI THÊM engine YD480T | genset= | make= | P=null | 
    MỚI THÊM engine YD480Q | genset= | make= | P=null | engPower=29/3000

### yongcai-elecmama n172 (bảng 60) — Quanchai Diesel Engine | Yangzhou Yongcai Machinery Co., Ltd.
HEADER: []
- dòng undefined: `(nhãn)`
    CŨ  = engine QC380D | genset= | make= | P={"rated":{"kW":18.8}} | engPower=10/1500 12/1800; speed=2350 rpm
    MỚI = engine QC380D | genset= | make= | P=null | engPower=10/1500 12/1800
    MỚI THÊM engine QC385D | genset= | make= | P=null | engPower=11/1500 13/1800
    MỚI THÊM engine QC480D | genset= | make= | P=null | engPower=14/1500 17/1800
    MỚI THÊM engine N485D | genset= | make= | P=null | engPower=17/1500 20/1800
    MỚI THÊM engine QC490D | genset= | make= | P=null | engPower=22/1500 26/1800
    MỚI THÊM engine QC4102D | genset= | make= | P=null | engPower=33/1500 39.6/1800
    MỚI THÊM engine QC4105D | genset= | make= | P=null | engPower=38/1500 45/1800
    MỚI THÊM engine QC385BT | genset= | make= | P={"rated":{"kW":18.8}} | speed=2350 rpm

### yongcai-elecmama n173 (bảng 61) — Xinchai Diesel Engine | Yangzhou Yongcai Machinery Co., Ltd.
HEADER: []
- dòng undefined: `(nhãn)`
    CŨ  = engine C490BPG | genset= | make= | P=null | engPower=40 kW / 2650 rpm
    MỚI = engine C490BPG | genset= | make= | P=null | engPower=40 kW / 2650 rpm
    MỚI THÊM engine A495BPG | genset= | make= | P=null | engPower=39 kW / 2500 rpm, 42 kW / 2650 rpm
    MỚI THÊM engine A498BPG | genset= | make= | P=null | engPower=45 kW / 2500 rpm
    MỚI THÊM engine NC485BPG | genset= | make= | P=null | engPower=30 kW / 2600 rpm