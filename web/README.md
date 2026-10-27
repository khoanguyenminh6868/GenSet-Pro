# GenBid Pro on Vercel

The same page as the claude.ai artifact, with claude.ai's runtime replaced:

| claude.ai capability | Here |
| --- | --- |
| `db` | Supabase table `docs` (one row per document, live updates via Realtime) |
| sign-in | Supabase Auth with Google; only emails in `members` get in |
| files (`/_blob/<id>`) | Supabase Storage bucket `blobs` (`api/blob.js` redirects); only fonts and files added from the page |
| tender files (`/_gh/<asset id>`) | GitHub Releases `hsmt-<TBMT>` of this repo, streamed by `api/gh.js` |
| `sample` (Claude) | `api/sample.js` with `ANTHROPIC_API_KEY`; without a key the AI features are off |
| `downloads` | a normal browser download |

## Setup
1. Supabase: new project, run `supabase/schema.sql` in the SQL editor, then add the first owner to `members`.
2. Supabase → Authentication → Providers → Google: paste a Google OAuth client id/secret; add the Vercel URL to the redirect URLs.
3. Vercel: import this repo with **Root Directory** `web`, and set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GITHUB_TOKEN` (fine-grained, this repo only, Contents: read-only, for the tender files) (and `ANTHROPIC_API_KEY` only if AI should run here).

## Activity log
Every change to `docs` (database trigger), each sign-in, upload and AI call goes to `activity_log`. Only members with role `superadmin` can read it, through the list button next to "Chỉ lấy gói mới". After changing `supabase/schema.sql`, run it again in the SQL editor (it is safe to re-run).

## Updating the page
`index.html` is generated from the artifact source: `python3 scripts/build-from-artifact.py genbid-pro.html index.html`.
