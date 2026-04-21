"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/requireAdmin";

const DESCRIPTION_PATHS: Record<string, string> = {
  home:        "/",
  work:        "/work",
  picturebook: "/life/picturebook",
  films:       "/life/films",
  music:       "/life/music",
  about:       "/about",
  guestbook:   "/guestbook",
};

export async function setHeroMediaAction(mediaId: string | null) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("site_settings")
    .update({ hero_media_id: mediaId })
    .eq("id", "singleton");
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { ok: true as const };
}

export async function setPageDescriptionAction(slug: string, description: string) {
  if (!(slug in DESCRIPTION_PATHS)) return { error: "unknown page" };
  if (description.length > 2000) return { error: "description too long" };

  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("page_content")
    .upsert({ slug, description }, { onConflict: "slug" });
  if (error) return { error: error.message };

  revalidatePath(DESCRIPTION_PATHS[slug]);
  revalidatePath("/admin/settings");
  return { ok: true as const };
}
