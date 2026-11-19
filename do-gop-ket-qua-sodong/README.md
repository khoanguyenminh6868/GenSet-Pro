# Đo top 30 Gợi ý cấu hình — số dòng / dung tích (không PR)

Công cụ: `suppliers/do-gop.mjs` (giống nhau ở hai commit); `NODE_USE_ENV_PROXY=1`; code + `suppliers/cn` của CHÍNH commit đó (mỗi commit một worktree; repo không có package.json nên không cần `npm ci`).
Cùng MỘT bản bidhist tải lúc **2026-11-19T11:21:56Z** (1556 doc, KHÔNG commit). Container 4 CPU / 16 GB; hai lượt chạy song song.

Lệnh (từ thư mục chứa hai worktree; chạy qua python để lấy ru_maxrss):
```
NODE_USE_ENV_PROXY=1 node wt-goc/suppliers/do-gop.mjs wt-goc wt-goc/suppliers/cn gop-goc.json --save-bidhist <bidhist.json ngoài repo>
NODE_USE_ENV_PROXY=1 node wt-nhanh/suppliers/do-gop.mjs wt-nhanh wt-nhanh/suppliers/cn gop-nhanh.json --bidhist <bidhist.json>
```
Nhánh `so-dong-dung-tich` fetch theo tên, đầu nhánh = 48044c611366de34ad146da881a8b49c985da254 (đúng 48044c61).

| | commit | gói | NCC | lượt | lượt lỗi | giây | RAM đỉnh | sha256 (giải nén) |
|---|---|---|---|---|---|---|---|---|
| gốc (main) | 671797e4d6c544045d8128934390bf5ae5379834 | 928 | 432 | 1093 | 0 | 2071 | 2268 MB | 2723b15324aa852aa7a85a9805cd725d47322c723a72022d05fe933e6cb7be0d |
| nhánh | 48044c611366de34ad146da881a8b49c985da254 | 928 | 432 | 1093 | 0 | 2161 | 2257 MB | 06200504a33bdee61da912771249719abed076cb7049364a8d57aed95108488c |

Không lượt nào lỗi. (Kiểm chéo: sha của gốc trùng "nhánh mới" của R1b, tức main 671797e4 = 573506701 về kết quả.)

## So sánh gốc ↔ nhánh (số lượt trên 1093)
Giống hệt = top + topScore theo mảng, `all` theo đa tập (khoá@điểm), dropped, rowflag.

| giống hệt | top đổi | chỉ `all` đổi | chỉ dropped/rowflag đổi | lỗi |
|---|---|---|---|---|
| 952 | 127 | 14 | 0 | 0 |

Số lượt `dropped` (hoặc rowflag) đổi: **141** — đúng bằng 127 lượt top đổi + 14 lượt chỉ `all` đổi, tức mọi lượt khác biệt đều kèm dropped đổi; 952 lượt giống hệt không có dropped đổi.
