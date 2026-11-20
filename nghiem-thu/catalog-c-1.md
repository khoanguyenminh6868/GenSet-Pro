**Kết luận: PR 1 việc (C) xong, chờ duyệt. 46 bảng (12 NCC) → 1.700 bản ghi tổ máy (845 model theo NCC), đọc theo danh sách tường minh, mỗi bảng khai rõ cột. Bản ghi động cơ / đầu phát / bộ điều khiển KHÔNG đổi (spec-diff 0 đổi, md5 y gốc). Chưa nối Gợi ý. Top 30: điều phối đo cloud, SHA `9e232916`, kỳ vọng 0 lượt đổi.**

# Việc (C) PR 1: bản ghi tổ máy bảng không ghi mã động cơ (20/11/2026)

- PR (draft): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/959 — nhánh `catalog-c1`, gốc `79e9b175` (origin/main lúc kiểm, chưa đổi tới khi push), đầu nhánh `9e2329163c4317cfbe12c512f847dd72182475b3`.
- Commit 1 `5f7ac19c`: `web/catalog.js`, `suppliers/catalog-c.test.mjs`, `web/CLAUDE.md`. Commit 2 `9e232916`: `suppliers/spec-diff.mjs` (so riêng phần "tổ máy").
- KHÔNG đụng: `fromSupplier`, `ROW_EXCEPTIONS`, `suppliers/config-bot.mjs`, trường nhiên liệu, row-flags / quality (thiết kế 2.2 chỉ đề xuất có cho spec-diff).

## 1. Đã làm

- `GENSET_TABLES` (45 khoá NCC + n + dòng tiêu đề ĐẦU nguyên văn → 46 bảng: frs n108 có hai bảng cùng tiêu đề, cả hai là T). 4 bảng X, 3 bảng O không đưa vào. Nguồn đổi tiêu đề → note "bảng trong danh sách tổ máy đổi tiêu đề: không đọc", không đọc.
- **Khác thiết kế 2.1 (có chủ ý):** thiết kế ghi "dùng chung `titledPowers`, `rowSpecs`". Soát dòng thì cách đọc chung sai ở chính các bảng này (googol, yingtai n104 4.5GF / 10GF, vpower, kangwo, zc, teksan Hz / Voltage), nên mỗi mục khai rõ ô nào là model / mức (`prime`, `standby`, `rated`, `unrated`) / tần số / thông số; giá trị lấy nguyên ô, thông số qua `specVal` + `specFits` như catalog. Hãng: như `makesFor` (dòng > tiêu đề cột > tên trang > hãng tự SX).
- Mức `unrated` (MỚI): số không ghi prime / standby — googol "Continuous Power" (11 dòng, Khoa 20/11: COP không là prime), vpower "电能 (kWe)" (26), kangwo "功率 KW KVA" (17). `rated` chỉ khi nguồn ghi "Rated" (westinpower, zc). Điều phối xem có muốn tên khác không (PR 2 hiển thị).
- Chốt (đều ghi note, vào `unread-tables`): dòng sai số ô của bố cục → bỏ (yingtai n109: **39** dòng động cơ, không phải 33 như bản khảo sát; acepow: **14** dòng kích thước, không phải 13); dòng không có model (6 dòng "| | | | | 9 |" chân bảng yingtai); kW / kVA của một mức không qua `fitPair` → để trống mức (7: teksan TJ180DW 144/165 và 2 dòng 47,7/53; yingtai n109 800GF "8020/1000", 900GF "990/1089", n105 1980/3364, n107 503/538); prime > standby → để trống cả hai (3: teksan TJ53S5-RH, yingtai n105 90GF, n107 504GF); thông số sai dạng → để trống (34: frs "11;1", "V型12缸", "11.0：1" (dấu hai chấm toàn khổ), "2-88*75"; superwatt "1500r/min" (regex `speed` cần ranh giới từ sau số — luật chung của catalog, không sửa); westinpower "12/V"; zc "Recoil").
- yingtai n104 có 10 dòng 8 ô (thiếu ô khối lượng): đọc model / công suất / dòng điện (ô 0–6), BỎ khối lượng + kích thước vì không biết ô nào thiếu.
- Bỏ có chủ ý (thà thiếu): kangwo cột "长X宽X高（cm）" (số là mm), frs n107 cột "缸数/排列 (mm)" (số là đường kính × hành trình, tiêu đề ghi khác), googol / vpower hiệu suất, superwatt n102 "Phase / Voltage" (một ô hai thứ), dòng điện standby yingtai (chỉ lấy dòng điện prime), công suất động cơ googol, tần số từ "1500r/min" trong ô hãng yingtai 220GF (cách đọc cũ suy ra 50 Hz).

## 2. Lệnh kiểm + đầu ra thật

1. Bảng + soát MỌI bản ghi cạnh dòng nguồn: `node dau-vao\catalog-c\soat-c1.mjs <wt> dau-vao\catalog-c\t-rows.json soat.tsv`
   ```
   bảng dùng: 46 khớp 46 bảng soát tay: true
   bản ghi: 1700 NCC: 12 model (NCC|key): 845
   mức công suất: {"prime+standby":1472,"prime":63,"unrated":54,"standby":96,"(không)":3,"rated":3,"rated+standby":9}
   có kVA: 1639 có kW: 1650 có tần số: 1198 (50: 485 60: 713 ) có hãng: 1415
   theo NCC: acepow 13, frs 60, googol 29, green-power 24, interpower 23, kangwo 17, superwatt 7, teksan 1180, vpower 26, westinpower 3, yingtai 309, zc 9
   CA LỆCH: 1
     [tỉ số kW/kVA] yingtai-jiangsu n104 r2 10GF: standby 11/15 = 0.733 | | 10GF | 10 | 13 | 11 | 15 | 18 | 19.8 | 387 | 1.32* 0.552* 1.18
   DÒNG T KHÔNG THÀNH BẢN GHI: 53 (14 acepow kích thước, 39 yingtai n109 động cơ)
   bản ghi KHÔNG thuộc 1.753 dòng T cũ: 0
   ```
   Kiểm tự động trên cả 1.700: mọi kW / kVA / tần số có trong chữ dòng, mọi thông số là chữ nguyên văn của dòng, model có trong dòng: 0 ca lệch; prime / rated ≤ standby: 0 ca lệch; kW/kVA ngoài 0,75–0,86 (≠ 1): 1 ca (trên, qua `pf08` vì 11 ≈ 0,8 × 15 trong làm tròn; số nguồn, giữ). Hãng: so từng dòng với cách đọc cũ, 0 dòng đổi.
   So với số đọc cũ (bị bỏ): công suất ĐỔI ở googol 29 (bỏ kW động cơ / Continuous không còn là prime), kangwo 17 (trước: không công suất), teksan 107 (trước "rated" → nay standby; prime 0/TBA để trống), vpower 26, yingtai 7 (4.5GF, 10GF, 1600GF… cách đọc cũ ghép dòng điện / đảo mức); tần số thêm ở teksan 1.180 (cột "Hz": 470 dòng 50 Hz, 710 dòng 60 Hz) và googol 11; tần số BỎ ở zc 9 ("50/60Hz" cũ đọc 60) và yingtai 1 (rpm). Bảng đủ: `soat.tsv` (scratchpad phiên, chạy lại lệnh trên để có).
2. md5 JSON `build()` trên `suppliers/cn`: `node dau-vao\catalog-c\md5-c1.mjs <catalog.js> <cn> u.json`
   ```
   gốc 79e9b175: engines 6889 af5b72830bdcd0875ec2833f076ddc10 | alternators 2704 29873f45d372a7d58e056a610a6ac058 | controllers 187 c04f065402e3b4eb5de220fe8563165d
   nhánh:        engines 6889 af5b72830bdcd0875ec2833f076ddc10 | alternators 2704 29873f45d372a7d58e056a610a6ac058 | controllers 187 c04f065402e3b4eb5de220fe8563165d | gensets 845
   unread gốc 4016 (bảng không cho bản ghi nào 3113) → nhánh 4073 (3067)
   ```
3. Note unread thêm / bớt (`udiff-c1.mjs u-base.json u-new.json`): bớt 46, toàn "bảng không cho bản ghi nào", đúng 46 bảng của danh sách; thêm 103, toàn note của `gensetsOf` (53 bố cục, 34 thông số, 7 mức không đọc, 3 prime > standby, 6 không model).
4. `node suppliers/spec-diff.mjs git:79e9b175 . --out … --md …`
   ```
   bản ghi cũ 60073, mới 60073 | khác 0 | chỉ cũ 0, chỉ mới 0 | bảng có đổi 0
   đảo vai: 0 → 0 | tự kiểm: cần soát tay 0
   Tổ máy bảng không ghi mã động cơ (`gensetsOf`, chưa nối Gợi ý): 0 → 1.700; 0 đổi, 0 mất, 1700 thêm
   ```
5. `node --test suppliers/*.test.mjs`: pass 1194, fail 0. `node --test web/test/*.test.mjs`: pass 161, fail 0. `node suppliers/quality.mjs --check`: "không chỉ số nào xấu đi quá ngưỡng".

## 3. Số đo trước / sau (đo trên máy, không ước tính)

| chỉ số | trước | sau |
|---|--:|--:|
| bản ghi động cơ / đầu phát / BĐK (md5) | 6.889 / 2.704 / 187 | y hệt |
| bản ghi tổ máy (`gensets`) | 0 | 1.700 dòng / 845 model |
| bảng "không cho bản ghi nào" | 3.113 | 3.067 (−46) |
| dòng tổ máy có tần số (46 bảng) | 17 | 1.198 |
| vpower-hk có dữ liệu cấu hình | không | 26 dòng |
| top 30 Gợi ý | — | CHƯA ĐO (điều phối, cloud) |

## 4. Ba mẫu đối chiếu nguồn

1. teksan n101 — https://www.teksan.com/en/diesel-generator/ (lưu `suppliers/sources/teksan/101.md` dòng 573): "| | TJ8BD-1 | 1 | 50 | 8 | 6.4 | 7 | 5.6 | 230 | BAUDOUIN |" dưới "Standby (ESP) | Prime (PRP)" / "kVA | kW | kVA | kW" → standby 8 kVA / 6,4 kW, prime 7 / 5,6, 50 Hz, 1 pha, 230 V, Baudouin (dòng bảng).
2. googol n107 — http://www.googol-power.com/en/products/95.html (dòng 102): "| PTAA20V-EG1120C | 1120 | 1020 | 1000/1250 | 900/1125 | V20 | 40.7 | 2450 | 238" → standby 1.000 kW / 1.250 kVA, prime 900 / 1.125 (KHÔNG 1.120 kW của động cơ), V20, 40,7 L, 2.450 kg, 238 L/h, hãng Googol (hãng tự SX).
3. yingtai n109 — https://www.yingtaigroup.com/pd42772615.html (dòng 129): "| 800GF | 8020 | 1000 | 880 | 1100 | …" → prime để trống (8.020 kW / 1.000 kVA, nguồn gõ sai), standby 880 / 1.100; cùng trang dòng 148 ghi "| 800GF | 800 | 1000 | 880 | 1100 |" (bản ghi riêng, prime 800 / 1.000).

## 5. Rủi ro còn lại + quay lui

- Không ai đọc `gensets` ngoài `build()` (config-bot không đọc) → rủi ro gợi ý sai 0; top 30 cần điều phối xác nhận 0 lượt đổi. `build()` thêm 845 mục: web dựng lâu hơn chút (chưa đo thời gian).
- Bản ghi có số nguồn sai mà chốt không bắt (kW/kVA hợp lệ nhưng sai): đã soát tự động, chưa xem tay hết 1.700 dòng (đã xem mẫu mọi bảng + mọi ca chốt).
- Cào lại nguồn đổi tiêu đề → bảng hết hiệu lực (note), không đọc sai.
- Quay lui: revert PR (hai commit độc lập; spec-diff có thể giữ, bên không có `gensetsOf` ra rỗng).

## 6. Chưa kiểm được

- Top 30 (`do-gop.mjs`): không đo trên máy theo brief.
- Hiển thị web (PR 2).
- Trường nhiên liệu: không thêm (phiên máy khí). Trong 1.700 có máy khí / biogas (teksan n104 / n106 181, googol 11, frs n107 23, vpower 26, westinpower 3) và xăng (frs n108 37, zc 9): PR nối Gợi ý sau này phải có nhiên liệu trước.

## Cần ghi nhớ

- **Sự cố sổ:** tôi chạy lại `do-to-may.mjs` ghi `dau-vao\catalog-c\hits.json` (5 MB); tác vụ "GenBid DieuPhoi Sync" đã tự commit nó vào nhánh `dieu-phoi` (commit `4483ae08`, 08:13), trái ghi chú "không lưu vào sổ". Tôi xin `git rm` thì bị chặn quyền; tệp còn nguyên. Điều phối quyết có gỡ không (và có nên thêm `hits.json` vào `.gitignore` của sổ).
- Script mới trong sổ: `dau-vao\catalog-c\soat-c1.mjs`, `md5-c1.mjs`, `udiff-c1.mjs`.
- Mức `unrated` mới cho bản ghi tổ máy (Continuous / kWe / không ghi mức); PR 2 hiển thị cần chữ cho nó.
- Bản khảo sát ghi 33 dòng động cơ yingtai n109 và 13 dòng kích thước acepow; đếm thật 39 và 14.
- Bẫy chung chưa sửa (ngoài phạm vi): regex `speed` của `SPECS` không nhận "1500r/min" (thiếu ranh giới từ), `compr` không nhận dấu "：" toàn khổ; tên hãng tiếng Trung "帕金斯" (Perkins) không có trong `ENGINE_BRANDS`.
