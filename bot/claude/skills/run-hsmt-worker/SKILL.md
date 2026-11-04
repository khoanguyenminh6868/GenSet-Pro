---
name: run-hsmt-worker
description: Chạy worker HSMT ngay (Run now task "hsmt-worker") để tải hồ sơ mời thầu đang chờ, rồi báo kết quả. Dùng khi Khoa nói "chạy worker", "run worker", "tải HSMT", "tải thầu đang chờ" hoặc gõ /run-hsmt-worker.
---

# Chạy worker HSMT

Worker là task "hsmt-worker" trong Claude Desktop (tự chạy lúc 10:00 và 15:00 từ 2026-10-22, và khi bấm Run now). Mỗi lần chạy, nó làm một vòng theo `C:\Projects\GenSet Pro\.hsmt-worker.md`: tìm thầu mới trên muasamcong, tải file qua VNeGP Client Agent, đưa file lên GitHub Release `hsmt-<key>` (commit "HSMT <key>" chỉ chứa `release.json`), phân tích gói mới và các yêu cầu Phân tích từ bản web, rồi gửi kết quả lên bản web Vercel. Không dùng artifact claude.ai nữa.

## Các bước

1. Xem trước có gì đang chờ (không bắt buộc, nhưng giúp báo cáo):
   `powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Projects\GenSet Pro\genbid-hsmt\Get-GenBidRequests.ps1" -Out "<scratchpad>\requests.json"`
   và yêu cầu Phân tích: thêm `-Kind analysis -Out "<scratchpad>\areq.json"`.
   Script không in token. Đọc file kết quả, liệt kê `key` và `bidName`. Nếu script lỗi thì bỏ qua bước này.
2. Gọi `mcp__scheduled-tasks__run_scheduled_task` với `taskId: "hsmt-worker"`. Nếu tool đang deferred, nạp nó bằng ToolSearch trước.
   - Nếu báo task đang tắt (disabled): đừng tự bật (bật lại sẽ khôi phục lịch 10:00 và 15:00), hãy báo Khoa.
   - Nếu báo đang có lượt chạy khác: báo Khoa và dừng, không chạy chồng.
3. Báo Khoa: đã chạy, link session `[HSMT worker](#<session_id>)`, và các thầu đang chờ từ bước 1. Không poll; khi lượt chạy xong, thông báo sẽ tự đến.
4. Khi nhận thông báo lượt chạy xong (hoặc Khoa hỏi kết quả), kiểm tra thật:
   - `git -C "C:\Projects\GenSet Pro\hsmt-inbox" fetch -q origin hsmt-inbox` rồi `git log origin/hsmt-inbox --format="%h %cI | %s" -10` để thấy commit "HSMT <key>".
   - `inbox\<key>\release.json` (danh sách file trên release) và `inbox\<key>\error.txt` trên `origin/hsmt-inbox`; file thật xem bằng `gh release view hsmt-<key> --repo khoanguyenminh6868/GenSet-Pro`.
   - Kết quả phân tích: `Get-GenBidRequests.ps1 -Kind docs -Coll analysis -Id <key> -Out <file>`.
   - Nếu `git` không có trong PATH, dùng `C:\Program Files\Git\cmd\git.exe`.
   Báo từng thầu: số file, có phân tích chưa, hoặc lý do lỗi trong `error.txt`.

## Lưu ý

- Không tự làm thay phần việc của worker trong session này. Chỉ kích hoạt và kiểm tra.
- Không in, chép hay gửi nội dung `.genbid-ingest-token`.
- VNeGP Client Agent phải có ở `C:\MPI\EGP-AGENT` (cổng 1234). Worker tự bật Agent nếu chưa chạy.
