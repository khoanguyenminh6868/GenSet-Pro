# crawl-dropped: 1.661 dòng máy ngoài bảng (phiên con, 23/11/2026)

## Trạng thái
- Worktree `C:\Projects\GenSet Pro\wt-crawl-dropped`, nhánh `fix/crawl-dropped-rows` (chồng lên #1101 `fix/baifa-header-rows` f713a80f). Commit tạm a95b8ab5 (chưa push lúc ghi tệp này; xem cuối tệp để biết PR / SHA).
- Đã xong: sửa `tablesOf`, dựng lại 15 hồ sơ (cn/ + specs/), test `suppliers/crawl-dropped.test.mjs` (9 ca), bẫy trong `suppliers/CLAUDE.md`, verify 436 hồ sơ 0 lỗi, quality --check xanh, spec-diff --gate qua (đảo vai 0 → 0), `merge-specs` trên bản sao ra đúng từng byte 15 hồ sơ.
- PR DRAFT #1105 https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1105 (base `fix/baifa-header-rows`), SHA a95b8ab5f8eafcfc3ad4b32b93b02bc179ad2018. `node --test suppliers/*.test.mjs` 1.580 / 1.580 (chạy bằng Bash; PowerShell không mở rộng `*`). CHƯA đo top 30 (1.093 lượt) / row-flags; KHÔNG tự merge.
- Việc kế (Khoa quyết 23/11, điều phối giao): MỘT PR draft nhỏ riêng từ origin/main cho (1) không veto "prime = 0,8 × standby" khi đơn vị của CẢ prime lẫn standby lấy từ tiêu đề con của chính cột (3 bản ghi baifa đổi, không mở rộng sang tiêu đề phủ); (2) 39 bản ghi / 4 NCC mã đầu phát mang tiền tố hãng dưới cột hãng khác → "cần xác nhận hãng" (giữ dòng, hãng "?", why "mã … dưới cột …"; bảng tiền tố chỉ để PHÁT HIỆN, ghi rõ là hiểu biết chung, liệt kê đủ tiền tố; đo build() + bước chấm hãng đầu phát, liệt kê đủ 39 trước / sau). (3) dòng không có model tổ máy: được làm ứng viên, không đổi.
- Luật phiên con (Khoa 23/11): context > 40 % ghi tệp này + Sync; 50 % compact; nhắn điều phối ≤ 10 dòng, chỉ khi xong / cần quyết.

## Kết quả
- `tablesOf` cũ ↔ mới trên 3.983 tệp nguồn crawl: 0 bảng cũ đổi, 0 dòng mất; +66 bảng / 15 NCC (2 bảng "Single phase" lees n127 / n131 trùng nguyên dòng, không vào hồ sơ) → hồ sơ +64 bảng, +1.392 dòng.
- Bản ghi `fromSupplier`: 62.063 → 63.350 (+1.287), mất 0, đổi 19 (lees-power, chỉ thêm hãng Perkins mức "tên trang" vì dòng nay còn nằm ở bảng mới của trang n131 "Perkins Series"). Ghi chú bộ đọc không đổi.
- Trong 1.661: 1.201 vào bảng, 460 còn ngoài.

| NCC | trong 1.661 | vào bảng | còn ngoài | bảng thêm | dòng thêm | bản ghi thêm |
|---|--:|--:|--:|--:|--:|--:|
| awt-aiweite | 540 | 540 | 0 | 19 | 542 | 542 |
| longkai-power | 189 | 189 | 0 | 6 | 212 | 185 |
| previa-ningde | 158 | 158 | 0 | 5 | 168 | 158 |
| jianghao-genset | 113 | 113 | 0 | 11 | 113 | 113 |
| lees-power | 65 | 65 | 0 | 6 | 163 | 65 |
| walter-yangzhou | 48 | 48 | 0 | 4 | 48 | 48 |
| aosif | 29 | 29 | 0 | 1 | 29 | 29 |
| kangwo-guangdong | 22 | 22 | 0 | 2 | 22 | 22 |
| mecca-power | 13 | 13 | 0 | 3 | 24 | 13 |
| sanq-power | 31 | 8 | 23 | 1 | 8 | 8 |
| huayuan-weifang | 6 | 6 | 0 | 1 | 6 | 6 |
| camda-generator | 14 | 6 | 8 | 1 | 6 | 0 |
| taihai-taizhou | 11 | 3 | 8 | 1 | 4 | 4 |
| jet-power | 26 | 1 | 25 | 1 | 1 | 2 |
| shengfeng-fuan | 0 | – | – | 2 | 46 | 92 |
| 13 NCC khác | 396 | 0 | 396 | 0 | 0 | 0 |
| Tổng | 1.661 | 1.201 | 460 | 64 | 1.392 | 1.287 |

## 460 dòng còn ngoài
- 294 không phải bảng công suất tổ máy: shunfeng-changzhou 69, shangyan-jiangsu 60, victory-generator 50, nenjo-generator 45, wartsila 28, excel-power-ningde 16, green-power-generators 13, acepow-fuan 8, bobig-power 4, yihua-fujian 1.
- 82 tệp nguồn bị cắt (không dựng lại): conductorjasa 26, jet-power 25, sanq-power 23, camda-generator n155 8 (dòng phân đoạn không có "|").
- 84 để PR sau (đụng bảng đang có: khác số ô, bảng con nối liền trong một khối): baifa-power 70, taihai-taizhou n107 8, hnd-henan 6.

## Cần Khoa / điều phối biết
- Tách trong khối theo tiêu đề lặp (cần cho baifa) đổi 447 bảng / 66 NCC: có chỗ đang đọc SAI thật (acepow-fuan n109 dòng 60 Hz / 220 V dưới tiêu đề 50 Hz / 400 V; kaihua-genset n101 bốn bảng con dưới một tiêu đề) nhưng bản thử làm mất dòng (rcg-power, mecc-alte, tecgen). Đề xuất PR riêng, đo từng NCC.
- lees-power: 17 dòng "Single phase" vào danh mục mà không có thông số pha (catalog.js chỉ đọc pha từ cột).
- awt-aiweite "Dual-band 50/60HZ" (13 dòng) đọc thành 60 Hz.
- huayuan-weifang n113: 6 bản ghi không có công suất; camda n139: bảng chưa ra bản ghi.

## Tệp
- Script + kết quả: `dau-vao\crawl-dropped\` (measure / newtabs / rebuild / rec-diff / newrecs / account .mjs; account.txt, rest-blocks.txt, newtabs3.txt, newrecs.txt, recdiff-all.txt, specdiff.md).
