import { redirect } from "next/navigation";
import { createClient } from "./server";

const ADMIN_EMAIL = "davejdo6@gmail.com";

/**
 * Call at the top of every admin page (not /admin/login).
 * Redirects to /admin/login if the user isn't Dave.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user?.email !== ADMIN_EMAIL) {
    redirect("/admin/login");
  }
  return { user: data.user, supabase };
}
