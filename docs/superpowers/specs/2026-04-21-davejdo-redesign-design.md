# davejdo.com — Redesign & Supabase Integration

**Status:** Draft for review
**Date:** 2026-04-21
**Owner:** Thien (developer) building for Dave J Do (client, sole admin)
**Supabase project:** `davejdo.com`
**Admin email:** `davejdo6@gmail.com`

## 1. Goals

Turn the current `davejdo.com` into Dave J Do's personal portfolio and journal:

- A mason-wong.com–inspired visual redesign (grainy texture, editorial typography, scroll-reveal choreography, generous spacing) applied to every public page.
- A Supabase-backed content layer so Dave can self-manage portfolio projects, photo-journal entries (the "picturebook"), and movies — without touching code.
- A unified admin panel gated by a single admin account (email + password), reachable at `/admin`.
- Existing Spotify Top-100 and Now-Playing integrations preserved, with the now-playing surface extended into a persistent sidebar/drawer ticker.
- Designer-first UX: asymmetric hero, editorial type scale, cursor affordances, lightbox-driven galleries.

**Non-goals:** multi-user auth, public comments, blog/writing surface, subscription/commerce, analytics beyond Vercel defaults, advanced CMS features (localization, scheduled publishing, drafts).

## 2. Users & roles

- **Visitor** — anyone. Reads public pages; cannot log in.
- **Admin (Dave)** — single user, email `davejdo6@gmail.com`. Everything else on the site is public read-only.

There is no user-role column. The admin identity is enforced by Row Level Security against `auth.jwt() ->> 'email'` plus a defense-in-depth check in the admin layout.

## 3. Scope (one comprehensive spec)

Ships as a single spec and plan covering:

1. Visual redesign across all public pages.
2. Supabase project provisioning + schema migration.
3. Auth + middleware + admin layout.
4. Admin CRUD for projects, photos, movies, tags.
5. Unified media-upload pipeline (images + videos + external links).
6. Content migration from the current hardcoded site.
7. Tennis MDX cleanup and `/about` rewrite.

## 4. Architecture

### Stack

**Kept:** Next.js 16 App Router, React 19, Tailwind 3, Radix/shadcn primitives, next-themes, Framer Motion, GSAP + ScrollTrigger, existing `/api/spotify/*` routes, the fonts Bebas Neue / DM Sans / JetBrains Mono.

**Added:**

- `@supabase/supabase-js` + `@supabase/ssr` — SSR-safe Supabase client (cookie-backed session).
- `react-hook-form` + `zod` — admin form validation.
- `sonner` — toasts.
- `@dnd-kit/core` — drag-reorder in admin tables.
- `blurhash` + `@unpic/placeholder` — image placeholder generation (client-side).

**Explicitly not added:** Lenis (smooth scroll), Cloudinary, Sanity/Contentful, any additional CMS.

### Render model

- **Public pages:** React Server Components, fetching from Supabase via the anon key. RLS guarantees the anon key can only read.
- **Admin pages:** Server-rendered with session cookie read via `@supabase/ssr`. Client Components for forms and upload dropzones.
- **Now-Playing:** Client Component polling `/api/spotify/now-playing` every 30s. Present in the nav drawer on every page.
- **TMDB enrichment:** fetched server-side on `/life/films` render, cached for 24h via `fetch` revalidation.
- **Mutations:** Next.js Server Actions where possible; REST calls to Supabase directly from the client only for direct-to-storage uploads via signed URLs.
- **Revalidation:** every admin write calls `revalidatePath()` for the affected public page (`/work`, `/life/picturebook`, `/life/films`).

### File layout

```
app/
  (public)/
    page.tsx                     # /
    work/page.tsx                # /work (portfolio)
    life/
      picturebook/page.tsx
      films/page.tsx
      music/page.tsx
    about/page.tsx
  admin/
    layout.tsx                   # auth gate
    page.tsx                     # index / overview
    login/page.tsx
    portfolio/page.tsx
    portfolio/[id]/page.tsx
    photos/page.tsx
    movies/page.tsx
    tags/page.tsx
  api/
    spotify/now-playing/route.ts # unchanged
    spotify/top-tracks/route.ts  # unchanged
    revalidate/route.ts          # token-protected
components/
  nav/top-bar.tsx, drawer.tsx, now-playing-ticker.tsx
  ui/*                           # shadcn primitives (kept)
  media/dropzone.tsx, media-grid.tsx, lightbox.tsx, video-player.tsx
  reveal/                        # gsap + framer-motion reveal primitives
  admin/*                        # admin-only UI
lib/supabase/
  server.ts, client.ts, middleware.ts
  types.ts                       # generated via `supabase gen types`
  queries/projects.ts, photos.ts, movies.ts, tags.ts, media.ts
lib/tmdb.ts                      # existing, kept
supabase/
  migrations/*.sql               # schema + RLS
  seed.sql                       # admin user seed
```

## 5. Data model

Seven tables. All with `created_at timestamptz default now()` and (where applicable) `updated_at timestamptz default now()` maintained by a trigger.

```sql
-- media declared first — referenced by projects.cover_media_id and photos.media_id.
-- storage_path is nullable: upload flow inserts a media row, obtains a signed URL,
-- then finalizes the row with the path. The CHECK enforces kind/URL mutual
-- exclusion only; unfinalized rows are swept nightly (see §10).
create table media (
  id                uuid primary key default gen_random_uuid(),
  kind              text check (kind in ('image','video','external_video')) not null,
  storage_path      text,
  external_url      text,
  width             int,
  height            int,
  blurhash          text,
  alt               text,
  duration_seconds  int,
  owner_resource    text check (owner_resource in ('project','photo')),
  owner_id          uuid,
  created_at        timestamptz default now(),
  check (
    (kind in ('image','video') and external_url is null)
    or (kind = 'external_video' and external_url is not null and storage_path is null)
  )
);

-- projects (portfolio)
create table projects (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  client        text,
  year          int,
  description   text,
  cover_media_id uuid references media(id),
  position      int default 0,
  published     boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- photos (picturebook journal)
create table photos (
  id            uuid primary key default gen_random_uuid(),
  media_id      uuid not null references media(id),
  caption       text,
  location      text,
  taken_at      date,
  position      int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- movies (films diary)
create table movies (
  id            uuid primary key default gen_random_uuid(),
  tmdb_id       int not null,
  rating        smallint check (rating between 1 and 5),
  review        text,
  watched_at    date default now(),
  position      int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- tags + M:N
create table tags (
  id    uuid primary key default gen_random_uuid(),
  name  text unique not null,
  slug  text unique not null
);
create table photo_tags (
  photo_id uuid references photos(id) on delete cascade,
  tag_id   uuid references tags(id) on delete cascade,
  primary key (photo_id, tag_id)
);

-- ordered lightbox sequence for a project
create table project_media (
  project_id uuid references projects(id) on delete cascade,
  media_id   uuid references media(id) on delete cascade,
  position   int default 0,
  primary key (project_id, media_id)
);
```

### RLS policies (applied to every table above)

```sql
alter table <table> enable row level security;

create policy "public read" on <table>
  for select using (true);

create policy "admin write" on <table>
  for all using (auth.jwt() ->> 'email' = 'davejdo6@gmail.com')
  with check (auth.jwt() ->> 'email' = 'davejdo6@gmail.com');
```

### Storage buckets

Two buckets: `portfolio`, `photos`.

- Public read.
- Object paths namespaced: `projects/<project_id>/<timestamp>-<filename>`, `photos/<photo_id>/<timestamp>-<filename>`.
- Storage RLS: `INSERT`, `UPDATE`, `DELETE` restricted to the admin email using the same JWT check as table RLS.

### Why this shape

- **Unified `media` table** — one upload path, one placeholder strategy, one video player; projects and photos both reference it.
- **Tags as rows, not an array** — central rename/merge/delete; clean autocomplete.
- **`position` + `published`** — Dave can reorder and hide WIPs without destructive edits.
- **Single admin email hardcoded** — avoids a roles system (YAGNI). The email is referenced in RLS policies and in the admin layout guard.
- **TMDB ID only on movies** — title, poster, year are not duplicated in the database; fetched on render and cached.

## 6. Public pages

### `/` — Home

**Hero** (confirmed via visual companion):
- Asymmetric grid: name block on the left (`DAVE` / `J DO`, "DO" in gold accent, 800-weight sans, `clamp(4rem, 10vw, 9rem)`), Index column on the right (— Picturebook / — Films / — Music / — Projects) separated by a 1px vertical divider.
- Status pill with pulsing green dot (`Available for work`).
- Mono section marker (`01 — HOME`).
- Giant background wordmark `DAVEJDO` parallaxes up 30% on scroll, `rgba(255,255,255,0.025)`.
- Vertical "SCROLL ↓" cue (bottom-right, mono, rotated).
- Grain overlay over the full section.

**Featured** (below fold): four editorial cards (Work, Picturebook, Films, Music) with hover-reveal cover media. Each card animates in via GSAP ScrollTrigger at 85% viewport.

**Footer:** existing `<Footer>` component, restyled with new tokens. "Let's Talk" + socials remain the contact mechanism — no separate `/contact` route.

### `/work` — Portfolio grid

- Masonry of published projects (cover media, title, year overlay on hover). Sorted by `position`.
- Click → full-screen lightbox that cycles `project_media`. Prev/next via arrows, ESC, or drag. Keyboard arrows supported. Cursor shows a mono "NEXT" / "CLOSE" label on hover.
- Videos play inline in the lightbox: `<video controls playsinline>` for uploads; YouTube/Vimeo use their iframe embed; raw MP4 URL uses `<video>`.
- Tile aspect ratio honored via stored `width`/`height`; `blurhash` renders as a blurred placeholder until the image loads.

### `/life/picturebook` — Personal journal

- Bento grid of mixed aspect ratios (tall, wide, square inferred from stored `width`/`height`).
- Sticky tag filter bar at the top (mono pill style). Click a tag to filter; multi-select supported.
- Click photo → lightbox (same component as `/work`). Caption, location, taken-at, tags shown in a side panel.
- Default sort: `taken_at desc` (falls back to `created_at desc` when `taken_at` is null).
- Pagination after 30 items (Load More button, not infinite scroll — keeps the page analytic-friendly).

### `/life/films` — Letterboxd-style

- Poster grid keyed by `tmdb_id` → TMDB poster URL. Sort toggle: "Recently Watched" (default) or "Highest Rated".
- Hover reveals rating stars (gold) + short review.
- Click poster → slide-in drawer with full review, watched date, link to TMDB.
- Fallback: if TMDB fetch fails, render a placeholder poster with title text + rating.

### `/life/music` — Spotify

- Structurally unchanged from current: Now-Playing card at top, two columns of 50 top albums (current `2×50` layout).
- Restyled: new type scale, new color tokens, new reveal animation. Vinyl-spin animation (`.vinyl-spinning`) kept for the currently-playing album.

### `/about` — Clean slate

Single long-scroll page:
- Oversized intro paragraph (editorial tone).
- Small portrait (existing `/profile.png`).
- Services list (Print, Social Media, Editorial) — static for now; not admin-editable in this spec.
- Location: Connecticut.
- Contact block (socials + email).

No timeline, no skill meters, no client logos.

## 7. Navigation

### Top bar (default)

Fixed top strip, ~64px, subtle bottom border, grain overlay above.
- Left: `DAVEJDO` wordmark (with gold "DO").
- Center: sparse breadcrumb / current section label, mono micro-text.
- Right: `MENU` button (opens drawer), theme toggle.

No inline navigation links in the top bar — all nav lives in the drawer. This is a deliberate mason-wong.com choice: keep the canvas clean.

### Drawer

Slides in from the left, full height, ~320px wide, dark with heavy grain.
- Header: wordmark.
- Section list: Home / Work / Picturebook / Films / Music / About.
- Now-Playing ticker (auto-refreshing, gold accent when playing, subtle greyed state when not).
- Socials row: IG / X / LinkedIn / Discord / email.
- Small `admin` link at the bottom — visible to everyone, auth gate is on the page.
- Theme toggle as fallback on mobile where the top bar hides it.

### Mobile

Top bar collapses to wordmark + `MENU`. Drawer behavior is identical; full width on screens under 640px.

## 8. Admin UX

### Shell

- Route: `/admin`. Rail-on-left layout: vertical nav with four sections (Portfolio, Photos, Movies, Tags). Top-right: Dave's email + logout.
- Dark theme only in admin, regardless of site toggle — reduces eye fatigue for editing sessions and avoids having to design two admin palettes.
- Styled to match the site (grain, mono microtext, gold accents) but tighter (12px base, denser tables).

### `/admin/login`

Minimal centered card: email, password, submit. Errors inline. Success redirects to `/admin`.

### `/admin/portfolio`

- Table: title, year, client, cover thumb, published toggle, drag handle, edit, delete.
- "New project" button → modal form:
  - Title (required), slug (auto from title, editable), client (optional), year (optional), description (multiline, optional).
  - Cover media picker (shows already-uploaded media in a grid).
  - **Media manager** — drag-drop-ordered list of media for the lightbox. Each slot accepts: file upload (image up to 10MB / video up to 50MB) OR URL paste (YouTube, Vimeo, direct MP4). Progress bar per upload.
  - Published toggle.
- Delete removes project, its `project_media` rows, and their storage objects in a transaction.

### `/admin/photos`

- Grid view, each tile shows thumb + caption snippet + tag chips.
- "Add photos" opens a batch drag-drop zone accepting up to 20 files at once. Videos supported (same `kind in ('video','external_video')` pipeline as projects).
- Post-upload inline editor per item: caption, location, taken-at date, tags (typeahead, comma-creates-new). "Apply to all" shortcut copies current item's tags/location/date to every other item in the same batch.
- Delete removes photo, `photo_tags` links, orphaned `media` row, and storage object.

### `/admin/movies`

- Table: poster thumb (TMDB), title (TMDB), year (TMDB), rating, one-liner, watched-at, drag handle, delete.
- "Add movie" → single input accepting TMDB ID or TMDB URL (URL parsed for ID).
- Preview card fetches poster/title from TMDB and shows it for confirmation before save. After save: Dave sets rating (1–5 stars) and optional one-liner.

### `/admin/tags`

- Flat list: tag name, photo count, rename, delete, merge-into.
- Rename updates `tags.name` + regenerates `slug`. Merge re-points `photo_tags.tag_id` to the target and deletes the source. Delete cascades via `photo_tags` FK.

### Patterns

- `react-hook-form + zod` for every form. Inline errors.
- Optimistic UI on edits with SWR mutate or Server Action + `revalidatePath`. Rollback on error with a sonner toast.
- Keyboard shortcuts: `N` = new item, `/` = focus search, `Esc` = close modal.
- All tables use `@dnd-kit/core` for reorder.

## 9. Auth & security

### Flow

- Supabase email+password.
- Admin user seeded via `supabase/seed.sql`: INSERT into `auth.users` with a hashed password Dave chooses at project-provision time (passed as a migration variable). Dave can reset later via `/admin/login` → "forgot password" (Supabase built-in).
- `middleware.ts` uses `@supabase/ssr` to refresh the session cookie on every matched request (scoped to `/admin/*`).
- `app/admin/layout.tsx` calls `supabase.auth.getUser()` server-side. Redirects to `/admin/login` if no user OR `user.email !== 'davejdo6@gmail.com'`. This is belt-and-suspenders with RLS.

### RLS summary

Every data table: public SELECT, admin-only everything else (see SQL in §5). Storage buckets mirror this.

### Secrets & env

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # only used by migration/seed scripts, never at runtime
NEXT_PUBLIC_TMDB_API_KEY=...         # existing
SPOTIFY_CLIENT_ID=...                # existing
SPOTIFY_CLIENT_SECRET=...            # existing
SPOTIFY_REFRESH_TOKEN=...            # existing
REVALIDATE_TOKEN=...                 # guards /api/revalidate
```

`.env.local.example` is created/updated so the fields are documented.

## 10. Media pipeline

### Upload (happy path)

1. User selects file(s) in the admin dropzone.
2. Client reads `width`/`height` (image via `createImageBitmap`; video via `<video>.onloadedmetadata`), runs blurhash in a Web Worker (images only).
3. Client calls Server Action `createMedia({ kind, owner, metadata })`.
4. Server inserts a `media` row with null `storage_path` and returns a signed upload URL.
5. Client uploads directly to Supabase Storage (no bytes proxy through Next.js).
6. On success, client calls `finalizeMedia({ id, storage_path })` which updates the row.
7. Revalidate affected public page.

### Failure handling

- If finalize never fires (tab closed mid-upload): `media.storage_path is null` rows older than 24h are swept by a nightly cron (Vercel Cron → `/api/media/sweep`, token-guarded). The sweep deletes the row and any matching orphan Storage object.
- If Storage upload fails: client retries twice, then shows a sonner error. Media row is marked `storage_path is null` and eligible for sweep.

### External URLs

YouTube / Vimeo / raw MP4 URLs: client posts the URL; server validates (regex + HEAD check), inserts `media` with `kind = 'external_video'`, attempts oEmbed for a thumbnail, and moves on. No sweep needed (no storage object).

### Rendering

- Images: `next/image` with `remotePatterns` extended for Supabase Storage. `placeholder="blur"` fed by `blurhash`.
- Uploaded videos: `<video controls playsinline preload="metadata" poster={blurhash_to_dataurl}>`.
- External video: YouTube & Vimeo embedded via iframe; raw MP4 uses `<video>`.

### File size limits

- Images: 10 MB (enforced client-side + Supabase bucket config).
- Videos: 50 MB (Supabase default). Larger files must be external-linked; admin form surfaces this with a helpful error.

## 11. Visual system

### Typography

| Role | Font | Size | Notes |
|---|---|---|---|
| Display | Bebas Neue | `clamp(4rem, 10vw, 9rem)` on hero; `clamp(3rem, 6vw, 5rem)` on section heads | 800-equivalent weight, `letter-spacing: -0.04em` on hero |
| Body | DM Sans | 14/16/18 | `line-height: 1.6`, `letter-spacing: -0.005em` |
| Mono | JetBrains Mono | 10-11px | `letter-spacing: 0.2em`, uppercase, for section markers, metadata, SCROLL cue |

Baseline: 4px rhythm via Tailwind default spacing. Section vertical padding: `py-24 md:py-40`.

### Color tokens

| Token | Dark | Light | Use |
|---|---|---|---|
| `bg` | `#000` | `#fafaf8` | background |
| `fg` | `#eaeaea` | `#1a1a1a` | foreground |
| `muted` | `#888` | `#666` | secondary text |
| `border` | `#1a1a1a` | `#e5e5e2` | hairlines |
| `accent` | `#d4b97c` | `#c9a668` | gold (existing `brand-gold`) |

Dark background is pure `#000` to make grain and accent gold pop. Light background is warm off-white (not pure white) to avoid clinical feel.

### Grain overlay

Existing `.grain-overlay::after` SVG turbulence is kept, tuned: `opacity: 0.035` on dark, `opacity: 0.05` on light, `mix-blend-mode: overlay`. Fixed positioning, `z-index: 9999`, pointer-events none.

### Scroll choreography

- **Hero:** letter-by-letter name reveal (0.04s stagger, `power3.out`, 0.8s each). Name lines shift up 100px → 0, fade 0 → 1.
- **Parallax:** giant background `DAVEJDO` moves up 30% of scroll distance. Framer Motion `useScroll` + `useTransform`.
- **Section reveal:** headings slide up 40px + fade at 85% viewport, children stagger at 0.08s. GSAP ScrollTrigger.
- **Tile hover:** cover media zoom `scale(1.02)` over 300ms, caption slides up from overlay. Cursor swaps to a monospace arrow label (OPEN, NEXT).
- **Page transitions:** 300ms crossfade + 8px shift via existing `page-transition.tsx`.
- **Reduced motion:** `prefers-reduced-motion: reduce` instantly reveals all GSAP targets, disables parallax, short-circuits the letter stagger.

### Cursor

`cursor-glow` (existing) stays. On media hover, swap to a small pill-shaped label (mono, uppercase — e.g., `OPEN →`, `NEXT →`). Disabled on touch devices via `@media (hover: none)`.

## 12. Spotify integration (preserved)

- `GET /api/spotify/now-playing` — unchanged.
- `GET /api/spotify/top-tracks` — unchanged.
- `/life/music` — same data, restyled with new tokens.
- **New:** `<NowPlayingTicker>` client component in the nav drawer. Polls `/api/spotify/now-playing` every 30s. Shows: vinyl-spin icon when playing, track/artist one-line scroll if title overflows, muted when nothing is playing.

## 13. Content migration

- Hardcoded picturebook photos (Google Drive URLs): one-off script (`scripts/migrate-photos.ts`) downloads each and uploads to the `photos` Supabase bucket with placeholder captions for Dave to edit. Run once, archive the script.
- `content/*.mdx` (three tennis articles): deleted. Not referenced anywhere.
- Current `/about` and `/projects` pages: replaced.
- Existing sidebar → repurposed as the drawer. `Footer` restyled, kept.
- Theme provider, cursor-glow, page-transition components: kept, rewired into the new layout.

## 14. Testing strategy

Because this is a portfolio with a small admin, test effort is proportional:

- **Unit:** query helpers in `lib/supabase/queries/*` — happy path + RLS denial mock. Blurhash generation. TMDB ID parsing.
- **Integration:** Supabase local dev (`supabase start`) + Vitest. Seed test data, exercise: create project with media, reorder, delete cascade, tag merge, media sweep.
- **E2E:** one Playwright spec covering the admin golden path — log in, upload photo, add tag, create project with two media, verify it shows on public pages after revalidation.
- **Visual:** manual only. Dev server + browser for the redesign. No Percy/Chromatic.

No dedicated load test; portfolio traffic does not justify it.

## 15. Rollout

1. Provision Supabase project `davejdo.com`, run migrations + seed admin user.
2. Build in a feature branch. Ship entire redesign in one PR to simplify review (user preference: single spec / single rollout).
3. Pre-flight: run `migrate-photos.ts` against seed data, verify all public pages render, verify admin flows.
4. Deploy to Vercel production. Dave logs in, loads real content.
5. Delete `scripts/migrate-photos.ts` after successful migration (artifact of a one-time operation).

## 16. Out of scope for this spec

- Writing/blog surface (`/journal`). Noted as potential future work.
- Multi-admin auth / roles.
- Services-section admin editability. Services are static text in `/about` initially.
- Commerce / booking / scheduling.
- Comments.
- Email newsletter.
- Analytics beyond Vercel defaults.
- Image transformation pipeline beyond Next.js Image + blurhash.
- Video streaming / HLS.

## 17. Open questions & assumptions

- **Password seeding:** assumed Dave picks his initial password at project-setup time and it's passed to the seed as a secret. He can reset later via the login page's forgot-password flow (Supabase built-in).
- **TMDB rate limits:** assumed default TMDB limits are fine; worst case, films page caches for 24h.
- **Lenis smooth scroll:** rejected. Native scroll only.
- **Admin theme:** forced dark regardless of public-site theme toggle.
- **Existing `/projects` route:** replaced by `/work`. If existing links to `/projects` exist externally, add a 308 redirect in `next.config.js`.
