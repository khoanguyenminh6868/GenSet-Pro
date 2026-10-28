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
- `merge-specs.mjs [id ...]`: gộp bảng vào bản ghi thành `specTables` (mỗi dòng model chép nguyên văn), bỏ bảng trùng, bảng ngôn ngữ khác, bảng không phải máy phát (động cơ điện, biến áp, bơm...). Không chạy song song với crawl.
- `verify.mjs`: kiểm tra bằng code: mỗi câu trích phải có nguyên văn trong file nguồn, số min/max công suất phải có trong câu trích, mỗi `src` trỏ tới nguồn có thật.
- `upload.mjs [--dry]`: chạy kiểm tra rồi đăng lên web thành `supplier/<id>` (qua `/api/ingest`). Bản ghi `incomplete` không đăng.

Không thu thập nhà phân phối tại Việt Nam (Khoa, 2026-10-28).

## Danh mục động cơ và đầu phát
Trang web dựng danh mục ngay trên trình duyệt từ `specTables` của mọi bản ghi (`web/catalog.js`), không có dữ liệu riêng:
- model động cơ / đầu phát là ô chữ-số trong dòng bảng có cột động cơ / đầu phát; mỗi model giữ mọi dòng nguyên văn ghi nó, kèm nguồn `[n]`;
- hãng chỉ ghi khi nguồn ghi rõ (ô trong dòng > tiêu đề cột hoặc chính hãng sản xuất > tên trang), không đoán từ tên model;
- công suất là của tổ máy dùng model đó: cặp số có tỉ lệ 1,15–1,35 là kVA / kW; hai cặp thì cặp lớn là dự phòng, cặp nhỏ là liên tục; không quy đổi kW ↔ kVA.

## Tab "Cấu hình gợi ý"
Chỉ có nút **Gợi ý**: trang ghi `configreq/<TBMT>`, máy Windows trả lời `configmatch/<TBMT>` (Khoa, 2026-10-28).
- `config-bot.mjs run`: với mỗi yêu cầu, `prep` chuẩn bị thư mục (văn bản HSMT, phần kỹ thuật, các model trong danh mục quanh công suất của gói), gọi agent `claude -p` (Opus, có WebSearch) theo `config-prompt.md`: chọn trong danh mục trước, không có mới tìm trên internet (trang dùng phải lưu bằng lệnh `save`), không có nữa thì trả `configs: []` kèm lời nhắn.
- `check` kiểm bằng code trước khi đăng: câu trích HSMT phải có nguyên văn trong HSMT; model, dòng bảng, câu trích và mọi số của thông số chào phải có nguyên văn trong dòng bảng của danh mục hoặc trang web đã lưu. Không khớp thì đánh dấu ⚠ và "Đạt" thành "Chưa rõ".
- Cài trên máy Windows (một lần): trong vòng lặp của `GenBid-Bot.ps1`, khi `/api/requests?kind=all` trả `config` khác rỗng thì chạy `node "<repo>\suppliers\config-bot.mjs" run` (cần `claude` CLI, Node 20+, `pdftotext`; token đọc từ `.genbid-ingest-token`, đổi bằng `GENBID_INGEST_TOKEN_FILE`).
- `catalog-stats.mjs [--json out.json] [--samples]`: dựng danh mục từ `cn/*.json` như trang web và in số liệu.
- `node --test suppliers/*.test.mjs`: kiểm tra bộ đọc danh mục (chạy trong CI cùng `verify.mjs`).

## Cào lại trên GitHub
Workflow *Supplier spec crawl* (`.github/workflows/supplier-crawl.yml`) chạy `crawl-specs.mjs` hai lượt (đọc thường, rồi Chromium) trên máy của GitHub, `merge-specs.mjs`, `verify.mjs`, rồi commit vào nhánh nó chạy. Chạy tay (Actions → Run workflow, chọn nhánh) hoặc đẩy lên một nhánh `crawl/...`. Một hãng mà lần cào mới tìm được ít dòng hơn lần trước thì giữ nguyên kết quả cũ. Xem lại commit qua pull request trước khi gộp vào `main`; khi `suppliers/cn/` trên `main` thay đổi, workflow *Supplier publish* tự đăng lên web (cùng kiểm tra như `upload.mjs`).

## Thêm hoặc sửa một nhà cung cấp
1. `node suppliers/fetch-source.mjs <id> <n> <url>` cho từng trang nguồn.
2. Viết `cn/<id>.json`, chép câu trích từ file nguồn.
3. `node suppliers/crawl-specs.mjs <id>` rồi `node suppliers/merge-specs.mjs <id>` để lấy cấu hình từng model.
4. `node suppliers/verify.mjs` cho tới khi không còn lỗi (mỗi dòng bảng cũng phải có nguyên văn trong trang đã lưu).
5. `node suppliers/upload.mjs`.

Xoá một bản ghi khỏi web: hiện chưa có lệnh; đổi `status` thành `incomplete` không xoá bản đã đăng.
