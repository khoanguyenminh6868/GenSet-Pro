# ĐO #1236 — conductorjasa +138 bản ghi động cơ (nhánh `wt-conductorjasa-2`)

Gốc = origin/main `6da9a53`; so = nhánh PR đã merge origin/main (`tich-hop-1236`, `91f398c`).
Cùng bản bidhist (tải 25/11/2026 00:19Z, 928 gói, 1057 lượt), cùng 436 NCC trong `suppliers/cn` của mỗi nhánh. 0 lượt lỗi cả hai bên. Mỗi bên chạy ~55 phút.

## Kết quả
- 18/1057 lượt đổi top 30; 1039 lượt GIỐNG HẸT (cùng hàng, cùng thứ tự, cùng điểm).
- Cả 18 lượt đều có bản ghi conductorjasa MỚI vào top 30 (tổng 37 dòng). Không có dòng conductorjasa nào ra khỏi top.
- 38 dòng NCC khác rời top 30 (agg-power, tecnogen, cgm-italia, lister-petter, powerpack, coelmo, saudi-diesel, aj-power): đều là điểm thấp hơn dòng conductorjasa vào, hoặc cùng động cơ / cùng NCC bị hạn mức `PER_ENGINE` / `PER_SUPPLIER` của `candidates` đẩy ra khi dòng conductorjasa chiếm chỗ.
- 1 dòng NCC khác VÀO top: `agg-power|400830TAG2|1000/800` (gói IB2400446772#0, hạng 24, 115 điểm) — hệ quả hạn mức: dòng conductorjasa 400830TAG3 chiếm chỗ làm các dòng khác lùi, hạn mức động cơ / NCC nhả chỗ. Điểm của chính dòng đó không đổi.
- **Dòng NCC khác ĐỔI ĐIỂM (không chỉ đổi hạng): 0.** Mọi dòng có mặt ở cả hai top đều cùng điểm → đổi dùng chung của `catalog.js` / `spec-norm.js` không tác động tới NCC khác trong 928 gói.

## Kiểm chéo 24 bản ghi conductorjasa vào top 30 (toàn bộ, không lấy mẫu)
Đối chiếu từng dòng `u.line` do catalog đọc với ô nguồn `suppliers/sources/conductorjasa/n101-n116.md` (còn nguyên trong tệp) và `suppliers/specs/conductorjasa.json`: model, động cơ (Mesin), prime kVA, standby kVA, fuel75 (BBM 75%, L/jam) — 24/24 khớp ô nguồn (dấu phẩy thập phân → số: 797,5 → 797.5). Dòng nguồn không có cột BBM (n116, một số dòng n103/n114) không có fuel75, đúng nguồn.

Động cơ: KT38-GA, KTA38-G5, S12H-PTA, 4008 30TAG3 (n116, tách chữ "4008 30TAG3" theo nguồn), NT855-GA, 2806 C-E18TAG1A, 4B3.9-G11, 4BTA3.9-G2, 4M06G55/5, 6CTAA8.3-G2, 1506A-E88TAG2, 6M16G220/5, 2206 C-E13TAG3, QSZ13-G7, NTAA855-G7A, 403A-15G2, 6M21G500/5, S16R-PTAA2-C, S16R-PTAA2, 4016TAG2A, 4006-23TAG2A, 4008-TAG1A, 8M33G 1000/5, 1506A-E88TAG4.

Điểm cần Khoa biết (số liệu NGUỒN lạ, không phải lỗi đọc):
- `PJPS-275 WP 1506A-E88TAG4` (n116): tên 275 nhưng prime 300 / standby 330.
- `BJPS-200-WP 6M16G220/5` (n109): prime 200 / standby 275 (tỉ lệ 1,375, các dòng khác 1,1).
- `BJPS-900-WP 8M33G 1000/5` (n103): tên "1000 kVA standby", prime 900 / standby 1000 (ô Mesin có khoảng trắng "8M33G 1000/5" nên khoá động cơ khác "8M33G1000/5" ở NCC khác — đã gộp đúng khoá `8M33G1000/5`).
- Dòng n116 không có BBM và không có kích thước: không có fuel75.

## Kết luận: AN TOÀN MERGE
Mọi thay đổi top 30 là bản ghi conductorjasa mới vào đúng số liệu nguồn và hệ quả xếp hạng / hạn mức của chúng; không NCC nào đổi điểm; không dòng conductorjasa rơi ra; 0 lỗi. Ba số liệu nguồn lạ ở trên là dữ liệu của hãng, không chặn merge.

Tệp: `ket-qua/khac-biet.json` (18 lượt: dòng conductorjasa vào, dòng NCC khác ra / vào), `ket-qua/dong-conductorjasa-vao-top30.json`, `ket-qua/*.meta.json`. Chỉ khoá dòng và điểm, không có chữ HSMT.
