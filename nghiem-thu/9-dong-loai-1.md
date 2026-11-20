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
