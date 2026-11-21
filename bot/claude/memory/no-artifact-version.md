---
name: no-artifact-version
description: Khoa no longer uses GenBid Pro as a claude.ai artifact; only the Vercel web + Windows bot matter
metadata:
  node_type: memory
  type: project
  originSessionId: d3d7555f-5487-4c60-8289-8f5ef092f0d1
  modified: 2026-11-03T13:57:16.337Z
---

Since 2026-10-27 Khoa uses only the Vercel web version (genset-pro-web.vercel.app) with the Windows bot (genbid-sync.js); the claude.ai artifact version of web/index.html (the `!window.genbidWeb` branches that call the page's own AI via getSample) is not used anymore.

**Why:** Khoa said "anh không dùng artifact nữa" while discussing token use.

**How to apply:** Don't spend effort on, or describe behaviour of, the artifact/claude.ai code paths; design and test features for the web + bot flow only. Removing the dead artifact branches is a possible cleanup, only if Khoa agrees.
