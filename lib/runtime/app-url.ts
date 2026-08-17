/** Public origin for emails and absolute links. Server-only. */

export function publicAppUrl(): string {
  const configured = process.env.APP_URL?.trim()
  if (configured) return configured.replace(/\/$/, "")
  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/$/, "")}`
  return "http://localhost:3000"
}
