import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types";

type Client = SupabaseClient<Database>;
type Tag = Database["public"]["Tables"]["tags"]["Row"];

export async function listTags(client: Client): Promise<Tag[]> {
  const { data, error } = await client.from("tags").select("*").order("name");
  if (error) return [];
  return data ?? [];
}

export async function tagsWithCounts(
  client: Client
): Promise<(Tag & { photo_count: number })[]> {
  const { data, error } = await client
    .from("tags")
    .select("*, photo_tags(count)");
  if (error) return [];
  return (data ?? []).map((t: any) => ({
    ...t,
    photo_count: t.photo_tags?.[0]?.count ?? 0,
  }));
}
