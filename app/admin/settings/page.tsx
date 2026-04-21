import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { SettingsAdmin } from "./SettingsAdmin";
import { PageDescriptionsEditor } from "./PageDescriptionsEditor";

export default async function SettingsAdminPage() {
  const { supabase } = await requireAdmin();

  const [{ data: settings }, { data: media }, { data: pages }] = await Promise.all([
    supabase
      .from("site_settings")
      .select("hero_media_id, profile_media_id")
      .eq("id", "singleton")
      .maybeSingle(),
    supabase
      .from("media")
      .select("id, kind, storage_path, external_url, alt")
      .eq("kind", "image")
      .not("storage_path", "is", null)
      .order("created_at", { ascending: false }),
    supabase.from("page_content").select("slug, description"),
  ]);

  return (
    <div className="max-w-5xl space-y-16">
      <SettingsAdmin
        initialHeroId={settings?.hero_media_id ?? null}
        initialProfileId={settings?.profile_media_id ?? null}
        initialMedia={(media ?? []) as any}
      />
      <PageDescriptionsEditor initial={(pages ?? []) as any} />
    </div>
  );
}
