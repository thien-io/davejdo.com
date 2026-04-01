"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { Star, X, Calendar, Clock, Film } from "lucide-react";
import { Footer } from "@/components/footer";

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────────────
// TMDB API KEY — replace with your key in .env.local:
// NEXT_PUBLIC_TMDB_API_KEY=your_key_here
// ─────────────────────────────────────────────────────
const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "";
const TMDB_IMG = "https://image.tmdb.org/t/p/";

// 50 curated top films (TMDB IDs)
const FILM_IDS = [
  278,    // Shawshank Redemption
  238,    // The Godfather
  240,    // The Godfather Part II
  424,    // Schindler's List
  389,    // 12 Angry Men
  129,    // Spirited Away
  19404,  // Dilwale
  372058, // Your Name
  637,    // Life Is Beautiful
  13,     // Forrest Gump
  769,    // GoodFellas
  680,    // Pulp Fiction
  550,    // Fight Club
  11216,  // Cinema Paradiso
  155,    // The Dark Knight
  12477,  // Grave of the Fireflies
  429,    // The Good, the Bad and the Ugly
  497,    // Schindler's List
  244786, // Whiplash
  761053, // Gabriel's Inferno
  77338,  // The Intouchables
  346364, // It Chapter One
  120,    // Lord of the Rings: Fellowship
  122,    // Lord of the Rings: Return
  121,    // Lord of the Rings: Two Towers
  289,    // Casablanca
  598,    // City of God
  1422,   // Departed
  745,    // Requiem for a Dream
  510,    // One Flew Over Cuckoo
  274,    // The Silence of the Lambs
  4935,   // Howl's Moving Castle
  14160,  // Up
  10681,  // WALL·E
  12,     // Finding Nemo
  9806,   // The Incredibles
  585,    // Monsters Inc
  862,    // Toy Story
  863,    // Toy Story 2
  10193,  // Toy Story 3
  105,    // Back to the Future
  601,    // The Matrix
  278,    // Shawshank (dup fallback)
  475557, // Joker
  2062,   // Ratatouille
  8392,   // My Neighbor Totoro
  16869,  // Inglourious Basterds
  207,    // No Country for Old Men
  68718,  // Django Unchained
  49026,  // The Dark Knight Rises
];

type TMDBMovie = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
  runtime?: number;
  genres?: { id: number; name: string }[];
};

export default function FilmsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TMDBMovie | null>(null);
  const [filter, setFilter] = useState("All");

  const fetchMovies = useCallback(async () => {
    if (!TMDB_KEY) {
      // Demo mode: generate placeholder data
      const demoMovies: TMDBMovie[] = FILM_IDS.slice(0, 50).map((id, i) => ({
        id,
        title: `Film ${String(i + 1).padStart(2, "0")}`,
        poster_path: null,
        release_date: `${2000 + (i % 24)}-01-01`,
        vote_average: 7 + Math.random() * 2.5,
        overview: "Add your TMDB API key (NEXT_PUBLIC_TMDB_API_KEY) to load real movie data.",
      }));
      setMovies(demoMovies);
      setLoading(false);
      return;
    }

    try {
      const unique = [...new Set(FILM_IDS)].slice(0, 50);
      const results = await Promise.allSettled(
        unique.map((id) =>
          fetch(
            `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}`
          ).then((r) => r.json())
        )
      );
      const films = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r as PromiseFulfilledResult<TMDBMovie>).value)
        .filter((m) => m && m.id);
      setMovies(films);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  useEffect(() => {
    if (loading || !containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".film-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 20, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.4, ease: "power2.out",
            scrollTrigger: { trigger: card, start: "top 92%" },
            delay: (i % 5) * 0.05,
          }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  const genres = ["All", "Drama", "Action", "Sci-Fi", "Animation", "Crime"];

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
            Life / Cinema
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-7xl md:text-9xl leading-none mb-6"
          >
            FILMS
          </motion.h1>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground"
            >
              {movies.length} films in the diary.
            </motion.p>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => setFilter(g)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-200 ${
                    filter === g
                      ? "bg-foreground text-background"
                      : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 px-4 md:px-10">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] rounded-lg shimmer-bg"
                  style={{ animationDelay: `${i * 0.02}s` }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
              {movies.map((movie, i) => (
                <motion.div
                  key={`${movie.id}-${i}`}
                  className="film-card group relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer bg-accent"
                  onClick={() => setSelected(movie)}
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {movie.poster_path ? (
                    <Image
                      src={`${TMDB_IMG}w342${movie.poster_path}`}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 33vw, 12vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                      <Film size={20} className="text-muted-foreground mb-2" />
                      <p className="text-[9px] text-center text-muted-foreground font-mono leading-tight">
                        {movie.title}
                      </p>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
                    <p className="text-white text-[10px] font-medium leading-tight truncate">
                      {movie.title}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={8} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-[9px] text-white/70 font-mono">
                        {movie.vote_average.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!TMDB_KEY && !loading && (
            <div className="mt-8 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 text-center">
              <p className="text-sm text-yellow-400 font-mono">
                Add <code className="bg-yellow-500/20 px-1 rounded">NEXT_PUBLIC_TMDB_API_KEY</code> to .env.local for real movie posters
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Film detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-card border border-border rounded-2xl overflow-hidden max-w-2xl w-full flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Poster */}
              <div className="relative w-full md:w-48 aspect-[2/3] md:aspect-auto flex-shrink-0">
                {selected.poster_path ? (
                  <Image
                    src={`${TMDB_IMG}w342${selected.poster_path}`}
                    alt={selected.title}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                ) : (
                  <div className="w-full h-48 md:h-full bg-accent flex items-center justify-center">
                    <Film size={40} className="text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 p-6">
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-accent transition-colors"
                >
                  <X size={14} />
                </button>

                <div className="flex items-center gap-2 mb-3">
                  <Star size={13} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-mono font-medium text-yellow-400">
                    {selected.vote_average.toFixed(1)}
                  </span>
                </div>

                <h2 className="font-display text-4xl mb-3 leading-tight">
                  {selected.title.toUpperCase()}
                </h2>

                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar size={12} />
                    {selected.release_date?.slice(0, 4)}
                  </div>
                  {selected.runtime && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock size={12} />
                      {selected.runtime}m
                    </div>
                  )}
                </div>

                {selected.genres && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selected.genres.map((g) => (
                      <span key={g.id} className="text-xs px-2 py-0.5 rounded-full bg-accent text-muted-foreground font-mono">
                        {g.name}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-5">
                  {selected.overview}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
