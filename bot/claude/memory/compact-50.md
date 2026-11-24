---
name: compact-50
description: "Context quá 55% (ngưỡng tự compact, Khoa 24/11/2026) thì ghi bộ nhớ điều quan trọng, compact rồi làm tiếp (Khoa 17/11/2026)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 9a79e689-1a81-4f3a-95db-6e51d9cb4ced
  modified: 2026-11-24T00:43:57.099Z
---

Ngưỡng tự động compact nay là 55 % (Khoa 24/11/2026: "tăng auto compact lên thành 55%"; trước đó cùng sáng: "tăng auto compact lên lại thành 50%"; đêm 23–24/11 từng hạ xuống 35 %, ban đầu 50 % đặt 17/11). Khi context vượt ngưỡng: tự ghi vào bộ nhớ những điều quan trọng (quyết định của Khoa, bẫy mới, việc dở), rồi compact và làm tiếp, không dừng hỏi.

Ghi NGAY khi xảy ra (Khoa 20/11/2026, chọn cách này thay vì chờ ngưỡng): mỗi khi Khoa chốt một quyết định/quy tắc mới, hoặc em phát hiện bẫy mới, thì ghi bộ nhớ ngay trong lượt đó, không gom lại cuối phiên. Hook PreCompact chỉ nhắc, không ghi được; bản tóm tắt compact có thể rơi chi tiết.

**Why:** Khoa 17/11/2026 muốn phiên dài không mất thông tin khi compact.

**How to apply:** Đã cài trong `~/.claude/settings.json`: `env.CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=55` (tự compact ở 55 %; phiên đang mở có thể phải mở lại mới nhận giá trị mới, em chưa kiểm), hook `PreCompact` (auto) nhắc tóm tắt giữ đủ việc dở, hook `SessionStart` matcher `compact` nhắc ghi bộ nhớ ngay sau compact. Khi thấy phiên đã dài, chủ động ghi bộ nhớ trước, đừng chờ hook. Cập nhật tệp sẵn có, không tạo trùng; việc dở thì ghi sổ điều phối ([[orchestrator-delegate-by-model]]).
