# nguong-hsmt PR 1: nghiệm thu (21/11/2026)

**Kết luận:** PR DRAFT https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1036, nhánh `nguong-hsmt-1`, commit `bf9e62a5`, làm trên origin/main `ae205b52`. Chưa merge. **Top 30 chưa đo** (điều phối giao đo cloud).

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

## Soát 69 ngưỡng tiêu hao mới (đọc nguồn từng ngưỡng, 21/11/2026; `soat-fuel.mjs`, `fuel-lech.mjs`)
Commit vẫn `bf9e62a5`, chưa sửa (điều phối dặn không đẩy thêm trong lúc đo cloud).

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

**Đề xuất:** dừng lượt đo cloud đang chạy, sửa `powerRead` ngay trong #1036 (mức tải đứng sau số trong cùng vế câu), đo lại ngưỡng rồi đo cloud một lần. Chờ điều phối quyết.

## Danh sách soát sau của #998 (không chặn #998)
`nghiem-thu/ma-dong-co-trung-1-soat-sau.tsv`: các nhóm chỉ một NCC ghi số, và lượt chưa rõ ngưỡng (IB2500291421#1). Số "20 dòng chưa rõ" gồm dòng của lượt này và phần dòng còn lại của IB2300162912#0 (dòng có thêm luật bố trí); đo lại #998 sau khi #1036 merge sẽ cho số mới.

## Việc tiếp
1. Đo cloud top 30 cho #1036.
2. Sau khi #1036 merge: gộp main vào #998, đo lại #998 toàn bộ.
