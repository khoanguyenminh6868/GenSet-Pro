---
name: compact-50
description: "Context quá 50% thì ghi bộ nhớ điều quan trọng, compact rồi làm tiếp (Khoa 17/11/2026)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 9a79e689-1a81-4f3a-95db-6e51d9cb4ced
  modified: 2026-11-17T15:51:53.902Z
---

Khi context vượt ~50%: tự ghi vào bộ nhớ những điều quan trọng (quyết định của Khoa, bẫy mới, việc dở), rồi compact và làm tiếp, không dừng hỏi.

**Why:** Khoa 17/11/2026 muốn phiên dài không mất thông tin khi compact.

**How to apply:** Đã cài trong `~/.claude/settings.json`: `env.CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50` (tự compact ở 50%), hook `PreCompact` (auto) nhắc tóm tắt giữ đủ việc dở, hook `SessionStart` matcher `compact` nhắc ghi bộ nhớ ngay sau compact. Khi thấy phiên đã dài, chủ động ghi bộ nhớ trước, đừng chờ hook. Cập nhật tệp sẵn có, không tạo trùng; việc dở thì ghi sổ điều phối ([[orchestrator-delegate-by-model]]).
