# Nghiệm thu: nơi sản xuất theo hãng (việc 1, bước 1) — nha-may-hang

- Nhánh `nha-may-hang`, worktree `C:\Projects\GenSet Pro\wt-nha-may-hang` (từ origin/main). PR draft: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/862 (chưa merge).
- Phạm vi: chỉ dữ liệu `suppliers/` + schema + verify + test. KHÔNG sửa `web/catalog.js`, không cho code đọc trường mới.

## Tệp đã đổi
- `suppliers/schema.json`: khai `manufacturing[]` và `manufacturingNote`.
- `suppliers/verify.mjs`: kiểm `manufacturing[]` (xem luật bên dưới).
- `suppliers/manufacturing.test.mjs` (mới, 8 ca), `suppliers/CLAUDE.md` (một dòng quy tắc).
- Hồ sơ: `cn/stamford-avk-china`, `leroy-somer-fuzhou`, `mecc-alte`, `deep-sea-electronics`, `comap`, `sices` (thêm `manufacturing[]` + nguồn 6001+), `marathon-generators` (chỉ `manufacturingNote`).
- Trang nguồn mới (mở lại từng URL ngày 17/11/2026, lưu bằng `fetch-source.mjs` đúng cách của `fetch-source`/crawl, không cần Firecrawl): `sources/<id>/6001..6003.md` — 10 trang.

## Cấu trúc và luật verify
`manufacturing[]` mỗi mục: `country` (ISO2), `city`, `scope` (`manufacture` | `design`), `products` (chỉ khi nguồn nói), `src[]`, `quote[]`, `khoa`, `note`.
- Có `src`: mỗi `quote` phải nằm nguyên văn (chuẩn hoá khoảng trắng / gạch) trong trang đã lưu của ít nhất một nguồn nêu.
- Không `src`: bắt buộc `khoa: "Khoa chốt dd/mm/yyyy"`, và không được có `products`.
- Mục `khoa` (mặc định) là mục riêng, tách khỏi mục có nguồn.

## Dữ liệu đã nhập
| Hồ sơ | Mục |
|---|---|
| stamford-avk-china | CN Vô Tích (Xinrong, Xiangjiang); IN Ahilyanagar; IN Ranjangaon; RO Craiova (AvK, "only manufactured"); GB Stamford (S4–S7, bài 01/03/2023); **mặc định GB (Khoa chốt 16/11/2026)** |
| leroy-somer-fuzhou | FR Sillac (LV, LSA/TAL 463/493); FR Orléans (MV/HV); CZ Olomouc; CN Phúc Châu; IN Bangalore + Hubli; MX Reynosa; RO Cluj; US Lexington; **mặc định FR (Khoa chốt)** |
| mecc-alte | IT, GB, IN, CN (không có thành phố / dòng); **mặc định IT (Khoa chốt)** |
| deep-sea-electronics | GB Hunmanby, mọi sản phẩm ("one place, the United Kingdom") |
| comap | CZ Praha **scope design** (nguồn chỉ nói thiết kế); **mặc định CZ (Khoa chốt)** |
| sices | IT scope design (SMARTECH); nhà máy SICES chưa nêu |
| marathon-generators | không có mục; `manufacturingNote`: chưa xác nhận (403 marathonelectric.com / weg.net) |

Chưa có mục: **Datakom, DEIF, Woodward, Lovato, DynaGen/Cattron, SmartGen** (xem "Cần ghi nhớ").

## Lệnh kiểm và đầu ra thật
- `node --test suppliers/manufacturing.test.mjs suppliers/schema-keys.test.mjs` → `# tests 11 / pass 11 / fail 0`.
- Toàn bộ `node --test suppliers/` và `node suppliers/verify.mjs`: `node suppliers/verify.mjs` → "435 bản ghi, 0 có lỗi"; `node --test suppliers/` → tests 942, pass 942, fail 0.
- Lỗi thật bắt được khi làm: câu trích DSE nằm ở trang 6002, không phải 6001 → luật "mọi câu trích nằm trong MỌI nguồn nêu" quá chặt, đổi thành "ít nhất một nguồn nêu".

## Số đo
Không có chỉ số trước/sau (chỉ thêm dữ liệu). Đã đo: 7 hồ sơ sửa, 10 trang nguồn lưu, 24 mục `manufacturing` (đếm tay từ script: 6+9+5+1+2+1).

## Đối chiếu với `MADE_DEFAULT` (catalog.js, chỉ đọc)
`{ Stamford: GB, Leroy-Somer: FR, Mecc Alte: IT, AvK: RO, Deep Sea: GB, DEIF: DK, Woodward: PL, Datakom: TR, ComAp: CZ }`
- Khớp: Stamford GB, Leroy-Somer FR, Mecc Alte IT, AvK RO (nguồn nói thẳng), Deep Sea GB (nguồn nói thẳng), ComAp CZ (Khoa chốt; nguồn chỉ nói thiết kế).
- **Lệch / lưu ý:**
  1. Stamford GB là Khoa chốt, nhưng nguồn hãng hiện nói Anh chỉ là "technical testing and development services", năm nhà máy là TQ ×2, Ấn ×2, Romania. Bài 2023 lại nói Stamford (Anh) sản xuất S4–S7. Nguồn mâu thuẫn, ghi cả hai trong `note`.
  2. `MADE_DEFAULT` không có Marathon / SICES / Lovato / DynaGen: khớp với "cần xác nhận". SICES có hồ sơ: nhà máy chưa nêu (chỉ thiết kế ở Ý).
  3. Datakom TR, DEIF DK, Woodward PL (easYgen-1500/2000/3000 qua `madeDefault`): trong code nhưng CHƯA có chỗ lưu nguồn vì chưa có hồ sơ hãng (xem dưới). Nguồn tra 16/11: Datakom "started building its new factory in Istanbul" (chỉ nói xây nhà máy mới, không "mọi sản phẩm"), DEIF "manufacture all our products in-house at our Danish HQ in Skive", Woodward "All Stuttgart controls manufactured in Woodward Krakow".
  4. `MADE_DEFAULT` ghi cả hãng Leroy-Somer FR, nhưng dòng nguồn ghi "(Fuzhou)" mới là TQ: hiện bắt bằng `CN_PLANT`, không đổi.

## 3 mẫu đối chiếu nguồn (URL + câu trích)
1. https://www.stamford-avk.com/news/celebrating-100-years-avk — "AvK products are only manufactured at their Romanian plant in Craiova" (`sources/stamford-avk-china/6002.md`).
2. https://www.deepseaelectronics.com/about — "We manufacture our products in one place, the United Kingdom." (`sources/deep-sea-electronics/6001.md`).
3. https://www.nidec.com/en/nidec-leroysomer/corporate/network/factory/ — dòng "Leroy-Somer EPG Sillac | France | Design and manufacture of low voltage alternators" (`sources/leroy-somer-fuzhou/6001.md`).

## Rủi ro và quay lui
- Thấp: trường mới, không code nào đọc. `git revert` PR là hết.
- `verify.mjs` mới chặt hơn chỉ với bản ghi có `manufacturing`.
- Bản chuẩn hoá `fetch-source.mjs` đổi bảng markdown trang Nidec thành `| … |`; câu trích dùng dòng con của ô nên vẫn khớp, nhưng nếu trang đổi bố cục, lần lưu lại có thể phải sửa quote.

## Việc chưa kiểm / chưa làm
- Marathon: 403, chưa có nguồn. Không thử lại.
- Không thêm hồ sơ Datakom / DEIF / Woodward / Lovato / DynaGen (xem dưới).
- Woodward easYgen-800 (có thể làm ở TQ, chưa xác minh) và dòng DynaGen "Manufactured in Canada" (tier C) không nhập.
- Kiểm tay 10 mục so với trang đã lưu: chỉ kiểm 3 mẫu ở trên + verify tự động cho phần còn lại.

## Cần ghi nhớ (cho phiên điều phối)
- **Quyết định cần Khoa:** có tạo hồ sơ mới cho Datakom, DEIF, Woodward (điều khiển) để `MADE_DEFAULT` có nguồn không? Em chưa thêm vì hồ sơ mới hiện lên danh sách NCC trên web (và bị Tìm Thông Số / loại trừ xử lý như NCC thường); cần Khoa quyết role (`controller_maker`), `status: incomplete`, và có tạm loại trừ (`supexcl`) hay không. Nguồn đã tra sẵn trong `tra-nha-may-hang.md`. Lovato / DynaGen: nguồn không nói nhà máy cho bộ điều khiển → không thêm.
- Bước sau (PR khác): cho `catalog.js` đọc `manufacturing[]` thay cho `MADE_DEFAULT` cứng.
