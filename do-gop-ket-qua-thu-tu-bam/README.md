# Đo top 30 gợi ý cấu hình: thứ tự bám kết quả

| Lượt | Commit | Ghi chú |
|---|---|---|
| gop-goc | 04709819c3e104120011f97712b200c9036483a5 | gốc (merge-base origin/main, PR 1015) |
| gop-a | e8a8dc0f0b88fef43b6ba39f818b2a5c8bb0fa39 | PR 1015 |
| gop-b | 6c5f22b6c8caa0e0b2e3ed057e053bdad8cf1873 | PR 1025 |

- Cả ba lượt dùng cùng `suppliers/cn` của A và cùng một bản bidhist, tải lúc 2026-11-21T06:01:59Z (1556 doc).
- Số gói: 928; NCC: 435; số lượt (khoá `số thông báo#dòng`): 1093 mỗi tệp; số lượt lỗi: 0 ở cả ba.
- Thời gian chạy: gốc 2148 s, A 2170 s, B 2182 s.

## So sánh (trên 1093 lượt)

| Cặp | Lượt giống hệt (toàn bộ bản ghi) | Lượt giống hệt phần `top` (thứ tự 30 khoá) |
|---|---|---|
| gốc ↔ A | 11 | 13 |
| gốc ↔ B | 12 | 19 |
| A ↔ B | 24 | 56 |

Mỗi tệp: khoá lượt → `{top, topScore, all, dropped, rowflag}`; chỉ chứa số thông báo, khoá dòng, điểm.
