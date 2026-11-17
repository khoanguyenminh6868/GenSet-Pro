# Quy trình cho session con (GenSet-Pro)

Phiên điều phối giao việc kèm đường dẫn tệp này. Đọc hết trước khi làm. Brief riêng của việc được ưu tiên khi mâu thuẫn.

## Trước khi làm
- Đọc bộ nhớ dự án `C:\Users\Khoa\.claude\projects\C--Projects-GenSet-Pro\memory\`: `git-workflow.md`, `bot-ops.md`, và các tệp brief nêu tên. Quy tắc và bẫy code nằm trong `CLAUDE.md` của repo (gốc, `web/`, `suppliers/`), tự nạp.
- Repo: `C:\Projects\GenSet Pro\GenSet-Pro` là checkout bot đang chạy, LUÔN để main, không sửa ở đó. Mọi thay đổi làm trong worktree riêng từ `origin/main`.
- Chỉ đụng tệp trong phạm vi brief giao. Thấy lỗi ngoài phạm vi thì ghi vào báo cáo, không sửa.

## Trong khi làm
- Không bịa, không suy ra dữ liệu nhà cung cấp; URL lấy từ kết quả tìm kiếm; không lấy số từ trang bán lại.
- Bản thử của script bot đặt ở `C:\Projects\GenSet Pro\genbid-test\`, KHÔNG đặt trong `genbid-hsmt\` (tệp lạ ở đó làm hỏng các lượt Claude của bot).
- Không thay tệp bot thật trong `genbid-hsmt\`, không ghi dữ liệu lên web thật, khi chưa được phiên điều phối duyệt.
- Bị chặn quyền thì dừng việc đó và báo, không tìm đường vòng.
- Không dùng heredoc bash để sửa tệp (hỏng `\\`, `\n`); dùng Edit/Write.

## Cổng duyệt
- PR mở ở trạng thái DRAFT, KHÔNG tự merge. Phiên điều phối kiểm rồi merge.
- Mỗi PR hoặc mỗi lần xin thay tệp thật: viết bản nghiệm thu ĐẦY ĐỦ vào `C:\Projects\GenSet Pro\genbid-work\dieu-phoi\nghiem-thu\<tên-việc>-<n>.md`, gồm: link PR; tệp đã đổi; lệnh kiểm đã chạy + đầu ra thật; số đo trước/sau của chỉ số brief nêu (ghi rõ đo hay ước tính); 3 mẫu để đối chiếu với nguồn gốc (URL + câu trích); rủi ro còn lại + cách quay lui; việc chưa kiểm được.

## Báo về phiên điều phối
- Chỉ gửi tin khi: (a) tới cổng duyệt, (b) bị chặn cần quyết định, (c) xong hẳn. Không gửi báo tiến độ, không gửi tin xác nhận "đã nhận".
- Tin nhắn tối đa 5 dòng: kết luận, link PR, đường dẫn tệp nghiệm thu, điều cần phiên điều phối quyết. Chi tiết nằm trong tệp, không lặp lại trong tin.
- Gửi bằng `send_message` của claude-code-remote tới session id ghi trong brief.

## Khi xong
- Gỡ worktree của mình. Bẫy code mới phát hiện: thêm vào `CLAUDE.md` đúng thư mục trong chính PR. Quyết định của Khoa hoặc việc còn dở: ghi ở mục "Cần ghi nhớ" cuối bản nghiệm thu, phiên điều phối chuyển vào bộ nhớ/sổ. Rồi dừng. Không tự mở việc mới.
