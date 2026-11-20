# tan-so-ca-hai-1 — HSMT ghi cả hai tần số = không ràng buộc (PR draft riêng từ origin/main 2ed96b02)

Việc (điều phối 20/11/2026, Khoa quyết "sửa gốc trước rồi mới merge #954"): `hintsOf` đọc "Tần số: 50 & 60hz" là 60 Hz (`/\b50\s?hz\b/` không khớp "50 & 60hz", `/\b60\s?hz\b/` khớp) nên luật `ruled: freq` ("động cơ mọi dòng có tần số đều ghi một tần số khác HSMT, ≥ 2 dòng") loại oan dòng 50 Hz. Gốc của 40 dòng rời ở #954 (IB2400073761).

## Sửa
Chỉ vùng tần số của `hintsOf` (`suppliers/config-bot.mjs`), không đụng vùng nhiên liệu của #963: hàm mới `freqOfHsmt(t)` (xuất ra để test) thay hai regex `f50` / `f60`:
- như cũ: `50Hz` / `60Hz` đứng riêng; có cả hai chữ Hz → null.
- mới: một CẶP "số SEP số" có chữ Hz ở một phía (SEP: `/ & - – — ÷ , ; ~ hoặc hay và or and đến to`) = cả hai tần số → null.
- chặn nhầm: số thứ hai không được kèm đơn vị / số khác ("380V-50Hz-60/66 kVA": 60 là kVA; `(?!\s*(?:\/\s*\d|kva|kw|kvar|va|a|v|%))`); cặp không có chữ Hz không tính (cáp "50/60x100", rơ le "50, 50N, 51").
Test `suppliers/freq-both.test.mjs` (21 ca: mỗi kiểu viết thật + ca một tần số + ca chặn nhầm).

## Quét TOÀN BỘ chữ HSMT trong bidhist cục bộ (1.259 gói có chữ, `technicalPart` như `hintsOf` dùng)
Kiểu viết cặp 50 / 60 tìm được (số gói / `hintsOf` cũ → mới), script `genbid-test\b3\scan-freq2.mjs`, `scan-freq3.mjs`, `scan-freq4.mjs`, `scan-final.mjs`:
| kiểu viết (số → N) | gói | kết quả cũ | kết quả mới |
|---|--:|---|---|
| `N/Nhz` ("50/60Hz") | 21 | 60 ×5, null ×16 (16 gói còn ghi chữ "50Hz" ở chỗ khác) | 60 → null ×5, null ×16 |
| `N/N hz` | 13 | null ×13 | không đổi |
| `N-Nhz` | 4 | 60 ×1, null ×3 | 60 → null ×1 |
| `N/N`, `Nhz/Nhz`, `N hz và N hz`, `Nhz-Nhz`, `Nhz / Nhz`, `N, N` | 2, 2, 2, 2, 1, 1 | null | không đổi |
| `N & Nhz` ("50 & 60hz") | 1 | 60 | null |
| `N / Nhz` ("50 / 60Hz") | 1 | 60 | null |
| `N; N`, `N/N ` (không có Hz) | 1 mỗi kiểu | 50 | không đổi (là số khác, xem dưới) |
| `Nhz-N` ("50Hz-60/66 kVA", IB2600006758) | 1 | 50 | 50 (chặn nhầm: 60 là kVA) |
Tổng kết quả toàn bộ gói (cũ → mới): 50 → 50: **816**; null → null: **433**; 60 → 60: **2**; **60 → null: 8**; không có chuyển nào khác. Không gói nào ghi MỘT tần số đổi kết quả.
**Đúng 8 gói đổi, đúng như điều phối nêu** (cũ 60 → mới null):
| gói | chữ HSMT (đoạn nguyên văn) | là gì |
|---|---|---|
| IB2200058001 | "Máy phát điện FG Wilson LL3014H: Tần số 50/60Hz" | tổ máy |
| IB2400073761 | "Máy 250 kVA (STT 1): Tần số: 50 & 60hz" | tổ máy |
| IB2500240059 | "tần số máy phát 50 / 60Hz" | tổ máy |
| IB2400270596 | "Điện áp đầu vào 100-240V AC, 50-60Hz" | đầu vào thiết bị khác |
| IB2400454375 | "Rơ le G60: Nguồn cấp xoay chiều: 100 ÷240VAC/0,75A/50/60Hz" | rơ le |
| IB2500314001 | "Bộ nạp ắc quy từ điện lưới: Điện áp đầu vào 90 ~ 280 VAC, 50/60Hz" | bộ nạp |
| IB2500500319 | "Bộ nạp ắc quy từ điện lưới: Đầu vào 90 ~ 280 VAC, 50/60Hz" | bộ nạp |
| IB2500551987 | "ATS: Điện áp hệ thống 3P4W AC170V~AC277V, 50/60Hz" | ATS |
Lưu ý: 5 trong 8 là tần số ĐẦU VÀO của thiết bị khác (bộ nạp, rơ le, ATS) lẫn vào chữ HSMT; cũ đọc ra 60 Hz (sai), mới "không ràng buộc" (đúng hơn, không phải mới nghĩa là gói yêu cầu cả hai).
**Ca em chặn lại** (bản thử đầu, chưa có chặn, đổi 9 gói): IB2600006758 "Máy phát điện 60 kVA: Công suất: Máy phát điện 380V-50Hz-60/66 kVA": "-60/66 kVA" không là tần số; có chặn thì gói này giữ 50 Hz như cũ (có ca test).
Cặp 50/60 KHÔNG có chữ Hz (không đổi, đã xem hết 5 chỗ): IB2200018116 "Máng cáp 50/60x100x2000 mm", IB2300147913 "3 x 95 + 1 x 50; 60 đầu cốt", IB2400333932 "Bảo vệ 50, 50N, 51, 51N, 27, 59, 81…", IB2400588970 "(30/30/60/60 phút)", IB2500310648 "12V-50/60/70Ah".
Còn 10 chỗ 50…60 gần chữ Hz / "tần số" mà không bắt (xem hết): 8 chỗ là một tần số (IB2300247709, IB2300364915, IB2400060910, IB2400142224, IB2400489361, IB2500031588, IB2500512614, IB2600020985: "50Hz" kèm số khác như "220/380V - 50Hz", "50 kVA"), một chỗ là IB2300194791 "tần số 60Hz, khác với 50Hz ở bảng mục 1.2" (có cả hai chữ Hz: cũ đã null); riêng IB2400265303 "tần số vào Min ≤ 50 - Max ≥ 60 Hz" (dải tần số đầu vào, kiểu viết này chưa bắt: sẽ đọc 60 như cũ; chưa gói nào cần, nếu muốn bắt thì thêm kiểu "Min ≤ 50 - Max ≥ 60").

## Kiểm
- `node --test web/test/*.test.mjs suppliers/*.test.mjs`: xem tệp tests cuối nghiệm thu (kết quả ghi trong PR).
- Kỳ vọng đo cloud (điều phối): chỉ 8 gói trên có thêm dòng 50 Hz (không bị `freq` nữa); gói khác không đổi (đã đếm: 816 + 433 + 2 gói không đổi `hints.freq`).
- Sau merge: gộp main vào #954, đo lại, kỳ vọng 40 dòng IB2400073761 không còn rời.

## Cần ghi nhớ
- Bẫy ở `suppliers/CLAUDE.md` mục "Tần số HSMT".
- Khoa 20/11/2026 quyết: sửa gốc ở PR riêng rồi mới merge #954.
