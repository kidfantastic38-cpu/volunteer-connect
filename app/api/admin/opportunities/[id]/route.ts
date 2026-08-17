import { NextResponse } from "next/server"
import { moderateOpportunity } from "@/lib/admin/service"
import { isResponse, requireRole } from "@/lib/auth/guards"
import { enforceRateLimit } from "@/lib/security/http"
import { rateLimitKey } from "@/lib/security/request"

export const runtime = "nodejs"

const STATUSES = ["published", "closed", "archived"] as const

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireRole("admin")
  if (isResponse(admin)) return admin
  const limited = await enforceRateLimit(rateLimitKey(req, "admin-opps", admin.id), 40, 15 * 60 * 1000)
  if (limited) return limited
  const { id } = await ctx.params
  let body: { status?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
  if (!STATUSES.includes(body.status as (typeof STATUSES)[number])) {
    return NextResponse.json({ error: "Choose published, closed, or archived." }, { status: 400 })
  }
  const opportunity = await moderateOpportunity(admin.id, id, body.status as (typeof STATUSES)[number])
  if (!opportunity) return NextResponse.json({ error: "Opportunity not found." }, { status: 404 })
  return NextResponse.json({
    opportunity: { id: opportunity.id, status: opportunity.status, organizationId: opportunity.organizationId },
  })
}
