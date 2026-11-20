# Đo top 30 "Gợi ý cấu hình": gốc vs hai nhánh

| | SHA |
|---|---|
| GỐC (main) | cf0b04481379675267fdf0915d7b7c6e6155d0c3 |
| A (PR #969) | 3bd48e842196197d29dc836527ed24e533995f14 |
| B (PR #986) | 9565ba338bf3eb577b6845813a4d0a27dbaa48f9 |

Lệnh (cùng một tệp bidhist, tải lúc 2026-11-20T07:01:40Z, ngoài repo):
```
NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs ../wt-goc ../wt-goc/suppliers/cn /tmp/gop-goc.json --save-bidhist /tmp/bidhist.json   # (lượt này bị dừng giữa chừng, chạy lại với --bidhist cùng tệp)
NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs ../wt-goc ../wt-goc/suppliers/cn /tmp/gop-goc.json --bidhist /tmp/bidhist.json
NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs ../wt-a ../wt-a/suppliers/cn /tmp/gop-a.json --bidhist /tmp/bidhist.json
NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs ../wt-b ../wt-b/suppliers/cn /tmp/gop-b.json --bidhist /tmp/bidhist.json
```
A và B chạy song song với nhau (không ảnh hưởng kết quả). Mỗi lượt: 928 gói, 432 NCC, 1093 lượt, 0 lỗi.

So với gốc (từng lượt `<số thông báo>#<chỉ số cỡ>`):
- "Giống" = danh sách top 30 và điểm giống hệt (cùng thứ tự). "Khác" = còn lại. "Đổi top" = tập khoá dòng trong top 30 khác (không tính thứ tự).

| Nhánh | Giống | Khác | Trong đó đổi top |
|---|---|---|---|
| A (#969) | 653 | 440 | 428 |
| B (#986) | 1075 | 18 | 17 |

Tệp: `gop-*.json.gz` (khoá dòng + điểm), `gop-*.meta.json`. Không chứa bidhist, chữ HSMT, token.
