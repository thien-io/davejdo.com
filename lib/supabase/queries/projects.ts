import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types";

type Client = SupabaseClient<Database>;
type Project = Database["public"]["Tables"]["projects"]["Row"];

export async function listPublishedProjects(client: Client): Promise<Project[]> {
  const { data, error } = await client
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("position", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getProjectBySlug(
  client: Client,
  slug: string
): Promise<Project | null> {
  const { data, error } = await client
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) return null;
  return data ?? null;
}
