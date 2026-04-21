import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { TagsAdmin } from "./TagsAdmin";

export default async function TagsAdminPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("tags")
    .select("*, photo_tags(count)")
    .order("name");
  const tags = (data ?? []).map((t: any) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    count: t.photo_tags?.[0]?.count ?? 0,
  }));
  return <TagsAdmin initialTags={tags} />;
}
