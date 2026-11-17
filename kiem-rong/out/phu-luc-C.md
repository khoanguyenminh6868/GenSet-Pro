# Phụ lục C: cỡ thiếu ứng viên (mục 3)

Cột: `cũ` = số dòng trong dải 95–140% (trước khi loại theo ngưỡng, đếm bằng bộ lọc đầu của `candidates()`); `mới` = số dòng trong dải 99,5–120% (trước khi loại); `sau` = số dòng còn xếp hạng sau khi loại theo ngưỡng HSMT (`rows`); `top` = số dòng trong 30 dòng ứng viên. 'gần nhất' = tỉ lệ công suất của dòng gần dải nhất ở dưới / trên dải (1,25 = 125% cỡ).

## C1. Cỡ có ứng viên ở dải cũ mà dải mới (sau ngưỡng) < 5 dòng: 56 lượt

| gói | nguồn | cỡ | cũ | mới | sau | top | gần nhất dưới / trên | bị loại (disp/maxDisp/cyl/prime) | nguyên nhân | ngưỡng HSMT |
|---|---|---|---|---|---|---|---|---|---|---|
| IB2300173662 | hc243 8cỡ | 2 kVA | 8 | 4 | 4 | 3 | 0.938 / 1.25 | 0/0/0/0 | dải | — |
| IB2200066148 | hc243 2cỡ | 3 kVA | 39 | 1 | 1 | 1 | 0.9 / 1.25 | 0/0/0/0 | dải | — |
| IB2200006257 | hc243 2cỡ | 3 kVA | 39 | 1 | 1 | 1 | 0.9 / 1.25 | 0/0/0/0 | dải | minCyl=1 |
| IB2300150966 | specs | 3 kVA | 39 | 1 | 1 | 1 | 0.9 / 1.25 | 0/0/0/0 | dải | — |
| IB2600545098 | specs | 4.5 kVA | 1 | 1 | 1 | 1 | — / 1.222 | 0/0/0/0 | dải | — |
| IB2300249535 | specs | 5 kVA | 1 | 1 | 1 | 1 | — / 1.5 | 0/0/0/0 | dải | — |
| IB2300223728 | specs | 5 kVA | 1 | 1 | 1 | 1 | — / 1.5 | 0/0/0/0 | dải | — |
| IB2400186078 | hc243 2cỡ | 6 kVA | 1 | 0 | 0 | 0 | 0.917 / 1.25 | 0/0/0/0 | dải | minDisp=0.499, minCyl=1 |
| IB2400365165 | hc243 2cỡ | 7.2 kVA | 5 | 3 | 3 | 3 | 0.764 / 1.306 | 0/0/0/0 | dải | — |
| IB2400317224 | specs | 8 kVA | 6 | 3 | 2 | 2 | 0.938 / 1.25 | 0/0/0/1 | dải | minDisp=1.6, minCyl=3, minPrime=8.5kVA |
| IB2500376934 | specs | 8.5 kVA | 6 | 4 | 4 | 4 | 0.965 / 1.235 | 0/0/0/0 | dải | minCyl=3, minPrime=8.5kVA |
| IB2500500319 | hc243 2cỡ | 8.5 kVA | 6 | 4 | 4 | 4 | 0.965 / 1.235 | 0/0/0/0 | dải | — |
| IB2600307179 | specs | 8.5 kVA | 6 | 4 | 4 | 4 | 0.965 / 1.235 | 0/0/0/0 | dải | minPrime=8.5kVA |
| IB2500480924 | specs | 8.5 kVA | 6 | 4 | 4 | 4 | 0.965 / 1.235 | 0/0/0/0 | dải | minCyl=3, minPrime=8.5kVA |
| IB2500460613 | hc243 2cỡ | 8.5 kVA | 6 | 4 | 4 | 4 | 0.965 / 1.235 | 0/0/0/0 | dải | — |
| IB2400127023 | specs | 8.5 kVA | 6 | 4 | 4 | 4 | 0.965 / 1.235 | 0/0/0/0 | dải | minCyl=3, minPrime=8.5kVA |
| IB2400457172 | specs | 8.5 kVA | 6 | 4 | 3 | 3 | 0.965 / 1.235 | 1/0/0/0 | dải | minDisp=2.3, minCyl=3, minPrime=8.5kVA |
| IB2500314001 | specs | 8.5 kVA | 6 | 4 | 4 | 4 | 0.965 / 1.235 | 0/0/0/0 | dải | minCyl=3, minPrime=8.5kVA |
| IB2600280799 | specs | 8.5 kVA | 6 | 4 | 4 | 4 | 0.965 / 1.235 | 0/0/0/0 | dải | minCyl=3, minPrime=8.5kVA |
| IB2300236743 | hc243 2cỡ | 10 kVA | 6 | 3 | 3 | 3 | 0.94 / 1.3 | 0/0/0/0 | dải | minCyl=4 |
| IB2500280002 | hc243 2cỡ | 11 kVA | 9 | 4 | 4 | 4 | 0.955 / 1.273 | 0/0/0/0 | dải | minCyl=2 |
| IB2500571943 | specs | 12 kVA | 7 | 4 | 3 | 2 | 0.917 / 1.25 | 0/0/0/1 | dải | minPrime=12kVA/12kW |
| IB2200008717 | specs | 12 kVA | 7 | 4 | 3 | 2 | 0.917 / 1.25 | 0/0/0/1 | dải | maxDisp=1.826, minCyl=3, minPrime=12kVA/12kW |
| IB2500471911 | specs | 12 kVA | 7 | 4 | 1 | 1 | 0.917 / 1.25 | 2/0/0/1 | dải | minDisp=2.3, minPrime=12kVA/12kW |
| IB2500118283 | specs | 12 kVA | 7 | 4 | 3 | 2 | 0.917 / 1.25 | 0/0/0/1 | dải | minCyl=3, minPrime=12kVA |
| IB2500498331 | specs | 12 kVA | 7 | 4 | 4 | 3 | 0.917 / 1.25 | 0/0/0/0 | dải | — |
| IB2500118294 | specs | 12 kVA | 7 | 4 | 3 | 2 | 0.917 / 1.25 | 0/0/0/1 | dải | minCyl=3, minPrime=12kVA |
| IB2600588204 | specs | 12 kVA | 7 | 4 | 1 | 1 | 0.917 / 1.25 | 2/0/0/1 | dải | minDisp=2.3, minPrime=12kVA |
| IB2500500319 | hc243 2cỡ | 12 kVA | 7 | 4 | 4 | 3 | 0.917 / 1.25 | 0/0/0/0 | dải | — |
| IB2500118275 | specs | 12 kVA | 7 | 4 | 3 | 2 | 0.917 / 1.25 | 0/0/0/1 | dải | minCyl=3, minPrime=12kVA |
| IB2400473260 | specs | 12 kVA | 7 | 4 | 3 | 2 | 0.917 / 1.25 | 0/0/0/1 | dải | minPrime=12kVA/12kW |
| IB2500323621 | specs | 12 kVA | 7 | 4 | 3 | 2 | 0.917 / 1.25 | 0/0/0/1 | dải | maxDisp=1.826, minCyl=3, minPrime=12kVA |
| IB2400186078 | hc243 2cỡ | 12 kVA | 7 | 4 | 4 | 3 | 0.917 / 1.25 | 0/0/0/0 | dải | minDisp=0.499, minCyl=1 |
| IB2400514819 | specs | 12 kVA | 7 | 4 | 3 | 2 | 0.917 / 1.25 | 0/0/0/1 | dải | minPrime=12kVA/12kW |
| IB2500271331 | hc243 2cỡ | 12 kVA | 7 | 4 | 4 | 3 | 0.917 / 1.25 | 0/0/0/0 | dải | — |
| IB2500198459 | specs | 12 kVA | 7 | 4 | 1 | 1 | 0.917 / 1.25 | 2/0/0/1 | dải | minDisp=2.3, minCyl=3, minPrime=12kVA/12kW |
| IB2300292168 | specs | 12 kVA | 7 | 4 | 4 | 3 | 0.917 / 1.25 | 0/0/0/0 | dải | minCyl=3 |
| IB2400257256 | specs | 12 kVA | 7 | 4 | 1 | 1 | 0.917 / 1.25 | 2/0/0/1 | dải | minDisp=2.3, minCyl=4, minPrime=12kVA |
| IB2500598824 | hc243 3cỡ | 12 kVA | 7 | 4 | 4 | 3 | 0.917 / 1.25 | 0/0/0/0 | dải | — |
| IB2500419471 | specs | 12 kVA | 7 | 4 | 3 | 2 | 0.917 / 1.25 | 0/0/0/1 | dải | minPrime=12kVA |
| IB2500189560 | specs | 12.5 kVA | 7 | 6 | 1 | 1 | 0.96 / 1.232 | 5/0/0/0 | ngưỡng | minDisp=2.3, minPrime=12.5kVA |
| IB2400542354 | specs | 12.5 kVA | 7 | 6 | 1 | 1 | 0.96 / 1.232 | 5/0/0/0 | ngưỡng | minDisp=2.3, minPrime=12.5kVA |
| IB2400311574 | specs | 12.5 kVA | 7 | 6 | 1 | 1 | 0.96 / 1.232 | 5/0/0/0 | ngưỡng | minDisp=2.3, minCyl=4, minPrime=12.5kVA |
| IB2400531851 | specs | 12.5 kVA | 7 | 6 | 1 | 1 | 0.96 / 1.232 | 5/0/0/0 | ngưỡng | minDisp=2.3, minPrime=12.5kVA |
| IB2500476713 | specs | 13 kVA | 8 | 6 | 1 | 1 | 0.923 / 1.269 | 5/0/0/0 | ngưỡng | minDisp=2.3, minPrime=13kVA |
| IB2500211376 | specs | 15 kVA | 11 | 7 | 2 | 2 | 0.953 / 1.32 | 5/0/0/0 | ngưỡng | minDisp=2.43 |
| IB2500084609 | specs | 15 kVA | 11 | 7 | 2 | 2 | 0.953 / 1.32 | 5/0/0/0 | ngưỡng | minDisp=2.43 |
| IB2500498271 | specs | 15 kVA | 11 | 7 | 2 | 2 | 0.953 / 1.32 | 5/0/0/2 | ngưỡng | minDisp=2.3, minPrime=15kVA |
| IB2400482562 | specs | 23 kVA | 10 | 3 | 3 | 3 | 0.957 / 1.304 | 0/0/0/0 | dải | minCyl=4, minPrime=23kVA |
| IB2300266461 | specs | 40 kVA | 12 | 8 | 3 | 3 | 0.963 / 1.238 | 2/0/2/3 | ngưỡng | minDisp=3.75, minCyl=4, minPrime=42kVA |
| IB2600243028 | specs | 800 kVA | 24 | 15 | 3 | 3 | 0.963 / 1.238 | 8/0/8/5 | ngưỡng | minDisp=29.6, minCyl=12, minPrime=800kVA/640kW |
| IB2400475109 | specs | 1000 kVA | 20 | 10 | 4 | 3 | 0.99 / 1.25 | 0/0/4/2 | ngưỡng | minCyl=12, minPrime=1000kVA |
| IB2400446772 | specs | 1000 kVA | 20 | 10 | 4 | 3 | 0.99 / 1.25 | 0/0/4/2 | ngưỡng | minCyl=12, minPrime=1000kVA |
| IB2500381511 | specs | 2573 kVA | 9 | 4 | 4 | 4 | 0.972 / — | 0/0/0/0 | dải | minDisp=60.2 |
| IB2600304011 | specs | 2400 kW | 2 | 2 | 0 | 0 | 0.933 / — | 0/0/0/2 | dải | minPrime=2400kW |
| IB2600126365 | specs | 2400 kW | 2 | 2 | 0 | 0 | 0.933 / — | 0/0/0/2 | dải | minPrime=2400kW |

## C2. Cỡ có top = 0: 25 lượt

| gói | cỡ | cũ | mới | sau | gần nhất dưới / trên | ghi chú |
|---|---|---|---|---|---|---|
| IB2400121273 | 0.5 kVA | 0 | 0 | 0 | — / 3.75 | catalog không có dòng nào trong dải |
| IB2400186078 | 6 kVA | 1 | 0 | 0 | 0.917 / 1.25 | catalog không có dòng nào trong dải |
| IB2600304011 | 2400 kW | 2 | 2 | 0 | 0.933 / — | mọi dòng trong dải bị loại theo ngưỡng |
| IB2600126365 | 2400 kW | 2 | 2 | 0 | 0.933 / — | mọi dòng trong dải bị loại theo ngưỡng |
| IB2600325773 | 4000 kVA | 0 | 0 | 0 | 0.77 / — | catalog không có dòng nào trong dải |
| IB2300042764 | 7500 kVA | 0 | 0 | 0 | 0.667 / 2.25 | catalog không có dòng nào trong dải |
| IB2400248480 | 7500 kVA | 0 | 0 | 0 | 0.667 / 2.25 | catalog không có dòng nào trong dải |
| IB2300030459 | 7500 kVA | 0 | 0 | 0 | 0.667 / 2.25 | catalog không có dòng nào trong dải |
| IB2500027056 | 10000 kVA | 0 | 0 | 0 | 0.5 / 1.688 | catalog không có dòng nào trong dải |
| IB2500344870 | 32000 kW | 0 | 0 | 0 | 0.5 / — | công suất đọc sai / ngoài catalog (HSMT không phải mua một tổ máy cỡ đó) |
| IB2300059621 | 47000 kVA | 0 | 0 | 0 | 0.439 / — | công suất đọc sai / ngoài catalog (HSMT không phải mua một tổ máy cỡ đó) |
| IB2500344109 | 141200 kVA | 0 | 0 | 0 | 0.146 / — | công suất đọc sai / ngoài catalog (HSMT không phải mua một tổ máy cỡ đó) |
| IB2600157125 | 141200 kVA | 0 | 0 | 0 | 0.146 / — | công suất đọc sai / ngoài catalog (HSMT không phải mua một tổ máy cỡ đó) |
| IB2300305637 | 120000 kW | 0 | 0 | 0 | 0.133 / — | công suất đọc sai / ngoài catalog (HSMT không phải mua một tổ máy cỡ đó) |
| IB2400168837 | 120000 kW | 0 | 0 | 0 | 0.133 / — | công suất đọc sai / ngoài catalog (HSMT không phải mua một tổ máy cỡ đó) |
| IB2200061557 | 120000 kW | 0 | 0 | 0 | 0.133 / — | công suất đọc sai / ngoài catalog (HSMT không phải mua một tổ máy cỡ đó) |
| IB2400289478 | 277000 kVA | 0 | 0 | 0 | 0.075 / — | công suất đọc sai / ngoài catalog (HSMT không phải mua một tổ máy cỡ đó) |
| IB2500412991 | 277000 kVA | 0 | 0 | 0 | 0.075 / — | công suất đọc sai / ngoài catalog (HSMT không phải mua một tổ máy cỡ đó) |
| IB2600241796 | 299000 kVA | 0 | 0 | 0 | 0.069 / — | công suất đọc sai / ngoài catalog (HSMT không phải mua một tổ máy cỡ đó) |
| IB2400289478 | 356000 kVA | 0 | 0 | 0 | 0.058 / — | công suất đọc sai / ngoài catalog (HSMT không phải mua một tổ máy cỡ đó) |
| IB2600413498 | 300000 kW | 0 | 0 | 0 | 0.053 / — | công suất đọc sai / ngoài catalog (HSMT không phải mua một tổ máy cỡ đó) |
| IB2600152962 | 300000 kW | 0 | 0 | 0 | 0.053 / — | công suất đọc sai / ngoài catalog (HSMT không phải mua một tổ máy cỡ đó) |
| IB2500404441 | 300000 kW | 0 | 0 | 0 | 0.053 / — | công suất đọc sai / ngoài catalog (HSMT không phải mua một tổ máy cỡ đó) |
| IB2400152756 | 300000 kW | 0 | 0 | 0 | 0.053 / — | công suất đọc sai / ngoài catalog (HSMT không phải mua một tổ máy cỡ đó) |
| IB2500412991 | 300000 kW | 0 | 0 | 0 | 0.053 / — | công suất đọc sai / ngoài catalog (HSMT không phải mua một tổ máy cỡ đó) |

## C3. Dải mới giữ < 30% số dòng của dải cũ: 26 lượt

IB2200066148 3kVA (39→1); IB2200006257 3kVA (39→1); IB2300150966 3kVA (39→1); IB2400186078 6kVA (1→0); IB2500152724 5kW (127→37); IB2300371415 5kW (127→37); IB2300363623 5kW (127→37); IB2500144659 6.5kVA (106→14); IB2400426562 6.5kVA (125→18); IB2400281588 6.5kVA (126→19); IB2300320688 6.5kVA (122→17); IB2400281653 6.5kVA (126→19); IB2200062524 6.5kVA (122→17); IB2400161234 6.5kVA (126→19); IB2300228168 6.5kVA (122→17); IB2400099464 6.5kVA (122→17); IB2600133589 5.5kW (137→38); IB2400315025 7kVA (118→30); IB2200083564 7kVA (118→30); IB2400145438 7kVA (118→30); IB2400508791 7kVA (98→24); IB2400355977 7kVA (118→30); IB2400514548 7kVA (118→30); IB2400453417 7kVA (118→30); IB2300305914 7.2kVA (177→28); IB2500114642 10.4kVA (348→92)

## C4. Gói không đọc được cỡ (capacity() / sizesOf() không ra): 95 gói

IB2600599817, IB2600041358, IB2300155943, IB2300329294, IB2200043247, IB2400615261, IB2500197652, IB2300320471, IB2200074959, IB2200042913, IB2400198330, IB2500306469, IB2300312898, IB2400429896, IB2300093791, IB2300155747, IB2400323739, IB2300097515, IB2300061020, IB2500598996, IB2600561006, IB2300123566, IB2500461166, IB2400077583, IB2500234478, IB2600362632, IB2300119201, IB2400348479, IB2200091298, IB2400554981, IB2500182452, IB2500397707, IB2300104337, IB2300294855, IB2400142224, IB2300123564, IB2400219443, IB2400270596, IB2500318194, IB2300377840, IB2300114249, IB2400324041, IB2400093765, IB2400113937, IB2200087056, IB2400486524, IB2400454375, IB2400078617, IB2200014576, IB2500335504, IB2400032948, IB2300123560, IB2400187931, IB2600121532, IB2300147415, IB2200088091, IB2500085435, IB2400188399, IB2300270603, IB2500129768, IB2300262487, IB2300285520, IB2400276301, IB2300324990, IB2400302325, IB2300249323, IB2400349473, IB2500239478, IB2500551987, IB2300036584, IB2500246452, IB2400257226, IB2300099851, IB2300256190, IB2300029269, IB2400511920, IB2300310408, IB2300213569, IB2500025236, IB2300102683, IB2300160062, IB2600210926, IB2600137973, IB2400479634, IB2400452091, IB2400436205, IB2500311404, IB2300203745, IB2400449941, IB2600310248, IB2400052099, IB2600595936, IB2200082761, IB2200018116, IB2600199641