# Nghiệm thu: BCĐG (Báo cáo đánh giá E-HSDT) vào bot + web

PR (DRAFT, chưa merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/578 — nhánh `bcdg`, worktree `C:\Projects\GenSet Pro\wt-bcdg`. Thiết kế đã duyệt: `dau-vao\bcdg-thiet-ke.md` + 3 quyết định của điều phối (gói trúng cũng tải; không AI; backfill ≤5 gói/lượt chỉ gói có MST mình; tệp >50 MB bỏ qua).

## Tệp đã đổi
- `bot/genbid-hsmt/bidders-extract.js`: thêm `reportFiles [{id,name}]` (từ `reportFileId` của KQLCNT và `evalReportFileInfo[].fileId`).
- `bot/genbid-hsmt/genbid-sync.js`: `bcdgStep` (tải qua `GenBid-HSMT.ps1 -List` → kiểm PDF đủ `%%EOF`, tải lại ≤2 lần → xin signed upload URL ở `/api/bcdg` → PUT lên bucket → đọc chữ (PDF qua `ocr-pdf.js --max 60`) → `bcdgReason` → ghi `bcdg/<TBMT>`); gọi trong `bidders()` khi `final` và có MST mình; target `bcdgOnly` chỉ ghi `bcdg` (không ghi lại bidders/portalids; nếu trang không đọc được thì ghi `bcdg` {error} để 24 giờ sau mới thử lại); lệnh thử `bcdg --keys K1,K2 [--local] [--keep]`.
- `bot/genbid-hsmt/bcdg-reason.js` (mới): trích nguyên văn các dòng ngay sau chỗ nhắc tên/MST (dừng ở nhà thầu khác/mục mới) có cụm "không đáp ứng/không đạt/thiếu/chưa có/bị loại…"; không AI; không ra thì `reason: ""`.
- `bot/genbid-hsmt/Get-GenBidBidderTargets.ps1`: `-BcdgMax 5`: gói `bidders.final`, có MST 4101623015, chưa có `bcdg/<TBMT>` (hoặc có `error` quá 24 giờ) → thêm vào danh sách với `bcdgOnly`. Đọc `bcdg` lỗi (web chưa có coll) thì bỏ qua bước này, không chặn việc cũ.
- `web/api/bcdg.js` (mới): POST `sign` chỉ với token ingest (`authorized`), key khớp `^[A-Za-z0-9_.-]{1,100}$`, tên được làm phẳng thành `[A-Za-z0-9._-]`, đường dẫn luôn `<TBMT>/<tên>`; GET `?id=<TBMT>/<tệp>` chỉ thành viên (`memberFrom`), stream từ bucket private `bcdg` (bucket tạo lúc dùng lần đầu như `api/quote.js`).
- `web/api/ingest.js`, `web/api/requests.js`: thêm coll `bcdg`.
- `web/index.html`: `state.bcdg` + `subscribe("bcdg")` + sig làm mới; `bcdgHtml(key)` hiện trong `biddersHtml`: nút tải từng tệp (+ dung lượng), tệp bị bỏ ghi lý do, `reason` trong `<details>` ("đoạn trích nguyên văn quanh tên công ty"), không có lý do thì "Chưa trích được lý do…". `openBcdgFile` tải qua `window.genbidFetch`. Đoạn lý do là chính nội dung hiển thị nên không gate `SHOW_SRC`; câu trích/số trang riêng không có.

## Lệnh kiểm đã chạy + đầu ra thật
- `node --check genbid-sync.js` → ok; PowerShell Parser trên `Get-GenBidBidderTargets.ps1` → 0 lỗi; script inline của `index.html` trích ra `node --check` → ok.
- `bcdgHtml` chạy trong node với `h/raw` thật: ra HTML đúng, `<`/`&` trong tên và lý do bị escape; không có bcdg → chuỗi rỗng.
- `api/bcdg.js` chạy với `fetch` giả (scratchpad `bcdg-api-test.mjs`): sign đúng token → `{path:"IB2400104800/754ca72f-03._BCDG_E-HSDT_Goithau.pdf", url:".../object/upload/sign/bcdg/..."}`; thiếu/sai token → 401; key `../x` → 400; tên `..` hoặc `a/../b.pdf` bị làm phẳng thành `_` / `a_.._b.pdf` (không còn đoạn `..`); GET thành viên → 200 stream; không đăng nhập → 401; `id` có `..` → 400.
- Logic chọn backfill (PowerShell, dữ liệu giả A–F: không phải của mình, chưa final, đã có bcdg, lỗi 2 ngày, lỗi 1 giờ) → chọn đúng `A,E`.
- Chạy thật trên muasamcong + Agent, `--local` (tải + đọc chữ, KHÔNG upload, KHÔNG ghi web), profile riêng `bcdgtest`, bản thử ở `genbid-test\kit-bcdg\`, tệp ở `genbid-test\bcdg-run\`:

| Gói | Tệp bot tải | md5 so với tệp tải tay (`bcdg\files\`) | reason |
|---|---|---|---|
| IB2600248328 | BCĐG-0001.pdf 4.256.271 B | trùng 431e32c7… | có (OCR) |
| IB2400120387 | 19.642.038 B | trùng 0c980719… | rỗng (OCR 60 trang) |
| IB2500371475 | 759.313 B | trùng b5c7b853… (lượt 2) | có |
| IB2500438703 | trùng 781865b3… | | có |

Lượt 1 của IB2500371475 tải 450.079 B (cắt ngắn, không có `%%EOF`, ocr đọc 0 trang, reason rỗng); tải lại độc lập ra đúng 759.313 B. Vì vậy thêm kiểm `%%EOF` + tải lại; bước kiểm đã xác nhận phân biệt được tệp cắt (0) với tệp đủ (1) trên chính hai tệp đó; đường tải lại tự động chưa chạy thật vì lượt 2 tải đủ ngay.

## Số đo (đo, không ước tính)
Trên 19 gói tải tay: 13/19 trích được lý do bằng `bcdg-reason.js` từ chữ đã OCR sẵn (`genbid-test\bcdg\text`), 6 rỗng (IB2400120387, IB2400254417, IB2400393199, IB2400564384, IB2600374560, IB2600483082; phần lớn chữ OCR lỗi hoặc bảng). Trước: 0 gói có BCĐG trên web.
Dung lượng 19 gói: 100 MB (21 tệp, trung vị ~1 MB, lớn nhất 29 MB < 50 MB nên không gói nào bị bỏ).

## 3 mẫu đối chiếu nguồn (tệp BCĐG đã tải từ muasamcong)
1. IB2500371475, "BAO CAO DANH GIA E-HSDT - MAY PHAT DIEN BENH VIEN 21-10 th.pdf" (fileId 8d1a8c22-9b05-41ac-9eb4-cb75294227e4): reason bắt đầu "b.2) Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên: Nhà thầu không đáp ứng đầy đủ theo yêu cầu của E-HSMT." (khớp dòng 229–230 của `text\IB2500371475.txt`, trang đánh giá kỹ thuật).
2. IB2600248328, "BCĐG-0001.pdf" (feac9fed-3e7b-4df8-a5ce-784c7b6cc15b, bản scan): reason "TNHH Thiết bị Kỹ thuật Thảo Nguyên không đạt về kỹ thuật do E-HSMT yêu cầu: … nhà thầu chào: “Xuất xứ: Trung Quốc”." (OCR đọc sai một chữ: "Xudt xứ"; web có cảnh báo khi `scan`).
3. IB2500438703 (BAO CAO DANH GIA E-HSDT - MAY PHAT DIEN…): reason "b.4) Công ty TNHH Thiết bị kỹ thuật Thảo Nguyên - Theo đề xuất của nhà thầu là điện áp danh định của Đầu phát là “380/220VAC hoặc 400/230 VAC” đều có hiệu suất “93%”;…" (hiệu suất STAMFORD UCDI274K chỉ 92,8% < 93%).
Trang nguồn: https://muasamcong.mof.gov.vn (KQLCNT của từng TBMT, tệp ở mục báo cáo đánh giá).

## Rủi ro còn lại + quay lui
- Không kiểm được ở môi trường thật: PUT lên Supabase bằng signed upload URL (bot dùng FormData giống supabase-js `uploadToSignedUrl`; đã kiểm phía `api/bcdg.js` bằng fetch giả nhưng chưa từng gọi Supabase thật), tạo bucket `bcdg`, tải xuống từ web, giao diện thật trong trình duyệt (chưa dựng server thử với DB giả). Lỗi upload không làm hỏng gì: `rec.error` trong metadata, tệp tải xong vẫn xoá, `bcdg` không ghi nếu không tệp nào lên được và không phải bỏ vì >50 MB (lượt sau thử lại).
- IB2600450087 và IB2400104800: `bidders-extract.js` báo "Trang chưa có biên bản mở thầu hoặc kết quả" (không đọc được `lotResultDTO`; có thể hết thời gian chờ). Hai gói này chưa thử được BCĐG. Trong vận hành, gói chỉ thành mục backfill khi `bidders/<TBMT>` đã `final` có MST mình nên không gặp lại lỗi này, nếu gặp thì ghi `bcdg.error` và thử lại sau 24 giờ.
- Bản trích lý do là cắt dòng bằng quy tắc: có thể thừa (bảng nhiều dòng) hoặc thiếu; nên người dùng được nhắc mở tệp. Chữ OCR có thể sai dấu.
- Thứ tự triển khai: merge PR → Vercel deploy (coll `bcdg`/`api/bcdg`) TRƯỚC → rồi `bot\Backup-GenBidBot.ps1`/chép bot, restart tác vụ bot. Nếu bot chạy bản mới trước khi web có `bcdg`, `Get-GenBidBidderTargets.ps1` chỉ in cảnh báo; `genbid-sync.js` ghi lên web sẽ báo lỗi.
- Quay lui: revert PR, trả `genbid-hsmt\` bản `.bak`; bucket `bcdg` và coll `bcdg` giữ nguyên không ảnh hưởng gì (xoá bucket nếu muốn).

## Lệnh backfill 19 gói đã tải tay (để điều phối chạy sau khi triển khai; phiên này KHÔNG chạy)
Tự động: các lượt Sync sau khi chạy bản mới tự lấy ≤5 gói/lượt (19 gói → khoảng 4 lượt). Chạy ngay, thủ công, ghi thật (cần khoá lượt worker không bận, và bot dừng việc khác):
```
node "C:\Projects\GenSet Pro\genbid-hsmt\genbid-sync.js" bcdg --keys IB2400104800,IB2400120387,IB2400254417,IB2400393199,IB2400438227 --profile bcdgtest
```
(lặp với các nhóm 5 mã còn lại trong `genbid-test\bcdg\lists\files-<TBMT>.txt`: IB2400564384, IB2400577658, IB2500211376, IB2500261097, IB2500371475 / IB2500438703, IB2600248328, IB2600253287, IB2600365013, IB2600374560 / IB2600450087, IB2600478079, IB2600483082, IB2600487332). Bỏ `--local` thì ghi thật; thêm `--dry` chỉ liệt kê.
Chú ý: gói chạy tay sẽ đọc lại trang KQLCNT qua browser (khoảng 1 phút/gói, gói scan lớn thêm 5–15 phút OCR).

## Việc chưa kiểm được
UI thật; Supabase thật (upload + tải xuống + tạo bucket); đường tự tải lại tệp cắt; hai gói báo "chưa có biên bản mở thầu"; gói trúng (chưa có gói nào trong 19 là gói trúng nên reason cho gói trúng chưa thử, dự kiến rỗng vì không có cụm từ loại).

---
# Vòng sửa theo review (commit 2a9e07a, cùng PR #578)
Đối chiếu `bcdg-review.md`:
1. **Thử lại có trần** (`bot/genbid-hsmt/bcdg-step.js`, mới): mọi đường thất bại (không thấy tệp trên trang, lỗi tải, tệp cắt ngắn sau 3 lượt tải, lỗi tải lên, trang KQLCNT không đọc được cho gói backfill) ghi `bcdg/<TBMT>` `{files, error, tries, at}`; lần lỗi thứ 3 thêm `giveUp:true` + lý do. `Get-GenBidBidderTargets.ps1` chọn lại gói có `error` sau 1 giờ (tries 1) hoặc 6 giờ (tries ≥2), không chọn gói `giveUp`. Đã kiểm logic chọn bằng dữ liệu giả A..J: chọn đúng gói chưa có doc, lỗi quá hạn chờ; bỏ gói chờ chưa đủ, giveUp, đã xong.
2. **bcdg-reason.js viết lại**: chỉ nhận dòng có tên đầy đủ "Thiết bị Kỹ thuật Thảo Nguyên" (chịu OCR lệch dấu, tên ngắt dòng), "Công ty/Cty/TNHH/Nhà thầu … Thảo Nguyên" trong một câu, hoặc MST (khớp cả `4101.623.015`, không khớp khi dính chữ số khác). Giữ dòng "… Không đạt/không hợp lệ" cuối dòng; dừng đoạn ở dòng mở nhà thầu khác (Công ty/TNHH/Nhà thầu <tên>…); dòng bảng xếp hạng chỉ lấy dòng của mình; tên người và cột bảng không còn khớp. Số đo mới trên chữ thật 19 gói: **14/19 trích được**, 5 rỗng (IB2400254417, IB2400393199, IB2400564384, IB2600374560, IB2600483082). Đã đọc từng đoạn của IB2400120387, IB2500261097, IB2600248328, IB2400577658, IB2500211376, IB2600253287, IB2600365013, IB2600450087, IB2400104800, IB2500371475, IB2500438703, IB2600478079, IB2600487332: đều nhắc đúng công ty mình; còn tồn tại: đoạn IB2600365013 kèm 1 câu kết luận chung dòng dưới, IB2600253287 kèm vài dòng tiêu đề bảng.
3. **Ngân sách thời gian**: BCĐG chạy SAU vòng các gói trong `bidders()`, trong một ngân sách 10 phút/lượt (gói nào chưa tới lượt hoặc hết giờ → để lượt sau, không ghi); tải bị cắt theo ngân sách (mỗi lần gọi Agent tối đa 10 phút); OCR ≤10 phút/tệp (và ≤ thời gian còn lại; còn <30 giây thì không OCR, đánh dấu `noText`, lượt sau chỉ đọc chữ, không tải lên lại, không tính vào tries); tệp tải lên lỗi thì không OCR. `web/vercel.json`: `api/bcdg.js` maxDuration 300.
4. **Test đơn vị** `suppliers/bcdg.test.mjs` (CI chạy `suppliers/*.test.mjs`): 18 test, gồm bcdgStep với deps giả: thành công; không thấy tệp; lỗi tải → tries 1..3 → giveUp; tệp cắt ngắn; lỗi tải lên một phần + lượt sau chỉ làm lại tệp lỗi; giveUp khi lỗi một phần; tệp >50 MB (skipped, không lỗi); hết giờ trước khi bắt đầu (không ghi); hết giờ giữa chừng (noText rồi đọc chữ lượt sau); đã xong thì không ghi lại; bcdg-reason với các ca của review (dòng "Không đạt", người khác dưới đoạn của mình, tên người, cột bảng, MST) + chữ thật 19 gói (≥14, mọi đoạn nhắc công ty mình). `node --test suppliers/*.test.mjs` → **413 pass / 0 fail**.
5. **Web**: `bcdgHtml` đổi tiêu đề "Trích báo cáo đánh giá" (đoạn trích HIỆN theo quyết định điều phối); tên tệp chỉ hiện khi `SHOW_SRC` (nút chỉ ghi "Tải báo cáo đánh giá · dung lượng"); thêm trạng thái "Đang lấy…" / "Chưa lấy được … (đã thử nhiều lần)" / "Còn tệp chưa lấy được, bot sẽ thử lại"; nhãn nhật ký hoạt động `bcdg` trong `shim.js`. Đã chạy `bcdgHtml` trong node với 5 trạng thái, HTML đúng, `<`/`&` được escape.
6. Mục NHẸ: MST một hằng (`OUR_TAX` xuất từ `bcdg-reason.js`, dùng ở genbid-sync.js; còn cứng trong ingest.js, index.html và .ps1 cũ như trước); `complete` vẫn kiểm `%%EOF` 2 KB cuối.
Chạy thật lại sau refactor (`--local`, profile bcdgtest, không upload/ghi web): IB2500438703 tải đủ, md5 781865B3… trùng tệp tay, có lý do; IB2500371475 chạy tiếp (kết quả trong `genbid-test\bcdg-run\run3.log`).
Chưa kiểm được: như trên (Supabase thật, UI thật, đường tải lại tệp cắt trên Agent thật).

---
# Vòng 2 (commit f15cd2e, đã rebase lên origin/main; xung đột `READABLE` giữ `supexcl`, `supdeleted` + `bcdg`)
- A: `OTHER` nhận tiền tố mục `b.2.`, `b.2)`, `b2.`; test dùng đúng dòng "b.2. Công ty TNHH Thương mại Dịch vụ Võ Gia" của IB2400577658 (đoạn của mình không còn kéo lý do của Võ Gia).
- B: OCR quá giờ → tệp giữ trên kho nhưng `noText`, `error: "OCR quá giờ…"`, `tries`+1, thử lại theo 1h/6h, `giveUp` ở lần 3; lần sau đọc được thì hết `error` và có `reason` (2 test mới).
- `node --test suppliers/*.test.mjs` sau rebase: **446 pass / 0 fail** (`bcdg.test.mjs` 21 test).
## Làm sau (không làm ở PR này)
4 gói rỗng lẽ ra trích được: IB2400254417 ("không đồng bộ" chưa là cụm lý do), IB2400393199 (đoạn dưới "các trường hợp không đáp ứng" không có cụm lý do), IB2600374560 (tên bị ngắt trong ô bảng), IB2600483082 (Liên danh TN-HA: lấy tên liên danh từ dòng có MST rồi tìm theo tên đó). Nhẹ: `giveUp` vĩnh viễn (nên hết hạn sau ~7 ngày hoặc có nút thử lại); `bcdgMarkFail` đọc `prev` lỗi thì tries về 1.

---
# BÀN GIAO: OCR hai bước cho BCĐG scan (việc mới sau khi #578 gộp) — chưa làm, cần phiên khác
Phiên hiện tại đã dùng nhiều context (>35%), nên không bắt đầu; phiên mới đọc mục này rồi làm. Nhánh mới từ `origin/main` (worktree `wt-bcdg-ocr`), PR DRAFT, nghiệm thu `nghiem-thu\bcdg-ocr.md`, không merge, không chép vào `genbid-hsmt`, thử ở `genbid-test\` (kit-bcdg + `GENBID_BCDG_DIR`, `--local`, profile `bcdgtest`; xem `run1..3.log` làm mẫu).
Yêu cầu của điều phối:
1. OCR 2 bước cho PDF scan: lượt nhanh 150 dpi (~2 s/trang, giống nhánh `--find` của `ocr-pdf.js` dòng ~100–110, ảnh `h*.png`) trên MỌI trang để tìm trang có tên công ty / MST 4101623015 (so khớp chịu lỗi OCR, bỏ dấu), rồi OCR đầy đủ CHỈ các trang đó ±1 trang; không thấy trang nào → `reason` rỗng, KHÔNG thử lại. Trần 10 phút/tệp.
2. Lưu kết quả OCR từng trang ra đĩa cạnh tệp (`Downloads\GenBid-BCDG\<TBMT>\`) để lần thử sau đọc tiếp. Lưu ý: `bcdgCleanup` hiện xoá thư mục `<TBMT>` sau mỗi gói (`genbid-sync.js`), và `bcdgDownload` xoá thư mục khi bắt đầu → phải để thư mục cache riêng (vd `GenBid-BCDG\_ocr\<TBMT>\<md5>.json`) hoặc không xoá khi còn `noText`.
3. Lỗi `scan`: khi OCR quá giờ, `ocr-pdf.js` bị giết trước khi in "OCR n/m" nên `t.ocr = 0` → `scan` ghi false (`bcdg-step.js` dòng ~58: `if (t.ocr) scan = true`). Sửa bằng cách nhận biết scan từ chính `ocr-pdf.js` (in dòng riêng sớm) hoặc từ `timedOut`/số trang scan.
4. Lệnh `bcdg --keys … --reread`: chỉ đọc lại chữ + trích lý do cho gói đã có tệp trên kho (tải lại tệp để OCR hoặc dùng cache), xoá `error`/`tries`/`giveUp`, KHÔNG upload lại; ghi `bcdg/<TBMT>` (không `--local`) hoặc in ra (`--local`).
Thử: IB2400120387 (scan 19,6 MB, ~27 s/trang khi OCR đầy đủ, hết 10 phút ở trang 19) + ≥2 gói scan khác trong 19 gói (scan: IB2400393199, IB2600248328, IB2600374560, IB2600450087, IB2600253287, IB2400564384, IB2500261097, IB2600487332, IB2600483082; xem `genbid-test\bcdg\text\*.err`); so đoạn trích với `genbid-test\bcdg\text\`, báo thời gian mỗi gói.
Bẫy đã gặp: heredoc bash làm hỏng `\`; `ocr-pdf.js` tìm trang bằng `--max 60` hiện đang đọc 60 trang đầu đầy đủ chất lượng (`BCDG_OCR_PAGES` trong `genbid-sync.js`); có tiến trình OCR của bot đang chạy cùng lúc làm chậm; `bcdg-reason.js` trả "" khi không thấy tên (đúng ý). Test: thêm vào `suppliers/bcdg.test.mjs`.
