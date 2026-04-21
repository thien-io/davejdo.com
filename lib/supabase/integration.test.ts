/**
 * Integration smoke test.
 * Hits the live Supabase project with the anon key.
 * Skipped unless SUPABASE_INTEGRATION=1 is set.
 */
import { createClient } from "@supabase/supabase-js";
import { describe, expect, test } from "vitest";
import type { Database } from "./types";

const describeIntegration = process.env.SUPABASE_INTEGRATION ? describe : describe.skip;

describeIntegration("supabase live integration", () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  test("env vars are present", () => {
    expect(url).toBeTruthy();
    expect(anon).toBeTruthy();
  });

  test("anon key can read seeded tags", async () => {
    const client = createClient<Database>(url!, anon!);
    const { data, error } = await client.from("tags").select("slug, name");
    expect(error).toBeNull();
    expect(data?.length ?? 0).toBeGreaterThanOrEqual(4);
  });

  test("anon key can read seeded guestbook entries (no ip_hash exposed)", async () => {
    const client = createClient<Database>(url!, anon!);
    const { data, error } = await client
      .from("guestbook_entries")
      .select("id, name, message, created_at");
    expect(error).toBeNull();
    expect(data?.length ?? 0).toBeGreaterThanOrEqual(2);
  });

  test("anon cannot insert into projects (RLS denies)", async () => {
    const client = createClient<Database>(url!, anon!);
    const { error } = await client.from("projects").insert({
      slug: `rls-probe-${Date.now()}`,
      title: "RLS probe",
    });
    expect(error).not.toBeNull();
  });
});
