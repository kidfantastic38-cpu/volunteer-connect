import { NextResponse } from "next/server"
import { getAdminEmployer, setOrganizationSuspended } from "@/lib/admin/service"
import { isResponse, requireRole } from "@/lib/auth/guards"
import { enforceRateLimit } from "@/lib/security/http"
import { rateLimitKey } from "@/lib/security/request"

export const runtime = "nodejs"

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireRole("admin")
  if (isResponse(admin)) return admin
  const { id } = await ctx.params
  const employer = await getAdminEmployer(id)
  if (!employer) return NextResponse.json({ error: "Organization not found." }, { status: 404 })
  const { history, ...row } = employer
  return NextResponse.json({ employer: row, history })
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireRole("admin")
  if (isResponse(admin)) return admin
  const limited = await enforceRateLimit(rateLimitKey(req, "admin-orgs", admin.id), 40, 15 * 60 * 1000)
  if (limited) return limited
  const { id } = await ctx.params
  let body: { suspended?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
  if (typeof body.suspended !== "boolean") {
    return NextResponse.json({ error: "suspended must be a boolean." }, { status: 400 })
  }
  const organization = await setOrganizationSuspended(admin.id, id, body.suspended)
  if (!organization) return NextResponse.json({ error: "Organization not found." }, { status: 404 })
  return NextResponse.json({ organization: { id: organization.id, suspended: organization.suspended } })
}
