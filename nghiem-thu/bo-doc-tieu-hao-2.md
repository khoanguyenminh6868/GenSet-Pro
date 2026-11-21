# bo-doc-tieu-hao bước 2: sửa bộ đọc tiêu hao, xi lanh, bảng dòng máy (21/11/2026)

Nhánh `fix/bo-doc-tieu-hao` (worktree `wt-tieu-hao`). Đo trong `dau-vao\bo-doc-tieu-hao\`.

## Sửa
- `web/catalog.js` bảng nhãn: đơn vị lấy từ ô cùng dòng hoặc cột của dòng đơn vị phía trên, ưu tiên L/h, giữ nguyên văn ở `unitCell`; ô "a / b L/h (@75% / @100%)" đọc theo mức tải; xi lanh "Cylinders / Valves", "6 in line", "12缸V型".
- `web/spec-norm.js`: nhận `unitCell`, "gr/kWh", mức tải ghi trong ô, "in line".
- `suppliers/config-bot.mjs`: tiêu hao của NCC `engine_maker` vào fact động cơ; `fuelChecks` dùng tờ hãng khi dòng tổ máy không có số so được; tên tờ giữ "/" trong mã; bảng dòng máy gắn vào model CÙNG trang liệt kê.
- `suppliers/spec-diff.mjs`: sửa lỗi sập khi một bản ghi thêm thông số ở giữa (ghép theo khoá).
- Ngoại lệ `dropspec` xi lanh: longkai n1158, n1159 ("6 in line" cho 20M33), n1016 ("12 in line" cho SC25G610D2). Nguồn ghi sai, trước đây cũng không đọc.

## Kết quả
- Test 1.501 / 1.501 đạt; `quality --check` không xấu đi (sau khi gộp main 2d2ce26d).
- spec-diff: 61.041 bản ghi, 303 đổi, 0 mất, 0 thêm, 7 NCC; đảo vai 0 → 0. Xi lanh thêm 256; tiêu hao đổi 93, thêm 6.
- Soát từng số (`soat-them.tsv`, đo trước khi gộp main): tiêu hao mới đều là L/h, có trong dòng nguồn, đúng mức tải. Xi lanh: khớp NCC khác 135, không có NCC khác để so 121, lệch 0 (sau ngoại lệ). 121 dòng đó chưa có nguồn thứ hai.
- `modelFacts` (`facts-*.tsv`): 0 fact mất, 639 fact thêm. Fact Baudouin theo dòng máy: 113 cặp model × nguồn khớp hình học, 0 lệch, 15 thiếu số; so NCC khác 204 khớp, 0 lệch, 174 không có NCC khác.
- check-all 17 lượt, gốc 95ecba26 ↔ nhánh TRƯỚC khi gộp main (`so-all.txt`): 47 cấu hình, 46 giống hệt. Đổi duy nhất: IB2600603983 6M31G825/5, ba mục tiêu hao chưa rõ → đạt (156 / 113 / 77 L/h). Thứ tự cấu hình không đổi.

## Cần biết
- Ba số bằng ĐÚNG ngưỡng HSMT, tờ hãng ghi dung sai ±5 %, và là số của ĐỘNG CƠ ở 100 / 75 / 50 % PRP, không phải số đo của tổ máy. Code chấm đạt và ghi rõ nguồn trong ghi chú; chưa có quyết định của Khoa về dung sai.
- Khoảng 1.000 số tiêu hao (chủ yếu longkai, lees) nay có đơn vị L/h nên `candidates` có thể loại dòng vượt ngưỡng: CHƯA đo top 30 (điều phối giao đo trên cloud).
- Chưa sửa: tiêu đề hai tầng lệch cột (uleengen, mecca, legapower, weiman, keliang…; có dòng đọc nhầm công suất động cơ thành tiêu hao, lớp chuẩn hoá giữ "thiếu đơn vị"), bảng nhiều model cạnh nhau (changchai, yangdong), Spec Sheet dòng máy không liệt kê model (1008–1020).
