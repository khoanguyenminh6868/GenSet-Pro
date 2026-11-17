# Nghiệm thu spec-flow (c) + (a)(b)

PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/575 (DRAFT, nhánh `spec-cols`, worktree `wt-spec-cols`)

## Kết luận từng lỗi
- **(c) bảng cột chỉ ra 1 động cơ / nguồn: TÁI HIỆN ĐƯỢC, đã sửa trong #575.**
- **(a) `addToCatalog` luôn bật mergeWhenGreen: KHÔNG tái hiện, không sửa.** `addToCatalog` (config-bot.mjs ~3404) gọi `mergeWhenGreen` vô điều kiện sau `gh pr create`; cả ba đường (Gợi ý cấu hình ~3491, Tìm NCC ~4131, Tìm Thông Số `specPost` ~4213) đều đi qua nó, không đường nào tắt (không có cờ opts nào). Nguồn gốc: PR #159. Còn một kẽ hở nhỏ CHƯA sửa (ngoài mô tả brief): nếu `gh pr create` lỗi "PR đã tồn tại" (chạy lại cùng `specs/<id>` khi PR cũ còn mở) thì nhảy vào `prError`, không gọi mergeWhenGreen cho PR cũ. Cần thì giao riêng.
- **(b) `spec-prep` cho id chưa có trên web: KHÔNG tái hiện, không sửa.** `specPrep` ném `không có nhà cung cấp <id>` trước khi tạo thư mục / chạy agent (đã chạy thử `specPrep("khong-co-id", dir, [{id:"a"}])`: ném lỗi, thư mục không được tạo); `specJob` ghi lỗi đó vào `specreq/<id>`; CLI `spec-prep` dừng cùng lỗi. Thông báo ngắn nhưng rõ; có thể đổi thành "chưa có trên web (supplier/<id>)" nếu muốn, không bắt buộc.

## (c) Nguyên nhân tái hiện được (dữ liệu giả theo dạng xpdf -table của datasheet Perkins/FPT, `genbid-test\spec-cols\synth.mjs`)
1. `catalog.js fromLabelTable`: với hãng động cơ (`role engine_maker`) hàng `| Model | A | B | C` bị đọc là model TỔ MÁY, không ra động cơ nào → bảng cột 0 động cơ.
2. `crawl-datasheets.mjs pdfText`: hàng chữ lặp theo cột (`Engine brand Perkins Perkins Perkins`) bị cắt thành `| Engine brand | Perkins` + `Perkins` + `Perkins` (mất cột).
3. Nguy cơ lệch cột khi bật (1): bảng nguồn có ô gộp (hàng ít giá trị hơn số model, ví dụ `Number of cylinders | 3 | 4` dưới 15 model Yangdong) → giá trị gán nhầm model.

## Tệp đã đổi
- `web/catalog.js`: `fromLabelTable` thêm cờ `engineModel` (hàng Model bare → động cơ mỗi cột, chỉ khi hãng động cơ và bảng không có hàng nhãn động cơ / đầu phát / "Generator" / hệ số công suất…); khi bật chỉ dùng hàng có đúng 1 giá trị mỗi model (hàng lệch số cột bỏ cả hàng).
- `suppliers/crawl-datasheets.mjs`: `pdfText` giữ cùng một hàng khi chữ lặp lại cùng giá trị.
- `suppliers/spec-cols.test.mjs` (mới, 4 test).

## Lệnh đã chạy
- `node --test suppliers/*.test.mjs` → `# tests 399, pass 399, fail 0`.
- `node suppliers/verify.mjs` → `433 bản ghi, 0 có lỗi` (exit 0). Không đổi bản ghi / nguồn nào (chỉ đổi bộ đọc).
- Không chạy agent thật, không ghi web (không gọi addToCatalog).

## Số đo (ĐO, không ước tính; `genbid-test\spec-cols\corpus.mjs`, `measure.mjs`, `align.mjs`)
- Nguồn dạng cột có hãng động cơ bị ảnh hưởng: 5 nguồn hãng (yuchai 17 nguồn web, yangdong 109/110, yunnei-power 101, koop-changzhou 101/102) + 0 PDF thật trong `sources/` (trong kho chỉ có 8 nguồn PDF dạng cột, đều là brochure Atlas Copco / Bison / Mecc Alte / MWM, ngoài phạm vi: model là tổ máy / đầu phát).
- Dòng động cơ đọc ra từ toàn kho (`CAT.fromSupplier`): trước 32.289 động cơ + 8.638 đầu phát → sau 32.405 + 8.638. Khoá (nguồn|loại|model|tổ máy): thêm 113, mất 0 (yuchai 85, yangdong 22, yunnei-power 4, koop-changzhou 2).
- Mẫu thử giả 3 hình dạng: Perkins-1106A (trước 0 động cơ → sau 3/3), FPT-NEF (0 → 3/3), tổ máy với hàng Engine model (giữ nguyên 3 động cơ).
- Lệch cột: soát tự động 265 giá trị thông số của 87 động cơ mới so với ô cùng cột trong dòng bảng đã lưu → 265 đúng, 0 lệch; 26 động cơ mới không có thông số (hàng nguồn ít giá trị, cố ý bỏ).

## 12 mẫu đối chiếu trang gốc (cột đúng)
Nguồn đã lưu `suppliers/sources/<id>/<n>.md` (URL ở dòng 1):
1. yuchai/101 `YCK05240-60` cột 1: Rated power/Speed 176/2200 ✓ · 2. `YCK05230-60` cột 2: 169/2200 ✓ · 3. `YCK05210-60`: 157/2200 ✓ · 4. `YCK05190-60`: 140/2200 ✓
5. yuchai/102 `YC6J190-30` cột 2: kW 140 ✓ · 6. `YC6J230-30` cột 5: 170 ✓ · 7. `YC6J160-33` cột 6: 118 ✓
8. yangdong/110 `YD385D` cột 2: Bore 85, displacement 1.532 ✓ · 9. `YSD490D` cột 5: bore 90 ✓
10. yunnei-power/101 `HY120`: weight 171 kg, dims 1000*760*760 ✓ · 11. `HY200`: 285 kg ✓
12. koop-changzhou/101 `KD2V80`: trang "Multi-cylinder diesel engine KD2V80", `| model | KD2V80` ✓

## Rủi ro còn lại / quay lui
- Hàng Model của hãng động cơ bị coi là động cơ: nếu một hãng có bảng cột mà "Model" là tổ máy (không có hàng nhãn động cơ / "Generator") thì ra động cơ giả; cameo-power 122 (CF5500iS…) từng dính và đã chặn bằng hàng "Generator". Đã so toàn kho: 0 dòng cũ bị mất, 113 mới, chỉ 5 hãng. Khuyến nghị Khoa/điều phối liếc danh sách 113 (`genbid-test\spec-cols\corpus-after.json` so `corpus-before.json`).
- Quay lui: revert #575 (không đổi dữ liệu).

## Chưa kiểm được
- Chưa có PDF datasheet Cummins / Perkins / FPT thật dạng cột để thử (tải trực tiếp bị chặn, `sources/` hiện có chỉ là bảng hàng / một model). Hình dạng thử là mô phỏng đầu ra `pdftotext -table`; cần một lượt Tìm Thông Số thật hoặc tay một PDF cột của hãng để chốt.
- Lệch cột do `pdftotext -table` tự đặt ô sai (như #468) không đo được vì không có PDF mẫu.

## Đo bổ sung (điều phối yêu cầu): 113 dòng mới có phải động cơ máy phát không? (ĐO; `genbid-test\spec-cols\speed.mjs`, `cand.mjs`)
1. Tốc độ định mức của các dòng mới (116 khoá theo bộ đếm tay, ~113): yuchai 88, yangdong 22, yunnei-power 4, koop-changzhou 2. Yuchai: 81 dòng ghi tốc độ KHÁC 1500/1800 (hàng "Rated power/Speed" = 2200–2500 v/p, dải 650–1700 là mô-men; động cơ xe/máy công trình), 7 dòng không có ô tốc độ; yangdong 22, yunnei 4 và koop 1 không ghi tốc độ trong cột; 0 dòng ghi riêng 1500/1800. Tức phần lớn KHÔNG phải động cơ máy phát.
2. `candidates()` trước/sau #575 (trước = worktree 792484e, sau = nhánh spec-cols; cùng dữ liệu `suppliers/cn`, 16 cỡ 20–560 kVA, `50 Hz`, origin all, top 30): 480 ứng viên, 0 dòng khác nhau, 0 dòng của yuchai/yangdong/yunnei/koop vào top, 0 dòng cũ bị đẩy. Lý do: dòng mới không có công suất (`u.power` rỗng, nhãn "kW/rpm" không đọc ra kVA/kW theo `pairOf`) nên không qua `near()`.
3. Cách danh mục hiện xử lý tốc độ: `catalog.js` không lọc theo tốc độ; chỉ `config-bot` dùng rpm để suy tần số cho thông số công suất (`hzOfRpm`), nên 2200 v/p hiện không bị chặn ở đâu. Rủi ro tương lai: nếu sau này đọc được công suất cho các dòng này thì 2200 v/p sẽ lọt vào ứng viên. Đề xuất (chưa làm, chờ điều phối): trong nhánh `engineModel` bỏ cột có hàng "Rated power/Speed" ghi tốc độ ngoài {1000,1200,1500,1800,3000,3600}, hoặc gộp #575 như hiện tại (không ảnh hưởng ứng viên).

## Luật tốc độ (điều phối chọn LÀM, đã đưa vào #575; rebase lên main có #574)
- `web/catalog.js` nhánh `engineModel`: bỏ cột có tốc độ định mức GHI RÕ (hàng "Rated power/speed", "Rated speed"…, bỏ hàng max/torque/over/idle) ngoài {1000,1200,1500,1800,3000,3600}; cột không ghi tốc độ giữ. Test mới trong `spec-cols.test.mjs` (cột 2200 bỏ; 1500 giữ; không ghi tốc độ giữ; hàng "Max torque/speed" không tính).
- Đo lại (toàn kho, khoá nguồn|loại|model|tổ máy): dòng mới 113 → **38** (yuchai 10, yangdong 22, yunnei-power 4, koop-changzhou 2); **0 dòng cũ mất**. Yuchai 10 còn lại là cột chỉ ghi kW (hàng "Continuous power/speed" không kèm số vòng) nên không bỏ được theo luật "ghi rõ".
- `candidates()` 16 cỡ 20–560 kVA, 50 Hz, top 30, trước = origin/main 11b3a58, sau = nhánh: 480 ứng viên, **0 khác biệt**.
- Test 415 pass / 0 fail; verify 433 bản ghi, 0 lỗi.
