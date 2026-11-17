# Nghiệm thu chuan-hoa-2 (lần 2): sửa 3 điểm điều phối nêu

- PR (draft, chưa merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/782. Nhánh `chuan-hoa-2` = `611ff6c4` (lần 1) + `3a0c03b9` (lần này), trên main `1767d79c` (main chưa đổi kể từ lần 1). Không force-push (bị chặn quyền), nên còn 2 commit; merge squash là đủ.
- Vẫn không đổi hành vi: `web/catalog.js` md5 `07ed09c3…` trùng origin/main; `spec-norm.js` chưa được web / config-bot nạp.
- Bản lần 1: `chuan-hoa-2-1.md` (phần không nhắc ở đây vẫn đúng, trừ các số đã ghi lại bên dưới).

## Tệp đổi lần này
| Tệp | Đổi |
|---|---|
| `web/spec-norm.js` | `soleUnit(header, compRe, unitRe)`: đếm tiêu đề của MỌI họ nhận được loại đơn vị (`COMP`: mm = bore / stroke / đường kính / kích thước / L×W×H / 长宽; L = dung tích / dầu / bồn / nước làm mát / capacity / volume; kg; tiêu hao (trừ "fuel tank"); dB; rpm = speed / 转速 / rpm / engine power / 柴油机功率 / 发动机功率). Đúng 1 tiêu đề và đúng 1 ô đơn vị mới gán. Bỏ "lir/hr". "转" chỉ là đơn vị khi đứng ngay sau số ("1500转"), không phải trong "转速". Nm³ tách khỏi m³ (`Nm³/h`, `Nm³/kWh`). Ô có cả V và kV → `missing: unit`. Tỉ số nén không gán đơn vị (trước ghi ":1", kể cả khi ô không viết ":1"). |
| `web/test/spec-norm.test.mjs` | +8 ca: haifeng-taizhou n2001 (bore, dims), jet-power n134 (bore thiếu đơn vị; disp vẫn nhận "(L)" vì chỉ một tiêu đề nhận lít), fukangsi-yangzhou n2010 "lir/hr", googol Nm³, "转速", superwatt-swt V + kV. |
| `.github/workflows/ci.yml` | checkout `fetch-depth: 2`; bước `quality --check` chỉ thoát 1 khi `pull_request` VÀ `git diff --name-only HEAD^1 HEAD` có `web/catalog.js`, `web/spec-norm.js`, `web/conversions.js` hoặc `suppliers/quality*`; còn lại in `::warning::` và thoát 0. |
| `suppliers/CLAUDE.md` | thêm luật `soleUnit`, chữ không phải đơn vị, Nm³, và cách CI chặn / cảnh báo (kèm lý do `mergeWhenGreen`). |
| `suppliers/quality-baseline.json` | sinh lại. |

## 1. soleUnit — đo bằng script của điều phối
`node dau-vao/ra-soat-thong-so/solecheck.cjs <worktree>`:
- Trước (lần 1): soleUnit 7.490; MƠ HỒ 355 (bore 261, dims 94) ở haifeng-taizhou n2001, vantek-jiangsu n104 / n108, jet-power n127 / n129 / n130 / n134.
- Sau (đầu ra thật):
```
headerUnit theo dung cot: 1699 | theo luat 'duy nhat cung loai' (soleUnit): 6838
   550 bore <- mm | so tieu de co the nhan don vi nay: 1
   990 dims <- mm | so tieu de co the nhan don vi nay: 1
   1259 disp <- l | so tieu de co the nhan don vi nay: 1
   1648 fuel <- lh | so tieu de co the nhan don vi nay: 1
   105 speed <- rpm | so tieu de co the nhan don vi nay: 1
   2286 weight <- kg | so tieu de co the nhan don vi nay: 1
```
→ 0 dòng "MO HO" (đích đạt). 6.838 = 7.490 − 355 mơ hồ − 297 độ ồn (trước được gán "dB" khi tiêu đề có 0 tiêu đề độ ồn; nay cần đúng 1, đơn vị độ ồn vẫn đọc từ nhãn nên tỉ lệ thiếu đơn vị không đổi 0,6%).

`normcheck.cjs` (đầu ra thật): `gia tri chuan hoa: 106083 | co don vi: 69569`; "không tìm thấy chữ làm bằng chứng": 95 = fuel:m³/kWh 61, noise:dB 20, fuel:Nm³/h 11, speed:rpm 3. Cả 95 có chữ trong nguồn, script đo không có mẫu cho cách viết đó: "燃气消耗(m3 /kw.h)" (EVID chỉ có m³/h), "Noise Level [Db](@ 7m)" (EVID không có khoá "dB", chỉ "dB(A)"), "Gas consumption（Nm³/hr）" (không có khoá Nm³/h), "Engine speed(R.P.M)" (EVID rpm không có "r.p.m"). Trước lần này còn 1.319 compr ":1" (đã bỏ) và 1 voltage kV (superwatt, đã sửa).

## 2. "lir/hr" và mọi cách viết đơn vị đang được nhận
`燃油消耗率(lir/hr)` (fukangsi-yangzhou n2010) nay → `missing: unit` (ca test). Liệt kê ĐO trên toàn bộ giá trị có đơn vị (số giá trị · đơn vị · cách viết thấy trong nhãn / ô / ô đơn vị tiêu đề):

| Đơn vị | Cách viết (số giá trị) |
|---|---|
| L/h | `l/h` 4.860, `l / h` 145, `l/hr` 2 |
| g/kWh | `g/kw.h` 2.174, `g/kw.h)` 2.466, `g/kwh)` 454, `g/kw·h` 349, `g/(kw·h)` 220, `g/kwh` 119, `g/kw .h` 96, `g/kw·h)` 67, `g/ kw.h)` 38, `g/(kw.h)` 7, `g/kw-h)` 1 |
| m³/kWh | `m3/kwh` 25, `m3 /kw.h` 19, `m3/kw.h` 10, `m3/kw·h` 7 |
| Nm³/h (mới tách) | `Nm³/hr` 11 (googol) |
| kg/h | `kg/h` 88 |
| dB(A) / dB | `db(a)` 405, `dba` 105, `db (a)` 1; `db` / "Db" 20 |
| mm / cm / m | `mm` 19.192, `毫米` 95; `cm` 71; `(m)` / "（M）" 413 (fukangsi n2011 "机组尺寸（M）" = 2.7*0.9*1.75) |
| kg | `kg` 16.846, `kgs` 917 |
| L | `(l)` 7.215, `l` 1.603, `( l )` 134, `litres` 85, `[l]` 80, `(l )` 34, `liter` 18, `liters` 12, `lt` 12, `litre` 2 |
| cc | `cc` 134, `ml` 4 (jet-power "Displacement (ml)") |
| rpm | `rpm` 1.776, `r/min` 571, `r.p.m` 3; "转" xem dưới |
| V | `(v)`/`v` 1.599 (dòng "volt" 1.568 trong bảng đếm là chữ "voltage" của nhãn, không phải bằng chứng: đơn vị V chỉ nhận khi có "V" / "(V)" / "Vac" / "volts" / 伏 viết ra) |
| kW | `kw` 4.994 |

Cách viết lạ / cần điều phối xem:
- `l/hr` (2, aosif "31l/hr"), `lt` (12, teksan "FuelTank (lt)"), `ml` → cc (4), `(m)` mét cho kích thước (413), `g/kw-h` (1), "Db" (20): đều là chữ viết tắt chuẩn hoặc gần chuẩn, đang nhận.
- "转" sau số: còn nhận ở chỗ đơn vị — `1500转`, ô "kW/1500转" (engPower, 42 giá trị "Nkw/N转"), nhãn "kw/转". "转" = vòng quay; hiểu là v/p là thói quen viết tiếng Trung, không có "/分". Nếu điều phối coi là suy ra thì bỏ nốt (1 dòng regex `RPM` + `slash` của engPower). Trong "转速" (chữ "tốc độ") đã KHÔNG nhận nữa (6 cặp nhãn-giá trị tốc độ nay thiếu đơn vị).
- Đã từ chối: `lir/hr`, "L" đứng một mình cho tiêu hao (westinpower "56.8L"), "1/h" của fukangsi.

## 3. CI không chặn PR dữ liệu
Bước mới (ubuntu bash -e):
```
gate=0
if [ "${{ github.event_name }}" = "pull_request" ] && git diff --name-only HEAD^1 HEAD | grep -qE '^(web/catalog\.js|web/spec-norm\.js|web/conversions\.js|suppliers/quality)'; then gate=1; fi
if node suppliers/quality.mjs --check > /tmp/quality.txt; then tail -1 /tmp/quality.txt; exit 0; fi
cat /tmp/quality.txt
if [ "$gate" = 1 ]; then exit 1; fi
echo "::warning::quality.mjs --check: … (không chặn …)"
```
Mô phỏng logic cục bộ (thay `--check` bằng true/false, danh sách tệp giả), đầu ra thật:
```
pull_request chk=true  web/spec-norm.js    -> exit 0
pull_request chk=true  suppliers/cn/x.json -> exit 0
pull_request chk=false web/spec-norm.js    -> exit 1
pull_request chk=false suppliers/cn/x.json -> exit 0
push         chk=false web/spec-norm.js    -> exit 0
push         chk=false suppliers/cn/x.json -> exit 0
```
(Trên `pull_request`, actions/checkout lấy merge commit nên HEAD^1 là base; `fetch-depth: 2` đủ.) Chưa thấy CI thật ở nhánh đỏ — chưa có PR dữ liệu nào chạy qua bước này.

## Kiểm (đầu ra thật, sau sửa)
```
node --test suppliers/*.test.mjs                                    → tests 842, pass 842, fail 0
node --test web/test/spec-norm.test.mjs web/test/static.test.mjs    → tests 142, pass 142, fail 0
node suppliers/verify.mjs                                           → exit 0 (435 bản ghi, 0 có lỗi)
node suppliers/quality.mjs --check                                  → không chỉ số nào xấu đi quá ngưỡng.
```

## Số đo sau sửa (ĐO, baseline mới)
Chỉ ghi các số đổi so với `chuan-hoa-2-1.md`:
| Mã | Thiếu đơn vị lần 1 → lần 2 |
|---|---|
| fuel | 10,3% → 10,5% (fukangsi lir/hr, Nm³ đi đúng ô) |
| dims | 34% → 34,4% |
| bore | 16,8% → 20,5% (355 mơ hồ) |
| speed | 14,3% → 15,8% ("转速") |
| voltage | 10,5% → 10,6% |
Mâu thuẫn "đủ đơn vị": bore 111/733 → 111/723 (bớt 10 model so được); disp / cyl / compr không đổi. Các mã khác giữ nguyên số.

## Rủi ro còn lại
- `COMP` là danh sách chữ: một tiêu đề lạ nhận được mm / L mà không khớp `COMP` sẽ không được đếm → có thể còn gán sai. Đã đối chiếu bằng `solecheck.cjs` (dùng regex độc lập của điều phối): 0 mơ hồ.
- Regex chặn CI phải được cập nhật nếu thêm tệp đọc mới (đã ghi trong `suppliers/CLAUDE.md`).

## Cần ghi nhớ
- Điều phối giữ `missing` cho "T3 / OP-AT / 1,642" và chuyển Khoa (tin 14/11).
- Chờ quyết: có nhận "1500转" / "kW/1500转" là v/p không (đang nhận).
