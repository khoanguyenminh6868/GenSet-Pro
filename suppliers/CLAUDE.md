# suppliers/ — quy tắc và bẫy

## Dữ liệu nhà cung cấp
- Tuyệt đối không bịa, không suy ra. Mỗi thông tin có nguồn [n] + câu trích nguyên văn trong `sources/<id>/<n>.md`; `verify.mjs` kiểm bằng code. Quy đổi chỉ bằng công thức `web/conversions.js`. URL lấy từ kết quả tìm kiếm, không đoán. Trang trả 403 thì dừng, không đổi User-Agent.
- Thêm/cập nhật NCC: `discover.mjs save/grep` → `drafts/<id>.json` → `discover.mjs finish <id>` → `verify.mjs` → PR. Merge vào main thì workflow tự đăng web.
- Số nguồn: 1–99 trang chính, 101+ crawl-specs, 1001+ datasheet, 2001+ Tìm NCC, 3001+ BĐK, 4001+ OCR, 5001+ catalog PDF tải lên.
- Datasheet hãng: `maker-datasheets.mjs <id> <pdf...>` → `merge-specs.mjs <id>` → `verify.mjs`.
- Catalog PDF: `catalog-pdf.mjs <id> <url> <pdf> [--rows|--single|--spread|--engines|--ocr]`. Trang ngang ghép 50|60 Hz → `--spread`; có lớp chữ mà không ra bảng → `--rows`; bảng vẽ bằng nét hoặc PDF có lớp chữ ẩn/chồng đôi → chạy thêm `--ocr` và so theo model. Luôn đối chiếu vài dòng với ảnh crop; sau lượt OCR so model trong chữ OCR với bản ghi để tìm cả nhóm bị loại.
- OCR bảng ảnh: `ocr-specs.mjs <id> <trang> <ảnh|pdf>...`; chỉ giữ dòng code kiểm được. Tesseract nhầm 6/8/B, 5/S, Z/7/2, mất dấu chấm; còn đường kẻ thì mất gần hết số.
- Tìm Thông Số một NCC: `config-bot.mjs spec --id X` (skill `tim-thong-so-ncc`). NCC không có `website` thì `specPrep` dừng ngay, không chạy agent (`specSkip`, Khoa 13/11); yêu cầu nhận lỗi "chưa có website".
- NCC còn cần tìm thông số: `spec-todo.mjs` (chưa có dòng bảng, trừ `spec-none.json`). Đã thử tìm website + cào + Tìm Thông Số mà không ra bảng → `spec-todo.mjs --mark <id> --why "…"` để lần sau không tìm lại (gaps.mjs cũng không gửi specreq cho chúng); có nguồn mới thì `--unmark`.

## Bẫy cào / gộp
- Sau mọi lần `merge-specs` toàn bộ: chạy verify VÀ so số dòng bảng/nguồn từng bản ghi với origin/main.
- `crawl-specs.mjs --render` có thể treo hàng giờ → bọc `timeout 1200`. Bản ghi `website: null` không được cào; crawl chỉ cào một host của `website` (thương hiệu có website thứ hai → bản ghi riêng + `relatedIds`).
- Đẩy tệp workflow lên nhánh `crawl/**` sẽ tự chạy CẢ danh sách hãng → merge main vào nhánh crawl bằng commit có `[skip ci]`, rồi `gh workflow run supplier-crawl.yml --ref <nhánh> -f ids="..." -f plain=false -f render=true`.
- `pdftotext -table` cho bảng (`-layout` lệch cột); pdftotext của Git Bash cần `-enc UTF-8`. Ngày Accessed theo UTC.
- Lượt chạy nền nạp code lúc khởi động: sửa code xong phải chạy lại.

## config-bot / bidprice-bot
- Mỗi lượt là tiến trình node mới (không cần restart bot), nhưng `config-bot.mjs run` đang chạy giữ code cũ tới khi thoát. Khoá `genbid-config.lock` chỉ tính khi PID còn sống.
- Tệp import `config-bot.mjs` không được bị `config-bot.mjs` import ngược (node thoát 13, kẹt khoá).
- `check` cắt `MAX_CONFIGS` TRƯỚC `rankConfigs`: cấu hình cần giữ phải đưa lên trước khi cắt. Kết quả lưu không ghi origin → `originOfReq(undefined)` = "cn".
- Check hiếm khi mang `code` → khớp theo item của yêu cầu. Từ khoá của mã `alt_vreg` bắt cả dòng tần số, đừng dùng để quét HSMT.
- Thêm mã yêu cầu (`reqcodes.mjs`): dòng `R(...)` đúng vị trí thứ tự + test, tăng `REQ_VERSION`.
- Đổi từ khoá của một mã: đo `codeOf` trước/sau trên `technicalSpecs` của `doc-cache\analysis.json` (48.580 dòng). `codeOf` thử tên mục trước, cả câu sau, theo thứ tự danh sách → từ khoá rộng ở tên mục cướp dòng của mã khác ("hệ thống nhiên liệu" kéo dòng bồn dầu khỏi `fuel_tank`).
- `domain.test.mjs` là bộ ca chuyên môn (số tính tay); ca `todo` là lỗi biết mà chưa sửa. Hai luật tách (13/11): `BP.isGensetName` là luật TÊN GÓI (nhận "MPĐ", loại máy phát điện gió / mặt trời), `BP.isGensetRow` là luật DÒNG HÀNG HOÁ (`unitsOf`, `isSetRow`, `goodsGroup`, `candidates`: không đọc "MPĐ", vì "MPĐ diesel - Dây curoa" là vật tư). Luật tên gói còn ở `bot/genbid-hsmt/sync-pure.js` (`isGenset`) và `server/src/muasamcong.ts` (`isGeneratorTender`): sửa một nơi phải sửa cả ba; `bot/test/sync-rules.test.mjs` so ba nơi trên một danh sách.
- Fixture test phải có `country: "CN"`. `analysis.generatorSets` hầu như luôn rỗng, đừng dựa vào.
- Dữ liệu dễ đọc nhầm: fdk-energy "Prime power / Speed (KW/RPM)" là kWe tổ máy; đuôi "-6" là máy 60 Hz; mã `TWD…` là Volvo Penta; "P158LE" bị coi là mã đầu phát; saudi-diesel bị đọc thành SDEC; Continuous (COP) ≠ Prime (PRP) khi xét quá tải.

## Thử không tốn agent
- `GENBID_LOCAL_SUPPLIERS=1` + prep → claude → check. Kiểm hồi quy nhanh: chạy `check --dir` bằng code mới trên thư mục lượt cũ. Log agent `%TEMP%\genbid-config-<TBMT>.log`.
- `bidprice-bot.mjs try --key K --kva N --price P` (không đăng); `bidprice-backtest.mjs` hậu kiểm; `restore-web` chỉ đọc (cần `--origin`).
- Gửi lại Gợi ý từ máy: `post([{coll:"configreq", id, data:{by, from:"web", origin:"all", bidName, notifyNo, requestedAt: now, error:""}}])` (import từ `config-bot.mjs`).
- Hồi quy không tốn agent có sẵn trong test: `regress-config.test.mjs` / `regress-bidprice.test.mjs` chạy lại `check` trên lượt thật đóng băng (`fixtures/runs/`). Đổi quy tắc có chủ ý: `GENBID_REGRESS_UPDATE=1 node --test suppliers/regress-*.test.mjs`, đọc `git diff suppliers/fixtures/runs` rồi commit cùng PR.
- `prep` / `findPrep` (io: doc, allDocs, supDir, local, memoDir, today), `pdfToText` (exec), `specPost` / `addToCatalog` (io: git, post, gh, merge, repo) nhận phụ thuộc qua tham số, mặc định như bot chạy: test giả qua đó (`cover-prep.test.mjs`), đừng dựa vào `GENBID_CATALOG_DRY`. Web giả (http) chạy cùng tiến trình với config-bot phải trả `Connection: close`: fetch dùng lại socket server đã đóng → `sizesFor` nuốt lỗi, gói nhiều cỡ thành một cỡ.
- Đo trước/sau: chụp bản cố định của `genbid-work\doc-cache\*.json` trước (phiên khác ghi đè giữa chừng). Chữ HSMT của gói lịch sử trên web chỉ là Chương V, không phải HSMT cả bộ.
