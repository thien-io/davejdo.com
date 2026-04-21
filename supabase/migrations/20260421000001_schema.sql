-- Unified media table. Storage path is nullable because the admin upload flow
-- inserts a row, issues a signed URL, and finalizes the row post-upload.
-- The CHECK enforces kind/url mutual exclusion; orphan rows (null storage_path
-- older than 24h) are swept nightly.
create table media (
  id                uuid primary key default gen_random_uuid(),
  kind              text not null check (kind in ('image','video','external_video')),
  storage_path      text,
  external_url      text,
  width             int,
  height            int,
  blurhash          text,
  alt               text,
  duration_seconds  int,
  owner_resource    text check (owner_resource in ('project','photo')),
  owner_id          uuid,
  created_at        timestamptz not null default now(),
  check (
    (kind in ('image','video') and external_url is null)
    or (kind = 'external_video' and external_url is not null and storage_path is null)
  )
);

create index media_owner_idx on media (owner_resource, owner_id);

-- Portfolio projects
create table projects (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  title          text not null,
  client         text,
  year           int,
  description    text,
  cover_media_id uuid references media(id) on delete set null,
  position       int not null default 0,
  published      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index projects_published_position_idx
  on projects (published, position desc);

-- Picturebook (personal photo journal)
create table photos (
  id         uuid primary key default gen_random_uuid(),
  media_id   uuid not null references media(id) on delete cascade,
  caption    text,
  location   text,
  taken_at   date,
  position   int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index photos_taken_at_idx on photos (taken_at desc nulls last, created_at desc);

-- Movies diary
create table movies (
  id         uuid primary key default gen_random_uuid(),
  tmdb_id    int not null,
  rating     smallint check (rating between 1 and 5),
  review     text,
  watched_at date not null default now(),
  position   int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index movies_tmdb_id_idx on movies (tmdb_id);
create index movies_watched_at_idx on movies (watched_at desc);

-- Tags
create table tags (
  id   uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null
);

create table photo_tags (
  photo_id uuid not null references photos(id) on delete cascade,
  tag_id   uuid not null references tags(id) on delete cascade,
  primary key (photo_id, tag_id)
);

-- Ordered lightbox media per project
create table project_media (
  project_id uuid not null references projects(id) on delete cascade,
  media_id   uuid not null references media(id) on delete cascade,
  position   int not null default 0,
  primary key (project_id, media_id)
);

create index project_media_ordered_idx
  on project_media (project_id, position);

-- Guestbook entries (public insert, admin-only delete)
create table guestbook_entries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(trim(name)) between 1 and 40),
  message    text not null check (length(trim(message)) between 1 and 280),
  ip_hash    text,
  created_at timestamptz not null default now()
);

create index guestbook_entries_created_at_idx
  on guestbook_entries (created_at desc);
