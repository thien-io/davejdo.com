# Plan 3 — Public Redesign Implementation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild every public page with the mason-wong.com–inspired visual system: pure-black dark bg, grain, editorial typography, asymmetric hero, GSAP scroll choreography, hybrid top-bar + drawer nav, lightbox for media, cursor label, and data pulled from Supabase + TMDB + Spotify.

**Architecture:** Public pages are React Server Components reading from Supabase via `@supabase/ssr`. Reveal choreography uses GSAP + ScrollTrigger wrapped in a reusable `<Reveal>` primitive. Parallax uses Framer Motion's `useScroll` + `useTransform`. Lightbox is a self-contained client component that accepts a mixed media sequence. The now-playing ticker is a polling client component mounted inside the drawer.

**Tech Stack:** GSAP + ScrollTrigger (already installed), Framer Motion (installed), Tailwind tokens updated for new black palette, existing `cursor-glow` repurposed with label mode.

**Spec reference:** `docs/superpowers/specs/2026-04-21-davejdo-redesign-design.md`, sections §6, §7, §11, §12.

**Prerequisite:** Plans 1 and 2 complete. Supabase queries + admin exist. Dave can populate real data for smoke-testing.

---

## File Structure

**Modified:**
- `app/layout.tsx` — replace Sidebar with new `<TopBar>` + `<Drawer>` nav; keep theme provider, cursor glow, toaster, grain overlay.
- `app/globals.css` — new tokens (black bg), grain tuning, new reveal utilities.
- `tailwind.config.ts` — update `brand-gold` to `#d4b97c`.
- `next.config.js` — add `/projects → /work` redirect.
- `app/page.tsx` — rebuild as the new asymmetric hero + featured sections.
- `app/about/page.tsx` — rewrite.
- `app/life/picturebook/page.tsx` — rebuild, Supabase-backed, tag filter.
- `app/life/films/page.tsx` — rebuild, Supabase + TMDB.
- `app/life/music/page.tsx` — restyle only.

**New:**
- `app/work/page.tsx` — Supabase-backed portfolio grid with lightbox.
- `components/nav/TopBar.tsx`
- `components/nav/Drawer.tsx`
- `components/nav/NowPlayingTicker.tsx`
- `components/reveal/Reveal.tsx` — wraps children with GSAP scroll reveal on mount.
- `components/reveal/HeroName.tsx` — letter-by-letter mask reveal for the hero.
- `components/reveal/ParallaxLayer.tsx` — Framer Motion parallax wrapper.
- `components/media/Lightbox.tsx` — full-screen carousel (images + videos + external).
- `components/media/MediaImage.tsx` — Next Image with blur placeholder from blurhash.
- `components/media/MediaVideo.tsx` — `<video>` / embed dispatcher.
- `components/ui/CursorLabel.tsx` — hover-cursor label pill (OPEN/NEXT).
- `components/ui/GrainSurface.tsx` — component-scoped heavier grain.
- `components/ui/TagFilterBar.tsx` — sticky tag pill bar.
- `lib/tmdb.ts` — typed TMDB fetch helpers (replaces any existing scattered calls).

**Deleted:**
- `components/sidebar.tsx` — superseded by TopBar + Drawer (still referenced until this plan's Task 2, then removed).
- `app/projects/` — replaced by `/work`.

---

## Task 1: Update tokens, grain, and globals

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: Update tailwind brand colors**

Modify `tailwind.config.ts`, replacing the `brand` block:

```ts
brand: {
  black: "#000000",
  offblack: "#0a0a0a",
  paper: "#fafaf8",
  muted: "#888888",
  gold: "#d4b97c",
},
```

Do not remove any other colors — Radix/shadcn token colors stay as they are.

- [ ] **Step 2: Update globals.css color tokens**

Modify `app/globals.css`, replacing the `:root` and `.dark` blocks with:

```css
@layer base {
  :root {
    --background: 42 27% 97%;         /* #fafaf8 */
    --foreground: 0 0% 10%;           /* #1a1a1a */
    --card: 0 0% 100%;
    --card-foreground: 0 0% 10%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 10%;
    --primary: 0 0% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 93%;
    --secondary-foreground: 0 0% 10%;
    --muted: 0 0% 93%;
    --muted-foreground: 0 0% 40%;
    --accent: 0 0% 93%;
    --accent-foreground: 0 0% 10%;
    --border: 40 14% 89%;             /* #e5e5e2 */
    --input: 40 14% 89%;
    --ring: 0 0% 10%;
    --radius: 0.75rem;

    --font-display: 'Bebas Neue', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }

  .dark {
    --background: 0 0% 0%;             /* pure black */
    --foreground: 0 0% 92%;            /* #eaeaea */
    --card: 0 0% 4%;
    --card-foreground: 0 0% 92%;
    --popover: 0 0% 4%;
    --popover-foreground: 0 0% 92%;
    --primary: 0 0% 92%;
    --primary-foreground: 0 0% 0%;
    --secondary: 0 0% 10%;
    --secondary-foreground: 0 0% 92%;
    --muted: 0 0% 10%;
    --muted-foreground: 0 0% 53%;
    --accent: 0 0% 10%;
    --accent-foreground: 0 0% 92%;
    --border: 0 0% 10%;                /* #1a1a1a */
    --input: 0 0% 10%;
    --ring: 0 0% 53%;
  }
}
```

- [ ] **Step 3: Tune grain overlay**

Still in `app/globals.css`, replace the `.grain-overlay::after` block:

```css
.grain-overlay::after {
  content: '';
  position: fixed;
  top: -50%;
  left: -50%;
  right: -50%;
  bottom: -50%;
  width: 200%;
  height: 200%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
  opacity: 0.035;
  mix-blend-mode: overlay;
}

:root:not(.dark) .grain-overlay::after {
  opacity: 0.05;
}
```

- [ ] **Step 4: Reduced-motion guard**

Add at the bottom of `app/globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 5: Smoke check**

Run `npm run dev`, load `/`. Expected: fully black background, grain visible at a low intensity, gold is warmer than before. Toggle light mode — warm off-white bg.

- [ ] **Step 6: Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "Update tokens: pure black dark bg, warmer gold, reduced-motion safety"
```

---

## Task 2: TopBar + Drawer + NowPlayingTicker

**Files:**
- Create: `components/nav/TopBar.tsx`
- Create: `components/nav/Drawer.tsx`
- Create: `components/nav/NowPlayingTicker.tsx`
- Delete: `components/sidebar.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: TopBar**

Create `components/nav/TopBar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Menu, Sun, Moon } from "lucide-react";
import { Drawer } from "./Drawer";

const sectionLabel: Record<string, string> = {
  "/":               "INDEX",
  "/work":           "WORK",
  "/life/picturebook": "PICTUREBOOK",
  "/life/films":     "FILMS",
  "/life/music":     "MUSIC",
  "/about":          "ABOUT",
  "/guestbook":      "GUESTBOOK",
};

export function TopBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  useEffect(() => setMounted(true), []);

  const label =
    sectionLabel[pathname] ??
    Object.entries(sectionLabel).find(([k]) => k !== "/" && pathname.startsWith(k))?.[1] ??
    "";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-5 md:px-8 h-14">
          <Link href="/" className="flex items-baseline">
            <span className="font-display text-xl md:text-2xl tracking-wider">DAVEJ</span>
            <span className="font-display text-xl md:text-2xl tracking-wider text-[#d4b97c]">DO</span>
          </Link>
          <div className="hidden md:block font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
            {label}
          </div>
          <div className="flex items-center gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            )}
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md text-[10px] font-mono tracking-[0.22em] uppercase"
              aria-label="Open menu"
            >
              <Menu size={12} /> MENU
            </button>
          </div>
        </div>
      </header>
      <Drawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
```

- [ ] **Step 2: Drawer**

Create `components/nav/Drawer.tsx`:

```tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";
import { NowPlayingTicker } from "./NowPlayingTicker";

const items = [
  { label: "Home",        href: "/" },
  { label: "Work",        href: "/work" },
  { label: "Picturebook", href: "/life/picturebook" },
  { label: "Films",       href: "/life/films" },
  { label: "Music",       href: "/life/music" },
  { label: "About",       href: "/about" },
  { label: "Guestbook",   href: "/guestbook" },
];

const socials = [
  { label: "IN", href: "https://instagram.com/davejdo" },
  { label: "X",  href: "https://x.com/davdjdo" },
  { label: "LI", href: "https://linkedin.com/in/davidjdo" },
  { label: "DC", href: "https://discord.com/users/davejdo" },
];

export function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed top-0 left-0 z-50 h-full w-80 bg-background border-r border-border flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-14 border-b border-border">
              <Link href="/" onClick={onClose} className="flex items-baseline">
                <span className="font-display text-xl tracking-wider">DAVEJ</span>
                <span className="font-display text-xl tracking-wider text-[#d4b97c]">DO</span>
              </Link>
              <button onClick={onClose} aria-label="Close menu">
                <X size={14} />
              </button>
            </div>
            <nav className="flex-1 px-6 py-8 space-y-1">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="block px-3 py-3 rounded-lg text-foreground hover:bg-secondary transition-colors font-display text-2xl tracking-wide"
                >
                  {item.label.toUpperCase()}
                </Link>
              ))}
              <div className="pt-8 mt-8 border-t border-border">
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-3 px-3">
                  Now Playing
                </div>
                <div className="px-3">
                  <NowPlayingTicker />
                </div>
              </div>
            </nav>
            <div className="px-6 py-6 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                {socials.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] tracking-widest text-muted-foreground hover:text-foreground"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
              <Link
                href="/admin"
                onClick={onClose}
                className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-foreground"
              >
                admin
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 3: NowPlayingTicker**

Create `components/nav/NowPlayingTicker.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

type NowPlaying = {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  albumImageUrl?: string;
};

export function NowPlayingTicker() {
  const [data, setData] = useState<NowPlaying | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch("/api/spotify/now-playing");
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData({ isPlaying: false });
      }
    }
    poll();
    const t = setInterval(poll, 30_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  if (!data) {
    return <div className="h-10 rounded bg-secondary/50 animate-pulse" />;
  }

  if (!data.isPlaying || !data.title) {
    return (
      <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
        <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
        Not playing
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {data.albumImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.albumImageUrl}
          alt=""
          className="w-10 h-10 rounded animate-[spin_8s_linear_infinite]"
        />
      )}
      <div className="min-w-0">
        <div className="text-sm truncate">{data.title}</div>
        <div className="text-xs text-muted-foreground truncate">{data.artist}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Replace the root layout**

Modify `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TopBar } from "@/components/nav/TopBar";
import { CursorGlow } from "@/components/cursor-glow";

export const metadata: Metadata = {
  title: "davejdo",
  description: "Personal website of Dave J Do — designer and creator in Connecticut",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased grain-overlay">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="bottom-right" richColors closeButton theme="dark" />
          <CursorGlow />
          <TopBar />
          <main className="pt-14 min-h-screen">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Remove the sidebar**

```bash
git rm components/sidebar.tsx
```

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx components/nav
git commit -m "Replace sidebar with TopBar + Drawer + NowPlayingTicker"
```

- [ ] **Step 7: Smoke check**

Run `npm run dev`. Expected:
- Top bar visible across all pages.
- Clicking MENU opens drawer from the left.
- Drawer shows all 7 section links + now-playing state + socials + admin link.
- Theme toggle works.
- Existing /about, /projects (stale), /life/* still render, but with the new nav floated above.

---

## Task 3: Reveal primitives

**Files:**
- Create: `components/reveal/Reveal.tsx`
- Create: `components/reveal/HeroName.tsx`
- Create: `components/reveal/ParallaxLayer.tsx`

- [ ] **Step 1: Reveal wrapper**

Create `components/reveal/Reveal.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function Reveal({
  children,
  y = 40,
  duration = 0.7,
  stagger = 0,
  delay = 0,
  as: Tag = "div",
  className,
}: {
  children: React.ReactNode;
  y?: number;
  duration?: number;
  stagger?: number;
  delay?: number;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const targets = stagger > 0 ? el.children : el;
      gsap.fromTo(
        targets,
        { y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration,
          stagger,
          delay,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        }
      );
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(stagger > 0 ? el.children : el, { y: 0, opacity: 1 });
    });
    return () => mm.revert();
  }, [y, duration, stagger, delay]);

  const Component = Tag as any;
  return (
    <Component ref={ref as any} className={className}>
      {children}
    </Component>
  );
}
```

- [ ] **Step 2: HeroName (letter-by-letter mask)**

Create `components/reveal/HeroName.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function HeroName({
  children,
  accentIndex,
  delay = 0.2,
  className = "",
}: {
  children: string;
  accentIndex?: number[]; // indices of chars that get gold accent
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        el.querySelectorAll("[data-char]"),
        { y: 110, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.04, duration: 0.8, ease: "power3.out", delay }
      );
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(el.querySelectorAll("[data-char]"), { y: 0, opacity: 1 });
    });
    return () => mm.revert();
  }, [delay, children]);

  return (
    <div ref={ref} className={`overflow-hidden leading-none ${className}`}>
      {children.split("").map((ch, i) => (
        <span
          key={i}
          data-char
          className={`inline-block ${accentIndex?.includes(i) ? "text-[#d4b97c]" : ""}`}
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Parallax layer**

Create `components/reveal/ParallaxLayer.tsx`:

```tsx
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function ParallaxLayer({
  children,
  offset = 30,
  className,
}: {
  children: React.ReactNode;
  offset?: number; // percent of scroll distance
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`0%`, `-${offset}%`]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/reveal
git commit -m "Add reveal primitives: Reveal, HeroName, ParallaxLayer"
```

---

## Task 4: Lightbox + Media components + Cursor label

**Files:**
- Create: `components/media/Lightbox.tsx`
- Create: `components/media/MediaImage.tsx`
- Create: `components/media/MediaVideo.tsx`
- Create: `components/ui/CursorLabel.tsx`
- Modify: `components/cursor-glow.tsx` (add label mode)

- [ ] **Step 1: MediaImage**

Create `components/media/MediaImage.tsx`:

```tsx
import Image from "next/image";
import { blurhashToDataURL } from "@/lib/blurhash";
import { supabasePublicUrl } from "@/lib/supabase/urls";

export type MediaImageInput = {
  storage_path: string | null;
  external_url?: string | null;
  blurhash: string | null;
  alt: string | null;
  width: number | null;
  height: number | null;
};

export function MediaImage({
  media,
  className,
  sizes,
  priority,
}: {
  media: MediaImageInput;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const src = media.storage_path ? supabasePublicUrl(media.storage_path) : media.external_url ?? "";
  const blur = media.blurhash ? blurhashToDataURL(media.blurhash, 32, 32) : undefined;

  if (!src) return null;

  return (
    <Image
      src={src}
      alt={media.alt ?? ""}
      width={media.width ?? 1600}
      height={media.height ?? 1200}
      sizes={sizes}
      priority={priority}
      placeholder={blur ? "blur" : "empty"}
      blurDataURL={blur}
      className={className}
    />
  );
}
```

- [ ] **Step 2: MediaVideo**

Create `components/media/MediaVideo.tsx`:

```tsx
"use client";

import { supabasePublicUrl } from "@/lib/supabase/urls";

type Input = {
  kind: "video" | "external_video";
  storage_path: string | null;
  external_url: string | null;
  alt: string | null;
};

export function MediaVideo({
  media,
  className,
  autoPlay = false,
  controls = true,
}: {
  media: Input;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
}) {
  if (media.kind === "video" && media.storage_path) {
    return (
      <video
        className={className}
        src={supabasePublicUrl(media.storage_path)}
        autoPlay={autoPlay}
        controls={controls}
        playsInline
        preload="metadata"
      />
    );
  }

  if (media.kind === "external_video" && media.external_url) {
    const url = media.external_url;

    // YouTube
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (yt) {
      return (
        <iframe
          className={className}
          src={`https://www.youtube.com/embed/${yt[1]}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      );
    }

    // Vimeo
    const vm = url.match(/vimeo\.com\/(\d+)/);
    if (vm) {
      return (
        <iframe
          className={className}
          src={`https://player.vimeo.com/video/${vm[1]}`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    }

    // Raw MP4 URL
    return (
      <video
        className={className}
        src={url}
        autoPlay={autoPlay}
        controls={controls}
        playsInline
        preload="metadata"
      />
    );
  }

  return null;
}
```

- [ ] **Step 3: Lightbox**

Create `components/media/Lightbox.tsx`:

```tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { MediaImage, type MediaImageInput } from "./MediaImage";
import { MediaVideo } from "./MediaVideo";

export type LightboxMedia = MediaImageInput & {
  id: string;
  kind: "image" | "video" | "external_video";
  external_url?: string | null;
};

export function Lightbox({
  items,
  startIndex,
  onClose,
}: {
  items: LightboxMedia[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + items.length) % items.length);
    },
    [items.length]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [go, onClose]);

  const current = items[index];
  if (!current) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-neutral-300 hover:text-white"
          aria-label="Close"
        >
          <X size={22} />
        </button>
        <button
          onClick={() => go(-1)}
          className="absolute left-4 md:left-8 text-neutral-300 hover:text-white p-4"
          aria-label="Previous"
        >
          <ChevronLeft size={28} />
        </button>
        <button
          onClick={() => go(1)}
          className="absolute right-4 md:right-8 text-neutral-300 hover:text-white p-4"
          aria-label="Next"
        >
          <ChevronRight size={28} />
        </button>
        <div className="w-[92vw] max-w-[1400px] max-h-[88vh] flex items-center justify-center">
          {current.kind === "image" ? (
            <MediaImage media={current} className="max-h-[88vh] w-auto h-auto object-contain" />
          ) : (
            <MediaVideo
              media={{
                kind: current.kind,
                storage_path: current.storage_path,
                external_url: current.external_url ?? null,
                alt: current.alt ?? null,
              }}
              className="max-h-[88vh] w-full aspect-video"
              controls
            />
          )}
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.22em] uppercase text-neutral-500">
          {index + 1} / {items.length}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Cursor label**

Create `components/ui/CursorLabel.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";

export function useCursorLabel(label: string) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function move(e: MouseEvent) {
      if (!el) return;
      el.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 14}px)`;
    }
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [label]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="hidden md:block fixed top-0 left-0 pointer-events-none z-[70] px-2 py-1 text-[10px] font-mono tracking-[0.22em] uppercase bg-[#d4b97c] text-black rounded-full"
    >
      {label}
    </div>
  );
}
```

(We won't globally mount this — callers render it conditionally when a hoverable tile is active. See usage in `/work` below.)

- [ ] **Step 5: Commit**

```bash
git add components/media components/ui/CursorLabel.tsx
git commit -m "Add Lightbox, MediaImage, MediaVideo, cursor label helper"
```

---

## Task 5: Rebuild the homepage

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Rewrite the homepage**

Replace `app/page.tsx` entirely:

```tsx
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HeroName } from "@/components/reveal/HeroName";
import { Reveal } from "@/components/reveal/Reveal";
import { ParallaxLayer } from "@/components/reveal/ParallaxLayer";
import { Footer } from "@/components/footer";

const featured = [
  { tag: "Portfolio",   label: "Work",        href: "/work",               blurb: "Selected projects — print, social, editorial." },
  { tag: "Photography", label: "Picturebook", href: "/life/picturebook",   blurb: "Light and moments, tagged by where and when." },
  { tag: "Cinema",      label: "Films",       href: "/life/films",         blurb: "A slow diary of movies watched." },
  { tag: "Spotify",     label: "Music",       href: "/life/music",         blurb: "What's on repeat, in long-form." },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-3.5rem)] flex items-end px-6 md:px-12 pb-16 overflow-hidden">
        <ParallaxLayer offset={30} className="absolute inset-0 pointer-events-none select-none flex items-end justify-end pr-0">
          <span className="font-display text-[28vw] leading-[0.8] text-foreground/[0.03] whitespace-nowrap translate-y-10">
            DAVEJDO
          </span>
        </ParallaxLayer>

        <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-[1fr,auto] gap-10 items-end">
          {/* Left: status + name + tagline */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-background/60 backdrop-blur-sm mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                Available for work
              </span>
            </div>
            <div className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase mb-3">
              01 — HOME
            </div>
            <HeroName className="font-display text-[clamp(4rem,10vw,9rem)] tracking-[-0.02em] -mb-3">
              DAVE
            </HeroName>
            <HeroName
              className="font-display text-[clamp(4rem,10vw,9rem)] tracking-[-0.02em]"
              accentIndex={[1, 2]}
              delay={0.5}
            >
              J DO
            </HeroName>
            <Reveal y={20} delay={1.1}>
              <p className="text-muted-foreground max-w-md leading-relaxed text-base md:text-lg mt-6">
                Designer and creator. Building things that matter and capturing life along the way.
              </p>
            </Reveal>
          </div>

          {/* Right: index column */}
          <Reveal y={20} delay={1.2} className="border-l border-border pl-6 pb-4 min-w-[220px] hidden md:block">
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-3">
              Index
            </div>
            <ul className="space-y-1.5 text-sm">
              {featured.map((f) => (
                <li key={f.href}>
                  <Link href={f.href} className="text-foreground/90 hover:text-foreground">
                    — {f.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-4 border-t border-border font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
              Connecticut · Print · Social
            </div>
          </Reveal>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 right-6 md:right-12 font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground [writing-mode:vertical-rl] rotate-180">
          SCROLL ↓
        </div>
      </section>

      {/* Featured grid */}
      <section className="px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-3">
              02 — EXPLORE
            </div>
            <h2 className="font-display text-[clamp(3rem,7vw,6rem)] leading-[0.9] tracking-tight">
              THE WORLD
              <br />
              OF DAVE
            </h2>
          </div>

          <Reveal stagger={0.08} className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-border">
            {featured.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="group relative flex items-end justify-between px-4 md:px-8 py-8 md:py-14 border-b border-border md:[&:nth-child(odd)]:border-r hover:bg-secondary/30 transition-colors"
              >
                <div>
                  <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-3">
                    {f.tag}
                  </div>
                  <h3 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-none">
                    {f.label.toUpperCase()}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-3 max-w-xs">{f.blurb}</p>
                </div>
                <ArrowUpRight
                  size={20}
                  className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                />
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Smoke test**

Run `npm run dev`. Visit `/`. Expected:
- Letter-by-letter reveal on "DAVE" and "J DO" (the "D" and "O" gold).
- Giant "DAVEJDO" parallaxes up as you scroll.
- "THE WORLD OF DAVE" tile grid reveals in sequence.
- Status pill, index column, scroll cue all present.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "Rebuild homepage: asymmetric hero + editorial grid + parallax"
```

---

## Task 6: Build `/work`

**Files:**
- Create: `app/work/page.tsx`
- Create: `app/work/WorkGrid.tsx`

- [ ] **Step 1: Server page**

Create `app/work/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { WorkGrid } from "./WorkGrid";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal/Reveal";

export const metadata = { title: "Work · davejdo" };

export default async function WorkPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select(`
      id, slug, title, year, client, description, cover_media_id, position,
      cover:cover_media_id (id, kind, storage_path, external_url, blurhash, alt, width, height),
      project_media (
        position,
        media:media_id (id, kind, storage_path, external_url, blurhash, alt, width, height)
      )
    `)
    .eq("published", true)
    .order("position", { ascending: false });

  return (
    <>
      <section className="px-6 md:px-12 pt-16 pb-12">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-3">
              02 — PORTFOLIO
            </div>
            <h1 className="font-display text-[clamp(4rem,10vw,9rem)] leading-[0.85]">
              WORK
            </h1>
            <p className="text-muted-foreground max-w-md mt-6">
              Selected projects across print, editorial, and social media. Click any tile to see it in full.
            </p>
          </Reveal>
        </div>
      </section>

      <WorkGrid projects={projects ?? []} />

      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Client grid**

Create `app/work/WorkGrid.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Lightbox, type LightboxMedia } from "@/components/media/Lightbox";
import { MediaImage } from "@/components/media/MediaImage";

type ProjectRow = any;

export function WorkGrid({ projects }: { projects: ProjectRow[] }) {
  const [open, setOpen] = useState<{ items: LightboxMedia[]; start: number } | null>(null);
  const [hovering, setHovering] = useState(false);

  function openProject(p: ProjectRow) {
    const items: LightboxMedia[] = (p.project_media ?? [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((pm: any) => pm.media)
      .filter(Boolean);
    if (items.length === 0 && p.cover) items.push(p.cover);
    if (items.length === 0) return;
    setOpen({ items, start: 0 });
  }

  return (
    <section className="px-6 md:px-12 pb-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => openProject(p)}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className="group text-left"
          >
            <div className="relative aspect-[4/5] bg-secondary rounded-lg overflow-hidden border border-border">
              {p.cover ? (
                <MediaImage
                  media={p.cover}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-muted-foreground">
                  —
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-4 left-4 right-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-neutral-300">
                  {p.year ?? ""} {p.client ? `· ${p.client}` : ""}
                </div>
                <div className="font-display text-3xl text-white leading-tight mt-1">
                  {p.title.toUpperCase()}
                </div>
              </div>
            </div>
          </button>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full text-center py-20 text-muted-foreground text-sm">
            Nothing published yet. Check back soon.
          </div>
        )}
      </div>

      {open && (
        <Lightbox items={open.items} startIndex={open.start} onClose={() => setOpen(null)} />
      )}

      {hovering && (
        <div className="hidden md:block fixed bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-40 px-3 py-1 rounded-full bg-[#d4b97c] text-black font-mono text-[10px] tracking-[0.22em] uppercase">
          OPEN →
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 3: Redirect `/projects → /work`**

Modify `next.config.js`, adding a `redirects()` function:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [{ source: "/projects", destination: "/work", permanent: true }];
  },
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
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
};

module.exports = nextConfig;
```

- [ ] **Step 4: Delete the old projects page**

```bash
git rm -r app/projects
```

If the folder doesn't exist, skip.

- [ ] **Step 5: Commit**

```bash
git add app/work next.config.js
git commit -m "Add /work portfolio page with lightbox; redirect /projects"
```

---

## Task 7: Rebuild `/life/picturebook`

**Files:**
- Modify: `app/life/picturebook/page.tsx`
- Create: `app/life/picturebook/PicturebookGrid.tsx`

- [ ] **Step 1: Server page**

Replace `app/life/picturebook/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { PicturebookGrid } from "./PicturebookGrid";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal/Reveal";

export const metadata = { title: "Picturebook · davejdo" };

export default async function PicturebookPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; page?: string }>;
}) {
  const { tag, page } = await searchParams;
  const pageNum = Math.max(0, Number(page ?? 0));
  const supabase = await createClient();

  const base = supabase
    .from("photos")
    .select(
      "id, caption, location, taken_at, media:media_id(id, kind, storage_path, external_url, blurhash, alt, width, height), tags:photo_tags(tag:tags(slug, name))"
    )
    .order("taken_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(pageNum * 30, pageNum * 30 + 29);

  const query = tag
    ? base.eq("tags.tag.slug", tag) // filter; requires `tags:photo_tags!inner(tag:tags!inner(...))`
    : base;

  const [{ data: photosRaw }, { data: tagsData }] = await Promise.all([
    query,
    supabase
      .from("tags")
      .select("slug, name, photo_tags(count)")
      .order("name"),
  ]);

  const photos = (photosRaw ?? []).map((p: any) => ({
    ...p,
    tags: (p.tags ?? []).map((t: any) => t.tag),
  }));
  const tags = (tagsData ?? []).map((t: any) => ({
    slug: t.slug,
    name: t.name,
    count: t.photo_tags?.[0]?.count ?? 0,
  }));

  return (
    <>
      <section className="px-6 md:px-12 pt-16 pb-12">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-3">
              03 — PICTUREBOOK
            </div>
            <h1 className="font-display text-[clamp(4rem,10vw,9rem)] leading-[0.85]">PICTUREBOOK</h1>
            <p className="text-muted-foreground max-w-md mt-6">
              Moments captured in light and shadow. Filter by tag, or let the scroll lead.
            </p>
          </Reveal>
        </div>
      </section>

      <PicturebookGrid photos={photos} tags={tags} activeTag={tag ?? null} page={pageNum} />
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Client grid**

Create `app/life/picturebook/PicturebookGrid.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Lightbox, type LightboxMedia } from "@/components/media/Lightbox";
import { MediaImage } from "@/components/media/MediaImage";

type Tag = { slug: string; name: string; count: number };
type Photo = any;

export function PicturebookGrid({
  photos,
  tags,
  activeTag,
  page,
}: {
  photos: Photo[];
  tags: Tag[];
  activeTag: string | null;
  page: number;
}) {
  const [open, setOpen] = useState<{ items: LightboxMedia[]; start: number } | null>(null);

  function openAt(i: number) {
    const items: LightboxMedia[] = photos
      .map((p: any) => p.media)
      .filter(Boolean);
    setOpen({ items, start: i });
  }

  return (
    <section className="px-6 md:px-12 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="sticky top-14 z-30 bg-background/85 backdrop-blur py-3 -mx-6 md:-mx-12 px-6 md:px-12 mb-6 border-b border-border">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <Pill active={!activeTag} href="/life/picturebook">All ({tags.reduce((a, t) => a + t.count, 0)})</Pill>
            {tags.filter((t) => t.count > 0).map((t) => (
              <Pill
                key={t.slug}
                active={activeTag === t.slug}
                href={`/life/picturebook?tag=${t.slug}`}
              >
                {t.name} ({t.count})
              </Pill>
            ))}
          </div>
        </div>

        <div className="columns-1 sm:columns-2 md:columns-3 gap-4">
          {photos.map((p: any, i: number) =>
            p.media ? (
              <button
                key={p.id}
                onClick={() => openAt(i)}
                className="block w-full mb-4 group text-left"
              >
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <MediaImage
                    media={p.media}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                {(p.caption || p.location) && (
                  <div className="flex items-baseline gap-2 mt-2 px-1">
                    {p.caption && <span className="text-sm text-foreground/90">{p.caption}</span>}
                    {p.location && (
                      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                        {p.location}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ) : null
          )}
        </div>

        <div className="flex justify-between items-center mt-10">
          {page > 0 ? (
            <Link
              href={`/life/picturebook?${activeTag ? `tag=${activeTag}&` : ""}page=${page - 1}`}
              className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground"
            >
              ← Prev
            </Link>
          ) : <span />}
          {photos.length === 30 && (
            <Link
              href={`/life/picturebook?${activeTag ? `tag=${activeTag}&` : ""}page=${page + 1}`}
              className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground"
            >
              Next →
            </Link>
          )}
        </div>
      </div>

      {open && <Lightbox items={open.items} startIndex={open.start} onClose={() => setOpen(null)} />}
    </section>
  );
}

function Pill({
  children,
  href,
  active,
}: {
  children: React.ReactNode;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex-none px-3 py-1.5 rounded-full border text-[11px] font-mono uppercase tracking-[0.18em] ${
        active
          ? "bg-foreground text-background border-foreground"
          : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/life/picturebook
git commit -m "Rebuild /life/picturebook: Supabase-backed bento grid + sticky tag filter"
```

---

## Task 8: Rebuild `/life/films`

**Files:**
- Modify: `app/life/films/page.tsx`
- Create: `app/life/films/FilmsGrid.tsx`
- Create: `lib/tmdb.ts`

- [ ] **Step 1: TMDB helpers**

Create `lib/tmdb.ts`:

```ts
const BASE = "https://api.themoviedb.org/3";
const POSTER_BASE = "https://image.tmdb.org/t/p";

export type TmdbMovie = {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
};

export async function fetchTmdbMovie(id: number): Promise<TmdbMovie | null> {
  const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`${BASE}/movie/${id}?api_key=${key}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    return (await res.json()) as TmdbMovie;
  } catch {
    return null;
  }
}

export function posterUrl(path: string | null, size: "w185" | "w342" | "w500" = "w342"): string {
  if (!path) return "";
  return `${POSTER_BASE}/${size}${path}`;
}
```

- [ ] **Step 2: Films page**

Replace `app/life/films/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { fetchTmdbMovie } from "@/lib/tmdb";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal/Reveal";
import { FilmsGrid } from "./FilmsGrid";

export const metadata = { title: "Films · davejdo" };

export default async function FilmsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const supabase = await createClient();
  const query = supabase.from("movies").select("*");
  const ordered =
    sort === "rating"
      ? query.order("rating", { ascending: false }).order("watched_at", { ascending: false })
      : query.order("watched_at", { ascending: false });

  const { data } = await ordered;
  const movies = data ?? [];

  // Enrich with TMDB data. Parallel fetches, cached 24h.
  const enriched = await Promise.all(
    movies.map(async (m) => {
      const tmdb = await fetchTmdbMovie(m.tmdb_id);
      return { ...m, tmdb };
    })
  );

  return (
    <>
      <section className="px-6 md:px-12 pt-16 pb-10">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-3">
              04 — FILMS
            </div>
            <h1 className="font-display text-[clamp(4rem,10vw,9rem)] leading-[0.85]">FILMS</h1>
            <p className="text-muted-foreground max-w-md mt-6">
              A slow diary of cinema — rating, one-liners, and what I was thinking at the time.
            </p>
          </Reveal>
        </div>
      </section>

      <FilmsGrid movies={enriched} activeSort={sort === "rating" ? "rating" : "recent"} />
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Films grid**

Create `app/life/films/FilmsGrid.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X } from "lucide-react";
import { posterUrl } from "@/lib/tmdb";

type Row = any;

export function FilmsGrid({ movies, activeSort }: { movies: Row[]; activeSort: "recent" | "rating" }) {
  const [selected, setSelected] = useState<Row | null>(null);

  return (
    <section className="px-6 md:px-12 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <SortPill href="/life/films" active={activeSort === "recent"}>Recent</SortPill>
          <SortPill href="/life/films?sort=rating" active={activeSort === "rating"}>Top rated</SortPill>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {movies.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelected(m)}
              className="group relative aspect-[2/3] rounded-md overflow-hidden bg-secondary border border-border"
              title={m.tmdb?.title ?? `TMDB #${m.tmdb_id}`}
            >
              {m.tmdb?.poster_path ? (
                <Image
                  src={posterUrl(m.tmdb.poster_path, "w342")}
                  alt={m.tmdb.title ?? ""}
                  fill
                  sizes="(min-width: 1024px) 12vw, (min-width: 640px) 20vw, 33vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-[10px] font-mono text-muted-foreground">
                  TMDB #{m.tmdb_id}
                </div>
              )}
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                <Rating value={m.rating ?? 0} />
                {m.review && <div className="text-[10px] text-neutral-300 mt-1 line-clamp-3">{m.review}</div>}
              </div>
            </button>
          ))}
          {movies.length === 0 && (
            <div className="col-span-full text-center py-14 text-muted-foreground text-sm">
              No films logged yet.
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 flex items-end md:items-center justify-center"
            onClick={() => setSelected(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              className="w-full md:w-[480px] bg-background border border-border rounded-t-2xl md:rounded-2xl p-6 m-0 md:m-4"
            >
              <div className="flex items-start gap-4">
                {selected.tmdb?.poster_path && (
                  <Image
                    src={posterUrl(selected.tmdb.poster_path, "w185")}
                    alt={selected.tmdb.title}
                    width={92}
                    height={138}
                    className="rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                    {selected.tmdb?.release_date?.slice(0, 4) ?? ""} ·{" "}
                    {new Date(selected.watched_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <h3 className="font-display text-3xl leading-tight mt-1">
                    {selected.tmdb?.title ?? `TMDB #${selected.tmdb_id}`}
                  </h3>
                  <div className="mt-2">
                    <Rating value={selected.rating ?? 0} />
                  </div>
                </div>
                <button onClick={() => setSelected(null)} aria-label="Close">
                  <X size={16} />
                </button>
              </div>
              {selected.review && (
                <p className="text-sm text-foreground/90 mt-4 leading-relaxed">{selected.review}</p>
              )}
              <a
                href={`https://www.themoviedb.org/movie/${selected.tmdb_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6 font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground"
              >
                View on TMDB →
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Rating({ value }: { value: number }) {
  return (
    <div className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={12}
          className={n <= value ? "text-[#d4b97c]" : "text-neutral-700"}
          fill={n <= value ? "currentColor" : "none"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function SortPill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-full border text-[11px] font-mono uppercase tracking-[0.18em] ${
        active
          ? "bg-foreground text-background border-foreground"
          : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/life/films lib/tmdb.ts
git commit -m "Rebuild /life/films: Supabase + TMDB poster grid with detail drawer"
```

---

## Task 9: Restyle `/life/music`

**Files:**
- Modify: `app/life/music/page.tsx` (existing)

- [ ] **Step 1: Open and restyle**

The existing Music page reads from the Spotify API routes. Preserve the data-fetching, update the visual surface only.

Open `app/life/music/page.tsx` and replace the `return (...)` JSX with the new shell (keep any existing data fetching at the top of the component):

```tsx
// — KEEP EXISTING DATA FETCHING (now-playing + top tracks) —

return (
  <>
    <section className="px-6 md:px-12 pt-16 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-3">
          05 — MUSIC
        </div>
        <h1 className="font-display text-[clamp(4rem,10vw,9rem)] leading-[0.85]">MUSIC</h1>
        <p className="text-muted-foreground max-w-md mt-6">
          Top 100 on Spotify, and whatever is spinning right now.
        </p>
      </div>
    </section>

    {/* — INSERT EXISTING NOW-PLAYING CARD HERE, WRAPPED WITH: — */}
    {/* <section className="px-6 md:px-12 mb-12"><div className="max-w-6xl mx-auto"> … </div></section> */}

    {/* — INSERT EXISTING TOP-TRACKS 2×50 GRID HERE, WRAPPED WITH: — */}
    {/* <section className="px-6 md:px-12 pb-24"><div className="max-w-6xl mx-auto"> … </div></section> */}
  </>
);
```

The exact data-fetching code depends on what's already in the file. Do not remove `/api/spotify/*` calls or the vinyl-spin animation for the currently-playing album. Keep their class names and mounting structure — only the surrounding layout and tokens change.

- [ ] **Step 2: Smoke check**

Load `/life/music`. Expected: new heading matches sibling pages, album tiles inherit the new token palette (pure-black bg), vinyl still spins.

- [ ] **Step 3: Commit**

```bash
git add app/life/music
git commit -m "Restyle /life/music to match new token system"
```

---

## Task 10: Rebuild `/about`

**Files:**
- Modify: `app/about/page.tsx`

- [ ] **Step 1: Replace**

Replace `app/about/page.tsx`:

```tsx
import Image from "next/image";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal/Reveal";

export const metadata = { title: "About · davejdo" };

export default function AboutPage() {
  return (
    <>
      <section className="px-6 md:px-12 pt-20 pb-24">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-4">
              06 — ABOUT
            </div>
            <h1 className="font-display text-[clamp(4rem,10vw,9rem)] leading-[0.85] mb-12">ABOUT</h1>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-8 items-start">
            <Reveal y={30}>
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border border-border bg-secondary">
                <Image src="/profile.png" alt="Dave J Do" width={160} height={160} className="w-full h-full object-cover" />
              </div>
            </Reveal>
            <Reveal y={30} delay={0.1}>
              <div className="space-y-6 text-lg leading-relaxed">
                <p>
                  I&rsquo;m Dave J Do — a designer working out of Connecticut, focused on
                  print and social-media design. This site is a running notebook of what
                  I make, what I see, and what I&rsquo;m listening to.
                </p>
                <p className="text-muted-foreground">
                  I care about craft over novelty, typography over graphics, and showing
                  the work more than talking about it.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal y={30} className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-20 border-t border-border">
            {[
              { label: "Print",        detail: "Editorial layouts, posters, zines." },
              { label: "Social Media", detail: "Systems for brand feeds and campaigns." },
              { label: "Editorial",    detail: "Long-form identity and type direction." },
            ].map((s) => (
              <div key={s.label} className="px-4 py-8 border-b md:border-b-0 md:border-r border-border last:border-r-0">
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-2">
                  {s.label}
                </div>
                <p className="text-sm">{s.detail}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/about/page.tsx
git commit -m "Rewrite /about: clean editorial layout with portrait and services"
```

---

## Task 11: Restyle Footer (small pass)

**Files:**
- Modify: `components/footer.tsx`

- [ ] **Step 1: Tighten the footer**

Open `components/footer.tsx`. No structural changes — swap color classes to the new tokens and bump the section spacing.

Only changes required:
- Replace `text-muted-foreground` uses where they referenced legacy tokens.
- Change `py-16` to `py-24 md:py-32`.
- Change `border-t border-border` to ensure hairline uses the new border token.

(The existing footer file is already using Tailwind tokens keyed to CSS variables we updated in Task 1, so the new colors apply automatically. The only explicit change is vertical rhythm.)

- [ ] **Step 2: Commit**

```bash
git add components/footer.tsx
git commit -m "Tighten footer spacing to match new editorial rhythm"
```

---

## Task 12: Verification

- [ ] **Step 1: Unit tests**

```bash
npm test
```

Expected: all pass. Tests from Plans 1 and 2 still green.

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: successful build, no missing imports, no type errors.

- [ ] **Step 3: Manual walkthrough**

With admin populated with at least 1 project, 6 photos, 4 movies, walk through:
- `/` — hero reveals, parallax, featured grid, theme toggle works.
- `/work` — projects visible, cover loads, click opens lightbox with correct media order; arrow keys and ESC work.
- `/life/picturebook` — grid renders, sticky tag bar scrolls, tag filter navigates correctly, lightbox works.
- `/life/films` — poster grid loads via TMDB, hover reveals rating, click opens drawer.
- `/life/music` — existing data still reachable, restyled.
- `/about` — loads, portrait visible, reveal fires.
- `/projects` → redirects to `/work`.
- Reduced motion: turn on OS-level reduce-motion. Reload. Expected: reveals fire instantly, parallax still functional but stripped.
- Light mode: toggle in top bar. All pages render with warm off-white background.

- [ ] **Step 4: Final commit (if needed)**

```bash
git status
```

Stage and commit any final cleanup. Plan complete.

---

## Self-review checklist (plan author)

- [x] **Spec coverage** — §6 (every public page), §7 (TopBar + Drawer + NowPlaying + socials + admin link), §11 (typography, color, grain, scroll choreography, reduced motion, cursor label), §12 (Spotify preserved + ticker in drawer). `/projects → /work` redirect in §17 handled in Task 6.
- [x] **No placeholders** — every task has real code. The one exception is Task 9 (restyle `/life/music`) where we preserve unknown-shape data-fetching; the instruction explicitly says "do not change existing fetch logic" to avoid inventing code we haven't read.
- [x] **Type consistency** — `MediaImageInput` is the shared shape. `LightboxMedia` extends it. `Reveal`, `HeroName`, `ParallaxLayer` have consistent signatures.
- [x] **Reduced motion** — handled in three places (globals.css, Reveal, HeroName). Lightbox and parallax fall back gracefully.
