# IB2600603983: vì sao Gợi ý không ra cấu hình đúng (20/11/2026)

Phiên điều phối của đợt này: `session_011tAj4Mp31GbgmLRtLgBxSA`.

## Cấu hình đúng (Khoa nêu 20/11/2026)
- Động cơ Baudouin 6M31G825/5
- Đầu phát Leroy-Somer LSA 49.3 M8, kích từ AREP + AVR D350 (hoặc PMG + D350) → dòng ngắn mạch duy trì 300% (3 In) trong 10 giây
- Bộ điều khiển DSE7320 MKII + mô-đun DSE890 MKII (4G / Ethernet Gateway)

## Hệ thống đã ra gì
- Kết quả lưu (`configmatch`, 17/11 06:34Z): 8 cấu hình; 6M31G825/5 hạng 3, KHÔNG có đầu phát, BĐK DSE7420, 29 "chưa rõ" (Perkins 4006-23TAG2A hạng 1: 26; Cummins QSK23-G2 hạng 2: 25).
- Code main 1e712e19 chạy lại bước xếp ứng viên (`cand.mjs` → `cand-out.txt`): dòng tốt nhất của 6M31G825/5 (voltgent n110) 190 điểm, hạng thô 141 / 477, NGOÀI 30 dòng. Ba chỗ `MAKE_ROWS` của Baudouin: 6M33G750/5 (235), 6M33G825/5 (238), "6M33G8D3/5 (6M33G825/5)" (213, kaihua-genset n119 ghi hai mã một ô).

## Nguyên nhân
1. Động cơ thiếu dữ liệu: 6M31G825/5 chỉ có 4 dòng NCC ở TQ (agg-fuzhou n107, voltgent n110, weichai-heavy-machinery n106, weichai-power n134) + cgm-italia n101, green-power-generators n110 (NCC Ý, bị lọc vì HSMT chỉ đòi G7 ở bộ phận). Thông số: 6 xi lanh, 149×177, điều tốc, khí thải. `suppliers/cn/baudouin.json` không có dòng 6M31 nào. Trang hãng `https://baudouin.com/engine_product/6m31/` (mở được 20/11) ghi: 6 In line, 149x177, 18.5 L, High pressure common rail, ECU, Turbocharged & air-to-air cooled, 6M31G825/5 PRP 680 kWm / ESP 740 kWm; có link Rating Card 50 Hz / 60 Hz (PDF). Trang không ghi tỉ số nén, tiêu hao.
2. Tỉ số nén "14 : 01" (HSMT ghi trơ) không loại được ai: 13,6 / 16 / 16,5 đều "chưa rõ".
3. Đầu phát chỉ lấy từ ô cùng dòng tổ máy của NCC (config-prompt.md: "appear together in the same genset row"). Không dòng nào ghi 6M31G825/5 kèm đầu phát. Datasheet hãng đã lưu `suppliers/sources/leroy-somer-fuzhou/1012.md`: "LSA 49.3 M8 | kVA | 820 …", "LSA 49.3 M6 | kVA | 730 …", "Excitation system | AREP / PMG", "AVR type | D350", "Short-circuit current | 300% (3 IN) : 10s"; catalog mới đọc 4 thông số của M8 (ip, insul, excit, vreg). Kết quả không có trường AVR.
4. Bộ điều khiển: một model mỗi cấu hình, lấy theo NCC chào (voltgent: DSE7420). Datasheet DSE7320 MKII (`deep-sea-electronics` n1001) có dòng "DSE890 MKII | DSEWebNet® Gateway | 0890-04" nhưng không có luật bộ điều khiển + mô-đun truyền thông; "Internet/4G", "Ethernet", "BMS" để "chưa rõ".

## Khoa quyết 20/11/2026
- Bổ sung dữ liệu hãng cho 6M31G825/5 và MỌI mã khác của Baudouin.
- "gộp đi, cần rà soát lại tất cả các dòng nào giống nhau của tất cả các nhà cung cấp" (một động cơ ghi hai mã chiếm hai chỗ).
- "sửa luật để kiểm tra tỉ số nén nếu hsmt ghi trơ" (điều phối đã trình: ghi trơ = số chính xác, khác thì không đạt).
- Đầu phát: "miễn sao đạt yêu cầu của hsmt thì cứ gợi ý" (không cần NCC ghi cùng dòng; chọn theo datasheet hãng).
- Làm cả việc bộ điều khiển kèm mô-đun truyền thông.

## Chạy lại số đo
`node suppliers/config-bot.mjs prep --key IB2600603983 --out <thư mục>\prep --origin all` rồi `node cand.mjs <thư mục>` (sửa `root` trong `cand.mjs` trỏ worktree cần đo).
