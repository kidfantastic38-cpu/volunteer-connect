export function clip(value: unknown, max: number): string {
  return String(value ?? "").trim().slice(0, max)
}

export function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback
}

export function asInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.round(n)))
}

export function asStringArray(value: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, maxLen))
    .filter(Boolean)
    .slice(0, maxItems)
}

export function safeId(value: unknown): string {
  const raw = String(value ?? "").trim()
  if (/^[A-Za-z0-9_-]{1,64}$/.test(raw)) return raw
  return ""
}

export function isValidPhone(value: string): boolean {
  const compact = value.replace(/[()\s.-]/g, "")
  return /^\+?[0-9]{7,16}$/.test(compact)
}

export function yearMonth(value: unknown): string {
  const raw = String(value ?? "").trim()
  if (/^\d{4}(-\d{2})?$/.test(raw)) return raw
  return ""
}
