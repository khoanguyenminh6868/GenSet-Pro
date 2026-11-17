# Nghiệm thu: Hyundai DHY110KSE 5001 — dòng "brushless" + bảng chức năng ●/○ thành khối dọc

PR nháp: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/603 (nhánh `hyundai-5001-vertical`, từ main 3714b6d = sau #601). Không đổi code.

## Tệp đã đổi
- `suppliers/sources/hyundai-power-products/5001.md`: thêm 1 dòng vào khối `DHY110KSE Alternator`; thêm cuối tệp 3 khối chức năng (văn gốc bên trên giữ nguyên).
- `suppliers/cn/hyundai-power-products.json`: cùng nội dung ở `specTables` (n=5001): 1 dòng + 3 bảng không header, tiêu đề chỉ có MỘT mã model (DHY110KSE; không đưa "AMF9" vào tiêu đề để `gensetSheetOf` còn nhận). Không sửa `sources` / `controllers`, không cần.

## Nội dung
1. `| Benefits and Feature | HYUNDAI high quality and performance brushless alternator, with AVR` — nhãn "Benefits and Feature" là tiêu đề cột của datasheet; bỏ khoảng trắng thừa trước dấu phẩy.
2. Ba khối `DHY110KSE Control panel measurement, displayment` (18 dòng), `... alarm, shutdown function` (13), `... other functions` (8): `| nhãn | ● standard` hoặc `| nhãn | ○ optional`. ● = standard, ○ = optional theo chú giải của datasheet ("●standard ○optional × None"). Nhãn giữ nguyên chữ (kể cả lỗi chính tả "chargering"). Cách gán dấu: trong bản pdftotext mỗi nhãn có đúng một dấu, cùng dòng hoặc ngay dòng sau (18 nhãn/18 dấu ở khối đo lường); không có chỗ lệch cột. Optional: Mains Phase to neutral / phase to phase voltage, Mains frequency, Mains low-high voltage / frequency warning, RS232, RS485, GPRS, GPS. Bỏ các nhãn cột trái (Control panel, AMF9, ATS connector, 24 pin, Heavy duty connector, E-STOP, "Power switch | Optional", Breaker): chú thích ảnh, không phải chức năng; ghi rõ trong 5001.md.

## Lệnh kiểm + đầu ra
- `node --test suppliers/*.test.mjs` → `# tests 509 # pass 509 # fail 0`.
- `node suppliers/verify.mjs` → `434 bản ghi, 0 có lỗi`.

## Tính lại IB2600601812 hạng 1 (ĐO, code của nhánh, hồ sơ hyundai của nhánh, kết quả đã lưu 2026-11-12T17:39Z)
Script `genbid-test\recheck2-601812.mjs` → `genbid-test\configmatch-601812-recheck2.json` (+ `.changes.txt`), không đăng.
- Chỉ code (check + rankConfigs trên kết quả lưu): hạng 1 **21 đạt / 11 chưa rõ / 11 xác nhận / 0 không đạt**, giống hệt recheck sau #601 → **0 dòng chuyển**. Lý do: các dòng đó là dòng do agent viết "chưa rõ"; code chưa tự quyết nhóm chức năng bộ điều khiển / kiểu đầu phát từ khối dọc của tổ máy (`sheetChecks` chỉ có alt_vreg, alt_power, genset_make). Dữ liệu mới chỉ cho agent trích được.
- Mô phỏng agent trích các dòng mới (ƯỚC TÍNH, `genbid-test\sim2-601812.mjs`; agent thật chưa chạy): bản cũ dữ liệu: mọi câu trích bị hạ về chưa rõ ("câu trích nguồn"); bản mới: `check` giữ nguyên các câu trích. Hạng 1 → **23 / 9 / 11 / 0**, đổi chiều duy nhất chưa rõ → đạt, không dòng nào sai chiều:
  - Kiểu đầu phát: chưa rõ → đạt, nếu agent trích dòng "brushless … with AVR" (+ "Self-excitation"). Chưa chắc: HSMT còn đòi "Xoay chiều", datasheet không ghi chữ này → agent có thể để "cần xác nhận".
  - Khởi động, dừng, AMF: chưa rõ → đạt (bộ phận "Khởi động máy và tắt máy" ← `Remote start and stop ● standard`). Chưa chắc: đó là khởi động từ xa; có thể muốn "xác nhận".
  - Đo lường: 6 bộ phận chưa rõ → đạt (giờ chạy, công suất tác dụng/biểu kiến, hệ số công suất, tốc độ động cơ, nhiệt độ nước, mức nhiên liệu); nhóm vẫn chưa rõ vì còn "Số lần khởi động máy" (datasheet không ghi) và "Nhiệt độ, Áp suất bôi trơn" (chỉ có áp suất dầu).
  - Bảo vệ: 3 bộ phận → đạt (nhiệt độ nước cao, áp lực dầu thấp, mức nhiên liệu thấp); nhóm vẫn chưa rõ vì Ngắn mạch (không có trong datasheet).
  - Không đổi: loại BĐK "kỹ thuật số", làm mát két+quạt, 4 kỳ, phun điện tử, tốc độ quay, khí thải, xuất xứ.

## 3 mẫu đối chiếu nguồn (datasheet DHY110K(S)E.pdf, https://www.hyundaipower-de.com/mediafiles/Anleitungen/Generatoren/Diesel/Datenblatt/DHY110K(S)E.pdf)
1. "HYUNDAI high quality and performance brushless" + "alternator , with AVR" (5001.md dòng 14–16, phần Benefits and Feature).
2. "| Low oil pressure warning,shutdown | ●" → khối alarm `● standard`.
3. "| Mains Phase to neutral voltage | ○" → khối measurement `○ optional`.

## Rủi ro còn lại + quay lui
- Chưa đối chiếu bằng ảnh PDF (không tải lại tệp, chỉ dựa pdftotext); vị trí dấu suy từ thứ tự dòng, an toàn vì mỗi nhãn đúng một dấu.
- "Remote start and stop" có thể được coi là chưa đủ cho "khởi động/tắt máy".
- Hồ sơ hyundai trên web chưa cập nhật tới khi merge + ingest. Quay lui: revert PR #603.
- Việc ngoài phạm vi (không làm): code tự quyết nhóm chức năng / kiểu đầu phát từ khối dọc để khỏi chờ agent.
