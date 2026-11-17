---
name: supplier-db
description: "CSDL nhà cung cấp máy phát (suppliers/): quy tắc không bịa + verify, cách thêm NCC, catalog PDF/OCR, Tìm Thông Số, bẫy crawl, hãng chưa làm được"
metadata:
  node_type: memory
  type: project
  originSessionId: 712171b8-1398-4e8a-b507-1e2692a83bce
  modified: 2026-11-17T16:34:58.162Z
---

- **Sửa cách đọc dữ liệu thì kiểm chéo TOÀN BỘ** (Khoa 17/11/2026, khi duyệt 7 đề xuất rà soát lệch dòng / cột: "cần cross check toàn bộ chứ không phải chỉ làm vài mẫu. Làm kỹ coi chừng sai"): so từng bản ghi trước / sau trên cả `suppliers/cn`, soát mọi lớp thay đổi, không lấy mẫu. Cách làm (diễn giải của em): `cmpP.cjs` / `revP.cjs` ở `genbid-work\dieu-phoi\dau-vao\ra-soat-lech-dong-cot\`.
CSDL ở `suppliers/cn/<id>.json` (cả nước ngoài, `country` ghi nước thật). Mỗi thông tin có nguồn [n] + câu trích nguyên văn trong `sources/<id>/<n>.md`; `verify.mjs` kiểm bằng code; merge vào main thì workflow tự đăng web.

**Why:** Khoa yêu cầu tuyệt đối không bịa, không suy ra thông tin NCC. Quy đổi chỉ bằng công thức `web/conversions.js`.

**How to apply:** mọi thay đổi qua `discover.mjs` + `verify.mjs` rồi PR; URL lấy từ kết quả tìm kiếm, không đoán.

## Quy tắc Khoa chốt
- KHÔNG thu thập đơn vị lắp ráp/phân phối Việt Nam (Kibii, Kyopower, VNGPOWER, MPMAX, FADI, Vinagenset, NHSTAR, GenParts…).
- GIỮ bản ghi không có bảng (danh bạ, tránh tìm lại).
- NCC đã có thì catalog mới chỉ bổ sung thông số thiếu.
- OCR được phép, nhưng chỉ giữ dòng code kiểm được (số trong mã = kVA, cặp kW/kVA khớp, động cơ trùng model danh mục).
- Chuẩn hoá thông số (`web/spec-norm.js`, Khoa 14/11/2026): "T3" / "Tier 3" / "Stage V" không kèm EPA / EU / China → KHÔNG gán thang khí thải; viết tắt "OP" ở ô kích thước → KHÔNG coi là máy trần; số "1,642" (phẩy + 3 chữ số) đọc là 1642; số bắt đầu "0," ("0,667 L") giữ nguyên là thập phân; bảng tự cho thấy phẩy thập phân (Himoinsa: "1,642 L", "3,767 l/h") thì ĐỂ THIẾU, không đọc 1642 cũng không đọc 1,642 (Khoa: "để thiếu như đang làm"). Dung tích xi lanh không ghi đơn vị → mặc định L hoặc cm³ (Khoa 14/11, nguyên văn "displacement nên default đơn vị là L hoặc cm³ (cc)"; em chọn dải: 0,4–100 = L, 400–100.000 = cc, ngoài dải để thiếu); là ngoại lệ duy nhất của luật không đoán theo độ lớn. Lớp này chưa nối vào Gợi ý cấu hình / web; nối là việc riêng, cần Khoa duyệt.
- Khoa bảo BỎ (14/11/2026), đừng đề xuất lại: lập bảng chuẩn động cơ / đầu phát từ nguồn hãng để phân xử mâu thuẫn giữa các NCC; gộp model chỉ khác O/0, I/1. Nối lớp chuẩn hoá vào Gợi ý cấu hình: Khoa đòi đo trước / sau trên TOÀN BỘ gói rồi mới quyết.
- **Luật số đông khi nguồn mâu thuẫn (Khoa 16/11/2026, "nên nhớ có luật mới"):** một giá trị được ≥3 NCC ghi VÀ gấp ≥3 lần mỗi giá trị khác thì lấy giá trị đó; ngang ngửa hơn thì "chưa rõ", không đoán. Áp đầu tiên cho hãng động cơ / đầu phát (`keptMakes` trong catalog.js); Khoa nhắc nhớ luật này khi xử lý mâu thuẫn số liệu depco-power (việc để sau). Gán hãng (cùng ngày): chỉ hãng ở mức bằng chứng cao nhất (dòng bảng > tiêu đề cột / hãng tự SX > tên trang); cặp tên cùng một hãng được giữ cả hai: Doosan / Hyundai / Daewoo, Weichai / Deutz, Kofo / Ricardo, Baudouin / Weichai, FAWDE / Xichai. KHÔNG duyệt: Lovol / Perkins, Ricardo / Huachai / Weichai (chỉ số đông mới cứu).
- Trang bên bán (tier C) không vào danh mục. EPA/vecc.org.cn: đã kiểm, KHÔNG nhập (trùng model quá ít, phải suy ra).

## Mức công suất prime / standby (16/11/2026, PR #796–#800)
- Khoa: "ESP chính là Standby. Hiện cả 2, sửa cho toàn bộ". Dòng máy một model (min = max) hiện "prime · standby" khi dòng bảng cùng nguồn có cả hai; động cơ cũng mang cả hai mức (864 dòng).
- Em tự chốt, Khoa chưa duyệt riêng: mức chỉ lấy từ chữ nguyên văn; "Rated"/"额定" KHÔNG đổi thành prime; DCC (pramac) không gán continuous; chữ prime/standby của model khác, cột khác hay câu chung thì không gán.
- 565 dòng "unspecified": báo cáo `C:\Projects\GenSet Pro\unspecified-565.md` (ngoài git, 16/11). Nhóm B chỉ gán được 3 dòng; 68 giữ nguyên kèm lý do.
- Khoa bảo BỎ QUA (16/11): igsa-mexico 46 dòng (cột "CAPACIDAD (Kw)" không ghi mức) và sdec bảng 2002 ("Engine Rated Power" một cột).
- Dòng máy một model có hai mức: 533 → 863 (PR #799, bảng nhãn + bảng Cat) → 897 (PR #800, Khoa bảo "làm cho airman, sửa cho powerco, nới cho cps AP450S").
- Cố ý vẫn bỏ (đã giải thích, Khoa không bảo làm): krauter (dòng "Motoren" 14 ô / 13 model, ghép cột dễ lệch); denyo (mức thứ hai là Continuous, không phải Prime → chỉ hiện được "continuous · standby"); powerco PCS400P/PCS500P (prime trùng ở 50 và 60 Hz) và bảng 2500 series (không có dòng tần số trên cột); deman (cột Prime ghi "/" — nguồn để trống, KHÔNG phải lệch đơn vị); số đứng trước chữ mức khi có ≥2 số ("1100KW/1375KVA Prime"); powerlink VR200XS (nguồn gõ nhầm "9176kW").
- ~1.200 dòng nguồn chỉ có một mức: không có gì để đọc, muốn thêm phải tìm datasheet mới.

## Cách làm
Lệnh, số nguồn, cách đọc catalog PDF/OCR và bẫy cào: `suppliers/CLAUDE.md` trong repo.
- **Thông số lưu và đọc thế nào (rà soát 14/11/2026):** bảng lưu NGUYÊN VĂN (`specTables`: n / title / header / rows), không có cột chuẩn; `web/catalog.js` đọc lúc chạy (`SPECS`, regex theo nhãn cột) → `web/spec-norm.js` chuẩn hoá (số, đơn vị, điều kiện đo, `missing`) → `suppliers/quality.mjs --check` trong CI (chỉ chặn PR sửa code đọc). Lỗ hổng lớn nhất là nguồn thiếu điều kiện đo (tiêu hao ~80% không ghi mức tải; kích thước / khối lượng ~90% không ghi trần hay vỏ) và mâu thuẫn thật giữa các trang NCC (dung tích 36% model có ≥2 NCC ghi), không phải lỗi đọc.
- **Kiểm PR sửa đọc thông số:** so TỪNG bản ghi main ↔ nhánh bằng script ở `C:\Projects\GenSet Pro\genbid-work\dieu-phoi\dau-vao\ra-soat-thong-so\` (audit2 → `cmpk.cjs`; `normcheck.cjs` / `solecheck.cjs` / `comma.cjs` cho spec-norm; số đo gốc `ket-qua.md`). Bẫy đã gặp: loại một nhãn khỏi mã có thể làm tiêu chí HSMT mất bằng chứng (chạy `regress-config`); sửa một nhãn làm dòng khác "lên hàng" đúng hoặc sai, nên phải xem cả giá trị THÊM chứ không chỉ giá trị mất.
- **Catalog Khoa tải lên:** Khoa chép PDF vào `C:\Projects\GenSet Pro\Datasheets` → đưa lên GitHub Release `datasheets-upload` (tên không dấu) làm URL nguồn.
- **Việc cần thu thập:** `suppliers/gaps.mjs`, workflow thứ hai hằng tuần đăng `gaps/current` và tự gửi specreq (biến repo `GAPS_QUEUE`, 0 = tắt). Thiếu nhất là thông số "hiển nhiên" bảng không ghi (hệ số công suất, điện áp, số pha, khởi động, làm mát); hãng đứng đầu Cummins, Perkins, Yuchai, SDEC, Weichai.
- Tìm NCC mới hiệu quả: tiếng Trung theo tỉnh ("<thành phố> 柴油发电机组 有限公司 官网"), tiếng bản địa + hiệp hội AMPS/EGSA cho G7. Kém: made-in-china, b2bdata.baidu.com, WebSearch tiếng Trung cho công ty nhỏ. Một pháp nhân có thể có thương hiệu xuất khẩu với website thứ hai (HiChai = Kaihua) → tách bản ghi + `relatedIds` vì crawl chỉ cào một host.

## Chưa làm được
- G7 trong watchlist: Mosa (chặn lưu), Multiquip, Shindaiwa, T&R, Eisemann, Ausonia, Nippon Sharyo, SE2M. Chưa có bảng: Tecnogen, Interpower, Mase, Geko, CPS, VM Motori, John Deere, Sanyu; 13/20 hãng G7 lớn 0 dòng sau lượt cào (trang chặn hoặc chỉ PDF). Tempest = Allam, Broadcrown = JCB.
- Hãng có hàng trúng thầu chưa tìm ra nguồn: KUMA, Euenon, Benzen, Dianyou, Foryou, Lingge/CKV, Leega, Orson, Wetech, Kokuro, Makawa, Lance Power, Sinocox.
- Model trúng thầu chưa có datasheet: Stamford S4L1M-D41/S3L1D/UCM274E1/HCKI634Z, Mecc Alte ECO/ECP, DSE4522, Cummins QSB6.7-G22/QSB7-DM/BT4.5-DM, Baudouin 6M12G6D2/5, Deere 6068HFS55, Hyundai AD126TIF/AD136TF, Kohler KH01221TO4N. PowerStart PC0602 = Cummins PS0602.
- Kachai datasheet đòi mật khẩu (hỏi Kachai/đại lý). Keypower 59 tờ scan chưa OCR. 35 đại lý Cummins chưa tìm website. Volvo TAD1641/1642GE, TAD1350/1353GE, TWD1653GE chưa đọc được PDF.

Liên quan [[config-suggest]], [[quy-tac-luong]].
- **Cào lại toàn bộ (13/11, PR #629):** `crawl-specs --max 80` cho 435 NCC → +24.252 dòng ở 118 NCC. Bẫy: lượt chạy toàn bộ dừng im lặng sau 138 NCC (exit 0) → luôn đếm dòng log, chạy tiếp id còn thiếu. Bẫy: cào lại đánh số lại nguồn 1xx → `controllers[]` trỏ số nguồn cũ thì verify lỗi → giữ bản main cho NCC đó (7 NCC). Cách so: lưu số dòng + câu trích tay (n<101, ≥2001) trước, sau merge-specs revert NCC giảm dòng/đổi câu trích.
- **Tạm loại trừ 151 NCC (16/11/2026, Khoa yêu cầu):** NCC không góp dòng nào vào `GenbidCatalog.build` (danh mục động cơ/đầu phát/BĐK mà Gợi ý cấu hình chọn ứng viên) → `supexcl/<id>` `{on:true, reason:"tạm loại: chưa có dữ liệu gợi ý cấu hình (16/11/2026)"}`. Bỏ cả loạt: lọc theo `reason`. Danh sách: `genbid-work\ncc-khong-du-lieu-cau-hinh.md`. Hệ quả: bot bỏ qua chúng cả ở Tìm thông số → muốn bổ sung dữ liệu thì bỏ loại trừ trước. Bẫy: tiêu chí "không góp dòng vào CAT.build" THIẾU `modelFacts` (config-bot: tờ thông số riêng của hãng động cơ/đầu phát/BĐK chấm thông số cho model trong danh mục) → đã loại nhầm và trả lại leroy-somer-fuzhou, stamford-avk-china, volvo-penta (còn 148). Depco (`depco-power`) có 7 tờ tổ máy dạng "nhãn | giá trị | nhãn | giá trị" mà catalog.js không đọc được → bị loại vì lỗ hổng bộ đọc, không phải thiếu dữ liệu. Khoa bảo bỏ loại trừ 24 NCC có hàng trúng thầu, và "NCC nào cào được thông số thì bỏ loại trừ" → 16/11 sửa catalog.js đọc bảng Details (#804), cào lại 648 tổ máy Depco (#806); bỏ loại trừ depco-power, kena-chongqing. Còn 122 tạm loại (+ sanq-power Khoa tự loại). Cách ghi: Edge của Khoa (Claude in Chrome), chèn `<script>` vào trang rồi `window.claude.use("db")` (state nằm trong IIFE, không với tới).
