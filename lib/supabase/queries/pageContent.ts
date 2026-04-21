// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPageDescription(client: any, slug: string): Promise<string> {
  const { data, error } = await client
    .from("page_content")
    .select("description")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return "";
  return data.description ?? "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function listPageContent(client: any): Promise<{ slug: string; description: string }[]> {
  const { data, error } = await client
    .from("page_content")
    .select("slug, description")
    .order("slug");
  if (error || !data) return [];
  return data;
}
