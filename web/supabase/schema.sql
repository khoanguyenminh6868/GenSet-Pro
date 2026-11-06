-- GenBid Pro on Supabase. Run once in the Supabase SQL editor.
-- Every app document (tracked/<TBMT>, analysis/<key>, feed/current, ...) is one row of "docs".

create table if not exists public.members (
  email text primary key,            -- lower-case Google account email
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  added_at timestamptz not null default now()
);

create table if not exists public.docs (
  coll text not null,
  id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (coll, id)
);

create or replace function public.is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.members where email = lower(auth.jwt() ->> 'email'))
$$;

alter table public.docs enable row level security;
alter table public.members enable row level security;

drop policy if exists docs_members on public.docs;
create policy docs_members on public.docs for all to authenticated using (public.is_member()) with check (public.is_member());

drop policy if exists members_read on public.members;
create policy members_read on public.members for select to authenticated using (public.is_member());

-- Live updates for open pages.
alter table public.docs replica identity full;
do $$ begin
  alter publication supabase_realtime add table public.docs;
exception when duplicate_object then null; end $$;

-- Files: "blobs" holds the tender documents and fonts (public links, unguessable ids);
-- "scratch" holds images sent to Claude for one request; "quote" the suppliers' quotes (api/quote.js, service key only).
insert into storage.buckets (id, name, public) values ('blobs', 'blobs', true), ('scratch', 'scratch', false), ('quote', 'quote', false)
on conflict (id) do nothing;

drop policy if exists blobs_upload on storage.objects;
create policy blobs_upload on storage.objects for insert to authenticated with check (bucket_id = 'blobs' and public.is_member());
drop policy if exists scratch_upload on storage.objects;
create policy scratch_upload on storage.objects for insert to authenticated with check (bucket_id = 'scratch' and public.is_member());

-- First owner: replace with your Google email, then run.
-- insert into public.members (email, role) values ('you@gmail.com', 'owner');

-- ---------- Activity log: every change to "docs" plus sign-ins, uploads and AI calls; read by superadmin only ----------
alter table public.members drop constraint if exists members_role_check;
alter table public.members add constraint members_role_check check (role in ('superadmin', 'owner', 'admin', 'member'));
insert into public.members (email, role) values ('khoa.nguyenminh6868@gmail.com', 'superadmin')
on conflict (email) do update set role = 'superadmin';

create or replace function public.is_superadmin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.members where email = lower(auth.jwt() ->> 'email') and role = 'superadmin')
$$;

create table if not exists public.activity_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor text not null,               -- member email, or 'worker' for the Windows worker and the server
  source text not null,              -- 'web' (the page), 'server' (an /api function), 'worker'
  action text not null,              -- insert / update / delete (a docs row), login, upload, ai
  coll text,
  doc_id text,
  detail jsonb
);
create index if not exists activity_log_at on public.activity_log (at desc);
create index if not exists activity_log_actor_at on public.activity_log (actor, at desc);
alter table public.activity_log enable row level security;
drop policy if exists activity_log_read on public.activity_log;
-- (select ...) so the check runs once per query, not once per row (the log has many rows).
create policy activity_log_read on public.activity_log for select to authenticated using ((select public.is_superadmin()));
-- No insert/update/delete policies: rows come only from the trigger, log_activity() and the service role.

-- Who made a docs change: the signed-in member's email; for the /api functions (service role) the
-- "x-actor" header they send; otherwise the worker. The bot's heartbeat (botstatus) and the tab / sort
-- being viewed (prefs) are not activities.
create or replace function public.log_docs_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  r public.docs;
  claims jsonb := coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb;
  hdrs jsonb := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  who text := lower(nullif(claims ->> 'email', ''));
  src text := 'web';
  keys text[];
begin
  r := case when tg_op = 'DELETE' then old else new end;
  if r.coll in ('botstatus', 'prefs') then return null; end if;
  if tg_op = 'UPDATE' and new.data = old.data then return null; end if;
  if tg_op = 'UPDATE' and jsonb_typeof(new.data) = 'object' and jsonb_typeof(old.data) = 'object' then
    select array_agg(k order by k) into keys
    from (select jsonb_object_keys(new.data) k union select jsonb_object_keys(old.data)) s
    where new.data -> k is distinct from old.data -> k;
  end if;
  if who is null then
    who := lower(nullif(hdrs ->> 'x-actor', ''));
    src := case when who is null then 'worker' else 'server' end;
    who := coalesce(who, 'worker');
  end if;
  insert into public.activity_log (actor, source, action, coll, doc_id, detail)
  values (who, src, lower(tg_op), r.coll, r.id, jsonb_strip_nulls(jsonb_build_object(
    'keys', keys,
    'stage', r.data ->> 'stage',
    'prevStage', case when tg_op = 'UPDATE' then old.data ->> 'stage' end,
    'name', left(coalesce(r.data ->> 'bidName', r.data -> 'tender' ->> 'bidName'), 200),
    'mode', r.data ->> 'mode',
    -- A scheduled Sync (synclog/current): its time slot and result.
    'slot', case when r.coll = 'synclog' then r.data ->> 'slot' end,
    'summary', case when r.coll = 'synclog' then left(r.data ->> 'summary', 300) end)));
  return null;
exception when others then
  return null; -- a logging failure never blocks the save itself
end $$;

drop trigger if exists docs_activity on public.docs;
create trigger docs_activity after insert or update or delete on public.docs
for each row execute function public.log_docs_change();

-- Events the page reports itself (opening the app, uploading files), always under the caller's own email.
create or replace function public.log_activity(p_action text, p_detail jsonb default null) returns void
language sql security definer set search_path = public as $$
  insert into public.activity_log (actor, source, action, detail)
  select lower(auth.jwt() ->> 'email'), 'web', p_action, p_detail
  where public.is_member() and p_action in ('login', 'upload')
$$;
