# Thiết kế lưu giá trị "2 nguồn internet" (24/11/2026), CHỈ THIẾT KẾ

Phiên con của điều phối, chỉ đọc. Mọi `tệp:dòng` đọc ở `origin/main` = `2e678d48`. Luật Khoa 24/11/2026: hai nguồn ĐỘC LẬP, cùng
giá trị, mỗi nguồn URL + câu trích, đánh dấu "2 nguồn internet"; thứ tự: trang hãng → bản hãng đăng lại → 2 nguồn. Sau 4 lượt:
0 trường đủ điều kiện (`nghiem-thu/hai-nguon-internet.md`).

## 1. Lưu ở đâu

Cấu trúc một mục (giống cho cả ba phương án):
```json
{ "part": "controller", "model": "HGM9320", "field": "dc_supply",
  "value": "8-35", "unit": "V",
  "sources": [ { "n": 7001, "raw": "DC(8-35)V", "quote": "DC Supply DC(8-35)V" },
               { "n": 7002, "raw": "8 to 35 VDC", "quote": "operates from 8 to 35 VDC supply" } ],
  "independence": "7001 trang tích hợp tự viết; 7002 bài đo của diễn đàn; không chung bảng",
  "checkedBy": "agent <phiên>", "reviewed": null }
```
`field` = `id` của `spec-fields.json` (vd `controller.dc_supply`, `engine.bore_stroke`); `raw` = chữ nguyên văn của giá trị, nằm trong
`quote`; ngày lấy từ dòng `Accessed:` của tệp nguồn (như `build.mjs` đọc URL / ngày từ tệp, `suppliers/build.mjs:2-3`).

| | A. Tệp riêng `suppliers/two-source.json` + `sources/two-source/<n>.md` | B. Khoá `twoSource[]` trong hồ sơ hãng `cn/<maker>.json`, nguồn 7001+ ở `sources/<maker>/` | C. Nguồn 7001+ ghi thành `specTables` (bảng giả) |
|---|---|---|---|
| Mẫu có sẵn | `engine-traits.json` + `trait-source.mjs` + `engine-traits.test.mjs` (`suppliers/CLAUDE.md:9`, khối 100 số / hãng `MAKE_BLOCK`, `engine-traits.test.mjs:11`) | `manufacturing[]` nguồn 6001+ (`suppliers/CLAUDE.md:8`, kiểm ở `verify.mjs:88-107`) | specTables thường (`verify.mjs:124-130`) |
| Ai kiểm | test riêng (verify.mjs không đọc tệp này: `loadAll` chỉ đọc `cn/`, `verify.mjs:149-155`) | `verify.mjs` + `schema.json` (khoá mới phải khai, `verify.mjs:44-47`) | verify như bảng NCC |
| Ai đọc | spec-standard, config-bot (thêm code) | spec-standard, config-bot (thêm code) | catalog đọc NGAY như dòng NCC |
| Ưu | độc lập với hồ sơ, có cả hãng chưa có hồ sơ | nguồn có sẵn cơ chế `sources[]` (url, tier, file, quote, `verify.mjs:49-61`); hãng là chủ thể của thông số; cùng chỗ với tờ hãng 1001+ nên dễ thấy "đã có tờ hãng thì thừa" | không cần code đọc |
| Nhược | thêm một hệ kiểm song song; khối số theo hãng phải tự quản | cần hồ sơ hãng; nguồn tier C trong hồ sơ (hồ sơ chỉ có C thì buộc `confidence: low`, `verify.mjs:145`); trang NCC trên web có thể liệt kê thêm nguồn 7001+ (chưa kiểm web có hiện `sources[]` không) | SAI: catalog tính như một NCC, không có dấu, bị cộng phiếu số đông, 2-nguồn đè được NCC → loại |

**Chọn B.** Lý do: (1) `verify.mjs` đã là cổng CI của dữ liệu NCC, mở rộng như `manufacturing[]` là ít mã nhất và đúng tinh thần "kiểm
bằng code"; (2) thông số là của MODEL của hãng, hồ sơ hãng là nơi tự nhiên, tờ hãng (1001+) và 2-nguồn (7001+) đứng cạnh nhau nên khi có
tờ hãng, kiểm "thừa" chỉ cần đọc một hồ sơ; (3) không lẫn với dữ liệu NCC (khoá riêng, catalog không đọc khoá lạ). Hãng chưa có hồ sơ
(chưa kiểm động cơ Doosan / Yuchai…) → tạo hồ sơ hãng theo quy trình NCC trước (`suppliers/CLAUDE.md:7`), không lưu mồ côi.
Số nguồn: thêm dải **7001+ = nguồn internet thứ ba (luật 2 nguồn)** vào `suppliers/CLAUDE.md:6`.
Không dùng đề xuất cũ "bản chụp trong `genbid-work`" (`hai-nguon-internet.md`, mục Đề xuất): ngoài git thì CI không kiểm được.

## 2. `verify.mjs` kiểm gì bằng code

Khối mới trong `checkRecord` (cạnh `manufacturing`, `verify.mjs:88`), khoá cho phép như `MFG_KEYS` (`verify.mjs:18`):
1. `part` ∈ 4 phần, `field` là `id` có thật trong `spec-fields.json` của phần đó; `model` không rỗng; đúng 2 `sources`, hai `n` khác nhau,
   cả hai ≥ 7001 và có trong `rec.sources` (dùng `srcOk`, `verify.mjs:62-65`).
2. **Nguyên văn:** mỗi `quote` nằm trong tệp đã lưu của nguồn đó (cùng `norm`, `verify.mjs:28`, như `verify.mjs:59`); `raw` nằm trong
   `quote` (như contacts, `verify.mjs:76`); `quote` chứa tên model (khoá `CAT.keyOf`) HOẶC tệp nguồn chứa model trong ±2.000 ký tự quanh câu
   trích (tránh trích dòng của model khác cùng trang).
3. **Hai host khác nhau:** so tên miền gốc (bỏ `www.`, lấy 2 nhãn cuối; 3 nhãn với `com.cn`, `co.uk`, `com.vn`… — repo chưa có bảng hậu tố,
   chưa kiểm). Host lấy từ dòng `URL:` đầu tệp (sau chuyển hướng, `fetch-source.mjs:38`), không từ chữ gõ tay. Thêm: host KHÔNG được là
   `website` / `otherWebsites` của chính hồ sơ hãng (trang hãng thì là bước 1, không phải luật này).
4. **Cùng giá trị sau chuẩn hoá:** trường có `key` (`spec-fields.json`, vd `bore`, `disp`, `compr`) → đưa từng `raw` qua
   `SN.normalizeRecord` như bản chuẩn (`spec-standard.mjs:142-150`, `valueOf` `:59-87`); trường không `key` → `tidyText` / `joinKey`
   (`spec-standard.mjs:28-38`) + danh sách số `numsOf` (`spec-value-check.mjs:21`) + đơn vị ngay sau số. Hai bên phải ra cùng
   `value` + `unit`, và `value` của mục bằng giá trị đó. Bool: cả hai `raw` chứa từ khoá của trường (bảng nhỏ trong code, vd `rs485`:
   `/rs-?485/i`).
   Làm tròn: đề xuất dùng `roundCompat` (`config-bot.mjs:196-202`: làm tròn số dài về số chữ số của số ngắn ra đúng số ngắn và lệch ≤ 1 %;
   không nhận cắt cụt, không nhận cùng độ chính xác mà khác số, test `cand-disp-round.test.mjs:28-30`). Khi hai bên chỉ "tương thích làm
   tròn" (39,24 ↔ 39,2): lưu số NGẮN (số cả hai nguồn cùng ủng hộ) + `rounded: true`. → **cần Khoa quyết (điểm 2)**; nếu Khoa đòi y hệt
   thì bỏ nhánh này.
5. **Phát hiện chép (phần code làm được):**
   (a) tệp nguồn ghi thêm `SHA256:` của byte tải về (công cụ lưu mới, xem mục 5) → trùng = cùng một tệp → lỗi;
   (b) PDF: ghi `PDF-Title` / `PDF-Producer` / `PDF-CreationDate` (pdfinfo) → cả ba trùng → lỗi;
   (c) cửa sổ ±600 ký tự quanh hai câu trích: Jaccard trên cụm 5 từ ≥ 0,5 → lỗi "chép cùng bảng"; 0,3–0,5 → lưu ý;
   (d) ≥ 3 dòng liên tiếp quanh câu trích giống nhau sau `norm` (cùng thứ tự nhãn + giá trị) → lỗi;
   (e) cả hai cửa sổ chứa cùng mã tài liệu hãng (dạng `PI7B-13-TD-EN`, "USER MANUAL", tên hãng + "Technology/Ltd") → lỗi, ghi "đây là tờ
   hãng đăng lại → bước 2".
   Lượt 1 HGM9320 (smartgen-america / ats4pro / presertec cùng bảng "Technical Parameters") sẽ bị (c)/(d) bắt.
   **Không kiểm được bằng code** → do agent ghi `independence` (bắt buộc, ≥ 20 ký tự) và người / agent thứ hai ghi `reviewed`:
   chép rồi gõ lại khác định dạng; trang B chép từ trang A; hai đại lý cùng lấy brochure hãng nhưng trình bày lại; nguồn là đại lý của
   chính hãng (smartgen-america là nhà phân phối SmartGen: code không biết). Đề xuất: `reviewed` rỗng → verify chỉ LƯU Ý, bản chuẩn KHÔNG
   dùng mục đó (điểm 3).

## 3. Thứ tự ưu tiên

- Chỉ LẤP CHỖ TRỐNG, không bao giờ đè: trong `standardOf` (`spec-standard.mjs:216-236`), sau `bag.fields()` của doc `part:keyOf(model)`,
  mục 2-nguồn chỉ được thêm khi `fields[field]` CHƯA có giá trị nào (kể cả giá trị có `missing`; đề xuất: giá trị có `missing` vẫn là "có",
  điểm 4). Model chưa có doc (catalog không biết) → không tạo doc mới, verify lưu ý.
- Không cộng vào `suppliers` của giá trị (`Bag.add` đếm `src.supplierId`, `spec-standard.mjs:109`): `suppliers: 0`, `src: { supplierId:
  <maker>, n: [7001, 7002] }`, không có `table/row`.
- Khi sau này có tờ hãng (1001+) hay NCC ghi trường đó: tự động không dùng nữa (tính lại mỗi lần build, không cần xoá); verify ghi lưu ý
  "twoSource thừa: đã có giá trị từ nguồn …". Giá trị tờ hãng KHÁC giá trị 2-nguồn → ghi vào danh sách của bộ kiểm giá trị
  (`spec-value-check.mjs:1-3`, chỉ báo) để Khoa thấy luật 2-nguồn từng sai; tờ hãng luôn thắng.
- Bản hãng đăng lại (bước 2) KHÔNG thuộc khoá này: lưu như tờ hãng 1001+ (`maker-datasheets.mjs`), ghi URL đăng lại (Khoa đã chốt thứ tự).

## 4. Hiện ở bản chuẩn và dùng khi chấm

- Giá trị trong `fields` thêm `basis: "2-nguon-internet"` (+ `rounded: true` nếu có), `raw` = `raw` của nguồn thứ nhất, kèm `sources2:
  [{url, quote}, {url, quote}]` để web hiện hai câu trích. Giá trị thường KHÔNG có `basis` (mặc định = NCC / tờ hãng), nên hash các doc
  cũ không đổi (`hashOf`, `spec-standard.mjs:24`) → `--post` không ghi lại cả bảng.
- Hiện: bản chuẩn chưa có nơi đọc (`spec-standard.mjs:6`; web mới có bảng `spec_std`, `web/supabase/schema.sql:125-139`) → nhãn
  "2 nguồn internet" chỉ hiện khi bước 5 (web đọc `spec_std`) làm; đề xuất chữ nhãn: "2 nguồn internet — chưa có tờ hãng".
- Gợi ý cấu hình hiện KHÔNG đọc bản chuẩn: lấy số từ bảng NCC + tờ hãng qua `modelFacts` (`config-bot.mjs:826-850`). Muốn chấm thì
  thêm nguồn sự kiện thứ ba trong `modelFacts` có `basis`. Ba mức (**CẦN KHOA QUYẾT, điểm 5**, em không chốt):
  (a) "đạt" có ghi "(2 nguồn internet)"; (b) "cần xác nhận" — trạng thái `confirm` + `confirm: "document"` như nơi sản xuất
  (`config-bot.mjs:3997`, `:4046-4057`; `confirm` chỉ do code đặt, `:3525-3527`), tức đạt theo internet nhưng NCC phải gửi tờ;
  (c) chỉ hiện, không chấm. Em nghiêng (b). Giá trị 2-nguồn KHÔNG đạt yêu cầu: đề xuất "chưa rõ" (`unclear`), không loại cấu hình.

## 5. Quy trình cho agent và ước lượng

Quy trình: (1) kiểm trang hãng + tờ đăng lại trước (bước 1, 2; lượt 4 cho thấy trang hãng Stamford CÓ tờ cho 8 model "thiếu");
(2) tìm bằng `firecrawl_search` (`limit` nhỏ, `includeDomains`/`excludeDomains` bỏ domain hãng và đại lý đã biết); ưu tiên nguồn tự viết
(nhà tích hợp, bài đo, trang phụ tùng động cơ có bảng riêng); (3) lưu bằng công cụ MỚI `two-source-save.mjs <maker> <n> <url>` = gộp
`fetch-source.mjs` (đọc trực tiếp, pdftotext, `fetch-source.mjs:18-35`; KHÔNG có dự phòng Firecrawl) với dự phòng Firecrawl của
`trait-source.mjs:43-45`, thêm dòng `SHA256:` và `PDF-*`; PDF lớn tải thẳng + pdftotext, không quét bằng Firecrawl (lượt 1: 74 trang =
78 credit); (4) ghi mục + chạy verify; lỗi (c)/(d)/(e) thì bỏ, không "sửa" câu trích; (5) agent thứ hai đọc hai tệp và ghi `reviewed`.

Ước lượng từ 4 lượt (chỉ mới thử bộ điều khiển SmartGen / SICES và đầu phát Stamford; **động cơ chưa thử**):
- Bộ điều khiển, số (nguồn DC, kích thước, IP, nhiệt độ): gần như KHÔNG — mọi trang là bản chép brochure / manual hãng (HGM9320, GC315,
  HGM9210 IP55 chỉ 1 nguồn grandnparts).
- Bộ điều khiển, có / không (RS485, USB, J1939, AMF): THẤP–VỪA — trang bán hàng hay nêu, nhưng phần lớn cũng chép brochure (sẽ bị bắt ở 5c).
- Đầu phát (kVA theo winding / điện áp, cách điện, IP): gần như KHÔNG — chỉ có tờ hãng; mà trang hãng lại có tờ (lượt 4) → dùng bước 1.
- Động cơ (xi lanh, bore × stroke, dung tích, tỉ số nén): chưa kiểm; là loại DUY NHẤT có khả năng (trang phụ tùng / sửa động cơ tự lập
  bảng). Đề nghị một lượt thử 5 model động cơ thiếu trường trước khi viết code.
Kết luận cho Khoa: với bộ điều khiển và đầu phát, làm code bây giờ gần như không thu được giá trị nào; đáng làm chỉ nếu lượt thử động cơ
ra ≥ vài trường.

## 6. Điểm cần Khoa quyết

1. Chọn phương án B (khoá `twoSource[]` trong hồ sơ hãng, nguồn 7001+)? Hãng chưa có hồ sơ thì tạo hồ sơ hãng trước?
2. "Cùng giá trị": y hệt sau chuẩn hoá, hay nhận khác làm tròn theo `roundCompat` (lưu số ngắn + `rounded`)?
3. Độc lập phần code không kiểm được: bắt buộc agent thứ hai / Khoa ghi `reviewed` mới được dùng? Đại lý / nhà phân phối CHÍNH THỨC của hãng
   (smartgen-america, smartgen.mx) có bị coi là "cùng nguồn với hãng" (không tính) không? (em đề xuất: không tính.)
4. Lấp chỗ trống: trường đã có giá trị nhưng giá trị có `missing` (thiếu đơn vị / điều kiện) — coi là "đã có" (không lấp)?
5. Gợi ý cấu hình chấm giá trị 2-nguồn: (a) đạt, (b) cần xác nhận (em nghiêng), (c) không chấm.
6. Chạy trước một lượt thử động cơ (5 model) rồi mới làm code? (em đề xuất có, vì bộ điều khiển / đầu phát gần như không đủ nguồn.)

Chia PR nếu làm: PR1 `schema.json` + `verify.mjs` + `two-source-save.mjs` + test `two-source.test.mjs` + `suppliers/CLAUDE.md` (dải 7001+),
không dữ liệu; PR2 dữ liệu thử (mục đầu tiên, sau quyết 1–4); PR3 `spec-standard.mjs` lấp chỗ trống + `basis` + `sources2` + báo lệch vào
`spec-value-check`; PR4 config-bot `modelFacts` chấm theo quyết 5 (+ hiện nhãn khi web đọc `spec_std`, bước 5).
