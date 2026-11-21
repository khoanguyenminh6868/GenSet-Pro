# bdk-ds-3: datasheet ComAp + loại BĐK DEIF / easYgen (22/11/2026)

PR DRAFT https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1070, nhánh `bdk-ds-3`, SHA `61490493`, từ main `65dd6cec`. Chưa merge. Đo: `dau-vao\bdk-ds-3\` (`dem-facts.mjs`, `loai.mjs`, `kinds-all.mjs`, `*-truoc/sau.json`, `spec-diff*`).

## A. Datasheet
**DSE8610**: hồ sơ `deep-sea-electronics` đã có "Datasheet: DSE8610 MKII Synchronising & Load Sharing" và "DSE8620 MKII" từ trước (PR #977/#978 hoặc sớm hơn). Không thêm. DSE8610 không-MKII không có tờ riêng.

**Model ComAp NCC chào** (đếm NCC trong `suppliers/cn/`, không tính comap / comappower):
| Model | NCC | Datasheet |
|---|---|---|
| AMF20 (7 NCC), AMF25 (10), AMF8 (3), AMF9 (1), MRS16 (2; thêm denyo "InteliLite 4 MRS16") | | ĐÃ CÓ (IL4 AMF 8/9/20/25, MRS 16) từ trước |
| InteliGen NT (4), NTC (1), 1000 (1), "InteliGen" trơn (4) | | ĐÃ CÓ |
| InteliSys (1: jichai-huanneng, "InteliSys Gas") | | MỚI [1018] InteliSys Gas; [1017] InteliSys NTC BaseBox |
| InteliMains (1: nanni-industries, chỉ trong dòng tương thích) | | MỚI [1019] InteliMains NTC BaseBox |
| InteliDrive (1: genesal-energy, "DCU Marine") | | MỚI [1020] InteliDrive DCU Marine |
| InteliLite NT AMF20 (1: gordon-power), MRS10 (2: acepow-fuan, dagus-fuan), InteliLite (NT) MRS15 (1: stephill) | | KHÔNG CÓ datasheet trên trang hãng (xem dưới) |

Nguồn: trang sản phẩm comap-control.com (link từ kết quả tìm kiếm, không đoán), tệp `/productfile/<id>`: [1017] f5a4bec1…, [1018] 58d739f2…, [1019] 7eea903b…, [1020] 5a8a95a3… (trang hãng bản fr, cùng id). Không có 403.

**Không có datasheet (hãng chỉ ghi manual / brochure)**: trang InteliLite NT AMF 20 (đã ngừng bán, thay bằng IL4 AMF 9) và NT MRS 10 không có mục "Datasheet", chỉ Manuals (Reference Guide 4,6 MB, Operator Guide), Software, Brochures. InteliLite NT MRS 15: không thấy trang trên danh sách InteliLite của hãng (chưa tìm sâu hơn). Không lấy Reference Guide làm datasheet (cần điều phối quyết, giống DSE7310 manual #1032). Không nguồn nào ngoài trang hãng được dùng. Khoa không cần tải tay.

**Vấn đề gắn khoá** (đo `dem-facts.mjs`, mọi model BĐK, gốc ↔ nhánh): chỉ 3 khoá đổi: `INTELISYS` 0→192 (Gas), `INTELISYSNTC` +192, `INTELIMAINSNTC` +192, `INTELIDRIVE` +184; 0 khoá khác đổi. Hai chỗ chưa gắn vào model danh mục: danh mục có `INTELIDRIVEDCUMARINE` nhưng `controllersIn` đọc tờ thành `INTELIDRIVE` (catalog.js, không đụng); InteliMains / InteliSys NTC chưa có mục trong danh mục. Nên các dòng nằm trong `modelFacts` nhưng không tới model danh mục nào. Cũng thấy: model NCC ghi "AMF25 / AMF8 / AMF9 / IG1000 / MRS16" (khoá `AMF25`…) có 0 dòng datasheet vì tờ nằm ở khoá `INTELILITE4AMF25`…; việc ghép khoá là chuyện catalog.js, chưa làm.

## B. Loại BĐK rỗng (DEIF / Woodward, đo `loai.mjs`)
Trước: 25 model DEIF + Woodward trong hồ sơ, 15 rỗng. Rỗng và lý do:
| Model | NCC | Nguyên nhân | Xử lý |
|---|---|---|---|
| easYgen-1700 | 0 | tờ không ghi riêng; ghi "1000 Series of AMF genset controllers", bảng tiêu đề nêu 1400/1600/1700/1800 | SỬA → amf |
| easYgen-3100, 3200 | 0 | tờ guideform [1003] không có cụm "paralleling controller"; ghi "peer-to-peer system with up to 32 synchronous … generators" | SỬA → sync |
| easYgen-3500XT | 1 | datasheet có loại (sync) nhưng khoá `EASYGEN3500`, NCC ghi XT | SỬA (`kindOf` bỏ XT) → sync |
| easYgen-1000, 3000 | 0 | tên dòng, không phải model | để rỗng |
| DEIF AGC-4 (Mk II) | 0 | tờ "Genset, Mains, BTB, Group, Plant controller": nhiều chế độ, không nêu loại | để rỗng |
| DEIF AGC-200 và AGC-212/213/222/232/233/242–246 | 0 | tờ [1002] nhiều biến thể; có chú thích "AGC 213 Mains failure, …" nhưng PDF vỡ tên model qua ô bảng ("\| AGC \| 213 Mains failure,") nên bộ đọc theo dòng không đọc chắc được | để rỗng (cần đọc tay nếu muốn) |
| DEIF "AGC" trơn | 1 | NCC không ghi model | để rỗng |
Đã có: AGC-150 amf, SGC-420 amf, easYgen-1400/1600/1800 amf, 3400/3500 sync.

Cách sửa: `ctl-module.mjs` (cụm UNIT sync thêm "peer-to-peer system with up to N synchronous"; (c) áp cho model của tiêu đề mà dòng không nói loại khi model anh em đã có loại; `kindOf` bỏ hậu tố XT). Test `ctl-amf.test.mjs` cập nhật. `suppliers/CLAUDE.md` sửa đoạn "CHƯA đọc được".

Kiểm chéo toàn bộ `ctlKinds` (mọi hãng, gốc ↔ nhánh, `kinds-all.mjs`): 47 → 53 khoá; 6 khoá mới, 0 khoá đổi hay mất: EASYGEN1700 amf, EASYGEN3100 sync, EASYGEN3200 sync (đúng ý), INTELISYSNTC sync (tờ mới "paralleling gen-set controller"), và HGM6100N / HGM6100U start (phụ: tên dòng SmartGen "HGM6100N SERIES" ở tiêu đề, không trùng model thật; vô hại nhưng là hiệu ứng của luật (c) mới).

## Kiểm
- `node --test suppliers/*.test.mjs`: 1466, qua hết. (Một lượt chạy đầu hỏng đúng ca `ctlKinds` vì test cũ còn khẳng định easYgen-1700/3100/3200 rỗng; đã cập nhật.)
- `verify.mjs`: 435 bản ghi, 0 lỗi. `spec-diff` (gốc `65dd6cec`): 61.863 → 61.863, 0 đổi / mất / thêm, đảo vai 0 → 0.
- `quality --check` không chạy (không đổi `web/catalog.js`, `spec-norm.js`).

## Chưa kiểm / giao điều phối
- Top 30 ứng viên và điểm cấu hình: CHƯA đo. Đổi loại BĐK easYgen (1700 / 3100 / 3200 / 3500XT) và 4 tờ ComAp mới có thể đổi chỗ +50 / +40 điểm BĐK; deif / woodward đang `status: incomplete` nên bot bỏ cả hồ sơ khi nạp NCC (bẫy trong CLAUDE.md) → khả năng đổi rất nhỏ, nhưng cần đo cloud để chắc. Ca dùng loại: ctlKinds chạy trên mọi hồ sơ `controller_maker`.
- Nguồn trong repo công khai: [1017–1020] mỗi tệp ~200 dòng, cùng cỡ các nguồn datasheet ComAp đã có.
- Câu hỏi cho điều phối: có chấp nhận Reference Guide InteliLite NT (manual) làm nguồn cho AMF20 / MRS10 / MRS15 không? Không làm khi chưa có lệnh.
