"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { projectSchema, slugify } from "@/lib/schemas/project";

export async function upsertProjectAction(formData: FormData) {
  const parsed = projectSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    slug: formData.get("slug") || slugify(String(formData.get("title") ?? "")),
    client: formData.get("client") || null,
    year: formData.get("year") ? Number(formData.get("year")) : null,
    description: formData.get("description") || null,
    cover_media_id: formData.get("cover_media_id") || null,
    position: Number(formData.get("position") ?? 0),
    published: formData.get("published") === "true",
  });

  if (!parsed.success) return { error: parsed.error.flatten() };

  const { supabase } = await requireAdmin();
  const { id, ...rest } = parsed.data;

  const result = id
    ? await supabase.from("projects").update(rest).eq("id", id).select("id").single()
    : await supabase.from("projects").insert(rest).select("id").single();

  if (result.error)
    return { error: { formErrors: [result.error.message], fieldErrors: {} } };

  revalidatePath("/work");
  revalidatePath("/admin/portfolio");
  return { ok: true as const, id: result.data?.id };
}

export async function deleteProjectAction(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/work");
  revalidatePath("/admin/portfolio");
  return { ok: true as const };
}

export async function reorderProjectsAction(ids: string[]) {
  const { supabase } = await requireAdmin();
  await Promise.all(
    ids.map((id, idx) =>
      supabase.from("projects").update({ position: ids.length - idx }).eq("id", id)
    )
  );
  revalidatePath("/work");
  revalidatePath("/admin/portfolio");
  return { ok: true as const };
}

export async function setProjectMediaAction(projectId: string, mediaIds: string[]) {
  const { supabase } = await requireAdmin();
  await supabase.from("project_media").delete().eq("project_id", projectId);
  if (mediaIds.length > 0) {
    await supabase.from("project_media").insert(
      mediaIds.map((mid, idx) => ({
        project_id: projectId,
        media_id: mid,
        position: idx,
      }))
    );
  }
  revalidatePath("/work");
  revalidatePath(`/admin/portfolio/${projectId}`);
  return { ok: true as const };
}
