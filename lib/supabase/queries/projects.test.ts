import { describe, expect, test, vi } from "vitest";
import { listPublishedProjects, getProjectBySlug } from "./projects";

function mockClient(data: unknown, error: unknown = null) {
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => ({ data, error })),
    then: (resolve: any) => resolve({ data, error }),
  };
  return {
    from: vi.fn(() => builder),
  } as any;
}

describe("listPublishedProjects", () => {
  test("queries projects table and filters to published=true, ordered by position", async () => {
    const fake = [{ id: "a", slug: "a", title: "A" }];
    const client = mockClient(fake);
    const result = await listPublishedProjects(client);
    expect(client.from).toHaveBeenCalledWith("projects");
    expect(result).toEqual(fake);
  });

  test("returns [] when the query errors", async () => {
    const client = mockClient(null, new Error("boom"));
    const result = await listPublishedProjects(client);
    expect(result).toEqual([]);
  });
});

describe("getProjectBySlug", () => {
  test("returns the matched project", async () => {
    const fake = { id: "a", slug: "alpha", title: "Alpha" };
    const client = mockClient(fake);
    const result = await getProjectBySlug(client, "alpha");
    expect(client.from).toHaveBeenCalledWith("projects");
    expect(result).toEqual(fake);
  });

  test("returns null when no row is found", async () => {
    const client = mockClient(null);
    const result = await getProjectBySlug(client, "missing");
    expect(result).toBeNull();
  });
});
