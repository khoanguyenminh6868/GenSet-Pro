# Lệch cột 11, nghiệm thu 2: đo top 30 ứng viên (18/11/2026)

- **PR:** https://github.com/khoanguyenminh6868/GenSet-Pro/pull/926 (DRAFT, chưa merge). Nhánh `lech-cot-11` đã rebase lên origin/main 3c0a49ff (#929), đẩy bằng force-with-lease đúng sha: đầu nhánh **6361a007**.
- **Lượt đo:** gốc = worktree `wt-lc11-base` (3c0a49ff) ↔ nhánh = `wt-lc11-new` (6361a007). Cả hai chạy trên CÙNG `suppliers/cn` của `wt-lc11-base` (`git diff origin/main lech-cot-11 -- suppliers/cn` rỗng).
- **Lệnh:** `do-gop-rf.mjs` (bản của Chất lượng 1: truyền `blocked = blockedRows(sups, {})`, rowok rỗng, ở CẢ hai bên; ghi cả `all` kèm điểm). Hai tiến trình node song song, 4.755 s mỗi bên, 928 gói → **1.093 lượt**, không lỗi. blocked: 48 dòng (gốc) ↔ 20 dòng (nhánh).
- **Tệp** (trong `dau-vao\lech-cot-11\`): `gop-main.json`, `gop-lech-cot-11.json`, `gop-so.txt` (từng lượt, từng dòng vào / ra, bản ghi cũ ↔ mới), `cmp30.mjs` / `cmp30.json`, `explain.mjs` / `explain.json`, `explain2.mjs`, `explain3.mjs`, `order-explain.txt`, `facts.mjs` / `factdiff.mjs` / `facts-changed.json`, `row1.mjs`, `gopLc11.mjs`, README.md.
- **Kiểm lại trước khi đo (đã chạy, thật):** rebase không xung đột; `node --test suppliers/*.test.mjs` = 1103 tests, 1096 pass, 0 fail, 7 todo; `web/test` 161/161; `quality.mjs --check` "không chỉ số nào xấu đi"; spec-diff `git:origin/main` ↔ nhánh: **279 đổi / 43 mất / 96 thêm**, đảo vai 1 → 0 (số không đổi so với trước rebase).

## Tổng
| | lượt |
|---|--:|
| Không đổi gì | 370 |
| Đổi tập top 30 | 80 |
| Chỉ đổi thứ tự | 32 |
| Chỉ đổi `all` / điểm / `dropped` (top giữ nguyên) | 611 |
| **Tổng lượt đổi** | **723** (66 %) |

Dòng ra / vào top 30 (mỗi bên 126 dòng, mỗi dòng truy về bản ghi của chính nó):

| Hướng | Nguyên nhân | số dòng |
|---|---|--:|
| RA | bản ghi ĐỔI vai: mã khung đầu phát uleengen (164B/164C/164D/184EF/224E…) trước bị đọc là ĐỘNG CƠ | 26 |
| RA | dữ kiện của mã động cơ đổi (xem dưới): QSL9G5 4, QSB7G5 4, KTAA19G6A 4, KTA19G3A 3, KTAA19G5 3, QSB5G3 2, QSL9G3 2, S38G4 1, X25G2 1 | 24 |
| RA | bị chen (bản ghi không đổi), nằm trong lượt có dòng khác đổi / hoà điểm hạng 30 | 76 |
| VÀO | rise-power (Doosan P-series nay là ĐỘNG CƠ, kích thước đọc) | 30 |
| VÀO | rcg-power (Doosan P086TI/P126TI/P158LE là động cơ, đầu phát TAL-/UCI-/S4L1D-) | 15 |
| VÀO | bản ghi đổi vai Doosan / mã khung ở NCC khác (agg, kaichen, green-power, jet, sanq…) | 15 |
| VÀO | uleengen (7), sanq-power (1) | 8 |
| VÀO | dữ kiện model đổi (X33G1, S38G6, X13G2, S38G4) | 4 |
| VÀO | lấp chỗ (bản ghi không đổi) | 54 |

**Mọi lượt đổi đều truy được nguyên nhân; không lượt nào "không rõ".** Cách kiểm (script ở `dau-vao\lech-cot-11`):
- 77 lượt đổi tập top có ít nhất một dòng vào / ra do bản ghi đổi hoặc dữ kiện mã đổi. 3 lượt còn lại (IB2300379454#0, IB2400110579#0, IB2400595350#0) chỉ đổi dòng HOÀ ĐIỂM ở hạng 30 (điểm hạng 30: 229/229, 229/229, 205/205); thứ tự trong nhóm hoà điểm phụ thuộc thứ tự dòng, mà thứ tự đó đổi vì dòng uleengen rời `all`.
- 32 lượt chỉ đổi thứ tự: **20** là đổi chỗ trong nhóm HOÀ ĐIỂM (dãy điểm và điểm từng dòng giống hệt, `explain3.mjs`); **12** có dòng top đổi điểm −8 (dữ kiện mã đổi).

## Nguyên nhân gốc theo nhóm
1. **Doosan P086TI/P126TI/P158LE/P180LE/P222LE là động cơ (rise 633 dòng, rcg 482, kaichen 126, agg 42, sanq, jet, green-power) và mã khung đầu phát uleengen (164B…, 224E) là đầu phát.** Spec-diff: 96 bản ghi thêm / 43 mất. Dòng vào `all` +1.763, ra −1.194 (cả vì mỗi bản ghi cho nhiều dòng ứng viên × gói).
2. **Dữ kiện sai bị bỏ khỏi mã động cơ (26 mã).** Từ `facts` (facts-changed.json), mọi mã đổi chỉ MẤT dữ kiện, không thêm: yanfa n107 "dung tích" thật ra là tiêu hao/công suất tối đa (KTAA19G6A disp 74 [thật 18,9 L], QSB7G5 46 [6,7 L], KTA19G3 87 [18,9 L], S38G4 9 [3,8 L], X25G2 5,5 [2,5 L], 4BT33G3 11,5 [3,3 L]…) và hosem n134 "6 Cylinder In Line" gắn nhầm cho DP158LD / QSZ13G3. Hệ quả: (a) điểm "dữ kiện" của mã mất 8 điểm (sanq 500, yanfa 313, huadong 314, ade 86, tide 42, cgm 19, cameo 13 lần, tất cả Δ −8); (b) dòng từng vượt ngưỡng `disp` nhờ số sai nay bị loại đúng: IB2200015953#0 (HSMT "dung tích xy lanh > 7.150 cm3") mecca-power QSB7G5 (6,7 L thật): trước là `all` (nhờ "46"), nay bị loại `disp`. Đó là ~75 mecca + 26 legapower + 20 fdk-energy + 19 depco… dòng rời `all`.
3. **Cổng rowflag (blocked 48 → 20 dòng):** dòng yanfa (185 ô), yingtai (40), cgm (13), hosem (8), aosif (8), xinhengxin (4), zhengdian (3) từng bị gắn cờ `absurd` vì đọc lệch cột nay không còn số vô lý (hoặc bỏ giá trị) nên trở lại `all`: yanfa +135, yingtai +36. Cờ còn lại chỉ yongcai (6, nguồn tự ghi 2350 rpm cho QC385BT).
4. **Hoà điểm hạng 30** (3 lượt đổi tập, 20 lượt đổi thứ tự): thứ tự dòng hoà điểm đổi khi dòng uleengen rời `all`.

## Một chỗ cần điều phối quyết (phát hiện khi truy)
**depco-power P158LE: 18 dòng rời `all` (khóa `freq`).** Mã P158LE nay có ≥ 2 dòng ĐỘNG CƠ chỉ ghi 60 Hz (jet-power "60Hz", rise "-60", kaichen 60Hz…) vì trước đó chúng bị đọc là đầu phát; luật tần số của `candidates` (Khoa 17/11: "mọi dòng có ghi tần số đều ghi tần số kia, ≥ 2 dòng") loại dòng KHÔNG ghi tần số của mã đó khi HSMT đòi 50 Hz. Dòng depco có chữ "FREQUENCY(HZ):50" nhưng `freqIn` (catalog.js) chỉ nhận "50 Hz" / "50Hz" / "1500 rpm", nên `u.freq` trống và bị loại. Nghĩa là luật đúng, nhưng chỗ đọc tần số hụt một cách viết. Tôi KHÔNG sửa `freqIn` (đổi cách đọc tần số của nhiều bản ghi ngoài phạm vi 45 dòng). Muốn thì mở việc riêng: cho `freqIn` nhận "FREQUENCY(HZ): 50" / "Frequency (Hz) | 50".

## Bẫy khi đo (đã ghi)
- Khoá dòng của `do-gop` KHÔNG duy nhất: hai dòng cùng khoá (cùng bảng chép hai lần, vd kanpor-fuan 4BT39G1 "KPC25…") điểm khác nhau; so `all` bằng Map theo khoá tạo ~1.000 "đổi điểm" giả (victory LT620, kanpor 4BT39G1). So theo đa tập (`cmp30.mjs`).
- Các số 2 và 3 ở trên không phải do tôi chọn mẫu: đều từ `cmp30.json` / `facts-changed.json` trên toàn bộ 1.093 lượt.

## Chưa kiểm
- Chưa đọc tay từng dòng của 1.093 lượt: 252 dòng vào / ra top đã phân loại bằng quy tắc (đổi vai, bản ghi đổi, dữ kiện mã, chen) và kiểm mẫu (kanpor, depco P158LE, mecca QSB7G5 + chữ HSMT). Mọi dòng có trong `gop-so.txt`.
- Đo này theo `candidates` (không agent); chưa chạy Gợi ý thật.

## Rủi ro và rollback
- Rollback: revert PR #926. Không đổi dữ liệu.
- Rủi ro mới thấy: luật `freq` (trên) và việc các Doosan P-series giờ là động cơ làm số dòng ứng viên của chúng tăng mạnh (rise +633, rcg +482 lần xuất hiện trong `all`) vì mỗi dòng nay là một cặp động cơ + đầu phát đọc đúng, không phải dòng thừa.

## Cần ghi nhớ
- Đo top 30 phải so `all` theo đa tập, không theo Map khoá (khoá lặp).
- Dữ kiện mã động cơ bị nhiễm số sai (yanfa "dung tích" = tiêu hao) từng giúp dòng "đạt" ngưỡng dung tích; bỏ số sai là loại đúng, nhưng làm số dòng `all` giảm ở NCC không đổi gì.

---
# Vòng 3 (điều phối 18/11/2026): sửa `freqIn` cho ca depco P158LE — commit 0a184486 (đã push, PR #926)

## Nguyên nhân thật của 18 dòng depco
Bản ghi từ bảng nhãn xếp dọc (depco n2182: "Frequency(Hz):" rồi "50" ở dòng kế) không có tần số: bản ghi bảng nhãn chỉ lấy tần số từ tiêu đề / tên bảng (`tFreq`), và `freqIn` chỉ nhận "50 Hz" / "1500 rpm", không nhận nhãn + số. Khi Doosan P158LE thành động cơ, các dòng ĐỘNG CƠ P158LE có tần số chỉ còn 60 (jet "60Hz", kaichen 60Hz…) nên luật `freq` loại dòng không ghi tần số (depco ghi 50 trong nhãn nhưng bản ghi trống).

## Sửa (`web/catalog.js`, chỉ mã đọc)
- `freqIn(text, labelOnly)` thêm: nhãn tần số (`frequency`, `freq.`, `tần số`, `频率`, kèm "(Hz)" / "[Hz]" / "Hz") đứng NGAY trước số 50 / 60, sau nhãn cho phép `:` `：` `=` `|`. Số theo sau là 50 / 60 khác ("50Hz/60Hz", "50 | 60", "50 Hz or 60 Hz", "50-60"), số có thêm chữ số / dấu thập phân, "%", V, kW, kVA: KHÔNG nhận.
- Dùng cho bản ghi BẢNG NHÃN (`freq: tFreq || freqIn(block, true)`, chỉ luật nhãn, không lấy "50 Hz" ở xa), không đổi cách đọc tần số của bảng dòng.
- Test dòng thật: depco n2182 → 50, n2101 (tiêu đề 60Hz) vẫn 60; và 7 ca chữ (nhãn + số, "50/60", "50 | 60", "or", "regulation 0.5 %").

## Kiểm chéo toàn bộ (mục 2): MỌI bản ghi có freq đổi, toàn bộ cn
Script `fq.mjs` (cũ = origin/main, mới = nhánh), kết quả: `freq-tom-tat.txt`, `freq-doi-tung-ban-ghi.txt` (từng bản ghi), `freq-dang-chu.txt` (một ví dụ chữ nguồn mỗi NCC × dạng).
- **1.435 bản ghi freq đổi, tất cả ∅ → 50 / 60; không bản ghi nào đổi giá trị (50 ↔ 60 = 0).** 41 NCC. depco 490, fdk-energy 398, powerzoo 76, shanhua 59, endress 54, voltgent 50, genlitec 44, huachai 39, tecgen 39, chenxing 37, changchai 27, koop 17, generatordieselchina 15, elitech 14, … (đủ trong tệp).
- **Dạng chữ khớp (13 dạng, đã xem hết, ví dụ trong `freq-dang-chu.txt`):** `Frequency | 50` 590 (+29 ra 60), `Frequency(Hz): 50` 484 (depco xếp dọc), `Frequency (Hz) | 50` 110 (+3), `Frequency: 50` 49 (+49 ra 60), `频率 | 50` 37, `Frequency [Hz] | 50` 28 (+26), `频率(Hz) | 50` 16, `频率Hz | 50` 11, `Frequency(Hz) | 50` 3. Mọi dạng là nhãn tần số định mức của TỔ MÁY ("Rated frequency", "Output frequency", "额定频率", "Frequency"); không dạng nào là chữ khác.
- **Đã thu hẹp luật sau lượt xem đầu** (bản đầu cho 1.715 bản ghi, 208 bản ghi sai): "Frequency | 50Hz/60Hz" (mingbang 60, kingway, elitech…) đọc thành 50 → thêm điều kiện "số 50 / 60 kề sau" loại; còn lại 34 bản ghi mà bảng có chỗ khác nhắc tần số kia: acepow ("Frequency: 50HZ" cùng dòng "Frequency: 50 Hz or 60 Hz frequency option"), genlitec 18 / hosem 4 / tecgen 11 ("Frequency | 50Hz" của tổ máy, và "Alternator frequency | 50/60Hz" của đầu phát): đúng 50.

## Xác nhận 18 dòng depco P158LE (mục 3) và các dòng mất vì luật `freq`
- depco P158LE trong `all` (cộng mọi lượt): **main 31 | nhánh trước freqIn 13 | nhánh sau freqIn 31** (về đúng bằng main). `row1.mjs` trên IB2200049404#0: trước DROPPED ruled ["freq"], sau ALL 131.
- Dòng ĐÃ rời `all` của nhánh sau so với nhánh trước (1.385 dòng-lượt): **1.343** vì tần số của CHÍNH dòng (nhãn nguồn) khác tần số HSMT (candidates bỏ `u.freq ≠ hints.freq`): powerzoo 1.040 (mọi dòng ghi "FREQUENCY:60HZ"), genlitec 132, generatordieselchina 61, tecgen 47, depco 29, fdk-energy 11, saudi-diesel 9, gtl 6, shanhua 3, voltgent 2, hosem, supermaly, superwatt 1. Script `chkfreq.mjs`: với từng dòng, tần số của bản ghi ≠ tần số `hintsOf` của lượt đó: 1.343/1.343 khớp. **42** vì luật `freq` thứ hai (mã chỉ có dòng một tần số, ≥ 2 dòng; dòng KHÔNG ghi tần số bị loại): 4DX2390DHMS20W (longkai 9, landtop 9, previa 8 + lượt khác; bid 50 Hz; depco và powerzoo ghi 60 Hz), Baudouin 6M12G6D3/5, 6M12G8D3/5 (bid 60 Hz; hậu tố "/5" là bản 1500 rpm / 50 Hz; rcg, voltgent, weichai, baifa, yanan). Ca Baudouin chính là ca Khoa 17/11 luật `freq` được viết cho.
- **Chưa kết luận được:** 4DX2390DHMS20W: luật đúng theo thiết kế (hai NCC ghi nhãn 60 Hz), nhưng nếu đây là một động cơ bán cả 50 lẫn 60 Hz mà longkai / landtop / previa không ghi thì luật loại nhầm; không có dữ kiện để phân định, để nguyên theo luật hiện có.

## Đo lại (mục 4): MỘT tiến trình, chỉ nhánh 0a184486, gốc dùng lại `gop-main.json` (main 3c0a49ff)
`do-gop-rf2.mjs` (như `do-gop-rf.mjs` + ghi dòng bị loại kèm lý do), chạy sau khi tiến trình `do-gop` của Đặc thù hãng kết thúc (không chạy chồng), 7.892 s, 1.093 lượt, không lỗi. Tệp: `gop-lech-cot-11-b.json`, `cmp30-b-vs-main.json`, `cmp30-b-vs-a.json`, `chkfreq.mjs`.

| | main ↔ nhánh SAU freqIn | nhánh TRƯỚC ↔ SAU freqIn (chênh do freqIn) |
|---|--:|--:|
| không đổi | 223 | 368 |
| đổi tập top 30 | 110 | 32 |
| chỉ đổi thứ tự | 32 | 0 |
| chỉ đổi `all` / dropped | 728 | 693 |

Phần chênh do freqIn (32 lượt đổi tập top, ra 40 / vào 37 dòng): **33/40 dòng ra** là dòng rời `all` vì tần số của chính dòng ≠ HSMT (tecgen 22, stone-power 16, saudi 4, gordon 4, genlitec 4, fdk 4, powerzoo 2…); **33/37 dòng vào** là dòng đã ở `all` trước đó (lấp chỗ); 4 dòng vào mới vào `all` + 2 lượt (IB2300252125#0, IB2600374560#0): đó là rise-power / rcg-power P158LE được trả lại (luật `freq` thứ hai không còn áp cho P158LE vì depco nay có freq 50), cùng nguyên nhân với ca depco. Dòng vào `all` +674 (rise 279, depco 153, long-gen 110, agg 80, rcg 36, aosif 16) là P158LE / A498BD / C490BD / 4D35ZD quay lại sau khi luật `freq` thôi áp.

## Lệnh đã chạy (thật)
`node --test suppliers/*.test.mjs` 1105 tests, 1098 pass, 0 fail, 7 todo; `web/test` 161 pass; `quality.mjs --check` không chỉ số nào xấu đi; spec-diff `git:origin/main`: bản ghi 58.963 → 59.016, **1.710 đổi** (279 như cũ + 1.431 do freq), 43 mất, 96 thêm, 1.054 bảng / 47 NCC, đảo vai 1 → 0.

## Rủi ro mới / cần nhớ
- freq mới của 1.435 bản ghi làm dòng đúng nguồn bị loại khi HSMT đòi tần số khác: là tác dụng đúng, nhưng ứng viên của gói 50 / 60 Hz bớt (powerzoo −1.040 dòng-lượt).
- 4DX2390DHMS20W (mục trên) là chỗ duy nhất tôi không phân định được.
- Bản ghi bảng nhãn nay mang tần số: mọi chỗ khác đọc `u.freq` (candidates, bảng danh mục `e.freq`) thấy thêm dữ liệu; `catalog.js` `need.freq` / `freqOk` điểm −20 cho động cơ không có tần số HSMT.
