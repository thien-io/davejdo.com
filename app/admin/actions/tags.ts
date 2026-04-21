"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { slugify } from "@/lib/schemas/project";

export async function renameTagAction(id: string, name: string) {
  const slug = slugify(name);
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("tags").update({ name, slug }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/life/picturebook");
  return { ok: true as const };
}

export async function deleteTagAction(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/life/picturebook");
  return { ok: true as const };
}

export async function mergeTagAction(sourceId: string, targetId: string) {
  if (sourceId === targetId) return { error: "cannot merge into self" };
  const { supabase } = await requireAdmin();
  const { data: sources } = await supabase
    .from("photo_tags")
    .select("photo_id")
    .eq("tag_id", sourceId);
  for (const row of sources ?? []) {
    await supabase
      .from("photo_tags")
      .upsert(
        { photo_id: row.photo_id, tag_id: targetId },
        { onConflict: "photo_id,tag_id" }
      );
    await supabase
      .from("photo_tags")
      .delete()
      .eq("photo_id", row.photo_id)
      .eq("tag_id", sourceId);
  }
  await supabase.from("tags").delete().eq("id", sourceId);
  revalidatePath("/life/picturebook");
  return { ok: true as const };
}
