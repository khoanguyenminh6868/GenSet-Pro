# size-blocks-nhan: nghiệm thu (22/11/2026)

PR draft https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1066, head `a180798b`, từ `main` sau #1036. Chưa merge. Top 30 đã đo ở `ebee0f9b` (mục "Đối chiếu đo cloud").

## Hiện trạng trước khi sửa

#1036 đã có phần gán dòng theo nhãn cỡ (`LINE_SIZE`). Trên `main` sau #1036: 44 / 55 lượt của danh sách `bo-doc-tieu-hao-3.md` đã đúng đích.

## Sửa (`suppliers/config-bot.mjs`, test `size-blocks-nhan.test.mjs`)

- Nhãn "Máy xăng / dầu / diesel N kVA" (`LINE_SIZE`).
- Dòng "Cả N loại máy" là chữ chung của mọi cỡ.
- Cỡ có dòng mang tên mình thì không dùng `agreed` (không mượn số của cỡ khác).
- `tankNear`: nhãn có chữ "xi lanh" chỉ xét trong vế câu của nó. "Dung tích" trơ giữ cách cũ.
- Số xi lanh ghi trơ trong ô có "≤ / tối đa" của số khác là tối thiểu.
- "Hoặc tương đương" của hãng không làm mất số xi lanh.

## Đo (so `main` sau #1036)

- **Ngưỡng đổi:** specs 2 / 1.880, bidhist 29 / 1.093 (`dau-vao/nguong-hsmt/doi-size-blocks.tsv`). Theo trường: minCyl 19, minDisp 8, minPrime 2, maxFuel 2, maxFuel75 2.
- **Đã đọc chữ nguồn cả 31 lượt đổi:** số đúng theo dòng của đúng cỡ.
- **33 dòng oan:** cả 33 đã về `all`, không dòng nào còn bị luật cũ loại.
- **55 lượt:** 49 đúng đích. 6 lượt còn lại bảng cũ sai, bản này đúng theo chữ HSMT:
  - IB2300046353#1: dòng của chính máy 20 kVA ghi dung tích > 1,950 lít và 4 xi lanh.
  - IB2300163186#2, #3: dòng của chính cỡ ghi > 4,087 và > 9,726 lít.
  - IB2300293753#0: 1,365 theo dung sai Khoa đã chốt.
  - IB2500403535#0: dòng của chính cỡ ghi ≥ 3 xi lanh.
  - IB2600562009#0: 7,5 L/h là mức 100% tải; 5,4 là mức 75%.
- **Test:** 1464 + 148 + 11 pass.

## Cần biết

- IB2400145438#2 (12 kVA) ghi "≥ 12.0 kVA (MRQ); ≥ 12.5 kVA (RQ)". Code lấy 12. Luật "lấy số RQ" Khoa chốt cho tiêu hao, chưa chốt cho công suất nên không áp.
- IB2400145438#3 (13,7 kVA) thực ra là mức dự phòng RQ của máy 12 kVA; bản này không còn đặt ngưỡng công suất 13,7 cho lượt đó.
- Số xi lanh ghi trơ trong các ô này được tính là tối thiểu, không phải số chính xác.

## Đối chiếu đo cloud (`ebee0f9b` ↔ `1ab27de7`, kết quả `do-gop-size-blocks-ket-qua` 9c465f69; 22/11/2026)

**Kết luận: 0 dòng bị loại oan theo chữ HSMT và luật Khoa đã chốt.** Phần "đúng" so ngưỡng HSMT với số catalog đang dùng; không mở lại trang nguồn NCC của từng dòng.

- **Tái lập khớp cloud 29 / 29 lượt** có ngưỡng đổi trong bidhist. 20 lượt đổi tập; 9 không đổi (1 do `plausible` bỏ ngưỡng, 8 không dòng nào đổi trạng thái).
- **3.164 dòng ra, 183 dòng vào: 100% quy về một ngưỡng đã đổi của đúng lượt.** Ra: dung tích 2.362, xi lanh 737, công suất 65. Vào: chỉ IB2400145438#3. Danh sách: `dau-vao/nguong-hsmt/size-blocks-20-luot.tsv`.
- **127 dòng ra top 30:** 110 bị loại đúng ngưỡng, 17 bị đẩy. 10 dòng đẩy ở IB2400145438#3 do dòng mới vào; 7 dòng còn lại ở các lượt không có dòng mới nào vào `all`, nên chỉ là chia lại chỗ giữa các dòng hợp lệ.
- **30 dòng hạng 1–5 gốc ra top 30:** 29 bị loại, 1 bị đẩy (`size-blocks-top5.txt`).
- Khoa quyết 22/11/2026: IB2400145438#2 "≥ 12 (MRQ); ≥ 12,5 (RQ)" lấy 12.

Cần biết (không tính là oan):
- **51 dòng rớt sát ngưỡng theo luật "giữ chặt" của Khoa:** IB2500222084#0 "2,29 l" loại 44 dòng WP2.3 ghi 2,289 L (2 dòng từng ở hạng 1–5); IB2300163186#3 "> 9,726 lít" loại 7 dòng WT10B-231DE ghi 9,72 L.
- **1 dòng lọt ở cỡ ảo:** IB2400145438#3 (13,7 kVA là mức dự phòng RQ của máy 12 kVA) không còn ngưỡng công suất, nên acepow-fuan YN25GB (prime 11 kVA) vào `all` ở hạng 368, ngoài top 30. 182 dòng vào còn lại đạt ≥ 12 kVA.

## Gộp main

Head `a180798b` chứa main `8bc431a3`. CI đạt, GitHub báo gộp được. Test máy 1479 + 157 + 11 pass. Ngưỡng toàn bộ sau gộp giống hệt `ebee0f9b` (0 / 1.880, 0 / 1.093). Top 30 chưa đo lại sau gộp (main có đổi `web/catalog.js`).

## Việc tiếp

1. Điều phối đọc diff rồi merge #1066.
2. Giải thích số đo cloud #998 (`5e1304df`, nhánh `do-gop-ma-trung2-ket-qua`) khi có.
3. PR riêng sau #1066: `cylLayoutOf` theo cỡ máy, soát mọi lượt nhiều cỡ có bố trí xi lanh.
