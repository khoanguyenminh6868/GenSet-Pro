# Nghiệm thu: "tra một lần, dùng lại cho mọi gói" (web-memo) — PR #558 (nháp)

Nhánh `web-memo`, worktree `C:\Projects\GenSet Pro\wt-web-memo`, rebase trên origin/main 12/11. Điều phối chọn phương án B.

## Số đo trước khi làm (dữ liệu có sẵn, không chạy agent)

- 6 log lượt trong `%TEMP%` (IB2600581977, 586587, 592684-1/-2, 594596-1/-2): chỉ **1 lượt** (594596-2) tra mạng: 2 WebSearch, 2 lệnh curl tới 11 URL `powersystems.rehlko.com/.../d440-*.pdf` (đều 403; lần 2 thêm `-A "Mozilla/5.0"` bị classifier chặn "Bot Check Circumvention"), 2 lệnh save: `cdn.shopify.com/.../D440.pdf` (bên bán) và `tech-expo.ru/.../P158LE_1.pdf` (bên bán).
- Chi phí: lượt không tra 2,13 USD / 20 lượt hội thoại; lượt có tra 2,49 USD / 38 lượt → phần tra ≈ 0,35 USD. Phần lớn chi phí không phải tra mạng.
- doc-cache configmatch: 12 gói, 14 kết quả, 54 cấu hình, 5 cấu hình nguồn internet (156/1794 check); tên miền depcogenerator.com, cdn.shopify.com, hyundaipowerequipment.co.uk, micksgonebush.com.au, wintpower.com. Chỉ phần tổ máy DPK-DC-550 (Depco) là trang chính hãng, và đã có trong danh mục từ PR #221 → bộ nhớ dương mới tiết kiệm ≈ 0 lượt tra.

## Đường dương hiện có (newCatalog → addToCatalog → PR) có làm rơi gì không

- PR danh mục tự merge sau ~1,5 phút (#221, #426, #429, #516, #548 đều merged; bản ghi còn được post lên web ngay khi lượt xong) → **không có độ trễ đáng kể**; "lần sau vẫn tra lại" D440 là do dòng D440 không lọt 30 ứng viên (đã sửa #543), không phải do chờ PR.
- Lượt 594596-2: trang `web/1.txt` (D440, cdn.shopify) vào newCatalog → rehlko n 2010 và 2011 (**cùng một URL, nạp hai lần**); trang `web/2.txt` (P158LE, tech-expo.ru) **không vào newCatalog** → số liệu động cơ P158LE trích từ đó chỉ còn trong config-web của gói (PR #547), gói khác không dùng được (trang bên bán, theo điều kiện (a) vốn cũng không nạp).
- Trùng nguồn: rehlko có d440-0525.pdf ở n 2003 và 2008, d330-0525.pdf ở 2001 và 2004, D440 shopify ở 2010 và 2011 — `catalogRecords` không khử trùng theo URL. Chưa sửa (ngoài phạm vi); đề xuất PR sau.

## Danh mục: nguồn không chính thức (đo bằng `isOfficial` mới, `suppliers/cn` của nhánh)

- 4.681 nguồn (A 4.623, B 32, C 26); 547 không chính thức theo tên miền; trong đó **tier C không chính thức 20**: kachai-hangzhou 11 (made-in-china.com), rehlko 2 (cdn.shopify D440), weichai-power 2, cummins-dealer-weifang-yidaneng-power 1, jichai 1, lance-power 1, perfect-house 1, previa-ningde 1.
- Số liệu theo model (`modelFacts`, 11.005 cặp model × khoá): **0** cặp dựa duy nhất vào nguồn tier C không chính thức; 592 cặp dựa duy nhất vào nguồn không chính thức (mọi tier).
- Bẫy của quy tắc tên miền: 527 nguồn tier A/B "không chính thức" phần lớn là PDF của chính hãng đặt trên CDN riêng (lees-power `*.ldycdn.com` 197, longkai-power `*.micyjz.com` 162, gfe-power `cdn.shopify.com` 37, koten-power `img.35cloud.cn` 34…). Vì vậy cờ chỉ được **in** cho số liệu tìm trên internet (n 2001–2999: 94 nguồn, 80 chính thức, 14 không), chưa dùng để cân nguồn. Muốn dùng cờ để cân nguồn thì phải thêm cách nhận CDN của hãng (link từ trang hãng) — cần quyết riêng.

## Tệp đổi

- `suppliers/web-memo.mjs` (mới): `traceOf` (đọc log stream-json "[Ns] {json}": câu WebSearch, URL WebFetch, URL trong lệnh Bash kể cả vòng `for x in …`, mã HTTP in ra, `save` → web/N.txt hay "HTTP 403"; lệnh bị từ chối không tính), `domainOf` / `officialDomains` / `isOfficial` / `officialForMake` / `officialOfSource`, kho âm `loadNeg` / `saveNeg` / `recordNegatives` / `forget` / `negativesFor` / `negativesMd`, CLI.
- `suppliers/config-bot.mjs`: `runModels(top)`, `recordSearched(result, …)`; `prep` thêm mục âm vào catalog.md + ghi `models.json`; `answer()` gọi `recordSearched` ngay sau `checkDir` (bọc try, lỗi chỉ in log); `catalogRecords` ghi `official` cho nguồn mới; `catalogMd` thêm hậu tố "(tìm trên internet, trang chính hãng / trang không phải của hãng)" cho số liệu n 2001–2999. **Không đụng `candidates()`.**
- `suppliers/config-prompt.md`: bước 4 thêm: 401/403/429 = bị chặn, không thử lại, không đổi User-Agent / header, không dùng công cụ khác, cache, kho lưu trữ, bản sao ở trang khác để lấy cùng tệp; đọc mục "Đã tra trên mạng ở lượt trước"; khai `searched[]`. Lược đồ result.json thêm `searched`. (Trước PR này prompt **chưa** cấm rõ việc đổi User-Agent — lượt 594596-2 đã thử, bị classifier chặn.)
- `suppliers/schema.json`: thêm `official` (boolean, code ghi) vào nguồn.
- `suppliers/web-memo.test.mjs` (mới, 10 test).

## Cách làm của kho âm

- Agent khai `searched: [{ part, model, make, what: "datasheet"|khoá thông số, where: [URL | câu tìm], outcome: "not_found"|"blocked", note }]`.
- Code ghi khi: part/outcome hợp lệ; model là model của lượt (catalog.md hoặc cấu hình trả về) so đúng `CAT.keyOf`; **mọi** `where` có trong dấu vết log; `blocked` cần ít nhất một URL có mã 401/403/429; `not_found` của `datasheet` bị từ chối nếu một URL trong `where` đã save được. Không dấu vết → không ghi (in lý do ở log bot).
- Khoá (part, model key, what), mục mới thay mục cũ cùng khoá. `datasheet` phủ mọi thông số của model trên các tên miền đã tra, không phủ tên miền khác (in rõ trong catalog.md). Mục có `official` (URL thuộc tên miền hãng của make agent khai).
- Kho: `C:\Projects\GenSet Pro\genbid-work\web-memo\negative.json` (ngoài git; `GENBID_WEB_MEMO` đổi chỗ). Hết hạn 90 ngày (`NEG_DAYS`), ≤ 2000 mục (`NEG_MAX`), ≤ 1 MB; mục cũ nhất bị bỏ trước.
- CLI: `node suppliers/web-memo.mjs --list [--json]` (chỉ đọc: số mục còn hạn, không thấy / bị chặn, số model, mục hết hạn; và đếm nguồn internet n 2001–2999 chính thức / không), `node suppliers/web-memo.mjs --forget <model>`.
- Sao lưu / chuyển máy: chép thư mục `genbid-work\web-memo\` (một tệp JSON) sang máy mới; mất kho chỉ tốn tiền tra lại, không sai dữ liệu. Bot không commit git.

## Kiểm đã chạy

- `node --test` trong `suppliers/`: **316/316** (main hiện 306 sau rebase + 10 mới). `node suppliers/verify.mjs`: 433 bản ghi, 0 lỗi.
- Test mới: traceOf (vòng curl 403, lệnh bị từ chối không tính, save, WebFetch), tên miền chính thức (rehlko.com, origin-sea.rehlko.com tier A, cdn.shopify không, hãng khác không, co.jp / com.cn), `catalogRecords` ghi `official` bất kể tier agent khai, catalog.md in "trang chính hãng / không phải của hãng" và số liệu vẫn dùng như cũ, ghi âm có / không dấu vết, model không khớp đúng ký tự (D44 ≠ D440; "d-440" = D440 theo keyOf), blocked không có 403, hết hạn 90 ngày + giới hạn kho + forget, catalog.md in đúng 2 loại câu, `recordSearched` gỡ `searched` khỏi kết quả, `runModels`, số liệu tìm trên internet đã vào danh mục được `check()` đọc lại qua factSrc (đạt).
- Chạy thử trên log thật 594596-2 với khai báo giả định (D440 datasheet, 11 URL rehlko, blocked): ghi 1 mục, `official: true`, catalog.md in "trang hãng chặn tải tự động … KHÔNG thử lại, không đổi User-Agent, không tìm bản sao để lách".

## Rủi ro

- Agent có thể không khai `searched` → kho rỗng, không hại.
- Agent khai "không tìm thấy" sau khi mở trang nhưng không đọc kỹ: code chỉ biết đã mở URL, không biết đã đọc hết → một thông số có thật có thể bị bỏ qua 90 ngày (sai lệch chỉ là "chưa rõ", không thành đạt/không đạt). Xoá bằng `--forget`.
- Dấu vết curl: mã HTTP chỉ đọc được khi lệnh in ra (`-w "%{http_code}"`, dạng "<giá trị> <mã>" trong vòng lặp); lệnh khác dạng → URL có trong vết nhưng status null → `blocked` bị từ chối (an toàn).
- Thêm mục catalog.md làm catalog.md dài hơn chút khi có mục âm; số liệu internet có thêm hậu tố — gói không có số liệu n 2001–2999 không đổi.

## Quay lui

Revert PR #558. Kho `genbid-work\web-memo\` có thể xoá tay; cờ `official` trong bản ghi NCC mới thừa nhưng vô hại (verify.mjs không đọc).

## Chưa kiểm (cần lượt agent thật)

- Agent có khai `searched` đúng dạng, và có tuân "đừng tra lại" / không thử lại khi bị chặn.
- Bot đang chạy giữ code cũ: sau merge phải restart task bot để `answer()` dùng code mới.

---

# Bổ sung 12/11: `what: "source"` — nhánh `wt-memo-what` (PR nháp)

- Log IB2600601812 (`traceOf`): 2 WebSearch ("hyundai dhy110kse diesel generator 100kva datasheet engine alternator"; "hyundai diesel generator dhy series manufacturer china factory oem …made in china"), 0 URL fetch. Agent tìm nguồn / NCC (đặt ở Trung Quốc) bán tổ máy Hyundai DHY110KSE mà HSMT nêu; không thấy → không khai `searched` vì "không thuộc loại datasheet hay một thông số". Kho âm 0 mục là do lược đồ cũ, không do code.
- Thêm `what: "source"` (chỉ `not_found`): giữ mọi chốt cũ (mọi `where` có trong log, hết hạn 90 ngày). Mục lưu `origin` của lượt (meta.json); khoá `part|model|source|origin` → origin khác là mục khác; `catalog.md` chỉ in mục cùng origin ("với điều kiện nhà cung cấp đặt tại Trung Quốc … đừng tra lại với cùng điều kiện").
- Model HSMT nêu mà không có trong ứng viên: trước đây bị từ chối. Nay `source` nhận thêm model có trong `hsmt.txt` (`modelKeysOf`: từ có chữ + số, so khoá `CAT.keyOf`); `datasheet` / khoá thông số vẫn chỉ nhận model của lượt. `catalog.md` in mục `source` cho model HSMT nêu dù không nằm trong ứng viên.
- Thử trên log thật với `searched` giả định đúng 2 query: ghi 1 mục (origin cn), catalog.md in đúng dòng; không có hsmtText → không ghi.
- `node --test suppliers`: 375/375 (373 + 2 mới); `verify.mjs`: 433 bản ghi, 0 lỗi.
- Chưa kiểm: agent thật có khai `source` hay không. Restart bot sau merge.
