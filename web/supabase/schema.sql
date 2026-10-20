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
-- "scratch" holds images sent to Claude for one request.
insert into storage.buckets (id, name, public) values ('blobs', 'blobs', true), ('scratch', 'scratch', false)
on conflict (id) do nothing;

drop policy if exists blobs_upload on storage.objects;
create policy blobs_upload on storage.objects for insert to authenticated with check (bucket_id = 'blobs' and public.is_member());
drop policy if exists scratch_upload on storage.objects;
create policy scratch_upload on storage.objects for insert to authenticated with check (bucket_id = 'scratch' and public.is_member());

-- First owner: replace with your Google email, then run.
-- insert into public.members (email, role) values ('you@gmail.com', 'owner');
