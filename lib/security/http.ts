import { NextResponse } from "next/server"
import { consumeRateLimit, rateLimitHeaders } from "@/lib/security/rate-limit"

export function tooMany(retryAfterSec: number) {
  return NextResponse.json(
    { error: "Too many attempts. Try again shortly." },
    { status: 429, headers: rateLimitHeaders(retryAfterSec) },
  )
}

export async function enforceRateLimit(key: string, limit: number, windowMs: number) {
  const result = await consumeRateLimit(key, limit, windowMs)
  if (!result.ok) return tooMany(result.retryAfterSec)
  return null
}

export function safeInternalError(fallback: string, err: unknown) {
  console.error("[api]", err instanceof Error ? err.message : "request failed")
  return NextResponse.json({ error: fallback }, { status: 500 })
}
