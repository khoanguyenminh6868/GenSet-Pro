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

## Cần kiểm
- PR gán hãng (`wt-gan-hang`): lúc 18:11 phiên điều phối báo đang đo nền, nhưng tới 22:30 chưa có nhánh / PR trên GitHub.
  Còn chạy hay đã chết?
