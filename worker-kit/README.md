# HSMT worker kit

These are the tool scripts and instructions for the HSMT worker. They hold no token, state or tender data.
Since 2026-10-26 the Sync and file rounds run as code (genbid-sync.js, Node + Playwright) and the local bot GenBid-Bot.ps1 calls Claude only for Phân tích, Đối chiếu, Đối chiếu TLKT, Tạo bản tiếng Anh and Tạo HSDT tham khảo. See hsmt-worker.md.

To set up a new PC:
1. Install the official VNeGP Client Agent (C:\MPI\EGP-AGENT, port 1234), git and GitHub CLI, then run `gh auth login` (Publish-GenBidHsmt.ps1 uploads the tender files to GitHub Releases). Install Poppler for scanned PDFs: `winget install --id oschwartz10612.Poppler -e --scope user`, then restart the Claude app so its Read tool finds pdftoppm.
1b. Install Node.js 20+, then run `npm install` in C:ProjectsGenSet Progenbid-hsmt and `npx playwright-core install chromium` (or set GENBID_CHROME to a Chrome/Edge exe).
2. Copy the scripts into C:\Projects\GenSet Pro\genbid-hsmt\, and copy hsmt-worker.md to C:\Projects\GenSet Pro\.hsmt-worker.md.
3. Clone only the hsmt-inbox branch into C:\Projects\GenSet Pro\hsmt-inbox. Sign in to GitHub with a `git push --dry-run`, then set `git config user.name` and `git config user.email` inside the clone.
4. Create these local files by hand. Never commit them, because this repo is public:
   - C:\Projects\GenSet Pro\.genbid-ingest-token: the Vercel token, on one line.
   - C:\Projects\GenSet Pro\.hsmt-worker-state.json containing {"done": []}
5. Create a Claude Desktop scheduled task with TASK.md as the prompt, set its Schedule to Manual and turn it on. It runs only when Khoa clicks Run now, at any hour, with no time window. Click Run now once to approve its tools.
6. If the Windows user is not khoan, fix the Downloads path in hsmt-worker.md and TASK.md.7. The /hsmt skill is in skill\hsmt\SKILL.md: upload that SKILL.md in claude.ai Settings > Skills > Add > Upload skill (it replaces the old version; a zip made by PowerShell's Compress-Archive is rejected).
