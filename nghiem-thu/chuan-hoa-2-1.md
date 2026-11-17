# Nghiệm thu chuan-hoa-2 (lần 1) — lớp chuẩn hoá thông số NCC

- PR (draft, chưa merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/782 — nhánh `chuan-hoa-2`, một commit `611ff6c4` trên main `1767d79c` (đã gồm `chuan-hoa-1` #779 và `chuan-hoa-1b` #781). Baseline sinh lại SAU khi rebase lên 1767d79c.
- Không đổi hành vi: `web/spec-norm.js` chưa được `web/index.html` hay `suppliers/config-bot.mjs` nạp; `web/catalog.js` không đổi (md5 `07ed09c3…` trùng origin/main).

## Tệp đã đổi
| Tệp | Nội dung |
|---|---|
| `web/spec-norm.js` (mới) | UMD (`window.GenbidSpecNorm` / `globalThis`), hàm thuần: `normalize(spec, {title, header})`, `normalizeRecord(o)`, `powerFlags(o)`, `hasValue`. 17 mã. |
| `suppliers/quality.mjs` (mới) | Báo cáo độ phủ, tỉ lệ `missing`, mâu thuẫn trước / sau; `--check`, `--write-baseline`, `--conflicts`, `--json`, `--samples K N [loại]`. |
| `suppliers/quality-baseline.json` (mới) | Mốc tỉ lệ + ngưỡng. |
| `suppliers/quality.test.mjs` (mới) | 3 test (measure, check, ngưỡng mã ít mẫu). |
| `web/test/spec-norm.test.mjs` (mới) | 124 ca dòng thật (mỗi mã ≥5 ca, mỗi mã có ca ra `missing`) + 5 test luật. |
| `.github/workflows/ci.yml` | thêm `node --test web/test/spec-norm.test.mjs`, `node suppliers/quality.mjs --check` (job suppliers). |
| `suppliers/CLAUDE.md` | mục "Lớp chuẩn hoá thông số": quy tắc + 3 bẫy mới. |

## Dạng kết quả
`{ key, num | range:[min,max] | options:[…] | enum:[{scale, level, text}] | dims:{L,W,H}|{asWritten} | bore:{bore,stroke} | count, op, unit, cond:{…}, missing:[…], raw:{label,value}, conv? }`
- `options` = nguồn ghi nhiều giá trị mà không nói cái nào ứng với gì ("1.0(0.8)", "180/225") → kèm `missing: ambiguous`.
- `cond`: `load`, `loadFrom:"key"` (mức tải lấy từ khoá fuel75/fuel50, tức từ ô "75%" của dòng mà catalog.js đã đọc), `rating`, `distance_m`, `measure` (LpA/LwA), `enclosure` (open/enclosed), `basis` (gross/net/dry/wet), `order`, `layout`, `angle`, `rpm`, `hp`, `ratings[]`, `wires`, `freq`, `runtime_h`, `exempt`, `headerUnit` (đơn vị đọc từ dòng tiêu đề), `distanceFrom:"header"`.
- Loại `missing`: unit, load, distance, basis, enclosure, order, stroke, layout, speed, scale, value, ambiguous, number (phẩy + 3 chữ số), kind (ô thuộc loại khác: "Running time @ 75% PRP" bị catalog.js gán fuel75).

## Lệnh kiểm đã chạy (đầu ra thật, sau rebase lên 1767d79c)
```
node --test suppliers/*.test.mjs                         → tests 842, pass 842, fail 0
node --test web/test/spec-norm.test.mjs web/test/static.test.mjs → tests 134, pass 134, fail 0
node suppliers/verify.mjs                                → 435 bản ghi, 0 có lỗi
node suppliers/quality.mjs --check                       → --check: không chỉ số nào xấu đi quá ngưỡng.
CI PR #782 lúc viết: 4 pass, 1 đang chạy, 0 đỏ.
```

## Độ phủ + tỉ lệ missing từng mã (ĐO, `node suppliers/quality.mjs`, main 1767d79c)
Tỉ lệ trên số giá trị của mã. "Có số" = ra được số / mức (kể cả khi còn thiếu đơn vị / điều kiện).

| Mã | Giá trị | Có số | Thiếu |
|---|---:|---:|---|
| fuel | 11.365 | 100% | load 79,5%, unit 10,3%, ambiguous 0,2% |
| fuel75 | 914 | 99,1% | unit 26,8%, kind 0,7%, value 0,2% |
| fuel50 | 568 | 99,6% | unit 42,3%, value 0,4% |
| noise | 534 | 100% | distance 2,8%, ambiguous 0,6%, unit 0,6% |
| dims | 21.805 | 99,9% | enclosure 86,9%, order 58,8%, unit 34%, ambiguous 0,3%, number 0,1% |
| weight | 18.669 | 99,7% | enclosure 92%, basis 83,6%, unit 5,3%, number 0,3%, ambiguous 0,1% |
| disp | 11.028 | 99,2% | unit 13,2%, number 0,8% |
| bore | 7.095 | 100% | unit 16,8%, stroke 6%, ambiguous 0,1% |
| cyl | 14.749 | 100% | layout 68,4% |
| compr | 1.319 | 100% | — |
| speed | 2.778 | 100% | unit 14,3% |
| voltage | 3.279 | 98,4% | unit 10,5%, kind 1,6% |
| phase | 2.413 | 99,9% | value 0,1% |
| pf | 1.175 | 100% | ambiguous 1,8% |
| tank | 779 | 93,1% | unit 33,9%, value 6,7% (chỉ ghi số giờ chạy), kind 0,3% |
| engPower | 5.075 | 100% | speed 69,9%, ambiguous 2%, unit 1,6% |
| emission | 2.538 | 99,8% | scale 44,9% ("T3", "Tier 2", "Stage V" không kèm EPA/EU/China), value 0,2% |
| công suất tổ máy (49.348 dòng) | — | — | rating 13,4%, freq 74,2%, value 27,7% (cờ; cách đọc `powersIn` giữ nguyên) |

So với ket-qua.md: "tiêu hao không ghi đơn vị 3.431" (audit2) → sau khi đọc thêm ô đơn vị của dòng tiêu đề (cùng cột, hoặc ô đơn vị duy nhất cùng loại khi tiêu đề nhiều tầng): fuel 10,3% ≈ 1.170, fuel75 245, fuel50 240 (≈1.655 tổng). "Độ ồn không ghi khoảng cách 319/534" → 15/534 (đọc thêm "7 M", "LP1m", "(7m, dB)", "dB(A) at 7 mt" ở tiêu đề cột của cgm-italia). Số trước của audit2 dùng regex thô; số sau là số `missing` thật của lớp mới.

## Mâu thuẫn hằng số động cơ trước / sau (ĐO)
Model (theo `keyOf`) có ≥2 NCC ghi giá trị; "mâu thuẫn" = ≥2 giá trị khác nhau.

| Mã | Trước (ket-qua.md, audit3) | Trước, đo lại trên 1767d79c | Sau, chỉ giá trị đủ đơn vị | Sau, gồm giá trị thiếu đơn vị |
|---|---|---|---|---|
| disp | 352/966 | 352/968 | 314/875 | 352/966 |
| bore | 144/851 | 144/851 | 111/733 | 144/851 |
| cyl | 113/1.344 | 113/1.344 | 113/1.344 | 113/1.344 |
| compr | 37/122 | 37/122 | 37/122 | 37/122 |

Kết luận thật: chuẩn hoá KHÔNG làm giảm mâu thuẫn — các mâu thuẫn là khác biệt có thật trong nguồn (vd. fdk-energy ghi tỉ số nén 1106A-70TAG2 = 6:1 cạnh 16:1 của genlitec/shanhua/weiman; liangzi ghi 1104C-44TAG2 = 12,6 L cạnh 4,4 L của 19 NCC; wintpower 1106A-70TAG2 dung tích 6 cạnh 7). Số "đủ đơn vị" thấp hơn chỉ vì bớt model đem so (giá trị không ghi đơn vị bị loại khỏi phép so), không phải vì sửa được. Danh sách đầy đủ: `node suppliers/quality.mjs --conflicts` (hoặc `--json`, trường `conflicts.<mã>.strict.models`). Không chọn theo đa số (quy tắc Khoa).

## 10 mẫu ngẫu nhiên raw ↔ chuẩn hoá (hạt giống 20261114, trên mọi giá trị chuẩn hoá)
1. **bore** [victory-generator, nguồn 101] https://www.victorygenerator.com/faw/10kva-68kva-faw-xichai-diesel-generator-set.html — "Bore*Stroke (mm)" = "102*118" → `{unit:"mm", bore:{bore:102, stroke:118}, missing:[]}` ✔
2. **phase** [welland-power, 101] https://www.wellandpower.net/collections/diesel-generators — "Phases" = "3" → `{num:3, missing:[]}` ✔
3. **cyl** [yanan-power, 101] https://www.yanan-motor.com/cummins-generator-set.html — "NO. of Cylinder" = "4" → `{count:4, missing:["layout"]}` ✔ (nguồn không ghi L/V)
4. **phase** [welland-power, 104] https://www.wellandpower.net/collections/cummins-powered-generators — "Phases" = "3" → `{num:3}` ✔
5. **dims** [walter-yangzhou, 108] https://www.wetgenerator.com/?products_17/79.html — "Dimension(MM)L*W*H" = "5400*2250*2500" → `{unit:"mm", dims:{L:5400,W:2250,H:2500}, cond:{order:"L×W×H"}, missing:["enclosure"]}` ✔
6. **weight** [zhengchi-power, 143] https://www.zcdl.com.cn/index.php?m=content&c=index&a=lists&catid=59 — "重量KG" = "1650" → `{unit:"kg", num:1650, missing:["basis","enclosure"]}` ✔
7. **weight** [meao-jiangsu, 103] http://www.meaopower.cn/products/25.html — "重量" = "762" → `{unit:"kg", num:762, cond:{headerUnit:"KG"}, missing:["basis","enclosure"]}` ✔ (KG ở dòng tiêu đề thứ hai cùng cột)
8. **dims** [bobig-power, 113] https://www.bobigpower.com/sale-36701803-…-for-home-canopy.html — "Size" = "3600*1500*2460" → `{dims:{asWritten:[3600,1500,2460]}, missing:["unit","order","enclosure"]}` ✔. Lần lấy mẫu đầu, mẫu này lộ lỗi: tên trang có "Canopy" nên bị gán "enclosed", trong khi tiêu đề có hai cột "Open type (MM) | sounproof type (MM)" → đã sửa (`encOf`: tiêu đề có cột cả hai kiểu thì không dùng tên bảng) + thêm ca test. Còn lại: đơn vị "(MM)" nằm ở tiêu đề tầng hai, lệch cột nên không đọc → thiếu unit (đúng với luật hiện tại).
9. **weight** [chuangyuan-zhongshan, 102] https://www.cypower.com.cn/displayproduct.html?id=6045979586237760 — "参考重量 (KG)" = "1200" → `{unit:"kg", num:1200, cond:{enclosure:"open"}, missing:["basis"]}` ✔ (tên bảng "开架型发电机组")
10. **dims** [previa-ningde, 104] https://www.priuspower.com/PR-BD-Serial-powered-by-Baudouin-pd701371088.html — "DIMENSION" = "OP3050*1100*1800" → `{dims:{asWritten:[3050,1100,1800]}, missing:["unit","order","enclosure"]}`. Chữ "OP" (cột cạnh là "AT…") không được coi là "open" vì là viết tắt, không phải chữ — bảo thủ, có thể Khoa muốn nhận.

## 3 mẫu đối chiếu nguồn gốc (câu trích nguyên văn trong `suppliers/sources/<id>/<n>.md`)
- victory-generator/101.md (URL ở mẫu 1): tiêu đề `| … | Displacement (L) | Bore*Stroke (mm) | Stable Timing Rate（%） | Fuel consumption (g/kW.h) | SIZE for silent type (L*W*H/mm)`; dòng `| V33XC | 50 | 30 | 37.5 | 33 | 41 | 4DX21-53D | 4 | Natural | Direct injection | 3.857 | 102*118 | ≤5 | ≤240 | 2050*900*1150`.
- walter-yangzhou/108.md (mẫu 5): `| Genset Model | Standby Power | Prime Power | Engine Model | Dimension(MM)L*W*H` và `| WET-1520 | 1900 | 1520 | 1750 | 1400 | 16M33D1680E310 | 5400*2250*2500`.
- meao-jiangsu/103.md (mẫu 7): `| MP-24GF | 33 | 26 | 30 | 24 | 1103A-33G | PI144G | 1740x730x1565 | 762`.

## Ngưỡng của `--check` (quality-baseline.json)
`valuePctDrop 2`, `missingPctRise 2` (điểm %), `powerPctRise 1`, `conflictRise 5` (model, trên số "đủ đơn vị"); mã < `smallN 1000` giá trị nhân `smallFactor 5` (pf, fuel75, fuel50, noise, tank). Mốc chỉ giữ tỉ lệ (số lượng tăng theo mỗi lượt cào). Sinh lại có chủ ý: `node suppliers/quality.mjs --write-baseline` rồi ghi lý do trong PR. Mốc đã sinh sau `chuan-hoa-1b`; pf (n=145 → 1.175) giờ trên ngưỡng smallN nên dùng ngưỡng thường.

## Đề xuất (CHƯA làm) chỗ nối lớp này
1. `config-bot.mjs check`: ở bước so số của nguồn với ngưỡng HSMT (tiêu hao, độ ồn, kích thước, khối lượng, dung tích), gọi `GenbidSpecNorm.normalize` trên dòng thông số của ứng viên. Quy tắc gợi ý: `missing` có `unit` hoặc điều kiện HSMT đòi (`load` cho tiêu hao, `distance` cho độ ồn, `enclosure` cho kích thước/khối lượng) → "Chưa rõ" thay vì so số thô; khớp đủ → so số với `unit`/`cond`. Đúng với quy tắc đã chốt "tiêu hao chỉ loại khi nguồn ghi rõ mức tải trùng mức HSMT". Cần đo bằng `regress-config.test.mjs` trước/sau.
2. Prep ứng viên (30 dòng): kèm bản chuẩn hoá cạnh câu trích để agent khỏi tự đọc đơn vị; không thay câu trích.
3. Web (màn danh mục động cơ / đầu phát, `GenbidCatalog.build`): nạp `spec-norm.js` sau `conversions.js`, hiện giá trị chuẩn hoá + chú thích "nguồn không ghi đơn vị / mức tải" thay vì chuỗi thô; chạy lười (build đã 4–7 s).
4. `gaps.mjs`: dùng tỉ lệ `missing` theo NCC để ưu tiên specreq (vd. NCC có nhiều dòng tiêu hao thiếu đơn vị).

## Rủi ro còn lại + cách quay lui
- Lớp chưa được dùng ở đâu ngoài CI → rủi ro hành vi = 0. Quay lui: revert PR (chỉ thêm tệp + 2 bước CI).
- CI `--check` có thể đỏ khi một lượt cào lớn đổi tỉ lệ > ngưỡng (vd. thêm một NCC nhiều dòng không ghi đơn vị). Cách xử: xem `node suppliers/quality.mjs`, nếu là dữ liệu thật thì `--write-baseline`. Workflow tự đăng dữ liệu NCC chạy CI trên main → nếu thành phiền, có thể đặt bước `--check` `continue-on-error` hoặc chỉ chạy trên pull_request (điều phối quyết).
- Đọc ô đơn vị "duy nhất cùng loại" ở tiêu đề nhiều tầng (`soleUnit`) là heuristic có điều kiện chặt (đúng 1 tiêu đề loại đó + đúng 1 ô đơn vị loại đó); đã kiểm trên agestar, cgm-italia; chưa kiểm hết mọi bảng.
- `enclosure` từ tên bảng: chỉ cụm về kiểu máy; mẫu bobig cho thấy tên trang có thể sai với từng cột → đã chặn khi tiêu đề có hai kiểu, có thể còn ca khác.

## Việc chưa kiểm được
- compr: dữ liệu không có ô tỉ số nén nào thiếu số; ca `missing` của compr là "-" (dạng ô gặp ở các cột khác), không phải dòng compr thật.
- pf: 5 ca test (ngoài "Factor (Cos Phi)") lấy từ dòng bảng thật trước khi catalog.js của 1b gán pf; sau 1b các nhãn này đã ra pf (đã thấy trong `--samples pf`).
- Không kiểm trên web (lớp chưa nối vào trang). Không chạy Playwright.
- Lỗi đọc ngoài phạm vi thấy được (KHÔNG sửa, thuộc catalog.js): "Running time @ 75% PRP" (endress) bị gán `fuel75`; gtl-power cột "1500 rpm, 400V/50Hz/3P, 0.8PF" bị gán `speed` (giá trị 1000/1200/1800 nằm dưới nhãn 1500 rpm); kangwo "Fre/Volt HZ/V 频率 /电压" gán `voltage` với giá trị là công suất; acepow "Engine Size(mm)" gán `dims` của tổ máy; "Fuel Tank running hours" gán `tank`.

## Cần ghi nhớ
- Quyết định chờ Khoa: (a) có nhận viết tắt "OP"/"AT" (open / ?), "T3"/"Tier 3" không kèm EPA là EPA Tier không — hiện để `missing: scale`; (b) "1,642 L" (phẩy + 3 số) hiện không đọc — có muốn đọc theo thói quen của từng NCC (himoinsa dùng phẩy thập phân) không.
- Quy tắc lớp chuẩn hoá đã ghi ở `suppliers/CLAUDE.md` (trong PR).
