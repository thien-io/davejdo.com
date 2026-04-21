"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/requireAdmin";

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
