-- Adds an editable profile picture for the About page.
alter table site_settings
  add column profile_media_id uuid references media(id) on delete set null;
