import { findOrganizationByOwner } from "@/lib/org/db"
import type { AuthUser, ProfileSnapshot } from "@/lib/auth/types"
import type { Organization } from "@/lib/org/types"

export type AuthPayload = {
  user: AuthUser
  snapshot: ProfileSnapshot | null
  emailVerified: boolean
  organization: Organization | null
  emailSent?: boolean
  notice?: string
}

export async function buildAuthPayload(user: AuthUser, snapshot: ProfileSnapshot | null): Promise<AuthPayload> {
  return {
    user,
    snapshot,
    emailVerified: user.emailVerified,
    organization: user.role === "employer" ? await findOrganizationByOwner(user.id) : null,
  }
}
