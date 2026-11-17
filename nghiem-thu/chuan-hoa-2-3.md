# Nghiệm thu chuan-hoa-2 (lần 3): quyết định Khoa 14/11 (A, B, C)

- PR (draft, chưa merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/782. Head `ecc20927` (= `611ff6c4` lần 1 + `3a0c03b9` lần 2 + `ecc20927` lần này), trên main `1767d79c` (main chưa đổi). Merge squash.
- Vẫn không đổi hành vi: `web/catalog.js` md5 `07ed09c3…` trùng origin/main; `spec-norm.js` chưa được nạp ở web / config-bot.
- Bản trước: `chuan-hoa-2-1.md`, `chuan-hoa-2-2.md`.

## A. "T3 / Tier 3 / Stage V" không kèm thang; "OP" / "AT"
Giữ như cũ, không đổi code: `scale: null` + `missing: scale`; "OP…" / "AT…" không cho biết trần / vỏ. Các ca test cũ vẫn giữ (hanyang "T3", jet-power "Stage IIIA / Tier 3", previa "OP3050*1100*1800").

## B. Số phẩy + 3 chữ số
Luật trong `numOf` (web/spec-norm.js):
1. "0,ddd" → luôn là thập phân (0,667) — Khoa: "nếu 0, thì giữ nguyên".
2. "d,ddd" (1–3 chữ số, rồi các nhóm ",ddd") → hàng nghìn (1,642 → 1642).
3. Ngoại lệ (do điều phối thêm, chờ Khoa xác nhận): nếu CHÍNH CÁC DÒNG của bảng đó có ô viết phẩy thập phân thì số ở luật 2 → `missing: number` (không đọc 1642, cũng không đọc 1.642). Bằng chứng (`decimalCommaEvidence(rows)`): một ô chỉ gồm một số có phẩy + 1–2 chữ số ("3,51 l/h", "12,5", "≤ 4,2"), hoặc "0,ddd". Dòng của bảng truyền qua `normalizeRecord(o, s.specTables[o.table].rows)`; bảng nhãn ("Displacement: 1,642 L") tách ô sau dấu ":". Không xét tên NCC, không xét độ lớn. Một danh sách "220,230,240" không phải bằng chứng.

### Kết quả (ĐO, đếm theo bản ghi, như con số 167 của điều phối)
177 giá trị có số dạng "d,ddd" trong ô. Bỏ 10 giá trị `voltage` (danh sách "220,230,240,…" vốn đã tách theo dấu phẩy, chưa từng là `missing: number`), còn **167** đúng như điều phối đếm:
| Mã | Tổng | Đọc được | Giữ `missing: number` (ngoại lệ) | Ghi chú |
|---|---:|---:|---:|---|
| weight | 50 | 50 | 0 | "4,095kg" → 4095 (ade-power, hd-hyundai-infracore, jiuan-power, mwm, saudi-diesel) |
| dims | 23 | 23 | 0 | "1,381 x 1,138 x 1,207 mm" (hd-hyundai-infracore, saudi-diesel, zc-power, jiuan-power) |
| disp | 89 | 5 | 84 | 5 = "0,667 L" (himoinsa-china, luật 1); 84 = "1,642 L" / "1,116 L" của himoinsa / himoinsa-china |
| fuel | 2 | 0 | 2 | "Fuel Consumption ESP = 3,767 l/h" (himoinsa-china n142 / n143) |
| engPower | 2 | 2 | 0 | huali-shandong "1,097 kWm at 1,500 rpm" → 1097 kW, rpm 1500 |
| speed | 1 | 0 | 0 | hd-hyundai-infracore "kWm @ rpm 50Hz Standby = 1,240 @ 1500" → `missing: kind` (công suất và tốc độ dưới một tiêu đề; trước là số không đọc được) |
| **Tổng** | **167** | **80** | **86** | 1 sang `kind` |

Mỗi giá trị đếm 2 lần khi một dòng sinh 2 bản ghi (động cơ + đầu phát cùng thông số), như cách điều phối đếm 167.

### Sửa lộ ra khi đọc phẩy nghìn (không có trong yêu cầu, ghi để điều phối biết)
- `rpmIn` đọc "1,500 rpm" thành 500 → nay đọc cả số (1500). engPower huali trước ra `options [1097, 1]` → nay `num 1097, rpm 1500`.
- speed: tiêu đề có "kW" (hd-hyundai "kWm @ rpm") → `missing: kind`.
- dims: "4300 × 1600 × 2250mm / 4,300kg" (jiuan-power) → bỏ phần khối lượng sau "/", ra L×W×H; "2250mm" (dính số) nhận mm (trước `\bmm\b` bỏ sót).

### Bảng bị giữ theo ngoại lệ (43 bảng, 86 giá trị; ô bằng chứng là ô đầu tiên tìm thấy trong các dòng của bảng)
| NCC nguồn | Tên bảng | Ô bằng chứng | Giá trị | Ô bị giữ |
|---|---|---|---:|---|
| himoinsa n106 | 12.5 kVA Generator set Diesel HYW-13 T5 S5 Soundproof | `3,51 l/h` | 2 | disp: "Displacement" = "1,642 L" |
| himoinsa n107 | 12.5 kVA Generator set Diesel HYW-13 T5 S5 Open Skid | `3,51 l/h` | 2 | disp: "Displacement" = "1,642 L" |
| himoinsa n109 | 12.5 kVA Generator set Diesel HYW-13 T5 S5 Soundproof | `3,51 l/h` | 2 | disp: "Displacement" = "1,642 L" |
| himoinsa n110 | 12.5 kVA Generator set Diesel HYW-13 T5 S5 Open Skid | `3,51 l/h` | 2 | disp: "Displacement" = "1,642 L" |
| himoinsa n112 | 12.5 kVA Generator set Diesel HYW-13 T5 Soundproof | `3,51 l/h` | 2 | disp: "Displacement" = "1,642 L" |
| himoinsa n113 | 12.5 kVA Generator set Diesel HYW-13 T5 Mobile | `3,51 l/h` | 2 | disp: "Displacement" = "1,642 L" |
| himoinsa n114 | 12.5 kVA Generator set Diesel HYW-13 T5 Open Skid | `3,51 l/h` | 2 | disp: "Displacement" = "1,642 L" |
| himoinsa n116 | 12.5 kVA Generator set Diesel HYW-13 T5 Soundproof | `3,51 l/h` | 2 | disp: "Displacement" = "1,642 L" |
| himoinsa n117 | 12.5 kVA Generator set Diesel HYW-13 T5 Soundproof | `3,51 l/h` | 2 | disp: "Displacement" = "1,642 L" |
| himoinsa n118 | Diesel Generator Set 12.5 kVA HYW-13 T5 Soundproof – HIMOINSA | `3,51 l/h` | 2 | disp: "Displacement" = "1,642 L" |
| himoinsa n119 | 12.5 kVA Generator set Diesel HYW-13 T5 Mobile | `3,51 l/h` | 2 | disp: "Displacement" = "1,642 L" |
| himoinsa n120 | 12.5 kVA Generator set Diesel HYW-13 T5 Open Skid | `3,51 l/h` | 2 | disp: "Displacement" = "1,642 L" |
| himoinsa n122 | 12.5 kVA Generator set Diesel HYW-13 T5 Soundproof | `3,51 l/h` | 2 | disp: "Displacement" = "1,642 L" |
| himoinsa n123 | 12.5 kVA Generator set Diesel HYW-13 T5 Soundproof | `3,51 l/h` | 2 | disp: "Displacement" = "1,642 L" |
| himoinsa n124 | Diesel Generator Set 11.3 kVA HYW-13 M5 S5 Soundproof – HIMOINSA | `3,51 l/h` | 2 | disp: "Displacement" = "1,642 L" |
| himoinsa n125 | 11.3 kVA Generator set Diesel HYW-13 M5 S5 Open Skid | `3,51 l/h` | 2 | disp: "Displacement" = "1,642 L" |
| himoinsa n127 | Diesel Generator Set 11.3 kVA HYW-13 M5 Soundproof – HIMOINSA | `3,51 l/h` | 2 | disp: "Displacement" = "1,642 L" |
| himoinsa n128 | 11.3 kVA Generator set Diesel HYW-13 M5 Open Skid | `3,51 l/h` | 2 | disp: "Displacement" = "1,642 L" |
| himoinsa n133 | 8.8 kVA Generator set Diesel HYW-8 T5 Soundproof | `2,53 l/h` | 2 | disp: "Displacement" = "1,116 L" |
| himoinsa n134 | 8.8 kVA Generator set Diesel HYW-8 T5 Open Skid | `2,53 l/h` | 2 | disp: "Displacement" = "1,116 L" |
| himoinsa n139 | 8.3 kVA Generator set Diesel HYW-8 T5 Soundproof | `2,53 l/h` | 2 | disp: "Displacement" = "1,116 L" |
| himoinsa n140 | 8.3 kVA Generator set Diesel HYW-8 T5 Open Skid | `2,53 l/h` | 2 | disp: "Displacement" = "1,116 L" |
| himoinsa n145 | Diesel Generator Set 7.5 kVA HYW-9 M5 Soundproof – HIMOINSA | `2,53 l/h` | 2 | disp: "Displacement" = "1,116 L" |
| himoinsa n146 | 7.5 kVA Generator set Diesel HYW-9 M5 Open Skid | `2,53 l/h` | 2 | disp: "Displacement" = "1,116 L" |
| himoinsa-china n114 | 12.5 kVA Generator set Diesel HYW-13 T5 Soundproof | `3,51 l/h` | 2 | disp: "Displacement" = "1,642 L" |
| himoinsa-china n115 | 12.5 kVA Generator set Diesel HYW-13 T5 Open Skid | `3,51 l/h` | 2 | disp: "Displacement" = "1,642 L" |
| himoinsa-china n117 | 11.5 kVA Generator set Diesel HYW-13 M5 Soundproof | `3,51 l/h` | 2 | disp: "Displacement" = "1,642 L" |
| himoinsa-china n118 | 11.5 kVA Generator set Diesel HYW-13 M5 Open Skid | `3,51 l/h` | 2 | disp: "Displacement" = "1,642 L" |
| himoinsa-china n120 | 11.3 kVA Generator set Diesel HYW-13 M5 Soundproof | `3,51 l/h` | 2 | disp: "Displacement" = "1,642 L" |
| himoinsa-china n121 | 11.3 kVA Generator set Diesel HYW-13 M5 Open Skid | `3,51 l/h` | 2 | disp: "Displacement" = "1,642 L" |
| himoinsa-china n124 | 8.8 kVA Generator set Diesel HYW-8 T5 Soundproof | `2,53 l/h` | 2 | disp: "Displacement" = "1,116 L" |
| himoinsa-china n125 | 8.8 kVA Generator set Diesel HYW-8 T5 Open Skid | `2,53 l/h` | 2 | disp: "Displacement" = "1,116 L" |
| himoinsa-china n127 | 8.3 kVA Generator set Diesel HYW-8 T5 Soundproof | `2,53 l/h` | 2 | disp: "Displacement" = "1,116 L" |
| himoinsa-china n128 | 8.3 kVA Generator set Diesel HYW-8 T5 Open Skid | `2,53 l/h` | 2 | disp: "Displacement" = "1,116 L" |
| himoinsa-china n130 | 7.5 kVA Generator set Diesel HYW-9 M5 Soundproof | `2,53 l/h` | 2 | disp: "Displacement" = "1,116 L" |
| himoinsa-china n134 | 7.2 kVA Generator set Diesel HYW-9 M5 Soundproof | `2,53 l/h` | 2 | disp: "Displacement" = "1,116 L" |
| himoinsa-china n135 | 7.2 kVA Generator set Diesel HYW-9 M5 Open Skid | `2,53 l/h` | 2 | disp: "Displacement" = "1,116 L" |
| himoinsa-china n139 | 8.1 kVA Generator set Diesel HSY-10 M5 Soundproof | `3,00 l/h` | 2 | disp: "Displacement" = "1,116 L" |
| himoinsa-china n140 | 8.1 kVA Generator set Diesel HSY-10 M5 Open Skid | `3,00 l/h` | 2 | disp: "Displacement" = "1,116 L" |
| himoinsa-china n142 | 7.9 kVA Generator set Diesel HSY-10 M6 Soundproof | `2,80 l/h` | 2 | disp: "Displacement" = "1,116 L"; fuel: "Fuel Consumption ESP" = "3,767 l/h" |
| himoinsa-china n143 | 7.9 kVA Generator set Diesel HSY-10 M6 Open Skid | `2,80 l/h` | 2 | disp: "Displacement" = "1,116 L"; fuel: "Fuel Consumption ESP" = "3,767 l/h" |
| himoinsa-china n146 | 7.6 kVA Generator set Diesel HSY-10 M6 Soundproof | `3,09 l/h` | 2 | disp: "Displacement" = "1,116 L" |
| himoinsa-china n148 | 7.6 kVA Generator set Diesel HSY-10 M5 Soundproof | `3,00 l/h` | 2 | disp: "Displacement" = "1,116 L" |

Chỉ hai NCC (himoinsa 24 bảng / 48 giá trị, himoinsa-china 19 bảng / 38 giá trị) bị giữ; không bảng nào của NCC khác có ô phẩy thập phân đi cùng số "d,ddd". Bảng "0,667 L" của himoinsa-china (n122, n132, n137) có bằng chứng phẩy thập phân nhưng giá trị của chúng là "0,ddd" nên đọc theo luật 1.

## C. "1500转" = v/p
Giữ nhận (`RPM`: `\d\s*转(?!速)`; engPower "kW/…转"; `rpmIn`). Ghi vào `suppliers/CLAUDE.md`. Ca test thật: eastern-lion-fuan "Engine power (kW) = 30.1KW/1500转" → 30,1 kW, rpm 1500. "转速" vẫn không là đơn vị.

## Test mới (web/test/spec-norm.test.mjs, dòng thật)
himoinsa-china n114 "1,642 L" và n142 "1,116 L" / "3,767 l/h" (kèm dòng của bảng) → `missing: number`; himoinsa-china "0,667 L" → 0,667 L; ade-power "4,095kg" → 4095 kg; hd-hyundai-infracore "1,381 x 1,138 x 1,207 mm"; jiuan-power "… 2250mm / 4,300kg"; huali-shandong "1,097 kWm at 1,500 rpm"; hd-hyundai "kWm @ rpm …" → `kind`; eastern-lion-fuan "30.1KW/1500转".

## Kiểm (đầu ra thật)
```
node --test suppliers/*.test.mjs                                   → tests 842, pass 842, fail 0
node --test web/test/spec-norm.test.mjs web/test/static.test.mjs   → tests 151, pass 151, fail 0
node suppliers/verify.mjs                                          → exit 0 (435 bản ghi, 0 có lỗi)
node suppliers/quality.mjs --check                                 → không chỉ số nào xấu đi quá ngưỡng.
solecheck.cjs (điều phối)                                          → 0 dòng "MO HO"
normcheck.cjs (điều phối)                                          → gia tri chuan hoa: 106083 | co don vi: 69763; không bằng chứng 95 (vẫn là m3/kw.h 61, "Db" 20, Nm³/h 11, R.P.M 3: kẽ hở regex của script, xem chuan-hoa-2-2.md)
md5 web/catalog.js                                                  → 07ed09c3… = origin/main
```

## Số đo đổi so với lần 2 (ĐO, baseline sinh lại)
| Mã | Lần 2 → lần 3 |
|---|---|
| dims | có số 99,9% → 100%; thiếu unit 34,4% → 33,5% ("2250mm"); number 0,1% → 0 |
| weight | có số 99,7% → 100%; number 0,3% → 0 |
| disp | number 0,8% (không đổi: 84 giá trị himoinsa giữ theo ngoại lệ) |
| speed | number → 0; kind 0% (1 giá trị) |
| engPower | number → 0 |
Mâu thuẫn hằng số động cơ không đổi (disp 314/875, bore 111/723, cyl 113/1.344, compr 37/122 theo "đủ đơn vị").

## Cần ghi nhớ
- Ngoại lệ "bảng tự ghi phẩy thập phân" do điều phối thêm, chờ Khoa xác nhận (86 giá trị himoinsa / himoinsa-china). Nếu Khoa bỏ ngoại lệ: đặt `decimalComma: false` (một dòng trong `normalizeRecord`), 84 dung tích sẽ thành 1642 L / 1116 L.
