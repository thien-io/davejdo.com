import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { hashIp, checkRateLimit, resetRateLimitStore } from "./rateLimit";

describe("hashIp", () => {
  test("same IP + same secret → same hash", async () => {
    const a = await hashIp("1.2.3.4", "secret");
    const b = await hashIp("1.2.3.4", "secret");
    expect(a).toBe(b);
  });

  test("different secrets → different hashes", async () => {
    const a = await hashIp("1.2.3.4", "s1");
    const b = await hashIp("1.2.3.4", "s2");
    expect(a).not.toBe(b);
  });

  test("hash length is 64 hex chars (sha-256)", async () => {
    const a = await hashIp("10.0.0.1", "x");
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimitStore();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test("first submission is allowed", () => {
    const r = checkRateLimit("hash-1", 60_000);
    expect(r.ok).toBe(true);
  });

  test("second submission within window is denied with retryAfter", () => {
    checkRateLimit("hash-1", 60_000);
    const r = checkRateLimit("hash-1", 60_000);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.retryAfterSeconds).toBeGreaterThan(0);
      expect(r.retryAfterSeconds).toBeLessThanOrEqual(60);
    }
  });

  test("after the window elapses, submission is allowed again", () => {
    checkRateLimit("hash-1", 60_000);
    vi.advanceTimersByTime(61_000);
    const r = checkRateLimit("hash-1", 60_000);
    expect(r.ok).toBe(true);
  });

  test("different hashes are independent", () => {
    checkRateLimit("hash-1", 60_000);
    const r = checkRateLimit("hash-2", 60_000);
    expect(r.ok).toBe(true);
  });
});
