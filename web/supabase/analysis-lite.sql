-- Light copy of analysis for the web list (web/api/lite.js): everything of an analysis except its technical specs,
-- of which only the (up to 3) rows that name the power are kept, the same cut lite.js made in JavaScript after reading
-- the whole table from Supabase (~12 of ~17 MB). Cutting inside Postgres means that Vercel reads only the light copy
-- (Supabase egress, 2026-11-12).
-- Run once in the Supabase SQL editor. Safe to run again. Until it exists lite.js reads the whole rows as before.
-- Undo: drop view if exists public.analysis_lite; drop function if exists public.lite_analysis(jsonb); drop function if exists public.lite_txt(jsonb);

-- A JSON value as JavaScript's `${v || ""}` writes it.
create or replace function public.lite_txt(v jsonb) returns text
language sql immutable parallel safe set search_path = public, pg_temp as $$
  select case
    when v is null or v in ('null'::jsonb, 'false'::jsonb, '0'::jsonb, '""'::jsonb) then ''
    when jsonb_typeof(v) = 'string' then v #>> '{}'
    else v::text
  end
$$;

-- Same test as POWER / POWER_N in lite.js. Letters spelled out ([ôÔ], [ấẤ]) so the match does not depend on the
-- database's locale; \y is the word boundary (\b is a backspace in Postgres regexes).
create or replace function public.lite_analysis(d jsonb) returns jsonb
language sql immutable parallel safe set search_path = public, pg_temp as $$
  select case
    when jsonb_typeof(d #> '{result,technicalSpecs}') is distinct from 'array' then d || '{"_lite": true}'::jsonb
    else jsonb_set(d || '{"_lite": true}'::jsonb, '{result,technicalSpecs}', coalesce((
      select jsonb_agg(x.e order by x.n)
      from (
        select t.e, t.n
        from jsonb_array_elements(d #> '{result,technicalSpecs}') with ordinality as t(e, n)
        where (public.lite_txt(t.e -> 'item') || ' ' || public.lite_txt(t.e -> 'requirement')) ~* '(c[ôÔ]ng su[ấẤ]t|capacity|power|kva|kw)'
          and public.lite_txt(t.e -> 'requirement') ~* '[0-9][[:space:] ﻿]*(kva|kw)\y'
        order by t.n
        limit 3
      ) x
    ), '[]'::jsonb))
  end
$$;

-- security_invoker: the docs table's row-level security applies as the member who reads (their token), not the owner.
create or replace view public.analysis_lite with (security_invoker = true) as
select id, updated_at, public.lite_analysis(data) as data
from public.docs
where coll = 'analysis';

revoke all on function public.lite_txt(jsonb), public.lite_analysis(jsonb) from public, anon;
grant execute on function public.lite_txt(jsonb), public.lite_analysis(jsonb) to authenticated, service_role;
revoke all on public.analysis_lite from anon, authenticated;
grant select on public.analysis_lite to authenticated, service_role;
