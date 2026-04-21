import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { ProjectEditor } from "./ProjectEditor";

export default async function ProjectEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const isNew = id === "new";

  let initial = null;
  let mediaIds: string[] = [];

  if (!isNew) {
    const { data } = await supabase
      .from("projects")
      .select("*, project_media(media_id, position)")
      .eq("id", id)
      .maybeSingle();
    if (!data) notFound();
    initial = data;
    mediaIds = ((data as any).project_media ?? [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((m: any) => m.media_id);
  }

  const { data: allMedia } = await supabase
    .from("media")
    .select(
      "id, storage_path, external_url, kind, blurhash, alt, width, height"
    )
    .not("storage_path", "is", null)
    .order("created_at", { ascending: false });

  return (
    <ProjectEditor
      initial={initial}
      mediaIds={mediaIds}
      availableMedia={(allMedia ?? []) as any}
    />
  );
}
