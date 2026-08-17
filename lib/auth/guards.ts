import { NextResponse } from "next/server"
import { findUserById } from "@/lib/auth/db"
import { readSession } from "@/lib/auth/session"
import type { AuthRole, AuthUser } from "@/lib/auth/types"
import { findOrganizationByOwner } from "@/lib/org/db"

export async function requireUser(): Promise<AuthUser | NextResponse> {
  const session = await readSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const user = await findUserById(session.sub)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return user
}

export async function requireRole(role: AuthRole | AuthRole[]): Promise<AuthUser | NextResponse> {
  const user = await requireUser()
  if (user instanceof NextResponse) return user
  const allowed = Array.isArray(role) ? role : [role]
  if (!allowed.includes(user.role)) {
    return NextResponse.json({ error: "This action is not available for your account type." }, { status: 403 })
  }
  return user
}

export async function requireVerifiedEmployer(): Promise<AuthUser | NextResponse> {
  const user = await requireRole("employer")
  if (user instanceof NextResponse) return user
  const org = await findOrganizationByOwner(user.id)
  if (!org || org.verificationStatus !== "approved") {
    return NextResponse.json(
      {
        error:
          "Your organization verification is pending. You can complete your profile, but posting opportunities will be unlocked after approval.",
      },
      { status: 403 },
    )
  }
  return user
}

export function isResponse(value: AuthUser | NextResponse): value is NextResponse {
  return value instanceof NextResponse
}
