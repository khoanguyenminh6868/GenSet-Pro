# Nghiệm thu hien-thi-to-may-1: hồ sơ NCC hiện tổ máy bảng không ghi mã động cơ (việc C PR 2)

- PR draft: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/968 (nhánh `genset-hien-thi`, SHA `64ed32832129f4ce4a535cc89487fe3860bc6f5e`, gốc main `1e712e19`). Không tự merge.
- Tệp: `web/index.html` (`supGensetsPart`, gọi cuối `supModelsHtml`), `web/test/sup-gensets.spec.mjs`, `web/CLAUDE.md`. Không đụng `catalog.js`, config-bot.

## Hiển thị
Mục "Tổ máy (bảng không ghi mã động cơ) · N model" sau động cơ / đầu phát / bộ điều khiển. Cột: Tổ máy, Công suất (mỗi mức như nguồn: prime / standby / rated / "không ghi mức" = `unrated`, min–max khi nhiều dòng), Tần số, Hãng động cơ (`catMakeHtml`, "theo …"), Số dòng. Ghi rõ "chỉ để xem, Gợi ý cấu hình chưa dùng". ≤ 15 model mở sẵn, nhiều hơn vẽ khi mở. Không câu trích, không link (SHOW_SRC).

## Lệnh và kết quả (20/11/2026, máy Khoa)
- `cd web/test; npm ci; PW_CHANNEL=msedge npx playwright test --trace off`: 134 passed (gồm 2 ca mới).
- `node --test web/test/*.test.mjs` 161/0; `node --test suppliers/catalog-c.test.mjs` 13/0.
- Ảnh thật: `dau-vao/catalog-c/shot.mjs <worktree> <out>` (server thử + hồ sơ thật từ `suppliers/cn`, Edge, deviceScaleFactor 2), không lỗi console / pageerror → `nghiem-thu/hien-thi-to-may/`: desk-googol (29, `unrated` + prime/standby, lazy), desk-superwatt-swt (7, 50 / 60 Hz, Cummins / Kubota theo tên trang), desk-westinpower (rated), desk-zc-power (standby + rated), phone-googol (390 px).
- `dau-vao/catalog-c/gs-sup.mjs`: 12 NCC có mục (acepow-fuan 13, frs-shenyang 59, googol 29, green-power-generators 24, interpower 23, kangwo-xiamen 15, superwatt-swt 7, teksan 498, vpower-hk 26, westinpower 3, yingtai-jiangsu 139, zc-power 9).

## 3 mẫu (số trên màn hình = số `gensetsOf` đã soát ở PR 1)
1. superwatt-swt SC688: "625 kVA / 500 kW prime · 688 kVA / 550 kW standby · 50 Hz · Cummins (theo tên trang)"; SC688X cùng số, 60 Hz.
2. googol GPAC1000-XXX-50: "1.000 kVA / 800 kW không ghi mức · 50 Hz · Googol (theo hãng sản xuất)".
3. westinpower LY1200: "1.375 kVA / 1.100 kW rated · — · Nguồn không ghi hãng".

## Nhãn COP (đề xuất, chưa đổi)
#958 dùng `rated` cho Continuous / COP (quy ước `fromSupplier`: rated = không ghi prime/standby, web "Không ghi loại"); #959 `gensetsOf` dùng `unrated`, `rated` chỉ khi nguồn ghi "Rated". Đề xuất: theo `fromSupplier`, gộp `unrated` của `gensetsOf` vào `rated`; muốn giữ "nguồn ghi chữ Rated" thì trường riêng. Chờ chốt.

## Vòng 2 (điều phối 20/11/2026: gộp `unrated` → `rated`, nhãn dùng lại hàm sẵn có)
- SHA `0124e6f5aefc887d84a7ca6c5577f2816470300a` (commit a00c4410 + gộp main 54d4309f, main chỉ đổi `bot/claude/memory/config-suggest.md`).
- `web/catalog.js`: 3 bố cục `googolGas` / `kangwo` / `vpower` đổi `unrated` → `rated`, vòng đọc mức chỉ còn prime / standby / rated, chú thích ghi quy ước. `suppliers/catalog-c.test.mjs` (3 ca), `suppliers/spec-diff.mjs` (`pw`) bỏ `unrated`. grep toàn repo (js / mjs / html / md / json, trừ node_modules): còn `unrated` chỉ ở chú thích "no separate `unrated`" và câu "bỏ mức `unrated` riêng" trong web/CLAUDE.md.
- Nhãn mức trên màn hình: DÙNG LẠI `CAT_RATING` (index.html, bảng "Các dòng bảng ghi model này" của màn Danh mục: `${CAT_RATING[r]}: <b>${catPow(p)}</b>`), cùng dạng "Nhãn: kVA / kW"; khoảng min–max bằng `catRange` (như bảng model của hồ sơ NCC). Bảng "Dòng máy phân phối" của hồ sơ NCC dùng `fmtPower` (chữ "prime" / "standby" tiếng Anh, `rated` không nhãn) — không chọn vì không có nhãn tiếng Việt và không ghi được mức "không ghi loại". Bỏ `SUP_GS_LEVEL` tự đặt.
- `cop.mjs` (dau-vao/catalog-c): build() gốc main ↔ nhánh: engines 6.889 / alternators 2.704 / controllers 187 GIỐNG; gensets 845 GIỐNG sau khi đổi khoá `unrated` → `rated` ở bản gốc (54 dòng đổi khoá, 0 dòng có cả hai); nhánh 0 `unrated`.
- `node --test suppliers/*.test.mjs` 1.194/0; `web/test/*.test.mjs` 161/0; `quality --check` không xấu đi; Playwright cả bộ 133 + 1 lỗi `files.spec.mjs` (Đối chiếu TLKT, tải PDF tiếng Anh) khi chạy cả bộ, chạy lại riêng 7/7 → chập chờn do tải máy, không liên quan.
- Ảnh chụp lại (đè ảnh vòng 1): zc-power "Dự phòng (standby): 2,5 kW · Không ghi loại: 2 kW"; googol "Không ghi loại: 1.000 kVA / 800 kW"; superwatt "Liên tục (prime): 625 kVA / 500 kW · Dự phòng (standby): 688 kVA / 550 kW".

## Rủi ro, quay lui
- Teksan 498 model: mục đóng sẵn, vẽ khi mở (một bảng ~500 dòng, như mục động cơ lớn).
- Quay lui: revert PR (một hàm + một chỗ gọi).

## Chưa kiểm
- Trên web thật (Vercel chỉ deploy main).

## Cần ghi nhớ
- Mục này không có trong màn Danh mục (chỉ hồ sơ NCC); nếu sau này nối Gợi ý thì đổi câu "Gợi ý cấu hình chưa dùng".
