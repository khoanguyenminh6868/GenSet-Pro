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
