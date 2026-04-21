import { describe, expect, test } from "vitest";
import { blurhashToDataURL } from "./blurhash";

describe("blurhashToDataURL", () => {
  test("produces a data URL for a canonical blurhash", () => {
    const url = blurhashToDataURL("LKO2?U%2Tw=w]~RBVZRi};RPxuwH", 32, 32);
    expect(url.startsWith("data:image/")).toBe(true);
  });

  test("returns a transparent data URL for invalid input", () => {
    const url = blurhashToDataURL("not a blurhash", 32, 32);
    expect(url.startsWith("data:image/")).toBe(true);
  });
});
