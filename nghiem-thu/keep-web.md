# Nghiệm thu: lưu trang internet + giữ cấu hình tìm trên internet (nhánh `keep-web`)

PR DRAFT: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/547 (commit 299b2f8, trên origin/main 66e65f0 — #543 đã gộp). Không tự merge.

## Tệp đổi
- `suppliers/config-bot.mjs`: `savePages`, `savedReader`, `savedSrc`, `catalogPageOf`, `restoreWeb`, `sizeTag`, hằng `WEB_KEEP`=2 / `WEB_PAGES`=12 / `WEB_MAX_BYTES`=2 MB, `CONFIG_WEB` (env `GENBID_CONFIG_WEB`, mặc định `C:\Projects\GenSet Pro\genbid-work\config-web`); `keepFound` thêm nhánh (4) internet; `answer()` truyền `readWeb: savedReader()` và gọi `savePages` sau keepFound; CLI `restore-web`.
- `suppliers/keep-web.test.mjs`: 7 test mới.

## Cách lưu (điều phối đã duyệt)
1. Trang của cấu hình được chọn (engine/alternator/genset/controller có `src.kind` internet): URL trùng `sources[].url` của bản ghi NCC, có `suppliers/sources/<id>/<n>.md` chứa câu trích → `src.saved = {supplierId, n}`. Không → chép `web/N.txt` (đã có dòng URL + Accessed) vào `config-web/<gói>/<cỡ>/<sha1(URL)[:12]>.txt`, `src.saved = "<gói>/<cỡ>/<tệp>"`. Giới hạn 12 trang/cỡ, 2 MB/trang; mỗi lượt xoá trang trong thư mục cỡ đó không còn cấu hình nào dùng. Supabase chỉ thêm `src.saved` + `webRank`.
2. Một URL có hai bản trong danh mục (Rehlko d440-0525.pdf: n 2003 và 2008, tách cột khác nhau) → chọn bản có câu trích (`catalogPageOf`). Khi lưu, bản danh mục chỉ dùng nếu chứa câu trích; không thì chép bản của lượt chạy.

## Giữ cấu hình (keepFound nhánh 4)
- Lượt trước có cấu hình nguồn internet, `webRank` (không có thì `rank`) ≤ 3, lượt mới không có cấu hình cùng động cơ (+ đầu phát) → giữ, tối đa 2/cỡ theo webRank; `keptWeb`, `webRank` giữ nguyên qua các lượt (lượt sau nữa vẫn giữ, không nhân đôi).
- `src.file` đổi thành `saved:<…>` hoặc `catalog:<id>/<n>`; `check()` kiểm lại toàn bộ với yêu cầu lượt này, đọc trang qua `savedReader` (chỉ trong config-web và suppliers/sources, chặn `..`). Không có trang → "chưa rõ" như cũ.
- Không cần NCC (điều phối duyệt). NCC cũ không còn dòng → gắn NCC có trang nguồn (`src.saved.supplierId`) và dòng bảng cùng động cơ (kể cả dòng fromLine), qua `entryFor` (xuất xứ / nhóm / VN).
- Yêu cầu khác lượt trước → `gaps` + câu trong notes. Một dòng notes "Giữ lại cấu hình tìm trên internet ở lượt trước…" (không trích nguồn).

## Đo (bản chụp supplier 96a2e246…, configmatch 4eea8008…; không agent, không post)
- `restore-web` IB2600594596, hiện tại = bản 13:00Z, cũ = 05:05Z (`configmatch-before-run.json`):
  - máy 300 kVA: không có gì để khôi phục (NT855 G6 vẫn có trong bản hiện tại).
  - máy 400 kVA: 3 → 4 cấu hình; **#1 P158LE / D440** (nguồn catalog:rehlko/2008 động cơ, /2010 đầu phát + tổ máy, /2009 bộ điều khiển), **35 đạt / 11 chưa rõ** (05:05Z: 36 / 10; dòng đổi duy nhất: "Đo lường, hiển thị" đạt → chưa rõ), NCC rehlko (dòng 2003 fromLine), Đồng bộ thương hiệu: đạt.
  - Tệp kết quả xem trước: `C:/Users/Khoa/AppData/Local/Temp/claude/d4c88f0a2fd88962/feb7ba6a-cc0a-47b8-811f-ce265f837bcf/scratchpad/restore-IB2600594596.json`.
- 12 gói (coi bản hiện tại là lượt trước, lượt mới không chọn lại cấu hình internet nào; `kw.mjs`): 7 cấu hình internet, 6 hạng 1–3, 6 được giữ (IB2600592658 / IB2600595853 QSZ13-G3 depco-power, IB2600594596 NT855 G6 + QSG12-G4, IB2600601812 HY6B135Z D20 + HY6813Z). 6/22 trang có trong danh mục (depco-power). Trang chưa từng được lưu (tất cả lượt trước PR này) → đạt 97 → 15, chưa rõ 84 → 148 — đúng luật "không trang thì chưa rõ"; từ lượt đầu sau PR, `savePages` lưu trang nên lượt sau đối chiếu được.

## Cách khôi phục IB2600594596 (đề xuất, không tự ghi web)
Lưu ý: điều phối báo đã gửi Gợi ý lại thật cho gói này bằng code main → configmatch trên web đã khác bản 13:00Z. Sau khi PR này gộp (bot đã restart):
1. `node suppliers/config-bot.mjs restore-web --key IB2600594596 --from "C:\Users\Khoa\AppData\Local\Temp\claude\d4c88f0a2fd88962\6cffcdc4-9fb5-428b-a53e-b5ba2e8452f8\scratchpad\configmatch-before-run.json" --origin all --out <tệp>` (bản hiện tại đọc từ web, chỉ GET). Xem dòng in ra.
2. Nếu đúng: gửi `<tệp>` lên `configmatch/IB2600594596` bằng `post([{ coll: "configmatch", id, data: { at: now, result } }])` (điều phối chạy).
3. Cách khác: bấm Gợi ý lại khi bản 05:05Z là lượt trước — không làm được vì lượt trước giờ là bản mới.

## Test
- `node --test` (suppliers/): 293 pass, 0 fail (main 286 + 7).
- `node suppliers/verify.mjs`: 433 bản ghi, 0 có lỗi.

## Rủi ro + quay lui
- Cấu hình giữ lại mà trang chưa lưu (các lượt trước PR) gần như toàn "chưa rõ" nhưng vẫn có thể đứng hạng 1 trên cấu hình có "không đạt" (luật xếp hạng hiện có; vd IB2600594596 400 kVA QSG12-G4 nếu lượt mới không chọn lại).
- `restore-web` cần `--origin` / configreq vì kết quả lưu không ghi origin (`originOfReq(undefined)` = "cn" sẽ loại NCC ngoài TQ); lượt bot thật truyền `info.origin` nên không bị.
- Dung lượng: ≤ 12 × 2 MB / cỡ / gói trong config-web, dọn theo lượt.
- Quay lui: revert PR, xoá `genbid-work\config-web`. Sau merge restart bot.

## Chưa kiểm
- Chưa chạy `answer()` thật (cần agent): đường `savePages` trong lượt thật chỉ kiểm bằng hàm thuần + test.
- `restore-web` chưa chạy với bản configmatch mới trên web (chỉ bản chụp).

## Bổ sung (điều phối 12/11): chỉ giữ khi trang động cơ đọc lại được — commit ba9b0c1
- `keepFound` nhánh internet: sau `savedSrc`, nếu `engine.src` là internet mà `savedReader` không đọc được → không giữ, ghi `dropped` "trang nguồn của động cơ không còn bản lưu", không thêm notes. Trang đầu phát / BĐK / tổ máy thiếu vẫn giữ, các dòng đó chưa rõ (đầu phần đó `unverified`).
- Test sửa / thêm (keep-web.test.mjs #5, #6): không trang động cơ → 0 cấu hình, không notes, có dropped; chỉ thiếu trang tổ máy → giữ, tổ máy unverified, động cơ không. `node --test`: 293 pass.
- Đo lại 12 gói (`kw.mjs`): 6 cấu hình internet hạng 1–3 → **chỉ 2 được giữ**: IB2600592658 và IB2600595853 QSZ13-G3 (depco-power, trang trong danh mục catalog:depco-power/2001), đạt 7→7 / 6→6, chưa rõ 5→3 / 5→3. Bỏ 4: IB2600594596 NT855 G6 + QSG12-G4, IB2600601812 HY6B135Z D20 + HY6813Z (trang chưa từng lưu).
- `restore-web` IB2600594596 (bản chụp): không đổi — D440 / P158LE hạng 1, 35 đạt / 11 chưa rõ, NCC rehlko (trang động cơ catalog:rehlko/2008 đọc được).
- Rủi ro "cấu hình toàn chưa rõ đứng trên cấu hình có không đạt" (mục Rủi ro ở trên) không còn với cấu hình trước PR; cấu hình có trang động cơ nhưng thiếu trang đầu phát / BĐK vẫn có thêm dòng chưa rõ.
