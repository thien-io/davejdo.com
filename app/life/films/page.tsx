"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { ExternalLink, X, Film } from "lucide-react";
import { Footer } from "@/components/footer";

gsap.registerPlugin(ScrollTrigger);

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY ?? "";
const TMDB_IMG = "https://image.tmdb.org/t/p/w342";

// tmdbId: direct movie ID — more reliable than search.
// null = fall back to TMDB title search using `query`.
const favorites = [
  { rank: 1,  title: "Dune: Part Two",                      tmdbId: 693134,  query: "Dune Part Two 2024",              rating: "5/5", review: "Perfect Sci-fi movie." },
  { rank: 2,  title: "La La Land",                          tmdbId: 313369,  query: "La La Land 2016",                 rating: "5/5", review: "Beautiful music, stunning color-grading, heartfelt story." },
  { rank: 3,  title: "Spider-Man: Across the Spider-Verse", tmdbId: 569094,  query: "Spider-Man Across Spider-Verse",  rating: "5/5", review: "Best animated movie of all time. Dying on that hill." },
  { rank: 4,  title: "Interstellar",                        tmdbId: 157336,  query: "Interstellar 2014",               rating: "5/5", review: "Do not go gentle into that good night." },
  { rank: 5,  title: "The Shawshank Redemption",            tmdbId: 278,     query: "Shawshank Redemption",            rating: "5/5", review: "The indomitable human spirit." },
  { rank: 6,  title: "Ip Man",                              tmdbId: 14756,   query: "Ip Man 2008",                    rating: "5/5", review: "HITS every time." },
  { rank: 7,  title: "The Last Ten Years",                  tmdbId: 876797,  query: "The Last 10 Years 2022",         rating: "5/5", review: "Build me up just to break me down." },
  { rank: 8,  title: "18×2 Beyond Youthful Days",           tmdbId: null,    query: "18x2 Beyond Youthful Days 2024", rating: "5/5", review: "I couldn't stop smiling until..." },
  { rank: 9,  title: "Sinners",                             tmdbId: 1233413, query: "Sinners 2025",                   rating: "4/5", review: "Every movie should be shot on film." },
  { rank: 10, title: "Good Will Hunting",                   tmdbId: 489,     query: "Good Will Hunting 1997",         rating: "5/5", review: "Best class assignment watch ever." },
  { rank: 11, title: "Coco",                                tmdbId: 354912,  query: "Coco 2017 Pixar",                rating: "5/5", review: "I teared up in Spanish class. 8th grade." },
  { rank: 12, title: "Project Hail Mary",                   tmdbId: null,    query: "Project Hail Mary",              rating: "5/5", review: "It's just so beautiful. Jaw was touching my lap during Tau Ceti." },
  { rank: 13, title: "Beautiful Boy",                       tmdbId: 451915,  query: "Beautiful Boy 2018",             rating: "5/5", review: "Never doing drugs." },
  { rank: 14, title: "Eyes Wide Shut",                      tmdbId: 345,     query: "Eyes Wide Shut 1999",            rating: "4/5", review: "Gonna keep my thoughts to myself on this one." },
  { rank: 15, title: "Your Name",                           tmdbId: 372058,  query: "Your Name 2016",                 rating: "5/5", review: "Gorgeous visuals and an immersive soundtrack." },
  { rank: 16, title: "Memories of Murder",                  tmdbId: 11423,   query: "Memories of Murder 2003",        rating: "5/5", review: "Thinking about the ending to this day." },
  { rank: 17, title: "Ford v Ferrari",                      tmdbId: 359724,  query: "Ford v Ferrari 2019",            rating: "4/5", review: "Why are racers so cool?" },
  { rank: 18, title: "A Silent Voice",                      tmdbId: 378064,  query: "A Silent Voice 2016",            rating: "5/5", review: "I'm hurting." },
  { rank: 19, title: "A Beautiful Mind",                    tmdbId: 453,     query: "A Beautiful Mind 2001",          rating: "4/5", review: "Should he take his meds?" },
  { rank: 20, title: "The Wind Rises",                      tmdbId: 149870,  query: "The Wind Rises 2013",            rating: "5/5", review: "Studio Ghibli's Oppenheimer." },
  { rank: 21, title: "The Secret World of Arrietty",        tmdbId: 51739,   query: "Secret World of Arrietty 2010",  rating: "5/5", review: "The sound design is perfect." },
  { rank: 22, title: "The Karate Kid",                      tmdbId: 38575,   query: "The Karate Kid 1984",            rating: "4/5", review: "One of my favorites growing up." },
  { rank: 23, title: "20th Century Girl",                   tmdbId: 851644,  query: "20th Century Girl 2022",         rating: "4/5", review: "My gateway to consuming Asian cinema." },
  { rank: 24, title: "Fruitvale Station",                   tmdbId: 157354,  query: "Fruitvale Station 2013",         rating: "4/5", review: "Ryan Coogler's powerful debut and heartbreaking true story." },
  { rank: 25, title: "Soulmate",                            tmdbId: 617882,  query: "Soulmate 2023",                  rating: "5/5", review: "Soulmates aren't always lovers." },
  { rank: 26, title: "Drawing Closer",                      tmdbId: 1291559, query: "Drawing Closer film",            rating: "4/5", review: "Pulls on heartstrings for fun." },
  { rank: 27, title: "Dead Poets Society",                  tmdbId: 207,     query: "Dead Poets Society 1989",        rating: "4/5", review: "Beautifully crafted story." },
  { rank: 28, title: "Get Out",                             tmdbId: 419430,  query: "Get Out 2017",                   rating: "5/5", review: "The movie is uniquely suspenseful with chilling twists and dark humor." },
  { rank: 29, title: "The Dark Knight",                     tmdbId: 155,     query: "The Dark Knight 2008",           rating: "4/5", review: "Heath Ledger's Joker is no joke." },
  { rank: 30, title: "Midsommar",                           tmdbId: 530385,  query: "Midsommar 2019",                 rating: "4/5", review: "Visuals are captivating, story is intense in a slow, unsettling way." },
  { rank: 31, title: "Super Mario Galaxy",                  tmdbId: 1226863, query: "Super Mario Galaxy",             rating: "4/5", review: "Big Mario fan, a mix of cute nostalgia the whole time." },
  { rank: 32, title: "Inglourious Basterds",                tmdbId: 16869,   query: "Inglourious Basterds 2009",      rating: "4/5", review: "One of the best opening scenes." },
  { rank: 33, title: "Ratatouille",                         tmdbId: 2062,    query: "Ratatouille 2007",               rating: "5/5", review: "I have a childhood sweet spot for it." },
  { rank: 34, title: "Black Panther",                       tmdbId: 284054,  query: "Black Panther 2018",             rating: "4/5", review: "One of MCU's best. Did Wakanda justice." },
  { rank: 35, title: "F1",                                  tmdbId: 911430,  query: "F1 2025 Brad Pitt",              rating: "4/5", review: "Brad Pitt is just so cool." },
  { rank: 36, title: "Oldboy",                              tmdbId: 670,     query: "Oldboy 2003",                    rating: "4/5", review: "It's a weird one. Interesting but definitely weird." },
  { rank: 37, title: "The Amazing Spider-Man 2",            tmdbId: 102382,  query: "Amazing Spider-Man 2 2014",      rating: "4/5", review: "It's overly hated. My favorite live-action Spider-Man." },
  { rank: 38, title: "Captain America: Civil War",          tmdbId: 271110,  query: "Captain America Civil War 2016", rating: "5/5", review: "Underoos!" },
  { rank: 39, title: "Zootopia",                            tmdbId: 269149,  query: "Zootopia 2016",                  rating: "4/5", review: "Rookie cop meets unemployed scammer." },
  { rank: 40, title: "Captain America: The Winter Soldier", tmdbId: 100402,  query: "Captain America Winter Soldier", rating: "5/5", review: "The movie that introduced me to the MCU." },
  { rank: 41, title: "The Wild Robot",                      tmdbId: 1184918, query: "The Wild Robot 2024",            rating: "5/5", review: "Kids movie that can make a grown man cry." },
  { rank: 42, title: "The Maze Runner",                     tmdbId: 198663,  query: "The Maze Runner 2014",           rating: "4/5", review: "Intense storytelling, engaging story of survival, uncovering the truth behind the maze." },
  { rank: 43, title: "Hacksaw Ridge",                       tmdbId: 324786,  query: "Hacksaw Ridge 2016",             rating: "4/5", review: "Powerful and inspiring war drama." },
  { rank: 44, title: "Parasite",                            tmdbId: 496243,  query: "Parasite 2019 Bong Joon-ho",    rating: "4/5", review: "Overcome the one-inch-tall barrier of subtitles, you'll be introduced to many more amazing films. —Bong Joon-ho" },
  { rank: 45, title: "Howl's Moving Castle",                tmdbId: 4935,    query: "Howl's Moving Castle 2004",     rating: "4/5", review: "Best music and design out of all the Studio Ghibli movies." },
  { rank: 46, title: "GoodFellas",                          tmdbId: 769,     query: "GoodFellas 1990",               rating: "4/5", review: "Masterfully directed crime film with sharp storytelling." },
  { rank: 47, title: "Whiplash",                            tmdbId: 244786,  query: "Whiplash 2014",                 rating: "4/5", review: "" },
  { rank: 48, title: "Eternal Sunshine of the Spotless Mind", tmdbId: 38,    query: "Eternal Sunshine Spotless Mind", rating: "4/5", review: "" },
  { rank: 49, title: "Past Lives",                          tmdbId: 666277,  query: "Past Lives 2023",               rating: "4/5", review: "" },
];

type Favorite = typeof favorites[0];
type FilmWithPoster = Favorite & { poster: string | null };

export default function FilmsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [films, setFilms] = useState<FilmWithPoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FilmWithPoster | null>(null);

  const fetchPosters = useCallback(async () => {
    if (!TMDB_KEY) {
      setFilms(favorites.map((f) => ({ ...f, poster: null })));
      setLoading(false);
      return;
    }

    const results = await Promise.allSettled(
      favorites.map(async (film) => {
        let poster: string | null = null;

        if (film.tmdbId) {
          // Direct fetch by ID — reliable
          const res = await fetch(
            `https://api.themoviedb.org/3/movie/${film.tmdbId}?api_key=${TMDB_KEY}`
          );
          const data = await res.json();
          poster = data.poster_path ?? null;
        } else {
          // Fall back to search for films without a known ID
          const res = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(film.query)}&page=1`
          );
          const data = await res.json();
          poster = data.results?.[0]?.poster_path ?? null;
        }

        return { ...film, poster };
      })
    );

    setFilms(
      results.map((r, i) =>
        r.status === "fulfilled"
          ? r.value
          : { ...favorites[i], poster: null }
      )
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosters();
  }, [fetchPosters]);

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
            delay: (i % 8) * 0.04,
          }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between flex-wrap gap-4"
          >
            <a
              href="https://boxd.it/eiXKl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-brand-gold transition-colors duration-200 group"
            >
              <span className="text-sm font-mono">View my Letterboxd diary</span>
              <ExternalLink size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </a>
            <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
              Some of my favorites
            </p>
          </motion.div>
        </div>
      </section>

      {/* Poster Grid */}
      <section className="py-12 px-4 md:px-10 pb-24">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
              {Array.from({ length: 49 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-lg shimmer-bg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
              {films.map((film) => (
                <motion.div
                  key={film.rank}
                  className="film-card group relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer bg-accent"
                  onClick={() => setSelected(film)}
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {film.poster ? (
                    <Image
                      src={`${TMDB_IMG}${film.poster}`}
                      alt={film.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 10vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 gap-1.5">
                      <Film size={18} className="text-muted-foreground" />
                      <p className="text-[8px] text-center text-muted-foreground font-mono leading-tight">
                        {film.title}
                      </p>
                    </div>
                  )}

                  {/* Rank badge */}
                  <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-md bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-[8px] font-mono text-white/80">
                      {String(film.rank).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
                    <p className="text-white text-[9px] font-medium leading-tight line-clamp-2">
                      {film.title}
                    </p>
                    <p className="text-brand-gold text-[9px] font-mono mt-0.5">
                      ★ {film.rating}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
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
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              className="relative bg-card border border-border rounded-2xl overflow-hidden max-w-lg w-full flex"
              onClick={(e) => e.stopPropagation()}
            >
              {selected.poster && (
                <div className="relative w-36 flex-shrink-0">
                  <Image
                    src={`${TMDB_IMG}${selected.poster}`}
                    alt={selected.title}
                    fill
                    className="object-cover"
                    sizes="144px"
                  />
                </div>
              )}

              <div className="flex-1 p-6">
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full bg-background/80 flex items-center justify-center hover:bg-accent transition-colors"
                >
                  <X size={13} />
                </button>

                <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mb-2">
                  #{String(selected.rank).padStart(2, "0")}
                </p>

                <h2 className="font-display text-2xl leading-tight mb-3 pr-6">
                  {selected.title.toUpperCase()}
                </h2>

                <p className="text-brand-gold font-mono text-sm mb-4">
                  ★ {selected.rating}
                </p>

                {selected.review ? (
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    &ldquo;{selected.review}&rdquo;
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground/50 font-mono">No review yet.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
