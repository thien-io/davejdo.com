import { describe, expect, test, vi } from "vitest";
import { listGuestbookEntries } from "./guestbook";

describe("listGuestbookEntries", () => {
  test("selects public columns only (no ip_hash)", async () => {
    const selectSpy = vi.fn(() => b);
    const b: any = {
      select: selectSpy,
      order: vi.fn(() => b),
      range: vi.fn(() => b),
      then: (r: any) => r({ data: [], error: null }),
    };
    const c = { from: vi.fn(() => b) } as any;
    await listGuestbookEntries(c);
    expect(selectSpy).toHaveBeenCalledWith("id, name, message, created_at");
  });
});
