# dau-phat-hang D2 — đọc định mức Mecc Alte / Stamford S6–S7, suy giảm, nơi SX (21/11/2026)

Nhánh `dau-phat-hang-d2` (từ D1). Đo: `dieu-phoi\dau-vao\dau-phat-hang-d2\` (gốc = nhánh D1).

## Kết quả đo
- dump-ratings mọi tệp nguồn (2.991 tệp): giữ y 12.292 mục, **mất / đổi 0**, mới 2.977 (chỉ ở 23 tờ D1: Mecc Alte 1007–1016, Stamford 1021–1033). Đo trước khi thêm `meccSheetAttrs`; hàm đó không đổi `ratingsOf`.
- Mecc Alte: mọi dòng kVA trong 10 tờ đều đọc được; kW ≈ 0,8 kVA và thứ tự B ≤ F ≤ H ≤ Standby: 0 lỗi thứ tự, 3 ô kW lệch do chính nguồn (ECO40 3L4 C 50 Hz 580 ở 400 / 415 V; ECO43 2L4 A 60 Hz 1618), giữ số nguồn, không dùng.
- check-all 17 lượt chụp, 47 cấu hình: **đổi đúng 1 cấu hình**. IB2600603983 #6 TWD1744GE: ECO40 VL4C (750 kVA H 380 V × 0,96 ở 45 °C = 720 < 750) → LSA 49.3 M8 (820 × 0,973 = 797,9), 5 check chưa rõ thành đạt, 2 check đầu phát cũ bỏ.
- Test `suppliers/*.test.mjs`: 1.339 / 1.339. verify: 435 bản ghi, 0 lỗi (chạy trước lần sửa code cuối; dữ liệu không đổi sau đó).
- Sửa kỳ vọng 1 test có sẵn (`makerAlts IB2600603983`): danh sách thêm S6L1D-C4 / D4 xếp sau LSA vì tờ không ghi 300 % / 10 s.

## Đã làm
- Stamford S6 / S7: "chưa rõ, cần NCC xác nhận CO" (Khoa 21/11/2026); S4 / S5 giữ Trung Quốc.
- Mecc Alte: nơi SX mặc định Ý (`manufacturing[]`, Khoa chốt 16/11); hệ số suy giảm từ bảng trên chính tờ.
- Leroy-Somer: thêm nguồn [6004] "TAL Rating Table" (leroy-somer.com 5706_en.pdf).
- `makerAltFix` xét suy giảm khi quyết đầu phát NCC chào có dưới mức.

## Cần Khoa / điều phối quyết
1. **TAL-A40…A49**: bảng [6004] chỉ nêu "TAL 040 … TAL 049", không nêu TAL-A, nên TAL-A vẫn "chưa rõ". Có coi bảng này áp cho TAL-A không?
2. **Stamford S4 / S5**: đang ghi Trung Quốc (Khoa 20/11), mâu thuẫn [6003] "The Stamford facility manufactures the STAMFORD range, including the S4, S5, S6 and S7".

## Chưa làm
- Kích từ PMG của Mecc Alte: tờ ghi tuỳ chọn theo dải, chưa đọc, HSMT đòi PMG thì để "chưa rõ".
- Dải Mecc Alte đời cũ (ECO38 A, ECO40 B …) NCC hay chào: không có tờ nên không có định mức, đầu phát đó được giữ nguyên.
