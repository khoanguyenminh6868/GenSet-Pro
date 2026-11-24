# Báo giá trị sai MỚI của bản chuẩn (spec-value-gate) — 24/11/2026

Khoa 24/11/2026: "Bộ kiểm giá trị khi nối vào workflow đăng thì cảnh báo cho anh biết để quyết định."
Nhánh `spec-value-gate` (worktree `wt-spec-value-gate`), PR nháp vào main.

## Đã làm
- `suppliers/spec-value-gate.mjs` (mới) + `spec-value-gate.test.mjs` (6 ca). Import `runAll` của `spec-value-check.mjs`; KHÔNG sửa `spec-value-check.mjs`, `spec-value-rules.json`, `web/catalog.js`, `spec-standard.mjs`.
- Bước "Spec value gate" trong `.github/workflows/supplier-publish.yml`, ngay sau "Spec standard", `continue-on-error: true`.
- Khoá bền mỗi vi phạm: `phần.trường | model | NCC | số nguồn | băm chữ dòng nguồn | băm giá trị | luật` (không dùng vị trí dòng; đổi số thứ tự bảng / dòng không làm ca cũ thành mới; test có ca này). Chỉ mức "sai" tính; "chưa chuẩn" (1.408) chỉ đếm.
- Bản lần trước: doc `specvalue/current` = `{ at, commit, keys[] }` trong bảng `docs` (cách `rowflags/current`), chỉ ghi khi danh sách khoá đổi, ~33 KB với 405 khoá. Không commit vào git. Không cần tạo bảng hay đổi secret / biến.
- Lần chạy đầu (chưa có doc): chỉ lưu mốc 405 ca, không báo.

## Kênh báo: Khoa sẽ thấy gì, ở đâu (nói thẳng giới hạn)
Trong repo KHÔNG có kênh nào đẩy thông báo giá trị-sai tới Khoa: `rowflags` là cờ theo DÒNG hiện ở chi tiết NCC (người duyệt bấm ok / bỏ, và cờ "drop" làm dòng bị loại khỏi Gợi ý, nên không đưa giá trị sai vào đó); bot không có kênh báo; không màn web nào liệt kê "việc cần duyệt". Kênh dùng lại được và đã tồn tại:
1. **Trang lượt chạy workflow "Supplier publish" trên GitHub Actions**: tóm tắt (Job summary) có bảng gom theo NCC (trường, model, giá trị, chữ gốc, số nguồn, luật vi phạm, ≤ 50 ca mỗi NCC) + số ca đã hết; thanh chú thích có `::warning:: N giá trị sai mới`. Bước KHÔNG làm workflow đỏ, nên GitHub không gửi mail: Khoa chỉ thấy khi mở lượt chạy.
2. **Phiên điều phối** (như `row-flags.mjs` "NCC quá nửa bảng nghi" đã chạy khi rà sổ): đọc `gh run view <id>` / tóm tắt rồi báo Khoa. Đây là việc người phải làm; chưa có tác vụ tự động.
Nếu Khoa muốn tự thấy không cần mở Actions, cần làm kênh mới (chưa làm, chờ quyết):
 a. Màn "Giá trị nghi sai" trong web, đọc doc `specvalue/current` (cần thêm danh sách ca đầy đủ vào doc ~150 KB, đăng ký đọc ở `web/api/requests.js` + `shim.js`, vẽ ở `web/index.html`): ~1 PR web lớn, Khoa (Superadmin) thấy ở màn Nhà cung cấp.
 b. Tự mở / cập nhật một GitHub Issue "Giá trị sai mới" từ workflow (`gh issue`, token mặc định + `issues: write`): GitHub gửi mail cho Khoa; ~20 dòng workflow, nhưng là bài đăng ngoài repo công khai (chữ dòng nguồn) nên cần Khoa cho phép.
 c. Phiên điều phối tự đọc tóm tắt mỗi lần merge dữ liệu NCC (sổ điều phối): không code, tốn lượt điều phối.

## Thời gian (đo cục bộ, 436 NCC, 9.685 doc)
- Trước: bước "Spec standard" dry ≈ 3 phút 40 giây (đo `spec-standard.mjs --post --dry`).
- Thêm: bước mới ≈ 6 phút 50 giây (`standardOf` chạy LẠI bên trong bộ kiểm + kiểm ~3 phút). Không dùng lại được kết quả bước trước vì hai bước là hai tiến trình node và `spec-standard.mjs` không xuất kết quả; muốn dùng lại phải sửa `spec-standard.mjs` (cho gọi cổng từ tiến trình của nó) — chưa làm theo ràng buộc, nêu để điều phối quyết. Máy runner có thể chậm hơn; ước ~+7 phút mỗi lượt, chỉ khi push chạm `suppliers/cn/**`, `web/catalog.js`…

## Thử (không khoá, không chạy workflow thật)
- Lần 1 `--dry`: "lưu mốc 405 giá trị sai, chưa báo ca nào"; doc 405 khoá, 33 KB.
- Lần 2 với mốc cũ bị bớt 4 khoá + 1 khoá giả: báo 4 ca mới (huipu-power 2: bore_stroke "128*14" → 14 ngoài 50-400; aosif 1: charge_cooling "Oil cooled"; jlmech-wuhan 1: "200210"), 1 đã hết, tổng 405; đúng định dạng bảng gom theo NCC.
- `node --test suppliers/spec-value-gate.test.mjs`: 6/6. Toàn bộ `suppliers/*.test.mjs`: xem PR.

## Cách tắt / việc tay sau merge
- Tắt: đặt biến repo `SPEC_VALUE_GATE` = `0` (bước thoát ngay) hoặc xoá bước.
- Việc tay: KHÔNG bắt buộc. Lượt chạy đầu sau merge tự lưu mốc. Muốn đặt lại mốc: xoá dòng `coll=specvalue, id=current` trong bảng `docs`.
- Bẫy: sửa luật ở `spec-value-rules.json` làm vi phạm mới / hết hàng loạt ở lượt kế (khoá gồm tên luật + chữ giá trị); đổi cách tính `row` / `raw` của bộ kiểm cũng vậy.
