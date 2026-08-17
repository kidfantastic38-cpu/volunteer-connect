import { NextResponse } from "next/server"
import { isResponse, requireVerifiedEmployer } from "@/lib/auth/guards"
import { findOrganizationByOwner } from "@/lib/org/db"
import { listEmployerCandidates } from "@/lib/applications/candidates"

export const runtime = "nodejs"

export async function GET() {
  const user = await requireVerifiedEmployer()
  if (isResponse(user)) return user
  const organization = await findOrganizationByOwner(user.id)
  if (!organization) return NextResponse.json({ candidates: [] })
  return NextResponse.json({ candidates: await listEmployerCandidates(organization.id) })
}
