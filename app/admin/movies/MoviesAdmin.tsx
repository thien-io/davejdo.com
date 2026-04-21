"use client";

import { useState } from "react";
import { toast } from "sonner";
import { StarRating } from "@/components/admin/StarRating";
import { extractTmdbId } from "@/lib/schemas/movie";
import {
  previewTmdbAction,
  createMovieAction,
  updateMovieAction,
  deleteMovieAction,
} from "../actions/movies";

export function MoviesAdmin({ initialMovies }: { initialMovies: any[] }) {
  const [movies, setMovies] = useState(initialMovies);
  const [raw, setRaw] = useState("");
  const [preview, setPreview] = useState<any>(null);
  const [rating, setRating] = useState(4);
  const [review, setReview] = useState("");

  async function onLookup() {
    const id = extractTmdbId(raw);
    if (!id) return toast.error("Couldn't parse a TMDB id.");
    const result = await previewTmdbAction(id);
    if ("error" in result) return toast.error(result.error);
    setPreview(result);
  }

  async function onSave() {
    if (!preview) return;
    const result = await createMovieAction({
      tmdb_id: preview.tmdb_id,
      rating,
      review: review || null,
    });
    if ("error" in result) return toast.error(JSON.stringify(result.error));
    toast.success("Saved");
    setMovies([
      { id: crypto.randomUUID(), ...preview, rating, review },
      ...movies,
    ]);
    setRaw("");
    setPreview(null);
    setReview("");
    setRating(4);
  }

  return (
    <div className="max-w-5xl">
      <header className="mb-8">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">
          Manage
        </p>
        <h1 className="font-display text-5xl">MOVIES</h1>
      </header>

      <div className="border border-neutral-800 rounded-xl p-6 mb-10">
        <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500 mb-3">
          Add movie
        </div>
        <div className="flex gap-2 mb-4">
          <input
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="TMDB ID or URL"
            className="flex-1 bg-black border border-neutral-800 rounded-lg px-4 py-2 text-sm font-mono"
          />
          <button
            onClick={onLookup}
            className="px-4 py-2 border border-neutral-800 rounded-lg text-sm"
          >
            Lookup
          </button>
        </div>
        {preview && (
          <div className="flex gap-6 items-start">
            {preview.poster_path && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`https://image.tmdb.org/t/p/w200${preview.poster_path}`}
                alt={preview.title}
                className="w-28 rounded"
              />
            )}
            <div className="flex-1 space-y-3">
              <div>
                <div className="font-display text-2xl">{preview.title}</div>
                <div className="text-sm text-neutral-500">{preview.year}</div>
              </div>
              <StarRating value={rating} onChange={setRating} size={20} />
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="One-liner review…"
                rows={2}
                maxLength={500}
                className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={onSave}
                className="px-4 py-2 bg-[#d4b97c] text-black rounded-lg text-sm"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="border border-neutral-900 rounded-xl divide-y divide-neutral-900">
        {movies.map((m) => (
          <MovieRow
            key={m.id}
            m={m}
            onDelete={async () => {
              if (!confirm("Delete?")) return;
              await deleteMovieAction(m.id);
              setMovies(movies.filter((x) => x.id !== m.id));
            }}
            onRating={async (r) => {
              await updateMovieAction({
                id: m.id,
                tmdb_id: m.tmdb_id,
                rating: r,
                review: m.review,
              });
              setMovies(
                movies.map((x) => (x.id === m.id ? { ...x, rating: r } : x))
              );
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MovieRow({
  m,
  onDelete,
  onRating,
}: {
  m: any;
  onDelete: () => void;
  onRating: (r: number) => void;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <div className="w-12 h-12 rounded bg-neutral-900 overflow-hidden flex items-center justify-center text-[10px] font-mono text-neutral-600">
        {m.tmdb_id}
      </div>
      <div className="flex-1">
        <div className="text-sm font-mono">TMDB #{m.tmdb_id}</div>
        <div className="text-xs text-neutral-500">{m.review ?? "—"}</div>
      </div>
      <StarRating value={m.rating ?? 0} onChange={onRating} />
      <button
        onClick={onDelete}
        className="text-neutral-500 hover:text-red-400 text-sm"
      >
        Delete
      </button>
    </div>
  );
}
