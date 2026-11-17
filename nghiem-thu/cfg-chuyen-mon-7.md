# Nghiệm thu PR 7: tờ Stamford Wdg.311 + tra định mức theo mã

- PR (DRAFT): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/515 (nhánh `cfg-ds2`, từ origin/main 2104171)
- Worktree: `C:\Projects\GenSet Pro\wt-cfg-ds`

## Tệp thay đổi
- `suppliers/config-bot.mjs`: thêm `ratingsFor(map, model)`; `check()` dùng nó cho `RT.eng` và `RT.alt`.
- `suppliers/ratings.test.mjs`: thêm 1 test (`ratingsFor`).
- `suppliers/cn/stamford-avk-china.json`: thêm nguồn 1019, 1020.
- `suppliers/datasheets/stamford-avk-china.json`: tạo lại bằng maker-datasheets (20 mục).
- `suppliers/sources/stamford-avk-china/1019.md`, `1020.md`: mới.

## Tải tờ (chỉ từ stamford-avk.com)
| Model trong danh mục | Tờ tìm được | Kết quả |
|---|---|---|
| S4L1D-C41 | A056E876-S4L1D-C4-F-W311.pdf, tiêu đề "S4L1D-C41 Wdg.311" | **Dùng** (nguồn 1019) |
| S4L1D-G41 | A056E881-S4L1D-G4-G-W311.pdf, tiêu đề "S4L1D-G4 Wdg.311" | Đã lưu (1020) nhưng **không gán**, vì tên khác |
| S6L1D-D41 / G41 / H41 | chỉ có tờ D4/G4/H4 (D4 Wdg.311/312 tên không khớp, không đọc được bảng; G4/H4 chỉ có Wdg.312) | Chưa có tờ, ghi lại |
| S7L1D-C41 | không có tờ Wdg.311 | Chưa có tờ, ghi lại |

Perkins và Cummins đuôi -G2: không làm gì thêm, như điều phối dặn.

## Lỗi tìm ra khi đo
Danh mục ghi tên đầu phát kèm hãng, ví dụ "Stamford S4L1D-C41" → `CAT.keyOf` = `STAMFORDS4L1DC41`, trong khi bảng định mức lưu theo `S4L1DC41`. Vì vậy dù đã có tờ, vẫn 0 dòng tính được.
Cách sửa `ratingsFor`: tra đúng tên như ghi; nếu không thấy thì bỏ các chữ **đứng trước** mà không phải mã model (tên hãng) rồi tra lại **đúng mã đó**. Không khớp tên gần giống (test: "Stamford S4L1D-G41" không ra tờ S4L1D-G4).

## Lệnh + kết quả thật
```
node --test suppliers/*.test.mjs        → # tests 193  # pass 193  # fail 0
node suppliers/verify.mjs               → 432 bản ghi, 0 có lỗi
md5 catalog build                       → 2fa354dbfc6c7497efef869150a9aea1 (không đổi)
node measure8.mjs <wt-cfg-ds> after9    → {"cat":{"missing":28999,"ok":3,"unsure":1},"catKva":{"any":428,"any/nhãn":417,"below/nhãn":26,"below":12},"cfg":{"missing":57},...}
```

## Chỉ số trước / sau (đo thật, toàn danh mục 29 003 dòng động cơ)
| | Trước | Sau |
|---|---|---|
| Dòng tính được cân bằng công suất | 0 | **4** (3 đạt, 1 chưa kết luận, 0 cảnh báo) |
| Dòng (có đầu phát) tra được định mức có nhãn cột | 1 142 | 1 332 |
| Dòng có kVA đầu phát đọc kèm nhãn (any/nhãn) | 307 | 417 |
| Câu hỏi kVA đầu phát (below/nhãn) | 26 | 26 (không đổi) |
| 12 gói configmatch | 57 missing | 57 missing (không đổi) |

## Bảng mọi ca (để đối chiếu tay)
Công thức `kwe_from_kwm`: kWe = kWm × hiệu suất. kWm là **Net engine output, Prime** trên tờ Cummins của hãng (cummins-inc/2013, 6LTAA9.5-G3). Thứ tự cột trên tờ: Gross S/P/B, Net S/P/B.

| # | Trạng thái | Dòng tổ máy (fdk-energy) | kWm (dòng nguồn) | Hiệu suất (dòng nguồn) | Kết quả |
|---|---|---|---|---|---|
| 1 | Đạt | n103 (fdkenergy.com/diesel-generator-set-9-3250kva/): `\| CD310V2-H2 (60Hz) CONTACT \| 313KVA/ 250KW \| 275KVA/ 220KW \| 6LTAA9.5-G3 \| Cummins (China Dongfeng) \| Stamford S4L1D-C41 \| Click Here \|` | 60 Hz/1800: `290/389 265/355 212/284 276/370 254/341 201/269 …` → net prime **254** | stamford-avk-china/1019, khối 60 Hz: `\| Efficiency (%) \| 91.7 \| 91.4 \| 91.7 \| 91.8 \| 91.9 \| 91.7 \| 91.9 \| 91.9 \| 92.1 \| 92.1 \| 92.2 \| 92.3 \| 92.5 \| 92.5 \| 92.6 \| 92.7` → Cont. H (cột 9–12) + Cont. F (13–16) = **92,1–92,7%**, 416–480 V | 233,9–235,5 kWe ≥ 220 kWe prime |
| 2 | Đạt | n106 (…/cd-series-cummins-60hz/): `\| CD310V2-H2 CONTACT \| 313KVA/ 250KW \| 275KVA/ 220KW \| 6LTAA9.5-G3 \| Cummins (DCEC CHINA) \| Stamford S4L1D-C41 \| Click Here` (60 Hz) | như #1 | như #1 | như #1 |
| 3 | Đạt | n109 (…/diesel-generator-set-60hz/): cùng dòng như #2 (60 Hz) | như #1 | như #1 | như #1 |
| 4 | Chưa kết luận | n108 (…/diesel-generator-set-50hz/): `\| CD313/H1 CONTACT \| 313KVA/ 250KW \| 275KVA/ 220KW \| 6LTAA9.5-G3 \| Cummins (China Dongfeng) \| Stamford S4L1D-D41 \| Click Here \|` (50 Hz) | 50 Hz/1500: `280/375 250/335 200/268 263/353 236/316 186/249 …` → net prime **236** | gfe-power/1030 (S4L1D-D41 Wdg.311), khối 50 Hz: `\| Efficiency (%) \| 92.1 \| 92.3 \| 92.6 \| 93.2 \| 92.3 92.5 \| 92.7 \| 93.3 \| 92.7 \| 92.9 \| 93.1 \| 93.6 \| 93.1 \| 93.3 \| 93.4 \| 93.8` → Cont. H 92,7–93,6 + Cont. F 93,1–93,8 = **92,7–93,8%**, 380–440 V | 218,8–221,4 kWe so với 220 kWe: chưa kết luận |

Tính tay: 254×0,921 = 233,93; 254×0,927 = 235,46; 236×0,927 = 218,77; 236×0,938 = 221,37. Khớp kết quả code.

## 3 mẫu đối chiếu
1. Ca #1: kWm 254 = cột thứ 5 (Net Prime) dòng 60 Hz của cummins-inc/2013; hiệu suất 92,1–92,7 = 8 cột Cont. ở dòng Efficiency 60 Hz của 1019. Đúng.
2. Ca #4: kWm 236 = Net Prime 50 Hz; hiệu suất 92,7–93,8 = 8 cột Cont. 50 Hz của gfe-power/1030. Đúng.
3. `ratingsFor(m, "Stamford S4L1D-G41")` → 0 (không gán S4L1D-G4). Test pass.

## Rủi ro + cách quay lại
- Hiệu suất S4L1D-D41 (ca #4) lấy từ bản tờ Stamford đã lưu của gfe-power, URL cdn.shopify.com (có sẵn từ trước, tier A). Không phải tải trong PR này. Không có miền stamford-avk.com. Ca này "chưa kết luận" nên không sinh cảnh báo.
- Ô `92.3 92.5` bị dính trong bảng của gfe-power/1030 vẫn ra đủ 16 số đúng thứ tự (đã đối chiếu tay ở trên).
- `ratingsFor` cũng được dùng cho định mức động cơ (`RT.eng`). Hiện các khóa động cơ trong danh mục không có tiền tố hãng, nên không đổi.
- Quay lại: revert PR #515. Không có thay đổi web/index.html, bidprice, genbid-hsmt.

## Chưa kiểm
- Không chạy agent thật trên gói thật. Tiến trình `config-bot.mjs run` đang chạy vẫn giữ code cũ cho đến khi restart.
- Chưa có tờ đúng tên cho S6L1D-D41/G41/H41, S7L1D-C41, S4L1D-G41. Các dòng KTA50-G3, QST30-G3, KTA38-G3, QSK50-G3, QSZ13-G5 với các đầu phát này vẫn chưa tính được.
