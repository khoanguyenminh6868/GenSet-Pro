# bdk-manual-1: operator manual DSE7310 / 7320 MKII vào nguồn (21/11/2026)

Lần đầu trang tải trả 403 (cả Firecrawl) nên dừng. Khoa tự tải PDF về `C:\Projects\GenSet Pro\Datasheets\`; bản này làm từ tệp đó.

## Kết luận
- **Dữ liệu đã vào nguồn [1016], PR draft, chưa merge.** Điểm trên web CHƯA đổi: `check` chỉ soát câu agent đã trích, nên 3/12, 0/8, 1/13, 4/5 chỉ đổi khi **chạy lại agent** Gợi ý cấu hình. Chưa chạy agent, chưa đo top 30 cloud.
- Dự kiến khi agent chạy lại (soát tay từng phần, mọi dòng có nguyên văn trong facts DSE7320 MKII, 0 dòng thiếu): **Đo lường 3/12 → 11/12, Cảnh báo 0/8 → 7/8, Bảo vệ 1/13 → 10/13, AMF giữ 4/5.** Agent có thể chấm khác số này.

## Đã lưu gì
Nguồn `suppliers/sources/deep-sea-electronics/1016.md`, 057-253 ISSUE 8, URL trang tải chính hãng + ghi "Khoa tải tay 21/11/2026 vì trang trả 403 cho truy cập tự động". Chỉ các mục: 2.7.3 (đầu vào mặc định), 2.9 (cổng), 2.12, 4.4.2, 4.4.3, 4.4.6, 4.4.7, 7.3, 7.4, 7.5 (chỉ các lỗi của bộ điều khiển), 8 / 8.2.5 (phần tuỳ chọn). Bỏ lắp đặt, đấu dây, mô-đun mở rộng, sạc DSENet, ECU, Dual Mutual.
Installation Instructions 053-181: **không đưa vào**, chỉ có sơ đồ đấu dây và bảng tham số trùng manual.

## Cơ chế có sẵn ↔ tuỳ chọn (phần dữ liệu đã làm)
Hai bảng cùng nguồn [1016]:
1. `Datasheet: DSE7310 MKII & DSE7320 MKII Operator Manual 057-253 ISSUE 8`: 226 dòng có sẵn, gắn cho hai model.
2. `Options and configuration-dependent lines: Operator Manual 057-253 ISSUE 8`: 106 dòng tuỳ chọn (mục có dấu `*`, hiệu chỉnh tần số, bảo vệ dòng lưới). Tiêu đề KHÔNG có model nên `modelFacts` không gắn: agent không trích được để chấm đạt, phần đó giữ chưa rõ.

Đề xuất PR code sau (chưa làm, báo điều phối trước vì phiên khác đang sửa `config-bot.mjs` / `ctl-module.mjs`): đọc bảng 2 để ghi "cần xác nhận" kèm câu trích, thay vì "chưa rõ" không có dòng.

## Từng phần (đầy đủ dòng: `dau-vao\bdk-manual-1\cm-map.md`)
Giữ chưa đạt, cần điều phối soát:
- **Nhiệt độ, áp suất bôi trơn:** Oil Pressure có sẵn, `Oil Temperature*` có dấu `*`.
- **Mức nhiên liệu thấp / hết:** có `Fuel Level Low`, manual không ghi "hết nhiên liệu".
- **Mức nước làm mát thấp:** BẪY, `Low Coolant Warning` là nhiệt độ thấp; `Engine Coolant Level*` qua ECU.
- **Sai lệch điện áp giữa các pha:** manual chỉ nêu mất cân bằng DÒNG (Negative Phase Sequence).
- **Lệch pha:** có Gen Phase Seq Wrong (thứ tự pha) và Negative Phase Sequence; HSMT không rõ nghĩa nào nên chưa chấm.
- **Hiệu chỉnh tần số qua điều tốc:** `Frequency Adjust`, `Governor Gain` ở Running Editor, nhưng manual ghi một số giá trị có thể không có tuỳ cấu hình → cần xác nhận.

Lưu ý: các bảo vệ tính đạt là manual ghi có chức năng; ngưỡng và việc bật do cấu hình (manual 7.1.1 cho phép tắt bảo vệ).

## Đo
- `verify.mjs`: 435 bản ghi, 0 lỗi. `quality --check`: không chỉ số nào xấu đi.
- Khoá `controller:*`: 53 → 53, không khoá lạ. DSE7310 MKII 231 → 457, DSE7320 MKII 238 → 464 (+226). Loại BĐK 47 và mô-đun 8 không đổi.
- `check-all` 17 lượt gốc ↔ nhánh: 0 check đổi. IB2600603983 lượt 03:54:13Z chạy check có / không [1016]: giống hệt.
- 7 lượt chạy `check` hai lần cho kết quả khác nhau, giống nhau ở cả gốc và nhánh nên không do PR này: IB2600581977, IB2600601812, IB2600602880, IB2600603983, IB2600609805, IB2600612866, IB2600613475.

## Việc tiếp (CHƯA làm)
1. Điều phối soát danh sách trên, giao đo top 30 cloud, rồi chạy lại agent IB2600603983 để có số thật.
2. Controllers.md của DSE7310 / 7320 MKII dài thêm 226 dòng mỗi lượt có hai model này.
3. Hãng / model nên làm tiếp: DSE7420 MKII, DSE8610 MKII, rồi ComAp InteliLite 4; trang tải có thể cũng trả 403, khi đó cần Khoa tải tay.
