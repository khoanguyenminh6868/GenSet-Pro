# catalog-b2 — ROW_EXCEPTIONS kiểu `dropspec` (20/11/2026)

PR draft A: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/952 (nhánh `catalog-b2`, đầu `41a227b9`). Gốc `85466b48`.
PR draft B (aosif, CHỜ KHOA): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/953 (nhánh `catalog-b2-aosif`, đầu `9ead96e9`, base `catalog-b2`).
- `0e34ac3e` A: khối lượng của 5 dòng (Khoa 19/11 "ok"). `a4ded978` B: aosif 8M33D1012E311, **Khoa CHƯA duyệt riêng**.
- 20/11 điều phối yêu cầu tách B: `41a227b9` trên `catalog-b2` là commit gỡ (revert `a4ded978`, không force-push); `9ead96e9` trên `catalog-b2-aosif` áp lại. Mọi số ở mục "Kiểm (đo thật)" và "Đối chiếu nguồn" dưới đây là lúc còn cả hai commit; phần của A = 5 dòng khối lượng, phần của B = aosif (dòng cuối). Đo cloud (mục Top 30) chạy trên `b45c4fbe` = có cả hai.

## Tệp đổi
`web/catalog.js` (mục `dropspec` trong `rowExceptions`: 6 mục khối lượng ở A, 1 mục aosif ở B), `web/CLAUDE.md` (dòng "Ngoại lệ theo DÒNG"), `suppliers/catalog-b2.test.mjs` (mới: 3 ca ở A, thêm 1 ca aosif ở B). Không đụng `suppliers/cn`.

## Thiết kế
`act: "dropspec", keys: [...]`: bản ghi khớp (NCC + n + model tổ máy + chữ dòng nguyên văn) giữ nguyên, chỉ lọc `specs` bỏ khoá trong `keys`; ghi note "ngoại lệ theo dòng". Bẫy gặp: pengpai n131 chép NGUYÊN VĂN dòng LZ1750 của n103; ngoại lệ chạy trước `mergeRepeats` nên nếu chỉ liệt kê n103 thì số 1440 từ bản ghi n131 được gộp lại → thêm cả n131. bdadl n129 ghi "…| 14400" (chữ dòng khác) KHÔNG đụng.

## Kiểm (đo thật)
- spec-diff toàn bộ `git:85466b48 .`: `bản ghi cũ 60073, mới 60073 | khác 6 | chỉ cũ 0, chỉ mới 0`; `{"cyl bỏ":1,"disp bỏ":1,"weight bỏ":5}`; đảo vai 0 → 0. Từng bản ghi (trước → sau):
  - bdadl-shanghai n104 b2 dòng 14 BDA-LZ1750 / S16R-PTAA2-C: weight 1440 → ∅
  - fukangsi-yangzhou n2009 b18 dòng 7 FKS-LZ1750: weight 1440 → ∅
  - pengpai-yangzhou n103 b2 dòng 14 PPDL-LZ1750: weight 1440 → ∅ (n131 gộp vào đây, không còn bản ghi riêng)
  - fukangsi-yangzhou n2001 b2 dòng 0 FKS-C20 4B3.9-G1: weight 5500 → ∅
  - pengpai-yangzhou n125 b24 dòng 0 PPDL-C20 4B3.9-G1: weight 5500 → ∅
  - aosif n123 b21 dòng 19 AW1125 8M33D1012E311: cyl 12V → ∅; disp 31.8 → ∅
  Mọi số khác của 6 dòng (model, cyl 16 / 4, disp 65.4 / 3.92, tiêu hao, kích thước…) giữ. "tự kiểm: cần soát tay 7" = đúng 7 số bỏ trên ("mới không kiểm được"), không số mới.
- `row-flags.mjs --json` gốc ↔ nhánh: 160 → 158 dòng. MẤT 2: fukangsi n2001 4B3.9-G1 và pengpai n125 4B3.9-G1 (`absurd` drop, weight "5500"). MỚI 0. Cờ khác (cylMaj …) không đổi. aosif không có cờ từ trước.
- Test: `node --test suppliers/*.test.mjs web/test/*.test.mjs` → 1340 pass / 0 fail (chạy bằng Bash, 4 ca mới); `quality.mjs --check` không xấu đi. Playwright không chạy (không đổi giao diện).
- spec-diff riêng commit B (so với commit 1): khác 1 bản ghi (aosif), cyl / disp bỏ.
- Top 30: CHƯA đo (điều phối đo cloud). Dự kiến đổi: dòng 4B3.9-G1 của fukangsi / pengpai trở lại ứng viên (hết `rowflag` loại); LZ1750 mất khối lượng ở `khoaRules`; 8M33D1012E311 thay đổi theo luật xi lanh / dung tích (aosif không còn phiếu 12V / 31,8).

## Đối chiếu nguồn (3 mẫu)
1. http://www.bdadl.cn/?products_47/89.html (`sources/bdadl-shanghai/104.md` dòng 106): "| BDA-LZ1750 | 1600/1750 | 上海菱重 | S16R-PTAA2-C | 16 | 65.4 | 213 | ≤432 | 5875×2392×3453 | 1440" — chữ dòng đúng; cột cuối "机组重量(KG)". 1.440 kg cho 1.600 kW (0,9 kg/kW) vô lý; bảng n129 cùng NCC ghi 14400 cho cùng model.
2. http://yzfks.cn/?products_12/65.html (`sources/fukangsi-yangzhou/2001.md` dòng 199): "| FKS-C20 | 20/25 | 东风康明斯 | 4B3.9-G1 | 4 | 3.92 | 9 | ≤210 | 1600*800*1300 | 5500"; dòng kế "4B3.9-G2 … 1600*700*1150 | 600".
3. https://www.aosif.com/p/5-77.html (`sources/aosif/123.md` dòng 126): "| AW1125 | 1000/800 | 1125/900 | 8M33D1012E311^ | 218.9 | 12V | 31.8 |". Chữ dòng ĐÚNG như bản lưu. Việc "số thật sự sai" KHÔNG đọc ra được từ chính nguồn (dòng AW1000 kế bên 8M33D979E201 cũng "12V | 31.8"); căn cứ là số tên mã "8M33" (8 xi lanh), waeta / wiseke ghi 8 / 26,14 L, 150×185 mm × 8 ≈ 26,1 L — đó là suy luận từ nguồn khác, nên Khoa cần duyệt riêng. Lưu ý: dòng AW1000 / 8M33D979E201 cùng "12V | 31.8" chưa động tới (ngoài phạm vi).

## Rủi ro, quay lui
- Ngoại lệ chỉ ăn khi chữ dòng nguyên văn; nguồn cào lại đổi chữ thì tự hết (có test).
- Quay lui: revert PR; riêng B: bỏ commit 2.
- Chưa kiểm: top 30; tác động config-bot lên gói thật.

## Cần ghi nhớ
- B chờ Khoa duyệt riêng. Dòng AW1000 aosif (8M33D979E201 "12V | 31.8") nghi cùng lỗi, chưa xử lý.

## Top 30 (đo cloud, đọc tệp, không chạy lại trên máy) — 20/11/2026
Tệp: `dieu-phoi\dau-vao\catalog-b2\top30-cloud\` (`gop-goc.json.gz` = main `875e3d6a`, `gop-nhanh.json.gz` = `catalog-b2` `b45c4fbe` có cả hai commit A + aosif). Soát bằng `b2-top30.mjs` (so từng lượt: top + topScore theo mảng, `all` theo đa tập khoá@điểm, số dropped, rowflag) trên 1.093 lượt.
- Giống hệt 1.036; **top đổi 0**; lượt có khác 57 = 51 (nhóm 4B3.9-G1) + 6 (nhóm 8M33). **Khoá ngoài hai nhóm: 0** (không "vào" / "rời" / đổi điểm / rowflag nào của khoá khác; không lượt thiếu ở nhánh).

### Nhóm 4B3.9-G1 (A, 51 lượt) — hết cờ absurd
- 49 lượt: đúng 2 khoá VÀO `all` (fukangsi n2001 và pengpai n125 4B3.9-G1, cùng điểm trong một lượt), `dropped` giảm ĐÚNG 2 (49/49), rowflag RA đúng hai khoá đó (49/49), không rời, không đổi điểm của khoá khác. Điểm vào: 114 × 26 lượt, 139 × 8, 130 × 4, 125 × 3, 100 × 2, 106 × 2, 107, 110, 122, 135 (mỗi cái 1).
- 2 lượt chỉ dropped / rowflag đổi (IB2300108940#1, IB2400474549#0): rowflag RA đúng hai khoá, `dropped` giữ nguyên (1407 → 1407, 1595 → 1595), không vào `all` — hai dòng vẫn bị loại nhưng bởi luật khác của `candidates` (cloud chỉ lưu số dropped; lượt IB2300108940#1: đo catalog-a ghi lý do đổi rowflag → cyl). Lý do riêng của lượt IB2400474549#0 không có trong tệp cloud.
- Vì sao không vào top: top không chọn thuần theo điểm mà theo trần (PER_ENGINE 3, PER_SUPPLIER 4, trần mỗi hãng) và chỗ dành sẵn (SYNC_ROWS, CN_ROWS, MAKE_ROWS) rồi mới điền theo điểm (`config-bot.mjs` quanh dòng 1665–1730). Trong 49 lượt, điểm của hai dòng mới xếp thứ ≥ 386 trong `all` của lượt (hàng trăm dòng điểm cao hơn); điểm vào ≤ điểm thấp nhất của top ở 43 lượt. 6 lượt có điểm vào CAO hơn điểm thấp nhất của top (IB2300236743#1 100 / 64, IB2400164837#0 130 / 128, IB2400427929#1 114 / 75, IB2400440257#0 130 / 128, IB2400489270#0 130 / 128, IB2500287209#1 139 / 75): điểm thấp nhất của top đến từ chỗ dành sẵn, còn hai dòng mới xếp thứ 461–765 theo điểm trong `all` nên không đủ để điền; ba lượt (IB2400164837#0, IB2400440257#0, IB2400489270#0) đã có 3 dòng 4B39G1 ở top (trần PER_ENGINE).
- Kết luận: đúng như dự kiến, hai dòng này hết bị loại theo cờ nhưng chưa lọt top 30 ở lượt nào.

### Nhóm 8M33D1012E311 (aosif, 6 lượt, 28 dòng-lượt) — thuộc PR B (#953)
`all` của nhánh mất các khoá 8M33D1012E311, `dropped` tăng đúng bằng số khoá rời (3 / 3 / 13 / 3 / 3 / 3). Điểm các khoá rời ở bản gốc: 189 / 171 / 241… (xem README cloud), đều không ở top. Lý do (từ đo cloud catalog-b trước khi gộp khoá `^`, `dau-vao\catalog-b\top30-cloud\ct-goc.json`, cùng trạng thái số đông 8 / 26,14; cloud B2 không lưu lý do từng dòng):
| lượt | khoá rời (số dòng) | luật loại |
|---|---|---|
| IB2300005377#0 | aosif, kaihua, walter (3) | cyl, freq (kaihua, walter, wiseke), + layout (waeta) |
| IB2300096122#0 | aosif, kaihua, walter (3) | disp, cyl, freq |
| IB2300369012#0 | 13: aosif, kaihua, walter, uleengen ×6, jet-power, kaichen, mecca, waeta, wiseke | disp |
| IB2500320544#0, IB2500432527#0, IB2600418114#0 | aosif, kaihua, walter (3 mỗi lượt) | cyl, freq |
Dòng aosif tự nó bị loại theo số đông cyl / disp của động cơ (không có dòng nào của aosif trong `ct-goc.json` vì khoá `^` tách riêng lúc đó); lý do riêng của dòng aosif không chứng minh được từ tệp cloud B2. Cũng chưa xác nhận lượt nào dùng `freq` cho aosif (dòng aosif ghi 50 Hz).
Hệ quả khi chấp nhận B: 28 dòng-lượt của 8M33 trở lại bị loại như trước catalog-b; không đổi top. Khi KHÔNG chấp nhận B: số đông 8 / 26,14 không hình thành (cyl {8:1, 8l:1, 12v:1}), các dòng này không bị loại theo luật số đông (đúng trạng thái main hiện nay).

## Cần ghi nhớ (bổ sung)
- B (#953) chờ Khoa; dòng aosif AW1000 (8M33D979E201) cùng "12V | 31.8" và AW875 (8M33D845E201) "8V | 26.1" chưa xử lý.
- `top` của Gợi ý cấu hình không phải top theo điểm (trần mỗi động cơ / NCC / hãng + chỗ dành sẵn): ngưỡng "điểm thấp nhất của top" không dùng để dự đoán dòng mới có vào top hay không.
