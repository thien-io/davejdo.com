-- Singleton settings table for site-wide configuration.
-- Hero image + any future global fields live here.
create table site_settings (
  id text primary key default 'singleton' check (id = 'singleton'),
  hero_media_id uuid references media(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into site_settings (id) values ('singleton');

alter table site_settings enable row level security;

create policy "public read" on public.site_settings
  for select using (true);

create policy "admin write" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();
