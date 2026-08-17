import { NextResponse } from "next/server"
import { findUserById, getProfileSnapshot } from "@/lib/auth/db"
import { isResponse, requireRole } from "@/lib/auth/guards"
import { readSession } from "@/lib/auth/session"
import { scoreOpportunityMatch } from "@/lib/matching/score"
import { archiveOpportunity, canViewOpportunity, getOpportunity, isOppStatus, isOppType, updateOpportunity } from "@/lib/opportunities/store"
import { findOrganizationByOwner } from "@/lib/org/db"

export const runtime = "nodejs"

async function viewerContext(userId?: string, role?: string) {
  if (!userId || !role) return null
  const org = role === "employer" ? await findOrganizationByOwner(userId) : null
  return { role, organizationId: org?.id ?? null }
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await readSession()
  const user = session ? await findUserById(session.sub) : null
  const { id } = await ctx.params
  const opportunity = await getOpportunity(id)
  if (!opportunity) return NextResponse.json({ error: "Not found." }, { status: 404 })
  if (!canViewOpportunity(opportunity, await viewerContext(user?.id, user?.role))) {
    return NextResponse.json({ error: "Not found." }, { status: 404 })
  }
  const snapshot = user?.role === "student" ? await getProfileSnapshot(user.id) : null
  const matchScore =
    user?.role === "student" && snapshot
      ? scoreOpportunityMatch(
          {
            skills: (snapshot.skills as { name: string; level: number; verified?: boolean; category?: string }[]) ?? [],
            interests: snapshot.user.interests ?? [],
            location: snapshot.user.location ?? "",
            education: (snapshot.education as { field?: string; qualification?: string; institution?: string }[]) ?? [],
            experience: (snapshot.experiences as { role?: string; organization?: string; skills?: string[] }[]) ?? [],
          },
          opportunity,
        )
      : null
  return NextResponse.json({ opportunity: { ...opportunity, matchScore } })
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["employer", "admin"])
  if (isResponse(user)) return user
  const { id } = await ctx.params
  const current = await getOpportunity(id)
  if (!current) return NextResponse.json({ error: "Not found." }, { status: 404 })
  const org = await findOrganizationByOwner(user.id)
  if (user.role !== "admin" && org?.id !== current.organizationId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 })
  }
  if (user.role === "employer" && org?.verificationStatus !== "approved") {
    return NextResponse.json({ error: "Your organization verification is pending." }, { status: 403 })
  }
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
  const opportunity = await updateOpportunity(id, {
    title: typeof body.title === "string" ? body.title.trim().slice(0, 160) : undefined,
    description: typeof body.description === "string" ? body.description.trim().slice(0, 4000) : undefined,
    type: typeof body.type === "string" && isOppType(body.type) ? body.type : undefined,
    location: typeof body.location === "string" ? body.location.trim().slice(0, 120) : undefined,
    remote: typeof body.remote === "boolean" ? body.remote : undefined,
    skills: Array.isArray(body.skills) ? body.skills.map(String) : undefined,
    deadline: typeof body.deadline === "string" ? body.deadline : undefined,
    compensation: typeof body.compensation === "string" ? body.compensation : undefined,
    status:
      typeof body.status === "string" && (isOppStatus(body.status) || body.status === "open")
        ? body.status === "open"
          ? "published"
          : body.status
        : undefined,
  })
  return NextResponse.json({ opportunity })
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["employer", "admin"])
  if (isResponse(user)) return user
  const { id } = await ctx.params
  const current = await getOpportunity(id)
  if (!current) return NextResponse.json({ error: "Not found." }, { status: 404 })
  const org = await findOrganizationByOwner(user.id)
  if (user.role !== "admin" && org?.id !== current.organizationId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 })
  }
  const opportunity = await archiveOpportunity(id)
  return NextResponse.json({ opportunity })
}
