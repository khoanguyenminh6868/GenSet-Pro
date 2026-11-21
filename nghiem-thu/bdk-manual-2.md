# bdk-manual-2: chức năng BĐK tuỳ chọn hiện "cần xác nhận" (21/11/2026)

PR draft https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1043, SHA `b60f981b`, từ main `753a44fd`. Chưa merge.

## Kết luận
- Ba chức năng manual ghi là tuỳ chọn / tuỳ cấu hình: phần "chưa rõ" thành "Cần NCC xác nhận", kèm dòng nguyên văn + nguồn [1016]. Không phần nào thành đạt.
- Thứ hạng và điểm cấu hình không đổi: `scoreOf` vẫn đếm phần này như chưa rõ. `candidates` không đổi nên không cần đo lại top 30.
- Câu trích nằm trong dữ liệu (`sourceQuote`, `factSrc`); màn hình vẫn ẩn theo `SHOW_SRC`. Người xem chỉ thấy chip và ghi chú.

| Phần HSMT | Dòng manual | Ghi chú hiện |
|---|---|---|
| Nhiệt độ, áp suất bôi trơn | `Oil Temperature*` | Áp suất có sẵn; nhiệt độ tuỳ động cơ điện tử |
| Mức nước làm mát thấp | `Engine Coolant Level*` | Chỉ ghi hiển thị; không ghi bảo vệ dừng máy theo mức nước |
| Cài đặt, hiệu chỉnh tần số qua hệ thống điều tốc | `Frequency Adjust \| 0.0 %` | Có thể không có tuỳ cấu hình |

Giữ chưa rõ: hết nhiên liệu, sai lệch điện áp giữa các pha, lệch pha.

## Cần điều phối soát
"Bảo vệ: Mức nước làm mát thấp": dòng manual chỉ là số hiển thị, không phải bảo vệ. Làm theo ví dụ trong yêu cầu của điều phối và ghi rõ giới hạn trong ghi chú. Nếu coi là chưa đúng chức năng thì bỏ mục `coolant_level` khỏi `CTL_OPTION_FNS`.

## Đo
Bản chụp mới toàn bộ 17 lượt configmatch (bản 20/11 không có cấu hình DSE7320 MKII nào). 23 lượt + cỡ, 64 cấu hình, 2.280 check, 1.095 phần, gốc ↔ nhánh:
- Đổi đúng 6 phần, đều chưa rõ → cần xác nhận: IB2600603983 #2 (6M31G825/5 + LSA 49.3 M8) và #6 (V20 TE2 + LSA 49.3 M8), mỗi cấu hình ba phần trên.
- 0 đổi thứ tự / danh sách, 0 đổi điểm, 0 đổi trạng thái khác.
- Test `suppliers` qua hết, thêm `ctl-option.test.mjs`.
- Script: `dau-vao\bdk-manual-2\` (`snap.mjs`, `names.mjs`, `check-all.mjs`, `diff.mjs`, `diff.txt`). Chữ HSMT của bản chụp để ngoài sổ.

## Giới hạn
- Chỉ DSE7310 / 7320 MKII có bảng tuỳ chọn. 12 cấu hình ghi "DSE7320" / "Deepsea 7320" không rõ đời không được áp.
- Chỉ áp cho phần trong nhóm chức năng, chưa áp cho check lẻ.
- Số đạt thật của IB2600603983 vẫn chờ chạy lại agent.
