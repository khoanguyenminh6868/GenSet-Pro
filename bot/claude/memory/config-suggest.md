---
name: config-suggest
description: "Gợi ý cấu hình + Tìm NCC (config-bot.mjs): quy tắc Khoa chốt về xếp hạng, xuất xứ, nguồn thông số; nguồn datasheet hãng; cách thử; bẫy"
metadata:
  node_type: memory
  type: project
  originSessionId: 712171b8-1398-4e8a-b507-1e2692a83bce
  modified: 2026-11-13T00:28:45.570Z
---

**Luồng:** web `configreq/<TBMT>` → `suppliers/config-bot.mjs run` (agent `claude -p` Opus theo `config-prompt.md`) → `check` kiểm bằng code → `configmatch/<TBMT>`. Code xếp sẵn 30 dòng ứng viên; mọi số/câu trích phải có nguyên văn trong nguồn, sai → "Đạt" thành "Chưa rõ". ~6–11 phút, ~3 USD/gói. Yêu cầu theo bộ mã cố định `suppliers/reqcodes.mjs` (thêm mã: dòng `R(...)` đúng thứ tự + test; tăng `REQ_VERSION`).

## Quy tắc Khoa chốt
**Xếp hạng:** số "không đạt" ở động cơ + BĐK (đếm từng chức năng) → không đạt ở đầu phát + tổ máy → có NCC phù hợp → "chưa rõ" cùng thứ tự → yêu cầu tuỳ chọn (bồn dầu, kích thước, độ ồn) sau cùng. Chưa kiểm = chưa rõ. Tối đa 6 cấu hình, 2 cấu hình mỗi hãng động cơ. HSMT có yêu cầu BĐK mà cấu hình không có BĐK → không đạt. NCC chào đúng cả động cơ và BĐK lên đầu. Đại lý tại VN KHÔNG là tiêu chí. Hàng từng trúng thầu chỉ là tiêu chí cuối.

**Xuất xứ:**
- Web mặc định "Tất cả"; "Tất cả" và yêu cầu từ Sync thì đọc HSMT: thấy G7/G20 → nhóm đó. Chọn tay trên web giữ nguyên. Nhóm g20 của mình KHÔNG gồm Trung Quốc. HSMT cho phép EU cùng G7/G20 → mở thêm EU (chỉ đọc từ HSMT; web không có lựa chọn EU; HSMT chỉ đòi EU thì không có nhóm).
- HSMT đòi G7/G20 cho **cả tổ máy/hàng hoá** → NCC phải ở nước thuộc nhóm. Chỉ đòi ở **bộ phận** (động cơ/đầu phát/BĐK) → lọc hãng động cơ theo nhóm, NCC ở Trung Quốc. Chỉ nói **hãng/thương hiệu** G7 (không nói xuất xứ/sản xuất tại) → nhận thêm nhà máy chính hãng ngoài nhóm.
- Không đòi G7/G20 → chỉ NCC ở Trung Quốc; động cơ hãng TQ đáp ứng tốt hơn hoặc ngang điểm thì đứng trước. (Ngoại lệ em tự thêm, chưa hỏi Khoa: HSMT đòi đồng bộ thương hiệu thì giữ NCC mọi nước.)
- G7/G20 mà HSMT không nêu hãng động cơ → mỗi hãng giữ chỗ trong ứng viên (không để Cummins/Perkins chiếm hết). Baudouin tính G7 (nhà máy ở Pháp). Deutz KHÔNG tính G7/G20/EU. Loại động cơ TQ sản xuất theo giấy phép.
- Loại NCC Việt Nam và tổ máy hãng/xuất xứ VN.

**Đồng bộ thương hiệu** (~6% HSMT: động cơ/đầu phát/BĐK do chính hãng tổ máy làm): code tự thêm yêu cầu + kiểm theo họ hãng (Stamford/PowerCommand = Cummins, Perkins/FG Wilson = Caterpillar, SDMO = Kohler); xưởng lắp ráp TQ hầu hết không đạt; ứng viên giữ chỗ cho hãng tổ máy thật.

**HSMT nêu đích danh hãng/model tổ máy** (13/11): tổ máy lắp ráp chỉ dùng ĐỘNG CƠ của hãng đó = "tương đương" + cảnh báo, không tính đạt hãng. NCC chỉ mang thương hiệu cấp phép (vd Hyundai của GRV Power Products) → dòng hãng tổ máy "cần xác nhận", vẫn là cấu hình đúng hãng.

**Đánh giá thông số:**
- Số trần trong HSMT = mức tối thiểu với thông số càng lớn càng tốt; đường kính/hành trình/kích thước khác số → chưa rõ, không "không đạt". Datasheet đời khác → chưa rõ.
- Nguồn mâu thuẫn → "chưa rõ", KHÔNG lấy đa số. Ngoại lệ: đúng một tờ hãng đúng mã → theo tờ hãng, trừ khi nguồn ghi khác là NCC của chính cấu hình.
- "Chưa rõ" thuộc loại chọn khi đặt hàng / chứng từ → "Xác nhận khi đặt hàng" / "Cần chứng từ" (không bị phạt khi xếp hạng): kích thước/khối lượng/độ ồn/nhiệt độ dòng không có số, khởi động/làm mát nguồn không ghi, ổn định điện áp phụ thuộc AVR, "nêu cụ thể/ghi rõ" không ngưỡng.
- Quá tải 10%/1 h: đạt khi cột ghi Prime/PRP (ISO 8528-1). **Continuous (COP) ≠ PRP**, quá tải standby giữ chưa rõ.
- Tiêu hao nhiên liệu vượt mức HSMT → loại hẳn khỏi ứng viên, KHÔNG dung sai; chỉ khi nguồn ghi rõ mức tải trùng mức HSMT; dòng không có số thì giữ.
- Trang bên bán / không chính hãng (tier C) không đưa vào danh mục NCC (kết quả gợi ý của lượt vẫn hiện).
- 7 chỉ tiêu Thảo Nguyên từng bị loại → cảnh báo trên cấu hình hạng 1–3, không đổi thứ hạng.
- Web không in câu trích ([[session-log]]). Có nút "Chép bảng câu hỏi" (RFQ cho NCC) và khối "Câu hỏi làm rõ HSMT".

**Tìm NCC:** CHỈ Claude. NCC mới trùng cấu hình có sẵn → gắn vào; không trùng → cấu hình mới. Không chạy lại cả Gợi ý. Gợi ý lại giữ kết quả Tìm NCC và cấu hình tìm trên internet (trang lưu ở `genbid-work\config-web\`). Nút trên từng cấu hình: Xoá, Tìm nhà cung cấp.

**Gói nhiều cỡ máy:** mỗi cỡ một agent (tối đa 4), ngưỡng HSMT đọc theo khối của từng cỡ. **Gói dịch vụ** không tự Gợi ý.

**Khoa bảo bỏ, đừng hỏi lại:** đầu phát mã TQ (S5L1D-H41); đưa giao hàng / MAF / giá vốn vào xếp hạng. Đã đo và bỏ: luật "chỉ loại khi nguồn hãng hoặc ≥2 nguồn"; nới trần 6 cấu hình.
**Chưa chốt với Khoa:** đại diện hãng tại VN/MAF, ISO/prototype có tính vào xếp hạng không; hàng trúng có nên đưa lên trên không.

## Nguồn datasheet hãng
`maker-datasheets.mjs <id> <pdf...>` → `merge-specs.mjs <id>` → `verify.mjs`.
- Wintpower: wintpower.com/uploads/<model>.pdf. Stamford: stamford-avk.com/alternators/stamford/<frame> (PDF INDUSTRIAL; HCI4xx đời mới ≠ HCI444), Ratings Book Ed4.
- Leroy-Somer: leroy-somer.com/documentation_pdf/6608–6613_en.pdf (TAL); LSA hiện hành ở moen.nidec.com.
- Deep Sea: <trang model>/downloads/datasheet (sổ tay 403). SmartGen: smartgen.cn/yun/data/download/<tên>_en.pdf. ComAp: /productfile/<id> (InteliLite NT không còn).
- Cummins: mart.cummins.com có spec sheet; cummins.com và perkins.com trả 403 → không lách (prompt cấm đổi User-Agent sau 403), hỏi Khoa tải tay.
- Không có datasheet theo model: Jet-Power, Bobig, Acepow, Nianfeng.

## Thử / kiểm
- Dry-run: `GENBID_LOCAL_SUPPLIERS=1`, prep → claude → check. Kiểm nhanh không tốn agent: chạy `check --dir` bằng code mới trên thư mục lượt cũ. Log agent `%TEMP%\genbid-config-<TBMT>.log`. `restore-web` chỉ đọc (cần `--origin`).
- Gửi lại Gợi ý từ máy: `post([{coll:"configreq", id, data:{by, from:"web", origin:"all", bidName, notifyNo, requestedAt: now, error:""}}])` (import từ config-bot.mjs).
- Bản nghiệm thu từng đợt: `genbid-work\dieu-phoi\nghiem-thu\`.

## Bẫy
- `web/api/webreq.js` lọc trường yêu cầu theo danh sách → trường mới phải thêm ở đó.
- Script import config-bot.mjs không được bị config-bot import ngược (node thoát 13, kẹt `genbid-config.lock`).
- `check` cắt MAX_CONFIGS TRƯỚC `rankConfigs` → cấu hình cần giữ phải đưa lên trước khi cắt. Kết quả lưu không ghi origin → mặc định "cn".
- Check hiếm khi mang `code` → khớp theo item của yêu cầu. Từ khoá mã `alt_vreg` bắt cả dòng tần số, đừng dùng để quét HSMT.
- Dữ liệu: fdk-energy "Prime power / Speed (KW/RPM)" là kWe tổ máy; đuôi "-6" (sanq-power, LEES) là máy 60 Hz; mã `TWD…` là Volvo Penta; "P158LE" bị coi là mã đầu phát; saudi-diesel bị đọc thành SDEC; PDF chính hãng trên CDN riêng (shopify, ldycdn…) bị coi không chính thức.
- Chữ HSMT trên web của ~1.490 gói lịch sử chỉ là Chương V do specs đăng; chỉ gói đang mời thầu đã Lấy tệp mới có HSMT cả bộ. `analysis.generatorSets` hầu như luôn rỗng. Bộ so tự viết khi hồi quy cũng hay sai → xem từng ca.

## Còn dở
"Chưa rõ" còn lại chủ yếu do thiếu dữ liệu (đầu phát TQ, tiêu hao/quá tải tổ máy TQ, số pha, kWm hãng động cơ theo tốc độ — Perkins và Cummins đuôi -G2 thiếu) → muốn hơn phải xin catalog NCC ([[supplier-db]]). Dữ liệu NCC ở nước G7 mỏng, agent phải tìm internet. LSA đời ngừng, InteliLite NT AMF20/25, MRS10 chưa có datasheet. Kho ghi nhớ "đã tìm không ra": `genbid-work\web-memo\negative.json` (90 ngày).

Liên quan [[bidprice-suggest]].
