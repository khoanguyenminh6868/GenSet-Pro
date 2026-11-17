# Sổ điều phối GenSet-Pro

Phiên điều phối đọc tệp này đầu phiên, cập nhật sau mỗi cổng duyệt. CHỈ ghi việc đang mở. Việc khép thì xoá dòng ở đây và thêm MỘT dòng (ngày, việc, PR, tệp nghiệm thu) vào cuối `so-dieu-phoi-da-khep.md`; số đo và chi tiết nằm trong `nghiem-thu\`. Quyết định của Khoa ghi vào bộ nhớ, bẫy code ghi vào `CLAUDE.md` của repo. Giữ tệp dưới ~5 KB.

Viết gọn lại 13/11/2026 (sáng, giờ VN). Cập nhật 16/11: #786 (nối chuẩn hoá) và #813 (gộp dòng lặp) đã khép; PR #787–#812 ngày 14–16/11 không qua sổ. Bản đầy đủ trước đó: cuối `so-dieu-phoi-da-khep.md`. **Chi tiết từng việc mở (quyết định, dữ liệu, script đo, các bước): `chi-tiet-viec-mo.md`** (17/11).

## Đang chạy
| Việc | Session (id để báo về / hỏi) | Model | Chờ gì |
|---|---|---|---|
| Việc 5: sửa mâu thuẫn số liệu (depco) theo 4 đề xuất | `local_5797c61c-3491-4f85-aa01-f81e24095047` (depco-sua, 17/11) | Sonnet | PR draft + `nghiem-thu\depco-sua.md`; xong → catalog đọc `manufacturing[]` → FG Wilson / ô hai hãng |
| Phủ test: việc còn mở sau 13/11 (trưa) | — (phiên H1, H2, H3, W1, W2 đã xong, chưa lưu trữ: chờ Khoa) | — | (6) Chưa phủ: nhánh trình duyệt `server/`, tải tệp báo giá / HSMT dự án, Forward sau Back từ link thẳng |

## Chưa giao
| Việc | Ghi chú | Model |
|---|---|---|
| Sửa 10 ca `todo` trong `suppliers/domain.test.mjs` (PR #622; bảng ở `nghiem-thu\test-review.md`) | Chờ Khoa duyệt; sửa xong bỏ `todo` | Sonnet |
| Cho `catalog.js` đọc `manufacturing[]` (#862, #866) thay `MADE_DEFAULT` cứng | Sau depco (cùng catalog.js) | Sonnet |
| Đọc đầu phát FG Wilson và ô hai hãng ("Stamford X / Leroy-Somer Y") trong `catalog.js` (đề xuất của #873) | Sau việc trên (cùng catalog.js) | Sonnet |

## Chờ Khoa
- Bot dự phòng Vercel Sandbox theo nhu cầu (#835 #852 #857 #858 #859 #860 #863 #864 #865 #867 #868, 17/11): ĐÃ BẬT, CHẠY THẬT được (image Ubuntu, snapshot giữ 1 năm, nối lại < 1 s, tự dừng khi rảnh 20 phút). Đã thử thật: Sync, tải HSMT qua Agent/Wine, đăng tệp, Phân tích, dịch (Claude; Gemini: Khoa đăng nhập agy trong sandbox 17/11, gọi thử OK), OCR, .doc. Đã thử thêm (17/11 tối): Gợi ý cấu hình IB2600612866 (11 phút, 5 cấu hình; tóm tắt ghi "6" — chưa rõ); máy Windows bật lại giữa lúc sandbox làm dở → máy nhường, sandbox làm xong rồi tự dừng sau 44 s. CHƯA thử: Gợi ý giá, Đối chiếu HSDT/TLKT, Tạo HSDT, Tìm thông số NCC (thiếu FIRECRAWL_KEY trên Vercel), nút Lấy tệp bấm trực tiếp (sau #863/#864), một bản dịch thật qua Gemini. Còn: sổ tiền API tách đôi giữa 2 máy; Khoa tự xoá 7 secret GitHub tạo 17/11 + biến Vercel `GEMINI_OAUTH_CREDS` (hệ thống chặn Claude xoá; lệnh trong phiên) và thu hồi token Vercel / PAT. Tác vụ "GenBid Bot" bật bằng Start-ScheduledTask từ phiên Claude bị treo (powershell không chạy dòng nào, 2 lần); bot đang chạy bằng Start-Process (không thuộc tác vụ), lần đăng nhập sau tác vụ tự chạy.
## Khoa đã bảo BỎ (đừng đề xuất lại)
- Realtime bỏ hsmttext (#570 đã đóng). Egress chờ số Usage / lên Pro. Thử Sonnet thay Opus cho Phân tích + xếp gói. Xin datasheet đại lý. Bổ sung bảng cho 223/431 NCC chưa có dòng bảng. Ứng viên 30 → 50 dòng. Nới trần 6 cấu hình. Đầu phát mã TQ / S5L1D-H41. Giao hàng + MAF + giá vốn vào xếp hạng. Vụ repo public. Bảng chuẩn động cơ / đầu phát từ nguồn hãng (14/11). Gộp model chỉ khác O/0, I/1 (14/11). Code điền sẵn check để giảm token agent Gợi ý cấu hình (16/11). Chạy Đối chiếu HSDT một gói thật (16/11). Tải tay datasheet Perkins / Cummins đuôi -G2 (16/11). Phân vị nội suy cho Gợi ý giá (17/11). Số xi lanh ghi trơ = chính xác ở bước chấm đạt / không đạt (17/11: chỉ ở bước chọn ứng viên). Ghi việc xoá tay thư mục `wt-*` vào sổ (16/11: không cần). IB2600601812: chạy lại Gợi ý, lấy datasheet ComAp AMF9 (16/11). Tài liệu đầy đủ Deep Sea để lập bảng chức năng BĐK (16/11). 247power.vn: KHÔNG revert 9fa5787 (16/11, giữ như main). Kiểm bằng mắt trên Vercel các PR web (17/11). Kết luận BCĐG "Không được đánh giá" cho gói xếp sau hạng 1 (17/11). Local AI / mua máy GPU chạy model tại chỗ (17/11: mắc quá; mini PC N100 16 GB không GPU không chạy nổi). Website cho xcmg-doosan-engine, mtu-yuchai; thử Back / quẹt trên điện thoại thật (17/11). Bấm lại Gợi ý giá gói 11–13/11; xem lượt Sync / lịch sử / nhà thầu thật đầu tiên của bot mới (17/11).

## Đợt chuẩn hoá thông số NCC (Khoa giao 14/11; phiên điều phối `session_011tAj4PAfGk1e1DuqGz35AW`)
- **Đã merge 14/11:** #779, #781, #783, #784 (sửa lỗi đọc trong `web/catalog.js`), #782 (lớp chuẩn hoá `web/spec-norm.js` + `suppliers/quality.mjs`; bước `quality --check` trong CI chỉ CHẶN PR sửa code đọc, PR dữ liệu của bot chỉ nhận cảnh báo). Lớp chuẩn hoá CHƯA nối vào Gợi ý cấu hình / web.
- **Thứ tự còn lại** ((a) `chuan-hoa-2b` ĐÃ merge #785 9a75be77 lúc ~14:00Z, đã báo phiên (b) rebase + đo lượt cuối): (b) `noi-chuan-hoa` đo lượt cuối → trình Khoa → mở "Gộp dòng lặp cùng NCC" → rồi "Siết luật gán hãng" (mục Chưa giao; lần lượt vì cùng sửa catalog.js; cả hai đo tắt ↔ bật trên toàn bộ gói bằng bộ đo trong `nghiem-thu\noi-chuan-hoa-1\` (`do-ung-vien.mjs`, `do-check.mjs`, `tong-hop.mjs`); không đổi bất thường thì điều phối merge, có thì trình Khoa).
- **Lịch tự kiểm:** `send_later` `trig_01SMJr8tR4fKdN8vEj4gNVdf` lúc 14:20Z 14/11, tự đặt lại mỗi 40 phút tới khi xong.
- **Công cụ kiểm độc lập** (`dau-vao\ra-soat-thong-so\`, chạy `node <script> <đường dẫn worktree>`, chép sang thư mục tạm trước vì audit2 ghi `all.json` cạnh script): PR sửa `catalog.js` → audit2 trên main (lưu `all-main.json`) và trên nhánh (`all-pr.json`) rồi `cmpk.cjs` (so từng bản ghi theo khoá: giá trị mất / thêm, model đổi tên, công suất / hãng đổi); PR sửa `spec-norm.js` → `normcheck.cjs` (đơn vị có chữ làm bằng chứng), `solecheck.cjs` (0 dòng "MO HO"), `comma.cjs` (số phẩy + 3 chữ số còn để thiếu: chỉ Himoinsa). Số đo gốc của đợt: `ket-qua.md` cùng thư mục. Worktree kiểm dùng lại: `wt-kiem-779` (`git checkout --detach origin/<nhánh>`).
- **Quyết định của Khoa trong đợt** (đã vào bộ nhớ `supplier-db.md`, `config-suggest.md`): "T3" / "Tier 3" không kèm thang → không gán thang; "OP" không là máy trần; "1,642" = 1642, "0,667" giữ thập phân, bảng Himoinsa có phẩy thập phân → để thiếu; dung tích không đơn vị → mặc định L / cc; gộp dòng lặp kiểu GỘP; siết gán hãng "nên làm"; nối lớp chuẩn hoá phải đo toàn bộ gói trước.
- **Còn sót, chưa giao:** tiêu hao khí thật của lees-power (bảng lệch cột) chưa đọc được; "model" rác (mục Chưa giao); 1 dòng tecnogen mất số xi lanh sau #784.

## Ghi chú vận hành
- Đừng gọi `Test-GenBidBotGit.ps1` trực tiếp (treo chờ stdin); dùng `Backup-GenBidBot.ps1 -Check`.
- Bản cũ của tệp bot trước mỗi lần chép: `genbid-test\before-<PR>\`.
- Còn sót trong dữ liệu: `reqLabel` ở hàng hoá lịch sử chưa rõ nghĩa; tệp HSMT đăng trước 04/11 vẫn `hasText` dù một phần scan; Publish chưa đọc .xlsx/.doc/.rar.
