# Datasheet đầu phát hãng Trung Quốc: kết quả phiên con (24/11/2026)

**Trạng thái: BỊ CHẶN ở bước lưu tài liệu. Chưa lưu tờ nào vào repo, chưa sửa hồ sơ `cn/`, chưa chạy verify / test (không có thay đổi nào để kiểm).**

## 1. Vì sao dừng
- Trong container cloud này, `curl` và `node suppliers/fetch-source.mjs` đều bị proxy ra ngoài từ chối (HTTP 403 ở bước CONNECT) với MỌI host đã thử: `kwisegenerator.com`, `en.engga.cn`, `faradaygenerator.com`, `en.evotecpower.com`, `linzelectric.com`, `brushlessacgenerator.com`, `stamford-avk.com`, `google.com`, `web.archive.org`. Môi trường chỉ cho `WebSearch` và Firecrawl (MCP) đọc web.
- `fetch-source.mjs` / `maker-datasheets.mjs` là đường lưu đúng quy ước (ghi dòng `URL:` + ngày, tải PDF, `pdftotext -table`). Không có đường này thì không lưu được tờ loại (a)/(b). Tôi KHÔNG tự viết tệp `sources/<id>/<n>.md` từ kết quả Firecrawl, vì tệp đó phải là bản tải thẳng của tài liệu để `verify.mjs` đối chiếu câu trích.
- Cách mở: thêm host vào allowlist mạng của môi trường (`kwisegenerator.com`, `en.engga.cn`, `faradaygenerator.com`, `en.evotecpower.com`, …) hoặc chạy lại trên máy Khoa.

## 2. Xếp hạng hãng (sơ bộ, chưa chốt)
Cách tính: quét `suppliers/cn/*.json`, bỏ hồ sơ `role: alternator_maker` (là chính hãng, không phải NCC tổ máy), đếm DÒNG `specTables` của NCC tổ máy có chữ tên hãng (không phân biệt hoa thường; bí danh: Faraday = 法拉第 / Farada; Hengtong = 恒通); số NCC = số hồ sơ khác nhau có ít nhất một dòng như vậy. Là số thô: dòng tiêu đề / mô tả không phải ô "đầu phát" cũng bị đếm (vd. "Kwise" 78 dòng ở `baudouin` đa phần không phải cột đầu phát), nên cần soát tay trước khi dùng xếp hạng.

| Hạng | Hãng | Dòng bảng | Số NCC tổ máy | Ghi chú |
|---|---|---|---|---|
| 1 | Nianfeng | 625 | 2 (fudiankang-hunan chiếm hầu hết) | ví dụ dòng "alternator model: nianfeng nfs274-k"; hồ sơ `nianfeng-fujian` chưa có website |
| 2 | Engga | 201 | 3 | bspower-guangdong, … liệt kê "Stamford, Marathon, Leroy Somer, Faraday, Engga" |
| 3 | Faraday | 200 | 2 | cùng dòng liệt kê trên |
| 4 | Longkai | 177 | 1 (longkai-power) | là `genset_oem`, ghi "copy Stamford" ở một dòng; không phải hãng đầu phát độc lập, cần Khoa duyệt |
| 5 | Kwise | 78 | 9 (nhiễu) | |
| 6 | LongHong | 42 | 1 | |
| 7 | Kaichen | 22 | 1 | |
| 8 | Linz | 20 | 2 | |
| 9 | Xingnuo | 15 | 2 | thực ra là ô "control system" (bộ điều khiển), không phải đầu phát |
| 10 | Hengtong 恒通 | 14 | 1 | |
| 11 | 欣同辰 | 13 | 1 | |
| 12 | Werna | 7 | 1 | |
| 13 | Sincro | 6 | 2 | |
| – | Evotec, Agestar, Keliang, Eastern Lion, Nenjo, Gordon, Gloria, Shengfeng, HGI, Firstall | 0 | 0 | có hồ sơ nhưng không NCC tổ máy nào ghi tên trong bảng (theo cách quét này) |

Số lần ghi qua `productLines[].alternatorMakes` (một cách đếm khác): LongHong 15, 恒通 14, Xingnuo 14, 欣同辰 13, Kwise 9, Linz 9, Evotec 8, Werna 8, Engga 7, C.GEN 7, Nianfeng 5, Faraday 4, Kaichen 2.

Chưa làm: họ mã không rõ hãng nhưng nhận ra chắc chắn từ chữ NCC (cần đọc TSV theo cột `ncc` + chữ gốc), 15 hồ sơ ít nguồn.

## 3. Thăm dò nguồn (chỉ đọc, qua WebSearch / Firecrawl; KHÔNG lưu vào repo)
- **Kwise (`kwise-generator`)**: repo đã có tờ 2001+ (đường Tìm NCC) cho KAL164 / KAL184 từ `kwisegenerator.com/wp-content/uploads/2023/0[5|6]/KAL1xx-series-generator…-technical-data-sheet-Rev.B.pdf`. Kết quả tìm xác nhận URL chính hãng KAL184: `https://kwisegenerator.com/wp-content/uploads/2023/06/KAL184-series-generator%E2%80%98s-technical-data-sheet-Rev.B.pdf` (loại a). Trang `kwisegenerator.com/product/kal184/` có nút "Download Datasheet". Cần chuyển / lưu lại bằng `maker-datasheets.mjs` (dải 1001+) khi có mạng.
- **Engga (`engga`)**: `en.engga.cn/Products.html` (Firecrawl đọc được, 200) chỉ liệt kê danh mục "Generators", "Electronic Products & Accessories", "New Energy Drive Motors" và các trang `Product_1/56…70`; không thấy liên kết PDF datasheet trong danh sách liên kết của trang đó. WebSearch không ra datasheet PDF chính hãng; chỉ có trang DirectIndustry (đại lý, không phải tờ hãng) và một sổ tay vận hành trên Scribd (không dùng được: không phải hãng đăng, không phải datasheet). Chưa đủ để kết luận "không có"; cần duyệt các trang `Product_1/*` khi có mạng.
- Faraday, Nianfeng, Longkai, LongHong, Linz, Evotec, Werna, C.GEN, Agestar, Keliang, Eastern Lion, Nenjo, Gordon, Gloria, Shengfeng, HGI, Firstall: **chưa làm**.

## 4. Mục (c) (một nguồn internet ghi thông số)
Chưa có mục nào đủ điều kiện (cần URL + câu trích nguyên văn + giá trị; chưa đọc đủ nội dung trang nào).

## 5. Việc còn lại theo thứ hạng
1. Mở mạng tới host hãng (hoặc chạy trên máy Khoa).
2. Kwise: lưu tờ KAL184 / KAL164 chính hãng bằng `maker-datasheets.mjs kwise-generator <pdf…>` → `merge-specs.mjs` → `verify.mjs` → `node --test suppliers/*.test.mjs`.
3. Nianfeng → Engga → Faraday → Longkai (sau khi Khoa duyệt vai trò) → LongHong → Linz → các hãng còn lại, đúng thứ tự (a) → (b) → (c).
4. Soát tay xếp hạng thô ở mục 2 trước khi dùng.

---

## 6. Lượt trên máy KhoaMiniPC (24/11/2026)

**Kết quả: lưu 3 hãng (Kwise, Linz, Firstall; 49 tờ hãng, dải 1001+), `verify.mjs` 0 lỗi / 436 bản ghi, `node --test suppliers/*.test.mjs` 1731/1731 đạt. Nhánh `dau-phat-tq` (worktree `wt-dau-phat-tq`), PR nháp, chưa merge.**

### 6.1 Xếp hạng đã soát
Cách đếm lại: quét `suppliers/cn/*.json`, bỏ `role: alternator_maker`, chỉ tính chữ hãng nằm ở (a) cột đầu phát của bảng "|" (tiêu đề cột có "alternator / generator head / 发电机 / 电机品牌…", không phải "genset / engine / control"), (b) dòng "nhãn: giá trị" hoặc "| nhãn | giá trị" có nhãn là đầu phát, (c) `productLines[].alternatorMakes`. Mỗi NCC tính một lần cho mỗi hãng. Chữ hãng nằm ở chỗ khác (dòng mô tả, tên model) KHÔNG tính.
- **Sai lớn của số thô cloud:** "Kwise 78 dòng" gần như toàn là chữ "clock**wise**" (hướng quay "Clockwise/anticlockwise" của động cơ). Kwise thật chỉ có 3 NCC ghi trong ô đầu phát: welland-power (cột "KWise", 40 dòng), sevenpower-chengdu, sr-genset. Regex hãng phải có ranh giới từ.
- "Engga 201 / Faraday 200" = cùng MỘT dòng "Alternator option: Leroy Somer, MECC, Marathon, Engga, Faraday" lặp trong 199 bảng của fdk-energy (cùng một nội dung tải xuống). Đếm theo NCC.
- "Nianfeng 625" phần lớn là cột "Alternator" của bảng model fdk-energy lặp lại; theo NCC: 3.
- "C.GEN 7" = chữ "gen-set" (không phải hãng); 0 NCC thật ghi C.GEN trong ô đầu phát. Xingnuo = ô "Control System" / "Brand" của bộ điều khiển: bỏ (theo Khoa). LONGKAI bỏ (theo Khoa).

Xếp hạng theo SỐ NCC tổ máy ghi trong ô đầu phát (+ `alternatorMakes`):

| Hạng | Hãng | NCC | Ghi chú |
|---|---|---|---|
| 1 | Engga | 7 | acepow-fuan, bspower-guangdong, fdk-energy, fukangsi-yangzhou, panda-power, saintshine-shenzhen, sunkings |
| 2 | Faraday (法拉第 / Farada) | 3 | bspower-guangdong, fdk-energy, sunkings |
| 2 | Nianfeng | 3 | fdk-energy (nhiều dòng), fudiankang-hunan, sr-genset |
| 2 | Kwise | 3 | welland-power, sevenpower-chengdu, sr-genset |
| 2 | Linz | 3 | avs-aggregatebau, energy-gruppi, green-power-generators (cột LINZ) |
| 6 | LongHong, Werna, Hengtong 恒通, 欣同辰, Kaichen, 德科, 兰电 | 1 mỗi hãng | |
| – | Evotec, Agestar, Keliang, Eastern Lion, Nenjo, Gordon, Gloria, Shengfeng, HGI, C.GEN | 0 | có hồ sơ hãng nhưng không NCC tổ máy nào ghi trong ô đầu phát |
Sincro (Soga) là hãng Ý, không phải TQ: ngoài phạm vi (ghi chú: `sogaenergyteam.com` có nhiều PDF công khai, xem 6.4).

### 6.2 Lưu được (tờ hãng loại a, dải 1001+; `maker-datasheets.mjs` → `merge-specs.mjs`)
| Hãng | Hồ sơ | Nguồn | Tờ | Model phủ |
|---|---|---|---|---|
| Kwise | `kwise-generator` | `kwisegenerator.com/wp-content/uploads/2023/05–06/` (PDF chính hãng, link từ trang sản phẩm / Downloads) | 1001–1009 (9) | KAL164, 184, 224, 274, 314, 354, 404, 454; KLH134 (3–10 kW) |
| Linz | `linz-electric` | `linzelectric.com/uploads/ProdottiArticoli/*.pdf` (nút "download pdf" trên trang model) | 1001–1033 (33) | PRO18S A/B/C, PRO18M D/E, PRO18L F/G, PRO22S A–D, PRO22M E/F/G, PRO28S A–D, PRO28M E/F, PRO28L G, PRO35S B/C/D, PRO35M E/F/G, PRO35L H, PRO40S A/B, PRO40M C/D, PRO40L E (đủ các model NCC đã ghi: PRO18S C/4, PRO18L G/4, PRO22S D/4) |
| Firstall | `firstall-power` | `firstallpower.com/upload/file/*.pdf` (trang /download/) | 1001–1007 (7) | QYI454 B, C, D, E, F, G, H |
Kwise: 8 tờ KAL đã có ở 2001+ (đường Tìm NCC); nay lưu lại ở 1001+ bằng đường tờ hãng (cùng URL).
Bẫy gặp: (1) `specs/linz-electric.json` có bảng n103–105 mà `sources/linz-electric/103–105.md` không có → `merge-specs` chết ENOENT; đã gộp bằng cách tạm đặt `specs/linz-electric.json` chỉ còn n≤102 rồi trả về như cũ (không đổi tệp đó; `cn/linz-electric.json` chỉ THÊM, 0 dòng bị xoá). (2) Tiêu đề `maker-datasheets` của Linz một số tờ là "ALTERNATOR PRO18L G/4" (có chữ ALTERNATOR trước model) — chưa kiểm xem `modelFacts` có gắn được cho model `PRO18L G/4` không; chưa đo bằng `factsFor`.

### 6.3 Hãng KHÔNG có tài liệu công khai tải được (loại bỏ, theo luật 401/403/CAPTCHA)
- **Nianfeng** (`zgnfmotor.com`, trang chính thức, 200): trang model `products_detail/10.html` liên kết hai PDF "年丰低压画册2024版.pdf", "年丰画册(终稿).pdf" trên `omo-oss-file110.thefastfile.com` → cả hai HTTP **403** (kể cả URL mã hoá %): bỏ. Trang model chỉ ghi dải công suất (vd. meta "NF274L（J&K) 电压: 110V~690V 功率: 230~343.8kVA"). Hồ sơ `nianfeng-fujian` còn `website: null` (nên điền `zgnfmotor.com` — điều phối quyết, tôi không sửa).
- **Engga**: `en.engga.cn` không có PDF; trang tải `engga.com.cn/sub_page/download.php` (có Catalogue / Technical Parameters) trả **403 WAF** → bỏ.
- **Faraday**: `faradaygenerator.com` curl 403 (đọc được qua Node); duy nhất một liên kết `…thefastmake.com/viewfilebizce/…/FD5M-4-311-TD-EN_Rev_A.pdf` là trang xem PDF.js không có tham số tệp, không có URL PDF thật → không lưu; không đoán URL. Bảng sản phẩm FD1–FD7 đã có ở trang web (hồ sơ `faraday-wuxi`, 12 nguồn).
- **Evotec** (`en.evotecpower.com`), **Werna** (`brushlessacgenerator.com`), **C.GEN** (`wkmachine.com`), **Agestar**, **Eastern Lion**, **Nenjo**, **Gloria (sypower.com)**: quét trang hãng + nguồn trong hồ sơ, không thấy PDF.
- **Keliang** (`motors-world.com/catalogs/generator.pdf`, `generator-set.pdf`): PDF ảnh, `pdftotext` ra 0 dòng → cần OCR (đường 4001+), chưa làm.
- **Gordon** (`gordon-powers.com/download.html`): tải qua form popup (cần điền form) → bỏ. **Shengfeng** (`sf-motor.com/download(_en).asp`): trang tải không có liên kết tệp.
- **LongHong, Hengtong, 欣同辰, Kaichen**: chỉ có hồ sơ NCC tổ máy (`longhong-foshan`, `hengtong-jiangsu`, `hechai-changzhou`, `kaichen-jiangsu`), không có hồ sơ hãng đầu phát; tìm "LongHong alternator datasheet" không ra tài liệu hãng. Không tự tạo hồ sơ.
- **Lanzhou Electric** (`lec.cn`): curl 403 → bỏ. HV Kwise (`High-voltage-generator-technical-data-sheet.pdf`) và 3 tờ DLA164/184/224 (máy phát DC cho trạm viễn thông) không lưu: DLA là DC; tờ HV đặt sai tiêu đề (chữ "compliance to…"), bỏ để khỏi làm bẩn dữ liệu.

### 6.4 Mục (c) (một nguồn internet) và gợi ý còn lại
- Chưa có mục (c) đủ điều kiện (cần URL + câu trích nguyên văn + giá trị). Ứng viên khi cần: CCCME `pre.cccme.org.cn/products/detail-8301418.aspx` (Nianfeng "NF274 series power 110kva-300kva brushless alternator"), `fdkenergy.com/yc-series-yuchai/` (NFS274-K 275 kVA standby): chưa đọc đủ trang để trích nguyên văn.
- Sincro (Soga, Ý): `sogaenergyteam.com/wp-content/uploads/2026/01/INDUSTRIAL-RANGE-SINCRO.pdf`, `…/2017/12/CSA-UL-INDUSTRIAL-RANGE-SINCRO.pdf`, `…/2024/01/CHP-COMPLETE-PROGRAMME-SINCRO_2024.pdf` v.v. (công khai, 200). Ngoài phạm vi "hãng TQ"; điều phối quyết có lưu cho `sincro-soga` không.
- Linz còn ~100 model khác (alumen, compatto, e1c / e1s / e1x13 4 cực và 2 cực) có PDF; chưa lưu vì NCC không ghi.
- Chưa làm: C.GEN (không có NCC ghi), HGI (chỉ có bản archive.org 2017), Keliang (cần OCR).

---

## 7. Lượt 3 (24/11/2026, nhánh `dau-phat-tq-2` từ `origin/dau-phat-tq`, PR #1196 chưa merge)

**Kết quả: Sincro lưu 13 tờ (1001–1013); Nianfeng điền website + nguồn 2; KHÔNG tạo hồ sơ hãng cho LongHong / Hengtong / Kaichen / 欣同辰 (lý do ở 7.2); kiểm nối Linz: 0/33 nối được (7.4). `verify.mjs` 0 lỗi / 436 bản ghi; `node --test suppliers/*.test.mjs` 1731/1731 đạt (đo sau khi sửa xong).**

### 7.1 Sincro (`sincro-soga`, Soga S.p.A., hãng Ý) — tờ loại (a) từ `sogaenergyteam.com/wp-content/uploads/`
NCC tổ máy trong `cn/` KHÔNG ghi mã model Sincro nào (chỉ `visa-gensets` ghi cột "Sincro" cho hai mã tổ máy GSP33TWIS3 / GSK66TWIK, không có mã đầu phát) → không có model ưu tiên; lưu theo dòng đầu phát công nghiệp có tờ riêng.
| n | Tệp | Nội dung |
|---|---|---|
| 1001 | DC-ALTERNATORS-SINCRO.pdf | đầu phát DC 24/48 VDC (tiêu đề đặt "DC alternators 24 VDC \| 48 VDC": không có model) |
| 1002, 1003 | SK160-2-POLES / SK160-4-POLES | SK160 |
| 1004–1008 | SK225 / SK280 / SK355 / SK400-450 / SK500 | SK225 (65–140 kVA), SK280 (160–350), SK355 (400–800), SK400-450, SK500 (1875–2600 kVA) |
| 1009–1013 | IB2 / IB4 / FB2 / FB4 / HB4 | IB2, IB4, FB2, FB4, HB4 |
Tiêu đề `maker-datasheets` của 1001, 1004–1008 là dòng rác ("| Corrente di corto circuito…", "| E3 | IB | SK160", "AVR BL4-U"): đã sửa tay trong `datasheets/sincro-soga.json` TRƯỚC `merge-specs` (bẫy ghi ở `suppliers/CLAUDE.md` mục Datasheet hãng). Dòng bảng không đổi.
Không lưu được (công cụ báo "chỉ 0–2 dòng thông số": catalogue nhiều model dạng bảng ghép, không phải "nhãn | giá trị"): INDUSTRIAL-RANGE, CSA-UL-INDUSTRIAL-RANGE, SSG-IP54, SINCRO-MARINE, CHP-COMPLETE-PROGRAMME_2024, PORTABLE-MOBILE, EK / EP / ER / ET / FK / FT / GK / R80 (2023/12), EA-ED, SW-SINCRO 50/60 Hz. Cần đường catalog PDF (`catalog-pdf.mjs`, dải 5001+) nếu muốn. Bỏ vì không phải đầu phát tổ máy: EV, motor, gearmotor, PMM, máy hàn ARC / WELDERS.
`cn/sincro-soga.json` chỉ THÊM (291 dòng, 0 xoá).

### 7.2 Bốn hãng: xác định từ chữ NCC ghi — KHÔNG tạo hồ sơ hãng
| Hãng | NCC ghi ở đâu | Công ty | Kết luận |
|---|---|---|---|
| LongHong | `longhong-foshan`: "发电机品牌： Generator brand： \| 隆宏发电机/广东佛山发电机 LongHong generator", "发电机组制造商： … \| 广东隆宏机电设备有限公司 Guangdong LongHong Electrical Equipment Co., Ltd." (42 dòng) | CHÍNH NCC (gdfsfdj.com, đã có hồ sơ `genset_oem`) | cùng pháp nhân với hồ sơ NCC; không có tờ đầu phát riêng (trang web chỉ có bảng tổ máy, đầu phát là một dòng nhãn) |
| Hengtong 恒通 | `hengtong-jiangsu`: "品牌：扬州/恒通(标配)", "生产厂家：江苏恒通发电机制造有限公司", "型号：HTI-420 … 电机类型：无刷三相交流同步发电机" (14 trang tổ máy); trang chủ "恒通6.5-2000KW无刷发电机" | CHÍNH NCC (yzhengtong.com, `genset_oem`) | cùng pháp nhân; đọc `yzhengtong.com/?list_7/` (danh mục theo hãng / công suất / kiểu): chỉ có bảng tổ máy + trang từng tổ máy, KHÔNG có trang / PDF đầu phát riêng |
| Kaichen | `kaichen-jiangsu`: cột "Kaichen" trong báo giá 2026-11-10 (cột đầu phát = "Kaichen") | CHÍNH NCC (kaichenpower.com, `genset_oem`) | cùng pháp nhân; không tìm thấy tờ đầu phát |
| 欣同辰 | `hechai-changzhou`: chỉ `productLines[].alternatorMakes: ["欣同辰"]` (13 dòng), KHÔNG có tên công ty / trang / địa danh nào | không xác định | Tìm "欣同辰 发电机 无刷" ra toàn bài chung (patent, baike), 0 trang hãng → không tạo, không đoán |
Ba hãng đầu là thương hiệu đầu phát của chính NCC tổ máy: tạo hồ sơ `alternator_maker` riêng là nhân đôi cùng một công ty, cùng website, cùng nguồn, không thêm tờ nào. Điều phối / Khoa còn muốn nhân đôi (để tờ gắn qua `alternatorMakes`) thì báo, phiên sau làm; thông số đầu phát của ba NCC này đã nằm ở bảng của hồ sơ NCC (14 / 15 / 24 bảng).
Mục (c): không có mục nào (không tìm được trang thứ ba ghi thông số đầu phát riêng của các hãng này).

### 7.3 Nianfeng (`nianfeng-fujian`)
Điền `website: "https://www.zgnfmotor.com/"`. Chứng minh: lưu `https://www.zgnfmotor.com/about.html` thành nguồn 2 (`fetch-source.mjs`, hạng A) có câu "年丰（福建）电机有限公司" (= NIANFENG (FUJIAN) MOTOR CO., LTD.) và "年丰系福建省大型发电机制造企业，坐落于“中国中小电机之都”，专业研发制造陆用/船用发电机、高压发电机、永磁发电机". Trang about không ghi tên tiếng Anh, năm thành lập hay "Fu'an" (khớp tên theo dịch 年丰 / 福建 / 电机 / 有限公司, không có dòng nào ghi trùng chữ). Cũng sửa ghi chú `missing` (hết "chưa có website"). PDF catalogue trên `thefastfile.com` vẫn 403: không đụng.

### 7.4 Kiểm nối tờ Linz ↔ khoá model NCC ghi (đo bằng `modelFacts` / `factsFor`, không sửa code)
Script: `…\scratchpad\linz-noi.mjs`, `linz-diag2.mjs`.
- **0 / 33 tờ hãng (n1001–1033) được gắn cho khoá nào**, kể cả ba model NCC ghi (PRO18S C/4, PRO18L G/4, PRO22S D/4): `factsFor(facts,"alternator", model)` = 0 dòng.
- Hai nguyên nhân độc lập:
  1. **Catalog (build từ cả 436 hồ sơ) không có đầu phát PRO\* nào** (3.045 đầu phát, 0 khoá PRO\*): NCC (energy-gruppi n2001) chỉ nêu "Linz PRO18S C/4" trong dòng liệt kê, không phải dòng bảng có công suất + đầu phát → `isPart` sai → `modelFacts` bỏ tờ.
  2. **`titleModelKeys` tách tiêu đề ở khoảng trắng**: "Datasheet: ALTERNATOR PRO18L G/4" → khoá ["PRO18L", "G/4"] (hai mã), "Datasheet: PRO18S C/4" cũng hai mã → `models.length !== 1` → bỏ. Đo catalog GIẢ chứa đủ 33 khoá `PRO18LG/4`…: vẫn nối 0/33. (Chữ ALTERNATOR không phải nguyên nhân: nó không là mã, `isCode` false.) Chỉ model không có khoảng trắng bên trong (UCI274F, TAL-A46) mới nối được.
- Muốn nối cần sửa code (ngoài PR này): cho `titleModelKeys` nhận tên model có khoảng trắng khi chuỗi ghép là khoá có trong `partKeys`, và đưa model Linz vào catalog (dòng bảng của NCC / hoặc catalog nhận khoá từ tờ hãng).
