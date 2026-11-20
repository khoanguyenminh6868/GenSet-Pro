
## 2. Nhóm 2 — nhiên liệu "không rõ" và bảng chữ khí 0 bản ghi

### 2.1 Năm bảng "không rõ" (may-khi-1 mục 85; #958 để `fuel` rỗng)
{{G2A}}

| bảng | bản ghi | nguồn thật (mở nguồn lưu + trang sống khi cần) | top 30 (79e9b175) |
|---|--:|---|---|
| jianghao n104 b4 + b5 | 5 + 24 | `http://www.jhgensets.com/Products_detail/32.html`, tệp nguồn dòng 82 "Gas Electric Generator：" trước bảng 1, dòng 94 "Cummins, gas electric generator：" trước bảng 2, dòng 124 chú thích ① ngay dưới hai bảng: máy chạy khí thiên nhiên / khí đồng hành / biogas / khí rơm / khí than. Model "JHRQ-…". Cột "FuelCon. (L)" (lí do lần trước chấm "không rõ") vẫn mâu thuẫn chữ, nhưng câu ① nói thẳng về "the above generators" → **khí** | 2 lần / 2 gói (hạng 8, 27); `all` 813 |
| simpson n124 b15 | 10 | `http://www.simpsonpower.cn/en/chanpinDetail/870.aspx`, mở lại 20/11: tên trang "SIMPSON-GasGenerators", KHÔNG câu nào ghi nhiên liệu; menu trang có cả "Natural Gas Genset" và "Gasoline Genset", liên kết không cho biết trang 870 thuộc mục nào → **không rõ** (khí hay xăng). Động cơ ZS168FA, GX390, GX630, GX690… (nhiên liệu của chúng: không rõ theo nguồn này) | **25 lần / 24 lượt / 21 gói, hạng 1 ở 1 lượt**; `all` 552 |
| man-engines n104 b4 | 9 | `https://www.man.eu/engines/en/products/marine/auxiliary-motors/auxiliary-motors.html`, mở lại 20/11: trang nói chung "diesel and gas engines", KHÔNG ghi model nào là khí → **không rõ** từng dòng (E3262 / D2676…). Bản ghi không công suất (cột "Output kW 1) 50 Hz / 60 Hz" không đọc) | 0 / `all` 0 |
| kingway n117 b12 | 1 | trang biogas (URL ".../biogas-generator-set/...", đoạn "Biogas generator set is a power generation device that uses biogas as fuel…") nhưng sản phẩm tên "Double Membrane Biogas Storage Tank" (bể chứa), bảng KGD250B → **khí** nếu là tổ máy; bản ghi duy nhất là ĐẦU PHÁT "Kingway KAI250" | 0 / 0 |

Phát hiện ngoài phạm vi (ghi lại, không sửa): kingway n117 là bảng dọc một máy; động cơ "SC9D340D2" KHÔNG thành bản ghi, còn bản ghi đầu phát KAI250 mang cả `cyl=6; bore=114x144; disp=8.9` của động cơ (thông số phạm vi engine treo trên bản ghi đầu phát; `builder` lọc theo phạm vi nên có thể không hiện, chưa kiểm).

**Phương án**
| | làm gì | bản ghi | Gợi ý (kèm #963: gói diesel loại dòng có `fuel`) | rủi ro |
|---|---|---|---|---|
| A | giữ rỗng cả 5 | 0 | 0 | simpson tiếp tục lọt top 25 lần dù tên trang ghi "Gas" |
| **B (khuyến nghị)** | ngoại lệ cấp bảng, có trích nguồn: jianghao n104 (2 bảng) = khí; kingway n117 = khí; simpson / man để rỗng | 30 bản ghi có `fuel` khí (29 + 1) | jianghao ra khỏi gói diesel: −2 lần top / 2 gói, −813 `all`; kingway 0 | thấp: câu nguồn nói thẳng; danh sách, không phải luật |
| C | B + simpson loại khỏi gói diesel ("nghi không phải diesel") | B + 10 bản ghi cờ mới | thêm −25 lần top / 21 gói | trái "không suy ra": nguồn không ghi nhiên liệu; cần trường / cờ mới. Chỉ làm nếu Khoa chọn 4B |

### 2.2 164 bảng chữ khí / xăng, 0 bản ghi (`may-khi\phan-loai-ngoai-catalog.tsv`)
Ghép đủ 164 / 164 bảng với `cand.json` (chỉ số bảng) và đo lại trên main 389935b3: **cả 164 vẫn 0 bản ghi** → Gợi ý hôm nay KHÔNG bị ảnh hưởng. Lí do 0 bản ghi: 158 bảng không có note dòng (không mã động cơ / đầu phát, hoặc bảng dọc / bảng ngang theo cột model), 5 "dòng là cặp nhãn | giá trị", 1 "số vô lý". Phân lớp soát tay theo tiêu đề + cột + dòng mẫu + URL (đủ 164 dòng, tiêu đề cột nguyên văn + 2 dòng: `bang-day-du.tsv`, nhóm `2b`):

{{LIST2B}}

Ghi chú lớp: KTM gồm trang CHP / biogas / LPG / khí thiên nhiên (sevenpower 39 bảng đều có "NG consumption m³/kW.h" hoặc "Biogas consumption"); stemac (URL "GruposGeradoresGas", "Cons Nm3/h", động cơ "…N0/6"); superwatt n109 (Shenny, "Gas consumption（m³/h）"). KDC: man n1006 "Brochure Power Gas", volvo G17 "Fuel type | Natural gas", yanmar dual fuel tàu thuỷ, deutz G 2.2 / 2.9 "gas and gasoline engines". KR: kachai "Gasoline Standby Generator Range" nhưng ô là dải "Power（KW）: 1000KW" (không rõ máy xăng 1.000 kW, không suy ra), winco n1007 "GASEOUS-DIESEL-BOOKLET" lẫn hai loại, shunfeng n108 "生物质燃气系列柴油发电机组" (tên vừa khí sinh khối vừa "diesel", động cơ 8300DS 500–600 vòng/phút), zc n106 / n109 b10 bảng so sánh, powgen tin lắp đặt, younes rao bán tuabin / CAT khí đã qua sử dụng. 

Bảng #959 (việc C) SẼ đọc thành tổ máy: frs n107, teksan n104 / n106, vpower n101 / n102, zc n109 b11 / b12 (7 bảng, 239 dòng) — #959 chưa ghi nhiên liệu cho chúng.

Lịch sử HSMT (may-khi-3, 1.259 gói): khí 0 gói, xăng 32 gói → chỉ bảng XĂNG có thể có ích cho Gợi ý.

**Phương án**
| | làm gì | bản ghi | Gợi ý | rủi ro |
|---|---|---|---|---|
| **A (khuyến nghị)** | lưu phân loại này (tệp tsv ở sổ), không code | 0 | 0 | không |
| B | gắn nhiên liệu theo bảng (danh sách) ngay, để khi bảng được đọc (#959, việc D) bản ghi mang sẵn `fuel` | 0 hôm nay; 7 bảng #959 (239 dòng) có `fuel` khi #959 merge | 0 (#959 chưa nối Gợi ý) | thấp; nhưng làm trước khi có bản ghi là việc sớm |
| C | đọc 12 bảng tổ máy xăng (bison 3, endress, gordon n105, grupel 2, kena, kigerpower n2010, zc n109 b11 / b12, zc n110: 119 dòng) bằng danh sách kiểu `GENSET_TABLES`, `fuel` = xăng | ≈ 119 dòng; 2 bảng (zc n109 b11 / b12, 9 dòng) ĐÃ nằm trong `GENSET_TABLES` của #959 (chỉ thiếu `fuel`); 10 bảng còn lại là bảng model chạy ngang theo cột (bison 3, gordon, kena, zc n110) hoặc bảng nhãn một máy (endress, grupel 2, kigerpower): cần bộ đọc bảng dọc của việc D | chỉ khi tổ máy được nối Gợi ý (việc C PA2); phục vụ 32 gói xăng | trung bình: 10 / 12 bảng là dạng chưa có bộ đọc |
