import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types";

type Client = SupabaseClient<Database>;
type Photo = Database["public"]["Tables"]["photos"]["Row"];
type Media = Database["public"]["Tables"]["media"]["Row"];

export type PhotoWithMedia = Photo & {
  media: Media | null;
  tags: { slug: string; name: string }[];
};

export async function listPhotos(
  client: Client,
  opts: { limit?: number; offset?: number } = {}
): Promise<PhotoWithMedia[]> {
  const { limit = 30, offset = 0 } = opts;
  const { data, error } = await client
    .from("photos")
    .select(
      "*, media:media_id(*), tags:photo_tags(tag:tags(slug,name))"
    )
    .order("taken_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) return [];
  return (data ?? []).map(normalizePhoto);
}

export async function listPhotosByTag(
  client: Client,
  tagSlug: string,
  opts: { limit?: number; offset?: number } = {}
): Promise<PhotoWithMedia[]> {
  const { limit = 30, offset = 0 } = opts;
  const { data, error } = await client
    .from("photos")
    .select(
      "*, media:media_id(*), tags:photo_tags!inner(tag:tags!inner(slug,name))"
    )
    .eq("tags.tag.slug", tagSlug)
    .order("taken_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);
  if (error) return [];
  return (data ?? []).map(normalizePhoto);
}

function normalizePhoto(raw: any): PhotoWithMedia {
  return {
    ...raw,
    media: raw.media ?? null,
    tags: (raw.tags ?? []).map((t: any) => ({
      slug: t.tag.slug,
      name: t.tag.name,
    })),
  };
}
