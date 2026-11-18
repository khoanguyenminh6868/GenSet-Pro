# Đặc thù hãng động cơ: đầu vào (18/11/2026, phiên điều phối `session_011tAj4SWVDGLLSjnuyb3jXS`)

Khoa 18/11/2026 (IB2600612866): "tại sao trong danh sách gợi ý lại có các động cơ khác trong khi E-TVCS là đặc thù của Kubota? cần tìm các điểm đặc thù của tất cả các loại động cơ để lần sau gợi ý cho đúng".

## Chẩn đoán IB2600612866 (đã kiểm trên kết quả lưu `configmatch/IB2600612866` 17/11 20:19 và log `%TEMP%\genbid-config-IB2600612866.log`)
HSMT (Chương V, A.II): động cơ nhãn hiệu + xuất xứ G7; buồng đốt "Xoáy ba hướng (E-TVCS)"; phun gián tiếp (IDI); liên tục ≥ 11 kW và dự phòng ≥ 12 kW tại 1500 v/p; điều tốc cơ khí; dầu bôi trơn ≤ 6,7 L. Tổ máy "≥ 8.5 ±0.5 kVA", tối đa ≥ 9,35 kVA, 1 pha 220 V, cos φ = 1.

Kết quả lưu có 5 cấu hình: (1) CAT C1.1 rise-power, (2) Kubota D1105 wintpower WT-KU11, (3) Denyo DCA-15LSX / Kubota V2203-K3A (trang hãng, 13 / 15 kVA), (4) Perkins 403A-11G1, (5) Yanmar 3TNV76-GGE.

1. Code không biết E-TVCS là của riêng Kubota: yêu cầu "Kiểu buồng đốt" mang mã `other`, mọi cấu hình đều "chưa rõ – nguồn chưa ghi", không cấu hình nào bị "không đạt", bước chọn ứng viên không lọc hãng. Agent có ghi chú "chỉ động cơ Kubota có thể đáp ứng đúng chữ" nhưng vẫn phải đưa hãng khác (prompt + `rankConfigs` trần 2 cấu hình mỗi hãng).
2. Trần 2 cấu hình / hãng (`rankConfigs`, `perMakeConfigs`) làm mất đúng cấu hình khớp nhất: agent viết 4 cấu hình Kubota (SQ-1120, D1105 WT-KU11, V1505 K-13 của jet-power, V2203-K3A Denyo); code giữ D1105 và V2203-K3A, bỏ SQ-1120 và K-13. Dòng jet-power n125 ghi "V1505-E2BG-CHN-1/11.1KW" (≥ 11 kW) và "D1105-E2BG-CHN-1/8.4KW" (< 11 kW): động cơ đạt công suất bị bỏ, động cơ thiếu công suất được giữ.
3. Biến thể cùng động cơ là các bản ghi rời: D1105, D1105-BG, D1105-E2BG, D1105-E2BG-CHN, D1105-E2BG-CHN-1, "D1105-E2BG-CHN-1/8.4KW" (ô jet-power dính công suất vào mã). Thông số của bản này không tới bản kia; check "Công suất động cơ" của WT-KU11 là chưa rõ.
4. Cấu hình tìm trên internet không qua dải công suất 100–140% (`bandOf`) của ứng viên danh mục: Denyo DCA-15LSX 13 kVA = 153% của 8,5 kVA vẫn vào.
5. (Phụ) Code đọc "đầu phát và vỏ chống ồn đồng bộ cùng một nhãn hiệu" thành "động cơ + đầu phát do chính hãng tổ máy làm (2/2)"; vì vậy agent đi tìm Denyo / Kubota trên internet và mọi tổ máy lắp ráp TQ bị "không đạt" Đồng bộ thương hiệu.

## Thiết kế phiên điều phối đề xuất (chưa qua Khoa ở phần luật)
- Tệp dữ liệu mới (đề xuất `suppliers/engine-traits.json` + test): mỗi mục `{ make, term, aliases[], kind (buồng đốt / phun / điều khiển điện tử / tên dòng / khác), exclusive: true|false, src[], quote[], note }`. `exclusive: true` chỉ khi nguồn CHÍNH HÃNG cho thấy đó là tên riêng / nhãn hiệu của hãng (E-TVCS: Kubota). Từ chung (IDI, common rail, turbo, 4 kỳ) KHÔNG phải đặc thù. Mỗi `quote` nằm nguyên văn trong trang đã lưu (mẫu `manufacturing[]`, `fetch-source.mjs`, test `manufacturing.test.mjs`).
- Dùng (chặng sau, đụng `config-bot.mjs`): HSMT có từ `exclusive` → coi như HSMT nêu hãng động cơ đó (`hints.engineMakes`: ứng viên theo hãng, bỏ trần mỗi hãng), hãng khác "không đạt" ở yêu cầu đó.
