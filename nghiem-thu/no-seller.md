# Nghiệm thu: trang bên bán (tier C, không chính hãng) không vào danh mục (PR nháp, nhánh `no-seller`)

PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/574 (DRAFT, chưa merge). Worktree `C:\Projects\GenSet Pro\wt-no-seller` từ origin/main 792484e.

## Tệp đổi
- `suppliers/config-bot.mjs`: `catalogRecords` (thêm `sellerPage`, tuỳ chọn `keepSeller`), `addToCatalog` (chuyển lý do vào `added`).
- `suppliers/config-prompt.md`: một câu báo agent tier C ngoài tên miền hãng không được thêm vào danh mục.
- `suppliers/no-seller.test.mjs` (mới, 5 test).

## Cách làm
- Nguồn bị coi là trang bên bán khi `tier === "C"` VÀ cờ `official` (code tính, `web-memo.mjs`) là false. Nguồn tier C nằm trên tên miền hãng, hay tier A/B, vẫn vào như cũ.
- Trong `catalogRecords`: nguồn đó không đánh số lại, không ghi `sources/<id>/<n>.md`. Bảng spec, dòng sản phẩm (kể cả `power.src`), bộ điều khiển, strengths, certifications chỉ dựa vào nguồn đó thì bỏ theo (đếm `droppedParts`). Mục dựa vào cả nguồn giữ lẫn nguồn bỏ: giữ, chỉ còn số nguồn giữ.
- Lý do ghi vào kết quả: `added[i].skippedSources = [{url, why}]` (nguồn đã bỏ, còn lại vẫn thêm), hoặc `added[i].error = "không đưa vào danh mục: mọi nguồn là trang bên bán / không chính hãng (tier C): <url>"` khi không còn nguồn nào (bản ghi mới hoặc bổ sung thêm cho NCC có sẵn). `checkDir` đã chép `added` vào `result.catalogAdded` nên lý do hiện cùng kết quả lượt.
- Kết quả gợi ý của lượt không đổi: `check()` / `catalogMd` vẫn đọc trang đã lưu `web/*.txt` của lượt đó (config-web, PR #547), không phụ thuộc danh mục.
- `findCheck` (Tìm NCC) cũng gọi `catalogRecords` nên agent Tìm NCC nay nhận lỗi "không đưa vào danh mục…" ngay ở bước kiểm.

## Lệnh kiểm + đầu ra
- `node --test suppliers/` → `# tests 400  # pass 400  # fail 0` (395 cũ + 5 mới).
- `node suppliers/verify.mjs` → `433 bản ghi, 0 có lỗi`.
- Test mới: sellerPage; bảng + nguồn bên bán bỏ, nguồn hãng giữ, đánh số 2001; mọi nguồn bên bán → error; NCC mới chỉ có trang sàn → không thêm, dòng sản phẩm dựa 1 / 2 / 1+2 giữ đúng; tier A của người khác và trang hãng tự khai C không bị bỏ; `keepSeller` giữ hết.

## Số đo (ĐO, từ `suppliers/cn/*.json` của origin/main, chỉ đếm, không xoá gì)
- 433 bản ghi, 4.681 nguồn: tier C 26; tier C và `official` false: **20 nguồn ở 8 bản ghi** (kachai-hangzhou 11, rehlko 2, weichai-power 2, cummins-dealer-weifang-yidaneng-power 1, jichai 1, lance-power 1, perfect-house 1, previa-ningde 1).
- Trong 94 nguồn tìm trên internet (n 2001–2999): 12 là tier C không chính hãng.
- Bản ghi mà MỌI nguồn là tier C không chính hãng (nếu nạp lần đầu hôm nay thì không vào): lance-power, perfect-house, previa-ningde.
- Trước/sau trên bản ghi có sẵn: không đổi (code chỉ chặn nạp mới; không xoá).

## 3 mẫu đối chiếu (nguồn thật đang trong danh mục, sẽ bị bỏ nếu nạp mới)
1. kachai-hangzhou #2001 `https://jcpower.en.made-in-china.com/product/bwCTazJMCjct/China-Sdec-Shanghai-Diesel-Engine-Powered-Generator-Set.html` — quote "Sdec Shanghai Diesel Engine Powered Generator Set - Sdec Generator and Sdec Diesel Generator" (sàn made-in-china, tier C).
2. weichai-power #6 `https://weichai.com.vn/en/generator-set` — quote "It is manufactured and tested according to ISO 8528 and GB/T2820 standards, with a power range of 10-4,300kW" (đại lý Việt Nam, không phải tên miền hãng).
3. rehlko #2010/#2011 `https://cdn.shopify.com/s/files/1/0531/1715/7528/files/D440.pdf` — quote "Industrial Diesel Generator Set – D440 / KOHLER SDMO premium quality / Prime kVA 400". **Đây là datasheet của chính hãng đặt trên CDN riêng** (bẫy đã ghi ở `web-memo.md`): cờ `official` false nên bị coi là trang bên bán nếu agent khai tier C. Agent khai tier A cho PDF này thì không bị bỏ (quy tắc chỉ xét tier C).

## Rủi ro còn lại + quay lui
- **Tìm NCC / Tìm Thông Số dùng chung `catalogRecords`/`addToCatalog`**: find-prompt vẫn bảo agent dùng tier C (alibaba, made-in-china) cho NCC chỉ có trang sàn; nay các bản ghi đó bị từ chối ("không đưa vào danh mục…"), Tìm NCC có thể ra ít NCC mới hơn. Nếu Khoa chỉ muốn áp quy tắc cho Gợi ý cấu hình: truyền `keepSeller: true` ở hai chỗ gọi `addToCatalog` của Tìm NCC / Tìm Thông Số (một dòng mỗi chỗ; `addToCatalog` đã chuyển `opts.keepSeller` xuống `catalogRecords`; chưa bật ở đâu vì chưa được chốt). **Cần phiên điều phối quyết.**
- Quy tắc dựa vào tier agent tự khai: trang bên bán khai tier A/B vẫn lọt (code chỉ cân cờ `official` cho tier C).
- Cờ `official` sai cho PDF hãng trên CDN riêng (mẫu 3): agent khai C thì bị bỏ oan; khai A thì lọt.
- Quay lui: revert PR; sau merge restart bot (GenBid-Bot.ps1 nạp một lần).

## Chưa kiểm
- Chưa chạy lượt Gợi ý cấu hình / Tìm NCC thật (không gọi agent, không ghi web, không mở PR danh mục).
- Chưa kiểm hiển thị `catalogAdded.skippedSources` ở giao diện web (chỉ ghi vào kết quả).

## Bổ sung theo điều phối (12/11, sau duyệt diff)
- Quyết: quy tắc áp cho MỌI đường (Gợi ý cấu hình, Tìm NCC, Tìm Thông Số); không bật `keepSeller` ở đâu.
- Prompt: `find-prompt.md`, `config-prompt.md`, và bản trong git của skill `bot/claude/skills/tim-thong-so-ncc/SKILL.md` nay nói: trang sàn / bên bán không được thêm vào danh mục, đừng tốn lượt lưu, chỉ nêu trong ghi chú; NCC chỉ có trang bên bán thì không được thêm. Tier khai theo CHỦ tài liệu (tờ của chính hãng tải từ link trên trang hãng → A/B dù là CDN; ghi trang hãng dẫn tới nó vào ghi chú). Không có danh sách CDN trong code.
- **Bản SỐNG của skill `~\.claude\skills\tim-thong-so-ncc\SKILL.md` CHƯA sửa** (tệp bot thật, chờ điều phối duyệt); sửa xong nên chạy `bot\Backup-GenBidBot.ps1` kẻo lần sao lưu sau đè bản trong git.
- Đã rebase lên origin/main (có #571, #573); `node --test suppliers/` → 410 pass, 0 fail (sau rebase, gồm test của #571, #573).
