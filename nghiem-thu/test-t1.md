# Nghiệm thu T1 — test hàm thuần còn lại của web/bidprice.js

- Nhánh: `test-t1-bidprice-rest` (worktree `C:\Projects\GenSet Pro\wt-test-t1`), PR nháp: xem cuối tệp.
- Tệp đổi: chỉ thêm `suppliers/bidprice-rest.test.mjs` (61 ca). Không sửa `web/bidprice.js`.

## Số đo (đo bằng script đếm tên hàm có mặt trong `suppliers/*.test.mjs`, không tính tệp mới)
- `root.GenbidBidprice` xuất 52 hàm. Chưa tệp test nào nhắc tới: **trước 16** (engineWords, engineGroup, readTerms, quoteStale,
  compRows, lockStats, nbBucket, wonTokens, wonSetRow, vnMadeSet, placeOf, capPick, cfgKva, taxKey, bdPrice, compareCfg);
  **sau 0**. Ngoài ra thêm ca cho cfgPower, costHints (trước chỉ 1 chỗ nhắc).
- `node --test suppliers/bidprice-rest.test.mjs`: 61 ca, 58 đạt, 0 hỏng, 3 `todo`, 0,3 giây.
- `node --test suppliers/*.test.mjs`: 609 ca, 604 đạt, **0 hỏng**, 5 `todo` (2 có sẵn + 3 mới), ~39 giây.
- Ghi chú: `taxKey`, `bdPrice` không đủ để gọi trực tiếp từ bên ngoài nghiệp vụ chính nên đo qua `compRows`
  (`win`/`taxes`/`ratio`); `capPick` gọi trực tiếp với kết quả `matchAll`.

## Lỗi tìm được (ca `todo`, chưa sửa) — đo trên `genbid-work\doc-cache\bidhist.json` (1.556 gói, 1.247 hàng tổ máy có xuất xứ)
1. **`placeOf` không chuẩn hoá NFC**: "Trung Quốc" ở dạng NFD → `null` thay vì `cn`. 29/1.247 hàng có xuất xứ NFD, 7 hàng đổi kết quả nếu NFC.
2. **`placeOf` regex `\bmỹ\b`, `\bđức\b` không bao giờ khớp** (`\b` của JS không coi ỹ, đ là chữ): "Mỹ" 6 hàng, "Đức" 2 hàng ra `null`.
3. **`placeOf` thiếu nước**: "Anh" 5, "Ý" 7, "Anh Quốc" 4, "Hoa Kỳ" 1, "BỒ ĐÀO NHA" 2 hàng → `null` (Thái Lan, Malaysia cũng null).
   Tổng 1+2+3 ≈ 27 hàng tổ máy ngoài Trung Quốc rõ ràng mà `placeOf` không phân loại được. Ảnh hưởng: `profileOf`/`engineGroup`
   không gán được `foreign` từ xuất xứ khi chưa biết hãng (nhóm ra `null`, gói đó bị coi chưa rõ nhóm).

## Khoá hành vi (không rõ đúng sai, ghi ngay trong ca)
- `placeOf("Động cơ Mỹ (USA), đầu phát Trung Quốc")` = `cn` (kiểm Trung Quốc trước).
- `wonTokens`: tên tiếng Anh chỉ lấy từ ≥ 4 ký tự ("MTU Friedrichshafen" → "friedrichshafen").
- `taxKey` với "0101234567-001" gộp chi nhánh thành một chuỗi số dài (không đưa vào test).

## Rủi ro / quay lui
- Chỉ thêm một tệp test; quay lui = xoá tệp. Không phụ thuộc mạng, giờ hệ thống (quoteStale truyền `now`), hay `genbid-work`
  (ca lấy hình dạng dữ liệu thật rồi viết tay nhỏ gọn).
- Chưa kiểm: chạy trên ubuntu CI (chỉ chạy Windows, Node 20.17); `financeCost`, `feasibility`, `quoteCost`, `rivalsOf`, `nbForecast`… đã có test
  ở tệp khác, T1 không đào sâu thêm.

## Cần ghi nhớ
- Quyết định cần Khoa/điều phối: có sửa `placeOf` (NFC + `\b` + thêm nước G7: Anh, Ý, Hoa Kỳ, Đức, Mỹ) không — ảnh hưởng nhóm xuất xứ khi chọn gói tương tự, nên đo lại bằng `bidprice-backtest` trước khi merge.

PR nháp: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/626
