-- LinkPulse schema, RLS, indexes, and public redirect RPC
-- Run this in the Supabase SQL editor (or via supabase db push).

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  destination_url text not null,
  short_code text not null,
  title text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint links_short_code_format check (
    short_code ~ '^[a-z0-9_-]{3,32}$'
  ),
  constraint links_destination_http check (
    destination_url ~* '^https?://'
  )
);

create unique index if not exists links_short_code_uidx on public.links (short_code);
create index if not exists links_user_id_created_at_idx
  on public.links (user_id, created_at desc);

create table if not exists public.clicks (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.links (id) on delete cascade,
  clicked_at timestamptz not null default now(),
  referrer text,
  device_type text,
  browser text
);

create index if not exists clicks_link_id_clicked_at_idx
  on public.clicks (link_id, clicked_at desc);
create index if not exists clicks_clicked_at_idx on public.clicks (clicked_at);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists links_set_updated_at on public.links;
create trigger links_set_updated_at
  before update on public.links
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.links enable row level security;
alter table public.clicks enable row level security;

-- No broad table access for PUBLIC or anon.
revoke all on table public.links, public.clicks from public;
revoke all on table public.links from anon;
revoke all on table public.clicks from anon;

grant select, insert, update, delete on table public.links to authenticated;
grant select on table public.clicks to authenticated;

-- Links: owners only
drop policy if exists "links_select_own" on public.links;
create policy "links_select_own"
  on public.links
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "links_insert_own" on public.links;
create policy "links_insert_own"
  on public.links
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "links_update_own" on public.links;
create policy "links_update_own"
  on public.links
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "links_delete_own" on public.links;
create policy "links_delete_own"
  on public.links
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Clicks: readable only for clicks on the owner's links. No direct inserts.
drop policy if exists "clicks_select_own_links" on public.clicks;
create policy "clicks_select_own_links"
  on public.clicks
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.links
      where public.links.id = public.clicks.link_id
        and public.links.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Public redirect RPC (SECURITY DEFINER)
--
-- Behavior notes:
-- - Returns only destination_url (never user_id, link_id, title, etc.).
-- - Missing and inactive links both return zero rows (same client UX).
-- - Analytics insert failures are swallowed so a valid active link still
--   redirects. Redirect availability is prioritized over perfect click counts.
-- ---------------------------------------------------------------------------

create or replace function public.resolve_and_click(
  p_code text,
  p_referrer text default null,
  p_device_type text default null,
  p_browser text default null
)
returns table (destination_url text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link_id uuid;
  v_destination text;
  v_code text;
  v_referrer text;
  v_device text;
  v_browser text;
begin
  v_code := lower(trim(coalesce(p_code, '')));

  if v_code = '' or length(v_code) > 32 then
    return;
  end if;

  select l.id, l.destination_url
    into v_link_id, v_destination
  from public.links as l
  where l.short_code = v_code
    and l.is_active = true
  limit 1;

  if v_link_id is null then
    return;
  end if;

  -- Sanitize / bound analytics inputs (no raw UA, no IP).
  v_referrer := nullif(left(trim(coalesce(p_referrer, '')), 512), '');
  v_device := nullif(left(trim(coalesce(p_device_type, '')), 32), '');
  v_browser := nullif(left(trim(coalesce(p_browser, '')), 64), '');

  begin
    insert into public.clicks (link_id, referrer, device_type, browser)
    values (v_link_id, v_referrer, v_device, v_browser);
  exception
    when others then
      -- Analytics failure must not block redirect for a valid active link.
      null;
  end;

  return query select v_destination;
end;
$$;

revoke all on function public.resolve_and_click(text, text, text, text) from public;
grant execute on function public.resolve_and_click(text, text, text, text) to anon;
grant execute on function public.resolve_and_click(text, text, text, text) to authenticated;

comment on function public.resolve_and_click(text, text, text, text) is
  'Public short-link resolver. Returns destination_url for active links. Records a click best-effort; analytics failures do not block redirect.';
