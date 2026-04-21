import { describe, expect, test, vi } from "vitest";
import { listMovies } from "./movies";

function mockClient(data: unknown, error: unknown = null) {
  const b: any = {
    select: vi.fn(() => b),
    order: vi.fn(() => b),
    then: (r: any) => r({ data, error }),
  };
  return { from: vi.fn(() => b) } as any;
}

describe("listMovies", () => {
  test("default is recent", async () => {
    const c = mockClient([]);
    await listMovies(c);
    expect(c.from).toHaveBeenCalledWith("movies");
  });
  test("errors return []", async () => {
    const c = mockClient(null, new Error("x"));
    expect(await listMovies(c)).toEqual([]);
  });
});
