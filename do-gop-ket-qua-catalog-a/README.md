# Đo top 30 Gợi ý cấu hình trên cloud — catalog-a (PR #945, không PR kết quả)

Công cụ: `suppliers/do-gop.mjs` của `origin/main` (cho cả hai lượt), mỗi lượt code + `suppliers/cn` của CHÍNH commit đó (worktree riêng).
Đầu PR #945 lúc đo = `c977a26b9af787b1b58e4aaccf0027bca987a174` (nhánh `catalog-a`), đúng commit yêu cầu.
Cùng MỘT bản bidhist, tải lúc **2026-11-19T11:47:02Z** (1556 doc, KHÔNG commit). Hai lượt chạy song song, 4 CPU / 16 GB, không lượt nào lỗi.

Lệnh (lượt GỐC tải bidhist; lượt NHÁNH chạy ngay sau khi tệp bidhist có):
```
NODE_USE_ENV_PROXY=1 node do-gop.mjs wt-goc   wt-goc/suppliers/cn   gop-goc.json   --save-bidhist <ngoài repo>/bidhist.json
NODE_USE_ENV_PROXY=1 node do-gop.mjs wt-nhanh wt-nhanh/suppliers/cn gop-nhanh.json --bidhist     <ngoài repo>/bidhist.json
```

| | commit | gói | NCC | lượt | lượt lỗi | giây | sha256 (giải nén) |
|---|---|---|---|---|---|---|---|
| gốc (main) | 671797e4d6c544045d8128934390bf5ae5379834 | 928 | 432 | 1093 | 0 | 1609 | 2723b15324aa852aa7a85a9805cd725d47322c723a72022d05fe933e6cb7be0d |
| nhánh (PR #945) | c977a26b9af787b1b58e4aaccf0027bca987a174 | 928 | 432 | 1093 | 0 | 1590 | 7c40e756788bbfe348419a1cdc3914b82eb290fcabd9e3472de4187b04381a24 |

Kiểm chéo: sha256 của lượt gốc trùng sha256 "nhánh mới (PR #941)" ở đo R1b, nên main hiện tại cho kết quả đúng bằng nhánh #941 trên cùng bộ dữ liệu.

## So sánh gốc ↔ nhánh (số lượt trên 1093)
Giống hệt = top + topScore theo mảng, `all` theo đa tập (khoá@điểm), dropped, rowflag.

| giống hệt | top đổi | chỉ `all` đổi (top giống) | chỉ dropped/rowflag đổi | lỗi |
|---|---|---|---|---|
| 286 | 229 | 543 | 35 | 0 |

Từng lượt khác (807 lượt, `all ra` = có ở gốc mất ở nhánh, `all vào` = mới ở nhánh, mỗi lượt tối đa 6 dòng mỗi loại): xem `chi-tiet-khac.md`.
