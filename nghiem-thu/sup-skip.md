# sup-skip — NCC loại trừ / xoá mềm không ra đầu ra bot (BƯỚC 1: rà + phương án, chờ duyệt)

Nguồn: origin/main 792484e. `web/api/requests.js` (kind=docs|stamps, coll=supplier) đã bỏ id có `supdeleted/<id>` hoặc `supexcl/<id>.on` → mọi đường đi qua `allDocs("supplier")` / `api(kind=docs&coll=supplier)` / stamps (kể cả doc-cache, vì cache dựng lại từ stamps) đã sạch.

| Đường | Đọc từ | Đã lọc? | Cần lọc? |
|---|---|---|---|
| config-bot prep (candidates, catalog, Tìm NCC `findjob`), check, specJob, specPost… (config-bot.mjs 1421, 4269–4338) | `allDocs("supplier")` / api | CÓ (qua requests.js) | — |
| config-bot prep khi `GENBID_LOCAL_SUPPLIERS=1` (1420, chỉ để thử/hồi quy) | `suppliers/cn/*.json` | KHÔNG | CÓ (rẻ: lọc cùng danh sách) |
| config-bot addToCatalog `existing` (3373) | `cn/*.json` trong worktree | KHÔNG | KHÔNG: chỉ để gộp/dedupe, cần thấy cả NCC đã loại để không thêm trùng |
| bidprice-bot (58, 113) | `allDocs("supplier")` | CÓ | — |
| genbid-sync.js prepSupplier (1749, bot Windows) | `allDocs("supplier")` | CÓ | — |
| discover.mjs `--genbid` (212) | `allDocs("analysis")` | n/a | — |
| discover.mjs save/finish (252–387) | `cn/*.json` | KHÔNG | KHÔNG: dedupe NCC mới, phải thấy cả NCC đã loại/xoá để không tìm lại |
| **gaps.mjs (184) + supplier-gaps.yml** | `cn/*.json` (+ specmatch/configmatch từ Supabase) | KHÔNG | **CÓ**: điểm thiếu thông số, danh sách hàng đứng đầu, và `specreq` tự gửi (queue) có thể rơi vào NCC đã loại |
| crawl-specs / crawl-datasheets / controllers / contacts / merge-specs / maker-datasheets / ocr-specs / catalog-pdf (`others`) / volvo-penta | `cn/*.json` | KHÔNG | KHÔNG: bảo trì CSDL repo, không phải đầu ra cho bot; (tuỳ chọn) bỏ qua NCC loại để đỡ tốn crawl |
| catalog-stats, web-memo `--list`, verify | `cn/*.json` | KHÔNG | KHÔNG: báo cáo tay |
| supplier-publish.yml | `cn/*.json` đổi → ghi supplier/<id> | KHÔNG | KHÔNG: web đã lọc ở requests.js, và ghi doc supplier không bỏ cờ supexcl |

Phương án (đề xuất A):
- A. Thêm `supexcl`, `supdeleted` vào READABLE của requests.js (bộ sưu tập rất nhỏ). Tạo `suppliers/sup-skip.mjs`: `skippedIds(read)` đọc 2 bộ qua `allDocs` (doc-cache, mỗi lượt chỉ đọc stamps vài trăm byte) + `dropSkipped(list, ids)`. gaps.mjs: lọc `suppliers` trước gapReport (đường Actions đọc trực tiếp Supabase bằng sbDocs, đường máy bot dùng allDocs); localSuppliers lọc cùng. Không thêm egress đáng kể.
- B. Ghi cờ vào tệp repo: loại — lệch với web (phải PR mỗi lần bấm Loại trừ), đụng publish workflow.
Rủi ro A: sửa requests.js (Vercel) cần deploy; gaps trong Actions không phụ thuộc điều đó (đọc Supabase thẳng).

---
# BƯỚC 2 — đã làm (phương án A, duyệt 12/11)
PR: (xem dưới, nháp, KHÔNG merge). Tệp đổi: `web/api/requests.js` (READABLE thêm supexcl, supdeleted), `suppliers/sup-skip.mjs` (mới), `suppliers/gaps.mjs`, `suppliers/config-bot.mjs` (chỉ `localSuppliers` + import), `.github/workflows/supplier-gaps.yml` (chú thích secret), `suppliers/sup-skip.test.mjs` (mới).
Hành vi: chỉ `supexcl.on===true` + mọi `supdeleted` bị bỏ; không đọc được danh sách → gaps vẫn ra báo cáo, `report.warning = "chưa lọc NCC loại trừ"`, KHÔNG gửi specreq; workflow cần secret SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (không in ra log).
Lệnh kiểm + đầu ra thật:
- `node --test suppliers/sup-skip.test.mjs` → 5 pass / 0 fail (3 unit: on/off/lỗi đọc; 2 gaps: đọc được → không cảnh báo; không đọc được → cảnh báo + không "Gửi Tìm Thông Số").
- Chạy gaps với bidhist THẬT (doc-cache) + skipfile giả lập: không loại → hàng đợi 10 hãng có `mecca-power` (346,7 điểm); `supexcl/mecca-power {on:true}` → hàng đợi 10 hãng, không còn `mecca-power`, không cảnh báo.
- Chưa kiểm được: đọc `supexcl` THẬT từ web — live trả `HTTP 400` cho coll=supexcl cho tới khi requests.js được deploy (kiểm 12/11). Trước deploy, gaps trên máy bot rơi vào nhánh "chưa lọc" (an toàn: không gửi specreq); trong Actions đọc Supabase trực tiếp nên lọc được ngay. Sau deploy chạy lại: `node suppliers/gaps.mjs` với 1 NCC đang Loại trừ thật.
Rủi ro/quay lui: revert PR; requests.js thêm 2 coll đọc được (đã có token bot). Ghi chú: 2 test gaps mỗi cái ~50 s (dựng catalog), CI +~100 s.
