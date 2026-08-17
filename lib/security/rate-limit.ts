import { eq, sql } from "drizzle-orm"
import { getDb } from "@/lib/db/client"
import { rateLimits } from "@/lib/db/schema"

/**
 * Postgres-backed limiter. Shared across Vercel/serverless instances
 * that use the same DATABASE_URL.
 */
export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  const now = Math.floor(Date.now() / 1000)
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000))
  const db = getDb()
  const [row] = await db.select().from(rateLimits).where(eq(rateLimits.key, key)).limit(1)

  if (!row || now - row.windowStart >= windowSec) {
    await db
      .insert(rateLimits)
      .values({ key, windowStart: now, count: 1 })
      .onConflictDoUpdate({ target: rateLimits.key, set: { windowStart: now, count: 1 } })
    return { ok: true }
  }

  if (row.count >= limit) {
    return { ok: false, retryAfterSec: Math.max(1, row.windowStart + windowSec - now) }
  }

  await db.update(rateLimits).set({ count: sql`${rateLimits.count} + 1` }).where(eq(rateLimits.key, key))
  return { ok: true }
}

export function rateLimitHeaders(retryAfterSec: number): HeadersInit {
  return { "Retry-After": String(retryAfterSec) }
}
