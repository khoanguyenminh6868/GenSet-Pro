# Review độc lập PR #578 (BCĐG) — chỉ đọc

PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/578 (nhánh `bcdg`, commit `cf60925`). Đọc diff + mã quanh nó trong worktree tạm `wt-review578` (đã xoá). Không sửa code, không push, không ghi web, không chạy bot.

## Kết luận: PHẢI SỬA trước khi gộp (2 lỗi nặng, 3 lỗi vừa); phần web/API ổn.

## Kiểm đã chạy
- `node --check`: genbid-sync.js, bcdg-reason.js, bidders-extract.js, web/api/bcdg.js, ingest.js, requests.js → đều ok.
- `node --test` (gốc repo, nhánh PR) → 395 pass / 0 fail. (Không có test nào cho mã BCĐG mới.)
- Chạy `bcdgReason` với 5 đoạn chữ giả (kết quả bên dưới).
- Tên hàm mới trong `web/index.html`: `bcdgHtml`, `openBcdgFile`, `data-bcdg` mỗi tên đúng 1 định nghĩa + 1 chỗ gọi → không trùng.

## Lỗi, xếp theo mức nặng

### 1. NẶNG — backfill lặp mãi cùng 5 gói khi tải/tải lên lỗi (bot)
`genbid-sync.js` (diff dòng 209 `return \`${key}: không tải được BCĐG\``, dòng 221 `tải lên kho lỗi`, và nhánh `catch` ở dòng 264–265) **không ghi gì** vào `bcdg/<TBMT>`. `Get-GenBidBidderTargets.ps1:79-84` chọn gói chưa có `bcdg` → `Sort-Object | Select -First 5` theo mã gói.
Kịch bản: IB2400104800 có tệp mà Agent luôn trả lỗi (hoặc Supabase từ chối tệp) → mỗi lượt Sync chọn lại đúng gói đó (đứng đầu theo thứ tự chữ), tải 3 lần (`ps(..., 30)` mỗi lần, tối đa 90 phút) rồi bỏ; 5 gói lỗi như vậy chặn vĩnh viễn 14 gói còn lại và mỗi lượt Sync tốn thời gian vô ích. Quy tắc "error → thử lại sau 24 giờ" chỉ áp dụng cho lỗi đọc trang, không cho lỗi tải/tải lên.
Sửa: mọi đường ra của `bcdgStep` không thành công (không tải được, tệp cắt ngắn sau 3 lần, tải lên lỗi hết, exception) đều ghi `bcdg/<TBMT>` `{files:[], error, at}` (giữ 24 giờ chờ), và nên có trần số lần thử (vd `tries` ≥3 thì dừng hẳn, hiện "không tải được" trên web).

### 2. NẶNG — `bcdg-reason.js` bỏ mất đúng dòng lý do, và lấy nhầm đoạn của người khác
- `bcdg-reason.js:62` `PASS = /\s(?:đạt|hợp lệ)\.?$/i` khớp cả "**Không** đạt" / "**không** hợp lệ" ở cuối dòng → dòng tên mình bị bỏ qua (`continue` ở dòng 72).
  Thử: `"b.2) Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên: Không đạt\nLý do: đầu phát hiệu suất 92,8% < 93%."` → `""`. `"Công ty … Thảo Nguyên - E-HSDT không hợp lệ\nThiếu bảo đảm dự thầu."` → `""`. Đây đúng là dạng câu kết luận phổ biến nhất của BCĐG.
  Sửa: loại trừ khi trước "đạt/hợp lệ" có "không|chưa" (vd `(?<!không\s|chưa\s)` hoặc kiểm `neg(L[i])` trước `PASS`).
- `bcdg-reason.js:58` `OTHER` chỉ dừng ở dòng bắt đầu bằng "Công ty/Liên danh/…" hoặc "Nhà thầu <1 từ ≤20 ký tự>:" → "Nhà thầu Minh Long không đáp ứng…", "TNHH Hưng Phát thiếu CO" không bị chặn.
  Thử: `"Công ty … Thảo Nguyên: đáp ứng yêu cầu kỹ thuật.\nNhà thầu Minh Long không đáp ứng về đầu phát.\nTNHH Hưng Phát thiếu chứng nhận CO."` → trả nguyên 3 dòng, web hiện thành "Lý do" của mình dù mình **đạt**.
- `bcdg-reason.js:53` `OUR_NAME = /th.{0,3}o\s*nguy.{0,3}n/i` khớp tên người "Nguyễn Thị Thảo Nguyên" (thành viên tổ chuyên gia, tên rất phổ biến) và bảng so sánh có cột "Thảo Nguyên": thử với danh sách tổ chuyên gia và với tiêu đề bảng "TT Tiêu chí Thảo Nguyên Hưng Phát" → cả hai trả đoạn của nhà thầu khác.
  Sửa: yêu cầu dòng chạm phải có "công ty|cty|TNHH|nhà thầu" quanh "Thảo Nguyên" (hoặc MST), hoặc "thiết bị kỹ thuật thảo nguyên"; dừng đoạn ở mọi dòng nhắc "nhà thầu <tên khác>". Thêm test `node --test` cho 5 ca trên + 13 gói đã có. (Con số "13/19 trích được" của nghiệm thu chưa kiểm là trích **đúng** — nên đếm lại sau khi sửa.)

### 3. VỪA — BCĐG kéo dài lượt lấy nhà thầu / lượt Sync, không có trần thời gian
- `genbid-sync.js` diff dòng 263–266: `bcdgStep` chạy **ngay trong vòng lặp** target, trước các gói thường còn lại → một gói scan làm chậm việc lấy nhà thầu của các gói sau trong cùng lượt.
- Trần mỗi gói: 3 × `ps(..., 30)` (dòng 205) + `ocr-pdf.js` `timeout: 90 * 60e3` mỗi tệp (dòng 177); 5 gói backfill + gói mới final → lý thuyết nhiều giờ. Khoá `takeLock` chỉ coi là cũ sau 3 giờ (`genbid-sync.js:121`) → lượt dài quá 3 giờ có thể bị lượt khác chen vào.
- OCR chạy cả khi tải lên đã lỗi (dòng 215–219: `bcdgText` sau `catch` của upload) → trường hợp bot chạy trước web hoặc Supabase lỗi vẫn OCR tới 90 phút rồi bỏ.
Sửa: dồn các `bcdgOf` về **sau** vòng lặp target; ngân sách tổng cho BCĐG mỗi lượt (vd 20 phút, hết thì để lượt sau); OCR timeout ~15 phút; bỏ qua OCR khi không tệp nào lên kho.

### 4. VỪA — mất tệp/lỗi một phần thành vĩnh viễn, im lặng
- Dòng 208 `got = got.filter(complete)`: gói 2 tệp, 1 tệp vẫn cắt ngắn sau 3 lần → bị bỏ khỏi `out`, `bcdg` vẫn ghi không `error` → không bao giờ thử lại, web không biết thiếu tệp.
- Dòng 215: một tệp upload lỗi (`rec.error`) mà tệp khác lên được → doc ghi không có `error` cấp gói → không thử lại; `bcdgHtml` lọc `f.path` nên tệp lỗi biến mất khỏi giao diện.
- Dòng 188: `reportFiles` rỗng (vd component Vue chứa `evalReportFileInfo` chưa nạp kịp) → ghi `note: "không có tệp"` vĩnh viễn.
Sửa: ghi tệp thiếu/lỗi vào `files` với `error`, đặt `error` cấp gói khi còn tệp chưa lên để quy tắc 24 giờ thử lại; "không có tệp" cũng nên cho thử lại 1–2 lần sau vài ngày.

### 5. VỪA — `SHOW_SRC` (quyết định cần điều phối)
`web/index.html` diff dòng 429: `d.reason` (chính là **đoạn trích nguyên văn**, tiêu đề "đoạn trích nguyên văn quanh tên công ty") hiện không gate `SHOW_SRC`. Giới hạn điều phối: "mọi chỗ hiện câu trích / nguồn phải gate bằng `SHOW_SRC`"; thiết kế (c) cũng ghi "câu trích nguyên văn chỉ hiện khi `SHOW_SRC`". Tác giả cố ý không gate (nghiệm thu ghi rõ). Nếu giữ quy tắc: khi `!SHOW_SRC` chỉ hiện nút tải + một dòng "Báo cáo có nêu lý do — mở tệp để xem" (hoặc chỉ cụm "không đạt về kỹ thuật"); đoạn trích trong `SHOW_SRC`. Kết hợp lỗi 2, hiện đoạn sai mà không gate là rủi ro đọc nhầm.

### 6. NHẸ
- `web/vercel.json`: `api/gh.js`, `api/quote.js` có `maxDuration: 300`, `api/bcdg.js` thì không → tải tệp 19–29 MB qua stream có thể bị cắt ở thời lượng mặc định. Thêm `"api/bcdg.js": { "maxDuration": 300 }`.
- `bcdg-reason.js:69`: khớp MST bằng cách ghép mọi chữ số của dòng (`s.replace(/\D/g,"").includes(tax)`) → dòng bảng nhiều số có thể khớp nhầm; nên khớp `\b4101623015\b` (cho phép khoảng trắng/dấu giữa nhóm số).
- `complete` (dòng 198): chỉ tìm `%%EOF` trong 2 KB cuối; PDF cập nhật tăng dần bị cắt ngay sau một `%%EOF` giữa tệp vẫn qua. Chấp nhận được, có thể so `bytes` với `Content-Length` nếu Agent trả.
- `web/shim.js:83`: nhãn coll cho nhật ký hoạt động chưa có `bcdg` (hiện tên thô).
- Tên `OUR_TAX`/`isMine` trùng ý với `OUR_RE` của web và hằng ở `Get-GenBidBidderTargets.ps1:81` (MST cứng 3 chỗ) — nên một hằng.

## Đã kiểm, ổn
- **API**: `POST sign` chỉ `authorized` (token ingest); key `^[A-Za-z0-9_.-]{1,100}$`, tên làm phẳng `[A-Za-z0-9._-]`, chặn đoạn chỉ gồm dấu chấm, path luôn `<TBMT>/<tên>` (2 đoạn); URL ký phải bắt đầu `/object/upload/sign/`. `GET` kiểm `okId` trước, rồi `memberFrom` (thành viên). Không ghi docs nên không cần `updated_at`; `ingest.js:85` gắn `updated_at` cho mọi row kể cả `bcdg`. `requests.js` thêm `bcdg` vào READABLE (token ingest).
- **Web**: `h` escape mọi giá trị (`& < > " '`) kể cả thuộc tính `data-bcdg`/`data-name`, `reason`, tên tệp, `skipped`; `rows` là chuỗi đã escape rồi mới `raw`. `openBcdgFile` gọi `window.genbidFetch` (shim.js:509) gửi `Authorization: Bearer <access_token Supabase của thành viên>`, nhận Blob; mở cửa sổ trước `await` nên không bị chặn popup. `sig` có `state.bcdg[key]?.at`.
- **Tải lại tệp cắt**: `GenBid-HSMT.ps1` ghi `manifest.csv` `-Append` và `Move-Item -Force` → lần tải lại ghi đè tệp, `load()` lấy dòng mới nhất theo id: đúng.
- **Nuốt lỗi**: `bcdgStep` nằm trong try/catch (chỉ ném lại Captcha); `bidders()` cũng được bọc ở `genbid-sync.js:1324`. Riêng `post` của `unusable`/dòng 262 không bọc — nếu ingest lỗi thì dừng phần còn lại của `bidders()` (gói bcdgOnly đứng cuối danh sách nên gói thường đã xong; nhẹ).

## Thứ tự triển khai
- **Web trước (khuyến nghị)**: an toàn. Web chỉ subscribe `bcdg` rỗng, `bcdgHtml` trả "" khi chưa có doc.
- **Bot trước**: `Get-Coll 'bcdg'` → requests.js 400 → `Get-GenBidRequests.ps1` exit 1 → `throw` → `catch` in cảnh báo, không backfill: an toàn. Gói mới final + có MST mình trên đường thường: tải BCĐG, `/api/bcdg` 404 → `rec.error`, **vẫn OCR** (lỗi 3) rồi bỏ, không ghi gì; lượt sau không tự thử lại (gói đã final không vào danh sách thường) nhưng backfill sẽ nhặt khi web lên. Không hỏng dữ liệu, chỉ tốn thời gian.
- Sau merge nhớ: Backup/chép bot + restart tác vụ bot (vòng điều phối nạp script 1 lần).

## Việc phải làm trước khi gộp
1. Lỗi 1 (ghi `error` cho mọi đường thất bại + trần lần thử).
2. Lỗi 2 (PASS, OTHER, khớp tên người) + test `node --test` cho `bcdg-reason.js`; đếm lại "trích đúng" trên 19 gói.
3. Lỗi 3 (BCĐG sau vòng target, ngân sách thời gian, OCR timeout nhỏ, không OCR khi upload hỏng).
4. Lỗi 4 (tệp thiếu/lỗi một phần ghi vào metadata + thử lại).
5. Điều phối quyết lỗi 5 (`SHOW_SRC`); thêm `maxDuration` cho `api/bcdg.js`.

---

# Vòng 2 — review commit 2a9e07a (chỉ đọc)

Worktree tạm `wt-review578b`. `node --check` genbid-sync.js, bcdg-step.js, bcdg-reason.js, shim.js → ok. `node --test` (gốc repo) → **413 pass / 0 fail**; `suppliers/bcdg.test.mjs` 18/18.

## Kết luận: gần gộp được — còn 2 sửa nhỏ bắt buộc + rebase (xung đột 1 dòng)

### Bắt buộc trước khi gộp
**A. Đoạn trích vẫn kéo lý do của nhà thầu khác khi mục đánh số kiểu "b.2."** — `bcdg-reason.js` `OTHER` (tiền tố `[a-zđ]\d{0,2}[.)]` chỉ khớp "b." hoặc "b2)", không khớp "b.2."; `SECTION` cũng không). Thử:
`"b.1. Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên: hồ sơ hợp lệ, đáp ứng.\nb.2. Công ty TNHH Võ Gia: không đáp ứng tiêu chuẩn khí thải.\n- Thiếu catalogue."` → trả cả 3 dòng: mình ĐẠT nhưng web hiện lý do loại của Võ Gia. ("1.2." và "b2)" thì dừng đúng.) Dạng "b.1./b.2." có trong chữ thật (IB2400438227, IB2400577658 — đoạn IB2400577658 đã kéo dòng "b.2. Công ty TNHH Thương mại Dịch vụ Võ Gia" vào cuối, chỉ thoát nhờ trần 10 dòng). Sửa: tiền tố `[a-zđ](?:\.?\d{1,2})?[.)]` (tương tự trong SECTION) + thêm ca này vào test.

**B. OCR quá giờ → lý do rỗng vĩnh viễn.** `bcdg-step.js`: khi `t.timedOut` chỉ gắn `rec.ocrTimeout`, không đặt `noText`/`error` → doc ghi xong không có `error` → Get-GenBidBidderTargets.ps1 không chọn lại nữa. Thử với deps giả (`text` trả `timedOut:true`) → doc `{files:[{…, path, ocrTimeout:true}], reason:"", …}` không `error`. Thực tế: gói scan 40–60 trang (~8 s/trang) đến lượt khi ngân sách 10 phút chỉ còn vài phút sẽ rơi vào đây (IB2400120387 19 MB/60 trang). Sửa: xử lý `timedOut` như `noText` (`noText:true`, `error` "chưa đọc chữ", không tăng tries).

**C. Rebase lên `origin/main`** (đi trước 10 commit): xung đột duy nhất `web/api/requests.js` dòng `READABLE` (main thêm `supexcl`, `supdeleted`; PR thêm `bcdg`) → giữ cả hai. `genbid-sync.js`, `index.html` tự gộp (`git merge-tree` chỉ báo requests.js).

### Mục 1–5 vòng 1
1. **Lặp vô hạn / bỏ đói backfill — đã hết.** Mọi đường thất bại ghi `{error, tries}` (`failDoc`, `bcdgMarkFail`, nhánh `anyErr`), chờ 1 h/6 h, `giveUp` ở lần 3, Get-GenBidBidderTargets bỏ gói `giveUp`. Gói hết ngân sách trước lượt mình không ghi gì nhưng gói đã xong rơi khỏi danh sách → mỗi lượt luôn tiến. Còn lại (nhẹ, làm sau được):
   - `noText` không tăng `tries` → về lý thuyết chờ mãi nếu gói đứng trước trong hàng đợi luôn ăn hết ngân sách (hiếm).
   - `giveUp` vĩnh viễn: 3 lỗi tạm trong ~8 giờ (vd trang KQLCNT chậm như IB2400104800/IB2600450087 ở vòng 1) là mất luôn. Nên cho hết hạn sau ~7 ngày hoặc có nút thử lại.
   - `bcdgMarkFail`: đọc `prev` lỗi thì `tries` về 1.
2. **Trích lý do — phần lớn đã sửa** (dòng "Không đạt", tên người, cột bảng, MST ghép số; có test). Còn lỗi A.
3. **Ngân sách thời gian — đã sửa, được tôn trọng khi OCR đang chạy**: BCĐG chạy sau vòng target; `spawnSync` OCR `timeout = min(10 phút, còn lại)`; tải `ps(..., floor(còn lại/phút) ≥ 1)` và ngừng thử lại khi còn < 60 s; không OCR khi tải lên lỗi. Vượt tối đa ~1–6 phút (làm tròn lên 1 phút, `-StartOnly` 5 phút, upload không timeout) — chấp nhận được. Hệ quả mới là lỗi B.
4. **Lỗi một phần — đã sửa**: tệp thiếu/lỗi vào `files[].error` + `error` cấp gói, lượt sau chỉ làm lại tệp đó (`keep()`); "không thấy tệp" giờ là lỗi có tries.
5. **SHOW_SRC**: đoạn trích hiện theo quyết định điều phối; tên tệp chỉ khi `SHOW_SRC` (title), nút ghi "Tải báo cáo đánh giá · dung lượng"; `maxDuration 300` cho `api/bcdg.js` và nhãn `bcdg` trong shim.js đã thêm. Escape: mọi giá trị qua `h`, kể cả `title` lồng trong `raw(h\`…\`)` → ổn.

### Chữ thật 19 gói (`genbid-test\bcdg\text`)
14/19 có đoạn; đã đọc cả 14: **không đoạn nào gán lý do của nhà thầu khác cho mình**. Đúng nghĩa: IB2400104800, IB2400438227, IB2500211376, IB2500371475, IB2500438703, IB2600248328, IB2600450087, IB2600478079, IB2600487332, IB2500261097 (đoạn đầu). Nhiễu nhưng không sai nghĩa: IB2600253287 và đuôi IB2500261097 kéo tiêu đề bảng OCR; IB2600365013 kèm câu kiến nghị chung; IB2400577658 bắt đầu giữa câu và dính dòng "b.2. … Võ Gia" (lỗi A); IB2400120387 chỉ có dòng "Không đạt".
**5 gói rỗng — 4 gói lẽ ra trích được** (rỗng là an toàn, web ghi "mở tệp để xem"; không chặn gộp, nên làm vòng sau):
- IB2400254417: "4. CÔNG TY TNHH THIẾT BỊ KỸ THUẬT THẢO NGUYÊN / - Thông số kỹ thuật không đồng độ [bộ] từ một nhà sản xuất." — NEG thiếu "không đồng bộ" (nên coi mọi "không …" trong đoạn dưới mục "các trường hợp không đáp ứng" là lý do).
- IB2400393199: đoạn dưới "Thuyết minh về các trường hợp không đáp ứng…" nêu hàng chào khác yêu cầu (máng cáp, màu RAL), không có cụm NEG.
- IB2600374560: bảng "Lý do không đạt", tên ngắt trong ô ("Công ty TNHH thiết bi | …" / "kỹ thuật Thảo Nguyen | KJA…") nên không khớp tên; lý do rõ (chào 180 kVA < 405 kVA).
- IB2600483082: mình dự trong **"Liên danh TN-HA"** (MST chỉ ở bảng mở thầu); lý do "Liên danh TN-HA: Không đáp ứng về kỹ thuật do không đạt điểm tối thiểu…" — cần lấy tên liên danh từ dòng có MST rồi tìm theo tên đó.
- IB2400564384: chỉ bảng X/OCR rối → rỗng là đúng.

### Lỗi mới do refactor
- Không mất biến dùng chung: `BCDG_MAX_BYTES`, `bcdgReason` không còn dùng trong genbid-sync.js; `doc()` (genbid-sync.js:65) và destructure `{ doc: d }` không đè nhau; `bcdgCleanup` trong `finally` sau khi upload + OCR xong.
- Thứ tự ghi doc ổn: một `post` sau upload + OCR; `bcdgMarkFail` chỉ cho gói bcdgOnly và nuốt lỗi.
- Bỏ rethrow Captcha trong catch BCĐG là đúng (bcdgStep không dùng trang).
- Thứ tự triển khai không đổi so với vòng 1 (web trước an toàn; bot trước không hỏng dữ liệu).
