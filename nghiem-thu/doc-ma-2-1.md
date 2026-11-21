Kết luận: sửa 2 / 6 mục. spec-diff 61.041 → 61.229 bản ghi: +188 (lỗi 2), 26 đổi model (lỗi 5), 0 mất, đảo vai 0 → 0; lỗi 1 và 4 đã hết trên main; lỗi 3 và 6 KHÔNG sửa (cần quyết); test 1496/1496.

**Cập nhật 21/11 (điều phối đồng ý tách):** #1017 nay CHỈ còn lỗi 2, đầu nhánh **73b58c5d** (đã revert ab597617, gộp main a14b233e). spec-diff so main 04709819: 61.041 → 61.229, +188 (bdadl 94, pengpai 94), 0 đổi, 0 mất, đảo vai 0 → 0; test 1518/1518; `quality --check` đạt. Main a14b233e chỉ thêm `suppliers/cn/leroy-somer-fuzhou.json` so với 04709819 (không đổi mã đọc); spec-diff chưa chạy lại trên máy sau lần gộp đó, CI `spec-diff` của PR sẽ chạy. Tách `^` (lỗi 5) chuyển sang PR `tach-mu-2`, mọi số về lỗi 5 bên dưới là của bản trước.

# doc-ma-2-1: đọc mã động cơ (S2, 21/11/2026)

PR DRAFT: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1017 — nhánh `doc-ma-2`, đầu nhánh **ab5c5e07**, merge-base **95ecba26**. KHÔNG tự merge, không đo top 30, không đụng `genbid-hsmt\`, `ROW_EXCEPTIONS`, `config-bot.mjs`.
Script / tệp soát: `genbid-work\dieu-phoi\dau-vao\doc-ma-2\`.

| commit | nội dung | tách được |
|---|---|---|
| bdabc213 | lỗi 2: "(国三)" / "(欧三)" | có; bỏ commit này thì trả cả mốc `basis` ở ab5c5e07 |
| ab597617 | lỗi 5: tách `^` | có |
| ab5c5e07 | `quality-baseline.json` (weight.basis 83,5 → 83,6) + bẫy `web/CLAUDE.md` | đi theo lỗi 2 |

## Bảng theo lỗi (spec-diff so 95ecba26, `sd-cuoi.txt`, `sd-cuoi.md`; lượt riêng lỗi 2: `sd-2.*`)
| lỗi | kết quả | thêm | đổi | mất | đảo vai |
|---|---|--:|--:|--:|--:|
| 1 zhengchi "－" | đã xong ở #954 (`DASH_FIX`) | 0 | 0 | 0 | 0 |
| 2 "(欧三)" / "(国三)" | **sửa** | 188 | 0 | 0 | 0 |
| 3 sanq khoá ghép | **không sửa**, cần quyết | 0 | 0 | 0 | 0 |
| 4 eastern-lion EL / RUIFEN6120 | đã xong (`OWN_ALT`, catalog-el) | 0 | 0 | 0 | 0 |
| 5 tách `^` | **sửa** | 0 | 26 | 0 | 0 |
| 6 tecnogen KL45TSX (điều phối thêm) | **không sửa**, cần quyết | 0 | 0 | 0 | 0 |

## Regex để tách khi so top 30
- Lỗi 2 (dòng thêm, khoá dòng): NCC `^(bdadl-shanghai|pengpai-yangzhou)$` và chữ dòng khớp `\(\s*[国欧][一二三四五六]\s*\)`. 94 model khác nhau, mỗi NCC 94 dòng. Đổi số đông của các động cơ này ở NCC khác là hệ quả của lỗi 2.
- Lỗi 5 (động cơ, cả mã trơn lẫn mã `^`): `^(12M55G3000/5|12M55G6D3/5|16M33D1980E310|16M33G2250/5|16M33G8D3/5|16M55G4000/5|16M55G6D3/5|20M33G2750/5|20M33G4D3/5|6M11G176/6|6M31G1000/5|6M31G800/6|8M33D1012E311|8M33D975E310|8M33G6D3/5|8M33G900/6|WP6D180E201)\^?$`
- Đầu phát: không nhóm nào bị ảnh hưởng.

## Lỗi 1: đã xong, không đổi mã
"11 dòng" là số cũ. Sổ điều phối (20/11 02:47Z) đã sửa: 4 dòng có "－" (n112 / 113 / 114 / 116), 7 bản ghi còn lại không do "－". Đếm lại `suppliers/cn/zhengchi-power.json` và `sources/zhengchi-power`: đúng 4 ô. spec-diff ghi note "ô mã viết dấu － toàn chiều rộng, đọc như '-'": 4 → 4. "－" ở NCC khác (aosif, jiangchai, walter, westinpower) vẫn không mở rộng, theo quyết định cũ.

## Lỗi 2: rộng hơn brief nêu
Brief nêu TAD1351GE; thực tế MỌI dòng "(国三)" / "(欧三)" của hai NCC đều không thành bản ghi: 94 + 94 dòng, 48 bảng. Sửa: thêm đúng mẫu `\(\s*[国欧][一二三四五六]\s*\)` cuối ô vào phần bỏ ghi chú. Ngoặc khác giữ nguyên (`faraday` "1500转/分", `hengke` "轻柴油", sanq "(1345GE)").

Soát MỌI bản ghi cạnh dòng nguồn: `soat-2.mjs` → `soat-2.tsv` (188 dòng):
- Mã có trong dòng nguồn: 188 / 188. Có công suất: 188 / 188.
- Xi lanh, dung tích so với NCC ngoài bdadl / pengpai: **0** dòng khác mọi NCC.
- 10 bản ghi (5 model × 2 NCC: TAD550E, YC6A245L-D30, YC6A275L-D30, YC6K500L-D31, YC6K520L-D31) không có NCC khác để so: **chưa kiểm được**.
- 16 bản ghi pengpai không có hãng (ô "潍柴博杜安" ở mã M33 / M55): thiếu, không sai.
- TAD1351GE ở bdadl n118 và pengpai n117 ghi 9,36 L: `dropspec` có sẵn đã bỏ (note "ngoại lệ theo dòng" 68 → 70), bản ghi không mang số sai.

## Lỗi 5: tách `^`
Bỏ `^` khỏi `keyOf` và `MARK_TAIL` (`web/catalog.js`). Soát `soat-5.mjs` → `soat-5.tsv`: 26 bản ghi, 17 khoá, 11 NCC (baudouin 7, baifa 5, mecca 3, chuangyuan 2, weichai-heavy 2, weichai-power 2, aosif, jet, landtop, voltgent, waeta); mã có trong dòng nguồn 26 / 26; cả 17 khoá đều còn khoá trơn riêng. Chính trang hãng baudouin.com ghi `^` (7 dòng) nhưng trang n121 không có chú thích dấu này.

**Rủi ro chính:** 14 / 17 khoá `^` không có số dung tích sau khi tách (chỉ 8M33D1012E311^ và WP6D180E201^ có; 6M31G1000/5^ và 6M31G800/6^ chỉ có xi lanh), nên có thể lọt luật trần dung tích, đúng kiểu lỗi của sanq. Catalog-b từng đo các dòng baifa, mecca, landtop bị loại đúng nhờ số của khoá trơn; tách ra thì mất. Đo top 30 cần xem nhóm này trước.

## Lỗi 3: không sửa, cần quyết
30 bản ghi sanq n111 + n117 (15 mã × 2 bảng), ô dạng `TAD1650GE(1345GE)`. Trang nguồn không nói mã trong ngoặc là gì (đã đọc cả chú thích "Remarks").
So số NCC khác ghi cho hai mã (`sanq-cap.txt`): 13 / 15 cặp cùng dung tích theo số đông; **2 cặp khác**: TAD750GE(532GE) 7,15 ↔ 4,76 L và TAD1650GE(1345GE) 16,12 ↔ 12,78 L. Vậy không thể coi hai mã là một, cũng không biết tổ máy lắp mã nào.
- **Đề xuất A:** coi như "một ô ghi hai mã" (tiền lệ `6BT5.9-G1(G2)`), dòng không cho động cơ, ghi note. Hết lọt trần ở IB2400236068#0; mất 30 dòng ứng viên của sanq. Tiền lệ đó bỏ cả dòng, nên mất luôn 30 bản ghi đầu phát trừ khi viết thêm nhánh giữ đầu phát.
- B: lấy mã ngoài ngoặc: là đoán, em không đề xuất.
- C: hỏi sanq / để nguyên.

## Lỗi 6: không sửa, tiền đề không đúng
- `sua-so-le-1.md` mục 4 ghi KL33TSX, KL71TSX vẫn có cyl: **không đúng**. Chạy `kl45b.mjs` bằng mã `687921d7^` và mã hiện tại: bảng n2008 có 10 dòng, KHÔNG dòng nào đọc cột Cylinder, trừ KL45TSX ở mã cũ.
- Nguyên nhân `cyl: 4` cũ: ô "- - -" cuối (cột l/h 1800 rpm) không bị `specVal` coi là trống (chỉ nhận `-` liền nhau), lượt đọc ở dòng đó đi khác. Đổi riêng ô đó thành "--" ở mã cũ thì cyl mất, weight 1050 hiện lại (`kl45.mjs`). Tức `cyl: 4` là kết quả may, còn đọc được weight mới là cách đọc chung.
- Thực trạng: 0 / 224 bản ghi động cơ tecnogen có `cyl`; 10 bảng cùng tiêu đề, 229 dòng. Sửa đúng là đọc cột Cylinder cho cả nhóm, nên spec-diff KHÔNG thể "chỉ đổi đúng một dòng". Em chưa làm vì vượt phạm vi "sửa hẹp", và thêm phiếu xi lanh cho nhiều động cơ.
- Đề xuất: một việc riêng đọc cột Cylinder (có thể cả cm3) cho 10 bảng tecnogen, soát 229 dòng.

## Lệnh kiểm + đầu ra thật
- `node --test suppliers/*.test.mjs web/test/*.test.mjs` → `# tests 1496 # pass 1496 # fail 0` (`test-full.txt`, chạy trước commit ab5c5e07; commit đó chỉ đổi mốc + tài liệu).
- `node suppliers/spec-diff.mjs git:95ecba26 . --out sd-cuoi.txt --md sd-cuoi.md` → `bản ghi cũ 61041, mới 61229 | khác 26 | chỉ cũ 0, chỉ mới 188 | bảng có đổi 64`, `{"model":26}`, `đảo vai: 0 → 0 | tự kiểm: cần soát tay 0`.
- `node suppliers/quality.mjs --check`: gốc đạt; nhánh trước khi đổi mốc báo `weight: thiếu "basis" 85.6% > mốc 83.5% + 2` (gốc 85,5 %, 188 dòng mới có cột khối lượng không ghi bản trần / có vỏ); sau khi đổi mốc 83,5 → 83,6: "không chỉ số nào xấu đi quá ngưỡng". **Đây là nới mốc 0,1 điểm, cần điều phối chấp nhận.**
- row-flags gốc ↔ nhánh: 144 → 144 cờ, loại 5 → 5; khác biệt duy nhất là mẫu số của bdadl (460 → 554) và pengpai (447 → 541).

## Ba mẫu đối chiếu nguồn (bản lưu `suppliers/sources`, chưa mở lại URL)
1. bdadl n118, http://www.bdadl.cn/?products_40/75.html (Accessed 2026-11-13): "| BDA-V270 | 270/337.5 | 沃尔沃遍达 | TAD1351GE(欧三) | 6 | 9.36 | …" → động cơ TAD1351GE, tổ máy BDA-V270, dung tích bị `dropspec`.
2. aosif n123, https://www.aosif.com/p/5-77.html (Accessed 2026-10-28): "| AW1125 | 1000/800 | 1125/900 | 8M33D1012E311^ | 218.9 | 12V | 31.8 |" → khoá `^` riêng, số 12V / 31,8 L không còn vào khoá trơn (8 xi lanh / 26,14 L).
3. baudouin n121, https://baudouin.com/engine_product/12m55/ (Accessed 2026-11-20): "| 12M55G3000/5^ | 2420 | 2700 | 2200 | 2750 | 3000 |" → model giữ `^`.

## Rủi ro + quay lui
- Lỗi 5: xem "Rủi ro chính". Lỗi 2: 188 dòng mới vào ứng viên, top 30 ở dải bdadl / pengpai sẽ đổi.
- Quay lui: `git revert` từng commit (bảng đầu tệp). Không đổi dữ liệu `cn/`.

## Chưa kiểm
Top 30 (điều phối đo, gốc = merge-base 95ecba26). 10 bản ghi không có NCC khác để so. md5 `build()` gốc ↔ nhánh không so riêng. URL nguồn không mở lại.

## Cần quyết
1. Lỗi 3: chọn A / C. 2. Lỗi 6: mở việc riêng đọc cột Cylinder tecnogen? 3. Lỗi 5: giữ tách dù 14 khoá mất số dung tích? 4. Chấp nhận mốc `basis` 83,6.

## Cần ghi nhớ
- Khoa 21/11: "tách ra" dấu `^` Baudouin / Weichai (đã làm ở #1017, chưa merge).
- Ngoài phạm vi, chưa sửa: eastern-lion ô "(YD4KD) YD485D" đọc model thành "(YD4KD)".
