# Đo top 30 "Gợi ý cấu hình" — S9 A/B (cc-129, kingway-n117)
Cùng một bidhist (tải 2026-11-22T00:44:48Z, 928 gói máy phát), cùng 435 NCC; `node suppliers/do-gop.mjs` với `NODE_USE_ENV_PROXY=1`.
Gốc là `d61d6c96` (merge-base của cả hai PR với main, đã kiểm: `git merge-base d61d6c96 pr1077|pr1078` = d61d6c96).

| Bản | SHA | Lượt | Lỗi | Giờ chạy (UTC, 22/11/2026) | Giây | Lượt khác gốc | Top đổi |
|---|---|---|---|---|---|---|---|
| gốc | d61d6c96ec876fdcff13978196532b66d8c994ca | 1093 | 0 | 00:45 – 01:26 | 2478 | – | – |
| A (PR #1077) | 5558ff92083eabad1b4e2c8730f86e7c3c806cc7 | 1093 | 0 | 02:41 – 03:21 (A, B chạy song song) | 2425 | 77 | 8 |
| B (PR #1078) | ec8d2cf2f9965c2177697644810b065803297535 | 1093 | 0 | 02:41 – 03:21 | 2424 | 70 | 0 |

"Lượt khác" = lượt có bất kỳ trường nào trong 5 trường (`top`, `topScore`, `all`, `dropped`, `rowflag`) khác gốc.
Tệp: `gop-goc.json.gz`, `gop-a.json.gz`, `gop-b.json.gz` (chỉ 5 trường trên; không có bidhist, chữ HSMT hay token). Giải thích: `giai-thich.md`.
