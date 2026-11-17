# Nghiệm thu: HSMT nêu đích danh hãng / model TỔ MÁY (IB2600601812)

PR nháp: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/599 (nhánh `named-genset`, commit abc0cc2, từ main 60d8ad8 = sau #598). CI: 2 qua, 1 bỏ qua, MERGEABLE.
Bước 1 (chẩn đoán, số đo, phương án) ở mục cuối "Phụ lục: bước 1" — giữ nguyên.

## Tệp đã đổi
- `suppliers/named-genset.mjs` (mới):
  - `normMake` / `makesIn` / `sameMake`: bí danh + sai 1 ký tự, CHỈ để so. Câu trích và `makeRaw` giữ chữ HSMT ("Huyndai").
  - `modelKey` / `namesModel`: so model bỏ dấu cách, gạch, chấm, gạch chéo; không khớp vào mã dài hơn.
  - `namedGensetOf`: đọc từ yêu cầu `genset_make` / `genset_model` của agent (câu trích phải có trong HSMT), không có thì đọc bảng Mẫu 02B rồi các dòng của mục tổ máy.
    - Bỏ qua: mục động cơ, đầu phát, bộ điều khiển (kể cả mục con "+ Nhà sản xuất" dưới "- Động cơ"); danh sách nhiều hãng; gói dịch vụ / máy hiện có; chỗ trống; ô "Không yêu cầu".
    - "Tương đương" xét theo ô của chính yêu cầu, hoặc câu chung trong HSMT ("được phép chào … nhãn hiệu … khác", "thương hiệu, ký mã hiệu … để minh họa").
  - `namedSuppliers` / `makerOf`: NCC genset_oem của hãng nêu, hoặc NCC có bảng ghi model nêu.
  - `markNamed`: ghi `c.named` ("model" / "make") hoặc `c.equivalent` cho từng cấu hình, `result.named` {make, makeRaw, model, models, quoteMake, quoteModel, equivalent, found}, `result.namedWarn`, và một câu hỏi `clarify` do code tạo (chỉ khi agent chưa hỏi về hãng / model).
  - Cờ `GENBID_NAMED_SELLER=1` (mặc định tắt).
- `suppliers/config-bot.mjs`:
  - prep:
    - `hints.named`; thêm NCC của hãng nêu vào `grp`.
    - Mục input.md "Tổ máy HSMT nêu đích danh".
    - Tiêu đề ứng viên ghi bảng "(tổ máy HSMT nêu)".
  - `candidates`: dòng có model nêu (tiêu đề / dòng / bảng của dòng) bỏ qua dải công suất, tần số và viaCn (khi chỉ một model), +2000, không trừ điểm cỡ máy. Hãng nêu (NCC genset_oem của hãng) +300.
  - `check`:
    - `namedHere` / `namedCtx` (đọc lại từ chính bảng nguồn qua `sourceText`).
    - Cấu hình hãng / model nêu không bị lọc "chỉ NCC TQ" / ngoài nhóm.
    - Đưa lên trước khi cắt `MAX_CONFIGS` (lỗi mô phỏng B tìm ra: cấu hình thứ 7 bị cắt).
    - `markNamed` sau `clarifyOf`.
  - `rankConfigs`: `namedRank` là khoá đầu (chỉ khi có `result.named`); cấu hình named ngoài hạn mức 2/hãng.
- `suppliers/config-prompt.md`: bước 2 (model nêu trước, không tự gắn nhãn, không `not_met` chỉ vì khác hãng), bước 4 (tra trang thương hiệu / đơn vị cấp phép trước, quy tắc chỉ-NCC-TQ không áp cho dòng đó, `src.tier`), bước 5 (không `configs: []` chỉ vì thiếu hãng nêu), result.json `src.tier`.
- `suppliers/web-memo.mjs`: `modelKeysOf` thêm khoá ghép "mã + phần sau dấu cách" (DHY110K SE → DHY110KSE).
- `web/index.html`:
  - `cfgNamedHtml` ở đầu kết quả: hãng / model HSMT nêu; dòng "Model HSMT nêu: … — chưa có nguồn thông số" khi `found=false`; `namedWarn`. Câu trích chỉ hiện khi `SHOW_SRC`.
  - `cfgNamedChip` trên tiêu đề từng cấu hình: "Đúng model HSMT nêu", "Đúng hãng HSMT nêu", "Hàng tương đương", "Nguồn bên bán, chưa xác minh". Đã grep: không trùng tên hàm.
- `suppliers/named-genset.test.mjs` (mới, 11 test).

Theo 5 điểm điều phối: (1) cờ mặc định tắt: khi tắt thì bỏ cấu hình model nêu dựa trên trang bên bán và hiện "chưa có nguồn"; khi bật thì gắn `unverifiedSource`, mọi mục cao nhất là chưa rõ, không vào danh mục (luồng newCatalog không đổi). (2) "Tương đương" xét theo từng yêu cầu: IB2600601812 có cảnh báo. (3) Đã sửa khoá kho âm. (4) Chuẩn hoá chỉ để so. (5) Có test DHY110KSE bằng dữ liệu giả, và đã kiểm thêm bằng dữ liệu thật của #598.

## Lệnh kiểm + đầu ra thật
- `node --test suppliers/named-genset.test.mjs` → `# pass 11 # fail 0`.
- `node --test suppliers/*.test.mjs` → `# tests 504 # pass 504 # fail 0`.
- `GENBID_LOCAL_SUPPLIERS=1 node suppliers/config-bot.mjs prep --key IB2600601812 --out <scratch>/prep-1812b --origin all` (chỉ đọc). catalog.md:
  ```
  ### 1. bảng "DHY110KSE Diesel engine" (tổ máy HSMT nêu) — động cơ HY4A140Z-D25 (nguồn không ghi hãng), đầu phát không ghi
  - supplierId: hyundai-power-products, n: 5001, quốc gia: ES, độ tin cậy: medium, vai trò: genset_oem
    lý do xếp: tổ máy đúng model HSMT nêu đích danh
  ```
  (đo trước khi sửa tiêu đề; trước đó dòng in "(không ghi model tổ máy)"). Trước khi sửa code, cùng dữ liệu: không có dòng Hyundai nào trong 30 ứng viên. Nguyên nhân: bảng chỉ ghi 100 kW động cơ, không ghi kVA, nên rơi khỏi dải công suất; thêm vào đó NCC đặt tại ES bị lọc "chỉ NCC TQ".

## Hồi quy 13 configmatch (ĐO; `check` + `rankConfigs`, code origin/main 60d8ad8 so với code mới, cùng bản chụp `doc-cache\supplier.json` và chữ HSMT tải về)
Script: `scratchpad\reg.mjs`, đầu ra `reg-old.json` / `reg-new.json`.

| Gói | Kết quả | Ghi chú |
|---|---|---|
| IB2600574589, 581294, 581977, 586587, 592658, 594596, 599817, 603983, 604739 | **0 đổi** (JSON giống hệt) | 592658: ô Nhãn hiệu / Hãng sản xuất = "Không yêu cầu" → không áp |
| IB2600601812 | đổi | named Hyundai / DHY110K SE, found=false, cảnh báo, 6/6 "Hàng tương đương" |
| IB2600592684 (2 cỡ) | đổi | Fortugen FG-C33LS / FG-C525LS (theo từng cỡ), HSMT có câu chung cho phép thương hiệu khác → KHÔNG cảnh báo, 6 + 2 "Hàng tương đương" |
| IB2600595853 | đổi | Hãng sản xuất "Tổ máy phát điện Cummins", không model → cảnh báo, 1 cấu hình QSZ13-G3 (lắp ráp TQ) = tương đương. Xem rủi ro 1 |
| IB2600602880 | đổi | Hãng "Cummins (liên doanh sản xuất tại TQ)" theo yêu cầu agent → cảnh báo, 6BTAA5.9-G12 = tương đương. Xem rủi ro 1 |

Không đổi thứ hạng nào trong 4 gói đổi (mọi cấu hình cùng nhóm "tương đương"); chỉ thêm trường và nhãn.

## Mô phỏng IB2600601812 (ĐO, `scratchpad\sim.mjs`, kết quả `sim-A.json` / `sim-B.json`)
- A: kết quả đã lưu (15:50Z, 6 cấu hình hãng khác) chạy lại bằng code mới, NCC = doc-cache + hồ sơ #598:
  `named: {"make":"Hyundai","makeRaw":"Huyndai","model":"DHY110K SE","quoteMake":"3 Nhà sản xuất Huyndai","quoteModel":"4 Mã hiệu DHY110K SE","equivalent":false,"found":false}`; namedWarn có; 6/6 "TƯƠNG ĐƯƠNG"; câu hỏi làm rõ: giữ câu của agent (không thêm câu trùng).
  Thẻ web (dựng bằng node từ đúng hàm cfgNamedHtml / cfgNamedChip của index.html):
  `HSMT nêu đích danh tổ máy: Huyndai DHY110K SE (hãng Hyundai) Model HSMT nêu: Huyndai DHY110K SE — chưa có nguồn thông số. Các cấu hình dưới đây là hàng tương đương. HSMT nêu đích danh tổ máy Huyndai DHY110K SE và không ghi "hoặc tương đương" cho hãng / model: …` / chip ×6 "Hàng tương đương".
- B: thêm cấu hình agent sẽ viết từ ứng viên #1 (bảng DHY110KSE, NCC ES), đặt ở vị trí THỨ 7 → `#1 named=model HY4A140Z-D25 DHY110KSE hyundai-power-products`, #2–#6 tương đương, found=true, banner không còn dòng "chưa có nguồn". Lần đầu mô phỏng B ra cấu hình bị cắt ở giới hạn 6 → đã sửa + test riêng.
- Lượt agent thật sau khi merge sẽ có dòng ứng viên #1 này. Chưa chạy agent (brief cấm).

## 3 mẫu đối chiếu nguồn
1. HSMT IB2600601812 (`hsmtTextOf`, tab "Thông tin chung" Mẫu 02B): "3 Nhà sản xuất Huyndai 4 Mã hiệu DHY110K SE" và ô bảng `DHY110K SE	Huyndai	Huyndai	Trung Quốc hoặc tương đương` → "tương đương" chỉ ở ô xuất xứ.
2. Hồ sơ `suppliers/cn/hyundai-power-products.json` (#598), nguồn 5001: bảng "DHY110KSE Diesel engine", dòng "| Engine Model | HY4A140Z-D25" và "| Prime power | Kw | 100".
3. HSMT IB2600592684: "Bất kỳ thương hiệu, ký mã hiệu, xuất xứ (nếu có) trong tiêu chuẩn kỹ thuật chi tiết là để minh họa" → equivalent=true; "- Nhà sản xuất: FORTUGEN", "- Model máy phát điện: FG-C525LS"; mục con "+ Nhà sản xuất: Dongfeng Cummins (DCEC)" dưới "- Động cơ diesel:" không bị đọc thành hãng tổ máy.

## Quét bộ đọc trên 1.499 HSMT (`genbid-work\specs`, code + technicalSpecs, `scratchpad\scan3.txt`)
34 gói ra hãng/model. Xem tay: phần lớn đúng (Hyundai ×8 kể cả DHY125KSE / DHY34KSE, Denyo 100ES / 25ES, FADI FDB625VS3, Kohler, Honda, Kofo / Makawa…). Còn nhầm: IB2300144357 (máy DOOSAN hiện có của trường, gói bảo trì: đã bị `isServiceTender` chặn trước Gợi ý), IB2300010089 (lọc nhớt Cummins, gói vật tư: cũng bị chặn), IB2300298164 (model UCI274C là đầu phát), IB2400352866 (thêm mã BĐK PCC2100 vào models; model tổ máy C550D5 vẫn đúng). Trong check, nguồn chính là yêu cầu agent đọc.

## Rủi ro còn lại + quay lui
1. **Hãng không kèm model, khi HSMT viết quanh động cơ** (IB2600595853 "Tổ máy phát điện Cummins" kèm "Động cơ: Dongfeng Cummins/QSZ13G3"; IB2600602880 "Cummins liên doanh sản xuất tại TQ"): cấu hình lắp ráp TQ dùng động cơ Cummins bị gắn "Hàng tương đương" + cảnh báo. Đúng theo định nghĩa (hãng tổ máy ≠ hãng động cơ) nhưng có thể làm người dùng hoang mang. Cần điều phối quyết: giữ, hay coi "hãng tổ máy = hãng động cơ" là đạt hãng khi HSMT nêu động cơ cùng hãng.
2. NCC ngoài TQ của hãng nêu vào kết quả (đúng yêu cầu). Xuất xứ vẫn theo `genset_origin`: hồ sơ ES không ghi nơi sản xuất → "Cần chứng từ".
3. `sellerSrc` khi agent không ghi `src.tier`: trang có tên miền chứa tên hãng (hyundaipower-de.com) tính là của hãng, trang khác tính là bên bán. Một đại lý đặt tên miền theo hãng sẽ lọt.
4. Kho âm: chưa thêm cờ `named` cho mục "source" (điều phối chỉ yêu cầu sửa khoá). Hiện kho không có mục nào cho DHY110KSE. Các mục "source" ghi dưới quy tắc chỉ-NCC-TQ cũ của model nêu sẽ chặn lượt sau 90 ngày nếu có.
5. Quay lui: revert PR #599. Mọi nhánh mới chỉ chạy khi có `hints.named` / `namedHere` / `result.named`.

## Chưa kiểm được
- Chưa chạy agent thật (brief cấm). Lượt thật đầu tiên của IB2600601812 sau merge cần xem agent có viết cấu hình từ dòng DHY110KSE không và check có giữ nó không. Mô phỏng B cho thấy check giữ.
- Thẻ web chưa xem trong trình duyệt thật: chỉ dựng HTML bằng node từ đúng 2 hàm mới và kiểm cú pháp các khối script của index.html.
- Bot đang chạy (`config-bot.mjs run`) giữ code cũ: sau merge phải chờ lượt hiện tại thoát rồi mới Gợi ý lại gói này (đóng thầu 16/11).

---
## Phụ lục: bước 1 (chẩn đoán + đo, 12/11)
- Chẩn đoán 4 điểm của điều phối đúng (code + log agent: 2 WebSearch, chỉ thấy đại lý Úc, không lưu trang vì quy tắc chỉ-NCC-TQ, không tra trang thương hiệu; prompt bước 5 `configs: []`; không có nhãn tương đương).
- Phân tích 1.287 gói: 34 nêu hãng/model tổ máy (19 có "tương đương"); 13 configmatch: 3–4 gói nêu.
- Chính tả trong 1.507 HSMT: Huyndai 70, Perkin 19, Mitshubishi 8, Cumins 10.
