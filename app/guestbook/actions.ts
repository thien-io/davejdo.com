"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { guestbookSchema } from "@/lib/schemas/guestbook";
import { hashIp, checkRateLimit } from "@/lib/rateLimit";
import type { Database } from "@/lib/supabase/types";

const RATE_WINDOW_MS = 60_000;

export type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitGuestbookAction(
  formData: FormData
): Promise<SubmitResult> {
  const payload = {
    name: formData.get("name"),
    message: formData.get("message"),
    website: formData.get("website") ?? "",
  };

  const parsed = guestbookSchema.safeParse(payload);
  if (!parsed.success) {
    if (payload.website) return { ok: true }; // silent honeypot success
    const first = parsed.error.errors[0]?.message ?? "Invalid entry";
    return { ok: false, error: first };
  }

  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "0.0.0.0";
  const secret = process.env.REVALIDATE_TOKEN ?? "dev-secret";
  const key = await hashIp(ip, secret);

  const rate = checkRateLimit(key, RATE_WINDOW_MS);
  if (!rate.ok) {
    return {
      ok: false,
      error: `Slow down, try again in ${rate.retryAfterSeconds}s.`,
    };
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("guestbook_entries").insert({
    name: parsed.data.name.trim(),
    message: parsed.data.message.trim(),
    ip_hash: key,
  });

  if (error) return { ok: false, error: "Couldn't save. Try again?" };

  revalidatePath("/guestbook");
  return { ok: true };
}
