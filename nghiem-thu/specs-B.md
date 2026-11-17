# Nghiệm thu specs-B: đọc lại thật sau khi thay tệp (10/11, ~19:00–20:00)

PR #494 (đã merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/494. Hai tệp thật trong `genbid-hsmt\` lấy bằng `git show origin/main:bot/genbid-hsmt/<tệp>`, trùng từng byte với bản thử; Stop hook `Test-GenBidBotGit.ps1 -Any` exit 0 (khớp origin/main). `Backup-GenBidBot.ps1 -Check` còn báo khác vì checkout chính `GenSet-Pro` chưa kéo main (bot tự kéo khi chạy) và tệp bộ nhớ `claude\memory` — không liên quan hai tệp này.
Trước khi chạy: `.genbid-bot-jobs\` trống, không node specs/history nào chạy. Trạng thái và analysis cũ của từng gói lưu ở `specs-truoc\<K>.json`: không gói nào có `analysis/<K>` trước đó (state cũ none/notext), nên không có gì bị ghi đè.
Lệnh: `node genbid-sync.js specs --key <K> --profile spec` lần lượt 17 gói (xoá `text.txt`/`src.txt` trước để đăng lại tệp và chữ lên web). Log từng gói bị ghi đè (do chuyển hướng của vòng lặp cmd); bảng dưới đọc lại từ web và `.genbid-specs.json`.

| Gói | Trước | Sau | analysis/<K> trên web | Chữ hsmttext (ký tự, ký tự CJK lỗi mã) |
|---|---|---|---|---|
| IB2500140418 | none (.doc lỗi mã) | done, 12,5 kVA 1 pha ×24 máy | done/specs, 53 thông số | 21.843, 0 |
| IB2300094137 | none (OCR rác) | done, 300 kVA liên tục / 330 dự phòng | done/specs, 54 | 13.409, 0 |
| IB2300018261 | none (OCR rác) | done, 300 / 330 kVA | done/specs, 62 | 12.139, 0 |
| IB2200069185 | none (OCR rác) | done, 150 / 165 kVA (GVN-FM150 T5) | done/specs, 26 | 6.483, 0 |
| IB2500049415 | none (OCR rác) | done, 80 và 400 kVA (thuê máy lưu động) | done/specs, 24 | 7.638, 0 |
| IB2500331496 | notext | done, 250 kVA | done/specs, 5 | 17.854, 0 |
| IB2400169259 | notext | done, 30 kVA dự phòng tạm | done/specs, 4 | 16.134, 0 |
| IB2200060256 | notext | done, 400 + 15×50 + 10×40 + 10×30 kVA (thuê) | done/specs, 8 | 39.155, 0 |
| IB2500143599 | notext (zip) | done, bảo dưỡng 9 máy (338/137/1650/460/275/2×125/300/116 kVA) | done/specs, 19 | 31.167, 0 |
| IB2200060447 | notext | none: cải tạo phòng máy, không mua máy phát | — | 31.615, 0 |
| IB2300295227 | none (.doc lỗi mã) | none: gia công gối trục máy phát | — | 4.764, 0 (trước: 2.416 toàn CJK) |
| IB2400095607 | none (.doc lỗi mã) | none: xây dựng nhà xưởng | — | 30.098, 0 |
| IB2600547578 | none (không có Chương V) | none: chỉ mua phụ tùng (ổ bạc, dây quấn); đã đọc đúng khối YÊU CẦU KỸ THUẬT + Phụ lục 1 | — | 457.647, 0 |
| IB2600110321 / IB2600016019 | notext | none: lưới điện trung/hạ thế | — | 538.775 / 495.314, 0 |
| IB2500077833 / IB2400265258 | notext | none: tư vấn (thiết bị nhiệt điện / khảo sát tường rào) | — | 28.793 / 62.839, 0 |

Ghi chú: IB2200060447 trong lượt thử `--dry` Claude cho 14 thông số (300 kVA Cummins hiện hữu) nhưng lượt thật kết luận gói cải tạo phòng máy, không có tổ máy mới: kết quả Claude không ổn định giữa hai lần, cả hai đều có lý do; đề nghị Khoa xem tay nếu quan tâm gói này.
Đối chiếu nguồn (3 mẫu): IB2500140418 quote "Trang bị máy phát điện 12.5 KVA 1 pha, sử dụng động cơ Diesel, có trang bị ATS" (tệp Chuong 5 HSMT may phat dien 2025.doc, đọc bằng Word COM); IB2300094137 quote "Cung cấp, lắp đặt 01 máy phát điện dự phòng công suất 300kVA - 380V - 50Hz" (khớp ảnh trang 2: ≥300 KVA / ≥330 KVA); IB2500143599 quote "MÁY PHÁT ĐIỆN HIỆU SUNTECH 338KVA -P126TI-II (TRẠM VIỆN 108)".

Chưa làm / còn lại
- IB2600279956, IB2600035196 (zip VTTB lưới điện, notext): đúng duyệt, không OCR. IB2500062950, IB2500075505 (không có tệp HSMT): giữ notext.
- Chưa xem bằng mắt trên web Vercel tab Tổng quan/Giá gợi ý của các gói mới.
- Quay lui: chép `.bak-20261110-specsfix` đè `genbid-sync.js` / `ocr-pdf.js`; xoá `analysis/<K>` bằng tay nếu muốn trả về trạng thái cũ (trước đó chưa có).
