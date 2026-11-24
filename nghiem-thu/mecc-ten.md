# Mecc Alte: gộp tên model ↔ tờ hãng (24/11/2026) — DỪNG sau Bước 2 (bằng chứng), chưa viết mã

**Trạng thái**: KHÔNG sửa code, KHÔNG test mới, KHÔNG PR. Dừng theo luật context 30 %. Worktree `C:\Projects\GenSet Pro\wt-mecc-ten` (nhánh `wt-mecc-ten`, từ `origin/main` ca82f20a), sạch, chưa commit.
Lưu ý: `SAME_SHEET` / `ratingsFor` của Stamford (`stamford-ten-lech.md`) CHƯA có trên main (#1137 chỉ là bộ nhớ); `ratingsFor` hiện ở `suppliers/config-bot.mjs:4450`, chỉ khớp khoá `CAT.keyOf` đúng hoặc bỏ chữ hãng đứng trước.

## Đo hiện trạng (`CAT.build` trên main, script `scratchpad\mecc-lines.mjs`, tiêu chí như `thieu-to.mjs`)
239 model đầu phát Mecc Alte + Leroy-Somer; thiếu tờ: Mecc Alte **34**, Leroy-Somer **90**. Kết quả đầy đủ: `scratchpad\before.json` (trước khi sửa, MỌI model: model, hãng, `miss`, số dòng định mức, số thuộc tính, danh sách NCC) và `before.txt` (dòng NCC ghi từng model).

## Bằng chứng tìm được
**Loại 1 (tài liệu Mecc Alte)**
- (a) Tờ dải `sources/mecc-alte/1007–1016.md` (URL `https://www.meccalte.com/dds/pdf/5` cho 1016, Accessed 2026-11-21): tiêu đề tờ "ECO46 4 A" kèm dòng "| Pole number | 4" ; hàng trong tờ viết "ECO46 1.5L4 A", "ECP28 M4 C"… ⇒ chữ số "4" ở vị trí giữa tên khung–dài–cuộn là số cực (tờ tự ghi "4" trong tên và "Pole number 4").
- (b) Catalogue `genbid-work\alt-datasheets\mecc-alte\Serie_ECO_EN.pdf` (.txt dòng 479, mục 2): "ECO Series alternators are self-regulated, 4-pole brushless alternators." — CHƯA nguồn hoá (tệp ngoài `sources/`, chưa có URL / số nguồn; `verify.mjs` không kiểm được).
- (c) `Series_ECP_EN` (.txt dòng 1574–1604): hãng viết tên NGẮN CÓ hậu tố cực "ECP28-M/4 A" (4 cực) và "ECP28-M/2 A", "ECP28-2L/2 A" (2 cực) ⇒ với ECP, tên không số cực của danh mục (ECP28-MC, ECP32-xxC, ECP34-xxC) khớp CẢ 4 cực và 2 cực.
- (d) `ECO_46_6_pole.pdf` ("6 POLE", "ECO46LV-1S/6"): ECO46 có cả bản 6 cực ⇒ tên ECO46 không số cực cũng nhập nhằng; ECO38 / 40 / 43: chỉ có câu "4-pole" (b) và dòng "(only 6 poles)" ở bảng ốc (.txt 3563) — chưa rõ có bản 6 cực không.
**Loại 2 (dòng của NCC)**: bảng gti-power 2001 / 2003 chỉ ghi "50Hz" ở tiêu đề (không số cực, không 1500 rpm) ⇒ KHÔNG đủ loại 2 (50 Hz cũng là 2 cực 3000 rpm). kaihua-genset 125, depco-power 2138: không. Ngoại lệ DUY NHẤT: rise-power 104 ghi "ECO43-1SN/4 | ECO43 1S4" và "ECO46-1S/4 | ECO46 1S4": chính NCC viết hậu tố "/4" và dạng tờ — loại 2 cho riêng ECO43-1SN/4 (huachai-deutz 121 cũng ghi "ECO43-1SN/4").

## Bảng 34 model Mecc Alte thiếu tờ × bằng chứng (đề xuất; CHƯA đối chiếu lại từng model với tệp tờ — soát trước là 26/34 có dòng "<khung> <dài>4 <cuộn>")
| Họ | Model (NCC chào) | Bằng chứng | Đề xuất |
|---|---|---|---|
| ECO38 | 1LC, 2LC, 2MC, 2SC, 1SC (gti-power) | loại 1 (a)+(b); loại 2 không | gộp được nếu Khoa chấp nhận (b) là bằng chứng "ECO38 chỉ 4 cực"; (b) cần nguồn hoá trước |
| ECO40 | 1S, 2L, 2S, 3L, 3S (gti-power) | như ECO38 | như trên |
| ECO40 | VL (gti-power), 1.5L4B (depco-power) | loại 1 như trên nhưng dòng tờ chưa tìm thấy | không gộp (chưa có dòng tờ) |
| ECO43 | 1M, 1S, 2M, 2S (gti-power) | như ECO38 | như trên |
| ECO43 | 2LN, VL (gti-power) | như trên, dòng tờ chưa kiểm | không gộp tới khi tìm dòng |
| ECO43 | 1SN/4 (huachai-deutz, rise-power) | loại 2 (rise-power 104 ghi "ECO43 1S4") | gộp với "ECO43 1S4" nếu tờ có đúng dòng đó (chưa kiểm "N") |
| ECO46 | 2L (gti-power, kaihua; 2 NCC), 1L, 1S, 2S, 1.5L, VL, "VL (Mecc Alte)" | loại 1 (a) nhưng ECO46 có bản 6 cực (d); loại 2 không | KHÔNG gộp (nhập nhằng 4 / 6 cực, NCC không ghi cực / rpm) |
| ECP28 / 32 / 34 | MC, VLC, 1LC, 2LC, 2MC, 2SC (gti-power, 9 model) | (c): khớp cả 2 và 4 cực; NCC không ghi | KHÔNG gộp |

Hệ quả: nếu Khoa chấp nhận (b) làm bằng chứng cho ECO38 / 40 / 43 (mức "hãng nói cả dòng 4 cực") thì tối đa ~17–19 model (ECO38 5, ECO40 5 có dòng tờ, ECO43 4–5, +1SN/4); ECO46-2L (duy nhất ≥ 2 NCC) KHÔNG gắn được. Con số 26 của lần soát trước bị loại ECO46 (6 model) và ECP (9 model) vì nhập nhằng cực. Điều phối cần quyết: (b) đủ làm loại 1 không (nó là câu về cả dòng, không phải tên ngắn của từng model)?

## Bước chưa làm
1. Luật trong mã: khớp ECO38 / 40 / 43 "<khung>-<dài><cuộn>" ↔ "<khung> <dài>4 <cuộn>" CHỈ khi tờ ghi "Pole number | 4" và không có tờ cực khác cùng khung / dài / cuộn đã lưu (để trong `ratingsFor`, tham số từ dữ kiện tờ; tên ECO46 / ECP luôn không gộp); test cả ca không gộp (ECO46-2L, ECP28-MC, ECO40-VL).
2. Leroy-Somer bảng nhiều model (LSA 6627, TAL 5706, IC6 / IC8): chưa điều tra nguyên nhân 4 test `makerAltFix`. Còn 90 model Leroy-Somer thiếu tờ (đo trên).
3. Đo `CAT.build` sau, liệt kê MỌI model đổi trạng thái; `verify.mjs`; test `suppliers` + `web`; fixture `regress-config`; PR nháp.
4. Nguồn hoá catalogue Mecc `Serie_ECO_EN` (câu "4-pole") nếu muốn dùng làm bằng chứng: cần URL công khai (trang tải `https://www.meccalte.com/en/download-area`, 200 không đăng nhập) và số nguồn 1017+ trong hồ sơ `mecc-alte`.

## Bước 3 (24/11/2026) — ĐÃ LÀM, PR nháp https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1145 (nhánh `wt-mecc-ten`, KHÔNG tự merge)
**Điều kiện** (i) Hai hướng dẫn sử dụng của hãng (không phải catalogue) tải công khai HTTP 200 không đăng nhập, đều có đúng câu "ECO Series alternators are self-regulated, 4-pole brushless alternators.": `https://www.meccalte.com/downloads/Serie_ECO_C_EN.pdf` (ECO 38-40, rev 7, 02/2026) = nguồn mới **mecc-alte 1017**; `https://www.meccalte.com/downloads/Serie_ECO_EN.pdf` (ECO 43-46, rev 7, 03/2026) = **1018**. Lưu ý: câu này nằm cả trong hướng dẫn ECO 43-46 dù ECO46 có bản 6 cực (dòng "(only 6 poles)" nằm ở mục 9.6.2 ECO46) ⇒ chỉ dùng cho ECO38 / 40 / 43. (ii) Trang `meccalte.com/en/download-area` (cào 24/11, 343 liên kết): tờ theo số cực chỉ có ECP3 / ECP28C / ECP32C / ECP34A "2 pole", "ECO46 6 pole", LT3N…; KHÔNG có tờ 2 / 6 cực của ECO38 / ECO40 / ECO43.
**Cặp đã gộp (12, `MECC_SAME`, một chiều danh mục → tờ)**: ECO38-1LC / 1SC / 2LC / 2MC / 2SC ↔ "ECO38 1L4 C / 1S4 C / 2L4 C / 2M4 C / 2S4 C"; ECO43-1M / 1S / 2M / 2S / VL ↔ "ECO43 1M4 A / 1S4 A / 2M4 A / 2S4 A / VL4 A" (VL: dòng tờ "ECO43 VL4 A" đã kiểm có trong n1015, lý do loại cũ "chưa kiểm dòng" đã hết); ECO43-1SN/4 ↔ "ECO43 1S4 A"; ECO46-1S/4 ↔ "ECO46 1S4 A" (danh mục hiện KHÔNG có khoá này nên chưa đổi model nào).
**KHÔNG gộp**: mọi ECP (9); ECO46 không ghi cực (2L, 1L, 1S, 1.5L, 2S, VL (Mecc Alte)); **ECO40 không chữ loại** (1S, 2L, 2S, 3L, 3S, VL — 6 model mà báo cáo Bước 2 nghiêng về gộp): phát hiện mới, ECO40 có loại B và loại C (bulletin MA0308 "ECO40 B / C"), tờ n1014 chỉ loại C, NCC không ghi loại ⇒ không biết tờ nào; ECO40 1.5L4B (loại B); ECO43-2LN (chữ N chưa rõ). **Điều phối quyết**: nếu coi ECO40 = C thì thêm 5 cặp (ECO40-1S/2L/2S/3L/3S ↔ "ECO40 1S4 C"…), ECO43 chỉ có loại A trong hướng dẫn 1018 nên không vướng.
**Đo** `CAT.build` + `ratingsFor` trước (origin/main, worktree riêng) / sau, MỌI model 239 đầu phát Mecc + Leroy-Somer: Mecc Alte thiếu tờ **34 → 23**, Leroy-Somer 90 → 90; đúng 11 model đổi (`miss true → false`, 40 dòng định mức mỗi model, ECO43-VL 35, 2 thuộc tính): ECO38-1LC, 2LC, 2MC, 2SC, 1SC, ECO43-1M, 1S, 1SN/4, 2M, 2S, VL; 228 model còn lại y nguyên (trường `miss`, số dòng định mức, số thuộc tính). Chỉ đo hai hãng này; khoá tra chỉ là 12 tên Mecc nên hãng khác không có đường đổi. `verify.mjs`: 436 bản ghi, 0 lỗi. Test `suppliers/*.test.mjs`: 1612 đạt, 0 lỗi (gồm test mới: 12 cặp, một chiều, ECP28-MC / VLC / 32-1LC, ECO46-2L / 1S, ECO40-1S / 2L / VL, ECO43-2LN, Stamford S7L1D-F41 đều 0). Fixture `regress-config` không đổi. Bẫy ghi vào `suppliers/CLAUDE.md`.
**Chưa làm**: Leroy-Somer `makerAltFix` (phiên khác); `web` test không chạy (không đụng `web/`).
