"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ExternalLink } from "lucide-react";
import { Footer } from "@/components/footer";

gsap.registerPlugin(ScrollTrigger);

const favorites = [
  { rank: 1,  title: "Dune 2",                           rating: "5/5", review: "Perfect Sci-fi movie." },
  { rank: 2,  title: "La La Land",                        rating: "5/5", review: "Beautiful music, stunning color-grading, heartfelt story." },
  { rank: 3,  title: "Spider-Man: Across the Spider-Verse", rating: "5/5", review: "Best animated movie of all time. Dying on that hill." },
  { rank: 4,  title: "Interstellar",                      rating: "5/5", review: "Do not go gentle into that good night." },
  { rank: 5,  title: "Shawshank Redemption",              rating: "5/5", review: "The indomitable human spirit." },
  { rank: 6,  title: "Ip Man",                            rating: "5/5", review: "HITS every time." },
  { rank: 7,  title: "The Last Ten Years (Japanese)",     rating: "5/5", review: "Build me up just to break me down." },
  { rank: 8,  title: "18x2 Beyond Youthful Days",         rating: "5/5", review: "I couldn't stop smiling until..." },
  { rank: 9,  title: "Sinners",                           rating: "4/5", review: "Every movie should be shot on film." },
  { rank: 10, title: "Good Will Hunting",                 rating: "5/5", review: "Best class assignment watch ever." },
  { rank: 11, title: "COCO",                              rating: "5/5", review: "I teared up in Spanish class. 8th grade." },
  { rank: 12, title: "Project Hail Mary",                 rating: "5/5", review: "It's just so beautiful. Jaw was touching my lap during Tau Ceti." },
  { rank: 13, title: "Beautiful Boy",                     rating: "5/5", review: "Never doing drugs." },
  { rank: 14, title: "Eyes Wide Shut",                    rating: "4/5", review: "Gonna keep my thoughts to myself on this one." },
  { rank: 15, title: "Your Name",                         rating: "5/5", review: "Gorgeous visuals and an immersive soundtrack." },
  { rank: 16, title: "Memories of Murder",                rating: "5/5", review: "Thinking about the ending to this day." },
  { rank: 17, title: "Ford vs Ferrari",                   rating: "4/5", review: "Why are racers so cool?" },
  { rank: 18, title: "A Silent Voice",                    rating: "5/5", review: "I'm hurting." },
  { rank: 19, title: "A Beautiful Mind",                  rating: "4/5", review: "Should he take his meds?" },
  { rank: 20, title: "The Wind Rises",                    rating: "5/5", review: "Studio Ghibli's Oppenheimer." },
  { rank: 21, title: "The Secret World of Arrietty",      rating: "5/5", review: "The sound design is perfect." },
  { rank: 22, title: "The Karate Kid",                    rating: "4/5", review: "One of my favorites growing up." },
  { rank: 23, title: "20th Century Girl",                 rating: "4/5", review: "My gateway to consuming Asian cinema." },
  { rank: 24, title: "Fruitvale Station",                 rating: "4/5", review: "Ryan Coogler's powerful debut and heartbreaking true story." },
  { rank: 25, title: "Soulmate (Korean 2023)",            rating: "5/5", review: "Soulmates aren't always lovers." },
  { rank: 26, title: "Drawing Closer",                    rating: "4/5", review: "Pulls on heartstrings for fun." },
  { rank: 27, title: "Dead Poets Society",                rating: "4/5", review: "Beautifully crafted story." },
  { rank: 28, title: "Get Out",                           rating: "5/5", review: "The movie is uniquely suspenseful with chilling twists and dark humor." },
  { rank: 29, title: "The Dark Knight",                   rating: "4/5", review: "Heath Ledger's Joker is no joke." },
  { rank: 30, title: "Midsommar",                         rating: "4/5", review: "Visuals are captivating, story is intense in a slow, unsettling way." },
  { rank: 31, title: "Super Mario Galaxy Movie",          rating: "4/5", review: "Big Mario fan, a mix of cute nostalgia the whole time." },
  { rank: 32, title: "Inglourious Basterds",              rating: "4/5", review: "One of the best opening scenes." },
  { rank: 33, title: "Ratatouille",                       rating: "5/5", review: "I have a childhood sweet spot for it." },
  { rank: 34, title: "Black Panther",                     rating: "4/5", review: "One of MCU's best. Did Wakanda justice." },
  { rank: 35, title: "F1",                                rating: "4/5", review: "Brad Pitt is just so cool." },
  { rank: 36, title: "Old Boy",                           rating: "4/5", review: "It's a weird one. Interesting but definitely weird." },
  { rank: 37, title: "The Amazing Spider-Man 2",          rating: "4/5", review: "It's overly hated. My favorite live-action Spider-Man." },
  { rank: 38, title: "Captain America: Civil War",        rating: "5/5", review: "Underoos!" },
  { rank: 39, title: "Zootopia",                          rating: "4/5", review: "Rookie cop meets unemployed scammer." },
  { rank: 40, title: "Captain America: The Winter Soldier", rating: "5/5", review: "The movie that introduced me to the MCU." },
  { rank: 41, title: "The Wild Robot",                    rating: "5/5", review: "Kids movie that can make a grown man cry." },
  { rank: 42, title: "The Maze Runner",                   rating: "4/5", review: "Intense storytelling, engaging story of survival, uncovering the truth behind the maze." },
  { rank: 43, title: "Hacksaw Ridge",                     rating: "4/5", review: "Powerful and inspiring war drama." },
  { rank: 44, title: "Parasite",                          rating: "4/5", review: "Overcome the one-inch-tall barrier of subtitles, you'll be introduced to many more amazing films. —Bong Joon-ho" },
  { rank: 45, title: "Howl's Moving Castle",              rating: "4/5", review: "Best music and design out of all the Studio Ghibli movies." },
  { rank: 46, title: "GoodFellas",                        rating: "4/5", review: "Masterfully directed crime film with sharp storytelling." },
  { rank: 47, title: "Whiplash",                          rating: "4/5", review: "" },
  { rank: 48, title: "Eternal Sunshine of the Spotless Mind", rating: "4/5", review: "" },
  { rank: 49, title: "Past Lives",                        rating: "4/5", review: "" },
];

export default function FilmsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".film-row").forEach((row, i) => {
        gsap.fromTo(
          row,
          { y: 16, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.4, ease: "power2.out",
            scrollTrigger: { trigger: row, start: "top 92%" },
            delay: (i % 6) * 0.04,
          }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen">
      {/* Header */}
      <section className="py-24 px-6 md:px-16 border-b border-border">
        <div className="max-w-5xl mx-auto">
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
          </motion.div>
        </div>
      </section>

      {/* Favorites */}
      <section className="py-16 px-6 md:px-16 pb-24">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-10">
            Some of my favorites
          </p>

          <div className="space-y-0">
            {favorites.map((film) => (
              <div
                key={film.rank}
                className="film-row group flex items-start gap-5 py-5 border-b border-border last:border-0 hover:bg-accent/20 -mx-3 px-3 rounded-lg transition-colors duration-150"
              >
                {/* Rank */}
                <span className="font-mono text-xs text-muted-foreground w-7 flex-shrink-0 pt-0.5">
                  {String(film.rank).padStart(2, "0")}
                </span>

                {/* Stars */}
                <span className="text-brand-gold text-sm flex-shrink-0 pt-0.5">★</span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <h3 className="font-display text-xl leading-tight">
                      {film.title.toUpperCase()}
                    </h3>
                    <span className="font-mono text-xs text-brand-gold">{film.rating}</span>
                  </div>
                  {film.review && (
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed italic">
                      &ldquo;{film.review}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
