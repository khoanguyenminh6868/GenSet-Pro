# Tải tờ đầu phát lần 3: Mecc Alte (24/11/2026)

**Tình trạng**: Mecc Alte soát xong — KHÔNG có tờ nào thiếu thật, nên KHÔNG đổi hồ sơ nào, KHÔNG có PR (worktree `C:\Projects\GenSet Pro\wt-dau-phat-tai-to-3`, nhánh `wt-dau-phat-tai-to-3`, không commit). Bước 3 (Leroy-Somer bảng nhiều model) CHƯA làm: dừng theo luật context.

## Mecc Alte
- 34 model danh mục còn "thiếu tờ" (`dau-vao\dau-phat-dien-ap\thieu-to.json`, đo lần trước). Đối chiếu tên với dòng trong tờ dải 1007–1016 (`genbid-work\alt-datasheets\mecc-alte\soat-ten.mjs`, chèn số cực "4" vào tên danh mục): **26/34 khớp một dòng có thật trong tờ**, ví dụ ECO46-2L ↔ dòng "ECO46 2L4 A" (tờ 1016, kVA theo từng điện áp), ECO38-1LC ↔ "ECO38 1L4 C" (1013), ECP28-MC ↔ "ECP28 M4 C" (1009), ECP32/34-xLC ↔ "ECP32/34 xL4 C", ECO40-2L ↔ "ECO40 2L4", ECO43-1M ↔ "ECO43 1M4".
- Tức là TỜ ĐÃ CÓ, chỉ tên khác (danh mục không có số cực "4" ở giữa; tờ ghi "<khung> <chiều dài><4> <cuộn>"). Việc là alias trong code đọc, không phải tải tờ. Chưa tự sửa (rủi ro làm đổi chọn đầu phát; cần test `makerAltFix` / `dau-phat-hang`).
- 8 model chưa khớp bằng quy tắc này (có thể do soát thô, chưa kiểm tay): ECO40-VL, ECO40 1.5L4B, ECO43-1SN/4, ECO43-2LN, ECO43-VL, ECO46-1.5L, ECO46-VL, và ECO40-VL. Dòng "ECO46 1.5L4 A", "ECO46 VL4 A" CÓ trong tờ 1016 (regex của em bỏ sót hậu tố có dấu chấm / VL) → thực tế ECO46-1.5L / ECO46-VL cũng chỉ là alias. ECO43-xN và ECO40 1.5L4B: chưa tìm thấy dòng.
- Nghiêng về việc trên trang tải công khai (`https://www.meccalte.com/en/download-area`, 200, không đăng nhập; `meccalte.com/dds` trả **403** → bỏ, không đổi UA) có thêm (đã tải vào `alt-datasheets\mecc-alte\`, KHÔNG đưa vào hồ sơ):
  - tờ từng khung 2 cực / 6 cực: `ECP28_C_2pole.pdf` ("ECP28 M2 C"…), `ECP32_C_2pole.pdf`, `ECP34_A_2pole.pdf`, `ECP3_2.pdf`, `ECO_46_6_pole.pdf` ("ECO46LV-1S/6"…). Danh mục không có model nào ghi cực ⇒ thêm vào không gắn được model nào; còn có nguy cơ gây nhập nhằng "ECP28-MC" (M2 C hay M4 C?). Không thêm.
  - catalogue dài (`Serie_ECO_EN`, `Serie_ECO_C_EN`, `Series_ECP_EN`, `Serie_ECP_C_EN`, 15–30 MB, 4.400–4.900 dòng): chưa đọc, chưa nguồn hoá.
- Còn thiếu tờ ≥2 NCC chào: chỉ ECO46-2L (2 NCC) → gắn được ngay khi code có alias "+4".

## Leroy-Somer (bước 3)
Chưa làm. Việc còn lại (như `dau-phat-tai-to-2.md`): code đọc bảng nhiều model (LSA 6627, TAL 5706, LSA 49.3 IC6/IC8 6194/6199) không làm hỏng 4 test `makerAltFix`.

## Việc đề xuất tiếp
1. Alias "<khung>-<dài><cuộn>" ↔ "<khung> <dài>4 <cuộn>" cho Mecc ở nơi `makerAlts` / `meccRatings` khớp tên (khoảng 26 model, 1 model ≥2 NCC), kèm test.
2. Leroy-Somer bảng nhiều model.
3. Trùng nhập nhằng 2 cực / 6 cực: nếu sau này thêm tờ 2 cực, tên danh mục cần cực.
