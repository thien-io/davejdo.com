-- Create public-read buckets for portfolio and photos uploads.
insert into storage.buckets (id, name, public)
values
  ('portfolio', 'portfolio', true),
  ('photos',    'photos',    true)
on conflict (id) do nothing;

-- Bucket RLS: everyone can read; only the admin can insert/update/delete.
-- These policies apply to objects across both buckets.

create policy "public read portfolio+photos"
  on storage.objects
  for select
  using (bucket_id in ('portfolio','photos'));

create policy "admin write portfolio+photos"
  on storage.objects
  for insert
  with check (bucket_id in ('portfolio','photos') and public.is_admin());

create policy "admin update portfolio+photos"
  on storage.objects
  for update
  using (bucket_id in ('portfolio','photos') and public.is_admin())
  with check (bucket_id in ('portfolio','photos') and public.is_admin());

create policy "admin delete portfolio+photos"
  on storage.objects
  for delete
  using (bucket_id in ('portfolio','photos') and public.is_admin());
