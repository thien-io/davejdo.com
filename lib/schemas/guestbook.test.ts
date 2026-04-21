import { describe, expect, test } from "vitest";
import { guestbookSchema } from "./guestbook";

describe("guestbookSchema", () => {
  test("accepts normal entry", () => {
    expect(guestbookSchema.safeParse({ name: "A", message: "Hi" }).success).toBe(true);
  });
  test("rejects empty message", () => {
    expect(guestbookSchema.safeParse({ name: "A", message: "" }).success).toBe(false);
  });
  test("rejects honeypot filled", () => {
    expect(guestbookSchema.safeParse({ name: "A", message: "Hi", website: "spam" }).success).toBe(false);
  });
  test("rejects over-length message", () => {
    expect(guestbookSchema.safeParse({ name: "A", message: "x".repeat(281) }).success).toBe(false);
  });
});
