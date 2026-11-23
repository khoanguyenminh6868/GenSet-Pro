---
name: chuan-hoa-datasheet
description: "Việc chuẩn hoá datasheet NCC (dòng máy, động cơ, đầu phát, bộ điều khiển) thành bộ trường chuẩn; quyết định của Khoa 24/11/2026"
metadata:
  node_type: memory
  type: project
  originSessionId: b49d0d88-7eb5-4bd3-b8c8-395854537175
  modified: 2026-11-23T18:30:10.216Z
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
- Khoa: giao cho model phù hợp để hiệu quả và tiết kiệm, theo [[orchestrator-delegate-by-model]].
- Bộ trường em đề xuất bám bộ mã yêu cầu HSMT `suppliers/reqcodes.mjs` (diễn giải của em: dữ liệu dùng để chấm HSMT nên cùng bộ mã).

Liên quan [[supplier-db]], [[config-suggest]].
