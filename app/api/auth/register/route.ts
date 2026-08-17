import { NextResponse } from "next/server"
import { createUser, findUserByEmail } from "@/lib/auth/db"
import { isValidEmail, normalizeEmail } from "@/lib/auth/normalize"
import { issueEmailCode } from "@/lib/auth/otp"
import { buildAuthPayload } from "@/lib/auth/payload"
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@/lib/auth/password"
import { setSessionCookie } from "@/lib/auth/session"
import type { AuthRole } from "@/lib/auth/types"
import { isOrganizationType } from "@/lib/org/db"
import type { OrganizationInput } from "@/lib/org/types"
import { ensureBootstrapped } from "@/lib/db/bootstrap"
import { enforceRateLimit, safeInternalError } from "@/lib/security/http"
import { rateLimitKey } from "@/lib/security/request"
import { safeHttpUrl } from "@/lib/security/urls"
import { isValidPhone } from "@/lib/security/validate"

export const runtime = "nodejs"

export async function POST(req: Request) {
  let body: {
    name?: string
    email?: string
    password?: string
    role?: string
    organization?: Partial<OrganizationInput>
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  try {
    await ensureBootstrapped()
  } catch (err) {
    return safeInternalError(
      "The database is unavailable. For local development the app now uses an embedded database — restart `pnpm dev` and try again. On Vercel, set DATABASE_URL.",
      err,
    )
  }
  const name = (body.name ?? "").trim().slice(0, 80)
  const email = normalizeEmail(body.email ?? "")
  const password = body.password ?? ""
  const role: AuthRole = body.role === "employer" ? "employer" : "student"
  try {
    const limitedEmail = await enforceRateLimit(rateLimitKey(req, "register", email || "unknown"), 5, 15 * 60 * 1000)
    if (limitedEmail) return limitedEmail
    const limitedIp = await enforceRateLimit(rateLimitKey(req, "register-ip"), 20, 15 * 60 * 1000)
    if (limitedIp) return limitedIp
  } catch (err) {
    return safeInternalError("Could not create your account.", err)
  }

  if (!name) return NextResponse.json({ error: "Please enter your name." }, { status: 400 })
  if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 })
  if (!isValidEmail(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 })
  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json({ error: "Use at least 6 characters." }, { status: 400 })
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return NextResponse.json({ error: "Password is too long." }, { status: 400 })
  }
  if (await findUserByEmail(email)) {
    return NextResponse.json({ error: "This email is already registered. Try logging in instead." }, { status: 409 })
  }

  let organization: OrganizationInput | undefined
  if (role === "employer") {
    const org = body.organization ?? {}
    const orgName = (org.name ?? "").trim().slice(0, 120)
    const orgEmail = normalizeEmail(org.organizationEmail ?? "")
    const phone = (org.phone ?? "").trim()
    const address = (org.address ?? "").trim().slice(0, 240)
    const organizationType = org.organizationType ?? ""
    if (!orgName) return NextResponse.json({ error: "Organization name is required." }, { status: 400 })
    if (!isOrganizationType(organizationType)) {
      return NextResponse.json({ error: "Choose a valid organization type." }, { status: 400 })
    }
    if (!isValidEmail(orgEmail)) return NextResponse.json({ error: "Enter a valid organization email." }, { status: 400 })
    if (!isValidPhone(phone)) return NextResponse.json({ error: "Enter a valid contact phone." }, { status: 400 })
    if (!address) return NextResponse.json({ error: "Address is required." }, { status: 400 })
    organization = {
      name: orgName,
      organizationType,
      organizationEmail: orgEmail,
      phone,
      website: safeHttpUrl(org.website),
      registrationNumber: (org.registrationNumber ?? "").trim().slice(0, 80),
      address,
      logoUrl: safeHttpUrl(org.logoUrl),
    }
  }

  try {
    const created = await createUser({ name, email, password, role, organization })
    await setSessionCookie(created.user)
    try {
      await issueEmailCode(created.user.id)
    } catch {
      console.error("[auth] verification email was not sent")
    }
    return NextResponse.json(await buildAuthPayload(created.user, created.snapshot))
  } catch (err) {
    return safeInternalError("Could not create your account.", err)
  }
}
