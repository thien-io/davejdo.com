"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X } from "lucide-react";
import { posterUrl } from "@/lib/tmdb";

export function FilmsGrid({
  movies,
  activeSort,
}: {
  movies: any[];
  activeSort: "recent" | "rating";
}) {
  const [selected, setSelected] = useState<any>(null);

  return (
    <section className="px-6 md:px-12 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <SortPill href="/life/films" active={activeSort === "recent"}>
            Recent
          </SortPill>
          <SortPill
            href="/life/films?sort=rating"
            active={activeSort === "rating"}
          >
            Top rated
          </SortPill>
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
                {m.review && (
                  <div className="text-[10px] text-neutral-300 mt-1 line-clamp-3">
                    {m.review}
                  </div>
                )}
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
                <p className="text-sm text-foreground/90 mt-4 leading-relaxed">
                  {selected.review}
                </p>
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

function SortPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
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
