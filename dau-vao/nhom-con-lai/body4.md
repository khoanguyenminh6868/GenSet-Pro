
## 4. Nhóm 4 — huatai n111

{{G4}}

Tiêu đề cột đầy đủ (hai tầng): tầng 1 `| 组型号Type of set | 输出功率 Power of output (KW/KVA) | 额定电流Rated current (A) | 柴油机参数 Parameters of set | 机组尺寸及重量 Size and weight of machine set`; tầng 2 `| 型号 Type | 额定功率 power (KW) | 缸数及类型Numbers& Type of cylinder | 燃油消耗 (g/kw.h)Consumption of fuel(g/kw.h) | 机油容量 Oil capacity (L) | 长×宽×高 Length Width Height (MM) | 净重 Net Weight (kg)` (tầng 2 nằm dưới ô "柴油机参数" và "机组尺寸及重量").

**Mã đọc ra (17 / 17 dòng):** bản ghi động cơ WD129TAD23 … WD327TAD92, `power` RỖNG ở cả 17 (cột "输出功率 (KW/KVA)" ghi "135/320", "138/150", "140/165", "145/165" là đường kính / hành trình: 14 dòng không qua cặp kW/kVA, 3 dòng 700/800/850GF là ngoại lệ `nopower` Khoa 19/11), thông số `current` (362…1810), `weight`, `fuel` (198 / 196). KHÔNG đọc: "额定功率 power (KW)" = 259, 308, 340, 373, 388, 420, 460, 512, 530, 556, 618, 680, 750, 858, 902, 970, 1012 (nhãn không khớp mẫu `engPower` "(engine|gross).*(power|output)"; nới mẫu cho "额定功率" thì sai: 134 ô tiêu đề / 121 bảng trong cn dùng "额定功率" cho công suất TỔ MÁY), "6缸直列" / "12缸V型" (xi lanh), dầu bôi trơn, kích thước.

**Nguồn nói gì:** công suất động cơ = cột "额定功率" dưới "柴油机参数" (rõ). Công suất tổ máy: KHÔNG có cột đúng; tên "200GF … 1000GF". Kiểm chéo (không phải nguồn ghi): (i) 167 / 167 dòng "NNNGF" ở 11 bảng khác của huatai có kW đọc được = đúng số trong tên; (ii) dòng điện của bảng = kW tên ở 400 V, cosφ 0,8 (200GF: 362 A ↔ 200,6 kW … 1000GF: 1.810 A ↔ 1.003 kW, lệch ≤ 0,4%); (iii) công suất động cơ / số trong tên = 1,01–1,29.

**Gợi ý hôm nay:** 17 dòng không công suất → `near` loại → 0 lần trong `all` của mọi lượt (khoá huatai "WD…" duy nhất trong `all` là WD10D153E10 của bảng khác, 1 lần, 0 top). 17 khoá động cơ đều có ở 4–9 NCC khác (133 bản ghi), KHÔNG khoá nào có `engPower`.

| | làm gì | bản ghi | Gợi ý | rủi ro |
|---|---|---|---|---|
| A | để nguyên | 0 | 0 | thiếu công suất động cơ (đúng "thà thiếu") |
| **B (khuyến nghị)** | ngoại lệ CHỈ bảng này (khoá huatai + n111 + tiêu đề nguyên văn): ô "额定功率 power (KW)" thành `engPower` (và có thể "缸数及类型" → `cyl` 6L / 12V) | 17 bản ghi đổi: +`engPower` (+`cyl` nếu chọn) | dự kiến 0: `engPower` thuộc `ROW_ONLY` (không gộp theo khoá), chỉ thành sự kiện "engPrime/engStandby" khi nhãn ghi mức + công suất tổ máy của dòng có (`ratedFacts`); dòng không công suất nên không thành ứng viên. `cyl` THÌ gộp theo khoá (17 khoá đã có xi lanh ở 2–10 bản ghi khác) → phiếu số đông thêm 1: phải đo | thấp |
| C | B + công suất tổ máy = số trong tên "NNNGF" (mức: không ghi → `rated` / chưa rõ mức) | 17 bản ghi có công suất | CÓ: 17 dòng Wudong 200–1.000 kW thành ứng viên ở các gói cùng dải. Phải đo top 30 | trái quy tắc trong code ("only to keep a current, never as the set's power") và "không suy ra": số là suy từ tên + kiểm chéo, nguồn không ghi. Chỉ làm nếu Khoa duyệt rõ |
