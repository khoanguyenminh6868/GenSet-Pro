// node --test suppliers/bo-o-lech-126.test.mjs — bo-o-lech-126 (Khoa 24/11/2026 "bỏ ô lệch, không sửa thành số khác"): 126 ca hình học tự mâu thuẫn
// (105 ca loại 2 + 21 ca L3-1 của loại 3, trừ 4 ca 6LTAA9.5-G1) → `dropspec` theo dòng. Mỗi ca là dòng thật trong suppliers/cn.
// Bản ghi động cơ của dòng mất đúng các ô lệch (xi lanh / đường kính × hành trình / dung tích), giữ phần còn lại; ca ngoài danh sách không đổi.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import "../web/conversions.js";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const real = (id) => JSON.parse(fs.readFileSync(new URL(`./cn/${id}.json`, import.meta.url), "utf8"));
const cache = new Map();
const recs = (id) => { if (!cache.has(id)) cache.set(id, C.fromSupplier(real(id))); return cache.get(id); };
const norm = (s) => String(s ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
// ncc, n, model động cơ, ô bỏ (cyl / bore / disp), dòng nguồn nguyên văn
const CASES = [
  ["depco-power",2616,"1103A-33G","disp","| Governor | Mechanical | Displacement(L) | 2.216"],
  ["depco-power",2636,"4006-23TAG3A","cyl","| Cylinder | 8L | Cooling system | Water"],
  ["depco-power",2635,"4008-TAG1A","disp","| Governor | Electrical | Displacement(L) | 22.92"],
  ["depco-power",2443,"4016TAG1A","disp","| Governor | Electrical | Displacement(L) | 45.842"],
  ["depco-power",2644,"403A-15G1","cyl","| Cylinder | 4 | Cooling system | Water"],
  ["depco-power",2643,"403A-15G2","cyl","| Cylinder | 4 | Cooling system | Water"],
  ["depco-power",2441,"403D-11G","cyl","| Cylinder | 4 | Cooling system | Water"],
  ["depco-power",2440,"403D-15G","cyl","| Cylinder | 4 | Cooling system | Water"],
  ["depco-power",2641,"403D-15G","cyl","| Cylinder | 4 | Cooling system | Water"],
  ["depco-power",2077,"6M33D572E200","bore","| Cylider arrangemant | IN-LINE | Bore and Stroke(mm) | 127 X 165"],
  ["depco-power",2385,"6M33G660/6","cyl","| Cylinder | 12 | Cooling system | Water"],
  ["depco-power",2347,"BF4M2012","bore","| Cylider arrangemant | IN-LINE | Bore and Stroke(mm) | 98 X 105"],
  ["depco-power",2367,"BF6M1015C-LA G1A","bore","| Cylider arrangemant | IN-LINE | Bore and Stroke(mm) | 110 X 136"],
  ["depco-power",2359,"BF8M1015C-LA G2","cyl","| Cylinder | 6 | Cooling system | Water"],
  ["depco-power",2356,"BF8M1015CP-LA G3","cyl","| Cylinder | 6 | Cooling system | Water"],
  ["depco-power",2190,"DP086TA","disp","| Governor | Electrical | Displacement(L) | 9.1"],
  ["depco-power",2217,"SC10E380D2","disp","| Governor | Electrical | Displacement(L) | 11.8"],
  ["depco-power",2023,"WP10D238E201","cyl","| Cylinder | 4 | Cooling system | Water"],
  ["depco-power",2022,"WP10D264E201","cyl","| Cylinder | 4 | Cooling system | Water"],
  ["depco-power",2021,"WP10D288E201","cyl","| Cylinder | 4 | Cooling system | Water"],
  ["depco-power",2019,"WP13D385E201","cyl","| Cylinder | 4 | Cooling system | Water"],
  ["depco-power",2017,"WP13D510E311","cyl","| Cylinder | 4 | Cooling system | Water"],
  ["depco-power",2018,"WP13D510E311","cyl","| Cylinder | 4 | Cooling system | Water"],
  ["depco-power",2027,"WP6D132E201","cyl","| Cylinder | 4 | Cooling system | Water"],
  ["depco-power",2026,"WP6D158E201","cyl","| Cylinder | 4 | Cooling system | Water"],
  ["depco-power",2025,"WP6D180E201","cyl","| Cylinder | 4 | Cooling system | Water"],
  ["haifeng-taizhou",2010,"16M33D1580E310","bore+disp","| HF-1400GF | 1750 | 1400 | 16M33D1580E310 | 16V | 180/215 | 65.65 | 185 | 7210*2250*2450 | 11000"],
  ["haifeng-taizhou",2010,"16M33D1680E310","bore+disp","| HF-1500GF | 1875 | 1500 | 16M33D1680E310 | 16V | 180/215 | 65.65 | 185 | 7210*2250*2450 | 11000"],
  ["haifeng-taizhou",2010,"WP2.3D25E200","bore","| HF-20GF | 25 | 20 | WP2.3D25E200 | 4L | 90/100 | 2.3 | 235 | 1550*630*1100 | 660"],
  ["hanyang-weifang",125,"4HTAA4.3-G36","cyl","| HY-120 | 4HTAA4.3-G36 | 125 | 140 | 6 | 105*124 | 4.3 | 192 | 1800*600*1200 | 1100 | T3"],
  ["hanyang-weifang",102,"6ZTAA13-G4","bore","| HY-400 | 6ZTAA13-G4 | 400 | 415 | 6 | 114*145 | 13 | 202 | 2900*1200*1750 | 3000 | T2"],
  ["hanyang-weifang",125,"SC15G500D2","bore","| HY-300 | SC15G500D2 | 339 | 373 | 6 | 135*150 | 14.2 | 202 | 3100*1250*1750 | 2900 | T2"],
  ["hanyang-weifang",107,"YC4A180L-D20","bore","| HY-100 | YC4A180L-D20 | 120 | 132 | 4 | 108*115 | 4.84 | 208 | 2300*900*1500 | 1500 | T2"],
  ["hanyang-weifang",107,"YC6A245L-D21","bore","| HY-150 | YC6A245L-D21 | 165 | 181 | 6 | 108*115 | 7.25 | 211 | 2300*900*1500 | 2200 | T2"],
  ["hanyang-weifang",107,"YC6B180L-D20","bore","| HY-120 | YC6B180L-D20 | 120 | 132 | 6 | 108*115 | 6.87 | 203 | 2300*900*1500 | 1600 | T2"],
  ["hanyang-weifang",107,"YC6B205L-D20","bore","| HY-120 | YC6B205L-D20 | 138 | 152 | 6 | 108*115 | 6.87 | 198 | 2300*900*1500 | 1850 | T2"],
  ["jet-power",135,"WP2.3D33E200","bore+disp","| WP-28 | 27.5 | 22 | 25 | 20 | WP2.3D33E200 | 4L | Mechanical | 102×118 | 2.5 | 5 | JET184FS"],
  ["jet-power",135,"WP2.3D33E200","bore+disp","| WP-33 | 33 | 26.4 | 30 | 24 | WP2.3D33E200 | 4L | Mechanical | 102×118 | 2.5 | 6 | JET184G"],
  ["jet-power",135,"WP2.3D40E200","bore+disp","| WP-41 | 41 | 33 | 37.5 | 30 | WP2.3D40E200 | 4L | Mechanical | 105×125 | 2.5 | 7.5 | JET184H"],
  ["jet-power",135,"WP2.3D48E200","bore+disp","| WP-50 | 50 | 40 | 45 | 36 | WP2.3D48E200 | 4L | Mechanical | 105×125 | 2.5 | 8.5 | JET224C"],
  ["kangwo-guangdong",102,"SC13G420D2","bore","| GKW-250GF | 250 | 375 | 450 | SC13G420D2 | 6 | 128*153 | 12.88 | 200 | 3000*1300*1800 | 2800 | 获取"],
  ["kangwo-guangdong",102,"SC13G420D2","bore","| GKW-300GF | 300 | 375 | 540 | SC13G420D2 | 6 | 135*165 | 12.88 | 200 | 3000*1300*1800 | 2800 | 获取"],
  ["kangwo-guangdong",102,"SC15G500D2","bore","| GKW-320GF | 320 | 400 | 576 | SC15G500D2 | 6 | 135*150 | 14.16 | 200 | 3200*1350*1950 | 3500 | 获取"],
  ["kangwo-guangdong",102,"SC15G500D2","bore","| GKW-350GF | 350 | 437.5 | 630 | SC15G500D2 | 6 | 135*150 | 14.16 | 200 | 3200*1350*1950 | 3500 | 获取"],
  ["kangwo-guangdong",102,"SC25G690D2","bore+disp","| GKW-450GF | 450 | 562.5 | 810 | SC25G690D2 | 12 | 135*155 | 16.8 | 202 | 3500*1500*1950 | 4500 | 获取"],
  ["kangwo-guangdong",102,"SC8D280D2","bore","| GKW-180GF | 180 | 225 | 324 | SC8D280D2 | 6 | 114*144 | 8.27 | 200 | 2600*1050*1600 | 2400 | 获取"],
  ["kangwo-guangdong",102,"SC9D340D2","bore","| GKW-220GF | 220 | 275 | 396 | SC9D340D2 | 6 | 135*150 | 8.82 | 195 | 3000*1200*1800 | 2600 | 获取"],
  ["kangwo-guangdong",103,"WP4D100E200","bore","| GKW-90GF | 90 | 112.5 | 162 | WP4D100E200 | 4 | 105*118 | 4.5 | 201 | 2200*800*1340 | 1250 | 获取"],
  ["aosif",1114,"P086TI","cyl","| No. of cylinder | 4"],
  ["aosif",1112,"P086TI-1","cyl","| No. of cylinder | 4"],
  ["cldj-fujian",101,"SC33W990D2","bore","| CLS-825 | 660/825 | 1188 | CLG-634B | SC33W990D2 | 180*315 | 6 | 75 | 205 | 32.8 | 4100 | 3800*2000*2200"],
  ["fukangsi-yangzhou",2002,"YC6C1070L-D20","cyl","| FKS-Y700 | 700/875 | 广西玉柴股份 | YC6C1070L-D20 | 12 | 39.58 | 180 | 200*210 | 4700*1800*2100 | 7200"],
  ["fukangsi-yangzhou",2002,"YC6K600-D30","bore","| FKS-Y350 | 350/437.5 | 广西玉柴股份 | YC6K600-D30 | 6 | 12.94 | 36 | 129*155 | 3100*1300*1900 | 3300"],
  ["huatai-yangzhou",105,"YC6MJ480L-D20","bore","| 300GF | 300 | YC6MJ480L-D20 | 6L | 123/145 | 11.72 | 28 | 2900 | 3050*1200*1850"],
  ["huipu-power",103,"KTA50-G3","cyl","| HP-C1100 | 1000 | 1100 | KTA50-G3 | 12 | 159*159 | 50 | 261 | 424 | 177 | 5105*2120*2260 | 9099"],
  ["huipu-power",104,"WP4D108E200","cyl","| HP-W90 | 80 | 90 | WP4D108E200 | 6 | 105*130 | 4.5 | 18.75 | 120 | 12 | 2100*920*1500 | 1195"],
  ["jianghao-genset",101,"404D-22TG","disp","| JHP-25GF | 31.25 | 25 | 404D-22TG | 4 | 84*100 | 22 | 10.6 | 233 | 1550*710*1100 | 550"],
  ["jianghao-genset",106,"DP126LB","bore+disp","| JHD-350GF | 437.5 | 350 | DP126LB | 6L | 128*142 | 14.6 | 33 | 232 | 3100*1050*1650mm | 2700"],
  ["jlmech-wuhan",101,"WP4D100E200","bore","| JL-90GF | 90 | 112.5 | 162 | WP4D100E200 | 4 | 105*118 | 4.5 | 13 | 201"],
  ["kanpor-fuan",102,"6LTAA8.9-G3","bore","| 缸径*行程 | mm*mm | 114×135 | 114×135 | 140×152 | 140×152 | 125×147"],
  ["pengpai-yangzhou",129,"YC6C1070L-D20","cyl","| PPDL-Y700 | 700/875 | 广西玉柴股份 | YC6C1070L-D20 | 12 | 39.58 | 180 | 200*210 | 4700*1800*2100 | 7200"],
  ["pengpai-yangzhou",129,"YC6K600-D30","bore","| PPDL-Y350 | 350/437.5 | 广西玉柴股份 | YC6K600-D30 | 6 | 12.94 | 36 | 129*155 | 3100*1300*1900 | 3300"],
  ["powerpack",217,"Y4105D","disp","| Displacement | lt | 4,33"],
  ["sunkings",115,"QSK60-G3","bore","| SCF-1675 | 1350 | 1688 | 1500 | 1875 | QSK60-G3 | ≤215 | 16 | 60 | 159*159"],
  ["victory-generator",101,"4DW81-23D","bore+disp","| V12XC | 50 | 10 | 12.5 | 12 | 15 | 4DW81-23D | 4 | Natural | Direct injection | 1.532 | 85*90 | ≤5 | ≤262 | 1700*900*1130"],
  ["victory-generator",103,"YD480D","cyl","| V15YD | 60 | 13 | 16.25 | 15 | 18.75 | YD480D | 3 | Natural | Direct injection | 1.809 | 80*90 | ≤5 | ≤249 | 2100*730*1130"],
  ["yongcai-elecmama",126,"Y4105D","bore+disp","| Bore x Stroke | 80 x 90 mm"],
  ["mingbang-mbkl",122,"6LTAA8.9-G2","bore","| 21 | MB-C180 | 225 | 180 | 248 | 198 | 6LTAA8.9-G2 | 6 | 8.9 | 114*135 | 197"],
  ["mingbang-mbkl",122,"6LTAA8.9-G2","bore","| 22 | MB-C200 | 250 | 200 | 275 | 220 | 6LTAA8.9-G2 | 6 | 8.9 | 114*135 | 197"],
  ["mingbang-mbkl",122,"NTAA855-G7A","bore","| 33 | MB-C320 | 400 | 320 | 440 | 352 | NTAA855-G7A | 6 | 14.0 | 159*159 | 205.4"],
  ["mingbang-mbkl",125,"TAD530GE","bore+disp","| 1 | MB-V68 | 85 | 68 | 94 | 75 | TAD530GE | 4 | 1.1 | 77*81 | 16 | 3000×1200×1740"],
  ["mingbang-mbkl",125,"TAD531GE","bore+disp","| 2 | MB-V80 | 100 | 80 | 110 | 88 | TAD531GE | 4 | 1.5 | 84*90 | 20.7 | 3000×1200×1740"],
  ["mingbang-mbkl",125,"TAD733GE","cyl+bore+disp","| 6 | MB-V160 | 200 | 160 | 220 | 176 | TAD733GE | 4 | 3.3 | 105*127 | 48.5 | 3300×1400×1940"],
  ["mingbang-mbkl",125,"TAD734GE","cyl+bore+disp","| 7 | MB-V200 | 250 | 200 | 275 | 220 | TAD734GE | 4 | 3.3 | 105*127 | 48.5 | 3300×1400×1940"],
  ["mingbang-mbkl",123,"YC6A245L-D21","disp","| 14 | MB-Y160 | 200 | 160 | 220 | 176 | YC6A245L-D21 | 6 | 8.4 | 108*132 | 195 | 3300×1400×1940"],
  ["mingbang-mbkl",123,"YC6B180L-D20","bore","| 11 | MB-Y120 | 150 | 120 | 165 | 132 | YC6B180L-D20 | 6 | 6.9 | 108*132 | 215 | 3000×1200×1740"],
  ["mingbang-mbkl",123,"YC6B205L-D20","disp","| 12 | MB-Y140 | 175 | 140 | 192.5 | 154 | YC6B205L-D20 | 6 | 7.3 | 108*125 | 215 | 3000×1200×1740"],
  ["mingbang-mbkl",123,"YC6C1220L-D20","disp","| 25 | MB-Y800 | 1000 | 800 | 1100 | 880 | YC6C1220L-D20 | 6 | 79.2 | 200*210 | 195 | 6000×2300×2930"],
  ["mingbang-mbkl",123,"YC6C1320L-D20","disp","| 26 | MB-Y880 | 1100 | 880 | 1210 | 968 | YC6C1320L-D20 | 6 | 79.2 | 200*210 | 195 | /"],
  ["mingbang-mbkl",123,"YC6MJ480L-D20","disp","| 17 | MB-Y300 | 375 | 300 | 412.5 | 330 | YC6MJ480L-D20 | 6 | 10.3 | 131*145 | 195 | 4300×2100×2500"],
  ["mingbang-mbkl",123,"YC6MK350L-D20","bore+disp","| 15 | MB-Y220 | 275 | 220 | 302.5 | 242 | YC6MK350L-D20 | 6 | 8.4 | 120*145 | 195 | 3300×1400×1940"],
  ["mingbang-mbkl",123,"YC6MK420L-D20","disp","| 16 | MB-Y250 | 312.5 | 250 | 343.75 | 275 | YC6MK420L-D20 | 6 | 9.8 | 123*145 | 195 | 4000×1800×2300"],
  ["mingbang-mbkl",123,"YC6T550L-D21","cyl","| 18 | MB-Y350 | 437.5 | 350 | 481.25 | 385 | YC6T550L-D21 | 12 | 16.3 | 145*165 | 195 | 4300×2100×2500"],
  ["mingbang-mbkl",123,"YC6T600L-D22","cyl","| 19 | MB-Y400 | 500 | 400 | 550 | 440 | YC6T600L-D22 | 12 | 16.3 | 145*165 | 195 | 4500×2100×2600"],
  ["taihai-taizhou",101,"QSK78-G9","cyl","| TH-2000GF | 2500 | 2000 | QSK78-G9 | 16V | 170/190 | 77.6 | 201 | 7158×2800×2900 | 24880 |"],
  ["taihai-taizhou",108,"SC33W990D2","cyl","| TH-600GF | 600 | 750 | 1080 | SC33W990D2 | 12 | 180*215 | 32.8 | 57 | 215 | 3700*1700*1950 | 5300"],
  ["taihai-taizhou",109,"YC2115ZD","bore+disp","| TH-30GF | 30 | 37.5 | 54 | YC2115ZD | 2 | 108×115 | 4.214 | 12 | ≤205 | 1700*750*1000 | 900"],
  ["yunding-jiangsu",2002,"1104C-44TAG2","bore","| YDP-80GF | 80 | 100 | 144 | 1104C-44TAG2 | 4 | 100*127 | 4.41 | 8 | 208 | 1950*800*1200 | 1000"],
  ["yunding-jiangsu",2007,"SC4H180D2","bore","| YDS-120GF | 120 | 150 | 216 | SC4H180D2 | 4 | 135*150 | 4.3 | 15 | 198 | 2100*900*1200 | 1350"],
  ["yunding-jiangsu",2008,"WP13D440E310","cyl","| YDW-400GF | 400 | 500 | 720 | WP13D440E310 | 9 | 127*165 | 12.54 | 30 | 205 | 3100*1150*1600 | 3050"],
  ["yunding-jiangsu",2008,"WP13D490E310","cyl","| YDW-450GF | 450 | 562.5 | 810 | WP13D490E310 | 9 | 127*165 | 12.54 | 30 | 205 | 3260*1390*1850 | 3200"],
  ["zhengchi-power",162,"12M33D1320E200","bore+disp","| ZCDL-W1200 | 1100 | 1200 | 2160A | 12M33D1320E200 | 12 | 159*159 | 50L | 191g/kw.h | 5900*2270*2500 | 12000kg | 220/380 | 50Hz | 三相四线 | 详细参数"],
  ["zhengchi-power",162,"12M55D2210E310","bore+disp","| ZCDL-W2000 | 1800 | 2000 | 3600A | 12M55D2210E310 | 12 | 159*159 | 68L | 193g/kw.h | 6400×2800×3700 | 16200kg | 220/380 | 50Hz | 三相四线 | 详细参数"],
  ["zhengchi-power",162,"12M55D2450E310","bore+disp","| ZCDL-W2200 | 2000 | 2200 | 3960A | 12M55D2450E310 | 12 | 159*159 | 68L | 193g/kw.h | 6400×2800×3700 | 16200kg | 220/380 | 50Hz | 三相四线 | 详细参数"],
  ["zhengchi-power",162,"12M55D2700E310","bore+disp","| ZCDL-W2400 | 2200 | 2400 | 4320A | 12M55D2700E310 | 12 | 159*159 | 68L | 193g/kw.h | 6400×2800×3700 | 16200kg | 220/380 | 50Hz | 三相四线 | 详细参数"],
  ["zhengchi-power",162,"16M33D1530E310","bore+disp","| ZCDL-W1400 | 1250 | 1400 | 2520A | 16M33D1530E310 | 16 | 159*159 | 60L | 191g/kw.h | 6200*2300*2550 | 15800kg | 220/380 | 50Hz | 三相四线 | 详细参数"],
  ["zhengchi-power",162,"16M33D1580E310","bore+disp","| ZCDL-W1440 | 1300 | 1440 | 2592A | 16M33D1580E310 | 16 | 159*159 | 60L | 191g/kw.h | 6200*2300*2550 | 15800kg | 220/380 | 50Hz | 三相四线 | 详细参数"],
  ["zhengchi-power",162,"16M33D1680E310","bore+disp","| ZCDL-W1520 | 1400 | 1520 | 2736A | 16M33D1680E310 | 16 | 159*159 | 60L | 191g/kw.h | 6200*2300*2550 | 15800kg | 220/380 | 50Hz | 三相四线 | 详细参数"],
  ["zhengchi-power",162,"16M33D1800E310","bore+disp","| ZCDL-W1650 | 1500 | 1650 | 2970A | 16M33D1800E310 | 16 | 159*159 | 60L | 191g/kw.h | 6200*2300*2550 | 15800kg | 220/380 | 50Hz | 三相四线 | 详细参数"],
  ["zhengchi-power",162,"16M55D2900E310","bore+disp","| ZCDL-W2650 | 2400 | 2650 | 4770A | 16M55D2900E310 | 16 | 159*159 | 72L | 200g/kw.h | 6900×2900×3800 | 18900kg | 220/380 | 50Hz | 三相四线 | 详细参数"],
  ["zhengchi-power",161,"SC13G280D2","disp","| ZCDL-S190 | 170 | 190 | 306A | SC13G280D2 | 6 | 135 * 150 | 8.8L | 200g/kw.h | 2700 * 1000 *1500 | 2400kg | 220/380 | 50Hz | 三相四线 | 详细参数"],
  ["zhengchi-power",161,"SC13G355D2","disp","| ZCDL-S235 | 215 | 235 | 387A | SC13G355D2 | 6 | 135 *150 | 8.82L | 200g/kw.h | 3150*1240 * 1750 | 2500kg | 220/380 | 50Hz | 三相四线 | 详细参数"],
  ["zhengchi-power",161,"SC4H160D2","disp","| ZCDL-S105 | 95 | 105 | 171A | SC4H160D2 | 4 | 105* 124 | 4L | 193g/kw.h | 2500*870 * 1340 | 970kg | 220/380 | 50Hz | 三相四线 | 详细参数"],
  ["zhengchi-power",161,"SC9D340D2","disp","| ZCDL-S230 | 210 | 230 | 378A | SC9D340D2 | 6 | 114*144 | 8.27L | 195g/kw.h | 3000 *1080* 1700 | 2500kg | 220/380 | 50Hz | 三相四线 | 详细参数"],
  ["zhengchi-power",101,"TAD753GE","bore","| ZCDL-V175 | 160 | 175 | 288A | TAD753GE | 6 | 180*130 | 7.15L | 191g/kw.h | 2600*1046*1500 | 1789kg | 220/380 | 50Hz | 三相四线 | 详细参数"],
  ["aosif",1024,"QSB5.9-G31","disp","| Displacement | 3.9 L"],
  ["depco-power",2360,"BF8M1015C-LA G1A","cyl","| Cylinder | 6 | Cooling system | Water"],
  ["depco-power",2357,"BF8M1015CP-LA G2","cyl","| Cylinder | 6 | Cooling system | Water"],
  ["depco-power",2355,"BF8M1015CP-LA G4","cyl","| Cylinder | 6 | Cooling system | Water"],
  ["depco-power",2354,"BF8M1015CP-LA G5","cyl","| Cylinder | 6 | Cooling system | Water"],
  ["depco-power",2327,"CA6DF2D-14D","bore","| Cylider arrangemant | IN-LINE | Bore and Stroke(mm) | 110 X 125"],
  ["depco-power",2319,"CA6DN1J-45D","bore","| Cylider arrangemant | IN-LINE | Bore and Stroke(mm) | 123 X 155"],
  ["depco-power",2024,"WP10D200E201","cyl","| Cylinder | 4 | Cooling system | Water"],
  ["genlitec",117,"4Z2.3-G21","bore","| Bore x Stroke | 85 x 110 mm"],
  ["genlitec",1010,"4Z2.3-G21","bore","| Bore x Stroke (mm) | 85 x110"],
  ["hanyang-weifang",125,"SC12E420D2","bore","| HY-250 | SC12E420D2 | 280 | 308 | 6 | 128*135 | 11.8 | 195 | 3100*1150*1750 | 2600 | T2"],
  ["hanyang-weifang",107,"YC4A100Z-D25","bore","| HY-64 | YC4A100Z-D25 | 70 | 77 | 4 | 108*115 | 4.84 | 213 | 2300*900*1500 | 1200 | T2"],
  ["hanyang-weifang",107,"YC4D155-D31","disp","| HY-100 | YC4D155-D31 | 103 | 113 | 4 | 108*115 | 4.84 | 210 | 2300*850*1500 | 1150 | T3"],
  ["huatai-yangzhou",102,"TD226B-3D","disp","| 40GF | 40 | TD226B-3D | 3L | 105/120 | 4.16 | 11 | 650 | 1650*700*1290"],
  ["jet-power",127,"S6R2-PTA-C","bore","| M-715 | 715 | 572 | 650 | 520 | S6R2-PTA-C/575KW | 6L | 170×120 | 29.96 | 124L/h | Electronic | 14.1 | HCI544F/570KVA | 3650*1600*1900 | 5620 | 4600*2000*2250 | 6620"],
  ["mingbang-mbkl",126,"1006TAG","cyl","| 15 | MB-P108 | 135 | 108 | 150 | 120 | 1006TAG | 4 | 6.0 | 100*127 | 208 | 3000×1200×1740"],
  ["yunding-jiangsu",2006,"YC6B180L-D20","cyl","| YDY-120GF | 120 | 150 | 216 | YC6B180L-D20 | 4 | 108*125 | 6.87 | 21 | 198 | 2350*950*1420 | 1450"],
  ["zhengchi-power",162,"16M55D2750E310","bore+disp","| ZCDL-W2500 | / | 2500 | 4500A | 16M55D2750E310 | 16 | 159*159 | 72L | 200g/kw.h | 6900×2900×3800 | 18900kg | 220/380 | 50Hz | 三相四线 | 详细参数"],
  ["zhengchi-power",162,"16M55D3300E310","bore+disp","| ZCDL-W3000 | 2600 | 3000 | 5400A | 16M55D3300E310 | 16 | 159*159 | 72L | 200g/kw.h | 6900×2900×3800 | 18900kg | 220/380 | 50Hz | 三相四线 | 详细参数"],
  ["zhengchi-power",162,"16M55D3600E310","bore+disp","| ZCDL-W3300 | 3000 | 3300 | 5940A | 16M55D3600E310 | 16 | 159*159 | 72L | 200g/kw.h | 6900×2900×3800 | 18900kg | 220/380 | 50Hz | 三相四线 | 详细参数"],
  ["zhengchi-power",162,"20M33D2020E310","bore+disp","| ZCDL-W1800 | 1600 | 1800 | 3240A | 20M33D2020E310 | 20 | 159*159 | 68L | 193g/kw.h | 6400×2800×3700 | 16200kg | 220/380 | 50Hz | 三相四线 | 详细参数"]
];
const lineOf = (r, line) => [r.line, ...(r.lines?.header || []), ...(r.lines?.rows || [])].some((x) => x != null && String(x).trim() === line.trim());

test("126 ca: ô lệch bị bỏ, mỗi ca đúng một dòng nguồn có thật", () => {
  assert.equal(CASES.length, 126);
  for (const [id, n, model, keys, line] of CASES) {
    const src = real(id).specTables.filter((t) => t.n === n);
    assert.ok(src.some((t) => [...(t.header || []), ...(t.rows || [])].some((x) => String(x).trim() === line.trim())), `${id} n${n}: dòng nguồn không còn`);
    const rs = recs(id).filter((r) => r.n === n && r.kind === "engine" && norm(r.model) === norm(model) && lineOf(r, line));
    assert.ok(rs.length, `${id} n${n} ${model}: không có bản ghi`);
    for (const r of rs) for (const k of keys.split("+")) assert.ok(!(r.specs || []).some((s) => s.key === k), `${id} n${n} ${model}: còn ${k}`);
  }
});

test("ca ngoài danh sách giữ số: 6LTAA9.5-G1 (depco n2509), kangwo S175M / S180M, zhengchi 12M33D1450E310 n162", () => {
  const keep = (id, n, model, ks) => {
    const rs = recs(id).filter((r) => r.n === n && r.kind === "engine" && norm(r.model) === norm(model));
    assert.ok(rs.length, `${id} ${model}`);
    for (const r of rs) for (const k of ks) assert.ok((r.specs || []).some((s) => s.key === k), `${id} ${model} mất ${k}`);
  };
  keep("depco-power", 2509, "6LTAA9.5-G1", ["cyl", "bore", "disp"]);
  keep("kangwo-guangdong", 110, "S175M", ["disp"]);
  keep("kangwo-guangdong", 110, "S180M", ["disp"]);
  keep("zhengchi-power", 162, "12M33D1450E310", ["disp"]);
});

test("ca bỏ một ô giữ ô còn lại: aosif QSB5.9-G31 mất dung tích, giữ 6 xi lanh và 102x120", () => {
  const [r] = recs("aosif").filter((x) => x.n === 1024 && x.kind === "engine" && norm(x.model) === "QSB59G31");
  const ks = (r.specs || []).map((s) => s.key);
  assert.ok(!ks.includes("disp") && ks.includes("cyl") && ks.includes("bore"));
});
