import { NextResponse } from "next/server"
import { isResponse, requireVerifiedEmployer } from "@/lib/auth/guards"
import { parseOpportunityBody } from "@/lib/opportunities/input"
import { archiveOpportunity, getOpportunity, updateOpportunity } from "@/lib/opportunities/store"
import { findOrganizationByOwner } from "@/lib/org/db"

export const runtime = "nodejs"

async function ownedOpportunity(userId: string, id: string) {
  const organization = await findOrganizationByOwner(userId)
  const opportunity = await getOpportunity(id)
  if (!organization || !opportunity || opportunity.organizationId !== organization.id) {
    return { error: NextResponse.json({ error: "Not found." }, { status: 404 }) }
  }
  return { opportunity, organization }
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireVerifiedEmployer()
  if (isResponse(user)) return user
  const { id } = await ctx.params
  const result = await ownedOpportunity(user.id, id)
  if ("error" in result) return result.error
  return NextResponse.json({ opportunity: result.opportunity })
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireVerifiedEmployer()
  if (isResponse(user)) return user
  const { id } = await ctx.params
  const result = await ownedOpportunity(user.id, id)
  if ("error" in result) return result.error

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
  const parsed = parseOpportunityBody({ ...result.opportunity, ...body, skills: body.skills ?? result.opportunity.skills })
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const opportunity = await updateOpportunity(id, parsed)
  return NextResponse.json({ opportunity })
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireVerifiedEmployer()
  if (isResponse(user)) return user
  const { id } = await ctx.params
  const result = await ownedOpportunity(user.id, id)
  if ("error" in result) return result.error
  const opportunity = await archiveOpportunity(id)
  return NextResponse.json({ opportunity })
}
