import { createClient } from "@/lib/supabase/server";
import { getPageDescription } from "@/lib/supabase/queries/pageContent";
import { WorkGrid } from "./WorkGrid";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal/Reveal";

export const metadata = { title: "Work · davejdo" };

export default async function WorkPage() {
  const supabase = await createClient();
  const description = await getPageDescription(supabase, "work");
  const { data: projects } = await supabase
    .from("projects")
    .select(
      `
      id, slug, title, year, client, description, cover_media_id, position,
      cover:cover_media_id (id, kind, storage_path, external_url, blurhash, alt, width, height),
      project_media (
        position,
        media:media_id (id, kind, storage_path, external_url, blurhash, alt, width, height)
      )
    `
    )
    .eq("published", true)
    .order("position", { ascending: false });

  return (
    <>
      <section className="px-6 md:px-12 pt-20 pb-12">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <h1 className="font-display text-[clamp(4rem,10vw,9rem)] leading-[0.85]">
              WORK
            </h1>
            <p className="text-muted-foreground max-w-md mt-6 whitespace-pre-line">
              {description}
            </p>
          </Reveal>
        </div>
      </section>

      <WorkGrid projects={(projects ?? []) as any[]} />

      <Footer />
    </>
  );
}
