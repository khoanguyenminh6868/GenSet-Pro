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
- Ngưỡng tiêu hao mới (maxFuel*): chỉ kiểm tự động là có dòng cùng cỡ nêu số đó, chưa đọc từng dòng.
- 2 lượt lấy số xi lanh theo luật cũ "các cỡ khác cùng ghi một số": IB2300032777#1, IB2500531255#2.
- 2 lượt mất `minPrime` (IB2300245748#2, IB2400377239#0): không loại thêm dòng.
- Phần lớn lượt đổi là từ không có ngưỡng sang có ngưỡng, nên PR sẽ LOẠI THÊM dòng ở các gói đó.

## Danh sách soát sau của #998 (không chặn #998)
`nghiem-thu/ma-dong-co-trung-1-soat-sau.tsv`: các nhóm chỉ một NCC ghi số, và lượt chưa rõ ngưỡng (IB2500291421#1). Số "20 dòng chưa rõ" gồm dòng của lượt này và phần dòng còn lại của IB2300162912#0 (dòng có thêm luật bố trí); đo lại #998 sau khi #1036 merge sẽ cho số mới.

## Việc tiếp
1. Đo cloud top 30 cho #1036.
2. Sau khi #1036 merge: gộp main vào #998, đo lại #998 toàn bộ.
