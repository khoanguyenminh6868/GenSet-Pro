-- Pending requests for the Windows bot's poll (web/api/requests.js pendingMarks, every 15 s): only the request rows
-- still waiting (requestedAt later than doneAt), plus syncreq/current, so a poll reads a few hundred bytes instead of
-- the dates of every request row (~13 KB, growing with the tenders; Supabase egress, 2026-11-10).
-- Run once in the Supabase SQL editor. Safe to run again. Until it exists the API reads every row as before.
-- Undo: drop view if exists public.pending_requests;
create or replace view public.pending_requests with (security_invoker = true) as
select coll,
       id,
       data->>'requestedAt' as "requestedAt",
       data->>'doneAt' as "doneAt",
       data->>'mode' as mode
from public.docs
where coll in ('hsmtreq', 'analysisreq', 'syncreq', 'translationreq', 'comparereq', 'hsdtreq', 'tlktreq',
               'supplierreq', 'configreq', 'findreq', 'bidpricereq', 'specreq')
  and (coll = 'syncreq'
       -- the same test as pendingOf() in requests.js: byte order (collate "C"), as JavaScript compares the strings
       or (coalesce(data->>'requestedAt', '') <> ''
           and coalesce(data->>'doneAt', '') collate "C" < (data->>'requestedAt') collate "C"));

-- Only the server (service role) reads it; signed-in pages and the anon key do not need it.
revoke all on public.pending_requests from anon, authenticated;
grant select on public.pending_requests to service_role;
