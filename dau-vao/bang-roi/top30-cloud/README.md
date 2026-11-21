# Đo top 30 Gợi ý cấu hình: PR 1037, GỐC so với NHÁNH

- NHÁNH `pr1037` = 5f8b5de5f41192141f7842b94149d5107477e213 (đúng như yêu cầu)
- GỐC = merge-base với origin/main = 6ed2aca50d475ed8180d3b34456b9b537f831466 (đúng như yêu cầu)
- Cả hai lượt dùng CÙNG `suppliers/cn` của NHÁNH (435 NCC) và CÙNG một bản bidhist, tải lúc 2026-11-21T08:08:15Z (1556 doc, 928 gói máy phát). Script `do-gop.mjs` lấy từ worktree NHÁNH.
- Số lượt: 1093 mỗi bên; lượt lỗi: 0 (cả hai)
- Thời gian chạy: GỐC 2045 s, NHÁNH 2062 s
- So top 30 (khoá dòng + điểm): giống 1054 lượt, khác 39 lượt
- Tệp: `gop-goc.json.gz`, `gop-nhanh.json.gz` (chỉ số thông báo, khoá dòng, điểm, cờ; không có bidhist, token hay chữ HSMT)
- create_trigger: đã thử một lần, công cụ TỪ CHỐI (routine_bridge_target_other_session: phiên này không được đánh thức phiên khác của chủ). Không tìm đường khác.
