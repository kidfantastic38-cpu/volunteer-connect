import { NextResponse } from "next/server"
import { isResponse, requireRole } from "@/lib/auth/guards"
import { isValidEmail, normalizeEmail } from "@/lib/auth/normalize"
import { findOrganizationByOwner, isOrganizationType, updateOrganization } from "@/lib/org/db"
import type { OrganizationInput } from "@/lib/org/types"
import { enforceRateLimit } from "@/lib/security/http"
import { rateLimitKey } from "@/lib/security/request"
import { safeHttpUrl } from "@/lib/security/urls"
import { isValidPhone } from "@/lib/security/validate"

export const runtime = "nodejs"

export async function GET() {
  const user = await requireRole("employer")
  if (isResponse(user)) return user
  const organization = await findOrganizationByOwner(user.id)
  if (!organization) return NextResponse.json({ error: "Organization not found." }, { status: 404 })
  return NextResponse.json({ organization })
}

export async function PUT(req: Request) {
  const user = await requireRole("employer")
  if (isResponse(user)) return user

  const limited = await enforceRateLimit(rateLimitKey(req, "org", user.id), 20, 15 * 60 * 1000)
  if (limited) return limited

  let body: Partial<OrganizationInput>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  if (body.name !== undefined && !body.name.trim()) {
    return NextResponse.json({ error: "Organization name is required." }, { status: 400 })
  }
  if (body.organizationType && !isOrganizationType(body.organizationType)) {
    return NextResponse.json({ error: "Choose a valid organization type." }, { status: 400 })
  }
  if (body.organizationEmail !== undefined) {
    const email = normalizeEmail(body.organizationEmail)
    if (!isValidEmail(email)) return NextResponse.json({ error: "Enter a valid organization email." }, { status: 400 })
    body.organizationEmail = email
  }
  if (body.phone !== undefined && !isValidPhone(body.phone.trim())) {
    return NextResponse.json({ error: "Enter a valid contact phone." }, { status: 400 })
  }
  if (body.address !== undefined && !body.address.trim()) {
    return NextResponse.json({ error: "Address is required." }, { status: 400 })
  }
  if (body.website !== undefined) body.website = safeHttpUrl(body.website)
  if (body.logoUrl !== undefined) body.logoUrl = safeHttpUrl(body.logoUrl)

  const organization = await updateOrganization(user.id, {
    name: body.name?.trim().slice(0, 120),
    organizationType: body.organizationType,
    organizationEmail: body.organizationEmail,
    phone: body.phone?.trim(),
    website: body.website,
    registrationNumber: body.registrationNumber?.trim().slice(0, 80),
    address: body.address?.trim().slice(0, 240),
    logoUrl: body.logoUrl,
  })
  if (!organization) return NextResponse.json({ error: "Organization not found." }, { status: 404 })
  return NextResponse.json({ organization })
}
