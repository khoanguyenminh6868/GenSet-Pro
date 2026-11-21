# tieu-hao-to-hang-1: tiêu hao tờ hãng động cơ ở bước chọn ứng viên (22/11/2026)

Trạng thái: **đề xuất luật, CHƯA code**, chờ điều phối chọn. Nhánh `fix/tieu-hao-to-hang` từ main 8bc431a3, chưa có commit.
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
