"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { Play, Pause, Music, ExternalLink, RefreshCw, Volume2 } from "lucide-react";
import { Footer } from "@/components/footer";

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────────────────────
// SPOTIFY SETUP
// 1. Create a Spotify App at developer.spotify.com
// 2. Add these to .env.local:
//    NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id
//    SPOTIFY_CLIENT_SECRET=your_secret
//    SPOTIFY_REFRESH_TOKEN=your_refresh_token
// 3. The API routes in /app/api/spotify/ handle token refresh
// ─────────────────────────────────────────────────────────────

type SpotifyTrack = {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string; width: number }[];
    external_urls: { spotify: string };
  };
  external_urls: { spotify: string };
  preview_url: string | null;
  duration_ms: number;
};

type NowPlaying = {
  is_playing: boolean;
  progress_ms: number;
  item: SpotifyTrack;
};

function formatDuration(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// Demo data when no Spotify token is configured
function generateDemoTracks(count: number): SpotifyTrack[] {
  const artists = ["The Weeknd", "Drake", "Kendrick Lamar", "Frank Ocean", "Tyler, the Creator", "J. Cole", "SZA", "Billie Eilish", "Childish Gambino", "Mac Miller"];
  const albums = ["After Hours", "Certified Lover Boy", "DAMN.", "Blonde", "IGOR", "KOD", "SOS", "Happier Than Ever", "Awaken, My Love!", "Swimming"];
  return Array.from({ length: count }, (_, i) => ({
    id: `demo-${i}`,
    name: `Track ${String(i + 1).padStart(2, "0")}`,
    artists: [{ name: artists[i % artists.length] }],
    album: {
      name: albums[i % albums.length],
      images: [{ url: `https://picsum.photos/seed/album${i}/300/300`, width: 300 }],
      external_urls: { spotify: "https://spotify.com" },
    },
    external_urls: { spotify: "https://spotify.com" },
    preview_url: null,
    duration_ms: 180000 + Math.random() * 120000,
  }));
}

// ── NowPlaying Component ──────────────────────────────────────
function NowPlayingCard({ track, isPlaying }: { track: SpotifyTrack | null; isPlaying: boolean }) {
  const albumArt = track?.album.images[0]?.url;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5">
      {/* Blurred background */}
      {albumArt && (
        <div className="absolute inset-0 opacity-10">
          <Image src={albumArt} alt="" fill className="object-cover blur-2xl scale-150" sizes="400px" />
        </div>
      )}

      <div className="relative flex items-center gap-4">
        {/* Album art with vinyl spin */}
        <div className="relative w-16 h-16 flex-shrink-0">
          {albumArt ? (
            <div className={`w-16 h-16 rounded-full overflow-hidden border-2 border-border ${isPlaying ? "vinyl-spinning" : ""}`}>
              <Image src={albumArt} alt={track?.album.name || ""} width={64} height={64} className="object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-accent border-2 border-border flex items-center justify-center">
              <Music size={20} className="text-muted-foreground" />
            </div>
          )}
          {/* Center dot */}
          <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-background border border-border" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {isPlaying ? (
              <div className="flex items-end gap-0.5 h-3">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 bg-green-400 rounded-full"
                    animate={{ height: ["30%", "100%", "60%", "100%", "30%"] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            ) : (
              <Pause size={10} className="text-muted-foreground" />
            )}
            <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
              {isPlaying ? "Now Playing" : "Paused"}
            </span>
          </div>

          <p className="font-medium text-sm truncate">
            {track?.name || "Nothing playing"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {track?.artists.map((a) => a.name).join(", ") || "—"}
          </p>
        </div>

        {track && (
          <a
            href={track.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/30 flex items-center justify-center hover:bg-[#1DB954]/20 transition-colors"
          >
            <ExternalLink size={12} className="text-[#1DB954]" />
          </a>
        )}
      </div>
    </div>
  );
}

// ── TrackCard Component ──────────────────────────────────────
function TrackCard({ track, rank, isActive, onClick }: {
  track: SpotifyTrack; rank: number; isActive: boolean; onClick: () => void;
}) {
  const art = track.album.images[0]?.url;
  return (
    <motion.div
      className={`album-card group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-accent ${isActive ? "ring-2 ring-[#1DB954]" : ""}`}
      onClick={onClick}
      whileHover={{ scale: 1.04, zIndex: 10 }}
      transition={{ duration: 0.15 }}
    >
      {art ? (
        <Image src={art} alt={track.album.name} fill className="object-cover" sizes="(max-width: 768px) 25vw, 10vw" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Music size={18} className="text-muted-foreground" />
        </div>
      )}
      {/* Rank */}
      <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
        <span className="text-[8px] text-white font-mono font-bold">{rank}</span>
      </div>
      {/* Hover */}
      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center flex-col gap-1 p-2">
        <Play size={16} className="text-white fill-white" />
        <p className="text-white text-[9px] text-center font-medium leading-tight line-clamp-2">{track.name}</p>
        <p className="text-white/60 text-[8px] text-center truncate w-full">{track.artists[0]?.name}</p>
      </div>
      {isActive && (
        <div className="absolute bottom-1.5 right-1.5">
          <Volume2 size={10} className="text-[#1DB954]" />
        </div>
      )}
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function MusicPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTrack, setActiveTrack] = useState<SpotifyTrack | null>(null);
  const [useDemo, setUseDemo] = useState(false);

  // Fetch top tracks — fetches in two batches of 50
  const fetchTracks = useCallback(async () => {
    setLoading(true);
    try {
      // Try API route first
      const [r1, r2] = await Promise.all([
        fetch("/api/spotify/top-tracks?offset=0&limit=50"),
        fetch("/api/spotify/top-tracks?offset=50&limit=50"),
      ]);

      if (!r1.ok) throw new Error("API not configured");

      const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
      const all: SpotifyTrack[] = [
        ...(d1.items || []),
        ...(d2.items || []),
      ].slice(0, 100);
      setTracks(all);
    } catch {
      // Fall back to demo
      setUseDemo(true);
      setTracks(generateDemoTracks(100));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNowPlaying = useCallback(async () => {
    if (useDemo) {
      setNowPlaying({
        is_playing: true,
        progress_ms: 60000,
        item: generateDemoTracks(1)[0],
      });
      return;
    }
    try {
      const r = await fetch("/api/spotify/now-playing");
      if (r.ok) {
        const data = await r.json();
        setNowPlaying(data);
      }
    } catch { /* silent */ }
  }, [useDemo]);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  useEffect(() => {
    if (!loading) {
      fetchNowPlaying();
      const interval = setInterval(fetchNowPlaying, 30000);
      return () => clearInterval(interval);
    }
  }, [loading, fetchNowPlaying]);

  useEffect(() => {
    if (loading || !containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".album-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { scale: 0.85, opacity: 0 },
          {
            scale: 1, opacity: 1, duration: 0.35, ease: "power2.out",
            scrollTrigger: { trigger: card, start: "top 94%" },
            delay: (i % 10) * 0.03,
          }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  const first50 = tracks.slice(0, 50);
  const last50 = tracks.slice(50, 100);

  return (
    <div ref={containerRef} className="min-h-screen">
      {/* Header */}
      <section className="py-24 px-6 md:px-16 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-4"
          >
            Life / Music
          </motion.p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-7xl md:text-9xl leading-none"
            >
              MUSIC
            </motion.h1>

            {/* Now Playing Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full md:w-80"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
                  Spotify
                </p>
                <button
                  onClick={fetchNowPlaying}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RefreshCw size={11} />
                </button>
              </div>
              <NowPlayingCard
                track={nowPlaying?.item || null}
                isPlaying={nowPlaying?.is_playing || false}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {useDemo && (
        <div className="mx-6 md:mx-16 mt-6">
          <div className="max-w-7xl mx-auto p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5">
            <p className="text-sm text-yellow-400 font-mono text-center">
              Demo mode — add Spotify API routes to show your actual top tracks
            </p>
          </div>
        </div>
      )}

      {/* Top 50 */}
      <section className="py-12 px-4 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-baseline justify-between mb-6 px-2">
            <h2 className="font-display text-4xl">TOP 50</h2>
            <p className="text-xs font-mono text-muted-foreground">#1 – #50</p>
          </div>
          {loading ? (
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {Array.from({ length: 50 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl shimmer-bg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {first50.map((track, i) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  rank={i + 1}
                  isActive={activeTrack?.id === track.id}
                  onClick={() => setActiveTrack(activeTrack?.id === track.id ? null : track)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top 51–100 */}
      <section className="py-6 px-4 md:px-10 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-baseline justify-between mb-6 px-2">
            <h2 className="font-display text-4xl">NEXT 50</h2>
            <p className="text-xs font-mono text-muted-foreground">#51 – #100</p>
          </div>
          {loading ? (
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {Array.from({ length: 50 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl shimmer-bg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {last50.map((track, i) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  rank={i + 51}
                  isActive={activeTrack?.id === track.id}
                  onClick={() => setActiveTrack(activeTrack?.id === track.id ? null : track)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Track detail drawer */}
      <AnimatePresence>
        {activeTrack && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 md:left-64 right-0 z-40 p-4"
          >
            <div className="max-w-xl mx-auto bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-4 flex items-center gap-4 shadow-2xl">
              {activeTrack.album.images[0] && (
                <Image
                  src={activeTrack.album.images[0].url}
                  alt={activeTrack.album.name}
                  width={48}
                  height={48}
                  className="rounded-lg"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{activeTrack.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {activeTrack.artists.map((a) => a.name).join(", ")} · {activeTrack.album.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={activeTrack.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/30 flex items-center justify-center hover:bg-[#1DB954]/20 transition-colors"
                >
                  <ExternalLink size={12} className="text-[#1DB954]" />
                </a>
                <button
                  onClick={() => setActiveTrack(null)}
                  className="w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:bg-border transition-colors text-muted-foreground"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
