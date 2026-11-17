# Nghiệm thu fix-w1 — bidBasis mất 3 trường + gaps --queue bỏ hãng thiếu website

PR nháp: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/690 (CI api, suppliers, web, server xanh). Nhánh `fix-w1-webreq`, worktree `wt-fix-w1`. Hai commit, mỗi việc một commit.

## Tệp đã đổi
Việc 1: `web/api/webreq.js` (bidBasis + `location`, `field`, `bidCloseDate`), `web/api/test/webreq.test.mjs`, `web/test/requests.spec.mjs` (bỏ `test.fixme` ca location/field/bidCloseDate, xoá chú thích LỖI).
Việc 2: `suppliers/spec-skip.mjs` (mới, chứa `specSkip`), `suppliers/config-bot.mjs` (import + `export { specSkip }`, tên cũ vẫn dùng được), `suppliers/gaps.mjs`, `suppliers/gaps.test.mjs`.
Bẫy import: `gaps.mjs` không bị `config-bot.mjs` import, nhưng vẫn tách `specSkip` ra module lá để `gaps.mjs` không phải kéo `config-bot.mjs` chỉ để lấy một hàm thuần.

## Lệnh kiểm đã chạy
- `node --test suppliers/*.test.mjs` → 820 pass, 0 fail (gồm ca mới của gaps). `node suppliers/verify.mjs` → exit 0.
- `cd web && node --test api/test/*.test.mjs` → 164 pass, 0 fail.
- Playwright `requests.spec.mjs` (Edge): 9 pass, 1 fail ở ca "Phân tích lại → analysisreq" (không liên quan, chạy riêng thì pass; có vẻ lệch thời gian khi chạy song song); ca Gợi ý giá location/field/bidCloseDate đã bỏ fixme và pass.
- CI `suppliers`, `api`, `web`: xem PR.

## Việc 1 — bảng trường bị lọc ở webreq.js (đối chiếu index.html gửi ↔ webreq.js giữ ↔ bot đọc)
| Loại yêu cầu | Trang gửi thêm | webreq.js giữ | Bot đọc | Mất? |
|---|---|---|---|---|
| analysisreq, translationreq, supplierreq, specreq | notifyNo, bidName (specreq: key) | notifyNo, bidName, (specreq: spec:true) | notifyNo, bidName, key | không |
| hsmtreq | sourceUrl, auto, cancel | sourceUrl (chỉ https muasamcong), auto, cancel | sourceUrl, key | không |
| syncreq | mode | mode ("new") | mode | không |
| configreq / findreq | origin, extra, (findreq) target{size, rank, engine, alternator, controller, genset} | origin, extra, target qua `findTarget` (đủ các trường đó) | origin, extra, target.* | không |
| comparereq / tlktreq / hsdtreq | files, text, reqFiles, reqText, translate, templateFiles/Text, configFiles/Text, uploadError | đủ, kiểm đường dẫn `<dir>/<TBMT>/` | đủ | không |
| **bidpricereq.basis** | kva, price, capText, bidForm, investorName, **location, field, bidCloseDate** | trước: 5 trường đầu; **nay thêm 3 trường** (str ≤300 / ≤100 / ≤40, rỗng → "") | bidprice-bot đọc b.kva, b.price, b.capText, b.investorName, **b.location, b.field, b.bidCloseDate** | **có, 3 trường — đã sửa** |

Ghi chú: bot cũng đọc `req.rerate` / `basis.rerate` (cờ thử `try --rerate`), trang không bao giờ gửi: không phải mất. `bidForm` được gửi và giữ nhưng bot không đọc trực tiếp (không hại). Ngoài `bidpricereq`, không loại yêu cầu nào mất trường.

### Số đo ảnh hưởng (ĐO, không ước tính; chỉ đọc doc-cache `bidhist.json`, không gọi agent, không đăng)
`doc-cache` không có `bidpricereq`/`bidprice`, nên lấy 200 gói máy phát có ngày đóng thầu gần nhất trong bidhist (1.546 gói), chạy `BP.nbForecast` hai cách: (a) cách web đang gửi tới bot — chỉ có chủ đầu tư; (b) đủ 3 trường. Mức giá: `BP.calibLevels` trên pool giả (60 phần gần nhất có ratio, ≥2 nhà thầu, đóng trước gói) với giá gói thật. Kịch bản: `scratchpad\nbdiff.mjs` (không nằm trong repo).
- Không có ngày đóng thầu thì `rowsBefore` không cắt: dự báo nhìn cả phần đóng SAU gói (trung bình 1.624 phần thay vì 1.519): nhìn thấy tương lai.
- 200 gói: dự báo đổi nhóm số nhà thầu có xác suất cao nhất ở 24 gói (12%); xác suất một nhóm lệch > 1 điểm % ở 196, > 5 điểm ở 113 gói (lệch trung bình 7,0 điểm, tối đa 41,7).
- Ba mức giá hiệu chỉnh: đổi ở 142/200 gói (71%); lệch > 0,5% giá gói ở 96 gói (48%); lệch mức lớn nhất trung bình 0,74% giá gói, tối đa 5,63%.
- Mẫu 20 gói đầu: 12/20 đổi mức giá, 8 lệch > 0,5%, tối đa 2,43%.
Kết luận: từ lúc bật hiệu chỉnh (11/11), yêu cầu từ web chạy với dự báo thiếu tỉnh/lĩnh vực và nhìn cả tương lai; sửa xong thì khớp với số hậu kiểm trước đó.

## Việc 2 — gaps.mjs --queue
Hành vi mới: hãng (theo mã hồ sơ) mà `specSkip` trả lý do được loại khỏi `ask`; hàng chờ lấy hãng kế tiếp; báo cáo có `noWebsite` ([{name, kind, supplierIds, score}], chỉ hãng xếp ngang hay trên hãng cuối của hàng chờ 10) và dòng "BỎ QUA VÌ HỒ SƠ CHƯA CÓ WEBSITE (cần bổ sung website …)". Hãng có nhiều hồ sơ thì gửi cho hồ sơ có website.
Test: `gaps.test.mjs` (fixture thêm website; ca mới: Cummins hết website → rơi khỏi hàng chờ, hàng chờ ngắn đi 1 do ít ứng viên, `noWebsite` ghi Cummins; một hồ sơ còn website → gửi cho hồ sơ đó).
### Số đo (ĐO, `gaps.mjs` chế độ chỉ báo cáo, doc-cache bidhist + configmatch, `suppliers/cn` của main)
- Toàn bộ 435 hồ sơ: 73 chưa có website.
- Hàng chờ hiện tại (10 hãng): **0 hãng đứng đầu thiếu website**; trước và sau PR hàng chờ giống hệt (Perkins, Cummins, Yuchai, Weichai, MECCA POWER, SDEC, Ricardo, Landtop, Jet Power, Deutz). `--queue 3` hôm nay không bị ảnh hưởng.
- Trong 30 hãng "nên tìm trước": 2 hãng chỉ có hồ sơ không website: **Doosan (xcmg-doosan-engine), MTU (mtu-yuchai)** — nằm ngoài hàng chờ hiện tại, sẽ bị bỏ khi lên cao; ngoài ra Yuchai, Kubota, Yanmar có một hồ sơ không website nhưng còn hồ sơ có website (gửi cho hồ sơ đó).
- Cần Khoa bổ sung website: xcmg-doosan-engine, mtu-yuchai (và 71 hồ sơ khác khi hãng đó lên đầu).

## 3 mẫu đối chiếu
Việc này sửa code, không thêm dữ liệu nhà cung cấp nên không có nguồn web. Đối chiếu bằng code: (1) `index.html:4690` gửi `location, field, bidCloseDate`; (2) `bidprice-bot.mjs:128` đọc `b.location, b.field, b.bidCloseDate`; (3) `config-bot.mjs specPrep` vẫn dùng `specSkip` (ca `cover-prep.test.mjs` pass).

## Rủi ro còn lại / quay lui
- Yêu cầu Gợi ý giá gửi từ bản web cũ trong trình duyệt (chưa tải lại) vẫn thiếu 3 trường: bot xử lý như trước. Kết quả bidprice đã lưu không tự tính lại; cần bấm Gợi ý giá lại mới có dự báo đúng.
- Quay lui: revert từng commit (độc lập nhau).
- Chưa kiểm: chưa chạy một lượt `bidprice-bot` thật với yêu cầu từ web (không gọi agent theo brief); ca Playwright "Phân tích lại" chập chờn khi chạy cả tệp.

## Cần ghi nhớ
- Khoa cần bổ sung website cho xcmg-doosan-engine và mtu-yuchai (2 hãng động cơ nằm trong top 30 cần tìm thông số).
- Sau merge, các gói đã có Gợi ý giá từ web trước đó (từ 11/11) tính dự báo thiếu tỉnh/lĩnh vực/ngày: cân nhắc chạy lại.
