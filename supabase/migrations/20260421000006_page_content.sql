create table page_content (
  slug        text primary key,
  description text not null default '',
  updated_at  timestamptz not null default now()
);

insert into page_content (slug, description) values
  ('home',        'Designer and creator. Building things that matter and capturing life along the way.'),
  ('work',        'Selected projects across print, editorial, and social media. Click any tile to see it in full.'),
  ('picturebook', 'Moments captured in light and shadow. Filter by tag, or let the scroll lead.'),
  ('films',       'A slow diary of cinema — rating, one-liners, and what I was thinking at the time.'),
  ('music',       'Top 100 on Spotify, and whatever is spinning right now.'),
  ('about',       'I''m Dave J Do — a designer working out of Connecticut, focused on print and social-media design. This site is a running notebook of what I make, what I see, and what I''m listening to.

I care about craft over novelty, typography over graphics, and showing the work more than talking about it.'),
  ('guestbook',   'Leave a note — I read every one.')
on conflict (slug) do nothing;

alter table page_content enable row level security;

create policy "public read" on public.page_content
  for select using (true);

create policy "admin write" on public.page_content
  for all using (public.is_admin()) with check (public.is_admin());

create trigger page_content_touch before update on public.page_content
  for each row execute function public.touch_updated_at();
