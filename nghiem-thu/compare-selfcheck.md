# Nghiệm thu: Đối chiếu tự kiểm chéo HSDT

PR (draft, chưa merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/535 — nhánh `feat/compare-selfcheck`, worktree `C:\Projects\GenSet Pro\wt-compare-selfcheck`.

## Phát hiện khi đọc code
- `runCompare0` KHÔNG còn trong web: web chỉ gửi `comparereq`, prompt nằm duy nhất ở `bot/genbid-hsmt/compare-prompt.md` (nhắc `runCompare0` trong đó là lỗi thời). Nên chỉ sửa một nơi.
- JSON đi: bot `ask`/agent → `result.json` → `runFinish` → `checkResult` (kiểm `requirementQuote`/`offered`, tính điểm) → post `compare/<key>`; web `comparisonHtml` vẽ. Các trường lạ trong kết quả được giữ nguyên qua `runFinish`, nên `selfChecks` đi tới web không cần sửa thêm.

## Tệp đã đổi (4 tệp, +152/−1)
- `bot/genbid-hsmt/compare-prompt.md`: thêm đoạn "Commitments" (so từng con số cam kết với HSMT) và đoạn "Self-check" với 7 loại `package_identity`, `model_consistency`, `commitment_vs_hsmt`, `row_match`, `catalogue_vs_offer`, `supporting_docs`, `adverse_wording`; JSON thêm `selfChecks: [{kind, status ok|problem|unclear, finding, evidence:[{file, quote}], hsmtQuote, fix}]` và `selfCheckNote`. Quy tắc: problem/ok phải có trích nguyên văn kèm tên tệp từ tiêu đề `--- Tệp: ... ---`.
- `bot/genbid-hsmt/genbid-sync.js`: `subSections` + `checkSelfChecks`, gọi trong `checkResult` (chỉ kind `compare`). Mỗi bằng chứng phải thấy trong chữ HSDT (ưu tiên đúng phần của tệp nêu tên; đúng chữ nhưng sai tên tệp thì giữ chữ, bỏ tên); `problem` không còn bằng chứng thật → bỏ cả phát hiện; `ok` không bằng chứng → `unclear`; `hsmtQuote` không thấy trong HSMT → xoá trường; `kind`/`status` lạ → bỏ. Một tệp duy nhất → `selfCheckNote` "chưa kiểm chéo được". Ghi chú tự động đếm số phát hiện bị bỏ.
- `web/index.html`: `selfChecksHtml` + `SELF_LABEL/SELF_ST` (đã grep: không trùng tên), CSS `.st.ok/.st.problem`; mục "Tự kiểm hồ sơ dự thầu" nằm trên bảng đối chiếu, vấn đề trước, mở sẵn. Câu trích, tên tệp, `hsmtQuote` chỉ hiện khi `SHOW_SRC`. Kết quả cũ không có `selfChecks`/`selfCheckNote` → không vẽ gì.
- `suppliers/selfcheck.test.mjs`: 8 test (cắt đoạn code từ `genbid-sync.js` rồi chạy trong `vm`, vì script bot không phải module).

## Lệnh kiểm và đầu ra thật
- `node --test suppliers/selfcheck.test.mjs` → `# tests 8 / # pass 8 / # fail 0`
- `node --test suppliers/*.test.mjs` → `# tests 262 / # pass 262 / # fail 0`
- `node --check bot/genbid-hsmt/genbid-sync.js` → syntax ok
- CI GitHub: xem PR (kiểm lại khi duyệt).
- Chưa chạy `server`/`app` (không đụng).

## Thử 3 ca giả (không dùng HSDT thật)
Dữ liệu tự dựng ở `C:\Projects\GenSet Pro\genbid-test\selfcheck-mock\` (hsmt.txt, bang-chao.txt, bien-phap.txt, catalogue.txt; chạy `node run.mjs` trong thư mục đó; kết quả `result.json`, đầu ra thô `raw.txt`). Gọi `claude -p --model sonnet` với prompt mới, rồi chạy qua `checkResult` thật. Một lần chạy (chưa lặp để đo độ ổn định):
- Ca 1 (tệp gói khác): BẮT ĐƯỢC. `package_identity` problem: biện pháp thi công ghi IB2600365013, Đập tràn Đơn Dương, 180 kVA; hai trích dẫn đều qua kiểm.
- Ca 2 (GM96 vs GR-96): BẮT ĐƯỢC. `model_consistency` problem, trích cả hai tệp.
- Ca 5 (hiệu suất 93% vs catalogue 92,8%): BẮT ĐƯỢC. `catalogue_vs_offer` problem.
- Thêm ngoài ca: cam kết 48 giờ vs ≤ 24 giờ (cả mục `items` not_met lẫn `commitment_vs_hsmt`), câu "mọi khiếu nại sau đó… không được chấp nhận" (`adverse_wording`), thiếu catalogue bộ điều khiển và ủy quyền (`supporting_docs`; lưu ý model còn nói "có catalogue động cơ" – đúng với dữ liệu giả). `row_match` trả `unclear` vì dữ liệu giả không có bảng hàng-theo-hàng. Phát hiện bị `checkResult` bỏ: 0/7 (mọi trích dẫn đều thấy nguyên văn).
- Giới hạn: dữ liệu giả sạch, chữ có sẵn; chưa thử PDF scan/bảng nhiều cột thật, nên chưa biết tỷ lệ bỏ nhầm do `found()` ở bảng pdftotext (hàm này đã có cơ chế `nearby` cho bảng).

## Ảnh hưởng tới kết luận chung (chưa đổi, chờ quyết)
Hiện `selfChecks` KHÔNG đổi `overallScore`/`verdict` (có test). Phương án:
1. Giữ nguyên (đang làm): chỉ hiện mục riêng; người đọc tự cân.
2. Có `problem` thuộc `package_identity`/`model_consistency`/`catalogue_vs_offer` đã xác minh thì không cho `verdict = pass` (hạ xuống `at_risk`), không đụng điểm. Thay đổi 3 dòng ở `checkSelfChecks`. Đề xuất chọn sau khi chạy vài gói thật để xem tỷ lệ báo nhầm.
3. Trừ điểm theo problem: không khuyên, thiếu số liệu.

## Rủi ro và quay lui
- Prompt dài hơn (~+1.3k ký tự) và model phải xuất thêm mảng → tốn token hơn chút, có thể bắt nhầm (nhất là `supporting_docs` khi tệp scan không có chữ → model nên trả `unclear`, chưa kiểm).
- Nhiều tệp scan: trích dẫn từ ảnh sẽ không qua kiểm → phát hiện bị bỏ (an toàn nhưng bỏ sót).
- `checkSelfChecks` chạy trong `checkResult`; nếu lỗi sẽ rơi vào `catch` của `runFinish` ("Kết quả không hợp lệ"). Đã test với đầu vào thiếu/null.
- Quay lui: revert PR, chép lại 2 tệp bot cũ; kết quả đã lưu có `selfChecks` vẫn không làm hỏng web cũ (trường lạ bị bỏ qua).

## Việc phiên điều phối làm sau khi merge
1. Chép `bot/genbid-hsmt/compare-prompt.md` và `bot/genbid-hsmt/genbid-sync.js` từ main sang `C:\Projects\GenSet Pro\genbid-hsmt\` (hoặc `git pull` ở RepoDir rồi chạy chiều ngược của `bot\Backup-GenBidBot.ps1`; chiều xuôi sẽ ghi đè nếu chạy nhầm).
2. Restart tác vụ bot (vòng điều phối nạp script một lần).
3. Chạy một Đối chiếu thật trên một gói đã bị loại (ví dụ IB2600374560) để xem tỷ lệ bắt/bỏ nhầm trước khi quyết phương án 2.
4. Việc ngoài phạm vi: câu mở đầu `compare-prompt.md` còn nhắc `runCompare0` (đã không còn), có thể sửa chữ sau.

## Bổ sung 12/11: selfChecks vào điểm và kết luận (Khoa chốt "gộp luôn")
PR draft mới: xem link trong báo cáo (nhánh `feat/compare-selfscore`, từ main c9e6c24). Đổi `genbid-sync.js` (`scoreItems(items, extra)`, `selfCheckItems`, tính ở `checkResult` sau `checkSelfChecks`), `web/index.html` (+1 dòng `selfCheckImpact` cạnh kết luận; web không tự tính lại điểm nên không phải sửa thêm), `suppliers/selfcheck.test.mjs`.
- Quy tắc: chỉ `problem` còn bằng chứng đã kiểm. identity/model/catalogue/row = critical not_met (trọng số 2); supporting_docs = missing; adverse_wording = partial; commitment_vs_hsmt không cộng điểm nhưng không cho `pass` (không hạ `fail`). Không chèn vào `result.items`. Kết quả cũ/không có problem: điểm cũ, không có `selfCheckImpact` (có test).
- Test: thêm 10 test cho từng quy tắc; `node --test suppliers/*.test.mjs` → 272 pass, 0 fail.
- Bộ giả `genbid-test\selfcheck-mock` (cùng một đầu ra thô `raw.txt`, chạy qua code cũ và mới): trước 44 điểm, `fail`; sau 31 điểm, `fail`, `selfCheckImpact` = "3 lỗi nghiêm trọng…; 2 vấn đề khác…; cam kết lệch HSMT…. Nếu không tính tự kiểm: 44 điểm."
- Rủi ro: báo nhầm của model giờ làm điểm tụt và dễ `fail`; mức bảo vệ duy nhất là bằng chứng phải có nguyên văn trong HSDT. Quay lui: revert PR (kết quả đã lưu giữ điểm đã tính, chỉ gói chạy lại mới đổi). Sau merge: chép `genbid-sync.js` sang `genbid-hsmt\` và restart như trên.
