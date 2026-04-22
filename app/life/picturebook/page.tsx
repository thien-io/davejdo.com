import { createClient } from "@/lib/supabase/server";
import { getPageDescription } from "@/lib/supabase/queries/pageContent";
import { PicturebookGrid } from "./PicturebookGrid";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal/Reveal";

export const metadata = { title: "Picturebook · davejdo" };

export default async function PicturebookPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; page?: string }>;
}) {
  const { tag, page } = await searchParams;
  const pageNum = Math.max(0, Number(page ?? 0));
  const supabase = await createClient();
  const description = await getPageDescription(supabase, "picturebook");

  const { data: photosRaw } = tag
    ? await supabase
        .from("photos")
        .select(
          "id, caption, location, taken_at, media:media_id(id, kind, storage_path, external_url, blurhash, alt, width, height), tags:photo_tags!inner(tag:tags!inner(slug, name))"
        )
        .eq("tags.tag.slug", tag)
        .order("taken_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .range(pageNum * 30, pageNum * 30 + 29)
    : await supabase
        .from("photos")
        .select(
          "id, caption, location, taken_at, media:media_id(id, kind, storage_path, external_url, blurhash, alt, width, height), tags:photo_tags(tag:tags(slug, name))"
        )
        .order("taken_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .range(pageNum * 30, pageNum * 30 + 29);

  const { data: tagsData } = await supabase
    .from("tags")
    .select("slug, name, photo_tags(count)")
    .order("name");

  const { count: totalPhotos } = await supabase
    .from("photos")
    .select("id", { count: "exact", head: true });

  const photos = (photosRaw ?? []).map((p: any) => ({
    ...p,
    tags: (p.tags ?? []).map((t: any) => t.tag),
  }));
  const tags = (tagsData ?? []).map((t: any) => ({
    slug: t.slug,
    name: t.name,
    count: t.photo_tags?.[0]?.count ?? 0,
  }));

  return (
    <>
      <section className="px-6 md:px-12 pt-20 pb-12">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <h1 className="font-display text-[clamp(4rem,10vw,9rem)] leading-[0.85]">
              PICTUREBOOK
            </h1>
            <p className="text-muted-foreground max-w-md mt-6 whitespace-pre-line">
              {description}
            </p>
          </Reveal>
        </div>
      </section>

      <PicturebookGrid
        photos={photos}
        tags={tags}
        totalPhotos={totalPhotos ?? 0}
        activeTag={tag ?? null}
        page={pageNum}
      />
      <Footer />
    </>
  );
}
