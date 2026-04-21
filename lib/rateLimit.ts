/**
 * In-memory rate limiter keyed by IP hash.
 * Good enough for a personal-site guestbook. Per-process state; Vercel cold
 * starts reset it — acceptable for this scale.
 */

const store = new Map<string, number>();

export function resetRateLimitStore() {
  store.clear();
}

export async function hashIp(ip: string, secret: string): Promise<string> {
  const data = new TextEncoder().encode(`${ip}:${secret}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

export function checkRateLimit(key: string, windowMs: number): RateLimitResult {
  const now = Date.now();
  const last = store.get(key);
  if (!last || now - last >= windowMs) {
    store.set(key, now);
    return { ok: true };
  }
  const retryAfterSeconds = Math.ceil((windowMs - (now - last)) / 1000);
  return { ok: false, retryAfterSeconds };
}
