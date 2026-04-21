import "@testing-library/jest-dom/vitest";
import { beforeAll, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

beforeAll(() => {
  // Stable env for unit tests. Integration tests override via process.env.
  process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://localhost:54321";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
});

afterEach(() => {
  cleanup();
});
