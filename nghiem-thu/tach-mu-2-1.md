# Nghiệm thu tach-mu-2 (PR #1026): giải thích nhóm `^` theo tệp cloud

**Kết luận: tách `^` như #1026 làm 66 lượt-dòng lọt thêm mà số của khoá kia cho thấy không đạt, và đẩy 28 lượt-dòng 8M33D1012E311 ra (21 đúng hướng, 7 chưa đủ căn cứ). Chưa nên merge #1026 nguyên trạng; đề xuất cho luật loại mượn số giữa `X` và `X^` (mục 5), chờ điều phối trả lời, chưa sửa code.**

Số gốc: `dau-vao/doc-ma-2/top30-cloud/` (gốc 95ecba26, nhánh ab5c5e07, 1.093 lượt). Tệp cloud chỉ có số bị loại, không có lý do, nên luật lấy từ lượt chạy lại trên bidhist máy: **94/94 lượt-dòng khớp cloud** về có / không có mặt. Chi tiết từng lượt: `dau-vao/doc-ma-2/top30-cloud/giai-mu.tsv` (chỉ số thông báo, khoá, luật, ngưỡng số; không có chữ HSMT). Tệp `giai-1017.tsv` cũ sai nên đã xoá.

"Có mặt" = trong danh sách ứng viên `all`, không phải top 30. Trong top 30 chỉ đổi 6 lượt-dòng thuộc nhóm: vào 4 (cgm-italia 6M31G1000/5 × 3, baifa 16M55G6D3/5^ × 1), rời 2 (cgm-italia 6M31G1000/5, jet-power WP6D180E201).

## (1) Dòng mang `^` có mặt thêm: 32 lượt-dòng

Các khoá này (trừ 6M31 và hai khoá có số riêng) không có số xi lanh / dung tích riêng. Trước khi tách, chúng bị loại theo số của khoá trơn; sau khi tách không còn số nên không luật nào chạm tới.

| Dòng | Lượt | Luật loại trước đó | Số khoá trơn | HSMT đòi |
|---|--:|---|---|---|
| voltgent, mecca 8M33G900/6^ | 10 + 1 | cyl, disp, maxDisp, freq | 8 xi lanh, 26,14 L | 6 / 12 / 16 xi lanh; ≥ 21,9–31,8 L; ≤ 22 L |
| baifa 20M33G4D3/5^ | 6 | cyl | 20 xi lanh | đúng 16 |
| baifa 12M55G6D3/5^ | 5 | cyl | 12 xi lanh | đúng 16 |
| baifa 8M33G6D3/5^ | 5 | cyl | 8 xi lanh | đúng 12 |
| mecca 16M33D1980E310^ | 2 | disp, maxDisp | 52,3 L | ≥ 61,123 L; ≤ 20 L |
| landtop 16M33G2250/5^ | 2 | disp, maxDisp | 52,3 L | ≥ 61,123 L; ≤ 20 L |
| baifa 16M55G6D3/5^ | 1 (vào top 30) | cyl | 16 xi lanh | đúng 20 |

Nếu `X^` là cùng động cơ với `X` thì **31/32 vi phạm thật theo số** (lọt oan). Lượt còn lại (8M33G900/6^) chỉ bị loại vì tần số: HSMT 50 Hz, các dòng ghi tần số của mã đều 60 Hz. Nguồn không chú thích `^` nên không khẳng định được `X^` là `X`.

## (2) Dòng khoá trơn

**8M33D1012E311 rời 28 lượt-dòng** (kaihua 8, walter 8, wiseke 3, waeta 2, uleengen 5, jet 1, kaichen 1). Trước khi tách, mã có hai bộ số: 8 xi lanh / 26,14 L của các NCC và 12V / 31,8 L của dòng aosif `^`, không có số đông nên luật không chạy. Sau khi tách, khoá trơn còn 8 / 26,14.
- 21 lượt bị loại theo xi lanh / dung tích: **đúng hướng**. Đường kính × hành trình wiseke ghi 150×185 × 8 xi lanh = 26,15 L, khớp 26,14; không khớp 31,8.
- 7 lượt bị loại CHỈ vì tần số (HSMT 50 Hz): dòng 50 Hz duy nhất của mã là dòng aosif `^`, nay tách đi nên mã chỉ còn 60 Hz. Số xi lanh / dung tích của các lượt này đạt. **Chưa đủ căn cứ để loại**: đúng hay oan phụ thuộc vào việc `^` có cùng máy không.

**6M31G1000/5 và 6M31G800/6: tin trước ghi "17→12" là ngược; tệp cloud là VÀO thêm**: agg-fuzhou 17→29 mỗi dòng (+12), cgm-italia 8→13 (+5), tổng 29 lượt-dòng, 0 lượt rời. Nguyên nhân: hãng (weichai-power, weichai-heavy-machinery) chỉ ghi mã có `^` ("6M31G1000/5^ | 6 | 149×177"), nên sau khi tách khoá trơn **không còn thông số nào**. Trước đó các dòng này bị loại theo 6 xi lanh và 149×177 × 6 = 18,52 L, trong khi HSMT đòi 8 / 12 / 16 xi lanh hoặc ≥ 21,9 L. **Hướng sai: lọt oan nếu là cùng máy.** Có 3 lượt của cgm-italia lọt vào top 30.

**8M33G900/6 khoá trơn vào thêm 5 lượt-dòng** (koten, landtop, weichai-heavy-machinery, weichai-power, agg-fuzhou; HSMT 50 Hz, luật `freq`). Luật cần ≥ 2 dòng ghi tần số; tách làm khoá trơn còn 1 dòng 60 Hz nên luật tắt. Đuôi "/6" là bản 60 Hz: **lọt oan**.

## (3) Đổi điểm −32 ở 6M31G1000/5 và 6M31G800/6

Mất 4 loại thông số của động cơ, mỗi loại 8 điểm: `bore`, `cyl`, `emission`, `gov`. Toàn bộ đến từ dòng `^` của hãng.

## (5) Đánh giá và đề xuất (chưa sửa code)

Tách `^` gây hai việc: khoá trơn mất dữ liệu (6M31, tần số 8M33G900/6) và khoá `^` mất kiểm trần / tối thiểu. Có một căn cứ cho thấy hai dạng ghi có thể là một máy, nhưng chưa phải bằng chứng: Baudouin ghi 6M31G800/6 trơn còn Weichai ghi cùng mã có `^`; và `^` cũng đứng ở tên tổ máy ("WPG1000*7^"), giống dấu chú thích của dòng hơn là mã động cơ khác.

Đề xuất hẹp, chỉ trong `candidates`, catalog vẫn tách:
1. Luật `cyl` / `disp` / `maxDisp`: khoá KHÔNG có số loại đó thì mượn số của khoá kia (`X` ↔ `X^`). Khoá có số riêng giữ số riêng, nên 8M33D1012E311 (8 / 26,14) không bị 12V / 31,8 của aosif kéo lại.
2. Luật `freq`: tính trên dòng của cả hai khoá.

Dự kiến theo logic, **chưa chạy**: 66 lượt-dòng vào thêm bị loại lại; 21 lượt 8M33D1012E311 vẫn rời; 7 lượt chỉ vì tần số quay lại như main. Điểm −32 của 6M31 vẫn còn trừ khi mượn cả loại thông số; đề xuất không mượn điểm.

Cần quyết: cách mượn này coi `X^` là `X` **chỉ để loại**, có hợp với "tách ra" của Khoa không. Nếu không hợp thì #1026 giữ nguyên sẽ có 66 lượt-dòng lọt như trên.

## Cập nhật: ĐO THỬ cách 2 (Khoa 21/11/2026 "thử cách 2 xem như thế nào rồi tính", chưa duyệt merge)

**Kết quả trên 162 lượt có dòng nhóm `^`, so main: 0 dòng lọt thêm, 21 lượt-dòng 8M33D1012E311 rời (đúng hướng), 7 lượt chỉ vì tần số trở lại như main; top 30 đổi 1 lượt.** Đầu nhánh `15a6b6186c2e1944abd0171c5023233bf415739f`, đã gộp main `6ed2aca5`. Số 162 lượt đo trước khi gộp #1020 (main `7bca1582`, bidhist máy); top 30 toàn bộ chờ đo cloud.

- Code: `twinFacts` trong `suppliers/config-bot.mjs`, không đụng `rowOrder` / `makeGroup`. Test `suppliers/tach-mu-muon-so.test.mjs` (4 ca đọc hồ sơ thật). `suppliers/*.test.mjs` 1379/1379, `quality --check` đạt.
- **Điểm không mượn** (đề xuất): mượn số là coi `X^` là `X` chỉ để loại; cộng điểm "có thông số" cho số của khoá khác là dùng giả định đó để đẩy dòng lên. Hệ quả đo được: 147 lượt-dòng thấp điểm hơn main (−8 tới −68, gồm 6M31G1000/5 × 25 và 6M31G800/6 × 17 ở −32). Top 30 đổi đúng 1 lượt: IB2200021335#0, jet-power WP6D180E201^ (−48) rời, bobig-power vào.
- **Hiển thị:** số mượn KHÔNG hiện ở màn nào; bản ghi và thông số của dòng `^` giữ nguyên. Chỉ khi luật dùng số mượn thì `why` của dòng có câu "có dùng số của mã X (nguồn không chú thích ^)".

## Cập nhật: Khoa 21/11/2026 chọn M (merge cách 2), bản gộp main

Đầu nhánh `c8a85b6b9e20f6831e1d64c7b62a84f036c5c0fd`, merge-base main `50a13de4`. Chỉ gộp main và đổi chữ "ĐO THỬ" thành luật đã duyệt, không đổi hành vi.

- spec-diff main ↔ nhánh: 61.839 → 61.839 bản ghi, **26 đổi, 0 mất, 0 thêm**, 16 bảng của 11 NCC, đảo vai 0. Bản đầy đủ **giống từng dòng** spec-diff của bản đã đo cloud (`6ed2aca5` ↔ `15a6b618`).
- `suppliers/*.test.mjs` 1417/1417, `quality --check` đạt.
- Phần main thêm so với bản đã đo (`6ed2aca5` → `50a13de4`): 642 bản ghi mới (556 đầu phát, 86 động cơ, 84 mã động cơ), 2 bản ghi bỏ. Không bản ghi nào mang `^`; không mã động cơ mới nào có dạng `X^` trong `suppliers/cn` (dò theo chữ nguyên văn), nên `twinFacts` không có cặp mới.
- Top 30 của bản gộp chưa đo lại trên cloud; bản đã đo là `15a6b618`.
