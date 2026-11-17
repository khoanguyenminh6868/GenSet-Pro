# Nghiệm thu: dòng Rehlko D440 / P158LE có thành ứng viên không (nhánh `cand-line`)

**Trạng thái: DỪNG sau Việc 1.** Không phải code lọc nhầm dòng hợp lệ → không sửa (theo brief). Chưa có commit, chưa có PR.
Worktree `C:\Projects\GenSet Pro\wt-cand-line` (nhánh `cand-line` từ origin/main 33362dd, chưa đổi tệp nào) để lại chờ quyết định.

## Cách đo (không agent, không post)
- Bản chụp cố định (scratchpad phiên này): `supplier.snap.json` md5 96a2e246…, `configmatch.snap.json` 4eea8008…, `analysis.snap.json` de927c12….
- Không có `genbid-work\specs\IB2600594596\` → chữ HSMT đọc bằng `hsmtTextOf` (GET `api/requests`, chỉ đọc), lưu `hsmt-<K>.json` trong scratchpad.
- `diag.mjs` (scratchpad) dựng lại đúng các bước của `prep()`: `sizesOf` → cap từng cỡ, `hintsOf`, `originOfHsmt`, `brandSyncOf`, `groupSuppliers`, `byOrigin`, `modelFacts`, rồi `candidates()` của code main hiện tại.

## Chẩn đoán IB2600594596, cỡ 400 kVA
- Xuất xứ `all`, HSMT đòi đồng bộ thương hiệu 2/3 ("Tổ máy phải được đồng bộ 02 trong 03 bộ phận chính…") → `open` → `grp = null` (NCC mọi nước được giữ, rehlko US không bị lọc xuất xứ).
- Dòng rehlko n 2003 (`fromLine`, động cơ P158LE hãng Doosan theo "tên trang", Prime 400 kVA, 50 Hz) **CÓ** trong danh sách tính điểm `all` (3.015 dòng), **qua mọi lọc** (near 95–140%, tần số, xuất xứ). Không bị giới hạn 4/NCC hay 3/động cơ (chưa tới lượt).
- Bị loại vì **điểm**: 165, đứng hạng 1.320/3.015; ngưỡng vào 30 dòng là 248 (dòng 30: wintpower YC6T600L-D22).
  - Điểm 165 = hãng động cơ 60 + có BĐK (APM403 trên trang NCC) 50 + 5 khoá thông số động cơ × 8 = 40 + tin cậy medium 15. Không có: đầu phát trong dòng (+40 + 3×khoá, dòng `fromLine` luôn `other: null`), BĐK có datasheet hãng (+40; APM403 không có datasheet), thêm khoá thông số.
  - Dòng hạng đầu (yongcai NTA855-G2A + HCI444E, DSE6120…) 284 điểm. Dù bù hết phần BĐK datasheet + 8 khoá thông số, rehlko chỉ ~229 < 248.
- `candidates()` **không có tiêu chí đồng bộ thương hiệu**: HSMT đòi 2/3 bộ phận cùng hãng tổ máy, nhưng 30 dòng ứng viên toàn là NCC Trung Quốc lắp ráp (23/30 là genset_oem CN, các cấu hình này về sau "Đồng bộ: không đạt").
- Lượt 05:05Z và 13:00Z: cấu hình D440/P158LE (05:05, hạng 1, 36 đạt/10 chưa rõ, đồng bộ: đạt) và QSG12-G4 (13:00, hạng 1, 28 đạt/4 không đạt, đồng bộ: đạt) đều có `engine.src.kind = "internet"` → **agent tự tìm ở bước 4 (internet)**, không phải từ catalog.md. Lượt 13:00 agent tìm ra tổ máy Cummins thay vì Rehlko: khác biệt là do agent (ngẫu nhiên ở bước tìm internet), code không loại gì. 300 kVA cũng vậy: NT855 G6 / C350 D5 (internet) ở cả hai lượt.
- Hệ quả: ở 05:05 cấu hình D440 có `suppliers[0]` = rehlko (agent gắn), không có `fromFind` → #538 `keepFound` không áp dụng (đúng như brief).

## Phạm vi
- Toàn danh mục: **17** dòng `fromLine` (dòng công suất không ghi động cơ, động cơ lấy từ productLines) của **6** NCC: fg-wilson 8, rehlko 5, cummins-inc 1, younes-bros 1, haut-power 1, caterpillar 1. Tất cả đều vào được `all` khi đúng cỡ/xuất xứ (17/17 có trong `CAT.build`). 10 nguồn productLine một động cơ khác KHÔNG thành dòng (6 nguồn không có bảng, 2 không ghi công suất, 2 công suất là khoảng).
- 12 gói / 14 cỡ của `configmatch.json`: dòng `fromLine` vào top 30 = **0/14 cỡ**. Cỡ có dòng `fromLine` ở 100–140% công suất (toàn danh mục): IB2600574589 400 (4 dòng), IB2600581294 500 (2), IB2600581977 250 (4), IB2600586587 160 (1), IB2600592658 500 (2), IB2600592684 500 (2), IB2600594596 300 (6) và 400 (4), IB2600595853 500 (2), IB2600602880 150 (2), IB2600603983 700 (2). Sau lọc xuất xứ (gói "all" không đồng bộ → chỉ NCC TQ; IB2600603983 g7eu scope parts → chỉ NCC TQ, đúng #509) chỉ còn haut-power (CN) và, ở 3 gói có đồng bộ, dòng của NCC nước ngoài; điểm 42–349, hạng 737–2.843, ngưỡng top 30 là 205–721.
- 3/12 gói đòi đồng bộ thương hiệu (IB2600581294, IB2600581977, IB2600594596): dòng của genset_oem ngoài TQ (rehlko, cgm-italia, cummins-inc, fg-wilson) có 83–93 dòng / 3–4 NCC mỗi cỡ, **0 dòng vào top 30**; tốt nhất hạng 737 (rehlko P126TI-II, 250 kVA) đến 1.320 (rehlko P158LE, 400 kVA).

## Phương án (cần Khoa / điều phối chọn — đều là đổi quy tắc xếp ứng viên)
1. **Giữ chỗ khi HSMT đòi đồng bộ** (giống `CN_ROWS` #418 / `MAKE_ROWS` #524): khi `brandSyncOf` có, `candidates()` giữ N dòng (vd. 6–8) cho NCC `genset_oem` có `familyOf` (hãng tổ máy thật, không phải xưởng TQ mang tên hãng ngoại), mỗi NCC tối đa 2–3 động cơ, cỡ sát trước. Ước tính: IB2600594596 400 sẽ có rehlko P158LE + cgm-italia; 300 có rehlko P126TI-II, fg-wilson 1506A, cummins-inc QSL9-G5. Rủi ro: cgm-italia (IT) là nhà lắp ráp đa hãng, cần quy tắc như `syncCheck` (hãng tổ máy = NCC không phải distributor, tên là hãng) để không chiếm chỗ.
2. **Cộng điểm đồng bộ** (vd. +300 cho dòng hãng tổ máy khi HSMT đòi đồng bộ, ngang "hãng HSMT nêu"). Đơn giản hơn nhưng đổi thứ tự toàn bảng.
3. **Bổ sung dữ liệu dòng `fromLine`**: lấy đầu phát / BĐK / thông số khác từ cùng nguồn một model (datasheet D440 ghi đầu phát, APM403) → điểm tăng ~+60–100 nhưng vẫn khó qua 248; không giải quyết gốc.
4. **Giữ cấu hình agent tìm internet của lượt trước** (mở rộng #538 cho `src.kind = internet` khi đồng bộ đạt): đúng ý "nên giữ lại" nhất, nhưng check cũ trích `web/N.txt` không còn → met hạ thành chưa rõ (đã thấy ở #538), trừ khi lưu kèm trang.
5. Không đổi code xếp hạng, chỉ dặn agent ở bước 4 (prompt) ưu tiên hãng tổ máy có trong danh mục. Đã kiểm: catalog.md dựng lại (300 và 400 kVA) có **0 dòng nhắc rehlko / P158LE** (cả mục "Động cơ khác trong khoảng công suất", giới hạn 40) → agent không thấy dòng này, phương án 5 phải kèm đưa dòng hãng tổ máy vào catalog.md.

Đề xuất của em: 1 (giữ chỗ khi đồng bộ), có thể kèm 3 cho rehlko/fg-wilson.

## Lệnh / tệp đo (scratchpad `C:\Users\Khoa\AppData\Local\Temp\claude\d4c88f0a2fd88962\feb7ba6a-cc0a-47b8-811f-ce265f837bcf\scratchpad\`)
- `diag.mjs <wt> <key>` → `diag-<key>.json` (top, all, fromLine).
- `brk.mjs` (tách điểm), `g7.mjs` (IB2600603983 FG Wilson bị loại do scope parts → NCC TQ, đúng luật), `pl.mjs` / `pl2.mjs` (đếm productLine).

## Chưa kiểm
- Gói một cỡ dùng `capacity()` không có `hsmt.capacity` (không đọc doc hsmt) — có thể lệch nhẹ cap ở IB2600599817 (sizes rỗng).
- Test / verify chưa chạy vì không đổi code.

---
# PR A (Khoa duyệt phương án 1, 12/11): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/543 (DRAFT, nhánh `cand-line`, commit 80f8da7)

## Tệp đổi
- `suppliers/config-bot.mjs`: `gensetMakerOf` (tách từ Đồng bộ thương hiệu, check() dùng lại); `candidates(…, { sync })` giữ chỗ `SYNC_ROWS`=6, `SYNC_PER_SUPPLIER`=2; hàm `gap` đưa lên đầu (dùng chung với nhóm G7); `prep()` truyền `sync`; catalog.md ghi rõ dòng `fromLine`; `check()` nhận dòng `fromLine` là nguồn của đúng động cơ đó (`fromLineOf`, cả kiểm động cơ lẫn dòng nhà cung cấp).
- `suppliers/cand-sync.test.mjs`: 5 test mới.

## Cách giữ chỗ
- Chỉ khi `brandSyncOf(text)` có. Dòng của NCC `role = genset_oem` có `gensetMakerOf` (không distributor; tên/id là hãng theo `familyOf`; công ty CN mang tên hãng ngoại = null; cgm-italia = null), điểm > 0.
- Sắp: cỡ sát trước (bước 5%, như MAKE_ROWS) rồi điểm; mỗi hãng ≤ 2 động cơ; **chia lượt**: mỗi hãng một dòng trước, rồi dòng thứ hai. Lần đo đầu (không chia lượt) cả 6 chỗ rơi vào Jet-Power/Bobig/Wintpower (2 dòng mỗi hãng), Rehlko / FG Wilson / Cummins ở 300 kVA vẫn không vào → đã sửa.
- Đặt trước phần CN_ROWS; mọi lọc cũ giữ nguyên.
- Thêm (ngoài mô tả, cần để dòng `fromLine` dùng được): `check()` trước đây đánh động cơ "model không có trong nguồn" và NCC "dòng không ghi động cơ" khi cấu hình lấy dòng `fromLine` (cả cấu hình `mergeFind` tạo). Giờ nhận tên động cơ từ dòng sản phẩm của đúng nguồn đó; số liệu vẫn phải nằm trong dòng.

## Đo trước / sau (main 33362dd vs nhánh; bản chụp supplier md5 96a2e246…, không agent; `measure-A.txt` trong scratchpad)
- 10/10 cỡ không đòi đồng bộ (IB2600574589 400, IB2600586587 160, IB2600592658 500, IB2600592684 30 + 500, IB2600595853 500, IB2600599817, IB2600601812 100, IB2600602880 150, IB2600603983 700): 30 ứng viên y nguyên và md5 catalog.md y nguyên.
- IB2600594596 400 — VÀO: rehlko P158LE (fromLine, 165, giữ chỗ), fg-wilson 2206D-E13TAG3A (fromLine, 75, giữ chỗ), bobig-power NTA855-G3 (213, giữ chỗ), weichai-heavy-machinery WP13D405E200 (138, giữ chỗ), eastern-lion-fuan QSNT-G3 (269, thứ tự đổi). RA: eastern-lion-fuan YC6K500-D31, bobig-power WP13D405E200, jet-power WP13D405E200, acepow-fuan WP13D405E200, wintpower YC6T600L-D22 (248–261). Không dòng ra nào thuộc cấu hình đang chọn (QSG12-G4, TAD1355GE jet-power, YC6K520-D30 fdk-energy).
- IB2600594596 300 — VÀO: rehlko P126TI-II (fromLine), fg-wilson 1506A-E88TAG5 (fromLine), cummins-inc QSL9-G5 (fromLine), jet-power SC12E460D2 (giữ chỗ), dingbo 1506A-E88TAG5, uleengen 2206C-E13TAG2. RA: jet-power WP12D317E200, bobig-power 6LTAA9.5-G3, eastern-lion-fuan 6LTAA9.5-G3, dingbo YC6MK450-D30, uleengen YC6MJ500L-D21, wintpower YC6MJ480L-D20 (240–257). Không dòng ra nào thuộc cấu hình đang chọn.
- IB2600581977 250 — VÀO: rehlko P126TI-II (fromLine), cummins-inc QSL9-G5 (fromLine), wintpower NT855-GA, jet-power JET274K (giữ chỗ) + 4 dòng CN đổi thứ tự. RA: 8 dòng 205–269 (eastern-lion-fuan NT855-GA, bobig-power NTA855-G1A, fdk-energy NTA855-G1B, jet-power 6ETAA11.8-G22, eastern-lion-fuan YC6MJ480L-D20, wintpower WD145TAD30, fdk-energy YCA08350-D30, uleengen CA6DL2-30). Không dòng ra nào thuộc cấu hình đang chọn.
- IB2600581294 500 — VÀO: fg-wilson 2506A-E15TAG2 (fromLine), weichai-heavy-machinery WP13D510E311, wintpower WD269TAD43, saudi-diesel S6A3-PTAR (giữ chỗ) + 5 dòng CN. RA 9 dòng 245–256, trong đó **2 dòng thuộc cấu hình đang chọn**: dingbo YC6T660L-D20 và eastern-lion-fuan YC6T660L-D20 (cả 3 dòng YC6T660L-D20 ra khỏi top). Các cấu hình đó là xưởng lắp ráp (đồng bộ: không đạt).
- Phạm vi ngoài: dòng `fromLine` vào top 30 ở gói đồng bộ: 0 → 6 lượt-cỡ (P158LE, P126TI-II ×2, 1506A-E88TAG5, QSL9-G5 ×2, 2206D, 2506A).

## Test
- `node --test` (suppliers/): 285 pass, 0 fail (main 280 + 5 mới).
- `node suppliers/verify.mjs`: 433 bản ghi, 0 có lỗi.

## Rủi ro + quay lui
- saudi-diesel (SA) được `familyOf` đọc là SDEC → được giữ chỗ (cách đọc có sẵn, cũng ảnh hưởng Đồng bộ thương hiệu hiện nay).
- Hãng TQ (Jet-Power, Bobig, Wintpower, Weichai, Yuchai) vẫn là "hãng tổ máy" theo Đồng bộ thương hiệu → chiếm một phần 6 chỗ; theo đúng định nghĩa được giao.
- Dòng `fromLine` không có đầu phát / số liệu ngoài công suất → cấu hình agent dựng từ đó có nhiều "chưa rõ"; agent có thể lấy thêm từ trang internet như lượt 05:05.
- Quay lui: revert PR. Sau merge restart bot (GenBid-Bot.ps1 nạp một lần).

## Chưa kiểm
- Chưa chạy agent thật trên 3 gói đồng bộ (chưa biết agent có chọn dòng giữ chỗ không).

## Bổ sung #543 (điều phối 12/11): không đẩy ra dòng của cấu hình lượt trước — commit ab504b5
- `keepOf(result)`: tập NCC + khoá động cơ của mọi cấu hình (suppliers[] và engine.src catalog). `prep()` truyền `keep: keepOf(reqData.prevResult)`.
- `candidates(…, { sync, keep })`: sau khi chọn xong, dòng thuộc `keep` có trong danh sách khi KHÔNG giữ chỗ mà nay vắng → đưa lại, thay dòng điểm thấp nhất không được giữ chỗ và không thuộc `keep`. Không có lượt trước / không đồng bộ: như cũ.
- Test mới (cand-sync.test.mjs #6): dòng bị đẩy ra của cấu hình lượt trước trở lại, dòng giữ chỗ Rehlko vẫn còn, `keep` rỗng = như không truyền. `node --test`: 286 pass.
- Đo lại (keep = cấu hình hiện tại trong configmatch.json của cỡ đó; `measure-A2.txt`):
  - 10/10 cỡ không đồng bộ: top 30 + md5 catalog.md y nguyên.
  - IB2600581294 500: dòng của cấu hình đang chọn trong top trước 3 → sau 3 (dingbo / eastern-lion-fuan YC6T660L-D20 còn). Dòng ra thay thế: uleengen WP13D490E310 + S5L1D-C41 (257; không thuộc cấu hình đang chọn — WP13D490E310 đang chọn với jet-power / longkai / fdk / bobig), cùng 7 dòng ra như lần trước trừ 2 dòng YC6T660L-D20 kia.
  - IB2600581977 250: 2 → 2; IB2600594596 300: 4 → 4; 400: 2 → 2 (vào / ra như lần đo đầu).
