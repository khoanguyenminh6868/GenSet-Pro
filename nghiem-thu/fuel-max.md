# Nghiệm thu: tiêu hao nhiên liệu vượt mức HSMT thì loại hẳn khỏi `candidates()` (PR nháp, nhánh `fuel-max`)

PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/577 (DRAFT, chưa merge). Worktree `C:\Projects\GenSet Pro\wt-fuel-max` từ origin/main f214592 (#575, #576). Trước = checkout chính (cùng f214592). Không chạy agent, không ghi web.

## Tệp đổi
- `suppliers/config-bot.mjs`: vòng "tiêu hao nhiên liệu" trong `candidates()` (~dòng 1026).
- `suppliers/fuel-max.test.mjs` (mới, 5 test). Không sửa test cũ nào.

## Cách làm
- Trước: dòng có tiêu hao (L/h, đúng mức tải 100 / 75 / 50%) vượt mức HSMT bị trừ 300 điểm + cờ `fuelOver`, vẫn nằm trong `rows`.
- Nay: cùng điều kiện thì thêm `ruled.push("fuel" | "fuel75" | "fuel50")`; cơ chế sẵn có của #555 loại dòng đó khỏi `rows` / `top`, đưa vào `dropped` (kèm `ruled`). Ngoại lệ y như các ngưỡng khác: dòng `named` (HSMT ghi đúng model động cơ) ở lại với −300 và lý do. Dòng không có số tiêu hao (hoặc chỉ g/kWh, hoặc khác mức tải) thì giữ như trước.
- Bốn chốt chặn thêm sau khi soát tay và theo điều phối (loại oan); chốt 4: nhãn tiêu hao không nói mức tải (xếp 100%) thì không loại, giữ −300 + cờ `fuelNoLoad`:
  1. Giá trị g/kg/hp (g/kWh…) dưới nhãn có chữ "(L/h)" không được so (`230 g/kWh` từng bị coi là 230 L/h).
  2. Giá trị dạng cận "< 10" / "≤ 10" không so (chỉ nói dưới 10; 762 dòng bị bỏ khỏi số đo).
  3. Số vượt 0,6 L/h mỗi kVA của cỡ (cặp kW/kVA dưới nhãn "Cons 100% (L/H)": `220/275` cho 242 kVA) không so.
- Đơn vị / mức tải: đúng như trước (`fuelAt`: nhãn hai mức "@75% / @100%" lấy số đúng vị trí; ngưỡng 75% chỉ so với số 75%).

## Lệnh kiểm + đầu ra
- `node --test suppliers/` → 423 pass, 0 fail (sau chốt chặn 4). `node --test suppliers/fuel-max.test.mjs` → 6 pass.
- `node --test suppliers/fuel-max.test.mjs` → 5 pass: loại ở 100% (kèm `ruled`, `dropped`), 75% so với số 75% riêng, bằng ngưỡng thì giữ + `named` giữ −300, không có ngưỡng thì không loại, hai chốt chặn (cận, cặp kW/kVA, g/kWh).

## Số đo CUỐI (ĐO TRỰC TIẾP bằng code cuối của PR, toàn corpus; script `genbid-testuel-full.mjs` 4 luồng, `fuel-reg.mjs`; bản chụp 12/11)
Code cuối = 3 chốt chặn (cận, g/kWh, >0,6 L/h/kVA) + nhãn không nói mức tải thì không loại (theo điều phối). Các số 3.320 / 4.088 ở bản nghiệm thu trước đã bỏ, thay bằng số dưới.
- 1.539 lượt gói × cỡ có cỡ; **238** có HSMT nêu mức tiêu hao tối đa dùng được. Trong 238 lượt: 115.461 dòng xếp hạng trước; **loại 1.867 dòng = 1,62%**, ở **107 lượt / 104 gói**. Theo mức: 100% 1.648, 75% 331, 50% 178 (một dòng vượt nhiều mức đếm ở mỗi mức). Ít nhất còn 117 dòng xếp hạng ở lượt có loại.
- **Nhóm nhãn không nói mức tải** (xếp là 100% nhưng nhãn không có 100% / full load / đầy tải / 满载 / 全负载, ví dụ "Fuel Consumption (L/h)"): vượt mức HSMT nhưng KHÔNG loại, giữ −300 điểm + `fuelOver` + `fuelNoLoad`: **1.439 dòng** ở 107 lượt (so với 1.867 loại). Đó là phần lớn các ca soát tay trước đây (aosif, westinpower…): nay chỉ bị trừ điểm như cũ.
- Top 30: 14 / 107 lượt có loại bị đổi (mất 1–2 dòng, thay bằng dòng khác): IB2300281362 (17), IB2400378609 (17), IB2600603983 (700), IB2300220876 (17), IB2300191244 (200) mất 2; IB2300192935 (1250), IB2600490077 (165), IB2400145438 (7, 12, 13.7), IB2600490227 (10), IB2300222010 (15), IB2500124299 (151), IB2600225281 (12) mất 1; 93 lượt giữ nguyên.
- Hồi quy configmatch (code cuối, 14 lượt / 12 gói, ĐO): **55 cấu hình, 0 đổi** (hạng 1–3: 25 còn trong top, 6 không có từ trước; không cấu hình nào rơi). Lượt có ngưỡng: IB2600574589 400 (1.248 → 1.227, top giữ), IB2600581294 500 (1.384 → 1.337, giữ), IB2600601812 100 (823 → 817, giữ), IB2600603983 700 (570 → 553; top mất 2 dòng, không cấu hình lượt trước nào dính: huadong-yangzhou QSK23-G2 ghi "100% 负载 燃油耗 （L/h） 138" > 113, bobig-power KTA38-G2 đổi chỗ).
- Dung sai: "vượt là loại", không dung sai (Khoa); điều phối hỏi Khoa riêng về dòng vượt < 5%. Hằng số dễ đổi: một so sánh `fv > hints[hk]` (config-bot.mjs, vòng tiêu hao của `candidates()`).
- Nối với PR "loại theo độ tin của nguồn" (nhánh `loai-theo-nguon`, phiên khác, cùng tệp): nếu PR đó đổi cách loại theo MỘT nguồn đơn lẻ thì `ruled`/`dropped` của dòng nhiên liệu ở đây cũng phải theo: chỗ nối là vòng tiêu hao (đẩy `ruled.push(fk)`) và `srcOf` / `below()` của dung tích; số tiêu hao lấy từ `u.specs` của chính dòng (một nguồn), không qua `modelFacts`.

## Soát tay 26 ca (từ bản đo trước đó, giữ lại; kết luận cập nhật)
Mọi ca đúng đơn vị L/h, đúng mức tải, số của dòng > ngưỡng; 9 ca đối chiếu được câu HSMT nguyên văn (IB2200038751 "7. Tiêu hao nhiên liệu tại 75% tải ≤ 10,5 L/h" vs westinpower 1103A-33TG2 "Fuel consumption75% (of the Prime Power) 10.8 L / h"; IB2200065274 "Tiêu hao nhiên liệu 100% tải liên tục: ≤ 171 lít/giờ" vs victory-generator KTA38-G2 "Full-Load Diesel Consumption (L/H) 194"; IB2300220876 "≤ 3,9 lít/ giờ" vs "Fuel consumption rate(L/h) 4.8" (nhãn không nói tải: nay KHÔNG loại); IB2300281362 "75% tải ≤ 2,9 lít/ giờ" vs "Fuel L/h @75% / @100% = 3.6 / 4.8" (lấy 3.6, loại); IB2400362458 "Tại 100% tải: ≤ 15.0 lít/giờ" vs aosif B3.9CS4-GT2 "Fuel Consumption (L/h) 17.2" (nhãn không nói tải: nay không loại); IB2500125567 "≤ 88.5 lít/giờ" vs aosif DP126CE "100%Prime 95L/h" (loại)). Loại oan tìm được: g/kWh dưới nhãn L/h, giá trị "< 10" (762 dòng), cặp kW/kVA "220/275": đã vá. Chỉ soát 26 ca; các ca còn lại là mức tải nhãn-không-nói (nay không loại).

## Rủi ro còn lại + quay lui
- Dòng vượt 1–5% vẫn loại (chờ Khoa).
- Dòng có nhãn nêu 100% nhưng thực chất khác mức tải (bảng ghi sai) có thể loại oan; chưa gặp trong 26 ca.
- Tìm NCC (`fitsCap`, `engineRows`, `mergeFind`) không xét nhiên liệu, không đổi.
- Quay lui: revert PR; sau merge restart bot (GenBid-Bot.ps1 nạp một lần).

## Chưa kiểm
- Chưa chạy agent thật; chưa biết chất lượng cấu hình agent chọn từ danh sách mới.
- Soát tay chưa lặp lại trên tập code cuối (26 ca của bản đo trước; 1.867 dòng loại cuối chưa soát từng dòng).
- Bản chụp supplier / analysis là bản 12/11.
