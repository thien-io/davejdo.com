import { describe, expect, test, vi } from "vitest";
import { listPhotos, listPhotosByTag } from "./photos";

function mockClient(data: unknown, error: unknown = null) {
  const b: any = {
    select: vi.fn(() => b),
    eq: vi.fn(() => b),
    order: vi.fn(() => b),
    in: vi.fn(() => b),
    range: vi.fn(() => b),
    then: (r: any) => r({ data, error }),
  };
  return { from: vi.fn(() => b) } as any;
}

describe("listPhotos", () => {
  test("returns array, empty on error", async () => {
    const c = mockClient([{ id: "a", media: null, tags: [] }]);
    const r = await listPhotos(c);
    expect(r.length).toBe(1);
  });

  test("errors return []", async () => {
    const c = mockClient(null, new Error("x"));
    expect(await listPhotos(c)).toEqual([]);
  });
});

describe("listPhotosByTag", () => {
  test("queries photos and filters by tag slug", async () => {
    const c = mockClient([]);
    await listPhotosByTag(c, "film");
    expect(c.from).toHaveBeenCalledWith("photos");
  });
});
