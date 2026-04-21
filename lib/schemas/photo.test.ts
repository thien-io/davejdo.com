import { describe, expect, test } from "vitest";
import { photoSchema } from "./photo";

describe("photoSchema", () => {
  test("accepts minimum viable photo", () => {
    const r = photoSchema.safeParse({ media_id: "00000000-0000-0000-0000-000000000000" });
    expect(r.success).toBe(true);
  });

  test("rejects bad media_id", () => {
    const r = photoSchema.safeParse({ media_id: "not-a-uuid" });
    expect(r.success).toBe(false);
  });

  test("accepts caption up to 500 chars", () => {
    const r = photoSchema.safeParse({
      media_id: "00000000-0000-0000-0000-000000000000",
      caption: "x".repeat(500),
    });
    expect(r.success).toBe(true);
  });

  test("rejects caption over 500 chars", () => {
    const r = photoSchema.safeParse({
      media_id: "00000000-0000-0000-0000-000000000000",
      caption: "x".repeat(501),
    });
    expect(r.success).toBe(false);
  });
});
