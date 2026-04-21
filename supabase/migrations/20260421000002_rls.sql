-- Single source of truth for the admin identity.
-- Changing the admin email = update this function + redeploy.
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select auth.jwt() ->> 'email' = 'davejdo6@gmail.com'
$$;

-- Enable RLS on every application table.
alter table media             enable row level security;
alter table projects          enable row level security;
alter table photos            enable row level security;
alter table movies            enable row level security;
alter table tags              enable row level security;
alter table photo_tags        enable row level security;
alter table project_media     enable row level security;
alter table guestbook_entries enable row level security;

-- Default policy set: public read, admin-only write.
-- Applied to projects, photos, movies, media, tags, photo_tags, project_media.
do $$
declare
  t text;
begin
  for t in
    select unnest(array['media','projects','photos','movies','tags','photo_tags','project_media'])
  loop
    execute format('create policy "public read" on public.%I for select using (true)', t);
    execute format(
      'create policy "admin write" on public.%I for all using (public.is_admin()) with check (public.is_admin())',
      t
    );
  end loop;
end
$$;

-- Guestbook policies: public read, public insert, admin-only delete, no updates.
create policy "guestbook public read"
  on public.guestbook_entries
  for select using (true);

create policy "guestbook public insert"
  on public.guestbook_entries
  for insert with check (true);

create policy "guestbook admin delete"
  on public.guestbook_entries
  for delete using (public.is_admin());
-- Note: no update policy exists, which means updates are denied by default.
