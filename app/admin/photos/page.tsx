import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { PhotosAdmin } from "./PhotosAdmin";

export default async function PhotosAdminPage() {
  const { supabase } = await requireAdmin();
  const [{ data: photos }, { data: tags }] = await Promise.all([
    supabase
      .from("photos")
      .select(
        "id, caption, location, taken_at, media:media_id(*), photo_tags(tag:tags(id,name,slug))"
      )
      .order("created_at", { ascending: false }),
    supabase.from("tags").select("id, name, slug").order("name"),
  ]);
  return (
    <PhotosAdmin initialPhotos={photos ?? []} tags={(tags ?? []) as any} />
  );
}
