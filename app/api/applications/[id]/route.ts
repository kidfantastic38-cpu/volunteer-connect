import { NextResponse } from "next/server"
import { isResponse, requireUser } from "@/lib/auth/guards"
import { findOrganizationByOwner } from "@/lib/org/db"
import { isEmployerWritableStatus, isAppStatus, normalizeAppStatus } from "@/lib/applications/status"
import {
  getApplicationById,
  organizationIdForApplication,
  updateApplicationStatus,
} from "@/lib/applications/store"

export const runtime = "nodejs"

async function authorize(userId: string, role: string, applicationId: string) {
  const application = await getApplicationById(applicationId)
  if (!application) return { error: NextResponse.json({ error: "Not found." }, { status: 404 }) }
  if (role === "admin") return { application }
  if (role === "student" && application.studentId === userId) return { application }
  if (role === "employer") {
    const org = await findOrganizationByOwner(userId)
    const ownerOrg = await organizationIdForApplication(applicationId)
    if (org && org.verificationStatus === "approved" && org.id === ownerOrg) return { application }
  }
  return { error: NextResponse.json({ error: "Not found." }, { status: 404 }) }
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  if (isResponse(user)) return user
  const { id } = await ctx.params
  const result = await authorize(user.id, user.role, id)
  if ("error" in result && result.error) return result.error
  return NextResponse.json({ application: result.application })
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  if (isResponse(user)) return user
  const { id } = await ctx.params
  const result = await authorize(user.id, user.role, id)
  if ("error" in result && result.error) return result.error

  let body: { status?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
  const nextStatus = body.status ?? ""
  if (!isAppStatus(nextStatus)) {
    return NextResponse.json({ error: "Choose a valid status." }, { status: 400 })
  }
  const normalized = normalizeAppStatus(nextStatus)
  if (user.role === "student" && normalized !== "withdrawn") {
    return NextResponse.json({ error: "Students can only withdraw an application." }, { status: 403 })
  }
  if (user.role === "employer" && !isEmployerWritableStatus(nextStatus)) {
    return NextResponse.json({ error: "Employers cannot set that application status." }, { status: 403 })
  }
  const application = await updateApplicationStatus(id, normalized)
  return NextResponse.json({ application })
}
