# Sổ điều phối GenSet-Pro

Phiên điều phối đọc tệp này đầu phiên, cập nhật sau mỗi cổng duyệt. CHỈ ghi việc đang mở. Việc khép thì xoá dòng ở đây và thêm MỘT dòng (ngày, việc, PR, tệp nghiệm thu) vào cuối `so-dieu-phoi-da-khep.md`; số đo và chi tiết nằm trong `nghiem-thu\`. Quyết định của Khoa ghi vào bộ nhớ, bẫy code ghi vào `CLAUDE.md` của repo. Giữ tệp dưới ~5 KB.

Viết gọn lại 13/11/2026 (sáng, giờ VN). Cập nhật 16/11: #786 (nối chuẩn hoá) và #813 (gộp dòng lặp) đã khép; PR #787–#812 ngày 14–16/11 không qua sổ. Bản đầy đủ trước đó: cuối `so-dieu-phoi-da-khep.md`. **Chi tiết từng việc mở (quyết định, dữ liệu, script đo, các bước): `chi-tiet-viec-mo.md`** (17/11).

## Đang chạy
| Việc | Session (id để báo về / hỏi) | Model | Chờ gì |
|---|---|---|---|
| Việc 1 `chi-tiet-viec-mo.md`: thương hiệu ≠ nơi SX trong Gợi ý cấu hình (dùng `madeOf` của #841) | `local_d21240b6-6371-4acb-81aa-0c684b7cb1b5` (noi-san-xuat, KHOAMINIPC, 17/11) | Opus | PR draft + `nghiem-thu\noi-san-xuat.md`; sau đó mở việc 3 rồi 5 (cùng catalog.js) |
| (a) Đánh dấu 6 NCC nghi thương hiệu cấp phép | `local_0db49c30-e941-468d-a5e9-ddd6b908290b` (ncc-cap-phep, 17/11) | Sonnet | PR draft + `nghiem-thu\ncc-cap-phep.md` |
| (b) Luật tên gói nhận "Diezel" (cả 3 nơi) | `local_b5c7fcca-1361-4c7f-9d5e-fc5c3df1eaa9` (diezel) | Sonnet | PR draft + `nghiem-thu\diezel.md` |
| (c) BCĐG: IB2600354007 verdict rỗng; "fetch failed" sau OCR dài | `local_ec82f54e-d34c-4a5b-9dc8-61182f3d963d` (bcdg-loi) | Sonnet | `nghiem-thu\bcdg-5.md` (+ PR nếu sửa; điều phối chép sang genbid-hsmt) |
| (d) Log lượt thật #605, #547, #573 | `local_1a1e5f5d-438a-4a00-ba2f-39bfe944e2ea` (log-bot) | Haiku | `nghiem-thu\log-bot-605-547-573.md` |
| (e) depco-power: phân loại 130 ca (chưa sửa code) | `local_0b9a2e70-cc1b-42b1-87c9-c33e1c78a40f` (depco-phan-loai) | Sonnet | `nghiem-thu\depco-phan-loai.md`; phần sửa sau việc 1 + 3 |
| (f) Kiểm bằng mắt trên Vercel | `local_4d2e46da-35d6-439b-8fa0-29004a9d09c1` (kiem-vercel) | Sonnet | Có thể chờ Khoa đăng nhập trong trình duyệt app; `nghiem-thu\kiem-vercel.md` |
| Phủ test: việc còn mở sau 13/11 (trưa) | — (phiên H1, H2, H3, W1, W2 đã xong, chưa lưu trữ: chờ Khoa) | — | (1) Chưa thử Back / quẹt trên điện thoại thật sau #691 (đổi `navKey`, `navDirect`; quay lui: revert từng commit). (2) Gói đã bấm Gợi ý giá từ web trong 11–13/11 tính dự báo số nhà thầu thiếu tỉnh / lĩnh vực / ngày đóng (#690 đã sửa): Khoa bấm lại gói còn dùng. (3) Luật tên gói không nhận chữ "Diezel" làm dấu hiệu tổ máy diesel (IB2400069058 bị loại vì "Tổ máy 300MW"): sửa phải sửa cả ba nơi. (4) Khoa bổ sung website cho `xcmg-doosan-engine`, `mtu-yuchai`. (5) Xem lượt Sync / lịch sử / nhà thầu thật đầu tiên bằng bản bot mới. (6) Chưa phủ: nhánh trình duyệt `server/`, tải tệp báo giá / HSMT dự án, Forward sau Back từ link thẳng |

## Chưa giao
| Việc | Ghi chú | Model |
|---|---|---|
| Sửa 10 ca `todo` trong `suppliers/domain.test.mjs` (PR #622; bảng ở `nghiem-thu\test-review.md`) | Chờ Khoa duyệt; sửa xong bỏ `todo` | Sonnet |
| "Model" rác trong danh mục (Khoa 16/11: OK, sửa sau khi xong gán hãng + nơi sản xuất): ô không phải mã máy lọt `isCode` / bảng ngang thành bản ghi động cơ: "≤6S", "≤5S", "6-cylinder/inline", "12-cylinder/V-type", "1-PHASE", "100% copper", "800(KW)", "330(KW)", "195(g/kw.h)", "300 W", "330+250 W", "Container 20'"; mã đầu phát "LTP224S-52/60" đọc thành động cơ | Cách sửa: loại dạng có đơn vị trong ngoặc, %, ≤, "-cylinder", PHASE, "W" sau số; đầu phát nhầm cột sửa chỗ chọn cột. Đo trước/sau: số model loại, model thật bị loại nhầm, top 30 ứng viên toàn bộ gói. Cùng tệp catalog.js: làm SAU 2 việc dưới | Sonnet |
| Mâu thuẫn số liệu depco-power (#806): kiểm 130 ca, sửa ca đọc sai (vd. 4006-23TAG3A xi lanh "6,8L"); ca nguồn lệch xét theo luật số đông (Khoa 16/11) | Khoa: "xử lý sau" | Sonnet |

## Chờ Khoa
- (trống; dải mặc định dung tích Khoa 17/11: giữ)
## Khoa đã bảo BỎ (đừng đề xuất lại)
- Realtime bỏ hsmttext (#570 đã đóng). Egress chờ số Usage / lên Pro. Thử Sonnet thay Opus cho Phân tích + xếp gói. Xin datasheet đại lý. Bổ sung bảng cho 223/431 NCC chưa có dòng bảng. Ứng viên 30 → 50 dòng. Nới trần 6 cấu hình. Đầu phát mã TQ / S5L1D-H41. Giao hàng + MAF + giá vốn vào xếp hạng. Vụ repo public. Bảng chuẩn động cơ / đầu phát từ nguồn hãng (14/11). Gộp model chỉ khác O/0, I/1 (14/11). Code điền sẵn check để giảm token agent Gợi ý cấu hình (16/11). Chạy Đối chiếu HSDT một gói thật (16/11). Tải tay datasheet Perkins / Cummins đuôi -G2 (16/11). Phân vị nội suy cho Gợi ý giá (17/11). Số xi lanh ghi trơ = chính xác ở bước chấm đạt / không đạt (17/11: chỉ ở bước chọn ứng viên). Ghi việc xoá tay thư mục `wt-*` vào sổ (16/11: không cần). IB2600601812: chạy lại Gợi ý, lấy datasheet ComAp AMF9 (16/11). Tài liệu đầy đủ Deep Sea để lập bảng chức năng BĐK (16/11). 247power.vn: KHÔNG revert 9fa5787 (16/11, giữ như main).

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
