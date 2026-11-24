# Tờ hãng do nơi khác đăng lại → hồ sơ NCC (24/11/2026)

Nhánh `wt-to-hang-dang-lai` (PR nháp, không tự merge). Luồng: `maker-datasheets.mjs` → `merge-specs.mjs` → `verify.mjs`. Hồ sơ chỉ THÊM (so với origin/main: 0 bảng / nguồn mất).

## Nhận (3 tài liệu)
| Model danh mục | Hồ sơ / nguồn | URL (trang đăng lại) | Dòng nguyên văn trong tài liệu (tên hãng + model) |
|---|---|---|---|
| HGM9320 | smartgen, nguồn 1012 (bảng 1012) | https://doc.diytrade.com/docdvr/1306637/43602887/1433217562.pdf (đại lý diytrade) | "Smartgen Technology" (trang bìa); "This manual is suitable for HGM9310MPU, HGM9320MPU, HGM9310CAN and HGM9320CAN series controller only." (trang 1); "HGM9320 MPU(CAN), has all functions of HGM9310 MPU(CAN) as well as automatic…" (mục Modules comparison); bảng "Item \| HGM9310MPU \| HGM9320MPU \| HGM9310CAN \| HGM9320CAN" (mục 2) |
| HGM9520 | smartgen, nguồn 1013 (bảng 1013) | https://www.smartgen-america.com/upload/iblock/a67/ole4znst01skzw0v3w5x2avg32fdtjj7.pdf (nhà phân phối SmartGen Mỹ) | "HGM9520 Genset Parallel (With Mains) Unit USER MANUAL / Smartgen Technology" (bìa); chân trang "HGM9520 Genset Parallel (With Mains) Unit 2013-04-18 Version 1.0 Page 3 of 70"; "Working Voltage \| DC8. 0V to 35. 0V" |
| PI734C | stamford-avk-china, nguồn 1060 (bảng 1060) | https://www.stamford-avk.com/sites/stamfordavk/files/PI7C-312-TD-EN_Rev_A.pdf (TRANG HÃNG, không phải đăng lại) | "PI734C - Winding 312" (dòng đầu) |

Ghi chú nguồn "do trang khác đăng lại": hồ sơ chưa có trường riêng, không thêm vào schema. Chỗ ghi hiện dùng: (1) dòng `URL:` đầu tệp nguồn là URL trang đăng lại; (2) tiêu đề bảng 1012 / 1013 có đuôi "- bản của hãng do <trang> đăng lại" (sửa tay `title`, dòng bảng nguyên văn). **Đề xuất**: nếu muốn máy đọc được thì thêm trường `repostOf`/`via` vào nguồn — cần Khoa duyệt schema.

Tiêu đề HGM9320 đặt "HGM93XX MPU(CAN) Series Genset Controller (HGM9310 MPU(CAN) / HGM9320 MPU(CAN))" vì `catalog.js keyOf("HGM9320MPU") ≠ keyOf("HGM9320")`; viết "HGM9320 MPU(CAN)" là đúng chữ của tài liệu (mục 2) và là cách để `controllersIn` đọc ra HGM9310 / HGM9320 (khoá danh mục). Tiêu đề HGM9520 → `controllersIn` = HGM9520.

**Model được gắn tờ sau khi thêm** (qua `controllersIn` của tiêu đề, cơ chế `modelFacts`): HGM9310, HGM9320 (nguồn 1012); HGM9520 (nguồn 1013); PI734C (đầu phát, nguồn 1060). Trước đó cả ba SmartGen chỉ được nhắc trong tờ HGM9510 [1003], chưa có tờ của chính nó.

**Bị cắt**: cả 1012 và 1013 đủ trần 700 dòng (manual ~3.060 dòng; mục Specification / chức năng cơ bản nằm trong 700 dòng đầu — "DC(8~35)V" ở dòng 187 / 223). Phần vận hành, thông số cài đặt, cài đặt, sơ đồ nối dây (sau dòng 700) chưa vào; sinh lại sau khi `wt-bo-700-dong-2` merge (`maker-datasheets.mjs smartgen <url>` sẽ báo "đã có": xoá mục 1012 / 1013 trong `datasheets/smartgen.json` rồi chạy lại, hoặc đợi phiên đó sinh lại).

## Không nhận
| Tài liệu | Lý do |
|---|---|
| SmartGen HGM6100N series (45 trang smartgen-america, 11 trang smartgen.mx) → HGM6100CAN / 6110CAN / 6120CAN | Đã có tờ CHÍNH hãng [1001] (smartgen.cn "HGM6110N_…_6120CAN_en.pdf") nêu 6110CAN / 6120CAN; danh mục "HGM6100CAN" đã gắn [1001]. Tờ đăng lại chỉ trùng. Tài liệu cũng không ghi "6100CAN". |
| SmartGen HGM9510 (diytrade 64 trang, smartgen.mx 6 trang) | Đã có tờ chính hãng [1003] (HGM9510_en.pdf). Tài liệu ghi "HGM9510", không ghi "9500" → không gán cho HGM9500 (danh mục HGM9500 chỉ có trong [1003] như dòng nhắc). |
| SICES brochure tradekey (12 trang) → GC310 / GC350 / GC500Plus | Là brochure; bảng duy nhất là MA TRẬN TÍNH NĂNG 7 model đứng cạnh nhau (GC315/GC310/GC350/ATS100/GC500Plus/DST4602/MC100), `pdftotext` lệch cột, ô "X/O" không gắn được cột. `modelFacts` gắn dòng cho model có trong tiêu đề → sẽ gán nhầm. Không có bảng thông số của một model cụ thể → không nhận. |
| Stamford UCI274E, UCI274H (raad-eng.com) | Tờ hãng đã có từ stamford-avk.com: [1011] UCI274E, [1012] UCI274H (Winding 311). Tài liệu raad-eng ghi tên hãng "Newage Stamford" + model đúng, nhưng thêm bản cũ (2002) là trùng và có thể mâu thuẫn bản hãng đang có. Để ngoài. |
| Stamford UCDI274J – Winding 14 (baifapower) | Model đã có tờ hãng [1013] "UCDI274J – Winding 311" trong hồ sơ. Tài liệu ghi "UCDI274J" (không phải UCI274J). Khoa dặn KHÔNG gán UCDI274J cho UCI274J: không làm. Thêm bản Winding 14 cho cùng model đưa hai bộ số của hai winding vào một khoá → để điều phối quyết (nếu muốn thì thêm được, tài liệu đạt kiểm tên hãng + model: "UCDI274J - Winding 14", "Stamford industrial generators meet the requirements of…"). |
| Doosan P126TI (fdk-energy catalogue) | Không phải tờ hãng (catalogue tổ máy của đại lý). |
| UCI274K (slideshare / pdfcoffee / mahniroo 403) | Không tải được hợp lệ hoặc 403 → bỏ. |

## Kiểm
- Chữ tài liệu: đã mở `.txt` + `pdftotext` trực tiếp từng tệp (tên hãng, model, số trang).
- `verify.mjs`, test `ctl-twin`, `ctl-module`, `regress-config`, `dau-phat-hang`, `dau-phat-hang-d`, `schema-keys`: kết quả ghi ở PR.
- Đã không đổi `controllers[]` của hồ sơ (chỉ `specTables` / `sources`).
