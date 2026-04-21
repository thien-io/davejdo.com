import { describe, expect, test } from "vitest";
import { projectSchema, slugify } from "./project";

describe("projectSchema", () => {
  test("accepts a minimal valid project", () => {
    const result = projectSchema.safeParse({
      title: "Hello",
      slug: "hello",
      published: true,
      position: 0,
    });
    expect(result.success).toBe(true);
  });

  test("rejects a title over 120 chars", () => {
    const result = projectSchema.safeParse({
      title: "x".repeat(121),
      slug: "x",
      published: true,
      position: 0,
    });
    expect(result.success).toBe(false);
  });

  test("rejects an invalid slug (uppercase)", () => {
    const result = projectSchema.safeParse({
      title: "Hello",
      slug: "Hello",
      published: true,
      position: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("slugify", () => {
  test("lowercases, trims, replaces spaces with dashes, strips punctuation", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
    expect(slugify("  My Project — 2024  ")).toBe("my-project-2024");
    expect(slugify("A/B: test")).toBe("a-b-test");
  });

  test("collapses consecutive dashes", () => {
    expect(slugify("foo---bar")).toBe("foo-bar");
  });
});
