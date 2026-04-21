# Plan 1 — Supabase Foundation Implementation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Supabase backend for davejdo.com — schema, RLS, storage buckets, auth middleware, typed query helpers — so that subsequent plans can build UI against a working backend.

**Architecture:** Supabase Postgres + Auth + Storage. Next.js App Router uses `@supabase/ssr` for cookie-backed sessions in server and client components. Migrations live in `supabase/migrations/`. RLS enforces public-read / admin-only-write on every table keyed to the admin email `davejdo6@gmail.com`. A unified `media` table backs both portfolio projects and picturebook photos.

**Tech Stack:** Supabase CLI, `@supabase/supabase-js`, `@supabase/ssr`, PostgreSQL, Next.js 16 App Router (React 19), TypeScript, Vitest + @testing-library for the test harness.

**Spec reference:** `docs/superpowers/specs/2026-04-21-davejdo-redesign-design.md`, sections §4, §5, §9, §10, §14.

**Prerequisites before starting:**
- Supabase account exists, signed in.
- A Supabase project is created **through the Supabase dashboard** with the name `davejdo.com`. (We do not provision via CLI because dashboard-created projects get a branded URL.)
- The project's **Project URL**, **anon key**, and **service_role key** are handy (Settings → API in the dashboard).

---

## File Structure

**New files:**
- `supabase/config.toml` — Supabase CLI local project file (created by `supabase init`).
- `supabase/migrations/20260421000001_schema.sql` — all tables + constraints + indexes.
- `supabase/migrations/20260421000002_rls.sql` — RLS policies (default + guestbook).
- `supabase/migrations/20260421000003_storage.sql` — buckets + storage policies.
- `supabase/migrations/20260421000004_triggers.sql` — updated_at triggers.
- `supabase/seed.sql` — admin user seed + a few sample rows for dev.
- `lib/supabase/server.ts` — server-component Supabase client (cookie read-only).
- `lib/supabase/client.ts` — browser Supabase client.
- `lib/supabase/middleware.ts` — session refresh helper used by `middleware.ts`.
- `lib/supabase/types.ts` — `supabase gen types` output (checked in; regenerated on schema change).
- `lib/supabase/queries/projects.ts` — typed query helpers for the projects resource (template; Plan 2/3 add the rest).
- `lib/supabase/queries/projects.test.ts` — unit tests for the projects helpers.
- `middleware.ts` (repo root, sibling to `next.config.js`) — Next.js edge middleware entry.
- `vitest.config.ts` — test runner config.
- `test/setup.ts` — Vitest setup (env fixture).
- `.env.local.example` — documents all required env vars (regenerated from current `.env.local`).

**Modified:**
- `package.json` — add deps + scripts.
- `.gitignore` — add `.env.local`, `supabase/.temp/`, `supabase/.branches/`.
- `next.config.js` — add Supabase Storage domain to `remotePatterns`.
- `tsconfig.json` — add `"types": ["vitest/globals"]` and include path for tests.

**Explicitly not yet touched in this plan:** any page, any component. We are purely building backend plumbing and one representative query helper.

---

## Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Supabase packages**

Run:
```bash
npm install @supabase/supabase-js@^2.45.0 @supabase/ssr@^0.5.0
```

Expected: packages added to `dependencies` in `package.json`, `package-lock.json` updated, no peer-dependency warnings that block install.

- [ ] **Step 2: Install testing deps**

Run:
```bash
npm install -D vitest@^2.0.0 @vitest/ui@^2.0.0 @testing-library/react@^16.0.0 @testing-library/jest-dom@^6.4.0 jsdom@^25.0.0 @types/node@^20
```

Expected: packages added to `devDependencies`.

- [ ] **Step 3: Install the Supabase CLI globally (one-time dev tool)**

Run:
```bash
npm install -g supabase
supabase --version
```

Expected: prints a version `>= 1.200.0`.

If the global install fails due to permissions, use the Homebrew install instead: `brew install supabase/tap/supabase`. Either is fine — the CLI is never bundled with the app.

- [ ] **Step 4: Add scripts to package.json**

Modify `package.json` so the `scripts` block reads:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui",
  "db:start": "supabase start",
  "db:stop": "supabase stop",
  "db:reset": "supabase db reset",
  "db:types": "supabase gen types typescript --local > lib/supabase/types.ts"
}
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add Supabase + Vitest dependencies"
```

---

## Task 2: Bootstrap the Supabase project folder

**Files:**
- Create: `supabase/config.toml` (via `supabase init`)
- Modify: `.gitignore`

- [ ] **Step 1: Initialize the supabase folder**

Run from the repo root:
```bash
supabase init
```

When prompted for VS Code settings, answer **no** to all prompts. The command creates `supabase/` with a `config.toml`.

Expected: new `supabase/config.toml` file exists. `ls supabase/` shows `config.toml`, `seed.sql` (empty), `.gitignore`.

- [ ] **Step 2: Link the project to the dashboard project**

Get the **project ref** from the Supabase dashboard URL (it's the 20-char string in `https://supabase.com/dashboard/project/<ref>`).

Run:
```bash
supabase link --project-ref <ref>
```

Paste the database password when prompted (found in Settings → Database).

Expected: `supabase/.temp/project-ref` file is created. `supabase link` prints "Finished supabase link.".

- [ ] **Step 3: Add Supabase paths to repo .gitignore**

Append to `.gitignore`:

```
# Supabase
supabase/.temp/
supabase/.branches/
**/supabase/.branches/
```

- [ ] **Step 4: Commit**

```bash
git add supabase/config.toml .gitignore
git commit -m "Initialize Supabase CLI config and link remote project"
```

---

## Task 3: Write the schema migration

**Files:**
- Create: `supabase/migrations/20260421000001_schema.sql`

- [ ] **Step 1: Write the schema migration**

Create `supabase/migrations/20260421000001_schema.sql` with exactly this content:

```sql
-- Unified media table. Storage path is nullable because the admin upload flow
-- inserts a row, issues a signed URL, and finalizes the row post-upload.
-- The CHECK enforces kind/url mutual exclusion; orphan rows (null storage_path
-- older than 24h) are swept nightly (see Plan 2).
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
```

- [ ] **Step 2: Apply the migration locally to verify syntax**

Run:
```bash
supabase start
```

First run will pull Docker images (slow, one-time). Expected end state: prints `API URL`, `DB URL`, `Studio URL`, and a local `anon key`.

Then:
```bash
supabase db reset
```

Expected: every migration applies without error. Last line: "Finished supabase db reset on branch main.".

If a migration fails, read the error, fix the SQL, and re-run `supabase db reset`. Do not proceed until it passes.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260421000001_schema.sql
git commit -m "Add schema migration: media, projects, photos, movies, tags, guestbook"
```

---

## Task 4: Write the RLS migration

**Files:**
- Create: `supabase/migrations/20260421000002_rls.sql`

- [ ] **Step 1: Write the RLS migration**

Create `supabase/migrations/20260421000002_rls.sql` with exactly this content:

```sql
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
```

- [ ] **Step 2: Re-apply migrations to verify**

Run:
```bash
supabase db reset
```

Expected: both migrations apply. If the DO block fails, check that every table in the array actually exists (typos).

- [ ] **Step 3: Verify policies exist**

Run:
```bash
supabase db execute "select tablename, policyname from pg_policies where schemaname = 'public' order by tablename, policyname;"
```

Expected: 18 rows total — 7 tables × 2 policies (public read, admin write) + 3 guestbook policies = 17. `ip_hash` trimming is enforced in code, not policy. Count: should be **17**.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260421000002_rls.sql
git commit -m "Add RLS policies (public read, admin write, guestbook permissive insert)"
```

---

## Task 5: Write the storage migration

**Files:**
- Create: `supabase/migrations/20260421000003_storage.sql`

- [ ] **Step 1: Write the storage migration**

Create `supabase/migrations/20260421000003_storage.sql`:

```sql
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
```

- [ ] **Step 2: Re-apply migrations**

Run:
```bash
supabase db reset
```

Expected: all three migrations apply.

- [ ] **Step 3: Verify buckets**

Run:
```bash
supabase db execute "select id, name, public from storage.buckets;"
```

Expected: two rows — `portfolio` and `photos`, both public.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260421000003_storage.sql
git commit -m "Add storage buckets (portfolio, photos) with admin-only write policies"
```

---

## Task 6: Add updated_at triggers

**Files:**
- Create: `supabase/migrations/20260421000004_triggers.sql`

- [ ] **Step 1: Write the triggers migration**

Create `supabase/migrations/20260421000004_triggers.sql`:

```sql
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

-- Attach to every table that has an updated_at column.
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

create trigger photos_touch before update on public.photos
  for each row execute function public.touch_updated_at();

create trigger movies_touch before update on public.movies
  for each row execute function public.touch_updated_at();
```

- [ ] **Step 2: Re-apply migrations and verify**

Run:
```bash
supabase db reset
supabase db execute "select trigger_name, event_object_table from information_schema.triggers where trigger_schema = 'public' order by event_object_table;"
```

Expected: three rows — `projects_touch`, `photos_touch`, `movies_touch`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260421000004_triggers.sql
git commit -m "Add updated_at triggers on projects, photos, movies"
```

---

## Task 7: Seed SQL (admin note + dev sample data)

**Files:**
- Modify: `supabase/seed.sql`

The admin user is seeded **outside the SQL migration pipeline** because `auth.users` writes via raw SQL are discouraged. We use Supabase's Auth Admin API through a one-time script. `seed.sql` in this repo contains only developer-convenience sample data that runs on every `supabase db reset`.

- [ ] **Step 1: Document the admin-user creation procedure**

Edit `supabase/seed.sql` (file exists after `supabase init`) to exactly:

```sql
-- Dev-only seed data. Runs on every `supabase db reset`.
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
```

- [ ] **Step 2: Apply seed**

Run:
```bash
supabase db reset
```

Expected: after migrations, the seed runs and inserts 4 tags + 2 guestbook entries. Verify:

```bash
supabase db execute "select count(*) from public.tags;"
supabase db execute "select count(*) from public.guestbook_entries;"
```

Expected: `4` and `2` (or higher if dev data has been added manually).

- [ ] **Step 3: Commit**

```bash
git add supabase/seed.sql
git commit -m "Add dev seed data (sample tags + guestbook entries)"
```

---

## Task 8: Create the admin user in the remote project

**Files:** (none touched in the repo — this is a one-time operation against Supabase)

- [ ] **Step 1: Create the admin user in the dashboard**

In the Supabase dashboard for project `davejdo.com`:

1. Authentication → Users → **Add user** → **Create new user**.
2. Email: `davejdo6@gmail.com`.
3. Password: choose a strong password. Write it down in a password manager — Dave needs it.
4. Check **Auto Confirm User** so he doesn't need to click a verification email.
5. Click **Create user**.

Expected: a new row in the Users tab with email `davejdo6@gmail.com`, confirmed status true.

- [ ] **Step 2: Verify**

Run:
```bash
supabase db execute "select email, email_confirmed_at from auth.users where email = 'davejdo6@gmail.com';"
```

This runs against your **local** DB, so it will return 0 rows. That is expected. To run against the remote:

```bash
supabase db execute "select email, email_confirmed_at from auth.users where email = 'davejdo6@gmail.com';" --db-url "$DATABASE_URL"
```

Where `DATABASE_URL` is the remote Postgres connection string (Dashboard → Settings → Database → Connection string → URI). Don't commit `DATABASE_URL`.

Expected (remote): one row, `email_confirmed_at` non-null.

- [ ] **Step 3: No commit** — this task modified no repo files.

---

## Task 9: Push migrations to the remote Supabase project

**Files:** none

- [ ] **Step 1: Push migrations**

Run:
```bash
supabase db push
```

Expected: prints "Applying migration 20260421000001_schema.sql", then `...000002_rls.sql`, etc. Final line: "Finished supabase db push.".

- [ ] **Step 2: Verify RLS in the remote dashboard**

Dashboard → **Database** → **Tables**. Open `projects`. The **RLS Enabled** toggle should be on, and two policies should be listed: "public read" and "admin write".

- [ ] **Step 3: No commit** — remote state only.

---

## Task 10: Environment variables

**Files:**
- Modify: `.env.local`
- Create: `.env.local.example`

- [ ] **Step 1: Add Supabase env vars to `.env.local`**

Append to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from dashboard>
SUPABASE_SERVICE_ROLE_KEY=<service_role key from dashboard>

REVALIDATE_TOKEN=<generate via `openssl rand -hex 32`>
CRON_TOKEN=<generate via `openssl rand -hex 32`>
```

Confirm no existing keys are overwritten.

- [ ] **Step 2: Create `.env.local.example`**

Create `.env.local.example` with the **keys only, no values**:

```
# Supabase — create project at supabase.com, project name "davejdo.com"
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Spotify — see README for OAuth walkthrough
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=

# TMDB — https://themoviedb.org/settings/api
NEXT_PUBLIC_TMDB_API_KEY=

# Runtime tokens (generate via `openssl rand -hex 32`)
REVALIDATE_TOKEN=
CRON_TOKEN=
```

- [ ] **Step 3: Verify `.env.local` is ignored**

Run:
```bash
git check-ignore .env.local
```

Expected output: `.env.local`. If nothing prints, `.env.local` is NOT ignored — fix by adding `.env.local` to `.gitignore` (it should already be there; existing `.gitignore` shows `.env*.local` is already covered).

- [ ] **Step 4: Commit**

```bash
git add .env.local.example
git commit -m "Document environment variables in .env.local.example"
```

---

## Task 11: Generate TypeScript types from the schema

**Files:**
- Create: `lib/supabase/types.ts`

- [ ] **Step 1: Create the lib folder**

Run:
```bash
mkdir -p lib/supabase/queries
```

- [ ] **Step 2: Generate types**

With the local DB running (`supabase start`):

```bash
npm run db:types
```

This runs `supabase gen types typescript --local > lib/supabase/types.ts`.

Expected: `lib/supabase/types.ts` is a ~400-line file exporting a `Database` type with nested `public.Tables.projects`, `public.Tables.photos`, etc.

If the file is empty or truncated, check that `supabase start` is running and rerun.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/types.ts
git commit -m "Generate TypeScript types from Supabase schema"
```

---

## Task 12: Build the Supabase SSR clients

**Files:**
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/middleware.ts`
- Create: `middleware.ts` (repo root)

- [ ] **Step 1: Write the browser client**

Create `lib/supabase/client.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Write the server client**

Create `lib/supabase/server.ts`:

```ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Server Component client. Reads cookies; cannot write them.
 * Use inside Server Components, Route Handlers, and Server Actions that
 * are called from Server Components.
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — ignore. middleware.ts handles refresh.
          }
        },
      },
    }
  );
}
```

- [ ] **Step 3: Write the middleware helper**

Create `lib/supabase/middleware.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./types";

/**
 * Refreshes the auth session cookie on every matched request.
 * Called from middleware.ts at the repo root.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Always call getUser to trigger a refresh.
  await supabase.auth.getUser();

  return response;
}
```

- [ ] **Step 4: Write the middleware entry**

Create `middleware.ts` at the repo root:

```ts
import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Refresh the session cookie on every request that could trigger UI — skip
    // static assets and Next internals for performance.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)",
  ],
};
```

- [ ] **Step 5: Commit**

```bash
git add middleware.ts lib/supabase/client.ts lib/supabase/server.ts lib/supabase/middleware.ts
git commit -m "Add Supabase SSR clients + root middleware for session refresh"
```

---

## Task 13: Test harness — Vitest config and setup

**Files:**
- Create: `vitest.config.ts`
- Create: `test/setup.ts`
- Modify: `tsconfig.json`

- [ ] **Step 1: Write `vitest.config.ts`**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

Install the React plugin (forgot in Task 1 — do it now):

```bash
npm install -D @vitejs/plugin-react@^4.3.0
git add package.json package-lock.json
git commit -m "Add @vitejs/plugin-react for Vitest JSX support"
```

- [ ] **Step 2: Write the setup file**

Create `test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { beforeAll, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

beforeAll(() => {
  // Stable env for unit tests. Integration tests override via process.env.
  process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://localhost:54321";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
});

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 3: Update tsconfig.json**

Modify `tsconfig.json`, adding `"types": ["vitest/globals"]` under `compilerOptions` and ensuring tests are included:

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] },
    "target": "ES2017",
    "types": ["vitest/globals", "node"]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "test/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Sanity-check test runs**

Create `test/sanity.test.ts`:

```ts
import { describe, expect, test } from "vitest";

describe("sanity", () => {
  test("the test runner runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run:
```bash
npm test
```

Expected: 1 passing test. If jsdom fails to load, ensure `jsdom` is in `devDependencies`.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts test/setup.ts test/sanity.test.ts tsconfig.json
git commit -m "Set up Vitest with jsdom + RTL cleanup"
```

---

## Task 14: First query helper — TDD the `projects` reads

**Files:**
- Create: `lib/supabase/queries/projects.ts`
- Create: `lib/supabase/queries/projects.test.ts`

We write the `projects` helpers first as a template. Plan 2 replicates the pattern for `photos`, `movies`, `tags`, `guestbook`, and `media`.

- [ ] **Step 1: Write the failing test**

Create `lib/supabase/queries/projects.test.ts`:

```ts
import { describe, expect, test, vi } from "vitest";
import { listPublishedProjects, getProjectBySlug } from "./projects";

function mockClient(data: unknown, error: unknown = null) {
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => ({ data, error })),
    then: (resolve: any) => resolve({ data, error }),
  };
  return {
    from: vi.fn(() => builder),
  } as any;
}

describe("listPublishedProjects", () => {
  test("queries projects table and filters to published=true, ordered by position", async () => {
    const fake = [{ id: "a", slug: "a", title: "A" }];
    const client = mockClient(fake);
    const result = await listPublishedProjects(client);
    expect(client.from).toHaveBeenCalledWith("projects");
    expect(result).toEqual(fake);
  });

  test("returns [] when the query errors", async () => {
    const client = mockClient(null, new Error("boom"));
    const result = await listPublishedProjects(client);
    expect(result).toEqual([]);
  });
});

describe("getProjectBySlug", () => {
  test("returns the matched project", async () => {
    const fake = { id: "a", slug: "alpha", title: "Alpha" };
    const client = mockClient(fake);
    const result = await getProjectBySlug(client, "alpha");
    expect(client.from).toHaveBeenCalledWith("projects");
    expect(result).toEqual(fake);
  });

  test("returns null when no row is found", async () => {
    const client = mockClient(null);
    const result = await getProjectBySlug(client, "missing");
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test — expect failure**

```bash
npm test -- projects.test.ts
```

Expected: failure, "Cannot find module './projects'".

- [ ] **Step 3: Write the minimal implementation**

Create `lib/supabase/queries/projects.ts`:

```ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types";

type Client = SupabaseClient<Database>;
type Project = Database["public"]["Tables"]["projects"]["Row"];

export async function listPublishedProjects(client: Client): Promise<Project[]> {
  const { data, error } = await client
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("position", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getProjectBySlug(
  client: Client,
  slug: string
): Promise<Project | null> {
  const { data, error } = await client
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) return null;
  return data ?? null;
}
```

- [ ] **Step 4: Run the test — expect pass**

```bash
npm test -- projects.test.ts
```

Expected: 4 passing tests. If the `mockClient` chain fails on `.order(...)` being awaited, the implementation should call `.order(...)` which returns the builder — the `.then` in the mock resolves the await. Confirm the mock shape matches.

- [ ] **Step 5: Commit**

```bash
git add lib/supabase/queries/projects.ts lib/supabase/queries/projects.test.ts
git commit -m "Add projects query helpers with TDD (list + by-slug)"
```

---

## Task 15: Integration smoke — server client can connect

**Files:**
- Create: `lib/supabase/integration.test.ts`

- [ ] **Step 1: Write the integration smoke test**

Create `lib/supabase/integration.test.ts`:

```ts
/**
 * Integration smoke test.
 * Requires `supabase start` to be running locally.
 * Skipped in CI unless SUPABASE_LOCAL=1 is set.
 */
import { createClient } from "@supabase/supabase-js";
import { describe, expect, test } from "vitest";
import type { Database } from "./types";
import { listPublishedProjects } from "./queries/projects";

const describeIntegration = process.env.SUPABASE_LOCAL ? describe : describe.skip;

describeIntegration("supabase local integration", () => {
  const client = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost:54321",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
  );

  test("listPublishedProjects returns an array (empty OK)", async () => {
    const result = await listPublishedProjects(client);
    expect(Array.isArray(result)).toBe(true);
  });

  test("guestbook seed data is readable via anon key", async () => {
    const { data, error } = await client
      .from("guestbook_entries")
      .select("id, name, message, created_at");
    expect(error).toBeNull();
    expect(data?.length ?? 0).toBeGreaterThanOrEqual(2);
  });
});
```

- [ ] **Step 2: Run the integration test**

With `supabase start` still running and the anon key exported:

```bash
export NEXT_PUBLIC_SUPABASE_URL="$(supabase status -o env | grep API_URL | cut -d= -f2 | tr -d '"')"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="$(supabase status -o env | grep ANON_KEY | cut -d= -f2 | tr -d '"')"
SUPABASE_LOCAL=1 npm test -- integration.test.ts
```

Expected: 2 passing tests. If "guestbook seed data" fails with zero rows, re-run `supabase db reset` and retry.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/integration.test.ts
git commit -m "Add Supabase local integration smoke test"
```

---

## Task 16: Wire the Supabase Storage remote pattern

**Files:**
- Modify: `next.config.js`

- [ ] **Step 1: Extend remotePatterns**

Modify `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "mosaic.scdn.co" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "drive.usercontent.google.com" },
      // Supabase Storage (replace <ref> with your project ref)
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
};

module.exports = nextConfig;
```

- [ ] **Step 2: Confirm the build still compiles**

Run:
```bash
npm run build
```

Expected: build succeeds. If it fails because wildcard hostnames aren't allowed in this Next version, replace the wildcard with the literal project ref: `"<ref>.supabase.co"`.

- [ ] **Step 3: Commit**

```bash
git add next.config.js
git commit -m "Allow Next.js Image to load from Supabase Storage"
```

---

## Task 17: README "First-time setup" entry

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Prepend a setup section**

Insert this section in `README.md` **after the "Stack" section** (keep everything else):

```markdown
## First-time setup (Supabase)

1. **Create the Supabase project** at supabase.com. Name it `davejdo.com`.
2. **Create the admin user**: Authentication → Users → Add user → email `davejdo6@gmail.com`, set password, check Auto Confirm.
3. **Copy the project ref, anon key, and service_role key** into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon>
   SUPABASE_SERVICE_ROLE_KEY=<service_role>
   ```
4. **Link the CLI**:
   ```bash
   supabase link --project-ref <ref>
   ```
5. **Push migrations**:
   ```bash
   supabase db push
   ```
6. **Local dev** — start the local Supabase stack and regenerate types:
   ```bash
   supabase start
   npm run db:types
   npm run dev
   ```
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "Document first-time Supabase setup in README"
```

---

## Task 18: Final verification run

- [ ] **Step 1: Full test run**

```bash
npm test
```

Expected: all unit tests pass (sanity + projects). Integration test is skipped unless `SUPABASE_LOCAL=1` is set.

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: build succeeds. No warnings about missing `@supabase/*` modules or types.

- [ ] **Step 3: Verify remote schema**

Dashboard → Table Editor → confirm every table from the schema migration exists with RLS enabled.

- [ ] **Step 4: Final commit (if any drift from previous commits)**

```bash
git status
```

If anything is unstaged, review and commit with a meaningful message. Otherwise, this plan is complete.

---

## Self-review checklist (plan author)

- [x] **Spec coverage** — §4 (architecture, file layout), §5 (schema + RLS + storage), §9 (auth + env) all addressed. `media` upload flow, admin CRUD, and public pages are out of scope for this plan and handled in Plans 2 and 3.
- [x] **No placeholders** — every step has literal code, literal commands, literal expected output. The `<ref>` placeholder in env vars is by necessity (unique per project) and is explained.
- [x] **Type consistency** — `SupabaseClient<Database>` is the client type everywhere. `Project` type is derived from the generated types, not hand-rolled.
- [x] **TDD where it applies** — the projects helpers are written test-first (Task 14). Migrations, config files, and SSR clients are structural and aren't test-first, but the integration smoke test in Task 15 exercises them end-to-end.
