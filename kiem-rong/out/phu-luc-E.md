# Phụ lục E: gói nhiều cỡ, ngưỡng null / ngưỡng của cỡ khác (mục 8)

`null vì…` = HSMT ghi ≥ 2 giá trị khác nhau cho cùng ngưỡng nên `engineMins` / `powerMins` trả null cho MỌI cỡ (`one()` chỉ nhận danh sách một giá trị). `nghi` = ngưỡng sau `plausible` mâu thuẫn với một ngưỡng khác của cùng văn bản (suy ra thuộc cỡ khác).

Gói nhiều cỡ: 243; lượt cỡ: 620; lượt cỡ có ít nhất một ngưỡng null: 203 ở 89 gói.

| gói | cỡ | ngưỡng null vì khác giá trị |
|---|---|---|
| IB2600592684 | 30 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 500kVA/genset, 450kW/engine, 30kVA/alt, 27kW/engine |
| IB2600592684 | 500 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 500kVA/genset, 450kW/engine, 30kVA/alt, 27kW/engine |
| IB2600594596 | 300 kVA (cỡ 1/2) | minDisp: null vì các giá trị khác nhau: 14.5/9; minCyl: null vì các giá trị khác nhau: 8/6; minPrime: null vì prime khác nhau: 400kVA/genset, 300kVA/genset |
| IB2600594596 | 400 kVA (cỡ 2/2) | minDisp: null vì các giá trị khác nhau: 14.5/9; minCyl: null vì các giá trị khác nhau: 8/6; minPrime: null vì prime khác nhau: 400kVA/genset, 300kVA/genset |
| IB2200006257 | 3 kVA (cỡ 1/2) | minDisp: null vì các giá trị khác nhau: 0.389/0.198 |
| IB2200006257 | 5 kVA (cỡ 2/2) | minDisp: null vì các giá trị khác nhau: 0.389/0.198 |
| IB2200016981 | 8 kVA (cỡ 1/2) | minDisp: null vì các giá trị khác nhau: 1.498/3.769; minPrime: null vì prime khác nhau: 8kVA/genset, 10kVA/alt, 40kVA/genset, 40kVA/alt |
| IB2200016981 | 40 kVA (cỡ 2/2) | minDisp: null vì các giá trị khác nhau: 1.498/3.769; minPrime: null vì prime khác nhau: 8kVA/genset, 10kVA/alt, 40kVA/genset, 40kVA/alt |
| IB2200046063 | 10.5 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 10kVA/genset, 21kW/engine, 14.5kVA/alt, 13kVA/genset, 15.5kVA/alt |
| IB2200046063 | 13.5 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 10kVA/genset, 21kW/engine, 14.5kVA/alt, 13kVA/genset, 15.5kVA/alt |
| IB2200062073 | 12.5 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 12kVA/genset, 15kVA/alt, 30kVA/genset, 30kVA/alt |
| IB2200062073 | 30 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 12kVA/genset, 15kVA/alt, 30kVA/genset, 30kVA/alt |
| IB2200087789 | 100 kVA (cỡ 1/4) | minPrime: null vì prime khác nhau: 100kVA/genset, 100kVA/engine, 100kVA/alt, 250kVA/genset, 250kVA/engine, 250kVA/alt, 400kVA/genset, 400kVA/engine, 400kVA/alt, 500kVA/genset, 500kVA/engine |
| IB2200087789 | 250 kVA (cỡ 2/4) | minPrime: null vì prime khác nhau: 100kVA/genset, 100kVA/engine, 100kVA/alt, 250kVA/genset, 250kVA/engine, 250kVA/alt, 400kVA/genset, 400kVA/engine, 400kVA/alt, 500kVA/genset, 500kVA/engine |
| IB2200087789 | 400 kVA (cỡ 3/4) | minPrime: null vì prime khác nhau: 100kVA/genset, 100kVA/engine, 100kVA/alt, 250kVA/genset, 250kVA/engine, 250kVA/alt, 400kVA/genset, 400kVA/engine, 400kVA/alt, 500kVA/genset, 500kVA/engine |
| IB2200087789 | 500 kVA (cỡ 4/4) | minPrime: null vì prime khác nhau: 100kVA/genset, 100kVA/engine, 100kVA/alt, 250kVA/genset, 250kVA/engine, 250kVA/alt, 400kVA/genset, 400kVA/engine, 400kVA/alt, 500kVA/genset, 500kVA/engine |
| IB2300002060 | 250 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 250kVA/genset, 250kVA/engine, 250kVA/alt, 500kVA/genset, 500kVA/engine |
| IB2300002060 | 500 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 250kVA/genset, 250kVA/engine, 250kVA/alt, 500kVA/genset, 500kVA/engine |
| IB2300003199 | 8 kW (cỡ 1/2) | minDisp: null vì các giá trị khác nhau: 5.9/0.719 |
| IB2300003199 | 80 kW (cỡ 2/2) | minDisp: null vì các giá trị khác nhau: 5.9/0.719 |
| IB2300032777 | 10 kW (cỡ 1/2) | minPrime: null vì prime khác nhau: 10.5kW/genset, 13kW/genset |
| IB2300032777 | 12 kW (cỡ 2/2) | minPrime: null vì prime khác nhau: 10.5kW/genset, 13kW/genset |
| IB2300044204 | 14 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 14kVA/genset, 37kVA/genset, 34kW/genset |
| IB2300044204 | 37 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 14kVA/genset, 37kVA/genset, 34kW/genset |
| IB2300120176 | 12.5 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 12kVA/genset, 15kVA/alt, 40kVA/genset, 40kVA/alt |
| IB2300120176 | 40 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 12kVA/genset, 15kVA/alt, 40kVA/genset, 40kVA/alt |
| IB2300129273 | 2000 kW (cỡ 1/2) | minPrime: null vì prime khác nhau: 2000kW/genset, 2400kW/genset, 2400kW/engine, 2000kW/engine |
| IB2300129273 | 2400 kW (cỡ 2/2) | minPrime: null vì prime khác nhau: 2000kW/genset, 2400kW/genset, 2400kW/engine, 2000kW/engine |
| IB2300134577 | 50 kVA (cỡ 1/3) | minCyl: null vì các giá trị khác nhau: 3/4 |
| IB2300134577 | 100 kVA (cỡ 2/3) | minCyl: null vì các giá trị khác nhau: 3/4 |
| IB2300134577 | 150 kVA (cỡ 3/3) | minCyl: null vì các giá trị khác nhau: 3/4 |
| IB2300162912 | 750 kVA (cỡ 1/2) | minDisp: null vì các giá trị khác nhau: 78/37; minCyl: null vì các giá trị khác nhau: 16/6; minPrime: null vì prime khác nhau: 2275kVA/genset, 750kVA/genset, 75kVA/engine |
| IB2300162912 | 2275 kVA (cỡ 2/2) | minDisp: null vì các giá trị khác nhau: 78/37; minCyl: null vì các giá trị khác nhau: 16/6; minPrime: null vì prime khác nhau: 2275kVA/genset, 750kVA/genset, 75kVA/engine |
| IB2300163186 | 15 kVA (cỡ 1/4) | minDisp: null vì các giá trị khác nhau: 2.3/4.087/9.726; minCyl: null vì các giá trị khác nhau: 4/6; minPrime: null vì prime khác nhau: 18kW/genset, 15kVA/genset, 30kW/genset, 30kVA/genset, 90kW/genset, 100kVA/genset, 187kW/genset, 200kVA/genset |
| IB2300163186 | 30 kVA (cỡ 2/4) | minDisp: null vì các giá trị khác nhau: 2.3/4.087/9.726; minCyl: null vì các giá trị khác nhau: 4/6; minPrime: null vì prime khác nhau: 18kW/genset, 15kVA/genset, 30kW/genset, 30kVA/genset, 90kW/genset, 100kVA/genset, 187kW/genset, 200kVA/genset |
| IB2300163186 | 100 kVA (cỡ 3/4) | minDisp: null vì các giá trị khác nhau: 2.3/4.087/9.726; minCyl: null vì các giá trị khác nhau: 4/6; minPrime: null vì prime khác nhau: 18kW/genset, 15kVA/genset, 30kW/genset, 30kVA/genset, 90kW/genset, 100kVA/genset, 187kW/genset, 200kVA/genset |
| IB2300163186 | 200 kVA (cỡ 4/4) | minDisp: null vì các giá trị khác nhau: 2.3/4.087/9.726; minCyl: null vì các giá trị khác nhau: 4/6; minPrime: null vì prime khác nhau: 18kW/genset, 15kVA/genset, 30kW/genset, 30kVA/genset, 90kW/genset, 100kVA/genset, 187kW/genset, 200kVA/genset |
| IB2300163844 | 8 kVA (cỡ 1/2) | minDisp: null vì các giá trị khác nhau: 2.9/0.667; minCyl: null vì các giá trị khác nhau: 3/1; minPrime: null vì prime khác nhau: 30kVA/genset, 32kVA/engine, 8kVA/genset, 8kVA/engine |
| IB2300163844 | 30 kVA (cỡ 2/2) | minDisp: null vì các giá trị khác nhau: 2.9/0.667; minCyl: null vì các giá trị khác nhau: 3/1; minPrime: null vì prime khác nhau: 30kVA/genset, 32kVA/engine, 8kVA/genset, 8kVA/engine |
| IB2300232850 | 12.5 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 12.5kVA/genset, 23kVA/genset, 27kVA/genset, 30kVA/genset |
| IB2300232850 | 27 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 12.5kVA/genset, 23kVA/genset, 27kVA/genset, 30kVA/genset |
| IB2300236743 | 10 kVA (cỡ 1/2) | maxDisp: null vì các giá trị khác nhau: 2.8/2.28; minPrime: null vì prime khác nhau: 18kVA/genset, 20.5kVA/engine, 10kVA/genset, 10.5kVA/alt |
| IB2300236743 | 18 kVA (cỡ 2/2) | maxDisp: null vì các giá trị khác nhau: 2.8/2.28; minPrime: null vì prime khác nhau: 18kVA/genset, 20.5kVA/engine, 10kVA/genset, 10.5kVA/alt |
| IB2300243355 | 100 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 450kVA/genset, 360kW/engine, 450kVA/alt, 100kVA/genset, 80kW/engine, 100kVA/alt |
| IB2300243355 | 450 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 450kVA/genset, 360kW/engine, 450kVA/alt, 100kVA/genset, 80kW/engine, 100kVA/alt |
| IB2300245556 | 8.5 kVA (cỡ 1/3) | minPrime: null vì prime khác nhau: 8.5kVA/genset, 10kVA/genset, 12kVA/genset |
| IB2300245556 | 10.5 kVA (cỡ 2/3) | minPrime: null vì prime khác nhau: 8.5kVA/genset, 10kVA/genset, 12kVA/genset |
| IB2300245556 | 12.5 kVA (cỡ 3/3) | minPrime: null vì prime khác nhau: 8.5kVA/genset, 10kVA/genset, 12kVA/genset |
| IB2300245748 | 8.5 kVA (cỡ 1/3) | minPrime: null vì prime khác nhau: 8.5kVA/genset, 10kVA/genset, 12kVA/genset |
| IB2300245748 | 10 kVA (cỡ 2/3) | minPrime: null vì prime khác nhau: 8.5kVA/genset, 10kVA/genset, 12kVA/genset |
| IB2300245748 | 12 kVA (cỡ 3/3) | minPrime: null vì prime khác nhau: 8.5kVA/genset, 10kVA/genset, 12kVA/genset |
| IB2300247840 | 250 kVA (cỡ 1/3) | minPrime: null vì prime khác nhau: 650kVA/genset, 400kVA/genset, 250kVA/genset |
| IB2300247840 | 400 kVA (cỡ 2/3) | minPrime: null vì prime khác nhau: 650kVA/genset, 400kVA/genset, 250kVA/genset |
| IB2300247840 | 650 kVA (cỡ 3/3) | minPrime: null vì prime khác nhau: 650kVA/genset, 400kVA/genset, 250kVA/genset |
| IB2300253227 | 100 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 100kVA/genset, 150kVA/alt |
| IB2300253227 | 150 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 100kVA/genset, 150kVA/alt |
| IB2300260615 | 500 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 500kVA/genset, 2000kVA/genset |
| IB2300260615 | 2000 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 500kVA/genset, 2000kVA/genset |
| IB2300273061 | 100 kVA (cỡ 1/3) | minPrime: null vì prime khác nhau: 100kVA/genset, 100kVA/engine, 100kVA/alt, 160kVA/genset, 160kVA/engine, 160kVA/alt, 250kVA/genset, 250kVA/engine, 250kVA/alt |
| IB2300273061 | 160 kVA (cỡ 2/3) | minPrime: null vì prime khác nhau: 100kVA/genset, 100kVA/engine, 100kVA/alt, 160kVA/genset, 160kVA/engine, 160kVA/alt, 250kVA/genset, 250kVA/engine, 250kVA/alt |
| IB2300273061 | 250 kVA (cỡ 3/3) | minPrime: null vì prime khác nhau: 100kVA/genset, 100kVA/engine, 100kVA/alt, 160kVA/genset, 160kVA/engine, 160kVA/alt, 250kVA/genset, 250kVA/engine, 250kVA/alt |
| IB2300274793 | 250 kVA (cỡ 1/3) | minPrime: null vì prime khác nhau: 250kVA/genset, 250kVA/engine, 250kVA/alt, 400kVA/genset, 400kVA/engine, 400kVA/alt, 500kVA/genset, 500kVA/engine |
| IB2300274793 | 400 kVA (cỡ 2/3) | minPrime: null vì prime khác nhau: 250kVA/genset, 250kVA/engine, 250kVA/alt, 400kVA/genset, 400kVA/engine, 400kVA/alt, 500kVA/genset, 500kVA/engine |
| IB2300274793 | 500 kVA (cỡ 3/3) | minPrime: null vì prime khác nhau: 250kVA/genset, 250kVA/engine, 250kVA/alt, 400kVA/genset, 400kVA/engine, 400kVA/alt, 500kVA/genset, 500kVA/engine |
| IB2300291304 | 82.5 kVA (cỡ 1/3) | minCyl: null vì các giá trị khác nhau: 2/4 |
| IB2300291304 | 100 kVA (cỡ 2/3) | minCyl: null vì các giá trị khác nhau: 2/4 |
| IB2300291304 | 250 kVA (cỡ 3/3) | minCyl: null vì các giá trị khác nhau: 2/4 |
| IB2300293753 | 10 kVA (cỡ 1/3) | minCyl: null vì các giá trị khác nhau: 3/6 |
| IB2300293753 | 36 kVA (cỡ 2/3) | minCyl: null vì các giá trị khác nhau: 3/6 |
| IB2300293753 | 200 kVA (cỡ 3/3) | minCyl: null vì các giá trị khác nhau: 3/6 |
| IB2300320688 | 5.5 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 5kVA/genset, 6.5kVA/genset |
| IB2300320688 | 6.5 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 5kVA/genset, 6.5kVA/genset |
| IB2300363623 | 5 kW (cỡ 1/2) | minPrime: null vì prime khác nhau: 15kVA/genset, 6kW/engine |
| IB2300363623 | 15 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 15kVA/genset, 6kW/engine |
| IB2300389043 | 82.5 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 82.5kVA/genset, 100kVA/genset |
| IB2300389043 | 100 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 82.5kVA/genset, 100kVA/genset |
| IB2400052694 | 11 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 11kVA/genset, 35kVA/genset, 11kVA/alt, 35kVA/alt |
| IB2400052694 | 35 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 11kVA/genset, 35kVA/genset, 11kVA/alt, 35kVA/alt |
| IB2400058723 | 630 kVA (cỡ 1/2) | maxDisp: null vì các giá trị khác nhau: 19.6/32; minPrime: null vì prime khác nhau: 630kVA/genset, 556kW/genset, 800kVA/genset, 709kW/genset |
| IB2400058723 | 800 kVA (cỡ 2/2) | maxDisp: null vì các giá trị khác nhau: 19.6/32; minPrime: null vì prime khác nhau: 630kVA/genset, 556kW/genset, 800kVA/genset, 709kW/genset |
| IB2400062394 | 50 kVA (cỡ 1/3) | minCyl: null vì các giá trị khác nhau: 3/4 |
| IB2400062394 | 100 kVA (cỡ 2/3) | minCyl: null vì các giá trị khác nhau: 3/4 |
| IB2400062394 | 150 kVA (cỡ 3/3) | minCyl: null vì các giá trị khác nhau: 3/4 |
| IB2400114476 | 12 kVA (cỡ 1/2) | minCyl: null vì các giá trị khác nhau: 3/4; minPrime: null vì prime khác nhau: 12kVA/genset, 12kVA/alt, 45kVA/genset, 50kVA/alt |
| IB2400114476 | 45 kVA (cỡ 2/2) | minCyl: null vì các giá trị khác nhau: 3/4; minPrime: null vì prime khác nhau: 12kVA/genset, 12kVA/alt, 45kVA/genset, 50kVA/alt |
| IB2400116787 | 12 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 12kVA/genset, 15kVA/alt, 40kVA/genset, 40kVA/alt |
| IB2400116787 | 40 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 12kVA/genset, 15kVA/alt, 40kVA/genset, 40kVA/alt |
| IB2400125924 | 8.5 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 8.5kVA/genset, 10.8kVA/alt, 12kVA/genset, 12.8kVA/alt |
| IB2400125924 | 12.5 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 8.5kVA/genset, 10.8kVA/alt, 12kVA/genset, 12.8kVA/alt |
| IB2400186078 | 6 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 7.6kW/engine, 6kVA/alt, 15kVA/alt |
| IB2400186078 | 12 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 7.6kW/engine, 6kVA/alt, 15kVA/alt |
| IB2400218348 | 30 kVA (cỡ 1/2) | minDisp: null vì các giá trị khác nhau: 2.9/6.7; minCyl: null vì các giá trị khác nhau: 3/6; minPrime: null vì prime khác nhau: 30kVA/genset, 250kVA/genset, 225kW/genset |
| IB2400218348 | 250 kVA (cỡ 2/2) | minDisp: null vì các giá trị khác nhau: 2.9/6.7; minCyl: null vì các giá trị khác nhau: 3/6; minPrime: null vì prime khác nhau: 30kVA/genset, 250kVA/genset, 225kW/genset |
| IB2400237184 | 53 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 405kVA/genset, 53kVA/genset |
| IB2400237184 | 405 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 405kVA/genset, 53kVA/genset |
| IB2400249622 | 160 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 200kVA/genset, 160kVA/genset |
| IB2400249622 | 200 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 200kVA/genset, 160kVA/genset |
| IB2400275648 | 30 kVA (cỡ 1/2) | minDisp: null vì các giá trị khác nhau: 3.3/4.5; minPrime: null vì prime khác nhau: 26kW/engine, 30kVA/alt, 42kW/engine, 60kVA/alt, 59.5kVA/alt |
| IB2400275648 | 60 kVA (cỡ 2/2) | minDisp: null vì các giá trị khác nhau: 3.3/4.5; minPrime: null vì prime khác nhau: 26kW/engine, 30kVA/alt, 42kW/engine, 60kVA/alt, 59.5kVA/alt |
| IB2400299108 | 50 kVA (cỡ 1/3) | minDisp: null vì các giá trị khác nhau: 2.6/3.5/5.5; minPrime: null vì prime khác nhau: 50kVA/genset, 60kVA/genset, 1000kVA/genset |
| IB2400299108 | 60 kVA (cỡ 2/3) | minDisp: null vì các giá trị khác nhau: 2.6/3.5/5.5; minPrime: null vì prime khác nhau: 50kVA/genset, 60kVA/genset, 1000kVA/genset |
| IB2400299108 | 100 kVA (cỡ 3/3) | minDisp: null vì các giá trị khác nhau: 2.6/3.5/5.5; minPrime: null vì prime khác nhau: 50kVA/genset, 60kVA/genset, 1000kVA/genset |
| IB2400311120 | 12 kVA (cỡ 1/3) | minDisp: null vì các giá trị khác nhau: 3.3/4.5; minCyl: null vì các giá trị khác nhau: 3/4; minPrime: null vì prime khác nhau: 12kVA/genset, 12kVA/alt, 30kVA/genset, 30kVA/alt, 45kVA/genset, 45kVA/alt |
| IB2400311120 | 30 kVA (cỡ 2/3) | minDisp: null vì các giá trị khác nhau: 3.3/4.5; minCyl: null vì các giá trị khác nhau: 3/4; minPrime: null vì prime khác nhau: 12kVA/genset, 12kVA/alt, 30kVA/genset, 30kVA/alt, 45kVA/genset, 45kVA/alt |
| IB2400311120 | 45 kVA (cỡ 3/3) | minDisp: null vì các giá trị khác nhau: 3.3/4.5; minCyl: null vì các giá trị khác nhau: 3/4; minPrime: null vì prime khác nhau: 12kVA/genset, 12kVA/alt, 30kVA/genset, 30kVA/alt, 45kVA/genset, 45kVA/alt |
| IB2400313681 | 30 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 30kVA/genset, 42kVA/genset |
| IB2400313681 | 42 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 30kVA/genset, 42kVA/genset |
| IB2400365165 | 7.2 kVA (cỡ 1/2) | minDisp: null vì các giá trị khác nhau: 2.3/0.459; minPrime: null vì prime khác nhau: 12.5kVA/genset, 7.2kVA/genset, 7.5kVA/alt |
| IB2400365165 | 12.5 kVA (cỡ 2/2) | minDisp: null vì các giá trị khác nhau: 2.3/0.459; minPrime: null vì prime khác nhau: 12.5kVA/genset, 7.2kVA/genset, 7.5kVA/alt |
| IB2400375383 | 150 kVA (cỡ 1/2) | maxDisp: null vì các giá trị khác nhau: 8.8/7 |
| IB2400375383 | 300 kVA (cỡ 2/2) | maxDisp: null vì các giá trị khác nhau: 8.8/7 |
| IB2400427929 | 8.5 kVA (cỡ 1/5) | minDisp: null vì các giá trị khác nhau: 2/2.3/4.2/6; minPrime: null vì prime khác nhau: 8.5kVA/genset, 19kW/engine, 21kW/engine, 30kW/engine, 42kW/engine, 60kW/engine, 20kVA/genset, 30kVA/genset, 45kVA/genset, 60kVA/genset, 20kVA/engine, 30kVA/engine, 45kVA/engine, 60kVA/engine |
| IB2400427929 | 20 kVA (cỡ 2/5) | minDisp: null vì các giá trị khác nhau: 2/2.3/4.2/6; minPrime: null vì prime khác nhau: 8.5kVA/genset, 19kW/engine, 21kW/engine, 30kW/engine, 42kW/engine, 60kW/engine, 20kVA/genset, 30kVA/genset, 45kVA/genset, 60kVA/genset, 20kVA/engine, 30kVA/engine, 45kVA/engine, 60kVA/engine |
| IB2400427929 | 30 kVA (cỡ 3/5) | minDisp: null vì các giá trị khác nhau: 2/2.3/4.2/6; minPrime: null vì prime khác nhau: 8.5kVA/genset, 19kW/engine, 21kW/engine, 30kW/engine, 42kW/engine, 60kW/engine, 20kVA/genset, 30kVA/genset, 45kVA/genset, 60kVA/genset, 20kVA/engine, 30kVA/engine, 45kVA/engine, 60kVA/engine |
| IB2400427929 | 45 kVA (cỡ 4/5) | minDisp: null vì các giá trị khác nhau: 2/2.3/4.2/6; minPrime: null vì prime khác nhau: 8.5kVA/genset, 19kW/engine, 21kW/engine, 30kW/engine, 42kW/engine, 60kW/engine, 20kVA/genset, 30kVA/genset, 45kVA/genset, 60kVA/genset, 20kVA/engine, 30kVA/engine, 45kVA/engine, 60kVA/engine |
| IB2400433961 | 600 kVA (cỡ 1/2) | maxDisp: null vì các giá trị khác nhau: 19.6/39.2; minCyl: null vì các giá trị khác nhau: 6/12; minPrime: null vì prime khác nhau: 600kVA/genset, 1500kVA/genset |
| IB2400433961 | 1500 kVA (cỡ 2/2) | maxDisp: null vì các giá trị khác nhau: 19.6/39.2; minCyl: null vì các giá trị khác nhau: 6/12; minPrime: null vì prime khác nhau: 600kVA/genset, 1500kVA/genset |
| IB2400448320 | 150 kVA (cỡ 1/2) | maxDisp: null vì các giá trị khác nhau: 8.8/7 |
| IB2400448320 | 300 kVA (cỡ 2/2) | maxDisp: null vì các giá trị khác nhau: 8.8/7 |
| IB2400482148 | 9.5 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 250kVA/genset, 250kVA/alt, 9.5kVA/alt |
| IB2400482148 | 250 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 250kVA/genset, 250kVA/alt, 9.5kVA/alt |
| IB2400487460 | 8.8 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 8.5kVA/genset, 17kW/engine, 10kVA/alt, 40kVA/engine, 36kW/engine, 42.5kVA/alt, 8.8kVA/genset, 40kVA/genset |
| IB2400487460 | 40 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 8.5kVA/genset, 17kW/engine, 10kVA/alt, 40kVA/engine, 36kW/engine, 42.5kVA/alt, 8.8kVA/genset, 40kVA/genset |
| IB2400494037 | 20 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 50kVA/genset, 50kVA/alt, 20kVA/genset, 20kVA/alt |
| IB2400494037 | 50 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 50kVA/genset, 50kVA/alt, 20kVA/genset, 20kVA/alt |
| IB2400495696 | 30 kVA (cỡ 1/3) | minCyl: null vì các giá trị khác nhau: 4/6; minPrime: null vì prime khác nhau: 30kVA/genset, 28.23kW/genset, 100kVA/genset, 81.6kW/genset, 200kVA/genset, 185kW/genset |
| IB2400495696 | 100 kVA (cỡ 2/3) | minCyl: null vì các giá trị khác nhau: 4/6; minPrime: null vì prime khác nhau: 30kVA/genset, 28.23kW/genset, 100kVA/genset, 81.6kW/genset, 200kVA/genset, 185kW/genset |
| IB2400495696 | 200 kVA (cỡ 3/3) | minCyl: null vì các giá trị khác nhau: 4/6; minPrime: null vì prime khác nhau: 30kVA/genset, 28.23kW/genset, 100kVA/genset, 81.6kW/genset, 200kVA/genset, 185kW/genset |
| IB2400508791 | 7 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 11kVA/genset, 7kVA/genset, 11kVA/alt, 7kVA/alt |
| IB2400508791 | 11 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 11kVA/genset, 7kVA/genset, 11kVA/alt, 7kVA/alt |
| IB2400550271 | 1800 kW (cỡ 1/2) | minPrime: null vì prime khác nhau: 1800kW/genset, 2400kW/genset |
| IB2400550271 | 2400 kW (cỡ 2/2) | minPrime: null vì prime khác nhau: 1800kW/genset, 2400kW/genset |
| IB2400563426 | 8.5 kVA (cỡ 1/2) | minDisp: null vì các giá trị khác nhau: 1.532/4.1; minCyl: null vì các giá trị khác nhau: 3/4; minPrime: null vì prime khác nhau: 65kW/genset, 65kVA/genset, 8.5kW/genset |
| IB2400563426 | 70 kVA (cỡ 2/2) | minDisp: null vì các giá trị khác nhau: 1.532/4.1; minCyl: null vì các giá trị khác nhau: 3/4; minPrime: null vì prime khác nhau: 65kW/genset, 65kVA/genset, 8.5kW/genset |
| IB2400589278 | 300 kVA (cỡ 1/3) | minPrime: null vì prime khác nhau: 300kVA/genset, 400kVA/engine, 450kVA/engine, 300kVA/engine |
| IB2400589278 | 400 kVA (cỡ 2/3) | minPrime: null vì prime khác nhau: 300kVA/genset, 400kVA/engine, 450kVA/engine, 300kVA/engine |
| IB2400589278 | 450 kVA (cỡ 3/3) | minPrime: null vì prime khác nhau: 300kVA/genset, 400kVA/engine, 450kVA/engine, 300kVA/engine |
| IB2400602840 | 160 kVA (cỡ 1/2) | minDisp: null vì các giá trị khác nhau: 8.071/21.927; minPrime: null vì prime khác nhau: 160kVA/genset, 800kVA/genset |
| IB2400602840 | 800 kVA (cỡ 2/2) | minDisp: null vì các giá trị khác nhau: 8.071/21.927; minPrime: null vì prime khác nhau: 160kVA/genset, 800kVA/genset |
| IB2500039578 | 550 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 2250kVA/genset, 2573kVA/alt, 2405kVA/alt, 550kVA/genset, 500kVA/genset, 500kVA/alt |
| IB2500039578 | 2500 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 2250kVA/genset, 2573kVA/alt, 2405kVA/alt, 550kVA/genset, 500kVA/genset, 500kVA/alt |
| IB2500061368 | 150 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 150kVA/genset, 155kVA/genset, 250kVA/genset, 250kVA/alt |
| IB2500061368 | 250 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 150kVA/genset, 155kVA/genset, 250kVA/genset, 250kVA/alt |
| IB2500089757 | 30 kVA (cỡ 1/3) | minDisp: null vì các giá trị khác nhau: 2.54/4.837/7.255; minCyl: null vì các giá trị khác nhau: 4/6; minPrime: null vì prime khác nhau: 30kVA/genset, 100kVA/genset, 200kVA/genset, 185kW/genset |
| IB2500089757 | 100 kVA (cỡ 2/3) | minDisp: null vì các giá trị khác nhau: 2.54/4.837/7.255; minCyl: null vì các giá trị khác nhau: 4/6; minPrime: null vì prime khác nhau: 30kVA/genset, 100kVA/genset, 200kVA/genset, 185kW/genset |
| IB2500089757 | 200 kVA (cỡ 3/3) | minDisp: null vì các giá trị khác nhau: 2.54/4.837/7.255; minCyl: null vì các giá trị khác nhau: 4/6; minPrime: null vì prime khác nhau: 30kVA/genset, 100kVA/genset, 200kVA/genset, 185kW/genset |
| IB2500152724 | 5 kW (cỡ 1/2) | minPrime: null vì prime khác nhau: 12.5kVA/genset, 13kVA/alt, 5kW/genset, 6kW/alt |
| IB2500152724 | 12.5 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 12.5kVA/genset, 13kVA/alt, 5kW/genset, 6kW/alt |
| IB2500249901 | 1000 kVA (cỡ 1/2) | minDisp: null vì các giá trị khác nhau: 40/66; minPrime: null vì prime khác nhau: 1000kVA/genset, 2000kVA/genset |
| IB2500249901 | 2000 kVA (cỡ 2/2) | minDisp: null vì các giá trị khác nhau: 40/66; minPrime: null vì prime khác nhau: 1000kVA/genset, 2000kVA/genset |
| IB2500271331 | 12 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 12kVA/genset, 15kVA/alt, 30kVA/genset, 30kVA/alt |
| IB2500271331 | 30 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 12kVA/genset, 15kVA/alt, 30kVA/genset, 30kVA/alt |
| IB2500280002 | 11 kVA (cỡ 1/2) | minDisp: null vì các giá trị khác nhau: 1.6/0.79; minPrime: null vì prime khác nhau: 15kVA/genset, 16.5kVA/genset, 12.8kW/engine, 15kVA/alt, 11kVA/genset, 12kVA/genset, 11kVA/alt |
| IB2500280002 | 15 kVA (cỡ 2/2) | minDisp: null vì các giá trị khác nhau: 1.6/0.79; minPrime: null vì prime khác nhau: 15kVA/genset, 16.5kVA/genset, 12.8kW/engine, 15kVA/alt, 11kVA/genset, 12kVA/genset, 11kVA/alt |
| IB2500287209 | 10 kVA (cỡ 1/2) | minDisp: null vì các giá trị khác nhau: 2.3/0.688; minPrime: null vì prime khác nhau: 25kVA/engine, 27kW/engine, 25kVA/alt, 10kVA/engine, 10kVA/alt |
| IB2500287209 | 25 kVA (cỡ 2/2) | minDisp: null vì các giá trị khác nhau: 2.3/0.688; minPrime: null vì prime khác nhau: 25kVA/engine, 27kW/engine, 25kVA/alt, 10kVA/engine, 10kVA/alt |
| IB2500327119 | 82.5 kVA (cỡ 1/4) | minCyl: null vì các giá trị khác nhau: 6/4; minPrime: null vì prime khác nhau: 320kVA/genset, 82.5kVA/genset, 100kVA/genset |
| IB2500327119 | 100 kVA (cỡ 2/4) | minCyl: null vì các giá trị khác nhau: 6/4; minPrime: null vì prime khác nhau: 320kVA/genset, 82.5kVA/genset, 100kVA/genset |
| IB2500327119 | 125 kVA (cỡ 3/4) | minCyl: null vì các giá trị khác nhau: 6/4; minPrime: null vì prime khác nhau: 320kVA/genset, 82.5kVA/genset, 100kVA/genset |
| IB2500327119 | 320 kVA (cỡ 4/4) | minCyl: null vì các giá trị khác nhau: 6/4; minPrime: null vì prime khác nhau: 320kVA/genset, 82.5kVA/genset, 100kVA/genset |
| IB2500337925 | 12.5 kVA (cỡ 1/2) | minDisp: null vì các giá trị khác nhau: 33/32.6; minPrime: null vì prime khác nhau: 30kVA/genset, 12.5kVA/genset |
| IB2500337925 | 30 kVA (cỡ 2/2) | minDisp: null vì các giá trị khác nhau: 33/32.6; minPrime: null vì prime khác nhau: 30kVA/genset, 12.5kVA/genset |
| IB2500385135 | 10.5 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 20kVA/genset, 17.2kW/genset, 10.5kVA/genset, 12.8kW/genset |
| IB2500385135 | 20 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 20kVA/genset, 17.2kW/genset, 10.5kVA/genset, 12.8kW/genset |
| IB2500410768 | 30 kVA (cỡ 1/3) | minDisp: null vì các giá trị khác nhau: 3.2/5.7/9.726; minCyl: null vì các giá trị khác nhau: 4/6; minPrime: null vì prime khác nhau: 30kVA/genset, 28.3kW/genset, 100kVA/genset, 95.45kW/genset, 100kVA/alt, 200kVA/genset, 185kW/genset, 200kVA/alt |
| IB2500410768 | 100 kVA (cỡ 2/3) | minDisp: null vì các giá trị khác nhau: 3.2/5.7/9.726; minCyl: null vì các giá trị khác nhau: 4/6; minPrime: null vì prime khác nhau: 30kVA/genset, 28.3kW/genset, 100kVA/genset, 95.45kW/genset, 100kVA/alt, 200kVA/genset, 185kW/genset, 200kVA/alt |
| IB2500410768 | 200 kVA (cỡ 3/3) | minDisp: null vì các giá trị khác nhau: 3.2/5.7/9.726; minCyl: null vì các giá trị khác nhau: 4/6; minPrime: null vì prime khác nhau: 30kVA/genset, 28.3kW/genset, 100kVA/genset, 95.45kW/genset, 100kVA/alt, 200kVA/genset, 185kW/genset, 200kVA/alt |
| IB2500415487 | 12.5 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 12kVA/genset, 12kVA/alt, 14.5kVA/genset, 15kVA/alt |
| IB2500415487 | 15 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 12kVA/genset, 12kVA/alt, 14.5kVA/genset, 15kVA/alt |
| IB2500460613 | 8.5 kVA (cỡ 1/2) | minDisp: null vì các giá trị khác nhau: 1.8/2.3; minPrime: null vì prime khác nhau: 8.5kVA/genset, 10kVA/alt, 12kVA/genset, 15kVA/alt |
| IB2500460613 | 12.5 kVA (cỡ 2/2) | minDisp: null vì các giá trị khác nhau: 1.8/2.3; minPrime: null vì prime khác nhau: 8.5kVA/genset, 10kVA/alt, 12kVA/genset, 15kVA/alt |
| IB2500500319 | 8.5 kVA (cỡ 1/2) | minDisp: null vì các giá trị khác nhau: 1.64/2.3; minPrime: null vì prime khác nhau: 8.5kVA/genset, 10kVA/alt, 12kVA/genset, 12kVA/alt |
| IB2500500319 | 12 kVA (cỡ 2/2) | minDisp: null vì các giá trị khác nhau: 1.64/2.3; minPrime: null vì prime khác nhau: 8.5kVA/genset, 10kVA/alt, 12kVA/genset, 12kVA/alt |
| IB2500531255 | 15 kVA (cỡ 1/2) | minDisp: null vì các giá trị khác nhau: 2.3/3.7; minPrime: null vì prime khác nhau: 15kVA/genset, 70kVA/genset |
| IB2500531255 | 70 kVA (cỡ 2/2) | minDisp: null vì các giá trị khác nhau: 2.3/3.7; minPrime: null vì prime khác nhau: 15kVA/genset, 70kVA/genset |
| IB2500533266 | 100 kVA (cỡ 1/2) | minDisp: null vì các giá trị khác nhau: 4.3/8.8; minCyl: null vì các giá trị khác nhau: 4/6; minPrime: null vì prime khác nhau: 100kVA/genset, 100kVA/alt, 250kVA/genset, 250kVA/alt |
| IB2500533266 | 250 kVA (cỡ 2/2) | minDisp: null vì các giá trị khác nhau: 4.3/8.8; minCyl: null vì các giá trị khác nhau: 4/6; minPrime: null vì prime khác nhau: 100kVA/genset, 100kVA/alt, 250kVA/genset, 250kVA/alt |
| IB2500597081 | 80 kVA (cỡ 1/2) | minDisp: null vì các giá trị khác nhau: 11/3.9; minCyl: null vì các giá trị khác nhau: 6/4; minPrime: null vì prime khác nhau: 300kVA/genset, 80kVA/genset |
| IB2500597081 | 300 kVA (cỡ 2/2) | minDisp: null vì các giá trị khác nhau: 11/3.9; minCyl: null vì các giá trị khác nhau: 6/4; minPrime: null vì prime khác nhau: 300kVA/genset, 80kVA/genset |
| IB2500598824 | 12 kVA (cỡ 1/3) | minCyl: null vì các giá trị khác nhau: 2/10/3; minPrime: null vì prime khác nhau: 15kVA/genset, 30kVA/genset |
| IB2500598824 | 15 kVA (cỡ 2/3) | minCyl: null vì các giá trị khác nhau: 2/10/3; minPrime: null vì prime khác nhau: 15kVA/genset, 30kVA/genset |
| IB2500598824 | 30 kVA (cỡ 3/3) | minCyl: null vì các giá trị khác nhau: 2/10/3; minPrime: null vì prime khác nhau: 15kVA/genset, 30kVA/genset |
| IB2600027651 | 20 kVA (cỡ 1/2) | minCyl: null vì các giá trị khác nhau: 2/3/10/5 |
| IB2600027651 | 60 kVA (cỡ 2/2) | minCyl: null vì các giá trị khác nhau: 2/3/10/5 |
| IB2600046158 | 150 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 500kVA/genset, 500kVA/alt, 150kVA/genset, 150kVA/alt |
| IB2600046158 | 500 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 500kVA/genset, 500kVA/alt, 150kVA/genset, 150kVA/alt |
| IB2600075436 | 100 kVA (cỡ 1/2) | minDisp: null vì các giá trị khác nhau: 4.3/8.8; minCyl: null vì các giá trị khác nhau: 4/6; minPrime: null vì prime khác nhau: 100kVA/genset, 200kVA/genset, 205kVA/genset |
| IB2600075436 | 200 kVA (cỡ 2/2) | minDisp: null vì các giá trị khác nhau: 4.3/8.8; minCyl: null vì các giá trị khác nhau: 4/6; minPrime: null vì prime khác nhau: 100kVA/genset, 200kVA/genset, 205kVA/genset |
| IB2600098464 | 320 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 400kVA/genset, 320kVA/genset |
| IB2600098464 | 400 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 400kVA/genset, 320kVA/genset |
| IB2600112737 | 100 kVA (cỡ 1/2) | minDisp: null vì các giá trị khác nhau: 4.3/8.8; minCyl: null vì các giá trị khác nhau: 4/6; minPrime: null vì prime khác nhau: 100kVA/genset, 200kVA/genset, 205kVA/genset |
| IB2600112737 | 200 kVA (cỡ 2/2) | minDisp: null vì các giá trị khác nhau: 4.3/8.8; minCyl: null vì các giá trị khác nhau: 4/6; minPrime: null vì prime khác nhau: 100kVA/genset, 200kVA/genset, 205kVA/genset |
| IB2600128010 | 250 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 250kVA/genset, 250kVA/engine, 250kVA/alt, 500kVA/genset, 500kVA/engine, 500kVA/alt |
| IB2600128010 | 500 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 250kVA/genset, 250kVA/engine, 250kVA/alt, 500kVA/genset, 500kVA/engine, 500kVA/alt |
| IB2600164177 | 125 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 160kVA/genset, 125kVA/genset |
| IB2600164177 | 160 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 160kVA/genset, 125kVA/genset |
| IB2600327799 | 100 kVA (cỡ 1/3) | minDisp: null vì các giá trị khác nhau: 8.9/8.8/4.3; minCyl: null vì các giá trị khác nhau: 6/4; minPrime: null vì prime khác nhau: 300kVA/genset, 300kW/engine, 300kVA/alt, 205kVA/alt, 100kVA/alt |
| IB2600327799 | 200 kVA (cỡ 2/3) | minDisp: null vì các giá trị khác nhau: 8.9/8.8/4.3; minCyl: null vì các giá trị khác nhau: 6/4; minPrime: null vì prime khác nhau: 300kVA/genset, 300kW/engine, 300kVA/alt, 205kVA/alt, 100kVA/alt |
| IB2600327799 | 300 kVA (cỡ 3/3) | minDisp: null vì các giá trị khác nhau: 8.9/8.8/4.3; minCyl: null vì các giá trị khác nhau: 6/4; minPrime: null vì prime khác nhau: 300kVA/genset, 300kW/engine, 300kVA/alt, 205kVA/alt, 100kVA/alt |
| IB2600334541 | 250 kVA (cỡ 1/2) | minPrime: null vì prime khác nhau: 250kVA/genset, 250kVA/engine, 250kVA/alt, 500kVA/genset, 500kVA/engine |
| IB2600334541 | 500 kVA (cỡ 2/2) | minPrime: null vì prime khác nhau: 250kVA/genset, 250kVA/engine, 250kVA/alt, 500kVA/genset, 500kVA/engine |
| IB2600477305 | 12.5 kVA (cỡ 1/2) | minCyl: null vì các giá trị khác nhau: 3/4; minPrime: null vì prime khác nhau: 12kVA/genset, 12kVA/alt, 14.5kVA/genset, 15kVA/alt |
| IB2600477305 | 15 kVA (cỡ 2/2) | minCyl: null vì các giá trị khác nhau: 3/4; minPrime: null vì prime khác nhau: 12kVA/genset, 12kVA/alt, 14.5kVA/genset, 15kVA/alt |

## Nghi nhận ngưỡng của cỡ khác (đã chạy lại với ngưỡng sửa tay, xem báo cáo)

| gói | cỡ | nghi |
|---|---|---|
| IB2400030247 | 50 kVA | minPrime {"kVA":60,"kW":48} lệch cỡ 50 kVA |
| IB2400114476 | 12 kVA | maxDisp 1.826 nhưng HSMT còn dung tích tối thiểu 4.5 |
| IB2400114476 | 45 kVA | minDisp 4.5 nhưng HSMT còn dung tích tối đa 1.826 |
| IB2400311120 | 12 kVA | maxDisp 1.826 nhưng HSMT còn dung tích tối thiểu 3.3/4.5 |
| IB2400311120 | 30 kVA | maxDisp 1.826 nhưng HSMT còn dung tích tối thiểu 3.3/4.5 |
| IB2400311120 | 45 kVA | maxDisp 1.826 nhưng HSMT còn dung tích tối thiểu 3.3/4.5 |
| IB2400487460 | 8.8 kVA | minDisp 3.9 nhưng HSMT còn dung tích tối đa 2.3 |
| IB2400487460 | 40 kVA | minDisp 3.9 nhưng HSMT còn dung tích tối đa 2.3 |