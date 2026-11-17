# Nghiệm thu: brandLicensed (hãng tổ máy do NCC mang thương hiệu → confirm)

PR (draft): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/602

## Tệp đổi
- `suppliers/cn/hyundai-power-products.json`: thêm đúng 1 dòng `"brandLicensed": true` sau `"status"`.
- `suppliers/named-genset.mjs`: `brandLicensedSeller`, `brandLicensedChecks`, `BRAND_ASK`.
- `suppliers/config-bot.mjs`: gọi sau `originChecks`; rfq tier 1 + câu hỏi; dọn cờ khi chạy lại.
- `suppliers/config-prompt.md`: đoạn mô tả. `suppliers/named-genset.test.mjs`: 2 test.

## Hành vi
Config thuộc hãng HSMT nêu (namedHit) mà mọi NCC-hãng của nó đều `brandLicensed` → check `genset_make` met/unclear thành `confirm` (confirm=document), ghi chú "thương hiệu Hyundai do GRV POWER PRODUCTS, S.L. chào, cần giấy tờ của nhà sản xuất (CO, CQ, thư uỷ quyền)", rfq tier "Hãng / model / xuất xứ" hỏi "Gửi giấy tờ của nhà sản xuất thương hiệu Hyundai (CO, CQ, thư uỷ quyền bán thương hiệu)". `named` giữ `model`, thứ hạng không đổi. Hồ sơ không có cờ: như cũ.

## Kiểm
- `node --test` từng tệp `suppliers/*.test.mjs` (50 tệp): không tệp nào lỗi; named-genset.test.mjs 13/13.
- Tính lại IB2600601812 bằng code (đầu vào genbid-test\configmatch-601812-recheck.json, hồ sơ web + cờ từ tệp json mới; script genbid-test\brand-601812.mjs, đầu ra genbid-test\configmatch-601812-brand.json): chỉ khác 2 điểm: "Hãng sản xuất tổ máy" met → confirm (#1) và rfq #1 (dòng đó chuyển tier). Hạng 1 = DHY110KSE/HY4A140Z-D25, named=model. Không dòng khác đổi.

## Hồ sơ nghi cùng dạng (CHỈ LIỆT KÊ, chưa đánh dấu, chưa có bằng chứng trong nguồn)
Tên pháp nhân khác thương hiệu Tây: `himoinsa-china`, `hipower` (HIMOINSA POWER SYSTEMS, INC), `aksa-china`, `agg-fuzhou`, `cat-tianjin` (FG Wilson/Cat), `bruno-generators` (Bruno/FUSTEQ). Các hồ sơ TQ khác có chữ "ủy quyền / giấy phép" là uỷ quyền động cơ (Cummins...), không phải thương hiệu tổ máy: không cùng dạng.

## Rủi ro / quay lui
Thấp; xoá dòng `brandLicensed` là về hành vi cũ. Chưa kiểm: `x.licensed` chưa được web đọc (chỉ status/note/rfq hiện); chưa chạy web thật; dữ liệu web chưa đăng.
