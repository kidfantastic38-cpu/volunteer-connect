export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first.slice(0, 128)
  }
  const real = req.headers.get("x-real-ip")?.trim()
  if (real) return real.slice(0, 128)
  return "local"
}

export function rateLimitKey(req: Request, bucket: string, extra = ""): string {
  return [bucket, clientIp(req), extra].filter(Boolean).join(":")
}
