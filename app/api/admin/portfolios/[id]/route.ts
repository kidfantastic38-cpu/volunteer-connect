import { NextResponse } from "next/server"
import { unpublishPortfolio } from "@/lib/admin/service"
import { isResponse, requireRole } from "@/lib/auth/guards"
import { enforceRateLimit } from "@/lib/security/http"
import { rateLimitKey } from "@/lib/security/request"

export const runtime = "nodejs"

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireRole("admin")
  if (isResponse(admin)) return admin
  const limited = await enforceRateLimit(rateLimitKey(req, "admin-portfolios", admin.id), 40, 15 * 60 * 1000)
  if (limited) return limited
  const { id } = await ctx.params
  let body: { published?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
  if (body.published !== false) {
    return NextResponse.json({ error: "Only unpublish is supported." }, { status: 400 })
  }
  const portfolio = await unpublishPortfolio(admin.id, id)
  if (!portfolio) return NextResponse.json({ error: "Portfolio not found." }, { status: 404 })
  return NextResponse.json({ portfolio })
}
