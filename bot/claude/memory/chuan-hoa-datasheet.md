---
name: chuan-hoa-datasheet
description: "Việc chuẩn hoá datasheet NCC (dòng máy, động cơ, đầu phát, bộ điều khiển) thành bộ trường chuẩn; quyết định của Khoa 24/11/2026"
metadata:
  node_type: memory
  type: project
  originSessionId: b49d0d88-7eb5-4bd3-b8c8-395854537175
  modified: 2026-11-23T22:27:11.367Z
---

Khoa 24/11/2026 giao: chuẩn hoá thông số dòng máy của các NCC và cả động cơ, đầu phát, bộ điều khiển.

- Thứ tự Khoa chốt: bước 1 (bộ trường chuẩn) → 2 (lưu bản chuẩn) → 3 (bố cục / bảng chưa đọc) rồi mới 4 (nhãn chưa nhận) → 5 (nơi dùng đọc bản chuẩn).
- Bước 1 phải trình danh sách trường cho Khoa review, Khoa duyệt mới làm tiếp (đã trình 24/11, chờ duyệt).
- Khoa: "Sau khi chuẩn hoá, Web sẽ chỉ xuất hiện các thông tin đã được chuẩn hoá này."
- Khoa hỏi vì sao không lưu Supabase mà lưu GitHub. Em trả lời và đề xuất (chờ Khoa chốt): git giữ bảng gốc + code đọc (verify, PR, lịch sử); bản chuẩn do workflow sinh và đăng lên Supabase thành collection riêng, web đọc từ đó, không commit tệp sinh vào git.
- Khoa XÁC NHẬN 24/11/2026 ("mấy cái kia anh xác nhận"): (1) bản chuẩn do workflow sinh, đăng Supabase thành collection riêng, không commit vào git; (2) giá trị thiếu điều kiện vẫn hiện trên web kèm ghi chú ("nguồn không ghi mức tải"), chỉ ẩn giá trị không đọc ra số; (3) công suất động cơ: lưu kWm (prime / standby, tốc độ) + kVA và kW điện của tổ máy mà nguồn ghi cho động cơ đó, nguồn không ghi kVA thì để trống, không quy đổi.
- Danh sách trường: Khoa chốt MỘT lần sau khi đọc xong datasheet Deep Sea (phiên con `dse-datasheet`, tệp đề xuất `genbid-work\dieu-phoi\nghiem-thu\chuan-hoa-bdk-truong.md`). Chưa chốt thì chưa làm bước 2.
- Khoa 24/11: đầu phát lấy bộ trường như tờ Leroy-Somer TAL (bước quấn, số đầu dây, độ cao, tốc độ vượt, lưu lượng gió, ngắn mạch duy trì, hệ kích từ, loại AVR, ổn định điện áp, THD không tải / tải tuyến tính, TIF, THF, bảng công suất theo chế độ / nhiệt độ / cấp cách điện / pha / điện áp). Động cơ thêm điện áp hệ thống điện (VDC); nhãn "Cooling System Capacity", "Total Oil Capacity", giá trị "Line" chưa được code nhận (việc bước 4).
- Khoa có tài khoản Deep Sea, đã đăng nhập trong trình duyệt của Khoa; tài liệu phải đăng nhập mới tải được thì giữ ngoài git chờ Khoa quyết (repo public tới 01/12/2026; cách giữ này là em đặt).
- HSMT ghi kVA / kW điện ở mục động cơ (đo 24/11 trên 1.298 gói: 16 gói chỉ kVA, 14 gói cặp kVA/kW, 25 gói kW = 0,8 × kVA; đa số còn lại đòi kW cơ, ~68 gói HP): kVA và cặp kVA/kW là yêu cầu của TỔ MÁY, so với kVA / kW điện của tổ máy, không so kWm; chỉ kW bằng 0,8 × kVA thì coi là mức tối thiểu kWm. Khoa 24/11: KHÔNG cần thêm câu hỏi làm rõ HSMT cho trường hợp này. Động cơ thêm trường HP khi nguồn ghi (đề xuất của em, chờ chốt cùng danh sách trường). Chưa kiểm bước chấm đạt (`makerSheetChecks`) xử lý ba trường hợp này thế nào.
- Khoa 24/11 (việc sau khi chốt trường): (1) chốt xong trường BĐK thì mở phiên KHÁC cào lại data các hãng BĐK ngoài Deep Sea (SmartGen, ComAp, Datakom…) cho đủ bộ trường; (2) đầu phát phải lưu thông tin điện theo TỪNG mức điện áp (380 V, 400 V…), mở phiên RIÊNG cào lại data các đầu phát chưa đủ. Ghi chú của em: `sources/<id>/<n>.md` giữ nguyên chữ datasheet, chỉ `datasheets/<id>.json` lọc dòng theo nhãn code nhận → tờ đã lưu thì đọc lại từ sources, chỉ model thiếu tờ mới phải tải.
- Khoa 24/11 (ảnh màn "Thông số động cơ" trên web, nguyên văn "những giá trị này nên xem là 1 vì ý nghĩa giống nhau"): các cách viết cùng nghĩa phải gộp thành MỘT giá trị: "150 × 185" = "150 X 185"; "39.2 L" = "39,2 L"; "12" = "12 V" (cùng 12 xi lanh); "15.0:1" = "15 : 1"; điều tốc "Electronic" = "Electronic Governor" = "Electrical"; "&" = "and" (Khoa 24/11: "Turbocharged & Aftercooled" = "Turbocharged and Aftercooled"). Diễn giải của em: gộp theo giá trị SAU chuẩn hoá, cộng dồn số NCC / số dòng; "12 V" giữ thêm bố trí chữ V như thông tin phụ; số khác nhau thật thì vẫn hiện riêng (mâu thuẫn nguồn).
- Khoa 24/11: "các phiên con sau em chạy trên máy KhoaMiniPC nhé, máy này anh sắp tắt" → phiên con của việc này mở trên máy KhoaMiniPC (phiên điều phối và phiên `dse-datasheet` đang ở chính máy đó; "máy này" là máy Khoa đang ngồi). Em hiểu chỉ áp cho việc chuẩn hoá này, luật chung "chạy cloud khi được" (21/11) chưa bị Khoa bỏ.
- Khoa CHỐT 24/11/2026 (trả lời bốn câu em hỏi, nguyên văn "1. ok 2. thêm thương hiệu ở đâu nữa (Trung Quốc, G7, G20, EU,...) 3. ok, cứ giữ không xóa 4. ok"): (1) merge PR #1117 dữ liệu Deep Sea; (2) danh sách trường đã trình được duyệt, THÊM trường "thương hiệu ở đâu" (nước của thương hiệu + nhóm Trung Quốc / G7 / G20 / EU…) — em hiểu là áp cho cả bốn phần (tổ máy, động cơ, đầu phát, BĐK) và tách khỏi "nơi sản xuất"; (3) Operator Manual Deep Sea: được tải bằng tài khoản của Khoa (Edge trên KhoaMiniPC), giữ ngoài git ở `genbid-work\dse-datasheets\`, KHÔNG xoá; (4) ~95 sản phẩm Deep Sea ngừng bán chưa đưa vào hồ sơ, trừ model từng có trong HSMT / hàng trúng thầu. Trường HP động cơ đi cùng danh sách đã duyệt.
- Khoa: giao cho model phù hợp để hiệu quả và tiết kiệm, theo [[orchestrator-delegate-by-model]].
- Bộ trường em đề xuất bám bộ mã yêu cầu HSMT `suppliers/reqcodes.mjs` (diễn giải của em: dữ liệu dùng để chấm HSMT nên cùng bộ mã).

Liên quan [[supplier-db]], [[config-suggest]].
