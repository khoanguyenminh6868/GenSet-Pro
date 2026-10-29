# Nhà cung cấp máy phát điện

Dữ liệu cho trang "Nhà cung cấp", danh mục "Động cơ" / "Đầu phát", tab "Nhà cung cấp" (Gợi ý top 3) và tab "Cấu hình gợi ý" của GenBid Pro. Giai đoạn này: Trung Quốc. Duyệt bởi Khoa, 2026-10-28.

## Nguyên tắc
- Mỗi thông tin có nguồn `[n]`: link, ngày đọc, hạng nguồn và câu trích nguyên văn (giữ ngôn ngữ gốc).
- Không tìm thấy thì để `null` và ghi vào `missing`; không ước lượng, không suy từ tên model, không quy đổi kW/kVA.
- Hạng nguồn: **A** website/tài liệu chính hãng, **B** triển lãm/hiệp hội, **C** tự giới thiệu (đại lý, sàn B2B). Chỉ có nguồn C thì `confidence: "low"`.
- Website mang tên hãng nhưng do đại lý làm (ví dụ `sdec-engine.com`, `dcec-engine.com`, `ccec-engine.com` của EMAC) không được tính là nguồn chính hãng.
- Lời quảng cáo ghi kèm "Theo hãng".

## Thư mục
- `cn/<id>.json`: một nhà cung cấp (định dạng: `schema.json`).
- `sources/<id>/<n>.md`: bản lưu trang nguồn (dòng đầu: URL, ngày đọc). Trang dựng bằng JavaScript được đọc qua firecrawl, ghi `Via: firecrawl`.
- `fetch-source.mjs <id> <n> <url>`: lưu một trang (HTML hoặc PDF) thành văn bản.
- `build.mjs <specs.mjs>`: dựng `cn/<id>.json` từ mô tả ngắn; URL và ngày đọc của mỗi nguồn lấy từ dòng đầu file đã lưu, không gõ tay.
- `crawl-specs.mjs [id ...] [--max 80] [--render]`: dò trang sản phẩm cùng website (ưu tiên link có chữ kVA/kW), lưu trang có bảng thông số thành `sources/<id>/101.md`…, ghi `specs/<id>.json`. Đọc 3 kiểu: bảng HTML, bảng dựng bằng div (mỗi ô một dòng), trang một model dạng "Nhãn: giá trị". `--render` mở bằng Chromium cho trang dựng bằng JavaScript.
- `crawl-datasheets.mjs [id ...] [--max 150]`: mở lại các trang sản phẩm trong `specs/<id>.json`, theo link datasheet (file PDF, hoặc link ghi "Datasheet", "Technical data"... cùng website), lưu thành `sources/<id>/1001.md`… (số 4 chữ số, lần cào bảng không xoá) và ghi `datasheets/<id>.json`. PDF đọc bằng `pdftotext -table` của xpdf (có sẵn trong Git for Windows; bản poppler trên Linux không có `-table` nên chạy trên máy Windows); hai cột "nhãn  giá trị" đặt cạnh nhau được tách thành từng dòng `| nhãn | giá trị`. PDF scan (ảnh) hoặc đọc không ra chữ thì bỏ qua, không OCR. Chỉ giữ datasheet ghi model động cơ / đầu phát; dòng "Model" dưới tiêu đề "Engine specification" / "Alternator specification" là model của phần đó.
- `merge-specs.mjs [id ...]`: gộp bảng (cả `datasheets/`) vào bản ghi thành `specTables` (mỗi dòng model chép nguyên văn), bỏ bảng trùng, bảng ngôn ngữ khác, bảng không phải máy phát (động cơ điện, biến áp, bơm...). Không chạy song song với crawl.
- `verify.mjs`: kiểm tra bằng code: mỗi câu trích phải có nguyên văn trong file nguồn, số min/max công suất phải có trong câu trích, mỗi `src` trỏ tới nguồn có thật.
- `upload.mjs [--dry]`: chạy kiểm tra rồi đăng lên web thành `supplier/<id>` (qua `/api/ingest`). Bản ghi `incomplete` không đăng.

Không thu thập nhà phân phối tại Việt Nam (Khoa, 2026-10-28).

## Danh mục động cơ và đầu phát
Trang web dựng danh mục ngay trên trình duyệt từ `specTables` của mọi bản ghi (`web/catalog.js`), không có dữ liệu riêng:
- model động cơ / đầu phát là ô chữ-số trong dòng bảng có cột động cơ / đầu phát; mỗi model giữ mọi dòng nguyên văn ghi nó, kèm nguồn `[n]`;
- hãng chỉ ghi khi nguồn ghi rõ (ô trong dòng > tiêu đề cột hoặc chính hãng sản xuất > tên trang), không đoán từ tên model;
- công suất là của tổ máy dùng model đó: cặp số có tỉ lệ 1,15–1,35 là kVA / kW; hai cặp thì cặp lớn là dự phòng, cặp nhỏ là liên tục; không quy đổi kW ↔ kVA;
- thông số khác (số xi lanh, dung tích, đường kính × hành trình, tốc độ, điều tốc, khí thải; hiệu suất, cấp cách điện, IP của đầu phát; tiêu hao nhiên liệu, độ ồn, kích thước, khối lượng, bình nhiên liệu của tổ máy...) đọc theo nhãn cột / nhãn dòng, nhãn và giá trị chép nguyên văn. Chỉ dùng khi tiêu đề khớp số ô của dòng; một giá trị sai dạng (ví dụ "105×118" ở cột điều tốc) thì bỏ cả dòng vì cột đã lệch. Đầu phát không hiện thông số động cơ và ngược lại.

## Tab "Cấu hình gợi ý"
Chỉ có nút **Gợi ý**: trang ghi `configreq/<TBMT>`, máy Windows trả lời `configmatch/<TBMT>` (Khoa, 2026-10-28).
- `config-bot.mjs run`: với mỗi yêu cầu, `prep` chuẩn bị thư mục (văn bản HSMT, phần kỹ thuật, các model trong danh mục quanh công suất của gói), gọi agent `claude -p` (Opus, có WebSearch) theo `config-prompt.md`: chọn trong danh mục trước, không có mới tìm trên internet (trang dùng phải lưu bằng lệnh `save`), không có nữa thì trả `configs: []` kèm lời nhắn.
- `check` kiểm bằng code trước khi đăng: câu trích HSMT phải có nguyên văn trong HSMT; model, dòng bảng, câu trích và mọi số của thông số chào phải có nguyên văn trong dòng bảng của danh mục hoặc trang web đã lưu. Không khớp thì đánh dấu ⚠ và "Đạt" thành "Chưa rõ".
- Quy đổi (Khoa, 2026-10-29): chỉ bằng công thức trong `web/conversions.js` (kW ↔ kVA theo cosφ, dòng điện ba pha, L/h ↔ g/kWh theo khối lượng riêng diesel EN 590, hp/PS → kW, tốc độ theo số cực, dung tích xi lanh, in³ → L, °F → °C). `check` tự tính lại; đầu vào phải có trong câu trích nguồn/HSMT hoặc là hằng số chuẩn của công thức. Danh sách công thức được ghi vào prompt của agent lúc `prep`.
- Tối đa 10 cấu hình, mỗi cấu hình kèm tối đa 3 nhà cung cấp trong hệ thống; `check` bỏ id không có trong CSDL và đánh dấu ⚠ dòng bảng không phải của nhà cung cấp đó hoặc không ghi động cơ (Khoa, 2026-10-29).
- Không cấu hình nào có nhà cung cấp thực sự phù hợp (dòng bảng ghi đúng động cơ và đầu phát, không "Không đạt" về công suất, tần số, hãng, xuất xứ): agent tìm trên internet một cấu hình và nhà cung cấp phù hợp nhất, ghi `newCatalog.json`. `addToCatalog` chép trang đã lưu thành `sources/<id>/<n>.md` (n từ 2001) trong một worktree mới từ `origin/main`, chạy `verify.mjs`; bản ghi đạt (luôn `status: partial`) được đăng lên web ngay và mở PR nhánh `catalog/<tbmt>` để duyệt, bản ghi không đạt bị bỏ kèm lý do. Bản ghi mới nằm ở `cn/` dù không phải Trung Quốc (trường `country` ghi nước thật). `GENBID_CATALOG_DRY=1`: chỉ kiểm, không đăng, không push.
- Cài trên máy Windows (một lần): trong vòng lặp của `GenBid-Bot.ps1`, khi `/api/requests?kind=all` trả `config` khác rỗng thì chạy `node "<repo>\suppliers\config-bot.mjs" run` (cần `claude` CLI, Node 20+, `pdftotext`; token đọc từ `.genbid-ingest-token`, đổi bằng `GENBID_INGEST_TOKEN_FILE`).
- `catalog-stats.mjs [--json out.json] [--samples]`: dựng danh mục từ `cn/*.json` như trang web và in số liệu.
- `node --test suppliers/*.test.mjs`: kiểm tra bộ đọc danh mục (chạy trong CI cùng `verify.mjs`).

## Cào lại trên GitHub
Workflow *Supplier spec crawl* (`.github/workflows/supplier-crawl.yml`) chạy `crawl-specs.mjs` hai lượt (đọc thường, rồi Chromium) trên máy của GitHub, `merge-specs.mjs`, `verify.mjs`, rồi commit vào nhánh nó chạy. Chạy tay (Actions → Run workflow, chọn nhánh) hoặc đẩy lên một nhánh `crawl/...`. Một hãng mà lần cào mới tìm được ít dòng hơn lần trước thì giữ nguyên kết quả cũ. Xem lại commit qua pull request trước khi gộp vào `main`; khi `suppliers/cn/` trên `main` thay đổi, workflow *Supplier publish* tự đăng lên web (cùng kiểm tra như `upload.mjs`).

## Bot tìm nhà cung cấp mới
Agent trong Antigravity (Gemini 3.8 Flash, medium) làm theo `discover-prompt.md` (hoặc gõ `/tim-nha-cung-cap`, file `.agent/workflows/`). Agent chỉ chọn trang và chép câu trích; `discover.mjs` làm phần còn lại bằng code (Khoa, 2026-10-29):
- `seeds [--genbid]`: hãng động cơ / đầu phát có trong bảng thông số nhưng chưa có bản ghi hãng; `--genbid` ghi các yêu cầu về hãng / xuất xứ trong gói đã phân tích ra thư mục tạm (không vào repo).
- `check <url|tên>`: trùng với bản ghi nào (cùng website, trùng chữ trong tên/thương hiệu, trùng tên tiếng Trung), đã bỏ qua trong nhật ký chưa, có phải sàn B2B / website đại lý không.
- `save <id> <url> [--render]` (lưu như `fetch-source.mjs`, số nguồn 1–99 tự tăng), `grep <id> <regex>` (dòng nguyên văn để chép câu trích), `new <id>` (bản nháp `drafts/<id>.json` dạng ngắn của `build.mjs`).
- `finish <id>`: kiểm bản nháp trước khi dựng — câu trích có nguyên văn (sai thì in dòng gần nhất), số công suất và năm thành lập có trong câu trích, sàn B2B / đại lý chỉ hạng C, không dùng Wikipedia / Baike / tra cứu trả phí, lời quảng cáo phải ghi "Theo hãng", `verified` cần website và dải công suất — rồi `build.mjs`, `crawl-specs.mjs` (thường, không có bảng thì `--render`), `crawl-datasheets.mjs`, `merge-specs.mjs`, `verify.mjs`.
- `skip <url|tên> --reason R`, `status`; nhật ký ở `discover-log.json` để lượt sau không làm lại.
- `pr`: `verify.mjs` toàn bộ, commit, push nhánh `discover/...`, mở PR. Bot không đăng thẳng lên web; Khoa gộp PR thì *Supplier publish* đăng.

## Thêm hoặc sửa một nhà cung cấp
1. `node suppliers/fetch-source.mjs <id> <n> <url>` cho từng trang nguồn.
2. Viết `cn/<id>.json`, chép câu trích từ file nguồn.
3. `node suppliers/crawl-specs.mjs <id>` rồi `node suppliers/merge-specs.mjs <id>` để lấy cấu hình từng model.
4. `node suppliers/verify.mjs` cho tới khi không còn lỗi (mỗi dòng bảng cũng phải có nguyên văn trong trang đã lưu).
5. `node suppliers/upload.mjs`.

Xoá một bản ghi khỏi web: hiện chưa có lệnh; đổi `status` thành `incomplete` không xoá bản đã đăng.
