# GenBid Pro on Vercel

One page (`index.html`) plus `shim.js`, which provides `window.claude.use()` on Supabase. The AI work (Phân tích, Đối chiếu, Đối chiếu TLKT, Tạo bản tiếng Anh, Tạo HSDT tham khảo) and the muasamcong sync run on the Windows bot (`genbid-hsmt`, see `hsmt-worker.md`); the page only writes requests (`api/webreq.js`) and shows the answers.

| Capability | Here |
| --- | --- |
| `db` | Supabase table `docs` (one row per document, live updates via Realtime) |
| sign-in | Supabase Auth with Google; only emails in `members` get in |
| files (`/_blob/<id>`) | Supabase Storage bucket `blobs` (`api/blob.js` redirects); only fonts and files added from the page |
| tender files (`/_gh/<asset id>`) | GitHub Releases `hsmt-<TBMT>` of this repo, streamed by `api/gh.js` |
| uploads for the bot | Supabase Storage bucket `scratch` (`api/scratch.js`), deleted after the bot's round |
| `downloads` | a normal browser download |

## Setup
1. Supabase: new project, run `supabase/schema.sql` in the SQL editor, then add the first owner to `members`.
2. Supabase → Authentication → Providers → Google: paste a Google OAuth client id/secret; add the Vercel URL to the redirect URLs.
3. Vercel: import this repo with **Root Directory** `web`, and set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GITHUB_TOKEN` (fine-grained, this repo only, Contents: read and write: it reads the tender files and stores the suppliers' quotes on the releases `ncc-<TBMT>`).

## Activity log
Every change to `docs` (database trigger), each sign-in and upload goes to `activity_log`. Only members with role `superadmin` can read it, through the list button next to "Chỉ lấy gói mới". After changing `supabase/schema.sql`, run it again in the SQL editor (it is safe to re-run).

## Updating the page
Edit `index.html` directly; Vercel deploys `main`.
