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

export function posterUrl(
  path: string | null,
  size: "w185" | "w342" | "w500" = "w342"
): string {
  if (!path) return "";
  return `${POSTER_BASE}/${size}${path}`;
}
