# cyl-ky-1: số "N kỳ / thì" bị đọc thành số xi lanh HSMT (20/11/2026)

PR #1005 (draft), nhánh `cyl-ky` từ main e7ea34f8, SHA **0507f7d7**. Nguồn lỗi: `dung-tich-sua-1.md` mục 8c.

## Lỗi
`engineLists` (config-bot): mẫu `CYL_LABEL + [^\d\n]{0,30}? + số + \b` gặp "Động cơ - loại, số xy lanh: Động cơ Diesel 4 kỳ, 6 xy lanh xếp thẳng hàng" (IB2600217137), nuốt tới "4" của "4 kỳ" → minCyl 4 + cylExact → 45 dòng 6 xi lanh bị `cyl` −600.

## Sửa
`NOT_STROKE` = `(?!\s*-?\s*(?:k[ỳìyi]|th[ìi]|stroke|cycle)(?![a-zà-ỹ]))`, đặt ngay sau số ở hai mẫu có thể bắt số không kèm chữ "xi lanh" (nhãn cùng ô; nhãn dòng trên + "≥ N"). Mẫu "≥ N xi lanh", "N xi lanh" đầu dòng, `inlineCyl` đòi chữ xi lanh ngay sau số: không dính.

## Quét đủ (`dau-vao\cyl-ky\`, bidhist máy, 1.556 doc → 928 gói máy phát, 1.093 lượt mọi cỡ; không lấy mẫu)
- `quet-hints.mjs` (gốc wt-cyl-goc e7ea34f8 ↔ nhánh) + `so-hints.mjs` → `so-hints.tsv`: **1.085 lượt hints giống từng byte, 8 lượt khác, chỉ `minCyl`**. 484 gói có chữ "N kỳ / thì" (ngữ cảnh trong `hints-*.json` → `ctx`).
- Từng gói đổi, chữ HSMT nguyên văn ngắn:

| Lượt | cũ → mới | Chữ HSMT |
|---|---|---|
| IB2600217137#0 | 4 → 6 | "số xy lanh: Động cơ Diesel 4 kỳ, 6 xy lanh xếp thẳng hàng" |
| IB2400027592#0 | 4 → 6 | "Kiểu, số xylanh: Turbocharged 4 thì, 6 xylanh thẳng hàng" |
| IB2400208175#0 | 4 → 8 | "loại, số xi lanh: Động cơ đốt trong, 4 kỳ; 8 xy lanh thẳng hàng" |
| IB2300233670#0 | 4 → 16 | "số xilanh, bố trí: Diesel 4 thì, phun nhiên liệu trực tiếp; 16 xilanh; dạng V 60º" |
| IB2400100405#0 | 4 → 16 | "kiểu, số xilanh: 4 thì, 16 xilanh xếp hình chữ V" |
| IB2500084609#0 | 4 → 3 | "kiểu, số xi lanh, tốc độ: Diesel 4 kỳ, 3 xilanh làm mát bằng nước" |
| IB2500211376#0 | 4 → 3 | "kiểu, số xilanh: Diesel 4 kỳ, 3 xilanh làm mát bằng nước" |
| IB2400125924#1 | 4 → 3 | "số xilanh, tốc độ: 4 kỳ làm mát bằng nước…; số xilanh ≥3" |

  Cả 8 đúng chữ HSMT. `cylExact` giữ như cũ (IB2400125924#1 không trơ vì "≥3").
- Không còn chỗ nào đọc số kỳ: chạy mã CŨ trên chữ đã thay mọi "N kỳ / thì / kì / stroke / cycle" bằng "bốn kỳ" (`XOA_KY=1`) → so với mã MỚI trên chữ gốc: mọi trường số giống (`so-xoaky.tsv`: 17 lượt khác CHỈ ở câu trích `madeRule` / `trait` chứa chữ đã thay). Tức mã mới = "bỏ số kỳ", ở mọi trường của `hintsOf` (xi lanh, dung tích, đường kính…), không chỉ xi lanh.

## Test
`suppliers/cyl-ky.test.mjs`: 6 ca nguyên văn + các dạng khác (main 0/2, nhánh 2/2). Toàn bộ suppliers + web/test pass. Bẫy ghi `suppliers/CLAUDE.md`.

## Chưa làm
Đo top 30 (điều phối cho đo cloud).
