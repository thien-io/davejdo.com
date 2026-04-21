import { createClient } from "@/lib/supabase/server";
import { getPageDescription } from "@/lib/supabase/queries/pageContent";
import { fetchTmdbMovie } from "@/lib/tmdb";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal/Reveal";
import { FilmsGrid } from "./FilmsGrid";

export const metadata = { title: "Films · davejdo" };

export default async function FilmsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const supabase = await createClient();
  const description = await getPageDescription(supabase, "films");
  const base = supabase.from("movies").select("*");
  const ordered =
    sort === "rating"
      ? base
          .order("rating", { ascending: false })
          .order("watched_at", { ascending: false })
      : base.order("watched_at", { ascending: false });

  const { data } = await ordered;
  const movies = data ?? [];

  const enriched = await Promise.all(
    movies.map(async (m: any) => {
      const tmdb = await fetchTmdbMovie(m.tmdb_id);
      return { ...m, tmdb };
    })
  );

  return (
    <>
      <section className="px-6 md:px-12 pt-20 pb-10">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-3">
              04 — FILMS
            </div>
            <h1 className="font-display text-[clamp(4rem,10vw,9rem)] leading-[0.85]">
              FILMS
            </h1>
            <p className="text-muted-foreground max-w-md mt-6 whitespace-pre-line">
              {description}
            </p>
          </Reveal>
        </div>
      </section>

      <FilmsGrid
        movies={enriched}
        activeSort={sort === "rating" ? "rating" : "recent"}
      />
      <Footer />
    </>
  );
}
