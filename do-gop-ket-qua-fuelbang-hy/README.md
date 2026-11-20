# Đo top 30 "Gợi ý cấu hình": gốc vs nhánh A vs nhánh B

| | SHA |
|---|---|
| GỐC (main) | `325be5035131bbed38cb0efcc22aab1801056257` |
| A (PR #982) | `fdbda7f6e14d0a67b24a51bf1517c00168fa9b9a` |
| B (PR #973) | `ce676c1b1fb4b6e619c2431c9ff20af74ebd24b0` |

Bidhist: một tệp chung, tải 2026-11-20T06:19:32Z (1556 doc, 928 gói máy phát, 432 NCC); KHÔNG đưa vào repo.
Script: `suppliers/do-gop.mjs` của main (a8f442f), cờ `NODE_USE_ENV_PROXY=1`. Lượt gốc đầu tiên bị dừng vì quá 30 phút nền sau khi đã
`--save-bidhist`; cả ba được chạy lại song song với `--bidhist` cùng tệp đó:

    node suppliers/do-gop.mjs ../wt-goc ../wt-goc/suppliers/cn /tmp/gop-goc.json --bidhist /tmp/bidhist.json
    node suppliers/do-gop.mjs ../wt-a   ../wt-a/suppliers/cn   /tmp/gop-a.json   --bidhist /tmp/bidhist.json
    node suppliers/do-gop.mjs ../wt-b   ../wt-b/suppliers/cn   /tmp/gop-b.json   --bidhist /tmp/bidhist.json

Mỗi lượt: 1093 lượt đo (khoá `thông báo#chỉ số cỡ`), 0 lỗi, ~2620 s.
Tệp: `gop-{goc,a,b}.json.gz` (gồm `top`, `topScore`, `all`, `dropped`, `rowflag` mỗi lượt), `gop-*.meta.json`, `so-sanh.json`.

## So với gốc (1093 lượt)

| | giống gốc | khác gốc | đổi top (tập 30 dòng hoặc thứ tự) | trong đó đổi tập | đổi thứ tự | đổi hạng 1 | chỉ khác điểm top |
|---|---|---|---|---|---|---|---|
| A | 478 | 615 | 4 | 4 | 0 | 0 | 0 |
| B | 552 | 541 | 70 | 53 | 17 | 2 | 2 |

Định nghĩa: "giống" = `top`, `topScore`, `all` và `dropped` đều trùng gốc. "Khác" = có khác ở bất kỳ trường nào (kể cả `all`/`dropped`
ngoài top 30). "Đổi top" = danh sách `top` (khoá dòng) khác gốc. Phần khác không ở top (A: 611, B: 469) là thay đổi ở `all`/`dropped`/điểm ngoài top.
Chỉ số thông báo, khoá dòng, điểm; không có chữ HSMT hay token.
