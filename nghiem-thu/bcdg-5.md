# Nghiệm thu: BCĐG-5 — IB2600354007 verdict rỗng; "fetch failed" khi đăng sau OCR dài

Không có PR, không sửa code (không có lỗi để sửa ở mục 1; mục 2 đã có bản sửa ở #591). Không ghi web thật, không đụng `genbid-hsmt\`.

## 1. IB2600354007: verdict rỗng là ĐÚNG (không phải lỗi đọc, cũng không phải lỗi kết luận)
Bằng chứng: cache OCR `C:\Users\Khoa\Downloads\GenBid-BCDG\_ocr\IB2600354007\A0DC13CC…\f1..f5.txt` (PDF chỉ 5 trang, OCR đủ cả 5 trang):
- f3 "Bảng số 02": mình (Công ty TNHH thiết bị kỹ thuật Thảo Nguyên) xếp **hạng 2** (giá 1.325.000.000). Hạng 1: TB Hydro Việt Nam 1.263.880.800.
- f3: "Kết quả đánh giá … của E-HSDT **xếp thứ nhất** được tổng hợp theo Bảng số 03" → chỉ có đúng một dòng (TB Hydro: Đạt Đạt Đạt). Báo cáo không có khối thuyết minh nào cho mình.
- f4 "Bảng số 04": dòng của mình: "Không đánh giá / Không đánh giá / Không đánh giá / Không đánh giá" (OCR: "Không Ö ứng Không|Không / đánh đánh giá đánh | đánh"); nhà thầu hạng 3 cũng "Không đánh giá". f4: "Tổ chuyên gia nêu các ý kiến nhận xét (nếu có): Không có".
- f5: nhà thầu đề nghị trúng thầu = TB Hydro (MST 0901042929).
Kết luận: bên mời thầu chỉ đánh giá E-HSDT xếp hạng 1 và đã chọn trúng nên **không đánh giá** mình → không có lý do/kết luận để trích. `reason` rỗng và `verdict ""` là đúng; bộ trích không bỏ sót gì. (Khớp nhận định cũ "rỗng là ĐÚNG" trong sổ đã khép.)

Gợi ý (chưa làm, cần Khoa/điều phối quyết): web hiện "" như "chưa rõ". Có thể thêm verdict `skip` ("Không được đánh giá: xếp hạng sau nhà thầu trúng") khi Bảng tổng hợp ghi "Không đánh giá" ở dòng mình. OCR bảng này bị xé ô ("Không Ö ứng Không|Không") nên nhận dạng chữ không chắc; cần đổi cả `bcdg-reason.js` + `web/index.html`. Không làm vì ngoài phạm vi "điều tra".

## 2. "fetch failed" khi đăng sau OCR dài: nguyên nhân CHƯA chứng minh được
Bằng chứng thu được:
- `genbid-bot-logs\bcdg-reread-20261112.log` (tạo 18:33, ghi tới 21:16, log KHÔNG có giờ từng dòng): 2 lần `TypeError: fetch failed` đều ở `post` (`genbid-sync.js:109`, từ `bcdgStep:426`) và **chỉ** gói IB2400120387 (PDF 19 MB, OCR 10 phút quá giờ). Các gói khác (OCR ngắn/đọc từ cache) đăng bình thường trong cùng log, kể cả IB2400120387 ở các lượt trước/sau (lượt cuối thành công). Bản cũ (`genbid-test\before-591\genbid-sync.js:103-112`) không có `e.cause`, nên stack không cho biết mã lỗi.
- Gói bị lỗi là POST nhỏ (một doc bcdg, vài trăm byte) → không phải quá cỡ/timeout thân; Vercel quá giới hạn sẽ trả HTTP 413 chứ không "fetch failed".
- Trong `bot-2026-11.log` có hàng chục "không đọc được hàng chờ (fetch failed)" của tác vụ config; vài dòng cùng một giây dù đã cách nhau hàng trăm giây ([236s]/[884s]/[970s] lúc 09:06:25/26 ngày 13/11) → máy ngủ/mất mạng thoáng qua cũng gây "fetch failed" kiểu này. Cách giải thích này khớp với việc xảy ra sau khoảng chờ rất dài, nhưng log tác vụ ghi thời gian khác lượt `--reread` tay nên chưa khẳng định cho trường hợp này. Nhật ký sự kiện Windows (System) cho 12/11 18:30–21:30 gần như trống nên không đối chiếu được ngủ/đổi mạng.
- Giả thuyết "socket giữ sẵn bị server đóng trong lúc `spawnSync` OCR chặn vòng lặp" đã THỬ và **không tái hiện**: `genbid-test\bcdg5\stale-socket.js` (server ở tiến trình riêng, keep-alive server 1 s, `spawnSync` chặn 3 s và 6 s, node v20.17.0) → POST thứ hai luôn `HTTP 200` (undici tự thử lại/bỏ socket chết). Vậy giả thuyết ở bcdg-4 yếu đi; chưa loại hẳn (Vercel/CDN khác server giả).

Cách sửa: đã có ở #591 (đã gộp, đã chép vào bot): `post(rows, {retry:2})` thử lại sau 3 s, 10 s với lỗi mạng/429/5xx, log `e.cause` + cỡ thân. Từ đó lượt reread thật không còn lỗi; `grep "ghi web lỗi|thử .* lần"` trong `genbid-bot-logs\*.log` hiện **0 dòng** (chưa có lượt nào phải thử lại). Không thêm sửa mới vì chưa có nguyên nhân để nhắm; sửa thêm theo đoán là vô căn cứ.

Cách thử lại để tìm nguyên nhân thật: lần sau `--reread` IB2400120387 (hoặc gói OCR >10 phút) nếu log có "ghi web lỗi (fetch failed [CODE …]…)" thì mã `CODE` là nguyên nhân (ECONNRESET / UND_ERR_SOCKET = socket chết; ENOTFOUND/EAI_AGAIN = DNS/mạng; UND_ERR_CONNECT_TIMEOUT = mạng). Nếu không còn dòng nào sau nhiều lượt thì coi như do mạng/ngủ máy thoáng qua và retry đã đủ.

## Kiểm đã chạy
- `node stale-socket.js sync|async` (3 s rồi 6 s): mọi lượt `HTTP 200`.
- Đọc cache `f1..f5` của IB2600354007 và đối chiếu với trang đã lưu (ở trên).
- Không chạy lại bộ test (không đổi code).

## Cần ghi nhớ
- Báo cáo đánh giá chỉ xét E-HSDT xếp hạng 1: gói mình hạng ≥2 thường không có lý do/kết luận; rỗng là bình thường. Cân nhắc verdict `skip` (việc dở, cần quyết).
- "fetch failed" khi đăng: nguyên nhân thật vẫn chưa rõ; chờ log `cause` từ lần có lỗi tiếp theo.
