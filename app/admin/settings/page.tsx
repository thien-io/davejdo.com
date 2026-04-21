import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { SettingsAdmin } from "./SettingsAdmin";

export default async function SettingsAdminPage() {
  const { supabase } = await requireAdmin();

  const [{ data: settings }, { data: media }] = await Promise.all([
    supabase
      .from("site_settings")
      .select("hero_media_id")
      .eq("id", "singleton")
      .maybeSingle(),
    supabase
      .from("media")
      .select("id, kind, storage_path, external_url, alt")
      .eq("kind", "image")
      .not("storage_path", "is", null)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <SettingsAdmin
      initialHeroId={settings?.hero_media_id ?? null}
      initialMedia={(media ?? []) as any}
    />
  );
}
