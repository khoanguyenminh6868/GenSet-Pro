# HSMT worker kit

These are the tool scripts and instructions for the HSMT worker. They hold no token, state or tender data.

To set up a new PC:
1. Install the official VNeGP Client Agent (C:\MPI\EGP-AGENT, port 1234) and git.
2. Copy the scripts into C:\Projects\GenSet Pro\genbid-hsmt\, and copy hsmt-worker.md to C:\Projects\GenSet Pro\.hsmt-worker.md.
3. Clone only the hsmt-inbox branch into C:\Projects\GenSet Pro\hsmt-inbox. Sign in to GitHub with a `git push --dry-run`, then set `git config user.name` and `git config user.email` inside the clone.
4. Create these local files by hand. Never commit them, because this repo is public:
   - C:\Projects\GenSet Pro\.genbid-ingest-token: the Vercel token, on one line.
   - C:\Projects\GenSet Pro\.genbid-artifact-url: the GenBid Pro artifact URL, on one line.
   - C:\Projects\GenSet Pro\.hsmt-worker-state.json containing {"done": []}
5. Create a Claude Desktop scheduled task with TASK.md as the prompt, set its Schedule to Manual and turn it on. It runs only when Khoa clicks Run now, at any hour, with no time window. Click Run now once to approve its tools.
6. If the Windows user is not khoan, fix the Downloads path in hsmt-worker.md and TASK.md.