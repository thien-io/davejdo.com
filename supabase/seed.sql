-- Dev-only seed data. Runs on every `supabase db reset` (local stack with Docker).
-- The admin user (davejdo6@gmail.com) is created via the Supabase dashboard
-- or the Auth Admin API, NOT here. See README "First-time setup" section.

-- Sample tags for Picturebook development.
insert into public.tags (name, slug) values
  ('film',        'film'),
  ('tokyo',       'tokyo'),
  ('everyday',    'everyday'),
  ('golden-hour', 'golden-hour')
on conflict (slug) do nothing;

-- Sample guestbook entries so the public page isn't empty during dev.
insert into public.guestbook_entries (name, message) values
  ('A friend',  'First! Love the new site.'),
  ('Anonymous', 'Incredible portfolio work.')
on conflict do nothing;
