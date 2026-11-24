# Tải tờ đầu phát lần 2: Leroy-Somer, Marathon, Mecc Alte (24/11/2026)

PR nháp (chưa merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1135 — nhánh `wt-dau-phat-tai-to-2`, worktree `C:\Projects\GenSet Pro\wt-dau-phat-tai-to-2`, 1 commit (Leroy-Somer). CI chưa xem.
**Tình trạng**: xong Leroy-Somer phần TAL; DỪNG vì luật context 30 %. Marathon: đã tìm, kết luận không có tờ. Mecc Alte: CHƯA làm.

## Leroy-Somer
Trang công khai `https://www.leroy-somer.com/_iframe/en/epg/downloads/catalogues.php` liệt kê 54 tệp (không đăng nhập). Tệp tải về ở `genbid-work\alt-datasheets\leroy-somer\`.
- **Thêm 6 tờ** vào hồ sơ `leroy-somer-fuzhou` (nguồn 1015–1020): TAL 040 (5672), 042 (5673), 044 (5674), 046 (5675), 0473 (5864), 049 (5677), đều `documentation_pdf/<số>_en.pdf`.
- `verify.mjs`: 436 bản ghi, 0 lỗi. 4 test (`ls-ratings`, `dau-phat-hang`, `dau-phat-hang-d`, `regress-config`): 38/38. Hồ sơ chỉ thêm (nguồn 6001–6004 chỉ đổi thứ tự).
- **Tự gắn được 12 model (≥2 NCC)**: TAL044M, TAL042C, TAL040D, TAL042H, TAL044B, TAL044D, TAL040F, TAL042F, TAL044A, TAL044J, TAL044H, TAL044L. Thiếu tờ ≥2 NCC: **28 → 16**.
- **Cố ý KHÔNG đưa**: các tờ bảng định mức nhiều model (LSA Rating Table 6627, TAL rating table 5706) và LSA 49.3 IC6 / IC8 (6194, 6199). Chạy thử thì tiêu đề không nêu một model nên không gắn được, và LSA 49.3 IC6/IC8 + bảng 6627 làm 4 test hỏng (đầu phát chọn LSA 49.3 L11 thay vì M8). Tờ đã tải ở `alt-datasheets\leroy-somer\` (6627, 5706, 6194, 6199) cho việc code đọc bảng nhiều model sau này; 6627 có dòng LSA 53.2 M9/M12, 54.2 M10/L14/UL14, LSA 52.3 theo từng điện áp.
- **Còn thiếu tờ (16)**: LSA 53.2M9(5), LSA 47.2 m7(4)/S5(4)/VS2(3)/S4(3), LSA49.3 S4(4)/M65(3), LSA40 M7(3), LSA52.3 UL16 C6S/4(2), LL5114H(2), LL7224J/L(2), LSA54.2M10 2736KW(2), LSA54.2UL14 3456KW(2), TAL-A46-B(2), TAL-A47-C(2).
  - LSA 47.2: trang hãng chỉ có hướng dẫn lắp đặt (3742_en.pdf, không có bảng kVA theo điện áp); tờ kVA chỉ thấy ở bản của đại lý (genpowerusa.com…) — không lấy. Catalogue hãng có LSA 47.3 (đã có tờ 1011), không có 47.2.
  - LSA 49.3 S4 / M65, LSA 40 M7, TAL-A46-B, TAL-A47-C: đã có tờ cùng họ (1004, 1005, 1007, 1012) nhưng tên model không khớp (cột ghi khác) → việc alias của code, chưa soát.
  - LL5114H, LL7224J/L: catalogue hãng không có tờ LL.
  - LSA 53.2 / 54.2 / 52.3 UL16: chỉ nằm trong bảng 6627 (nhiều model) và tài liệu MV/HV 4728_en.pdf (chưa tải).
  - Tờ TAL-A40…A49 cũ (1001–1006) viết "TAL-A40-D", danh mục NCC ghi "TAL040D": tên khác nhau, mới có tờ 040–049 là gắn được.

## Marathon
- `marathonelectric.com` mở được qua tìm kiếm; tờ nằm ở `literature.marathonelectric.com` (tải HTTP 200, không đăng nhập): "Ratings & Specifications Guide 60 Hz" (`MG-CT24015E-R22-…60Hz…pdf`, 64 trang, 4.419 dòng) và Brochure MagnaMax; đã tải vào `alt-datasheets\marathon\`.
- Tên danh mục MX-600-4, MP-400-4, MP-H-100-4… (28 model) KHÔNG có trong hai tài liệu đó (grep 0 dòng; hãng dùng mã khung như 361CSL4004, 432RSL4009, MagnaMax/MagnaPlus). Các tên này chỉ thấy ở NCC Trung Quốc (kachai, dingbo, rise-power, bspower…) cạnh "MX-600-4 | 600 kW…". Không có cơ sở tài liệu để nối với mã của hãng → **không đưa vào hồ sơ** (không đoán). Việc này là tên nội bộ do Trung Quốc đặt, cần Khoa / điều phối quyết có coi là Marathon thật hay không.
- Chưa thử weg.net (không cần vì marathonelectric tải được).

## Mecc Alte
CHƯA làm: ECO46-2L(2) ↔ tờ 1007–1016 (ghi "ECO46 4 A"…), vẫn là việc alias. Tờ hãng `meccalte.com/dds/pdf/<số>` nên thử số khác.

## Việc chưa làm
- Mecc Alte (soát ECO46-2L; 34 model, 1 model ≥2 NCC).
- Code đọc bảng nhiều model (LSA Rating Table 6627, TAL 5706) để gắn LSA 53.2 / 54.2 / 52.3 và LSA 49.3 theo hậu tố; không làm hỏng test `makerAltFix` (đã thấy lỗi nếu đưa 6627 / IC6 / IC8 vào).
- Alias LSA 49.3 S4 / M65, LSA40 M7, TAL-A46-B, TAL-A47-C.
- Marathon MX-/MP-: quyết có phải Marathon thật.
