# nguong-hsmt PR 1: nghiệm thu (21/11/2026)

**Kết luận:** PR DRAFT https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1036, nhánh `nguong-hsmt-1`, commit `2b199862`, làm trên origin/main `ae205b52`. Chưa merge. **Top 30 chưa đo** (điều phối giao đo cloud).

## Sửa
- `suppliers/config-bot.mjs`, chỉ vùng đọc ngưỡng:
  - `sizeBlocks().tags` + `LINE_SIZE`; `minsForSize` xếp dòng tự ghi tên máy vào đúng cỡ.
  - `engineLists`: "không ít hơn / không dưới N xi lanh" là tối thiểu.
  - `tankNear`: "dung tích" trơ trong vế câu có từ chỉ bình không là dung tích xi lanh.
- `suppliers/mins-line-size.test.mjs` (mới), `suppliers/CLAUDE.md` (bẫy). Điều phối dặn "chỉ config-bot + test"; dòng bẫy thêm theo quy tắc CLAUDE.md của repo.

## Đo (script ở `dau-vao/nguong-hsmt/`: `quet.mjs`, `so.mjs`, `soat.mjs`, `dong.mjs`)
- Mọi HSMT `genbid-work\specs` (1.499 gói, 1.880 lượt theo cỡ): **0 lượt đổi ngưỡng**.
- `hints-audit --texts` trên 1.499 gói: log gốc và nhánh giống từng byte (lệch 10, thiếu 298).
- bidhist cục bộ (928 gói, 1.093 lượt): **102 lượt đổi, 58 gói**; 991 lượt giữ nguyên. Danh sách: `dau-vao/nguong-hsmt/doi-nguong.tsv`.
  - Theo trường: minCyl 48, maxFuel 39, minDisp 30, maxFuel75 27, minPrime 22, maxDisp 20, maxFuel50 14, cylExact 1.
  - Khác kỳ vọng của điều phối: ngoài "gói nhiều cỡ" và "không ít hơn", còn đổi do `tankNear`. Trong đó IB2400275648#0 bỏ trần 8 L vốn là tiêu hao "≤ 8,0 lít/giờ" đọc nhầm; IB2500460613#0 có lại "≥ 1.8 lít".
- Test: 1376 + 148 + 11 pass.

## Đã soát và chưa soát
- Đã đọc dòng nguồn của mọi ngưỡng dung tích / xi lanh mới.
- Ngưỡng tiêu hao mới (maxFuel*): đã đọc nguồn cả 69, **có 5 ngưỡng SAI**, xem mục "Soát 69 ngưỡng tiêu hao".
- 2 lượt lấy số xi lanh theo luật cũ "các cỡ khác cùng ghi một số": IB2300032777#1, IB2500531255#2.
- 2 lượt mất `minPrime` (IB2300245748#2, IB2400377239#0): không loại thêm dòng.
- Phần lớn lượt đổi là từ không có ngưỡng sang có ngưỡng, nên PR sẽ LOẠI THÊM dòng ở các gói đó.

## Bản sửa `powerRead` (21/11/2026, commit `2b199862`, thay `bf9e62a5`)
Điều phối đã dừng lượt đo `bf9e62a5` và cho sửa trong #1036. Các số ở mục "Đo" phía trên là của `bf9e62a5`; số dưới đây là bản cuối.
- Sửa: mức tải đứng SAU số trong cùng vế câu là của số đó (`inClause`), gồm "(100% tải)", "ở tải 75% định mức", "(75%)", "ở 75%". Test `fuel-load-after.test.mjs`: 5 ca sai, ca mức tải đứng trước số, ca dự phòng, ca sai số %.
- **Lệch mức tải** (`fuel-lech.mjs`): main **21 / 1.602**, `bf9e62a5` **24 / 1.660**, bản cuối **2 / 1.782**. 2 ca còn lại là báo nhầm của phép so: IB2300245556#1 (75% = 3,5) và IB2400497000#1 (75% = 6) đúng ở cỡ của lượt, số đó trùng mức 100% của cỡ khác trong cùng HSMT.
- **Main ↔ bản cuối:** specs 3 / 1.880 lượt đổi (2 gói, đều là tiêu hao mới đọc được); bidhist 159 / 1.093. Theo trường: maxFuel 108, maxFuel75 86, minCyl 48, maxFuel50 35, minDisp 30, minPrime 22, maxDisp 20, cylExact 1. Danh sách `dau-vao/nguong-hsmt/doi-nguong.tsv`.
- **`bf9e62a5` ↔ bản cuối:** 77 lượt đổi, chỉ ở tiêu hao (`doi-powerread.tsv`). **Đã đọc nguồn cả 77** (`soat-pr.mjs`). Cùng với mục "Đã soát" phía trên, mọi ngưỡng đổi so với main đều đã đọc nguồn.
- `hints-audit` 1.499 gói: lệch 10 → 10, thiếu 298 → 296.
- Test: 1385 + 148 + 11 pass.
- Các ca code không đặt ngưỡng vì nguồn ghi hai số cùng một mức tải (không loại thêm dòng): IB2300349583#0 75% ("bắt buộc ≤ 5,5", "nâng cao ≤ 4,5"), IB2200020538#0 (hai bậc điểm), IB2400365165#0 75% (4,25 và 4).

**Trình Khoa (không tự quyết):**
1. IB2500403535: HSMT ghi hai số cùng 75% tải: #0 "≤ 2,6 (MRQ)" và "≤ 2.5 (RQ)", #1 "≤ 4 (MRQ)" và "≤ 3,5 (RQ)". Main lấy 2,5 / 3,5 do gán nhầm; `2b199862` KHÔNG có ngưỡng 75% ở hai lượt này. **Khoa quyết 21/11/2026: lấy số RQ.** Làm ở PR draft riêng chồng lên #1036, nhánh `nguong-hsmt-2-rq`. Đo so với `2b199862`: đổi đúng 2 lượt của gói này ở cả specs và bidhist (`maxFuel75` null → 2,5 / 3,5), danh sách `dau-vao/nguong-hsmt/doi-rq.tsv`. Test 1388 + 148 + 11 pass. Top 30 chưa đo.
2. Luật có sẵn "Tại 100% công suất dự phòng ≤ X" tính như 100% tải (IB2400375383#0/#1, IB2400448320#0/#1, 34 và 65 L/h): giữ nguyên, không đổi ở PR này.

## Soát 69 ngưỡng tiêu hao mới của `bf9e62a5` (đọc nguồn từng ngưỡng, 21/11/2026; `soat-fuel.mjs`, `fuel-lech.mjs`)

| Nhóm | Số ngưỡng | Kết luận |
|---|---|---|
| Đúng số, đúng mức tải, đúng cỡ | 58 | Đúng (kể cả dòng không ghi tải, tính là 100% theo quy ước đã có) |
| Gán sai mức tải | **5** | **SAI**, xem dưới |
| Ghi "Tại 100% công suất dự phòng" | 4 | Số đúng, nhưng là mức dự phòng mà code tính như 100% tải: IB2400375383#0/#1, IB2400448320#0/#1 (34, 65 L/h). Luật có sẵn, không đổi ở PR này |
| Hai số cùng 75% tải (MRQ / RQ) | 2 | Cần hỏi: IB2500403535#0 "≤ 2,6 (MRQ)" và "≤ 2.5 (RQ)", code lấy 2.5; #1 "≤ 4 (MRQ)" và "≤ 3,5 (RQ)", code lấy 3.5. HSMT không giải thích trong dòng này nên chưa biết số nào là ngưỡng loại |

5 ngưỡng sai, đều do `powerRead` gán số cho mức tải của vế câu kế bên khi mức tải đứng SAU số ("≤ 12 l/h tại 40 kW (100% tải); ≤ 9 l/h tại 30 kW (75% tải)"):
- IB2400062394#0: maxFuel = 9 (đúng là 12; 9 là của 75%).
- IB2400062394#1: maxFuel = 17 (đúng là 23).
- IB2600562009#0: maxFuel = 5.4 (đúng là 7,5). Ở main số sai này nằm ở lượt #1.
- IB2300190927#0: maxFuel75 = 13 (đúng là 18; 13 là của 50%).
- IB2300190927#1: maxFuel75 = 18 (đúng là 26).

Hệ quả: các ngưỡng này chặt hơn HSMT, nên #1036 sẽ trừ 300 điểm / loại oan dòng ở 5 lượt đó.

**Lỗi này có sẵn ở main, rộng hơn #1036:** `fuel-lech.mjs` so mức tải trong vế câu với ngưỡng code đọc: main 21 ngưỡng lệch / 1.602, nhánh 24 / 1.660 (20 ngưỡng lệch ở cả hai, gồm 2 ngưỡng ở `specs`, ví dụ IB2300222010, IB2500442970, IB2600434462). Phép so chỉ bắt vế có đúng một mức tải nên là số tối thiểu (nó không bắt được IB2300190927#1).

Đã sửa ở bản cuối (mục "Bản sửa `powerRead`").

## Danh sách soát sau của #998 (không chặn #998)
`nghiem-thu/ma-dong-co-trung-1-soat-sau.tsv`: các nhóm chỉ một NCC ghi số, và lượt chưa rõ ngưỡng (IB2500291421#1). Số "20 dòng chưa rõ" gồm dòng của lượt này và phần dòng còn lại của IB2300162912#0 (dòng có thêm luật bố trí); đo lại #998 sau khi #1036 merge sẽ cho số mới.

## Giải thích toàn bộ đo cloud #1036 (`2b199862` ↔ `ae205b52`, kết quả `do-gop-nguong-ket-qua` 2e537f55; 21/11/2026)

**Kết luận: CHƯA merge được. 6 lượt còn sai ngưỡng** (4 mất ngưỡng thật, 2 bỏ qua dung sai ±). 127 / 133 lượt đổi tập không có ca sai ngưỡng.

Cách đo: chạy lại `candidates` của 159 lượt đổi ngưỡng ở cả hai bản, ghi lý do loại từng dòng (`giai-thich-dump.mjs`, `hieu-luc.mjs`, `giai-thich-so.mjs`). **Tái lập khớp cloud 159 / 159** (cùng tập `all`, cùng `top`). Danh sách: `dau-vao/nguong-hsmt/giai-thich-133-luot.tsv`, `giai-thich-top5.txt`.

- **159 lượt đổi ngưỡng, 133 đổi tập.** 26 lượt không đổi: 4 lượt `plausible` bỏ ngưỡng nên ngưỡng hiệu lực như cũ; 22 lượt ngưỡng hiệu lực đổi nhưng không dòng nào đổi trạng thái.
- **20.262 lượt-dòng ra `all`, 6.034 vào: 100% quy được về một ngưỡng đã đổi của đúng lượt đó** (0 dòng không giải thích).

| Nhãn (một dòng có thể mang nhiều nhãn) | Ra | Vào |
|---|---:|---:|
| Dung tích tối đa | 7.523 | 1.950 |
| Dung tích tối thiểu | 4.915 | 1.274 |
| Công suất liên tục | 3.925 | 883 |
| Số xi lanh | 3.791 | 1.728 |
| Tiêu hao 100% | 1.779 | 389 |
| Tiêu hao 75% | 200 | 40 |
| Tiêu hao 50% | 61 | 4 |

- **Dòng VÀO:** do ngưỡng của cỡ khác không còn áp nhầm (đúng), hoặc tiêu hao 75 / 50% đọc lại đúng mức tải. Trừ 904 dòng của 4 ca mất ngưỡng dưới đây.
- **Nguồn:** đã đọc thêm mọi ngưỡng công suất liên tục đổi (22 lượt) và mọi ngưỡng bị bỏ / nới (`soat-vao.mjs`); dung tích, xi lanh, tiêu hao đã đọc ở các mục trên.
- **118 dòng hạng 1–5 gốc ra khỏi top 30:** 97 bị loại, 21 bị đẩy. **117 đúng, 1 oan** (IB2400377239#0 sanq-power 2206CE13TAG2, bị đẩy bởi các dòng lọt do ca 1). Phần "đúng" so ngưỡng HSMT với số catalog đang dùng; không mở lại trang nguồn NCC của từng dòng. Vài dòng rớt sát ngưỡng theo luật "giữ chặt" của Khoa (5,88 < 5,9; 119 < 120 kVA).

### 6 ca sai (đo bằng cách chạy lại với ngưỡng đúng theo chữ HSMT, `ca-oan.mjs`)

| # | Lượt | HSMT ghi | Nhánh đọc | Hệ quả so với ngưỡng đúng |
|---|---|---|---|---|
| 1 | IB2400377239#0 | "Công suất liên tục tối thiểu 400 kVA" (dòng gắn "Tổ máy 450 kVA": một máy, code tách thành hai cỡ 400 / 450) | không có (main: 400) | 818 dòng lọt, 10 chỗ top 30 |
| 2 | IB2300245748#2 | "≥ 12.5 ±0.5 kVA" | không có (main: 12), "own: disagree" do đọc cả "≥ 15 KVA" của đầu phát | 65 dòng lọt, 5 chỗ |
| 3 | IB2300046353#1 | "dung tích > 1,950 lít" | không có (main: 1,95) | 16 dòng lọt, 2 chỗ |
| 4 | IB2500403535#0 | "≥ 3 xilanh thẳng hàng" | không có (main: 3) | 5 dòng lọt, 1 chỗ |
| 5 | IB2400125924#0 | "≥ 8.5 KVA ± 0.5" | 8,5 (đơn vị đứng giữa số và ± nên không trừ dung sai; "≥ 12.5 ±0.5" thì code ra 12) | 16 dòng loại oan, 3 chỗ |
| 6 | IB2300293753#0 | "≤ 1,3 lít ± 5%" | 1,3 | 65 dòng loại oan, 8 chỗ |

Tổng: 904 dòng lọt sai, 81 dòng loại oan, 29 chỗ top 30. Ca 6 giả định trần là 1,3 × 1,05 = 1,365 L: cách hiểu dung sai này cần Khoa xác nhận.

## Bản sửa 6 ca (21/11/2026, chồng lên `2b199862`)

Điều phối quyết sửa trong #1036. Khoa trả lời "có" cho dung sai: HSMT tự ghi dung sai thì tính vào ngưỡng, chỉ khi dung sai ghi liền sau số ngưỡng trong cùng câu.

Nguyên văn hai câu dung sai: IB2400125924#0 "Công suất liên tục: ≥ 8.5 KVA ± 0.5"; IB2300293753#0 "số xy lanh ≤ 3 và tổng dung tích xy lanh ≤ 1,3 lít ± 5%".

- **Sửa (`suppliers/config-bot.mjs`):** "tối đa" của số khác trong cùng ô không làm mất dung tích / số xi lanh; số của đầu phát không làm mất công suất tổ máy; một máy bị tách hai cỡ liên tục / dự phòng giữ ngưỡng liên tục; dung sai sau số (kể cả sau đơn vị, kể cả %) tính vào công suất và dung tích.
- **Đổi một test có sẵn:** `domain.test.mjs` từng khẳng định "≥ 400 kVA ± 5%" là 400; theo quyết định của Khoa nay là 380.
- **Đo lại toàn bộ so với `2b199862`:** specs 16 / 1.880, bidhist 63 / 1.093 lượt đổi (`doi-6ca.tsv`). Theo trường: minPrime 44, minCyl 24, minDisp 21, maxDisp 2. So với main: specs 18, bidhist 193 (`doi-nguong-cuoi.tsv`).
- **Đọc nguồn cả 79 lượt đổi** (`soat-doi.mjs`): số đúng theo chữ HSMT. Một bản nháp đọc nhầm dung tích thùng 65 L (IB2200046063#1) đã sửa và có test.
- Test: 1391 + 148 + 11 pass.

Cần biết:
- IB2300296794#0: chữ bidhist ghi "20 kVA ± 1% (văn bản ghi "+ 1%")", code ra 19,8. Nếu bản gốc là "+ 1%" thì ngưỡng phải là 20. Chưa đối chiếu HSMT gốc.
- IB2500464050#0: "750 KVA ± 5%" nay nhận từ 712,5 kVA, nới nhiều nhất trong các ca dung sai.
- IB2500337925: HSMT ghi "dung tích xilanh ≥ 32,6 lít" và "≥ 33 lít" cho máy 12,5 và 30 kVA (nhiều khả năng gõ nhầm); code đọc đúng chữ, `plausible` bỏ nên không loại dòng.
- Tiêu hao có dung sai ("≤ 21±2 lít/giờ") vẫn không đặt ngưỡng như cũ, không đổi ở bản này.
- #1042 (RQ) chồng lên nhánh này, cần gộp lại sau commit mới. Top 30 của bản này chưa đo.

## Việc tiếp
1. Điều phối giao đo cloud top 30 cho SHA cuối.
2. Sau khi #1036 merge: gộp main vào #998, đo lại #998 toàn bộ.
