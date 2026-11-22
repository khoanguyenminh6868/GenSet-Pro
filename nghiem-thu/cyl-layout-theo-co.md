# cyl-layout-theo-co: nghiệm thu (22/11/2026)

PR draft https://github.com/khoanguyenminh6868/GenSet-Pro/pull/1073, head `9a262370`, gốc `c0aa54d7`. Đo cloud: `do-gop-cyl-layout-ket-qua` 0d616883. Chưa merge.

**Kết luận: CHƯA đạt "0 oan".** Luật đọc theo cỡ đúng, nhưng 9 / 34 dòng ra `all` bị loại vì ô bố trí NCC ghi sai, và 9 / 43 dòng vào top 30 lọt ở cỡ ảo. Cần quyết (cuối tệp).

## Vì sao 62 lượt đổi ngưỡng mà 17 lượt đổi tập

Cloud chỉ đo bidhist: 35 / 62 lượt (27 lượt còn lại là specs). 18 / 35 lượt không có dòng nào đổi trạng thái, 17 đổi tập.

## 34 dòng ra `all` (3 lượt có luật mới từ dòng của chính cỡ)

- IB2400433961#0 (600 kVA, thẳng hàng): 27 dòng. 23 đúng (DP180, BF8M1015, DP158, PTAA: động cơ V). **4 oan:** longkai QSK19G4 ("V12"; 5 nguồn khác ghi thẳng hàng), aosif KTA19G9A, QSK19G35, QSK19G31 (aosif ghi "12V" cho QSK19 / KTA19, loại 6 xi lanh thẳng hàng).
- IB2400602840#0 (160 kVA, thẳng hàng): 1 dòng, TBD234V6, đúng.
- IB2400602840#1 (800 kVA, chữ V): 6 dòng. CHD620L6 đúng. **5 oan:** liangzi KTA38G2, KTA38G2B và jianghao DP222LA / LB / LC (NCC ghi "12L", các nguồn khác ghi V).
- Nguyên nhân: luật 17/11 tin ô của chính dòng trước. PR không tạo luật này, chỉ làm nó chạy ở 3 lượt trên.
- Chỉ longkai QSK19G4 từng ở top 30 (hạng 17).

## 43 dòng vào top 30

- Đúng: IB2300162912#0 19, IB2500039578#0 13, IB2300371415#1 1 (dòng "thẳng hàng" là của động cơ xuồng), IB2400433961#0 1 (lấp chỗ).
- **9 dòng lọt ở cỡ ảo:** IB2300005377#1 8 dòng (1132 kVA là mức dự phòng của chính máy 1000 kVA, HSMT đòi chữ V), IB2500291421#0 1 dòng (484 đọc từ "605KVA/484KVA" của máy 550 kVA, HSMT đòi thẳng hàng). Lượt thật của hai gói vẫn giữ luật.

## Cần quyết

1. Ô bố trí của dòng bị ít nhất 2 NCC khác ghi ngược thì không dùng để loại: gỡ 6 / 9 dòng oan. 3 dòng aosif còn lại không đủ nguồn đối chứng, phải sửa dữ liệu hoặc gắn cờ dòng.
2. Cỡ ảo (mức dự phòng đọc thành một cỡ): sửa ở `sizesOf`, PR riêng, hay chấp nhận.
