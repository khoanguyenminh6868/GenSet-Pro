---
name: supplier-db
description: "CSDL nhà cung cấp máy phát (suppliers/): quy tắc không bịa + verify, cách thêm NCC, catalog PDF/OCR, Tìm Thông Số, bẫy crawl, hãng chưa làm được"
metadata:
  node_type: memory
  type: project
  originSessionId: 712171b8-1398-4e8a-b507-1e2692a83bce
  modified: 2026-11-13T00:39:18.574Z
---

CSDL ở `suppliers/cn/<id>.json` (cả nước ngoài, `country` ghi nước thật). Mỗi thông tin có nguồn [n] + câu trích nguyên văn trong `sources/<id>/<n>.md`; `verify.mjs` kiểm bằng code; merge vào main thì workflow tự đăng web.

**Why:** Khoa yêu cầu tuyệt đối không bịa, không suy ra thông tin NCC. Quy đổi chỉ bằng công thức `web/conversions.js`.

**How to apply:** mọi thay đổi qua `discover.mjs` + `verify.mjs` rồi PR; URL lấy từ kết quả tìm kiếm, không đoán.

## Quy tắc Khoa chốt
- KHÔNG thu thập đơn vị lắp ráp/phân phối Việt Nam (Kibii, Kyopower, VNGPOWER, MPMAX, FADI, Vinagenset, NHSTAR, GenParts…).
- GIỮ bản ghi không có bảng (danh bạ, tránh tìm lại).
- NCC đã có thì catalog mới chỉ bổ sung thông số thiếu.
- OCR được phép, nhưng chỉ giữ dòng code kiểm được (số trong mã = kVA, cặp kW/kVA khớp, động cơ trùng model danh mục).
- Trang bên bán (tier C) không vào danh mục. EPA/vecc.org.cn: đã kiểm, KHÔNG nhập (trùng model quá ít, phải suy ra).

## Cách làm
Lệnh, số nguồn, cách đọc catalog PDF/OCR và bẫy cào: `suppliers/CLAUDE.md` trong repo.
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
