import type { Database } from "../types";

type Media = Database["public"]["Tables"]["media"]["Row"];

export type SiteSettings = {
  hero_media_id: string | null;
  hero_media: Media | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getSiteSettings(client: any): Promise<SiteSettings> {
  const { data, error } = await client
    .from("site_settings")
    .select("hero_media_id, hero_media:hero_media_id(*)")
    .eq("id", "singleton")
    .maybeSingle();
  if (error || !data) return { hero_media_id: null, hero_media: null };
  return {
    hero_media_id: data.hero_media_id,
    hero_media: data.hero_media ?? null,
  };
}
