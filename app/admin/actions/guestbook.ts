"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/requireAdmin";

export async function deleteGuestbookEntryAction(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("guestbook_entries")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/guestbook");
  return { ok: true as const };
}

export async function bulkDeleteGuestbookAction(ids: string[]) {
  if (ids.length === 0) return { ok: true as const };
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("guestbook_entries")
    .delete()
    .in("id", ids);
  if (error) return { error: error.message };
  revalidatePath("/guestbook");
  return { ok: true as const };
}
