# Giải thích khác biệt top 30 (gốc d61d6c96 ↔ A #1077 ↔ B #1078)
Khoá dòng = NCC | mã động cơ | đầu phát | băm dòng. "Mất / thêm" tính trên `all` (mọi ứng viên), "lượt" = lượt (gói#cỡ) bị đổi.

## A — PR #1077 (5558ff92): 77 lượt khác gốc, top đổi ở 8 lượt, 0 dòng thêm
Chỉ hai mã Yanmar 4TNV98C-IYE / 4TNV98CT-IYE (dòng "Model | <mã>" của endress được đọc dung tích cc, thành khoá `disp` cho động cơ):
- ĐỔI ĐIỂM 4TNV98CIYE: 52 dòng-lượt, 51 lượt, NCC cgm-italia, voltgent. Cả 52 dòng đều +8.
- ĐỔI ĐIỂM 4TNV98CTIYE: 23 dòng-lượt, 20 lượt, NCC cgm-italia, stephill, voltgent. Cả 23 dòng đều +8.
- MẤT 4TNV98CTIYE: 8 dòng-lượt, 7 lượt, NCC cgm-italia, stephill, voltgent (ví dụ IB2200012854#0).
- MẤT 4TNV98CIYE: 6 dòng-lượt, 6 lượt, NCC voltgent (ví dụ IB2200016981#1).
- THÊM: không có.
Thành phần điểm (ví dụ IB2200004566#0, voltgent|4TNV98CIYE): gốc 162 → A 170. `why` giống hệt ("NCC có hồ sơ bộ điều khiển ...", "bộ điều khiển có datasheet hãng").
  Khoản đổi: `8 × min(số khoá thông số của động cơ, 8)`: gốc `eKeys` = [] (0 khoá) → A `eKeys` = [disp] (1 khoá) = +8.
  Ví dụ khác IB2300010931#0 (voltgent|4TNV98CTIYE): 158 → 166, cùng khoản.
Thành phần mất (IB2200012854#0: hint minDisp 4.5; IB2200016981#1: hint minDisp 3.769): A đọc dung tích 3319 cc = 3,319 L < minDisp → `ruled: disp` (−600) nên dòng rời `all` vào `dropped`; gốc không có dung tích nên không bị loại.
  Vậy dòng nào còn lại thì +8, dòng nào HSMT đòi dung tích lớn hơn 3,319 L thì mất.
Số lượt `dropped` đổi: 11. `rowflag` không đổi (0 lượt).

## B — PR #1078 (ec8d2cf2): 70 lượt khác gốc, top KHÔNG đổi (0 lượt), 0 dòng mất, 0 đổi điểm
- THÊM SC9D340D2: 67 dòng-lượt, 67 lượt, NCC kingway-power (ví dụ IB2200022333#0): bản ghi động cơ mới từ bảng "Model | SC9D340D2" gắn tổ máy Kingway KAI250.
  Điểm của dòng thêm (ví dụ IB2200022333#0, kingway-power|SC9D340D2|KINGWAYKAI250): 447.
  Thành phần có nhãn trong `why`: +200 "có bộ điều khiển hãng HSMT nêu", +40 "bộ điều khiển có datasheet hãng", + `8 × min(7 khoá, 8)` = 56 (khoá bore, compr, cyl, disp, emission, gov, oil); 296 tổng; 151 điểm còn lại là khoản không ghi nhãn (không tách thêm).
- MẤT / ĐỔI ĐIỂM: không có.
- 3 lượt khác thêm (70 − 67) chỉ đổi số `dropped` (dòng kingway mới bị luật loại, không vào `all`); `rowflag` không đổi.

## Ghi chú
- Mọi con số đo trên CÙNG bidhist (tải 2026-11-22T00:44:48Z), 435 NCC; `suppliers/cn` của A và B không khác gốc (hai PR chỉ sửa `web/catalog.js`, test, `web/CLAUDE.md`).
- Thành phần điểm lấy bằng chạy lại `candidates` cho một lượt ví dụ; không in chữ HSMT.
