# ma-dong-co-trung PR 1: nghiệm thu (20/11/2026)

**Kết luận:** PR DRAFT https://github.com/khoanguyenminh6868/GenSet-Pro/pull/998, nhánh `ma-dong-co-trung-1`, commit `9c80eada`. Làm trên origin/main `cf0b0448`. PR xếp CUỐI hàng chờ `web/catalog.js`: trước khi merge phải gộp main mới vào nhánh và đo lại. Không tự merge.

## Giải thích đo cloud: 2.173 dòng mất, 57 dòng hạng 1–5, 548 dòng đổi điểm (21/11/2026)

**Kết luận:** #998 không làm mất dòng do trùng khoá. Không sửa code, head vẫn `cc38bda8`. Việc gộp khoá làm luật số liệu chạy được trên dòng trước đây không có số. Phần lớn là loại đúng, nhưng **ít nhất 78 dòng / 7 lượt bị loại oan** vì 2 lỗi đọc ngưỡng HSMT có sẵn ở `config-bot.mjs` (không nằm trong `catalog.js`). Cần điều phối chọn sửa trước hay sau khi merge.

Tái hiện trên máy (`mat-dump.mjs` gốc `97cce88c` ↔ nhánh, `mat-so.mjs`): đúng 2.173 dòng, 278 lượt như cloud.

### 2.173 dòng mất khỏi bảng ứng viên
- **Nguyên nhân chung:** cả 2.173 dòng đều nằm trong `dropped` của nhánh, có luật; 0 dòng mất do dedupe. Trước PR, số của khoá bẩn (`3TNV88-GGE/12.2KW`) không gắn vào khoá sạch nên dòng khoá sạch không có số để loại.
- **Theo luật (số dòng):** disp 913, cyl 545, maxDisp 365, cyl+disp 98, cyl+maxDisp 64, cyl+disp+layout 62, cyl+layout 58, layout 43, disp+layout 17, cyl+layout+maxDisp 8.
- **Theo hãng:** Perkins 486, chưa rõ hãng 444, FAWDE 354, Yanmar 287, Yangdong 259, Weichai 180, Kubota 73, FAWDE / Xichai 52, Cummins 21, Volvo Penta 10, Isuzu 4, Doosan 2, Mitsubishi 1.
- **Danh sách:** `dau-vao/ma-dong-co-trung/mat-dong.tsv` (từng dòng), `mat-nhom.tsv` (theo động cơ + luật), `mat-soat.tsv` (số nguồn từng nhóm).

| Nhóm | Dòng | Kết luận | Bằng chứng |
|---|---|---|---|
| Ngưỡng của cỡ máy khác, gói nhiều cỡ | ≥ 76 (6 lượt) | **OAN** | IB2400114476#1 (45 kVA) lấy "≤ 1,826 l" của máy 12 kVA: 29 dòng. IB2500385135#0 (10,5 kVA) lấy ngưỡng máy 20 kVA: 18. IB2300260615#1: 8. IB2300162912#0: 7. IB2400487460#1: 7. IB2300108940#1 (20 kVA) lấy "2 xi lanh" của máy 11 kVA: 7 |
| "Không ít hơn 1 xilanh" đọc thành đúng bằng 1 | 2 (1 lượt) | **OAN** | IB2300305914#0: loại 3TNV82A-GGE và YD380D (3 xi lanh) |
| Gói nhiều cỡ chưa kết luận được | 20 | Chưa rõ | Dò chữ không xác định được mục của ngưỡng (có IB2500291421#1) |
| Còn lại | ~2.075 | Đúng theo số nguồn và luật hiện hành | Ví dụ dưới |

Ví dụ loại đúng:
- 3TNV88-GGE (241 dòng): jet-power n130 ghi 3 xi lanh, 1,642 L, 88×90 (tính ra 1,642 L); HSMT đòi ≥ 1,7 đến ≥ 2,54.
- 4DW81-23D (147 dòng, trần ≤ 1,826 / 1,85): 2,27 L, 85×100, 4 xi lanh (depco, jet-power, waeta). victory-generator ghi 1,532 và 1,809 kèm đường kính khác, là số lệch.
- CA6DF2-17D: depco "IN-LINE", jet-power "L6", HSMT đòi chữ V. waeta ghi "4 L" là số lệch.

Giới hạn của phần "đúng":
- 34 nhóm có nguồn lẻ ghi số đạt: đã đọc, số đông hoặc đường kính × hành trình đều nghiêng về số bị loại.
- Nhiều nhóm chỉ có MỘT NCC ghi số (660 lượt-luật, như Kubota, 4DX…): chưa đối chiếu tờ hãng.
- Vài ca do luật "giữ chặt" Khoa đã chốt 19/11: 1104D-E44TAG2 (4,399 ↔ ≥ 4,4), 4006-23TAG3A (22,921 ↔ ≥ 23).
- Dò ngưỡng lệch bằng chữ có bỏ sót (IB2300108940#1 phải soát tay mới ra), nên 76 là số tối thiểu; 32 lượt nhiều cỡ (287 dòng) cần đo lại khi sửa.

### 57 dòng hạng 1–5 ra khỏi top 30
- **38 dòng bị luật loại:** 32 đúng, **6 oan** (IB2400114476#1 ×2, IB2500385135#0 ×2, IB2300108940#1, IB2300305914#0).
- **18 dòng còn trong bảng, bị trần đẩy ra (đúng thiết kế):** 16 do trần 3 dòng mỗi động cơ (trước đây mỗi biến thể chữ chiếm một suất riêng), 2 do trần 4 dòng mỗi NCC (`ngoai-top.txt`).
- **1 dòng vẫn ở top khi chạy trên máy:** tecgen YD380D, IB2200086314#0, top #1 (bidhist cục bộ có thể khác bản cloud).

### 548 dòng đổi điểm
`diem-so.mjs`: 548 / 549 cặp khớp công thức điểm; cặp còn lại (−12, tecgen IB2200086314#0) là do cách ghép khi một dòng có nhiều bản, chưa soát riêng.
- +8 / +16 / +24 / +32 / +48 / +64: khoá gộp có thêm loại thông số (8 điểm mỗi loại, tối đa 8 loại).
- +124 (141 dòng): khoá bẩn không có hãng và thông số, nay +60 hãng + 64.
- +424 (9 dòng): như trên, cộng 300 vì đúng hãng HSMT nêu.

### Cần quyết
1. Sửa 2 lỗi đọc ngưỡng (`minsForSize` / `sizeBlocks`, và `cylExact` với "không ít hơn") bằng PR riêng TRƯỚC khi merge #998 (đề xuất), hay merge #998 rồi sửa? Lỗi có sẵn ở main, nhưng #998 làm nó loại thêm dòng.

## Đo lại sau khi gộp main `97cce88c` (head `cc38bda8`, 20/11/2026)
- Merge chỉ xung đột ở `web/CLAUDE.md`: đã giữ phần của cả hai bên.
- `5-doi-khoa.mjs` (log `doi-khoa-pr1b.log`; danh sách ở `doi-khoa-pr1b.tsv` / `khoa-dich-pr1b.tsv`):
  - Khoá động cơ: 6562 → 6247.
  - 447 dòng đổi khoá; 0 dòng mất, 0 dòng thêm.
  - 263 khoá đích, 0 lệch số dòng.
  - 2 khoá đổi hãng, như lần đo trước.
- spec-diff `git:97cce88c --gate`: đảo vai 0 → 0, exit 0.
- `quality --check`: đạt.
- Test: 1337 + 148 + 11 pass (log `test-pr1b.log`).

## Tệp đã đổi
- `web/catalog.js`:
  - thêm `engineCode()` + `ENGINE_TRIM`, `MAKE_WORD`, `PLANT_SLASH`, `engineMakeWord`;
  - `tidyModel` gọi `engineCode` cho ô động cơ;
  - đường bảng nhãn cũng gọi `engineCode`.
- `suppliers/ma-dong-co-trung.test.mjs` (mới): 6 test, ô lấy từ dữ liệu thật.
- `web/CLAUDE.md`: thêm bẫy "Mã động cơ trùng khoá".

## Lệnh và đầu ra thật
Script đo nằm trong `dau-vao/ma-dong-co-trung/`. Gốc là worktree `cf0b0448`, nhánh là `wt-ma-dong-co-trung-1`; hai bên dùng chung dữ liệu `suppliers/cn`.
- `1-quet.mjs repo <wt> -goc` và `-pr1` → `quet-repo-goc.*` / `quet-repo-pr1.*`; `2-lop.mjs` → `lop-goc.txt` / `lop-pr1.txt`.
  - Khoá động cơ: 6889 → 6571.
  - Các lớp đã sửa: C1, C2, D, E, F1 → 0.
  - Các lớp không sửa:
    - AB gạch: 81 → 80, cộng 1 khoá lớp "cách".
    - AB ngoặc: 75 → 73.
    - G: 16 khoá (193 → 194 dòng).
    - X: 166 khoá (2096 → 2098 dòng).
    - F2: 28.
    - Các lớp này chỉ nhích vì vài khoá cùng lớp được gộp lại, không có ca mới.
- `5-doi-khoa.mjs <gốc> <nhánh> pr1`:
  - "dòng đổi khoá: 450; dòng chỉ có ở gốc: 0, chỉ ở nhánh: 0".
  - Khoá mất: 349. Khoá mới: 31. Cả 31 đều là mã đã gọn của khoá bẩn chưa có khoá sạch, ví dụ JET444D, WD129TAD23-10, CA6DL1-24.
  - Khoá đích: 265; số dòng không khớp: 0; khoá đích đổi hãng: 2.
  - 2 khoá đổi hãng là 4DX22-50D và 4DX23-65D: hãng đổi từ "FAWDE / Xichai" thành "FAWDE". Đây là cải thiện, vì FAWDE và Xichai là cùng hãng theo `SAME_MAKER`.
  - Danh sách MỌI dòng đổi khoá: `dau-vao/ma-dong-co-trung/doi-khoa-pr1.tsv`. Theo khoá đích: `khoa-dich-pr1.tsv`. Tôi đã soát tay mọi dạng đổi trước → sau; tất cả đều đúng.
- `node suppliers/spec-diff.mjs git:cf0b0448 . --gate`: "đảo vai: 0 → 0 | tự kiểm: cần soát tay 0", "spec-diff exit 0". Log ở `spec-diff-pr1.{log,txt,md}`.
- `node suppliers/quality.mjs --check`: "không chỉ số nào xấu đi quá ngưỡng", exit 0. Log ở `quality-pr1.log`.
- Test theo đúng các lệnh CI dùng (log ở `test-pr1-ci.log`):
  - `node --test suppliers/*.test.mjs`: 1228/1228 pass.
  - `web/test/spec-norm.test.mjs`: 148/148.
  - `static.test.mjs`: 11/11.
  - Lượt `node --test suppliers/ web/test/` (`test-pr1.log`) báo lỗi ở `*.spec.mjs` và fixtures. Đó là tệp Playwright mà node --test không chạy được, không phải lỗi do PR. Lượt đó còn ghi đè `web/test/fixtures/seed.json`; tệp đã được trả lại và không có trong commit.
- `cand.mjs` cho IB2600603983 (`cand-goc.txt` so với `cand-pr1.txt`): cùng 30 dòng, chỉ đổi hạng thô. Chỗ thừa ở đây (#18 kaihua "6M33G8D3/5 (6M33G825/5)") thuộc lớp A, để PR 2 xử lý.

## 3 mẫu đối chiếu nguồn
1. kaihua-genset n122, https://www.hichaipower.com/hichai-perkins-diesel-generator-set-product/: "| HC-825GF | 825 | 750 | India 4006-23TAG2A | S5L1D-H1 |". Model động cơ thành `4006-23TAG2A`; dòng nguồn vẫn giữ chữ "India".
2. jet-power n124, https://www.jetgenset.com/50hz-powered-by-yangdong-water-cooled-diesel-generator-supply.html: "| YD-12 | 12 | 9.6 | 11 | 8.8 | YD385D/11KW |". Ô động cơ ghi kèm công suất tổ máy; model động cơ thành `YD385D`.
3. nenjo-generator n119, https://en.nenjo.cn/products_details/30.html: "| HJ600P | 帕金斯 PERKINS | 4006-23TAG2A Switchable |". Bản Switchable gộp vào `4006-23TAG2A` theo quyết định của Khoa.

## Rủi ro và cách quay lui
- Mã thật có số hoặc chữ đứng đầu (Jichai "6190 TL-2", mahindra "3285 GM-C2") có thể bị cắt nhầm. Luật bỏ số đứng đầu chỉ chạy khi phần còn lại bắt đầu bằng chữ số và có "-" kèm chữ, và đã có test giữ cả hai mã này.
- Luật bỏ tên hãng chỉ chạy khi chữ đó là hãng có trong danh sách `ENGINE_BRANDS` / `MAKE_WORD`.
- Dòng đổi khoá sẽ đổi chỗ trong trần mỗi động cơ / hãng của `candidates`. Top 30 ứng viên toàn bộ gói CHƯA đo.
- Quay lui: revert commit `9c80eada`.

## Chưa kiểm / để ngoài
- Top 30 ứng viên trên toàn bộ gói (điều phối giao riêng việc đo trên cloud).
- Số trơ trong ngoặc, chưa có nguồn nói nghĩa nên không gộp: elitech "4BTA3.9-G13(40)" / "(50)", bobig "6BT5.9-G2(115)".
- Đầu phát dính công suất (ví dụ jet-power "JET164B/8.8KW"): PR này chỉ sửa động cơ, đầu phát chưa đụng tới.
- madeAt đọc India / UK: Khoa quyết làm sau.
- PR 2 (tách ô hai mã, lớp A/B) và PR 3 (`keyOf` bỏ dấu ngoặc, lớp G): chỉ bắt đầu khi điều phối báo PR trước đã merge.

## Cần ghi nhớ
- Không chạy `node --test web/test/`: lệnh này chạy cả spec Playwright và ghi đè `web/test/fixtures/seed.json`. Hãy dùng đúng các lệnh của CI.
- Khi gộp main mới vào nhánh: chạy lại `5-doi-khoa.mjs` và spec-diff với `git:<sha main mới>`, rồi ghi sha đó vào tệp này.
