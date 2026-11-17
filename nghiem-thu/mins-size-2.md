# Nghiệm thu: ngưỡng của cỡ khác ở gói nhiều cỡ (PR mins-size-2)

PR nháp: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/585 (nhánh `mins-size-2`, 5 commit trên origin/main 8f29482 = có #584). Worktree `C:\Projects\GenSet Pro\wt-mins-size-2`. Không chạy agent, không ghi web.

**Về #584** (phiên khác, đã gộp main 10:20Z trong lúc làm): nó thêm câu "Công suất liên tục/dự phòng: N kVA" (có dấu hai chấm) → đã tự gỡ **IB2300363623**; 3 ca kia #584 chưa gỡ. PR này đặt trên main có #584, giữ nguyên luật "agreed" của #584, phần nhận câu không dấu của #584 được thay bằng mẫu rộng hơn (`CAP_LABELED`, nhận cả "(Min) 40 kVA", không chỉ dấu ":"). Số đo dưới đây: **trước = main có #584**.

## Nguyên nhân
Cả 4 gói: `sizeBlocks` không dò ra khối nào (`runs = []`) → mọi ngưỡng thành "chung" → áp cho mọi cỡ. Mốc khối bị bỏ sót: dấu `>` ("> 42,0 kVA/ 33,6 KW", IB2400313681); nhãn + số không dấu ("Công suất liên tục (Min) 40 kVA / 32 kW", IB2500512614); cỡ chỉ nêu ở tiêu đề ("1.3.2. Điều chuyển Máy phát điện 22kVA", "Máy phát điện 10,5kVA", IB2500385135; công suất liên tục ở đó là của động cơ, tính bằng kW).

## Tệp đổi (`suppliers/`)
- `config-bot.mjs`:
  - `sizeBlocks`: `CAP_SIGNED` (thêm `>`), `CAP_LABELED` (nhãn Liên tục/Cơ bản/Dự phòng/Prime/Standby + ≤30 ký tự không số + số; bỏ nếu là động cơ, "tối đa/max"), tiêu đề `CAP_HEAD`/`isHead` (dòng ≤120 ký tự, sau số mục/gạch đầu dòng ≤25 ký tự rồi "máy phát"/"tổ máy phát", chữ đầu viết hoa; mọi số kVA (kW nếu gói có cỡ kW) phải cùng một cỡ, theo liên tục hoặc dự phòng của cỡ đó; danh sách "30, 42kVA" / "12 và 40 kVA" bỏ qua). "12,5 ±0,5 KVA" → 12,5 (xoá dung sai, giữ độ dài dòng).
  - `minsForSize`: "chung" (phần ngoài khối) chỉ dùng khi **mọi cỡ có khối** (`allFound`), trừ `minPrime` (đã bị buộc bằng cỡ ±0,6%). Không thì null, `how = "size unknown"`, và `note` ≤ 300 ký tự liệt kê ngưỡng không xác định được (cả "own: disagree").
  - `hintsOf`: thêm `sizeNote`; `catalogMd` in `sizeNote` dưới dòng thứ tự ưu tiên.
- `mins-size.test.mjs`: test "không có câu công suất → toàn văn như cũ" đổi thành "→ null + ghi chú" (đúng nguyên tắc brief).
- `mins-size-2.test.mjs` (mới, 6 test, trích nguyên văn 4 gói + các biên tiêu đề).

## Lệnh kiểm đã chạy
- `node --test suppliers/` → `# tests 454 / # pass 454 / # fail 0` (main sau #578/#584 = 454 test; brief ghi 425 là trước khi main tăng).
- `node suppliers/verify.mjs` → `433 bản ghi, 0 có lỗi`.
- Đo: `C:\Projects\GenSet Pro\genbid-test\mins2\measure584.mjs <shard> 6` (6 tiến trình; như `soat-nguong\measure3.mjs`: bộ 1.539 lượt kiem-rong, `hintsOf(text,"",sizing)` truyền `{size,sizes}` như `prep()`, `plausible()` rồi `candidates()`); mã trước = worktree tách `wt-ms2-base` @ac495a4 (cây giống hệt origin/main 8f29482, `git diff` rỗng); tổng hợp `an584.mjs`. Đầu ra: `shard 0..5 xong: 259/241/248/276/264/251 lượt` = 1.539, 0 lỗi.

## Số đo trước/sau (đo, không ước tính)
| chỉ số | giá trị |
|---|---|
| lượt đổi ngưỡng | **103** / 1.539 (54 gói; 0 lượt gói một cỡ) |
| dòng đổi loại | **12.582** (trả lại 1.560, loại thêm 11.022) |
| lượt đổi top 3 | 36 (27 gói); dòng mới vào top 30: 587 |
| lượt có ghi chú `sizeNote` | 53 |

Theo ngưỡng (được mới / bỏ / đổi giá trị): minCyl 24/19/0; minDisp 20/5/3; minPrime 38/5/16 (16 "đổi" chỉ là bỏ cờ `fromOther`, cùng giá trị, 0 dòng đổi); maxFuel 20/1/4; maxFuel75 17/0/4; maxFuel50 6/1/4; maxDisp 6/0/0.
"Loại thêm" chủ yếu vì khối nay dò ra nên mỗi cỡ đọc được ngưỡng riêng của nó (trước: hai giá trị khác nhau trên toàn văn → null). 1.360 dòng ở 33 lượt chỉ đổi minPrime (Prime ≥ đúng cỡ).

Top 3 đổi:
1. IB2400375383 300 kVA (150/300): được maxDisp 8,8 L, tiêu hao ≤65/49/35 L/h → loại 0 → 1.196. Đúng theo HSMT: khối 300 kVA ("Công suất dự phòng 300 kVA") ghi "Tổng dung tích xy-lanh ≤ 8,8 L", "≤ 65 L/hr". HSMT viết quanh một động cơ cụ thể nên loại rất nhiều.
2. IB2400448320 300 kVA: cùng văn bản như (1).
3. IB2300163186 200 kVA (15/30/100/200): được minDisp 9,726, ≥6 xi lanh, Prime 200 → 0 → 900. Khối "* Máy phát điện công suất 200 KVA": "Dung tích xylanh >9,726 lit", "Số xy lanh … > 6".

## 4 ca của brief (đều hết sai)
| gói | trước (main có #584) | sau |
|---|---|---|
| IB2300363623 5 kW | đã null nhờ #584 (main 2539c21 trước #584: 1,758) | null (khối 5 kW mở ở "Công suất dự phòng: 5.8kW"; ">456cc" không đọc vì `AT_LEAST` không có `>`) |
| IB2500385135 10,5 kVA | minDisp 2,197 | **null** (2,197 nằm trong khối "Máy phát điện 20KVA"); 68 dòng trả lại |
| IB2500512614 22 kVA | minDisp 2,3, ≥4 xi lanh, tiêu hao 11,8 | **null cả ba** (khối "1.3.2. Điều chuyển Máy phát điện 22kVA" không có yêu cầu động cơ) |
| IB2400313681 42 kVA | minDisp 3,3 | **null** (khối 42 kVA ghi ">3.71ít", OCR hỏng, không đoán số); 30 kVA giữ 3,3 |

## 3 mẫu đối chiếu nguồn (văn bản HSMT đã tải: `genbid-work\specs\<gói>\files\`, chưa có URL muasamcong trong kho)
1. IB2500512614, tệp "Chuong V. TCKT_.pdf": "1.3.1. Máy phát điện chạy dầu 40kVA - 3 pha" … "Tổng dung tích xy lanh ≥ 2.3 L"; rồi "1.3.2. Điều chuyển Máy phát điện 22kVA Hub Quận 8 đến Hub Bến Lức". → 2,3 L chỉ của 40 kVA.
2. IB2400313681, tệp "CHUONG V-YEU CAU VE KY THUAT-MAYPHATDIEN 30,42KVA-2024.pdf": mục 1 "Tong dung tich xilanh > 3.3 lit"; mục 2 "2. Máy phát điện Diesel 42kVA/ 3pha" … "Tong dung tích xilanh >3.71ít".
3. IB2500385135, tệp "Chương V Yeu Cau ky thuat.rar": "Máy phát điện 20KVA" … "Dung tích xy lanh" / "2.197 L"; "Máy phát điện 10,5kVA" … không có dòng dung tích xi lanh (chỉ "Dung tích nước làm mát: 8.6 L").

## Soát tay 30 lượt ngẫu nhiên (seed 20261112, `sample30.json`) + 6 lượt phát sinh ở lần đo cuối
Cách soát: `blk.mjs <gói>` in khối (dòng đầu khối) và dòng nêu ngưỡng trong từng khối, `ctx.mjs` in nguyên văn.
| lượt | đổi | phán |
|---|---|---|
| IB2400275648 30 kVA | minDisp 4,5→3,3 | ĐÚNG: "YÊU CẦU MÁY PHÁT ĐIỆN 30 KVA" … "Tổng dung tích xilanh ≥3,3 lít" (4,5 là của 60 kVA) |
| IB2400427929 8,5 / 20 / 45 kVA | Prime = cỡ; 20: tiêu hao 7,5→5,5; 45: dung tích 6→4,2, tiêu hao 20→12 | ĐÚNG: trước bị lệch một cỡ (20 nhận của 30, 45 nhận của máy 60 kVA thứ 5); khối từng máy theo tiêu đề "…liên tục/dự phòng 30kVA/33kVA"; 45 kVA "≥ 4,2 lít", "≤ 12 L/h" |
| IB2400550271 1.800 kW | Prime 1.800 kW | ĐÚNG ("máy công suất liên tục 1800kW") |
| IB2500533266 100 kVA | 4,3 L, ≥4, Prime | ĐÚNG ("1. Máy phát điện 100 KVA" … "Dung tích xi lanh Lít ≥ 4.3", "Số xylanh ≥4") |
| IB2400248480 2.250 kVA | Prime 2.250 → null | MẤT ngưỡng đúng (an toàn): cỡ "7.500 kVA" là tổng 3×2.500, tiêu đề 2.500 kVA mở khối không cỡ; 173 dòng trả lại |
| IB2400459339 50 / 75 kW | 4,3 / 4,5 L | ĐÚNG ("Tổ máy phát điện thủy 50kW … Dung tích xi lanh 4,3 lít"; số trần = tối thiểu L2) |
| IB2200006257 3 kVA | ≥0,198 L | ĐÚNG ("2.2 Máy phát điện 3KVA … ≥ 198cc"), 0 dòng đổi |
| IB2300163186 15 kVA | ≥4 xi lanh, Prime | ĐÚNG; dung tích ">2.31ít" OCR không đọc → null |
| IB2400375383 300 kVA | ≤8,8 L, tiêu hao | ĐÚNG theo HSMT (xem top 3) |
| IB2500061368 250 kVA | Prime 250 | ĐÚNG ("Công suất liên tục (Prime) >250kVA") |
| IB2500114642 250 kVA | ≥6 xi lanh | ĐÚNG ("Máy phát điện 250KVA/200KW" … "Số xylanh: 6") |
| IB2500500319 12 kVA | Prime bỏ cờ fromOther | không đổi dòng |
| IB2200046063 10,5 kVA | 2,5 L, ≥4, tiêu hao 4/3 | ĐÚNG ("a. Yêu cầu kỹ thuật máy phát điện 10.5 KVA" … "Dung tích xilanh ≥ 2,5 lít", "≤ 4,0 L/h") |
| IB2300163844 8 kVA | 0,667 L, ≥1, Prime 8 | ĐÚNG (khối "1.2.2.Máy phát điện 8KVA") |
| IB2400313681 42 kVA | 3,3 → null, Prime 42 | ĐÚNG (ca brief) |
| IB2400514548 6 / 7 kVA | ≥1 xi lanh → null | MẤT (an toàn, ngưỡng vô nghĩa): không khối nào, ghi chú |
| IB2600128010 250 / 500 kVA | Prime bỏ cờ fromOther | không đổi dòng |
| IB2600477305 12,5 kVA | (lần cuối) ≥3 xi lanh, ≤4 / 3,2 L/h | ĐÚNG ("A Yêu cầu đối với tổ máy phát điện 12,5 ±0,5 KVA" … "Số xilanh ≥3"); 15 kVA ≥4 |
| IB2200062073 30 kVA | Prime bỏ cờ | không đổi dòng |
| IB2300032777 12 kW | ≥4 xi lanh → null | MẤT ngưỡng có lẽ đúng (an toàn): câu "Công suất liên tục (kW) > 10,5" (đơn vị trong nhãn, 10,5 ≠ cỡ 10) không làm mốc khối; "Số xi lanh 4" ở cả hai mục; 60 dòng trả lại |
| IB2300042764 2.250 kVA | Prime → null | như IB2400248480 |
| IB2300274793 400 kVA | Prime bỏ cờ | không đổi dòng |
| IB2500271331 12 kVA | Prime 12 | ĐÚNG ("II Máy phát điện 12 KVA-1 Pha") |
| IB2500337925 12,5 kVA | Prime 12,5 | ĐÚNG ("Công suất liên tục > 12.5 KVA/ 12.5 KW", máy 1 pha) |
| IB2600592684 30 kVA | Prime 30 | ĐÚNG ("Tổ máy phát điện 30kVA … Prime Power: 30KVA/24KW"); 500 kVA bỏ 3,9 L của 30 kVA (đúng như soat-nguong-disp) |
| 6 lượt phát sinh: IB2300245556 8,5/10,5/12,5; IB2400125924 12,5; IB2600477305 15 | 10,5 kVA tiêu hao 4,9→4,35 | ĐÚNG: 4,9 là của 12,5 kVA; khối 10,5 "≤ 4,35 lít/giờ"; 12,5 kVA IB2400125924 "≤ 5 lít/giờ" |
Kết quả mẫu: không ca nào từ đúng thành sai; 4 lượt mất ngưỡng (đúng hoặc vô nghĩa) theo hướng an toàn (ít loại hơn). Ngoài mẫu đã soát thêm IB2400433961 (304 L/h của 1.500 kVA bỏ khỏi 600 kVA: đúng), IB2400602840, IB2300120176, IB2400563426 (đúng).

Lỗi tìm thấy trong lúc soát và đã sửa trong PR (commit riêng): tiêu đề "liên tục/dự phòng 30kVA/33kVA" bị coi không cỡ; "12,5 ±0,5 KVA" đọc thành 0,5; "6 máy phát điện 12,5KVA" (số lượng) bị coi là tiêu đề; tiêu đề sau dấu "−" (U+2212).

## Rủi ro còn lại
- Tiêu đề mở khối tới mốc khối kế tiếp: phần chung ở cuối văn bản vẫn tính vào khối cuối (chưa đóng khối ở tiêu đề cấp trên); danh mục hàng đầu văn bản ("+ Máy phát điện … 300 KVA Cái 01") cũng mở khối ngắn (vô hại ở các ca đã xem).
- Luật `allFound` bỏ ngưỡng chung khi có cỡ không dò ra khối: mất ngưỡng đúng ở gói như IB2300032777, IB2600457659 (cỡ kW nêu "(kW) > 10,5", "Công suất: 13,5 KW"), IB2400248480 (cỡ là tổng). Chỉ làm lọc ít đi, có ghi chú cho agent.
- 11.022 dòng loại thêm là ngưỡng thật của HSMT nay đọc được theo cỡ; HSMT viết quanh một động cơ (IB2400375383 "≤ 8,8 L") loại rất mạnh: đúng theo văn bản.
- Quay lui: revert PR #585 (độc lập với #584); sau merge restart bot (vòng điều phối nạp script một lần).

## Chưa làm / chưa kiểm
- ">" chưa tính là "tối thiểu" cho dung tích (`AT_LEAST`): "Dung tích động cơ > 456cc" (IB2300363623 5 kW) không đọc; ngoài phạm vi khối, đổi sẽ ảnh hưởng gói một cỡ.
- Mốc khối kiểu "Công suất liên tục (kW) > 10,5" (đơn vị trong nhãn), "Công suất: 13,5 KW" (không nhãn liên tục).
- Không chạy agent thật; không đo đường Tìm NCC (`checkNewConfigs`, đã nhận cỡ từ #584).
- Tệp đo: `C:\Projects\GenSet Pro\genbid-test\mins2\` (`measure584.mjs`, `an584.mjs`, `out584\changed.json` = 103 lượt, `sample30.json`, `blk.mjs`, `ctx.mjs`, `dbg.mjs`).
