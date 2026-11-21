# size-blocks-nhan: nghiệm thu (22/11/2026)

PR draft https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1066, head `ebee0f9b`, từ `main` sau #1036. Chưa merge. **Top 30 chưa đo.**

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

## Việc tiếp

1. Điều phối giao đo cloud `ebee0f9b` so với gốc của nó.
2. Gộp main vào #998, đo lại #998 toàn bộ.
