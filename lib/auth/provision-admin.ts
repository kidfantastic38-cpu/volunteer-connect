import { randomUUID } from "node:crypto"
import { eq } from "drizzle-orm"
import { findUserByEmail, findUserById, incrementSessionVersion, updateUserPassword } from "@/lib/auth/db"
import { defaultProfileSnapshot } from "@/lib/auth/defaults"
import { isValidEmail, normalizeEmail } from "@/lib/auth/normalize"
import { issueEmailCode } from "@/lib/auth/otp"
import { hashPassword, MAX_PASSWORD_LENGTH } from "@/lib/auth/password"
import { assembleProfileSnapshot, persistProfileSnapshot } from "@/lib/profile/persist"
import { getDb, isEmbeddedPostgres } from "@/lib/db/client"
import { users } from "@/lib/db/schema"

export const ADMIN_PROVISION_MIN_PASSWORD = 12

export type AdminProvisionResult = {
  action: "created" | "updated"
  email: string
  role: "admin"
  status: "active"
  emailVerified: boolean
  emailSent: boolean
  driver: string
}

export function describeDatabaseTarget() {
  if (isEmbeddedPostgres()) return { driver: "pglite", hosted: false as const }
  const driver = process.env.DATABASE_DRIVER?.trim() || (process.env.DATABASE_URL?.includes("neon.tech") ? "neon" : "postgres")
  return { driver, hosted: true as const }
}

export async function provisionAdminAccount(input: {
  email: string
  password: string
  name?: string
}): Promise<AdminProvisionResult> {
  const target = describeDatabaseTarget()
  if (!target.hosted || target.driver === "pglite") {
    throw new Error("Refusing to provision an admin in PGlite. Set DATABASE_DRIVER=neon and DATABASE_URL for the production database.")
  }
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL is required.")
  }

  const email = normalizeEmail(input.email)
  if (!isValidEmail(email)) throw new Error("Enter a valid email address.")
  const password = input.password
  if (password.length < ADMIN_PROVISION_MIN_PASSWORD) {
    throw new Error(`Admin password must be at least ${ADMIN_PROVISION_MIN_PASSWORD} characters.`)
  }
  if (password.length > MAX_PASSWORD_LENGTH) throw new Error("Password is too long.")
  const name = (input.name ?? "Platform Administrator").trim().slice(0, 80) || "Platform Administrator"
  const stamp = new Date().toISOString()

  const existing = await findUserByEmail(email)
  if (existing && existing.role !== "admin") {
    throw new Error("That email already belongs to a non-admin account. Use a different email.")
  }

  let userId: string
  let action: "created" | "updated"
  if (!existing) {
    userId = randomUUID()
    await getDb().insert(users).values({
      id: userId,
      email,
      passwordHash: hashPassword(password),
      name,
      role: "admin",
      emailVerified: false,
      sessionVersion: 1,
      status: "active",
      createdAt: stamp,
      updatedAt: stamp,
    })
    const created = await findUserById(userId)
    if (!created) throw new Error("Admin insert failed.")
    await persistProfileSnapshot(created.id, defaultProfileSnapshot(created))
    action = "created"
  } else {
    userId = existing.id
    await updateUserPassword(existing.id, password)
    await getDb()
      .update(users)
      .set({ role: "admin", status: "active", name: existing.name || name, updatedAt: stamp })
      .where(eq(users.id, existing.id))
    await incrementSessionVersion(existing.id)
    const user = await findUserById(existing.id)
    if (user) {
      const current = await assembleProfileSnapshot(user)
      if (!current) await persistProfileSnapshot(user.id, defaultProfileSnapshot({ ...user, role: "admin", status: "active" }))
    }
    action = "updated"
  }

  const fresh = await findUserById(userId)
  if (!fresh || fresh.role !== "admin" || fresh.status !== "active") {
    throw new Error("Admin account is not active with role=admin.")
  }

  let emailSent = false
  try {
    await issueEmailCode(fresh.id, { forceEmail: true })
    emailSent = true
  } catch {
    emailSent = false
  }

  return {
    action,
    email: fresh.email,
    role: "admin",
    status: "active",
    emailVerified: Boolean(fresh.emailVerified),
    emailSent,
    driver: target.driver,
  }
}
