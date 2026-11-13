---
name: session-log
description: "GenSet-Pro: quyết định của Khoa theo từng luồng, bẫy chung, việc còn dở — đọc đầu phiên"
metadata:
  node_type: memory
  type: project
  originSessionId: 712171b8-1398-4e8a-b507-1e2692a83bce
  modified: 2026-11-13T00:28:10.246Z
---

Quy tắc ghi (Khoa 03/11/2026): chỉ ghi điều **quan trọng** — quyết định của Khoa, bẫy, việc còn dở, thứ code/git không nói. Không ghi số PR, tên hàm, số đo, việc đã xong. Sửa mục đã có thay vì thêm dòng. Giữ dưới ~8 KB. Rà gọn 13/11/2026 (bản đầy đủ trước đó: `genbid-work\memory-backup-20261113\`).

## Luồng và quyết định của Khoa
- **Sync** (bot, xem [[bot-ops]]): 10:10, 14:10, 18:10 mỗi ngày kể cả T7/CN; chỉ tìm gói "máy phát điện" chưa đóng. Khoa: Sync KHÔNG cào lịch sử, KHÔNG chạy specs — `genbid-sync.js history`/`history-config`/`specs` chỉ chạy tay. Chữ ký `sig` của feed phải khớp ở search-extract.js, genbid-sync.js, Merge-GenBidFeed.ps1.
- **Chuỗi tự động sau Sync:** gói MỚI → tải tệp → Phân tích → Gợi ý cấu hình → Giá gợi ý. Bấm Phân tích tay giữa chừng thì chuỗi dừng. Gói dịch vụ (bảo dưỡng, sửa chữa, thuê, di dời, vật tư…) không tự Gợi ý cấu hình (Khoa 12/11).
- **Gói lịch sử và gói hiện tại là MỘT khái niệm** (web gộp theo key; bot vẫn 3 nơi lưu, chưa gộp).
- **Nhà thầu gói Đã đóng** (Khoa 04/11): lấy biên bản mở thầu/kết quả cho mọi gói Đã đóng và Bỏ qua, trừ Đã hủy, Không trúng, dự án. Thấy công ty mình ([[company-thao-nguyen]]) trong danh sách → tự chuyển Đã nộp / Trúng / Không trúng.
- **specs** (đọc Chương V mọi gói chưa có phân tích): quy tắc Khoa 03–04/11 — có Chương V webform đủ nội dung → không OCR tệp scan; có tệp Chương V/YCKT riêng → không tải E-HSMT cả bộ; tệp trùng MD5 đọc 1 bản; không có tài liệu kỹ thuật → bảng "Danh mục hàng hóa". Bỏ giới hạn dung lượng/số trang. Dừng gọn: tạo `genbid-work\specs-stop`. Khởi động lại phải tắt cả Chrome hồ sơ `.genbid-browser-spec` (Chrome mồ côi đẩy CPU 100%). Hết hạn mức Claude thì lượt tự dừng, chạy lại tay.
- **Phân tích:** không cảnh báo thủ tục ([[phan-tich-bo-canh-bao]]); có mục Điều khoản hợp đồng (phạt, tạm ứng, thanh toán, bảo đảm) — phân tích cũ chưa có, bấm Phân tích lại. Đối chiếu HSDT có tự kiểm chéo, phát hiện có bằng chứng tính vào kết luận (Khoa 12/11). HSDT chỉ lưu ở máy bot `Downloads\GenBid-HSDT\`, không lên git.
- **Vì sao Thảo Nguyên bị loại kỹ thuật** (19 gói, Báo cáo đánh giá E-HSDT ở `genbid-test\bcdg\`): xuất xứ chỉ 1 gói; còn lại là lỗi soạn hồ sơ (nộp nhầm tệp gói khác, mã hàng lệch catalogue, không trả lời làm rõ, cam kết 48h thay vì 24h), thiếu catalogue / xác nhận hãng / test report / BPTC, và linh kiện trượt một chỉ tiêu (BĐK Smartgen HGM6120 thiếu bảo vệ ngắn mạch, hiệu suất đầu phát, tiêu hao 50% tải, khí thải). 7 chỉ tiêu này thành cảnh báo trên cấu hình hạng 1–3 ([[config-suggest]]).
- **Gợi ý cấu hình / Tìm NCC:** [[config-suggest]]. **Giá gợi ý / báo giá:** [[bidprice-suggest]]. **Dữ liệu NCC:** [[supplier-db]].
- **Nhà cung cấp trên web:** yêu thích (☆, chung cả nhóm; dropdown Báo giá chỉ hiện NCC yêu thích), Loại trừ (mọi bot bỏ qua), xoá mềm. Kẽ hở: `gaps.mjs` và bot đọc tệp repo chưa lọc NCC loại trừ/đã xoá.
- **Web (Vercel, [[no-artifact-version]]):**
  - Trích nguồn bắt buộc trong dữ liệu/agent/code kiểm nhưng web KHÔNG in ra (`SHOW_SRC = false`; chữ hiển thị mới không được nhét câu trích/số nguồn vào note).
  - Mọi tab luôn mở theo ngày đăng giảm dần, không lưu thứ tự theo người dùng.
  - Mọi thao tác chậm phải có spinner (`web/busy.js`; việc không qua fetch bọc `window.genbidBusy(promise)`).
  - Back/quẹt trên điện thoại luôn về màn hình trước: màn hình/chi tiết mới phải thêm vào `navSnap`/`navRestore`; đổi URL dùng `replaceState(history.state, …)`.
  - Nhật ký hoạt động chỉ giữ 1 ngày. Báo giá NCC ở bucket Supabase private "quote".
- **Supabase Free (egress 5 GB/tháng, log 1 GB):** MỌI chỗ ghi `docs` phải đổi `updated_at` (IndexedDB web, doc-cache bot, view đều dựa vào). KHÔNG lọc yêu cầu theo cửa sổ thời gian ở `kind=all` (bot quên chữ ký đã giao). Mọi truy vấn phân trang phải có `.order(...)`. `hsmttext` tải theo từng tài liệu (cả collection → Vercel 502). PR egress phải qua nghiệm thu điều phối.
- **Web tốc độ:** `allTenders()` memo theo identity → luôn THAY object state, đừng sửa tại chỗ. `analysis` trên web là bản rút gọn; cần thông số gói KHÁC gói đang mở thì gọi `db.full` trước. `GenbidCatalog.build` mất 4–7 s → không gọi `catalog()` đồng bộ khi mở màn hình. Sửa catalog.js: so md5 JSON `build()` trên suppliers/cn với origin/main.

## Bẫy chung
- `web/index.html` là một script lớn: hàm trùng tên thì hàm sau đè hàm trước, không báo lỗi → grep tên trước khi thêm; hai session không sửa cùng lúc. Trong h`` viết `data-x="${...}"`. `<input>` thiếu `type` không ăn CSS của trang.
- Sửa mã bằng Edit/Write, không dùng heredoc bash hay `node -e` (hỏng `\`, `\n`; `\b` thành ký tự 0x08). Git Bash đổi đối số bắt đầu bằng `//` thành `/`; pdftotext của Git Bash phải `-enc UTF-8`.
- Đọc tệp: Tesseract + tessdata_best ở `.genbid-tessdata-best`; trang scan xoay 90° phải dò hướng; `tar.exe` hỏng với đường dẫn tiếng Việt (chép sang tên không dấu), RAR dùng UnRAR.exe; .doc qua Word COM lưu format 2 + UTF-8. Lúc tải HSMT (Publish) chưa đọc .xlsx/.doc/.rar.
- muasamcong: VNeGP Agent hay treo → khởi động lại Agent. Gói gia hạn rời feed còn ngày đóng cũ → lấy `bidCloseDate` từ portalids. Gói chào giá trực tuyến rút gọn (CGTTRG) không có mở thầu, kết quả nằm ở tab KQLCNT.
- Thử UI cục bộ: máy không có Python/playwright; `C:\Projects\GenSet Pro\.claude\launch.json` + serve.js (shim DB giả, nạp `suppliers/cn/*.json` và dump bidhist từ doc-cache), trỏ vào `<worktree>/web`. Thử bằng UI thật, đừng chép code ra console; đổi hash không tải lại trang. Browser pane chưa đăng nhập web Vercel; preview Vercel bị "Ignored Build Step".
- Đo trước/sau: chụp bản cố định của `genbid-work\doc-cache\*.json` trước (phiên khác ghi đè giữa chừng).

## Việc còn dở
- Phần lớn PR web chưa được kiểm bằng mắt trên Vercel thật.
- Chờ Khoa chạy SQL tay (chưa rõ đã chạy): policy `is_superadmin()` + chỉ mục cho activity_log; view `pending_requests` và `analysis_lite` (`web/supabase/*.sql`). Sau khi chạy: so egress `kind=all` trước/sau.
- Dữ liệu hãng G7: ~223/431 NCC không có dòng bảng (Caterpillar, FG Wilson, Denyo, Pramac…), thiếu datasheet BĐK PowerCommand/EMCP/Decision-Maker. Khoa 10/11: tạm KHÔNG chạy Tìm Thông Số bổ sung cho hãng tổ máy G7.
- Chờ Khoa quyết (giá): thêm gói 1 nhà thầu vào mẫu; phân vị nội suy (em nghiêng không làm). Xem [[bidprice-suggest]].
- Hồ sơ NCC nghi là thương hiệu cấp phép chưa đánh dấu: himoinsa-china, hipower, aksa-china, agg-fuzhou, cat-tianjin, bruno-generators.
- `reqLabel` ở hàng hoá lịch sử (vd "G7") chưa rõ nghĩa. Tệp HSMT đăng trước 04/11 vẫn `hasText` dù một phần scan.
- Dọn: ~50 thư mục `wt-*` cũ ở `C:\Projects\GenSet Pro\` (xoá bị Permission denied; kiểm theo [[git-workflow]] trước khi xoá); nhánh `feed-data` không còn ai ghi; tác vụ Windows "GenBid specs pause/resume" chờ Khoa xoá tay.
- Trạng thái việc đang giao cho session con nằm ở sổ điều phối, không ghi ở đây ([[orchestrator-delegate-by-model]]).
