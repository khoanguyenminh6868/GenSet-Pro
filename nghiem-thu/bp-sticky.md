# bp-sticky — giữ mức xếp cũ của agent (A, PR) + đo phân vị nội suy (B, chỉ đo)

Ngày 13/11/2026. Nguồn việc: `bp-low-dao-dong.md` (IB2600601812 mức thấp 296 ↔ 239 triệu vì agent lật IB2600089010).

## A. PR https://github.com/khoanguyenminh6868/GenSet-Pro/pull/605 (draft, CI xanh: 2 qua, 1 bỏ qua)

Tệp: `suppliers/bidprice-bot.mjs`, `suppliers/bp-sticky.test.mjs` (mới). Không đụng `web/bidprice.js`, `genbid-hsmt\`.

- `bidprice.result.ratings = { sig, tender, notes, items{"<TBMT>|<lotNo>": {level, same, diff, quote, h}} }` (gói nhiều cỡ: trong result từng cỡ). Chỉ lưu mức đã qua kiểm câu trích; lượt read-guard báo đọc không hết thì không lưu mức mới.
- Lượt sau: ứng viên có mức cũ → dùng lại (thắng mọi câu agent nói về gói đó); samples.md chỉ còn ứng viên MỚI; không có gói mới → không gọi agent (dùng lại tóm tắt gói cũ). `result.rated = {kept, fresh, why}` + một dòng log.
- `h` = sha1(sampleText gói cũ): bidhist gói cũ đổi → chỉ gói đó xếp lại.
- **Khoá so sánh `ratingSig`** (đổi → xếp lại toàn bộ): hãng+model động cơ, hãng+model đầu phát của cấu hình hạng 1 (cấu hình đầu không trượt đồng bộ thương hiệu); nhóm xuất xứ động cơ; K làm tròn; mức liên tục/dự phòng; số bộ phận đồng bộ thương hiệu HSMT đòi; sha1(norm(cfgText)) (yêu cầu kỹ thuật code đọc: technicalSpecs của phân tích, không có thì phần kỹ thuật HSMT); cỡ máy + số lượng (gói nhiều cỡ); `RATING_V`. KHÔNG gồm giá gói, bộ điều khiển.
- **Buộc tay:** `GENBID_BIDPRICE_RERATE=1`; `rerate: true` trong `bidpricereq/<TBMT>` (hoặc `basis.rerate`; bot ghi lại yêu cầu không kèm trường này → chỉ một lượt); `try --rerate`. `try` nay đọc bidprice cũ để giống lượt thật.

Lệnh kiểm (đầu ra thật):
- `node --test suppliers/bp-sticky.test.mjs` → 4/4 qua. Test 1: pool 8 gói kiểu IB2600601812; lượt 2 agent lật B5 (0,868, 5 NT) sang "different" → giữ "close", cùng pool 8, cùng 3 mức thô + calib; lượt 3 không có result.json → như cũ; đối chứng không giữ → pool 7, mức đổi.
- `node --test suppliers/*.test.mjs` → `# tests 513 # pass 513 # fail 0`.
- `node suppliers/bidprice-backtest.mjs --calib` (doc-cache 12/11, 1.556 gói, 808 phần, 285 s): hiệu chỉnh cùng phần **n=635, phủ 62,4%, sai mức giữa 5,7, rộng 13,8** — y như trước (backtest không có bước agent nên PR không thể đổi nó; chạy để chứng minh công thức giữ nguyên). Nửa sớm 52,7%, nửa muộn 72,0%.

Rủi ro: mức sai của agent bị giữ tới khi khoá đổi hay bấm rerate. Phân tích HSMT chạy lại sinh chữ khác → khoá đổi → xếp lại toàn bộ (đúng nghĩa nhưng có thể hơi nhạy). Quay lui: revert PR; trường `ratings` thừa không ảnh hưởng web.

Chưa kiểm: lượt thật trên bot (cần merge + restart task bot). Web chưa có nút "Xếp lại" (chỉ đặt `rerate` bằng tay).

## B. Phân vị có trọng số NỘI SUY thay "lấy điểm" (`wQuantile`) — CHỈ ĐO, không đưa vào PR

Cách nội suy: điểm i đặt ở (tích luỹ trước + w_i/2)/tổng, nối thẳng hai điểm kề, ngoài hai đầu thì lấy đầu. Giữ lam 0,5, q 0,2, s 1,1. Bản thử ở scratchpad (`interp/web/bidprice.js`), chạy cùng doc-cache; 3 mức thô (`base`) trùng 100% giữa hai lượt → chỉ khác `wQuantile`. Đo trên đúng 635 phần.

| | Phủ [thấp,cao] | Sai mức giữa (trung vị, điểm) | Rộng (điểm) | giữa−thấp |
|---|---|---|---|---|
| Chung — lấy điểm (hiện nay) | **62,4%** | 5,7 | 13,8 | 7,9 |
| Chung — nội suy | **63,8%** | 6,7 | 17,2 | 10,0 |
| Nửa sớm (trước 30/09/2024, nửa chọn s) — lấy điểm | 52,7% | 6,9 | 11,2 | |
| Nửa sớm — nội suy | 58,0% | 7,8 | 15,8 | |
| **Nửa muộn (ngoài mẫu) — lấy điểm** | **72,0%** | 5,1 | 15,9 | |
| **Nửa muộn — nội suy** | **69,5%** | 5,9 | 18,8 | |

Theo số nhà thầu (cả kỳ, lấy điểm → nội suy): 2–3 NT 66,4 → 63,4%; 4–5 NT 53,5 → 60,5%; ≥6 NT 42,3 → 53,2%; 1 NT 77,3 → 74,2%.

IB2600601812 (P = 466 tr, pool 8 của lượt 3, fc lượt 3), bỏ từng gói khỏi pool, mức thấp / giữa / cao (triệu):

| Gói bỏ | tỉ lệ | NT | Lấy điểm | Δ thấp | Nội suy | Δ thấp |
|---|---|---|---|---|---|---|
| (đủ 8) | | | 296 / 405 / 466 | | 256 / 400 / 465 | |
| IB2500611943 | 0,656 | 6 | 239 / 440 / 465 | −57 | 241 / 405 / 465 | −15 |
| IB2200060818 | 0,945 | 2 | 296 / 405 / 466 | 0 | 249 / 391 / 466 | −7 |
| IB2300030889 | 0,994 | 2 | 296 / 405 / 465 | 0 | 249 / 391 / 452 | −7 |
| IB2400560854 | 0,501 | 5 | 378 / 440 / 465 | +82 | 316 / 412 / 465 | +60 |
| IB2400232891 | 0,552 | 8 | 292 / 440 / 465 | −4 | 291 / 405 / 465 | +35 |
| IB2300165112 | 0,985 | 2 | 296 / 405 / 466 | 0 | 249 / 391 / 453 | −7 |
| IB2200106999 | 0,822 | 3 | 292 / 440 / 465 | −4 | 246 / 423 / 464 | −10 |
| **IB2600089010** | 0,868 | 5 | 239 / 440 / 465 | **−57** | 236 / 387 / 466 | **−20** |

Δ thấp lớn nhất 82 → 60; trung bình |Δ| 25,5 → 20,1 tr; gói ranh giới IB2600089010 57 → 20. Mức giữa nhảy tối đa 35 → 23 tr. Nhưng nội suy làm mức thấp đủ 8 gói tụt 296 → 256 tr và nhiều gói bỏ ra (nhóm 2 NT) giờ có lệch nhỏ thay vì 0 (mượt hơn, không "đứng yên rồi nhảy").

Đọc số: nội suy mượt hơn với một gói (đúng mục đích), phủ chung +1,4 điểm nhưng NGOÀI MẪU (nửa muộn) phủ giảm 72,0 → 69,5%, sai mức giữa tăng 5,1 → 5,9, khoảng rộng hơn 3–4,5 điểm. Phần phủ thêm chủ yếu đến từ khoảng rộng hơn, không phải chính xác hơn. Gợi ý: nếu muốn dùng nội suy thì phải chọn lại s (nhỏ hơn 1,1, trên nửa sớm) để cùng độ rộng rồi so lại — chưa làm. Với A đã giữ mức xếp, lý do chính của dao động (agent lật) đã hết; nội suy chỉ còn đáng xét nếu Khoa muốn giảm độ nhạy khi tập ứng viên thật sự đổi.

Tệp đo: scratchpad phiên con `...\d4f0667d-...\scratchpad\` (rows-base.json, rows-interp.json, drop-*.json, patch.mjs). Bẫy: chép `web/*.js` đi nơi khác phải chép cả `web/package.json` (thiếu thì catalog.js nạp kiểu CommonJS, không gắn GenbidCatalog → nhóm xuất xứ null, pool khác).
