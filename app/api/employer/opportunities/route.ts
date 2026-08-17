import { NextResponse } from "next/server"
import { isResponse, requireVerifiedEmployer } from "@/lib/auth/guards"
import { parseOpportunityBody } from "@/lib/opportunities/input"
import { createOpportunity, listOpportunities } from "@/lib/opportunities/store"
import { findOrganizationByOwner } from "@/lib/org/db"
import { enforceRateLimit } from "@/lib/security/http"
import { rateLimitKey } from "@/lib/security/request"

export const runtime = "nodejs"

export async function GET() {
  const user = await requireVerifiedEmployer()
  if (isResponse(user)) return user
  const organization = await findOrganizationByOwner(user.id)
  if (!organization) return NextResponse.json({ opportunities: [] })
  const items = await listOpportunities({
    organizationId: organization.id,
    includeArchived: true,
    includeDrafts: true,
  })
  return NextResponse.json({ opportunities: items })
}

export async function POST(req: Request) {
  const user = await requireVerifiedEmployer()
  if (isResponse(user)) return user

  const limited = await enforceRateLimit(rateLimitKey(req, "opportunity", user.id), 10, 60 * 60 * 1000)
  if (limited) return limited

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
  const parsed = parseOpportunityBody(body)
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const organization = await findOrganizationByOwner(user.id)
  if (!organization) return NextResponse.json({ error: "Organization not found." }, { status: 404 })

  const opportunity = await createOpportunity({
    organizationId: organization.id,
    ...parsed,
  })
  return NextResponse.json({ ok: true, opportunity, organizationName: organization.name })
}
