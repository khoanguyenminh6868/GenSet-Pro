---
name: argon-delegate
description: "Gemini 4 Argon qua OpenRouter: CHỈ gọi khi Khoa bảo; default Claude tự làm. Quy trình tiết kiệm, script, giá, bẫy."
metadata:
  node_type: memory
  type: feedback
  originSessionId: 502fc1b2-d0ac-4c6f-a0d7-380269edf2f2
  modified: 2026-11-13T10:56:21.101Z
---

**Quy tắc gốc (Khoa 13/11/2026):** mặc định Claude tự làm việc; chỉ gọi Gemini 4 Argon khi Khoa nói muốn gọi ("gọi Argon", "giao cho Argon"). Không tự giao, không tự đề xuất giao trừ khi Khoa hỏi.

**Cách gọi:** OpenRouter, model `google/gemini-4-argon`, key ở biến môi trường User `OPENROUTER_API_KEY` (Khoa đã `setx`; trong phiên cũ phải nạp từ `[Environment]::GetEnvironmentVariable('OPENROUTER_API_KEY','User')` vào từng lệnh). Không đưa key vào chat, repo (public) hay log. Script: `C:\Projects\GenSet Pro\genbid-work\argon\delegate.mjs` (đầu tệp có cách dùng; có `--dry` để ước chi phí không tốn tiền; ghi `argon-cost.log` cạnh nó).

**Giá (13/11/2026, USD/triệu token vào/ra):** Argon 2/10 (đã đối chiếu chi phí thật), Hydrogen 1.5/7.5; bản `:batch` rẻ bằng nửa (chưa thử, có thể chậm). Một lượt viết 11 test tốn $0.032.

**Chỉ giao khi tiết kiệm thật:** đầu ra DÀI và cơ học (tệp test, tài liệu, chuyển đổi hàng loạt, dữ liệu mẫu). Việc sửa ngắn, đổi kiến trúc, bẫy nhiều tệp: Claude tự làm vì phải đọc lại đầu ra nên giao không lợi.

**Quy trình rẻ nhất:**
1. Đầu vào tối thiểu: chỉ tệp nguồn cần (`--ctx`), không cả repo; script dừng khi >60 000 ký tự trừ `--force`. Tệp ngữ cảnh đặt trước, brief sau (lượt lặp có thể trúng cache).
2. Mỗi lượt MỘT tệp đầu ra nguyên vẹn, không bắt viết diff (diff do model viết hay hỏng); `--max-tokens` vừa đủ (mặc định 8000); thấy `finish=length` là bị cắt.
3. Brief ≤ 15 dòng: mục tiêu, phong cách theo tệp mẫu, danh sách ca phải phủ, "chỉ trả nội dung tệp". Bắt model tự tính kỳ vọng bằng tay, không sao chép biểu thức của hàm đang test.
4. Chạy `--dry` trước nếu ngữ cảnh lớn.
5. Kiểm thay vì tin: đọc đầu ra, chạy test; với test thì phá cố ý hàm gốc ở vài chỗ (sed rồi `git checkout`) xem test có bắt không. Chỉ đọc phần cần, không đổ cả diff vào ngữ cảnh.
6. Làm trong worktree `wt-*` theo [[git-workflow]]; PR ghi rõ tệp do Argon soạn và đã kiểm cách nào. Không lệ thuộc mô tả của model.

**Review mã (13/11/2026, Khoa bảo thử):** gửi toàn bộ mã nguồn (~2,2 MB, chia 7 nhóm theo module, đánh số dòng bằng `cat -n`, `--force`) tốn $1,80, ra 40 phát hiện trong ~3 phút. Đã kiểm hết 40 với mã thật (PR #695–#697): **7 lỗi đáng sửa** (đã sửa; có hai lỗi không ai để ý: PowerShell injection ở `ocr-specs.mjs`, dấu `\` bị mất trong regex), **17 nhẹ/hiếm/lý thuyết** (không sửa), **16 sai hoặc không phải lỗi** dù nhiều cái gắn "chắc" (ví dụ `numIn` là thiết kế có chủ ý ghi trong `web/CLAUDE.md`; ReDoS đo 0–1 ms; `h``` đã tự escape nên không có XSS; `sup-skip.mjs` ghi rõ đường web đã lọc; `pdftotext` có `\f` sau trang cuối; `highlights: []` của lệnh `specs` là có lý vì web không hiển thị chúng ở phân tích `basis: specs`). Kết luận: dùng như bước SÀNG, mỗi phát hiện phải kiểm bằng grep/chạy thử trước khi báo hay sửa; đừng tin nhãn "Độ chắc". Mẹo: yêu cầu trích mã nguyên văn giúp kiểm nhanh.

**Bẫy:** `agy` (Antigravity CLI) không dùng được Argon cho key này: gói Free của key Gemini trực tiếp có hạn mức 0 cho Argon, và đăng nhập `agy` chỉ hiện nhóm Free/Plus (Claude 4.6 và GPT-OSS bị gỡ 18/11/2026). OpenRouter chỉ là API chat, không có agent đọc/sửa tệp. PowerShell 5.1 làm mất dấu nháy kép khi truyền JSON cho lệnh ngoài → đưa JSON qua tệp.

Liên quan: [[orchestrator-delegate-by-model]] (giao session con theo model Claude, khác với đường này).
