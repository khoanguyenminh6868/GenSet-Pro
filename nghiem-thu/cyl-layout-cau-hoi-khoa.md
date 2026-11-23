# Câu hỏi cho Khoa: luật "≥ 2 NCC ghi ngược thì giữ dòng" (#1073)

**Vấn đề.** Luật Khoa duyệt 22/11 cứu được dòng ghi sai, nhưng cũng giữ cả dòng ghi đúng khi có 2 NCC khác ghi sai.

**Ví dụ DP180LB.** 6 NCC ghi chữ V (có hd-hyundai-infracore), 2 NCC ghi thẳng hàng (jianghao-genset, legapower). Gói đòi thẳng hàng: dòng "10V" của wintpower lẽ ra bị loại, nhưng luật hiện tại giữ vì "có 2 NCC khác ghi thẳng hàng".

| Phương án | Giữ dòng khi | Dòng được giữ | Khác hiện tại |
|---|---|---:|---|
| A. Như hiện tại | ≥ 2 NCC khác ghi ngược ô của dòng | 230 | |
| B. Đề xuất | như A, và phía ghi ngược ĐÔNG HƠN phía của dòng | 84 | 146 dòng trên 15 động cơ trở lại bị loại khi HSMT đòi kiểu ngược |

**Đề xuất: B.** Mọi ca Khoa đã nêu vẫn được giữ: liangzi "12L" cho KTA38 (1 NCC so với 6–10), longkai "V12" cho QSK19 (1 so với 2–5).

**15 động cơ đổi** (số NCC phía dòng / số NCC ghi ngược): 4008TAG1A 6/2, 4008TAG2A 5/2, DP158LC 7/2, DP158LD 7/2, DP180LA 6/2, DP180LB 6/2, DP222LA 4/2, DP222LB 6/2, DP222LC 7/2, P158LE 7/2, P158LE-1 4/3, SC25G610D2 8/2, SC25G690D2 9/2, SC27G755D2 8/2, SC27G830D2 9/2.

**Ca sát nhất:** P158LE-1, 4 NCC ghi V, 3 NCC ghi thẳng hàng. Chưa đối chiếu tờ hãng.

**Giới hạn của số.** Đây là đếm tĩnh trên catalog ở `2a7636f6` (dòng có ô bố trí mà ≥ 2 NCC khác ghi ngược), không phải số dòng đổi trong top 30. B chưa viết vào code. Danh sách đủ 146 dòng: `cyl-layout-146-dong.tsv`.

**Khoa quyết 23/11/2026: chọn B.** Đã vào code ở #1073, đầu nhánh `958d51ec`.
