# Nghiệm thu: Phân tích gói lớn IB2500441397 (lần 1, 20/11/2026) - DỪNG TRƯỚC KHI GỌI MODEL

Trạng thái: CHƯA chạy Phân tích (điều phối giữ dừng, chờ Khoa quyết vì ~1,2 triệu token trên gói tháng). Không PR, không sửa code. Dữ liệu đo: `genbid-work\phan-tich-lon\` (`work\analysis-IB2500441397\` = đầu ra `prep --test`, `sizes.md`, `sizes.mjs`, `sheets*.mjs`).

## Đường chạy (đọc mã, `genbid-sync.js`)
`prepOne("analysis", key)` (dòng ~1657): `ocrHsmt` (không còn gì để đọc) → `hsmtText` → `trimHsmt(full, "analysis")` → `compact` → ghép `input.md` (thông tin gói, TBMT nếu có, chữ HSMT, phần đã bỏ). Ngưỡng dòng ~1801: `input.length > 450000` → ghi tệp `AGENT` ("dữ liệu quá lớn cho một lần gọi"): không gọi một lần, giao agent đọc bằng Read. `GenBid-Bot.ps1 Invoke-Agent` + `suppliers/agent-read.mjs prep`: `input.md` chia phần ≤ `READ_MAX = 30000` ký tự, agent phải Read hết từng phần (guard kiểm trong log). Phân tích đang dùng gói tháng (`.genbid-ai-settings.json`: analysis = plan).

## Số đo (đo bằng `node genbid-sync.js prep --test`, không gọi model)
| Bước | Ký tự |
|---|---|
| hsmt-full (chữ HSMT trên web) | 4.544.060 (5.058.400 byte) |
| sau `trimHsmt` (KEEP analysis = II, III, V, VII) | 3.897.950, chỉ 7 mục bị bỏ (≈ 520.000 ký tự) |
| sau `compact` | 3.429.290 (3.849.278 byte); `input.md` 3.850.760 byte |
| số phần Read (≤ 30.000 ký tự) | ≥ 115 (ước tính = 3,43 triệu / 30.000, chưa chạy `splitForRead`) |

7 mục bị bỏ (đều là các "CHƯƠNG I/II/IV" trong tệp định mức): Chương I Máy và thiết bị thi công (129.728), Chương I Vận chuyển bốc dỡ (12.967), Chương II Lắp dựng cột điện (43.899), Chương IV Đường dây cáp điện (235.156), Chương I Lắp đặt máy biến áp (73.949), Chương II Lắp đặt máy biến điện áp... (104.501), Chương III Làm và lắp đặt đầu cáp (45.903).
Nguyên nhân `trimHsmt` không cắt được: các sheet định mức trong `.xlsx` có dòng "CHƯƠNG I/II/III..." nên `splitSections` coi như chương E-HSMT; chương "II, III" nằm trong `KEEP.analysis` giữ nguyên (DM203, TT 36-2022 mỗi sheet ≈ 823.000 ký tự). Gói không có TBMT trên web (`notice` rỗng: tên gói, chủ đầu tư "?"); phần đầu vào không có thông tin gói.
Vượt giới hạn: có (450.000 ký tự gấp 7,6 lần; ≈ 1,2 triệu token nếu Read hết, ước tính 1 token ≈ 3 ký tự tiếng Việt). Chưa chạy model nên chưa biết agent có hoàn thành trong ngữ cảnh không.

## Cỡ chữ theo tệp trong gói (42 tệp trong tệp nén; chữ hsmt trên web, ký tự gồm khoảng trắng)
Tổng ba nhóm: định mức / bảng kê (xlsx) **4.127.131** (1 tệp, 91 %); tiêu chuẩn kỹ thuật VTTB (.doc, 37 tệp) **324.519**; tờ trình / đề nghị (pdf, 3 tệp) **92.355**.
Bảng đủ 42 tệp (tên, ký tự, loại): `genbid-work\phan-tich-lon\sizes.md`. Nổi bật: `0.9 BANG KE XL - TCKT VTTB B - VAN TAO 2024 - 8.10.2025.xlsx` 4.127.131 (106 sheet); `0.4 1195 - TTR VTTB A-B CẤP...pdf` 57.915; `100. 102 Cách điện đường dây...doc` 35.299; `3. A FCO 22kV...doc` 25.919; `0.8 1407 - PDN-KTAT...pdf` 25.865; các .doc còn lại 2.941 - 21.913.
Trong `.xlsx` 106 sheet, lớn nhất: `DM203` 823.576 (định mức EVN 228/QĐ-EVN), `TT 36-2022` 823.361 (định mức TT36/2022/TT-BTC), `MA TONG` 561.956 (danh mục mã vật tư ERP), `DM TT05` 188.176, `4.1 VL-NC-M` 181.132, `DM K may theo TT13` 171.791... Danh sách đủ sheet: chạy `node sheets.mjs`.

## Ước lượng nếu thu hẹp (ĐỀ XUẤT, chưa làm, cần Khoa/điều phối duyệt)
Giữ: 3 tệp pdf (92.355) + 37 tệp .doc (324.519) + 7 sheet nhỏ của xlsx (37.849): `2.3 TCKT MAU - VTTB B CAP` (9.212, bảng chào chủng loại / xuất xứ / quy cách VTTB), `0. CÁC GÓI THẦU` (2.193, tên gói thầu và cơ cấu giá), `Thuyết minh` (1.774), `THUE MAY PHAT` (5.595), `THONG KE MAY PHAT` (4.875), `9. THUÊ MÁY PHÁT` (1.641), `0.3 VTTB HỘP CÁP` (1.154) + vài sheet nhỏ liên quan. Phần thuê máy phát điện (150 - 560 kVA) cần giữ vì đúng ngành của công ty.
Tổng giữ ≈ 454.700 ký tự trước `compact`; `compact` giảm khoảng 12 % ở lần đo này (3,90 → 3,43 triệu) → ≈ 400.000 ký tự (ước tính, KHÔNG đo): dưới ngưỡng 450.000 nhưng sát, cộng phần đầu `input.md` và "phần đã bỏ" có thể vượt; còn cần đo thật. Nếu dưới ngưỡng: một lần gọi, khoảng 130 - 150 nghìn token (ước tính), không qua đường agent 115 phần.
Bỏ: 99 sheet còn lại ≈ 4,09 triệu ký tự (99,1 % của xlsx): định mức xây lắp (`DM203`, `TT 36-2022`, `DM TT05`, `DM K may theo TT13`, `ĐM TT12`...), đơn giá vật liệu / nhân công (`4.1 VL-NC-M`, `ĐGVL`, `ĐƠN GIA T8-2022`), bảng khối lượng và chiết tính chi phí (`KLR`, `B_THCPVLC`...), danh mục mã ERP (`MA TONG`). Lý do coi là không có yêu cầu cần Phân tích: là hồ sơ dự toán / đơn giá của chủ đầu tư (nhiều ô `#REF!` / `#N/A`), không phải yêu cầu của hồ sơ mời thầu (năng lực nhà thầu, tiêu chuẩn đánh giá, yêu cầu kỹ thuật, điều kiện hợp đồng). CẢNH BÁO: đây là kết luận từ tên sheet và đầu mỗi sheet (đã mở đầu của 9 sheet lớn / liên quan để xem), chưa đọc từng sheet; một sheet nhỏ có điều kiện thanh toán hay bảo hành lẫn trong bảng chiết tính vẫn có thể bị bỏ.
Cách làm không sửa mã bot: hiện không có cách chọn tệp / sheet cho `prep`. Có thể (a) sửa `trimHsmt` / `prepOne` để bỏ sheet xlsx định mức khi phân tích (PR riêng, test theo tên sheet), hay (b) ghi một bản "hsmt" rút gọn lên web (đổi chữ web: không nên). Tôi nghiêng về (a).

## Còn lại để làm khi Khoa quyết
- Chạy thật một lần (đường nào), ghi thời gian, chi phí (`total_cost_usd` trong log stream-json; gói tháng không có sổ API), đối chiếu vài mục với chữ HSMT, lỗi nếu có.
- Phân tích hiện không biết tên gói / chủ đầu tư / giá: không có `notice` trên web cho IB2500441397.

## Quyết định (Khoa, 20/11/2026, qua điều phối)
VIỆC 2 (Phân tích thử IB2500441397) BỎ: không gọi model, không mở PR chọn sheet. Số đo ở trên giữ làm tham khảo. Ghi nhớ: `trimHsmt` không cắt được sheet xlsx định mức (dòng "CHƯƠNG I/II/III" bị coi là chương HSMT); gói chỉ có tệp nén lớn kiểu này sẽ bị gắn AGENT (> 450.000 ký tự).
