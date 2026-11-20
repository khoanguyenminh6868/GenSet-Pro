# Đo top 30 Gợi ý cấu hình trên cloud — PR #958 (fuel1: nhiên liệu của dòng), không PR đo

Công cụ: `suppliers/do-gop.mjs` của `origin/main` (79e9b17) cho cả hai lượt; `NODE_USE_ENV_PROXY=1`; code + `<cn>` = `suppliers/cn` của worktree từng commit.
Cùng MỘT bản bidhist, tải lúc **2026-11-20T01:08:21.299Z** (1556 doc, KHÔNG commit, lưu ngoài repo). Container 4 CPU, hai lượt chạy song song (lượt nhánh bắt đầu sau khi bidhist đã lưu).

Lệnh (`$S` = thư mục tạm):
```
NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs $S/wt-goc   $S/wt-goc/suppliers/cn   $S/ext/gop-goc.json   --save-bidhist $S/ext/bidhist.json
NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs $S/wt-nhanh $S/wt-nhanh/suppliers/cn $S/ext/gop-nhanh.json  --bidhist $S/ext/bidhist.json
```
(`wt-goc` = `origin/main` 79e9b1750234f70d6aa6d4061dfcdbc85c5e27cb; `wt-nhanh` = đầu PR #958 (`pull/958/head`) 623f4b8904738775477090f6f27206c11febe20a; cả hai SHA đã kiểm đúng. Cả hai lượt chạy từ thư mục `wt-goc` nên dùng `do-gop.mjs` của main.) Tệp `.json.gz` là kết quả gzip; `.gz.meta.json` là meta của lượt.

| | commit | gói | NCC | lượt | lượt lỗi | giây |
|---|---|---|---|---|---|---|
| gốc | 79e9b1750234f70d6aa6d4061dfcdbc85c5e27cb | 928 | 432 | 1093 | 0 | 2357 |
| nhánh | 623f4b8904738775477090f6f27206c11febe20a | 928 | 432 | 1093 | 0 | 2379 |

Không lượt nào lỗi. Số dòng bị chặn (blocked) gốc 15, nhánh 16.

## So sánh gốc ↔ nhánh (1093 lượt)
Giống hệt = top + topScore theo mảng, `all` theo đa tập (khoá@điểm), dropped, rowflag. Mỗi lượt vào đúng một nhóm theo thứ tự: top đổi → chỉ `all` đổi → chỉ dropped/rowflag đổi → giống hệt.

| giống hệt | top đổi | chỉ `all` đổi | chỉ dropped/rowflag đổi | lỗi |
|---|---|---|---|---|
| 1085 | 1 | 7 | 0 | 0 |

## Lượt liệt kê đủ (8, ≤ 200 nên không gộp)
Ký hiệu: `rời` = khoá có trong `all` của gốc, không có ở nhánh (kèm điểm gốc); `vào` = khoá mới trong `all` của nhánh (kèm điểm); `đổi điểm` = cùng khoá, điểm gốc → nhánh; `ra top`/`vào top` = khoá rời / vào top 30 kèm hạng; dropped gốc → nhánh; rowflag ra/vào = khoá bị rowflag ở gốc mà nhánh hết bị / ngược lại. Khoá dòng = `supplierId|engineKey|altKey|keyOf(dòng)`.

### IB2200021335#0 — chỉ all đổi
- vào: `agg-fuzhou|LYL89HG190|||DC170G6NG|170/136|LYL89HG190|AGG` @11
- vào: `agg-fuzhou|LYL89HG190|||DC170G5NG|170/136|LYL89HG190|AGG` @11
- dropped: 1099 → 1097

### IB2200100465#0 — chỉ all đổi
- vào: `agg-fuzhou|LYBT59G90|||DC80G6NG|80/64|LYBT59G90|AGG` @8
- vào: `agg-fuzhou|LYBT59G90|||DC80G5NG|80/64|LYBT59G90|AGG` @8
- dropped: 934 → 932

### IB2300146335#0 — chỉ all đổi
- vào: `agg-fuzhou|LYX15HG350|||DC330G5NG|330/264|LYX15HG350|AGG` @5
- dropped: 1726 → 1725

### IB2300204696#0 — top đổi
- vào top: `agg-fuzhou|LYC83HG160|||DC140G5NG|140/112|LYC83HG160|AGG` hạng 19 @-2
- vào: `agg-fuzhou|LYC83HG160|||DC140G5NG|140/112|LYC83HG160|AGG` @-2
- dropped: 1466 → 1465

### IB2300277166#0 — chỉ all đổi
- vào: `agg-fuzhou|LYL89G180|||DC160G6NG|160/128|LYL89G180|AGG` @15
- vào: `agg-fuzhou|LYL89G180|||DC160G5NG|160/128|LYL89G180|AGG` @15
- vào: `agg-fuzhou|LYL89HG190|||DC170G6NG|170/136|LYL89HG190|AGG` @9
- vào: `agg-fuzhou|LYL89HG190|||DC170G5NG|170/136|LYL89HG190|AGG` @9
- dropped: 1072 → 1068

### IB2300290906#0 — chỉ all đổi
- vào: `agg-fuzhou|LYBT59G90|||DC80G6NG|80/64|LYBT59G90|AGG` @5
- vào: `agg-fuzhou|LYBT59G90|||DC80G5NG|80/64|LYBT59G90|AGG` @5
- dropped: 1010 → 1008

### IB2300346506#0 — chỉ all đổi
- vào: `agg-fuzhou|LYX12HG275|||DC250G6NG|250/200|LYX12HG275|AGG` @15
- vào: `agg-fuzhou|LYX12HG275|||DC250G5NG|250/200|LYX12HG275|AGG` @15
- vào: `agg-fuzhou|LY13G280|||DC260G6NG|260/208|LY13G280|AGG` @11
- vào: `agg-fuzhou|LY13G280|||DC260G5NG|260/208|LY13G280|AGG` @11
- dropped: 1395 → 1391

### IB2400116021#0 — chỉ all đổi
- vào: `agg-fuzhou|400830TRS1|||P525G5NG|525/420|400830TRS1|PERKINS` @94
- vào: `agg-fuzhou|K19NG4|||CU500G5NG|500/400|K19NG4|CUMMINS` @91
- dropped: 2417 → 2415

