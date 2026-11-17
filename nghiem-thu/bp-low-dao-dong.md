# Mức thấp Gợi ý giá dao động — IB2600601812 (điều tra, không PR)

Ngày 13/11/2026. Chỉ đọc, không sửa code. Giá gói P = 466.000.000 đ, 100 kVA, nhóm xuất xứ `cn` ở cả ba lượt.

## Số liệu từng lượt (giờ UTC; log bot giờ VN +7)

| Lượt | Log bot | Ứng viên | Gói giống/gần (pool) | 3 mức thô (P25/50/75) | 3 mức hiệu chỉnh (calib) | s |
|---|---|---|---|---|---|---|
| 15:52 | config-20261112-223957 | 20 | 8 | 257 / 383 / 439 | **306** / 405 / 463 | 1 |
| 17:17 | config-20261113-000905 | 20 | 7 | 257 / 383 / 440 | **239** / 440 / 465 | 1,1 |
| 17:41 | config-20261113-003106 | 20 | 8 | 257 / 383 / 440 | **296** / 405 / 466 | 1,1 |

fc (dự báo số nhà thầu) giống hệt ở lượt 2 và 3: [0,322; 0,403; 0,164; 0,111]. Nguồn: `bidprice.history` + `bidprice.result` (tải bằng Get-GenBidRequests.ps1, 13/11), log `genbid-bot-logs\config-*.log`.

## Tái hiện bằng code (`calibLevels` của web/bidprice.js trên pool lượt 3)

- Pool lượt 3 với s = 1 → 306 / 405 / 463 = đúng lượt 1. Với s = 1,1 → 296 / 405 / 466 = lượt 3.
  → Lượt 1 → 3: **chỉ đổi s** (PR #595 bp-bias bật s 1,1 giữa hai lượt; history lượt 1 ghi s:1).
- Pool lượt 3 bỏ đúng S10 = IB2600089010 (tỉ lệ 0,868, 5 nhà thầu) → calib 239 / 440 / 465, thô 257 / 383 / 440 = **đúng lượt 2**. Bỏ bất kỳ gói nào khác đều không ra số này (bảng bỏ-từng-gói trong scratchpad calc.mjs).
  → Lượt 2: agent không xếp IB2600089010 vào giống/gần (log: 7 gói từ cùng 20 ứng viên). Lượt 3 agent xếp lại "gần" (khác: "kèm xây nhà che chắn, móng bê tông; kèm ống xả, cáp, lắp đặt; không ghi vỏ giảm âm") — gói ranh giới, agent lật.

## Vì sao một gói làm mức thấp nhảy 57 triệu (12% giá gói)

Pool 7–8 gói, phân vị có trọng số kiểu "lấy điểm" (wQuantile, không nội suy). Mất gói 0,868 (nhóm 4–5 NT): mức giữa nhảy từ 0,868 lên 0,945 (khe 0,822 → 0,945), phân vị 20% tụt từ 0,656 xuống 0,552; rồi low = mid − 1,1 × (mid − lo) khuếch đại cả hai chiều → 0,634 → 0,513. Mức cao bị chặn 100% nên gần như đứng yên.

## Đã loại trừ
- Tập ứng viên không đổi theo cấu hình hạng 1 (20 ứng viên, nhóm cn ở cả ba lượt).
- Không có yếu tố ngẫu nhiên/thời gian trong code; fc, P, K như nhau.
- Giá kho/giá vốn không vào 3 mức.

## Kết luận
Không phải lỗi code: code tính đúng. Là (1) agent không ổn định với gói ranh giới + (2) cách tính nhạy trên mẫu nhỏ (phân vị lấy điểm + giãn s). Lượt 1→3 là do đổi s có chủ ý.

## Đề xuất (đổi quy tắc tính → cần điều phối/Khoa quyết, chưa làm)
1. Phân vị có trọng số nội suy (mượt) thay lấy điểm — phải chạy lại backtest (62,4%).
2. Pool < 10 thì bổ sung prior như khi < 5 gói.
3. Giữ mức agent đã xếp cho gói cũ khi tập ứng viên + cấu hình không đổi (giảm lật), hoặc hiện "mức thấp nhạy: một gói đổi mức làm lệch X" trên web.

## Chưa chắc
Kết quả agent của lượt 2 không lưu (history chỉ giữ mức giá); việc bỏ S10 suy từ trùng khớp chính xác cả 6 số + log 7/20, không đọc được trực tiếp.
