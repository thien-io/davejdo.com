"use server";

import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { revalidatePath } from "next/cache";

type CreateMediaInput = {
  kind: "image" | "video" | "external_video";
  owner_resource: "project" | "photo";
  owner_id?: string;
  width?: number;
  height?: number;
  blurhash?: string;
  alt?: string;
  external_url?: string;
  target?: "photos" | "portfolio";
  filename?: string;
};

type CreateMediaResult =
  | { mediaId: string; signedUrl: string; publicUrl: string; storagePath: string }
  | { mediaId: string; publicUrl: string }
  | { error: string };

export async function createMediaAction(
  input: CreateMediaInput
): Promise<CreateMediaResult> {
  const { supabase } = await requireAdmin();

  if (input.kind === "external_video") {
    if (!input.external_url) return { error: "external_url required" };
    const { data, error } = await supabase
      .from("media")
      .insert({
        kind: "external_video",
        external_url: input.external_url,
        owner_resource: input.owner_resource,
        owner_id: input.owner_id,
        alt: input.alt,
      })
      .select("id")
      .single();
    if (error || !data) return { error: error?.message ?? "insert failed" };
    return { mediaId: data.id, publicUrl: input.external_url };
  }

  if (!input.target || !input.filename) {
    return { error: "target and filename required" };
  }

  const { data, error } = await supabase
    .from("media")
    .insert({
      kind: input.kind,
      owner_resource: input.owner_resource,
      owner_id: input.owner_id,
      width: input.width,
      height: input.height,
      blurhash: input.blurhash,
      alt: input.alt,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "insert failed" };

  const path = `${data.id}/${Date.now()}-${input.filename}`;
  const { data: signed, error: signedError } = await supabase.storage
    .from(input.target)
    .createSignedUploadUrl(path);

  if (signedError || !signed) {
    await supabase.from("media").delete().eq("id", data.id);
    return { error: signedError?.message ?? "signed URL failed" };
  }

  const { data: pub } = supabase.storage.from(input.target).getPublicUrl(path);

  return {
    mediaId: data.id,
    signedUrl: signed.signedUrl,
    publicUrl: pub.publicUrl,
    storagePath: `${input.target}/${path}`,
  };
}

export async function finalizeMediaAction(mediaId: string, storagePath: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("media")
    .update({ storage_path: storagePath })
    .eq("id", mediaId);
  if (error) return { error: error.message };
  return { ok: true as const };
}

export async function deleteMediaAction(mediaId: string) {
  const { supabase } = await requireAdmin();

  const { data: media } = await supabase
    .from("media")
    .select("storage_path")
    .eq("id", mediaId)
    .maybeSingle();

  if (media?.storage_path) {
    const [bucket, ...rest] = media.storage_path.split("/");
    await supabase.storage.from(bucket).remove([rest.join("/")]);
  }

  const { error } = await supabase.from("media").delete().eq("id", mediaId);
  if (error) return { error: error.message };

  revalidatePath("/work");
  revalidatePath("/life/picturebook");
  return { ok: true as const };
}
