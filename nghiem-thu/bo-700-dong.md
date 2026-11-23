# Bỏ trần số dòng của tài liệu: nghiệm thu PR 1 (24/11/2026)

Nhánh `wt-bo-700-dong`, gốc `170207f7`. Đo trên MỌI hồ sơ của `suppliers/cn`, không lấy mẫu.
Bảng đầy đủ: `bo-700-dong-bdk.tsv` (80 nguồn 1001+ của 7 hồ sơ BĐK), `bo-700-dong-tran.tsv` (31 tài liệu chạm trần).

## Kết luận

- **Đã làm trong PR 1:** bỏ trần 250 (`crawl-datasheets.mjs sheetOf`) và trần 60 (`crawl-specs.mjs tablesOf`), thêm `no-line-cap.test.mjs`. Bộ test `suppliers` 1.610 / 1.610 đạt.
- **Chưa làm, chờ Khoa chọn:** trần 700 của `controllerSheet` vẫn nguyên. Bỏ nó làm hồ sơ `sices` gấp 7,4 lần, vượt ngưỡng dừng 3 lần của brief.
- **Không thêm bộ lọc rác:** phần bị cắt không có mục lục (0 dòng), không có bản dịch lặp (cả 17 tài liệu đều tiếng Anh). Phần lớn là nội dung thật.
- **Chưa đo:** ảnh hưởng tới Gợi ý cấu hình (`modelFacts`, `factsFor`, `ctlKinds`). Đó là việc của PR 2.

## Ba trần số dòng mỗi tài liệu (nhóm a)

| Trần | Nơi | Tài liệu chạm trần | Hồ sơ | Dòng bị mất | Trong PR 1 |
|---|---|---:|---:|---:|---|
| 700 | `maker-datasheets.mjs controllerSheet` | 17 / 80 | 4 | 28.416 | Giữ, chờ Khoa |
| 250 | `crawl-datasheets.mjs sheetOf` | 0 | 0 | 0 | Đã bỏ |
| 60 | `crawl-specs.mjs tablesOf` (tờ một model) | 14 | 5 | 329 | Đã bỏ |

Không tìm thấy trần số dòng nào khác trong `merge-specs`, `catalog-pdf`, `ocr-specs`, `controllers`, `discover`, `firecrawl`, `fetch-source`, `trait-source`.

Có 21 bảng khác lưu đúng 60 dòng nhưng không do trần: đọc lại nguồn không ra phần bị cắt. Riêng `aosif` 1052, 1108, 1109 mỗi tờ lệch 1 dòng so với `sheetOf` hiện tại, em chưa tìm nguyên nhân.

### 17 tài liệu BĐK bị cắt ở 700

| Hồ sơ | n | Tài liệu | Dòng lưu | Dòng đầy đủ | Bị cắt |
|---|---:|---|---:|---:|---:|
| sices | 1003 | GC315-GC400 | 700 | 9.026 | 8.326 |
| smartgen | 1005 | HGM9510N/HGM9530N | 700 | 3.343 | 2.643 |
| smartgen | 1011 | HGM9420N_HGM9420LT | 700 | 3.271 | 2.571 |
| smartgen | 1003 | HGM9510 | 699 | 2.542 | 1.843 |
| smartgen | 1004 | HGM9530 | 699 | 2.415 | 1.716 |
| smartgen | 1006 | HGM9600 SERIES | 700 | 2.293 | 1.593 |
| datakom | 1001 | DKG-309 User Manual | 700 | 2.244 | 1.544 |
| smartgen | 1008 | HGM7200 SERIES | 700 | 2.175 | 1.475 |
| datakom | 1002 | DKG-307 User Manual | 700 | 2.051 | 1.351 |
| smartgen | 1007 | HGM7100N SERIES | 700 | 1.765 | 1.065 |
| deif | 1004 | AGC-4 Mk II | 700 | 1.589 | 889 |
| smartgen | 1009 | HGM4020T | 700 | 1.529 | 829 |
| smartgen | 1001 | HGM6100N SERIES | 700 | 1.509 | 809 |
| deif | 1001 | AGC 150 | 700 | 1.424 | 724 |
| smartgen | 1010 | HGM400 Series | 700 | 1.278 | 578 |
| smartgen | 1002 | HGM6100U SERIES | 700 | 1.099 | 399 |
| deif | 1002 | AGC 200 | 700 | 761 | 61 |

Phần bị cắt, phân loại thô theo từ khoá (mỗi dòng một nhóm, nhóm đầu khớp): có số 11.715; câu mô tả khác 9.490; bảo vệ / cảnh báo 2.862; tham số cấu hình 2.406; dòng lặp ≥ 3 lần 1.049; đấu dây 896; mục lục 0. Nhóm "dòng lặp" vẫn lẫn nội dung thật (nhãn cột, đơn vị) nên không lọc được theo số lần lặp.

**Deep Sea [1016] không bị trần 700 cắt.** Tệp nguồn chỉ là phần trích tay từ Operator Manual (ghi chú đầu tệp: "Chỉ lưu các mục liệt kê dưới đây"), 347 dòng sau lọc. Muốn đủ manual thì phải có bản Khoa tải, bỏ trần không giúp được.

## Phương án cho trần 700 (Khoa chọn)

| | Cách làm | `cn` thô | `cn` nén gzip | Hồ sơ lớn nhất tăng | Còn mất |
|---|---|---:|---:|---|---|
| Hiện tại | | 22,50 MB | 2,81 MB | | 28.416 dòng |
| **A (đề xuất)** | Giữ đủ trong `specTables` | 24,20 MB (+1,70) | 3,21 MB (+0,40) | sices × 7,4; datakom × 2,6; smartgen × 2,5 | 0 |
| B | Như A, trừ SICES 1003 | 23,55 MB (+1,05) | 3,05 MB (+0,24) | datakom × 2,6 | 8.326 dòng SICES |
| C | `specTables` giữ 700 dòng, bot đọc phần dài từ `sources/` lúc chạy (như `ratings.mjs`) | 22,51 MB (+0,01) | 2,81 MB | không đổi | 0 với bot; web không thấy phần dài |

- Đề xuất A: tổng tăng 1,70 MB, dưới ngưỡng 5 MB. Chỉ một hồ sơ nhỏ vượt ngưỡng 3 lần, và đó là manual thật, không phải rác. Không đổi kiến trúc.
- C đổi kiến trúc: phải sửa `modelFacts` và `ctl-module`, chưa ước lượng công.
- Thời gian CPU của `CAT.build`, đo xen kẽ 3 lượt trên máy đang bận: gốc 28,8 / 38,0 / 43,5 s; phương án A 28,8 / 31,5 / 33,6 s. Dao động giữa các lượt lớn hơn chênh lệch, nên **không thấy A chậm hơn, nhưng phép đo này không đủ để kết luận không chậm**. Số này đo bằng Node, không phải trong trình duyệt.

## Nhóm b: chỉ đo, không đổi (Khoa quyết)

- Dòng dài hơn 220 ký tự trong nguồn 1001+: 130 dòng ở 31 tài liệu, trong đó 69 dòng của BĐK. Bị bỏ ở `controllerSheet`, `makerSheet`, `sheetOf`.
- `--max 40` trang mỗi site (`crawl-specs`, `crawl-datasheets`, `controllers`): 24 hồ sơ có ≥ 40 trang nguồn 101–999, là dấu hiệu có thể đã chạm trần. Không biết số trang bị bỏ nếu không cào lại.
- Trần ký tự khác: `crawl-specs` bỏ dòng tờ thông số ≥ 200 ký tự; `controllers.mjs` bỏ dòng > 4.000 ký tự và rút câu trích > 300 ký tự còn khoảng 120 ký tự mỗi bên tên model (tệp nguồn vẫn đủ); `crawl-datasheets` bỏ tệp > 20 MB. Cắt tiêu đề ở 120–200 ký tự không làm mất dòng.

## PR 2 (chưa bắt đầu)

Chờ: Khoa chọn phương án, điều phối duyệt PR 1, hai phiên dữ liệu BĐK đã merge. Gồm gộp lại nguồn của trần 700 (theo phương án) và 14 tài liệu của trần 60.
