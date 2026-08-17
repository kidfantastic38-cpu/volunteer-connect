import { NextResponse } from "next/server"
import { recordAdminAudit } from "@/lib/admin/service"
import { isResponse, requireRole } from "@/lib/auth/guards"
import { listVerificationRequests, reviewVerification } from "@/lib/org/db"
import type { VerificationStatus } from "@/lib/org/types"
import { enforceRateLimit } from "@/lib/security/http"
import { rateLimitKey } from "@/lib/security/request"

export const runtime = "nodejs"

const STATUSES: VerificationStatus[] = ["pending", "approved", "rejected", "more_info"]

export async function GET() {
  const user = await requireRole("admin")
  if (isResponse(user)) return user
  return NextResponse.json({ requests: await listVerificationRequests() })
}

export async function POST(req: Request) {
  const user = await requireRole("admin")
  if (isResponse(user)) return user

  const limited = await enforceRateLimit(rateLimitKey(req, "admin-review", user.id), 40, 15 * 60 * 1000)
  if (limited) return limited

  let body: { organizationId?: string; status?: string; notes?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const organizationId = body.organizationId ?? ""
  const status = body.status as VerificationStatus
  if (!organizationId || !STATUSES.includes(status)) {
    return NextResponse.json({ error: "Choose a valid organization and status." }, { status: 400 })
  }

  const organization = await reviewVerification({
    organizationId,
    reviewerId: user.id,
    status,
    notes: body.notes,
  })
  if (!organization) return NextResponse.json({ error: "Organization not found." }, { status: 404 })
  await recordAdminAudit({
    actorId: user.id,
    action: `employer.${status}`,
    entityType: "organization",
    entityId: organizationId,
  })
  return NextResponse.json({ organization, requests: await listVerificationRequests() })
}
