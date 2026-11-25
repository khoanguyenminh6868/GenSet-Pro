# Đo gộp lượt 8: #1244, #1245, #1246 (+ cây tích hợp)

Phiên ĐO của điều phối, 25/11/2026. Không chép chữ HSMT; chỉ mã gói, số liệu, tên model, tên NCC, dòng nguồn trong `cn/`. Cách đo và tiêu chí như lượt 7 (`do-gop-luot-7.md`; lượt 6 mục 2, 3). TSV: `nghiem-thu/do-gop-luot-8-pr.tsv` (13.860 dòng). Cột: bước đo, lượt, loại, NCC, động cơ, đầu phát, băm khoá dòng, hạng / điểm trước và sau, PR, nhóm, cơ chế, **nguyên văn dòng nguồn trong `cn/`** (dòng nhiều khối ghi khoá chữ chuẩn hoá), quy về (bước tích hợp). Kết quả nén (5 trường `top`, `topScore`, `all`, `dropped`, `rowflag`) ở nhánh mồ côi `do-gop-luot-8-ket-qua`.

## Kết luận từng PR

Gốc là `main` **75c82446** (#1249, `origin/main` mới nhất lúc bắt đầu). Mỗi PR được gộp `--no-ff` riêng vào gốc: cả ba sạch. Cây tích hợp có **1 xung đột** (mục 1).

| PR | Nhánh (đầu đo) | Đổi ở `all` | Đổi ở top 30 | Kết luận |
|---|---|---:|---:|---|
| **#1244** avr câu văn + cgm-italia vỏ máy | `sua-nho-luot-7` (1eeb4a01) | 305 dòng / 139 lượt | **150 dòng, 30 lượt / 30 gói** | **Merge được về cơ chế, cần Khoa quyết một điểm.** Bản ghi −223 / đổi 1, đúng thân PR. **28 dòng cgm-italia ra khỏi top 30** ở 28 lượt: đều là dòng có model tổ máy mà ô động cơ chưa đọc (mục 4.1). Có 2 dòng −3 (LVSI804R / T mất `avr`). Còn 120 dòng là hệ quả. 0 chưa giải thích. |
| **#1245** tờ dọc V3 (astra, kubota) | `buoc-3-to-doc` (55399e79) | 1.419 dòng / 517 lượt | **1.236 dòng, 110 lượt / 99 gói** | **Cần Khoa quyết hai điểm, cơ chế đúng.** 149 dòng bản ghi mới vào top 30 (11 bản ghi: kubota 10, astra 1), cả 11 khớp ô nguồn. Có **hai cơ chế thân PR chưa nêu**: (a) bản ghi mới mang thông số động cơ, nên D722 có thêm `bore` / `disp` (+16, 25 dòng) và YC6MK350LD20 chốt được dung tích theo số đông (17 dòng bị loại `disp` / `maxDisp`); (b) tần số không đọc, nên 3 máy 60 Hz của kubota vào top 30 ở 26 lượt mà HSMT ghi 50 Hz (mục 4.2). 0 chưa giải thích. |
| **#1246** nhãn động cơ (elecv, fuelsys, HP, engType) | `buoc-4-d` (c4bc7517) | 15.060 dòng / 688 lượt | **5.636 dòng, 469 lượt / 426 gói** | **Merge được.** Mọi dòng đổi điểm đều đúng **+8** (1 loại thông số động cơ thêm). Ở `all` có 15.060 dòng, 0 lệch. Ở top 30 có 1.030 dòng gốc, đều do `elecv`. **29 giá trị `starting` → `electrical_vdc`: 0 dòng đổi điểm, 0 dòng bị loại** (mục 4.3). Không luật loại nào đổi. 0 chưa giải thích. |

**Tương tác.** Đo riêng thì các cặp PR chung lượt: #1244 ↔ #1245 chung 12 lượt / 55 dòng; #1244 ↔ #1246 chung 21 / 13; #1245 ↔ #1246 chung 42 / 72. Cây tích hợp **không có dòng nào chỉ đổi khi gộp** (mục 5). Hai PR cộng điểm độc lập: #1245 thêm +16 cho D722, #1246 thêm +8 `elecv`.

## Tóm tắt số liệu

| Cây | Commit đo | Lượt đổi top | Gói | Dòng top đổi | Dòng `all` đổi | Chưa giải thích | RAM đỉnh |
|---|---|---:|---:|---:|---:|---:|---:|
| `main` | 75c82446 | gốc | | | | | 2.516 MB |
| main + #1244 | d7450897 | 30 | 30 | 150 | 305 | 0 | 2.285 MB |
| main + #1245 | 8fb8ff7c | 110 | 99 | 1.236 | 1.419 | 0 | 2.299 MB |
| main + #1246 | 0ec7955f | 469 | 426 | 5.636 | 15.060 | 0 | 2.588 MB |
| tích hợp 3 PR | d76be108 | 546 | 492 | 6.838 | 16.784 | 0 | 2.505 MB |

- **Bidhist:** mọi cây dùng MỘT bản, tải 25/11/2026 04:02:16 UTC: 1.556 doc, 928 gói máy phát, 1.057 lượt, 436 NCC. Mỗi cây 0 lượt lỗi.
- **Cách chạy:** hai đợt, mỗi đợt tối đa 3 cây song song. Đợt 1 là gốc, #1244, #1245 (~58–63 phút). Đợt 2 là #1246 và tích hợp (~60 phút).
- **Sự cố:** không có lần khởi động lại nào, không chạy tiếp (`chayTiep` 0).

## 1. Gộp nhánh

- Ba cây đo riêng: gộp `--no-ff` sạch.
- Cây tích hợp (gộp theo thứ tự #1244, #1245, #1246): **xung đột ở `web/catalog.js`, hàm `specKeyOf`**.
  - Phía #1244: vòng `SPECS` trả `null` cho khoá `avr` / `excit` / `vreg` có nhãn là câu văn (`SENTENCE_KEYS`, `sentenceLabel`).
  - Phía #1246: thêm `hp|bhp|ps|cv|马力` vào regex loại nhãn công suất, dòng cuối trả `"engPower"` theo `HP_LABEL` / `HP_NOT`.
- **Cách gộp để đo:** lấy hợp của cả hai, không chọn bên nào.
  - Regex nhãn công suất lấy bản #1246.
  - Vòng `SPECS` lấy bản #1244.
  - Dòng cuối lấy bản #1246.
  - Giữ cả hai khối hằng.
- Hai thay đổi chạm hai nhánh khác nhau của cùng hàm. Theo bản gộp này, nhãn câu văn thuộc `avr` / `excit` / `vreg` vẫn trả `null` (không rơi xuống `HP_LABEL`).
- Kiểm cây tích hợp: test của ba PR và các test bị đổi (`sua-nho-luot-7`, `buoc-3-to-doc`, `spec-read`, `to-hang-ecd`, `web/test/spec-norm`): **254 / 254 đạt**.
- **PR merge sau phải gộp tay đúng như vậy** (điều phối xác nhận; tôi không đẩy bản gộp lên nhánh PR nào).

## 2. Cách đo

- Lệnh: `NODE_USE_ENV_PROXY=1 node do-gop-x.mjs <cây> <cây>/suppliers/cn <out> --bidhist <bản chung>`.
- `do-gop-x.mjs` là bản sao `suppliers/do-gop.mjs` của main 75c82446 (có chạy tiếp, in RAM đỉnh). Phần tính giữ nguyên; chỉ ghi thêm tệp chẩn đoán:
  - 120 dòng đầu của `all` mỗi lượt (khoá, điểm, khoá động cơ / đầu phát, lý do, luật);
  - mọi dòng `dropped` kèm luật;
  - bảng theo từng nhóm `catFor` (origin / sync / partsOnly / brand): hãng và tập khoá thông số của mỗi động cơ / đầu phát;
  - mọi bản ghi động cơ.
- Khoá dòng là `NCC | động cơ | đầu phát | chữ dòng`; dòng bị loại tra bằng khoá bỏ đầu phát.
- Dòng ngoài 120 dòng đầu thì dự đoán điểm bằng bảng của đúng nhóm `catFor` của lượt (nhóm `diem-khop-bang`).
- Nhóm (cột `nhóm`), như lượt 7:
  - `diem-khop` / `diem-khop-bang`: độ đổi = +8 × Δ loại động cơ (≤ 8) + 3 × Δ loại đầu phát (≤ 6) + 60 hãng (+300 nếu hãng HSMT nêu), khớp đúng từng điểm;
  - `ban-ghi-moi`, `ban-ghi-mat` (mới: bản ghi bị bỏ), `ban-ghi-doi`, `luat-loai`, `het-bi-loai`;
  - `he-qua-truc-tiep` (có dòng gốc cùng lượt điểm ≥ dòng này), `he-qua-day-chuyen` (dòng gốc điểm thấp hơn: trần NCC / hãng / động cơ);
  - `diem-lech`, `chua`.

## 3. Phân loại 100 % dòng top 30 đổi

| Nhóm | #1244 | #1245 | #1246 | tích hợp |
|---|---:|---:|---:|---:|
| diem-khop | 2 | 20 | 968 | 989 |
| diem-khop-bang | | 5 | 62 | 67 |
| ban-ghi-moi | | 149 | | 149 |
| ban-ghi-mat | 28 | | | 28 |
| luat-loai | | 17 | | 17 |
| he-qua-truc-tiep | 90 | 946 | 4.606 | 5.540 |
| he-qua-day-chuyen | 30 | 99 | | 48 |
| diem-lech / chua / het-bi-loai | 0 | 0 | 0 | 0 |
| **Tổng** | **150** | **1.236** | **5.636** | **6.838** |

Loại dòng: #1244 có 105 đổi hạng, 34 ra, 11 vào. #1245 có 974 hạng, 71 ra, 188 vào, 3 chỉ đổi điểm; top dài thêm ở các gói máy nhỏ ít ứng viên. #1246 có 4.698 hạng, 361 ra, 361 vào, 216 chỉ đổi điểm.

## 4. Từng PR

### 4.1 #1244 (150 dòng, 30 lượt / 30 gói)

- **Bản ghi** (so mọi bản ghi động cơ gốc ↔ cây): 51.343 → 51.120. Mất **223**, toàn cgm-italia, khoá B20, B50, B100, B200, B300, B400, B750, B800, B1700, B2500, B3000; 11 khoá động cơ này biến mất khỏi catalog. Đổi **1**: 750DZ B800 → **TCD24V12**, hãng Deutz như cũ. Không có bản ghi thêm. Khớp thân PR.
- **195 dòng đuôi không model:** không dòng nào nằm trong `all` hay top 30 của gốc ở bất kỳ lượt nào. Gỡ chúng không đổi kết quả.
- **750DZ (TCD24V12):** không vào top 30 ở cây nào. Ở `all` / `dropped` chỉ đổi khoá; 2 dòng-lượt vẫn bị loại cùng luật dưới khoá mới (IB2200018828#0 `prime`, IB2400377756#0 `band`).
- **`avr` câu văn:** LVSI804R / T mất `avr` (−3, khớp đúng) ở 29 dòng `all`; 2 dòng top 30.
  - IB2300188511#0: ade-power QSK78G24 + LVSI804T, 203 → 200, hạng 9 → 10.
  - IB2500360458#0: ade-power QSK60G8 + LVSI804R, hạng 3, 828 → 825, ra khỏi top. Lý do: cùng động cơ có dòng S7L1DJ41 826 thay chỗ (một dòng mỗi động cơ / NCC).
  - Đúng với chẩn đoán lượt 7 (mục 4.4).
- **Soát "hết bị loại": 0 thật.** 56 dòng-lượt rời `dropped`: 54 là dòng của bản ghi vỏ máy đã mất (35 `prime`, 19 `band`); 2 là 750DZ đổi khoá như trên.
- **28 dòng ra khỏi top 30** (`ban-ghi-mat`): dòng có model tổ máy, khoá động cơ là mã vỏ máy, nay không còn bản ghi. Xem bảng dưới.

**Đủ 28 bản ghi có model tổ máy mà #1244 bỏ** (cgm-italia n101). Ô động cơ chép nguyên văn từ `cn/cgm-italia.json`. "Top 30 gốc" ghi các lượt mà dòng đó đang trong top 30 của `main` 75c82446, kèm hạng. "Lượt `all`" là số lượt có dòng đó trong `all`.

| Model tổ máy | Khoá cũ (vỏ máy) | Ô động cơ nguyên văn | Top 30 gốc (lượt: hạng) | Lượt `all` |
|---|---|---|---|---:|
| 80F | B100 | FPT N45 SM3 | | 2 |
| 100F | B100 | FPT N45 TM2A | | 3 |
| 120F | B100 | FPT N45T M3 | | 4 |
| e60F | B100 | FPT N45 SM1F | | 7 |
| v33KH | B100 | KOHLER KDI 1903TCR | | 1 |
| v45KH | B100 | KOHLER KDI 2504TCR | | 0 |
| e25KH | B20 | KOHLER KDI 2504M | IB2400482562#0: 15; IB2500512614#0: 19 | 13 |
| v20R | B20 | REHLKO KSD 1403TCA | IB2400494037#0: 29; IB2400561834#0: 21; IB2500415487#1: 22; IB2500447006#0: 23; IB2500498271#0: 22; IB2500514971#0: 23; IB2500531255#0: 12; IB2500598824#1: 21; IB2600027651#0: 23; IB2600350338#0: 22; IB2600477305#1: 22 | 14 |
| 130F | B200 | FPT N67 SM1 | IB2500073242#0: 14 | 6 |
| 150F | B200 | FPT N67 TM4 | IB2300230061#0: 8; IB2400362865#0: 18; IB2600046158#0: 26 | 11 |
| 170F | B200 | FPT NEF N67TM4 | IB2200004914#0: 23 | 10 |
| 200F | B200 | FPT NEF N67TM7 | IB2500017038#0: 19; IB2500271735#0: 18; IB2500553750#0: 13; IB2600075436#1: 19; IB2600112737#1: 19; IB2600327799#1: 19 | 15 |
| 250F | B200 | FPT NEF N67TE8P | | 9 |
| e150F | B200 | FPT NEF N67TE1PV | | 11 |
| e200F | B200 | FPT NEF N67TE3PV | | 15 |
| v150F | B200 | FPT NEF N67TEVP06.00 | | 11 |
| v200F | B200 | FPT NEF N67 TEVP05.00 | | 15 |
| 300F | B300 | FPT CURSOR87 TE4 | | 17 |
| 350F | B300 | FPT CURSOR13 TE2A | | 16 |
| 400F | B300 | FPT CURSOR13 TE3A | | 6 |
| e250F | B300 | FPT CURSOR87 TE3F | | 9 |
| e300F | B300 | FPT CURSOR87 TE1PV | | 17 |
| 450F | B400 | FPT CURSOR13 TE6W | IB2500459891#0: 12 | 6 |
| 500F | B400 | FPT CURSOR13 TE7W | IB2400453053#0: 29 | 15 |
| e400F | B400 | FPT CURSOR13 TE2F | | 6 |
| 410DS | B400 | P158LE | | 7 |
| 600F | B750 | FPT CURSOR16 TE1W | IB2400503492#0: 8; IB2500626302#0: 10 | 17 |
| 1140CU | B1700 | (ô trống) | | 3 |

- Ví dụ dòng nguồn (TSV có đủ): `| 200F | | 200 | 160 | 220 | 176 | FPT NEF N67TM7 | M | 0 | 6 | 235.9/176 | 32 | 250 | B200 | 1720 | 2400x1100x2000 | …`; `| v20R | | 20 | 16 | 22 | 17.6 | REHLKO KSD 1403TCA | E | 5 | 3 | 23.5/17.5 | 3.1 | 55 | B20 | 430 | …`.
- 10 / 28 bản ghi đang trong top 30 của gốc, cộng lại **28 dòng-lượt**: v20R 11, 200F 6, 150F 3, e25KH 2, 600F 2, 130F / 170F / 450F / 500F 1. 18 bản ghi còn lại chỉ có ở `all` (1–17 lượt) hoặc không có.
- Ở `main` các dòng này được điểm nhờ khoá động cơ giả (vỏ máy B20 / B200…, hãng FPT / Kohler theo cột). Bỏ là đúng, nhưng cgm-italia mất chỗ ở các gói máy nhỏ / vừa cho tới khi đọc được mã thật.
- **Kết luận: merge được** nếu Khoa chấp nhận mất 28 dòng-lượt này cho tới khi đọc ô "FPT …" / "KOHLER KDI …" / "REHLKO KSD …" (điểm cần quyết 1).

### 4.2 #1245 (1.236 dòng, 110 lượt / 99 gói)

- **Bản ghi:** +60 (astra-fuan 44, kubota-japan 16), 0 mất, 0 đổi; không khoá động cơ mới, không đổi hãng. Khớp thân PR.
- **149 dòng bản ghi mới vào top 30** (83 lượt), từ 11 bản ghi. Tôi đối chiếu cả 11 với dòng nguồn (model tổ máy; dòng "Model" thứ hai là động cơ; standby / prime theo nhãn): **11 / 11 đúng**.

| NCC n | Tổ máy → động cơ | Bản ghi | Dòng nguồn | Dòng top |
|---|---|---|---|---:|
| kubota-japan n108 | KJ-S130VX → V2203 | prime 12,5 / standby 13,8 kVA = kW | `\| Standby Output \| kVA (kW) \| 13.8 (13.8)`, `\| Prime Output \| kVA (kW) \| 12.5 (12.5)`, `\| Model \| - \| V2203`, Hz 50 | 32 |
| kubota-japan n123 | J313 → D722 | 12,5 kVA / 10 kW; 13,7 / 11 | `13.7 (11.0)`, `12.5 (10.0)`, `\| Frequency \| Hz \| 60` | 25 |
| kubota-japan n126 | SQ-1140 → D1703 | 13,6 / 13,6; 14,5 / 14,5 | `14.5 (14.5)`, `13.6 (13.6)`, **Hz 60** | 24 |
| kubota-japan n116 | J310 → D722 | 10 / 8; 11 / 8,8 | `11.0 (8.8)`, `10.0 (8.0)`, Hz 50 | 21 |
| kubota-japan n101 | SQ-1120 → D1703 | 11,2 / 11,2; 11,8 / 11,8 | `11.8 (11.8)`, `11.2 (11.2)`, Hz 50 | 19 |
| kubota-japan n104 | SQ-3200 → V2203 | 20 / 16; 22 / 17,6 | `22.0 (17.6)`, `20.0 (16.0)`, Hz 50 | 8 |
| kubota-japan n105 | SQ-3300 → V3300 | 30 / 24; 33 / 26,4 | `33.0 (26.4)`, `30.0 (24.0)`, Hz 50 | 8 |
| kubota-japan n107 | GL-9000 → D722 | 8 / 8; 8,8 / 8,8 | `8.8 (8.8)`, `8.0 (8.0)`, Hz 50 | 5 |
| kubota-japan n102 | SQ-1150 → V2203 | 15 / 15; 16 / 16 | `16.0 (16.0)`, `15.0 (15.0)`, Hz 50 | 5 |
| kubota-japan n127 | SQ-1200 → V2203 | 20 / 20; 21 / 21 | `21.0 (21.0)`, `20.0 (20.0)`, **Hz 60** | 1 |
| astra-fuan n122 | AS44YC → YC4D60-D21 | standby 35 kW / 44 kVA | `\| Model \| AS44YC`, `\| Model \| YC4D60-D21`, Frequency 50Hz | 1 |

- **Cơ chế (a), chưa nêu trong thân PR: bản ghi mới mang thông số động cơ.**
  - "0 khoá động cơ mới" là đúng, nhưng tờ một máy của kubota / astra có cả phần động cơ. Hai động cơ đổi:
  - **D722**: không có thông số → `bore` + `disp` từ kubota-japan n113 `| Bore x Stroke | mm | 67.0 x 68.0`, `| Displacement | L | 0.719`. Đúng: Kubota D722 dung tích 0,719 L.
    - Mọi dòng D722 của NCC khác được **+16** (2 loại × 8), khớp đúng 30 dòng `all`; ở top 30 là 25 dòng elitech-power.
    - Có 3 dòng elitech-power D722 bị loại `disp` (0,719 L < mức tối thiểu HSMT) ở IB2200016981#0, IB2200086314#0, IB2300178837#0.
  - **YC6MK350LD20**: astra-fuan n115 thêm phiếu `| Displacement | 10.34L` (và `| Bore × Stroke (mm) | 123*145`).
    - Ở gốc, luật số đông dung tích (`majorityOf`: phiếu thắng ≥ 3 × (phiếu nhì + nguồn không so được); jlmech-wuhan ghi `Displacement (mm) | 10.33` nên không so được) **không kết luận**. Dòng lại không bị loại vì có nguồn không so được.
    - Thêm phiếu astra thì số đông chốt "10.338 × 9, 10.33 × 2", nên YC6MK350LD20 bị loại `disp` (< 11,051 L ở IB2300042675#0, IB2400298819#0, IB2500569560#0) hoặc `maxDisp` (> 9,5 L ở IB2300191244#0, IB2300215868#0, IB2400481114#0).
    - `all`: 248 dòng-lượt; **top 30: 14 dòng ra** (wintpower, huali-shandong, fdk-energy).
    - **Đã kiểm nhân quả:** chạy lại IB2300042675#0 trên cây #1245 bỏ riêng bảng astra-fuan n115, thì không dòng YC6MK350LD20 nào bị loại `disp`.
    - Dung tích YC6MK 10,3 L là đúng, nên luật loại đúng; trước đó lọt chỉ vì số đông chưa đủ.
- **Cơ chế (b): tần số không đọc** (thân PR: "freq để trống").
  - n123 J313, n126 SQ-1140, n127 SQ-1200 là máy **60 Hz** (dòng nguồn ghi `| Frequency | Hz | 60`). Chúng vào top 30 ở **27 lượt (50 dòng)**; HSMT của 26 lượt trong số đó ghi 50 Hz.
  - Bản ghi không có tần số nên luật `freq` không áp. Các máy 50 Hz cũng ghi `| Frequency | Hz | 50` mà không được đọc.
  - Đề nghị đọc tần số từ dòng `Frequency | Hz | 50/60` của tờ dọc trước khi merge (điểm cần quyết 2).
- Còn lại: kubota-japan là máy một pha PF 1,0 (kVA = kW), đúng nguồn.
- Hệ quả: 946 trực tiếp + 99 dây chuyền. Soát "hết bị loại": **0**.
- **Kết luận:** cơ chế đúng, 0 chưa giải thích. **Cần Khoa quyết** (1) chấp nhận tác dụng thông số động cơ của bản ghi mới: D722 +16, YC6MK350LD20 bị loại ở 6 lượt (đúng số thật); (2) có đòi đọc tần số trước khi merge không, vì 50 dòng 60 Hz đang vào gói 50 Hz.

### 4.3 #1246 (5.636 dòng, 469 lượt / 426 gói)

- **Bản ghi:** 0 thêm / mất / đổi (không đổi công suất, tần số, đầu phát).
- **`modelFacts` (gốc ↔ cây, nhóm `all`):** 197 model động cơ đổi tập khoá.
  - Thêm `elecv` 185, `fuelsys` 10, `engType` 4; mất `start` 24.
  - **174 model tăng số loại, 0 model giảm.** 81 model còn dưới trần 8 loại nên đổi điểm. Khớp thân PR (174).
  - Không đầu phát nào đổi.
- **Điểm:** mọi dòng đổi điểm ở `all` (15.060 dòng-lượt: 1.723 trong 120 dòng đầu, 13.337 tính bằng bảng) đều **+8**, khớp đúng; **0 lệch**.
- Ở top 30 có 1.030 dòng gốc, **đều do `elecv`**; `fuelsys` / `engType` không thêm dòng top nào (model đã đủ 8 loại hoặc không vào top).
- **Nguồn `elecv` của 66 động cơ gốc trong top**, kiểm dòng nguồn từng nhãn:
  - powerpack 48 động cơ `| Engine Electrical System | VDC | 12` (hoặc 24);
  - westinpower 16 `| Starter Voltage | V | 12`;
  - hosem-power 2 `| Starting Voltage | V | 24`;
  - shanhua 1 `| 起动机电压 Start Motor Voltage (V) | 24`;
  - aosif 1 `| Starting Voltage | DC24V`.
  - Đều là điện áp khởi động 12 / 24 V, đúng.
- **29 giá trị `starting` → `electrical_vdc`:** nằm ở **24 model** (DP054CA / CB / CC, DP086CA–CE, DP158CC, 403A11G1, 403A15G1, 403D11G, 403D15G, 4Z23G11, 4Z23G21, 4Z27G11, SP344CB / CC, QSK23G2, QSK38G3, QSK50G7, QSK50G13, QSK60G8, KTA50G3).
  - Mỗi model mất `start`, được `elecv`: số loại giữ nguyên.
  - KTA50G3 thêm `engType` nhưng đã có 13 loại (trên trần 8), nên điểm giữ nguyên.
  - Đo: dòng của 24 model này qua mọi lượt là **24.476 dòng-lượt ở `all`, 0 đổi điểm, 0 vào / ra `all`, 0 bị loại**.
  - Khoá `start` không có trong luật loại của `candidates` (chỉ dùng ở `ITEM_KEYS`, gợi ý dòng HSMT), nên không dòng nào bị loại vì việc tách này.
- Soát luật: `dropped` không đổi ở mọi lượt (0 vào, 0 ra).
- **Kết luận: merge được.**

## 5. Cây tích hợp (d76be108) so `main`: 6.838 dòng top, 546 lượt / 492 gói

Quy về bước đo riêng (theo `lượt@dòng`, cột cuối của TSV):

| Quy về | Dòng |
|---|---:|
| chỉ #1246, khớp đúng hạng / điểm | 5.547 |
| chỉ #1245, khớp đúng | 1.111 |
| chỉ #1244, khớp đúng | 92 |
| hai PR cùng đổi dòng, khớp một / cả hai | 4 (#1244 + #1246), 1 (#1245 + #1246) |
| đo riêng có đổi, khác hạng khi gộp (dòng của PR khác cùng lượt) | 66 (#1245 + #1246), 5 (#1244 + #1245), 2 (#1244 + #1246), 4 / 4 / 1 (#1246 / #1244 / #1245) |
| không đổi ở bước riêng nào, nhưng lượt có đổi ở #1244 và #1246 | 1 |
| **chỉ đổi khi gộp (lượt không đổi ở bước riêng nào)** | **0** |

- Có 87 dòng đổi ở bước riêng mà không đổi ở tích hợp (#1244 43, #1245 38, #1246 6). Đây là dòng bị đẩy qua lại do các PR khác cùng lượt.
- Nhóm cơ chế của tích hợp bằng tổng ba bước riêng: bản ghi mới 149, bản ghi mất 28, luật loại 17; điểm −3 / +8 / +16 như đo riêng.
- 0 chưa giải thích, 0 hết bị loại thật.

## 6. Các điểm cần Khoa quyết

1. **#1244: 28 bản ghi cgm-italia có model tổ máy mà ô động cơ chưa đọc** (bảng mục 4.1). 10 bản ghi đang ở top 30 của 28 lượt: v20R 11 lượt, 200F 6, 150F 3, e25KH 2, 600F 2, 130F, 170F, 450F, 500F mỗi mã 1. Hai lựa chọn:
   - (a) merge như PR (đúng: vỏ máy không phải động cơ), chấp nhận cgm-italia mất 28 dòng-lượt;
   - (b) PR sau đọc mã thật từ ô "FPT N45 / N67 / NEF … / CURSOR …", "KOHLER KDI …", "REHLKO KSD …". Lưu ý thân PR: "FPT NEF …" có tiền lệ không bóc (series).
2. **#1245, tần số:** 3 máy 60 Hz của kubota-japan (n123 J313, n126 SQ-1140, n127 SQ-1200) vào top 30 ở 27 lượt (50 dòng); HSMT của 26 lượt trong số đó ghi 50 Hz. Tờ dọc có `| Frequency | Hz | 50/60` nhưng bộ đọc để `freq` trống. Hai lựa chọn: đọc tần số trước khi merge, hoặc merge rồi sửa sau.
3. **#1245, tác dụng thông số động cơ của bản ghi mới** (thân PR chưa nêu):
   - D722 +16 điểm ở mọi NCC; 3 dòng bị loại `disp`.
   - YC6MK350LD20 bị loại `disp` / `maxDisp` ở 6 lượt (248 dòng `all`, 14 dòng top 30), vì phiếu astra n115 làm luật số đông chốt được 10,338 L.
   - Số đều đúng thực tế. Cần biết để chấp nhận.
4. **Xung đột #1244 ↔ #1246 ở `specKeyOf`** (mục 1): PR merge sau gộp tay theo cách đã đo (hợp cả hai).

## 7. Việc đề nghị điều phối

1. Merge #1246 (độc lập, cộng điểm +8 không xung đột về điểm).
2. #1244: hỏi Khoa điểm 1; nếu (a) thì merge (sau #1246 phải gộp tay `specKeyOf`).
3. #1245: hỏi Khoa điểm 2, 3; nếu đọc tần số trước thì đo lại 27 lượt có dòng 60 Hz.
4. Ngoài phạm vi, ghi lại: jlmech-wuhan YC6MK350L-D20 ghi nhãn `Displacement (mm)` cho giá trị 10.33 (đơn vị sai ở nguồn, làm phiếu "không so được").
