"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { photoSchema } from "@/lib/schemas/photo";
import { slugify } from "@/lib/schemas/project";

export async function createPhotoAction(input: {
  media_id: string;
  caption?: string | null;
  location?: string | null;
  taken_at?: string | null;
  tag_ids?: string[];
}) {
  const parsed = photoSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const { supabase } = await requireAdmin();
  const { tag_ids, ...rest } = parsed.data;
  const { data, error } = await supabase
    .from("photos")
    .insert(rest)
    .select("id")
    .single();
  if (error || !data) return { error: error?.message ?? "insert failed" };

  if (tag_ids && tag_ids.length > 0) {
    await supabase.from("photo_tags").insert(
      tag_ids.map((tid) => ({ photo_id: data.id, tag_id: tid }))
    );
  }

  revalidatePath("/life/picturebook");
  return { ok: true as const, id: data.id };
}

export async function updatePhotoAction(input: {
  id: string;
  caption?: string | null;
  location?: string | null;
  taken_at?: string | null;
  tag_ids?: string[];
}) {
  const { supabase } = await requireAdmin();
  const { id, tag_ids, ...rest } = input;
  await supabase.from("photos").update(rest).eq("id", id);
  if (tag_ids) {
    await supabase.from("photo_tags").delete().eq("photo_id", id);
    if (tag_ids.length > 0) {
      await supabase.from("photo_tags").insert(
        tag_ids.map((tid) => ({ photo_id: id, tag_id: tid }))
      );
    }
  }
  revalidatePath("/life/picturebook");
  return { ok: true as const };
}

export async function deletePhotoAction(id: string) {
  const { supabase } = await requireAdmin();
  const { data: photo } = await supabase
    .from("photos")
    .select("media_id")
    .eq("id", id)
    .maybeSingle();
  await supabase.from("photos").delete().eq("id", id);
  if (photo?.media_id) {
    const { data: media } = await supabase
      .from("media")
      .select("storage_path")
      .eq("id", photo.media_id)
      .maybeSingle();
    if (media?.storage_path) {
      const [bucket, ...rest] = media.storage_path.split("/");
      await supabase.storage.from(bucket).remove([rest.join("/")]);
    }
    await supabase.from("media").delete().eq("id", photo.media_id);
  }
  revalidatePath("/life/picturebook");
  return { ok: true as const };
}

export async function createTagIfMissingAction(name: string) {
  const slug = slugify(name);
  const { supabase } = await requireAdmin();
  const { data: existing } = await supabase
    .from("tags")
    .select("id,name,slug")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) return existing;
  const { data, error } = await supabase
    .from("tags")
    .insert({ name, slug })
    .select("id,name,slug")
    .single();
  if (error) return { error: error.message };
  return data!;
}
