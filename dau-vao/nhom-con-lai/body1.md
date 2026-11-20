
## 1. Nhóm 1 — eastern-lion "EL xxx" và "RUIFEN6120"

### 1.1 Nguồn thật nói gì
- Trang sống `https://easternlion.net/products/diesel-generator-set/engine-by-huachai-series/datasheet` (mở 20/11/2026, firecrawl `maxAge: 0`): dòng tiêu đề `| Model | Prime power (kW) | Prime power (kVA) | Standby power (kW) | Standby power (kVA) | Engine model | Engine power (kW) | Alternator model | Alternator power (kW) | Controller |`, dòng `| GF/GFS-HC18 | 13 | 16 | 14 | 18 | 2105D | 18.7 | EL 164D | 12.8 | RUIFEN6120 |`; phía trên bảng có nhãn "Controller RUIFEN6120". Trang danh mục (n114) có tiêu đề nhóm cột `| | Genset Specification 400/230V 50HZ | Engine | Brushless Alternator | Controller | Datasheet`.
- `EL` / `ELS`: n156 `https://easternlion.net/products/brushless-alternator/el-series/` "EL Series Brushless Alternator | EASTERNLION" liệt kê EL 164A… (cột 50Hz / 60Hz Output, SAE Size, Core Length). Hồ sơ NCC: `role: alternator_maker`, brand "EASTERNLION". ELS = bản 60 Hz (các trang "60HZ Engine By …"). **Kết luận: mã đầu phát của chính eastern-lion.** Quét toàn bộ cn: ô dạng `ELS? + 3 số` CHỈ có ở eastern-lion (1.192 ô, 0 ô ở NCC khác) → thêm vào `ALT_CODE` không đụng NCC khác.
- `RUIFEN6120`: 25 tệp nguồn ghi "Controller RUIFEN6120" (song song "Controller Smartgen 6120", "Controller Mebay 6120"). Là model bộ điều khiển; HÃNG của nó nguồn không ghi → **không rõ** (hồ sơ `controllers` hiện có Mebay, SmartGen HGM6120, không có RUIFEN). Bản ghi động cơ hiện đã mang `controller=RUIFEN6120` từ cột Controller.

### 1.2 Mã đọc ra gì (mọi bảng, `bang-day-du.tsv` cột nhóm 1 có tiêu đề cột nguyên văn + 2 dòng)
Ba dạng bảng: (a) trang danh mục, hai dòng tiêu đề như trên; (b) trang "…— Generator set specification sheet" (`/datasheet`), một dòng tiêu đề bắt đầu bằng ô rỗng `| | Model | Prime power (kW) | … | Controller`; (c) bảng tổng quan `| | | Power range | models | Engine | Alternator | Controller |`, dòng `| Engine By Cummins | 22 – 444 kW | 40 | 4BTA3.9-G2 | EL 274K | Smartgen 6120 | View details →`.

| lớp | bảng | dòng | hiện ra |
|---|--:|--:|---|
| đúng | 22 | 690 | động cơ + đầu phát EL đủ (bộ điều khiển "Smartgen 6120" không phải mã nên "EL" là mã DUY NHẤT sau động cơ → lấy làm đầu phát) |
| tổng quan (c) | 14 | 98 | 0 bản ghi, note "dòng tổng quan dòng máy" — đúng (lech-cot-11) |
| **thiếu đầu phát** | 15 | 294 | 268 động cơ, 0 đầu phát: "RUIFEN6120" là mã thứ hai sau động cơ nên luật "một mã sau động cơ" không chọn; 26 dòng ô động cơ chữ Hán ("4105ZD(小泵）", "D114系列WLD171") để trống động cơ (catalog-b) |
| **sai vai** | 3 | 68 | n147 (22 dòng): ô động cơ "D114系列WLD171" không là mã, bảng dạng (b) lệch một ô nên chốt `engCol` của catalog-b không bắt → **22 bản ghi động cơ "EL 274F"…"EL 404E"** (`engPower` = 128… thật ra là kW đầu phát); n149 (3 dòng "EL 274H/J/K") và n126 (1 dòng "EL 224E", ô động cơ "4105ZD(小泵）") cũng thế → **26 bản ghi động cơ sai vai**; cùng các dòng đó "RUIFEN6120" thành **4 bản ghi ĐẦU PHÁT** sai vai |
| bảng đầu phát chính hãng | 1 | 49 | n156: 0 bản ghi (chưa có đường đọc bảng của hãng đầu phát; chỉ động cơ có) |

Danh sách đủ: {{LIST1}}

Gợi ý hôm nay (đo cloud 79e9b175): eastern-lion lọt top 677 lần; **40 lần ở 32 lượt / 32 gói là dòng thiếu đầu phát** (khoá `…|<động cơ>||…`, cả 40 có RUIFEN); dòng loại này nằm trong ứng viên `all` 11.200 lần / 648 lượt. Động cơ "EL…" sai vai: 0 lần top, 972 lần `all` / 370 lượt. RUIFEN làm đầu phát: 0 top, 200 `all`.

### 1.3 Phương án
| | làm gì | bản ghi (ước tính theo dòng; số thật đo bằng spec-diff khi có code) | Gợi ý cấu hình | rủi ro |
|---|---|---|---|---|
| **A (khuyến nghị)** | thêm `ELS?\s?\d{3}[A-Z]{0,2}` vào `ALT_CODE` (dòng 44) | +362 liên kết / bản ghi đầu phát EL (294 + 68), −26 động cơ sai vai, −4 đầu phát RUIFEN sai vai; 22 bảng đúng và 14 bảng tổng quan không đổi | có: 32 lượt / 32 gói đang có dòng eastern-lion thiếu đầu phát trong top → `u.other` có giá trị → `choiceKey` (gộp trùng theo đầu phát), luật nơi sản xuất đầu phát, `check` đầu phát đổi được; 648 lượt có dòng như vậy trong `all`. Phải đo top 30 cloud | thấp: mẫu chỉ khớp ô eastern-lion; n147 / n126 / n149 dòng ô động cơ chữ Hán vẫn KHÔNG có động cơ (đúng "thà thiếu") |
| B | như A nhưng chỉ bảng trong danh sách (khoá NCC + n) | như A | như A | nhiều mã hơn A cho cùng kết quả; danh sách phải theo nguồn cào lại |
| C | để nguyên | 0 | 0 | 26 động cơ "EL…" + 4 đầu phát "RUIFEN6120" sai vai ở lại; 294 dòng thiếu đầu phát |

Câu 2 (n156): cần đường đọc mới "bảng của hãng đầu phát: ô đầu là model, công suất 50 / 60 Hz" (hiện chỉ có cho hãng động cơ). +48 bản ghi đầu phát có công suất riêng; ảnh hưởng `check` / `altKva` của cấu hình eastern-lion (677 lần top dùng đầu phát EL). Đề xuất để sau A, việc riêng.
