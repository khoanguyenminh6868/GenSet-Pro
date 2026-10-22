---
name: "hsmt"
description: "Chạy một lượt Worker HSMT GenBid trên máy Windows: tìm thầu mới trên muasamcong, tải HSMT lên GitHub Release, phân tích (cả yêu cầu Phân tích từ bản web) và gửi kết quả lên bản web Vercel. Dùng khi Khoa nói chạy worker, lấy tệp, hoặc /hsmt."
---

# Chạy Worker HSMT (một lượt)

Khoa Nguyen approved this job on 2026-10-21. The scheduled task "hsmt-worker" also runs it at 10:00 and 15:00 (since 2026-10-22); this skill runs one round now, in this session. Never create another cron, loop or scheduled task from this skill.

## Steps

1. Work in `C:\Projects\GenSet Pro` (or the folder that holds `hsmt-inbox`, `genbid-hsmt` and `.hsmt-worker.md`, if it is somewhere else on this PC).
2. Read `C:\Projects\GenSet Pro\.hsmt-worker.md` and do exactly one round as written there, step by step. It is the source of truth; where this skill and the file differ, follow the file.
   - If the file is missing, copy it from the clone: `git -C "C:\Projects\GenSet Pro\hsmt-inbox" pull --ff-only origin hsmt-inbox`, then copy `hsmt-inbox\worker-kit\hsmt-worker.md` to `.hsmt-worker.md` and the scripts in `worker-kit` to `genbid-hsmt`.
3. When the round ends, tell Khoa in Vietnamese, in a few lines:
   - how many open tenders the muasamcong search found, which ones are new, and whether feed/current was updated;
   - which tenders (TBMT) got files and how many (and which files were left out as over 200 MB);
   - which tenders were analysed, including the Phân tích requests from the web, and which scanned pages were not read;
   - which ones failed, and why;
   - what was posted to Vercel;
   - or that there was nothing new.

## Key facts (in case .hsmt-worker.md is unreadable)

- Since 2026-10-22 the claude.ai artifact is not used. Read from the web version with `genbid-hsmt\Get-GenBidRequests.ps1 -Out <file>` (`-Kind files` default, `sync`, `analysis`, or `docs -Coll <c> [-Id <id>]`), write to it with `genbid-hsmt\Post-GenBidDocs.ps1 -Dir <dir>` (files `<dir>\<coll>\<id>.json`). Both use the token in `.genbid-ingest-token`.
- Find new tenders: in the built-in browser, search muasamcong for `máy phát điện` (open tenders only, 50 per page) through the page's own form, run `genbid-hsmt\search-extract.js` in the page, merge with `Merge-GenBidFeed.ps1`, post feed/current only when the tenders changed, and treat tenders not yet in feed/seen/manual/tracked/deleted as new requests.
- Pending file requests: `Get-GenBidRequests.ps1`; fallback `requests.json` in the hsmt-inbox clone after `git pull --ff-only origin hsmt-inbox`. Skip a request when it is done in `.hsmt-worker-state.json`, or when a commit "HSMT <key>" is newer than its requestedAt.
- For each request: open sourceUrl in the built-in browser, read the file list with the logic of `genbid-hsmt\bookmarklet.js`, download with `powershell -NoProfile -ExecutionPolicy Bypass -Command "& '...\GenBid-HSMT.ps1' -NotifyNo <key> -OutDir 'C:\Users\Khoa\Downloads\GenBid-HSMT' -FileId '<id>,<name>','<id>,<name>'"`, then `Publish-GenBidHsmt.ps1 -Key <key> -RequestedAt "<requestedAt>"`: files up to 200 MB go to the GitHub Release `hsmt-<key>`, git keeps only `inbox\<key>\release.json`.
- Analyse new tenders with files and every pending Phân tích request from the web, following `genbid-hsmt\analysis-prompt.md`; post analysis/<key> (status "done") and analysisreq/<key> with doneAt.
- Scanned PDFs: `genbid-hsmt\Render-GenBidScan.ps1 -Pdf <pdf> -OutDir <dir> -First <n> -Last <m>` turns pages into PNG (Poppler's pdftoppm) and the Read tool reads them. Text PDFs: `pdftotext -layout`.
- Run .ps1 scripts with `powershell -NoProfile -ExecutionPolicy Bypass -File ...`.

## Never

- Bypass or solve muasamcong's reCAPTCHA or any other verification. Searching through the page's own form is allowed (Khoa, 2026-10-22); if the page shows a challenge, record the error and move on.
- Print, copy or send the token anywhere except the Vercel endpoints the scripts use.
- Put analysis, status, notes or bid prices into git or onto GitHub. Only public HSMT files go to the GitHub Releases, and only file lists to the hsmt-inbox branch.
- Touch any branch other than hsmt-inbox.
