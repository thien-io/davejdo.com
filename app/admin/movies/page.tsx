import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { MoviesAdmin } from "./MoviesAdmin";

export default async function MoviesAdminPage() {
  const { supabase } = await requireAdmin();
  const { data: movies } = await supabase
    .from("movies")
    .select("*")
    .order("watched_at", { ascending: false });
  return <MoviesAdmin initialMovies={movies ?? []} />;
}
