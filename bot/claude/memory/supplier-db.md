---
name: supplier-db
description: "CSDL nhà cung cấp máy phát (suppliers/): quy tắc không bịa + verify, cách thêm NCC, catalog PDF/OCR, Tìm Thông Số, bẫy crawl, hãng chưa làm được"
metadata:
  node_type: memory
  type: project
  originSessionId: 712171b8-1398-4e8a-b507-1e2692a83bce
  modified: 2026-11-13T00:29:26.355Z
---

CSDL ở `suppliers/cn/<id>.json` (cả nước ngoài, `country` ghi nước thật). Mỗi thông tin có nguồn [n] + câu trích nguyên văn trong `sources/<id>/<n>.md`; `verify.mjs` kiểm bằng code; merge vào main thì workflow tự đăng web.

**Why:** Khoa yêu cầu tuyệt đối không bịa, không suy ra thông tin NCC. Quy đổi chỉ bằng công thức `web/conversions.js`.

**How to apply:** `discover.mjs save/grep` → `drafts/<id>.json` → `discover.mjs finish <id>` → verify → PR. URL lấy từ kết quả tìm kiếm, không đoán. Cập nhật bản ghi cũ cũng qua drafts + finish.

## Quy tắc Khoa chốt
- KHÔNG thu thập đơn vị lắp ráp/phân phối Việt Nam (Kibii, Kyopower, VNGPOWER, MPMAX, FADI, Vinagenset, NHSTAR, GenParts…).
- GIỮ bản ghi không có bảng (danh bạ, tránh tìm lại).
- NCC đã có thì catalog mới chỉ bổ sung thông số thiếu.
- OCR được phép, nhưng chỉ giữ dòng code kiểm được (số trong mã = kVA, cặp kW/kVA khớp, động cơ trùng model danh mục).
- Trang bên bán (tier C) không vào danh mục. EPA/vecc.org.cn: đã kiểm, KHÔNG nhập (trùng model quá ít, phải suy ra).

## Cách làm
- Số nguồn: 1–99 trang chính, 101+ crawl-specs, 1001+ datasheet, 2001+ Tìm NCC, 3001+ BĐK, 4001+ OCR, 5001+ catalog Khoa tải lên.
- **Catalog Khoa tải lên:** Khoa chép PDF vào `C:\Projects\GenSet Pro\Datasheets` → Release `datasheets-upload` (tên không dấu) → `suppliers/catalog-pdf.mjs <id> <url> <pdf> [--rows|--single|--spread|--engines|--ocr]`. Trang ngang ghép 50|60 Hz → `--spread`; có lớp chữ mà không ra bảng → `--rows`; bảng vẽ bằng nét → `--ocr`. Luôn đối chiếu vài dòng với ảnh crop; sau lượt OCR so model trong chữ OCR với bản ghi để tìm cả nhóm bị loại. Lượt dài chạy nền.
- **OCR bảng ảnh:** `ocr-specs.mjs <id> <trang> <ảnh|pdf>...`. Tesseract nhầm 6/8/B, 5/S, Z/7/2, mất dấu chấm; có đường kẻ thì mất gần hết số.
- **Tìm Thông Số** (nút ở chi tiết NCC, chỉ superadmin): `specreq/<id>` → agent theo skill `tim-thong-so-ncc` → `specmatch/<id>`. Chạy tay: `config-bot.mjs spec --id X`.
- **Việc cần thu thập:** `suppliers/gaps.mjs`, workflow thứ hai hằng tuần đăng `gaps/current` và tự gửi specreq (biến repo `GAPS_QUEUE`, 0 = tắt). Thiếu nhất là thông số "hiển nhiên" bảng không ghi (hệ số công suất, điện áp, số pha, khởi động, làm mát); hãng đứng đầu Cummins, Perkins, Yuchai, SDEC, Weichai.
- **Volvo Penta:** `suppliers/volvo-penta.mjs` (chạy lại được; PDF tải bằng curl vì Node fetch lỗi chứng chỉ).
- Tìm NCC mới hiệu quả: tiếng Trung theo tỉnh ("<thành phố> 柴油发电机组 有限公司 官网"), tiếng bản địa + hiệp hội AMPS/EGSA cho G7. Kém: made-in-china, b2bdata.baidu.com, WebSearch tiếng Trung cho công ty nhỏ. Một pháp nhân có thể có thương hiệu xuất khẩu với website thứ hai (HiChai = Kaihua) → tách bản ghi + `relatedIds` vì crawl chỉ cào một host.

## Bẫy
- Sau mọi lần `merge-specs` toàn bộ: chạy verify VÀ so số dòng bảng/nguồn từng bản ghi với origin/main (từng làm mất nguồn 2001+/4001+ và câu trích tay).
- `crawl-specs.mjs --render` có thể treo hàng giờ → bọc `timeout 1200`. Đẩy tệp workflow lên nhánh `crawl/**` sẽ tự chạy CẢ 431 hãng → merge main vào nhánh crawl bằng commit có `[skip ci]`, rồi `gh workflow run supplier-crawl.yml --ref <nhánh> -f ids="..." -f plain=false -f render=true`.
- Bản ghi `website: null` không bao giờ được cào. Trang nền Globalso link ~100 bản dịch ăn hết lượt đọc (đã chặn; NCC Globalso cũ nên cào lại).
- PDF Illustrator có lớp chữ ẩn/chồng đôi (Koten): chạy cả `--rows` và `--ocr`, so theo model, bỏ dòng không in.
- `pdftotext -table` cho bảng (`-layout` lệch cột). Lượt nền nạp code lúc khởi động → sửa code phải chạy lại. Firecrawl hết credit. WebSearch không theo `site:`. Ngày Accessed theo UTC.

## Chưa làm được
- G7 trong watchlist: Mosa (chặn lưu), Multiquip, Shindaiwa, T&R, Eisemann, Ausonia, Nippon Sharyo, SE2M. Chưa có bảng: Tecnogen, Interpower, Mase, Geko, CPS, VM Motori, John Deere, Sanyu; 13/20 hãng G7 lớn 0 dòng sau lượt cào (trang chặn hoặc chỉ PDF). Tempest = Allam, Broadcrown = JCB.
- Hãng có hàng trúng thầu chưa tìm ra nguồn: KUMA, Euenon, Benzen, Dianyou, Foryou, Lingge/CKV, Leega, Orson, Wetech, Kokuro, Makawa, Lance Power, Sinocox.
- Model trúng thầu chưa có datasheet: Stamford S4L1M-D41/S3L1D/UCM274E1/HCKI634Z, Mecc Alte ECO/ECP, DSE4522, Cummins QSB6.7-G22/QSB7-DM/BT4.5-DM, Baudouin 6M12G6D2/5, Deere 6068HFS55, Hyundai AD126TIF/AD136TF, Kohler KH01221TO4N. PowerStart PC0602 = Cummins PS0602.
- Kachai datasheet đòi mật khẩu (hỏi Kachai/đại lý). Keypower 59 tờ scan chưa OCR. 35 đại lý Cummins chưa tìm website. Volvo TAD1641/1642GE, TAD1350/1353GE, TWD1653GE chưa đọc được PDF.

Liên quan [[config-suggest]], [[session-log]].
