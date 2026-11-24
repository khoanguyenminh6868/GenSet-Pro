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
