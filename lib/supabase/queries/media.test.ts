import { describe, expect, test, vi } from "vitest";
import { listMedia } from "./media";

describe("listMedia", () => {
  test("filters to non-null storage_path (finalized rows)", async () => {
    const notSpy = vi.fn(() => b);
    const b: any = {
      select: vi.fn(() => b),
      not: notSpy,
      order: vi.fn(() => b),
      limit: vi.fn(() => b),
      then: (r: any) => r({ data: [], error: null }),
    };
    const c = { from: vi.fn(() => b) } as any;
    await listMedia(c);
    expect(notSpy).toHaveBeenCalledWith("storage_path", "is", null);
  });
});
