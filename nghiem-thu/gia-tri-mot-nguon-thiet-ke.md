# Giá trị một nguồn internet: thiết kế chỗ lưu (24/11/2026)

Việc thiết kế, chỉ đọc. Không sửa mã, không mở PR. Đọc trên `origin/main` 028ab6be.

Quyết định của Khoa 24/11/2026: thông số động cơ / đầu phát / bộ điều khiển mà tài liệu hãng KHÔNG ghi thì được lấy từ MỘT nguồn internet. Điều kiện:
- chỉ khi tài liệu hãng không ghi;
- ưu tiên: (1) trang hãng → (2) bản hãng do bên khác đăng lại → (3) một nguồn khác;
- có URL + câu trích nguyên văn;
- giá trị loại này được đánh dấu riêng, để người xem và Gợi ý cấu hình phân biệt với số của tờ hãng.

Trong tài liệu này "giá trị một nguồn" là tên gọi loại giá trị đó.

## 0. Dữ liệu đang đi thế nào (phần liên quan)

- Hồ sơ `suppliers/cn/<id>.json`: `sources[]` (`n`, `url`, `accessedAt`, `tier` A/B/C, `quote`, `file`) và `specTables[]` (`n`, `title`, `header`, `rows`). Hồ sơ hãng là hồ sơ có `role` `engine_maker` / `alternator_maker` / `controller_maker` (ví dụ `leroy-somer-fuzhou`, `perkins`, `comap`).
- `verify.mjs` kiểm TỪNG hồ sơ: câu trích có nguyên văn trong `sources/<id>/<n>.md`, mỗi dòng bảng có trong trang đã lưu, số của dải công suất có trong câu trích (`numbersIn`). Không kiểm chéo giữa các hồ sơ. CI `ci.yml` chạy nó.
- `maker-datasheets.mjs` lưu tờ hãng thành nguồn 1001+ và bảng "Datasheet: …"; `merge-specs.mjs` đưa vào hồ sơ (giữ nguyên nguồn n < 101 và n ≥ 2000).
- `config-bot.mjs modelFacts` dựng `facts` (`engine:KEY`, `alternator:KEY`, `controller:KEY`). Số từ tờ của chính hãng mang `sheet: true`. `factsFor` thêm tờ các đời cho bộ điều khiển. `sourceRatings` đọc định mức đầu phát từ TỆP nguồn (`ratings.mjs`), không từ `specTables`.
- `candidates` dùng `facts` để loại / chấm điểm: số đông dung tích, xi lanh (`majOf`, `below`), tỉ số nén (`comprOff`), tờ động cơ (`engineSheetsOf`), `engineMakerSheets`. `makerAlts` / `makerAltFix` đọc tờ đầu phát của hãng để đề xuất hoặc thay đầu phát. `catalogMd` in `facts` cho agent; nguồn 2001–2999 có nhãn `webTag` (trang chính thức hay không).
- `spec-standard.mjs` sinh bản chuẩn theo `spec-fields.json` từ `CAT.build` + `SN.normalizeRecord` + `sourceRatings`, đăng bảng Supabase `spec_std`. Mỗi giá trị có `value`, `unit`, `cond`, `missing`, `raw`, `src` (`supplierId`, `n`, `table`, `row`), `suppliers`. Chưa nơi nào đọc `spec_std` (web và config-bot là bước 5).
- Tiền lệ gần nhất: `engine-traits.json` là tệp riêng ngoài `cn/`, nguồn lưu ở `sources/engine-traits/<n>.md`, kiểm bằng test.

Hai điều cần biết trước khi chọn:
- Hiện chưa có chỗ nào phân biệt "số của tờ hãng" ở bản chuẩn. Ở `facts` thì có (`sheet: true`), ở `spec_std` thì chưa.
- Repo đã có tờ hãng do bên khác đăng lại và đang được tính là tờ hãng: `leroy-somer-fuzhou` 1021 (Depco đăng LSA 47.2), 1022 (woodstockpower.com đăng LSA 43.2), tier A. Báo cáo `nghiem-thu/dau-phat-leroy-tim.md` coi bản do đại lý đăng là loại (b) và vào hồ sơ; bản do bên không rõ thân phận đăng (abyaran.com, SlideShare) là loại (c), chưa vào. Ranh giới này cần Khoa xác nhận (câu hỏi Q1).

## 1. Lưu ở đâu, bản ghi thế nào

### Bản ghi (dùng cho mọi phương án)

Mỗi bản ghi là MỘT giá trị của MỘT trường chuẩn của MỘT model:

```json
{
  "id": "ls-lsa462-l9-ratings-1",
  "part": "alternator",
  "make": "Leroy-Somer",
  "model": "LSA 46.2 L9",
  "key": "LSA462L9",
  "field": "ratings",
  "value": { "voltage": 400, "connection": null, "phases": 3, "hz": 50, "duty": "continuous", "insulation_rise": "H/125K", "kva": 280, "kw": null, "efficiency_pct": null },
  "unit": null,
  "cond": null,
  "level": 2,
  "url": "https://abyaran.com/public/uploaded_files/LeroySumer%5bvkf%5d.pdf",
  "file": "sources/one-source/101.md",
  "accessedAt": "2026-11-24",
  "quote": ["46.2 L9 kVA 280 280 280 215 154 250 250 250 195 142"],
  "condQuote": ["<dòng tiêu đề cột của chính trang đó, nguyên văn>"],
  "makerChecked": [{ "supplierId": "leroy-somer-fuzhou", "n": [1007, 6003, 6004], "note": "không tờ nào ghi LSA 46.2" }],
  "addedBy": "phiên leroy-thieu-3",
  "note": ""
}
```

Ghi chú:
- Giá trị trong ví dụ trên chỉ để minh hoạ dạng bản ghi. Báo cáo Leroy ghi rõ "chưa đọc nhãn cột từng số": chưa biết 280 là cột điện áp / cấp nào. Chưa đọc được nhãn cột từ chính trang đó thì KHÔNG được ghi bản ghi (không nội suy).
- `field` là `id` của `spec-fields.json`. `value` / `unit` / `cond` cùng dạng với giá trị của bản chuẩn, để `spec-standard.mjs` dùng thẳng.
- `level` là bậc nguồn theo quyết định của Khoa: 1 trang hãng, 2 bản hãng do bên khác đăng lại, 3 nguồn khác.
- `quote` chứa giá trị; `condQuote` chứa điều kiện (điện áp, cấp, mức, tốc độ) khi điều kiện nằm ở dòng khác (tiêu đề cột). Cả hai phải có nguyên văn trong `file`.
- `makerChecked`: các tài liệu hãng đã xem mà không ghi trường này. Đây là bằng chứng cho điều kiện "chỉ khi tài liệu hãng không ghi". Hãng chưa có tài liệu nào trong repo thì ghi `[]` kèm `note` (đã tìm ở đâu).
- `accessedAt` lấy từ dòng `Accessed:` của tệp nguồn (cùng cách mọi nguồn khác), không gõ tay.
- Tệp nguồn lưu bằng `node suppliers/fetch-source.mjs one-source <n> <url>`. Lệnh này nhận id bất kỳ, không cần hồ sơ `cn/`. Tôi chưa chạy thử với PDF dạng bảng (bẫy PATH xpdf trên Windows ở `suppliers/CLAUDE.md`).

### Phương án A: tệp riêng `suppliers/one-source.json` (CHỌN)

Một danh sách bản ghi như trên. Nguồn ở `sources/one-source/<n>.md`, số từ 1 (thư mục riêng nên không đụng dải số của hồ sơ).

Ưu:
- Không chạm `cn/`: `CAT.build`, `modelFacts`, `candidates`, `merge-specs`, web hiện tại KHÔNG thấy giá trị nào cho tới khi có code đọc riêng. Không có đường nào lọt vào số đông hay chấm đạt ngoài ý muốn.
- Kiểm trùng model / trùng trường dễ: một tệp, một vòng lặp.
- Không cần hồ sơ hãng. Hãng chưa có hồ sơ (động cơ nhỏ TQ, Lovato, DynaGen) vẫn ghi được.
- Giống tiền lệ `engine-traits.json`.

Nhược:
- Thêm một tệp, một bộ kiểm, một chỗ đọc ở `spec-standard.mjs` và (nếu Khoa duyệt) ở config-bot.
- Trang Nhà cung cấp trên web không tự hiện các URL này (cũng là điều muốn).

### Phương án B: khoá mới `oneSource[]` trong hồ sơ hãng

Bản ghi như trên, nằm trong `cn/<hồ sơ hãng>.json`; nguồn vào `sources[]` của hồ sơ, dải số mới (ví dụ 7001+). Khai khoá trong `schema.json`.

Ưu: mọi thứ của một hãng ở một chỗ; `verify.mjs` dùng lại bảng `sources` của hồ sơ.

Nhược:
- Cần hồ sơ hãng. Hãng chưa có hồ sơ thì phải tạo trước.
- URL bên thứ ba nằm chung `sources[]` của hãng: trang Nhà cung cấp, `webTag`, luật `confidence` theo tier đều thấy chúng như nguồn của hãng. Dễ lẫn đúng chỗ cần tách.
- Trùng model giữa hai hồ sơ (hai hồ sơ cùng hãng: `perkins` / `perkins-wuxi`) phải kiểm chéo nhiều tệp.

### Phương án C: bảng "Datasheet: …" trong hồ sơ hãng

Lưu trang đăng lại như một tờ hãng (cách 1021 / 1022 đang làm).

Ưu: không cần code mới, `modelFacts` và `sourceRatings` đọc ngay.

Nhược: giá trị thành `sheet: true`, giống hệt số tờ hãng. Trái với yêu cầu đánh dấu riêng. Chỉ hợp cho bản do đại lý đăng NẾU Khoa coi đó là tài liệu hãng (Q1), không hợp cho giá trị một nguồn.

### Vì sao chọn A

Yêu cầu chính là "đánh dấu riêng". A là phương án duy nhất mà mặc định KHÔNG đọc: giá trị chỉ xuất hiện ở chỗ nào có code viết riêng cho nó, và chỗ đó gắn dấu. B và C đều để giá trị đi chung đường với số của hãng, lỗi nhỏ là lẫn.

## 2. `verify.mjs` kiểm gì

Đề xuất bộ kiểm riêng `suppliers/one-source-check.mjs` (hàm thuần + test `one-source.test.mjs`), `verify.mjs` gọi nó cuối lượt và cộng lỗi vào mã thoát (CI `ci.yml` đã chạy `verify.mjs`). Phần cần danh mục (`CAT.build`, `modelFacts`, `sourceRatings`) nằm ở bộ kiểm riêng, không ở `checkRecord`, vì `verify.mjs` hiện chỉ đọc JSON và tệp nguồn.

Bẫy vòng import: `spec-standard.mjs` import `config-bot.mjs`. Nếu sau này config-bot đọc `one-source.json` thì đọc thẳng JSON, KHÔNG import `one-source-check.mjs` (nếu tệp đó import config-bot thì thành vòng import + top-level await → node thoát 13).

Lỗi (chặn):
1. Khoá: chỉ các khoá đã khai (như `schema.json`). `part` thuộc engine / alternator / controller. `field` có trong `spec-fields.json` của phần đó. `level` ∈ {1, 2, 3}.
2. Nguồn: `url` http(s); `file` tồn tại và dòng đầu `URL:` trùng `url`; `accessedAt` trùng dòng `Accessed:` của tệp.
3. Câu trích: mỗi `quote` / `condQuote` có nguyên văn trong `file` (cùng `norm` của `verify.mjs`), mỗi câu ≥ 8 ký tự.
4. Câu trích chứa giá trị: mọi số của `value` (số trơn, hoặc mọi số khác null của object) có trong `quote` theo `numbersIn` (luật hiện có của dải công suất). Giá trị chữ (enum, text): chữ chuẩn hoá có trong `quote`. Điều kiện (`cond`, các ô `voltage`, `hz`… của object): số có trong `quote` hoặc `condQuote`. Không quy đổi; cần quy đổi thì chỉ bằng `web/conversions.js` và ghi `conv`.
5. Model: `key === CAT.keyOf(model)`. Khoá có trong danh mục thì hãng của khoá (`keptMakes`) phải chứa `make`; khoá có hai hãng (D17: Volvo Penta / Deutz) thì lỗi khi `make` không khớp đúng một.
6. Không đè số của tờ hãng: lỗi khi tài liệu hãng trong repo ĐÃ ghi trường này cho model này:
   - động cơ / đầu phát: có fact `sheet: true` cùng khoá `spec-fields.json` `key` (qua `modelFacts`);
   - `ratings`: `sourceRatings` có dòng cùng điện áp + tần số + mức + cấp từ nguồn của hồ sơ hãng;
   - bộ điều khiển: có fact từ `controllerSheetFacts` cùng trường.
   Trường không có `key` (chưa có code đọc) thì không kiểm tự động được: ghi "lưu ý" và bắt buộc `makerChecked` không rỗng.
7. Trùng: hai bản ghi cùng `part + key + field + cond` (với `ratings`: cùng điện áp, tần số, mức, cấp) →
   - cùng giá trị: lỗi "trùng", giữ một bản (bậc nhỏ hơn; cùng bậc thì `accessedAt` mới hơn);
   - khác giá trị: lỗi "mâu thuẫn". Hai nguồn đơn lẻ nói khác nhau thì không bản nào đủ tin; bỏ cả hai, hoặc Khoa chọn (Q4).
8. `makerChecked`: mỗi `supplierId` có hồ sơ, mỗi `n` có trong `sources` của hồ sơ đó.

Lưu ý (không chặn):
- Khoá không có trong danh mục (không NCC nào chào model đó): giá trị không xuất hiện ở đâu cho tới khi có NCC chào.
- Bậc 3 trong khi bản ghi khác của cùng họ model có bậc 1 / 2: có thể còn nguồn tốt hơn.

Khi sau này tờ hãng ghi cùng trường: lỗi 6 làm CI đỏ ở chính PR thêm tờ hãng. Như vậy người thêm tờ phải xoá bản ghi một nguồn trong cùng PR. Nếu Khoa muốn PR tờ hãng không bị chặn thì hạ thành "lưu ý" và để bản chuẩn tự bỏ (Q5).

## 3. Bản chuẩn và web hiện dấu riêng thế nào; giá trị nào thắng

Bản chuẩn (`spec-standard.mjs`, `standardOf`):
- Đọc `one-source.json` sau khi gộp xong số của nhà cung cấp và tờ hãng.
- Thêm giá trị vào đúng trường của doc `engine:KEY` / `alternator:KEY` / `controller:KEY` với dấu riêng:
  `{ value, unit, cond, missing, raw: <quote đầu>, src: { oneSource: "<id>", url, level }, origin: "one-source", suppliers: 0 }`.
  `suppliers: 0` vì không NCC nào ghi; bản chuẩn hiện xếp theo `suppliers` nên giá trị này tự đứng cuối trường.
- Doc chỉ có cho model có trong danh mục (như hiện nay). Model chỉ có giá trị một nguồn mà không NCC nào chào: không sinh doc.
- `hashOf` đổi theo nội dung nên doc có giá trị mới tự được đăng lại; không cần đổi `post`.
- `statsOf` đếm riêng số giá trị `origin: "one-source"` để thấy độ phủ thật của tờ hãng.
- `spec-value-check.mjs` chạy trên mọi giá trị nên cũng chạy trên loại này (không đổi gì).

Thắng / thua (đề xuất):
- Tờ hãng ghi trường này (cùng điều kiện) → chỉ số tờ hãng. Bộ kiểm báo bản ghi một nguồn thừa (mục 2.6); nếu vì lý do nào đó bản ghi còn lại thì `standardOf` vẫn bỏ nó, không hiện.
- Tờ hãng không ghi, NCC ghi → hiện cả hai, mỗi giá trị một dòng như hiện nay; giá trị một nguồn mang dấu. Không cái nào "thắng": bản chuẩn hiện không chọn thắng giữa các NCC, chỉ xếp theo số NCC.
- Hai bản ghi một nguồn mâu thuẫn → không hiện (bộ kiểm đã chặn).

Web (chưa có, phụ thuộc bước 5 của chuẩn hoá: web đọc `spec_std`):
- Giá trị `origin: "one-source"` hiện nhãn riêng, ví dụ "1 nguồn internet (bậc 2: bản hãng do bên khác đăng lại)", kèm URL và câu trích khi bấm.
- Không gộp chung dòng với số NCC / tờ hãng dù cùng số (luật `sameValue` không áp qua ranh giới nguồn này).
- Bộ lọc, đếm "số NCC ghi" không tính giá trị này.

Gợi ý cấu hình, phần hiển thị cho agent (không phải chấm điểm):
- `catalogMd` in dòng riêng sau các fact của model: `- [MỘT NGUỒN INTERNET, bậc N, không phải tờ hãng] <trường>: <giá trị> — <url> "<câu trích>"`.
- Đọc từ `one-source.json`, KHÔNG nhét vào `facts` của `modelFacts` (nhét vào là thành phiếu số đông, thành nguồn của `makerSheetChecks`).

## 4. Gợi ý cấu hình có dùng để chấm điểm / loại ứng viên không

Không tự quyết. Các lựa chọn và tác động:

(a) Chỉ hiển thị (đề xuất mặc định cho bước đầu).
- `candidates`, `check` không đổi. Agent thấy giá trị trong catalog.md, có nhãn.
- Check của agent dựa vào giá trị này: code đặt "cần xác nhận" (không "đạt"), ghi URL. Cần một hàm nhỏ sau `check` nhận ra câu trích là của `one-source` (tương tự `placeHold`).
- Top 30 không đổi; không cần đo do-gop.

(b) Dùng để CỘNG điểm / xếp hạng, không dùng để loại.
- Ví dụ: đầu phát có định mức một nguồn đủ kVA được tính "tra được đầu phát" (+40 hiện có) hoặc một mức thấp hơn.
- Top 30 đổi theo độ phủ của `one-source.json` (giống lý do Khoa chưa bật luật A: thưởng theo độ phủ dữ liệu, không theo chất lượng máy).
- Phải đo do-gop trước / sau.

(c) Dùng cả để loại (như nguồn NCC).
- Giá trị một nguồn vào lá phiếu số đông (dung tích, xi lanh), `comprOff`, `makerAlts` / `makerAltFix` (đầu phát dưới mức kVA bị thay).
- Một nguồn sai là loại oan cả động cơ / đầu phát ở mọi gói. `makerAltFix` có thể thay đầu phát NCC chào dựa trên số chỉ một trang bên thứ ba nói.
- Phải đo do-gop và soát tay các dòng bị loại.

(d) Dùng để loại nhưng chỉ khi không có nguồn nào khác cho trường đó, và luôn kèm "cần xác nhận".
- Hẹp hơn (c), vẫn đổi top 30 ở các model chỉ có giá trị này.

Chấm đạt ở `check` (khác với chọn ứng viên): (a) chỉ cho "cần xác nhận"; (b')(c') cho "đạt" kèm ghi chú nguồn. Đề xuất: không bao giờ cho "đạt" thẳng từ giá trị một nguồn.

## 5. Chia PR (mỗi PR độc lập, theo thứ tự)

1. **Định dạng + bộ kiểm.** `suppliers/one-source.json` (rỗng `[]`), `suppliers/one-source-check.mjs`, gọi từ `verify.mjs`, test `one-source.test.mjs` (ca: câu trích thiếu số, đè tờ hãng, trùng, mâu thuẫn, sai hãng của khoá). Ghi quy tắc vào `suppliers/CLAUDE.md`. Không chạm `candidates`.
2. **Dữ liệu đầu tiên (Leroy-Somer LSA 46.2 / 44.2 / 51.2).** Cần phiên có mạng: lưu tệp nguồn, đọc nhãn cột của từng số TỪ CHÍNH TRANG, ghi bản ghi; không đọc được nhãn thì không ghi. Chỉ dữ liệu. Không chạm `candidates`. Phụ thuộc PR 1 và câu Q1 (abyaran là bậc 2 hay đủ để vào hồ sơ như 1021).
3. **Bản chuẩn.** `spec-standard.mjs` đọc `one-source.json`, thêm `origin` / `src.oneSource`, luật thắng ở mục 3, `statsOf` đếm riêng; xem lại `spec-standard-check.mjs` (nó kiểm các lần đọc catalog qua `audit`, đòi `raw` nằm trong dòng nguồn; giá trị một nguồn không đi qua `audit`, chưa rõ có cần sửa không) và thêm kiểm riêng: `raw` của giá trị một nguồn nằm trong tệp nguồn của nó; test. Không chạm `candidates`.
4. **Hiển thị cho agent + hạ check.** `catalogMd` in dòng có nhãn; sau `check`, check dựa vào câu trích một nguồn thành "cần xác nhận" (lựa chọn (a)); `config-prompt.md` nói cùng luật; test `regress-config` (fixture không có giá trị một nguồn thì không đổi). Chạm `check` và `catalogMd`, KHÔNG chạm `candidates`.
5. **(Chỉ khi Khoa chọn (b), (c) hoặc (d).) Ứng viên.** CHẠM `candidates` (và có thể `makerAlts` / `makerAltFix`). Kèm cờ tắt `GENBID_ONE_SOURCE=0`, đo do-gop gốc ↔ nhánh trên cùng bidhist, liệt kê dòng đổi.
6. **Web.** Nhãn "1 nguồn internet" ở màn hiện bản chuẩn. Phụ thuộc bước 5 của chuẩn hoá (web đọc `spec_std`), chưa có.

## 6. Câu hỏi cho Khoa

Q1. Bản hãng do bên khác đăng lại: ranh giới với tờ hãng?
- Hiện tại: bản do đại lý biết rõ đăng (Depco, woodstockpower) đã vào hồ sơ hãng như tờ hãng (1021, 1022). Bản do bên không rõ đăng (abyaran.com, SlideShare) chưa vào.
- Đề xuất: giữ như hiện tại. Đại lý biết rõ + tài liệu nguyên vẹn (mã tài liệu, ngày phát hành của hãng) = tờ hãng. Bên không rõ = giá trị một nguồn bậc 2. Không đổi gì với 1021 / 1022.

Q2. Bậc 1 "trang hãng": nếu trang của chính hãng ghi giá trị thì đó đã là tài liệu hãng?
- Đề xuất: đúng. Trang trên tên miền của hãng vào hồ sơ hãng như nguồn thường (tier A). Bậc 1 trong `one-source.json` chỉ dùng cho trang hãng không lưu được thành nguồn của hồ sơ (ví dụ hãng chưa có hồ sơ và Khoa chưa muốn tạo). Nếu Khoa muốn mọi giá trị ngoài tờ hãng đều vào `one-source.json` thì giữ cả ba bậc như quyết định.

Q3. Chọn phương án lưu: A (tệp riêng), B (khoá trong hồ sơ hãng) hay C?
- Đề xuất: A.

Q4. Hai bản ghi một nguồn ghi KHÁC nhau cho cùng model + trường + điều kiện thì sao?
- Đề xuất: không hiện cái nào, bộ kiểm báo lỗi, ghi lại cả hai URL trong ghi chú của phiên. Lựa chọn khác: bậc nhỏ hơn thắng.

Q5. Khi thêm tờ hãng mà tờ đó ghi cùng trường: chặn CI cho tới khi xoá bản ghi một nguồn, hay chỉ báo và bản chuẩn tự bỏ?
- Đề xuất: chặn (lỗi). Dữ liệu sạch, người thêm tờ thấy ngay. Nếu tờ hãng ghi khác số một nguồn, ghi lại trong báo cáo của PR (cho biết nguồn bậc đó đáng tin tới đâu).

Q6. Gợi ý cấu hình dùng giá trị một nguồn tới đâu: (a) chỉ hiển thị + "cần xác nhận", (b) cộng điểm, (c) loại như nguồn NCC, (d) loại khi không có nguồn khác?
- Đề xuất: (a) trước. Chỉ xét (b) / (d) sau khi có đủ bản ghi để đo do-gop. Không chọn (c).

Q7. Ở `check`, giá trị một nguồn có bao giờ cho "đạt" không?
- Đề xuất: không. Luôn "cần xác nhận", ghi URL và bậc.

Q8. Trường bảng (`ratings` đầu phát): một bản ghi là một dòng định mức (một điện áp, một mức, một cấp), hay lưu cả trang rồi cho bộ đọc hiện có (`lsRatings`) đọc và đánh dấu mọi dòng ra?
- Đề xuất: bước đầu mỗi bản ghi một dòng, câu trích + câu tiêu đề cột. Lưu cả trang và dùng bộ đọc chỉ khi có nhiều trang cùng khuôn (LSA 46.2 / 44.2 / 51.2 có thể là trường hợp này); làm ở PR riêng sau PR 2.

Q9. Model có giá trị một nguồn mà chưa NCC nào chào: có được lưu không?
- Đề xuất: được lưu (bộ kiểm chỉ "lưu ý"), không hiện ở đâu cho tới khi có NCC chào.

## 7. Chưa làm / chưa kiểm

- Không chạy code nào; mọi tên hàm, tệp ở trên đọc từ `origin/main` 028ab6be.
- Chưa thử `fetch-source.mjs one-source …` với PDF.
- Ba giá trị Leroy-Somer chưa ghi được dưới bất kỳ phương án nào khi chưa đọc nhãn cột từ chính trang (báo cáo `dau-phat-leroy-tim.md` mục 10).
