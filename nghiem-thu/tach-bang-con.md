# tach-bang-con: tách bảng con trong một khối, giữ dòng máy thiếu ô (phiên con, 23/11/2026)

## Trạng thái: DỞ, CẦN PHIÊN MỚI. CHƯA có PR, CHƯA đạt cổng kiểm
- Worktree `C:\Projects\GenSet Pro\wt-tach-bang-con`, nhánh `fix/tach-bang-con`, chồng lên #1105 (a95b8ab5). Commit WIP đã push (xem `git log -1`). Không merge, không mở PR từ commit này.
- Worktree gốc để so (chỉ đọc, a95b8ab5): `C:\Projects\GenSet Pro\wt-tach-base`. Xoá khi xong toàn bộ. ĐỪNG tạo worktree trong `dieu-phoi\` (sổ tự đồng bộ).
- Đã dựng lại `cn/` + `specs/` của 11 NCC (cụm PR 1, xem dưới). 30 NCC còn lại chưa đụng.
- Chưa chạy: `verify.mjs`, `quality.mjs --check`, `spec-diff --gate`, toàn bộ `node --test suppliers/*.test.mjs` (chạy bằng Bash). Chưa ghi bẫy vào `suppliers/CLAUDE.md`.

## Việc kế, theo thứ tự
1. Sửa 2 test đỏ của `crawl-dropped.test.mjs`:
   - Ca 12: `longkai-power n126`, `.slice(-2)` nay không còn là hai bảng 41 / 27 dòng vì khối đã tách thành bảng con. Soát từng bảng con của n126 rồi mới đổi kỳ vọng; tổng dòng và dòng phân đoạn phải giữ.
   - Ca 13: `cut` khác 2 (kỳ vọng "chỉ hai bảng Single phase của lees"). Liệt kê đủ các bảng không khớp nguyên văn với `cn/` (bảng con bị lọc trùng ở `cn/`: longkai 1, mecca 2, previa 1, shengfeng 2, baifa 15) rồi mới sửa số; đừng nới test cho qua.
2. Giải thích các lớp đổi CHƯA soát của 11 NCC (bảng dưới): huayuan `makes` 20, mecca +17 bản ghi, previa `title` 36, baifa +75 và specs 8, taihai +106 và specs 42, hnd +2.
3. Chạy đủ cổng, ghi bẫy, commit, PR DRAFT 1 (base `fix/crawl-dropped-rows`), báo SHA cho điều phối đo 1.093 lượt top 30.
4. PR 2: 30 NCC còn lại, cùng `rebuild2` + `recdiff2` + `explain`.
5. Soát phần chênh 447 ↔ 217 bảng (dưới).

## Luật đang dùng (`subTables`, `splitPoints`, `tailTitles` trong `suppliers/crawl-specs.mjs`)
1. Sau một dòng máy, dòng ≥ 3 ô, không phải dòng số, ≥ 60 % ô trùng ô tiêu đề bảng con hiện tại, số ô ≥ 60 % dòng tiêu đề rộng nhất → bảng con mới, kèm các dòng tiêu đề ngay trên nó (không chứa số trơn).
2. Dòng máy thiếu tối đa 2 ô so với dòng số rộng nhất được giữ, KHÔNG điền ô.
3. Tách mà có dòng của bảng cũ không còn ở bảng con nào, hoặc một phần không thành bảng → giữ nguyên khối.
4. Tiêu đề cuối khối chưa có dòng: chuyển cho khối sau. Khối mở bằng dòng máy và có tiêu đề lặp: phần đầu nhận tiêu đề khối trước.
5. Dòng phân đoạn phủ cả khối: mọi bảng con giữ nó.
6. Dòng ghi dải công suất ("P≥560KW NOMINAL POWER") không vào tiêu đề bảng con sau: nếu để, `titledPowers` đọc "KW" của nó thay cho "KVA | KVA" của cột (đã thấy 16 bản ghi baifa đổi kVA → kW, đã hết).

## Số đo
`tablesOf` cũ ↔ mới, 3.983 tệp nguồn: 41 NCC, 208 tệp, 217 bảng cũ đổi, bảng 4.848 → 5.135, dòng máy mất 0, 4 bảng con một dòng.

Bản ghi `fromSupplier` của 11 NCC (khoá KHÔNG gồm số trang vì dòng trùng giữa các trang được giữ ở trang đầu), công suất đổi 0 ở cả 11:

| NCC | trước → sau | thêm | mất | đổi | trường đổi | đã giải thích |
|---|---|--:|--:|--:|---|---|
| baifa-power | 424 → 499 | 75 | 0 | 34 | makes 26, specs 8 | makes: 17 thêm Baudouin, 9 bỏ Stamford (dòng nay dưới "VARIOUS"); còn +75 và specs chưa soát |
| taihai-taizhou | 311 → 417 | 106 | 0 | 85 | title 55, specs 42, makes 1 | một phần (xem đáng ngờ) |
| hnd-henan | 10 → 12 | 2 | 0 | 0 | | chưa soát |
| acepow-fuan | 918 → 918 | 0 | 0 | 27 | freq 27 | 50 → 60 Hz, dòng nay dưới tiêu đề 60 Hz |
| huayuan-weifang | 144 → 144 | 0 | 0 | 20 | makes 20 | chưa soát |
| mecca-power | 1.676 → 1.693 | 17 | 0 | 0 | | chưa soát |
| previa-ningde | 972 → 972 | 0 | 0 | 36 | title 36 | chưa soát (36 bản ghi đổi trang) |
| jet, lees, longkai, shengfeng | không đổi | 0 | 0 | 0 | | |

84 dòng: cứu 80 (baifa 70 / 70, taihai 8 / 8, hnd 2 / 6). hnd còn 4 dòng cố ý không lấy (n101 L99, L109, L110, L111): bảng động cơ có ô gộp, dòng thiếu ô "功率kW" nên số lệch một cột.

## Đáng ngờ, cần điều phối / Khoa quyết
- taihai 3 bản ghi đổi đơn vị tiêu hao g/kWh → L/h theo đúng tiêu đề bảng con của trang: TH-1000GF 196, TH-1200GF 237, TH-800GF 163 (`dau-vao\tach-bang-con\pr1\fuel-unit.tsv`). Số cỡ này giống g/kWh, nên có thể chính trang ghi nhầm "(L/h)". Chưa sửa, chưa quyết. Script chỉ so bản ghi đầu của mỗi khoá nên có thể còn ca khác.
- Bảng con một dòng: kaihua-genset n102, n118; taylor-power n103, n104.
- 447 ↔ 217: phiên trước đếm 447 bảng / 66 NCC bằng luật thử không lưu lại. Luật này đổi 217 bảng / 41 NCC. **Chưa chứng minh phần chênh là không cần tách**, nên chưa thể nói đã kiểm chéo đủ 447 bảng.

## Kế hoạch chia PR (đã đổi)
- PR 1: mã + test + bẫy + 11 NCC: baifa, taihai, hnd, acepow và 7 NCC mà test của #1105 ràng với mã (huayuan, jet, lees, longkai, mecca, previa, shengfeng).
- PR 2: 30 NCC còn lại, chồng lên PR 1.

## Tệp (`dau-vao\tach-bang-con\`)
`measure` (cũ ↔ mới theo NCC), `classify-added`, `rest84`, `shape`, `tabs`, `where`, `rebuild2` (thay đúng bảng đổi; `specs/` theo nguyên đầu ra `tablesOf`), `recdiff2` (mọi bản ghi, theo trường), `explain` (gom kiểu đổi), `lost-why`, `fuel-unit`. Kết quả mới nhất: `m6\`, `pr1\rd\`, `pr1\explain.txt`.
