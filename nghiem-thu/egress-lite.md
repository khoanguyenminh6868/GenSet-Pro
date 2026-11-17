# Nghiệm thu egress-lite — bản rút gọn analysis cắt trong Postgres

- PR (draft): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/571 (nhánh `egress-lite`, worktree `wt-egress-lite` đã gỡ)
- Tệp đổi: `web/api/lite.js`; mới `web/supabase/analysis-lite.sql`.

## Thay đổi
- SQL: hàm `lite_txt(jsonb)` (như `${v || ""}` của JS), `lite_analysis(jsonb)` (giữ ≤3 dòng technicalSpecs nêu công suất, thêm `_lite:true`, đúng POWER/POWER_N của lite.js; chữ có dấu viết `[ôÔ]`,`[ấẤ]` để không phụ thuộc locale; `\y` thay `\b`), view `public.analysis_lite with (security_invoker = true)`; `revoke ... from anon`, `grant select ... to authenticated, service_role`. RLS của `docs` (is_member) áp theo token người gọi.
- lite.js: `coll=analysis` đọc `rest/v1/analysis_lite` (cùng Range/ids/order). 401 → trả 401. Bất kỳ lỗi khác (404 chưa có view, 403 thiếu quyền, 5xx, mạng, body không phải mảng hàng `_lite:true`) → đọc đủ + cắt như cũ, nhớ 10 phút, `console.warn` (cùng kiểu #485). Đưa `_lite` về cuối khoá để JSON giống hệt bản cũ.

## Đã kiểm (Postgres thật cục bộ = PGlite; dữ liệu thật = `doc-cache\analysis.json`, 1.287 hàng, 17,57 MB)
`genbid-test\egress-pg\compare.mjs` (SQL vs hàm JS cũ): `rows 1287, withSpecs 1286, keptRows 2816, identicalCanonicalMd5 1287, diff []`; md5 thô khác 1287/1287 chỉ vì vị trí khoá `_lite` (jsonb sắp khoá khác JS) — đã xử trong lite.js.
`genbid-test\egress-pg\handler.mjs` (handler lite.js mới chạy trên PGlite, phân trang 300 như web):
```
old path rows 1287
view path rows 1287 md5 identical per row: 1287 / 1287 calls [ 'analysis_lite' ]
ids= query identical, 7 rows
view 404: fallback rows identical=true, view tried 1x over 5 pages
view 403: ... identical=true, view tried 1x   view net: ... true, 1x   view bad: ... true, 1x
401 -> 401
ALL OK
```
Số đo: byte JSON trước/sau (đo): 17.573.239 → 3.149.708 (còn 17,9%, bỏ 82%).

3 mẫu đối chiếu (doc-cache, specs gốc → giữ): `DA-mvqhhehr` 31 specs → dòng "Công suất … 2500kVA"; `IB2200001635` 23 → "20 chiếc máy phát điện 100 kVA"; `IB2200004566` 23 → "Công suất dự phòng ≥ 35 kVA". (Nguồn là dữ liệu analysis của chính hệ thống, không phải URL ngoài.)

## Ước tính GB/tháng tiết kiệm (ƯỚC TÍNH, chưa đo được thật)
Egress Supabase → Vercel của `/api/lite`: mỗi lượt đọc đủ analysis giảm 14,4 MB (17,6 → 3,1 MB); mỗi lần `lite` gọi cho hàng đổi giảm ~16 KB/hàng (20 → ~2,4 KB).
- Mục 3 (realtime analysis × tab): đợt specs ~1.139 hàng × ~17 KB × 2 tab ≈ 39 MB/đợt; 2–4 đợt/tháng ≈ **0,08–0,16 GB**.
- Mục 5 (máy/trình duyệt mới hoặc iOS xoá IDB): vài lần/tháng × 14,4 MB ≈ **0,05–0,15 GB**.
- Tổng ≈ **0,1–0,3 GB/tháng** chưa nén (≈0,02–0,07 nén). Khiêm tốn: phần chính của mục 3/5 vẫn là bidhist/supplier và realtime. Giá trị lớn hơn khi có đợt ghi analysis lớn nhiều tab.

## SQL để Khoa chạy tay
Supabase → SQL editor, dán nguyên nội dung `web/supabase/analysis-lite.sql` (chạy lại được). CHỈ sau khi PR merge/deploy (trước đó vô hại: lite.js cũ không dùng view).
Sau khi chạy: (1) mở web bằng phiên thành viên → danh sách phân tích hiện như cũ; log Vercel không có dòng `analysis_lite: HTTP ...`; (2) so `/api/lite?coll=analysis&ids=DA-mvqhhehr,IB2200001635` trước/sau (có token thành viên) → JSON phải giống nhau; (3) anon gọi `rest/v1/analysis_lite` phải 401.
Quay lui: `drop view if exists public.analysis_lite; drop function if exists public.lite_analysis(jsonb); drop function if exists public.lite_txt(jsonb);` (lite.js tự rơi về đường cũ trong ≤10 phút.)

## CHƯA kiểm được
- Chưa chạy trên Supabase thật: RLS `is_member` qua security_invoker với token thật, quyền grant/revoke, locale Supabase (đã tránh phụ thuộc bằng ký tự liệt kê; PGlite chạy cùng engine Postgres nhưng không có role/RLS thật).
- Vercel preview chưa thử đầu-cuối; chưa đo egress thật (không có Usage).
- Hàng analysis mới sau 10/11 không có trong doc-cache (cache mới nhất 17,2 MB, 1.287 hàng).
- Khác biệt tiềm ẩn nếu `item/requirement` là kiểu không phải chuỗi (JS ép "[object Object]"): không có trong 1.287 hàng thật (md5 trùng hết).
