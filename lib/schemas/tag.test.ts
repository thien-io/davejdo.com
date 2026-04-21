import { describe, expect, test } from "vitest";
import { tagSchema } from "./tag";

describe("tagSchema", () => {
  test("accepts a short kebab slug", () => {
    expect(tagSchema.safeParse({ name: "Film", slug: "film" }).success).toBe(true);
  });
  test("rejects empty name", () => {
    expect(tagSchema.safeParse({ name: "", slug: "film" }).success).toBe(false);
  });
  test("rejects uppercase slug", () => {
    expect(tagSchema.safeParse({ name: "Film", slug: "Film" }).success).toBe(false);
  });
});
