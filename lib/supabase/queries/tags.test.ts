import { describe, expect, test, vi } from "vitest";
import { listTags } from "./tags";

describe("listTags", () => {
  test("calls from('tags') ordered by name", async () => {
    const b: any = {
      select: vi.fn(() => b),
      order: vi.fn(() => b),
      then: (r: any) => r({ data: [], error: null }),
    };
    const c = { from: vi.fn(() => b) } as any;
    const r = await listTags(c);
    expect(c.from).toHaveBeenCalledWith("tags");
    expect(r).toEqual([]);
  });
});
