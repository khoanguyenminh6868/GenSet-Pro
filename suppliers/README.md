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
  Nhà cung cấp bị xoá trên web được ghi vào `supdeleted/<id>`: web ẩn nó, và `/api/requests?kind=docs&coll=supplier` (bot đọc từ đây) bỏ nó ra. Tệp trong `cn/` giữ nguyên.

Không thu thập nhà phân phối tại Việt Nam (Khoa, 2026-10-28).

## Danh mục động cơ và đầu phát
Trang web dựng danh mục ngay trên trình duyệt từ `specTables` của mọi bản ghi (`web/catalog.js`), không có dữ liệu riêng:
- model động cơ / đầu phát là ô chữ-số trong dòng bảng có cột động cơ / đầu phát; mỗi model giữ mọi dòng nguyên văn ghi nó, kèm nguồn `[n]`;
- hãng chỉ ghi khi nguồn ghi rõ (ô trong dòng > tiêu đề cột hoặc chính hãng sản xuất > tên trang), không đoán từ tên model;
- công suất là của tổ máy dùng model đó: cặp số có tỉ lệ 1,15–1,35 là kVA / kW; hai cặp thì cặp lớn là dự phòng, cặp nhỏ là liên tục; không quy đổi kW ↔ kVA;
- thông số khác (số xi lanh, dung tích, đường kính × hành trình, tốc độ, điều tốc, khí thải; hiệu suất, cấp cách điện, IP của đầu phát; tiêu hao nhiên liệu, độ ồn, kích thước, khối lượng, bình nhiên liệu của tổ máy...) đọc theo nhãn cột / nhãn dòng, nhãn và giá trị chép nguyên văn. Chỉ dùng khi tiêu đề khớp số ô của dòng; một giá trị sai dạng (ví dụ "105×118" ở cột điều tốc) thì bỏ cả dòng vì cột đã lệch. Đầu phát không hiện thông số động cơ và ngược lại.

## Bộ điều khiển
Khoa, 2026-11-01. `controllers.mjs [id ...] [--crawl] [--max 40] [--dry]` ghi `controllers: [{ brand, model, text, line, src }]` của mỗi bản ghi, bằng code, không AI:
- đọc từng dòng của mọi trang đã lưu của bản ghi bằng `controllersIn` của `web/catalog.js` (trang web và bot cấu hình dùng chung): model Deep Sea (DSE3xxx–8xxx; DSE2xxx/9xxx là module mở rộng, sạc ắc quy nên bỏ), SmartGen (HGM…), ComAp (InteliLite / InteliGen…, AMF/MRS chỉ khi dòng ghi ComAp / Inteli), DEIF, Datakom, Woodward easYgen; hãng không kèm model (Harsen, Mebay… hoặc "Controller: Deepsea/Smartgen") chỉ tính ở dòng nói về bộ điều khiển, và chỉ khi bản ghi không có model nào của hãng đó;
- `line` là dòng nguyên văn (dòng dài thì cắt quanh tên, vẫn là một đoạn của dòng), `text` là tên đúng như ghi; `verify.mjs` kiểm `line` có trong trang nguồn và ghi `text`;
- `--crawl`: dò thêm trang sản phẩm cùng website (như `crawl-specs.mjs`), lưu tối đa 6 trang có model bộ điều khiển thành `sources/<id>/3001.md`… (cùng hạng nguồn với website của hãng). Lần cào sau không tìm được trang nào thì giữ trang cũ.
- Danh mục "Bộ điều khiển" (nút Động cơ → ô chọn loại) dựng trên trình duyệt từ `controllers` và từ dòng bảng tổ máy có ghi bộ điều khiển (kèm công suất, động cơ của dòng đó).
- Gợi ý cấu hình: `catalog.md` có mục "Bộ điều khiển" (của các nhà cung cấp có dòng trong danh mục); mỗi cấu hình có thể có `controller` (`src.kind: "controller"` trỏ tới dòng trong `controllers`, hoặc dòng bảng tổ máy) và kiểm tra `part: "controller"`; `check` kiểm dòng bằng code, hãng được lấy từ mã model (DSE… = Deep Sea). Tìm NCC: `newCatalog.json` có thể có `controllers`; `mergeFind` ghi bộ điều khiển của dòng bảng / của nhà cung cấp.

## Tab "Cấu hình gợi ý"
Chỉ có nút **Gợi ý**: trang ghi `configreq/<TBMT>`, máy Windows trả lời `configmatch/<TBMT>` (Khoa, 2026-10-28).
- `config-bot.mjs run`: với mỗi yêu cầu, `prep` chuẩn bị thư mục (văn bản HSMT, phần kỹ thuật, các model trong danh mục quanh công suất của gói), gọi agent `claude -p` (Opus, có WebSearch) theo `config-prompt.md`: chọn trong danh mục trước, không có mới tìm trên internet (trang dùng phải lưu bằng lệnh `save`), không có nữa thì trả `configs: []` kèm lời nhắn.
- `check` kiểm bằng code trước khi đăng: câu trích HSMT phải có nguyên văn trong HSMT; model, dòng bảng, câu trích và mọi số của thông số chào phải có nguyên văn trong dòng bảng của danh mục hoặc trang web đã lưu. Không khớp thì đánh dấu ⚠ và "Đạt" thành "Chưa rõ".
- Quy đổi (Khoa, 2026-10-29): chỉ bằng công thức trong `web/conversions.js` (kW ↔ kVA theo cosφ, dòng điện ba pha, L/h ↔ g/kWh theo khối lượng riêng diesel EN 590, hp/PS → kW, tốc độ theo số cực, dung tích xi lanh, in³ → L, °F → °C). `check` tự tính lại; đầu vào phải có trong câu trích nguồn/HSMT hoặc là hằng số chuẩn của công thức. Danh sách công thức được ghi vào prompt của agent lúc `prep`.
- Tối đa 10 cấu hình, mỗi cấu hình kèm tối đa 3 nhà cung cấp trong hệ thống; `check` bỏ id không có trong CSDL và đánh dấu ⚠ dòng bảng không phải của nhà cung cấp đó hoặc không ghi động cơ (Khoa, 2026-10-29).
- Không cấu hình nào có nhà cung cấp thực sự phù hợp (dòng bảng ghi đúng động cơ và đầu phát, không "Không đạt" về công suất, tần số, hãng, xuất xứ): agent tìm trên internet một cấu hình và nhà cung cấp phù hợp nhất, ghi `newCatalog.json`. `addToCatalog` chép trang đã lưu thành `sources/<id>/<n>.md` (n từ 2001) trong một worktree mới từ `origin/main`, chạy `verify.mjs`; bản ghi đạt (luôn `status: partial`) được đăng lên web ngay và mở PR nhánh `catalog/<tbmt>` để duyệt, bản ghi không đạt bị bỏ kèm lý do. Bản ghi mới nằm ở `cn/` dù không phải Trung Quốc (trường `country` ghi nước thật). `GENBID_CATALOG_DRY=1`: chỉ kiểm, không đăng, không push.
- Cài trên máy Windows (một lần): trong vòng lặp của `GenBid-Bot.ps1`, khi `/api/requests?kind=all` trả `config` khác rỗng thì chạy `node "<repo>\suppliers\config-bot.mjs" run` (cần `claude` CLI, Node 20+, `pdftotext`; token đọc từ `.genbid-ingest-token`, đổi bằng `GENBID_INGEST_TOKEN_FILE`).
- Yêu cầu khác (Khoa, 2026-11-01): ô dưới Xuất xứ; trang gửi kèm `extra` trong `configreq` / `findreq`. `prep` ghi vào mục "Yêu cầu khác" của `input.md`; agent Gợi ý kiểm từng yêu cầu như yêu cầu HSMT (`from: "user"`, không có câu trích HSMT), agent Tìm NCC chỉ nhận nhà cung cấp có trang đáp ứng. Kết quả ghi `extra` để trang hiện lại; cấu hình code bổ sung từ Tìm NCC ghi rõ chưa đối chiếu Yêu cầu khác.
- Chính xác và nhanh hơn (Khoa, 2026-11-02):
  - **Ứng viên do code xếp sẵn**: `prep` không đưa cả danh mục (~380 KB) cho agent nữa mà chấm điểm từng dòng tổ máy (`candidates`): model / hãng động cơ HSMT nêu, bộ điều khiển HSMT nêu, động cơ có nhiều thông số có nguồn, rồi mới tới đầu phát, độ tin cậy, công suất sát; bỏ dòng sai tần số và sai xuất xứ. `catalog.md` chỉ còn 30 dòng tốt nhất (tối đa 3 dòng một động cơ), thông số theo model, vài nhà cung cấp khác cho mỗi động cơ, danh sách ngắn các động cơ khác.
  - **Thông số theo model** (`modelFacts`): thông số của chính động cơ (xi lanh, dung tích, nòng × hành trình, điều tốc, khí thải...) và của chính đầu phát (cách điện, IP, AVR, hiệu suất...) lấy được từ mọi dòng bảng / datasheet ghi đúng model đó; agent ghi `factSrc` và `check` kiểm dòng đó có thật, ghi đúng model, số chào nằm trong thông số của model trên dòng đó. Thông số của cả tổ máy (tiêu hao, kích thước, bồn dầu, độ ồn) và công suất / tốc độ / nước làm mát của động cơ vẫn chỉ lấy từ dòng của chính tổ máy. Hai nguồn khác nhau ghi khác nhau (14 L / 10.8 L) thì "Đạt" thành "Chưa rõ" kèm các giá trị.
  - **Xếp hạng bằng code** (`rankConfigs`): yêu cầu có `part` và `level` (`core` quyết định model, `option` chọn khi đặt hàng). Thứ tự (Khoa, 2026-11-02): ít "Không đạt" ở động cơ / bộ điều khiển, rồi ở đầu phát / tổ máy, có nhà cung cấp phù hợp, ít "Chưa rõ" theo cùng thứ tự, rồi tới yêu cầu tùy chọn (bồn dầu, kích thước, độ ồn); yêu cầu chưa kiểm tính là "Chưa rõ". Nhà cung cấp trong mỗi cấu hình: chào đúng cả động cơ (dòng bảng) và bộ điều khiển lên đầu, rồi nhà có dòng tổ máy, rồi dòng có đầu phát. Không xét đại lý tại Việt Nam.
  - **Giữ yêu cầu đã đọc**: kết quả ghi `reqHash` (văn bản HSMT + Yêu cầu khác); Gợi ý lại khi hai thứ này không đổi thì agent dùng lại `requirements.json`, bỏ bước đọc yêu cầu.
  - **Tìm NCC**: cấu hình mới tạo cho nhà cung cấp vừa tìm được được một agent nhỏ (`check-prompt.md`) đối chiếu với các yêu cầu đã lưu, `check` kiểm như Gợi ý (`mergeChecked`: chỉ nhận `checks` và `controller`, không đổi động cơ, đầu phát, nhà cung cấp).
  - **Datasheet của hãng** (`maker-datasheets.mjs <id> <pdf url> ...`): datasheet chỉ ghi model ở tiêu đề (Stamford "UCI274F - Winding 311") được lưu thành `sources/<id>/1001.md`…, dòng thông số vào `datasheets/<id>.json`, rồi `merge-specs.mjs <id>` và `verify.mjs`. `modelFacts` dùng bảng của hãng (`engine_maker` / `alternator_maker`) có tiêu đề ghi đúng một mã model. Đã có: Stamford UCI224F, UCI274C/D/F/G, PI044F/G, PI144H (dòng HCI4xx đời mới mang tên khác HCI444…, không ghép).
  - **Datasheet bộ điều khiển** (vai trò `controller_maker`, dòng máy `kind: "controller"`): `maker-datasheets.mjs` giữ mọi dòng nội dung (bỏ chân trang), tiêu đề là dòng đầu ghi model; `catalog.js` không đọc bảng của hãng bộ điều khiển thành tổ máy. `controllerSheetFacts` gán mỗi dòng cho model của mục: datasheet gộp 2 model (DSE7310 MKII & DSE7320 MKII) — mục "Common"/"Specifications" cho cả hai, dòng bắt đầu bằng một model mở mục của model đó, dòng có tên model bên trong ("DSE7320 MKII: 2") chỉ của model đó; chỉ model ghi ở tiêu đề datasheet được nhận. Bộ điều khiển nhà cung cấp ghi không kèm đời (DSE7320) dùng datasheet đời hiện có (DSE7320 MKII), kiểm tra ghi "cần xác nhận đời" và thêm vào việc cần làm rõ. Dòng dạng "danh sách model: nội dung" chỉ của các model trước dấu hai chấm; dòng bắt đầu bằng chữ thường (hoặc mẩu ngắn sau dòng chưa hết câu) là phần xuống dòng, cùng model với dòng trước; SmartGen viết "HGM6110N/6120N/6110NC" là nhiều model, "HGM6100N SERIES" là cả dòng. `catalog.md` có mục "Thông số bộ điều khiển" (40 dòng đầu mỗi bộ, tối đa 6 bộ, ưu tiên hãng HSMT nêu); toàn bộ dòng ở `controllers.md` để agent grep. Đã có: Deep Sea DSE7310/7320 MKII, DSE6110/6120 MKIII, DSE7410/7420 MKII, DSE8610 MKII, DSE8660 MKII, DSE3110 (bỏ DSE6010/20, DSE4520, DSE8620: datasheet dàn nhiều cột, pdftotext trộn chữ); SmartGen (user manual tại smartgen.cn/yun/data/download/…_en.pdf, 700 dòng đầu) HGM6110N/6120N/6110NC/6120NC/6110CAN/6120CAN, HGM6110U/6110UC/6120U/6120UC, HGM9510. `catalog.js` sửa: DSE…MKIII là đời riêng, không đọc thành MKII.
  - Không có bộ điều khiển (Khoa, 2026-11-02): khi HSMT có yêu cầu bộ điều khiển, cấu hình không có `controller` (hoặc bộ điều khiển chưa khớp nguồn) được code thêm kiểm tra "Bộ điều khiển của cấu hình" = Không đạt (`byCode`), nên xếp dưới cấu hình có bộ điều khiển; có bộ điều khiển sau (Tìm NCC) thì code gỡ kiểm tra này.
  - ComAp (`comap`, CZ): datasheet InteliLite 4 AMF25 / AMF20 / MRS16 (trang sản phẩm, link `/productfile/<id>` — chuyển hướng tới link có chữ ký hết hạn nên ghi link gốc). "AMF25" / "InteliLite AMF25" không ghi đời dùng datasheet InteliLite 4 (cần xác nhận đời); "InteliLite NT AMF25" ghi rõ đời cũ thì không.
  - Leroy-Somer (`leroy-somer-fuzhou`): datasheet TAL-A40/A42/A44/A46/A473/A49 (leroy-somer.com/documentation_pdf/6608–6613_en.pdf). Trang PDF đôi (rộng gấp đôi) được đọc từng nửa. Datasheet của một dòng (TAL-A46) áp cho các model mà chính nó liệt kê (TAL-A46-C…H) và có trong danh mục. Chưa có LSA.
  - `GENBID_LOCAL_SUPPLIERS=1 node suppliers/config-bot.mjs prep ...`: dùng CSDL `cn/*.json` của checkout thay cho bản trên web, để thử bản ghi chưa đăng.
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

## Nhà phân phối có ủy quyền
Chỉ lấy nhà phân phối mà chính hãng công bố trên website của hãng (Khoa, 2026-10-29); giấy ủy quyền dạng ảnh không kiểm được bằng code nên không tính.
- Stamford: trang "Authorised Distributors" (stamford-avk.com/contact/authorised-distributors).
- Perkins: `perkins-locator.mjs <file> "<thành phố>, China"` lưu kết quả trang tra nhà phân phối; chạy cho các thành phố lớn, "Distributor" là nhà phân phối chính, "Local Branch / Dealer" là đại lý (chi nhánh của nhà phân phối chính gộp vào công ty mẹ).
- Cummins: cummins.com chặn máy Windows (HTTP 403 cả với Chromium) nên trang từng điểm (…/locations/china/…) được lưu qua firecrawl (`save --firecrawl`, key ở `genbid-hsmt/.firecrawl-key` hoặc `GENBID_FIRECRAWL_KEY_FILE`; Khoa cho phép 2026-10-29). Chỉ giữ điểm mà trang Cummins ghi ứng dụng "Generator" hoặc "Cummins Power Generation".
- Mecc Alte: trang nhà phân phối không có nhà phân phối ở Trung Quốc (hãng có nhà máy Haimen).

### Liên hệ (email, điện thoại, WhatsApp, WeChat)
`contacts.mjs [id ...] [--all] [--dry]` (mặc định: mọi nhà phân phối) đọc các trang đã lưu (số nguồn < 100) và ghi `contacts: [{ type, value, src }]`; dòng chứa giá trị được thêm vào câu trích của nguồn đó, `verify.mjs` kiểm giá trị có nguyên văn trong câu trích (Khoa, 2026-10-29).
- Trang danh sách (Stamford, Perkins) chỉ đọc mục của đúng công ty; trang khác chỉ đọc dòng có nhãn (Tel, Email, WhatsApp, 微信...) hoặc link `tel:` / `wa.me`. Ô bảng gộp nhiều nhãn được cắt trước mỗi nhãn để số fax không thành điện thoại.
- Email theo tên miền của trang bên thứ ba (support@cummins.com trên trang địa điểm Cummins) không phải của đại lý nên bỏ. Số dưới 9 chữ số (thiếu mã vùng) bỏ.
- Trang liên hệ trên website riêng: `fetch-source.mjs <id> <n> <url>` hoặc `discover.mjs save` (n < 100); `contacts.mjs` tự thêm thành nguồn hạng C khi trang có liên hệ. Website bị chiếm làm trang rác (SZ-cummins.com, gesaisi.com) không dùng.
- Email bị Cloudflare che ("[email protected]") được giải mã khi lưu trang (`htmlToText`).

## Thêm hoặc sửa một nhà cung cấp
1. `node suppliers/fetch-source.mjs <id> <n> <url>` cho từng trang nguồn.
2. Viết `cn/<id>.json`, chép câu trích từ file nguồn.
3. `node suppliers/crawl-specs.mjs <id>` rồi `node suppliers/merge-specs.mjs <id>` để lấy cấu hình từng model.
4. `node suppliers/verify.mjs` cho tới khi không còn lỗi (mỗi dòng bảng cũng phải có nguyên văn trong trang đã lưu).
5. `node suppliers/upload.mjs`.

Xoá một bản ghi khỏi web: hiện chưa có lệnh; đổi `status` thành `incomplete` không xoá bản đã đăng.
