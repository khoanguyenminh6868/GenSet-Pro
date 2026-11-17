Gói trong bộ lọc: 928; lượt (gói × cỡ) chạy được: 1093 (890 gói); không đọc được công suất: 38; lỗi: 0.
Lượt có ít nhất một ngưỡng mà candidates so số (minDisp / maxDisp / minCyl / maxFuel*): 526.

| Chỉ số | Cờ tắt | Cờ bật | Đổi |
|---|---:|---:|---:|
| Dòng bị loại (tổng mọi lượt) | 255000 | 257134 | giữ lại 2208, mới bị loại 4394 |
| Dòng tiêu hao vượt (bị trừ điểm hoặc loại) | 2131 | 2 | |
| Lượt có danh sách 30 ứng viên đổi thứ tự | | | 85 |
| Lượt có tập 30 ứng viên đổi (dòng vào / ra) | | | 85 (vào 294, ra 280) |

Dòng được giữ lại theo luật đã loại chúng khi cờ tắt: {"fuel":131,"maxDisp":522,"disp":1555}; mới bị loại: {"fuel":2041,"disp":1859,"maxDisp":498}.

| Dải công suất | Lượt | Lượt có ngưỡng | Loại (tắt) | Loại (bật) | Giữ lại | Mới loại | Lượt đổi tập 30 |
|---|---:|---:|---:|---:|---:|---:|---:|
| ≤30 kVA | 392 | 188 | 28281 | 28104 | 548 | 423 | 30 |
| 31–100 | 195 | 85 | 43204 | 43339 | 145 | 280 | 16 |
| 101–300 | 229 | 111 | 73211 | 74908 | 726 | 2423 | 21 |
| 301–700 | 150 | 79 | 79699 | 79931 | 608 | 840 | 10 |
| 701–1500 | 80 | 42 | 25478 | 25837 | 56 | 415 | 3 |
| >1500 | 47 | 21 | 5127 | 5015 | 125 | 13 | 5 |

Lý do không so (trên 760 mẫu ghi lại, tối đa 2 dòng mỗi lượt): disp: unit 999; fuel: load 96; disp: đơn vị cc 58; bore: unit 16; fuel: ambiguous 13; fuel: unit 3.

Bước check: 38 lượt (16 web như lưu, 16 web đã gỡ check của code, 6 đóng băng); tiêu chí đổi 0; lượt đổi thứ hạng 0; lượt đổi hạng 1 0; không chạy được 1: IB2600599817 (không có cấu hình (Không gợi ý cấu hình: Chương V của HSMT chỉ yêu cầu 3 hạng mục hàng hóa là "Xăng)).

1. **giữ lại** — IB2400533611 (630 kVA; ngưỡng {"minDisp":26.6,"minCyl":12,"maxFuel":135,"maxFuel75":105,"maxFuel50":70}), luật disp: aosif [102], động cơ QSK19-G31
   - Dòng nguồn: `| AC700-I | 625/500 | 700/560 | QSK19-G31 | 136.5 | 12V | 18.9 |`
   - Tiêu đề: `| Prime Power | Standby Power | Engine Model | Fuel Consumption | Cylinder | Displacement / | KVA/KW | KVA/KW | | L/h`
   - Tên bảng: `CCEC Series(50HZ)-Xiamen Aosif Engineering Ltd.`
   - Lớp chuẩn hoá: disp "Displacement" = "18.9" (aosif) → không so: unit
   - Lớp chuẩn hoá: disp "Displacement" = "18.9" (aosif) → không so: unit
   - Chữ HSMT: "Máy phát điện 630 kVA - Động cơ: Tổng dung tích xy lanh: ≥ 26.6 lít"
   - Chữ HSMT: "Máy phát điện 630 kVA - Động cơ: Dung tích dầu bôi trơn: ≥ 55~65 lít"
2. **giữ lại** — IB2500279384 (20 kVA; ngưỡng {"minCyl":3,"maxFuel":5.5,"maxFuel75":4.5}), luật fuel: victory-generator [110], động cơ 4B3.9-G1/ 4B3.9-G2
   - Dòng nguồn: `| V24C | 50 | 22 | 27.5 | 24 | 30 | 4B3.9-G1/ 4B3.9-G2 | 6.7 / 7.1 | 3.9 | 4L | electronic | 1750*970*1500 | 930 | 2250*1080*1255 | 1150`
   - Tiêu đề: `| Model | Frequency | Prime Power | Standby Power | Engine Model | Full-Load Diesel Consumption (L/H) | Displacement (L) | Cylinders & arrangement | Governor Type | Open Type | Silent Type / | HZ | kW | kVA | kW | kVA | Dimension L*W*H (mm) | Weight (KG) | Dimension L*W*H (mm) | Weight (KG)`
   - Tên bảng: `20KVA~1718KVA Cummins Diesel Generator Set`
   - Lớp chuẩn hoá: fuel "Full-Load Diesel Consumption (L/H)" = "6.7 / 7.1" (victory-generator) → không so: ambiguous
3. **mới bị loại** — IB2500533266 (250 kVA; ngưỡng {"minDisp":4.3,"minCyl":4,"maxFuel":60,"maxFuel75":45}), luật fuel: agestar [104], động cơ 6LTAA8.9-G2
   - Dòng nguồn: `| GC-275(S) | 275 | 220 | 250 | 200 | 6LTAA8.9-G2 | 62 | Electrical | 8.9 | ASG274H | 3300*1150*1650 | 2400`
   - Tiêu đề: `| Model | Specification 50HZ 400-230V | General specifications | Displacement (L) | Alternator | Silent type / | ESP | PRP | Engine | Consumption 100% | Gov | Dimensions (mm) | Weight (kg) / | KVA | KW | KVA | KW | L/H`
   - Tên bảng: `CUMMINS Series Diesel Generator set`
   - Chữ HSMT: "Máy 100 kVA: Động cơ - Tiêu hao nhiên liệu: Tại 100% công suất liên tục ≤ 24 lít/giờ; tại 75% công suất liên tục ≤ 19 lít/giờ."
   - Chữ HSMT: "Máy 250 kVA: Động cơ - Tiêu hao nhiên liệu: Tại 100% công suất liên tục ≤ 60 lít/giờ; tại 75% công suất liên tục ≤ 45 lít/giờ."
4. **mới bị loại** — IB2500287209 (25 kVA; ngưỡng {"maxFuel":7.6,"maxFuel75":5.7}), luật fuel: gordon-power [108], động cơ 1103A-33G
   - Dòng nguồn: `| EGD-P39 | 28 | 35 | 30.8 | 38.5 | 1103A-33G | 1800 | 33.2 | 8.6 | 3L-105×127 | 3.3 | 152×80×122 | 230×102×128`
   - Tiêu đề: `| Genset Perfomance | Engine Performance | Dimension(L×W×H) / | Genset Model | Prime Power | Standby Power | Engine Model | Speed | Prime Power | Fuel Cons. (100% Load) | Cylinder- Bore×Stroke | Displace -ment | Open Type | Silent Type / | kW | kVA | kW | kVA | rpm | kW | L/h | Qty.-mm | L | cm | cm`
   - Tên bảng: `PERKINS from China manufacturer - GORDON`
5. **giữ lại** — IB2500084609 (15 kVA; ngưỡng {"maxDisp":1.83,"minCyl":4,"maxFuel75":2.9}), luật maxDisp: victory-generator [105], động cơ 4TNV84T
   - Dòng nguồn: `| V18YM | 50 | 16 | 20 | 18 | 22.5 | 4TNV84T | 4 | 1.995 | 84 | 90 | Turbo | Direct injection | Radiator | 1700*760*1300 | 515`
   - Tiêu đề: `| Genset Model | Frequency (HZ) | Prime Power | Standby Power | Engine Model | NO. OF CYCLINDER | DISPLACEMENT | BORE | STROKE | ASPIRATION | COMBUSTION | COOLING SYSTEM | Dimensions (mm) | Weight (kg) / | KW | KVA | KW | KVA`
   - Tên bảng: `8KVA~72KVA Yanmar Diesel Generator Set`
   - Lớp chuẩn hoá: disp "DISPLACEMENT" = "1.995" (victory-generator) → không so: unit
   - Lớp chuẩn hoá: disp "DISPLACEMENT" = "1.995" (victory-generator) → không so: unit — dòng: `| V22YM | 60 | 20 | 25 | 22 | 27.5 | 4TNV84T | 4 | 1.995 | 84 | 90 | Turbo | Direct injection | Radiator | 1700*760*1300 | 515`
   - Lớp chuẩn hoá: disp "DISPLACEMENT" = "1.995" (victory-generator) → không so: unit
   - Chữ HSMT: "Phần I - Máy 15kVA/16.5kVA 3 pha: Bình nhiên liệu: Gắn liền với bệ máy; dung tích đảm bảo chạy 12 giờ liên tục ở tối thiểu 100% công suất định mức"
   - Chữ HSMT: "Phần II - Máy 15kVA 1 pha: Bình nhiên liệu: Gắn liền với bệ máy; dung tích đảm bảo chạy 12 giờ liên tục ở tối thiểu 100% công suất định mức"
6. **giữ lại** — IB2600470479 (250 kVA; ngưỡng {"minCyl":6,"maxFuel":53,"maxFuel75":39,"maxFuel50":27}), luật fuel: victory-generator [126], động cơ BF6M1015C-LA G1B
   - Dòng nguồn: `| V240DH | 60 | 220 | 275 | 240 | 300 | BF6M1015C-LAG1B | 64 | 6V | 24V | 2630 x 1410 x 2150 | 2228`
   - Tiêu đề: `| Genset model | Frequency (HZ) | Prime Power | Standby Power | Engine model | Fuel consumption underfull load (L/H) | Cylinder | Volt. For start (DC) | Measurement L X W X H (mm) | Weight (kg) / | KW | KVA | KW | KVA`
   - Tên bảng: `60KVA~625KVA Original Deutz Diesel Generator Set`
   - Lớp chuẩn hoá: fuel "Fuel consumption underfull load (L/H)" = "64" (victory-generator) → không so: load
   - Chữ HSMT: "Tổ máy phát điện 250 kVA: Tiêu hao nhiên liệu 100% tải: Tối đa ≤ 53 lít/giờ"
   - Chữ HSMT: "Tổ máy phát điện 250 kVA: Tiêu hao nhiên liệu 75% tải: Tối đa ≤ 39 lít/giờ"
7. **mới bị loại** — IB2400111737 (12 kVA; ngưỡng {"maxDisp":1.85,"maxFuel":3}), luật fuel: gordon-power [108], động cơ 403D-15G
   - Dòng nguồn: `| GD-P17 | 12 | 15 | 13.2 | 16.5 | 403D-15G | 1800 | 14.7 | 4.27 | 3L-84×90 | 1.496 | 115×74×99 | 180×84×110`
   - Tiêu đề: `| Genset Perfomance | Engine Performance | Dimension(L×W×H) / | Genset Model | Prime Power | Standby Power | Engine Model | Speed | Prime Power | Fuel Cons. (100% Load) | Cylinder- Bore×Stroke | Displace -ment | Open Type | Silent Type / | kW | kVA | kW | kVA | rpm | kW | L/h | Qty.-mm | L | cm | cm`
   - Tên bảng: `PERKINS from China manufacturer - GORDON`
   - Chữ HSMT: "Tổ máy 12kVA - Mức tiêu hao nhiên liệu: ≤ 4.0 lít/giờ tại 100% tải định mức; ≤ 3,0 lít/giờ tại 75% tải định mức"
8. **giữ lại** — IB2200071778 (15 kVA; ngưỡng {"minDisp":2.54,"minCyl":4}), luật disp: comappower [104], động cơ 4TNV84T
   - Dòng nguồn: `| COM22 | 22kVA | 17.6kW | 20.0kVA | 16kW | 4TNV84T | 4 | COM22`
   - Tiêu đề: `| | Genset Model | Standby power | /kw | Prime power | /kw | Engine Model | NO. of Cylinder | Detail Data`
   - Tên bảng: `YANMAR GENERATOR SET - Comappower`
   - Lớp chuẩn hoá: disp "DISPLACEMENT" = "1.995" (victory-generator) → không so: unit — dòng: `| V18YM | 50 | 16 | 20 | 18 | 22.5 | 4TNV84T | 4 | 1.995 | 84 | 90 | Turbo | Direct injection | Radiator | 1700*760*1300 | 515`
   - Lớp chuẩn hoá: disp "DISPLACEMENT" = "1.995" (victory-generator) → không so: unit — dòng: `| V22YM | 60 | 20 | 25 | 22 | 27.5 | 4TNV84T | 4 | 1.995 | 84 | 90 | Turbo | Direct injection | Radiator | 1700*760*1300 | 515`
   - Chữ HSMT: "Tổ máy - Bình nhiên liệu: Bằng thép, gắn liền với khung máy, dung tích > 70 lít"
   - Chữ HSMT: "Động cơ - Dung tích xy lanh: ≥ 2.54 lít"
9. **mới bị loại** — IB2200087789 (100 kVA; ngưỡng {"maxFuel":24}), luật fuel: agestar [108], động cơ YC6B135Z-D20
   - Dòng nguồn: `| GYC125(S) | 124 | 99 | 113 | 90 | YC6B135Z-D20 | 35.7 | Mechanical | ASG274F | 3250*1130*1600 | 2050`
   - Tiêu đề: `| Model | Specification 50HZ 400-230V | General specifications | Alternator | Dimensions | Weight / | ESP | PRP | Engine type | Consumption 100% | Gov | MODEL | mm | kg / | KVA | KW | KVA | KW | L/H`
   - Tên bảng: `YUCHAI generator set`
   - Chữ HSMT: "Máy 100 kVA: Tổ máy: Máy phát điện diesel có vỏ giảm âm, 100kVA, 03 pha; mới 100%; công suất liên tục ≥ 100 kVA, tối đa ≥ 110 kVA; hệ số công suất ≥ 0,8; 380V/220V; ≤ 1500 vòng/phút; 50Hz; tiêu hao nhiên liệu 100% tải ≤ 24 lít/giờ; quá tải 10% trong "
   - Chữ HSMT: "Máy 250 kVA: Tổ máy: Diesel có vỏ giảm âm, 250kVA, 03 pha; mới 100%; công suất liên tục ≥ 250 kVA, tối đa ≥ 275 kVA; hệ số công suất ≥ 0,8; 380V/220V; ≤ 1500 vòng/phút; 50Hz; tiêu hao nhiên liệu ≤ 60 lít/giờ (100% tải), ≤ 36 lít/giờ (50% tải); quá tả"
10. **mới bị loại** — IB2400218348 (30 kVA; ngưỡng {"maxFuel":7.9}), luật fuel: agestar [104], động cơ 4BT3.9-G2
   - Dòng nguồn: `| GC-44(S) | 44 | 35 | 40 | 32 | 4BT3.9-G2 | 9.5 | Electrical | 3.9 | ASG184H | 2250*1000*1250 | 1330`
   - Tiêu đề: `| Model | Specification 50HZ 400-230V | General specifications | Displacement (L) | Alternator | Silent type / | ESP | PRP | Engine | Consumption 100% | Gov | Dimensions (mm) | Weight (kg) / | KVA | KW | KVA | KW | L/H`
   - Tên bảng: `CUMMINS Series Diesel Generator set`
   - Chữ HSMT: "Máy 30 KVA: Mức tiêu hao nhiên liệu tại công suất liên tục: Tại 75% tải < 5.7 lít/giờ; tại 100% tải < 7.9 lít/giờ (mục động cơ ghi ≤ 5.7 và ≤ 7,9 lít/giờ); nếu dùng đơn vị khác phải thuyết minh quy đổi về lít/giờ"
   - Chữ HSMT: "Máy 250 KVA: Mức tiêu hao nhiên liệu tại công suất liên tục: Tại 75% tải ≤ 42.6 lít/giờ; tại 100% tải ≤ 56.9 lít/giờ; nếu dùng đơn vị khác phải thuyết minh quy đổi về lít/giờ"
