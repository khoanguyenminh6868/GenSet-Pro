# tieu-hao-to-hang-1: tiêu hao tờ hãng động cơ ở bước chọn ứng viên (22/11/2026)

Trạng thái: **ĐÃ MERGE** (#1081, 8c8d9cc6, hướng A; điều phối báo đo cloud: 1.089 lượt giống hệt, 4 lượt đổi, 11 dòng ra khỏi `all`, đều 6M31G825/5). Xem mục "Kết quả chạy thật" ở cuối; số 16 cặp bên dưới là ước lượng cũ.
Script: `dau-vao\tieu-hao-to-hang\do-pham-vi.mjs`, `do-fact.mjs`. Số lượt-dòng là ước lượng trên danh sách `all` của đo cloud 669b5ae8, bidhist máy 20/11, chưa chạy `candidates`.

## Phạm vi đo được

- 123 động cơ có fact tiêu hao từ tờ hãng, nhưng **chỉ 1 động cơ có số L/h theo mức tải: Baudouin 6M31G825/5** (156 / 113 / 77).
- 122 động cơ còn lại: g/kWh (wudong 79, ricardo 11, koop 9, hanma 5), khí Nm³/h (googol 11), hoặc không ghi đơn vị / suất nhiệt (yto 4, jichai 2, changsong 1). Không so được với ngưỡng L/h; đổi g/kWh sang L/h cần tỉ trọng và công suất mà tờ không ghi, nên không làm.
- 490 lượt có ngưỡng tiêu hao. Cặp NCC-động cơ không tự ghi số mà có tờ hãng: **16** (3 trong top 30). Theo tờ hãng: 5 đạt, **11 vượt** (2 trong top 30), ở 4 lượt.
- Dòng NCC ghi L/h khác tờ hãng: **0 ca hiện có**, vì không NCC nào khác ghi L/h cùng mức tải cho động cơ này.

## Luật đề xuất

1. Dòng có số so được của chính nó: dùng số của dòng, như `fuelChecks`.
2. Dòng không có số: dùng số tờ hãng (`sheetFuel`: đúng L/h, mức tải ghi rõ, một giá trị).
3. Số tờ hãng vượt ngưỡng: loại như số của dòng (−300, `ruled`). Lý do: bước chấm đã cho `not_met` bằng đúng số này, giữ dòng thì chỉ thêm cấu hình không đạt.
4. Số tờ hãng đạt: không cộng điểm. Cộng điểm vì có tờ hãng là luật A, Khoa chưa duyệt.

## Điều cần biết

- Luật này **không đưa 6M31G825/5 lên hạng cao hơn ở IB2600603983**: gói đó đạt ngưỡng nên điểm không đổi. Tác dụng duy nhất là loại 11 cặp vượt ngưỡng.
- Số trên tờ là của động cơ ở mức PRP; tổ máy cùng động cơ nhưng công suất thấp hơn có thể tiêu hao ít hơn. Khoa đã quyết không quy tỉ lệ.

## Cần điều phối chọn

- **A (đề xuất):** làm theo 4 luật trên, PR nhỏ, đo cloud.
- **B:** số tờ hãng vượt chỉ trừ 300, giữ dòng trong bảng.
- **C:** không làm, vì chỉ 1 động cơ có số dùng được; chuyển sang E/C/D.

## Kết quả chạy thật (22/11/2026, code cabbe660, `candidates` trên bidhist 20/11)
- Danh sách đủ: `dau-vao\tieu-hao-to-hang\ds-cap.md`, lý do: `ds-cap.log`. **65 cặp**: 29 đạt, 36 vượt; 36 cặp vượt đều bị loại, đều có luật `fuel*`.
- **24 cặp đạt tiêu hao mà bị loại: soát cả 24, 0 cặp oan.** Mọi lý do so với 6M31G825/5 (6 xi lanh, 18,5 L) hoặc dòng prime 750 kVA:
  - chỉ công suất: 10 cặp (dòng prime 750 kVA < HSMT 800 / 820 kVA);
  - xi lanh: 4 cặp (HSMT 12 xi lanh chữ V, máy 6);
  - dung tích + xi lanh: 4 cặp (HSMT ≥ 21,927 L, ≥ 12 xi lanh);
  - dung tích + xi lanh + công suất: 5 cặp; dung tích + công suất: 1 cặp (≥ 23 L, 800 kVA).
- Toàn bộ test `suppliers/*.test.mjs` trên cabbe660: 1.478 / 1.478 đạt.
