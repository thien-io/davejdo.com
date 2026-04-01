# davejdo.com

Personal website built with Next.js 14, Tailwind CSS, TypeScript, Framer Motion, and GSAP.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + CSS Variables
- **Components**: shadcn/ui + Radix UI
- **Animation**: Framer Motion + GSAP (ScrollTrigger)
- **Theme**: Dark/Light via next-themes
- **APIs**: Spotify Web API, TMDB API

## Color Palette

| Token | Hex | Use |
|-------|-----|-----|
| White | `#ffffff` | Light mode bg / Dark mode text |
| Dark | `#23272a` | Dark mode bg |
| Darker | `#2c2f33` | Dark mode cards |
| Muted | `#99aab5` | Secondary text / accents |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your keys:

```bash
cp .env.local.example .env.local
```

#### Spotify Setup
1. Go to [developer.spotify.com](https://developer.spotify.com/dashboard) → Create an App
2. Set Redirect URI to `http://localhost:3000/callback`
3. Authorize to get an auth code:
   ```
   https://accounts.spotify.com/authorize?client_id=YOUR_ID&response_type=code&redirect_uri=http://localhost:3000/callback&scope=user-read-currently-playing%20user-top-read
   ```
4. Exchange the code for a refresh token:
   ```bash
   curl -X POST https://accounts.spotify.com/api/token \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=authorization_code&code=YOUR_CODE&redirect_uri=http://localhost:3000/callback" \
     -u "YOUR_CLIENT_ID:YOUR_CLIENT_SECRET"
   ```
5. Copy `refresh_token` to `.env.local`

#### TMDB Setup
1. Create account at [themoviedb.org](https://www.themoviedb.org)
2. Go to Settings → API → Request API Key
3. Copy the key to `NEXT_PUBLIC_TMDB_API_KEY`

### 3. Add your photos (Picturebook)

In `app/life/picturebook/page.tsx`, update the `photos` array with your Google Drive links:

```ts
// Format for Google Drive images:
// https://lh3.googleusercontent.com/d/<FILE_ID>
// Or: https://drive.google.com/uc?export=view&id=<FILE_ID>

const photos = [
  {
    id: 1,
    src: "https://lh3.googleusercontent.com/d/YOUR_FILE_ID",
    alt: "Caption",
    caption: "Golden hour",
    location: "Somewhere nice",
    size: "large", // large | tall | wide | small
  },
  // ...
];
```

Make sure to set sharing to "Anyone with the link" for each photo.

Also add `lh3.googleusercontent.com` and `drive.google.com` to `next.config.js` image domains (already included).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
davejdo/
├── app/
│   ├── page.tsx                # Home
│   ├── about/page.tsx          # About
│   ├── projects/page.tsx       # Projects
│   ├── life/
│   │   ├── picturebook/        # Photo bento grid
│   │   ├── films/              # Letterboxd-style TMDB
│   │   └── music/              # Spotify top tracks
│   ├── api/
│   │   └── spotify/
│   │       ├── now-playing/    # Current track endpoint
│   │       └── top-tracks/     # Top 100 tracks (2x50)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── sidebar.tsx             # Nav sidebar
│   ├── footer.tsx              # Contacts footer
│   ├── cursor-glow.tsx         # Mouse glow effect
│   ├── theme-provider.tsx
│   └── ui/                     # shadcn components
├── hooks/
│   └── use-parallax.ts         # GSAP parallax hooks
└── lib/
    └── utils.ts
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Hero landing with featured sections |
| `/about` | Bio, skills, timeline |
| `/projects` | Featured + all projects grid |
| `/life/picturebook` | Bento photo grid with lightbox |
| `/life/films` | TMDB movie posters, Letterboxd style |
| `/life/music` | Spotify top 100 albums + Now Playing |

## Deployment

```bash
npm run build
```

Deploy to Vercel — add all environment variables in the Vercel dashboard under Project Settings → Environment Variables.

```bash
vercel --prod
```
