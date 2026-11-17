# Phủ test toàn bộ nghiệp vụ GenSet-Pro (Khoa 13/11/2026: "cần phủ hết")

Bối cảnh: rà soát 13/11 (`nghiem-thu\test-review.md`) cho thấy CI chỉ có `node --test suppliers/*.test.mjs` (548 ca) +
`server` (1 tệp). Chưa có test cho: nhiều hàm thuần đã xuất ra, API Vercel, bot Windows, giao diện web, kết quả agent.

## Quy tắc chung cho mọi việc trong đợt này
- Đọc `C:\Projects\GenSet Pro\genbid-work\dieu-phoi\quy-trinh-session-con.md` trước. Worktree riêng từ `origin/main`,
  PR nháp, KHÔNG tự merge, bản nghiệm thu ở `nghiem-thu\test-<việc>.md`.
- CHỈ thêm test (và phần tối thiểu để test chạy được trong CI). Không sửa hành vi sản phẩm. Thấy lỗi: viết ca
  `test(name, { todo: "lý do" }, fn)` (hỏng không làm đỏ CI) + ghi vào bản nghiệm thu kèm số đo trên
  `genbid-work\doc-cache\*.json` nếu đo được. Mẫu: `suppliers/domain.test.mjs`.
- Số mong đợi lấy từ nghiệp vụ (công thức, quy tắc Khoa chốt trong bộ nhớ `config-suggest.md`, `bidprice-suggest.md`,
  `quy-tac-luong.md`, chú thích trong mã), KHÔNG chép đầu ra của code rồi khẳng định lại. Ca nào chỉ khoá hành vi hiện
  có mà không rõ đúng sai thì ghi chú "khoá hành vi" ngay trong ca.
- Mỗi ca nêu tình huống nghiệp vụ trong tên (tiếng Việt). Có ca biên (ranh giới ngưỡng), ca phủ định, ca dữ liệu bẩn
  (OCR, không dấu, dấu nghìn) lấy từ dữ liệu thật trong doc-cache khi có.
- Test không gọi mạng, không gọi `claude`, không ghi ra ngoài thư mục tạm, không phụ thuộc giờ hệ thống; chạy được trên
  ubuntu (CI) và Windows; cả tệp < 5 giây.
- Không đụng tệp test của việc khác (mỗi việc tệp mới riêng). Cần job CI mới thì thêm tệp workflow RIÊNG
  (`.github/workflows/test-<việc>.yml`), không sửa `ci.yml` (nhiều phiên chạy song song).
- Đo "hàm xuất ra chưa test nào nhắc tới" trước/sau bằng cách đếm tên hàm trong các tệp test (ghi số vào nghiệm thu).
- Kết thúc: báo ≤ 5 dòng (PR, tệp nghiệm thu, số ca, số `todo`, điều cần quyết).

## Các việc
| Mã | Việc | Phạm vi tệp | Model | Đợt |
|---|---|---|---|---|
| T1 | Hàm thuần còn lại của `web/bidprice.js` (cfgKva, cfgPower, readTerms, quoteStale, compRows, lockStats, nbBucket, wonTokens, wonSetRow, vnMadeSet, placeOf, taxKey, bdPrice, compareCfg, engineGroup, engineWords…) | mới: `suppliers/bidprice-rest.test.mjs` | Sonnet | 1 |
| T2 | Hàm còn lại của `suppliers/`: `api-budget.mjs` (viaApi, noteApiSpend, switchToPlan — tiền thật, hạn mức 100 USD/tháng, chuyển gói ở 90), `named-genset.mjs` (10 hàm, gồm quy tắc Khoa 13/11 về lắp ráp dùng động cơ cùng hãng = tương đương, hàng thương hiệu cấp phép = cần xác nhận), `web-memo.mjs`, `read-guard.mjs`, và ~30 hàm của `config-bot.mjs` (sizesFor, ratedPower, sheetChecks, sectionsOf, engineLists, powerRead, hsmtTextOf, capNote, findPrep, targetText, sizeTag, savedSrc…) | mới: `suppliers/cover-*.test.mjs` | Sonnet | 1 |
| T3 | API Vercel `web/api/*.js` (requests, ingest, webreq, lite, quote, gh, bcdg, blob, config): giả Supabase trong bộ nhớ, kiểm lọc trường (`webreq`), `kind=all/stamps/docs`, beat=0, bỏ NCC loại trừ/xoá mềm, `updated_at` luôn đổi khi ghi, dọn activity_log, quyền/token | mới: `web/api/test/*.test.mjs` + `.github/workflows/test-api.yml` | Sonnet | 1 |
| T4 | Hồi quy phần agent không tốn agent: lưu 3–5 lượt Gợi ý cấu hình thật (thư mục lượt: yêu cầu + câu trả lời agent + nguồn, rút gọn) làm fixture, test chạy lại `check` rồi so số đạt / không đạt / chưa rõ, thứ hạng, NCC; tương tự 2–3 lượt Giá gợi ý (`bidprice-bot check`). Ghi cách cập nhật fixture khi đổi quy tắc có chủ ý | mới: `suppliers/fixtures/runs/**`, `suppliers/regress-*.test.mjs` | Opus | 1 |
| T5 | Bot Node: tách hàm thuần của `bot/genbid-hsmt/genbid-sync.js` (chọn tệp Chương V / YCKT, isDecisionFile, isServiceTender, autoConfigRow, checkSelfChecks, splitSections, trimHsmt, chapterV, partsOf/specsMerge, sig…) sang module để test; test `history-extract.js`, `bcdg-reason.js`, `bidders-extract.js`, `search-extract.js` bằng JSON mẫu thật | `bot/genbid-hsmt/**` + workflow riêng; điều phối chép sang `genbid-hsmt\` | Opus | 2 |
| T6 | Bot PowerShell (Pester, chạy bằng pwsh trên CI): `GenBid-Bot.ps1` (lịch Sync, phân nhóm browser/ai/config, Set-ClaudeAuth theo hạn mức, chữ ký yêu cầu đã giao), `Get-GenBidBidderTargets.ps1`, `Merge-GenBidFeed.ps1`, `Publish-GenBidHsmt.ps1` (Get-FileText ngưỡng 30% scan) | `bot/**/*.Tests.ps1` + workflow riêng | Sonnet | 2 (sau T5) |
| T7 | Giao diện web: test khói bằng Playwright trên CI với `serve.js` + DB giả: mở danh sách gói, mở gói, các tab, màn Nhà cung cấp / Nhà thầu / Danh mục, Back về màn trước, không lỗi console; không có hàm trùng tên trong `index.html` | mới: `web/test/**` + workflow riêng | Opus | 2 |
| T8 | `server/` (TypeScript): rà `server/test`, bổ sung cho `muasamcong.ts`, `documents.ts` | `server/test/**` | Sonnet | 2 |
