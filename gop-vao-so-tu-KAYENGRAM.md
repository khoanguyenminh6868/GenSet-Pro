# Cần gộp vào so-dieu-phoi.md (ghi từ máy KAYENGRAM, 16/11/2026 tối)

Sổ thật chưa lên nhánh `dieu-phoi` lúc ghi tệp này (máy giữ sổ chưa chạy Sync-DieuPhoi.ps1), nên ghi tạm ở đây.
Phiên điều phối: gộp các dòng dưới vào sổ (mục "Chờ Khoa", "Khoa đã bảo BỎ", sổ đã khép), rồi XOÁ tệp này và chạy Sync.

## Khoa trả lời mục "Chờ Khoa" (16/11)
- IB2600601812: KHÔNG chạy lại Gợi ý; KHÔNG lấy datasheet ComAp AMF9. → "Khoa đã bảo BỎ".
- SQL tay cho `activity_log`: ĐÃ CHẠY. → xoá khỏi "Chờ Khoa", ghi sổ đã khép.
- Tài liệu đầy đủ Deep Sea để lập bảng chức năng bộ điều khiển: KHÔNG CẦN. → "Khoa đã bảo BỎ".
- Tác vụ Windows "GenBid specs pause/resume": KHÔNG CẦN NỮA. → gỡ trên máy đang có nó
  (`Get-ScheduledTask | ? TaskName -match 'specs'` rồi `Unregister-ScheduledTask -Confirm:$false`), bỏ khỏi Install nếu có,
  rồi xoá khỏi "Chờ Khoa".
- Nhánh `feed-data`: đã xoá (16/11, cùng `wt-actions-sync`: thử chạy bot trên GitHub Actions, bỏ). → xoá khỏi "Chờ Khoa".

## Việc đã khép ở máy KAYENGRAM (16/11)
- Skill `update-bot` (#814, #816); sổ điều phối dùng chung qua nhánh `dieu-phoi` + tác vụ "GenBid DieuPhoi Sync" (#815).
- 247power.vn: KHÔNG revert 9fa5787 (Khoa đổi ý, giữ như main); README commit `e94ffec` trên máy KAYENGRAM chưa push.

## Chưa giao (ghi từ máy KAYENGRAM, 17/11/2026) — chạy trên MÁY BOT CHÍNH (có `genbid-work\specs`)
- **Soát ngưỡng HSMT do code đọc trên toàn bộ kho** (Khoa 17/11: "triển khai việc bắt lỗi có hệ thống"). Sau `update-bot`:
  `node suppliers\hints-audit.mjs --texts "C:\Projects\GenSet Pro\genbid-work\specs" --out "C:\Projects\GenSet Pro\genbid-work\dieu-phoi\nghiem-thu\soat-nguong.json"`
  (không tốn agent, không ghi web). Đọc mục "LỆCH": mỗi gói mở dòng HSMT xem code hay Phân tích sai; code sai thì sửa
  `powerRead` / `engineMins` + ca test theo dòng thật (đã sửa hai bố cục tiêu hao: PR #820, #822). Mục "THIẾU" chỉ đếm.
  Trên 40 gói mới nhất (máy KAYENGRAM, đọc web): lệch 2 (đã sửa), thiếu 14. Việc Haiku / Sonnet.

## Chờ Khoa (17/11, từ phiên so sánh Opus / Fable trên IB2600603983)
- ĐÃ LÀM (Khoa duyệt, PR #823): ứng viên xét bố trí xi lanh + động cơ khác tần số; Gợi ý lại không giữ dòng lượt trước.
- ĐÃ LÀM (Khoa: "nếu HSMT ghi rõ 6 thì nên loại 12", PR #825): số xi lanh ghi trơ là số chính xác ở bước chọn ứng viên.
  Còn hỏi: bước chấm đạt / không đạt (`makerSheetChecks`) có theo luật này không? Và khi chạy hints-audit toàn kho thì đếm
  luôn bao nhiêu gói ghi trơ số xi lanh (`cylExact`).
- IB2600603983: web đang là kết quả Fable chạy TRƯỚC các sửa (#820, #823, #825). Chạy Gợi ý lại (≈3 USD Opus) hay giữ?
  Bản 12/11 lưu ở `genbid-work\so-sanh-model\IB2600603983\web-truoc\` trên máy KAYENGRAM.

## Cần kiểm
- PR gán hãng (`wt-gan-hang`): lúc 18:11 phiên điều phối báo đang đo nền, nhưng tới 22:30 chưa có nhánh / PR trên GitHub.
  Còn chạy hay đã chết?
