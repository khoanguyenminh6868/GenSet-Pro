# Bỏ trần 700 dòng: nghiệm thu PR 2 (24/11/2026)

Nhánh `wt-bo-700-dong-2`, gốc `c1c45d13`. PR nháp, chưa merge. **Dừng vì hết hạn mức sử dụng: CI chưa xem.**

## Kết quả

- Bỏ `.slice(0, 700)` ở `controllerSheet`, thêm test. Sinh lại từ `suppliers/sources/`, không tải lại.
- Thêm **31.991 dòng**: 19 tài liệu BĐK (31.662 dòng; 17 tài liệu cũ + SmartGen 1012, 1013 mới vào main) và 14 tài liệu trần 60 (329 dòng).
- So MỌI hồ sơ với gốc: 9 hồ sơ đổi, 0 lỗi. Bảng, tiêu đề, thứ tự và dòng cũ giữ nguyên, khoá ngoài `specTables` không đổi.
- `verify.mjs`: 436 bản ghi, 0 lỗi.

| Hồ sơ | Dòng cũ | Dòng mới | Thêm |
|---|---:|---:|---:|
| smartgen | 9.098 | 27.865 | 18.767 |
| sices | 1.745 | 10.071 | 8.326 |
| datakom | 1.475 | 4.370 | 2.895 |
| deif | 2.620 | 4.294 | 1.674 |
| endress-stromerzeuger | 2.065 | 2.163 | 98 |
| westinpower | 6.708 | 6.805 | 97 |
| supermaly | 383 | 452 | 69 |
| linz-electric | 114 | 162 | 48 |
| yongcai-elecmama | 1.460 | 1.477 | 17 |

`linz-electric`: `merge-specs` chết ENOENT (`specs/` có trang 104 không còn nguồn), nên nối thẳng vào đúng bảng của `cn/` bằng `noi-cn.mjs`.

## Đo

- `suppliers/cn`: 22,69 MB → 24,54 MB (+1,85); gzip 2,85 → 3,29 MB.
- CPU `CAT.build`, 5 lượt xen kẽ, Node, máy đang bận: trung vị gốc 35,7 s, sau 32,2 s. Dao động giữa các lượt (28–55 s) lớn hơn chênh lệch: không thấy chậm hơn, chưa đủ để kết luận không chậm.
- `modelFacts`: 4.074 khoá, không thêm, không mất khoá. 32 khoá `controller:*` thêm 37.569 dòng, 0 dòng mất.
- `spec-diff` (đo trên gốc `7d15b54c`, trước khi lên main mới): +24 bản ghi (supermaly 16, yongcai 8), 1 bản ghi thêm số: yongcai 4G33 `engPower` 30/1500, đúng dòng "Rated power" ngay dưới nó trong trang. Mã mới có trong nguồn; chưa soát từng giá trị của 24 bản ghi.
- `regress-config`: đạt, fixture không đổi.

## `ctlKinds`: phải sửa code để loại không đổi

Manual đủ dòng làm đổi 7 model nếu không sửa: HGM9510 / 9510N / 9530 / 9530N mất "sync"; HGM9500, HGM6500, AGC4 có thêm "sync".

- Dòng "refer to HGM9500 Synchronization Plan List" chỉ trỏ tới tài liệu khác, không nói model là loại gì: nay bỏ qua ở luật (a).
- AGC-4 / AGC-200 là nền tảng nhiều chế độ (test hiện có để trống): một dòng tính năng "island paralleling" không phải loại của nó, nên không nhận loại theo cả bảng ở luật (c).
- Sau sửa: code gốc + dữ liệu gốc so với code mới + dữ liệu mới, **0 / 65 model đổi loại**.

## Vì sao 3 tờ aosif lệch 1 dòng

Không do trần. `sheetOf` lọc nhãn bằng `C.specKey` của `catalog.js`, mà dữ liệu aosif sinh ngày 04/11, trước hai đổi:
- #779 (`9c390352`): "Lubrication oil consumption" hết là `oil` → 1108, 1109 còn lưu dòng mà `sheetOf` nay bỏ.
- #781 (`1767d79c`): "Charge Air Cooled", "Intercooled" thành `aircool` → 1052 thiếu dòng "Charge Air Cooled", 1108 / 1109 thiếu dòng "Intercooled".

PR này không đụng aosif.

## Chưa làm / cần điều phối xem

1. **CI của PR chưa xem.** Sau lần sửa `ctl-module` cuối chỉ chạy lại 41 test (`no-line-cap`, `ctl-amf`, `ctl-twin`, `ctl-module`, `regress-config`). Lần chạy đủ trước đó 1.613 / 1.613 đạt, trên bản còn lỗi DSE8660 đã sửa sau.
2. **146 dòng mới gắn cho model X mà chữ dòng chỉ nêu model khác** (`bo-700-dong-2-dong-khac-model.tsv`), vd. DKG307 nhận "Applicable only to the DKG-317 model:", AGC150 nhận danh sách tài liệu AGC-4. Chưa sửa, chưa soát từng dòng. Đây là rủi ro gán nhầm thông số cho Gợi ý, nên xem trước khi merge.
3. Chưa đo top 30 ứng viên trên lượt thật ngoài fixture `regress-config`.

Script: `genbid-work\dieu-phoi\dau-vao\bo-700-dong\` (`sinh-lai`, `noi-cn`, `soat-them`, `do-facts`, `do-kinds`, `do-muc`, `do-build`, `aosif-lech`, `aosif-bisect`).
