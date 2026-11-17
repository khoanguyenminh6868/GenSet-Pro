# Nghiệm thu egress-rt — realtime docs bỏ hsmttext

- PR (draft): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/570 (nhánh `egress-rt`, worktree `wt-egress-rt` đã gỡ)
- Tệp đổi: `web/shim.js` (ensureChannel/onChange tách ra; thêm `RT_FILTER`; `console.warn` nếu ai `watch("hsmttext")`).

## Thay đổi
Kênh `docs` trước: một listener `event:"*"` toàn bảng. Sau: `INSERT` và `UPDATE` với `filter: "coll=neq.hsmttext"`, `DELETE` không lọc
(Supabase không lọc được DELETE; DELETE chỉ mang khoá nên rẻ). Cùng một handler `onChange`, logic không đổi. Tắt: `RT_FILTER = ""` (trở về `*`).
Web chỉ đọc hsmttext bằng `doc().get()` (index.html:1180), không `watch`, và `cache` không có hsmttext nên handler cũ vốn bỏ mọi sự kiện hsmttext → không mất cập nhật nào.
Coll khác (hsmt, analysis, supplier, bidhist, *req...) vẫn qua cùng filter `neq` → vẫn nhận INSERT/UPDATE; DELETE nhận như cũ.

## Đã kiểm
`node genbid-test\egress-rt-test.mjs <shim.js>` (vm + Supabase giả ghi lại `.on(...)`):
- main:  `registered: [{"event":"*","table":"docs"}]` → OK
- nhánh: `registered: [{"event":"INSERT","filter":"coll=neq.hsmttext"},{"event":"UPDATE","filter":"coll=neq.hsmttext"},{"event":"DELETE"}]` → OK
  (1 kênh subscribe; UPDATE/INSERT/DELETE của coll đang theo dõi vẫn tới trang và gọi listener.)
Số đo: không đo được trên Realtime thật (xem dưới). Ước tính: hsmttext ≈ 55% byte ghi (59 / 107 MB, 01–10/11) → ~0,15–0,3 GB/tháng cho mỗi tab đang mở, và mỗi đợt specs lớn (1.650 phần) tiết kiệm ~50 MB × số tab.

## CHƯA kiểm được — Khoa/điều phối kiểm trên web (phiên thành viên thật, bản preview Vercel của PR)
Realtime báo SUBSCRIBED cả với filter sai, khoá anon bị RLS chặn hết sự kiện → chỉ phiên thành viên thật mới thấy. Làm theo thứ tự:
1. Mở preview ở 2 tab (A, B) cùng tài khoản thành viên. DevTools → Network → WS (`realtime/v1/websocket`) ở tab B: khung `phx_join` phải chứa 2 mục `postgres_changes` có `"filter":"coll=neq.hsmttext"` (INSERT, UPDATE) và 1 mục DELETE không filter.
2. UPDATE: tab A sửa ghi chú/trạng thái một gói (ghi `hsmt/...` hoặc `analysis`) → tab B đổi không cần tải lại.
3. INSERT/DELETE: tab A thêm gói thủ công rồi xoá → tab B thấy xuất hiện/biến mất.
4. hsmttext: tab A bấm Lấy tệp/xem nội dung HSMT (ghi hoặc đọc hsmttext) → ở tab B WS không có khung nào mang `"coll":"hsmttext"`; nội dung HSMT vẫn mở được (đọc trực tiếp).
5. Cùng lúc bot ghi (vd. Phân tích) → tab B vẫn nhận analysis.
Nếu mục 2/3 không chạy: đặt `RT_FILTER = ""` (một dòng) hoặc revert PR.

## Rủi ro còn lại / quay lui
- Nếu sau này ai `watch("hsmttext")` sẽ không nghe thay đổi (có `console.warn`).
- Filter hỏng âm thầm (đã nêu) → bước 2–3 là cách bắt. Quay lui: revert PR (không có dữ liệu/SQL kèm theo).
- Đã xoá nhánh cục bộ cũ `egress-realtime` (commit d48de8b đã vào PR bằng cherry-pick).
