# HSMT worker - one round

Approved by Khoa Nguyen on 2026-10-21. Runs as the Claude desktop scheduled task "hsmt-worker" on this PC in Manual mode: only when Khoa clicks Run now, at any hour.

1. Note the Vietnam time (UTC+7) for the round summary. There is no time window: always do the round.
2. `git -C "C:\Projects\GenSet Pro\hsmt-inbox" pull --ff-only origin hsmt-inbox`. Then get the pending list, an array of {notifyNo, key, sourceUrl, bidName, requestedAt}:
   - First choice: `powershell -File "C:\Projects\GenSet Pro\genbid-hsmt\Get-GenBidRequests.ps1" -Out "<scratchpad>\requests.json"`. It does GET https://genset-pro-web.vercel.app/api/requests with the token from `.genbid-ingest-token`, never prints the token, and exits 1 on failure.
   - If that fails (no token, HTTP error, bad JSON), fall back to `requests.json` in the hsmt-inbox clone. Note which source was used in the round summary.
   - Large tenders can take minutes. Run the download for each tender as its own command, and in the background when it may exceed 2 minutes.
3. Skip a request when its key|requestedAt is already in `C:\Projects\GenSet Pro\.hsmt-worker-state.json` ({"done": ["key|requestedAt", ...]}). Also skip it when another machine already handled it: `git log -1 --format=%cI --grep "^HSMT <key>$"` shows a commit dated after requestedAt. In that case add it to the state file.
4. For each new request:
   - Open sourceUrl in the built-in browser and wait for the page to load. Run the extraction code from `genbid-hsmt\bookmarklet.js` (click the "Hồ sơ mời thầu" tab, read `.file-download-all` ids and the Vue xxxFileId/xxxFileName pairs). Never bypass reCAPTCHA or call the search API. If the page shows a challenge, record the error.
   - Run `GenBid-HSMT.ps1 -StartOnly` if the Agent is not running. Then run `GenBid-HSMT.ps1 -NotifyNo <key> -OutDir "C:\Users\khoan\OneDrive\Downloads\GenBid-HSMT" -FileId "<id>,<name>" ...`.
   - Delete and recreate `hsmt-inbox\inbox\<key>\files\` and copy the downloaded files into it with their original names. Leave out files over 95 MB and list them in `inbox\<key>\error.txt`. If there are no files, write only `inbox\<key>\error.txt` with a short reason in Vietnamese.
   - Commit with the title "HSMT <key>" and run `git push origin hsmt-inbox`. Then add key|requestedAt to the state file.
6. At the end of every round (also when there were no HSMT requests), send the analysis results to Vercel. Khoa approved this on 2026-10-21 as option A, as part of this same schedule.
   - If `C:\Projects\GenSet Pro\.genbid-ingest-token` does not exist, skip this step. Never print, copy or send the token anywhere except the endpoint below.
   - Use ArtifactData `list` on <GenBid Pro artifact URL, read from C:\Projects\GenSet Pro\.genbid-artifact-url> for the collections `analysis`, `translation` and `compare` (never `tracked`), with `query.limit` 1000 and `out_dir` = `<scratchpad>\genbid-ingest`, where <scratchpad> is your own scratchpad directory. Clear that folder first.
   - Write `<scratchpad>\genbid-ingest\versions.json` as {"<coll>/<doc id>": version, ...} from the versions the list results show.
   - Run `powershell -File "C:\Projects\GenSet Pro\genbid-hsmt\Send-GenBidIngest.ps1" -ExportDir "<scratchpad>\genbid-ingest" -Versions "<scratchpad>\genbid-ingest\versions.json"`. The script POSTs to https://genset-pro-web.vercel.app/api/ingest with Bearer auth. It sends only changed documents (state in `C:\Projects\GenSet Pro\.genbid-ingest-state.json`) and only `analysis` documents with status "done", at most 200 rows per call. On a 401 it skips this round.
   - Then delete `<scratchpad>\genbid-ingest`. This data must never go into a git repo or onto GitHub.
   - A failure in this step must not undo the HSMT part. Note the result in the round summary.
7. The clone has a repo-local git identity (Khoa Nguyen, GitHub noreply email). On a new machine, set it with `git config user.name` and `git config user.email` inside the clone. Touch only the hsmt-inbox branch. Send no secrets. Report to @parent only when a request was processed or something failed.
