import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types";

type Client = SupabaseClient<Database>;
type Media = Database["public"]["Tables"]["media"]["Row"];

export async function listMedia(client: Client, limit = 100): Promise<Media[]> {
  const { data, error } = await client
    .from("media")
    .select("*")
    .not("storage_path", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return data ?? [];
}

export async function getMedia(client: Client, id: string): Promise<Media | null> {
  const { data, error } = await client
    .from("media")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return null;
  return data;
}
