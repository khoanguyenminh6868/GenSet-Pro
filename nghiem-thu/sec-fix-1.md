# Nghiệm thu sec-fix-1 — vá 4 điểm bảo mật

PR nháp: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/593 (nhánh `sec-fix`, worktree `wt-sec-fix`, chưa merge).

## Tệp đổi
- `bot/genbid-hsmt/genbid-sync.js` (+10): `AutomationSecurity = 3`; `okTenderUrl`; chặn ở `readNotice` và `fetchFiles`.
- `web/api/gh.js`, `web/api/webreq.js`, `web/vercel.json`, `web/index.html`.
- Tệp bot điều phối cần chép vào `genbid-hsmt\`: **chỉ `genbid-sync.js`** (rồi restart bot, theo quy trình). Web tự lên qua Vercel khi merge.

## ĐIỀU CẦN BIẾT TRƯỚC (lệch brief)
Brief nói host `muasamcong.mpi.gov.vn`. Dữ liệu thật: **1556/1556** `url` trong `doc-cache\bidhist.json` là `https://muasamcong.mof.gov.vn`; chính web cũng tự sinh link `mof` (`portalSearch`, `tenderLink`) và bot (`search-extract.js`) dùng `mof`. Nếu chỉ cho `mpi` thì mọi yêu cầu tải hồ sơ sẽ hỏng. Bộ lọc nhận cả `muasamcong.mof.gov.vn` và `muasamcong.mpi.gov.vn`, chỉ https.
Không có `seen/tracked/feed` trong `doc-cache` (nằm trong Supabase), nên chỉ kiểm được bidhist; các `sourceUrl` do bot ghi cùng sinh từ `search-extract.js` (host mof).

## 1. Macro Word
- Chỉ có 1 chỗ mở COM: `wordText` (grep `ComObject|Word.Application|Excel.Application|CreateObject` trên `bot/` + `suppliers/`: 1 kết quả). Thêm `$w.AutomationSecurity = 3` ngay sau tạo đối tượng, trước `Documents.Open`.
- Thử (script `genbid-test\doc-compare.ps1`, cùng lệnh SaveAs2 như bot) trên `genbid-work\specs\IB2200004363\files\CHUONG V - YEU CAU KY THUAT.doc`:
  - trước: MD5 `3774C0FFDC81C35130CD37D98E57B100`
  - sau (AutomationSecurity=3): MD5 `3774C0FFDC81C35130CD37D98E57B100` → chữ ra giống hệt.
  (Script in thêm lỗi “Copy-Item … with itself” do trùng tên biến không phân biệt hoa thường; hash lấy từ chính `out.txt` nên vẫn đúng.)

## 2. Link an toàn, CSP, SRI
`safeUrl(u)` (đặt cạnh `esc`): trả URL chỉ khi `^https?://…` hoặc đường dẫn `/…` (không `//`, không `/\`), còn lại `#`. Kiểm bằng `genbid-test\sec-fix-check.mjs`: `javascript:`, `data:`, `//evil.com`, `/\evil.com`, rỗng, null, `mailto:`, `ftp:` → `#`; https/http/`/api/..` giữ nguyên.

Đã áp:
- website NCC: chi tiết (`s.website`) và danh sách (`s.website` ở dòng “website”);
- `x.url` ở danh sách Nguồn của NCC; `src.url` (nguồn trích dẫn); `catSrcUrl` (Nguồn [n]) và link “trang [n]”;
- `ok[0].pr`, `a.pr` (link PR);
- `tenderLink` (mọi link tbmt + `sourceUrl` gửi yêu cầu): sourceUrl không an toàn → rơi về link tìm kiếm portal; `x.url` ở bảng lịch sử và `r.d.url` ở dòng kết quả cũng vậy (rơi về link portal);
- `f.url` (tệp HSMT): không còn là `href`, xem mục 3.
Cố ý không áp:
- `mailto:`/`tel:`/`wa.me` của `SUP_CONTACT`: chuỗi dựng sẵn trong code với scheme cố định, giá trị chỉ là phần sau (và `safeUrl` sẽ biến thành `#`);
- `script.src` của `loadLib` / `ITALIC_URL` / `FONT_URL`: hằng số trong code, không lấy từ dữ liệu;
- `tenderHref`/`invHref` (hash nội bộ); `window.open("")` rỗng của `openQuoteFile` (chỉ gán blob URL do chính trang tạo); `/api/bcdg?id=` và `/api/quote?id=` (đường dẫn dựng sẵn).
- `location.href` chỉ dùng cho lịch sử điều hướng, không từ dữ liệu.
Thử UI: NCC có `website = "javascript:alert(1)"` và nguồn `data:text/html,x` → hiện `href="#"` cả hai.

CSP (`web/vercel.json`, header `Content-Security-Policy-Report-Only`, mọi đường dẫn):
```
default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://cdn.jsdelivr.net https://cdnjs.cloudflare.com data: blob:; worker-src 'self' blob: https://cdnjs.cloudflare.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'
```
Lý do: `'unsafe-inline'` vì trang là script/style nội tuyến lớn; jsdelivr (supabase-js, jspdf, docx, mammoth, font DejaVu nghiêng) và cdnjs (xlsx, pdf.js + `pdf.worker`); fonts.googleapis/gstatic (Sora, Plex); `*.supabase.co` + wss (API/auth/realtime/storage; tên dự án nằm trong biến môi trường nên dùng ký tự đại diện); `data:`/`blob:` cho ảnh, PDF blob, tệp tải; `worker-src blob:` + cdnjs cho pdf.js. Đăng nhập Google là chuyển trang cấp cao qua Supabase nên không cần nguồn riêng. Chưa chặn gì; chưa có `report-uri` (vi phạm hiện ở console). Chưa quan sát được báo cáo trên Vercel thật; có thể pdf.js/docx cần `'unsafe-eval'` — chỉ biết khi xem console sau khi deploy.

SRI (sha384 tính từ tệp tải về đúng URL đang dùng, kèm `crossorigin="anonymous"`; CDN trả `access-control-allow-origin: *`):
| thư viện | sha384 |
|---|---|
| jspdf 2.5.1 | JcnsjUPPylna1s1fvi1u12X5qjY5OL56iySh75FdtrwhO/SWXgMjoVqcKyIIWOLk |
| docx 8.5.0 | 4xaIisuLEy2lo2HkB2C4rEf7v8jbTb2kuogX6TkuEt9feTWKBSFSOzsqNNbV+sKh |
| xlsx 0.18.5 | vtjasyidUo0kW94K5MXDXntzOJpQgBKXmE7e2Ga4LG0skTTLeBi97eFAXsqewJjw |
| pdfjs 3.11.174 | /1qUCSGwTur9vjf/z9lmu/eCUYbpOTgSjmpbMQZ1/CtX2v/WcAIKqRv+U1DUCG6e |
| mammoth 1.8.0 | /cXAMbzovUIKbBERjPmR3SnPTh8siWr5lsvFYj1Uq4XP0yaJUZJmsh0YXyGv5P0y |
Thêm (ngoài danh sách): supabase-js@2.45.4 (thẻ `<script>` tĩnh) sha384-0w2KAL2YHP6wKOkUDzkCDGgVvfmHnj02DHeQ6XcHOgTfFsGyonKOpShMH1x6nk9o.
Không gắn được: `pdf.worker.min.js` (pdf.js tự nạp worker, không có thuộc tính integrity); 2 tệp font DejaVu nghiêng (`fetch`, không phải script) — chưa gắn. Thử trong trình duyệt: 4 thư viện nạp “ok” với integrity; bản cố ý sai hash bị chặn (“Failed to find a valid digest…”); pdf.js và supabase-js nạp được (vẽ 1 trang PDF, `typeof supabase = object`).

## 3. `api/gh.js` cần đăng nhập
- Nơi web dùng `/_gh/<id>`: ① `openPdf` (`fetch(f.url)`), ② nút tải `<a href=f.url target=_blank>` ở 2 chỗ (ngăn tệp ở chi tiết gói thầu, dòng ~1601 và ~2220), ③ `openQuoteFile` (đã dùng `genbidFetch`). Bot/worker không đọc `/_gh/` (chỉ `Publish-GenBidHsmt.ps1:182` ghi `url`, bot đọc tệp cục bộ) — nhưng `api/gh.js` vẫn cho qua token ingest (`authorized`) phòng khi cần.
- Đổi: `api/gh.js` trả 401 nếu không phải token ingest và không phải thành viên (`memberFrom`); `openPdf` dùng hàm mới `fetchSiteFile` (→ `genbidFetch`); hai nút `<a>` đổi thành `<a href="#" data-dlfile>` + hàm `downloadHsmtFile` (fetch có token, tải blob). `fetchSiteFile` từ chối URL không phải đường dẫn tương đối để không gửi token ra ngoài. Tổng ~25 dòng, dưới ngưỡng 60.
- Thử cục bộ (stub `genbidFetch`; máy chủ thử không có `/api`): nút xem PDF → hỏi `/_gh/123` → vẽ 1 canvas; nút tải → blob `bang.xlsx`; tệp URL `https://evil.example/..` → “địa chỉ tệp không hợp lệ”, không gửi yêu cầu. **Chưa thử** phía server thật (401 không token, 200 có token) — cần xem trên bản preview của Vercel sau khi PR có preview.

## 4. sourceUrl
- `web/api/webreq.js`: `tenderUrl()` — https + host `muasamcong.mof|mpi.gov.vn`, khác thì bỏ trường (`undefined`).
- Bot: `okTenderUrl` ở `readNotice` (ném lỗi “Địa chỉ gói thầu không phải trang muasamcong…”, đường từ hsmtreq/notice/… đều qua đây) và đầu `fetchFiles` (cả nhánh dry + thật; báo lỗi qua `Publish-GenBidHsmt.ps1 -Reason` như các lỗi khác, không `page.goto`).
- Kiểm bộ lọc (`sec-fix-check.mjs`): giữ `mof`/`mpi` https; bỏ `http://`, `muasamcong.mof.gov.vn.evil.com`, `evil.com/muasamcong.mof.gov.vn`, `muasamcong.mof.gov.vn@evil.com`, `file:`, rỗng. Dữ liệu thật: bidhist 1556 URL → qua 1556, không host nào khác.

## Lệnh kiểm và kết quả
- `node --check` genbid-sync.js, gh.js, webreq.js: không lỗi; `vercel.json` parse JSON được.
- `node --test suppliers/*.test.mjs`: tests 479, pass 479, fail 0. Không có test riêng cho web/bot.
- UI cục bộ (serve.js của phiên trước, trỏ vào `wt-sec-fix`, cổng 8795): danh sách (1519 gói), mở gói IB2699000003, xem PDF, tải tệp, màn Nhà cung cấp (433 nút hồ sơ) + chi tiết NCC; console không lỗi (chỉ 1 lỗi cố ý của ca kiểm SRI sai hash và cảnh báo pdf.js “Indexing all PDF objects”). Lưu ý: `C:\Projects\GenSet Pro\.claude\launch.json` không có cấu hình cho phiên này; mình dùng `serve.js` ở thư mục tạm của phiên khác, chạy bằng node trực tiếp rồi tắt.

## Rủi ro và quay lui
- `/_gh` 401: người dùng chưa đăng nhập/không thành viên không xem được tệp (đúng ý). Cờ: nếu có chỗ ngoài web (link đã chia sẻ, thẻ `<a>` trong bản báo cáo tải sẵn) mở thẳng `/_gh/...` sẽ lỗi — mình không thấy chỗ nào trong repo.
- SRI: nếu CDN đổi nội dung cùng phiên bản (hiếm) thì thư viện bị chặn; tính năng PDF/Word/Excel báo “Không tải được thư viện”. Gỡ bằng cách bỏ `integrity`.
- `safeUrl` đổi link dữ liệu lạ (vd website NCC thiếu `https://`, kiểu `www.abc.com`) thành `#`. Đã rà: 5035 `website` + `sources[].url` trong `suppliers/**/*.json` đều http(s), 0 giá trị bị đổi thành `#`.
- CSP report-only không chặn gì.
- Quay lui: `git revert` squash commit của PR; riêng bot thì chép lại `genbid-sync.js` cũ (bản trong `genbid-hsmt` đang chạy chưa bị đụng).

## Chưa kiểm được
- 401/200 thật của `api/gh.js` và `api/webreq.js` trên Vercel; báo cáo CSP thật; bot chạy với `genbid-sync.js` mới (chưa chép, chưa restart); đọc `.doc` qua toàn bộ đường của bot (mới thử cùng lệnh PowerShell).

## Ngoài phạm vi (ghi lại)
- `web/api/blob.js` (`/_blob/:id`) và nút tải `up.url` của tệp tải tay chưa xem có cần đăng nhập không.
