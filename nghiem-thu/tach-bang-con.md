# tach-bang-con: tách bảng con trong một khối, giữ dòng máy thiếu ô (23/11/2026)

## Trạng thái: PR 1 (#1110) và PR 2 (#1111) XONG, DRAFT, CHƯA MERGE, CHƯA đo top 30. Chi tiết PR 2 ở mục cuối
- PR 1: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1110, nhánh `fix/tach-bang-con`, SHA `0d589bda3a5fd8b61734c749d67a8894b403afcf`, base `fix/crawl-dropped-rows` (#1105).
- Worktree `C:\Projects\GenSet Pro\wt-tach-bang-con`; gốc so sánh chỉ đọc `C:\Projects\GenSet Pro\wt-tach-base` (a95b8ab5). Xoá cả hai khi xong toàn bộ.
- Cổng kiểm trên SHA trên: `verify` 0 lỗi, `quality --check` đạt (sau khi ghi lại mốc), `spec-diff --gate` đạt (đảo vai 0 → 0), `node --test suppliers/*.test.mjs` 1.587 đạt / 0 lỗi.
- CHƯA đo 1.093 lượt top 30: việc của phiên điều phối, dùng SHA trên.

## Đã làm theo 5 việc
1. Hai test đỏ: kỳ vọng cũ, mã không sai. n126: bảng 41 dòng tách thành 25 + 16, tổng 87 dòng giữ nguyên. Ca 13: thay số đếm bằng danh sách đích danh 4 bảng trùng nguyên dòng (lees n127 = n112, lees n131 = n111, longkai n103 = n101, mecca n136 = n103). Hai bảng lees n131 và longkai n103 khác tiêu đề với bản được giữ (lỗi chính tả "Specificatios"; dòng phân đoạn "NEW TYPE").
2. Kiểm chéo mọi bản ghi của 11 NCC theo nội dung (`audit.mjs`, kết quả `dau-vao\tach-bang-con\pr1\audit2\`): MẤT 0, công suất đổi 0.
   - baifa +75: 40 động cơ + 35 đầu phát, dòng trước ở ngoài mọi bảng. Đổi hãng 26 theo tiêu đề bảng con (17 thêm Baudouin, 9 bỏ Stamford).
   - taihai +106: 98 dòng đã ở bảng cũ mà không ra bản ghi, 8 dòng ngoài bảng. 85 đổi là nhãn theo tiêu đề bảng con và đổi trang. 6BTAA5.9-G2 thêm Cummins: dòng này cũng nằm trong bảng có tiêu đề "东风康明斯系列 DCEC CUMMINS SERIES".
   - hnd +2: dòng ngoài bảng. 4 dòng n101 (L99, L109, L110, L111) vẫn cố ý không lấy vì ô gộp làm lệch cột.
   - huayuan 20: Perkins → Cummins đúng, bảng con thứ hai của n102 ghi `康明斯型号`.
   - mecca +17: n144, bảng 34 dòng tách, phần có tiêu đề riêng nay ra bản ghi.
   - previa 36: chỉ đổi trang giữ dòng trùng (n108 → n128), cùng dòng, cùng tiêu đề.
   - acepow 27: 50 → 60 Hz theo tiêu đề bảng con.
   - Cả 200 bản ghi thêm có nguyên dòng trong tệp nguồn; số công suất của 196 bản ghi nằm trong dòng, 4 bản ghi không có công suất (`pr1\added-power.txt`).
3. Quyết định của Khoa: taihai TH-800GF 163, TH-1000GF 196, TH-1200GF 237 là L/h theo tiêu đề bảng con. Đã có test. So toàn bộ: đúng 3 bản ghi đổi g/kWh → L/h.
4. Chênh 447 ↔ 217: xem bảng dưới.
5. Mốc chất lượng ghi lại có chủ ý: `emission` thiếu `scale` 45,0 % → 46,4 %, do đúng 70 mục thêm của baifa (66 mục ghi "TIER 3 / STAGE 3A…" không nêu thang đo); 0 mục cũ đổi (`pr1\emission-scale.txt`).

Sửa thêm ngoài bàn giao: `tableOf(part, true)`. Phần của khối đang tách mà chỉ có dòng máy nhiều ô chữ trước đây làm cả khối không tách (baifa n106, 6 bảng con 1500 / 1800 RPM, Tier khác nhau). Đo lại 3.983 tệp: chỉ baifa đổi (30 → 35 bảng), 0 dòng máy mất.

## Bảng đếm 447 ↔ 217
Luật thử cho số 447 / 66 NCC không được lưu nên KHÔNG dựng lại được đúng số đó, và chưa thể nói đã soát đủ 447 bảng. Thay vào đó quét 3.983 tệp bằng luật lỏng (dòng chữ sau dòng máy có ô trùng tiêu đề): 391 khối, 61 NCC (`gap447.mjs`, `pr1\gap2\`). Luật hiện tại đổi 217 bảng / 41 NCC theo `measure` (`m7\`).

| Nhóm | Khối | NCC | Dòng máy | Kết luận |
|---|--:|--:|--:|---|
| Luật hiện tại tách | 203 | 40 | 10.551 | đã tách |
| Không phải bảng công suất | 55 | 4 | 518 | không cần |
| Dòng lặp dưới 3 ô | 8 | 5 | 242 | có ca đáng xem (dưới) |
| Hẹp dưới 60 % tiêu đề | 59 | 2 | 199 | gồm mảnh nhãn của thẻ một model |
| Trùng dưới 60 % ô | 46 | 24 | 449 | chưa soát từng khối |
| Đạt luật mà không tách | 20 | 6 | 390 | chủ yếu tiêu đề lặp giống hệt |

Có điều kiện khác tiêu đề đầu (Hz, RPM, pha, V, đơn vị, Tier): 14 khối / 8 NCC (`pr1\gap2\gap6.tsv`). CHƯA soát hết, đừng coi là đã sạch:
- **Đáng tách thật:** kaihua-genset n124 (36 dòng), n125 (40 dòng): dòng hai ô "| Powered by VOLVO | 440V, 1800RPM, 60Hz".
- Cần xem: aj-power n101–n104 (ghi 50 / 60 Hz, một / ba pha), huachai-deutz n114, shunfeng-changzhou n105, gtl-power n105, jichai n109.
- Có vẻ là dòng nhãn của thẻ máy: acepow n103, n124, sevenpower n106, n122.
- previa n104 giữ nguyên khối: tiêu đề lặp giống tiêu đề đầu (chỉ mất chữ "G"), không đổi cách đọc.

## Cần điều phối / Khoa xem
- 36 dòng TWIN của baifa n106 đã đúng bảng con nhưng chưa ra bản ghi động cơ (mã dạng "2*TAD1355GE"). Việc riêng, chưa sửa.
- Bảng con một dòng: kaihua-genset n102, n118; taylor-power n103, n104.
- `spec-diff` ghép theo vị trí bảng nên báo 5.415 mất / 5.615 thêm giả; 130 giá trị "cần soát tay" của nó KHÔNG được soát riêng, phần thay thế là `audit.mjs` theo nội dung.

## Kế hoạch PR 2 (30 NCC còn lại, chồng lên #1110)
1. Quyết định dòng phân đoạn hai ô (kaihua n124 / n125), soát 14 khối của `gap6.tsv`.
2. `rebuild2.mjs <gốc> <mới> <id,...> --write` cho 30 NCC (danh sách: `m7\per-supplier.tsv` trừ 11 NCC của PR 1).
3. `audit.mjs`, `added-power.mjs`, `added-why.mjs`, `emission-scale.mjs` cho 30 NCC; giải thích từng lớp đổi.
4. Đủ cổng kiểm, PR DRAFT, báo SHA.

## Tệp (`dau-vao\tach-bang-con\`)
`measure`, `rebuild2`, `audit` (thay `recdiff2`: ghép theo nội dung), `added-why`, `added-power`, `emission-scale`, `heads-of`, `why-whole`, `gap447`, `gap5`, `gap6`, `pr2-check`, `pr2-build`, `pr2-gap6`, `pr2-gensets`. Kết quả: `m7\`, `pr1\audit2\`, `pr1\gap2\`, `pr1\gates2\`, `pr2\audit\`, `pr2\check.tsv`, `pr2\build.tsv`, `pr2\gates\`.

## PR 2 (24/11/2026)
- https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1111, nhánh `fix/tach-bang-con-2`, SHA `19ab0c53b0673fda9f45e9be2a81af0fdbc74afe`, base `fix/tach-bang-con`. Worktree `C:\Projects\GenSet Pro\wt-tach-bang-con-2`.
- Cổng: `verify` 0 lỗi, `quality --check` đạt (mốc KHÔNG đổi), `spec-diff --gate` đảo vai 0 → 0, 1.592 test đạt. CHƯA đo 1.093 lượt top 30.
- Mã: `hzSection` (dòng hai ô có Hz ngay trên dòng tiêu đề mở bảng con; trên 3.983 tệp chỉ đổi kaihua n124, n125). `codeLine` trong `splitPoints` sửa LỖI CỦA #1110: dòng máy ít số trơn bị coi là tiêu đề, sinh điểm tách giả (rcg-power 5 tệp, pauway n104), dựng lại thì mất 61 bản ghi. 11 NCC của PR 1 không đổi bảng nào nên #1110 không cần sửa dữ liệu; nhưng merge #1110 một mình thì mã vẫn còn lỗi này khi cào lại rcg / pauway.
- Dữ liệu: 29 NCC. `baudouin` KHÔNG dựng lại: n116, n120–n124 đã tách tay ở #971, phần khác chỉ là dòng trống `| | |` (0 dòng máy).
- Kiểm chéo mọi bản ghi: MẤT 0; thêm 9 (kaihua 8, excel-power 1). Tần số đổi 509, mọi bản ghi có tiêu đề bảng con ghi đúng: 50 → 60 excel-power 206, keliang 57, hosem 30, gtl 29; không ghi → 60 kaihua 187. Công suất chỉ thêm (kaihua 142 số, đều có trong dòng). Thông số thêm: frs 132, kaihua 94, xingguang 35, giá trị đều có trong dòng. `gensetsOf` 1.700 → 1.700, nội dung không đổi.
- Hãng ở bản ghi: comappower 12 (Ricardo+Yanmar+Yangdong → Ricardo), rcg 34 (bỏ Volvo Penta lấy từ dòng trùng của trang khác), kaihua 22 Deutz → không hãng ở n103 (trang không ghi Deutz; n106, n123 vẫn ghi), 34 thêm Stamford theo cột.
- Danh mục toàn bộ: 0 khoá mất, thêm 12V4000G74S (MTU). Đổi hãng 3 khoá: 12M33D1320E201 Weichai → Baudouin+Weichai (bảng con "Powered by BAUDOUIN"), S7L1DH4 không hãng → Stamford, ECO462L Mecc Alte → Stamford (xem dưới).

### Cần quyết định
1. kaihua cột "Alternator Stamford" gán Stamford cho ô ghi `ECO 46-2L`, `LSA 52.3 UL16`, `LSA 53.2M9`. Khoá ECO462L vì vậy đổi Mecc Alte → Stamford. Chưa sửa. Đề xuất: không nhận hãng theo tiêu đề cột khi ô ghi mã thuộc dòng của hãng khác, làm bằng danh sách tường minh ba ô này.

### Soát 14 khối của `gap6.tsv`
- Đã sửa (2): kaihua n124, n125.
- Không cần tách (4): aj-power n101–n104, tần số / pha là CỘT của từng dòng; 257 bản ghi đều đúng tần số của dòng.
- Không ra bản ghi nào (5): acepow n103, n124; sevenpower n106, n122; shunfeng n105.
- CHƯA CHẮC, giữ nguyên (3): huachai-deutz n114 (1 bản ghi 50 Hz, trang có thêm dòng "50Hz/60Hz"); gtl-power n105 (3 bản ghi 60 Hz, dòng không tự ghi tần số); jichai n109 (2 bản ghi, hai bảng tiêu đề khác nhau trong một khối).

### Việc riêng, chưa làm
36 dòng TWIN của baifa (mã "2*TAD…").
