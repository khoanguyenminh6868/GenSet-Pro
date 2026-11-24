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
