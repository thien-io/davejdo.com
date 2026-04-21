# Plan 4 — Guestbook + Migration + Cleanup Implementation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the public `/guestbook` page with an anti-spam server action, migrate the existing hardcoded picturebook photos into Supabase, delete the stale tennis MDX + old page stubs, and complete final QA.

**Architecture:** `/guestbook` is a Server Component reading the entries list + a Client Component form. Submissions go through a Server Action that (1) validates the zod schema, (2) rejects filled honeypots silently, (3) rate-limits by SHA-256(IP + server secret), (4) inserts the row. The photo migration is a one-off Node script that reads the existing hardcoded list, downloads, uploads to Supabase Storage, and inserts `media` + `photos` rows.

**Tech Stack:** Next.js Server Actions, zod, Node 20+ `fetch` and `crypto.subtle`, Supabase Service Role client for the migration script.

**Spec reference:** `docs/superpowers/specs/2026-04-21-davejdo-redesign-design.md`, sections §6 (guestbook page), §13 (migration), §17 (305 redirect already in Plan 3).

**Prerequisite:** Plans 1–3 complete. Admin populated with at least a few real items (so the full-stack smoke passes).

---

## File Structure

**New:**
- `app/guestbook/page.tsx` — server component, fetches entries + renders form.
- `app/guestbook/GuestbookForm.tsx` — client component with honeypot and counter.
- `app/guestbook/actions.ts` — server action `submitGuestbookAction`.
- `lib/rateLimit.ts` + test — IP-hash rate-limit helper (pure logic).
- `scripts/migrate-photos.ts` — one-time photo migration.
- `scripts/README.md` — documents the script lifecycle.

**Modified:**
- None (everything else in this plan is cleanup deletions).

**Deleted:**
- `content/modernfootwork.mdx`
- `content/tennis-strategy.mdx`
- `content/topspin.mdx`
- `content/` directory (if empty after deletions).
- `pnpm-lock.yaml` (we standardize on `package-lock.json`).
- `scripts/migrate-photos.ts` after a successful run (archived via git tag).

---

## Task 1: Rate-limit helper (TDD)

**Files:**
- Create: `lib/rateLimit.ts`
- Create: `lib/rateLimit.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/rateLimit.test.ts`:

```ts
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { hashIp, checkRateLimit, resetRateLimitStore } from "./rateLimit";

describe("hashIp", () => {
  test("same IP + same secret → same hash", async () => {
    const a = await hashIp("1.2.3.4", "secret");
    const b = await hashIp("1.2.3.4", "secret");
    expect(a).toBe(b);
  });

  test("different secrets → different hashes", async () => {
    const a = await hashIp("1.2.3.4", "s1");
    const b = await hashIp("1.2.3.4", "s2");
    expect(a).not.toBe(b);
  });

  test("hash length is 64 hex chars (sha-256)", async () => {
    const a = await hashIp("10.0.0.1", "x");
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimitStore();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test("first submission is allowed", () => {
    const r = checkRateLimit("hash-1", 60_000);
    expect(r.ok).toBe(true);
  });

  test("second submission within window is denied with retryAfter", () => {
    checkRateLimit("hash-1", 60_000);
    const r = checkRateLimit("hash-1", 60_000);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.retryAfterSeconds).toBeGreaterThan(0);
      expect(r.retryAfterSeconds).toBeLessThanOrEqual(60);
    }
  });

  test("after the window elapses, submission is allowed again", () => {
    checkRateLimit("hash-1", 60_000);
    vi.advanceTimersByTime(61_000);
    const r = checkRateLimit("hash-1", 60_000);
    expect(r.ok).toBe(true);
  });

  test("different hashes are independent", () => {
    checkRateLimit("hash-1", 60_000);
    const r = checkRateLimit("hash-2", 60_000);
    expect(r.ok).toBe(true);
  });
});
```

- [ ] **Step 2: Run — fails**

```bash
npm test -- rateLimit.test.ts
```

Expected: module-not-found.

- [ ] **Step 3: Implement**

Create `lib/rateLimit.ts`:

```ts
/**
 * Very small in-memory rate limiter keyed by IP hash.
 * Good enough for a personal-site guestbook. For serious traffic, swap in
 * Upstash or Redis — the exported interface stays the same.
 *
 * State is per-process. Vercel serverless cold starts reset it; that's an
 * acceptable leak for this use case because the guestbook sees minimal traffic
 * and the honeypot + length checks do most of the spam work.
 */

const store = new Map<string, number>();

export function resetRateLimitStore() {
  store.clear();
}

export async function hashIp(ip: string, secret: string): Promise<string> {
  const data = new TextEncoder().encode(`${ip}:${secret}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

export function checkRateLimit(key: string, windowMs: number): RateLimitResult {
  const now = Date.now();
  const last = store.get(key);
  if (!last || now - last >= windowMs) {
    store.set(key, now);
    return { ok: true };
  }
  const retryAfterSeconds = Math.ceil((windowMs - (now - last)) / 1000);
  return { ok: false, retryAfterSeconds };
}
```

- [ ] **Step 4: Run — passes**

```bash
npm test -- rateLimit.test.ts
```

Expected: 7 passing.

- [ ] **Step 5: Commit**

```bash
git add lib/rateLimit.ts lib/rateLimit.test.ts
git commit -m "Add rate-limit helper (hashIp + checkRateLimit) with TDD"
```

---

## Task 2: Guestbook server action

**Files:**
- Create: `app/guestbook/actions.ts`

- [ ] **Step 1: Write the action**

Create `app/guestbook/actions.ts`:

```ts
"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { guestbookSchema } from "@/lib/schemas/guestbook";
import { hashIp, checkRateLimit } from "@/lib/rateLimit";
import type { Database } from "@/lib/supabase/types";

const RATE_WINDOW_MS = 60_000;

export type SubmitResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitGuestbookAction(formData: FormData): Promise<SubmitResult> {
  const payload = {
    name: formData.get("name"),
    message: formData.get("message"),
    website: formData.get("website") ?? "", // honeypot
  };

  const parsed = guestbookSchema.safeParse(payload);
  if (!parsed.success) {
    // Honeypot filled, over-length, or empty — silent failure for honeypot
    // (humans saw the error boundary if anything), public error for the rest.
    if (payload.website) return { ok: true }; // pretend success to bots
    const first = parsed.error.errors[0]?.message ?? "Invalid entry";
    return { ok: false, error: first };
  }

  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "0.0.0.0";
  const secret = process.env.REVALIDATE_TOKEN ?? "dev-secret";
  const key = await hashIp(ip, secret);

  const rate = checkRateLimit(key, RATE_WINDOW_MS);
  if (!rate.ok) {
    return { ok: false, error: `Slow down, try again in ${rate.retryAfterSeconds}s.` };
  }

  // Service-role client — skips RLS which is fine because we've already
  // validated input. (Public-insert RLS also exists; either would work.)
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase.from("guestbook_entries").insert({
    name: parsed.data.name.trim(),
    message: parsed.data.message.trim(),
    ip_hash: key,
  });

  if (error) return { ok: false, error: "Couldn't save. Try again?" };

  revalidatePath("/guestbook");
  return { ok: true };
}
```

- [ ] **Step 2: Commit**

```bash
git add app/guestbook/actions.ts
git commit -m "Add submitGuestbookAction with honeypot + rate limit + RLS-compatible insert"
```

---

## Task 3: Guestbook page + form

**Files:**
- Create: `app/guestbook/page.tsx`
- Create: `app/guestbook/GuestbookForm.tsx`

- [ ] **Step 1: Server page**

Create `app/guestbook/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal/Reveal";
import { GuestbookForm } from "./GuestbookForm";
import Link from "next/link";

export const metadata = { title: "Guestbook · davejdo" };

const PAGE_SIZE = 50;

export default async function GuestbookPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const pageNum = Math.max(0, Number(page ?? 0));
  const from = pageNum * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const { data, count } = await supabase
    .from("guestbook_entries")
    .select("id, name, message, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const entries = data ?? [];
  const total = count ?? 0;
  const hasMore = from + entries.length < total;

  return (
    <>
      <section className="px-6 md:px-12 pt-16 pb-10">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-3">
              07 — GUESTBOOK
            </div>
            <h1 className="font-display text-[clamp(4rem,10vw,9rem)] leading-[0.85]">GUESTBOOK</h1>
            <p className="text-muted-foreground max-w-md mt-6">
              Leave a note — I read every one.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-6 md:px-12 pb-10">
        <div className="max-w-2xl mx-auto">
          <GuestbookForm />
        </div>
      </section>

      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-2xl mx-auto space-y-3">
          {entries.map((e) => (
            <article
              key={e.id}
              className="border border-border rounded-xl p-5 bg-card"
            >
              <header className="flex items-baseline justify-between mb-2">
                <span className="font-display text-xl tracking-wide text-[#d4b97c]">
                  {e.name}
                </span>
                <time className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                  {formatRelative(e.created_at)}
                </time>
              </header>
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{e.message}</p>
            </article>
          ))}

          {entries.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-12">
              No entries yet. Be the first.
            </div>
          )}

          <div className="flex justify-between items-center pt-6">
            {pageNum > 0 ? (
              <Link
                href={`/guestbook?page=${pageNum - 1}`}
                className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground"
              >
                ← Newer
              </Link>
            ) : <span />}
            {hasMore && (
              <Link
                href={`/guestbook?page=${pageNum + 1}`}
                className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground"
              >
                Older →
              </Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diffMs = now - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
```

- [ ] **Step 2: Form client component**

Create `app/guestbook/GuestbookForm.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitGuestbookAction } from "./actions";

const MAX_NAME = 40;
const MAX_MESSAGE = 280;

export function GuestbookForm() {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await submitGuestbookAction(fd);
      if (res.ok) {
        toast.success("Signed.");
        setName("");
        setMessage("");
      } else {
        toast.error(res.error);
      }
    });
  }

  const valid = name.trim().length > 0 && message.trim().length > 0;

  return (
    <form
      onSubmit={onSubmit}
      className="border border-border rounded-xl p-5 bg-card space-y-4"
    >
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="sr-only"
      />

      <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] gap-3">
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, MAX_NAME))}
          placeholder="Your name"
          className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-foreground"
          required
        />
        <input
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
          placeholder="Leave a note…"
          className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-foreground"
          required
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
          {name.length}/{MAX_NAME} · {message.length}/{MAX_MESSAGE}
        </div>
        <button
          type="submit"
          disabled={!valid || pending}
          className="px-5 py-2 bg-[#d4b97c] text-black rounded-lg text-sm font-medium disabled:opacity-40"
        >
          {pending ? "…" : "Sign"}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/guestbook
git commit -m "Add /guestbook page + form with honeypot, counters, rate-limited submit"
```

- [ ] **Step 4: Smoke test**

Visit `/guestbook`:
1. Page shows the 2 seeded entries (from Plan 1).
2. Submit a real entry → success toast, entry appears.
3. Submit a second entry immediately → rate-limited error.
4. Open dev tools, fill the honeypot input (`document.querySelector('input[name=website]').value = 'spam'`), submit → succeeds silently but no row is added (confirm in the entries list).
5. Submit a 281-char message → client truncates to 280; server would also reject.
6. Paginate if more than 50 entries.

---

## Task 4: Migrate existing hardcoded picturebook photos

**Files:**
- Create: `scripts/migrate-photos.ts`
- Create: `scripts/README.md`
- Modify: `package.json`
- Modify: `tsconfig.json` (include `scripts/`)

- [ ] **Step 1: Locate the source data**

Open `app/life/picturebook/page.tsx` (pre-redesign version, still on git) or git history. Copy the `photos` array into a file for the migration script to read.

Run:
```bash
git show HEAD~1:app/life/picturebook/page.tsx | head -120
```

Or if the redesign has already replaced it in Plan 3, pull the original from a tag `pre-redesign` (if tagged). If no such tag exists:

```bash
git log --oneline app/life/picturebook/page.tsx
```

Identify the last commit with the hardcoded array and check it out to a side file:

```bash
git show <sha>:app/life/picturebook/page.tsx > /tmp/old-picturebook.tsx
```

Copy the `photos = [ … ]` array into a constant inside the migration script.

- [ ] **Step 2: Write the migration script**

Create `scripts/migrate-photos.ts`:

```ts
/**
 * One-time migration: download hardcoded picturebook photos, upload to
 * Supabase Storage (bucket "photos"), insert media + photos rows.
 *
 * Usage:
 *   npx tsx scripts/migrate-photos.ts
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 * Delete this script after a successful run — we tag the commit so it can be
 * recovered from git history if we ever need to re-run.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { extname } from "node:path";

// ----- PASTE THE OLD PHOTOS ARRAY HERE -----
const photos: Array<{
  id: number;
  src: string;
  alt: string;
  caption: string;
  location: string;
  size: string;
}> = [
  // example stub; replace with the real array from git history.
  // { id: 1, src: "https://lh3.googleusercontent.com/d/XXX", alt: "...", caption: "...", location: "...", size: "large" },
];
// --------------------------------------------

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function downloadAsBuffer(url: string): Promise<{ buffer: Uint8Array; contentType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`);
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const arrayBuffer = await res.arrayBuffer();
  return { buffer: new Uint8Array(arrayBuffer), contentType };
}

async function migrateOne(p: (typeof photos)[number]) {
  console.log(`→ ${p.caption || p.alt} (${p.src})`);

  const { buffer, contentType } = await downloadAsBuffer(p.src);
  const ext = contentType.split("/")[1]?.split(";")[0] || "jpg";
  const filename = `${Date.now()}-${p.id}.${ext}`;
  const mediaId = crypto.randomUUID();
  const storagePath = `photos/${mediaId}/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(`${mediaId}/${filename}`, buffer, { contentType });
  if (uploadError) throw uploadError;

  const { error: mediaError } = await supabase.from("media").insert({
    id: mediaId,
    kind: "image",
    storage_path: storagePath,
    alt: p.alt || p.caption,
    owner_resource: "photo",
  });
  if (mediaError) throw mediaError;

  const { error: photoError } = await supabase.from("photos").insert({
    media_id: mediaId,
    caption: p.caption || null,
    location: p.location || null,
  });
  if (photoError) throw photoError;

  console.log(`   ✓ stored at ${storagePath}`);
}

async function main() {
  if (photos.length === 0) {
    console.error("No photos in the array. Paste the old picturebook array into scripts/migrate-photos.ts before running.");
    process.exit(1);
  }
  for (const p of photos) {
    try {
      await migrateOne(p);
    } catch (err) {
      console.error(`   ✗ failed:`, err);
    }
  }
}

main().then(() => process.exit(0));
```

- [ ] **Step 3: Install tsx (if not already)**

```bash
npm install -D tsx@^4.15.0
```

- [ ] **Step 4: Document the script**

Create `scripts/README.md`:

```markdown
# Scripts

One-off developer scripts. These are NOT imported from application code.

## migrate-photos.ts

**Purpose:** Migrates the original hardcoded picturebook photos into Supabase Storage + rows in `media` + `photos` tables. Runs once against the production database.

**Prerequisites:**
- `.env.local` contains `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- The remote schema is up-to-date (`supabase db push`).
- The array at the top of the script has been filled with the photos you want to migrate.

**Run:**
```bash
npx tsx scripts/migrate-photos.ts
```

**After a successful run:** delete `scripts/migrate-photos.ts`. Tag the commit that removed it as `migrate-photos-done` so you can recover from git if ever needed:

```bash
git tag migrate-photos-done
git push --tags
```
```

- [ ] **Step 5: Update tsconfig include**

Modify `tsconfig.json`:

```json
"include": [
  "next-env.d.ts",
  "**/*.ts",
  "**/*.tsx",
  ".next/types/**/*.ts",
  ".next/dev/types/**/*.ts",
  "test/**/*.ts",
  "scripts/**/*.ts"
]
```

- [ ] **Step 6: Commit the scaffolding**

```bash
git add scripts/migrate-photos.ts scripts/README.md tsconfig.json package.json package-lock.json
git commit -m "Add migrate-photos.ts scaffolding + scripts README"
```

- [ ] **Step 7: Fill the array and run**

Open `scripts/migrate-photos.ts`, paste the real photos array pulled from git history, save (do not commit yet).

Run:
```bash
npx tsx scripts/migrate-photos.ts
```

Expected: each photo logs `→ … / ✓ stored at …`. On completion, visit `/life/picturebook` → photos are visible.

If any fail, investigate (403 from Google Drive = sharing was revoked; 500 from Supabase = check RLS). Rerun until every photo lands.

- [ ] **Step 8: Archive the script**

With the migration complete:

```bash
git tag migrate-photos-done
git push --tags
git rm scripts/migrate-photos.ts
git commit -m "Archive migrate-photos.ts after successful run"
```

The script is still recoverable via `git show migrate-photos-done:scripts/migrate-photos.ts`.

---

## Task 5: Delete tennis MDX and old page stubs

**Files:**
- Delete: `content/*.mdx`
- Delete: `content/` (if empty)
- Delete: `hooks/use-parallax.ts` if unused
- Delete: `pnpm-lock.yaml`

- [ ] **Step 1: Confirm tennis MDX is not imported**

```bash
npx rg "modernfootwork|tennis-strategy|topspin" --type ts --type tsx
```

Expected: no results. If there are any, identify and clean them before deletion.

- [ ] **Step 2: Delete**

```bash
git rm content/modernfootwork.mdx content/tennis-strategy.mdx content/topspin.mdx
rmdir content 2>/dev/null || true
```

- [ ] **Step 3: Check use-parallax.ts usage**

```bash
npx rg "use-parallax" --type ts --type tsx
```

If the only results are in `hooks/use-parallax.ts` itself (no imports), delete:

```bash
git rm hooks/use-parallax.ts
rmdir hooks 2>/dev/null || true
```

If it's referenced, skip this step.

- [ ] **Step 4: Standardize on npm (remove pnpm-lock)**

```bash
git rm pnpm-lock.yaml
```

Add `pnpm-lock.yaml` to `.gitignore`:

```
# Package manager — we use npm; guard against accidental pnpm commits.
pnpm-lock.yaml
```

- [ ] **Step 5: Commit**

```bash
git add .gitignore
git commit -m "Delete tennis MDX, unused parallax hook, and pnpm-lock (npm-only)"
```

---

## Task 6: Update README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update Project Structure section**

Open `README.md`, locate the "Project Structure" block, and replace with the current shape:

```markdown
## Project Structure

```
davejdo/
├── app/
│   ├── page.tsx                 # Home
│   ├── about/page.tsx           # About
│   ├── work/page.tsx            # Portfolio
│   ├── life/
│   │   ├── picturebook/         # Bento photo grid
│   │   ├── films/               # TMDB + Supabase films diary
│   │   └── music/               # Spotify top + now-playing
│   ├── guestbook/               # Public guestbook
│   ├── admin/                   # Gated CRUD for Dave
│   ├── api/
│   │   ├── spotify/*            # Existing Spotify endpoints
│   │   ├── revalidate/          # Token-gated revalidate hook
│   │   └── media/sweep/         # Nightly orphan-media sweep
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── nav/                     # TopBar, Drawer, NowPlayingTicker
│   ├── media/                   # Lightbox, MediaImage, MediaVideo
│   ├── reveal/                  # Reveal, HeroName, ParallaxLayer
│   ├── admin/                   # Admin-only UI
│   ├── ui/                      # shadcn primitives
│   └── footer.tsx
├── lib/
│   ├── supabase/                # clients, types, queries
│   ├── schemas/                 # zod validation
│   ├── blurhash.ts
│   ├── rateLimit.ts
│   └── tmdb.ts
├── supabase/
│   ├── migrations/*.sql
│   └── seed.sql
└── vercel.json                  # Cron schedule
```
```

- [ ] **Step 2: Add "Adding content" guide**

Append:

```markdown
## Adding content (admin)

1. Sign in at `/admin/login` with the admin email.
2. **Portfolio → New project** — fill title/slug, upload cover + lightbox media.
3. **Photos → drag in** to upload; tag inline.
4. **Movies → paste a TMDB URL** (e.g., `https://www.themoviedb.org/movie/603`), confirm preview, rate.
5. **Tags** — rename, merge, or delete.
6. **Guestbook** — moderate public entries.
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "Update README project structure and content-management guide"
```

---

## Task 7: Final QA checklist

- [ ] **Step 1: Full test run**

```bash
npm test
```

Expected: all unit tests pass. Integration tests skipped unless `SUPABASE_LOCAL=1`.

- [ ] **Step 2: Local integration tests**

```bash
supabase start
SUPABASE_LOCAL=1 npm test
```

Expected: every test passes.

- [ ] **Step 3: E2E**

```bash
E2E_ADMIN_PASSWORD="$ADMIN_PASSWORD" npm run e2e
```

Expected: admin golden path passes.

- [ ] **Step 4: Production build**

```bash
npm run build
```

Expected: succeeds with no type errors.

- [ ] **Step 5: Link audit**

Run the dev server, click every link in the nav drawer, every tile on the homepage, every project in `/work`, every poster in `/life/films`, every tag pill in `/life/picturebook`, both pagination arrows in `/guestbook`. Expected: no 404s.

Additionally:
- Visit `/projects` → redirects to `/work` (308).
- Visit a random non-existent URL like `/foo` → renders `not-found.tsx`.

- [ ] **Step 6: Visual QA**

In the browser, with prefers-reduced-motion off:
- [ ] Hero letter stagger fires.
- [ ] Parallax works on `/` and `/work`.
- [ ] Lightbox opens/closes, arrow keys + ESC work.
- [ ] Drawer slides in/out.
- [ ] Now-playing shows a track (start Spotify if needed) or "Not playing".
- [ ] Grain visible on both light and dark modes.

With prefers-reduced-motion on (OS preference):
- [ ] Reveals appear instantly (no slide-up).
- [ ] Parallax still functional but stripped.
- [ ] Drawer open/close uses default timing (no jank).

- [ ] **Step 7: Accessibility pass**

- [ ] Every `button` has text or `aria-label`.
- [ ] Every `img` has an `alt` (use empty string for decorative).
- [ ] Tab order on guestbook form skips the honeypot.
- [ ] Lightbox traps focus (known gap — document and accept for this release).

- [ ] **Step 8: Deploy to Vercel**

From the repo:

```bash
npx vercel --prod
```

Set all environment variables in the Vercel dashboard before running — copy the full list from `.env.local.example`. Also set `ADMIN_EMAIL`-compatible protections if needed (not currently required; the gate is the RLS + layout check).

After deploy:
- [ ] Visit the production URL → hero renders.
- [ ] Log in at `/admin/login` → admin works.
- [ ] Upload a test project → appears on `/work`.
- [ ] Guestbook submission → appears on `/guestbook` after revalidation.

- [ ] **Step 9: Final commit (tag)**

```bash
git tag v1.0.0
git push origin v1.0.0
```

---

## Self-review checklist (plan author)

- [x] **Spec coverage** — §6 `/guestbook` page, §13 migration (photos, tennis MDX, old pages), §17 `/projects → /work` redirect already handled in Plan 3. This plan closes §13 and the guestbook branch of §6/§8/§16.
- [x] **No placeholders** — rate limiter, actions, page, and form all have complete code. The migration script is a template **with a documented placeholder** for the photos array — this is an intentional placeholder because the array must be pulled from git history at run time and is environment-specific.
- [x] **Type consistency** — `GuestbookInput` via zod, `Database` used throughout, `SubmitResult` tagged union for the action return.
- [x] **Rate-limit strategy** — honest about the in-memory limitation and documented the swap path (Upstash) for future scaling.
- [x] **Archive of one-time scripts** — tag-then-delete pattern is applied so the migration is recoverable from git without cluttering the working tree.
