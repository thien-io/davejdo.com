import { describe, expect, test } from "vitest";
import { movieSchema, extractTmdbId } from "./movie";

describe("movieSchema", () => {
  test("accepts 1-5 rating", () => {
    expect(movieSchema.safeParse({ tmdb_id: 123, rating: 4 }).success).toBe(true);
  });
  test("rejects rating 0", () => {
    expect(movieSchema.safeParse({ tmdb_id: 123, rating: 0 }).success).toBe(false);
  });
  test("rejects rating 6", () => {
    expect(movieSchema.safeParse({ tmdb_id: 123, rating: 6 }).success).toBe(false);
  });
  test("review is optional and max 500", () => {
    expect(movieSchema.safeParse({ tmdb_id: 1, rating: 3 }).success).toBe(true);
    expect(movieSchema.safeParse({ tmdb_id: 1, rating: 3, review: "x".repeat(501) }).success).toBe(false);
  });
});

describe("extractTmdbId", () => {
  test("parses a plain integer string", () => {
    expect(extractTmdbId("12345")).toBe(12345);
  });
  test("parses a full TMDB movie URL", () => {
    expect(extractTmdbId("https://www.themoviedb.org/movie/12345-title")).toBe(12345);
  });
  test("parses a TMDB URL without slug", () => {
    expect(extractTmdbId("https://themoviedb.org/movie/999")).toBe(999);
  });
  test("returns null for garbage", () => {
    expect(extractTmdbId("not a thing")).toBeNull();
  });
});
