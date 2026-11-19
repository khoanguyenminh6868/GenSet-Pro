# Đo top 30 Gợi ý cấu hình trên cloud — catalog-b2 (PR #952 sau khi gộp main), không PR đo

Công cụ: `suppliers/do-gop.mjs` của `origin/main` (875e3d6) cho cả hai lượt; `NODE_USE_ENV_PROXY=1`; code + `<cn>` = `suppliers/cn` của worktree từng commit.
Cùng MỘT bản bidhist, tải lúc **2026-11-19T20:03:48.277Z** (1556 doc, KHÔNG commit, lưu ngoài repo). Container 4 CPU, hai lượt chạy song song (lượt nhánh bắt đầu sau khi bidhist đã lưu).

Lệnh (`$S` = thư mục tạm):
```
NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs $S/wt-goc   $S/wt-goc/suppliers/cn   $S/ext/gop-goc.json   --save-bidhist $S/ext/bidhist.json
NODE_USE_ENV_PROXY=1 node suppliers/do-gop.mjs $S/wt-nhanh $S/wt-nhanh/suppliers/cn $S/ext/gop-nhanh.json  --bidhist $S/ext/bidhist.json
```
(`wt-goc` = `origin/main` 875e3d6a0b2163b10bf79322ae60ab6f90bb522d; `wt-nhanh` = `origin/catalog-b2` b45c4fbe964ae98f0097aab6729f539b52748b0c; cả hai SHA đã kiểm đúng. Cả hai lượt chạy từ thư mục `wt-goc` nên dùng `do-gop.mjs` của main.) Tệp `.json.gz` là kết quả gzip; `.gz.meta.json` là meta của lượt.

| | commit | gói | NCC | lượt | lượt lỗi | giây |
|---|---|---|---|---|---|---|
| gốc | 875e3d6a0b2163b10bf79322ae60ab6f90bb522d | 928 | 432 | 1093 | 0 | 1876 |
| nhánh | b45c4fbe964ae98f0097aab6729f539b52748b0c | 928 | 432 | 1093 | 0 | 1887 |

Không lượt nào lỗi.

## So sánh gốc ↔ nhánh (1093 lượt)
Giống hệt = top + topScore theo mảng, `all` theo đa tập (khoá@điểm), dropped, rowflag. Mỗi lượt vào đúng một nhóm theo thứ tự: top đổi → chỉ `all` đổi → chỉ dropped/rowflag đổi → giống hệt.

| giống hệt | top đổi | chỉ `all` đổi | chỉ dropped/rowflag đổi | lỗi |
|---|---|---|---|---|
| 1036 | 0 | 55 | 2 | 0 |

## Lượt liệt kê đủ (57, ≤ 200 nên không gộp)
Ký hiệu: `rời` = khoá có trong `all` của gốc, không có ở nhánh (kèm điểm gốc); `vào` = khoá mới trong `all` của nhánh (kèm điểm); `đổi điểm` = cùng khoá, điểm gốc → nhánh; `ra top`/`vào top` = khoá rời / vào top 30; dropped gốc → nhánh; rowflag ra/vào = khoá bị rowflag ở gốc mà nhánh hết bị / ngược lại. Khoá dòng = `supplierId|engineKey|altKey|keyOf(dòng)`.

### IB2200029975#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 141 → 139
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2200064629#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 607 → 605
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2300005377#0 — chỉ `all` đổi
- rời: `kaihua-genset|8M33D1012E311|||KH800GF|1100|1000|8M33D1012E311|4300*1800*2400|7300` @189
- rời: `walter-yangzhou|8M33D1012E311|||WETWC1125|1125|1000|WEICHAI|8M33D1012E311|4000*1900*2200` @99
- rời: `aosif|8M33D1012E311|||AW1125|1000/800|1125/900|8M33D1012E311^|2189|12V|318|` @-111
- dropped: 1016 → 1019

### IB2300046353#1 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 148 → 146
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2300076217#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @106
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @106
- dropped: 3 → 1
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2300088930#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 812 → 810
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2300096122#0 — chỉ `all` đổi
- rời: `aosif|8M33D1012E311|||AW1125|1000/800|1125/900|8M33D1012E311^|2189|12V|318|` @171
- rời: `kaihua-genset|8M33D1012E311|||KH800GF|1100|1000|8M33D1012E311|4300*1800*2400|7300` @171
- rời: `walter-yangzhou|8M33D1012E311|||WETWC1125|1125|1000|WEICHAI|8M33D1012E311|4000*1900*2200` @81
- dropped: 1264 → 1267

### IB2300102941#1 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 12 → 10
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2300108940#1 — chỉ dropped/rowflag đổi
- dropped: 1407 → 1407
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2300119789#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @139
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @139
- dropped: 2 → 0
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2300134568#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @125
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @125
- dropped: 85 → 83
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2300135650#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 165 → 163
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2300139360#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 105 → 103
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2300139646#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 148 → 146
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2300165519#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 105 → 103
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2300177056#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @139
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @139
- dropped: 20 → 18
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2300225452#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @139
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @139
- dropped: 229 → 227
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2300229145#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @139
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @139
- dropped: 20 → 18
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2300232318#1 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @107
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @107
- dropped: 3 → 1
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2300236743#1 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @100
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @100
- dropped: 32 → 30
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2300244692#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 2 → 0
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2300263757#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 12 → 10
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2300296794#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 156 → 154
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2300343943#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @135
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @135
- dropped: 189 → 187
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2300349583#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @100
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @100
- dropped: 547 → 545
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2300369012#0 — chỉ `all` đổi
- rời: `uleengen|8M33D1012E311|S6L1DD41||UW1000GF|800|1000|8M33D1012E311|910|8|150*185|2614|186|S6L1DD41|4320X1900X2340|7000` @241
- rời: `uleengen|8M33D1012E311|S6L1DD41||UW1000GF|800|1000|8M33D1012E311|WEICHAI|910|8|150*185|2614|186|S6L1DD41|4320X1900X2340|7000` @241
- rời: `uleengen|8M33D1012E311|S6L1DD41||UW1000GF|800|1000|8M33D1012E311|潍柴|910|8|150*185|2614|186|S6L1DD41|4320X1900X2340|7000` @241
- rời: `jet-power|8M33D1012E311|JET634E||WP1125|1125|900|1000|800|8M33D1012E311|8L|ELECTRONIC|150*185|261|198|JET634E` @229
- rời: `aosif|8M33D1012E311|||AW1125|1000/800|1125/900|8M33D1012E311^|2189|12V|318|` @189
- rời: `kaichen-jiangsu|8M33D1012E311|||KCW1000GF|800|1000|900|1125|8M33D1012E311|` @189
- rời: `kaihua-genset|8M33D1012E311|||KH800GF|1100|1000|8M33D1012E311|4300*1800*2400|7300` @189
- rời: `uleengen|8M33D1012E311|||UW1000GF|800|1000|8M33D1012E311|WEICHAI|910|8|150*185|2614|186|4320X1900X2340|7000` @189
- rời: `uleengen|8M33D1012E311|||UW1000GF|800|1000|8M33D1012E311|潍柴|910|8|150*185|2614|186|4320X1900X2340|7000` @189
- rời: `mecca-power|8M33D1012E311|||MC1125WC|800|1000|900|1125|8M33D1012E311^|` @149
- rời: `waeta-fujian|8M33D1012E311|||WTAW1100|1100|880|1000|800|8M33D1012E311|8L|2614|WECHAISERIESXLSX` @99
- rời: `walter-yangzhou|8M33D1012E311|||WETWC1125|1125|1000|WEICHAI|8M33D1012E311|4000*1900*2200` @99
- rời: `wiseke-taizhou|8M33D1012E311|||WDL900W2|1000/800|1125/900|8M33D1012E311|910|1012|8|150*185|4200*1800*2200|7500` @99
- dropped: 613 → 626

### IB2300372629#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 90 → 88
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2400023840#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 2 → 0
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2400023840#1 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @139
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @139
- dropped: 2 → 0
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2400031785#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @130
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @130
- dropped: 333 → 331
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2400064139#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 77 → 75
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2400152304#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 12 → 10
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2400152304#1 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @122
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @122
- dropped: 10 → 8
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2400164837#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @130
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @130
- dropped: 737 → 735
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2400232266#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @106
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @106
- dropped: 3 → 1
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2400268013#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 165 → 163
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2400365763#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 156 → 154
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2400427929#1 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 8 → 6
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2400440257#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @130
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @130
- dropped: 734 → 732
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2400440994#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @125
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @125
- dropped: 85 → 83
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2400474549#0 — chỉ dropped/rowflag đổi
- dropped: 1595 → 1595
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2400479497#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @139
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @139
- dropped: 182 → 180
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2400489270#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @130
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @130
- dropped: 384 → 382
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2400497000#1 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 12 → 10
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2400533348#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @125
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @125
- dropped: 5 → 3
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2500031588#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @139
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @139
- dropped: 39 → 37
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2500279384#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 165 → 163
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2500287209#1 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @139
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @139
- dropped: 89 → 87
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2500312373#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 2 → 0
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2500320544#0 — chỉ `all` đổi
- rời: `aosif|8M33D1012E311|||AW1125|1000/800|1125/900|8M33D1012E311^|2189|12V|318|` @189
- rời: `kaihua-genset|8M33D1012E311|||KH800GF|1100|1000|8M33D1012E311|4300*1800*2400|7300` @189
- rời: `walter-yangzhou|8M33D1012E311|||WETWC1125|1125|1000|WEICHAI|8M33D1012E311|4000*1900*2200` @99
- dropped: 722 → 725

### IB2500385135#1 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 102 → 100
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2500430242#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 102 → 100
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2500432527#0 — chỉ `all` đổi
- rời: `aosif|8M33D1012E311|||AW1125|1000/800|1125/900|8M33D1012E311^|2189|12V|318|` @189
- rời: `kaihua-genset|8M33D1012E311|||KH800GF|1100|1000|8M33D1012E311|4300*1800*2400|7300` @189
- rời: `walter-yangzhou|8M33D1012E311|||WETWC1125|1125|1000|WEICHAI|8M33D1012E311|4000*1900*2200` @99
- dropped: 776 → 779

### IB2600064877#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 2 → 0
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2600118095#0 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @114
- dropped: 229 → 227
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

### IB2600418114#0 — chỉ `all` đổi
- rời: `aosif|8M33D1012E311|||AW1125|1000/800|1125/900|8M33D1012E311^|2189|12V|318|` @189
- rời: `kaihua-genset|8M33D1012E311|||KH800GF|1100|1000|8M33D1012E311|4300*1800*2400|7300` @189
- rời: `walter-yangzhou|8M33D1012E311|||WETWC1125|1125|1000|WEICHAI|8M33D1012E311|4000*1900*2200` @99
- dropped: 733 → 736

### IB2600457659#1 — chỉ `all` đổi
- vào: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @110
- vào: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500` @110
- dropped: 12 → 10
- rowflag ra: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- rowflag ra: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

## Tổng hợp: khoá rời `all` (13 khoá)
- 6 lượt: `kaihua-genset|8M33D1012E311|||KH800GF|1100|1000|8M33D1012E311|4300*1800*2400|7300`
- 6 lượt: `walter-yangzhou|8M33D1012E311|||WETWC1125|1125|1000|WEICHAI|8M33D1012E311|4000*1900*2200`
- 6 lượt: `aosif|8M33D1012E311|||AW1125|1000/800|1125/900|8M33D1012E311^|2189|12V|318|`
- 1 lượt: `uleengen|8M33D1012E311|S6L1DD41||UW1000GF|800|1000|8M33D1012E311|910|8|150*185|2614|186|S6L1DD41|4320X1900X2340|7000`
- 1 lượt: `uleengen|8M33D1012E311|S6L1DD41||UW1000GF|800|1000|8M33D1012E311|WEICHAI|910|8|150*185|2614|186|S6L1DD41|4320X1900X2340|7000`
- 1 lượt: `uleengen|8M33D1012E311|S6L1DD41||UW1000GF|800|1000|8M33D1012E311|潍柴|910|8|150*185|2614|186|S6L1DD41|4320X1900X2340|7000`
- 1 lượt: `jet-power|8M33D1012E311|JET634E||WP1125|1125|900|1000|800|8M33D1012E311|8L|ELECTRONIC|150*185|261|198|JET634E`
- 1 lượt: `kaichen-jiangsu|8M33D1012E311|||KCW1000GF|800|1000|900|1125|8M33D1012E311|`
- 1 lượt: `uleengen|8M33D1012E311|||UW1000GF|800|1000|8M33D1012E311|WEICHAI|910|8|150*185|2614|186|4320X1900X2340|7000`
- 1 lượt: `uleengen|8M33D1012E311|||UW1000GF|800|1000|8M33D1012E311|潍柴|910|8|150*185|2614|186|4320X1900X2340|7000`
- 1 lượt: `mecca-power|8M33D1012E311|||MC1125WC|800|1000|900|1125|8M33D1012E311^|`
- 1 lượt: `waeta-fujian|8M33D1012E311|||WTAW1100|1100|880|1000|800|8M33D1012E311|8L|2614|WECHAISERIESXLSX`
- 1 lượt: `wiseke-taizhou|8M33D1012E311|||WDL900W2|1000/800|1125/900|8M33D1012E311|910|1012|8|150*185|4200*1800*2200|7500`

## Tổng hợp: khoá vào `all` (2 khoá)
- 49 lượt: `fukangsi-yangzhou|4B39G1|||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- 49 lượt: `pengpai-yangzhou|4B39G1|||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

## Tổng hợp: khoá đổi điểm (0 khoá)

## Tổng hợp: rowflag ra (2 khoá)
- 51 lượt: `fukangsi-yangzhou|4B39G1||FKSC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`
- 51 lượt: `pengpai-yangzhou|4B39G1||PPDLC20|20/25|东风康明斯|4B39G1|4|392|9|≤210|1600*800*1300|5500`

## Tổng hợp: rowflag vào (0 khoá)

sha256 (giải nén): gốc `2bf93d8add0d6b99a11bfc1a5a1bf31b20451eb175ec350fe6a3ebcdf69c7f06`, nhánh `9325b0a9b24736fa40e8f9612557cfb28c38e63401893d380cb3b8761e4beff5`.
