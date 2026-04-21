import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types";

type Client = SupabaseClient<Database>;

export type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  created_at: string;
};

export async function listGuestbookEntries(
  client: Client,
  opts: { limit?: number; offset?: number } = {}
): Promise<GuestbookEntry[]> {
  const { limit = 50, offset = 0 } = opts;
  const { data, error } = await client
    .from("guestbook_entries")
    .select("id, name, message, created_at")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) return [];
  return data ?? [];
}
