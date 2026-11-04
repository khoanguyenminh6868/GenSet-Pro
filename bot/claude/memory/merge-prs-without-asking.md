---
name: merge-prs-without-asking
description: "Khoa wants Claude to merge its own PRs in GenSet-Pro itself, without asking first"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 1565214e-a08b-4422-8b7f-0f7530842f1a
  modified: 2026-11-03T13:57:13.510Z
---

Khoa (2026-10-22): "em tự merge hết toàn bộ PR không cần hỏi anh" — merge every PR Claude opens on khoanguyenminh6868/GenSet-Pro without asking.

**Why:** Vercel only deploys from `main`; Khoa does not want to be the bottleneck for small web fixes.

**How to apply:** After opening a PR, mark it ready and merge it with squash (past PRs like #25 were squash-merged), using auto-merge when checks are still pending. Don't merge with failing checks; fix first. Then pull `main` in `C:\Projects\GenSet Pro\GenSet-Pro` and remove the worktree (see [[pull-latest-main-first]]).
