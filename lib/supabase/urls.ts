/**
 * Build a public URL for a Supabase Storage object.
 * Accepts paths in the form "bucket/key/inside/bucket".
 */
export function supabasePublicUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/${storagePath}`;
}
