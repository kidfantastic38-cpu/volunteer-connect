import { NextResponse } from "next/server"
import { findUserById } from "@/lib/auth/db"
import { getPublicPortfolioBySlug } from "@/lib/auth/public-portfolio"
import { readSession } from "@/lib/auth/session"
import { enforceRateLimit } from "@/lib/security/http"
import { rateLimitKey } from "@/lib/security/request"

export const runtime = "nodejs"

export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const limited = await enforceRateLimit(rateLimitKey(req, "public-portfolio"), 60, 15 * 60 * 1000)
  if (limited) return limited

  const { slug } = await ctx.params
  const clean = String(slug ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 80)
  if (!clean) return NextResponse.json({ error: "Not found." }, { status: 404 })

  const session = await readSession()
  const viewer = session ? await findUserById(session.sub) : null
  const portfolio = await getPublicPortfolioBySlug(clean, viewer)
  if (!portfolio) return NextResponse.json({ error: "Not found." }, { status: 404 })
  return NextResponse.json({ portfolio })
}
