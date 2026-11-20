---
name: config-suggest
description: "Gợi ý cấu hình + Tìm NCC (config-bot.mjs): quy tắc Khoa chốt về xếp hạng, xuất xứ, nguồn thông số; nguồn datasheet hãng; cách thử; bẫy"
metadata:
  node_type: memory
  type: project
  originSessionId: 712171b8-1398-4e8a-b507-1e2692a83bce
  modified: 2026-11-20T04:29:37.380Z
---

**Luồng:** web `configreq/<TBMT>` → `suppliers/config-bot.mjs run` (agent `claude -p` Opus theo `config-prompt.md`) → `check` kiểm bằng code → `configmatch/<TBMT>`. Code xếp sẵn 30 dòng ứng viên; mọi số/câu trích phải có nguyên văn trong nguồn, sai → "Đạt" thành "Chưa rõ". ~6–11 phút, ~3 USD/gói. Yêu cầu theo bộ mã cố định `suppliers/reqcodes.mjs` (thêm mã: dòng `R(...)` đúng thứ tự + test; tăng `REQ_VERSION`).

## Quy tắc Khoa chốt
**Xếp hạng:** số "không đạt" ở động cơ + BĐK (đếm từng chức năng) → không đạt ở đầu phát + tổ máy → có NCC phù hợp → "chưa rõ" cùng thứ tự → yêu cầu tuỳ chọn (bồn dầu, kích thước, độ ồn) sau cùng. Chưa kiểm = chưa rõ. Tối đa 8 cấu hình (Khoa 17/11/2026 nâng từ 6), 2 cấu hình mỗi hãng động cơ; riêng Perkins, Volvo Penta, Cummins và Mitsubishi chỉ 1 cấu hình, cái xếp cao nhất (Khoa 17/11/2026, PR #828, PR Cummins và PR Mitsubishi sau đó; Khoa không nêu lý do). Khoa 17/11 còn muốn "cấu hình nào thiếu đầu phát hoặc bộ điều khiển thì không đưa vào": Khoa HUỶ hẳn (17/11 chiều: "không cần làm nữa"; số đo 14/11: 39% cấu hình thiếu, 7 kết quả sẽ mất hết cấu hình); đừng làm, đừng đề xuất lại, kể cả bản nhẹ (xếp sau / phạt điểm cấu hình thiếu đầu phát). HSMT có yêu cầu BĐK mà cấu hình không có BĐK → không đạt. NCC chào đúng cả động cơ và BĐK lên đầu. Đại lý tại VN KHÔNG là tiêu chí. Hàng từng trúng thầu chỉ là tiêu chí cuối.

**Xuất xứ:**
- Web mặc định "Tất cả"; "Tất cả" và yêu cầu từ Sync thì đọc HSMT: thấy G7/G20 → nhóm đó. Chọn tay trên web giữ nguyên. Nhóm g20 của mình KHÔNG gồm Trung Quốc. HSMT cho phép EU cùng G7/G20 → mở thêm EU (chỉ đọc từ HSMT; web không có lựa chọn EU; HSMT chỉ đòi EU thì không có nhóm).
- HSMT đòi G7/G20 cho **cả tổ máy/hàng hoá** → NCC phải ở nước thuộc nhóm. Chỉ đòi ở **bộ phận** (động cơ/đầu phát/BĐK) → lọc hãng động cơ theo nhóm, NCC ở Trung Quốc. Chỉ nói **hãng/thương hiệu** G7 (không nói xuất xứ/sản xuất tại) → nhận thêm nhà máy chính hãng ngoài nhóm.
- Không đòi G7/G20 → chỉ NCC ở Trung Quốc; động cơ hãng TQ đáp ứng tốt hơn hoặc ngang điểm thì đứng trước. (Ngoại lệ em tự thêm, chưa hỏi Khoa: HSMT đòi đồng bộ thương hiệu thì giữ NCC mọi nước.)
- G7/G20 mà HSMT không nêu hãng động cơ → mỗi hãng giữ chỗ trong ứng viên (không để Cummins/Perkins chiếm hết). Baudouin tính G7 (nhà máy ở Pháp). Deutz KHÔNG tính G7/G20/EU. Loại động cơ TQ sản xuất theo giấy phép. **Khoa 16/11/2026: "nên phân biệt rõ thương hiệu và nơi sản xuất"** cho động cơ: danh mục hiện chỉ biết hãng (Cummins = Mỹ), không biết nhà máy, nên Cummins B / C (Dongfeng Cummins), KTA / QSK (Chongqing Cummins), Baudouin M26 (Weichai) đều qua lọc G7 như hàng chính hãng. Khoa chốt cùng ngày: (1) HSMT chỉ đòi G7 / G20 cho bộ phận (37/928 gói) → đọc dòng động cơ ghi THƯƠNG HIỆU hay NƠI SẢN XUẤT, tuỳ đó mà xét; (2) đòi nơi sản xuất: dòng nguồn ghi nhà máy TQ (DCEC, CCEC, SME, Perkins China, 潍柴博杜安, MTU Yuchai) → không đạt; ghi hàng nhập / nhà máy G7 → đạt; không ghi (đa số) → giữ, gắn "cần xác nhận nơi sản xuất động cơ" (không đoán theo model); (3) Xuất xứ Trung Quốc: dòng ghi rõ nhà máy TQ của hãng ngoại tính là SẢN XUẤT TẠI TRUNG QUỐC (thay quyết định 29/10 coi là hàng ngoại). Khoa thêm cùng ngày: áp CẢ cho đầu phát và bộ điều khiển (Stamford / Leroy-Somer / Marathon làm ở TQ…), tra internet nơi sản xuất của các hãng đó rồi cập nhật danh mục. Kết quả tra (nguồn hãng): DSE chỉ SX ở Anh; DEIF chỉ Đan Mạch; Woodward easYgen-1500/2000/3000/3000XT ở Ba Lan; AvK chỉ Romania; Datakom → Thổ Nhĩ Kỳ (Khoa chốt, nguồn chỉ nói nhà máy Istanbul); Stamford / Leroy-Somer / Mecc Alte có nhà máy nhiều nước gồm TQ, NHƯNG Khoa chốt 16/11: "có thể tính xuất xứ là G7" → mặc định nơi SX thuộc G7 (Anh / Pháp / Ý); chỉ dòng nguồn ghi rõ nhà máy TQ ("Stamford (China)", 无锡斯坦福, 福州利莱森玛) mới tính TQ. AvK (Stamford) vẫn là Romania (EU). ComAp → Séc (EU), Khoa chốt 16/11 (nguồn hãng chỉ nói thiết kế ở Praha).
- Khoa 17/11: BẬT `GENBID_NAMED_SELLER=1` cho mọi máy bot (tổ máy HSMT nêu đích danh chỉ có trang bên bán → giữ cấu hình, gắn "nguồn bên bán, chưa xác minh", kiểm tối đa "chưa rõ"). Làm nhãn "Công suất chưa xác nhận" trên đầu thẻ cấu hình khi mục công suất chưa rõ (chỉ hiển thị, không đổi thứ hạng). Dải mặc định đơn vị dung tích (0,4–100 L; 400–100.000 cc): giữ.
- Khoa bảo BỎ 16/11 (đừng đề xuất lại): "code điền sẵn check" để giảm token agent Gợi ý cấu hình; tải tay datasheet Perkins / Cummins đuôi -G2; chạy Đối chiếu HSDT một gói thật; chạy lại Gợi ý IB2600601812 và lấy datasheet ComAp AMF9; tài liệu đầy đủ Deep Sea để lập bảng chức năng BĐK.
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
- Web không in câu trích. Có nút "Chép bảng câu hỏi" (RFQ cho NCC) và khối "Câu hỏi làm rõ HSMT".

**Danh mục (`web/catalog.js`), Khoa duyệt 14/11/2026, làm xong phải đo tắt ↔ bật trên toàn bộ gói:**
- Dòng nguyên văn lặp ở nhiều bảng của cùng NCC → GỘP thành một bản ghi, cộng dồn hãng + nguồn (không xoá thẳng bản sao).
- Gán hãng động cơ / đầu phát: chỉ tin hãng ghi ở dòng bảng hoặc tiêu đề cột; hãng chỉ đến từ tên trang không dùng khi model đã có hãng mức cao hơn; còn mâu thuẫn → chưa rõ hãng, không đoán (cách siết do em đề xuất, Khoa trả lời "nên làm"). Khoa chốt thêm 16/11: cặp cùng hãng giữ cả hai, luật số đông ≥3 NCC và gấp ≥3 lần (chi tiết [[supplier-db]]).

**Ứng viên (Khoa duyệt 17/11/2026, IB2600603983, PR #823):**
- HSMT nêu bố trí xi lanh (thẳng hàng / chữ V) → loại dòng ghi kiểu kia. Ngưỡng "ít nhất hai nhà cung cấp ghi mới tính cho cả động cơ" là do em chọn (dữ liệu NCC có ghi sai), Khoa chưa xét riêng điểm này.
- Số xi lanh HSMT ghi trơ ("6 xy lanh") là số CHÍNH XÁC: loại động cơ 12 xi lanh (Khoa 17/11: "nếu HSMT ghi rõ 6 thì nên loại 12", PR #825); có "≥ / tối thiểu / trở lên" thì vẫn là tối thiểu. Ngoại lệ của "số trần = tối thiểu" bên dưới; CHỈ ở bước chọn ứng viên — Khoa 17/11: bước chấm đạt / không đạt (`makerSheetChecks`) KHÔNG theo luật này (vẫn coi là tối thiểu).
- Động cơ chỉ có dòng tần số kia (Baudouin đuôi "/6" = 60 Hz) → loại khi HSMT đòi tần số còn lại.
- Gợi ý lại KHÔNG giữ dòng ứng viên của lượt trước (Khoa: "không cần giữ"); Tìm NCC / cấu hình internet vẫn giữ.
- Khoa muốn bắt lỗi đọc ngưỡng HSMT có hệ thống: `suppliers/hints-audit.mjs` (so code đọc với Phân tích).

**Đặc thù hãng động cơ (Khoa chốt 18/11/2026, IB2600612866: HSMT ghi buồng đốt E-TVCS của Kubota mà kết quả có CAT / Perkins / Yanmar; đã nối vào Gợi ý cấu hình: PR #930 merge 19/11/2026, luật chi tiết ở `suppliers/CLAUDE.md`):**
- HSMT có từ đặc thù của một hãng động cơ → "chỉ gợi ý hãng đó và bỏ trần 2 cấu hình cho hãng đó".
- Bảng từ đặc thù: `suppliers/engine-traits.json` (PR #914). Khoa 18/11: tên dòng máy (TNV, QSK60, NEF…) KHÔNG là đặc thù ("không"); từ đặc thù ở yêu cầu bộ điều khiển (PowerCommand, EMCP…) "thì chỉ đề xuất bộ điều khiển đó, không liên quan động cơ"; nhận sdeciepower.com (SDEC) và cn.yuchaiie.com (Yuchai) là nguồn chính hãng ("ok"). Đo 1.548 gói: trong yêu cầu động cơ chỉ có E-TVCS (3 gói).
- Cấu hình tìm trên internet cũng phải nằm trong dải công suất 100–140% (120% trên 30 kVA) như ứng viên danh mục (Khoa: "có"; Denyo 13 kVA từng vào gói 8,5 kVA).
- Biến thể cùng động cơ (D1105 / D1105-BG / D1105-E2BG / -CHN / -CHN-1): "nếu giống nhau về mặt thông số thì chọn 1 trong nhiều, nếu khác thì chỉ chọn cái có thông số phù hợp". (Em hiểu: không gộp bản ghi trong danh mục; ở bước chọn cấu hình, các biến thể thông số như nhau chỉ chiếm một cấu hình, khác nhau thì chỉ giữ biến thể đạt HSMT.)
- Đồng bộ thương hiệu: "nếu yêu cầu không ghi đòi động cơ thì không đòi" — chỉ bộ phận HSMT nêu trong câu đồng bộ mới phải cùng hãng tổ máy ("đầu phát và vỏ chống ồn đồng bộ cùng một nhãn hiệu" không đòi động cơ).
- Khoa quyết thêm 18/11/2026 (sau khi xem bảng 112 mục; chặng 2 đang code, phiên con `Đặc thù hãng động cơ, chặng 2`): chỉ mục `part: engine` + `exclusive` mới lọc hãng động cơ, và BỎ khỏi nhóm lọc Holset, Lombardini, KOHLER Flex (`filter: false`; còn 16 mục); ADEM giữ ở nhóm bộ điều khiển. Câu đồng bộ sau khi bỏ động cơ chỉ còn MỘT bộ phận → không đòi gì ("b"). HSMT nêu đích danh bộ điều khiển mà cấu hình không có → tính không đạt, xếp sau, vẫn hiện, không bỏ ("a"). "E-TVCS hoặc tương đương" → không lọc hãng, chỉ cộng điểm ("ok"). Biến thể cùng động cơ chỉ gom hậu tố PHIÊN BẢN (BG, E2BG, CHN…), không gom hậu tố công suất (G3 / G4, TAG2A / TAG3A) ("b").

**Tìm NCC:** CHỈ Claude. NCC mới trùng cấu hình có sẵn → gắn vào; không trùng → cấu hình mới. Không chạy lại cả Gợi ý. Gợi ý lại giữ kết quả Tìm NCC và cấu hình tìm trên internet (trang lưu ở `genbid-work\config-web\`). Nút trên từng cấu hình: Xoá, Tìm nhà cung cấp.

**Gói nhiều cỡ máy:** mỗi cỡ một agent (tối đa 4), ngưỡng HSMT đọc theo khối của từng cỡ. **Gói dịch vụ** không tự Gợi ý.

**Khoa bảo bỏ, đừng hỏi lại:** đầu phát mã TQ (S5L1D-H41); đưa giao hàng / MAF / giá vốn vào xếp hạng. xin datasheet từ đại lý; bổ sung bảng cho các NCC chưa có dòng bảng; thử Sonnet thay Opus cho Phân tích/xếp gói. Đã đo và bỏ: luật "chỉ loại khi nguồn hãng hoặc ≥2 nguồn"; nới trần 6 cấu hình (lần đo cũ; 17/11 Khoa tự bảo nâng lên 8); ứng viên 30 → 50 dòng.
**Chưa chốt với Khoa:** đại diện hãng tại VN/MAF, ISO/prototype có tính vào xếp hạng không; hàng trúng có nên đưa lên trên không.

## Nguồn datasheet hãng
- Wintpower: wintpower.com/uploads/<model>.pdf. Stamford: stamford-avk.com/alternators/stamford/<frame> (PDF INDUSTRIAL; HCI4xx đời mới ≠ HCI444), Ratings Book Ed4.
- Leroy-Somer: leroy-somer.com/documentation_pdf/6608–6613_en.pdf (TAL); LSA hiện hành ở moen.nidec.com.
- Deep Sea: <trang model>/downloads/datasheet (sổ tay 403). SmartGen: smartgen.cn/yun/data/download/<tên>_en.pdf. ComAp: /productfile/<id> (InteliLite NT không còn).
- Cummins: mart.cummins.com có spec sheet; cummins.com và perkins.com trả 403 → không lách (prompt cấm đổi User-Agent sau 403), hỏi Khoa tải tay.
- Không có datasheet theo model: Jet-Power, Bobig, Acepow, Nianfeng.

## Còn dở
"Chưa rõ" còn lại chủ yếu do thiếu dữ liệu (đầu phát TQ, tiêu hao/quá tải tổ máy TQ, số pha, kWm hãng động cơ theo tốc độ — Perkins và Cummins đuôi -G2 thiếu) → muốn hơn phải xin catalog NCC ([[supplier-db]]). Dữ liệu NCC ở nước G7 mỏng, agent phải tìm internet. LSA đời ngừng, InteliLite NT AMF20/25, MRS10 chưa có datasheet. Kho ghi nhớ "đã tìm không ra": `genbid-work\web-memo\negative.json` (90 ngày).

Cách thử, lệnh và bẫy code: `suppliers/CLAUDE.md` trong repo; bản nghiệm thu từng đợt: `genbid-work\dieu-phoi\nghiem-thu\`. Liên quan [[bidprice-suggest]], [[quy-tac-luong]].

## Nhiên liệu và tổ máy không mã động cơ (Khoa 20/11/2026)
- Máy khí / xăng: đo 20/11 thấy lọt top 30 ở 114 gói (westinpower MAN khí hạng 1 ở 9 lượt). Khoa chốt: catalog có trường nhiên liệu (chỉ ghi khi bảng hoặc tên trang ghi rõ; tên trang CÓ dùng; không đủ dấu hiệu thì để trống, không coi là diesel); Gợi ý thêm bước kiểm nhiên liệu; HSMT KHÔNG nêu nhiên liệu → coi là gói diesel (loại khí / xăng / xăng + LPG). "COP / Continuous" không là prime.
- Bảng tổ máy không mã động cơ (46 bảng, 1.753 dòng): "PA1 trước" = lưu + hiện ở hồ sơ NCC, CHƯA nối Gợi ý; nối (chỉ khi HSMT không đòi thông số động cơ) quyết sau khi Khoa xem hồ sơ NCC. Không nối kiểu "trừ điểm" (thiếu dữ liệu không được lợi hơn có dữ liệu).

## IB2600603983: đáp án đúng và 5 việc Khoa duyệt (20/11/2026)
Khoa nêu cấu hình đúng: Baudouin 6M31G825/5 + Leroy-Somer LSA 49.3 M8, AREP + AVR D350 (hoặc PMG + D350; ngắn mạch 300% (3 In) / 10 s) + DSE7320 MKII kèm mô-đun DSE890 MKII (4G / Ethernet Gateway). Dùng làm ca kiểm cho các việc dưới. Khoa quyết:
- Đầu phát: "miễn sao đạt yêu cầu của hsmt thì cứ gợi ý" → không cần NCC ghi đầu phát cùng dòng tổ máy; chọn theo datasheet hãng (trước đó chỉ lấy đầu phát ghi cùng dòng).
- Tỉ số nén HSMT ghi trơ ("14 : 01"): "sửa luật để kiểm tra" (em trình: ghi trơ = số chính xác, nguồn ghi khác thì không đạt ở bước chấm; bước chọn ứng viên chưa hỏi). Khác số xi lanh (ghi trơ chỉ chính xác ở bước chọn ứng viên, Khoa 17/11).
- Một động cơ ghi hai mã ("6M33G8D3/5 (6M33G825/5)" chiếm hai chỗ của hãng): "gộp đi, cần rà soát lại tất cả các dòng nào giống nhau của tất cả các nhà cung cấp".
- Bổ sung dữ liệu hãng Baudouin cho mọi mã (nguồn baudouin.com); bộ điều khiển kèm mô-đun truyền thông: làm.
Phân tích: `genbid-work\dieu-phoi\dau-vao\ib2600603983\phan-tich.md`; tiến độ ở sổ điều phối.

**Đầu phát chọn theo datasheet hãng: Khoa trả lời 7 câu (20/11/2026, đề xuất `nghiem-thu\dau-phat-hang-de-xuat.md`):**
1. NCC ghi đầu phát mà KHÔNG đạt (M6 730 kVA < 750) → "Đề xuất M8": thay bằng đầu phát hãng đạt, ghi rõ NCC chào gì và vì sao không đạt.
2. NCC ghi đầu phát mà hệ thống không có số liệu → "Giữ" đầu phát NCC chào; chỉ thay khi chứng minh được không đạt.
3. So kVA ở "cột chạy liên tục" (Continuous, cấp H / 125 K / 40 °C, đúng tần số, 3 pha; không dùng cột Standby). Phần còn lại của khuyến nghị (số nhỏ nhất trong các điện áp HSMT nêu, model nhỏ nhất đạt, ≤ 130 % mức cần, tối đa 2 model mỗi hãng) Khoa không nói riêng: em coi là theo khuyến nghị.
4. "Ok": xuất xứ theo nơi sản xuất mặc định của hãng (Leroy-Somer Pháp, Stamford Anh, Mecc Alte Ý); HSMT đòi thương hiệu → đạt; đòi nơi sản xuất → chưa rõ, "cần xác nhận nơi sản xuất đầu phát".
5. "Ok": không phạt điểm cấu hình dùng đầu phát chọn theo datasheet hãng.
6. "Ok": bổ sung dữ liệu Mecc Alte (ECO / NPE) + Stamford trên 750 kVA sau, bằng Firecrawl; Marathon để lại.
7. "Nếu không ghi tương đương thì chỉ chọn hãng đó" (HSMT nêu đích danh hãng đầu phát). Có "tương đương" → thêm hãng khác xếp sau, và HSMT đòi đồng bộ thương hiệu thì không dùng đầu phát khác hãng tổ máy: là khuyến nghị, Khoa không nhắc riêng.
Kết quả phải ghi rõ "đầu phát chọn theo datasheet hãng, NCC chưa chào" ([[khong-viet-au]]).

**Bộ điều khiển + mô-đun truyền thông: Khoa trả lời 6 câu (20/11/2026, đề xuất `nghiem-thu\bdk-mo-dun-de-xuat.md`; Khoa gõ "6 câu về đầu phát", em hiểu là 6 câu bộ điều khiển):**
1. "Ok cho khuyến nghị": chấm và xếp theo cặp tốt nhất (theo datasheet DSE7420 MKII ≥ DSE7320 MKII nên có thể ra 7420 + DSE890); cặp khác cũng không có "không đạt" (DSE7320 MKII + DSE890 MKII) hiện thành dòng "Phương án khác đạt tương đương" trong cùng cấu hình, không chiếm chỗ trong 8 cấu hình. Khoa không nêu lý do chọn 7320.
2. "Làm theo khuyến nghị": cổng Ethernet của gateway (DSE890) KHÔNG tính là cổng Ethernet của bộ điều khiển; 4G / Internet / GSM / SMS / giám sát từ xa tính theo mô-đun.
3. "Ok": HSMT ghi "BMS" trơ → đạt khi nguồn ghi BMS / building management, hoặc Modbus (RTU / TCP) / BACnet / SNMP, kèm "BMS qua Modbus/SNMP, cần NCC xác nhận" (vào RFQ).
4. "Ok": chức năng nhờ mô-đun hệ thống tự thêm là đạt (cờ `viaModule`, không bị phạt), luôn có nhãn "Mô-đun chọn theo tài liệu hãng, NCC chưa chào" + một dòng RFQ chào kèm mô-đun (mã đặt hàng).
5. "Ok": sửa lỗi chấm lỏng (IB2600601812 "đạt Internet/5G" chỉ nhờ dòng tên DSE890): code kiểm chữ của chức năng con trong câu trích; IB2600601812 sẽ tụt 4/4 → 3/4.
6. "Tìm thông tin" (KHÁC khuyến nghị): lưu datasheet bộ điều khiển của DEIF, Woodward, Datakom, SICES (4 hãng chưa có bảng nào).

## Số đông dung tích: làm tròn (Khoa 19/11/2026)
Số đông chỉ áp cho dung tích (và số xi lanh), áp cả trần, hãng động cơ không gộp. Về làm tròn: nguồn chỉ ghi số làm tròn mà HSMT đòi số chính xác hơn (Y490D 2,67 ↔ ≥ 2,672) → "không giữ" (loại); số chính xác của nguồn không đạt, chỉ số làm tròn đạt (8,27 / 8,3 ↔ ≥ 8,3) → "loại". Tức so chặt bằng số chính xác nhất của nhóm thắng, không nới khoảng làm tròn. Cũng 19/11 Khoa bảo BỎ: nới luật tần số thứ hai, đổi thứ tự / trần CN_ROWS ↔ PER_SUPPLIER. Ngoại lệ dữ liệu sai của một vài dòng: sửa riêng dòng đó (`ROW_EXCEPTIONS`), không đổi luật.
