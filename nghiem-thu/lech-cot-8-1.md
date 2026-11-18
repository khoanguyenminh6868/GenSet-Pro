# Nghiệm thu: Lệch cột đợt 8 (lech-cot-8-1)

- PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/901 (DRAFT, nhánh `lech-cot-8`, 9 commit; KHÔNG tự merge)
- Người làm bước kiểm: phiên nhận bàn giao 18/11/2026 (không sửa code, không đổi tệp trong `wt-lech-cot-8`).
- Số đo ĐO THẬT (không ước tính) trừ khi ghi khác.

## 1. Tệp đã đổi (`git diff origin/main...HEAD`, 5 tệp, +106 / −8)
| Tệp | Đổi |
|---|---|
| `suppliers/cn/mecca-power.json` | bỏ dòng `MC1000D \| 260 \| 325 \| 800 \| 1000 \| TCD12.1` |
| `web/catalog.js` | `BC_ALT` (acepow BC1xx trước động cơ), `ocrFig` (vantek "3S0" / "312.S"), `apart` trong `walkedSpecs` (sr-genset "Engine \| Modle"), bỏ cặp prime / standby lệch (hosem n136) |
| `suppliers/lech-cot-8.test.mjs` | mới, 72 dòng |
| `suppliers/spec-read.test.mjs` | ca acepow n109: BC184E nay là đầu phát (dữ liệu thật) |
| `web/CLAUDE.md` | ghi bẫy + các ca KHÔNG sửa (koop, hosem n104/109/118/120/129/134) |

Nhánh nằm sau `origin/main` (thiếu #899) nên bước kiểm làm ở worktree riêng `wt-lech-cot-8b` (cùng commit, rebase lên origin/main `7d632e30`; rebase sạch). Nếu merge, nên rebase PR lên main.

## 2. Lệnh kiểm và đầu ra thật (trong `wt-lech-cot-8b`, sau rebase)
- `node --test suppliers` → tests 1012, pass 1012, fail 0.
- `node --test web\test\*.test.mjs` → tests 161, pass 161, fail 0.
- `node suppliers/quality.mjs --check` → "không chỉ số nào xấu đi quá ngưỡng" (cyl 25/1418, disp 197/1092, bore 51/934, compr 42/204: không đổi so baseline).
- `node suppliers/spec-diff.mjs git:origin/main . --out full-8b.txt --md tom-tat-8b.md` → bản ghi cũ 59.222, mới 59.237 | khác 65 | chỉ cũ 3, chỉ mới 18 | bảng có đổi 7; `{other:20, power:16, genset:15, model:8, "voltage bỏ":29}`; đảo vai động cơ ↔ đầu phát 3 → 1. Tệp: `dau-vao\ra-soat-lech-dong-cot\full-8b.txt`, `tom-tat-8b.md`.

## 3. Soát MỌI dạng thay đổi bản ghi (spec-diff, đủ 65 + 3 + 18)
Không có thay đổi nào ngoài 5 lỗi đã nêu. Theo NCC:

| NCC | Đổi | Là gì |
|---|--:|---|
| acepow-fuan (n155, bảng 64) | 18 đổi + 18 thêm | 18 dòng có đầu phát `BC164C/D/E`, `BC184E/ES/F/G` đứng trước động cơ: bản ghi động cơ nay mang đầu phát (`other: null → BC…`) và có 18 bản ghi đầu phát MỚI. Không dòng nào mất / đổi động cơ (Y480BD, N4100DS-26, K4100DS… giữ nguyên). |
| sr-genset (n2001 bảng 0 + n2004 bảng 6) | 29 | CHỈ trường `voltage` bị bỏ: 104.5 / 119 / 144 / 176 / 220 / 264… là kW của mức standby (ví dụ dòng `\| 50 \| 400 \| 95 \| 118.75 \| 104.5 \| 130.625 \| SRGENSET \| 4FWZL1`: 104.5 = kW standby, không phải vôn). Không trường nào khác đổi. Giá trị đúng (400 V) vẫn chưa đọc được: thiếu, không sai. |
| vantek-jiangsu (n101 bảng 0, 1) | 2 đổi + 2 mất | Động cơ của 2 dòng trước là "3S0" / "312.S" (kVA đọc sai), nay là `N855-DM` / `NTA855-DM` (đúng chữ nguồn); 2 bản ghi đầu phát giả `N855-DM`, `NTA855-DM` mất. Đảo vai alternator←engine 2 → 0. |
| mecca-power (n5001 bảng 41) | 15 đổi + 1 mất | Chỉ là hệ quả bỏ dòng MC1000D: mỗi dòng sau nhận giá trị của dòng kế (MC413D vào chỗ MC1000D…), bản ghi cuối (MC619D / BF8M1015CP-LA) mất vì bảng ngắn đi một dòng. Đã đối chiếu từng dòng: giá trị mới tại vị trí k đúng bằng giá trị cũ tại k+1. Không giá trị nào khác đổi. |
| hosem-power (n136, bảng nhãn 34) | 1 | công suất QSZ13-G3 `P 500/· S ·/22` → bỏ (prime 500 kVA ghép với standby 22 kW). |

29 "không tự xác nhận" của công cụ đều là 29 dòng sr-genset `voltage` → ∅ (giá trị mới rỗng nên công cụ không kiểm được): đã xem hết, đều đúng.
Đảo vai: depco `engine←alternator` 1 → 1 (P158LE-1, vẫn báo nhầm, không đổi so main; ghi trong CLAUDE.md); vantek 2 → 0.

## 4. Top 30 ứng viên toàn bộ gói (đo thật)
Công cụ: `do-gop.mjs` chạy ở `wt-lech-cot-8` → `gop-lech-cot-8.json` (xong 08:56); gốc `gop-main-7b3ba722.json` (main 7b3ba722; main nay có thêm #897 / #899 không đụng mã đọc / chọn ứng viên). Đối chiếu bằng `gopWhy2.cjs`, `det.cjs`, `gopRow.mjs` + `gopRowCmp.cjs` (hai bản: `wt-lech-cot-8-main` ↔ `wt-lech-cot-8`, 24 lượt đổi).

- 1.093 lượt, 0 lỗi (cả hai bản). Gợi ý HSMT (`hints`) không đổi lượt nào.
- Giống hệt (cùng 30 dòng, cùng thứ tự): **1.069**. Chỉ đổi thứ tự: **3**. Tập top 30 đổi: **21**. Tổng 33 dòng vào, 33 dòng ra.
- Hãng / dòng NCC khác hiện ở top: chỉ các hoán đổi nêu dưới đây.

### Giải thích từng dòng VÀO (33)
| Dòng vào | Số | Vì sao |
|---|--:|---|
| acepow-fuan n155 (`APW-10.5`/`APW-12`/`APW-15`/`APW-16`/`APW-18`/`APW-20` với BC164C/D/E, BC184E/ES) | 30 | Dòng không đổi; CHỈ đầu phát mới đọc ra. `candidates` (config-bot.mjs:1474) cộng +40 cho dòng có đầu phát (`if (a) { score += 40 …`). Đo từng dòng (`gopRowCmp`): trong 24 lượt, 80 dòng đổi điểm, **cả 80 là acepow n155, đúng +40**, không dòng nào khác đổi điểm, lý do (`why`) giữ nguyên. Điểm +40 làm dòng nhảy hạng (vd. IB2200020589 APW-10.5: hạng 71 → 27, điểm 177 → 217) và vào top 30. |
| powerzoo `Y12P6` (IB2400111737, IB2400311120) | 2 | Dòng không đổi (điểm 205 cả hai bản). Hai dòng acepow +40 chen lên trên; yongcai `YCM10QC50` (205) và acepow `API10` (217 → vẫn 217, hạng 89 → 89) rơi khỏi top (cả hai ở hạng 89 / 105, trong khi acepow APW-10.5 chen lên hạng 27 / 100); powerzoo (205, hạng 103 → 104, cùng điểm với yongcai) lấy chỗ trống. Chưa truy cơ chế chọn đa dạng của `candidates` để giải thích vì sao powerzoo, không phải dòng khác, vào (chỉ thấy điểm của nó không đổi): ghi là điều chưa kiểm sâu. |
| tecnogen `CU1000TV` (IB2300080302) | 1 | KHÔNG do PR này: `wt-lech-cot-8-main` (main hiện tại) và nhánh cho kết quả GIỐNG HỆT lượt này (cùng top#14, không dòng nào đổi điểm). Gốc `gop-main-7b3ba722` có dòng tecnogen `SA1100TSXD201 … 2XDC13072A0214` lấy mã tủ SCP8610 làm động cơ; lỗi đó đã được sửa trong #894 sau lần đo gốc, nên dòng ra / dòng vào này là khác biệt do GỐC ĐO CŨ. |

### Giải thích từng dòng RA (33)
| Dòng ra | Số | Vì sao |
|---|--:|---|
| Dòng không đổi bị acepow +40 chen chỗ | 32 | Mọi dòng này có điểm và lý do KHÔNG đổi giữa hai bản (`gopRowCmp`), chỉ bị đẩy xuống hạng 31+ ở biên top 30. Gồm: sunny-weifang DB10GF/DB15GF 4, victory-generator V12T 2, longkai-power LG12X 3, eastern-lion-fuan 6, elitech-power 1, bobig-power BFA17 1, yongcai-elecmama YCM10QC50 2, uleengen UY10GFS 1, kaihua-genset KH12GF 1, mecca-power MC14F 1, acepow-fuan (API10, API20, APF12, APF16, APF20, APF24, HPDD16: dòng của chính acepow chỉ bị acepow dòng khác chen) 10. |
| tecnogen `SA1100TSXD201` | 1 | Như dòng vào tecnogen ở trên: lỗi của gốc đo, đã sửa ở #894. |

Cộng: vào 30 + 2 + 1 = 33; ra 32 + 1 = 33. Không dòng vào hay ra nào đổi công suất, hãng, hay model. Mọi lượt đổi tập (21) đều có ≥ 1 dòng acepow n155 vào, trừ IB2300080302 (tecnogen, gốc đo). 3 lượt chỉ đổi thứ tự cũng là acepow +40.

Không có lượt nào mà không dòng vào / ra nào tự đổi (trừ tecnogen nêu trên): mọi dòng vào đều tìm được nguyên nhân từ dòng của chính nó (đầu phát mới đọc ra) hoặc là chỗ trống do dòng khác.

## 5. Ba mẫu đối chiếu nguồn
1. acepow-fuan n155: http://www.acepow.net/quality-13566819-20kw-portable-generators-for-home-use.html — tiêu đề "| Model | P | Hz | KW | kva | Model | Output | Engine"; dòng `| APW-10.5 | 3 | 50 | 10.5 | 12 | 13 | 14 | BC164C | 10.8 | 12 | Y480BD`: `BC164C` đứng trước `Y480BD`, 10.8 / 12 là công suất ra của đầu phát (kW / kVA) cạnh nó; Y480BD là động cơ Quanchai. Khớp: bản ghi mới đọc BC164C đầu phát, Y480BD động cơ (`sources/acepow-fuan/155.md`).
2. vantek-jiangsu n101: http://www.vantekpower.cn/cyjz/3.html — `| CCFJ280J-WTP | 280 | 3S0 | N855-DM | 317 | 6 | 2998-1000-1790 | 2950`: 280 kW ÷ 0,8 = 350 kVA, "3S0" là 350 đọc OCR sai; N855-DM là động cơ Cummins, 317 kW công suất động cơ (`sources/vantek-jiangsu/101.md`). Dòng thứ hai `| CCFJ250Y-WTP | 250 | 312.S | NTA855-DM`: 250 ÷ 0,8 = 312,5.
3. sr-genset: https://generatorsr.com/srgenset-series/ — tiêu đề `| Frequency | Voltage | Rated power | Standby Power | Engine | Modle | Alternator | Modle | Specifications`, dòng `| 50 | 400 | 95 | 118.75 | 104.5 | 130.625 | SRGENSET | 4FWZL1 | SRGENSET | SAL274C2 | PDF`: 400 là điện áp, 104.5 / 130.625 là kW / kVA standby (không phải điện áp).
(Hai mẫu phụ.) mecca-power catalog 2026 (https://github.com/khoanguyenminh6868/GenSet-Pro/releases/download/datasheets-upload/mecca-power-catalog-2026.pdf): chữ PDF "MC1000D 1000 800 325 260 TCD12.1 G1 CN … 6L/TCA 12.100" — standby 1000 kVA gấp ~3 lần prime 325 trên động cơ 12,1 L 6 xi lanh, kèm một dòng MC1000D khác "… 801 910 728 DP222CC Korea … 12V 21.9" (dòng đúng, giữ). Hosem n136: https://www.industrialgeneratorset.com/buy-500kva-diesel-generator-page2.html — các dòng nhãn "Prime Power | 500kVA" cùng "Standby Power | 22kW" (22 kW chắc chắn không là standby của máy 500 kVA).

## 6. Rủi ro còn lại và cách quay lui
- Quay lui: `git revert` các commit của PR (mỗi lỗi một commit) hoặc không merge; dữ liệu `mecca-power.json` quay lui bằng revert commit f40d5044.
- `catalog-pdf.mjs` cào lại catalog mecca sẽ ghi lại dòng MC1000D (chưa có chốt "standby > 1,5 × prime"); đã ghi trong `web/CLAUDE.md`.
- Hosem n104 / n109 / n118 / n120 / n129 / n134 vẫn lấy công suất của dòng đầu mỗi nhãn (trang liệt kê nhiều sản phẩm); quy tắc "≥ 2 mã động cơ thì bỏ công suất" làm mất số đúng của keypower, saudi-diesel, fdk-energy, mingbang → KHÔNG sửa.
- koop KDF6700WE: nguồn ghi đúng "Output power (kVA) 2.0" (máy hàn phát) → KHÔNG sửa.
- sr-genset: điện áp đúng (400 V) chưa đọc được (thiếu, không sai).
- acepow +40 đẩy 30 dòng acepow n155 lên top ở nhiều gói nhỏ (10–20 kVA, 1 pha): đúng quy tắc chấm hiện có (dòng có đầu phát được cộng điểm), nhưng đáng lưu ý nếu Khoa thấy acepow xuất hiện nhiều.
- `suppliers/spec-read.test.mjs` đổi ca acepow n109: BC184E nay là đầu phát (đúng dữ liệu thật).

## 7. Chưa kiểm được
- Chưa mở lại trang acepow / vantek / sr-genset bằng trình duyệt hôm nay: đối chiếu dựa trên `sources/<id>/<n>.md` đã lưu (accessedAt 13–14/11/2026).
- Không chạy `verify.mjs` (không đụng `specTables` / nguồn, chỉ xoá một dòng `rows` của mecca; test + `spec-diff` đã cover).
- Không kiểm trên web Vercel thật (PR chưa merge).

## Cần ghi nhớ
- Gốc đo `gop-main-7b3ba722.json` có dòng tecnogen sai đã sửa ở #894: đo lại gốc ở main mới trước các lần so sau (hoặc dùng `wt-lech-cot-8-main` + `gopRow.mjs`).
- Nhánh `lech-cot-8` cần rebase lên origin/main trước khi merge (thiếu #899). Worktree cần gỡ sau khi phiên điều phối merge: `wt-lech-cot-8b` (của phiên kiểm này, đã dùng xong), `wt-lech-cot-8`, `wt-lech-cot-8-main`.
- Tệp đo lưu ở `dau-vao\ra-soat-lech-dong-cot\`: `gop-lech-cot-8.json`, `row-main-8.json`, `row-8.json`, `rowcmp-8.txt`, `det-8.txt`, `why2-8.txt`, `full-8b.txt`, `tom-tat-8b.md`.
