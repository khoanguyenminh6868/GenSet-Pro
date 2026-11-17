# Nghiệm thu: hồ sơ hãng BĐK Datakom, DEIF, Woodward — ho-so-bdk

- Nhánh `ho-so-bdk`, worktree `C:\Projects\GenSet Pro\wt-ho-so-bdk` (từ origin/main 85ce4a84). PR draft: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/866 (chưa merge).
- Phạm vi: chỉ 3 hồ sơ mới + `sources/`. KHÔNG sửa `web/catalog.js`, schema, verify, test.

## Tệp đã đổi
- `suppliers/cn/datakom.json`, `deif.json`, `woodward.json` (role `controller_maker`, status `incomplete`, confidence `medium`; chỉ `productLines` tối thiểu, không thông số).
- `suppliers/sources/datakom/6001-6002.md`, `deif/6001-6002.md`, `woodward/6001.md` — lưu bằng `fetch-source.mjs`, mở lại ngày 17/11/2026, không trang nào bị chặn (không cần Firecrawl).

## Dữ liệu
| Hãng | manufacturing[] | productLines |
|---|---|---|
| Datakom (TR) | Istanbul, manufacture, câu trích "started building its new factory" + "moved to its new factory of 5000m2" (không `products`); mục riêng mặc định TR `khoa: "Khoa chốt 16/11/2026"` | "DC Genset Controllers" (tên nhóm trên trang chủ) |
| DEIF (DK) | Skive, "All products", "We manufacture all our products in-house at our Danish HQ in Skive" + "now being manufactured in Denmark" | AGC 150 series; iE 250 Intelligent Energy Controller |
| Woodward (US) | Kraków PL, products easYgen-1500/2000/3000/3000XT, LS5, DTSC200, IKD1M; KHÔNG easYgen-800 (`manufacturingNote`) | easYgen-3000XT |

## Lệnh kiểm (đầu ra thật)
- `node suppliers/verify.mjs` → "438 bản ghi, 0 có lỗi" (trước: 435).
- `node --test suppliers/` → tests 943, pass 943, fail 0.
- `node suppliers/quality.mjs --check` → "không chỉ số nào xấu đi quá ngưỡng", exit 0.

## Số đo
435 → 438 hồ sơ (đo); controller_maker 4 → 7; 5 mục `manufacturing` mới (1+1 Datakom, 1 DEIF, 1 Woodward).

## 3 mẫu đối chiếu
1. https://www.deif.com/land-power/ — "We manufacture all our products in-house at our Danish HQ in Skive" (`sources/deif/6001.md` dòng 457).
2. https://support.woodward.com/en-US/kb/articles/ipcs-controls-products-pcba-s-are-conformal-coated-2 — "All Stuttgart controls manufactured in Woodward Krakow," (`woodward/6001.md`).
3. https://datakom.com.tr/NewsDetail/announcement-regarding-the-construction-of-new-factory/44?lang=5 — "Datakom started building its new factory in Istanbul." (`datakom/6001.md`).

## Rủi ro và quay lui
- Hồ sơ mới hiện trong danh sách NCC trên web (đã được Khoa đồng ý); có thể bị Tìm Thông Số / gaps xử lý như NCC thường vì có `website` nhưng chưa có bảng thông số → nếu thấy phiền, `spec-todo.mjs --mark <id> --why "..."`. Quay lui: `git revert` PR.
- `country` của Woodward = US (trụ sở Fort Collins) KHÔNG có nguồn lưu trong hồ sơ; nếu muốn chặt thì đổi hoặc bổ sung nguồn "about".
- Datakom "5000m2" nguồn chỉ nói chuyển nhà máy mới, không nói sản xuất sản phẩm nào.
- Tên đầy đủ pháp lý (`names.en`) của DEIF A/S, Woodward, Inc. không kiểm với nguồn đã lưu; Datakom lấy từ tiêu đề trang.

## Chưa kiểm
- Không mở lại easYgen-800 manual (PDF không đọc được, không ghi).
- Chưa kiểm hiển thị trên web (PR dữ liệu, deploy sau merge).
