"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { movieSchema } from "@/lib/schemas/movie";

type TmdbPreview =
  | { tmdb_id: number; title: string; year: string; poster_path: string | null }
  | { error: string };

export async function previewTmdbAction(tmdbId: number): Promise<TmdbPreview> {
  const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!key) return { error: "TMDB key missing" };
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${key}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return { error: `TMDB ${res.status}` };
  const data = await res.json();
  return {
    tmdb_id: tmdbId,
    title: data.title,
    year: (data.release_date ?? "").slice(0, 4),
    poster_path: data.poster_path,
  };
}

export async function createMovieAction(input: unknown) {
  const parsed = movieSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("movies").insert(parsed.data);
  if (error) return { error: error.message };
  revalidatePath("/life/films");
  return { ok: true as const };
}

export async function updateMovieAction(input: unknown) {
  const parsed = movieSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const { id, ...rest } = parsed.data;
  if (!id) return { error: "id required" };
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("movies").update(rest).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/life/films");
  return { ok: true as const };
}

export async function deleteMovieAction(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("movies").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/life/films");
  return { ok: true as const };
}
