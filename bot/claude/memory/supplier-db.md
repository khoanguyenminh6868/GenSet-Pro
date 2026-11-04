---
name: supplier-db
description: "Nhà cung cấp máy phát điện: dữ liệu suppliers/ (có nguồn, verify.mjs), cách tìm/thêm NCC, bẫy đã gặp"
metadata:
  node_type: memory
  type: project
  originSessionId: 7f313dc0-600e-4a66-84f6-b51527698986
  modified: 2026-11-03T23:12:28.330Z
---

CSDL nhà cung cấp ở `suppliers/cn/<id>.json` (cả nước ngoài, `country` ghi nước thật; 400 bản ghi lúc 2026-11-02). Mỗi thông tin có nguồn [n] + câu trích nguyên văn trong `sources/<id>/<n>.md`; `verify.mjs` kiểm bằng code; đẩy lên main thì workflow Supplier publish tự đăng web.

**Why:** Khoa yêu cầu tuyệt đối không bịa thông tin nhà cung cấp và gợi ý. Quy đổi thông số chỉ bằng công thức trong `web/conversions.js` (code tính lại).
**How to apply:** thêm NCC qua fetch-source/discover.mjs save → JSON → verify → PR (Khoa cho tự squash-merge PR dữ liệu). Website mang tên hãng nhưng của đại lý (EMAC: sdec-engine.com, dcec-engine.com, ccec-engine.com) không là nguồn chính hãng. Làm trong worktree riêng, không đụng checkout chính của bot. Commit: `-c user.name=khoanguyenminh6868 -c user.email=...`.

- Vai trò: genset_oem, engine_maker, alternator_maker, controller_maker (từ PR #235: deep-sea-electronics, smartgen, comap), distributor. Số đánh nguồn: 1–99 trang chính, 101+ crawl-specs, 1001+ datasheet, 2001–2999 Tìm NCC, 3001+ trang bộ điều khiển.
- Tìm NCC mới: `discover.mjs` (Gemini/Antigravity) + `discover-watchlist.json` (công ty Khoa hay làm: Kaichen, ITC, Kangjin…, tìm riêng theo tên bằng ≥2 công cụ). Nút Tìm NCC trên web: chỉ Claude từ PR #242 (xem [[config-suggest]]).
- Liên hệ NCC: `contacts.mjs` (PR #127). Bộ điều khiển của NCC: `controllers.mjs [--crawl]` (PR #156); DSE…MKIII là đời riêng (sửa PR #235).
- Nguồn tìm hiệu quả: tìm tiếng Trung theo tỉnh ("<thành phố> 柴油发电机组 有限公司 官网"), tiếng Đức/Pháp/Ý cho G7; china-gpower.com, powershow.cn (chỉ qua kết quả tìm kiếm, KHÔNG scrape — bị chặn), CCCME làm nguồn hạng B. Kém: made-in-china, b2bdata.baidu.com. Quét lại `sources/` đã lưu tìm dải công suất trước khi tìm web (rẻ).
- Firecrawl đã HẾT credit (2026-11-02); hết thì tải HTML trực tiếp đọc thẻ <a>. WebSearch không theo `site:`, chỉ dùng dò tên/tên miền/link PDF.
- Bẫy: ngày Accessed theo UTC (chạy `date` trước khi ghi checkedAt); website có trang danh mục sản phẩm thì lưu trang đó; Fortugen = VIETPOWER (VN), chờ Khoa gửi tên nhà máy TQ.

Gợi ý cấu hình: xem [[config-suggest]]. Liên quan [[no-artifact-version]].

**Rà hàng chào trúng thầu 2026-11-04 (PR #283):** dump `api("kind=docs&coll=bidhist")` (import `api` từ config-bot.mjs), lấy goods của lot có bidder won, so label/maker với tên+brands của cn/*.json (bỏ từ chung và tên tỉnh/thành: "fujian" khớp nhầm). Khoa chốt vẫn KHÔNG thu thập đơn vị VN (Kim Bình/Kibii, Thiên Hòa An/Kyopower, Việt Nhật/VNGPOWER, MPMAX, FADI, Vinagenset…). Thêm 10 hãng; chưa tìm được nguồn: KUMA, Euenon, Benzen, Dianyou, Foryou, Lingge/CKV, Leega, Orson, Wetech (Alibaba đòi đăng nhập), Elemax (sawafuji.co.jp timeout). Động cơ/đầu phát/BĐK trong hàng chào gần như đã có đủ.
PR #285 (04/11): Khoa cho OCR bảng dạng ảnh — `ocr-specs.mjs` (Tesseract, nguồn 4001+, chỉ giữ dòng code kiểm được; ±1 quá lỏng, Tesseract nhầm 6/8/B, 5/S, chữ thường trong mã). Lần đầu luôn đối chiếu vài bảng với ảnh. catalog.js đọc thêm khối GFE "| Engine | Alternator", "Engine ref.", "Power model". Bẫy: crawl-datasheets báo thiếu pdftotext dù có (xpdf 4.06 in phiên bản ra stdout, đã sửa). Còn thiếu: Atlas Copco (brochure QES nhiều cột lệch), Nanni, hãng chỉ có B2B; đầu phát SZN của Runda chưa ghi (chưa có trong danh mục).

**Rà soát 2026-11-03 (PR #268):** 400 bản ghi, 270 không góp gì cho Gợi ý cấu hình. crawl-specs 111 bản ghi chưa từng thu thập → 52 có bảng; còn 237 vô ích (199 không bảng, 38 bảng không dùng được: xe tải, máy khí, PMG nhỏ, đầu kích từ...). Khoa chốt GIỮ NGUYÊN, không xoá: xoá không làm Gợi ý nhanh hơn (catalog.md không chứa chúng, file nhỏ đi 7%), còn mất danh bạ/liên hệ và Tìm NCC sẽ tìm lại. merge-specs giờ giữ nguồn/bảng ≥2000 (trước đây xoá nguồn Tìm NCC). Kaichen (watchlist) web chỉ có máy 3–12 kW, không ghi động cơ. catalog.js đọc thêm khối "Genset Model:" nối nhau (supermaly) và nhãn động cơ 油机/动力型号/配套动力. 237 còn lại: 120 web không bảng đọc được (Caterpillar, Cummins Inc, Generac, Aksa… web động), 79 không website (48 đại lý Cummins), 38 bảng sản phẩm khác. Cách rà: build catalog (`GenbidCatalog.build`) + `modelFacts`, đếm theo supplierId dòng động cơ/đầu phát/BĐK/facts; sau merge-specs luôn so với origin/main xem bản ghi có mất nguồn/bảng không.
