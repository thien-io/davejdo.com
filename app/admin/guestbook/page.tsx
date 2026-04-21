import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { GuestbookAdmin } from "./GuestbookAdmin";

export default async function GuestbookAdminPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("guestbook_entries")
    .select("id, name, message, ip_hash, created_at")
    .order("created_at", { ascending: false });
  return <GuestbookAdmin initialEntries={data ?? []} />;
}
