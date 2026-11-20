
## 3. Nhóm 3 — 29 bảng đầu phát / động cơ rời (catalog-c-de-xuat lớp A / E)

Chỉ số bảng của `dem-g.mjs` (main abb28c67) vẫn trỏ đúng 29 bảng trên 389935b3 (tên trang khớp). Cả 29: **0 bản ghi** (đường đọc chỉ ra bản ghi khi dòng có mã tổ máy + mã động cơ / đầu phát, hoặc bảng của hãng động cơ). 798 dòng thô.

{{G3}}

### 3.1 Đếm khoá (CAT.keyOf thật, so với mọi bản ghi động cơ / đầu phát của main)
- **A (20 bảng, 599 dòng, 514 model):** 149 model đã có khoá đầu phát trong catalog; 62 trong đó do NCC KHÁC ghi. Trùng là dòng "STC-5…STC-30" / "ST-2…" (tên dòng đầu phát chổi than dùng chung ở nhiều xưởng: eastern-lion, gordon, keliang, landtop, shengfeng, xinhengxin, yingtai), còn "JET164…" (47) và "LK184…" (40) là khoá do chính jet-power / longkai ghi ở bảng tổ máy. 365 model chưa có khoá (dòng: nenjo HJI 2 bảng 92, shengfeng TFW2 2 bảng 70, yingtai YTW 45, xinhengxin XHX 42, lanzhou TZH 15…; nenjo / shengfeng là cùng bảng hai lần).
- **E (9 bảng, 199 dòng, 196 model):** 134 model đã có khoá động cơ (do NCC khác ghi, 3.416 lượt dùng không tính trùng n101 / n2003). Catalog CHƯA có cho các khoá đó: yingtai Cummins (52 khoá, 2.058 lượt dùng) thiếu dung tích ở 10 khoá, số xi lanh 5, đường kính × hành trình 12; rise SDEC 20 khoá đã đủ mọi loại; penlucky tàu thuỷ 9 khoá thiếu đường kính 4; zhengdian ZS195 thiếu cả ba. Model mới: kangjin 10 (động cơ công trình 2.200 vòng/phút), penlucky n116 3, zhengdian (ô đầu lặp "ZS195 | 单机（世纪型）": 39 "model" thực ra là biến thể chữ Hán).

### 3.2 Phương án
| | làm gì | bản ghi | Gợi ý cấu hình | rủi ro |
|---|---|---|---|---|
| **A** | để nguyên | 0 | 0 | không (thiếu, không sai) |
| B | danh sách tường minh (như `GENSET_TABLES`) cho cả 29: đầu phát rời (công suất 50 / 60 Hz riêng của đầu phát) + động cơ rời (công suất động cơ, xi lanh, dung tích…) | ≈ +599 dòng đầu phát (514 model), +199 dòng động cơ (196 model) | có: (i) đầu phát: `altKva` / `check` công suất đầu phát cho cấu hình jet (47 khoá), longkai (40) và mọi cấu hình dùng "STC-…" của 6 NCC; (ii) động cơ: bản ghi bảng động cơ không công suất tổ máy nên KHÔNG thành ứng viên, nhưng thông số gộp theo khoá đổi: +8 điểm / loại thông số mới, phiếu số đông dung tích / xi lanh (`dispVoters`, `cylMaj`) và luật dung tích / xi lanh tối thiểu cho các dòng dùng 134 khoá. Phải đo top 30 | CAO: STC / ST gộp đầu phát khác xưởng vào một khoá; kangjin (máy công trình, 2.200 vòng/phút) và penlucky (máy tàu) đưa công suất / thông số không phải phát điện vào khoá chung; zhengdian ô model chữ Hán |
| **C (khuyến nghị)** | chỉ yingtai n101 + n2003 (cùng dữ liệu Trung / Anh, cột "品牌 Brand / 发动机型号 Engine Type / 功率(主用) / 功率(备用) / 缸数 / 缸径*行程 / 排气量…") làm nguồn thông số ĐỘNG CƠ, không công suất tổ máy | ≈ 57 dòng / 56 model (52 khoá đã có) | có: thêm dung tích cho 10 khoá Cummins, xi lanh 5, đường kính 12 → đổi điểm / luật dung tích của các dòng dùng 52 khoá (2.058 lượt dùng). Phải đo top 30 cloud, soát mọi lượt đổi | trung bình: bảng yingtai từng lệch cột (tiêu đề hai tầng ở catalog-c); phải soát từng số với dòng nguồn (và so với số NCC khác cho cùng khoá trước khi nhận) |

Ghi chú: phần đầu phát (A) chỉ có ích khi `check` / `altKva` cần công suất đầu phát; hiện không có yêu cầu nào chờ nó → để sau.
