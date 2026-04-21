import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types";

type Client = SupabaseClient<Database>;
type Movie = Database["public"]["Tables"]["movies"]["Row"];

export async function listMovies(
  client: Client,
  opts: { sort?: "recent" | "rating" } = {}
): Promise<Movie[]> {
  const { sort = "recent" } = opts;
  const base = client.from("movies").select("*");
  const query =
    sort === "rating"
      ? base
          .order("rating", { ascending: false })
          .order("watched_at", { ascending: false })
      : base.order("watched_at", { ascending: false });
  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}
