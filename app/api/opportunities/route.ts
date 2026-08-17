import { NextResponse } from "next/server"
import { findUserById, getProfileSnapshot } from "@/lib/auth/db"
import { isResponse, requireRole, requireVerifiedEmployer } from "@/lib/auth/guards"
import { readSession } from "@/lib/auth/session"
import { ensureBootstrapped } from "@/lib/db/bootstrap"
import { scoreOpportunityMatch } from "@/lib/matching/score"
import { parseOpportunityBody } from "@/lib/opportunities/input"
import { createOpportunity, listOpportunities } from "@/lib/opportunities/store"
import { findOrganizationByOwner } from "@/lib/org/db"
import { enforceRateLimit } from "@/lib/security/http"
import { rateLimitKey } from "@/lib/security/request"

export const runtime = "nodejs"

export async function GET(req: Request) {
  await ensureBootstrapped()
  const session = await readSession()
  const user = session ? await findUserById(session.sub) : null
  const url = new URL(req.url)
  const query = url.searchParams.get("q") ?? ""
  const type = url.searchParams.get("type") ?? ""
  const location = url.searchParams.get("location") ?? ""
  const skill = url.searchParams.get("skill") ?? ""
  const remote = url.searchParams.get("remote") === "1" || url.searchParams.get("remote") === "true"
  const mine = url.searchParams.get("mine") === "1"
  const org = user?.role === "employer" ? await findOrganizationByOwner(user.id) : null
  const ownerView = user?.role === "admin" || Boolean(mine && org)

  const items = await listOpportunities({
    query,
    type,
    location,
    skill,
    remote: remote || undefined,
    organizationId: mine && org ? org.id : undefined,
    includeArchived: ownerView,
    includeDrafts: ownerView,
    publishedOnly: !ownerView,
  })

  const snapshot = user?.role === "student" ? await getProfileSnapshot(user.id) : null
  const student = snapshot
    ? {
        skills: (snapshot.skills as { name: string; level: number; verified?: boolean; category?: string }[]) ?? [],
        interests: snapshot.user.interests ?? [],
        location: snapshot.user.location ?? "",
        education: (snapshot.education as { field?: string; qualification?: string; institution?: string }[]) ?? [],
        experience: (snapshot.experiences as { role?: string; organization?: string; skills?: string[] }[]) ?? [],
      }
    : null

  return NextResponse.json({
    opportunities: items.map((item) => ({
      ...item,
      matchScore: student ? scoreOpportunityMatch(student, item) : null,
    })),
  })
}

export async function POST(req: Request) {
  const admin = await requireRole(["employer", "admin"])
  if (isResponse(admin)) return admin
  if (admin.role === "employer") {
    const verified = await requireVerifiedEmployer()
    if (isResponse(verified)) return verified
  }

  const limited = await enforceRateLimit(rateLimitKey(req, "opportunity", admin.id), 10, 60 * 60 * 1000)
  if (limited) return limited

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
  const parsed = parseOpportunityBody(body)
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const ownOrg = await findOrganizationByOwner(admin.id)
  const organizationId = admin.role === "admin" && typeof body.organizationId === "string" ? body.organizationId : ownOrg?.id
  if (!organizationId) {
    return NextResponse.json({ error: "No organization is linked to this account." }, { status: 403 })
  }
  if (admin.role !== "admin" && ownOrg?.id !== organizationId) {
    return NextResponse.json({ error: "You can only post for your own organization." }, { status: 403 })
  }

  const opportunity = await createOpportunity({ organizationId, ...parsed })
  return NextResponse.json({ opportunity })
}
