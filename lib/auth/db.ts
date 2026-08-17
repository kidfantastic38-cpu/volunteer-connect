import { randomUUID } from "node:crypto"
import { eq, sql } from "drizzle-orm"
import { amaraDemoSnapshot, defaultProfileSnapshot } from "@/lib/auth/defaults"
import { hashPassword } from "@/lib/auth/password"
import { normalizeEmail } from "@/lib/auth/normalize"
import type { AuthRole, AuthUser, ProfileSnapshot } from "@/lib/auth/types"
import { getDb } from "@/lib/db/client"
import { users } from "@/lib/db/schema"
import { assembleProfileSnapshot, persistProfileSnapshot } from "@/lib/profile/persist"
import { createOrganization, findOrganizationByOwner } from "@/lib/org/db"
import type { Organization, OrganizationInput } from "@/lib/org/types"

function toUser(row: typeof users.$inferSelect): AuthUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as AuthRole,
    emailVerified: Boolean(row.emailVerified),
    status: row.status || "active",
  }
}

export function getAuthDb() {
  return getDb()
}

export function getDatabasePath() {
  return process.env.DATABASE_URL ? "postgres" : "unset"
}

export async function findUserByEmail(email: string): Promise<(AuthUser & { passwordHash: string }) | null> {
  const [row] = await getDb().select().from(users).where(eq(users.email, normalizeEmail(email))).limit(1)
  if (!row) return null
  return { ...toUser(row), passwordHash: row.passwordHash }
}

export async function findUserById(id: string): Promise<AuthUser | null> {
  const [row] = await getDb().select().from(users).where(eq(users.id, id)).limit(1)
  return row ? toUser(row) : null
}

export async function createUser(input: {
  name: string
  email: string
  password: string
  role: AuthRole
  organization?: OrganizationInput
}): Promise<{ user: AuthUser; snapshot: ProfileSnapshot; organization: Organization | null }> {
  const id = randomUUID()
  const stamp = new Date().toISOString()
  const email = normalizeEmail(input.email)
  const name = input.name.trim()
  await getDb().insert(users).values({
    id,
    email,
    passwordHash: hashPassword(input.password),
    name,
    role: input.role,
    emailVerified: false,
    sessionVersion: 1,
    status: "active",
    createdAt: stamp,
    updatedAt: stamp,
  })
  const user = { id, email, name, role: input.role, emailVerified: false }
  const snapshot = defaultProfileSnapshot(user)
  await persistProfileSnapshot(id, snapshot)
  const organization =
    input.role === "employer" && input.organization ? await createOrganization(id, input.organization) : null
  return { user, snapshot, organization }
}

export async function setEmailVerified(id: string, verified = true) {
  await getDb()
    .update(users)
    .set({ emailVerified: verified, updatedAt: new Date().toISOString() })
    .where(eq(users.id, id))
}

export async function updateUserPassword(id: string, password: string) {
  await getDb()
    .update(users)
    .set({ passwordHash: hashPassword(password), updatedAt: new Date().toISOString() })
    .where(eq(users.id, id))
}

export async function getSessionVersion(id: string): Promise<number | null> {
  const [row] = await getDb().select({ sessionVersion: users.sessionVersion }).from(users).where(eq(users.id, id)).limit(1)
  return row ? row.sessionVersion : null
}

export async function incrementSessionVersion(id: string): Promise<number> {
  await getDb()
    .update(users)
    .set({ sessionVersion: sql`${users.sessionVersion} + 1`, updatedAt: new Date().toISOString() })
    .where(eq(users.id, id))
  return (await getSessionVersion(id)) ?? 1
}

export async function updateUserName(id: string, name: string) {
  await getDb().update(users).set({ name: name.trim(), updatedAt: new Date().toISOString() }).where(eq(users.id, id))
}

export async function getProfileSnapshot(userId: string): Promise<ProfileSnapshot | null> {
  const user = await findUserById(userId)
  if (!user) return null
  return assembleProfileSnapshot(user)
}

export async function saveProfileSnapshot(userId: string, snapshot: ProfileSnapshot) {
  await persistProfileSnapshot(userId, snapshot)
}

export async function seedDemoUsers() {
  const stamp = new Date().toISOString()
  const seeds: [string, string, string, AuthRole][] = [
    ["user-amara", "amara@example.com", "Amara Okafor", "student"],
    ["user-admin", "admin@volunteerconnect.org", "Platform Admin", "admin"],
    ["user-earthwise", "hello@earthwise.org", "EarthWise Foundation", "employer"],
  ]
  for (const [id, email, name, role] of seeds) {
    const existing = await findUserByEmail(email)
    if (!existing) {
      await getDb().insert(users).values({
        id,
        email,
        passwordHash: hashPassword("password"),
        name,
        role,
        emailVerified: true,
        sessionVersion: 1,
        createdAt: stamp,
        updatedAt: stamp,
      })
    }
    const user = (await findUserById(existing?.id ?? id)) ?? {
      id,
      email,
      name,
      role,
      emailVerified: true,
    }
    const current = await assembleProfileSnapshot(user)
    const empty = !current || ((current.experiences?.length ?? 0) === 0 && (current.education?.length ?? 0) === 0)
    if (!current || (email === "amara@example.com" && empty)) {
      await persistProfileSnapshot(user.id, email === "amara@example.com" ? amaraDemoSnapshot() : defaultProfileSnapshot(user))
    }
    await setEmailVerified(user.id, true)
  }
  const owner = await findUserByEmail("hello@earthwise.org")
  if (owner && !(await findOrganizationByOwner(owner.id))) {
    await createOrganization(owner.id, {
      name: "EarthWise Foundation",
      organizationType: "NGO",
      organizationEmail: "hello@earthwise.org",
      phone: "+44 161 000 0000",
      website: "https://earthwise.example",
      registrationNumber: "REG-EW-1042",
      address: "Manchester, UK",
    })
  }
}
