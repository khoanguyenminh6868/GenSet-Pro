# Đo top 30 Gợi ý cấu hình, PR 1026 (tách mũ 2): gốc so với nhánh

- GỐC: `6ed2aca50d475ed8180d3b34456b9b537f831466` (merge-base origin/main và pr1026). NHÁNH: `15a6b6186c2e1944abd0171c5023233bf415739f` (pull/1026/head). Cả hai khớp SHA yêu cầu.
- Hai lượt dùng CÙNG `suppliers/cn` của NHÁNH và CÙNG một bản bidhist, tải lúc 2026-11-21T08:05:07Z (không đẩy lên repo).
- Số gói: 928; NCC: 435; số lượt: 1093 mỗi bên; lượt lỗi: 0 mỗi bên.
- So khớp theo khoá lượt (1093 khoá giống nhau ở hai bên): giống 1017, khác 76 (so chuỗi JSON nguyên mục).
- Thời gian chạy: gốc 2400 s (08:05 – 08:45 UTC), nhánh 2633 s (lượt hoàn chỉnh 10:33:56 – 11:17:51 UTC).
- Lượt nhánh đầu tiên (từ 08:45) bị dừng giữa chừng khi phiên làm việc khởi động lại (log dừng ở 600 gói), nên chạy lại từ đầu với cùng bidhist; số liệu trên là của lượt chạy lại.
- Tệp: `gop-goc.json.gz`, `gop-nhanh.json.gz` (chỉ số thông báo, khoá dòng, điểm, cờ). Không có bidhist, token hay chữ HSMT.
- Bước 5: sẽ thử `create_trigger` một lần; kết quả ghi ở cuối tệp này nếu bị từ chối.
