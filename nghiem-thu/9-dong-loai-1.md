**Kết luận: cả 9 dòng (và 3 dòng huipu cùng kiểu) là NGUỒN GHI SAI, không phải mã đọc lệch. Trang sống của NCC khớp từng chữ với bản lưu, nên KHÔNG sửa mã đọc, KHÔNG cào lại. Đề xuất: `dropspec` riêng số sai cho 10 dòng + 1 dòng aosif AW1000 (xin Khoa duyệt); giữ cờ loại cho depco S6B-PTA. huatai n111 đã hết cờ (#948 `nopower`).**

Đo ngày 20/11/2026 trên `origin/main` a52179ee (#955), `node suppliers/row-flags.mjs --json`: 158 dòng có cờ, 16 dòng mức loại (`drop`). Mọi dòng "absurd:disp" kích hoạt bởi `absurdOf` (`row-flags-lib.mjs`): dung tích > 300 L, hoặc dung tích / kW prime của dòng ngoài [0,01; 0,3]. Trang sống tải bằng curl ngày 20/11 (HTTP 200), so từng ô với `suppliers/sources/<ncc>/<n>.md`: không ô nào khác.

## Bảng 9 dòng + dòng cùng nguyên nhân

| Dòng | Cờ / số kích hoạt | Nguồn thật ghi (trang sống = bản lưu) | Nguyên nhân | Đề xuất |
|---|---|---|---|---|
| aoke-yangzhou n129 b27 d1 `AOKE-C280` MTAA11-G3 | disp "108" (nhãn 排量(L)); 108/250 kW = 0,43 > 0,3 | `<td> 108</td>` ở cột 排量(L), trang catid=69. Cùng bảng: NTA855-G1B "14", SC13G420D2 "12.88" | Nguồn ghi sai (số ở cột L, không có dấu chấm) | `dropspec` disp (hai dòng) |
| aoke-yangzhou n129 d2 `AOKE-M275` 6R1600G20F | disp "105"; 105/250 = 0,42 | `<td> 105</td>` | như trên | như trên |
| jlmech-wuhan n103 b2 d18 `JL-1000GF` 4012-46TWG2A | disp "458" > 300 L | `458&nbsp;` ở cột Displacement (L); bore×stroke 160*190, 12 xi lanh. Dòng JL-1200GF liền sau ghi "45.8" | Nguồn ghi sai (mất dấu chấm); chính trang đó ghi 45.8 ở dòng kề | `dropspec` disp |
| jlmech-wuhan n104 b3 d12 `JL-180GF` YC6MK285L-D20 | dims "30001030*1550" | ô Size ghi đúng chữ `30001030*1550` | Nguồn ghi sai (mất `*`): KHÔNG đọc "3000*1030*1550" vì đó là đoán | `dropspec` dims |
| jlmech-wuhan n104 d14 `JL-220GF` Y06MK350L-D20 | dims "31001100*1750" | ô Size `31001100*1750` | như trên | `dropspec` dims |
| huatai-yangzhou n111 (3 dòng 700/800/850GF) | — | — | Đã `nopower` (#948); nay không còn cờ (xác nhận trong 158 dòng) | không làm gì |
| depco-power n2257 b261 `S6B-PTA` | disp "12.88" vì kW prime của dòng bị đọc là 32 (12,88/32 = 0,40) | Trang p534 tự mâu thuẫn: tiêu đề + "PRP 200 kW / 250 kVA, ESP 220 / 275" nhưng bảng Product Parameters "Prime 32kW/40kVA, Standby 35kW/44kVA", model DPK-DM-275. 12.88 L khớp 135×150×6 xi lanh (π/4·13,5²·15·6 = 12,88) nên số dung tích đúng, hỏng là công suất | Nguồn tự mâu thuẫn cả dòng | GIỮ cờ loại |

Cùng nguyên nhân, mức loại nhưng ngoài 9 dòng (chưa ai mở):
| huipu-power n105 b4 d30 `HP-P1330` 4012-46TAG2A | disp "458" | `<td>458</td>`; dòng P1113 cùng bảng ghi 45.8 | Nguồn ghi sai | `dropspec` disp |
| huipu-power n106 b5 d7 `HP-V280` TAD1341GE, d11 `HP-V400` TAD1345GE | disp "1278" | `<td>1278</td>` (131*158 × 6 = 12,78 L) | Nguồn ghi sai | `dropspec` disp (2 dòng) |

## aosif n123 (kèm theo)
`| AW1000 | 900/720 | 1000/800 | 8M33D979E201 | 205.4 | 12V | 31.8 |` (trang https://www.aosif.com/p/5-77.html, trang sống = bản lưu). Cùng bảng dòng AW875 (8M33D845E201) ghi "8V | 26.1", AW1125 (8M33D1012E311) ghi "12V | 31.8" (đã chờ Khoa ở PR #953). Hiện AW1000 CHƯA bị cờ loại. Đề xuất: CÓ, thêm AW1000 vào `dropspec` cyl + disp cùng AW1125 (cùng lý do: cùng họ 8M33, bảng tự mâu thuẫn 8V ↔ 12V). Bằng chứng nằm trong chính bảng của NCC, không dùng số ngoài. #953 còn OPEN, nên nhập chung vào PR đó hoặc PR bước 2.

## Số dòng khác bị ảnh hưởng
- Sửa mã đọc: KHÔNG đề xuất (không có lỗi đọc), nên 0 dòng khác đổi.
- `dropspec` khớp từng chữ dòng nguồn + số `n` + model: mỗi dòng xuất hiện đúng 1 lần trong `suppliers/cn` (riêng aoke 2 dòng, huipu "1278" 2 dòng, jlmech dims 2 dòng; đếm bằng grep). Không dòng nào khác đổi.
- Quét toàn bộ `cn` (bore×stroke × số xi lanh so ô số ≈ 10 lần thể tích hình học, ô dims dính ≥ 8 chữ số): chỉ thêm các dòng đã nêu (huipu 3, jlmech n103 1) và dims dính ở đúng 2 dòng jlmech n104. Ngoài ra có 3 dòng KHÔNG bị cờ cùng kiểu mất dấu chấm: jlmech n102 JL-320GF, JL-350GF (ô "142", hình học 14,17 L) và yunding-jiangsu n2006 YDY-1100GF ("392", hình học 39,2 L). Chưa rõ vì sao không bị cờ (nghi đơn vị cột không đọc được, chưa mở). Báo để điều phối quyết, chưa đề xuất sửa.

## 7 dòng loại khác (khác nguyên nhân, KHÔNG xét ở bước này)
cameo n107 YC4D105-D34 (engPower "35/41"), fdk-energy n1040 QSK50-G7 và S7L1D-D41 (engPower "1107kw/1500": ô ghi kW / v/p), jiangchai-xuzhou n107 6M33D506E310 (dòng điện "7200": cột lệch), mingbang-mbkl n125 TAD1642GE (4 xi lanh, 4.4 L), westinpower n1064 4006-23TAG3A (tốc độ "1191"), yongcai-elecmama n172 QC385BT (2350 rpm). Chưa mở trang sống.

## Bước 2 (khi điều phối báo)
Một PR `web/catalog.js` `ROW_EXCEPTIONS`: 10 dòng `dropspec` (disp: aoke ×2, jlmech n103, huipu ×3; dims: jlmech n104 ×2) + 2 khoá mới cho aosif AW1000 nếu Khoa duyệt; test trong `suppliers/bang-r1.test.mjs`. Khoa duyệt chữ "bỏ riêng số, giữ phần còn lại của dòng" như #953. Cờ loại của các dòng này chỉ hết khi số sai bị bỏ.

## Việc chưa kiểm được
- Không biết NCC có sửa trang sau này không (ngoại lệ tự hết hiệu lực nếu dòng đổi chữ).
- Số đúng của aoke 108 / 105, jlmech 458: không ghi, vì không có nguồn của NCC nêu.
- 7 dòng loại khác và 3 dòng không cờ ở trên chưa mở nguồn.

## Cần ghi nhớ
Nguồn jlmech / huipu / yunding hay làm mất dấu chấm hoặc `*` ở từng ô: xử lý theo dòng (`dropspec`), không đổi luật chung.

---
# Bổ sung (20/11, theo yêu cầu điều phối): 7 dòng loại còn lại + 3 dòng chưa bị cờ

## (1) 7 dòng mức loại còn lại (CHỈ ĐỌC, chưa sửa gì)
Cách xét như trên: cờ + số kích hoạt, tệp lưu, trang sống (curl ngày 20/11; cameo và mingbang trả 403 với curl nên đọc lại bằng Firecrawl theo quy tắc `suppliers/CLAUDE.md`; fdk và westinpower là PDF tải về, so bằng pdftotext). Cả 6 nguồn: trang sống = bản lưu.

| Dòng | Cờ / số kích hoạt | Nguồn thật ghi | Nguyên nhân | Đề xuất |
|---|---|---|---|---|
| cameo-power n107 b6 `YC4D105-D34` (cột SC-70YC của bảng 3 cột) | engPower "35/41" (nhãn "Engine Power(kw) (prime/standby)") ↔ công suất tổ máy 64/70 kW | Bảng ngang: "Rate Power 64/70", "Engine Power 35/41". Hai cột kia ghi công suất động cơ = công suất tổ máy (50/55 ↔ 50/55; 55/60 ↔ 55/60) | NGUỒN GHI SAI (động cơ nhỏ hơn tổ máy). Không ghi số thay (70/77 hay 64/70 đều là đoán) | `dropspec` engPower. Bảng này là bảng ngang theo cột, bản ghi không có `line`: khi viết ngoại lệ phải kiểm khoá dòng của `ROW_EXCEPTIONS` (khớp theo chữ `lines.header`/`rows`) có chạy cho bảng ngang không; chưa thử |
| fdk-energy n1040 b48 `QSK50-G7` + đầu phát `S7L1D-D41` (cùng tờ PDF CG1825E-H1) | engPower "1107kw/1500" (nhãn "Prime power / Speed (KW/RPM)") ↔ tổ máy 1320 kW / 1650 kVA | PDF ghi: "Prime Power 1320KW/1650KVA" nhưng động cơ "Prime power / Speed 1107kw/1500", "Standby 1224kw/1500". Động cơ 1107 kW không kéo nổi tổ máy 1320 kW. Tên tệp ghi CG1825E (1825 kVA), nội dung 1650 kVA | Nguồn tự mâu thuẫn (cặp nhãn–giá trị đọc ĐÚNG thứ tự; pdftotext -layout làm lệch cột nhưng ô "Prime power / Speed" vẫn đi với 1107kw/1500). Bản ghi đầu phát bị loại theo cả dòng (luật B(iii): chặn cả dòng bảng động cơ lẫn đầu phát), không phải vì số của đầu phát | GIỮ cờ loại (nguồn tự mâu thuẫn). Không `dropspec`: tổ máy 1320 kW cũng không chắc đúng |
| jiangchai-xuzhou n107 b6 d27 `6M33D506E310` (J20B400M) | current "7200" (nhãn 电流（A）) ↔ 400/450 kW | `\| J20B400M \| 400 \| 450 \| 潍柴博杜安 \| 6M33D506E310 \| 7200 \| 88 \|…`. Cùng bảng: J20B520M (470/520 kW) 846 A, J20B580M 936 A; cột 电流 của các dòng 6M33 khác 810–1000 | NGUỒN GHI SAI (thừa một chữ số; số đúng không ghi) | `dropspec` current |
| mingbang-mbkl n125 b5 d13 `TAD1642GE` (MB-V480) | disp "4.4" (4,4 L / 480 kW = 0,009 < 0,01); cylMaj "4" (số đông 6 × 14) | Trang ghi 4 xi lanh, 4.4 L, 105*127 cho dòng này (và cho cả 15 dòng "Cylinder 4"; dòng 15 TWD1643GE ghi 4 xi lanh nhưng 6.0 L, 100*127: 6.0 L chỉ khớp 6 xi lanh). aoke-yangzhou (NCC khác) ghi TAD1642GE 6 xi lanh, 16.12 L | NGUỒN GHI SAI: cột xi lanh / dung tích của bảng chép từ động cơ nhỏ; tự mâu thuẫn rõ ở dòng 15. Dòng V480 tự khớp hình học (4×π/4×10,5²×12,7 = 4,39), nên chỉ "nguồn khác" mới cho biết sai | `dropspec` cyl + disp + bore của dòng V480; BÁO: 14 dòng còn lại của bảng cùng nguồn ghi "4" xi lanh, chưa soát hết (không bị cờ vì thể tích / kW còn trong ngưỡng) — Khoa quyết có bỏ cả bảng không |
| westinpower n1064 b92 `4006-23TAG3A` (TP880L) | speed "1191" (nhãn "Rated rotation speed", r/min) | PDF: "Power(ESP) 900/718, Power(PRP) 800/641, Rated Voltage 400, Rated Current 1299, Rated rotation speed 1191, Power Factor 0.8…". Trang 2 của CÙNG PDF: "Engine speed Rated 1500 RPM" | NGUỒN GHI SAI (hai chỗ trong một tờ không khớp); đọc đúng thứ tự nhãn–giá trị | `dropspec` speed (chỉ bỏ 1191; "1500 RPM" của trang 2 là ô khác, không dùng thay) |
| yongcai-elecmama n172 b60 `QC385BT` | speed "2350 rpm" (nhãn "Engine speed") ↔ chuẩn 750–3600 nhưng bản ghi mang tư cách động cơ tổ máy | Trang liệt kê "Quanchai QC385BT diesel engine for tractor … Rated output 18.8 KW, Engine speed 2350 rpm". Đó là động cơ máy kéo, KHÔNG phải tổ máy phát. 2350 rpm đúng cho động cơ đó | KHÔNG phải số sai: là bản ghi không thuộc tổ máy (trang bán động cơ rời). Cờ loại cho đúng kết quả | GIỮ cờ loại; việc đúng là bỏ bản ghi khỏi tổ máy / không phải `dropspec` |

Tổng 7 bản ghi: nguồn ghi sai 4 (cameo, jiangchai, mingbang, westinpower), nguồn tự mâu thuẫn 2 (fdk ×2 bản ghi), không phải tổ máy 1 (yongcai). Lỗi đọc: 0.

## (2) 3 dòng cùng kiểu mất dấu chấm mà không bị cờ
Chạy `recordsOf` + `absurdOf` + `normFig` trên toàn bộ `cn` (script scratchpad `diag.mjs`/`diag3.mjs`, chỉ đọc):

| Dòng | Chữ nguồn | Số đúng theo CHÍNH nguồn (không ghi vào dữ liệu) | Vì sao row-flags không bắt |
|---|---|---|---|
| jlmech-wuhan n102 `JL-320GF`, `JL-350GF` (SC15G500D2) | "142" ở cột Displacement; bore×stroke 135*165, 6 xi lanh | Bảng KHÔNG có dòng nào khác cho động cơ này; hình học 6×π/4×13,5²×16,5 = 14,17 L nên "142" nhìn là mất dấu chấm, nhưng nguồn không ghi 14.2 nên chỉ nêu là bằng chứng, không kết luận số | Hàng tiêu đề đơn vị của bảng ("\| KW \| KVA \| A \| mm \| L \| L \| g/kw.h…") thiếu ô nên lệch cột: nhãn thành "Displacement (**mm**)", "Cylinder (L)", "Bore*Stroke (g/kw.h)". `absurdOf` chỉ xét disp khi `normFig` ra đơn vị L ⇒ trả `null` (không xét). Catalog cũng không dùng "142" như lít (thiếu đơn vị đúng) nên không vào Gợi ý; chỉ hiện chữ thô ở web |
| yunding-jiangsu n2006 `YDY-1100GF` (YC12VTD1830-D30) | "392" | Dòng kề cùng bảng, cùng bore×stroke 152*180, 12 xi lanh: `YDY-1000GF … YC12VTD1680-D30 … 39.2` | Bản ghi KHÔNG có spec `disp` (có cyl, bore, current, weight…; dòng hai-ba mươi kia thì có). Không có số nào để kiểm. Lý do reader bỏ "392" chưa lần ra (nghi lọc khoảng hợp lý của `likely` ở `catalog.js` ~dòng 1040: dải 0,4–100 L; chưa xác nhận, chưa chạy riêng) |

Bổ sung tìm được khi quét (cùng bảng họ jlmech, cùng cơ chế lệch tiêu đề "Displacement (mm)"): jlmech-wuhan n104 `JL-30GF` "249" (dòng JL-24GF cùng bảng ghi "2.49", cùng YC2115 115*120) và `JL-40GF` "433" (YCD4J12D-55, 105*125 ×4 xi lanh = 4,33 L; dòng này xuất hiện HAI lần trong bảng). Cũng chưa bị cờ vì cùng lý do. Ngoài ra n104 có ô "6.B7" (chữ B lẫn trong số).

## Đếm trên toàn bộ `suppliers/cn` (trả lời "bắt oan bao nhiêu")
- 10.183 bản ghi động cơ có spec `disp`: 9.885 đọc ra L hoặc cc (xét được); 298 không xét theo L: 122 là cc (hợp lệ), 176 "không đọc được đơn vị" (nhãn ghi mm hoặc thiếu đơn vị). Trong 176 ca đó, 133 có công suất dòng để so; nếu cứ coi số thô là L và áp ngưỡng hiện có (L > 300 hoặc L/kW ngoài 0,01–0,3), BẮT ĐÚNG 4 bản ghi, tất cả là jlmech: n102 ×2 ("142") và n104 ×2 ("249", "433"), và BẮT OAN 0 bản ghi. 43 ca không có công suất nên không xét được.
- Yunding "392": không thuộc nhóm trên (không có spec disp); luật cờ không đổi cũng không bắt được.
- Vậy tác động nếu Khoa muốn mở rộng luật cờ ("disp đơn vị không đọc được thì vẫn so số thô khi số vượt hẳn ngưỡng"): 4 dòng (đều đúng), 0 oan, nhưng chỉ trên dữ liệu hiện tại; chưa đề xuất đổi luật vì mẫu 4 dòng của MỘT NCC (cùng lỗi lệch tiêu đề) là quá nhỏ để kết luận.

## Đề xuất gộp cho bước 2 (chờ #954 và Khoa)
`dropspec`: engPower cameo SC-70YC; current jiangchai J20B400M; cyl+disp+bore mingbang MB-V480; speed westin TP880L. Giữ cờ loại: fdk, yongcai. Nếu Khoa muốn bỏ luôn số sai chưa bị cờ: disp jlmech n102 ×2, n104 ×2 (JL-30GF, JL-40GF) và yunding n2006 YDY-1100GF (reader đã bỏ số nên chỉ cần xác nhận). Mọi `dropspec` khớp từng chữ dòng nguồn; mỗi dòng xuất hiện một lần trong `cn`, trừ jlmech JL-40GF (hai lần cùng bảng, `mergeRepeats` gộp).

## Chưa kiểm được
- Lý do reader bỏ "392" của yunding; khoá dòng `dropspec` cho bảng ngang của cameo; số liệu 14 dòng còn lại bảng mingbang V; PDF fdk / westin chỉ đọc bằng pdftotext (không so ảnh trang).
