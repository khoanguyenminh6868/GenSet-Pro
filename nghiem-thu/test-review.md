# Rà soát bộ testcase theo chuyên môn máy phát điện (13/11/2026)

Phạm vi: `suppliers/*.test.mjs` (52 tệp, 515 ca, CI job `suppliers`). Không rà `server/test` (1 tệp) và bot PowerShell.

## Hiện trạng trước khi rà
- 515/515 qua, ~37 s. 30 s trong đó là 2 ca `sup-skip.test.mjs` chạy cả `gaps.mjs` bằng tiến trình con (15 s mỗi ca).
- 2 ca `bcdg.test.mjs` tự bỏ qua trên CI (cần kho 19 báo cáo ở `genbid-test\bcdg`, chỉ có trên máy bot).
- Bộ test viết theo từng PR (cfg-r2, cfg-r3, mins-fix…): bám sát lỗi đã gặp, nhưng không có lớp "sổ tay kỹ sư" kiểm
  các phép tính và cách đọc nền tảng.
- Hàm xuất ra mà không ca nào nhắc tới: `web/conversions.js` 9/15 công thức (kw_from_kva, kva_from_current_3ph,
  gkwh_from_lph, kw_from_hp, kw_from_ps, rpm_from_poles, displacement_l, l_from_cuin, c_from_f);
  `web/bidprice.js` 33/66 (kvaOf, capPick, isGensetName, bidKind, movesOldSet, cfgKva…); `web/catalog.js` originOf,
  groupOf; `config-bot.mjs` 30/140 (powerRead, sectionsOf, sizesFor, ratedPower, sheetChecks, findPrep, specPrep…);
  `named-genset.mjs` 10/17; `api-budget.mjs` 4/5; `web-memo.mjs` 9/22. Cách đo: scratchpad `cov.cjs` (tên hàm có xuất
  hiện trong tệp test hay không; không phải độ phủ dòng).

## Đã bổ sung: `suppliers/domain.test.mjs` (33 ca: 23 qua, 10 `todo`)
Số mong đợi tính tay từ công thức hoặc số hãng công bố, không chép từ đầu ra của code.
- A. Quy đổi: đủ 15 công thức (500 kVA/400 V = 721,7 A; 4 cực 50 Hz = 1500 v/p; QSX15 137×169×6 = 14,95 L = 912 in³;
  hp ≠ PS; 200 g/kWh × 400 kW = 94,7–97,6 L/h theo EN 590; 440 kWm × 94,5% = 415,8 kWe; BMEP), đường lỗi, dung sai.
- B. Công suất: kVA/kW/MVA/ekW, dấu nghìn, kVAr, máy biến áp/UPS/22 kV cùng dòng, cặp liên tục–dự phòng 10%, số lượng.
- C. Tên gói: cung cấp / dịch vụ / di dời, tổ máy thủy điện, máy cũ di dời.
- D. Xuất xứ: bảng 27 hãng/model × G7, G20, G7+EU, G20+EU (Hàn Quốc chỉ G20, Thụy Điển chỉ khi có EU, Deutz không
  nhóm nào, hãng TQ, đọc theo mã model); câu xuất xứ HSMT (phạm vi tổ máy/bộ phận, phủ định, mã hàng "G7000").
- E. Ngưỡng HSMT: liên tục vs dự phòng vs kWm động cơ, dung sai ±, tiêu hao theo mức tải, dung tích L/cc/cm³, dải ứng
  viên ở ranh 30 kVA / 24 kW, ngưỡng phi lý.
- F. Mã yêu cầu: 40 cách gọi thật của HSMT, thuộc tính từng mã.

## Lỗi / khoảng trống tìm thấy (ghi thành ca `todo`, CHƯA sửa code)
Đo trên doc-cache 13/11: 1.301 tên gói, 48.580 dòng `technicalSpecs` của 1.287 phân tích.

| # | Chỗ | Hiện tượng | Số đo thật | Mức |
|---|---|---|---|---|
| 1 | `reqcodes.mjs` voltage / alt_avr | "Điều chỉnh điện áp tự động (AVR)", "Bộ điều chỉnh điện áp" ra mã `voltage` (Điện áp tổ máy) | 352/355 dòng | cao: `check` gộp yêu cầu trùng mã, AVR bị gộp vào yêu cầu 400/230 V |
| 2 | `reqcodes.mjs` | tên chuẩn của 4 mã không đọc ngược ra chính nó: fuel_system → other, alt_avr → voltage, alt_standard → other, ctl_display_lang → ctl_measure | 4/79 mã | cao: check ít khi mang `code`, bị tra lại theo tên (đã gặp ở #594) |
| 3 | `reqcodes.mjs` alt_short_circuit | "Khả năng chịu dòng ngắn mạch ≥ 300% trong 10 giây", "Dòng duy trì ngắn mạch" của đầu phát ra `ctl_protection` | 55/80 dòng có "ngắn mạch" ra ctl_protection (một phần đúng là bảo vệ) | vừa |
| 4 | `reqcodes.mjs` alt_insulation | "Cấp cách nhiệt", "Cấp tăng nhiệt" ra `other` | ≥ 34 dòng | vừa |
| 5 | `bidprice.js` + `genbid-sync.js` GENSET_RE | `\b` sau chữ Đ không khớp: "Cung cấp MPĐ 100kVA" không được coi là máy phát | 1 tên có MPĐ, tên đó vẫn nhận nhờ chữ khác → 0 gói sót | thấp |
| 6 | `bidprice.js` kvaOf | "1,250 kVA" đọc 1,25; "2 MVA" đọc null (capacity() đọc đúng) | 0 tên gói | thấp |
| 7 | `conversions.js` matches | sàn tuyệt đối 0,05: cosφ 0,80 "khớp" kết quả 0,85 | chưa đo | vừa: chỉ ảnh hưởng quy đổi do agent khai |
| 8 | `conversions.js` compute | nhận cosφ > 1, hiệu suất > 100%, số cực lẻ; từ chối nhiệt độ ≤ 0 °F | chưa đo | thấp |
| 9 | `config-bot.mjs` litres | "912 in3" đọc 0,912 L | 0 dòng danh mục có in³ | thấp |
| 10 | `bidprice.js` isGensetName | "máy phát điện gió", "máy phát điện năng lượng mặt trời" được coi là tổ máy | chưa đo | thấp |

Không coi là lỗi: model "6M33D670E200" không ghi hãng vẫn tính G7 (Khoa 11/11: Baudouin tính G7); "Công suất định mức
≥ 500 kVA" không ra ngưỡng liên tục (cố ý không đoán); COP đọc như PRP cho công suất (bẫy đã ghi ở cfg-r3).

## Đề xuất tiếp
1. Sửa #1–#4 trong `reqcodes.mjs` (thêm từ khoá + thứ tự), đo trước/sau trên 48.580 dòng và trên configmatch, cân nhắc
   tăng `REQ_VERSION`. Cần Khoa duyệt vì đổi cách gộp yêu cầu.
2. Sửa #5–#9 (mỗi chỗ 1–3 dòng), bỏ `todo` tương ứng.
3. Chưa có test cho: `sizesFor`, `ratedPower`, `sheetChecks`, `findPrep`, `specPrep`, `api-budget` (viaApi/switchToPlan
  — tiền thật), `named-genset` (brandLicensedChecks, namedRank). Nên viết khi đụng tới các hàm đó.

## Sửa (PR #624, Khoa duyệt "ok làm đi" 13/11)
Đã sửa #1–#4, #6 (chỉ dấu nghìn), #7, #8, #9. Test: 548 ca, 546 qua, 2 todo.

Đo trước/sau (script scratchpad `beforeafter.mjs`: main checkout so với worktree, trên doc-cache):
- 48.580 dòng technicalSpecs: 585 đổi mã. voltage → alt_avr 338; other → alt_insulation 63; alt_ip / alt_winding →
  alt_insulation 33; ctl_protection → alt_short_circuit 22; ~125 dòng nhiều ý trước ra voltage chỉ vì chữ "điều chỉnh
  điện áp" nay ra mã của ý khác trong dòng (alt_type 48, phases 26, frequency 12, battery 11…).
- 13 configmatch (457 yêu cầu, 1.951 check): 9 chỗ đổi, đều "Ngôn ngữ, màn hình bộ điều khiển" → ctl_display_lang.
- 46.991 tên gói / phần / hàng hoá / dòng cấu hình: kvaOf, kvaRated, isGensetName đổi 0; cfgPower 1.556 bidhist đổi 0.
- 32 quy đổi lưu trong configmatch: compute, matches đổi 0.

Thử rồi hoàn lại:
- #5 MPĐ: 0 tên gói được lợi, 126 dòng vật tư "MPĐ diesel - Dây curoa…" thành tổ máy (unitsOf, isSetRow dùng
  isGensetName cho dòng hàng hoá). Giữ todo; muốn sửa phải tách luật tên gói và dòng hàng hoá.
- Từ khoá "hệ thống nhiên liệu" cho fuel_system: 22 dòng bồn dầu rời fuel_tank. Tên chuẩn của mã giờ tra thẳng
  (`BY_ITEM` trong codeOf) nên không cần từ khoá này.
- #6 MVA/MW trong kvaOf: không làm (tên gói MW là tổ máy nhà máy điện). #10 máy phát điện gió: giữ todo, chưa đo.
Không tăng REQ_VERSION.
