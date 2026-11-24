# Luật "2 nguồn internet" — danh sách (24/11/2026) — DỞ DANG, DỪNG VÌ LUẬT CONTEXT 30 %

Máy đọc được: `dau-vao\hai-nguon-internet\danh-sach.json`. Phiên chỉ đọc repo, không sửa, không PR.

## Kết quả
- Model / trường ĐỦ 2 nguồn độc lập: **0**.
- Chưa đủ: **HGM9320** (mọi trường tìm được) — mọi trang là bản chép của MỘT tài liệu hãng SmartGen.

## HGM9320
- smartgen-america.com (nhà phân phối SmartGen Mỹ), ats4pro.com, presertec.cl: cùng chữ y hệt bảng "Technical Parameters" của brochure hãng (DC(8-35)V; 237*172*45; cắt panel 214*160; (-25~+70)℃; màn 4.3" TFT 480*272; RS485 / USB; RTC & Event Log; Scheduled Start). Tính là MỘT nguồn.
- doc.diytrade.com/…/1433217562.pdf = "HGM9200-HGM9300-HGM9400 INSTRUCTION V-1.0 en", 74 trang: manual của SmartGen do đại lý đăng lại, tải không cần đăng nhập → thuộc "tờ hãng", không thuộc luật này. Chưa trích được câu (truy vấn Firecrawl "query generation failed").
- Hệ quả: HGM9320 nên xử lý như "có tờ hãng qua bản đăng lại" (manual + brochure), cần Khoa/điều phối quyết có coi bản đại lý đăng lại là tờ hãng hay không; không phải việc của luật 2 nguồn.
- Câu trích đầy đủ nằm trong JSON (smartgen-america đã đọc; ats4pro, presertec mới thấy đoạn trích kết quả tìm kiếm).

## Bẫy gặp
- Trang đại lý / bán hàng chép nguyên bảng thông số của hãng: ba URL khác domain vẫn là một nguồn.
- presertec.cl: tải trực tiếp bằng curl trả trang 404 (HTML) dù tìm kiếm thấy; diytrade không trả header cho curl.
- Firecrawl quét PDF 74 trang tốn 78 credit và truy vấn trích lỗi; đừng quét cả PDF lớn, tải bằng curl + pdftotext.
- Kết quả firecrawl_search có thể trả cả trang chủ dạng base64 rất dài (smartgen.cn): đặt `limit` nhỏ, `includeDomains`.

## Chưa làm
HGM9520, 9220/9210, 9410, 9500, 6100CAN; SICES GC310/350/500Plus; toàn bộ đầu phát Stamford (LVI634B–G, PI734, UCI274J/K, 164/184, P126TI, P086TI, LVSI804).
Gợi ý phiên sau: với mỗi model, tìm nguồn KHÔNG phải bản chép của hãng (diễn đàn kỹ thuật, nhà tích hợp tự viết, tài liệu thứ ba tự đo), kiểm hai nguồn không chung văn bản; dùng curl + pdftotext để tiết kiệm context.

## Đề xuất lưu vào hồ sơ (để verify.mjs kiểm được)
Mỗi giá trị loại này là một mục `evidence: [{url, quote}, {url, quote}]` (đúng 2 phần tử, domain khác nhau) kèm `basis: "2-nguon-internet"`. `verify.mjs` kiểm: (1) hai domain khác nhau, (2) mỗi `quote` có mặt nguyên văn trong bản lưu của trang (lưu bản chụp text vào `genbid-work` kèm hash), (3) cả hai quote chứa cùng giá trị sau chuẩn hoá `sameValue`, (4) hai bản chụp không trùng quá ngưỡng (phát hiện bản chép). Web hiện dấu "2 nguồn internet".

## Lượt 2 (24/11/2026) — tìm tờ hãng do nơi khác đăng lại (DỪNG VÌ LUẬT CONTEXT; chưa làm hết)
Tệp tải về (dữ liệu không tin cậy, chưa chạy): `genbid-work\repost-datasheets\<hãng>\` (PDF + .txt đã pdftotext). Chưa thử trang hãng lại ở lượt này (phiên trước và nguồn đã biết đều xác nhận trang hãng không có tờ cho các model này; smartgen.cn trả trang chủ).

### (a) Có tờ hãng đăng lại
- **HGM9320**: manual SmartGen "HGM93XX MPU(CAN) Series Genset Controller USER MANUAL", 74 trang, dòng nguyên văn "This manual is suitable for HGM9310MPU, HGM9320MPU, HGM9310CAN and HGM9320CAN series controller only." (trang 1, tên hãng "Smartgen Technology"). Trang đăng lại: doc.diytrade.com (đại lý). Tệp: `smartgen\hgm9200-9300-9400-manual.pdf`. Có "DC(8~35)V" (mục 289 trong .txt), "Waterproof security level IP55".
- **HGM9520**: "HGM9520 Genset Parallel (With Mains) Unit USER MANUAL / Smartgen Technology", 70 trang, bản 2013-04-18 V1.0. URL đăng lại: https://www.smartgen-america.com/upload/iblock/a67/ole4znst01skzw0v3w5x2avg32fdtjj7.pdf (nhà phân phối SmartGen Mỹ). Tệp `smartgen\hgm9520-manual.pdf`. Bản khác (diytrade, 69 trang): `smartgen\diytrade-1433228779.pdf`.
- **HGM6100CAN** (HGM6110CAN/6120CAN thuộc HGM6100N Series): "HGM6100N SERIES (HGM6110N/6120N/6110NC/6120NC/6110CAN/6120CAN) GENSET CONTROLLER USER MANUAL", 45 trang: https://smartgen-america.com/upload/iblock/a4f/89jxwd5xgwq37f0e6esthm0ftdwzzbr8.pdf → `smartgen\hgm6100n-manual-b.pdf`. Bản ngắn 11 trang smartgen.mx → `hgm6100n-manual.pdf`. Lưu ý: tờ ghi 6110CAN/6120CAN, KHÔNG chắc có chữ "6100CAN" — điều phối cần xác nhận model.
- **HGM9500 (có thể là HGM9510)**: tìm thấy 9510: https://smartgen.mx/wp-content/uploads/HGM9510_V1.2_en.pdf (chỉ 6 trang, trích) và diytrade 64 trang → `smartgen\diytrade-1433228831.pdf`. Điều phối cần xác nhận "9500" là 9510 hay 9520.
- **SICES GC310 / GC350 / GC500Plus**: brochure hãng SICES "SICES Srl provides a wide range of smart genset controllers…", 12 trang, có mục "Models of genset controllers: GC315 / GC310 / GC350" và "GC500Plus / DST4602". Đăng lại ở tradekey (người bán): https://imgusr.tradekey.com/images/uploadedimages/brochures/1/9/3173688-201403310650195339102b7592a.pdf → `sices\sices-brochure-tradekey.pdf`. CHƯA kiểm có bảng thông số theo trường hay chỉ giới thiệu. Còn ứng viên chưa tải: yumpu "GC310, GC350 and GC500 Technical Handbook" (ScanDiesel), manualslib "Sices GC310 Use And Maintenance Manual".
- **Stamford UCI274**: tờ hãng (Newage Stamford) đăng lại: raad-eng.com/techdata/stamford/uci274e.pdf và uci274h.pdf (chỉ E, H — KHÔNG phải J/K) → `stamford\r-uci274e.pdf`, `r-uci274h.pdf`. Với J: baifapower.com/static/upload/download/FDJ/UCDI274J-14.pdf ("UCDI274J - Winding 14 Technical Data Sheet", "Stamford industrial generators meet the requirements of…", 8 trang) → `stamford\baifa-UCDI274J-14.pdf`. Chú ý tên UCDI274J ≠ UCI274J, cần điều phối xác nhận có cùng dòng. UCI274K: chỉ thấy slideshare "Uci274 k", pdfcoffee "UCDI274K"; mahniroo.com trả 403 → bỏ.
- **PI734C**: có sẵn TRÊN TRANG HÃNG https://www.stamford-avk.com/sites/stamfordavk/files/PI7C-312-TD-EN_Rev_A.pdf (không cần luật này).
- **P126TI**: chỉ thấy catalogue máy phát Doosan (fdkenergy D240-H1-Doosan-P126TI.pdf) — là tài liệu của đại lý/nhà máy lắp ráp, không phải tờ hãng Doosan/Stamford → đã tải `stamford\fdk-D240-H1-P126TI.pdf` nhưng KHÔNG tính (a).

### (b) Đủ 2 nguồn độc lập: không có.

### (c) Không có gì / chưa tìm
- SmartGen **HGM9210, HGM9220, HGM9410**: tìm 3 lần, không thấy manual riêng (chỉ các manual 9310/9320/9510/9520/9610 nhắc tên trong ghi chú "features may change"). Bản 96XX amz9200.pdf (images-na.ssl-images-amazon.com, 100 trang) không phải model cần.
- Stamford **LVI634B–G, LVSI804** (chỉ thấy manual P80 LVSI804X của genpowerusa — là manual lắp đặt, không phải datasheet), **P086TI**, **164/184** (tên chưa rõ dòng nào), **PI734 B/D–F**, UCI274G/K, P126TI: chưa tìm thấy datasheet hãng đăng lại. raad-eng.com/techdata/stamford/<model>.pdf trả 404 cho lvi634*, pi734*, uci274g/j/k, lvsi804.

### Việc chưa làm
Kiểm bảng thông số SICES brochure; tải yumpu/manualslib SICES; tìm riêng LVI634B–G, LVSI804, P086TI, 164/184, UCI274K, PI734 (các nơi như generator-info.com, genpowerusa.com, baifapower.com, pdfcoffee có thể có); tìm thêm HGM9210/9220/9410. Số model: (a) ≈ 8 (9320, 9520, 6100CAN*, 9500/9510*, GC310/350/500Plus*, UCI274E/H/J*, PI734C trang hãng) ; (b) 0 ; (c) ≈ 9210/9220/9410 + phần lớn Stamford. (* = cần xác nhận)

### Danh sách (a) cho maker-datasheets.mjs (URL + model)
| model | URL |
|---|---|
| HGM9320 | https://doc.diytrade.com/docdvr/1306637/43602887/1433217562.pdf |
| HGM9520 | https://www.smartgen-america.com/upload/iblock/a67/ole4znst01skzw0v3w5x2avg32fdtjj7.pdf |
| HGM6100CAN | https://smartgen-america.com/upload/iblock/a4f/89jxwd5xgwq37f0e6esthm0ftdwzzbr8.pdf |
| HGM9510 | https://doc.diytrade.com/docdvr/1306637/43604110/1433228831.pdf |
| SICES GC310/GC350/GC500Plus | https://imgusr.tradekey.com/images/uploadedimages/brochures/1/9/3173688-201403310650195339102b7592a.pdf |
| UCI274E | https://www.raad-eng.com/techdata/stamford/uci274e.pdf |
| UCI274H | https://www.raad-eng.com/techdata/stamford/uci274h.pdf |
| UCDI274J (winding 14) | https://www.baifapower.com/static/upload/download/FDJ/UCDI274J-14.pdf |

## Lượt 3 (24/11/2026) — DỪNG VÌ LUẬT CONTEXT; làm xong nhóm 1 và một phần nhóm 2
Tệp tải: `genbid-work\repost-datasheets\sices\` (dl.html, dl2.html = trang tải sices.eu; torcal.pdf hỏng; b.txt cũ).

### Nhóm 1 — SICES GC310 / GC350 / GC500Plus
- (a) brochure tradekey (12 trang, `sices\sices-brochure-tradekey.pdf` + `.txt`) CÓ bảng so sánh theo model (dòng 121–230 của .txt): kích thước "247x187x70" (GC310, GC350, GC500Plus), màn hình 128x64, cổng J1939/MTU CAN, RS232 + RS485 Modbus RTU, USB, DI 8+3 (GC310) / 18+3 (GC350, GC500Plus), DO 8 / 16 / 16. Bảng KHÔNG có nguồn DC, không có IP mặt trước. Dòng nguyên văn có tên hãng + model: "Models of genset controllers: GC315 / GC310 / GC350" và "Models of genset controllers: GC500Plus / DST4602" (tên hãng "SICES Srl" nằm ở đầu tài liệu). → dùng được cho kích thước / cổng truyền thông; thiếu nguồn DC, IP.
- sices.eu: trang tải (https://sices.eu/en/downloads/) bảo "No registration is required to download datasheets" nhưng liên kết tải là WordPress download-manager dựng bằng JS; URL đoán (/download/gc310-datasheet/, /en/products/genset-controllers/…) đều 404 — KHÔNG đoán thêm. Chưa tìm được URL tệp datasheet thật.
- meccalte.com: chỉ thấy User's Manual REWIND II (https://www.meccalte.com/downloads/REWIND3_User_Manual___EAAM069702EN_MA.pdf, có câu "MAIN Positive input main supply (8...32 Vdc)" — là của mô-đun Rewind, KHÔNG phải GC) và SS3 User manual (…SS3_User_Manual___EAAM078400EN_MA.pdf, phần mềm giám sát, nhắc GC310/GC350/GC500). Không phải tờ thông số GC → chưa đạt (a) cho nguồn DC / IP.
- Nơi chưa tải: scribd "HT GC310/GC350/GC500 User Manual" (scribd: bỏ, cần đăng nhập để tải), yumpu, manualslib.
- Kết luận: GC310/GC350/GC500Plus = (a) một phần (kích thước, cổng, I/O); nguồn DC + IP còn thiếu (chưa thử luật 2 nguồn).

### Nhóm 2 — SmartGen
- "HGM9500" trong `suppliers/cn/smartgen.json` (dòng 8125–8133, nguồn 1003) KHÔNG phải model: câu nguồn là "NOTE: Please refer to HGM9500 Synchronization Plan List for more information on GOV and AVR settings." (tên họ trong manual 9510/9520). → loại bỏ khỏi danh sách model cần tờ; model thật là HGM9510 và HGM9520 (đã có ở (a) lượt 2).
- HGM9210 / 9220 / 9410: manual riêng vẫn không thấy (tìm lại 1 lần). Có bảng "2 MODULES COMPARISON" trong tờ HGM9510 V1.2 (https://smartgen.mx/wp-content/uploads/HGM9510_V1.2_en.pdf, SmartGen, nhà phân phối smartgen.mx): cột HGM9210 | 9220 | 9410…, hàng LCD, RS485 (9410 ●, 9210 trống), J1939 (9410 ●), USB (9210, 9220, 9410 ●) — dùng cho cổng truyền thông (tờ hãng đăng lại, có tên hãng "SMARTGEN (ZHENGZHOU) TECHNOLOGY CO.,LTD."). Chưa có nguồn DC, kích thước, IP của ba model này.
- Ứng viên chưa tải: https://www.smartgen-america.com/upload/iblock/0c9/zhr01df3en0stwmaivrnra99eacdr28m.pdf (kết quả tìm "USER MANUAL" có bảng tham số, chưa rõ model) — cần kiểm.

### Nhóm 3, 4 — CHƯA LÀM (Stamford LVI634B–G, LVSI804, P086TI, 164/184, UCI274G/J/K, PI734 B/D/E/F; luật 2 nguồn)

### Số model lượt 3
(a) mới/nâng: GC310, GC350, GC500Plus (một phần) = 3; HGM9210/9220/9410 (một phần, chỉ bảng so sánh cổng) = 3; (b) 0; (c) HGM9500 = không phải model (loại).

## Lượt 4 (24/11/2026) — phát hiện chính: TRANG HÃNG CÓ tờ cho nhiều model "thiếu" (DỪNG vì context)
Danh sách tờ chính thức: https://www.stamford-avk.com/downloads/data-sheets (125 trang, `?page=0..124`). Đã quét hết, lưu `genbid-work\repost-datasheets\stamford\maker\all-links.txt` (883 PDF) + tải mẫu (PDF + .txt) cùng thư mục. Tệp: `https://www.stamford-avk.com/sites/stamfordavk/files/<tên>.pdf`. Danh sách quét chưa đủ (UCI274G-311 / -14 có trên trang hãng nhưng không nằm trong danh sách quét) → vẫn tìm theo tên.

### Nhóm 1 — Stamford (a) tờ CHÍNH HÃNG (bước 1, không cần luật đăng lại)
Dòng đầu tờ ghi đúng tên model; mục INSULATION SYSTEM "CLASS H"; kVA theo điện áp ở bảng "Winding … / 0.8 Power Factor" (chưa trích).
| model | URL (sau `…/sites/stamfordavk/files/`) | trang | dòng đầu |
|---|---|---|---|
| PI734B | PI7B-13-TD-EN_Rev_A.pdf (cũng -26, -28) | 7 | "PI734B - Winding 13 / Technical Data Sheet" |
| PI734D | PI7D-07-TD-EN_Rev_A.pdf (-13, -26, -312) | 7 (312: 9) | "PI734D - Winding …" |
| PI734E | PI7E-07-TD-EN_Rev_A.pdf, PI7E-312-TD-EN_Rev_A.pdf | 7 / 9 | "PI734E - Winding …" |
| PI734F | PI7F-07-TD-EN_Rev_B.pdf (-13, -26) | 6–7 | "PI734F - Winding …" |
| UCI274G | UCI274G-311-TD-EN_Rev_C.pdf; (đường dẫn `/stamford-avk/sites/stamfordavk/files/`) UCI274G-14-TD-EN_Rev_A.pdf | 9 / 8 | "UCI274G - Winding 311 / Technical Data Sheet" |
| UCDI274J | UCDI274J-311-TD-EN_Rev_C.pdf (-14, -17) | 9 | "UCDI274J …" |
| UCDI274K | UCDI274K-311-TD-EN_Rev_B.pdf (-17; ES10456664_UCDI274K-06-TD-EN%20_Rev_B.pdf) | 9 | "UCDI274K …" |
| LVSI804 (R/S/T/W/X/Y) | LVSI804S%20Wdg%2012.pdf (R 12/13, S 07/12/13, T 12/13/65, W 07/12/13/65, X 07/12, Y 65) | 8 | "LV 804 S WDG 12 - Technical Data Sheet / FRAME LV 804 S" |
Lưu ý: tờ hãng là UCDI274J/K (có chữ D), KHÔNG phải UCI274J/K; theo quy tắc Khoa không coi cùng model nếu không có bằng chứng hãng → điều phối quyết. Chưa chọn winding / hậu tố cho LVSI804.

### Nhóm 1 — (c) không có tờ
- **LVI634B–G**: trang hãng không có (có HCI634, HCM634, PI734, LVSI804); tìm web 2 lần chỉ ra HCI634.
- **P086TI**: KHÔNG phải model đầu phát — industrialgeneratorset.com (đại lý, 1 nguồn): "Doosan diesel engine P086TI and Stamford brushless alternator UCI 274 H" → P086TI là động cơ Doosan. Đề nghị loại khỏi danh sách đầu phát.
- **họ 164 / 184**: tên không rõ; trang hãng chỉ có tên tệp khung "ESA058N184_S4L1M-E4-B-W311.pdf", "A058N165_Rev_A.pdf" (KHÔNG suy ra). Cần tên đầy đủ.
- **UCI274J, UCI274K** (đúng chữ UCI): không có.

### Nhóm 2 — ứng viên smartgen-america …/0c9/zhr01df3en0stwmaivrnra99eacdr28m.pdf
Là **"HGM9510 GENSET PARALLEL (WITH GENSET) CONTROLLER USER MANUAL"**, SmartGen Technology, 71 trang, "This manual is suitable for HGM9510 parallel controller only." KHÔNG phải 9210/9220/9410. Tệp `smartgen\cand0c9.pdf/.txt`. Có cho HGM9510: "Working Voltage DC8. 0V to 35. 0V", "Case Dimensions 266mm x 182mm x 45mm", "Protection Level IP55 Gasket" (đăng lại bởi nhà phân phối SmartGen Mỹ).

### Nhóm 3 — luật 2 nguồn
- SICES GC310/350/500Plus: tờ tìm thấy (scribd, directindustry, ttttglobal…) là GC315 ("Supply voltage: 7-32 Vdc", "IP65") và GC400, KHÔNG phải model cần → không dùng. (b) không có.
- HGM9210/9220/9410: manual chung "HGM9200/9300/9400 Series V1.2" chỉ thấy trên scribd (cần đăng nhập → bỏ). grandnparts.com (đại lý) ghi HGM9210 IP55 — 1 nguồn, chưa đủ. Nguồn DC, kích thước chưa có. Tờ 93XX có DC(8~35)V / IP55 là của 9310/9320, không dùng.

### Số model lượt 4
(a) chính hãng 8 (PI734B/D/E/F, UCI274G, UCDI274J, UCDI274K, LVSI804) + HGM9510 (nguồn/kích thước/IP) = 9; (b) 0; (c): LVI634B–G, 164/184, UCI274J/K, HGM9210/9220/9410, GC310/350/500Plus (nguồn DC, IP); P086TI = không phải đầu phát.
Việc chưa làm: trích bảng kVA theo winding; LVI634 tên khác; manual 9200/9300/9400 ngoài scribd; datasheet GC310 chính hãng.
