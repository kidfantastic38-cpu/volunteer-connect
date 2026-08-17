const ALLOWED = new Set(["https:", "http:"])

export function safeHttpUrl(value: string | undefined | null, _options?: { allowEmpty?: boolean }): string {
  const raw = (value ?? "").trim()
  if (!raw) return ""
  if (raw.length > 500) return ""
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    return ""
  }
  if (!ALLOWED.has(parsed.protocol)) return ""
  if (parsed.protocol === "http:" && parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
    return ""
  }
  if (parsed.username || parsed.password) return ""
  return parsed.toString()
}

export function optionalSafeHttpUrl(value: string | undefined | null): string | undefined {
  const next = safeHttpUrl(value)
  return next || undefined
}
