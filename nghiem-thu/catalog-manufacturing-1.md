# catalog-manufacturing-1: catalog.js đọc `manufacturing[]` thay `MADE_DEFAULT`

PR draft: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/931 (nhánh `catalog-manufacturing`, gốc babd36d6 = origin/main lúc đo; `suppliers/cn` không đổi so với lúc brief).

## Tệp đã đổi
- `web/catalog.js`: `useManufacturing(suppliers)` dựng bảng `madeFrom` từ `manufacturing[]`; `madeDefault` đọc bảng đó trước, rồi mới tới `MADE_DEFAULT` (giữ nguyên như dự phòng); `madeIn` trả `why` của mục nguồn; `builder()` gọi `useManufacturing`; xuất `useManufacturing` ở `api`.
- `suppliers/catalog-manufacturing.test.mjs` (mới, 6 ca), `web/CLAUDE.md` (bẫy), `suppliers/CLAUDE.md` (bỏ câu "chưa có hồ sơ Datakom/DEIF/Woodward").
- Không đụng `config-bot.mjs`, `genbid-hsmt\`, web thật.

## Chỗ dùng MADE_DEFAULT (trước khi sửa)
Chỉ `madeDefault()` trong `catalog.js` (dùng ở `madeIn`, từ đó `madeAt`/`madeOf`/web `catOriginOf`/config-bot `candidates` + `madeChecks`). Hãng có `manufacturing[]` ở origin/main: stamford-avk-china (Stamford, AvK), leroy-somer-fuzhou, mecc-alte, deep-sea-electronics, comap, sices (chỉ design), datakom, deif, woodward (#866 đã merge); marathon-generators chỉ có `manufacturingNote`.

## Quy tắc đọc (không đặt quy tắc mới; theo CLAUDE.md và bộ nhớ)
1. Chỉ mục `scope: manufacture`; `design` không tính (ComAp Praha, SICES).
2. Mục `khoa`, không `products`, không `src` = nơi Khoa chốt 16/11 cho hãng đầu tiên của hồ sơ (Stamford GB, Leroy-Somer FR, Mecc Alte IT, ComAp CZ, Datakom TR).
3. Mục có nguồn "All products" (DSE GB, DEIF DK) = nơi của hãng; "AvK (all)" = AvK RO.
4. Mục chỉ liệt kê sản phẩm (Woodward) = chỉ các model đó (easYgen-1500/2000/3000/3000XT…); model khác (easYgen-800) và không model → không rõ.
5. Mục có nguồn mà không nêu sản phẩm (Datakom Istanbul, 4 nhà máy Mecc Alte), hai nơi khác nhau → bỏ. Không có gì dùng được → bảng cũ.
Điểm em tự chọn trong cách ĐỌC (Khoa chưa xét riêng): mục `khoa` không `products` gán cho hãng ĐẦU TIÊN của `names.brands` (Stamford, không phải AvK).

## Kiểm đã chạy
- `do-noi-sx.mjs` (`dau-vao\catalog-manufacturing\`): `madeAt` của MỌI dòng của MỌI bản ghi catalog (60.350, cả động cơ) và `madeOf` MỌI bản ghi (9.742), gốc ↔ nhánh, build trên toàn `suppliers/cn`. Kết quả (`noi-sx-1.txt`, `noi-sx-1.json`, `noi-sx-1-phan-bo.txt`): chỉ ở gốc 0, chỉ ở nhánh 0, **nơi sản xuất (`at`) và `madeOf` giống hệt ở cả 60.350 + 9.742**. Chỉ có 2 lớp đổi chữ `why`:
  - Deep Sea, bộ điều khiển, 276 dòng: GB, why "mặc định theo hãng (Khoa chốt 16/11/2026)" → "hãng ghi nơi sản xuất — hồ sơ hãng, nguồn 6001/6002 (Hunmanby, North Yorkshire, mọi sản phẩm)". Giải thích: mục có nguồn "All products" nay thắng bảng cũ, cùng GB.
  - DEIF, bộ điều khiển, 14 dòng: DK, why → "… nguồn 6001/6002 (Skive, mọi sản phẩm)". Cùng lý do.
  - Các hãng còn lại (Stamford 3.832 GB + 19 CN, Leroy-Somer 1.039 FR, Mecc Alte 84 IT, ComAp 91 CZ, Datakom 6 TR, Woodward 1 US + 3 "?", Marathon/SICES "?") không đổi cả `at` lẫn `why`. Không lớp nào không giải thích được. AvK không có dòng nào ở catalog, chỉ kiểm bằng test + probe (RO, why "… nguồn 6002 (Craiova, AvK (all))").
- Probe trực tiếp (`probe.mjs`): trước build (dự phòng) và sau build cho 9 hãng + Woodward 3000/3000XT/800 + Marathon: `at` bằng nhau.
- `node --test suppliers/*.test.mjs web/test/*.test.mjs`: **1281/1281 đạt** (`test-full.txt`). `node suppliers/quality.mjs --check`: "không chỉ số nào xấu đi quá ngưỡng".
- Bẫy bắt được khi làm: config-bot coi `why` không bắt đầu "hãng|mặc định" là câu trích của dòng nguồn (ghi `sourceQuote`, ngăn giữ check cũ) → why mới phải bắt đầu "hãng…" (có ca test).

## Top 30 Gợi ý cấu hình: KHÔNG đo
Xuất xứ vào `candidates` qua `madeAt(...).at` (cộng/trừ điểm, lọc nhóm). `at` giống hệt cho mọi dòng nên điểm và thứ hạng không đổi; chỉ chữ `why` trong ghi chú ứng viên (hãng Deep Sea / DEIF) đổi. Đây là suy luận từ phép đo `madeAt`, KHÔNG phải đo 928 gói / 1.093 lượt. Nếu điều phối vẫn muốn đo thì dùng gop-2b.json làm gốc (main vẫn babd36d6, `git diff 37ea072d babd36d6 --stat` em chưa chạy).

## 3 mẫu đối chiếu nguồn (đọc từ hồ sơ trong repo, chưa mở lại URL)
- DEIF: `suppliers/cn/deif.json` manufacturing[0], DK Skive "All products", nguồn 6001/6002 (`suppliers/sources/deif/`).
- Deep Sea: `deep-sea-electronics.json`, GB Hunmanby "All products", nguồn 6001/6002.
- AvK: `stamford-avk-china.json`, quote "AvK products are only manufactured at their Romanian plant in Craiova" (nguồn 6002).
`verify.mjs` của #862/#866 đã kiểm các câu trích; em không chạy lại verify.

## Hành vi giữ nguyên (không có dữ liệu `manufacturing[]`)
Lovato, DynaGen: không hồ sơ → bảng cũ (bảng cũ cũng không có hai hãng này nên vẫn "?"). Marathon, SICES: không nơi sản xuất → "?" như trước. Woodward easYgen-800 và model không rõ → "?". Datakom: mục nguồn Istanbul không dùng, vẫn TR theo mục Khoa chốt. Nhà máy TQ ghi ở dòng nguồn (WUXI STAMFORD → CN) vẫn thắng mặc định (test).

## Rủi ro còn lại / quay lui
- Trạng thái `madeFrom` là biến chung của module (không theo từng build); danh sách không có hồ sơ có `manufacturing` không xoá bảng. Web luôn build trên toàn bộ NCC nên bảng đủ; nếu web lọc bỏ hồ sơ `controller_maker` khỏi `supAll()` thì tự rơi về bảng cũ (kết quả giống cũ): em chưa kiểm `supAll()` trong `index.html`.
- Chưa mở web/Playwright (thay đổi không đụng giao diện; `catOriginOf` gọi `madeOf` có kết quả giống hệt).
- Quay lui: revert PR.

## Cần ghi nhớ
- Nếu sau này thêm hồ sơ Lovato / DynaGen có `manufacturing[]` thì catalog tự đọc; `MADE_DEFAULT` có thể xoá khi mọi hãng có hồ sơ.
- Woodward LS5 / DTSC200 / IKD1M có trong `products` nhưng catalog chưa đọc bộ điều khiển đó (CONTROLLERS chỉ có easYgen), nên chưa có tác dụng.

## Sửa lần 2 (theo điều phối kiểm PR #931)
- `madeDefault` nhánh `models` đổi `startsWith` → `includes` (như regex cũ khớp ở bất kỳ vị trí). Ca test thêm: "Woodward easYgen-3000" PL, "easYgen 2000 series" PL, "EASYGEN 2500" ?, "Woodward easYgen-800" ?.
- `web/CLAUDE.md`: thêm câu web `builder(supAll())` bỏ hồ sơ incomplete nên Datakom / DEIF / Woodward đi bảng dự phòng.
- Chạy lại: `do-noi-sx.mjs` (noi-sx-2.json) vẫn chỉ 2 lớp why (Deep Sea 276, DEIF 14), `at` giống hệt; đủ bộ test 1281/1281 (test-full-2.txt).
