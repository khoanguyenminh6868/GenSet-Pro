// Vì sao KHÔNG chạy Tìm Thông Số cho một nhà cung cấp, "" khi chạy được (Khoa, 2026-11-13: "chặn đi"): Agent chỉ tìm trên
// website của chính nhà cung cấp, hồ sơ không có website thì không có trang nào để đọc và lượt chạy (vài USD) không ra gì.
// 73 / 435 hồ sơ chưa có website hôm đó. config-bot.mjs specPrep ném lý do này trước khi tạo thư mục hay gọi Agent (specJob
// ghi nó làm lỗi của yêu cầu); gaps.mjs --queue bỏ hãng đó để chỗ cho hãng kế tiếp.
// Tệp nhỏ riêng vì config-bot.mjs import tệp này: tệp mà config-bot.mjs import thì không được import ngược config-bot.mjs.
export const specSkip = (s) => (String(s?.website || "").trim() ? "" : "Nhà cung cấp chưa có website trong hồ sơ nên không có trang nào để tìm thông số. Thêm website cho nhà cung cấp rồi bấm lại.");
