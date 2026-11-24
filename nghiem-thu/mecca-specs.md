# mecca-power: specs/ lệch cn/, merge-specs chạy hết (24/11/2026)

Nhánh `mecca-specs`, worktree `C:\Projects\GenSet Pro\wt-mecca-specs`, từ `origin/fix/cao-lai-83` (6775226f, chồng lên #1208, không sửa nhánh đó). PR NHÁP base `fix/cao-lai-83`, chưa merge, chưa đo top 30.

## Vì sao lệch (tệp, PR)
- `specs/mecca-power.json` có 97 trang, `cn/` chỉ 24 trang có tệp nguồn. `merge-specs` xoá tệp `sources/<id>/<n>.md` của trang không bảng nào được dùng (bảng trùng nguyên dòng bảng trang trước), nên 74 trang thiếu tệp không bao giờ được dựng lại bằng `tablesOf` mới (#1105 / #1110 dựng lại từ tệp nguồn).
- Từ lượt cào đầu (#105 28/10, #106 29/10) `specs/` đã có đủ 97 trang, `cn/` 15–24; 8 trang (n106, 109, 115, 118, 124, 149, 154, 184) giữ bảng CŨ (hai bảng con gộp một, 24 dòng thay vì 12 + 12). Bảng cũ khác dòng bảng đã tách của trang khác nên không còn bị coi là trùng → `merge-specs` coi là bảng mới, mở `sources/mecca-power/106.md` → ENOENT (tệp chưa từng có trong git: không PR nào xoá).
- Không phải lỗi của một PR; #1208 chỉ gặp khi chạy `merge-specs`.

## Đã làm (chỉ mecca-power)
- Tải lại 74 trang `specs/` thiếu tệp bằng `get` + `htmlToText` + `tablesOf` hiện tại (URL trong `specs/`, không đổi URL nào, không Firecrawl, không khoá), dựng lại bảng của 74 trang trong `specs/`. Nguồn n106 lấy lại (Accessed 2026-11-24); sau dựng lại 8 trang n106… trùng bảng của trang khác nên `merge-specs` bỏ, tệp lại bị xoá theo luật cũ (không tệp mới vào git).
- `merge-specs.mjs mecca-power` chạy hết: 841 dòng model.
- Bẫy khi chạy: bảng n159 (Yanmar, #1208 đã sửa header) nay trùng bảng n144; `merge-specs` giữ bản đứng trước nên bỏ n159 → `controllers[2]` (DEIF, `src: 159`) mất nguồn, `verify` báo lỗi. Đặt bảng n159 đứng trước n144 trong `specs/` (thứ tự mảng, nội dung không đổi) thì n159 còn được dùng, `cn/` giống HEAD.
- Test mới `suppliers/mecca-specs.test.mjs` (3 ca); sửa `cao-lai-83.test.mjs` bỏ cặp n159 khỏi PAGES (n159 là cặp bảng trùng, test dùng tablesOf của n144); ghi bẫy vào `suppliers/CLAUDE.md`.

## Đối chiếu (so từng bản ghi `fromSupplier`, `rec-diff.mjs` của crawl-dropped)
- cn trước ↔ sau: 1726 → 1726 bản ghi, thêm 0, mất 0, đổi nội dung 0, y nguyên 1726 (101 chỉ đổi chỉ số bảng / dòng).
- `git diff --stat`: `cn/mecca-power.json`, `specs/mecca-power.json`, `suppliers/cao-lai-83.test.mjs`, `suppliers/mecca-specs.test.mjs`, `suppliers/CLAUDE.md`; ngoài mecca = 0 tệp dữ liệu.
- Thay đổi ở `cn/`: nguồn n144 `accessedAt` 2026-10-28 → 2026-11-24 (tệp #1208 đã tải 24/11), n144 thêm hai dòng `quote` (tiêu đề cột nguyên văn, kiểm bởi verify), n159 `accessedAt` 24/11 + `quote` header mới; bảng cn đúng bảng `specs/` đã khử trùng.

## Kiểm
- `verify.mjs`: 436 hồ sơ, 0 lỗi (lượt thử đầu có 1 lỗi `src 159`, đã sửa như trên).
- `quality.mjs --check`: không chỉ số nào xấu đi.
- `spec-diff git:HEAD . --gate`: thoát 0; đảo vai 0 → 0; bản ghi 64.290 → 64.290. Số "khác 33 / chỉ cũ 68 / chỉ mới 68" là do spec-diff ghép theo vị trí bảng (specs đổi thứ tự / tách bảng), không phải khác nội dung: `rec-diff` theo nội dung ra 0.
- `node --test` mọi `suppliers/*.test.mjs`: 1786 / 1786 (trước 1783 + 3 mới). Lưu ý Node 20 trên Windows không mở rộng `*.test.mjs`: truyền danh sách tệp.

## NCC khác cùng kiểu lệch (liệt kê, KHÔNG sửa)
Quét 361 NCC có `cn/` và `specs/` / `datasheets/`: mô phỏng `merge-specs` (bộ lọc lấy nguyên từ tệp) ra trang được dùng mà thiếu tệp nguồn (sẽ chết ENOENT), và so `specs/` với `tablesOf` của tệp.

Chết ENOENT nếu chạy `merge-specs <id>` (cột: trang thiếu tệp):
| NCC | trang thiếu tệp |
|---|---|
| comappower | 112 |
| everllence | 109 |
| frs-shenyang | 118 |
| gtl-power | 107, 110, 116, 119 |
| linz-electric | 104 |
| mhi-china | 102 |
| nenjo-generator | 106, 109, 120, 125, 129, 143, 147, 151, 155 |
| pauway-tianjin | 110–114 |
| previa-ningde | 116, 117, 120, 123, 124, 126, 127 |
| rcg-power | 116, 117, 121, 127 |
| rise-power | 127 |
| victory-generator | 134 |
| world-power-fuzhou | 102, 105 |
| wudong-wuxi | 108 |
| yuchai | 112, 123 |
| zichai | 120, 123, 124, 125 |

`specs/` khác `tablesOf` của tệp nguồn (số trang khác / số trang có tệp), không ENOENT: baudouin 20/21, camda-generator 9/45, jet-power 4/33, koten-power 47/72, lees-power 2/21, powerpack 126/126, sanq-power 2/23, yongcai-elecmama 14/59. (`powerpack` 126/126 và `baudouin` 20/21 trông như khác cách dựng, chưa xem tay: có thể do các PR dựng tay trước đó; đo thêm trước khi sửa.)

Chưa chạy `merge-specs` thật cho các NCC trên (chỉ mô phỏng); chưa xét NCC ngoài `cn/` + `specs/`. Cách sửa mecca dùng được cho từng NCC (tải lại trang thiếu, dựng bảng, merge, so `rec-diff`), nhưng mỗi NCC phải đo riêng.

## Còn lại
- Chưa đo top 30 (PR đụng `cn/` → candidates, điều phối đo sau).
- `merge-specs` vẫn xoá tệp trang không dùng nên lần sau cào lại chỉ cần chạy `tablesOf` lại; tránh lệch lại: nên dựng lại `specs/` từ tệp nguồn và tải lại trang mất tệp mỗi khi đổi `tablesOf` (đề xuất, chưa làm).
