# bdk-mo-dun-4: web + RFQ hiện mô-đun, phương án khác, BĐK "NCC chưa chào" (21/11/2026)

Việc: Khoa 20/11/2026 "1. Ok làm đi". Nhánh `bdk-mo-dun-4-web` (worktree `wt-bdk-mo-dun-4`, từ origin/main 95ecba26).

## Sửa
- `web/index.html`: `cfgCtlMoreHtml` dưới dòng "Bộ điều khiển": mỗi mô-đun (model, hãng, "mã đặt hàng …", chip "NCC chưa chào" hoặc "NCC X chào", nhãn + "cho: <chức năng>", câu Ethernet nằm trên mô-đun khi `why` có Ethernet); "Phương án khác đạt tương đương" mỗi bộ một dòng (bộ + mô-đun + mã, chip loại AMF / hòa đồng bộ / chỉ tự khởi động, "truyền thông đạt m/n, chưa rõ: …", NCC chào / NCC chưa chào). Bộ phận `fromMaker` (bộ điều khiển VÀ đầu phát) có chip "NCC chưa chào"; `CFG_SRC.maker` = "Tài liệu hãng" (trước đây chip nguồn của đầu phát theo datasheet hãng rỗng). Kết quả không có các trường mới: không vẽ gì thêm (test).
- `suppliers/config-bot.mjs` `rfqOf` (chỉ vùng RFQ): bộ điều khiển `fromMaker` → dòng "Bộ điều khiển X": "Xác nhận NCC cấp được bộ điều khiển X (hãng); nêu nước sản xuất, gửi CO"; mỗi mô-đun `offeredBy: null` → "Mô-đun Y, mã đặt hàng Z" (yêu cầu "cho …"): "Xác nhận NCC cấp được mô-đun Y (hãng), mã đặt hàng Z lắp kèm bộ điều khiển X; nêu nước sản xuất, gửi CO". Tầng 1 (Hãng / model / xuất xứ), ghi chú = nhãn.
- BMS qua Modbus và ghi chú Ethernet của từng mục vẫn ở cột Kết quả của bảng yêu cầu (`x.note`, đã có từ PR 2/3).

## Kiểm trên dữ liệu thật
`node run.mjs <worktree>` (thư mục `bdk-mo-dun-4\`): đọc configmatch IB2600603983 trên web (`goc.json`, lưu 21/11 00:43), chạy `check` + `rankConfigs` của nhánh (= main + RFQ; vùng check không đổi) → `sau.json`, 0 problems:
- #1 QSK19-G20, #2 6M31G825/5, #5 4006-23TAG3A: DSE7420 (NCC chào) + DSE890 MKII 0890-04 (chưa chào) → 1 dòng RFQ mô-đun; phương án khác DSE7320 MKII + DSE890 MKII 6/7 (aosif chào / chưa chào / bobig-power chào).
- #3 V20 TE2, #4 S6R2-PTAA, #6 6M33G825/5: DSE7420 MKII theo tài liệu hãng (fromMaker) → 1 dòng RFQ bộ điều khiển; phương án khác DSE7320 MKII + DSE890 MKII (fdk-energy chào ở #4).
- Bản trên web (`goc.json`) đã có `fromMaker` ở #3, #4, #6, nên thẻ web hiện được ngay sau khi merge. Dòng RFQ mới thì chưa có trong bản đã lưu: `c.rfq` chỉ được ghi khi gói chạy lại `check` (ảnh và số trên dùng `sau.json`, chưa đăng lên web).

## Ảnh (`bdk-mo-dun-4\`, `node shot.mjs`: web origin/main ↔ nhánh, cùng `sau.json`, server thử + DB giả, gói thêm vào feed)
- `truoc-cau-hinh-1.png` / `sau-cau-hinh-1.png`: #1, mô-đun + mã đặt hàng + phương án khác (NCC aosif chào).
- `truoc-cau-hinh-3.png` / `sau-cau-hinh-3.png`: #3, BĐK "Tài liệu hãng" + "NCC chưa chào", phương án khác "NCC chưa chào".

## Test
- `suppliers/ctl-rfq.test.mjs` (mới, 2), cfg-r2/r3/r4, ctl-module, ctl-amf, dau-phat-hang, regress-config: 76 pass (fixture không đổi).
- `web/test/cfg-ctl-module.spec.mjs` (mới, 2: kết quả cũ không đổi; có trường mới); static 11/11.
- Playwright toàn bộ (Edge, máy đang tải nặng, 22,8 phút): 132 đạt, 4 hỏng, cả 4 ở `files.spec.mjs` do quá hạn 30 giây. Chạy riêng `files.spec.mjs` một worker, hạn 180 giây: 7/7 đạt. Chưa chạy lại toàn bộ bộ test `suppliers/` trên máy (chỉ các tệp nêu trên), chờ CI.
