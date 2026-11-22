# Nhóm A: nhãn tờ hãng động cơ (22/11/2026)

Nhánh `fix/nhan-to-hang-a`, gốc đo `b953ee8f`. Chưa merge.

## Thay đổi
- `web/catalog.js`: chỉ thêm nhãn "Thermodynamic Cycle" vào `engType`.
- "Injection System" và "Fuel System" KHÔNG vào SPECS: là cột mã riêng của nhiều bảng, thêm vào làm mất 29 `cyl` + 29 `emission` (sr-genset) và 1 `speed` (jichai).
- `suppliers/config-bot.mjs`: `engineSheetChecks` đọc hai nhãn đó thẳng từ tờ một model, chấm `engine_type` / `fuel_system`. Chỉ đạt khi tờ ghi MỌI ý của yêu cầu; còn chữ code không biết thì giữ chưa rõ.

## Đo
- spec-diff: 62.006 bản ghi, khác 1 (baudouin n1021 `engType` = Diesel 4 stroke), 0 mất, 0 thêm bản ghi.
- `quality --check`: đạt.
- Test: `suppliers` 1.544 / 1.544, `web/test/*.test.mjs` 171 / 171.
- check-all 17 lượt, bản chụp 21/11 có 6M31G825/5: 2 cấu hình, 4 check đổi, chỉ gói IB2600603983. 0 check đổi ở gói khác. Chạy `check` hai lần giống nhau.

## Danh sách đủ check đổi

| Gói | Cấu hình | Check | Trước → sau | Giá trị tờ hãng [baudouin 1021] |
|---|---|---|---|---|
| IB2600603983 | 6M31G825/5 + LSA 49.3 M8 + DSE7320 MKII | Kiểu động cơ | chưa rõ → đạt | Diesel 4 stroke; Liquid (water + 50% antifreeze) |
| IB2600603983 | 6M31G825/5 + LSA 49.3 M8 + DSE7320 MKII | Hệ thống nhiên liệu (phun) | chưa rõ → đạt | Direct; High Pressure Common Rail; ECU |
| IB2600603983 | 6M31G825/5 + LSA 49.3 M8 + DSE7420 | Kiểu động cơ | chưa rõ → đạt | Diesel 4 stroke; Liquid (water + 50% antifreeze) |
| IB2600603983 | 6M31G825/5 + LSA 49.3 M8 + DSE7420 | Hệ thống nhiên liệu (phun) | chưa rõ → đạt | Direct; High Pressure Common Rail; ECU |

## Còn lại
- Yêu cầu nêu "dung dịch", "tăng áp", "làm mát khí nạp" vẫn giữ chưa rõ vì bộ từ chưa có, dù tờ 6M31G825/5 ghi "Turbocharged and Aftercooled". Chưa mở rộng.
- Chưa đo top 30: `engType` thêm cho một bản ghi có thể đổi điểm `candidates` của động cơ này. Cần đo cloud.
