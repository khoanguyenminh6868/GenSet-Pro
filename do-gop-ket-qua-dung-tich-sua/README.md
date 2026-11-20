# Đo top 30 "Gợi ý cấu hình": GỐC so với NHÁNH (PR #992)

- GỐC  = `b8752924236a50465b3871984eec0323aacb5e54` (merge-base của PR #992 với origin/main)
- NHÁNH = `282da8a963d333e7e138adb4cb5b934dc63e9a62` (PR #992)
- Cùng một tệp bidhist (tải 2026-11-20T08:19:24Z, 928 gói, 432 NCC); tệp bidhist KHÔNG đưa lên repo.

Lệnh:
```
NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs ../wt-goc ../wt-goc/suppliers/cn /tmp/gop-goc.json --save-bidhist <bidhist.json>
NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs ../wt-nhanh ../wt-nhanh/suppliers/cn /tmp/gop-nhanh.json --bidhist <bidhist.json>
```
Tệp: `gop-goc.json.gz`, `gop-nhanh.json.gz` (khoá dòng + điểm), kèm `*.meta.json`. Mỗi lượt: `top`, `topScore`, `all`, `dropped`, `rowflag`.

Kết quả so (khoá `thôngBáo#chỉSốLượt`):
| Chỉ số | Số lượt |
|---|---|
| Tổng lượt GỐC / NHÁNH | 1093 / 1093 (0 lỗi, 0 thiếu) |
| Giống hoàn toàn (top, điểm, all, dropped, rowflag) | 1003 |
| Khác ở bất kỳ trường nào | 90 |
| Đổi top 30 (danh sách hoặc thứ tự) | 6 |
| ... trong đó cùng tập, chỉ đổi thứ tự | 1 |
| Top giống, khác ở điểm / all / dropped / rowflag | 84 |

Chưa kết luận; chỉ là số đo.
