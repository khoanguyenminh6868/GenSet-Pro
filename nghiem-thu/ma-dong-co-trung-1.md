# ma-dong-co-trung PR 1: nghiệm thu (20/11/2026)

**Kết luận:** PR DRAFT https://github.com/khoanguyenminh6868/GenSet-Pro/pull/998, nhánh `ma-dong-co-trung-1`, commit `9c80eada`. Làm trên origin/main `cf0b0448`. PR xếp CUỐI hàng chờ `web/catalog.js`: trước khi merge phải gộp main mới vào nhánh và đo lại. Không tự merge.

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
