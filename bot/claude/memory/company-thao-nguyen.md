---
name: company-thao-nguyen
description: "Khoa's company is CÔNG TY TNHH THIẾT BỊ KỸ THUẬT THẢO NGUYÊN, tax code 4101623015 (muasamcong code vn4101623015)"
metadata:
  node_type: memory
  type: user
  originSessionId: 361d1336-5af9-4489-9f68-5108ceb272eb
  modified: 2026-11-03T13:57:15.292Z
---

Khoa's company: **CÔNG TY TNHH THIẾT BỊ KỸ THUẬT THẢO NGUYÊN**, MST **4101623015** (on muasamcong the contractor code is `vn4101623015`). Stated by Khoa on 2026-10-23.

Khoa wants (2026-10-27): when a Sync finds our company in a tender's bidders, move the tender to the matching tab — Đã nộp from the opening record, then Trúng thầu / Không trúng once the result (KQLCNT) is out. Implemented in `markJoined` in web/api/ingest.js (PR #74).

In GenBid Pro this is "us": `OUR_RE = /thảo\s*nguyên/i` in web/index.html highlights our row in the bidders table and fills our bid price. When matching bidders, prefer the tax code over the name.
