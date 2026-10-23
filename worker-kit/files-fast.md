# HSMT worker - fast file round

Approved by Khoa Nguyen on 2026-10-23. The local bot GenBid-Bot.ps1 runs this instead of a full round when the web has "Lấy tệp" requests, so the files reach the web in about a minute. Only fetch files: no muasamcong search, no analysis (the Publish script queues the analysis, and the bot runs a full round for it right after). reCAPTCHA is never bypassed or solved.

<kit> = `C:\Projects\GenSet Pro\genbid-hsmt`. Run PowerShell scripts with `powershell -NoProfile -ExecutionPolicy Bypass -File ...`. Never print or send the token in `C:\Projects\GenSet Pro\.genbid-ingest-token`.

1. Lock: if `C:\Projects\GenSet Pro\.hsmt-worker.lock` exists and was written less than 3 hours ago, stop and say so. Otherwise write it with the current time; delete it at the end (also when something fails).
2. `<kit>\Get-GenBidRequests.ps1 -Out "<scratchpad>\requests.json"` lists the pending requests [{key, notifyNo, sourceUrl, bidName, requestedAt}]. Handle only the ones the bot named in its message. Start the VNeGP Agent now, in the background: `<kit>\GenBid-HSMT.ps1 -StartOnly`.
3. For each request:
   - Open sourceUrl in a new browser tab. Run the code of `<kit>\files-extract.js` in the page with javascript_tool (it waits for the page, opens the "Hồ sơ mời thầu" tab and returns {notifyNo, files: [{id, name}]} or {error}). On an error or a verification page, run `<kit>\Publish-GenBidHsmt.ps1 -Key <key> -RequestedAt "<requestedAt>" -Reason "<short reason in Vietnamese>"` and go on to the next request.
   - Write the list to `<scratchpad>\<key>.txt`: first line `# <key>`, then one line `<id>,<name>` per file (UTF-8). Run `<kit>\GenBid-HSMT.ps1 -List "<scratchpad>\<key>.txt" -OutDir "C:\Users\Khoa\Downloads\GenBid-HSMT"` (run it in the background when the files are large).
   - Run `<kit>\Publish-GenBidHsmt.ps1 -Key <key> -RequestedAt "<requestedAt>" -QueueAnalysis`. It uploads the files to the GitHub Release, writes the file list and text to the web, marks the request done and queues the analysis.
4. Close the tabs you opened, delete the lock and the files in <scratchpad>. Reply in Vietnamese in two or three lines: which tenders got how many files, and what failed and why.
