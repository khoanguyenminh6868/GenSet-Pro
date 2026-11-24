# Chạy thử luật 2 nguồn trên 5 model động cơ (24/11/2026), CHỈ TÌM VÀ GHI

Phiên con của điều phối. Không sửa code / dữ liệu NCC / hồ sơ hãng. Mạng ra được qua WebSearch và Firecrawl (`curl` thẳng tới
`www.cummins.com` bị proxy 403, không dùng).

## Tóm tắt và kết luận

| Model | Trường thiếu | Kết quả | Mức nguồn |
|---|---|---|---|
| Yuchai YC6T660L-D20 | tỉ số nén | `15:1` (2 trang, nhưng không chứng minh độc lập) | CHỈ 1 nguồn (nghi chung một bảng brochure) |
| | nạp khí | "Turbo charging with inter-cooling" (cùng 2 trang) | CHỈ 1 nguồn (như trên) |
| MTU 18V2000G65 | tỉ số nén | `16 : 1` | bản hãng đăng lại (Scribd, tờ MTU) |
| | nạp khí | không có câu trích nguyên văn | KHÔNG XÁC ĐỊNH |
| Volvo Penta TAD531GE | tỉ số nén | `18:1` | HÃNG CÓ (pubs.volvopenta.com) |
| | nạp khí | "Turbo charger, centre low with exhaust flange" | HÃNG CÓ, chỉ ghi turbo (không ghi làm mát khí nạp) |
| Perkins 1104D-E44TAG2 | tỉ số nén | `16,2 : 1` | bản hãng đăng lại (Wintpower đăng tờ Perkins TPD1623E) |
| | nạp khí | "turbocharged, air to air charge cooled" | bản hãng đăng lại (cùng tờ) |
| Cummins QSK19-G5 | tỉ số nén | `15.0 : 1` chỉ ở trang CCEC | CHỈ 1 nguồn (CCEC là liên doanh Cummins, không tính độc lập) |
| | nạp khí | "4 cycle, turbocharged" + "Air-air charge cooled" | HÃNG CÓ (cummins.com) |

**Theo luật 2 nguồn (bước 3): 0 / 10 trường lấp được.** Hãng có hoặc bản hãng đăng lại (bước 1–2): 6 / 10. Chỉ 1 nguồn: 3 / 10.
Không xác định: 1 / 10. Không có trường nào hai nguồn lệch nhau.
Mất 9 lượt WebSearch (chưa tính 1 lượt thử mạng về Weichai WP10, không dùng) và 7 lượt Firecrawl scrape (khoảng 45 credit theo số công cụ báo).

**Đề nghị: KHÔNG làm phần code (PR1–PR4) lúc này.** Lý do:
1. Cả 5 model đều có tờ hãng hoặc bản hãng đăng lại cho phần lớn trường thiếu. Việc đáng làm là bước 1–2 (đưa tờ hãng 1001+ vào),
   không phải bước 3.
2. Trường hợp duy nhất đi vào bước 3 là Yuchai (hãng Trung Quốc không có tờ công khai tìm được). Hai trang tìm ra đều có vẻ chép
   một bảng của Yuchai, nên theo định nghĩa của bản thiết kế chỉ là MỘT nguồn.
3. Trang thứ hai "có vẻ độc lập" (CCEC) lại là liên doanh của hãng, thuộc loại bị loại.
Nếu Khoa vẫn muốn, nên thử thêm một lượt riêng cho các hãng Trung Quốc không có tờ hãng (Yuchai, SDEC, Weichai) trước khi viết code.

## 1. Cách chọn 5 model

Chạy `node suppliers/spec-standard.mjs --out <thư mục tạm>` ở `origin/main` hiện tại (6.282 doc động cơ). Đếm 5 trường (số xi
lanh, đường kính × hành trình, dung tích, tỉ số nén, kiểu nạp khí) có giá trị trong `fields`; lấy doc thiếu từ 2 trường trở lên (5.404
doc), xếp theo số NCC ghi (`suppliers.length`). Các doc đứng đầu đều thiếu đúng 2 trường: tỉ số nén và nạp khí.
Từ đầu danh sách, chọn mỗi hãng một model đứng đầu để trải trên 5 hãng:

| Thứ tự trong danh sách | Hãng | Model | Số NCC ghi |
|---|---|---|---|
| 1 | Yuchai | YC6T660L-D20 | 51 |
| 2 | MTU | 18V2000G65 | 41 |
| 9 | Volvo Penta | TAD531GE | 32 |
| 18 | Perkins | 1104D-E44TAG2 | 28 |
| 20 | Cummins | QSK19-G5 | 28 |

Ứng viên khác cùng nhóm (không chọn vì trùng hãng với model đã chọn): MTU 12V2000G65 (38), Yuchai YC4A100Z-D20 (36), MTU
12V2000G25 (34), Yuchai YC6C1320-D31 (34), MTU 12V4000G23 / 20V4000G23 (33), Volvo Penta TAD733GE (32), SDEC 6WTAA35-G31 (27).
Lưu ý: tôi chỉ xác minh trong dữ liệu rằng 5 model này thiếu tỉ số nén và nạp khí; chưa soát các trường còn lại.

## 2. Chi tiết nguồn

Ghi chú về cách trích: công cụ Firecrawl ở chế độ "directQuote" trả lại chữ rút từ trang, tôi chép lại nguyên như nhận được.
Nó có thể đã lược dòng / ô bảng, nên trước khi dùng thật cần `fetch-source.mjs` lưu trang và kiểm câu trích bằng `verify.mjs`.

### Yuchai YC6T660L-D20
- Bước 1, trang hãng: tìm `site:yuchai.com` ra 0 trang (kết quả toàn trang thứ ba). Không có tờ hãng tìm được.
- Nguồn A: https://www.dieselgeneratortech.com/diesel-engines/Yuchai-YC6T-series-engine-features-for-gensets.html (nhà lắp
  tổ máy Guangxi Dingbo). Trích: "Intake way | Turbo charging with inter-cooling", "Compressionratio | 15:1"; hàng model có
  "YC6T660L-D20". Bảng ghi dải model, `6-145 x 165`, `16.35` L cho cả dải.
- Nguồn B: https://www.semeruteknik.com/product/yuchai-yc6t-series-diesel-engine (cửa hàng thiết bị, Indonesia). Trích:
  "Intake way | Turbo-charging & inter-cooled", "Compression ratio | 15:1"; hàng model có "YC6T660L-D20".
- Độc lập? KHÔNG chứng minh được. Khung bảng giống nhau (cùng dòng "Vertical, in-line, water-cooled, four stroke", cùng thứ tự
  hàng, cùng 15:1 cho cả dải model): rất có thể cả hai chép một bảng của Yuchai. Danh sách model hai trang hơi khác (D21/D22/
  D20 so với D20/D21), nên không phải bản sao nguyên văn, nhưng vẫn coi là MỘT nguồn theo lỗi "hai trang cùng chép một bảng".
- Trang thứ ba có giá trị khác (14:1, 152×180) gắn nhầm model YC6T660-D31: bỏ, khác model.
- Kết luận: tỉ số nén và nạp khí = CHỈ 1 nguồn.

### MTU 18V2000G65
- Bước 1: không lấy được trang MTU (không tìm thấy tờ trên mtu-solutions.com cho model này trong kết quả).
- Nguồn: https://www.scribd.com/document/452525818/18V2000G65-technical-data-pdf, tờ "MTU Friedrichshafen GmbH ...
  Application group 3D3B" do người dùng Scribd tải lên. Trích: "Compression ratio\n\n16 : 1", kèm "35.82 Liter", "130 / 150 mm".
- Loại: bản hãng đăng lại (người tải lên không rõ). Một nguồn đủ cho bước 2, cần Khoa duyệt vì người đăng không phải hãng.
- Nạp khí: kết quả tìm kiếm nói tờ có "Number of turbo chargers 2" và 1 bộ làm mát, nhưng lượt scrape chỉ trả đoạn có tỉ số nén;
  chưa có câu trích nguyên văn nên ghi KHÔNG XÁC ĐỊNH.

### Volvo Penta TAD531GE
- Bước 1, HÃNG CÓ: https://pubs.volvopenta.com/publications//47709307 (kho tài liệu của hãng). Trích: "Compression ratio | 18:1";
  "No. of cylinders and configuration | in-line 4"; "Bore, mm (in.) | 108 (4.25)"; "Stroke, mm (in.) | 130 (5.12)";
  "– Turbo charger, centre low with exhaust flange"; "– Heater flange in charge air inlet".
- Nạp khí: tờ hãng chỉ ghi có turbo. KHÔNG ghi làm mát khí nạp, nên giá trị chuẩn chỉ có thể là `turbo`, không phải
  `turbo_aftercooled`. Không dùng suy luận từ tên model "TAD".
- Không cần 2 nguồn.

### Perkins 1104D-E44TAG2
- Bước 1: perkins.com trả trang cho 1104D-E44TA (model công nghiệp khác, 16.9:1 theo kết quả tìm, chưa đọc); không có trang
  đúng model TAG2 trong lượt này.
- Bước 2, bản hãng đăng lại: https://www.wintpower.com/uploads/1104D-E44TAG2.pdf (Wintpower, nhà phân phối). Tờ mang
  "TPD1623E-1" và "Perkins Engines Company Limited Peterborough PE1 5NA". Trích: "turbocharged, air to air charge cooled
  Compression ratio . ... 16,2 : 1 Bore... 105 mm Stroke ... 127 mm Cubic capacity... 4,4 litres".
- Kết luận: đủ cho cả hai trường theo bước 2. Đừng nhầm với 16.9:1 của E44TA (model khác).

### Cummins QSK19-G5
- Bước 1: https://www.cummins.com/sites/default/files/2019-06/QSK19G5.pdf, HÃNG CÓ nạp khí. Trích: "Type | 4 cycle,
  turbocharged"; "Cooling system design | Air-air charge cooled"; "Bore mm | 159 mm (6.25 in.)"; "Stroke mm | 159 mm (6.25
  in.)"; "Displacement litre | 19"; "Cylinder block | Cast iron, 6 cylinder". Tờ KHÔNG ghi tỉ số nén (không tìm thấy trong phần
  công cụ trả về; chưa soát cả 3 trang bằng mắt).
- Tỉ số nén bước 3: nguồn duy nhất đúng model là https://ccec-engine.com/qsk19-g5-g-drive-engine/ (Chongqing Cummins
  Engine). Trích: "Compression Ratio | 15.0 : 1". CCEC là liên doanh của Cummins nên theo thiết kế (đại lý / nhánh chính thức của
  hãng) không tính độc lập. Các trang khác (13.9:1, 15.5:1) là bộ piston / dòng QSK19 khác, khác model, bỏ.
- Kết luận: tỉ số nén CHỈ 1 nguồn (liên doanh hãng).

## 3. Tổng hợp

- Lấp được theo luật 2 nguồn: 0 / 10. Lấp được nhờ hãng / bản hãng đăng lại: 6 / 10 (Volvo 2, Perkins 2, Cummins nạp khí, MTU tỉ số
  nén).
- Mất 9 WebSearch (5 lượt đầu theo model, 4 lượt bổ sung) và 7 scrape (`curl` tới cummins.com lỗi proxy 403, không tính).
- Loại trang hữu ích: tờ hãng trên kho tài liệu hãng (Volvo), tờ hãng đăng lại bởi nhà phân phối (Perkins / Wintpower) hoặc Scribd
  (MTU). Trang nhà lắp tổ máy / cửa hàng bán chỉ thấy bảng chép lại (Yuchai), không đạt độc lập. Trang liên doanh (CCEC) loại.
  Không thấy trang phụ tùng / xưởng sửa có bảng tự đo cho model chính xác.
- Bẫy gặp: cùng mã model ở trang khác (YC6T660-D31 so với YC6T660L-D20); cùng dòng máy khác model (E44TA 16.9:1 so với E44TAG2
  16,2:1; QSK19 13.9 / 15.5); tờ hãng ghi "turbo" không ghi "aftercooled" thì không được nâng thành `turbo_aftercooled`.
- Hạn chế của lượt thử: chưa đọc từng trang bằng `fetch-source.mjs`; chọn mẫu thiên về hãng Tây có tờ hãng công khai, nên con số
  0/10 không đại diện cho Yuchai / SDEC / Weichai ở quy mô lớn.
