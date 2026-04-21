import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "./server";

const ADMIN_EMAIL = "davejdo6@gmail.com";

/**
 * Call at the top of every admin page (not /admin/login).
 * Redirects to /admin/login if the user isn't Dave.
 *
 * Returns a loosely-typed SupabaseClient so the generics don't collide with
 * @supabase/ssr's 4-parameter form. Input is always validated by zod before
 * reaching here — runtime safety doesn't depend on DB-level type inference.
 */
export async function requireAdmin(): Promise<{
  user: User;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>;
}> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user?.email !== ADMIN_EMAIL) {
    redirect("/admin/login");
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { user: data.user!, supabase: supabase as unknown as SupabaseClient<any, any, any> };
}
