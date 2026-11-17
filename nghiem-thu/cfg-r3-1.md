# Nghiệm thu cfg-r3-1 — giảm "chưa rõ" ở tổ máy và đầu phát (phần 1–2 của brief)

PR (DRAFT): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/523 — nhánh `cfg-r3`, commit a4e5e90 (phần 1–2) + b08fa88 (phần 3–4, xem `cfg-r3-2.md`), dựng trên main 9ea5d36 (#522 vào main trong lúc làm, đã rebase).

## Tệp đã đổi (phần 1–2)
- `suppliers/config-bot.mjs`: `ratedRowPower`, `powerChecks`, `pfChecks`, `currentChecks`, `freqChecks`, `altAttrChecks` (gọi trong `check()` sau `fuelChecks` / sau `vregChecks`); `sourceRatings()` thêm `attr` (thuộc tính đầu phát theo model).
- `suppliers/ratings.mjs`: `altSheetAttrs` — đọc tờ TD một model (Stamford / Wintpower đã lưu).
- `web/conversions.js`: thêm công thức `pf_from_kw_kva` (cosφ = P / S, IEC 60050-131). Không sửa `web/index.html` (web đã hiện `conversions` qua `cfgConvHtml`). Không đổi `REQ_VERSION`.
- `suppliers/cfg-r3.test.mjs` (mới); `suppliers/config.test.mjs` (1 test cập nhật, xem "Rủi ro").

## Lệnh kiểm + đầu ra thật
- `cd suppliers && node --test` → `# pass 216  # fail 0` (204 cũ + 12 mới; 1 test cũ sửa kỳ vọng).
- `node suppliers/verify.mjs` → `432 bản ghi, 0 có lỗi`.
- Không chạy agent, không ghi web thật, không đụng `genbid-hsmt\`, không tải nguồn mới.

## Cách đo (bước 0) — ĐO
- 12 configmatch trong `genbid-work\doc-cache\configmatch.json` (gói nhiều cỡ tách từng cỡ) chạy qua `check()` + `rankConfigs` của code (không gọi agent). HSMT đọc chỉ-đọc bằng `hsmtTextOf`. Script: scratchpad `r3/base.mjs`, `cmp.mjs`, `rfqcmp.mjs`, `report.mjs`.
- **Nền = code main 9ea5d36** (checkout bot, chỉ đọc). Sau phần 1–2 = commit a4e5e90 (worktree tạm). Sau phần 3–4 = b08fa88.
- **48 cấu hình** (không phải 57): `check()` hiện tại bỏ 9 cấu hình theo lọc xuất xứ/NCC (#506/#509…) và NCC không còn trong danh mục.
- **Bẫy đo:** trong lúc làm, phiên khác ghi lại `doc-cache\supplier.json` (16:25, mất `sanq-power`) → số trước/sau lệch ở IB2600581977 #4. Mọi số dưới đây đo trên **cùng một bản chụp** supplier.json 16:25 (scratchpad `r3/supplier-snap.json`).
- Trang web của nguồn internet (thư mục chạy cũ không còn) dựng lại từ URL + câu trích đã ghi, giống nhau cho mọi lượt đo (22 trang).
- Số nền thấp hơn số điều phối chỉ chút ít (tổ máy 298 vs 313, đầu phát 185 vs 205) nên không nhắn trước khi làm.

## Bảng "chưa rõ" theo part + mã (ĐO)
### Tổ máy
| mã | nền (main) | sau phần 1–2 | sau phần 3–4 |
|---|---|---|---|
| power_factor | 28 | 8 | 8 |
| ambient | 23 | 23 | 4 |
| fuel_consumption | 23 | 23 | 23 |
| genset_origin | 21 | 21 | 21 |
| iso8528_class | 20 | 20 | 20 |
| fuel_consumption_50 | 20 | 20 | 20 |
| dimensions | 20 | 20 | 2 |
| noise | 19 | 19 | 6 |
| fuel_consumption_75 | 18 | 18 | 18 |
| weight | 17 | 17 | 1 |
| frequency | 13 | 13 | 13 |
| overload | 12 | 12 | 3 |
| load_step | 10 | 10 | 10 |
| fuel | 10 | 10 | 10 |
| power_prime | 9 | 7 | 7 |
| power_standby | 9 | 7 | 7 |
| genset_make | 9 | 9 | 9 |
| other | 6 | 6 | 6 |
| current | 5 | 1 | 1 |
| genset_type / fuel_tank / standards / speed | 2 / 2 / 1 / 1 | như cũ | như cũ |
| **tổng** | **298** | **270** | **195** |

### Đầu phát
| mã | nền | sau phần 1–2 | sau phần 3–4 |
|---|---|---|---|
| alt_insulation | 35 | 31 | 31 |
| alt_type | 30 | 30 | 30 |
| alt_origin | 19 | 19 | 19 |
| alt_vreg | 15 | 15 | 15 |
| alt_make / alt_power | 14 / 14 | như cũ | như cũ |
| alt_poles | 13 | 13 | 13 |
| alt_cooling | 12 | 12 | 12 |
| other (quá tốc độ, 300%/10 s) | 10 | 9 | 9 |
| alt_thd | 5 | 4 | 4 |
| power_prime / alt_model / alt_bearing / alt_ip / power_factor | 5 / 5 / 4 / 2 / 2 | như cũ | như cũ |
| **tổng** | **185** | **179** | **179** |

Thay đổi phần 1–2 theo từng check (nền → a4e5e90): current unclear→met 4; power_factor unclear→met 20 + 1 check mới met; power_prime 2, power_standby 2 unclear→met; alt_insulation 4, alt_thd 1 unclear→met; other (300%/10 s) 1 unclear→confirm (order). **0 "không đạt" mất, 0 check đạt bị hạ.**

## Số model đầu phát có từng thuộc tính (tờ TD một model đã lưu)
35 model có tờ TD một model (stamford-avk-china 1001–1020, gfe-power 1008/1021/1030, wintpower 1002–1014): cấp cách điện 33, THD 35, ổ đỡ (1/2) 32, tự kích 31, PMG 28, quá tốc độ 28, số cực 7 (chỉ tờ đời S), 300%/10 s 1 (S5L1D-H4), "brushless" 0 (không tờ nào ghi chữ này → không kết luận "không chổi than").
Trong 35 đầu phát của 48 cấu hình chỉ **6** có tờ đúng mã: WT544C, UCDI274K, UCI274G, UCI274H, HCI544D, "Stamford S5L1D-H4". Còn lại là mã TQ (JET, BW, EL, NF, TFW…) hoặc tên không đúng mã tờ (S5L1D-H41 ≠ S5L1D-H4, HCI444ES, HC4D, 544C…) → giữ "chưa rõ" theo quy tắc `ratingsFor`.
Không làm: làm mát (tờ chỉ ghi "COOLING AIR m³/sec", không ghi quạt/IC01), không chổi than (không có chữ), dải ổn định điện áp (giữ `vregChecks` #521), dòng ngắn mạch ở tờ đời cũ (chỉ có đường cong + "SERIES 4 CONTROL DOES NOT SUSTAIN").

## (2d) Các ca power_prime / power_standby còn "chưa rõ" dù offered có số (nền: 9 + 9 tổ máy, 5 đầu phát)
| Gói / cấu hình | Mã | Nguyên nhân | Xử lý |
|---|---|---|---|
| IB2600592684-2 #4 YCM400CC, #5 YCM440CC | prime + standby | Lỗ hổng code: không code nào đối chiếu cột Prime/Standby đã có nhãn ("Standby Power (ESP)" / Prime) | **Sửa** (`powerChecks`): 4 check → đạt |
| IB2600574589 #3 WT-YC481 | prime + standby | Nguồn tự mâu thuẫn: tiêu đề "KVA/KW" nhưng ô ghi 350/438 (kW/kVA) | Để nguyên (`ratedRowPower` từ chối) |
| IB2600592684-2 #1 UC500GF, IB2600594596-1 #3 UW300GF, IB2600603983 #3 UP750GF | prime/standby | Bảng chỉ "Power(kW) / Power(kVA)", không ghi prime/standby | Để nguyên |
| IB2600594596-2 #1 | prime/standby | Bảng "Hz kWe kVA Amps kWe kVA" không nhãn mức | Để nguyên |
| IB2600601812 #1 | prime/standby | Nguồn internet, câu trích không có trong trang đã lưu (unverified) | Để nguyên |
| IB2600581294 #1–4, #6 | power_prime (part đầu phát) | Yêu cầu agent gắn cho đầu phát ("công suất liên tục riêng của đầu phát") | Không đổi (an toàn #507: kVA đầu phát là câu hỏi NCC) |

## (2e) Tiêu hao nhiên liệu — chỉ báo cáo, không sửa
Nền: fuel_consumption 23, _75 18, _50 20 chưa rõ. Mọi ca có dòng tổ máy: dòng **không có** spec tiêu hao (`specs` rỗng cho fuel/fuel75/fuel50) → `fuelChecks` không có số để so, không phải lỗi. Còn lại: 11 ca không có dòng (nguồn internet / dòng không còn trong danh mục), 4 ca internet unverified, IB2600603983 HSMT đòi 70% tải (không phải 75%) nên agent tự giữ chưa rõ, IB2600586587 #1 agent có 206,9 g/kWh nhưng thiếu kW ở tải tương ứng để quy đổi L/h; IB2600594596-1 #3 dòng có "56.1" dưới cột "Rated Power(kW) | No. of…" — catalog không xếp vào cột tiêu hao, không rõ đơn vị → không sửa. Không có ca nào "đủ g/kWh + kW trong nguồn" mà code bỏ sót.

## (2c) Tần số — 0 ca đổi
13 ca chưa rõ: dòng/tiêu đề không ghi Hz (ca có "50Hz" đã đạt nhờ `stdChecks`). Chỉ IB2600581294 #5 có cột "Speed (rpm)" = 1500 nhưng số không đi kèm chữ "rpm" trên dòng, và đầu phát 544C không có tờ ghi số cực → không kết luận. Quy tắc 1500 v/p + 4 cực có test (`cfg-r3.test.mjs`), chưa có ca thật.

## Thứ hạng
**Không gói nào đổi thứ hạng** (cả phần 1–2 lẫn 3–4; so từng cấu hình theo động cơ + đầu phát + BĐK). Lý do: các check đổi rơi đều vào mọi cấu hình của cùng gói (cùng HSMT, cùng loại dòng bảng).

## Mẫu đối chiếu (dòng nguồn nguyên văn + URL)
1. **Thuộc tính đầu phát — cấp cách điện** (IB2600586587 #1, UCI274G, HSMT "Class H hoặc C" → đạt): stamford-avk-china [1005] https://www.stamford-avk.com/sites/stamfordavk/files/UCI274G-311-TD-EN_Rev_C.pdf — "| INSULATION SYSTEM | CLASS H".
2. **Thuộc tính đầu phát — THD** (IB2600574589 #3, WT544C, HSMT "≤ 5%" → đạt): wintpower [1011] https://www.wintpower.com/uploads/WT544C.pdf — "| WAVEFORM DISTORTION | NO LOAD < 1.5% NON-DISTORTING BALANCED LINEAR LOAD < 5.0%".
3. **Thuộc tính đầu phát — 300%/10 s** (IB2600603983 #2, "Stamford S5L1D-H4" → xác nhận khi đặt hàng, chọn kích từ PMG): stamford-avk-china [1018] https://www.stamford-avk.com/sites/stamfordavk/files/ES10461983_S5L1D-H4-B-W311.pdf — "This alternator is capable of achieving a … balanced 300% sustained short circuit for up to 10 … seconds." (ba dòng liền, PDF cắt ô).
4. **2a cosφ** (IB2600574589 #1, HSMT "cosφ 0,8 (trễ)"): jet-power [101] https://www.jetgenset.com/50hz-16kva-to-2500kva-sdec-diesel-generator-set.html — tiêu đề "| Standby output | Prime Output |…" / "| KVA | KW | KVA | KW |", dòng "| SD-440 | 440 | 352 | 400 | 320 | 6ETAA12.8-G21 |…" → cosφ = 320 / 400 = 0,8 (Prime).
5. **2b dòng điện** (cùng cấu hình, HSMT "≥ 600 A tại 380 V"): cùng dòng → I = 400 × 1000 / (√3 × 380) = 607,7 A ≥ 600 A (agent đã tính đúng nhưng bị gắn unverified vì 380 không ở câu trích nguồn; giờ code tính).
6. **2d công suất** (IB2600592684-2 #4, HSMT ≥ 500 kVA / 400 kW prime): dòng "| YCM400CC | 550 | 440 | 500 | 400 | CCEC | KTA19-G3A |…", tiêu đề có "Standby Power (ESP)" và Prime → prime 500 kVA / 400 kW đạt.
7. **2c tần số**: không có ca thật (xem trên); mẫu trong test `freqChecks`.
- Ca cosφ làm tròn: IB2600581977 #1/#3 dòng "| V-344 | 344 | 275 | 313 | 250 |" → 250/313 = 0,799, HSMT "≥ 0,8" → đạt với ghi chú "trong mức làm tròn số kVA của bảng (±0,005)" (313 = 250/0,8 làm tròn).

## Rủi ro còn lại + cách quay lui
- `powerChecks` thay kết luận của agent khi agent ghi sai cột (test cũ `config.test.mjs` "a number not in the source quote…": agent ghi 500 kVA = cột Standby → trước là "chưa rõ", giờ code đọc cột Prime 450 kVA → đạt, `was: "unclear"`). Đúng theo nguồn, nhưng lỗi của agent không còn hiện ở check đó.
- cosφ chấp nhận chênh ±0,005 do làm tròn kVA của bảng (2 ca).
- Thuộc tính đầu phát lấy tờ chính hãng theo mã model; đầu phát của nhà lắp ráp TQ ghi "Stamford …" nhưng là hàng khác/nhái thì tờ hãng không đúng — giống rủi ro đã có của `ratingsFor`/hiệu suất.
- Lỗi có sẵn ở main (ngoài phạm vi, KHÔNG sửa): `config-bot.mjs` dòng 1166 và 1170 (`CTL_WORDS`) chứa 6 ký tự backspace thật (0x08) thay cho `\b` (vd. `/\bLCD\b|…/`) → các nhánh đó không bao giờ khớp. Nên sửa ở PR riêng.
- Quay lui: revert commit a4e5e90 (phần 1–2) và/hoặc b08fa88 (phần 3–4). Kết quả configmatch đã ghi vẫn hiện trên web cũ (trường thêm `sheetSrc`, `rule`, `why`, `was` bị bỏ qua). Sau khi merge phải chờ tiến trình `config-bot.mjs run` đang chạy thoát / restart bot (bẫy code cũ).

## Việc chưa kiểm
- Chưa chạy lượt agent thật; prompt (`formulasMd`) nay liệt kê thêm `pf_from_kw_kva` — chưa xem agent dùng.
- Chưa xem trên web (cục bộ hay Vercel) phần hiển thị công thức cosφ / dòng điện và ghi chú tờ hãng.
- Ca thật cho 2c (tần số qua số cực), số cực, ổ đỡ, kiểu kích từ: có code + test, 0 ca trong 48 cấu hình.
