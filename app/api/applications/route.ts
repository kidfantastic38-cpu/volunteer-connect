import { NextResponse } from "next/server"
import { isResponse, requireRole, requireUser } from "@/lib/auth/guards"
import { findOrganizationByOwner } from "@/lib/org/db"
import { applyToOpportunity, listAllApplications, listOrganizationApplications, listStudentApplications, saveOpportunity } from "@/lib/applications/store"
import { enforceRateLimit } from "@/lib/security/http"
import { rateLimitKey } from "@/lib/security/request"

export const runtime = "nodejs"

export async function GET() {
  const user = await requireUser()
  if (isResponse(user)) return user
  if (user.role === "student") {
    return NextResponse.json({ applications: await listStudentApplications(user.id) })
  }
  if (user.role === "employer") {
    const org = await findOrganizationByOwner(user.id)
    if (!org || org.verificationStatus !== "approved") {
      return NextResponse.json({ applications: [] })
    }
    return NextResponse.json({ applications: await listOrganizationApplications(org.id) })
  }
  if (user.role === "admin") {
    return NextResponse.json({ applications: await listAllApplications() })
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}

export async function POST(req: Request) {
  const user = await requireRole("student")
  if (isResponse(user)) return user
  const limited = await enforceRateLimit(rateLimitKey(req, "apply", user.id), 20, 15 * 60 * 1000)
  if (limited) return limited

  let body: { opportunityId?: string; coverMessage?: string; save?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
  const opportunityId = (body.opportunityId ?? "").trim()
  if (!opportunityId) return NextResponse.json({ error: "opportunityId is required." }, { status: 400 })

  if (body.save) {
    const saved = await saveOpportunity(user.id, opportunityId)
    if ("error" in saved) return NextResponse.json({ error: saved.error }, { status: saved.status })
    return NextResponse.json({ ok: true, status: "saved" })
  }

  const result = await applyToOpportunity({
    studentId: user.id,
    opportunityId,
    coverMessage: body.coverMessage,
  })
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status })
  return NextResponse.json({ application: result.application })
}
