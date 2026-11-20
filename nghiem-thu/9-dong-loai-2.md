**Kết luận (CHỈ ĐỌC, không sửa luật): số dung tích sai mà không bị cờ có 2 nguyên nhân khác nhau. (1) yunding "392": reader tự bỏ số vì cổng hợp lý `likely` của `catalog.js` chỉ nhận dung tích 0,4–100 L, nên số sai KHÔNG vào bản ghi (đã được bảo vệ, chỉ không có cờ vì không có gì để cờ). (2) jlmech n102 / n104: hàng đơn vị của tiêu đề thiếu ô nên nhãn lệch ("Displacement (mm)"), số vẫn vào ĐÚNG khoá `disp` với nhãn sai và vào danh mục (`values`), chỉ `absurdOf` và `normFig` bỏ qua vì đơn vị không phải L. Tác hại thực: số sai hiện ở danh mục, không vào luật so dung tích của Gợi ý.**

Đo 20/11/2026 trên main 79e9b175, script scratchpad `exp.mjs`, `shift.mjs`, `drop2.mjs`, `build.mjs` (chỉ đọc).

## 1. yunding-jiangsu n2006 `YDY-1100GF` "392"
- Dòng: `| YDY-1100GF | 1100 | 1375 | 1980 | YC12VTD1830-D30 | 12 | 152*180 | 392 | 210 | 210 | 5000*2100*2200 | 9200`. Dòng kề cùng bảng cùng bore×stroke 152*180, 12 xi lanh: `YDY-1000GF … YC12VTD1680-D30 … 39.2`.
- Thí nghiệm (bản sao dòng, chỉ đổi ô): "392" → disp không có; đổi thành "92" → disp = 92 (đọc); đổi thành "39.2" → disp = 39.2. Vậy nguyên nhân là `likely("disp")` (`web/catalog.js` hàm `likely`, nhánh `case "disp"`: `x >= 0.4 && x <= 100`): số 392 ngoài dải thì lượt đi từ model dừng ở ô đó (`break` ở nhánh dòng tiêu đề `walkedSpecs`), ô đó không ra spec; các ô SAU nó (tiêu hao 210…) vẫn đọc từ lượt đi mép phải.
- Số 392 KHÔNG vào bản ghi, không vào Gợi ý. Không có gì để bắt bằng cờ.
- Phụ (tác dụng ngược của cổng 100 L): trên toàn bộ `cn`, 52 dòng có ô "đường kính×hành trình" kề số ngoài 0,4–100 mà không có spec `disp`, ở 9 bảng. Phần lớn là 105.56 L (hanyang-weifang n107: 16 xi lanh, hình học = 105,6 L, khớp số ghi, uleengen n130 / n134, frs-shenyang n103, yunding n2006 dòng khác): số ĐÚNG của động cơ lớn bị cổng bỏ. Số còn lại (jet-power 103–205, taihai-taizhou n110 160) chưa xác định là dung tích thật hay ô khác (heuristic lấy ô sau bore×stroke). Chưa đề xuất sửa cổng; ghi để điều phối quyết.

## 2. jlmech-wuhan n102 / n104: số được đọc thành gì
Hàng tiêu đề thứ hai của hai bảng: `| KW | KVA | A | mm | L | L | g/kw.h | mm | KG` (9 ô cho 12 cột): thiếu ô cho Engine model, Cylinder... nên mọi ô đơn vị dịch sang trái hai-ba cột. Kết quả `fromSupplier` cho `JL-320GF` (n102):
`cyl=6 (nhãn "Cylinder (L)")`, `bore=135*165 ("Bore*Stroke (g/kw.h)")`, `disp=142 ("Displacement (mm)")`, `oil=41 ("Lube oil (KG)")`, `fuel=205`, `dims`, `weight`.
- KHOÁ đúng (cyl, bore, disp, oil đều gán đúng cột theo TÊN tiêu đề), chỉ NHÃN đơn vị sai. Không có số nào vào khoá khác (đã so từng khoá với cột nguồn).
- Vào Gợi ý: `normFig` thấy đơn vị "mm" không phải L → "không so được" (luật CLAUDE.md: nhãn ghi đơn vị khác thì `missing: unit`, không mặc định L). Trong `candidates` chỉ tính như "phiếu chống" của NCC không so được. Trong `absurdOf` thì `null` (không xét), nên các số 142 / 249 / 433 không bị cờ.
- Vào danh mục (`C.build`): `values` của động cơ có thêm số thô. SC15G500D2: values {14.16, 14.2, 142}, votes 142:1, 14.16:13, 14.2:2, `win` = 14.16 (số đông; 142 không ảnh hưởng). YC2115ZD: values {2.5, 2.49, 249, 2.11}, `win` = null. YCD4J12D-55 (jlmech n104 JL-40GF, nguồn duy nhất): values {433}, KHÔNG có `win` ⇒ danh mục hiển thị dung tích 433 cho động cơ 4 xi lanh 105×125 (hình học 4,33 L), không ai chặn.
- Số sai trong 4 dòng jlmech (n102 JL-320GF, JL-350GF; n104 JL-30GF "249", JL-40GF "433"): theo hình học của chính dòng là mất dấu chấm, nhưng nguồn không ghi số đúng nên chưa ghi. Dòng JL-40GF xuất hiện hai lần trong n104.

## 3. Đếm toàn bộ `suppliers/cn`: bảng cùng cơ chế "nhãn đơn vị trái khoá"
Quét mọi bản ghi động cơ, so đơn vị ở cuối nhãn với đơn vị đúng của khoá (disp L/cc, oil L/kg, bore mm, weight kg, current A, cyl không đơn vị). 65 bảng có nhãn trái khoá; loại các nhãn hợp lệ ("Weight (Open / Silent)", "Weight (Dry)", "Bore x Stroke (mm x mm)", "KG (open)", "Cylinder number(mm)" là chữ tiêu đề gốc của NCC) còn các bảng lệch đơn vị THẬT:
| Bảng | Dòng | Nhãn lệch | Số trong cột |
|---|--:|---|---|
| jlmech-wuhan n102 | 29 | Displacement (mm), Cylinder (L), Bore*Stroke (g/kw.h) | dung tích đúng ở khoá, trừ "142" ×2 |
| jlmech-wuhan n104 | 38 | như trên | đúng, trừ "249", "433", "6.B7" |
| honny-dongguan n101 | 36 | 排量 (A) (đơn vị dòng điện) | 14, 17, 21… (đúng: 135×166×6 = 14,3 L) |
| honny-dongguan n102 | 29 | 排量 (A) | 33, 42… |
| honny-dongguan n103 | 1 | 排量 (A) | 86 |
| fukangsi-yangzhou n2010 | 24 | 缸数 (L) | số xi lanh |
| kangwo-xiamen n101 | 13 | 重量(cm) | khối lượng |
Cùng cơ chế với jlmech là 7 bảng / ~170 dòng; riêng nhãn DUNG TÍCH sai đơn vị: 5 bảng (jlmech ×2, honny ×3), 133 dòng. honny: số đúng nhưng `normFig` coi là "thiếu đơn vị" (nhãn "(A)") nên 66 dòng dung tích đúng của họ không tham gia so khi HSMT đòi dung tích. Không có dòng nào của 7 bảng này (ngoài 4 dòng jlmech trên) mang số vô lý theo hình học.
- Số bị cổng 100 L bỏ (mục 1): 9 bảng, 52 dòng, khác tập với 7 bảng này (chỉ yunding n2006 là cả hai: không nằm trong 7).

## 4. Việc không làm (đợi Khoa)
Không đổi luật cờ, không đổi `likely`, không đổi cách gán nhãn đơn vị. Nếu Khoa muốn: (a) áp ngưỡng `absurdOf` cho số thô khi đơn vị "không đọc được" (bắt đúng 4 dòng jlmech, oan 0, ở bản đo 20/11); (b) sửa gán nhãn đơn vị khi hàng đơn vị ngắn hơn hàng tiêu đề (tác động 7 bảng / ~170 dòng); (c) nới cổng 100 L (làm hiện 105,56 L của hanyang / uleengen / frs-shenyang). Cả ba đụng `catalog.js` / `row-flags-lib.mjs`, phải đo spec-diff toàn bộ.

## Chưa kiểm được
Heuristic mục 1 (ô sau bore×stroke) không phân biệt dung tích với ô khác; mục 3 chỉ dò nhãn có ngoặc đơn vị; không đối chiếu lại trang sống của honny / fukangsi / kangwo.
