# Nghiệm thu: ocrHsmt ghi theo lô + lời nhắc tải /_gh có token (lần 1, 20/11/2026)

PR (draft, chưa merge): https://github.com/khoanguyenminh6868/GenSet-Pro/pull/950

## Tệp đổi
`bot/genbid-hsmt/genbid-sync.js`, `bot/genbid-hsmt/sync-pure.js`, `bot/test/write-batch.test.mjs` (mới). Không đụng `genbid-hsmt\` thật.

## Thay đổi
1. `sync-pure.js`: `WRITE_BATCH = {rows: 15, bytes: 3000000}` và `batchRows(rows, limits)` (thuần). Giới hạn lấy từ mã có sẵn, không tự nghĩ:
   `Publish-GenBidHsmt.ps1` đã gửi tối đa 15 đoạn (~3 MB) mỗi lần "dưới giới hạn 4,5 MB của Vercel"; `web/api/ingest.js` nhận 1–200 bản ghi, không giới hạn số đoạn / tổng cỡ nào khác ngoài thân 4,5 MB của hàm Vercel. Đếm theo byte UTF-8 của JSON từng bản ghi. Một bản ghi tự nó lớn hơn ngưỡng đi một mình (không chia được; đoạn tối đa 190.000 byte nên thực tế không xảy ra).
2. `ocrHsmt`: chunk `hsmttext` ghi theo lô (`post(b, {retry: 2})`, thử lại khi mạng / 429 / 5xx), bản ghi `hsmt` (hasText, textChunks, files) ghi SAU CÙNG trong yêu cầu riêng. Đứt giữa chừng → `hsmt` vẫn `hasText:false`, không `ocrTried` → lần sau đọc lại; chunk là tài liệu theo id nên ghi lại chỉ ghi đè. (Tối đa chunk cũ còn rác ở id cao hơn không xảy ra: số chunk chỉ tăng vì chữ cũ nối trước.)
3. Lời nhắc (`genbid-sync.js` ~dòng 1730): bảo tải `/_gh` bằng Invoke-WebRequest kèm `-Headers @{ Authorization = "Bearer $((Get-Content -Raw '<đường dẫn tệp token>').Trim())" }`, chỉ ghi đường dẫn tệp token, không in token.

## Kiểm phía web (đọc mã, không chạy ghi)
- `api/ingest.js`: 1–200 bản ghi / yêu cầu; không giới hạn số chunk, tổng cỡ ngoài 4,5 MB thân. Lô ≤ 15 bản ghi / 3 MB phù hợp.
- Phía đọc: bot `hsmtText` đọc đủ `textChunks` đoạn song song; web `loadAttachedText` đọc tuần tự mọi đoạn `0..textChunks-1`. Không có mức cắt số đoạn. Phân tích bot qua `trimHsmt` (cắt theo mục có sẵn, không đổi ở PR này).
- 3,4 triệu ký tự ≈ 18–25 đoạn 190.000 byte (tiếng Việt nhiều byte hơn) ≈ 4–5 MB lưu trữ. Chưa thấy giới hạn nào khác bị vượt; chưa đo dung lượng Supabase (500 MB gói Free), chưa kiểm `trimHsmt` có làm Phân tích quá lớn không khi chữ 3,4 triệu ký tự: xem "Chưa kiểm được".

## Lệnh kiểm
```
node --test bot/test/*.test.mjs   → # pass 144  # fail 0   (7 ca mới write-batch.test.mjs)
node --check bot/genbid-hsmt/genbid-sync.js → ok
```
Biên đã test: 0 chunk, 1 chunk, đúng ngưỡng số dòng (15 / 16), đúng ngưỡng byte (= / -1), một bản ghi lớn hơn ngưỡng, 25 đoạn × 190.000 (mọi lô < 4,5 MB, giữ đủ + đúng thứ tự), chữ nhiều byte.

Trước / sau: trước 1 yêu cầu ~4,6+ MB (413); sau mỗi yêu cầu ≤ ~3 MB (ước tính từ test với đoạn 190.000 byte, đo bằng `Buffer.byteLength`).

## Chưa kiểm được
- Không chạy thật ghi web (theo brief). Sau merge + chép sang `genbid-hsmt\` (genbid-sync.js, sync-pure.js): `node genbid-sync.js ocr-hsmt --key IB2500441397`.
- Chưa kiểm Phân tích gói 3,4 triệu ký tự (`trimHsmt`, ngân sách token).
- Lời nhắc mới chưa chạy trong một lượt Claude thật.

## Rủi ro + quay lui
Nhiều yêu cầu hơn (≈ 2–9 lần ghi thay vì 1), mỗi lần có retry. Quay lui: revert PR, chép lại `.bak`.

## Cần ghi nhớ
Mọi chỗ ghi nhiều `hsmttext` phải chia lô ≤ 15 đoạn / 3 MB, bản ghi `hsmt` ghi sau cùng.
