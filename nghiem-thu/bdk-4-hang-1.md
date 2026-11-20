# Datasheet bộ điều khiển 4 hãng (DEIF, Woodward, Datakom, SICES): nghiệm thu 1

Ngày 20/11/2026. Nhánh `bdk-4-hang` (worktree `wt-bdk-4-hang`, từ `origin/main` d70bdf45). PR DRAFT: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/978.
Script đo + đầu ra: `genbid-work\dieu-phoi\dau-vao\bdk-4-hang\` (`dem-bdk.mjs`, `dem-facts.mjs`, `facts-truoc.json`, `facts-sau.json`, `spec-diff-*`).

## Tệp đổi
`suppliers/cn/{deif,woodward,datakom,sices}.json` (thêm `specTables`, `checkedAt` → 20/11), `suppliers/datasheets/{...}.json` (mới), `suppliers/sources/{deif 1001–1004, woodward 1001–1003, datakom 1001–1003, sices 1001–1003}.md` (mới). Không đụng `web/catalog.js`, `config-bot.mjs`, `schema.json`, `deep-sea-electronics`, `comap`.

## Đã lưu (nguồn → bảng "Datasheet: …")
| Hãng | n | Model | URL | Chức năng thấy trong tài liệu |
|---|---|---|---|---|
| DEIF | 1001 | AGC 150 (Generator / Mains / BTB) | deif-cdn-umbraco.azureedge.net/media/s4od5hvz/agc-150-generator-mains-btb-data-sheet-4921240618-uk.pdf (link từ deif.com/documentation) | khởi động / PMS, CAN, RS-485 Modbus, đo, bảo vệ |
| DEIF | 1002 | AGC 200 | deif.com/media/xwxfwh5d/agc-200-data-sheet-4921240362-uk.pdf | như trên |
| DEIF | 1003 | SGC 420 Mk II | deif-cdn…/hbtn5m3b/sgc-420-mk-ii-data-sheet-4921240650-uk.pdf | AMF, RS-485, IP65 mặt trước |
| DEIF | 1004 | AGC-4 Mk II | deif-cdn…/dtijzdie/agc-4-mk-ii-data-sheet-4921240614-uk.pdf | như AGC 150 |
| Woodward | 1001 | easYgen-1400/1600/1700/1800 | woodward.com/products/wp-content/uploads/sites/3/2024/08/B37686A_H.pdf | AMF, Ethernet + SD card |
| Woodward | 1002 | easYgen-3400XT/3500XT | …/2024/08/B37896A_A.pdf | |
| Woodward | 1003 | easYgen-3100XT/3200XT-P1 | …/2024/08/37620_NEW.pdf | |
| Datakom | 1001 | DKG-309 (sách hướng dẫn V-29) | datakom.com.tr/upload/Files/309_USER.pdf | AMF, RS-232, modem GSM tuỳ chọn, SMS |
| Datakom | 1002 | DKG-307 (sách hướng dẫn V-42) | datakom.com.tr/upload/Files/307_USER.pdf | |
| Datakom | 1003 | DKG-116 | datakom.com.tr/upload/Files/116_DATA.pdf | khởi động tay / từ xa, IP65 mặt trước (IP30 mặt sau) |
| SICES | 1001 | GC600 | meccalte.com/downloads/GC600_Datasheet_EN_REV._1.8.pdf | |
| SICES | 1002 | GC315 (Plus / Link) | meccalte.com/downloads/MAU7134_GC315_Controller_Datasheet_3_WEB.pdf | AMF, USB, RS232, RS485 Modbus RTU, Ethernet Modbus TCP, GPRS |
| SICES | 1003 | GC315 / GC400 (sách kỹ thuật) | meccalte.com/downloads/EAAM045629EN.pdf | |

Ghi chú nguồn SICES: `sices.eu` không có datasheet bộ điều khiển (trang tải xuống dựng bằng JS, chỉ thấy panel / bơm nhiên liệu). Ba tệp lấy từ **meccalte.com** (Mecc Alte, chủ sở hữu SICES theo nguồn 6001 đã lưu). Đây là điểm cần phiên điều phối quyết có nhận là "chính hãng" không.
Tên URL lấy từ kết quả tìm kiếm / trang tài liệu của hãng, không đoán. Chức năng ở cột cuối đọc nhanh từ chữ nguồn, chưa bóc từng dòng (modelFacts tự gắn cả dòng).

## Lệnh đã chạy + kết quả
- `maker-datasheets.mjs <id> <pdf>` cho 4 hãng → `merge-specs.mjs <id>` → `verify.mjs`: **435 bản ghi, 0 có lỗi**.
- `node --test suppliers/datasheets.test.mjs schema-keys.test.mjs controllers.test.mjs`: 10 qua, 0 lỗi.
- `spec-diff.mjs git:d70bdf45… .`: **60.073 → 60.073 bản ghi, 0 đổi / mất / thêm; đảo vai 0 → 0.** Không bản ghi NCC khác đổi.

## Số dòng datasheet `modelFacts` gắn cho model bộ điều khiển (đo, `dem-facts.mjs`)
| Model (danh mục) | Trước | Sau |
|---|---|---|
| DEIF AGC150 | 0 | 700 |
| DEIF SGC-420 | 0 | 520 |
| Datakom DKG-309 | 0 | 700 |
| Datakom DKG-116 | 0 | 75 |
| Woodward easYgen-1800 | 0 | 218 |
| DEIF "AGC" (NCC không ghi số) | 0 | 0: không có model để gắn |
| Woodward easYgen-3500XT | 0 | 0: khoá `controllersIn` là EASYGEN3500 (bỏ hậu tố XT), khoá danh mục EASYGEN3500XT; dòng nằm ở `controller:EASYGEN3500` (149 dòng) |
| SICES GC310, GC315Plus, GC350, GC400, GC500Plus, GC600, DST4602Evolution | 0 | 0: `catalog.js CONTROLLERS` không có mục SICES nên `modelFacts` không đọc được bảng; ngoài phạm vi (cấm sửa bộ đọc). GC310 / GC350 / GC500Plus / DST4602Evolution còn chưa có datasheet |
Datasheet có nhưng model chưa ở danh mục NCC (chờ NCC ghi): AGC 200 (700), AGC-4 (700), DKG-307 (700), easYgen-1400 / 1600 / 1700 (205 / 218 / 203), easYgen-3100 / 3200 / 3400 / 3500 (143 / 1 / 143 / 149).

Cách gắn: tiêu đề bảng do `maker-datasheets.mjs` tự chọn sai ở nhiều tệp ("DATA SHEET", câu giữa trang…), nên **tôi sửa tay tiêu đề** trong `datasheets/<id>.json` trước khi `merge-specs` thành tên model + tên hãng lấy từ chính tài liệu (vd. "Datasheet: DEIF AGC 150 Generator, Mains, and BTB"). `controllersIn` đòi chữ "deif" / "woodward" trong dòng tiêu đề nên tên hãng là bắt buộc. Dòng bảng không sửa.

## 3 mẫu đối chiếu nguồn
1. DEIF SGC 420 Mk II: `sources/deif/1003.md` dòng 225 "Automatic mains failure (AMF)"; dòng 464 "| Protection degree | IP65 (front of module when installed into the control panel".
2. Datakom DKG-116: `sources/datakom/1003.md` dòng 71 "IP Protection: IP65 (front panel), IP30 (rear)".
3. SICES GC315: `sources/sices/1002.md` dòng 42 "GC315 Plus version with RS232 and (insulated) RS485 serial ports"; Woodward easYgen-1800: `sources/woodward/1001.md` dòng 36 "… sion capability, Ethernet and SD card connectivity".

## Rủi ro / quay lui
- Sửa tay tiêu đề bảng: đổi chữ chỉ trong tiêu đề, không ở dòng thông số; revert = bỏ commit.
- Datakom 309 / 307 là sách hướng dẫn (700 dòng đầu), không phải datasheet; chức năng truyền thông có nhưng lẫn mô tả cài đặt. `sources/sices/1003.md` rất dài (11 nghìn dòng).
- Nhận meccalte.com cho SICES: nếu không chấp nhận, bỏ 3 bảng của `sices` (cn + datasheets + sources) bằng `git revert` phần SICES.
- Bảng chưa đọc được bởi bộ đọc `catalog.js` cho SICES, easYgen-…XT: cần việc riêng sửa `controllersIn` (không làm ở đây).

## Việc chưa kiểm được
- Chưa bóc từng chức năng (AMF, đo lường, bảo vệ, nhật ký, ngôn ngữ, IP) cho mọi model; mới đối chiếu mẫu. SICES GC600 / easYgen-3xxxXT / AGC 200 chưa mở đọc chức năng.
- Chưa tìm datasheet: SICES GC310, GC350, GC500Plus, DST4602Evolution; Datakom DKG-207; Woodward easYgen-3000XT (B37574_U hết thời gian tải 60 s).
- Chưa chạy `regress-config` / toàn bộ `node --test` (chỉ dữ liệu, bộ đọc không đổi; spec-diff 0 đổi).

## Cần ghi nhớ
- Bẫy mới (đã đưa vào `suppliers/CLAUDE.md` trong PR): `maker-datasheets.mjs` chọn tiêu đề sai cho datasheet DEIF / Woodward, phải sửa tay trong `datasheets/<id>.json` trước `merge-specs`; `controllersIn` DEIF / Woodward cần chữ tên hãng ngay trong dòng tiêu đề.
- Việc đề xuất: thêm SICES vào `CONTROLLERS` của `catalog.js` và sửa hậu tố XT của easYgen; tìm tiếp datasheet các model còn thiếu.
