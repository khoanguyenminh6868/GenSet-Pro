---
name: supplier-db
description: "Nhà cung cấp máy phát điện: dữ liệu suppliers/ (có nguồn, verify.mjs), cách tìm/thêm NCC, OCR, G7, bẫy đã gặp"
metadata:
  node_type: memory
  type: project
  originSessionId: 7f313dc0-600e-4a66-84f6-b51527698986
  modified: 2026-11-06T10:47:18.173Z
---

CSDL ở `suppliers/cn/<id>.json` (cả nước ngoài, `country` ghi nước thật; 429 bản ghi lúc 2026-11-04). Mỗi thông tin có nguồn [n] + câu trích nguyên văn trong `sources/<id>/<n>.md`; `verify.mjs` kiểm bằng code; merge vào main thì workflow Supplier publish tự đăng web.

**Why:** Khoa yêu cầu tuyệt đối không bịa thông tin nhà cung cấp. Quy đổi chỉ bằng công thức `web/conversions.js`.
**How to apply:** `discover.mjs save/grep` → `drafts/<id>.json` → `discover.mjs finish <id>` (tự crawl) → verify → PR. Commit `-c user.name=khoanguyenminh6868 -c user.email=...`. URL phải lấy từ kết quả tìm kiếm, không đoán.

- Số nguồn: 1–99 trang chính, 101+ crawl-specs, 1001–1999 datasheet, 2001+ Tìm NCC, 3001+ trang BĐK, 4001+ OCR (`ocr-specs.mjs`).
- Vai trò: genset_oem, engine_maker, alternator_maker, controller_maker, distributor. Khoa chốt (04/11): KHÔNG thu thập đơn vị lắp ráp/phân phối VN (Kibii, Kyopower, VNGPOWER, MPMAX, FADI, Vinagenset…).
- **G7** (04/11): CGM Italia bị sót vì discover-prompt chỉ tìm ở TQ. Đã thêm "lượt G7" vào `discover-prompt.md` (từ khoá tiếng bản địa, hiệp hội AMPS/EGSA, bỏ cửa hàng/cho thuê/đại lý). Đã thêm ~20 hãng G7 (PR #296, #314). Còn trong watchlist chưa làm được: Mosa (web chặn lưu), Multiquip, Shindaiwa (web trả trang cưa), T&R, Eisemann, Ausonia, Nippon Sharyo, SE2M (chưa có website). Chưa có bảng: Tecnogen, Interpower, Mase, Geko, CPS, VM Motori, John Deere, Sanyu. Tempest = Allam, Broadcrown = JCB.
- **OCR** (Khoa cho phép 04/11): `ocr-specs.mjs <id> <trang> <ảnh|pdf>...` — Tesseract (ảnh ×2, PDF scan qua pdftoppm 300 dpi, webp đọc thẳng). Chỉ giữ dòng code kiểm được: mã tổ máy chữ HOA+số và số trong mã = kVA của dòng; ngay sau là 2 cặp kW/kVA (kW nguyên lệch ≤0,5, thập phân ≤0,05); động cơ trùng đúng model danh mục đã có. Tesseract nhầm 6/8/B, 5/S, mất dấu chấm → lần đầu luôn đối chiếu vài bảng với ảnh. Đã làm: Runda 114 dòng, Koten 256, Sutong 22. PDF scan liệt kê ở `datasheets/_scans.json` (Keypower 59 tờ 1 model chưa OCR; Eastpower bảng chỉ kVA không kiểm được).
- **Bẫy đã sửa 04/11:** crawl-datasheets dừng vì kiểm pdftotext sai (xpdf 4.06 in phiên bản ra stdout) → trước đó chỉ 16 NCC có datasheet; crawl-datasheets từng xoá cả nguồn 2001+/3001+/4001+; merge-specs làm mất câu trích tay của nguồn 101+. Sau mọi lần merge-specs toàn bộ: chạy verify VÀ so số dòng bảng/nguồn từng bản ghi với origin/main.
- **Bẫy còn:** `crawl-specs.mjs --render` có thể treo hàng giờ ở closeBrowser → luôn bọc `timeout 1200`. Firecrawl hết credit. WebSearch không theo `site:`. Ngày Accessed theo UTC.
- catalog.js đọc thêm: khối GFE "| Engine | Alternator" + dòng hãng + dòng model, "Engine ref.", "Power model" (Koop), "Genset Model:" nối nhau, 油机/动力型号/配套动力.
- Rà hàng chào trúng thầu (PR #283): dump `api("kind=docs&coll=bidhist")` (import từ config-bot.mjs), goods của lot có bidder won, so label/maker với tên+brands (bỏ từ chung, tên tỉnh). Chưa có nguồn: KUMA, Euenon, Benzen, Dianyou, Foryou, Lingge/CKV, Leega, Orson, Wetech.
- Nguồn tìm hiệu quả: tiếng Trung theo tỉnh ("<thành phố> 柴油发电机组 有限公司 官网"), tiếng bản địa cho G7. Kém: made-in-china, b2bdata.baidu.com. Rà 03/11 (PR #268): Khoa chốt GIỮ bản ghi không có bảng (danh bạ, tránh Tìm NCC tìm lại).

- **Tìm Thông Số (Khoa 06/11, PR #435):** nút ở chi tiết NCC, chỉ superadmin (`genbidRole`; webreq trả 403 với người khác). `specreq/<id>` → config-bot `specJob` (lane trong `run`) → agent theo skill `bot/claude/skills/tim-thong-so-ncc/SKILL.md` (nguồn duy nhất; Install chép vào ~/.claude/skills) → findCheck + addToCatalog (nhánh `specs/<id>`) → `specmatch/<id>`. Chạy tay: `config-bot.mjs spec --id X` hoặc spec-prep/spec-check/spec-post. Chưa chạy agent thật lần nào.

Gợi ý cấu hình: [[config-suggest]]. Liên quan [[session-log]], [[no-artifact-version]].
