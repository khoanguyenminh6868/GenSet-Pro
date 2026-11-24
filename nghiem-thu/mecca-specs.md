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

---

# Đợt 2 (PR nháp `specs-dung-lai`, chồng lên `mecca-specs`): sửa gốc + 20 NCC

Nhánh `specs-dung-lai`, worktree `C:\Projects\GenSet Pro\wt-specs-dung-lai`, base `mecca-specs` (c9f8a3b7). PR NHÁP, chưa merge.

## Cách sửa gốc (chọn ít rủi ro, lý do)
- KHÔNG đổi luật xoá tệp nguồn của `merge-specs` (giữ tệp mọi trang `specs/` = hàng trăm MB nguồn vào git, đổi hành vi mọi NCC). Thêm `suppliers/rebuild-specs.mjs <id...> [--cache dir]`: mỗi trang `specs/` (n < 1000) thiếu tệp thì tải lại URL của trang (`get` + `htmlToText`, nghỉ 700 ms, không Firecrawl), dựng lại bảng bằng `tablesOf`, thay tại chỗ bảng khác `tablesOf`; lỗi tải một trang thì KHÔNG ghi gì cho NCC đó. Sau đó `merge-specs <id>` (tệp trang không dùng bị xoá như cũ).
- `merge-specs.mjs` nay báo rõ "trang N … chạy rebuild-specs.mjs <id>" thay vì ENOENT giữa chừng. Test mới `specs-drift.test.mjs` (mọi trang `merge-specs` dùng có tệp; `KNOWN` = zichai).
- Mỗi NCC: chụp `cn/` trước, chạy rebuild + merge-specs, so từng bản ghi `fromSupplier` bằng `rec-diff.mjs` (crawl-dropped). 

## Kết quả từng NCC (rec-diff cn trước → sau)
| NCC | trang tải lại | bản ghi | ghi chú |
|---|--:|---|---|
| comappower | 1 | 651 → 651, 0 / 0 / 0 | |
| everllence, mhi-china, yuchai | 1 / 1 / 3 | 0 → 0 | không bản ghi |
| linz-electric | 3 | 0 → 0 | |
| rise-power | 6 | 634 → 634, 0 đổi | 20 chỉ đổi chỉ số bảng |
| victory-generator | 27 | 675 → 675, 0 đổi | |
| wudong-wuxi | 2 | 136 → 136, 0 đổi | |
| world-power-fuzhou | 3 | 199 → 199, 0 đổi | 129 chỉ đổi chỉ số bảng |
| frs-shenyang | 6 (retry: 1 trang timeout lần đầu) | 225 → 225, 0 đổi | |
| gtl-power | 23 | 193 → 193, 0 đổi | |
| pauway-tianjin | 8 | 500 → 500, 0 đổi | |
| rcg-power | 8 | 1638 → 1638, 0 đổi | |
| camda-generator | 29 | 272 → 272, 0 đổi | 272 chỉ đổi chỉ số bảng / dòng |
| lees-power | 15 | 539 → 539, 0 đổi | |
| **nenjo-generator** | 44 | 696 → 696, **đổi 105** | 105 bản ghi n154 (engine, vd. 4Z2.3-G11 / HJ14SC) thêm `makes: SDEC (tên trang)`; chữ trang n154 có "上柴SDEC"; tệp n154 trước đó không có trong git |
| **previa-ningde** | 13 | 972 → 972, thêm 36 / mất 36 | cùng 36 model chuyển nguồn n128 → n108 (bảng trùng, giữ bản đứng trước) |
| **sanq-power** | 1 | 1366 → 1386, **thêm 20** | bảng dọc b21: KTA19-G2 / HCI444FS … (engine + alternator, kW rated), không có trong cn/ trước đó |
| **koten-power** | 67 | 500 → 510, **thêm 10** | b18 / b19: WP2.3D25E200 … WP2.3D58E201 (Weichai, KW20D5 …) |
| **yongcai-elecmama** | 14 | 212 → 212, **đổi 12** | n135 (QC380D, QC385D, QC480D, N485D …): mỗi bản ghi thêm 2 thông số engType, asp |

Đổi cn cần điều phối đo top 30: nenjo (105 bản ghi hãng SDEC), sanq (+20), koten (+10), yongcai (12 bản ghi thêm thông số), previa (36 bản ghi đổi số nguồn). 14 NCC còn lại 0 đổi nội dung.

## KHÔNG sửa (đã thử rồi hoàn tác, cần quyết định)
- **zichai**: merge thêm 11 bản ghi từ n120 (tuabin khí M32), n123–n125 (động cơ tàu tốc độ trung bình Z210 / N280 / N260): bảng còn sót trong `specs/` sau #851 (đã xoá bảng không phải máy phát khỏi cn/ + specs/ nhưng sót 4 trang). Đề xuất: xoá tay 4 bảng khỏi `specs/zichai.json` như #851 (nếu Khoa xác nhận không phải máy phát), rồi mới `rebuild-specs` + merge. `KNOWN` của `specs-drift.test.mjs` giữ zichai.
- **baudouin**: rebuild đổi 205 bản ghi (thêm 21, mất 2, đổi 74): n116, n120–n124 đã tách tay ở #971 (bẫy ghi trong suppliers/CLAUDE.md), rebuild chèn chồng. Không chạy.
- **jet-power**: rebuild thêm 14 bản ghi bảng dọc (KM178FG … JDE3500SE) và làm hỏng `s9-cc-129.test.mjs` (test khẳng định bảng n110 "không ghi mã / vai động cơ" không ra bản ghi). Hoàn tác.
- **powerpack**: rebuild bằng `tablesOf` làm 126 bản ghi → 0 (hồ sơ dựng bằng cách khác, chưa rõ). Hoàn tác, chưa tìm cách dựng.

## Kiểm (cả nhánh)
- verify 436 / 0 lỗi; quality --check không xấu đi; `spec-diff git:HEAD . --gate` thoát 0, đảo vai 0 → 0, bản ghi 64.290 → 64.334 (+44 = sanq 20 + koten 10 + jet 14 trước khi hoàn tác jet; số "khác 372 / cần soát tay 113" đo trước khi hoàn tác jet, gồm nenjo 105 + yongcai 12 + previa 36: chưa soát tay từng giá trị, chỉ so bản ghi bằng rec-diff).
- `node --test` (danh sách tệp): trước hoàn tác jet 1786 / 1787, ca hỏng s9-cc-129 (jet); sau hoàn tác jet các test liên quan qua (s9-cc-129, specs-drift, cao-lai-83, mecca-specs: 13 / 13). Chưa chạy lại toàn bộ sau hoàn tác jet.

## Kiểm cuối (nhánh `specs-dung-lai` sau hoàn tác jet-power; thay các số "Kiểm" ở trên)
- verify 436 / 0 lỗi; quality --check không xấu đi; `node --test` toàn bộ suppliers 1787 / 1787.
- `spec-diff git:c9f8a3b7 . --gate` (so với base `mecca-specs`): thoát 0; đảo vai 0 → 0; bản ghi 64.290 → 64.320 (+30 = sanq 20 + koten 10); "khác 368 / chỉ cũ 1.711 / chỉ mới 1.741" là do ghép theo vị trí bảng (nenjo / previa / yongcai đổi thứ tự bảng); "cần soát tay 93" CHƯA soát từng giá trị (các giá trị thêm của sanq / koten / yongcai). Đối chiếu nội dung dùng rec-diff từng NCC (bảng trên).
- Số 64.334 / 113 ở phần trên là trước khi hoàn tác jet-power.
